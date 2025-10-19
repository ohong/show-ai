import { SiteNav } from "@/components/SiteNav"
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs"
import { CustomUserButton } from "@/components/CustomUserButton"
import { auth, currentUser } from "@clerk/nextjs/server"
import { getSupabaseUser, syncClerkUserToSupabase } from "@/lib/clerk-supabase"
import { createServerClient } from "@/lib/supabase"
import Image from "next/image"
import { MarketplaceClient } from "@/components/MarketplaceClient"

type MarketplaceVideo = {
  id: string
  user_id: string
  source_type: "s3" | "youtube" | "url"
  youtube_title: string | null
  youtube_thumbnail_url: string | null
  youtube_duration: number | null
  file_name: string | null
  file_type: string | null
  source_url: string | null
  status: string | null
  processing_status: string | null
  is_processed: boolean
  analysis_result: string | null
  description: string | null
  is_monetized: boolean
  price_per_access: number
  created_at: string
  updated_at: string
  // User info
  user_first_name: string | null
  user_last_name: string | null
  user_email: string | null
  user_image_url: string | null
  // Purchase info (if user is logged in)
  is_purchased?: boolean
  purchase_date?: string
}

async function fetchMarketplaceVideos(): Promise<MarketplaceVideo[]> {
  const supabase = createServerClient()
  
  // Get current user info for purchase status
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
    // User not authenticated, continue without purchase info
  }

  const { data, error } = await supabase
    .from("videos")
    .select(`
      id,
      user_id,
      source_type,
      youtube_title,
      youtube_thumbnail_url,
      youtube_duration,
      file_name,
      file_type,
      source_url,
      status,
      processing_status,
      is_processed,
      analysis_result,
      description,
      is_monetized,
      price_per_access,
      created_at,
      updated_at,
      users!videos_user_id_fkey (
        first_name,
        last_name,
        email,
        image_url
      )
    `)
    .eq("is_monetized", true)
    .eq("is_processed", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to fetch marketplace videos", error)
    return []
  }

  // Get purchase status for current user if authenticated
  let purchaseStatus: Record<string, boolean> = {}
  if (currentUserId) {
    const { data: purchases } = await supabase
      .from("purchases")
      .select("video_id")
      .eq("buyer_id", currentUserId)
      .eq("payment_status", "completed")
    
    purchaseStatus = purchases?.reduce((acc, purchase) => {
      acc[purchase.video_id] = true
      return acc
    }, {} as Record<string, boolean>) || {}
  }

  return (data || []).map((video: any) => ({
    ...video,
    user_first_name: video.users?.first_name,
    user_last_name: video.users?.last_name,
    user_email: video.users?.email,
    user_image_url: video.users?.image_url,
    is_purchased: purchaseStatus[video.id] || false,
  }))
}

export default async function MarketplacePage() {
  const videos = await fetchMarketplaceVideos()

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
        <div className="mb-6">
          <h1 className="font-display text-3xl tracking-[0.05em] mb-2">
            AI Skills Marketplace
          </h1>
          <p className="caption max-w-2xl">
            Discover and purchase premium AI skills created by the community. 
            Each skill package includes step-by-step instructions, automation scripts, 
            and templates ready for AI agents to execute.
          </p>
        </div>

        <MarketplaceClient videos={videos} />
      </div>
    </main>
  )
}
