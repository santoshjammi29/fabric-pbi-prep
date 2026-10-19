import { Suspense } from "react";
import type { Metadata } from "next";
import { getConceptsDAL, getConceptsCategoriesDAL } from "@/lib/dal";
import { architectureDiagrams } from "@/data";
import { ConceptsClient } from "./concepts-client";
import { buildPageMetadata, generateCourseSchema, generateHowToSchema, generateBreadcrumbSchema } from "@/lib/seo";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const concepts = await getConceptsDAL();
  return buildPageMetadata({
    title: `Lakehouse Concepts & Architecture Glossary (${concepts.length} Terms)`,
    description:
      `Master modern Lakehouse Architecture concepts, Delta Lake, Apache Iceberg, Unity Catalog, and Medallion patterns with ${concepts.length} architectural definitions and spaced repetition cards.`,
    path: "/concepts",
    keywords: [
      "Lakehouse Concepts",
      "Lakehouse Architecture",
      "Lakehouse Glossary",
      "Data Lakehouse Terms",
      "Delta Lake Internals",
      "Medallion Architecture Concepts",
      "Unity Catalog",
      "Microsoft Fabric Concepts",
    ],
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
