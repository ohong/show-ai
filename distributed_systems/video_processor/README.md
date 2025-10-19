# Video Processor - Distributed System

A lightweight Python-based distributed video processing system using AWS SQS, S3, and Supabase.

## 📋 Prerequisites

- Python 3.9+
- AWS Account with SQS queue and S3 bucket
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
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_SQS_URL=https://sqs.{region}.amazonaws.com/{account-id}/{queue-name}
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## 📦 Project Structure

```
distributed_systems/video_processor/
├── myenv/                  # Python virtual environment
├── config.py               # Configuration and environment variables
├── sqs_worker.py          # Main SQS worker script
├── requirements.txt       # Python dependencies
└── README.md              # This file
```

## 🎯 Components

### SQS Worker (`sqs_worker.py`)

A simple worker that:
- ✅ Connects to AWS SQS queue
- 📨 Listens for incoming messages
- 🖨️  Prints messages to console
- 🗑️  Automatically deletes processed messages
- 📊 Tracks statistics (messages received, errors)
- 🛑 Handles graceful shutdown (Ctrl+C)

### Features

- **Long Polling**: Efficiently polls the queue (20-second wait)
- **JSON Pretty Printing**: Automatically formats JSON messages
- **Error Handling**: Graceful error recovery with retry logic
- **Statistics**: Displays message count and error statistics on shutdown
- **Graceful Shutdown**: Properly handles SIGINT and SIGTERM signals

## ⚡ Running the Worker

### Start the SQS Worker

```bash
python sqs_worker.py
```

You should see output like:

```
============================================================
🚀 SQS Worker Started
   Queue URL: https://sqs.us-east-1.amazonaws.com/123456789/my-queue
   Region: us-east-1
   Polling interval: 20s
   Waiting for messages... (Press Ctrl+C to stop)
============================================================
```

### Sending Test Messages

You can use AWS CLI to send test messages:

```bash
aws sqs send-message \
  --queue-url $AWS_SQS_URL \
  --message-body '{"action": "process_video", "video_id": "vid_123"}'
```

Or using Python:

```python
import boto3
import json

sqs = boto3.client('sqs', region_name='us-east-1')
sqs.send_message(
    QueueUrl='your-queue-url',
    MessageBody=json.dumps({
        'action': 'process_video',
        'video_id': 'vid_123'
    })
)
```

## 📊 Output Example

When a message is received:

```
============================================================
📨 Message Received at 2025-10-19 14:32:45
   Message ID: abc123def456
   Content:
{
  "action": "process_video",
  "video_id": "vid_123",
  "quality": "1080p"
}
   Attributes: {}
============================================================
```

## 🛑 Stopping the Worker

Press `Ctrl+C` to gracefully stop the worker. Statistics will be displayed:

```
============================================================
🛑 Shutdown signal received. Cleaning up...
📊 Statistics:
   Messages received: 5
   Errors encountered: 0
============================================================
```

## 📚 Dependencies

- `boto3` - AWS SDK for Python
- `python-dotenv` - Load environment variables from .env files
- `supabase` - Supabase client library
- And their dependencies (see `requirements.txt`)

## 🔧 Configuration

Edit `config.py` to modify:
- AWS region
- Environment variable validation

Edit `sqs_worker.py` to modify:
- Polling wait time (default: 20 seconds)
- Max messages per poll (default: 10)
- Message processing logic

## 📝 Future Enhancements

- [ ] Integration with Supabase for storing processing status
- [ ] S3 file processing
- [ ] Concurrent message processing
- [ ] Dead letter queue handling
- [ ] Monitoring and metrics
- [ ] Database-driven configuration

## 🐛 Troubleshooting

### "Missing required AWS environment variables"

Make sure `.env.local` exists in `/Users/javokhir/Development/projects/show-ai/` with all required variables set.

### "Invalid AWS credentials"

Verify your `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are correct.

### "Queue not found"

Check that the `AWS_SQS_URL` is correct and accessible from your machine.

## 📄 License

See project root LICENSE file.
