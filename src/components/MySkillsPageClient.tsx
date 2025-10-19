"use client";

import { useState } from "react";
import { VideoCard } from "./VideoCard";
import { VideoWatchDialog } from "./VideoWatchDialog";

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

interface MySkillsPageClientProps {
  videos: VideoRow[];
}

export function MySkillsPageClient({ videos }: MySkillsPageClientProps) {
  const [isWatchDialogOpen, setIsWatchDialogOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>("");

  const handleWatchVideo = (videoId: string, videoTitle: string) => {
    setSelectedVideoId(videoId);
    setSelectedVideoTitle(videoTitle);
    setIsWatchDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsWatchDialogOpen(false);
    setSelectedVideoId("");
    setSelectedVideoTitle("");
  };

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <VideoCard 
            key={v.id} 
            video={v} 
            onWatchVideo={handleWatchVideo}
          />
        ))}
      </div>
      
      {/* Video Watch Dialog - rendered at page level */}
      <VideoWatchDialog
        isOpen={isWatchDialogOpen}
        onClose={handleCloseDialog}
        videoId={selectedVideoId}
        videoTitle={selectedVideoTitle}
      />
    </>
  );
}
