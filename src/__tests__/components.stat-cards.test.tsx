import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCards } from '@/components/dashboard/stat-cards'

vi.mock('@/data', () => ({
  getDatasetCounts: () => ({
    questionsDb: 500,
    architectureData: 300,
    conceptsDb: 400,
    questionsDeDb: 200,
    pysparkData: 150,
    sparksqlData: 120,
    mssqlData: 130,
    pythonData: 180,
    personalisedQuestions: 50,
    modernConceptsDb: 60,
    modernBlueprintsDb: 25,
    modernStackDb: 80,
    learningPathsDb: 12,
    totalQuestions: 2600,
  }),
}))

describe('StatCards component', () => {
  it('renders without crashing', () => {
    const { container } = render(<StatCards />)
    expect(container).toBeDefined()
    expect(container.firstChild).not.toBeNull()
  })

  it('renders known stat card labels in the DOM', () => {
    render(<StatCards />)
    // These exact strings come from the static STATS array in stat-cards.tsx
    expect(screen.getByText('Core Concepts')).toBeDefined()
    expect(screen.getByText('Interview Q&As')).toBeDefined()
    expect(screen.getByText('Arch Scenarios')).toBeDefined()
    expect(screen.getByText('GCC Firms')).toBeDefined()
    expect(screen.getByText('Spark Engine')).toBeDefined()
    expect(screen.getByText('Coding Sheets')).toBeDefined()
  })

  it('renders 6 navigation links to key pages', () => {
    render(<StatCards />)
    const links = document.querySelectorAll('a[href]')
    const hrefs = Array.from(links).map(l => l.getAttribute('href'))
    expect(hrefs).toContain('/qa-prep')
    expect(hrefs).toContain('/concepts')
    expect(hrefs).toContain('/code-practice')
    expect(hrefs).toContain('/architecture')
    expect(hrefs).toContain('/spark-engine')
    expect(hrefs).toContain('/company-research')
  })
})
