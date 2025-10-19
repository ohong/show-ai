import json
import os
import shutil
from pathlib import Path
from typing import Dict, Any, Optional
import boto3
from config import AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, DOWNLOAD_DIR
from gemini_handler import GeminiHandler
from supabase_client import SupabaseClient


class VideoHandler:
    """Handles downloading and processing of videos from S3 and YouTube sources."""

    def __init__(self):
        """Initialize the video handler with S3 client and Gemini handler."""
        # Create S3 client
        self.s3_client = boto3.client(
            "s3",
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        )
        
        # Initialize Gemini handler
        self.gemini_handler = GeminiHandler()
        
        # Initialize Supabase client
        self.supabase = SupabaseClient()
        
        # Ensure download directory exists
        Path(DOWNLOAD_DIR).mkdir(parents=True, exist_ok=True)

    def process_video(self, message: Dict[str, Any]) -> bool:
        """
        Process a video message from SQS.
        
        Args:
            message: The video message from SQS containing video metadata
            
        Returns:
            bool: True if processing was successful, False otherwise
        """
        try:
            # Extract video data
            video_data = message.get("video", {})
            source_type = video_data.get("source_type", "").lower()
            video_id = video_data.get("id")
            
            print("\n" + "=" * 60)
            print(f"🎬 Processing Video: {video_id}")
            print(f"   Source Type: {source_type}")
            
            # Update status to processing
            self.supabase.update_processing_status(video_id, "processing")
            
            if source_type == "s3":
                return self._handle_s3_video(video_data)
            elif source_type == "youtube":
                return self._handle_youtube_video(video_data)
            else:
                print(f"❌ Unknown source type: {source_type}")
                self.supabase.mark_as_failed(video_id, f"Unknown source type: {source_type}")
                return False
                
        except Exception as e:
            video_id = message.get("video", {}).get("id")
            print(f"❌ Error processing video: {e}")
            if video_id:
                self.supabase.mark_as_failed(video_id, str(e))
            return False

    def _handle_s3_video(self, video_data: Dict[str, Any]) -> bool:
        """
        Handle S3 video - download it, analyze with Gemini, and clean up.
        
        Args:
            video_data: Video metadata containing S3 information
            
        Returns:
            bool: True if download and analysis were successful
        """
        try:
            file_key = video_data.get("file_key")
            file_name = video_data.get("file_name")
            file_type = video_data.get("file_type", "video/mp4")
            bucket = video_data.get("bucket", AWS_S3_BUCKET)
            video_id = video_data.get("id")
            
            if not file_key:
                print("❌ No file_key provided for S3 video")
                self.supabase.mark_as_failed(video_id, "No file_key provided")
                return False
            
            # Prepare download path
            download_path = Path(DOWNLOAD_DIR) / video_id / file_name
            download_path.parent.mkdir(parents=True, exist_ok=True)
            
            print(f"\n📥 Downloading S3 Video")
            print(f"   Bucket: {bucket}")
            print(f"   File Key: {file_key}")
            print(f"   File Name: {file_name}")
            print(f"   Download Path: {download_path}")
            
            # Update status to downloading
            self.supabase.update_processing_status(video_id, "downloading")
            
            # Download from S3
            self.s3_client.download_file(
                Bucket=bucket,
                Key=file_key,
                Filename=str(download_path)
            )
            
            # Verify file exists and check size
            if not download_path.exists():
                print("❌ Downloaded file not found")
                self.supabase.mark_as_failed(video_id, "Downloaded file not found")
                return False
            
            file_size = download_path.stat().st_size
            print(f"✅ S3 Video Downloaded Successfully")
            print(f"   File Size: {file_size:,} bytes")
            
            # Analyze with Gemini
            print(f"\n📊 Sending to Gemini for analysis...")
            self.supabase.update_processing_status(video_id, "uploading")
            
            analysis_result = self.gemini_handler.analyze_s3_video(
                local_file_path=str(download_path),
                video_id=video_id,
                file_type=file_type
            )
            
            # Print analysis results
            self._print_analysis(analysis_result)
            
            # Save results to Supabase
            if analysis_result.get("success"):
                self.supabase.save_analysis_result(
                    video_id=video_id,
                    analysis=analysis_result.get("analysis", ""),
                    mark_processed=True
                )
            else:
                self.supabase.mark_as_failed(
                    video_id=video_id,
                    error_message=analysis_result.get("error", "Unknown error during analysis")
                )
            
            # Clean up local file
            self._cleanup_local_file(download_path)
            
            return analysis_result.get("success", False)
                
        except Exception as e:
            print(f"❌ Error downloading S3 video: {e}")
            return False

    def _handle_youtube_video(self, video_data: Dict[str, Any]) -> bool:
        """
        Handle YouTube video - analyze with Gemini directly.
        
        Args:
            video_data: Video metadata containing YouTube information
            
        Returns:
            bool: True if analysis was successful
        """
        try:
            youtube_video_id = video_data.get("youtube_video_id")
            source_url = video_data.get("source_url")
            title = video_data.get("youtube_title")
            duration = video_data.get("youtube_duration")
            thumbnail_url = video_data.get("youtube_thumbnail_url")
            video_id = video_data.get("id")
            
            print(f"\n🎥 YouTube Video Detected")
            print(f"   Video ID: {video_id}")
            print(f"   YouTube ID: {youtube_video_id}")
            print(f"   Title: {title}")
            print(f"   Duration: {duration}")
            print(f"   URL: {source_url}")
            print(f"   Thumbnail: {thumbnail_url}")
            
            if not source_url:
                print("❌ No source_url provided for YouTube video")
                self.supabase.mark_as_failed(video_id, "No source_url provided")
                return False
            
            # Analyze with Gemini
            print(f"\n📊 Sending to Gemini for analysis...")
            self.supabase.update_processing_status(video_id, "processing")
            
            analysis_result = self.gemini_handler.analyze_youtube_video(
                youtube_url=source_url,
                video_id=video_id
            )
            
            # Print analysis results
            self._print_analysis(analysis_result)
            
            # Save results to Supabase
            if analysis_result.get("success"):
                self.supabase.save_analysis_result(
                    video_id=video_id,
                    analysis=analysis_result.get("analysis", ""),
                    mark_processed=True
                )
            else:
                self.supabase.mark_as_failed(
                    video_id=video_id,
                    error_message=analysis_result.get("error", "Unknown error during analysis")
                )
            
            return analysis_result.get("success", False)
            
        except Exception as e:
            print(f"❌ Error processing YouTube video: {e}")
            return False

    def _print_analysis(self, result: Dict[str, Any]) -> None:
        """
        Print analysis results nicely formatted.
        
        Args:
            result: Analysis result dictionary from Gemini
        """
        print("\n" + "=" * 60)
        if result.get("success"):
            print(f"✅ Analysis Results for Video: {result.get('video_id')}")
            print(f"   Source Type: {result.get('source_type')}")
            print("=" * 60)
            print(f"\n{result.get('analysis')}")
        else:
            print(f"❌ Analysis Failed for Video: {result.get('video_id')}")
            print(f"   Error: {result.get('error')}")
        print("\n" + "=" * 60)

    def _cleanup_local_file(self, file_path: Path) -> None:
        """
        Delete locally stored video file and parent directory if empty.
        
        Args:
            file_path: Path to the file to delete
        """
        try:
            if file_path.exists():
                file_path.unlink()
                print(f"\n🗑️  Local file deleted: {file_path.name}")
            
            # Try to remove parent directory if empty
            parent_dir = file_path.parent
            if parent_dir.exists() and not any(parent_dir.iterdir()):
                parent_dir.rmdir()
                print(f"🗑️  Empty directory cleaned up")
                
        except Exception as e:
            print(f"⚠️  Could not clean up local file: {e}")
