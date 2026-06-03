const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

console.log("=== Running Key Concepts Glossary View Tests ===");

const html = fs.readFileSync('index.html', 'utf8');
const cleanHtml = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '');
const appScript = fs.readFileSync('app.js', 'utf8');
const dataScript = fs.readFileSync('questions.js', 'utf8');
const conceptsScript = fs.readFileSync('data_concepts.js', 'utf8');

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

// Execute questions data
const scriptData = document.createElement("script");
scriptData.textContent = dataScript;
document.head.appendChild(scriptData);

// Execute concepts data
const scriptConcepts = document.createElement("script");
scriptConcepts.textContent = conceptsScript;
document.head.appendChild(scriptConcepts);

// Execute app logic
const scriptApp = document.createElement("script");
scriptApp.textContent = appScript;
document.head.appendChild(scriptApp);

// Run validations
setTimeout(() => {
  try {
    // 1. Verify concepts data is loaded globally
    if (!window.CONCEPTS_DB || window.CONCEPTS_DB.length === 0) {
      throw new Error("window.CONCEPTS_DB is not loaded or is empty!");
    }
    console.log(`✅ Loaded Concepts Database. Total items: ${window.CONCEPTS_DB.length}`);

    // 2. Click the sidebar navigation menu button for Concepts view
    const navBtn = document.getElementById('btn-nav-concepts');
    if (!navBtn) {
      throw new Error("Sidebar navigation button '#btn-nav-concepts' not found!");
    }
    navBtn.click();
    console.log("✅ Navigation button clicked successfully.");

    // Verify view visibility
    const viewConcepts = document.getElementById('view-concepts');
    if (viewConcepts.classList.contains('hidden')) {
      throw new Error("Key Concepts view section '#view-concepts' is still hidden after navigation click!");
    }
    console.log("✅ Switch view to '#view-concepts' successful.");

    // 3. Verify card elements are rendered
    const cards = Array.from(document.querySelectorAll('#concepts-container .concept-accordion-card'));
    if (cards.length === 0) {
      throw new Error("No concept cards were rendered inside '#concepts-container'!");
    }
    console.log(`✅ Rendered concept cards count: ${cards.length}`);

    // 4. Verify concepts are sorted by increasing order of difficulty
    const diffWeights = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3 };
    let prevWeight = 0;
    let sortingOk = true;

    cards.forEach((card, index) => {
      const diffBadge = card.querySelector('.difficulty-badge');
      if (!diffBadge) {
        throw new Error(`Concept card at index ${index} is missing its difficulty badge!`);
      }
      const diffText = diffBadge.textContent.trim().toUpperCase();
      const weight = diffWeights[diffText] || 99;
      
      if (weight < prevWeight) {
        sortingOk = false;
        console.log(`❌ Sorting out of order at index ${index}: term='${card.querySelector('.concept-term').textContent.trim()}', diff='${diffText}' follows higher difficulty.`);
      }
      prevWeight = weight;
    });

    if (!sortingOk) {
      throw new Error("Concepts are NOT sorted by increasing order of difficulty!");
    }
    console.log("✅ Concepts are successfully sorted by increasing order of difficulty (EASY -> MEDIUM -> HARD).");

    // 5. Test search filter
    const searchInput = document.getElementById('concepts-search');
    if (!searchInput) {
      throw new Error("Search input element '#concepts-search' not found!");
    }
    
    // Simulate searching for 'OneLake'
    searchInput.value = 'OneLake';
    // Dispatch input event to trigger renderConcepts
    searchInput.dispatchEvent(new window.Event('input'));

    const searchCards = Array.from(document.querySelectorAll('#concepts-container .concept-accordion-card'));
    const allMatchSearch = searchCards.every(card => {
      const text = card.innerHTML.toLowerCase();
      return text.includes('onelake');
    });

    if (searchCards.length === 0 || !allMatchSearch) {
      throw new Error("Search filter is broken or did not filter cards containing 'OneLake' properly!");
    }
    console.log(`✅ Search filter test passed: found ${searchCards.length} cards matching 'OneLake'.`);

    // Reset search
    searchInput.value = '';
    searchInput.dispatchEvent(new window.Event('input'));

    // 6. Test topic category filter
    const fabricChip = Array.from(document.querySelectorAll('#concepts-topics-scrollbar .topic-chip'))
                            .find(chip => chip.getAttribute('data-category') === 'FABRIC');
    if (!fabricChip) {
      throw new Error("Fabric topic chip in scrollbar not found!");
    }
    fabricChip.click();

    const fabricCards = Array.from(document.querySelectorAll('#concepts-container .concept-accordion-card'));
    const allMatchCategory = fabricCards.every(card => {
      const catBadge = card.querySelector('.stats-badge');
      return catBadge && catBadge.textContent.toLowerCase().includes('fabric');
    });

    if (fabricCards.length === 0 || !allMatchCategory) {
      throw new Error("Category topic filter chip is broken or rendered non-Fabric concepts!");
    }
    console.log(`✅ Category topic filter test passed: found ${fabricCards.length} Fabric concepts.`);

    // Reset category chip
    const allChip = Array.from(document.querySelectorAll('#concepts-topics-scrollbar .topic-chip'))
                         .find(chip => chip.getAttribute('data-category') === 'ALL');
    if (allChip) allChip.click();

    // 7. Test difficulty tab button filter
    const mediumBtn = Array.from(document.querySelectorAll('#concepts-difficulty-filters .de-diff-chip'))
                           .find(btn => btn.getAttribute('data-difficulty') === 'MEDIUM');
    if (!mediumBtn) {
      throw new Error("MEDIUM difficulty filter button not found!");
    }
    mediumBtn.click();

    const mediumCards = Array.from(document.querySelectorAll('#concepts-container .concept-accordion-card'));
    const allMatchDifficulty = mediumCards.every(card => {
      const diffBadge = card.querySelector('.difficulty-badge');
      return diffBadge && diffBadge.textContent.toUpperCase() === 'MEDIUM';
    });

    if (mediumCards.length === 0 || !allMatchDifficulty) {
      throw new Error("Difficulty filter button is broken or returned non-MEDIUM difficulty concepts!");
    }
    console.log(`✅ Difficulty filter test passed: found ${mediumCards.length} MEDIUM concepts.`);

    console.log("✅ All Key Concepts view tests passed successfully!");
    process.exit(0);

  } catch (err) {
    console.error("❌ Test failed:", err.message);
    process.exit(1);
  }
}, 1000);
