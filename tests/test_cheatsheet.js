const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

console.log("=== Running DE Cheat Sheet View Tests ===");

const html = fs.readFileSync('index.html', 'utf8');
const cleanHtml = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '');
const appScript = fs.readFileSync('app.js', 'utf8');
const pythonScript = fs.readFileSync('data_python.js', 'utf8');
const mssqlScript = fs.readFileSync('data_mssql.js', 'utf8');
const pysparkScript = fs.readFileSync('data_pyspark.js', 'utf8');
const sparksqlScript = fs.readFileSync('data_sparksql.js', 'utf8');

const dom = new JSDOM(cleanHtml, { runScripts: "dangerously" });
const window = dom.window;
const document = window.document;

// Mock localStorage
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

// Mock external CDN libraries
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

// Execute data scripts
[pythonScript, mssqlScript, pysparkScript, sparksqlScript].forEach((src, idx) => {
  const scriptEl = document.createElement("script");
  scriptEl.textContent = src;
  document.head.appendChild(scriptEl);
});

// Execute app logic
const scriptApp = document.createElement("script");
scriptApp.textContent = appScript;
document.head.appendChild(scriptApp);

// Run validations
setTimeout(() => {
  try {
    // 1. Verify datasets are loaded globally
    if (!window.PYTHON_DATA || window.PYTHON_DATA.length === 0) {
      throw new Error("window.PYTHON_DATA is not loaded or is empty!");
    }
    if (!window.MSSQL_DATA || window.MSSQL_DATA.length === 0) {
      throw new Error("window.MSSQL_DATA is not loaded or is empty!");
    }
    console.log(`✅ Loaded Datasets. Python: ${window.PYTHON_DATA.length}, MS SQL: ${window.MSSQL_DATA.length}`);

    // 2. Click the sidebar navigation menu button for Cheatsheet view
    const navBtn = document.getElementById('btn-nav-cheatsheet');
    if (!navBtn) {
      throw new Error("Sidebar navigation button '#btn-nav-cheatsheet' not found!");
    }
    navBtn.click();
    console.log("✅ Navigation button clicked successfully.");

    // Verify view visibility
    const viewCheatsheet = document.getElementById('view-cheatsheet');
    if (viewCheatsheet.classList.contains('hidden')) {
      throw new Error("Cheatsheet view section '#view-cheatsheet' is still hidden after navigation click!");
    }
    console.log("✅ Switch view to '#view-cheatsheet' successful.");

    // 3. Verify cards are rendered (default language is Python)
    const cards = Array.from(document.querySelectorAll('#cheatsheet-container .concept-card.python'));
    if (cards.length === 0) {
      throw new Error("No Python cheat sheet cards were rendered inside '#cheatsheet-container'!");
    }
    console.log(`✅ Rendered default cards (Python) count: ${cards.length}`);

    // 4. Test language tab switching
    const langNav = document.getElementById('cheatsheet-lang-nav');
    const mssqlTab = Array.from(langNav.querySelectorAll('.topic-chip'))
                          .find(chip => chip.getAttribute('data-lang') === 'mssql');
    if (!mssqlTab) {
      throw new Error("MS SQL tab chip not found in cheatsheet lang nav!");
    }
    mssqlTab.click();

    const mssqlCards = Array.from(document.querySelectorAll('#cheatsheet-container .concept-card.mssql'));
    if (mssqlCards.length === 0) {
      throw new Error("No MS SQL cheat sheet cards were rendered after clicking MS SQL tab!");
    }
    console.log(`✅ Tab switch tested: found ${mssqlCards.length} MS SQL cards.`);

    // 5. Test difficulty level filter (with MS SQL active)
    const levelFilters = document.getElementById('cheatsheet-level-filters');
    const architectBtn = Array.from(levelFilters.querySelectorAll('.de-diff-chip'))
                              .find(btn => btn.getAttribute('data-level') === 'architect');
    if (!architectBtn) {
      throw new Error("Architect level filter chip not found!");
    }
    architectBtn.click();

    const filteredCards = Array.from(document.querySelectorAll('#cheatsheet-container .concept-card'));
    const allAreArchitect = filteredCards.every(card => card.getAttribute('data-level') === 'architect');
    if (filteredCards.length === 0 || !allAreArchitect) {
      throw new Error("Level filters are broken: rendered cards are not all architect difficulty!");
    }
    console.log(`✅ Level filter tested: found ${filteredCards.length} Architect MS SQL cards.`);

    // Reset difficulty to 'all'
    const allLevelBtn = Array.from(levelFilters.querySelectorAll('.de-diff-chip'))
                             .find(btn => btn.getAttribute('data-level') === 'all');
    if (allLevelBtn) allLevelBtn.click();

    // 6. Test search filter
    const searchInput = document.getElementById('cheatsheet-search');
    if (!searchInput) {
      throw new Error("Search input element '#cheatsheet-search' not found!");
    }
    
    // Simulate searching for 'Temporal' in MS SQL
    searchInput.value = 'Temporal';
    searchInput.dispatchEvent(new window.Event('input'));

    // Wait short delay for debounce
    setTimeout(() => {
      const searchCards = Array.from(document.querySelectorAll('#cheatsheet-container .concept-card'));
      const allMatchSearch = searchCards.every(card => {
        const text = card.innerHTML.toLowerCase();
        return text.includes('temporal');
      });

      if (searchCards.length === 0 || !allMatchSearch) {
        throw new Error("Search filter is broken or did not filter cards containing 'Temporal' properly!");
      }
      console.log(`✅ Search filter test passed: found ${searchCards.length} cards matching 'Temporal'.`);

      // 7. Check comparison table is populated
      const tbody = document.getElementById('cheatsheet-comp-tbody');
      if (!tbody || tbody.children.length === 0) {
        throw new Error("Comparison table tbody is empty!");
      }
      console.log(`✅ Comparison table test passed: found ${tbody.children.length} rows.`);

      console.log("✅ All Cheat Sheet integration tests passed successfully!");
      process.exit(0);
    }, 200);

  } catch (err) {
    console.error("❌ Test failed:", err.message);
    process.exit(1);
  }
}, 1000);
