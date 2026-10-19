import type { Metadata } from "next";
import { buildPageMetadata, generateCourseSchema, generateBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Multi-Level Concepts Mind Map | 660+ Concepts Linked to Topics",
  description:
    "Interactive multi-level stretching mind map linking 660+ enterprise data concepts across Microsoft Fabric, Databricks, Apache Spark, Delta Lake, Airflow, and Distributed Systems.",
  path: "/mindmap",
  keywords: [
    "Concepts Mind Map",
    "Data Engineering Mindmap",
    "Fabric Concept Tree",
    "Databricks Architecture Map",
    "Spark Core Mindmap",
    "Delta Lake Topography",
    "Distributed Systems Concepts",
  ],
});

export default function MindmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateCourseSchema({
    name: "Enterprise Data Concepts Multi-Level Mind Map",
    description: "Multi-level stretching mind map organizing 660+ concepts across 13 core technology domains.",
    url: "/mindmap",
  });

  const breadcrumbsJsonLd = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Concepts Mind Map", path: "/mindmap" },
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
