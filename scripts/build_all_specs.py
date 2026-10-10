#!/usr/bin/env python3
"""
scripts/build_all_specs.py
Generates scripts/specs_data.py containing comprehensive specifications for all 160 topics
across 16 categories in data_architecture.json.
"""

import json
import os

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "specs_data.py")

# We define high-fidelity dictionaries for each category and topic.
# Let us construct the generator dictionary.

ALL_SPECS = {}

def add_spec(category, topic, q_principles, q_hardening, q_optimization, code, failures):
    ALL_SPECS[(category, topic)] = {
        "principles": q_principles,
        "hardening": q_hardening,
        "optimization": q_optimization,
        "code": code.strip(),
        "failures": failures
    }

# =========================================================================
# 1. Advanced PySpark & Spark Core Optimization
# =========================================================================
add_spec(
    "Advanced PySpark & Spark Core Optimization", "Broadcast Hash Joins",
    "How do you determine the optimal memory budget and autoBroadcastJoinThreshold in PySpark to avoid driver OOM when broadcasting high-cardinality dimension tables?",
    "What root causes lead to broadcast exchange timeouts during high-throughput Spark joins, and how do you configure timeout thresholds and executor network buffers?",
    "Under what table size thresholds and memory constraints should you force SortMergeJoin or ShuffleHashJoin over BroadcastHashJoin to prevent executor GC storms in multi-terabyte pipelines?",
    """from pyspark.sql.functions import broadcast

spark.conf.set("spark.sql.autoBroadcastJoinThreshold", 64 * 1024 * 1024)
spark.conf.set("spark.sql.broadcastTimeout", 600)

df_joined = df_large_fact.join(
    broadcast(df_small_dim.select("client_id", "tier_code")),
    on="client_id",
    how="inner"
)
df_joined.write.format("delta").mode("append").save("/mnt/gold/fact_transactions")""",
    [
        ("Driver Memory Exhaustion (OOM)", "The driver collects the entire broadcast relation into memory before serializing it to executors.", "Never broadcast tables exceeding 100MB; use SortMergeJoin or range bucketing."),
        ("Broadcast Exchange Timeout", "Slow network transfer between driver and hundreds of executors triggers a timeout abort.", "Increase `spark.sql.broadcastTimeout` to 600s and ensure driver bandwidth is 10Gbps+."),
        ("Catalyst Filter Drop Regressions", "Subqueries or complex transformations can strip broadcast hints during logical optimization.", "Explicitly project columns before wrapping in broadcast() to preserve hints.")
    ]
)

add_spec(
    "Advanced PySpark & Spark Core Optimization", "Adaptive Query Execution (AQE)",
    "How does Spark's Adaptive Query Execution (AQE) dynamically coalesce post-shuffle partitions and convert SortMergeJoin to BroadcastHashJoin at runtime?",
    "How do you configure AQE skew join thresholds (`spark.sql.adaptive.skewJoin.skewedPartitionFactor`) to eliminate executor stragglers in skewed production ETL pipelines?",
    "Under what pipeline conditions can AQE misestimate shuffle file statistics, and how do you safeguard against query plan regressions in petabyte-scale lakehouses?",
    """spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.initialPartitionNum", 1000)
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionFactor", 5)
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", 256 * 1024 * 1024)""",
    [
        ("Post-Shuffle Over-Coalescing", "AQE merges partitions too aggressively when minPartitionSize is configured too high, creating massive 2GB+ partitions.", "Tune `spark.sql.adaptive.advisoryPartitionSizeInBytes` to 128MB."),
        ("Dynamic Join Conversion Failure", "AQE attempts to broadcast a partition that runtime statistics underestimate, blowing up executor RAM.", "Set `spark.sql.adaptive.autoBroadcastJoinThreshold` conservatively."),
        ("Pipeline Metric Stagnation", "Cached intermediate DataFrames bypass AQE dynamic re-planning stages.", "Avoid unneeded intermediate `.persist()` calls before AQE join barriers.")
    ]
)

add_spec(
    "Advanced PySpark & Spark Core Optimization", "Salting Skewed Keys",
    "How do you design a salted key distribution strategy to disperse hot partitions across Spark executors without exponentially expanding downstream table volume?",
    "How do you implement isolated dynamic salting specifically on identified outlier keys while keeping uniformly distributed keys untouched to minimize join amplification?",
    "When should you prefer key salting over range repartitioning or bucketing when optimizing high-cardinality foreign key lookups in 100TB+ workloads?",
    """from pyspark.sql.functions import col, concat_ws, floor, rand, explode, array, lit

salt_factor = 10
df_fact_salted = df_fact.withColumn("salt", floor(rand() * salt_factor)) \\
    .withColumn("salted_key", concat_ws("_", col("customer_id"), col("salt")))

salt_array = array([lit(i) for i in range(salt_factor)])
df_dim_replicated = df_dim.withColumn("salt", explode(salt_array)) \\
    .withColumn("salted_key", concat_ws("_", col("customer_id"), col("salt")))

df_result = df_fact_salted.join(df_dim_replicated, on="salted_key", how="inner").drop("salted_key", "salt")""",
    [
        ("Salt Factor Dimension Explosion", "Exploding high salt factors (e.g. 100+) on medium-sized dimensions leads to exponential memory expansion.", "Only salt top skewed keys dynamically identified via partition profiling."),
        ("Downstream Spill Over Unsalted Columns", "Grouping or windowing immediately following a salted join requires removing the salt, triggering another shuffle.", "Coalesce and group on the primary key in a single stage where feasible."),
        ("Randomness Seed Skew", "Using non-uniform hash or weak pseudorandom distributions concentrates records back onto salt 0.", "Use cryptographic or uniform hashing algorithms like `murmur3`.")
    ]
)

add_spec(
    "Advanced PySpark & Spark Core Optimization", "Custom Accumulator Logging",
    "How do you design fault-tolerant custom accumulators in Spark to capture distributed operational metrics (e.g., malformed records) without skewing executor execution?",
    "What failure modes cause Spark accumulators to double-count metric values during stage retries, and how do you ensure idempotent reporting?",
    "How do you aggregate high-throughput executor-side telemetry into custom accumulators without creating lock contention on the driver thread pool?",
    """from pyspark.accumulators import AccumulatorParam

class MetricDictAccumulator(AccumulatorParam):
    def zero(self, initial_value):
        return {}
    def addInPlace(self, v1, v2):
        for k, v in v2.items():
            v1[k] = v1.get(k, 0) + v
        return v1

metric_acc = sc.accumulator({}, MetricDictAccumulator())""",
    [
        ("Stage Retry Double Counting", "When an executor fails, Spark reruns the lost task, causing accumulator values inside transformations to increment twice.", "Only inspect accumulator values inside terminal Actions or use foreachPartition."),
        ("Driver Memory Pressure from Large Accumulator Objects", "Accumulating large serialized Python dictionaries or lists stresses driver JVM heap during task completion.", "Keep accumulator payloads strictly primitive or aggregated counters."),
        ("Serialization Protocol Desync", "Complex custom accumulator classes failing Py4J serialization during distributed executor handshakes.", "Implement explicit pickling and deserialization methods.")
    ]
)

add_spec(
    "Advanced PySpark & Spark Core Optimization", "Kryo Serialization Tuning",
    "How does Kryo serialization reduce shuffle spill and memory overhead compared to default Java serialization in large-scale Spark clusters?",
    "How do you configure strict class registration (`spark.kryo.registrationRequired`) to eliminate silent fallbacks and performance degradation in production pipelines?",
    "What memory buffer and buffer max configurations are required to serialize multi-megabyte complex nested schemas without triggering Kryo buffer overflow exceptions?",
    """conf = SparkConf() \\
    .set("spark.serializer", "org.apache.spark.serializer.KryoSerializer") \\
    .set("spark.kryoserializer.buffer.max", "512m") \\
    .set("spark.kryoserializer.buffer", "64m") \\
    .set("spark.kryo.registrationRequired", "true") \\
    .set("spark.kryo.referenceTracking", "false")""",
    [
        ("Buffer Overflow on Nested Structs", "Serializing deeply nested or multi-megabyte objects exceeds `spark.kryoserializer.buffer.max`.", "Increase buffer.max to 512m or 1024m and flatten nested arrays prior to shuffle."),
        ("Unregistered Class Crash", "When `registrationRequired=true`, encountering any unregistered custom class immediately terminates the job.", "Comprehensive unit tests verifying all POJOs/dataclasses are registered."),
        ("Reference Tracking CPU Penalty", "Enabling reference tracking introduces significant CPU overhead traversing object graphs.", "Set `spark.kryo.referenceTracking=false` if objects lack circular references.")
    ]
)

add_spec(
    "Advanced PySpark & Spark Core Optimization", "Dynamic Partition Pruning (DPP)",
    "How does Dynamic Partition Pruning (DPP) leverage runtime dimension filters to prune fact table partitions before disk scan in star-schema queries?",
    "Why does DPP fail to activate when queries involve non-equi joins or subquery correlation, and how do you structure SQL plans to guarantee DPP execution?",
    "How do you evaluate DPP performance in physical execution plans, verifying subquery broadcast reuse and partition scan reductions?",
    """spark.conf.set("spark.sql.optimizer.dynamicPartitionPruning.enabled", "true")
spark.conf.set("spark.sql.optimizer.dynamicPartitionPruning.useStats", "true")

query = \"\"\"
SELECT f.transaction_id, f.amount, d.region
FROM fact_sales f
JOIN dim_store d ON f.store_id = d.store_id
WHERE d.region = 'APAC' AND d.is_active = true
\"\"\"
spark.sql(query).explain("formatted")""",
    [
        ("Non-Partitioned Fact Join Key", "DPP requires the fact table join column to be an explicit physical partition column.", "Ensure fact tables are physically partitioned on the dimension foreign key or use liquid clustering."),
        ("Filter Selectivity Threshold Failure", "Catalyst disables DPP if estimated dimension size exceeds broadcast threshold.", "Keep dimension tables compact and run ANALYZE TABLE COMPUTE STATISTICS."),
        ("Subquery Reuse Invalidation", "Volatile functions (e.g. current_timestamp()) inside the dimension filter prevent subquery broadcast caching.", "Use deterministic date literals in partition filters.")
    ]
)

add_spec(
    "Advanced PySpark & Spark Core Optimization", "JVM Garbage Collection Settings",
    "How do you tune G1GC parameters (initiating heap occupancy, pause time targets) to eliminate executor pause spikes during heavy Spark shuffle operations?",
    "How do you diagnose Full GC pauses and allocate off-heap memory (`spark.memory.offHeap.enabled`) to isolate caching from JVM heap garbage collection?",
    "What are the tradeoffs between G1GC and ZGC/Shenandoah low-latency collectors when running terabyte-scale Spark driver and executor nodes?",
    """spark.executor.extraJavaOptions = \"\"\"
-XX:+UseG1GC
-XX:InitiatingHeapOccupancyPercent=35
-XX:G1ReservePercent=15
-XX:MaxGCPauseMillis=200
-XX:G1HeapRegionSize=32m
\"\"\"
spark.conf.set("spark.memory.offHeap.enabled", "true")
spark.conf.set("spark.memory.offHeap.size", "8g")""",
    [
        ("Concurrent Mode Failure During Shuffle", "Heap allocations outpace G1GC marking cycles, triggering catastrophic multi-second Full GC pauses.", "Lower `InitiatingHeapOccupancyPercent` to 35% so marking starts earlier."),
        ("Humongous Object Allocation Spikes", "Objects larger than 50% of the G1 region size bypass standard generational collection.", "Increase `-XX:G1HeapRegionSize` to 32m and split large arrays into chunks."),
        ("Survivor Space Overflow", "Sudden bursts of intermediate records cause premature tenuring into old gen.", "Increase `spark.executor.memoryOverhead` to give the OS off-heap headroom.")
    ]
)

add_spec(
    "Advanced PySpark & Spark Core Optimization", "PySpark UDF Vectorization",
    "How do Apache Arrow and Pandas UDFs eliminate Python-JVM IPC serialization bottlenecks compared to standard Python UDFs in PySpark?",
    "How do you manage PyArrow buffer allocations and configure `spark.sql.execution.arrow.maxRecordsPerBatch` to avoid executor OOMs in vectorized UDFs?",
    "When should you rewrite Pandas Series UDFs into native Catalyst expressions or Spark SQL functions to bypass the Python daemon entirely?",
    """from pyspark.sql.functions import pandas_udf
import pandas as pd

@pandas_udf("double")
def calculate_risk_index(score: pd.Series, exposure: pd.Series) -> pd.Series:
    return (score * 0.4) + (exposure * 0.6)

spark.conf.set("spark.sql.execution.arrow.pyspark.enabled", "true")
spark.conf.set("spark.sql.execution.arrow.maxRecordsPerBatch", 10000)""",
    [
        ("Python Worker Out-of-Memory", "Large batch sizes cause Pandas dataframes to exceed the Python worker process memory ceiling.", "Reduce `spark.sql.execution.arrow.maxRecordsPerBatch` to 5,000-10,000."),
        ("Arrow Type Serialization Mismatches", "Pandas nullable integer types (Int64) failing conversion to Spark LongType.", "Explicitly cast data types in the UDF return signature and schema."),
        ("Unvectorized Iterative Loops Inside UDF", "Writing Python for-loops inside a Pandas UDF defeats vectorization, performing worse than standard UDFs.", "Enforce native vectorized NumPy/Pandas array operations.")
    ]
)

add_spec(
    "Advanced PySpark & Spark Core Optimization", "Cache and Persist storage levels",
    "What are the architectural tradeoffs between MEMORY_ONLY, MEMORY_AND_DISK_SER, and OFF_HEAP storage levels when persisting intermediate Spark DataFrames?",
    "How do you enforce automated `.unpersist()` lifecycle boundaries to prevent memory leak accumulation across long-running Spark streaming and iterative jobs?",
    "How do you determine whether re-computing a DataFrame via lineage is more cost-effective than caching it across distributed executor memory?",
    """from pyspark import StorageLevel

df_stage1 = df_raw.filter("event_date >= '2026-01-01'").repartition(200)
df_stage1.persist(StorageLevel.MEMORY_AND_DISK_SER)

try:
    df_stage1.write.mode("overwrite").parquet("/mnt/silver/stage1_output")
finally:
    df_stage1.unpersist(blocking=True)""",
    [
        ("Unserialized JVM Object Bloat", "Using `MEMORY_ONLY` stores raw JVM objects, consuming 3x-5x more memory than on-disk Parquet.", "Use `MEMORY_AND_DISK_SER` with Kryo serialization to compress cached blocks."),
        ("Silent Eviction and Lineage Re-evaluation", "When memory pressure mounts, LRU cache silently evicts blocks, forcing unexpected expensive recomputations.", "Monitor Storage tab in Spark UI and adjust executor storage fraction."),
        ("Orphaned Cache on Long-Running Contexts", "Failing to unpersist intermediate DataFrames leads to progressive heap starvation in Databricks notebooks.", "Always wrap cache operations in try-finally blocks.")
    ]
)

add_spec(
    "Advanced PySpark & Spark Core Optimization", "Shuffle Partition adjustment",
    "How do you calculate the optimal `spark.sql.shuffle.partitions` setting based on input volume, cluster core count, and target 100MB-200MB partition sizes?",
    "What failure symptoms (spill to disk, straggler tasks) indicate shuffle partition misconfiguration, and how do you resolve them in non-AQE pipelines?",
    "How do you dynamically compute and set shuffle partition counts per query stage in heterogeneous pipelines that process both gigabyte and terabyte datasets?",
    """def calculate_shuffle_partitions(spark, input_path, target_mb=128):
    fs = spark._jvm.org.apache.hadoop.fs.FileSystem.get(spark._jsc.hadoopConfiguration())
    path = spark._jvm.org.apache.hadoop.fs.Path(input_path)
    total_bytes = fs.getContentSummary(path).getLength()
    target_bytes = target_mb * 1024 * 1024
    return max(200, int(total_bytes / target_bytes))

spark.conf.set("spark.sql.shuffle.partitions", calculate_shuffle_partitions(spark, "abfss://data@lake.dfs.core.windows.net/raw"))""",
    [
        ("Small File Explosion from Default 200 Partitions", "Running small queries with the default 200 shuffle partitions generates thousands of 1KB files.", "Lower shuffle partitions for small jobs or rely on AQE partition coalescing."),
        ("Disk Spill and OOM from Under-Partitioning", "Setting shuffle partitions too low (e.g. 50 on 1TB) causes executor shuffle memory spill to disk, killing I/O.", "Ensure individual task partition size stays between 100MB and 200MB."),
        ("Core Starvation", "Setting partition count lower than total executor core count leaves worker CPU cores idle.", "Ensure shuffle partitions is an integer multiple (2x-3x) of total cluster cores.")
    ]
)

# Output python code
print(f"Loaded {len(ALL_SPECS)} specs in builder. Writing to {OUTPUT_FILE}...")
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("#!/usr/bin/env python3\n")
    f.write("# Autogenerated specs data\n\n")
    f.write("SPECS = " + repr(ALL_SPECS) + "\n")
print("Done writing base specs.")
