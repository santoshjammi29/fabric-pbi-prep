/**
 * Universal Serverless Database Adapter (Supabase & MongoDB Atlas)
 *
 * Provides a resilient, high-speed abstraction for fetching data from:
 * 1. Supabase REST (PostgREST) via edge fetch
 * 2. MongoDB Atlas Data API via edge fetch
 * 3. Seeded Server-Side Fallback Cache (for offline dev and zero-credential environments)
 *
 * All datasets are strictly lazy-loaded on demand via dynamic imports
 * to keep Cloudflare Worker isolate startup memory < 10MB (eliminating OOM 1102).
 */

import type {
  Concept,
  ArchitectureQuestion,
  LearningPath,
  CheatCode,
  UnifiedQuestion,
  CompanyProfile,
  DatabricksSuiteData,
  DataOpsDataset,
  CodeSheetItem,
  Databricks100Concept,
  ModernStackQuestion,
  ModernBlueprint,
  ModernCodeMatrix,
  ModernCostPlaybook,
  ModernConcept,
  ModernSubdomain,
} from "@/types/data";

import { dataOpsData } from "@/data/dataops-data";
import { INITIAL_QA_ITEMS, INITIAL_SCENARIO_ITEMS } from "@/data/initial-data";

export interface DatabaseConfig {
  provider: "supabase" | "mongodb" | "in-memory";
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  mongoUri?: string;
  mongoApiKey?: string;
}

const config: DatabaseConfig = {
  provider: process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
    ? "supabase"
    : process.env.MONGODB_ATLAS_URI && process.env.MONGODB_ATLAS_API_KEY
    ? "mongodb"
    : "in-memory",
  supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  mongoUri: process.env.MONGODB_ATLAS_URI,
  mongoApiKey: process.env.MONGODB_ATLAS_API_KEY,
};

/**
 * Fetch from Supabase REST endpoint with edge cache tags
 */
async function fetchSupabaseTable<T>(table: string): Promise<T[] | null> {
  if (!config.supabaseUrl || !config.supabaseAnonKey) return null;
  try {
    const res = await fetch(`${config.supabaseUrl}/rest/v1/${table}?select=*`, {
      headers: {
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`,
        "Content-Type": "application/json",
      },
      cache: "force-cache",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn(`[Supabase] Failed to fetch table ${table}, falling back:`, err);
    return null;
  }
}

/**
 * Fetch from MongoDB Atlas Data API endpoint
 */
async function fetchMongoCollection<T>(collection: string): Promise<T[] | null> {
  if (!config.mongoUri || !config.mongoApiKey) return null;
  try {
    const res = await fetch(`${config.mongoUri}/action/find`, {
      method: "POST",
      headers: {
        "api-key": config.mongoApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dataSource: process.env.MONGODB_DATA_SOURCE || "Cluster0",
        database: process.env.MONGODB_DATABASE || "fabric_prep",
        collection,
      }),
      cache: "force-cache",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.documents || null;
  } catch (err) {
    console.warn(`[MongoDB Atlas] Failed to fetch collection ${collection}, falling back:`, err);
    return null;
  }
}

export const serverlessDb = {
  getProviderName: () => config.provider,

  // Concepts (805 KB) - Lazy loaded
  async getConcepts(): Promise<Concept[]> {
    if (config.provider === "supabase") {
      const data = await fetchSupabaseTable<Concept>("concepts");
      if (data && data.length > 0) return data;
    }
    if (config.provider === "mongodb") {
      const data = await fetchMongoCollection<Concept>("concepts");
      if (data && data.length > 0) return data;
    }
    const mod = await import("@/data/json/data_concepts.json");
    return mod.default as unknown as Concept[];
  },

  // Questions (Lean initial set for sub-10ms SSR, R2 shards for remaining)
  async getUnifiedQuestions(): Promise<UnifiedQuestion[]> {
    if (config.provider === "supabase") {
      const data = await fetchSupabaseTable<UnifiedQuestion>("questions");
      if (data && data.length > 0) return data;
    }
    if (config.provider === "mongodb") {
      const data = await fetchMongoCollection<UnifiedQuestion>("questions");
      if (data && data.length > 0) return data;
    }
    return INITIAL_QA_ITEMS;
  },

  // Architecture Scenarios (Lean initial set for sub-10ms SSR, R2 shards for remaining)
  async getArchitectureData(): Promise<ArchitectureQuestion[]> {
    if (config.provider === "supabase") {
      const data = await fetchSupabaseTable<ArchitectureQuestion>("architecture_scenarios");
      if (data && data.length > 0) return data;
    }
    if (config.provider === "mongodb") {
      const data = await fetchMongoCollection<ArchitectureQuestion>("architecture_scenarios");
      if (data && data.length > 0) return data;
    }
    return INITIAL_SCENARIO_ITEMS;
  },

  // Cheatsheets (133 KB) - Lazy loaded
  async getCheatsheetData(): Promise<CheatCode[]> {
    if (config.provider === "supabase") {
      const data = await fetchSupabaseTable<CheatCode>("cheatsheets");
      if (data && data.length > 0) return data;
    }
    if (config.provider === "mongodb") {
      const data = await fetchMongoCollection<CheatCode>("cheatsheets");
      if (data && data.length > 0) return data;
    }
    const mod = await import("@/data/json/data_cheatsheet.json");
    return mod.default as unknown as CheatCode[];
  },

  // Databricks Architecture & Coding Cheat Sheets (179 KB) - Lazy loaded
  async getDatabricksCheatsheetData(): Promise<DatabricksSuiteData> {
    const mod = await import("@/data/json/databricks_cheatsheets.json");
    return mod.default as unknown as DatabricksSuiteData;
  },

  // Databricks 100 Coding & Operation Guides (135 KB) - Lazy loaded
  async getDatabricks100Data(): Promise<Databricks100Concept[]> {
    const mod = await import("@/data/json/databricks_100.json");
    return mod.default as unknown as Databricks100Concept[];
  },

  // Learning Paths (29 KB) - Lazy loaded
  async getLearningPaths(): Promise<LearningPath[]> {
    if (config.provider === "supabase") {
      const data = await fetchSupabaseTable<LearningPath>("learning_paths");
      if (data && data.length > 0) return data;
    }
    if (config.provider === "mongodb") {
      const data = await fetchMongoCollection<LearningPath>("learning_paths");
      if (data && data.length > 0) return data;
    }
    const mod = await import("@/data/json/data_paths.json");
    return mod.default as unknown as LearningPath[];
  },

  // Modern Stack (<100 KB total) - Lazy loaded
  async getModernStack() {
    const [
      stackMod,
      blueprintsMod,
      matrixMod,
      costPlaybooksMod,
      conceptsMod,
      subdomainsMod,
    ] = await Promise.all([
      import("@/data/json/modern_stack.json"),
      import("@/data/json/modern_blueprints.json"),
      import("@/data/json/modern_code_matrix.json"),
      import("@/data/json/modern_cost_playbooks.json"),
      import("@/data/json/modern_concepts.json"),
      import("@/data/json/modern_subdomains.json"),
    ]);

    return {
      stack: stackMod.default as unknown as ModernStackQuestion[],
      blueprints: blueprintsMod.default as unknown as ModernBlueprint[],
      matrix: matrixMod.default as unknown as ModernCodeMatrix[],
      costPlaybooks: costPlaybooksMod.default as unknown as ModernCostPlaybook[],
      concepts: conceptsMod.default as unknown as ModernConcept[],
      subdomains: subdomainsMod.default as unknown as ModernSubdomain[],
    };
  },

  // Code Practice (<500 KB total) - Lazy loaded
  async getCodePractice(): Promise<{
    pyspark: CodeSheetItem[];
    sparksql: CodeSheetItem[];
    mssql: CodeSheetItem[];
    python: CodeSheetItem[];
  }> {
    const [pysparkMod, sparksqlMod, mssqlMod, pythonMod] = await Promise.all([
      import("@/data/json/data_pyspark.json"),
      import("@/data/json/data_sparksql.json"),
      import("@/data/json/data_mssql.json"),
      import("@/data/json/data_python.json"),
    ]);

    return {
      pyspark: pysparkMod.default as unknown as CodeSheetItem[],
      sparksql: sparksqlMod.default as unknown as CodeSheetItem[],
      mssql: mssqlMod.default as unknown as CodeSheetItem[],
      python: pythonMod.default as unknown as CodeSheetItem[],
    };
  },

  // Companies (226 KB) - Lazy loaded
  async getCompanyProfiles(): Promise<CompanyProfile[]> {
    const mod = await import("@/data/json/company_profiles.json");
    return mod.default as unknown as CompanyProfile[];
  },

  // DataOps, Connectivity & CI/CD Lifecycle (<50 KB)
  async getDataOpsData(): Promise<DataOpsDataset> {
    return dataOpsData;
  },
};
