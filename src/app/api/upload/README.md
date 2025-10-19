# S3 Presigned URL Upload API

This API endpoint provides secure, serverless file uploads to AWS S3 using presigned URLs.

## Endpoint

```
POST /api/upload/presigned-url
```

## Environment Variables Required

Make sure these are set in your `.env.local` file:

```env
AWS_REGION=your-aws-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
```

## Request Body

```typescript
{
  fileName: string;        // Required: Original file name
  fileType: string;        // Required: MIME type (e.g., 'image/jpeg')
  fileSize: number;        // Required: File size in bytes
  folder?: string;         // Optional: S3 folder (default: 'uploads')
}
```

## Response

### Success (200)
```typescript
{
  success: true,
  data: {
    presignedUrl: string;    // URL to upload file to
    fileKey: string;          // S3 object key
    expiresIn: number;        // URL expiration time (seconds)
    uploadUrl: string;        // Same as presignedUrl
    fields: {
      key: string;
      'Content-Type': string;
    }
  }
}
```

### Error (400/500)
```typescript
{
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}
```

## Usage Examples

### Basic Upload

```typescript
// 1. Generate presigned URL
const response = await fetch('/api/upload/presigned-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fileName: 'my-image.jpg',
    fileType: 'image/jpeg',
    fileSize: 1024000,
    folder: 'images'
  })
});

const { data } = await response.json();

// 2. Upload file to S3
const uploadResponse = await fetch(data.presignedUrl, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': file.type
  }
});
```

### Using the Helper Functions

```typescript
import { uploadFile } from '@/lib/upload-example';

const handleFileUpload = async (file: File) => {
  try {
    const result = await uploadFile(file, 'uploads', (progress) => {
      console.log(`Upload progress: ${progress}%`);
    });
    
    console.log('File uploaded:', result.fileKey);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### React Hook Usage

```typescript
import { useFileUpload } from '@/lib/upload-example';

function FileUploadComponent() {
  const { uploadFile, isUploading, uploadProgress, error } = useFileUpload();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await uploadFile(file, 'uploads');
        console.log('Upload successful!');
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {isUploading && <div>Uploading... {uploadProgress}%</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

## Security Features

- **File Type Validation**: Only allows safe file types
- **File Size Limits**: Maximum 100MB per file
- **URL Expiration**: Presigned URLs expire in 15 minutes
- **Unique File Names**: Prevents filename conflicts
- **Input Validation**: Comprehensive request validation

## Allowed File Types

- Images: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- Documents: `application/pdf`, `text/plain`, `application/json`
- Media: `video/mp4`, `video/webm`, `audio/mpeg`, `audio/wav`

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad request (validation errors)
- `405`: Method not allowed
- `500`: Server error (AWS/config issues)

## File Naming

Generated file keys follow this pattern:
```
{folder}/{timestamp}-{randomString}-{sanitizedFileName}
```

Example: `uploads/1703123456789-abc123def456-my_image.jpg`

## Best Practices

1. **Always validate files on the client side** before sending the request
2. **Handle upload progress** for better user experience
3. **Implement retry logic** for failed uploads
4. **Clean up failed uploads** if needed
5. **Use appropriate folder structure** for organization
