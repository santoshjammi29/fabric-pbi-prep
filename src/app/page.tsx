"use client";

import { useUserStore } from "@/store/useUserStore";
import { RollingTicker } from "@/components/dashboard/rolling-ticker";
import { EditorialHero } from "@/components/dashboard/editorial-hero";
import { HeroQuickStart } from "@/components/dashboard/hero-quick-start";
import { ExperienceLevelSwitcher } from "@/components/dashboard/experience-level-switcher";
import { TopicCapsules } from "@/components/dashboard/topic-capsules";
import { TrendingSpotlight } from "@/components/dashboard/trending-spotlight";
import { ContinueLearning } from "@/components/dashboard/continue-learning";
import { TipOfDay } from "@/components/dashboard/tip-of-day";
import { StatCards } from "@/components/dashboard/stat-cards";
import { RoadmapGrid } from "@/components/dashboard/roadmap-grid";
import { ArchitectDigest } from "@/components/dashboard/architect-digest";

function SectionDivider({ text }: { text: string }) {
  return (
    <div className="section-divider">
      <span>{text}</span>
    </div>
  );
}

export default function DashboardPage() {
  const activeTier = useUserStore((s) => s.experienceTier);
  const isBeginnerRail = activeTier === "beginner";

  return (
    <div className="space-y-8 pb-24 lg:pb-12">
      {/* 1. Horizontal Scrolling Bar at the very top of the home page */}
      <RollingTicker />

      {/* 2. Editorial Magazine Hero Split */}
      <EditorialHero />

      {/* 3. Clear Guided Onboarding Bar: 'New to the Platform? Start Here' */}
      <HeroQuickStart />

      {/* 4. 4-Tier Interactive Experience Level Switcher */}
      <ExperienceLevelSwitcher />

      {/* For Beginners: Hoist the Visual Progression Roadmap to the TOP */}
      {isBeginnerRail && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <SectionDivider text="The Beginner's Rail: 6-Step Progression Curriculum" />
          <RoadmapGrid />
        </div>
      )}

      {/* 5. Category Capsule Navigation (Architecture Focus) */}
      <TopicCapsules />

      {/* 6. Daily Curated Spotlight (Scenario, Code, Simulator) */}
      <TrendingSpotlight />

      {/* 7. Continue Learning & Tip of Day */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ContinueLearning />
        </div>
        <div className="lg:col-span-1">
          <TipOfDay />
        </div>
      </div>

      {/* 8. Portal Analytics */}
      <SectionDivider text="Portal Analytics & Live Question Banks" />
      <StatCards />

      {/* For Advanced Tiers: Curriculum Roadmap in standard architectural position */}
      {!isBeginnerRail && (
        <>
          <SectionDivider text="Your Guided Curriculum Roadmap" />
          <RoadmapGrid />
        </>
      )}

      {/* 10. Architect Digest Subscription (SitePoint & Noupe callout box) */}
      <ArchitectDigest />
    </div>
  );
}
