// Unit test suite for Data Architect Studio Learning OS
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== Running Data Architect Studio Learning OS Tests ===');

// 1. Verify data_paths.js exists and loads properly
const pathsFilePath = path.join(__dirname, '..', 'data_paths.js');
assert.strictEqual(fs.existsSync(pathsFilePath), true, 'data_paths.js file should exist');

const pathsContent = fs.readFileSync(pathsFilePath, 'utf8');
const globalWindow = {};
eval(`(function(window) { ${pathsContent} })(globalWindow);`);

assert.ok(globalWindow.LEARNING_PATHS_DB, 'window.LEARNING_PATHS_DB must be defined');
assert.strictEqual(globalWindow.LEARNING_PATHS_DB.length, 12, 'Must contain exactly 12 learning paths');

// Validate key paths exist
const fabricPath = globalWindow.LEARNING_PATHS_DB.find(p => p.slug === 'fabric-dp600');
assert.ok(fabricPath, 'Fabric DP-600 path must exist');
assert.strictEqual(fabricPath.weeks, 8);
assert.ok(fabricPath.phases.length >= 3, 'Must contain phases with milestones');

const archPath = globalWindow.LEARNING_PATHS_DB.find(p => p.slug === 'architecture-mastery');
assert.ok(archPath, 'Architecture Mastery 32-week path must exist');
assert.strictEqual(archPath.weeks, 32);

console.log('✅ All 12 Senior Data Engineering Learning Paths validated successfully.');

// 2. Verify index.html contains command palette and new views
const htmlPath = path.join(__dirname, '..', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

assert.ok(htmlContent.includes('id="cmd-palette-modal"'), 'index.html must contain ⌘K Command Palette modal');
assert.ok(htmlContent.includes('id="view-paths"'), 'index.html must contain #view-paths section');
assert.ok(htmlContent.includes('id="view-account"'), 'index.html must contain #view-account section');
assert.ok(htmlContent.includes('data_paths.js'), 'index.html must include data_paths.js script tag');

console.log('✅ index.html structure & Command Palette validated successfully.');
console.log('🎉 All Learning OS Unit Tests Passed!');
