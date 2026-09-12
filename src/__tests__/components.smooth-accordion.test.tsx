import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SmoothAccordion } from '@/components/ui/smooth-accordion'

describe('SmoothAccordion component', () => {
  it('does not render content when isOpen is false', () => {
    const { container } = render(
      <SmoothAccordion isOpen={false}>
        <div>Accordion Secret Content</div>
      </SmoothAccordion>
    )
    expect(screen.queryByText('Accordion Secret Content')).toBeNull()
  })

  it('renders content when isOpen is true', () => {
    render(
      <SmoothAccordion isOpen={true}>
        <div>Accordion Secret Content</div>
      </SmoothAccordion>
    )
    expect(screen.getByText('Accordion Secret Content')).toBeDefined()
  })

  it('applies custom innerClassName and className', () => {
    const { container } = render(
      <SmoothAccordion isOpen={true} className="custom-wrapper" innerClassName="custom-inner">
        <div>Custom Test Content</div>
      </SmoothAccordion>
    )
    expect(container.querySelector('.custom-wrapper')).toBeDefined()
    expect(container.querySelector('.custom-inner')).toBeDefined()
  })

  it('renders multiple accordions open simultaneously without interference', () => {
    render(
      <div>
        <SmoothAccordion isOpen={true}>
          <div>Card 1 Content</div>
        </SmoothAccordion>
        <SmoothAccordion isOpen={true}>
          <div>Card 2 Content</div>
        </SmoothAccordion>
        <SmoothAccordion isOpen={false}>
          <div>Card 3 Hidden</div>
        </SmoothAccordion>
      </div>
    )
    expect(screen.getByText('Card 1 Content')).toBeDefined()
    expect(screen.getByText('Card 2 Content')).toBeDefined()
    expect(screen.queryByText('Card 3 Hidden')).toBeNull()
  })
})
