/**
 * Progress & Experience Tier Types and Constants
 */

export type ExperienceTier = "beginner" | "associate" | "senior" | "staff_architect";

export interface TierConfig {
  id: ExperienceTier;
  label: string;
  badge: string;
  role: string;
  certs: string[];
  description: string;
  color: {
    badge: string;
    border: string;
    accent: string;
    bg: string;
  };
  recommendedSteps: number[]; // Step numbers 1-6 in RoadmapGrid
  startingPath: {
    title: string;
    href: string;
    module: string;
  };
}

export const EXPERIENCE_TIERS: Record<ExperienceTier, TierConfig> = {
  beginner: {
    id: "beginner",
    label: "Beginner",
    badge: "Tier 1 · Foundations",
    role: "Foundations & BI Architect",
    certs: ["PL-300", "DP-900"],
    description:
      "Master relational fundamentals, Star Schema design, Kimball dimensional modeling, Power BI Direct Lake, and core Lakehouse vs Data Warehouse paradigms.",
    color: {
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      border: "hover:border-emerald-500/40",
      accent: "text-emerald-400",
      bg: "from-emerald-950/20 to-emerald-900/10",
    },
    recommendedSteps: [1, 2],
    startingPath: {
      title: "Key Concepts: Lakehouse vs Data Warehouse",
      href: "/concepts?term=Lakehouse",
      module: "Core Concepts Hub",
    },
  },
  associate: {
    id: "associate",
    label: "Associate",
    badge: "Tier 2 · Core DE",
    role: "Core Data Engineer",
    certs: ["DP-600", "DP-203"],
    description:
      "Build production pipelines with PySpark DataFrame APIs, Medallion Architecture (Bronze/Silver/Gold), Delta Lake ACID transactions, and Data Factory orchestration.",
    color: {
      badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      border: "hover:border-blue-500/40",
      accent: "text-blue-400",
      bg: "from-blue-950/20 to-blue-900/10",
    },
    recommendedSteps: [2, 4],
    startingPath: {
      title: "PySpark Transformations & Medallion Architecture",
      href: "/code-practice?db=pyspark",
      module: "Polyglot Code Hub",
    },
  },
  senior: {
    id: "senior",
    label: "Senior",
    badge: "Tier 3 · Distributed Systems",
    role: "Distributed Systems & Spark Specialist",
    certs: ["Databricks Certified Professional", "Fabric Analytics Engineer"],
    description:
      "Deep dive into Spark 4.0 Catalyst & Tungsten internals, Shuffle Partition tuning, Dynamic Partition Pruning (DPP), Structured Streaming, and dbt semantic modeling.",
    color: {
      badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      border: "hover:border-purple-500/40",
      accent: "text-purple-400",
      bg: "from-purple-950/20 to-purple-900/10",
    },
    recommendedSteps: [3, 5],
    startingPath: {
      title: "Apache Spark Physical Execution & Tungsten Memory",
      href: "/spark-engine#architecture",
      module: "Spark Engine Hub",
    },
  },
  staff_architect: {
    id: "staff_architect",
    label: "Staff Architect",
    badge: "Tier 4 · Principal / Staff",
    role: "Enterprise Architect & FinOps Leader",
    certs: ["Azure Solutions Architect", "Enterprise Data Architect"],
    description:
      "Design mission-critical platforms with 16 Enterprise Architecture Specs, FinOps CU capacity scaling, Cross-cloud Data Mesh, Data Contracts, and Vector RAG pipelines.",
    color: {
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      border: "hover:border-amber-500/40",
      accent: "text-amber-400",
      bg: "from-amber-950/20 to-amber-900/10",
    },
    recommendedSteps: [4, 6],
    startingPath: {
      title: "Multi-Cloud Lakehouse & FinOps CU Architecture",
      href: "/architecture",
      module: "Architecture Hub",
    },
  },
};

export interface LastTopicData {
  title: string;
  href: string;
  category: string;
  progress: number;
}
