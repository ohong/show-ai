"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VideoWatchDialog } from "./VideoWatchDialog";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

type Stage = "init" | "upload" | "processing" | "done";

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

// Creative robotic monologues - simulating AI internal thoughts
const ROBOTIC_MONOLOGUES = [
  "Initiating neural pathways... Hmm, what do I see here? A video stream. Let me parse this carefully.",
  "Analyzing frames sequentially. Frame 1... Frame 2... Okay, I'm starting to understand the pattern. This appears to be a tutorial.",
  "Processing audio layer. Listen to the voice... The user is explaining something step by step. I'm taking notes internally.",
  "Hold on, I see a button click. Let me trace that action. User moves mouse... clicks... interface responds. Got it, that's a trigger point.",
  "Transcribing speech patterns. The instructor is saying: 'Now click here to proceed.' Mapping that to the visual action I detected.",
  "Cross-referencing visual and audio data. So when the voice says 'click,' the cursor moves to that location. This is how humans interact with systems.",
  "Building a temporal map of events. Timeline: 0s - introduction, 5s - first action, 12s - second action. This sequence matters.",
  "Extracting key frames... These moments are important. I need to remember: where the cursor was, what changed, what the outcome was.",
  "Embedding spatial relationships. The button is in the upper right. The input field is center-left. Distances, positions, relative geometries matter.",
  "Processing semantic context. The user is not just clicking randomly. They're following a workflow. There's intention and logic here.",
  "Analyzing decision points. At this moment, the user had choices. They chose this path. Why? What was the trigger? Let me store this branch.",
  "Gemini is learning the interaction pattern now. It's not just data—it's a sequence of intentional actions with causality.",
  "Building a skill matrix. I now understand the prerequisites, the steps, the verification methods. This is a complete executable pattern.",
  "Compiling into a reusable skill bundle. Other agents can learn from this. They'll follow the same sequence with the same expected outcomes.",
  "Finalizing the knowledge artifact. Double-checking: Do I understand the goal? Yes. Can I execute it? Yes. Can I teach it? Absolutely ready."
];

export function InteractiveHackerCard() {
  const [stage, setStage] = useState<Stage>("init");
  const [activeTab, setActiveTab] = useState<"file" | "url">("file");

  // Upload state
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlMessage, setUrlMessage] = useState<string | null>(null);

  // Processing state
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);
  const [isProcessed, setIsProcessed] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Typewriter animation state
  const [monologueIndex, setMonologueIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Typewriter effect for monologues
  useEffect(() => {
    if (stage !== "processing") {
      setDisplayedText("");
      return;
    }

    const currentMonologue = ROBOTIC_MONOLOGUES[monologueIndex] || "";
    let charIndex = 0;
    let typingInterval: NodeJS.Timeout;

    const startTyping = () => {
      setIsTyping(true);
      typingInterval = setInterval(() => {
        if (charIndex <= currentMonologue.length) {
          setDisplayedText(currentMonologue.slice(0, charIndex));
          charIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typingInterval);
          // Switch to next monologue after showing this one
          const nextTimeout = setTimeout(() => {
            setMonologueIndex((i) => (i + 1) % ROBOTIC_MONOLOGUES.length);
          }, 2200);
          return () => clearTimeout(nextTimeout);
        }
      }, 25); // Typewriter speed
    };

    startTyping();
    return () => clearInterval(typingInterval);
  }, [stage, monologueIndex]);

  // Polling for processing completion
  useEffect(() => {
    if (stage !== "processing" || !videoId) return;
    let mounted = true;
    const interval = window.setInterval(async () => {
      try {
        const res = await fetch("/api/video/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body?.error || "Failed to fetch status");
        }
        if (!mounted) return;
        const processed: boolean = body?.data?.is_processed ?? false;
        if (processed) {
          setIsProcessed(true);
          setVideoTitle(body?.data?.title || videoTitle || "Video");
          setStage("done");
        }
      } catch (err) {
        if (!mounted) return;
        setProcessingError(err instanceof Error ? err.message : "Status error");
      }
    }, 3000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [stage, videoId, videoTitle]);

  const handleFileSelect = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError("Unsupported format. Use MP4, MOV, or WEBM.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const startProcessing = (id: string, title?: string | null) => {
    setVideoId(id);
    if (title) setVideoTitle(title);
    setMonologueIndex(0);
    setDisplayedText("");
    setStage("processing");
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    try {
      const presignedResponse = await fetch("/api/upload/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          folder: "videos",
        }),
      });
      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json().catch(() => ({}));
        throw new Error(errorData?.error || "Failed to get upload URL");
      }
      const { data } = await presignedResponse.json();
      const { presignedUrl, fileKey } = data;

      setUploadProgress(20);
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: selectedFile,
        headers: { "Content-Type": selectedFile.type },
      });
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to S3");
      }
      setUploadProgress(70);

      const recordResponse = await fetch("/api/upload/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: "s3",
          fileKey,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
        }),
      });
      const recordJson = await recordResponse.json().catch(() => ({}));
      if (!recordResponse.ok) {
        throw new Error(recordJson?.error || "Failed to record uploaded video");
      }

      setUploadProgress(100);
      const video = recordJson?.video;
      setTimeout(() => {
        setIsUploading(false);
        setSelectedFile(null);
        if (inputRef.current) inputRef.current.value = "";
        startProcessing(video?.id, video?.youtube_title || video?.file_name);
      }, 600);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
    setUrlMessage("Processing link...");
    setIsUploading(true);
    try {
      const isYouTube = /youtube\.com|youtu\.be/.test(trimmed);
      if (!isYouTube) {
        setUrlError("Currently only YouTube URLs are supported.");
        setUrlMessage(null);
        setIsUploading(false);
        return;
      }
      const response = await fetch("/api/upload/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json?.error || "Failed to process YouTube URL");
      }
      const video = json?.video;
      setUrlMessage("YouTube link accepted. Queueing processing...");
      setTimeout(() => {
        setIsUploading(false);
        setUrl("");
        setUrlMessage(null);
        startProcessing(video?.id, video?.youtube_title || video?.file_name);
      }, 600);
    } catch (err) {
      setIsUploading(false);
      setUrlMessage(null);
      setUrlError(err instanceof Error ? err.message : "Failed to process URL");
    }
  };

  const [watchOpen, setWatchOpen] = useState(false);

  return (
    <div className="brutalist-card hacker-card" style={{ minHeight: 420 }}>
      <div className="flex items-center justify-between border-b-2 border-border pb-3 mb-3">
        <h3 className="font-display text-sm uppercase tracking-[0.12em]">Interactive Demo</h3>
        <span className="badge">Live</span>
      </div>

      <SignedOut>
        <div className="stack items-start">
          <p className="caption">Sign in to try the interactive upload and processing flow.</p>
          <SignInButton>
            <button className="button-inline">Sign In</button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        {stage === "init" && (
          <div className="stack items-start">
            <div className="terminal-window">
              <div className="terminal-header">/usr/local/bin/init</div>
              <div className="terminal-body">
                <p className="font-mono text-xs">
                  {">"} Ready. Press <span className="text-info">Try now</span> to begin.
                </p>
              </div>
            </div>
            <button className="button-inline" onClick={() => setStage("upload")}>
              Try now
            </button>
          </div>
        )}

        {stage === "upload" && (
          <div className="stack">
            <div className="border-b-2 border-border flex">
              <button
                onClick={() => setActiveTab("file")}
                className={`flex-1 px-3 py-2 font-display text-xs uppercase tracking-[0.08em] border-r-2 border-border ${
                  activeTab === "file" ? "bg-accent" : "hover:bg-accent-thin"
                }`}
              >
                From Device
              </button>
              <button
                onClick={() => setActiveTab("url")}
                className={`flex-1 px-3 py-2 font-display text-xs uppercase tracking-[0.08em] ${
                  activeTab === "url" ? "bg-accent" : "hover:bg-accent-thin"
                }`}
              >
                From Link
              </button>
            </div>

            {activeTab === "file" ? (
              <div className="space-y-3">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`upload-callout transition-all ${
                    isDragOver ? "ring-2 ring-info bg-info/10" : ""
                  }`}
                >
                  <label htmlFor="interactive-video-upload" className="cursor-pointer w-full">
                    <span className="meta-label">Drop file here or click to browse</span>
                    <h4 className="font-display tracking-[0.04em] mt-1">Choose a video file</h4>
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
                      id="interactive-video-upload"
                      ref={inputRef}
                      type="file"
                      accept={ACCEPTED_TYPES.join(",")}
                      onChange={(event) => handleFileSelect(event.target.files)}
                    />
                  </label>
                </div>

                {selectedFile && (
                  <div className="space-y-2">
                    <div className="brutalist-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-sm truncate">{selectedFile.name}</p>
                          <p className="caption text-xs text-muted">{formatFileSize(selectedFile.size)}</p>
                        </div>
                        <button
                          type="button"
                          className="button-inline"
                          onClick={() => {
                            setSelectedFile(null);
                            if (inputRef.current) inputRef.current.value = "";
                            setUploadError(null);
                          }}
                          disabled={isUploading}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {isUploading && (
                      <div className="brutalist-card">
                        <div className="flex justify-between mb-2">
                          <span className="font-mono text-sm">Uploading...</span>
                          <span className="font-mono text-sm font-bold">{uploadProgress}%</span>
                        </div>
                        <div style={{ border: "2px solid var(--color-border)", height: 12, background: "rgba(29,74,255,0.12)" }}>
                          <div style={{ width: `${uploadProgress}%`, height: "100%", background: "var(--color-info)", transition: "width 0.3s ease" }} />
                        </div>
                      </div>
                    )}

                    {uploadError && !isUploading && (
                      <div className="accent-block border-danger">
                        <p className="font-mono text-xs uppercase tracking-[0.12em] text-danger">{uploadError}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleFileUpload}
                        disabled={!selectedFile || isUploading}
                        className="button-inline flex-1"
                        style={{ opacity: !selectedFile || isUploading ? 0.55 : 1 }}
                      >
                        {isUploading ? `Uploading ${uploadProgress}%` : "Upload Video"}
                      </button>
                      <button
                        type="button"
                        className="button-inline"
                        onClick={() => {
                          setSelectedFile(null);
                          if (inputRef.current) inputRef.current.value = "";
                          setUploadError(null);
                        }}
                        disabled={isUploading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleUrlSubmit} className="space-y-3">
                <div className="link-panel">
                  <span className="meta-label">Paste a YouTube link</span>
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
                      className="input-field flex-1"
                      disabled={isUploading}
                    />
                    <button type="submit" className="button-inline flex-shrink-0" disabled={isUploading}>
                      {isUploading ? "Working..." : "Use Link"}
                    </button>
                  </div>
                </div>
                {urlMessage && (
                  <div className="accent-block border-info">
                    <p className="font-mono text-xs uppercase tracking-[0.12em] text-info">{urlMessage}</p>
                  </div>
                )}
                {urlError && (
                  <div className="accent-block border-danger">
                    <p className="font-mono text-xs uppercase tracking-[0.12em] text-danger">{urlError}</p>
                  </div>
                )}
              </form>
            )}
          </div>
        )}

        {stage === "processing" && (
          <div className="stack">
            <div className="terminal-window is-processing">
              <div className="terminal-header">/var/log/neural-learning</div>
              <div className="terminal-body space-y-2 min-h-[180px]">
                <p className="font-mono text-xs leading-relaxed">
                  <span className="text-muted">{">"}</span> {displayedText}
                  {isTyping && <span className="terminal-cursor" />}
                </p>
              </div>
            </div>
            {processingError && (
              <div className="accent-block border-danger">
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-danger">{processingError}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-info rounded-full animate-pulse" style={{ animationDelay: "0s" }} />
                <div className="w-2 h-2 bg-info rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 bg-info rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
              <p className="caption text-xs text-muted">Learning in progress...</p>
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="stack">
            <div className="terminal-window success">
              <div className="terminal-header">/opt/skill/out</div>
              <div className="terminal-body">
                <p className="font-mono text-xs">
                  {">"} Build complete. <span className="text-info">{videoTitle || "Video"}</span> is ready.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="button-inline" onClick={() => window.location.href = `http://localhost:3000/execute/${videoId}`}>
                Try in action
              </button>
              <button className="button-inline" onClick={() => {
                setStage("init");
                setVideoId(null);
                setVideoTitle(null);
                setIsProcessed(false);
                setProcessingError(null);
                setSelectedFile(null);
                setUrl("");
                setMonologueIndex(0);
                setDisplayedText("");
              }}>
                Reset
              </button>
            </div>
          </div>
        )}
      </SignedIn>

      {watchOpen && videoId && (
        <VideoWatchDialog
          isOpen={watchOpen}
          onClose={() => setWatchOpen(false)}
          videoId={videoId}
          videoTitle={videoTitle || "Video"}
        />
      )}
    </div>
  );
}

