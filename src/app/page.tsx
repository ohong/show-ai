"use client";

import { PageHeader } from "@/components/PageHeader";
import { VideoUploadDialog } from "@/components/VideoUploadDialog";
import { useState } from "react";

export default function Page() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  return (
    <main className="grid-overlay min-h-screen">
      <PageHeader />
      
      {/* Main Upload Section */}
      <section className="border-y-4 border-border bg-background py-20">
        <div className="layout-shell">
          <div className="stack items-center gap-6 text-center">
            <h2 className="section-heading">Upload Your Tutorial</h2>
            <p className="caption max-w-2xl">
              Transform your screen recordings into AI agent skills. Upload a video or share a YouTube link to get started.
            </p>
            <button
              onClick={() => setIsUploadDialogOpen(true)}
              className="button-inline text-lg px-8 py-4"
            >
              Upload Video
            </button>
          </div>
        </div>
      </section>
      
      <footer className="border-t-4 border-border bg-background py-12">
        <div className="layout-shell flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="font-display text-lg uppercase tracking-[0.08em]">
              Ready to turn tutorials into agent skills?
            </p>
            <p className="caption max-w-xl text-sm">
              Upload a recording today and leave with a transparent, repeatable skill bundle your
              whole team can trust.
            </p>
          </div>
          <button
            onClick={() => setIsUploadDialogOpen(true)}
            className="button-inline"
          >
            Get started
          </button>
        </div>
      </footer>
      <VideoUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
      />
    </main>
  );
}
