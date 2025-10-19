"use client"

import { useState } from "react"
import Image from "next/image"
import { VideoWatchDialog } from "@/components/VideoWatchDialog"
import { PurchaseDialog } from "@/components/PurchaseDialog"

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
  user_first_name: string | null
  user_last_name: string | null
  user_email: string | null
  user_image_url: string | null
  is_purchased?: boolean
  purchase_date?: string
}

interface MarketplaceVideoCardProps {
  video: MarketplaceVideo
  viewMode: "grid" | "list"
}

export function MarketplaceVideoCard({ video, viewMode }: MarketplaceVideoCardProps) {
  const [isWatchDialogOpen, setIsWatchDialogOpen] = useState(false)
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)

  const title = video.youtube_title || video.file_name || "Untitled Skill"
  const thumbnail = video.youtube_thumbnail_url || "/simple-logo.png"
  const creatorName = `${video.user_first_name || ""} ${video.user_last_name || ""}`.trim() || "Anonymous"
  const duration = video.youtube_duration ? formatDuration(video.youtube_duration) : null
  const price = video.price_per_access

  const handlePurchase = () => {
    if (video.is_purchased) {
      setIsWatchDialogOpen(true)
    } else {
      setIsPurchaseDialogOpen(true)
    }
  }

  if (viewMode === "list") {
    return (
      <>
        <div className="accent-block p-4 hover:bg-accent-thin transition-colors">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="relative w-24 h-16 bg-border rounded overflow-hidden">
                <Image
                  src={thumbnail}
                  alt={title}
                  fill
                  className="object-cover"
                />
                {duration && (
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                    {duration}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="font-mono text-base font-bold truncate">{title}</h3>
                  <p className="caption text-xs">by {creatorName}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg font-bold">${price.toFixed(2)}</div>
                  {video.is_purchased && (
                    <div className="caption text-xs text-green-600">✓ Purchased</div>
                  )}
                </div>
              </div>
              
              {video.description && (
                <p className="caption text-xs mb-2 line-clamp-2">{video.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs caption">
                  <span>{new Date(video.created_at).toLocaleDateString()}</span>
                  <span>{video.source_type.toUpperCase()}</span>
                  {video.is_processed && (
                    <span className="text-green-600">✓ Processed</span>
                  )}
                </div>
                
                <button
                  onClick={handlePurchase}
                  className={`px-3 py-1 text-xs font-mono border transition-colors ${
                    video.is_purchased
                      ? "border-green-600 bg-green-50 text-green-700 hover:bg-green-100"
                      : "border-accent bg-accent-thin hover:bg-accent"
                  }`}
                >
                  {video.is_purchased ? "Watch" : `Purchase $${price.toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>
        </div>

        <VideoWatchDialog
          isOpen={isWatchDialogOpen}
          onClose={() => setIsWatchDialogOpen(false)}
          videoId={video.id}
          videoTitle={title}
        />

        <PurchaseDialog
          isOpen={isPurchaseDialogOpen}
          onClose={() => setIsPurchaseDialogOpen(false)}
          video={video}
          onSuccess={() => {
            setIsPurchaseDialogOpen(false)
            // Refresh the page or update state
            window.location.reload()
          }}
        />
      </>
    )
  }

  return (
    <>
      <div className="accent-block p-3 hover:bg-accent-thin transition-colors">
        <div className="relative mb-3">
          <div className="relative w-full h-32 bg-border rounded overflow-hidden">
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover"
            />
            {duration && (
              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                {duration}
              </div>
            )}
            {video.is_purchased && (
              <div className="absolute top-1 right-1 bg-green-600 text-white text-xs px-1 py-0.5 rounded">
                ✓
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div>
            <h3 className="font-mono text-sm font-bold mb-1 line-clamp-2">{title}</h3>
            <p className="caption text-xs">by {creatorName}</p>
          </div>
          
          {video.description && (
            <p className="caption text-xs line-clamp-2">{video.description}</p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="font-mono text-lg font-bold">${price.toFixed(2)}</div>
            <button
              onClick={handlePurchase}
              className={`px-3 py-1 text-xs font-mono border transition-colors ${
                video.is_purchased
                  ? "border-green-600 bg-green-50 text-green-700 hover:bg-green-100"
                  : "border-accent bg-accent-thin hover:bg-accent"
              }`}
            >
              {video.is_purchased ? "Watch" : "Purchase"}
            </button>
          </div>
          
          <div className="flex items-center justify-between text-xs caption">
            <span>{new Date(video.created_at).toLocaleDateString()}</span>
            <span>{video.source_type.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <VideoWatchDialog
        isOpen={isWatchDialogOpen}
        onClose={() => setIsWatchDialogOpen(false)}
        videoId={video.id}
        videoTitle={title}
      />

      <PurchaseDialog
        isOpen={isPurchaseDialogOpen}
        onClose={() => setIsPurchaseDialogOpen(false)}
        video={video}
        onSuccess={() => {
          setIsPurchaseDialogOpen(false)
          // Refresh the page or update state
          window.location.reload()
        }}
      />
    </>
  )
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}
