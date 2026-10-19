import { Metadata } from "next";
import { Suspense } from "react";
import { getCheatsheetDataDAL, getDatabricksCheatsheetDataDAL } from "@/lib/dal";
import { CheatSheetClient } from "./cheat-sheet-client";
import { generatePageMetadata, generateHowToSchema } from "@/lib/seo";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const [data, databricksData] = await Promise.all([
    getCheatsheetDataDAL(),
    getDatabricksCheatsheetDataDAL(),
  ]);
  const totalItems = data.length + databricksData.cards.length;

  return generatePageMetadata({
    title: `Production & Databricks Cheat Sheets (${totalItems} Recipes & Cards) | Spark, Delta & Fabric`,
    description: `Enterprise architect reference guide: 67 incident runbooks + 48 Databricks coding language cards (Spark SQL, PySpark, Spark Core, Python SDK) with 5 print-ready vector PDFs and 250-DPI posters.`,
    path: "/cheat-sheet",
    keywords: [
      "Databricks Cheat Sheet",
      "Spark SQL Cheat Sheet",
      "PySpark Cheat Sheet",
      "Spark Core Memory Architecture",
      "Delta Lake Optimization",
      "AQE",
      "Liquid Clustering",
      "Data Engineering Runbooks",
    ],
  });
}

export default async function CheatSheetPage() {
  const [data, databricksData] = await Promise.all([
    getCheatsheetDataDAL(),
    getDatabricksCheatsheetDataDAL(),
  ]);

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
        <CheatSheetClient initialData={data} databricksData={databricksData} />
      </Suspense>
    </>
  );
}
