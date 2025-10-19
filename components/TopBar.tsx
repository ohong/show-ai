"use client";

import React from "react";
import Image from "next/image";
import { useTheme } from "@/lib/theme/ThemeContext";

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed top-0 left-0 right-0 h-12 bg-[--color-window-light] dark:bg-[--color-window-dark] border-b border-[--color-border-light] dark:border-[--color-border-dark] flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-4">
        <Image
          src="/logos/simple-logo.png"
          alt="Show AI"
          width={32}
          height={32}
          className="w-8 h-8"
        />
        <span className="font-bold text-lg">Show AI</span>
      </div>
      <div className="flex items-center gap-6">
        <nav className="hidden md:flex gap-6">
          <button className="text-sm hover:text-[--color-brand-red] transition-colors">Product</button>
          <button className="text-sm hover:text-[--color-brand-red] transition-colors">Docs</button>
          <button className="text-sm hover:text-[--color-brand-red] transition-colors">Community</button>
        </nav>
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-md hover:bg-[--color-accent-light] dark:hover:bg-[--color-accent-dark] transition-colors flex items-center justify-center"
          aria-label="Toggle theme"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>
    </div>
  );
}
