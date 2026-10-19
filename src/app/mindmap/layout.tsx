import type { Metadata } from "next";
import { buildPageMetadata, generateCourseSchema, generateBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Lakehouse Architecture & Systems Mind Map: 660+ Interactive Nodes",
  description:
    "Interactive multi-level stretching mind map visualizing Lakehouse Architecture, Medallion layers, Delta Lake internals, Apache Spark, and distributed systems design across 660+ linked concepts.",
  path: "/mindmap",
  keywords: [
    "Lakehouse Architecture Mind Map",
    "Lakehouse Mindmap",
    "Data Lakehouse Architecture",
    "Delta Lake Topography",
    "Medallion Architecture Tree",
    "Spark Core Mindmap",
    "Fabric Concept Tree",
    "Databricks Architecture Map",
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
