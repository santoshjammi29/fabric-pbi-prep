import React from "react";
import Link from "next/link";
import {
  Layers,
  Database,
  Cpu,
  ShieldCheck,
  Zap,
  ArrowRight,
  GitBranch,
  FileCheck,
  Boxes,
  Compass,
  CheckCircle2,
  ExternalLink,
  BookOpen,
} from "lucide-react";

export function LakehouseArchitectureGuide() {
  return (
    <article
      id="lakehouse-architecture-guide"
      className="mt-12 pt-8 border-t border-[var(--border)] space-y-12"
      itemScope
      itemType="https://schema.org/TechArticle"
    >
      <meta itemProp="headline" content="Lakehouse Architecture: The Definitive Enterprise Reference Blueprint" />
      <meta
        itemProp="description"
        content="A comprehensive architectural guide to modern data lakehouses, medallion architecture, Delta Lake, Apache Iceberg, and decoupled distributed systems."
      />
      <meta itemProp="author" content="Santosh Jammi" />
      <meta itemProp="publisher" content="Lakehouse Architect" />

      {/* ── 1. GUIDE HEADER & EXECUTIVE SUMMARY ────────────────────────── */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs font-semibold text-blue-600 dark:text-blue-400">
          <Layers size={13} className="text-blue-500" />
          <span className="uppercase tracking-wider">Enterprise Architecture Whitepaper &amp; Blueprint</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--foreground)] leading-tight">
          What is a Lakehouse? Modern Lakehouse Architecture Explained
        </h2>

        <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed max-w-4xl">
          A <strong className="text-[var(--foreground)] font-semibold">Data Lakehouse</strong> is a modern data management
          architecture that combines the scalability, flexibility, and cost-efficiency of commodity cloud object storage
          (Data Lakes) with the ACID transaction guarantees, schema enforcement, fine-grained governance, and high-performance
          SQL query capabilities of enterprise Data Warehouses.
        </p>

        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed max-w-4xl">
          Historically, enterprises operated dual-system architectures: unstructured data and telemetry were dumped into raw data lakes
          (e.g., ADLS Gen2, AWS S3), while structured business reporting required fragile, expensive ETL pipelines to copy data into
          proprietary data warehouses (e.g., Snowflake, Teradata, Synapse Dedicated Pools).
          The modern <strong className="text-[var(--foreground)] font-semibold">Lakehouse Architecture</strong> eliminates this redundancy by establishing
          a single source of truth directly on open table formats like <strong className="text-[var(--foreground)] font-semibold">Delta Lake</strong> and{" "}
          <strong className="text-[var(--foreground)] font-semibold">Apache Iceberg</strong>.
        </p>
      </header>

      {/* ── 2. THE 5 CORE LAYERS OF LAKEHOUSE ARCHITECTURE ───────────── */}
      <section className="space-y-6" id="lakehouse-layers">
        <div className="space-y-1">
          <div className="text-xs font-bold text-blue-500 uppercase tracking-wider">System Decomposition</div>
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
            The 5 Core Layers of Modern Lakehouse Architecture
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
            Every production-grade Lakehouse decouples storage, metadata, cataloging, and compute into independent, horizontally scalable tiers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Layer 1 */}
          <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-blue-500/40 transition-all space-y-2.5">
            <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400">
              <Database size={18} />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Layer 1</span>
            </div>
            <h4 className="text-sm font-bold text-[var(--foreground)]">Cloud Object Storage Tier</h4>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Low-cost, highly durable, infinitely scalable object storage acting as the physical substrate. Examples include
              Azure Data Lake Storage (ADLS Gen2), AWS S3, Google Cloud Storage, and Microsoft OneLake.
            </p>
            <div className="pt-1 flex flex-wrap gap-1 text-[11px] font-mono text-[var(--muted-foreground)]">
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)]">OneLake</span>
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)]">ADLS Gen2</span>
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)]">AWS S3</span>
            </div>
          </div>

          {/* Layer 2 */}
          <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-emerald-500/40 transition-all space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400">
              <Boxes size={18} />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Layer 2</span>
            </div>
            <h4 className="text-sm font-bold text-[var(--foreground)]">Open Table Format &amp; ACID Metadata</h4>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Provides transactional integrity (serializable ACID), versioned commit logs, schema enforcement, time travel,
              and file compaction directly over columnar Parquet files.
            </p>
            <div className="pt-1 flex flex-wrap gap-1 text-[11px] font-mono text-[var(--muted-foreground)]">
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)]">Delta Lake 3.x</span>
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)]">Apache Iceberg</span>
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)]">Apache Hudi</span>
            </div>
          </div>

          {/* Layer 3 */}
          <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-purple-500/40 transition-all space-y-2.5">
            <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400">
              <ShieldCheck size={18} />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Layer 3</span>
            </div>
            <h4 className="text-sm font-bold text-[var(--foreground)]">Unified Catalog &amp; Governance</h4>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Single-pane-of-glass metadata management, data lineage, column/row-level security, attribute-based access control (ABAC),
              and cross-cloud data sharing.
            </p>
            <div className="pt-1 flex flex-wrap gap-1 text-[11px] font-mono text-[var(--muted-foreground)]">
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)]">Unity Catalog</span>
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)]">Microsoft Purview</span>
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)]">Apache Polaris</span>
            </div>
          </div>

          {/* Layer 4 */}
          <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-cyan-500/40 transition-all space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-500 dark:text-cyan-400">
              <Cpu size={18} />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Layer 4</span>
            </div>
            <h4 className="text-sm font-bold text-[var(--foreground)]">Distributed Compute Engines</h4>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Decoupled, stateless execution runtimes optimized for batch ETL, micro-batch streaming, ad-hoc SQL, and AI model training
              operating over the same storage without copies.
            </p>
            <div className="pt-1 flex flex-wrap gap-1 text-[11px] font-mono text-[var(--muted-foreground)]">
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)]">Apache Spark 4.0</span>
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)]">Databricks Photon</span>
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)]">Trino / DuckDB</span>
            </div>
          </div>

          {/* Layer 5 */}
          <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-amber-500/40 transition-all space-y-2.5">
            <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400">
              <Zap size={18} />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Layer 5</span>
            </div>
            <h4 className="text-sm font-bold text-[var(--foreground)]">Consumption &amp; Serving Tier</h4>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Zero-copy reporting, Direct Lake semantic models in Power BI, REST endpoints, feature stores for machine learning,
              and sub-second analytical dashboards.
            </p>
            <div className="pt-1 flex flex-wrap gap-1 text-[11px] font-mono text-[var(--muted-foreground)]">
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)]">Power BI Direct Lake</span>
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)]">Delta Sharing</span>
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)]">MLflow</span>
            </div>
          </div>

          {/* Bonus Hub Link */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent border border-blue-500/30 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-blue-500 uppercase tracking-wider">Deep Practice</span>
              <h4 className="text-sm font-bold text-[var(--foreground)]">Test Lakehouse System Design</h4>
              <p className="text-xs text-[var(--muted-foreground)]">
                Dive into 3,206+ production scenarios, whiteboard blueprints, and failure-mode analysis.
              </p>
            </div>
            <Link
              href="/architecture"
              className="inline-flex items-center justify-between px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
            >
              <span>Explore Architecture Hub</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. THE MEDALLION ARCHITECTURE PATTERN ─────────────────────── */}
      <section className="space-y-6" id="medallion-architecture">
        <div className="space-y-1">
          <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Data Quality Lifecycle</div>
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
            The Medallion Architecture: Bronze, Silver &amp; Gold Standard
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-4xl leading-relaxed">
            The <strong className="text-[var(--foreground)] font-semibold">Medallion Architecture</strong> is the canonical data design pattern
            used within Lakehouse systems to systematically improve data quality, structure, and performance as data progresses through three logical tiers:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bronze Card */}
          <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 uppercase">
                Bronze (Raw Landing)
              </div>
              <span className="text-xs font-mono text-[var(--muted-foreground)]">Append-Only</span>
            </div>
            <h4 className="text-sm font-bold text-[var(--foreground)]">Raw Ingestion &amp; Historical Archive</h4>
            <ul className="text-xs text-[var(--muted-foreground)] space-y-1.5 list-disc list-inside">
              <li>Raw, unaltered state preserving complete fidelity of source payloads.</li>
              <li>Supports schema-on-read, JSON/Avro/Kafka streaming, and batch dumps.</li>
              <li>Enables full historical reprocessing and replayability during pipeline failures.</li>
              <li>Includes ingestion metadata: timestamp, source file name, and Kafka offset.</li>
            </ul>
          </div>

          {/* Silver Card */}
          <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-slate-400/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-500/15 text-slate-300 border border-slate-400/30 uppercase">
                Silver (Cleansed &amp; Conformed)
              </div>
              <span className="text-xs font-mono text-[var(--muted-foreground)]">Enriched</span>
            </div>
            <h4 className="text-sm font-bold text-[var(--foreground)]">Cleaned, Deduplicated &amp; Standardized</h4>
            <ul className="text-xs text-[var(--muted-foreground)] space-y-1.5 list-disc list-inside">
              <li>Deduplication, primary key validation, and schema enforcement applied.</li>
              <li>Standardized column naming conventions and canonical ISO date/time types.</li>
              <li>Slowly Changing Dimensions (SCD Type 1 &amp; Type 2) tracking historical changes.</li>
              <li>Serves ad-hoc self-service exploratory analysis and feature engineering.</li>
            </ul>
          </div>

          {/* Gold Card */}
          <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-yellow-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="px-2 py-0.5 rounded text-[11px] font-bold bg-yellow-500/15 text-yellow-500 dark:text-yellow-400 border border-yellow-500/30 uppercase">
                Gold (Curated Business Marts)
              </div>
              <span className="text-xs font-mono text-[var(--muted-foreground)]">Star Schema</span>
            </div>
            <h4 className="text-sm font-bold text-[var(--foreground)]">Dimensional Models &amp; High-Speed BI</h4>
            <ul className="text-xs text-[var(--muted-foreground)] space-y-1.5 list-disc list-inside">
              <li>Kimball star schema architecture: Fact and Conformed Dimension tables.</li>
              <li>Pre-aggregated metrics, business KPIs, and low-latency reporting models.</li>
              <li>Optimized with Liquid Clustering or Z-Ordering on primary filter predicates.</li>
              <li>Power BI Direct Lake mode connects directly to Gold Delta tables in OneLake.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 4. ARCHITECTURAL COMPARISON MATRIX ────────────────────────── */}
      <section className="space-y-4" id="lakehouse-vs-data-warehouse">
        <div className="space-y-1">
          <div className="text-xs font-bold text-purple-500 uppercase tracking-wider">Evaluation &amp; Trade-offs</div>
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
            Lakehouse vs Data Warehouse vs Data Lake: Comparison Matrix
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-4xl">
            Understand key trade-offs between traditional storage paradigms and modern Lakehouse implementations:
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-2)] text-[var(--foreground)] font-semibold border-b border-[var(--border)]">
              <tr>
                <th className="p-3">Architectural Dimension</th>
                <th className="p-3">Traditional Data Lake</th>
                <th className="p-3">Enterprise Data Warehouse</th>
                <th className="p-3 text-blue-500 dark:text-blue-400 font-bold">Modern Data Lakehouse</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--muted-foreground)]">
              <tr className="hover:bg-[var(--surface-1)]">
                <td className="p-3 font-medium text-[var(--foreground)]">Storage &amp; Compute Coupling</td>
                <td className="p-3">Decoupled (Raw Files)</td>
                <td className="p-3">Coupled or Proprietary Managed</td>
                <td className="p-3 text-[var(--foreground)] font-medium">100% Decoupled (Open Object Storage)</td>
              </tr>
              <tr className="hover:bg-[var(--surface-1)]">
                <td className="p-3 font-medium text-[var(--foreground)]">ACID Transaction Support</td>
                <td className="p-3 text-rose-500">None (Prone to dirty reads)</td>
                <td className="p-3 text-emerald-500">Full ACID (Proprietary)</td>
                <td className="p-3 text-emerald-500 font-medium">Full ACID (via Delta Log / Iceberg Metadata)</td>
              </tr>
              <tr className="hover:bg-[var(--surface-1)]">
                <td className="p-3 font-medium text-[var(--foreground)]">File &amp; Storage Format</td>
                <td className="p-3">Open (CSV, JSON, Parquet)</td>
                <td className="p-3 text-rose-500">Proprietary Columnar Blocks</td>
                <td className="p-3 text-[var(--foreground)] font-medium">Open Apache Parquet + ACID Logs</td>
              </tr>
              <tr className="hover:bg-[var(--surface-1)]">
                <td className="p-3 font-medium text-[var(--foreground)]">AI, ML &amp; Streaming Support</td>
                <td className="p-3 text-emerald-500">High (Native Python/Spark)</td>
                <td className="p-3 text-amber-500">Limited (Requires ETL exports)</td>
                <td className="p-3 text-emerald-500 font-medium">First-Class (Direct PyTorch/Spark/Python access)</td>
              </tr>
              <tr className="hover:bg-[var(--surface-1)]">
                <td className="p-3 font-medium text-[var(--foreground)]">Time Travel &amp; Rollbacks</td>
                <td className="p-3 text-rose-500">Manual (Object versioning)</td>
                <td className="p-3 text-emerald-500">Available (Proprietary retention)</td>
                <td className="p-3 text-emerald-500 font-medium">Standard (SELECT * FROM table TIMESTAMP AS OF)</td>
              </tr>
              <tr className="hover:bg-[var(--surface-1)]">
                <td className="p-3 font-medium text-[var(--foreground)]">Vendor Lock-In Risk</td>
                <td className="p-3 text-emerald-500">Very Low</td>
                <td className="p-3 text-rose-500">Extremely High</td>
                <td className="p-3 text-emerald-500 font-medium">Zero (Open formats readable by any engine)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 5. ADVANCED LAKEHOUSE OPTIMIZATIONS ───────────────────────── */}
      <section className="space-y-6" id="lakehouse-optimizations">
        <div className="space-y-1">
          <div className="text-xs font-bold text-cyan-500 uppercase tracking-wider">Performance Engineering</div>
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
            Key Optimization Techniques Every Lakehouse Architect Must Master
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
            Essential storage engine and query tuning primitives to achieve sub-second execution at petabyte scale:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2">
            <h4 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <FileCheck size={16} className="text-blue-500" />
              <span>Small File Problem &amp; Compaction (OPTIMIZE)</span>
            </h4>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Streaming pipelines generate thousands of tiny Parquet files (&lt;10MB), causing metadata explosion and slow directory listings.
              Lakehouses run periodic bin-packing compaction (e.g. <code className="text-xs font-mono bg-[var(--surface-2)] px-1 rounded">OPTIMIZE table</code>)
              to coalesce files into optimal 128MB–1GB chunks, dramatically reducing IO overhead.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2">
            <h4 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <GitBranch size={16} className="text-emerald-500" />
              <span>Liquid Clustering &amp; Multi-Dimensional Z-Ordering</span>
            </h4>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Replaces rigid directory-based partitioning (which suffers from partition skew and over-partitioning).
              Liquid Clustering dynamically clusters data along multiple columns without rewriting unaffected files, enabling
              extreme file pruning and data skipping on high-cardinality filters.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2">
            <h4 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <ShieldCheck size={16} className="text-purple-500" />
              <span>Data Governance &amp; Centralized Catalogs</span>
            </h4>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Decoupled architectures require centralized governance. Tools like <strong className="text-[var(--foreground)] font-semibold">Databricks Unity Catalog</strong> and{" "}
              <strong className="text-[var(--foreground)] font-semibold">Microsoft Purview / OneLake</strong> enforce unified permissions, row filters, column masking,
              and end-to-end lineage across all compute engines accessing the storage layer.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2">
            <h4 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              <span>Direct Lake Zero-Copy BI Serving</span>
            </h4>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Microsoft Fabric introduced Direct Lake mode for Power BI, which reads Delta Parquet files directly from OneLake storage
              into the VertiPaq in-memory analytics engine without importing or duplicating data, combining the scale of DirectQuery
              with the blazing speed of Import mode.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. DIRECT HUB NAVIGATION (INTERNAL SEO LINK WHEEL) ─────────── */}
      <footer className="pt-6 border-t border-[var(--border)]/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Explore the Lakehouse Architect Platform</h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Accelerate your architectural mastery with our interactive drill engines and curriculum hubs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <Link
            href="/architecture"
            className="p-3 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1 block transition-all"
          >
            <div className="font-bold text-[var(--foreground)]">Architecture Hub</div>
            <div className="text-[11px] text-[var(--muted-foreground)]">3,206+ System Scenarios</div>
          </Link>
          <Link
            href="/concepts"
            className="p-3 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1 block transition-all"
          >
            <div className="font-bold text-[var(--foreground)]">Concepts Glossary</div>
            <div className="text-[11px] text-[var(--muted-foreground)]">660+ Lakehouse Terms</div>
          </Link>
          <Link
            href="/spark-engine"
            className="p-3 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1 block transition-all"
          >
            <div className="font-bold text-[var(--foreground)]">Spark Engine Lab</div>
            <div className="text-[11px] text-[var(--muted-foreground)]">Tungsten &amp; Physical Plans</div>
          </Link>
          <Link
            href="/qa-prep"
            className="p-3 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1 block transition-all"
          >
            <div className="font-bold text-[var(--foreground)]">QA Prep Portal</div>
            <div className="text-[11px] text-[var(--muted-foreground)]">7,080+ Interview Drills</div>
          </Link>
          <Link
            href="/mindmap"
            className="p-3 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1 block transition-all"
          >
            <div className="font-bold text-[var(--foreground)]">Architecture Mindmap</div>
            <div className="text-[11px] text-[var(--muted-foreground)]">Interactive Visual Hierarchy</div>
          </Link>
          <Link
            href="/cheat-sheet"
            className="p-3 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1 block transition-all"
          >
            <div className="font-bold text-[var(--foreground)]">Incident Cheat Sheet</div>
            <div className="text-[11px] text-[var(--muted-foreground)]">Outage Codes &amp; Runbooks</div>
          </Link>
        </div>
      </footer>
    </article>
  );
}
