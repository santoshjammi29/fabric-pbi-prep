#!/usr/bin/env python3
"""Builds the full PySpark curriculum HTML and injects it into index.html."""

import re

# ── Helpers ────────────────────────────────────────────────────────────────

def phase_header(num, title, desc, badge_class):
    return f'''          <div class="pyspark-phase-block" data-phase="{num}">
            <div class="pyspark-phase-header">
              <div class="phase-badge {badge_class}">Phase {num}</div>
              <div>
                <h3 class="phase-title">{title}</h3>
                <p class="phase-desc">{desc}</p>
              </div>
            </div>'''

def level_card(num, phase, title, tag, scenario, code, mechanics):
    # Escape HTML entities in code
    code_escaped = code.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    return f'''            <div class="pyspark-level-card" data-phase="{phase}">
              <div class="level-card-header" onclick="this.parentElement.classList.toggle('expanded')">
                <div class="level-badge">L{num}</div>
                <div class="level-meta">
                  <h4 class="level-title">{title}</h4>
                  <p class="level-tag">{tag}</p>
                </div>
                <svg class="level-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div class="level-card-body">
                <div class="level-scenario">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                  <p><strong>Enterprise Scenario:</strong> {scenario}</p>
                </div>
                <pre class="code-block"><code>{code_escaped}</code></pre>
                <div class="level-mechanics">
                  <h5>Physical Execution &amp; Internal Mechanics</h5>
                  <p>{mechanics}</p>
                </div>
              </div>
            </div>'''


# ── Level data ─────────────────────────────────────────────────────────────

LEVELS = [
  # ── Phase 1 ──
  dict(num=1, phase=1, title="Distributed Architecture and the Spark Connect Session",
       tag="Spark Connect · gRPC · JVM-Free Client · SparkSession",
       scenario="An Airflow container triggers a job on a remote cluster without a local JVM. Spark Connect initializes a gRPC-based thin-client — no Py4J bridge required.",
       code='''\
from pyspark.sql import SparkSession

# Remote gRPC connection — no local JVM needed
spark = SparkSession.builder \\
   .remote("sc://enterprise-spark-cluster:15002") \\
   .appName("FinancialTelemetryIngestion") \\
   .config("spark.sql.adaptive.enabled", "true") \\
   .config("spark.memory.offHeap.enabled", "true") \\
   .getOrCreate()

print(f"Active App: {spark.conf.get('spark.app.name')}")''',
       mechanics="Spark Connect constructs unresolved logical plans natively in Python using <strong>protocol buffers</strong>, transmitting them over gRPC to the Spark Server. The client requires no local JVM, enabling fully decoupled versioning between client and cluster. Result retrieval uses <strong>Apache Arrow streaming</strong> instead of Py4J serialization."),

  dict(num=2, phase=1, title="Scalable Data Ingestion and Format Selection",
       tag="Parquet · Static Schema · Predicate Pushdown · DROPMALFORMED",
       scenario="Processing millions of e-commerce clickstream events from S3/ADLS. A static schema avoids expensive cluster-wide schema inference. Columnar Parquet enables predicate pushdown at the storage layer — filters apply before data enters executor memory.",
       code='''\
from pyspark.sql.types import StructType, StructField, StringType, TimestampType

clickstream_schema = StructType([
    StructField("user_id", StringType(), nullable=False),
    StructField("event_type", StringType(), nullable=True),
    StructField("event_time", TimestampType(), nullable=True)
])

# Static schema bypasses cluster-wide schema inference
clickstream_df = spark.read \\
   .schema(clickstream_schema) \\
   .option("mode", "DROPMALFORMED") \\
   .json("s3a://raw-data-lake/clickstreams/date=2026-05-29/")

clickstream_df.write \\
   .mode("append") \\
   .parquet("s3a://processed-data-lake/clickstreams/")''',
       mechanics="Relying on schema inference forces a full cluster-wide scan to determine types. Parquet/ORC formats embed schema in file metadata, enabling <strong>predicate pushdown</strong> — filters are evaluated at the storage layer, dramatically reducing I/O before data enters executor memory."),

  dict(num=3, phase=1, title="Core DataFrame Operations and Columnar Pruning",
       tag="select · filter · withColumn · drop · Narrow Transformations · Tungsten",
       scenario="IoT telemetry pipeline reads thousands of sensor columns, but analytics only require temperature and pressure. Columnar pruning skips all other data blocks at read time — zero wasted I/O.",
       code='''\
from pyspark.sql.functions import col, round, current_timestamp

refined_df = raw_telemetry_df \\
   .select("sensor_id", "temperature_c", "pressure_hpa", "battery_level") \\
   .filter((col("temperature_c") >= -50.0) & (col("temperature_c") <= 150.0)) \\
   .filter(col("battery_level") > 10) \\
   .withColumn("temperature_f", round((col("temperature_c") * 9/5) + 32, 2)) \\
   .withColumn("processed_at", current_timestamp()) \\
   .drop("battery_level", "temperature_c")''',
       mechanics="All operations here are <strong>narrow transformations</strong> — no data moves across the network. For Parquet sources, <code>select</code> triggers columnar pruning at the storage reader level. The Tungsten engine evaluates filters and math derivations in a single compiled loop over off-heap binary data — zero Java or Python object instantiation per record."),

  dict(num=4, phase=1, title="Lazy Evaluation, DAG Construction, and Actions",
       tag="Lazy Evaluation · Catalyst · DAG · count() · Actions vs Transformations",
       scenario="Complex ETL for financial transaction logs. Lazy evaluation lets Catalyst restructure the entire query plan — pushing filters before joins, reordering operations — before committing any compute resources.",
       code='''\
# Transformation 1: No computation — builds unresolved logical plan
high_value_df = transaction_df.filter(col("amount") > 10000)

# Transformation 2: Plan extends, still no execution
flagged_df = high_value_df.withColumn("requires_audit", col("amount") > 50000)

# Action: Triggers full DAG compilation and physical execution
total_flagged = flagged_df.count()
print(f"Total requiring audit: {total_flagged}")''',
       mechanics="Each transformation only records lineage into an <strong>unresolved logical plan</strong>. Actions (<code>count()</code>, <code>show()</code>, <code>collect()</code>, <code>write()</code>) dispatch the plan to Catalyst, which: <strong>resolves columns</strong> via the Catalog → <strong>optimizes</strong> (filter pushdown, join reordering, constant folding) → generates a <strong>Physical DAG</strong> → splits into Tasks → distributes to executors."),

  dict(num=5, phase=1, title="Messy Data Management and Type Casting",
       tag="dropDuplicates · fillna · cast · coalesce() · HashAggregate · Wide vs Narrow",
       scenario="CRM records are rife with duplicates, type mismatches, and nulls from disparate upstream APIs. These preprocessing steps must be surgically efficient — dropDuplicates triggers a costly shuffle; fillna does not.",
       code='''\
from pyspark.sql.functions import coalesce, lit

cleansed_df = raw_crm_df \\
   .dropDuplicates(["customer_email", "phone_number"]) \\
   .withColumn("account_balance", col("account_balance_str").cast("double")) \\
   .drop("account_balance_str") \\
   .fillna({"loyalty_tier": "Standard", "account_balance": 0.0})

final_df = cleansed_df.withColumn(
    "primary_contact",
    coalesce(col("phone_number"), col("customer_email"), lit("NO_CONTACT"))
)''',
       mechanics="<code>dropDuplicates</code> is a <strong>wide transformation</strong> — forces a full cluster shuffle, hashing rows by the specified columns, then a <code>HashAggregate</code> discards duplicates. <code>fillna</code> and <code>cast</code> are narrow, evaluated inside the Tungsten loop with no network transfer. The <code>coalesce()</code> <em>function</em> (not to be confused with <code>DataFrame.coalesce()</code>) returns the first non-null value per row in a single pass."),

  # ── Phase 2 ──
  dict(num=6, phase=2, title="Complex Aggregations and Multi-dimensional Pivoting",
       tag="groupBy · pivot · Explicit Pivot Values · Two-Phase HashAggregate",
       scenario="Retail logistics generating inventory matrices: stock volume by warehouse region × product category. Explicit pivot values bypass an eager category-discovery scan that would otherwise block the entire pipeline.",
       code='''\
from pyspark.sql.functions import sum, avg

# Explicit list prevents an eager full-table scan to find categories
pivot_categories = ["Electronics", "Apparel", "Home_Goods", "Groceries"]

inventory_summary = inventory_df \\
   .groupBy("warehouse_region") \\
   .pivot("product_category", pivot_categories) \\
   .agg(
        sum("stock_level").alias("total_stock"),
        avg("restock_lead_time_days").alias("avg_lead_time")
    )''',
       mechanics="Without an explicit pivot list, the engine triggers an <strong>immediate, eager job</strong> to scan the full table for distinct category values before the main aggregation can begin. Standard groupBy aggregation uses a <strong>two-phase approach</strong>: partial aggregation (map-side, reduces shuffle bytes) → full aggregation (reduce-side, post-shuffle), producing the pivot columns directly from the optimized logical plan."),

  dict(num=7, phase=2, title="Analytical Window Functions for Sequential Ranking",
       tag="row_number · rank · dense_rank · WindowSpec · HashPartitioning Shuffle",
       scenario="Fraud detection sessionization — isolate the most recent transaction per user, or rank events chronologically within a session. Window functions compute over related rows without collapsing the dataset.",
       code='''\
from pyspark.sql.window import Window
from pyspark.sql.functions import row_number, rank, dense_rank

user_window = Window.partitionBy("user_id").orderBy(col("event_time").desc())

ranked_df = clickstream_df \\
   .withColumn("seq_num", row_number().over(user_window)) \\
   .withColumn("event_rank", rank().over(user_window)) \\
   .withColumn("dense_rank", dense_rank().over(user_window))

# Strictly the latest event per user
latest_event_df = ranked_df.filter(col("seq_num") == 1)''',
       mechanics="Window functions mandate a <strong>HashPartitioning shuffle</strong> — all records for the same <code>partitionBy</code> key must co-locate on one executor. The <code>WindowExec</code> operator then sorts the local data (Tungsten off-heap sort keys, contiguous memory for CPU cache hits) before applying the ranking function. <code>row_number()</code> produces no ties; <code>rank()</code> creates gaps; <code>dense_rank()</code> produces no gaps."),

  dict(num=8, phase=2, title="Time-Series Window Frames and Rolling Metrics",
       tag="lag · lead · rowsBetween · Rolling Aggregates · Sliding Frame Buffer",
       scenario="IoT telemetry or stock ticker data requiring rolling averages, previous reading (lag), next reading (lead), and day-over-day temperature delta — all computed in a single sorted pass.",
       code='''\
from pyspark.sql.functions import lag, lead, avg

cumulative_win = Window.partitionBy("sensor_id") \\
   .orderBy("timestamp") \\
   .rowsBetween(Window.unboundedPreceding, Window.currentRow)

offset_win = Window.partitionBy("sensor_id").orderBy("timestamp")

trends_df = telemetry_df \\
   .withColumn("rolling_avg", avg("temperature").over(cumulative_win)) \\
   .withColumn("prev_reading", lag("temperature", 1).over(offset_win)) \\
   .withColumn("next_reading", lead("temperature", 1).over(offset_win)) \\
   .withColumn("temp_delta", col("temperature") - col("prev_reading"))''',
       mechanics="Rolling aggregates use a <strong>sliding frame buffer</strong>. As the engine iterates through the pre-sorted partition, the buffer dynamically ingests new rows and evicts rows outside <code>rowsBetween</code> bounds. For bounded windows, the aggregate state is <strong>incrementally updated</strong> (add new value, subtract evicted value) rather than recomputing the entire buffer for every row — O(1) per row instead of O(window size)."),

  dict(num=9, phase=2, title="Unnesting Complex Hierarchical Data Structures",
       tag="explode · explode_outer · GenerateExec · Struct · Array · Map types",
       scenario="MongoDB/Kafka e-commerce orders where cart items are an array of embedded structs. Flatten into standard relational rows for downstream warehouse ingestion via a GenerateExec operator.",
       code='''\
from pyspark.sql.functions import explode, explode_outer

# explode: creates N rows per array element, drops null/empty arrays
flattened_df = order_df \\
   .select("order_id", "customer_id", explode("cart_items").alias("item")) \\
   .select(
        col("order_id"),
        col("customer_id"),
        col("item.product_id").alias("product_id"),
        col("item.quantity").alias("quantity"),
        col("item.unit_price").alias("price")
    )

# explode_outer: preserves parent row even if array is null/empty
safe_df = order_df.select("order_id", explode_outer("cart_items"))''',
       mechanics="<code>explode</code> maps to a <strong>GenerateExec</strong> physical operator. For an array of N elements, one input row emits N output rows, duplicating scalar columns (order_id, customer_id) for each. Empty/null arrays cause the parent row to be <em>silently dropped</em> by standard <code>explode</code>. <code>explode_outer</code> yields at least one row with null exploded values, preserving data completeness for downstream NULL-aware analytics."),

  dict(num=10, phase=2, title="Relational Joins and Broadcast Optimization",
       tag="BroadcastHashJoin · SortMergeJoin · autoBroadcastJoinThreshold · Map-Side Join",
       scenario="Joining billions of transaction records with a few thousand product catalog entries. Naive SortMergeJoin triggers catastrophic cluster-wide shuffle. Broadcast join replicates the small dimension table to every executor's memory.",
       code='''\
from pyspark.sql.functions import broadcast

# Disable auto-broadcast for explicit control in development
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", -1)

# broadcast() hint forces BroadcastHashJoin physical strategy
enriched_df = sales_fact_df.join(
    broadcast(product_dim_df),
    sales_fact_df.product_id == product_dim_df.product_id,
    how="inner"
)''',
       mechanics="Standard <strong>SortMergeJoin</strong>: hash both tables → shuffle across network → sort → merge. With broadcast hint, the <strong>Driver</strong> collects the small table, serializes it, and pushes an immutable copy to every executor's memory. The fact table is then processed entirely locally — <strong>map-side join</strong>, zero network traversal. Critical risk: <strong>Driver OOM</strong> if the broadcasted table exceeds driver memory allocation."),

  dict(num=11, phase=2, title="Advanced Join Semantics for Data Validation",
       tag="left_semi · left_anti · Short-Circuit Logic · Existence Validation",
       scenario="Find firewall IPs not in a threat intelligence database (anti-join). Find campaign users who made purchases (semi-join). Both are vastly more efficient than outer join + null filtering.",
       code='''\
# Left Semi: returns left rows that HAVE a match — right columns NOT appended
active_users_df = users_df.join(
    purchases_df, on="user_id", how="left_semi"
)

# Left Anti: returns left rows that DO NOT have a match
unregistered_df = web_logs_df.join(
    registered_users_df, on="ip_address", how="left_anti"
)''',
       mechanics="Semi/Anti joins use <strong>short-circuit logic</strong>. While streaming the left table against the right's hash map: for <code>left_semi</code>, the moment a match is found the row is kept and the executor moves on — the right row payload is never materialized. For <code>left_anti</code>, absence of any match keeps the row. Far more efficient than <code>LEFT OUTER JOIN ... WHERE right.key IS NULL</code> which must materialize all null rows before filtering."),

  dict(num=12, phase=2, title="Standard vs Vectorized Pandas UDFs",
       tag="pandas_udf · Apache Arrow · Vectorized Batches · Row-by-Row Pickle Penalty",
       scenario="Telecom churn scoring with a logistic regression formula. Standard Python UDFs serialize data row-by-row via pickle — catastrophic throughput. Pandas UDFs transfer entire Arrow-encoded batches with near-zero overhead.",
       code='''\
import pandas as pd
import numpy as np
from pyspark.sql.functions import pandas_udf

@pandas_udf("double")
def calculate_churn_prob(tenure: pd.Series, charges: pd.Series) -> pd.Series:
    # Vectorized NumPy operations — C-backed, no per-row Python overhead
    linear = (tenure * -0.05) + (charges * 0.02)
    return 1 / (1 + np.exp(-linear))

scored_df = customer_df.withColumn(
    "churn_prob",
    calculate_churn_prob(col("tenure"), col("monthly_charges"))
)''',
       mechanics="Standard UDF: JVM pickle-serializes data <strong>row by row</strong> → pipes to Python worker → deserializes → evaluates → re-serializes → back to JVM. Every row is a round-trip. Pandas UDF: Tungsten transfers <strong>contiguous Arrow-encoded blocks</strong> directly into the Python process's memory space. The UDF operates on C-backed NumPy arrays — near-zero serialization overhead, orders of magnitude faster."),

  dict(num=13, phase=2, title="Iterator-to-Iterator Pandas UDFs for ML Inference",
       tag="Iterator Pattern · Model Amortization · Arrow Batches · LLM / GPU Inference",
       scenario="Loading a multi-GB PyTorch model or LLM for every Arrow batch is catastrophically slow. The Iterator UDF loads the model exactly once per worker task and streams all batches through it — amortizing startup cost across millions of rows.",
       code='''\
from typing import Iterator
from pyspark.sql.functions import pandas_udf

@pandas_udf("double")
def predict_iterator(iterator: Iterator) -> Iterator:
    # Model loads ONCE per Python worker — not per batch
    model = load_heavy_model()

    for series in iterator:
        # Each Arrow batch is yielded back to Spark
        yield model(series)

predictions_df = features_df.withColumn(
    "prediction", predict_iterator(col("feature_vector"))
)''',
       mechanics="The <code>Iterator[pd.Series] -> Iterator[pd.Series]</code> type hint changes the worker lifecycle. Spark spins up the Python worker and passes a <strong>generator object</strong>. Code before the <code>for</code> loop (model loading, GPU memory allocation) executes <em>exactly once per task</em>. The generator then <code>yield</code>s predictions back to the JVM continuously, amortizing heavy startup cost across all Arrow batches processed by that single worker invocation."),

  # ── Phase 3 ──
  dict(num=14, phase=3, title="Diagnostic Telemetry via the Spark UI and DAG",
       tag="Spark UI · Stages · Tasks · Shuffle Read/Write · GC Time · Straggler Detection",
       scenario="A pipeline passes local tests but stalls indefinitely on a production cluster. The Spark UI is your diagnostic nervous system. Disproportionate shuffle volumes indicate skew; spiking GC time indicates heap memory pressure.",
       code='''\
# Tag jobs for traceability in the Spark UI
spark.sparkContext.setJobGroup("daily_etl", "Fact Table Enrichment Phase")

analysis_df = fact_df.join(dim_df, "id").groupBy("category").count()

# "noop" format forces full plan execution without actual disk I/O
# Ideal for plan analysis and benchmarking without side effects
analysis_df.write.format("noop").mode("overwrite").save()''',
       mechanics="DAG hierarchy: <strong>Jobs</strong> (per action) → <strong>Stages</strong> (delimited by shuffle boundaries: joins, aggregations, window functions) → <strong>Tasks</strong> (one per partition, one core). Diagnostic signals to watch: <strong>Shuffle Read/Write imbalance</strong> across tasks = data skew → apply salting (L20). <strong>GC Time &gt; 10% of task time</strong> = heap pressure → enable OFF_HEAP or reduce <code>memory.fraction</code>. <strong>One task running 10x longer</strong> = straggler partition."),

  dict(num=15, phase=3, title="The Catalyst Optimizer and Query Planning",
       tag="Unresolved Plan · Catalog · Rule-Based Optimization · CBO · explain(extended)",
       scenario="Understanding why predicate pushdown fails. Wrapping filters inside UDFs or using Python conditionals opaque the plan from Catalyst. explain(mode='extended') reveals all four plan stages to diagnose the issue.",
       code='''\
query_df = large_df.join(small_df, "key") \\
   .filter(large_df.status == "ACTIVE") \\
   .select("key", "value")

# Shows: Unresolved -> Resolved -> Optimized -> Physical plans
query_df.explain(mode="extended")

# Check statistics for CBO (must be collected first)
spark.sql("ANALYZE TABLE large_df COMPUTE STATISTICS FOR ALL COLUMNS")''',
       mechanics="Catalyst's 4 phases: <strong>①</strong> Unresolved Logical Plan (API construction) → <strong>②</strong> Resolved Plan (column validation via Catalog metadata) → <strong>③</strong> Optimized Plan (rule-based: constant folding, filter pushdown <em>before</em> joins, join reordering) → <strong>④</strong> Physical Plan selection via Cost-Based Optimizer (CBO): chooses SortMergeJoin vs BroadcastHashJoin vs ShuffledHashJoin based on collected table statistics."),

  dict(num=16, phase=3, title="Bare-Metal Performance via the Tungsten Engine",
       tag="OFF_HEAP · UnsafeRow · WSCG · SIMD · Cache-Aware Computation · GC Elimination",
       scenario="Processing high-frequency trading data or large unstructured text without JVM garbage collection pauses. Tungsten bypasses Java's object model entirely — data stored as binary blocks, invisible to GC.",
       code='''\
# Enable full off-heap Tungsten processing
spark.conf.set("spark.memory.offHeap.enabled", "true")
spark.conf.set("spark.memory.offHeap.size", "4g")  # Per executor

# Verify WSCG is active (default: true in Spark 2+)
spark.conf.set("spark.sql.codegen.wholeStage", "true")''',
       mechanics="Tungsten's three pillars: <strong>① Off-heap Memory</strong> — data stored as binary <code>UnsafeRow</code> in OS memory, zero JVM GC overhead. <strong>② Cache-Aware Computation</strong> — algorithms align memory access to CPU L1/L2 cache lines, maximizing retrieval speed. <strong>③ Whole-Stage Code Generation (WSCG)</strong> — Catalyst compiles the <em>entire</em> physical plan into a single fused Java bytecode function at runtime, eliminating the Volcano iterator's per-record <code>next()</code> calls. Also supports <strong>SIMD</strong> vectorized CPU instructions for batch operations."),

  dict(num=17, phase=3, title="Executor Memory Partitioning and Management",
       tag="memory.fraction · storageFraction · Execution Memory · Storage Memory · Dynamic Borrowing",
       scenario="A cluster with terabytes of RAM still produces OOM errors during complex joins. Understanding how an executor divides its memory pool between active execution and cached data prevents misconfiguration.",
       code='''\
# Tune memory fractions based on workload characteristics
spark.conf.set("spark.memory.fraction", "0.6")     # 60% of heap for Spark
spark.conf.set("spark.memory.storageFraction", "0.4")  # 40% of pool for cache

# For iterative ML: increase storage fraction if caching heavily
# For complex joins/shuffles: increase execution fraction''',
       mechanics="Memory layout: <strong>Reserved (300MB fixed)</strong> → <strong>User Memory</strong> (Python objects, etc.) → <strong>Spark Unified Pool</strong> (controlled by <code>memory.fraction</code>). The Spark pool is bisected into <strong>Execution Memory</strong> (shuffles, joins, sorts) and <strong>Storage Memory</strong> (DataFrame cache). The boundary is <strong>dynamically fluid</strong>: execution can evict cached blocks from storage, but storage <em>cannot</em> evict active execution blocks. This ensures complex queries gracefully degrade to disk spilling rather than failing with OOM."),

  dict(num=18, phase=3, title="Persistence Architectures and Storage Levels",
       tag="persist() · StorageLevel · OFF_HEAP · MEMORY_AND_DISK · LRU Eviction · unpersist()",
       scenario="Iterative algorithms (PageRank, gradient descent, repeated dashboard aggregations) reference the same DataFrame multiple times. Without explicit persistence, the full DAG recomputes from source for every action.",
       code='''\
from pyspark import StorageLevel

intermediate_df = source_data.filter(col("is_valid") == True)

# OFF_HEAP: serialized binary, completely GC-invisible, fastest for iteration
intermediate_df.persist(StorageLevel.OFF_HEAP)

initial_count = intermediate_df.count()   # Materializes and caches blocks

# Subsequent actions read directly from off-heap cache
summary_df = intermediate_df.groupBy("category").sum("amount")

# Always release when done to free memory
intermediate_df.unpersist()''',
       mechanics="<code>cache()</code> = <code>MEMORY_AND_DISK</code> with deserialized Java objects (subject to GC pressure). <code>persist(OFF_HEAP)</code> writes serialized binary directly to OS-managed memory — <strong>completely GC-invisible</strong>. If the dataset exceeds configured <code>spark.memory.offHeap.size</code>, the <strong>LRU eviction policy</strong> discards least-recently-used blocks; evicted blocks are transparently recomputed via their lineage DAG if requested again. Always call <code>unpersist()</code> when the data is no longer needed."),

  dict(num=19, phase=3, title="Partition Topology and the Small Files Problem",
       tag="repartition · coalesce · partitionBy · Small Files · Object Storage Metadata Cost",
       scenario="Writing thousands of KB-sized files creates the 'Small Files Problem' — query engines spend more time parsing file metadata than reading actual data. Strategic partition control before writes solves this.",
       code='''\
# repartition: Full network shuffle -> guaranteed uniform distribution
# Use BEFORE heavy processing operations
parallel_df = heavy_df.repartition(200, "user_id")

# coalesce: NO shuffle -> merges adjacent partitions on same node
# Use BEFORE writing to minimize file count without network cost
parallel_df.coalesce(10).write \\
   .partitionBy("event_date") \\
   .parquet("s3a://data-lake/optimized/")''',
       mechanics="<code>repartition(n)</code> triggers a full <strong>network shuffle</strong> using round-robin or hash distribution — guarantees uniform partition sizes but heavy I/O cost. <code>coalesce(n)</code> is a <strong>topological merge</strong> — collapses N existing partitions into fewer by mapping multiple partitions on the same node to one output, with <em>zero network transfer</em>. Optimal pattern: <code>repartition</code> for processing uniformity → <code>coalesce</code> immediately before writes to eliminate small files."),

  dict(num=20, phase=3, title="Handling Data Skew via Salting Techniques",
       tag="Salting · Straggler Tasks · Cartesian Explosion · Skew Hints · OOM Prevention",
       scenario="90% of global sales have country_code='UNKNOWN'. The executor handling that key triggers OOM, bottlenecking the entire cluster. Salting artificially distributes the hot key across N partitions.",
       code='''\
from pyspark.sql.functions import rand, concat, lit, array, explode

salt_factor = 20

# Step 1: Append random integer to fact table join key
salted_sales = sales_df.withColumn(
    "salted_key",
    concat(col("country_code"), lit("_"), (rand() * salt_factor).cast("int"))
)

# Step 2: Replicate dimension table for all possible salt values
salted_dim = country_dim_df \\
   .withColumn("salt_array", array([lit(i) for i in range(salt_factor)])) \\
   .withColumn("salt_val", explode("salt_array")) \\
   .withColumn("salted_key", concat(col("country_code"), lit("_"), col("salt_val")))

# Step 3: Join on distributed keys — 20 uniform tasks instead of 1 hot one
joined_df = salted_sales.join(salted_dim, on="salted_key").drop("salted_key")''',
       mechanics="Without salting, all 'UNKNOWN' records land on one executor — <strong>catastrophic straggler / OOM</strong>. Appending random integer R (0 ≤ R &lt; N) splits one hot partition into N distinct keys ('US_0'...'US_19'). The dimension table undergoes Cartesian expansion (× N rows) to match all possible salt values. Result: <strong>N parallel, manageable tasks</strong> with mathematically guaranteed uniform distribution. Alternative: use AQE's <code>SKEW('table', 'key')</code> hint for automatic transparent salting."),

  dict(num=21, phase=3, title="Adaptive Query Execution (AQE)",
       tag="AQE · Dynamic Coalescing · Join Strategy Switching · Auto Skew · Runtime Metrics",
       scenario="Volatile streaming data makes static plan optimization impossible. AQE re-plans mid-flight based on actual materialized metrics from completed shuffle stages — changing join strategies and merging tiny partitions dynamically.",
       code='''\
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
spark.conf.set("spark.sql.adaptive.localShuffleReader.enabled", "true")

# AQE dynamically re-optimizes this join at runtime
optimized_df = dynamic_fact_df.join(volatile_dim_df, "transaction_id")''',
       mechanics="AQE pauses execution at every <strong>map stage completion</strong> and inspects actual shuffle file byte sizes and row counts. Three automated interventions: <strong>① Dynamic Partition Coalescing</strong> — merges tiny shuffle partitions to reduce scheduler overhead. <strong>② Dynamic Join Strategy</strong> — downgrades SortMergeJoin → BroadcastHashJoin if intermediate data is smaller than anticipated. <strong>③ Automated Skew Handling</strong> — detects oversized partitions and splits them across multiple tasks, executing transparent salting without any code changes."),

  # ── Phase 4 ──
  dict(num=22, phase=4, title="Enterprise Lakehouse Architecture and ACID Transactions",
       tag="Delta Lake · ACID · MERGE (Upsert) · _delta_log · Optimistic Concurrency · GDPR",
       scenario="GDPR 'Right to be Forgotten' requires clean deletion of individual records. Raw Parquet lakes cannot update records without rewriting entire partitions. Delta Lake's ACID MERGE enables surgical, transactionally safe upserts.",
       code='''\
from delta.tables import DeltaTable

delta_table = DeltaTable.forPath(spark, "s3a://lakehouse/enterprise_users/")

# ACID MERGE: update matched records, insert new ones
delta_table.alias("target") \\
 .merge(
    daily_updates_df.alias("source"),
    "target.user_id = source.user_id"
  ) \\
 .whenMatchedUpdateAll() \\
 .whenNotMatchedInsertAll() \\
 .execute()''',
       mechanics="Delta uses <strong>optimistic concurrency control</strong>. MERGE identifies modified records and writes entirely <em>new</em> Parquet files (object storage is immutable — in-place modification is impossible). The transaction is registered in <code>_delta_log</code> — a distributed, JSON-based transaction ledger. If the transaction fails mid-write, the <code>_delta_log</code> is not updated, and intermediate corrupt files remain <strong>invisible to all concurrent readers</strong>, guaranteeing strict atomicity."),

  dict(num=23, phase=4, title="Time Travel, Data Optimization, and Z-Ordering",
       tag="versionAsOf · OPTIMIZE · ZORDER BY · Z-Order Curve · Data Skipping · Audit Queries",
       scenario="Audit queries require the table state as of 30 days ago. OPTIMIZE compacts small files. ZORDER BY on high-cardinality filter columns enables exponential data skipping — reading 5% of files instead of 100%.",
       code='''\
# Time Travel: query table at a specific historical transaction version
historical_df = spark.read.format("delta") \\
   .option("versionAsOf", 14) \\
   .load("s3a://lakehouse/enterprise_users/")

# Also supports timestamp-based travel:
# .option("timestampAsOf", "2026-01-01")

# Compact small files + physically co-locate related data
spark.sql("""
    OPTIMIZE delta.`s3a://lakehouse/enterprise_users/`
    ZORDER BY (region_id, subscription_tier)
""")''',
       mechanics="Time Travel reads the <code>_delta_log</code> backwards, computing file lineage up to the specified <code>versionAsOf</code> transaction ID and ignoring all subsequently added files. <code>OPTIMIZE</code> compacts disparate blocks into ~1GB optimal files. <code>ZORDER BY</code> restructures data using a <strong>Z-order space-filling curve</strong>, physically co-locating related multi-dimensional values on disk. This enables <strong>exponential data skipping</strong> on subsequent filtered reads — e.g., <code>WHERE region='EU' AND tier='Premium'</code> skips 90-95% of files."),

  dict(num=24, phase=4, title="Real-time Data Processing via Structured Streaming",
       tag="readStream · Kafka · watermark · Micro-batch · WAL · Exactly-Once · RocksDB State",
       scenario="Cybersecurity mesh requiring continuous Kafka firewall log ingestion with stateful failed-login counting over 5-minute windows. Watermarking prevents OOM from infinite state accumulation for late-arriving events.",
       code='''\
from pyspark.sql.functions import window

kafka_df = spark.readStream \\
   .format("kafka") \\
   .option("kafka.bootstrap.servers", "kafka-broker:9092") \\
   .option("subscribe", "firewall_logs") \\
   .load()

# Stateful windowed aggregation with late data tolerance
windowed = kafka_df \\
   .withWatermark("event_timestamp", "10 minutes") \\
   .groupBy(window(col("event_timestamp"), "5 minutes"), col("source_ip")) \\
   .count()

# Exactly-once semantics via checkpoint WAL
query = windowed.writeStream \\
   .format("delta") \\
   .outputMode("append") \\
   .option("checkpointLocation", "s3a://lakehouse/checkpoints/firewall/") \\
   .trigger(processingTime="30 seconds") \\
   .start()''',
       mechanics="Structured Streaming runs the same Catalyst engine in <strong>micro-batch mode</strong>. Exactly-once semantics: before committing each micro-batch, the driver records Kafka offsets in a fault-tolerant <strong>Write-Ahead Log (WAL)</strong> at <code>checkpointLocation</code>. Stateful window operators maintain intermediate counts in executor-local memory or <strong>RocksDB state stores</strong> (for large state). <code>withWatermark('10 minutes')</code>: if an event's timestamp is older than (max_observed_time − 10min), the event is dropped from state, preventing catastrophic OOM from perpetually growing state for infinite streams."),

  dict(num=25, phase=4, title="Test-Driven Development and PySpark Pipeline Validation",
       tag="pytest · assertDataFrameEqual · assertSchemaEqual · rtol/atol · CI/CD · session fixture",
       scenario="Manual DataFrame comparison is brittle — row ordering differences and floating-point mismatches cause false test failures in CI. PySpark's native assertion utilities handle all these edge cases internally.",
       code='''\
import pytest
from pyspark.sql import SparkSession
from pyspark.testing.utils import assertDataFrameEqual, assertSchemaEqual

@pytest.fixture(scope="session")  # Share one SparkSession across all tests
def spark_session():
    return SparkSession.builder.master("local").appName("UnitTest").getOrCreate()

def test_churn_pipeline(spark_session):
    input_df = spark_session.createDataFrame(
        [(10, 50.0), (2, 120.0)], ["tenure", "monthly_charges"]
    )
    result_df = execute_churn_pipeline(input_df)

    expected_df = spark_session.createDataFrame(
        [(10, 50.0, 0.25), (2, 120.0, 0.85)],
        ["tenure", "monthly_charges", "churn_prob"]
    )
    # Validates schema + data, handles ordering + FP tolerance natively
    assertDataFrameEqual(result_df, expected_df)''',
       mechanics="Introduced in recent PySpark releases, <code>pyspark.testing.utils</code> fundamentally stabilizes CI/CD pipelines. <code>assertDataFrameEqual</code> handles: complex nested struct comparison, schema incongruency resolution, row ordering independence, and configurable <strong>rtol/atol tolerance</strong> for floating-point values native to Tungsten's binary representation. Use <code>scope='session'</code> on the SparkSession fixture to share one JVM across all tests — critical for CI performance (avoids repeated JVM startup overhead)."),

  dict(num=26, phase=4, title="Enterprise Pipeline Architecture and Project Packaging",
       tag="Functional Paradigm · Poetry · pyproject.toml · reduce() · Modular ETL · Lock Files",
       scenario="Production data codebases must be modular, testable, and deployable across diverse cluster environments. Functional pipelines align with Spark's lazy evaluation paradigm. Poetry lock files eliminate transitive dependency conflicts that plague requirements.txt in complex Spark environments.",
       code='''\
from functools import reduce
from pyspark.sql import DataFrame
from pyspark.sql.functions import col

# Each function: narrow, pure, independently unit-testable
def with_derived_metrics(df: DataFrame) -> DataFrame:
    return df.withColumn("metric", col("a") * col("b"))

def with_filtered_anomalies(df: DataFrame) -> DataFrame:
    return df.filter(col("metric") < 1000)

def execute_pipeline(source_df: DataFrame) -> DataFrame:
    # Compose transformations functionally — plan extends lazily, zero side effects
    transformations = [with_derived_metrics, with_filtered_anomalies]
    return reduce(
        lambda dataframe, func: func(dataframe),
        transformations,
        source_df
    )''',
       mechanics="Passing DataFrames through functional transforms has <strong>zero side effects</strong> — the driver simply extends the unresolved logical plan. Each transformation is independently unit-testable with mock DataFrames. For deployment, <code>requirements.txt</code> causes transitive dependency conflicts in complex Spark environments — particularly between Arrow, Pandas, and PySpark versions. <strong>Poetry's <code>pyproject.toml</code></strong> generates deterministic lock files that resolve exact transitive dependencies before the Spark application instantiates on the cluster, eliminating dev/prod version drift."),
]

PHASE_META = {
    1: ("Architectural Foundations and Core Abstractions",
        "Levels 1–5 · Spark Connect, ingestion paradigms, DataFrame API, lazy evaluation, messy data",
        "phase-badge-1"),
    2: ("Advanced Relational Modeling and Transformations",
        "Levels 6–13 · Aggregations, window functions, complex types, joins, and Pandas UDFs",
        "phase-badge-2"),
    3: ("Performance Tuning, Execution Mechanics, and Internals",
        "Levels 14–21 · Spark UI, Catalyst, Tungsten, memory, partitions, skew, and AQE",
        "phase-badge-3"),
    4: ("Enterprise Ecosystem, Production, and CI/CD",
        "Levels 22–26 · Delta Lake ACID, time travel, streaming, testing, pipeline packaging",
        "phase-badge-4"),
}

# ── Build HTML ──────────────────────────────────────────────────────────────

html_parts = []
current_phase = None

for level in LEVELS:
    p = level["phase"]
    if p != current_phase:
        # Close previous phase if open
        if current_phase is not None:
            html_parts.append("          </div><!-- end phase-block -->\n")
        # Open new phase
        title, desc, badge = PHASE_META[p]
        html_parts.append(phase_header(p, title, desc, badge) + "\n")
        current_phase = p

    html_parts.append(level_card(
        level["num"], level["phase"], level["title"],
        level["tag"], level["scenario"], level["code"], level["mechanics"]
    ) + "\n")

if current_phase is not None:
    html_parts.append("          </div><!-- end phase-block -->\n")

generated_html = "\n".join(html_parts)

# ── Inject into index.html ──────────────────────────────────────────────────

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

placeholder = "PYSPARK_PLACEHOLDER"
if placeholder not in content:
    print("ERROR: PYSPARK_PLACEHOLDER not found in index.html")
else:
    content = content.replace(placeholder, generated_html)
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(content)
    print(f"SUCCESS: Injected {len(LEVELS)} levels ({len(generated_html):,} chars)")
