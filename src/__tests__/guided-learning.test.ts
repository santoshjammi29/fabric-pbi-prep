import { describe, it, expect } from 'vitest';
import { getTopicItems, getTopicCounts } from '@/lib/guided-learning';
import { GUIDED_TOPICS } from '@/data/guided-learning-topics';

describe('guided-learning data', () => {
  it('GUIDED_TOPICS has all expected keys', () => {
    const keys = GUIDED_TOPICS.map(t => t.key);
    expect(keys).toContain('airflow');
    expect(keys).toContain('databricks');
    expect(keys).toContain('dbt');
    expect(keys).toContain('adf');
  });

  it('getTopicItems returns items for airflow', () => {
    const items = getTopicItems('airflow');
    expect(items.length).toBeGreaterThan(50);
    expect(items.every(i => ['concept','qa','architecture'].includes(i.type))).toBe(true);
    expect(items.every(i => ['EASY','MEDIUM','HARD','ARCHITECT'].includes(i.difficulty))).toBe(true);
  });

  it('getTopicItems returns items for databricks', () => {
    const items = getTopicItems('databricks');
    expect(items.length).toBeGreaterThan(100);
  });

  it('getTopicCounts total equals items length', () => {
    const counts = getTopicCounts('dbt');
    const items = getTopicItems('dbt');
    expect(counts.total).toBe(items.length);
  });

  it('items have valid sourceHref starting with /', () => {
    const items = getTopicItems('adf');
    items.forEach(item => {
      expect(item.sourceHref).toMatch(/^\//);
    });
  });

  it('items are sorted: concepts first, then qa, then architecture', () => {
    const items = getTopicItems('airflow');
    const firstQaIdx = items.findIndex(i => i.type === 'qa');
    const firstArchIdx = items.findIndex(i => i.type === 'architecture');
    const lastConceptIdx = items.map(i => i.type).lastIndexOf('concept');
    if (firstQaIdx > -1 && lastConceptIdx > -1) {
      expect(lastConceptIdx).toBeLessThan(firstQaIdx);
    }
    if (firstArchIdx > -1 && firstQaIdx > -1) {
      expect(firstQaIdx).toBeLessThan(firstArchIdx);
    }
  });
});
