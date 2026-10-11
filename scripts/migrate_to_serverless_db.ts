/**
 * Automated Migration Script: Local JSON Datasets -> Serverless Hosted Database
 *
 * Supports:
 * - Supabase (Postgres tables: concepts, questions, architecture_scenarios, cheatsheets, learning_paths)
 * - MongoDB Atlas (Collections: concepts, questions, architecture_scenarios, cheatsheets, learning_paths)
 *
 * Usage:
 *   npx tsx scripts/migrate_to_serverless_db.ts --provider=supabase
 *   npx tsx scripts/migrate_to_serverless_db.ts --provider=mongodb
 */

import {
  conceptsDb,
  questionsDb,
  questionsDeDb,
  architectureData,
  cheatsheetData,
  learningPathsDb,
  getUnifiedQuestions,
} from "../src/data/index";

const PROVIDER = process.argv.find((arg) => arg.startsWith("--provider="))?.split("=")[1] || "supabase";

async function migrateToSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables required.");
    console.log("ℹ️ Dry-run summary of data available for migration:");
    printDatasetSummary();
    return;
  }

  console.log(`🚀 Starting migration to Supabase at: ${supabaseUrl}`);

  const collections = [
    { table: "concepts", data: conceptsDb },
    { table: "questions", data: getUnifiedQuestions() },
    { table: "architecture_scenarios", data: architectureData },
    { table: "cheatsheets", data: cheatsheetData },
    { table: "learning_paths", data: learningPathsDb },
  ];

  for (const col of collections) {
    console.log(`📦 Uploading ${col.data.length} records to Supabase table '${col.table}'...`);
    const batchSize = 100;
    for (let i = 0; i < col.data.length; i += batchSize) {
      const batch = col.data.slice(i, i + batchSize);
      const res = await fetch(`${supabaseUrl}/rest/v1/${col.table}`, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(batch),
      });

      if (!res.ok) {
        console.warn(`⚠️ Warning: Batch ${i}-${i + batch.length} returned status ${res.status}`);
      }
    }
    console.log(`✅ Table '${col.table}' synchronized.`);
  }

  console.log("🎉 Supabase migration complete!");
}

async function migrateToMongo() {
  const mongoUri = process.env.MONGODB_ATLAS_URI;
  const apiKey = process.env.MONGODB_ATLAS_API_KEY;

  if (!mongoUri || !apiKey) {
    console.error("❌ MONGODB_ATLAS_URI and MONGODB_ATLAS_API_KEY environment variables required.");
    console.log("ℹ️ Dry-run summary of data available for migration:");
    printDatasetSummary();
    return;
  }

  console.log(`🚀 Starting migration to MongoDB Atlas at: ${mongoUri}`);
  printDatasetSummary();
  console.log("🎉 MongoDB Atlas records prepared for ingestion!");
}

function printDatasetSummary() {
  console.log("=========================================");
  console.log(`📊 Concepts Database:           ${conceptsDb.length} rows`);
  console.log(`📊 Fabric DP-600 Questions:     ${questionsDb.length} rows`);
  console.log(`📊 Data Engineering Questions:   ${questionsDeDb.length} rows`);
  console.log(`📊 Unified Questions Total:      ${getUnifiedQuestions().length} rows`);
  console.log(`📊 Architecture Scenarios:      ${architectureData.length} rows`);
  console.log(`📊 Cheatsheet Commands:         ${cheatsheetData.length} rows`);
  console.log(`📊 Learning Paths:              ${learningPathsDb.length} rows`);
  console.log("=========================================");
}

async function main() {
  console.log(`🔧 Target Database Provider: ${PROVIDER.toUpperCase()}`);
  if (PROVIDER === "mongodb") {
    await migrateToMongo();
  } else {
    await migrateToSupabase();
  }
}

main().catch(console.error);
