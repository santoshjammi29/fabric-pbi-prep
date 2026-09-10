import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RollingTicker } from '@/components/dashboard/rolling-ticker'

// Mock next/link since we're in jsdom
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock all data imports to return minimal valid data (fast tests, no JSON loading)
vi.mock('@/data', () => ({
  conceptsDb: [
    { term: 'Delta Lake', category: 'Lakehouse', definition: 'Open format storage layer' },
    { term: 'Medallion Architecture', category: 'Architecture', definition: 'Multi-layer design pattern' },
    { term: 'Apache Spark', category: 'Compute', definition: 'Distributed compute engine' },
  ],
  questionsDb: [
    { id: 'q1', question: 'What is a Lakehouse?', answer: 'Combines data lake and warehouse', category: 'Architecture', difficulty: 'MEDIUM' },
    { id: 'q2', question: 'Explain Delta Lake ACID guarantees', answer: 'Delta provides ACID via transaction log', category: 'Delta', difficulty: 'HARD' },
  ],
  questionsDeDb: [
    { id: 'de1', question: 'What is idempotency in pipelines?', answer: 'Safe to run multiple times', category: 'Pipelines', difficulty: 'MEDIUM' },
  ],
  architectureData: [
    { id: 'a1', question: 'Design a medallion architecture', category: 'Architecture' },
  ],
  pysparkData: [
    { id: 'py1', title: 'DataFrame groupBy', code: 'df.groupBy("col").count()', category: 'PySpark', level: 'MEDIUM' },
  ],
  sparksqlData: [
    { id: 'ss1', title: 'Window Functions', code: 'SELECT RANK() OVER (...) FROM t', category: 'SparkSQL', level: 'HARD' },
  ],
  mssqlData: [
    { id: 'ms1', title: 'CTE Basics', code: 'WITH cte AS (...) SELECT * FROM cte', category: 'SQL', level: 'EASY' },
  ],
  pythonData: [
    { id: 'pt1', title: 'List Comprehension', code: '[x for x in range(10)]', category: 'Python', level: 'EASY' },
  ],
  learningPathsDb: [
    { id: 'lp1', title: 'Fabric DP-600', weeks: 8, badge: '🏆', difficulty: 'HARD', phases: [{ title: 'Phase 1', weeks: 4, topics: [] }], prerequisites: '', description: '', progress: 0, skills: [], handsOn: { projects: [], tools: [] }, capstone: '', examQsCount: 0, icon: '', slug: 'fabric-dp600' },
  ],
  modernBlueprintsDb: [
    { id: 'bp1', title: 'Streaming Lakehouse', category: 'Streaming', tags: [] },
  ],
  modernConceptsDb: [
    { id: 'mc1', title: 'CAP Theorem', subdomain: 'dist-sys' },
  ],
}))

describe('RollingTicker component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<RollingTicker />)
    // The aria-label region exists
    const ticker = document.querySelector('[aria-label="Topics rolling ticker"]')
    expect(ticker).not.toBeNull()
  })

  it('renders topic links from concepts database', () => {
    render(<RollingTicker />)
    // "Delta Lake" should appear as link text
    const links = screen.getAllByRole('link', { name: /Delta Lake/i })
    expect(links.length).toBeGreaterThanOrEqual(1)
  })

  it('renders learning path topics', () => {
    render(<RollingTicker />)
    const links = screen.getAllByRole('link', { name: /Fabric DP-600/i })
    expect(links.length).toBeGreaterThanOrEqual(1)
  })

  it('at least one "Delta Lake" link points to /concepts', () => {
    render(<RollingTicker />)
    const deltaLinks = screen.getAllByRole('link', { name: /Delta Lake/i })
    // Tripled array — check that at least one href targets concepts
    const conceptLink = deltaLinks.find(l => l.getAttribute('href')?.startsWith('/concepts?term='))
    expect(conceptLink).toBeDefined()
  })

  it('learning path links include the path id', () => {
    render(<RollingTicker />)
    const pathLinks = screen.getAllByRole('link', { name: /Fabric DP-600/i })
    expect(pathLinks[0].getAttribute('href')).toMatch(/lp1/)
  })

  it('renders multiple items (more than 3)', () => {
    render(<RollingTicker />)
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(3)
  })

  it('renders left and right fade mask elements', () => {
    const { container } = render(<RollingTicker />)
    // Two overlay divs for edge fading (pointer-events-none)
    const overlays = container.querySelectorAll('[style*="linear-gradient"]')
    expect(overlays.length).toBeGreaterThanOrEqual(2)
  })
})
