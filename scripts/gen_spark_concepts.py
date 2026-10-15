import json

FILE = 'src/data/json/data_concepts.json'

with open(FILE, 'r') as f:
    data = json.load(f)
print(f"Before: {len(data)}")
existing_ids = {item['id'] for item in data}

new_entries = [
    # ── SPARK CORE EXECUTION MODEL ─────────────────────────────────────────
    {
        "id": "spark-dag-scheduler",
        "term": "DAG Scheduler",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "The high-level scheduling layer in Apache Spark that converts a logical DAG of RDD transformations into a physical execution plan of stages.",
        "explanation": "When an action is triggered, the DAG Scheduler analyses the RDD lineage graph and divides it into stages at shuffle boundaries. Within each stage, tasks are generated for every partition and handed off to the Task Scheduler. It is responsible for tracking stage dependencies, retrying failed stages, and recomputing lost partitions using lineage rather than replication.",
        "keyPoints": [
            "Splits the job at wide transformation boundaries (shuffle dependencies) to create stage groups.",
            "Tracks the lineage of every RDD partition so individual lost partitions can be recomputed without restarting the whole job.",
            "Hands off TaskSets to the Task Scheduler, which manages worker assignment and speculative execution."
        ]
    },
    {
        "id": "spark-task-scheduler",
        "term": "Task Scheduler",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "The low-level component in Apache Spark responsible for assigning individual tasks to executor cores and handling task retries and speculative execution.",
        "explanation": "The Task Scheduler receives TaskSets from the DAG Scheduler and interfaces with the cluster manager to place tasks on executors based on data locality preferences (PROCESS_LOCAL → NODE_LOCAL → RACK_LOCAL → ANY). It monitors task progress, reschedules failed tasks up to `spark.task.maxFailures` times, and launches speculative copies of straggler tasks when `spark.speculation` is enabled.",
        "keyPoints": [
            "Prefers PROCESS_LOCAL placement (task runs where its partition data already lives in memory) to avoid network I/O.",
            "Retries individual failed tasks up to `spark.task.maxFailures` (default 4) before failing the stage.",
            "Launches speculative duplicate tasks for stragglers when they exceed 1.5× the median task duration and `spark.speculation=true`."
        ]
    },
    {
        "id": "spark-stage-boundary",
        "term": "Stage Boundary",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "A stage boundary in Spark marks the point where a wide transformation (shuffle) separates two stages, requiring all tasks in the upstream stage to complete before the downstream stage begins.",
        "explanation": "Spark's execution model uses stages as the unit of pipelining. Within a stage, tasks execute as narrow transformations in a pipeline without any data movement across the network. A stage boundary is introduced whenever a shuffle dependency is detected — for example at groupBy, join, or repartition. The upstream stage must fully materialise its shuffle output files before the downstream stage can start reading them, introducing synchronisation points.",
        "keyPoints": [
            "Caused exclusively by wide transformations (groupBy, join, repartition, distinct) that require full data redistribution.",
            "The Spark UI's Stages tab shows each stage boundary as a separate row with its own task count and timing.",
            "Minimising stage boundaries by pushing filters and projections before shuffles is a primary performance optimisation strategy."
        ]
    },
    {
        "id": "spark-narrow-transformation",
        "term": "Narrow Transformation",
        "category": "SPARK & DATABRICKS",
        "difficulty": "EASY",
        "definition": "A Spark transformation where each output partition depends on exactly one input partition, requiring no data movement across the network.",
        "explanation": "Narrow transformations such as map, filter, flatMap, and union can be pipelined and executed within a single stage without shuffle. Because each task only reads from one parent partition located on the same executor, there is no inter-executor network communication. Spark chains multiple narrow transformations into a single stage and executes them together in a pipeline, significantly reducing I/O overhead.",
        "keyPoints": [
            "Examples: map, filter, flatMap, mapPartitions, union — all process data locally on the executor holding the partition.",
            "Multiple consecutive narrow transformations are fused into one stage and executed in a single pass (pipelining).",
            "Partition count is preserved from input to output; no shuffle files are written to disk."
        ]
    },
    {
        "id": "spark-wide-transformation",
        "term": "Wide Transformation",
        "category": "SPARK & DATABRICKS",
        "difficulty": "EASY",
        "definition": "A Spark transformation where each output partition may depend on multiple input partitions from different executors, requiring a full shuffle of data across the network.",
        "explanation": "Wide transformations such as groupByKey, reduceByKey, join, distinct, and repartition require Spark to redistribute data by a key hash across all executor partitions. This triggers a shuffle: the upstream stage writes shuffle files to local disk, and the downstream stage reads and merges them. Shuffles are the single most expensive operation in Spark, involving disk I/O, network transfer, and serialisation/deserialisation.",
        "keyPoints": [
            "Introduces a stage boundary; upstream stage must complete fully before downstream tasks can read shuffle output.",
            "Generates shuffle files on local executor disk, which can fill up storage on dense workloads.",
            "`spark.sql.shuffle.partitions` (default 200) controls the number of post-shuffle partitions — over-partitioning creates small-file overhead, under-partitioning causes OOM."
        ]
    },
    {
        "id": "spark-speculative-execution",
        "term": "Speculative Execution",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "A Spark fault-tolerance feature that launches a duplicate copy of a slow (straggler) task on another executor, using whichever copy finishes first and killing the other.",
        "explanation": "When `spark.speculation=true`, the Task Scheduler periodically checks task progress. If a task is taking more than 1.5× the median task completion time (configurable via `spark.speculation.multiplier`) and at least `spark.speculation.quantile` fraction of tasks in the stage have completed, a speculative copy is launched on a different executor. This combats transient hardware or network degradation. However, speculative execution can amplify data skew problems and cause unexpected resource consumption.",
        "keyPoints": [
            "Enable with `spark.speculation=true`; tune threshold with `spark.speculation.multiplier` (default 1.5) and `spark.speculation.quantile` (default 0.75).",
            "Dangerous with non-idempotent side effects (e.g., writing to an external DB), because both copies may run simultaneously.",
            "Not a substitute for skew handling — a genuinely skewed partition will still timeout even with speculation enabled."
        ]
    },
    {
        "id": "spark-catalyst-analysis-phase",
        "term": "Catalyst Optimizer — Analysis Phase",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "The first phase of Spark's Catalyst Optimizer where unresolved logical plans are validated against the catalog to produce a resolved logical plan.",
        "explanation": "When a DataFrame or SQL query is submitted, Catalyst first constructs an Unresolved Logical Plan (AST). The Analyzer then traverses this tree and resolves identifiers — column names, table references, function names — against the catalog. If a referenced column or table does not exist, an AnalysisException is thrown at this stage. The output is a Resolved Logical Plan with all attribute types, nullabilities, and references fully bound.",
        "keyPoints": [
            "Resolves column names and table references against the Spark catalog; throws `AnalysisException` for unknown attributes.",
            "Infers and propagates data types — enabling Catalyst to catch type-mismatch errors before any data is read.",
            "Operates entirely in the driver JVM — no executor or data access occurs during this phase."
        ]
    },
    {
        "id": "spark-catalyst-physical-planning",
        "term": "Catalyst Optimizer — Physical Planning",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "The phase of Spark's Catalyst Optimizer that selects the most efficient physical execution strategy from multiple candidate plans using a cost model.",
        "explanation": "After logical optimisation, Catalyst generates multiple candidate physical plans (e.g., BroadcastHashJoin vs SortMergeJoin for a join operator) and uses statistics — row counts, column NDVs, and size estimates — to choose the cheapest plan via a cost-based optimizer (CBO). With AQE enabled, physical plan decisions can be deferred to runtime, allowing re-optimisation based on actual shuffle partition sizes. The final physical plan is then compiled to JVM bytecode via Whole-Stage CodeGen.",
        "keyPoints": [
            "CBO uses table statistics (`ANALYZE TABLE`) to pick optimal join strategies; without statistics it falls back to heuristics.",
            "AQE (Adaptive Query Execution) can override physical plan decisions at runtime based on actual shuffle sizes.",
            "The final plan is inspected with `df.explain(mode='formatted')` — reading the physical plan is a core production debugging skill."
        ]
    },
    {
        "id": "spark-whole-stage-codegen",
        "term": "Whole-Stage Code Generation",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "A Project Tungsten optimisation that compiles an entire pipeline of Spark operators into a single Java function, eliminating virtual function dispatch overhead and enabling JIT optimisation.",
        "explanation": "Traditional Volcano-model execution processes one row at a time through a tree of iterator calls, incurring heavy virtual dispatch overhead. Whole-Stage CodeGen (WSCG) collapses a sequence of operators (filter → project → aggregate) into a single tight loop of generated Java bytecode. The JVM JIT compiler can then vectorise and inline this code, achieving near hand-written performance. WSCG is visible as a star (*) icon on operator nodes in the Spark UI physical plan.",
        "keyPoints": [
            "Eliminates per-row virtual function dispatch by collapsing multiple operators into one compiled Java method.",
            "Enabled by default; disable with `spark.sql.codegen.wholeStage=false` for debugging unexpected behaviour.",
            "The star (*) prefix on operators in the Spark UI physical plan (e.g., *Filter, *HashAggregate) indicates WSCG is active."
        ]
    },
    {
        "id": "spark-tungsten-binary-format",
        "term": "Tungsten Binary Row Format (UnsafeRow)",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "Apache Spark's off-heap binary row format that stores data as raw bytes using sun.misc.Unsafe, bypassing JVM object overhead and enabling cache-efficient processing.",
        "explanation": "Traditional JVM object storage wraps each primitive in a boxed object, adding 16–32 bytes of object header overhead. Tungsten's UnsafeRow encodes a row as a contiguous byte array: a null bitset, then fixed-width fields, then offsets pointing into a variable-length section. This layout eliminates boxing, reduces GC pressure (fewer heap objects), and enables cache-line-friendly sequential access patterns. Operations like sorting and hashing can operate directly on the binary data without deserialisation.",
        "keyPoints": [
            "Stores rows as compact byte arrays off-heap using `sun.misc.Unsafe`, bypassing GC pressure entirely.",
            "Sorting and hashing operate directly on binary data without deserialisation — a 2–3× speedup for sort-heavy operations.",
            "Inspecting UnsafeRow layouts helps explain why Tungsten-era Spark significantly outperforms earlier RDD-based code."
        ]
    },
    # ── MEMORY & JVM INTERNALS ────────────────────────────────────────────
    {
        "id": "spark-unified-memory-manager",
        "term": "Unified Memory Manager",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "Spark's memory management architecture (since Spark 1.6) that allows storage and execution memory to share a single dynamic pool, with each region able to borrow from the other.",
        "explanation": "The JVM heap is divided into Reserved Memory (300MB fixed), User Memory (spark.memory.fraction complement), and the Spark Memory Pool. The Spark Memory Pool is shared between Storage (caching) and Execution (shuffle, sort, aggregation) at a configurable ratio (`spark.memory.storageFraction=0.5`). If execution pressure is high, storage memory can be evicted; if storage is idle, execution can borrow it. This dynamic boundary prevents the rigid under/over-allocation problems of the older StaticMemoryManager.",
        "keyPoints": [
            "`spark.executor.memory` sets total JVM heap; `spark.memory.fraction` (default 0.6) carves out the Spark memory pool.",
            "Execution memory is never evicted — if it cannot acquire enough memory, it spills to disk rather than evicting cached data.",
            "Storage memory CAN be evicted when execution needs more space, causing `cache()` data to be re-read from source."
        ]
    },
    {
        "id": "spark-off-heap-memory",
        "term": "Off-Heap Memory",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "Memory allocated outside the JVM heap using native OS memory, bypassing garbage collection entirely and managed explicitly by Project Tungsten's memory manager.",
        "explanation": "Off-heap memory is enabled with `spark.memory.offHeap.enabled=true` and sized with `spark.memory.offHeap.size`. Tungsten's UnsafeRow format can store data in this off-heap region, dramatically reducing GC pause times for large datasets because the JVM GC never traces this memory. Off-heap is particularly beneficial for executor-side shuffle and sort operations on large DataFrames. The total memory per executor = heap + off-heap + overhead.",
        "keyPoints": [
            "Enable with `spark.memory.offHeap.enabled=true` and `spark.memory.offHeap.size=<bytes>`.",
            "Eliminates GC pressure for Tungsten operations — critical for executors processing large, long-lived datasets.",
            "Total container memory = `spark.executor.memory` (heap) + `spark.executor.memoryOverhead` + `spark.memory.offHeap.size`."
        ]
    },
    {
        "id": "spark-memory-overhead",
        "term": "Executor Memory Overhead",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "The amount of non-heap off-JVM memory reserved per executor for native processes, Python workers, and JVM internal overhead, separate from spark.executor.memory.",
        "explanation": "When a container is allocated on YARN or Kubernetes, the total container memory = `spark.executor.memory` + `spark.executor.memoryOverhead`. The overhead defaults to `max(384MB, executor.memory × 0.1)`. It covers JVM overhead (metaspace, thread stacks, NIO buffers), Python serialisation buffers for PySpark, and native libraries. If a container exceeds its total allocation, YARN/K8s kills the container with a `Container killed by YARN for exceeding memory limits` error — one of the most common production failures.",
        "keyPoints": [
            "Default overhead: `max(384MB, 10% of spark.executor.memory)` — increase for PySpark workloads (Python process adds ~256MB).",
            "Container OOM from YARN/K8s means the container exceeded `executor.memory + memoryOverhead`; increase overhead first.",
            "Separate from Python worker memory in PySpark — `spark.executor.pyspark.memory` sets the Python process size explicitly."
        ]
    },
    {
        "id": "spark-storage-level-memory-disk",
        "term": "Storage Level: MEMORY_AND_DISK",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "A Spark cache storage level that stores partitions in JVM heap memory and spills remaining partitions to local executor disk if memory is insufficient.",
        "explanation": "When `df.persist(StorageLevel.MEMORY_AND_DISK)` is called, Spark attempts to hold all partitions in executor memory. If the storage memory pool is exhausted, the LRU (least-recently-used) partitions are serialised and written to the executor's local disk (configured via `spark.local.dir`). Subsequent reads of spilled partitions incur disk I/O overhead but are faster than recomputing from scratch. This is the recommended level for large iterative workloads where recomputation is expensive.",
        "keyPoints": [
            "Preferred over `MEMORY_ONLY` for DataFrames that exceed available executor memory — avoids full recomputation.",
            "Spilled partitions are deserialized from local disk on re-access — factor in disk I/O latency vs recomputation time.",
            "Always call `df.unpersist()` when the cached DataFrame is no longer needed to free both memory and disk space."
        ]
    },
    {
        "id": "spark-gc-g1gc",
        "term": "G1GC Garbage Collector in Spark",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "The Garbage-First (G1) GC is the recommended JVM garbage collector for Spark executors, offering predictable pause times and better heap region management than the older ParallelGC.",
        "explanation": "Spark executors are long-lived JVM processes that cycle between allocation-heavy shuffle phases and cache-heavy storage phases. G1GC divides the heap into equal-sized regions (typically 1–32MB) and collects the most garbage-dense regions first, enabling shorter and more predictable pause times. The key tuning levers for Spark are `-XX:G1HeapRegionSize`, `-XX:InitiatingHeapOccupancyPercent` (lower to trigger GC earlier and avoid full GCs), and `-XX:MaxGCPauseMillis`. GC overhead limit exceeded errors indicate the JVM is spending >98% of time in GC.",
        "keyPoints": [
            "Set via `spark.executor.extraJavaOptions=-XX:+UseG1GC -XX:G1HeapRegionSize=16m -XX:InitiatingHeapOccupancyPercent=35`.",
            "`GC overhead limit exceeded` error means >98% CPU spent in GC — reduce data size, increase executor memory, or enable off-heap.",
            "Enable GC logging (`-verbose:gc -XX:+PrintGCDetails`) and examine Spark UI Executor tab GC time column to diagnose issues."
        ]
    },
    {
        "id": "spark-spill-to-disk",
        "term": "Spill to Disk",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "The mechanism by which Spark writes in-progress shuffle or sort buffers to executor local disk when execution memory is insufficient to hold all intermediate records.",
        "explanation": "During shuffle write or sort operations, Spark accumulates records in an in-memory buffer (ExternalSorter or ExternalAppendOnlyMap). When the buffer exceeds available execution memory, a spill is triggered: the buffer is sorted and written to a temporary spill file on the local disk (`spark.local.dir`). At the end of the task, all spill files are merged into the final shuffle file. Multiple spills per task compound the performance impact because each spill requires a full sort pass and sequential disk write/read.",
        "keyPoints": [
            "Visible in Spark UI Stages tab as 'Shuffle Spill (Memory)' and 'Shuffle Spill (Disk)' columns — high values indicate memory pressure.",
            "Increasing `spark.executor.memory` or reducing `spark.sql.shuffle.partitions` (fewer, larger partitions use less shuffle memory overhead) reduces spills.",
            "Local NVMe SSDs reduce spill impact dramatically compared to network-attached EBS/Azure Managed Disks."
        ]
    },
    {
        "id": "spark-broadcast-variable",
        "term": "Broadcast Variable",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "A Spark mechanism to efficiently distribute a read-only value (e.g., a lookup table or configuration map) to every executor once, stored in executor memory for reuse across all tasks.",
        "explanation": "Without broadcast variables, closures captured inside transformations are serialised and sent with every individual task — causing significant network overhead for large objects. A broadcast variable is distributed via BitTorrent-like P2P protocol once per executor (not once per task), stored in executor memory, and referenced by tasks in that executor without re-serialisation. The primary use case is broadcasting small-to-medium dimension tables (up to hundreds of MBs) for map-side joins or lookup enrichment.",
        "keyPoints": [
            "Created with `sc.broadcast(value)`; accessed inside tasks via `bvar.value` — never serialize large objects in task closures.",
            "Distributed once per executor node (not per task), reducing network overhead from O(tasks) to O(executors).",
            "Destroy when done with `bvar.unpersist()` or `bvar.destroy()` to free executor memory; failure to do so causes memory leaks."
        ]
    },
    {
        "id": "spark-accumulator",
        "term": "Accumulator",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "A Spark shared variable that allows tasks running on executors to additively update a counter or collection, which the driver can then read — used for diagnostics and monitoring.",
        "explanation": "Accumulators support associative and commutative operations (sum, count, set union) so updates from multiple tasks can be safely merged. Common uses include counting parse errors, tracking skipped records, or measuring conditional code paths. Critically, accumulators are only guaranteed to be updated exactly once per task in actions — in transformations (lazy), updates may occur multiple times due to recomputation or speculation. Reading accumulator values inside transformations is therefore unreliable.",
        "keyPoints": [
            "Only reliable inside actions — in lazy transformations, recomputation can cause accumulator updates to be counted multiple times.",
            "Create named accumulators (`sc.accumulator(0, 'error_count')`) to make them visible in the Spark UI Stages tab.",
            "Not a substitute for production metrics — use structured logging or streaming metrics for production-grade observability."
        ]
    },
    # ── PYSPARK API INTERNALS ──────────────────────────────────────────────
    {
        "id": "spark-py4j-gateway",
        "term": "Py4J Gateway",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "The bridge technology used by PySpark to enable Python processes to communicate with the JVM-based Spark driver, translating Python API calls into JVM method invocations over a local socket.",
        "explanation": "When a PySpark application starts, a Python process and a JVM process are launched side by side. The Python process connects to the JVM via a Py4J GatewayServer on localhost (default port 25333). Every Python DataFrame API call (e.g., `df.filter(...)`) is serialised as a Py4J RPC call that invokes the equivalent Java/Scala Spark API. The JVM then executes the Catalyst plan natively. Data movement between Python and JVM only occurs during actions like `collect()` or when Python UDFs require row-by-row serialisation.",
        "keyPoints": [
            "Python API calls are thin RPC stubs; Catalyst planning and execution happen entirely in the JVM — Python overhead is low for DataFrame API.",
            "Row-by-row Python UDFs force data to cross the Py4J boundary for each row — use Pandas UDFs (Arrow-based) for 10–100× better throughput.",
            "Spark Connect (Spark 3.4+) replaces Py4J with gRPC, enabling fully remote clients without a local JVM process."
        ]
    },
    {
        "id": "spark-pandas-udf-scalar",
        "term": "Pandas UDF — SCALAR Type",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "A vectorised PySpark UDF that receives a batch of column values as a Pandas Series, applies a Python function, and returns a Pandas Series — using Apache Arrow for efficient zero-copy data transfer.",
        "explanation": "Traditional Python UDFs in PySpark process one row at a time, serialising each row through Py4J and deserialising in Python — incurring ~10–100× overhead vs native functions. Scalar Pandas UDFs use Apache Arrow to batch-transfer entire column chunks between the JVM and Python process as memory buffers, bypassing row-by-row serialisation. The function signature is `def my_udf(col: pd.Series) -> pd.Series`. Batch size is controlled by `spark.sql.execution.arrow.maxRecordsPerBatch` (default 10,000).",
        "keyPoints": [
            "Defined with `@pandas_udf(returnType, PandasUDFType.SCALAR)` or the modern `@pandas_udf(returnType)` decorator.",
            "Arrow-based batch transfer gives 10–100× throughput vs row-by-row Python UDFs for compute-intensive transformations.",
            "Still slower than native `pyspark.sql.functions` — prefer built-ins; use Pandas UDFs only when no native equivalent exists."
        ]
    },
    {
        "id": "spark-pandas-udf-grouped-map",
        "term": "Pandas UDF — GROUPED_MAP Type",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "A PySpark UDF pattern that receives an entire partition group (keyed by groupBy columns) as a Pandas DataFrame, applies arbitrary Python/Pandas logic, and returns a Pandas DataFrame — enabling per-group custom transformations.",
        "explanation": "GroupedMap UDFs (also known as `applyInPandas` in modern Spark) are used when complex, group-scoped operations are needed that cannot be expressed with built-in aggregation functions — such as within-group normalisation, per-segment ML model scoring, or time-series resampling. Each partition's data for a given key is materialised as a full Pandas DataFrame in Python memory. Critically, if a single key group has too many rows, it can cause OOM on the executor Python process since all rows for that key must fit in memory simultaneously.",
        "keyPoints": [
            "Modern API: `df.groupBy('key').applyInPandas(func, schema)` — the function receives and returns a `pd.DataFrame`.",
            "All rows for a single key group must fit in Python executor memory — high-cardinality keys with millions of rows will cause Python OOM.",
            "Use `mapInPandas` for partition-level (not group-level) operations to avoid the groupBy shuffle cost."
        ]
    },
    {
        "id": "spark-pyspark-pandas-api",
        "term": "PySpark Pandas API on Spark (formerly Koalas)",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "A PySpark API that implements the pandas DataFrame interface on top of distributed Spark DataFrames, allowing pandas code to scale across a cluster with minimal code changes.",
        "explanation": "The PySpark Pandas API (available as `pyspark.pandas` since Spark 3.2, merged from the Koalas project) enables data scientists familiar with pandas to run large-scale computations without learning the Spark DataFrame API. Under the hood, pandas API calls are translated to Spark DataFrame operations. However, some pandas semantics are fundamentally incompatible with distributed computing — notably the default integer index, which requires a full shuffle to maintain ordering.",
        "keyPoints": [
            "Import with `import pyspark.pandas as ps`; use `ps.from_pandas(df)` or `ps.read_csv(path)` to create Spark-backed pandas DataFrames.",
            "Set `ps.set_option('compute.default_index_type', 'distributed')` to avoid expensive shuffle-based default index maintenance.",
            "Not all pandas operations are supported — check `ps.missing.unsupported_functions` for a list of unimplemented APIs."
        ]
    },
    {
        "id": "spark-window-function",
        "term": "Spark Window Function",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "A Spark SQL operation that performs calculations across a set of rows logically related to the current row (a 'window'), without collapsing the result into a single aggregate row.",
        "explanation": "Window functions in PySpark are defined using a `WindowSpec` that specifies partitionBy (which rows form a window), orderBy (sort order within the window), and an optional frame (ROWS or RANGE bounds). Common functions include RANK, DENSE_RANK, ROW_NUMBER, LAG, LEAD, SUM, AVG. A critical production gotcha: if no frame is explicitly specified, aggregate functions use an unbounded default frame that may not behave as expected, and RANK/LAG require orderBy to produce deterministic results.",
        "keyPoints": [
            "Always specify an explicit frame for aggregate window functions: `Window.rowsBetween(Window.unboundedPreceding, Window.currentRow)`.",
            "Window functions require a shuffle on the `partitionBy` key — large cardinality partition keys cause excessive shuffle overhead.",
            "LAG/LEAD without explicit `orderBy` return non-deterministic results; Spark will not raise an error but output is undefined."
        ]
    },
    {
        "id": "spark-structtype-schema",
        "term": "StructType & Explicit Schema",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "The programmatic way to define the schema of a Spark DataFrame using StructType and StructField objects, avoiding the cost and risks of automatic schema inference from data.",
        "explanation": "Schema inference (used by default when reading JSON or CSV) requires Spark to scan the entire dataset (or a sample) to guess column types, adding latency and risking type mismatches (e.g., an integer column with one null inferred as string). Explicit schemas defined with StructType eliminate inference overhead and provide schema-on-read enforcement. In production Delta Lake or Parquet pipelines, the schema is always declared in code to ensure idempotent, type-safe reads.",
        "keyPoints": [
            "Define with `StructType([StructField('col', StringType(), nullable=True), ...])` — pass as `schema=` to `spark.read`.",
            "Prevents costly full-scan schema inference on large files; also enforces exact types rather than Spark's conservative type promotion.",
            "For complex nested data, use `ArrayType(StructType(...))` and `MapType(StringType(), IntegerType())` for full type fidelity."
        ]
    },
    # ── JOIN STRATEGIES & SHUFFLE ──────────────────────────────────────────
    {
        "id": "spark-sort-merge-join",
        "term": "Sort Merge Join (SMJ)",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "Spark's default join strategy for large-to-large table joins, where both datasets are shuffled by join key, sorted, and merged partition-by-partition on executor cores.",
        "explanation": "SMJ involves three phases: (1) Shuffle both DataFrames by join key hash so matching keys land on the same partition; (2) Sort each partition by join key; (3) Merge-scan matching sorted partitions. SMJ is robust for any dataset size but incurs full shuffle cost for both tables. It is chosen when both tables exceed the broadcast threshold and bucket joins are not available. SMJ performance is dominated by shuffle I/O and sort time.",
        "keyPoints": [
            "Two full shuffles + two sorts per join — the most expensive strategy but scales to arbitrarily large datasets.",
            "Optimised when both tables are pre-bucketed on the join key with the same bucket count — eliminates the shuffle phase entirely.",
            "Visible in Spark UI physical plan as `SortMergeJoin`; look for high `shuffle write` bytes to identify SMJ cost."
        ]
    },
    {
        "id": "spark-shuffle-hash-join",
        "term": "Shuffle Hash Join (SHJ)",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "A Spark join strategy that shuffles both tables by join key and builds an in-memory hash table from the smaller side of each partition to probe with the larger side.",
        "explanation": "SHJ is similar to BroadcastHashJoin but operates at partition level rather than broadcasting the whole table. After shuffling, for each matching pair of partitions, the smaller partition is loaded into a hash map and the larger partition is probed row by row. SHJ avoids the sort phase of SMJ but requires each partition of the build side to fit in executor memory — if this fails, it causes an executor-side OOM. Spark prefers SMJ over SHJ for safety unless the optimizer has high confidence in partition sizes.",
        "keyPoints": [
            "Chosen when one side is small enough per partition but too large to broadcast across the whole cluster.",
            "OOM risk: if the build-side partition exceeds executor execution memory, the executor crashes without spilling.",
            "Can be forced with `spark.sql.join.preferSortMergeJoin=false`; Spark 3.x AQE may switch to SHJ dynamically."
        ]
    },
    {
        "id": "spark-bucket-join",
        "term": "Bucket Join",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "A Spark join optimisation that eliminates shuffle entirely by pre-bucketing both tables on the join key with the same number of buckets, co-locating matching keys on the same partitions.",
        "explanation": "When two Spark tables are created with `df.write.bucketBy(N, 'key').sortBy('key').saveAsTable('t')`, their data is pre-partitioned and pre-sorted by key into N bucket files. A join on the same key with both tables having the same bucket count allows Spark to read matching bucket files directly on the same executor without any shuffle or sort. This can reduce join time by 5–10× for repeated large table joins. Bucket files must be Spark-managed tables (not external).",
        "keyPoints": [
            "Both tables MUST have the same number of buckets and be bucketed on the exact join key — one mismatch forces a full shuffle fallback.",
            "Saves to Hive-compatible managed tables only — Delta Lake currently does not support bucketing natively.",
            "Verify with `df.explain()` — absence of `Exchange` node between scan and join confirms the shuffle was eliminated."
        ]
    },
    {
        "id": "spark-salted-join",
        "term": "Salted Join (Skew Mitigation)",
        "category": "SPARK & DATABRICKS",
        "difficulty": "ARCHITECT",
        "definition": "A technique to handle data skew in Spark joins by appending a random integer ('salt') to skewed keys, exploding the smaller table to match, thereby distributing hot partitions across multiple executors.",
        "explanation": "When a join key is highly skewed (e.g., `customer_id=NULL` or `store_id=1` represents 80% of rows), a standard hash join routes all those rows to one partition and one executor task, causing a straggler. Salting appends `_<rand(0,N)>` to the skewed key in the larger table and cross-joins the smaller lookup table with salt values 0..N-1 so every salted key has a matching counterpart. N replicas of the small table are created, increasing its size by N×, but eliminating the straggler at the cost of additional storage.",
        "keyPoints": [
            "Salt factor N trades smaller-table storage (N× larger) against straggler reduction — N=10 splits one skewed partition into 10.",
            "AQE's automatic skew join (`spark.sql.adaptive.skewJoin.enabled=true`) handles this automatically in Spark 3.x without code changes.",
            "Filter NULL keys separately before joining and union them back — NULL-key skew is the most common production skew pattern."
        ]
    },
    {
        "id": "spark-aqe-coalescing",
        "term": "AQE Shuffle Partition Coalescing",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "An Adaptive Query Execution feature that merges small post-shuffle partitions at runtime into larger ones, eliminating the small-file and task-overhead problem from over-partitioning.",
        "explanation": "When `spark.sql.shuffle.partitions=200` (the default) is too high for a small dataset, you end up with hundreds of near-empty partitions, wasting task scheduling overhead and producing small shuffle files. AQE monitors actual shuffle sizes after each stage completes and coalesces adjacent small partitions into larger ones before the next stage starts. The target size is controlled by `spark.sql.adaptive.advisoryPartitionSizeInBytes` (default 64MB). This removes the need to manually tune `shuffle.partitions` for each query.",
        "keyPoints": [
            "Enable with `spark.sql.adaptive.enabled=true` (default true in Spark 3.2+); coalescing kicks in automatically.",
            "Target partition size: `spark.sql.adaptive.advisoryPartitionSizeInBytes` (default 64MB) — increase for memory-intensive downstream stages.",
            "Inspect AQE's decisions in the Spark UI physical plan: coalesced partitions show as `CustomShuffleReader` nodes."
        ]
    },
    {
        "id": "spark-coalesce-vs-repartition",
        "term": "coalesce() vs repartition()",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "Two Spark functions for changing partition count: coalesce() reduces partitions without a full shuffle by merging local partitions, while repartition() performs a full shuffle to evenly redistribute data across any number of partitions.",
        "explanation": "coalesce(N) reduces the partition count from M to N (N < M) by combining adjacent partitions on the same executor without a shuffle — efficient but can produce unbalanced partitions. repartition(N) performs a full shuffle hash-distributing all rows across N new partitions, guaranteeing even distribution. Use coalesce before writing small DataFrames to avoid many small files; use repartition before wide operations that need balanced partition sizes, or when increasing partition count.",
        "keyPoints": [
            "coalesce(): no shuffle, fast, but can produce skewed partitions — use only to reduce partition count before a write.",
            "repartition(): full shuffle, produces balanced even partitions — use before joins or aggregations on skewed data.",
            "repartition('col') hash-partitions by a key column — combines partition reduction with key co-location for downstream joins."
        ]
    },
    {
        "id": "spark-semi-anti-join",
        "term": "Semi Join & Anti Join",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "Spark join types that filter the left table based on existence (semi) or non-existence (anti) of matching rows in the right table, without including right-side columns in the output.",
        "explanation": "A LEFT SEMI JOIN returns only rows from the left DataFrame where at least one matching row exists in the right DataFrame — equivalent to `WHERE EXISTS (SELECT 1 FROM right WHERE right.key = left.key)`. A LEFT ANTI JOIN returns rows from the left where NO match exists in the right — equivalent to `WHERE NOT EXISTS`. Both avoid duplicating left rows (unlike a regular inner join) and can push broadcast hints on the right side for efficient filtering. These are the correct joins for existence checks.",
        "keyPoints": [
            "Semi join syntax: `left.join(right, 'key', 'left_semi')` — output columns are only from the left DataFrame.",
            "Anti join syntax: `left.join(right, 'key', 'left_anti')` — finds records in left NOT present in right (orphan detection use case).",
            "Both support broadcast hints on the right table — efficient for filtering a large table against a small exclusion/inclusion list."
        ]
    },
    # ── DELTA LAKE DEEP DIVES ─────────────────────────────────────────────
    {
        "id": "spark-delta-log-structure",
        "term": "Delta Log (_delta_log) Structure",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "The transaction log directory of a Delta table that records every change as JSON commit files, with periodic Parquet checkpoint files for efficient log replay.",
        "explanation": "Every write to a Delta table appends a new JSON file to `_delta_log/` named sequentially (00000000000000000000.json, 00000000000000000001.json, …). Each JSON file contains a set of actions: Add (new Parquet files added), Remove (files logically deleted), Metadata (schema changes), and CommitInfo (operation details). Every 10 commits, Delta writes a Parquet checkpoint file that snapshots the full table state, allowing readers to avoid replaying all JSON files from the beginning. The checkpoint + remaining JSON files constitute the current table state.",
        "keyPoints": [
            "JSON commit files are append-only and never mutated — atomicity is guaranteed by the filesystem's atomic rename operation.",
            "Checkpoint every 10 commits (configurable via `delta.checkpointInterval`) — long tables with millions of commits become slow to read without frequent checkpoints.",
            "Table metadata, schema, partitioning, and statistics are all encoded in the transaction log — the Parquet data files themselves carry no Delta metadata."
        ]
    },
    {
        "id": "spark-delta-time-travel",
        "term": "Delta Lake Time Travel",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "Delta Lake's ability to query or restore a table to any previous version or timestamp by replaying the transaction log to reconstruct the historical table state.",
        "explanation": "Delta Time Travel works because the `_delta_log` preserves a complete history of Add/Remove actions. Reading an older version reconstructs the file list by replaying log entries up to that version or timestamp. Versions are accessible via `VERSION AS OF` or `TIMESTAMP AS OF` in SQL, or the `.option('versionAsOf', N)` reader option. The data retention window is controlled by `delta.logRetentionDuration` (default 30 days) and VACUUM — running VACUUM with a short retention period permanently deletes old data files and breaks time travel for those versions.",
        "keyPoints": [
            "SQL: `SELECT * FROM my_table VERSION AS OF 5` or `TIMESTAMP AS OF '2024-01-15 10:00:00'`.",
            "PySpark: `spark.read.format('delta').option('versionAsOf', 5).load('path')`.",
            "VACUUM removes physical files older than the retention window — run `VACUUM RETAIN 168 HOURS` to keep 7 days of history minimum."
        ]
    },
    {
        "id": "spark-delta-vacuum",
        "term": "Delta Lake VACUUM",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "A Delta Lake maintenance command that physically deletes Parquet data files that are no longer referenced by any table version within the retention window.",
        "explanation": "Delta's MERGE, UPDATE, and DELETE operations logically remove files by writing Remove actions to the log but leave old Parquet files on storage. VACUUM scans the current table version to identify the live file set, then deletes all unreferenced files older than the retention threshold (default 7 days via `delta.deletedFileRetentionDuration`). A dry run (`VACUUM table DRY RUN`) lists files that WOULD be deleted. Bypassing the retention check (`spark.databricks.delta.retentionDurationCheck.enabled=false`) is dangerous — streaming or time-travel readers may still reference files being deleted.",
        "keyPoints": [
            "Default retention: 7 days (`delta.deletedFileRetentionDuration=interval 7 days`) — never lower below your longest streaming checkpoint lag.",
            "Always dry-run first: `VACUUM my_table DRY RUN` — review the file list before committing destructive deletes.",
            "Bypassing retention check (`retentionDurationCheck.enabled=false`) can break active streaming readers still pointing to old checkpoint files."
        ]
    },
    {
        "id": "spark-delta-optimize-zorder",
        "term": "Delta Lake OPTIMIZE with Z-Ordering",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "A Delta Lake maintenance operation that compacts small Parquet files (bin-packing) and optionally co-locates related data using Z-order multi-dimensional clustering to accelerate query data skipping.",
        "explanation": "OPTIMIZE without Z-ORDER performs bin-packing: it reads all small files in a partition and rewrites them into larger target-sized files (~1GB), reducing the small file problem. OPTIMIZE ZORDER BY (col1, col2) additionally applies Z-order curve interleaving, which maps multi-dimensional coordinates to a single dimension that preserves locality. Rows with similar col1+col2 values are written to the same files, enabling Delta to skip entire files based on min/max statistics during `WHERE col1=X AND col2=Y` queries.",
        "keyPoints": [
            "OPTIMIZE alone (bin-packing) targets ~1GB output files and is the primary remedy for the small file problem.",
            "Z-ORDER is effective for up to 3–4 columns — beyond that, the locality benefit degrades due to the curse of dimensionality.",
            "After OPTIMIZE ZORDER, Delta collects per-file column statistics, enabling data skipping that can reduce scan cost by 10–100×."
        ]
    },
    {
        "id": "spark-delta-liquid-clustering",
        "term": "Delta Lake Liquid Clustering",
        "category": "SPARK & DATABRICKS",
        "difficulty": "ARCHITECT",
        "definition": "A next-generation Delta Lake table layout feature that replaces partitioning and Z-Ordering with dynamic, incremental clustering that continuously optimises data layout without full rewrites.",
        "explanation": "Traditional partitioning requires upfront key selection and creates maintenance problems (too many small partitions, partition pruning misses). Z-Ordering requires a full OPTIMIZE run to take effect and doesn't adapt as query patterns change. Liquid Clustering uses Hilbert curve-based clustering to physically co-locate data by clustering keys, and crucially, OPTIMIZE only rewrites files that need updating rather than the entire table. Clustering columns can be changed at any time without rewriting existing data.",
        "keyPoints": [
            "Enable at create time: `CREATE TABLE t (...) USING DELTA CLUSTER BY (event_date, region)`.",
            "OPTIMIZE runs incrementally — only files that are not yet clustered are rewritten, making it cheap to run frequently.",
            "Clustering columns can be changed with `ALTER TABLE t CLUSTER BY (new_col)` without rewriting existing data immediately."
        ]
    },
    {
        "id": "spark-delta-cdf",
        "term": "Delta Lake Change Data Feed (CDF)",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "A Delta Lake feature that records row-level change events (INSERT, UPDATE_PREIMAGE, UPDATE_POSTIMAGE, DELETE) in a special column, enabling downstream systems to consume only changed rows.",
        "explanation": "CDF is enabled per table with `delta.enableChangeDataFeed=true`. After enabling, every DML operation (INSERT, UPDATE, DELETE, MERGE) writes change records with additional metadata columns: `_change_type` (insert/update_preimage/update_postimage/delete), `_commit_version`, and `_commit_timestamp`. Downstream pipelines read changes using `spark.read.format('delta').option('readChangeFeed', 'true').option('startingVersion', N)`. CDF is the foundation for efficient incremental ETL pipelines that avoid full-table scans.",
        "keyPoints": [
            "Enable with `ALTER TABLE my_table SET TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true')` or at creation time.",
            "UPDATE produces TWO rows per changed record: `update_preimage` (old value) and `update_postimage` (new value) — account for this in downstream consumers.",
            "CDF data is retained based on the table's `logRetentionDuration` — reading CDF beyond the retention window fails."
        ]
    },
    {
        "id": "spark-delta-schema-evolution",
        "term": "Delta Lake Schema Evolution",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "Delta Lake's ability to automatically update a table's schema when new columns are added to an incoming DataFrame, without requiring manual schema changes or failing the write.",
        "explanation": "Schema evolution is enabled by adding the option `mergeSchema=true` to a Delta write operation. When the incoming DataFrame has columns not present in the existing table schema, Delta adds those columns to the schema definition in the transaction log and writes them to new Parquet files. Existing files retain their schema (missing columns read as null). Schema evolution only supports additive changes (new columns, widening of numeric types) — removing columns or changing types is a schema enforcement violation.",
        "keyPoints": [
            "Enable per-write: `df.write.format('delta').option('mergeSchema', 'true').mode('append').save(path)`.",
            "Only additive changes allowed: new columns, nullable → not-null widening — type changes (String → Integer) fail even with mergeSchema.",
            "Set globally with `spark.databricks.delta.schema.autoMerge.enabled=true` for Databricks MERGE operations."
        ]
    },
    {
        "id": "spark-delta-merge-upsert",
        "term": "Delta Lake MERGE INTO (Upsert)",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "A Delta Lake SQL command that performs an atomic upsert — updating matched rows and inserting unmatched rows — in a single scan of both the target and source tables.",
        "explanation": "MERGE INTO resolves the idempotency requirement for incremental loads: instead of appending all records (causing duplicates) or overwriting the full table (slow), MERGE matches source rows to target rows on a key, then applies conditional UPDATE, INSERT, or DELETE actions atomically. Internally, Delta finds the set of target files that overlap with source keys, rewrites only those files, and appends the new/modified records. MERGE performance is sensitive to the number of files touched — Z-Ordering on the merge key dramatically reduces this.",
        "keyPoints": [
            "Match key cardinality matters: MERGE on a non-clustered column touches all target files — Z-ORDER on the merge key for 10–50× speedup.",
            "Insert-only MERGE (`WHEN NOT MATCHED THEN INSERT`) is an efficient deduplication pattern for CDC pipelines.",
            "MERGE generates both Add and Remove delta log actions atomically — partial failures leave the table in its pre-merge state."
        ]
    },
    {
        "id": "spark-delta-shallow-deep-clone",
        "term": "Delta Lake Shallow Clone vs Deep Clone",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "Two Delta Lake cloning strategies: shallow clone creates a new table pointing to the original's data files without copying them, while deep clone physically copies all data and log files to a new location.",
        "explanation": "Shallow Clone (`CREATE TABLE t2 SHALLOW CLONE t1`) creates a new table definition and transaction log in the target location but references the original table's Parquet files via absolute paths. It is near-instantaneous but creates a dependency — if the source table runs VACUUM and deletes files, the shallow clone breaks. Deep Clone (`CREATE TABLE t2 DEEP CLONE t1`) physically copies all Parquet and log files to the new location, creating a fully independent table. Deep clones are used for disaster recovery, cross-environment promotion, and long-lived test environments.",
        "keyPoints": [
            "Shallow clone is instant but fragile — VACUUM on the source can delete files still referenced by the clone.",
            "Deep clone is slow (copies all data) but fully independent — the clone table can be VACUUMed and modified without affecting source.",
            "Both clones are differential — a second `CREATE OR REPLACE ... DEEP CLONE` only copies new/changed files since the last clone."
        ]
    },
    # ── DATABRICKS PLATFORM ────────────────────────────────────────────────
    {
        "id": "spark-photon-engine",
        "term": "Photon Execution Engine",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "Databricks' native vectorised query execution engine written in C++, replacing Spark's JVM-based Whole-Stage CodeGen for SQL and DataFrame workloads to deliver significantly higher throughput.",
        "explanation": "Photon operates below the Spark SQL layer as an alternative physical execution engine. It uses SIMD (Single Instruction Multiple Data) CPU instructions to process entire columns of data in vectorised batches, rather than Spark's row-at-a-time virtual function dispatch or even its generated JVM bytecode. Photon is most effective for SQL-heavy workloads with large scans, aggregations, and joins on columnar Parquet/Delta data. It does not accelerate Python UDFs, Python-heavy workloads, or operations that must go through the JVM.",
        "keyPoints": [
            "Enabled by default on Databricks Runtime with Photon (DRT-photon clusters); no code changes required.",
            "Most effective for: `SELECT/GROUP BY/JOIN` over large Delta tables — can be 2–8× faster than standard Spark SQL.",
            "Does NOT accelerate: Python UDFs, PySpark-only operations, ML/DL training, or streaming micro-batch overhead."
        ]
    },
    {
        "id": "spark-unity-catalog",
        "term": "Unity Catalog",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "Databricks' unified governance layer that provides a three-level namespace (Catalog → Schema → Table/Volume), centralised access control, data lineage, and auditing across all Databricks workspaces in an account.",
        "explanation": "Unity Catalog introduces a metastore at the account level (not workspace level), enabling a single catalog to span multiple workspaces. The hierarchy is: Metastore → Catalog → Schema → Table/View/Volume. Access control is managed via SQL GRANT/REVOKE statements on each level. External Locations define allowed cloud storage paths with associated Storage Credentials. All data access is governed and logged in the audit log, enabling compliance with GDPR/HIPAA data lineage requirements.",
        "keyPoints": [
            "Three-level namespace: `catalog.schema.table` — all SQL queries and `spark.table('cat.schema.tbl')` calls must use fully qualified names.",
            "Managed tables: Delta files are stored in the Unity Catalog managed storage path — dropping the table drops the data.",
            "External tables: Delta/Parquet files at a user-managed External Location — dropping the table leaves the data files intact."
        ]
    },
    {
        "id": "spark-serverless-compute",
        "term": "Databricks Serverless Compute",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "A Databricks compute model where Databricks manages the cluster lifecycle entirely — provisioning, scaling, and terminating compute resources instantly — with per-second DBU billing and zero cluster configuration.",
        "explanation": "Traditional Databricks clusters require 2–5 minutes to start (cluster provisioning, library installation, init scripts). Serverless Compute eliminates this cold-start latency because Databricks pre-warms pools of executor VMs in its own cloud accounts, attached to customer workspaces on demand in seconds. There is no cluster configuration — runtime version and size are managed automatically. Serverless is currently available for Databricks SQL Warehouses, Notebooks, and Workflows. Billing is measured in Serverless DBUs which are priced differently from classic cluster DBUs.",
        "keyPoints": [
            "Zero cold start — compute starts in seconds, not minutes; ideal for interactive notebooks and ad-hoc SQL queries.",
            "No cluster config required — Databricks manages VM type, Spark version, and scaling automatically.",
            "Per-second billing: cost scales linearly with execution time — preferable over all-purpose clusters for sporadic workloads."
        ]
    },
    {
        "id": "spark-cluster-policies",
        "term": "Databricks Cluster Policies",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "Databricks governance constructs that define JSON-based rules restricting or fixing cluster configuration parameters, enforced when users create new clusters in a workspace.",
        "explanation": "Cluster policies are applied via the Databricks admin console or Terraform. They can fix specific parameters (e.g., `autotermination_minutes=60` always on), set allowed ranges (e.g., max worker count ≤ 10), or hide fields entirely from the UI. Policies are attached to users or groups and are a critical cost control mechanism in enterprise environments — preventing engineers from accidentally spinning up GPU clusters or disabling auto-termination. Policies can also inject mandatory init scripts, environment variables, or Spark configurations.",
        "keyPoints": [
            "Policy type `fixed` locks a value; `allowlist` restricts to specific values; `range` sets min/max for numeric fields.",
            "Attach to users or groups via workspace admin panel — engineers see only policy-compliant options in the cluster creation UI.",
            "Use policies to enforce: mandatory auto-termination, instance type allowlists, mandatory cluster tags (for cost allocation), and init script paths."
        ]
    },
    {
        "id": "spark-instance-pool",
        "term": "Databricks Instance Pools",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "A Databricks feature that maintains a pool of pre-provisioned, idle VM instances that clusters can attach to immediately, dramatically reducing cluster start time from minutes to seconds.",
        "explanation": "Without instance pools, every cluster start triggers cloud-provider VM provisioning (EC2/Azure VM), which takes 3–5 minutes. An Instance Pool pre-allocates and keeps a configurable number of idle VMs in a stopped state (not running Spark), so they are available for immediate attachment. When a cluster is created from a pool, VMs are available in under 30 seconds. Idle pool VMs incur VM compute costs (not DBU costs) — set `idle_instance_autotermination_minutes` to control idle billing.",
        "keyPoints": [
            "Reduces cluster start from 3–5 minutes to 15–30 seconds — critical for job clusters that start frequently.",
            "Idle pool instances incur VM compute cost (cloud provider) but NOT Databricks DBU cost.",
            "Best practice: create one pool per instance type per workspace; set idle termination to avoid paying for unused pre-warmed instances."
        ]
    },
    {
        "id": "spark-databricks-secrets",
        "term": "Databricks Secrets",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "A Databricks-managed key-value secret store that securely injects sensitive values (API keys, connection strings, passwords) into notebooks and job runs without exposing them as plaintext.",
        "explanation": "Secrets are stored in Secret Scopes, which can be Databricks-backed or Azure Key Vault-backed. Access is controlled by ACLs on the scope level. In notebooks and jobs, secrets are retrieved via `dbutils.secrets.get(scope='my-scope', key='my-key')` — the returned string is masked in notebook output and never logged. Secrets can also be injected as cluster Spark configuration values or environment variables, making them accessible to init scripts and library configurations.",
        "keyPoints": [
            "Retrieve with `dbutils.secrets.get('scope', 'key')` — Databricks automatically redacts the value if it appears in output.",
            "Azure-backed scopes link to an Azure Key Vault DNS name — a single Key Vault can back multiple workspaces.",
            "Never log, print, or assign secrets to non-secret variables — Databricks redacts values only in the original `dbutils.secrets.get()` return context."
        ]
    },
    # ── PRODUCTION & PERF PATTERNS ─────────────────────────────────────────
    {
        "id": "spark-driver-oom",
        "term": "Driver OutOfMemory (OOM)",
        "category": "SPARK & DATABRICKS",
        "difficulty": "ARCHITECT",
        "definition": "A fatal Spark application failure where the driver JVM process exhausts its heap memory, typically caused by collecting large results, broadcasting oversized DataFrames, or accumulating large metadata.",
        "explanation": "The driver JVM runs the application main() function, maintains the DAG scheduler, and stores broadcast variable data. Driver OOMs have three primary causes: (1) `df.collect()` on a large DataFrame — pulls all rows into driver memory; (2) `spark.sql.autoBroadcastJoinThreshold` set too high, causing a table larger than driver memory to be broadcast; (3) Metadata explosion — a Delta table with millions of small files causes the Delta log replay to consume excessive driver memory. Driver OOM shows as `java.lang.OutOfMemoryError: Java heap space` in the driver log.",
        "keyPoints": [
            "Never call `collect()` on large DataFrames — use `take(N)`, `show()`, or write to storage instead.",
            "Set broadcast threshold conservatively: `spark.sql.autoBroadcastJoinThreshold=50m` — driver must hold the entire broadcast table in memory.",
            "Increase driver heap: `spark.driver.memory=8g`; separate from executor memory and not proportional to data volume."
        ]
    },
    {
        "id": "spark-executor-oom",
        "term": "Executor OutOfMemory (OOM)",
        "category": "SPARK & DATABRICKS",
        "difficulty": "ARCHITECT",
        "definition": "A Spark task failure where an executor JVM process runs out of heap memory during task execution, typically caused by data skew, oversized joins, or insufficient shuffle partition count.",
        "explanation": "Executor OOMs occur when a single task attempts to process more data than the available execution memory allows. Root causes include: (1) Data skew — one partition has 100× more rows than average, overwhelming a single executor; (2) Cartesian product — accidental cross-join explodes row count; (3) `groupBy` + `collect_list()` — collecting all values for a key into a list can produce massive arrays; (4) Too few shuffle partitions — `spark.sql.shuffle.partitions=10` with 10TB of data creates 1TB partitions that don't fit in memory. Fix by increasing partitions, enabling AQE skew handling, or adding salting.",
        "keyPoints": [
            "Diagnose via Spark UI Stages tab: look for tasks with disproportionately large 'Input Size' compared to others (data skew signature).",
            "`GC overhead limit exceeded` is a precursor — the executor is spending >98% in GC before the final OOM crash.",
            "Increase `spark.sql.shuffle.partitions` and enable `spark.sql.adaptive.skewJoin.enabled=true` as first-line remediation."
        ]
    },
    {
        "id": "spark-shuffle-fetch-failed",
        "term": "Shuffle Fetch Failed",
        "category": "SPARK & DATABRICKS",
        "difficulty": "ARCHITECT",
        "definition": "A Spark task failure that occurs when a downstream task cannot retrieve shuffle data from an upstream executor, typically caused by executor loss, OOM, or network partition.",
        "explanation": "After a shuffle write stage completes, downstream tasks fetch shuffle blocks from the executor's block manager (via ExternalShuffleService on Spark Standalone/YARN, or via the executor directly). If the upstream executor crashes (OOM, spot preemption, heartbeat timeout) before the downstream stage finishes, the block manager becomes unreachable and downstream tasks fail with `FetchFailedException`. Spark retries the entire upstream stage (marking it as re-submitted) and recomputes the shuffle output. If failures cascade (the re-submitted stage also fails), the job aborts after `spark.stage.maxConsecutiveAttempts` (default 4) failures.",
        "keyPoints": [
            "Root cause is almost always executor loss (OOM, spot instance eviction, disk full) during the downstream shuffle read phase.",
            "Enable External Shuffle Service (`spark.shuffle.service.enabled=true`) to decouple shuffle data from executor lifecycle.",
            "Cascading Shuffle Fetch Failed → stage retry loop is visible in Spark UI as repeated stage re-submissions — fix the underlying executor instability first."
        ]
    },
    {
        "id": "spark-predicate-pushdown",
        "term": "Predicate Pushdown",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "A Spark Catalyst optimisation that moves filter conditions as close to the data source as possible, reducing the amount of data read from storage before processing begins.",
        "explanation": "Predicate pushdown is applied by Catalyst during physical planning. For Parquet and Delta files, filters on partition columns enable partition pruning (entire directories skipped). Filters on non-partition columns use Parquet row group statistics (min/max) to skip row groups without reading them. For JDBC sources, filter predicates are translated into SQL WHERE clauses sent to the database, reducing network transfer. Delta's data skipping extends this further using per-file column statistics from the transaction log.",
        "keyPoints": [
            "Verify pushdown with `df.explain()` — look for `PushedFilters` in the scan operator; if absent, the filter runs post-read.",
            "Partition pruning (most powerful): `WHERE date='2024-01-15'` on a table partitioned by `date` skips entire directories.",
            "Delta data skipping uses transaction log min/max statistics to skip files even for non-partitioned columns — requires Z-ORDER or Liquid Clustering for full effect."
        ]
    },
    {
        "id": "spark-partition-pruning",
        "term": "Partition Pruning",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "A Spark read optimisation that skips entire partition directories in storage when a query's WHERE clause exactly matches or narrows the partitioning key, avoiding unnecessary I/O.",
        "explanation": "When a Delta or Parquet table is partitioned by a column (e.g., `date`), data is stored in sub-directories like `date=2024-01-15/`. If a query filters on that column (`WHERE date='2024-01-15'`), Spark's file listing only opens the matching directories, completely bypassing all other partitions. Partition pruning is the most powerful single optimisation for large time-series tables — a query touching 1 day out of 3 years of data reads 0.09% of the total files. However, over-partitioning (too many small partitions) creates file listing overhead that exceeds the benefit.",
        "keyPoints": [
            "Most impactful when query cardinality is low relative to partition count (1 day filter on 1000-day table = 0.1% I/O).",
            "Over-partitioning anti-pattern: partitioning by high-cardinality columns (user_id with 10M users) creates 10M directories — file listing overhead dominates.",
            "Dynamic Partition Pruning (DPP, Spark 3.x): pushes runtime dimension filter results into fact table partition list for star-schema queries."
        ]
    },
    {
        "id": "spark-dynamic-partition-overwrite",
        "term": "Dynamic Partition Overwrite",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "A Spark write mode that overwrites only the partitions present in the incoming DataFrame, leaving partitions not touched by the current write intact.",
        "explanation": "Standard `write.mode('overwrite')` on a partitioned table drops and rewrites ALL partitions, even those not in the current DataFrame. Dynamic Partition Overwrite (`spark.sql.sources.partitionOverwriteMode=dynamic`) changes this: only partitions represented in the data being written are overwritten, while all other partitions remain untouched. This is critical for incremental daily loads — writing only today's data should not delete historical partitions. Enable globally or per-write: `df.write.option('partitionOverwriteMode', 'dynamic').mode('overwrite')`.",
        "keyPoints": [
            "Enable globally: `spark.conf.set('spark.sql.sources.partitionOverwriteMode', 'dynamic')` or per-write via option.",
            "Without this, a daily `mode('overwrite')` on a partitioned table silently deletes ALL historical partitions — a critical data loss bug.",
            "Not available for Delta tables in this form — Delta's `replaceWhere` option provides equivalent targeted partition overwrite semantics."
        ]
    },
    {
        "id": "spark-external-shuffle-service",
        "term": "External Shuffle Service",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "A long-running service on each worker node that serves shuffle blocks independently of executor JVM processes, allowing executors to be removed during dynamic scaling without losing shuffle data.",
        "explanation": "Without the External Shuffle Service, shuffle blocks are served directly by executor JVM processes. When dynamic allocation scales down or a spot instance is reclaimed, the executor is terminated — destroying its shuffle blocks and causing Shuffle Fetch Failed errors in downstream stages. The External Shuffle Service (`spark.shuffle.service.enabled=true`) is a separate daemon that persists shuffle data to local disk and serves it even after its associated executor is removed, enabling safe executor scale-down during multi-stage jobs.",
        "keyPoints": [
            "Required for Dynamic Resource Allocation (`spark.dynamicAllocation.enabled=true`) — without it, scaling down kills shuffle data.",
            "Runs as a separate service on each worker node (YARN NodeManager auxiliary service, K8s sidecar); survives executor JVM restarts.",
            "On Databricks, the External Shuffle Service is enabled and managed automatically — no manual configuration required."
        ]
    },
    {
        "id": "spark-dynamic-resource-allocation",
        "term": "Dynamic Resource Allocation",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "A Spark feature that automatically scales executor count up and down based on workload demand, adding executors during high parallelism needs and releasing idle executors to the cluster manager.",
        "explanation": "With `spark.dynamicAllocation.enabled=true`, Spark monitors the task queue and executor idle time. When tasks are queued, new executor requests are made to the cluster manager. When executors are idle for `spark.dynamicAllocation.executorIdleTimeout` (default 60s), they are released. Scale-down requires the External Shuffle Service to preserve shuffle data. Databricks clusters with autoscaling use this feature under the hood, scaling between `min_workers` and `max_workers` based on stage parallelism.",
        "keyPoints": [
            "Requires External Shuffle Service — without it, executor removal loses shuffle data and causes stage re-runs.",
            "On Databricks, autoscaling is the UI-level configuration; internally it uses Dynamic Resource Allocation + Databricks-managed scaling heuristics.",
            "Tune `spark.dynamicAllocation.schedulerBacklogTimeout` to delay scale-up for burst avoidance on short-lived task queues."
        ]
    },
    {
        "id": "spark-data-skipping",
        "term": "Delta Lake Data Skipping",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "A Delta Lake read optimisation that uses per-file min/max column statistics stored in the transaction log to skip Parquet files entirely when their value ranges cannot contain query filter values.",
        "explanation": "When Delta writes Parquet files, it computes column-level statistics (min, max, null count) for the first 32 columns by default and stores them in the `_delta_log` JSON entries. At query time, the Delta scan reads these statistics and evaluates filter predicates against them: if a file's max(date) is 2024-01-01 and the query has `WHERE date > 2024-06-01`, the file is entirely skipped without opening it. Z-Ordering maximises data skipping effectiveness by clustering related rows into the same files, tightening the min/max ranges per file.",
        "keyPoints": [
            "Statistics are collected for first 32 columns by default; adjust with `delta.dataSkippingNumIndexedCols` table property.",
            "Effectiveness depends on data clustering — random-order data has wide min/max ranges that rarely allow skipping.",
            "Z-ORDER or Liquid Clustering tightens per-file min/max ranges, enabling data skipping to skip 90%+ of files for selective queries."
        ]
    },
    {
        "id": "spark-schema-enforcement",
        "term": "Delta Lake Schema Enforcement",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "Delta Lake's default behaviour that rejects writes where the incoming DataFrame schema does not match the table's registered schema, preventing silent data corruption from schema drift.",
        "explanation": "Unlike Parquet (schema-on-read) or Hive (permissive appends), Delta enforces schema at write time. If a DataFrame being written has extra columns, missing columns, or type incompatibilities, Delta throws `AnalysisException: A schema mismatch detected when writing to the Delta table`. This prevents the most common data quality issue in data lake environments: source systems silently adding or renaming columns. The only way to change the schema is via explicit `ALTER TABLE` or by enabling `mergeSchema`.",
        "keyPoints": [
            "Default Delta behaviour — no configuration needed; rejections appear as `AnalysisException` before any data is written.",
            "Intentionally breaks pipelines when schema changes — forces engineers to explicitly acknowledge and handle schema evolution.",
            "Override for additive changes only with `.option('mergeSchema', 'true')` — does not allow column removal or type narrowing."
        ]
    },
    {
        "id": "spark-explain-plan",
        "term": "EXPLAIN Plan (Spark Query Plan)",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "A Spark debugging tool that displays the logical and physical execution plan for a DataFrame or SQL query, enabling engineers to verify optimisations, diagnose performance issues, and understand data flow.",
        "explanation": "The EXPLAIN command outputs up to four plan representations: Parsed Logical Plan (raw AST), Analyzed Logical Plan (resolved), Optimized Logical Plan (after Catalyst rules), and Physical Plan (actual execution operators). `df.explain(mode='formatted')` outputs a tree showing operators with their key metrics (pushed filters, join strategy, exchange nodes). Reading the physical plan reveals whether broadcast joins, predicate pushdown, and data skipping are applied. `df.explain(mode='cost')` shows CBO statistics used for plan selection.",
        "keyPoints": [
            "Mode options: `simple` (physical plan only), `extended` (all 4 plans), `formatted` (tree format, most readable), `cost` (with CBO stats).",
            "Look for `Exchange` nodes (shuffles) and `Sort` nodes — minimising these is the primary join optimisation goal.",
            "SQL equivalent: `EXPLAIN EXTENDED SELECT ...` or `EXPLAIN FORMATTED SELECT ...` in a SQL cell or JDBC query."
        ]
    },
    {
        "id": "spark-cte",
        "term": "Common Table Expression (CTE) in Spark SQL",
        "category": "SPARK & DATABRICKS",
        "difficulty": "EASY",
        "definition": "A named temporary result set defined within a WITH clause in Spark SQL that can be referenced multiple times in the same query, improving readability and enabling recursive queries.",
        "explanation": "CTEs in Spark SQL are syntactic sugar — by default, Catalyst inlines the CTE definition at each reference point rather than materialising it once. This means a CTE referenced five times is computed five times unless explicitly cached. For expensive intermediate computations referenced multiple times, it is better to create a temporary view or call `df.cache()` rather than relying on CTE materialisation. In newer Spark/Databricks versions, CTE materialisation hints are being added to address this behaviour.",
        "keyPoints": [
            "Syntax: `WITH cte_name AS (SELECT ...) SELECT * FROM cte_name` — purely syntactic, not automatically materialised.",
            "CTE referenced multiple times is recomputed each reference by default — use `CREATE OR REPLACE TEMP VIEW` + cache for expensive intermediates.",
            "Recursive CTEs (`WITH RECURSIVE`) are supported in Spark 3.x for graph traversal and hierarchical data flattening."
        ]
    },
    {
        "id": "spark-heartbeat-timeout",
        "term": "Executor Heartbeat Timeout",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "A Spark executor failure condition where the driver stops receiving heartbeat signals from an executor within the configured timeout window, causing the driver to declare the executor dead and reschedule its tasks.",
        "explanation": "Executors send periodic heartbeat messages to the driver (default every `spark.executor.heartbeatInterval=10s`). If the driver receives no heartbeat for `spark.network.timeout` (default 120s), it marks the executor as lost, removes it from the active executor list, and re-queues all running tasks. Heartbeat timeouts are commonly caused by: (1) severe GC pauses (executor JVM stops the world for >120s); (2) network partition; (3) disk I/O blocking the executor thread pool; (4) spot instance preemption before shutdown signal arrives.",
        "keyPoints": [
            "Root cause diagnosis: check Spark UI executor tab for GC time >90% — long GC pauses block heartbeat threads.",
            "Increase timeout carefully: `spark.network.timeout=600s` gives more tolerance but delays detection of genuinely dead executors.",
            "Pattern: Heartbeat Timeout → Executor Lost → Shuffle Fetch Failed cascade — fix the root cause (GC/disk/skew) not the timeout."
        ]
    },
    {
        "id": "spark-zombie-worker",
        "term": "Zombie Worker",
        "category": "SPARK & DATABRICKS",
        "difficulty": "ARCHITECT",
        "definition": "A Databricks/Spark executor node that has been declared dead by the driver (due to heartbeat timeout or network partition) but continues running tasks in isolation, causing double-execution and potential data corruption.",
        "explanation": "A zombie worker scenario occurs when a network partition isolates an executor from the driver — the driver declares it dead and reassigns its tasks to other executors, but the isolated executor continues running. Both the zombie and the replacement execute the same task. For idempotent operations (count, filter, read), this is harmless — the duplicate result is discarded. For non-idempotent operations (JDBC writes, external API calls, append-mode writes), the zombie causes duplicate records. Zombie workers are terminated when the network partition heals and the executor discovers its heartbeats were rejected.",
        "keyPoints": [
            "Cause: network partition or severe GC pause isolates executor from driver without triggering OS-level process termination.",
            "Protect against zombies: ensure all write operations are idempotent (MERGE/OVERWRITE instead of APPEND for external sinks).",
            "Detection: Spark UI shows the same task attempt number (e.g., attempt 0 and attempt 1) both in RUNNING state simultaneously."
        ]
    },
    {
        "id": "spark-lazy-evaluation",
        "term": "Lazy Evaluation",
        "category": "SPARK & DATABRICKS",
        "difficulty": "EASY",
        "definition": "Spark's core computation model where transformations are not executed immediately when defined, but are recorded as a logical plan and only computed when an action triggers execution.",
        "explanation": "When you call `df.filter(...).groupBy(...).agg(...)`, Spark records these operations as a DAG of transformations without executing any computation. Only when an action such as `count()`, `collect()`, `show()`, `write()`, or `save()` is called does Spark compile the DAG, optimise the plan via Catalyst, and dispatch tasks to executors. Lazy evaluation enables Catalyst to see the entire computation pipeline holistically and apply end-to-end optimisations that would be impossible if each operation executed eagerly.",
        "keyPoints": [
            "Transformations are lazy (filter, select, join, groupBy); Actions are eager and trigger execution (count, collect, show, write).",
            "Catalyst sees the full pipeline before execution — enabling whole-pipeline optimisations like predicate pushdown and join reordering.",
            "Accidental action calls inside loops re-trigger full DAG execution — cache DataFrames used repeatedly to avoid redundant recomputation."
        ]
    },
    {
        "id": "spark-rdd-lineage",
        "term": "RDD Lineage Graph",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "The directed acyclic graph of transformations recorded for an RDD that allows Spark to reconstruct lost partitions by replaying only the transformations needed, rather than storing full data copies.",
        "explanation": "Every RDD maintains a reference to its parent RDD(s) and the transformation that created it. This chain forms the lineage graph. When a partition is lost (due to executor failure), Spark traverses the lineage graph to identify the narrowest ancestor that can be recomputed, then recomputes only the lost partition from that ancestor. This provides fault tolerance without HDFS-style replication. The trade-off is that very long lineage chains (hundreds of transformations) make recomputation expensive — breaking the lineage with `checkpoint()` or `persist()` at strategic points is a production practice.",
        "keyPoints": [
            "Provides fault tolerance without data replication — Spark recomputes lost partitions from ancestors via the lineage graph.",
            "Very long lineage (e.g., 1000-step iterative ML) causes full-chain recomputation on failure — use `df.checkpoint()` to truncate lineage.",
            "Inspect with `df.rdd.toDebugString()` — shows the full RDD lineage tree including parent dependencies and partition counts."
        ]
    },
    {
        "id": "spark-small-file-problem",
        "term": "Small File Problem",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "A performance anti-pattern where a Delta/Parquet table accumulates thousands of tiny files, causing excessive file listing overhead, driver memory pressure during metadata operations, and poor read throughput.",
        "explanation": "Small files arise from frequent small writes: streaming micro-batches, hourly partition appends, or MERGE operations that touch many partition files and write tiny result files. Reading a table with 100,000 files × 1MB each is slower than reading a table with 100 files × 1GB each — even though total data is identical — because the driver must list all 100,000 files, load their footer metadata, and schedule 100,000 tasks. The remedies are OPTIMIZE (compaction), Liquid Clustering (prevents fragmentation), and tuning `spark.sql.files.maxRecordsPerFile` on write.",
        "keyPoints": [
            "Symptoms: slow `DESCRIBE DETAIL`, high driver CPU during query planning, Spark UI showing thousands of small input tasks.",
            "Fix: `OPTIMIZE my_table` (compaction to ~1GB files); run periodically via scheduled Databricks Job.",
            "Prevention: avoid streaming + Delta unless using Auto Loader with trigger.availableNow; use `coalesce()` before writes to control file count."
        ]
    },
    {
        "id": "spark-auto-loader",
        "term": "Databricks Auto Loader",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "A Databricks-native structured streaming source that incrementally ingests new files from cloud storage (S3/ADLS/GCS) as they arrive, using directory listing or file notification events to detect new files efficiently at scale.",
        "explanation": "Traditional `spark.readStream.format('parquet').load(path)` uses directory listing to detect new files — this becomes a bottleneck at millions of files because listing S3 objects is an API call with rate limits. Auto Loader (`format('cloudFiles')`) supports two discovery modes: (1) Directory Listing — scans storage incrementally, suitable for smaller volumes; (2) File Notification — subscribes to cloud storage event notifications (S3 EventBridge, Azure Event Grid) to receive real-time file arrival events with near-zero latency and no listing overhead. Auto Loader maintains a checkpoint of processed files to ensure exactly-once semantics.",
        "keyPoints": [
            "Use `format('cloudFiles').option('cloudFiles.format', 'parquet')` — specify the underlying file format separately.",
            "File Notification mode (`cloudFiles.useNotifications=true`) handles billions of files with no listing overhead — requires cloud storage event subscription setup.",
            "Schema evolution: Auto Loader with `cloudFiles.inferColumnTypes=true` detects new columns and can merge them into the target Delta table automatically."
        ]
    },
    {
        "id": "spark-streaming-checkpoint",
        "term": "Structured Streaming Checkpoint",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "A directory on durable storage where Spark Structured Streaming records the state of a streaming query — including offsets consumed and micro-batch progress — enabling recovery after failures without reprocessing.",
        "explanation": "Every Structured Streaming query must have a checkpoint directory (`option('checkpointLocation', 'path')`). At each micro-batch, Spark writes the source offsets (Kafka offset, S3 file list) to the checkpoint before processing, and the committed offsets after successful write. On restart, the query reads the checkpoint to determine where to resume processing, skipping already-processed data. The checkpoint also stores streaming state (for stateful operations like watermarking and sessionisation). Deleting or corrupting the checkpoint forces a full restart from the earliest available data.",
        "keyPoints": [
            "Set with `.option('checkpointLocation', 'dbfs:/checkpoints/my-stream')` — must point to durable storage (DBFS, ADLS, S3).",
            "Never delete or reuse a checkpoint directory for a different query — mismatched checkpoints cause incorrect state recovery.",
            "Schema changes to the streaming source or query require manual checkpoint migration or a full restart from the beginning of the source."
        ]
    },
    {
        "id": "spark-watermark",
        "term": "Structured Streaming Watermark",
        "category": "SPARK & DATABRICKS",
        "difficulty": "HARD",
        "definition": "A Spark Structured Streaming mechanism that defines how late an event can arrive and still be included in a windowed aggregation, enabling Spark to clean up state for windows that are no longer expected to receive late data.",
        "explanation": "In event-time streaming, events can arrive out of order due to network delays. Without a watermark, Spark must keep state for every window indefinitely (unbounded state growth). A watermark tells Spark that events more than X time units late relative to the latest event seen can be dropped. State for windows that have passed the watermark threshold is purged from memory. Watermarks are defined with `withWatermark('event_time', '10 minutes')` and used with `groupBy(window('event_time', '1 hour')).agg(...)` to produce windowed aggregates.",
        "keyPoints": [
            "Define with `.withWatermark('event_time', '10 minutes')` — events arriving >10 min late are dropped from the window aggregate.",
            "Required for stateful operations (dropDuplicates, mapGroupsWithState) to prevent unbounded state accumulation.",
            "Watermark threshold is a data-quality trade-off: too tight (drop valid late data), too loose (large memory state, slow processing)."
        ]
    },
    {
        "id": "spark-parquet-columnar",
        "term": "Parquet Columnar Storage",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "An Apache Parquet file format that stores data column-by-column rather than row-by-row, enabling highly efficient compression and selective column reads for analytical workloads.",
        "explanation": "In row-oriented formats (CSV, Avro), all column values for a single record are stored contiguously. In Parquet, all values of a single column are stored contiguously in column chunks within row groups. This enables: (1) Highly efficient compression — similar data types within a column compress much better than mixed-type row data; (2) Column projection pushdown — reading only the selected columns' data, skipping the rest; (3) Vectorised decoding — reading a column of integers as a contiguous byte array for CPU-efficient SIMD decoding.",
        "keyPoints": [
            "Column projection: `df.select('a', 'b')` on a 100-column Parquet table reads only 2 columns' data from disk, not all 100.",
            "Compression: Parquet with Snappy/Zstd typically achieves 3–10× compression ratio vs raw CSV — choose Zstd for better ratio, Snappy for speed.",
            "Row group size (`parquet.block.size`, default 128MB) controls read parallelism — each row group maps to one Spark task input split."
        ]
    },
    {
        "id": "spark-avro-format",
        "term": "Apache Avro Format in Spark",
        "category": "SPARK & DATABRICKS",
        "difficulty": "MEDIUM",
        "definition": "A row-oriented binary serialisation format used in Kafka/streaming pipelines and schema-registry-integrated workflows, supported in Spark via the spark-avro library.",
        "explanation": "Avro stores data row-by-row with an embedded JSON schema in the file header, making it self-describing and ideal for schema evolution in event streaming. Unlike Parquet (column-oriented), Avro reads all columns in every row — making it less efficient for analytical SELECT queries that touch only a few columns. However, Avro's row-orientation and compact binary encoding make it the standard for Kafka message serialisation and real-time streaming pipelines. In Spark, Avro is read via `spark.read.format('avro')` or the Confluent Schema Registry with `from_avro()`/`to_avro()` functions.",
        "keyPoints": [
            "Use Avro for Kafka/streaming ingestion (row-oriented is natural for event records); use Parquet/Delta for analytical storage.",
            "Schema evolution: Avro supports adding nullable fields with defaults, backward/forward compatible schemas — defined in the Schema Registry.",
            "Confluent integration: `from_avro(col, schemaRegistryUrl)` deserialises Kafka Avro messages inline in PySpark streaming pipelines."
        ]
    },
]

existing_terms = {item['term'].lower().strip() for item in data}

added = 0
skipped = 0
for e in new_entries:
    term_key = e['term'].lower().strip()
    if e['id'] in existing_ids or term_key in existing_terms:
        print(f"SKIP (duplicate id/term): {e['id']} / {e['term']}")
        skipped += 1
    else:
        existing_ids.add(e['id'])
        existing_terms.add(term_key)
        data.append(e)
        added += 1

with open(FILE, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print(f"After: {len(data)} (Added: {added}, Skipped: {skipped})")
