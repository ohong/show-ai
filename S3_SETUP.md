# S3 Upload Setup Guide

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here
AWS_S3_BUCKET_NAME=your-bucket-name-here
```

## AWS S3 Bucket Setup

1. **Create an S3 Bucket**:
   - Go to AWS S3 Console
   - Create a new bucket
   - Choose a unique name (bucket names must be globally unique)
   - Select your preferred region

2. **Configure Bucket Permissions**:
   - Go to the bucket's "Permissions" tab
   - Edit the "Bucket Policy" to allow uploads:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPresignedUploads",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/YOUR_IAM_USER"
      },
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

3. **Create IAM User** (Recommended):
   - Go to AWS IAM Console
   - Create a new user with programmatic access
   - Attach the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

4. **CORS Configuration** (if needed):
   - Go to bucket "Permissions" → "CORS"
   - Add the following configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## Testing the Setup

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test the endpoint**:
   ```bash
   curl -X POST http://localhost:3000/api/upload/presigned-url \
     -H "Content-Type: application/json" \
     -d '{
       "fileName": "test.jpg",
       "fileType": "image/jpeg",
       "fileSize": 1024
     }'
   ```

3. **Use the test component**:
   - Import and use `FileUploadTest` component in your app
   - Upload a file to test the complete workflow

## Security Best Practices

1. **Never commit AWS credentials** to version control
2. **Use IAM roles** in production instead of access keys
3. **Set up bucket policies** to restrict access
4. **Enable S3 bucket versioning** for data protection
5. **Use HTTPS** for all uploads
6. **Implement file type validation** on both client and server
7. **Set up CloudWatch monitoring** for upload activities

## Troubleshooting

### Common Issues:

1. **"Access Denied" errors**:
   - Check IAM permissions
   - Verify bucket policy
   - Ensure credentials are correct

2. **CORS errors**:
   - Configure CORS policy on your S3 bucket
   - Check allowed origins and methods

3. **"Invalid file type" errors**:
   - Check the `isValidFileType` function in the API
   - Add your file type to the allowed list if needed

4. **Environment variables not loading**:
   - Ensure `.env.local` is in the project root
   - Restart your development server
   - Check variable names match exactly

### Debug Mode:

Add this to your API route for debugging:

```typescript
console.log('Environment check:', {
  region: process.env.AWS_REGION,
  bucket: process.env.AWS_S3_BUCKET_NAME,
  hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
});
```
