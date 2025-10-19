import time
from pathlib import Path
from typing import Dict, Any, Optional
from google import genai
from config import GEMINI_API_KEY
from prompts import VIDEO_ANALYSIS_PROMPT


class GeminiHandler:
    """Handles video analysis using Google Gemini API."""

    def __init__(self):
        """Initialize Gemini handler."""
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.model = "gemini-2.0-flash"

    def analyze_s3_video(self, local_file_path: str, video_id: str, file_type: str = "video/mp4") -> Dict[str, Any]:
        """
        Analyze an S3 video that has been downloaded locally.

        Args:
            local_file_path: Path to the downloaded video file
            video_id: ID of the video for tracking
            file_type: MIME type of the video file (default: video/mp4)

        Returns:
            Dictionary containing analysis results
        """
        try:
            file_path = Path(local_file_path)

            if not file_path.exists():
                print(f"❌ Video file not found: {local_file_path}")
                return {"success": False, "error": "File not found"}

            print(f"\n📤 Uploading video to Gemini API")
            print(f"   File: {file_path.name}")
            print(f"   Size: {file_path.stat().st_size:,} bytes")

            # Upload file to Gemini API
            with open(local_file_path, "rb") as f:
                upload_response = self.client.files.upload(
                    file=f,
                    config={"mime_type": file_type}
                )

            file_uri = upload_response.uri
            print(f"   ✅ Upload successful")
            print(f"   File URI: {file_uri}")

            # Wait for file to be processed
            print(f"\n⏳ Processing video with Gemini...")
            processed_file = self._wait_for_file_processing(file_uri)

            if not processed_file:
                print(f"❌ Video processing timed out")
                return {"success": False, "error": "Processing timeout"}

            # Generate content with the video
            print(f"\n🤖 Generating analysis...")
            response = self.client.models.generate_content(
                model=self.model,
                contents=[
                    processed_file,
                    VIDEO_ANALYSIS_PROMPT,
                ],
            )

            result = {
                "success": True,
                "video_id": video_id,
                "source_type": "s3",
                "analysis": response.text,
            }

            print(f"\n✅ Analysis complete")
            print(f"   Analysis length: {len(response.text)} characters")

            # Delete the uploaded file from Gemini
            self._cleanup_gemini_file(file_uri)

            return result

        except Exception as e:
            print(f"❌ Error analyzing S3 video: {e}")
            return {"success": False, "error": str(e), "video_id": video_id}

    def analyze_youtube_video(self, youtube_url: str, video_id: str) -> Dict[str, Any]:
        """
        Analyze a YouTube video directly using Gemini API.

        Args:
            youtube_url: URL of the YouTube video
            video_id: ID of the video for tracking

        Returns:
            Dictionary containing analysis results
        """
        try:
            print(f"\n🤖 Sending YouTube video to Gemini...")
            print(f"   URL: {youtube_url}")

            # Use file_uri with YouTube URL
            from google.genai import types

            response = self.client.models.generate_content(
                model=self.model,
                contents=types.Content(
                    parts=[
                        types.Part(
                            file_data=types.FileData(file_uri=youtube_url)
                        ),
                        types.Part(
                            text=VIDEO_ANALYSIS_PROMPT
                        ),
                    ]
                ),
            )

            result = {
                "success": True,
                "video_id": video_id,
                "source_type": "youtube",
                "analysis": response.text,
            }

            print(f"\n✅ Analysis complete")
            print(f"   Analysis length: {len(response.text)} characters")

            return result

        except Exception as e:
            print(f"❌ Error analyzing YouTube video: {e}")
            return {"success": False, "error": str(e), "video_id": video_id}

    def _wait_for_file_processing(self, file_uri: str, max_wait_seconds: int = 300) -> Optional[Any]:
        """
        Wait for uploaded file to be processed by Gemini API.

        Args:
            file_uri: URI of the uploaded file
            max_wait_seconds: Maximum time to wait for processing

        Returns:
            Processed file object if successful, None otherwise
        """
        start_time = time.time()
        poll_interval = 2

        while time.time() - start_time < max_wait_seconds:
            try:
                file_obj = self.client.files.get(name=file_uri)

                if hasattr(file_obj, "state") and file_obj.state == "ACTIVE":
                    print(f"   ✅ File ready for processing")
                    return file_obj
                elif hasattr(file_obj, "state"):
                    print(f"   ⏳ File state: {file_obj.state}")
                else:
                    # If we can retrieve the file, it's likely ready
                    return file_obj

                time.sleep(poll_interval)

            except Exception as e:
                print(f"   ⏳ Waiting for file processing... ({e})")
                time.sleep(poll_interval)

        return None

    def _cleanup_gemini_file(self, file_uri: str) -> None:
        """
        Delete uploaded file from Gemini API.

        Args:
            file_uri: URI of the file to delete
        """
        try:
            # Try to delete the file
            self.client.files.delete(name=file_uri)
            print(f"   🗑️  Gemini file cleaned up")
        except Exception as e:
            print(f"   ⚠️  Could not delete Gemini file: {e}")
