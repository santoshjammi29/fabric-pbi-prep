import { Suspense } from "react";
import type { Metadata } from "next";
import { getUnifiedQuestionsDAL } from "@/lib/dal";
import { architectureDiagrams } from "@/data";
import { QaPrepClient } from "./qa-prep-client";
import { buildPageMetadata, generateCourseSchema, generateFAQSchema, generateBreadcrumbSchema } from "@/lib/seo";

// Incremental Static Regeneration (ISR) - revalidates once per hour
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const allQuestions = await getUnifiedQuestionsDAL();
  return buildPageMetadata({
    title: `Lakehouse Architect Interview Questions & Scenarios (${allQuestions.length}+ Q&As)`,
    description:
      `Master Lakehouse Architecture interviews with ${allQuestions.length}+ verified questions with deep architectural answers covering Microsoft Fabric, Databricks, PySpark, Delta Lake, and Medallion System Design.`,
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
  const questions = await getUnifiedQuestionsDAL();

  // Generate FAQ JSON-LD schema for Google Rich Results using top 20 questions
  const sampleFaqs = questions.slice(0, 20).map((q) => ({
    question: q.question,
    answer: q.answer,
  }));
  const faqJsonLd = generateFAQSchema(sampleFaqs);

  const courseJsonLd = generateCourseSchema({
    name: "Enterprise Data Platform Technical Interview Preparation",
    description: "6,500+ verified technical questions, trade-off rubrics, and deep architectural solutions.",
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
        <QaPrepClient initialQuestions={questions} diagrams={architectureDiagrams} />
      </Suspense>
    </>
  );
}
