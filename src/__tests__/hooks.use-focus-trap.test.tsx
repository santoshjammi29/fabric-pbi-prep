import React, { useRef } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useFocusTrap } from '@/hooks/use-focus-trap'

function TrapComponent({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  useFocusTrap(containerRef, isOpen, onClose)

  if (!isOpen) return null

  return (
    <div ref={containerRef} data-testid="trap-container">
      <button data-testid="btn-1">First Button</button>
      <button data-testid="btn-2">Second Button</button>
    </div>
  )
}

describe('useFocusTrap hook', () => {
  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn()
    render(<TrapComponent isOpen={true} onClose={handleClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('cycles focus within modal on Tab and Shift+Tab', () => {
    const handleClose = vi.fn()
    render(<TrapComponent isOpen={true} onClose={handleClose} />)

    const btn1 = screen.getByTestId('btn-1')
    const btn2 = screen.getByTestId('btn-2')

    // Initial focus should be on first focusable element
    expect(document.activeElement).toBe(btn1)

    // Tab from btn2 should wrap back to btn1
    btn2.focus()
    expect(document.activeElement).toBe(btn2)
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false })
    expect(document.activeElement).toBe(btn1)

    // Shift+Tab from btn1 should wrap to btn2
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(btn2)
  })
})
