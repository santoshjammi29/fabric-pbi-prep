import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  QaItemSchema,
  ScenarioItemSchema,
  ConceptItemSchema,
} from '@/schemas/content.schema';
import { getArtifactUrl } from '@/lib/artifact-client';

describe('Vercel-to-Cloudflare Migration Bundle Tests', () => {
  describe('Zod Content Schemas', () => {
    it('validates a correct QA item', () => {
      const sample = {
        id: 'qa-delta-acid',
        domain: 'Data Lakehouse & Architecture',
        topic: 'Delta Lake',
        difficulty: 'Senior',
        question: 'How does Delta Lake guarantee ACID transactions?',
        answer: 'Through its write-ahead transaction log (_delta_log) and optimistic concurrency control.',
        rubricPoints: ['Transaction log serialization', 'OCC checks'],
        tags: ['Delta Lake', 'ACID'],
      };
      const res = QaItemSchema.safeParse(sample);
      expect(res.success).toBe(true);
    });

    it('validates a correct Scenario item', () => {
      const sample = {
        id: 'scenario-multi-hop',
        title: 'Designing Real-Time Medallion Streaming',
        category: 'Data Pipelines & Ingestion',
        difficulty: 'Principal',
        problemStatement: 'Sub-minute latency ETL from Kafka to Iceberg',
        constraints: ['Max 1 min latency', 'Strict schema enforcement'],
        architectureSolution: 'Kafka -> Spark Structured Streaming -> Delta / Iceberg Bronze -> Silver -> Gold',
        tradeoffs: ['Higher compute cost for micro-batches vs trigger-once'],
      };
      const res = ScenarioItemSchema.safeParse(sample);
      expect(res.success).toBe(true);
    });

    it('validates a correct Concept item', () => {
      const sample = {
        id: 'concept-liquid-clustering',
        term: 'Liquid Clustering',
        category: 'Compute & Optimization',
        parentId: null,
        summary: 'Dynamic data clustering that replaces fixed table partitioning and Z-ordering.',
        internals: 'Uses Hilbert space-filling curves without directory hierarchy restrictions.',
        relatedTerms: ['Z-Order', 'Partitioning'],
      };
      const res = ConceptItemSchema.safeParse(sample);
      expect(res.success).toBe(true);
    });

    it('rejects invalid items missing required fields', () => {
      const invalid = { id: 'missing-q-and-a' };
      const res = QaItemSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });
  });

  describe('Artifact Client Helpers', () => {
    it('generates correct artifact URLs with fallback or custom CDN', () => {
      const url1 = getArtifactUrl('manifest.json');
      expect(url1).toContain('manifest.json');

      const url2 = getArtifactUrl('/shards/qa/shard-0.json');
      expect(url2).not.toContain('//shards');
      expect(url2).toContain('shards/qa/shard-0.json');
    });
  });

  describe('Generated R2 Shards & Search Index Integrity', () => {
    const r2Dir = path.join(process.cwd(), '.build-artifacts', 'r2');
    const manifestPath = path.join(r2Dir, 'manifest.json');

    it('verifies that .build-artifacts/r2/manifest.json exists and is valid', () => {
      expect(fs.existsSync(manifestPath)).toBe(true);
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

      expect(manifest.version).toBeDefined();
      expect(manifest.generatedAt).toBeDefined();
      expect(manifest.searchIndexKey).toBeDefined();
      expect(manifest.collections.qa).toBeDefined();
      expect(manifest.collections.scenarios).toBeDefined();
      expect(manifest.collections.concepts).toBeDefined();

      expect(manifest.collections.qa.totalItems).toBeGreaterThan(1000);
      expect(manifest.collections.scenarios.totalItems).toBeGreaterThan(1000);
      expect(manifest.collections.concepts.totalItems).toBeGreaterThan(500);

      // Verify that the search index referenced in manifest exists on disk
      const searchIndexPath = path.join(r2Dir, manifest.searchIndexKey);
      expect(fs.existsSync(searchIndexPath)).toBe(true);
    });

    it('verifies that shards are generated with non-empty contents', () => {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const firstQaShardKey = manifest.collections.qa.shards[0].key;
      const shardPath = path.join(r2Dir, firstQaShardKey);

      expect(fs.existsSync(shardPath)).toBe(true);
      const shardContent = JSON.parse(fs.readFileSync(shardPath, 'utf-8'));
      expect(Array.isArray(shardContent)).toBe(true);
      expect(shardContent.length).toBeGreaterThan(0);
      expect(shardContent.length).toBeLessThanOrEqual(200);
    });
  });

  describe('SM-2 Spaced Repetition Formula Logic', () => {
    it('computes quality factor updates correctly with EF >= 1.3', () => {
      // Test the mathematical calculation directly
      const computeSm2 = (quality: number, efactor: number, repetition: number, interval: number) => {
        let nextInterval = interval;
        let nextRepetition = repetition;
        let nextEfactor = efactor;

        if (quality >= 3) {
          if (nextRepetition === 0) nextInterval = 1;
          else if (nextRepetition === 1) nextInterval = 6;
          else nextInterval = Math.round(nextInterval * nextEfactor);
          nextRepetition += 1;
        } else {
          nextRepetition = 0;
          nextInterval = 1;
        }
        nextEfactor = Math.max(1.3, nextEfactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

        return { interval: nextInterval, repetition: nextRepetition, efactor: nextEfactor };
      };

      // Quality 5 (Perfect)
      const res1 = computeSm2(5, 2.5, 0, 0);
      expect(res1.interval).toBe(1);
      expect(res1.repetition).toBe(1);
      expect(res1.efactor).toBe(2.6);

      // Subsequent Quality 4
      const res2 = computeSm2(4, res1.efactor, res1.repetition, res1.interval);
      expect(res2.interval).toBe(6);
      expect(res2.repetition).toBe(2);

      // Low Quality 1 (Reset)
      const res3 = computeSm2(1, 1.4, 3, 15);
      expect(res3.interval).toBe(1);
      expect(res3.repetition).toBe(0);
      expect(res3.efactor).toBeGreaterThanOrEqual(1.3);
    });
  });
});
