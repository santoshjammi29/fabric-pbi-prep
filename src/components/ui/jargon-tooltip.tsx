"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { BookOpen, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface JargonDefinition {
  term: string;
  plainEnglish: string;
  category: string;
  conceptId?: string;
}

export const JARGON_GLOSSARY: Record<string, JargonDefinition> = {
  "v-order": {
    term: "V-Order",
    plainEnglish: "A Microsoft columnar sort and compression optimization for Parquet files that enables lightning-fast Direct Lake query execution in Power BI.",
    category: "Fabric Storage",
    conceptId: "concept-v-order",
  },
  "direct lake": {
    term: "Direct Lake",
    plainEnglish: "A Power BI storage mode that reads Parquet files straight from OneLake memory without importing data or converting queries to slow SQL.",
    category: "Power BI / Fabric",
    conceptId: "concept-direct-lake-mode",
  },
  "medallion architecture": {
    term: "Medallion Architecture",
    plainEnglish: "A 3-stage data layout (Bronze raw, Silver validated, Gold business-ready) that progressively cleanses and organizes enterprise data.",
    category: "Lakehouse Design",
    conceptId: "concept-medallion-architecture",
  },
  "idempotency": {
    term: "Idempotency",
    plainEnglish: "The guarantee that running a data pipeline or query multiple times with identical inputs produces the exact same result without duplicate rows.",
    category: "Pipeline Engineering",
    conceptId: "concept-idempotency",
  },
  "tungsten": {
    term: "Tungsten Engine",
    plainEnglish: "Spark's low-level execution engine that manages raw off-heap memory and compiles whole-stage queries into native Java bytecode.",
    category: "Compute Internals",
    conceptId: "concept-spark-tungsten-engine",
  },
  "catalyst": {
    term: "Catalyst Optimizer",
    plainEnglish: "Spark's query planner that automatically optimizes your DataFrame code by pushing down filters, eliminating unused columns, and picking the fastest joins.",
    category: "Compute Internals",
    conceptId: "concept-catalyst-optimizer",
  },
  "delta lake": {
    term: "Delta Lake",
    plainEnglish: "An open-source storage layer on top of Parquet files providing ACID transactions, time travel rollbacks, and schema enforcement.",
    category: "Open Table Formats",
    conceptId: "concept-delta-lake-internals",
  },
  "z-order": {
    term: "Z-Order Clustering",
    plainEnglish: "A multidimensional file sorting technique that groups related data across multiple columns together, allowing queries to skip reading 90%+ of files.",
    category: "Storage Optimization",
    conceptId: "concept-z-order-clustering",
  },
  "cdc": {
    term: "Change Data Capture (CDC)",
    plainEnglish: "A streaming technique that captures row-level inserts, updates, and deletes directly from database transaction logs in real time.",
    category: "Data Ingestion",
    conceptId: "concept-cdc",
  },
  "watermark": {
    term: "Watermark",
    plainEnglish: "A threshold in real-time streaming that tells the engine how late event timestamps can arrive before being discarded from windowed aggregates.",
    category: "Streaming",
    conceptId: "concept-structured-streaming-watermarking",
  },
  "acid": {
    term: "ACID Properties",
    plainEnglish: "Four database guarantees (Atomicity, Consistency, Isolation, Durability) ensuring transactions either fully succeed or fail safely without corrupting data.",
    category: "Database Foundations",
    conceptId: "concept-acid-properties",
  },
  "shuffle": {
    term: "Shuffle",
    plainEnglish: "The costly redistribution of data across all machines in a cluster over the network during grouping, joining, or repartitioning operations.",
    category: "Distributed Compute",
    conceptId: "concept-spark-shuffle-tuning",
  },
  "zero-trust": {
    term: "Zero-Trust Architecture",
    plainEnglish: "A security model that requires continuous identity verification, encryption, and least-privilege permissions rather than trusting anything inside the network.",
    category: "Security & Governance",
    conceptId: "concept-zero-trust-data-fabric",
  },
  "cap theorem": {
    term: "CAP Theorem",
    plainEnglish: "A law of distributed systems stating a distributed database can only guarantee at most two out of Consistency, Availability, and Partition Tolerance.",
    category: "System Architecture",
    conceptId: "concept-cap-theorem-lakehouse",
  },
  "f-sku": {
    term: "Fabric Capacity (F-SKUs)",
    plainEnglish: "The shared pool of compute capacity units (CUs) purchased in Microsoft Fabric, automatically shared and smoothed over 24 hours across workloads.",
    category: "FinOps & Capacity",
    conceptId: "concept-fabric-capacity-f-skus",
  },
  "lakehouse": {
    term: "Lakehouse",
    plainEnglish: "A modern architecture combining the scalable cheap storage of a data lake with the ACID reliability and SQL performance of a data warehouse.",
    category: "Lakehouse Design",
    conceptId: "concept-lakehouse-vs-dw",
  },
};

interface JargonTooltipProps {
  term: string;
  definition?: string;
  category?: string;
  conceptId?: string;
  children?: React.ReactNode;
  className?: string;
}

export function JargonTooltip({
  term,
  definition,
  category,
  conceptId,
  children,
  className,
}: JargonTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const normalized = term.trim().toLowerCase();
  const known = JARGON_GLOSSARY[normalized];

  const displayTerm = known?.term || term;
  const plainText = definition || known?.plainEnglish || `Plain-English definition for ${term}.`;
  const domainCategory = category || known?.category || "Technical Concept";
  const targetConcept = conceptId || known?.conceptId;

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <span
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <span
        ref={triggerRef}
        tabIndex={0}
        role="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onFocus={() => setIsOpen(true)}
        onBlur={(e) => {
          if (!popoverRef.current?.contains(e.relatedTarget as Node)) {
            setIsOpen(false);
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="cursor-help decoration-dotted underline underline-offset-4 decoration-cyan-400/60 hover:decoration-cyan-300 hover:text-cyan-300 transition-colors inline-flex items-center gap-0.5"
      >
        {children || term}
        <HelpCircle size={10} className="inline opacity-60 text-cyan-400 shrink-0 ml-0.5" />
      </span>

      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={`Definition of ${displayTerm}`}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 sm:w-80 p-3.5 rounded-2xl bg-[var(--surface-1)] border border-cyan-500/30 shadow-2xl backdrop-blur-xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[var(--border)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">
              {domainCategory}
            </span>
            <span className="text-[10px] text-[var(--muted-foreground)]">Plain-English Primer</span>
          </div>

          {/* Term & Plain-English explanation */}
          <div className="space-y-1.5">
            <h5 className="text-xs font-bold text-[var(--foreground)]">{displayTerm}</h5>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{plainText}</p>
          </div>

          {/* Deep link to Concept card */}
          <div className="mt-3 pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px]">
            <span className="text-[var(--muted-foreground)]">Need deep architecture?</span>
            <Link
              href={
                targetConcept
                  ? `/concepts?card=${targetConcept}`
                  : `/concepts?term=${encodeURIComponent(displayTerm)}`
              }
              className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <BookOpen size={11} />
              <span>Explore Concept</span>
            </Link>
          </div>

          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2.5 h-2.5 bg-[var(--surface-1)] border-r border-b border-cyan-500/30 rotate-45" />
        </div>
      )}
    </span>
  );
}
