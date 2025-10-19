"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { WindowState, WindowManagerContextType } from "@/lib/types/window";

const WindowManagerContext = createContext<WindowManagerContextType | undefined>(undefined);

export function WindowManagerProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [focusedWindowId, setFocusedWindowId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(1000);

  const openWindow = useCallback((window: Omit<WindowState, "zIndex" | "isMinimized" | "isMaximized">) => {
    setWindows(prev => {
      // Check if window already exists
      if (prev.find(w => w.id === window.id)) {
        // Bring to front if already open
        return prev.map(w =>
          w.id === window.id
            ? { ...w, zIndex: nextZIndex, isMinimized: false }
            : w
        );
      }
      return [...prev, { ...window, zIndex: nextZIndex, isMinimized: false, isMaximized: false }];
    });
    setNextZIndex(prev => prev + 1);
    setFocusedWindowId(window.id);
  }, [nextZIndex]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    setFocusedWindowId(prev => prev === id ? null : prev);
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMinimized: true } : w
    ));
    setFocusedWindowId(prev => prev === id ? null : prev);
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  }, []);

  const bringToFront = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, zIndex: nextZIndex, isMinimized: false } : w
    ));
    setNextZIndex(prev => prev + 1);
    setFocusedWindowId(id);
  }, [nextZIndex]);

  const updateWindowPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, position } : w
    ));
  }, []);

  const updateWindowSize = useCallback((id: string, size: { width: number; height: number }) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, size } : w
    ));
  }, []);

  return (
    <WindowManagerContext.Provider value={{
      windows,
      focusedWindowId,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      bringToFront,
      updateWindowPosition,
      updateWindowSize,
    }}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager() {
  const context = useContext(WindowManagerContext);
  if (context === undefined) {
    throw new Error("useWindowManager must be used within a WindowManagerProvider");
  }
  return context;
}
