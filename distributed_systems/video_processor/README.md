# Video Processor - Distributed System

A lightweight Python-based distributed video processing system using AWS SQS, S3, Gemini AI, and Supabase.

## 📋 Prerequisites

- Python 3.9+
- AWS Account with SQS queue and S3 bucket
- Google Gemini API key
- Supabase project
- AWS credentials (Access Key ID and Secret Access Key)

## 🚀 Setup

### 1. Activate Virtual Environment

```bash
cd distributed_systems/video_processor
source myenv/bin/activate
```

### 2. Environment Variables

Create a `.env.local` file in the project root (`/Users/javokhir/Development/projects/show-ai/`) with the following variables:

```
# AWS Configuration
AWS_REGION=us-west-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_SQS_URL=https://sqs.{region}.amazonaws.com/{account-id}/{queue-name}
AWS_S3_BUCKET=your-bucket-name

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional
DOWNLOAD_DIR=./downloads
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## 📦 Project Structure

```
distributed_systems/video_processor/
├── myenv/                    # Python virtual environment
├── config.py                 # Configuration and environment variables
├── sqs_worker.py            # Main SQS worker script
├── video_handler.py         # Video processing orchestration
├── gemini_handler.py        # Gemini AI integration
├── supabase_client.py       # Supabase database operations
├── requirements.txt         # Python dependencies
└── README.md                # This file
```

## 🎯 Components

### SQS Worker (`sqs_worker.py`)

Main worker that:
- ✅ Connects to AWS SQS queue
- 📨 Listens for incoming video messages
- 🎬 Orchestrates video processing
- 🗑️ Automatically deletes processed messages
- 📊 Tracks statistics
- 🛑 Handles graceful shutdown

### Video Handler (`video_handler.py`)

Orchestrates video processing:
- 📥 Downloads S3 videos
- 🎥 Handles YouTube videos directly
- 📤 Sends videos to Gemini for analysis
- 💾 Saves results to Supabase
- 🗑️ Cleans up temporary files

### Gemini Handler (`gemini_handler.py`)

Manages Gemini API interactions:
- 📤 Uploads videos to Gemini
- ⏳ Polls for file processing
- 🤖 Generates comprehensive video analysis
- 🗑️ Cleans up uploaded files

### Supabase Client (`supabase_client.py`)

Database operations for video processing:
- 🔄 Updates processing status at each step
- 💾 Saves analysis results
- ❌ Marks failed videos with error messages
- ✅ Sets completion status

## 🎯 Processing Status Workflow

Videos move through these processing states:

```
queued → processing → downloading/uploading → processing → completed
                           ↓
                        failed (on error)
```

### Status Values

- `queued`: Video received, waiting to process (initial state)
- `downloading`: S3 video is being downloaded (S3 only)
- `uploading`: Video is being sent to Gemini API
- `processing`: Gemini is analyzing the video
- `completed`: Processing finished successfully, results saved
- `failed`: Processing failed, error message in `analysis_result`

## ⚡ Running the Worker

### Start the SQS Worker

```bash
python sqs_worker.py
```

Expected output:

```
✓ AWS Configuration loaded
  Region: us-west-1
  SQS URL: https://sqs.us-west-1.amazonaws.com/390403864981/myqueue.fifo
  S3 Bucket: watchlearn1
  Download Dir: ./downloads
✓ Gemini API Configuration loaded
✓ Supabase Configuration loaded
============================================================
🚀 SQS Worker Started
   Queue URL: https://sqs.us-west-1.amazonaws.com/390403864981/myqueue.fifo
   Region: us-west-1
   Polling interval: 5s
   Waiting for messages... (Press Ctrl+C to stop)
============================================================
```

## 📊 Processing Example

When processing a YouTube video:

```
============================================================
📨 Message Received at 2025-10-19 08:02:42
   Message ID: 9e22a186-ec78-49e2-9c8a-897fed0c07cc

============================================================
🎬 Processing Video: fde164f6-a996-4f5c-bcfa-255976e6d957
   Source Type: youtube
   ✅ Status updated: processing

🎥 YouTube Video Detected
   Video ID: fde164f6-a996-4f5c-bcfa-255976e6d957
   YouTube ID: LS0gSjrlMJc
   Title: YouTube Video LS0gSjrlMJc
   URL: https://www.youtube.com/watch?v=LS0gSjrlMJc

📊 Sending to Gemini for analysis...
   ✅ Status updated: processing

🤖 Sending YouTube video to Gemini...
   URL: https://www.youtube.com/watch?v=LS0gSjrlMJc

✅ Analysis complete
   Analysis length: 2688 characters

============================================================
✅ Analysis Results for Video: fde164f6-a996-4f5c-bcfa-255976e6d957
   Source Type: youtube
   ✅ Analysis result saved (2688 characters)
   ✅ Status updated: completed

============================================================
```

## 📝 Database Schema

The integration updates the `videos` table with:

### New Columns
- `processing_status` (TEXT): Current status of video processing
- `analysis_result` (TEXT): Gemini analysis or error message

### Updated Columns
- `is_processed` (BOOLEAN): Set to `true` when processing completes successfully

### Example Database State

```sql
-- Before processing
{
  "id": "fde164f6-a996-4f5c-bcfa-255976e6d957",
  "is_processed": false,
  "processing_status": "queued",
  "analysis_result": null
}

-- During processing
{
  "id": "fde164f6-a996-4f5c-bcfa-255976e6d957",
  "is_processed": false,
  "processing_status": "processing",
  "analysis_result": null
}

-- After successful completion
{
  "id": "fde164f6-a996-4f5c-bcfa-255976e6d957",
  "is_processed": true,
  "processing_status": "completed",
  "analysis_result": "{\n  \"summary\": \"...\",\n  \"topics\": [...],\n  \"quiz\": {...}\n}"
}

-- On failure
{
  "id": "fde164f6-a996-4f5c-bcfa-255976e6d957",
  "is_processed": false,
  "processing_status": "failed",
  "analysis_result": "Error: Connection timeout"
}
```

## 🛑 Stopping the Worker

Press `Ctrl+C` to gracefully stop the worker:

```
============================================================
🛑 Shutdown signal received. Cleaning up...
📊 Statistics:
   Messages received: 5
   Messages processed: 5
   Errors encountered: 0
============================================================
```

## 📚 Dependencies

Key dependencies:
- `boto3` - AWS SDK for Python
- `python-dotenv` - Load environment variables
- `supabase` - Supabase Python client
- `google-genai` - Google Gemini API client

See `requirements.txt` for complete list.

## 🔧 Configuration

### config.py
- AWS region and credentials
- Gemini API key
- Supabase credentials
- Download directory

### sqs_worker.py
- Polling wait time (default: 5 seconds)
- Max messages per poll (default: 10)

## 🐛 Troubleshooting

### "Missing Supabase environment variables"

Ensure `.env.local` has:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### "Status updates not appearing in database"

1. Check Supabase credentials are correct
2. Verify `videos` table has `processing_status` and `analysis_result` columns
3. Check Supabase RLS policies don't block service role

### "Gemini API errors"

- Verify `GEMINI_API_KEY` is valid and has quota
- Check video file isn't corrupted
- Ensure video format is supported (MP4, WebM, etc.)

### Processing hangs

- Check internet connection
- Verify Gemini API isn't rate-limited
- Check SQS queue isn't full

## 📄 License

See project root LICENSE file.
