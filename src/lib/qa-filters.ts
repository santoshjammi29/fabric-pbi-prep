import { UnifiedQuestion, STANDARDIZED_DOMAINS, StandardizedDomain } from "@/types/data";

export type TechEcosystemId =
  | "ALL"
  | "FABRIC"
  | "DATABRICKS"
  | "SPARK"
  | "DELTA_ICEBERG"
  | "AIRFLOW_ADF"
  | "DBT_MODELING"
  | "STREAMING_CDC"
  | "SQL_DATABASES"
  | "GOVERNANCE"
  | "AI_RAG";

export interface TechEcosystem {
  id: TechEcosystemId;
  label: string;
  shortLabel: string;
  badgeColor: string;
  description: string;
  match: (q: UnifiedQuestion, text: string) => boolean;
}

export type ScenarioArchetypeId =
  | "ALL"
  | "OOM_SPILL"
  | "SKEW_JOINS"
  | "ACID_COMPACTION"
  | "CDC_STREAMING"
  | "FINOPS_COST"
  | "SYSTEM_DESIGN"
  | "MODELING_SCHEMAS"
  | "CODE_ONLY"
  | "BOOKMARKED";

export interface ScenarioArchetype {
  id: ScenarioArchetypeId;
  label: string;
  shortLabel: string;
  emoji: string;
  description: string;
  match: (q: UnifiedQuestion, text: string, bookmarks?: string[]) => boolean;
}

/**
 * Builds a normalized, lower-cased search corpus for a question
 */
export function getQuestionSearchCorpus(q: UnifiedQuestion): string {
  return `${q.question} ${q.category || ""} ${q.niche || ""} ${q.domain || ""} ${q.subdomain || ""} ${q.categoryLabel || ""} ${q.sourceLabel || ""} ${q.use_case || ""}`.toLowerCase();
}

/**
 * Checks if question contains runnable code implementations
 */
export function questionHasCode(q: UnifiedQuestion): boolean {
  if (q.code && q.code.trim().length > 0) return true;
  if (!q.answer) return false;
  return (
    q.answer.includes("```") ||
    q.answer.includes("spark.read") ||
    q.answer.includes("SELECT ") ||
    q.answer.includes("def ") ||
    q.answer.includes("CREATE TABLE") ||
    q.answer.includes("WITH ")
  );
}

/**
 * 10 Authoritative Technology Ecosystems
 */
export const TECH_ECOSYSTEMS: readonly TechEcosystem[] = [
  {
    id: "ALL",
    label: "All Tech",
    shortLabel: "All",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    description: "Entire corpus of production questions across all technology engines",
    match: () => true,
  },
  {
    id: "FABRIC",
    label: "Fabric & OneLake",
    shortLabel: "Fabric",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    description: "Microsoft Fabric, OneLake shortcuts, Direct Lake, VertiPaq, DAX, and Fabric Spark",
    match: (_q, t) =>
      t.includes("fabric") ||
      t.includes("onelake") ||
      t.includes("direct lake") ||
      t.includes("power bi") ||
      t.includes("dax") ||
      t.includes("vertipaq") ||
      t.includes("v-order") ||
      t.includes("power query") ||
      t.includes("dataflow gen2"),
  },
  {
    id: "DATABRICKS",
    label: "Databricks & DLT",
    shortLabel: "Databricks",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/20",
    description: "Azure Databricks, Delta Live Tables (DLT), Photon, Unity Catalog, and DABs",
    match: (_q, t) =>
      t.includes("databricks") ||
      t.includes("dlt") ||
      t.includes("delta live") ||
      t.includes("unity catalog") ||
      t.includes("photon") ||
      t.includes("dab") ||
      t.includes("dbx") ||
      t.includes("databricks asset bundle"),
  },
  {
    id: "SPARK",
    label: "Spark & PySpark",
    shortLabel: "Spark",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    description: "Apache Spark internals, Catalyst optimizer, Tungsten, AQE, Shuffles, and PySpark API",
    match: (_q, t) =>
      t.includes("spark") ||
      t.includes("pyspark") ||
      t.includes("catalyst") ||
      t.includes("tungsten") ||
      t.includes("aqe") ||
      t.includes("shuffle") ||
      t.includes("rdd") ||
      t.includes("dataframe api") ||
      t.includes("spark sql"),
  },
  {
    id: "DELTA_ICEBERG",
    label: "Delta & Iceberg",
    shortLabel: "Open Formats",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    description: "Open table formats (Delta Lake, Apache Iceberg, Hudi), Parquet, VACUUM, and Z-Order",
    match: (_q, t) =>
      t.includes("delta lake") ||
      t.includes("iceberg") ||
      t.includes("open table format") ||
      t.includes("table format") ||
      t.includes("_delta_log") ||
      t.includes("vacuum") ||
      t.includes("z-order") ||
      t.includes("hudi") ||
      t.includes("liquid clustering") ||
      t.includes("parquet"),
  },
  {
    id: "AIRFLOW_ADF",
    label: "Airflow & Pipelines",
    shortLabel: "Orchestration",
    badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    description: "Apache Airflow DAGs, Celery/K8s executors, Azure Data Factory (ADF), and SHIR",
    match: (_q, t) =>
      t.includes("airflow") ||
      t.includes("dag") ||
      t.includes("celery") ||
      t.includes("kubernetes executor") ||
      t.includes("adf") ||
      t.includes("azure data factory") ||
      t.includes("orchestrat") ||
      t.includes("sensor") ||
      t.includes("integration runtime") ||
      t.includes("shir"),
  },
  {
    id: "DBT_MODELING",
    label: "dbt & Data Modeling",
    shortLabel: "dbt & Modeling",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    description: "dbt transformations, Kimball dimensional modeling, Star Schema, Data Vault, and SCDs",
    match: (_q, t) =>
      t.includes("dbt") ||
      t.includes("data build tool") ||
      t.includes("dimensional") ||
      t.includes("star schema") ||
      t.includes("data vault") ||
      t.includes("scd") ||
      t.includes("kimball") ||
      t.includes("surrogate key") ||
      t.includes("semantic layer"),
  },
  {
    id: "STREAMING_CDC",
    label: "Kafka & Streaming",
    shortLabel: "Streaming & CDC",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    description: "Apache Kafka, Debezium CDC, Structured Streaming, watermarking, and event ingestion",
    match: (_q, t) =>
      t.includes("kafka") ||
      t.includes("streaming") ||
      t.includes("cdc") ||
      t.includes("debezium") ||
      t.includes("eventhub") ||
      t.includes("event streaming") ||
      t.includes("structured streaming") ||
      t.includes("watermark") ||
      t.includes("backpressure"),
  },
  {
    id: "SQL_DATABASES",
    label: "SQL & Databases",
    shortLabel: "SQL",
    badgeColor: "bg-blue-600/10 text-blue-500 border-blue-600/20",
    description: "Advanced SQL Server, query optimization, indexing, execution plans, and PostgreSQL",
    match: (_q, t) =>
      t.includes("sql server") ||
      t.includes("query optimizer") ||
      t.includes("indexing") ||
      t.includes("execution plan") ||
      t.includes("columnstore") ||
      t.includes("stored procedure") ||
      t.includes("window function") ||
      t.includes("postgres") ||
      t.includes("cte") ||
      t.includes("mssql") ||
      t.includes("database"),
  },
  {
    id: "GOVERNANCE",
    label: "Governance & Security",
    shortLabel: "Governance",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    description: "Microsoft Purview, Unity Catalog lineage, RLS/OLS security, and data contracts",
    match: (_q, t) =>
      t.includes("governance") ||
      t.includes("purview") ||
      t.includes("unity catalog") ||
      t.includes("lineage") ||
      t.includes("cataloging") ||
      t.includes("data contract") ||
      t.includes("data mesh") ||
      t.includes("rls") ||
      t.includes("ols") ||
      t.includes("data masking"),
  },
  {
    id: "AI_RAG",
    label: "AI & RAG Infrastructure",
    shortLabel: "AI & RAG",
    badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    description: "RAG vector pipelines, embeddings, LLM orchestration, LangChain, and semantic search",
    match: (_q, t) =>
      t.includes("rag") ||
      t.includes("vector") ||
      t.includes("embedding") ||
      t.includes("llm") ||
      t.includes("langchain") ||
      t.includes("langgraph") ||
      t.includes("prompt") ||
      t.includes("chunking") ||
      t.includes("hnsw") ||
      t.includes("semantic search"),
  },
];

/**
 * 9 Scenario Archetypes & Problem Patterns
 */
export const SCENARIO_ARCHETYPES: readonly ScenarioArchetype[] = [
  {
    id: "ALL",
    label: "All Scenarios",
    shortLabel: "All",
    emoji: "🎯",
    description: "All architectural questions and scenario patterns",
    match: () => true,
  },
  {
    id: "OOM_SPILL",
    label: "OOM & Memory Spill",
    shortLabel: "OOM & Memory",
    emoji: "💥",
    description: "Executor/Driver OOMs, GC pauses, off-heap memory, and shuffle disk spills",
    match: (_q, t) =>
      t.includes("oom") ||
      t.includes("out of memory") ||
      t.includes("memory leak") ||
      t.includes("heap") ||
      t.includes("off-heap") ||
      t.includes("spill") ||
      t.includes("garbage collection") ||
      t.includes("gc pause") ||
      t.includes("driver oom") ||
      t.includes("executor oom"),
  },
  {
    id: "SKEW_JOINS",
    label: "Data Skew & Joins",
    shortLabel: "Skew & Joins",
    emoji: "⚖️",
    description: "Skew remediation, salting keys, Broadcast Hash vs Sort-Merge, and AQE skew joins",
    match: (_q, t) =>
      t.includes("skew") ||
      t.includes("salting") ||
      t.includes("broadcast hash") ||
      t.includes("sort merge") ||
      t.includes("straggler") ||
      t.includes("join optimization") ||
      t.includes("repartition") ||
      t.includes("aqe skew"),
  },
  {
    id: "ACID_COMPACTION",
    label: "ACID, Locks & Compaction",
    shortLabel: "ACID & Compaction",
    emoji: "🔒",
    description: "Small files problem, OPTIMIZE, VACUUM, Z-Order, concurrency conflicts, and isolation levels",
    match: (_q, t) =>
      t.includes("acid") ||
      t.includes("compaction") ||
      t.includes("vacuum") ||
      t.includes("z-order") ||
      t.includes("liquid clustering") ||
      t.includes("small file") ||
      t.includes("concurrency") ||
      t.includes("write conflict") ||
      t.includes("isolation level") ||
      t.includes("optimistic concurrency"),
  },
  {
    id: "CDC_STREAMING",
    label: "CDC & Stream Ingestion",
    shortLabel: "CDC & Streaming",
    emoji: "⚡",
    description: "Debezium CDC, Kafka consumer lag, Structured Streaming, watermarks, and exactly-once",
    match: (_q, t) =>
      t.includes("cdc") ||
      t.includes("change data capture") ||
      t.includes("debezium") ||
      t.includes("watermark") ||
      t.includes("exactly-once") ||
      t.includes("at-least-once") ||
      t.includes("backpressure") ||
      t.includes("consumer lag") ||
      t.includes("streaming"),
  },
  {
    id: "FINOPS_COST",
    label: "FinOps & Cost Tuning",
    shortLabel: "FinOps & Cost",
    emoji: "💰",
    description: "Spot instances, cluster auto-scaling, capacity units, idle resource cleanup, and billing",
    match: (_q, t) =>
      t.includes("cost") ||
      t.includes("finops") ||
      t.includes("spot") ||
      t.includes("pricing") ||
      t.includes("capacity unit") ||
      t.includes("cluster auto-scaling") ||
      t.includes("idle") ||
      t.includes("billing") ||
      t.includes("right-sizing"),
  },
  {
    id: "SYSTEM_DESIGN",
    label: "System Design & Resiliency",
    shortLabel: "System Design",
    emoji: "🏛️",
    description: "Circuit breakers, disaster recovery, failover, high availability, SLAs, and fault tolerance",
    match: (_q, t) =>
      t.includes("system design") ||
      t.includes("circuit breaker") ||
      t.includes("disaster recovery") ||
      t.includes("failover") ||
      t.includes("high availability") ||
      t.includes("sla") ||
      t.includes("resilience") ||
      t.includes("fault tolerance") ||
      t.includes("saga"),
  },
  {
    id: "MODELING_SCHEMAS",
    label: "Kimball, Vault & SCD",
    shortLabel: "Data Modeling",
    emoji: "📐",
    description: "Star Schema, Kimball dimensional modeling, SCD Type 1/2, Data Vault Hubs, and surrogate keys",
    match: (_q, t) =>
      t.includes("star schema") ||
      t.includes("kimball") ||
      t.includes("scd") ||
      t.includes("slowly changing") ||
      t.includes("data vault") ||
      t.includes("surrogate key") ||
      t.includes("fact table") ||
      t.includes("dimension table"),
  },
  {
    id: "CODE_ONLY",
    label: "Has Code Implementations",
    shortLabel: "With Code",
    emoji: "💻",
    description: "Questions featuring runnable Python, PySpark, or SQL code implementations",
    match: (q) => questionHasCode(q),
  },
  {
    id: "BOOKMARKED",
    label: "Bookmarked Questions",
    shortLabel: "Bookmarks",
    emoji: "🔖",
    description: "Questions saved into your personal study bookmarks",
    match: (q, _t, bookmarks = []) => bookmarks.includes(q.id),
  },
];

/**
 * Checks if question matches the given tech ecosystem
 */
export function matchTechEcosystem(
  q: UnifiedQuestion,
  techId: TechEcosystemId,
  corpus?: string
): boolean {
  if (techId === "ALL") return true;
  const eco = TECH_ECOSYSTEMS.find((e) => e.id === techId);
  if (!eco) return true;
  const text = corpus || getQuestionSearchCorpus(q);
  return eco.match(q, text);
}

/**
 * Checks if question matches the given scenario archetype
 */
export function matchScenarioArchetype(
  q: UnifiedQuestion,
  archetypeId: ScenarioArchetypeId,
  corpus?: string,
  bookmarks: string[] = []
): boolean {
  if (archetypeId === "ALL") return true;
  const arc = SCENARIO_ARCHETYPES.find((a) => a.id === archetypeId);
  if (!arc) return true;
  const text = corpus || getQuestionSearchCorpus(q);
  return arc.match(q, text, bookmarks);
}

/**
 * Checks if question matches standardized domain
 */
export function matchDomain(q: UnifiedQuestion, domain: string): boolean {
  if (domain === "ALL") return true;
  const target = domain.toUpperCase();
  const cat = (q.category || "").toUpperCase();
  const niche = (q.niche || "").toUpperCase();
  const dom = (q.domain || "").toUpperCase();
  const label = (q.categoryLabel || "").toUpperCase();
  return (
    cat.includes(target) ||
    niche.includes(target) ||
    dom.includes(target) ||
    label.includes(target)
  );
}

/**
 * Computes question counts for each Tech Ecosystem and Scenario Archetype
 */
export function computeFilterCounts(
  questions: UnifiedQuestion[],
  bookmarks: string[] = []
): {
  techCounts: Record<TechEcosystemId, number>;
  archetypeCounts: Record<ScenarioArchetypeId, number>;
} {
  const techCounts: Record<TechEcosystemId, number> = {
    ALL: questions.length,
    FABRIC: 0,
    DATABRICKS: 0,
    SPARK: 0,
    DELTA_ICEBERG: 0,
    AIRFLOW_ADF: 0,
    DBT_MODELING: 0,
    STREAMING_CDC: 0,
    SQL_DATABASES: 0,
    GOVERNANCE: 0,
    AI_RAG: 0,
  };

  const archetypeCounts: Record<ScenarioArchetypeId, number> = {
    ALL: questions.length,
    OOM_SPILL: 0,
    SKEW_JOINS: 0,
    ACID_COMPACTION: 0,
    CDC_STREAMING: 0,
    FINOPS_COST: 0,
    SYSTEM_DESIGN: 0,
    MODELING_SCHEMAS: 0,
    CODE_ONLY: 0,
    BOOKMARKED: 0,
  };

  const bookmarkSet = new Set(bookmarks);

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const text = getQuestionSearchCorpus(q);
    const hasCode = questionHasCode(q);
    const isBookmarked = bookmarkSet.has(q.id);

    if (isBookmarked) archetypeCounts.BOOKMARKED++;
    if (hasCode) archetypeCounts.CODE_ONLY++;

    // Tech Ecosystems
    for (const eco of TECH_ECOSYSTEMS) {
      if (eco.id !== "ALL" && eco.match(q, text)) {
        techCounts[eco.id]++;
      }
    }

    // Scenario Archetypes
    for (const arc of SCENARIO_ARCHETYPES) {
      if (
        arc.id !== "ALL" &&
        arc.id !== "CODE_ONLY" &&
        arc.id !== "BOOKMARKED" &&
        arc.match(q, text, bookmarks)
      ) {
        archetypeCounts[arc.id]++;
      }
    }
  }

  return { techCounts, archetypeCounts };
}
