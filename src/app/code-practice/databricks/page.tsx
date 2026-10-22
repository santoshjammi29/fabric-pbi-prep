import { Metadata } from "next";
import { Suspense } from "react";
import { getDatabricksCodingHubDAL } from "@/lib/dal";
import { DatabricksCodingClient } from "./databricks-coding-client";
import { generatePageMetadata, generateCourseSchema } from "@/lib/seo";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const { suite, operations } = await getDatabricksCodingHubDAL();
  const total = suite.cards.length + operations.length;
  return generatePageMetadata({
    title: `Databricks Polyglot Coding Hub (${total}+ Operations) | PySpark, SQL, DBFS & Memory Triage`,
    description: `Exhaustive Databricks coding sheets covering Spark SQL, PySpark, DBFS & Volumes, Catalyst optimization, Delta Lake, DLT, DABs, and production memory bottleneck triage.`,
    path: "/code-practice/databricks",
    keywords: [
      "Databricks Coding Practice",
      "Databricks 100",
      "Databricks DBFS Commands",
      "PySpark Transformations",
      "Spark SQL Delta Lake",
      "Spark OOM Troubleshooting",
      "Databricks Cheat Sheet",
      "Delta Live Tables DLT",
      "Databricks Asset Bundles DABs",
    ],
  });
}

export default async function DatabricksCodingSubpage() {
  const { suite, operations } = await getDatabricksCodingHubDAL();

  const courseSchema = generateCourseSchema(
    "Databricks Polyglot Coding Practice Hub",
    "Exhaustive Databricks coding sheets covering Spark SQL, PySpark, DBFS & Volumes, Catalyst optimization, and production memory bottleneck triage."
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
            <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading Databricks Coding Hub...</span>
            </div>
          </div>
        }
      >
        <DatabricksCodingClient suiteData={suite} operationsData={operations} />
      </Suspense>
    </>
  );
}
