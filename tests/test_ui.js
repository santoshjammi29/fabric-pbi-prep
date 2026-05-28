const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:8080');

  // Go to niche practice
  await page.click('#btn-nav-practice');
  await new Promise(r => setTimeout(r, 500));
  
  // Count items before filtering
  const count1 = await page.evaluate(() => document.querySelectorAll('#niche-launcher-grid .concept-card').length);
  console.log("Niche practice cards before filter:", count1);

  // Click a topic chip
  console.log("Clicking FABRIC topic chip...");
  await page.evaluate(() => {
     const chip = document.querySelector('#practice-topics-scrollbar button[data-category="FABRIC"]');
     if (chip) chip.click();
     else console.log("Chip not found");
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  // Count items
  const count2 = await page.evaluate(() => document.querySelectorAll('#niche-launcher-grid .concept-card').length);
  console.log("Niche practice cards after FABRIC filter:", count2);
  
  await browser.close();
})();
