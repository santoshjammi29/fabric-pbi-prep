import { Metadata } from "next";
import { Suspense } from "react";
import {
  getArchitectureDataDAL,
  getCodePracticeDataDAL,
  getModernStackDAL,
} from "@/lib/dal";
import { ArchitectureClient } from "./architecture-client";
import { generatePageMetadata, generateCourseSchema } from "@/lib/seo";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const archData = await getArchitectureDataDAL();
  return generatePageMetadata({
    title: `Lakehouse Architecture Hub: ${archData.length} Enterprise Scenarios & Blueprints`,
    description: `Master modern Lakehouse Architecture, Medallion patterns, Spark 4.0 execution, and distributed systems with ${archData.length} production scenarios and digital whiteboards.`,
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
  const [archData, codeData, modernData] = await Promise.all([
    getArchitectureDataDAL(),
    getCodePracticeDataDAL(),
    getModernStackDAL(),
  ]);

  const totalCount = archData.length;
  const initialArchitecture = archData.slice(0, 30);

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
