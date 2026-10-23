#!/usr/bin/env python3
"""
Databricks Architecture & Coding Cheat Sheets Generator - Ultra High-Density 12-Card Edition
Reworked Layout: Zero unused blank space, uniform card density, comprehensive code breakdown & mechanics below every code block.
Generates print-ready multi-page PDFs and 250-DPI PNG images
for Spark SQL, PySpark, Spark Core & Architecture, and Python in Databricks.

Author: Santosh Jammi | Principal Data Architect
"""

import os
import sys
import subprocess
import fitz  # PyMuPDF
from PIL import Image

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(SCRIPT_DIR)
OUTPUT_DIR = os.path.join(WORKSPACE_DIR, "public", "cheatsheets")
HTML_DIR = os.path.join(OUTPUT_DIR, "html")
PDF_DIR = os.path.join(OUTPUT_DIR, "pdf")
IMG_DIR = os.path.join(OUTPUT_DIR, "images")

os.makedirs(HTML_DIR, exist_ok=True)
os.makedirs(PDF_DIR, exist_ok=True)
os.makedirs(IMG_DIR, exist_ok=True)

def find_chrome():
    candidates = [
        os.environ.get("CHROME_BIN"),
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
    ]
    for c in candidates:
        if c and os.path.exists(c):
            return c
    return "google-chrome"

CHROME_BIN = find_chrome()

def get_base_css(theme_color="#ff3621", title_color="#38bdf8"):
    return f"""
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

@page {{
  size: A4 portrait;
  margin: 0;
}}

* {{
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}}

body {{
  background: #080c15;
  color: #e2e8f0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 7.2px;
  line-height: 1.28;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}}

.page {{
  width: 210mm;
  height: 297mm;
  max-height: 297mm;
  padding: 5mm 6.5mm 4.5mm 6.5mm;
  background: #080c15;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  page-break-after: always;
  overflow: hidden;
  position: relative;
}}

/* Page Header */
.header-bar {{
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid {theme_color};
  padding-bottom: 3.5px;
  margin-bottom: 4px;
}}

.header-left {{
  display: flex;
  align-items: center;
  gap: 7px;
}}

.header-title-box h1 {{
  font-size: 13.5px;
  font-weight: 800;
  letter-spacing: -0.3px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 5px;
}}

.header-title-box p {{
  font-size: 7.5px;
  color: #94a3b8;
  font-weight: 500;
}}

.header-badges {{
  display: flex;
  align-items: center;
  gap: 4px;
}}

.badge {{
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 6.8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}}

.badge-primary {{ background: {theme_color}; color: #ffffff; }}
.badge-secondary {{ background: #1e293b; color: #38bdf8; border: 1px solid #334155; }}
.badge-dark {{ background: #0f172a; color: #a5b4fc; border: 1px solid #1e293b; }}
.badge-accent {{ background: #10b981; color: #042f2e; }}

/* Grid Layout: 3 Rows of 2 Cards */
.content-grid {{
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(3, 1fr);
  gap: 5px;
  margin-bottom: 3px;
}}

.card {{
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 5px;
  padding: 4.5px 6.5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  height: 100%;
}}

.card-header {{
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #1e293b;
  padding-bottom: 2.5px;
  margin-bottom: 1px;
}}

.card-title {{
  font-size: 8.8px;
  font-weight: 700;
  color: {title_color};
  display: flex;
  align-items: center;
  gap: 4px;
}}

.card-tag {{
  font-size: 6.4px;
  background: #1e293b;
  color: #94a3b8;
  padding: 1.5px 4px;
  border-radius: 2px;
  font-weight: 600;
}}

/* Code Blocks */
pre.code {{
  background: #040711;
  border: 1px solid #141e33;
  border-radius: 3px;
  padding: 3px 5px;
  font-family: 'JetBrains Mono', Menlo, Monaco, Consolas, monospace;
  font-size: 6.6px;
  line-height: 1.24;
  color: #e2e8f0;
  overflow: hidden;
  white-space: pre-wrap;
  word-break: break-all;
}}

/* Syntax Highlighting */
.kw {{ color: #f43f5e; font-weight: 600; }}    /* keywords */
.fn {{ color: #38bdf8; font-weight: 600; }}    /* functions */
.str {{ color: #4ade80; }}                     /* strings */
.cm {{ color: #64748b; font-style: italic; }}  /* comments */
.num {{ color: #fb923c; }}                     /* numbers */
.cls {{ color: #fbbf24; font-weight: 600; }}   /* classes/types */
.var {{ color: #a78bfa; }}                     /* variables */
.typ {{ color: #facc15; }}                     /* SQL types */

/* Code Explanation Section (Below Every Code Block) */
.code-explain {{
  background: rgba(4, 7, 17, 0.75);
  border: 1px solid #1a253c;
  border-left: 2px solid {theme_color};
  border-radius: 3px;
  padding: 3px 5px;
  font-size: 6.5px;
  line-height: 1.25;
  color: #cbd5e1;
}}

.explain-head {{
  font-size: 6.2px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 3px;
}}

.explain-list {{
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.8px;
}}

.explain-list li {{
  position: relative;
  padding-left: 7px;
  font-size: 6.4px;
  line-height: 1.24;
  color: #cbd5e1;
}}

.explain-list li::before {{
  content: "›";
  position: absolute;
  left: 0;
  color: {theme_color};
  font-weight: bold;
  font-size: 7.5px;
}}

.explain-list li b {{
  color: #f8fafc;
}}

.explain-list li code {{
  font-family: 'JetBrains Mono', monospace;
  color: #38bdf8;
  font-size: 6.1px;
  background: #141e33;
  padding: 0.5px 2px;
  border-radius: 2px;
}}

/* Callout Alert Boxes */
.alert {{
  padding: 2.5px 4.5px;
  border-radius: 3px;
  font-size: 6.5px;
  display: flex;
  align-items: flex-start;
  gap: 3.5px;
  line-height: 1.2;
}}

.alert-tip {{
  background: rgba(14, 165, 233, 0.08);
  border-left: 2px solid #0ea5e9;
  color: #bae6fd;
}}

.alert-perf {{
  background: rgba(16, 185, 129, 0.08);
  border-left: 2px solid #10b981;
  color: #a7f3d0;
}}

.alert-warn {{
  background: rgba(245, 158, 11, 0.08);
  border-left: 2px solid #f59e0b;
  color: #fde68a;
}}

.alert-sec {{
  background: rgba(168, 85, 247, 0.08);
  border-left: 2px solid #a855f7;
  color: #e9d5ff;
}}

/* Footer */
.page-footer {{
  border-top: 1px solid #1e293b;
  padding-top: 2.5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 6.8px;
  color: #64748b;
}}

.page-footer-left {{
  display: flex;
  align-items: center;
  gap: 6px;
}}

.page-footer-right {{
  font-weight: 600;
  color: #94a3b8;
}}
"""

# ==============================================================================
# 1. SPARK SQL TEMPLATE (12 CARDS)
# ==============================================================================
SPARKSQL_BODY = """
  <!-- PAGE 1 -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="header-title-box">
          <h1>⚡ DATABRICKS SPARK SQL CHEAT SHEET</h1>
          <p>Production Reference: DDL, DML, Liquid Clustering, Delta Lake ACID & Medallion Patterns</p>
        </div>
      </div>
      <div class="header-badges">
        <span class="badge badge-primary">Spark SQL</span>
        <span class="badge badge-secondary">DBR 15.4+ LTS</span>
        <span class="badge badge-dark">Photon Engine</span>
        <span class="badge badge-accent">Unity Catalog</span>
      </div>
    </div>

    <div class="content-grid">
      <!-- Card 1: Unity Catalog Namespace & DDL -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🏛️ Unity Catalog 3-Level Namespace & DDL</span>
          <span class="card-tag">Governance</span>
        </div>
        <pre class="code"><span class="cm">-- 3-Level Hierarchy: catalog.schema.table</span>
<span class="kw">CREATE CATALOG IF NOT EXISTS</span> prod_lakehouse;
<span class="kw">CREATE SCHEMA IF NOT EXISTS</span> prod_lakehouse.silver_finance
  <span class="kw">MANAGED LOCATION</span> <span class="str">'abfss://silver@storage.dfs.core.windows.net/'</span>;
<span class="kw">USE CATALOG</span> prod_lakehouse; <span class="kw">USE SCHEMA</span> silver_finance;

<span class="cm">-- Liquid Clustering (Modern replacement for PARTITION BY)</span>
<span class="kw">CREATE TABLE</span> transactions (
  txn_id <span class="typ">BIGINT GENERATED ALWAYS AS IDENTITY</span>,
  customer_id <span class="typ">STRING</span>,
  amount <span class="typ">DECIMAL(18,2)</span>,
  txn_date <span class="typ">DATE</span>
) <span class="kw">USING DELTA CLUSTER BY</span> (txn_date, customer_id);

<span class="cm">-- Clones: Zero-copy pointer vs physical backup</span>
<span class="kw">CREATE TABLE</span> dev_txns <span class="kw">SHALLOW CLONE</span> transactions;
<span class="kw">CREATE TABLE</span> dr_backup <span class="kw">DEEP CLONE</span> transactions;</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Liquid Clustering:</b> <code>CLUSTER BY (txn_date, customer_id)</code> groups data dynamically without rigid Hive directory trees, completely eliminating file fragmentation and partition skew.</li>
            <li><b>Identity Sequences:</b> <code>BIGINT GENERATED ALWAYS AS IDENTITY</code> guarantees gapless monotonically increasing primary keys coordinated by the Delta ACID commit log.</li>
            <li><b>Managed Storage:</b> <code>MANAGED LOCATION</code> grants Unity Catalog full lifecycle control over underlying ADLS Gen2 blob files; table drop purges storage automatically.</li>
            <li><b>Zero-Copy Clone:</b> <code>SHALLOW CLONE</code> creates an instantaneous metadata-only pointer to Parquet data for dev/QA with 0 storage duplication; <code>DEEP CLONE</code> copies all physical bytes for DR.</li>
          </ul>
        </div>
        <div class="alert alert-tip">
          💡 <b>Architecture Rule:</b> Liquid clustering replaces Z-Order and static partitions. Cluster keys can be evolved at runtime without costly data restructurings.
        </div>
      </div>

      <!-- Card 2: Delta Lake Core DML & ACID Upsert -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔄 Delta Lake ACID Upsert (MERGE INTO)</span>
          <span class="card-tag">DML / Medallion</span>
        </div>
        <pre class="code"><span class="kw">MERGE INTO</span> silver.customers <span class="kw">AS</span> target
<span class="kw">USING</span> bronze.stg_customers <span class="kw">AS</span> source
<span class="kw">ON</span> target.customer_id = source.customer_id
<span class="kw">WHEN MATCHED AND</span> source.is_deleted = <span class="kw">true THEN</span>
  <span class="kw">DELETE</span>
<span class="kw">WHEN MATCHED AND</span> target.hash_diff != source.hash_diff <span class="kw">THEN</span>
  <span class="kw">UPDATE SET</span>
    target.email = source.email,
    target.status = source.status,
    target.updated_at = <span class="fn">current_timestamp</span>()
<span class="kw">WHEN NOT MATCHED THEN</span>
  <span class="kw">INSERT</span> (customer_id, email, status, created_at, updated_at)
  <span class="kw">VALUES</span> (source.customer_id, source.email, source.status,
          <span class="fn">current_timestamp</span>(), <span class="fn">current_timestamp</span>())
<span class="kw">WHEN NOT MATCHED BY SOURCE AND</span> target.status = <span class="str">'ACTIVE'</span> <span class="kw">THEN</span>
  <span class="kw">UPDATE SET</span> target.status = <span class="str">'INACTIVE'</span>;</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Match Predicate:</b> <code>ON target.customer_id = source.customer_id</code> uses Delta min/max file statistics to prune non-matching Parquet files prior to shuffle join.</li>
            <li><b>Delta Change Detection:</b> <code>target.hash_diff != source.hash_diff</code> prevents rewriting unchanged records, minimizing write amplification and storage I/O.</li>
            <li><b>Soft Deletes:</b> <code>WHEN NOT MATCHED BY SOURCE</code> handles orphan target records in a single ACID commit, deprecating inactive rows without separate sweeps.</li>
            <li><b>ACID Commit:</b> Writes new Parquet files with updated records and atomically logs file removals in the Delta transaction log <code>_delta_log/</code>.</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          ⚡ <b>Performance:</b> Always cluster or Z-Order target tables by the MERGE join key to activate Dynamic File Pruning (DFP).
        </div>
      </div>

      <!-- Card 3: Table Optimization & Maintenance -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🛠️ Compaction, Z-Order & Vacuum</span>
          <span class="card-tag">FinOps / Performance</span>
        </div>
        <pre class="code"><span class="cm">-- Compact small files into ~1GB Parquet target files</span>
<span class="kw">OPTIMIZE</span> silver.transactions;

<span class="cm">-- Multidimensional Space-Filling Z-Order (Legacy/Static tables)</span>
<span class="kw">OPTIMIZE</span> silver.transactions <span class="kw">ZORDER BY</span> (customer_id, txn_date);

<span class="cm">-- Purge unreferenced historical parquet files older than 7 days</span>
<span class="kw">VACUUM</span> silver.transactions <span class="kw">RETAIN</span> <span class="num">168</span> <span class="kw">HOURS</span>;

<span class="cm">-- Collect CBO statistics for adaptive join planning</span>
<span class="kw">ANALYZE TABLE</span> silver.transactions <span class="kw">COMPUTE STATISTICS FOR ALL COLUMNS</span>;</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>OPTIMIZE:</b> Bin-packs fragmented small files generated by streaming or concurrent writes into uniform ~1GB files, slashing cloud storage API read costs.</li>
            <li><b>Z-ORDER BY:</b> Interleaves high-cardinality column bits using Hilbert curves, enabling massive file skipping during query predicate evaluation.</li>
            <li><b>VACUUM RETAIN 168 HOURS:</b> Deletes orphaned physical Parquet files committed before the retention window, reclaiming storage without breaking concurrent queries.</li>
            <li><b>ANALYZE TABLE:</b> Computes column cardinalities, null counts, and size metrics for Catalyst Cost-Based Optimization (CBO) and join reordering.</li>
          </ul>
        </div>
        <div class="alert alert-warn">
          ⚠️ <b>Vacuum Caution:</b> Never set retention &lt; 168 hours in production. Vacuuming 0 hours breaks concurrent active readers and invalidates time travel.
        </div>
      </div>

      <!-- Card 4: Delta Time Travel & Audit History -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⏳ Delta Time Travel, Audit & Instant Rollback</span>
          <span class="card-tag">Resilience</span>
        </div>
        <pre class="code"><span class="cm">-- Query historical snapshot by version integer</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> silver.transactions <span class="kw">VERSION AS OF</span> <span class="num">14</span>;

<span class="cm">-- Query snapshot by UTC timestamp string</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> silver.transactions
<span class="kw">TIMESTAMP AS OF</span> <span class="str">'2026-10-15 08:30:00'</span>;

<span class="cm">-- Instant point-in-time recovery (Disaster Rollback)</span>
<span class="kw">RESTORE TABLE</span> silver.transactions <span class="kw">TO VERSION AS OF</span> <span class="num">13</span>;

<span class="cm">-- Inspect full commit history & user audit trail</span>
<span class="kw">DESCRIBE HISTORY</span> silver.transactions <span class="kw">LIMIT</span> <span class="num">10</span>;</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>VERSION / TIMESTAMP AS OF:</b> Instructs the Delta reader to evaluate transaction log commit entries backward to the exact transaction ID requested.</li>
            <li><b>RESTORE TABLE:</b> Executes instantaneous metadata rollback in under 1 second by creating a new forward commit pointing to prior file manifests.</li>
            <li><b>DESCRIBE HISTORY:</b> Exposes granular operational telemetry including user identities, cluster IDs, job triggers, isolation levels, and write metrics.</li>
            <li><b>Storage Safety:</b> Historical snapshots read preserved older Parquet files directly; no physical backups need to be unpacked or downloaded.</li>
          </ul>
        </div>
        <div class="alert alert-sec">
          🔒 <b>Auditability:</b> Delta time travel is guaranteed up to the VACUUM retention threshold. Use for reproducibility in regulatory reporting.
        </div>
      </div>

      <!-- Card 5: Common Table Expressions & Set Operations -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔗 Chained CTEs, Window Slicing & Set Operations</span>
          <span class="card-tag">Core SQL</span>
        </div>
        <pre class="code"><span class="kw">WITH</span> raw_txns <span class="kw">AS</span> (
  <span class="kw">SELECT</span> customer_id, region, amount,
         <span class="fn">DENSE_RANK</span>() <span class="kw">OVER</span>(<span class="kw">PARTITION BY</span> region <span class="kw">ORDER BY</span> amount <span class="kw">DESC</span>) <span class="kw">AS</span> rk
  <span class="kw">FROM</span> silver.transactions <span class="kw">WHERE</span> txn_date &gt;= <span class="fn">current_date</span>() - <span class="num">30</span>
),
top_spenders <span class="kw">AS</span> (
  <span class="kw">SELECT</span> customer_id, region, amount <span class="kw">FROM</span> raw_txns <span class="kw">WHERE</span> rk &lt;= <span class="num">10</span>
)
<span class="kw">SELECT</span> * <span class="kw">FROM</span> top_spenders
<span class="kw">UNION ALL</span>
<span class="kw">SELECT</span> customer_id, region, amount <span class="kw">FROM</span> silver.manual_overrides
<span class="kw">EXCEPT DISTINCT</span>
<span class="kw">SELECT</span> customer_id, region, amount <span class="kw">FROM</span> silver.fraud_blacklist;</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Chained CTEs:</b> Modularizes complex analytical subqueries; Catalyst inlines CTE expressions into an unified execution plan without materialization.</li>
            <li><b>DENSE_RANK():</b> Assigns consecutive rank integers across partition boundaries without gaps, ideal for top-N ranking per region.</li>
            <li><b>UNION ALL:</b> Appends datasets without triggering an expensive distributed shuffle deduplication stage.</li>
            <li><b>EXCEPT DISTINCT:</b> Computes set difference by executing a left anti-join under the hood, purging fraudulent IDs efficiently.</li>
          </ul>
        </div>
        <div class="alert alert-tip">
          💡 <b>Catalyst Optimization:</b> Predicates applied after CTE definitions (e.g. <code>rk &lt;= 10</code>) are automatically pushed down to limit window processing.
        </div>
      </div>

      <!-- Card 6: Medallion Pipeline & QUALIFY Deduplication -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🥇 Medallion SQL & QUALIFY Deduplication</span>
          <span class="card-tag">Architecture</span>
        </div>
        <pre class="code"><span class="cm">-- Silver Cleanse: QUALIFY filter eliminates nested subqueries!</span>
<span class="kw">CREATE OR REPLACE TABLE</span> silver.orders_cleansed <span class="kw">AS</span>
<span class="kw">SELECT</span>
  order_id, customer_id, amount,
  <span class="fn">CAST</span>(order_date <span class="kw">AS DATE</span>) <span class="kw">AS</span> order_date,
  _metadata.file_modification_time <span class="kw">AS</span> ingested_at
<span class="kw">FROM</span> bronze.orders_raw
<span class="kw">WHERE</span> amount &gt; <span class="num">0</span> <span class="kw">AND</span> order_id <span class="kw">IS NOT NULL</span>
<span class="kw">QUALIFY ROW_NUMBER</span>() <span class="kw">OVER</span>(
  <span class="kw">PARTITION BY</span> order_id <span class="kw">ORDER BY</span> ingested_at <span class="kw">DESC</span>
) = <span class="num">1</span>;

<span class="cm">-- Gold Aggregation: Pre-computed dimension metrics</span>
<span class="kw">CREATE OR REPLACE TABLE</span> gold.customer_metrics <span class="kw">AS</span>
<span class="kw">SELECT</span> customer_id, <span class="fn">COUNT</span>(*) <span class="kw">AS</span> orders, <span class="fn">SUM</span>(amount) <span class="kw">AS</span> ltv
<span class="kw">FROM</span> silver.orders_cleansed <span class="kw">GROUP BY</span> customer_id;</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>QUALIFY Clause:</b> Filters windowed calculations directly in the projection, replacing convoluted <code>SELECT * FROM (SELECT ..., ROW_NUMBER() ...) WHERE rn=1</code> subqueries.</li>
            <li><b>Metadata Columns:</b> <code>_metadata.file_modification_time</code> retrieves file write timestamps directly from cloud storage headers without schema overhead.</li>
            <li><b>Idempotent Deduplication:</b> Partitions by business key and orders by timestamp, ensuring late-arriving updates overwrite older state deterministically.</li>
            <li><b>Gold Aggregation:</b> Pre-aggregates high-cardinality metrics for low-latency BI dashboards and Power BI Direct Lake consumption.</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          ⚡ <b>Engine Performance:</b> QUALIFY enables Catalyst to execute top-1 window pruning during physical execution, reducing shuffle data transfer by up to 90%.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="page-footer-left">
        <span>Santosh Jammi | Principal Data Architect</span>
        <span>•</span>
        <span>Databricks Lakehouse Cheat Sheet Series</span>
      </div>
      <div class="page-footer-right">Page 1 of 2 — DDL, DML & Maintenance</div>
    </div>
  </div>

  <!-- PAGE 2 -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="header-title-box">
          <h1>⚡ DATABRICKS SPARK SQL CHEAT SHEET</h1>
          <p>Analytical SQL, Complex Types, Higher-Order Functions, Pivot & Engine Tuning</p>
        </div>
      </div>
      <div class="header-badges">
        <span class="badge badge-primary">Advanced SQL</span>
        <span class="badge badge-secondary">Analytical Functions</span>
        <span class="badge badge-dark">Row Filters / Masks</span>
      </div>
    </div>

    <div class="content-grid">
      <!-- Card 7: Window Functions & Analytical SQL -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📊 Window Functions & Analytical Framing</span>
          <span class="card-tag">Analytics</span>
        </div>
        <pre class="code"><span class="kw">SELECT</span> customer_id, txn_date, amount,
  <span class="cm">-- Ranking: Row_Number (unique), Dense_Rank (no gaps)</span>
  <span class="fn">ROW_NUMBER</span>() <span class="kw">OVER</span>(w_acct <span class="kw">ORDER BY</span> txn_date <span class="kw">DESC</span>) <span class="kw">AS</span> rn,
  <span class="fn">DENSE_RANK</span>() <span class="kw">OVER</span>(w_acct <span class="kw">ORDER BY</span> amount <span class="kw">DESC</span>) <span class="kw">AS</span> rk,
  <span class="cm">-- Offsets: Prior & Next transaction amount</span>
  <span class="fn">LAG</span>(amount, <span class="num">1</span>, <span class="num">0.0</span>) <span class="kw">OVER</span>(w_acct <span class="kw">ORDER BY</span> txn_date) <span class="kw">AS</span> prev_amt,
  <span class="fn">LEAD</span>(amount, <span class="num">1</span>, <span class="num">0.0</span>) <span class="kw">OVER</span>(w_acct <span class="kw">ORDER BY</span> txn_date) <span class="kw">AS</span> next_amt,
  <span class="cm">-- Moving 7-Day Rolling Average (Physical rows)</span>
  <span class="fn">AVG</span>(amount) <span class="kw">OVER</span>(w_acct <span class="kw">ORDER BY</span> txn_date
    <span class="kw">ROWS BETWEEN</span> <span class="num">6</span> <span class="kw">PRECEDING AND CURRENT ROW</span>) <span class="kw">AS</span> roll_7d_avg,
  <span class="cm">-- Cumulative Year-to-Date Sum (Range)</span>
  <span class="fn">SUM</span>(amount) <span class="kw">OVER</span>(w_acct <span class="kw">ORDER BY</span> txn_date
    <span class="kw">RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</span>) <span class="kw">AS</span> ytd_sum
<span class="kw">FROM</span> silver.transactions
<span class="kw">WINDOW</span> w_acct <span class="kw">AS</span> (<span class="kw">PARTITION BY</span> customer_id);</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Named Window:</b> <code>WINDOW w_acct AS (...)</code> defines reusable window specifications across multiple expressions, eliminating redundant partition declarations.</li>
            <li><b>LAG / LEAD:</b> Offsets row values in constant time without self-joins; default fallback value handles edge null conditions gracefully.</li>
            <li><b>ROWS vs RANGE:</b> <code>ROWS BETWEEN</code> operates on physical row offsets; <code>RANGE BETWEEN</code> operates on logical value boundaries (e.g. timestamps/dates).</li>
            <li><b>Execution Plan:</b> Windowing routes through a single <code>WindowExec</code> physical operator; sorting occurs locally within partition boundaries.</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          ⚡ <b>Pro Tip:</b> If source data is clustered/sorted by the window partition key, Catalyst executes windowing without any network shuffle!
        </div>
      </div>

      <!-- Card 8: Complex Types & Semi-Structured Data -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🧩 Complex Types: Structs, Arrays & Maps</span>
          <span class="card-tag">Semi-Structured</span>
        </div>
        <pre class="code"><span class="cm">-- Struct navigation, Array slicing, Map lookup</span>
<span class="kw">SELECT</span>
  payload.user.id <span class="kw">AS</span> user_id,             <span class="cm">-- struct field</span>
  payload.tags[<span class="num">0</span>] <span class="kw">AS</span> primary_tag,          <span class="cm">-- array 0-index</span>
  payload.attributes[<span class="str">'tier'</span>] <span class="kw">AS</span> tier,     <span class="cm">-- map lookup</span>
  <span class="cm">-- Parse raw JSON string into typed Struct</span>
  <span class="fn">from_json</span>(raw_payload, <span class="str">'id BIGINT, name STRING, items ARRAY&lt;STRING&gt;'</span>) <span class="kw">AS</span> parsed,
  <span class="cm">-- Convert Struct into JSON string</span>
  <span class="fn">to_json</span>(<span class="fn">named_struct</span>(<span class="str">'ts'</span>, <span class="fn">current_timestamp</span>(), <span class="str">'code'</span>, <span class="num">200</span>)) <span class="kw">AS</span> json_str
<span class="kw">FROM</span> bronze.events;

<span class="cm">-- Explode Array into relational rows</span>
<span class="kw">SELECT</span> order_id, item.sku, item.qty, item.unit_price
<span class="kw">FROM</span> silver.orders
<span class="kw">LATERAL VIEW EXPLODE</span>(line_items) lv <span class="kw">AS</span> item;</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Struct & Map Navigation:</b> Dot syntax (<code>payload.user.id</code>) and bracket notation (<code>attributes['tier']</code>) access nested schema attributes with zero JSON parsing overhead.</li>
            <li><b>from_json():</b> Parses stringified JSON into strongly-typed Catalyst native representations in C++ Photon; enables column pruning on individual fields.</li>
            <li><b>named_struct() & to_json():</b> Dynamically generates composite structs and encodes them to compressed JSON payloads for egress streaming.</li>
            <li><b>LATERAL VIEW EXPLODE:</b> Unrolls multi-valued array elements into multiple relational rows; use <code>EXPLODE_OUTER</code> to retain rows with null or empty arrays.</li>
          </ul>
        </div>
        <div class="alert alert-tip">
          💡 <b>Storage Recommendation:</b> Store semi-structured payloads as native Parquet STRUCTs to achieve column pruning and 10x faster query scans.
        </div>
      </div>

      <!-- Card 9: Higher-Order Functions (Vectorized) -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⚡ Higher-Order Functions (In-Engine Array Ops)</span>
          <span class="card-tag">Photon Vectorized</span>
        </div>
        <pre class="code"><span class="kw">SELECT</span> order_id,
  <span class="cm">-- TRANSFORM: Map elements without exploding!</span>
  <span class="fn">TRANSFORM</span>(line_items, x -&gt;
    <span class="fn">named_struct</span>(<span class="str">'sku'</span>, x.sku, <span class="str">'gross'</span>, <span class="fn">ROUND</span>(x.price * <span class="num">1.20</span>, <span class="num">2</span>))
  ) <span class="kw">AS</span> taxed_items,

  <span class="cm">-- FILTER: Retain only elements matching condition</span>
  <span class="fn">FILTER</span>(line_items, x -&gt; x.price &gt; <span class="num">100.0</span>) <span class="kw">AS</span> luxury_items,

  <span class="cm">-- EXISTS: Returns true if any element satisfies predicate</span>
  <span class="fn">EXISTS</span>(line_items, x -&gt; x.sku <span class="kw">LIKE</span> <span class="str">'PROMO-%'</span>) <span class="kw">AS</span> has_promo,

  <span class="cm">-- AGGREGATE: Reduce array to scalar sum</span>
  <span class="fn">AGGREGATE</span>(line_items, <span class="num">0.0</span>, (acc, x) -&gt; acc + x.price,
            acc -&gt; <span class="fn">ROUND</span>(acc, <span class="num">2</span>)) <span class="kw">AS</span> total_order_sum
<span class="kw">FROM</span> silver.orders;</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>TRANSFORM(arr, x -> ...):</b> Applies inline lambda transformations directly to elements inside nested arrays without exploding to intermediate rows.</li>
            <li><b>FILTER(arr, x -> ...):</b> Prunes array elements matching the boolean condition entirely in-memory within CPU cache lines.</li>
            <li><b>EXISTS(arr, x -> ...):</b> Performs fast short-circuit boolean evaluation, terminating the scan as soon as the first matching element is detected.</li>
            <li><b>AGGREGATE(arr, zero, (acc, x) -> ..., finish):</b> Folds array elements into a scalar summary value, operating identically to functional fold/reduce.</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          🚀 <b>Vectorized Speed:</b> Higher-Order functions run in CPU registers inside Tungsten/Photon C++, avoiding Java object allocations and row explosion shuffles.
        </div>
      </div>

      <!-- Card 10: Governance - Row Filters & Column Masks -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔒 Unity Catalog Row Filters & Column Masks</span>
          <span class="card-tag">Security</span>
        </div>
        <pre class="code"><span class="cm">-- 1. Column Masking (Mask card PAN unless in finance)</span>
<span class="kw">CREATE OR REPLACE FUNCTION</span> mask_card_pan(pan <span class="typ">STRING</span>)
<span class="kw">RETURN CASE</span>
  <span class="kw">WHEN</span> <span class="fn">is_account_group_member</span>(<span class="str">'finance_compliance'</span>) <span class="kw">THEN</span> pan
  <span class="kw">ELSE</span> <span class="fn">CONCAT</span>(<span class="str">'****-****-****-'</span>, <span class="fn">RIGHT</span>(pan, <span class="num">4</span>))
<span class="kw">END</span>;

<span class="kw">ALTER TABLE</span> silver.payments <span class="kw">ALTER COLUMN</span> card_number <span class="kw">SET MASK</span> mask_card_pan;

<span class="cm">-- 2. Row Filtering (Multi-Tenant isolation)</span>
<span class="kw">CREATE OR REPLACE FUNCTION</span> filter_regional_tenants(region <span class="typ">STRING</span>)
<span class="kw">RETURN</span> <span class="fn">is_account_group_member</span>(<span class="str">'global_admin'</span>) <span class="kw">OR</span> region = <span class="fn">current_user</span>();

<span class="kw">ALTER TABLE</span> silver.payments <span class="kw">SET ROW FILTER</span> filter_regional_tenants <span class="kw">ON</span> (region);</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>SET MASK:</b> Enforces deterministic column-level data redaction in Unity Catalog; non-privileged roles view only masked suffixes across all query tools.</li>
            <li><b>SET ROW FILTER:</b> Injects an invisible dynamic SQL predicate into every downstream query plan, guaranteeing multi-tenant data segregation.</li>
            <li><b>is_account_group_member():</b> Checks SCIM/Entra ID directory group memberships in real time during query parsing.</li>
            <li><b>Zero-Copy Security:</b> Security rules execute at the engine level without creating duplicate physical views or filtered tables.</li>
          </ul>
        </div>
        <div class="alert alert-sec">
          🔒 <b>Universal Governance:</b> Row filters and masks apply uniformly across SQL, PySpark, Power BI Direct Lake, and Databricks SQL Warehouses.
        </div>
      </div>

      <!-- Card 11: Dynamic Pivot, Unpivot & Grouping Sets -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔄 Dynamic Pivot, Unpivot & Grouping Sets</span>
          <span class="card-tag">Dimensional Modeling</span>
        </div>
        <pre class="code"><span class="cm">-- Dynamic Pivot (Row categories to columnar metrics)</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> (
  <span class="kw">SELECT</span> region, product_category, revenue <span class="kw">FROM</span> silver.sales
) <span class="kw">PIVOT</span> (
  <span class="fn">SUM</span>(revenue) <span class="kw">FOR</span> product_category <span class="kw">IN</span> (
    <span class="str">'Hardware'</span> <span class="kw">AS</span> hw, <span class="str">'Cloud'</span> <span class="kw">AS</span> cloud, <span class="str">'Services'</span> <span class="kw">AS</span> svc
  )
);

<span class="cm">-- Unpivot (Columnar metrics back to normalized rows)</span>
<span class="kw">SELECT</span> region, category, revenue <span class="kw">FROM</span> silver.pivoted_sales
<span class="kw">UNPIVOT</span> (revenue <span class="kw">FOR</span> category <span class="kw">IN</span> (hw, cloud, svc));

<span class="cm">-- Multi-Dimensional Subtotals with CUBE</span>
<span class="kw">SELECT</span> region, product, <span class="fn">SUM</span>(revenue) <span class="kw">FROM</span> silver.sales
<span class="kw">GROUP BY CUBE</span>(region, product);</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>PIVOT:</b> Aggregates categorical dimension keys into horizontal columns in a single scan without chained conditional statements.</li>
            <li><b>UNPIVOT:</b> Normalizes denormalized spreadsheet-style columns back into transactional rows suitable for dimensional modeling.</li>
            <li><b>GROUP BY CUBE:</b> Computes all $2^N$ grouping permutations in a single pass: <code>(region, product)</code>, <code>(region)</code>, <code>(product)</code>, and Grand Total <code>()</code>.</li>
            <li><b>Performance Note:</b> Explicitly supplying the <code>IN (...)</code> list avoids an expensive pre-aggregation scan to discover unique keys.</li>
          </ul>
        </div>
        <div class="alert alert-tip">
          💡 <b>CUBE vs ROLLUP:</b> <code>CUBE</code> generates all combinatorial cross-product subtotals; <code>ROLLUP</code> generates strictly hierarchical rollups.
        </div>
      </div>

      <!-- Card 12: Performance Hints & Configuration Knobs -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⚡ Spark SQL Performance Hints & Config Knobs</span>
          <span class="card-tag">Tuning & FinOps</span>
        </div>
        <pre class="code"><span class="cm">-- Join & Skew Optimization Hints</span>
<span class="kw">SELECT</span> <span class="cm">/*+ BROADCAST(dim), SKEW('fact', 'cust_id') */</span>
  fact.order_id, fact.amount, dim.category_name
<span class="kw">FROM</span> silver.orders fact
<span class="kw">JOIN</span> silver.categories dim <span class="kw">ON</span> fact.cat_id = dim.cat_id;

<span class="cm">-- Production Performance Session Knobs</span>
<span class="kw">SET</span> spark.sql.shuffle.partitions = auto;
<span class="kw">SET</span> spark.sql.adaptive.enabled = <span class="kw">true</span>;
<span class="kw">SET</span> spark.sql.files.maxPartitionBytes = <span class="num">134217728</span>; <span class="cm">-- 128 MB</span>
<span class="kw">SET</span> spark.databricks.delta.optimizeWrite.enabled = <span class="kw">true</span>;
<span class="kw">SET</span> spark.databricks.delta.autoCompact.enabled = <span class="kw">true</span>;</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>BROADCAST Hint:</b> Replicates lookup tables (&lt;100MB) to all executors, converting expensive SortMergeJoin to shuffle-free BroadcastHashJoin.</li>
            <li><b>SKEW Hint:</b> Forces Adaptive Query Execution (AQE) to detect and split oversized join partitions on the specified key into smaller sub-tasks.</li>
            <li><b>maxPartitionBytes (128MB):</b> Sets target uncompressed split size when reading Parquet from cloud storage, controlling input task counts.</li>
            <li><b>optimizeWrite & autoCompact:</b> Dynamically coalesces partitions during commits to prevent the small-file problem in high-frequency pipelines.</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          ⚡ <b>Engine Auto-Tuning:</b> In DBR 15.4+, <code>spark.sql.shuffle.partitions = auto</code> lets AQE dynamically tune shuffle partitions at runtime.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="page-footer-left">
        <span>Santosh Jammi | Principal Data Architect</span>
        <span>•</span>
        <span>Databricks Lakehouse Cheat Sheet Series</span>
      </div>
      <div class="page-footer-right">Page 2 of 2 — Analytics, Functions & Engine Knobs</div>
    </div>
  </div>
"""

# ==============================================================================
# 2. PYSPARK TEMPLATE (12 CARDS)
# ==============================================================================
PYSPARK_BODY = """
  <!-- PAGE 1 -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="header-title-box">
          <h1>⚡ DATABRICKS PYSPARK CHEAT SHEET</h1>
          <p>Production Reference: DataFrame API, Strict Schemas, Joins, Windowing & Performance</p>
        </div>
      </div>
      <div class="header-badges">
        <span class="badge badge-primary">PySpark</span>
        <span class="badge badge-secondary">DBR 15.4+ LTS</span>
        <span class="badge badge-dark">DataFrame API</span>
        <span class="badge badge-accent">Delta Lake</span>
      </div>
    </div>

    <div class="content-grid">
      <!-- Card 1: SparkSession & Production Config -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🚀 SparkSession Initialization & DBR Sizing</span>
          <span class="card-tag">Configuration</span>
        </div>
        <pre class="code"><span class="kw">from</span> pyspark.sql <span class="kw">import</span> SparkSession
<span class="kw">import</span> pyspark.sql.functions <span class="kw">as</span> <span class="cls">F</span>
<span class="kw">import</span> pyspark.sql.types <span class="kw">as</span> <span class="cls">T</span>
<span class="kw">from</span> pyspark.sql.window <span class="kw">import</span> <span class="cls">Window</span> <span class="kw">as</span> <span class="cls">W</span>

<span class="var">spark</span> = (<span class="cls">SparkSession</span>.builder
    .appName(<span class="str">"Databricks-Production-Pipeline"</span>)
    .config(<span class="str">"spark.sql.extensions"</span>, <span class="str">"io.delta.sql.DeltaSparkSessionExtension"</span>)
    .config(<span class="str">"spark.sql.catalog.spark_catalog"</span>, <span class="str">"org.apache.spark.sql.delta.catalog.DeltaCatalog"</span>)
    .config(<span class="str">"spark.sql.execution.arrow.pyspark.enabled"</span>, <span class="str">"true"</span>)
    .config(<span class="str">"spark.sql.adaptive.enabled"</span>, <span class="str">"true"</span>)
    .getOrCreate())</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Delta Extensions:</b> <code>io.delta.sql.DeltaSparkSessionExtension</code> registers Delta ACID query parsing and catalog metadata handlers.</li>
            <li><b>Catalog Delegation:</b> <code>DeltaCatalog</code> integrates local and Unity Catalog 3-level namespaces for ACID transactions.</li>
            <li><b>PyArrow Optimization:</b> <code>arrow.pyspark.enabled</code> enables zero-copy vectorized serialization between JVM and Python worker processes.</li>
            <li><b>AQE Enabled:</b> Activates Adaptive Query Execution for dynamic runtime join conversions and automatic partition coalescing.</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          ⚡ <b>Serverless Note:</b> On Databricks Serverless compute, the SparkSession is pre-initialized and instantly auto-tuned for sub-second scaling.
        </div>
      </div>

      <!-- Card 2: DataFrame Transformations -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🧱 DataFrame Projections, Transforms & Filters</span>
          <span class="card-tag">DataFrame API</span>
        </div>
        <pre class="code"><span class="var">df_curated</span> = (<span class="var">df_raw</span>
    <span class="cm"># Filter with pushdown predicate</span>
    .filter((<span class="cls">F</span>.col(<span class="str">"status"</span>) == <span class="str">"ACTIVE"</span>) & (<span class="cls">F</span>.col(<span class="str">"amount"</span>) &gt; <span class="num">0</span>))
    <span class="cm"># Multi-column projection and derivation</span>
    .withColumn(<span class="str">"tax_amt"</span>, <span class="cls">F</span>.round(<span class="cls">F</span>.col(<span class="str">"amount"</span>) * <span class="num">0.18</span>, <span class="num">2</span>))
    .withColumn(<span class="str">"customer_tier"</span>,
        <span class="cls">F</span>.when(<span class="cls">F</span>.col(<span class="str">"amount"</span>) &gt;= <span class="num">10000</span>, <span class="str">"PLATINUM"</span>)
         .when(<span class="cls">F</span>.col(<span class="str">"amount"</span>) &gt;= <span class="num">2500</span>, <span class="str">"GOLD"</span>)
         .otherwise(<span class="str">"STANDARD"</span>))
    <span class="cm"># High-performance projection replacing select() + withColumn()</span>
    .selectExpr(<span class="str">"customer_id"</span>, <span class="str">"amount"</span>, <span class="str">"tax_amt"</span>, <span class="str">"customer_tier"</span>,
                <span class="str">"current_timestamp() as ingested_at"</span>)
)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Filter Pushdown:</b> <code>.filter(...)</code> generates a Catalyst Filter operator pushed down into Parquet footer metadata to skip non-matching row groups.</li>
            <li><b>F.when().otherwise():</b> Compiles directly into native JVM conditional bytecode; avoids python UDF context switching.</li>
            <li><b>selectExpr():</b> Evaluates mixed column projections and SQL expressions in a single projection pass without intermediate plans.</li>
            <li><b>withColumns() in Spark 3.3+:</b> Pass a dictionary to add multiple derived columns simultaneously without rebuilding schema trees.</li>
          </ul>
        </div>
        <div class="alert alert-tip">
          💡 <b>Optimization:</b> Chain transformations lazily; Catalyst combines consecutive filter and project operators into a single pipelined stage.
        </div>
      </div>

      <!-- Card 3: Strict Schema Definition -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📐 Strict Schema Definition (StructType & StructField)</span>
          <span class="card-tag">Data Quality</span>
        </div>
        <pre class="code"><span class="cm"># Explicit schema avoids expensive inferSchema full-scans</span>
<span class="var">txn_schema</span> = <span class="cls">T</span>.StructType([
    <span class="cls">T</span>.StructField(<span class="str">"txn_id"</span>, <span class="cls">T</span>.LongType(), nullable=<span class="kw">False</span>),
    <span class="cls">T</span>.StructField(<span class="str">"cust_id"</span>, <span class="cls">T</span>.StringType(), nullable=<span class="kw">False</span>),
    <span class="cls">T</span>.StructField(<span class="str">"amount"</span>, <span class="cls">T</span>.DecimalType(<span class="num">18</span>, <span class="num">2</span>), nullable=<span class="kw">False</span>),
    <span class="cls">T</span>.StructField(<span class="str">"attributes"</span>, <span class="cls">T</span>.MapType(<span class="cls">T</span>.StringType(), <span class="cls">T</span>.StringType())),
    <span class="cls">T</span>.StructField(<span class="str">"items"</span>, <span class="cls">T</span>.ArrayType(<span class="cls">T</span>.StringType())),
    <span class="cls">T</span>.StructField(<span class="str">"event_time"</span>, <span class="cls">T</span>.TimestampType())
])

<span class="cm"># Read with enforced schema and corrupt record safety</span>
<span class="var">df</span> = (<span class="var">spark</span>.read
      .schema(<span class="var">txn_schema</span>)
      .option(<span class="str">"mode"</span>, <span class="str">"PERMISSIVE"</span>)
      .option(<span class="str">"columnNameOfCorruptRecord"</span>, <span class="str">"_corrupt"</span>)
      .json(<span class="str">"abfss://landing@adls.dfs.core.windows.net/txns/"</span>))</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Explicit Schema:</b> Eliminates multi-pass storage scans required by <code>inferSchema=True</code>, reducing multi-terabyte ingestion time by 80%.</li>
            <li><b>Nullable Guarantees:</b> Setting <code>nullable=False</code> enables Catalyst to optimize join plans and bypass redundant null-check branches.</li>
            <li><b>PERMISSIVE Mode:</b> Captures malformed input JSON rows safely into a quarantine column without crashing distributed streaming tasks.</li>
            <li><b>Nested Types:</b> <code>MapType</code> and <code>ArrayType</code> preserve schema structure while enabling downstream element-level indexing.</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          ⚡ <b>FinOps Sizing:</b> Enforcing schemas on read eliminates full file body scans across cloud storage landing zones.
        </div>
      </div>

      <!-- Card 4: Standard Functions Reference -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🧰 pyspark.sql.functions (F) Master Reference</span>
          <span class="card-tag">Functions</span>
        </div>
        <pre class="code"><span class="var">df_transformed</span> = (<span class="var">df</span>
    <span class="cm"># String transforms</span>
    .withColumn(<span class="str">"full_key"</span>, <span class="cls">F</span>.concat_ws(<span class="str">"_"</span>, <span class="cls">F</span>.col(<span class="str">"region"</span>), <span class="cls">F</span>.col(<span class="str">"cust_id"</span>)))
    <span class="cm"># Date formatting & truncation</span>
    .withColumn(<span class="str">"month_start"</span>, <span class="cls">F</span>.date_trunc(<span class="str">"MM"</span>, <span class="cls">F</span>.col(<span class="str">"txn_date"</span>)))
    <span class="cm"># Null coalescing</span>
    .withColumn(<span class="str">"clean_phone"</span>, <span class="cls">F</span>.coalesce(<span class="cls">F</span>.col(<span class="str">"phone"</span>), <span class="cls">F</span>.lit(<span class="str">"UNKNOWN"</span>)))
    <span class="cm"># In-memory array deduplication</span>
    .withColumn(<span class="str">"unique_tags"</span>, <span class="cls">F</span>.array_distinct(<span class="cls">F</span>.col(<span class="str">"tags"</span>)))
    <span class="cm"># JSON string extraction</span>
    .withColumn(<span class="str">"device_id"</span>, <span class="cls">F</span>.get_json_object(<span class="cls">F</span>.col(<span class="str">"raw_meta"</span>), <span class="str">"$.device.id"</span>))
)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>JVM Native Execution:</b> Built-in <code>pyspark.sql.functions</code> map directly to Catalyst expressions executed in JVM/C++ Photon without Py4J bridge overhead.</li>
            <li><b>concat_ws():</b> Joins strings using a delimiter and skips null arguments automatically, preventing unwanted null outputs.</li>
            <li><b>date_trunc():</b> Truncates timestamps to the requested calendar boundary, accelerating time-series aggregations.</li>
            <li><b>get_json_object():</b> Extracts scalar JSON path attributes using high-speed JSON path scanning without parsing entire payload schemas.</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          ⚡ <b>Vectorization Rule:</b> Never implement custom Python UDFs when equivalent native <code>F.</code> functions exist.
        </div>
      </div>

      <!-- Card 5: Joins, Broadcast & Skew Salting -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔀 Joins, Broadcast Hints & Skew Salting</span>
          <span class="card-tag">Optimization</span>
        </div>
        <pre class="code"><span class="cm"># Broadcast Join: Eliminates shuffle for lookup tables (&lt;100MB)</span>
<span class="var">df_joined</span> = <span class="var">df_fact</span>.join(<span class="cls">F</span>.broadcast(<span class="var">df_dim</span>), on=<span class="str">"cat_id"</span>, how=<span class="str">"left"</span>)

<span class="cm"># Semi & Anti Joins (Replaces expensive IN / NOT IN subqueries)</span>
<span class="var">df_active</span> = <span class="var">df_users</span>.join(<span class="var">df_purchases</span>, on=<span class="str">"user_id"</span>, how=<span class="str">"left_semi"</span>)
<span class="var">df_churned</span> = <span class="var">df_users</span>.join(<span class="var">df_purchases</span>, on=<span class="str">"user_id"</span>, how=<span class="str">"left_anti"</span>)

<span class="cm"># Manual 2-Stage Skew Salting (When AQE cannot balance 100M+ key)</span>
<span class="var">df_skewed</span> = <span class="var">df_fact</span>.withColumn(<span class="str">"salt"</span>, (<span class="cls">F</span>.rand() * <span class="num">10</span>).cast(<span class="str">"int"</span>))
<span class="var">df_dim_exploded</span> = (<span class="var">df_dim</span>
    .withColumn(<span class="str">"salt_arr"</span>, <span class="cls">F</span>.array([<span class="cls">F</span>.lit(i) <span class="kw">for</span> i <span class="kw">in</span> range(<span class="num">10</span>)]))
    .withColumn(<span class="str">"salt"</span>, <span class="cls">F</span>.explode(<span class="str">"salt_arr"</span>)))
<span class="var">df_salted_join</span> = <span class="var">df_skewed</span>.join(<span class="var">df_dim_exploded</span>, on=[<span class="str">"key"</span>, <span class="str">"salt"</span>])</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Broadcast Hash Join (BHJ):</b> Replicates the small dimension to all executors, eliminating the expensive SortMergeJoin shuffle exchange.</li>
            <li><b>Left Semi Join:</b> Evaluates existence without duplicating parent rows when child records match multiple times.</li>
            <li><b>Left Anti Join:</b> Returns records from the left dataset having zero matches on the right; highly optimized alternative to <code>NOT IN</code>.</li>
            <li><b>Synthetic Salting:</b> Distributes skewed hot keys across 10 virtual partition buckets, eliminating straggler tasks holding up the stage.</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          ⚡ <b>Threshold Knob:</b> Configure <code>spark.sql.autoBroadcastJoinThreshold = 104857600</code> (100MB) to tune auto-broadcast eligibility.
        </div>
      </div>

      <!-- Card 6: Window Functions in PySpark -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🪟 Analytical Window Specifications (pyspark.sql.Window)</span>
          <span class="card-tag">Analytics</span>
        </div>
        <pre class="code"><span class="cm"># Define Window Specifications</span>
<span class="var">w_dept</span> = <span class="cls">W</span>.partitionBy(<span class="str">"dept_id"</span>).orderBy(<span class="cls">F</span>.col(<span class="str">"salary"</span>).desc())
<span class="var">w_roll_7d</span> = (<span class="cls">W</span>.partitionBy(<span class="str">"account_id"</span>)
             .orderBy(<span class="cls">F</span>.col(<span class="str">"txn_date"</span>).cast(<span class="str">"timestamp"</span>).cast(<span class="str">"long"</span>))
             .rangeBetween(-<span class="num">7</span> * <span class="num">86400</span>, <span class="num">0</span>)) <span class="cm"># 7 days in seconds</span>

<span class="var">df_analyzed</span> = (<span class="var">df</span>
    .withColumn(<span class="str">"dense_rank"</span>, <span class="cls">F</span>.dense_rank().over(<span class="var">w_dept</span>))
    .withColumn(<span class="str">"prev_salary"</span>, <span class="cls">F</span>.lag(<span class="str">"salary"</span>, <span class="num">1</span>, <span class="num">0</span>).over(<span class="var">w_dept</span>))
    .withColumn(<span class="str">"salary_diff"</span>, <span class="cls">F</span>.col(<span class="str">"salary"</span>) - <span class="cls">F</span>.col(<span class="str">"prev_salary"</span>))
    .withColumn(<span class="str">"rolling_7d_total"</span>, <span class="cls">F</span>.sum(<span class="str">"amount"</span>).over(<span class="var">w_roll_7d</span>))
)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>W.partitionBy().orderBy():</b> Directs Spark to sort rows within partitioned subsets without sorting the entire distributed dataset.</li>
            <li><b>rangeBetween(offset, 0):</b> Computes rolling aggregate windows across epoch timestamps, properly accounting for days with missing records.</li>
            <li><b>F.dense_rank():</b> Computes ranking without rank number gaps for tied values; ideal for identifying top-earners per department.</li>
            <li><b>F.lag(col, offset, default):</b> Inspects prior record values in a single streaming pass across the partition window.</li>
          </ul>
        </div>
        <div class="alert alert-tip">
          💡 <b>Range vs Rows:</b> <code>rangeBetween</code> handles continuous value ranges; <code>rowsBetween</code> operates strictly on physical row indices.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="page-footer-left">
        <span>Santosh Jammi | Principal Data Architect</span>
        <span>•</span>
        <span>Databricks Lakehouse Cheat Sheet Series</span>
      </div>
      <div class="page-footer-right">Page 1 of 2 — DataFrame API & Windows</div>
    </div>
  </div>

  <!-- PAGE 2 -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="header-title-box">
          <h1>⚡ DATABRICKS PYSPARK CHEAT SHEET</h1>
          <p>Delta API, Auto Loader Streaming, Arrow UDFs, Partitioning, Storage & Microbatching</p>
        </div>
      </div>
      <div class="header-badges">
        <span class="badge badge-primary">Delta Lake API</span>
        <span class="badge badge-secondary">Auto Loader</span>
        <span class="badge badge-dark">Vectorized UDFs</span>
      </div>
    </div>

    <div class="content-grid">
      <!-- Card 7: DeltaTable Python API -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔄 DeltaTable Python API & Upsert</span>
          <span class="card-tag">Delta API</span>
        </div>
        <pre class="code"><span class="kw">from</span> delta.tables <span class="kw">import</span> DeltaTable

<span class="var">delta_tbl</span> = <span class="cls">DeltaTable</span>.forName(<span class="var">spark</span>, <span class="str">"silver.customers"</span>)

(<span class="var">delta_tbl</span>.alias(<span class="str">"t"</span>)
 .merge(<span class="var">df_updates</span>.alias(<span class="str">"s"</span>), <span class="str">"t.cust_id = s.cust_id"</span>)
 .whenMatchedUpdate(condition=<span class="str">"s.hash != t.hash"</span>, set={
     <span class="str">"email"</span>: <span class="str">"s.email"</span>,
     <span class="str">"status"</span>: <span class="str">"s.status"</span>,
     <span class="str">"updated_at"</span>: <span class="str">"current_timestamp()"</span>
 })
 .whenNotMatchedInsert(values={
     <span class="str">"cust_id"</span>: <span class="str">"s.cust_id"</span>, <span class="str">"email"</span>: <span class="str">"s.email"</span>,
     <span class="str">"status"</span>: <span class="str">"s.status"</span>, <span class="str">"created_at"</span>: <span class="str">"current_timestamp()"</span>
 })
 .execute())</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>DeltaTable.forName():</b> Binds programmatic Python handles directly to Unity Catalog registered tables without raw path references.</li>
            <li><b>Declarative Merge:</b> Supports conditional updates and inserts; compiles into an atomic ACID commit updating the Delta transaction log.</li>
            <li><b>Hash Comparison:</b> Skips rewriting unchanged rows, minimizing write amplification on Delta Deletion Vectors and Parquet storage.</li>
            <li><b>Schema Evolution:</b> Pass <code>.withOption("mergeSchema", "true")</code> to automatically append new columns arriving from source DataFrames.</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          ⚡ <b>Deletion Vectors:</b> In DBR 14.1+, enable Deletion Vectors (<code>delta.enableDeletionVectors = true</code>) to execute row updates without file rewrites!
        </div>
      </div>

      <!-- Card 8: Structured Streaming & Auto Loader -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⚡ Structured Streaming with Auto Loader (cloudFiles)</span>
          <span class="card-tag">Streaming Ingestion</span>
        </div>
        <pre class="code"><span class="var">df_stream</span> = (<span class="var">spark</span>.readStream
    .format(<span class="str">"cloudFiles"</span>)
    .option(<span class="str">"cloudFiles.format"</span>, <span class="str">"json"</span>)
    .option(<span class="str">"cloudFiles.schemaLocation"</span>, <span class="str">"abfss://chk@adls.dfs.core.windows.net/schema"</span>)
    .option(<span class="str">"cloudFiles.schemaEvolutionMode"</span>, <span class="str">"addNewColumns"</span>)
    .option(<span class="str">"cloudFiles.inferColumnTypes"</span>, <span class="str">"true"</span>)
    .load(<span class="str">"abfss://raw@adls.dfs.core.windows.net/landing/"</span>))

<span class="var">query</span> = (<span class="var">df_stream</span>.writeStream
    .format(<span class="str">"delta"</span>)
    .outputMode(<span class="str">"append"</span>)
    .option(<span class="str">"checkpointLocation"</span>, <span class="str">"abfss://chk@adls.dfs.core.windows.net/chk_stream"</span>)
    .trigger(availableNow=<span class="kw">True</span>)
    .toTable(<span class="str">"bronze.events_stream"</span>))</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Auto Loader (cloudFiles):</b> Incrementally discovers and processes new cloud files without expensive file listing calls using cloud notifications.</li>
            <li><b>Schema Evolution:</b> <code>addNewColumns</code> safely adapts to evolving JSON payloads without throwing runtime streaming validation errors.</li>
            <li><b>Checkpoint Location:</b> Guarantees exactly-once processing state by persisting commit offsets and metadata in durable cloud storage.</li>
            <li><b>trigger(availableNow=True):</b> Processes all pending backlogged data across microbatches, then automatically terminates compute for FinOps savings.</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          ⚡ <b>FinOps Note:</b> <code>availableNow=True</code> achieves streaming exactly-once semantics with scheduled batch infrastructure costs.
        </div>
      </div>

      <!-- Card 9: Vectorized Arrow UDFs -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🏹 Vectorized Apache Arrow UDFs (@pandas_udf)</span>
          <span class="card-tag">Vectorization</span>
        </div>
        <pre class="code"><span class="kw">import</span> pandas <span class="kw">as</span> pd
<span class="kw">from</span> pyspark.sql.functions <span class="kw">import</span> pandas_udf

<span class="kw">@pandas_udf</span>(<span class="cls">T</span>.DoubleType())
<span class="kw">def</span> calculate_vat(amount: pd.Series, rate: pd.Series) -&gt; pd.Series:
    <span class="cm"># SIMD Vectorized NumPy/Pandas calculation in Python worker</span>
    <span class="kw">return</span> (amount * (rate / <span class="num">100.0</span>)).round(<span class="num">2</span>)

<span class="var">df_with_tax</span> = <span class="var">df</span>.withColumn(<span class="str">"vat"</span>, calculate_vat(<span class="cls">F</span>.col(<span class="str">"amount"</span>), <span class="cls">F</span>.col(<span class="str">"tax_rate"</span>)))</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Apache Arrow Zero-Copy:</b> Transmits column chunks between JVM and Python workers in Apache Arrow columnar format without row serialization.</li>
            <li><b>Vectorized Execution:</b> Python calculations execute on whole Pandas Series using vectorized C/SIMD loops instead of slow row-by-row iteration.</li>
            <li><b>Throughput Speed:</b> Executes up to <b>100x faster</b> than standard Python <code>@udf</code>, eliminating Py4J bottleneck latency.</li>
            <li><b>Memory Batching:</b> Tune batch sizes via <code>spark.sql.execution.arrow.maxRecordsPerBatch</code> (e.g. 10,000) to balance RAM usage.</li>
          </ul>
        </div>
        <div class="alert alert-tip">
          💡 <b>Type Contract:</b> Python type hints <code>(pd.Series) -&gt; pd.Series</code> determine the vectorization execution model in PySpark 3.0+.
        </div>
      </div>

      <!-- Card 10: Partitioning Strategy -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📦 Partitioning Strategy (repartition vs coalesce)</span>
          <span class="card-tag">Partitioning</span>
        </div>
        <pre class="code"><span class="cm"># repartition(N): Full shuffle, balances partitions uniformly</span>
<span class="var">df_shuffled</span> = <span class="var">df</span>.repartition(<span class="num">200</span>, <span class="str">"region"</span>)

<span class="cm"># repartitionByRange: Sorts data across partitions for range queries</span>
<span class="var">df_ranged</span> = <span class="var">df</span>.repartitionByRange(<span class="num">50</span>, <span class="cls">F</span>.col(<span class="str">"txn_date"</span>).desc())

<span class="cm"># coalesce(N): Merges partitions locally WITHOUT full network shuffle!</span>
<span class="var">df_collapsed</span> = <span class="var">df_shuffled</span>.coalesce(<span class="num">10</span>)

<span class="cm"># Inspect partition distribution</span>
<span class="fn">print</span>(<span class="str">"Partition Count:"</span>, <span class="var">df_collapsed</span>.rdd.getNumPartitions())</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>repartition():</b> Executes a full cluster network shuffle; essential when increasing partitions or redistributing skewed datasets.</li>
            <li><b>repartitionByRange():</b> Uses sampling to determine partition split points, producing globally sorted outputs across partition boundaries.</li>
            <li><b>coalesce():</b> Merges adjacent physical partitions within executors without network transfer; only use when decreasing partition count.</li>
            <li><b>File Target Sizing:</b> Adjust partition counts prior to writing Delta tables to maintain 100MB-1GB target Parquet files.</li>
          </ul>
        </div>
        <div class="alert alert-warn">
          ⚠️ <b>Anti-Pattern:</b> Calling <code>coalesce(1)</code> on large datasets collapses upstream execution to a single executor, triggering Driver OOM!
        </div>
      </div>

      <!-- Card 11: Storage Levels & Memory Persistence -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">💾 Storage Levels & Memory Persistence</span>
          <span class="card-tag">Memory Management</span>
        </div>
        <pre class="code"><span class="kw">from</span> pyspark <span class="kw">import</span> StorageLevel

<span class="cm"># Deserialized in RAM (Fastest CPU, Highest RAM)</span>
<span class="var">df</span>.cache() <span class="cm"># Shorthand for persist(StorageLevel.MEMORY_AND_DISK_DESER)</span>

<span class="cm"># Serialized in RAM with Disk Spill (Production Recommended for Large DFs)</span>
<span class="var">df</span>.persist(<span class="cls">StorageLevel</span>.MEMORY_AND_DISK_SER)

<span class="cm"># Trigger materialization with an action</span>
<span class="var">record_count</span> = <span class="var">df</span>.count()

<span class="cm"># Crucial: Unpersist when downstream processing completes!</span>
<span class="var">df</span>.unpersist(blocking=<span class="kw">True</span>)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>cache() vs persist():</b> <code>cache()</code> defaults to deserialized objects in memory; <code>persist()</code> allows customizing serialization and disk spill.</li>
            <li><b>MEMORY_AND_DISK_SER:</b> Stores serialized byte arrays; reduces RAM consumption by ~3x and prevents out-of-memory errors via local disk spill.</li>
            <li><b>Lazy Evaluation:</b> Persisting is registered lazily; data is only populated into cache blocks when the first action (e.g. <code>.count()</code>) is invoked.</li>
            <li><b>unpersist(blocking=True):</b> Explicitly frees cluster memory immediately, preventing memory leaks across long-running pipelines.</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          ⚡ <b>Off-Heap Option:</b> <code>StorageLevel.OFF_HEAP</code> stores data in Tungsten managed memory outside the JVM garbage collector, eliminating GC pauses!
        </div>
      </div>

      <!-- Card 12: Streaming Microbatch Merges -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🌊 Streaming Microbatch Merges (foreachBatch)</span>
          <span class="card-tag">Streaming Sink</span>
        </div>
        <pre class="code"><span class="kw">def</span> upsert_microbatch(microbatch_df, batch_id):
    <span class="cm"># Idempotent write per microbatch</span>
    (<span class="cls">DeltaTable</span>.forName(<span class="var">spark</span>, <span class="str">"silver.realtime_orders"</span>).alias(<span class="str">"t"</span>)
     .merge(microbatch_df.alias(<span class="str">"s"</span>), <span class="str">"t.order_id = s.order_id"</span>)
     .whenMatchedUpdateAll()
     .whenNotMatchedInsertAll()
     .execute())

<span class="var">query</span> = (<span class="var">df_stream</span>.writeStream
    .format(<span class="str">"delta"</span>)
    .foreachBatch(upsert_microbatch)
    .option(<span class="str">"checkpointLocation"</span>, <span class="str">"abfss://chk@adls.dfs.core.windows.net/orders_chk"</span>)
    .start())</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>foreachBatch:</b> Bridges Structured Streaming and standard batch APIs, allowing arbitrary Delta MERGE logic per microbatch partition.</li>
            <li><b>Idempotent Commits:</b> Using <code>batch_id</code> guarantees exactly-once processing even if a microbatch fails and replays from the checkpoint.</li>
            <li><b>Multi-Table Fan-Out:</b> A single stream can write to multiple Delta tables or external databases simultaneously within the microbatch function.</li>
            <li><b>whenMatchedUpdateAll():</b> Dynamically syncs all columns between source and target without requiring explicit column-by-column mapping.</li>
          </ul>
        </div>
        <div class="alert alert-tip">
          💡 <b>Streaming Rule:</b> Cache <code>microbatch_df</code> inside <code>foreachBatch</code> if reading it multiple times to prevent re-evaluating the streaming plan.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="page-footer-left">
        <span>Santosh Jammi | Principal Data Architect</span>
        <span>•</span>
        <span>Databricks Lakehouse Cheat Sheet Series</span>
      </div>
      <div class="page-footer-right">Page 2 of 2 — Delta API, Auto Loader & Streaming</div>
    </div>
  </div>
"""

# ==============================================================================
# 3. SPARK CORE & ARCHITECTURE TEMPLATE (12 CARDS)
# ==============================================================================
SPARK_CORE_BODY = """
  <!-- PAGE 1 -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="header-title-box">
          <h1>⚙️ SPARK ARCHITECTURE & ENGINE INTERNALS</h1>
          <p>Cluster Topography, JVM Memory Management, Shuffles, Catalyst Optimizer & Sizing</p>
        </div>
      </div>
      <div class="header-badges">
        <span class="badge badge-primary">Spark Core</span>
        <span class="badge badge-secondary">Catalyst & Tungsten</span>
        <span class="badge badge-dark">JVM Architecture</span>
        <span class="badge badge-accent">Production Sizing</span>
      </div>
    </div>

    <div class="content-grid">
      <!-- Card 1: Cluster Topography & Execution Hierarchy -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🌐 Cluster Topography & Execution Hierarchy</span>
          <span class="card-tag">Architecture</span>
        </div>
        <pre class="code"><span class="cm"># Cluster Submission Architecture & Execution Model</span>
Application
 └── <b>Driver</b> (Coordinates DAGScheduler, TaskScheduler, SparkContext)
      └── <b>Job</b> (Triggered by an Action: .count(), .collect(), .save())
           └── <b>Stage</b> (Boundary determined by Shuffle Exchanges)
                └── <b>Task</b> (Individual computation executed on 1 Partition)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Driver:</b> Orchestrates execution, translates logical DataFrame plans into physical execution stages, and monitors executor health.</li>
            <li><b>DAGScheduler:</b> Evaluates operator graphs, splits stages along wide shuffle boundaries, and optimizes task scheduling.</li>
            <li><b>TaskScheduler:</b> Dispatches individual partition tasks to worker executor slots based on data locality preferences (NODE_LOCAL, PROCESS_LOCAL).</li>
            <li><b>Executor:</b> Dedicated JVM process per worker node executing assigned tasks in parallel threads and caching partition blocks.</li>
          </ul>
        </div>
        <div class="alert alert-tip">
          💡 <b>Golden Rule:</b> 1 Task = 1 CPU Core = 1 Data Partition. Cluster throughput depends on balancing task counts to total available executor cores.
        </div>
      </div>

      <!-- Card 2: JVM Unified Memory Management -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🧠 JVM Unified Memory Management (Heap & Off-Heap)</span>
          <span class="card-tag">Memory Pools</span>
        </div>
        <pre class="code"><span class="cm"># Total Executor Memory Breakdown (JVM + Off-Heap)</span>
Total Memory = Executor Heap (spark.executor.memory)
             + Memory Overhead (spark.executor.memoryOverhead)
             + Off-Heap Memory (spark.memory.offHeap.size)

JVM Heap Pools:
├── <b>Reserved Memory:</b> 300 MB (Hardcoded internal Spark engine safety)
├── <b>User Memory:</b> (JVM - 300MB) * (1 - 0.6) = ~40% (UDFs, metadata, hashes)
└── <b>Unified Spark Memory:</b> (JVM - 300MB) * 0.6 = ~60%
     ├── <b>Storage Pool:</b> ~50% (Data caching & broadcast variables)
     └── <b>Execution Pool:</b> ~50% (Shuffles, joins, sorts, aggregations)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Dynamic Borrowing:</b> Execution and Storage pools share a unified boundary; execution can evict cached storage blocks if memory is constrained.</li>
            <li><b>Memory Overhead:</b> Off-heap native memory for Py4J communication, Netty shuffle network buffers, and OS page cache (typically 10% of heap).</li>
            <li><b>Off-Heap Tungsten:</b> <code>spark.memory.offHeap.enabled = true</code> stores data outside Java GC in native C-style memory, eliminating GC pauses.</li>
            <li><b>OOM Prevention:</b> If execution memory overflows the unified pool, data spills to local NVMe SSD disks (Spill Memory / Spill Disk).</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          ⚡ <b>Tuning Knob:</b> <code>spark.memory.fraction = 0.6</code> controls the size of the combined execution/storage pool relative to total JVM heap.
        </div>
      </div>

      <!-- Card 3: Narrow vs Wide Transformations -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔗 Dependency Graph: Narrow vs Wide Transformations</span>
          <span class="card-tag">Execution DAG</span>
        </div>
        <pre class="code"><span class="cm"># Narrow Transformations (1:1 Partition Mapping - NO Network Shuffle)</span>
<span class="var">df_narrow</span> = (<span class="var">df</span>
    .filter(<span class="str">"amount &gt; 100"</span>)       <span class="cm"># Local row filter</span>
    .select(<span class="str">"id"</span>, <span class="str">"amount"</span>)        <span class="cm"># Local projection</span>
    .withColumn(<span class="str">"tax"</span>, <span class="cls">F</span>.col(<span class="str">"amount"</span>) * <span class="num">0.18</span>)) <span class="cm"># Local arithmetic</span>

<span class="cm"># Wide Transformations (M:N Shuffle Exchange - Stage Boundary Created!)</span>
<span class="var">df_wide</span> = (<span class="var">df_narrow</span>
    .groupBy(<span class="str">"id"</span>).agg(<span class="cls">F</span>.sum(<span class="str">"amount"</span>)) <span class="cm"># Hash shuffle across nodes</span>
    .distinct()                          <span class="cm"># Deduplication shuffle</span>
    .join(<span class="var">df_other</span>, on=<span class="str">"id"</span>))            <span class="cm"># SortMerge shuffle</span></pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Narrow Dependencies:</b> Partitions are processed independently in parallel within the same executor thread without network transfers (pipelined).</li>
            <li><b>Wide Dependencies:</b> Require data redistribution across nodes based on hash partitioning; forces a stage completion boundary.</li>
            <li><b>Shuffle Exchange:</b> Wide transformations serialize data into shuffle blocks on disk, initiating high network I/O across executors.</li>
            <li><b>Inspection:</b> Execute <code>df.explain()</code> to verify stage boundaries; look for <code>Exchange hashpartitioning</code> operators.</li>
          </ul>
        </div>
        <div class="alert alert-tip">
          💡 <b>Architect Principle:</b> Structure transformations so narrow operations filter and prune data prior to invoking wide shuffle operations.
        </div>
      </div>

      <!-- Card 4: Shuffle Mechanics & Memory Spill -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔀 Shuffle Mechanics & Spill Bottlenecks</span>
          <span class="card-tag">Engine Bottlenecks</span>
        </div>
        <pre class="code"><span class="cm"># Shuffle Tuning Knobs</span>
<span class="cm"># 1. Shuffle write buffer (reduces disk write syscalls)</span>
<span class="var">spark</span>.conf.set(<span class="str">"spark.shuffle.file.buffer"</span>, <span class="str">"1m"</span>) <span class="cm"># Default 32k</span>

<span class="cm"># 2. Max size of remote fetch requests in flight</span>
<span class="var">spark</span>.conf.set(<span class="str">"spark.reducer.maxSizeInFlight"</span>, <span class="str">"96m"</span>) <span class="cm"># Default 48m</span>

<span class="cm"># 3. Dedicated shuffle partition count</span>
<span class="var">spark</span>.conf.set(<span class="str">"spark.sql.shuffle.partitions"</span>, <span class="num">400</span>)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Shuffle Write:</b> Map tasks partition records into in-memory append-only buffers, sorting by partition hash before flushing to local disk files.</li>
            <li><b>Shuffle Read:</b> Reduce tasks open parallel Netty HTTP connections to pull their respective partition chunks across the cluster network.</li>
            <li><b>Spill (Memory):</b> Size of uncompressed deserialized records overflowing the execution pool that could not be held in RAM.</li>
            <li><b>Spill (Disk):</b> Size of compressed serialized records written to disk; high spill signals severe memory starvation and disk I/O thrashing.</li>
          </ul>
        </div>
        <div class="alert alert-warn">
          ⚠️ <b>Diagnostic Alert:</b> When Spark UI shows Spill (Memory) &gt; 0, increase partition counts or scale up executor RAM to eliminate disk thrashing.
        </div>
      </div>

      <!-- Card 5: Catalyst Optimizer & Whole-Stage CodeGen -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⚡ Catalyst Query Optimizer & Whole-Stage CodeGen</span>
          <span class="card-tag">Catalyst / Tungsten</span>
        </div>
        <pre class="code"><span class="cm"># Inspect Catalyst Execution Pipeline</span>
<span class="var">df</span>.explain(mode=<span class="str">"formatted"</span>)

<span class="cm"># 4 Stages of Catalyst:</span>
1. <b>Unresolved Logical Plan:</b> Verifies SQL syntax & AST
2. <b>Analyzed Logical Plan:</b> Resolves column names against Catalog
3. <b>Optimized Logical Plan:</b> Pushes down predicates & prunes columns
4. <b>Physical Plan:</b> Selects algorithms (HashJoin vs SortMerge)
   └── <b>Whole-Stage CodeGen:</b> Emits Java Bytecode (clean for loops)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Predicate Pushdown:</b> Pushes filter conditions directly into storage file scans, skipping entire row groups before data enters JVM memory.</li>
            <li><b>Column Pruning:</b> Reads only projected columns from columnar Parquet storage, avoiding deserialization of unused wide table fields.</li>
            <li><b>Cost-Based Optimizer (CBO):</b> Evaluates table statistics to choose optimal join orders and select broadcast joins automatically.</li>
            <li><b>Whole-Stage CodeGen:</b> Collapses multiple physical operators into a single Java bytecode loop, eliminating virtual function invocation costs.</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          ⚡ <b>Plan Indicator:</b> In <code>df.explain()</code>, an asterisk <code>*(1) HashAggregate</code> confirms that the operator is compiled with Whole-Stage CodeGen!
        </div>
      </div>

      <!-- Card 6: Production Executor Sizing Formula -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🧮 Production Executor Sizing Formula</span>
          <span class="card-tag">Cluster Math</span>
        </div>
        <pre class="code"><span class="cm"># Node Hardware: 10 Nodes, 16 Cores, 64 GB RAM per Node</span>
1. Cores per Node for OS/Daemons = 1 Core (15 Cores left for Spark)
2. Optimal Cores per Executor = <b>5 Cores</b> (Avoids GC thrashing & HDFS bottleneck)
3. Executors per Node = 15 / 5 = <b>3 Executors</b>
4. Total Executors = (10 Nodes * 3) - 1 (Driver) = <b>29 Executors</b>
5. RAM per Node for OS = 1 GB (63 GB left for Spark)
6. RAM per Executor = 63 GB / 3 = 21 GB
7. Memory Overhead = max(384MB, 0.10 * 21GB) = ~2.1 GB
8. Executor Heap = 21GB - 2.1GB = <b>18.9 GB</b> (Set: --executor-memory 19g)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>5 Cores Golden Ratio:</b> Allocating &gt;5 cores per executor leads to severe JVM Garbage Collection pause degradation and storage I/O contention.</li>
            <li><b>OS Core Headroom:</b> Leaving 1 core per VM prevents Kubernetes kubelet and Linux background daemons from starving executor threads.</li>
            <li><b>Overhead Calculation:</b> 10% overhead ensures sufficient memory for off-heap buffers, avoiding YARN/K8s container exit code 137 kills.</li>
            <li><b>Driver Reservation:</b> Deducting 1 executor accounts for the ApplicationMaster/Driver node in cluster deployment mode.</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          ⚡ <b>Parallelism Rule:</b> Configure <code>spark.default.parallelism = total_executor_cores * 2 to 3</code> (For 145 cores = ~300-450 partitions).
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="page-footer-left">
        <span>Santosh Jammi | Principal Data Architect</span>
        <span>•</span>
        <span>Databricks Lakehouse Cheat Sheet Series</span>
      </div>
      <div class="page-footer-right">Page 1 of 2 — Cluster, Memory, Shuffle & Catalyst</div>
    </div>
  </div>

  <!-- PAGE 2 -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="header-title-box">
          <h1>⚙️ SPARK ARCHITECTURE & ENGINE INTERNALS</h1>
          <p>Photon Native Engine, AQE Dynamic Optimization, Spark UI Triage & Skew Mastery</p>
        </div>
      </div>
      <div class="header-badges">
        <span class="badge badge-primary">AQE & Skew</span>
        <span class="badge badge-secondary">Spark UI Debugging</span>
        <span class="badge badge-dark">Photon C++</span>
      </div>
    </div>

    <div class="content-grid">
      <!-- Card 7: Databricks Photon Engine -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🚀 Databricks Photon Native Vectorized Engine</span>
          <span class="card-tag">Photon C++</span>
        </div>
        <pre class="code"><span class="cm"># Enable Photon Vectorized Acceleration in Databricks</span>
<span class="var">spark</span>.conf.set(<span class="str">"spark.databricks.photon.enabled"</span>, <span class="str">"true"</span>)

<span class="cm"># Vectorized Batch Size & Feature Toggles</span>
<span class="var">spark</span>.conf.set(<span class="str">"spark.databricks.photon.columnarExecution"</span>, <span class="str">"true"</span>)
<span class="var">spark</span>.conf.set(<span class="str">"spark.databricks.photon.scan.parquet"</span>, <span class="str">"true"</span>)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Hand-Optimized C++:</b> Replaces Java bytecode execution paths entirely with native C++ execution compiled for modern CPU architectures.</li>
            <li><b>SIMD Vectorization:</b> Processes columnar arrays in parallel CPU SIMD registers (Single Instruction, Multiple Data) on every clock cycle.</li>
            <li><b>Zero JVM GC Overhead:</b> Eliminates Java heap allocations for intermediate records, preventing JVM GC pause spikes during heavy aggregations.</li>
            <li><b>Accelerated Operations:</b> Accelerates Parquet scans, hash joins, sorting, higher-order functions, and string parsing by up to <b>5x</b>.</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          ⚡ <b>FinOps ROI:</b> Photon instances cost slightly more DBUs but deliver 3x-5x throughput, lowering the net total compute cost per pipeline run.
        </div>
      </div>

      <!-- Card 8: Adaptive Query Execution (AQE) -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🧠 Adaptive Query Execution (AQE) 3 Superpowers</span>
          <span class="card-tag">Adaptive Tuning</span>
        </div>
        <pre class="code"><span class="cm"># Enable Adaptive Query Execution Core & Features</span>
<span class="var">spark</span>.conf.set(<span class="str">"spark.sql.adaptive.enabled"</span>, <span class="str">"true"</span>)

<span class="cm"># 1. Dynamic Partition Coalescing (Merges small post-shuffle partitions)</span>
<span class="var">spark</span>.conf.set(<span class="str">"spark.sql.adaptive.coalescePartitions.enabled"</span>, <span class="str">"true"</span>)

<span class="cm"># 2. Dynamic Join Switching (SortMergeJoin -> BroadcastHashJoin)</span>
<span class="var">spark</span>.conf.set(<span class="str">"spark.sql.adaptive.autoBroadcastJoinThreshold"</span>, <span class="num">67108864</span>) <span class="cm"># 64MB</span>

<span class="cm"># 3. Dynamic Skew Join (Splits oversized partitions automatically)</span>
<span class="var">spark</span>.conf.set(<span class="str">"spark.sql.adaptive.skewJoin.enabled"</span>, <span class="str">"true"</span>)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Runtime Re-Optimization:</b> AQE inspects concrete stage output statistics at runtime shuffle boundaries to dynamically re-plan downstream stages.</li>
            <li><b>Partition Coalescing:</b> Combines thousands of small post-shuffle partitions into target ~128MB partitions, preventing task scheduling overload.</li>
            <li><b>Dynamic Join Switching:</b> If intermediate filtered tables turn out to be &lt;64MB, AQE converts SortMergeJoin to BroadcastHashJoin on the fly.</li>
            <li><b>Automatic Skew Join:</b> Detects skewed partitions (&gt;5x median size) and splits them into parallel sub-partitions to eliminate stragglers.</li>
          </ul>
        </div>
        <div class="alert alert-tip">
          💡 <b>Production Note:</b> AQE is enabled by default in Databricks Runtime 13+; always verify that skew join is active for heavy ETL pipelines.
        </div>
      </div>

      <!-- Card 9: Spark UI Diagnostic Playbook -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔍 Spark UI Diagnostic & Triage Playbook</span>
          <span class="card-tag">Diagnostics</span>
        </div>
        <pre class="code"><span class="cm"># Spark UI Metric Diagnosis Framework</span>
1. <b>Stages Tab & Timeline:</b> Look for straggler tasks (Max &gt;&gt; 75th percentile).
2. <b>Executors Tab:</b> Check GC Time percentage (Alert if GC Time &gt; 10%).
3. <b>Task Metrics:</b> Inspect Shuffle Spill (Memory) and Spill (Disk).
4. <b>SQL / Plan Tab:</b> Verify SortMergeJoin vs BroadcastHashJoin selection.</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Task Duration Skew:</b> If 199 tasks finish in 2 seconds but 1 task takes 10 minutes, you have severe key data skew in the shuffle stage.</li>
            <li><b>GC Time &gt; 10%:</b> Signals JVM heap pressure; reduce executor cores or enable off-heap memory to avoid pause cascades.</li>
            <li><b>Shuffle Spill Indicator:</b> Spill indicates partitions are larger than available execution RAM; increase <code>spark.sql.shuffle.partitions</code>.</li>
            <li><b>DAG Inspection:</b> Use the SQL tab DAG to find missing partition pruning filters or unexpected CartesianProduct operators.</li>
          </ul>
        </div>
        <div class="alert alert-warn">
          ⚠️ <b>Triage Playbook:</b> Always check the Stages tab first; identify the longest stage, then inspect task duration distribution to find bottlenecks.
        </div>
      </div>

      <!-- Card 10: Data Skew Troubleshooting Playbook -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⚠️ Data Skew Root Causes & Solutions</span>
          <span class="card-tag">Skew Remediation</span>
        </div>
        <pre class="code"><span class="cm"># Strategy: Separate Nulls & Extreme Hot-Keys</span>
<span class="var">df_non_null</span> = <span class="var">df_fact</span>.filter(<span class="cls">F</span>.col(<span class="str">"cust_id"</span>).isNotNull())
<span class="var">df_nulls</span> = <span class="var">df_fact</span>.filter(<span class="cls">F</span>.col(<span class="str">"cust_id"</span>).isNull())

<span class="cm"># Join clean data with dimension, then re-attach nulls without shuffle</span>
<span class="var">df_joined</span> = (<span class="var">df_non_null</span>
    .join(<span class="var">df_dim</span>, on=<span class="str">"cust_id"</span>, how=<span class="str">"left"</span>)
    .unionByName(<span class="var">df_nulls</span>.selectExpr(<span class="str">"* "</span>, <span class="str">"null as dim_col"</span>)))</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Root Cause:</b> High-frequency keys (e.g. <code>NULL</code> customer IDs, default dummy values like -1) hash into a single partition executor.</li>
            <li><b>Null Isolation:</b> Null values never match in inner/left joins; isolating nulls bypasses the shuffle hash collision entirely.</li>
            <li><b>Broadcast Join:</b> If one side of the join is &lt;8GB on large clusters, broadcasting it completely bypasses the shuffle exchange.</li>
            <li><b>Synthetic Salting:</b> Appending random integer suffixes (0–9) spreads skewed keys across 10 independent executors in parallel.</li>
          </ul>
        </div>
        <div class="alert alert-tip">
          💡 <b>Detection:</b> Run <code>df.groupBy("key").count().orderBy(F.desc("count")).show(10)</code> to identify high-cardinality skew keys.
        </div>
      </div>

      <!-- Card 11: Storage Levels & Persistence Matrix -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">💾 Storage Levels & Checkpoint Decision Matrix</span>
          <span class="card-tag">Persistence</span>
        </div>
        <pre class="code"><span class="cm"># persist() keeps DAG lineage for node failure recovery</span>
<span class="var">df_cached</span> = <span class="var">df</span>.persist(<span class="cls">StorageLevel</span>.MEMORY_AND_DISK_SER)

<span class="cm"># checkpoint() writes to ADLS and TRUNCATES lineage graph!</span>
<span class="var">spark</span>.sparkContext.setCheckpointDir(<span class="str">"abfss://chk@adls.dfs.core.windows.net/dag"</span>)
<span class="var">df_checkpointed</span> = <span class="var">df</span>.checkpoint(eager=<span class="kw">True</span>)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>persist():</b> Retains the full logical DAG lineage; if an executor fails, Spark recomputes only the missing partition from source.</li>
            <li><b>checkpoint():</b> Writes physical data to durable cloud storage and completely <b>truncates the lineage graph</b>.</li>
            <li><b>StackOverflow Prevention:</b> Mandatory in iterative machine learning loops (ALS, GraphX) and complex streaming joins to avoid DAG overflow.</li>
            <li><b>Storage Level Selection:</b> Use <code>MEMORY_AND_DISK_SER</code> in production to minimize JVM GC pauses while avoiding OOM spills.</li>
          </ul>
        </div>
        <div class="alert alert-sec">
          🔒 <b>Architect Rule:</b> Use <code>persist()</code> for reusing intermediate DataFrames in the same job; use <code>checkpoint()</code> to break huge recursive lineages.
        </div>
      </div>

      <!-- Card 12: JVM GC Tuning & Shuffle Math -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⚙️ JVM Garbage Collection (G1GC) & Shuffle Math</span>
          <span class="card-tag">Tuning Knobs</span>
        </div>
        <pre class="code"><span class="cm"># Production G1GC Flags for Databricks / Spark</span>
-XX:+UseG1GC
-XX:InitiatingHeapOccupancyPercent=35
-XX:G1ReservePercent=15
-XX:MaxGCPauseMillis=200

<span class="cm"># Optimal Shuffle Partitions Calculation Formula:</span>
<span class="cm"># Rule: Target 100MB - 200MB uncompressed per shuffle partition</span>
Total Shuffle Input Data = 64 GB (= 65,536 MB)
Target Partition Size = 128 MB
Optimal Partitions = 65,536 MB / 128 MB = <b>512 Partitions</b>
Config: spark.conf.set("spark.sql.shuffle.partitions", 512)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>G1GC Collector:</b> Partitions heap into 2048 regions; prioritizes garbage collection in regions containing mostly dead objects.</li>
            <li><b>InitiatingHeapOccupancyPercent (35%):</b> Starts concurrent marking earlier, preventing stop-the-world Full GC pause cascades.</li>
            <li><b>MaxGCPauseMillis (200ms):</b> Sets soft target pause duration for the JVM collector to balance throughput and latency.</li>
            <li><b>Shuffle Partition Math:</b> Oversized partitions (&gt;500MB) cause OOM spills; undersized partitions (&lt;10MB) introduce scheduling overhead.</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          ⚡ <b>AQE Advisory Size:</b> Set <code>spark.sql.adaptive.advisoryPartitionSizeInBytes = 134217728</code> (128MB) for automatic post-shuffle partition sizing.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="page-footer-left">
        <span>Santosh Jammi | Principal Data Architect</span>
        <span>•</span>
        <span>Databricks Lakehouse Cheat Sheet Series</span>
      </div>
      <div class="page-footer-right">Page 2 of 2 — Photon, AQE, Spark UI & Diagnostics</div>
    </div>
  </div>
"""

# ==============================================================================
# 4. PYTHON IN DATABRICKS TEMPLATE (12 CARDS)
# ==============================================================================
PYTHON_BODY = """
  <!-- PAGE 1 -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="header-title-box">
          <h1>🐍 PYTHON IN DATABRICKS CHEAT SHEET</h1>
          <p>Production Reference: DBUtils, Delta Live Tables (DLT), pandas on Spark, SDK & Magic Commands</p>
        </div>
      </div>
      <div class="header-badges">
        <span class="badge badge-primary">Python 3.10+</span>
        <span class="badge badge-secondary">DBUtils</span>
        <span class="badge badge-dark">Delta Live Tables</span>
        <span class="badge badge-accent">Databricks SDK</span>
      </div>
    </div>

    <div class="content-grid">
      <!-- Card 1: dbutils Reference -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🧰 dbutils Master Reference (fs, secrets, notebook)</span>
          <span class="card-tag">Databricks Utilities</span>
        </div>
        <pre class="code"><span class="cm"># 1. File System Operations (Cloud Storage Navigation)</span>
<span class="var">files</span> = <span class="var">dbutils</span>.fs.ls(<span class="str">"/Volumes/prod_catalog/raw_landing/"</span>)
<span class="var">dbutils</span>.fs.mv(<span class="str">"/tmp/source.csv"</span>, <span class="str">"/mnt/datalake/destination.csv"</span>)

<span class="cm"># 2. Secret Management (Azure Key Vault / AWS Secrets Manager)</span>
<span class="var">api_token</span> = <span class="var">dbutils</span>.secrets.get(scope=<span class="str">"kv_fin_prod"</span>, key=<span class="str">"payment_gateway_key"</span>)

<span class="cm"># 3. Parameterized Widgets (Pass arguments to notebooks)</span>
<span class="var">dbutils</span>.widgets.text(<span class="str">"env"</span>, <span class="str">"prod"</span>, <span class="str">"Environment"</span>)
<span class="var">current_env</span> = <span class="var">dbutils</span>.widgets.get(<span class="str">"env"</span>)

<span class="cm"># 4. Notebook Workflow Orchestration & Parameter Passing</span>
<span class="var">result</span> = <span class="var">dbutils</span>.notebook.run(<span class="str">"sub_etl"</span>, timeout_seconds=<span class="num">1800</span>, arguments={<span class="str">"batch_id"</span>: <span class="str">"102"</span>})
<span class="var">dbutils</span>.notebook.exit(<span class="str">'{"status": "SUCCESS", "records": 45000}'</span>)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>dbutils.fs:</b> Interacts directly with ADLS/S3 storage drivers, abstracting distributed cloud credentials and API calls.</li>
            <li><b>dbutils.secrets.get():</b> Redacts sensitive API keys and database credentials automatically from notebook outputs and cluster logs.</li>
            <li><b>dbutils.widgets:</b> Injects runtime parameters into notebook cells from Airflow, Azure Data Factory, or Databricks Workflows.</li>
            <li><b>dbutils.notebook.exit():</b> Serializes structured JSON return payloads back to parent workflow orchestrators.</li>
          </ul>
        </div>
        <div class="alert alert-sec">
          🔒 <b>Security Hardening:</b> Never hardcode secrets in notebooks; always configure Unity Catalog Secret Scopes with Key Vault backing.
        </div>
      </div>

      <!-- Card 2: Delta Live Tables (DLT) -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🧱 Delta Live Tables (DLT) Declarative Pipelines</span>
          <span class="card-tag">Declarative ETL</span>
        </div>
        <pre class="code"><span class="kw">import</span> dlt
<span class="kw">from</span> pyspark.sql.functions <span class="kw">import</span> col, expr

<span class="kw">@dlt.table</span>(
    name=<span class="str">"bronze_raw_txns"</span>,
    comment=<span class="str">"Raw incremental streaming transactions"</span>
)
<span class="kw">def</span> bronze_txns():
    <span class="kw">return</span> (<span class="var">spark</span>.readStream.format(<span class="str">"cloudFiles"</span>)
            .option(<span class="str">"cloudFiles.format"</span>, <span class="str">"json"</span>)
            .load(<span class="str">"/Volumes/prod/raw/txns"</span>))

<span class="kw">@dlt.table</span>(name=<span class="str">"silver_clean_txns"</span>)
<span class="kw">@dlt.expect_or_drop</span>(<span class="str">"valid_amount"</span>, <span class="str">"amount &gt; 0"</span>)
<span class="kw">@dlt.expect_or_fail</span>(<span class="str">"valid_id"</span>, <span class="str">"txn_id IS NOT NULL"</span>)
<span class="kw">def</span> silver_txns():
    <span class="kw">return</span> <span class="var">dlt</span>.read_stream(<span class="str">"bronze_raw_txns"</span>).filter(col(<span class="str">"status"</span>) == <span class="str">"SETTLED"</span>)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>@dlt.table:</b> Declares a managed Delta table; DLT constructs the global DAG dependency graph and manages cluster provisioning.</li>
            <li><b>dlt.read_stream():</b> Binds streaming table dependencies, propagating schema changes and updates through the Medallion architecture.</li>
            <li><b>@dlt.expect_or_drop:</b> Enforces data quality rules; drops invalid rows while recording violation metrics in the pipeline event log.</li>
            <li><b>@dlt.expect_or_fail:</b> Halts pipeline execution immediately if critical schema or business invariants are breached.</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          ⚡ <b>Serverless DLT:</b> Serverless DLT pipelines eliminate cluster spin-up time and dynamically allocate compute as streaming queues fluctuate.
        </div>
      </div>

      <!-- Card 3: Streaming CDC with dlt.apply_changes() -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔄 Streaming CDC with dlt.apply_changes() (SCD 1 & 2)</span>
          <span class="card-tag">Change Data Capture</span>
        </div>
        <pre class="code"><span class="kw">import</span> dlt

<span class="cm"># Declare destination streaming table</span>
<span class="var">dlt</span>.create_streaming_table(<span class="str">"silver_dim_customers"</span>)

<span class="cm"># Turnkey Slowly Changing Dimension (SCD Type 2)</span>
<span class="var">dlt</span>.apply_changes(
    target=<span class="str">"silver_dim_customers"</span>,
    source=<span class="str">"bronze_cdc_customers"</span>,
    keys=[<span class="str">"customer_id"</span>],
    sequence_by=<span class="str">"operation_timestamp"</span>,
    apply_as_deletes=col(<span class="str">"op_type"</span>) == <span class="str">"D"</span>,
    except_column_list=[<span class="str">"op_type"</span>, <span class="str">"ingested_at"</span>],
    stored_as_scd_type=<span class="num">2</span> <span class="cm"># 1 = In-Place Overwrite; 2 = Historical Tracking</span>
)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>dlt.apply_changes():</b> Native declarative CDC engine supporting out-of-order Debezium / Fivetran / Oracle GoldenGate events.</li>
            <li><b>sequence_by:</b> Monotonic sequence key or timestamp ensuring out-of-order CDC packets are resolved deterministically.</li>
            <li><b>stored_as_scd_type=2:</b> Automatically maintains validity tracking columns: <code>__START_AT</code>, <code>__END_AT</code>, and active flags.</li>
            <li><b>apply_as_deletes:</b> Evaluates soft or hard delete operations, setting <code>__END_AT</code> without physically corrupting history.</li>
          </ul>
        </div>
        <div class="alert alert-tip">
          💡 <b>SCD Type 1 vs 2:</b> Use SCD 1 for current-state lookup dimensions; use SCD 2 for point-in-time compliance and financial audits.
        </div>
      </div>

      <!-- Card 4: Pandas API on Spark -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🐼 Pandas API on Spark (pyspark.pandas as ps)</span>
          <span class="card-tag">Distributed Pandas</span>
        </div>
        <pre class="code"><span class="kw">import</span> pyspark.pandas <span class="kw">as</span> ps

<span class="cm"># 100% Pandas Syntax executed across distributed Spark Cluster!</span>
<span class="var">psdf</span> = <span class="var">ps</span>.read_parquet(<span class="str">"abfss://silver@adls.dfs.core.windows.net/orders"</span>)

<span class="cm"># High-level analytical calculations with no PySpark boilerplate</span>
<span class="var">psdf</span>[<span class="str">"tax"</span>] = <span class="var">psdf</span>[<span class="str">"amount"</span>] * <span class="num">0.18</span>
<span class="var">summary</span> = <span class="var">psdf</span>.groupby(<span class="str">"region"</span>)[<span class="str">"amount"</span>].agg([<span class="str">"mean"</span>, <span class="str">"sum"</span>, <span class="str">"std"</span>])

<span class="cm"># Seamless Two-Way Conversion</span>
<span class="var">spark_df</span> = <span class="var">psdf</span>.to_spark()
<span class="var">ps_df_again</span> = <span class="var">spark_df</span>.to_pandas_on_spark()</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Distributed Pandas:</b> Translates standard Pandas method invocations directly into distributed Spark Catalyst query execution plans.</li>
            <li><b>No Driver Memory Limit:</b> Unlike native Pandas, data remains distributed across worker executor memory; processes 100GB+ seamlessly.</li>
            <li><b>to_spark() / to_pandas_on_spark():</b> Zero-copy conversion between PySpark DataFrames and Pandas-on-Spark representations.</li>
            <li><b>Index Management:</b> Uses default distributed indexing; avoid setting sequential range indexes on huge datasets to prevent sorting shuffles.</li>
          </ul>
        </div>
        <div class="alert alert-warn">
          ⚠️ <b>Anti-Pattern:</b> Avoid calling <code>.to_pandas()</code> or <code>.iloc</code> on large DataFrames as it pulls all distributed data into driver RAM, risking OOM!
        </div>
      </div>

      <!-- Card 5: Databricks Connect v2 & Databricks SDK -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔌 Databricks Connect v2 & Databricks Python SDK</span>
          <span class="card-tag">Developer Tooling</span>
        </div>
        <pre class="code"><span class="cm"># Databricks Connect v2 (Local IDE to Remote Cluster over gRPC)</span>
<span class="kw">from</span> databricks.connect <span class="kw">import</span> <span class="cls">DatabricksSession</span>
<span class="var">spark</span> = <span class="cls">DatabricksSession</span>.builder.getOrCreate()
<span class="var">df</span> = <span class="var">spark</span>.read.table(<span class="str">"prod_catalog.silver.transactions"</span>)
<span class="var">df</span>.filter(<span class="str">"amount &gt; 1000"</span>).show()

<span class="cm"># Databricks Python SDK (Workspace Automation)</span>
<span class="kw">from</span> databricks.sdk <span class="kw">import</span> <span class="cls">WorkspaceClient</span>
<span class="var">w</span> = <span class="cls">WorkspaceClient</span>()
<span class="var">run</span> = <span class="var">w</span>.jobs.run_now(job_id=<span class="num">892145</span>)
<span class="var">clusters</span> = <span class="var">w</span>.clusters.list()</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Databricks Connect v2:</b> Built on the open-source Spark Connect protocol; local Python code runs thin clients over secure gRPC to remote clusters.</li>
            <li><b>Local IDE Debugging:</b> Set breakpoints in VS Code or PyCharm, step through code interactively, and execute against production cluster data.</li>
            <li><b>WorkspaceClient:</b> Official SDK managing all Databricks REST API endpoints: Jobs, Clusters, Unity Catalog, Warehouses, and Secrets.</li>
            <li><b>Unified Authentication:</b> Automatically resolves credentials from environment variables (<code>DATABRICKS_HOST</code>, <code>DATABRICKS_TOKEN</code>) or Azure CLI.</li>
          </ul>
        </div>
        <div class="alert alert-tip">
          💡 <b>Thin Client:</b> Databricks Connect v2 sends unresolved DataFrame plans via gRPC; execution runs entirely on the remote Databricks cluster.
        </div>
      </div>

      <!-- Card 6: Magic Commands & Notebook Scoping -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🪄 Databricks Magic Commands & Scoping</span>
          <span class="card-tag">Notebook Magic</span>
        </div>
        <pre class="code"><span class="cm"># 1. SQL Magic & Accessing Results in Python</span>
<span class="kw">%sql</span>
<span class="kw">SELECT</span> customer_id, <span class="fn">SUM</span>(amount) <span class="kw">AS</span> total <span class="kw">FROM</span> silver.orders <span class="kw">GROUP BY</span> customer_id

<span class="cm"># Access SQL query output in next Python cell:</span>
<span class="var">sql_df</span> = <span class="var">_sqldf</span>.filter(<span class="str">"total &gt; 5000"</span>)

<span class="cm"># 2. Ephemeral Environment Setup</span>
<span class="kw">%pip install</span> pydantic==<span class="num">2.8.2</span> tenacity==<span class="num">8.4.1</span>

<span class="cm"># 3. Modular File Execution</span>
<span class="kw">%run</span> ./common_utilities_notebook</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>%sql & _sqldf:</b> Running a <code>%sql</code> cell automatically binds the output DataFrame to the <code>_sqldf</code> variable in downstream Python cells.</li>
            <li><b>%pip:</b> Installs isolated dependencies onto the cluster driver and worker environments for the duration of the notebook session only.</li>
            <li><b>%run:</b> Executes external shared notebooks in-line, inheriting functions, imports, and variables directly into the current notebook session.</li>
            <li><b>%sh & %fs:</b> Executes bash commands inside the driver container and navigates storage volumes via command-line utilities.</li>
          </ul>
        </div>
        <div class="alert alert-sec">
          🔒 <b>%run vs dbutils.notebook.run:</b> <code>%run</code> shares memory & variables in the same session; <code>dbutils.notebook.run</code> executes in an isolated ephemeral job context.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="page-footer-left">
        <span>Santosh Jammi | Principal Data Architect</span>
        <span>•</span>
        <span>Databricks Lakehouse Cheat Sheet Series</span>
      </div>
      <div class="page-footer-right">Page 1 of 2 — DBUtils, DLT, SDK & Magic</div>
    </div>
  </div>

  <!-- PAGE 2 -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="header-title-box">
          <h1>🐍 PYTHON IN DATABRICKS CHEAT SHEET</h1>
          <p>Wheels, Databricks Asset Bundles (DABs), Observability, Resilience, Types & Unit Testing</p>
        </div>
      </div>
      <div class="header-badges">
        <span class="badge badge-primary">DABs / CI/CD</span>
        <span class="badge badge-secondary">Production Wheels</span>
        <span class="badge badge-dark">Observability</span>
      </div>
    </div>

    <div class="content-grid">
      <!-- Card 7: Packaging, Python Wheels & Volumes -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📦 Wheels & Unity Catalog Volumes</span>
          <span class="card-tag">Packaging</span>
        </div>
        <pre class="code"><span class="cm"># In-Notebook ephemeral dependency install</span>
<span class="kw">%pip install</span> pydantic==<span class="num">2.8.2</span> tenacity==<span class="num">8.4.1</span>

<span class="cm"># Production Wheel Distribution via Unity Catalog Volumes</span>
<span class="cm"># Store built wheel in governed volume:</span>
<span class="cm"># /Volumes/prod_catalog/core_libs/my_etl-1.2.0-py3-none-any.whl</span>
<span class="kw">%pip install</span> /Volumes/prod_catalog/core_libs/my_etl-<span class="num">1.2.0</span>-py3-none-any.whl

<span class="cm"># Import modular reusable package in notebook</span>
<span class="kw">from</span> my_etl.transformers <span class="kw">import</span> BankingNormalizer
<span class="var">normalizer</span> = BankingNormalizer(currency=<span class="str">"EUR"</span>)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Unity Catalog Volumes:</b> Governed storage locations in cloud storage supporting file-level RBAC, audit logging, and binary package versioning.</li>
            <li><b>Custom Wheels (.whl):</b> Package enterprise business logic into modular Python wheels to enforce automated CI/CD unit testing and release tagging.</li>
            <li><b>Cluster Libraries:</b> Attach volume paths to cluster configurations or Job task dependencies to pre-install packages across worker nodes.</li>
            <li><b>Zero DBFS Root:</b> Completely replaces insecure legacy DBFS root paths with enterprise-governed Unity Catalog storage locations.</li>
          </ul>
        </div>
        <div class="alert alert-tip">
          💡 <b>Volumes for Libraries:</b> Replacing legacy DBFS root with Unity Catalog Volumes ensures strict access control and auditing for third-party binary artifacts.
        </div>
      </div>

      <!-- Card 8: Databricks Asset Bundles (DABs) -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🚀 Databricks Asset Bundles (DABs) CI/CD</span>
          <span class="card-tag">DevOps</span>
        </div>
        <pre class="code"><span class="cm"># databricks.yml definition snippet</span>
bundle:
  name: bfsi_settlement_pipeline

targets:
  dev:
    workspace:
      host: https://adb-dev.azuredatabricks.net
  prod:
    workspace:
      host: https://adb-prod.azuredatabricks.net

resources:
  jobs:
    nightly_settlement:
      name: <span class="str">"[prod] Nightly Settlement Job"</span>
      tasks:
        - task_key: run_dlt
          pipeline_task:
            pipeline_id: 489a-bc12-dlt-id</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Infrastructure-as-Code (IaC):</b> Declaratively defines Databricks workflows, notebooks, DLT pipelines, and permissions in source-controlled YAML.</li>
            <li><b>Multi-Environment:</b> <code>targets: dev / prod</code> abstracts workspace host URLs and cluster settings, enabling clean promotion across stages.</li>
            <li><b>CLI Commands:</b> <code>databricks bundle validate</code> (linting), <code>bundle deploy -t prod</code> (deployment), and <code>bundle run</code> (execution).</li>
            <li><b>GitHub Actions / Azure DevOps:</b> Integrates directly into CI/CD runners using service principals without manual workspace UI clicking.</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          ⚡ <b>Modern DevOps:</b> Databricks Asset Bundles (DABs) are the standard for deploying enterprise data engineering projects in 2025/2026.
        </div>
      </div>

      <!-- Card 9: Structured Logging & Observability -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📊 Structured Logging & Observability</span>
          <span class="card-tag">Observability</span>
        </div>
        <pre class="code"><span class="kw">import</span> json, logging
<span class="kw">from</span> datetime <span class="kw">import</span> datetime

<span class="kw">class</span> <span class="cls">StructuredPipelineLogger</span>:
    <span class="kw">def</span> __init__(<span class="var">self</span>, pipeline_name: str):
        <span class="var">self</span>.name = pipeline_name

    <span class="kw">def</span> log_event(<span class="var">self</span>, event_name: str, records: int, duration_sec: float):
        payload = {
            <span class="str">"timestamp"</span>: datetime.utcnow().isoformat(),
            <span class="str">"pipeline"</span>: <span class="var">self</span>.name,
            <span class="str">"event"</span>: event_name,
            <span class="str">"records_processed"</span>: records,
            <span class="str">"duration_sec"</span>: duration_sec
        }
        <span class="fn">print</span>(json.dumps(payload)) <span class="cm"># Ingested into Azure Log Analytics</span>

<span class="var">audit</span> = StructuredPipelineLogger(<span class="str">"SEPA_Payment_Processor"</span>)
<span class="var">audit</span>.log_event(<span class="str">"STAGE_COMPLETED"</span>, records=<span class="num">845000</span>, duration_sec=<span class="num">14.2</span>)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Single-Line JSON:</b> Emitting serialized JSON to standard stdout ensures cloud observability scrapers (Datadog, Splunk, Azure Log Analytics) parse attributes automatically.</li>
            <li><b>Metrics Tracking:</b> Records throughput metrics, processing duration, and stage identifiers for SLI/SLA compliance monitoring.</li>
            <li><b>Distributed Driver Scoping:</b> Instantiated on the driver node to capture macro-level stage completions and pipeline milestones.</li>
            <li><b>Alerting Triggers:</b> Enables automated incident triggers when duration spikes above historical 95th percentile thresholds.</li>
          </ul>
        </div>
        <div class="alert alert-sec">
          🔒 <b>Enterprise Standard:</b> Standardized JSON logging links cluster run IDs and pipeline commits directly into enterprise monitoring dashboards.
        </div>
      </div>

      <!-- Card 10: Concurrency, API Ingestion & Retries -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔄 Concurrent Extraction & Exponential Retries</span>
          <span class="card-tag">Resilience</span>
        </div>
        <pre class="code"><span class="kw">from</span> concurrent.futures <span class="kw">import</span> ThreadPoolExecutor
<span class="kw">from</span> tenacity <span class="kw">import</span> retry, stop_after_attempt, wait_exponential

<span class="kw">@retry</span>(stop=stop_after_attempt(<span class="num">3</span>), wait=wait_exponential(multiplier=<span class="num">1</span>, min=<span class="num">2</span>, max=<span class="num">10</span>))
<span class="kw">def</span> fetch_api_page(page_id: int) -&gt; dict:
    <span class="cm"># Resilient REST API caller with exponential backoff</span>
    <span class="kw">return</span> {<span class="str">"page"</span>: page_id, <span class="str">"data"</span>: [<span class="num">1</span>, <span class="num">2</span>, <span class="num">3</span>]}

<span class="cm"># Parallelize lightweight I/O on Driver before Spark processing</span>
<span class="kw">with</span> ThreadPoolExecutor(max_workers=<span class="num">8</span>) <span class="kw">as</span> executor:
    <span class="var">results</span> = list(executor.map(fetch_api_page, range(<span class="num">1</span>, <span class="num">50</span>)))

<span class="var">df_api</span> = <span class="var">spark</span>.createDataFrame(<span class="var">results</span>)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>Driver Multithreading:</b> Uses Python <code>ThreadPoolExecutor</code> on the driver node to parallelize I/O-bound REST API web requests efficiently.</li>
            <li><b>tenacity @retry:</b> Catches transient HTTP 429 rate-limiting and 503 gateway timeout exceptions, backing off exponentially before retrying.</li>
            <li><b>createDataFrame():</b> Converts accumulated JSON page dictionaries into a distributed PySpark DataFrame across worker executors.</li>
            <li><b>Separation of Concerns:</b> Use Python threads for I/O fetching; use Spark distributed partitions for data transformations and writes.</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          ⚡ <b>Thread Concurrency:</b> Use Python <code>ThreadPoolExecutor</code> on the driver for I/O-bound REST calls, then parallelize the dataset with <code>spark.createDataFrame()</code>.
        </div>
      </div>

      <!-- Card 11: Type Annotations & Pre-Flight Schema Contracts -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🛡️ Type Annotations & Schema Contracts</span>
          <span class="card-tag">Data Quality</span>
        </div>
        <pre class="code"><span class="kw">from</span> pyspark.sql <span class="kw">import</span> DataFrame, Column
<span class="kw">from</span> typing <span class="kw">import</span> Callable

<span class="kw">def</span> apply_curation(
    df: DataFrame,
    primary_key: str,
    business_rule: Callable[[Column], Column]
) -&gt; DataFrame:
    <span class="cm"># Pre-flight contract validation</span>
    <span class="kw">assert</span> primary_key <span class="kw">in</span> df.columns, f<span class="str">"Missing required key: {primary_key}"</span>
    <span class="kw">return</span> df.filter(business_rule(df[primary_key]))</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>PEP 484 Typing:</b> Explicitly annotates PySpark DataFrames, Columns, and function callables to enable static type analysis with <code>mypy</code>.</li>
            <li><b>Pre-Flight Assertions:</b> Validates input schemas before submitting heavy distributed compute jobs, failing in 10ms instead of 2 hours later.</li>
            <li><b>Higher-Order Parameterization:</b> Accepts Column lambda functions (<code>Callable[[Column], Column]</code>) for modular rule composition.</li>
            <li><b>Documentation Integrity:</b> Serves as self-documenting code contracts across enterprise data engineering squads.</li>
          </ul>
        </div>
        <div class="alert alert-tip">
          💡 <b>Fail Fast:</b> Pre-flight contract validation prevents pipelines from burning expensive compute hours on downstream schema errors.
        </div>
      </div>

      <!-- Card 12: Unit Testing PySpark Pipelines in CI/CD -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🧪 Unit Testing PySpark Pipelines in CI/CD</span>
          <span class="card-tag">Testing</span>
        </div>
        <pre class="code"><span class="kw">import</span> pytest
<span class="kw">from</span> pyspark.testing.utils <span class="kw">import</span> assertDataFrameEqual

<span class="kw">def</span> test_filter_active(spark):
    input_data = [(<span class="num">1</span>, <span class="str">"ACTIVE"</span>), (<span class="num">2</span>, <span class="str">"CANCELLED"</span>)]
    input_df = spark.createDataFrame(input_data, [<span class="str">"id"</span>, <span class="str">"status"</span>])
    
    expected_data = [(<span class="num">1</span>, <span class="str">"ACTIVE"</span>)]
    expected_df = spark.createDataFrame(expected_data, [<span class="str">"id"</span>, <span class="str">"status"</span>])
    
    result_df = input_df.filter(<span class="str">"status = 'ACTIVE'"</span>)
    <span class="cm"># Spark 3.5+ built-in test assertion</span>
    assertDataFrameEqual(result_df, expected_df)</pre>
        <div class="code-explain">
          <div class="explain-head">🔍 Code Breakdown & Engine Mechanics:</div>
          <ul class="explain-list">
            <li><b>assertDataFrameEqual:</b> Built into PySpark 3.5+; compares distributed DataFrames, ignoring row ordering and providing detailed schema diffs.</li>
            <li><b>Tolerance Support:</b> Supports <code>atol</code> and <code>rtol</code> arguments to accommodate floating-point precision differences across environments.</li>
            <li><b>Zero External Dependencies:</b> Eliminates third-party test libraries (e.g. <code>chispa</code>), simplifying GitHub Actions / Azure DevOps CI runners.</li>
            <li><b>Pytest Fixtures:</b> Pass a shared session-scoped <code>spark</code> fixture to run unit test suites locally in under 5 seconds.</li>
          </ul>
        </div>
        <div class="alert alert-perf">
          ⚡ <b>CI/CD Speed:</b> Run PySpark unit tests using local mode (<code>local[2]</code>) in CI runners to validate logic prior to deploying Asset Bundles.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="page-footer-left">
        <span>Santosh Jammi | Principal Data Architect</span>
        <span>•</span>
        <span>Databricks Lakehouse Cheat Sheet Series</span>
      </div>
      <div class="page-footer-right">Page 2 of 2 — Wheels, DABs, Observability, Types & Testing</div>
    </div>
  </div>
"""

# ==============================================================================
# GENERATOR FUNCTIONS
# ==============================================================================
def generate_full_html(title, theme_color, title_color, body_content):
    css = get_base_css(theme_color=theme_color, title_color=title_color)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<style>{css}</style>
</head>
<body>
{body_content}
</body>
</html>"""

def compile_pdf(html_path, pdf_path):
    print(f"Compiling PDF: {os.path.basename(html_path)} -> {os.path.basename(pdf_path)}...")
    cmd = [
        CHROME_BIN,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        "--allow-file-access-from-files",
        f"--print-to-pdf={pdf_path}",
        html_path
    ]
    subprocess.run(cmd, check=True)
    size_kb = os.path.getsize(pdf_path) / 1024
    print(f"  ✓ Created {os.path.basename(pdf_path)} ({size_kb:.1f} KB)")

def render_images(pdf_path, prefix, dpi=250):
    print(f"Rendering high-res images from {os.path.basename(pdf_path)} at {dpi} DPI...")
    doc = fitz.open(pdf_path)
    page_images = []
    
    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=dpi)
        img_name = f"{prefix}_page_{i+1}.png"
        img_path = os.path.join(IMG_DIR, img_name)
        pix.save(img_path)
        page_images.append(img_path)
        print(f"  ✓ Rendered Page {i+1}: {img_name} ({pix.width}x{pix.height})")
    
    # If 2 pages, create side-by-side poster
    if len(page_images) == 2:
        poster_name = f"{prefix}_poster.png"
        poster_path = os.path.join(IMG_DIR, poster_name)
        img1 = Image.open(page_images[0])
        img2 = Image.open(page_images[1])
        
        # side-by-side stitch with gap
        gap = 30
        total_width = img1.width + img2.width + gap
        max_height = max(img1.height, img2.height)
        
        poster = Image.new("RGB", (total_width, max_height), color=(8, 12, 21))
        poster.paste(img1, (0, 0))
        poster.paste(img2, (img1.width + gap, 0))
        poster.save(poster_path, quality=95)
        print(f"  ✓ Created Side-by-Side Panoramic Poster: {poster_name} ({total_width}x{max_height})")

def generate_index_html():
    html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Databricks Architecture & Coding Cheat Sheets Hub</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #090d16;
    color: #e2e8f0;
    font-family: 'Inter', sans-serif;
    padding: 30px 20px;
  }
  .container { max-width: 1200px; margin: 0 auto; }
  header {
    text-align: center;
    margin-bottom: 40px;
    border-bottom: 1px solid #1e293b;
    padding-bottom: 25px;
  }
  header h1 {
    font-family: 'Outfit', sans-serif;
    font-size: 32px;
    color: #fff;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
  }
  header p { color: #94a3b8; font-size: 14px; }
  .badges { display: flex; justify-content: center; gap: 10px; margin-top: 15px; }
  .badge { background: #1e293b; color: #38bdf8; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1px solid #334155; }
  .badge-orange { background: rgba(255, 54, 33, 0.15); color: #ff3621; border-color: rgba(255, 54, 33, 0.3); }
  
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }
  .card {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s, border-color 0.2s;
    display: flex;
    flex-direction: column;
  }
  .card:hover { transform: translateY(-3px); border-color: #38bdf8; }
  .card-img-wrap {
    height: 180px;
    overflow: hidden;
    background: #040711;
    border-bottom: 1px solid #1e293b;
    position: relative;
  }
  .card-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    transition: transform 0.3s;
  }
  .card:hover .card-img-wrap img { transform: scale(1.03); }
  .card-body { padding: 18px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
  .card-title { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
  .card-desc { font-size: 12.5px; color: #94a3b8; line-height: 1.4; margin-bottom: 16px; }
  .card-actions { display: flex; gap: 10px; }
  .btn {
    flex: 1;
    text-align: center;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.2s;
  }
  .btn-primary { background: #ff3621; color: #fff; }
  .btn-primary:hover { background: #e02f1d; }
  .btn-secondary { background: #1e293b; color: #38bdf8; border: 1px solid #334155; }
  .btn-secondary:hover { background: #334155; }

  .master-banner {
    background: linear-gradient(135deg, rgba(255, 54, 33, 0.1) 0%, rgba(56, 189, 248, 0.1) 100%);
    border: 1px solid rgba(255, 54, 33, 0.3);
    border-radius: 12px;
    padding: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    flex-wrap: wrap;
    gap: 20px;
  }
  .master-info h2 { font-size: 20px; color: #fff; margin-bottom: 6px; }
  .master-info p { color: #94a3b8; font-size: 13px; max-width: 650px; }
  .master-btn { background: #ff3621; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; }
  .master-btn:hover { background: #e02f1d; }

  footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 50px; border-top: 1px solid #1e293b; padding-top: 20px; }
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>Databricks Architecture & Coding Cheat Sheets Hub</h1>
    <p>High-Density Production Reference Manuals for Principal Data Architects & Senior Engineers</p>
    <div class="badges">
      <span class="badge badge-orange">Databricks 15.4 / 16.0 LTS</span>
      <span class="badge">Unity Catalog 3-Level Namespace</span>
      <span class="badge">Photon C++ Engine</span>
      <span class="badge">Delta Lake 3.x ACID</span>
    </div>
  </header>

  <div class="master-banner">
    <div class="master-info">
      <h2>📘 Databricks Master Unified Cheat Sheet (8-Page Manual)</h2>
      <p>All four domains bound into a single comprehensive, print-ready document with high-density code blocks, detailed mechanics explanations, and performance tuning rules.</p>
    </div>
    <a href="../pdf/databricks_master_cheatsheet.pdf" download class="master-btn">Download Master PDF (8 Pages)</a>
  </div>

  <div class="grid">
    <!-- Card 1: Spark SQL -->
    <div class="card">
      <div class="card-img-wrap">
        <a href="../images/databricks_sparksql_poster.png" target="_blank"><img src="../images/databricks_sparksql_page_1.png" alt="Spark SQL Cheat Sheet"></a>
      </div>
      <div class="card-body">
        <div>
          <div class="card-title">⚡ Spark SQL</div>
          <div class="card-desc">12 Cards: DDL, Liquid Clustering, Delta MERGE INTO, QUALIFY Deduplication, Higher-Order Functions, Row Filters & Tuning.</div>
        </div>
        <div class="card-actions">
          <a href="../pdf/databricks_sparksql_cheatsheet.pdf" download class="btn btn-primary">PDF (2 Pages)</a>
          <a href="../images/databricks_sparksql_poster.png" target="_blank" class="btn btn-secondary">Wall Poster</a>
        </div>
      </div>
    </div>

    <!-- Card 2: PySpark -->
    <div class="card">
      <div class="card-img-wrap">
        <a href="../images/databricks_pyspark_poster.png" target="_blank"><img src="../images/databricks_pyspark_page_1.png" alt="PySpark Cheat Sheet"></a>
      </div>
      <div class="card-body">
        <div>
          <div class="card-title">⚡ PySpark DataFrame API</div>
          <div class="card-desc">12 Cards: Strict Schemas, Standard Functions, Broadcast & Salting, Delta API, Auto Loader Streaming & Arrow UDFs.</div>
        </div>
        <div class="card-actions">
          <a href="../pdf/databricks_pyspark_cheatsheet.pdf" download class="btn btn-primary">PDF (2 Pages)</a>
          <a href="../images/databricks_pyspark_poster.png" target="_blank" class="btn btn-secondary">Wall Poster</a>
        </div>
      </div>
    </div>

    <!-- Card 3: Spark Core -->
    <div class="card">
      <div class="card-img-wrap">
        <a href="../images/databricks_spark_core_poster.png" target="_blank"><img src="../images/databricks_spark_core_page_1.png" alt="Spark Core Cheat Sheet"></a>
      </div>
      <div class="card-body">
        <div>
          <div class="card-title">⚙️ Spark Core & Architecture</div>
          <div class="card-desc">12 Cards: Topography, JVM Unified Memory, Shuffle Spill, Catalyst Optimizer, Cluster Sizing Formula, Photon & AQE.</div>
        </div>
        <div class="card-actions">
          <a href="../pdf/databricks_spark_core_cheatsheet.pdf" download class="btn btn-primary">PDF (2 Pages)</a>
          <a href="../images/databricks_spark_core_poster.png" target="_blank" class="btn btn-secondary">Wall Poster</a>
        </div>
      </div>
    </div>

    <!-- Card 4: Python in Databricks -->
    <div class="card">
      <div class="card-img-wrap">
        <a href="../images/databricks_python_poster.png" target="_blank"><img src="../images/databricks_python_page_1.png" alt="Python in Databricks Cheat Sheet"></a>
      </div>
      <div class="card-body">
        <div>
          <div class="card-title">🐍 Python in Databricks</div>
          <div class="card-desc">12 Cards: DBUtils, Delta Live Tables (DLT), CDC apply_changes, Pandas on Spark, DABs CI/CD & Unit Testing.</div>
        </div>
        <div class="card-actions">
          <a href="../pdf/databricks_python_cheatsheet.pdf" download class="btn btn-primary">PDF (2 Pages)</a>
          <a href="../images/databricks_python_poster.png" target="_blank" class="btn btn-secondary">Wall Poster</a>
        </div>
      </div>
    </div>
  </div>

  <footer>
    <p>Generated by Santosh Jammi | Principal Data Architect • Databricks Production Series 2026</p>
  </footer>
</div>
</body>
</html>"""
    path = os.path.join(HTML_DIR, "index.html")
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"✓ Generated Interactive Hub: {path}")

def main():
    print("=" * 70)
    print("DATABRICKS CHEAT SHEETS GENERATOR - ULTRA HIGH-DENSITY EDITION")
    print("Reworked Layout: Zero Unused Space & Code Explanations Below Every Block")
    print("=" * 70)

    sheets = [
        {
            "name": "sparksql",
            "title": "Databricks Spark SQL Cheat Sheet",
            "theme": "#ff3621",
            "title_color": "#38bdf8",
            "body": SPARKSQL_BODY,
            "prefix": "databricks_sparksql",
            "pdf_name": "databricks_sparksql_cheatsheet.pdf"
        },
        {
            "name": "pyspark",
            "title": "Databricks PySpark Cheat Sheet",
            "theme": "#e25a1c",
            "title_color": "#38bdf8",
            "body": PYSPARK_BODY,
            "prefix": "databricks_pyspark",
            "pdf_name": "databricks_pyspark_cheatsheet.pdf"
        },
        {
            "name": "spark_core",
            "title": "Spark Architecture & Engine Internals Cheat Sheet",
            "theme": "#8b5cf6",
            "title_color": "#38bdf8",
            "body": SPARK_CORE_BODY,
            "prefix": "databricks_spark_core",
            "pdf_name": "databricks_spark_core_cheatsheet.pdf"
        },
        {
            "name": "python",
            "title": "Python in Databricks Cheat Sheet",
            "theme": "#3776ab",
            "title_color": "#38bdf8",
            "body": PYTHON_BODY,
            "prefix": "databricks_python",
            "pdf_name": "databricks_python_cheatsheet.pdf"
        }
    ]

    # Generate individual sheets
    for sheet in sheets:
        html_file = os.path.join(HTML_DIR, f"{sheet['name']}.html")
        pdf_file = os.path.join(PDF_DIR, sheet['pdf_name'])
        
        full_html = generate_full_html(
            title=sheet["title"],
            theme_color=sheet["theme"],
            title_color=sheet["title_color"],
            body_content=sheet["body"]
        )
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(full_html)
        print(f"\n[1/3] Wrote HTML: {os.path.basename(html_file)}")
        
        compile_pdf(html_file, pdf_file)
        render_images(pdf_file, sheet["prefix"], dpi=250)

    # Generate Master Unified 8-Page Edition
    print("\n" + "=" * 70)
    print("GENERATING MASTER 8-PAGE UNIFIED CHEAT SHEET")
    print("=" * 70)
    master_html_file = os.path.join(HTML_DIR, "master.html")
    master_pdf_file = os.path.join(PDF_DIR, "databricks_master_cheatsheet.pdf")

    master_body = SPARKSQL_BODY + PYSPARK_BODY + SPARK_CORE_BODY + PYTHON_BODY
    master_full_html = generate_full_html(
        title="Databricks Unified Architecture & Coding Cheat Sheet (Master Edition)",
        theme_color="#ff3621",
        title_color="#38bdf8",
        body_content=master_body
    )
    with open(master_html_file, "w", encoding="utf-8") as f:
        f.write(master_full_html)
    print(f"[1/3] Wrote Master HTML: {os.path.basename(master_html_file)}")

    compile_pdf(master_html_file, master_pdf_file)
    render_images(master_pdf_file, "databricks_master", dpi=250)

    # Generate Incident Runbooks PDF
    print("\n" + "=" * 70)
    print("GENERATING INCIDENT RUNBOOKS A4 PDF & THUMBNAIL")
    print("=" * 70)
    runbooks_html = os.path.join(HTML_DIR, "incident_runbooks.html")
    runbooks_pdf = os.path.join(PDF_DIR, "incident_runbooks.pdf")
    if os.path.exists(runbooks_html):
        compile_pdf(runbooks_html, runbooks_pdf)
        try:
            rb_doc = fitz.open(runbooks_pdf)
            rb_pix = rb_doc[0].get_pixmap(dpi=250)
            rb_img_path = os.path.join(IMG_DIR, "incident_runbooks_page_1.png")
            rb_pix.save(rb_img_path)
            print(f"  ✓ Rendered Runbooks Thumbnail: incident_runbooks_page_1.png ({rb_doc.page_count} pages)")
        except Exception as e:
            print(f"  ⚠️ Warning rendering runbook image: {e}")

    # Generate All-in-One Enterprise Master Reference PDF
    print("\n" + "=" * 70)
    print("GENERATING ALL-IN-ONE ENTERPRISE MASTER REFERENCE PDF")
    print("=" * 70)
    complete_master_pdf = os.path.join(PDF_DIR, "lakehouse_enterprise_master_reference.pdf")
    try:
        combined_doc = fitz.open()
        if os.path.exists(master_pdf_file):
            combined_doc.insert_pdf(fitz.open(master_pdf_file))
        if os.path.exists(runbooks_pdf):
            combined_doc.insert_pdf(fitz.open(runbooks_pdf))
        combined_doc.save(complete_master_pdf)
        print(f"  ✓ Created Enterprise Master Reference PDF: {os.path.basename(complete_master_pdf)} ({combined_doc.page_count} Pages, {os.path.getsize(complete_master_pdf)/1024:.1f} KB)")
    except Exception as e:
        print(f"  ⚠️ Warning creating combined master PDF: {e}")

    # Copy files to public/_artifacts/cheat-sheets and .build-artifacts/r2/cheat-sheets
    import shutil
    sync_targets = [
        os.path.join(WORKSPACE_DIR, "public", "_artifacts", "cheat-sheets"),
        os.path.join(WORKSPACE_DIR, ".build-artifacts", "r2", "cheat-sheets"),
    ]
    for target in sync_targets:
        try:
            os.makedirs(os.path.join(target, "pdf"), exist_ok=True)
            os.makedirs(os.path.join(target, "html"), exist_ok=True)
            os.makedirs(os.path.join(target, "images"), exist_ok=True)
            for f in os.listdir(PDF_DIR):
                shutil.copy2(os.path.join(PDF_DIR, f), os.path.join(target, "pdf", f))
            for f in os.listdir(HTML_DIR):
                shutil.copy2(os.path.join(HTML_DIR, f), os.path.join(target, "html", f))
            for f in os.listdir(IMG_DIR):
                shutil.copy2(os.path.join(IMG_DIR, f), os.path.join(target, "images", f))
            print(f"  ✓ Synchronized cheatsheet assets to: {target}")
        except Exception as e:
            print(f"  ⚠️ Warning syncing to {target}: {e}")

    # Generate Hub Index HTML
    generate_index_html()

    print("\n" + "=" * 70)
    print("ALL CHEAT SHEETS COMPILED & RENDERED SUCCESSFULLY (100% EXIT 0)")
    print("=" * 70)

if __name__ == "__main__":
    main()
