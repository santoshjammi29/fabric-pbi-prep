import { execFile } from "node:child_process";
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { promisify } from "node:util";

const artifactRoot = path.resolve(".build-artifacts/r2");
const bucketName = "lakehouse-artifacts";
const hashFilePath = path.join(artifactRoot, ".last-synced-hash");
const run = promisify(execFile);

function listFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    if (entry.startsWith(".")) return [];
    const absolutePath = path.join(directory, entry);
    return statSync(absolutePath).isDirectory()
      ? listFiles(absolutePath)
      : [absolutePath];
  });
}

async function putObject(file: string, maxAttempts = 3): Promise<void> {
  const key = path.relative(artifactRoot, file).split(path.sep).join("/");
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await run(
        "npx",
        ["wrangler", "r2", "object", "put", `${bucketName}/${key}`, `--file=${file}`, "--remote"],
        { maxBuffer: 1024 * 1024, env: process.env },
      );
      console.log(`Uploaded ${key}`);
      return;
    } catch (error) {
      const details = error as NodeJS.ErrnoException & { stderr?: string };
      const message = details.stderr || details.message;
      if (attempt === maxAttempts) {
        throw new Error(`Failed to upload ${key} after ${maxAttempts} attempts: ${message}`);
      }
      console.warn(`[attempt ${attempt}/${maxAttempts} failed for ${key}]: ${message}. Retrying in ${attempt * 1000}ms...`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
}

async function uploadArtifacts() {
  const files = listFiles(artifactRoot);
  if (files.length === 0) {
    throw new Error(`No generated artifacts found in ${artifactRoot}. Run "npm run content:shard" first.`);
  }

  const manifestFiles = files.filter((file) => path.basename(file) === "manifest.json");
  if (manifestFiles.length !== 1) {
    throw new Error(`Expected exactly one manifest.json; found ${manifestFiles.length}.`);
  }

  const manifestPath = manifestFiles[0];
  const currentManifestHash = crypto
    .createHash("sha256")
    .update(readFileSync(manifestPath))
    .digest("hex");

  const isForce = process.argv.includes("--force");
  if (!isForce && existsSync(hashFilePath)) {
    try {
      const lastHash = readFileSync(hashFilePath, "utf-8").trim();
      if (lastHash === currentManifestHash) {
        console.log(
          `⚡ R2 artifacts are already up-to-date (manifest hash: ${currentManifestHash.slice(0, 12)}). Skipping upload. Use --force to re-upload.`
        );
        return;
      }
    } catch {}
  }

  // Publish immutable content first. The manifest is the pointer to the current
  // release, so it must not become visible before every referenced object exists.
  const contentFiles = files.filter((file) => !manifestFiles.includes(file));

  let nextFileIndex = 0;
  const uploadNext = async () => {
    while (nextFileIndex < contentFiles.length) {
      const file = contentFiles[nextFileIndex++];
      await putObject(file);
    }
  };

  await Promise.all(Array.from({ length: Math.min(6, contentFiles.length) }, uploadNext));
  await putObject(manifestPath);

  try {
    writeFileSync(hashFilePath, currentManifestHash, "utf-8");
  } catch {}

  console.log(`Uploaded ${contentFiles.length} content objects and published manifest to ${bucketName}.`);
}

uploadArtifacts().catch((error: unknown) => {
  const errMsg = String((error as any)?.message || error);
  console.error("R2 sync error:", errMsg);
  // In CI or deployment, if R2 fails due to token permissions (e.g., Code 10000 / 403 / auth error),
  // warn instead of aborting the deployment so OpenNext Cloudflare Worker can still deploy successfully.
  if (
    process.env.CONTINUE_ON_R2_ERROR === "true" ||
    process.env.CI === "true" ||
    errMsg.includes("10000") ||
    errMsg.includes("Authentication") ||
    errMsg.includes("unauthorized") ||
    errMsg.includes("forbidden")
  ) {
    console.warn("⚠️ Warning: R2 sync failed or lacked permissions. Continuing deployment with local/worker asset bundle.");
    process.exitCode = 0;
  } else {
    process.exitCode = 1;
  }
});
