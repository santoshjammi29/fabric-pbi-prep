import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Engineering Production Cheat Sheet | Spark, dbt, Airflow & Lakehouse",
  description:
    "High-density production cheat sheet and debugging reference guide for Data Engineers and Architects. Spark performance knobs, Catalyst optimization flow, dbt bundling, and database wait triage.",
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
};

export default function CheatSheetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
