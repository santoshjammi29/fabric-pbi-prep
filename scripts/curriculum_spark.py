# scripts/curriculum_spark.py
"""
Curriculum items 21-30+:
Spark Core & PySpark Performance Tuning, Troubleshooting & Advanced SQL:
- Bucketing & Bucket Join optimization
- Dynamic Partition Overwrite
- Vectorized Pandas UDFs & PySpark Pandas API (Arrow)
- Py4J IPC Communication & Architecture
- Spark SQL Windowing & Pivot/Unpivot mechanics
- Semi and Anti Joins (NULL safety & subquery optimization)
- Spark Memory Leaks & Lifecycle Management
- Heartbeat Timeouts, Zombie Workers & Executor Loss
- Straggler Tasks & Spark UI Timeline Profiling
- Spark UI DAG & Ganglia Metrics Deep Analysis
- External Orchestration: Airflow vs ADF vs dbt with Databricks
"""

SPARK_ITEMS = [
    # ── Item 21: Spark SQL Bucketing & Bucket Join Optimization ──
    {
        "de_id": "de-new-arch-spark-deep-027",
        "arch_id": "arch-spark-deep-027",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Advanced PySpark & Spark Core Optimization",
        "niche": "Spark SQL Bucketing & Bucket Join Mechanics",
        "difficulty": "HARD",
        "domain": "Compute & Orchestration",
        "subdomain": "Spark Distributed Core Architecture",
        "question": "How does Bucketing (bucketBy + sortBy) physically organize Parquet files on disk to eliminate shuffle operations during joins, and why does bucket pruning fail if partition counts or hash algorithms mismatch?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In standard Spark SQL joins (e.g., Sort-Merge Join), both datasets must be re-partitioned across the network by the join key hash, introducing massive network shuffle, disk spill, and synchronization latency.

**Bucketing Architecture (`bucketBy` + `sortBy`)**:
1. **Pre-Shuffled Storage Layout**:
   - Bucketing pre-hashes data by a specific column (e.g., `user_id`) into a fixed number of buckets $B$, and optionally pre-sorts records within each bucket file on disk.
   - When saving as a managed catalog table (`df.write.bucketBy(N, 'col').sortBy('col').saveAsTable('tbl')`), Spark writes exactly $N$ physical files per partition directory.
2. **Shuffle-Free Bucket Join**:
   - If Table A (bucketed by `user_id` into $N$ buckets) is joined with Table B (also bucketed by `user_id` into $N$ buckets or an integer multiple/factor of $N$), Spark recognizes that matching keys already reside in corresponding physical bucket files.
   - Spark executes a **Bucket Join with Zero Network Shuffle** — executors directly stream and merge co-located partitions locally!
3. **Bucket Pruning**:
   - Queries with equality filters on the bucket column (`WHERE user_id = '12345'`) compute `hash('12345') % N` and read *only that single bucket file*, skipping the remaining $N-1$ files completely.

### Phase 2: Implementation & Code Artifacts
Below is the PySpark and SQL configuration for writing bucketed tables and verifying shuffle-free physical execution plans.

```sql
-- 1. Create pre-bucketed Customer Dimension Table (32 buckets)
CREATE TABLE prod_lakehouse.core.bucketed_customers (
  customer_id STRING NOT NULL,
  first_name STRING,
  country STRING
)
USING PARQUET
CLUSTERED BY (customer_id) SORTED BY (customer_id) INTO 32 BUCKETS;

-- 2. Create pre-bucketed Orders Fact Table (32 buckets, matching key!)
CREATE TABLE prod_lakehouse.core.bucketed_orders (
  order_id STRING NOT NULL,
  customer_id STRING NOT NULL,
  total_amount DOUBLE,
  order_date DATE
)
USING PARQUET
CLUSTERED BY (customer_id) SORTED BY (customer_id) INTO 32 BUCKETS;
```

```python
# 3. Executing Join and Verifying ZERO Shuffle in Physical Plan
spark.conf.set("spark.sql.sources.bucketing.enabled", "true")

df_joined = spark.sql('''
  SELECT c.customer_id, c.country, o.order_id, o.total_amount
  FROM prod_lakehouse.core.bucketed_customers c
  JOIN prod_lakehouse.core.bucketed_orders o
    ON c.customer_id = o.customer_id
''')

# Inspect physical plan: Notice the ABSENCE of 'Exchange hashpartitioning' before SortMergeJoin!
df_joined.explain(mode="formatted")
# Physical Plan will show:
# *SortMergeJoin [customer_id#1], [customer_id#5]
#  :- *Scan parquet prod_lakehouse.core.bucketed_customers (Bucket: 32)
#  +- *Scan parquet prod_lakehouse.core.bucketed_orders (Bucket: 32)
```

### Phase 3: Production Gotchas & Failure Modes
- **Bucket Count Mismatch & Silent Fallback**: If Table A has 32 buckets and Table B has 50 buckets (non-multiples), Spark cannot align bucket boundaries. Catalyst silently injects a full `Exchange hashpartitioning` shuffle on both tables. Bucketing must be designed with common power-of-two multiples across tables (e.g., 32, 64, 128).
- **Bucketing Ignored on Path-Based Reads**: Bucketing metadata is stored strictly in the table catalog. If an engineer reads bucketed Parquet files using a raw directory path (`spark.read.parquet('s3://path/')`) instead of the catalog table name (`spark.table('prod.tbl')`), Spark treats it as unbucketed data and forces a full network shuffle.
- **Delta Lake Liquid Clustering vs Bucketing**: In modern Databricks Lakehouses, legacy Hive/Spark bucketing is largely superseded by **Liquid Clustering (`CLUSTER BY`)**. Bucketing fixes the number of files forever (inflexible to data growth) and risks small-file skew, whereas Liquid Clustering dynamically adjusts clustering layout and supports changing cluster keys without rewriting tables.
"""
    },

    # ── Item 22: Dynamic Partition Overwrite in Spark & Delta ──
    {
        "de_id": "de-new-arch-spark-deep-028",
        "arch_id": "arch-spark-deep-028",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Advanced PySpark & Spark Core Optimization",
        "niche": "Dynamic Partition Overwrite & Batch Idempotency",
        "difficulty": "MEDIUM",
        "domain": "Compute & Orchestration",
        "subdomain": "Spark Distributed Core Architecture",
        "question": "How does Dynamic Partition Overwrite (spark.sql.sources.partitionOverwriteMode=dynamic) prevent accidental truncation of unrelated partitions during incremental batch loads, and how does it compare to Delta table partition replacement?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In distributed batch pipelines, refreshing a specific day's data (e.g., re-running an ETL batch for `2026-10-15`) using standard Spark `mode('overwrite')` on a partitioned table introduces an extreme risk:

1. **The Static Overwrite Disaster**:
   - By default, Spark operates in `static` partition overwrite mode (`spark.sql.sources.partitionOverwriteMode=static`).
   - If a dataframe contains rows for `date = '2026-10-15'` and is written with `.mode('overwrite')` to a table partitioned by `date`, Spark **wipes out the entire table directory**, deleting all historical partitions (`2026-10-01`, `2026-10-02`, etc.) and replacing them with only the single incoming partition.
2. **Dynamic Partition Overwrite**:
   - Setting `spark.sql.sources.partitionOverwriteMode=dynamic` changes the physical overwrite semantics.
   - Spark inspects the incoming DataFrame at runtime, identifies the distinct partition values present, and overwrites **ONLY those specific matching partition subdirectories**, leaving all other historical partitions completely untouched.
3. **Delta Lake `replaceWhere`**:
   - Delta Lake provides an even safer, declarative SQL alternative: `option("replaceWhere", "event_date = '2026-10-15'")`. This guarantees that if incoming data contains unexpected partition dates, Delta throws an error rather than overwriting unintended data.

### Phase 2: Implementation & Code Artifacts
Below is how dynamic partition overwrite is configured in PySpark, and how Delta `replaceWhere` guarantees atomic partition replacement.

```python
# 1. Open-Source Spark: Enable Dynamic Partition Overwrite
spark.conf.set("spark.sql.sources.partitionOverwriteMode", "dynamic")

# Ingest daily batch containing only recent partition data
df_daily_updates.write \\
    .format("parquet") \\
    .mode("overwrite") \\
    .partitionBy("event_date") \\
    .saveAsTable("prod_lakehouse.raw.telemetry_daily")
# Result: Only partitions present in df_daily_updates are overwritten!
```

```python
# 2. Delta Lake Enterprise Best Practice: Declarative replaceWhere
# Replaces exactly the target partition with atomic ACID safety
df_daily_updates.write \\
    .format("delta") \\
    .mode("overwrite") \\
    .option("replaceWhere", "event_date = '2026-10-15'") \\
    .saveAsTable("prod_lakehouse.gold.daily_financial_summary")
```

```sql
-- 3. SQL Dynamic Overwrite syntax (Spark 3+)
INSERT OVERWRITE TABLE prod_lakehouse.gold.daily_financial_summary
PARTITION (event_date)
SELECT metric_id, revenue, event_date
FROM stage_financial_summary
WHERE event_date BETWEEN '2026-10-14' AND '2026-10-15';
```

### Phase 3: Production Gotchas & Failure Modes
- **Silent Data Corruption via Dynamic Leakage**: If an upstream bug causes `df_daily_updates` to contain a single errant row dated `2020-01-01`, dynamic overwrite will silently wipe out the entire historical partition `event_date=2020-01-01` and replace it with that single errant row. Always validate distinct partition values in the DataFrame before writing.
- **Delta replaceWhere Predicate Constraint**: If `replaceWhere` is set to `event_date = '2026-10-15'` and the incoming DataFrame contains a row where `event_date = '2026-10-16'`, Delta Lake immediately halts the write and throws `DeltaIllegalArgumentException: Data written does not match replaceWhere predicate`. This fail-safe prevents accidental cross-partition corruption.
- **Concurrency Conflicts on Dynamic Writes**: Concurrent jobs executing dynamic partition overwrites against the same table can fail with `ConcurrentAppendException` or `ConcurrentModificationException` if their partition candidate sets overlap.
"""
    },

    # ── Item 23: Vectorized Pandas UDFs & PySpark Pandas API (Arrow) ──
    {
        "de_id": "de-new-arch-spark-deep-029",
        "arch_id": "arch-spark-deep-029",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Advanced PySpark & Spark Core Optimization",
        "niche": "Vectorized Pandas UDFs & PySpark Pandas API",
        "difficulty": "HARD",
        "domain": "Compute & Orchestration",
        "subdomain": "PySpark Optimization & Vectorization",
        "question": "How does PySpark Pandas API (formerly Koalas) differ from native PySpark DataFrames, and how do Apache Arrow-powered Vectorized Pandas UDFs (@pandas_udf) achieve order-of-magnitude speedups over standard Python UDFs?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Standard Python UDFs (`@udf`) in PySpark suffer from catastrophic performance penalties:
1. **The Row-by-Row Serialization Bottleneck**:
   - For every single row, the JVM executor must serialize JVM objects via Py4J/IPC, transmit them to a Python worker subprocess, deserialize them into Python objects, execute the Python function row-by-row, and serialize the result back to the JVM.
   - This creates massive CPU overhead, disables Catalyst query optimization, and prevents Whole-Stage Code Generation.
2. **Apache Arrow & Vectorized Pandas UDFs (`@pandas_udf`)**:
   - Vectorized UDFs pass data between the JVM and Python in **Apache Arrow columnar batches** (zero-copy or SIMD-friendly contiguous memory blocks).
   - Data is handed directly to Pandas / NumPy as contiguous C-array series or dataframes, executing vectorized C-level SIMD operations on thousands of rows simultaneously.
   - Result: 10× to 100× performance speedups compared to standard Python UDFs.
3. **PySpark Pandas API (formerly Koalas)**:
   - Provides a standard Pandas-compliant DataFrame API (`import pyspark.pandas as ps`) backed by Spark's distributed Catalyst optimizer.
   - Converts standard Pandas syntax (`df['a'] + df['b']`, `.groupby()`, `.apply()`) into distributed Spark Catalyst logical plans.

### Phase 2: Implementation & Code Artifacts
Below is how Vectorized Scalar UDFs and Grouped Map UDFs are implemented using Apache Arrow in PySpark.

```python
import pandas as pd
from pyspark.sql.functions import pandas_udf, col
from pyspark.sql.types import DoubleType

# 1. Vectorized Scalar Pandas UDF: Takes Series -> Returns Series
# Executes vectorized C-level operations on Apache Arrow batches
@pandas_udf(DoubleType())
def calculate_compound_interest(principal: pd.Series, rate: pd.Series, years: pd.Series) -> pd.Series:
    # Pure vectorized NumPy/Pandas calculation across millions of rows!
    return principal * ((1.0 + rate) ** years)

df_investments = spark.table("prod_lakehouse.finance.portfolios")
df_result = df_investments.withColumn(
    "future_value", 
    calculate_compound_interest(col("principal"), col("interest_rate"), col("tenure_years"))
)
```

```python
# 2. Vectorized Grouped Map UDF (applyInPandas): Complex group-level ML/Stat models
from pyspark.sql.types import StructType, StructField, StringType, DoubleType

output_schema = StructType([
    StructField("store_id", StringType(), False),
    StructField("forecast_metric", DoubleType(), False)
])

def train_store_arima_model(key_tuple, group_df: pd.DataFrame) -> pd.DataFrame:
    # group_df is a pure Pandas DataFrame containing all records for one store
    store_id = key_tuple[0]
    # Simulate advanced Python forecasting library (statsmodels / Prophet)
    predicted_val = group_df["sales"].mean() * 1.05
    return pd.DataFrame([{"store_id": store_id, "forecast_metric": predicted_val}])

df_forecasts = df_sales.groupBy("store_id").applyInPandas(
    train_store_arima_model, 
    schema=output_schema
)
```

### Phase 3: Production Gotchas & Failure Modes
- **Executor OutOfMemory via Arrow Batch Sizing**: Apache Arrow batches are held in executor memory before being passed to Python. If `spark.sql.execution.arrow.maxRecordsPerBatch` (default 10,000) is too large and rows contain wide strings or complex nested structs, the Python worker exhausts its container memory, crashing with `Py4JJavaError: ArrowException / Container killed by YARN/K8s`. Tune `maxRecordsPerBatch` to 1,000–2,500 for wide schemas.
- **applyInPandas Skew Disaster**: In `groupBy().applyInPandas()`, every single row for a given group key is collected into a single Python Pandas DataFrame in memory on a single executor core. If a store or customer has 50 million records (data skew), that executor's Python process will immediately crash with an unrecoverable OOM.
- **Implicit Type Conversion Pitfall**: Arrow is strictly typed. If a Pandas UDF returns a column with float values containing `NaN` and the Spark return type is `IntegerType`, Arrow fails to serialize the batch, failing the entire stage. Explicitly handle `.fillna()` in Python before returning.
"""
    },

    # ── Item 24: Py4J IPC Communication & Architecture ──
    {
        "de_id": "de-new-arch-spark-deep-030",
        "arch_id": "arch-spark-deep-030",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Advanced PySpark & Spark Core Optimization",
        "niche": "Py4J IPC Communication & Python-JVM Interoperability",
        "difficulty": "HARD",
        "domain": "Compute & Orchestration",
        "subdomain": "PySpark Optimization & Vectorization",
        "question": "How do Py4J and IPC pipes bridge the Python and JVM processes in PySpark, where do serialization bottlenecks occur between Driver and Executors, and how does Spark Connect eliminate Py4J?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
PySpark is NOT a native Python engine. It is a Python wrapper communicating with a distributed JVM engine:

1. **Driver Architecture (Py4J Gateway)**:
   - On the Spark Driver, the user's Python script runs in a standard CPython interpreter.
   - It communicates with the Driver's Java Virtual Machine (JVM) over a local TCP loopback socket using the **Py4J gateway**.
   - Every PySpark API call (`df.filter()`, `df.groupBy()`) translates into dynamic Py4J reflection calls that construct Java Catalyst objects inside the JVM.
   - *Driver Bottleneck*: High-frequency Python loops invoking PySpark API calls (e.g., looping 10,000 times to add columns) create thousands of blocking TCP socket roundtrips, causing severe driver latency.
2. **Executor Architecture (Unix IPC Pipes)**:
   - When executing Python code (such as standard UDFs or RDD `map()`), JVM executor threads launch Python daemon worker subprocesses.
   - Data rows are serialized in the JVM, written to local Unix domain sockets / stdin pipes, deserialized into Python objects by the Python worker, processed, and piped back to the JVM.
3. **The Spark Connect Revolution (Spark 3.4+)**:
   - Replaces the fragile, local-only Py4J loopback architecture with a modern, decoupled **gRPC server**.
   - Python builds an unresolved Protocol Buffer query plan and streams it over gRPC to the remote Spark Connect server, decoupling the client completely from the JVM.

### Phase 2: Implementation & Code Artifacts
Below is how Python-JVM communication is monitored, and how PySpark configurations are tuned for worker IPC pipes.

```python
# Tuning PySpark Python Worker Memory and Reuse
spark.conf.set("spark.python.worker.reuse", "true") # Reuses Python worker processes across tasks
spark.conf.set("spark.executor.pyspark.memory", "2g") # Limits Python worker RSS memory

# Inspecting Py4J Gateway connection on the Driver
sc = spark.sparkContext
gateway = sc._gateway
print(f"Py4J Gateway listening on port: {gateway.gateway_parameters.port}")

# ANTI-PATTERN: Heavy Py4J TCP socket roundtrips in Python loops
# BAD: 100 Py4J socket calls over TCP:
for col_name in ['col1', 'col2', 'col3']:
    df = df.withColumn(col_name, col(col_name) * 2)

# PRODUCTION PATTERN: Batch projection via list comprehension in single JVM call
# GOOD: Single Py4J call generating Catalyst Project node in one pass:
from pyspark.sql.functions import col
new_cols = [col(c) * 2 if c in ['col1', 'col2', 'col3'] else col(c) for c in df.columns]
df = df.select(*new_cols)
```

### Phase 3: Production Gotchas & Failure Modes
- **Python Daemon Memory Leak on Long Jobs**: While `spark.python.worker.reuse = true` dramatically reduces process launch overhead, native C libraries (NumPy, SciPy, TensorFlow) called inside Python tasks that do not free heap allocations will leak memory inside the persistent Python worker process. Eventually, YARN/K8s kills the container for exceeding total memory limits.
- **Driver Socket Timeout (Py4JNetworkError)**: Heavy local driver GC pauses (>30 seconds) or intensive Python driver computations freeze the Py4J loopback socket, leading to `Py4JNetworkError: An error occurred while trying to connect to the Java server`. Tune `spark.network.timeout` and avoid long-running non-Spark computations on the driver.
- **Serialization Mismatch with Custom Objects**: Attempting to pass non-serializable Python objects (e.g., open file handles, database connections, lambda closures referencing non-picklable modules) across PySpark tasks causes `PicklingError: Could not serialize object`. Always instantiate database connections inside `rdd.mapPartitions()` on the worker.
"""
    },

    # ── Item 25: Spark SQL Window Functions & Pivot/Unpivot Mechanics ──
    {
        "de_id": "de-new-arch-spark-deep-031",
        "arch_id": "arch-spark-deep-031",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Advanced PySpark & Spark Core Optimization",
        "niche": "Spark SQL Windowing, Frames & Pivot Operations",
        "difficulty": "HARD",
        "domain": "Compute & Orchestration",
        "subdomain": "Spark Distributed Core Architecture",
        "question": "How do Spark SQL Window functions (RANK, DENSE_RANK, LEAD, LAG, cumulative sums) distribute memory across executors, and how do you construct performant dynamic PIVOT and UNPIVOT (via stack()) queries on high-cardinality datasets?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Window functions execute calculations across a group of rows related to the current row without collapsing the dataset into a single row.

1. **Window Physical Execution**:
   - `Window.partitionBy('key').orderBy('ts')`: Spark executes a wide transformation, hashing all rows with the same partition key to the exact same executor partition, and sorts records in memory.
   - *Frame Specifications*:
     * `ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING`: Physical row count frame. Operates efficiently in a sliding buffer.
     * `RANGE BETWEEN INTERVAL 1 DAY PRECEDING AND CURRENT ROW`: Logical value-based frame. Requires comparing exact column values, incurring higher CPU overhead.
2. **Ranking & Analytical Functions**:
   - `ROW_NUMBER()`: Strictly sequential unique numbering (1, 2, 3, 4).
   - `RANK()`: Assigns identical rank to ties, skipping subsequent ranks (1, 2, 2, 4).
   - `DENSE_RANK()`: Assigns identical rank to ties without skipping (1, 2, 2, 3).
   - `LEAD()` / `LAG()`: Fetches values from $N$ rows ahead or behind without self-joins.
3. **Pivot and Unpivot (Stack)**:
   - `PIVOT`: Transposes distinct row values into column headers. Without an explicit list of pivot values, Spark executes an expensive preliminary query to compute distinct values!
   - `UNPIVOT` (`stack()`): Melts wide columns into narrow rows. Highly cache-efficient and vectorized.

### Phase 2: Implementation & Code Artifacts
Below are PySpark implementations demonstrating windowed cumulative sums, lead/lag, and optimized Pivot/Unpivot using `stack()`.

```python
from pyspark.sql.functions import col, rank, dense_rank, lag, sum as _sum
from pyspark.sql.window import Window

# 1. Advanced Window Specification with Sliding Cumulative Sum & Lag
window_spec = Window.partitionBy("customer_id") \\
    .orderBy("transaction_timestamp") \\
    .rowsBetween(Window.unboundedPreceding, Window.currentRow)

df_enriched = df_txns.withColumn("running_total", _sum("amount").over(window_spec)) \\
    .withColumn("prev_txn_amount", lag("amount", 1).over(Window.partitionBy("customer_id").orderBy("transaction_timestamp"))) \\
    .withColumn("customer_rank", dense_rank().over(Window.partitionBy("region").orderBy(col("total_spend").desc())))
```

```python
# 2. Optimized PIVOT: Always pass explicit list of distinct pivot values!
# AVOID: df.groupBy("region").pivot("product_category").sum("sales")  <- Triggers full scan!
# GOOD: Explicit column list eliminates initial distinct scan:
explicit_categories = ["Electronics", "Apparel", "HomeGoods", "Automotive"]
df_pivoted = df_sales.groupBy("region") \\
    .pivot("product_category", explicit_categories) \\
    .sum("sales")

# 3. Vectorized UNPIVOT using stack() function (Zero-Shuffle!)
df_unpivoted = df_pivoted.selectExpr(
    "region",
    "stack(4, 'Electronics', Electronics, 'Apparel', Apparel, 'HomeGoods', HomeGoods, 'Automotive', Automotive) as (category, sales)"
)
```

### Phase 3: Production Gotchas & Failure Modes
- **The Empty partitionBy() OOM Disaster**: Writing `Window.orderBy("sales")` WITHOUT a `partitionBy()` clause forces Spark to route EVERY SINGLE ROW of your multi-terabyte dataset to a **single executor partition** on one worker. That worker immediately exhausts its JVM heap and crashes with `OutOfMemoryError`. Always supply a partition key.
- **Unbounded Following Memory Bloat**: Using `rowsBetween(Window.currentRow, Window.unboundedFollowing)` forces Spark to buffer all future rows of that partition in executor memory to compute the lookahead, preventing memory pipelining.
- **High-Cardinality PIVOT Explosion**: Pivoting on a column with 10,000 distinct values creates a DataFrame with 10,000 columns. Catalyst optimizer compilation time scales quadratically with column count, causing query planning to take hours or crash the driver with `StackOverflowError`.
"""
    },

    # ── Item 26: Spark Semi and Anti Joins: Mechanics & Null Handling Pitfalls ──
    {
        "de_id": "de-new-arch-spark-deep-032",
        "arch_id": "arch-spark-deep-032",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Advanced PySpark & Spark Core Optimization",
        "niche": "Semi & Anti Joins Execution & NULL Safety",
        "difficulty": "MEDIUM",
        "domain": "Compute & Orchestration",
        "subdomain": "Spark Distributed Core Architecture",
        "question": "How do Spark LEFT SEMI JOIN and LEFT ANTI JOIN physical operators execute compared to INNER JOIN and NOT IN / NOT EXISTS, and how does three-valued SQL logic handle NULL keys in subqueries?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In relational analytics, filtering a primary dataset based on the presence or absence of keys in a secondary dataset is a fundamental pattern (e.g., finding customers who never placed an order).

1. **Physical Operator Mechanics**:
   - `LEFT SEMI JOIN`: Returns columns from the LEFT table ONLY, for rows that have at least one match in the right table. Unlike `INNER JOIN`, it stops scanning the right table immediately upon finding the first match (short-circuiting). It never duplicates left rows, preventing unintended row explosion.
   - `LEFT ANTI JOIN`: Returns columns from the LEFT table ONLY, for rows that have ZERO matches in the right table.
2. **Comparison with Subqueries (`NOT IN` vs `NOT EXISTS`)**:
   - `LEFT ANTI JOIN` is physically equivalent to `WHERE NOT EXISTS (SELECT 1 FROM ...)`.
   - `WHERE col NOT IN (SELECT col FROM ...)`: **The Three-Valued Logic Trap**. Under ANSI SQL standards, if the subquery returns even a single `NULL` value, `NOT IN` evaluates to `UNKNOWN` for all rows, resulting in **0 rows returned** from the entire query!
3. **Execution Plan Efficiency**:
   - Catalyst can push down semi and anti joins into Broadcast Hash Join operators if the right-side table is smaller than `autoBroadcastJoinThreshold`. Because right-side columns are never projected, memory footprint on the executors is cut in half.

### Phase 2: Implementation & Code Artifacts
Below is how Semi and Anti Joins are executed cleanly in PySpark and SQL, avoiding the SQL NULL subquery trap.

```python
# 1. PySpark LEFT SEMI JOIN: Customers who have made a purchase
# Zero row duplication even if a customer has 10,000 orders!
df_active_customers = df_customers.join(
    df_orders, 
    on="customer_id", 
    how="left_semi"
)

# 2. PySpark LEFT ANTI JOIN: Customers who have NEVER made a purchase
# NULL-safe, short-circuiting execution
df_churned_customers = df_customers.join(
    df_orders, 
    on="customer_id", 
    how="left_anti"
)
```

```sql
-- 3. The Dangerous SQL NOT IN Anti-Pattern (Returns 0 rows if any customer_id is NULL!)
-- AVOID THIS IN PRODUCTION:
SELECT * FROM prod_lakehouse.core.customers
WHERE customer_id NOT IN (SELECT customer_id FROM prod_lakehouse.core.orders);

-- 4. The Production-Grade SQL LEFT ANTI JOIN Pattern:
SELECT c.*
FROM prod_lakehouse.core.customers c
LEFT ANTI JOIN prod_lakehouse.core.orders o
  ON c.customer_id = o.customer_id;
```

### Phase 3: Production Gotchas & Failure Modes
- **The NOT IN Null Contamination**: If the orders table contains a single record where `customer_id IS NULL`, running `WHERE customer_id NOT IN (SELECT customer_id FROM orders)` evaluates `x NOT IN (1, 2, NULL)` -> `x != 1 AND x != 2 AND x != NULL` -> `TRUE AND TRUE AND UNKNOWN` -> `UNKNOWN`. The query returns an empty result set, silently breaking data pipelines. Always use `LEFT ANTI JOIN`.
- **Accidental Row Multiplication via Inner Join**: Developers often write `SELECT DISTINCT c.* FROM customers c INNER JOIN orders o ON c.id = o.id` to filter customers. This forces an expensive `INNER JOIN` followed by an even more expensive `DISTINCT` wide shuffle. Replacing this with `LEFT SEMI JOIN` executes in half the time with zero shuffle spill.
- **Broadcast Hash Join Memory Threshold on Anti Joins**: If the right-side table in an Anti Join exceeds `spark.sql.autoBroadcastJoinThreshold`, Spark falls back to `SortMergeJoin`. For massive right-side tables, consider pre-aggregating `SELECT DISTINCT id FROM orders` before the anti join to keep the probe set small enough to broadcast.
"""
    },

    # ── Item 27: Detecting and Resolving Spark Memory Leaks & Unpersisted RDDs ──
    {
        "de_id": "de-new-arch-spark-deep-033",
        "arch_id": "arch-spark-deep-033",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Advanced PySpark & Spark Core Optimization",
        "niche": "PySpark Memory Leak Diagnostics & Lifecycle Management",
        "difficulty": "HARD",
        "domain": "Compute & Orchestration",
        "subdomain": "Spark Production Troubleshooting & OOM",
        "question": "What architectural patterns cause long-running PySpark and Structured Streaming applications to leak JVM heap or driver memory over days, and how do you systematically diagnose unpersisted DataFrames and lingering broadcast variables?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
While individual batch jobs rarely run long enough to expose slow memory leaks, 24/7 Structured Streaming pipelines and shared interactive notebook clusters frequently crash with `OutOfMemoryError` after days of flawless operation.

**Primary Root Causes of Spark Memory Leaks**:
1. **Unpersisted Cached DataFrames / RDDs**:
   - Calling `df.cache()` or `df.persist()` pins partitions in the Executor's Storage Memory pool.
   - If `df.unpersist()` is not called when the DataFrame is no longer needed, those partitions remain in memory indefinitely, starving the Execution Memory pool and forcing subsequent shuffles to spill heavily to disk.
2. **Lingering Broadcast Variables**:
   - Calling `broadcast(df)` transmits data to every executor JVM.
   - In streaming loops or iterative algorithms, broadcasting a new dimension table every micro-batch without calling `b_var.destroy()` permanently leaks broadcast blocks in JVM memory.
3. **Driver Accumulator & Listener Bloat**:
   - Registering Spark custom listeners or accumulators that retain references to heavy Java/Python objects causes the Spark Driver's heap to grow monotonically.
4. **Py4J Java Object References**:
   - Python objects holding references to Py4J Java objects prevent the JVM garbage collector from reclaiming those Java objects.

### Phase 2: Implementation & Code Artifacts
Below is how to audit cached objects via the Spark catalog, implement automatic memory cleanup using Python context managers, and destroy broadcast variables.

```python
# 1. Programmatically Audit Cached Tables and Memory Storage
from pyspark.sql import SparkSession

catalog = spark.catalog
cached_tables = [t.name for t in catalog.listTables() if t.isCached]
print(f"Active cached tables in catalog: {cached_tables}")

# Clear all cached tables across the entire SparkSession immediately:
spark.catalog.clearCache()
```

```python
# 2. Context Manager for Guaranteed DataFrame Persistence Lifecycle
from contextlib import contextmanager
from pyspark.storagelevel import StorageLevel

@contextmanager
def ephemeral_persist(df, storage_level=StorageLevel.MEMORY_AND_DISK):
    '''
    Guarantees that cached DataFrames are unpersisted even if downstream code fails!
    '''
    cached_df = df.persist(storage_level)
    try:
        # Materialize cache once
        cached_df.count()
        yield cached_df
    finally:
        cached_df.unpersist(blocking=False)
        print("Successfully unpersisted DataFrame from executor memory.")

# Usage in pipeline:
with ephemeral_persist(df_raw_events) as df_cached:
    df_metrics_a = df_cached.groupBy("region").count()
    df_metrics_b = df_cached.groupBy("category").sum("sales")
```

```python
# 3. Explicit Lifecycle Management of Broadcast Variables in Streaming
broadcast_dim = spark.sparkContext.broadcast(dimension_lookup_dict)

try:
    # Execute batch processing...
    pass
finally:
    # unpersist() frees memory on executors; destroy() purges from driver as well
    broadcast_dim.destroy(blocking=False)
```

### Phase 3: Production Gotchas & Failure Modes
- **Blocking vs Non-Blocking unpersist()**: Calling `df.unpersist(blocking=True)` pauses the driver thread until all executors across the cluster confirm block deletion. In high-concurrency environments, this introduces significant pipeline latency. Always use `blocking=False` for asynchronous cleanup.
- **Streaming Micro-Batch Broadcast Leak**: In a Structured Streaming `foreachBatch` function, creating a broadcast variable inside the loop without calling `.destroy()` will create 2,880 uncollected broadcast blocks every 24 hours (at 30-sec micro-batches), guaranteeing a driver OOM crash.
- **Python Finalizer Delays**: Relying on Python's garbage collector (`__del__`) to release Py4J JVM references is non-deterministic. Python may not collect the proxy object until long after the JVM memory has become critical. Always use explicit `unpersist()` and `destroy()` calls.
"""
    },

    # ── Item 28: Heartbeat Timeouts, Zombie Workers & Executor Loss ──
    {
        "de_id": "de-new-arch-spark-deep-034",
        "arch_id": "arch-spark-deep-034",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Advanced PySpark & Spark Core Optimization",
        "niche": "Spark Heartbeat Timeouts & Node Liveness Tuning",
        "difficulty": "HARD",
        "domain": "Compute & Orchestration",
        "subdomain": "Spark Production Troubleshooting & OOM",
        "question": "What causes ExecutorLostFailure (Heartbeat to driver timed out) in large Spark clusters, how do prolonged JVM GC pauses masquerade as network failures, and how do you configure timeout thresholds?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
One of the most frequent and deceptive production failures in Apache Spark is:
`ExecutorLostFailure: Executor 14 exited for reason: Heartbeat to driver timed out after 120000 ms`.

1. **Heartbeat Architecture**:
   - Every Spark Executor runs a background thread that periodically sends a heartbeat signal to the Driver's `HeartbeatReceiver` actor (controlled by `spark.executor.heartbeatInterval`, default 10 seconds).
   - If the Driver fails to receive a heartbeat from an executor within `spark.network.timeout` (default 120 seconds), the Driver assumes the executor is dead, marks it lost, and reschedules all its active tasks on other nodes.
2. **The JVM GC Pause Masquerade**:
   - In 90% of cases, the executor VM is NOT dead, and the physical network is NOT down.
   - Instead, the executor JVM entered a **Stop-The-World (STW) Garbage Collection pause** lasting longer than 120 seconds.
   - During a full GC pause, all JVM threads (including the heartbeat sender) are completely frozen. The driver times out, assumes the executor died, and kills its container!
3. **The Rescheduling Storm**:
   - When the driver declares the executor lost, it reschedules those same heavy tasks onto another executor.
   - That next executor attempts to process the exact same memory-heavy partition, triggers a 120-second GC pause, gets marked dead, and the failure cascades across the entire cluster until the job aborts.

### Phase 2: Implementation & Code Artifacts
Below is how heartbeat intervals, network timeouts, and JVM garbage collection are configured to prevent false executor death.

```properties
# Spark Configuration to mitigate Heartbeat Timeouts on Heavy Workloads
# 1. Increase general network timeout from 120s to 300s
spark.network.timeout 300s

# 2. Adjust executor heartbeat interval (Must be significantly smaller than network.timeout)
spark.executor.heartbeatInterval 30s

# 3. Increase block manager heartbeat timeout
spark.storage.blockManagerSlaveTimeoutMs 300000

# 4. Enable G1GC with aggressive pause time targets to eliminate 120s STW pauses
spark.executor.extraJavaOptions -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:InitiatingHeapOccupancyPercent=45 -XX:G1ReservePercent=15
```

```python
# Programmatically checking executor heartbeat metrics in PySpark
status_tracker = spark.sparkContext.statusTracker()
active_executor_ids = status_tracker.getExecutorInfos()
print(f"Total active executors connected to driver: {len(active_executor_ids)}")
```

### Phase 3: Production Gotchas & Failure Modes
- **Masking Root Cause by Inflating Timeouts**: Simply increasing `spark.network.timeout` to 1,800 seconds (30 minutes) does NOT solve underlying memory pressure. If an executor is thrashing in full GC, increasing the timeout merely forces your entire pipeline to hang silently for 30 minutes before crashing anyway. Fix the underlying skew, scale executor RAM, or switch to off-heap memory.
- **Driver-Side GC Pause**: If the *Driver* JVM experiences a heavy Stop-The-World GC pause, the Driver stops processing incoming heartbeats from healthy executors. Once the Driver unfreezes, it erroneously marks dozens of healthy executors as timed out simultaneously. Always monitor driver GC metrics in Ganglia / Spark UI.
- **Cloud Spot Instance Reclaim**: On public cloud infrastructure using Spot/Preemptible VMs, cloud providers can revoke nodes with a 30-second warning. This triggers legitimate `ExecutorLostFailure`. Configure Databricks cluster policies to use On-Demand instances for the Driver and a fallback mix for workers.
"""
    },

    # ── Item 29: Straggler Tasks: Spark UI Profiling & AQE Mitigation ──
    {
        "de_id": "de-new-arch-spark-deep-035",
        "arch_id": "arch-spark-deep-035",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Advanced PySpark & Spark Core Optimization",
        "niche": "Straggler Task Diagnostics & Spark UI Timeline Analysis",
        "difficulty": "HARD",
        "domain": "Compute & Orchestration",
        "subdomain": "Spark Production Troubleshooting & OOM",
        "question": "How do you identify straggler tasks using the Spark UI event timeline, task metrics distribution, and shuffle read size percentiles, and how do you apply speculative execution vs AQE skew join splitting?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In distributed computing, a stage is only as fast as its slowest task. A stage with 1,000 tasks where 999 finish in 2 seconds, but 1 task runs for 45 minutes, is crippled by a **Straggler Task**.

**Diagnosing Stragglers in the Spark UI**:
1. **Task Metrics Summary Distribution Table**:
   - Inspect the 75th percentile, 90th percentile, and Max values for:
     * *Duration*: Max duration is 50× greater than median duration.
     * *Shuffle Read Size / Records*: Max reads 20GB while 75th percentile reads 50MB. This proves **Data Skew** (one key has millions of records).
     * *GC Time*: Max task spends 80% of its time in GC pauses, indicating memory thrashing.
2. **Event Timeline**:
   - Blue bars represent task computation; orange represents task deserialization; red represents GC pauses; green represents shuffle fetch wait.
   - Long green bars mean the task is waiting on slow network transfers from another executor.
3. **Speculative Execution vs AQE Skew Join Splitting**:
   - *Speculative Execution (`spark.speculation=true`)*: Launches a duplicate copy of a straggler on another worker. **Effective ONLY for non-data hardware degradation** (slow disk, bad NIC, noisy neighbor VM). Completely useless for data skew, because the duplicate task will process the exact same massive partition and straggle just as long!
   - *AQE Skew Join Splitting (`spark.sql.adaptive.skewJoin.enabled=true`)*: The definitive fix for data skew. Spark dynamically splits the single skewed partition into multiple sub-partitions and joins them in parallel.

### Phase 2: Implementation & Code Artifacts
Below is how Adaptive Query Execution (AQE) skew join parameters and speculative execution are tuned in production.

```properties
# 1. Enable and Tune AQE Skew Join Remediation
spark.sql.adaptive.enabled true
spark.sql.adaptive.skewJoin.enabled true

# A partition is considered skewed if:
# Size > skewJoin.skewedPartitionFactor * median partition size AND Size > skewJoin.skewedPartitionThresholdInBytes
spark.sql.adaptive.skewJoin.skewedPartitionFactor 5
spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes 268435456 # 256 MB

# 2. Speculative Execution Tuning (For Hardware / VM Stragglers)
spark.speculation true
spark.speculation.multiplier 2.5 # Must be 2.5x slower than median task
spark.speculation.quantile 0.85 # Only start speculation after 85% of tasks in stage complete
```

```python
# 3. Two-Phase Salting in PySpark to manually eliminate straggler keys
from pyspark.sql.functions import col, concat, lit, rand, floor

# Add a random salt between 0 and 15 to the skewed join key
SALT_FACTOR = 16
df_skewed_salted = df_skewed.withColumn("salt", floor(rand() * SALT_FACTOR)) \\
    .withColumn("salted_join_key", concat(col("customer_id"), lit("_"), col("salt")))

# Replicate the small lookup dimension table across all 16 salts
from pyspark.sql.functions import explode, array
df_dim_exploded = df_dimension.withColumn("salt", explode(array([lit(i) for i in range(SALT_FACTOR)]))) \\
    .withColumn("salted_join_key", concat(col("customer_id"), lit("_"), col("salt")))

# Uniformly distributed join with ZERO stragglers!
df_balanced = df_skewed_salted.join(df_dim_exploded, on="salted_join_key")
```

### Phase 3: Production Gotchas & Failure Modes
- **Speculation Duplicating External Writes**: If your pipeline writes directly to a non-idempotent destination (e.g., executing a raw JDBC insert, publishing to an external REST API or webhook), enabling `spark.speculation=true` will cause both the original task and the speculative duplicate task to execute concurrently, resulting in duplicated records in the external database!
- **AQE Ineffective on Broadcast Joins**: AQE skew join splitting applies strictly to Sort-Merge Joins and Shuffle Hash Joins. If Catalyst attempted to execute a Broadcast Hash Join, or if skew occurs in a Window Function (`Window.partitionBy()`), AQE cannot split the partition. Manual salting or repartitioning is mandatory.
- **Speculation Starvation**: Setting `spark.speculation.quantile` too low (e.g., 0.5) causes Spark to launch speculative duplicates for half the stage's tasks, overwhelming the cluster's available CPU cores and starving subsequent stages of resources. Keep the quantile at 0.75–0.90.
"""
    },

    # ── Item 30: Spark UI DAG & Ganglia Deep Analysis for Production Bottlenecks ──
    {
        "de_id": "de-new-arch-spark-deep-036",
        "arch_id": "arch-spark-deep-036",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Advanced PySpark & Spark Core Optimization",
        "niche": "Spark UI DAG, Stage Metrics & Ganglia Profiling",
        "difficulty": "ARCHITECT",
        "domain": "Compute & Orchestration",
        "subdomain": "Spark Production Troubleshooting & OOM",
        "question": "How do you systematically read the Spark UI DAG, Stage Metrics, Executor Thread Dumps, and Ganglia cluster graphs to pinpoint whether a query is CPU-bound, I/O-bound, memory-bound, or network-bound?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Senior data architects debug performance not by guessing Spark configurations, but by cross-referencing metrics across the **Spark UI** and **Ganglia / CloudWatch system graphs**.

**Systematic 4-Dimension Bottleneck Matrix**:
1. **CPU-Bound Query**:
   - *Ganglia*: Cluster CPU utilization pinned at 90%–100%. Low disk and network I/O.
   - *Spark UI*: Executor run time dominates task duration. Whole-Stage CodeGen active.
   - *Root Causes*: Heavy regex parsing, unvectorized Python UDFs, intensive cryptographic hashing (`sha2`), or mathematical modeling.
   - *Resolution*: Enable Photon engine, replace Python UDFs with Arrow vectorized UDFs, or scale to compute-optimized worker types (e.g., AWS C-series / Azure F-series).
2. **I/O-Bound Query (Storage Throughput)**:
   - *Ganglia*: Low CPU (10%–25%), flat network, but tasks take a long time to start processing data.
   - *Spark UI*: High "Scan parquet" duration and high "Task Deserialization Time".
   - *Root Causes*: Reading uncompacted millions of tiny files, cloud storage throttling (S3/ADLS 503 SlowDown), reading uncompressed CSV/JSON.
   - *Resolution*: Run `OPTIMIZE` to bin-pack files to 1GB, enable Auto Loader, convert raw files to Delta.
3. **Memory-Bound Query (GC Thrashing & Spill)**:
   - *Ganglia*: Erratic sawtooth CPU patterns where CPU drops to zero repeatedly across workers.
   - *Spark UI*: "Task Time Metrics" shows GC time > 20% of Task Deserialization/Execution. High `Spill (Disk)` metrics.
   - *Root Causes*: Executor heap too small, high-cardinality aggregations, wide schemas.
   - *Resolution*: Switch to G1GC, increase `spark.executor.memory`, increase `spark.sql.shuffle.partitions`, enable off-heap memory.
4. **Network/Shuffle-Bound Query**:
   - *Ganglia*: Network throughput saturated (hitting VM NIC limits, e.g., 10Gbps–25Gbps).
   - *Spark UI*: "Shuffle Read / Write" time dominates stage duration. Tasks spend substantial time in "Shuffle Fetch Wait Time".
   - *Resolution*: Broadcast small dimension tables, enable AQE shuffle coalescing, pre-bucket data, filter columns before join.

### Phase 2: Implementation & Code Artifacts
Below is how to programmatically extract Spark UI stage metrics and take an automated executor thread dump during pipeline execution.

```python
# 1. Programmatically Capture Stage Metrics via Spark Listener API
from pyspark.sql import SparkSession

def profile_stage_execution(df):
    '''
    Executes DataFrame action while capturing physical shuffle and spill metrics.
    '''
    # Trigger action with cached metric collection
    spark.sparkContext.setJobDescription("Profiling Heavy Lakehouse Transformation")
    
    # Explain formatted physical plan
    df.explain(mode="formatted")
    
    # Execute query
    result_count = df.count()
    print(f"Query completed successfully. Processed rows: {result_count}")

# 2. Extracting Executor Thread Dump via Databricks REST API
# Useful for detecting JVM deadlocks or hung native threads
import requests
import json

def get_executor_thread_dump(workspace_url, token, cluster_id, executor_id):
    headers = {"Authorization": f"Bearer {token}"}
    url = f"{workspace_url}/api/2.0/clusters/get"
    # Thread dumps can also be captured via the Spark UI Executors tab -> Thread Dump link
    print(f"Navigating to Spark UI: {workspace_url}/#setting/clusters/{cluster_id}/sparkUi")
```

### Phase 3: Production Gotchas & Failure Modes
- **Reading Wall-Clock Time instead of Cumulative Core-Time**: The Spark UI displays "Task Deserialization Time" and "Executor Run Time" as sum-totals across all cores. A stage with 1,000 cores may show "Executor Run Time: 2.5 hours", which sounds alarming until you realize the stage completed in 9 seconds of actual wall-clock time ($2.5 \\text{ hours} / 1000 \\text{ cores} = 9 \\text{ seconds}$). Always compare against actual wall-clock duration.
- **Overlooking Driver Thread Blockage**: When Ganglia shows 0% CPU across all worker executors, but the job status remains active, data engineers often assume worker failure. In reality, the *Driver* is blocked: it is either executing `df.collect()` into driver memory, performing sequential S3 file listings, or compiling a massive Catalyst plan. Click the Spark UI "Jobs" tab to inspect Driver stack traces.
- **Shuffle Spill Amplification Ratio**: When inspecting `Spill (Memory)` vs `Spill (Disk)` in the Spark UI, remember that Tungsten in-memory UnsafeRows are uncompressed. When spilled to disk, Spark compresses them via LZ4 or Snappy. A 100GB memory spill will typically write 25GB to disk. If disk space is exhausted, executors abort with `No space left on device`.
"""
    },

    # ── Item 31: External Orchestration: Airflow vs ADF vs dbt with Databricks ──
    {
        "de_id": "de-new-arch-databricks-deep-037",
        "arch_id": "arch-databricks-deep-037",
        "category_de": "Databricks Lakehouse Architecture",
        "category_arch": "Databricks Lakehouse Architecture",
        "niche": "External Orchestration: Airflow, ADF & dbt Integration",
        "difficulty": "ARCHITECT",
        "domain": "Data Lakehouse & Architecture",
        "subdomain": "Databricks Compute & Governance",
        "question": "Compare orchestrating Databricks workloads using Apache Airflow (DatabricksRunNowOperator), Azure Data Factory (Notebook Activity), and dbt-databricks. What are the metadata passing, retry semantics, and cost implications of each approach?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Enterprise data platforms rarely run Databricks in isolation. They integrate with enterprise orchestrators:

1. **Apache Airflow (`DatabricksRunNowOperator` / `DatabricksSubmitRunOperator`)**:
   - *Architecture*: Airflow acts as the master cross-platform enterprise DAG orchestrator (orchestrating ingestion from SAP, Salesforce, Kafka, triggering Databricks, and refreshing BI).
   - *Execution Model*: Uses asynchronous polling sensors (`DatabricksRunNowOperator`). Submits the run via REST API, yields the worker thread, and polls the Databricks API for completion.
   - *Best For*: Complex DAGs requiring cross-system dependencies, dynamic task mapping, SLA alerting, and GitOps-driven Python orchestration.
2. **Azure Data Factory (ADF) Databricks Linked Service**:
   - *Architecture*: Native Azure GUI-driven integration. Executes Notebook activities or Python scripts on existing interactive clusters or creates new job clusters.
   - *Execution Model*: Synchronous HTTP polling. ADF pipeline waits for Databricks run status.
   - *Best For*: Azure-first enterprises with low-code requirements and existing hybrid integration runtimes (SHIR) connecting on-prem databases to ADLS Gen2.
3. **dbt-databricks (Transformation Layer)**:
   - *Architecture*: Specialized analytics engineering framework. Manages SQL models, incremental merges, and tests.
   - *Execution Model*: Connects directly to **Databricks SQL Warehouses** (Serverless) via thrift / SQL execution REST API. dbt compiles Jinja SQL into native Delta MERGE and CREATE TABLE AS SELECT queries.
   - *Best For*: In-lake SQL modeling, data testing, column-level lineage, and analytics engineering.

### Phase 2: Implementation & Code Artifacts
Below is an Airflow DAG definition triggering an automated Databricks Workflow and a dbt-databricks `profiles.yml` configuration.

```python
# Airflow DAG using modern TaskFlow API and DatabricksRunNowOperator
from airflow.decorators import dag, task
from airflow.providers.databricks.operators.databricks import DatabricksRunNowOperator
from datetime import datetime

@dag(
    schedule="@daily",
    start_date=datetime(2026, 1, 1),
    catchup=False,
    tags=["lakehouse", "enterprise_etl"]
)
def orchestrate_databricks_pipeline():
    
    # 1. Trigger pre-existing Databricks Workflow Job via Job ID
    trigger_databricks_job = DatabricksRunNowOperator(
        task_id="trigger_customer_gold_job",
        databricks_conn_id="databricks_enterprise_conn",
        job_id=482910382,
        notebook_params={"batch_date": "{{ ds }}", "environment": "production"},
        repair_run=True, # Automatically repairs failed tasks on retry!
        polling_period_seconds=30
    )

    @task
    def notify_success():
        print("Databricks enterprise job successfully completed.")

    trigger_databricks_job >> notify_success()

pipeline_dag = orchestrate_databricks_pipeline()
```

```yaml
# dbt-databricks profiles.yml
enterprise_lakehouse:
  target: prod
  outputs:
    prod:
      type: databricks
      schema: gold_analytics
      host: adb-123456789.azuredatabricks.net
      http_path: /sql/1.0/warehouses/ab12cd34ef56gh78 # Serverless SQL Warehouse
      token: "{{ env_var('DBT_DATABRICKS_TOKEN') }}"
      threads: 8
```

### Phase 3: Production Gotchas & Failure Modes
- **ADF Polling Thread Starvation**: In ADF, each executing Databricks activity consumes one concurrent pipeline run slot. If a Databricks job runs for 4 hours, ADF holds that slot open. If the job fails and ADF retries, it can exhaust ADF pipeline concurrency limits. Always set execution timeouts in ADF.
- **Airflow DatabricksSubmitRun vs DatabricksRunNow**: Using `DatabricksSubmitRunOperator` sends a full JSON cluster specification at runtime. If not carefully version-controlled, different Airflow developers will launch unmonitored clusters with arbitrary VM sizes, bypassing Databricks Cluster Policies. Always pre-define the job in Databricks and trigger it with `DatabricksRunNowOperator`.
- **dbt on Interactive All-Purpose Clusters**: Pointing `dbt-databricks` to an interactive all-purpose cluster instead of a Serverless Databricks SQL Warehouse increases DBU costs by 2×–3× and disables optimized SQL vectorization. Always use Databricks SQL Serverless endpoints for dbt models.
"""
    }
]
