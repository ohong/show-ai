"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_FILE_SIZE = 30 * 60 * 1024 * 1024; // 30 minutes worth at ~average bitrate

interface VideoUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function VideoUploadDialog({ isOpen, onClose, onSuccess }: VideoUploadDialogProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // URL upload states
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlMessage, setUrlMessage] = useState<string | null>(null);
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);

  // Description state (shared between both tabs)
  const [description, setDescription] = useState("");

  // Monetization states
  const [isMonetized, setIsMonetized] = useState(false);
  const [pricePerAccess, setPricePerAccess] = useState("");

  // Tab state
  const [activeTab, setActiveTab] = useState<"file" | "url">("file");

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetAllStates();
    }
  }, [isOpen]);

  // Mount guard for portals (avoids SSR hydration issues)
  useEffect(() => {
    setIsMounted(true);
  }, []);


  // Lock body scroll when dialog is open
  useEffect(() => {
    if (!isMounted) return;
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isMounted, isOpen]);

  const resetAllStates = () => {
    setSelectedFile(null);
    setFileError(null);
    setUrl("");
    setUrlError(null);
    setUrlMessage(null);
    setDescription("");
    setIsMonetized(false);
    setPricePerAccess("");
    setIsUploading(false);
    setIsProcessingUrl(false);
    setUploadProgress(0);
    setUploadError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Unsupported format. Use MP4, MOV, or WEBM.");
      setSelectedFile(null);
      return;
    }

    // Validate file size (30 minutes is a reasonable upper bound)
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setFileError(null);
    setUploadError(null);
  }, []);

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
  }, [handleFileSelect]);

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Step 1: Get presigned URL
      const presignedResponse = await fetch("/api/upload/presigned-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          folder: "videos",
        }),
      });

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json();
        throw new Error(errorData.error || "Failed to get upload URL");
      }

      const { data } = await presignedResponse.json();
      const { presignedUrl, fileKey } = data;

      // Step 2: Upload to S3
      setUploadProgress(15);

      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: selectedFile,
        headers: {
          "Content-Type": selectedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to S3");
      }

      setUploadProgress(60);

      // Step 3: Record in Supabase
      try {
        const recordResponse = await fetch("/api/upload/record", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceType: "s3",
            fileKey,
            fileName: selectedFile.name,
            fileType: selectedFile.type,
            fileSize: selectedFile.size,
            description: description.trim() || undefined,
            isMonetized,
            pricePerAccess: isMonetized && pricePerAccess ? parseFloat(pricePerAccess) : undefined,
          }),
        });

        if (!recordResponse.ok) {
          const err = await recordResponse.json().catch(() => ({}));
          throw new Error(err?.error || "Failed to record uploaded video");
        }
      } catch (recordErr) {
        console.error("Failed to record upload:", recordErr);
        setUploadError(recordErr instanceof Error ? recordErr.message : "Failed to record upload");
      }

      setUploadProgress(100);

      // Success - close dialog after brief delay
      setTimeout(() => {
        resetAllStates();
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

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
    setUrlMessage("Processing video URL...");
    setIsProcessingUrl(true);

    try {
      const isYouTube = /youtube\.com|youtu\.be/.test(trimmed);

      if (isYouTube) {
        const response = await fetch("/api/upload/youtube", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            url: trimmed,
            description: description.trim() || undefined,
            isMonetized,
            pricePerAccess: isMonetized && pricePerAccess ? parseFloat(pricePerAccess) : undefined,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to process YouTube URL");
        }

        const { video } = await response.json();

        setUrlMessage(`YouTube video "${video.youtube_title || "Unknown"}" processed successfully!`);

        // Success - close dialog after brief delay
        setTimeout(() => {
          resetAllStates();
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        setUrlError("Currently only YouTube URLs are supported. Please use a YouTube link.");
        setUrlMessage(null);
        setIsProcessingUrl(false);
      }
    } catch (error) {
      console.error("URL processing failed:", error);
      setUrlError(error instanceof Error ? error.message : "Failed to process URL");
      setUrlMessage(null);
      setIsProcessingUrl(false);
    }
  };

  if (!isMounted || !isOpen) return null;
  const dialogNode = (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      className="backdrop-blur-sm"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.45)",
      }}
    >
       <div
         className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
         onClick={(e) => e.stopPropagation()}
         style={{ backgroundColor: "var(--color-background)", border: "4px solid var(--color-border)" }}
       >
         <div className="p-4">
          {/* Header */}
          <div className="border-b-4 border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl tracking-[0.04em] uppercase">Upload Video</h2>
                <p className="caption text-xs text-muted mt-1">
                  Upload a recording or share a YouTube link
                </p>
              </div>
               <button
                 onClick={onClose}
                 className="button-inline"
                 aria-label="Close dialog"
               >
                 ✕
               </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b-4 border-border flex">
            <button
              onClick={() => setActiveTab("file")}
              className={`flex-1 px-4 py-3 font-display text-sm uppercase tracking-[0.08em] transition-colors border-r-4 border-border ${
                activeTab === "file"
                  ? "bg-accent text-foreground"
                  : "bg-transparent text-muted hover:bg-accent-thin"
              }`}
            >
              From Device
            </button>
            <button
              onClick={() => setActiveTab("url")}
              className={`flex-1 px-4 py-3 font-display text-sm uppercase tracking-[0.08em] transition-colors ${
                activeTab === "url"
                  ? "bg-accent text-foreground"
                  : "bg-transparent text-muted hover:bg-accent-thin"
              }`}
            >
              From Link
            </button>
          </div>

          {/* Content */}
          <div className="px-4 py-4">
            {/* Description field - shared between both tabs */}
            <div className="mb-4">
              <label htmlFor="description" className="meta-label block mb-1">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for your video..."
                className="input-field w-full min-h-[60px] resize-y"
                disabled={isUploading || isProcessingUrl}
                rows={2}
              />
            </div>

            {/* Monetization section - shared between both tabs */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="monetization"
                  checked={isMonetized}
                  onChange={(e) => setIsMonetized(e.target.checked)}
                  disabled={isUploading || isProcessingUrl}
                  className="w-4 h-4"
                />
                <label htmlFor="monetization" className="meta-label">
                  Enable monetization
                </label>
              </div>
              
              {isMonetized && (
                <div className="ml-7">
                  <label htmlFor="price" className="meta-label block mb-1">
                    Price per access ($)
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={pricePerAccess}
                    onChange={(e) => setPricePerAccess(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    disabled={isUploading || isProcessingUrl}
                    className="input-field w-full"
                  />
                  <p className="caption text-xs text-muted mt-1">
                    Set the price users will pay to access this skill
                  </p>
                </div>
              )}
            </div>

            {activeTab === "file" ? (
              // File Upload Tab
              <div className="space-y-4">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`upload-callout transition-all ${
                    isDragOver ? "ring-2 ring-info bg-info/10" : ""
                  }`}
                >
                  <label htmlFor="video-upload" className="cursor-pointer w-full">
                    <span className="meta-label">Drop file here or click to browse</span>
                    <h3 className="font-display text-lg tracking-[0.04em] mt-1">
                      Choose a video file
                    </h3>
                    <p className="caption text-xs mt-1">
                      MP4, MOV, WEBM up to 30 minutes. Your file is hashed locally before upload.
                    </p>
                    <button
                      type="button"
                      className="button-inline mt-2"
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
                      disabled={isUploading}
                    />
                  </label>
                </div>

                {fileError && (
                  <div className="accent-block border-danger">
                    <p className="font-mono text-xs uppercase tracking-[0.12em] text-danger">
                      {fileError}
                    </p>
                  </div>
                )}

                {selectedFile && (
                  <div className="space-y-3">
                    <div className="brutalist-card">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                          <div className="min-w-0">
                            <p className="font-mono text-sm truncate">{selectedFile.name}</p>
                            <p className="caption text-xs text-muted">{formatFileSize(selectedFile.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            if (inputRef.current) {
                              inputRef.current.value = "";
                            }
                            setFileError(null);
                          }}
                          className="button-inline flex-shrink-0"
                          disabled={isUploading}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {isUploading && (
                      <div className="brutalist-card">
                        <div className="flex justify-between mb-3">
                          <span className="font-mono text-sm">Uploading...</span>
                          <span className="font-mono text-sm font-bold">{uploadProgress}%</span>
                        </div>
                        <div
                          style={{
                            border: "2px solid var(--color-border)",
                            height: "12px",
                            background: "rgba(29, 74, 255, 0.12)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${uploadProgress}%`,
                              height: "100%",
                              background: "var(--color-info)",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {uploadError && !isUploading && (
                      <div className="accent-block border-danger">
                        <p className="font-mono text-xs uppercase tracking-[0.12em] text-danger">
                          {uploadError}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleFileUpload}
                        disabled={!selectedFile || isUploading}
                        className="button-inline flex-1"
                        style={{
                          opacity: !selectedFile || isUploading ? 0.5 : 1,
                          pointerEvents: !selectedFile || isUploading ? "none" : "auto",
                        }}
                      >
                        {isUploading ? `Uploading ${uploadProgress}%` : "Upload Video"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          if (inputRef.current) {
                            inputRef.current.value = "";
                          }
                          setFileError(null);
                        }}
                        className="button-inline"
                        disabled={isUploading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // URL Upload Tab
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <div className="link-panel">
                  <span className="meta-label">Paste a public video link</span>
                  <div className="flex flex-col gap-2 sm:flex-row mt-2">
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=…"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        setUrlError(null);
                        setUrlMessage(null);
                      }}
                      disabled={isProcessingUrl}
                      className="input-field flex-1"
                    />
                    <button
                      type="submit"
                      disabled={isProcessingUrl}
                      className="button-inline flex-shrink-0"
                      style={{
                        opacity: isProcessingUrl ? 0.5 : 1,
                        pointerEvents: isProcessingUrl ? "none" : "auto",
                      }}
                    >
                      {isProcessingUrl ? "Processing..." : "Use Link"}
                    </button>
                  </div>
                </div>

                {urlMessage && (
                  <div className="accent-block border-info">
                    <p className="font-mono text-xs uppercase tracking-[0.12em] text-info">
                      {urlMessage}
                    </p>
                  </div>
                )}

                {urlError && (
                  <div className="accent-block border-danger">
                    <p className="font-mono text-xs uppercase tracking-[0.12em] text-danger">
                      {urlError}
                    </p>
                  </div>
                )}

                {/* <p className="caption text-center text-sm text-muted">
                  Currently supports YouTube links. Other video platforms coming soon.
                </p> */}
              </form>
            )}
          </div>

          {/* Footer Info */}
          <div className="border-t-4 border-border bg-accent-thin px-4 py-2">
            
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(dialogNode, document.body);
}
