const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

console.log("=== Running Enterprise Data Architecture Hub JSDOM Tests ===");

const html = fs.readFileSync('index.html', 'utf8');
const cleanHtml = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '');
const appScript = fs.readFileSync('app.js', 'utf8');
const archDataScript = fs.readFileSync('data_architecture.js', 'utf8');

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

// Execute architecture database
const scriptData = document.createElement("script");
scriptData.textContent = archDataScript;
document.head.appendChild(scriptData);

// Execute app logic
const scriptApp = document.createElement("script");
scriptApp.textContent = appScript;
document.head.appendChild(scriptApp);

// Run validations
setTimeout(() => {
  try {
    // 1. Verify architecture data is loaded globally
    if (!window.ARCHITECTURE_DATA || window.ARCHITECTURE_DATA.length !== 2400) {
      throw new Error(`window.ARCHITECTURE_DATA is not loaded or does not contain 2400 items. Found: ${window.ARCHITECTURE_DATA ? window.ARCHITECTURE_DATA.length : 0}`);
    }
    console.log(`✅ Loaded Architecture Database. Total items: ${window.ARCHITECTURE_DATA.length}`);

    // 2. Click the sidebar navigation menu button for Architecture Hub
    const navBtn = document.getElementById('btn-nav-architecture');
    if (!navBtn) {
      throw new Error("Sidebar navigation button '#btn-nav-architecture' not found!");
    }
    navBtn.click();
    console.log("✅ Navigation button clicked successfully.");

    // Verify view visibility
    const viewArch = document.getElementById('view-architecture');
    if (viewArch.classList.contains('hidden')) {
      throw new Error("Architecture view section '#view-architecture' is still hidden after navigation click!");
    }
    console.log("✅ Switch view to '#view-architecture' successful.");

    // 3. Verify topic chips exist in the horizontal scroll bar
    const topicChips = Array.from(document.querySelectorAll('#architecture-topic-selector .topic-chip'));
    if (topicChips.length !== 17) { // 16 topics + 1 'All Topics'
      throw new Error(`Expected 17 topic chips in selector, found: ${topicChips.length}`);
    }
    console.log("✅ Rendered all 16 topic filter chips + All Topics successfully.");

    // 4. Verify card elements are rendered inside the first expanded section
    const activeSectionBody = document.querySelector('.unified-section-body');
    if (!activeSectionBody) {
      throw new Error("Expected a collapsed/expanded section body to be rendered");
    }
    const cards = Array.from(activeSectionBody.querySelectorAll('.concept-accordion-card'));
    console.log(`✅ Rendered concept cards in default active section: ${cards.length}`);
    if (cards.length === 0) {
      throw new Error("No Q&A cards were rendered inside the default section!");
    }

    // 5. Test difficulty selector counts updating
    const easyCountBadge = document.getElementById('arch-count-diff-easy');
    if (!easyCountBadge || easyCountBadge.textContent === '0') {
      throw new Error("Difficulty count badges were not updated or show 0");
    }
    console.log(`✅ Difficulty count badge for 'Easy' populated: ${easyCountBadge.textContent}`);

    // 6. Test card expansion and lazy rendering
    const firstCard = cards[0];
    const cardHeader = firstCard.querySelector('.level-card-header');
    const cardBody = firstCard.querySelector('.level-card-body');
    
    if (cardBody.style.display !== 'none' || cardBody.dataset.rendered !== 'false') {
      throw new Error("Card body should be hidden and unrendered initially");
    }
    
    cardHeader.click();
    
    if (cardBody.style.display === 'none' || cardBody.dataset.rendered !== 'true') {
      throw new Error("Card body did not expand or set dataset.rendered to true");
    }
    console.log("✅ Lazy rendering and accordion card expansion verified successfully.");

    console.log("🎉 All Architecture Hub UI and DOM tests passed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err.message);
    process.exit(1);
  }
}, 500);
