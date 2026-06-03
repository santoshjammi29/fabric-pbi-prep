const puppeteer = require('puppeteer');

(async () => {
  console.log("=== Diagnosing Live Site DE Cheatsheet Integration ===");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Listen for console messages
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`);
  });

  // Listen for page errors
  page.on('pageerror', err => {
    console.error(`[BROWSER ERROR] ${err.toString()}`);
  });

  try {
    await page.goto('https://fabric-pbi-prep.vercel.app', { waitUntil: 'networkidle2' });
    console.log("Loaded live page.");

    // Switch view to cheatsheet
    console.log("Clicking DE Cheat Sheet sidebar button...");
    await page.click('#btn-nav-cheatsheet');

    // Wait a brief moment for rendering
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if view-cheatsheet is visible
    const isHidden = await page.evaluate(() => {
      const view = document.getElementById('view-cheatsheet');
      return view.classList.contains('hidden');
    });
    console.log("Is DE Cheat Sheet view hidden?", isHidden);

    // Get cheatsheet container children count and first card title
    const cheatsheetInfo = await page.evaluate(() => {
      const container = document.getElementById('cheatsheet-container');
      const firstCardTitle = container ? container.querySelector('.card-title') : null;
      return container ? {
        childrenCount: container.children.length,
        firstTitleText: firstCardTitle ? firstCardTitle.textContent.trim() : 'none'
      } : null;
    });

    console.log("Cheatsheet container info:", cheatsheetInfo);

    if (cheatsheetInfo && cheatsheetInfo.childrenCount > 0) {
      console.log("✅ DE Cheat Sheet is rendering successfully on the live site!");
      process.exit(0);
    } else {
      console.error("❌ DE Cheat Sheet failed to render on the live site!");
      process.exit(1);
    }

  } catch (err) {
    console.error("Puppeteer automation failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
