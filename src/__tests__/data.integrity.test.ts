import { describe, it, expect } from 'vitest'
import {
  conceptsDb,
  questionsDb,
  questionsDeDb,
  architectureData,
  pysparkData,
  sparksqlData,
  mssqlData,
  pythonData,
  learningPathsDb,
  modernBlueprintsDb,
  modernConceptsDb,
  modernStackDb,
  personalisedQuestions,
} from '@/data'

/* ─── Helper ─── */
const hasString = (val: unknown) => typeof val === 'string' && val.trim().length > 0

describe('Data Integrity — conceptsDb', () => {
  it('has at least 100 entries', () => {
    expect(conceptsDb.length).toBeGreaterThanOrEqual(100)
  })
  it('every entry has a non-empty term', () => {
    const bad = conceptsDb.filter(c => !hasString(c.term))
    expect(bad.length).toBe(0)
  })
  it('every entry has a non-empty definition', () => {
    const bad = conceptsDb.filter(c => !hasString(c.definition))
    expect(bad.length).toBe(0)
  })
  it('every entry has a category', () => {
    const bad = conceptsDb.filter(c => !hasString(c.category))
    expect(bad.length).toBe(0)
  })
  it('no duplicate terms', () => {
    const terms = conceptsDb.map(c => c.term.toLowerCase().trim())
    const unique = new Set(terms)
    expect(unique.size).toBe(terms.length)
  })
  it('has ARCHITECT-level concepts in every category', () => {
    const categories = Array.from(new Set(conceptsDb.map(c => c.category)))
    expect(categories.length).toBeGreaterThanOrEqual(7)
    categories.forEach(cat => {
      const architectItems = conceptsDb.filter(c => c.category === cat && c.difficulty === 'ARCHITECT')
      expect(architectItems.length, `Expected ARCHITECT concepts for category ${cat}`).toBeGreaterThanOrEqual(1)
    })
  })
  it('every category has representations across all 4 difficulty levels', () => {
    const categories = Array.from(new Set(conceptsDb.map(c => c.category)))
    const levels = ['EASY', 'MEDIUM', 'HARD', 'ARCHITECT']
    categories.forEach(cat => {
      levels.forEach(lvl => {
        const count = conceptsDb.filter(c => c.category === cat && c.difficulty === lvl).length
        expect(count, `Expected ${lvl} concepts for category ${cat}`).toBeGreaterThanOrEqual(1)
      })
    })
  })
})

describe('Data Integrity — questionsDb (Fabric & PBI)', () => {
  it('has at least 200 entries', () => {
    expect(questionsDb.length).toBeGreaterThanOrEqual(200)
  })
  it('every entry has a non-empty question', () => {
    const bad = questionsDb.filter(q => !hasString(q.question))
    expect(bad.length).toBe(0)
  })
  it('every entry has a non-empty answer', () => {
    const bad = questionsDb.filter(q => !hasString(q.answer))
    expect(bad.length).toBe(0)
  })
  it('every entry has a unique id', () => {
    const ids = questionsDb.map(q => q.id).filter(Boolean)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })
})

describe('Data Integrity — questionsDeDb (General DE)', () => {
  it('has at least 100 entries', () => {
    expect(questionsDeDb.length).toBeGreaterThanOrEqual(100)
  })
  it('every entry has question and answer', () => {
    const bad = questionsDeDb.filter(q => !hasString(q.question) || !hasString(q.answer))
    expect(bad.length).toBe(0)
  })
})

describe('Data Integrity — architectureData', () => {
  it('has at least 100 entries', () => {
    expect(architectureData.length).toBeGreaterThanOrEqual(100)
  })
  it('every entry has a question field', () => {
    const bad = architectureData.filter(a => !hasString(a.question))
    expect(bad.length).toBe(0)
  })
})

describe('Data Integrity — Code Sheets (PySpark / SparkSQL / MSSQL / Python)', () => {
  const sheets = [
    { name: 'pysparkData', db: pysparkData },
    { name: 'sparksqlData', db: sparksqlData },
    { name: 'mssqlData', db: mssqlData },
    { name: 'pythonData', db: pythonData },
  ]

  sheets.forEach(({ name, db }) => {
    describe(name, () => {
      it('has at least 10 entries', () => {
        expect(db.length).toBeGreaterThanOrEqual(10)
      })
      it('every entry has a non-empty title', () => {
        const bad = db.filter(item => !hasString(item.title))
        expect(bad.length).toBe(0)
      })
      it('every entry has a non-empty code snippet', () => {
        const bad = db.filter(item => !hasString(item.code))
        expect(bad.length).toBe(0)
      })
      it('every entry has a unique id', () => {
        const ids = db.map(item => item.id).filter(Boolean)
        const unique = new Set(ids)
        expect(unique.size).toBe(ids.length)
      })
    })
  })
})

describe('Data Integrity — learningPathsDb', () => {
  it('has at least 5 paths', () => {
    expect(learningPathsDb.length).toBeGreaterThanOrEqual(5)
  })
  it('every path has id, title, weeks', () => {
    learningPathsDb.forEach(lp => {
      expect(hasString(lp.id)).toBe(true)
      expect(hasString(lp.title)).toBe(true)
      expect(typeof lp.weeks).toBe('number')
      expect(lp.weeks).toBeGreaterThan(0)
    })
  })
  it('every path has at least one phase', () => {
    learningPathsDb.forEach(lp => {
      expect(Array.isArray(lp.phases)).toBe(true)
      expect(lp.phases.length).toBeGreaterThanOrEqual(1)
    })
  })
  it('no duplicate path ids', () => {
    const ids = learningPathsDb.map(lp => lp.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })
})

describe('Data Integrity — modernBlueprintsDb', () => {
  it('has at least 5 blueprints', () => {
    expect(modernBlueprintsDb.length).toBeGreaterThanOrEqual(5)
  })
  it('every blueprint has id and title', () => {
    const bad = modernBlueprintsDb.filter(b => !hasString(b.id) || !hasString(b.title))
    expect(bad.length).toBe(0)
  })
})

describe('Data Integrity — modernConceptsDb', () => {
  it('has at least 10 concepts', () => {
    expect(modernConceptsDb.length).toBeGreaterThanOrEqual(10)
  })
  it('every modern concept has a title', () => {
    const bad = modernConceptsDb.filter(c => !hasString(c.title))
    expect(bad.length).toBe(0)
  })
})

describe('Data Integrity — modernStackDb (Q&A)', () => {
  it('has at least 1 entry', () => {
    expect(modernStackDb.length).toBeGreaterThanOrEqual(1)
  })
  it('every entry has question and answer', () => {
    const bad = modernStackDb.filter(q => !hasString(q.question) || !hasString(q.answer))
    expect(bad.length).toBe(0)
  })
})

describe('Data Integrity — personalisedQuestions', () => {
  it('has at least 1 entry', () => {
    expect(personalisedQuestions.length).toBeGreaterThanOrEqual(1)
  })
  it('every entry has question and answer', () => {
    const bad = personalisedQuestions.filter(q => !hasString(q.question) || !hasString(q.answer))
    expect(bad.length).toBe(0)
  })
})
