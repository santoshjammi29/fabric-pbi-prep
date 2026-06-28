// Headless JSDOM test suite for the landing Dashboard view
const fs = require('fs');
const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

console.log("=== Running Dashboard View Integration Tests ===");

// 1. Read and clean index.html content (strip native script tags)
const htmlPath = path.join(__dirname, '../index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const cleanHtml = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '');

// 2. Set up JSDOM window
const dom = new JSDOM(cleanHtml, {
  runScripts: "dangerously"
});
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

// Mock external CDN libraries & matchMedia
window.tailwind = { config: {} };
window.Chart = class {
  constructor() {}
  destroy() {}
};
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {},
    addEventListener: function() {},
    removeEventListener: function() {}
  };
};

window.scrollTo = () => {};
window.Element.prototype.scrollIntoView = function() {};

// Mock anim API to prevent errors
window.anim = {
  observeRevealTargets: () => {}
};

// 3. Mock datasets before loading app.js
window.CONCEPTS_DB = Array(112).fill({ id: 'dummy-concept' });
window.QUESTIONS_DB = Array(2640).fill({ id: 'dummy-question' });
window.PYTHON_DATA = Array(32).fill({ id: 'dummy-python' });
window.MSSQL_DATA = Array(28).fill({ id: 'dummy-mssql' });
window.PYSPARK_DATA = Array(32).fill({ id: 'dummy-pyspark' });
window.SPARKSQL_DATA = Array(36).fill({ id: 'dummy-sparksql' });
window.ARCHITECTURE_DATA = Array(2400).fill({ id: 'dummy-arch' });

// 4. Load app.js dynamically
const appJsCode = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const scriptEl = document.createElement("script");
scriptEl.textContent = appJsCode;
document.head.appendChild(scriptEl);

// 5. Wait for JSDOM parser and DOMContentLoaded lifecycle
setTimeout(() => {
  try {
    // Test 1: Check default loaded view
    const dashboardSection = document.getElementById('view-dashboard');
    if (!dashboardSection) {
      console.error("❌ view-dashboard section not found in index.html!");
      process.exit(1);
    }
    const isHidden = dashboardSection.classList.contains('hidden');
    console.log(`✅ Default view-dashboard section loaded. Is hidden: ${isHidden}`);
    if (isHidden) {
      console.error("❌ view-dashboard should be visible on default load, but is hidden.");
      process.exit(1);
    }

    // Test 2: Check dynamic counter elements populate correctly
    const els = {
      concepts: document.getElementById('metric-concepts'),
      prepHub: document.getElementById('metric-prep-hub'),
      code: document.getElementById('metric-code'),
      spark: document.getElementById('metric-spark'),
      architecture: document.getElementById('metric-architecture'),
      gcc: document.getElementById('metric-gcc')
    };

    Object.keys(els).forEach(key => {
      if (!els[key]) {
        console.error(`❌ Counter element metric-${key} not found!`);
        process.exit(1);
      }
    });

    console.log("Values loaded in UI counters:");
    console.log("  - Concepts:", els.concepts.textContent);
    console.log("  - Prep Hub Q&As:", els.prepHub.textContent);
    console.log("  - Coding Sheets:", els.code.textContent);
    console.log("  - Spark Scenarios:", els.spark.textContent);
    console.log("  - Arch Scenarios:", els.architecture.textContent);
    console.log("  - GCC Firms:", els.gcc.textContent);

    if (els.concepts.textContent !== '112') {
      console.error(`❌ Expected Concepts count to be 112, got ${els.concepts.textContent}`);
      process.exit(1);
    }
    if (els.prepHub.textContent !== '2,640') {
      console.error(`❌ Expected Prep Hub Q&As to be 2,640, got ${els.prepHub.textContent}`);
      process.exit(1);
    }
    if (els.code.textContent !== '60') {
      console.error(`❌ Expected Coding Sheets count to be 60, got ${els.code.textContent}`);
      process.exit(1);
    }
    if (els.spark.textContent !== '68') {
      console.error(`❌ Expected Spark Scenarios count to be 68, got ${els.spark.textContent}`);
      process.exit(1);
    }
    if (els.architecture.textContent !== '2,400') {
      console.error(`❌ Expected Architecture count to be 2,400, got ${els.architecture.textContent}`);
      process.exit(1);
    }
    if (els.gcc.textContent !== '55') {
      console.error(`❌ Expected GCC count to be 55, got ${els.gcc.textContent}`);
      process.exit(1);
    }
    console.log("✅ Dynamic counters successfully verified.");

    // Test 3: Test click behavior on Architect Tip Box
    const tipTextEl = document.getElementById('dashboard-tip-content-text');
    const initialTipText = tipTextEl.textContent;
    console.log(`✅ Loaded random tip text: "${initialTipText.substring(0, 40)}..."`);
    if (initialTipText === 'Loading premium recommendation...') {
      console.error("❌ Tip text did not initialize on load.");
      process.exit(1);
    }

    const tipBox = document.getElementById('dashboard-tip-box');
    tipBox.click(); // Trigger tip rotation
    const newTipText = tipTextEl.textContent;
    console.log("✅ Clicked tip box. Rotated text successfully.");

    console.log("Testing launcher redirects...");
    const conceptsBtn = document.querySelector('[onclick*="switchView(\'view-concepts\')"]');
    if (!conceptsBtn) {
      console.error("❌ Concepts launcher button not found!");
      process.exit(1);
    }
    
    conceptsBtn.click();
    setTimeout(() => {
      const activeView = window.location.hash;
      console.log(`✅ Clicked Glossary launcher button. Active view hash is: ${activeView}`);
      if (activeView !== '#view-concepts') {
        console.error(`❌ Expected view concepts to be active, got ${activeView}`);
        process.exit(1);
      }
      
      console.log("🎉 All Dashboard integration tests passed successfully!");
      process.exit(0);
    }, 100);

  } catch (err) {
    console.error("❌ Exception during dashboard test validation:", err.message);
    process.exit(1);
  }
}, 1000);
