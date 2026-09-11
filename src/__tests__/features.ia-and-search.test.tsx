import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '@/components/layout/sidebar';
import { CommandPalette } from '@/components/command-palette';
import { conceptsDb } from '@/data';
import fs from 'fs';
import path from 'path';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('Professional Reference Portal IA & Search Indexing', () => {
  it('renders reorganized sidebar with new professional navigation groups', () => {
    render(<Sidebar />);
    expect(screen.getByText('Portal')).toBeDefined();
    expect(screen.getByText('Knowledge Base')).toBeDefined();
    expect(screen.getByText('Architectural Mastery')).toBeDefined();
    expect(screen.getByText('Interview & Prep')).toBeDefined();
    expect(screen.getByText('Studio')).toBeDefined();

    // Check specific pill tags
    expect(screen.getByText('The Map')).toBeDefined();
    expect(screen.getByText('Foundations')).toBeDefined();
    expect(screen.getByText('Core')).toBeDefined();
    expect(screen.getByText('Internal')).toBeDefined();
    expect(screen.getByText('Multi-Cloud')).toBeDefined();
    expect(screen.getByText('Visual')).toBeDefined();
    expect(screen.getByText('Principal')).toBeDefined();
    expect(screen.getByText('Advanced')).toBeDefined();
    expect(screen.getByText('High Stakes')).toBeDefined();
    expect(screen.getByText('Strategic')).toBeDefined();
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
    const matched = screen.getByText(new RegExp(lastConcept.term, 'i'));
    expect(matched).toBeDefined();
  });

  it('validates public/robots.txt and public/sitemap.xml exist with required content', () => {
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');

    expect(fs.existsSync(robotsPath)).toBe(true);
    expect(fs.existsSync(sitemapPath)).toBe(true);

    const robotsContent = fs.readFileSync(robotsPath, 'utf8');
    expect(robotsContent).toContain('User-agent: *');
    expect(robotsContent).toContain('Sitemap: https://fabric-pbi-prep.vercel.app/sitemap.xml');

    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    expect(sitemapContent).toContain('<loc>https://fabric-pbi-prep.vercel.app/python</loc>');
    expect(sitemapContent).toContain('<loc>https://fabric-pbi-prep.vercel.app/architecture</loc>');
    expect(sitemapContent).toContain('<lastmod>2026-09-11</lastmod>');
  });
});
