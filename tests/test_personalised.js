const puppeteer = require('puppeteer');

(async () => {
  console.log("=== Running Personalised Prep UI Tests ===");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  try {
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });

    // 1. Click navigation button
    console.log("Clicking Personalised Prep sidebar button...");
    await page.click('#btn-nav-personalised');
    await new Promise(r => setTimeout(r, 500));

    // Check if view-personalised is visible
    const isHidden = await page.evaluate(() => {
      const view = document.getElementById('view-personalised');
      return view.classList.contains('hidden');
    });
    console.log("Is Personalised view hidden?", isHidden);
    if (isHidden) throw new Error("Personalised view is still hidden after navigation button click");

    // 2. Count questions loaded by default
    const count1 = await page.evaluate(() => document.querySelectorAll('#personalised-container .concept-accordion-card').length);
    console.log("Questions loaded by default (expected 250):", count1);
    if (count1 !== 250) {
      throw new Error(`Expected 250 questions, but found ${count1}`);
    }

    // 3. Click a domain chip (Microsoft Fabric & OneLake)
    console.log("Clicking 'Microsoft Fabric & OneLake' domain chip...");
    await page.evaluate(() => {
      const chip = document.querySelector('#personalised-topics-scrollbar .topic-chip[data-domain="Microsoft Fabric, OneLake & Direct Lake Architecture"]');
      if (chip) chip.click();
      else console.log("Fabric chip not found");
    });
    await new Promise(r => setTimeout(r, 500));

    const count2 = await page.evaluate(() => document.querySelectorAll('#personalised-container .concept-accordion-card').length);
    console.log("Questions after domain filter (expected 50):", count2);
    if (count2 !== 50) {
      throw new Error(`Expected 50 questions, but found ${count2}`);
    }

    // 4. Type a search query
    console.log("Testing search input with query 'governance'...");
    // Clear first and type
    await page.evaluate(() => {
      const searchInput = document.getElementById('personalised-search');
      if (searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
      }
    });
    await page.type('#personalised-search', 'governance');
    await new Promise(r => setTimeout(r, 500));

    const count3 = await page.evaluate(() => document.querySelectorAll('#personalised-container .concept-accordion-card').length);
    console.log(`Questions matching 'governance' filter inside Fabric domain: ${count3}`);

    // 5. Test accordion expand/collapse
    console.log("Testing accordion item click...");
    // Click the first card header
    await page.evaluate(() => {
      const firstCard = document.querySelector('#personalised-container .concept-accordion-card');
      if (firstCard) {
        const header = firstCard.querySelector('.level-card-header');
        if (header) header.click();
      }
    });
    await new Promise(r => setTimeout(r, 300));

    const accordionState = await page.evaluate(() => {
      const firstCard = document.querySelector('#personalised-container .concept-accordion-card');
      if (!firstCard) return null;
      const body = firstCard.querySelector('.level-card-body');
      const isExpanded = firstCard.classList.contains('expanded');
      const display = body ? body.style.display : null;
      return { isExpanded, display };
    });
    console.log("Accordion state after click:", accordionState);
    if (!accordionState || !accordionState.isExpanded || accordionState.display !== 'block') {
      throw new Error("Accordion card did not expand correctly");
    }

    console.log("✅ All Personalised Prep tests passed successfully!");
  } catch (err) {
    console.error("❌ Test failed:", err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
