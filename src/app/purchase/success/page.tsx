import { Suspense } from "react"
import { SiteNav } from "@/components/SiteNav"
import { CustomUserButton } from "@/components/CustomUserButton"
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs"
import { auth, currentUser } from "@clerk/nextjs/server"
import { getSupabaseUser, syncClerkUserToSupabase } from "@/lib/clerk-supabase"
import { createServerClient } from "@/lib/supabase"
import Image from "next/image"
import Link from "next/link"

async function getPurchaseDetails(videoId: string) {
  const supabase = createServerClient()
  
  // Get current user
  let currentUserId: string | null = null
  try {
    const { userId } = await auth()
    if (userId) {
      let user = await getSupabaseUser()
      if (!user) {
        const clerk = await currentUser()
        if (clerk) {
          user = await syncClerkUserToSupabase(clerk)
        }
      }
      currentUserId = user?.id || null
    }
  } catch (error) {
    // User not authenticated
  }

  if (!currentUserId) {
    return null
  }

  // Get purchase details
  const { data: purchase } = await supabase
    .from("purchases")
    .select(`
      id,
      amount_paid,
      payment_status,
      created_at,
      videos!purchases_video_id_fkey (
        id,
        youtube_title,
        file_name,
        youtube_thumbnail_url,
        description,
        users!videos_user_id_fkey (
          first_name,
          last_name
        )
      )
    `)
    .eq("buyer_id", currentUserId)
    .eq("video_id", videoId)
    .eq("payment_status", "completed")
    .single()

  return purchase
}

export default async function PurchaseSuccessPage({
  searchParams,
}: {
  searchParams: { video_id?: string }
}) {
  const videoId = searchParams.video_id
  const purchase = videoId ? await getPurchaseDetails(videoId) : null

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
          {purchase ? (
            <div className="space-y-6">
              {/* Success Header */}
              <div className="text-center space-y-2">
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="font-display text-3xl tracking-[0.05em] text-green-600">
                  Payment Successful!
                </h1>
                <p className="caption text-lg">
                  Your purchase has been completed successfully.
                </p>
              </div>

              {/* Purchase Details */}
              <div className="accent-block p-6 space-y-4">
                <h2 className="font-mono text-xl font-bold">Purchase Details</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="font-mono text-sm">{purchase.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span className="font-mono font-bold">${purchase.amount_paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-600 font-bold">Completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(purchase.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Video Info */}
              {purchase.videos && (
                <div className="accent-block p-6 space-y-4">
                  <h2 className="font-mono text-xl font-bold">Your New Skill</h2>
                  
                  <div className="flex gap-4">
                    <div className="relative w-24 h-16 bg-border rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={purchase.videos.youtube_thumbnail_url || "/simple-logo.png"}
                        alt={purchase.videos.youtube_title || purchase.videos.file_name || "Skill"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-mono text-lg font-bold mb-1">
                        {purchase.videos.youtube_title || purchase.videos.file_name || "Untitled Skill"}
                      </h3>
                      <p className="caption text-sm mb-2">
                        by {purchase.videos.users?.first_name} {purchase.videos.users?.last_name}
                      </p>
                      {purchase.videos.description && (
                        <p className="caption text-sm line-clamp-2">{purchase.videos.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="accent-block p-6 space-y-4">
                <h2 className="font-mono text-xl font-bold">What's Next?</h2>
                <ul className="space-y-2 caption text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>You now have lifetime access to this skill</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Check your email for purchase confirmation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Access your skills from the My Skills page</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Link href="/my-skills" className="button-inline flex-1 text-center">
                  View My Skills
                </Link>
                <Link href="/marketplace" className="button-inline flex-1 text-center">
                  Browse More Skills
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <h1 className="font-display text-3xl tracking-[0.05em]">
                Purchase Not Found
              </h1>
              <p className="caption text-lg">
                We couldn't find the purchase details for this video.
              </p>
              <Link href="/marketplace" className="button-inline">
                Back to Marketplace
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
