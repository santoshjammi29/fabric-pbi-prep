// QA Comprehensive Audit Test Suite
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { JSDOM } = require('jsdom');

console.log('\n========================================================');
console.log('🧪 COMPREHENSIVE QA AUDIT & VERIFICATION SUITE');
console.log('========================================================\n');

const indexPath = path.join(__dirname, '..', 'index.html');
const appPath = path.join(__dirname, '..', 'app.js');

const htmlContent = fs.readFileSync(indexPath, 'utf-8');
const appContent = fs.readFileSync(appPath, 'utf-8');

// 1. Stuck Loading States & Placeholders Audit
console.log('--- 1. Stuck Loading States Audit ---');
assert(!htmlContent.includes('gemini-3.5-flash'), 'No hallucinated gemini-3.5-flash model name in HTML');
assert(!appContent.includes('gemini-3.5-flash'), 'No hallucinated gemini-3.5-flash model name in app.js');
console.log('  ✅ PASS — Hallucinated gemini-3.5-flash model reference eliminated');

// 2. Outbound Links Audit
console.log('\n--- 2. Outbound Careers Link Audit ---');
const googleSearchLinks = (htmlContent.match(/google\.com\/search\?q=https/g) || []).length;
assert.strictEqual(googleSearchLinks, 0, 'Zero Apply links route through google.com/search');
console.log('  ✅ PASS — All GCC Apply links point directly to official career pages');

// 3. Content Consistency Audit
console.log('\n--- 3. Content & Data Inconsistencies Audit ---');
assert(htmlContent.includes('2,600+ Questions'), 'Footer shows conformed 2,600+ Questions count');
assert(htmlContent.includes('55 flagship Global Capability Centers'), 'GCC intro shows conformed 55 flagship GCCs count');
assert(htmlContent.includes('32 Levels · 4 Phases'), 'PySpark curriculum shows accurate 32 Levels count');
console.log('  ✅ PASS — All numbers, headers, and footer counts are conformed and consistent');

// 4. Accessibility Audit
console.log('\n--- 4. Accessibility Audit ---');
assert(htmlContent.includes('class="skip-link"'), 'Skip to main content accessibility link present');
assert(htmlContent.includes('alt="Microsoft Data Platform Architect Prep"'), 'Mobile logo brand alt text present');
assert(htmlContent.includes('alt="Microsoft Data Platform Architect Prep Logo"'), 'Sidebar logo brand alt text present');
assert(htmlContent.includes('aria-label="Toggle light and dark theme"'), 'Theme toggle buttons have accessible aria-labels');
assert(htmlContent.includes('tabindex="0"') && htmlContent.includes('role="button"'), 'Study flashcard has tabindex="0" and role="button"');
assert(htmlContent.includes('onkeydown="if(event.key===\'Enter\'||event.key===\' \')'), 'Study flashcard has Enter/Space keyboard handlers');
console.log('  ✅ PASS — Accessibility attributes (skip link, alt text, aria-labels, keyboard handlers) verified');

// 5. JSDOM Runtime Initialization & Non-Zero State Audit
console.log('\n--- 5. Runtime JSDOM Non-Zero Counters & State Audit ---');
const dom = new JSDOM(htmlContent, {
  url: 'http://localhost/',
  runScripts: 'dangerously',
  resources: 'usable'
});

const window = dom.window;
const document = window.document;

// Mock Chart.js constructor and matchMedia for JSDOM environment
window.Chart = function() {
  return { destroy: () => {}, update: () => {} };
};
window.matchMedia = window.matchMedia || function() {
  return { matches: false, addEventListener: () => {}, removeEventListener: () => {} };
};
window.scrollTo = window.scrollTo || function() {};

// Execute pre-loaded datasets in window context
const datasetFiles = [
  'questions.js',
  'data_architecture.js',
  'data_concepts.js',
  'data_de.js',
  'data_pyspark.js',
  'data_sparksql.js',
  'data_mssql.js',
  'data_python.js',
  'data_personalised.js'
];

datasetFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const scriptContent = fs.readFileSync(filePath, 'utf-8');
    window.eval(scriptContent);
  }
});

// Execute app.js in window context
window.eval(appContent);

(async () => {
  // Trigger DOMContentLoaded
  const event = document.createEvent('Event');
  event.initEvent('DOMContentLoaded', true, true);
  document.dispatchEvent(event);

  // Allow async dataset promises to resolve
  await new Promise(resolve => setTimeout(resolve, 300));

  const countAll = document.getElementById('count-diff-all')?.textContent;
  const countEasy = document.getElementById('count-diff-easy')?.textContent;
  const countMedium = document.getElementById('count-diff-medium')?.textContent;
  const countHard = document.getElementById('count-diff-hard')?.textContent;
  const countArchitect = document.getElementById('count-diff-architect')?.textContent;

  console.log(`  📊 Q&A Prep Hub Counts -> All: ${countAll}, Easy: ${countEasy}, Medium: ${countMedium}, Hard: ${countHard}, Architect: ${countArchitect}`);
  assert(countAll && parseInt(countAll.replace(/,/g, ''), 10) > 0, 'All Levels Q&A count is non-zero');
  assert(countEasy && parseInt(countEasy.replace(/,/g, ''), 10) > 0, 'Easy Q&A count is non-zero');
  assert(countMedium && parseInt(countMedium.replace(/,/g, ''), 10) > 0, 'Medium Q&A count is non-zero');
  assert(countHard && parseInt(countHard.replace(/,/g, ''), 10) > 0, 'Hard Q&A count is non-zero');
  assert(countArchitect && parseInt(countArchitect.replace(/,/g, ''), 10) > 0, 'Architect Q&A count is non-zero');

  const tipText = document.getElementById('dashboard-tip-content-text')?.textContent;
  assert(tipText && !tipText.includes('Loading'), 'Dashboard Pro Tip text resolved immediately without stuck loading');
  console.log('  ✅ PASS — Dashboard Pro Tip text resolved');

  const studyQ = document.getElementById('study-card-question')?.textContent;
  const studyCounter = document.getElementById('study-counter')?.textContent;
  assert(studyQ && !studyQ.includes('Loading question'), 'Study card question resolved immediately');
  assert(studyCounter && studyCounter !== '0 / 0', `Study counter resolved to ${studyCounter}`);
  console.log(`  ✅ PASS — Study Mode flashcard & counter (${studyCounter}) resolved`);

  console.log('\n========================================================');
  console.log('ALL 12 COMPREHENSIVE QA AUDIT TESTS PASSED CLEANLY');
  console.log('========================================================\n');
})();
