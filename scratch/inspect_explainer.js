const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const filePath = path.resolve(__dirname, '../index.html');
  await page.goto('file://' + filePath, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1000));

  // Navigate to Concept Explainer
  await page.evaluate(() => {
    const btn = document.getElementById('btn-nav-explainer');
    if (btn) btn.click();
    else console.log('btn-nav-explainer not found!');
  });
  await new Promise(r => setTimeout(r, 500));

  // Expand the first accordion item
  await page.evaluate(() => {
    const header = document.querySelector('.accordion-header');
    if (header) {
      header.click();
      console.log('Clicked first accordion header');
    } else {
      console.log('No accordion header found');
    }
  });
  await new Promise(r => setTimeout(r, 500));

  const layouts = await page.evaluate(() => {
    const card = document.querySelector('.accordion-inner .concept-card');
    if (!card) return 'No card found inside .accordion-inner';
    
    const title = card.querySelector('.concept-card-title');
    const footer = card.querySelector('.concept-card-footer');
    const svg = card.querySelector('svg');
    
    function getDetails(el) {
      if (!el) return 'Not found';
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        class: el.className,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        display: style.display,
        position: style.position,
        height: style.height,
        minHeight: style.minHeight,
        maxHeight: style.maxHeight,
        lineHeight: style.lineHeight,
        fontSize: style.fontSize,
        boxSizing: style.boxSizing,
        marginTop: style.marginTop,
        marginBottom: style.marginBottom,
        paddingTop: style.paddingTop,
        paddingBottom: style.paddingBottom,
        flexDirection: style.flexDirection,
        justifyContent: style.justifyContent
      };
    }
    
    return {
      card: getDetails(card),
      title: getDetails(title),
      footer: getDetails(footer),
      svg: getDetails(svg)
    };
  });

  console.log(JSON.stringify(layouts, null, 2));

  await browser.close();
})();
