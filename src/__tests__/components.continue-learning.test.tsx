import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContinueLearning } from '@/components/dashboard/continue-learning';

describe('ContinueLearning component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', () => {
    const { container } = render(<ContinueLearning />);
    expect(container).toBeDefined();
    expect(container.firstChild).not.toBeNull();
  });

  it('renders Resume Learning button pointing to the active topic', () => {
    render(<ContinueLearning />);
    const resumeLink = screen.getByRole('link', { name: /Resume Learning/i });
    expect(resumeLink).toBeDefined();
    expect(resumeLink.getAttribute('href')).toContain('/code-practice');
  });

  it('adapts default starting topic to beginner tier when configured', () => {
    localStorage.setItem('dataprep_experience_tier', 'beginner');
    render(<ContinueLearning />);
    const resumeLink = screen.getByRole('link', { name: /Resume Learning/i });
    expect(resumeLink.getAttribute('href')).toContain('/concepts');
  });

  it('displays recorded last topic when present in localStorage', () => {
    localStorage.setItem(
      'dataprep_last_topic',
      JSON.stringify({
        title: 'Spark Shuffle & Map-Side Join Mechanics',
        href: '/spark-engine#architecture',
        category: 'Spark Engine Hub',
        progress: 75,
      })
    );

    render(<ContinueLearning />);
    expect(screen.getByText('Spark Shuffle & Map-Side Join Mechanics')).toBeDefined();
    expect(screen.getByText('75%')).toBeDefined();

    const resumeLink = screen.getByRole('link', { name: /Resume Learning/i });
    expect(resumeLink.getAttribute('href')).toBe('/spark-engine#architecture');
  });
});
