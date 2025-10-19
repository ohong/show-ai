import { SiteNav } from "@/components/SiteNav"
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs"
import { CustomUserButton } from "@/components/CustomUserButton"
import { auth, currentUser } from "@clerk/nextjs/server"
import { getSupabaseUser, syncClerkUserToSupabase } from "@/lib/clerk-supabase"
import { createServerClient } from "@/lib/supabase"
import Image from "next/image"
import { redirect } from "next/navigation"
import { ExecutionPageClient } from "@/components/ExecutionPageClient"

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

async function fetchVideo(videoId: string): Promise<VideoRow | null> {
  const { userId } = await auth()
  if (!userId) {
    return null
  }

  let user = await getSupabaseUser()
  if (!user) {
    const clerk = await currentUser()
    if (!clerk) return null
    user = await syncClerkUserToSupabase(clerk)
    if (!user) return null
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("videos")
    .select(
      "id,user_id,source_type,youtube_title,youtube_thumbnail_url,youtube_duration,file_name,file_size,file_type,source_url,status,processing_status,is_processed,analysis_result,created_at,updated_at"
    )
    .eq("id", videoId)
    .eq("user_id", user.id)
    .single()

  if (error) {
    console.error("Failed to fetch video", error)
    return null
  }
  return data
}

export default async function ExecutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const video = await fetchVideo(id)

  if (!video) {
    redirect("/my-skills")
  }

  const title = video.youtube_title || video.file_name || video.source_url || `Skill ${video.id}`

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
        <ExecutionPageClient video={video} title={title} />
      </div>
    </main>
  )
}
