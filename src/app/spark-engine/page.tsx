"use client";

import React, { useState, useMemo } from "react";
import {
  Zap,
  Cpu,
  Calculator,
  BookOpen,
  Activity,
  Layers,
  ChevronDown,
  ShieldCheck,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { pysparkData } from "@/data";
import { CodeBlock } from "@/components/ui/code-block";

type SparkSubtab = "architecture" | "simulator" | "memory" | "curriculum" | "lexicon";

interface LexiconTerm {
  term: string;
  category: "engine" | "optimization" | "memory" | "streaming";
  badge: string;
  def: string;
}

const lexiconTerms: LexiconTerm[] = [
  {
    term: "Shuffle Operations",
    category: "engine",
    badge: "Stage Split",
    def: "The critical physical barrier where partition data is sorted and distributed across executors over the network. Driven by wide dependencies such as groupBy or join. Shuffles split lineage into separate Stages.",
  },
  {
    term: "Adaptive Query Execution (AQE)",
    category: "optimization",
    badge: "Dynamic Runtime",
    def: "Optimizes runtime performance by re-planning execution mid-flight. AQE uses runtime statistics collected from completed shuffle maps to dynamically coalesce small partitions, optimize join strategies, and isolate skew.",
  },
  {
    term: "Tungsten Execution Engine",
    category: "optimization",
    badge: "Bytecode CodeGen",
    def: "Bypasses JVM memory and GC overheads. Tungsten features raw Off-Heap Memory Allocations using binary row format (UnsafeRow) and compiles complex operations down to raw JVM bytecode using Whole-Stage Code Generation.",
  },
  {
    term: "Dynamic Partition Pruning (DPP)",
    category: "optimization",
    badge: "Lakehouse Filter",
    def: "When joining a large fact table with a filtered dimension table, DPP dynamically extracts the filter results from the dimension and injects them into the fact table scan. This entirely bypasses scanning irrelevant partitions in Delta/Iceberg tables.",
  },
  {
    term: "Kryo Serialization",
    category: "memory",
    badge: "SerDe Protocol",
    def: "A highly optimized, compact binary serialization protocol that outperforms default Java serialization. Recommended for shuffle data exchanges and persistent RDD cache levels to reduce raw network payload sizes.",
  },
  {
    term: "RocksDB State Store",
    category: "streaming",
    badge: "Real-Time SSD",
    def: "An out-of-core, high-performance transactional state store used in Structured Streaming. It stores data on local SSDs, preventing Java GC limits from capping state retention during large-scale operations.",
  },
  {
    term: "Directed Acyclic Graph (DAG)",
    category: "engine",
    badge: "Logical Lineage",
    def: "The logical representation of transformations applied to your source dataset. Spark uses the DAG to rebuild lost partitions and compute physical runtime execution branches efficiently.",
  },
  {
    term: "Broadcast Hash Join (BHJ)",
    category: "optimization",
    badge: "Map-Side Join",
    def: "Broadcasts small lookup tables (<10MB by default, configurable via spark.sql.autoBroadcastJoinThreshold) to all worker nodes, eliminating expensive network shuffles.",
  },
];

export default function SparkEnginePage() {
  const [activeTab, setActiveTab] = useState<SparkSubtab>("architecture");

  // Simulator State
  const [flowType, setFlowType] = useState<"narrow" | "wide" | "broadcast" | "aggregation">("narrow");
  const [simStep, setSimStep] = useState(0);
  const [isSimRunning, setIsSimRunning] = useState(false);

  // Memory Allocator State
  const [heapSize, setHeapSize] = useState(16);
  const [memFraction, setMemFraction] = useState(0.6);
  const [storageFraction, setStorageFraction] = useState(0.5);

  // Lexicon Search State
  const [lexiconQuery, setLexiconQuery] = useState("");
  const [selectedLexiconCat, setSelectedLexiconCat] = useState<string>("all");

  // Curriculum State
  const [selectedPhase, setSelectedPhase] = useState<number | "all">("all");
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);

  // Simulator Flow Definitions
  const simFlowDetails = {
    narrow: {
      title: "Narrow Dependency (Map / Filter)",
      mechanics: "Tasks run completely in-place within each partition without data exchange over network interfaces. Zero shuffle boundaries.",
      benefit: "Extremely low serialization overhead. No stage boundaries; single Stage execution.",
      shuffled: "0 Bytes",
      tasks: "2 Tasks",
      stages: "0 Stages",
    },
    wide: {
      title: "Wide Dependency (Sort-Merge Shuffle Join)",
      mechanics: "All executor nodes write partition hash buckets to local disk, followed by a cluster-wide network exchange (Shuffle Fetch).",
      benefit: "Handles multi-terabyte unbroadcastable joins, but incurs heavy network serialization and disk I/O.",
      shuffled: "~18.4 GB",
      tasks: "200 Tasks",
      stages: "2 Stages",
    },
    broadcast: {
      title: "Map-Side Join (Broadcast Hash Join)",
      mechanics: "The Driver JVM serializes the dimension table and broadcasts it via BitTorrent protocol to all worker nodes.",
      benefit: "Avoids whole-dataset shuffling. Fact table partitions are filtered and joined locally in memory.",
      shuffled: "~12 MB (Broadcast only)",
      tasks: "8 Tasks",
      stages: "0 Stages",
    },
    aggregation: {
      title: "Two-Phase Aggregation (reduceByKey / HashAggregate)",
      mechanics: "Map-side combiner partially reduces rows inside Tungsten memory before sending compressed hash aggregates across network.",
      benefit: "Reduces raw network shuffle size by up to 90% compared to groupByKey.",
      shuffled: "~2.1 GB",
      tasks: "50 Tasks",
      stages: "1 Stage",
    },
  };

  const runSimulation = () => {
    setIsSimRunning(true);
    setSimStep(1);
    setTimeout(() => setSimStep(2), 700);
    setTimeout(() => {
      setSimStep(3);
      setIsSimRunning(false);
    }, 1500);
  };

  // Memory Calculations
  const reservedMemMB = 300;
  const totalHeapMB = heapSize * 1024;
  const usableHeapMB = Math.max(0, totalHeapMB - reservedMemMB);
  const sparkMemoryMB = usableHeapMB * memFraction;
  const userMemoryMB = usableHeapMB * (1 - memFraction);
  const storagePoolMB = sparkMemoryMB * storageFraction;
  const executionPoolMB = sparkMemoryMB * (1 - storageFraction);

  const filteredLexicon = useMemo(() => {
    return lexiconTerms.filter((item) => {
      if (selectedLexiconCat !== "all" && item.category !== selectedLexiconCat) {
        return false;
      }
      if (lexiconQuery.trim()) {
        const q = lexiconQuery.toLowerCase();
        return item.term.toLowerCase().includes(q) || item.def.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedLexiconCat, lexiconQuery]);

  return (
    <div className="space-y-8 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-6 sm:p-8 isolate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400">
              <Zap size={14} />
              <span>Step 3 · Distributed Engine Internals</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Apache Spark &amp; Tungsten Engine Hub
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Deep-dive into Spark physical execution plans, memory management, Catalyst optimizers,
              live partition flow simulators, and the 32-level PySpark curriculum.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-2xl font-bold text-red-400">Spark 4.0</div>
              <div className="text-[11px] text-[var(--muted-foreground)] font-medium">Ready Engine</div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] text-center">
              <div className="text-2xl font-bold text-amber-400">32</div>
              <div className="text-[11px] text-[var(--muted-foreground)] font-medium">Curriculum Levels</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtab Navigation Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "architecture", label: "⚡ Engine Architecture", icon: Cpu },
          { id: "simulator", label: "▶ Live Physical Simulator", icon: Activity },
          { id: "memory", label: "🧮 Tungsten Memory Mapper", icon: Calculator },
          { id: "curriculum", label: "🎓 32-Level PySpark Curriculum", icon: BookOpen },
          { id: "lexicon", label: "📖 Architect's Lexicon", icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SparkSubtab)}
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

      {/* 1. ENGINE ARCHITECTURE VIEW */}
      {activeTab === "architecture" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 3 Milestones */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-lg">
                🔗
              </div>
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Unification Breakthrough
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)]">Unified Data Plane</h3>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                By integrating streaming, interactive SQL, graph structures, and iterative machine learning directly into a single engine, Spark eliminates expensive system-to-system serialization.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg">
                🧬
              </div>
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Memory Paradigm Shift
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)]">Lineage vs Replication</h3>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                Rather than writing intermediate states to physical disk (like MapReduce), RDDs store deterministic lineage graphs. If a partition fails, it is recomputed on-the-fly.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg">
                🧠
              </div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Optimized Compilation
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)]">Declarative Optimization</h3>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
                High-level DataFrame queries allow the Catalyst Optimizer and Tungsten Engine to dynamically rewrite query DAGs and compile custom JVM bytecode at runtime.
              </p>
            </div>
          </div>

          {/* 6 Production Rules */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-green-400 flex items-center gap-1.5">
                <ShieldCheck size={14} /> Production Engineering Standard
              </span>
              <h3 className="text-xl font-bold text-[var(--foreground)] mt-1">
                6 Rules for High-Throughput Spark Architectures
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { num: "01", icon: "🌊", title: "Eliminate Shuffle Spills", desc: "Spills occur when execution memory cannot fit in-flight shuffle structures. Size partitions properly (100–200 MB) and balance spark.memory.fraction = 0.6." },
                { num: "02", icon: "📡", title: "Broadcast Small-File Joins", desc: "Avoid sort-merge joins when joining large datasets with small lookups (<10MB). Explicitly broadcast the smaller table to bypass full stage exchanges." },
                { num: "03", icon: "🚫", title: "Avoid Row-by-Row UDFs", desc: "Python/Scala UDFs bypass Catalyst optimization and force row-by-row object instantiation. Use native Spark SQL expressions or vectorized Pandas-UDFs." },
                { num: "04", icon: "⏱️", title: "Enforce Dynamic Watermarking", desc: "Stateful Structured Streaming applications must enforce retention limits with watermarks. Uncapped state expansion triggers OutOfMemory errors." },
                { num: "05", icon: "🔗", title: "Truncate Long Lineage DAGs", desc: "Long lineage graphs overwhelm the Driver JVM call stack. Break long DAGs in iterative algorithms by periodically calling .checkpoint() to disk." },
                { num: "06", icon: "🧹", title: "Explicit Storage Unpersist", desc: "DataFrames persisted via .cache() or .persist() remain in memory indefinitely. Always call .unpersist() as soon as downstream stages complete." },
              ].map((rule) => (
                <div key={rule.num} className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{rule.icon}</span>
                    <span className="text-xs font-mono font-bold text-[var(--muted-foreground)]">{rule.num}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--foreground)]">{rule.title}</h4>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{rule.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. PHYSICAL SIMULATOR VIEW */}
      {activeTab === "simulator" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                ▶ Physical Execution Engine
              </span>
              <h3 className="text-xl font-bold text-[var(--foreground)] mt-0.5">
                Interactive Execution Simulator
              </h3>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
                Simulate task scheduling, partition flows, and stage boundaries across executor cores in real time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <select
                value={flowType}
                onChange={(e) => {
                  setFlowType(e.target.value as any);
                  setSimStep(0);
                }}
                className="px-4 py-2.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] text-xs sm:text-sm font-semibold text-[var(--foreground)] outline-none"
              >
                <option value="narrow">Narrow Dependency (Map/Filter)</option>
                <option value="wide">Wide Dependency (Sort-Merge Shuffle)</option>
                <option value="broadcast">Map-Side Join (Broadcast Hash)</option>
                <option value="aggregation">Two-Phase Hash Aggregate</option>
              </select>

              <button
                onClick={runSimulation}
                disabled={isSimRunning}
                className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Activity size={16} className={cn(isSimRunning && "animate-pulse")} />
                <span>{isSimRunning ? "Running..." : "▶ Run Plan"}</span>
              </button>
            </div>
          </div>

          {/* Simulator Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Terminal Visualizer */}
            <div className="lg:col-span-2 rounded-2xl bg-[#090d13] border border-white/10 p-5 space-y-4 font-mono text-xs text-slate-300">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-[11px] text-slate-400 ml-2">spark-physical-plan.scala</span>
                </div>
                <span className="text-[10px] text-purple-400 font-bold px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800">
                  LIVE CLUSTER
                </span>
              </div>

              {/* Node Visualizer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-center">
                {/* Column 1: Input Partitions */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Input Slices (S3/ADLS)</div>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-2.5 rounded-xl border transition-all text-xs",
                        simStep >= 1
                          ? "bg-blue-950/60 border-blue-500/50 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                          : "bg-slate-900/60 border-white/5 text-slate-400"
                      )}
                    >
                      Partition A{i}
                      <div className="text-[10px] opacity-60">Block 128MB</div>
                    </div>
                  ))}
                </div>

                {/* Column 2: Executor Cores */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Executor Cores</div>
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-4 rounded-xl border transition-all text-xs flex flex-col items-center justify-center",
                        simStep === 2
                          ? "bg-purple-950/80 border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-pulse"
                          : "bg-slate-900/60 border-white/5 text-slate-400"
                      )}
                    >
                      <span>⚡ Core #{i}</span>
                      <span className="text-[10px] opacity-70 mt-1">
                        {simStep === 2 ? "Compiling Bytecode..." : simStep === 3 ? "Idle" : "Ready"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Column 3: Tungsten Targets */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Tungsten Memory</div>
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-3 rounded-xl border transition-all text-xs",
                        simStep === 3
                          ? "bg-green-950/60 border-green-500/60 text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                          : "bg-slate-900/60 border-white/5 text-slate-400"
                      )}
                    >
                      Out Partition #{i}
                      <div className="text-[10px] opacity-60">
                        {simStep === 3 ? "✓ Materialized" : "Pending"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Metrics & Logs Panel */}
            <div className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-4 text-xs sm:text-sm">
              <div>
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                  Physical Execution Breakdown
                </span>
                <h4 className="text-base font-bold text-[var(--foreground)] mt-0.5">
                  {simFlowDetails[flowType].title}
                </h4>
              </div>

              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {simFlowDetails[flowType].mechanics}
              </p>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs">
                <strong>Architect Benefit:</strong> {simFlowDetails[flowType].benefit}
              </div>

              {/* Stats */}
              <div className="pt-2 border-t border-[var(--border)] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted-foreground)]">Network Shuffled Bytes:</span>
                  <span className="font-mono font-bold text-orange-400">{simFlowDetails[flowType].shuffled}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted-foreground)]">Target Task Count:</span>
                  <span className="font-mono font-bold text-blue-400">{simFlowDetails[flowType].tasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted-foreground)]">Stage Boundaries:</span>
                  <span className="font-mono font-bold text-purple-400">{simFlowDetails[flowType].stages}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TUNGSTEN MEMORY MAPPER VIEW */}
      {activeTab === "memory" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-6 animate-in fade-in duration-300">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Calculator size={14} /> Tungsten &amp; Unified Memory
            </span>
            <h3 className="text-xl font-bold text-[var(--foreground)] mt-1">
              Live JVM Executor Memory Allocator
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
              Spark dynamically shares JVM heap between Execution (shuffles/joins) and Storage (caching). Adjust the parameters below to compute pool splits.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sliders */}
            <div className="space-y-5 p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
              {/* Heap Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                  <span className="text-[var(--foreground)]">Executor Heap Memory (--executor-memory)</span>
                  <span className="font-mono text-purple-400 font-bold">{heapSize} GB</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={64}
                  step={2}
                  value={heapSize}
                  onChange={(e) => setHeapSize(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="text-[11px] text-[var(--muted-foreground)]">
                  Total JVM memory allocated per container.
                </div>
              </div>

              {/* Memory Fraction */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                  <span className="text-[var(--foreground)]">spark.memory.fraction</span>
                  <span className="font-mono text-blue-400 font-bold">{memFraction}</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={0.9}
                  step={0.05}
                  value={memFraction}
                  onChange={(e) => setMemFraction(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="text-[11px] text-[var(--muted-foreground)]">
                  Fraction of usable heap dedicated to Spark internal execution &amp; caching.
                </div>
              </div>

              {/* Storage Fraction */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                  <span className="text-[var(--foreground)]">spark.memory.storageFraction</span>
                  <span className="font-mono text-green-400 font-bold">{storageFraction}</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={storageFraction}
                  onChange={(e) => setStorageFraction(Number(e.target.value))}
                  className="w-full accent-green-500"
                />
                <div className="text-[11px] text-[var(--muted-foreground)]">
                  Immune storage margin protected from eviction by active execution shuffles.
                </div>
              </div>
            </div>

            {/* Visual Allocation Breakdown */}
            <div className="space-y-4 p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                JVM Executor Heap Allocation Breakdown:
              </h4>

              {/* Multi-segment progress bar */}
              <div className="h-8 rounded-xl overflow-hidden flex border border-[var(--border)] shadow-inner">
                <div
                  style={{ width: `${(executionPoolMB / totalHeapMB) * 100}%` }}
                  className="bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white transition-all truncate px-1"
                  title="Execution Pool"
                >
                  Exec
                </div>
                <div
                  style={{ width: `${(storagePoolMB / totalHeapMB) * 100}%` }}
                  className="bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white transition-all truncate px-1"
                  title="Storage Pool"
                >
                  Storage
                </div>
                <div
                  style={{ width: `${(userMemoryMB / totalHeapMB) * 100}%` }}
                  className="bg-amber-600 flex items-center justify-center text-[10px] font-bold text-white transition-all truncate px-1"
                  title="User Memory"
                >
                  User
                </div>
                <div
                  style={{ width: `${(reservedMemMB / totalHeapMB) * 100}%` }}
                  className="bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white transition-all truncate px-1"
                  title="Reserved (300MB)"
                >
                  Res
                </div>
              </div>

              {/* Legend with calculated MBs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="text-purple-400 font-bold">⚡ Execution Pool</div>
                  <div className="text-base font-bold text-[var(--foreground)] mt-0.5">
                    {(executionPoolMB / 1024).toFixed(2)} GB
                  </div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">Joins, Shuffles, Aggregations</div>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="text-blue-400 font-bold">📦 Storage Pool</div>
                  <div className="text-base font-bold text-[var(--foreground)] mt-0.5">
                    {(storagePoolMB / 1024).toFixed(2)} GB
                  </div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">.cache() &amp; .persist() tables</div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-amber-400 font-bold">👤 User Memory</div>
                  <div className="text-base font-bold text-[var(--foreground)] mt-0.5">
                    {(userMemoryMB / 1024).toFixed(2)} GB
                  </div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">Custom structures &amp; UDFs</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-500/10 border border-slate-500/20">
                  <div className="text-slate-400 font-bold">🔒 Reserved Memory</div>
                  <div className="text-base font-bold text-[var(--foreground)] mt-0.5">300 MB</div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">Spark hardcoded safety buffer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PYSPARK CURRICULUM VIEW */}
      {activeTab === "curriculum" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-[var(--foreground)]">
                Senior PySpark Master Curriculum (32 Levels)
              </h3>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
                From Spark Connect architecture to K8s dynamic allocations and PyDeequ testing.
              </p>
            </div>

            {/* Phase Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]">
              {["all", 1, 2, 3, 4].map((phase) => (
                <button
                  key={phase}
                  onClick={() => setSelectedPhase(phase as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 capitalize",
                    selectedPhase === phase
                      ? "bg-purple-600 text-white shadow-md font-semibold"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                >
                  {phase === "all" ? "All Phases" : `Phase ${phase}`}
                </button>
              ))}
            </div>
          </div>

          {/* Curriculum items */}
          <div className="space-y-4">
            {pysparkData.map((item, index) => {
              const isExpanded = expandedLevel === item.id;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-2xl border transition-all overflow-hidden",
                    isExpanded
                      ? "bg-[var(--surface-1)] border-purple-500/40 shadow-xl"
                      : "bg-[var(--surface-1)] border-[var(--border)] hover:bg-[var(--surface-2)]"
                  )}
                >
                  <div
                    onClick={() => setExpandedLevel(isExpanded ? null : item.id)}
                    className="p-5 cursor-pointer flex items-center justify-between gap-3 select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-500/20">
                        L{index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] text-purple-400 font-semibold uppercase">{item.category}</div>
                        <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                    <ChevronDown
                      size={16}
                      className={cn("text-[var(--muted-foreground)] transition-transform", isExpanded && "rotate-180 text-purple-400")}
                    />
                  </div>

                  {isExpanded && (
                    <div className="p-5 border-t border-[var(--border)] bg-[var(--surface-2)] space-y-4 text-xs sm:text-sm">
                      {item.use_case && (
                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200">
                          <strong>Enterprise Scenario:</strong> {item.use_case}
                        </div>
                      )}
                      <CodeBlock
                        code={item.code}
                        language="pyspark"
                        filename={`${item.id}.py`}
                        badge="PySpark Execution"
                      />
                      {item.notes && item.notes.length > 0 && (
                        <div className="space-y-1">
                          <span className="font-bold text-[var(--foreground)]">Execution Mechanics:</span>
                          <ul className="list-disc pl-5 space-y-1 text-[var(--muted-foreground)]">
                            {item.notes.map((n, i) => (
                              <li key={i}>{n}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. ARCHITECT'S LEXICON VIEW */}
      {activeTab === "lexicon" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Core Terminology Encyclopedia
              </span>
              <h3 className="text-xl font-bold text-[var(--foreground)] mt-0.5">
                The Architect&rsquo;s Spark Lexicon
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  value={lexiconQuery}
                  onChange={(e) => setLexiconQuery(e.target.value)}
                  placeholder="Search terms (e.g. AQE, Tungsten)..."
                  className="pl-9 pr-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--foreground)] outline-none"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                {["all", "engine", "optimization", "memory", "streaming"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedLexiconCat(cat)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium capitalize",
                      selectedLexiconCat === cat
                        ? "bg-purple-600 text-white font-semibold"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lexicon Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLexicon.map((term) => (
              <div key={term.term} className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wide">
                    {term.category}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {term.badge}
                  </span>
                </div>
                <h4 className="text-base font-bold text-[var(--foreground)]">{term.term}</h4>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{term.def}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
