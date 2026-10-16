import { Suspense } from "react";
import type { Metadata } from "next";
import { getConceptsDAL } from "@/lib/dal";
import { MindmapClient } from "./mindmap-client";
import { buildPageMetadata } from "@/lib/seo";

// Incremental Static Regeneration (ISR) - revalidates once per hour
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const concepts = await getConceptsDAL();
  return buildPageMetadata({
    title: `Concepts Multi-Level Mind Map (${concepts.length} Concepts Linked to Topics)`,
    description:
      "Interactive multi-level stretching mind map organizing 660+ concepts across Microsoft Fabric, Databricks, Apache Spark, Delta Lake, Airflow, and Distributed Systems.",
    path: "/mindmap",
    keywords: [
      "Concepts Mind Map",
      "Data Engineering Mindmap",
      "Fabric Concept Tree",
      "Databricks Architecture Map",
      "Spark Core Mindmap",
      "Delta Lake Topography",
      "Distributed Systems Concepts",
    ],
  });
}

export default async function MindmapPage() {
  const concepts = await getConceptsDAL();

  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-[var(--muted-foreground)] animate-pulse">
          Loading Concepts Multi-Level Mind Map...
        </div>
      }
    >
      <MindmapClient concepts={concepts} />
    </Suspense>
  );
}
