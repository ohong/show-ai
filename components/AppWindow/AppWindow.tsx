"use client";

import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { useWindowManager } from "@/lib/context/WindowManagerContext";
import TitleBar from "./TitleBar";

interface AppWindowProps {
  id: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMaximized: boolean;
  children: React.ReactNode;
}

export default function AppWindow({
  id,
  title,
  position,
  size,
  zIndex,
  isMaximized,
  children,
}: AppWindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, bringToFront, updateWindowPosition, updateWindowSize } =
    useWindowManager();
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef(null);

  const handleDragStart = () => {
    setIsDragging(true);
    bringToFront(id);
  };

  const handleDragEnd = (_: any, info: any) => {
    setIsDragging(false);
    const newX = position.x + info.offset.x;
    const newY = position.y + info.offset.y;
    updateWindowPosition(id, { x: newX, y: newY });
  };

  const windowStyle = isMaximized
    ? { x: 0, y: 0, width: "calc(100vw - 32px)", height: "calc(100vh - 120px)" }
    : { x: position.x, y: position.y, width: size.width, height: size.height };

  return (
    <motion.div
      ref={constraintsRef}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        ...windowStyle,
        zIndex,
      }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      drag={!isMaximized}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{
        left: 0,
        top: 0,
        right: typeof window !== "undefined" ? window.innerWidth - size.width : 0,
        bottom: typeof window !== "undefined" ? window.innerHeight - size.height - 80 : 0,
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseDown={() => bringToFront(id)}
      className="absolute bg-[--color-window-light] dark:bg-[--color-window-dark] border border-[--color-border-light] dark:border-[--color-border-dark] rounded-lg shadow-lg overflow-hidden"
      style={{
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      <TitleBar
        title={title}
        onClose={() => closeWindow(id)}
        onMinimize={() => minimizeWindow(id)}
        onMaximize={() => maximizeWindow(id)}
        isMaximized={isMaximized}
      />
      <div className="p-4 overflow-auto" style={{ height: "calc(100% - 48px)" }}>
        {children}
      </div>
    </motion.div>
  );
}
