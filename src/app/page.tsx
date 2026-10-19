import { Metadata } from "next";
import { DashboardClient } from "./dashboard-client";
import { generatePageMetadata, generateCourseSchema, generateFAQSchema } from "@/lib/seo";

export const revalidate = 3600; // 1-hour ISR cache on edge

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Enterprise Fabric, Databricks & Lakehouse Systems Prep",
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

  const homepageFaqSchema = generateFAQSchema([
    {
      question: "What is Lakehouse Architect?",
      answer: "Lakehouse Architect is an enterprise-grade cloud educational platform and architecture encyclopedia tailored for Principal Data Architects, Staff Data Engineers, and Lead Analytics Engineers mastering modern lakehouse platforms."
    },
    {
      question: "What core platforms and technologies are covered?",
      answer: "The platform covers Microsoft Fabric (OneLake, Direct Lake, Synapse), Databricks (Delta Lake, Unity Catalog, Photon, Delta Live Tables), Apache Spark 4.0, Azure Data Factory (ADF), dbt, Apache Airflow, and Open Table Formats (Delta Lake, Apache Iceberg)."
    },
    {
      question: "Does Lakehouse Architect prepare for industry certifications?",
      answer: "Yes, it provides structured roadmaps and deep architectural drills for Microsoft Fabric Analytics Engineer (DP-600), Azure Data Engineer (DP-203), Power BI Data Analyst (PL-300), and Databricks Certified Data Engineer Professional."
    },
    {
      question: "How many technical assets and architecture blueprints are included?",
      answer: "The platform curates over 10,700 verified interview scenarios, 660+ architectural concepts, 32 lossless digital whiteboard blueprints, and 156 GCC enterprise company tech dossiers."
    }
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageFaqSchema) }}
      />
      <DashboardClient />
    </>
  );
}
