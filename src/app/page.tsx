import { Metadata } from "next";
import { DashboardClient } from "./dashboard-client";
import { LakehouseArchitectureGuide } from "@/components/dashboard/lakehouse-architecture-guide";
import {
  generatePageMetadata,
  generateCourseSchema,
  generateFAQSchema,
  generateTechArticleSchema,
} from "@/lib/seo";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Lakehouse Architecture: The Definitive Systems Guide & Blueprints",
    description:
      "The definitive guide to Lakehouse Architecture. Master Medallion Architecture (Bronze, Silver, Gold), Delta Lake, Apache Iceberg, Microsoft Fabric OneLake, Databricks, and Apache Spark 4.0 with 10,700+ verified scenarios.",
    path: "/",
    keywords: [
      "Lakehouse",
      "Lakehouse Architecture",
      "Lakehouse Architect",
      "Data Lakehouse",
      "Medallion Architecture",
      "What is a Lakehouse",
      "Lakehouse vs Data Warehouse",
      "Delta Lake",
      "Apache Iceberg",
      "Microsoft Fabric OneLake",
      "Databricks Lakehouse",
      "Unity Catalog",
      "Apache Spark 4.0",
      "DP-600 Exam Prep",
      "Direct Lake Power BI",
      "Data Platform Architecture",
    ],
  });
}

export default function DashboardPage() {
  const courseSchema = generateCourseSchema(
    "Enterprise Lakehouse Architecture & Modern Data Platform Masterclass",
    "Comprehensive preparation curriculum featuring 10,700+ technical scenarios, Spark execution simulator, and high-resolution whiteboard blueprints."
  );

  const techArticleSchema = generateTechArticleSchema({
    title: "Lakehouse Architecture: The Definitive Enterprise Reference Blueprint",
    description:
      "A comprehensive architectural guide to modern data lakehouses, medallion architecture, Delta Lake, Apache Iceberg, and decoupled distributed systems.",
    path: "/",
    keywords: [
      "Lakehouse",
      "Lakehouse Architecture",
      "Lakehouse Architect",
      "Data Lakehouse",
      "Medallion Architecture",
      "Delta Lake",
      "Apache Iceberg",
      "Unity Catalog",
      "Microsoft Fabric",
    ],
  });

  const homepageFaqSchema = generateFAQSchema([
    {
      question: "What is a Data Lakehouse?",
      answer:
        "A Data Lakehouse is a modern data management architecture that combines the scalability, flexibility, and cost-efficiency of commodity cloud object storage (Data Lakes) with the ACID transaction guarantees, schema enforcement, fine-grained governance, and high-performance SQL query capabilities of enterprise Data Warehouses.",
    },
    {
      question: "What is Lakehouse Architecture and how does it work?",
      answer:
        "Lakehouse Architecture decouples storage, metadata, and compute. It stores structured and semi-structured data as open columnar files (Parquet) wrapped with an ACID transaction log (Delta Lake or Apache Iceberg). Independent compute engines like Apache Spark, Photon, Trino, and Power BI Direct Lake query the same data without proprietary ingestion or ETL copies.",
    },
    {
      question: "What is the Medallion Architecture (Bronze, Silver, Gold) in a Lakehouse?",
      answer:
        "The Medallion Architecture is a data quality design pattern with three progressive layers: Bronze (raw, append-only landing of source data), Silver (cleansed, deduplicated, enriched, and conformed data with schema validation), and Gold (curated business-level dimensional models and star schemas optimized for low-latency BI reporting).",
    },
    {
      question: "What is the difference between a Data Warehouse and a Lakehouse?",
      answer:
        "A Data Warehouse couples compute and storage using proprietary data formats optimized strictly for SQL reporting. A Lakehouse decouples compute from storage, utilizes open formats (Parquet with Delta Lake or Apache Iceberg), supports diverse workloads including machine learning, streaming, and SQL analytics on the same data, and eliminates costly vendor lock-in.",
    },
    {
      question: "Which table formats power modern Lakehouse Architecture?",
      answer:
        "The three dominant open table formats are Delta Lake (pioneered by Databricks and native to Microsoft Fabric), Apache Iceberg (originated by Netflix and widely adopted across Snowflake, AWS, and GCP), and Apache Hudi (optimized for streaming updates and CDC ingestion).",
    },
    {
      question: "How does Lakehouse Architect prepare engineers for DP-600 and Databricks certifications?",
      answer:
        "Lakehouse Architect provides over 10,700 verified interview scenarios, 660+ architectural concepts, 32 digital whiteboard blueprints, and dedicated Spark execution labs covering Microsoft Fabric Analytics Engineer (DP-600), Azure Data Engineer (DP-203), and Databricks Certified Data Engineer Professional.",
    },
  ]);

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Lakehouse Architect",
    url: "https://lakehousearchitect.com",
    applicationCategory: "EducationalApplication",
    operatingSystem: "All",
    browserRequirements: "Requires HTML5 and modern web browser",
    description:
      "Enterprise preparation platform and architecture reference encyclopedia for Lakehouse Architects and Lead Data Engineers.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "1420",
      bestRating: "5",
      worstRating: "1",
    },
    author: {
      "@type": "Person",
      name: "Santosh Jammi",
      url: "https://lakehousearchitect.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageFaqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <DashboardClient />
      <div className="max-w-7xl mx-auto px-2 sm:px-4 pb-12">
        <LakehouseArchitectureGuide />
      </div>
    </>
  );
}

