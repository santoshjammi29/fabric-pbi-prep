/**
 * Data Access Module
 * Exports strongly typed JSON datasets and query helper utilities.
 */

import type {
  Question,
  ArchitectureQuestion,
  Concept,
  CodeSheetItem,
  PersonalisedQuestion,
  ModernBadgesMap,
  ModernSubdomain,
  ModernConcept,
  ModernCodeMatrix,
  ModernBlueprint,
  ModernStackQuestion,
  ModernCostPlaybook,
  ModernStackDataset,
  LearningPath,
  UnifiedQuestion,
  StandardizedDomain,
  Difficulty,
  DatasetCounts,
} from '@/types/data';

import questionsJson from './json/questions.json';
import dataArchitectureJson from './json/data_architecture.json';
import dataConceptsJson from './json/data_concepts.json';
import dataDeJson from './json/data_de.json';
import dataPysparkJson from './json/data_pyspark.json';
import dataSparksqlJson from './json/data_sparksql.json';
import dataMssqlJson from './json/data_mssql.json';
import dataPythonJson from './json/data_python.json';
import dataPersonalisedJson from './json/data_personalised.json';
import modernBadgesJson from './json/modern_badges.json';
import modernSubdomainsJson from './json/modern_subdomains.json';
import modernConceptsJson from './json/modern_concepts.json';
import modernCodeMatrixJson from './json/modern_code_matrix.json';
import modernBlueprintsJson from './json/modern_blueprints.json';
import modernStackJson from './json/modern_stack.json';
import modernCostPlaybooksJson from './json/modern_cost_playbooks.json';
import dataPathsJson from './json/data_paths.json';

// Cast datasets to typed arrays
export const questionsDb: Question[] = questionsJson as Question[];
export const architectureData: ArchitectureQuestion[] = dataArchitectureJson as ArchitectureQuestion[];
export const conceptsDb: Concept[] = dataConceptsJson as Concept[];
export const questionsDeDb: Question[] = dataDeJson as Question[];
export const pysparkData: CodeSheetItem[] = dataPysparkJson as CodeSheetItem[];
export const sparksqlData: CodeSheetItem[] = dataSparksqlJson as CodeSheetItem[];
export const mssqlData: CodeSheetItem[] = dataMssqlJson as CodeSheetItem[];
export const pythonData: CodeSheetItem[] = dataPythonJson as CodeSheetItem[];
export const personalisedQuestions: PersonalisedQuestion[] = dataPersonalisedJson as PersonalisedQuestion[];

export const modernBadges: ModernBadgesMap = modernBadgesJson as ModernBadgesMap;
export const modernSubdomains: ModernSubdomain[] = modernSubdomainsJson as ModernSubdomain[];
export const modernConceptsDb: ModernConcept[] = modernConceptsJson as ModernConcept[];
export const modernCodeMatrix: ModernCodeMatrix[] = modernCodeMatrixJson as ModernCodeMatrix[];
export const modernBlueprintsDb: ModernBlueprint[] = modernBlueprintsJson as ModernBlueprint[];
export const modernStackDb: ModernStackQuestion[] = modernStackJson as ModernStackQuestion[];
export const modernCostPlaybooks: ModernCostPlaybook[] = modernCostPlaybooksJson as ModernCostPlaybook[];

export const modernStackDataset: ModernStackDataset = {
  badges: modernBadges,
  subdomains: modernSubdomains,
  concepts: modernConceptsDb,
  codeMatrix: modernCodeMatrix,
  blueprints: modernBlueprintsDb,
  questions: modernStackDb,
  costPlaybooks: modernCostPlaybooks,
};

export const learningPathsDb: LearningPath[] = dataPathsJson as LearningPath[];

/**
 * Standardize difficulty string to enum value
 */
export function normalizeDifficulty(diff: string | number | undefined): Difficulty {
  if (!diff) return 'MEDIUM';
  if (typeof diff === 'number') {
    if (diff <= 1) return 'EASY';
    if (diff <= 4) return 'MEDIUM';
    if (diff <= 8) return 'HARD';
    return 'ARCHITECT';
  }
  const upper = diff.toUpperCase().trim();
  if (upper === 'EASY' || upper === 'BEGINNER') return 'EASY';
  if (upper === 'MEDIUM' || upper === 'INTERMEDIATE') return 'MEDIUM';
  if (upper === 'HARD' || upper === 'ADVANCED') return 'HARD';
  if (upper === 'ARCHITECT' || upper === 'EXPERT') return 'ARCHITECT';
  return 'MEDIUM';
}

/**
 * Map an item to one of the 8 canonical standardized domains
 */
export function getStandardizedDomain(item: {
  category?: string;
  categoryLabel?: string;
  sourceDb?: string;
  db?: string;
}): StandardizedDomain {
  if (!item) return 'General Data Engineering';
  const sourceDb = item.sourceDb || item.db || '';
  const cat = (item.categoryLabel || item.category || '').toUpperCase().trim();

  // 1. Compute & Orchestration
  if (
    cat.includes('SPARK') ||
    cat.includes('DATABRICKS') ||
    cat.includes('AIRFLOW') ||
    cat.includes('FLINK') ||
    cat.includes('BIG DATA') ||
    cat.includes('DISTRIBUTED') ||
    cat.includes('RESOURCE') ||
    sourceDb === 'pyspark'
  ) {
    return 'Compute & Orchestration';
  }

  // 2. Databases, SQL & Storage
  if (
    cat.includes('SQL') ||
    cat.includes('DATABASE') ||
    cat.includes('QUERY') ||
    cat.includes('JOINS') ||
    cat.includes('AGGREGATION') ||
    cat.includes('DML') ||
    cat.includes('DDL') ||
    cat.includes('PROGRAMMABILITY') ||
    sourceDb === 'mssql' ||
    sourceDb === 'sparksql'
  ) {
    return 'Databases, SQL & Storage';
  }

  // 3. Data Pipelines & Ingestion
  if (
    cat.includes('ADF') ||
    cat.includes('PIPELINE') ||
    cat.includes('INGESTION') ||
    cat.includes('CDC') ||
    cat.includes('KAFKA') ||
    cat.includes('DBT') ||
    cat.includes('ETL') ||
    cat.includes('INTEGRATION')
  ) {
    return 'Data Pipelines & Ingestion';
  }

  // 4. Data Lakehouse & Architecture
  if (
    cat.includes('LAKEHOUSE') ||
    cat.includes('DATALAKE') ||
    cat.includes('DELTA') ||
    cat.includes('MODELING') ||
    cat.includes('VAULT') ||
    cat.includes('STORAGE') ||
    cat.includes('ARCHITECTURE') ||
    cat.includes('MEDALLION') ||
    cat.includes('FORMAT')
  ) {
    return 'Data Lakehouse & Architecture';
  }

  // 5. Data Governance & Quality
  if (
    cat.includes('GOVERNANCE') ||
    cat.includes('QUALITY') ||
    cat.includes('SECURITY') ||
    cat.includes('DEVOPS') ||
    cat.includes('METADATA') ||
    cat.includes('CATALOG') ||
    cat.includes('TOPOGRAPHY') ||
    cat.includes('LINEAGE')
  ) {
    return 'Data Governance & Quality';
  }

  // 6. Analytics, BI & AI
  if (
    cat.includes('FABRIC') ||
    cat.includes('POWER BI') ||
    cat.includes('VISUALIZATION') ||
    cat.includes('EXCEL') ||
    cat.includes('ANALYTICS') ||
    cat.includes('RAG') ||
    cat.includes('VECTOR') ||
    cat.includes('LLM') ||
    cat.includes('SEMANTIC')
  ) {
    return 'Analytics, BI & AI';
  }

  // 7. FinOps & Performance Optimization
  if (
    cat.includes('FINOPS') ||
    cat.includes('COST') ||
    cat.includes('PERFORMANCE') ||
    cat.includes('OPTIMIZATION') ||
    cat.includes('TUNING') ||
    cat.includes('DEBUG')
  ) {
    return 'FinOps & Performance Optimization';
  }

  return 'General Data Engineering';
}

/**
 * Return all questions across datasets unified into a single normalized array
 */
export function getUnifiedQuestions(): UnifiedQuestion[] {
  const diffWeights: Record<Difficulty, number> = {
    EASY: 1,
    MEDIUM: 2,
    HARD: 3,
    ARCHITECT: 4,
  };

  const list: UnifiedQuestion[] = [];

  // 1. Fabric & PBI
  questionsDb.forEach((q) => {
    list.push({
      ...q,
      sourceDb: 'fabric_pbi',
      sourceLabel: 'Fabric & PBI',
      categoryLabel: q.category,
      difficulty: normalizeDifficulty(q.difficulty),
    });
  });

  // 2. Personalised
  personalisedQuestions.forEach((q) => {
    list.push({
      ...q,
      sourceDb: 'personalised',
      sourceLabel: 'Personalised',
      categoryLabel: q.subdomain || q.domain || 'Personalised',
      difficulty: normalizeDifficulty(q.difficulty),
    });
  });

  // 3. Modern Stack
  modernStackDb.forEach((q) => {
    list.push({
      id: q.id,
      question: q.question,
      answer: q.answer,
      category: q.category,
      categoryLabel: q.category || 'Modern Stack',
      difficulty: normalizeDifficulty(q.difficulty),
      sourceDb: 'modern_stack',
      sourceLabel: 'Modern Stack',
      level: q.level,
    });
  });

  // 4. General DE
  questionsDeDb.forEach((q) => {
    list.push({
      ...q,
      sourceDb: 'general',
      sourceLabel: 'General DE',
      categoryLabel: q.category,
      difficulty: normalizeDifficulty(q.difficulty),
    });
  });

  // 5. Python
  pythonData.forEach((q) => {
    list.push({
      id: q.id,
      question: q.title,
      answer: q.description || '',
      category: q.category || 'Python',
      categoryLabel: q.category || 'Python',
      difficulty: normalizeDifficulty(q.level),
      sourceDb: 'python',
      sourceLabel: 'Python Coding',
      code: q.code,
      notes: q.notes,
      use_case: q.use_case,
      level: q.level,
    });
  });

  // 6. MSSQL
  mssqlData.forEach((q) => {
    list.push({
      id: q.id,
      question: q.title,
      answer: q.description || '',
      category: q.category || 'SQL',
      categoryLabel: q.category || 'SQL',
      difficulty: normalizeDifficulty(q.level),
      sourceDb: 'mssql',
      sourceLabel: 'Advanced SQL',
      code: q.code,
      notes: q.notes,
      use_case: q.use_case,
      level: q.level,
    });
  });

  // 7. PySpark
  pysparkData.forEach((q) => {
    list.push({
      id: q.id,
      question: q.title,
      answer: q.description || '',
      category: q.category || 'PySpark',
      categoryLabel: q.category || 'PySpark',
      difficulty: normalizeDifficulty(q.level),
      sourceDb: 'pyspark',
      sourceLabel: 'PySpark Coding',
      code: q.code,
      notes: q.notes,
      use_case: q.use_case,
      level: q.level,
    });
  });

  // 8. Spark SQL
  sparksqlData.forEach((q) => {
    list.push({
      id: q.id,
      question: q.title,
      answer: q.description || '',
      category: q.category || 'Spark SQL',
      categoryLabel: q.category || 'Spark SQL',
      difficulty: normalizeDifficulty(q.level),
      sourceDb: 'sparksql',
      sourceLabel: 'Spark SQL Coding',
      code: q.code,
      notes: q.notes,
      use_case: q.use_case,
      level: q.level,
    });
  });

  return list.sort((a, b) => {
    const weightA = diffWeights[a.difficulty] || 2;
    const weightB = diffWeights[b.difficulty] || 2;
    return weightA - weightB;
  });
}

/**
 * Summary dataset counts
 */
export function getDatasetCounts(): DatasetCounts {
  const unified = getUnifiedQuestions();
  return {
    questionsDb: questionsDb.length,
    architectureData: architectureData.length,
    conceptsDb: conceptsDb.length,
    questionsDeDb: questionsDeDb.length,
    pysparkData: pysparkData.length,
    sparksqlData: sparksqlData.length,
    mssqlData: mssqlData.length,
    pythonData: pythonData.length,
    personalisedQuestions: personalisedQuestions.length,
    modernConceptsDb: modernConceptsDb.length,
    modernBlueprintsDb: modernBlueprintsDb.length,
    modernStackDb: modernStackDb.length,
    learningPathsDb: learningPathsDb.length,
    totalQuestions: unified.length,
  };
}
