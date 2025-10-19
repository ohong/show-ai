# Unified Video Upload Dialog - Migration Guide

## Overview

We've successfully unified all video upload functionality into a single, robust `VideoUploadDialog` component. This replaces the previous scattered upload UI components and pages with a modern modal-based approach.

## What Changed

### ❌ Removed/Deprecated

- **`UploadPanel` component** - Full-page upload interface (still exists but no longer used)
- **Separate `/upload-video` page layout** - No longer needed as dedicated upload page
- **Multiple upload state managers** - Consolidated into single dialog component

### ✅ Added/Updated

- **`VideoUploadDialog` component** - New unified modal dialog (`src/components/VideoUploadDialog.tsx`)
- **Updated root page** (`src/app/page.tsx`) - Now opens dialog with button trigger
- **Updated upload page** (`src/app/upload-video/page.tsx`) - Uses dialog instead of full-page UI
- **Documentation** - Comprehensive usage guide included

## Migration Steps

### For Existing Pages

If you have other pages using `UploadPanel`, update them like this:

**Before:**
```tsx
import { UploadPanel } from "@/components/UploadPanel";

export default function MyPage() {
  return (
    <main>
      <UploadPanel />
    </main>
  );
}
```

**After:**
```tsx
"use client";

import { VideoUploadDialog } from "@/components/VideoUploadDialog";
import { useState } from "react";

export default function MyPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <main>
        <button onClick={() => setIsOpen(true)}>
          Upload Video
        </button>
      </main>
      
      <VideoUploadDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => {
          // Handle success (refresh list, show toast, etc.)
        }}
      />
    </>
  );
}
```

## Component API

### Props

```tsx
interface VideoUploadDialogProps {
  isOpen: boolean;        // Controls visibility
  onClose: () => void;    // Called when dialog closes
  onSuccess?: () => void; // Optional success callback
}
```

### Features

✅ **File Upload**
- Drag-and-drop support
- File picker button
- Real-time progress tracking
- File type & size validation

✅ **YouTube URL Processing**
- URL validation
- YouTube detection
- Processing status updates

✅ **Robustness**
- Comprehensive error handling
- State auto-cleanup
- Keyboard shortcuts (ESC to close)
- Click-outside to close
- Proper accessibility support

## State Management

The dialog component manages all internal state:
- ✅ File selection & validation
- ✅ Upload progress
- ✅ Error messages
- ✅ URL input & processing
- ✅ Loading states

**You only control:** `isOpen`, `onClose`

**No prop drilling needed** - all upload logic is encapsulated.

## File Organization

```
src/
├── app/
│   ├── page.tsx                    # ✅ Updated: Uses dialog
│   └── upload-video/
│       └── page.tsx                # ✅ Updated: Uses dialog
└── components/
    ├── VideoUploadDialog.tsx        # ✅ NEW: Unified dialog component
    ├── VIDEO_UPLOAD_DIALOG.md       # ✅ NEW: Documentation
    ├── UploadPanel.tsx              # ⚠️ Deprecated (kept for reference)
    └── VideoUpload.tsx              # ⚠️ Deprecated (kept for reference)
```

## Updated Pages

### Root Page (`/`)
- **Before**: Showed full `UploadPanel` section
- **After**: Minimal footer with "Get started" button that opens dialog
- **Benefit**: Cleaner homepage, upload moved to dedicated page/dialog

### Upload Page (`/upload-video`)
- **Before**: Full-page upload interface
- **After**: Heading with button that opens dialog
- **Benefit**: Consistent with root page, same dialog used everywhere

## Usage Examples

### Basic Usage
```tsx
const [isOpen, setIsOpen] = useState(false);

<VideoUploadDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>
```

### With Success Handling
```tsx
const handleSuccess = async () => {
  await refreshVideoList();
  showNotification("Video uploaded!");
};

<VideoUploadDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSuccess={handleSuccess}
/>
```

### Multiple Buttons Triggering Same Dialog
```tsx
const [isOpen, setIsOpen] = useState(false);

return (
  <>
    <button onClick={() => setIsOpen(true)}>Upload</button>
    <MoreMenu>
      <button onClick={() => setIsOpen(true)}>Upload Here</button>
    </MoreMenu>
    
    <VideoUploadDialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    />
  </>
);
```

## Benefits

1. **Consistency**: Same upload experience everywhere
2. **Maintainability**: Single source of truth for upload logic
3. **Reusability**: Easy to add upload button to any page
4. **Robustness**: Centralized error handling & state management
5. **UX**: Modal dialog doesn't require page navigation
6. **Performance**: Lazy-loaded, only renders when needed

## Backward Compatibility

- Old components (`UploadPanel`, `VideoUpload`) are still available
- Can be removed later after confirming no other pages use them
- Documentation kept in place for reference

## Known Limitations & Todos

- Currently one upload at a time (queuing coming soon)
- Only YouTube URLs supported (extensible for other platforms)
- File size limit based on time estimate (can be customized)

## Troubleshooting

### Dialog not opening?
- Ensure `isOpen` state is connected
- Check `onClick` handler is calling setter correctly
- Verify component is imported

### Upload failing?
- Check API endpoints are available
- Review browser console for detailed errors
- Verify file size isn't exceeding limits

### Styling issues?
- Ensure global CSS is loaded (`src/app/globals.css`)
- Check CSS custom properties are defined
- Verify Tailwind is processing the component

## Need Help?

Refer to `src/components/VIDEO_UPLOAD_DIALOG.md` for:
- Detailed API documentation
- Complete feature list
- Error handling details
- Accessibility features
- Future enhancement ideas
