"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Layers,
  Sparkles,
  Flame,
  Calculator,
  Cpu,
  Table,
  Terminal,
  Bot,
  FileCode2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  modernCodeMatrix,
  modernBlueprintsDb,
  modernCostPlaybooks,
  modernStackDb,
  pythonData,
} from "@/data";
import { CodeBlock } from "@/components/ui/code-block";

type ModernSubtab =
  | "overview"
  | "concepts"
  | "matrix"
  | "simulators"
  | "blueprints"
  | "ai"
  | "cost"
  | "compatibility"
  | "python";

export default function ModernStackPage() {
  const [activeTab, setActiveTab] = useState<ModernSubtab>("overview");

  const handleTabChange = useCallback((tabId: ModernSubtab) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${tabId}`);
    }
  }, []);

  useEffect(() => {
    const syncTabFromLocation = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const queryTab = params.get("tab")?.toLowerCase();
      const target = hash || queryTab;

      const validTabs: ModernSubtab[] = [
        "overview",
        "concepts",
        "matrix",
        "simulators",
        "blueprints",
        "ai",
        "cost",
        "compatibility",
        "python",
      ];

      if (queryTab && validTabs.includes(queryTab as ModernSubtab)) {
        setActiveTab(queryTab as ModernSubtab);
      } else if (hash && validTabs.includes(hash as ModernSubtab)) {
        setActiveTab(hash as ModernSubtab);
      }

      if (hash) {
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 200);
      }
    };

    syncTabFromLocation();
    window.addEventListener("hashchange", syncTabFromLocation);
    return () => window.removeEventListener("hashchange", syncTabFromLocation);
  }, []);

  // Interactive Canvas Stage
  const [selectedCanvasStage, setSelectedCanvasStage] = useState<number>(0);

  // Simulators State
  const [shuffleRows, setShuffleRows] = useState(50);
  const [shuffleSkew, setShuffleSkew] = useState(1.5);

  const [treeCatalog, setTreeCatalog] = useState("uc");

  const [costTb, setCostTb] = useState(10);

  const [sparkWorkers, setSparkWorkers] = useState(8);

  const [ragChunk, setRagChunk] = useState(512);

  const [watermarkMins, setWatermarkMins] = useState(10);

  const canvasStages = [
    {
      step: "1. Ingest",
      icon: "📡",
      tech: "Kafka · Debezium · DMS",
      title: "Stage 1: Real-time & Batch Ingestion",
      desc: "Log-based Change Data Capture (CDC) via Debezium feeding Kafka event streams with Avro schema registry validation and zero data loss guarantees.",
    },
    {
      step: "2. Store",
      icon: "🪶",
      tech: "Delta · Iceberg · S3",
      title: "Stage 2: Open Lakehouse Storage",
      desc: "Open table formats (Delta Lake UniForm / Apache Iceberg) on cloud object storage (ADLS Gen2 / AWS S3) with ACID guarantees, time-travel, and compaction.",
    },
    {
      step: "3. Transform",
      icon: "🚀",
      tech: "Spark 4 · Photon · dbt",
      title: "Stage 3: Vectorized Compute Engine",
      desc: "High-throughput transformations running on Apache Spark with Photon C++ native execution and dbt-core for declarative SQL lineage and data tests.",
    },
    {
      step: "4. Serve",
      icon: "❄️",
      tech: "Snowflake · DBSQL · DuckDB",
      title: "Stage 4: Low-Latency Semantic Serving",
      desc: "Serverless SQL Warehouses and embedded DuckDB instances serving sub-second BI dashboards and Fabric Direct Lake semantic models.",
    },
    {
      step: "5. AI / RAG",
      icon: "🤖",
      tech: "Vector Search · MCP · LLM",
      title: "Stage 5: AI & Agentic Pipelines",
      desc: "Automated chunking and embedding pipelines feeding Delta Vector Search and Model Context Protocol (MCP) server tools for LLM agent workflows.",
    },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-6 sm:p-8 isolate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400">
              <Layers size={14} />
              <span>Step 4 · Modern Data &amp; AI Stack</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Modern Data Engineering &amp; AI Architecture ⚡🌐
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Serverless-first, polyglot, AI-native — 6 live simulators, 12 production architecture blueprints,
              polyglot engine comparison matrix, and serverless FinOps playbooks.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-2xl font-bold text-cyan-400">12</div>
              <div className="text-[11px] text-[var(--muted-foreground)] font-medium">Blueprints</div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-2xl font-bold text-green-400">6</div>
              <div className="text-[11px] text-[var(--muted-foreground)] font-medium">Live Simulators</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtab Navigation Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "overview", label: "⚡ Hub Overview", icon: Sparkles },
          { id: "simulators", label: "⚙️ 6 Live Simulators", icon: Calculator },
          { id: "blueprints", label: "🗺️ 12 Blueprints Gallery", icon: Cpu },
          { id: "matrix", label: "💻 Polyglot Engine Matrix", icon: FileCode2 },
          { id: "ai", label: "🤖 AI & RAG Stack", icon: Bot },
          { id: "cost", label: "💰 Cost Optimization Playbook", icon: Flame },
          { id: "compatibility", label: "🌐 Cloud × Table Matrix", icon: Table },
          { id: "python", label: "🐍 Python for Modern Stack", icon: FileCode2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as ModernSubtab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0",
                isSelected
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                  : "bg-[var(--surface-1)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] border border-[var(--border)]"
              )}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW & CANVAS */}
      {activeTab === "overview" && (
        <div id="overview" className="space-y-6 animate-in fade-in duration-300">
          {/* Interactive Stack Flow Canvas */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">
                  Your AI-Era Data Stack Flow Canvas
                </h3>
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
                  Click any stage node to inspect architectural best practices and production tech choices.
                </p>
              </div>
            </div>

            {/* Nodes Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {canvasStages.map((stage, idx) => {
                const isSelected = selectedCanvasStage === idx;
                return (
                  <button
                    key={stage.step}
                    onClick={() => setSelectedCanvasStage(idx)}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all relative group",
                      isSelected
                        ? "bg-purple-600/15 border-purple-500 shadow-lg shadow-purple-500/10"
                        : "bg-[var(--surface-2)] border-[var(--border)] hover:border-purple-500/40"
                    )}
                  >
                    <span className="text-2xl">{stage.icon}</span>
                    <div className="font-bold text-xs sm:text-sm text-[var(--foreground)] mt-2">
                      {stage.step}
                    </div>
                    <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5 truncate">
                      {stage.tech}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Stage Detail Card */}
            <div className="p-5 rounded-2xl bg-[var(--surface-2)] border border-purple-500/30 space-y-2">
              <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" />
                {canvasStages[selectedCanvasStage].title}
              </h4>
              <p className="text-xs sm:text-sm text-[var(--foreground)] opacity-90 leading-relaxed">
                {canvasStages[selectedCanvasStage].desc}
              </p>
            </div>
          </div>

          {/* Quick Launch Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              onClick={() => handleTabChange("simulators")}
              className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-purple-500/40 cursor-pointer transition-all space-y-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center font-bold text-lg">
                ⚙️
              </div>
              <h4 className="text-base font-bold text-[var(--foreground)]">6 Live Simulators</h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Tune shuffles, compare Delta vs Iceberg catalogs, calculate serverless costs, and size RAG tokens.
              </p>
            </div>

            <div
              onClick={() => handleTabChange("blueprints")}
              className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-purple-500/40 cursor-pointer transition-all space-y-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-lg">
                🗺️
              </div>
              <h4 className="text-base font-bold text-[var(--foreground)]">12 Production Blueprints</h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                End-to-end Mermaid and ASCII reference architectures with cost bands and failover playbooks.
              </p>
            </div>

            <div
              onClick={() => handleTabChange("matrix")}
              className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-purple-500/40 cursor-pointer transition-all space-y-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg">
                💻
              </div>
              <h4 className="text-base font-bold text-[var(--foreground)]">Polyglot Engine Matrix</h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Compare side-by-side implementations across Polars, PySpark, DuckDB, Snowflake, and BigQuery.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. 6 LIVE SIMULATORS */}
      {activeTab === "simulators" && (
        <div id="simulators" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {/* Simulator 1: Shuffle Estimator */}
          <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  1. Shuffle Estimator
                </span>
                <button
                  onClick={() => {
                    setShuffleRows(50);
                    setShuffleSkew(1.5);
                  }}
                  className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  ↺ Reset
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="sim-shuffle-rows" className="flex justify-between text-xs font-medium cursor-pointer">
                    <span>Input Rows (Millions):</span>
                    <span className="font-bold text-purple-400">{shuffleRows}M</span>
                  </label>
                  <input
                    id="sim-shuffle-rows"
                    name="shuffleRows"
                    type="range"
                    min={1}
                    max={500}
                    value={shuffleRows}
                    onChange={(e) => setShuffleRows(Number(e.target.value))}
                    className="w-full accent-purple-500"
                    aria-label="Input rows in millions"
                    aria-valuemin={1}
                    aria-valuemax={500}
                    aria-valuenow={shuffleRows}
                    aria-valuetext={`${shuffleRows} million rows`}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="sim-shuffle-skew" className="flex justify-between text-xs font-medium cursor-pointer">
                    <span>Data Skew Factor:</span>
                    <span className="font-bold text-orange-400">{shuffleSkew}x</span>
                  </label>
                  <input
                    id="sim-shuffle-skew"
                    name="shuffleSkew"
                    type="range"
                    min={1.0}
                    max={5.0}
                    step={0.1}
                    value={shuffleSkew}
                    onChange={(e) => setShuffleSkew(Number(e.target.value))}
                    className="w-full accent-orange-500"
                    aria-label="Data skew factor multiplier"
                    aria-valuemin={1.0}
                    aria-valuemax={5.0}
                    aria-valuenow={shuffleSkew}
                    aria-valuetext={`${shuffleSkew}x multiplier`}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-purple-500/20 text-xs space-y-1">
              <div className="text-purple-300 font-bold">Predicted Output:</div>
              <div className="text-[var(--foreground)] font-mono">
                Shuffle Size: ~{((shuffleRows * 0.25 * shuffleSkew)).toFixed(1)} GB
              </div>
              <div className="text-[var(--muted-foreground)]">
                Recommended Partitions: {Math.max(10, Math.round(shuffleRows * 2 * shuffleSkew))}
              </div>
            </div>
          </div>

          {/* Simulator 2: Iceberg vs Delta Selector */}
          <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  2. Table Format Selector
                </span>
                <button onClick={() => setTreeCatalog("uc")} className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                  ↺ Reset
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium block">Select Target Enterprise Catalog:</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                  {[
                    { id: "uc", label: "Unity Catalog" },
                    { id: "polaris", label: "Polaris" },
                    { id: "glue", label: "AWS Glue" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setTreeCatalog(c.id)}
                      className={cn(
                        "py-1.5 text-[11px] font-semibold rounded-lg transition-all",
                        treeCatalog === c.id
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-cyan-500/20 text-xs space-y-1.5">
              <div className="text-cyan-300 font-bold">Architect Recommendation:</div>
              <div className="text-[var(--foreground)]">
                {treeCatalog === "uc" && "Format: Delta Lake with UniForm enabled. Automatic iceberg metadata allows cross-querying from Snowflake & Fabric Direct Lake."}
                {treeCatalog === "polaris" && "Format: Apache Iceberg v2. Native REST catalog integration across Snowflake, Trino, and Databricks external locations."}
                {treeCatalog === "glue" && "Format: Apache Iceberg or Delta Lake. Ensure Glue Data Catalog crawler sync or Athena engine v3 is provisioned."}
              </div>
            </div>
          </div>

          {/* Simulator 3: Serverless Storage vs Scan Cost */}
          <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-green-400 uppercase tracking-wider">
                  3. Query Scan Cost Estimator
                </span>
                <button onClick={() => setCostTb(10)} className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                  ↺ Reset
                </button>
              </div>

              <div className="space-y-2">
                <label htmlFor="sim-cost-tb" className="flex justify-between text-xs font-medium cursor-pointer">
                  <span>Monthly TB Scanned:</span>
                  <span className="font-bold text-green-400">{costTb} TB</span>
                </label>
                <input
                  id="sim-cost-tb"
                  name="costTb"
                  type="range"
                  min={1}
                  max={100}
                  value={costTb}
                  onChange={(e) => setCostTb(Number(e.target.value))}
                  className="w-full accent-green-500"
                  aria-label="Monthly lakehouse storage scanned in terabytes"
                  aria-valuemin={1}
                  aria-valuemax={100}
                  aria-valuenow={costTb}
                  aria-valuetext={`${costTb} terabytes scanned`}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-green-500/20 text-xs space-y-1">
              <div className="text-green-300 font-bold">Estimated Cost Comparison:</div>
              <div className="text-[var(--foreground)] font-mono">
                BigQuery On-Demand: ${(costTb * 5.0).toFixed(2)}/mo
              </div>
              <div className="text-[var(--muted-foreground)] font-mono">
                DBSQL Serverless: ~${(costTb * 12.0).toFixed(2)}/mo
              </div>
            </div>
          </div>

          {/* Simulator 4: Spark Cluster Sizing */}
          <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  4. Spark Cluster Sizer
                </span>
                <button onClick={() => setSparkWorkers(8)} className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                  ↺ Reset
                </button>
              </div>

              <div className="space-y-2">
                <label htmlFor="sim-spark-workers" className="flex justify-between text-xs font-medium cursor-pointer">
                  <span>Worker Nodes (4 cores/node):</span>
                  <span className="font-bold text-amber-400">{sparkWorkers} Nodes</span>
                </label>
                <input
                  id="sim-spark-workers"
                  name="sparkWorkers"
                  type="range"
                  min={2}
                  max={64}
                  step={2}
                  value={sparkWorkers}
                  onChange={(e) => setSparkWorkers(Number(e.target.value))}
                  className="w-full accent-amber-500"
                  aria-label="Number of worker nodes in cluster"
                  aria-valuemin={2}
                  aria-valuemax={64}
                  aria-valuenow={sparkWorkers}
                  aria-valuetext={`${sparkWorkers} worker nodes`}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-amber-500/20 text-xs space-y-1">
              <div className="text-amber-300 font-bold">Cluster Compute Capacity:</div>
              <div className="text-[var(--foreground)] font-mono">
                Total Cores: {sparkWorkers * 4} · RAM: {sparkWorkers * 16} GB
              </div>
              <div className="text-[var(--muted-foreground)]">
                Max Read Bandwidth: ~{(sparkWorkers * 0.3).toFixed(1)} GB/s
              </div>
            </div>
          </div>

          {/* Simulator 5: RAG Chunk & Token Config */}
          <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                  5. RAG Token Sizer
                </span>
                <button onClick={() => setRagChunk(512)} className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                  ↺ Reset
                </button>
              </div>

              <div className="space-y-2">
                <label htmlFor="sim-rag-chunk" className="flex justify-between text-xs font-medium cursor-pointer">
                  <span>Chunk Size (Tokens):</span>
                  <span className="font-bold text-pink-400">{ragChunk} tokens</span>
                </label>
                <input
                  id="sim-rag-chunk"
                  name="ragChunk"
                  type="range"
                  min={128}
                  max={2048}
                  step={128}
                  value={ragChunk}
                  onChange={(e) => setRagChunk(Number(e.target.value))}
                  className="w-full accent-pink-500"
                  aria-label="Vector search chunk size in tokens"
                  aria-valuemin={128}
                  aria-valuemax={2048}
                  aria-valuenow={ragChunk}
                  aria-valuetext={`${ragChunk} tokens per chunk`}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-pink-500/20 text-xs space-y-1">
              <div className="text-pink-300 font-bold">Embedding Strategy:</div>
              <div className="text-[var(--foreground)] font-mono">
                Overlap: {Math.round(ragChunk * 0.15)} tokens (15%)
              </div>
              <div className="text-[var(--muted-foreground)]">
                {ragChunk <= 512 ? "High precision, best for factual search." : "Broad context, best for document summaries."}
              </div>
            </div>
          </div>

          {/* Simulator 6: Streaming Watermark */}
          <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                  6. Streaming Watermark
                </span>
                <button onClick={() => setWatermarkMins(10)} className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                  ↺ Reset
                </button>
              </div>

              <div className="space-y-2">
                <label htmlFor="sim-watermark" className="flex justify-between text-xs font-medium cursor-pointer">
                  <span>Allowed Lateness (Minutes):</span>
                  <span className="font-bold text-red-400">{watermarkMins} Mins</span>
                </label>
                <input
                  id="sim-watermark"
                  name="watermarkMins"
                  type="range"
                  min={1}
                  max={60}
                  value={watermarkMins}
                  onChange={(e) => setWatermarkMins(Number(e.target.value))}
                  className="w-full accent-red-500"
                  aria-label="Streaming watermark threshold in minutes"
                  aria-valuemin={1}
                  aria-valuemax={60}
                  aria-valuenow={watermarkMins}
                  aria-valuetext={`${watermarkMins} minutes allowed lateness`}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-red-500/20 text-xs space-y-1">
              <div className="text-red-300 font-bold">State Policy:</div>
              <div className="text-[var(--foreground)] font-mono">
                Events lagging &gt; {watermarkMins}m dropped silently
              </div>
              <div className="text-[var(--muted-foreground)]">
                RocksDB Estimated State: ~{(watermarkMins * 0.12).toFixed(2)} GB
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. 12 BLUEPRINTS GALLERY */}
      {activeTab === "blueprints" && (
        <div id="blueprints" className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          {modernBlueprintsDb.map((bp) => (
            <div key={bp.id} id={`bp-${bp.id}`} className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    {bp.category}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    {bp.costEstimate}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--foreground)]">{bp.title}</h3>

                <div className="flex flex-wrap gap-1.5">
                  {bp.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[var(--muted-foreground)]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* ASCII Diagram representation */}
              <div className="p-4 rounded-2xl bg-[#090d13] border border-white/10 text-[11px] font-mono text-purple-300 overflow-x-auto whitespace-pre">
                {bp.ascii}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. POLYGLOT MATRIX */}
      {activeTab === "matrix" && (
        <div id="matrix" className="space-y-6 animate-in fade-in duration-300">
          {modernCodeMatrix.map((item, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4">
              <h4 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" />
                {item.topic}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <CodeBlock code={item.python} language="python" filename="Python (Polars)" badge="Polars" showLineNumbers={false} />
                <CodeBlock code={item.pyspark} language="python" filename="PySpark DataFrame" badge="PySpark" showLineNumbers={false} />
                <CodeBlock code={item.duckdb} language="sql" filename="DuckDB SQL" badge="DuckDB" showLineNumbers={false} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. AI & RAG STACK */}
      {activeTab === "ai" && (
        <div id="ai" className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          {[
            {
              title: "Delta Vector Search & Embedding Sync",
              badge: "Lakehouse AI",
              desc: "Streaming Delta tables compute embeddings via Foundation Model APIs and auto-sync to managed HNSW indexes with sub-50ms vector query latency.",
            },
            {
              title: "Model Context Protocol (MCP) Server Architecture",
              badge: "Agentic Tooling",
              desc: "Expose warehouse queries and semantic layer metrics directly to AI agent workspaces over JSON-RPC stdio/SSE protocols.",
            },
            {
              title: "Hybrid Search (Dense + Sparse BM25)",
              badge: "Reciprocal Rank Fusion",
              desc: "Combine vector cosine distance with sparse keyword token matches (BM25) using RRF scoring for high accuracy domain queries.",
            },
            {
              title: "Semantic Chunking via AST Parsers",
              badge: "Ingestion Pipeline",
              desc: "Chunk SQL, Python, and Markdown documents along syntax boundaries rather than arbitrary token boundaries to maintain semantic integrity.",
            },
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                {item.badge}
              </span>
              <h4 className="text-base font-bold text-[var(--foreground)]">{item.title}</h4>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* 6. COST PLAYBOOKS */}
      {activeTab === "cost" && (
        <div id="cost" className="space-y-4 animate-in fade-in duration-300">
          {modernCostPlaybooks.map((item, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-[var(--foreground)]">{item.title}</h4>
                <span className="text-xs font-bold text-green-400 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                  {item.savings}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">{item.summary}</p>
              <CodeBlock
                code={item.code}
                language="sql"
                filename={`${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.sql`}
                badge={item.savings}
              />
            </div>
          ))}
        </div>
      )}

      {/* 7. CLOUD TABLE COMPATIBILITY */}
      {activeTab === "compatibility" && (
        <div id="compatibility" className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4 overflow-x-auto animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-[var(--foreground)]">
            Cloud Engine × Table Format Compatibility Matrix
          </h3>
          <table className="w-full text-xs text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                <th className="py-3 px-4 font-semibold">Engine / Service</th>
                <th className="py-3 px-4 font-semibold">Delta Lake</th>
                <th className="py-3 px-4 font-semibold">Apache Iceberg</th>
                <th className="py-3 px-4 font-semibold">Apache Hudi</th>
                <th className="py-3 px-4 font-semibold">Native Metastore</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--foreground)]">
              <tr>
                <td className="py-3 px-4 font-bold">Databricks</td>
                <td className="py-3 px-4 text-green-400">✅ Native (_delta_log)</td>
                <td className="py-3 px-4 text-green-400">✅ UniForm / Read</td>
                <td className="py-3 px-4 text-yellow-400">⚠️ Read Support</td>
                <td className="py-3 px-4">Unity Catalog</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold">Snowflake</td>
                <td className="py-3 px-4 text-yellow-400">⚠️ External Stage</td>
                <td className="py-3 px-4 text-green-400">✅ Native Iceberg Table</td>
                <td className="py-3 px-4 text-slate-500">❌ None</td>
                <td className="py-3 px-4">Polaris / S3</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold">Google BigQuery</td>
                <td className="py-3 px-4 text-green-400">✅ BigLake Delta</td>
                <td className="py-3 px-4 text-green-400">✅ BigLake Iceberg</td>
                <td className="py-3 px-4 text-yellow-400">⚠️ Manifest</td>
                <td className="py-3 px-4">BigLake Metastore</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold">Microsoft Fabric</td>
                <td className="py-3 px-4 text-green-400">✅ OneLake Native</td>
                <td className="py-3 px-4 text-green-400">✅ Iceberg Shortcut</td>
                <td className="py-3 px-4 text-yellow-400">⚠️ Parquet Shortcut</td>
                <td className="py-3 px-4">OneLake Metastore</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold">DuckDB</td>
                <td className="py-3 px-4 text-green-400">✅ delta extension</td>
                <td className="py-3 px-4 text-green-400">✅ iceberg extension</td>
                <td className="py-3 px-4 text-yellow-400">⚠️ Direct Parquet</td>
                <td className="py-3 px-4">MotherDuck / In-Memory</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 8. PYTHON FOR MODERN STACK */}
      {activeTab === "python" && (
        <div id="python" className="space-y-8 animate-in fade-in duration-300">
          {/* Section Intro */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg">
                🐍
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">Python for Modern Data Stacks</h3>
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
                  Python implementations across lakehouse, distributed computing, and AI-native pipelines.
                </p>
              </div>
            </div>
            <div className="flex gap-3 text-center">
              <div className="px-4 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="text-lg font-bold text-blue-400">{modernStackDb.filter(q => q.py_code?.trim()).length}</div>
                <div className="text-[10px] text-[var(--muted-foreground)]">Modern Stack Q&A with Python</div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="text-lg font-bold text-green-400">{modernCodeMatrix.length}</div>
                <div className="text-[10px] text-[var(--muted-foreground)]">Polyglot Matrix Entries</div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="text-lg font-bold text-purple-400">{pythonData.filter(p => ['Delta Lake', 'Distributed Computing', 'Streaming', 'Architecture', 'Data Patterns', 'Performance'].includes(p.category)).length}</div>
                <div className="text-[10px] text-[var(--muted-foreground)]">DE Python Patterns</div>
              </div>
            </div>
          </div>

          {/* Modern Stack Q&A with Python Code */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2 px-1">
              <Terminal size={18} className="text-blue-400" />
              Modern Stack Interview Q&A · Python Solutions
            </h3>
            {modernStackDb.filter(q => q.py_code?.trim()).map((q) => (
              <div key={q.id} className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] overflow-hidden">
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold text-purple-400 tracking-wide uppercase">
                      {q.category}
                    </span>
                    <span className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                      q.difficulty === "HARD" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                      q.difficulty === "ARCHITECT" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                      "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    )}>
                      {q.difficulty}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--foreground)]">{q.question}</h4>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{q.answer.slice(0, 300)}{q.answer.length > 300 ? "..." : ""}</p>
                </div>

                <div className="border-t border-[var(--border)] p-4 bg-[var(--surface-2)] space-y-3">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {q.py_code?.trim() && (
                      <CodeBlock
                        code={q.py_code}
                        language="python"
                        filename="solution.py"
                        badge="Python"
                        showLineNumbers
                      />
                    )}
                    {q.pyspark_code?.trim() && (
                      <CodeBlock
                        code={q.pyspark_code}
                        language="python"
                        filename="pyspark_solution.py"
                        badge="PySpark"
                        showLineNumbers
                      />
                    )}
                  </div>
                  {q.sql_code?.trim() && (
                    <CodeBlock
                      code={q.sql_code}
                      language="sql"
                      filename="query.sql"
                      badge="SQL"
                      showLineNumbers={false}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Polyglot Matrix – Python Focus */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2 px-1">
              <FileCode2 size={18} className="text-green-400" />
              Polyglot Engine Matrix · Python vs Others
            </h3>
            {modernCodeMatrix.map((item, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4">
                <h4 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                  <Sparkles size={14} className="text-purple-400" />
                  {item.topic}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <CodeBlock
                    code={item.python}
                    language="python"
                    filename="Python (Polars)"
                    badge="Python"
                    showLineNumbers={false}
                  />
                  <CodeBlock
                    code={item.pyspark}
                    language="python"
                    filename="PySpark"
                    badge="PySpark"
                    showLineNumbers={false}
                  />
                  <CodeBlock
                    code={item.duckdb}
                    language="sql"
                    filename="DuckDB"
                    badge="DuckDB"
                    showLineNumbers={false}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* DE Python Patterns from pythonData */}
          {(() => {
            const deCategories = ['Delta Lake', 'Distributed Computing', 'Streaming', 'Architecture', 'Data Patterns', 'Performance', 'FinOps', 'Observability', 'Governance'];
            const deItems = pythonData.filter(p => deCategories.includes(p.category));
            if (deItems.length === 0) return null;
            return (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2 px-1">
                  <Layers size={18} className="text-cyan-400" />
                  Python Data Engineering Patterns ({deItems.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deItems.map((item) => {
                    const lvlColor = item.level === 'architect' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                      : item.level === 'advanced' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                      : item.level === 'intermediate' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                      : 'text-green-400 bg-green-500/10 border-green-500/20';
                    return (
                      <div key={item.id} className="rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] overflow-hidden">
                        <div className="p-5 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-semibold text-cyan-400 tracking-wide uppercase">
                              {item.category}
                            </span>
                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", lvlColor)}>
                              {item.level}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[var(--foreground)]">{item.title}</h4>
                          <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">{item.description}</p>
                        </div>
                        <div className="border-t border-[var(--border)] p-4 bg-[var(--surface-2)]">
                          <CodeBlock
                            code={item.code}
                            language="python"
                            filename={`${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 35)}.py`}
                            showLineNumbers
                          />
                          {item.use_case && (
                            <p className="mt-3 text-xs text-[var(--muted-foreground)] flex items-start gap-1.5">
                              <span className="shrink-0">🎯</span>
                              <span>{item.use_case}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
