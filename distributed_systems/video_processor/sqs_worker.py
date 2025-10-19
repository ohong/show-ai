import json
import time
import signal
import sys
import boto3
from datetime import datetime
from config import AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SQS_URL
from video_handler import VideoHandler


class SQSWorker:
    """SQS worker that listens for video messages and processes them."""

    def __init__(self):
        """Initialize SQS client and video handler."""
        self.sqs_client = boto3.client(
            "sqs",
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        )
        self.video_handler = VideoHandler()
        self.should_stop = False
        self.messages_received = 0
        self.messages_processed = 0
        self.errors = 0

        # Set up signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._handle_signal)
        signal.signal(signal.SIGTERM, self._handle_signal)

    def _handle_signal(self, signum, frame):
        """Handle shutdown signals gracefully."""
        print("\n" + "=" * 60)
        print("🛑 Shutdown signal received. Cleaning up...")
        print(f"📊 Statistics:")
        print(f"   Messages received: {self.messages_received}")
        print(f"   Messages processed: {self.messages_processed}")
        print(f"   Errors encountered: {self.errors}")
        print("=" * 60)
        self.should_stop = True
        sys.exit(0)

    def _print_message(self, message_body, message_id, attributes=None):
        """Pretty print a message with timestamp."""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print("\n" + "=" * 60)
        print(f"📨 Message Received at {timestamp}")
        print(f"   Message ID: {message_id}")

        # Try to parse as JSON for pretty printing
        try:
            parsed = json.loads(message_body)
            print(f"   Content:\n{json.dumps(parsed, indent=2)}")
            return parsed
        except json.JSONDecodeError:
            print(f"   Content (raw): {message_body}")
            return None

    def _delete_message(self, receipt_handle):
        """Delete a message from the queue after processing."""
        try:
            self.sqs_client.delete_message(
                QueueUrl=AWS_SQS_URL, ReceiptHandle=receipt_handle
            )
        except Exception as e:
            print(f"❌ Error deleting message: {e}")
            self.errors += 1

    def _process_message(self, message):
        """Process a single message."""
        try:
            parsed_message = self._print_message(
                message_body=message["Body"],
                message_id=message["MessageId"],
                attributes=message.get("MessageAttributes", {}),
            )
            
            # Process video if message was parsed successfully
            if parsed_message:
                success = self.video_handler.process_video(parsed_message)
                if success:
                    self.messages_processed += 1
                    print("=" * 60)
                else:
                    self.errors += 1
            else:
                self.errors += 1
                
        except Exception as e:
            print(f"❌ Error processing message: {e}")
            self.errors += 1

    def start(self, wait_time_seconds=20, max_messages=10):
        """
        Start listening to the SQS queue.

        Args:
            wait_time_seconds: Long polling wait time (max 20)
            max_messages: Maximum messages to receive per poll (max 10)
        """
        print("=" * 60)
        print("🚀 SQS Worker Started")
        print(f"   Queue URL: {AWS_SQS_URL}")
        print(f"   Region: {AWS_REGION}")
        print(f"   Polling interval: {wait_time_seconds}s")
        print("   Waiting for messages... (Press Ctrl+C to stop)")
        print("=" * 60)

        try:
            while not self.should_stop:
                try:
                    # Long poll for messages
                    response = self.sqs_client.receive_message(
                        QueueUrl=AWS_SQS_URL,
                        MaxNumberOfMessages=max_messages,
                        WaitTimeSeconds=wait_time_seconds,
                        MessageAttributeNames=["All"],
                    )

                    # Process messages if any were received
                    messages = response.get("Messages", [])

                    if messages:
                        print(f"\n✅ Received {len(messages)} message(s)")

                        for message in messages:
                            self.messages_received += 1
                            
                            # Process the video
                            self._process_message(message)

                            # Delete message from queue after processing
                            self._delete_message(message["ReceiptHandle"])

                    else:
                        print("⏳ Polling... (no messages)", end="\r")

                except Exception as e:
                    print(f"\n❌ Error receiving messages: {e}")
                    self.errors += 1
                    time.sleep(5)  # Wait before retrying

        except KeyboardInterrupt:
            self._handle_signal(None, None)


def main():
    """Main entry point for the SQS worker."""
    try:
        worker = SQSWorker()
        worker.start(wait_time_seconds=5, max_messages=10)
    except ValueError as e:
        print(f"❌ Configuration Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Fatal Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
