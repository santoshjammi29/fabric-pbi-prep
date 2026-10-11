import type { Metadata } from "next";
import { buildPageMetadata, generateCourseSchema } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Interactive System Architecture Mindmap (7 Domains)",
  description:
    "Explore the modern data platform ecosystem across 7 core domains: Ingestion & Streaming, Lakehouse Storage, Distributed Compute, DataOps, Analytical Serving, Governance, and AI/Vector Search.",
  path: "/mindmap",
  ogImage: "https://fabric-pbi-prep.vercel.app/diagrams/fabric_onelake_architecture.webp",
  keywords: [
    "Data Engineering Mindmap",
    "Interactive Architecture Graph",
    "Lakehouse Knowledge Map",
    "Data Platform Concept Topology",
  ],
});

export default function MindmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateCourseSchema({
    name: "Interactive Modern Data Architecture Mindmap",
    description: "Visual architectural topology across 7 data engineering domains.",
    url: "/mindmap",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
