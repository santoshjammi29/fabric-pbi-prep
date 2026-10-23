import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import MiniSearch from 'minisearch';
import dataConceptsJson from '../src/data/json/data_concepts.json';
import dataCheatsheetJson from '../src/data/json/data_cheatsheet.json';
import databricksCheatsheetsJson from '../src/data/json/databricks_cheatsheets.json';
import dataPathsJson from '../src/data/json/data_paths.json';
import companyProfilesJson from '../src/data/json/company_profiles.json';
import dataPysparkJson from '../src/data/json/data_pyspark.json';
import dataSparksqlJson from '../src/data/json/data_sparksql.json';
import dataMssqlJson from '../src/data/json/data_mssql.json';
import dataPythonJson from '../src/data/json/data_python.json';
import modernBlueprintsJson from '../src/data/json/modern_blueprints.json';
import { GUIDED_TOPICS } from '../src/data/guided-learning-topics';
import { architectureDiagrams } from '../src/data/diagrams';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const DATA_JSON_DIR = path.join(process.cwd(), 'src', 'data', 'json');
const R2_OUT_DIR = path.join(process.cwd(), '.build-artifacts', 'r2');
const SHARD_SIZE = 200;

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
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
            question: q.question || '',
            answer: q.answer || '',
            difficulty: q.difficulty || 'Senior',
            category: q.category || q.topic || 'General',
            categoryLabel: q.categoryLabel || q.category || 'General',
            niche: q.niche || q.topic || '',
            domain: q.domain || q.category || 'General Data Engineering',
            subdomain: q.subdomain || q.niche || '',
            source: q.source || 'Core Architect',
            sourceDb: q.sourceDb || 'fabric_pbi',
            sourceLabel: q.sourceLabel || 'Fabric & PBI',
            code: q.code || '',
            tags: Array.isArray(q.tags) ? q.tags : (q.niche ? [q.niche] : []),
            rubricPoints: q.rubricPoints || [],
            companyTargets: q.companyTargets || [],
            topic: q.category || q.niche || 'General',
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
          source: s.source || 'Architecture Hub',
          category: s.category || s.niche || 'General Architecture',
          niche: s.niche || s.category || '',
          difficulty: s.difficulty || 'ARCHITECT',
          question: s.question || s.title || s.problemStatement || '',
          answer: s.answer || s.architectureSolution || '',
          // Compatibility aliases
          title: s.question || s.title || `Scenario ${s.id}`,
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
          difficulty: c.difficulty || 'Senior',
          definition: c.definition || c.summary || '',
          explanation: c.explanation || c.internals || '',
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
    version: process.env.GITHUB_SHA?.slice(0, 12) || process.env.ARTIFACT_VERSION || 'local',
    generatedAt: new Date().toISOString(),
    collections: {
      qa: shardCollection('qa', qaItems, 'domain'),
      scenarios: shardCollection('scenarios', scenarioItems, 'category'),
      concepts: shardCollection('concepts', conceptItems, 'category'),
    },
  };

  console.log('Building MiniSearch inverted search index...');
  const miniSearch = new MiniSearch({
    fields: ['title', 'question', 'term', 'summary', 'tags', 'domain', 'body', 'category'],
    storeFields: [
      'id', 'title', 'type', 'href', 'domain', 'difficulty', 'category', 'page',
      'badge', 'snippet', 'iconType', 'topicKey', 'topicLabel', 'topicIcon',
      'topicDescription', 'topicExecutiveSummary'
    ],
    searchOptions: { boost: { title: 4, term: 4, question: 3, tags: 2, category: 1.5 }, fuzzy: 0.2, prefix: true },
  });

  const searchDocs: any[] = [];
  const addDoc = (doc: Record<string, any>) => {
    const title = String(doc.title || '');
    const body = String(doc.body || doc.summary || doc.description || '');
    searchDocs.push({
      ...doc,
      title,
      summary: String(doc.summary || ''),
      body,
      tags: Array.isArray(doc.tags) ? doc.tags.join(' ') : String(doc.tags || ''),
      domain: String(doc.domain || ''),
      category: String(doc.category || ''),
      snippet: String(doc.snippet || body).replace(/\\s+/g, ' ').trim().slice(0, 220),
    });
  };

  GUIDED_TOPICS.forEach((topic) => addDoc({
    id: `topic-${topic.key}`, type: 'topic', title: topic.label,
    category: 'Guided Track', page: 'Guided Learning', href: `/guided-learning?topic=${topic.key}`,
    domain: topic.domain, tags: [topic.key, topic.domain], body: `${topic.description} ${topic.executiveSummary}`,
    badge: `Track · ${topic.domain}`, iconType: 'sparkles',
    topicKey: topic.key, topicLabel: topic.label, topicIcon: topic.icon,
    topicDescription: topic.description, topicExecutiveSummary: topic.executiveSummary,
  }));

  qaItems.forEach((q) => addDoc({
    id: `qa-${q.id}`, type: 'qa', title: q.question, question: q.question,
    category: 'Q&A Prep', page: 'Q&A Prep Hub',
    href: `/qa-prep?category=${encodeURIComponent(q.category || 'ALL')}&card=${encodeURIComponent(q.id)}`,
    domain: q.domain || q.category, difficulty: q.difficulty, badge: q.difficulty,
    tags: [q.category, q.niche, q.domain, q.sourceLabel].filter(Boolean),
    body: (q.answer || '').slice(0, 300), iconType: 'message',
  }));

  scenarioItems.forEach((item) => addDoc({
    id: `arch-${item.id}`, type: 'scenario', title: item.question || item.title || `Scenario ${item.id}`,
    category: 'Architecture', page: 'Architecture Hub',
    href: `/architecture?category=${encodeURIComponent(item.category || 'ALL')}&card=${encodeURIComponent(item.id)}`,
    domain: item.category, difficulty: item.difficulty, badge: item.difficulty,
    tags: [item.niche, item.source].filter(Boolean), body: (item.answer || item.problemStatement || '').slice(0, 300),
    iconType: 'cpu',
  }));

  conceptItems.forEach((item) => addDoc({
    id: `concept-${item.id}`, type: 'concept', title: item.term,
    category: 'Concepts', page: 'Key Concepts',
    href: `/concepts?tab=concepts&category=${encodeURIComponent(item.category)}&term=${encodeURIComponent(item.term)}`,
    domain: item.category, difficulty: item.difficulty, badge: item.difficulty,
    tags: item.keyPoints || item.relatedTerms || [], body: `${item.definition || ''} ${item.explanation || ''}`.slice(0, 300),
    iconType: 'book',
  }));

  const codeGroups = [
    { items: dataPysparkJson as any[], label: 'PySpark' },
    { items: dataSparksqlJson as any[], label: 'SparkSQL' },
    { items: dataMssqlJson as any[], label: 'Advanced SQL' },
    { items: dataPythonJson as any[], label: 'Python' },
  ];
  codeGroups.forEach(({ items, label }) => items.forEach((item) => addDoc({
    id: `code-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${item.id}`, type: 'code', title: `${item.title} (${label})`,
    category: 'Code Practice', page: 'Code Practice', href: '/code-practice',
    domain: item.category || label, difficulty: item.level, badge: item.level || 'PROD',
    tags: [label, item.level, item.use_case].filter(Boolean),
    body: `${item.description || ''} ${item.code || ''}`, iconType: 'terminal',
  })));

  (dataCheatsheetJson as any[]).forEach((item) => addDoc({
    id: `cheat-${item.id}`, type: 'cheat', title: `${item.title} — ${item.category}`,
    category: 'Cheat Sheets', page: 'Cheat Sheets', href: `/cheat-sheet?id=${item.id}`,
    domain: item.category, badge: item.impact || 'PROD',
    tags: item.tags || [], body: `${item.problem || ''} ${item.solution || ''} ${item.whyItMatters || ''}`,
    iconType: 'terminal',
  }));

  const dbxCards = (databricksCheatsheetsJson as any)?.cards || [];
  dbxCards.forEach((item: any) => addDoc({
    id: `dbx-cheat-${item.id}`, type: 'cheat', title: `${item.title} (Databricks)`,
    category: 'Cheat Sheets', page: 'Cheat Sheets', href: '/cheat-sheet',
    domain: item.domainTitle || 'Databricks', badge: item.tag || 'PROD',
    tags: [item.domain, item.tag, 'databricks'].filter(Boolean), body: `${item.title || ''} ${item.tag || ''}`,
    iconType: 'terminal',
  }));

  (modernBlueprintsJson as any[]).forEach((item) => addDoc({
    id: `bp-${item.id}`, type: 'blueprint', title: item.title,
    category: 'Blueprints', page: 'Modern Stack', href: '/modern-stack#blueprints',
    domain: item.category, badge: item.category,
    tags: item.tags || [], body: `${item.category || ''} ${item.costEstimate || ''}`, iconType: 'cpu',
  }));

  architectureDiagrams.forEach((item: any) => addDoc({
    id: `diagram-${item.id}`, type: 'diagram', title: `${item.title} (Whiteboard)`,
    category: 'Blueprints', page: 'Architecture', href: `/architecture#${item.id}`,
    domain: item.category, badge: 'Whiteboard',
    tags: [...(item.tags || []), 'whiteboard', 'diagram', 'blueprint', 'architecture'],
    body: `${item.subtitle || ''} ${item.description || ''} ${(item.keyPoints || []).join(' ')}`,
    iconType: 'layout',
  }));

  const simulators = [
    { id: 'sim-shuffle', title: 'Simulator: Spark Shuffle & Partition Estimator', href: '/modern-stack#simulators', description: 'Interactive partition and memory calculation for large Apache Spark shuffle stages.', tags: ['spark', 'shuffle', 'partition', 'memory', 'estimator', 'calculator'] },
    { id: 'sim-delta', title: 'Simulator: Iceberg vs Delta Decision Tree', href: '/modern-stack#simulators', description: 'Decision engine for choosing between Apache Iceberg and Delta Lake table formats.', tags: ['iceberg', 'delta', 'decision', 'tree', 'lakehouse', 'table format', 'simulator'] },
    { id: 'sim-cost', title: 'Simulator: Serverless Cloud Cost Calculator', href: '/modern-stack#simulators', description: 'Cloud compute and storage cost estimation across Azure, AWS, and GCP data workloads.', tags: ['cost', 'calculator', 'serverless', 'cloud', 'finops', 'simulator'] },
    { id: 'sim-spark-engine', title: 'Spark Engine & Execution Simulator', href: '/spark-engine', description: 'Visual runtime simulator for Catalyst optimizer, Tungsten off-heap memory, and AQE execution.', tags: ['spark', 'engine', 'simulator', 'catalyst', 'tungsten', 'aqe', 'photon'] },
  ];
  simulators.forEach((item) => addDoc({
    ...item, type: 'simulator', category: 'Simulators', page: item.id === 'sim-spark-engine' ? 'Spark Engine' : 'Modern Stack',
    badge: item.id === 'sim-spark-engine' ? 'Engine' : 'Interactive Tool', body: item.description, iconType: 'calculator',
  }));

  (dataPathsJson as any[]).forEach((item) => addDoc({
    id: `path-${item.id}`, type: 'path', title: `${item.title} (${item.weeks} Weeks)`,
    category: 'Learning Paths', page: 'Learning Paths', href: `/learning-paths?id=${item.id}`,
    domain: 'Learning Paths', badge: `${item.weeks}w`, tags: item.skills || [],
    body: item.description || '', iconType: 'compass',
  }));

  (companyProfilesJson as any[]).forEach((item) => addDoc({
    id: `company-${item.id}`, type: 'company', title: `${item.name} — GCC Tech Profile`,
    category: 'Companies', page: 'Company Research', href: '/company-research',
    domain: item.tier || 'Enterprise GCC', badge: item.tier || 'GCC',
    tags: [...(item.stack || []), ...(item.interviewFocus || []), item.location || ''].filter(Boolean),
    body: `${item.keyChallenges || ''} ${item.location || ''}`, iconType: 'building',
  }));

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
