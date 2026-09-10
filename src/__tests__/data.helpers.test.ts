import { describe, it, expect } from 'vitest'
import {
  normalizeDifficulty,
  getStandardizedDomain,
  getUnifiedQuestions,
  getDatasetCounts,
} from '@/data'

/* ══════════════════════════════════════════════
   normalizeDifficulty
══════════════════════════════════════════════ */
describe('normalizeDifficulty()', () => {
  it('returns MEDIUM for undefined input', () => {
    expect(normalizeDifficulty(undefined)).toBe('MEDIUM')
  })
  it('returns MEDIUM for empty string', () => {
    expect(normalizeDifficulty('')).toBe('MEDIUM')
  })
  it('maps "easy" (case-insensitive) → EASY', () => {
    expect(normalizeDifficulty('easy')).toBe('EASY')
    expect(normalizeDifficulty('EASY')).toBe('EASY')
    expect(normalizeDifficulty('Easy')).toBe('EASY')
  })
  it('maps "BEGINNER" → EASY', () => {
    expect(normalizeDifficulty('BEGINNER')).toBe('EASY')
  })
  it('maps "medium" → MEDIUM', () => {
    expect(normalizeDifficulty('medium')).toBe('MEDIUM')
  })
  it('maps "INTERMEDIATE" → MEDIUM', () => {
    expect(normalizeDifficulty('INTERMEDIATE')).toBe('MEDIUM')
  })
  it('maps "hard" → HARD', () => {
    expect(normalizeDifficulty('hard')).toBe('HARD')
  })
  it('maps "ADVANCED" → HARD', () => {
    expect(normalizeDifficulty('ADVANCED')).toBe('HARD')
  })
  it('maps "architect" → ARCHITECT', () => {
    expect(normalizeDifficulty('architect')).toBe('ARCHITECT')
  })
  it('maps "EXPERT" → ARCHITECT', () => {
    expect(normalizeDifficulty('EXPERT')).toBe('ARCHITECT')
  })
  it('returns MEDIUM for 0 (falsy numeric — treated as missing)', () => {
    // The implementation uses `if (!diff) return MEDIUM` — 0 is falsy, intentional design.
    expect(normalizeDifficulty(0)).toBe('MEDIUM')
  })
  it('maps numeric 1 → EASY', () => {
    expect(normalizeDifficulty(1)).toBe('EASY')
  })
  it('maps numeric 3 → MEDIUM', () => {
    expect(normalizeDifficulty(3)).toBe('MEDIUM')
  })
  it('maps numeric 6 → HARD', () => {
    expect(normalizeDifficulty(6)).toBe('HARD')
  })
  it('maps numeric 9 → ARCHITECT', () => {
    expect(normalizeDifficulty(9)).toBe('ARCHITECT')
  })
  it('maps unknown string → MEDIUM fallback', () => {
    expect(normalizeDifficulty('???')).toBe('MEDIUM')
  })
})

/* ══════════════════════════════════════════════
   getStandardizedDomain()
══════════════════════════════════════════════ */
describe('getStandardizedDomain()', () => {
  it('returns "General Data Engineering" for empty object', () => {
    expect(getStandardizedDomain({})).toBe('General Data Engineering')
  })

  it('returns "Compute & Orchestration" for SPARK category', () => {
    expect(getStandardizedDomain({ category: 'Apache Spark' })).toBe('Compute & Orchestration')
  })

  it('returns "Compute & Orchestration" for sourceDb=pyspark', () => {
    expect(getStandardizedDomain({ sourceDb: 'pyspark' })).toBe('Compute & Orchestration')
  })

  it('returns "Databases, SQL & Storage" for SQL category', () => {
    expect(getStandardizedDomain({ category: 'SQL Joins' })).toBe('Databases, SQL & Storage')
  })

  it('returns "Databases, SQL & Storage" for sourceDb=mssql', () => {
    expect(getStandardizedDomain({ sourceDb: 'mssql' })).toBe('Databases, SQL & Storage')
  })

  it('returns "Data Pipelines & Ingestion" for ADF category', () => {
    expect(getStandardizedDomain({ category: 'ADF Pipelines' })).toBe('Data Pipelines & Ingestion')
  })

  it('returns "Data Pipelines & Ingestion" for ETL category', () => {
    expect(getStandardizedDomain({ category: 'ETL Design' })).toBe('Data Pipelines & Ingestion')
  })

  it('returns "Data Lakehouse & Architecture" for DELTA category', () => {
    expect(getStandardizedDomain({ category: 'Delta Lake' })).toBe('Data Lakehouse & Architecture')
  })

  it('returns "Data Governance & Quality" for GOVERNANCE category', () => {
    expect(getStandardizedDomain({ category: 'Data Governance' })).toBe('Data Governance & Quality')
  })

  it('returns "Analytics, BI & AI" for FABRIC category', () => {
    expect(getStandardizedDomain({ category: 'Fabric Analytics' })).toBe('Analytics, BI & AI')
  })

  it('returns "Analytics, BI & AI" for POWER BI category', () => {
    expect(getStandardizedDomain({ category: 'Power BI Reports' })).toBe('Analytics, BI & AI')
  })

  it('returns "FinOps & Performance Optimization" for COST category', () => {
    expect(getStandardizedDomain({ category: 'Cost Optimization' })).toBe('FinOps & Performance Optimization')
  })

  it('handles categoryLabel over category', () => {
    expect(getStandardizedDomain({ categoryLabel: 'Spark Jobs', category: 'Other' }))
      .toBe('Compute & Orchestration')
  })
})

/* ══════════════════════════════════════════════
   getUnifiedQuestions()
══════════════════════════════════════════════ */
describe('getUnifiedQuestions()', () => {
  const unified = getUnifiedQuestions()

  it('returns a non-empty array', () => {
    expect(unified.length).toBeGreaterThan(0)
  })

  it('every item has a question field', () => {
    const bad = unified.filter(q => typeof q.question !== 'string' || q.question.trim() === '')
    expect(bad.length).toBe(0)
  })

  it('every item has a valid difficulty value', () => {
    const valid = new Set(['EASY', 'MEDIUM', 'HARD', 'ARCHITECT'])
    const bad = unified.filter(q => !valid.has(q.difficulty))
    expect(bad.length).toBe(0)
  })

  it('every item has a sourceDb label', () => {
    const bad = unified.filter(q => typeof q.sourceDb !== 'string' || q.sourceDb.trim() === '')
    expect(bad.length).toBe(0)
  })

  it('is sorted ascending by difficulty weight (EASY first)', () => {
    const weights: Record<string, number> = { EASY: 1, MEDIUM: 2, HARD: 3, ARCHITECT: 4 }
    for (let i = 1; i < unified.length; i++) {
      expect(weights[unified[i].difficulty]).toBeGreaterThanOrEqual(weights[unified[i - 1].difficulty])
    }
  })

  it('contains items from multiple source databases', () => {
    const sources = new Set(unified.map(q => q.sourceDb))
    expect(sources.size).toBeGreaterThanOrEqual(3)
  })
})

/* ══════════════════════════════════════════════
   getDatasetCounts()
══════════════════════════════════════════════ */
describe('getDatasetCounts()', () => {
  const counts = getDatasetCounts()

  it('returns all expected keys', () => {
    const keys = [
      'questionsDb', 'architectureData', 'conceptsDb', 'questionsDeDb',
      'pysparkData', 'sparksqlData', 'mssqlData', 'pythonData',
      'personalisedQuestions', 'modernConceptsDb', 'modernBlueprintsDb',
      'modernStackDb', 'learningPathsDb', 'totalQuestions',
    ]
    keys.forEach(key => {
      expect(counts).toHaveProperty(key)
    })
  })

  it('all counts are positive integers', () => {
    Object.values(counts).forEach(val => {
      expect(typeof val).toBe('number')
      expect(val).toBeGreaterThan(0)
    })
  })

  it('totalQuestions is at least the sum of major Q&A counts', () => {
    const minSum = counts.questionsDb + counts.questionsDeDb
    expect(counts.totalQuestions).toBeGreaterThanOrEqual(minSum)
  })
})
