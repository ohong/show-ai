"use client";

import { useRef, useState } from "react";

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

export function UploadPanel() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlMessage, setUrlMessage] = useState<string | null>(null);

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
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    handleFileSelect(event.dataTransfer.files);
  };

  const handleUrlSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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
    setUrlMessage("Link captured. We'll fetch and dedupe it when you continue.");
    setSelectedFile(null);
  };

  return (
    <section id="upload" className="border-y-4 border-border bg-background">
      <div className="layout-shell py-16">
        <div className="stack gap-12">
          <div className="stack">
            <h2 className="section-heading">Step 01 · Feed Watch &amp; Learn</h2>
            <p className="caption max-w-3xl">
              Pick the source that is easiest for your team. We hash first, dedupe against Supabase,
              and only upload what is needed so you can move on to the trace with confidence.
            </p>
          </div>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="grid gap-6 lg:grid-cols-2">
              <label
                htmlFor="video-upload"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "copy";
                }}
                onDrop={handleDrop}
                className="brutalist-card upload-panel stack"
              >
                <span className="meta-label">Option A · From your device</span>
                <p className="font-display text-lg tracking-[0.04em]">
                  Upload a recording (MP4, MOV, WEBM)
                </p>
                <p className="caption text-sm">
                  Best for internal walkthroughs. We hash locally first so duplicates never leave your
                  machine.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    className="button-inline"
                    onClick={() => inputRef.current?.click()}
                  >
                    Choose File
                  </button>
                  <span className="font-mono text-xs text-muted">…or drag into this panel</span>
                </div>
                <input
                  id="video-upload"
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  onChange={(event) => handleFileSelect(event.target.files)}
                />
                {selectedFile && (
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-info">
                    Selected ► {selectedFile.name} ·{" "}
                    {(selectedFile.size / (1024 * 1024)).toFixed(1)}MB
                  </p>
                )}
                {error && (
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-danger">{error}</p>
                )}
              </label>
              <form onSubmit={handleUrlSubmit} className="brutalist-card stack">
                <span className="meta-label">Option B · From a link</span>
                <p className="font-display text-lg tracking-[0.04em]">
                  Paste a public YouTube or MP4 URL
                </p>
                <p className="caption text-sm">
                  We fetch it with yt-dlp, apply the same hash check, and store the source URL in
                  metadata for future reuse.
                </p>
                <input
                  className="input-field"
                  type="url"
                  placeholder="https://youtube.com/watch?v=…"
                  value={url}
                  onChange={(event) => {
                    setUrl(event.target.value);
                    setUrlError(null);
                    setUrlMessage(null);
                  }}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" className="button-inline">
                    Capture Link
                  </button>
                  <span className="font-mono text-xs text-muted">No download until you confirm</span>
                </div>
                {urlMessage && (
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-info">{urlMessage}</p>
                )}
                {urlError && (
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-danger">{urlError}</p>
                )}
              </form>
            </div>
            <aside className="brutalist-card stack">
              <h3 className="font-display text-lg tracking-[0.04em]">What happens next</h3>
              <ul className="bullet-grid text-sm">
                <li>We compute SHA-256 hashes client-side before any network call.</li>
                <li>Cache hit? We send you straight to the finished skill bundle.</li>
                <li>New footage? Frames stream into the trace within seconds.</li>
                <li>You control when to pause, review the trace, and download.</li>
              </ul>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
