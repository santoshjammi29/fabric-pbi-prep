"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Type,
  Minus,
  Plus,
  RotateCcw,
  Check,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useTextSize,
  TEXT_SIZE_OPTIONS,
  type TextSizeKey,
} from "@/components/providers/text-size-provider";

interface TextSizeControllerProps {
  className?: string;
  collapsed?: boolean;
  align?: "start" | "end" | "center";
  direction?: "up" | "down";
}

/**
 * Primary Text Size Controller for Desktop Sidebar & Settings
 */
export function TextSizeController({
  className,
  collapsed = false,
  align = "start",
  direction = "up",
}: TextSizeControllerProps) {
  const {
    textSize,
    currentOption,
    options,
    setTextSize,
    increaseTextSize,
    decreaseTextSize,
    resetTextSize,
    canIncrease,
    canDecrease,
  } = useTextSize();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click or escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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

  // Collapsed Sidebar View (compact icon button)
  if (collapsed) {
    return (
      <div ref={containerRef} className={cn("relative w-full", className)}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "flex items-center justify-center w-full p-2 rounded-xl text-sm font-medium transition-colors cursor-pointer select-none",
            "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]",
            isOpen && "bg-[var(--surface-3)] text-[var(--foreground)]"
          )}
          aria-label={`Text size: ${currentOption.scaleLabel}. Click to change text size.`}
          aria-expanded={isOpen}
          title={`Text Size: ${currentOption.label} (${currentOption.scaleLabel})`}
        >
          <div className="relative flex items-center justify-center">
            <Type size={18} />
            <span
              className={cn(
                "absolute -bottom-1 -right-1 text-[8px] font-mono font-bold leading-none px-0.5 rounded",
                textSize === "base"
                  ? "text-[var(--muted-foreground)]"
                  : "text-purple-400 bg-purple-500/20"
              )}
            >
              {currentOption.scaleLabel.replace("%", "")}
            </span>
          </div>
        </button>

        {/* Collapsed Popover */}
        {isOpen && (
          <div
            role="listbox"
            aria-label="Select text size"
            className={cn(
              "absolute z-50 w-60 p-2 rounded-2xl border shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150",
              "bg-[var(--card)] border-[var(--border)]",
              direction === "up" ? "bottom-full mb-2" : "top-full mt-2",
              "left-0"
            )}
          >
            <div className="px-2.5 py-1.5 mb-1.5 border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Text Size
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--surface-3)] text-[var(--foreground)] font-mono font-semibold">
                {currentOption.scaleLabel}
              </span>
            </div>

            {/* Quick Stepper in Collapsed Popover */}
            <div className="flex items-center gap-1 p-1 mb-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
              <button
                type="button"
                onClick={() => decreaseTextSize(true)}
                disabled={!canDecrease}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                  canDecrease
                    ? "hover:bg-[var(--surface-3)] text-[var(--foreground)]"
                    : "opacity-40 cursor-not-allowed text-[var(--muted-foreground)]"
                )}
                title="Decrease text size (Alt + -)"
                aria-label="Decrease text size"
              >
                <Minus size={12} />
                <span>A-</span>
              </button>

              <button
                type="button"
                onClick={() => resetTextSize(true)}
                className="px-2 py-1 rounded-lg text-[10px] font-mono font-medium hover:bg-[var(--surface-3)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                title="Reset to 100% (Alt + 0)"
                aria-label="Reset text size"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={() => increaseTextSize(true)}
                disabled={!canIncrease}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                  canIncrease
                    ? "hover:bg-[var(--surface-3)] text-[var(--foreground)]"
                    : "opacity-40 cursor-not-allowed text-[var(--muted-foreground)]"
                )}
                title="Increase text size (Alt + +)"
                aria-label="Increase text size"
              >
                <span>A+</span>
                <Plus size={12} />
              </button>
            </div>

            {/* Presets List */}
            <div className="space-y-1">
              {options.map((opt) => {
                const isSelected = textSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setTextSize(opt.id, true);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer group",
                      isSelected
                        ? "bg-[var(--surface-3)] border border-[var(--border-hover)]"
                        : "hover:bg-[var(--surface-2)] border border-transparent"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-xs font-bold leading-tight",
                            isSelected
                              ? "text-[var(--foreground)]"
                              : "text-[var(--foreground)]"
                          )}
                        >
                          {opt.label}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-[var(--surface-1)] text-[var(--muted-foreground)] border border-[var(--border)]">
                          {opt.scaleLabel}
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--muted-foreground)] truncate max-w-[150px]">
                        {opt.tagline}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                        <Check size={11} strokeWidth={3} />
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

  // Expanded View
  return (
    <div ref={containerRef} className={cn("relative w-full space-y-1.5", className)}>
      {/* Header & Trigger */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)] hover:text-purple-400 transition-colors cursor-pointer select-none"
          aria-expanded={isOpen}
          aria-label="Text size options menu"
        >
          <Type size={14} className="text-[var(--muted-foreground)]" />
          <span>Text Size</span>
          <ChevronUp
            size={12}
            className={cn(
              "text-[var(--muted-foreground)] transition-transform duration-200",
              isOpen ? "rotate-0" : "rotate-180"
            )}
          />
        </button>

        <span
          className={cn(
            "text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md border",
            textSize === "base"
              ? "bg-[var(--surface-2)] text-[var(--muted-foreground)] border-[var(--border)]"
              : "bg-purple-500/10 text-purple-400 border-purple-500/30"
          )}
        >
          {currentOption.scaleLabel}
        </span>
      </div>

      {/* Stepper Control Row: [ A- ] [ Reset/Current ] [ A+ ] */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] shadow-xs">
        {/* Decrease button */}
        <button
          type="button"
          onClick={() => decreaseTextSize(true)}
          disabled={!canDecrease}
          className={cn(
            "flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none",
            canDecrease
              ? "bg-[var(--surface-1)] text-[var(--foreground)] hover:bg-[var(--surface-3)] hover:text-purple-400 border border-[var(--border)] shadow-xs active:scale-95"
              : "opacity-40 cursor-not-allowed text-[var(--muted-foreground)]"
          )}
          title="Decrease text size (Alt + -)"
          aria-label="Decrease text size"
        >
          <Minus size={11} strokeWidth={2.5} />
          <span>A-</span>
        </button>

        {/* Center reset or menu button */}
        <button
          type="button"
          onClick={() => resetTextSize(true)}
          className={cn(
            "px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer select-none text-center",
            textSize === "base"
              ? "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]"
              : "text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 font-semibold"
          )}
          title="Reset to 100% Default (Alt + 0)"
          aria-label="Reset text size to default 100%"
        >
          <div className="flex items-center gap-1">
            <RotateCcw size={10} />
            <span className="text-[10px]">Reset</span>
          </div>
        </button>

        {/* Increase button */}
        <button
          type="button"
          onClick={() => increaseTextSize(true)}
          disabled={!canIncrease}
          className={cn(
            "flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none",
            canIncrease
              ? "bg-[var(--surface-1)] text-[var(--foreground)] hover:bg-[var(--surface-3)] hover:text-purple-400 border border-[var(--border)] shadow-xs active:scale-95"
              : "opacity-40 cursor-not-allowed text-[var(--muted-foreground)]"
          )}
          title="Increase text size (Alt + +)"
          aria-label="Increase text size"
        >
          <span>A+</span>
          <Plus size={11} strokeWidth={2.5} />
        </button>
      </div>

      {/* Floating Popover Menu with Presets */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Choose text size preset"
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
              Choose Text Scale
            </span>
            <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
              Alt + / -
            </span>
          </div>

          <div className="space-y-1">
            {options.map((opt) => {
              const isSelected = textSize === opt.id;
              return (
                <button
                  key={opt.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setTextSize(opt.id, true);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between w-full p-2 rounded-xl text-left transition-all cursor-pointer group",
                    isSelected
                      ? "bg-[var(--surface-3)] border border-[var(--border-hover)] shadow-xs"
                      : "hover:bg-[var(--surface-2)] border border-transparent"
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold leading-tight text-[var(--foreground)]">
                        {opt.label}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase bg-[var(--surface-2)] text-[var(--muted-foreground)] border border-[var(--border)]">
                        {opt.scaleLabel}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] truncate max-w-[150px] leading-snug">
                      {opt.tagline}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick shortcuts info at footer */}
          <div className="mt-2 pt-1.5 border-t border-[var(--border)] flex items-center justify-between px-2 text-[10px] text-[var(--muted-foreground)]">
            <span>Shortcuts</span>
            <span className="font-mono">Alt + / Alt - / Alt 0</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Segmented Pill Row for mobile drawers and compact settings
 */
export function TextSizeSegmentedPills({ className }: { className?: string }) {
  const {
    textSize,
    options,
    setTextSize,
    increaseTextSize,
    decreaseTextSize,
    canIncrease,
    canDecrease,
  } = useTextSize();

  return (
    <div className={cn("space-y-1.5 select-none", className)}>
      {/* 5-part pill selector */}
      <div
        role="radiogroup"
        aria-label="Text size presets"
        className="grid grid-cols-5 gap-1 p-1 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs"
      >
        {options.map((opt) => {
          const isSelected = textSize === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTextSize(opt.id, true)}
              className={cn(
                "flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center",
                isSelected
                  ? "bg-[var(--surface-3)] text-purple-400 shadow-xs border border-[var(--border-hover)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
              )}
              title={`${opt.label}: ${opt.scaleLabel}`}
            >
              <span className="text-[11px] font-bold">{opt.scaleLabel}</span>
              <span className="text-[9px] truncate opacity-75">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Stepper Row */}
      <div className="flex items-center justify-between gap-2 px-1">
        <button
          type="button"
          onClick={() => decreaseTextSize(true)}
          disabled={!canDecrease}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
            canDecrease
              ? "bg-[var(--surface-1)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-3)] active:scale-95"
              : "opacity-40 cursor-not-allowed border-[var(--border)] text-[var(--muted-foreground)]"
          )}
          aria-label="Decrease text size"
        >
          <Minus size={13} />
          <span>Decrease (A-)</span>
        </button>

        <button
          type="button"
          onClick={() => increaseTextSize(true)}
          disabled={!canIncrease}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
            canIncrease
              ? "bg-[var(--surface-1)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-3)] active:scale-95"
              : "opacity-40 cursor-not-allowed border-[var(--border)] text-[var(--muted-foreground)]"
          )}
          aria-label="Increase text size"
        >
          <span>Increase (A+)</span>
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

/**
 * Compact Quick-Toggle Button for Mobile Header Top Bar
 */
export function TextSizeQuickToggle({
  className,
  size = 18,
}: {
  className?: string;
  size?: number;
}) {
  const { textSize, currentOption, options, setTextSize, increaseTextSize, decreaseTextSize, resetTextSize } =
    useTextSize();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "relative p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer",
          isOpen && "bg-[var(--surface-3)] text-[var(--foreground)]",
          className
        )}
        aria-label={`Current text scale: ${currentOption.scaleLabel}. Click to adjust text size.`}
        title={`Text Size: ${currentOption.label} (${currentOption.scaleLabel})`}
      >
        <Type size={size} />
        {textSize !== "base" && (
          <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-purple-500" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 p-2 rounded-2xl border shadow-xl bg-[var(--card)] border-[var(--border)] z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 mb-1.5 border-b border-[var(--border)] flex items-center justify-between text-[10px] font-bold uppercase text-[var(--muted-foreground)]">
            <span>Text Size</span>
            <span className="font-mono text-purple-400 font-bold">{currentOption.scaleLabel}</span>
          </div>

          {/* Quick Stepper */}
          <div className="flex items-center gap-1 p-1 mb-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
            <button
              type="button"
              onClick={() => decreaseTextSize(true)}
              className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-bold hover:bg-[var(--surface-3)] text-[var(--foreground)] transition-colors"
              title="Decrease font size"
            >
              <Minus size={11} />
              <span>A-</span>
            </button>
            <button
              type="button"
              onClick={() => resetTextSize(true)}
              className="px-2 py-1 rounded-lg text-[10px] hover:bg-[var(--surface-3)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              title="Reset to 100%"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => increaseTextSize(true)}
              className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-bold hover:bg-[var(--surface-3)] text-[var(--foreground)] transition-colors"
              title="Increase font size"
            >
              <span>A+</span>
              <Plus size={11} />
            </button>
          </div>

          {/* Presets List */}
          <div className="space-y-1">
            {options.map((opt) => {
              const isSelected = textSize === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setTextSize(opt.id, true);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer",
                    isSelected
                      ? "bg-[var(--surface-3)] text-[var(--foreground)] font-bold"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>{opt.label}</span>
                    <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                      {opt.scaleLabel}
                    </span>
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
