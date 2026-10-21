import { Metadata } from "next";
import { Suspense } from "react";
import {
  getCodePracticeDataDAL,
  getModernStackDAL,
} from "@/lib/dal";
import { TOTAL_SCENARIO_COUNT, INITIAL_SCENARIO_ITEMS } from "@/data/initial-data";
import { ArchitectureClient } from "./architecture-client";
import { generatePageMetadata, generateCourseSchema } from "@/lib/seo";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: `Lakehouse Architecture Hub: ${TOTAL_SCENARIO_COUNT} Enterprise Scenarios & Blueprints`,
    description: `Master modern Lakehouse Architecture, Medallion patterns, Spark 4.0 execution, and distributed systems with ${TOTAL_SCENARIO_COUNT} production scenarios and digital whiteboards.`,
    path: "/architecture",
    keywords: [
      "Lakehouse Architecture",
      "Lakehouse",
      "Data Lakehouse",
      "Medallion Architecture",
      "Enterprise Blueprints",
      "Data Architect Scenarios",
      "Fabric vs Databricks",
      "Delta Lake Architecture",
    ],
  });
}

export default async function ArchitecturePage() {
  const [codeData, modernData] = await Promise.all([
    getCodePracticeDataDAL(),
    getModernStackDAL(),
  ]);

  const totalCount = TOTAL_SCENARIO_COUNT;
  const initialArchitecture = INITIAL_SCENARIO_ITEMS;

  const courseSchema = generateCourseSchema(
    "Enterprise Data Lakehouse Architecture Hub",
    `Comprehensive reference of ${totalCount} system blueprints, distributed runbooks, and whiteboards for data architects.`
  );

  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://lakehousearchitect.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Enterprise Architecture Hub",
        item: "https://lakehousearchitect.com/architecture",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      <Suspense
        fallback={
          <div className="py-20 text-center text-sm text-[var(--muted-foreground)]">
            Loading Enterprise Architecture &amp; Python Hub...
          </div>
        }
      >
        <ArchitectureClient
          initialArchitecture={initialArchitecture}
          totalCount={totalCount}
          initialPython={codeData.python}
          initialMatrix={modernData.matrix}
          initialModernStack={modernData.stack}
        />
      </Suspense>
    </>
  );
}
