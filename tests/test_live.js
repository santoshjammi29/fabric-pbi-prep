const puppeteer = require('puppeteer');

(async () => {
  console.log("=== Diagnosing Live Site ===");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

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

    // Switch view to key concepts
    console.log("Clicking Key Concepts sidebar button...");
    await page.click('#btn-nav-concepts');

    // Wait a brief moment for rendering
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if view-concepts is visible
    const isHidden = await page.evaluate(() => {
      const view = document.getElementById('view-concepts');
      return view.classList.contains('hidden');
    });
    console.log("Is Key Concepts view hidden?", isHidden);

    // Get concepts container children count
    const containerHtml = await page.evaluate(() => {
      const container = document.getElementById('concepts-container');
      return container ? {
        childrenCount: container.children.length,
        innerHtml: container.innerHTML.trim().substring(0, 500)
      } : null;
    });

    console.log("Concepts container info:", containerHtml);

  } catch (err) {
    console.error("Puppeteer automation failed:", err);
  } finally {
    await browser.close();
  }
})();
