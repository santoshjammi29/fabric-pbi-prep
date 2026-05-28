const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const cleanHtml = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '');
const script = fs.readFileSync('app.js', 'utf8');
const data = fs.readFileSync('questions.js', 'utf8');

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

// Execute data
const scriptEl1 = document.createElement("script");
scriptEl1.textContent = data;
document.head.appendChild(scriptEl1);

// Execute app
const scriptEl2 = document.createElement("script");
scriptEl2.textContent = script;
document.head.appendChild(scriptEl2);

// Wait for DOMContentLoaded logic
setTimeout(() => {
    const scrollbar = document.getElementById('practice-topics-scrollbar');
    const fabricBtn = scrollbar.querySelector('button[data-category="FABRIC"]');
    
    console.log("Before click, nicheLauncherGrid has children:", document.getElementById('niche-launcher-grid').children.length);
    
    fabricBtn.click();
    
    console.log("After click, nicheLauncherGrid has children:", document.getElementById('niche-launcher-grid').children.length);
    
    // Check if the HTML inside the grid is correct
    console.log(document.getElementById('niche-launcher-grid').innerHTML.substring(0, 200));
    
}, 1000);
