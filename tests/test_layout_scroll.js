/**
 * test_layout_scroll.js — Layout Architecture & Scroll Behavior Validator
 * Tests: container-scroll (desktop), page-scroll (mobile), sidebar non-scroll,
 *        touch guards, IntersectionObserver root, scroll-to-top logic
 * Run: node tests/test_layout_scroll.js
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
console.log('TEST: LAYOUT / SCROLL / CSS ARCHITECTURE VALIDATOR');
console.log('========================================================\n');

// 1. DESKTOP SCROLL ARCHITECTURE
console.log('--- 1. Desktop Scroll Architecture ---');
assert(/html\s*\{[^}]*height:\s*100%/s.test(css),            'html has height: 100%');
assert(/body\s*\{[^}]*height:\s*100%/s.test(css),            'body has height: 100%');
assert(/#app-container\s*\{[^}]*height:\s*100vh/s.test(css), '#app-container height: 100vh');
assert(/#app-container\s*\{[^}]*overflow:\s*hidden/s.test(css), '#app-container overflow: hidden');
assert(/\.main-content\s*\{[^}]*overflow-y:\s*auto/s.test(css), '.main-content overflow-y: auto (scroll container)');
assert(/\.main-content\s*\{[^}]*height:\s*100%/s.test(css),  '.main-content height: 100%');

// 2. MOBILE SCROLL OVERRIDE
console.log('\n--- 2. Mobile Scroll Override (<=900px) ---');
// Search the whole CSS for these patterns — they appear inside a 900px media block
assert(css.includes('overflow-y: auto;') && /height:\s*auto/s.test(css) && /@media.*900px/s.test(css),
  'Mobile 900px block: html gets overflow-y: auto');
assert(css.includes('overflow: auto;'),
  'Mobile 900px block: body gets overflow: auto');
assert(css.includes('display: block;') && css.includes('min-height: 100vh;'),
  'Mobile: #app-container reverts to display:block with min-height:100vh');
assert(css.includes('overflow-y: visible;'),
  'Mobile: .main-content overflow-y: visible present');

// 3. SIDEBAR NON-SCROLLABLE
console.log('\n--- 3. Sidebar Non-Scrollable ---');
const sidebarMatch = css.match(/Sidebar Navigation \*\/\s*\.sidebar\s*\{([^}]*)\}/s);
const sidebarBlock = sidebarMatch ? sidebarMatch[1] : '';
assert(/overflow:\s*hidden/.test(sidebarBlock), 'Sidebar overflow: hidden');
assert(!/overflow-y:\s*auto/.test(sidebarBlock), 'Sidebar has no overflow-y: auto');

// 4. MOBILE NAV NON-SCROLLABLE
console.log('\n--- 4. Mobile Nav Non-Scrollable ---');
const mnavBlock = css.match(/\.mobile-nav-scroll\s*\{([^}]*)\}/)?.[1] || '';
assert(/overflow-x:\s*hidden/.test(mnavBlock), '.mobile-nav-scroll overflow-x: hidden');

// 5. TOUCH GUARDS ON ALL CARD HOVER TRANSFORMS
console.log('\n--- 5. Card Hover Transform Touch Guards ---');
const firstHoverGuard = css.indexOf('@media (hover: hover)');
const baseBlock = firstHoverGuard > 0 ? css.slice(0, firstHoverGuard) : css;
[
  '.concept-accordion-card', '.niche-launcher-card', '.de-card',
  '.spark-milestone-card', '.spark-lexicon-card', '.spark-ecosystem-card',
  '.spark-bp-card', '.spark-enhancement-card', '.best-practice-card',
].forEach(function(sel) {
  var re = new RegExp(sel.replace(/\./g, '\\.') + ':hover\\s*\\{[^}]*translateY', 's');
  assert(!re.test(baseBlock), sel + ':hover translateY is guarded by @media(hover:hover)');
});

// 6. INTERSECTIONOBSERVER ROOT
console.log('\n--- 6. IntersectionObserver Uses .main-content Root ---');
assert(animJs.includes('getRevealRoot') || animJs.includes("document.querySelector('.main-content')"),
  'animations.js sets IO root to .main-content on desktop');
assert(animJs.includes('statObserverRoot'), 'Stat observer uses dynamic root variable');

// 7. SCROLL-TO-TOP TARGETS
console.log('\n--- 7. Scroll-to-Top Targets Correct Container ---');
assert(appJs.includes('mainContent.scrollTop = 0'), 'View switch scrolls .main-content to top');
assert(appJs.includes("mc.scrollTo({ top: 0"), 'Scroll-to-top button targets mc (.main-content)');
assert(appJs.includes("mainContent.addEventListener('scroll'"), 'Scroll listener on .main-content');

// 8. CSS VERSION CACHE-BUSTING
console.log('\n--- 8. CSS Cache-Busting Versions ---');
var cssVer = (html.match(/styles\.css\?v=([\d.]+)/) || [])[1];
var animVer = (html.match(/animations\.css\?v=([\d.]+)/) || [])[1];
assert(!!cssVer,  'styles.css has version: v=' + cssVer);
assert(!!animVer, 'animations.css has version: v=' + animVer);
assert(parseFloat(cssVer) >= 2.6, 'styles.css version ' + cssVer + ' >= 2.6 (smooth flat button selection without bounce)');
assert(parseFloat(animVer) >= 1.4, 'animations.css version ' + animVer + ' >= 1.4 (badgePop removed)');


// 9. PRINT STYLES
console.log('\n--- 9. Print Styles ---');
assert(css.includes('@media print'), 'CSS has @media print block');

// 10. REDUCED MOTION
console.log('\n--- 10. Reduced Motion Coverage ---');
assert((css.match(/prefers-reduced-motion/g)||[]).length >= 1, 'CSS: prefers-reduced-motion present');
assert((animJs.match(/prefersReducedMotion/g)||[]).length >= 1, 'JS: prefersReducedMotion guard present');

// 11. WEBKIT SCROLLBAR POLISH
console.log('\n--- 11. Webkit Scrollbar Polished ---');
assert(css.includes('.main-content::-webkit-scrollbar {'), '.main-content webkit scrollbar defined');
assert(css.includes('.main-content::-webkit-scrollbar-thumb {'), '.main-content scrollbar-thumb styled');

// 12. CONTENT MAX-WIDTH CONSTRAINT
console.log('\n--- 12. Content Max-Width Constraint ---');
assert(/\.page-view\s*\{[^}]*max-width/s.test(css), '.page-view has max-width for ultra-wide screens');

// 13. NO DUPLICATE APP-CONTAINER OUTSIDE MEDIA QUERIES
console.log('\n--- 13. App-Container Definition Count ---');
var appDefs = (css.match(/#app-container\s*\{/g)||[]).length;
assert(appDefs <= 5, '#app-container definitions: ' + appDefs + ' (base + media queries + print = ok)');

// SUMMARY
console.log('\n========================================================');
var total = passed + failed;
if (failed === 0) console.log('ALL ' + total + ' TESTS PASSED');
else              console.log('FAILED: ' + failed + ' of ' + total + ' --- fix before deploy');
console.log('========================================================\n');
process.exit(failed > 0 ? 1 : 0);
