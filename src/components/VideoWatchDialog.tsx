"use client";

import { useState, useEffect } from "react";
import { X, Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from "lucide-react";

interface VideoWatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
}

// Helper function to convert YouTube URLs to embed format
const getYouTubeEmbedUrl = (url: string): string => {
  const videoId = url.includes('youtu.be/') 
    ? url.split('youtu.be/')[1].split('?')[0]
    : url.includes('youtube.com/watch?v=') 
    ? url.split('v=')[1].split('&')[0]
    : url.includes('youtube.com/embed/')
    ? url.split('embed/')[1].split('?')[0]
    : null;
  
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

export function VideoWatchDialog({ isOpen, onClose, videoId, videoTitle }: VideoWatchDialogProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen && videoId) {
      fetchVideoUrl();
    }
  }, [isOpen, videoId]);

  // Handle ESC key to close dialog
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const fetchVideoUrl = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/video/watch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get video URL');
      }

      setVideoUrl(result.data.videoUrl);
    } catch (err) {
      console.error('Error fetching video URL:', err);
      setError(err instanceof Error ? err.message : 'Failed to load video');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    const video = document.getElementById('watch-video') as HTMLVideoElement;
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleMuteToggle = () => {
    const video = document.getElementById('watch-video') as HTMLVideoElement;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const handleFullscreen = () => {
    const video = document.getElementById('watch-video') as HTMLVideoElement;
    if (video) {
      if (!document.fullscreenElement) {
        video.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-background border-2 border-border rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-mono text-lg font-medium truncate">{videoTitle}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent-thin rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          {isLoading && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading video...</p>
            </div>
          )}

          {error && (
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchVideoUrl}
                className="button-inline"
              >
                Retry
              </button>
            </div>
          )}

          {videoUrl && !isLoading && !error && (
            <div className="relative w-full max-w-3xl">
              {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                <iframe
                  src={getYouTubeEmbedUrl(videoUrl)}
                  className="w-full aspect-video rounded-md"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  id="watch-video"
                  src={videoUrl}
                  controls
                  className="w-full h-auto rounded-md"
                  onEnded={handleVideoEnded}
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                />
              )}
              
              {/* Custom Controls Overlay (optional) */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePlayPause}
                    className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={handleMuteToggle}
                    className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
                
                <button
                  onClick={handleFullscreen}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Video ID: {videoId}</span>
            <div className="flex items-center gap-4">
              <span>Press ESC to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
