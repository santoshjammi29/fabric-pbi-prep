import json

spark_part2 = []

# Niche 7: Structured Streaming & Arbitrary Stateful Processing (15 questions)
streaming_qas = [
    ("Explain the internal execution differences between the Micro-Batch Processing Engine and the Continuous Processing Engine in Structured Streaming.",
     "1. Micro-Batch Engine: Processes data streams as a continuous sequence of small batch queries. It updates offsets, executes standard Catalyst plans, commits to StateStore, and writes checkpoint logs. Latency: 10ms - 100ms.\n\n"
     "2. Continuous Processing Engine: Bypasses micro-batching. Worker tasks run continuously, polling records from sources and writing directly to sinks. Epoch markers are injected into the data stream to coordinate checkpoints. Latency: sub-millisecond, at the expense of limited support for stateful operations (like outer joins or aggregations)."),
    
    ("How does the StateStore architecture work under the hood? Contrast the memory consumption and operational profiles of the HDFSBackedStateStore Provider versus the RocksDBStateStore Provider.",
     "1. HDFSBackedStateStore: Stores state records in-memory in JVM Java Map structures on the executors. Commits write changes to HDFS/S3 as delta logs. Memory: High JVM heap consumption, vulnerable to OOMs and large GC pauses when states grow to millions of keys.\n\n"
     "2. RocksDBStateStore: Stores state in a local, native RocksDB instance on the executor's local SSD. Bypasses the JVM heap completely, caching state off-heap. Memory: Extremely stable JVM heap footprint. Out-of-memory errors are prevented for large-scale states (e.g., TB-scale), though point-lookups incur minor JNI overhead."),
    
    ("Walk through the exact recovery protocol of a stateful streaming query when it reads from a multi-partition Kafka topic using a write-ahead log (WAL) and metadata checkpoints.",
     "1. Checkpoint Read: On restart, Spark reads the `metadata` and `offsets` directories in the checkpoint path to identify the target batch ID and starting Kafka partition offsets.\n\n"
     "2. State Reload: The StateStore coordinator reloads the corresponding state files from the checkpoint directory, mapping the RocksDB/HDFS state back to the exact transaction boundary.\n\n"
     "3. Re-execution: Spark queries Kafka starting from the committed offsets. The stream re-runs the micro-batch, merges inputs with the reloaded states, commits changes to the offset WAL, and writes a commit marker, guaranteeing exactly-once transactional state recovery."),
    
    ("Detail the internal mechanics of Watermarking. How does Spark calculate the global watermark across multiple concurrent event-time streams with lagging partitions?",
     "1. Metric Tracking: During task execution, Spark monitors the maximum event time observed across all partitions of the stream.\n\n"
     "2. Global Calculation: At the end of each micro-batch, executors report their local maximum event times to the driver. The driver computes the global maximum and subtracts the watermark delay: `Watermark = Max(EventTime) - DelayThreshold`.\n\n"
     "3. Pruning: The driver broadcasts this watermark to the next micro-batch. All rows with event time < watermark are pruned from state storage, keeping state sizes bounded."),
    
    ("Explain the execution flow, memory tracking, and serialization/deserialization cycles of flatMapGroupsWithState and mapGroupsWithState in a production environment.",
     "1. Execution Flow: Spark groups rows by key. The `StateStore` retrieves the existing state. The engine runs the user-defined function passing the key, active values iterator, and the state handle.\n\n"
     "2. Serialization: State values are serialized using `ExpressionEncoder` to fit in the StateStore. When the function accesses state, it deserializes the byte arrays into Java objects. Changes are serialized back. memory tracking is critical: holding intermediate states in large JVM object pools during iteration causes heap bloat."),
    
    ("What happens internally when a stateful streaming query experiences \"Watermark Delay Inversion\" due to an upstream clock skew across global regions?",
     "1. Inversion cause: Clock skew on IoT devices causes a region to emit timestamps far in the future. (2) Consequence: The future timestamp inflates the driver's calculated `Max(EventTime)`. The global watermark rises prematurely. (3) Data Loss: Normal data arriving from other regions falls below the inflated watermark and is discarded as late data, causing silent data loss."),
    
    ("Explain how the OffsetLog and CommitLog maintain exactly-once processing guarantees in Structured Streaming sinks.",
     "1. OffsetLog: Driver writes the start offsets of batch $N$ to the WAL before execution begins. (2) Execution: Spark processes the batch. (3) CommitLog: Once the sink confirms the batch write is committed, the driver writes a commit marker for batch $N$ to the CommitLog. (4) Recovery: If a failure occurs before commit, Spark re-runs batch $N$, checking the logs to prevent duplicate writes in idempotent sinks."),
    
    ("How does Spark handle late-arriving data in an Append output mode versus an Update output mode at the physical execution layer?",
     "1. Append Mode: Rows are only outputted when they fall below the watermark (meaning they can never change again). Retains all states until watermark expiration, delaying output. (2) Update Mode: Outputs modified keys immediately on every micro-batch. State is updated, but only expired keys are pruned, reducing output latency for downstream consumers."),
    
    ("What causes a StateStoreOOMException, and what low-level configurations do you adjust inside RocksDB (e.g., block cache size, arena block size) to prevent it?",
     "1. Cause: Exhausting off-heap memory allocations due to RocksDB caching too many state files. (2) Tuning: Configure RocksDB parameters via Spark properties: (a) Set `spark.sql.streaming.stateStore.rocksdb.blockCacheSizeMB` to a lower value (e.g., 64MB) to restrict caching. (b) Decrease write buffer size and configure compaction threads to free direct memory allocations."),
    
    ("Detail the physical plan transformations that occur when performing a Stream-Stream Join. How does Spark manage the dual state lifecycles for both sides of the join?",
     "1. Physical Plan: The planner inserts a `SymmetricHashJoinExec` node. (2) Dual States: Spark maintains two separate state stores (one for Left, one for Right). (3) Lifecycle: When a row arrives, it is appended to its side's state. The engine queries the opposing side's state to match keys. Rows are retained in states until event-time watermarks expire, cleaning both stores concurrently."),
    
    ("Explain the internal threading architecture of the KafkaSourceProvider. How does it map Kafka consumer threads to Spark execution tasks?",
     "1. Thread Mapping: Spark tasks run parallel executors. Each task maps to a set of Kafka partitions. (2) Consumer Pool: Instead of creating a new consumer thread per task, Spark maintains a cached pool of `KafkaConsumer` instances per executor. Tasks retrieve consumers from the pool, fetch offset ranges sequentially, and process them in task threads, minimizing thread context switches."),
    
    ("How do you perform a safe zero-downtime schema evolution or state transformation migration on a production state store checkpoint without losing historical state data?",
     "1. State Migrator: Write a offline Spark job using the State Reader API. Read the checkpoint state files directly. (2) Schema Translation: Map old columns to the new schema format. (3) Writeout: Write the translated state records back as a new checkpoint version, allowing the streaming application to restart from the new path without state loss."),
    
    ("What is the impact of setting a very low spark.sql.streaming.forceDeleteTempCheckpointLocation threshold on cloud storage API rate limits?",
     "1. Low Threshold: Forces Spark to delete temp directories immediately on batch commit. (2) API Storm: Under 10s trigger intervals, millions of DELETE calls are sent to S3/ADLS. This exhausts object storage API rate limits (SlowDown errors), degrading overall pipeline health."),
    
    ("Explain how the IncrementalExecution class plans the execution of a streaming micro-batch, and how it tracks state variation across batch IDs.",
     "1. Planning: `IncrementalExecution` subclasses `QueryExecution`. It injects state-planning strategies into the Catalyst pipeline. (2) Tracking: Appends state info (batch ID, transaction state) to the physical plan operators. This ensures that physical stateful readers fetch files matching the current micro-batch epoch."),
    
    ("How does a streaming query handle self-joins? What are the precise constraints and state-tracking mechanisms involved?",
     "1. Constraints: Both join sides must define event-time column attributes and watermarks. (2) State Tracking: Spark maintains two separate state mappings for the same table. It tracks matches across both instances, using watermark offsets to prevent infinite state growth on self-join matches.")
]

# Niche 8: Delta Lake Internals & Storage Engine Architectures (15 questions)
delta_qas = [
    ("Explain the exact anatomical structure and parsing sequence of the Delta Lake Transaction Log (_delta_log). How does Delta guarantee ACID transactions over Amazon S3 or ADLS Gen2?",
     "1. Log Anatomy: Stored under `_delta_log/` as sequential JSON commit files (`000000.json`, `000001.json`). Contains table metadata, file add/remove actions, and transaction markers.\n\n"
     "2. ACID guarantees: Delta uses optimistic concurrency. When writing, it prepares changes, writes the JSON file, and registers the version in the catalog. On S3 (which lacks put-if-absent), Delta uses an external lock manager or DynamoDB log store to guarantee atomic, sequential commits, preventing write overrides."),
    
    ("Walk through the internal conflict resolution matrix of Delta Lake when a concurrent UPDATE and a concurrent OPTIMIZE operation commit exactly at the same millisecond.",
     "1. Conflict check: Delta uses Optimistic Concurrency Control (OCC). (2) Evaluation: The `UPDATE` transaction adds and removes files containing modified rows. The `OPTIMIZE` transaction merges small files into larger ones. (3) Resolution: Since `OPTIMIZE` does not change data logically, Delta merges the commits. It updates the `UPDATE` file list to point to the newly compacted files instead of the old small files, resolving the conflict dynamically without failures."),
    
    ("How does Delta Lake's Log Reconstruction work? Explain the role of checkpoint .checkpoint.parquet files and how the driver reads them to construct the current state of a table.",
     "1. Reconstruction: To find the active file list at version $N$, the driver locates the last checkpoint file (e.g., `000010.checkpoint.parquet`).\n\n"
     "2. Parsing: It reads the checkpoint file to get the base file state. Then, it reads subsequent JSON logs (e.g., 11 to $N$) and applies add/remove file details sequentially, reconstructing the table state quickly without parsing millions of older JSON logs."),
    
    ("Detail the structural and storage difference between Z-Ordering (Space-Filling Curves) and Liquid Clustering at the file and metadata block layers.",
     "1. Z-Ordering: Arranges data in multidimensional space along a Morton curve. Physically rewrite Parquet files to group similar attributes. Bounded to 3-4 columns. (2) Liquid Clustering: Decouples physical partitions. Uses dynamic clustering keys written to file metadata headers. Spark clusters data dynamically at write-time, allowing online changes to clustering keys without rewriting older partitions."),
    
    ("How does Delta Lake's Column Propagation and Data Skipping? What exact statistical metadata is collected per file, and how does the file-skipping algorithm interact with the Catalyst optimizer?",
     "1. Statistics: Delta collects min, max, and null counts for the first 32 columns of each Parquet file, saving them in the JSON log. (2) Skipping: During query compilation, the Catalyst optimizer evaluates the filter (e.g., `id = 5`) against these min/max stats. It drops files whose ranges do not contain the key, pruning files before execution."),
    
    ("Explain the internal mechanics of the Delta VACUUM command. How does it safely distinguish between uncommitted stale files and active reader files within the retention period?",
     "1. VACUUM execution: Scans the physical directory and compares files against active transaction log files. (2) Safety check: Keeps files younger than the retention threshold (default 168 hours). Files that are not registered in the log and exceed the threshold are deleted, protecting concurrent queries from `FileNotFoundExceptions`."),
    
    ("What is the performance penalty and internal metadata overhead of a \"Delta Merge\" operation? Explain the difference between the 1-pass and 2-pass merge algorithms under the hood.",
     "1. 2-Pass Merge (Standard): Pass 1 locates the target files containing rows matching the merge condition. Pass 2 joins the target files with the source data and rewrites the modified files. High write-amplification. (2) 1-Pass Merge: Optimizes by performing the join and write operations in a single stage using dynamic bucketing, reducing I/O but consuming more cluster memory."),
    
    ("How does Delta Lake handle schema enforcement versus schema evolution at the transaction log level? Trace the validation code paths.",
     "1. Enforcement: Spark writes data. Delta validates schema against the log metadata. If columns differ, it throws an `AnalysisException`. (2) Evolution: If `mergeSchema` is enabled, Delta updates the table schema in the JSON commit log, appending new field types to the metadata state and allowing subsequent writes to proceed."),
    
    ("Detail how Delta Lake's CDF (Change Data Feed) captures and stores pre-image, post-image, and row-deleted metadata on disk.",
     "1. CDF Storage: Enabled via table properties. (2) Capture: During updates/deletes, Delta writes the changes to a separate `_change_data` directory. It outputs files containing the `before` state (pre-image), `after` state (post-image), and `delete` attributes, allowing consumers to query incremental changes."),
    
    ("What are the metadata and storage implications of running an OPTIMIZE command with a target file size that contradicts the underlying storage tier block size?",
     "1. Size Mismatch: If `OPTIMIZE` compiles files to 1GB, but the cloud storage bucket performs best with 128MB blocks, query engines must execute fragmented range-requests. This triggers S3 rate limits and spikes tail latency due to high network socket reads."),
    
    ("How does Delta Lake implement Idempotent Writes for streaming sinks using application IDs and epoch tracking?",
     "1. Idempotency: The streaming sink registers the Spark App ID and batch epoch ID in the Delta transaction log during commit. (2) Check: If the app retries a batch, Delta checks the log. If the application ID and batch epoch match an existing commit, it skips the write, preventing duplicates."),
    
    ("Explain the architectural difference between shallow clones and deep clones in Delta Lake from an operational file-pointer perspective.",
     "1. Shallow Clone: Creates a new table referencing the physical Parquet paths of the source table in the metadata log. Fast and low storage cost. (2) Deep Clone: Copies both the metadata logs and the physical Parquet data files to the target path, creating a completely independent copy of the dataset."),
    
    ("How do you optimize a Delta table experiencing \"De-serialization/Metadata Bottleneck\" where reading the transaction log takes longer than processing the actual data payload?",
     "1. Optimization: (a) Run `OPTIMIZE` to reduce file counts. (b) Adjust checkpoint frequencies (`delta.checkpointInterval`). (c) Enable metadata caching on the query coordinator, and run `VACUUM` to purge old transaction logs, keeping the log tree slim."),
    
    ("What is the impact of configuring delta.logRetentionDuration and delta.deletedFileRetentionDuration on the performance of short-lived point-in-time time-travel queries?",
     "1. Retention impact: Shortening retention duration (e.g., to 1 day) cleans transaction logs and physical files fast, reducing storage costs. (2) Time-travel loss: Prevents querying snapshots older than the duration, as the metadata files and physical blocks are deleted, causing time-travel requests to fail."),
    
    ("How does Delta Lake interface with the hive metastore or Unity Catalog to synchronize catalog schemas without inducing race conditions?",
     "1. Synchronization: Delta writes metadata to the transaction log first. (2) Catalog sync: After commit, the writer triggers an API call updating the Unity Catalog or Hive Metastore pointer. The catalog remains a wrapper pointing to Delta's log, preventing race conditions since the log is the single source of truth.")
]

# Niche 9: Databricks Photon Engine & Architecture Optimization (10 questions)
photon_qas = [
    ("Explain the fundamental structural difference between the JVM execution layer of standard Spark and the C++ native execution layer of the Photon Engine.",
     "1. Standard Spark: Executes Java bytecode inside the JVM heap. Subject to JVM garbage collection, object header overhead, and memory virtualization.\n\n"
     "2. Photon Engine: A C++ native engine that executes query plans outside the JVM. It communicates via JNI, allocating off-heap buffers and executing SIMD operations directly on hardware, bypassing JVM overhead and GC pauses completely."),
    
    ("How does Photon handle memory management? Explain how the Photon memory manager operates outside the JVM heap and how it negotiates resource sharing with the host OS.",
     "1. Off-Heap Management: Photon allocates memory directly from the OS using custom C++ allocators. (2) Resource Negotiation: It communicates with Spark's `TaskMemoryManager` via JNI. Photon requests memory pages, tracks allocations, and yields memory back to the JVM if heap tasks demand space, preventing host OS OOM kills."),
    
    ("In what explicit scenarios (operators, data types, or expressions) will Photon silently deactivate and delegate execution back to the classic Spark JVM engine?",
     "1. Silently Deactivate: Photon falls back to Spark JVM if: (a) The plan contains complex User-Defined Functions (UDFs) that cannot compile to native code. (b) The schema contains unsupported data types (like nested Maps or custom objects). (c) The query uses advanced XML/JSON parsing functions not ported to C++."),
    
    ("How does Photon optimize vectorized execution? Detail how it structures CPU registers and memory alignments to process columnar batches via JNI.",
     "1. Columnar Batches: Photon aligns column values in contiguous memory pages (vectors). (2) JNI transfer: Passes memory addresses to C++ loops. (3) Vectorization: The C++ loops load vectors into CPU registers, executing math or filter operations in parallel using SIMD instructions, maximizing CPU cache efficiency."),
    
    ("Explain how the Databricks I/O cache (formerly Delta Cache) differs from native Spark execution memory storage, specifically regarding NVMe acceleration and page-level eviction.",
     "1. Spark Storage Memory: Caches data as deserialized JVM objects or serialized blocks in RAM. (2) Databricks I/O Cache: Caches raw Parquet columns directly on local NVMe SSDs in uncompressed format. It uses page-level LRU eviction and memory-mapped files, bypassing heap memory and speeding up scans."),
    
    ("What are the internal architectural implications of running PySpark UDFs on a Databricks cluster where the execution core is fully vectorized via Photon?",
     "1. Vectorization break: PySpark UDFs require data to be serialized and sent to Python workers. (2) Photon penalty: Photon must stop native execution, convert native vectors back to JVM rows, serialize them for Python, collect outputs, and rebuild vectors, creating severe JNI bottlenecks."),
    
    ("How does the Photon engine accelerate complex aggregation operations containing high cardinality grouping sets?",
     "1. Native Hash Map: Photon uses a C++ native hash table that optimizes key-value layouts in memory cache lines. (2) Speed: Key lookups are executed using hardware-level comparison loops, bypassing object creation and sorting loops typical of JVM aggregates."),
    
    ("Describe the performance profile of Photon when handling string-heavy manipulation operations using SIMD instruction sets.",
     "1. String Vectorization: Photon stores strings in flat contiguous character buffers. (2) SIMD scans: Uses instruction sets (e.g., AVX2) to search, compare, or parse multiple character offsets simultaneously, speeding up regex and substring operations by up to 5x over Java String loops."),
    
    ("How do you analyze a Photon execution plan from the Spark UI? Detail the specific metrics (photonTime, photonRowModifiers) that validate CPU efficiency.",
     "1. Plan view: In the Spark UI DAG, look for gold-colored nodes named `PhotonGroupingAgg` or `PhotonProject`. (2) Metrics: `photonTime` shows the percentage of time spent in native C++ execution. High `photonTime` and low `photonRowModifiers` indicate optimal native processing without JNI serialization overhead."),
    
    ("What is the interplay between Photon execution and Databricks Serverless Compute architectures regarding initialization cold-starts and resource scaling?",
     "1. Serverless: Photon's pre-compiled C++ library is packaged in the serverless container image. (2) Initialization: Cold-starts are minimal because it bypasses JVM classloader warmups. During scaling, Photon worker nodes start executing native streams instantly, optimizing pay-per-second costs.")
]

# Niche 10: PySpark Internals, Serialization & JNI Bridges (10 questions)
pyspark_qas = [
    ("Detail the complete architecture of the PySpark execution model. Trace the communication loop across the Py4J gateway, the JVM Spark Context, and the Python Worker daemon processes via pipes.",
     "1. Driver Phase: PySpark driver uses `Py4J` to instantiate JVM objects. (2) Worker Spawning: The JVM executor spawns a Python Worker daemon on each machine. (3) Data Loop: During execution, the JVM executor streams partition data to the Python worker via Unix pipes. The Python worker processes the records (e.g., running UDFs) and writes results back to the JVM executor over the pipe."),
    
    ("Explain how Apache Arrow vectorization (spark.sql.execution.arrow.pyspark.enabled) dramatically reduces serialization costs compared to standard Pickle serialization.",
     "1. Pickle Serialization: PySpark serializes objects row-by-row into Python bytes. Extremely CPU-heavy. (2) Arrow Vectorization: Arrow shares memory layouts between JVM and Python workers. It serializes column batches into contiguous memory buffers, reducing JNI overhead and serialization costs to near zero."),
    
    ("Walk through the internal execution flow of a PySpark pandas_udf (Vectorized UDF). How is data batched, chunked, and moved across the JVM/Python memory boundaries?",
     "1. Chunking: Spark splits input partitions into Arrow record batches. (2) Stream: The JVM streams these batches to the Python worker. (3) Pandas conversion: PyArrow converts the buffers directly into Pandas Series/DataFrames. The UDF runs, outputs Pandas arrays, and PyArrow serializes them back to the JVM, maintaining vectorization."),
    
    ("What happens when a Python worker process crashes due to a segmentation fault or out-of-memory error? How does the parent JVM task manager intercept the failure and report metrics?",
     "1. Interception: The JVM executor monitors the OS pipe. If the Python worker process crashes, the pipe throws a `BrokenPipeException` or exit code. (2) Task fail: The executor catches this, marks the task as failed, increments the fail count, and reports the traceback to the driver, triggering task retries."),
    
    ("Explain the performance difference between a PySpark SQL built-in function, a Hive UDF, a Python native UDF, and a Scala/Java UDF registered in PySpark.",
     "1. SQL Built-in (Fastest): Runs natively in the JVM (often vectorized/Photon). (2) Scala/Java UDF: Runs inside the JVM, fast but lacks Catalyst optimizations. (3) Python native UDF (Slowest): Forces data to pipe to Python workers row-by-row, incurring high serialization latency. (4) Hive UDF: Runs in JVM, moderate speed."),
    
    ("How do you programmatically configure a heap dump on OOM for distributed executors and capture it to a cloud object store for post-mortem analysis?",
     "1. JVM Flags: Set executor JVM options: `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/`. (2) Script upload: Configure an entry point or JVM script trigger: `-XX:OnOutOfMemoryError=\"/opt/upload_dump.sh\"`. The script uploads the generated dump file to S3/ADLS for developer analysis."),
    
    ("Detail the serialization overheads associated with transferring complex broadcast variables from the Python driver process down to the distributed Python executor workers.",
     "1. Driver Serialization: The Python driver serializes the variable using Pickle. (2) JVM broadcast: Py4J sends the bytes to the JVM SparkContext, which broadcasts them. (3) Worker Deserialization: Every Python worker deserializes the variable, consuming memory and CPU. To optimize, use smaller broadcast variables."),
    
    ("What are the specific memory limits and thread-safety constraints when using Python multithreading inside a mapPartitions call in PySpark?",
     "1. GIL limit: Python's Global Interpreter Lock (GIL) prevents executing multiple threads concurrently on CPU-bound tasks. (2) Memory bounds: Memory allocated by Python threads runs outside the JVM heap, competing for the container's overhead memory limits, risking OOM kills if threads allocate large buffers."),
    
    ("How does spark.python.worker.reuse modify the OS process lifecycle on individual executor machines under high task concurrency?",
     "1. Reuse disabled: Spawns a new Python process for every task. High OS fork/exec overhead. (2) Reuse enabled (Default): Keeps Python worker processes alive after task completion. Subsequent tasks reuse the active process, minimizing startup latency and resource usage."),
    
    ("Explain how the PickleSerializer handles Python closures, and what structural components of a DataFrame reference can trigger a NotSerializableException in PySpark.",
     "1. Pickle Closures: Pickle serializes functions along with their referenced variables. (2) Exception: If the closure references a non-serializable object (like a database connection, thread, or the `SparkSession` context itself), Pickle throws a `NotSerializableException`, failing task serialization.")
]

# Niche 11: Core Partitioning, RDD Lineage & Graph DAG Mechanics (10 questions)
rdd_qas = [
    ("Explain the mathematical and logical difference between repartition() and coalesce(). Trace their respective physical plans down to exchange operators and shuffle dependencies.",
     "1. repartition() (Wide): Full shuffle. Inserts a `ShuffleExchangeExec` node. Redistributes data uniformly across the specified partition count, creating wide dependencies.\n\n"
     "2. coalesce() (Narrow): Avoids shuffles by merging adjacent partitions on the same executor. Inserts a `CoalesceExec` node. (3) Partition reduction: It can only reduce partition counts. Because it uses narrow dependencies, it is fast but can cause partition data skew if records are not uniformly distributed."),
    
    ("Describe the difference between a ShuffleDependency (Wide Dependency) and a NarrowDependency (e.g., OneToOneDependency, RangeDependency). How do they dictate stage boundaries?",
     "1. Narrow Dependency: Each partition of the child RDD depends on at most one partition of the parent RDD. Maps directly within the same executor. (2) Wide Dependency: Child partitions depend on multiple parent partitions. Requires a shuffle. (3) Stage boundary: Spark's DAGScheduler breaks the lineage graph at every wide dependency, generating separate execution stages."),
    
    ("How does Spark construct the execution DAG (Directed Acyclic Graph)? Walk through how the DAGScheduler translates an RDD lineage into physical Stage and TaskSet structures.",
     "1. Lineage building: Spark tracks RDD transformations. (2) Stage grouping: On action call, `DAGScheduler` reviews the lineage. It splits the graph at shuffle boundaries into ShuffleMapStages and ResultStages. (3) TaskSets: Group tasks for each stage partition into a `TaskSet`, submitting it to the `TaskScheduler` for cluster dispatch."),
    
    ("What is the explicit behavioral consequence of a \"Broken Lineage Graph\" caused by un-persisted iterative loops (e.g., in machine learning or graph algorithms like PageRank)?",
     "1. Lineage Bloat: Every iteration appends transformations to the lineage. (2) Consequence: The DAG grows recursively. The driver spends more time parsing plans, eventually throwing a `StackOverflowError` or consuming driver heap. Resolve by calling `.persist()` or checkpointing intermediates to break the lineage."),
    
    ("Explain how CoGroupedRDD manages partitioning internally when joining three or more disparate RDDs with different partitioners.",
     "1. CoGroupedRDD: Groups values for the same key across multiple input RDDs. (2) Partitioning: It checks the partitioners. If inputs have matching partitioners, it reads partitions directly (narrow). Otherwise, it inserts shuffles to align keys into a common partitioner, merging records into key-aligned arrays."),
    
    ("How does the TaskScheduler allocate tasks to individual executors based on locality preferences (PROCESS_LOCAL, NODE_LOCAL, RACK_LOCAL, ANY)?",
     "1. Locality check: `TaskScheduler` checks where target data blocks reside. (2) Delay scheduling: It attempts to schedule tasks on executors holding the block (`PROCESS_LOCAL`). If busy, it waits (configured delay, e.g., 3s) before falling back to `NODE_LOCAL`, `RACK_LOCAL`, and finally `ANY`, balancing network costs."),
    
    ("Explain the internal mechanics of Speculative Execution (spark.speculation). How does Spark calculate the performance threshold of a slow task before spawning a speculative copy?",
     "1. Speculation Check: Evaluates tasks in a stage. If a task runs slower than the median task duration by a factor (e.g., `spark.speculation.multiplier=1.5`), and stage is 75% complete, Spark marks it as slow. (2) Double run: Spawns a duplicate task on another executor to compete with the slow task."),
    
    ("What happens at the block manager and driver communication layer when a speculative task finishes micro-seconds before the original task? How is data corruption prevented?",
     "1. Race resolution: The finishing task sends a success message to the driver. (2) Task kill: The driver registers the success, accepts the output, and issues a kill RPC command to terminate the slower task. (3) Double-commit prevention: The output directory structure ignores commits from the killed task, protecting output integrity."),
    
    ("Describe the internal data structures of StorageLevel. Explain the exact performance, memory, and CPU trade-offs of MEMORY_AND_DISK_SER_2 vs. MEMORY_ONLY.",
     "1. MEMORY_ONLY: Caches raw objects in JVM memory. Fast access, high memory use, low CPU load. (2) MEMORY_AND_DISK_SER_2: Serializes objects into byte arrays, replicates to 2 nodes, spills to disk if memory is full. Low memory use, high CPU serialization load, high network replication costs, but highly resilient."),
    
    ("How do you implement a highly optimized custom Partitioner that ensures zero data skew for a key distribution that follows a Pareto power-law distribution?",
     "1. Custom Partitioner: Inherit from `Partitioner`. Override `getPartition(key)`. (2) Implementation: Map the top high-frequency keys (the Pareto head) to their own dedicated partition IDs using a hash lookup map. Hash the remaining low-frequency keys normally, distributing skewed keys uniformly across partitions.")
]

# Niche 12: Cloud Storage Ingestion, Formats (Parquet/Orc) & Catalogs (10 questions)
cloud_qas = [
    ("Explain the internal structural layout of an Apache Parquet file (File Metadata, Row Groups, Column Chunks, Pages, Dictionaries, Bloom Filters). How does Spark exploit this layout for predicate pushdown?",
     "1. Parquet Layout: Built with: (a) Header. (b) Row Groups (contain Column Chunks). (c) Pages (data, dictionary, index). (d) File Metadata in the footer.\n\n"
     "2. Predicate Pushdown: The reader parses the footer metadata first to check column min/max ranges and Bloom filters. It skips reading entire row groups or pages whose key ranges do not match the query filters, bypassing I/O reads of non-matching blocks."),
    
    ("What is the \"Schema Evolution\" mapping mechanism inside the Parquet Reader, and what are the precise edge cases that cause runtime structural alignment mismatches?",
     "1. Schema Mapping: Maps Parquet physical columns to target DataFrame schema. (2) Edge Cases: If type widening is incompatible (e.g., float promoted to decimal without casting), or if columns are renamed and reader uses physical index positions, mapping fails with runtime alignment errors, mismatching columns."),
    
    ("Detail the performance impact of the \"Small File Problem\" on cloud object storage (e.g., S3/ADLS). How does file listing latency map to Spark driver memory consumption and query planning overhead?",
     "1. Planning Overhead: Ingesting millions of small files requires the driver to perform exhaustive `listStatus` API calls. (2) Driver Bloat: The metadata (paths, sizes) must be kept in driver heap. This bloats memory, triggers GC overhead, and query planning takes longer than actual execution. Compact files to 128MB+ to resolve this."),
    
    ("Explain how Spark SQL's file source scan handles \"Directory Partition Pruning\". How does it discover partitions without executing exhaustive cloud storage file listing APIs?",
     "1. Partition discovery: Reads the catalog table partition list instead of scanning S3. (2) Pruning: Compares the query filters against the catalog metadata. It generates scan tasks only for directories matching the filter, skipping S3 list operations for pruned partition paths."),
    
    ("What is the explicit operational difference between Hive Metastore synchronization and Unity Catalog governance from a metadata caching and planning perspective?",
     "1. HMS: Relies on manual `MSCK REPAIR TABLE` to sync. Cache is stale until reload. (2) Unity Catalog: Evaluates authorization and path mapping via a central REST API. Caches metadata with TTL. Query planners fetch fresh metadata dynamically, ensuring secure and synchronized schemas across regions."),
    
    ("Explain how spark.sql.files.maxPartitionBytes governs the ingestion phase split-generation algorithm. How does it balance task distribution across raw text files vs. compressed splittable files?",
     "1. Max Partition Bytes: Sets maximum size of a single partition task (default 128MB). (2) Split calculation: For splittable files (like Parquet or bzip2 text), Spark groups files into 128MB chunks. For non-splittable (like gzip), it assigns the entire file to a task, balancing thread load."),
    
    ("How does the internal ParquetRecordReader perform vectorized column decoding? Explain how it populates Tungsten off-heap columns directly from disk streams.",
     "1. Vectorized Decoding: Reads compressed column pages directly into off-heap columnar memory batches (`WritableColumnVector`). (2) Tungsten population: Bypasses row-by-row Java object creation. The reader writes values directly to off-heap memory addresses, maximizing CPU data cache locality."),
    
    ("What causes a FileNotFoundException during a long-running batch or streaming job over cloud storage, and how do you configure Spark's read consistency to handle it?",
     "1. Cause: An upstream process or compaction job overwrites/purges Parquet files while the running Spark task is querying them. (2) Resolution: Configure table formats (Iceberg/Delta) which maintain MVCC isolation. Set read consistency retry flags or point directories to static snapshots to prevent crashes."),
    
    ("Explain the metadata collection process of the Analyze Table command. How does Spark save and pull column-level statistics to drive CBO paths?",
     "1. Statistics gathering: `ANALYZE TABLE COMPUTE STATISTICS FOR COLUMNS` runs aggregation scans to calculate distinct counts, null counts, min, max, and histograms. (2) Save: Saves metadata to the Metastore. The Catalyst CBO reads these stats during join planning to calculate optimal plans."),
    
    ("Detail how Spark handles file serialization formats that are fundamentally non-splittable (e.g., gzip-compressed JSON or XML) during the physical scan stage.",
     "1. Non-splittable scan: Spark cannot partition the file. A single executor task must download and scan the entire file sequentially. (2) CPU Bottleneck: Causes task skew, where one task runs for hours while others are idle. Mitigate by re-compressing files using splittable codecs (like bzip2 or ZSTD).")
]

# Niche 13: Real-World Production Diagnostics & Root Cause Analysis (10 questions)
diagnostics_qas = [
    ("A cluster with 50 executors suddenly hangs at the very end of a stage with 1 task remaining active for hours. Walk through your step-by-step diagnostic procedure using metrics, thread dumps, and environmental stats to pinpoint the exact root cause.",
     "1. Task Check: Open Spark UI. Identify the active task ID and the host executor node.\n\n"
     "2. Skew check: Look at the task's 'Shuffle Read Size' and 'Shuffle Write Size'. If the task processed gigabytes of data compared to megabytes on others, a data skew is present.\n\n"
     "3. Thread Dump: Take a thread dump of the target executor. Locate the active thread. If it is stuck in `ExternalAppendOnlyUnsafeRowArray.add` or GC collection, the JVM is struggling with memory allocation during sorting.\n\n"
     "4. Environment check: Check host CPU/IO usage. If CPU is at 100% and disk write-wait is high, the executor is experiencing heavy memory page spilling, causing the hang. Enable speculation to mitigate."),
    
    ("During a large production migration, a query that ran in 10 minutes on a 10-node cluster takes 3 hours on a 100-node cluster. Detail the explicit distributed systems pathologies (e.g., scheduling overhead, connection pool collapse, metadata storms) that could cause this behavior.",
     "1. Scheduler Bottleneck: For high partition counts, scaling to 100 nodes increases the number of parallel tasks. The driver JVM gets overloaded scheduling tasks, causing latency.\n\n"
     "2. Connection Pool Collapse: 100 nodes concurrently querying the Hive Metastore or catalog database exhaust connection pools, causing task timeouts.\n\n"
     "3. Metadata Storms: Thousands of tasks executing S3 list operations concurrently trigger S3 API rate limit throttling, inflating task runtimes and slowing down queries."),
    
    ("Analyze a scenario where Spark UI reports a massive discrepancy between \"Task Deserialization Time\" and \"Executor Computing Time\". What are the low-level causes, and how do you fix them?",
     "1. Cause: High deserialization time indicates: (a) The broadcast variables are too large, and task workers spend time deserializing them. (b) The user code contains large non-serializable objects. (c) The partition count is very high, and task metadata sizes exceed actual data sizes. (2) Resolution: Reduce broadcast sizes, use Kryo serializer, and coalesce partitions to reduce task counts."),
    
    ("You notice that your streaming job experiences periodic spikes in micro-batch processing time every exactly 4 hours. How do you isolate whether this is due to cloud storage throttling, JVM token renewals, or underlying infrastructure maintenance?",
     "1. Isolation steps: (a) Correlate timestamps with CloudTrail logs. If 503 SlowDown errors spike at that time, it is storage throttling. (b) Inspect executor JVM security logs. If spikes align with Kerberos ticket renewals (typically 4 hours), it is auth latency. (c) Check host VM logs (dmesg) to identify underlying hypervisor maintenance cycles."),
    
    ("Explain how you diagnose a silent data corruption error where an optimized query returns incorrect row counts, but running the query with spark.sql.optimizer.excludedRules returns the correct results.",
     "1. Diagnosis: Isolate the optimizer rule causing the error by excluding rules one-by-one: `spark.sql.optimizer.excludedRules=RuleName`. (2) Plan Compare: Compare physical plans before and after rule exclusion. Check for incorrect predicate pushdowns or incorrect projection folding on nullable columns, identifying the buggy optimization rule."),
    
    ("A high-concurrency production system reports frequent RpcTimeoutException and HeartbeatReceiver failures. Detail how you configure the Akka/Netty timeouts and bufferframes to handle this extreme state without cluster termination.",
     "1. Cause: The driver node is blocked by GC pauses or network overload, failing to respond to heartbeat RPCs in time. (2) Resolution: Increase `spark.network.timeout` to 300s and `spark.executor.heartbeatInterval` to 30s. Tune driver GC limits (using ZGC) to keep pause times under 10ms, preventing RPC timeouts."),
    
    ("How do you trace and debug a memory leak originating from a custom native C++ library loaded via JNI inside a high-throughput Spark DataFrame map operation?",
     "1. Tracing: Since native leaks occur outside the JVM heap, Java profile tools fail. (2) Profiler: Run `valgrind` or `jemalloc` on the executor host VMs. (3) Isolation: Profile memory allocations inside the worker nodes. Check for un-freed JNI pointers and missing native destructions inside the map loops, resolving off-heap memory growth."),
    
    ("Explain how you profile a driver-level memory bottleneck caused by collecting large amounts of task metrics across a job containing over 1 million individual tasks.",
     "1. Bottleneck Cause: The driver collects metrics (task duration, shuffle sizes) from all tasks. For 1M tasks, this exhausts the driver heap. (2) Profiling: Take a heap dump of the driver using `jmap`. (3) Resolution: Disable task-level metrics aggregation, decrease partition count by coalescing, and increase driver JVM heap size to hold metadata."),
    
    ("What are the diagnostic steps to resolve a Container killed by YARN for exceeding memory limits error when the executor memory parameters appear to have plenty of headroom?",
     "1. Diagnosis: (a) Check YARN NodeManager logs. Identify memory usage. (b) If JVM heap is within limits, off-heap allocations (Netty buffers, PySpark processes) are exceeding YARN overhead. (2) Resolution: Increase `spark.executor.memoryOverhead` (e.g., to 20% of executor heap) to allocate more headroom for OS-level allocations, preventing container kills."),
    
    ("Detail how you design and implement a comprehensive end-to-end telemetry pipeline using Prometheus, Grafana, and Custom OpenTelemetry Spark Listeners to capture and alert on real-time shuffle spill inflation.",
     "1. Telemetry Design: (a) Write a custom `SparkListener` that captures `onTaskEnd` metrics. (b) Export `taskMetrics.diskBytesSpilled` and `shuffleWriteMetrics` to an OpenTelemetry collector. (c) Configure Prometheus to scrape the collector. (d) Build a Grafana dashboard with alert thresholds on disk spills, sending instant alerts to Slack/PagerDuty.")
]

for idx, (q, a) in enumerate(streaming_qas):
    spark_part2.append({
        "id": f"spark-stream-{idx+1}",
        "category": "SPARK & DATABRICKS",
        "niche": "Structured Streaming & Arbitrary Stateful Processing",
        "question": q,
        "answer": a
    })

for idx, (q, a) in enumerate(delta_qas):
    spark_part2.append({
        "id": f"spark-delta-{idx+1}",
        "category": "SPARK & DATABRICKS",
        "niche": "Delta Lake Internals & Storage Engine Architectures",
        "question": q,
        "answer": a
    })

for idx, (q, a) in enumerate(photon_qas):
    spark_part2.append({
        "id": f"spark-photon-{idx+1}",
        "category": "SPARK & DATABRICKS",
        "niche": "Databricks Photon Engine & Architecture Optimization",
        "question": q,
        "answer": a
    })

for idx, (q, a) in enumerate(pyspark_qas):
    spark_part2.append({
        "id": f"spark-py-{idx+1}",
        "category": "SPARK & DATABRICKS",
        "niche": "PySpark Internals, Serialization & JNI Bridges",
        "question": q,
        "answer": a
    })

for idx, (q, a) in enumerate(rdd_qas):
    spark_part2.append({
        "id": f"spark-rdd-{idx+1}",
        "category": "SPARK & DATABRICKS",
        "niche": "Core Partitioning, RDD Lineage & Graph DAG Mechanics",
        "question": q,
        "answer": a
    })

for idx, (q, a) in enumerate(cloud_qas):
    spark_part2.append({
        "id": f"spark-cloud-{idx+1}",
        "category": "SPARK & DATABRICKS",
        "niche": "Cloud Storage Ingestion, Formats (Parquet/Orc) & Catalogs",
        "question": q,
        "answer": a
    })

for idx, (q, a) in enumerate(diagnostics_qas):
    spark_part2.append({
        "id": f"spark-diag-{idx+1}",
        "category": "SPARK & DATABRICKS",
        "niche": "Real-World Production Diagnostics & Root Cause Analysis",
        "question": q,
        "answer": a
    })

# Write spark_part2.json
with open("/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/spark_part2.json", "w") as f:
    json.dump(spark_part2, f, indent=2)

print("Spark Part 2 JSON generated successfully. Total questions:", len(spark_part2))
