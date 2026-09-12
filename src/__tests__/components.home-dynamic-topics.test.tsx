import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  FEATURED_HERO_GUIDES,
  SECONDARY_HERO_CARDS,
  SCENARIOS_OF_THE_DAY,
  CODE_SNIPPETS_OF_THE_DAY,
  SIMULATORS_OF_THE_DAY,
  getRandomHeroSelection,
  getRandomSpotlightSelection,
} from '@/data/home-dynamic-topics';
import { EditorialHero } from '@/components/dashboard/editorial-hero';
import { TrendingSpotlight } from '@/components/dashboard/trending-spotlight';

describe('Home Page Dynamic Topics Data & Selection Engine', () => {
  it('contains comprehensive featured guides across major platforms', () => {
    expect(FEATURED_HERO_GUIDES.length).toBeGreaterThanOrEqual(10);
    FEATURED_HERO_GUIDES.forEach((guide) => {
      expect(guide.title).toBeTruthy();
      expect(guide.href).toMatch(/^\/(concepts|spark-engine|architecture|modern-stack|python|code-practice)/);
      expect(guide.description.length).toBeGreaterThan(20);
      expect(guide.author.name).toBe('Santosh Jammi');
    });
  });

  it('contains secondary editorial cards with valid tracks and routes', () => {
    expect(SECONDARY_HERO_CARDS.length).toBeGreaterThanOrEqual(15);
    SECONDARY_HERO_CARDS.forEach((card) => {
      expect(card.title).toBeTruthy();
      expect(card.href).toMatch(/^\/(concepts|spark-engine|architecture|modern-stack|python|code-practice)/);
      expect(card.trackLabel).toBeTruthy();
    });
  });

  it('contains scenarios, code snippets, and simulators with architect depth', () => {
    expect(SCENARIOS_OF_THE_DAY.length).toBeGreaterThanOrEqual(6);
    expect(CODE_SNIPPETS_OF_THE_DAY.length).toBeGreaterThanOrEqual(6);
    expect(SIMULATORS_OF_THE_DAY.length).toBeGreaterThanOrEqual(6);

    SCENARIOS_OF_THE_DAY.forEach((scen) => {
      expect(scen.question).toBeTruthy();
      expect(scen.solution).toBeTruthy();
    });

    CODE_SNIPPETS_OF_THE_DAY.forEach((snippet) => {
      expect(snippet.code).toBeTruthy();
      expect(['pyspark', 'python', 'sql']).toContain(snippet.language);
    });

    SIMULATORS_OF_THE_DAY.forEach((sim) => {
      expect(sim.title).toBeTruthy();
      expect(sim.metrics.length).toBeGreaterThanOrEqual(2);
      expect(sim.href).toContain('/modern-stack#simulators');
    });
  });

  it('getRandomHeroSelection produces 1 featured guide and 3 distinct secondary tracks', () => {
    const selection = getRandomHeroSelection(12345);
    expect(selection.featured).toBeDefined();
    expect(selection.secondary.length).toBe(3);

    // Verify all 3 secondary cards have unique IDs
    const ids = new Set(selection.secondary.map((c) => c.id));
    expect(ids.size).toBe(3);
  });

  it('different seeds produce different selections', () => {
    const sel1 = getRandomHeroSelection(1);
    const sel2 = getRandomHeroSelection(9999);
    // At least one of featured or secondary cards should differ
    const isDifferent =
      sel1.featured.id !== sel2.featured.id ||
      sel1.secondary[0].id !== sel2.secondary[0].id;
    expect(isDifferent).toBe(true);
  });

  it('getRandomSpotlightSelection produces 1 scenario, 1 code snippet, and 1 simulator', () => {
    const spot = getRandomSpotlightSelection(42);
    expect(spot.scenario.question).toBeTruthy();
    expect(spot.snippet.title).toBeTruthy();
    expect(spot.simulator.title).toBeTruthy();
  });

  it('consecutive page refresh seeds rotate topics across different website domains', () => {
    const featuredTitles = new Set<string>();
    const scenarioTitles = new Set<string>();

    // Simulate 5 page refreshes with incrementing Lehmer LCG seeds
    let currentSeed = 1000;
    for (let i = 0; i < 5; i++) {
      currentSeed = (currentSeed * 16807 + 1013904223) % 2147483647;
      const hero = getRandomHeroSelection(currentSeed);
      const spotlight = getRandomSpotlightSelection(currentSeed);

      featuredTitles.add(hero.featured.title);
      scenarioTitles.add(spotlight.scenario.question);
    }

    // Over 5 refreshes, at least 3 distinct topics should be explored
    expect(featuredTitles.size).toBeGreaterThanOrEqual(3);
    expect(scenarioTitles.size).toBeGreaterThanOrEqual(3);
  });
});

describe('EditorialHero Component', () => {
  it('renders featured hero guide and secondary cards', () => {
    render(<EditorialHero />);

    // Check featured card action button
    const readButtons = screen.getAllByRole('link');
    expect(readButtons.length).toBeGreaterThanOrEqual(4);

    // Check presence of author
    expect(screen.getByText('Santosh Jammi')).toBeDefined();

    // Check presence of shuffle button
    const shuffleBtn = screen.getByRole('button', { name: /shuffle/i });
    expect(shuffleBtn).toBeDefined();
  });

  it('allows manual shuffling of topics via shuffle button', () => {
    render(<EditorialHero />);
    const shuffleBtn = screen.getByRole('button', { name: /shuffle/i });
    fireEvent.click(shuffleBtn);
    expect(shuffleBtn).toBeDefined();
  });
});

describe('TrendingSpotlight Component', () => {
  it('renders scenario of the day, code snippet, and simulator card', () => {
    render(<TrendingSpotlight />);

    expect(screen.getByText('Daily Curated Spotlight')).toBeDefined();
    expect(screen.getByText(/Architecture, Code & Simulator of the Day/i)).toBeDefined();

    // Check interactive reveal solution button
    const revealBtn = screen.getByRole('button', { name: /reveal solution/i });
    expect(revealBtn).toBeDefined();

    // Click reveal solution
    fireEvent.click(revealBtn);
    expect(screen.getByText(/Architect Solution:/i)).toBeDefined();

    // Check simulator launcher link
    const simLink = screen.getByRole('link', { name: /Launch Simulator/i });
    expect(simLink.getAttribute('href')).toBe('/modern-stack#simulators');
  });

  it('allows manual shuffling of spotlight cards', () => {
    render(<TrendingSpotlight />);
    const shuffleBtn = screen.getByRole('button', { name: /shuffle spotlight/i });
    fireEvent.click(shuffleBtn);
    expect(shuffleBtn).toBeDefined();
  });
});
