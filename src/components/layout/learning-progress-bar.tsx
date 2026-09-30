"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Lock, ChevronRight, BookOpen, Code2, Zap, Layers, MessageSquare, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";
import { EXPERIENCE_TIERS } from "@/lib/user-progress";

export interface CurriculumStep {
  step: number;
  id: string;
  title: string;
  shortTitle: string;
  href: string;
  icon: React.ElementType;
  minQas: number;
}

export const CURRICULUM_STEPS: CurriculumStep[] = [
  {
    step: 1,
    id: "concepts",
    title: "Key Concepts",
    shortTitle: "Concepts",
    href: "/concepts",
    icon: BookOpen,
    minQas: 0,
  },
  {
    step: 2,
    id: "python",
    title: "Python Hub",
    shortTitle: "Python",
    href: "/python",
    icon: Code2,
    minQas: 5,
  },
  {
    step: 3,
    id: "spark-engine",
    title: "Spark Engine",
    shortTitle: "Spark",
    href: "/spark-engine",
    icon: Zap,
    minQas: 15,
  },
  {
    step: 4,
    id: "modern-stack",
    title: "Modern Stack",
    shortTitle: "Modern Stack",
    href: "/modern-stack",
    icon: Layers,
    minQas: 30,
  },
  {
    step: 5,
    id: "qa-prep",
    title: "Q&A Prep Hub",
    shortTitle: "Q&A Hub",
    href: "/qa-prep",
    icon: MessageSquare,
    minQas: 45,
  },
  {
    step: 6,
    id: "architecture",
    title: "Architecture Hub",
    shortTitle: "Architecture",
    href: "/architecture",
    icon: Compass,
    minQas: 60,
  },
];

export function LearningProgressBar() {
  const pathname = usePathname();
  const experienceTier = useUserStore((s) => s.experienceTier);
  const reviewedCount = useUserStore((s) => s.userData.reviewedCount);
  const tierConfig = EXPERIENCE_TIERS[experienceTier] || EXPERIENCE_TIERS.associate;

  // Identify active step from URL
  const activeStep = useMemo(() => {
    if (!pathname) return 1;
    const match = CURRICULUM_STEPS.find((s) => pathname.startsWith(s.href));
    if (match) return match.step;
    if (pathname.startsWith("/code-practice")) return 2;
    if (pathname.startsWith("/learning-paths")) return 1;
    if (pathname.startsWith("/guided-learning")) return 2;
    return 1;
  }, [pathname]);

  // Overall progress percentage based on reviewed count and current step
  const progressPercent = useMemo(() => {
    const stepWeight = ((activeStep - 1) / 6) * 60;
    const reviewWeight = Math.min(40, (reviewedCount / 50) * 40);
    return Math.min(100, Math.round(stepWeight + reviewWeight));
  }, [activeStep, reviewedCount]);

  const activeStepConfig = CURRICULUM_STEPS[activeStep - 1] || CURRICULUM_STEPS[0];

  return (
    <div className="w-full bg-[var(--surface-0)] border-b border-[var(--border)] py-2 px-4 sm:px-6 lg:px-8 text-xs backdrop-blur-md sticky top-0 z-30 shadow-sm">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] flex items-center justify-between gap-4">
        {/* Left: Active Location & Track Indicator */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {tierConfig.label} Rail
          </span>
          <div className="flex items-center gap-1.5 font-semibold text-[var(--foreground)]">
            <span className="text-[var(--muted-foreground)]">Location:</span>
            <span className="text-cyan-400 font-bold">Step {activeStep} of 6</span>
            <span className="text-[var(--muted-foreground)] hidden md:inline">·</span>
            <span className="hidden md:inline font-bold text-[var(--foreground)] truncate max-w-[180px]">
              {activeStepConfig.title}
            </span>
          </div>
        </div>

        {/* Center: Stepper Rail with connecting line */}
        <div className="hidden lg:flex items-center gap-1.5 flex-1 max-w-xl mx-4">
          <div className="relative w-full flex items-center justify-between">
            {/* Background line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[var(--surface-2)] rounded-full -z-0" />
            
            {/* Filled line */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-300 -z-0"
              style={{ width: `${((activeStep - 1) / 5) * 100}%` }}
            />

            {CURRICULUM_STEPS.map((s) => {
              const isPast = s.step < activeStep;
              const isCurrent = s.step === activeStep;
              const isUnlocked =
                s.minQas === 0 ||
                reviewedCount >= s.minQas ||
                experienceTier !== "beginner";

              return (
                <Link
                  key={s.step}
                  href={s.href}
                  className="group relative z-10 flex flex-col items-center"
                  title={`${s.step}. ${s.title}${!isUnlocked ? " (Locked)" : ""}`}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border",
                      isCurrent
                        ? "bg-purple-600 text-white border-purple-400 ring-2 ring-purple-500/30 scale-110 shadow-md shadow-purple-600/30"
                        : isPast
                        ? "bg-cyan-500 text-black border-cyan-400 shadow-sm"
                        : isUnlocked
                        ? "bg-[var(--surface-1)] text-[var(--muted-foreground)] border-[var(--border)] group-hover:border-cyan-400 group-hover:text-[var(--foreground)]"
                        : "bg-[var(--surface-2)] text-neutral-500 border-neutral-800"
                    )}
                  >
                    {isPast ? <Check size={11} className="stroke-[3]" /> : isUnlocked ? s.step : <Lock size={10} />}
                  </div>
                  <span
                    className={cn(
                      "absolute top-7 text-[10px] font-semibold whitespace-nowrap transition-colors pointer-events-none opacity-0 group-hover:opacity-100",
                      isCurrent ? "text-purple-400 opacity-100 font-bold" : "text-[var(--muted-foreground)]"
                    )}
                  >
                    {s.shortTitle}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Progress % & Next Step CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
            <span>Overall:</span>
            <span className="font-bold text-[var(--foreground)]">{progressPercent}%</span>
          </div>

          {activeStep < 6 && (
            <Link
              href={CURRICULUM_STEPS[activeStep].href}
              className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] border border-[var(--border)] transition-colors"
            >
              <span>Next: {CURRICULUM_STEPS[activeStep].shortTitle}</span>
              <ChevronRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
