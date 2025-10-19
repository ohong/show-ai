import { SiteNav } from "@/components/SiteNav"
import { CustomUserButton } from "@/components/CustomUserButton"
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"

export default function PurchaseFailurePage() {
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

      <div className="layout-shell py-6">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-6">
            {/* Failure Header */}
            <div className="text-center space-y-2">
              <div className="text-6xl mb-4">❌</div>
              <h1 className="font-display text-3xl tracking-[0.05em] text-red-600">
                Payment Failed
              </h1>
              <p className="caption text-lg">
                We encountered an issue processing your payment.
              </p>
            </div>

            {/* Error Details */}
            <div className="accent-block p-6 space-y-4">
              <h2 className="font-mono text-xl font-bold">What Happened?</h2>
              <p className="caption text-sm">
                Your payment could not be processed. This might be due to:
              </p>
              <ul className="space-y-2 caption text-sm ml-4">
                <li>• Insufficient funds in your account</li>
                <li>• Card declined by your bank</li>
                <li>• Incorrect payment information</li>
                <li>• Network connectivity issues</li>
              </ul>
            </div>

            {/* Next Steps */}
            <div className="accent-block p-6 space-y-4">
              <h2 className="font-mono text-xl font-bold">What You Can Do</h2>
              <ul className="space-y-2 caption text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>
                  <span>Try the purchase again with a different payment method</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>
                  <span>Contact your bank if the issue persists</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>
                  <span>Reach out to our support team for assistance</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link href="/marketplace" className="button-inline flex-1 text-center">
                Try Again
              </Link>
              <Link href="/" className="button-inline flex-1 text-center">
                Back to Home
              </Link>
            </div>

            {/* Support Info */}
            <div className="text-center caption text-sm">
              <p>Need help? Contact us at support@watchandlearn.com</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
