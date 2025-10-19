"use client";

import React from "react";

export default function AboutWindow() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">About Show AI</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Show AI lets you teach AI agents new skills from just a screen recording.
      </p>
      <div className="bg-[--color-accent-light] dark:bg-[--color-accent-dark] p-4 rounded-md">
        <p className="text-sm">
          <strong>Tech Stack:</strong> Next.js 15, TypeScript, Tailwind CSS, Motion
        </p>
      </div>
    </div>
  );
}
