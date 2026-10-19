import { Metadata } from "next";
import { Suspense } from "react";
import { getCodePracticeDataDAL } from "@/lib/dal";
import { CodePracticeClient } from "./code-practice-client";
import { generatePageMetadata, generateCourseSchema } from "@/lib/seo";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getCodePracticeDataDAL();
  const total =
    data.pyspark.length + data.sparksql.length + data.mssql.length + data.python.length;
  return generatePageMetadata({
    title: `Polyglot Code Practice (${total} Production Templates) | PySpark, SQL & Python`,
    description: `Hands-on data engineering coding templates across PySpark 4.0, Spark SQL, T-SQL, and Python for distributed data pipelines.`,
    path: "/code-practice",
    keywords: ["PySpark Code Practice", "Spark SQL Exercises", "T-SQL Window Functions", "Data Engineering Python"],
  });
}

export default async function CodePracticePage() {
  const data = await getCodePracticeDataDAL();

  const courseSchema = generateCourseSchema(
    "Polyglot Data Engineering Coding Practice",
    "Production-grade coding templates across PySpark, Spark SQL, T-SQL, and Python."
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
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading Polyglot Code Practice...</span>
            </div>
          </div>
        }
      >
        <CodePracticeClient initialData={data} />
      </Suspense>
    </>
  );
}
