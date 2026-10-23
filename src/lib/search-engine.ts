import type {
  Concept,
  CodeSheetItem,
  CheatCode,
  DatabricksSuiteData,
  ModernBlueprint,
  CompanyProfile,
  LearningPath,
} from "@/types/data";

import dataConceptsJson from "@/data/json/data_concepts.json";
import dataArchitectureJson from "@/data/json/data_architecture.json";
import qaCleanedJson from "@/data/json/questions_unified_cleaned.json";
import questionsJson from "@/data/json/questions.json";
import dataDeJson from "@/data/json/data_de.json";
import dataCheatsheetJson from "@/data/json/data_cheatsheet.json";
import databricksCheatsheetsJson from "@/data/json/databricks_cheatsheets.json";
import databricks100Json from "@/data/json/databricks_100.json";
import dataPathsJson from "@/data/json/data_paths.json";
import companyProfilesJson from "@/data/json/company_profiles.json";
import dataPysparkJson from "@/data/json/data_pyspark.json";
import dataSparksqlJson from "@/data/json/data_sparksql.json";
import dataMssqlJson from "@/data/json/data_mssql.json";
import dataPythonJson from "@/data/json/data_python.json";
import modernBlueprintsJson from "@/data/json/modern_blueprints.json";
import { GUIDED_TOPICS, GuidedTopic } from "@/data/guided-learning-topics";
import { architectureDiagrams } from "@/data/diagrams";

export * from "./search-types";
import type { SearchCategory, SearchResultItem, TopicIdentification, NavigationalJump } from "./search-types";

export interface SearchResponse {
  query: string;
  total: number;
  identifiedTopics: TopicIdentification[];
  pageCounts: Record<string, number>;
  items: SearchResultItem[];
  navigationalJump?: NavigationalJump | null;
}

export const TOPIC_SYNONYMS: Record<string, string[]> = {
  spark: [
    "spark", "pyspark", "catalyst", "catalyst optimizer", "aqe", "adaptive query execution",
    "tungsten", "photon", "rdd", "shuffle", "broadcast", "skew", "data skew", "spill",
    "broadcast hash join", "sort merge join", "shuffle hash join", "whole stage code generation",
    "g1gc", "garbage collection", "memory overhead", "executor memory", "driver memory",
    "dynamic allocation", "partitioning", "coalesce", "repartition", "collect_list", "collect_set",
    "dataframe", "spark sql", "spark streaming", "structured streaming", "watermark", "checkpointing",
    "state store", "rocksdb", "spark-submit", "accumulator", "broadcast variable", "spark ui"
  ],
  databricks: [
    "databricks", "delta", "delta lake", "unity catalog", "three-level namespace", "three level namespace",
    "dlt", "delta live tables", "auto loader", "cloud files", "liquid clustering", "zorder", "z-order",
    "dbfs", "vacuum", "optimize", "compaction", "bin-packing", "dabs", "databricks asset bundles",
    "databricks 100", "genie", "lakeflow", "change data feed", "cdf", "delta sharing", "serverless",
    "photon engine", "workspace", "metastore", "managed tables", "external tables", "cluster policies"
  ],
  fabric: [
    "fabric", "onelake", "direct lake", "directlake", "v-order", "synapse dw", "data warehouse",
    "lakehouse", "capacity", "sku", "f-sku", "shortcuts", "mirrored", "mirroring", "eventstream",
    "data activator", "reflex", "purview fabric", "semantic model", "fabric notebook", "dataflows gen2",
    "kql database", "real-time intelligence", "copilot", "git integration", "deployment pipelines"
  ],
  airflow: [
    "airflow", "dag", "dags", "taskflow", "taskflow api", "operator", "operators", "sensor", "sensors",
    "triggerer", "xcom", "celery", "celery executor", "kubernetes executor", "astronomer", "mwaa",
    "cloud composer", "backfill", "catchup", "sla", "pools", "dynamic dags", "deferrable operator",
    "taskgroup", "airflow 2", "airflow 3", "connection", "variable", "lineage"
  ],
  dbt: [
    "dbt", "jinja", "ref", "source", "snapshot", "semantic layer", "macro", "materialization",
    "ephemeral", "incremental", "is_incremental", "dbt mesh", "scd type 2", "singular test",
    "generic test", "dbt test", "dbt build", "dbt docs", "dbt cloud", "dbt core", "exposures",
    "metrics", "contracts", "model contracts", "semantic models"
  ],
  adf: [
    "adf", "data factory", "azure data factory", "shir", "self-hosted integration runtime",
    "integration runtime", "azure ir", "tumbling window", "tumbling window trigger", "copy activity",
    "mapping data flow", "lookup", "foreach", "pipeline parameters", "linked service", "dataset",
    "web activity", "execute pipeline", "event trigger", "schedule trigger"
  ],
  datalake: [
    "datalake", "data lake", "lakehouse", "medallion", "medallion architecture", "bronze", "silver",
    "gold", "iceberg", "apache iceberg", "hudi", "apache hudi", "delta lake", "open table",
    "open table formats", "parquet", "orc", "avro", "manifest list", "metadata tree", "snapshot tree",
    "time travel", "merge on read", "mor", "copy on write", "cow", "acid lake", "schema evolution"
  ],
  modeling: [
    "modeling", "modelling", "kimball", "ralph kimball", "star schema", "snowflake schema",
    "fact table", "dimension table", "dimension", "scd", "slowly changing dimension", "scd type 1",
    "scd type 2", "scd type 3", "scd type 4", "scd type 6", "data vault", "data vault 2.0",
    "hubs", "links", "satellites", "surrogate key", "business key", "junk dimension",
    "degenerate dimension", "conformed dimension", "role-playing dimension", "bridge table",
    "additive", "semi-additive", "non-additive", "grain", "granularity", "factless fact table"
  ],
  sql: [
    "sql", "tsql", "t-sql", "mssql", "sql server", "execution plan", "index seek", "index scan",
    "b-tree", "btree", "clustered index", "nonclustered index", "covering index", "page split",
    "buffer pool", "window function", "cte", "recursive cte", "mvcc", "acid", "isolation level",
    "read committed", "snapshot isolation", "serializable", "row_number", "rank", "dense_rank",
    "lead", "lag", "partition by", "order by", "stored procedure", "tempdb"
  ],
  streaming: [
    "streaming", "kafka", "apache kafka", "kraft", "zookeeper", "flink", "apache flink",
    "structured streaming", "event-time", "processing-time", "watermark", "watermarking",
    "consumer group", "offset", "cdc", "change data capture", "debezium", "outbox",
    "outbox pattern", "event sourcing", "exactly once", "at least once", "backpressure",
    "event hubs", "kinesis", "kafka connect", "log compaction"
  ],
  governance: [
    "governance", "purview", "microsoft purview", "unity catalog", "catalog", "lineage",
    "data lineage", "contracts", "data contracts", "schema registry", "rls", "row level security",
    "cls", "column level security", "masking", "dynamic data masking", "security", "great expectations",
    "data quality", "data observability", "soda", "audit logging", "gdpr", "pii", "sensitivity labels"
  ],
  powerbi: [
    "powerbi", "power bi", "dax", "vertipaq", "vertipaq engine", "semantic model", "calculate",
    "filter context", "row context", "context transition", "all", "allexcept", "values",
    "summarize", "measure", "calculated column", "calculated table", "direct lake", "directquery",
    "import mode", "composite model", "tabular model", "rls in power bi"
  ],
  python: [
    "python", "polars", "pandas", "arrow", "apache arrow", "duckdb", "pydantic", "gil",
    "global interpreter lock", "asyncio", "multiprocessing", "threading", "pytest", "typing",
    "dataclass", "generator", "yield", "memoryview", "cython", "vectorized"
  ],
  "system-design": [
    "system design", "distributed systems", "cap theorem", "pacelc", "saga", "saga pattern",
    "sharding", "consistent hashing", "cache-aside", "write-through", "redis", "memcached",
    "rate limiting", "circuit breaker", "bulkhead", "eventual consistency", "two-phase commit",
    "2pc", "raft", "paxos", "bloom filter", "backpressure", "load balancer"
  ],
  blueprints: [
    "blueprints", "architecture diagrams", "whiteboard", "architecture", "system architecture",
    "fabric onelake architecture", "powerbi direct lake vertipaq", "powerbi dax engine context",
    "apache airflow architecture", "dbt analytics engineering dag", "adf hybrid architecture",
    "kafka event streaming pipeline", "cdc debezium lakehouse pipeline", "databricks medallion architecture",
    "databricks dlt pipeline", "databricks ecosystem landscape", "rag vector search data pipeline",
    "unity catalog architecture", "purview governance catalog", "delta lake mechanism",
    "apache iceberg open table format", "open table formats lakehouse architecture",
    "open file formats storage architecture", "databricks optimization techniques architecture",
    "catalyst photon engine", "spark shuffle memory execution", "sql server query engine optimization",
    "kimball dimensional star schema", "data vault enterprise architecture", "enterprise edge architecture",
    "distributed systems resilience architecture", "python arrow polars architecture",
    "data mesh enterprise architecture", "spark data skew aqe optimization", "lakehouse finops cost optimization",
    "databricks dabs devops pipeline", "databricks master architecture"
  ],
};

export const DOMAIN_ACRONYMS: Record<string, string[]> = {
  aqe: ["adaptive", "query", "execution"],
  dlt: ["delta", "live", "tables"],
  shir: ["self", "hosted", "integration", "runtime"],
  oom: ["out", "of", "memory", "allocation", "spill", "heap"],
  uc: ["unity", "catalog"],
  cdc: ["change", "data", "capture", "debezium"],
  scd: ["slowly", "changing", "dimension"],
  dag: ["directed", "acyclic", "graph", "airflow"],
  pbi: ["power", "bi", "powerbi", "dax"],
  adf: ["azure", "data", "factory"],
  rag: ["retrieval", "augmented", "generation", "vector"],
  gc: ["garbage", "collection", "g1gc"],
  acid: ["atomicity", "consistency", "isolation", "durability"],
  zorder: ["liquid", "clustering", "z-order", "compaction"],
  cdf: ["change", "data", "feed"],
  rls: ["row", "level", "security"],
  cls: ["column", "level", "security"],
  ddm: ["dynamic", "data", "masking"],
  kql: ["kusto", "query", "language"],
  bhj: ["broadcast", "hash", "join"],
  smj: ["sort", "merge", "join"],
  shj: ["shuffle", "hash", "join"],
};

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
  "has", "he", "in", "is", "it", "its", "of", "on", "that", "the",
  "to", "was", "were", "will", "with", "how", "what", "why", "when",
  "which", "where", "can", "do", "does"
]);

/**
 * Tokenize a search query into clean, lower-cased keyword tokens.
 */
export function tokenizeQuery(query: string): string[] {
  const rawTokens = query
    .toLowerCase()
    .trim()
    .split(/[\s,+/_\-:]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  if (rawTokens.length <= 1) return rawTokens;

  // Filter stopwords if multiple tokens exist, unless all tokens are stopwords
  const meaningful = rawTokens.filter((t) => !STOP_WORDS.has(t));
  return meaningful.length > 0 ? meaningful : rawTokens;
}

/**
 * Levenshtein distance for typo tolerance (e.g. "catlyst" -> "catalyst", "partiton" -> "partition")
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  if (Math.abs(a.length - b.length) > 2) return 99;

  const prevRow: number[] = [];
  for (let j = 0; j <= b.length; j++) prevRow[j] = j;

  for (let i = 1; i <= a.length; i++) {
    let prevVal = i;
    for (let j = 1; j <= b.length; j++) {
      let cost = 0;
      if (a.charAt(i - 1) !== b.charAt(j - 1)) {
        cost = 1;
      }
      const val = Math.min(
        prevVal + 1,            // insertion
        prevRow[j] + 1,         // deletion
        prevRow[j - 1] + cost   // substitution
      );
      prevRow[j - 1] = prevVal;
      prevVal = val;
    }
    prevRow[b.length] = prevVal;
  }
  return prevRow[b.length];
}

/**
 * Normalizes common technical suffixes (lightweight stemming).
 */
export function stemToken(token: string): string {
  if (token.length <= 4) return token;
  if (token.endsWith("izing")) return token.slice(0, -5) + "ize";
  if (token.endsWith("izer") || token.endsWith("iser")) return token.slice(0, -4) + "ize";
  if (token.endsWith("ing")) return token.slice(0, -3);
  if (token.endsWith("tion")) return token.slice(0, -4);
  if (token.endsWith("led")) return token.slice(0, -1);
  if (token.endsWith("ed")) return token.slice(0, -2);
  if (token.endsWith("es")) return token.slice(0, -2);
  if (token.endsWith("s") && !token.endsWith("ss")) return token.slice(0, -1);
  return token;
}

/**
 * Expand query tokens with technical acronyms and domain keywords.
 */
export function expandQueryTokens(tokens: string[]): string[] {
  const expanded = new Set<string>(tokens);
  for (const t of tokens) {
    const acronymMatches = DOMAIN_ACRONYMS[t];
    if (acronymMatches) {
      for (const m of acronymMatches) expanded.add(m);
    }
  }
  return Array.from(expanded);
}

/**
 * Detects strong user navigational intent and returns a direct jump target.
 */
export function detectNavigationalIntent(query: string): NavigationalJump | null {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 3) return null;

  if (q.includes("spark engine") || q === "spark simulator" || q === "catalyst simulator") {
    return {
      title: "Spark Engine & Simulator",
      description: "Visual runtime simulator for Catalyst optimizer, Tungsten memory, and AQE stages.",
      href: "/spark-engine",
      page: "Spark Engine",
      badge: "Simulator",
      iconType: "zap",
    };
  }
  if (q.includes("mindmap") || q.includes("mind map") || q.includes("concept map") || q === "tree") {
    return {
      title: "Interactive Mind Map",
      description: "Visual hierarchical relationship tree connecting 670+ data engineering concepts.",
      href: "/mindmap",
      page: "Mind Map",
      badge: "Interactive Graph",
      iconType: "compass",
    };
  }
  if (
    q.includes("databricks code") ||
    q.includes("databricks coding") ||
    q.includes("databricks 100") ||
    q === "dbx code" ||
    q === "dbx coding"
  ) {
    return {
      title: "Databricks Coding & Triage Hub (148+ Ops)",
      description: "Production PySpark and Databricks engineering drills, memory triage, and 100-day curriculum.",
      href: "/code-practice/databricks",
      page: "Code Practice",
      badge: "Coding Hub",
      iconType: "flame",
    };
  }
  if (q.includes("cheat sheet") || q.includes("cheatsheet") || q === "cheat" || q === "cheats") {
    return {
      title: "Production Engineering Cheat Sheets",
      description: "Battle-tested reference cards for Spark, dbt, Airflow, SQL Server, and Databricks.",
      href: "/cheat-sheet",
      page: "Cheat Sheets",
      badge: "Quick Reference",
      iconType: "terminal",
    };
  }
  if (q.includes("architecture hub") || q === "scenarios" || q === "architecture scenarios") {
    return {
      title: "Architecture Hub (3,200+ Scenarios)",
      description: "Real-world trade-offs, system design challenges, and architectural blueprint solutions.",
      href: "/architecture",
      page: "Architecture Hub",
      badge: "System Design",
      iconType: "cpu",
    };
  }
  if (q.includes("qa prep") || q === "questions" || q === "interview questions" || q === "question bank") {
    return {
      title: "Q&A Prep Hub (7,080+ Questions)",
      description: "Comprehensive question bank with active recall, SM-2 spaced repetition, and rubrics.",
      href: "/qa-prep",
      page: "Q&A Prep",
      badge: "Interview Drills",
      iconType: "message",
    };
  }
  if (q.includes("company") || q.includes("companies") || q === "gcc" || q === "company research") {
    return {
      title: "Company Tech Research (156 GCC Profiles)",
      description: "Tech stacks, data engineering interview questions, and architecture patterns by enterprise.",
      href: "/company-research",
      page: "Company Research",
      badge: "Enterprise",
      iconType: "building",
    };
  }
  if (q.includes("modern stack") || q.includes("blueprint") || q.includes("whiteboard")) {
    return {
      title: "Modern Data Stack & Blueprints",
      description: "Hand-crafted whiteboard diagrams, Lakehouse FinOps playbooks, and modern stack blueprints.",
      href: "/modern-stack",
      page: "Modern Stack",
      badge: "Blueprints",
      iconType: "layers",
    };
  }
  if (q === "guided learning" || q === "tracks" || q === "curriculum") {
    return {
      title: "Guided Learning (13 Structured Tracks)",
      description: "Structured multi-week technical tracks across Spark, Databricks, Fabric, and Architecture.",
      href: "/guided-learning",
      page: "Guided Learning",
      badge: "Curriculum",
      iconType: "sparkles",
    };
  }
  return null;
}

/**
 * Identify topics from user search query tokens.
 */
export function identifyTopicsFromTokens(tokens: string[]): TopicIdentification[] {
  if (tokens.length === 0) return [];
  const matchedTopics: TopicIdentification[] = [];
  const seenKeys = new Set<string>();

  for (const topic of GUIDED_TOPICS) {
    const key = topic.key.toLowerCase();
    const labelLower = topic.label.toLowerCase();
    const synonyms = TOPIC_SYNONYMS[key] || [key];

    const isMatch = tokens.some((token) => {
      if (token === key || labelLower.includes(token)) return true;
      return synonyms.some((syn) => {
        if (syn === token) return true;
        // Word boundary match inside multi-word synonym
        if (syn.includes(" ") && syn.split(" ").includes(token)) return true;
        if (syn.includes(token) && token.length >= 4) return true;
        return false;
      });
    });

    if (isMatch && !seenKeys.has(key)) {
      seenKeys.add(key);
      matchedTopics.push({
        key: topic.key,
        label: topic.label,
        icon: topic.icon,
        domain: topic.domain,
        href: `/guided-learning?topic=${topic.key}`,
        description: topic.description,
        executiveSummary: topic.executiveSummary,
      });
    }
  }

  return matchedTopics;
}

/**
 * Internal Search Document Structure for the BM25 Inverted Index
 */
interface IndexDocument {
  id: string;
  title: string;
  category: SearchCategory;
  page: string;
  href: string;
  badge?: string;
  snippet: string;
  keywords: string;
  authority: number;
  iconType: string;
  titleTokens: string[];
  kwTokens: string[];
  snipTokens: string[];
}

interface PostingEntry {
  docIdx: number;
  tfTitle: number;
  tfKw: number;
  tfSnip: number;
}

class InvertedSearchIndex {
  public docs: IndexDocument[] = [];
  public postings: Map<string, PostingEntry[]> = new Map();
  public vocab: string[] = [];
  private isInitialized = false;

  public init() {
    if (this.isInitialized) return;
    this.buildIndex();
    this.isInitialized = true;
  }

  private addDoc(
    id: string,
    title: string,
    category: SearchCategory,
    page: string,
    href: string,
    badge: string | undefined,
    snippet: string,
    keywords: string,
    authority: number,
    iconType: string
  ) {
    const docIdx = this.docs.length;
    const titleTokens = tokenizeQuery(title);
    const kwTokens = tokenizeQuery(keywords);
    const snipTokens = tokenizeQuery(snippet);

    const doc: IndexDocument = {
      id,
      title,
      category,
      page,
      href,
      badge,
      snippet,
      keywords,
      authority,
      iconType,
      titleTokens,
      kwTokens,
      snipTokens,
    };
    this.docs.push(doc);

    // Compute Term Frequencies
    const tfTitleMap = new Map<string, number>();
    for (const t of titleTokens) {
      const stem = stemToken(t);
      tfTitleMap.set(t, (tfTitleMap.get(t) || 0) + 1);
      if (stem !== t) tfTitleMap.set(stem, (tfTitleMap.get(stem) || 0) + 1);
    }

    const tfKwMap = new Map<string, number>();
    for (const t of kwTokens) {
      const stem = stemToken(t);
      tfKwMap.set(t, (tfKwMap.get(t) || 0) + 1);
      if (stem !== t) tfKwMap.set(stem, (tfKwMap.get(stem) || 0) + 1);
    }

    const tfSnipMap = new Map<string, number>();
    for (const t of snipTokens) {
      const stem = stemToken(t);
      tfSnipMap.set(t, (tfSnipMap.get(t) || 0) + 1);
      if (stem !== t) tfSnipMap.set(stem, (tfSnipMap.get(stem) || 0) + 1);
    }

    const allTerms = new Set([...tfTitleMap.keys(), ...tfKwMap.keys(), ...tfSnipMap.keys()]);
    for (const term of allTerms) {
      let list = this.postings.get(term);
      if (!list) {
        list = [];
        this.postings.set(term, list);
      }
      list.push({
        docIdx,
        tfTitle: tfTitleMap.get(term) || 0,
        tfKw: tfKwMap.get(term) || 0,
        tfSnip: tfSnipMap.get(term) || 0,
      });
    }
  }

  private buildIndex() {
    // 1. Guided Learning Topics
    for (const topic of GUIDED_TOPICS) {
      this.addDoc(
        `topic-${topic.key}`,
        `Guided Learning: ${topic.label} Track`,
        "Guided Track",
        "Guided Learning",
        `/guided-learning?topic=${topic.key}`,
        `Track · ${topic.domain}`,
        topic.description,
        `${topic.key} ${topic.domain} ${topic.executiveSummary} ${(TOPIC_SYNONYMS[topic.key] || []).join(" ")}`,
        1.3,
        "sparkles"
      );
    }

    // 2. Concepts (dataConceptsJson)
    for (const c of (dataConceptsJson as unknown as Concept[])) {
      this.addDoc(
        `concept-${c.id}`,
        `${c.term} (${c.category})`,
        "Concepts",
        "Key Concepts",
        `/concepts?tab=concepts&category=${encodeURIComponent(c.category)}&term=${encodeURIComponent(c.term)}`,
        c.difficulty || "Core",
        c.definition || "",
        [c.category, ...(c.keyPoints || []), ...(c.relatedTerms || [])].join(" "),
        1.8,
        "book"
      );
    }

    // 3. Architecture Scenarios (dataArchitectureJson - 3,206 items)
    for (const a of (dataArchitectureJson as any[])) {
      const qText = a.question || a.title || `Scenario ${a.id}`;
      const ansText = a.answer || a.architectureSolution || "";
      this.addDoc(
        `arch-${a.id}`,
        qText,
        "Architecture",
        "Architecture Hub",
        `/architecture?category=${encodeURIComponent(a.category || "ALL")}&card=${encodeURIComponent(a.id)}`,
        a.difficulty || "ARCHITECT",
        ansText.slice(0, 160),
        [a.category, a.niche, a.source].filter(Boolean).join(" "),
        1.5,
        "cpu"
      );
    }

    // 4. Q&A Prep Questions (6,829 unique items across cleaned + candidate datasets)
    const seenQa = new Set<string>();
    const allQaDatasets = [qaCleanedJson as any[], questionsJson as any[], dataDeJson as any[]];
    for (const dataset of allQaDatasets) {
      for (const q of dataset) {
        if (!q || !q.id || seenQa.has(q.id)) continue;
        seenQa.add(q.id);
        const ans = q.answer || "";
        this.addDoc(
          `qa-${q.id}`,
          q.question,
          "Q&A Prep",
          "Q&A Prep Hub",
          `/qa-prep?category=${encodeURIComponent(q.category || "ALL")}&card=${encodeURIComponent(q.id)}`,
          q.difficulty || "Senior",
          ans.slice(0, 160),
          [q.category, q.categoryLabel, q.niche, q.domain, q.sourceLabel].filter(Boolean).join(" "),
          1.4,
          "message"
        );
      }
    }

    // 5. Code Practice (pyspark, sparksql, mssql, python)
    const codeSets = [
      { items: dataPysparkJson as CodeSheetItem[], name: "PySpark" },
      { items: dataSparksqlJson as CodeSheetItem[], name: "SparkSQL" },
      { items: dataMssqlJson as CodeSheetItem[], name: "Advanced SQL" },
      { items: dataPythonJson as CodeSheetItem[], name: "Python" },
    ];
    for (const set of codeSets) {
      for (const item of set.items) {
        this.addDoc(
          `code-${set.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${item.id}`,
          `${item.title} (${set.name})`,
          "Code Practice",
          "Code Practice",
          `/code-practice`,
          item.level || "PROD",
          item.description || item.use_case || "",
          [set.name, item.category, item.level, item.use_case].filter(Boolean).join(" "),
          1.4,
          "terminal"
        );
      }
    }

    // 6. Cheatsheets & Databricks 100
    for (const c of (dataCheatsheetJson as CheatCode[])) {
      this.addDoc(
        `cheat-${c.id}`,
        `${c.title} — ${c.category}`,
        "Cheat Sheets",
        "Cheat Sheets",
        `/cheat-sheet?id=${c.id}`,
        c.impact || "PROD",
        c.problem || c.solution || "",
        [c.category, ...(c.tags || []), c.whyItMatters].filter(Boolean).join(" "),
        1.5,
        "terminal"
      );
    }

    if (Array.isArray((databricksCheatsheetsJson as any)?.cards)) {
      for (const card of (databricksCheatsheetsJson as any).cards) {
        this.addDoc(
          `dbx-cheat-${card.id}`,
          `${card.title} (Databricks)`,
          "Cheat Sheets",
          "Cheat Sheets",
          `/cheat-sheet`,
          card.tag || "PROD",
          card.description || card.tag || "",
          [card.domain, card.domainTitle, card.tag, "databricks"].filter(Boolean).join(" "),
          1.4,
          "terminal"
        );
      }
    }

    for (const d100 of (databricks100Json as any[])) {
      this.addDoc(
        `dbx100-${d100.id}`,
        `Day ${d100.day}: ${d100.concept} (Databricks 100)`,
        "Code Practice",
        "Databricks Coding",
        `/code-practice/databricks`,
        d100.difficulty || "PROD",
        d100.summary || "",
        [d100.category, ...(d100.keyPoints || []), "databricks 100"].filter(Boolean).join(" "),
        1.5,
        "flame"
      );
    }

    // 7. Modern Blueprints & Whiteboard Architecture Diagrams
    for (const b of (modernBlueprintsJson as ModernBlueprint[])) {
      this.addDoc(
        `bp-${b.id}`,
        b.title,
        "Blueprints",
        "Modern Stack",
        `/modern-stack#blueprints`,
        b.category,
        `Blueprint: ${b.category} (${b.costEstimate || "Serverless"})`,
        [b.category, ...(b.tags || [])].join(" "),
        1.6,
        "cpu"
      );
    }

    for (const diag of architectureDiagrams) {
      this.addDoc(
        `diagram-${diag.id}`,
        `${diag.title} (Whiteboard)`,
        "Blueprints",
        "Architecture",
        `/architecture#${diag.id}`,
        "Whiteboard",
        diag.subtitle || diag.description || "",
        [...(diag.tags || []), diag.category, "whiteboard", "diagram", "blueprint", "architecture", ...(diag.keyPoints || [])].join(" "),
        1.7,
        "layout"
      );
    }

    // 8. Simulators
    const simulators = [
      {
        id: "sim-shuffle",
        title: "Simulator: Spark Shuffle & Partition Estimator",
        category: "Simulators" as SearchCategory,
        page: "Modern Stack",
        href: "/modern-stack#simulators",
        badge: "Interactive Tool",
        snippet: "Interactive partition and memory calculation for large Apache Spark shuffle stages.",
        keywords: "spark shuffle partition memory estimator calculator tuning spill oom",
      },
      {
        id: "sim-delta",
        title: "Simulator: Iceberg vs Delta Decision Tree",
        category: "Simulators" as SearchCategory,
        page: "Modern Stack",
        href: "/modern-stack#simulators",
        badge: "Interactive Tool",
        snippet: "Decision engine for choosing between Apache Iceberg and Delta Lake table formats.",
        keywords: "iceberg delta lakehouse table format decision tree simulator comparison",
      },
      {
        id: "sim-cost",
        title: "Simulator: Serverless Cloud Cost Calculator",
        category: "Simulators" as SearchCategory,
        page: "Modern Stack",
        href: "/modern-stack#simulators",
        badge: "Interactive Tool",
        snippet: "Cloud compute and storage cost estimation across Azure, AWS, and GCP data workloads.",
        keywords: "cost calculator serverless cloud finops simulator pricing azure aws gcp",
      },
      {
        id: "sim-spark-engine",
        title: "Spark Engine & Execution Simulator",
        category: "Simulators" as SearchCategory,
        page: "Spark Engine",
        href: "/spark-engine",
        badge: "Engine",
        snippet: "Visual runtime simulator for Catalyst optimizer, Tungsten off-heap memory, and AQE execution.",
        keywords: "spark engine simulator catalyst tungsten aqe photon stages tasks memory",
      },
    ];
    for (const sim of simulators) {
      this.addDoc(
        sim.id,
        sim.title,
        sim.category,
        sim.page,
        sim.href,
        sim.badge,
        sim.snippet,
        sim.keywords,
        1.7,
        "calculator"
      );
    }

    // 9. Learning Paths
    for (const p of (dataPathsJson as LearningPath[])) {
      this.addDoc(
        `path-${p.id}`,
        `${p.title} (${p.weeks} Weeks)`,
        "Learning Paths",
        "Learning Paths",
        `/learning-paths?id=${p.id}`,
        `${p.weeks}w`,
        p.description || "",
        (p.skills || []).join(" "),
        1.3,
        "compass"
      );
    }

    // 10. Company Profiles
    for (const cp of (companyProfilesJson as CompanyProfile[])) {
      this.addDoc(
        `company-${cp.id}`,
        `${cp.name} — GCC Tech Profile`,
        "Companies",
        "Company Research",
        `/company-research`,
        cp.tier || "GCC",
        cp.keyChallenges || `Location: ${cp.location}`,
        [...(cp.stack || []), ...(cp.interviewFocus || []), cp.location || ""].join(" "),
        1.3,
        "building"
      );
    }

    this.vocab = Array.from(this.postings.keys());
  }

  /**
   * Google-Grade BM25F Candidate Search & Relevance Ranking
   */
  public search(
    rawQuery: string,
    maxResults = 35,
    categoryFilter?: string,
    identifiedTopics: TopicIdentification[] = []
  ): SearchResultItem[] {
    const trimmed = rawQuery.trim();
    if (!trimmed) return [];

    const rawTokens = tokenizeQuery(trimmed);
    if (rawTokens.length === 0) return [];

    const expandedTokens = expandQueryTokens(rawTokens);
    const fullQueryLower = trimmed.toLowerCase();
    const primaryTopicKey = identifiedTopics.length > 0 ? identifiedTopics[0].key.toLowerCase() : null;

    const candidateScores = new Map<number, number>();
    const docMatchedTokens = new Map<number, Set<string>>();

    const totalDocs = this.docs.length;
    const k1 = 1.2;

    for (const token of expandedTokens) {
      const stem = stemToken(token);
      let list = this.postings.get(token) || this.postings.get(stem);

      // Typo tolerance: if no exact match and token >= 4 chars, search vocabulary with Levenshtein distance <= 1
      if (!list && token.length >= 4) {
        for (const vocabWord of this.vocab) {
          if (Math.abs(vocabWord.length - token.length) <= 1 && levenshteinDistance(token, vocabWord) <= 1) {
            list = this.postings.get(vocabWord);
            if (list) break;
          }
        }
      }

      if (!list || list.length === 0) continue;

      // IDF (Inverse Document Frequency)
      const docFreq = list.length;
      const idf = Math.log(1 + (totalDocs - docFreq + 0.5) / (docFreq + 0.5));

      for (const entry of list) {
        const { docIdx, tfTitle, tfKw, tfSnip } = entry;

        // BM25F weighted term frequency
        const weightedTF = tfTitle * 10.0 + tfKw * 5.0 + tfSnip * 1.5;
        const termScore = idf * ((weightedTF * (k1 + 1)) / (weightedTF + k1));

        candidateScores.set(docIdx, (candidateScores.get(docIdx) || 0) + termScore);

        let matchedSet = docMatchedTokens.get(docIdx);
        if (!matchedSet) {
          matchedSet = new Set<string>();
          docMatchedTokens.set(docIdx, matchedSet);
        }
        matchedSet.add(token);
      }
    }

    // Ensure the primary identified topic track is evaluated even if not all query tokens matched it
    if (primaryTopicKey) {
      const topicDocIdx = this.docs.findIndex(
        (d) => d.category === "Guided Track" && d.id === `topic-${primaryTopicKey}`
      );
      if (topicDocIdx !== -1 && !candidateScores.has(topicDocIdx)) {
        candidateScores.set(topicDocIdx, 15);
      }
    }

    const scoredItems: SearchResultItem[] = [];
    let guidedTrackIncludedCount = 0;

    for (const [docIdx, bm25Score] of candidateScores.entries()) {
      const doc = this.docs[docIdx];

      if (categoryFilter && categoryFilter !== "All" && doc.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        continue;
      }

      const matchedTokens = docMatchedTokens.get(docIdx) || new Set<string>();
      const matchCoverage = matchedTokens.size / rawTokens.length;

      // Multi-word rigor: for queries with 2+ tokens, require at least 50% match coverage (unless primary topic)
      const isPrimaryTopic = primaryTopicKey && doc.category === "Guided Track" && doc.id === `topic-${primaryTopicKey}`;
      if (rawTokens.length >= 2 && matchCoverage < 0.5 && !isPrimaryTopic) {
        continue;
      }

      let finalScore = bm25Score * doc.authority;
      const titleLower = doc.title.toLowerCase();

      // 1. Exact Full Phrase Bonus (Google-style highest priority)
      if (fullQueryLower.length > 2 && titleLower.includes(fullQueryLower)) {
        finalScore += 500;
      } else if (doc.keywords.toLowerCase().includes(fullQueryLower)) {
        finalScore += 200;
      } else if (doc.snippet.toLowerCase().includes(fullQueryLower)) {
        finalScore += 90;
      }

      // Primary identified topic track discovery boost (Google-style Knowledge Track)
      if (isPrimaryTopic) {
        finalScore += 260;
      }

      // 2. All tokens in title bonus
      const allInTitle = rawTokens.every((t) => titleLower.includes(t) || titleLower.includes(stemToken(t)));
      if (allInTitle) {
        finalScore += 120;
      }

      // 3. Proximity bonus for multi-word queries
      if (rawTokens.length >= 2 && allInTitle) {
        const firstIdx = titleLower.indexOf(rawTokens[0]);
        const lastIdx = titleLower.indexOf(rawTokens[rawTokens.length - 1]);
        if (firstIdx !== -1 && lastIdx !== -1) {
          const span = Math.abs(lastIdx - firstIdx);
          if (span < 40) finalScore += 80;
        }
      }

      // Dynamic KWIC snippet generation
      let snippet = doc.snippet;
      if (doc.snippet && rawTokens.length > 0) {
        const snipLower = doc.snippet.toLowerCase();
        const hitToken = rawTokens.find((t) => snipLower.includes(t));
        if (hitToken) {
          const hitIdx = snipLower.indexOf(hitToken);
          const start = Math.max(0, hitIdx - 35);
          const end = Math.min(doc.snippet.length, hitIdx + 110);
          snippet = (start > 0 ? "..." : "") + doc.snippet.slice(start, end).trim() + (end < doc.snippet.length ? "..." : "");
        }
      }

      scoredItems.push({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        page: doc.page,
        href: doc.href,
        badge: doc.badge,
        snippet,
        score: Math.round(finalScore * 10) / 10,
        iconType: doc.iconType,
      });
    }

    // Sort by highest relevance score
    scoredItems.sort((a, b) => b.score - a.score);

    // Diversify results:
    // Ensure Guided Track does not crowd out specific concepts/questions/scenarios.
    // Cap Guided Track at maximum 1 in the top items list.
    const filteredResults: SearchResultItem[] = [];
    for (const item of scoredItems) {
      if (item.category === "Guided Track") {
        if (guidedTrackIncludedCount >= 1) continue;
        guidedTrackIncludedCount++;
      }
      filteredResults.push(item);
    }

    return filteredResults.slice(0, maxResults);
  }
}

// Global cached in-memory index singleton
const globalIndex = new InvertedSearchIndex();

/**
 * Universal Portal Search Engine (Google-grade BM25F Algorithm)
 * Searches across: Guided Tracks, Concepts, Q&A Prep, Architecture Hub, Code Practice, Cheatsheets, Blueprints, Simulators, Company Profiles.
 */
export function executePortalSearch(
  query: string,
  maxResults = 35,
  categoryFilter?: string
): SearchResponse {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      query: "",
      total: 0,
      identifiedTopics: [],
      pageCounts: {},
      items: [],
      navigationalJump: null,
    };
  }

  globalIndex.init();

  const tokens = tokenizeQuery(trimmed);
  const identifiedTopics = identifyTopicsFromTokens(tokens);
  const navigationalJump = detectNavigationalIntent(trimmed);

  const items = globalIndex.search(trimmed, maxResults, categoryFilter, identifiedTopics);

  const pageCounts: Record<string, number> = {};
  for (const item of items) {
    pageCounts[item.page] = (pageCounts[item.page] || 0) + 1;
  }

  return {
    query: trimmed,
    total: items.length,
    identifiedTopics,
    pageCounts,
    items,
    navigationalJump,
  };
}
