"use client";

import { useCallback, useEffect, useState } from "react";
import { Cloud, ExternalLink, LoaderCircle, Trash2, Upload } from "lucide-react";

interface WorkerDeployment {
  name: string;
  url: string;
  modifiedAt?: string | null;
}

const STARTER_SOURCE = `export default {
  async fetch(request) {
    const url = new URL(request.url);
    return Response.json({
      message: "Hello from your isolated Worker!",
      path: url.pathname,
      method: request.method,
    });
  },
};`;

async function readApiResponse(response: Response): Promise<Record<string, unknown>> {
  const payload = await response.json() as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(typeof payload.error === "string" ? payload.error : "Request failed.");
  }
  return payload;
}

export function CustomerWorkerConsole() {
  const [name, setName] = useState("hello-world");
  const [source, setSource] = useState(STARTER_SOURCE);
  const [deployments, setDeployments] = useState<WorkerDeployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refreshDeployments = useCallback(async () => {
    setError("");
    const response = await fetch("/api/customer-workers", {
      cache: "no-store",
      credentials: "same-origin",
    });
    const payload = await readApiResponse(response);
    setDeployments(Array.isArray(payload.deployments) ? payload.deployments as WorkerDeployment[] : []);
  }, []);

  useEffect(() => {
    refreshDeployments()
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Unable to load deployments."))
      .finally(() => setLoading(false));
  }, [refreshDeployments]);

  const deploy = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const payload = await readApiResponse(await fetch("/api/customer-workers", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, source }),
      }));
      const deployment = payload.deployment as WorkerDeployment | undefined;
      if (!deployment?.url) throw new Error("Deployment completed without a runtime URL.");
      setNotice(`Deployed ${deployment.name}.`);
      await refreshDeployments();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to deploy Worker.");
    } finally {
      setBusy(false);
    }
  };

  const removeDeployment = async (deploymentName: string) => {
    if (!window.confirm(`Delete the "${deploymentName}" Worker? This cannot be undone.`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await readApiResponse(await fetch("/api/customer-workers", {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: deploymentName }),
      }));
      setNotice(`Deleted ${deploymentName}.`);
      await refreshDeployments();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete Worker.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
      <form
        onSubmit={deploy}
        className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5"
      >
        <div>
          <h2 className="text-lg font-semibold">Deploy a Worker</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            ES module source only, up to 64 KB. Redeploying the same name updates your Worker.
          </p>
        </div>
        <label className="block space-y-1.5 text-sm font-medium">
          Deployment name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            pattern="[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,30}[a-zA-Z0-9])?"
            maxLength={32}
            required
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm"
          />
          <span className="block text-xs font-normal text-[var(--muted-foreground)]">
            1-32 letters, numbers, or internal hyphens.
          </span>
        </label>
        <label className="block space-y-1.5 text-sm font-medium">
          JavaScript module
          <textarea
            value={source}
            onChange={(event) => setSource(event.target.value)}
            required
            spellCheck={false}
            rows={17}
            className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? <LoaderCircle size={15} className="animate-spin" /> : <Upload size={15} />}
          Deploy to Cloudflare
        </button>
      </form>

      <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Your Workers</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Scoped to your signed-in account.</p>
          </div>
          <Cloud size={19} className="text-blue-500" />
        </div>
        {loading ? (
          <p className="text-sm text-[var(--muted-foreground)]">Loading deployments…</p>
        ) : deployments.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted-foreground)]">
            No Workers deployed yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {deployments.map((deployment) => (
              <li key={deployment.name} className="rounded-lg border border-[var(--border)] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-semibold">{deployment.name}</p>
                    <a
                      href={deployment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs text-blue-500 hover:underline"
                    >
                      <span className="truncate">{deployment.url}</span>
                      <ExternalLink size={12} className="shrink-0" />
                    </a>
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => removeDeployment(deployment.name)}
                    aria-label={`Delete ${deployment.name}`}
                    className="rounded-md p-1.5 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
        {notice && <p role="status" className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600">{notice}</p>}
      </section>
    </div>
  );
}
