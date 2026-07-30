/**
 * run_tests.js  — Unit + Component test orchestrator
 * ─────────────────────────────────────────────────────────────────────────────
 * Starts a local python3 HTTP server on port 8080, then runs every unit /
 * component suite in sequence.  Fails fast on the first failing suite.
 *
 * Usage:
 *   npm test               — unit + component suites  (this file)
 *   npm run test:e2e       — Puppeteer browser suites  (test_e2e_puppeteer.js)
 *   npm run test:snapshot  — golden-file shape check   (test_snapshot.js)
 *   npm run test:all       — everything in one shot
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { spawn } = require('child_process');
const http      = require('http');

console.log('🚀 Initializing test server on port 8080 …');

const serverProcess = spawn('python3', ['-m', 'http.server', '8080'], {
  stdio: 'ignore',
  detached: true
});
serverProcess.unref();

// ─── wait for server ──────────────────────────────────────────────────────────
let pollAttempts = 0;
const MAX_ATTEMPTS = 30;

function checkServer() {
  return new Promise(resolve => {
    const req = http.get('http://127.0.0.1:8080', () => resolve(true));
    req.on('error', () => resolve(false));
  });
}

async function waitForServer() {
  while (pollAttempts < MAX_ATTEMPTS) {
    pollAttempts++;
    if (await checkServer()) {
      console.log('✅ Server is up on port 8080.\n');
      return true;
    }
    await new Promise(r => setTimeout(r, 300));
  }
  console.warn('⚠️ HTTP server on port 8080 not detected (unit tests will still proceed).');
  return false;
}

// ─── test suites ─────────────────────────────────────────────────────────────
//
//  ORDER MATTERS — run fast/cheap tests first so failures are caught early.
//
const UNIT_SUITES = [
  // ① Pure source-level regression guards (fastest — no JSDOM runtime)
  'tests/test_regression_guard.js',
  'tests/test_data_service.js',

  // ② Dataset shape snapshot
  'tests/test_snapshot.js',

  // ③ Static / layout audits
  'tests/test_layout_scroll.js',
  'tests/test_search_theme.js',

  // ④ Deep runtime integrity audit (loads all DBs + app.js into JSDOM)
  'tests/test_audit.js',

  // ⑤ Component rendering tests (full JSDOM init with datasets)
  'tests/test_components.js',

  // ⑥ Comprehensive QA audit (JSDOM)
  'tests/test_qa_comprehensive_audit.js',

  // ⑦ Feature-level JSDOM integration suites
  'tests/test_dom.js',
  'tests/test_portal.js',
  'tests/test_cheatsheet.js',
  'tests/test_concepts.js',
  'tests/test_gcc.js',
  'tests/test_sparksql.js',
  'tests/test_sidebar.js',
  'tests/test_architecture.js',
  'tests/test_dashboard.js',
  'tests/test_modern_stack.js',
  'tests/test_learning_os.js'
];

// ─── sequential runner ────────────────────────────────────────────────────────
let currentIndex = 0;
const startTime  = Date.now();

function runNextSuite() {
  if (currentIndex >= UNIT_SUITES.length) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n🎉 ALL ${UNIT_SUITES.length} SUITES PASSED in ${elapsed}s`);
    console.log('\nTo run e2e browser tests:\n  npm run test:e2e\n');
    cleanupAndExit(0);
    return;
  }

  const suite = UNIT_SUITES[currentIndex];
  const label = `[${currentIndex + 1}/${UNIT_SUITES.length}] ${suite}`;
  console.log(`\n=== ${label} ===`);

  const proc = spawn('node', [suite], { stdio: 'inherit' });

  proc.on('close', code => {
    if (code !== 0) {
      console.error(`\n❌ Suite failed: ${suite}  (exit ${code})`);
      cleanupAndExit(code);
    } else {
      currentIndex++;
      runNextSuite();
    }
  });
}

function cleanupAndExit(code) {
  console.log('🧹 Cleaning up server …');
  try {
    if (serverProcess.pid) {
      process.kill(-serverProcess.pid, 'SIGTERM');
    }
  } catch { /* already dead */ }

  spawn('pkill', ['-f', 'python3 -m http.server 8080']).on('close', () => {
    process.exit(code);
  });
}

// ─── boot ─────────────────────────────────────────────────────────────────────
waitForServer().then(() => runNextSuite());
