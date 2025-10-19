"use client";

import { useRef, useState, useCallback } from "react";

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

export function UploadPanel() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlMessage, setUrlMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Unsupported format. Use MP4, MOV, or WEBM up to 30 minutes.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setUrlMessage(null);
    setUrlError(null);
    setUploadError(null);
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  const handleUrlSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = url.trim();

    if (!trimmed) {
      setUrlError("Paste a link to a public video.");
      setUrlMessage(null);
      return;
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("Invalid protocol");
      }
    } catch {
      setUrlError("Use a valid http(s) URL.");
      setUrlMessage(null);
      return;
    }

    setUrlError(null);
    setUrlMessage("Processing YouTube URL...");
    setSelectedFile(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Check if it's a YouTube URL
      const isYouTube = /youtube\.com|youtu\.be/.test(trimmed);
      
      if (isYouTube) {
        setUploadProgress(25);
        
        // Process YouTube URL
        const response = await fetch('/api/upload/youtube', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: trimmed }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to process YouTube URL');
        }

        setUploadProgress(75);
        const { video } = await response.json();
        
        setUploadProgress(100);
        setUrlMessage(`YouTube video "${video.youtube_title || 'Unknown'}" processed successfully!`);
        
        // Reset after successful processing
        setTimeout(() => {
          setUrl('');
          setUrlMessage(null);
          setIsUploading(false);
          setUploadProgress(0);
        }, 2000);
        
      } else {
        // For non-YouTube URLs, we'll need to implement generic URL processing
        setUrlError("Currently only YouTube URLs are supported. Please use a YouTube link.");
        setUrlMessage(null);
        setIsUploading(false);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('URL processing failed:', error);
      setUrlError(error instanceof Error ? error.message : 'Failed to process URL');
      setUrlMessage(null);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Step 1: Get presigned URL from our API
      const presignedResponse = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          folder: 'videos'
        }),
      });

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const { data } = await presignedResponse.json();
      const { presignedUrl, fileKey } = data;

      // Step 2: Upload file to S3 using presigned URL with progress tracking
      setUploadProgress(10);

      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      setUploadProgress(85);

      // Step 3: Record uploaded video in Supabase linked to current user
      try {
        const recordResponse = await fetch('/api/upload/record', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceType: 's3',
            fileKey,
            fileName: selectedFile.name,
            fileType: selectedFile.type,
            fileSize: selectedFile.size,
          }),
        });

        if (!recordResponse.ok) {
          const err = await recordResponse.json().catch(() => ({}));
          throw new Error(err?.error || 'Failed to record uploaded video');
        }
      } catch (recordErr) {
        console.error('Failed to record upload:', recordErr);
        // Surface but do not undo the successful S3 upload
        setUploadError(recordErr instanceof Error ? recordErr.message : 'Failed to record upload');
      }

      setUploadProgress(100);
      
      // Reset after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setIsUploading(false);
        setUploadProgress(0);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        alert('Video uploaded successfully!');
      }, 1000);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <section id="upload" className="border-y-4 border-border bg-background">
      <div className="layout-shell py-20">
        <div className="stack items-center gap-6 text-center">
          <h2 className="section-heading">Upload your walkthrough</h2>
          <p className="caption max-w-2xl">
            Drag a recording or share a link. We hash it instantly, skip duplicates, and keep your
            footage local until it is needed.
          </p>
        </div>
        <div className="mx-auto mt-12 flex max-w-2xl flex-col gap-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`upload-callout transition-all ${
              isDragOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''
            }`}
          >
            <label
              htmlFor="video-upload"
              className="cursor-pointer"
            >
              <span className="meta-label">From your device</span>
              <h3 className="font-display text-2xl tracking-[0.04em]">Drop a video or click to choose</h3>
              <p className="caption text-sm">
                MP4, MOV, WEBM up to 30 minutes. We compute the hash locally before anything is uploaded.
              </p>
              <button
                type="button"
                className="button-inline"
                onClick={() => inputRef.current?.click()}
              >
                Select video
              </button>
              <input
                id="video-upload"
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={(event) => handleFileSelect(event.target.files)}
                className="hidden"
              />
            </label>

            {selectedFile && (
              <div className="mt-4 stack">
                <div className="brutalist-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-accent-thin flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-mono text-sm">{selectedFile.name}</p>
                        <p className="caption text-xs">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (inputRef.current) {
                          inputRef.current.value = '';
                        }
                      }}
                      className="button-inline"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {isUploading && (
                  <div className="brutalist-card">
                    <div className="flex justify-between">
                      <span className="font-mono text-sm">Uploading to S3...</span>
                      <span className="font-mono text-sm">{uploadProgress}%</span>
                    </div>
                    <div className="mt-2" style={{ border: '2px solid var(--color-border)', height: '12px', background: 'rgba(29, 74, 255, 0.12)' }}>
                      <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--color-info)' }} />
                    </div>
                  </div>
                )}

                {uploadError && !isUploading && (
                  <div className="accent-block">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs uppercase tracking-[0.12em] text-danger">{uploadError}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className="button-inline"
                    style={{ opacity: !selectedFile || isUploading ? 0.55 : 1, pointerEvents: !selectedFile || isUploading ? 'none' : 'auto' }}
                  >
                    {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload Video'}
                  </button>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (inputRef.current) {
                          inputRef.current.value = '';
                        }
                        setUploadError(null);
                      }}
                      className="button-inline"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {/* <div className="brutalist-card" data-variant="accent">
                  <p className="font-mono text-sm">Upload Guidelines</p>
                  <ul className="bullet-grid">
                    <li>Maximum file size: 500MB</li>
                    <li>Supported formats: MP4, MOV, WebM</li>
                    <li>Use clear screen recordings</li>
                    <li>Ensure good audio quality if present</li>
                  </ul>
                </div> */}
              </div>
            )}

            {error && (
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-danger">{error}</p>
            )}
          </div>

          <form onSubmit={handleUrlSubmit} className="link-panel">
            <span className="meta-label">Or paste a public link</span>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                className="input-field flex-1"
                type="url"
                placeholder="https://youtube.com/watch?v=…"
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  setUrlError(null);
                  setUrlMessage(null);
                }}
              />
              <button type="submit" className="button-inline">
                Use link
              </button>
            </div>
            {urlMessage && (
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-info text-center">
                {urlMessage}
              </p>
            )}
            {urlError && (
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-danger text-center">
                {urlError}
              </p>
            )}
          </form>
          <p className="caption text-center text-sm text-muted">
            Already processed the same walkthrough? We reuse the finished bundle instantly.
          </p>
        </div>
      </div>
    </section>
  );
}
