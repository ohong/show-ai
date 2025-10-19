# Frontend Scaffold Plan - Show AI

This plan covers the frontend-only implementation of Show AI's retro OS-style interface, aligned with the design system principles. No backend integration, API routes, or third-party services are included in this phase.

## Overview

Build a retro OS-themed web application using Next.js, TypeScript, and Tailwind CSS. The interface features draggable/resizable windows, a desktop metaphor with taskbar, and smooth Motion animations.

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript (.tsx files)
- **Styling:** Tailwind CSS
- **Animations:** Motion (https://motion.dev/) - only external package required
- **Fonts:** System fonts as placeholders (Matter SQ can be added later)

---

## Phase 1: Foundation & Configuration

### 1.1 Project Setup
- [ ] Initialize Next.js project with TypeScript and Tailwind CSS
- [ ] Configure `tailwind.config.ts` with custom design tokens:
  - Colors: Retro OS palette (off-white backgrounds, brand red #F54E00, accent #E5E7E0, border #D0D1C9)
  - Spacing: Generous padding/margins for retro feel
  - Border radius: Subtle ~8px for window corners
  - Font weights: Custom weights (475 for body, semibold/bold for headings)
- [ ] Install and configure Motion (https://motion.dev/)
- [ ] Set up basic app layout structure in `app/layout.tsx`

### 1.2 Design Tokens & Theme System
- [ ] Create `lib/theme/colors.ts` with light/dark mode color schemes
- [ ] Create `lib/theme/tokens.ts` with spacing, typography, and shadow definitions
- [ ] Implement theme context provider for light/dark mode switching
- [ ] Create utility functions for opacity-based color variations

---

## Phase 2: Core Layout Components

### 2.1 Desktop Environment
- [ ] **Desktop Container** (`components/Desktop.tsx`)
  - Full viewport container with speckled beige background (#EEEFE9)
  - Manage global desktop state (window positions, z-index stack)
  - Handle keyboard shortcuts via useEffect listeners
  - Support for wallpaper background patterns

  **Interactions:**
  - Click on desktop background to deselect windows
  - Keyboard shortcuts: `|` for wallpaper cycling (placeholder for now)

### 2.2 Top Navigation Bar
- [ ] **TopBar Component** (`components/TopBar.tsx`)
  - Fixed position top bar (height: ~48px)
  - Logo/branding on left
  - Navigation menu items (Product, Docs, Community, etc.)
  - Theme toggle button on right
  - Subtle border-bottom with retro styling

  **Interactions:**
  - Hover effects on menu items (subtle background change)
  - Smooth theme toggle transition
  - Active state for current page

### 2.3 Taskbar
- [ ] **Taskbar Component** (`components/Taskbar.tsx`)
  - Fixed position bottom bar (height: ~56px)
  - Left side: Minimized window icons with labels
  - Right side: Clock/status indicators (optional)
  - Subtle drop shadow

  **Interactions:**
  - Hover effects on taskbar icons (scale up slightly, background highlight)
  - Click to restore minimized windows
  - Smooth icon enter/exit animations

---

## Phase 3: Window System

### 3.1 AppWindow Component
- [ ] **AppWindow Base** (`components/AppWindow.tsx`)
  - Draggable container using Motion drag constraints
  - Resizable with corner/edge handles
  - Window chrome: title bar with controls (close, minimize, maximize)
  - Content area with scrolling
  - 1px border, ~8px border radius, drop shadow
  - Z-index management (bring to front on click)

  **Props:**
  - `title: string`
  - `defaultPosition: { x: number, y: number }`
  - `defaultSize: { width: number, height: number }`
  - `minSize: { width: number, height: number }`
  - `onClose: () => void`
  - `onMinimize: () => void`
  - `children: ReactNode`

  **Interactions:**
  - Drag window by title bar (constrain to viewport bounds)
  - Resize from corners/edges (maintain min/max sizes)
  - Snap to screen edges when dragged near them (threshold: ~20px)
  - Click anywhere on window to bring to front
  - Window control buttons:
    - Close: Fade out + scale down animation, then remove
    - Minimize: Scale down to taskbar with position animation
    - Maximize: Expand to full viewport (with margin) or restore
  - Entrance animation: Fade in + slight scale up
  - All animations smooth with spring physics

### 3.2 Window Title Bar
- [ ] **TitleBar Component** (`components/AppWindow/TitleBar.tsx`)
  - Title text (truncate if too long)
  - Window controls group (close, minimize, maximize)
  - Drag handle cursor on hover
  - Retro OS styling (matches design system)

  **Interactions:**
  - Drag cursor on hover over title area
  - Control buttons change on hover (background color change)

### 3.3 Window Resize Handles
- [ ] **ResizeHandles Component** (`components/AppWindow/ResizeHandles.tsx`)
  - Eight resize handles: 4 corners + 4 edges
  - Invisible hit areas with cursor changes
  - Resize cursors: nwse-resize, nesw-resize, ew-resize, ns-resize

  **Interactions:**
  - Cursor changes on hover over handles
  - Smooth resize with Motion drag
  - Constrain to min/max dimensions

### 3.4 Window State Management
- [ ] **Window Manager Hook** (`hooks/useWindowManager.ts`)
  - Track all open windows (id, position, size, z-index, minimized state)
  - Functions: openWindow, closeWindow, minimizeWindow, maximizeWindow, bringToFront
  - Persist state in React context
  - Calculate next z-index value
  - Track focused window

---

## Phase 4: Reusable UI Components

### 4.1 Button Component
- [ ] **OSButton** (`components/ui/OSButton.tsx`)
  - Variants: `default`, `primary`, `secondary`, `underline`
  - Sizes: `xs`, `sm`, `md`, `lg`, `xl`
  - Optional icon slots (left/right)
  - Optional badge/chip overlay

  **Styling:**
  - Default: Transparent bg, subtle border, border strengthens on hover
  - Primary: Red bg (#F54E00), black text, darker red on hover
  - Secondary: White bg, red text, subtle border
  - Active states with slight scale down

  **Interactions:**
  - Hover: Background/border color change, smooth transition
  - Active: Scale down to 0.98
  - Focus: Visible outline for accessibility
  - Disabled: Opacity 0.5, no pointer events

### 4.2 Card Component
- [ ] **Card** (`components/ui/Card.tsx`)
  - Accent background (#E5E7E0)
  - Dashed border (#D0D1C9, 1px)
  - Generous padding
  - Subtle drop shadow
  - Optional header/footer slots

  **Variants:**
  - Default: Standard card
  - Interactive: Hover lift effect (slight scale + shadow increase)

### 4.3 Progress Bar
- [ ] **ProgressBar** (`components/ui/ProgressBar.tsx`)
  - Horizontal bar with percentage fill
  - Smooth animated transitions
  - Color variants for different states (processing, complete, error)
  - Optional label/percentage display

  **Interactions:**
  - Fill animates smoothly with spring physics
  - Color pulses subtly during active processing

### 4.4 Modal/Dialog
- [ ] **Modal** (`components/ui/Modal.tsx`)
  - Centered overlay window
  - Darkened backdrop (click to close)
  - Window-style appearance (matches AppWindow chrome)
  - Optional header with icon
  - Content area
  - Footer with action buttons

  **Interactions:**
  - Backdrop fade in/out
  - Modal scale + fade entrance/exit
  - ESC key to close
  - Focus trap within modal
  - Smooth backdrop blur effect

### 4.5 Input Components
- [ ] **TextInput** (`components/ui/TextInput.tsx`)
  - Styled text input with retro border
  - Label + placeholder support
  - Error state styling
  - Focus state with border highlight

- [ ] **FileDropzone** (`components/ui/FileDropzone.tsx`)
  - Drag-and-drop area with dashed border
  - Hover state (border highlight, background tint)
  - Active drop state (stronger highlight)
  - File icon placeholder
  - File size/type display after selection

  **Interactions:**
  - Drag over: Border color change, background opacity change
  - Drop: Scale pulse animation, then show selected file
  - Click to browse: Standard file picker

### 4.6 Divider
- [ ] **Divider** (`components/ui/Divider.tsx`)
  - Light grey dashed line
  - Horizontal and vertical variants
  - Optional label (text in middle)

---

## Phase 5: Page-Specific Layouts

### 5.1 Upload Page Layout
- [ ] **Upload Window** (`components/windows/UploadWindow.tsx`)
  - Large dropzone for video upload
  - Alternative: URL input field for YouTube links
  - Tabs to switch between upload methods
  - Video format requirements display
  - File validation feedback (client-side only, no hash calculation yet)

  **Layout Structure:**
  ```
  ┌─────────────────────────────────────┐
  │ Upload Video                    ⊡ ⊟ ✕│
  ├─────────────────────────────────────┤
  │  [File Upload] [YouTube URL]        │
  │                                      │
  │  ┌───────────────────────────────┐  │
  │  │                               │  │
  │  │   Drop video file here        │  │
  │  │   or click to browse          │  │
  │  │                               │  │
  │  │   Supported: MP4, MOV, WEBM   │  │
  │  │   Max duration: 30 minutes    │  │
  │  │                               │  │
  │  └───────────────────────────────┘  │
  │                                      │
  │  [  Continue  ] (disabled)          │
  └─────────────────────────────────────┘
  ```

  **Interactions:**
  - Tab switching with underline animation
  - Dropzone hover/active states
  - Button enables when valid file selected
  - File preview shows filename, size, duration (mock)

### 5.2 Extraction Trace Page Layout
- [ ] **Extraction Window** (`components/windows/ExtractionWindow.tsx`)
  - Split view layout (60/40 or responsive)
  - Left: Video preview player (HTML5 video element, mocked for now)
  - Right: Scrollable trace panel
  - Progress bar at top showing % complete
  - Auto-scroll trace to latest entry

  **Layout Structure:**
  ```
  ┌────────────────────────────────────────────────────┐
  │ Extracting Skill                           ⊡ ⊟ ✕   │
  ├────────────────────────────────────────────────────┤
  │ ████████████░░░░░░░░░░░░░░░░░░░░░░ 45%            │
  ├──────────────────────┬─────────────────────────────┤
  │                      │                             │
  │   [Video Preview]    │  Thinking Trace:            │
  │                      │                             │
  │   [▶ Pause]          │  • [12:34] Analyzing frame  │
  │                      │  • [12:35] Detected UI...   │
  │                      │  • [12:36] Generating...    │
  │                      │  ...                        │
  │                      │  ↓ Auto-scrolling           │
  └──────────────────────┴─────────────────────────────┘
  ```

  **Interactions:**
  - Video playback controls (play/pause, seek)
  - Click trace entry to jump video to timestamp
  - Trace entries fade in as they arrive
  - Color-coded trace entries by type (analysis=blue, generation=green, etc.)
  - Auto-scroll smooth behavior
  - Pause auto-scroll when user manually scrolls up

### 5.3 Skill Review Page Layout
- [ ] **Skill Review Window** (`components/windows/SkillReviewWindow.tsx`)
  - Header with skill title and metadata
  - Tabs: Overview, SKILL.md Preview, Scripts, Templates, Assets
  - Tab content area (scrollable)
  - Footer with distribution action buttons

  **Layout Structure:**
  ```
  ┌────────────────────────────────────────────────────┐
  │ Skill: Deploy to Vercel                    ⊡ ⊟ ✕   │
  ├────────────────────────────────────────────────────┤
  │  [Overview] [SKILL.md] [Scripts] [Assets]          │
  ├────────────────────────────────────────────────────┤
  │                                                     │
  │  # Skill: Deploy to Vercel                         │
  │                                                     │
  │  ## Description                                    │
  │  Step-by-step guide to deploy a Next.js app...    │
  │                                                     │
  │  ## Prerequisites                                  │
  │  - Vercel account                                  │
  │  - Git repository                                  │
  │  ...                                               │
  │                                                     │
  ├────────────────────────────────────────────────────┤
  │  [Download Zip] [Generate MCP] [Test Skill]       │
  └────────────────────────────────────────────────────┘
  ```

  **Interactions:**
  - Tab switching with smooth underline animation
  - Markdown preview with syntax highlighting (basic styling)
  - Collapsible sections in overview
  - Action buttons with hover states
  - Copy code snippets on click

### 5.4 Execution Monitor Layout
- [ ] **Execution Monitor Window** (`components/windows/ExecutionWindow.tsx`)
  - Header with execution title and status
  - Large area for live browser screenshot
  - Bottom panel: Execution log (step checklist style)
  - Progress indicator showing current step

  **Layout Structure:**
  ```
  ┌────────────────────────────────────────────────────┐
  │ Executing: Deploy to Production            ⊡ ⊟ ✕   │
  │ Status: Running Step 3/8                           │
  ├────────────────────────────────────────────────────┤
  │                                                     │
  │           [Live Browser Screenshot]                │
  │                                                     │
  ├────────────────────────────────────────────────────┤
  │ Execution Log:                                     │
  │ ✓ Step 1: Open GitHub repository                   │
  │ ✓ Step 2: Navigate to Actions tab                  │
  │ ⟳ Step 3: Trigger deployment workflow...           │
  │   → Clicked "Run workflow" button                  │
  │   → Waiting for confirmation...                    │
  │ ⊡ Step 4: Monitor deployment progress              │
  └────────────────────────────────────────────────────┘
  ```

  **Interactions:**
  - Screenshot updates with smooth fade transitions
  - Log entries append with slide-in animation
  - Current step highlights and pulses
  - Completed steps show checkmark
  - Error states show warning icon and red highlight

---

## Phase 6: Interactive Features & Polish

### 6.1 Keyboard Shortcuts System
- [ ] **Keyboard Shortcut Manager** (`hooks/useKeyboardShortcuts.ts`)
  - Global listener for keyboard events
  - Register/unregister shortcuts
  - Prevent conflicts with input focus

  **Shortcuts to implement:**
  - `Shift + W`: Close focused window
  - `Shift + Arrow keys`: Snap focused window to edges
  - `|`: Cycle wallpaper (placeholder function)
  - `,`: Toggle display options modal
  - ESC: Close modals/deselect windows

### 6.2 Window Snapping System
- [ ] **Snap Logic** (`lib/windowSnap.ts`)
  - Detect when window is dragged near screen edges (<20px threshold)
  - Calculate snap positions (left half, right half, maximize)
  - Animate window to snap position with spring
  - Visual indicators when snap zones are activated (optional subtle overlay)

### 6.3 Theme Toggle
- [ ] **Theme Toggle Component** (`components/ThemeToggle.tsx`)
  - Button in TopBar
  - Icon shows current mode (sun/moon)
  - Smooth transition between themes
  - Persist preference in localStorage
  - Apply theme to entire app via context

  **Interactions:**
  - Click toggles with icon rotation animation
  - Background colors transition smoothly (300ms ease)
  - No flash of wrong theme on page load

### 6.4 Responsive Behavior
- [ ] **Mobile "Boring" Mode** (`components/MobileLayout.tsx`)
  - Detect mobile viewport (< 768px)
  - Switch to traditional layout (no windowing)
  - Stack pages vertically
  - Hamburger menu for navigation
  - Maintain design system aesthetics

  **Interactions:**
  - Smooth transition when resizing viewport
  - Mobile menu slides in from side
  - Buttons adapt to touch targets (larger)

### 6.5 Loading States & Skeletons
- [ ] **Skeleton Components** (`components/ui/Skeleton.tsx`)
  - Placeholder cards/bars during loading
  - Shimmer animation effect
  - Match component dimensions

- [ ] **Loading Spinner** (`components/ui/Spinner.tsx`)
  - Retro-styled spinner or dots animation
  - Color variants (primary, secondary)
  - Size variants

### 6.6 Error States
- [ ] **Error Boundary** (`components/ErrorBoundary.tsx`)
  - Catch component errors
  - Display friendly error message in window
  - Retry button

- [ ] **Error Messages** (`components/ui/ErrorMessage.tsx`)
  - Card-style error display
  - Icon + message + optional action
  - Color-coded (red accent)

---

## Phase 7: Animation Details

### 7.1 Window Animations (Motion)
- **Open window:**
  ```tsx
  initial={{ opacity: 0, scale: 0.95, y: 20 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
  ```

- **Close window:**
  ```tsx
  exit={{ opacity: 0, scale: 0.9, y: 10 }}
  transition={{ duration: 0.2 }}
  ```

- **Minimize to taskbar:**
  ```tsx
  animate={{
    scale: 0,
    x: targetTaskbarX,
    y: targetTaskbarY,
    opacity: 0
  }}
  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
  ```

- **Restore from taskbar:**
  ```tsx
  initial={{ scale: 0, x: taskbarX, y: taskbarY, opacity: 0 }}
  animate={{ scale: 1, x: savedX, y: savedY, opacity: 1 }}
  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
  ```

### 7.2 Button Interactions
- **Hover:**
  ```tsx
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.15 }}
  ```

- **Active/Click:**
  ```tsx
  whileTap={{ scale: 0.98 }}
  ```

### 7.3 Trace Entry Animations
- **Entry appears:**
  ```tsx
  initial={{ opacity: 0, x: -10 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
  ```

### 7.4 Progress Bar Fill
- **Fill animation:**
  ```tsx
  initial={{ width: '0%' }}
  animate={{ width: `${percentage}%` }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
  ```

### 7.5 Modal Backdrop
- **Backdrop fade:**
  ```tsx
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
  ```

---

## Phase 8: Accessibility & Polish

### 8.1 Accessibility
- [ ] All interactive elements have focus states (visible outline)
- [ ] Keyboard navigation works throughout app
- [ ] ARIA labels on icon buttons
- [ ] Focus trap in modals
- [ ] Semantic HTML elements (nav, main, article, etc.)
- [ ] Color contrast meets WCAG AA standards

### 8.2 Performance Optimizations
- [ ] Use React.memo for window components to prevent unnecessary rerenders
- [ ] Virtualize trace entries list if >100 items
- [ ] Lazy load window components
- [ ] Optimize Motion animations (use transform properties)

### 8.3 Visual Polish
- [ ] Consistent spacing using Tailwind spacing scale
- [ ] Subtle drop shadows on elevated elements
- [ ] Hover states on all interactive elements
- [ ] Loading states for all async actions (even if mocked)
- [ ] Empty states with helpful messaging
- [ ] Success feedback (toasts or inline messages)

---

## Implementation Order

1. **Foundation** (Phase 1): Project setup, design tokens, theme system
2. **Core Layout** (Phase 2): Desktop, TopBar, Taskbar
3. **Window System** (Phase 3): AppWindow with drag/resize/controls
4. **UI Components** (Phase 4): Buttons, Cards, Inputs, Modals
5. **Page Layouts** (Phase 5): All window content layouts with mock data
6. **Interactions** (Phase 6): Keyboard shortcuts, snapping, theme toggle, responsive
7. **Animations** (Phase 7): Refine all Motion animations
8. **Polish** (Phase 8): Accessibility, performance, visual refinements

---

## Mock Data Requirements

Since this is frontend-only, create mock data for:
- Video metadata (title, duration, file size)
- Thinking trace events (array of events with timestamps)
- Skill package data (title, description, SKILL.md content, scripts, assets)
- Execution log events (step-by-step progress)

Store in `lib/mockData.ts` for easy swapping later.

---

## Out of Scope (For Later Phases)

- ❌ Actual video upload/processing
- ❌ SHA-256 hash calculation
- ❌ API integration
- ❌ Supabase connection
- ❌ Gemini API calls
- ❌ Browserbase execution
- ❌ Server-Sent Events streams (use setTimeout to simulate)
- ❌ MCP server generation (just show success message)
- ❌ Zip file download (just trigger download action)

---

## Success Criteria

- ✅ App loads with retro OS desktop aesthetic
- ✅ Windows can be dragged, resized, minimized, closed
- ✅ Window snapping works smoothly
- ✅ All page layouts render with mock data
- ✅ Animations are smooth and consistent
- ✅ Theme toggle switches between light/dark modes
- ✅ Keyboard shortcuts work as expected
- ✅ Responsive mobile layout activates on small screens
- ✅ All interactive elements have hover/focus states
- ✅ No console errors or warnings
- ✅ TypeScript strict mode passes
