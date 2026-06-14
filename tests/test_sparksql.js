const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const cleanHtml = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '');
const script = fs.readFileSync('app.js', 'utf8');
const sparkSqlData = fs.readFileSync('data_sparksql.js', 'utf8');

const dom = new JSDOM(cleanHtml, { runScripts: "dangerously" });
const window = dom.window;
const document = window.document;

// Mock localStorage to prevent SecurityError
const storage = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key) => storage[key] || null,
    setItem: (key, val) => storage[key] = String(val),
    removeItem: (key) => delete storage[key],
    clear: () => { for (let k in storage) delete storage[k]; }
  },
  writable: true,
  configurable: true
});

// Mock CDN-loaded libraries to prevent ReferenceError
window.tailwind = { config: {} };
window.Chart = class {
  constructor() {}
  destroy() {}
};

// Mock matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {},
    addEventListener: function() {},
    removeEventListener: function() {}
  };
};

// Execute data_sparksql.js
const scriptEl1 = document.createElement("script");
scriptEl1.textContent = sparkSqlData;
document.head.appendChild(scriptEl1);

// Execute app.js
const scriptEl2 = document.createElement("script");
scriptEl2.textContent = script;
document.head.appendChild(scriptEl2);

// Wait for DOMContentLoaded logic
setTimeout(() => {
  console.log("=== Running Spark SQL & Comparison DOM Tests ===");
  
  // Test 1: Navigation to Spark SQL subview
  const sparkHubSubnav = document.getElementById('spark-hub-subnav');
  if (!sparkHubSubnav) {
    console.error("❌ Test Failed: spark-hub-subnav not found in DOM.");
    process.exit(1);
  }
  
  const sparkSqlChip = sparkHubSubnav.querySelector('button[data-subtab="view-sparksql"]');
  if (!sparkSqlChip) {
    console.error("❌ Test Failed: Spark SQL curriculum button not found.");
    process.exit(1);
  }
  
  // Click Spark SQL chip to load curriculum
  sparkSqlChip.click();
  console.log("✅ Clicked Spark SQL Curriculum subtab chip.");

  // Let's verify that renderSparkSqlCurriculum was called
  const container = document.getElementById('sparksql-phase-blocks-container');
  if (!container) {
    console.error("❌ Test Failed: sparksql-phase-blocks-container not found.");
    process.exit(1);
  }
  
  const blocksCount = container.querySelectorAll('.sparksql-phase-block').length;
  console.log(`Rendered Spark SQL curriculum phase blocks: ${blocksCount}`);
  if (blocksCount !== 4) {
    console.error("❌ Test Failed: Expected 4 phase blocks, got " + blocksCount);
    process.exit(1);
  }
  
  const cardsCount = container.querySelectorAll('.sparksql-level-card').length;
  console.log(`Rendered Spark SQL level cards: ${cardsCount}`);
  if (cardsCount !== 36) {
    console.error("❌ Test Failed: Expected 36 level cards, got " + cardsCount);
    process.exit(1);
  }
  console.log("✅ Successfully verified Spark SQL Curriculum dynamic rendering.");

  // Test 2: Click a phase filter chip in Spark SQL
  const phaseNav = document.getElementById('sparksql-phase-nav');
  const phase3Btn = phaseNav.querySelector('button[data-phase="3"]');
  if (!phase3Btn) {
    console.error("❌ Test Failed: Phase 3 filter button not found.");
    process.exit(1);
  }
  phase3Btn.click();
  
  const block1 = container.querySelector('.sparksql-phase-block[data-phase="1"]');
  const block3 = container.querySelector('.sparksql-phase-block[data-phase="3"]');
  if (!block1.classList.contains('hidden-phase')) {
    console.error("❌ Test Failed: Phase 1 block should be hidden after filtering to Phase 3.");
    process.exit(1);
  }
  if (block3.classList.contains('hidden-phase')) {
    console.error("❌ Test Failed: Phase 3 block should be visible after filtering to Phase 3.");
    process.exit(1);
  }
  console.log("✅ Successfully verified Spark SQL Phase filtering logic.");

  // Test 3: Navigation to Syntax Comparison subview and filtering category chips
  const compChip = sparkHubSubnav.querySelector('button[data-subtab="view-spark-compare"]');
  if (!compChip) {
    console.error("❌ Test Failed: Syntax Comparison button not found.");
    process.exit(1);
  }
  compChip.click();
  console.log("✅ Clicked Syntax Comparison subtab chip.");

  const compFilters = document.getElementById('comp-filters-container');
  if (!compFilters) {
    console.error("❌ Test Failed: comp-filters-container not found.");
    process.exit(1);
  }

  const joinBtn = compFilters.querySelector('button[data-category="join"]');
  if (!joinBtn) {
    console.error("❌ Test Failed: Join Category filter chip not found.");
    process.exit(1);
  }
  joinBtn.click();
  console.log("✅ Clicked 'Joins & Unions' category chip.");

  const cards = document.querySelectorAll('.comparison-card');
  let visibleCount = 0;
  let hiddenCount = 0;
  cards.forEach(card => {
    if (card.classList.contains('hidden-comp')) {
      hiddenCount++;
    } else {
      visibleCount++;
    }
  });
  console.log(`Syntax comparison cards state - Visible: ${visibleCount}, Hidden: ${hiddenCount}`);
  if (visibleCount !== 1 || hiddenCount !== 5) {
    console.error("❌ Test Failed: Expected 1 visible card and 5 hidden cards after filtering.");
    process.exit(1);
  }
  console.log("✅ Successfully verified Syntax Comparison filtering logic.");

  // Test 4: Verify syntax highlighting in comparison cards
  const firstCard = document.querySelector('.comparison-card');
  const pythonSection = firstCard.querySelector('.comparison-section.lang-python');
  const codeEl = pythonSection.querySelector('pre code');
  
  // The pre container has the 'code-block' class
  const preEl = pythonSection.querySelector('pre');
  if (!preEl.classList.contains('code-block')) {
    console.error("❌ Test Failed: pre element does not have code-block class.");
    process.exit(1);
  }
  
  // Let's verify that the code text has some span tag for highlighting (e.g. .kw, .comment)
  const keywords = codeEl.querySelectorAll('span.kw');
  if (keywords.length === 0) {
    console.error("❌ Test Failed: No syntax highlighting keywords (span.kw) found in code block.");
    process.exit(1);
  }
  console.log("✅ Successfully verified syntax highlighting inside comparison code blocks.");

  console.log("=== All Spark SQL and Coding Fundamentals DOM tests passed successfully! ===");
  process.exit(0);
}, 1000);
