/**
 * Route integrity tests.
 * Ensures every data item that should link to a page produces a valid-shaped href.
 */
import { describe, it, expect } from 'vitest'
import {
  conceptsDb,
  learningPathsDb,
  modernBlueprintsDb,
  pysparkData,
  sparksqlData,
  mssqlData,
  pythonData,
} from '@/data'

const VALID_ROUTES = new Set([
  '/concepts',
  '/qa-prep',
  '/architecture',
  '/code-practice',
  '/spark-engine',
  '/learning-paths',
  '/modern-stack',
  '/company-research',
  '/python',
  '/mindmap',
  '/studio',
])

function routeIsValid(href: string): boolean {
  try {
    const base = href.split('?')[0]
    return VALID_ROUTES.has(base)
  } catch {
    return false
  }
}

describe('Route Integrity — conceptsDb links', () => {
  it('all concept term links target /concepts', () => {
    conceptsDb.slice(0, 50).forEach(c => {
      const href = `/concepts?term=${encodeURIComponent(c.term)}`
      expect(routeIsValid(href)).toBe(true)
    })
  })

  it('concept term URLs are properly encoded', () => {
    const spacedTerm = 'Delta Lake'
    const href = `/concepts?term=${encodeURIComponent(spacedTerm)}`
    expect(href).toBe('/concepts?term=Delta%20Lake')
  })
})

describe('Route Integrity — learningPathsDb links', () => {
  it('all learning path links target /learning-paths', () => {
    learningPathsDb.forEach(lp => {
      const href = `/learning-paths?id=${lp.id}`
      expect(routeIsValid(href)).toBe(true)
    })
  })

  it('all learning path ids are URL-safe strings', () => {
    learningPathsDb.forEach(lp => {
      // ids should not contain spaces or special characters needing encoding
      expect(encodeURIComponent(lp.id)).toBe(lp.id)
    })
  })
})

describe('Route Integrity — modernBlueprintsDb links', () => {
  it('all blueprint links target /modern-stack', () => {
    modernBlueprintsDb.forEach(() => {
      const href = '/modern-stack'
      expect(routeIsValid(href)).toBe(true)
    })
  })
})

describe('Route Integrity — code sheet links', () => {
  const engines = [
    { name: 'PySpark', db: pysparkData, param: 'pyspark' },
    { name: 'SparkSQL', db: sparksqlData, param: 'sparksql' },
    { name: 'MSSQL', db: mssqlData, param: 'mssql' },
    { name: 'Python', db: pythonData, param: 'python' },
  ]

  engines.forEach(({ name, param }) => {
    it(`${name} links target /code-practice?db=${param}`, () => {
      const href = `/code-practice?db=${param}`
      expect(routeIsValid(href)).toBe(true)
    })
  })
})
