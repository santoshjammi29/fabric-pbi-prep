import { describe, it, expect, beforeEach } from 'vitest';
import {
  EXPERIENCE_TIERS,
  getStoredExperienceTier,
  setStoredExperienceTier,
  getLastTopic,
  recordLastTopic,
  getMasteryStats,
  ExperienceTier,
} from '@/lib/user-progress';

describe('user-progress lib', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defines 4 valid experience tiers with recommended steps and start paths', () => {
    const tiers: ExperienceTier[] = ['beginner', 'associate', 'senior', 'staff_architect'];
    expect(Object.keys(EXPERIENCE_TIERS)).toEqual(tiers);

    tiers.forEach((tier) => {
      const config = EXPERIENCE_TIERS[tier];
      expect(config.label).toBeDefined();
      expect(config.role).toBeDefined();
      expect(config.certs.length).toBeGreaterThan(0);
      expect(config.recommendedSteps.length).toBeGreaterThan(0);
      expect(config.startingPath.href).toBeDefined();
    });
  });

  it('handles getStoredExperienceTier and setStoredExperienceTier with persistence', () => {
    expect(getStoredExperienceTier()).toBe('associate');

    setStoredExperienceTier('staff_architect');
    expect(getStoredExperienceTier()).toBe('staff_architect');
    expect(localStorage.getItem('dataprep_experience_tier')).toBe('staff_architect');
  });

  it('returns default start path when no last topic is saved, adapted to tier', () => {
    const beginnerTopic = getLastTopic('beginner');
    expect(beginnerTopic.title).toContain('Lakehouse vs Data Warehouse');
    expect(beginnerTopic.href).toContain('/concepts');

    const seniorTopic = getLastTopic('senior');
    expect(seniorTopic.title).toContain('Apache Spark');
    expect(seniorTopic.href).toContain('/spark-engine');
  });

  it('persists and retrieves recorded last topic', () => {
    recordLastTopic({
      title: 'T-SQL Window Functions & Partitioning',
      href: '/code-practice?db=mssql',
      category: 'MS SQL Practice',
      progress: 65,
    });

    const retrieved = getLastTopic();
    expect(retrieved.title).toBe('T-SQL Window Functions & Partitioning');
    expect(retrieved.href).toBe('/code-practice?db=mssql');
    expect(retrieved.category).toBe('MS SQL Practice');
    expect(retrieved.progress).toBe(65);
  });

  it('computes mastery stats based on saved bookmarks and reviewed items', () => {
    localStorage.setItem('dataprep_bookmarks', JSON.stringify(['item-1', 'item-2', 'item-3']));
    localStorage.setItem(
      'dataprep_userdata',
      JSON.stringify({ xp: 450, reviewedCount: 30, lastActive: new Date().toISOString() })
    );

    const stats = getMasteryStats();
    expect(stats.bookmarksCount).toBe(3);
    expect(stats.reviewedCount).toBe(30);
    expect(stats.xp).toBe(450);
    expect(stats.masteryPercentage).toBe(25); // 30 / 120 = 25%
  });
});
