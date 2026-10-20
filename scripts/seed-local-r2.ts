import fs from 'fs';
import path from 'path';

const ARTIFACTS_SRC = path.join(process.cwd(), '.build-artifacts', 'r2');
const WRANGLER_R2_DEST = path.join(
  process.cwd(),
  '.wrangler',
  'state',
  'v3',
  'r2',
  'lakehouse-artifacts'
);
const PUBLIC_FALLBACK_DEST = path.join(process.cwd(), 'public', '_artifacts');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function run() {
  console.log('--- Seeding Local R2 & Preview Artifacts ---');
  if (!fs.existsSync(ARTIFACTS_SRC)) {
    console.error('Artifacts directory does not exist! Run "npm run content:shard" first.');
    process.exit(1);
  }

  // 1. Seed to Wrangler state directory if using local Miniflare R2
  try {
    ensureDir(WRANGLER_R2_DEST);
    fs.cpSync(ARTIFACTS_SRC, WRANGLER_R2_DEST, { recursive: true });
    console.log(`✓ Seeded local Wrangler R2 bucket at ${WRANGLER_R2_DEST}`);
  } catch (err) {
    console.warn('Note: Could not write to Wrangler local R2 state (will use fallback):', err);
  }

  // 2. Also copy to public/_artifacts so local Next.js dev server can serve it without Miniflare
  try {
    ensureDir(PUBLIC_FALLBACK_DEST);
    fs.cpSync(ARTIFACTS_SRC, PUBLIC_FALLBACK_DEST, { recursive: true });
    console.log(`✓ Seeded local fallback at ${PUBLIC_FALLBACK_DEST}`);
  } catch (err) {
    console.warn('Note: Could not copy to public/_artifacts:', err);
  }

  console.log('✓ Local R2 seeding complete.');
}

run();
