"use client";

import { SiteNav } from "@/components/SiteNav";
import { VideoUploadDialog } from "@/components/VideoUploadDialog";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { useState } from "react";

export default function UploadVideoPage() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(true);

  return (
    <main className="grid-overlay min-h-screen">
      <header className="border-b-4 border-border bg-accent-thin">
        <div className="layout-shell py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Image
              src="/simple-logo.png"
              alt="Watch & Learn logo"
              width={48}
              height={48}
              priority
            />
            <SiteNav />
          </div>
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton>
                <button className="button-inline">Sign In</button>
              </SignInButton>
              <SignUpButton>
                <button className="button-inline">Sign Up</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>
      <div className="layout-shell py-20">
        <div className="stack items-center gap-6 text-center">
          <h2 className="section-heading">Upload your walkthrough</h2>
          <p className="caption max-w-2xl">
            Drag a recording or share a link. We hash it instantly, skip duplicates, and keep your
            footage local until it is needed.
          </p>
          <button
            onClick={() => setIsUploadDialogOpen(true)}
            className="button-inline"
          >
            Open Upload Dialog
          </button>
        </div>
      </div>
      <VideoUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
      />
    </main>
  );
}
