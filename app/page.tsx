"use client";

import { useEffect, useRef } from "react";
import Desktop from "@/components/Desktop";
import TopBar from "@/components/TopBar";
import Taskbar from "@/components/Taskbar";
import { useWindowManager } from "@/lib/context/WindowManagerContext";
import WelcomeWindow from "@/components/windows/WelcomeWindow";
import AboutWindow from "@/components/windows/AboutWindow";

export default function HomePage() {
  const { openWindow } = useWindowManager();
  const hasOpenedWindows = useRef(false);

  useEffect(() => {
    // Only open windows once on mount
    if (!hasOpenedWindows.current) {
      hasOpenedWindows.current = true;

      openWindow({
        id: "welcome",
        title: "Welcome to Show AI",
        position: { x: 100, y: 100 },
        size: { width: 500, height: 400 },
        component: WelcomeWindow,
      });

      openWindow({
        id: "about",
        title: "About Show AI",
        position: { x: 200, y: 150 },
        size: { width: 450, height: 350 },
        component: AboutWindow,
      });
    }
  }, [openWindow]);

  return (
    <>
      <TopBar />
      <div className="pt-12 pb-14">
        <Desktop />
      </div>
      <Taskbar />
    </>
  );
}
