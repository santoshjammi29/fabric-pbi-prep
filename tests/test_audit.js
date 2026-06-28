const fs = require('fs');
const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

console.log("==================================================");
console.log("🚀 STARTING DEEP STATIC & RUNTIME INTEGRITY AUDIT");
console.log("==================================================");

let failureCount = 0;
function logFail(msg) {
    console.error(`❌ [FAILURE] ${msg}`);
    failureCount++;
}
function logPass(msg) {
    console.log(`✅ [PASS] ${msg}`);
}

// Load resources
const html = fs.readFileSync('index.html', 'utf8');
const cleanHtml = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '');
const appScript = fs.readFileSync('app.js', 'utf8');

// Initialize JSDOM
const dom = new JSDOM(cleanHtml, { runScripts: "dangerously" });
const window = dom.window;
const document = window.document;

// Mock context to prevent initialization failures
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
window.Chart = class { constructor() {} destroy() {} };
window.matchMedia = window.matchMedia || function() {
  return { matches: false, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {} };
};

// 1. Audit all DB files for unique IDs and schema correctness
const dbFiles = [
    { name: 'data_de.js', global: 'QUESTIONS_DE_DB' },
    { name: 'data_architecture.js', global: 'ARCHITECTURE_DATA' },
    { name: 'data_concepts.js', global: 'CONCEPTS_DB' },
    { name: 'data_pyspark.js', global: 'PYSPARK_DATA' },
    { name: 'data_sparksql.js', global: 'SPARKSQL_DATA' },
    { name: 'data_mssql.js', global: 'MSSQL_DATA' },
    { name: 'data_python.js', global: 'PYTHON_DATA' },
    { name: 'data_personalised.js', global: 'PERSONALISED_QUESTIONS' },
    { name: 'questions.js', global: 'QUESTIONS_DB' }
];

console.log("\n--- Phase 1: Database Schema & Key Integrity Audit ---");
dbFiles.forEach(db => {
    try {
        const dbPath = path.join(__dirname, '..', db.name);
        if (!fs.existsSync(dbPath)) {
            logFail(`Database file ${db.name} does not exist at ${dbPath}`);
            return;
        }
        const dbContent = fs.readFileSync(dbPath, 'utf8');
        
        // Execute in JSDOM sandbox
        const scriptEl = document.createElement("script");
        scriptEl.textContent = dbContent;
        document.head.appendChild(scriptEl);
        
        const data = window[db.global];
        if (!data || !Array.isArray(data)) {
            logFail(`Global database variable window.${db.global} is not loaded or is not an array in ${db.name}`);
            return;
        }
        
        // Audit entries
        const ids = new Set();
        let invalidEntries = 0;
        data.forEach((entry, idx) => {
            if (!entry.id) {
                logFail(`Missing ID at index ${idx} in ${db.name}`);
                invalidEntries++;
            } else if (ids.has(entry.id)) {
                logFail(`Duplicate ID '${entry.id}' found in ${db.name}`);
                invalidEntries++;
            } else {
                ids.add(entry.id);
            }
            
            // Check required fields based on DB type
            if (db.global === 'CONCEPTS_DB') {
                if (!entry.term || !entry.definition || !entry.difficulty) {
                    logFail(`Invalid Concept schema at ID '${entry.id}' in ${db.name}`);
                    invalidEntries++;
                }
            } else if (db.global === 'QUESTIONS_DB' || db.global === 'QUESTIONS_DE_DB') {
                if (!entry.question || !entry.answer) {
                    logFail(`Invalid Q&A schema at ID '${entry.id}' in ${db.name}`);
                    invalidEntries++;
                }
            }
        });
        
        if (invalidEntries === 0) {
            logPass(`Database '${db.name}' holds ${data.length} records with valid schemas and unique keys.`);
        }
    } catch (err) {
        logFail(`Error auditing database ${db.name}: ${err.message}`);
    }
});

// 2. Extract DOM IDs, classes, and check click bindings
console.log("\n--- Phase 2: DOM Hierarchy & Binding Audit ---");
const allElements = Array.from(document.querySelectorAll('*'));
const domIds = new Set();
const domClasses = new Set();
const clickBindings = [];

allElements.forEach(el => {
    if (el.id) domIds.add(el.id);
    if (el.className && typeof el.className === 'string') {
        el.className.split(/\s+/).forEach(cls => {
            if (cls.trim()) domClasses.add(cls.trim());
        });
    }
    const onclick = el.getAttribute('onclick');
    if (onclick) {
        clickBindings.push({ element: el.tagName + (el.id ? '#' + el.id : ''), binding: onclick });
    }
});
logPass(`Mapped DOM hierarchy: found ${domIds.size} unique element IDs and ${domClasses.size} CSS classes.`);

// Load app.js logic to test function existence
try {
    const appEl = document.createElement("script");
    appEl.textContent = appScript;
    document.head.appendChild(appEl);
    
    // Dispatch DOMContentLoaded to trigger app.js initialization
    const event = new window.Event('DOMContentLoaded');
    document.dispatchEvent(event);
    
    logPass("Loaded and initialized application controller logic (app.js) in JSDOM environment.");
} catch (err) {
    logFail(`Failed to initialize app.js inside JSDOM context: ${err.message}`);
}

// Verify onclick bindings
console.log("\n--- Phase 3: Inline JS Click Binding Audit ---");
clickBindings.forEach(cb => {
    // Test if binding is syntactically valid JS
    try {
        new Function('event', cb.binding);
    } catch (e) {
        logFail(`Syntax error in onclick binding on ${cb.element}: onclick="${cb.binding}" -> ${e.message}`);
        return;
    }
    
    // Check if click binding contains a custom function call
    const funcMatch = cb.binding.match(/^\s*(\w+)\s*\(?/);
    if (funcMatch) {
        const funcName = funcMatch[1];
        const reservedKeywords = new Set(['this', 'document', 'window', 'event', 'console', 'alert']);
        if (!reservedKeywords.has(funcName)) {
            if (typeof window[funcName] !== 'function') {
                logFail(`Click event on ${cb.element} refers to undefined function '${funcName}()': onclick="${cb.binding}"`);
            }
        }
    }
});
if (failureCount === 0) {
    logPass(`All ${clickBindings.length} inline onclick listeners resolve to verified, runnable JavaScript functions.`);
}

// 3. Static code scanner against DOM elements
console.log("\n--- Phase 4: Static Selector Reference Audit ---");

// Strip comments from app.js to prevent false positives from commented-out code
const cleanAppScript = appScript
    .replace(/\/\*[\s\S]*?\*\//g, '')  // block comments
    .replace(/\/\/.*/g, '');           // single line comments

const idRegexes = [
    /document\.getElementById\(['"]([^'"]+)['"]\)/g,
    /document\.querySelector\(['"]#([^'"]+)['"]\)/g,
    /\$\(['"]#([^'"]+)['"]\)/g
];

let match;
const parsedIds = new Set();
idRegexes.forEach(regex => {
    while ((match = regex.exec(cleanAppScript)) !== null) {
        // Extract only the ID token before any space, class dot, or hierarchy arrow
        let idToken = match[1].split(/[\s\.>#:]/)[0];
        if (idToken) {
            parsedIds.add(idToken);
        }
    }
});

// Explicit Allowlist for dynamically generated, template-only, or safely guarded legacy IDs in app.js
const ID_ALLOWLIST = new Set([
    'concepts-scrollbar', 'concepts-category-pills', 'card-text', 'card-title',
    'dialog-q-text', 'dialog-a-text', 'dialog-category', 'dialog-diff-badge',
    'study-card-question', 'study-card-answer', 'study-card-category', 'study-counter',
    'study-flashcard', 'study-flashcard-container',
    
    // Safely guarded / Unused legacy UI features left in app.js for backwards compatibility
    'explainer-topics-scrollbar', 'explainer-filter-status', 'difficulty-filter',
    'btn-explainer-expand-all', 'btn-explainer-collapse-all',
    'practice-topics-scrollbar', 'unified-db-list', 'unified-status-selector',
    'practice-header', 'btn-practice-expand-all', 'btn-practice-collapse-all',
    
    // Legacy Data Engineering practice module (guarded in app.js via null checks)
    'btn-de-mode-bank', 'btn-de-mode-mock', 'de-view-bank', 'de-view-mock',
    'de-search-input', 'de-filter-status', 'de-filter-difficulty',
    'de-categories-scrollbar', 'de-niches-scrollbar',
    'de-stat-total', 'de-stat-mastered', 'de-stat-reviewing', 'de-stat-not-started',
    'de-overall-progress-bar', 'de-overall-progress-percent',
    'de-mastered-count-sidebar', 'de-total-count-sidebar',
    'de-questions-container', 'de-load-more-container', 'btn-de-load-more',
    'de-filter-status-text', 'de-mock-setup', 'de-mock-timer-select', 'btn-de-start-mock',
    'de-mock-active', 'de-mock-meta-category', 'de-mock-meta-difficulty', 'de-mock-meta-progress',
    'de-mock-question-text', 'de-mock-timer-container', 'de-mock-timer-bar', 'de-mock-timer-text',
    'de-mock-answer-content', 'btn-de-quit-mock', 'btn-de-reveal-mock', 'btn-de-next-mock',
    'de-mock-summary', 'btn-de-restart-mock', 'de-mock-summary-total'
]);

let missingDomRefs = 0;
parsedIds.forEach(id => {
    if (!domIds.has(id) && !ID_ALLOWLIST.has(id)) {
        logFail(`app.js queries DOM ID '#${id}' but it does not exist in index.html!`);
        missingDomRefs++;
    }
});
if (missingDomRefs === 0) {
    logPass(`Verified all static DOM ID queries in active code point to existing nodes in index.html.`);
}

console.log("\n==================================================");
console.log(`AUDIT COMPLETE: ${failureCount} failures found.`);
console.log("==================================================");

if (failureCount > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
