const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const cleanHtml = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '');
const script = fs.readFileSync('app.js', 'utf8');

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

window.tailwind = { config: {} };
window.Chart = class {
  constructor() {}
  destroy() {}
};
window.matchMedia = window.matchMedia || function() {
  return { matches: false, addListener: function() {}, removeListener: function() {} };
};

// Set up collapsed in storage to test state restore on load
storage['sidebar_collapsed'] = 'true';

// Execute app.js
const scriptEl = document.createElement("script");
scriptEl.textContent = script;
document.head.appendChild(scriptEl);

setTimeout(() => {
  console.log("=== Running Sidebar Collapse Tests ===");
  
  const appContainer = document.getElementById('app-container');
  if (!appContainer) {
    console.error("❌ Test Failed: app-container not found.");
    process.exit(1);
  }
  
  // Verify state restore on load
  console.log("Sidebar collapsed class on load:", appContainer.classList.contains('sidebar-collapsed'));
  if (!appContainer.classList.contains('sidebar-collapsed')) {
    console.error("❌ Test Failed: sidebar-collapsed class not restored from localStorage.");
    process.exit(1);
  }
  console.log("✅ Successfully verified state restore from localStorage.");

  // Test click toggle
  const toggleBtn = document.getElementById('btn-sidebar-toggle');
  if (!toggleBtn) {
    console.error("❌ Test Failed: btn-sidebar-toggle not found in DOM.");
    process.exit(1);
  }
  
  // Click to expand
  toggleBtn.click();
  console.log("Clicked sidebar toggle. Collapsed class exists:", appContainer.classList.contains('sidebar-collapsed'));
  if (appContainer.classList.contains('sidebar-collapsed')) {
    console.error("❌ Test Failed: sidebar should be expanded after click.");
    process.exit(1);
  }
  if (window.localStorage.getItem('sidebar_collapsed') !== 'false') {
    console.error("❌ Test Failed: localStorage should be set to false.");
    process.exit(1);
  }
  
  // Click to minimize again
  toggleBtn.click();
  console.log("Clicked sidebar toggle again. Collapsed class exists:", appContainer.classList.contains('sidebar-collapsed'));
  if (!appContainer.classList.contains('sidebar-collapsed')) {
    console.error("❌ Test Failed: sidebar should be collapsed after second click.");
    process.exit(1);
  }
  if (window.localStorage.getItem('sidebar_collapsed') !== 'true') {
    console.error("❌ Test Failed: localStorage should be set to true.");
    process.exit(1);
  }
  console.log("✅ Successfully verified toggle clicks and localStorage updates.");

  // Test 3: Drag Resize verification
  const resizer = document.getElementById('sidebar-resizer');
  if (!resizer) {
    console.error("❌ Test Failed: sidebar-resizer not found in DOM.");
    process.exit(1);
  }

  // Verify dragging
  // Expand first
  if (appContainer.classList.contains('sidebar-collapsed')) {
    toggleBtn.click();
  }

  console.log("Simulating sidebar resize drag...");
  // Simulate mousedown on resizer
  const mousedownEvent = new window.MouseEvent('mousedown', { bubbles: true, cancelable: true });
  resizer.dispatchEvent(mousedownEvent);

  // Simulate mousemove on document to set width to 320px
  const mousemoveEvent = new window.MouseEvent('mousemove', {
    bubbles: true,
    cancelable: true,
    clientX: 320
  });
  document.dispatchEvent(mousemoveEvent);

  // Simulate mouseup
  const mouseupEvent = new window.MouseEvent('mouseup', { bubbles: true, cancelable: true });
  document.dispatchEvent(mouseupEvent);

  const customWidthVal = window.localStorage.getItem('sidebar_custom_width');
  console.log("Saved sidebar_custom_width in localStorage:", customWidthVal);
  if (customWidthVal !== '320') {
    console.error("❌ Test Failed: Custom width 320px was not stored in localStorage, got " + customWidthVal);
    process.exit(1);
  }

  const currentColumns = appContainer.style.gridTemplateColumns;
  console.log("Current columns style:", currentColumns);
  if (currentColumns !== '320px 1fr') {
    console.error("❌ Test Failed: grid-template-columns inline style not set to '320px 1fr', got: " + currentColumns);
    process.exit(1);
  }

  // Collapse and verify width changes to 68px
  toggleBtn.click();
  console.log("Columns after collapse:", appContainer.style.gridTemplateColumns);
  if (appContainer.style.gridTemplateColumns !== '68px 1fr') {
    console.error("❌ Test Failed: Columns should be '68px 1fr' when collapsed.");
    process.exit(1);
  }

  // Expand and verify it restores to 320px
  toggleBtn.click();
  console.log("Columns after expand restore:", appContainer.style.gridTemplateColumns);
  if (appContainer.style.gridTemplateColumns !== '320px 1fr') {
    console.error("❌ Test Failed: Columns should restore to custom width '320px 1fr'.");
    process.exit(1);
  }

  console.log("✅ Successfully verified dynamic sidebar dragging and layout persistence.");

  console.log("=== All Sidebar Minimize/Expand DOM tests passed successfully! ===");
  process.exit(0);
}, 1000);
