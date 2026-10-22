import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '@/components/layout/sidebar';
import { CommandPalette } from '@/components/command-palette';
import { conceptsDb } from '@/data';
import fs from 'fs';
import path from 'path';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('Professional Reference Portal IA & Search Indexing', () => {
  it('renders reorganized sidebar with new professional navigation groups', () => {
    render(<Sidebar />);
    expect(screen.getByText('Platform')).toBeDefined();
    expect(screen.getByText('Knowledge & Drills')).toBeDefined();
    expect(screen.getByText('Interviews & Roadmaps')).toBeDefined();
    expect(screen.getByText('Workspace')).toBeDefined();

    // Check specific pill tags for streamlined primary hubs
    expect(screen.getByText('Matrix')).toBeDefined();
    expect(screen.getByText('3.2k+')).toBeDefined();
    expect(screen.getByText('660+')).toBeDefined();
    expect(screen.getByText('7.1k+')).toBeDefined();
  });

  it('supports toggling collapsed and expanded states smoothly', () => {
    render(<Sidebar />);
    const collapseBtn = screen.getByRole('button', { name: /collapse sidebar/i });
    expect(collapseBtn).toBeDefined();

    fireEvent.click(collapseBtn);
    expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /expand sidebar/i }));
    expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeDefined();
  });

  it('indexes concepts beyond the first 50 in Command Palette', () => {
    expect(conceptsDb.length).toBeGreaterThan(50);
    // Grab a concept near the end of conceptsDb
    const lastConcept = conceptsDb[conceptsDb.length - 1];

    render(<CommandPalette />);

    // Open command palette via meta+k
    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    const input = screen.getByPlaceholderText(/Search concepts/i);
    expect(input).toBeDefined();

    // Search for the last concept's term
    fireEvent.change(input, { target: { value: lastConcept.term } });

    // Should find the concept in the search results
    const matched = screen.getAllByText(new RegExp(lastConcept.term, 'i'));
    expect(matched.length).toBeGreaterThanOrEqual(1);
  });

  it('validates dynamic robots.ts and sitemap.ts route generators produce required metadata', async () => {
    const robotsModule = await import('@/app/robots');
    const sitemapModule = await import('@/app/sitemap');

    const robotsResult = robotsModule.default();
    expect(robotsResult.host).toBe('https://lakehousearchitect.com');
    expect(robotsResult.sitemap).toContain('https://lakehousearchitect.com/sitemap.xml');

    const sitemapResult = await sitemapModule.default();
    const urls = sitemapResult.map((entry) => entry.url);
    expect(urls).toContain('https://lakehousearchitect.com/guided-learning');
    expect(urls).toContain('https://lakehousearchitect.com/architecture');
    expect(urls).toContain('https://lakehousearchitect.com/');
    expect(sitemapResult.length).toBeGreaterThanOrEqual(10);
  });
});
