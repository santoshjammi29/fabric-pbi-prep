export type SearchCategory =
  | "All"
  | "Guided Track"
  | "Concepts"
  | "Q&A Prep"
  | "Architecture"
  | "Code Practice"
  | "Cheat Sheets"
  | "Blueprints"
  | "Companies"
  | "Learning Paths"
  | "Simulators"
  | "Navigation"
  | "Theme"
  | "Text Size";

export interface SearchResultItem {
  id: string;
  title: string;
  category: SearchCategory;
  page: string;
  href: string;
  badge?: string;
  snippet?: string;
  score: number;
  iconType?: string;
}

export interface TopicIdentification {
  key: string;
  label: string;
  icon: string;
  domain: string;
  href: string;
  description: string;
  executiveSummary: string;
}

export interface NavigationalJump {
  title: string;
  description: string;
  href: string;
  page: string;
  badge: string;
  iconType: string;
}

export const SUGGESTED_SEARCH_KEYWORDS = [
  "Catalyst Optimizer",
  "Delta Lake ACID",
  "Fabric OneLake",
  "Direct Lake VertiPaq",
  "Apache Airflow DAGs",
  "dbt Semantic Layer",
  "Liquid Clustering",
  "Unity Catalog",
  "Kafka CDC Debezium",
  "Kimball Star Schema",
  "Data Vault 2.0",
  "Adaptive Query Execution (AQE)",
  "Photon Engine",
  "Vector Search RAG",
  "Microsoft Purview",
  "Spark Shuffle Memory",
  "ADF Self-Hosted IR",
  "Apache Iceberg",
  "Medallion Architecture",
  "Lakehouse FinOps",
];
