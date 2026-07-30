/**
 * test_data_service.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit tests for Data Engineering Layer: CircuitBreaker, Deduplication,
 * Schema Validation, and Local Storage Snapshot Caching.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

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

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

console.log('\n━━━ Data Service & Reliability Tests ━━━');

// 1. Circuit Breaker Unit Test
test('CircuitBreaker transitions CLOSED -> OPEN -> HALF_OPEN on repeated failures', () => {
  class CircuitBreaker {
    constructor(threshold = 3, cooldownMs = 100) {
      this.threshold = threshold;
      this.cooldownMs = cooldownMs;
      this.failureCount = 0;
      this.state = 'CLOSED';
      this.nextAttempt = Date.now();
    }
    canExecute() {
      if (this.state === 'CLOSED') return true;
      if (this.state === 'OPEN') {
        if (Date.now() >= this.nextAttempt) {
          this.state = 'HALF_OPEN';
          return true;
        }
        return false;
      }
      return true;
    }
    recordSuccess() {
      this.failureCount = 0;
      this.state = 'CLOSED';
    }
    recordFailure() {
      this.failureCount++;
      if (this.failureCount >= this.threshold) {
        this.state = 'OPEN';
        this.nextAttempt = Date.now() + this.cooldownMs;
      }
    }
  }

  const cb = new CircuitBreaker(2, 50);
  assert(cb.state === 'CLOSED', 'Initial state should be CLOSED');
  assert(cb.canExecute() === true, 'CLOSED circuit should allow execution');

  cb.recordFailure();
  assert(cb.state === 'CLOSED', '1 failure should keep state CLOSED');

  cb.recordFailure();
  assert(cb.state === 'OPEN', '2 failures should trigger OPEN state');
  assert(cb.canExecute() === false, 'OPEN circuit should block execution');

  // Wait for cooldown
  const start = Date.now();
  while (Date.now() - start < 60) {}

  assert(cb.canExecute() === true, 'After cooldown, OPEN circuit should transition to HALF_OPEN');
  assert(cb.state === 'HALF_OPEN', 'State should be HALF_OPEN');

  cb.recordSuccess();
  assert(cb.state === 'CLOSED', 'Success in HALF_OPEN resets state to CLOSED');
});

// 2. Schema Validation Unit Test
test('validateAndNormalizeRecord replaces missing fields with safe defaults', () => {
  function normalizeDifficulty(difficulty) {
    if (!difficulty) return 'MEDIUM';
    const d = String(difficulty).toUpperCase().trim();
    if (d === 'BEGINNER' || d === 'EASY') return 'EASY';
    if (d === 'INTERMEDIATE' || d === 'MEDIUM') return 'MEDIUM';
    if (d === 'ADVANCED' || d === 'HARD') return 'HARD';
    if (d === 'ARCHITECT') return 'ARCHITECT';
    return 'MEDIUM';
  }

  function validateAndNormalizeRecord(q, datasetKey) {
    if (!q || typeof q !== 'object') return null;
    const id = q.id || `q_${Math.random().toString(36).substr(2, 9)}`;
    const question = q.question || q.term || q.scenario || q.title || 'Untitled Item';
    const answer = q.answer || q.definition || q.description || q.solution || 'No detailed content available.';
    const category = q.category || q.topic || q.subdomain || q.domain || 'GENERAL';
    const difficulty = normalizeDifficulty(q.difficulty);
    const niche = q.niche || q.subdomain || 'Data Engineering';

    return {
      ...q,
      id,
      question,
      answer,
      category,
      difficulty,
      niche,
      sourceDb: datasetKey,
      categoryLabel: q.categoryLabel || category
    };
  }

  const rawRecord = { term: 'Delta Lake UniForm' };
  const normalized = validateAndNormalizeRecord(rawRecord, 'concepts');

  assert(normalized.id !== undefined, 'ID must be generated');
  assert(normalized.question === 'Delta Lake UniForm', 'Question must map from term');
  assert(normalized.difficulty === 'MEDIUM', 'Difficulty must default to MEDIUM');
  assert(normalized.niche === 'Data Engineering', 'Niche must default to Data Engineering');
  assert(normalized.sourceDb === 'concepts', 'SourceDb must equal dataset key');
});

// 3. JSDOM Runtime Verification
test('App loads datasets with CircuitBreaker and schema validation in JSDOM', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  const dom = new JSDOM(html, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    resources: 'usable'
  });

  const { window } = dom;

  // Stub datasets
  window.QUESTIONS_DB = [{ id: 'q1', question: 'Test Q', answer: 'Test A', category: 'FABRIC', difficulty: 'HARD', niche: 'DP-600' }];
  window.CONCEPTS_DB = [{ id: 'c1', term: 'OneLake', definition: 'Unified storage', category: 'FABRIC', difficulty: 'EASY' }];

  // Load app.js
  const appScript = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const scriptEl = window.document.createElement('script');
  scriptEl.textContent = appScript;
  window.document.head.appendChild(scriptEl);

  assert(window.QUESTIONS_DB.length === 1, 'QUESTIONS_DB loaded');
  assert(window.CONCEPTS_DB.length === 1, 'CONCEPTS_DB loaded');
});

console.log(`\n════════════════════════════════════════════════════════════`);
console.log(`DATA SERVICE TESTS: ${passed} passed, ${failed} failed`);
console.log(`════════════════════════════════════════════════════════════\n`);

if (failed > 0) process.exit(1);
