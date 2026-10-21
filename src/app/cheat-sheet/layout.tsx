import type { Metadata } from "next";
import { buildPageMetadata, generateHowToSchema, generateBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Lakehouse Architecture & Engineering Production Cheat Sheet",
  description:
    "High-density production cheat sheet and debugging reference guide for Lakehouse Architects and Data Engineers. Spark performance knobs, Delta Lake triage, Catalyst optimization flow, and dbt bundling.",
  path: "/cheat-sheet",
  ogImage: "https://lakehousearchitect.com/diagrams/catalyst_photon_engine.webp",
  keywords: [
    "PySpark Cheat Sheet",
    "Spark Optimization Knobs",
    "dbt Airflow Orchestration",
    "Data Engineering Production Best Practices",
    "Catalyst Optimizer",
    "Kryo Serialization",
    "Adaptive Query Execution",
    "Wait Statistics Triage",
  ],
});

export default function CheatSheetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateHowToSchema({
    name: "Production Data Engineering Optimization Flow",
    description: "Step-by-step diagnostic and tuning playbook for Apache Spark and Lakehouses.",
    steps: [
      { name: "Catalyst Analysis", text: "Inspect unresolved logical plan against catalog schemas." },
      { name: "Physical Plan Optimization", text: "Verify join strategies, broadcast hints, and partition pruning." },
      { name: "Tungsten Execution", text: "Leverage whole-stage code generation and off-heap binary memory." },
    ],
  });

  const breadcrumbsJsonLd = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Production Cheat Sheet", path: "/cheat-sheet" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      {children}
    </>
  );
}
