const puppeteer = require('puppeteer');

async function runDiagnose(url, label) {
  console.log(`\n=== Diagnosing ${label} (${url}) ===`);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  const consoleMsgs = [];
  page.on('console', msg => {
    consoleMsgs.push(`[${msg.type()}] ${msg.text()}`);
  });

  const pageErrors = [];
  page.on('pageerror', err => {
    pageErrors.push(err.toString());
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log("Page loaded.");

    // Check if the body exists
    const bodyExists = await page.evaluate(() => !!document.body);
    console.log("Body exists:", bodyExists);

    // Check visible title/brand to see which version is loaded
    const brandText = await page.evaluate(() => {
      const el = document.querySelector('.brand-text h1') || document.querySelector('.sidebar-brand h1');
      return el ? el.textContent.trim() : 'NOT FOUND';
    });
    console.log("Brand title text:", brandText);

    // Check if concepts nav button exists
    const navBtnExists = await page.evaluate(() => !!document.getElementById('btn-nav-concepts'));
    console.log("Concepts Nav Button (#btn-nav-concepts) exists:", navBtnExists);

    // Click it if it exists
    if (navBtnExists) {
      console.log("Clicking Key Concepts Nav Button...");
      await page.click('#btn-nav-concepts');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const viewState = await page.evaluate(() => {
        const view = document.getElementById('view-concepts');
        if (!view) return { exists: false };
        return {
          exists: true,
          classes: view.className,
          displayStyle: window.getComputedStyle(view).display,
          visibilityStyle: window.getComputedStyle(view).visibility,
          opacityStyle: window.getComputedStyle(view).opacity,
          height: view.offsetHeight,
          width: view.offsetWidth
        };
      });
      console.log("Concepts View element state:", viewState);

      const containerState = await page.evaluate(() => {
        const container = document.getElementById('concepts-container');
        if (!container) return { exists: false };
        return {
          exists: true,
          childrenCount: container.children.length,
          visibleChildrenCount: Array.from(container.children).filter(c => window.getComputedStyle(c).display !== 'none').length,
          innerHTMLPreview: container.innerHTML.trim().substring(0, 300)
        };
      });
      console.log("Concepts Container (#concepts-container) state:", containerState);
    } else {
      // Print first 5 buttons in sidebar navigation to see what we have
      const navButtons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.nav-btn, .menu-btn, button')).slice(0, 8).map(b => ({
          id: b.id,
          text: b.textContent.trim(),
          target: b.getAttribute('data-target') || b.getAttribute('data-category')
        }));
      });
      console.log("Sample sidebar buttons:", navButtons);
    }

  } catch (err) {
    console.error("Test execution failed:", err);
  } finally {
    console.log("Console messages recorded during load/interact:");
    consoleMsgs.forEach(m => console.log("  " + m));
    if (pageErrors.length > 0) {
      console.log("Page errors recorded:");
      pageErrors.forEach(e => console.error("  ERROR: " + e));
    } else {
      console.log("No page errors recorded.");
    }
    await browser.close();
  }
}

(async () => {
  await runDiagnose('file:///Users/santosh/Documents/antigravity/hopeful-bardeen/index.html', 'LOCAL HOPEFUL BARDEEN');
  await runDiagnose('https://fabric-pbi-prep.vercel.app', 'VERCEL PROD SITE');
})();
