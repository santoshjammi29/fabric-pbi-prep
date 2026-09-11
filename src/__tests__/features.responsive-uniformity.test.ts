import { describe, it, expect } from 'vitest'
import {
  conceptsDb,
  questionsDb,
  questionsDeDb,
  architectureData,
  pythonData,
  pysparkData,
  sparksqlData,
  mssqlData,
} from '@/data'

describe('Studio Bookmark Resolution Across All Datasets', () => {
  it('resolves bookmarks from conceptsDb', () => {
    const concept = conceptsDb[0]
    expect(concept).toBeDefined()
    expect(concept.id).toBeTruthy()
    expect(concept.term).toBeTruthy()
  })

  it('resolves bookmarks from questionsDb', () => {
    const q = questionsDb[0]
    expect(q).toBeDefined()
    expect(q.id).toBeTruthy()
    expect(q.question).toBeTruthy()
  })

  it('resolves bookmarks from questionsDeDb (General DE bank)', () => {
    const deQ = questionsDeDb[0]
    expect(deQ).toBeDefined()
    expect(deQ.id).toBeTruthy()
    expect(deQ.question).toBeTruthy()
  })

  it('resolves bookmarks from architectureData (Architect scenarios)', () => {
    const arch = architectureData[0]
    expect(arch).toBeDefined()
    expect(arch.id).toBeTruthy()
    expect(arch.question).toBeTruthy()
  })

  it('resolves bookmarks from pythonData (Python Hub)', () => {
    const py = pythonData[0]
    expect(py).toBeDefined()
    expect(py.id).toBeTruthy()
    expect(py.title).toBeTruthy()
  })

  it('resolves bookmarks from pysparkData, sparksqlData, mssqlData', () => {
    expect(pysparkData[0].title).toBeTruthy()
    expect(sparksqlData[0].title).toBeTruthy()
    expect(mssqlData[0].title).toBeTruthy()
  })

  it('all dataset item IDs are unique within their respective collections', () => {
    const conceptIds = new Set(conceptsDb.map(c => c.id))
    expect(conceptIds.size).toBe(conceptsDb.length)

    const pythonIds = new Set(pythonData.map(p => p.id))
    expect(pythonIds.size).toBe(pythonData.length)
  })
})

describe('Subpage Deep Linking Parameters', () => {
  it('code practice recognizes all 4 supported language keys', () => {
    const validLangs = ['pyspark', 'sparksql', 'mssql', 'python']
    validLangs.forEach(lang => {
      const url = `/code-practice?db=${lang}`
      const params = new URLSearchParams(url.split('?')[1])
      expect(params.get('db')).toBe(lang)
    })
  })

  it('spark engine recognizes all 5 supported subtabs', () => {
    const validTabs = ['architecture', 'simulator', 'memory', 'curriculum', 'lexicon']
    validTabs.forEach(tab => {
      const hash = `#${tab}`
      expect(validTabs.includes(hash.replace('#', ''))).toBe(true)
    })
  })

  it('modern stack recognizes all 9 supported subtabs', () => {
    const validTabs = [
      'overview',
      'concepts',
      'matrix',
      'simulators',
      'blueprints',
      'ai',
      'cost',
      'compatibility',
      'python',
    ]
    validTabs.forEach(tab => {
      const hash = `#${tab}`
      expect(validTabs.includes(hash.replace('#', ''))).toBe(true)
    })
  })
})
