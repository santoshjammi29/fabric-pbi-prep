import { execFile } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const artifactRoot = path.resolve(".build-artifacts/r2");
const bucketName = "lakehouse-artifacts";
const run = promisify(execFile);

function listFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const absolutePath = path.join(directory, entry);
    return statSync(absolutePath).isDirectory()
      ? listFiles(absolutePath)
      : [absolutePath];
  });
}

async function putObject(file: string): Promise<void> {
  const key = path.relative(artifactRoot, file).split(path.sep).join("/");
  try {
    await run(
      "npx",
      ["wrangler", "r2", "object", "put", `${bucketName}/${key}`, `--file=${file}`, "--remote"],
      { maxBuffer: 1024 * 1024 },
    );
    console.log(`Uploaded ${key}`);
  } catch (error) {
    const details = error as NodeJS.ErrnoException & { stderr?: string };
    throw new Error(`Failed to upload ${key}: ${details.stderr || details.message}`);
  }
}

async function uploadArtifacts() {
  const files = listFiles(artifactRoot);
  if (files.length === 0) {
    throw new Error(`No generated artifacts found in ${artifactRoot}. Run "npm run content:shard" first.`);
  }

  // Publish immutable content first. The manifest is the pointer to the current
  // release, so it must not become visible before every referenced object exists.
  const manifestFiles = files.filter((file) => path.basename(file) === "manifest.json");
  if (manifestFiles.length !== 1) {
    throw new Error(`Expected exactly one manifest.json; found ${manifestFiles.length}.`);
  }
  const contentFiles = files.filter((file) => !manifestFiles.includes(file));

  let nextFileIndex = 0;
  const uploadNext = async () => {
    while (nextFileIndex < contentFiles.length) {
      const file = contentFiles[nextFileIndex++];
      await putObject(file);
    }
  };

  await Promise.all(Array.from({ length: Math.min(6, contentFiles.length) }, uploadNext));
  await putObject(manifestFiles[0]);
  console.log(`Uploaded ${contentFiles.length} content objects and published manifest to ${bucketName}.`);
}

uploadArtifacts().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
