import type { Metadata } from "next";
import { buildPageMetadata, generateCourseSchema, generateBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Polyglot Data Engineering Code Sheets (PySpark, SQL & Python)",
  description:
    "Interactive production code sheets for PySpark 3.5/4.0, Spark SQL, T-SQL / Fabric Warehouse, and Advanced Python Data Engineering patterns.",
  path: "/code-practice",
  ogImage: "/diagrams/spark_shuffle_memory_execution.webp",
  keywords: [
    "PySpark Code Sheet",
    "Spark SQL Interview Queries",
    "Fabric T-SQL Runbook",
    "Data Engineering Code Practice",
  ],
});

export default function CodePracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateCourseSchema({
    name: "Polyglot Data Engineering Code Sheets and Runbooks",
    description: "Production code snippets, syntax templates, and optimization patterns.",
    url: "/code-practice",
  });

  const breadcrumbsJsonLd = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Polyglot Code Sheets", path: "/code-practice" },
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
