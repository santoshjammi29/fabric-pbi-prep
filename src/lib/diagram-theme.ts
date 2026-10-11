/**
 * Whiteboard Diagram Theme State Manager
 * Provides global persistence and synchronization for Whiteboard Dark Mode across all pages.
 */

import { useState, useEffect, useCallback } from "react";

export type DiagramTheme = "dark" | "light";

const STORAGE_KEY = "fabric-prep-diagram-theme";

export function getDiagramTheme(): DiagramTheme {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // fallback
  }
  return "dark"; // Default to dark mode as requested
}

export function setDiagramTheme(theme: DiagramTheme) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
    window.dispatchEvent(new CustomEvent("diagram-theme-changed", { detail: theme }));
  } catch {
    // ignore
  }
}

export function useDiagramTheme(): [
  DiagramTheme,
  (newTheme: DiagramTheme | ((prev: DiagramTheme) => DiagramTheme)) => void,
  () => void
] {
  const [theme, setThemeState] = useState<DiagramTheme>("dark");

  useEffect(() => {
    setThemeState(getDiagramTheme());

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<DiagramTheme>;
      if (customEvent.detail) {
        setThemeState(customEvent.detail);
      } else {
        setThemeState(getDiagramTheme());
      }
    };

    window.addEventListener("diagram-theme-changed", handleThemeChange);
    return () => window.removeEventListener("diagram-theme-changed", handleThemeChange);
  }, []);

  const setTheme = useCallback(
    (newThemeOrUpdater: DiagramTheme | ((prev: DiagramTheme) => DiagramTheme)) => {
      setThemeState((prev) => {
        const nextTheme =
          typeof newThemeOrUpdater === "function" ? newThemeOrUpdater(prev) : newThemeOrUpdater;
        setDiagramTheme(nextTheme);
        return nextTheme;
      });
    },
    []
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, [setTheme]);

  return [theme, setTheme, toggleTheme];
}
