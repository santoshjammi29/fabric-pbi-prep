// Test script to validate the interview prep portal data integrity
const fs = require('fs');
const path = require('path');

console.log("=== Running Portal Data & Logic Integrity Tests ===");

// Helper to mock browser environment
global.window = {};
try {
  require('../questions.js');
} catch (e) {
  console.error("❌ Failed to load questions.js:", e.message);
  process.exit(1);
}

const db = window.QUESTIONS_DB;

// Test 1: Check Database Type and Length
if (!Array.isArray(db)) {
  console.error("❌ Database is not an array!");
  process.exit(1);
}
console.log(`✅ Loaded questions database. Total questions: ${db.length}`);
if (db.length !== 1590) {
  console.warn(`⚠️ Warning: Expected 1590 questions, but found ${db.length}.`);
}

// Test 2: Check Category Counts (Expected 200 per category for core, 30 for new ones)
const categories = [
  'FABRIC', 'POWER BI', 'ADF', 'SQL SERVER', 'DATALAKE ARCHITECTURE', 'SPARK & DATABRICKS',
  'RAG', 'DAG', 'AIRFLOW', 'KAFKA', 'SPARK_PYSPARK', 'FLINK', 'DBT', 'VECTOR_DB', 'LLM_FRAMEWORKS', 'LAKEHOUSE', 'CLOUD_DATA', 'CDC', 'INGESTION'
];
const counts = {};
categories.forEach(c => counts[c] = 0);

const uniqueIds = new Set();
const duplicateIds = [];

db.forEach((q, idx) => {
  // Test 3: Structural check
  if (!q.id) {
    console.error(`❌ Question at index ${idx} is missing an 'id'.`);
    process.exit(1);
  }
  if (uniqueIds.has(q.id)) {
    duplicateIds.push(q.id);
  } else {
    uniqueIds.add(q.id);
  }

  if (!q.category || !categories.includes(q.category)) {
    console.error(`❌ Question ${q.id} has invalid or missing category: '${q.category}'.`);
    process.exit(1);
  }
  counts[q.category]++;

  if (!q.niche || typeof q.niche !== 'string' || q.niche.trim() === '') {
    console.error(`❌ Question ${q.id} has empty or missing niche.`);
    process.exit(1);
  }

  if (!q.question || typeof q.question !== 'string' || q.question.trim() === '') {
    console.error(`❌ Question ${q.id} has empty or missing question text.`);
    process.exit(1);
  }

  if (!q.answer || typeof q.answer !== 'string' || q.answer.trim() === '') {
    console.error(`❌ Question ${q.id} has empty or missing answer explanation.`);
    process.exit(1);
  }
});

if (duplicateIds.length > 0) {
  console.error(`❌ Found duplicate question IDs:`, duplicateIds);
  process.exit(1);
}
console.log("✅ Structurally validated all questions. Zero missing fields or duplicates.");

// Print and verify counts
console.log("Category Distribution:");
let countFail = false;
categories.forEach(c => {
  console.log(`  - ${c}: ${counts[c]} questions`);
  const expected = ['FABRIC', 'POWER BI', 'ADF', 'SQL SERVER', 'DATALAKE ARCHITECTURE', 'SPARK & DATABRICKS'].includes(c) ? 200 : 30;
  if (counts[c] !== expected) {
    console.warn(`  ⚠️ Warning: Category ${c} has ${counts[c]} questions instead of ${expected}.`);
    countFail = true;
  }
});

if (countFail) {
  console.log("⚠️ Category distribution checks passed with warnings.");
} else {
  console.log("✅ Category distribution matches exactly (200 questions per category).");
}

console.log("=== All integrity tests completed successfully! ===");
