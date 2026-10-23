import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getTenantWorkerPrefix,
  getWorkerRuntimeUrl,
  getWorkerScriptName,
  MAX_WORKER_SOURCE_BYTES,
  parseDeploymentName,
} from "@/lib/customer-worker-platform";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CLOUDFLARE_API_BASE = "https://api.cloudflare.com/client/v4";
const MAX_REQUEST_BYTES = MAX_WORKER_SOURCE_BYTES * 4 + 4096;
const LIST_PAGE_SIZE = 100;
const MAX_LIST_PAGES = 100;
const JSON_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
};

type CloudflareConfig = {
  accountId: string;
  apiToken: string;
  namespace: string;
  runtimeBaseUrl: string;
};

type CloudflareScript = {
  id: string;
  modified_on?: string;
  created_on?: string;
};

type CloudflareApiResult = {
  success?: boolean;
  errors?: Array<{ message?: string; code?: number }>;
  result?: unknown;
  result_info?: { total_pages?: number };
};

class PayloadTooLargeError extends Error {}
class CloudflareApiError extends Error {}
class PlatformConfigurationError extends Error {}

const deploySchema = z.object({
  name: z.string(),
  source: z.string().min(1),
}).strict();

const deleteSchema = z.object({
  name: z.string(),
}).strict();

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: JSON_HEADERS });
}

function getCloudflareConfig(): CloudflareConfig {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const namespace = process.env.CUSTOMER_WORKERS_NAMESPACE;
  const runtimeBaseUrl = process.env.CUSTOMER_WORKERS_RUNTIME_URL;

  if (!accountId || !apiToken || !namespace || !runtimeBaseUrl) {
    throw new PlatformConfigurationError("Customer Worker deployment is not configured.");
  }

  return { accountId, apiToken, namespace, runtimeBaseUrl };
}

function scriptsEndpoint(config: CloudflareConfig): string {
  return `${CLOUDFLARE_API_BASE}/accounts/${encodeURIComponent(config.accountId)}/workers/dispatch/namespaces/${encodeURIComponent(config.namespace)}/scripts`;
}

async function readJsonBody(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    throw new PayloadTooLargeError("Request body exceeds the allowed size.");
  }

  if (!request.body) {
    throw new SyntaxError("A JSON request body is required.");
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytesRead = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytesRead += value.byteLength;
    if (bytesRead > MAX_REQUEST_BYTES) {
      await reader.cancel();
      throw new PayloadTooLargeError("Request body exceeds the allowed size.");
    }
    body += decoder.decode(value, { stream: true });
  }

  body += decoder.decode();
  return JSON.parse(body);
}

async function cloudflareRequest(
  config: CloudflareConfig,
  path: string,
  init: RequestInit = {},
): Promise<CloudflareApiResult> {
  const response = await fetch(`${scriptsEndpoint(config)}${path}`, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      ...init.headers,
    },
  });

  const responseText = await response.text();
  let payload: CloudflareApiResult = {};
  if (responseText) {
    try {
      payload = JSON.parse(responseText) as CloudflareApiResult;
    } catch {
      throw new CloudflareApiError(`Cloudflare API returned an invalid response (${response.status}).`);
    }
  }

  if (!response.ok || payload.success === false) {
    const message = payload.errors?.map((error) => error.message).filter(Boolean).join("; ");
    throw new CloudflareApiError(
      message ? `Cloudflare rejected the request: ${message}` : `Cloudflare API request failed (${response.status}).`,
    );
  }

  return payload;
}

function parseScripts(payload: CloudflareApiResult): CloudflareScript[] {
  if (!Array.isArray(payload.result)) {
    throw new CloudflareApiError("Cloudflare returned an unexpected script list.");
  }

  return payload.result.flatMap((item): CloudflareScript[] => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    return typeof record.id === "string"
      ? [{
          id: record.id,
          ...(typeof record.modified_on === "string" ? { modified_on: record.modified_on } : {}),
          ...(typeof record.created_on === "string" ? { created_on: record.created_on } : {}),
        }]
      : [];
  });
}

async function listAllScripts(config: CloudflareConfig): Promise<CloudflareScript[]> {
  const scripts: CloudflareScript[] = [];

  for (let page = 1; page <= MAX_LIST_PAGES; page += 1) {
    const query = `?page=${page}&per_page=${LIST_PAGE_SIZE}`;
    const payload = await cloudflareRequest(config, query);
    const currentPage = parseScripts(payload);
    scripts.push(...currentPage);

    const totalPages = payload.result_info?.total_pages;
    if (typeof totalPages === "number") {
      if (totalPages > MAX_LIST_PAGES) {
        throw new CloudflareApiError("The dispatch namespace contains too many scripts to list safely.");
      }
      if (page >= totalPages) break;
    } else if (currentPage.length < LIST_PAGE_SIZE) {
      break;
    }
  }

  return scripts;
}

async function getUserId(): Promise<string | null> {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    throw new PlatformConfigurationError("Customer Worker authentication is not configured.");
  }
  const { userId } = await auth();
  return userId;
}

export async function GET() {
  let userId: string | null;
  try {
    userId = await getUserId();
  } catch (error) {
    console.error("Unable to verify customer Worker session", error);
    return json({
      error: error instanceof PlatformConfigurationError
        ? error.message
        : "Unable to verify your session.",
    }, error instanceof PlatformConfigurationError ? 503 : 500);
  }
  if (!userId) return json({ error: "Sign in to manage Worker deployments." }, 401);

  try {
    const config = getCloudflareConfig();
    const prefix = getTenantWorkerPrefix(userId);
    const scripts = await listAllScripts(config);
    const deployments = scripts
      .filter((script) => script.id.startsWith(prefix))
      .map((script) => {
        const name = script.id.slice(prefix.length);
        return {
          name,
          url: getWorkerRuntimeUrl(config.runtimeBaseUrl, script.id),
          modifiedAt: script.modified_on ?? script.created_on ?? null,
        };
      });

    return json({ deployments });
  } catch (error) {
    console.error("Unable to list customer Worker deployments", error);
    return json({
      error: error instanceof Error ? error.message : "Unable to list Worker deployments.",
    }, 503);
  }
}

const BLOCKED_PATTERNS = [
  /\beval\s*\(/,
  /new\s+Function\s*\(/,
  /WebAssembly\s*\./,
  /importScripts\s*\(/,
  /\bprocess\.env\b/,
];

function validateWorkerSource(source: string): { valid: boolean; reason?: string } {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(source)) {
      return { valid: false, reason: `Blocked code pattern detected: ${pattern.source}` };
    }
  }
  return { valid: true };
}

export async function POST(request: Request) {
  let userId: string | null;
  try {
    userId = await getUserId();
  } catch (error) {
    console.error("Unable to verify customer Worker session", error);
    return json({
      error: error instanceof PlatformConfigurationError
        ? error.message
        : "Unable to verify your session.",
    }, error instanceof PlatformConfigurationError ? 503 : 500);
  }
  if (!userId) return json({ error: "Sign in to deploy a Worker." }, 401);

  let body: unknown;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    const status = error instanceof PayloadTooLargeError ? 413 : 400;
    return json({
      error: error instanceof Error ? error.message : "Invalid JSON request body.",
    }, status);
  }

  const parsed = deploySchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Provide a deployment name and Worker source code." }, 400);
  }

  let name: string;
  try {
    name = parseDeploymentName(parsed.data.name);
  } catch (error) {
    return json({
      error: error instanceof Error ? error.message : "Invalid deployment name.",
    }, 400);
  }

  if (new TextEncoder().encode(parsed.data.source).byteLength > MAX_WORKER_SOURCE_BYTES) {
    return json({ error: `Worker source must be ${MAX_WORKER_SOURCE_BYTES / 1024} KB or smaller.` }, 413);
  }

  const validation = validateWorkerSource(parsed.data.source);
  if (!validation.valid) {
    console.warn("[customer-workers] Blocked dangerous code in source:", validation.reason, { userId, name });
    return json({ error: validation.reason }, 422);
  }

  try {
    const config = getCloudflareConfig();
    const workerName = getWorkerScriptName(userId, name);
    const moduleName = "index.mjs";
    const metadata = {
      main_module: moduleName,
      compatibility_date: "2026-10-20",
      tags: ["customer-worker", `tenant-${getTenantWorkerPrefix(userId).slice(2, -1)}`],
    };
    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append(
      moduleName,
      new Blob([parsed.data.source], { type: "application/javascript+module" }),
      moduleName,
    );

    await cloudflareRequest(config, `/${encodeURIComponent(workerName)}`, {
      method: "PUT",
      body: form,
    });

    return json({
      deployment: {
        name,
        url: getWorkerRuntimeUrl(config.runtimeBaseUrl, workerName),
      },
    });
  } catch (error) {
    console.error("Unable to deploy customer Worker", error);
    return json({
      error: "Unable to deploy Worker. Please review configuration and retry.",
    }, error instanceof PlatformConfigurationError ? 503 : 502);
  }
}

export async function DELETE(request: Request) {
  let userId: string | null;
  try {
    userId = await getUserId();
  } catch (error) {
    console.error("Unable to verify customer Worker session", error);
    return json({
      error: error instanceof PlatformConfigurationError
        ? error.message
        : "Unable to verify your session.",
    }, error instanceof PlatformConfigurationError ? 503 : 500);
  }
  if (!userId) return json({ error: "Sign in to manage Worker deployments." }, 401);

  let body: unknown;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    const status = error instanceof PayloadTooLargeError ? 413 : 400;
    return json({
      error: error instanceof Error ? error.message : "Invalid JSON request body.",
    }, status);
  }

  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Provide a deployment name." }, 400);

  let workerName: string;
  try {
    workerName = getWorkerScriptName(userId, parsed.data.name);
  } catch (error) {
    return json({
      error: error instanceof Error ? error.message : "Invalid deployment name.",
    }, 400);
  }

  try {
    const config = getCloudflareConfig();
    await cloudflareRequest(config, `/${encodeURIComponent(workerName)}`, { method: "DELETE" });
    return json({ success: true });
  } catch (error) {
    console.error("Unable to delete customer Worker", error);
    return json({
      error: error instanceof Error ? error.message : "Unable to delete Worker.",
    }, error instanceof PlatformConfigurationError ? 503 : 502);
  }
}
