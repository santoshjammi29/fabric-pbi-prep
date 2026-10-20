import { z } from 'zod';

export const DifficultyEnum = z.enum([
  'Foundational',
  'Senior',
  'Principal',
  'Staff',
  'EASY',
  'MEDIUM',
  'HARD',
  'ARCHITECT',
  'easy',
  'medium',
  'hard',
  'architect',
]);

export const QaItemSchema = z.object({
  id: z.string(),
  domain: z.string().default('General Data Engineering'),
  topic: z.string().optional().default('General'),
  difficulty: DifficultyEnum.default('Senior'),
  question: z.string(),
  answer: z.string(),
  rubricPoints: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  companyTargets: z.array(z.string()).optional(),
  category: z.string().optional(),
  niche: z.string().optional(),
  source: z.string().optional(),
  subdomain: z.string().optional(),
});

export const ScenarioItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string().default('General Architecture'),
  difficulty: DifficultyEnum.default('Principal'),
  problemStatement: z.string(),
  constraints: z.array(z.string()).default([]),
  architectureSolution: z.string(),
  tradeoffs: z.array(z.string()).default([]),
  blueprintId: z.string().optional(),
  question: z.string().optional(),
  answer: z.string().optional(),
});

export const ConceptItemSchema = z.object({
  id: z.string(),
  term: z.string(),
  category: z.string().default('Core Concept'),
  parentId: z.string().nullable().default(null),
  summary: z.string(),
  internals: z.string().default(''),
  relatedTerms: z.array(z.string()).default([]),
  definition: z.string().optional(),
  explanation: z.string().optional(),
  keyPoints: z.array(z.string()).default([]),
});

export type QaItem = z.infer<typeof QaItemSchema>;
export type ScenarioItem = z.infer<typeof ScenarioItemSchema>;
export type ConceptItem = z.infer<typeof ConceptItemSchema>;
