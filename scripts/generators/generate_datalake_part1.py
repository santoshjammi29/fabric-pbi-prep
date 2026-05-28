import json

datalake_part1 = []

# Niche 1: Storage, File Formats, and Object Storage Deep Internals (20 questions)
storage_qas = [
    ("How do you design a data lake layout on AWS S3 to completely avoid the 3,500 PUT/COPY/POST/DELETE and 5,500 GET/HEAD requests per second per prefix limitation when partitioning data by highly dynamic high-cardinality keys?",
     "1. Prefix Partitioning: S3's rate limits apply per prefix. To scale past 3,500 write and 5,500 read requests per second, you must distribute requests across multiple prefixes.\n\n"
     "2. Hashing Strategy: Prepend a random or deterministic hash (e.g., MD5 or MurmurHash3) of the high-cardinality key to the S3 path. For example, instead of storing data at `s3://my-lake/customer_id=12345/date=2026-05-25/file.parquet`, store it as `s3://my-lake/a5c8-customer_id=12345/date=2026-05-25/file.parquet`. The hash prefix `a5c8/` creates a distinct physical partition in S3's metadata layer, allowing parallel request scaling.\n\n"
     "3. Key cardinality: Ensure the hash prefix has sufficient entropy (e.g., 2 to 4 hex characters), which creates up to 65,536 unique partitions at the root level, multiplying S3 throughput capacity to millions of requests per second."),
    
    ("Explain the low-level memory and CPU trade-offs between Parquet's Dictionary Encoding, Run-Length Encoding (RLE), and Bit-Packing, and how a skewed column distribution impacts the V2 page header size and scan throughput.",
     "1. Dictionary Encoding: Replaces repeating values with integer IDs. Best for columns with low cardinality. Trade-off: Saves substantial memory but requires keeping the dictionary in the reader node's memory during scans. If cardinality is high, dictionary building degrades memory utilization.\n\n"
     "2. RLE & Bit-Packing: RLE compresses repeating values by storing value-count pairs. Bit-Packing packs integers into minimal bit sizes (e.g., storing values 0-3 in 2 bits instead of 32). Highly effective for sorted or sparse integer columns.\n\n"
     "3. Skew Impact: Highly skewed columns cause variations in compressed page sizes. In Parquet V2, small pages increase the ratio of metadata page headers relative to data payloads, saturating decompressor CPU caches during scans and reducing overall I/O read throughput."),
    
    ("When configuring Parquet row group sizes, what are the precise memory consumption impacts on the execution JVM during a massive distributed shuffle, and how do you calculate the optimal ratio between parquet.block.size and Spark's spark.sql.files.maxPartitionBytes?",
     "1. Row Group Memory: Parquet row groups are buffered in the JVM heap before being written to disk. If `parquet.block.size` is too large (e.g., 512MB or 1GB), writing parallel partitions during a shuffle will quickly exhaust the executor's memory, causing OOM errors.\n\n"
     "2. Spark Partitioning: `spark.sql.files.maxPartitionBytes` dictates the size of Spark tasks. If this size is smaller than the row group size, Spark must split row groups across tasks, which disables vectorized reading and causes massive object deserialization overhead.\n\n"
     "3. Optimal Ratio: Set `parquet.block.size` to 128MB or 256MB and align `maxPartitionBytes` to match it exactly (or a multiple of it). This ensures each Spark task processes exactly one complete row group, maximizing read throughput and keeping JVM memory footprint bounded."),
    
    ("How do you architect a data lake to handle the \"small file problem\" dynamically at ingestion time using a lock-free, streaming architecture without introducing micro-batch latency or read-amplification bottlenecks?",
     "1. Ingestion Buffer: Use a lock-free streaming architecture like Apache Flink or Spark Structured Streaming with a rolling file sink. The engine writes incoming data to temporary in-memory buffers (or local disks on worker nodes).\n\n"
     "2. Compaction Manager: Implement an asynchronous background compaction manager (e.g., Hudi's clustering or Iceberg's rewriteDataFiles) that runs concurrently. It monitors file metadata logs, batches small files, and merges them into optimal 128MB+ Parquet files.\n\n"
     "3. Read isolation: The table formats metadata index guarantees that readers only query committed, compacted files, avoiding micro-batch read latencies and read-amplification issues during processing."),
    
    ("What are the file-level structural differences between Parquet and ORC regarding stripe/row-group indexing, and how do these differences dictate query performance variations in Trino vs. Apache Spark for deeply nested map data types?",
     "1. Indexing Structure: Parquet divides files into Row Groups (containing Column Chunks), with metadata in the file footer. ORC divides files into Stripes, placing stripe-level indexes (like Bloom filters and row indexes) within the stripe header and footer.\n\n"
     "2. Nested Maps processing: Parquet flattens nested structures using definition/repetition levels (Dremel record assembly). ORC uses a type tree structure. Trino leverages ORC's index positioning to skip entire stripes, making it faster for nested map evaluations. Spark's vectorized Parquet reader performs better when reading flattened columns but suffers memory overhead when parsing deep maps due to record assembly latency."),
    
    ("Describe the failure mode of object storage bucket replication (e.g., S3 Cross-Region Replication) when dealing with transactional table formats that rely on atomic file renames or strict put-if-absent guarantees, and how you mitigate out-of-order manifest syncs.",
     "1. Failure Mode: Cloud replication is asynchronous. Transactional formats like Delta Lake commit transactions by writing JSON files (e.g., `0001.json`). If these files are replicated out of order or with delay, a reader querying the secondary region will see an inconsistent state, causing compilation failures or data corruption.\n\n"
     "2. Mitigation: Avoid relying on standard object storage replication for log consistency. Use metadata catalogs (like Unity Catalog or Iceberg REST Catalog) that are geo-replicated and maintain ACID transactions across regions, coordinating file read paths dynamically from a replicated metadata database."),
    
    ("How does a storage layer's physical block size mismatch with an object store's internal multipart upload part-size threshold affect the tail latency ($P_{99.9}$) of large-scale distributed analytical queries?",
     "1. Block Size Mismatch: If Parquet's row group size (e.g., 256MB) is misaligned with the object store's multipart upload part-size (typically 8MB to 16MB), a query reading a single row group must make multiple separate HTTP GET requests.\n\n"
     "2. Latency impact: This misalignment causes request fragmentation. The query executor experiences high TCP handshake overhead and socket waits, causing I/O throttling and inflating the tail latency ($P_{99.9}$) of distributed scans under heavy parallel workloads."),
    
    ("Under what structural conditions will Parquet's vectorized reader fallback to non-vectorized execution, and what is the exact architectural remedy to force vectorization over complex evolutionary schemas with deeply nested arrays?",
     "1. Fallback Conditions: Vectorized reading falls back to slow row-by-row parsing if: (a) The schema contains nested fields or complex structures (structs, arrays, maps). (b) Schema evolution has caused type widening (e.g., int32 to int64) across older file segments.\n\n"
     "2. Architectural Remedy: Flatten nested schemas at the storage layer during transformation. If nesting is required, configure the execution engine's nested column pruning (e.g., `spark.sql.parquet.enableVectorizedReader=true` and `spark.sql.parquet.recordReaderInSerializedBinary=true`) to process data chunks directly in memory without full row reconstruction."),
    
    ("Design a mechanism to dynamically adjust Parquet page sizes (parquet.page.size) based on runtime column cardinality metrics captured from previous ETL pipeline runs to optimize memory footprint during predicates pushdown evaluation.",
     "1. Feedback Loop: Build a metadata table storing column cardinalities and dictionary sizes captured from completed Spark query logs.\n\n"
     "2. Dynamic Config: During ETL execution, query this metadata. For high-cardinality columns, configure a larger page size (e.g., 2MB) to reduce page header overhead. For low-cardinality columns, set a smaller page size (e.g., 64KB) to maximize page skipping during predicate pushdown evaluations, reducing memory allocation footprints on executors."),
    
    ("How do you mitigate object storage metadata listing bottlenecks during cold-start partitioned directory discovery when migrating from a legacy Hadoop HDFS block architecture to an exabyte-scale cloud object store without using a metadata catalog?",
     "1. The Bottleneck: Scanning directories on cloud storage is slow because object stores do not have native directory structures; scans require expensive metadata list operations.\n\n"
     "2. Mitigation: Implement manifest-based query planning. Before executing queries, read a pre-generated manifest file (containing all active file paths) stored at a static prefix. This bypasses directory scanning entirely, converting cold-start operations from $O(N)$ directory listings to a single fast file read."),
    
    ("Detail the mechanical execution of a Column Index and Offset Index lookup within a Parquet file footer during a selective predicate pushdown query, and explain how a high number of null values disrupts this mechanism.",
     "1. Index Lookup: The Parquet reader parses the file footer. It retrieves the Column Index (min/max values for each page) and Offset Index (byte offsets of pages).\n\n"
     "2. Page Skipping: The reader compares the filter predicate (e.g., `ID = 5`) against the min/max values. If the page does not contain the key, it skips reading the byte offsets mapped in the Offset Index.\n\n"
     "3. Null Value Disruption: A high number of null values widens the page min/max range (as nulls are evaluated as minimums in some encodings), causing pages to overlap. The reader fails to skip pages, resulting in unnecessary I/O reads of null payloads."),
    
    ("How do you architecture an multi-region active-active data lake storage layer where local writers must append data simultaneously to regional object storage buckets without causing metadata state desynchronization?",
     "1. Replication & Metadata Sync: Use a distributed metadata log (e.g., a globally replicated database like DynamoDB Global Tables or Cosmos DB). Regional writers commit transaction details to this metadata database.\n\n"
     "2. Path Mapping: The metadata catalog maps virtual table versions to specific regional physical S3 paths. When a local write completes, it registers the path. The replication service copies the underlying physical Parquet files in the background, while the metadata database guarantees transaction consistency, resolving conflict states automatically."),
    
    ("Explain how object storage data encryption at rest using AWS KMS with unique customer-managed keys affects maximum request-per-second throttling thresholds, and detail the exact architectural workaround for large-scale EMR or Databricks clusters.",
     "1. KMS Throttling: Each S3 request (GET/PUT) on a KMS-encrypted object requires calling the KMS API to decrypt/encrypt. AWS KMS has strict region-level request limits (typically 5,500 to 10,000 requests/sec). Under massive Databricks runs, these limits are easily breached, causing query failures.\n\n"
     "2. Workaround: Enable S3 Bucket Keys. This instructs S3 to reuse a single KMS-derived key for multiple object transfers within a bucket prefix, reducing KMS API calls by up to 99% and avoiding throttle limits."),
    
    ("What are the specific performance implications of using Brotli or ZSTD compression over Snappy or Gzip at different compression levels inside a Parquet file relative to the query engine's decompressor CPU saturation?",
     "1. Snappy vs Gzip: Snappy is fast but has low compression ratios, consuming network bandwidth. Gzip has good compression but is slow and CPU-heavy during decompression.\n\n"
     "2. ZSTD (Optimal): Provides Gzip-level compression with Snappy-level read speed. At compression level 3, it balances decompressor CPU load, preventing CPU saturation on query engine workers during large table scans.\n\n"
     "3. Brotli: Offers higher compression but is highly CPU-intensive during writes, making it ideal only for archival data pools where write latency is not a factor."),
    
    ("How do you resolve file system read timeouts ($403$ SlowDown errors) when thousands of concurrent Spark tasks evaluate file statistics across millions of immutable objects concurrently?",
     "1. Rate Limiting: $503$ (or $403$) SlowDown errors indicate request throttling on the S3 prefix. This happens when Spark tasks concurrently query object metadata.\n\n"
     "2. Resolution: (a) Increase the S3 request limit by adding random prefixes to paths. (b) Configure Spark query planning to rely on table formats (Iceberg/Delta) which store file statistics in metadata files, avoiding calling `listStatus` on S3 during query planning, eliminating S3 API timeouts."),
    
    ("How do you handle schema evolution at the storage layer when changing a field type from int32 to int64 inside an Avro-encoded landing zone before it transforms into a Parquet-based structured lake layer?",
     "1. Schema mapping: Avro supports type promotion (int32 is compatible with int64). The reader schema must define the promoted type as int64.\n\n"
     "2. ETL Transformation: In the Spark/ETL pipeline, read the Avro files using the new schema configuration. Cast the column explicitly to long (`bigint`) during the load phase before writing to the Parquet table, ensuring the Parquet storage layer maintains consistent datatype definitions across partitions."),
    
    ("Design a storage layout and hashing strategy for a data lake storing high-frequency IoT timeseries data to guarantee uniform distribution across underlying physical storage partitions while keeping query ranges bounded by time windows.",
     "1. Storage Layout: Use a multi-tier pathing structure: `s3://iot-lake/hash_bucket={0-99}/year={yyyy}/month={mm}/day={dd}/`.\n\n"
     "2. Hashing: Calculate the hash bucket as `hash(device_id) % 100`. This distributes devices uniformly across 100 prefixes, avoiding S3 rate limits.\n\n"
     "3. Query Optimization: Queries filtering on time windows will only scan the date directories within the hash buckets. The query engine reads buckets in parallel, ensuring balanced I/O distribution without scanning unneeded folders."),
    
    ("Explain how the omission of the _SUCCESS file or atomic marker mechanisms in modern cloud object stores impacts data lineage validation tools that hook into low-level file listing APIs.",
     "1. Omission Impact: Hadoop legacy tools check for a `_SUCCESS` file before initiating downstream processing. Cloud native writing bypasses this step, committing transactions directly to a catalog.\n\n"
     "2. Lineage Break: If lineage validation tools rely on scanning for these files, they will fail to trigger. To resolve this, hook lineage tools directly into the catalog (e.g., OpenLineage or Unity Catalog Event Logs) rather than scanning object storage file structures."),
    
    ("What are the structural and execution consequences of configuring parquet.enable.dictionary to true for high-cardinality UUID columns in a multi-petabyte dataset?",
     "1. Dictionary Bloat: High-cardinality UUID columns contain unique values for every row. Configuring dictionary encoding forces the engine to build a massive key dictionary in memory.\n\n"
     "2. Performance Degradation: The dictionary will quickly exceed the page size limit (1MB). Parquet will fall back to plaintext encoding, but the memory allocated to the dictionary is lost. This causes garbage collection pressure, high memory consumption, and slower write/read execution speeds."),
    
    ("How do you design an optimal multi-tier data lake storage architecture (Hot/Cool/Cold) that preserves query capabilities via external metadata pointers without incurring catastrophic data hydration latency penalties?",
     "1. Table Format Pointers: Use Iceberg/Delta formats which separate metadata from data files. Store the table metadata files in the central catalog.\n\n"
     "2. Lifecycle Rules: Configure storage lifecycle rules to move physical Parquet files to Cool or Cold tiers after a specific duration (e.g., 90 days).\n\n"
     "3. Query Optimization: The catalog continues pointing to the cold files. When a query scans cold data, engines like Trino use range-requests to read only the page footer index, avoiding full file download (hydration) and minimizing retrieval latency.")
]

for idx, (q, a) in enumerate(storage_qas):
    datalake_part1.append({
        "id": f"dl-store-{idx+1}",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Storage, File Formats, and Object Storage Deep Internals",
        "question": q,
        "answer": a
    })

# Niche 2: Open Table Formats (Delta Lake, Apache Iceberg, Apache Hudi) (20 questions)
format_qas = [
    ("Compare the low-level transactional metadata architectures of Apache Iceberg (Avro manifest lists/files) and Delta Lake (JSON commit logs + Parquet checkpoints). How does each format behave during a metadata query against a table with 10 million files?",
     "1. Apache Iceberg: Uses a tree of Avro files. The table metadata points to a Manifest List (Avro), which points to multiple Manifest Files (Avro) tracking actual data file paths and statistics. When querying a 10M file table, Iceberg performs partition pruning by scanning the Manifest List first, avoiding reading the rest of the metadata, keeping query planning fast.\n\n"
     "2. Delta Lake: Uses an append-only JSON commit log. Every 10 commits, it compiles logs into a Parquet checkpoint file. To query, the engine reads the latest checkpoint and appends the subsequent JSON log changes. For 10M files, reading and processing thousands of JSON log entries dynamically can cause high query planning times, making Parquet checkpoints critical to maintain performance."),
    
    ("Explain the operational and read performance trade-offs between Apache Iceberg's Copy-on-Write (CoW) and Merge-on-Read (MoR) table configurations when dealing with a high-frequency low-volume update workload vs. a heavy batch analytical workload.",
     "1. Copy-on-Write (CoW): Any update requires rewriting the entire data file containing the modified row. High write amplification, but zero read penalty since data is fully contiguous. Ideal for heavy batch analytical workloads.\n\n"
     "2. Merge-on-Read (MoR): Updates write the modified rows to a separate 'delete/update' file (Avro or Parquet). Write operation is instant, but reading requires merging the base files with the delete files on-the-fly. Ideal for high-frequency low-volume updates. However, it introduces CPU overhead during reads, degrading performance for analytical queries."),
    
    ("In Apache Iceberg, how do Position Deletes and Equality Deletes operate at the engine level, and what are the precise memory and CPU overheads incurred by a Trino worker node when merging these deletes on-the-fly during read operations?",
     "1. Position Deletes: Store the exact file path and row position of the deleted row. During reads, the engine builds a bitmap of deleted positions in memory, skipping matched rows easily. Lower memory overhead during reads.\n\n"
     "2. Equality Deletes: Store a condition (e.g., `id = 5`). The reader must load the deleted keys into a hash set in memory and evaluate every row against it. This incurs high CPU and memory overhead on worker nodes, potentially causing OOM errors if the delete file is large."),
    
    ("Detail the synchronization and conflict resolution process of Delta Lake's Multi-Cluster Writes via a transactional log store (e.g., DynamoDB or native cloud storage conditions). How does it handle a split-brain scenario where two independent clusters attempt to commit version $N+1$ simultaneously?",
     "1. Lock coordination: Delta Lake relies on atomic write operations (put-if-absent) in the object store. If the store does not support this natively (like S3), Delta uses a external coordinator (e.g., DynamoDB).\n\n"
     "2. Split-Brain Resolution: When two clusters attempt to commit version `N+1`, they write a lease to the coordinator. The coordinator grants the commit to the first request. The second request receives a commit conflict exception. The second cluster must reload the latest log state (`N+1`), verify if its write overlaps with the committed change (schema validation), and retry by committing as version `N+2`."),
    
    ("How does Apache Hudi's Timeline Server abstract and manage metadata transactions, and how does its instant state machine (Requested, Inflight, Completed) prevent read isolation leakage during uncommitted structural mutations?",
     "1. Hudi Timeline Server: Serves as a centralized metadata transaction manager. It runs on the driver node (or as a separate service) to serve file listings and metadata to executor nodes, reducing direct storage metadata requests.\n\n"
     "2. Instant State Machine: Hudi models transactions as 'Instants' on a timeline. Each instant goes through three states: (a) Requested: The transaction is planned. (b) Inflight: The write is actively running on the executors. (c) Completed: The metadata commit is written to the timeline.\n\n"
     "3. Read Isolation: Readers scan the timeline and only see files written by 'Completed' instants. Files produced by 'Inflight' instants are ignored by the file listing index, preventing dirty reads or isolation leakage during active writes."),
    
    ("Describe how Apache Iceberg's Hidden Partitioning decouples logical partitions from physical directory structures. What are the exact query planning phase mechanics when a query filters on an unpartitioned source column that maps to a partitioned transform expression?",
     "1. Hidden Partitioning: Iceberg maps partition transforms (e.g., `days(timestamp)`) in metadata. Planner parses user query: `WHERE timestamp >= '2026-05-25'`. It determines matching partition values, scans only those manifest files, and skips directory listings entirely."),
    
    ("When executing a VACUUM command in Delta Lake or an expireSnapshots operation in Apache Iceberg, what are the exact failure modes and data corruption risks if a concurrent, long-running streaming write transaction started before the cleanup operation began?",
     "1. Failure Mode: The active stream holds a reference to files scheduled for deletion. When the stream tries to read those files, it fails with a `FileNotFoundException`.\n\n"
     "2. Risk: Restoring old versions or rollback reads fail due to missing physical files. Set appropriate retention limits to prevent cleaning active files."),
    
    ("How do Apache Hudi handle index tracking at scale? Contrast the performance, storage footprint, and write-amplification differences between Hudi's Bloom Index, Simple Index, HBase Index, and Bucket Index for a table with 50 billion records.",
     "1. Hudi Indexes:\n"
     "- Bloom Index: Low storage footprint, but high write amplification at scale.\n"
     "- Simple Index: Simple joins, slow at scale.\n"
     "- HBase Index: High performance, but requires hosting external database.\n"
     "- Bucket Index: Hashes keys to static buckets. Fast and low write overhead, ideal for 50B rows."),
    
    ("Explain how Delta Lake's Log Reconstruction works. How does the query engine reconstruct the table state at version 15,432 when the last Parquet checkpoint file was created at version 15,400, and how do you optimize this process?",
     "1. Reconstruction: Read the `15400.checkpoint.parquet` file to get the active baseline file list. Then read JSON logs 15,401 to 15,432 sequentially and apply log changes.\n\n"
     "2. Optimization: Configure checkpoints to generate more frequently (e.g., every 5 commits) to minimize dynamic JSON parsing latency."),
    
    ("In Apache Iceberg, what is the exact function of the manifest-list file, and how does it optimize query planning by eliminating the need to read individual manifest files during the partition pruning phase?",
     "1. Manifest-List: Stores pointers to manifest files, along with partition summaries (min/max ranges) of the partitions in those manifests. Planner reads the manifest-list first and skips reading manifests whose ranges do not match the filter, pruning data quickly."),
    
    ("How do you implement cross-table transactional integrity across multiple independent Apache Iceberg or Delta Lake tables when a business process requires an atomic multi-table commit or nothing approach?",
     "1. Transaction Manager: Use an external catalog coordinator (Polaris or custom service). Write data to staging. Update catalog metadata pointers for all target tables inside a single relational database transaction, ensuring atomic multi-table updates."),
    
    ("Explain the internal mechanics of Delta Lake's Z-Ordering. How does it compute multidimensional space-filling curves, and what are the explicit structural reasons why Z-Ordering more than 3-4 columns severely degrades clustering efficiency?",
     "1. Z-Ordering: Interleaves bits of keys to map multi-dimensional coordinates to a 1D space (Morton curve). Groups physically close values in the same files.\n\n"
     "2. Efficiency Loss: For >4 dimensions, the space becomes sparse. The bit interleaving fails to group values effectively, scattering data and degrading scan prune ratios."),
    
    ("Describe how Apache Hudi’s Compaction process works for Merge-on-Read tables. How do you dynamically tune the scheduling of inline vs. asynchronous compaction to maintain $P_{95}$ read latencies without starving real-time ingestion pipelines of cluster compute resources?",
     "1. MOR Compaction: Merges delta logs with base Parquet files asynchronously. Configure Hudi timeline parameters to run compaction as a background task triggered by delta limits, avoiding inline CPU spikes that starve ingestion write pipelines."),
    
    ("How does Apache Iceberg enforce Schema Evolution safely without rewriting underlying data files, specifically when dropping, reordering, renaming, or widening data types, and how does it map old field IDs to new physical locations?",
     "1. Schema Map: Maps column names to integer Field IDs in the catalog metadata. Renames and type widening update this logical mapping. The reader uses these IDs to map physical columns in Parquet files, bypassing file rewrites."),
    
    ("What are the internal failure mechanics when a Delta Lake table undergoes a massive schema migration (e.g., changing a complex struct column's internal data types) while a Spark Structured Streaming application is concurrently executing against that table with mergeSchema enabled?",
     "1. Streaming Schema Collision: The active streaming job encounters unmatched schema structures. It attempts to merge the schema. If another transaction locks the catalog, the stream fails with a commit conflict, requiring stream restarts."),
    
    ("Contrast the architectural implementation of Time Travel queries in Iceberg (via snapshot IDs and timestamps in the metadata tree) with Delta Lake (via file log history and checkpoint parsing). What is the maximum scalability ceiling of metadata-driven time travel?",
     "1. Iceberg: Queries lookup target snapshot IDs in metadata. Scalable. Delta: parses JSON log files back to the target version. Scale limit is metadata size; listing millions of versions causes planning out-of-memory errors."),
    
    ("How do you troubleshoot and eliminate the \"Metadata Bloat\" phenomenon in an Iceberg table that experiences continuous micro-batch streaming appends every 10 seconds, causing query planning time to exceed actual data execution time?",
     "1. Bloat: Thousands of snapshots block planning. Eliminate by calling the `expireSnapshots` procedure periodically to purge old snapshots and manifest files, keeping the metadata tree slim."),
    
    ("Explain how Apache Hudi’s Metadata Table (mdt) internally replaces the traditional file listing operations, how it uses an internal HFile format, and how you recover from an out-of-sync or corrupted metadata table index.",
     "1. Metadata Table: Stores file lists in HFile format, bypassing S3 listings. If corrupted, delete the `.hoodie/metadata` directory and rebuild it from the commit logs."),
    
    ("What are the internal locking and state transition mechanisms when converting a massive, unmanaged legacy Parquet directory structure into an Apache Iceberg table in-place using the migrate vs. add_files procedures?",
     "1. Migrate: Overwrites the old table, creating new metadata and deleting the old table schema. `add_files`: Metadata-only commit that appends existing Parquet paths to the Iceberg manifest list, preserving original files in-place."),
    
    ("How does Delta Lake implement Liquid Clustering, how does it physically break away from traditional hive-style partitioning, and what are the deterministic runtime rules it uses to determine when and how data blocks are clustered?",
     "1. Liquid Clustering: Bypasses standard partition folders. Groups data using dynamic clustering keys. Background processes read file statistics, map keys on a Z-Order curve, and merge matching ranges into balanced Parquet files.")
]

for idx, (q, a) in enumerate(format_qas):
    datalake_part1.append({
        "id": f"dl-format-{idx+1}",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Open Table Formats (Delta Lake, Apache Iceberg, Apache Hudi)",
        "question": q,
        "answer": a
    })

# Niche 3: Cataloging, Metastores, and Data Governance (20 questions)
catalog_qas = [
    ("Design a multi-region enterprise data catalog architecture that bridges a centralized Hive Metastore with decentralized modern catalogs like Unity Catalog and Iceberg REST Catalog, ensuring bi-directional state synchronization under sub-second latency.",
     "1. Sync Architecture: Deploy event listeners (HMS Listener, UC Audit Logs). Event sync agents parse table mutations, convert them to target schemas, and update the destination catalogs via REST APIs under sub-second latency."),
    
    ("What are the exact database-level locking behaviors and connection pooling bottlenecks that occur inside a PostgreSQL-backed Hive Metastore when handling more than 50,000 concurrent partition lookup requests from an ad-hoc query engine?",
     "1. Locking & Pool bottlenecks: HMS queries Postgres `PARTITIONS` and `PARTITION_PARAMS` tables. 50K parallel checks exhaust Postgres connection limits. Enable read replicas, configure pgBouncer, and enable HMS caching to resolve connection waits."),
    
    ("Detail the complete authentication, authorization, and handshake flow when a distributed query engine (e.g., Trino) queries an Iceberg table secured by an Iceberg REST Catalog backed by an OAuth2 token provider and an external ABAC engine.",
     "1. Authorization Flow: Trino requests access token from OAuth2. Calls Iceberg REST Catalog with token. Catalog validates token and queries external ABAC engine (OPA) with user credentials and table attributes. OPA returns decision, and catalog returns table metadata."),
    
    ("How do you architect a secure metadata federation layer over multiple heterogeneous storage clouds (Azure ADLS Gen2, AWS S3, Google Cloud Storage) that prevents data consumer exposure to raw cloud IAM credentials or storage endpoints?",
     "1. Token Vendoring: Implement a central REST Catalog that generates transient, down-scoped access tokens (e.g., ADLS SAS, S3 pre-signed URLs) for specific files requested, preventing exposing raw cloud credentials to clients."),
    
    ("Explain how Unity Catalog implements its internal security abstraction layer over raw object paths. How does it handle data access token vendoring, and what are the performance impacts when a query requires access to millions of distinct data paths?",
     "1. UC Token vendoring: UC validates permissions and requests down-scoped session tokens from the cloud provider. To avoid generating millions of tokens for individual files, UC bundles paths by parent prefix, minimizing API latency."),
    
    ("How do you programmatically resolve a schema split-brain scenario where the central data catalog (e.g., AWS Glue Data Catalog) reflects one version of a table schema, but the internal transaction log of the table format (e.g., Iceberg metadata file) reflects another?",
     "1. Schema Sync: The Iceberg metadata file is the source of truth. Run a synchronization utility that reads the latest `.metadata.json` and updates the Glue schema via the `UpdateTable` API to overwrite mismatching definitions."),
    
    ("What are the architectural trade-offs of deploying a decentralized Data Mesh architecture using AWS Glue resource links and cross-account IAM roles versus using an open-source catalog federation engine like Polaris or Gravitino?",
     "1. AWS Glue Resource Links: Low maintenance, native AWS integration. Trade-off: restricted to AWS and AWS-compatible engines. (2) Polaris/Gravitino: Multi-cloud, multi-engine compatible. Trade-off: high hosting and administration overhead."),
    
    ("How do you scale a metadata catalog to handle tables with over 1 billion rows of metadata partition values without causing Java Garbage Collection (java.lang.OutOfMemoryError: GC overhead limit exceeded) on the catalog service coordinator?",
     "1. GC Mitigation: Enable pagination on partition APIs. Configure ZGC/G1GC for JVM. Migrate directory tables to Iceberg, which registers partition stats inside index files, avoiding loading large partition lists in metastore memory."),
    
    ("Detail the implementation of fine-grained Row-Level Security (RLS) and Column-Level Security (CLS) within a shared data lake catalog. How do you ensure that compiled execution plans do not leak unauthorized column statistics to users through query optimizer costs?",
     "1. View Masking: Inject RLS/CLS filters into user AST queries. Set the optimizer to use static selectivities for masked columns, preventing users from inferring column distributions by analyzing query planner cost changes."),
    
    ("How do you architect an automated global data lineage parsing system that captures column-level transformations across multi-hop data lake pipelines (Bronze -> Silver -> Gold) executing across heterogeneous runtime engines (Spark, dbt Core, Trino, Flink)?",
     "1. Lineage Sync: Deploy OpenLineage extensions in Spark, Flink, and dbt. Listeners capture execution plans and send events to a central metadata graph database (Marquez), assembling an end-to-end data flow map automatically."),
    
    ("What are the design trade-offs of using an Iceberg REST Catalog vs. AWS Glue Data Catalog when building an engine-agnostic data lake utilized by Spark, Snowflake, Flink, and StarRocks simultaneously?",
     "1. Iceberg REST Catalog: Native table format integration, high compatibility across Snowflake and StarRocks, handles version mapping cleanly. Trade-off: Requires dedicated hosting. (2) AWS Glue: Serverless, managed. Trade-off: Lacks native integrations for non-AWS engines."),
    
    ("How do you enforce data classification tags (e.g., PII, PHI) to automatically propagate from source systems down to downstream derived aggregate tables across a multi-tenant data lake without manual data steward intervention?",
     "1. Tag Propagation: Implement tag inheritance in the catalog. When building downstream tables, the lineage parser maps source columns to sink columns. The catalog propagates tags (PII/PHI) along the lineage paths automatically."),
    
    ("Explain the internal transactional protocol when an enterprise catalog performs a metadata-only table rename operation across different database scopes, and how this impacts active, long-running streaming consumers reading from the source location.",
     "1. Table Rename: The catalog updates the logical table pointer reference. Streaming consumers reading from the old path fail with path resolution errors unless the catalog supports alias routing during the transition window."),
    
    ("Design a distributed data governance framework that performs real-time auditing and active blocking of queries attempting to join two isolated datasets that, when combined, violate toxic combination privacy compliance policies.",
     "1. Query Auditing: The query gateway parses user query ASTs. If it detects a join between two restricted table IDs, the gateway blocks compile execution, returning a policy violation error, protecting privacy standards."),
    
    ("How do you handle schema evolution tracking within a data catalog when an upstream system sends incompatible structural modifications (e.g., changing a column from a primitive to a struct), ensuring downstream consumer pipelines do not break?",
     "1. Schema quarantine: Configure Glue/metastore schema validation gates. If an incompatible change is detected, block catalog updates, write the new data to a quarantine folder, and alert data engineers for manual mapping."),
    
    ("Explain how catalog-level caching mechanisms in distributed query engines interact with the physical freshness of open table format metadata files. How do you prevent stale metadata reads without completely disabling caching?",
     "1. Metadata Freshness: Query engines cache table metadata files to speed up planning. To prevent stale reads, configure TTL thresholds (e.g., 10 seconds) or configure the catalog to push update notifications to the engine cache."),
    
    ("What are the structural and network failure scenarios when a cross-account data share via Delta Sharing protocol or Iceberg Catalog federation encounters transient network partition events between the provider and consumer tenants?",
     "1. Share Failure: Reader compute nodes cannot resolve metadata tokens or contact the provider's token vendoring API, causing execution timeouts. Mitigate by implementing local token caching on consumer coordinators."),
    
    ("How do you design a disaster recovery strategy for an enterprise data catalog that guarantees catalog-state point-in-time recovery to exactly match the underlying point-in-time state of the physical files in immutable storage buckets?",
     "1. Backup Alignment: Snapshot the catalog relational database (Postgres) and the storage bucket concurrently. During recovery, restore both to the matching timestamp, ensuring catalog schemas align with physical files on disk."),
    
    ("How does the choice of catalog implementation influence the efficiency of data discovery, automated data profiling, and data quality metric collection across a multi-petabyte data lake environment?",
     "1. Catalog Impact: Catalogs with built-in metadata APIs (like Unity Catalog) allow profiling tools to scan file statistics directly from logs, bypassing expensive data scan jobs on S3, reducing profiling costs."),
    
    ("Detail how you would implement an automated, policy-driven data retention and purging engine directly inside the data lake catalog that scans for expired datasets and executes cryptographic deletion of corresponding storage keys.",
     "1. Crypto-Deletion Engine: Schedule a daily job in the catalog. It scans metadata for tables exceeding retention limits. It calls Key Vault to destroy the cryptographic keys associated with the target tables, rendering data unreadable instantly.")
]

for idx, (q, a) in enumerate(catalog_qas):
    datalake_part1.append({
        "id": f"dl-catalog-{idx+1}",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Cataloging, Metastores, and Data Governance",
        "question": q,
        "answer": a
    })

# Niche 4: Query Optimization, Distributed Engines, and Processing (20 questions)
optimization_qas = [
    ("Explain the internal execution mechanics of Dynamic Filtering in Trino/Presto. How are broadcast join build-side min/max values or Bloom filters pushed down to the scan operators of an Iceberg or Delta table connector at runtime?",
     "1. Dynamic Filtering: Coordinator processes build-side join input and generates a Bloom filter. Pushes this filter to probe-side scan threads. The scan threads discard non-matching rows during file parsing, reducing network shuffle overhead."),
    
    ("In Apache Spark SQL execution, describe the exact phase transformations from an Unresolved Logical Plan to a Resolved Logical Plan, Optimized Logical Plan, Physical Plan, and final Cost-Based Optimization (CBO). How do you inject custom optimization rules?",
     "1. Execution Plan: Parser builds Unresolved Plan. Analyzer resolves column types. Catalyst Optimizer runs rules (constant folding, filter pushdown) yielding Optimized Plan. Physical Planner creates multiple physical plans and selects the best based on statistics. Inject custom rules using `extraOptimizations` APIs."),
    
    ("What are the low-level processing differences between Vectorized Query Execution (e.g., ClickHouse, Trino, or Spark’s Photon engine) and traditional Volcano-style iterator model execution when scanning multi-terabyte uncompressed data streams?",
     "1. Processing styles: Volcano processes rows one-by-one using virtual loops. High CPU overhead. Vectorized execution processes data in columns (vectors) inside CPU registers using SIMD operations, maximizing data locality and instructions."),
    
    ("How do you configure and optimize a distributed query engine to prevent \"Data Skew\" during a massive distributed hash join operation? Detail the internal mitigations of Spark's Adaptive Query Execution (AQE) skew join optimization.",
     "1. AQE Skew Join: Enable `spark.sql.adaptive.skewJoin.enabled`. If partition size exceeds the median size by a factor, Spark splits it into smaller sub-partitions and duplicates the build-side keys across them, balancing executor loads."),
    
    ("Explain the root causes of memory allocation failures (OOM) during the Shuffle phase of a large distributed processing job. How do you mathematically balance spark.executor.memory, spark.memory.fraction, and spark.memory.storageFraction to eliminate them?",
     "1. Shuffle Memory: OOM happens if shuffle partitions exceed JVM memory. Set `spark.memory.fraction` to 0.6 and `spark.memory.storageFraction` to 0.5. This allocates 30% of executor memory to shuffle buffers, preventing OOMs."),
    
    ("How does a distributed query engine leverage Parquet's Bloom filters embedded within the file structure, and how this differs from checking partition metadata statistics during query planning?",
     "1. Bloom Filters check: Readers scan page Bloom filters to check if specific keys exist. Differs from partition stats (which prune tables at directory level) by pruning rows at page level within files, reducing page reads."),
    
    ("Design an optimal query routing architecture that dynamically load-balances analytical workloads across Trino, Spark SQL, and an OLAP database (e.g., StarRocks) based on query complexity, estimated data scan volume, and user SLA tiers.",
     "1. Router design: Gateway intercepts queries. Small queries go to StarRocks (OLAP). Queries scanning 100GB-5TB go to Trino (Interactive). Heavy ETL queries (>5TB) go to Spark, optimizing compute resource costs and SLAs."),
    
    ("Explain the performance and structural implications of executing a query with high-cardinality GROUP BY operations over an open table format with un-compacted delete files. How does the engine reconcile deletes inside execution memory?",
     "1. Delete Merge: Query engine must load delete maps in memory. During scanning, rows are validated against the delete maps. High-cardinality groups exacerbate memory consumption, slowing down aggregation throughput."),
    
    ("What is the impact of JVM garbage collection configuration (e.g., G1GC vs. ZGC) on the query latency distribution ($P_{99}$) of a high-concurrency distributed query coordinator managing metadata-heavy queries?",
     "1. GC pause: G1GC causes 'Stop-the-World' pauses of several seconds under heavy heap memory pressure. ZGC performs concurrent collections with pauses under 1ms, stabilizing P99 tail latency distribution."),
    
    ("How do you optimize predicate evaluation for complex geospatial data types within a data lake query engine, and how can custom indexing frameworks like H3 or S2 be overlaid on top of Parquet or Iceberg layouts?",
     "1. Spatial Index: Map coordinates to H3 indexes during ingestion and store as a column. The query engine filters by H3 index values using Parquet min/max statistics, bypassing expensive coordinate geometry math on rows."),
    
    ("Detail how the cost-based optimizer of a distributed engine calculates join strategies (Broadcast Hash Join vs. Shuffle Hash Join vs. Sort Merge Join) based on column histogram statistics, and explain when those heuristics fail catastrophically.",
     "1. Join Strategies: CBO selects Broadcast Join if build-side size is below threshold (e.g., 10MB). If stats are stale or missing, the engine may select a Shuffle Join, causing high network traffic and performance drops."),
    
    ("How do you implement a robust distributed caching layer (e.g., Alluxio or native engine caching like Trino's local NVMe cache) over a cloud data lake to achieve sub-second response times for highly repetitive dashboard queries?",
     "1. NVMe Cache: Mount local NVMe SSDs on Trino worker nodes. Enable caching in the catalog connector. Workers write data blocks to local cache during the first query, satisfying subsequent reads from NVMe, reducing S3 latency."),
    
    ("What are the internal code generation (CodeGen) limitations in Apache Spark when executing queries with thousands of conditional expressions (e.g., massive CASE WHEN blocks), and how do you circumvent the $64\\text{KB}$ Java bytecode method limit?",
     "1. CodeGen limit: JVM limits a single Java method to 64KB bytecode. A massive `CASE WHEN` statement compiles into a single method, failing compilation. Circumvent by disabling whole-stage codegen or splitting calculations across multiple project projections."),
    
    ("How does the presence of deeply nested structural columns (e.g., structs containing arrays of structs) impact memory serialization and deserialization overhead during inter-node data shuffles in a distributed compute cluster?",
     "1. Nested Serialization: Spark must serialize nested fields to byte arrays during shuffle. This increases CPU serialization overhead. To optimize, flatten nested fields during Silver-tier processing before shuffling data."),
    
    ("Detail how you would design a multi-tenant resource allocation strategy using Trino Resource Groups or Spark Capacity Schedulers to guarantee data engineering pipeline SLAs while accommodating unpredictable ad-hoc data scientist queries.",
     "1. Resource Groups: Configure Trino resource groups. Assign production pipelines to a high-priority group with guaranteed CPU shares (e.g., 70%). Assign ad-hoc queries to a low-priority group with a hard concurrency limit (e.g., 5 queries), protecting SLAs."),
    
    ("Explain how query pushdown works through a data virtualization layer when querying a hybrid data lake composed of both cloud object storage and a transactional relational database.",
     "1. Virtualization Pushdown: The engine parses the query, splits execution steps, pushes filters and joins to the relational database locally via JDBC, reads the results, and joins them with Parquet streams in memory, minimizing transfer."),
    
    ("What are the specific performance implications of data serialization formats (Kryo vs. Java Serialization) on network utilization and CPU execution time during large-scale distributed analytical processing?",
     "1. Kryo Serialization: Kryo is more compact and up to 10x faster than standard Java serialization. Using Kryo reduces network transfer sizes during shuffles and lowers CPU execution times, improving overall job speed."),
    
    ("How do you troubleshoot a distributed query that hangs indefinitely at the very end of its execution phase during the stage coordination or file commit phase? What are the underlying lock contentions?",
     "1. Coordination Hang: Usually caused by: (a) Executor connection timeouts during final commit validation. (b) Write lock conflicts in the catalog database while updating table snapshot IDs. Inspect thread dumps on the coordinator to locate locks."),
    
    ("How do you design an efficient incremental aggregation layer over a data lake that automatically refreshes materialized views across underlying open table formats when new data is appended via streaming?",
     "1. Materialized view sync: Use a streaming consumer that reads the target table's transaction log (e.g., Delta log). The sync process aggregates only the new files added and merges updates to the view, avoiding full table rescans."),
    
    ("Explain the exact mechanism of runtime code generation for expression evaluation in modern OLAP engines, and how it utilizes CPU L1/L2/L3 caches more effectively than traditional data processing frameworks.",
     "1. Runtime CodeGen: Compiles SQL expressions into machine code dynamically. This eliminates virtual function calls and keeps evaluation loops tight, allowing data arrays to remain in L1/L2 CPU caches, minimizing RAM fetches.")
]

for idx, (q, a) in enumerate(optimization_qas):
    datalake_part1.append({
        "id": f"dl-optimization-{idx+1}",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Query Optimization, Distributed Engines, and Processing",
        "question": q,
        "answer": a
    })

# Niche 5: Data Consistency, Concurrency, and Isolation Levels (20 questions)
consistency_qas = [
    ("Prove how write skew anomalies can occur in a modern data lake table format operating under Serializable Snapshot Isolation (SSI) or Optimistic Concurrency Control (OCC) when two parallel pipelines execute independent read-modify-write operations.",
     "1. Write Skew Proof: Consider a table containing active doctors on duty. A rule states 'at least one doctor must remain on duty'. Two transactions (T1 and T2) run concurrently under Snapshot Isolation. Both read the table and see two doctors are active. T1 updates Doctor A's status to inactive and commits. T2 updates Doctor B's status to inactive and commits. Both succeed because they updated different rows. However, zero doctors are active, violating the rule. OCC fails to block this because it only checks for overlapping file writes, not logical read dependencies, proving write skew anomalies occur in table formats without strict SSI lock coordinators."),
    
    ("What are the specific internal conditions that cause an Iceberg transaction commit to fail with a CommitFailedException, and how do you implement a deterministic backoff and retry strategy that prevents write starvation in high-concurrency environments?",
     "1. CommitFailedException: Occurs when a concurrent write transaction commits a change to the table metadata before the running transaction can write its own commit. The runtime detects that the current snapshot's parent ID is no longer the active table tip. Implement exponential backoff with jitter: `WaitTime = Min(MaxWait, BaseWait * 2^attempt) + random_jitter` to prevent thundering herd problem, allowing writers to commit sequentially without starvation."),
    
    ("Explain the precise architectural implementation difference between Read Committed, Snapshot Isolation, and Serializable isolation levels across Delta Lake, Apache Iceberg, and Apache Hudi.",
     "1. Read Committed: Readers see data committed before query start. (2) Snapshot Isolation: Reads target a consistent snapshot ID. (3) Serializable: Enforces strict order. Delta checks if files read by a transaction have been modified by concurrent commits. Iceberg uses catalog locks to serialize metadata overwrites."),
    
    ("How do you design a data lake ingestion layer that guarantees multi-table transactional consistency during a global schema or business logic migration that updates hundreds of tables simultaneously?",
     "1. Transaction coordination: Write data to temporary staging paths. Commit metadata modifications for all tables inside a single database transaction in the catalog database, ensuring users see either all updates or none."),
    
    ("Detail the physical and metadata state transition phases when a transaction fails halfway through a massive MERGE INTO operation on a 100-terabyte table format. How does the engine guarantee that no orphaned data files or corrupted indices remain?",
     "1. Transaction Failure: Data files are written to S3 but not registered in metadata. The active metadata file continues pointing to the old snapshot. The transaction is abandoned. A background clean task (e.g., `removeOrphanFiles`) scans S3 and deletes unregistered files, preventing disk bloat."),
    
    ("How does Apache Hudi resolve concurrent write conflicts when utilizing its Multi-Writer architecture with external lock providers like ZooKeeper, HiveMetastore, or DynamoDB? What happens if a lock provider experiences a network partition?",
     "1. Hudi Locks: Hudi uses ZooKeeper or DynamoDB to acquire distributed locks. If a network partition occurs, the lock request fails, the write transaction is aborted, and rollback procedures run to clean up partial files."),
    
    ("What are the internal metadata tracking mechanisms used by Delta Lake to detect if a concurrent transaction has modified the specific files or partitions that a running transaction read during its initial query planning phase?",
     "1. Conflict Detection: Delta logs track `readFiles` and `addFiles`. During commit, Delta reviews the concurrent logs since transaction start. If a committed transaction modified files in the same partition that the current transaction read, it throws a concurrent modification error, aborting the write."),
    
    ("How do you design a lock-free distributed ingestion architecture that achieves exactly-once processing guarantees from an Apache Kafka source into an Iceberg table format across multiple independent Spark streaming jobs?",
     "1. Offset tracking: Spark writes Kafka offsets into the Iceberg snapshot metadata. If a failure occurs, Spark reloads the offsets from the last committed Iceberg snapshot, resuming ingestion without duplicates."),
    
    ("Explain how distributed transaction coordinators handle clock drift across cluster nodes when using timestamp-based concurrency control or snapshot isolation mechanisms in a multi-region data lake environment.",
     "1. Clock Drift: Mismatched local times can cause out-of-order writes. To resolve this, use logical clocks (Hybrid Logical Clocks) or coordinate all commits via a central catalog service that assigns monotonically increasing sequence IDs."),
    
    ("What is the impact of long-running analytics queries on the performance of concurrent write transactions under MVCC architectures? How do table formats prevent read locks from blocking write logs?",
     "1. MVCC Isolation: Readers query static snapshot versions. Writers write to new files concurrently. Since readers do not acquire locks, there is zero blocking between read and write paths, allowing queries to complete without blocking write logs."),
    
    ("Detail the internal mechanics of how Delta Lake handles conflicts during concurrent OPTIMIZE (compaction) operations and streaming APPEND operations on the exact same partition.",
     "1. Delta Compaction Conflict: Delta uses Optimistic Concurrency Control. Since an `APPEND` only adds new files and `OPTIMIZE` only groups existing files (without changing the logical data), the conflict is auto-resolved. Delta merges the two commits by appending the new files to the newly compacted file list, completing both tasks without conflicts."),
    
    ("How do you resolve a transaction deadlock scenario in an enterprise data lake where automated data maintenance jobs (vacuum, compaction, stats collection) run simultaneously with real-time continuous CDC pipelines?",
     "1. Job scheduling: Isolate maintenance jobs to off-peak hours, or configure partition-level locks instead of table-level locks. Ensure CDC pipelines have high lock priority, and design maintenance scripts to automatically yield and retry if a lock conflict is detected."),
    
    ("Explain the structural changes and transaction log state transitions that occur when an architect changes an Iceberg table property from write.format.default=parquet to write.format.default=avro mid-transaction.",
     "1. Format transition: The catalog updates the table properties metadata. Active transactions continue writing their active files in Parquet. Subsequent commits read the new property and start writing data in Avro, generating a mixed-format manifest list that readers parse seamlessly using metadata markers."),
    
    ("How do you guarantee absolute data isolation between a staging environment and a production environment that share the same physical underlying object storage bucket but run distinct metadata catalog instances?",
     "1. Directory Isolation: Configure separate root prefixes (`s3://mybucket/staging/` and `s3://mybucket/production/`). Assign distinct IAM policies to the catalog instances, restricting the staging catalog from reading or writing to the production prefix, ensuring isolation."),
    
    ("Detail the serialization and transaction log format changes that occur when executing an in-place column type widening (e.g., short to int) in a Delta Lake table under active heavy concurrent reads.",
     "1. Schema Widening: Delta writes a new schema definition in the JSON commit log. Active readers parsing older files read short bytes and promote them to int in memory dynamically, preventing query failures during the migration window."),
    
    ("Design an ingestion framework that handles late-arriving data (out-of-order by days) into a time-partitioned table format without triggering massive structural rewrite cascades or violating concurrent transaction isolation boundaries.",
     "1. Ingestion design: Write late-arriving data to a staging buffer partition. Run compaction jobs that merge the late data only with the specific daily partitions matching the event dates, avoiding rewriting the entire historical partition layout."),
    
    ("How does Apache Hudi's delta streamer coordinate checkpointing across multiple continuous sync cycles to guarantee that no data loss occurs if an underlying cloud storage driver throws transient I/O exceptions?",
     "1. Checkpoint sync: Hudi writes checkpoints to the timeline metadata file at the end of each commit. If a write fails due to storage exceptions, the coordinator rollbacks the uncommitted instant and re-reads from the last successful checkpoint stored in the timeline, avoiding loss."),
    
    ("What are the operational and behavioral differences in conflict resolution when a table format uses optimistic locking at the catalog level vs. optimistic locking at the object storage API file-overwrite level?",
     "1. Catalog locking: Resolves conflicts fast by evaluating transaction metadata in a database. (2) Object storage level: Relies on storage API write failures (e.g., 412 Precondition Failed). Slower and prone to high API transaction costs under high concurrency."),
    
    ("Explain how transactional metadata updates are propagated to distributed reader nodes that have already compiled their query plans. How do you prevent a long-running query from reading inconsistent state mid-execution?",
     "1. Reader Isolation: Once Trino/Spark compiles a query, it references a static list of file paths. Even if a writer commits a new snapshot, the running query continues reading the compiled paths, ensuring consistent snapshot isolation."),
    
    ("Design an automated verification engine that parses the low-level transaction logs of Iceberg/Delta Lake tables to mathematically audit and verify absolute data consistency across billions of records.",
     "1. Verification Engine: Build a script that regularly parses the JSON/Avro metadata logs. It calculates the cumulative add/remove file counts and matches them against database row count metrics. If a mismatch is detected, it flags transaction logs for auditing, verifying consistency.")
]

for idx, (q, a) in enumerate(consistency_qas):
    datalake_part1.append({
        "id": f"dl-consistency-{idx+1}",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Data Consistency, Concurrency, and Isolation Levels",
        "question": q,
        "answer": a
    })

# Write adf_part1.json
with open("/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/datalake_part1.json", "w") as f:
    json.dump(datalake_part1, f, indent=2)

print("Data Lake Part 1 JSON generated successfully. Total questions:", len(datalake_part1))
