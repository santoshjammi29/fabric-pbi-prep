import { createHash } from "node:crypto";
import { z } from "zod";

export const MAX_WORKER_SOURCE_BYTES = 64 * 1024;

const deploymentNameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/, {
    error: "Use a 1-32 character name containing lowercase letters, numbers, and internal hyphens.",
  });

export function parseDeploymentName(value: unknown): string {
  return deploymentNameSchema.parse(value);
}

export function getTenantWorkerPrefix(ownerId: string): string {
  const tenantHash = createHash("sha256").update(ownerId).digest("hex").slice(0, 24);
  return `t-${tenantHash}-`;
}

export function getWorkerScriptName(ownerId: string, deploymentName: string): string {
  return `${getTenantWorkerPrefix(ownerId)}${parseDeploymentName(deploymentName)}`;
}

export function getWorkerRuntimeUrl(runtimeBaseUrl: string, workerName: string): string {
  const base = new URL(runtimeBaseUrl);
  if (base.protocol !== "https:" && !(process.env.NODE_ENV === "development" && base.protocol === "http:")) {
    throw new Error("CUSTOMER_WORKERS_RUNTIME_URL must use HTTPS.");
  }
  if (base.username || base.password) {
    throw new Error("CUSTOMER_WORKERS_RUNTIME_URL must not contain credentials.");
  }
  base.pathname = `/run/${encodeURIComponent(workerName)}`;
  base.search = "";
  base.hash = "";
  return base.toString();
}
