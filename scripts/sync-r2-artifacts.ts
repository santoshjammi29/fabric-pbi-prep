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

async function uploadArtifacts() {
  const files = listFiles(artifactRoot);
  if (files.length === 0) {
    throw new Error(`No generated artifacts found in ${artifactRoot}. Run "npm run content:shard" first.`);
  }

  let nextFileIndex = 0;
  const uploadNext = async () => {
    while (nextFileIndex < files.length) {
      const file = files[nextFileIndex++];
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
  };

  await Promise.all(Array.from({ length: Math.min(6, files.length) }, uploadNext));
  console.log(`Uploaded ${files.length} artifact objects to ${bucketName}.`);
}

uploadArtifacts().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
