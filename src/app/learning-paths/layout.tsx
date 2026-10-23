import type { Metadata } from "next";
import { buildPageMetadata, generateCourseSchema, generateBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Architect Learning Paths & Interactive Decision Ledgers",
  description:
    "End-to-end curriculums for Associate, Lead, and Principal Architects with real-world architecture decision record (ADR) ledgers.",
  path: "/learning-paths",
  ogImage: "/diagrams/kimball_dimensional_star_schema.webp",
  keywords: [
    "Data Architect Roadmap",
    "Architecture Decision Records ADR",
    "Data Platform Curriculum",
    "Lead Data Engineer Progression",
  ],
});

export default function LearningPathsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateCourseSchema({
    name: "Data Platform Architect Curriculums and Decision Ledgers",
    description: "Multi-tier curriculums with production architectural trade-off decisions.",
    url: "/learning-paths",
  });

  const breadcrumbsJsonLd = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Architect Learning Paths", path: "/learning-paths" },
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
