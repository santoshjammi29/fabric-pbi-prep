"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Calculator,
  ArrowRight,
} from "lucide-react";
import { CodeBlock } from "@/components/ui/code-block";

export function TrendingSpotlight() {
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  const snippetCode = `from pyspark.sql import Window
from pyspark.sql.functions import row_number, col

# Deduplicate CDC stream with partition window
window_spec = Window.partitionBy("entity_id") \\
                    .orderBy(col("timestamp_utc").desc())

clean_df = cdc_df.withColumn("rn", row_number().over(window_spec)) \\
                 .filter(col("rn") == 1) \\
                 .drop("rn")`;


  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
            Daily Curated Spotlight
          </span>
          <h3 className="text-xl font-bold text-[var(--foreground)] mt-0.5">
            Architecture, Code &amp; Simulator of the Day
          </h3>
        </div>
        <Link
          href="/qa-prep"
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 hidden sm:flex items-center gap-1"
        >
          <span>View All Q&amp;As</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Question of the Day */}
        <div className="magazine-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={13} /> Scenario of the Day
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Architect Level
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] leading-snug">
              How do you architect zero-copy cross-cloud data sharing between Snowflake and Microsoft Fabric?
            </h4>

            {!isAnswerRevealed ? (
              <p className="text-xs text-[var(--muted-foreground)] line-clamp-3 leading-relaxed">
                Utilize Delta Lake UniForm to generate Apache Iceberg metadata on OneLake ADLS Gen2 storage,
                allowing Snowflake Polaris / External Tables to query Delta tables without data copying...
              </p>
            ) : (
              <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-purple-500/30 text-xs text-[var(--foreground)] opacity-95 leading-relaxed animate-in fade-in duration-200">
                <strong className="text-green-400">Solution:</strong> Enable UniForm on the Fabric Delta table. Point Snowflake to the Parquet data files using Apache Iceberg format. Reads query the OneLake bucket directly with zero ETL egress delay.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
            <button
              onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}
              className="min-h-[44px] px-3 py-2 -ml-3 inline-flex items-center text-xs font-semibold text-purple-400 hover:text-purple-300 rounded-lg hover:bg-purple-500/10 active:scale-95 transition-all touch-manipulation cursor-pointer"
            >
              {isAnswerRevealed ? "Hide Solution" : "Reveal Solution →"}
            </button>
            <Link
              href="/qa-prep"
              className="min-h-[44px] px-3 py-2 -mr-3 inline-flex items-center text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-white/5 active:scale-95 transition-all touch-manipulation"
            >
              Practice 6,100+ Q&amp;As
            </Link>
          </div>
        </div>

        {/* Card 2: Code Snippet of the Day */}
        <div className="magazine-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[var(--foreground)]">
              CDC Stream Deduplication with Partition Window
            </h4>

            <CodeBlock
              code={snippetCode}
              language="pyspark"
              filename="cdc_dedup.py"
              badge="PySpark Pattern"
            />
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
            <span className="text-[var(--muted-foreground)]">Level: Advanced</span>
            <Link
              href="/code-practice"
              className="font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>128+ Polyglot Sheets</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Card 3: Interactive Simulator Launcher */}
        <div className="magazine-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator size={13} /> Live Tool
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                Interactive
              </span>
            </div>

            <h4 className="text-sm font-bold text-[var(--foreground)]">
              Spark Shuffle &amp; Partition Optimizer Simulator
            </h4>

            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Calculate exact shuffle network exchanges, optimal hash bucket allocations, and memory spill
              thresholds before deploying jobs to production clusters.
            </p>

            <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--muted-foreground)]">Default Target Partition:</span>
                <span className="font-mono font-bold text-purple-400">128 MB / slice</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[var(--muted-foreground)]">Adaptive Coalesce:</span>
                <span className="font-mono font-bold text-green-400">AQE Enabled</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
            <Link
              href="/modern-stack#simulators"
              className="min-h-[44px] px-3 py-2 -ml-3 inline-flex items-center gap-1.5 text-xs font-semibold text-green-400 hover:text-green-300 rounded-lg hover:bg-green-500/10 active:scale-95 transition-all touch-manipulation"
            >
              <span>Launch 6 Simulators</span>
              <ArrowRight size={13} />
            </Link>
            <span className="text-[11px] text-[var(--muted-foreground)]">Zero install</span>
          </div>
        </div>
      </div>
    </section>
  );
}
