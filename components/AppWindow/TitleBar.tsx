"use client";

import React from "react";

interface TitleBarProps {
  title: string;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  isMaximized: boolean;
}

export default function TitleBar({ title, onClose, onMinimize, onMaximize, isMaximized }: TitleBarProps) {
  return (
    <div className="h-12 bg-[--color-accent-light] dark:bg-[--color-accent-dark] border-b border-[--color-border-light] dark:border-[--color-border-dark] flex items-center justify-between px-4 cursor-grab active:cursor-grabbing select-none">
      <span className="font-semibold text-sm truncate">{title}</span>
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMinimize();
          }}
          className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
          aria-label="Minimize"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMaximize();
          }}
          className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
          aria-label={isMaximized ? "Restore" : "Maximize"}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="w-3 h-3 rounded-full bg-[--color-brand-red] hover:bg-[--color-brand-red-hover] transition-colors"
          aria-label="Close"
        />
      </div>
    </div>
  );
}
