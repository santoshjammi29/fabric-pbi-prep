"use client";

import { RollingTicker } from "@/components/dashboard/rolling-ticker";
import { EditorialHero } from "@/components/dashboard/editorial-hero";
import { HomeWhiteboardsShowcase } from "@/components/dashboard/home-whiteboards-showcase";
import { HomeGuidedLearningHub } from "@/components/dashboard/home-guided-learning-hub";
import { TopicCapsules } from "@/components/dashboard/topic-capsules";
import { HeroQuickStart } from "@/components/dashboard/hero-quick-start";
import { ExperienceLevelSwitcher } from "@/components/dashboard/experience-level-switcher";
import { TrendingSpotlight } from "@/components/dashboard/trending-spotlight";
import { ContinueLearning } from "@/components/dashboard/continue-learning";
import { TipOfDay } from "@/components/dashboard/tip-of-day";
import { StatCards } from "@/components/dashboard/stat-cards";
import { RoadmapGrid } from "@/components/dashboard/roadmap-grid";
import { ArchitectDigest } from "@/components/dashboard/architect-digest";

export default function DashboardPage() {
  return (
    <div className="space-y-10 pb-24 lg:pb-12">
      {/* 1. Horizontal Live Ticker */}
      <RollingTicker />

      {/* 2. Editorial Magazine Hero Split */}
      <EditorialHero />

      {/* 3. Architecture Topic Capsule Navigation */}
      <TopicCapsules />

      {/* 4. Executive Whiteboard Architecture Blueprints (21 Hand-Drawn Schematics) */}
      <HomeWhiteboardsShowcase />

      {/* 5. Guided Learning Journeys Hub (13 Senior Tracks & 4-Stage Milestones) */}
      <HomeGuidedLearningHub />

      {/* 6. Guided Quick-Start Bar (Dismissible with LocalStorage persistence) */}
      <HeroQuickStart />

      {/* 7. Daily Curated Spotlight (Scenario, Code Snippet, Simulator) */}
      <section className="section-deferred">
        <TrendingSpotlight />
      </section>

      {/* 8. Unified Progressive Learning Journey & Curriculum Roadmap */}
      <section className="space-y-4">
        <ExperienceLevelSwitcher />
        <RoadmapGrid />
      </section>

      {/* 9. Continue Learning & Tip of Day */}
      <section className="section-deferred grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ContinueLearning />
        </div>
        <div className="lg:col-span-1">
          <TipOfDay />
        </div>
      </section>

      {/* 10. Verified Platform Analytics & Live Archives */}
      <section className="section-deferred space-y-3">
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1">
          <span className="font-bold uppercase tracking-wider text-[11px] text-[var(--foreground)]">
            Platform Metrics &amp; Question Archives
          </span>
          <span className="text-[11px] text-[var(--muted-foreground)] hidden sm:inline">
            6,570+ Verified Scenarios &amp; Live Guides
          </span>
        </div>
        <StatCards />
      </section>

      {/* 11. Architect Digest Subscription */}
      <section className="section-deferred">
        <ArchitectDigest />
      </section>
    </div>
  );
}
