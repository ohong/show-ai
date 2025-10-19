#!/usr/bin/env python3
"""Test script for video handler."""

import json
from video_handler import VideoHandler

# Create video handler
handler = VideoHandler()

# Test message 1: S3 Video
s3_message = { 
    "event": "video.created",
    "video": {
        "id": "e5605936-4eb3-4f0a-8eb3-643b4917bef7",
        "user_id": "b99e5c92-4fd0-488e-9a00-0ef8cb0086d0",
        "file_key": "videos/1760884269882-wx81a2gvgf-aaaa.mp4",
        "file_name": "aaaa.mp4",
        "file_type": "video/mp4",
        "file_size": 1446734,
        "bucket": "watchlearn1",
        "status": "uploaded",
        "metadata": None,
        "created_at": "2025-10-19T14:31:11.609199+00:00",
        "updated_at": "2025-10-19T14:31:11.609199+00:00",
        "source_type": "s3",
        "source_url": None,
        "youtube_video_id": None,
        "youtube_title": None,
        "youtube_duration": None,
        "youtube_thumbnail_url": None,
        "is_processed": False
    }
}

# Test message 2: YouTube Video
youtube_message = {
    "event": "video.created",
    "video": {
        "id": "a42f401e-5bfc-4875-923e-adfe2fd154a2",
        "user_id": "b99e5c92-4fd0-488e-9a00-0ef8cb0086d0",
        "file_key": None,
        "file_name": None,
        "file_type": None,
        "file_size": None,
        "bucket": None,
        "status": "uploaded",
        "metadata": '{"source": "youtube", "video_id": "2U6bJEFC97c", "processed_at": "2025-10-19T14:07:03.252Z"}',
        "created_at": "2025-10-19 14:07:03.344834+00",
        "updated_at": "2025-10-19 14:07:03.344834+00",
        "source_type": "youtube",
        "source_url": "https://www.youtube.com/watch?v=2U6bJEFC97c",
        "youtube_video_id": "2U6bJEFC97c",
        "youtube_title": "YouTube Video 2U6bJEFC97c",
        "youtube_duration": None,
        "youtube_thumbnail_url": "https://img.youtube.com/vi/2U6bJEFC97c/maxresdefault.jpg",
        "is_processed": False
    }
}

print("\n" + "=" * 60)
print("🧪 Testing Video Handler")
print("=" * 60)

print("\n1️⃣  Testing S3 Video Processing (dry-run - won't download)")
print("-" * 60)
# Note: This will fail at download stage since we don't have AWS credentials
# But it tests the message parsing and S3 path handling
try:
    result = handler.process_video(s3_message)
    print(f"Result: {result}")
except Exception as e:
    print(f"Expected error (no AWS credentials): {e}")

print("\n2️⃣  Testing YouTube Video Processing")
print("-" * 60)
result = handler.process_video(youtube_message)
print(f"Result: {result}")

print("\n" + "=" * 60)
print("✅ Test Complete")
print("=" * 60)
