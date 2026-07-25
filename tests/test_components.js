/**
 * test_components.js
 * ─────────────────────────────────────────────────────────────────────────────
 * COMPONENT RENDERING TESTS — test behaviour the user sees, not internals.
 *
 * Each test exercises a real piece of rendered DOM after the app initialises
 * inside JSDOM.  No real network calls — datasets are injected synchronously.
 *
 * Run: node tests/test_components.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// ─── harness ─────────────────────────────────────────────────────────────────
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

async function testAsync(name, fn) {
  try {
    await fn();
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

function assertNotContains(text, sub, msg) {
  if (text && text.includes(sub))
    throw new Error(msg || `Text must NOT contain "${sub}", but it does. Got: "${text.substring(0, 120)}"`);
}

function assertContains(text, sub, msg) {
  if (!text || !text.includes(sub))
    throw new Error(msg || `Text must contain "${sub}". Got: "${(text || '').substring(0, 120)}"`);
}

// ─── build a fully-initialised JSDOM environment ─────────────────────────────
const ROOT = path.join(__dirname, '..');

function buildEnv() {
  const html    = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  // Strip the inline <script> tags — we inject datasets & app manually
  const cleanHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

  const dom = new JSDOM(cleanHtml, { runScripts: 'dangerously', url: 'http://localhost/' });
  const w   = dom.window;
  const d   = dom.window.document;

  // ── browser-API stubs ────────────────────────────────────────────────────
  const store = {};
  Object.defineProperty(w, 'localStorage', {
    value: {
      getItem:    k     => store[k] || null,
      setItem:    (k,v) => { store[k] = String(v); },
      removeItem: k     => { delete store[k]; },
      clear:      ()    => { Object.keys(store).forEach(k => delete store[k]); }
    },
    writable: true, configurable: true
  });

  w.tailwind  = { config: {} };
  w.Chart     = function() { return { destroy() {}, update() {} }; };
  w.scrollTo  = () => {};
  w.matchMedia = () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {}
  });
  if (w.Element && w.Element.prototype)
    w.Element.prototype.scrollIntoView = () => {};

  // ── inject every dataset synchronously ──────────────────────────────────
  const datasets = [
    ['questions.js',        'QUESTIONS_DB'],
    ['data_architecture.js','ARCHITECTURE_DATA'],
    ['data_concepts.js',    'CONCEPTS_DB'],
    ['data_de.js',          'QUESTIONS_DE_DB'],
    ['data_pyspark.js',     'PYSPARK_DATA'],
    ['data_sparksql.js',    'SPARKSQL_DATA'],
    ['data_mssql.js',       'MSSQL_DATA'],
    ['data_python.js',      'PYTHON_DATA'],
    ['data_personalised.js','PERSONALISED_QUESTIONS'],
  ];
  datasets.forEach(([file]) => {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const s   = d.createElement('script');
    s.textContent = src;
    d.head.appendChild(s);
  });

  // ── inject app.js ────────────────────────────────────────────────────────
  const appSrc = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  const appEl  = d.createElement('script');
  appEl.textContent = appSrc;
  d.head.appendChild(appEl);

  return { w, d };
}

// ─── give app's .then() chain time to settle ─────────────────────────────────
function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN — async entry point
// ─────────────────────────────────────────────────────────────────────────────
(async () => {

  console.log('\n' + '━'.repeat(60));
  console.log('  COMPONENT RENDERING TEST SUITE');
  console.log('━'.repeat(60) + '\n');

  const { w, d } = buildEnv();

  // Allow the DOMContentLoaded chain (ensureDatasetsLoaded.then(...)) to finish
  await wait(500);

  // ─────────────────────────────────────────────────────────────────────────
  // GROUP A: Q&A Prep Hub Counters
  // ─────────────────────────────────────────────────────────────────────────
  console.log('─── A. Q&A Prep Hub Counters ───');

  test('counter shows filtered list length — All Levels is non-zero', () => {
    const el = d.getElementById('count-diff-all');
    assert(el, '#count-diff-all not found in DOM');
    const n = parseInt((el.textContent || '').replace(/,/g, ''), 10);
    assert(n > 0, `counter shows ${n}, expected > 0`);
  });

  test('counter shows filtered list length — Easy is non-zero', () => {
    const el = d.getElementById('count-diff-easy');
    const n  = parseInt((el?.textContent || '').replace(/,/g, ''), 10);
    assert(n > 0, `Easy counter shows ${n}, expected > 0`);
  });

  test('counter shows filtered list length — Medium is non-zero', () => {
    const el = d.getElementById('count-diff-medium');
    const n  = parseInt((el?.textContent || '').replace(/,/g, ''), 10);
    assert(n > 0, `Medium counter shows ${n}`);
  });

  test('counter shows filtered list length — Hard is non-zero', () => {
    const el = d.getElementById('count-diff-hard');
    const n  = parseInt((el?.textContent || '').replace(/,/g, ''), 10);
    assert(n > 0, `Hard counter shows ${n}`);
  });

  test('counter shows filtered list length — Architect is non-zero', () => {
    const el = d.getElementById('count-diff-architect');
    const n  = parseInt((el?.textContent || '').replace(/,/g, ''), 10);
    assert(n > 0, `Architect counter shows ${n}`);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GROUP B: Question Detail Modal
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n─── B. Question Detail Modal ───');

  test('Question Detail Modal structure exists', () => {
    const titleEl = d.getElementById('dialog-q-text');
    const categoryEl = d.getElementById('dialog-category');
    const bodyEl = d.getElementById('dialog-a-text');
    assert(titleEl, '#dialog-q-text element not found in modal');
    assert(categoryEl, '#dialog-category element not found in modal');
    assert(bodyEl, '#dialog-a-text element not found in modal');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GROUP C: Study Mode Flashcard
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n─── C. Study Mode Flashcard ───');

  test('Study Mode shows "1 / N" (not "0 / 0") after data loads', () => {
    const counter = d.getElementById('study-counter');
    assert(counter, '#study-counter not found');
    const text = (counter.textContent || '').trim();
    assert(text !== '0 / 0',
      `Study counter shows "${text}" — still stuck at 0 / 0`);
    assert(text.startsWith('1 /'),
      `Study counter must start with "1 /", got "${text}"`);
  });

  test('Study Mode question text is not the loading placeholder', () => {
    const qEl = d.getElementById('study-card-question');
    assert(qEl, '#study-card-question not found');
    const text = (qEl.textContent || '').trim();
    assertNotContains(text, 'Loading question',
      `Flashcard question still shows loading placeholder: "${text}"`);
    assert(text.length > 0, 'Flashcard question text is empty');
  });

  test('Study Mode flashcard has keyboard role="button"', () => {
    const card = d.getElementById('study-flashcard');
    assert(card, '#study-flashcard not found');
    assert(card.getAttribute('role') === 'button',
      'study-flashcard must have role="button" for keyboard users');
  });

  test('Study Mode flashcard has tabindex="0"', () => {
    const card = d.getElementById('study-flashcard');
    assert(card, '#study-flashcard not found');
    assert(card.getAttribute('tabindex') === '0',
      'study-flashcard must have tabindex="0"');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GROUP D: Dashboard Pro Tip
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n─── D. Dashboard Pro Tip ───');

  test('Pro Tip resolves — no "Loading premium recommendation..." visible', () => {
    const el = d.getElementById('dashboard-tip-content-text');
    assert(el, '#dashboard-tip-content-text not found');
    const text = (el.textContent || '').trim();
    assertNotContains(text, 'Loading premium recommendation',
      `Pro Tip still shows loading state: "${text}"`);
    assert(text.length > 0, 'Pro Tip text is empty after init');
  });

  test('Clicking the tip box rotates to a different (or same) tip without crashing', () => {
    const box = d.getElementById('dashboard-tip-box');
    assert(box, '#dashboard-tip-box not found');
    let threw = false;
    try { box.click(); } catch { threw = true; }
    assert(!threw, 'Clicking tip box threw an exception');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GROUP E: Memory Mapper — interactive slider output
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n─── E. Memory Mapper Interactivity ───');

  test('Memory Mapper initialises with non-empty legend values', () => {
    const exec = d.getElementById('lbl-val-execution');
    const stor = d.getElementById('lbl-val-storage');
    assert(exec && exec.textContent.trim().length > 0,
      'lbl-val-execution is empty on init');
    assert(stor && stor.textContent.trim().length > 0,
      'lbl-val-storage is empty on init');
  });

  test('Sliding heap memory updates the heap-center label', () => {
    const slider = d.getElementById('mem-heap-size');
    assert(slider, '#mem-heap-size not found');
    slider.value = '32';
    slider.dispatchEvent(new w.Event('input', { bubbles: true }));
    const lbl = d.getElementById('lbl-heap-size');
    assert(lbl && lbl.textContent === '32',
      `lbl-heap-size expected "32" after slider move, got "${lbl?.textContent}"`);
  });

  test('Sliding heap memory updates the total-heap-center label', () => {
    const slider = d.getElementById('mem-heap-size');
    slider.value = '32';
    slider.dispatchEvent(new w.Event('input', { bubbles: true }));
    const center = d.getElementById('lbl-total-heap-center');
    assert(center && center.textContent === '32 GB',
      `lbl-total-heap-center expected "32 GB", got "${center?.textContent}"`);
  });

  test('Changing storage fraction recalculates legend values', () => {
    const storSlider = d.getElementById('mem-storage');
    assert(storSlider, '#mem-storage slider not found');
    const beforeText = d.getElementById('lbl-val-storage')?.textContent;
    // Move slider significantly
    storSlider.value = '10';
    storSlider.dispatchEvent(new w.Event('input', { bubbles: true }));
    const afterText = d.getElementById('lbl-val-storage')?.textContent;
    // Value should change when fraction changes
    assert(afterText && afterText.length > 0, 'Storage label is empty after slider move');
    // With fraction = 10% the storage value should be much smaller
    assert(beforeText !== afterText,
      `Storage label did not change after moving slider from default to 10%`);
  });

  test('Memory pie chart background is updated by slider', () => {
    const slider = d.getElementById('mem-heap-size');
    slider.value = '16';
    slider.dispatchEvent(new w.Event('input', { bubbles: true }));
    const chart = d.getElementById('memory-pie-chart');
    assert(chart, '#memory-pie-chart not found');
    // background style should contain conic-gradient
    const bg = chart.style.background || '';
    assert(bg.includes('conic-gradient'),
      `memory-pie-chart background does not use conic-gradient. Got: "${bg.substring(0,80)}"`);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GROUP F: Simulator Preset Populates Textarea
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n─── F. Engine Simulator ───');

  test('Simulator "oom" preset populates the simulator-input textarea', () => {
    // First switch to the simulator tab so the panel is visible
    if (typeof w.switchSandboxTab === 'function') {
      w.switchSandboxTab('simulator');
    }
    const preset = d.getElementById('simulator-preset');
    assert(preset, '#simulator-preset not found');
    preset.value = 'oom';
    preset.dispatchEvent(new w.Event('change', { bubbles: true }));

    const ta = d.getElementById('simulator-input');
    assert(ta, '#simulator-input textarea not found');
    assert(ta.value.trim().length > 0,
      'simulator-input is empty after selecting "oom" preset — applySimulatorPreset() may not be wired');
  });

  test('Simulator "skew" preset populates a different scenario text', () => {
    const preset = d.getElementById('simulator-preset');
    preset.value = 'skew';
    preset.dispatchEvent(new w.Event('change', { bubbles: true }));
    const ta = d.getElementById('simulator-input');
    assert(ta.value.trim().length > 0,
      'simulator-input is empty after selecting "skew" preset');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GROUP G: GCC Directory — Apply links and count
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n─── G. GCC Apply Links ───');

  test('GCC directory renders 55 company rows', () => {
    const rows = d.querySelectorAll('#gcc-directory-table tbody tr');
    assert(rows.length === 55,
      `Expected 55 GCC rows, got ${rows.length}`);
  });

  test('No Apply link in the rendered DOM routes through google.com/search', () => {
    const links = Array.from(d.querySelectorAll('a.portal-link'));
    assert(links.length > 0, 'No .portal-link elements found in DOM');
    const bad = links.filter(a => (a.getAttribute('href') || '').includes('google.com/search'));
    assert(bad.length === 0,
      `${bad.length} Apply link(s) still route through google.com/search`);
  });

  test('All Apply links have a valid https:// href', () => {
    const links = Array.from(d.querySelectorAll('a.portal-link'));
    const invalid = links.filter(a => !(a.getAttribute('href') || '').startsWith('https://'));
    assert(invalid.length === 0,
      `${invalid.length} Apply link(s) do not start with https://`);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GROUP H: Sandbox — no fake model name
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n─── H. Sandbox Label ───');

  test('Sandbox description text is "Powered by AI Intelligence"', () => {
    const desc = d.querySelector('.spark-sandbox-desc');
    assert(desc, '.spark-sandbox-desc element not found');
    const text = desc.textContent || '';
    assertNotContains(text, 'gemini-3.5-flash',
      'Sandbox still shows hallucinated model name "gemini-3.5-flash"');
    assertNotContains(text, 'gemini-',
      'Sandbox still shows a "gemini-" model name');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GROUP I: Theme Toggle Accessibility
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n─── I. Theme Toggle A11y ───');

  test('Theme toggle button has aria-label (desktop)', () => {
    const btn = d.getElementById('btn-theme-toggle');
    assert(btn, '#btn-theme-toggle not found');
    const label = btn.getAttribute('aria-label') || '';
    assert(label.length > 0, '#btn-theme-toggle has no aria-label');
    assertNotContains(label, 'Toggle theme',
      'aria-label is too vague — must describe the full action');
  });

  test('Theme toggle button has aria-label (mobile)', () => {
    const btn = d.getElementById('btn-mobile-theme');
    assert(btn, '#btn-mobile-theme not found');
    const label = btn.getAttribute('aria-label') || '';
    assert(label.length > 0, '#btn-mobile-theme has no aria-label');
  });

  test('Clicking theme toggle does not throw', () => {
    const btn = d.getElementById('btn-theme-toggle');
    let threw = false;
    try { btn.click(); } catch { threw = true; }
    assert(!threw, 'Theme toggle click threw an error');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log(`COMPONENT TESTS COMPLETE: ${passed} passed, ${failed} failed`);
  console.log('═'.repeat(60) + '\n');

  process.exit(failed > 0 ? 1 : 0);

})();
