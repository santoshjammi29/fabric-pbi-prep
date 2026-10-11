"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useDiagramTheme } from "@/lib/diagram-theme";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WhiteboardThemeToggleProps {
  className?: string;
  size?: "xs" | "sm" | "md";
  showLabel?: boolean;
}

export function WhiteboardThemeToggle({
  className,
  size = "sm",
  showLabel = true,
}: WhiteboardThemeToggleProps) {
  const [theme, setTheme] = useDiagramTheme();

  const handleToggle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    toast.success(
      next === "dark"
        ? "Whiteboard: Switched to Dark Slate Blueprint"
        : "Whiteboard: Switched to Light Whiteboard Canvas"
    );
  };

  const isDark = theme === "dark";

  return (
    <div
      role="group"
      aria-label="Whiteboard canvas theme switcher"
      className={cn(
        "inline-flex items-center p-0.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] shadow-xs select-none",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => {
          if (!isDark) handleToggle();
        }}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg font-medium transition-all cursor-pointer touch-manipulation",
          size === "xs" && "px-2 py-0.5 text-[10px]",
          size === "sm" && "px-2.5 py-1 text-xs",
          size === "md" && "px-3 py-1.5 text-xs sm:text-sm",
          isDark
            ? "bg-purple-600 text-white font-semibold shadow-xs"
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        )}
        title="View in Dark Slate Blueprint mode"
      >
        <Moon size={size === "xs" ? 11 : 13} className={isDark ? "text-purple-200" : "text-slate-400"} />
        {showLabel && <span>Dark Blueprint</span>}
      </button>

      <button
        type="button"
        onClick={() => {
          if (isDark) handleToggle();
        }}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg font-medium transition-all cursor-pointer touch-manipulation",
          size === "xs" && "px-2 py-0.5 text-[10px]",
          size === "sm" && "px-2.5 py-1 text-xs",
          size === "md" && "px-3 py-1.5 text-xs sm:text-sm",
          !isDark
            ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        )}
        title="View in Light Whiteboard Canvas mode"
      >
        <Sun size={size === "xs" ? 11 : 13} className={!isDark ? "text-amber-950" : "text-amber-400"} />
        {showLabel && <span>Light Canvas</span>}
      </button>
    </div>
  );
}

/**
 * Compact floating icon toggle for overlaying directly on whiteboard cards
 */
export function WhiteboardFloatingThemeToggle({
  className,
}: {
  className?: string;
}) {
  const [theme, , toggleTheme] = useDiagramTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleTheme();
        toast.success(
          !isDark
            ? "Switched to Dark Slate Blueprint"
            : "Switched to Light Whiteboard Canvas"
        );
      }}
      className={cn(
        "p-1.5 sm:p-2 rounded-xl bg-black/75 hover:bg-black/90 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-all shadow-md cursor-pointer flex items-center gap-1.5 text-[11px] font-semibold touch-manipulation",
        className
      )}
      title={isDark ? "Switch to Light Canvas" : "Switch to Dark Slate Blueprint"}
      aria-label="Toggle diagram theme"
    >
      {isDark ? (
        <>
          <Moon size={13} className="text-purple-300" />
          <span className="hidden sm:inline">Dark</span>
        </>
      ) : (
        <>
          <Sun size={13} className="text-amber-400" />
          <span className="hidden sm:inline">Light</span>
        </>
      )}
    </button>
  );
}
