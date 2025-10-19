"use client";

import Image from "next/image";
import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { SiteNav } from "./SiteNav";
import { CustomUserButton } from "./CustomUserButton";
import { InteractiveHackerCard } from "./InteractiveHackerCard";

export function PageHeader() {
  return (
    <header className="border-b-4 border-border bg-accent-thin">
      <div className="layout-shell py-16">
        <div className="mb-10 flex items-center justify-between" style={{ animation: 'fade-in-text 0.4s ease-out' }}>
          <div className="flex items-center gap-6">
            <Link href="/">
              <Image
                src="/simple-logo.png"
                alt="Watch & Learn logo"
                width={96}
                height={96}
                priority
              />
            </Link>
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
        
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="stack">
            <h1 className="font-display text-4xl tracking-[0.05em] md:text-5xl glitch-text glitch-transform" style={{ animation: 'fade-in-text 0.5s ease-out' }}>
              Teach AI agents skills by{" "}
              <span className="hero-highlight">showing</span>, not prompting
            </h1>
            
            <p className="caption max-w-xl mx-auto" style={{ animation: 'fade-in-text 0.5s ease-out 0.1s backwards' }}>
              Record yourself completing a task once. Let Watch &amp; Learn document it for AI agents.
              Upload a file or paste a link, get a new skill you can download, deploy to MCP, or run immediately.
            </p>
            
          </div>
          <div className="stack">
            <InteractiveHackerCard />
          </div>
        </div>
      </div>
    </header>
  );
}
