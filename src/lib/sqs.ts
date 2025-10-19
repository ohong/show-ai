import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'

// SQS configuration utility
export const sqsConfig = {
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
}

// Create SQS client instance
export const createSQSClient = () => {
  if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('Missing required AWS environment variables')
  }

  return new SQSClient(sqsConfig)
}

// Validate required environment variables for SQS
export const validateSQSConfig = () => {
  const required = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_SQS_URL',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  return true
}

const isFifoQueue = (queueUrl: string) => queueUrl.endsWith('.fifo')

// Enqueue a newly created video for downstream processing
export const enqueueVideoForProcessing = async (video: unknown) => {
  const queueUrl = process.env.AWS_SQS_URL
  if (!queueUrl) {
    // Silently skip if SQS is not configured
    return
  }

  try {
    const client = createSQSClient()
    const messageBody = JSON.stringify({ event: 'video.created', video })

    const input: any = {
      QueueUrl: queueUrl,
      MessageBody: messageBody,
    }

    if (isFifoQueue(queueUrl)) {
      // Provide sane defaults for FIFO queues
      const videoId = (video as any)?.id ?? `${Date.now()}`
      const userId = (video as any)?.user_id ?? 'group'
      input.MessageGroupId = `video-${userId}`
      input.MessageDeduplicationId = `video-${videoId}`
    }

    await client.send(new SendMessageCommand(input))
  } catch (err) {
    // Do not block the API call on queue failures
    console.error('Failed to enqueue video for processing', err)
  }
}


