import type { Metadata } from "next";
import { MindmapClient } from "./mindmap-client";
import { buildPageMetadata } from "@/lib/seo";

// Incremental Static Regeneration (ISR) - 1 hour edge cache
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Interactive Topography Mindmap | Data Ecosystem",
    description: "Explore the infinite zoomable topography of the modern enterprise data engineering landscape, Lakehouse protocols, and distributed compute trees.",
    path: "/mindmap",
    keywords: [
      "Data Engineering Mindmap",
      "Fabric Architecture Map",
      "Databricks Topography",
      "Lakehouse System Map",
      "Interactive Architecture Mindmap",
    ],
  });
}

export default function MindmapPage() {
  return <MindmapClient />;
}
