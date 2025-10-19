import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';

// Validation schema for request body
const UploadRequestSchema = z.object({
  fileName: z.string().min(1, 'File name is required').max(255, 'File name too long'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.number().positive('File size must be positive').max(100 * 1024 * 1024, 'File size too large (max 100MB)'),
  folder: z.string().optional().default('uploads'),
});

// Environment variables validation
const validateEnvVars = () => {
  const required = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID', 
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET_NAME'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Initialize S3 client
const getS3Client = () => {
  validateEnvVars();
  
  // Check if we're in test mode (using test credentials)
  const isTestMode = process.env.AWS_ACCESS_KEY_ID === 'test-access-key' || 
                     process.env.AWS_ACCESS_KEY_ID?.startsWith('test-');
  
  if (isTestMode) {
    throw new Error('Test mode detected. Please use real AWS credentials for production.');
  }
  
  return new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
};

// Generate unique file key
const generateFileKey = (fileName: string, folder: string) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${folder}/${timestamp}-${randomString}-${sanitizedFileName}`;
};

// Validate file type
const isValidFileType = (fileType: string) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/json',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
  ];
  
  return allowedTypes.includes(fileType);
};

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = UploadRequestSchema.parse(body);
    
    const { fileName, fileType, fileSize, folder } = validatedData;
    
    // Additional file type validation
    if (!isValidFileType(fileType)) {
      return NextResponse.json(
        { 
          error: 'Invalid file type. Allowed types: images, PDF, text, JSON, video, audio' 
        },
        { status: 400 }
      );
    }
    
    // Initialize S3 client
    const s3Client = getS3Client();
    
    // Generate unique file key
    const fileKey = generateFileKey(fileName, folder);
    
    // Create S3 command
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileKey,
      ContentType: fileType,
      ContentLength: fileSize,
      Metadata: {
        'original-name': fileName,
        'upload-timestamp': new Date().toISOString(),
      },
    });
    
    // Generate presigned URL (valid for 15 minutes)
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 900, // 15 minutes
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        presignedUrl,
        fileKey,
        expiresIn: 900,
        uploadUrl: presignedUrl,
        fields: {
          key: fileKey,
          'Content-Type': fileType,
        },
      },
    });
    
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }
    
    // Handle environment variable errors
    if (error instanceof Error && error.message.includes('Missing required environment variables')) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Handle AWS errors
    if (error instanceof Error && error.name?.includes('AWS')) {
      return NextResponse.json(
        { error: 'AWS service error' },
        { status: 500 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate presigned URLs.' },
    { status: 405 }
  );
}
