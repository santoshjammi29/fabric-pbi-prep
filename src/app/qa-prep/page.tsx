import { Suspense } from "react";
import type { Metadata } from "next";
import { TOTAL_QA_COUNT, INITIAL_QA_ITEMS } from "@/data/initial-data";
import { architectureDiagrams } from "@/data/diagrams";
import { QaPrepClient } from "./qa-prep-client";
import { buildPageMetadata, generateCourseSchema, generateFAQSchema, generateBreadcrumbSchema } from "@/lib/seo";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: `Lakehouse Architect Interview Questions & Scenarios (${TOTAL_QA_COUNT}+ Q&As)`,
    description:
      `Master Lakehouse Architecture interviews with ${TOTAL_QA_COUNT}+ verified questions with deep architectural answers covering Microsoft Fabric, Databricks, PySpark, Delta Lake, and Medallion System Design.`,
    path: "/qa-prep",
    keywords: [
      "Lakehouse Architect Interview Questions",
      "Lakehouse Architecture",
      "Lakehouse Scenarios",
      "Data Engineer Interview Questions",
      "Fabric Interview Q&A",
      "Databricks Architecture Questions",
      "PySpark Performance Tuning",
      "Delta Lake Interview Scenarios",
    ],
  });
}

export default async function QaPrepPage() {
  const totalCount = TOTAL_QA_COUNT;
  const initialQuestions = INITIAL_QA_ITEMS;

  // Generate FAQ JSON-LD schema for Google Rich Results using top 20 questions
  const sampleFaqs = initialQuestions.slice(0, 20).map((q) => ({
    question: q.question,
    answer: q.answer,
  }));
  const faqJsonLd = generateFAQSchema(sampleFaqs);

  const courseJsonLd = generateCourseSchema({
    name: "Enterprise Data Platform Technical Interview Preparation",
    description: `${totalCount.toLocaleString()}+ verified technical questions, trade-off rubrics, and deep architectural solutions.`,
    url: "/qa-prep",
  });

  const breadcrumbJsonLd = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Interview Q&A Hub", path: "/qa-prep" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense fallback={<div className="p-8 text-center text-sm text-[var(--muted-foreground)]">Loading Interview Practice Hub...</div>}>
        <QaPrepClient
          initialQuestions={initialQuestions}
          totalQuestionCount={totalCount}
          diagrams={architectureDiagrams}
        />
      </Suspense>
    </>
  );
}
