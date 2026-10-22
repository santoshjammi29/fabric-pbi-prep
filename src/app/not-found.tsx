import Link from "next/link";
import { ArrowLeft, Compass, Cpu, FileCode2, Layers, Search, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
        <Compass className="w-10 h-10 animate-pulse" />
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-500 text-[10px] font-mono flex items-center justify-center font-bold">
          404
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--foreground)] mb-3">
        Architectural Spec Not Found
      </h1>
      <p className="max-w-md text-sm sm:text-base text-[var(--muted-foreground)] mb-8">
        The route or resource you requested is not mapped in the Lakehouse topology. It may have been relocated or archived.
      </p>

      {/* Suggested Portals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-2xl w-full mb-8 text-left">
        <Link
          href="/architecture"
          className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group"
        >
          <div className="flex items-center gap-2.5 mb-1">
            <Layers className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-xs text-[var(--foreground)]">Architecture Hub</span>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">3,206+ system design scenarios & diagrams</p>
        </Link>

        <Link
          href="/concepts"
          className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
        >
          <div className="flex items-center gap-2.5 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-xs text-[var(--foreground)]">Concepts & Glossary</span>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">660+ core lakehouse technical terms</p>
        </Link>

        <Link
          href="/code-practice"
          className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-purple-500/40 hover:bg-purple-500/5 transition-all group"
        >
          <div className="flex items-center gap-2.5 mb-1">
            <FileCode2 className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-xs text-[var(--foreground)]">Code Practice</span>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">PySpark, SparkSQL, and Databricks runs</p>
        </Link>

        <Link
          href="/qa-prep"
          className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group"
        >
          <div className="flex items-center gap-2.5 mb-1">
            <Cpu className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-xs text-[var(--foreground)]">QA Prep Drills</span>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">7,081+ verified interview drills</p>
        </Link>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--foreground)] text-[var(--background)] text-xs font-semibold hover:opacity-90 transition-opacity"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Return to Home Overview
      </Link>
    </div>
  );
}
