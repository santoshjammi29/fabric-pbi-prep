"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, X } from "lucide-react";

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Latest release announcement"
      className="relative z-30 w-full bg-gradient-to-r from-purple-950/90 via-[#111124] to-blue-950/90 border-b border-white/10 px-4 py-2.5 text-xs text-slate-200 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 mx-auto sm:mx-0 overflow-hidden">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 text-[10px] uppercase tracking-wider shrink-0">
            <Sparkles size={11} className="text-purple-400" />
            2026 Edition
          </span>
          <p className="truncate font-medium text-slate-300 text-[11px] sm:text-xs">
            <strong className="text-white">Microsoft Fabric DP-600 &amp; Spark 4.0 Architecture Bank</strong>{" "}
            <span className="hidden md:inline text-slate-400">— 6,100+ vetted scenario Q&amp;As, 6 simulators &amp; polyglot sheets.</span>
          </p>
          <Link
            href="/qa-prep"
            className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-semibold text-[11px] shrink-0 ml-1 hover:underline"
          >
            <span>Explore Bank</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 flex items-center justify-center touch-manipulation"
          aria-label="Close banner"
        >
          <X size={14} />
        </button>
      </div>
    </aside>
  );
}
