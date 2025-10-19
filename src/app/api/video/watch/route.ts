import { NextRequest, NextResponse } from 'next/server';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '@/lib/s3';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseUser } from '@/lib/clerk-supabase';

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json();
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Get current user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getSupabaseUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get video details from Supabase
    const supabase = createServerClient();
    const { data: video, error } = await supabase
      .from('videos')
      .select('id, source_type, source_url, file_name, file_key, user_id')
      .eq('id', videoId)
      .eq('user_id', user.id)
      .single();

    if (error || !video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Handle different video types
    if (video.source_type === 'youtube' || video.source_type === 'url') {
      // For YouTube/URL videos, return the source URL directly
      return NextResponse.json({
        success: true,
        data: {
          videoUrl: video.source_url,
          videoType: video.source_type,
          title: video.file_name || 'Video'
        }
      });
    }

    if (video.source_type === 's3') {
      // For S3 videos, generate presigned URL
      const s3Client = createS3Client();
      
      if (!video.file_key) {
        return NextResponse.json(
          { error: 'S3 file key not found' },
          { status: 404 }
        );
      }
      
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: video.file_key,
      });

      // Generate presigned URL (valid for 1 hour)
      const presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600, // 1 hour
      });

      return NextResponse.json({
        success: true,
        data: {
          videoUrl: presignedUrl,
          videoType: 's3',
          title: video.file_name || 'Video'
        }
      });
    }

    return NextResponse.json(
      { error: 'Unsupported video type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error generating video watch URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
