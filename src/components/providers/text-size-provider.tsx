"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";

export type TextSizeKey =
  | "3xs"
  | "2xs"
  | "xs"
  | "sm"
  | "md"
  | "base"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl";

export interface TextSizeOption {
  id: TextSizeKey;
  label: string;
  tagline: string;
  percent: number;
  scaleLabel: string;
}

export const TEXT_SIZE_OPTIONS: TextSizeOption[] = [
  {
    id: "3xs",
    label: "Micro",
    tagline: "Ultra-dense layout for split screens & 4K",
    percent: 75,
    scaleLabel: "75%",
  },
  {
    id: "2xs",
    label: "Mini",
    tagline: "Maximum data density for compact panels",
    percent: 80,
    scaleLabel: "80%",
  },
  {
    id: "xs",
    label: "Extra Small",
    tagline: "High density for multi-panel workflows",
    percent: 85,
    scaleLabel: "85%",
  },
  {
    id: "sm",
    label: "Small",
    tagline: "Compact view for fast reading & scanning",
    percent: 90,
    scaleLabel: "90%",
  },
  {
    id: "md",
    label: "Slim",
    tagline: "Subtle compact scale for clean readability",
    percent: 95,
    scaleLabel: "95%",
  },
  {
    id: "base",
    label: "Default",
    tagline: "Standard balanced scale",
    percent: 100,
    scaleLabel: "100%",
  },
  {
    id: "lg",
    label: "Medium",
    tagline: "Enhanced comfort for long reading sessions",
    percent: 110,
    scaleLabel: "110%",
  },
  {
    id: "xl",
    label: "Large",
    tagline: "High legibility and clear contrast",
    percent: 120,
    scaleLabel: "120%",
  },
  {
    id: "2xl",
    label: "Extra Large",
    tagline: "Focus mode and reduced eye strain",
    percent: 130,
    scaleLabel: "130%",
  },
  {
    id: "3xl",
    label: "Super Large",
    tagline: "Large display and distant reading view",
    percent: 140,
    scaleLabel: "140%",
  },
  {
    id: "4xl",
    label: "Maximum",
    tagline: "Maximum readability and high zoom",
    percent: 150,
    scaleLabel: "150%",
  },
  {
    id: "5xl",
    label: "Ultra",
    tagline: "Ultra-high visibility presentation scale",
    percent: 160,
    scaleLabel: "160%",
  },
];

const STORAGE_KEY = "fabric_text_size";
const VALID_KEYS: TextSizeKey[] = [
  "3xs",
  "2xs",
  "xs",
  "sm",
  "md",
  "base",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
];

interface TextSizeContextType {
  textSize: TextSizeKey;
  currentOption: TextSizeOption;
  options: TextSizeOption[];
  setTextSize: (size: TextSizeKey, notify?: boolean) => void;
  increaseTextSize: (notify?: boolean) => void;
  decreaseTextSize: (notify?: boolean) => void;
  resetTextSize: (notify?: boolean) => void;
  canIncrease: boolean;
  canDecrease: boolean;
}

const TextSizeContext = createContext<TextSizeContextType | null>(null);

function applyTextSizeToDom(size: TextSizeKey) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Remove existing size classes
  VALID_KEYS.forEach((k) => root.classList.remove(`text-size-${k}`));

  // Add active size class
  root.classList.add(`text-size-${size}`);

  // Set CSS property
  const opt = TEXT_SIZE_OPTIONS.find((o) => o.id === size);
  if (opt) {
    root.style.setProperty("--text-scale", `${opt.percent}%`);
  }
}

export function TextSizeProvider({ children }: { children: React.ReactNode }) {
  const [textSize, setTextSizeState] = useState<TextSizeKey>("base");
  const [mounted, setMounted] = useState(false);

  // Sync with initial DOM / localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as TextSizeKey | null;
      if (saved && VALID_KEYS.includes(saved)) {
        setTextSizeState(saved);
        applyTextSizeToDom(saved);
      } else {
        applyTextSizeToDom("base");
      }
    } catch {
      applyTextSizeToDom("base");
    }
    setMounted(true);
  }, []);

  const currentOption = useMemo(
    () =>
      TEXT_SIZE_OPTIONS.find((o) => o.id === textSize) ||
      TEXT_SIZE_OPTIONS.find((o) => o.id === "base") ||
      TEXT_SIZE_OPTIONS[0],
    [textSize]
  );

  const currentIndex = useMemo(
    () => TEXT_SIZE_OPTIONS.findIndex((o) => o.id === textSize),
    [textSize]
  );

  const canDecrease = currentIndex > 0;
  const canIncrease = currentIndex < TEXT_SIZE_OPTIONS.length - 1;

  const setTextSize = useCallback(
    (newSize: TextSizeKey, notify = true) => {
      if (!VALID_KEYS.includes(newSize)) return;
      setTextSizeState(newSize);
      applyTextSizeToDom(newSize);
      try {
        localStorage.setItem(STORAGE_KEY, newSize);
      } catch {
        // Storage might be restricted
      }

      if (notify) {
        const opt = TEXT_SIZE_OPTIONS.find((o) => o.id === newSize);
        toast.success(`Text size: ${opt?.label} (${opt?.scaleLabel})`, {
          description: opt?.tagline,
          duration: 1800,
        });
      }
    },
    []
  );

  const increaseTextSize = useCallback(
    (notify = true) => {
      const idx = TEXT_SIZE_OPTIONS.findIndex((o) => o.id === textSize);
      if (idx < TEXT_SIZE_OPTIONS.length - 1) {
        const next = TEXT_SIZE_OPTIONS[idx + 1].id;
        setTextSize(next, notify);
      } else if (notify) {
        const maxOpt = TEXT_SIZE_OPTIONS[TEXT_SIZE_OPTIONS.length - 1];
        toast.info(`Maximum text size reached (${maxOpt.scaleLabel})`, { duration: 1500 });
      }
    },
    [textSize, setTextSize]
  );

  const decreaseTextSize = useCallback(
    (notify = true) => {
      const idx = TEXT_SIZE_OPTIONS.findIndex((o) => o.id === textSize);
      if (idx > 0) {
        const prev = TEXT_SIZE_OPTIONS[idx - 1].id;
        setTextSize(prev, notify);
      } else if (notify) {
        const minOpt = TEXT_SIZE_OPTIONS[0];
        toast.info(`Minimum text size reached (${minOpt.scaleLabel})`, { duration: 1500 });
      }
    },
    [textSize, setTextSize]
  );

  const resetTextSize = useCallback(
    (notify = true) => {
      setTextSize("base", false);
      if (notify) {
        toast.success("Text size reset to Default (100%)", {
          description: "Standard balanced scale",
          duration: 1800,
        });
      }
    },
    [setTextSize]
  );

  // Global hotkeys: Alt + Plus / Alt + Minus / Alt + 0
  useEffect(() => {
    if (!mounted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when user is typing in input/textarea/editable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Check Alt modifier
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          increaseTextSize(true);
        } else if (e.key === "-" || e.key === "_") {
          e.preventDefault();
          decreaseTextSize(true);
        } else if (e.key === "0") {
          e.preventDefault();
          resetTextSize(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mounted, increaseTextSize, decreaseTextSize, resetTextSize]);

  const value = useMemo<TextSizeContextType>(
    () => ({
      textSize,
      currentOption,
      options: TEXT_SIZE_OPTIONS,
      setTextSize,
      increaseTextSize,
      decreaseTextSize,
      resetTextSize,
      canIncrease,
      canDecrease,
    }),
    [
      textSize,
      currentOption,
      setTextSize,
      increaseTextSize,
      decreaseTextSize,
      resetTextSize,
      canIncrease,
      canDecrease,
    ]
  );

  return (
    <TextSizeContext.Provider value={value}>{children}</TextSizeContext.Provider>
  );
}

const defaultOption =
  TEXT_SIZE_OPTIONS.find((o) => o.id === "base") || TEXT_SIZE_OPTIONS[0];

const defaultContextValue: TextSizeContextType = {
  textSize: "base",
  currentOption: defaultOption,
  options: TEXT_SIZE_OPTIONS,
  setTextSize: () => {},
  increaseTextSize: () => {},
  decreaseTextSize: () => {},
  resetTextSize: () => {},
  canIncrease: true,
  canDecrease: true,
};

export function useTextSize(): TextSizeContextType {
  const context = useContext(TextSizeContext);
  if (!context) {
    return defaultContextValue;
  }
  return context;
}
