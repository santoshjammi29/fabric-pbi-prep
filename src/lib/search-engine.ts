import searchCatalogJson from "@/data/json/search_catalog.json";
import { GUIDED_TOPICS, GuidedTopic } from "@/data/guided-learning-topics";

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
 * Internal Search Document Structure for the Google-Grade BM25F Search Catalog
 */
export interface CatalogItem {
  id: string;
  title: string;
  category: SearchCategory;
  page: string;
  href: string;
  badge?: string;
  snippet: string;
  keywords: string;
  iconType: string;
  priority: number;
}

export type CatalogTuple = [
  string, // 0: id
  string, // 1: title
  string, // 2: tLow
  number, // 3: catIdx
  number, // 4: pageIdx
  number, // 5: iconIdx
  string, // 6: href
  string, // 7: badge
  string, // 8: snippet
  string, // 9: kLow
  number  // 10: priority
];

interface CatalogPayload {
  categories: string[];
  pages: string[];
  icons: string[];
  docs: CatalogTuple[];
}

const catalogPayload = searchCatalogJson as unknown as CatalogPayload;

function matchesWordWithTypo(text: string, tok: string): boolean {
  let start = 0;
  for (let i = 0; i <= text.length; i++) {
    const isDelim =
      i === text.length ||
      text.charCodeAt(i) <= 32 ||
      text.charCodeAt(i) === 44 ||
      text.charCodeAt(i) === 45 ||
      text.charCodeAt(i) === 58 ||
      text.charCodeAt(i) === 47;
    if (isDelim) {
      const len = i - start;
      if (len >= 4 && Math.abs(len - tok.length) <= 1) {
        const word = text.slice(start, i);
        if (levenshteinDistance(tok, word) <= 1) return true;
      }
      start = i + 1;
    }
  }
  return false;
}

export class InvertedSearchIndex {
  public docs: CatalogTuple[] = catalogPayload.docs || [];
  public categories: string[] = catalogPayload.categories || [];
  public pages: string[] = catalogPayload.pages || [];
  public icons: string[] = catalogPayload.icons || [];

  public init() {
    // Zero-overhead initialization
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

    const scoredCandidates: Array<{ idx: number; score: number }> = [];
    const stemmedTokens = expandedTokens.map(stemToken);
    const docs = this.docs;
    const categories = this.categories;
    const isFilter = Boolean(categoryFilter && categoryFilter !== "All");
    const targetCatLower = categoryFilter ? categoryFilter.toLowerCase() : "";

    for (let i = 0; i < docs.length; i++) {
      const d = docs[i];
      const cat = categories[d[3]];

      if (isFilter && cat.toLowerCase() !== targetCatLower) {
        continue;
      }

      const id = d[0];
      const tLow = d[2];
      const kLow = d[9];
      const isPrimaryTopic = Boolean(primaryTopicKey && cat === "Guided Track" && id === `topic-${primaryTopicKey}`);

      // Fast pre-filter for queries with 3+ tokens
      if (rawTokens.length >= 3 && !isPrimaryTopic) {
        let hasHit = false;
        for (let rIdx = 0; rIdx < rawTokens.length; rIdx++) {
          const r = rawTokens[rIdx];
          if (tLow.includes(r) || kLow.includes(r)) {
            hasHit = true;
            break;
          }
        }
        if (!hasHit) continue;
      }

      let score = 0;
      let hitCount = 0;

      // 1. Exact phrase bonus (Google-style highest boost)
      if (fullQueryLower.length > 2) {
        if (tLow.includes(fullQueryLower)) score += 500;
        else if (kLow.includes(fullQueryLower)) score += 200;
      }

      // Primary identified topic track discovery boost
      if (isPrimaryTopic) {
        score += 550;
      }

      // 2. Token BM25F field matching
      for (let tIdx = 0; tIdx < expandedTokens.length; tIdx++) {
        const tok = expandedTokens[tIdx];
        let tokenHit = false;

        if (tLow.includes(tok)) {
          score += 40;
          tokenHit = true;
        } else {
          const stem = stemmedTokens[tIdx];
          if (stem !== tok && tLow.includes(stem)) {
            score += 30;
            tokenHit = true;
          }
        }

        if (kLow.includes(tok)) {
          score += 20;
          tokenHit = true;
        } else {
          const stem = stemmedTokens[tIdx];
          if (stem !== tok && kLow.includes(stem)) {
            score += 15;
            tokenHit = true;
          }
        }

        // Typo tolerance: zero-allocation scan
        if (!tokenHit && tok.length >= 4 && rawTokens.length <= 2) {
          if (matchesWordWithTypo(tLow, tok)) {
            score += 35;
            tokenHit = true;
          }
        }

        if (tokenHit) hitCount++;
      }

      if (score === 0) continue;

      // Multi-word rigor: for queries with 2+ tokens, require at least 50% match coverage (unless primary topic)
      const matchCoverage = hitCount / rawTokens.length;
      if (rawTokens.length >= 2 && matchCoverage < 0.5 && !isPrimaryTopic) {
        continue;
      }

      // 3. All tokens in title bonus
      const allInTitle = rawTokens.every((t) => tLow.includes(t) || tLow.includes(stemToken(t)));
      if (allInTitle) {
        score += 120;
      }

      // 4. Proximity bonus for multi-word queries
      if (rawTokens.length >= 2 && allInTitle) {
        const firstIdx = tLow.indexOf(rawTokens[0]);
        const lastIdx = tLow.indexOf(rawTokens[rawTokens.length - 1]);
        if (firstIdx !== -1 && lastIdx !== -1) {
          const span = Math.abs(lastIdx - firstIdx);
          if (span < 40) score += 80;
        }
      }

      // Multi-token co-occurrence boost
      if (hitCount === rawTokens.length) {
        score *= 1.5;
      }

      score *= d[10]; // priority

      scoredCandidates.push({ idx: i, score });
    }

    scoredCandidates.sort((a, b) => b.score - a.score);

    // Cap Guided Track at maximum 1 in the top items list to prevent crowding
    const filteredResults: SearchResultItem[] = [];
    let guidedTrackIncludedCount = 0;

    for (let cIdx = 0; cIdx < scoredCandidates.length; cIdx++) {
      const { idx, score } = scoredCandidates[cIdx];
      const d = docs[idx];
      const cat = categories[d[3]] as SearchCategory;

      if (cat === "Guided Track") {
        if (guidedTrackIncludedCount >= 1) continue;
        guidedTrackIncludedCount++;
      }

      // Dynamic KWIC snippet generation on top candidate items
      let snippet = d[8];
      if (snippet && rawTokens.length > 0) {
        const snipLower = snippet.toLowerCase();
        const hitToken = rawTokens.find((t) => snipLower.includes(t));
        if (hitToken) {
          const hitIdx = snipLower.indexOf(hitToken);
          const start = Math.max(0, hitIdx - 35);
          const end = Math.min(snippet.length, hitIdx + 110);
          snippet = (start > 0 ? "..." : "") + snippet.slice(start, end).trim() + (end < snippet.length ? "..." : "");
        }
      }

      filteredResults.push({
        id: d[0],
        title: d[1],
        category: cat,
        page: this.pages[d[4]],
        href: d[6],
        badge: d[7],
        snippet,
        score: Math.round(score * 10) / 10,
        iconType: this.icons[d[5]],
      });

      if (filteredResults.length >= maxResults * 2) {
        break;
      }
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
