const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

console.log("=== Running Hyderabad GCC Directory View Tests ===");

const html = fs.readFileSync('index.html', 'utf8');
const cleanHtml = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '');
const appScript = fs.readFileSync('app.js', 'utf8');
const dataScript = fs.readFileSync('questions.js', 'utf8');

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

// Execute questions database
const scriptData = document.createElement("script");
scriptData.textContent = dataScript;
document.head.appendChild(scriptData);

// Execute app logic
const scriptApp = document.createElement("script");
scriptApp.textContent = appScript;
document.head.appendChild(scriptApp);

// Run validations after setup
setTimeout(() => {
  try {
    // 1. Verify navigation button and click
    const navBtn = document.getElementById('btn-nav-gcc');
    if (!navBtn) {
      throw new Error("Sidebar navigation button '#btn-nav-gcc' not found!");
    }
    navBtn.click();
    console.log("✅ GCC Directory navigation button clicked successfully.");

    // Verify view visibility
    const viewGcc = document.getElementById('view-gcc');
    if (viewGcc.classList.contains('hidden')) {
      throw new Error("GCC Directory view section '#view-gcc' is still hidden after navigation click!");
    }
    console.log("✅ Switch view to '#view-gcc' successful.");

    // 2. Verify table rows are present
    const tableRows = Array.from(document.querySelectorAll('#gcc-directory-table tbody tr'));
    if (tableRows.length === 0) {
      throw new Error("No rows found inside '#gcc-directory-table tbody'!");
    }
    console.log(`✅ Loaded GCC Directory table. Total records found: ${tableRows.length}`);

    // 3. Test Search Filtering (Searching for 'JPMorgan')
    const searchInput = document.getElementById('gcc-search-input');
    if (!searchInput) {
      throw new Error("Search input element '#gcc-search-input' not found!");
    }
    
    searchInput.value = 'JPMorgan';
    searchInput.dispatchEvent(new window.Event('input'));

    let visibleRows = tableRows.filter(row => row.style.display !== 'none');
    console.log(`✅ Searched for 'JPMorgan'. Visible rows count: ${visibleRows.length}`);
    
    const allMatchSearch = visibleRows.every(row => {
      return row.textContent.toLowerCase().includes('jpmorgan');
    });

    if (visibleRows.length === 0 || !allMatchSearch) {
      throw new Error("Search filter failed or returned non-JPMorgan rows!");
    }
    console.log("✅ Search filter verified successfully.");

    // Reset search input
    searchInput.value = '';
    searchInput.dispatchEvent(new window.Event('input'));

    // 4. Test Risk Tier Chip Filtering (Clicking 'High Risk' filter chip)
    const chips = Array.from(document.querySelectorAll('.gcc-chip'));
    const highRiskChip = chips.find(c => c.getAttribute('data-filter') === 'High Risk');
    if (!highRiskChip) {
      throw new Error("High Risk filter chip '.gcc-chip[data-filter=\"High Risk\"]' not found!");
    }

    highRiskChip.click();
    
    visibleRows = tableRows.filter(row => row.style.display !== 'none');
    console.log(`✅ Filtered by 'High Risk'. Visible rows count: ${visibleRows.length}`);

    const allMatchRisk = visibleRows.every(row => {
      return row.getAttribute('data-risk') === 'High Risk';
    });

    if (visibleRows.length === 0 || !allMatchRisk) {
      throw new Error("Risk filter failed or returned non-High Risk rows!");
    }
    console.log("✅ Risk tier chip filter verified successfully.");

    // Reset filter chip to 'all'
    const allChip = chips.find(c => c.getAttribute('data-filter') === 'all');
    if (allChip) allChip.click();

    console.log("✅ All Hyderabad GCC Directory tests passed successfully!");
    process.exit(0);

  } catch (err) {
    console.error("❌ Test failed:", err.message);
    process.exit(1);
  }
}, 1000);
