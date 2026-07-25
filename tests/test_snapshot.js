/**
 * test_snapshot.js
 * ─────────────────────────────────────────────────────────────────────────────
 * REGRESSION SNAPSHOT VALIDATOR
 *
 * Reads tests/__snapshots__/dataset_schema.json (the locked-in shape) and
 * asserts that every dataset and piece of HTML still conforms to it.
 *
 * If a dataset shrinks, a category disappears, a required field is removed,
 * or marketing copy drifts — this test fails immediately.
 *
 * Update the snapshot intentionally with:
 *   node tests/test_snapshot.js --update
 *
 * Run normally:
 *   node tests/test_snapshot.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT          = path.join(__dirname, '..');
const SNAPSHOT_PATH = path.join(__dirname, '__snapshots__', 'dataset_schema.json');
const UPDATE_MODE   = process.argv.includes('--update');

// ─── tiny harness ─────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    process.stdout.write(`  ✅ ${name}\n`);
  } catch (e) {
    failed++;
    process.stderr.write(`  ❌ ${name}\n     → ${e.message}\n`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

// ─── load a dataset file into an isolated scope ───────────────────────────────
function loadDataset(file, globalName) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const g   = {};
  (new Function('window', src))(g);
  return g[globalName];
}

// ─── optionally update snapshot ───────────────────────────────────────────────
if (UPDATE_MODE) {
  console.log('\n⚡ UPDATE MODE: re-generating snapshot …\n');

  const g = {};
  const load = (file, name) => {
    const fn = new Function('window', fs.readFileSync(path.join(ROOT, file), 'utf8'));
    fn(g);
    return g[name];
  };

  const qDb   = load('questions.js',        'QUESTIONS_DB');
  const arch  = load('data_architecture.js','ARCHITECTURE_DATA');
  const de    = load('data_de.js',          'QUESTIONS_DE_DB');
  const py    = load('data_personalised.js','PERSONALISED_QUESTIONS');
  const pySp  = load('data_pyspark.js',     'PYSPARK_DATA');
  const html  = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const gccRows = (html.match(/<tr data-risk=/g) || []).length;

  const snap = {
    _description: 'Dataset shape snapshot. If this drifts a regression test fails.',
    _generated:   new Date().toISOString(),
    questions_js: {
      count:           qDb.length,
      required_fields: ['id','question','answer','category','difficulty','niche'],
      sample_id_prefix: qDb[0].id.split('-')[0],
      categories:      [...new Set(qDb.map(q => q.category))].sort()
    },
    data_architecture_js: {
      count:           arch.length,
      required_fields: ['id','question','answer']
    },
    data_de_js: {
      count:           de.length,
      required_fields: ['id','question','answer']
    },
    data_personalised_js: { count: py.length },
    data_pyspark_js:      { count: pySp.length },
    gcc_directory: {
      expected_row_count: gccRows,
      marketing_copy:     '55 flagship Global Capability Centers',
      footer_copy:        '2,600+ Questions'
    },
    study_mode: {
      expected_initial_counter_pattern: '1 / N',
      placeholder_must_not_appear:       'Loading question...'
    },
    sandbox: {
      hallucinated_model_names_banned: ['gemini-3.5-flash','gemini-pro','gpt-4','claude-3']
    }
  };

  fs.mkdirSync(path.join(__dirname, '__snapshots__'), { recursive: true });
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snap, null, 2));
  console.log(`✅ Snapshot written to ${SNAPSHOT_PATH}`);
  console.log(`   questions: ${snap.questions_js.count}`);
  console.log(`   architecture: ${snap.data_architecture_js.count}`);
  console.log(`   de: ${snap.data_de_js.count}`);
  console.log(`   gcc rows: ${snap.gcc_directory.expected_row_count}\n`);
  process.exit(0);
}

// ─── normal validation mode ───────────────────────────────────────────────────
console.log('\n' + '━'.repeat(60));
console.log('  SNAPSHOT REGRESSION VALIDATOR');
console.log('  (run with --update to refresh the golden file)');
console.log('━'.repeat(60) + '\n');

if (!fs.existsSync(SNAPSHOT_PATH)) {
  console.error('❌ Snapshot file not found:', SNAPSHOT_PATH);
  console.error('   Run: node tests/test_snapshot.js --update  to create it.');
  process.exit(1);
}

const snap = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const app  = fs.readFileSync(path.join(ROOT, 'app.js'),     'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// 1. questions.js schema
// ─────────────────────────────────────────────────────────────────────────────
console.log('─── 1. questions.js ───');

test(`count matches snapshot (${snap.questions_js.count})`, () => {
  const db = loadDataset('questions.js', 'QUESTIONS_DB');
  assert(db.length === snap.questions_js.count,
    `Expected ${snap.questions_js.count} questions, got ${db.length}. ` +
    `Update snapshot if intentional: node tests/test_snapshot.js --update`);
});

test('all required fields present on every question', () => {
  const db     = loadDataset('questions.js', 'QUESTIONS_DB');
  const fields = snap.questions_js.required_fields;
  const bad    = db.filter(q => fields.some(f => !q[f] || String(q[f]).trim() === ''));
  assert(bad.length === 0,
    `${bad.length} question(s) missing required field(s): ` +
    bad.slice(0,3).map(q => `id=${q.id}`).join(', '));
});

test('category set matches snapshot (no new/deleted categories)', () => {
  const db         = loadDataset('questions.js', 'QUESTIONS_DB');
  const liveCats   = [...new Set(db.map(q => q.category))].sort().join(',');
  const snapCats   = snap.questions_js.categories.sort().join(',');
  assert(liveCats === snapCats,
    `Category set drifted.\nExpected: ${snapCats}\nGot:      ${liveCats}\n` +
    `Update snapshot if intentional: node tests/test_snapshot.js --update`);
});

test('no duplicate question IDs', () => {
  const db  = loadDataset('questions.js', 'QUESTIONS_DB');
  const ids = db.map(q => q.id);
  const set = new Set(ids);
  assert(set.size === ids.length,
    `${ids.length - set.size} duplicate ID(s) detected`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. data_architecture.js schema
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n─── 2. data_architecture.js ───');

test(`count matches snapshot (${snap.data_architecture_js.count})`, () => {
  const db = loadDataset('data_architecture.js', 'ARCHITECTURE_DATA');
  assert(db.length === snap.data_architecture_js.count,
    `Expected ${snap.data_architecture_js.count}, got ${db.length}`);
});

test('required fields present on architecture records', () => {
  const db     = loadDataset('data_architecture.js', 'ARCHITECTURE_DATA');
  const fields = snap.data_architecture_js.required_fields;
  const bad    = db.filter(q => fields.some(f => !q[f]));
  assert(bad.length === 0,
    `${bad.length} architecture record(s) missing required fields`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. data_de.js schema
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n─── 3. data_de.js ───');

test(`count matches snapshot (${snap.data_de_js.count})`, () => {
  const db = loadDataset('data_de.js', 'QUESTIONS_DE_DB');
  assert(db.length === snap.data_de_js.count,
    `Expected ${snap.data_de_js.count}, got ${db.length}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. data_personalised.js
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n─── 4. data_personalised.js ───');

test(`count matches snapshot (${snap.data_personalised_js.count})`, () => {
  const db = loadDataset('data_personalised.js', 'PERSONALISED_QUESTIONS');
  assert(db.length === snap.data_personalised_js.count,
    `Expected ${snap.data_personalised_js.count} personalised records, got ${db.length}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. data_pyspark.js
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n─── 5. data_pyspark.js ───');

test(`count matches snapshot (${snap.data_pyspark_js.count})`, () => {
  const db = loadDataset('data_pyspark.js', 'PYSPARK_DATA');
  assert(db.length === snap.data_pyspark_js.count,
    `Expected ${snap.data_pyspark_js.count} PySpark levels, got ${db.length}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. GCC directory — HTML source of truth
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n─── 6. GCC Directory ───');

test(`HTML contains ${snap.gcc_directory.expected_row_count} company rows`, () => {
  const rows = (html.match(/<tr data-risk=/g) || []).length;
  assert(rows === snap.gcc_directory.expected_row_count,
    `Expected ${snap.gcc_directory.expected_row_count} rows, found ${rows}`);
});

test('marketing copy matches snapshot', () => {
  assert(html.includes(snap.gcc_directory.marketing_copy),
    `HTML must contain: "${snap.gcc_directory.marketing_copy}"`);
});

test('footer copy matches snapshot', () => {
  assert(html.includes(snap.gcc_directory.footer_copy),
    `HTML must contain footer copy: "${snap.gcc_directory.footer_copy}"`);
});

test('no Apply links route through google.com/search', () => {
  const bad = (html.match(/google\.com\/search\?q=https/g) || []).length;
  assert(bad === 0, `${bad} Apply link(s) still route through Google search`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Sandbox — hallucinated model names
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n─── 7. Sandbox Model Name ───');

snap.sandbox.hallucinated_model_names_banned.forEach(name => {
  test(`"${name}" does not appear in index.html`, () => {
    assert(!html.includes(name), `index.html contains banned model name: "${name}"`);
  });
  test(`"${name}" does not appear in app.js`, () => {
    assert(!app.includes(name), `app.js contains banned model name: "${name}"`);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Study Mode guard strings
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n─── 8. Study Mode Copy Guards ───');

test('placeholder text is not baked into HTML as permanent copy', () => {
  // The placeholder "Loading question..." may appear ONCE in the initial HTML
  // but must not appear more than that (would mean a duplicate static copy)
  const occurrences = (html.match(/Loading question\.\.\./g) || []).length;
  assert(occurrences <= 1,
    `"Loading question..." appears ${occurrences} times — possible duplicate static copy`);
});

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(60));
console.log(`SNAPSHOT VALIDATION: ${passed} passed, ${failed} failed`);
console.log('═'.repeat(60) + '\n');

if (failed > 0) {
  console.error('❌ Snapshot drift detected. Fix the source, or if the change\n' +
                '   is intentional run:  node tests/test_snapshot.js --update\n');
  process.exit(1);
} else {
  console.log('✅ Dataset shapes match the golden snapshot.\n');
  process.exit(0);
}
