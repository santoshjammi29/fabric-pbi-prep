const puppeteer = require('puppeteer');

const VIEWPORTS = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Laptop', width: 1280, height: 800 },
  { name: 'Large Desktop', width: 1920, height: 1080 }
];

const VIEWS = [
  'view-concepts',
  'view-prep-hub',
  'view-cheatsheet',
  'view-spark-hub',
  'view-gcc',
  'view-architecture'
];

(async () => {
  console.log("🚀 Starting Automated UI Layout & Console Audit...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  const consoleLogs = [];
  const consoleErrors = [];

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    } else {
      consoleLogs.push(`[${msg.type()}] ${text}`);
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(`Page Error: ${err.message}`);
  });

  try {
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });
    console.log("✅ App loaded successfully on localhost:8080");

    for (const viewport of VIEWPORTS) {
      console.log(`\n--- Auditing Viewport: ${viewport.name} (${viewport.width}x${viewport.height}) ---`);
      await page.setViewport({ width: viewport.width, height: viewport.height });
      await new Promise(r => setTimeout(r, 500));

      for (const viewId of VIEWS) {
        console.log(`Checking view: ${viewId}`);
        
        // Navigate by clicking the sidebar button or hash change
        await page.evaluate((vid) => {
          // Find navigation element
          let btn = document.querySelector(`.nav-btn[data-target="${vid}"]`) || 
                    document.querySelector(`.mobile-nav-tab[data-target="${vid}"]`);
          if (btn) {
            btn.click();
          } else {
            window.location.hash = vid;
          }
        }, viewId);

        await new Promise(r => setTimeout(r, 600));

        // Check if the current view section has overflow or display issues
        const overflowElements = await page.evaluate((vid, vWidth) => {
          const section = document.getElementById(vid);
          if (!section || section.classList.contains('hidden') || section.getAttribute('hidden')) {
            return [];
          }

          const problematic = [];
          const elements = section.querySelectorAll('*');
          
          // Check section bounding box
          const sectionBox = section.getBoundingClientRect();
          if (sectionBox.width > vWidth + 2) {
            problematic.push({
              tag: section.tagName.toLowerCase(),
              id: section.id,
              class: section.className,
              width: sectionBox.width,
              reason: 'View container itself is wider than viewport (horizontal scroll trigger)'
            });
          }

          elements.forEach(el => {
            const box = el.getBoundingClientRect();
            // We care about elements that stick out of the viewport width
            if (box.width > vWidth + 2 && box.left >= 0) {
              problematic.push({
                tag: el.tagName.toLowerCase(),
                id: el.id,
                class: el.className,
                width: box.width,
                reason: 'Element width exceeds viewport width'
              });
            } else if (box.right > vWidth + 2) {
              // Check if it's scrollable or hidden
              const style = window.getComputedStyle(el);
              if (style.overflowX !== 'auto' && style.overflowX !== 'scroll' && style.overflowX !== 'hidden') {
                problematic.push({
                  tag: el.tagName.toLowerCase(),
                  id: el.id,
                  class: el.className,
                  right: box.right,
                  reason: 'Element boundary exceeds right edge of screen'
                });
              }
            }
          });

          return problematic.slice(0, 10); // Return first 10 issues to avoid overloading
        }, viewId, viewport.width);

        if (overflowElements.length > 0) {
          console.warn(`⚠️ Warning: Found ${overflowElements.length} elements with potential horizontal overflow inside ${viewId}:`);
          overflowElements.forEach(el => {
            console.warn(`  - <${el.tag} id="${el.id}" class="${el.class}"> width/right=${el.width || el.right}. Reason: ${el.reason}`);
          });
        } else {
          console.log(`  ✅ View ${viewId} fits layout perfectly.`);
        }
      }
    }

    console.log("\n--- Console Logs Captured during Run ---");
    consoleLogs.slice(0, 20).forEach(log => console.log(log));
    if (consoleLogs.length > 20) console.log(`... and ${consoleLogs.length - 20} more logs`);

    console.log("\n--- Console Errors / Exceptions Captured ---");
    if (consoleErrors.length === 0) {
      console.log("✅ Zero errors or exceptions detected!");
    } else {
      consoleErrors.forEach(err => console.error(`❌ ${err}`));
    }

  } catch (error) {
    console.error("❌ Layout audit run failed:", error);
  } finally {
    await browser.close();
    console.log("\n🚀 Layout audit completed.");
  }
})();
