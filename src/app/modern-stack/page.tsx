import { Metadata } from "next";
import { Suspense } from "react";
import { getModernStackDAL, getCodePracticeDataDAL } from "@/lib/dal";
import { ModernStackClient } from "./modern-stack-client";
import { generatePageMetadata, generateCourseSchema } from "@/lib/seo";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const modernData = await getModernStackDAL();
  return generatePageMetadata({
    title: `Modern Data Stack & AI Architecture (${modernData.blueprints.length} Blueprints)`,
    description: `Enterprise guide to modern Lakehouse architectures, Iceberg vs Delta, dbt Core, Kafka event streams, and LLM RAG pipelines.`,
    path: "/modern-stack",
    keywords: ["Modern Data Stack", "Apache Iceberg", "Delta Lake", "dbt Core", "Vector Databases", "GenAI RAG"],
  });
}

export default async function ModernStackPage() {
  const [modernData, codeData] = await Promise.all([
    getModernStackDAL(),
    getCodePracticeDataDAL(),
  ]);

  const courseSchema = generateCourseSchema(
    "Modern Data Stack & AI Architecture Masterclass",
    `Comprehensive reference of ${modernData.blueprints.length} production blueprints, execution simulators, and architectural trade-offs.`
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
              <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading Modern Data Stack...</span>
            </div>
          </div>
        }
      >
        <ModernStackClient
          initialModernStack={modernData}
          initialPython={codeData.python}
        />
      </Suspense>
    </>
  );
}
