import { Suspense } from "react";
import type { Metadata } from "next";
import { GuidedLearningClient } from "./guided-learning-client";
import { buildPageMetadata, generateCourseSchema } from "@/lib/seo";
import { GUIDED_TOPICS } from "@/data/guided-learning-topics";
import { PLATFORM_CONFIG } from "@/config/platform.config";

// Incremental Static Regeneration (ISR) - 1 hour edge cache
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: `Guided Learning & Technical Roadmaps (${GUIDED_TOPICS.length} Tracks)`,
    description: `Structured curriculum covering ${GUIDED_TOPICS.length} specialized topic tracks from data fundamentals to Principal Data Architect mastery with continuous reading mode.`,
    path: "/guided-learning",
    keywords: [
      "Data Engineering Roadmap",
      "Fabric Learning Path",
      "Databricks Certification Path",
      "PySpark Mastery",
      "Architect Milestones",
      "Lakehouse Curriculum",
    ],
  });
}

export default function GuidedLearningPage() {
  const courseJsonLd = generateCourseSchema({
    name: "Enterprise Data Platform Guided Learning Paths",
    description: `Structured multi-stage roadmaps across ${GUIDED_TOPICS.length} topics for mastering modern lakehouse engineering and architecture.`,
    url: "/guided-learning",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <Suspense
        fallback={
          <div className="py-20 text-center text-sm text-[var(--muted-foreground)]">
            Loading Guided Learning Journeys...
          </div>
        }
      >
        <GuidedLearningClient />
      </Suspense>
    </>
  );
}
