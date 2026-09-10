import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn() utility', () => {
  it('returns an empty string with no arguments', () => {
    expect(cn()).toBe('')
  })

  it('joins class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('ignores falsy values', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b')
  })

  it('deduplicates conflicting Tailwind classes (last wins)', () => {
    // tailwind-merge should keep px-4 over px-2
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles conditional object syntax', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500')
  })

  it('handles array syntax', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c')
  })

  it('merges responsive variants correctly', () => {
    expect(cn('sm:p-2', 'sm:p-4')).toBe('sm:p-4')
  })

  it('preserves non-conflicting classes', () => {
    const result = cn('flex', 'items-center', 'gap-4')
    expect(result).toBe('flex items-center gap-4')
  })
})
