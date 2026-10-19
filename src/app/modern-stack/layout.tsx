import type { Metadata } from "next";
import { buildPageMetadata, generateCourseSchema } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Modern Data Stack Blueprints & Interactive Simulators",
  description:
    "Enterprise production blueprints for Iceberg, Delta Lake UniForm, Debezium CDC, Vector Search RAG pipelines, and FinOps cost calculators.",
  path: "/modern-stack",
  ogImage: "https://lakehousearchitect.vercel.app/diagrams/rag_vector_search_data_pipeline.webp",
  keywords: [
    "Modern Data Stack Blueprints",
    "Delta UniForm Iceberg",
    "Vector Search RAG Pipeline",
    "Lakehouse FinOps",
    "Debezium Kafka Streaming",
  ],
});

export default function ModernStackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateCourseSchema({
    name: "Modern Data Stack Architecture & Production Blueprints",
    description: "Curated blueprints, live simulators, and cost playbooks for cutting-edge lakehouses.",
    url: "/modern-stack",
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
