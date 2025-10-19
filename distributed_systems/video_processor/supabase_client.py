import os
from typing import Optional, Literal
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent.parent.parent / ".env.local"
load_dotenv(env_path)

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ Supabase Python client not installed. Install with: pip install supabase")
    raise


class SupabaseClient:
    """Handles Supabase database operations for video processing status and results."""

    def __init__(self):
        """Initialize Supabase client with environment variables."""
        self.url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        self.service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        if not self.url or not self.service_key:
            raise ValueError(
                "Missing Supabase environment variables. "
                "Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local"
            )

        self.client: Client = create_client(self.url, self.service_key)
        print("✓ Supabase Client initialized")

    def update_processing_status(
        self,
        video_id: str,
        status: Literal["queued", "downloading", "uploading", "processing", "completed", "failed"],
        error_message: Optional[str] = None
    ) -> bool:
        """
        Update the processing status of a video.

        Args:
            video_id: UUID of the video
            status: Processing status
            error_message: Optional error message for failed status

        Returns:
            bool: True if update was successful
        """
        try:
            update_data = {"processing_status": status}
            
            # Include error context in analysis_result if failed
            if status == "failed" and error_message:
                update_data["analysis_result"] = f"Error: {error_message}"
            
            response = self.client.table("videos").update(update_data).eq("id", video_id).execute()
            
            if response.data:
                print(f"   ✅ Status updated: {status}")
                return True
            else:
                print(f"   ⚠️  Status update may have failed")
                return False
                
        except Exception as e:
            print(f"   ❌ Error updating status: {e}")
            return False

    def save_analysis_result(
        self,
        video_id: str,
        analysis: str,
        mark_processed: bool = True
    ) -> bool:
        """
        Save the analysis result and mark video as processed.

        Args:
            video_id: UUID of the video
            analysis: The analysis text from Gemini
            mark_processed: Whether to set is_processed to true

        Returns:
            bool: True if save was successful
        """
        try:
            update_data = {
                "analysis_result": analysis,
                "processing_status": "completed"
            }
            
            if mark_processed:
                update_data["is_processed"] = True
            
            response = self.client.table("videos").update(update_data).eq("id", video_id).execute()
            
            if response.data:
                print(f"   ✅ Analysis result saved ({len(analysis)} characters)")
                return True
            else:
                print(f"   ⚠️  Analysis save may have failed")
                return False
                
        except Exception as e:
            print(f"   ❌ Error saving analysis result: {e}")
            return False

    def mark_as_failed(self, video_id: str, error_message: str) -> bool:
        """
        Mark a video as failed with error message.

        Args:
            video_id: UUID of the video
            error_message: Description of the error

        Returns:
            bool: True if update was successful
        """
        return self.update_processing_status(
            video_id=video_id,
            status="failed",
            error_message=error_message
        )
