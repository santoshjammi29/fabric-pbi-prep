#!/usr/bin/env python3
"""
Databricks Architecture & Coding Cheat Sheets Generator - Ultra High-Density 12-Card Edition
Generates print-ready multi-page PDFs and 250-DPI PNG images
for Spark SQL, PySpark, Spark Core & Architecture, and Python in Databricks.

Author: Santosh Jammi | Principal Data Architect
"""

import os
import sys
import subprocess
import fitz  # PyMuPDF
from PIL import Image

WORKSPACE_DIR = "/Users/santosh/Documents/antigravity/hopeful-bardeen"
OUTPUT_DIR = os.path.join(WORKSPACE_DIR, "cheatsheets")
HTML_DIR = os.path.join(OUTPUT_DIR, "html")
PDF_DIR = os.path.join(OUTPUT_DIR, "pdf")
IMG_DIR = os.path.join(OUTPUT_DIR, "images")

os.makedirs(HTML_DIR, exist_ok=True)
os.makedirs(PDF_DIR, exist_ok=True)
os.makedirs(IMG_DIR, exist_ok=True)

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

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
  line-height: 1.25;
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
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.3px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 5px;
}}

.header-title-box p {{
  font-size: 7.2px;
  color: #94a3b8;
  font-weight: 500;
}}

.header-badges {{
  display: flex;
  align-items: center;
  gap: 3.5px;
}}

.badge {{
  padding: 1.5px 5.5px;
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
  grid-auto-rows: 1fr;
  gap: 4px;
  margin-bottom: 3px;
}}

.card {{
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 4px;
  padding: 4px 5.5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2px;
  overflow: hidden;
}}

.card-header {{
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #1e293b;
  padding-bottom: 2px;
}}

.card-title {{
  font-size: 8.2px;
  font-weight: 700;
  color: {title_color};
  display: flex;
  align-items: center;
  gap: 4px;
}}

.card-tag {{
  font-size: 6.2px;
  background: #1e293b;
  color: #94a3b8;
  padding: 1px 3px;
  border-radius: 2px;
  font-weight: 600;
}}

/* Code Blocks */
pre.code {{
  background: #040711;
  border: 1px solid #141e33;
  border-radius: 3px;
  padding: 3px 4.5px;
  font-family: 'JetBrains Mono', Menlo, Monaco, Consolas, monospace;
  font-size: 6.5px;
  line-height: 1.22;
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

/* Callout Alert Boxes */
.alert {{
  padding: 2px 3.5px;
  border-radius: 2px;
  font-size: 6.5px;
  display: flex;
  align-items: flex-start;
  gap: 3.5px;
  line-height: 1.18;
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

/* Mini Tables */
.mini-table {{
  width: 100%;
  border-collapse: collapse;
  font-size: 6.5px;
  margin: 1px 0;
}}

.mini-table th {{
  text-align: left;
  background: #141e33;
  color: #94a3b8;
  padding: 1.5px 3px;
  font-weight: 600;
  border-bottom: 1px solid #1e293b;
}}

.mini-table td {{
  padding: 1.2px 3px;
  border-bottom: 1px solid #141e33;
  color: #cbd5e1;
}}

.mini-table tr:last-child td {{
  border-bottom: none;
}}

.mini-table code {{
  font-family: 'JetBrains Mono', monospace;
  color: #38bdf8;
  font-size: 6.2px;
}}

/* Bullet list */
ul.rules-list {{
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.2px;
}}

ul.rules-list li {{
  font-size: 6.5px;
  position: relative;
  padding-left: 6.5px;
  color: #cbd5e1;
  line-height: 1.18;
}}

ul.rules-list li::before {{
  content: "•";
  position: absolute;
  left: 0;
  color: {theme_color};
  font-weight: bold;
}}

/* Footer */
.page-footer {{
  border-top: 1px solid #1e293b;
  padding-top: 2.5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 6.5px;
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
# 1. SPARK SQL TEMPLATE (6 CARDS PAGE 1 + 6 CARDS PAGE 2 = 12 CARDS)
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

<span class="cm">-- Zero-Copy Shallow Clone (instant pointer for dev/staging)</span>
<span class="kw">CREATE TABLE</span> dev_txns <span class="kw">SHALLOW CLONE</span> transactions;
<span class="cm">-- Deep Clone (full independent storage copy for DR/backup)</span>
<span class="kw">CREATE TABLE</span> dr_backup <span class="kw">DEEP CLONE</span> transactions;</pre>
        <div class="alert alert-tip">
          💡 <b>Liquid Clustering:</b> Avoids small-file skew, supports mutable keys, and re-clusters incrementally without full partition rewrites.
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
        <div class="alert alert-perf">
          ⚡ <b>Performance:</b> Always provide deterministic partition or cluster keys in the <code>ON</code> clause to enable Delta Dynamic File Pruning (DFP).
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
        <ul class="rules-list">
          <li><code>DESCRIBE HISTORY</code> records exact user, notebook ID, cluster ID, and metrics.</li>
          <li><code>RESTORE TABLE</code> takes milliseconds — updates Delta transaction log pointer.</li>
        </ul>
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
        <div class="alert alert-tip">
          💡 <b>Recursive CTE:</b> Use <code>WITH RECURSIVE</code> to traverse bill-of-materials or organizational hierarchies in a single SQL pass.
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
        <div class="alert alert-perf">
          ⚡ <b>QUALIFY Clause:</b> Replaces expensive <code>SELECT * FROM (SELECT ..., ROW_NUMBER() ...) WHERE rn=1</code> subqueries cleanly!
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
        <div class="alert alert-perf">
          ⚡ <b>Pro Tip:</b> If source data is clustered/sorted by the window partition key, Catalyst executes windowing without any network shuffle!
        </div>
      </div>

      <!-- Card 8: Complex Types & Semi-Structured Data -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🧩 Complex Types: Structs, Arrays & JSON</span>
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
        <ul class="rules-list">
          <li><code>LATERAL VIEW OUTER EXPLODE</code> preserves rows with empty/null arrays.</li>
          <li><code>schema_of_json()</code> dynamically extracts schema from a sample JSON string.</li>
        </ul>
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
        <div class="alert alert-tip">
          💡 <b>Architect Rule:</b> Higher-Order functions run entirely in memory inside Tungsten/Photon C++ without row explosion or shuffle overhead.
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
<span class="kw">RETURN IF</span>(<span class="fn">IS_ACCOUNT_GROUP_MEMBER</span>(<span class="str">'pci_auditors'</span>), pan,
          <span class="fn">CONCAT</span>(<span class="str">'****-****-****-'</span>, <span class="fn">RIGHT</span>(pan, <span class="num">4</span>)));

<span class="kw">ALTER TABLE</span> silver.payments
<span class="kw">ALTER COLUMN</span> card_pan <span class="kw">SET MASK</span> mask_card_pan;

<span class="cm">-- 2. Row Filtering (Regional multi-tenant isolation)</span>
<span class="kw">CREATE OR REPLACE FUNCTION</span> filter_by_region(region <span class="typ">STRING</span>)
<span class="kw">RETURN</span> <span class="fn">IS_ACCOUNT_GROUP_MEMBER</span>(<span class="str">'global_admin'</span>) <span class="kw">OR</span> region = <span class="fn">current_user</span>();

<span class="kw">ALTER TABLE</span> silver.sales
<span class="kw">SET ROW FILTER</span> filter_by_region <span class="kw">ON</span> (region);</pre>
        <div class="alert alert-sec">
          🔒 <b>Fine-Grained Security:</b> Applied transparently at storage read-time for BI, SQL, Python, and R without maintaining separate secure views.
        </div>
      </div>

      <!-- Card 11: PIVOT, UNPIVOT & Multi-Dimensional Grouping -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔄 PIVOT, UNPIVOT & Grouping Sets</span>
          <span class="card-tag">Transformations</span>
        </div>
        <pre class="code"><span class="cm">-- PIVOT: Rotate row values into columnar KPIs</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> (
  <span class="kw">SELECT</span> region, quarter, revenue <span class="kw">FROM</span> silver.sales
) <span class="kw">PIVOT</span> (
  <span class="fn">SUM</span>(revenue) <span class="kw">FOR</span> quarter <span class="kw">IN</span> (<span class="str">'Q1'</span>, <span class="str">'Q2'</span>, <span class="str">'Q3'</span>, <span class="str">'Q4'</span>)
);

<span class="cm">-- UNPIVOT: Rotate columnar metrics into tidy rows</span>
<span class="kw">SELECT</span> * <span class="kw">FROM</span> silver.quarterly_kpis
<span class="kw">UNPIVOT</span> (revenue <span class="kw">FOR</span> qtr <span class="kw">IN</span> (q1, q2, q3, q4));

<span class="cm">-- CUBE & ROLLUP: Multi-level executive aggregation</span>
<span class="kw">SELECT</span> region, product, <span class="fn">SUM</span>(revenue) <span class="kw">AS</span> total
<span class="kw">FROM</span> silver.sales <span class="kw">GROUP BY ROLLUP</span> (region, product);</pre>
        <div class="alert alert-tip">
          💡 <b>ROLLUP vs CUBE:</b> <code>ROLLUP</code> produces hierarchical subtotals (Country &gt; State &gt; City); <code>CUBE</code> computes all 2^N combinations.
        </div>
      </div>

      <!-- Card 12: Performance Hints & Spark SQL Engine Knobs -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🚀 Join Strategy Hints & Session Performance Configuration</span>
          <span class="card-tag">Engine Tuning</span>
        </div>
        <pre class="code"><span class="cm">-- Optimizer Join Hints</span>
<span class="kw">SELECT</span> <span class="cm">/*+ BROADCAST(dim_cat) */</span>
  f.txn_id, f.amount, dim_cat.category_name
<span class="kw">FROM</span> silver.fact_sales f
<span class="kw">JOIN</span> silver.dim_category dim_cat <span class="kw">ON</span> f.category_id = dim_cat.id;

<span class="cm">-- Force Shuffle Hash Join</span>
<span class="kw">SELECT</span> <span class="cm">/*+ SHUFFLE_HASH(orders) */</span> *
<span class="kw">FROM</span> orders <span class="kw">JOIN</span> returns <span class="kw">ON</span> orders.id = returns.id;</pre>
        <table class="mini-table">
          <tr><th>Knob</th><th>Setting</th><th>Impact</th></tr>
          <tr><td><code>spark.sql.shuffle.partitions</code></td><td><code>auto</code></td><td>Enables AQE dynamic partition sizing</td></tr>
          <tr><td><code>spark.sql.adaptive.enabled</code></td><td><code>true</code></td><td>Runtime join re-planning & skew split</td></tr>
          <tr><td><code>spark.databricks.delta.optimizeWrite.enabled</code></td><td><code>true</code></td><td>Pre-shuffle writes to prevent small files</td></tr>
        </table>
      </div>
    </div>

    <div class="page-footer">
      <div class="page-footer-left">
        <span>Santosh Jammi | Principal Data Architect</span>
        <span>•</span>
        <span>Databricks Lakehouse Cheat Sheet Series</span>
      </div>
      <div class="page-footer-right">Page 2 of 2 — Analytical SQL & Tuning</div>
    </div>
  </div>
"""

# ==============================================================================
# 2. PYSPARK TEMPLATE (6 CARDS PAGE 1 + 6 CARDS PAGE 2 = 12 CARDS)
# ==============================================================================
PYSPARK_BODY = """
  <!-- PAGE 1 -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="header-title-box">
          <h1>🔥 DATABRICKS PYSPARK CHEAT SHEET</h1>
          <p>Production Reference: SparkSession, DataFrame API, Schemas, Joins, Windowing & Aggregations</p>
        </div>
      </div>
      <div class="header-badges">
        <span class="badge badge-primary">PySpark</span>
        <span class="badge badge-secondary">DataFrame API</span>
        <span class="badge badge-dark">Delta Lake 3.x</span>
        <span class="badge badge-accent">Auto Loader</span>
      </div>
    </div>

    <div class="content-grid">
      <!-- Card 1: SparkSession & Imports -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🚀 SparkSession & Standard Imports</span>
          <span class="card-tag">Setup</span>
        </div>
        <pre class="code"><span class="kw">from</span> pyspark.sql <span class="kw">import</span> SparkSession, Window <span class="kw">as</span> <span class="cls">W</span>
<span class="kw">from</span> pyspark.sql <span class="kw">import</span> functions <span class="kw">as</span> <span class="cls">F</span>, types <span class="kw">as</span> <span class="cls">T</span>
<span class="kw">from</span> delta.tables <span class="kw">import</span> <span class="cls">DeltaTable</span>

<span class="cm"># Pre-initialized in Databricks as 'spark'; Configured for Medallion</span>
<span class="var">spark</span>.conf.set(<span class="str">"spark.sql.shuffle.partitions"</span>, <span class="str">"auto"</span>)
<span class="var">spark</span>.conf.set(<span class="str">"spark.sql.adaptive.enabled"</span>, <span class="str">"true"</span>)
<span class="var">spark</span>.conf.set(<span class="str">"spark.sql.adaptive.coalescePartitions.enabled"</span>, <span class="str">"true"</span>)
<span class="var">spark</span>.conf.set(<span class="str">"spark.databricks.delta.optimizeWrite.enabled"</span>, <span class="str">"true"</span>)
<span class="var">spark</span>.conf.set(<span class="str">"spark.databricks.delta.autoCompact.enabled"</span>, <span class="str">"true"</span>)</pre>
        <ul class="rules-list">
          <li><code>optimizeWrite</code> performs an exchange before writing to ensure 128MB-1GB files.</li>
          <li><code>autoCompact</code> automatically checks and compacts files after individual write stages.</li>
        </ul>
      </div>

      <!-- Card 2: Essential DataFrame Transformations -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⚡ DataFrame Projections & Filtering</span>
          <span class="card-tag">Core API</span>
        </div>
        <pre class="code"><span class="cm"># Projections, Expressions & Casts</span>
<span class="var">df_clean</span> = (<span class="var">df</span>
    .select(
        <span class="str">"customer_id"</span>,
        <span class="cls">F</span>.col(<span class="str">"amount"</span>).cast(<span class="cls">T</span>.DecimalType(<span class="num">18</span>, <span class="num">2</span>)).alias(<span class="str">"amount_eur"</span>),
        <span class="cls">F</span>.to_date(<span class="cls">F</span>.col(<span class="str">"created_at"</span>)).alias(<span class="str">"txn_date"</span>)
    )
    .withColumn(<span class="str">"tier"</span>,
        <span class="cls">F</span>.when(<span class="cls">F</span>.col(<span class="str">"amount_eur"</span>) &gt; <span class="num">5000</span>, <span class="str">"PLATINUM"</span>)
         .when(<span class="cls">F</span>.col(<span class="str">"amount_eur"</span>) &gt; <span class="num">1000</span>, <span class="str">"GOLD"</span>)
         .otherwise(<span class="str">"STANDARD"</span>)
    )
    .filter((<span class="cls">F</span>.col(<span class="str">"amount_eur"</span>) &gt; <span class="num">0</span>) &amp; <span class="cls">F</span>.col(<span class="str">"customer_id"</span>).isNotNull())
    .dropDuplicates([<span class="str">"customer_id"</span>, <span class="str">"txn_date"</span>])
    .orderBy(<span class="cls">F</span>.col(<span class="str">"amount_eur"</span>).desc_nulls_last())
)</pre>
        <div class="alert alert-tip">
          💡 <b>withColumns():</b> In Spark 3.3+, pass a dictionary to <code>df.withColumns(...)</code> to add multiple columns in a single projection pass!
        </div>
      </div>

      <!-- Card 3: Strict Schema Definition -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📐 Schema Definition (StructType & StructField)</span>
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
        <div class="alert alert-perf">
          ⚡ <b>FinOps Sizing:</b> Enforcing schemas on read eliminates a 2-pass scan over multi-terabyte JSON/CSV landing zones.
        </div>
      </div>

      <!-- Card 4: Standard Functions (F) Quick Reference -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🧰 pyspark.sql.functions (F) Master Reference</span>
          <span class="card-tag">Functions</span>
        </div>
        <table class="mini-table">
          <tr><th>Category</th><th>Top Functions</th></tr>
          <tr><td><b>String</b></td><td><code>F.concat_ws('_', c1, c2)</code>, <code>F.regexp_replace()</code>, <code>F.split()</code>, <code>F.trim()</code></td></tr>
          <tr><td><b>Date/Time</b></td><td><code>F.to_date()</code>, <code>F.date_add(c, 30)</code>, <code>F.datediff(c1, c2)</code>, <code>F.date_trunc('MM')</code></td></tr>
          <tr><td><b>Nulls</b></td><td><code>F.coalesce(c1, c2, F.lit('N/A'))</code>, <code>df.na.fill(0)</code>, <code>df.na.drop()</code></td></tr>
          <tr><td><b>Array</b></td><td><code>F.explode()</code>, <code>F.array_contains()</code>, <code>F.size()</code>, <code>F.array_distinct()</code></td></tr>
          <tr><td><b>JSON</b></td><td><code>F.from_json(col, schema)</code>, <code>F.to_json(struct)</code>, <code>F.get_json_object()</code></td></tr>
        </table>
        <div class="alert alert-perf">
          ⚡ <b>Vectorization:</b> Built-in <code>pyspark.sql.functions</code> execute natively in JVM/C++ Photon without Python serialization penalties!
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
        <div class="alert alert-tip">
          💡 <b>RangeBetween vs RowsBetween:</b> <code>rangeBetween</code> handles calendar days and gaps; <code>rowsBetween</code> operates strictly on physical row indices.
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
          <h1>🔥 DATABRICKS PYSPARK CHEAT SHEET</h1>
          <p>DeltaTable API, Auto Loader Streaming, Vectorized UDFs & Performance Tuning</p>
        </div>
      </div>
      <div class="header-badges">
        <span class="badge badge-primary">Lakehouse API</span>
        <span class="badge badge-secondary">PyArrow Vectorized</span>
        <span class="badge badge-dark">Streaming</span>
      </div>
    </div>

    <div class="content-grid">
      <!-- Card 7: DeltaTable Python API -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📦 DeltaTable Python API & Upserts</span>
          <span class="card-tag">Lakehouse</span>
        </div>
        <pre class="code"><span class="kw">from</span> delta.tables <span class="kw">import</span> <span class="cls">DeltaTable</span>

<span class="var">dt</span> = <span class="cls">DeltaTable</span>.forName(<span class="var">spark</span>, <span class="str">"prod_catalog.silver.customers"</span>)

<span class="cm"># Pythonic ACID Merge / Upsert</span>
(<span class="var">dt</span>.alias(<span class="str">"t"</span>)
   .merge(<span class="var">source_df</span>.alias(<span class="str">"s"</span>), <span class="str">"t.cust_id = s.cust_id"</span>)
   .whenMatchedUpdate(
       condition=<span class="str">"s.op = 'U'"</span>,
       set={"name": "s.name", "updated_at": "current_timestamp()"}
   )
   .whenMatchedDelete(condition=<span class="str">"s.op = 'D'"</span>)
   .whenNotMatchedInsert(
       values={"cust_id": "s.cust_id", "name": "s.name",
               "created_at": "current_timestamp()"}
   )
   .execute())

<span class="cm"># Maintenance & Time Travel</span>
<span class="var">dt</span>.optimize().executeCompaction()
<span class="var">dt</span>.vacuum(<span class="num">168</span>)  <span class="cm"># 7 days</span>
<span class="var">hist_df</span> = <span class="var">dt</span>.history()</pre>
      </div>

      <!-- Card 8: Structured Streaming & Auto Loader -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🌊 Auto Loader & Structured Streaming</span>
          <span class="card-tag">Streaming</span>
        </div>
        <pre class="code"><span class="cm"># Ingestion with Databricks Auto Loader (cloudFiles)</span>
<span class="var">stream_df</span> = (<span class="var">spark</span>.readStream
    .format(<span class="str">"cloudFiles"</span>)
    .option(<span class="str">"cloudFiles.format"</span>, <span class="str">"json"</span>)
    .option(<span class="str">"cloudFiles.schemaLocation"</span>, <span class="str">"/checkpoints/schema"</span>)
    .option(<span class="str">"cloudFiles.inferColumnTypes"</span>, <span class="str">"true"</span>)
    .option(<span class="str">"cloudFiles.schemaEvolutionMode"</span>, <span class="str">"addNewColumns"</span>)
    .load(<span class="str">"abfss://raw@adls.dfs.core.windows.net/events/"</span>))

<span class="cm"># Watermarked Sink write with AvailableNow trigger</span>
<span class="var">query</span> = (<span class="var">stream_df</span>
    .withWatermark(<span class="str">"event_time"</span>, <span class="str">"10 minutes"</span>)
    .writeStream
    .format(<span class="str">"delta"</span>)
    .outputMode(<span class="str">"append"</span>)
    .option(<span class="str">"checkpointLocation"</span>, <span class="str">"/checkpoints/bronze_events"</span>)
    .trigger(availableNow=<span class="kw">True</span>) <span class="cm"># Incremental batch</span>
    .toTable(<span class="str">"bronze.events"</span>))</pre>
        <div class="alert alert-tip">
          💡 <b>Trigger(availableNow=True):</b> Replaces legacy <code>once=True</code>. Processes all pending data in rate-limited micro-batches then stops, slashing cluster costs!
        </div>
      </div>

      <!-- Card 9: Vectorized Pandas UDFs vs Standard UDFs -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⚡ PyArrow Vectorized Pandas UDFs</span>
          <span class="card-tag">Performance</span>
        </div>
        <pre class="code"><span class="kw">import</span> pandas <span class="kw">as</span> pd
<span class="kw">from</span> pyspark.sql.functions <span class="kw">import</span> pandas_udf

<span class="cm"># Vectorized Series-to-Series UDF (Uses Apache Arrow)</span>
<span class="kw">@pandas_udf</span>(<span class="cls">T</span>.DoubleType())
<span class="kw">def</span> calculate_vat(price: pd.Series, rate: pd.Series) -&gt; pd.Series:
    <span class="kw">return</span> price * (<span class="num">1.0</span> + rate)

<span class="var">df_taxed</span> = <span class="var">df</span>.withColumn(<span class="str">"gross"</span>, calculate_vat(<span class="cls">F</span>.col(<span class="str">"net"</span>), <span class="cls">F</span>.col(<span class="str">"rate"</span>)))

<span class="cm"># Grouped Map Vectorized UDF (applyInPandas)</span>
<span class="kw">def</span> normalize_group(pdf: pd.DataFrame) -&gt; pd.DataFrame:
    pdf[<span class="str">"z_score"</span>] = (pdf[<span class="str">"val"</span>] - pdf[<span class="str">"val"</span>].mean()) / pdf[<span class="str">"val"</span>].std()
    <span class="kw">return</span> pdf

<span class="var">df_norm</span> = <span class="var">df</span>.groupby(<span class="str">"device_id"</span>).applyInPandas(
    normalize_group, schema=<span class="var">output_schema</span>
)</pre>
        <div class="alert alert-warn">
          ⚠️ <b>Avoid Standard @udf:</b> Regular Python UDFs force row-by-row Py4J socket serialization. Pandas UDFs process columnar Arrow batches up to 100x faster!
        </div>
      </div>

      <!-- Card 10: Partitioning & Memory Control -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⚖️ Partition Management: Repartition vs Coalesce</span>
          <span class="card-tag">FinOps / Sizing</span>
        </div>
        <pre class="code"><span class="cm"># Inspect current partitions</span>
<span class="var">num_parts</span> = <span class="var">df</span>.rdd.getNumPartitions()

<span class="cm"># Repartition: FULL SHUFFLE across cluster (Increase/Balance)</span>
<span class="var">df_balanced</span> = <span class="var">df</span>.repartition(<span class="num">200</span>)
<span class="var">df_hash</span> = <span class="var">df</span>.repartition(<span class="num">100</span>, <span class="str">"region"</span>)

<span class="cm"># Coalesce: ZERO SHUFFLE (Shrinks local partition blocks)</span>
<span class="var">df_shrunk</span> = <span class="var">df</span>.coalesce(<span class="num">10</span>) <span class="cm"># Use right before file write!</span></pre>
        <table class="mini-table">
          <tr><th>Operation</th><th>Network Shuffle</th><th>Partition Target</th></tr>
          <tr><td><code>repartition(N)</code></td><td>Yes (Exchange)</td><td>Increase or redistribute evenly</td></tr>
          <tr><td><code>coalesce(N)</code></td><td>No (Local merge)</td><td>Shrink only; avoids small files</td></tr>
        </table>
        <div class="alert alert-perf">
          ⚡ <b>Rule of Thumb:</b> Target <b>100MB - 200MB</b> uncompressed data per partition.
        </div>
      </div>

      <!-- Card 11: Caching, Persistence & Cleanup -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">💾 Caching, Persistence Levels & Cleanup</span>
          <span class="card-tag">Memory Management</span>
        </div>
        <pre class="code"><span class="kw">from</span> pyspark <span class="kw">import</span> <span class="cls">StorageLevel</span>

<span class="cm"># Cache: MEMORY_AND_DISK_DESER (Default)</span>
<span class="var">df_cached</span> = <span class="var">df</span>.cache()

<span class="cm"># Persist with Serialized Kryo (Saves up to 3x RAM)</span>
<span class="var">df_persisted</span> = <span class="var">df</span>.persist(<span class="cls">StorageLevel</span>.MEMORY_ONLY_SER)

<span class="cm"># MANDATORY: Evict from RAM when actions complete!</span>
<span class="var">df_cached</span>.unpersist()</pre>
        <ul class="rules-list">
          <li><b>When to Cache:</b> Cache ONLY when a DataFrame is reused across 2+ separate downstream actions.</li>
          <li><b>Over-caching Antipattern:</b> Starves Unified Execution Memory, forcing shuffle spills to disk!</li>
        </ul>
      </div>

      <!-- Card 12: Streaming ForeachBatch Sink & Microbatch Processing -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔁 Streaming foreachBatch Microbatch Processing</span>
          <span class="card-tag">Streaming Sink</span>
        </div>
        <pre class="code"><span class="kw">def</span> process_micro_batch(micro_df, batch_id):
    <span class="cm"># Cache microbatch if referenced in multiple merges</span>
    <span class="var">micro_df</span>.persist()
    
    <span class="cm"># ACID Merge microbatch directly into Delta Silver</span>
    (<span class="cls">DeltaTable</span>.forName(<span class="var">spark</span>, <span class="str">"silver.txns"</span>).alias(<span class="str">"t"</span>)
     .merge(<span class="var">micro_df</span>.alias(<span class="str">"s"</span>), <span class="str">"t.id = s.id"</span>)
     .whenMatchedUpdateAll()
     .whenNotMatchedInsertAll()
     .execute())
    
    <span class="var">micro_df</span>.unpersist()

<span class="var">query</span> = (<span class="var">stream_df</span>.writeStream
    .foreachBatch(process_micro_batch)
    .option(<span class="str">"checkpointLocation"</span>, <span class="str">"/chk/silver"</span>)
    .start())</pre>
        <div class="alert alert-perf">
          ⚡ <b>foreachBatch Superpower:</b> Allows writing a streaming pipeline into non-streaming sinks, running multi-table merges, and executing deduplications per microbatch.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div class="page-footer-left">
        <span>Santosh Jammi | Principal Data Architect</span>
        <span>•</span>
        <span>Databricks Lakehouse Cheat Sheet Series</span>
      </div>
      <div class="page-footer-right">Page 2 of 2 — DeltaTable, Streaming & Optimization</div>
    </div>
  </div>
"""

# ==============================================================================
# 3. SPARK CORE & ARCHITECTURE TEMPLATE (6 CARDS PAGE 1 + 6 CARDS PAGE 2 = 12 CARDS)
# ==============================================================================
SPARK_CORE_BODY = """
  <!-- PAGE 1 -->
  <div class="page">
    <div class="header-bar">
      <div class="header-left">
        <div class="header-title-box">
          <h1>⚙️ SPARK ARCHITECTURE & ENGINE INTERNALS</h1>
          <p>Cluster Topology, JVM Memory Allocation, Shuffling, Catalyst & Resource Sizing</p>
        </div>
      </div>
      <div class="header-badges">
        <span class="badge badge-primary">Spark Core</span>
        <span class="badge badge-secondary">Tungsten & Photon</span>
        <span class="badge badge-dark">Memory Model</span>
        <span class="badge badge-accent">Catalyst Optimizer</span>
      </div>
    </div>

    <div class="content-grid">
      <!-- Card 1: Cluster Hierarchy & Execution Topography -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🏢 Cluster Topology & Execution Hierarchy</span>
          <span class="card-tag">Architecture</span>
        </div>
        <table class="mini-table">
          <tr><th>Component</th><th>Role & Responsibilities</th></tr>
          <tr><td><b>Driver</b></td><td>Hosts <code>SparkSession</code>, DAGScheduler, TaskScheduler, Web UI (4040). Translates code to physical stages.</td></tr>
          <tr><td><b>Cluster Mgr</b></td><td>Allocates physical compute resources (Databricks CM / YARN / K8s).</td></tr>
          <tr><td><b>Worker Node</b></td><td>Physical VM hosting Executor JVM instances and NVMe shuffle disks.</td></tr>
          <tr><td><b>Executor</b></td><td>JVM process running tasks in thread slots; holds execution/storage RAM.</td></tr>
          <tr><td><b>Core / Slot</b></td><td>Thread processing slot. Optimal: <b>4-5 cores per executor</b>.</td></tr>
        </table>
        <div class="alert alert-tip">
          💡 <b>Execution Cascade:</b> <b>Action</b> (collect/write) → <b>Job</b> → <b>Stages</b> (split by wide shuffles) → <b>Tasks</b> (1 task per partition per core).
        </div>
      </div>

      <!-- Card 2: JVM Memory Management Model -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🧠 Executor JVM Unified Memory Model</span>
          <span class="card-tag">Memory</span>
        </div>
        <table class="mini-table">
          <tr><th>Segment</th><th>Size / Share</th><th>Purpose</th></tr>
          <tr><td><b>Reserved</b></td><td>300 MB</td><td>Hardcoded for Spark internal engine structures</td></tr>
          <tr><td><b>User Memory</b></td><td>40% (Heap - 300MB)</td><td>Custom data structures, UDF allocations, metadata</td></tr>
          <tr><td><b>Unified Memory</b></td><td>60% (Heap - 300MB)</td><td>Dynamically shared between Execution & Storage</td></tr>
          <tr><td>└ <i>Execution</i></td><td>Dynamic pool</td><td>Shuffles, joins, sorts, aggregations (Can evict storage!)</td></tr>
          <tr><td>└ <i>Storage</i></td><td>Dynamic pool</td><td>Cached data (<code>df.cache()</code>); cannot evict execution!</td></tr>
          <tr><td><b>Overhead</b></td><td>max(384MB, 10%)</td><td>Off-heap VM overhead, Py4J IPC, thread stacks</td></tr>
        </table>
        <div class="alert alert-perf">
          ⚡ <b>Off-Heap (Tungsten):</b> <code>spark.memory.offHeap.enabled = true</code> allocates memory directly outside JVM, completely bypassing Garbage Collection pauses!
        </div>
      </div>

      <!-- Card 3: Narrow vs Wide Dependencies -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔀 Transformations: Narrow vs Wide Dependencies</span>
          <span class="card-tag">DAG Scheduler</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
          <div>
            <b style="color: #34d399;">Narrow (Pipelined)</b>
            <ul class="rules-list" style="margin-top:2px;">
              <li><code>map</code>, <code>filter</code>, <code>withColumn</code>, <code>union</code></li>
              <li>Each parent partition used by at most 1 child partition.</li>
              <li>Zero network shuffle! Pipelined in memory within the <b>same stage</b>.</li>
            </ul>
          </div>
          <div>
            <b style="color: #f43f5e;">Wide (Shuffle Boundary)</b>
            <ul class="rules-list" style="margin-top:2px;">
              <li><code>groupBy</code>, <code>join</code>, <code>distinct</code>, <code>repartition</code></li>
              <li>Multiple child partitions depend on parent partitions.</li>
              <li>Forces network exchange; terminates stage and starts new stage!</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Card 4: Shuffle Internals & Spill -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🌪️ The Shuffle Engine: Write, Read & Spill</span>
          <span class="card-tag">Shuffle</span>
        </div>
        <ul class="rules-list">
          <li><b>Shuffle Write:</b> Mappers write records to memory buffer; sorted and written to a single <code>.data</code> file with <code>.index</code> offset file on local NVMe disk.</li>
          <li><b>Shuffle Read:</b> Reducers fetch their required blocks over Netty RPC from all mappers across the network into local memory buffers.</li>
          <li><b>Spill (Memory) vs Spill (Disk):</b> Occurs when shuffle memory exceeds executor threshold. Data is serialized and flushed to disk (huge latency penalty!).</li>
        </ul>
        <div class="alert alert-warn">
          ⚠️ <b>Triage Spills:</b> If Spark UI shows Spill (Memory) / Spill (Disk), immediately increase executor RAM, enable AQE, or increase shuffle partitions!
        </div>
      </div>

      <!-- Card 5: Catalyst Optimizer & Whole-Stage CodeGen -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⚡ Catalyst Optimizer & Tungsten Engine</span>
          <span class="card-tag">Query Engine</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
          <div style="background: #141e33; padding: 3px; border-radius: 3px;">
            <b style="color: #38bdf8;">1. Analysis</b>
            <p style="font-size: 6.2px; color: #cbd5e1; margin-top: 1px;">Resolves names against Unity Catalog.</p>
            <b style="color: #38bdf8; margin-top:2px; display:inline-block;">2. Logical Opt</b>
            <p style="font-size: 6.2px; color: #cbd5e1; margin-top: 1px;">Predicate pushdown, column pruning.</p>
          </div>
          <div style="background: #141e33; padding: 3px; border-radius: 3px;">
            <b style="color: #38bdf8;">3. Physical Plan</b>
            <p style="font-size: 6.2px; color: #cbd5e1; margin-top: 1px;">CBO picks optimal join (BHJ vs SMJ).</p>
            <b style="color: #38bdf8; margin-top:2px; display:inline-block;">4. Tungsten CodeGen</b>
            <p style="font-size: 6.2px; color: #cbd5e1; margin-top: 1px;">Compiles loops into CPU L1/L2 registers.</p>
          </div>
        </div>
        <div class="alert alert-tip">
          💡 <b>UnsafeRow:</b> Tungsten stores records in raw off-heap binary format without Java object wrapper overhead.
        </div>
      </div>

      <!-- Card 6: Cluster Sizing & Sizing Math -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📐 Cluster Sizing & Resource Allocation Math</span>
          <span class="card-tag">Infrastructure</span>
        </div>
        <pre class="code"><span class="cm"># Production Cluster Allocation Formula</span>
<span class="cm"># Example: 10 Nodes, 16 Cores & 64GB RAM each</span>
1. Cores per Node = 16 - 1 (OS/YARN) = 15 Cores
2. Cores per Executor = 5 (Sweet spot for HDFS/ADLS IO throughput)
3. Executors per Node = 15 / 5 = 3 Executors
4. Total Executors = (10 Nodes * 3) - 1 (Driver) = 29 Executors
5. RAM per Node = 64GB - 1GB (OS) = 63GB
6. RAM per Executor = 63GB / 3 = 21GB
7. Memory Overhead = max(384MB, 0.10 * 21GB) = ~2.1GB
8. Executor Heap = 21GB - 2.1GB = ~18.9GB (Set: --executor-memory 19g)</pre>
        <div class="alert alert-perf">
          ⚡ <b>Parallelism Rule:</b> <code>spark.default.parallelism = total_executor_cores * 2 to 3</code> (For 145 cores = ~300-450 partitions).
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
          <span class="card-tag">Photon</span>
        </div>
        <ul class="rules-list">
          <li><b>C++ Native Execution:</b> Replaces Tungsten Java bytecode execution path entirely with hand-optimized native C++.</li>
          <li><b>SIMD Vectorization:</b> Processes batches of column values in CPU SIMD registers simultaneously (Single Instruction, Multiple Data).</li>
          <li><b>Zero JVM Overhead:</b> Eliminates Java object allocation, GC pauses, and JIT deoptimizations for high-concurrency SQL and aggregations.</li>
        </ul>
        <div class="alert alert-perf">
          ⚡ <b>Accelerated Operations:</b> Delta Parquet scanning, complex hash joins, high-cardinality aggregations, and string/regex operations execute up to <b>5x faster</b> on Photon.
        </div>
      </div>

      <!-- Card 8: Adaptive Query Execution (AQE) -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🧠 Adaptive Query Execution (AQE) 3 Superpowers</span>
          <span class="card-tag">Adaptive Tuning</span>
        </div>
        <table class="mini-table">
          <tr><th>Feature</th><th>Runtime Action</th><th>Config Knob</th></tr>
          <tr><td><b>Dynamic Partition Coalescing</b></td><td>Merges tiny post-shuffle partitions to eliminate small-task scheduling overhead</td><td><code>spark.sql.adaptive.coalescePartitions.enabled = true</code></td></tr>
          <tr><td><b>Dynamic Join Switching</b></td><td>Converts SortMergeJoin to BroadcastHashJoin if runtime stage output &lt; 10MB</td><td><code>spark.sql.adaptive.autoBroadcastJoinThreshold</code></td></tr>
          <tr><td><b>Dynamic Skew Join</b></td><td>Detects skewed partitions (&gt;5x median & &gt;256MB) and automatically splits them</td><td><code>spark.sql.adaptive.skewJoin.enabled = true</code></td></tr>
        </table>
      </div>

      <!-- Card 9: Spark UI Diagnostic Playbook -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔍 Spark UI Diagnostic & Triage Playbook</span>
          <span class="card-tag">Diagnostics</span>
        </div>
        <table class="mini-table">
          <tr><th>Spark UI Tab</th><th>Metric / Symptom</th><th>Diagnosis & Fix</th></tr>
          <tr><td><b>Stages Tab</b></td><td>Max task time &gt;&gt; 75th percentile</td><td><b>Data Skew:</b> Single straggler task holding stage. Enable AQE skew join or salt keys.</td></tr>
          <tr><td><b>Stages Tab</b></td><td>Spill (Memory) & Spill (Disk) &gt; 0</td><td><b>Memory Deficit:</b> Increase executor memory or raise <code>spark.sql.shuffle.partitions</code>.</td></tr>
          <tr><td><b>Executors Tab</b></td><td>GC Time &gt; 10% of Task Time</td><td><b>Heap Exhaustion:</b> Large object allocations or oversized partitions. Enable Off-Heap memory.</td></tr>
          <tr><td><b>SQL / Plan</b></td><td>SortMergeJoin instead of Broadcast</td><td>Check table statistics with <code>ANALYZE TABLE</code> or supply <code>/*+ BROADCAST */</code> hint.</td></tr>
        </table>
      </div>

      <!-- Card 10: Data Skew Troubleshooting Playbook -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⚠️ Data Skew Root Causes & Solutions</span>
          <span class="card-tag">Skew Remediation</span>
        </div>
        <ul class="rules-list">
          <li><b>Root Causes:</b> High frequency keys (e.g. <code>NULL</code> customer IDs, default dummy values, power-law Pareto distributions).</li>
          <li><b>Strategy 1 (AQE):</b> Ensure <code>spark.sql.adaptive.skewJoin.enabled = true</code> (Databricks default).</li>
          <li><b>Strategy 2 (Null Separation):</b> Filter null keys into a separate stream; join only non-nulls; <code>UNION ALL</code> nulls back.</li>
          <li><b>Strategy 3 (Broadcast):</b> If one table fits in RAM (&lt;8GB on large clusters), broadcast it to eliminate shuffle completely!</li>
        </ul>
      </div>

      <!-- Card 11: Storage Levels & Persistence Matrix -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">💾 Storage Levels & Checkpoint Decision Matrix</span>
          <span class="card-tag">Persistence</span>
        </div>
        <table class="mini-table">
          <tr><th>Storage Level</th><th>Space</th><th>CPU</th><th>RAM</th><th>Disk</th></tr>
          <tr><td><code>MEMORY_ONLY</code></td><td>High</td><td>Lowest</td><td>Yes (Deser)</td><td>No</td></tr>
          <tr><td><code>MEMORY_ONLY_SER</code></td><td>Low (3x less)</td><td>Low</td><td>Yes (Kryo)</td><td>No</td></tr>
          <tr><td><code>MEMORY_AND_DISK</code></td><td>Medium</td><td>Med</td><td>Spills to Disk</td><td>Yes</td></tr>
          <tr><td><code>OFF_HEAP</code></td><td>Low</td><td>Lowest</td><td>Tungsten RAM</td><td>No GC!</td></tr>
        </table>
        <div class="alert alert-tip">
          💡 <b>df.persist() vs df.checkpoint():</b>
          <code>persist()</code> keeps lineage for node recovery; <code>checkpoint()</code> writes to ADLS and <b>TRUNCATES lineage</b> graph (mandatory for iterative ML/Streaming).
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

<span class="cm"># Optimal Shuffle Partitions Calculation</span>
<span class="cm"># Rule: Target 100MB - 200MB per shuffle partition</span>
Total Shuffle Input Data = 64 GB (= 65,536 MB)
Optimal Partitions = 65,536 MB / 128 MB = 512 Partitions
Set: spark.conf.set("spark.sql.shuffle.partitions", 512)</pre>
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
# 4. PYTHON IN DATABRICKS TEMPLATE (6 CARDS PAGE 1 + 6 CARDS PAGE 2 = 12 CARDS)
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
      <!-- Card 1: Databricks Utilities (dbutils) Master Reference -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🧰 Databricks Utilities (dbutils) Master Reference</span>
          <span class="card-tag">dbutils</span>
        </div>
        <pre class="code"><span class="cm"># 1. File System (dbutils.fs) & Volumes</span>
<span class="var">dbutils</span>.fs.ls(<span class="str">"/Volumes/prod/finance/raw_files/"</span>)
<span class="var">dbutils</span>.fs.cp(<span class="str">"abfss://landing@adls.dfs.core.windows.net/data.csv"</span>,
              <span class="str">"/Volumes/prod/finance/raw_files/"</span>, recurse=<span class="kw">True</span>)
<span class="var">dbutils</span>.fs.rm(<span class="str">"/tmp/scratch/"</span>, recurse=<span class="kw">True</span>)
<span class="var">dbutils</span>.fs.put(<span class="str">"/tmp/config.json"</span>, <span class="str">'{"env":"prod"}'</span>, overwrite=<span class="kw">True</span>)

<span class="cm"># 2. Secrets & Azure Key Vault</span>
<span class="var">secret_token</span> = <span class="var">dbutils</span>.secrets.get(scope=<span class="str">"akv-scope"</span>, key=<span class="str">"storage-key"</span>)
<span class="var">scopes</span> = <span class="var">dbutils</span>.secrets.listScopes()

<span class="cm"># 3. Notebook Workflows</span>
<span class="var">res</span> = <span class="var">dbutils</span>.notebook.run(<span class="str">"sub_pipeline"</span>, timeout_seconds=<span class="num">1800</span>,
                           arguments={"batch_id": "101"})
<span class="var">dbutils</span>.notebook.exit(<span class="str">"SUCCESS: 154000 records processed"</span>)

<span class="cm"># 4. Interactive Widgets</span>
<span class="var">dbutils</span>.widgets.text(<span class="str">"env"</span>, <span class="str">"dev"</span>, <span class="str">"Target Environment"</span>)
<span class="var">env_val</span> = <span class="var">dbutils</span>.widgets.get(<span class="str">"env"</span>)</pre>
      </div>

      <!-- Card 2: Delta Live Tables (DLT) Python Framework -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🏗️ Delta Live Tables (DLT) Declarative Pipelines</span>
          <span class="card-tag">DLT</span>
        </div>
        <pre class="code"><span class="kw">import</span> dlt
<span class="kw">from</span> pyspark.sql <span class="kw">import</span> functions <span class="kw">as</span> <span class="cls">F</span>

<span class="cm"># Streaming Ingestion Table</span>
<span class="kw">@dlt.table</span>(
    name=<span class="str">"bronze_txns"</span>,
    comment=<span class="str">"Raw transaction stream"</span>,
    table_properties={"quality": "bronze"}
)
<span class="kw">def</span> bronze_txns():
    <span class="kw">return</span> (<span class="var">spark</span>.readStream.format(<span class="str">"cloudFiles"</span>)
            .option(<span class="str">"cloudFiles.format"</span>, <span class="str">"json"</span>)
            .load(<span class="str">"abfss://landing@adls.dfs.core.windows.net/txns/"</span>))

<span class="cm"># Silver Table with Data Quality Expectations</span>
<span class="kw">@dlt.table</span>(comment=<span class="str">"Validated transactions"</span>)
<span class="kw">@dlt.expect_or_drop</span>(<span class="str">"valid_id"</span>, <span class="str">"txn_id IS NOT NULL"</span>)
<span class="kw">@dlt.expect_or_fail</span>(<span class="str">"valid_amt"</span>, <span class="str">"amount &gt; 0.0"</span>)
<span class="kw">def</span> silver_txns():
    <span class="kw">return</span> <span class="var">dlt</span>.read_stream(<span class="str">"bronze_txns"</span>).filter(<span class="cls">F</span>.col(<span class="str">"status"</span>) != <span class="str">"REJECT"</span>)</pre>
        <div class="alert alert-tip">
          💡 <b>DLT Expectations:</b> <code>expect</code> (logs metric), <code>expect_or_drop</code> (drops bad rows), <code>expect_or_fail</code> (fails pipeline on violation).
        </div>
      </div>

      <!-- Card 3: Change Data Capture (CDC) with dlt.apply_changes -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🔄 CDC Ingestion with dlt.apply_changes()</span>
          <span class="card-tag">SCD Type 1 & 2</span>
        </div>
        <pre class="code"><span class="kw">import</span> dlt

<span class="cm"># Automatic SCD Type 2 History Tracking</span>
<span class="var">dlt</span>.create_streaming_table(<span class="str">"gold_customers_scd2"</span>)

<span class="var">dlt</span>.apply_changes(
    target=<span class="str">"gold_customers_scd2"</span>,
    source=<span class="str">"silver_customer_cdc"</span>,
    keys=[<span class="str">"customer_id"</span>],
    sequence_by=<span class="str">"updated_timestamp"</span>,
    apply_as_deletes=<span class="str">"operation = 'DELETE'"</span>,
    except_column_list=[<span class="str">"operation"</span>],
    stored_as_scd_type=<span class="num">2</span> <span class="cm"># Auto creates __START_AT and __END_AT</span>
)</pre>
        <ul class="rules-list">
          <li><code>stored_as_scd_type=1</code> overwrites records in place (latest snapshot).</li>
          <li><code>stored_as_scd_type=2</code> manages effective date ranges and active flags out-of-the-box!</li>
        </ul>
      </div>

      <!-- Card 4: pandas API on Spark (ps) -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🐼 pandas API on Spark (pyspark.pandas)</span>
          <span class="card-tag">Scale pandas</span>
        </div>
        <pre class="code"><span class="kw">import</span> pyspark.pandas <span class="kw">as</span> ps

<span class="cm"># Read distributed data using familiar pandas syntax</span>
<span class="var">psdf</span> = <span class="var">ps</span>.read_parquet(<span class="str">"abfss://gold@adls.../sales/"</span>)

<span class="cm"># Distributed GroupBy & Summary Aggregations</span>
<span class="var">summary</span> = <span class="var">psdf</span>.groupby(<span class="str">"country"</span>)[<span class="str">"revenue"</span>].agg([<span class="str">"mean"</span>, <span class="str">"sum"</span>, <span class="str">"count"</span>])

<span class="cm"># Seamless Two-Way Conversion</span>
<span class="var">spark_df</span> = <span class="var">psdf</span>.to_spark()
<span class="var">ps_df_again</span> = <span class="var">spark_df</span>.to_pandas_on_spark()</pre>
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
        <table class="mini-table">
          <tr><th>Magic</th><th>Language / Action</th><th>Behavior & Scope</th></tr>
          <tr><td><code>%python</code></td><td>Python 3</td><td>Default language; shares local variables across notebook cells</td></tr>
          <tr><td><code>%sql</code></td><td>Spark SQL</td><td>Executes SQL query; accessible via <code>_sqldf</code> DataFrame</td></tr>
          <tr><td><code>%sh</code></td><td>Bash Shell</td><td>Runs bash on the driver node container</td></tr>
          <tr><td><code>%fs</code></td><td>Databricks FS</td><td>Shorthand for <code>dbutils.fs</code> (e.g. <code>%fs ls /Volumes</code>)</td></tr>
          <tr><td><code>%pip</code></td><td>pip install</td><td>Installs library scoped to the current notebook session only</td></tr>
          <tr><td><code>%run</code></td><td>Sub-notebook</td><td>Executes another notebook in-line and inherits all its variables</td></tr>
        </table>
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
      name: "[prod] Nightly Settlement Job"
      tasks:
        - task_key: run_dlt
          pipeline_task:
            pipeline_id: 489a-bc12-dlt-id</pre>
        <table class="mini-table">
          <tr><th>CLI Command</th><th>Action</th></tr>
          <tr><td><code>databricks bundle validate</code></td><td>Lints and verifies bundle syntax</td></tr>
          <tr><td><code>databricks bundle deploy -t prod</code></td><td>Deploys resources to target workspace</td></tr>
          <tr><td><code>databricks bundle run nightly_settlement</code></td><td>Executes workflow immediately</td></tr>
        </table>
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
            "timestamp": datetime.utcnow().isoformat(),
            "pipeline": self.name,
            "event": event_name,
            "records_processed": records,
            "duration_sec": duration_sec
        }
        print(json.dumps(payload)) <span class="cm"># Ingested into Azure Log Analytics</span>

<span class="var">audit</span> = StructuredPipelineLogger(<span class="str">"SEPA_Payment_Processor"</span>)
<span class="var">audit</span>.log_event(<span class="str">"STAGE_COMPLETED"</span>, records=<span class="num">845000</span>, duration_sec=<span class="num">14.2</span>)</pre>
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
    <span class="cm"># Resilient REST API caller</span>
    <span class="kw">return</span> {"page": page_id, "data": [<span class="num">1</span>, <span class="num">2</span>, <span class="num">3</span>]}

<span class="cm"># Parallelize lightweight API calls on Driver before Spark processing</span>
<span class="kw">with</span> ThreadPoolExecutor(max_workers=<span class="num">8</span>) <span class="kw">as</span> executor:
    <span class="var">results</span> = list(executor.map(fetch_api_page, range(<span class="num">1</span>, <span class="num">50</span>)))</pre>
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
    <span class="kw">assert</span> primary_key <span class="kw">in</span> df.columns, f"Missing required key: {primary_key}"
    <span class="kw">return</span> df.filter(business_rule(df[primary_key]))</pre>
        <ul class="rules-list">
          <li>Enforce PEP 484 type hints across modular libraries.</li>
          <li>Pre-flight assertions catch schema mismatch errors in milliseconds before distributed stages start.</li>
        </ul>
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
        <div class="alert alert-tip">
          💡 <b>pyspark.testing:</b> Use <code>assertDataFrameEqual</code> and <code>assertSchemaEqual</code> in pytest to validate transformations without third-party libraries.
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
  .card:hover { transform: translateY(-4px); border-color: #38bdf8; }
  .card-img-wrapper {
    background: #030712;
    height: 220px;
    overflow: hidden;
    position: relative;
    border-bottom: 1px solid #1e293b;
  }
  .card-img-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
    transition: transform 0.3s;
  }
  .card:hover .card-img-wrapper img { transform: scale(1.03); }
  .card-body { padding: 18px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
  .card-title { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .card-desc { font-size: 12px; color: #94a3b8; line-height: 1.4; margin-bottom: 15px; }
  .card-actions { display: flex; gap: 8px; }
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
  .btn-primary:hover { background: #e02e1b; }
  .btn-secondary { background: #1e293b; color: #e2e8f0; border: 1px solid #334155; }
  .btn-secondary:hover { background: #334155; }

  .mega-banner {
    background: linear-gradient(135deg, #1e1e2f, #111827);
    border: 1px solid #3b82f6;
    border-radius: 8px;
    padding: 25px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
  }
  .mega-banner h2 { font-size: 20px; color: #fff; margin-bottom: 6px; }
  .mega-banner p { font-size: 13px; color: #94a3b8; }
</style>
</head>
<body>
  <div class="container">
    <header>
      <h1>DATABRICKS DEVELOPER & ARCHITECT CHEAT SHEETS</h1>
      <p>High-Density Executive Reference Guides for Spark SQL, PySpark, Spark Core & Python in Databricks</p>
      <div class="badges">
        <span class="badge badge-orange">Santosh Jammi | Principal Data Architect</span>
        <span class="badge">DBR 15.4 / 16.0 LTS</span>
        <span class="badge">Photon Engine</span>
        <span class="badge">Unity Catalog</span>
      </div>
    </header>

    <div class="mega-banner">
      <div>
        <h2>📚 Master Databricks Complete 8-Page Mega Cheat Sheet</h2>
        <p>The unified all-in-one edition combining Spark SQL, PySpark, Spark Core & Python into a single comprehensive PDF & panoramic posters.</p>
      </div>
      <div>
        <a href="../pdf/databricks_master_cheatsheet.pdf" target="_blank" class="btn btn-primary" style="padding: 10px 20px;">Download Master PDF</a>
      </div>
    </div>

    <div class="grid">
      <!-- 1. Spark SQL -->
      <div class="card">
        <div class="card-img-wrapper">
          <img src="../images/databricks_sparksql_page_1.png" alt="Spark SQL Cheat Sheet">
        </div>
        <div class="card-body">
          <div>
            <h3 class="card-title">⚡ Spark SQL Cheat Sheet</h3>
            <p class="card-desc">Unity Catalog 3-level namespace, Liquid Clustering, Delta Lake MERGE INTO, Time Travel, Windowing, QUALIFY deduplication, PIVOT & Row Filters.</p>
          </div>
          <div class="card-actions">
            <a href="../pdf/databricks_sparksql_cheatsheet.pdf" target="_blank" class="btn btn-primary">PDF (2 Pages)</a>
            <a href="../images/databricks_sparksql_poster.png" target="_blank" class="btn btn-secondary">Poster Image</a>
          </div>
        </div>
      </div>

      <!-- 2. PySpark -->
      <div class="card">
        <div class="card-img-wrapper">
          <img src="../images/databricks_pyspark_page_1.png" alt="PySpark Cheat Sheet">
        </div>
        <div class="card-body">
          <div>
            <h3 class="card-title">🔥 PySpark Cheat Sheet</h3>
            <p class="card-desc">DataFrame APIs, strict schemas (StructType), functions (F), Broadcast Joins, Skew Salting, DeltaTable API, Auto Loader Streaming & foreachBatch.</p>
          </div>
          <div class="card-actions">
            <a href="../pdf/databricks_pyspark_cheatsheet.pdf" target="_blank" class="btn btn-primary">PDF (2 Pages)</a>
            <a href="../images/databricks_pyspark_poster.png" target="_blank" class="btn btn-secondary">Poster Image</a>
          </div>
        </div>
      </div>

      <!-- 3. Spark Core -->
      <div class="card">
        <div class="card-img-wrapper">
          <img src="../images/databricks_spark_core_page_1.png" alt="Spark Core Cheat Sheet">
        </div>
        <div class="card-body">
          <div>
            <h3 class="card-title">⚙️ Spark Core & Architecture</h3>
            <p class="card-desc">Cluster Topology, JVM Memory Allocation, Shuffles & Spills, Catalyst Pipeline, Whole-Stage CodeGen, Photon C++, Sizing Math & Spark UI Triage.</p>
          </div>
          <div class="card-actions">
            <a href="../pdf/databricks_spark_core_cheatsheet.pdf" target="_blank" class="btn btn-primary">PDF (2 Pages)</a>
            <a href="../images/databricks_spark_core_poster.png" target="_blank" class="btn btn-secondary">Poster Image</a>
          </div>
        </div>
      </div>

      <!-- 4. Python in Databricks -->
      <div class="card">
        <div class="card-img-wrapper">
          <img src="../images/databricks_python_page_1.png" alt="Python Cheat Sheet">
        </div>
        <div class="card-body">
          <div>
            <h3 class="card-title">🐍 Python in Databricks</h3>
            <p class="card-desc">DBUtils (fs, secrets, notebook, widgets), Delta Live Tables (DLT) & CDC, pandas on Spark, Magic Commands, DABs CI/CD, Observability & Pytest.</p>
          </div>
          <div class="card-actions">
            <a href="../pdf/databricks_python_cheatsheet.pdf" target="_blank" class="btn btn-primary">PDF (2 Pages)</a>
            <a href="../images/databricks_python_poster.png" target="_blank" class="btn btn-secondary">Poster Image</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>"""
    with open(os.path.join(HTML_DIR, "index.html"), "w") as f:
        f.write(html)
    print("  ✓ Created Web Hub: cheatsheets/html/index.html")

def main():
    print("==================================================================")
    print("Building Databricks Cheat Sheets (12-Card Ultra Dense Edition)")
    print("Author: Santosh Jammi | Principal Data Architect")
    print("==================================================================")

    sheets = [
        ("sparksql", "databricks_sparksql_cheatsheet", "Databricks Spark SQL Ultimate Cheat Sheet", "#00A3E0", "#38BDF8", SPARKSQL_BODY),
        ("pyspark", "databricks_pyspark_cheatsheet", "Databricks PySpark Enterprise Cheat Sheet", "#E25A1C", "#FB923C", PYSPARK_BODY),
        ("spark_core", "databricks_spark_core_cheatsheet", "Apache Spark Core & Architecture Cheat Sheet", "#8B5CF6", "#A78BFA", SPARK_CORE_BODY),
        ("python", "databricks_python_cheatsheet", "Python in Databricks Master Cheat Sheet", "#3776AB", "#60A5FA", PYTHON_BODY)
    ]

    # Generate the 4 dedicated sheets
    for short_name, filename, title, theme_color, title_color, body_content in sheets:
        print(f"\n--- Generating {filename} ---")
        html_content = generate_full_html(title, theme_color, title_color, body_content)
        html_file = os.path.join(HTML_DIR, f"{short_name}.html")
        with open(html_file, "w") as f:
            f.write(html_content)
        print(f"  ✓ Wrote HTML: {os.path.basename(html_file)}")

        pdf_file = os.path.join(PDF_DIR, f"{filename}.pdf")
        compile_pdf(html_file, pdf_file)

        render_images(pdf_file, f"databricks_{short_name}", dpi=250)

    # Generate the Master 8-Page Mega Cheat Sheet
    print(f"\n--- Generating databricks_master_cheatsheet ---")
    master_body = SPARKSQL_BODY + "\n" + PYSPARK_BODY + "\n" + SPARK_CORE_BODY + "\n" + PYTHON_BODY
    master_html = generate_full_html(
        "Databricks Developer & Architect Master Cheat Sheet (Complete 8-Page Edition)",
        "#FF3621", "#38BDF8", master_body
    )
    master_html_file = os.path.join(HTML_DIR, "master.html")
    with open(master_html_file, "w") as f:
        f.write(master_html)
    print(f"  ✓ Wrote HTML: master.html")

    master_pdf_file = os.path.join(PDF_DIR, "databricks_master_cheatsheet.pdf")
    compile_pdf(master_html_file, master_pdf_file)
    render_images(master_pdf_file, "databricks_master", dpi=250)

    generate_index_html()
    print("\n==================================================================")
    print("ALL 12-CARD CHEAT SHEETS, PDFS AND POSTERS REBUILT SUCCESSFULLY!")
    print("==================================================================")

if __name__ == "__main__":
    main()
