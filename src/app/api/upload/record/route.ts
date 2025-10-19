import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth, currentUser } from '@clerk/nextjs/server'
import { getSupabaseUser, syncClerkUserToSupabase } from '@/lib/clerk-supabase'
import { createServerClient } from '@/lib/supabase'
import { HeadObjectCommand } from '@aws-sdk/client-s3'
import { createS3Client, validateAWSConfig } from '@/lib/s3'
import { enqueueVideoForProcessing } from '@/lib/sqs'

// Schema for S3 file uploads
const S3FileSchema = z.object({
  sourceType: z.literal('s3'),
  fileKey: z.string().min(1, 'fileKey is required'),
  fileName: z.string().min(1, 'fileName is required'),
  fileType: z.string().min(1, 'fileType is required'),
  fileSize: z.number().nonnegative('fileSize must be >= 0'),
  bucket: z.string().optional(),
  description: z.string().optional(),
  isMonetized: z.boolean().optional(),
  pricePerAccess: z.number().nonnegative().optional(),
})

// Schema for YouTube URLs
const YouTubeSchema = z.object({
  sourceType: z.literal('youtube'),
  sourceUrl: z.string().url('Invalid YouTube URL'),
  youtubeVideoId: z.string().min(1, 'YouTube video ID is required'),
  youtubeTitle: z.string().optional(),
  youtubeDuration: z.number().optional(),
  youtubeThumbnailUrl: z.string().url().optional(),
  description: z.string().optional(),
  isMonetized: z.boolean().optional(),
  pricePerAccess: z.number().nonnegative().optional(),
})

// Schema for generic URLs
const UrlSchema = z.object({
  sourceType: z.literal('url'),
  sourceUrl: z.string().url('Invalid URL'),
  description: z.string().optional(),
  isMonetized: z.boolean().optional(),
  pricePerAccess: z.number().nonnegative().optional(),
})

// Union schema for all video sources
const BodySchema = z.discriminatedUnion('sourceType', [
  S3FileSchema,
  YouTubeSchema,
  UrlSchema,
])

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await req.json()
    const data = BodySchema.parse(json)

    // Handle S3 file validation
    if (data.sourceType === 's3') {
      // Verify object exists in S3 and matches expected metadata
      validateAWSConfig()
      const s3 = createS3Client()
      const bucketName = data.bucket || process.env.AWS_S3_BUCKET_NAME!

      try {
        const head = await s3.send(new HeadObjectCommand({ Bucket: bucketName, Key: data.fileKey }))
        if (typeof head.ContentLength === 'number' && head.ContentLength !== data.fileSize) {
          return NextResponse.json(
            { error: 'Uploaded object size mismatch' },
            { status: 400 }
          )
        }

        if (head.ContentType && head.ContentType !== data.fileType) {
          // Not fatal, but enforce expected type for safety
          return NextResponse.json(
            { error: 'Uploaded object content-type mismatch' },
            { status: 400 }
          )
        }
      } catch {
        return NextResponse.json(
          { error: 'Uploaded object not found in S3' },
          { status: 400 }
        )
      }
    }

    // Ensure Supabase user exists for this Clerk user
    let user = await getSupabaseUser()
    if (!user) {
      const clerk = await currentUser()
      if (!clerk) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      user = await syncClerkUserToSupabase(clerk)
      if (!user) {
        return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 })
      }
    }

    const supabase = createServerClient()

    // Build insert payload based on source type
    let insertPayload: any = {
      user_id: user.id,
      source_type: data.sourceType,
      status: 'uploaded' as const,
      metadata: null,
      description: data.description || null,
      is_monetized: data.isMonetized || false,
      price_per_access: data.pricePerAccess || 0.00,
    }

    if (data.sourceType === 's3') {
      insertPayload = {
        ...insertPayload,
        file_key: data.fileKey,
        file_name: data.fileName,
        file_type: data.fileType,
        file_size: data.fileSize,
        bucket: data.bucket || process.env.AWS_S3_BUCKET_NAME!,
      }
    } else if (data.sourceType === 'youtube') {
      insertPayload = {
        ...insertPayload,
        source_url: data.sourceUrl,
        youtube_video_id: data.youtubeVideoId,
        youtube_title: data.youtubeTitle,
        youtube_duration: data.youtubeDuration,
        youtube_thumbnail_url: data.youtubeThumbnailUrl,
      }
    } else if (data.sourceType === 'url') {
      insertPayload = {
        ...insertPayload,
        source_url: data.sourceUrl,
      }
    }

    const { data: videoData, error } = await supabase
      .from('videos')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      // Unique violation: return existing row (only if owned by same user)
      const isUniqueViolation = error?.code === '23505'
      if (!isUniqueViolation) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }

      // Build query based on source type to find existing record
      let query = supabase.from('videos').select('*')
      
      if (data.sourceType === 's3') {
        query = query.eq('file_key', data.fileKey)
      } else if (data.sourceType === 'youtube') {
        query = query.eq('youtube_video_id', data.youtubeVideoId)
      } else if (data.sourceType === 'url') {
        query = query.eq('source_url', data.sourceUrl)
      }

      const { data: existing, error: fetchErr } = await query.single()

      if (fetchErr || !existing) {
        return NextResponse.json({ error: 'Failed to fetch existing video' }, { status: 500 })
      }

      if (existing.user_id !== user.id) {
        return NextResponse.json({ error: 'Video already recorded by another user' }, { status: 409 })
      }

      try {
        await enqueueVideoForProcessing(existing)
      } catch {}
      return NextResponse.json({ success: true, video: existing })
    }

    try {
      await enqueueVideoForProcessing(videoData)
    } catch {}
    return NextResponse.json({ success: true, video: videoData }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}


