const fs = require('fs');
const path = require('path');

// Ensure data folder exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper to mock window object and load file
function loadDatabase(filename, varname) {
  global.window = {};
  const filePath = path.join(__dirname, '../', filename);
  try {
    require(filePath);
    return global.window[varname];
  } catch (e) {
    console.error(`Error loading ${filename}:`, e);
    return null;
  }
}

const core = loadDatabase('questions.js', 'QUESTIONS_DB');
const general = loadDatabase('data_de.js', 'QUESTIONS_DE_DB');
const personalised = loadDatabase('data_personalised.js', 'PERSONALISED_QUESTIONS');

if (core) {
  fs.writeFileSync(path.join(dataDir, 'core.json'), JSON.stringify(core, null, 2));
  console.log(`Dumped core: ${core.length} questions`);
}
if (general) {
  fs.writeFileSync(path.join(dataDir, 'general.json'), JSON.stringify(general, null, 2));
  console.log(`Dumped general: ${general.length} questions`);
}
if (personalised) {
  fs.writeFileSync(path.join(dataDir, 'personalised.json'), JSON.stringify(personalised, null, 2));
  console.log(`Dumped personalised: ${personalised.length} questions`);
}

console.log("All JSON files dumped successfully!");
