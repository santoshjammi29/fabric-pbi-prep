"use client";

import React, { useState } from "react";
import {
  Code2,
  Search,
  Sliders,
  Cpu,
  Zap,
  Flame,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FlowStage {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  keyTechniques: string[];
  cheatCodeTarget?: string;
}

const FLOW_STAGES: FlowStage[] = [
  {
    id: "input",
    name: "Query / Code",
    subtitle: "DataFrame or SQL",
    icon: Code2,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description: "Declarative SQL strings or programmatic DataFrame transformations enter the Catalyst engine as an Unresolved Abstract Syntax Tree (AST).",
    keyTechniques: ["AST Parsing", "Identical representation for SQL & Python", "Lazy execution registration"],
    cheatCodeTarget: "spark-interface-switching",
  },
  {
    id: "analyzer",
    name: "Catalyst Analyzer",
    subtitle: "Catalog Resolution",
    icon: Search,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    description: "Resolves relations and column references against the Metastore / Unity Catalog, verifies schema types, and binds function signatures to create an Analyzed Logical Plan.",
    keyTechniques: ["Catalog / Schema lookup", "Data type coercion", "Name resolution & scoping"],
    cheatCodeTarget: "spark-interface-switching",
  },
  {
    id: "optimizer",
    name: "Logical Optimizer",
    subtitle: "Rule-Based Rewrites",
    icon: Sliders,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    description: "Applies standard rule-based transformations to generate the Optimized Logical Plan, pushing filters closer to the data sources and pruning unused columns early.",
    keyTechniques: ["Predicate Pushdown", "Projection / Column Pruning", "Constant Folding & Null Propagation"],
    cheatCodeTarget: "spark-interface-switching",
  },
  {
    id: "physical",
    name: "Physical Planning",
    subtitle: "Cost-Based Strategies",
    icon: Cpu,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    description: "Generates multiple physical execution candidates (Broadcast Hash Join, Sort Merge Join, Shuffle Hash Join) and evaluates them via the Cost-Based Optimizer (CBO) to choose the cheapest plan.",
    keyTechniques: ["Join selection (BHJ vs SMJ)", "Bucketing physical collocation", "Partition count allocation"],
    cheatCodeTarget: "spark-join-tuning-bhj-bucketing",
  },
  {
    id: "aqe",
    name: "AQE Runtime Loop",
    subtitle: "Mid-Flight Feedback",
    icon: Zap,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    description: "Adaptive Query Execution intercepts data after shuffle map stages, inspects actual partition size metrics, and dynamically re-optimizes the running physical plan.",
    keyTechniques: ["Auto partition coalescing", "Dynamic SortMerge -> Broadcast Join", "Data skew splitting & re-balancing"],
    cheatCodeTarget: "spark-aqe-runtime-tuning",
  },
  {
    id: "tungsten",
    name: "Tungsten Execution",
    subtitle: "CodeGen & Hardware",
    icon: Flame,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    description: "Bypasses Java Garbage Collection via off-heap UnsafeRow memory representation, and compiles whole-stage operations into bare-metal Java bytecode for L1/L2 CPU cache speed.",
    keyTechniques: ["Whole-Stage Code Generation", "Off-heap binary memory (UnsafeRow)", "Vectorized Parquet/Arrow decoding"],
    cheatCodeTarget: "spark-kryo-memory-tuning",
  },
];

interface OptimizationFlowProps {
  onSelectCheatCode?: (id: string) => void;
}

export function OptimizationFlow({ onSelectCheatCode }: OptimizationFlowProps) {
  const [selectedStageId, setSelectedStageId] = useState<string>("aqe");
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const activeStage = FLOW_STAGES.find((s) => s.id === selectedStageId) || FLOW_STAGES[4];

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-lg backdrop-blur-xl transition-all">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Zap size={16} />
            </span>
            <h2 className="text-base font-bold text-[var(--foreground)] tracking-tight">
              Spark Catalyst Optimization Lifecycle
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Interactive Flow
            </span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            How declarative queries transform from raw syntax into hardware-accelerated Tungsten physical execution.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="self-start sm:self-auto px-2.5 py-1 text-xs font-medium rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
        >
          {isExpanded ? "Collapse Diagram" : "Expand Diagram"}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-5 space-y-4">
          {/* Flow Stepper Buttons / Nodes */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {FLOW_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isSelected = stage.id === selectedStageId;

              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setSelectedStageId(stage.id)}
                  className={cn(
                    "group relative flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40",
                    isSelected
                      ? `${stage.bgColor} ${stage.borderColor} shadow-md shadow-blue-500/5 ring-1 ring-blue-500/30`
                      : "bg-[var(--surface-1)] border-[var(--border)] hover:bg-[var(--surface-2)] hover:border-[var(--border-hover)]"
                  )}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-md border text-xs",
                        isSelected
                          ? `${stage.bgColor} ${stage.color} ${stage.borderColor}`
                          : "bg-[var(--surface-2)] text-[var(--muted-foreground)] border-transparent group-hover:text-[var(--foreground)]"
                      )}
                    >
                      <Icon size={13} />
                    </span>
                    <span className="text-[10px] font-mono text-[var(--muted-foreground)] font-semibold">
                      0{idx + 1}
                    </span>
                  </div>

                  <span className={cn("text-xs font-semibold leading-tight", isSelected ? stage.color : "text-[var(--foreground)]")}>
                    {stage.name}
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)] truncate mt-0.5">
                    {stage.subtitle}
                  </span>

                  {/* Active indicator dot */}
                  {isSelected && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-blue-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Detailed Inspector Panel for Selected Stage */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className={cn("px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider border", activeStage.bgColor, activeStage.color, activeStage.borderColor)}>
                    Stage {FLOW_STAGES.findIndex((s) => s.id === activeStage.id) + 1} of 6
                  </span>
                  <h3 className="text-sm font-bold text-[var(--foreground)]">
                    {activeStage.name} — {activeStage.subtitle}
                  </h3>
                </div>
                <p className="text-xs text-[var(--foreground)] leading-relaxed">
                  {activeStage.description}
                </p>

                {/* Key Techniques / Sub-processes */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-medium text-[var(--muted-foreground)]">Key Mechanisms:</span>
                  {activeStage.keyTechniques.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--surface-2)] text-[var(--foreground)] border border-[var(--border)]"
                    >
                      <CheckCircle2 size={10} className={activeStage.color} />
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Jump to Relevant Cheat Code */}
              {activeStage.cheatCodeTarget && onSelectCheatCode && (
                <button
                  type="button"
                  onClick={() => onSelectCheatCode(activeStage.cheatCodeTarget!)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 active:scale-95 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                >
                  <Sparkles size={13} />
                  <span>View Related Cheat Code</span>
                  <ChevronRight size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
