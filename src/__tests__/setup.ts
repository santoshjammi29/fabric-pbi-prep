import '@testing-library/jest-dom'
import { vi } from 'vitest'

// ── Global Next.js App Router Mock ──────────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// ── IntersectionObserver — must be a class constructor for framer-motion ──
class MockIntersectionObserver {
  observe = () => {}
  unobserve = () => {}
  disconnect = () => {}
  takeRecords = () => []
  root = null
  rootMargin = ''
  thresholds: number[] = []
  constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
}
Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
})

// ── ResizeObserver ──────────────────────────────────────────────────────
class MockResizeObserver {
  observe = () => {}
  unobserve = () => {}
  disconnect = () => {}
  constructor(_cb: ResizeObserverCallback) {}
}
Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
})

// ── matchMedia (used by next-themes + media queries) ───────────────────
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})
