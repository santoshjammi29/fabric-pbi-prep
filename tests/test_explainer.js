const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:8080');

  // Go to explainer
  await page.click('#btn-nav-explainer');
  await new Promise(r => setTimeout(r, 500));
  
  // Count accordions before filter
  const count1 = await page.evaluate(() => document.querySelectorAll('#explainer-accordion .accordion-item').length);
  console.log("Accordions before filter:", count1);

  // Type in search filter
  await page.type('#explainer-search', 'lakehouse');
  
  await new Promise(r => setTimeout(r, 500));
  
  // Count items
  const count2 = await page.evaluate(() => document.querySelectorAll('#explainer-accordion .accordion-item').length);
  console.log("Accordions after search 'lakehouse':", count2);
  
  // Change status filter
  await page.select('#explainer-filter-status', 'mastered');
  
  await new Promise(r => setTimeout(r, 500));
  
  const count3 = await page.evaluate(() => document.querySelectorAll('#explainer-accordion .accordion-item').length);
  console.log("Accordions after status 'mastered':", count3);
  
  await browser.close();
})();
