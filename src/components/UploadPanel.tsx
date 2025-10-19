"use client";

import { useRef, useState } from "react";

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

export function UploadPanel() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    handleFileSelect(event.dataTransfer.files);
  };

  return (
    <section id="upload" className="border-y-4 border-border bg-background">
      <div className="layout-shell py-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="stack">
            <div className="stack">
              <h2 className="section-heading">Upload Workspace</h2>
              <p className="caption max-w-xl">
                Step 01 keeps the run deterministic. We hash first, dedupe against Supabase, then
                stream frames to Gemini. You decide when the footage leaves the device.
              </p>
            </div>
            <label
              htmlFor="video-upload"
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
              }}
              onDrop={handleDrop}
              className="upload-panel"
            >
              <div className="stack">
                <span className="meta-label">Step 01</span>
                <p className="font-display text-xl tracking-[0.04em]">
                  Drop a recording or pull from YouTube
                </p>
                <p className="caption">
                  MP4, MOV, WEBM up to 30 minutes. Files stay local until the hash lookup confirms we
                  need to upload.
                </p>
              </div>
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
          </div>
          <aside className="brutalist-card stack">
            <h3 className="font-display text-lg tracking-[0.04em]">Upload Checklist</h3>
            <ul className="bullet-grid text-sm">
              <li>SHA-256 hash computed before any network call</li>
              <li>Supabase index returns cache hit in &lt; 150 milliseconds</li>
              <li>Warn operators about videos &gt; 2 GB prior to transfer</li>
              <li>Persist original links and timestamps as metadata</li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
