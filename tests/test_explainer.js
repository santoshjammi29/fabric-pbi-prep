const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:8080');

  // Go to explainer
  await page.click('#btn-nav-explainer');
  await new Promise(r => setTimeout(r, 500));
  
  // Count accordions before filter
  const count1 = await page.evaluate(() => document.querySelectorAll('#explainer-accordion .concept-accordion-card').length);
  console.log("Accordions before filter:", count1);

  // Type in search filter
  await page.evaluate(() => {
    const input = document.getElementById('explainer-search');
    if (input) {
      input.value = 'lakehouse';
      input.dispatchEvent(new Event('input'));
    }
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  // Count items
  const count2 = await page.evaluate(() => document.querySelectorAll('#explainer-accordion .concept-accordion-card').length);
  const searchVal = await page.evaluate(() => document.getElementById('explainer-search').value);
  const matchText = await page.evaluate(() => document.getElementById('explainer-match-count') ? document.getElementById('explainer-match-count').textContent : 'N/A');
  console.log("Search input value in page:", searchVal);
  console.log("Match count text in page:", matchText);
  console.log("Accordions after search 'lakehouse':", count2);
  
  await browser.close();
})();
