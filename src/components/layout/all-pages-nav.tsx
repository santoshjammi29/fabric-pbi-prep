"use client";

import React, { Suspense } from "react";
import { Search } from "lucide-react";

function AllPagesNavInner() {
  const openSearch = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-command-palette"));
    }
  };

  return (
    <div
      className="w-full bg-[var(--surface-1)] border-b border-[var(--border)] select-none shadow-2xs"
      role="search"
      aria-label="Universal Search Header"
    >
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-3 sm:px-6 lg:px-8 py-2.5">
        <button
          type="button"
          onClick={openSearch}
          className="w-full flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-blue-500/40 text-left transition-all duration-150 group shadow-2xs cursor-pointer"
          aria-label="Universal search across all Q&As, concepts, architecture blueprints, and topics"
        >
          <div className="flex items-center gap-2.5 min-w-0 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]">
            <Search size={15} className="shrink-0 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm font-medium truncate">
              Search 10,700+ Q&As, concepts, architecture blueprints, system design...
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-[var(--muted-foreground)]">
              Quick Open
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-[var(--surface-1)] text-[var(--muted-foreground)] border border-[var(--border)] shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </button>
      </div>
    </div>
  );
}

export function AllPagesNav() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-14 bg-[var(--surface-1)] border-b border-[var(--border)] animate-pulse" />
      }
    >
      <AllPagesNavInner />
    </Suspense>
  );
}
