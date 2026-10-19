import { Metadata } from "next";
import { DashboardClient } from "./dashboard-client";
import { generatePageMetadata, generateCourseSchema } from "@/lib/seo";

export const revalidate = 3600; // 1-hour ISR cache on edge

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Lakehouse Architect | Enterprise Data Platform, Fabric & Databricks Prep",
    description: "Enterprise preparation platform for Lakehouse Architects and Lead Data Engineers. Master Microsoft Fabric (DP-600), Databricks, Apache Spark 4.0, Delta Lake, Unity Catalog, and High-Scale Lakehouse Systems.",
    path: "/",
    keywords: ["Lakehouse Architect", "Microsoft Fabric", "Databricks", "Delta Lake", "Apache Spark", "DP-600 Exam Prep", "Unity Catalog", "Data Engineering System Design"],
  });
}

export default function DashboardPage() {
  const courseSchema = generateCourseSchema(
    "Enterprise Lakehouse Architecture & Modern Data Platform Masterclass",
    "Comprehensive preparation curriculum featuring 10,700+ technical scenarios, Spark execution simulator, and high-resolution whiteboard blueprints."
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <DashboardClient />
    </>
  );
}
