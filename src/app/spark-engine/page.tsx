import { Metadata } from "next";
import { Suspense } from "react";
import { getCodePracticeDataDAL } from "@/lib/dal";
import { SparkEngineClient } from "./spark-engine-client";
import { generatePageMetadata, generateCourseSchema } from "@/lib/seo";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const codeData = await getCodePracticeDataDAL();
  return generatePageMetadata({
    title: "Apache Spark 4.0 Engine Architecture & Physical Execution Simulator",
    description: `Interactive simulator of Apache Spark 4.0 execution plan, Catalyst Optimizer, Tungsten memory allocator, and shuffle mechanics.`,
    path: "/spark-engine",
    keywords: ["Spark 4.0 Internals", "Catalyst Optimizer", "Tungsten Memory", "Shuffle Simulator", "PySpark 4.0"],
  });
}

export default async function SparkEnginePage() {
  const codeData = await getCodePracticeDataDAL();

  const courseSchema = generateCourseSchema(
    "Apache Spark 4.0 Internals & Physical Execution Simulator",
    "Interactive physical execution and memory management simulator for Apache Spark 4.0 and Lakehouse architectures."
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
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading Spark 4.0 Engine Simulator...</span>
            </div>
          </div>
        }
      >
        <SparkEngineClient initialPyspark={codeData.pyspark} />
      </Suspense>
    </>
  );
}
