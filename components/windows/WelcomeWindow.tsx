"use client";

import React from "react";

export default function WelcomeWindow() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Welcome to Show AI</h2>
      <p className="text-gray-700 dark:text-gray-300">
        This is a demo of the retro OS-style window system. Try dragging this window around,
        minimizing it, or maximizing it using the controls in the title bar.
      </p>
      <div className="space-y-2">
        <h3 className="font-semibold">Features:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Draggable windows</li>
          <li>Minimize/Maximize controls</li>
          <li>Taskbar for minimized windows</li>
          <li>Light/Dark theme toggle</li>
          <li>Smooth animations with Motion</li>
        </ul>
      </div>
    </div>
  );
}
