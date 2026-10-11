import { Metadata } from "next";
import { Suspense } from "react";
import { getCheatsheetDataDAL } from "@/lib/dal";
import { CheatSheetClient } from "./cheat-sheet-client";
import { generatePageMetadata, generateHowToSchema } from "@/lib/seo";

export const revalidate = 3600; // 1-hour ISR cache on edge

export async function generateMetadata(): Promise<Metadata> {
  const data = await getCheatsheetDataDAL();
  return generatePageMetadata({
    title: `Production Cheat Sheet (${data.length} Engine Recipes) | Spark, Delta & Fabric`,
    description: `Enterprise architect reference guide with ${data.length} battle-tested recipes for Apache Spark 4.0, PySpark memory optimization, OOM recovery, and Delta Lake maintenance.`,
    path: "/cheat-sheet",
    keywords: ["Spark Cheat Sheet", "PySpark OOM", "Delta Lake Optimization", "AQE", "Data Engineering Recipes"],
  });
}

export default async function CheatSheetPage() {
  const data = await getCheatsheetDataDAL();

  const howToSchema = generateHowToSchema(
    "How to Fix Apache Spark OOM and Driver Errors in Production",
    "Step-by-step diagnostic and configuration steps to resolve Spark OutOfMemory and shuffle spill in enterprise lakehouses.",
    [
      { name: "Enable AQE and Skew Join", text: "Configure spark.sql.adaptive.enabled=true and spark.sql.adaptive.skewJoin.enabled=true" },
      { name: "Tune Shuffle Partitions", text: "Set spark.sql.shuffle.partitions to target 100MB - 200MB uncompressed partition sizes." },
      { name: "Eliminate Cartesian & Cross Joins", text: "Enforce BroadcastHashJoin thresholds and avoid unqualified cartesian joins." },
    ]
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
            <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading Production Cheat Sheet...</span>
            </div>
          </div>
        }
      >
        <CheatSheetClient initialData={data} />
      </Suspense>
    </>
  );
}
