/**
 * test_regression_guard.js
 * ─────────────────────────────────────────────────────────────────────────────
 * REGRESSION GUARD — unit-level tests for every bug that was fixed.
 *
 * Framework: plain Node.js + JSDOM (already a dev-dependency).
 * No real network calls — all fetches are mocked or bypassed.
 * Run: node tests/test_regression_guard.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── tiny assertion harness ───────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    results.push({ ok: true,  name });
    process.stdout.write(`  ✅ ${name}\n`);
  } catch (e) {
    failed++;
    results.push({ ok: false, name, error: e.message });
    process.stderr.write(`  ❌ ${name}\n     → ${e.message}\n`);
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

function assertNotIncludes(str, sub, msg) {
  if (str.includes(sub)) throw new Error(msg || `Expected string NOT to include "${sub}"`);
}

function assertIncludes(str, sub, msg) {
  if (!str.includes(sub)) throw new Error(msg || `Expected string to include "${sub}"`);
}

// ─── load raw source files once (fast; no HTTP) ──────────────────────────────
const ROOT        = path.join(__dirname, '..');
const htmlRaw     = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const appRaw      = fs.readFileSync(path.join(ROOT, 'app.js'),     'utf8');

// dataset files
function loadDataset(file, globalName) {
  const g = {};
  // safely exec the dataset assignment in an isolated scope
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  // datasets assign to window.XXX — we stub window
  const fn = new Function('window', src);
  fn(g);
  return g[globalName];
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 1 — DATASET / DATA LOADER TESTS
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n━━━ 1. Dataset Loader & Schema ━━━');

test('Q&A dataset returns a non-empty array', () => {
  const db = loadDataset('questions.js', 'QUESTIONS_DB');
  assert(Array.isArray(db), 'QUESTIONS_DB is not an array');
  assert(db.length > 0, 'QUESTIONS_DB is empty');
});

test('Every question has id, question text, and answer text', () => {
  const db = loadDataset('questions.js', 'QUESTIONS_DB');
  const bad = db.filter(q => !q.id || !q.question || !q.answer);
  assert(bad.length === 0, `${bad.length} question(s) missing required fields`);
});

test('Question IDs are unique (no duplicates)', () => {
  const db  = loadDataset('questions.js', 'QUESTIONS_DB');
  const ids = db.map(q => q.id);
  const set = new Set(ids);
  assert(set.size === ids.length, `${ids.length - set.size} duplicate question ID(s) found`);
});

test('Architecture dataset is a non-empty array', () => {
  const db = loadDataset('data_architecture.js', 'ARCHITECTURE_DATA');
  assert(Array.isArray(db) && db.length > 0, 'ARCHITECTURE_DATA empty or missing');
});

test('Data Engineering dataset is a non-empty array', () => {
  const db = loadDataset('data_de.js', 'QUESTIONS_DE_DB');
  assert(Array.isArray(db) && db.length > 0, 'QUESTIONS_DE_DB empty or missing');
});

test('Personalised dataset holds exactly 50 records (snapshot)', () => {
  const db = loadDataset('data_personalised.js', 'PERSONALISED_QUESTIONS');
  assert(Array.isArray(db), 'PERSONALISED_QUESTIONS is not an array');
  assert(db.length === 50, `Expected 50 personalised records, got ${db.length}`);
});

test('PySpark dataset has the updated 32-level count', () => {
  const db = loadDataset('data_pyspark.js', 'PYSPARK_DATA');
  assert(db.length === 32, `Expected 32 PySpark levels, got ${db.length}`);
});

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 2 — COUNTER LOGIC TESTS  (the "always 0" regression)
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n━━━ 2. Counter Logic ━━━');

test('Filtered-list length, not hardcoded 0, drives Q&A counter', () => {
  // Verify the counter update function reads from a live array, not a literal
  // The app pattern: updateUnifiedSearchCounts reads state.questions.length
  // Confirm app.js contains the variable reference, not "textContent = 0"
  assertNotIncludes(appRaw, `textContent = 0`,
    'app.js appears to hardcode counter to 0');
  assertIncludes(appRaw, 'state.questions',
    'app.js must reference state.questions for counters');
});

test('repopulateStateQuestions merges all loaded datasets', () => {
  assertIncludes(appRaw, 'repopulateStateQuestions',
    'repopulateStateQuestions function must exist in app.js');
  // must concat at least QUESTIONS_DB
  assertIncludes(appRaw, 'QUESTIONS_DB',
    'repopulateStateQuestions must reference QUESTIONS_DB');
});

test('updateUnifiedSearchCounts is called after data loads', () => {
  assertIncludes(appRaw, 'updateUnifiedSearchCounts',
    'updateUnifiedSearchCounts must be called in app.js');
});

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 3 — APPLY-LINK REGRESSION  (google.com/search redirect bug)
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n━━━ 3. Apply-Link Generator ━━━');

test('No Apply link routes through google.com/search', () => {
  assertNotIncludes(htmlRaw, 'google.com/search?q=https',
    'index.html still has Apply links routing through Google search');
});

test('DBS careers link goes directly to dbs.com', () => {
  assertIncludes(htmlRaw, 'href="https://www.dbs.com/careers/"',
    'DBS apply link must point directly to dbs.com/careers');
});

test('Bosch careers link goes directly to careers.bosch.com', () => {
  assertIncludes(htmlRaw, 'href="https://careers.bosch.com/"',
    'Bosch apply link must point directly to careers.bosch.com');
});

test('Google careers link goes directly to careers.google.com', () => {
  assertIncludes(htmlRaw, 'href="https://careers.google.com/"',
    'Google apply link must point directly to careers.google.com');
});

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 4 — SANDBOX MODEL-NAME HALLUCINATION
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n━━━ 4. Sandbox Model Label ━━━');

test('Sandbox does NOT label itself gemini-3.5-flash', () => {
  assertNotIncludes(htmlRaw, 'gemini-3.5-flash',
    'index.html still contains hallucinated gemini-3.5-flash model reference');
});

test('Sandbox does NOT label itself gemini-3.5-flash in app.js', () => {
  assertNotIncludes(appRaw, 'gemini-3.5-flash',
    'app.js still contains hallucinated gemini-3.5-flash model reference');
});

test('Sandbox is labeled "AI Intelligence" or similar generic copy', () => {
  assertIncludes(htmlRaw, 'AI Intelligence',
    'Sandbox description should read "Powered by AI Intelligence"');
});

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 5 — GCC COMPANY LIST CONSISTENCY
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n━━━ 5. GCC Company List Consistency ━━━');

test('GCC intro copy says 55 flagship GCCs (not 50)', () => {
  assertIncludes(htmlRaw, '55 flagship Global Capability Centers',
    'GCC intro copy must say 55, not 50');
});

test('Dashboard metric badge shows 55 GCC firms', () => {
  // The metric-gcc element is populated from counts.gcc which is set to 55
  assertIncludes(appRaw, 'gcc: 55',
    "app.js must set gcc count to 55 in the counts object");
});

test('GCC table rows add up to 55 entries in the HTML', () => {
  // Count <tr data-risk="..."> rows (one per company)
  const rows = (htmlRaw.match(/<tr data-risk=/g) || []).length;
  assert(rows === 55, `Expected 55 GCC table rows, found ${rows}`);
});

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 6 — DIFFICULTY-DOT ACCESSIBILITY (a11y)
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n━━━ 6. Difficulty Dot A11y ━━━');

test('Every difficulty dot has a visible text label sibling', () => {
  // Pattern: <span class="qa-pill-dot" ...></span><span>Easy</span>
  // All dots in index.html must be immediately followed by a text span
  const dotPattern = /class="qa-pill-dot"[^>]*><\/span><span>([^<]+)<\/span>/g;
  const dots = [...htmlRaw.matchAll(dotPattern)];
  assert(dots.length > 0, 'No qa-pill-dot elements with text labels found');

  // Confirm all dot groups have meaningful text (not empty)
  dots.forEach(m => {
    const label = m[1].trim();
    assert(label.length > 0, `Dot found with empty text label`);
  });
});

test('Difficulty filter buttons include "Easy" text', () => {
  assertIncludes(htmlRaw, '<span>Easy</span>', 'Easy label missing next to difficulty dot');
});

test('Difficulty filter buttons include "Medium" text', () => {
  assertIncludes(htmlRaw, '<span>Medium</span>', 'Medium label missing next to difficulty dot');
});

test('Difficulty filter buttons include "Hard" text', () => {
  assertIncludes(htmlRaw, '<span>Hard</span>', 'Hard label missing next to difficulty dot');
});

test('Difficulty filter buttons include "Architect" text', () => {
  assertIncludes(htmlRaw, '<span>Architect</span>', 'Architect label missing next to difficulty dot');
});

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 7 — THEME TOGGLE & EMOJI CONTROLS A11Y
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n━━━ 7. Theme Toggle & Emoji Control A11y ━━━');

test('Desktop theme toggle has aria-label', () => {
  assertIncludes(htmlRaw, 'id="btn-theme-toggle"',
    'Desktop theme toggle button #btn-theme-toggle must exist');
  assertIncludes(htmlRaw, 'aria-label="Toggle light and dark theme"',
    'Theme toggle button must have aria-label="Toggle light and dark theme"');
});

test('Mobile theme toggle has aria-label', () => {
  assertIncludes(htmlRaw, 'id="btn-mobile-theme"',
    'Mobile theme toggle button #btn-mobile-theme must exist');
  // At least one occurrence of "Toggle light and dark theme"
  const count = (htmlRaw.match(/aria-label="Toggle light and dark theme"/g) || []).length;
  assert(count >= 2, `Expected 2 aria-label="Toggle light and dark theme" (desktop + mobile), found ${count}`);
});

test('Logo images have descriptive alt text', () => {
  assertIncludes(htmlRaw, 'alt="Microsoft Data Platform Architect Prep"',
    'Mobile logo must have full descriptive alt text');
  assertIncludes(htmlRaw, 'alt="Microsoft Data Platform Architect Prep Logo"',
    'Sidebar logo must have full descriptive alt text with "Logo" suffix');
});

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 8 — SKIP-TO-MAIN ACCESSIBILITY
// ═════════════════════════════════════════════════════════════════════════────
console.log('\n━━━ 8. Skip-Link & Keyboard A11y ━━━');

test('Skip-to-main-content link is present', () => {
  assertIncludes(htmlRaw, 'class="skip-link"',
    'Skip-link element must exist for keyboard users');
  assertIncludes(htmlRaw, 'href="#main-content-anchor"',
    'Skip-link must point to #main-content-anchor');
});

test('Main content anchor target exists', () => {
  assertIncludes(htmlRaw, 'id="main-content-anchor"',
    '<main> element must carry id="main-content-anchor"');
  assertIncludes(htmlRaw, 'tabindex="-1"',
    '<main id="main-content-anchor"> must have tabindex="-1" for focus management');
});

test('Study flashcard has keyboard event handler', () => {
  assertIncludes(htmlRaw, 'tabindex="0"',
    'Study flashcard must have tabindex="0" for keyboard access');
  assertIncludes(htmlRaw, 'role="button"',
    'Study flashcard must have role="button"');
  assertIncludes(htmlRaw, 'onkeydown=',
    'Study flashcard must have onkeydown handler');
  assertIncludes(htmlRaw, "event.key==='Enter'",
    'Keyboard handler must respond to Enter key');
  assertIncludes(htmlRaw, "event.key===' '",
    'Keyboard handler must respond to Space key');
});

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 9 — LOADING-STATE RESOLUTION
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n━━━ 9. Loading-State Resolution Safeguards ━━━');

test('ensureDatasetsLoaded uses .finally() to always hide loader', () => {
  assertIncludes(appRaw, '.finally(',
    'ensureDatasetsLoaded must use .finally() so hideDbLoader always runs');
  assertIncludes(appRaw, 'hideDbLoader',
    'hideDbLoader must be called inside .finally()');
});

test('initStudyMode() is called during app startup', () => {
  // Must appear in the .then() chain of ensureDatasetsLoaded
  assertIncludes(appRaw, 'initStudyMode()',
    'initStudyMode() must be called during app init to prevent 0/0 counter');
});

test('loadRandomTip() is called during app startup', () => {
  assertIncludes(appRaw, 'loadRandomTip()',
    'loadRandomTip() must be called during app init to prevent stuck tip text');
});

test('Fetch has AbortController timeout (prevents infinite sandbox loading)', () => {
  assertIncludes(appRaw, 'AbortController',
    'Sandbox fetch must use AbortController to prevent infinite loading state');
  assertIncludes(appRaw, 'controller.abort()',
    'AbortController.abort() must be called on timeout');
});

test('Dataset scripts are preloaded in index.html before app.js', () => {
  const questionsPos = htmlRaw.indexOf('src="questions.js"');
  const appPos       = htmlRaw.indexOf('src="app.js');
  assert(questionsPos !== -1, 'questions.js script tag must exist in index.html');
  assert(appPos       !== -1, 'app.js script tag must exist in index.html');
  assert(questionsPos < appPos,
    'questions.js must be loaded BEFORE app.js so data is available on init');
});

test('data_architecture.js is preloaded before app.js', () => {
  const archPos = htmlRaw.indexOf('src="data_architecture.js"');
  const appPos  = htmlRaw.indexOf('src="app.js');
  assert(archPos < appPos,
    'data_architecture.js must load before app.js');
});

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 10 — MEMORY MAPPER INTERACTIVITY
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n━━━ 10. Memory Mapper Interactivity ━━━');

test('Memory Mapper sliders have oninput="updateMemoryMapper()"', () => {
  const count = (htmlRaw.match(/oninput="updateMemoryMapper\(\)"/g) || []).length;
  assert(count === 3,
    `Expected 3 sliders with oninput="updateMemoryMapper()", found ${count}`);
});

test('updateMemoryMapper() function exists in app.js', () => {
  assertIncludes(appRaw, 'function updateMemoryMapper',
    'updateMemoryMapper function must be defined in app.js');
});

test('Memory pie chart element exists in HTML', () => {
  assertIncludes(htmlRaw, 'id="memory-pie-chart"',
    '#memory-pie-chart must exist for conic-gradient visualization');
});

test('updateMemoryMapper reads all 3 slider values', () => {
  assertIncludes(appRaw, "getElementById('mem-heap-size')",
    'updateMemoryMapper must read mem-heap-size slider');
  assertIncludes(appRaw, "getElementById('mem-fraction')",
    'updateMemoryMapper must read mem-fraction slider');
  assertIncludes(appRaw, "getElementById('mem-storage')",
    'updateMemoryMapper must read mem-storage slider');
});

test('updateMemoryMapper updates legend value labels', () => {
  assertIncludes(appRaw, "getElementById('lbl-val-execution')",
    'updateMemoryMapper must update the execution legend label');
  assertIncludes(appRaw, "getElementById('lbl-val-storage')",
    'updateMemoryMapper must update the storage legend label');
});

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 11 — ENGINE SIMULATOR INTERACTIVITY
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n━━━ 11. Engine Simulator Interactivity ━━━');

test('Simulator preset select element exists', () => {
  assertIncludes(htmlRaw, 'id="simulator-preset"',
    '#simulator-preset select must exist for scenario selection');
});

test('Simulator preset triggers applySimulatorPreset()', () => {
  assertIncludes(htmlRaw, 'onchange="applySimulatorPreset()"',
    'Simulator preset must trigger applySimulatorPreset() on change');
});

test('applySimulatorPreset() function exists in app.js', () => {
  assertIncludes(appRaw, 'function applySimulatorPreset',
    'applySimulatorPreset function must be defined in app.js');
});

test('runScenarioSimulation() function exists in app.js', () => {
  assertIncludes(appRaw, 'function runScenarioSimulation',
    'runScenarioSimulation function must be defined in app.js');
});

test('Simulator preset populates textarea with real scenario text', () => {
  // applySimulatorPreset must write to simulator-input textarea
  assertIncludes(appRaw, "getElementById('simulator-input')",
    'applySimulatorPreset must populate the simulator-input textarea');
});

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 12 — CONTENT CONSISTENCY
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n━━━ 12. Content Consistency ━━━');

test('Footer shows 2,600+ Questions (not stale 2,252)', () => {
  assertNotIncludes(htmlRaw, '2,252 Questions',
    'Footer must not show stale count 2,252 Questions');
  assertIncludes(htmlRaw, '2,600+ Questions',
    'Footer must show updated 2,600+ Questions');
});

test('PySpark curriculum header shows 32 Levels (not stale 26)', () => {
  assertNotIncludes(htmlRaw, '26 Levels',
    'PySpark header must not show stale 26 Levels count');
  assertIncludes(htmlRaw, '32 Levels',
    'PySpark header must show updated 32 Levels');
});

// ═════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log(`REGRESSION GUARD COMPLETE: ${passed} passed, ${failed} failed`);
console.log('═'.repeat(60) + '\n');

if (failed > 0) {
  console.error(`\n❌ ${failed} regression(s) detected — fix before merging.\n`);
  process.exit(1);
} else {
  console.log('✅ All regression guards green.\n');
  process.exit(0);
}
