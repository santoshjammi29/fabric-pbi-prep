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

  // Print initial container contents
  const initialHtml = await page.evaluate(() => {
    const container = document.getElementById('unified-search-container');
    return container ? container.innerHTML.trim() : 'No container';
  });
  console.log('Initial HTML of unified-search-container:', initialHtml.substring(0, 500));

  // Let's search for any elements with class 'concept-card'
  const conceptCardCount = await page.evaluate(() => {
    return document.querySelectorAll('.concept-card').length;
  });
  console.log('Total concept-card elements on page:', conceptCardCount);

  // Let's click Prep Hub
  await page.evaluate(() => {
    document.getElementById('btn-nav-prep-hub').click();
  });
  await new Promise(r => setTimeout(r, 500));

  const conceptCardCountAfterClick = await page.evaluate(() => {
    return document.querySelectorAll('.concept-card').length;
  });
  console.log('Total concept-card elements after Prep Hub click:', conceptCardCountAfterClick);

  // Print first concept-card html if exists
  const firstCardHtml = await page.evaluate(() => {
    const card = document.querySelector('.concept-card');
    return card ? card.outerHTML : 'None';
  });
  console.log('First card HTML:', firstCardHtml.substring(0, 800));

  await browser.close();
})();
