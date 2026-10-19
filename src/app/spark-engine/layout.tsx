import type { Metadata } from "next";
import { buildPageMetadata, generateCourseSchema, generateHowToSchema } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Apache Spark 4.0 Internals & Execution Engine Simulator",
  description:
    "Interactive Spark 4.0 execution simulator, memory allocator geometry, shuffle stage mechanics, Tungsten whole-stage codegen, and Adaptive Query Execution (AQE).",
  path: "/spark-engine",
  ogImage: "https://lakehouse-architect.vercel.app/diagrams/spark_shuffle_memory_execution.webp",
  keywords: [
    "Spark 4.0 Internals",
    "Spark Execution Simulator",
    "Tungsten Execution Engine",
    "AQE Adaptive Query Execution",
    "Spark Memory Management",
    "Shuffle Skew Remediation",
  ],
});

export default function SparkEngineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const courseJsonLd = generateCourseSchema({
    name: "Apache Spark 4.0 Internals and Engine Architecture",
    description: "Deep dive into Spark distributed compute engine, memory geometry, and physical DAG optimization.",
    url: "/spark-engine",
  });

  const howToJsonLd = generateHowToSchema({
    name: "How to Tune Apache Spark Memory and Prevent Spill to Disk",
    description: "Architectural guide to configuring spark.memory.fraction, spark.memory.storageFraction, and handling shuffle partitions.",
    steps: [
      { name: "Calculate Usable Heap", text: "Deduct 300MB reserved system memory from total executor heap." },
      { name: "Tune Execution vs Storage", text: "Configure spark.memory.fraction (default 0.6) and storageFraction (default 0.5) according to cache demands." },
      { name: "Enable Adaptive Query Execution", text: "Turn on spark.sql.adaptive.enabled to automatically coalesce shuffle partitions and isolate skew." },
    ],
  });

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
      {children}
    </>
  );
}
