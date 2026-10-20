import fs from 'fs';
import path from 'path';
import { QaItemSchema, ScenarioItemSchema, ConceptItemSchema } from '../src/schemas/content.schema';

const DATA_JSON_DIR = path.join(process.cwd(), 'src', 'data', 'json');
const CONTENT_DIR = path.join(process.cwd(), 'content');

function loadJsonArray(filePath: string): any[] {
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return Array.isArray(raw) ? raw : [raw];
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
}

function runValidation() {
  console.log('--- Content Integrity Validation ---');
  let hasErrors = false;
  let totalValidated = 0;

  // 1. Validate Concepts
  const conceptsPath = fs.existsSync(path.join(CONTENT_DIR, 'concepts'))
    ? path.join(CONTENT_DIR, 'concepts')
    : path.join(DATA_JSON_DIR, 'data_concepts.json');

  const concepts = fs.statSync(conceptsPath).isDirectory()
    ? fs.readdirSync(conceptsPath).flatMap((f) => loadJsonArray(path.join(conceptsPath, f)))
    : loadJsonArray(conceptsPath);

  const conceptIds = new Set<string>();
  let conceptErrors = 0;

  for (const c of concepts) {
    if (!c.id || conceptIds.has(c.id)) {
      console.warn(`[Concept Duplicate/Missing ID] ${c.id}`);
      conceptErrors++;
      continue;
    }
    conceptIds.add(c.id);

    const res = ConceptItemSchema.safeParse({
      id: c.id,
      term: c.term || '',
      category: c.category || 'General',
      parentId: c.parentId ?? null,
      summary: c.definition || c.summary || '',
      internals: c.explanation || c.internals || '',
      relatedTerms: c.relatedTerms || c.keyPoints || [],
    });

    if (!res.success) {
      console.error(`[Concept Validation Failed] ID: ${c.id}`, res.error.format());
      conceptErrors++;
    } else {
      totalValidated++;
    }
  }

  // 2. Validate Scenarios
  const scenariosPath = fs.existsSync(path.join(CONTENT_DIR, 'scenarios'))
    ? path.join(CONTENT_DIR, 'scenarios')
    : path.join(DATA_JSON_DIR, 'data_architecture.json');

  const scenarios = fs.statSync(scenariosPath).isDirectory()
    ? fs.readdirSync(scenariosPath).flatMap((f) => loadJsonArray(path.join(scenariosPath, f)))
    : loadJsonArray(scenariosPath);

  const scenarioIds = new Set<string>();
  let scenarioErrors = 0;

  for (const s of scenarios) {
    if (!s.id || scenarioIds.has(s.id)) {
      console.warn(`[Scenario Duplicate/Missing ID] ${s.id}`);
      scenarioErrors++;
      continue;
    }
    scenarioIds.add(s.id);

    const res = ScenarioItemSchema.safeParse({
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

    if (!res.success) {
      console.error(`[Scenario Validation Failed] ID: ${s.id}`, res.error.format());
      scenarioErrors++;
    } else {
      totalValidated++;
    }
  }

  // 3. Validate QA items
  const qaFiles = ['questions_unified_cleaned.json', 'questions.json'];
  const qaIds = new Set<string>();
  let qaErrors = 0;

  for (const f of qaFiles) {
    const p = path.join(DATA_JSON_DIR, f);
    const qList = loadJsonArray(p);
    for (const q of qList) {
      if (!q.id || qaIds.has(q.id)) continue;
      qaIds.add(q.id);

      const res = QaItemSchema.safeParse({
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

      if (!res.success) {
        console.error(`[QA Validation Failed] ID: ${q.id}`, res.error.format());
        qaErrors++;
      } else {
        totalValidated++;
      }
    }
  }

  console.log(`Validation Results:`);
  console.log(`- Concepts: ${concepts.length} checked, ${conceptErrors} errors`);
  console.log(`- Scenarios: ${scenarios.length} checked, ${scenarioErrors} errors`);
  console.log(`- QA Items: ${qaIds.size} checked, ${qaErrors} errors`);
  console.log(`- Total Valid Assets: ${totalValidated}`);

  if (conceptErrors > 10 || scenarioErrors > 10 || qaErrors > 10) {
    console.error('Too many validation errors detected!');
    process.exit(1);
  }

  console.log('✓ Content validation passed!');
}

runValidation();
