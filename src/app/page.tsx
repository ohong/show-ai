"use client";

import { PageHeader } from "@/components/PageHeader";
import { VideoUploadDialog } from "@/components/VideoUploadDialog";
import { useState, useEffect } from "react";

// Hacker-style monologues for the main page
const HACKER_MONOLOGUES = [
  "Initializing neural pathways... Building the future of AI automation.",
  "Loading skill matrix... Thousands of pre-trained agents ready to deploy.",
  "Scanning marketplace... Discover skills that transform your workflow.",
  "Processing requests... From simple tasks to complex automation chains.",
  "Building connections... Connect with developers who share your vision.",
  "Deploying solutions... Turn ideas into executable AI capabilities.",
  "Optimizing performance... Every skill refined for maximum efficiency.",
  "Establishing protocols... Secure, reliable, and scalable AI operations."
];

export default function Page() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [monologueIndex, setMonologueIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Typewriter effect for hacker monologues
  useEffect(() => {
    const currentMonologue = HACKER_MONOLOGUES[monologueIndex] || "";
    let charIndex = 0;
    let typingInterval: NodeJS.Timeout;

    const startTyping = () => {
      setIsTyping(true);
      setDisplayedText("");
      typingInterval = setInterval(() => {
        if (charIndex <= currentMonologue.length) {
          setDisplayedText(currentMonologue.slice(0, charIndex));
          charIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typingInterval);
          // Switch to next monologue after showing this one
          const nextTimeout = setTimeout(() => {
            setMonologueIndex((i) => (i + 1) % HACKER_MONOLOGUES.length);
          }, 3000);
          return () => clearTimeout(nextTimeout);
        }
      }, 30); // Slightly faster than the card version
    };

    startTyping();
    return () => clearInterval(typingInterval);
  }, [monologueIndex]);

  return (
    <main className="grid-overlay min-h-screen">
      <PageHeader />
      
      {/* Hero Section with Terminal Animation */}
      <section className="layout-shell py-16">
        <div className="brutalist-card hacker-card mb-8" style={{ animation: 'fade-in-text 0.6s ease-out 0.2s backwards' }}>
          <div className="flex items-center justify-between border-b-2 border-border pb-3 mb-6">
            <h1 className="font-display text-2xl uppercase tracking-[0.12em]">
              AI Skill Marketplace
            </h1>
            <span className="badge">Live</span>
          </div>
          
          <div className="terminal-window is-processing">
            <div className="terminal-header">/var/log/ai-marketplace</div>
            <div className="terminal-body space-y-2 min-h-[120px]">
              <p className="font-mono text-sm leading-relaxed">
                <span className="text-muted">{">"}</span> {displayedText}
                {isTyping && <span className="terminal-cursor" />}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-info rounded-full animate-pulse" style={{ animationDelay: "0s" }} />
              <div className="w-2 h-2 bg-info rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 bg-info rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
            </div>
            <p className="caption text-xs text-muted">System operational</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="brutalist-card accent-block" style={{ animation: 'fade-in-text 0.6s ease-out 0.4s backwards' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🤖</span>
              <h3 className="font-display text-lg uppercase tracking-[0.08em]">AI Agents</h3>
            </div>
            <p className="caption">
              Pre-trained agents ready to automate your workflows. From data processing to content generation.
            </p>
          </div>

          <div className="brutalist-card accent-block" style={{ animation: 'fade-in-text 0.6s ease-out 0.5s backwards' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">⚡</span>
              <h3 className="font-display text-lg uppercase tracking-[0.08em]">Instant Deploy</h3>
            </div>
            <p className="caption">
              Deploy skills instantly with our one-click integration system. No complex setup required.
            </p>
          </div>

          <div className="brutalist-card accent-block" style={{ animation: 'fade-in-text 0.6s ease-out 0.6s backwards' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🔧</span>
              <h3 className="font-display text-lg uppercase tracking-[0.08em]">Custom Skills</h3>
            </div>
            <p className="caption">
              Create and sell your own AI skills. Build a marketplace of automation solutions.
            </p>
          </div>
        </div>
      </section>
      
      <footer className="border-t-4 border-border bg-background py-12">
        <div className="layout-shell flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2" style={{ animation: 'fade-in-text 0.5s ease-out 0.7s backwards' }}>
            <p className="font-display text-lg uppercase tracking-[0.08em]">
              Discover AI Skills in Our Marketplace
            </p>
            <p className="caption max-w-xl text-sm">
              Browse and purchase pre-built AI agent skills from our community. Find the perfect automation
              for your workflow or sell your own skills to other developers.
            </p>
          </div>
          
          <button
            onClick={() => window.location.href = '/marketplace'}
            className="button-inline"
            style={{ animation: 'fade-in-text 0.5s ease-out 0.8s backwards' }}
          >
            Explore Marketplace
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
