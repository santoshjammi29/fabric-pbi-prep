"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Monitor,
  BookOpen,
  Check,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type ThemeKey = "dark" | "light" | "grey" | "e-ink";

export interface ThemeOption {
  id: ThemeKey;
  label: string;
  tagline: string;
  icon: React.ElementType;
  dotColor: string;
  dotBorder?: string;
  badge: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "dark",
    label: "Dark",
    tagline: "Obsidian OLED & Neon Glow",
    icon: Moon,
    dotColor: "#0A0A0B",
    dotBorder: "rgba(255,255,255,0.25)",
    badge: "Default",
  },
  {
    id: "light",
    label: "Light",
    tagline: "Crisp Bright & Purple Tint",
    icon: Sun,
    dotColor: "#f8f8fc",
    dotBorder: "rgba(0,0,0,0.18)",
    badge: "Daylight",
  },
  {
    id: "grey",
    label: "Grey",
    tagline: "Neutral Graphite Slate",
    icon: Monitor,
    dotColor: "#202227",
    dotBorder: "rgba(255,255,255,0.2)",
    badge: "Balanced",
  },
  {
    id: "e-ink",
    label: "E-Ink Reader",
    tagline: "Paper-Like Marathon Read",
    icon: BookOpen,
    dotColor: "#f7f6f2",
    dotBorder: "rgba(0,0,0,0.3)",
    badge: "Eye Care",
  },
];

interface ThemeSwitcherProps {
  className?: string;
  collapsed?: boolean;
  align?: "start" | "end" | "center";
  direction?: "up" | "down";
}

export function ThemeSwitcher({
  className,
  collapsed = false,
  align = "start",
  direction = "up",
}: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const activeTheme = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];
  const ActiveIcon = activeTheme.icon;

  const handleSelectTheme = (newTheme: ThemeKey) => {
    setTheme(newTheme);
    setIsOpen(false);
    const selected = THEME_OPTIONS.find((t) => t.id === newTheme);
    toast.success(`Theme switched to ${selected?.label || newTheme}`, {
      description: selected?.tagline,
      duration: 2000,
    });
  };

  // Cycle to next theme (for quick single clicks on compact mode)
  const handleCycleTheme = (e: React.MouseEvent) => {
    if (collapsed) {
      e.stopPropagation();
      const currentIndex = THEME_OPTIONS.findIndex((t) => t.id === theme);
      const nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
      handleSelectTheme(THEME_OPTIONS[nextIndex].id);
    } else {
      setIsOpen((prev) => !prev);
    }
  };

  if (!mounted) {
    return (
      <div className={cn("flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium opacity-50", className)}>
        <Moon size={18} />
        {!collapsed && <span>Theme</span>}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleCycleTheme}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer select-none",
          "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]",
          isOpen && "bg-[var(--surface-3)] text-[var(--foreground)]",
          collapsed && "justify-center px-0"
        )}
        aria-label={`Current theme: ${activeTheme.label}. Click to ${collapsed ? "cycle theme" : "choose theme"}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0 flex items-center justify-center">
            <ActiveIcon size={17} className="transition-transform group-hover:scale-110" />
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border"
              style={{
                backgroundColor: activeTheme.dotColor,
                borderColor: activeTheme.dotBorder || "var(--border)",
              }}
              aria-hidden="true"
            />
          </div>
          {!collapsed && (
            <div className="text-left truncate">
              <span className="block text-xs font-semibold leading-tight text-[var(--foreground)]">
                {activeTheme.label} Theme
              </span>
              <span className="block text-[10px] text-[var(--muted-foreground)] leading-tight truncate">
                {activeTheme.badge}
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <ChevronUp
            size={14}
            className={cn(
              "text-[var(--muted-foreground)] transition-transform duration-200 shrink-0",
              isOpen ? "rotate-0" : "rotate-180"
            )}
          />
        )}
      </button>

      {/* Floating Popover Menu */}
      {isOpen && !collapsed && (
        <div
          role="listbox"
          aria-label="Select appearance theme"
          className={cn(
            "absolute z-50 w-64 p-2 rounded-2xl border shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150",
            "bg-[var(--card)] border-[var(--border)]",
            direction === "up" ? "bottom-full mb-2" : "top-full mt-2",
            align === "start" && "left-0",
            align === "end" && "right-0",
            align === "center" && "left-1/2 -translate-x-1/2"
          )}
        >
          <div className="px-2.5 py-1.5 mb-1 border-b border-[var(--border)] flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Appearance Themes
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--surface-3)] text-[var(--foreground)] font-mono">
              4 options
            </span>
          </div>

          <div className="space-y-1">
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectTheme(opt.id)}
                  className={cn(
                    "flex items-center justify-between w-full p-2 rounded-xl text-left transition-all cursor-pointer group",
                    isSelected
                      ? "bg-[var(--surface-3)] border border-[var(--border-hover)] shadow-xs"
                      : "hover:bg-[var(--surface-2)] border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105",
                        isSelected
                          ? "bg-[var(--surface-2)] text-[var(--foreground)] border-[var(--border-hover)]"
                          : "bg-[var(--surface-1)] text-[var(--muted-foreground)] border-[var(--border)]"
                      )}
                      style={{
                        boxShadow: `inset 0 0 0 2px ${opt.dotColor}22`,
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-xs font-bold leading-tight", isSelected ? "text-[var(--foreground)]" : "text-[var(--foreground)]")}>
                          {opt.label}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase bg-[var(--surface-2)] text-[var(--muted-foreground)] border border-[var(--border)]">
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--muted-foreground)] truncate max-w-[140px] leading-snug">
                        {opt.tagline}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Segmented Pill Row for mobile drawers and responsive layouts
 */
export function ThemeSegmentedPills({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelect = (id: ThemeKey) => {
    setTheme(id);
    const opt = THEME_OPTIONS.find((t) => t.id === id);
    toast.success(`Theme: ${opt?.label}`, {
      description: opt?.tagline,
      duration: 1800,
    });
  };

  if (!mounted) {
    return <div className="h-9 w-full bg-[var(--surface-2)] rounded-xl animate-pulse" />;
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme selection"
      className={cn(
        "grid grid-cols-4 gap-1 p-1 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs select-none",
        className
      )}
    >
      {THEME_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isSelected = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => handleSelect(opt.id)}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              isSelected
                ? "bg-[var(--surface-3)] text-[var(--foreground)] shadow-xs border border-[var(--border-hover)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
            )}
            title={`${opt.label}: ${opt.tagline}`}
          >
            <Icon size={14} className={cn(isSelected ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]")} />
            <span className="text-[11px] truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Single-click cycle button for headers
 */
export function ThemeCycleButton({
  className,
  size = 18,
}: {
  className?: string;
  size?: number;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const activeTheme = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];
  const ActiveIcon = activeTheme.icon;

  const handleCycle = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentIndex = THEME_OPTIONS.findIndex((t) => t.id === theme);
    const nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
    const next = THEME_OPTIONS[nextIndex];
    setTheme(next.id);
    toast.success(`Switched to ${next.label} Theme`, {
      description: next.tagline,
      duration: 1800,
    });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen((prev) => !prev);
  };

  if (!mounted) {
    return (
      <button
        type="button"
        className={cn("p-2 rounded-xl text-[var(--muted-foreground)] opacity-50", className)}
        aria-label="Theme toggle loading"
      >
        <Moon size={size} />
      </button>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={handleCycle}
        onContextMenu={handleContextMenu}
        className={cn(
          "relative p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer",
          className
        )}
        aria-label={`Current theme: ${activeTheme.label}. Click to cycle to next theme (${THEME_OPTIONS[(THEME_OPTIONS.findIndex((t) => t.id === theme) + 1) % THEME_OPTIONS.length].label}), or right-click for menu`}
        title={`Current: ${activeTheme.label} (${activeTheme.tagline}). Click to switch theme.`}
      >
        <ActiveIcon size={size} />
        <span
          className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full border border-[var(--border)]"
          style={{ backgroundColor: activeTheme.dotColor }}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-56 p-2 rounded-2xl border shadow-xl bg-[var(--card)] border-[var(--border)] z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-2 py-1 mb-1 border-b border-[var(--border)] text-[10px] font-bold uppercase text-[var(--muted-foreground)]">
            Select Theme
          </div>
          <div className="space-y-1">
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                    toast.success(`Theme: ${opt.label}`, {
                      description: opt.tagline,
                      duration: 1800,
                    });
                  }}
                  className={cn(
                    "flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer",
                    isSelected
                      ? "bg-[var(--surface-3)] text-[var(--foreground)] font-bold"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={14} />
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <Check size={12} className="text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
