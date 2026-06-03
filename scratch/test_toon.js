const fs = require('fs');

function parseToon(text) {
  const lines = text.split(/\r?\n/);
  const records = [];
  let currentObj = null;
  let currentField = null;
  let blockLines = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we are inside a multiline block
    if (currentField && blockLines !== null) {
      if (line.trim() === '') {
        blockLines.push('');
        continue;
      }
      
      const matchIndent = line.match(/^(\s+)/);
      const indent = matchIndent ? matchIndent[1].length : 0;
      
      if (indent >= 4) {
        blockLines.push(line.substring(4)); // Strip 4 spaces of indentation
        continue;
      } else {
        // End of block string
        currentObj[currentField] = blockLines.join('\n');
        currentField = null;
        blockLines = null;
      }
    }
    
    // Check if it's a new record starting with a hyphen
    if (line.startsWith('- ')) {
      currentObj = {};
      records.push(currentObj);
      
      const kvLine = line.substring(2);
      const colonIdx = kvLine.indexOf(':');
      if (colonIdx !== -1) {
        const key = kvLine.substring(0, colonIdx).trim();
        const value = kvLine.substring(colonIdx + 1).trim();
        if (value === '|') {
          currentField = key;
          blockLines = [];
        } else {
          currentObj[key] = value;
        }
      }
      continue;
    }
    
    // Parse normal key-value properties
    const match = line.match(/^\s{2}([a-zA-Z0-9_]+)\s*:\s*(.*)$/);
    if (match && currentObj) {
      const key = match[1];
      const value = match[2].trim();
      if (value === '|') {
        currentField = key;
        blockLines = [];
      } else {
        currentObj[key] = value;
      }
    }
  }
  
  // Flush any remaining block at the end of the file
  if (currentObj && currentField && blockLines) {
    currentObj[currentField] = blockLines.join('\n');
  }
  
  return records;
}

// Verification test
const testToon = `- id: test-1
  source: Personalised
  category: Microsoft Fabric, OneLake & Direct Lake Architecture
  question: |
    First line of question.
    Second line of question.
  answer: |
    First line of answer.
    
    Third line of answer after empty line.
- id: test-2
  source: Core
  category: ADF
  question: Short question?
  answer: Short answer.`;

console.log("Parsing test data...");
const parsed = parseToon(testToon);
console.log(JSON.stringify(parsed, null, 2));

if (parsed.length === 2 && 
    parsed[0].id === 'test-1' && 
    parsed[0].question === 'First line of question.\nSecond line of question.' && 
    parsed[0].answer === 'First line of answer.\n\nThird line of answer after empty line.' &&
    parsed[1].id === 'test-2' &&
    parsed[1].question === 'Short question?' &&
    parsed[1].answer === 'Short answer.') {
  console.log("✅ Parser test passed successfully!");
} else {
  console.error("❌ Parser test failed!");
  process.exit(1);
}
