"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Detects if the current client platform is macOS or Apple-based.
 */
export function useIsMac(): boolean {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      const platform = (navigator as any)?.userAgentData?.platform || navigator.platform || "";
      const isApple = /Mac|iPhone|iPod|iPad/i.test(platform) || /Mac/i.test(navigator.userAgent);
      setIsMac(isApple);
    }
  }, []);

  return isMac;
}

/**
 * Universal cross-platform shortcut hook.
 * Triggers callback when (Cmd+key on Mac) or (Ctrl+key on Windows/Linux) is pressed.
 */
export function useCrossPlatformShortcut(
  key: string,
  callback: (e: KeyboardEvent) => void,
  options: { enabled?: boolean; preventDefault?: boolean } = {}
) {
  const { enabled = true, preventDefault = true } = options;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      const isModifierActive = e.metaKey || e.ctrlKey;
      if (isModifierActive && e.key.toLowerCase() === key.toLowerCase()) {
        if (preventDefault) {
          e.preventDefault();
        }
        callback(e);
      }
    },
    [key, callback, enabled, preventDefault]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
