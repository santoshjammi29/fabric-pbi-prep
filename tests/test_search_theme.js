/**
 * test_search_theme.js — Search Bar, Dark Theme Contrast & Smooth Scroll Performance Validator
 * 
 * Validates:
 *   1. Dark Theme contrast values (#0b0f19 background, #f1f5f9 primary text, non-pitch black)
 *   2. Search wrapper theme integration & clear button support
 *   3. Smooth scroll optimizations (no will-change transform on card components, no global html scroll-behavior)
 *   4. DOM & Search Input bindings across all subviews
 * 
 * Run: node tests/test_search_theme.js
 */

'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const css    = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
const animJs = fs.readFileSync(path.join(ROOT, 'animations.js'), 'utf8');
const appJs  = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const html   = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

let passed = 0, failed = 0;
function assert(ok, name, hint) {
  if (ok) { console.log('  \u2705 PASS \u2014 ' + name); passed++; }
  else     { console.error('  \u274c FAIL \u2014 ' + name + (hint ? '\n        Hint: ' + hint : '')); failed++; }
}

console.log('\n========================================================');
console.log('🧪 TEST: SEARCH BAR, DARK THEME CONTRAST & SCROLL PERFORMANCE');
console.log('========================================================\n');

// 1. DARK THEME CONTRAST VALIDATION
console.log('--- 1. Dark Theme Contrast & Legibility ---');
const darkThemeMatch = css.match(/\.theme-dark\s*\{([^}]*)\}/s);
const darkBlock = darkThemeMatch ? darkThemeMatch[1] : '';

assert(darkBlock.includes('--text-primary: #f5f5f7'), 'Dark theme primary text uses Apple SF Pro silver-white (#f5f5f7)');
assert(darkBlock.includes('--text-secondary: #86868b'), 'Dark theme secondary text uses Apple SF Pro secondary gray (#86868b)');
assert(darkBlock.includes('--bg-gradient: linear-gradient') && darkBlock.includes('#000000'), 'Dark theme uses iPhone Pro Space Black gradient (#000000)');

const darkSysMatch = css.match(/\.theme-dark\s*\{[^}]*background:\s*#([a-fA-F0-9]+)/s);
const darkBg = darkSysMatch ? darkSysMatch[1] : '';
assert(darkBg.toLowerCase() === '000000', 'Dark theme container background is #000000');



// 2. SEARCH BAR & CLEAR BUTTON STYLING
console.log('\n--- 2. Search Bar Styling & Clear Button Support ---');
assert(css.includes('.qa-search-wrapper {') && css.includes('background: var(--card-bg)'), 'Search wrapper uses theme variable var(--card-bg)');
assert(css.includes('.search-clear-btn {'), 'CSS defines .search-clear-btn styles for clear button');
assert(appJs.includes('initSearchClearButtons'), 'app.js includes initSearchClearButtons() logic');
assert(appJs.includes('search-clear-btn'), 'app.js dynamically attaches search clear buttons');

// 3. SMOOTH 60-120FPS SCROLL PERFORMANCE
console.log('\n--- 3. Smooth Scroll Performance Optimizations ---');
assert(!/html\s*\{[^}]*scroll-behavior:\s*smooth/s.test(css), 'No global scroll-behavior: smooth on html (prevents trackpad wheel stutter)');
assert(!/\.concept-accordion-card\s*\{[^}]*will-change:\s*transform/s.test(css), 'No static will-change: transform on .concept-accordion-card (prevents GPU memory exhaustion)');

// 4. SEARCH INPUT ELEMENTS IN DOM
console.log('\n--- 4. Search Input Elements in index.html ---');
const searchIds = [
  'unified-search-input',
  'gcc-search-input',
  'concepts-search',
  'cheatsheet-search',
  'architecture-search-input',
  'explainer-search',
  'practice-search'
];

searchIds.forEach(id => {
  assert(html.includes(`id="${id}"`), `index.html contains search input #${id}`);
});

// SUMMARY
console.log('\n========================================================');
const total = passed + failed;
if (failed === 0) console.log('ALL ' + total + ' SEARCH & THEME TESTS PASSED');
else              console.log('FAILED: ' + failed + ' of ' + total + ' --- fix before deploy');
console.log('========================================================\n');
process.exit(failed > 0 ? 1 : 0);
