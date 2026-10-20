import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import MiniSearch from 'minisearch';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const DATA_JSON_DIR = path.join(process.cwd(), 'src', 'data', 'json');
const R2_OUT_DIR = path.join(process.cwd(), '.build-artifacts', 'r2');
const SHARD_SIZE = 200;

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 10);
}

function readJsonFolder<T>(subpath: string): T[] {
  const fullPath = path.join(CONTENT_DIR, subpath);
  if (!fs.existsSync(fullPath)) return [];
  const files = fs.readdirSync(fullPath, { recursive: true }).filter((f) => String(f).endsWith('.json'));
  const results: T[] = [];
  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(fullPath, String(file)), 'utf-8'));
    if (Array.isArray(raw)) results.push(...raw);
    else results.push(raw);
  }
  return results;
}

function loadQaItems(): any[] {
  const fromContent = readJsonFolder<any>('qa-bank');
  if (fromContent.length > 0) return fromContent;

  // Fallback / adapt from src/data/json
  const seen = new Set<string>();
  const items: any[] = [];

  const candidateFiles = [
    'questions_unified_cleaned.json',
    'questions.json',
    'data_de.json',
  ];

  for (const file of candidateFiles) {
    const fullPath = path.join(DATA_JSON_DIR, file);
    if (!fs.existsSync(fullPath)) continue;
    try {
      const raw = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      if (Array.isArray(raw)) {
        for (const q of raw) {
          if (!q || !q.id || seen.has(q.id)) continue;
          seen.add(q.id);
          items.push({
            id: q.id,
            domain: q.domain || q.category || 'General Data Engineering',
            topic: q.category || q.niche || 'General',
            difficulty: q.difficulty || 'Senior',
            question: q.question || '',
            answer: q.answer || '',
            rubricPoints: q.rubricPoints || [],
            tags: Array.isArray(q.tags) ? q.tags : (q.niche ? [q.niche] : []),
            companyTargets: q.companyTargets || [],
          });
        }
      }
    } catch (err) {
      console.warn(`Could not read ${file}:`, err);
    }
  }

  return items;
}

function loadScenarioItems(): any[] {
  const fromContent = readJsonFolder<any>('scenarios');
  if (fromContent.length > 0) return fromContent;

  const fullPath = path.join(DATA_JSON_DIR, 'data_architecture.json');
  if (!fs.existsSync(fullPath)) return [];

  const seen = new Set<string>();
  const items: any[] = [];
  try {
    const raw = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    if (Array.isArray(raw)) {
      for (const s of raw) {
        if (!s || !s.id || seen.has(s.id)) continue;
        seen.add(s.id);
        items.push({
          id: s.id,
          title: s.question || s.title || `Scenario ${s.id}`,
          category: s.category || s.niche || 'General Architecture',
          difficulty: s.difficulty || 'Principal',
          problemStatement: s.question || s.problemStatement || '',
          constraints: s.constraints || [],
          architectureSolution: s.answer || s.architectureSolution || '',
          tradeoffs: s.tradeoffs || [],
          blueprintId: s.blueprintId,
        });
      }
    }
  } catch (err) {
    console.warn('Could not read data_architecture.json:', err);
  }
  return items;
}

function loadConceptItems(): any[] {
  const fromContent = readJsonFolder<any>('concepts');
  if (fromContent.length > 0) return fromContent;

  const fullPath = path.join(DATA_JSON_DIR, 'data_concepts.json');
  if (!fs.existsSync(fullPath)) return [];

  const seen = new Set<string>();
  const items: any[] = [];
  try {
    const raw = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    if (Array.isArray(raw)) {
      for (const c of raw) {
        if (!c || !c.id || seen.has(c.id)) continue;
        seen.add(c.id);
        items.push({
          id: c.id,
          term: c.term || '',
          category: c.category || 'General',
          parentId: c.parentId ?? null,
          summary: c.definition || c.summary || '',
          internals: c.explanation || c.internals || '',
          relatedTerms: c.relatedTerms || c.keyPoints || [],
        });
      }
    }
  } catch (err) {
    console.warn('Could not read data_concepts.json:', err);
  }
  return items;
}

function shardCollection<T extends Record<string, any>>(name: string, items: T[], partitionField?: keyof T) {
  const collectionDir = path.join(R2_OUT_DIR, 'shards', name);
  ensureDir(collectionDir);

  const shards: Array<{ index: number; key: string; count: number; hash: string }> = [];
  const totalShards = Math.ceil(items.length / SHARD_SIZE);

  for (let i = 0; i < totalShards; i++) {
    const slice = items.slice(i * SHARD_SIZE, (i + 1) * SHARD_SIZE);
    const serialized = JSON.stringify(slice);
    const hash = hashContent(serialized);
    const fileName = `shard-${i}.${hash}.json`;
    fs.writeFileSync(path.join(collectionDir, fileName), serialized);
    shards.push({ index: i, key: `shards/${name}/${fileName}`, count: slice.length, hash });
  }

  const byCategory: Record<string, number[]> = {};
  if (partitionField) {
    items.forEach((item, idx) => {
      const cat = String(item[partitionField] || 'general');
      const shardIdx = Math.floor(idx / SHARD_SIZE);
      if (!byCategory[cat]) byCategory[cat] = [];
      if (!byCategory[cat].includes(shardIdx)) byCategory[cat].push(shardIdx);
    });
  }

  return { totalItems: items.length, shardSize: SHARD_SIZE, totalShards, shards, byCategory };
}

function copyStaticDirectory(srcSubdir: string, destSubdir: string) {
  // Check content dir first, then public dir fallback
  let src = path.join(CONTENT_DIR, srcSubdir);
  if (!fs.existsSync(src)) {
    src = path.join(process.cwd(), 'public', srcSubdir);
  }
  const dest = path.join(R2_OUT_DIR, destSubdir);
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  fs.cpSync(src, dest, { recursive: true });
}

function run() {
  console.log('--- Sharding & Search Index Generation ---');
  if (fs.existsSync(R2_OUT_DIR)) fs.rmSync(R2_OUT_DIR, { recursive: true, force: true });
  ensureDir(R2_OUT_DIR);

  const qaItems = loadQaItems();
  const scenarioItems = loadScenarioItems();
  const conceptItems = loadConceptItems();

  console.log(`Loaded items: ${qaItems.length} QA, ${scenarioItems.length} Scenarios, ${conceptItems.length} Concepts`);

  const manifest = {
    version: process.env.ARTIFACT_VERSION || 'v2026.10',
    generatedAt: new Date().toISOString(),
    collections: {
      qa: shardCollection('qa', qaItems, 'domain'),
      scenarios: shardCollection('scenarios', scenarioItems, 'category'),
      concepts: shardCollection('concepts', conceptItems, 'category'),
    },
  };

  console.log('Building MiniSearch inverted search index...');
  const miniSearch = new MiniSearch({
    fields: ['title', 'question', 'term', 'summary', 'tags', 'domain'],
    storeFields: ['id', 'title', 'type', 'href', 'domain', 'difficulty'],
    searchOptions: { boost: { title: 3, term: 3, question: 2, tags: 1.5 }, fuzzy: 0.2, prefix: true },
  });

  const searchDocs: any[] = [];
  qaItems.forEach((q) =>
    searchDocs.push({
      id: `qa:${q.id}`,
      title: q.question,
      question: q.question,
      domain: q.domain,
      difficulty: q.difficulty,
      tags: Array.isArray(q.tags) ? q.tags.join(' ') : '',
      type: 'qa',
      href: `/qa-prep?id=${q.id}`,
    })
  );
  scenarioItems.forEach((s) =>
    searchDocs.push({
      id: `sc:${s.id}`,
      title: s.title,
      summary: s.problemStatement,
      domain: s.category,
      difficulty: s.difficulty,
      type: 'scenario',
      href: `/architecture?tab=scenarios&id=${s.id}`,
    })
  );
  conceptItems.forEach((c) =>
    searchDocs.push({
      id: `concept:${c.id}`,
      title: c.term,
      term: c.term,
      summary: c.summary,
      domain: c.category,
      difficulty: 'Senior',
      type: 'concept',
      href: `/concepts?term=${encodeURIComponent(c.term)}`,
    })
  );

  miniSearch.addAll(searchDocs);
  const searchJson = JSON.stringify(miniSearch.toJSON());
  const searchHash = hashContent(searchJson);
  const searchKey = `index/search-index.${searchHash}.json`;

  ensureDir(path.join(R2_OUT_DIR, 'index'));
  fs.writeFileSync(path.join(R2_OUT_DIR, searchKey), searchJson);

  const finalManifest = { ...manifest, searchIndexKey: searchKey };
  fs.writeFileSync(path.join(R2_OUT_DIR, 'manifest.json'), JSON.stringify(finalManifest, null, 2));

  copyStaticDirectory('blueprints', 'blueprints');
  copyStaticDirectory('diagrams', 'blueprints');
  copyStaticDirectory('cheat-sheets', 'cheat-sheets');
  copyStaticDirectory('cheatsheets', 'cheat-sheets');

  console.log(`✓ Sharding complete! Manifest and ${searchDocs.length} search documents written to .build-artifacts/r2`);
}

run();
