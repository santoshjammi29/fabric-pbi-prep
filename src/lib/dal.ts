import { cache } from "react";
import { serverlessDb } from "@/lib/db";
import {
  Concept,
  ArchitectureQuestion,
  LearningPath,
  CheatCode,
  UnifiedQuestion,
  Difficulty,
  DataOpsDataset,
  DatabricksSuiteData,
  Databricks100Concept,
} from "@/types/data";

/**
 * Server-Side Data Access Layer (DAL)
 *
 * Interfaces with the Serverless Database Engine (Supabase / MongoDB Atlas / In-Memory Fallback).
 * Wraps dataset queries in React cache() to guarantee request-level deduplication,
 * sub-50ms execution, and strict decoupling of multi-megabyte JSONs from client JS bundles.
 */

// --- 1. CONCEPTS ---
export const getConceptsDAL = cache(async (): Promise<Concept[]> => {
  return await serverlessDb.getConcepts();
});

export const getConceptByIdDAL = cache(async (id: string): Promise<Concept | undefined> => {
  const concepts = await serverlessDb.getConcepts();
  return concepts.find((c: Concept) => c.id === id);
});

export const getConceptsCategoriesDAL = cache(async (): Promise<string[]> => {
  const concepts = await serverlessDb.getConcepts();
  const categories = Array.from(new Set(concepts.map((c: Concept) => c.category))).sort();
  return categories as string[];
});

// --- 2. QUESTIONS (Q&A PREP) ---
export const getUnifiedQuestionsDAL = cache(async (): Promise<UnifiedQuestion[]> => {
  return await serverlessDb.getUnifiedQuestions();
});

export interface QuestionQueryParams {
  query?: string;
  difficulty?: Difficulty | "ALL";
  domain?: string;
  page?: number;
  limit?: number;
}

export const queryQuestionsDAL = cache(async (params: QuestionQueryParams = {}) => {
  const { query = "", difficulty = "ALL", domain = "ALL", page = 1, limit = 25 } = params;
  const all = await serverlessDb.getUnifiedQuestions();

  const qLower = query.toLowerCase().trim();
  const filtered = all.filter((item: UnifiedQuestion) => {
    if (difficulty !== "ALL" && item.difficulty !== difficulty) {
      return false;
    }
    if (domain !== "ALL") {
      const cat = (item.category || "").toUpperCase();
      const niche = (item.niche || "").toUpperCase();
      const dom = (item.domain || "").toUpperCase();
      const target = domain.toUpperCase();
      if (!cat.includes(target) && !niche.includes(target) && !dom.includes(target)) {
        return false;
      }
    }
    if (qLower) {
      return (
        item.question.toLowerCase().includes(qLower) ||
        item.answer.toLowerCase().includes(qLower) ||
        (item.category && item.category.toLowerCase().includes(qLower)) ||
        (item.niche && item.niche.toLowerCase().includes(qLower))
      );
    }
    return true;
  });

  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return {
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit),
    items: paginated,
  };
});

// --- 3. ARCHITECTURE QUESTIONS ---
export const getArchitectureDataDAL = cache(async (): Promise<ArchitectureQuestion[]> => {
  return await serverlessDb.getArchitectureData();
});

// --- 4. CODE PRACTICE ---
export const getCodePracticeDataDAL = cache(async () => {
  return await serverlessDb.getCodePractice();
});

// --- 5. LEARNING PATHS & CHEATSHEETS ---
export const getLearningPathsDAL = cache(async (): Promise<LearningPath[]> => {
  return await serverlessDb.getLearningPaths();
});

export const getCheatsheetDataDAL = cache(async (): Promise<CheatCode[]> => {
  return await serverlessDb.getCheatsheetData();
});

export const getDatabricksCheatsheetDataDAL = cache(async (): Promise<DatabricksSuiteData> => {
  return await serverlessDb.getDatabricksCheatsheetData();
});

export const getDatabricks100DataDAL = cache(async (): Promise<Databricks100Concept[]> => {
  return await serverlessDb.getDatabricks100Data();
});

export const getDatabricksCodingHubDAL = cache(async () => {
  const [suite, operations] = await Promise.all([
    serverlessDb.getDatabricksCheatsheetData(),
    serverlessDb.getDatabricks100Data(),
  ]);
  return { suite, operations };
});

// --- 6. MODERN STACK & BLUEPRINTS ---
export const getModernStackDAL = cache(async () => {
  return await serverlessDb.getModernStack();
});

// --- 7. COMPANY PROFILES ---
export const getCompanyProfilesDAL = cache(async () => {
  return await serverlessDb.getCompanyProfiles();
});

// --- 8. DATAOPS, CONNECTIVITY & CI/CD LIFECYCLE ---
export const getDataOpsDataDAL = cache(async (): Promise<DataOpsDataset> => {
  return await serverlessDb.getDataOpsData();
});
