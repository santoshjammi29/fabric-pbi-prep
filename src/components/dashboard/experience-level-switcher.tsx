"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Award,
  Layers,
  CheckCircle2,
  Compass,
  Flame,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EXPERIENCE_TIERS,
  ExperienceTier,
  getStoredExperienceTier,
  setStoredExperienceTier,
} from "@/lib/user-progress";

export function ExperienceLevelSwitcher() {
  const [activeTier, setActiveTier] = useState<ExperienceTier>("associate");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initial = getStoredExperienceTier();
    setActiveTier(initial);

    const handleTierUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ tier: ExperienceTier }>;
      if (customEvent.detail?.tier) {
        setActiveTier(customEvent.detail.tier);
      }
    };

    window.addEventListener("dataprep:tier-updated", handleTierUpdate);
    return () => window.removeEventListener("dataprep:tier-updated", handleTierUpdate);
  }, []);

  const handleSelectTier = (tier: ExperienceTier) => {
    setActiveTier(tier);
    setStoredExperienceTier(tier);
  };

  const config = EXPERIENCE_TIERS[activeTier];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-6 sm:p-8 shadow-lg">
      {/* Background glow tailored to active tier */}
      <div
        className={cn(
          "absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-20",
          activeTier === "beginner" && "bg-emerald-500",
          activeTier === "associate" && "bg-blue-500",
          activeTier === "senior" && "bg-purple-500",
          activeTier === "staff_architect" && "bg-amber-500"
        )}
      />

      <div className="relative space-y-6">
        {/* Title and Tier Selector Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-400">
              <GraduationCap size={14} />
              <span>4-Tier Progressive Learning Journey</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
              Choose Your Target Engineering Level
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-xl">
              Switch your profile tier to dynamically filter curriculum priorities, recommended roadmaps, and interview scenarios.
            </p>
          </div>

          {/* 4 Interactive Tier Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[var(--surface-2)] p-1.5 rounded-2xl border border-[var(--border)]">
            {(Object.keys(EXPERIENCE_TIERS) as ExperienceTier[]).map((tierKey) => {
              const item = EXPERIENCE_TIERS[tierKey];
              const isSelected = activeTier === tierKey;

              return (
                <button
                  key={tierKey}
                  onClick={() => handleSelectTier(tierKey)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-center flex flex-col items-center justify-center gap-0.5",
                    isSelected
                      ? "bg-white dark:bg-slate-900 text-[var(--foreground)] shadow-md border border-[var(--border)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)]"
                  )}
                >
                  <span className="leading-tight">{item.label}</span>
                  <span
                    className={cn(
                      "text-[10px] font-normal",
                      isSelected ? item.color.accent : "text-[var(--muted-foreground)]"
                    )}
                  >
                    Tier {tierKey === "beginner" ? "1" : tierKey === "associate" ? "2" : tierKey === "senior" ? "3" : "4"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Tier Feature Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/60 p-5 sm:p-6 transition-all duration-500">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4 flex-1">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                    config.color.badge
                  )}
                >
                  <Award size={13} />
                  {config.badge}
                </span>

                <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                  Target Role: <strong className="text-[var(--foreground)]">{config.role}</strong>
                </span>

                <div className="flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]">
                  <span>Certs:</span>
                  {config.certs.map((cert) => (
                    <span
                      key={cert}
                      className="px-2 py-0.5 rounded-md bg-[var(--surface-1)] border border-[var(--border)] text-[10px] font-mono font-medium text-[var(--foreground)]"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-[var(--foreground)] leading-relaxed font-normal">
                {config.description}
              </p>

              {/* Recommended Steps indicators */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                  Recommended Roadmap Steps:
                </span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((stepNum) => {
                    const isRec = config.recommendedSteps.includes(stepNum);
                    return (
                      <span
                        key={stepNum}
                        className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                          isRec
                            ? "bg-purple-600 text-white shadow-sm"
                            : "bg-[var(--surface-1)] text-[var(--muted-foreground)] border border-[var(--border)] opacity-60"
                        )}
                        title={isRec ? `Recommended Step ${stepNum}` : `Step ${stepNum}`}
                      >
                        {stepNum}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Launch Call-To-Action Box */}
            <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3 shrink-0 md:w-80">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                <Compass size={14} className={config.color.accent} />
                <span>Curated Quick-Start</span>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-[var(--muted-foreground)]">Module: {config.startingPath.module}</div>
                <h4 className="text-sm font-bold text-[var(--foreground)] leading-snug">
                  {config.startingPath.title}
                </h4>
              </div>

              <div className="pt-1 flex flex-col gap-2">
                <Link
                  href={config.startingPath.href}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                >
                  <span>Launch {config.label} Path</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/learning-paths"
                  className="w-full text-center text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors py-1"
                >
                  Browse all 12 learning tracks &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
