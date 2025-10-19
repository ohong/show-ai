import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env.local in the parent project directory
env_path = Path(__file__).parent.parent.parent / ".env.local"
load_dotenv(env_path)

# AWS Configuration
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_SQS_URL = os.getenv("AWS_SQS_URL")
AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET", "watchlearn1")

# Gemini API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Download directory
DOWNLOAD_DIR = os.getenv("DOWNLOAD_DIR", "./downloads")

# Validate required configuration
if not all([AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SQS_URL]):
    raise ValueError(
        "Missing required AWS environment variables. "
        "Please ensure AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_SQS_URL are set in .env.local"
    )

if not GEMINI_API_KEY:
    raise ValueError(
        "Missing GEMINI_API_KEY environment variable. "
        "Please ensure GEMINI_API_KEY is set in .env.local"
    )

print(f"✓ AWS Configuration loaded")
print(f"  Region: {AWS_REGION}")
print(f"  SQS URL: {AWS_SQS_URL}")
print(f"  S3 Bucket: {AWS_S3_BUCKET}")
print(f"  Download Dir: {DOWNLOAD_DIR}")
print(f"✓ Gemini API Configuration loaded")
