"use client";

import { useState } from "react";
import { VideoUploadDialog } from "./VideoUploadDialog";

export function MySkillsUpload() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const handleUploadSuccess = () => {
    // Refresh the page to show the new video
    window.location.reload();
  };

  return (
    <>
      <button 
        onClick={() => setIsUploadDialogOpen(true)}
        className="button-inline"
      >
        Upload new
      </button>
      
      <VideoUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </>
  );
}
