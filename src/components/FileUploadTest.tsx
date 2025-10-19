'use client';

import { useState } from 'react';
import { useFileUpload } from '@/lib/upload-example';

export default function FileUploadTest() {
  const { uploadFile, isUploading, uploadProgress, error } = useFileUpload();
  const [uploadedFile, setUploadedFile] = useState<{ fileKey: string; uploadUrl: string } | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const result = await uploadFile(file, 'test-uploads');
        setUploadedFile(result);
        console.log('Upload successful:', result);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">File Upload Test</h2>
      
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {isUploading && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {uploadedFile && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="font-semibold">Upload Successful!</p>
          <p className="text-sm">File Key: {uploadedFile.fileKey}</p>
          <p className="text-sm">Upload URL: {uploadedFile.uploadUrl}</p>
        </div>
      )}

      <div className="text-xs text-gray-500">
        <p>Supported file types: Images, PDF, Text, JSON, Video, Audio</p>
        <p>Max file size: 100MB</p>
      </div>
    </div>
  );
}
