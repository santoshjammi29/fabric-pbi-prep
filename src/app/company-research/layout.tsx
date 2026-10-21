import type { Metadata } from "next";
import { buildPageMetadata, generateCourseSchema, generateBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Tier-1 Enterprise & GCC Company Research Dossiers",
  description:
    "Architectural technology stack breakdowns, data platform footprints, and targeted interview preparation rubrics for Fortune 500 enterprises and GCC tech hubs.",
  path: "/company-research",
  ogImage: "https://lakehousearchitect.com/diagrams/unity_catalog_architecture.webp",
  keywords: [
    "Enterprise Tech Stack Dossiers",
    "GCC Data Architect Interview",
    "Targeted Company Prep",
    "Enterprise Data Engineering Rubrics",
  ],
});

export default function CompanyResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateCourseSchema({
    name: "Enterprise Architecture Interview Profiles",
    description: "Detailed tech stack profiles and company-specific interview blueprints.",
    url: "/company-research",
  });

  const breadcrumbsJsonLd = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Company Intelligence Dossiers", path: "/company-research" },
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
