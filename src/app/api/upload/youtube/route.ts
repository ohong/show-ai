import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth, currentUser } from '@clerk/nextjs/server'
import { getSupabaseUser, syncClerkUserToSupabase } from '@/lib/clerk-supabase'
import { createServerClient } from '@/lib/supabase'
import { enqueueVideoForProcessing } from '@/lib/sqs'

const YouTubeUrlSchema = z.object({
  url: z.string().url('Invalid YouTube URL'),
  description: z.string().optional(),
  isMonetized: z.boolean().optional(),
  pricePerAccess: z.number().nonnegative().optional(),
})

// YouTube URL patterns
const YOUTUBE_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/

function extractYouTubeVideoId(url: string): string | null {
  const match = url.match(YOUTUBE_REGEX)
  return match ? match[1] : null
}

function validateYouTubeUrl(url: string): boolean {
  return YOUTUBE_REGEX.test(url)
}

async function getYouTubeVideoInfo(videoId: string) {
  // For now, we'll return basic info. In a real implementation, you might want to use
  // the YouTube Data API or a service like yt-dlp to get video metadata
  return {
    videoId,
    title: `YouTube Video ${videoId}`,
    duration: null,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await req.json()
    const { url, description, isMonetized, pricePerAccess } = YouTubeUrlSchema.parse(json)

    // Validate YouTube URL
    if (!validateYouTubeUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL format' },
        { status: 400 }
      )
    }

    // Extract video ID
    const videoId = extractYouTubeVideoId(url)
    if (!videoId) {
      return NextResponse.json(
        { error: 'Could not extract video ID from URL' },
        { status: 400 }
      )
    }

    // Get YouTube video information
    const videoInfo = await getYouTubeVideoInfo(videoId)

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

    // Check if this YouTube video already exists
    const { data: existing, error: fetchError } = await supabase
      .from('videos')
      .select('*')
      .eq('youtube_video_id', videoId)
      .single()

    if (existing && !fetchError) {
      if (existing.user_id !== user.id) {
        return NextResponse.json({ error: 'Video already recorded by another user' }, { status: 409 })
      }
      try {
        await enqueueVideoForProcessing(existing)
      } catch {}
      return NextResponse.json({ success: true, video: existing })
    }

    // Insert new YouTube video record
    const insertPayload = {
      user_id: user.id,
      source_type: 'youtube',
      source_url: url,
      youtube_video_id: videoId,
      youtube_title: videoInfo.title,
      youtube_duration: videoInfo.duration,
      youtube_thumbnail_url: videoInfo.thumbnailUrl,
      status: 'uploaded' as const,
      description: description || null,
      is_monetized: isMonetized || false,
      price_per_access: pricePerAccess || 0.00,
      metadata: {
        source: 'youtube',
        video_id: videoId,
        processed_at: new Date().toISOString(),
      },
    }

    const { data: videoData, error } = await supabase
      .from('videos')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
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
