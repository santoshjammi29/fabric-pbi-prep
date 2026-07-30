// Unit test suite for Modern Data Engineering & AI Architecture Hub
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== Running Modern Data Stack Unit Tests ===');

// 1. Verify dataset file exists
const datasetPath = path.join(__dirname, '..', 'data_modern_stack.js');
assert.strictEqual(fs.existsSync(datasetPath), true, 'data_modern_stack.js should exist');
console.log('✅ data_modern_stack.js exists on disk.');

// 2. Mock DOM environment for dataset and handlers
const dataContent = fs.readFileSync(datasetPath, 'utf8');
const globalWindow = {};
eval(`(function(window) { ${dataContent} })(globalWindow);`);

assert.ok(globalWindow.MODERN_CONCEPTS_DB.length >= 14, 'Should contain key concepts across 14 sub-domains');
assert.ok(globalWindow.MODERN_BLUEPRINTS_DB.length === 12, 'Should contain 12 architecture blueprints');
assert.ok(globalWindow.MODERN_CODE_MATRIX.length >= 3, 'Should contain polyglot matrix topics');
assert.ok(globalWindow.MODERN_STACK_DB.length >= 4, 'Should contain modern stack Q&As');

console.log('✅ Modern Stack Datasets validated successfully.');
console.log('🎉 All Modern Data Stack Unit Tests Passed!');
