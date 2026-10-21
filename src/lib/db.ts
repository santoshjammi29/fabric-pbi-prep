/**
 * Universal Serverless Database Adapter (Supabase & MongoDB Atlas)
 *
 * Provides a resilient, high-speed abstraction for fetching data from:
 * 1. Supabase REST (PostgREST) via edge fetch
 * 2. MongoDB Atlas Data API via edge fetch
 * 3. Seeded Server-Side Fallback Cache (for offline dev and zero-credential environments)
 *
 * All datasets are strictly decoupled to keep Cloudflare Worker isolate memory < 10MB.
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
  ModernStackQuestion,
  ModernBlueprint,
  ModernCodeMatrix,
  ModernCostPlaybook,
  ModernConcept,
  ModernSubdomain,
} from "@/types/data";

import dataConceptsJson from "@/data/json/data_concepts.json";
import dataCheatsheetJson from "@/data/json/data_cheatsheet.json";
import databricksCheatsheetsJson from "@/data/json/databricks_cheatsheets.json";
import dataPathsJson from "@/data/json/data_paths.json";
import companyProfilesJson from "@/data/json/company_profiles.json";
import dataPysparkJson from "@/data/json/data_pyspark.json";
import dataSparksqlJson from "@/data/json/data_sparksql.json";
import dataMssqlJson from "@/data/json/data_mssql.json";
import dataPythonJson from "@/data/json/data_python.json";
import modernStackJson from "@/data/json/modern_stack.json";
import modernBlueprintsJson from "@/data/json/modern_blueprints.json";
import modernCodeMatrixJson from "@/data/json/modern_code_matrix.json";
import modernCostPlaybooksJson from "@/data/json/modern_cost_playbooks.json";
import modernConceptsJson from "@/data/json/modern_concepts.json";
import modernSubdomainsJson from "@/data/json/modern_subdomains.json";
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

  // Concepts (805 KB)
  async getConcepts(): Promise<Concept[]> {
    if (config.provider === "supabase") {
      const data = await fetchSupabaseTable<Concept>("concepts");
      if (data && data.length > 0) return data;
    }
    if (config.provider === "mongodb") {
      const data = await fetchMongoCollection<Concept>("concepts");
      if (data && data.length > 0) return data;
    }
    return dataConceptsJson as unknown as Concept[];
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

  // Cheatsheets (133 KB)
  async getCheatsheetData(): Promise<CheatCode[]> {
    if (config.provider === "supabase") {
      const data = await fetchSupabaseTable<CheatCode>("cheatsheets");
      if (data && data.length > 0) return data;
    }
    if (config.provider === "mongodb") {
      const data = await fetchMongoCollection<CheatCode>("cheatsheets");
      if (data && data.length > 0) return data;
    }
    return dataCheatsheetJson as CheatCode[];
  },

  // Databricks Architecture & Coding Cheat Sheets (179 KB)
  async getDatabricksCheatsheetData(): Promise<DatabricksSuiteData> {
    return databricksCheatsheetsJson as DatabricksSuiteData;
  },

  // Learning Paths (29 KB)
  async getLearningPaths(): Promise<LearningPath[]> {
    if (config.provider === "supabase") {
      const data = await fetchSupabaseTable<LearningPath>("learning_paths");
      if (data && data.length > 0) return data;
    }
    if (config.provider === "mongodb") {
      const data = await fetchMongoCollection<LearningPath>("learning_paths");
      if (data && data.length > 0) return data;
    }
    return dataPathsJson as LearningPath[];
  },

  // Modern Stack (<100 KB total)
  async getModernStack() {
    return {
      stack: modernStackJson as ModernStackQuestion[],
      blueprints: modernBlueprintsJson as ModernBlueprint[],
      matrix: modernCodeMatrixJson as ModernCodeMatrix[],
      costPlaybooks: modernCostPlaybooksJson as ModernCostPlaybook[],
      concepts: modernConceptsJson as ModernConcept[],
      subdomains: modernSubdomainsJson as ModernSubdomain[],
    };
  },

  // Code Practice (<500 KB total)
  async getCodePractice(): Promise<{
    pyspark: CodeSheetItem[];
    sparksql: CodeSheetItem[];
    mssql: CodeSheetItem[];
    python: CodeSheetItem[];
  }> {
    return {
      pyspark: dataPysparkJson as CodeSheetItem[],
      sparksql: dataSparksqlJson as CodeSheetItem[],
      mssql: dataMssqlJson as CodeSheetItem[],
      python: dataPythonJson as CodeSheetItem[],
    };
  },

  // Companies (226 KB)
  async getCompanyProfiles(): Promise<CompanyProfile[]> {
    return companyProfilesJson as CompanyProfile[];
  },

  // DataOps, Connectivity & CI/CD Lifecycle (<50 KB)
  async getDataOpsData(): Promise<DataOpsDataset> {
    return dataOpsData;
  },
};
