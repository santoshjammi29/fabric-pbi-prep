"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MindmapNode {
  title: string;
  icon: string;
  color: string;
  summary: string;
  subtopics: Array<{ name: string; desc: string; protocols: string[] }>;
}

const mindmapData: MindmapNode[] = [
  {
    title: "1. Ingestion & Streaming",
    icon: "📡",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400",
    summary: "High-throughput real-time event streaming, Change Data Capture (CDC), and batch ingestion protocols.",
    subtopics: [
      { name: "Kafka & Event Streams", desc: "Distributed partition logs, Consumer Groups, and exactly-once delivery semantics.", protocols: ["Kafka", "Azure Event Hubs", "Redpanda"] },
      { name: "Log-based CDC", desc: "Zero-load database transaction log mining with schema evolution.", protocols: ["Debezium", "AWS DMS", "Qlik Replicate"] },
      { name: "Stream Processing", desc: "Stateful streaming with event-time watermarking and RocksDB state stores.", protocols: ["Apache Flink", "Spark Structured Streaming"] },
    ],
  },
  {
    title: "2. Open Lakehouse Storage",
    icon: "🪶",
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400",
    summary: "ACID transactional table formats on object storage eliminating proprietary warehouse lock-in.",
    subtopics: [
      { name: "Delta Lake 3.x", desc: "ACID transaction log (_delta_log), Liquid clustering, and UniForm multi-engine reader.", protocols: ["Delta Lake", "UniForm", "Z-Order"] },
      { name: "Apache Iceberg", desc: "Snapshot isolation, hidden partitioning, and REST catalog integration.", protocols: ["Iceberg", "Polaris Catalog", "Nessie"] },
      { name: "Cloud Object Storage", desc: "High-bandwidth multipart uploads, Hierarchical Namespace, and tiering.", protocols: ["ADLS Gen2", "AWS S3", "GCS"] },
    ],
  },
  {
    title: "3. Vectorized Compute & Transformations",
    icon: "🚀",
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
    summary: "Distributed query compilation, C++ vectorized kernels, and declarative data transformation DAGs.",
    subtopics: [
      { name: "Apache Spark 4.0", desc: "Tungsten whole-stage codegen, AQE runtime re-planning, and DPP optimization.", protocols: ["Spark", "Photon C++", "PySpark"] },
      { name: "Declarative Transformations", desc: "SQL-first data modeling with integrated tests, documentation, and lineage graphs.", protocols: ["dbt Core", "SQLMesh", "Coalesce"] },
      { name: "Modern In-Memory Engines", desc: "Embedded vectorized columnar processing for edge queries and micro-ETL.", protocols: ["DuckDB", "Polars", "DataFusion"] },
    ],
  },
  {
    title: "4. Semantic Serving & Low-Latency BI",
    icon: "❄️",
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400",
    summary: "Zero-copy semantic model queries and multi-cluster auto-scaling analytical warehouses.",
    subtopics: [
      { name: "Fabric Direct Lake", desc: "VertiPaq direct memory mapped streaming over OneLake Parquet files without import.", protocols: ["Microsoft Fabric", "Power BI", "OneLake"] },
      { name: "Serverless SQL Warehouses", desc: "Auto-suspending multi-cluster query execution with zero compute idle costs.", protocols: ["Snowflake", "Databricks SQL", "BigQuery"] },
    ],
  },
  {
    title: "5. Governance, Quality & FinOps",
    icon: "🛡️",
    color: "from-red-500/20 to-rose-500/20 border-red-500/30 text-red-400",
    summary: "Federated data mesh domains, OpenLineage metadata auditing, and capacity cost engineering.",
    subtopics: [
      { name: "Unity Catalog & Purview", desc: "Unified access control, row/column masking, and end-to-end lineage telemetry.", protocols: ["Unity Catalog", "Microsoft Purview", "OpenLineage"] },
      { name: "Data Contracts & Quality", desc: "Open Data Contract Standard (ODCS) and automated circuit breakers.", protocols: ["Great Expectations", "Soda Core", "Monte Carlo"] },
      { name: "Cloud FinOps", desc: "Capacity Unit smoothing, spot compute fleets, and storage compaction lifecycle.", protocols: ["Fabric FinOps", "Snowflake Resource Monitors"] },
    ],
  },
  {
    title: "6. AI-Native & Agentic Pipelines",
    icon: "🤖",
    color: "from-pink-500/20 to-purple-500/20 border-pink-500/30 text-pink-400",
    summary: "Vector indexing, automated embedding generation, and Model Context Protocol (MCP) server endpoints.",
    subtopics: [
      { name: "Vector Search & Indexing", desc: "HNSW and IVF index structures for low-latency cosine similarity over high-dimensional vectors.", protocols: ["Delta Vector Search", "pgvector", "Pinecone"] },
      { name: "Model Context Protocol (MCP)", desc: "Standardized JSON-RPC protocol exposing data pipelines and warehouse catalogs to AI agents.", protocols: ["MCP Servers", "LangChain", "LlamaIndex"] },
    ],
  },
];

export default function MindmapPage() {
  const [selectedNode, setSelectedNode] = useState<number>(0);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-6 sm:p-8 isolate">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400">
            <Globe size={14} />
            <span>Interactive Visual Architecture Map</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Modern Data Engineering Mindmap
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            A comprehensive visual topography mapping the 6 foundational domains of modern data architecture —
            from edge ingestion to serverless serving and AI-native agentic pipelines.
          </p>
        </div>
      </div>

      {/* Interactive Mindmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mindmapData.map((node, idx) => {
          const isSelected = selectedNode === idx;
          return (
            <motion.div
              key={node.title}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedNode(idx)}
              className={cn(
                "p-6 rounded-3xl border transition-all duration-300 space-y-4 cursor-pointer flex flex-col justify-between",
                isSelected
                  ? `bg-gradient-to-br ${node.color} shadow-xl`
                  : "bg-[var(--surface-1)] border-[var(--border)] hover:bg-[var(--surface-2)]"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{node.icon}</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Domain 0{idx + 1}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[var(--foreground)]">{node.title}</h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{node.summary}</p>
              </div>

              {/* Subtopics */}
              <div className="space-y-2 pt-3 border-t border-[var(--border)]">
                {node.subtopics.map((sub) => (
                  <div key={sub.name} className="p-3 rounded-2xl bg-[var(--surface-2)]/60 border border-[var(--border)] space-y-1">
                    <div className="text-xs font-bold text-[var(--foreground)] flex items-center justify-between">
                      <span>{sub.name}</span>
                      <ChevronRight size={12} className="text-[var(--muted-foreground)]" />
                    </div>
                    <p className="text-[11px] text-[var(--muted-foreground)] leading-snug">{sub.desc}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {sub.protocols.map((p) => (
                        <span key={p} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-[var(--foreground)] opacity-80">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
