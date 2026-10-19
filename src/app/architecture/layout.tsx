import type { Metadata } from "next";
import { buildPageMetadata, generateCourseSchema } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Data Architecture & System Design Whiteboards (21 Blueprints)",
  description:
    "Production-grade architecture diagrams, system design blueprints, and trade-off matrices for Microsoft Fabric, OneLake, Databricks Unity Catalog, Delta Lake, and Apache Airflow.",
  path: "/architecture",
  ogImage: "https://lakehousearchitect.vercel.app/diagrams/fabric_onelake_architecture.webp",
  keywords: [
    "Lakehouse System Design",
    "Data Architecture Diagrams",
    "Fabric OneLake Whiteboard",
    "Databricks Medallion Blueprint",
    "Unity Catalog Governance Architecture",
    "Kafka Debezium CDC Pipeline",
  ],
});

export default function ArchitectureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateCourseSchema({
    name: "Enterprise Data Platform System Design & Whiteboard Architecture",
    description: "21 production-grade whiteboard blueprints and interactive system design trade-offs.",
    url: "/architecture",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
