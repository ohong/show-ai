import Image from "next/image";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export function PageHeader() {
  return (
    <header className="border-b-4 border-border bg-accent-thin">
      <div className="layout-shell py-16">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/simple-logo.png"
              alt="Watch & Learn logo"
              width={64}
              height={64}
              priority
            />
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
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-start">
          <div className="stack">
            <h1 className="font-display text-4xl tracking-[0.05em] md:text-5xl">
              Teach AI agents new skills by showing, not prompting
            </h1>
            <p className="caption max-w-xl">
              Record your best walkthrough once and let Watch &amp; Learn document it for every agent.
              Upload a file or paste a link, review the live trace, and leave with a downloadable
              bundle your team can run immediately.
            </p>
            <ol className="grid gap-4 sm:grid-cols-3">
              <li className="accent-block">
                <p className="meta-label">Step 1</p>
                <p className="font-mono text-lg tracking-tight">Upload your walkthrough</p>
                <p className="caption text-sm">
                  Drag a file or paste a link. We hash it instantly and skip duplicates.
                </p>
              </li>
              <li className="accent-block">
                <p className="meta-label">Step 2</p>
                <p className="font-mono text-lg tracking-tight">Watch the AI learn</p>
                <p className="caption text-sm">
                  Follow the live trace and confirm every action the model records.
                </p>
              </li>
              <li className="accent-block">
                <p className="meta-label">Step 3</p>
                <p className="font-mono text-lg tracking-tight">Download the skill bundle</p>
                <p className="caption text-sm">
                  Get docs, scripts, and assets your agents can run immediately.
                </p>
              </li>
            </ol>
          </div>
          <aside className="stack border-l-4 border-border pl-6">
            <div>
              <p className="meta-label">Perfect for</p>
              <p className="font-mono text-sm">Ops, enablement, and support teams documenting UI flows</p>
            </div>
            <div>
              <p className="meta-label">Why teams switch</p>
              <p className="font-mono text-sm">
                Create repeatable agent skills without writing a single line of code
              </p>
            </div>
            <div>
              <p className="meta-label">What you receive</p>
              <p className="font-mono text-sm">Downloadable bundle plus clear instructions for agents</p>
            </div>
          </aside>
        </div>
      </div>
    </header>
  );
}
