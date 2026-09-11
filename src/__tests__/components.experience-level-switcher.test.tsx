import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExperienceLevelSwitcher } from '@/components/dashboard/experience-level-switcher';

describe('ExperienceLevelSwitcher component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', () => {
    const { container } = render(<ExperienceLevelSwitcher />);
    expect(container).toBeDefined();
    expect(container.firstChild).not.toBeNull();
  });

  it('renders all 4 experience tiers buttons', () => {
    render(<ExperienceLevelSwitcher />);
    expect(screen.getByText('Beginner')).toBeDefined();
    expect(screen.getByText('Associate')).toBeDefined();
    expect(screen.getByText('Senior')).toBeDefined();
    expect(screen.getByText('Staff Architect')).toBeDefined();
  });

  it('switches active tier and updates description and localStorage on click', () => {
    render(<ExperienceLevelSwitcher />);
    const seniorBtn = screen.getByText('Senior');
    fireEvent.click(seniorBtn);

    expect(localStorage.getItem('dataprep_experience_tier')).toBe('senior');
    expect(screen.getByText(/Spark 4.0 Catalyst & Tungsten internals/i)).toBeDefined();
  });

  it('provides a direct path launcher for the selected tier', () => {
    render(<ExperienceLevelSwitcher />);
    const beginnerBtn = screen.getByText('Beginner');
    fireEvent.click(beginnerBtn);

    const launchLink = screen.getByRole('link', { name: /Launch Beginner Path/i });
    expect(launchLink.getAttribute('href')).toBe('/concepts?term=Lakehouse');
  });
});
