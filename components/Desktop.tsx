"use client";

import React from "react";
import { useWindowManager } from "@/lib/context/WindowManagerContext";
import AppWindow from "./AppWindow/AppWindow";

export default function Desktop() {
  const { windows } = useWindowManager();

  return (
    <div className="fixed inset-0 bg-[--color-background-light] dark:bg-[--color-background-dark] overflow-hidden">
      {/* Render all non-minimized windows */}
      {windows
        .filter(w => !w.isMinimized)
        .map(window => (
          <AppWindow
            key={window.id}
            id={window.id}
            title={window.title}
            position={window.position}
            size={window.size}
            zIndex={window.zIndex}
            isMaximized={window.isMaximized}
          >
            <window.component />
          </AppWindow>
        ))}
    </div>
  );
}
