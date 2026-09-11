import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ScrollProgressBar } from '@/components/layout/scroll-progress-bar'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

describe('ScrollProgressBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a progressbar with appropriate ARIA attributes', () => {
    render(<ScrollProgressBar />)
    const bar = screen.getByRole('progressbar', { name: /Page reading progress/i })
    expect(bar).toBeDefined()
    expect(bar.getAttribute('aria-valuemin')).toBe('0')
    expect(bar.getAttribute('aria-valuemax')).toBe('100')
    expect(bar.getAttribute('aria-valuenow')).toBe('0')
  })

  it('reacts to main-content scroll events and updates progress', async () => {
    // Create a mock #main-content element
    const container = document.createElement('div')
    container.id = 'main-content'
    Object.defineProperty(container, 'scrollHeight', { value: 1000, configurable: true })
    Object.defineProperty(container, 'clientHeight', { value: 500, configurable: true })
    Object.defineProperty(container, 'scrollTop', { value: 250, writable: true, configurable: true })
    document.body.appendChild(container)

    render(<ScrollProgressBar />)

    // Trigger scroll event
    await act(async () => {
      container.dispatchEvent(new Event('scroll'))
    })

    const bar = screen.getByRole('progressbar', { name: /Page reading progress/i })
    // At scrollTop = 250 with total = 500 (1000 - 500), progress is 50%
    expect(bar.getAttribute('aria-valuenow')).toBe('50')

    document.body.removeChild(container)
  })

  it('handles window scroll fallback if main-content has no scroll overflow', async () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true })
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true, configurable: true })

    render(<ScrollProgressBar />)

    await act(async () => {
      window.dispatchEvent(new Event('scroll'))
    })

    const bar = screen.getByRole('progressbar', { name: /Page reading progress/i })
    // At scrollY = 500 with total = 1000, progress is 50%
    expect(bar.getAttribute('aria-valuenow')).toBe('50')
  })
})
