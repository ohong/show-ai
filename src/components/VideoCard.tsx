"use client"

import { useState } from "react"
import Image from "next/image"

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

export function VideoCard({ video, onWatchVideo }: { video: VideoRow; onWatchVideo: (videoId: string, videoTitle: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const title =
    video.youtube_title || video.file_name || video.source_url || `Video ${video.id}`
  const thumb = video.youtube_thumbnail_url

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i]
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown date"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'ready': return 'text-green-600'
      case 'processing': return 'text-yellow-600'
      case 'failed': return 'text-red-600'
      case 'uploaded': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="accent-block">
      <div className="flex items-center gap-4">
        {thumb ? (
          <Image
            src={thumb}
            alt={title}
            width={96}
            height={54}
            className="rounded-md border-2 border-border object-cover flex-shrink-0"
          />
        ) : (
          <div className="rounded-md border-2 border-border bg-accent-thin w-[96px] h-[54px] flex-shrink-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
            </svg>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm tracking-tight truncate">{title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{video.source_type.toUpperCase()}</span>
            <span>•</span>
            <span className={getStatusColor(video.status)}>
              {video.status ?? "unknown"}
            </span>
            {video.processing_status && video.processing_status !== video.status && (
              <>
                <span>•</span>
                <span className="text-yellow-600">
                  {video.processing_status}
                </span>
              </>
            )}
            {video.youtube_duration && (
              <>
                <span>•</span>
                <span>{formatDuration(video.youtube_duration)}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {formatDate(video.created_at || null)}
            </span>
            {video.file_size && (
              <>
                <span>•</span>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(video.file_size)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Watch Skill Button - always visible */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWatchVideo(video.id, title);
            }}
            className="button-inline flex items-center gap-2 flex-1 justify-center"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 5v10l8-5-8-5z"/>
            </svg>
            Watch Skill
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-2 hover:bg-accent-thin rounded-md transition-colors"
            title={isExpanded ? "Collapse details" : "Expand details"}
          >
            <svg 
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">File Type:</span>
              <p className="font-mono">{video.file_type || "Unknown"}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Processed:</span>
              <p className={video.is_processed ? "text-green-600" : "text-yellow-600"}>
                {video.is_processed ? "Yes" : "No"}
              </p>
            </div>
            {video.source_url && (
              <div className="col-span-2">
                <span className="font-medium text-muted-foreground">Source URL:</span>
                <p className="font-mono text-xs break-all">{video.source_url}</p>
              </div>
            )}
            {video.updated_at && video.updated_at !== video.created_at && (
              <div className="col-span-2">
                <span className="font-medium text-muted-foreground">Last Updated:</span>
                <p className="font-mono text-xs">{formatDate(video.updated_at)}</p>
              </div>
            )}
          </div>
          
          {video.analysis_result && (
            <div>
              <span className="font-medium text-muted-foreground text-sm">Analysis Result:</span>
              <div className="mt-2 p-3 bg-accent-thin rounded-md">
                <p className="font-mono text-xs whitespace-pre-wrap">{video.analysis_result}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
