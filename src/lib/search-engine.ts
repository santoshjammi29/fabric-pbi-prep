import {
  conceptsDb,
  architectureData,
  pysparkData,
  sparksqlData,
  mssqlData,
  pythonData,
  learningPathsDb,
  cheatsheetData,
  databricksCheatsheetData,
  modernBlueprintsDb,
  companyProfiles,
  getUnifiedQuestions,
} from "@/data";
import { GUIDED_TOPICS, GuidedTopic } from "@/data/guided-learning-topics";
import { architectureDiagrams } from "@/data/diagrams";

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

export interface SearchResponse {
  query: string;
  total: number;
  identifiedTopics: TopicIdentification[];
  pageCounts: Record<string, number>;
  items: SearchResultItem[];
}

export const TOPIC_SYNONYMS: Record<string, string[]> = {
  spark: ["spark", "pyspark", "catalyst", "aqe", "tungsten", "photon", "rdd", "shuffle", "broadcast", "skew"],
  databricks: ["databricks", "delta", "unity catalog", "dlt", "delta live tables", "auto loader", "liquid clustering", "zorder", "z-order", "dbfs", "vacuum", "dabs", "databricks 100", "genie", "lakeflow"],
  fabric: ["fabric", "onelake", "direct lake", "directlake", "v-order", "synapse dw", "capacity", "shortcuts", "mirrored"],
  airflow: ["airflow", "dag", "taskflow", "operator", "sensor", "triggerer", "xcom", "celery", "astronomer", "mwaa"],
  dbt: ["dbt", "jinja", "ref", "snapshot", "semantic layer", "macro", "materialization", "dbt mesh", "scd type 2"],
  adf: ["adf", "data factory", "azure data factory", "shir", "integration runtime", "tumbling window", "copy activity"],
  datalake: ["datalake", "data lake", "lakehouse", "medallion", "bronze", "silver", "gold", "iceberg", "hudi", "delta lake", "open table", "parquet", "orc", "avro"],
  modeling: ["modeling", "modelling", "kimball", "star schema", "snowflake schema", "fact table", "dimension", "scd", "slowly changing dimension", "data vault", "surrogate key"],
  sql: ["sql", "tsql", "t-sql", "mssql", "execution plan", "index seek", "index scan", "btree", "window function", "cte", "mvcc", "relational"],
  streaming: ["streaming", "kafka", "flink", "structured streaming", "event-time", "watermark", "consumer group", "offset", "cdc", "debezium", "outbox"],
  governance: ["governance", "purview", "catalog", "lineage", "contracts", "data contracts", "rls", "cls", "masking", "security", "great expectations", "data quality"],
  powerbi: ["powerbi", "power bi", "dax", "vertipaq", "semantic model", "calculate", "measure", "calculated column"],
  python: ["python", "polars", "pandas", "arrow", "apache arrow", "pydantic", "gil", "asyncio", "multiprocessing", "pytest"],
  "system-design": ["system design", "distributed systems", "cap theorem", "saga", "sharding", "consistent hashing", "cache-aside", "redis", "rate limiting"],
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
      if (token === key || key.includes(token) || labelLower.includes(token)) return true;
      return synonyms.some((syn) => syn.includes(token) || token.includes(syn));
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
 * Score an item based on tokens matching title, category, keywords, and body.
 */
function scoreItem(
  title: string,
  category: string,
  keywords: string[],
  body: string,
  tokens: string[],
  fullQuery: string
): { matched: boolean; score: number; snippet?: string } {
  const titleLower = title.toLowerCase();
  const categoryLower = category.toLowerCase();
  const bodyLower = body.toLowerCase();
  const keywordsLower = keywords.map((k) => k.toLowerCase());

  const fullQueryLower = fullQuery.toLowerCase().trim();

  // Exact full-phrase match in title is top priority
  let score = 0;
  if (fullQueryLower.length > 2 && titleLower.includes(fullQueryLower)) {
    score += 250;
  }

  // Check if all tokens match across the item
  let tokensMatched = 0;
  let titleTokensMatched = 0;
  let categoryTokensMatched = 0;
  let bodyTokensMatched = 0;

  for (const token of tokens) {
    let tokenHit = false;

    if (titleLower.includes(token)) {
      titleTokensMatched++;
      tokenHit = true;
    }
    if (categoryLower.includes(token) || keywordsLower.some((k) => k.includes(token))) {
      categoryTokensMatched++;
      tokenHit = true;
    }
    if (bodyLower.includes(token)) {
      bodyTokensMatched++;
      tokenHit = true;
    }

    if (tokenHit) {
      tokensMatched++;
    }
  }

  // Multi-word rigor: for queries with multiple tokens, require at least (N - 1) tokens or 80% tokens matched
  const minRequired = tokens.length > 2 ? tokens.length - 1 : tokens.length;
  if (tokensMatched < minRequired) {
    return { matched: false, score: 0 };
  }

  score += titleTokensMatched * 80;
  score += categoryTokensMatched * 40;
  score += bodyTokensMatched * 20;

  if (titleTokensMatched === tokens.length) {
    score += 120; // All tokens in title
  }
  if (categoryTokensMatched === tokens.length) {
    score += 60; // All tokens in category/tags
  }

  // Generate highlight snippet from body or title
  let snippet: string | undefined = undefined;
  if (body) {
    const firstToken = tokens.find((t) => bodyLower.includes(t)) || tokens[0];
    const matchIdx = bodyLower.indexOf(firstToken);
    if (matchIdx !== -1) {
      const start = Math.max(0, matchIdx - 40);
      const end = Math.min(body.length, matchIdx + 100);
      const prefix = start > 0 ? "..." : "";
      const suffix = end < body.length ? "..." : "";
      snippet = prefix + body.slice(start, end).replace(/\s+/g, " ").trim() + suffix;
    } else {
      snippet = body.slice(0, 120).replace(/\s+/g, " ").trim() + "...";
    }
  }

  return { matched: true, score, snippet };
}

/**
 * Universal Portal Search Engine
 * Searches across: Guided Tracks, Concepts, Q&A Prep, Architecture Hub, Code Practice, Cheatsheets, Blueprints, Simulators, Company Profiles.
 */
export function executePortalSearch(query: string, maxResults = 30): SearchResponse {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      query: "",
      total: 0,
      identifiedTopics: [],
      pageCounts: {},
      items: [],
    };
  }

  const tokens = tokenizeQuery(trimmed);
  const identifiedTopics = identifyTopicsFromTokens(tokens);

  const results: SearchResultItem[] = [];

  // 1. Topic Tracks (Guided Learning)
  for (const topic of GUIDED_TOPICS) {
    const { matched, score, snippet } = scoreItem(
      topic.label,
      topic.domain,
      [topic.key, ...(TOPIC_SYNONYMS[topic.key] || [])],
      `${topic.description}. ${topic.executiveSummary}`,
      tokens,
      trimmed
    );

    const isIdentified = identifiedTopics.some((t) => t.key === topic.key);

    if (matched || isIdentified) {
      results.push({
        id: `topic-${topic.key}`,
        title: `Guided Learning: ${topic.label} Track`,
        category: "Guided Track",
        page: "Guided Learning",
        href: `/guided-learning?topic=${topic.key}`,
        badge: `Track · ${topic.domain}`,
        snippet: snippet || topic.description,
        score: (isIdentified ? 1500 : 800) + (score || 100),
        iconType: "sparkles",
      });
    }
  }

  // 2. Concepts (conceptsDb)
  for (const c of conceptsDb) {
    const { matched, score, snippet } = scoreItem(
      c.term,
      c.category,
      c.keyPoints || [],
      `${c.definition || ""} ${c.explanation || ""}`,
      tokens,
      trimmed
    );

    if (matched) {
      results.push({
        id: `concept-${c.id}`,
        title: `${c.term} (${c.category})`,
        category: "Concepts",
        page: "Key Concepts",
        href: `/concepts?tab=concepts&category=${encodeURIComponent(c.category)}&term=${encodeURIComponent(c.term)}`,
        badge: c.difficulty,
        snippet: snippet || c.definition,
        score: score + 40,
        iconType: "book",
      });
    }
  }

  // 3. Architecture Scenarios (architectureData)
  for (const a of architectureData) {
    const { matched, score, snippet } = scoreItem(
      a.question,
      a.category,
      [a.niche || "", a.source || ""],
      a.answer,
      tokens,
      trimmed
    );

    if (matched) {
      results.push({
        id: `arch-${a.id}`,
        title: a.question,
        category: "Architecture",
        page: "Architecture Hub",
        href: `/architecture?category=${encodeURIComponent(a.category || "ALL")}&card=${encodeURIComponent(a.id)}`,
        badge: a.difficulty,
        snippet: snippet || a.answer.slice(0, 120),
        score: score + 30,
        iconType: "cpu",
      });
    }
  }

  // 4. Q&A Prep Questions (unifiedQuestions)
  const unified = getUnifiedQuestions();
  for (const q of unified) {
    const { matched, score, snippet } = scoreItem(
      q.question,
      q.category || q.categoryLabel || "",
      [q.niche || "", q.domain || "", q.sourceLabel || ""],
      q.answer || "",
      tokens,
      trimmed
    );

    if (matched) {
      results.push({
        id: `qa-${q.id}`,
        title: q.question,
        category: "Q&A Prep",
        page: "Q&A Prep Hub",
        href: `/qa-prep?category=${encodeURIComponent(q.category || "ALL")}&card=${encodeURIComponent(q.id)}`,
        badge: q.difficulty,
        snippet: snippet || q.answer.slice(0, 120),
        score: score + 25,
        iconType: "message",
      });
    }
  }

  // 5. Code Practice (pyspark, sparksql, mssql, python)
  const codeDatasets = [
    { items: pysparkData, name: "PySpark", page: "Code Practice" },
    { items: sparksqlData, name: "SparkSQL", page: "Code Practice" },
    { items: mssqlData, name: "Advanced SQL", page: "Code Practice" },
    { items: pythonData, name: "Python", page: "Code Practice" },
  ];

  for (const set of codeDatasets) {
    for (const item of set.items) {
      const { matched, score, snippet } = scoreItem(
        item.title,
        item.category || set.name,
        [set.name, item.level || "", item.use_case || ""],
        `${item.description || ""} ${item.code || ""}`,
        tokens,
        trimmed
      );

      if (matched) {
        results.push({
          id: `code-${item.id}`,
          title: `${item.title} (${set.name})`,
          category: "Code Practice",
          page: "Code Practice",
          href: `/code-practice`,
          badge: item.level || "PROD",
          snippet: snippet || item.description,
          score: score + 20,
          iconType: "terminal",
        });
      }
    }
  }

  // 6. Cheatsheets (cheatsheetData & databricksCheatsheetData)
  for (const c of cheatsheetData) {
    const { matched, score, snippet } = scoreItem(
      c.title,
      c.category,
      c.tags || [],
      `${c.problem || ""} ${c.solution || ""} ${c.whyItMatters || ""}`,
      tokens,
      trimmed
    );

    if (matched) {
      results.push({
        id: `cheat-${c.id}`,
        title: `${c.title} — ${c.category}`,
        category: "Cheat Sheets",
        page: "Cheat Sheets",
        href: `/cheat-sheet?id=${c.id}`,
        badge: c.impact || "PROD",
        snippet: snippet || c.problem || c.solution,
        score: score + 20,
        iconType: "terminal",
      });
    }
  }

  if (Array.isArray(databricksCheatsheetData?.cards)) {
    for (const card of databricksCheatsheetData.cards) {
      const { matched, score, snippet } = scoreItem(
        card.title,
        card.domainTitle || "Databricks",
        [card.domain || "", card.tag || "", "databricks"],
        `${card.title || ""} ${card.tag || ""}`,
        tokens,
        trimmed
      );

      if (matched) {
        results.push({
          id: `dbx-cheat-${card.id}`,
          title: `${card.title} (Databricks)`,
          category: "Cheat Sheets",
          page: "Cheat Sheets",
          href: `/cheat-sheet`,
          badge: card.tag || "PROD",
          snippet: snippet || card.tag,
          score: score + 20,
          iconType: "terminal",
        });
      }
    }
  }

  // 7. Blueprints & Simulators (modernBlueprintsDb + Simulators)
  for (const b of modernBlueprintsDb) {
    const { matched, score, snippet } = scoreItem(
      b.title,
      b.category,
      b.tags || [],
      `${b.category || ""} ${b.costEstimate || ""}`,
      tokens,
      trimmed
    );

    if (matched) {
      results.push({
        id: `bp-${b.id}`,
        title: b.title,
        category: "Blueprints",
        page: "Modern Stack",
        href: `/modern-stack#blueprints`,
        badge: b.category,
        snippet: snippet || `Blueprint: ${b.category} (${b.costEstimate || "Serverless"})`,
        score: score + 20,
        iconType: "cpu",
      });
    }
  }

  // 7b. Architecture Whiteboard Diagrams
  for (const diag of architectureDiagrams) {
    const { matched, score, snippet } = scoreItem(
      diag.title,
      diag.category,
      [...(diag.tags || []), "whiteboard", "diagram", "blueprint", "architecture"],
      `${diag.subtitle || ""} ${diag.description || ""} ${diag.keyPoints?.join(" ") || ""}`,
      tokens,
      trimmed
    );

    if (matched) {
      results.push({
        id: `diagram-${diag.id}`,
        title: `${diag.title} (Whiteboard)`,
        category: "Blueprints",
        page: "Architecture",
        href: `/architecture#${diag.id}`,
        badge: "Whiteboard",
        snippet: snippet || diag.subtitle,
        score: score + 30,
        iconType: "layout",
      });
    }
  }

  // Simulators
  const simulators = [
    {
      id: "sim-shuffle",
      title: "Simulator: Spark Shuffle & Partition Estimator",
      category: "Simulators" as SearchCategory,
      page: "Modern Stack",
      href: "/modern-stack#simulators",
      badge: "Interactive Tool",
      description: "Interactive partition and memory calculation for large Apache Spark shuffle stages.",
      keywords: ["spark", "shuffle", "partition", "memory", "estimator", "calculator"],
    },
    {
      id: "sim-delta",
      title: "Simulator: Iceberg vs Delta Decision Tree",
      category: "Simulators" as SearchCategory,
      page: "Modern Stack",
      href: "/modern-stack#simulators",
      badge: "Interactive Tool",
      description: "Decision engine for choosing between Apache Iceberg and Delta Lake table formats.",
      keywords: ["iceberg", "delta", "decision", "tree", "lakehouse", "table format", "simulator"],
    },
    {
      id: "sim-cost",
      title: "Simulator: Serverless Cloud Cost Calculator",
      category: "Simulators" as SearchCategory,
      page: "Modern Stack",
      href: "/modern-stack#simulators",
      badge: "Interactive Tool",
      description: "Cloud compute and storage cost estimation across Azure, AWS, and GCP data workloads.",
      keywords: ["cost", "calculator", "serverless", "cloud", "finops", "simulator"],
    },
    {
      id: "sim-spark-engine",
      title: "Spark Engine & Execution Simulator",
      category: "Simulators" as SearchCategory,
      page: "Spark Engine",
      href: "/spark-engine",
      badge: "Engine",
      description: "Visual runtime simulator for Catalyst optimizer, Tungsten off-heap memory, and AQE execution.",
      keywords: ["spark", "engine", "simulator", "catalyst", "tungsten", "aqe", "photon"],
    },
  ];

  for (const sim of simulators) {
    const { matched, score, snippet } = scoreItem(
      sim.title,
      "Simulators",
      sim.keywords,
      sim.description,
      tokens,
      trimmed
    );

    if (matched) {
      results.push({
        id: sim.id,
        title: sim.title,
        category: "Simulators",
        page: sim.page,
        href: sim.href,
        badge: sim.badge,
        snippet: snippet || sim.description,
        score: score + 35,
        iconType: "calculator",
      });
    }
  }

  // 8. Learning Paths (learningPathsDb)
  for (const p of learningPathsDb) {
    const { matched, score, snippet } = scoreItem(
      p.title,
      "Learning Paths",
      p.skills || [],
      p.description || "",
      tokens,
      trimmed
    );

    if (matched) {
      results.push({
        id: `path-${p.id}`,
        title: `${p.title} (${p.weeks} Weeks)`,
        category: "Learning Paths",
        page: "Learning Paths",
        href: `/learning-paths?id=${p.id}`,
        badge: `${p.weeks}w`,
        snippet: snippet || p.description,
        score: score + 15,
        iconType: "compass",
      });
    }
  }

  // 9. Company Profiles (companyProfiles)
  for (const cp of companyProfiles) {
    const { matched, score, snippet } = scoreItem(
      cp.name,
      cp.tier || "Enterprise GCC",
      [...(cp.stack || []), ...(cp.interviewFocus || []), cp.location || ""],
      `${cp.keyChallenges || ""} ${cp.location || ""}`,
      tokens,
      trimmed
    );

    if (matched) {
      results.push({
        id: `company-${cp.id}`,
        title: `${cp.name} — GCC Tech Profile`,
        category: "Companies",
        page: "Company Research",
        href: `/company-research`,
        badge: cp.tier || "GCC",
        snippet: snippet || cp.keyChallenges || `Location: ${cp.location}`,
        score: score + 15,
        iconType: "building",
      });
    }
  }

  // Sort by highest score first
  results.sort((a, b) => b.score - a.score);

  // Group and balance results so the user gets cross-page representation:
  // - Top Guided Tracks
  // - Top Concepts
  // - Top Architecture Scenarios
  // - Top Q&A Questions
  // - Top Code & Tools
  const pageCounts: Record<string, number> = {};
  for (const item of results) {
    pageCounts[item.page] = (pageCounts[item.page] || 0) + 1;
  }

  // De-duplicate by id
  const seenIds = new Set<string>();
  const deduplicated = results.filter((item) => {
    if (seenIds.has(item.id)) return false;
    seenIds.add(item.id);
    return true;
  });

  const finalItems = deduplicated.slice(0, maxResults);

  return {
    query: trimmed,
    total: deduplicated.length,
    identifiedTopics,
    pageCounts,
    items: finalItems,
  };
}
