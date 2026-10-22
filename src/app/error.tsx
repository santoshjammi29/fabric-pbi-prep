"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to telemetry / console
    console.error("[Runtime Uncaught Error]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)] mb-2">
        Execution Exception Encountered
      </h1>
      <p className="max-w-md text-sm text-[var(--muted-foreground)] mb-4">
        An unexpected error occurred while executing this component isolate. State has been safely contained.
      </p>

      {error?.message && (
        <div className="max-w-xl w-full p-3 mb-6 rounded-lg bg-[var(--card)] border border-[var(--border)] text-left font-mono text-[11px] text-red-400 overflow-x-auto">
          {error.message}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retry Operation
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-xs font-semibold hover:bg-[var(--accent)] transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          Return to Overview
        </Link>
      </div>
    </div>
  );
}
