import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DecisionLedger } from '@/components/learning-paths/decision-ledger'

describe('DecisionLedger component', () => {
  it('renders correctly with default decision scenario', () => {
    render(<DecisionLedger />)
    expect(screen.getByText(/Interactive Architecture Decision Ledger \(ADR\)/i)).toBeDefined()
    expect(screen.getByText(/System Design Decision Points/i)).toBeDefined()
  })

  it('allows switching between decision scenarios using scenario buttons', () => {
    render(<DecisionLedger />)
    const scenario2Btn = screen.getByRole('button', { name: /Scenario 2/i })
    fireEvent.click(scenario2Btn)
    expect(screen.getByText(/High-Throughput Streaming & Ingestion Architecture/i)).toBeDefined()
  })

  it('allows selecting candidate options and highlights choice', () => {
    render(<DecisionLedger />)
    const icebergOption = screen.getByText(/Apache Iceberg/i)
    fireEvent.click(icebergOption)

    // Option should now show Selected badge
    const selectedBadges = screen.getAllByText(/Selected/i)
    expect(selectedBadges.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Technical Justification Summary and ADR markdown copy button', () => {
    render(<DecisionLedger />)
    expect(screen.getByText(/Generated Architecture Decision Record \(ADR\)/i)).toBeDefined()
    expect(screen.getByText(/Copy ADR Markdown/i)).toBeDefined()
  })
})
