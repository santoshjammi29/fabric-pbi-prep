interface DispatchNamespace {
  get(
    name: string,
    props: Record<string, never>,
    options: { limits: { cpuMs: number; subRequests: number } },
  ): {
    fetch(request: Request): Promise<Response>;
  };
}

interface Env {
  USER_WORKERS: DispatchNamespace;
}

const WORKER_NAME_PATTERN = /^t-[a-f0-9]{24}-[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/;
const WORKER_LIMITS = {
  cpuMs: 1000,
  subRequests: 50,
};

const dispatcher = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/run\/([^/]+)(\/.*)?$/);
    if (!match || !WORKER_NAME_PATTERN.test(match[1])) {
      return new Response("Not found", { status: 404 });
    }

    const workerName = match[1];
    url.pathname = match[2] || "/";

    try {
      const worker = env.USER_WORKERS.get(
        workerName,
        {},
        { limits: WORKER_LIMITS },
      );
      return await worker.fetch(new Request(url, request));
    } catch (error) {
      console.error("Customer Worker invocation failed", {
        workerName,
        error: error instanceof Error ? error.message : "Unknown dispatch error",
      });
      return new Response("Customer Worker invocation failed.", { status: 502 });
    }
  },
};

export default dispatcher;
