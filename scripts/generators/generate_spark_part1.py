import json

spark_part1 = []

# Niche 1: Catalyst Optimizer & Query Compilation Internals (20 questions)
catalyst_qas = [
    ("How do you inject a custom physical preparation rule into the Spark Catalyst Optimizer at runtime without modifying the Apache Spark source code?",
     "1. Extension Points: Use Spark's SparkSessionExtensions framework. Register custom rules in your SparkSession configuration.\n\n"
     "2. API Injection: Call `SparkSession.builder.withExtensions(ext => ext.injectPlannerStrategy(session => new CustomStrategy()))` or use `injectResolutionRule`, `injectPostHocResolutionRule`, or `injectOptimizerRule`.\n\n"
     "3. Runtime Interception: By injecting rules into these standard hooks, Catalyst runs them automatically during analyzer/optimizer phases without editing Spark jar files directly."),
    
    ("Detail the exact behavioral and structural difference between an Expression and a LogicalPlan node in the Catalyst AST.",
     "1. Expression Node: Represents scalar valuations that evaluate to a single value given an input row (e.g., `Add`, `Substring`, `AttributeReference`). Structure: Inherits from `Expression` and only evaluates row values.\n\n"
     "2. LogicalPlan Node: Represents relation-level data operators or transformations that output schema relations (e.g., `Project`, `Filter`, `Join`). Structure: Inherits from `LogicalPlan` and defines schema, constraints, and statistical estimates.\n\n"
     "3. Evaluation Scope: Expressions process fields within individual records, while LogicalPlans structure the data stream lifecycle across partitions."),
    
    ("During query compilation, how does Catalyst handle rule execution fixed-points, and what happens architectural-wise if a custom optimization rule causes an infinite loop?",
     "1. Fixed-Points: Rules inside Catalyst are grouped into Batches. A Batch runs rules repeatedly until the plan stops changing (reaches a fixed-point) or exceeds the max iterations limit (usually 100).\n\n"
     "2. Infinite Loops: If a custom rule keeps changing the plan (e.g., flipping a projection back and forth), Catalyst will continue iterating until the max iterations threshold is reached, then log a warning and stop. If the rule bypasses standard Catalyst limits, it will hang the driver node's query compilation thread, causing JVM starvation."),
    
    ("Explain how CollapseProject and PushDownPredicates interact when dealing with non-deterministic expressions in a nested lateral view.",
     "1. CollapseProject: Merges consecutive projections into a single projection to avoid redundant evaluations.\n\n"
     "2. PushDownPredicates: Pushes filter operations beneath projects to discard rows as early as possible.\n\n"
     "3. Non-deterministic barrier: If a nested projection contains a non-deterministic expression (e.g., `rand()`), `CollapseProject` and `PushDownPredicates` will block optimization below that operator. Pushing filters past random generators would change query semantics, so Catalyst locks the evaluation order."),
    
    ("Walk through the exact code path from a user-submitted PySpark DataFrame transformation to the generation of the ExecutedPlan.",
     "1. Py4J Call: PySpark DataFrame calls trigger a Py4J request translating Python expressions into equivalent JVM `Dataset` objects.\n\n"
     "2. Logical Plans: The JVM generates an `Unresolved Logical Plan`. The `Analyzer` resolves relations against Catalog tables to produce a `Analyzed Logical Plan`.\n\n"
     "3. Optimizer & Physical planning: The Catalyst `Optimizer` runs optimization rules to output the `Optimized Logical Plan`. The `SparkPlanner` applies Strategies to convert it to a `Physical Plan`. Finally, preparation rules (like `EnsureRequirements`) run, yielding the `ExecutedPlan` ready for bytecode execution."),
    
    ("How does the CostBasedOptimizer (CBO) calculate the filter factor (selectivity) for a multi-column composite predicate with skewed data frequencies when histograms are missing?",
     "1. Selectivity Estimation: Without histograms, CBO assumes column independence and uniform distribution.\n\n"
     "2. Formula: For `colA = x AND colB = y`, the selectivity is calculated as: `Selectivity = (1 / DistinctCount(colA)) * (1 / DistinctCount(colB))`.\n\n"
     "3. Skew Fallback: If skew is present and histograms are missing, the uniform calculation severely underestimates/overestimates partition row counts, leading to poor join selections (e.g., opting for Broadcast instead of SortMerge where memory is insufficient)."),
    
    ("In what explicit scenarios will the Catalyst optimizer silently ignore a user-supplied broadcast hint, and how do you trace this failure down to the planning phase?",
     "1. Silent Ignore: Catalyst ignores broadcast hints if: (a) The join condition is an inequality (e.g., `A.id > B.id` on full outer joins). (b) The target DataFrame is a non-broadcastable source (like a streaming sink in unsupported joins).\n\n"
     "2. Tracing: Call `.explain(true)` on the DataFrame. Look at the `Parsed Logical Plan` to find the hint node (`ResolvedHint`). In the `Physical Plan`, if the node remains a `SortMergeJoinExec` instead of `BroadcastHashJoinExec`, the hint was discarded. Trace via Spark logs by enabling debug logging on `org.apache.spark.sql.execution.SparkPlanner`."),
    
    ("Explain the internal mechanics of how ConstraintPropagation infers filter predicates and how this impacts memory footprints during deep iterative graph processing.",
     "1. Constraint Propagation: Catalyst recursively extracts attributes and aliases, compiling a list of valid constraints (e.g., `colA IS NOT NULL`). If `colA = colB` and `colA > 10`, it infers `colB > 10`.\n\n"
     "2. Memory Penalty: In deep iterative graphs (e.g., ML algorithms, graph processing), Catalyst repeatedly appends these inferred constraints down the plan tree. This metadata expansion bloats the AST size, causing high driver JVM heap consumption and long garbage collection pauses."),
    
    ("How does the EliminateSubqueryAliases rule function under the hood, and how can un-aliased subqueries degrade plan caching performance?",
     "1. Alias Elimination: `EliminateSubqueryAliases` strips away logical `SubqueryAlias` wrapper nodes once analysis completes, simplifying the logical plan tree for the optimizer.\n\n"
     "2. Cache Degradation: If subqueries are not properly parsed, query structures differ logically. Spark's cache manager identifies cached data by comparing structural plan segments. Missing aliases or unique query signatures prevent matching, causing full table scan recalculations."),
    
    ("Describe the interaction between ObjectAggregationIterator and Catalyst's expression evaluation when executing highly nested struct alterations.",
     "1. ObjectAggregationIterator: Used when processing object-typed aggregations (e.g., user-defined objects or typed datasets). It holds states as Java objects.\n\n"
     "2. Expression Evaluation: When altering deeply nested structs, Catalyst must recursively deserialize the binary UnsafeRow fields into JVM objects, perform field updates, and serialize them back. This saturates the CPU cache with serialization overhead, defeating Tungsten optimizations."),
    
    ("How can you programmatically extract, isolate, and debug the optimized logical plan versus the physical plan from a blocked JVM thread stack trace?",
     "1. Thread Dump: Generate a thread dump of the driver JVM (using `jstack` or Spark UI Thread Dump).\n\n"
     "2. Search: Locate threads running `org.apache.spark.sql.execution.QueryExecution`. Extract the local variables or trace stack calls executing optimizer batch cycles.\n\n"
     "3. API call: Programmatically, wrap execution blocks with: `df.queryExecution.optimizedPlan` and `df.queryExecution.sparkPlan` to log raw plans directly to files before blocking operations begin."),
    
    ("Explain the difference between Rule[LogicalPlan] and Strategy in Spark's query execution engine.",
     "1. Rule[LogicalPlan]: Performs pattern-matching transformations to convert one logical plan to another. Runs inside the analyzer and optimizer phases, maintaining logical abstractions.\n\n"
     "2. Strategy: Translates a logical plan node into one or more physical plan execution candidates (e.g., mapping `Join` to `SortMergeJoinExec`). Runs during the physical planning phase, bridging logical definitions with actual compute iterators."),
    
    ("How does Catalyst handle type coercion and nullability propagation when compiling a full outer join on mismatched decimal precision columns?",
     "1. Type Coercion: Catalyst finds the common wider type. For decimal precision mismatches (e.g., `Decimal(10,2)` and `Decimal(12,4)`), it promotes both to a common scale/precision (e.g., `Decimal(14,4)`) before join matching.\n\n"
     "2. Nullability: Full outer joins make all output fields nullable, regardless of the source column nullability. Catalyst propagates this nullability flag down the AST, which affects subsequent filters and aggregation code compilation."),
    
    ("Under what internal conditions does the SimplifyCasts rule fail to optimize away redundant type conversions, and what is the underlying CPU overhead?",
     "1. Failure Conditions: `SimplifyCasts` fails if type casts alter semantics or data ranges (e.g., double to float, or string to integer). It also fails if cast operations are wrapped inside complex UDF expressions.\n\n"
     "2. CPU Overhead: Redundant casts bypass vectorized readers, forcing row-by-row memory allocations and type evaluation loops on executor cores, increasing execution time by up to 2x."),
    
    ("How do you write a custom analyzer rule to intercept and rewrite unresolved logical plans for multi-tenant data masking?",
     "1. Rule Extension: Inherit from `Rule[LogicalPlan]`. Override `apply(plan: LogicalPlan): LogicalPlan`.\n\n"
     "2. AST Interception: Pattern match on `UnresolvedRelation` or resolved `LogicalRelation`. Replace target columns with masking expressions (e.g., `Alias(MaskUDF(col), name)`).\n\n"
     "3. Inject rule: Register the rule in SparkSession via `injectResolutionRule` to intercept plans before optimization runs."),
    
    ("How does the Catalyst optimizer differentiate between deterministic and invariant functions when rewriting a query containing dynamic partition pruning?",
     "1. Deterministic Functions: Return the same output for a given input (e.g., `abs(x)`). These can be safely rewritten or evaluated at query planning time.\n\n"
     "2. Invariant Functions: Do not change during query execution but depend on execution state (e.g., `current_date()`). Catalyst evaluates invariant functions once at driver planning, converting them to constants to drive DPP pruning triggers on target scanning threads."),
    
    ("Explain the memory and execution plan penalties of using deeply nested CASE WHEN statements exceeding 500 conditional branches.",
     "1. Plan Penalty: Compiles into a massive nested tree of Catalyst expressions. The Catalyst optimizer spends substantial CPU cycles and memory checking matching rules recursively.\n\n"
     "2. Bytecode Penalty: Exceeds the 64KB bytecode limit of a single JVM method. Whole-stage code generation falls back to slower row-by-row interpreter evaluation, causing high driver memory consumption and garbage collection pressure."),
    
    ("Detail how ConstantFolding handles UDFs that interact with the environment (e.g., current timestamp or geography lookups).",
     "1. Constant Folding: Replaces constant expressions with evaluated literals during optimization.\n\n"
     "2. Environment UDFs: If a UDF is marked non-deterministic, `ConstantFolding` skips it. However, if it depends on static environment details (like current date), Catalyst evaluates it once during analysis at the driver and replaces the node with the static result (literal), preventing redundant evaluations on executors."),
    
    ("What are the performance and optimization implications when the Catalyst optimizer replaces a structural sort with a SortMergeJoin physical node?",
     "1. Shuffle Insertion: A `SortMergeJoin` requires both datasets to be sorted and partitioned on the join keys. If not, Spark inserts shuffle exchanges and sort nodes.\n\n"
     "2. Optimization impact: If the optimizer replaces a query's custom sort with SMJ sort requirements, it can eliminate the redundant sort step, saving compute. However, if partitioning is skewed, SMJ will trigger heavy network transfer overhead."),
    
    ("How does the physical planner translate an Aggregate logical node into a two-stage (Partial and Final) execution plan?",
     "1. Partial Stage: The planner inserts a `HashAggregateExec` with `mode = Partial`. It aggregates rows locally within each partition, outputting intermediate results.\n\n"
     "2. Shuffle & Final Stage: Inserts a shuffle exchange to group data by grouping keys. Then, inserts a `HashAggregateExec` with `mode = Final`, which consumes the shuffled intermediate values and outputs the final aggregate counts.")
]

# Niche 2: Tungsten Engine & Off-Heap Memory Architecture (25 questions)
tungsten_qas = [
    ("Explain the exact byte layout of a Tungsten UnsafeRow in memory, specifically detailing how variable-length fields and null bitmaps are packed.",
     "1. Byte Layout: A `UnsafeRow` is stored in a contiguous byte array. It consists of: (a) Null Bitmap (multiple of 8 bytes) at the start. (b) Fixed-length 8-byte word section for columns. (c) Variable-length data section.\n\n"
     "2. Field Packing: Fixed-length fields (e.g., Int, Long) store raw values directly in the 8-byte word section. Variable-length fields (e.g., String, Array) store an offset (points to the start of the variable data relative to the row start) and length packed in the 8-byte slot.\n\n"
     "3. Memory Read: The engine reads values by direct memory offsets, avoiding Java object header overhead (16 bytes) and garbage collection pressure."),
    
    ("How does Whole-Stage Code Generation (WSCG) bypass the JVM virtual method invocation overhead, and what are the precise limitations imposed by the JVM's 64KB bytecode limit per method?",
     "1. Bypassing Virtual Methods: Traditional execution loops use the Volcano iterator model (calling `.next()` on nested operators). WSCG flattens the physical plan, generating a single monolithic Java loop at runtime that processes records directly in CPU cache.\n\n"
     "2. JVM 64KB Limit: Java methods cannot exceed 64KB of bytecode. If a physical plan is complex (deep projections, many fields), WSCG compiles code exceeding this limit. This triggers a compiler failure. Spark catches this, disables WSCG for that stage, and falls back to slow interpreted execution."),
    
    ("Describe the lifecycle of a MemoryBlock in the TaskMemoryManager when transitioning from on-heap to off-heap execution under the Tungsten allocator.",
     "1. Allocator request: The executor task requests pages from `TaskMemoryManager`.\n\n"
     "2. On-Heap block: Memory is allocated as a standard Java byte array. The `MemoryBlock` holds a reference to the array and a base offset.\n\n"
     "3. Off-Heap block: If off-heap is enabled, memory is allocated via sun.misc.Unsafe.allocateMemory. The `MemoryBlock` points to the absolute memory address, bypassing heap allocations. On task completion, the memory address is freed directly to the OS, avoiding GC sweep cycles."),
    
    ("Explain how Tungsten leverages CPU L1/L2/L3 cache lines and hardware prefetching when performing a binary search on serialized sorting pointers.",
     "1. Pointer Array: Tungsten Radix/TimSort stores sorted elements as 8-byte pointers (address + sort key prefix) in a contiguous memory array.\n\n"
     "2. Cache Line alignment: Contiguous pointers fit perfectly into CPU L1/L2 cache lines. During sorting, the CPU reads pointers sequentially, triggering hardware prefetching.\n\n"
     "3. Zero Deserialization: The sort operates directly on the 64-bit pointer values without deserializing the underlying record data, maximizing cache hits and CPU throughput."),
    
    ("What happens under the hood when spark.memory.offHeap.enabled is true, and how does the Unsafe instance directly reference off-heap memory addresses via absolute pointers?",
     "1. Configuration trigger: Enabling off-heap shifts page allocations from the JVM heap to OS memory addresses.\n\n"
     "2. sun.misc.Unsafe: Spark uses the JVM's `sun.misc.Unsafe` class. It bypasses Java safety checks, writing directly to memory addresses via `Unsafe.getByte(address)` and `Unsafe.putByte(address)`.\n\n"
     "3. Pointer Math: Off-heap addresses are represented as absolute 64-bit Long integers, allowing Spark to index and navigate memory buffers using basic pointer arithmetic."),
    
    ("Trace the architectural pipeline of a multi-stage physical plan when a CodeGenerationException occurs. How does Spark fall back to codegen-disabled execution?",
     "1. Compile Attempt: The driver compiles the WSCG class using Janino. If a `CodeGenerationException` occurs (e.g., method length > 64KB limit), the exception is logged.\n\n"
     "2. Fallback routing: Spark catches the compilation error. It bypasses WSCG for that specific physical stage, generating an interpreted execution plan instead.\n\n"
     "3. Row Iteration: The task runs using standard row-by-row iterators, which is slower but stable, preventing job crashes due to compilation limits."),
    
    ("How does the Tungsten execution engine leverage SIMD (Single Instruction, Multiple Data) architectures for vectorized operations during columnar batch decoding?",
     "1. Columnar Layout: Tungsten decodes column batches into contiguous memory segments. (2) SIMD instructions: When evaluating math operations (e.g., adding columns), the JVM or native Photon engine utilizes SIMD instructions (AVX-512) to process multiple column values in parallel within a single CPU cycle, multiplying execution throughput."),
    
    ("Explain the internal mechanics of BytesToBytesMap used in Tungsten aggregations. How does it resolve hash collisions without causing object allocation?",
     "1. BytesToBytesMap structure: A contiguous memory page storing key-value pairs as serialized bytes.\n\n"
     "2. Collision Resolution: Uses open addressing with linear probing. If a hash collision occurs, the engine checks the next slot in the contiguous page until a free slot is located.\n\n"
     "3. Zero Allocation: Keys and values are appended directly to the raw byte arrays without creating Java objects, avoiding JVM object headers and GC pressure during aggregation."),
    
    ("Describe the memory layout and allocation strategy of the ShuffleExternalSorter when handling highly serialized record sets.",
     "1. Pointer Page: Sorter allocates an array of 8-byte pointer records. (2) Data Page: Serialized record bytes are appended to a separate data page. (3) Spill Strategy: If pointer or data pages are full, sorter sorts the pointers by partition ID, writes the sorted records to disk, and frees pages for subsequent batches."),
    
    ("How does Spark's internal BufferHolder mechanism prevent JVM memory fragmentation when building large, variable-length UnsafeRow arrays?",
     "1. Buffer Allocation: `BufferHolder` maintains a growable, contiguous byte array. (2) Variable data: When fields are appended, it checks capacity, resizing the array exponentially if needed. (3) Data writing: Row data is written sequentially. Because it uses a single contiguous buffer, it prevents creating millions of small, fragmented heap objects."),
    
    ("How does Tungsten optimize memory usage for string operations using UTF8String instead of standard java.lang.String objects?",
     "1. UTF8String layout: Stores characters as raw UTF-8 bytes in a contiguous memory block without object wrappers. (2) Comparison: Performs comparisons and hashing directly on the raw bytes using Unsafe pointers, avoiding JVM String char conversions and overhead."),
    
    ("Explain the low-level interactions between the OS page cache and Tungsten off-heap allocations when spill operations occur simultaneously across multiple executor cores.",
     "1. Memory contention: Off-heap allocations are managed outside the JVM, but spills write data to disk. (2) OS Page Cache: Spilled files are cached in OS memory. If executor cores write concurrent spills, they compete for OS page cache space, triggering dirty page flushes, which can cause high disk write-wait IO timeouts."),
    
    ("How does TaskMemoryManager.allocatePage() manage virtual page addresses, and how many maximum pages can a single task hold before throwing an exception?",
     "1. Page Addressing: Spark maps memory addresses to a 64-bit format: 13 bits for page number, 51 bits for offset. (2) Page limit: This limits a single task to $2^{13} = 8192$ active pages. If a task requests more, it throws an `IllegalArgumentException` or OOM, limiting maximum task allocation size."),
    
    ("Describe how WSCG loops are unrolled at the assembly layer when processing highly nested structures via ExpressionEncoder.",
     "1. Compilation: Janino compiles WSCG code. (2) Loop Unrolling: For nested fields, the compiler generates flat inline assignments instead of recursive loops, keeping the CPU instruction pipeline clear of branch mispredictions and executing scans at CPU speed."),
    
    ("How does the GenerateUnsafeProjection class dynamically compile Java bytecode at runtime, and how can you profile its compilation latency?",
     "1. Bytecode Generation: Uses Janino compiler to compile custom projection classes in-memory. (2) Profiling: Enable Spark metrics `codegen.compilationTime` or trace JVM compilation calls using JMX, identifying hotspots where compilation latency delays startup."),
    
    ("Contrast the memory layout of an internal Spark InternalRow with an external user-facing Row object, detailing serialization costs.",
     "1. InternalRow: Contiguous byte array (`UnsafeRow`), direct memory offsets, no object headers. (2) Row: Standard JVM object wrapper containing pointers to individual boxed objects. Converting `InternalRow` to `Row` requires deserializing fields, incurring CPU and object allocation costs."),
    
    ("How does Tungsten handle memory deflation and inflation when expanding compressed Parquet dictionary-encoded pages inside the off-heap workspace?",
     "1. Inflation: The Parquet reader reads compressed page dictionaries. (2) Allocation: Tungsten allocates raw off-heap buffers to hold the decompressed indices. (3) Translation: The engine expands indices into UnsafeRows in-memory, tuning page sizes to avoid off-heap overflow errors during expansion."),
    
    ("Explain how spark.sql.codegen.hugeMethodLimit alters the physical generation of iterator pipelines across heavy projection operations.",
     "1. Method Limit: Sets the maximum method size allowed for codegen (default 8000 bytes). (2) Splitting: If WSCG code exceeds this, Spark splits the logic into multiple smaller JVM helper methods, maintaining codegen status without hitting JVM bytecode limits."),
    
    ("What is the specific role of the HashRelation interface in Tungsten memory optimization for broadcast hash joins?",
     "1. HashRelation: Structures the broadcasted table in memory as a lookup index. (2) Tungsten optimization: Key-value records are packed into contiguous byte buffers (`UnsafeHashedRelation`), enabling fast binary probes with zero Java object wrapper overhead."),
    
    ("How do you profile and isolate CPU pipeline stalls inside a WSCG-generated execution phase using low-level async-profiler tools?",
     "1. async-profiler: Attach `async-profiler` to the executor JVM. (2) Flame Graph: Run profiling during stage execution. (3) Isolation: Look for Janino-compiled class methods (e.g., `GeneratedIteratorForCodegen`). Identify CPU stalls (e.g., high L1 cache misses or branch mispredictions) in loop structures."),
    
    ("Explain the operational difference between the OnHeapMemoryManager and OffHeapMemoryManager during a concurrent task context switch.",
     "1. OnHeap: Allocates bytes in JVM memory. Bounded by GC sweeps and heap fragmentation. (2) OffHeap: Bypasses JVM. Allocates absolute memory blocks. Bypasses GC pauses but requires explicit OS memory limits to prevent host kernel out-of-memory kills (OOM-killer)."),
    
    ("How does the TungstenAggregationIterator fall back to a sort-based aggregation if the off-heap hash map runs out of memory?",
     "1. Out of memory: If the aggregation `BytesToBytesMap` cannot allocate more pages. (2) Fallback: The engine halts map updates, sorts the in-memory records by grouping keys, spills them to disk, and runs subsequent aggregations using sort-merge aggregations."),
    
    ("What is the exact execution flow of the GeneratedIteratorForCodegen class inside an executor JVM?",
     "1. Initialization: Loader loads the class. (2) Iteration: Spark task calls `.next()`. (3) Loop: The compiled class runs a monolithic `while` loop processing rows in local CPU caches and outputting UnsafeRow records dynamically."),
    
    ("How does the layout of a Spark memory page differ when running on an ARM-based architecture (Graviton) vs. an x86_64 architecture regarding memory fencing?",
     "1. ARM Memory Model: ARM has weak memory ordering. Requires explicit memory barriers (fences) to prevent CPU reordering. (2) x86_64: Stronger ordering. Spark's Unsafe memory operations insert platform-specific memory barriers to guarantee consistency across cores."),
    
    ("Explain how the RadixSort implementation in Tungsten achieves $O(N)$ sorting efficiency by packing the sort key and record pointer into a single 64-bit Long.",
     "1. Long Packing: Packs a 32-bit sort key prefix (e.g., first 4 bytes of join key) and a 32-bit record pointer offset into a 64-bit Long. (2) Sorting: RadixSort processes keys byte-by-byte in linear loops, avoiding expensive record dereferencing and completing sorts in $O(N)$ time.")
]

# Niche 3: Shuffle Architecture, Network Topologies & Spills (25 questions)
shuffle_qas = [
    ("Walk through the complete lifecycle of a shuffle block, from the moment a map task writes a record to IndexShuffleDataIO to the fetch request by a reduce task.",
     "1. Map Write: The map task passes records to the shuffle writer. Sorter sorts records by partition. (2) File Output: Sorter writes a data file (`.data`) containing all partition blocks and an index file (`.index`) marking byte offsets. (3) Metadata Sync: Map task registers the map status (block locations) with the driver's `MapOutputTracker`. (4) Fetch Request: The reduce task requests partition block locations, gets metadata, and issues Netty HTTP connections to target executors to download the specific byte ranges."),
    
    ("Explain the explicit differences in disk I/O, file descriptor usage, and memory overhead between the obsolete HashShuffleManager and the current SortShuffleManager.",
     "1. HashShuffleManager: Created a separate file for every single partition block ($M \\times R$ files). Caused massive file descriptor leaks, heavy disk I/O random seek latency, and driver OOMs. (2) SortShuffleManager: Writes a single data file and index file per map task. Binds file descriptor use to $O(M)$ files, converting disk I/O to sequential writes and saving substantial driver memory footprint."),
    
    ("How does the Netty-based BlockTransferService utilize zero-copy transfers via FileChannel.transferTo() to optimize network block distribution?",
     "1. Zero-Copy: Bypasses copying data between OS kernel space and user space. (2) Mechanics: `FileChannel.transferTo()` transfers bytes directly from the file system cache to the network socket buffer, reducing CPU context switch overhead and optimizing network interface card (NIC) throughput."),
    
    ("What are the internal triggers and exact memory metrics that dictate when a ShuffleExternalSorter forces an in-memory buffer spill to disk?",
     "1. Spill Triggers: Spills occur if: (a) The pointer array runs out of memory slots. (b) The task memory pool cannot allocate more memory pages for serialized records. (c) Memory usage exceeds the target task share threshold (`TaskMemoryManager.acquireExecutionMemory()`), forcing a spill to prevent OOM errors."),
    
    ("How does the ExternalShuffleService operate independently of the Executor JVM, and how does it manage block cleanup when an executor is dynamically de-allocated?",
     "1. Independence: Runs as a separate daemon process on each cluster node. (2) Block Management: If an executor is de-allocated (e.g., via dynamic allocation), the External Shuffle Service continues serving its shuffle files to reducers, allowing the node to free CPU compute resources without losing shuffle blocks."),
    
    ("Describe the internal mechanics of \"Shuffle Fetch Waiting\" and how adjusting spark.reducer.maxBlocksInFlightPerAddress mitigates network congestion collapses.",
     "1. Fetch Waiting: Reducers request remote shuffle blocks, buffering them in memory. (2) Congestion: If many tasks request blocks simultaneously, Netty threads saturate the network. (3) Tuning: Reducing `spark.reducer.maxBlocksInFlightPerAddress` restricts the number of parallel requests sent to a single address, preventing network congestion collapses and socket drops."),
    
    ("How does Spark compress shuffle blocks using LZ4 or ZSTD at the frame level, and what is the trade-off between CPU decompression stalls and network transit time?",
     "1. Compression: Serialized records are compressed at block level before write. (2) LZ4: Fast decompression, low CPU load, moderate compression ratio. (3) ZSTD: Better compression ratio, saves network bandwidth, but consumes more decompressor CPU cycles on worker nodes, causing CPU stalls if network capacity is not the primary bottleneck."),
    
    ("Detail the internal data structure of the .index file and the .data file generated by a shuffle map stage. How does a reducer read an arbitrary chunk?",
     "1. Index File: Contains 8-byte offset values for each partition. File size is $(P + 1) \\times 8$ bytes. (2) Data File: Contains the contiguous raw bytes of partition blocks. (3) Chunk Read: Reducer queries offset $N$ and offset $N+1$ from the `.index` file, computes the byte length, and performs a range-request GET to read that exact byte window from the `.data` file."),
    
    ("Explain the mechanics of a \"Shuffle Spill\" where data is partially sorted and merged on disk. How does Spark perform an external merge sort on these spilled files?",
     "1. Spill Sort: Sorter sorts the in-memory page, writes it to a temporary file on disk. (2) External Merge: Sorter uses a priority queue (`MinHeap`) containing iterators over all spilled files. It reads the minimum values sequentially, merges them, and writes a single, consolidated, fully sorted shuffle file to disk."),
    
    ("How do you diagnose a condition where the Netty frame decoder throws a TooLongFrameException during a large-scale shuffle operation?",
     "1. Cause: Occurs when a single shuffle block exceeds the maximum Netty frame size limit (typically 2GB). (2) Diagnosis: Inspect executor log traces. Check for skew in partition sizes. (3) Resolution: Increase shuffle partition count to reduce individual partition block sizes below the 2GB threshold."),
    
    ("What is the precise role of spark.shuffle.service.index.cache.size in preventing disk read amplification on high-concurrency driver nodes?",
     "1. Index Cache: Caches shuffle `.index` offset details in executor memory. (2) Optimization: When thousands of remote tasks request offsets, the service reads them from the cache instead of issuing read requests to disk, eliminating read amplification and disk I/O bottlenecks."),
    
    ("Explain how the MapOutputTrackerMaster and MapOutputTrackerWorker synchronize metadata across 10,000+ tasks without blocking the driver's main event loop.",
     "1. Tracker Workers: Executor workers query the local `MapOutputTrackerWorker` cache. (2) Non-blocking RPC: If metadata is missing, workers send asynchronous RPC requests to `MapOutputTrackerMaster` on the driver. The driver uses non-blocking actor loops, returning block locations without blocking the execution threads."),
    
    ("How does Spark's push-based shuffle mechanism (spark.shuffle.push.based.enabled) modify the traditional map-reduce shuffle boundaries internally?",
     "1. Push Shuffle: Map tasks write partition blocks and push them in the background to target external shuffle services. (2) Merge-on-Fly: The external shuffle services merge blocks into consolidated partition files. (3) Reducer benefit: Reducers read merged partition files sequentially, converting random disk reads to fast sequential streams and saving network transfer hops."),
    
    ("Describe the explicit internal memory structure used by ShuffleBlockFetcherIterator to manage local vs. remote block fetches.",
     "1. Fetcher Iterator: Manages queues for local and remote blocks. (2) Memory tracking: Keeps track of total buffered memory (constrained by `maxBytesInFlight`). Local reads bypass Netty, mapping files directly using Java NIO, while remote reads are queued via Netty handlers, optimizing resource usage."),
    
    ("What causes org.apache.spark.network.server.TransportChannelHandler timeouts during high disk I/O operations, and how do you resolve them systematically?",
     "1. Cause: Heavy disk write/spill operations block Netty thread loops, preventing sending heartbeats or responding to requests in time. (2) Resolution: (a) Move shuffle directories to SSDs. (b) Increase `spark.network.timeout` (e.g., to 300s). (c) Restrict executor core concurrency to lower concurrent spill counts."),
    
    ("How does the usage of a custom partitioner (Partitioner subclass) alter the memory footprint and sorting pass of the BypassMergeSortShuffleWriter?",
     "1. Bypass Writer: Bypasses sorting if partition count is low (e.g., < 200). Writes data directly to separate partition files. (2) Memory Impact: Each partition file requires a buffer. High partition counts exhaust memory pools, so a custom partitioner must be aligned with SortMergeShuffleWriter to avoid high descriptor limits."),
    
    ("Explain how spark.shuffle.file.buffer interacts with the underlying Linux OS page cache and dirty page flushing frequencies.",
     "1. Shuffle Buffer: Dictates the size of memory buffers used before writing to disk (default 32KB). (2) OS Page Cache: Larger buffers (e.g., 64KB/128KB) reduce OS write calls. Contiguous bytes are buffered in memory and flushed sequentially, preventing disk thrashing and aligning with Linux page dirty ratios."),
    
    ("Under what explicit architectural circumstances will Spark choose the UnsafeShuffleWriter over the SortShuffleWriter?",
     "1. Unsafe Writer choice: Selected only if: (a) The shuffle partition key does not require aggregation or sorting on the reducer side. (b) The serializer supports relocation. (c) The number of shuffle partitions is less than $2^{24}$ (16.7 million), allowing pointer optimization."),
    
    ("How does Spark compute shuffle checksums (spark.shuffle.checksum.enabled) to isolate network corruption from disk failures at scale?",
     "1. Checksums: Spark writes checksums (e.g., CRC32) for each shuffle block during the write phase. (2) Validation: When a reducer fetches the block, it calculates the checksum. If a mismatch is found, it queries the tracker to verify if the file on disk is corrupt or if a network partition dropped frames, isolating bugs."),
    
    ("Detail how the BlockManager resolves concurrent race conditions when two tasks attempt to read/write the same cached shuffle block simultaneously.",
     "1. Block Locks: `BlockManager` uses fine-grained read/write locks at the individual BlockID level. (2) Conflict resolution: If Task A writes a block, it holds a write lock. Task B attempting to read/write is queued. Once released, the read lock is granted, ensuring thread-safe caching."),
    
    ("Explain the memory implications of having high partition counts (e.g., 50,000+) on the size of the MapStatus object sent to the driver.",
     "1. MapStatus: Tracks the byte size of shuffle blocks. (2) Size inflation: For 50K partitions, the metadata array in `MapStatus` reaches megabytes per task. With 10K tasks, the driver must hold gigabytes of metadata in heap memory, triggering driver JVM OOM errors."),
    
    ("How does spark.sql.shuffle.partitions directly govern downstream concurrency, and how does it interact with the execution memory pool allocation per task?",
     "1. Concurrency: Sets the partition count for shuffles. (2) Memory allocation: Each task acquires a memory share: `TaskShare = PoolSize / ActiveTasks`. If partition count is too high, small tasks run in parallel, inflating scheduling overhead. If too low, tasks process large partitions, causing executor heap saturation."),
    
    ("Explain how the SortShuffleWriter allocates its internal array pointers and when it decides to switch from an in-memory map to an in-memory buffer.",
     "1. In-memory Map: Sorter uses a AppendOnlyMap to group keys during aggregation. (2) Switch trigger: If sorting or no aggregation is needed, it switches to a flat PartitionedSerializedMap or PartitionedPairBuffer, which stores records consecutively, optimizing memory footprint."),
    
    ("What are the specific thread-safety properties of the Netty transport client when multiplexing multiple partition requests over a single TCP connection?",
     "1. Multiplexing: Netty clients send request frames over a single TCP connection. (2) Thread-safety: Outgoing requests are queued in write pipelines, and incoming response frames contain a request ID header, allowing the client to route packets to correct task threads without race conditions."),
    
    ("How do you programmatically intercept shuffle write metrics at the task level using a custom SparkListener to detect silent data inflation?",
     "1. SparkListener: Inherit from `SparkListener`. (2) Callback: Override `onTaskEnd`. (3) Metrics: Extract `taskInfo.accumulables` or `taskMetrics.shuffleWriteMetrics.shuffleBytesWritten`. If bytes written vastly exceed input size, log the partition ID to audit silent data serialization inflation.")
]

# Niche 4: Adaptive Query Execution (AQE) & Dynamic Optimizations (20 questions)
aqe_qas = [
    ("Explain the internal execution barrier mechanics of QueryStageExec. How does AQE halt downstream stage submission to re-optimize a physical plan?",
     "1. QueryStageExec: Represents a physical stage bounded by shuffle exchanges (`ShuffleQueryStageExec`).\n\n"
     "2. Execution Barrier: When an AQE physical plan runs, stages are materialized as `QueryStageExec` nodes. The query execution blocks at these shuffle barriers. Spark submits the map stages and waits for completion.\n\n"
     "3. Re-optimization: Once map tasks complete, Spark reads the actual statistics (e.g., row counts, partition sizes) from the shuffle file indexes. The driver intercepts these metrics, pauses execution, modifies the logical/physical plan recursively (e.g., coalescing partitions), and then submits the downstream stages."),
    
    ("How does AQE determine the optimal target size of a partition when coalescing post-shuffle partitions, and what are the equations governing this calculation?",
     "1. Target size: Configured by `spark.sql.adaptive.advisoryPartitionSizeInBytes` (default 64MB).\n\n"
     "2. Coalescing: Spark reads the map output partition sizes. It traverses partition indices sequentially, grouping consecutive partitions whose cumulative size is close to the advisory size: `GroupSize = Sum(PartitionSize) <= AdvisorySize`. This ensures balanced partition loads, avoiding launching separate tasks for tiny files."),
    
    ("Detail the precise steps AQE takes to convert a SortMergeJoinExec into a BroadcastHashJoinExec at runtime after a map stage completes.",
     "1. Map Execution: Spark runs the map phase for both join sides. (2) Size Check: The driver retrieves the actual shuffle byte sizes. (3) Translation: If the actual size of one side falls below `spark.sql.adaptive.autoBroadcastJoinThreshold` (default 10MB), AQE mutates the plan: it replaces the `SortMergeJoinExec` with `BroadcastHashJoinExec`, skips the sort phase, and broadcasts the small partition dynamically."),
    
    ("How does AQE detect data skew? What are the exact thresholds for spark.sql.adaptive.skewJoin.skewedPartitionFactor and skewedPartitionThresholdInBytes?",
     "1. Skew Detection: Spark compares partition sizes against the median partition size. (2) Thresholds: A partition is skewed if: (a) Size > `skewedPartitionFactor` (default 5) times the median partition size. (b) Size > `skewedPartitionThresholdInBytes` (default 256MB). (3) Remediation: AQE splits the skewed partition into smaller chunks and replicates the join side to process chunks in parallel."),
    
    ("Walk through the plan mutation that occurs when AQE injects a CustomShuffleReaderExec into the physical plan.",
     "1. Mutation: During coalescing or skew join optimization, Spark replaces the standard `ShuffleExchangeExec` reader reference with `CustomShuffleReaderExec`.\n\n"
     "2. Runtime Execution: The `CustomShuffleReaderExec` requests specific partition slices or coalesced index ranges from the block manager instead of reading standard partitions, modifying the execution plan dynamically."),
    
    ("Explain how Dynamic Partition Pruning (DPP) generates an internal SubqueryBroadcastExec node. How does this differ from standard Catalyst predicate pushdowns?",
     "1. DPP Mechanics: Used for star-schema joins. The planner identifies a filter on a dimension table and generates a `SubqueryBroadcastExec` node on the build side of the join.\n\n"
     "2. Pruning: The build side filters data and broadcasts the valid keys to the fact table scan. The fact table scan uses these keys to prune Parquet files at the driver before the scan task runs, bypassing directory scans, unlike standard pushdowns which process filters row-by-row on executors."),
    
    ("How do AQE and DPP interact when a query involves a multi-level nested star schema with joining facts and dimensions across non-partitioned columns?",
     "1. Interaction: DPP requires join keys to be partitioned on the fact table. (2) AQE benefit: If schemas are nested, AQE first runs dimension filter stages. If the filtered size is small, AQE converts the fact join to a Broadcast Join. This enables DPP dynamic pruning keys to route directly to fact scans, pruning unrelated partitions in nested levels."),
    
    ("What happens if an AQE stage fails and retries? How does Spark maintain the transactional integrity of the runtime-coalesced partition layout?",
     "1. Stage Failure: If a task fails, Spark retries it. (2) Integrity: The coalesced partition mappings are saved in the driver's task execution state. When retrying tasks, Spark uses the same index offsets, ensuring reducers fetch identical merged blocks and preventing data corruption."),
    
    ("Explain why AQE cannot optimize a query plan across a non-exchange barrier like a hard-coded repartition() call.",
     "1. Non-exchange barrier: `repartition()` inserts an explicit round-robin or hash shuffle exchange that cannot be coalesced without changing user-specified partition counts, blocking AQE from optimizing partition layouts across that boundary."),
    
    ("How does AQE handle partition coalescing when a physical plan contains multiple consecutive joins sharing the same partition keys?",
     "1. Multi-Join Coalescing: Spark recognizes the matching keys. It aligns partition coalescing boundaries across the entire chain of joins. This ensures that shuffle stages use matching partition IDs, avoiding redundant shuffles between joins."),
    
    ("Describe the internal conflict resolution that occurs when AQE attempts to skew-join a dataset that is simultaneously being optimized for bucket pruning.",
     "1. Conflict: Bucket pruning relies on pre-sorted bucket files to avoid shuffles. Skew join optimization breaks bucket structure by splitting partitions. (2) Resolution: AQE prioritizes eliminating skew over bucket structures. It inserts shuffle exchanges to split skewed keys, sacrificing bucket alignment to prevent executor OOMs."),
    
    ("How do you debug an AQE subquery execution that hangs indefinitely due to a deadlock between the SQL execution thread pool and the RPC actor system?",
     "1. Deadlock cause: The SQL execution thread waits for the AQE subquery result, while the RPC actor pool is saturated with task metrics updates. (2) Debug: Take thread dumps. Locate threads in `AdaptiveSparkPlanExec.getOrAnalyzeSubquery`. (3) Resolution: Increase `spark.sql.adaptive.subquery.maxThread` or netty thread limits."),
    
    ("Explain the internal metrics tracking of AdaptiveSparkPlanExec. How does it evaluate whether an optimized plan is actually cheaper than the original plan?",
     "1. Metrics Evaluation: `AdaptiveSparkPlanExec` tracks the execution duration and shuffle size. (2) Plan Choice: Spark compiles plans. If the actual metrics show that the optimized plan (e.g., Broadcast Join) is cheaper, it executes it. All plan choices are logged under the `SparkPlan` execution history."),
    
    ("How does spark.sql.adaptive.advisoryPartitionSizeInBytes impact the downstream generation of ShuffleBlockId arrays during heavily skewed aggregations?",
     "1. Advisory Size: Dictates the target block sizes. (2) Array Generation: If set too small, Spark generates thousands of `ShuffleBlockId` objects. During skewed aggregations, this increases RPC metadata exchange sizes, causing heartbeat timeouts on the driver."),
    
    ("Explain how DPP passes bloom filter runtimes from the build side to the scan side across a distributed network infrastructure.",
     "1. Bloom Filter DPP: The coordinator creates a Bloom filter from the dimension build side. (2) Serialization: Serializes the filter and broadcasts it to the executors scanning the fact table. The fact readers use this filter inside their Parquet page scanners to skip unneeded row groups."),
    
    ("What are the structural and execution plan differences when running an AQE-enabled query under a Cluster Manager (YARN vs. Kubernetes) with dynamic allocation?",
     "1. Executor Scaling: Under K8s/YARN, AQE metrics drive dynamic allocation. (2) Plan Differences: If AQE coalesces partitions to a small count, the Cluster Manager dynamically releases idle executor nodes. If partition counts remain high, it requests more nodes, adapting resources dynamically."),
    
    ("How does AQE handle local shuffle reader optimization when a stage shuffle is executed completely on a single multi-core executor node?",
     "1. Local Reader: Bypasses network transfer. (2) Optimization: AQE detects that the map and reduce stages run on the same executor host. It replaces the remote Netty fetches with fast local block reads, improving performance by avoiding TCP network stacks."),
    
    ("Under what explicit scenarios does an AQE-optimized physical plan lead to a higher overall execution latency than a static physical plan?",
     "1. Over-optimization: Occurs if: (a) Map stages are tiny, but AQE spends seconds parsing metrics and rebuilding plan trees repeatedly. (b) The driver node is CPU-bound, making plan compilation overhead exceed actual executor run times, increasing query latency."),
    
    ("Explain the interaction between AQE and cached DataFrames (.persist()). How does plan optimization behave when reading from an in-memory columnar store?",
     "1. Cache Barrier: Cached DataFrames are stored as serialized in-memory columns. (2) Optimization: AQE cannot optimize the plan stages *before* the cache, but it optimizes the downstream stages *reading* from the cache based on size metrics, treating the cache as a static scan source."),
    
    ("How does the UpdateStageMetrics RPC message flow from executors to the driver to trigger an AQE re-optimization loop?",
     "1. Metric Collection: Task metrics (bytes written) are collected at task completion. (2) RPC send: The executor sends an `UpdateStageMetrics` message to the driver's `DAGScheduler`. (3) Trigger: Once all tasks for a stage complete, the driver evaluates the metrics, updates the active plan, and triggers re-optimization.")
]

# Niche 5: Advanced Join Topologies & Skew Remediation (15 questions)
join_qas = [
    ("Compare the internal physical iteration mechanics, memory overheads, and CPU bounds of BroadcastHashJoin, SortMergeJoin, ShuffledHashJoin, and BroadcastNestedLoopJoin.",
     "1. BroadcastHashJoin: Builds in-memory hash relation of small side, probes with large side. Memory: Bounded by small table size. CPU: Low, $O(N)$ lookup. (2) SortMergeJoin: Sorts both sides, merges sequentially. Memory: Low (buffers only current keys). CPU: High (sorting phase). (3) ShuffledHashJoin: Shuffles data, builds hash tables per partition. Memory: Bounded by partition size. CPU: Moderate. (4) BroadcastNestedLoopJoin: Broadcasts small side, runs nested loops over partition rows. Memory: High. CPU: Extremely high, $O(M \\times N)$ complexity."),
    
    ("Under what internal memory state and configuration setup will Spark explicitly choose a ShuffledHashJoin over a SortMergeJoin?",
     "1. Conditions: Selected if: (a) `spark.sql.join.preferSortMergeJoin` is false. (b) One join side is small enough to build a local hash relation per partition but larger than the broadcast limit. (c) The partition size is estimated to fit safely in execution memory without spilling, avoiding sort overhead."),
    
    ("Explain the exact algorithmic execution of a SortMergeJoinExec when both streams contain duplicate keys with multi-million row cardinality (Cartesian explosion).",
     "1. SMJ Execution: The engine reads sorted rows. When duplicate keys are encountered, it buffers the matching rows in memory (using `ExternalAppendOnlyUnsafeRowArray`).\n\n"
     "2. Cartesian Expansion: For million-row duplicates, the buffer grows, spilling to disk. The engine repeatedly iterates over the buffer to match rows, causing extreme disk I/O latency and CPU saturation."),
    
    ("How does a BroadcastNestedLoopJoin execute an outer join without running out of memory on the driver or executors? Explain the exact code block looping mechanics.",
     "1. BNLJ outer join: The engine reads the dataset in small chunks (blocks). (2) Looping: For each block, it scans the broadcasted relation, evaluates join conditions, and tracks matched keys in a bitmap. Rows that find no matches are outputted as null-padded rows at the end of the partition scan, keeping memory usage bounded."),
    
    ("What are the memory constraints of a BroadcastHashJoin build side? What happens when the serialized hash relation size exceeds the 8GB limit for JVM byte arrays?",
     "1. Memory Limit: The serialized relation must fit in the driver's memory and subsequent executor memory. (2) Byte Array Limit: JVM byte arrays are limited to 2GB. If the relation exceeds this or the 8GB threshold, the serialization fails with a `java.lang.IllegalArgumentException` or OOM, crashing the driver."),
    
    ("Explain how to resolve a severe data skew issue on a join column without using AQE or manual salting (e.g., leveraging custom physical plan manipulation).",
     "1. Physical Plan split: Programmatically identify the skewed keys. Split the DataFrame into two: `df_skewed` (filtering only skewed keys) and `df_normal`. (2) Join strategies: Broadcast join the `df_skewed` (by broadcasting the small lookup table) and SortMergeJoin the `df_normal`. Union the results to complete the join without skew delays."),
    
    ("Explain the exact mechanics of \"Salting\" a join key. What is the mathematically optimal salt factor based on executor core count and memory allocation?",
     "1. Salting: Prepend a random number (salt) to the join key on the skewed table: `key_salted = concat(key, '_', random(0, N-1))`. Replicate the join key on the non-skewed table $N$ times. (2) Salt factor: The optimal salt factor $N$ is calculated as: `N = SkewedPartitionSize / TargetPartitionSize` (typically aligning with executor core counts to ensure parallel task processing)."),
    
    ("How does Spark handle a bucketed table join (BucketJoin) internally? What are the strict prerequisites regarding partitioning, sorting, and bucketing to completely eliminate shuffles?",
     "1. BucketJoin: Bypasses shuffle exchange. (2) Prerequisites: Both tables must be: (a) Bucketed on the exact same join keys. (b) Configured with the same number of buckets. (c) Sorted on the join keys. If met, Spark maps matching buckets directly across executors, eliminating shuffles and sorts entirely."),
    
    ("What causes a silent fallback from a Bucketed Join to a full SortMergeJoin even when both tables are perfectly bucketed on the join key?",
     "1. Fallback triggers: Occurs if: (a) The join keys do not align exactly with the bucketing columns. (b) The tables are bucketed but have different bucket counts. (c) A transformation (like projection or filter type coercion) alters the data types of the join keys, invalidating bucket file structures."),
    
    ("Detail the internal processing of Null values in a SortMergeJoinExec versus a ShuffledHashJoinExec. How are the null keys partitioned and matched?",
     "1. Null Partitioning: Null values are partitioned using Spark's default hash partitioner. (2) Join Processing: In SMJ, null keys are grouped together at the start of the sort stream, but the join operator skips matching null values (unless `nullSafe` is enabled), discarding them quickly. In ShuffledHashJoin, nulls are hashed to partitions but fail relation lookups instantly."),
    
    ("Explain the network and serialization implications of executing an A.id = B.id OR A.code = B.code join condition in Spark SQL.",
     "1. Plan translation: Catalyst cannot translate `OR` join conditions into standard shuffles. It compiles the plan into an expensive `CartesianProductExec` or `BroadcastNestedLoopJoin`. (2) Network Impact: Triggers a full cross join, transferring millions of rows over the network and causing query execution time to spike."),
    
    ("How does the internal HashRelation object build its bit vector index to ensure constant-time $O(1)$ lookups for complex composite join keys?",
     "1. Bit Vector Index: `HashRelation` hashes composite keys into a single index. (2) Probing: Probes use a bit vector to check key existence before checking key equality. This bypasses structural deserialization for non-existent keys, ensuring fast $O(1)$ lookups during join scans."),
    
    ("What is the impact of join order optimization inside the Catalyst optimizer, and how does it construct a left-deep tree vs. a bushy tree?",
     "1. Left-deep Tree: Linear chain of joins where right inputs are always base tables. Simple to execute but limits parallel processing. (2) Bushy Tree: Joins results of joins. The optimizer uses CBO cost estimates to build bushy trees for complex queries, reducing intermediate row counts and optimizing network shuffles."),
    
    ("How do you implement a manual runtime bloom filter join in PySpark to optimize an asymmetrical join where one table cannot be broadcasted?",
     "1. Filter building: Extract the join keys from the small table, build a Bloom filter using Spark's built-in APIs: `filter = small_df.stat.bloomFilter('id', size, fpp)`. (2) Application: Broadcast the Bloom filter object, and filter the large DataFrame: `large_df.filter(mightContain(col('id'), broadcast_filter))`, reducing file read sizes."),
    
    ("Explain the execution topology of a Cross Join when spark.sql.crossJoin.enabled is active, and how Spark constructs the internal CartesianRDD.",
     "1. CartesianRDD: Pairs every partition of Table A with every partition of Table B. (2) Execution: Launches $M \\times N$ tasks. If Table A has 100 partitions and Table B has 100 partitions, 10,000 tasks are launched, which can saturate the cluster resources if partition sizes are not minimal.")
]

# Niche 6: Memory Management, GC Tuning & OOM Diagnostics (15 questions)
memory_qas = [
    ("Map out the comprehensive breakdown of the Spark Executor JVM memory space (Execution, Storage, User, Reserved) and explain the exact mathematical formulas that govern their boundaries.",
     "1. JVM Memory Model: Total Heap is divided into: (a) Reserved Memory (300MB, hardcoded). (b) Spark Memory (Execution + Storage). (c) User Memory.\n\n"
     "2. Formulas: \n"
     "- `SparkMemoryPool = (TotalHeap - 300MB) * spark.memory.fraction` (default 0.6).\n"
     "- `StorageMemoryLimit = SparkMemoryPool * spark.memory.storageFraction` (default 0.5).\n"
     "- `ExecutionMemoryLimit = SparkMemoryPool - StorageMemoryLimit`.\n"
     "- `UserMemory = TotalHeap - 300MB - SparkMemoryPool` (used for custom arrays, UDF states, and class definitions)."),
    
    ("Explain the \"Eviction Policy\" between Execution memory and Storage memory. Under what exact conditions can Execution memory evict Storage memory, and vice versa?",
     "1. Execution Eviction: If execution memory demands grow, it can evict cached data blocks in the Storage pool to disk, reclaiming space up to its 50% share limit.\n\n"
     "2. Storage Eviction: Storage memory can grow into the Execution pool if it is empty. However, if Execution memory requests space, Storage blocks are evicted. Execution memory is *never* evicted by Storage, preventing task failure."),
    
    ("Detail the precise sequence of JVM events, memory pooling metrics, and Spark internal tracking that leads to a java.lang.OutOfMemoryError: GC overhead limit exceeded.",
     "1. GC Pressure: The JVM spends more than 98% of execution time on garbage collection and recovers less than 2% of the heap.\n\n"
     "2. Spark tracking: Spark tasks continuously allocate objects (e.g., during shuffles). The JVM runs garbage collection sweeps repeatedly. Since memory is saturated with active references (leak or undersized heap), GC fails to free space, triggering the exception and halting execution."),
    
    ("How do you distinguish between a Driver OOM, an Executor JVM Heap OOM, an Executor Off-Heap OOM, and an OS-level Container OOM (Killed by OS/YARN)?",
     "1. Driver OOM: Log says `java.lang.OutOfMemoryError: Java heap space` on the driver node (usually due to `.collect()`). (2) Executor Heap OOM: Similar error in executor logs during shuffles. (3) Off-Heap OOM: Log reports Unsafe allocation failures outside JVM limits. (4) YARN Container OOM: Log shows `Container killed by YARN for exceeding memory limits` (exit code 137 or 143), indicating off-heap or overhead overflow."),
    
    ("Explain how the G1GC garbage collector works within a large Spark Executor JVM (e.g., 64GB+ Heap). How do you tune InitiatingHeapOccupancyPercent (IHOP) and G1ReservePercent specifically for heavy Spark shuffle workloads?",
     "1. G1GC Mechanics: Divides heap into equal-sized regions (1MB to 32MB). Collects garbage in regions with the most dead space concurrently. (2) IHOP Tuning: Set `-XX:InitiatingHeapOccupancyPercent=35` (default 45). This starts GC cycles earlier, preventing heap saturation. (3) G1Reserve: Set `-XX:G1ReservePercent=15` (default 10) to allocate more backup space for allocations during shuffles, avoiding promotion failures."),
    
    ("What is a \"Humongous Allocation\" in G1GC, how does it degrade Spark execution performance, and how do you configure Spark or the JVM to mitigate it?",
     "1. Humongous Allocation: Any object exceeding 50% of the G1 region size. (2) Penalty: JVM allocates it directly in the old generation as contiguous regions, triggering immediate concurrent GC sweeps and degrading performance. (3) Mitigation: Increase G1 region size: `-XX:G1RegionSize=32m`, accommodating larger buffers without old gen allocation loops."),
    
    ("Explain the internal memory allocation mechanics of the MemoryStore. What happens when a partition cannot fit into the remaining Storage memory pool during a .persist(Memory_Only) call?",
     "1. MemoryStore: Manages caching. (2) Fitting check: When writing a partition block, it tracks bytes. (3) Fallback: If the block exceeds the remaining Storage capacity, Spark drops the partition from memory. It does *not* crash; subsequent queries must scan the missing partition from the source filesystem."),
    
    ("How does spark.storage.memoryFraction interact with the block manager, and how does changing this alter task concurrency efficiency?",
     "1. Interaction: Binds the initial size of the Storage pool. (2) Impact: Raising it increases cache capacity but reduces Execution memory, forcing tasks to spill shuffle files earlier, which degrades thread execution efficiency during large-scale shuffles."),
    
    ("Explain the mechanics of a \"Task Memory Leak\" in Spark. How does the TaskContext monitor open iterators, and what happens if a third-party library fails to close a connection?",
     "1. TaskContext tracking: Tracks task execution resources. (2) Leak: If a third-party library opens JDBC or file descriptors inside `mapPartitions` and fails to close them, the memory remains allocated after task completion, accumulating across tasks and causing JVM OOMs. Register cleanup listeners via `TaskContext.addTaskCompletionListener` to resolve leaks."),
    
    ("How do you read and interpret a complex Executor thread dump to find a synchronization deadlock blocking an entire cluster stage?",
     "1. Thread Dump: Generate the dump. (2) Analysis: Search for threads in `BLOCKED` status. Look for locks (e.g., `- waiting to lock <0x000...>` and `- locked <0x000...>`). If Thread A holds Lock 1 and waits for Lock 2 while Thread B holds Lock 2 and waits for Lock 1, a deadlock is present, stalling the stage."),
    
    ("Describe the exact behavior of spark.cleaner.periodicGC.interval and how it prevents memory leaks stemming from unreferenced metadata in the driver JVM.",
     "1. Periodic GC: Spark triggers JVM `System.gc()` periodically (default 30 mins) to clean up unreferenced RDD/shuffle metadata from memory, preventing memory leaks in the driver JVM during long-running streaming applications."),
    
    ("What are the memory allocation properties of data structures created inside a mapPartitions loop? How do you prevent object retention beyond the lifetime of the partition iterator?",
     "1. Allocation: Objects created inside the loop are kept in memory as long as the iterator is active. (2) Retention prevention: Avoid buffering records in arrays inside the loop. Stream records sequentially, freeing references immediately after calling `.next()` to keep JVM memory footprint low."),
    
    ("How does the off-heap allocation for PySpark worker processes (spark.executor.memoryOverhead) scale relative to python workloads, and how is it managed by the container agent?",
     "1. Overhead memory: Set via `spark.executor.memoryOverhead` (default 10% of executor memory). (2) Management: PySpark processes allocate memory outside the JVM. The container agent (YARN/K8s) monitors total host memory. If the Python worker memory exceeds the overhead threshold, the agent kills the container."),
    
    ("Explain how Netty direct memory pools (-Dio.netty.maxDirectMemory) interact with Spark's own off-heap memory properties during high network load.",
     "1. Netty Pools: Netty allocates direct memory buffers for network I/O transfers. (2) Interaction: Both Netty and Spark's off-heap manager compete for OS direct memory. If Netty usage is high and `-Dio.netty.maxDirectMemory` is not set or too small, network transfers fail with direct buffer OOMs during heavy shuffles."),
    
    ("How do you programmatically configure a heap dump on OOM for distributed executors and capture it to a cloud object store for post-mortem analysis?",
     "1. JVM Flags: Set `-XX:+HeapDumpOnOutOfMemoryError` and `-XX:HeapDumpPath=/tmp/dumps/`. (2) Script Capture: Use `-XX:OnOutOfMemoryError=\"/opt/scripts/upload_dump.sh\"`. The script runs on OOM, uploading the dump file from the local container path to the cloud storage bucket (S3/ADLS) for analysis.")
]

for idx, (q, a) in enumerate(catalyst_qas):
    spark_part1.append({
        "id": f"spark-catalyst-{idx+1}",
        "category": "SPARK & DATABRICKS",
        "niche": "Catalyst Optimizer & Query Compilation Internals",
        "question": q,
        "answer": a
    })

for idx, (q, a) in enumerate(tungsten_qas):
    spark_part1.append({
        "id": f"spark-tungsten-{idx+1}",
        "category": "SPARK & DATABRICKS",
        "niche": "Tungsten Engine & Off-Heap Memory Architecture",
        "question": q,
        "answer": a
    })

for idx, (q, a) in enumerate(shuffle_qas):
    spark_part1.append({
        "id": f"spark-shuffle-{idx+1}",
        "category": "SPARK & DATABRICKS",
        "niche": "Shuffle Architecture, Network Topologies & Spills",
        "question": q,
        "answer": a
    })

for idx, (q, a) in enumerate(aqe_qas):
    spark_part1.append({
        "id": f"spark-aqe-{idx+1}",
        "category": "SPARK & DATABRICKS",
        "niche": "Adaptive Query Execution (AQE) & Dynamic Optimizations",
        "question": q,
        "answer": a
    })

for idx, (q, a) in enumerate(join_qas):
    spark_part1.append({
        "id": f"spark-join-{idx+1}",
        "category": "SPARK & DATABRICKS",
        "niche": "Advanced Join Topologies & Skew Remediation",
        "question": q,
        "answer": a
    })

for idx, (q, a) in enumerate(memory_qas):
    spark_part1.append({
        "id": f"spark-memory-{idx+1}",
        "category": "SPARK & DATABRICKS",
        "niche": "Memory Management, GC Tuning & OOM Diagnostics",
        "question": q,
        "answer": a
    })

# Write spark_part1.json
with open("/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/spark_part1.json", "w") as f:
    json.dump(spark_part1, f, indent=2)

print("Spark Part 1 JSON generated successfully. Total questions:", len(spark_part1))
