const puppeteer = require('puppeteer');

async function auditLayout(viewportWidth) {
  console.log(`\n======================================================`);
  console.log(`Auditing Layout at Viewport Width: ${viewportWidth}px`);
  console.log(`======================================================`);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: viewportWidth, height: 900 });

  try {
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });
    
    // Check global widths
    const bodyWidth = await page.evaluate(() => document.body.offsetWidth);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`Body width: ${bodyWidth}px, Page scroll width: ${scrollWidth}px`);
    if (scrollWidth > bodyWidth) {
      console.log(`⚠️ GLOBAL HORIZONTAL OVERFLOW: Scroll width (${scrollWidth}px) exceeds body viewport (${bodyWidth}px)!`);
    }

    const views = ['view-explainer', 'view-practice', 'view-spark', 'view-gcc', 'view-pyspark', 'view-concepts', 'view-cheatsheet', 'view-personalised'];
    
    for (const viewId of views) {
      // Toggle to the view using hash change
      await page.evaluate((id) => {
        window.location.hash = '#' + id;
      }, viewId);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const viewData = await page.evaluate((id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const style = window.getComputedStyle(el);
        return {
          id,
          width: el.offsetWidth,
          scrollWidth: el.scrollWidth,
          display: style.display,
          visible: style.display !== 'none'
        };
      }, viewId);

      if (!viewData || !viewData.visible) {
        console.log(`View ${viewId} not active or not found.`);
        continue;
      }

      console.log(`View: #${viewId} | Width: ${viewData.width}px | ScrollWidth: ${viewData.scrollWidth}px`);
      
      if (viewData.scrollWidth > viewData.width + 1) {
        console.log(`  ⚠️ Overflow inside #${viewId}: scrollWidth ${viewData.scrollWidth}px > width ${viewData.width}px`);
        
        // Find children with width issues or text wrapping issues
        const overflowingChildren = await page.evaluate((id) => {
          const parent = document.getElementById(id);
          if (!parent) return [];
          
          const results = [];
          const checkEl = (el) => {
            for (const child of el.children) {
              const display = window.getComputedStyle(child).display;
              if (display === 'none') continue;
              
              if (child.offsetWidth > el.offsetWidth || child.scrollWidth > el.offsetWidth) {
                const style = window.getComputedStyle(child);
                results.push({
                  tagName: child.tagName,
                  id: child.id,
                  className: child.className,
                  width: child.offsetWidth,
                  scrollWidth: child.scrollWidth,
                  parentWidth: el.offsetWidth,
                  whiteSpace: style.whiteSpace,
                  display: style.display,
                  flexShrink: style.flexShrink,
                  minWidth: style.minWidth
                });
              }
              checkEl(child);
            }
          };
          checkEl(parent);
          return results;
        }, viewId);

        if (overflowingChildren.length > 0) {
          console.log(`  Found overflowing elements:`);
          // Print unique overflowing classes
          const printed = new Set();
          overflowingChildren.forEach(c => {
            const key = `${c.tagName}.${c.className.split(' ').join('.')}`;
            if (!printed.has(key)) {
              console.log(`    <${c.tagName} class="${c.className}"> Width: ${c.width}px, ScrollWidth: ${c.scrollWidth}px, ParentWidth: ${c.parentWidth}px`);
              console.log(`      Styles: display=${c.display}, white-space=${c.whiteSpace}, min-width=${c.minWidth}, flex-shrink=${c.flexShrink}`);
              printed.add(key);
            }
          });
        }
      }
    }

  } catch (err) {
    console.error("Audit error:", err);
  } finally {
    await browser.close();
  }
}

(async () => {
  await auditLayout(1200); // Desktop/Tablet breakpoint
  await auditLayout(768);  // Tablet
  await auditLayout(375);  // Mobile
})();
