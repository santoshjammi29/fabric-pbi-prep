/**
 * Comprehensive TypeScript Type Definitions
 * Source: Fabric & Flow / Microsoft Data Platform Architecture Prep (fabric-pbi-prep.vercel.app)
 */

// ==========================================
// 1. Difficulty & Level Enums / Types
// ==========================================

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'ARCHITECT';

export const DifficultyEnum = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
  ARCHITECT: 'ARCHITECT',
} as const;

export type CodeLevel = 'beginner' | 'intermediate' | 'advanced' | 'architect';

export const CodeLevelEnum = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  ARCHITECT: 'architect',
} as const;

// ==========================================
// 2. Standardized Domains & Subdomains
// ==========================================

export type StandardizedDomain =
  | 'Analytics, BI & AI'
  | 'Compute & Orchestration'
  | 'Databases, SQL & Storage'
  | 'Data Pipelines & Ingestion'
  | 'Data Lakehouse & Architecture'
  | 'Data Governance & Quality'
  | 'FinOps & Performance Optimization'
  | 'General Data Engineering';

export const STANDARDIZED_DOMAINS: readonly StandardizedDomain[] = [
  'Analytics, BI & AI',
  'Compute & Orchestration',
  'Databases, SQL & Storage',
  'Data Pipelines & Ingestion',
  'Data Lakehouse & Architecture',
  'Data Governance & Quality',
  'FinOps & Performance Optimization',
  'General Data Engineering',
] as const;

export type SourceDatabase =
  | 'fabric_pbi'
  | 'general'
  | 'architecture'
  | 'personalised'
  | 'modern_stack'
  | 'python'
  | 'mssql'
  | 'pyspark'
  | 'sparksql';

// ==========================================
// 3. Question (questions.js & data_de.js)
// ==========================================

export interface Question {
  id: string;
  source: string;
  category: string;
  niche: string;
  difficulty: Difficulty;
  question: string;
  answer: string;
  domain?: string;
  subdomain?: string;
}

// ==========================================
// 4. Architecture Question (data_architecture.js)
// ==========================================

export interface ArchitectureQuestion {
  id: string;
  source: string;
  category: string;
  niche: string;
  difficulty: Difficulty;
  question: string;
  answer: string;
}

// ==========================================
// 5. Concept (data_concepts.js)
// ==========================================

export interface Concept {
  id: string;
  term: string;
  category: string;
  difficulty: Difficulty;
  definition: string;
  explanation: string;
  keyPoints: string[];
}

// ==========================================
// 6. Code Sheet (data_pyspark.js, data_sparksql.js, data_mssql.js, data_python.js)
// ==========================================

export interface CodeSheetItem {
  id: string;
  title: string;
  level: CodeLevel;
  category: string;
  description: string;
  code: string;
  notes: string[];
  use_case: string;
}

/** Alias for CodeSheetItem */
export type CodeSheet = CodeSheetItem;

// ==========================================
// 7. Personalised Question (data_personalised.js)
// ==========================================

export interface PersonalisedQuestion {
  id: string;
  source: string;
  category: string;
  niche: string;
  difficulty: Difficulty;
  question: string;
  answer: string;
  domain: string;
  subdomain: string;
}

// ==========================================
// 8. Modern Data Engineering Stack (data_modern_stack.js)
// ==========================================

export interface ModernBadge {
  glyph: string;
  label: string;
  color: string;
}

export type ModernBadgesMap = Record<string, ModernBadge>;

export interface ModernSubdomain {
  id: string;
  title: string;
  icon: string;
}

export interface ModernConcept {
  id: string;
  title: string;
  subdomain: string;
  difficulty: Difficulty;
  summary: string;
  details: string;
}

export interface ModernCodeMatrix {
  topic: string;
  python: string;
  pyspark: string;
  sparksql: string;
  scala: string;
  duckdb: string;
  snowflake: string;
  bigquery: string;
  trino: string;
}

export interface ModernBlueprint {
  id: string;
  title: string;
  category: string;
  costEstimate: string;
  tags: string[];
  mermaid: string;
  ascii: string;
}

export interface ModernStackQuestion {
  id: string;
  level: number;
  difficulty: Difficulty;
  category: string;
  question: string;
  answer: string;
  py_code: string;
  sql_code: string;
  pyspark_code: string;
  scala_code: string;
}

export interface ModernCostPlaybook {
  title: string;
  savings: string;
  summary: string;
  code: string;
}

/** Aggregate type for modern stack items */
export type ModernStackItem =
  | ModernConcept
  | ModernCodeMatrix
  | ModernBlueprint
  | ModernStackQuestion
  | ModernCostPlaybook;

export interface ModernStackDataset {
  badges: ModernBadgesMap;
  subdomains: ModernSubdomain[];
  concepts: ModernConcept[];
  codeMatrix: ModernCodeMatrix[];
  blueprints: ModernBlueprint[];
  questions: ModernStackQuestion[];
  costPlaybooks: ModernCostPlaybook[];
}

// ==========================================
// 9. Learning Path (data_paths.js)
// ==========================================

export interface LearningPathPhase {
  name: string;
  weeks: string;
  milestone: string;
  topics: string[];
}

export interface LearningPathHandsOn {
  title: string;
  repo: string;
  description: string;
}

export interface LearningPath {
  id: string;
  slug: string;
  title: string;
  icon: string;
  badge: string;
  weeks: number;
  difficulty: Difficulty;
  prerequisites: string;
  description: string;
  progress: number;
  skills: string[];
  phases: LearningPathPhase[];
  handsOn: LearningPathHandsOn;
  capstone: string;
  examQsCount: number;
}

// ==========================================
// 10. Unified / Normalized Question Model
// ==========================================

export interface UnifiedQuestion {
  id: string;
  question: string;
  answer: string;
  difficulty: Difficulty;
  category: string;
  categoryLabel?: string;
  niche?: string;
  domain?: string;
  subdomain?: string;
  source?: string;
  sourceDb: SourceDatabase;
  sourceLabel: string;
  code?: string;
  notes?: string[];
  use_case?: string;
  level?: CodeLevel | number;
}

// ==========================================
// 11. Dataset Overview & Stats
// ==========================================

export interface DatasetCounts {
  questionsDb: number;
  architectureData: number;
  conceptsDb: number;
  questionsDeDb: number;
  pysparkData: number;
  sparksqlData: number;
  mssqlData: number;
  pythonData: number;
  personalisedQuestions: number;
  modernConceptsDb: number;
  modernBlueprintsDb: number;
  modernStackDb: number;
  learningPathsDb: number;
  totalQuestions: number;
}
