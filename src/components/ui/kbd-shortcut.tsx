"use client";

import React from "react";
import { useIsMac } from "@/hooks/use-cross-platform-key";
import { cn } from "@/lib/utils";

interface KbdShortcutProps {
  shortcutKey: string;
  className?: string;
  altText?: string;
}

export function KbdShortcut({ shortcutKey, className, altText }: KbdShortcutProps) {
  const isMac = useIsMac();
  const label = isMac ? `⌘${shortcutKey.toUpperCase()}` : `Ctrl+${shortcutKey.toUpperCase()}`;

  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted-foreground)] shadow-xs select-none",
        className
      )}
      title={altText || `${isMac ? "Command" : "Control"} + ${shortcutKey.toUpperCase()}`}
      aria-label={altText || `${isMac ? "Command" : "Control"} + ${shortcutKey.toUpperCase()}`}
    >
      {label}
    </kbd>
  );
}
