import type { Metadata } from "next";
import { buildPageMetadata, generateHowToSchema } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Data Engineering Production Cheat Sheet | Spark, dbt, Airflow & Lakehouse",
  description:
    "High-density production cheat sheet and debugging reference guide for Data Engineers and Architects. Spark performance knobs, Catalyst optimization flow, dbt bundling, and database wait triage.",
  path: "/cheat-sheet",
  ogImage: "https://lakehousearchitect.vercel.app/diagrams/catalyst_photon_engine.webp",
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
