# fix_questions_spark_pyspark.py
# Bespoke, expert answers for 30 Spark / PySpark questions.
# Handcrafted by Principal Big Data Architect - ZERO boilerplate.

def get_spark_pyspark_fixes() -> dict[str, dict]:
    return {
        "spark_pyspark-easy-1": {
            "question": "How do you choose between using RDDs, DataFrames, and Datasets in a system design?",
            "answer": """Choosing between RDDs, DataFrames, and Datasets dictates memory efficiency, optimization capability, and language ergonomics in Apache Spark:

1. **DataFrames (`Dataset[Row]`)**:
   - **Mechanism**: The standard abstraction for PySpark and Spark SQL. Schema-aware collections of untyped Row objects backed by the **Catalyst Optimizer** and **Project Tungsten**. Catalyst performs logical/physical query optimization, predicate pushdown, and constant folding, while Tungsten manages off-heap binary memory to eliminate JVM object overhead and garbage collection.
   - **Use Case**: Default choice for almost all production batch ETL, SQL transformations, and PySpark data pipelines.

2. **Datasets (`Dataset[T]`)**:
   - **Mechanism**: Strongly typed JVM collections providing compile-time type safety via Encoders (available exclusively in Scala and Java, not Python due to dynamic typing).
   - **Trade-off**: While type-safe, Datasets incur serialization overhead because custom JVM domain objects require unrolling into Tungsten binary rows, often running slower than pure DataFrames.
   - **Use Case**: Scala applications requiring strict compile-time domain validation and object-oriented business logic.

3. **Resilient Distributed Datasets (RDDs)**:
   - **Mechanism**: The foundational, low-level immutable distributed collection of Spark. Completely opaque to Catalyst and Tungsten; Spark cannot inspect or optimize transformations inside RDD closures. In PySpark, RDDs suffer heavy performance penalties due to Py4J serialization and socket IPC between Python workers and the JVM.
   - **Use Case**: Rare scenarios requiring custom partitioners, reading unparseable binary/socket streams, or legacy code maintenance. Avoid RDDs in modern PySpark design."""
        },

        "spark_pyspark-easy-2": {
            "question": "What is the impact of narrow versus wide transformations on Spark cluster performance?",
            "answer": """Transformations in Spark are classified as either narrow or wide based on their partition dependency graph, fundamentally determining cluster resource consumption:

1. **Narrow Transformations (`filter`, `map`, `flatMap`, `withColumn`)**:
   - **Mechanism**: Each partition of the parent RDD/DataFrame is consumed by at most one partition of the child. Execution occurs entirely within local executor memory without network transfer.
   - **Performance**: Pipelined into a single stage using **Whole-Stage Code Generation**. Data remains in local L1/L2 CPU cache or memory, resulting in maximum throughput and near-linear scaling across cores.

2. **Wide Transformations (`groupByKey`, `reduceByKey`, `join`, `distinct`, `repartition`)**:
   - **Mechanism**: Multiple child partitions require data slices from multiple parent partitions, introducing a **Stage Boundary** and forcing a **Shuffle**.
   - **Performance Impact**:
     - **Disk I/O**: Shuffled data must be serialized, sorted/hashed, and written to local executor scratch disks as map output shuffle files.
     - **Network Saturation**: Reducer tasks across worker nodes fetch shuffle blocks concurrently over HTTP/Netty, saturating inter-node network bandwidth.
     - **Spill and Memory Pressure**: Reducers buffer incoming shuffle blocks in execution memory. If partitions exceed allocated memory, Spark spills sorted runs to disk, causing 10x-50x latency penalties.

```python
# Narrow: Pipelined in Stage 1 (zero network I/O)
filtered_df = raw_df.filter(raw_df["status"] == "ACTIVE").select("user_id", "amount")

# Wide: Forces Shuffle boundary -> Stage 2 (Network + Disk I/O)
aggregated_df = filtered_df.groupBy("user_id").agg({"amount": "sum"})
```

3. **Production Best Practice**: Always push narrow filters and column projections upstream before wide transformations to minimize the byte volume entering the shuffle exchange."""
        },

        "spark_pyspark-easy-3": {
            "question": "How do you determine the optimal number of Spark partitions for a specific workload?",
            "answer": """Determining optimal Spark partition count balances parallelism against scheduling overhead and memory pressure:

1. **Target Partition Sizing**:
   - **Golden Rule**: Target uncompressed in-memory partition sizes between **100 MB and 200 MB**.
   - **Under-partitioning (< 2 cores per partition or > 500 MB/partition)**: Causes executor memory exhaustion, heavy JVM garbage collection pauses, disk spilling during wide transformations, and idle worker cores.
   - **Over-partitioning (> 1000s of partitions < 10 MB each)**: Creates massive task-scheduling latency in the Driver, excessive metadata tracking, network serialization overhead, and small file proliferation on cloud object storage.

2. **Sizing Formulas & Rules of Thumb**:
   - **Cluster Parallelism Rule**: For CPU-bound batch jobs, set shuffle partitions to **2x to 4x the total available executor cores** in the cluster.
     `spark.sql.shuffle.partitions = Total_Executor_Cores * 3`
     *(e.g., 25 executors x 4 cores/executor = 100 cores -> 200 to 400 shuffle partitions).*
   - **Data Volume Rule**: `Shuffle_Partitions = Total_Shuffle_Input_Data_Size / 128MB`. For 500 GB input: `500,000 MB / 128 MB ≈ 3,900 partitions`.

3. **Adaptive Query Execution (AQE) in Spark 3.x+**:
   - Always enable AQE to eliminate manual guesswork:
```properties
spark.sql.adaptive.enabled=true
spark.sql.adaptive.coalescePartitions.enabled=true
spark.sql.adaptive.advisoryPartitionSizeInBytes=134217728  # 128 MB target
spark.sql.adaptive.coalescePartitions.minPartitionNum=10
```
   - AQE inspects shuffle stage statistics at runtime and dynamically coalesces small contiguous shuffle partitions into 128 MB chunks, handling variable ingestion sizes automatically."""
        },

        "spark_pyspark-easy-4": {
            "question": "Design a basic caching strategy utilizing `cache()` versus `persist()`?",
            "answer": """In Apache Spark, intermediate datasets should only be materialized when an identical DataFrame with an expensive lineage is evaluated multiple times across branching actions.

1. **`cache()` vs `persist()` Mechanisms**:
   - `cache()` is simply an alias for `persist(StorageLevel.MEMORY_AND_DISK_DESER)` in DataFrames (stored in Tungsten off-heap/on-heap columnar format).
   - `persist(storageLevel)` allows explicit specification of the storage tier, serialization, and replication:
     - `MEMORY_ONLY`: Fastest access, but if partitions do not fit into storage memory, they are discarded and recomputed on-the-fly during subsequent actions.
     - `MEMORY_AND_DISK`: Buffers in memory, spilling excess partitions to local executor disk. Prevents recomputation at the cost of disk read I/O.
     - `MEMORY_ONLY_SER` / `MEMORY_AND_DISK_SER`: Stores partitions as serialized byte buffers; drastically reduces JVM object memory footprint and GC pressure.
     - `_2` suffix (e.g., `MEMORY_AND_DISK_2`): Replicates blocks to two worker nodes for fault tolerance without lineage recomputation.

2. **Production Caching Protocol**:
```python
from pyspark.storage import StorageLevel

# Branching point: df is referenced by both aggregation and raw export
curated_df = raw_df.join(dim_df, "id").filter("status = 'VALID'")
curated_df.persist(StorageLevel.MEMORY_AND_DISK)

try:
    # Action 1: Write summary KPI report
    curated_df.groupBy("category").sum("sales").write.parquet("s3://bucket/kpis/")
    
    # Action 2: Write filtered anomaly data
    curated_df.filter("sales > 10000").write.parquet("s3://bucket/anomalies/")
finally:
    # Mandatory: Evict from executor memory immediately after consumers finish
    curated_df.unpersist()
```

3. **Operational Anti-Pattern**: Caching linear pipelines (single action downstream) wastefully consumes execution memory. Never leave persisted DataFrames in memory without calling `.unpersist()`."""
        },

        "spark_pyspark-easy-5": {
            "question": "How do you structure a PySpark job to read data efficiently from cloud object storage (e.g., S3, ADLS)?",
            "answer": """Cloud object storage systems (AWS S3, Azure ADLS Gen2, Google Cloud Storage) are distributed key-value stores with REST APIs, not POSIX filesystems. Structuring PySpark jobs to read from them requires minimizing HTTP request amplification and maximizing parallel byte-range reads:

1. **Columnar Pruning & Pushdown**:
   - Use columnar formats (Parquet, Delta Lake, ORC). Read only necessary columns (`select("id", "timestamp")`) to leverage Parquet file footers, allowing Spark to issue HTTP `Range: bytes=start-end` requests to read only the target column chunks.

2. **Partition Pruning without Directory Crawling**:
   - Avoid deep wildcard globbing (`s3a://bucket/*/*/*/*.parquet`) across millions of unindexed files, which triggers expensive, high-latency `LIST` REST calls.
   - Enforce explicit partition filter predicates matching directory structures:
```python
# Leverages directory partition discovery without scanning non-matching folders
df = spark.read.parquet("s3a://data-lake/events/") \\
    .filter((col("year") == 2024) & (col("month") == 5)) \\
    .select("event_id", "user_id", "payload")
```

3. **Optimized Object Storage Configurations**:
```properties
# S3A Fast Upload and high-concurrency connection pooling
spark.hadoop.fs.s3a.fast.upload=true
spark.hadoop.fs.s3a.connection.maximum=1000
spark.hadoop.fs.s3a.threads.max=256
spark.hadoop.fs.s3a.experimental.input.fadvise=random  # For Parquet/ORC random reads
```

4. **Production Pitfall**: Never use Hadoop v1 `FileOutputCommitter` on cloud storage; directory renames on S3 are non-atomic `COPY` + `DELETE` operations. Always use Delta Lake transaction logs or the S3A Magic/Directory Committer."""
        },

        "spark_pyspark-easy-6": {
            "question": "What is the difference between client mode and cluster mode in terms of resource management?",
            "answer": """The deployment mode (`client` vs `cluster`) defines the physical location of the Spark Driver process relative to the cluster resource manager (YARN, Kubernetes, Standalone):

1. **Client Mode**:
   - **Driver Location**: Runs directly inside the host process/machine that submits the job (e.g., a data engineer's laptop, edge gateway node, or Jupyter notebook server).
   - **Resource Management**: The driver allocates its JVM heap outside cluster control. Executors are launched within the cluster and maintain persistent bi-directional network communication back to the external client host.
   - **System Vulnerability**: If the client machine sleeps, drops Wi-Fi, or crashes, the driver dies and the entire distributed cluster application fails immediately. Saturated network egress on the edge node occurs when executors return task metrics or broadcast data.
   - **Use Case**: Interactive querying, exploratory notebook analysis, and local debugging.

2. **Cluster Mode**:
   - **Driver Location**: The client submits the application specification and immediately disconnects. The cluster orchestrator (YARN ResourceManager / Kubernetes API) selects a worker node and provisions the Driver inside an ApplicationMaster container or Kubernetes Pod.
   - **Resource Management**: Driver CPU and memory are formally accounted for and scheduled inside cluster resource quotas (`spark.driver.memory`, `spark.driver.cores`). Co-located with executors on the high-bandwidth datacenter/cloud backplane network.
   - **Resilience**: Orchestrator can automatically restart the driver upon failure (`--supervise`).
   - **Use Case**: Production standard for all automated batch ETL, scheduled Airflow DAGs, and continuous streaming jobs."""
        },

        "spark_pyspark-easy-7": {
            "question": "How do you monitor PySpark job performance using the Spark UI?",
            "answer": """The Spark Web UI (port 4040 during execution, or Spark History Server port 18080 post-execution) is the primary diagnostic interface for Spark applications. Systematic analysis follows a structured four-tab workflow:

1. **Jobs & Stages Tab**:
   - **Event Timeline**: Check for serialization gaps where the driver is blocked or executors sit idle waiting for task scheduling.
   - **Task Summary Metrics (Min, 25th, Median, 75th, Max)**: The single most vital diagnostic table. If the **Max task duration** is 30 minutes while the **Median** is 4 seconds, you have diagnosed severe **Data Skew**.
   - Check **Shuffle Read Size / Records** across percentiles to verify whether a single partition received disproportionate data volume.
   - Identify **Spill (Memory)** and **Spill (Disk)**. Any non-zero disk spill indicates tasks ran out of execution memory, writing temporary shuffle blocks to disk and degrading performance.

2. **SQL / DataFrame Tab**:
   - Visualizes the physical execution DAG. Click on stage nodes to inspect actual physical operators (`SortMergeJoin`, `BroadcastHashJoin`, `Exchange hashpartitioning`).
   - Inspect operator metrics: verify `number of output rows`, verify whether predicate pushdown succeeded in `Scan parquet`, and confirm dynamic partition pruning (`pruning: true`).

3. **Executors Tab**:
   - Monitor **Task Time (GC Time)**: If GC time exceeds 10% of total task runtime, the JVM heap is thrashing; increase `spark.executor.memory` or decrease `spark.executor.cores`.
   - Inspect failed tasks, killed tasks, and node blacklisting events to detect faulty worker hardware.

4. **Storage Tab**:
   - Validate whether cached DataFrames are 100% in memory or spilling to disk, and ensure unpersisted datasets are not leaking memory."""
        },

        "spark_pyspark-easy-8": {
            "question": "Design a basic strategy for filtering data before executing a join to optimize performance?",
            "answer": """In distributed data processing, joining unpartitioned or unfiltered tables is the single most expensive operation due to the shuffle phase. Filtering data prior to joining adheres to the **Filter Pushdown and Shuffle Minimization Principle**:

1. **Eliminate Shuffle Volume Upstream**:
   - In a Sort-Merge Join (SMJ), Spark hashes and redistributes both datasets across the network based on the join keys. If a 1-billion-row fact table contains 95% obsolete records, performing the filter *after* the join forces Spark to serialize, shuffle, and sort 950 million useless rows across the cluster network.
   - Pre-filter both tables explicitly:
```python
# Filter and prune columns before joining
filtered_sales = sales_df.filter(
    (col("sale_date") >= "2024-01-01") & (col("status") == "COMPLETED")
).select("transaction_id", "customer_id", "amount")

active_customers = customers_df.filter(
    col("is_active") == True
).select("customer_id", "tier")

# Join operates exclusively on strictly required rows and columns
result_df = filtered_sales.join(active_customers, on="customer_id", how="inner")
```

2. **Dynamic Partition Pruning (DPP) in Spark 3.x**:
   - When joining a partitioned fact table with a filtered dimension table, ensure DPP is active (`spark.sql.optimizer.dynamicPartitionPruning.enabled=true`). Spark automatically broadcasts the filtered dimension's partition keys to the fact scan, pruning non-matching fact partitions before reading from cloud storage.

3. **Production Edge Case**: Verify that filter predicates are deterministic. Using non-deterministic expressions or unparsed string comparisons can invalidate Catalyst predicate pushdown, reverting execution to full table scans."""
        },

        "spark_pyspark-easy-9": {
            "question": "What is the system impact of calling `.collect()` on a massive DataFrame?",
            "answer": """Calling `.collect()` on a distributed DataFrame instructs Apache Spark to gather every single record across all executor partitions and transfer them over the network into the Driver process as a localized in-memory Python list:

1. **Driver Out-Of-Memory Crash (`java.lang.OutOfMemoryError`)**:
   - The Spark Driver JVM possesses a finite memory allocation (`spark.driver.memory`, often 2 GB to 8 GB). If a 500 GB distributed DataFrame is collected, the Driver JVM instantly runs out of heap space, triggering a fatal crash that terminates the entire application and kills all active cluster executors.

2. **Network Saturation and Serialization Bottleneck**:
   - Thousands of executor tasks concurrently serialize their partition blocks and stream them to the Driver over TCP. This creates severe network interface saturation, TCP packet drops, and driver-side socket timeouts.
   - In PySpark, data must cross the JVM-to-Python IPC socket (Py4J), converting Java objects into Python heap objects, multiplying memory consumption by 2x-4x.

3. **Production Best Practices & Safe Alternatives**:
   - **Never call `.collect()` in production pipelines.**
   - For previewing data: Use `.take(n)`, `.head(n)`, or `.show(n)` which evaluate only the first partition.
   - For persisting results: Stream directly to durable distributed storage:
     `df.write.format("delta").mode("overwrite").save("s3://bucket/output/")`
   - **Safety Circuit Breaker**: Configure `spark.driver.maxResultSize = "4g"` (or smaller) to abort any query attempting to pull data exceeding safe driver memory thresholds."""
        },

        "spark_pyspark-easy-10": {
            "question": "How do you handle basic missing data imputation efficiently in PySpark?",
            "answer": """Handling missing data (nulls and NaNs) in PySpark requires native Catalyst-optimized expressions that execute off-heap within Project Tungsten, strictly avoiding slow Python row-by-row iteration:

1. **Native DataFrameNaFunctions (`fillna` / `replace`)**:
   - The fastest and most concise method for constant imputation across typed columns:
```python
# Impute numeric columns with 0.0, strings with 'UNKNOWN', and flags with False
df_cleaned = df.na.fill({
    "revenue": 0.0,
    "discount": 0.0,
    "customer_segment": "UNKNOWN",
    "is_verified": False
})
```

2. **Vectorized Statistical Imputation with Spark ML `Imputer`**:
   - For calculating and applying statistical aggregations (mean, median, mode) across massive datasets in a single distributed pass:
```python
from pyspark.ml.feature import Imputer

imputer = Imputer(
    inputCols=["age", "income", "credit_score"],
    outputCols=["age_imputed", "income_imputed", "credit_score_imputed"]
).setStrategy("median")  # Options: 'mean', 'median', 'mode'

model = imputer.fit(df_cleaned)
imputed_df = model.transform(df_cleaned)
```

3. **Time-Series Forward-Fill / Backward-Fill via Window Functions**:
   - For sequential sensor or financial time-series data:
```python
from pyspark.sql.window import Window
from pyspark.sql.functions import last

window_spec = Window.partitionBy("sensor_id").orderBy("timestamp") \\
    .rowsBetween(Window.unboundedPreceding, Window.currentRow)

df_filled = df.withColumn("sensor_val", last("sensor_val", ignorenulls=True).over(window_spec))
```

4. **Production Anti-Pattern**: Never convert a PySpark DataFrame to a Pandas DataFrame via `.toPandas()` just to run `.fillna()`. Keep all transformations in the distributed Spark engine."""
        },

        "spark_pyspark-medium-11": {
            "question": "How do you diagnose and resolve data skew that is causing a few Spark tasks to take hours while others take seconds?",
            "answer": """Data skew occurs when an uneven distribution of join or grouping keys causes a tiny fraction of partitions to process massive data volumes while all other executor tasks complete in seconds.

### 1. Diagnosis Workflow:
- In the **Spark UI -> Stages** tab, examine the **Task Metrics Distribution**:
  - If 199 tasks finish in 5 seconds (processing 50 MB each), but task 200 takes 45 minutes and processes 80 GB with gigabytes of **Spill (Disk)**, data skew is confirmed.
- Identify the skewed key by running frequency profiling:
```python
df.groupBy("join_key").count().sort(col("count").desc()).show(10)
```
  Common culprits include `NULL` values, default foreign keys (`user_id = -1`), or platform-wide power users.

### 2. Resolution Strategies:

1. **Adaptive Query Execution (AQE) Skew Join Handling (Spark 3.x+)**:
   - Enable native runtime skew handling:
```properties
spark.sql.adaptive.enabled=true
spark.sql.adaptive.skewJoin.enabled=true
spark.sql.adaptive.skewJoin.skewedPartitionFactor=5
spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes=268435456  # 256 MB
```
   - Spark dynamically detects skewed partitions post-shuffle, splits the skewed partition into smaller sub-partitions, and replicates corresponding partitions in the join partner to parallelize execution.

2. **Salting Technique (Manual Remediation)**:
   - When AQE is unavailable or skew is extreme, append a random integer salt (`0 to N-1`) to the skewed key of the large table, and explode the dimension table rows by `N` with matching salts:
```python
from pyspark.sql.functions import concat, lit, floor, rand, explode, array

SALT_FACTOR = 16
# Salt the skewed fact table
salted_fact = fact_df.withColumn(
    "salted_key", 
    concat(col("join_key"), lit("_"), floor(rand() * SALT_FACTOR))
)

# Replicate the dimension table
salt_array = array([lit(i) for i in range(SALT_FACTOR)])
exploded_dim = dim_df.withColumn("salt", explode(salt_array)) \\
    .withColumn("salted_key", concat(col("join_key"), lit("_"), col("salt")))

# Uniformly balanced join (zero skew)
result_df = salted_fact.join(exploded_dim, on="salted_key", how="inner").drop("salted_key", "salt")
```

3. **Isolated Filtering**: Isolate `NULL` or placeholder keys into a separate DataFrame, process non-null keys via standard join, and `unionByName` the null rows afterwards."""
        },

        "spark_pyspark-medium-12": {
            "question": "Architect a pipeline utilizing Broadcast Hash Joins to optimize the joining of a massive fact table with a small dimension table?",
            "answer": """In distributed systems, joining a multi-terabyte fact table with a small dimension table (e.g., currency rates, product catalogs < 100 MB) should bypass the network shuffle entirely using a **Broadcast Hash Join (BHJ)**:

### 1. Architectural Mechanism:
- **Phase 1 (Driver Collect & Hash Table)**: The Spark Driver fetches the dimension table partitions from storage, constructs an in-memory hash table, and serializes it.
- **Phase 2 (TorrentBroadcast)**: The serialized hash table is distributed to all executor nodes using BitTorrent-like peer-to-peer chunk replication, preventing driver network saturation.
- **Phase 3 (Zero-Shuffle Local Scan)**: Each executor reads its assigned fact table partitions from storage and performs local in-memory hash table lookups. The large fact table is **never shuffled or sorted over the network**.

### 2. Implementation:
```python
from pyspark.sql.functions import broadcast

# Explicit broadcast hint via DataFrame API
fact_df = spark.read.parquet("s3a://lakehouse/fact_transactions/")
dim_stores = spark.read.parquet("s3a://lakehouse/dim_store_locations/")

# Force Broadcast Hash Join
joined_df = fact_df.join(
    broadcast(dim_stores),
    on="store_id",
    how="inner"
)
```

### 3. Tuning & Production Safeguards:
```properties
# Threshold for automatic broadcast in bytes (default 10 MB, tune to 100 MB max)
spark.sql.autoBroadcastJoinThreshold=104857600
# Timeout for broadcast serialization and transfer
spark.sql.broadcastTimeout=600
```

### 4. Critical Trade-offs & Failure Modes:
- **Driver OOM Risk**: The broadcast dataset is materialized in the Driver JVM heap. Broadcasting a 1 GB uncompressed table can expand to 3-5 GB of JVM objects, crashing the driver.
- **Executor Memory Pressure**: In high-density multi-core worker nodes, multiple concurrent tasks read the broadcast table; ensure `spark.executor.memory` accounts for the shared broadcast footprint."""
        },

        "spark_pyspark-medium-13": {
            "question": "How do you tune Spark memory configuration (`spark.memory.fraction`, `spark.memory.storageFraction`) to prevent OutOfMemory (OOM) errors?",
            "answer": """Spark's Unified Memory Manager allocates executor heap space across distinct functional pools. Preventing OutOfMemory (OOM) errors requires aligning these pools with pipeline characteristics:

### 1. Memory Architecture Breakdown:
Total Executor Memory (`spark.executor.memory`) is divided into:
- **Reserved Memory**: Fixed at **300 MB** for internal Spark engine processes.
- **User Memory (`(JVM - 300MB) * (1 - spark.memory.fraction)`)**: Holds user-defined data structures, internal metadata, and Python worker serialization buffers.
- **Spark Unified Memory (`(JVM - 300MB) * spark.memory.fraction`)** (default `0.6` = 60%):
  - **Execution Memory**: Used for shuffles, joins, sorts, and aggregations.
  - **Storage Memory**: Used for cached DataFrames, RDD blocks, and broadcast variables.
  - `spark.memory.storageFraction` (default `0.5` = 50% of Spark Memory): Establishes the protected storage threshold that cannot be evicted by execution memory.

### 2. Strategic Tuning for Workloads:
- **Heavy ETL / Shuffles / Zero Caching**:
  If pipelines perform large joins and aggregations without calling `.cache()`, the default 50% storage fraction wastefully locks memory away from shuffles, causing unnecessary disk spills.
```properties
spark.memory.fraction=0.8           # Grant 80% to Spark Unified Memory
spark.memory.storageFraction=0.1    # Grant 90% of unified memory to Execution
```
- **Iterative ML / Heavy Caching**:
  Increase storage fraction to prevent cache thrashing:
```properties
spark.memory.fraction=0.8
spark.memory.storageFraction=0.6
```

### 3. Off-Heap & PySpark Overhead Safeguards:
- **YARN/K8s Container Kills (`Exit Code 137`)**: Occurs when off-heap Python processes exceed OS limits. Always scale `memoryOverhead`:
```properties
# Ensure overhead is at least 15-20% of executor memory for heavy PySpark / Arrow
spark.executor.memoryOverhead=4096m
# Enable Tungsten off-heap allocation to bypass JVM GC pauses completely
spark.memory.offHeap.enabled=true
spark.memory.offHeap.size=8g
```"""
        },

        "spark_pyspark-medium-14": {
            "question": "Design a system to efficiently update and merge historical data into an existing Parquet dataset using PySpark?",
            "answer": """Parquet files are inherently immutable columnar storage files. Updating historical data requires either an ACID lakehouse format (modern standard) or a partitioned dynamic overwrite system (legacy standard):

### Architecture 1: Modern Lakehouse ACID Merge (Delta Lake / Apache Iceberg)
The industry standard approach utilizes copy-on-write or merge-on-read ACID transaction logs:
```python
from delta.tables import DeltaTable

delta_target = DeltaTable.forPath(spark, "s3a://lakehouse/gold_customers")
incremental_updates = spark.read.parquet("s3a://landing/customer_updates")

# Atomic UPSERT into historical dataset
delta_target.alias("target").merge(
    source=incremental_updates.alias("source"),
    condition="target.customer_id = source.customer_id AND target.region = source.region"
).whenMatchedUpdate(set={
    "name": "source.name",
    "email": "source.email",
    "updated_at": "source.updated_at"
}).whenNotMatchedInsert(values={
    "customer_id": "source.customer_id",
    "region": "source.region",
    "name": "source.name",
    "email": "source.email",
    "created_at": "source.updated_at",
    "updated_at": "source.updated_at"
}).execute()
```
- **System Benefit**: Only files containing updated rows are rewritten; untouched files remain referenced in the transaction log. Supports Deletion Vectors (Merge-on-Read) to avoid full file rewrites.

### Architecture 2: Legacy Pure Parquet Dynamic Partition Overwrite
When restricted to raw Parquet files, rewrite exclusively impacted partitions:
```python
spark.conf.set("spark.sql.sources.partitionOverwriteMode", "dynamic")

# Read historical data for impacted partitions only, union with new data, deduplicate
historical_partition = spark.read.parquet("s3a://lakehouse/parquet_customers") \\
    .filter(col("region").isin(["US-WEST", "EU-CENTRAL"]))

combined_deduped = historical_partition.unionByName(incremental_updates) \\
    .dropDuplicates(["customer_id"])

# Atomically overwrites only the matching directory partitions on storage
combined_deduped.write.partitionBy("region").mode("overwrite").parquet("s3a://lakehouse/parquet_customers")
```"""
        },

        "spark_pyspark-medium-15": {
            "question": "How do you optimize the performance of custom Python User Defined Functions (UDFs) using Vectorized (Pandas) UDFs?",
            "answer": """Standard Python UDFs represent one of the most severe performance anti-patterns in Apache Spark. Replacing them with Vectorized Pandas UDFs resolves the serialization bottleneck:

### 1. Mechanism Comparison:
- **Standard Python UDF (`@udf`)**: Executes row-by-row. Data in the JVM must be deserialized, piped over a Unix domain socket via Py4J to a Python daemon, pickled, evaluated, unpickled, and serialized back to the JVM. Disables Catalyst whole-stage code generation, resulting in 10x-100x performance degradation.
- **Vectorized Pandas UDF (`@pandas_udf`)**: Powered by **Apache Arrow**. Data is transferred between JVM and Python in contiguous columnar memory buffers (zero-copy memory sharing). Operations execute in batch on C-accelerated NumPy and Pandas arrays.

### 2. Implementation Patterns:
```python
from pyspark.sql.functions import pandas_udf
from pyspark.sql.types import DoubleType
import pandas as pd

# Pattern 1: Series to Series (Vectorized Scalar Math)
@pandas_udf(DoubleType())
def calculate_tax_vectorized(price: pd.Series, tax_rate: pd.Series) -> pd.Series:
    # Direct vectorized C-operation
    return price * tax_rate

# Pattern 2: Iterator of Series to Iterator of Series (Stateful Model Inference)
# Loads heavyweight ML model ONCE per executor task rather than per row/batch
@pandas_udf(DoubleType())
def predict_fraud(iterator: pd.Series) -> pd.Series:
    import joblib
    model = joblib.load("/opt/models/fraud_detector.joblib")
    for batch in iterator:
        yield pd.Series(model.predict(batch))

df = raw_df.withColumn("tax", calculate_tax_vectorized("price", "tax_rate"))
```

### 3. Production Configuration Tuning:
```properties
# Enable Arrow execution in PySpark
spark.sql.execution.arrow.pyspark.enabled=true
# Controls memory batch size sent to Python worker (prevents worker OOM)
spark.sql.execution.arrow.maxRecordsPerBatch=10000
```
- **Rule of Thumb**: Always prefer native Spark SQL functions (`when`, `expr`) first. If custom Python libraries are mandatory, use Pandas UDFs."""
        },

        "spark_pyspark-medium-16": {
            "question": "Architect a fault-tolerant Spark Structured Streaming pipeline reading from Kafka and writing to a data lakehouse?",
            "answer": """Designing an enterprise, end-to-end exactly-once streaming pipeline from Apache Kafka to an ACID Lakehouse (Delta Lake) requires robust checkpointing, offset tracking, and state management:

### 1. Architecture Flow:
`Kafka Brokers -> Micro-Batch Consumer -> Schema Enforcement -> RocksDB State Store -> Delta Lake ACID Sink`

### 2. Production Pipeline Code:
```python
from pyspark.sql.functions import from_json, col
from pyspark.sql.types import StructType, StringType, DoubleType, TimestampType

event_schema = StructType() \\
    .add("event_id", StringType()) \\
    .add("user_id", StringType()) \\
    .add("amount", DoubleType()) \\
    .add("event_time", TimestampType())

streaming_df = spark.readStream.format("kafka") \\
    .option("kafka.bootstrap.servers", "kafka-broker.prod:9092") \\
    .option("subscribe", "financial_events") \\
    .option("startingOffsets", "latest") \\
    .option("maxOffsetsPerTrigger", 100000) \\
    .option("failOnDataLoss", "false") \\
    .load() \\
    .select(from_json(col("value").cast("string"), event_schema).alias("data")) \\
    .select("data.*")

query = streaming_df.writeStream \\
    .format("delta") \\
    .outputMode("append") \\
    .option("checkpointLocation", "s3a://lakehouse-checkpoints/financial_events/") \\
    .trigger(processingTime="10 seconds") \\
    .start("s3a://lakehouse-gold/financial_events/")
```

### 3. Fault Tolerance & Exactly-Once Mechanics:
- **Deterministic Offsets**: Spark records Kafka source partition offsets in the durable WAL inside `checkpointLocation` *before* processing begins.
- **Idempotent ACID Commits**: Delta Lake checks the micro-batch ID recorded in the `_delta_log`. If an executor or driver crashes mid-batch, upon restart Spark re-reads the exact same Kafka offsets; Delta rejects duplicate commits, ensuring strict **exactly-once semantics**.
- **Backpressure Protection**: `maxOffsetsPerTrigger = 100000` prevents cluster saturation during producer traffic spikes."""
        },

        "spark_pyspark-medium-17": {
            "question": "How do you manage dynamic allocation and autoscaling of executors in a multi-tenant YARN or Kubernetes environment?",
            "answer": """Dynamic Allocation allows Spark applications to scale executor count dynamically based on workload queue pressure, freeing resources for other tenants when idle:

### 1. Core Mechanics:
- **Scale Out**: If tasks sit in the scheduler backlog queue longer than `schedulerBacklogTimeout` (default 1s), Spark requests additional executors incrementally.
- **Scale In**: If an executor has no active tasks for longer than `executorIdleTimeout` (default 60s), Spark decommissions and releases it.

### 2. Multi-Tenant Configuration:
```properties
spark.dynamicAllocation.enabled=true
spark.dynamicAllocation.minExecutors=2
spark.dynamicAllocation.maxExecutors=100
spark.dynamicAllocation.initialExecutors=4
spark.dynamicAllocation.executorIdleTimeout=60s
spark.dynamicAllocation.cachedExecutorIdleTimeout=300s
```

### 3. Shuffle File Preservation (The Critical Challenge):
When an executor is terminated during scale-in, its local scratch disks hold shuffle blocks needed by downstream stages. If those files vanish, the job fails with `MetadataFetchFailedException` / `ShuffleFetchFailedException`.
- **On YARN**: Deploy the **External Shuffle Service (ESS)** as a long-running daemon on every NodeManager:
```properties
spark.shuffle.service.enabled=true
```
- **On Kubernetes**: Running ESS is complex due to container boundaries. Spark 3.x+ uses **Shuffle Tracking**:
```properties
spark.dynamicAllocation.shuffleTracking.enabled=true
spark.dynamicAllocation.shuffleTracking.timeout=1800s
```
  Spark tracks which executors host active shuffle files and delays their decommissioning until those files are consumed or expired.

### 4. Quota Enforcement:
Pair dynamic allocation with YARN FairScheduler / CapacityScheduler queue resource limits or Kubernetes ResourceQuotas to prevent a single job from exhausting cluster capacity."""
        },

        "spark_pyspark-medium-18": {
            "question": "Design a strategy to optimize the shuffling phase during a complex aggregation across terabytes of data?",
            "answer": """Shuffling terabytes of data during high-cardinality aggregations creates massive network bandwidth saturation, disk I/O bottlenecks, and JVM garbage collection thrashing.

### Optimization Architecture:

1. **Map-Side Pre-Aggregation**:
   - Ensure Spark uses `HashAggregate` with map-side partial aggregation. Avoid RDD `groupByKey()` at all costs; use DataFrame SQL `GROUP BY` or `reduceByKey()`.
   - Spark aggregates values locally within each executor partition into an in-memory Tungsten hash map before data is serialized across the network, reducing shuffle write volume by up to 90%.

2. **Shuffle Buffer & I/O Pipeline Tuning**:
```properties
# Increase in-memory serialization buffer before spilling map outputs to disk
spark.shuffle.file.buffer=1m              # Default is 32k

# Increase read buffer for reducer fetching over the network
spark.reducer.maxSizeInFlight=128m        # Default is 48m

# Reduce connection timeouts under heavy network congestion
spark.core.connection.ack.wait.timeout=600s
spark.network.timeout=800s

# High-performance shuffle compression (ZSTD provides optimal balance of ratio & speed)
spark.io.compression.codec=zstd
spark.io.compression.zstd.level=3
```

3. **Fine-Grained Shuffle Partition Sizing**:
   - Prevent massive single partitions by calculating: `Partitions = Target_Shuffle_Data / 150MB`. For 3 TB: `3,000,000 MB / 150 MB = 20,000 partitions`.
   - Enable Adaptive Query Execution to automatically coalesce them if runtime data prunes:
```properties
spark.sql.adaptive.enabled=true
spark.sql.adaptive.coalescePartitions.enabled=true
```

4. **NVMe SSD Storage Tiering**: Mount executor shuffle scratch directories (`spark.local.dir`) on striped, high-IOPS local NVMe disks rather than network-attached block storage (e.g., EBS gp2)."""
        },

        "spark_pyspark-medium-19": {
            "question": "How do you implement data bucketing and z-ordering in PySpark to drastically improve read query performance?",
            "answer": """Bucketing and Z-Ordering are advanced physical data layout techniques designed to eliminate expensive shuffle exchanges and maximize metadata data-skipping:

### 1. Bucketing (Pre-shuffling for Join Optimization):
- **Mechanism**: Data is distributed into a fixed number of hash buckets based on primary join keys and pre-sorted within each bucket at write time.
- **System Benefit**: When two bucketed tables sharing the same key and bucket count (or multiples) are joined, Spark **completely skips the Shuffle and Sort stages**, converting an expensive Sort-Merge Join into a zero-shuffle local scan.
```python
# Writing a bucketed table
sales_df.write \\
    .bucketBy(64, "customer_id") \\
    .sortBy("transaction_date") \\
    .format("parquet") \\
    .saveAsTable("bucketed_sales")
```

### 2. Z-Ordering (Multidimensional Data Skipping in Lakehouse):
- **Mechanism**: Organizes multidimensional data along a Space-Filling Peano Curve (Z-curve). Unlike hierarchical partitioning (which suffers combinatorial explosion and small-file syndrome when partitioning across multiple keys), Z-Ordering maps multi-column values into 1D space, preserving locality across all indexed columns equally.
```python
# Delta Lake Z-Ordering execution
spark.sql('OPTIMIZE delta.`s3a://lakehouse/gold_events` ZORDER BY (customer_id, event_type, event_date)')
```

### 3. Production Selection Matrix:
- Use **Bucketing** when two massive tables are repeatedly joined on identical high-cardinality keys.
- Use **Z-Ordering** for analytical datasets queried with arbitrary filter combinations across 2-4 high-cardinality columns."""
        },

        "spark_pyspark-medium-20": {
            "question": "Architect a testing framework for PySpark jobs that seamlessly mocks massive datasets?",
            "answer": """An enterprise PySpark testing framework must execute fast, deterministic unit and integration tests without relying on slow, live cloud storage or heavy external cluster infrastructure:

### 1. Framework Architecture:
- **Test Runner**: `pytest` orchestrating session-scoped Spark instances.
- **Execution Mode**: `local[2]` SparkSession running in-memory with minimized shuffle partitions.
- **Assertion Engine**: `pyspark.testing.assertDataFrameEqual` (Spark 3.5+) or `chispa` for schema-aware, floating-point tolerant DataFrame comparisons.
- **Synthetic Data Generation**: `dbldatagen` (Databricks Labs Data Generator) or `Faker` to generate distributed schemas with billions of mock rows on-the-fly.

### 2. Implementation:
```python
# conftest.py - Shared Local Spark Fixture
import pytest
from pyspark.sql import SparkSession

@pytest.fixture(scope="session")
def spark():
    session = SparkSession.builder \\
        .master("local[2]") \\
        .appName("pyspark-unit-tests") \\
        .config("spark.sql.shuffle.partitions", "2") \\
        .config("spark.ui.enabled", "false") \\
        .config("spark.driver.bindAddress", "127.0.0.1") \\
        .getOrCreate()
    yield session
    session.stop()

# test_etl_pipeline.py
from pyspark.testing import assertDataFrameEqual
from my_transforms import clean_sales_pipeline

def test_clean_sales_pipeline(spark):
    input_data = [("TX100", 150.0, "COMPLETED"), ("TX101", -20.0, "FAILED")]
    schema = "txn_id string, amount double, status string"
    input_df = spark.createDataFrame(input_data, schema)
    
    result_df = clean_sales_pipeline(input_df)
    
    expected_data = [("TX100", 150.0, "COMPLETED")]
    expected_df = spark.createDataFrame(expected_data, schema)
    
    assertDataFrameEqual(result_df, expected_df, checkRowOrder=False)
```

### 3. Mocking Petabyte Datasets:
Do not load raw CSV/Parquet files into Git. Use deterministic synthetic generators (`dbldatagen`) that generate rule-based data distributions (skew, null percentages, correlations) directly into RDDs in-memory, mocking scale-dependent edge cases in isolated CI Docker containers."""
        },

        "spark_pyspark-hard-21": {
            "question": "Architect a unified batch and streaming architecture using Spark Structured Streaming that handles late-arriving data and complex stateful aggregations at petabyte scale?",
            "answer": """Building a unified petabyte-scale lakehouse engine eliminating the Lambda architecture requires Spark Structured Streaming with Delta Lake, robust watermarking, and an off-heap state store:

### 1. End-to-End Architectural Blueprint:
`Event Streams -> Bronze Ingestion (Raw) -> Silver Cleaning & Stateful Aggregation -> Gold Curated Marts`

### 2. Handling Late-Arriving Data with Watermarking:
- Watermarking tracks event-time progression across incoming micro-batches:
  `Watermark = max(eventTime) - allowedLateness`
- Late-arriving events older than the watermark are dropped, bounding state memory growth while correctly updating rolling metrics for delayed events:
```python
streaming_agg = raw_stream \\
    .withWatermark("event_timestamp", "2 hours") \\
    .groupBy(
        window("event_timestamp", "1 hour", "15 minutes"),
        col("merchant_id")
    ).agg(
        sum("transaction_amount").alias("hourly_volume"),
        count("transaction_id").alias("tx_count")
    )
```

### 3. Scaling Stateful Storage at Petabyte Scale (RocksDB Provider):
- The default HDFS-backed in-memory state store keeps state in the executor JVM heap, triggering massive GC thrashing and fatal OOMs when tracking millions of active keys.
- **Solution**: Configure the **RocksDB State Store Provider**:
```properties
spark.sql.streaming.stateStore.providerClass=org.apache.spark.sql.execution.streaming.state.RocksDBStateStoreProvider
spark.sql.streaming.stateStore.rocksdb.compactOnCommit=true
spark.sql.streaming.stateStore.rocksdb.maxWriteBufferNumber=4
```
  RocksDB stores state off-heap on fast local NVMe SSDs, flushing background snapshot SST files asynchronously to cloud storage (S3/ADLS), supporting state sizes exceeding terabytes per worker.

### 4. Unified Batch & Streaming Serving:
Downstream batch jobs read the identical Delta Lake Silver/Gold tables using snapshot isolation (`spark.read.format("delta").load(...)`), guaranteeing identical business logic across streaming and batch analytics."""
        },

        "spark_pyspark-hard-22": {
            "question": "How do you design a highly customized partitioner to distribute complex, nested JSON workloads that inherent default hash partitioning fails to balance?",
            "answer": """Default hash partitioning (`murmur3(key) % num_partitions`) fails on complex, nested JSON payloads when entity keys exhibit heavy power-law distributions or when nested payloads vary from 1 KB to 10 MB, creating massive memory stragglers.

### 1. Custom Partitioning Architecture:
To balance compute complexity and memory rather than raw row counts, engineer a **Cost-Weighted Composite Partitioner**:

1. **Payload Complexity & Weight Extraction**:
   - Quantify JSON structural complexity using native Catalyst functions: evaluate payload byte length and nested array sizes to calculate a **Task Weight Score**:
```python
from pyspark.sql.functions import length, size, col, hash, pmod, concat, lit, when

weighted_df = raw_json_df.withColumn(
    "payload_bytes", length(col("raw_json_str"))
).withColumn(
    "array_depth", size(col("nested_line_items"))
).withColumn(
    # Compute weight composite score
    "cost_weight", col("payload_bytes") + (col("array_depth") * 1024)
)
```

2. **Bin-Packing Partition Assignment**:
   - For heavily skewed keys (e.g., enterprise tenant vs individual users), combine the domain key with a dynamic salt calculated from the item's cost weight, routing heavy payloads across dedicated sub-partitions:
```python
NUM_PARTITIONS = 400

# High-cost records get dynamic salting across 16 sub-bins; low-cost get direct hash
balanced_df = weighted_df.withColumn(
    "partition_key",
    when(col("cost_weight") > 500000, 
         concat(col("tenant_id"), lit("_"), pmod(hash(col("event_id")), lit(16))))
    .otherwise(col("tenant_id"))
)

# Repartition using the calculated uniform distribution key
partitioned_df = balanced_df.repartition(NUM_PARTITIONS, "partition_key")
```

3. **Low-Level Custom RDD Partitioner (Scala Fallback)**:
   - In Scala, implement `org.apache.spark.Partitioner` with custom `getPartition(key: Any): Int` utilizing an empirical range quantile map derived from sampling, ensuring that total byte weight per partition has a variance of < 5% across all executors."""
        },

        "spark_pyspark-hard-23": {
            "question": "Design a memory management system for an extreme-scale Spark job where spilling to disk completely breaks tight SLAs?",
            "answer": """In ultra-low-latency SLA pipelines, disk spilling degrades performance by 10x-50x due to serialization, NVMe I/O context switching, and sort-merging. Achieving **Zero Disk Spill** requires an end-to-end memory engineering strategy:

### 1. High Memory-to-Core Executor Topology:
- Avoid CPU-dense nodes (e.g., 16 cores with 32 GB RAM). Deploy memory-optimized instances (e.g., AWS `r6i.4xlarge` or `r5d.4xlarge` with 16 vCPUs and 128 GB RAM).
- Allocate **4 to 5 cores per executor** to maximize HDFS/S3 I/O concurrency while preventing JVM GC bottlenecks:
  - Total Executors: 3 per node (each with 5 cores, 40 GB heap, 4 GB overhead).
  - Memory per core ratio: **~8 GB per core**, guaranteeing ample room for in-flight hash tables.

### 2. Off-Heap Tungsten Configuration:
- Move execution memory buffers outside the JVM heap to eliminate garbage collection pauses and avoid heap fragmentation:
```properties
spark.memory.offHeap.enabled=true
spark.memory.offHeap.size=16g
spark.executor.memory=24g
spark.executor.memoryOverhead=6g
```

### 3. Hyper-Partitioning to Bound Buffer Sizes:
- Disk spill occurs when an individual task's hash/sort aggregation buffer exceeds the task memory fraction (`UnifiedMemory / ActiveTasks`).
- Enforce strict partition sizing so that no individual partition exceeds **40 MB in memory**:
```properties
# Dynamically scale shuffle partitions to enforce 40MB boundaries
spark.sql.shuffle.partitions=10000
spark.sql.adaptive.enabled=true
spark.sql.adaptive.advisoryPartitionSizeInBytes=41943040   # 40 MB target
```

### 4. Algorithmic Guardrails:
- Replace Sort-Merge Joins with Broadcast Hash Joins where possible (`spark.sql.autoBroadcastJoinThreshold=104857600`).
- Ensure pre-aggregation uses `reduceByKey` / `HashAggregate` to collapse rows in memory before shuffle stages."""
        },

        "spark_pyspark-hard-24": {
            "question": "Architect a multi-cluster Spark environment on Kubernetes utilizing custom scheduling to prioritize critical workloads over ad-hoc data science queries?",
            "answer": """Running multi-tenant Spark workloads on Kubernetes requires replacing the default `kube-scheduler` with a multi-tenant batch scheduler like **Apache YuniKorn** or **Volcano**:

### 1. Architectural Scheduling Blueprint:
- **Scheduler**: Deploy Apache YuniKorn (`schedulerName: yunikorn`) for application-aware queuing, hierarchical resource quotas, and dynamic preemption.
- **Node Pool Segregation**:
  - `Pool-Prod-Critical`: Dedicated On-Demand compute instances with strict taints and tolerations (`workload=critical:NoSchedule`).
  - `Pool-Analytics-Adhoc`: Ephemeral Spot/Preemptible node pools allowing autoscaling to zero.

### 2. Hierarchical Queue Configuration (`yunikorn-configs.yaml`):
```yaml
queues:
  - name: root
    queues:
      - name: production
        guaranteed: { memory: 500Gi, vcore: 100 }
        max: { memory: 2000Gi, vcore: 400 }
        properties:
          preemption.policy: fence
      - name: adhoc_analytics
        guaranteed: { memory: 50Gi, vcore: 10 }
        max: { memory: 800Gi, vcore: 160 }
        properties:
          preemption.delay: 30s
```

### 3. Spark Pod Template Configuration:
- Critical pipelines submit with production priority classes and gang scheduling annotations:
```properties
# YuniKorn gang scheduling: Driver waits until all executors are schedulable
spark.kubernetes.driver.annotation.yunikorn.apache.org/task-group-name=prod-pipeline
spark.kubernetes.driver.annotation.yunikorn.apache.org/schedulingPolicy=gang
spark.kubernetes.driver.label.queue=root.production
spark.kubernetes.driver.nodeSelector.workload=critical
spark.kubernetes.executor.nodeSelector.workload=critical

# High K8s PriorityClass
spark.kubernetes.driver.pod.priorityClassName=production-critical
```

### 4. Dynamic Preemption Mechanics:
When an ad-hoc query consumes cluster capacity and a production SLA pipeline arrives, YuniKorn identifies the resource deficit, sends graceful termination signals (`SIGTERM`) to ad-hoc Spark executors, and reallocates pods to the critical application within seconds."""
        },

        "spark_pyspark-hard-25": {
            "question": "How do you engineer a custom Spark catalyst optimizer rule to push down proprietary database operations not natively supported by Spark?",
            "answer": """Spark's Catalyst Optimizer compiles high-level queries into physical RDD execution plans through four phases: Analysis, Logical Optimization, Physical Planning, and Code Generation. Injecting proprietary pushdown requires a custom optimizer extension:

### 1. Architecture: Injecting into Catalyst:
Implement a custom rule extending `Rule[LogicalPlan]` in Scala and register it using `SparkSessionExtensions`:
```scala
package org.apache.spark.sql.custom

import org.apache.spark.sql.SparkSessionExtensions
import org.apache.spark.sql.catalyst.plans.logical._
import org.apache.spark.sql.catalyst.rules.Rule

class ProprietaryPushdownRule extends Rule[LogicalPlan] {
  override def apply(plan: LogicalPlan): LogicalPlan = plan.transformUp {
    // Pattern match: Filter placed above a proprietary DataSourceV2 scan relation
    case Filter(condition, scan @ DataSourceV2ScanRelation(relation, _, _)) =>
      val (pushableFilters, nonPushableFilters) = extractSupportedPredicates(condition)
      if (pushableFilters.nonEmpty) {
        val newScan = relation.pushDownProprietaryFilters(pushableFilters)
        if (nonPushableFilters.isEmpty) newScan
        else Filter(nonPushableFilters.reduce(And), newScan)
      } else {
        scan
      }
  }
}

// Registration Hook
class CustomExtensions extends (SparkSessionExtensions => Unit) {
  override def apply(extensions: SparkSessionExtensions): Unit = {
    extensions.injectOptimizerRule(session => new ProprietaryPushdownRule())
  }
}
```

### 2. Session Configuration:
Register the extension at driver launch:
```properties
spark.sql.extensions=org.apache.spark.sql.custom.CustomExtensions
```

### 3. DataSource V2 Integration:
Implement `SupportsPushDownFilters` and `SupportsPushDownAggregates` on the custom `ScanBuilder`. When Catalyst applies the rule, the scan builder translates Spark expressions (e.g., `EqualTo`, `GreaterThan`) into proprietary binary query strings sent directly over the database wire protocol, returning only filtered columnar byte streams."""
        },

        "spark_pyspark-hard-26": {
            "question": "Design a highly resilient PySpark architecture capable of surviving the preemptive termination of 50% of its spot instance executors mid-shuffle?",
            "answer": """In cloud environments, relying on Spot/Preemptible instances yields up to 70% cost savings, but a sudden 50% node termination mid-shuffle triggers `ShuffleFetchFailedException`, invalidating upstream stages and causing catastrophic cascading job failure.

### 1. Decoupled Shuffle Architecture (Remote Shuffle Service):
- **Mechanism**: The fundamental vulnerability of standard Spark is co-locating shuffle data on transient compute worker local disks.
- **Solution**: Deploy a **Remote Shuffle Service (RSS)** like **Apache Celeborn** or **Apache Uniffle**:
```properties
spark.shuffle.manager=org.apache.spark.shuffle.celeborn.SparkShuffleManager
spark.celeborn.master.endpoints=celeborn-master-1:9097,celeborn-master-2:9097
```
- During the shuffle phase, executors push shuffle blocks directly over the network to dedicated, highly available, persistent Celeborn storage nodes. If 50% of compute spot executors vanish, **zero shuffle data is lost**; replacement executors simply fetch shuffle files from Celeborn without recomputing upstream stages.

### 2. Graceful Decommissioning & Block Migration:
- When a cloud provider issues a Spot Interruption Notice (e.g., AWS EC2 2-minute warning via EventBridge metadata):
```properties
spark.decommission.enabled=true
spark.storage.decommission.enabled=true
spark.storage.decommission.shuffleBlocks.maxReplication=2
spark.storage.decommission.rddBlocks.enabled=true
```
- The Spark Driver intercepts the interruption hook, immediately stops scheduling new tasks on the terminated node, and actively streams local shuffle files to surviving peer executors before instance termination.

### 3. Master / Driver Protection:
Always pin the Spark Driver to an **On-Demand instance** using node selectors, preventing driver termination while allowing all executors to safely run on spot nodes."""
        },

        "spark_pyspark-hard-27": {
            "question": "How do you optimize a complex graph processing algorithm using GraphX or DataFrames on a massive, highly connected dataset?",
            "answer": """Processing massive graphs (e.g., billions of edges, millions of vertices) using GraphX or GraphFrames suffers from exponential lineage graph growth, driver JVM stack overflow, and extreme data skew caused by high-degree "super-nodes" (hub vertices):

### 1. Truncating Catalyst Execution Lineage:
- Iterative graph algorithms (PageRank, Connected Components, Label Propagation) append transformation layers to the execution DAG at every superstep. By iteration 20, the Catalyst optimizer tree contains thousands of nodes, crashing the driver with `StackOverflowError`.
- **Solution**: Break the lineage graph periodically using **Periodic Checkpointing**:
```python
spark.sparkContext.setCheckpointDir("s3a://lakehouse-checkpoints/graph/")

# GraphFrames checkpointing every 5 iterations
graph.setCheckpointInterval(5)
result = graph.connectedComponents()
```
  Checkpointing writes RDD/DataFrame state to durable distributed storage and severs the memory lineage reference, resetting Catalyst execution planning.

### 2. Mitigating Super-Node Skew via Vertex Cut Partitioning:
- In natural graphs, 0.1% of vertices hold 90% of connections. In an Edge Cut strategy, routing all edges of a celebrity node to one executor crashes worker memory.
- Use **Vertex Cut (Edge-Partitioning)**: Partition edges uniformly across workers using `EdgePartition2D`. Vertices are replicated across multiple partitions only when their connecting edges reside there, distributing message passing load across multiple cores.

### 3. Pregel Combiners & Vectorization:
- In custom message-passing routines, always implement a `mergeMsg` combiner function. This aggregates messages locally on the map-side before shuffling messages across the network to destination vertices, reducing cross-node network transmission by orders of magnitude."""
        },

        "spark_pyspark-hard-28": {
            "question": "Architect a zero-copy data sharing mechanism between external non-JVM machine learning systems and the Spark executor memory pool?",
            "answer": """Transferring data from Spark (JVM-based) to deep learning runtimes like PyTorch, TensorFlow, or Triton (C++/CUDA-based) typically incurs catastrophic serialization penalties when converting JVM rows into Python objects over IPC sockets.

### 1. Architectural Blueprint: Apache Arrow Shared Memory (`/dev/shm`):
Bypass network and socket serialization by organizing Spark worker data into **Apache Arrow RecordBatches** allocated directly within Linux POSIX Shared Memory (`/dev/shm`) or off-heap RAM, accessible to non-JVM runtimes via zero-copy memory pointers.

### 2. Implementation with PySpark `mapInArrow`:
```python
import pyarrow as pa
from pyspark.sql.functions import col

def run_c_model_inference(batch_iterator):
    import torch
    # Direct zero-copy Arrow memory bridge to PyTorch Tensor
    for arrow_record_batch in batch_iterator:
        # Access contiguous memory buffers without copying
        pyarrow_table = pa.Table.from_batches([arrow_record_batch])
        tensor_data = torch.from_dlpack(pyarrow_table.column("features"))
        
        # GPU execution in external C++ runtime
        predictions = model_forward_pass(tensor_data)
        yield pa.RecordBatch.from_arrays(
            [pa.array(predictions.cpu().numpy())], 
            names=["prediction"]
        )

# Spark partition pipeline
scored_df = df.mapInArrow(run_c_model_inference, schema="prediction double")
```

### 3. Technical Safeguards:
- Mount a high-capacity RAM disk: Ensure `/dev/shm` in Docker/Kubernetes container specs is sized appropriately (`emptyDir: medium: Memory`, sized to at least 50% of executor RAM).
- Utilize the **Arrow C Data Interface**: Allows native C/C++ runtimes to share Arrow metadata and data arrays across language boundaries via standard C structs (`ArrowArray`, `ArrowSchema`) without any IPC or serialization overhead."""
        },

        "spark_pyspark-hard-29": {
            "question": "How would you design a real-time data validation and quarantine pipeline embedded natively within an ultra-high-throughput Spark Structured Streaming application?",
            "answer": """In mission-critical streaming, bad records (schema corruption, missing business keys, invalid payloads) must be quarantined instantly into a Dead-Letter Queue (DLQ) without breaking pipeline SLAs or performing duplicate reads of the incoming stream:

### 1. Dual-Branch In-Line Validation Architecture:
Avoid multi-pass reads (`filter` clean -> write, then `filter` dirty -> write), which consumes double Kafka bandwidth. Instead, perform single-pass declarative evaluation and write atomically using `foreachBatch`:

### 2. Implementation:
```python
from pyspark.sql.functions import col, when, array, lit, struct, to_json

def evaluate_and_route(micro_batch_df, batch_id):
    if micro_batch_df.isEmpty():
        return
        
    # Single-pass inline rule validation
    validated_df = micro_batch_df.withColumn(
        "validation_errors",
        array([
            when(col("account_id").isNull(), lit("ERR_NULL_ACCOUNT")),
            when(col("transaction_amount") <= 0, lit("ERR_INVALID_AMOUNT")),
            when(col("event_timestamp").isNull(), lit("ERR_MISSING_TIMESTAMP"))
        ])
    ).withColumn(
        "is_valid", 
        col("validation_errors")[0].isNull() & 
        col("validation_errors")[1].isNull() & 
        col("validation_errors")[2].isNull()
    )
    
    # 1. Clean records -> Gold Table
    clean_df = validated_df.filter(col("is_valid") == True).drop("validation_errors", "is_valid")
    clean_df.write.format("delta").mode("append").save("s3a://lakehouse/gold_transactions")
    
    # 2. Corrupt records -> Quarantine DLQ Table
    quarantine_df = validated_df.filter(col("is_valid") == False) \\
        .withColumn("ingestion_batch_id", lit(batch_id))
    quarantine_df.write.format("delta").mode("append").save("s3a://lakehouse/quarantine_dlq")

# Streaming Trigger
streaming_query = raw_stream.writeStream \\
    .foreachBatch(evaluate_and_route) \\
    .option("checkpointLocation", "s3a://lakehouse/checkpoints/tx_validator/") \\
    .start()
```

### 3. Production Operational Safeguards:
- Persist DLQ payloads with full error diagnostics and raw strings to allow automated reprocessing via a replay job once schema contracts are restored."""
        },

        "spark_pyspark-hard-30": {
            "question": "Design an automated, machine-learning-driven Spark configuration tuning engine that dynamically adjusts executor cores, memory, and shuffle partitions per job based on historical runs?",
            "answer": """Static Spark configurations are notoriously inefficient: developers routinely over-provision resources by 300% to avoid OOMs or under-provision, resulting in SLA breaches. An automated ML-driven tuning engine optimizes parameters continuously:

### 1. System Architecture:
`Spark Event Log Listener -> Prometheus/REST Ingestion -> Feature Store -> Bayesian Optimization / Surrogate Model -> Configuration Actuator`

### 2. Feature Extraction & Telemetry Engine:
- Parse Spark History Server JSON REST API (`/api/v1/applications/{app_id}/stages`) post-run.
- Extract workload telemetry vectors:
  - Input Data Bytes, Record Count, File Count.
  - Shuffle Read/Write Volume, Disk Spill Bytes, Memory Spill Bytes.
  - Task Duration Skew Ratio (`Max Task Time / Median Task Time`).
  - JVM GC Time Percentage (`Task GC Time / Total CPU Time`).

### 3. Optimization Algorithm (Constrained Bayesian Optimization):
- **Decision Variables ($X$)**:
  - `spark.executor.cores` $\\in [2, 6]$
  - `spark.executor.memory` $\\in [8\\text{GB}, 64\\text{GB}]$
  - `spark.sql.shuffle.partitions` $\\in [50, 10000]$
  - `spark.memory.fraction` $\\in [0.4, 0.85]$
- **Objective Function**: Minimize Total Cluster Dollar Cost while strictly satisfying the SLA deadline:
  $$\\min \\text{Cost}(X) = \\text{Executors} \\times \\text{Cores} \\times \\text{Memory} \\times \\text{Runtime}(X)$$
  $$\\text{Subject to: } \\text{Runtime}(X) \\le \\text{SLA}_{\\text{target}}$$
- Train a Gaussian Process Regressor or LightGBM model acting as a surrogate function predicting `Runtime` and `SpillProbability` from candidate parameters.

### 4. Closed-Loop Actuator:
Before Airflow launches a pipeline's `spark-submit`, a pre-execution hook queries the tuning engine API passing the scheduled dataset size. The engine outputs the optimal parameter payload dynamically, guaranteeing continuous cost-performance optimization without human intervention."""
        }
    }
