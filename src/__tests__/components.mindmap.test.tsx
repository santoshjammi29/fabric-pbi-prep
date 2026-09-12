import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InteractiveMindmap } from '@/components/mindmap/interactive-mindmap';
import { MINDMAP_DOMAINS } from '@/data/mindmap-data';

describe('InteractiveMindmap Component', () => {
  it('renders all 7 architectural domains', () => {
    render(<InteractiveMindmap />);
    expect(screen.getByText('Modern Data Architecture')).toBeDefined();

    MINDMAP_DOMAINS.forEach((domain) => {
      expect(screen.getAllByText(domain.title).length).toBeGreaterThan(0);
    });
  });

  it('renders subtopics for visible branches', () => {
    render(<InteractiveMindmap />);
    // Check known subtopics from different domains
    expect(screen.getByText('Log-Based CDC & Event Sourcing')).toBeDefined();
    expect(screen.getByText('ACID Open Table Formats')).toBeDefined();
    expect(screen.getByText('Apache Spark 4.0 Internals')).toBeDefined();
    expect(screen.getByText('Fabric Direct Lake & Memory Caching')).toBeDefined();
  });

  it('filters nodes when searching', () => {
    render(<InteractiveMindmap />);
    const searchInput = screen.getByPlaceholderText(/search concepts/i);
    fireEvent.change(searchInput, { target: { value: 'Kafka' } });

    // Should indicate match
    expect(screen.getByText(/matches/i)).toBeDefined();
  });

  it('opens detail inspector drawer when subtopic is clicked', () => {
    render(<InteractiveMindmap />);
    const subtopicNode = screen.getByText('Log-Based CDC & Event Sourcing');
    fireEvent.click(subtopicNode);

    // Inspector drawer should display trade-offs and practice button
    expect(screen.getByText(/Architectural Trade-Off & Production Rubric/i)).toBeDefined();
    expect(screen.getByText(/Practice Interview Q&As for this Topic/i)).toBeDefined();
  });
});
