import { Suspense } from "react";
import type { Metadata } from "next";
import { StudioClient } from "./studio-client";
import { buildPageMetadata } from "@/lib/seo";

// Incremental Static Regeneration (ISR)
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Personal Learning Studio & Progress Tracker",
    description: "Track your review streaks, bookmarks, mastered interview topics, and local study telemetry in your private offline-first studio.",
    path: "/studio",
    keywords: [
      "Data Engineer Study Studio",
      "Interview Progress Tracker",
      "Offline Study Studio",
      "Architecture Study Bookmarks",
    ],
  });
}

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-[var(--muted-foreground)]">
          Loading Personal Studio...
        </div>
      }
    >
      <StudioClient />
    </Suspense>
  );
}
