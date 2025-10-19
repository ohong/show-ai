# Quick Start Guide

## 🚀 Running the App

The development server is already running! Open your browser to:

**http://localhost:3000**

## 🎮 What You'll See

You'll see a retro OS-style desktop with:
- **Top Bar**: Logo, navigation, and theme toggle (moon/sun icon)
- **Two Windows**: "Welcome to Show AI" and "About Show AI"
- **Bottom Taskbar**: Shows minimized windows

## ✨ Try These Interactions

### Window Controls (Top-right of each window)
- 🟡 **Yellow button** → Minimize window to taskbar
- 🟢 **Green button** → Maximize window (click again to restore)
- 🔴 **Red button** → Close window

### Window Management
- **Drag windows** → Click and hold the title bar, then drag
- **Bring to front** → Click anywhere on a window
- **Restore minimized** → Click the window button in the bottom taskbar

### Theme
- **Toggle dark mode** → Click the moon/sun icon in top-right corner

## 🎨 Design Features to Notice

- **Retro beige background** (#EEEFE9) - distinctively not pure white
- **Smooth animations** - Windows fade in/out with spring physics
- **Window chrome** - Subtle borders and shadows
- **Brand red accents** - Close button and interactive elements

## 🛠️ Development Commands

```bash
# Already running, but if you need to restart:
npm run dev

# Build for production:
npm run build

# Run production build:
npm start
```

## 📂 Project Structure

```
app/                  # Next.js app directory
components/           # React components
  AppWindow/         # Window system
  windows/           # Window content components
lib/                 # Utilities and contexts
  theme/             # Theme system
  context/           # React contexts
public/              # Static assets
```

## 🐛 Troubleshooting

**Server not starting?**
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Restart
npm run dev
```

**Logo not showing?**
- The logo should be at `public/logos/simple-logo.png`
- Already copied automatically

**Windows not draggable?**
- Make sure you're clicking the title bar (not the content area)
- The title bar is the gray area at the top with the window name

**Theme not switching?**
- Click the sun ☀️ or moon 🌙 icon in the top-right corner
- Theme preference is saved in browser localStorage

## 📝 Next Steps

Try the core window system, then we can add:
1. Resize handles for windows
2. The actual app windows (Upload, Skill Review, etc.)
3. UI component library
4. Keyboard shortcuts
5. Window snapping

Let me know what you'd like to build next!
