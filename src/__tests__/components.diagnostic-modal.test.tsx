import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DiagnosticModal } from '@/components/diagnostic/diagnostic-modal'
import { useUserStore } from '@/store/useUserStore'

describe('DiagnosticModal component', () => {
  beforeEach(() => {
    useUserStore.setState({
      experienceTier: 'associate',
      diagnosticScore: null,
    })
  })

  it('renders null when isOpen is false', () => {
    const { container } = render(<DiagnosticModal isOpen={false} onClose={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders assessment questions when isOpen is true', () => {
    render(<DiagnosticModal isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText(/Architect Diagnostic Assessment/i)).toBeDefined()
    expect(screen.getByText(/Question 1 of 10/i)).toBeDefined()
    expect(screen.getByText(/Kimball Dimensional Modeling/i)).toBeDefined()
  })

  it('allows answering questions and shows explanation after selection', () => {
    render(<DiagnosticModal isOpen={true} onClose={vi.fn()} />)
    
    // Question 1: Degenerate Dimension
    const correctOption = screen.getByText(/A dimension key stored in the fact table without a corresponding dimension table/i)
    fireEvent.click(correctOption)

    // Explanation should now be visible
    expect(screen.getByText(/Degenerate dimensions/i)).toBeDefined()
  })

  it('can complete questions and set user tier in Zustand store', () => {
    render(<DiagnosticModal isOpen={true} onClose={vi.fn()} />)

    // Answer all 10 questions
    for (let q = 0; q < 10; q++) {
      const optionButtons = screen.getAllByRole('button').filter(b =>
        ['A', 'B', 'C', 'D'].some(letter => b.textContent?.startsWith(letter))
      )
      expect(optionButtons.length).toBeGreaterThan(0)
      fireEvent.click(optionButtons[0])

      const continueBtn = screen.getByRole('button', { name: q === 9 ? /Finish Assessment/i : /Continue/i })
      fireEvent.click(continueBtn)
    }

    // After finishing, completion screen should be visible
    expect(screen.getByText(/Assessment Completed/i)).toBeDefined()
    expect(screen.getByText(/Diagnostic Score:/i)).toBeDefined()
    expect(useUserStore.getState().diagnosticScore).not.toBeNull()
  })
})
