import { describe, it, expect } from 'vitest';
import {
  getTopicItems,
  getTopicCounts,
  getTopicDiagram,
  getTopicSummaryStats,
  getPlatformOverviewStats,
} from '@/lib/guided-learning';
import { GUIDED_TOPICS, GUIDED_DOMAINS } from '@/data/guided-learning-topics';

describe('guided-learning data', () => {
  it('GUIDED_TOPICS has all expected keys', () => {
    const keys = GUIDED_TOPICS.map((t) => t.key);
    expect(keys).toContain('airflow');
    expect(keys).toContain('databricks');
    expect(keys).toContain('dbt');
    expect(keys).toContain('adf');
    expect(keys).toContain('spark');
    expect(keys).toContain('fabric');
    expect(keys).toContain('powerbi');
    expect(keys).toContain('sql');
    expect(keys).toContain('datalake');
    expect(keys).toContain('streaming');
    expect(keys).toContain('modeling');
    expect(keys).toContain('governance');
  });

  it('GUIDED_DOMAINS contains standard architectural domains', () => {
    expect(GUIDED_DOMAINS).toContain('Distributed Compute');
    expect(GUIDED_DOMAINS).toContain('Lakehouse & Storage');
    expect(GUIDED_DOMAINS).toContain('Pipelines & Orchestration');
    expect(GUIDED_DOMAINS).toContain('Data Modeling & SQL');
    expect(GUIDED_DOMAINS).toContain('Governance & Streaming');
  });

  it('getTopicItems returns items for airflow', () => {
    const items = getTopicItems('airflow');
    expect(items.length).toBeGreaterThan(50);
    expect(items.every((i) => ['concept', 'qa', 'architecture'].includes(i.type))).toBe(true);
    expect(items.every((i) => ['EASY', 'MEDIUM', 'HARD', 'ARCHITECT'].includes(i.difficulty))).toBe(true);
  });

  it('getTopicItems returns items for databricks', () => {
    const items = getTopicItems('databricks');
    expect(items.length).toBeGreaterThan(100);
  });

  it('getTopicItems returns items for new tracks: streaming, modeling, governance', () => {
    const streamingItems = getTopicItems('streaming');
    expect(streamingItems.length).toBeGreaterThan(30);

    const modelingItems = getTopicItems('modeling');
    expect(modelingItems.length).toBeGreaterThan(30);

    const governanceItems = getTopicItems('governance');
    expect(governanceItems.length).toBeGreaterThan(30);
  });

  it('getTopicCounts total equals items length', () => {
    const counts = getTopicCounts('dbt');
    const items = getTopicItems('dbt');
    expect(counts.total).toBe(items.length);
  });

  it('items have valid sourceHref starting with /', () => {
    const items = getTopicItems('adf');
    items.forEach((item) => {
      expect(item.sourceHref).toMatch(/^\//);
    });
  });

  it('items are sorted: concepts first, then qa, then architecture', () => {
    const items = getTopicItems('airflow');
    const firstQaIdx = items.findIndex((i) => i.type === 'qa');
    const firstArchIdx = items.findIndex((i) => i.type === 'architecture');
    const lastConceptIdx = items.map((i) => i.type).lastIndexOf('concept');
    if (firstQaIdx > -1 && lastConceptIdx > -1) {
      expect(lastConceptIdx).toBeLessThan(firstQaIdx);
    }
    if (firstArchIdx > -1 && firstQaIdx > -1) {
      expect(firstQaIdx).toBeLessThan(firstArchIdx);
    }
  });

  it('getTopicDiagram returns valid whiteboard blueprint for supported topics', () => {
    const airflowDiagram = getTopicDiagram('airflow');
    expect(airflowDiagram).toBeDefined();
    expect(airflowDiagram?.id).toBe('apache-airflow-distributed-architecture');

    const databricksDiagram = getTopicDiagram('databricks');
    expect(databricksDiagram).toBeDefined();

    const fabricDiagram = getTopicDiagram('fabric');
    expect(fabricDiagram).toBeDefined();
    expect(fabricDiagram?.id).toBe('fabric-onelake-architecture');
  });

  it('getTopicSummaryStats calculates stage and difficulty distribution', () => {
    const stats = getTopicSummaryStats('spark');
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.easy + stats.medium + stats.hard + stats.architect).toBe(stats.total);
    expect(stats.concepts + stats.qa + stats.arch).toBe(stats.total);
    expect(stats.estMinutes).toBeGreaterThan(0);
  });

  it('getPlatformOverviewStats returns comprehensive platform totals', () => {
    const overview = getPlatformOverviewStats();
    expect(overview.totalTopics).toBe(12);
    expect(overview.totalUniqueItems).toBeGreaterThan(500);
    expect(overview.totalWhiteboards).toBe(10);
    expect(overview.domainsCount).toBeGreaterThanOrEqual(4);
  });
});
