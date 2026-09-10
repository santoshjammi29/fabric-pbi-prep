import { EditorialHero } from "@/components/dashboard/editorial-hero";
import { TopicCapsules } from "@/components/dashboard/topic-capsules";
import { TrendingSpotlight } from "@/components/dashboard/trending-spotlight";
import { ContinueLearning } from "@/components/dashboard/continue-learning";
import { TipOfDay } from "@/components/dashboard/tip-of-day";
import { StatCards } from "@/components/dashboard/stat-cards";
import { RoadmapGrid } from "@/components/dashboard/roadmap-grid";
import { ArchitectDigest } from "@/components/dashboard/architect-digest";
import { RollingTicker } from "@/components/dashboard/rolling-ticker";

function SectionDivider({ text }: { text: string }) {
  return (
    <div className="section-divider">
      <span>{text}</span>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-10 pb-24 lg:pb-12">
      {/* 1. Category Capsule Navigation (SitePoint style) */}
      <TopicCapsules />

      {/* 2. Mosaic Gradient Rolling Ticker — all topics across the database */}
      <RollingTicker />

      {/* 3. Editorial Magazine Hero Split (Noupe style) */}
      <EditorialHero />

      {/* 4. Daily Curated Spotlight (Noupe middle section) */}
      <TrendingSpotlight />

      {/* 4. Continue Learning & Tip of Day */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ContinueLearning />
        </div>
        <div className="lg:col-span-1">
          <TipOfDay />
        </div>
      </div>

      {/* 5. Portal Analytics */}
      <SectionDivider text="Portal Analytics & Live Question Banks" />
      <StatCards />

      {/* 6. Guided Curriculum Roadmap */}
      <SectionDivider text="Your Guided Curriculum Roadmap" />
      <RoadmapGrid />

      {/* 7. Architect Digest Subscription (SitePoint & Noupe callout box) */}
      <ArchitectDigest />
    </div>
  );
}
