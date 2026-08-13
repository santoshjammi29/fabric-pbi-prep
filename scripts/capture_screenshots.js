/**
 * capture_screenshots.js
 * Captures 42 screenshots across 6 breakpoints (375, 414, 768, 1024, 1440, 1920)
 * for 7 tabs (Home, Concepts, Code, Spark, Q&A, Arch, GCC).
 *
 * Usage: node scripts/capture_screenshots.js [before|after]
 */

const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const mode = process.argv[2] || 'before';
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'audit', 'screenshots', mode);

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const breakpoints = [
  { name: '375px', width: 375, height: 812 },
  { name: '414px', width: 414, height: 896 },
  { name: '768px', width: 768, height: 1024 },
  { name: '1024px', width: 1024, height: 768 },
  { name: '1440px', width: 1440, height: 900 },
  { name: '1920px', width: 1920, height: 1080 },
];

const tabs = [
  { id: 'view-dashboard', name: 'home' },
  { id: 'view-concepts', name: 'concepts' },
  { id: 'view-cheatsheet', name: 'code' },
  { id: 'view-spark-hub', name: 'spark' },
  { id: 'view-prep-hub', name: 'qa' },
  { id: 'view-architecture', name: 'arch' },
  { id: 'view-gcc', name: 'gcc' },
];

// Helper to serve files locally
function createServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
  };

  return http.createServer((req, res) => {
    let filePath = path.join(rootDir, req.url === '/' ? 'index.html' : req.url.split('#')[0]);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(rootDir, 'index.html');
    }
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'text/plain';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
  });
}

(async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(8089, resolve));
  console.log('🚀 Local server started on http://localhost:8089');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  console.log(`📸 Capturing ${mode.toUpperCase()} screenshots (${breakpoints.length * tabs.length} total)...`);

  for (const bp of breakpoints) {
    for (const tab of tabs) {
      const page = await browser.newPage();
      await page.setViewport({ width: bp.width, height: bp.height });

      const targetUrl = `http://localhost:8089/#${tab.id}`;
      await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 30000 });

      // Trigger view switch programmatically if needed
      await page.evaluate((tabId) => {
        if (window.switchView) {
          window.switchView(tabId);
        }
      }, tab.id);

      await new Promise(r => setTimeout(r, 600));

      const filename = `${tab.name}_${bp.name}.png`;
      const filepath = path.join(outDir, filename);
      await page.screenshot({ path: filepath, fullPage: false });

      console.log(`  └─ Saved: ${filename}`);
      await page.close();
    }
  }

  await browser.close();
  server.close();
  console.log(`✅ All ${breakpoints.length * tabs.length} ${mode} screenshots saved to ${outDir}`);
})();
