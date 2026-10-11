import { Metadata } from "next";
import { Suspense } from "react";
import { getLearningPathsDAL } from "@/lib/dal";
import { LearningPathsClient } from "./learning-paths-client";
import { generatePageMetadata, generateCourseSchema } from "@/lib/seo";

export const revalidate = 3600; // 1-hour ISR cache on edge

export async function generateMetadata(): Promise<Metadata> {
  const paths = await getLearningPathsDAL();
  return generatePageMetadata({
    title: `Role-Based Learning Paths (${paths.length} Curricula) | Fabric & Data Engineering`,
    description: `Structured week-by-week learning roadmaps for Fabric DP-600, Lakehouse Solutions Architect, and Lead Data Engineer.`,
    path: "/learning-paths",
    keywords: ["Fabric Learning Paths", "Data Architect Career", "DP-600 Curriculum", "Lakehouse Roadmap"],
  });
}

export default async function LearningPathsPage() {
  const paths = await getLearningPathsDAL();

  const courseSchema = generateCourseSchema(
    "Data Platform & Lakehouse Career Roadmaps",
    "12 end-to-end role curricula with week-by-week phase breakdowns, projects, and certification exam prep."
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
            <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading Learning Paths...</span>
            </div>
          </div>
        }
      >
        <LearningPathsClient initialPaths={paths} />
      </Suspense>
    </>
  );
}
