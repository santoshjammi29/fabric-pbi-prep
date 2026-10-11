import { Metadata } from "next";
import { DashboardClient } from "./dashboard-client";
import { generatePageMetadata, generateCourseSchema } from "@/lib/seo";

export const revalidate = 3600; // 1-hour ISR cache on edge

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Fabric & Power BI Architecture Prep | Enterprise Data Engineering Platform",
    description: "Enterprise preparation platform for Microsoft Fabric (DP-600), Apache Spark 4.0, Delta Lake, Power BI VertiPaq, and Lakehouse Solutions Architects.",
    path: "/",
    keywords: ["Microsoft Fabric", "DP-600 Exam Prep", "Lakehouse Architecture", "Delta Lake", "Databricks", "Power BI VertiPaq"],
  });
}

export default function DashboardPage() {
  const courseSchema = generateCourseSchema(
    "Enterprise Microsoft Fabric & Lakehouse Architecture Masterclass",
    "Comprehensive preparation curriculum featuring 6,570+ technical scenarios, Spark 4.0 execution simulator, interactive architectural mindmap, and high-resolution whiteboard blueprints."
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
