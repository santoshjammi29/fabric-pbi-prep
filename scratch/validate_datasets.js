const fs = require('fs');
const path = require('path');

console.log("=== Auditing Datasets Structure and Integrity ===");

// Mock window object
global.window = {};

const datasets = [
  { file: 'data_concepts.js', key: 'CONCEPTS_DB', idField: 'id' },
  { file: 'data_python.js', key: 'PYTHON_DATA', idField: 'id' },
  { file: 'data_mssql.js', key: 'MSSQL_DATA', idField: 'id' },
  { file: 'data_pyspark.js', key: 'PYSPARK_DATA', idField: 'id' },
  { file: 'data_sparksql.js', key: 'SPARKSQL_DATA', idField: 'id' },
  { file: 'data_architecture.js', key: 'ARCHITECTURE_DATA', idField: 'id' },
  { file: 'data_de.js', key: 'QUESTIONS_DE_DB', idField: 'id' },
  { file: 'data_personalised.js', key: 'PERSONALISED_QUESTIONS', idField: 'id' }
];

let globalErrorCount = 0;

datasets.forEach(ds => {
  const filePath = path.join(__dirname, '..', ds.file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${ds.file}`);
    globalErrorCount++;
    return;
  }

  try {
    // Clear key from window first
    delete window[ds.key];
    
    // Read and execute file content
    const code = fs.readFileSync(filePath, 'utf8');
    eval(code);

    const data = window[ds.key];
    if (!data) {
      console.error(`❌ Variable window.${ds.key} was not populated by ${ds.file}`);
      globalErrorCount++;
      return;
    }

    if (!Array.isArray(data)) {
      console.error(`❌ Data in window.${ds.key} is not an array (type is ${typeof data})`);
      globalErrorCount++;
      return;
    }

    console.log(`\nAnalyzing ${ds.file} (${data.length} records):`);
    
    const uniqueIds = new Set();
    const duplicates = [];
    let missingIdCount = 0;
    let missingFieldsCount = 0;
    let mdFormatErrors = 0;

    data.forEach((item, idx) => {
      // Check ID
      const id = item[ds.idField];
      if (!id) {
        missingIdCount++;
      } else {
        if (uniqueIds.has(id)) {
          duplicates.push(id);
        } else {
          uniqueIds.add(id);
        }
      }

      // Check fields depending on dataset type
      if (ds.key === 'CONCEPTS_DB') {
        const required = ['term', 'category', 'difficulty', 'definition', 'explanation', 'keyPoints'];
        required.forEach(field => {
          if (!item[field]) {
            missingFieldsCount++;
            console.error(`  ❌ Missing property: ${field} in concept card ${id}`);
          }
        });
      } else if (ds.key === 'ARCHITECTURE_DATA') {
        const required = ['source', 'category', 'niche', 'difficulty', 'question', 'answer'];
        required.forEach(field => {
          if (!item[field]) {
            missingFieldsCount++;
            console.error(`  ❌ Missing property: ${field} in architecture card ${id}`);
          }
        });
      } else if (ds.key === 'PYTHON_DATA' || ds.key === 'MSSQL_DATA' || ds.key === 'PYSPARK_DATA' || ds.key === 'SPARKSQL_DATA') {
        const required = ['title', 'level', 'category', 'description', 'code', 'notes', 'use_case'];
        required.forEach(field => {
          if (!item[field]) {
            missingFieldsCount++;
            console.error(`  ❌ Missing property: ${field} in coding card ${id}`);
          }
        });
      } else if (ds.key === 'QUESTIONS_DE_DB') {
        const required = ['source', 'category', 'difficulty', 'question', 'answer'];
        required.forEach(field => {
          if (!item[field]) {
            missingFieldsCount++;
            console.error(`  ❌ Missing property: ${field} in DE question ${id}`);
          }
        });
      } else if (ds.key === 'PERSONALISED_QUESTIONS') {
        const required = ['category', 'niche', 'question', 'answer'];
        required.forEach(field => {
          if (!item[field]) {
            missingFieldsCount++;
            console.error(`  ❌ Missing property: ${field} in Personalised question ${id}`);
          }
        });
      }

      // Check for code block formatting bugs (e.g. unclosed backticks in answer/explanation/description/code)
      const textToCheck = (item.answer || '') + '\n' + (item.explanation || '') + '\n' + (item.description || '') + '\n' + (item.code || '');
      const backticksCount = (textToCheck.match(/```/g) || []).length;
      if (backticksCount % 2 !== 0) {
        mdFormatErrors++;
        console.warn(`  ⚠️ Uneven backticks count at index ${idx} (ID: ${id}) - markdown formatting issue!`);
      }
    });

    if (duplicates.length > 0) {
      console.error(`  ❌ Found duplicate IDs:`, duplicates.slice(0, 5));
      globalErrorCount += duplicates.length;
    }
    if (missingIdCount > 0) {
      console.error(`  ❌ Found ${missingIdCount} items with missing ID fields`);
      globalErrorCount += missingIdCount;
    }
    if (missingFieldsCount > 0) {
      console.error(`  ❌ Found ${missingFieldsCount} missing required properties`);
      globalErrorCount += missingFieldsCount;
    }
    if (mdFormatErrors > 0) {
      console.error(`  ❌ Found ${mdFormatErrors} items with unclosed markdown code blocks`);
      globalErrorCount += mdFormatErrors;
    }

    if (duplicates.length === 0 && missingIdCount === 0 && missingFieldsCount === 0 && mdFormatErrors === 0) {
      console.log(`  ✅ All records are structurally valid, unique, and formatted correctly.`);
    }

  } catch (err) {
    console.error(`❌ Failed to parse or load ${ds.file}:`, err.message);
    globalErrorCount++;
  }
});

console.log(`\n=== Audit Summary: ${globalErrorCount} errors/warnings found. ===`);
if (globalErrorCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
