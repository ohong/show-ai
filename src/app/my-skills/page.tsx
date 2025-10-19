import { SiteNav } from "@/components/SiteNav"
import { MySkillsUpload } from "@/components/MySkillsUpload"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"

import { auth, currentUser } from "@clerk/nextjs/server"
import { getSupabaseUser, syncClerkUserToSupabase } from "@/lib/clerk-supabase"
import { createServerClient } from "@/lib/supabase"
import Image from "next/image"
import Link from "next/link"
import { VideoCard } from "@/components/VideoCard"

type VideoRow = {
  id: string
  user_id: string
  source_type: "s3" | "youtube" | "url"
  youtube_title: string | null
  youtube_thumbnail_url: string | null
  youtube_duration: number | null
  file_name: string | null
  file_size: number | null
  file_type: string | null
  source_url: string | null
  status: string | null
  processing_status: string | null
  is_processed: boolean
  analysis_result: string | null
  created_at?: string | null
  updated_at?: string | null
}

async function fetchUserVideos(): Promise<VideoRow[]> {
  const { userId } = await auth()
  if (!userId) {
    return []
  }

  let user = await getSupabaseUser()
  if (!user) {
    const clerk = await currentUser()
    if (!clerk) return []
    user = await syncClerkUserToSupabase(clerk)
    if (!user) return []
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("videos")
    .select(
      "id,user_id,source_type,youtube_title,youtube_thumbnail_url,youtube_duration,file_name,file_size,file_type,source_url,status,processing_status,is_processed,analysis_result,created_at,updated_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to fetch videos", error)
    return []
  }
  return data ?? []
}


export default async function MySkillsPage() {
  const videos = await fetchUserVideos()

  return (
    <main className="grid-overlay min-h-screen">
      <header className="border-b-4 border-border bg-accent-thin">
        <div className="layout-shell py-6 flex items-center justify-between">
          <SiteNav />
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
      <div className="layout-shell py-8 space-y-6">
        <div className="flex items-end justify-between">
          <h1 className="font-display text-3xl tracking-[0.05em]">My skills</h1>
          <MySkillsUpload />
        </div>

        {videos.length === 0 ? (
          <div className="accent-block">
            <p className="font-mono text-sm">No skills yet</p>
            <p className="caption text-sm">
              Upload a screen recording or add a YouTube link to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}


