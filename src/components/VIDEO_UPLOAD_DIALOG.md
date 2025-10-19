# VideoUploadDialog Component

A robust, unified video upload dialog component that handles both file uploads and YouTube URL submissions. The component is designed to be reusable across the entire application with a single button trigger.

## Features

### ✨ Core Features

- **Unified Dialog**: Single, modal-based component for all video upload scenarios
- **Dual Upload Modes**: 
  - File upload with drag-and-drop support
  - YouTube URL processing
- **Robust Error Handling**: Comprehensive validation and error messages for both modes
- **Upload Progress**: Real-time progress tracking with percentage display
- **State Management**: Automatic cleanup and reset of all states on open/close
- **Accessibility**: Keyboard shortcuts (ESC to close), proper ARIA labels, and semantic HTML

### 🛡️ Robustness Features

1. **File Validation**
   - File type validation (MP4, MOV, WEBM only)
   - File size validation (≤30 minutes estimated)
   - Clear error messages for unsupported formats

2. **Upload Process**
   - 3-step upload pipeline: Get presigned URL → Upload to S3 → Record in Supabase
   - Graceful error handling at each step
   - Partial upload recovery (S3 upload success tracked separately from DB record)

3. **URL Processing**
   - URL format validation (http/https protocols only)
   - YouTube URL detection and special handling
   - Informative processing messages

4. **User Experience**
   - Drag-and-drop support with visual feedback
   - Progress bar with percentage
   - Tab-based interface for mode switching
   - Outside click to close + ESC key support
   - Automatic dialog close on success
   - All loading states properly managed

5. **State Management**
   - Separate state tracking for file upload vs URL upload
   - Auto-reset on dialog close
   - Prevents state leakage between sessions

## Usage

### Basic Setup

```tsx
"use client";

import { useState } from "react";
import { VideoUploadDialog } from "@/components/VideoUploadDialog";

export default function MyPage() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsUploadDialogOpen(true)}>
        Upload Video
      </button>

      <VideoUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onSuccess={() => {
          // Optionally handle success (refresh data, show toast, etc)
          console.log("Video uploaded successfully!");
        }}
      />
    </>
  );
}
```

### With Success Callback

```tsx
const handleUploadSuccess = async () => {
  // Refresh your video list, update UI, etc
  await refreshVideoList();
  showToast("Video uploaded successfully!");
};

<VideoUploadDialog
  isOpen={isUploadDialogOpen}
  onClose={() => setIsUploadDialogOpen(false)}
  onSuccess={handleUploadSuccess}
/>
```

## Props

```tsx
interface VideoUploadDialogProps {
  isOpen: boolean;        // Controls dialog visibility
  onClose: () => void;    // Called when dialog should close
  onSuccess?: () => void; // Optional callback on successful upload/processing
}
```

## Upload Flow

### File Upload
1. User selects file via button or drag-and-drop
2. File validation (type & size)
3. API request for presigned S3 URL
4. Upload file to S3 with progress tracking
5. Record video metadata in Supabase
6. Close dialog on success

### YouTube URL Upload
1. User pastes YouTube URL
2. URL validation (format & protocol)
3. YouTube detection and special processing
4. API request to process YouTube video
5. Record video metadata in Supabase
6. Close dialog on success

## Error Handling

The component handles various error scenarios gracefully:

- **Network errors**: Clear error messages with retry capability
- **File validation**: Immediate feedback on unsupported formats/sizes
- **Upload failures**: Distinguishes between S3 upload and DB record failures
- **URL processing**: Specific messages for invalid URLs vs unsupported platforms

## Styling

The component uses the project's brutalist design system and CSS custom properties:

- Colors: `--color-background`, `--color-border`, `--color-danger`, `--color-info`, etc.
- Typography: Uses existing `.font-display`, `.caption`, `.meta-label` classes
- Components: `.button-inline`, `.input-field`, `.brutalist-card`, `.link-panel` classes

## Keyboard Shortcuts

- **ESC**: Close dialog (only when open)
- **Enter**: Submit URL form (auto-focus form inputs for better UX)

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (including iOS)
- Uses standard Fetch API and modern CSS features

## API Endpoints Expected

The component expects these endpoints to be available:

- `POST /api/upload/presigned-url` - Get S3 presigned URL
- `PUT {presignedUrl}` - Upload file to S3 (external)
- `POST /api/upload/record` - Record uploaded video in Supabase
- `POST /api/upload/youtube` - Process YouTube URL

## Performance Considerations

- Dialog is lazy-rendered (only renders when `isOpen={true}`)
- Upload progress uses CSS transitions for smooth 60fps animations
- All states are properly reset to prevent memory leaks
- Event listeners are properly cleaned up on unmount

## Accessibility

- ✅ Proper ARIA labels on interactive elements
- ✅ Semantic HTML structure
- ✅ Keyboard navigation support
- ✅ Clear error messages for validation
- ✅ Color contrast compliant
- ✅ Focus management within dialog

## Future Enhancements

Potential improvements for future versions:

- [ ] Multiple file uploads queue
- [ ] More video platform support (Vimeo, etc.)
- [ ] Upload resume capability
- [ ] Custom file size limits
- [ ] Video preview thumbnail
- [ ] Progress toast notifications
- [ ] Dark mode support enhancements
