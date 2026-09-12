import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

let mockPathname = '/'
let mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('Breadcrumbs Component', () => {
  beforeEach(() => {
    mockPathname = '/'
    mockSearchParams = new URLSearchParams()
  })

  it('renders nothing on root page without query parameters', () => {
    mockPathname = '/'
    mockSearchParams = new URLSearchParams()
    const { container } = render(<Breadcrumbs />)
    expect(container.firstChild).toBeNull()
  })

  it('renders tier breadcrumb on root page with ?tier=4', () => {
    mockPathname = '/'
    mockSearchParams = new URLSearchParams('tier=4')
    render(<Breadcrumbs />)
    const nav = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(nav).toBeDefined()
    expect(screen.getByText(/Staff Architect \(Tier\)/i)).toBeDefined()
  })

  it('renders navigation trail for secondary page /learning-paths', () => {
    mockPathname = '/learning-paths'
    mockSearchParams = new URLSearchParams()
    render(<Breadcrumbs />)
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeDefined()
    expect(screen.getByText('Learning Paths')).toBeDefined()
  })

  it('renders specific path card title when ?id= or ?card= is present', () => {
    mockPathname = '/learning-paths'
    mockSearchParams = new URLSearchParams('card=fabric-dp600')
    render(<Breadcrumbs />)
    expect(screen.getByText(/DP-600/i)).toBeDefined()
  })

  it('renders tab title on spark engine hub when ?tab=simulator', () => {
    mockPathname = '/spark-engine'
    mockSearchParams = new URLSearchParams('tab=simulator')
    render(<Breadcrumbs />)
    expect(screen.getByText('Spark Engine Hub')).toBeDefined()
    expect(screen.getByText('DAG & Shuffle Simulator')).toBeDefined()
  })

  it('renders category and difficulty on architecture hub', () => {
    mockPathname = '/architecture'
    mockSearchParams = new URLSearchParams('category=Real-Time%20Streaming&difficulty=ARCHITECT')
    render(<Breadcrumbs />)
    expect(screen.getByText('Architecture Hub')).toBeDefined()
    expect(screen.getByText('Real-Time Streaming')).toBeDefined()
    expect(screen.getByText('ARCHITECT Level')).toBeDefined()
  })

  it('marks the active last breadcrumb with aria-current="page"', () => {
    mockPathname = '/architecture'
    mockSearchParams = new URLSearchParams('difficulty=HARD')
    render(<Breadcrumbs />)
    const activeEl = screen.getByText('HARD Level')
    expect(activeEl.getAttribute('aria-current')).toBe('page')
  })
})
