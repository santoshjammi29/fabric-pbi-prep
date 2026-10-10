"use client";

import { HeroCommandCenter } from "@/components/dashboard/hero-command-center";
import { ContinueLearning } from "@/components/dashboard/continue-learning";
import { TipOfDay } from "@/components/dashboard/tip-of-day";
import { TrendingSpotlight } from "@/components/dashboard/trending-spotlight";
import { HomeWhiteboardsShowcase } from "@/components/dashboard/home-whiteboards-showcase";
import { StatCards } from "@/components/dashboard/stat-cards";
import { ArchitectDigest } from "@/components/dashboard/architect-digest";

export default function DashboardPage() {
  return (
    <div className="space-y-12 pb-24 lg:pb-12 max-w-7xl mx-auto">
      {/* 1. Motivational Hero & 4 Core Pillars of Mastery */}
      <HeroCommandCenter />

      {/* 2. Personal Study Cockpit & Streak */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
              Study Command Center
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
              Resume Your Learning Momentum
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ContinueLearning />
          </div>
          <div className="lg:col-span-1">
            <TipOfDay />
          </div>
        </div>
      </section>

      {/* 3. Daily Curated Architecture Challenge & Simulator */}
      <section className="space-y-4">
        <TrendingSpotlight />
      </section>

      {/* 4. Whiteboard Architecture Blueprints Showcase */}
      <section className="space-y-4">
        <HomeWhiteboardsShowcase />
      </section>

      {/* 5. Platform Question Archives & Mastery Metrics */}
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

      {/* 6. Architect Digest Subscription */}
      <section>
        <ArchitectDigest />
      </section>
    </div>
  );
}
