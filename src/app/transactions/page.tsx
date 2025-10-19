import { SiteNav } from "@/components/SiteNav"
import { CustomUserButton } from "@/components/CustomUserButton"
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs"
import { TransactionsClient } from "@/components/TransactionsClient"
import Image from "next/image"

function TransactionsContent() {
  return (
    <main className="grid-overlay min-h-screen">
      <header className="border-b-4 border-border bg-accent-thin">
        <div className="layout-shell py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Image
              src="/simple-logo.png"
              alt="Watch & Learn logo"
              width={64}
              height={64}
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
              <CustomUserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      <div className="layout-shell py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl tracking-[0.05em] mb-2">
            Transaction History
          </h1>
          <p className="caption max-w-2xl">
            View and manage your purchase history. Track completed transactions, 
            monitor pending payments, and access your purchased skills.
          </p>
        </div>

        <TransactionsClient />
      </div>
    </main>
  )
}


export default function TransactionsPage() {
  return (
    <>
      <SignedIn>
        <TransactionsContent />
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Sign in to view your transactions</h1>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to view your purchase history.
            </p>
            <SignInButton>
              <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
    </>
  )
}
