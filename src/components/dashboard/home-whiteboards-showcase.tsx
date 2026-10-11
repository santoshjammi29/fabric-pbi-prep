"use client";

import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import {
  Workflow,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Shuffle,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { architectureDiagrams, ArchitectureDiagramItem } from "@/data/diagrams";
import { useDiagramTheme } from "@/lib/diagram-theme";
import { WhiteboardThemeToggle, WhiteboardFloatingThemeToggle } from "@/components/architecture/whiteboard-theme-toggle";

// Map diagrams to guided learning topics for deep-linking
const DIAGRAM_TO_TOPIC: Record<string, { topicKey: string; topicName: string }> = {
  "fabric-onelake-architecture": { topicKey: "fabric", topicName: "Microsoft Fabric" },
  "powerbi-direct-lake-vertipaq": { topicKey: "powerbi", topicName: "Power BI & VertiPaq" },
  "powerbi-dax-engine-context": { topicKey: "powerbi", topicName: "Power BI & DAX" },
  "apache-airflow-distributed-architecture": { topicKey: "airflow", topicName: "Apache Airflow" },
  "dbt-analytics-engineering-dag": { topicKey: "dbt", topicName: "dbt Modern Stack" },
  "adf-hybrid-production-architecture": { topicKey: "adf", topicName: "Azure Data Factory" },
  "databricks-platform-master": { topicKey: "databricks", topicName: "Databricks Lakehouse" },
  "databricks-medallion-pipeline": { topicKey: "databricks", topicName: "Databricks Medallion" },
  "delta-live-tables-pipeline": { topicKey: "databricks", topicName: "Delta Live Tables" },
  "delta-lake-under-the-hood": { topicKey: "lakehouse", topicName: "Delta Lake & Storage" },
  "apache-iceberg-open-table-format": { topicKey: "lakehouse", topicName: "Apache Iceberg" },
  "spark-catalyst-photon-engine": { topicKey: "spark", topicName: "Apache Spark" },
  "spark-shuffle-memory-execution": { topicKey: "spark", topicName: "Spark Shuffle Internals" },
  "kimball-dimensional-star-schema": { topicKey: "kimball", topicName: "Kimball Dimensional" },
  "data-vault-enterprise-architecture": { topicKey: "vault", topicName: "Data Vault 2.0" },
  "sql-server-query-engine-optimization": { topicKey: "sql", topicName: "SQL Engine Optimization" },
  "kafka-event-streaming-pipeline": { topicKey: "kafka", topicName: "Kafka Streaming" },
  "cdc-debezium-lakehouse-pipeline": { topicKey: "kafka", topicName: "CDC & Debezium" },
  "purview-governance-catalog": { topicKey: "purview", topicName: "Purview Governance" },
  "rag-vector-search-data-pipeline": { topicKey: "spark", topicName: "AI & Vector RAG" },
  "unity-catalog-governance": { topicKey: "databricks", topicName: "Unity Catalog" },
};

const CATEGORIES = [
  "All Blueprints",
  "Fabric & Power BI",
  "Compute & Optimization",
  "Data Pipelines & Ingestion",
  "Storage Engine",
  "Data Modeling & Architecture",
  "Governance & Security",
] as const;

export function HomeWhiteboardsShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Blueprints");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [activeModalDiagram, setActiveModalDiagram] = useState<ArchitectureDiagramItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isShuffling, setIsShuffling] = useState(false);
  const [theme] = useDiagramTheme();

  const isDark = theme === "dark";

  // Filter diagrams by selected category
  const filteredDiagrams = useMemo(() => {
    if (selectedCategory === "All Blueprints") return architectureDiagrams;
    return architectureDiagrams.filter((d) => d.category === selectedCategory);
  }, [selectedCategory]);

  // Featured diagram
  const featuredDiagram = useMemo(() => {
    if (filteredDiagrams.length === 0) return architectureDiagrams[0];
    const safeIdx = Math.min(featuredIndex, filteredDiagrams.length - 1);
    return filteredDiagrams[safeIdx >= 0 ? safeIdx : 0];
  }, [filteredDiagrams, featuredIndex]);

  // Secondary blueprints to show alongside featured
  const secondaryDiagrams = useMemo(() => {
    return filteredDiagrams
      .filter((d) => d.id !== featuredDiagram?.id)
      .slice(0, 4);
  }, [filteredDiagrams, featuredDiagram]);

  const handleShuffle = useCallback(() => {
    setIsShuffling(true);
    const nextIdx = Math.floor(Math.random() * filteredDiagrams.length);
    setFeaturedIndex(nextIdx);
    toast.success("Shuffled featured whiteboard architecture blueprint");
    setTimeout(() => setIsShuffling(false), 400);
  }, [filteredDiagrams]);

  const pairedTopic = featuredDiagram ? DIAGRAM_TO_TOPIC[featuredDiagram.id] : null;

  return (
    <section className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
              <Workflow size={13} className="text-purple-500 dark:text-purple-400" />
              <span>21 Architecture Whiteboards</span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 hidden sm:inline">
              Hand-Drawn System Design
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
            Executive Whiteboard Architecture Blueprints
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-2xl leading-relaxed">
            High-resolution whiteboard schematics illustrating distributed compute execution, storage layouts, and enterprise multi-engine lakehouses.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Whiteboard Global Theme Toggle Option */}
          <WhiteboardThemeToggle size="sm" showLabel={true} className="hidden sm:inline-flex" />

          {/* Shuffle button */}
          <button
            type="button"
            onClick={handleShuffle}
            title="Randomize featured blueprint"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] transition-all cursor-pointer active:scale-95"
          >
            <Shuffle size={13} className={cn("text-purple-500 transition-transform", isShuffling && "rotate-180")} />
            <span className="hidden sm:inline">Shuffle</span>
          </button>

          <Link
            href="/architecture?tab=diagrams"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm shadow-purple-600/20 transition-all cursor-pointer"
          >
            <span>All 21 Blueprints</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setFeaturedIndex(0);
            }}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer",
              selectedCategory === cat
                ? "bg-purple-600 text-white font-semibold shadow-xs"
                : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] border border-[var(--border)]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Showcase Layout: Featured Large Blueprint (Second Layout Style) + Secondary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Featured Large Interactive Blueprint Card */}
        {featuredDiagram && (
          <div className="lg:col-span-8 rounded-2xl sm:rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-3.5 sm:p-5 space-y-3.5 shadow-sm relative overflow-hidden group">
            {/* Top row: Category indicator + Topics */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {featuredDiagram.category}
                </span>
                <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                  Blueprint #{architectureDiagrams.findIndex((d) => d.id === featuredDiagram.id) + 1} of 21
                </span>
              </div>

              {pairedTopic && (
                <Link
                  href={`/guided-learning?topic=${pairedTopic.topicKey}`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300 hover:underline"
                >
                  <Compass size={12} />
                  <span>Guided Track: {pairedTopic.topicName} &rarr;</span>
                </Link>
              )}
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)] leading-snug group-hover:text-purple-400 transition-colors">
                {featuredDiagram.title}
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {featuredDiagram.subtitle}
              </p>
            </div>

            {/* Diagram Image Container with Image 2 Layout Style & Dark Mode */}
            <div
              onClick={() => {
                setActiveModalDiagram(featuredDiagram);
                setZoomLevel(1);
              }}
              className={cn(
                "relative w-full aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer shadow-inner group/img transition-colors duration-300",
                isDark ? "whiteboard-container-dark" : "whiteboard-container-light"
              )}
            >
              {/* Floating Category Pill (Top-Left) */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 pointer-events-none">
                <span className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-[10px] sm:text-xs font-bold tracking-wider text-purple-300 uppercase border border-white/15 shadow-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  {featuredDiagram.category}
                </span>
              </div>

              {/* Floating Controls (Top-Right): Dark Mode Toggle + Maximize */}
              <div
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <WhiteboardFloatingThemeToggle />
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalDiagram(featuredDiagram);
                    setZoomLevel(1);
                  }}
                  className="p-1.5 sm:p-2 rounded-xl bg-black/75 hover:bg-black/90 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-all shadow-md cursor-pointer flex items-center gap-1 text-[11px] font-semibold touch-manipulation"
                  title="Inspect Full Blueprint"
                >
                  <Maximize2 size={13} />
                  <span className="hidden sm:inline">Inspect</span>
                </button>
              </div>

              {/* Whiteboard Graphic */}
              <div className="relative w-full h-full flex items-center justify-center p-3 sm:p-5">
                <Image
                  src={featuredDiagram.image}
                  alt={featuredDiagram.title}
                  width={1200}
                  height={750}
                  priority={true}
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  className={cn(
                    "max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-300 group-hover/img:scale-[1.018]",
                    isDark ? "whiteboard-dark" : "whiteboard-light"
                  )}
                />
              </div>

              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/15 transition-colors flex items-center justify-center pointer-events-none">
                <div className="px-3.5 py-1.5 rounded-xl bg-black/75 text-white text-xs font-semibold backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1.5 shadow-lg border border-white/15">
                  <Maximize2 size={13} />
                  <span>Click to Inspect Full Blueprint</span>
                </div>
              </div>
            </div>

            {/* Key Mechanisms Checklist */}
            <div className="pt-2 border-t border-[var(--border)] space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles size={12} /> Architectural Takeaways &amp; Internals:
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--muted-foreground)]">
                {featuredDiagram.keyPoints.slice(0, 4).map((kp, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{kp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {featuredDiagram.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[var(--muted-foreground)] border border-[var(--border)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalDiagram(featuredDiagram);
                    setZoomLevel(1);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-2)] text-xs font-semibold text-[var(--foreground)] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Maximize2 size={13} />
                  <span>Inspect Lightbox</span>
                </button>

                {pairedTopic && (
                  <Link
                    href={`/guided-learning?topic=${pairedTopic.topicKey}`}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Launch Guided Track</span>
                    <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Right: Secondary Blueprints Quick Column */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[var(--foreground)]">
              More Architecture Blueprints
            </span>
            <span className="text-[11px] font-mono">{filteredDiagrams.length} available</span>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            {secondaryDiagrams.map((d) => {
              const subTopic = DIAGRAM_TO_TOPIC[d.id];
              return (
                <div
                  key={d.id}
                  onClick={() => {
                    setActiveModalDiagram(d);
                    setZoomLevel(1);
                  }}
                  className="p-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] transition-all cursor-pointer group flex items-start gap-3 shadow-xs hover:border-purple-500/40"
                >
                  {/* Thumbnail with Dark/Light Canvas Transition */}
                  <div
                    className={cn(
                      "relative w-24 h-18 sm:w-28 sm:h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 shadow-inner flex items-center justify-center p-1 transition-colors duration-300",
                      isDark ? "whiteboard-container-dark" : "whiteboard-container-light"
                    )}
                  >
                    <Image
                      src={d.image}
                      alt={d.title}
                      width={120}
                      height={80}
                      sizes="120px"
                      className={cn(
                        "max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-200",
                        isDark ? "whiteboard-dark" : "whiteboard-light"
                      )}
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-[var(--muted-foreground)] truncate max-w-[120px]">
                        {d.category}
                      </span>
                      <Maximize2 size={11} className="text-[var(--muted-foreground)] group-hover:text-purple-400 transition-colors shrink-0" />
                    </div>

                    <h4 className="text-xs font-bold text-[var(--foreground)] line-clamp-1 group-hover:text-purple-400 transition-colors">
                      {d.title}
                    </h4>

                    <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                      {d.subtitle}
                    </p>

                    {subTopic && (
                      <div className="pt-1 flex items-center justify-between text-[10px]">
                        <span className="text-purple-400 font-semibold truncate">
                          Track: {subTopic.topicName}
                        </span>
                        <span className="text-[var(--muted-foreground)] group-hover:text-purple-400 transition-colors">
                          &rarr;
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/guided-learning"
            className="p-3.5 rounded-2xl border border-dashed border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-center transition-colors group"
          >
            <div className="text-xs font-bold text-purple-400 flex items-center justify-center gap-1.5">
              <Compass size={13} />
              <span>Explore All 13 Guided Tracks with Blueprints</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
              Deep-dive into end-to-end architectures and production implementation guides
            </p>
          </Link>
        </div>
      </div>

      {/* ── LIGHTBOX MODAL FOR BLUEPRINT INSPECTION WITH DARK/LIGHT OPTION ─── */}
      <AnimatePresence>
        {activeModalDiagram && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
            onClick={() => setActiveModalDiagram(null)}
          >
            <m.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-[var(--surface-1)] shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--border)] bg-[var(--surface-2)] shrink-0">
                <div className="space-y-0.5 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30">
                      {activeModalDiagram.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate">
                      {activeModalDiagram.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)] truncate hidden sm:block">
                    {activeModalDiagram.subtitle}
                  </p>
                </div>

                {/* Controls: Theme Toggle + Zoom + Close */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="hidden sm:block">
                    <WhiteboardThemeToggle size="xs" showLabel={false} />
                  </div>

                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                    className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span className="text-[10px] font-mono font-semibold text-[var(--muted-foreground)] w-10 text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                    className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn size={16} />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                    title="Reset Zoom"
                  >
                    <RotateCcw size={15} />
                  </button>
                  <div className="w-px h-4 bg-[var(--border)] mx-1" />
                  <button
                    onClick={() => setActiveModalDiagram(null)}
                    className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                    title="Close (Esc)"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Image Viewport with Dark/Light Blueprint Mode */}
              <div
                className={cn(
                  "flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center min-h-[350px] transition-colors duration-300",
                  isDark ? "whiteboard-container-dark" : "whiteboard-container-light"
                )}
              >
                <div
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
                  className="transition-transform duration-150 max-w-full"
                >
                  <Image
                    src={activeModalDiagram.image}
                    alt={activeModalDiagram.title}
                    width={1400}
                    height={900}
                    sizes="(max-width: 768px) 100vw, 85vw"
                    priority={true}
                    className={cn(
                      "object-contain max-h-[62vh] w-auto h-auto rounded-lg shadow-md transition-all duration-300",
                      isDark ? "whiteboard-dark" : "whiteboard-light"
                    )}
                  />
                </div>
              </div>

              {/* Modal Footer with Architecture Mechanisms */}
              <div className="px-4 sm:px-6 py-3 border-t border-[var(--border)] bg-[var(--surface-2)] shrink-0 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                  Key Architecture Mechanisms:
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--foreground)]">
                  {activeModalDiagram.keyPoints.map((kp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold shrink-0 mt-0.5">•</span>
                      <span>{kp}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between pt-1 text-[11px] text-[var(--muted-foreground)]">
                  {activeModalDiagram.docLink && (
                    <a
                      href={activeModalDiagram.docLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink size={12} />
                      <span>Official Architecture Spec</span>
                    </a>
                  )}

                  {DIAGRAM_TO_TOPIC[activeModalDiagram.id] && (
                    <Link
                      href={`/guided-learning?topic=${DIAGRAM_TO_TOPIC[activeModalDiagram.id].topicKey}`}
                      onClick={() => setActiveModalDiagram(null)}
                      className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>Study This Track</span>
                      <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default HomeWhiteboardsShowcase;
