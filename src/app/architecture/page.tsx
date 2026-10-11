import { Metadata } from "next";
import { Suspense } from "react";
import {
  getArchitectureDataDAL,
  getCodePracticeDataDAL,
  getModernStackDAL,
} from "@/lib/dal";
import { ArchitectureClient } from "./architecture-client";
import { generatePageMetadata, generateCourseSchema } from "@/lib/seo";

export const revalidate = 3600; // 1-hour ISR cache on edge

export async function generateMetadata(): Promise<Metadata> {
  const archData = await getArchitectureDataDAL();
  return generatePageMetadata({
    title: `Enterprise Architecture Hub (${archData.length} Scenarios & Blueprints) | Fabric Prep`,
    description: `Master distributed systems, Lakehouse trade-offs, and enterprise data architecture with ${archData.length} production interview scenarios.`,
    path: "/architecture",
    keywords: ["Lakehouse Architecture", "Enterprise Blueprints", "Data Architect Scenarios", "Fabric vs Databricks"],
  });
}

export default async function ArchitecturePage() {
  const [archData, codeData, modernData] = await Promise.all([
    getArchitectureDataDAL(),
    getCodePracticeDataDAL(),
    getModernStackDAL(),
  ]);

  const courseSchema = generateCourseSchema(
    "Enterprise Data Lakehouse Architecture Hub",
    `Comprehensive reference of ${archData.length} system blueprints, distributed runbooks, and whiteboards for data architects.`
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <Suspense
        fallback={
          <div className="py-20 text-center text-sm text-[var(--muted-foreground)]">
            Loading Enterprise Architecture &amp; Python Hub...
          </div>
        }
      >
        <ArchitectureClient
          initialArchitecture={archData}
          initialPython={codeData.python}
          initialMatrix={modernData.matrix}
          initialModernStack={modernData.stack}
        />
      </Suspense>
    </>
  );
}
