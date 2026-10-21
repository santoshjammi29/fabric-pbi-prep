import type { Metadata } from "next";
import { buildPageMetadata, generateCourseSchema, generateBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Guided Learning Journeys & Cross-Section Tracks",
  description:
    "Curated step-by-step learning paths connecting foundational concepts, interview questions, architectural whiteboards, and code practice across 9 critical data platform pillars.",
  path: "/guided-learning",
  ogImage: "https://lakehousearchitect.com/diagrams/databricks_medallion_architecture.webp",
  keywords: [
    "Fabric Guided Learning",
    "Databricks Learning Path",
    "Apache Airflow Track",
    "Spark Engine Curriculum",
    "dbt Transformation Journey",
  ],
});

export default function GuidedLearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateCourseSchema({
    name: "Architect Guided Learning Paths",
    description: "Curated learning journeys across 9 core data platform pillars.",
    url: "/guided-learning",
  });

  const breadcrumbsJsonLd = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Guided Learning Journeys", path: "/guided-learning" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      {children}
    </>
  );
}
