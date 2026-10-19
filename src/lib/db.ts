/**
 * Universal Serverless Database Adapter (Supabase & MongoDB Atlas)
 *
 * Provides a resilient, high-speed abstraction for fetching data from:
 * 1. Supabase REST (PostgREST) via edge fetch
 * 2. MongoDB Atlas Data API via edge fetch
 * 3. Seeded Server-Side Fallback Cache (for offline dev and zero-credential environments)
 */

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
  modernStackDb,
  modernBlueprintsDb,
  modernCodeMatrix,
  modernCostPlaybooks,
  modernConceptsDb,
  modernSubdomains,
  companyProfiles,
  getUnifiedQuestions,
  dataOpsData,
} from "@/data";

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

  // Concepts
  async getConcepts() {
    if (config.provider === "supabase") {
      const data = await fetchSupabaseTable<any>("concepts");
      if (data && data.length > 0) return data;
    }
    if (config.provider === "mongodb") {
      const data = await fetchMongoCollection<any>("concepts");
      if (data && data.length > 0) return data;
    }
    return conceptsDb;
  },

  // Questions
  async getUnifiedQuestions() {
    if (config.provider === "supabase") {
      const data = await fetchSupabaseTable<any>("questions");
      if (data && data.length > 0) return data;
    }
    if (config.provider === "mongodb") {
      const data = await fetchMongoCollection<any>("questions");
      if (data && data.length > 0) return data;
    }
    return getUnifiedQuestions();
  },

  // Architecture Scenarios
  async getArchitectureData() {
    if (config.provider === "supabase") {
      const data = await fetchSupabaseTable<any>("architecture_scenarios");
      if (data && data.length > 0) return data;
    }
    if (config.provider === "mongodb") {
      const data = await fetchMongoCollection<any>("architecture_scenarios");
      if (data && data.length > 0) return data;
    }
    return architectureData;
  },

  // Cheatsheets
  async getCheatsheetData() {
    if (config.provider === "supabase") {
      const data = await fetchSupabaseTable<any>("cheatsheets");
      if (data && data.length > 0) return data;
    }
    if (config.provider === "mongodb") {
      const data = await fetchMongoCollection<any>("cheatsheets");
      if (data && data.length > 0) return data;
    }
    return cheatsheetData;
  },

  // Databricks Architecture & Coding Cheat Sheets
  async getDatabricksCheatsheetData() {
    return databricksCheatsheetData;
  },

  // Learning Paths
  async getLearningPaths() {
    if (config.provider === "supabase") {
      const data = await fetchSupabaseTable<any>("learning_paths");
      if (data && data.length > 0) return data;
    }
    if (config.provider === "mongodb") {
      const data = await fetchMongoCollection<any>("learning_paths");
      if (data && data.length > 0) return data;
    }
    return learningPathsDb;
  },

  // Modern Stack
  async getModernStack() {
    return {
      stack: modernStackDb,
      blueprints: modernBlueprintsDb,
      matrix: modernCodeMatrix,
      costPlaybooks: modernCostPlaybooks,
      concepts: modernConceptsDb,
      subdomains: modernSubdomains,
    };
  },

  // Code Practice
  async getCodePractice() {
    return {
      pyspark: pysparkData,
      sparksql: sparksqlData,
      mssql: mssqlData,
      python: pythonData,
    };
  },

  // Companies
  async getCompanyProfiles() {
    return companyProfiles;
  },

  // DataOps, Connectivity & CI/CD Lifecycle
  async getDataOpsData() {
    return dataOpsData;
  },
};
