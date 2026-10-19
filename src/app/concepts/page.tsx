import { Suspense } from "react";
import type { Metadata } from "next";
import { getConceptsDAL, getConceptsCategoriesDAL } from "@/lib/dal";
import { architectureDiagrams } from "@/data";
import { ConceptsClient } from "./concepts-client";
import { buildPageMetadata, generateCourseSchema, generateHowToSchema, generateBreadcrumbSchema } from "@/lib/seo";

// Incremental Static Regeneration (ISR) - revalidates once per hour
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const concepts = await getConceptsDAL();
  return buildPageMetadata({
    title: `Core Architectural Concepts (${concepts.length} Topics)`,
    description:
      "Deep dive into Microsoft Fabric, Databricks, Apache Airflow, Delta Lake, and Data Vault architectural concepts with spaced repetition flashcards.",
    path: "/concepts",
    keywords: ["Fabric Concepts", "Databricks Terms", "Airflow Architecture", "Delta Lake Internals", "Data Engineering Lexicon"],
  });
}

export default async function ConceptsPage() {
  const [concepts, categories] = await Promise.all([
    getConceptsDAL(),
    getConceptsCategoriesDAL(),
  ]);

  const courseJsonLd = generateCourseSchema({
    name: "Enterprise Data Platform Architectural Concepts",
    description: "Foundational and advanced architecture concepts covering Microsoft Fabric, Databricks, Delta Lake, and Airflow.",
    url: "/concepts",
  });

  const howToJsonLd = generateHowToSchema({
    name: "How to Master Enterprise Data Engineering Concepts",
    description: "Step-by-step methodology to review, memorize, and apply data platform concepts in technical interviews.",
    steps: [
      { name: "Filter by Domain", text: "Select your target domain (Fabric, Databricks, Airflow, Delta Lake) using category pills." },
      { name: "Review Definitions", text: "Read the core definition and study key architectural design trade-offs." },
      { name: "Practice with Flashcards", text: "Switch to interactive flashcards to test recall using spaced repetition." },
    ],
  });

  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Core Concepts & Foundations", path: "/concepts" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense fallback={<div className="p-8 text-center text-sm text-[var(--muted-foreground)]">Loading Concepts Library...</div>}>
        <ConceptsClient initialConcepts={concepts} categories={categories} diagrams={architectureDiagrams} />
      </Suspense>
    </>
  );
}
