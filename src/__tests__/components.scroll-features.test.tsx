import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ScrollProgressBar } from '@/components/layout/scroll-progress-bar'
import { ScrollBackToTop } from '@/components/layout/scroll-back-to-top'

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

  it('reacts to window scroll events and updates progress', async () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 500, configurable: true })
    Object.defineProperty(window, 'scrollY', { value: 250, writable: true, configurable: true })

    render(<ScrollProgressBar />)

    // Trigger scroll event
    await act(async () => {
      window.dispatchEvent(new Event('scroll'))
    })

    const bar = screen.getByRole('progressbar', { name: /Page reading progress/i })
    // At scrollY = 250 with total = 500 (1000 - 500), progress is 50%
    expect(bar.getAttribute('aria-valuenow')).toBe('50')
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

describe('ScrollBackToTop Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.scrollY = 0
    if (document.documentElement) {
      document.documentElement.scrollTop = 0
    }
  })

  it('renders a button with accessible label and is initially hidden', () => {
    render(<ScrollBackToTop />)
    const btn = screen.getByRole('button', { name: /Scroll back to top/i })
    expect(btn).toBeDefined()
    expect(btn.className).toContain('opacity-0')
    expect(btn.className).toContain('pointer-events-none')
  })

  it('becomes visible when window scrolls past threshold', async () => {
    Object.defineProperty(window, 'scrollY', { value: 350, writable: true, configurable: true })

    render(<ScrollBackToTop />)

    await act(async () => {
      window.dispatchEvent(new Event('scroll'))
    })

    const btn = screen.getByRole('button', { name: /Scroll back to top/i })
    expect(btn.className).toContain('opacity-100')
    expect(btn.className).toContain('pointer-events-auto')
  })

  it('triggers smooth scroll to top when clicked', async () => {
    const scrollToMock = vi.fn()
    window.scrollTo = scrollToMock

    render(<ScrollBackToTop />)
    const btn = screen.getByRole('button', { name: /Scroll back to top/i })

    await act(async () => {
      btn.click()
    })

    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })
})

