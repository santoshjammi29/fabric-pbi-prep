"use client";

import { HeroCommandCenter } from "@/components/dashboard/hero-command-center";
import { RecentDeploymentsRadar } from "@/components/dashboard/recent-deployments-radar";
import { ContentStructureMatrix } from "@/components/dashboard/content-structure-matrix";
import { ContinueLearning } from "@/components/dashboard/continue-learning";
import { TipOfDay } from "@/components/dashboard/tip-of-day";
import { TrendingSpotlight } from "@/components/dashboard/trending-spotlight";
import { HomeWhiteboardsShowcase } from "@/components/dashboard/home-whiteboards-showcase";
import { StatCards } from "@/components/dashboard/stat-cards";
import { ArchitectDigest } from "@/components/dashboard/architect-digest";

export function DashboardClient() {
  return (
    <div className="space-y-8 sm:space-y-10 pb-16 max-w-7xl mx-auto px-2 sm:px-4">
      {/* 1. Motivational Hero & 6 Core Pillars of Mastery */}
      <HeroCommandCenter />

      {/* 2. Platform Release Radar & What's Recently Deployed */}
      <RecentDeploymentsRadar />

      {/* 3. Full Content Architecture & Subpages Matrix */}
      <ContentStructureMatrix />

      {/* 4. Personal Study Cockpit & Streak */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="text-[11px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider">
              Study Command Center
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] tracking-tight">
              Resume Your Learning Momentum
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4">
          <div className="lg:col-span-2">
            <ContinueLearning />
          </div>
          <div className="lg:col-span-1">
            <TipOfDay />
          </div>
        </div>
      </section>

      {/* 5. Whiteboard Architecture Blueprints Showcase (32 Blueprints) */}
      <section className="space-y-4">
        <HomeWhiteboardsShowcase />
      </section>

      {/* 6. Daily Curated Architecture Challenge & Simulator */}
      <section className="space-y-4">
        <TrendingSpotlight />
      </section>

      {/* 7. Platform Question Archives & Mastery Metrics */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1">
          <span className="font-bold uppercase tracking-wider text-[11px] text-[var(--foreground)]">
            Verified Question Bank Metrics
          </span>
          <span className="text-[11px] text-[var(--muted-foreground)] hidden sm:inline">
            6,570+ Verified Scenarios Across Core Technical Domains
          </span>
        </div>
        <StatCards />
      </section>

      {/* 8. Architect Digest Subscription */}
      <section>
        <ArchitectDigest />
      </section>
    </div>
  );
}
