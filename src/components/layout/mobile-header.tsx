"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header
      className={cn(
        "lg:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4",
        "bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)]"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
          DP
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)] leading-tight">
            MS Data Platform
          </h2>
          <span className="text-[10px] font-medium text-[var(--muted-foreground)]">
            Architect Prep
          </span>
        </div>
      </div>

      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className={cn(
          "p-2 rounded-xl transition-colors",
          "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
          "hover:bg-[var(--surface-3)]"
        )}
        aria-label="Toggle light and dark theme"
      >
        {mounted && (theme === "dark" ? <Sun size={18} /> : <Moon size={18} />)}
      </button>
    </header>
  );
}
