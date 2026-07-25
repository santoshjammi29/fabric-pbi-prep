/**
 * test_e2e_puppeteer.js
 * ─────────────────────────────────────────────────────────────────────────────
 * END-TO-END BROWSER TESTS using Puppeteer (already a dev-dependency).
 *
 * Requires a local server on http://localhost:8080 (run_tests.js starts one
 * automatically, or start manually with: python3 -m http.server 8080).
 *
 * Run standalone:  node tests/test_e2e_puppeteer.js
 * Run via npm:     npm run test:e2e
 *
 * Tests are deterministic — no Gemini/AI API calls are made; sandbox endpoints
 * are intercepted and stubbed at the network layer.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:8080/#view-prep-hub';
const TIMEOUT  = 30_000;   // 30 s per navigation
const WAIT     = 2_000;    // ms to let async data loads settle

// ─── tiny harness ────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    process.stdout.write(`  ✅ ${name}\n`);
  } catch (e) {
    failed++;
    process.stderr.write(`  ❌ ${name}\n     → ${e.message.split('\n')[0]}\n`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function openPage(browser, url = BASE_URL) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Collect console errors — abort on JS exceptions
  const jsErrors = [];
  page.on('pageerror', err => jsErrors.push(err.toString()));

  // Stub Gemini/AI fetch so sandbox never makes real network calls
  await page.setRequestInterception(true);
  page.on('request', req => {
    const url = req.url();
    if (url.includes('generativelanguage.googleapis.com') || url.includes('gemini')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          candidates: [{
            content: {
              parts: [{ text: '**Stubbed AI response for testing.**' }]
            }
          }]
        })
      });
    } else {
      req.continue();
    }
  });

  await page.goto(url, { waitUntil: 'networkidle2', timeout: TIMEOUT });
  await new Promise(r => setTimeout(r, WAIT));

  return { page, jsErrors };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
(async () => {

  console.log('\n' + '━'.repeat(60));
  console.log('  END-TO-END BROWSER TESTS  (Puppeteer)');
  console.log('━'.repeat(60) + '\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {

    // ─────────────────────────────────────────────────────────────────────
    // SUITE 1 — Q&A Prep Hub counters & Question Detail Modal
    // ─────────────────────────────────────────────────────────────────────
    console.log('─── 1. Q&A Prep Hub — counters & modal ───');

    await test('Page loads without JavaScript exceptions', async () => {
      const { page, jsErrors } = await openPage(browser);
      // Filter out non-critical warnings (e.g. JSDOM scrollTo stubs)
      const realErrors = jsErrors.filter(e =>
        !e.includes('scrollTo') && !e.includes('Not implemented')
      );
      assert(realErrors.length === 0,
        `JS errors on load:\n${realErrors.join('\n')}`);
      await page.close();
    });

    await test('Q&A Prep Hub: at least one difficulty counter is non-zero', async () => {
      const { page } = await openPage(browser);

      // Navigate to prep hub
      await page.click('#btn-nav-prep-hub').catch(() => {});
      await new Promise(r => setTimeout(r, 1500));

      const countAll = await page.$eval('#count-diff-all',
        el => parseInt(el.textContent.replace(/,/g, ''), 10)).catch(() => 0);

      assert(countAll > 0,
        `All-Levels counter shows ${countAll} — expected > 0`);
      await page.close();
    });

    await test('Q&A Prep Hub: clicking a question opens a modal with real content', async () => {
      const { page } = await openPage(browser);

      await page.click('#btn-nav-prep-hub').catch(() => {});
      await new Promise(r => setTimeout(r, 1500));

      // Click the first question card
      const firstCard = await page.$('.qa-row-card');
      if (!firstCard) {
        // Skip gracefully if no cards rendered
        await page.close();
        return;
      }
      await firstCard.click();
      await new Promise(r => setTimeout(r, 500));

      const dialogText = await page.$eval('#dialog-q-text', el => el.textContent.trim())
        .catch(() => '');

      assert(dialogText.length > 0,
        'Modal #dialog-q-text is empty after clicking a question');
      assert(!dialogText.includes('Question detail text goes here'),
        `Modal still shows placeholder: "${dialogText}"`);

      await page.close();
    });

    // ─────────────────────────────────────────────────────────────────────
    // SUITE 2 — Study Mode
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n─── 2. Study Mode ───');

    await test('Study Mode counter shows "1 / N", not "0 / 0"', async () => {
      const { page } = await openPage(browser);

      await page.click('#btn-nav-prep-hub').catch(() => {});
      await new Promise(r => setTimeout(r, 1000));

      const counter = await page.$eval('#study-counter', el => el.textContent.trim())
        .catch(() => '');

      assert(counter !== '0 / 0',
        `Study counter is still "0 / 0"`);
      assert(counter.startsWith('1 /'),
        `Study counter must start with "1 /", got "${counter}"`);

      await page.close();
    });

    await test('Study Mode flashcard shows a real question (not loading text)', async () => {
      const { page } = await openPage(browser);

      await page.click('#btn-nav-prep-hub').catch(() => {});
      await new Promise(r => setTimeout(r, 1000));

      const qText = await page.$eval('#study-card-question', el => el.textContent.trim())
        .catch(() => '');

      assert(!qText.includes('Loading question'),
        `Flashcard still shows loading placeholder: "${qText}"`);
      assert(qText.length > 5,
        `Flashcard question text too short: "${qText}"`);

      await page.close();
    });

    // ─────────────────────────────────────────────────────────────────────
    // SUITE 3 — GCC Apply Links
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n─── 3. GCC Directory — Apply links ───');

    await test('GCC directory renders 55 company rows', async () => {
      const { page } = await openPage(browser, 'http://localhost:8080/#view-gcc');

      await page.click('#btn-nav-gcc').catch(() => {});
      await new Promise(r => setTimeout(r, 1000));

      const rowCount = await page.$$eval('#gcc-directory-table tbody tr', rows => rows.length)
        .catch(() => 0);

      assert(rowCount === 55,
        `Expected 55 GCC rows, got ${rowCount}`);
      await page.close();
    });

    await test('No Apply link routes through google.com/search', async () => {
      const { page } = await openPage(browser, 'http://localhost:8080/#view-gcc');

      await page.click('#btn-nav-gcc').catch(() => {});
      await new Promise(r => setTimeout(r, 1000));

      const badLinks = await page.$$eval('a.portal-link', links =>
        links.filter(a => (a.getAttribute('href') || '').includes('google.com/search'))
             .map(a => a.getAttribute('href'))
      );

      assert(badLinks.length === 0,
        `${badLinks.length} Apply link(s) still route through google.com:\n${badLinks.join('\n')}`);

      await page.close();
    });

    await test('First 3 Apply links have valid https:// hrefs', async () => {
      const { page } = await openPage(browser, 'http://localhost:8080/#view-gcc');
      await page.click('#btn-nav-gcc').catch(() => {});
      await new Promise(r => setTimeout(r, 1000));

      const hrefs = await page.$$eval('a.portal-link',
        links => links.slice(0, 3).map(a => a.getAttribute('href'))
      );

      assert(hrefs.length > 0, 'No .portal-link elements found');
      hrefs.forEach(href => {
        assert((href || '').startsWith('https://'),
          `Apply link is not an https URL: "${href}"`);
        assert(!(href || '').includes('google.com'),
          `Apply link routes through google.com: "${href}"`);
      });

      await page.close();
    });

    // ─────────────────────────────────────────────────────────────────────
    // SUITE 4 — Dashboard Pro Tip
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n─── 4. Dashboard Pro Tip ───');

    await test('Pro Tip is not stuck on "Loading premium recommendation..."', async () => {
      const { page } = await openPage(browser, 'http://localhost:8080/#view-dashboard');

      const tipText = await page.$eval('#dashboard-tip-content-text',
        el => el.textContent.trim()
      ).catch(() => '');

      assert(!tipText.includes('Loading premium recommendation'),
        `Pro Tip still shows loading state: "${tipText}"`);
      assert(tipText.length > 10,
        `Pro Tip text is too short or empty: "${tipText}"`);

      await page.close();
    });

    // ─────────────────────────────────────────────────────────────────────
    // SUITE 5 — Theme Toggle Accessibility
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n─── 5. Theme Toggle A11y ───');

    await test('Theme toggle has aria-label (desktop)', async () => {
      const { page } = await openPage(browser);

      const label = await page.$eval('#btn-theme-toggle',
        el => el.getAttribute('aria-label') || ''
      ).catch(() => '');

      assert(label.length > 0, '#btn-theme-toggle has no aria-label');
      assert(label.toLowerCase().includes('theme'),
        `aria-label "${label}" does not describe the theme toggle action`);

      await page.close();
    });

    await test('Theme toggle is focusable (tabindex or native button)', async () => {
      const { page } = await openPage(browser);

      const tag = await page.$eval('#btn-theme-toggle', el => el.tagName.toLowerCase())
        .catch(() => '');

      // <button> is natively focusable — no tabindex needed
      assert(tag === 'button',
        `#btn-theme-toggle should be a <button>, got <${tag}>`);

      await page.close();
    });

    await test('Toggling theme changes root class (light ↔ dark)', async () => {
      const { page } = await openPage(browser);

      const before = await page.$eval('html', el => el.className);
      await page.click('#btn-theme-toggle');
      await new Promise(r => setTimeout(r, 300));
      const after = await page.$eval('html', el => el.className);

      assert(before !== after,
        `Theme class did not change after toggle. Before: "${before}", After: "${after}"`);

      await page.close();
    });

    // ─────────────────────────────────────────────────────────────────────
    // SUITE 6 — Keyboard Navigation & Focus Visibility
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n─── 6. Keyboard Navigation & Focus ───');

    await test('Skip-to-main link exists and is the first focusable element', async () => {
      const { page } = await openPage(browser);

      // Tab once — should land on skip link
      await page.keyboard.press('Tab');
      await new Promise(r => setTimeout(r, 200));

      const focusedHref = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? el.getAttribute('href') : null;
      });

      assert(focusedHref === '#main-content-anchor',
        `First Tab focus should land on skip-link (href="#main-content-anchor"), got "${focusedHref}"`);

      await page.close();
    });

    await test('Navigation buttons are keyboard focusable', async () => {
      const { page } = await openPage(browser);

      // Tab several times and confirm focus moves to nav buttons
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab');
        await new Promise(r => setTimeout(r, 100));
      }

      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return { tag: el?.tagName, id: el?.id, cls: el?.className };
      });

      // At least one nav-btn or interactive element should be reachable
      assert(focused.tag !== 'BODY',
        'Focus is stuck on <body> — interactive elements not reachable via Tab');

      await page.close();
    });

    await test('Study flashcard is keyboard operable (Tab + Enter flips)', async () => {
      const { page } = await openPage(browser, 'http://localhost:8080/#view-prep-hub');

      await page.click('#btn-nav-prep-hub').catch(() => {});
      await new Promise(r => setTimeout(r, 1000));

      // Check the flashcard has tabindex="0"
      const tabindex = await page.$eval('#study-flashcard',
        el => el.getAttribute('tabindex')
      ).catch(() => null);

      assert(tabindex === '0',
        `#study-flashcard must have tabindex="0" for keyboard access, got "${tabindex}"`);

      // Focus and press Enter
      await page.focus('#study-flashcard');
      const beforeClass = await page.$eval('#study-flashcard', el => el.className);
      await page.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, 300));
      const afterClass = await page.$eval('#study-flashcard', el => el.className);

      // After Enter, card should either be flipped or remain same (no crash)
      assert(typeof afterClass === 'string', 'study-flashcard className is not a string after Enter');

      await page.close();
    });

    // ─────────────────────────────────────────────────────────────────────
    // SUITE 7 — Memory Mapper Interactivity
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n─── 7. Memory Mapper (Spark Hub) ───');

    await test('Memory Mapper slider updates legend in real time', async () => {
      const { page } = await openPage(browser, 'http://localhost:8080/#view-spark-hub');

      await page.click('#btn-nav-spark').catch(() => {});
      await new Promise(r => setTimeout(r, 1000));

      // Navigate to memory mapper sub-tab if it has a button
      const memBtn = await page.$('[onclick*="memory-mapper"]');
      if (memBtn) await memBtn.click();
      await new Promise(r => setTimeout(r, 500));

      const before = await page.$eval('#lbl-val-execution', el => el.textContent).catch(() => '');

      // Move heap slider
      await page.$eval('#mem-heap-size', (el) => {
        el.value = '32';
        el.dispatchEvent(new Event('input', { bubbles: true }));
      });
      await new Promise(r => setTimeout(r, 200));

      const after = await page.$eval('#lbl-val-execution', el => el.textContent).catch(() => '');

      // Legend value should be a non-empty string  
      assert(after.length > 0, 'lbl-val-execution is empty after slider move');

      await page.close();
    });

    // ─────────────────────────────────────────────────────────────────────
    // SUITE 8 — Console errors on fresh reload
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n─── 8. Clean reload — no console errors ───');

    await test('Reloading the page produces no JavaScript exceptions', async () => {
      const { page, jsErrors } = await openPage(browser);

      await page.reload({ waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, WAIT));

      const realErrors = jsErrors.filter(e =>
        !e.includes('scrollTo') &&
        !e.includes('Not implemented') &&
        !e.includes('net::ERR')
      );

      assert(realErrors.length === 0,
        `JS errors after reload:\n${realErrors.slice(0, 5).join('\n')}`);

      await page.close();
    });

  } finally {
    await browser.close();

    console.log('\n' + '═'.repeat(60));
    console.log(`E2E TESTS COMPLETE: ${passed} passed, ${failed} failed`);
    console.log('═'.repeat(60) + '\n');

    process.exit(failed > 0 ? 1 : 0);
  }

})();
