// Example usage of the presigned URL endpoint
// This file demonstrates how to use the /api/upload/presigned-url endpoint

import { useState } from 'react';

export interface UploadRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  folder?: string;
}

export interface UploadResponse {
  success: boolean;
  data: {
    presignedUrl: string;
    fileKey: string;
    expiresIn: number;
    uploadUrl: string;
    fields: {
      key: string;
      'Content-Type': string;
    };
  };
}

export interface UploadError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// Function to generate presigned URL
export async function generatePresignedUrl(request: UploadRequest): Promise<UploadResponse> {
  const response = await fetch('/api/upload/presigned-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error: UploadError = await response.json();
    throw new Error(error.error || 'Failed to generate presigned URL');
  }

  return response.json();
}

// Function to upload file using presigned URL
export async function uploadFileToS3(
  file: File,
  presignedUrl: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status: ${xhr.status}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });
    
    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}

// Complete upload workflow
export async function uploadFile(
  file: File,
  folder: string = 'uploads',
  onProgress?: (progress: number) => void
): Promise<{ fileKey: string; uploadUrl: string }> {
  try {
    // Step 1: Generate presigned URL
    const { data } = await generatePresignedUrl({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      folder,
    });
    
    // Step 2: Upload file to S3
    await uploadFileToS3(file, data.presignedUrl, onProgress);
    
    return {
      fileKey: data.fileKey,
      uploadUrl: data.uploadUrl,
    };
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// React hook example for file upload
export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFileWithProgress = async (file: File, folder?: string) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const result = await uploadFile(file, folder || 'uploads', setUploadProgress);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile: uploadFileWithProgress,
    isUploading,
    uploadProgress,
    error,
  };
}

