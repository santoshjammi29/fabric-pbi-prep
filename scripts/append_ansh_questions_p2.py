#!/usr/bin/env python3
"""
Append 31 Apache Spark, PySpark Coding & Scenario questions from Ansh Lamba's Masterclass
to src/data/json/questions.json.
"""

import json
import os

FILE_PATH = os.path.join(os.path.dirname(__file__), '../src/data/json/questions.json')

new_questions = [
  {
    "id": "q-ansh-spark-01",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Spark Core Architecture",
    "difficulty": "EASY",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "Why is Apache Spark up to 100x faster than Hadoop MapReduce? Explain the architectural differences.",
    "answer": """### Phase 1: Conceptual Foundation
Hadoop MapReduce is a 2-stage execution paradigm (Map followed by Reduce). In MapReduce, every single map output is materialized to local disk, sorted, and written to disk before being transferred over the network to reducers. The reducer output is then replicated 3x and written back to HDFS disk. Iterative algorithms (e.g. Machine Learning, multi-step joins) spend 90% of their runtime waiting on disk I/O.
Apache Spark achieves up to 100x faster performance through:
1. **In-Memory DAG Execution**: Intermediate results are kept in executor JVM memory across multiple transformation stages without materializing to disk.
2. **Directed Acyclic Graph (DAG) Scheduler**: Pipelines multiple transformations into single stages, eliminating artificial map/reduce phase barriers.
3. **Multi-Threaded Execution**: Spark runs tasks in lightweight threads within a long-lived JVM executor process, unlike MapReduce which spawns heavyweight JVM processes for every task.

### Phase 2: Comparison Matrix
| Architectural Feature | Apache Spark | Hadoop MapReduce |
|---|---|---|
| **Storage Medium** | In-Memory (RAM) with disk spill fallback | Disk-bound (HDFS) at every phase |
| **Task Model** | Multi-threaded tasks inside long-lived JVMs | Heavyweight separate JVM process per task |
| **Execution Plan** | Multi-stage DAG pipelining via Catalyst | Rigid 2-stage (Map -> Reduce) cycles |
| **Iterative Computations** | Reuses cached RDD/DataFrames in memory | Repeated disk reads and writes per iteration |

### Phase 3: Production Gotchas & Remediation
- **The 'Infinite RAM' Myth**: Spark is only faster in-memory if memory is available. If memory is undersized and shuffles constantly spill to disk (`Spill (Disk)` in UI), Spark's performance advantage degrades toward MapReduce speeds."""
  },
  {
    "id": "q-ansh-spark-02",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Spark Session & Context",
    "difficulty": "EASY",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "What is the architectural difference between SparkContext and SparkSession? Why was SparkSession introduced in Spark 2.0?",
    "answer": """### Phase 1: Conceptual Foundation
Prior to Apache Spark 2.0, developers had to instantiate and manage separate contexts for different Spark modules:
- `SparkContext`: Entry point for core Spark functionality (creating RDDs, broadcast variables, accumulators).
- `SQLContext`: Entry point for Spark SQL and DataFrames.
- `HiveContext`: Entry point for querying Hive metastores and using HiveQL.
- `StreamingContext`: Entry point for DStreams legacy streaming.
Managing multiple disparate contexts created configuration confusion and state fragmentation.

### Phase 2: The Unified SparkSession
Introduced in Spark 2.0, **SparkSession** provides a single unified entry point that encapsulates all underlying contexts while supporting multi-tenant sessions:
```python
from pyspark.sql import SparkSession

spark = SparkSession.builder \\
    .appName("ProductionPipeline") \\
    .enableHiveSupport() \\
    .getOrCreate()

# Access underlying contexts directly through SparkSession
sc = spark.sparkContext
```
- **Isolated User Sessions**: Multiple users can share the same underlying `SparkContext` (cluster connections and executors) while maintaining distinct `SparkSession` instances with isolated temporary tables, SQL configurations, and catalog views (`spark.newSession()`).

### Phase 3: Production Gotchas & Remediation
- **Multiple SparkContext Crash**: You can only have **one active `SparkContext` per JVM**. Attempting to run `SparkContext()` directly when one already exists throws an exception. Always obtain context via `SparkSession.builder.getOrCreate().sparkContext`."""
  },
  {
    "id": "q-ansh-spark-03",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Data Abstractions Comparison",
    "difficulty": "MEDIUM",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "Compare RDDs, DataFrames, and Datasets in Apache Spark. Explain why DataFrames outperform RDDs in PySpark.",
    "answer": """### Phase 1: Conceptual Foundation
Spark provides three core data abstractions:
1. **RDD (Resilient Distributed Dataset)**: Low-level distributed collection of Java/Python objects. Provides strong functional programming APIs (`map`, `filter`, `flatMap`), but Spark treats the contents as opaque black-box objects with zero schema awareness.
2. **DataFrame**: Distributed collection of data organized into named columns (conceptual equivalent of a relational table). Powered by schemas and the Catalyst Optimizer.
3. **Dataset (Scala/Java only)**: Strongly typed interface combining the benefits of RDDs (compile-time type safety) with Catalyst optimizations. Not available in Python due to Python's dynamic typing.

### Phase 2: Why DataFrames Outperform RDDs in PySpark
In PySpark, RDD operations require serializing data between the JVM executor process and a secondary Python worker process using Py4J and `pickle`—incurring massive serialization and IPC overhead.
**DataFrames eliminate this overhead**:
- DataFrames store data in off-heap columnar binary memory using the **Tungsten** format.
- Operations are expressed as high-level SQL/relational expressions compiled directly into native JVM Java bytecode by Catalyst.
- Python never touches individual rows during execution; Python code merely constructs the logical execution plan, achieving Scala-parity performance.

### Phase 3: Production Gotchas & Remediation
- **The RDD Escape Hatch**: Never drop down to RDDs (`df.rdd.map(...)`) in PySpark unless strictly necessary. Doing so immediately forces JVM-to-Python row serialization, slowing down pipelines by 5x to 10x."""
  },
  {
    "id": "q-ansh-spark-04",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Transformations & Stages",
    "difficulty": "MEDIUM",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "Explain the difference between Narrow and Wide Transformations in Spark. Why do wide transformations create stage boundaries?",
    "answer": """### Phase 1: Conceptual Foundation
Transformations in Spark lazily build execution plans and are split into two fundamental categories:
- **Narrow Transformation**: Each partition of the parent RDD/DataFrame is used by at most one partition of the child DataFrame. The operation is processed entirely within a single executor core locally without transferring data over the network (No Shuffle). Examples: `select()`, `filter()`, `withColumn()`, `drop()`.
- **Wide Transformation**: Multiple child partitions depend on data distributed across multiple parent partitions. Data with the same key must be redistributed across all cluster nodes over the physical network (Shuffle). Examples: `groupBy()`, `join()`, `distinct()`, `orderBy()`.

### Phase 2: Stage Boundaries & The Shuffle Bottleneck
- Spark's DAG scheduler breaks a job down into **Stages** based on shuffle boundaries.
- Narrow transformations are pipelined together into a single Stage (running concurrently across tasks in memory).
- A Wide transformation forces a **Stage Boundary**: Stage 1 must finish processing, serialize data, and write shuffle files to local disk. The network shuffle layer transfers the data across nodes, and Stage 2 begins only after shuffle files are fetched.

### Phase 3: Production Gotchas & Remediation
- **Minimizing Shuffle Operations**: Every wide transformation incurs disk I/O, network bandwidth consumption, and serialization costs. Chain filters and projections before joins and groupBys to minimize the number of rows shuffled across the network."""
  },
  {
    "id": "q-ansh-spark-05",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Lazy Evaluation & Execution Plan",
    "difficulty": "EASY",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "What is Lazy Evaluation in Apache Spark, and how does it enable Catalyst query optimization?",
    "answer": """### Phase 1: Conceptual Foundation
In Spark, operations are divided into:
- **Transformations** (`filter`, `select`, `join`, `groupBy`): Do NOT execute immediately. Instead, they record user intent by appending operations to a logical lineage graph (DAG).
- **Actions** (`count`, `collect`, `show`, `write`, `take`): Trigger the execution of the entire computation pipeline.
**Lazy Evaluation** means Spark waits until an Action is invoked before executing any computations.

### Phase 2: Why Lazy Evaluation Enables Optimization
If Spark executed eagerly (like Pandas), running `df.filter(...)` would immediately read the entire multi-terabyte dataset into memory, followed by another full pass for the next operation.
Because execution is deferred:
1. **Predicate Pushdown**: Catalyst inspects the entire query plan and pushes filters down to the cloud storage layer (`Parquet / Delta`), reading only relevant row groups.
2. **Column Projection Pruning**: Catalyst drops unselected columns at read time, reducing memory and I/O.
3. **Operation Merging**: Multiple sequential maps and filters are fused into a single vectorized loop.

### Phase 3: Production Gotchas & Remediation
- **Debugging Pitfall**: When writing PySpark code, an error in transformation syntax may not throw an exception on the transformation line. The error only surfaces when an Action (`df.count()` or `df.write`) is triggered."""
  },
  {
    "id": "q-ansh-spark-06",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Distributed Join Optimization",
    "difficulty": "MEDIUM",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "How does Broadcast Hash Join (BHJ) work under the hood? What happens if a broadcasted DataFrame exceeds driver memory?",
    "answer": """### Phase 1: Conceptual Foundation
Joining two large distributed DataFrames typically requires a **Sort-Merge Join (SMJ)**: both datasets must be hashed, shuffled across the network, and sorted on disk by join key.
In a **Broadcast Hash Join (BHJ)**:
1. The Driver collects the smaller relation into memory.
2. The Driver builds an in-memory hash table of the small relation and broadcasts it to all executor worker nodes via BitTorrent-style peer-to-peer distribution.
3. Each executor streams its local partition of the large relation and probes the in-memory hash table.
**Zero network shuffle occurs for the large table**, speeding up joins by 10x to 50x.

### Phase 2: Thresholds & Manual Broadcast
- Spark automatically triggers BHJ if the relation size is under `spark.sql.autoBroadcastJoinThreshold` (default **10 MB** / `10485760` bytes).
- You can manually force a broadcast join using `broadcast()`:
```python
from pyspark.sql.functions import broadcast

df_joined = df_large_sales.join(
    broadcast(df_small_dim_stores),
    on="store_id",
    how="inner"
)
```

### Phase 3: Production Gotchas & Remediation
- **Driver OutOfMemory (OOM) Crash**: When you call `broadcast(df)`, Spark collects the *entire* DataFrame onto the **Driver node** before distributing it. If the table is 4 GB and your Driver has 2 GB of RAM, the Driver will instantly crash with `java.lang.OutOfMemoryError`.
  *Rule of thumb*: Never broadcast a table larger than 1–2 GB, and ensure Driver memory is at least 3x the broadcasted table size."""
  },
  {
    "id": "q-ansh-spark-07",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Slowly Changing Dimensions (SCD)",
    "difficulty": "HARD",
    "domain": "Data Lakehouse & Architecture",
    "subdomain": "Delta Lake & Lakehouse Storage",
    "question": "How do you implement Slowly Changing Dimension (SCD Type 1 and Type 2) pipelines in PySpark using Delta Lake 'MERGE INTO'?",
    "answer": """### Phase 1: Conceptual Foundation
Slowly Changing Dimensions handle dimensional attribute drift over time:
- **SCD Type 1 (Overwrite)**: Overwrites current attributes with incoming updates. No historical records are retained.
- **SCD Type 2 (Historical Tracking)**: Retains full history by marking existing records as inactive (`is_current = false`, `end_date = current_timestamp`) and inserting the incoming record as active (`is_current = true`, `end_date = null`).

### Phase 2: PySpark Delta Implementation
#### SCD Type 1 Implementation:
```python
from delta.tables import DeltaTable

target_dim = DeltaTable.forName(spark, "dim_customer")

target_dim.alias("t").merge(
    source=df_updates.alias("s"),
    condition="t.customer_id = s.customer_id"
).whenMatchedUpdate(set={
    "name": "s.name",
    "city": "s.city",
    "updated_at": "current_timestamp()"
}).whenNotMatchedInsert(values={
    "customer_id": "s.customer_id",
    "name": "s.name",
    "city": "s.city",
    "created_at": "current_timestamp()"
}).execute()
```

#### SCD Type 2 Implementation (Two-Pass Merge Pattern):
```python
# Pass 1: Expire changed records
# Union staged updates with a dummy null key to trigger both update and insert in 1 atomic transaction
staged_updates = df_updates.select(
    F.col("customer_id").alias("merge_key"),
    F.col("*")
).unionByName(
    df_updates.select(F.lit(None).alias("merge_key"), F.col("*"))
)

target_dim.alias("t").merge(
    source=staged_updates.alias("s"),
    condition="t.customer_id = s.merge_key AND t.is_current = true"
).whenMatchedUpdate(
    condition="t.city <> s.city",
    set={"is_current": "false", "end_date": "current_timestamp()"}
).whenNotMatchedInsert(
    values={
        "customer_id": "s.customer_id",
        "city": "s.city",
        "is_current": "true",
        "start_date": "current_timestamp()",
        "end_date": "null"
    }
).execute()
```

### Phase 3: Production Gotchas & Remediation
- **Delta Live Tables (DLT) Alternative**: In modern Databricks, SCD Type 2 is simplified via the declarative `APPLY CHANGES INTO` syntax, which automatically manages surrogate keys, effective dates, and out-of-order sequence columns."""
  },

  # Scenario-Based Coding Questions (Module 3 & Module 4)
  {
    "id": "q-ansh-pyspark-01",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Deduplication & Window Functions",
    "difficulty": "EASY",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "While ingesting customer transaction data, you notice duplicate entries. How would you remove duplicates and retain only the latest entry per customer based on a timestamp column?",
    "answer": """### Phase 1: Conceptual Foundation
When ingesting event streams or batch files, upstream sources frequently emit multiple versions of the same entity. Using naive `dropDuplicates(['customer_id'])` is non-deterministic because Spark drops arbitrary rows without respecting the timestamp.
To deterministically retain the latest entry, use the **Window Function Ranking Pattern** (`row_number()` partitioned by entity and ordered by timestamp descending).

### Phase 2: PySpark Implementation
```python
from pyspark.sql import functions as F
from pyspark.sql.window import Window

# Sample Data
data = [
    ("101", "2026-10-01 10:00:00", 100),
    ("101", "2026-10-01 12:30:00", 150), # Latest for 101
    ("102", "2026-10-01 09:00:00", 200),
    ("102", "2026-10-01 08:30:00", 180)  # Earlier for 102
]
df = spark.createDataFrame(data, ["customer_id", "timestamp", "amount"])

# Define Window: Partition by customer, sort by timestamp desc
window_spec = Window.partitionBy("customer_id").orderBy(F.col("timestamp").desc())

# Assign row number and filter for the latest record (rank == 1)
df_deduped = df.withColumn("rank", F.row_number().over(window_spec)) \\
    .filter(F.col("rank") == 1) \\
    .drop("rank")

df_deduped.show()
```

### Phase 3: Production Gotchas & Remediation
- **Tie-Breaking**: If two records have the exact same timestamp, `row_number()` non-deterministically picks one. Add a secondary tie-breaker column in `orderBy`: `.orderBy(F.col("timestamp").desc(), F.col("amount").desc())`."""
  },
  {
    "id": "q-ansh-pyspark-02",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Schema Evolution & Merging",
    "difficulty": "MEDIUM",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "While processing data from multiple Parquet/Delta files with inconsistent schemas, how do you merge them into a single unified DataFrame without failing?",
    "answer": """### Phase 1: Conceptual Foundation
By default, Spark expects all Parquet files under a directory to adhere to the exact same schema. If file A contains `(id, name)` and file B contains `(id, name, age)`, reading the directory can cause missing column errors or schema mismatch failures.
Spark provides **Schema Merging**, which scans metadata across files and unions all columns into a single superset schema (filling missing columns with `null`).

### Phase 2: PySpark Implementation
```python
# Enable schema merging when reading Parquet files
df_merged = spark.read \\
    .option("mergeSchema", "true") \\
    .parquet("abfss://raw@datalake.dfs.core.windows.net/inconsistent_data/")

# Or globally in Spark session:
spark.conf.set("spark.sql.parquet.mergeSchema", "true")

# When appending to an existing Delta table with new columns:
df_new_data.write \\
    .format("delta") \\
    .mode("append") \\
    .option("mergeSchema", "true") \\
    .saveAsTable("gold_customer_profile")
```

### Phase 3: Production Gotchas & Remediation
- **Performance Cost of `mergeSchema` on Parquet**: For plain Parquet, `mergeSchema = true` forces Spark to read the footer of *every single file* in the directory (an O(N) metadata scan), causing severe delays on folders with thousands of files.
- **Delta Lake Advantage**: Delta Lake tracks schema in its centralized transaction log (`_delta_log`), making schema evolution instant with zero file footer scanning overhead."""
  },
  {
    "id": "q-ansh-pyspark-03",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Streaming & Null Value Imputation",
    "difficulty": "MEDIUM",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "In a real-time PySpark streaming pipeline, you notice missing or null values in the incoming 'category' column. How do you handle nulls dynamically?",
    "answer": """### Phase 1: Conceptual Foundation
In streaming pipelines, missing or null values in critical dimensions can cause downstream joins and aggregations to drop rows or produce incorrect results.
Depending on business requirements, data engineers handle nulls by:
1. Imputing with default values (`fillna` / `coalesce`).
2. Conditional classification (`when().otherwise()`).
3. Routing corrupt records to a dead-letter quarantine table.

### Phase 2: PySpark Implementation
```python
from pyspark.sql import functions as F

# Method 1: Using fillna to replace NULL with 'Unknown'
df_stream_cleaned = df_stream.fillna({"category": "Unknown", "status": "Pending"})

# Method 2: Conditional Imputation based on other columns
df_stream_imputed = df_stream.withColumn(
    "category",
    F.when(F.col("category").isNotNull(), F.col("category"))
     .when(F.col("product_name").contains("Laptop"), "Electronics")
     .otherwise("Uncategorized")
)

# Method 3: Using coalesce to fallback to a secondary column
df_stream_coalesced = df_stream.withColumn(
    "final_category",
    F.coalesce(F.col("category"), F.col("inferred_category"), F.lit("Standard"))
)
```

### Phase 3: Production Gotchas & Remediation
- **Streaming Statefulness**: `fillna` is a stateless transformation, meaning it operates locally in each micro-batch with zero shuffle or state store overhead."""
  },
  {
    "id": "q-ansh-pyspark-04",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Aggregation & Top-N Analysis",
    "difficulty": "EASY",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "Given user activity logs, write a PySpark query to calculate the total number of actions per user and extract the top 5 most active users.",
    "answer": """### Phase 1: Conceptual Foundation
Calculating top-N aggregations requires grouping by entity, computing an aggregate metric (`sum` or `count`), sorting in descending order, and limiting output to `N`.

### Phase 2: PySpark Implementation
```python
from pyspark.sql import functions as F

data = [
    ("user1", 5), ("user2", 8), ("user3", 2),
    ("user4", 10), ("user2", 3), ("user1", 7)
]
df_activity = spark.createDataFrame(data, ["user_id", "actions"])

# Aggregate and retrieve Top 5
df_top5_users = df_activity.groupBy("user_id") \\
    .agg(F.sum("actions").alias("total_actions")) \\
    .orderBy(F.col("total_actions").desc()) \\
    .limit(5)

df_top5_users.show()
```

### Phase 3: Production Gotchas & Remediation
- **Global Sort vs. Limit Pushdown**: In Spark, `orderBy().limit(N)` is optimized via a **TakeOrderedAndProject** physical operator. Each executor sorts its local data and emits only its top 5 to the driver, avoiding a full cluster-wide global sort."""
  },
  {
    "id": "q-ansh-pyspark-05",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Date Functions & Filtering",
    "difficulty": "EASY",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "You need to identify all customers who have not made any purchases in the last 30 days. How would you write this filter in PySpark?",
    "answer": """### Phase 1: Conceptual Foundation
Filtering on rolling historical time windows requires comparing a date/timestamp column against the current execution date using PySpark's date arithmetic functions (`current_date()`, `datediff()`, or `date_sub()`).

### Phase 2: PySpark Implementation
```python
from pyspark.sql import functions as F

data = [
    ("cust1", "2026-10-05"), # 6 days ago -> Active
    ("cust2", "2026-08-15"), # >30 days ago -> Inactive
    ("cust3", "2026-09-01")  # >30 days ago -> Inactive
]
df_customers = spark.createDataFrame(data, ["customer_id", "last_purchase_date"])

# Approach 1: Using datediff
df_inactive = df_customers.filter(
    F.datediff(F.current_date(), F.col("last_purchase_date")) > 30
)

# Approach 2: Using date_sub
df_inactive_alt = df_customers.filter(
    F.col("last_purchase_date") < F.date_sub(F.current_date(), 30)
)

df_inactive.show()
```

### Phase 3: Production Gotchas & Remediation
- **Index / Partition Pruning**: If `last_purchase_date` is a table partition column, `F.col("last_purchase_date") < F.date_sub(...)` allows Spark Catalyst to prune historical partitions, whereas wrapping the column in `datediff()` may bypass partition skipping."""
  },
  {
    "id": "q-ansh-pyspark-06",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Text Analytics & Tokenization",
    "difficulty": "MEDIUM",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "While analyzing customer reviews, how do you extract and identify the most frequently used words across all feedback text in PySpark?",
    "answer": """### Phase 1: Conceptual Foundation
Analyzing unstructured text across distributed datasets follows the classic Word Count pattern:
1. Normalize and clean text (lowercase, strip punctuation).
2. Tokenize text into an array of words using `split()`.
3. Explode the array into individual rows using `explode()`.
4. Group by word, aggregate count, and sort descending.

### Phase 2: PySpark Implementation
```python
from pyspark.sql import functions as F

data = [
    ("c1", "The product is great and fast delivery"),
    ("c2", "Great product quality great price"),
    ("c3", "Fast delivery but quality is not great")
]
df_reviews = spark.createDataFrame(data, ["customer_id", "feedback"])

df_word_count = df_reviews \\
    .withColumn("cleaned_text", F.lower(F.regexp_replace(F.col("feedback"), "[^a-zA-Z\\\\s]", ""))) \\
    .withColumn("words", F.split(F.col("cleaned_text"), "\\\\s+")) \\
    .select(F.explode(F.col("words")).alias("word")) \\
    .filter(F.length(F.col("word")) > 2) \\
    .groupBy("word") \\
    .count() \\
    .orderBy(F.col("count").desc())

df_word_count.show()
```

### Phase 3: Production Gotchas & Remediation
- **Stop Words**: Real-world text analytics requires filtering out common stop words (`and`, `the`, `is`). Join against a broadcasted stop-word DataFrame or use Spark MLlib's `StopWordsRemover`."""
  },
  {
    "id": "q-ansh-pyspark-07",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Cumulative Metrics & Window Functions",
    "difficulty": "MEDIUM",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "How do you calculate the cumulative (running) sum of sales over time for each product in PySpark?",
    "answer": """### Phase 1: Conceptual Foundation
A cumulative sum computes a running total that accumulates with every successive row. In SQL and PySpark, this is achieved by defining a Window partitioned by product and ordered by date.
- **Important**: When an `orderBy` clause is present without an explicit frame specification, the default frame is `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`, which computes the running total.

### Phase 2: PySpark Implementation
```python
from pyspark.sql import functions as F
from pyspark.sql.window import Window

data = [
    ("prod1", "2026-10-01", 100),
    ("prod1", "2026-10-02", 150),
    ("prod1", "2026-10-03", 200),
    ("prod2", "2026-10-01", 300),
    ("prod2", "2026-10-02", 50)
]
df_sales = spark.createDataFrame(data, ["product_id", "sale_date", "amount"])

# Define Window Specification
window_spec = Window.partitionBy("product_id") \\
    .orderBy("sale_date") \\
    .rowsBetween(Window.unboundedPreceding, Window.currentRow)

# Calculate running cumulative total
df_with_cumsum = df_sales.withColumn(
    "cumulative_sales",
    F.sum("amount").over(window_spec)
)

df_with_cumsum.show()
```

### Phase 3: Production Gotchas & Remediation
- **`rowsBetween` vs `rangeBetween`**: Always explicitly specify `rowsBetween(Window.unboundedPreceding, Window.currentRow)`. Using the default `rangeBetween` evaluates duplicates with the same date together in a single lump sum rather than row-by-row."""
  },
  {
    "id": "q-ansh-pyspark-08",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Monthly Ranking & Analytics",
    "difficulty": "MEDIUM",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "Write a PySpark query to identify the top-selling product (highest revenue) for each calendar month.",
    "answer": """### Phase 1: Conceptual Foundation
Finding the top item per period requires:
1. Truncating the date to monthly granularity (`date_trunc("month", col)` or `trunc(col, "MM")`).
2. Grouping by month and product to aggregate total revenue.
3. Defining a Window partitioned by month and ordered by monthly revenue descending.
4. Using `dense_rank()` or `row_number()` to select rank = 1.

### Phase 2: PySpark Implementation
```python
from pyspark.sql import functions as F
from pyspark.sql.window import Window

data = [
    ("p1", "2026-09-05", 500),
    ("p2", "2026-09-12", 800),
    ("p1", "2026-10-01", 1200),
    ("p2", "2026-10-15", 950)
]
df = spark.createDataFrame(data, ["product_id", "order_date", "sale_amount"])

# Step 1: Aggregate revenue per month per product
df_monthly_product = df.withColumn("order_month", F.trunc(F.col("order_date"), "MM")) \\
    .groupBy("order_month", "product_id") \\
    .agg(F.sum("sale_amount").alias("monthly_revenue"))

# Step 2: Rank products per month
window_monthly = Window.partitionBy("order_month").orderBy(F.col("monthly_revenue").desc())

df_top_monthly = df_monthly_product.withColumn("rank", F.dense_rank().over(window_monthly)) \\
    .filter(F.col("rank") == 1) \\
    .drop("rank")

df_top_monthly.show()
```

### Phase 3: Production Gotchas & Remediation
- **Ties in Ranking**: If two products tie with the exact same sales, `dense_rank()` returns both products as rank 1. If strictly one product is required, use `row_number()` with a deterministic secondary sort key."""
  },
  {
    "id": "q-ansh-pyspark-09",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Malformatted Record Handling",
    "difficulty": "MEDIUM",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "How do you configure a PySpark reader to handle corrupt or malformed CSV records gracefully without terminating the pipeline?",
    "answer": """### Phase 1: Conceptual Foundation
In production, CSV files frequently arrive with unescaped delimiters, mismatched column counts, or invalid characters. By default, PySpark uses `PERMISSIVE` mode, setting corrupted fields to `null`. However, data engineers often need to capture and isolate corrupted rows for audit.
PySpark provides three read modes:
- `PERMISSIVE` (Default): Sets corrupt fields to `null` and captures raw corrupted lines in a designated corrupt record column.
- `DROPMALFORMED`: Silently ignores and drops any record containing formatting errors.
- `FAILFAST`: Immediately crashes execution upon encountering the first corrupt record.

### Phase 2: PySpark Implementation (Capturing Corrupt Rows)
```python
from pyspark.sql.types import StructType, StructField, StringType, IntegerType

# Define schema including special corrupt record column
schema = StructType([
    StructField("id", IntegerType(), True),
    StructField("name", StringType(), True),
    StructField("amount", IntegerType(), True),
    StructField("_corrupt_record", StringType(), True) # Designated column
])

df_csv = spark.read \\
    .format("csv") \\
    .option("header", "true") \\
    .option("mode", "PERMISSIVE") \\
    .option("columnNameOfCorruptRecord", "_corrupt_record") \\
    .schema(schema) \\
    .load("path/to/files/*.csv")

# Filter valid vs corrupt records
df_valid = df_csv.filter(F.col("_corrupt_record").isNull()).drop("_corrupt_record")
df_corrupt = df_csv.filter(F.col("_corrupt_record").isNotNull())

# Route corrupt records to quarantine directory
df_corrupt.write.mode("append").json("/mnt/quarantine/corrupt_csv_logs/")
```

### Phase 3: Production Gotchas & Remediation
- **Schema Prerequisite**: The `columnNameOfCorruptRecord` option only works when an explicit user-defined `StructType` schema is provided. It does not function with `inferSchema = true`."""
  },
  {
    "id": "q-ansh-pyspark-10",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Conditional Logic & Bucketing",
    "difficulty": "EASY",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "While processing sales transactions, you need to classify each transaction as 'High' (amount >= 200) or 'Low' (amount < 200). How do you achieve this using when / otherwise?",
    "answer": """### Phase 1: Conceptual Foundation
In SQL, conditional branching is handled via `CASE WHEN ... THEN ... ELSE ... END`. In PySpark, this is achieved using `F.when().otherwise()`, which maps directly to Catalyst relational expressions without Python UDF overhead.

### Phase 2: PySpark Implementation
```python
from pyspark.sql import functions as F

data = [("tx1", 100), ("tx2", 300), ("tx3", 50), ("tx4", 200)]
df = spark.createDataFrame(data, ["tx_id", "amount"])

df_classified = df.withColumn(
    "tier",
    F.when(F.col("amount") >= 200, "High")
     .otherwise("Low")
)

df_classified.show()
```

### Phase 3: Production Gotchas & Remediation
- **Chained Whens**: You can chain multiple conditions sequentially:
  `F.when(col >= 500, "Platinum").when(col >= 200, "Gold").otherwise("Standard")`.
- **Handling Nulls**: If `amount` is null, `col >= 200` evaluates to false, routing the row to `otherwise("Low")`. Explicitly handle nulls first:
  `F.when(col.isNull(), "Unknown").when(...)`."""
  },
  {
    "id": "q-ansh-pyspark-11",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Audit Columns & Ingestion Metadata",
    "difficulty": "EASY",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "Why is it an architectural best practice to append an ingestion timestamp column ('processed_timestamp') to incoming DataFrames, and how do you implement it in PySpark?",
    "answer": """### Phase 1: Conceptual Foundation
In enterprise data platforms, downstream data consumers frequently need to know when data landed, debug pipeline latency, and identify which pipeline run processed a record.
Adding metadata audit columns provides:
1. **Pipeline SLA Tracking**: Measuring delta between event generation timestamp and ingestion timestamp.
2. **Incremental Extraction**: Downstream silver/gold jobs can filter `WHERE processed_timestamp >= last_watermark`.
3. **Data Lineage**: Pinpointing which batch loaded a specific record.

### Phase 2: PySpark Implementation
```python
from pyspark.sql import functions as F

# Append current UTC timestamp and input file name
df_with_audit = df_raw \\
    .withColumn("processed_timestamp", F.current_timestamp()) \\
    .withColumn("source_file", F.input_file_name())
```

### Phase 3: Production Gotchas & Remediation
- **Timezone Drift**: Always ensure timestamps are formatted in UTC (`current_timestamp()` in Spark defaults to UTC on cluster JVMs). Never use local client machine time (`datetime.now()`) to prevent timezone misalignment."""
  },
  {
    "id": "q-ansh-pyspark-12",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Temporary Views & Scope",
    "difficulty": "EASY",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "What is the difference between createOrReplaceTempView() and createGlobalTempView() in PySpark? When would you use each?",
    "answer": """### Phase 1: Conceptual Foundation
Spark provides two mechanisms to register a DataFrame as a SQL-queryable temporary view:
- **`createOrReplaceTempView('view_name')`**: Session-scoped temporary view. It exists only within the current `SparkSession`. It is automatically dropped when the notebook session closes and cannot be queried by other notebooks or concurrent sessions.
- **`createGlobalTempView('view_name')`**: Cluster-scoped global temporary view. It is preserved across multiple `SparkSession` instances, jobs, and notebooks running on the same cluster.

### Phase 2: Usage & Querying Syntax
```python
# 1. Local Temp View
df.createOrReplaceTempView("local_sales")
# Queried directly in SQL:
spark.sql("SELECT * FROM local_sales")

# 2. Global Temp View
df.createGlobalTempView("global_sales")
# Must be queried with the 'global_temp' system database prefix:
spark.sql("SELECT * FROM global_temp.global_sales")
```

### Phase 3: Production Gotchas & Remediation
- **Namespace Requirement**: Querying a global temp view without the `global_temp.` prefix results in a `Table or view not found` exception.
- **Ephemeral Nature**: Neither view type is permanent; if the cluster restarts, both local and global temporary views are destroyed. For persistent catalog visibility, use `df.write.saveAsTable('catalog.schema.table')`."""
  },
  {
    "id": "q-ansh-pyspark-13",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Nested Data Structures & Structs",
    "difficulty": "MEDIUM",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "You have a PySpark DataFrame containing nested JSON struct columns (e.g. 'details.price', 'details.quantity'). How do you flatten the nested structure for relational SQL querying?",
    "answer": """### Phase 1: Conceptual Foundation
Semi-structured payloads (JSON, Avro) often contain nested `StructType` fields. While Spark allows querying nested fields using dot notation (`details.price`), relational data warehouses and BI tools perform best with flat schemas.
Flattening extracts struct elements into first-class top-level columns.

### Phase 2: PySpark Implementation
```python
from pyspark.sql import functions as F

data = [
    ("product1", {"price": 100, "quantity": 2}),
    ("product2", {"price": 250, "quantity": 5})
]
df_nested = spark.createDataFrame(data, ["product_name", "details"])

# Flatten struct using dot notation and alias
df_flat = df_nested.select(
    F.col("product_name"),
    F.col("details.price").alias("price"),
    F.col("details.quantity").alias("quantity"),
    (F.col("details.price") * F.col("details.quantity")).alias("total_value")
)

df_flat.show()
```

### Phase 3: Production Gotchas & Remediation
- **Dynamic Programmatic Flattening**: If a struct contains dozens of unknown dynamic fields, flatten them programmatically:
```python
flat_cols = [F.col(f"details.{f.name}").alias(f.name) for f in df.schema["details"].dataType.fields]
df_flattened = df.select("product_name", *flat_cols)
```"""
  },
  {
    "id": "q-ansh-pyspark-14",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Array Aggregations",
    "difficulty": "EASY",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "What is the difference between collect_list() and collect_set() in PySpark? Write an aggregation grouping by customer to list their unique purchases.",
    "answer": """### Phase 1: Conceptual Foundation
When performing aggregations, standard SQL collapses rows into numeric summaries (`SUM`, `AVG`). PySpark provides array aggregations to consolidate row values into distributed list objects:
- **`collect_list(col)`**: Aggregates all values in a group into an array, **preserving duplicates**.
- **`collect_set(col)`**: Aggregates all values in a group into an array, **eliminating duplicates** to return only distinct items.

### Phase 2: PySpark Implementation
```python
from pyspark.sql import functions as F

data = [
    (101, "P001"), (101, "P002"),
    (102, "P001"), (101, "P001") # Duplicate P001 for customer 101
]
df = spark.createDataFrame(data, ["customer_id", "product_id"])

# Aggregate unique products per customer
df_customer_products = df.groupBy("customer_id").agg(
    F.collect_list("product_id").alias("all_purchases"),
    F.collect_set("product_id").alias("unique_purchases"),
    F.size(F.collect_set("product_id")).alias("distinct_product_count")
)

df_customer_products.show(truncate=False)
```

### Phase 3: Production Gotchas & Remediation
- **Driver OOM Risk**: Be cautious when collecting arrays on very large groups. If a single entity has millions of records, `collect_set` builds a massive in-memory array that can cause executor heap exhaustion."""
  },
  {
    "id": "q-ansh-pyspark-15",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "String Formatting & Padding",
    "difficulty": "EASY",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "You have employee IDs of varying lengths (e.g. '12', '456', '7890'). How do you ensure all IDs are uniformly 6 characters long by padding them with leading zeroes?",
    "answer": """### Phase 1: Conceptual Foundation
In legacy ERP and mainframe systems, identifiers require fixed-width formatting. When numbers are converted to strings, leading zeros are stripped. PySpark provides `lpad()` (left pad) and `rpad()` (right pad) to enforce uniform string lengths.

### Phase 2: PySpark Implementation
```python
from pyspark.sql import functions as F

data = [("12",), ("456",), ("7890",), ("123456",)]
df_emp = spark.createDataFrame(data, ["emp_id"])

df_padded = df_emp.withColumn(
    "formatted_emp_id",
    F.lpad(F.col("emp_id"), 6, "0")
)

df_padded.show()
# Outputs: '000012', '000456', '007890', '123456'
```

### Phase 3: Production Gotchas & Remediation
- **String Truncation**: If an incoming string is longer than the specified length (e.g. 7 characters), `lpad(col, 6, '0')` will **truncate** the string to 6 characters from the left. Always validate maximum length prior to padding."""
  },
  {
    "id": "q-ansh-pyspark-16",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Regular Expressions & Validation",
    "difficulty": "EASY",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "How do you validate phone numbers in a PySpark DataFrame to verify that they begin with country code '91' and contain exactly 12 digits?",
    "answer": """### Phase 1: Conceptual Foundation
Data quality pipelines must filter out malformed phone numbers, emails, and postal codes before ingestion into silver/gold tables. PySpark provides regular expression matching via `rlike()` and `regexp_extract()`.

### Phase 2: PySpark Implementation
```python
from pyspark.sql import functions as F

data = [
    ("919876543210",), # Valid: starts with 91, 12 digits
    ("9112345",),       # Invalid: too short
    ("129876543210",), # Invalid: does not start with 91
    ("91abcdefghij",)  # Invalid: non-numeric
]
df_phones = spark.createDataFrame(data, ["phone_number"])

# Regex: ^91[0-9]{10}$
df_validated = df_phones.withColumn(
    "is_valid_phone",
    F.col("phone_number").rlike("^91[0-9]{10}$")
)

df_validated.show()
```

### Phase 3: Production Gotchas & Remediation
- **Clean Before Validating**: In real-world data, phone numbers often contain whitespace, dashes, or `+` signs. Strip non-digits before validating:
  `F.regexp_replace(col, "[^0-9]", "")`."""
  },
  {
    "id": "q-ansh-pyspark-17",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Window Functions & Month-over-Month Trends",
    "difficulty": "HARD",
    "domain": "Analytics, BI & AI",
    "subdomain": "Advanced Analytical SQL & PySpark",
    "question": "You work as a data engineer at an airline company. The business team wants to track monthly flight ticket sales trends and calculate the Month-over-Month (MoM) revenue growth percentage. How do you implement this in PySpark?",
    "answer": """### Phase 1: Conceptual Foundation
Tracking periodic performance trends requires comparing the current period's metric against the immediately preceding period:
1. Truncate transaction dates to monthly granularity.
2. Group by month to calculate total monthly ticket sales.
3. Use the `lag()` window function to retrieve the prior month's sales.
4. Calculate percentage change: `((current - prior) / prior) * 100`.

### Phase 2: PySpark Implementation
```python
from pyspark.sql import functions as F
from pyspark.sql.window import Window

data = [
    ("2026-06-15", 500000),
    ("2026-07-20", 650000),
    ("2026-08-10", 720000),
    ("2026-09-05", 680000),
    ("2026-10-01", 810000)
]
df_sales = spark.createDataFrame(data, ["booking_date", "sale_amount"])

# Step 1: Monthly Aggregation
df_monthly = df_sales.withColumn("month", F.trunc(F.col("booking_date"), "MM")) \\
    .groupBy("month") \\
    .agg(F.sum("sale_amount").alias("monthly_sales"))

# Step 2: Window over chronological months
window_trend = Window.orderBy("month")

# Step 3: Compute MoM growth
df_trend = df_monthly.withColumn("prior_month_sales", F.lag("monthly_sales", 1).over(window_trend)) \\
    .withColumn(
        "mom_growth_pct",
        F.round(((F.col("monthly_sales") - F.col("prior_month_sales")) / F.col("prior_month_sales")) * 100, 2)
    )

df_trend.show()
```

### Phase 3: Production Gotchas & Remediation
- **First Month Null Handling**: For the very first historical month, `lag()` returns `null`, causing `mom_growth_pct` to be `null`. Replace with `0.0` or `'N/A'` using `F.coalesce()`."""
  },
  {
    "id": "q-ansh-pyspark-18",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Airport Analytics & Top-N Revenue",
    "difficulty": "MEDIUM",
    "domain": "Analytics, BI & AI",
    "subdomain": "Advanced Analytical SQL & PySpark",
    "question": "For an airline analytics platform, write a PySpark query to identify the top 5 departure airports based on total flight ticket sales revenue and explain your query execution plan.",
    "answer": """### Phase 1: Conceptual Foundation
Ranking high-volume categorical entities requires grouping by airport, summing sales, and sorting descending. To ensure optimal query planning, data engineers analyze the physical plan to verify aggregation pushdown.

### Phase 2: PySpark Implementation & Plan Analysis
```python
from pyspark.sql import functions as F

data = [
    ("JFK", 1500000), ("LHR", 2200000), ("DXB", 3100000),
    ("HND", 1900000), ("SIN", 2800000), ("ORD", 1200000)
]
df_flights = spark.createDataFrame(data, ["departure_airport", "ticket_sales"])

# Compute Top 5 Airports
df_top5_airports = df_flights.groupBy("departure_airport") \\
    .agg(F.sum("ticket_sales").alias("total_revenue")) \\
    .orderBy(F.col("total_revenue").desc()) \\
    .limit(5)

df_top5_airports.show()
df_top5_airports.explain(True)
```
- **Physical Plan Mechanics**:
  - `HashAggregate (partial)`: Each executor locally sums revenues per airport.
  - `Exchange hashpartitioning`: Shuffles only intermediate aggregates across nodes.
  - `HashAggregate (final)`: Computes final sum per airport.
  - `TakeOrderedAndProject`: Extracts top 5 records directly on executors before returning to driver.

### Phase 3: Production Gotchas & Remediation
- **Currency Normalization**: In global airlines, ensure ticket sales are normalized to a uniform base currency (e.g. USD) before performing sums."""
  },
  {
    "id": "q-ansh-pyspark-19",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Rolling Metrics & Window Frames",
    "difficulty": "HARD",
    "domain": "Analytics, BI & AI",
    "subdomain": "Advanced Analytical SQL & PySpark",
    "question": "Management asks you to calculate a rolling 3-month average booking revenue for each flight route to smooth out seasonality. How do you implement rolling window frames in PySpark?",
    "answer": """### Phase 1: Conceptual Foundation
Rolling averages smooth out short-term spikes to highlight underlying trends. This requires specifying an explicit physical or logical Window frame:
- `rowsBetween(-2, 0)`: Evaluates the current row and the 2 preceding rows (a rolling 3-row window).
- When applied to sorted monthly summaries, it computes the rolling 3-month average.

### Phase 2: PySpark Implementation
```python
from pyspark.sql import functions as F
from pyspark.sql.window import Window

# Window partitioned by route, sorted by month, looking back 2 months + current month
rolling_window = Window.partitionBy("route_id") \\
    .orderBy("month") \\
    .rowsBetween(-2, 0)

df_rolling = df_monthly_routes.withColumn(
    "rolling_3m_avg_revenue",
    F.round(F.avg("monthly_revenue").over(rolling_window), 2)
)

df_rolling.show()
```

### Phase 3: Production Gotchas & Remediation
- **Missing Months Gap**: `rowsBetween(-2, 0)` counts *rows*, not calendar time. If route A has no flights in July, the row before August will be June, leading to incorrect calculations.
  *Remediation*: If periods have missing intervals, dense-pad the calendar months with zero revenue before applying `rowsBetween`."""
  },
  {
    "id": "q-ansh-pyspark-20",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Multi-Tier Categorization",
    "difficulty": "EASY",
    "domain": "Compute & Orchestration",
    "subdomain": "PySpark Distributed Processing",
    "question": "You need to categorize cities into revenue tiers based on total sales: 'Low' (< $1,000), 'Mid' ($1,000 to $10,000), and 'High' (> $10,000). How do you implement this in PySpark?",
    "answer": """### Phase 1: Conceptual Foundation
Categorizing metrics into discrete tiers or buckets is a common feature engineering and reporting requirement. In PySpark, chain `when` conditions in order of threshold hierarchy.

### Phase 2: PySpark Implementation
```python
from pyspark.sql import functions as F

data = [
    ("Seattle", 15000),
    ("Denver", 4500),
    ("Boise", 800)
]
df_cities = spark.createDataFrame(data, ["city", "revenue"])

df_tiered = df_cities.withColumn(
    "revenue_tier",
    F.when(F.col("revenue") > 10000, "High")
     .when(F.col("revenue") >= 1000, "Mid")
     .otherwise("Low")
)

df_tiered.show()
```

### Phase 3: Production Gotchas & Remediation
- **Boundary Conditions**: Clearly clarify boundary conditions with business stakeholders (e.g. is exactly $1,000 'Mid' or 'Low'?). Using `>=` ensures boundary values are captured predictably."""
  },
  {
    "id": "q-ansh-pyspark-21",
    "source": "Ansh Lamba Masterclass",
    "category": "SPARK & DATABRICKS",
    "niche": "Python OOP & PySpark Frameworks",
    "difficulty": "HARD",
    "domain": "General Data Engineering",
    "subdomain": "Data Engineering Design Patterns",
    "question": "Design an Object-Oriented Python class ('DynamicTransformer') that accepts a PySpark DataFrame and dynamically applies user-specified aggregation functions and columns without hardcoded logic.",
    "answer": """### Phase 1: Conceptual Foundation
In enterprise data engineering, writing repetitive copy-paste aggregation logic across dozens of notebooks creates technical debt and maintenance nightmares.
Applying **Object-Oriented Programming (OOP) Design Patterns** in PySpark enables building modular, reusable data transformation utilities that can be imported across any pipeline.

### Phase 2: Python OOP Implementation
```python
from pyspark.sql import DataFrame, functions as F
from typing import List, Dict

class DynamicTransformer:
    def __init__(self, df: DataFrame):
        self.df = df
        
    def add_audit_metadata(self) -> 'DynamicTransformer':
        self.df = self.df.withColumn("ingested_at", F.current_timestamp())
        return self
        
    def dynamic_aggregate(self, group_cols: List[str], agg_spec: Dict[str, str]) -> DataFrame:
        \"\"\"
        Dynamically applies aggregations.
        agg_spec: {'sale_amount': 'sum', 'order_id': 'count', 'price': 'avg'}
        \"\"\"
        agg_exprs = []
        for col_name, func_name in agg_spec.items():
            func = getattr(F, func_name.lower())
            agg_exprs.append(func(F.col(col_name)).alias(f"{func_name}_{col_name}"))
            
        return self.df.groupBy(*group_cols).agg(*agg_exprs)

# Usage in Pipeline:
data = [("North", 100, 1), ("North", 200, 2), ("South", 150, 3)]
df = spark.createDataFrame(data, ["region", "sale_amount", "order_id"])

transformer = DynamicTransformer(df)
df_result = transformer.add_audit_metadata() \\
    .dynamic_aggregate(
        group_cols=["region"],
        agg_spec={"sale_amount": "sum", "order_id": "count"}
    )

df_result.show()
```

### Phase 3: Production Gotchas & Remediation
- **Method Chaining Pattern**: Designing the utility with a fluent builder pattern (returning `self`) allows expressive, readable pipeline orchestration."""
  }
]

def main():
    print(f"Reading {FILE_PATH}...")
    with open(FILE_PATH, 'r') as f:
        data = json.load(f)
    print(f"Initial count: {len(data)}")

    existing_ids = {q['id'] for q in data}
    to_add = []
    for q in new_questions:
        if q['id'] in existing_ids:
            print(f"Skipping existing question id: {q['id']}")
        else:
            to_add.append(q)

    print(f"Adding {len(to_add)} new Spark & PySpark questions...")
    data.extend(to_add)

    with open(FILE_PATH, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Final count: {len(data)}")
    print("Successfully appended Part 2 questions!")

if __name__ == '__main__':
    main()
