/**
 * Comprehensive TypeScript Type Definitions
 * Source: Lakehouse Architect (lakehousearchitect.com)
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
  mergedFrom?: string[];
  linked_concept_id?: string;
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
  relatedTerms?: string[];
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
  mergedFrom?: string[];
  linked_concept_id?: string;
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

// ==========================================
// 12. Production Cheat Sheet
// ==========================================

export type CheatCodeCategory =
  | 'Spark Core'
  | 'Spark Optimization'
  | 'Orchestration'
  | 'Debugging & Observability'
  | 'SQL & Storage'
  | 'Production Best Practices';

export type CheatCodeImpact = 'High Impact' | 'Quick Win' | 'Architect Level' | 'Critical';
export type CheatCodeEffort = 'Low Effort' | 'Medium Effort' | 'High Effort';

export interface CheatCode {
  id: string;
  title: string;
  category: CheatCodeCategory;
  categorySlug: string;
  impact: CheatCodeImpact;
  effort: CheatCodeEffort;
  problem: string;
  solution: string;
  codeSnippet: string;
  language: 'python' | 'sql' | 'bash' | 'json';
  whyItMatters: string;
  metrics: string;
  antiPattern: string;
  tags: string[];
  docLinks?: { label: string; url?: string }[];
}

// ==========================================
// 12b. Databricks Architecture & Coding Cheat Sheets
// ==========================================

export type DatabricksDomainId = 'sparksql' | 'pyspark' | 'spark_core' | 'python';

export interface DatabricksExplainItem {
  text: string;
  html: string;
}

export interface DatabricksAlert {
  type: 'tip' | 'perf' | 'warn' | 'sec';
  html: string;
  text: string;
}

export interface DatabricksCheatCard {
  id: string;
  domain: DatabricksDomainId;
  domainTitle: string;
  shortTitle: string;
  domainColor: string;
  page: number;
  cardNumber: number;
  title: string;
  tag: string;
  code: string;
  codeHtml: string;
  language: 'sql' | 'python';
  explain: DatabricksExplainItem[];
  alert: DatabricksAlert | null;
}

export interface DatabricksDomainMeta {
  id: DatabricksDomainId;
  title: string;
  shortTitle: string;
  subtitle: string;
  badge: string;
  accentColor: string;
  pdf: string;
  pdfSize: string;
  poster: string;
  posterDimensions: string;
  pageImages: string[];
  html: string;
  cardCount: number;
}

export interface DatabricksSuiteData {
  suiteTitle: string;
  suiteSubtitle: string;
  masterPdf: {
    title: string;
    url: string;
    size: string;
    pages: number;
  };
  interactiveHub: {
    url: string;
    title: string;
  };
  domains: DatabricksDomainMeta[];
  cards: DatabricksCheatCard[];
}

export interface Databricks100Concept {
  id: string;
  num: number;
  day: number;
  concept: string;
  category: string;
  categoryId: number;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "ARCHITECT";
  summary: string;
  explanation: string;
  keyPoints: string[];
  codeSnippet: string;
  certificationMapping?: string;
}

// ==========================================
// 13. Company Intelligence Profiles
// ==========================================

export type CompanyTier =
  | 'Tier 1 FAANG / BigTech'
  | 'Tier 1 Global FinTech'
  | 'Global Capability Center (GCC)';

export interface CompanyProfile {
  id: string;
  name: string;
  tier: CompanyTier;
  location: string;
  hiringGCCLocations?: string[];
  topicKey: string;
  seniorDeSalary: string;
  architectSalary: string;
  systemDesignArchetype?: string;
  stack: string[];
  interviewFocus: string[];
  keyChallenges: string;
  sampleQuestions?: string[];
}

// ==========================================
// 14. DataOps, Connectivity & CI/CD Lifecycle
// ==========================================

export type DataOpsTool =
  | 'ADF'
  | 'Databricks'
  | 'Apache Airflow'
  | 'dbt'
  | 'SQL / Synapse'
  | 'Azure DevOps & GitHub Actions'
  | 'Azure Key Vault & Secrets';

export interface DataOpsConnectivityItem {
  id: string;
  sourceTool: string;
  targetTool: string;
  connectionProtocol: string;
  authMethod: 'OAuth M2M' | 'Managed Identity' | 'Service Principal' | 'Key Vault Secret Scope' | 'Workload Identity (OIDC)' | 'PAT (Legacy)';
  securityLevel: 'Enterprise Zero-Trust' | 'High Security' | 'Dev Only';
  summary: string;
  configPathOrKey: string;
  configLanguage: 'yaml' | 'json' | 'python' | 'bash' | 'sql';
  configSnippet: string;
  setupSteps: string[];
  keyVaultIntegration: string;
  securityPitfalls: string[];
  interviewDefenseTip: string;
  tags: string[];
}

export interface CicdAlternativeItem {
  id: string;
  name: string;
  category: 'Databricks' | 'Airflow' | 'dbt' | 'ADF' | 'Database / Lakehouse';
  recommendedApproach: string;
  legacyOrAlternative: string;
  tradeOffSummary: string;
  pros: string[];
  cons: string[];
  speedRating: 'Ultra Fast (<2m)' | 'Fast (3-5m)' | 'Moderate (5-15m)' | 'Slow (>20m)';
  costEfficiency: 'Very High (Slim Compute)' | 'High' | 'Medium' | 'Low (Full Rebuild)';
  workflowYaml: string;
  workflowLanguage: 'yaml' | 'bash' | 'powershell';
  architectureDescription: string;
  keyGotchas: string[];
  interviewSoundbite: string;
}

export interface LifecycleDeliverable {
  name: string;
  description: string;
  artifacts: string[];
}

export interface ProjectLifecycleStage {
  stageNumber: number;
  stageName: string;
  phase: 'Architecture & Design' | 'Ingestion & Storage' | 'Processing & Quality' | 'Serving & Semantic' | 'Release & CI/CD' | 'Operations & FinOps';
  objective: string;
  keyArchitecturalDecisions: string[];
  primaryTools: string[];
  concreteDeliverables: LifecycleDeliverable[];
  gatekeeperChecklist: string[];
  interviewExplanationScript: string;
  commonFailureModes: string[];
}

export interface DataOpsDataset {
  connectivity: DataOpsConnectivityItem[];
  cicdAlternatives: CicdAlternativeItem[];
  lifecycleStages: ProjectLifecycleStage[];
}
