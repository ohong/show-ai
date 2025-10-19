"use client";

import React from "react";
import { motion } from "motion/react";
import { useWindowManager } from "@/lib/context/WindowManagerContext";

export default function Taskbar() {
  const { windows, bringToFront } = useWindowManager();
  const minimizedWindows = windows.filter(w => w.isMinimized);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-14 bg-[--color-window-light] dark:bg-[--color-window-dark] border-t border-[--color-border-light] dark:border-[--color-border-dark] flex items-center px-4 gap-2 z-50">
      {minimizedWindows.map(window => (
        <motion.button
          key={window.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => bringToFront(window.id)}
          className="px-4 py-2 bg-[--color-accent-light] dark:bg-[--color-accent-dark] rounded-md text-sm font-medium hover:bg-[--color-brand-red] hover:text-white transition-colors"
        >
          {window.title}
        </motion.button>
      ))}
      {minimizedWindows.length === 0 && (
        <div className="text-sm text-gray-500">No minimized windows</div>
      )}
    </div>
  );
}
