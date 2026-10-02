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
    expect(screen.getAllByText('Log-Based CDC & Event Sourcing')[0]).toBeDefined();
    expect(screen.getAllByText('ACID Open Table Formats')[0]).toBeDefined();
    expect(screen.getAllByText('Apache Spark 4.0 Internals')[0]).toBeDefined();
    expect(screen.getAllByText('Fabric Direct Lake & Memory Caching')[0]).toBeDefined();
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
    const subtopicNode = screen.getAllByText('Log-Based CDC & Event Sourcing')[0];
    fireEvent.click(subtopicNode);

    // Inspector drawer should display trade-offs and practice button
    expect(screen.getByText(/Architectural Trade-Off & Production Rubric/i)).toBeDefined();
    expect(screen.getByText(/Practice Interview Q&As for this Topic/i)).toBeDefined();
  });

  it('toggles architectural data flow stream mode', () => {
    render(<InteractiveMindmap />);
    // FLOW #01 is active by default in flow mode
    expect(screen.getAllByText(/FLOW #01/i).length).toBeGreaterThan(0);

    const flowBtn = screen.getByTitle(/toggle animated architectural data flow/i);
    // Toggle flow mode off
    fireEvent.click(flowBtn);
    expect(screen.queryByText(/FLOW #01/i)).toBeNull();

    // Toggle flow mode back on
    fireEvent.click(flowBtn);
    expect(screen.getAllByText(/FLOW #01/i).length).toBeGreaterThan(0);
  });

  it('provides a Tidy Up button to reset dragged nodes', () => {
    render(<InteractiveMindmap />);
    const tidyBtn = screen.getByTitle(/auto-organize movable nodes/i);
    expect(tidyBtn).toBeDefined();
    fireEvent.click(tidyBtn);
  });

  it('prevents default window scroll when wheel event occurs on canvas', () => {
    const { container } = render(<InteractiveMindmap />);
    const canvasContainer = container.querySelector('.select-none.border');
    expect(canvasContainer).toBeDefined();

    if (canvasContainer) {
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: 50,
        bubbles: true,
        cancelable: true,
      });
      canvasContainer.dispatchEvent(wheelEvent);
      expect(wheelEvent.defaultPrevented).toBe(true);
    }
  });
});

