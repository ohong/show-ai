"use client";

import Image from "next/image";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { SiteNav } from "./SiteNav";
import { CustomUserButton } from "./CustomUserButton";

export function PageHeader() {
  return (
    <header className="border-b-4 border-border bg-accent-thin">
      <div className="layout-shell py-16">
        <div className="mb-10 flex items-center justify-between" style={{ animation: 'fade-in-text 0.4s ease-out' }}>
          <div className="flex items-center gap-6">
            <Image
              src="/simple-logo.png"
              alt="Watch & Learn logo"
              width={96}
              height={96}
              priority
            />
            <SiteNav />
          </div>
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton>
                <button className="button-inline">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="button-inline">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <CustomUserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
        
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-start">
          <div className="stack">
            <h1 className="font-display text-4xl tracking-[0.05em] md:text-5xl" style={{ animation: 'fade-in-text 0.5s ease-out' }}>
              Teach AI agents new skills by showing, not prompting
            </h1>
            
            <p className="caption max-w-xl" style={{ animation: 'fade-in-text 0.5s ease-out 0.1s backwards' }}>
              Record your best walkthrough once and let Watch &amp; Learn document it for every agent.
              Upload a file or paste a link, review the live trace, and leave with a downloadable
              bundle your team can run immediately.
            </p>
            
            <ol className="grid gap-4 sm:grid-cols-3">
              <li className="accent-block">
                <p className="meta-label">
                  Step 1
                </p>
                <p className="font-mono text-lg tracking-tight">
                  Upload your walkthrough
                </p>
                <p className="caption text-sm">
                  Drag a file or paste a link. We hash it instantly and skip duplicates.
                </p>
              </li>
              
              <li className="accent-block">
                <p className="meta-label">
                  Step 2
                </p>
                <p className="font-mono text-lg tracking-tight">
                  Watch the AI learn
                </p>
                <p className="caption text-sm">
                  Follow the live trace and confirm every action the model records.
                </p>
              </li>
              
              <li className="accent-block">
                <p className="meta-label">
                  Step 3
                </p>
                <p className="font-mono text-lg tracking-tight">
                  Download the skill bundle
                </p>
                <p className="caption text-sm">
                  Get docs, scripts, and assets your agents can run immediately.
                </p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </header>
  );
}
