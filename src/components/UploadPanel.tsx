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
      <div className="layout-shell py-20">
        <div className="stack items-center gap-6 text-center">
          <h2 className="section-heading">Upload your walkthrough</h2>
          <p className="caption max-w-2xl">
            Drag a recording or share a link. We hash it instantly, skip duplicates, and keep your
            footage local until it is needed.
          </p>
        </div>
        <div className="mx-auto mt-12 flex max-w-2xl flex-col gap-6">
          <label
            htmlFor="video-upload"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
            }}
            onDrop={handleDrop}
            className="upload-callout"
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
            />
            {selectedFile && (
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-info">
                Selected ► {selectedFile.name} · {(selectedFile.size / (1024 * 1024)).toFixed(1)}MB
              </p>
            )}
            {error && (
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-danger">{error}</p>
            )}
          </label>
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
