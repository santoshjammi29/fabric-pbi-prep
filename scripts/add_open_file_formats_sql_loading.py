#!/usr/bin/env python3
"""
add_open_file_formats_sql_loading.py

Deeply researches, checks, and appends multi-level knowledge on Open File Formats
(Parquet, ORC, Avro, Delta Lake, Apache Iceberg, Apache Hudi, JSON, CSV) and
loading data from these formats into SQL tables (Synapse Dedicated SQL Pool MPP,
Snowflake, Databricks SQL, Microsoft Fabric Lakehouse/Warehouse, PostgreSQL/Azure SQL).

Covers all 4 difficulty levels: EASY, MEDIUM, HARD, ARCHITECT.
Addresses advantages, bottlenecks, common production issues, and configuration tuning.
Integrates into:
1. src/data/json/data_concepts.json
2. src/data/json/questions.json
3. src/data/json/data_architecture.json
4. src/data/json/data_cheatsheet.json
5. src/data/json/data_mssql.json
6. src/data/json/data_sparksql.json
"""

import json
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_DIR = os.path.join(BASE_DIR, 'src', 'data', 'json')

print(f"Working in base directory: {BASE_DIR}")
print(f"Target JSON directory: {JSON_DIR}")

# ==============================================================================
# 1. NEW CONCEPTS (data_concepts.json)
# ==============================================================================
NEW_CONCEPTS = [
    {
        "id": "open-format-parquet-anatomy",
        "term": "Apache Parquet Hybrid Columnar Anatomy",
        "category": "DATALAKE ARCHITECTURE",
        "difficulty": "EASY",
        "definition": "A self-describing, hybrid columnar storage format organized into Row Groups, Column Chunks, and Pages with a Thrift metadata footer.",
        "explanation": "Parquet partitions data horizontally into Row Groups (typically 128MB to 512MB in size), and within each row group, data is sliced vertically into Column Chunks. Each column chunk consists of Data Pages and optional Dictionary Pages. A 4-byte magic number 'PAR1' borders the file header and footer. Crucially, the FileMetaData resides in the footer, containing exact byte offsets, schema definitions, and column statistics (min/max values, null counts). This architecture enables SQL engines to read only the requested columns (projection pushdown) and skip unneeded row groups entirely (predicate pushdown) by scanning the footer before reading any payload bytes.",
        "keyPoints": [
            "Hybrid layout: Horizontal Row Groups containing vertical Column Chunks and compressed Data Pages.",
            "Thrift metadata footer contains file-level, row-group-level, and column-level statistics (min, max, null count).",
            "Enables projection pushdown (reading only required columns) and predicate pushdown (skipping irrelevant row groups without decompression)."
        ]
    },
    {
        "id": "open-format-orc-stripes",
        "term": "Apache ORC Stripe Architecture & Built-in Indexes",
        "category": "DATALAKE ARCHITECTURE",
        "difficulty": "EASY",
        "definition": "An optimized columnar format dividing data into self-contained Stripes (typically 64MB-256MB) with built-in index streams and bloom filters.",
        "explanation": "Optimized Row Columnar (ORC) files are composed of Stripes, a File Footer, and a tiny Postscript at the very end. Within each stripe, data is segregated into Index Data, Row Data, and a Stripe Footer. The index data contains lightweight column statistics (min/max, sum, hasNull) recorded for every block of 10,000 rows (row index stride), alongside optional Bloom filters for high-cardinality equality lookups. The postscript contains file compression parameters and footer byte lengths. Because the stripe footer is read before data streams, query engines like Hive, Trino, and Synapse can skip entire stripes or 10,000-row chunks with zero disk I/O.",
        "keyPoints": [
            "Organized into large Stripes (64MB-256MB) terminating in a Postscript and File Footer.",
            "Built-in row index strides track min/max statistics every 10,000 rows for granular intra-stripe row skipping.",
            "Native Bloom filter indexes accelerate high-cardinality point queries (e.g. UUID, customer_id lookups)."
        ]
    },
    {
        "id": "open-format-avro-row-binary",
        "term": "Apache Avro Binary Row Format & Schema Evolution",
        "category": "DATALAKE ARCHITECTURE",
        "difficulty": "EASY",
        "definition": "A compact, row-based binary serialization format with a JSON-encoded schema stored in the file header, designed for streaming and RPC.",
        "explanation": "Unlike Parquet or ORC, Apache Avro serializes data row-by-row into contiguous binary blocks separated by 16-byte cryptographic sync markers. Avro files are self-describing because the exact JSON schema is embedded in the file metadata header. Avro excels at high-throughput write serialization in streaming ingestion platforms (Kafka, Event Hubs) because appending a row requires zero column splitting or memory buffering. It provides industry-standard schema evolution rules (backward, forward, full compatibility) via schema resolution: when reading an Avro file, the reader schema is compared against the writer schema, inserting default values for missing attributes without corrupting data.",
        "keyPoints": [
            "Row-oriented binary storage:Contiguous records grouped into blocks punctuated by 16-byte sync markers.",
            "Full JSON schema embedded in file header ensures self-describing portability across disparate systems.",
            "Gold standard for streaming message brokers (Kafka/Event Hubs) due to ultra-fast row-level serialization and robust schema evolution."
        ]
    },
    {
        "id": "sql-ingest-copy-into-mpp",
        "term": "High-Throughput SQL Ingestion via COPY INTO",
        "category": "SQL SERVER",
        "difficulty": "EASY",
        "definition": "The standard high-performance T-SQL declarative command for parallel, distributed bulk ingestion from cloud storage into relational SQL tables.",
        "explanation": "The COPY INTO statement is the modern, flexible successor to PolyBase for MPP architectures like Azure Synapse Dedicated SQL Pools, Snowflake, and Fabric Warehouses. In Synapse MPP, COPY INTO bypasses external data source and format object creation, allowing data engineers to load Parquet, ORC, or CSV files from ADLS Gen2 with a single T-SQL command using Managed Identity (MSI), SAS keys, or Service Principals. In distributed architectures, the Control node assigns storage file splits across all 60 compute distributions, streaming data directly into target staging heaps or Clustered Columnstore tables in parallel.",
        "keyPoints": [
            "Single-statement declarative bulk ingestion from cloud object storage (ADLS Gen2, AWS S3) into relational tables.",
            "Distributed parallel execution across compute nodes/distributions without requiring external table DDL.",
            "Built-in support for Managed Identity, custom column mappings, reject limits (MAXERRORS), and auto-detection."
        ]
    },
    {
        "id": "sql-ingest-polybase-architecture",
        "term": "PolyBase Distributed Query & External Tables",
        "category": "SQL SERVER",
        "difficulty": "EASY",
        "definition": "A database virtualization and scale-out ingestion technology that maps non-relational storage files into SQL relational external tables.",
        "explanation": "PolyBase integrates SQL Server and Synapse Dedicated SQL Pools with external data stored in Azure Data Lake, Blob Storage, or Hadoop HDFS. It relies on three database objects: MASTER KEY / DATABASE SCOPED CREDENTIAL (security), EXTERNAL DATA SOURCE (storage location), and EXTERNAL FILE FORMAT (Parquet, ORC, DelimitedText). When querying an external table, PolyBase's Data Movement Service (DMS) scales out across compute nodes to read, parse, and distribute external files. Ingestion is accomplished using CREATE TABLE AS SELECT (CTAS) or INSERT INTO ... SELECT, transferring data from external tables into internal columnstore tables.",
        "keyPoints": [
            "Decouples storage from compute: Virtualizes external Parquet/CSV files as queryable relational tables.",
            "Requires 3 foundational objects: Scoped Credential, External Data Source, and External File Format.",
            "Utilizes Data Movement Service (DMS) to distribute external storage chunk reads across compute nodes."
        ]
    },
    {
        "id": "sql-ingest-openrowset-serverless",
        "term": "T-SQL OPENROWSET Serverless Data Lake Querying",
        "category": "SQL SERVER",
        "difficulty": "EASY",
        "definition": "A built-in T-SQL table-valued function that enables instant, serverless querying of data lake files without provisioning managed tables.",
        "explanation": "In Azure Synapse Serverless SQL Pools and Fabric SQL Endpoints, OPENROWSET acts as a bridge between T-SQL and raw cloud object storage. By specifying the file URL and FORMAT = 'PARQUET' (or 'DELTA' / 'CSV'), users can immediately filter, join, and aggregate files stored in ADLS Gen2. When querying Parquet or Delta, OPENROWSET automatically leverages column projection and min/max statistics pushdown. Furthermore, it supports the CREATE EXTERNAL TABLE AS SELECT (CETAS) command to transform and materialize raw formats into curated Parquet datasets, or feed downstream relational ingestion pipelines.",
        "keyPoints": [
            "Instant ad-hoc querying of Parquet, Delta, and CSV files in ADLS Gen2 without upfront table provisioning.",
            "Serverless cost model: Pay strictly for the volume of data scanned (benefiting directly from Parquet columnar projection).",
            "Pairs with CETAS to transform and materialize query results back into optimized columnar lake storage."
        ]
    },
    {
        "id": "open-format-compression-codecs",
        "term": "Columnar Compression Codecs: Snappy vs ZSTD vs GZIP",
        "category": "DATALAKE ARCHITECTURE",
        "difficulty": "MEDIUM",
        "definition": "Algorithm trade-offs between compression ratio, CPU encode/decode throughput, and splittability for lakehouse columnar files.",
        "explanation": "In columnar storage, compression is applied at the individual Page or Stripe level after lightweight encoding (dictionary, RLE, bit-packing). Snappy delivers high decompress/compress throughput (250-500 MB/s per core) with moderate compression ratios (~3x), making it the historical default for analytical SQL engines where query latency trumps storage cost. Zstandard (ZSTD) offers configurable compression levels (1-22), achieving 30-50% higher compression density than Snappy while matching or exceeding its decompression speed at level 1-3. GZIP yields high compression ratios but imposes heavy CPU decompression penalties (50-100 MB/s per core) and is non-splittable when used on standalone text files.",
        "keyPoints": [
            "Snappy: Blazing-fast decompression with moderate compression; optimized for CPU-bounded low-latency SQL scans.",
            "Zstandard (ZSTD): Modern lakehouse standard delivering superior compression ratios with near-Snappy read speeds.",
            "GZIP: High compression ratio but CPU-intensive; non-splittable on raw text files, causing single-thread MPP bottlenecks."
        ]
    },
    {
        "id": "open-format-dictionary-encoding",
        "term": "Dictionary Encoding & Run-Length Encoding (RLE)",
        "category": "DATALAKE ARCHITECTURE",
        "difficulty": "MEDIUM",
        "definition": "Lightweight compression techniques that replace repeated string values with compact bit-packed integer keys prior to page compression.",
        "explanation": "Columnar formats achieve their high storage efficiency by grouping values of the same type together, enabling domain-specific encodings before applying general-purpose compressors (Snappy/ZSTD). In Dictionary Encoding, a Dictionary Page builds an array of unique values (e.g. State names: 'CA', 'NY', 'TX'). Subsequent Data Pages store only the compact integer index of each value, bit-packed into 2 to 4 bits per row. If duplicate values appear contiguously (e.g., sorted columns), Run-Length Encoding (RLE) compresses repetitions into (count, value) pairs. During SQL query execution, engines can evaluate WHERE filters directly against the dictionary keys without decoding strings, achieving orders-of-magnitude faster filtering.",
        "keyPoints": [
            "Replaces repetitive data values with small integer keys in a dedicated Dictionary Page.",
            "Bit-packing ensures integers consume only the minimum required bits (e.g., 3 bits for 8 distinct values).",
            "Enables vectorized SQL engines to execute equality predicates directly against integer dictionary indexes."
        ]
    },
    {
        "id": "sql-ingest-schema-drift",
        "term": "Schema Drift & Type Coercion during SQL Loading",
        "category": "SQL SERVER",
        "difficulty": "MEDIUM",
        "definition": "Structural and type discrepancies between source file formats and relational SQL target tables that cause ingest failures or data corruption.",
        "explanation": "Schema drift occurs when upstream application pipelines introduce new columns, rename fields, or widen data types. In open file formats like Parquet, types are strictly typed (e.g. INT64, Utf8, Timestamp[us]). When loading into SQL tables with fixed DDL (e.g., Synapse or Snowflake), discrepancies trigger catastrophic batch failures. Common type coercion pitfalls include: (1) Parquet INT64 loaded into SQL INT (overflow error), (2) Parquet UTC timestamps without timezone loaded into SQL DATETIME2, causing silent 5-hour timezone shifts, and (3) Positional vs. Name-based column binding, where reordered columns in CSV/Parquet populate wrong SQL table fields.",
        "keyPoints": [
            "Mismatched data types (e.g. INT64 vs SQL INT) trigger runtime numeric overflow or abort the entire COPY batch.",
            "Timestamp precision differences (nanoseconds in Parquet vs 100ns in SQL DATETIME2) can cause precision loss or parse errors.",
            "Modern engines use MATCH_BY_COLUMN_NAME or Auto Loader schema rescue columns to isolate drifting attributes safely."
        ]
    },
    {
        "id": "sql-ingest-decimal-mismatch",
        "term": "Decimal Precision & Scale Mismatch Pitfalls",
        "category": "SQL SERVER",
        "difficulty": "MEDIUM",
        "definition": "Incompatibilities between Spark/Parquet 128-bit decimal implementations and SQL relational decimal scale constraints.",
        "explanation": "Parquet encodes decimal numbers using fixed-length byte arrays (4, 8, or 16 bytes depending on precision). PySpark frequently defaults to DECIMAL(38, 18) for arithmetic calculations. When a high-throughput SQL loading command (`COPY INTO` or PolyBase) attempts to insert this data into a SQL table column defined as DECIMAL(18, 2), relational engines encounter scale/precision overflow. In SQL Server/Synapse, if the integer component of the incoming number exceeds (TargetPrecision - TargetScale), the engine throws an unrecoverable arithmetic overflow error. Production pipelines must enforce explicit CAST transformations in upstream Silver layers prior to staging.",
        "keyPoints": [
            "Spark frequently defaults unconfigured floating-point calculations to DECIMAL(38, 18).",
            "SQL target tables with tighter precision (e.g. DECIMAL(18, 2)) reject records where integer digits exceed (p - s).",
            "Requires automated schema validation gates or explicit staging views with ROUND() and CAST() safeguards."
        ]
    },
    {
        "id": "sql-ingest-reject-limits",
        "term": "Ingestion Rejection Limits & Error File Quarantining",
        "category": "SQL SERVER",
        "difficulty": "MEDIUM",
        "definition": "Error tolerance thresholds and automated bad-record logging mechanisms in SQL bulk loading commands.",
        "explanation": "When loading millions of records from open file formats into SQL tables, malformed records (unparseable dates, string overflow, corrupted delimiters) can abort multi-hour bulk loads. Commands like Synapse `COPY INTO` provide `MAXERRORS = <n>` and `ERRORFILE = '<path>'`. If `MAXERRORS` is set to 100, the loader tolerates up to 100 rejected rows, writing the offending rows and specific error reason codes into an external error directory in ADLS Gen2. If the threshold is exceeded, the entire transaction rolls back. Production best practices mandate setting MAXERRORS = 0 for financial ledgers, and MAXERRORS > 0 with downstream DLQ reconciliation for clickstream ingest.",
        "keyPoints": [
            "MAXERRORS specifies the maximum number of malformed rows allowed before the transaction aborts and rolls back.",
            "ERRORFILE directs the SQL engine to write rejected rows and error diagnostic text files directly into cloud storage.",
            "Provides an automated Dead Letter Queue (DLQ) pattern directly inside the database ingestion layer."
        ]
    },
    {
        "id": "lakehouse-delta-transaction-log",
        "term": "Delta Lake ACID Transaction Log & Checkpointing",
        "category": "DATALAKE ARCHITECTURE",
        "difficulty": "MEDIUM",
        "definition": "An ordered, append-only JSON log (_delta_log/) coupled with Parquet checkpoints that guarantees ACID isolation over raw cloud storage.",
        "explanation": "Delta Lake transforms raw Parquet files into resilient relational tables by tracking all file modifications in a `_delta_log/` directory. Each atomic transaction writes a JSON commit file (e.g. `000000.json`, `000001.json`) detailing added files, removed files, schema updates, and commit metadata. Every 10 commits, Delta writes a Parquet checkpoint file that consolidates all prior transactions, preventing the query engine from having to replay thousands of JSON files. When a SQL engine queries a Delta table, it reconciles the transaction log to identify the exact active file set for snapshot isolation, preventing dirty reads of concurrent writes or deleted records.",
        "keyPoints": [
            "Append-only JSON commit files in _delta_log/ record exact file additions, removals, and schema changes atomically.",
            "Every 10 commits, a multi-part Parquet checkpoint consolidates state for instant snapshot reconstruction.",
            "Provides Serializable / WriteSerializable isolation on top of eventually consistent cloud object storage."
        ]
    },
    {
        "id": "lakehouse-iceberg-metadata-tree",
        "term": "Apache Iceberg Hierarchical Metadata Tree",
        "category": "DATALAKE ARCHITECTURE",
        "difficulty": "MEDIUM",
        "definition": "A 4-tier metadata hierarchy (Catalog -> Metadata JSON -> Manifest List -> Manifest Files) enabling partition evolution and snapshot isolation.",
        "explanation": "Apache Iceberg manages open lakehouse tables through a decoupled metadata tree. At the root, the Iceberg Catalog stores the pointer to the current `metadata.json`. The `metadata.json` tracks table schemas, partition specs, and snapshots. Each snapshot points to a Manifest List (an Avro file) containing an array of Manifest Files. Each Manifest File tracks individual Parquet/ORC data files along with partition field values, row counts, and column-level upper/lower bounds. Because file statistics reside in the manifest layer, SQL engines can prune unneeded data files before reading storage, enabling hidden partitioning, partition spec evolution without rewriting data, and field-ID schema evolution.",
        "keyPoints": [
            "4-tier hierarchy: Catalog -> Metadata JSON -> Snapshot Manifest List (Avro) -> Manifest Files -> Data Files (Parquet).",
            "Hidden partitioning: Users query by standard timestamp columns while Iceberg automatically prunes days/months under the hood.",
            "Field ID mapping: Schema columns are tracked by unique numeric IDs, allowing seamless renames and reordering."
        ]
    },
    {
        "id": "open-format-small-file-syndrome",
        "term": "Small File Syndrome in Data Lake Ingestion",
        "category": "GENERAL DE",
        "difficulty": "HARD",
        "definition": "Performance degradation and storage throttling caused by millions of micro-batch files (under 10MB) flooding lakehouse directories.",
        "explanation": "When streaming pipelines (Spark Structured Streaming, Kafka Connect, Flink) write records every few seconds to cloud storage, they generate millions of sub-megabyte Parquet or JSON files. This triggers severe architectural bottlenecks: (1) Object storage API limits: Each file requires an HTTPS GET request, TLS handshake, and metadata lookup, rapidly triggering AWS S3 / ADLS Gen2 503 SlowDown egress throttling. (2) Metadata explosion: SQL engines spend 90% of query execution time deserializing Parquet footers across 500,000 files rather than reading data. (3) Ingestion stalls: MPP loaders running COPY INTO crawl to single-digit MB/s throughput. Remediation requires automated bin-packing compaction (Delta OPTIMIZE, Iceberg rewrite_data_files) targeting 128MB-512MB file sizes.",
        "keyPoints": [
            "Caused by high-frequency streaming writes producing millions of sub-10MB files in lake storage.",
            "Saturates cloud storage IOPS/TPS limits, inducing HTTP 503 SlowDown errors and network connection stalls.",
            "Remediated via bin-packing compaction (target 128MB-512MB file size) using Delta OPTIMIZE or Iceberg compaction."
        ]
    },
    {
        "id": "sql-ingest-mpp-resource-classes",
        "term": "Synapse MPP Resource Classes & Columnstore Compression RAM",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "Workload management memory allocations required to prevent Clustered Columnstore row group spilling to TempDB during bulk loads.",
        "explanation": "In Azure Synapse Dedicated SQL Pools, loading millions of rows into a Clustered Columnstore Index (CCI) requires substantial RAM on each distribution to dictionary-encode, sort, and compress 1,048,576 rows per rowgroup. By default, users belong to the `smallrc` resource class, which allocates only ~100MB of RAM per query on DWU1000c. When loading large Parquet files under `smallrc`, the engine runs out of memory, trims rowgroups prematurely to <100,000 rows, or spills dictionaries to TempDB, degrading load speed by 15x-20x. Assigning the loading user to `largerc`, `xlargerc`, or a dynamic Workload Management Group with 20%+ memory grant ensures optimal full 1M rowgroups without disk spilling.",
        "keyPoints": [
            "Default smallrc (~100MB RAM) starves columnstore encoders during large Parquet bulk ingestion.",
            "Insufficient memory forces premature row group trimming (<100K rows) and massive TempDB spill latencies.",
            "Production loaders must use largerc / xlargerc or staticrc60 to guarantee 1,048,576-row compressed rowgroups."
        ]
    },
    {
        "id": "sql-ingest-multiline-gzip-stall",
        "term": "Non-Splittable Compression & Multiline Record Bottlenecks",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "The serialization choke point where compressed text files cannot be split, forcing a distributed cluster down to a single core.",
        "explanation": "In distributed SQL systems (Synapse, Spark, Snowflake), files are split across cores and distributions for parallel processing. GZIP, standard ZLIB, and multiline CSV files with embedded newlines enclosed in quotes are fundamentally non-splittable: a reader cannot seek to an arbitrary byte offset because it cannot determine whether a byte sequence represents a row delimiter or compressed payload. When a 20GB `.csv.gz` file is loaded via COPY INTO, only one single compute distribution can decompress and read the file from start to finish, leaving the other 59 distributions idle. Best practices mandate converting raw text to splittable Parquet/BZIP2 or generating multiple uncompressed chunked files upstream.",
        "keyPoints": [
            "GZIP and multiline quoted CSV files cannot be split at arbitrary byte boundaries across cluster nodes.",
            "Forces MPP engines (Synapse 60 distributions) to serialize ingestion through a single worker core.",
            "Upstream pipelines must produce native splittable formats (Parquet, ORC) or partitioned 100MB uncompressed files."
        ]
    },
    {
        "id": "sql-ingest-bom-header-corruption",
        "term": "UTF-8 Byte Order Mark (BOM) & Header Alignment Corruption",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "Hidden 3-byte prefixes (0xEF, 0xBB, 0xBF) in Windows-generated text files that break column 1 mapping in relational bulk loaders.",
        "explanation": "When text files (CSV, TSV) are exported from Windows tools or legacy databases, they often prepend a 3-byte UTF-8 Byte Order Mark (BOM: `0xEF, 0xBB, 0xBF`) to the beginning of the stream. In strict distributed loaders (PolyBase, Synapse COPY INTO), the engine does not discard the BOM by default. Instead, it prepends the BOM bytes to the first column name in the header or the first field value of row 1. As a result, column mapping fails with 'Column [Field1] not found' (it sees `ï»¿Field1`), or row 1 fails type conversion to INT/DATE. Automated ingestion pipelines must include a pre-flight BOM detection and stripping step (via Python or ADF) before triggering SQL bulk copy.",
        "keyPoints": [
            "Hidden 3-byte prefix (0xEF, 0xBB, 0xBF) corrupts the first column identifier or first row data field.",
            "Causes mysterious 'Column not found' errors in COPY INTO when resolving schema headers by name.",
            "Requires automated pre-ingestion BOM stripping or configuring encoding explicitly (e.g. UTF-8 without BOM)."
        ]
    },
    {
        "id": "lakehouse-deletion-vectors-internals",
        "term": "Delta Lake Deletion Vectors (Roaring Bitmaps)",
        "category": "DATALAKE ARCHITECTURE",
        "difficulty": "HARD",
        "definition": "A soft-delete storage optimization that tracks deleted rows via Roaring Bitmap files, avoiding full Parquet file rewrites.",
        "explanation": "In traditional Copy-on-Write (COW) lakehouse tables, updating or deleting a single row in a 500MB Parquet file requires the engine to read the entire file, filter out the record, and write a brand new 500MB Parquet file (1000x write amplification). Delta Lake Deletion Vectors (DV) eliminate this write penalty. When a DELETE or MERGE operation executes, Delta writes a tiny auxiliary Deletion Vector file (using compact Roaring Bitmaps) recording the 0-indexed row positions that were modified. When SQL engines query the table, they read the original Parquet file and skip rows marked in the deletion vector in memory. Full file rewrites are deferred to scheduled background compaction jobs (`OPTIMIZE`).",
        "keyPoints": [
            "Soft-delete mechanism: Writes tiny Roaring Bitmap index files rather than rewriting entire 500MB Parquet files.",
            "Reduces write amplification during SQL MERGE and DELETE operations by up to 99%.",
            "Read-side penalty is minimal (sub-millisecond bitmap lookup in RAM); compacted during scheduled maintenance."
        ]
    },
    {
        "id": "sql-ingest-direct-lake-vertipaq",
        "term": "Fabric Direct Lake Mode: Zero-ETL VertiPaq Paging",
        "category": "SQL SERVER",
        "difficulty": "ARCHITECT",
        "definition": "A semantic layer breakthrough where Power BI's in-memory VertiPaq engine directly memory-maps Delta Parquet columns from OneLake.",
        "explanation": "Direct Lake mode eliminates traditional ETL/ELT pipelines between the data lake and the relational data warehouse. In classic architectures, data is copied from raw lake storage, transformed, loaded into a relational SQL database, and then imported into an in-memory semantic model (Import Mode). In Fabric Direct Lake, the VertiPaq analytical engine bypasses the SQL relational layer entirely: it reads the columnar Delta Parquet files directly from OneLake storage, loading only the requested column chunks into RAM on demand. Delta Parquet files optimized with V-Order align perfectly with VertiPaq's internal memory structures, delivering the sub-second query performance of Import Mode with the instant data freshness of DirectQuery.",
        "keyPoints": [
            "Bypasses SQL relational staging entirely: VertiPaq memory-maps Delta Parquet files directly from OneLake.",
            "Eliminates latency between data landing and reporting: Power BI reports reflect Spark/DLT commits immediately.",
            "V-Order sorting applied at write time enables zero-recompression column paging straight into server RAM."
        ]
    },
    {
        "id": "sql-ingest-petabyte-staged-pipeline",
        "term": "Petabyte-Scale Staged Ingestion & Partition Switching",
        "category": "SQL SERVER",
        "difficulty": "ARCHITECT",
        "definition": "An enterprise MPP ingestion architecture utilizing unindexed round-robin heap staging, CTAS, and atomic partition metadata swaps.",
        "explanation": "Loading tens of terabytes of Parquet data directly into a production Clustered Columnstore table creates severe table lock contention, index fragmentation, and high transaction log overhead. The enterprise architectural blueprint uses a 3-stage pipeline: (1) Parallel Ingest: `COPY INTO` streams raw Parquet files into a temporary Round-Robin HEAP staging table with zero indexes, maximizing raw I/O throughput. (2) Transformation & Compression: A `CREATE TABLE AS SELECT` (CTAS) builds an isolated interim Clustered Columnstore table partitioned identically to the target production table, utilizing large resource classes for maximum compression. (3) Metadata Switch: An `ALTER TABLE ... SWITCH PARTITION` command atomically swaps the interim partition into the production fact table in <100 milliseconds with zero user downtime.",
        "keyPoints": [
            "Stage 1: Load into unindexed Round-Robin Heap staging table via COPY INTO for maximum network throughput.",
            "Stage 2: Materialize and compress into interim Clustered Columnstore table via CTAS with high memory grants.",
            "Stage 3: Atomically switch partitions into production fact table (sub-100ms metadata pointer swap, zero locking)."
        ]
    },
    {
        "id": "open-format-catalog-federation",
        "term": "Unified Lakehouse Catalog Federation & REST APIs",
        "category": "DATALAKE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "Decoupled catalog architecture enabling disparate query engines (Spark, Trino, Snowflake, Synapse) to share Iceberg/Delta tables via REST.",
        "explanation": "In modern multi-cloud architectures, organizations avoid vendor lock-in by decoupling data storage from engine catalogs. The Apache Iceberg REST Catalog specification defines an open HTTP protocol for catalog operations (get-table, commit-transaction, rename-table). Engines like Snowflake, Databricks, AWS Athena, and Trino query and mutate the exact same underlying Parquet/Iceberg tables in ADLS Gen2 or S3 simultaneously. Conflict resolution is handled via optimistic concurrency control (OCC) at the catalog commit endpoint. This eliminates cross-platform data copying and ETL replication while enabling uniform Unity Catalog or Polaris governance across enterprise ecosystems.",
        "keyPoints": [
            "Standardized HTTP OpenAPI specification decoupling engine execution from metadata catalog storage.",
            "Enables Snowflake, Databricks, Trino, and Fabric to read and write the exact same underlying Parquet files.",
            "Optimistic Concurrency Control (OCC) at the catalog endpoint ensures atomic commits and snapshot integrity."
        ]
    }
]

# ==============================================================================
# 2. NEW QUESTIONS (questions.json)
# ==============================================================================
NEW_QUESTIONS = [
    # EASY (6 questions)
    {
        "id": "q-openformat-easy-01",
        "source": "Core Architect",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Columnar vs Row-Oriented Storage Fundamentals",
        "difficulty": "EASY",
        "question": "What is the fundamental architectural difference between row-oriented formats (CSV, Avro) and columnar formats (Parquet, ORC), and why does columnar storage drastically accelerate analytical SQL queries?",
        "answer": "The fundamental difference lies in how records are physically serialized and laid out on disk or cloud object storage:\n\n1. Row-Oriented Storage (CSV, Avro):\nData is stored record by record: Row 1 (all columns), followed by Row 2 (all columns), and so on. To read even a single column (e.g., `SELECT SUM(salary) FROM employees`), the query engine must seek through and read every single row's bytes off disk, including all unneeded columns (names, addresses, binary blobs). This makes row formats optimal for transactional OLTP workloads (inserting, updating, or fetching complete individual records) but highly inefficient for analytics.\n\n2. Columnar Storage (Parquet, ORC):\nData is sliced and stored column by column: all values for Column A are stored contiguously, then all values for Column B, etc. For analytical queries (OLAP) which typically aggregate a small subset of columns across billions of rows, columnar storage provides two immense advantages:\n- Projection Pushdown (I/O Reduction): The query engine reads only the byte ranges on disk corresponding to the requested columns, skipping 80-95% of total table data.\n- Superior Compression: Storing identical data types contiguously allows run-length encoding (RLE), dictionary encoding, and algorithms like Snappy/ZSTD to compress data by 3x-10x compared to raw text.",
        "domain": "Lakehouse & Storage",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "open-format-parquet-anatomy"
    },
    {
        "id": "q-openformat-easy-02",
        "source": "Core Architect",
        "category": "SQL SERVER",
        "niche": "High-Throughput Bulk Ingestion Syntax",
        "difficulty": "EASY",
        "question": "How does the T-SQL COPY INTO statement improve upon legacy PolyBase for loading Parquet files into Azure Synapse Dedicated SQL Pools, and what is its standard syntax?",
        "answer": "The T-SQL `COPY INTO` command is the modern, preferred bulk loading mechanism in Azure Synapse Dedicated SQL Pools, offering substantial operational and performance improvements over legacy PolyBase:\n\n1. Simplified DDL & Object Management: PolyBase requires pre-creating three separate database-scoped objects before loading data: an `EXTERNAL DATA SOURCE`, an `EXTERNAL FILE FORMAT`, and an `EXTERNAL TABLE` with strict column definitions. In contrast, `COPY INTO` requires only the target relational table and a single declarative T-SQL statement.\n\n2. Flexible Security & Authentication: `COPY INTO` natively supports Azure Active Directory (AAD) Managed Identity (MSI), Service Principals, and Shared Access Signatures (SAS) directly within the `CREDENTIAL` clause without requiring database master keys.\n\n3. High-Throughput Distributed Loading: In MPP pools, the control node coordinates file distributions directly, achieving load throughput exceeding 1 TB/hour.\n\nStandard Syntax for Parquet with Managed Identity:\n```sql\nCOPY INTO dbo.FactSales\nFROM 'https://myaccount.dfs.core.windows.net/curated/sales/*.parquet'\nWITH (\n    FILE_TYPE = 'PARQUET',\n    CREDENTIAL = (IDENTITY = 'Managed Identity'),\n    COMPRESSION = 'snappy',\n    AUTO_CREATE_TABLE = 'OFF'\n);\n```",
        "domain": "Data Pipelines & Ingestion",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "sql-ingest-copy-into-mpp"
    },
    {
        "id": "q-openformat-easy-03",
        "source": "Core Architect",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Parquet Splittability & Distributed Processing",
        "difficulty": "EASY",
        "question": "Why are Parquet files splittable across distributed worker nodes even though they contain compressed binary data, whereas GZIP-compressed CSV files are not?",
        "answer": "File splittability is essential for distributed compute engines (Spark, Synapse MPP, Presto, Snowflake) to divide a large file across multiple worker cores in parallel.\n\n1. Parquet Splittability Mechanism:\nA Parquet file is organized into self-contained horizontal units called **Row Groups** (typically 128MB to 512MB). Each row group contains complete metadata (column chunk byte offsets, sizes, and dictionary references) recorded in the Thrift FileMetaData footer. A distributed query coordinator reads the file footer first. It then assigns individual Row Groups to different worker threads or executor nodes. Each worker can seek directly to its assigned byte offset, decompress its specific row group independently, and parse records without coordinating with other nodes.\n\n2. Why GZIP CSV Files Are Non-Splittable:\nGZIP uses the DEFLATE algorithm, which maintains a dynamic sliding dictionary (up to 32KB) that relies on preceding byte sequences across the entire stream. A worker node cannot jump into byte offset 500,000,000 of a `.csv.gz` file and begin decompressing because it lacks the preceding dictionary state. Furthermore, it cannot identify where record boundaries begin. Consequently, a 20GB GZIP text file must be read sequentially by a single core, eliminating the parallelism of distributed systems.",
        "domain": "Lakehouse & Storage",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "open-format-parquet-anatomy"
    },
    {
        "id": "q-openformat-easy-04",
        "source": "Core Architect",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Streaming Event Ingestion Formats",
        "difficulty": "EASY",
        "question": "What are the architectural advantages of using Apache Avro over Parquet or CSV for landing raw transactional event streams from Kafka into a cloud data lake?",
        "answer": "While Parquet is the undisputed king of analytical querying (OLAP), Apache Avro is the industry-standard choice for real-time streaming ingestion (Kafka, Event Hubs, Flink) and raw Bronze layer landing for three reasons:\n\n1. Append & Write Performance: Avro is a row-oriented binary format. When an event streaming worker consumes a message, it can serialize and append the record immediately to an active block. Parquet, by contrast, must buffer hundreds of thousands of rows in RAM to construct columnar chunks and build dictionary pages before flushing a Row Group. Buffering in high-throughput streams causes high memory pressure and latency.\n\n2. Strict Schema Governance via Schema Registry: Avro integrates directly with the Confluent / Azure Schema Registry. Producers and consumers exchange messages containing only a 4-byte Schema ID and raw binary payload. The JSON schema is looked up once and cached, saving up to 70% network payload compared to verbose JSON strings.\n\n3. Robust Schema Evolution: Avro enforces strict mathematical compatibility rules (Backward, Forward, Full). When upstream microservices add new optional fields with default values, downstream consumers and lake landing jobs continue processing without pipeline crashes.",
        "domain": "Lakehouse & Storage",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "open-format-avro-row-binary"
    },
    {
        "id": "q-openformat-easy-05",
        "source": "Core Architect",
        "category": "SQL SERVER",
        "niche": "Serverless Data Lake Virtualization",
        "difficulty": "EASY",
        "question": "How does Synapse Serverless SQL use OPENROWSET with FORMAT = 'PARQUET' to query data lake files directly without provisioning relational tables, and how does it optimize cost?",
        "answer": "In Azure Synapse Serverless SQL Pools, `OPENROWSET` acts as an on-demand SQL query engine over raw cloud storage files in ADLS Gen2:\n\n1. Mechanism: You write standard T-SQL referencing the file path directly in the `FROM` clause:\n```sql\nSELECT\n    account_id,\n    SUM(transaction_amount) AS total_spend\nFROM OPENROWSET(\n    BULK 'https://storageaccount.dfs.core.windows.net/gold/transactions/*.parquet',\n    FORMAT = 'PARQUET'\n) AS [result]\nWHERE transaction_date >= '2024-01-01'\nGROUP BY account_id;\n```\n\n2. Cost & Performance Optimization:\nSynapse Serverless charges strictly by data scanned ($5 per TB scanned). Because Parquet stores data in columnar format with min/max statistics:\n- **Projection Pushdown**: If the table contains 100 columns but the query SELECTs only 3 columns, Serverless SQL downloads and reads only those 3 column chunks from ADLS Gen2, reducing scanned volume and query cost by 97%.\n- **Predicate Pushdown**: The serverless engine evaluates the WHERE clause against row group statistics. Any row group where `max_date < '2024-01-01'` is skipped without reading payload data.",
        "domain": "Data Modeling & SQL",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "sql-ingest-openrowset-serverless"
    },
    {
        "id": "q-openformat-easy-06",
        "source": "Core Architect",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Parquet Metadata Footer & Query Pushdown",
        "difficulty": "EASY",
        "question": "What exact metadata is contained in the Parquet FileMetaData footer, and how do SQL query engines use it to minimize physical disk I/O?",
        "answer": "The Parquet file footer contains a Thrift-serialized `FileMetaData` structure located immediately before the final 4-byte `PAR1` magic number:\n\n1. Contents of FileMetaData:\n- **Schema**: Full structural definition (column names, logical and physical types, repetition levels).\n- **Number of Rows**: Total record count across the entire file.\n- **Row Group Metadata List**: For each Row Group in the file:\n  - Byte offset and total byte size of each Column Chunk.\n  - Encodings applied (Dictionary, Plain, RLE).\n  - Compression codec used (Snappy, ZSTD, GZIP).\n  - **Column Statistics**: Minimum value, Maximum value, Null value count, and Distinct value count.\n\n2. How SQL Engines Minimize I/O:\nWhen a query executes `SELECT colA FROM table WHERE colB > 500`:\n- The engine issues a range-request HTTP call to read strictly the last 64KB-512KB of the file (the footer).\n- **Row Group Pruning**: It inspects `colB`'s min/max stats in the footer. If a row group has `max(colB) = 450`, the engine completely skips downloading all bytes for that row group.\n- **Column Chunk Seeking**: For remaining row groups, it seeks directly to the byte offsets for `colA` and `colB`, ignoring all other columns entirely.",
        "domain": "Lakehouse & Storage",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "open-format-parquet-anatomy"
    },

    # MEDIUM (7 questions)
    {
        "id": "q-openformat-med-01",
        "source": "Core Architect",
        "category": "SQL SERVER",
        "niche": "Ingestion Error Handling & Reject Limits",
        "difficulty": "MEDIUM",
        "question": "How do you configure and execute COPY INTO in Azure Synapse to load Parquet files with automatic error capture and reject limits, and how are malformed records quarantined?",
        "answer": "In production Synapse pipelines, unhandled schema drift or corrupted rows can cause multi-hour ingestion batches to fail. You configure `COPY INTO` with fault-tolerant error boundaries using `MAXERRORS` and `ERRORFILE`:\n\n```sql\nCOPY INTO dbo.StagingWebClicks (\n    click_id 1,\n    user_id 2,\n    event_timestamp 3,\n    ip_address 4,\n    url 5\n)\nFROM 'https://datalakeprod.dfs.core.windows.net/raw/clicks/2024/03/*.parquet'\nWITH (\n    FILE_TYPE = 'PARQUET',\n    CREDENTIAL = (IDENTITY = 'Managed Identity'),\n    COMPRESSION = 'snappy',\n    MAXERRORS = 500,               -- Allow up to 500 bad records before aborting\n    ERRORFILE = '/rejections/clicks_load_202403/' -- Quarantine location in ADLS Gen2\n);\n```\n\nHow Malformed Records Are Quarantined:\n1. When the loader encounters a row that violates data type constraints (e.g. string in a BIGINT column) or contains corrupted encoding, it increments an internal error counter.\n2. The offending row is immediately written to an auto-created subfolder in the `ERRORFILE` storage location, accompanied by a `.bad` file containing the raw row bytes and an `.error.txt` diagnostic file detailing the exact distribution ID, row number, and SQL error message (e.g. `Error converting data type VARCHAR to BIGINT`).\n3. If errors remain below `MAXERRORS`, the valid records commit successfully. An automated downstream monitoring pipeline parses the `.error.txt` files to alert on schema drift.",
        "domain": "Data Pipelines & Ingestion",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "sql-ingest-reject-limits"
    },
    {
        "id": "q-openformat-med-02",
        "source": "Core Architect",
        "category": "SQL SERVER",
        "niche": "Snowflake Semi-Structured Vectorized Ingest",
        "difficulty": "MEDIUM",
        "question": "How does Snowflake's COPY INTO command handle semi-structured JSON and nested Parquet files using the VARIANT data type and MATCH_BY_COLUMN_NAME?",
        "answer": "Snowflake provides industry-leading native support for loading semi-structured data directly from Parquet, ORC, and JSON files without complex flattening ETL:\n\n1. Ingestion into a VARIANT Column:\n```sql\nCREATE OR REPLACE TABLE raw_events (\n    event_payload VARIANT,\n    ingested_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()\n);\n\nCOPY INTO raw_events (event_payload)\nFROM @my_s3_stage/events/2024/\nFILE_FORMAT = (TYPE = 'PARQUET');\n```\nSnowflake reads the nested Parquet structure and serializes it into an optimized columnar binary representation inside the `VARIANT` column, preserving full indexing and sub-column statistics.\n\n2. Direct Relational Ingestion with MATCH_BY_COLUMN_NAME:\nWhen loading directly into a typed relational table, column reordering or missing optional columns in Parquet can cause positional loads to fail. Setting `MATCH_BY_COLUMN_NAME` resolves fields by name:\n```sql\nCOPY INTO core_sales\nFROM @my_s3_stage/sales_parquet/\nFILE_FORMAT = (TYPE = 'PARQUET')\nMATCH_BY_COLUMN_NAME = CASE_INSENSITIVE\nON_ERROR = CONTINUE;  -- Skips corrupted files and logs to load history\n```\nThis enables safe schema evolution: if the Parquet file has 15 columns and the table has 12, the 3 extra columns are safely ignored; if the table has an extra nullable column, it is populated with NULL.",
        "domain": "Data Modeling & SQL",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "sql-ingest-schema-drift"
    },
    {
        "id": "q-openformat-med-03",
        "source": "Core Architect",
        "category": "SQL SERVER",
        "niche": "Decimal Precision & Scale Incompatibilities",
        "difficulty": "MEDIUM",
        "question": "What causes decimal precision mismatch ('Numeric overflow' or arithmetic truncation) when loading Parquet files with DECIMAL(38,18) into SQL relational tables, and how do you resolve it?",
        "answer": "This is one of the most pervasive production bugs encountered when integrating Spark pipelines with enterprise SQL databases:\n\n1. Root Cause Mechanics:\nIn Apache Spark, mathematical operations on floating-point or currency numbers frequently promote columns to the maximum precision default: `DECIMAL(38, 18)` (allowing 20 integer digits and 18 fractional digits). In contrast, relational SQL data warehouses (Synapse, SQL Server, Fabric) model financial columns as `DECIMAL(18, 2)` or `DECIMAL(19, 4)` to optimize storage density and memory bandwidth. When `COPY INTO` attempts to load a Parquet file containing `DECIMAL(38, 18)` into `DECIMAL(18, 2)`:\n- If an incoming value has an integer part greater than 16 digits (18 - 2), SQL throws a fatal `Arithmetic overflow error converting expression to data type numeric`.\n- Even if the value fits, strict schema enforcement in `COPY INTO` will fail because the metadata types `Decimal(38,18)` and `Decimal(18,2)` are considered incompatible physical signatures.\n\n2. Production Remediation:\n- **Upstream Silver Layer Enforcement**: Always apply explicit casting in PySpark before writing the final Parquet file:\n```python\ndf = df.withColumn('amount', F.col('amount').cast('decimal(18,2)'))\n```\n- **Staging Table Cast Pattern**: In SQL, load into a staging table using `DECIMAL(38, 18)` or `FLOAT`, and use an atomic `INSERT INTO ... SELECT CAST(amount AS DECIMAL(18,2))` with `ROUND()` to load the target fact table safely.",
        "domain": "Data Modeling & SQL",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "sql-ingest-decimal-mismatch"
    },
    {
        "id": "q-openformat-med-04",
        "source": "Core Architect",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Compression Codec Tuning for SQL Loaders",
        "difficulty": "MEDIUM",
        "question": "How do compression codecs (Snappy vs ZSTD vs GZIP) impact ingestion throughput and CPU consumption during SQL bulk loading from cloud object stores?",
        "answer": "Selecting the right compression codec for lakehouse files directly balances storage cost against SQL bulk loading throughput:\n\n1. Snappy (Balanced Throughput):\n- Decompression speed: ~500 MB/s per core.\n- Compression ratio: ~2.5x to 3x.\n- Ingestion Impact: Because decompression is lightweight and CPU-efficient, SQL loading engines (Synapse, Snowflake) can decompress data faster than the network can stream it from ADLS/S3. Snappy is ideal when bulk ingestion speed is the primary operational SLA.\n\n2. Zstandard / ZSTD (Modern Lakehouse Standard):\n- Decompression speed: ~400-800 MB/s per core (at levels 1-3).\n- Compression ratio: ~3.5x to 5x (30% smaller than Snappy).\n- Ingestion Impact: ZSTD achieves significantly higher data density with negligible CPU decompression penalties. Because smaller file sizes reduce cloud network transfer time and storage I/O, ZSTD frequently *outperforms* Snappy on network-constrained cloud loaders while reducing cloud storage bills by 30%.\n\n3. GZIP (High CPU Bottleneck):\n- Decompression speed: ~80-120 MB/s per core.\n- Ingestion Impact: GZIP severely saturates worker CPU cores during decompression. During a multi-terabyte bulk load, SQL compute nodes run at 100% CPU utilization while storage network bandwidth sits idle, doubling or tripling total load duration.",
        "domain": "Lakehouse & Storage",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "open-format-compression-codecs"
    },
    {
        "id": "q-openformat-med-05",
        "source": "Core Architect",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Avro Schema Evolution in Ingestion Pipelines",
        "difficulty": "MEDIUM",
        "question": "How do you implement schema evolution in Apache Avro when adding a new field to an ingestion pipeline without breaking downstream SQL table loads?",
        "answer": "In real-time ingestion architectures (e.g. Kafka -> ADLS Gen2 -> SQL Warehouse), microservice producers frequently add new attributes. To guarantee zero pipeline downtime, you must enforce **Full Compatibility** or **Backward Compatibility** using Avro schema resolution rules:\n\n1. Schema Definition with Default Values:\nWhen adding a new field (`loyalty_tier`) to the Avro schema, it MUST define a `default` attribute and use a union with `null`:\n```json\n{\n  \"name\": \"loyalty_tier\",\n  \"type\": [\"null\", \"string\"],\n  \"default\": null\n}\n```\nIf you omit the default value, older consumers reading new data, or new consumers reading older historical data, will throw a fatal `IncompatibleSchemaException`.\n\n2. Schema Resolution Mechanics:\nWhen an Avro reader encounters an older file missing `loyalty_tier`, the Avro deserializer reads the writer schema from the file header, compares it to the registered reader schema, notes that `loyalty_tier` is absent in the writer schema, and automatically substitutes the default value (`null`).\n\n3. Downstream SQL Table Synchronization:\nBefore promoting the new producer schema to production, execute an `ALTER TABLE dbo.FactCustomers ADD loyalty_tier VARCHAR(50) NULL;` in the target SQL data warehouse. When the downstream loader runs, the newly mapped field flows seamlessly into the SQL column.",
        "domain": "Lakehouse & Storage",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "open-format-avro-schema-evolution"
    },
    {
        "id": "q-openformat-med-06",
        "source": "Core Architect",
        "category": "SQL SERVER",
        "niche": "CSV Multiline Delimiter Pitfalls",
        "difficulty": "MEDIUM",
        "question": "When loading CSV or TSV files into SQL tables, why do multiline strings break parallel distributed ingestion, and how should upstream file generation be configured?",
        "answer": "Multiline fields—such as customer support notes, address lines, or product descriptions containing unescaped newline characters (`\\n` or `\\r\\n`) enclosed in quotes—create a severe synchronization problem in distributed SQL loaders:\n\n1. Why Multiline Breaks Distributed Ingestion:\nDistributed engines (Synapse, Spark, Snowflake) partition a 10GB CSV file by assigning byte ranges (e.g., Worker 1 reads bytes 0 to 1GB, Worker 2 reads bytes 1GB to 2GB). Worker 2 seeks to byte 1,000,000,001 and scans forward looking for the first newline character (`\\n`) to identify the start of its first row. If the file contains multiline text fields, Worker 2 cannot know whether that newline is an actual row terminator or just an embedded character inside a quoted address. If Worker 2 misinterprets an internal newline as a record delimiter, all subsequent columns are shifted, resulting in mass data corruption or type conversion failures.\n\n2. Performance Penalty of Single-Threading:\nTo handle multiline safely, loaders like PolyBase or Synapse COPY INTO force a single-threaded sequential read or disable chunking entirely, causing load times to balloon from minutes to hours.\n\n3. Production Resolution:\n- Upstream Sanitation: Configure upstream export pipelines to strip or replace line breaks (`REPLACE(col, CHAR(10), ' ')`) before generating text files.\n- Format Modernization: Mandate columnar Parquet or binary Avro for all ingestion feeds, where strings are byte-length prefixed and completely immune to delimiter collisions.",
        "domain": "Data Pipelines & Ingestion",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "sql-ingest-multiline-gzip-stall"
    },
    {
        "id": "q-openformat-med-07",
        "source": "Core Architect",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Databricks SQL Idempotent File Ingestion",
        "difficulty": "MEDIUM",
        "question": "How does Databricks SQL COPY INTO provide idempotent, incremental file loading from S3/ADLS into Delta tables, and how does it prevent duplicate row insertion?",
        "answer": "In Databricks SQL and Spark, `COPY INTO` provides an idempotent, declarative mechanism to incrementally load new files from cloud object storage without needing external state tracking tables:\n\n```sql\nCOPY INTO silver_banking_transactions\nFROM 'abfss://landing@myadls.dfs.core.windows.net/transactions/'\nFILEFORMAT = PARQUET\nFILES = ('part-001.parquet') -- optional explicit file list\nFORMAT_OPTIONS ('mergeSchema' = 'true')\nCOPY_OPTIONS ('force' = 'false');\n```\n\nHow Duplicate Prevention & Idempotency Work:\n1. Internal Ingestion Metadata Tracking: When `COPY INTO` executes with `force = 'false'`, Delta Lake records the path, file modification timestamp, and size of every successfully loaded file in the Delta table's internal transaction log metadata.\n2. Delta Re-run Protection: If the pipeline runs every 15 minutes over the same directory containing 5,000 files, `COPY INTO` scans the directory listing, compares the files against its internal commit history, and ignores the 4,950 files that were previously ingested. It reads and inserts only the 50 newly arrived files.\n3. Safe Pipeline Retries: If a pipeline run fails midway or is manually re-executed, re-running the exact same `COPY INTO` statement will not insert duplicate records. Only files that successfully committed are skipped on subsequent runs.",
        "domain": "Lakehouse & Storage",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "lakehouse-delta-transaction-log"
    },

    # HARD (8 questions)
    {
        "id": "q-openformat-hard-01",
        "source": "Core Architect",
        "category": "GENERAL DE",
        "niche": "Small File Problem & Compaction Engineering",
        "difficulty": "HARD",
        "question": "What is the Small File Syndrome in lakehouse architectures, how does it throttle SQL table loading pipelines at the network and storage layer, and how do you resolve it using bin-packing compaction?",
        "answer": "Small File Syndrome is the single most common performance killer in modern data lakes, occurring when streaming engines (Spark, Kafka Connect) write continuous micro-batches resulting in hundreds of thousands of 50KB-5MB files:\n\n1. Network & Storage Layer Bottlenecks:\n- **API Request Saturation**: Cloud object stores (S3, ADLS Gen2) enforce TPS limits per prefix (e.g., S3: 5,500 GETs/sec; ADLS: 20,000 IOPs/account). Loading 500,000 tiny files triggers HTTP 503 `SlowDown` errors and massive TLS handshake latency overhead.\n- **Metadata Footer Amplification**: For Parquet files, reading a 100KB file requires downloading its 20KB footer metadata. For 100,000 files, the SQL engine transfers gigabytes of redundant footer metadata, spending 95% of execution time establishing connections rather than streaming data.\n- **MPP Thread Starvation**: SQL loaders assign threads per file chunk. Managing millions of file pointers exhausts JVM heap memory and SQL engine worker threads.\n\n2. Engineering Remediation via Bin-Packing Compaction:\n- **Automated Compaction**: Run scheduled bin-packing jobs in the lakehouse layer prior to SQL ingestion. In Delta Lake:\n```sql\nOPTIMIZE silver_sales\nWHERE date >= CURRENT_DATE() - INTERVAL 7 DAYS\nZORDER BY (customer_id);\n```\nDelta consolidates thousands of tiny files into uniform 256MB-512MB Parquet files.\n- **Spark Auto-Compaction & Optimized Writes**:\n```python\nspark.conf.set('spark.databricks.delta.optimizeWrite.enabled', 'true')\nspark.conf.set('spark.databricks.delta.autoCompact.enabled', 'true')\n```\nThis coalesces partition writes dynamically inside Spark executors before writing to storage.",
        "domain": "Lakehouse & Storage",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "open-format-small-file-syndrome"
    },
    {
        "id": "q-openformat-hard-02",
        "source": "Core Architect",
        "category": "SQL SERVER",
        "niche": "Synapse Columnstore Compression & Memory Classes",
        "difficulty": "HARD",
        "question": "Why does loading 50M rows of Parquet directly into a Clustered Columnstore table in Azure Synapse fail or crawl to a halt under default smallrc, and how do resource classes resolve TempDB spilling?",
        "answer": "This failure is rooted in how Synapse Dedicated SQL Pools build Clustered Columnstore Indexes (CCI) across its 60 distributed compute units:\n\n1. Columnstore Compression Memory Demand:\nIn Synapse MPP, every distribution independently buffers, sorts, dictionary-encodes, and compresses incoming rows into Columnstore Row Groups. The optimal target size for a Columnstore row group is **1,048,576 rows**. Encoding wide tables (e.g. 50-100 columns) requires significant RAM on every distribution.\n\n2. The smallrc Memory Bottleneck:\nBy default, all logins belong to the `smallrc` resource class, which allocates only ~100MB of RAM per query slot. When 50M rows of Parquet are loaded via `COPY INTO` under `smallrc`:\n- The distribution cannot allocate enough memory to sort and compress a full 1M row group.\n- **Premature Row Group Trimming**: Synapse is forced to close and compress row groups early (often at 50,000 or 100,000 rows), severely degrading future query performance.\n- **TempDB Spill Crisis**: When dictionary tables exceed 100MB, the engine spills data directly to local SSD TempDB. Disk I/O becomes saturated, and load throughput collapses from 1 GB/s to 15 MB/s, or fails entirely with `Query exhausted resources`.\n\n3. Remediation via Workload Management:\nAssign the ETL loading user to `largerc`, `xlargerc`, or a dedicated Workload Group with high resource grants:\n```sql\nEXEC sp_addrolemember 'xlargerc', 'IngestionServiceUser';\n```\nWith `xlargerc` (allocating 800MB-3.2GB per distribution), row groups compress fully in RAM, TempDB spilling is completely eliminated, and ingestion achieves maximum line-rate throughput.",
        "domain": "Data Modeling & SQL",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "sql-ingest-mpp-resource-classes"
    },
    {
        "id": "q-openformat-hard-03",
        "source": "Core Architect",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Corrupted Parquet Footers & Pre-Load Validation",
        "difficulty": "HARD",
        "question": "How do corrupted Parquet file footers cause catastrophic failure during SQL batch ingestion, and how can pre-load validation scripts detect them before calling COPY INTO?",
        "answer": "In distributed cloud architectures, executor failures, spot VM evictions, or network drops can leave partially written, unclosed Parquet files in cloud object storage:\n\n1. Anatomy of a Corrupted Footer:\nA valid Parquet file terminates with a 4-byte FileMetaData length integer followed by the 4-byte ASCII magic string `PAR1`. When a write process terminates abruptly, the file exists on storage with bytes, but lacks the trailing `PAR1` magic number and Thrift footer. When `COPY INTO` encounters this file during a 10,000-file batch load:\n- The SQL engine attempts to seek and deserialize the footer.\n- Encountering invalid bytes, it raises a fatal error: `File is not a valid Parquet file. Expected magic number PAR1`.\n- The entire batch rolls back, failing SLAs.\n\n2. Pre-Load Automated Validation Script (Python/PySpark):\nBefore triggering the SQL `COPY INTO` pipeline, execute a lightweight pre-flight inspection job that validates the footer byte sequence using HTTP range requests without downloading the entire file payload:\n```python\nimport io, struct\nfrom azure.storage.filedatalake import DataLakeServiceClient\n\ndef verify_parquet_file(file_client):\n    file_prop = file_client.get_file_properties()\n    file_size = file_prop.size\n    if file_size < 8: return False\n    # Read only the last 4 bytes using HTTP range request\n    download = file_client.download_file(offset=file_size-4, length=4)\n    magic_bytes = download.readall()\n    return magic_bytes == b'PAR1'\n```\nQuarantine any corrupted files into a dead-letter directory, ensuring the subsequent `COPY INTO` runs cleanly.",
        "domain": "Lakehouse & Storage",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "open-format-parquet-anatomy"
    },
    {
        "id": "q-openformat-hard-04",
        "source": "Core Architect",
        "category": "SQL SERVER",
        "niche": "BOM Header Corruption & Character Encoding",
        "difficulty": "HARD",
        "question": "How does a UTF-8 Byte Order Mark (BOM) in raw CSV/text files cause PolyBase or COPY INTO to silently fail or misalign column 1 headers, and how do you automate BOM stripping?",
        "answer": "A Byte Order Mark (BOM) is a 3-byte sequence (`0xEF, 0xBB, 0xBF`) placed at the start of a text stream by Windows editors and legacy ETL tools to signal UTF-8 encoding:\n\n1. How the BOM Corrupts SQL Ingestion:\n- **Header Misalignment**: When `COPY INTO` or PolyBase is configured with `FIRSTROW = 2` or attempts to match header names, the SQL parser does not automatically strip the leading 3 bytes. Instead, it attaches them to the first column name. If column 1 is `customer_id`, the engine reads `ï»¿customer_id`.\n- **Column Not Found Failure**: When resolving by column name, the loader aborts with `Column 'customer_id' not found in external file`.\n- **Row 1 Data Type Conversion Error**: If `FIRSTROW = 1` (no header), the 3 bytes are prepended to the first field of the first row (e.g. `ï»¿1001`). When the engine attempts to cast this string into an `INT` or `BIGINT`, it throws an unrecoverable type conversion failure.\n\n2. Automated Remediation Architecture:\n- **ADF Pipeline Pre-processing**: In Azure Data Factory, configure the DelimitedText dataset encoding explicitly as `UTF-8` and ensure the setting `Treat as null` or copy activity setting handles BOM correctly.\n- **In-Memory Python Stream Stripper**: If using an Azure Function or Lambda ingest hook:\n```python\nwith open('source.csv', 'rb') as f:\n    content = f.read()\nif content.startswith(b'\\xef\\xbb\\xbf'):\n    content = content[3:]  # Strip BOM bytes safely\n```\n- **T-SQL PolyBase Workaround**: In Synapse, define the first column in the staging table as `NVARCHAR(100)`, and apply `SUBSTRING(col1, CHARINDEX('0', col1), LEN(col1))` during the subsequent transform.",
        "domain": "Data Pipelines & Ingestion",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "sql-ingest-bom-header-corruption"
    },
    {
        "id": "q-openformat-hard-05",
        "source": "Core Architect",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Apache Iceberg Manifest Pruning & Metadata Maintenance",
        "difficulty": "HARD",
        "question": "In Apache Iceberg, how does manifest pruning and partition evolution allow SQL engines to skip petabytes of data, and what metadata bottlenecks occur if compaction is neglected?",
        "answer": "Apache Iceberg replaces Hive's directory-listing model with a 4-tier hierarchical metadata tree, enabling fast data skipping at petabyte scale:\n\n1. Manifest Pruning & Partition Evolution:\n- **Manifest Lists & Manifest Files**: An Iceberg snapshot references a Manifest List (Avro), which contains pointers to individual Manifest Files. Each manifest file entry records the partition bounds (min/max values), row count, and column-level upper/lower bounds for each Parquet data file.\n- **Metadata-Only Pruning**: When a SQL engine executes a filtered query (e.g. `WHERE event_date = '2024-03-01'`), the query planner evaluates the WHERE filter directly against the partition bounds stored in the Manifest List. It skips entire manifest files without reading object storage file paths.\n- **Partition Evolution**: Iceberg tracks partition specs by ID. If you change partitioning from `month(event_ts)` to `day(event_ts)`, Iceberg preserves the old partition spec for historical files while applying the new spec to new writes. Zero data rewrites are required.\n\n2. Metadata Bottlenecks from Neglected Compaction:\nIf continuous streaming writes commit without regular metadata maintenance:\n- **Manifest Explosion**: Millions of individual commits produce tens of thousands of tiny manifest files, causing the metadata tree itself to exceed gigabytes in size.\n- **Planner Out of Memory**: Query planners spend 30-60 seconds just deserializing Avro manifest trees before planning the query.\n- **Remediation**: Run Iceberg maintenance procedures regularly:\n```sql\nCALL system.rewrite_manifests('prod_db.events');\nCALL system.expire_snapshots('prod_db.events', older_than => TIMESTAMP '2024-03-01 00:00:00');\n```",
        "domain": "Lakehouse & Storage",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "lakehouse-iceberg-metadata-tree"
    },
    {
        "id": "q-openformat-hard-06",
        "source": "Core Architect",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Delta Deletion Vectors vs Copy-on-Write",
        "difficulty": "HARD",
        "question": "How do Delta Lake Deletion Vectors (Roaring Bitmaps) prevent write amplification during SQL MERGE and DELETE operations compared to traditional Copy-on-Write Parquet rewrites?",
        "answer": "Delta Lake's introduction of Deletion Vectors marks a generational shift in how lakehouses handle mutations (UPDATE, DELETE, MERGE):\n\n1. Traditional Copy-on-Write (COW) Penalty:\nIn standard Parquet storage, individual files are immutable. If a CDC pipeline updates 1 row inside a 500MB Parquet file containing 2,000,000 rows:\n- The engine must read the entire 500MB file into memory.\n- Apply the update/delete.\n- Serialize and write a brand new 500MB Parquet file to cloud storage.\n- Update the transaction log to mark the old file as tombstoned (`remove`) and the new file as active (`add`).\nThis yields a massive write amplification factor of 500,000,000 to 1, causing severe I/O thrashing and high cloud storage bills.\n\n2. Deletion Vectors (DV) Architecture:\nWith Deletion Vectors enabled, the original 500MB Parquet file is left completely untouched:\n- When a DELETE or MERGE modifies a row, Delta writes an auxiliary Deletion Vector file containing a compact **Roaring Bitmap** of the row indexes (e.g. Row #412,891 is deleted).\n- The transaction log links the Deletion Vector to the base Parquet file.\n- Write latency drops from 45 seconds to 200 milliseconds, and write amplification drops by over 99%.\n\n3. Read-Side Reconcile:\nWhen a SQL engine queries the table, it reads the Roaring Bitmap into RAM and skips deleted rows inline during columnar decoding. Background maintenance jobs (`OPTIMIZE`) periodically rewrite files with high deletion density during off-peak hours.",
        "domain": "Lakehouse & Storage",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "lakehouse-deletion-vectors-internals"
    },
    {
        "id": "q-openformat-hard-07",
        "source": "Core Architect",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Transaction Log vs Raw Parquet Directory Scans",
        "difficulty": "HARD",
        "question": "Why does querying raw Parquet files directly inside a Delta Lake or Apache Iceberg directory produce ghost, duplicate, or corrupted rows, and how do SQL engines enforce log reconciliation?",
        "answer": "A frequent architectural blunder occurs when data engineers point legacy SQL tools (or ad-hoc Synapse `OPENROWSET('*.parquet')` queries) directly at the physical storage path of a Delta or Iceberg table:\n\n1. Why Direct Parquet Scanning Yields Corrupted Results:\n- **Tombstoned Files Are Read**: When a Delta table undergoes an `UPDATE`, `DELETE`, or `OPTIMIZE` compaction, the old Parquet files are marked as deleted in the transaction log, but they remain physically present on storage until `VACUUM` runs (typically 7-30 days later). Scanning the directory reads both the old uncompacted files AND the new compacted files, resulting in massive row duplication.\n- **Failed & Aborted Transactions**: If a Spark job fails midway through writing 5 Parquet files, those files remain on disk. Because they were never committed to `_delta_log/`, they are invisible to Delta readers, but a raw Parquet scan will read those phantom orphan records.\n- **Soft-Deleted Rows (Deletion Vectors)**: Files with associated Deletion Vectors still contain the deleted row data physically in the Parquet file. Only the transaction log knows which rows are invalid.\n\n2. How SQL Engines Enforce Log Reconciliation:\nModern SQL engines must query through the official table provider (`FORMAT = 'DELTA'` or via Iceberg/Unity Catalog connectors). The engine reads the transaction log first, resolves the active snapshot state, constructs the definitive set of valid file URIs, and applies deletion bitmaps before reading physical storage.",
        "domain": "Lakehouse & Storage",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "lakehouse-delta-transaction-log"
    },
    {
        "id": "q-openformat-hard-08",
        "source": "Core Architect",
        "category": "GENERAL DE",
        "niche": "Storage Egress & Network Buffer Saturation",
        "difficulty": "HARD",
        "question": "How do you troubleshoot and remediate network buffer saturation and HTTP 503 SlowDown egress throttling during massive parallel SQL loads from ADLS Gen2 or AWS S3?",
        "answer": "When an MPP SQL cluster (Synapse 60 distributions, Snowflake 32-node warehouse, or large Spark cluster) initiates a parallel `COPY INTO` across thousands of Parquet files, it can overwhelm cloud storage endpoints:\n\n1. Root Cause Mechanics:\n- **Prefix Throttling**: Cloud object stores partition scale by directory prefix. AWS S3 provides 5,500 GET requests/sec per prefix. If all 100,000 files are dumped into a flat directory (`s3://bucket/data/*.parquet`), thousands of concurrent worker threads requesting footers will saturate the prefix, throwing HTTP 503 `SlowDown` errors.\n- **ADLS Gen2 Ingress/Egress Limits**: ADLS Gen2 accounts enforce a default 60 Gbps egress limit. Massive parallel reads across 60 compute nodes will saturate account bandwidth, causing TCP connection drops and SSL handshake timeouts.\n\n2. Production Remediation Strategies:\n- **Partition Hashing / S3 Prefix Dispersal**: In S3, disperse high-throughput writes across partitioned prefixes using hash prefixes (e.g. `s3://bucket/2a8f-clicks/...`, `s3://bucket/9c1b-clicks/...`).\n- **Exponential Backoff & Jitter**: Configure storage retry policies with exponential backoff in the storage driver (`spark.hadoop.fs.azure.io.retry.max.retries = 20`, `spark.hadoop.fs.azure.io.retry.backoff.interval = 1000`).\n- **Multi-Account Storage Sharding**: For enterprise architectures loading >50TB/day, shard raw landing zones across multiple dedicated storage accounts, combining them via logical views in the SQL layer.",
        "domain": "Data Pipelines & Ingestion",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "open-format-small-file-syndrome"
    },

    # ARCHITECT (7 questions)
    {
        "id": "q-openformat-arch-01",
        "source": "Core Architect",
        "category": "SQL SERVER",
        "niche": "Petabyte-Scale MPP Bulk Loading Architecture",
        "difficulty": "ARCHITECT",
        "question": "How do you architect an end-to-end, zero-downtime ingestion pipeline loading 100TB of daily Parquet clickstream data into an MPP SQL data warehouse (Synapse/Snowflake) using staged round-robin heaps and partition switching?",
        "answer": "Loading 100TB daily directly into a live production fact table governed by a Clustered Columnstore Index (CCI) will trigger exclusive table locks, query timeouts, and heavy index fragmentation. The enterprise solution uses an atomic 3-tier staged loading pattern:\n\n1. Tier 1: High-Speed Heap Staging Load\n- Ingest incoming Parquet files into a dedicated staging table defined with `DISTRIBUTION = ROUND_ROBIN` and `HEAP` (no indexes).\n- Execute `COPY INTO` using high-concurrency Managed Identities. Because heap tables have zero index maintenance overhead and round-robin distributes rows uniformly, ingestion achieves maximum storage-to-compute throughput (2-3 GB/s).\n\n2. Tier 2: Transformation & Columnstore Pre-Compression\n- Execute a `CREATE TABLE AS SELECT` (CTAS) to populate an intermediate table structured identically to the production fact table (e.g., `DISTRIBUTION = HASH(customer_id)`, partitioned by `event_date`, and indexed with Clustered Columnstore).\n- Run under a high memory resource class (`staticrc60` / `xlargerc`). This ensures every distribution builds pristine, un-spilled 1,048,576-row Columnstore row groups.\n\n3. Tier 3: Zero-Downtime Atomic Partition Switch\n- Instead of running a multi-hour `INSERT INTO ... SELECT` against the live production table, execute:\n```sql\nALTER TABLE dbo.InterimDailyFact SWITCH PARTITION 12 TO dbo.ProductionFact PARTITION 12;\n```\n- This operation completes in <100 milliseconds because it performs an atomic metadata pointer update in the database catalog. Downstream reporting queries experience zero downtime, zero lock escalation, and instant data availability.",
        "domain": "Data Pipelines & Ingestion",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "sql-ingest-petabyte-staged-pipeline"
    },
    {
        "id": "q-openformat-arch-02",
        "source": "Core Architect",
        "category": "SQL SERVER",
        "niche": "Direct Lake Architecture & Fallback Prevention",
        "difficulty": "ARCHITECT",
        "question": "How does Microsoft Fabric's Direct Lake mode eliminate traditional ETL/ELT loading into SQL tables, and what are the architectural guardrails to prevent silent fallback to DirectQuery?",
        "answer": "Direct Lake represents a paradigm shift away from traditional bulk-loading into relational SQL databases:\n\n1. Architectural Mechanism:\nIn traditional enterprise architectures, data is read from a lake, transformed, loaded into a SQL warehouse via COPY INTO, and then imported into an in-memory tabular cache (Power BI VertiPaq) via scheduled refreshes. Fabric Direct Lake eliminates both the SQL loading step and the semantic refresh step. The VertiPaq engine directly accesses Delta Parquet files in OneLake. Because Microsoft applies **V-Order** (an advanced sorting and column compaction algorithm) when writing Delta Parquet, the on-disk file layout matches VertiPaq's in-memory structures, allowing it to page columns directly into RAM on demand.\n\n2. The Fallback Risk: Silent DirectQuery Degradation:\nIf a query exceeds Direct Lake memory thresholds or hits unsupported features, Power BI silently falls back to **DirectQuery mode**. DirectQuery converts DAX expressions into massive, slow SQL queries executed against the Lakehouse SQL endpoint, resulting in dashboard latency jumping from 300ms to 45 seconds and saturating Fabric Capacity Units (CUs).\n\n3. Guardrails to Prevent Fallback:\n- **Capacity SKU Sizing**: Monitor VertiPaq memory paging; ensure semantic models stay within the SKU RAM limit (e.g. F64 = 64 CUs, ~32GB memory grant).\n- **Upstream DAX Calculations**: Pre-calculate complex business logic in PySpark/dbt during Delta creation rather than using DAX calculated columns (which are unsupported in Direct Lake).\n- **Strict Direct Lake Enforcement**: Set the semantic model property `DirectLakeBehavior = DirectLakeOnly`. If a query cannot be satisfied via Direct Lake, it fails fast rather than silently crippling the capacity.",
        "domain": "Lakehouse & Storage",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "sql-ingest-direct-lake-vertipaq"
    },
    {
        "id": "q-openformat-arch-03",
        "source": "Core Architect",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Resilient Hybrid Lakehouse Schema Evolution",
        "difficulty": "ARCHITECT",
        "question": "Design a resilient schema evolution architecture across a hybrid Lakehouse (Iceberg/Delta) and Relational SQL Data Warehouse that handles upstream column renames, drops, and type promotions without pipeline downtime.",
        "answer": "Handling continuous schema evolution without breaking downstream SQL consumers requires decoupling the physical storage schema from the relational consumption contract:\n\n1. Field-ID Mapping in the Lakehouse Layer (Apache Iceberg):\nConfigure Iceberg to use unique integer **Field IDs** for all attributes rather than column names. When an upstream team renames `user_email` to `contact_email`, Iceberg simply updates the field's name in `metadata.json` while retaining Field ID `104`. Downstream engines read by Field ID, completely immune to naming drift. Dropping a column marks the Field ID as deleted without rewriting underlying Parquet files.\n\n2. Semantic Abstraction via Relational Views:\nNever expose raw lakehouse tables directly to SQL consumers. Instead, define an abstraction layer of SQL Views over the lakehouse tables:\n```sql\nCREATE VIEW curated.vw_customer_orders AS\nSELECT\n    order_id,\n    customer_id,\n    COALESCE(contact_email, user_email) AS customer_email,\n    CAST(order_total AS DECIMAL(18,2)) AS order_total,\n    _rescued_data\nFROM raw_lake.orders;\n```\n\n3. Dead Letter Queue & Schema Rescue (`_rescued_data`):\nConfigure Databricks Auto Loader or Snowflake with schema evolution enabled (`cloudFiles.schemaEvolutionMode = 'addNewColumns'`). If an unmapped or type-incompatible field arrives, route it to an unparsed JSON column `_rescued_data` rather than terminating the ingestion batch. Automated telemetry alerts data engineering teams to review new attributes before promoting them to the conformed semantic layer.",
        "domain": "Data Pipelines & Ingestion",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "lakehouse-iceberg-metadata-tree"
    },
    {
        "id": "q-openformat-arch-04",
        "source": "Core Architect",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Cross-Cloud Egress & Lakehouse FinOps",
        "difficulty": "ARCHITECT",
        "question": "How do you design a cost-optimized, multi-cloud ingestion framework loading Parquet and Delta tables across AWS S3 and Azure Synapse without incurring punitive cross-cloud egress fees?",
        "answer": "Transferring multi-terabyte Parquet datasets between AWS S3 and Azure Synapse over the public internet triggers two immense penalties: high data egress charges ($0.09/GB on AWS) and variable network latency that breaks ingestion SLAs. The cost-optimized multi-cloud architecture follows three principles:\n\n1. In-Cloud Columnar Pre-Filtering & Aggregation (Pushdown Ingestion):\nNever stream raw Bronze or Silver lakehouse files across cloud boundaries. Deploy a localized serverless compute layer (e.g. AWS Lambda / EMR Serverless) in the source AWS region. Run predicate and projection filtering locally: if the target Synapse warehouse needs daily sales summaries, compute the aggregation in AWS and transfer only the 100MB summary Parquet file rather than the 5TB raw clickstream, cutting egress fees by 98%.\n\n2. High-Efficiency Compression & Apache Arrow Flight:\nEncode cross-cloud payloads using **Zstandard (level 9)** or stream directly between compute clusters using **Apache Arrow Flight** over gRPC with mTLS. Arrow Flight enables zero-copy memory transfers over distributed TCP streams, saturating network interfaces without serialization overhead.\n\n3. Dedicated Cloud Interconnect (ExpressRoute + Direct Connect):\nFor enterprise environments with steady-state daily transfers >20TB, establish a dedicated cloud peering exchange (e.g. Equinix Cloud Exchange linking AWS Direct Connect to Azure ExpressRoute). Interconnect egress rates are discounted by 50-70% compared to public internet egress, while providing deterministic 10 Gbps dedicated bandwidth and sub-5ms latency.",
        "domain": "Lakehouse & Storage",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "open-format-cross-engine-catalog-federation"
    },
    {
        "id": "q-openformat-arch-05",
        "source": "Core Architect",
        "category": "DATALAKE ARCHITECTURE",
        "niche": "Open Table Format CDC Comparison",
        "difficulty": "ARCHITECT",
        "question": "Compare Apache Hudi (MOR with Bloom Filter indexes), Delta Lake (Liquid Clustering + Deletion Vectors), and Apache Iceberg (Equality Deletes) for a high-frequency CDC streaming workload loading into an analytical SQL engine.",
        "answer": "Selecting the optimal open table format for a Change Data Capture (CDC) workload (50,000 upserts/sec) loading into analytical SQL requires evaluating write latency against read query performance:\n\n1. Apache Hudi (Merge-On-Read + Bloom Filter Key Indexing):\n- **Architecture**: Hudi pairs a columnar base Parquet file with row-oriented delta log files (Avro). Incoming updates are appended to the Avro log in milliseconds. A built-in Record Key Bloom Index maps primary keys directly to base files, avoiding full file scans during lookup.\n- **Trade-off**: Blazing-fast streaming write latency (<1 second); however, analytical SQL queries must merge base Parquet and delta Avro files on-the-fly (MOR read penalty) unless asynchronous compaction is heavily provisioned.\n\n2. Delta Lake (Liquid Clustering + Deletion Vectors):\n- **Architecture**: Liquid Clustering eliminates rigid partition columns, re-clustering data dynamically based on access keys. Deletion Vectors use compact Roaring Bitmaps to soft-delete rows without rewriting Parquet files.\n- **Trade-off**: Near-zero write amplification during MERGE operations with outstanding read query performance in Databricks Photon and Microsoft Fabric. Best all-around choice for Azure/Databricks ecosystems.\n\n3. Apache Iceberg (Equality & Position Deletes):\n- **Architecture**: Tracks modifications via Position Delete files (file URI + row position) or Equality Delete files (specifying deleted key values). Supported across Snowflake, AWS Athena, Trino, and Spark.\n- **Trade-off**: Superior cross-vendor catalog interoperability and snapshot rollback; however, uncompacted Equality Delete files impose severe CPU overhead on downstream SQL engines during query planning.",
        "domain": "Lakehouse & Storage",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "lakehouse-table-format-hudi-cow-mor"
    },
    {
        "id": "q-openformat-arch-06",
        "source": "Core Architect",
        "category": "SQL SERVER",
        "niche": "Disaster Recovery & Atomic Snapshot Rollback",
        "difficulty": "ARCHITECT",
        "question": "How do you architect a disaster recovery and atomic point-in-time rollback strategy for an MPP SQL warehouse loaded continuously from open table formats?",
        "answer": "When an MPP SQL warehouse is loaded continuously via micro-batch pipelines, corrupted upstream data or buggy transform code can poison production reporting tables. The disaster recovery and rollback architecture relies on decoupled snapshot management:\n\n1. Lakehouse Layer Time Travel (The Source of Truth):\nBecause Delta Lake and Iceberg maintain append-only transaction logs with forward checkpointing, physical data files are never overwritten in-place. If bad data is loaded at 10:15 AM, the lakehouse can be rolled back instantly to an exact commit version or timestamp:\n```sql\n-- Delta Lake Time Travel\nRESTORE TABLE gold_transactions TO TIMESTAMP AS OF '2024-03-15 10:00:00';\n-- Apache Iceberg Rollback\nCALL prod.system.rollback_to_snapshot('gold_transactions', 482910481293812);\n```\n\n2. SQL Warehouse Metadata Snapshot & Restore:\nIn modern warehouses (Snowflake, Synapse, Fabric), pair the lakehouse rollback with database-level Time Travel and cloned environments:\n- **Snowflake Zero-Copy Cloning**: Before executing high-impact batch loads, create an instantaneous metadata clone (`CREATE TABLE fact_sales_bkp CLONE fact_sales;`). If the load fails, swap the clone back via atomic rename.\n- **Fabric OneLake Shortcuts**: In Microsoft Fabric, because the Warehouse reads directly from OneLake Delta tables, rolling back the Delta table version in Spark automatically reflects in the SQL Analytics Endpoint immediately without reloading data.",
        "domain": "Data Modeling & SQL",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "lakehouse-delta-transaction-log"
    },
    {
        "id": "q-openformat-arch-07",
        "source": "Core Architect",
        "category": "GENERAL DE",
        "niche": "Ingestion FinOps & Storage Performance Governance",
        "difficulty": "ARCHITECT",
        "question": "Design an automated Lakehouse-to-SQL ingestion health monitor and FinOps governor that detects file format degradation, skew, uncompacted stripes, and query memory spills in production.",
        "answer": "Operating a petabyte-scale lakehouse-to-SQL ingestion platform requires continuous observability to prevent silent cost explosions and SLA degradation:\n\n1. Telemetry Collection & Metrics Harvesting:\n- **Storage Layer**: Deploy an automated hourly telemetry scanner (PySpark/Python) that inspects table metadata via Delta `DESCRIBE DETAIL` or Iceberg `table.snapshots()`. Track: Average file size (alerting if <64MB), total file count, and deletion vector ratio (alerting if deleted rows >15% of total).\n- **Compute & Ingestion Layer**: Query engine DMVs (e.g. Synapse `sys.dm_pdw_exec_requests`, Snowflake `INFORMATION_SCHEMA.QUERY_HISTORY`, Databricks System Tables). Track: `spill_to_remote_storage_bytes`, `bytes_scanned_ratio`, and execution duration.\n\n2. Automated Remediation Engine (FinOps Governor):\n- **Dynamic Compaction Trigger**: If the monitor detects average file size dropping below 50MB across a partition prefix, it automatically dispatches an asynchronous bin-packing job (`OPTIMIZE ... ZORDER BY`) during off-peak hours.\n- **Memory Grant Auto-Tuning**: If query telemetry shows TempDB spilling during `COPY INTO` batches, the governor automatically alerts engineers to promote the ingestion workload to a larger resource class or increases the Workload Group's memory allocation.\n- **Orphan File & Snapshot Sweeper**: Enforce automated VACUUM and snapshot expiration policies (`VACUUM table RETAIN 168 HOURS`), deleting orphaned Parquet files to prevent storage cost bloat.",
        "domain": "Lakehouse & Storage",
        "subdomain": "Open File Formats & SQL Loading Architectures",
        "linked_concept_id": "open-format-small-file-syndrome"
    }
]

# ==============================================================================
# 3. NEW ARCHITECTURE BLUEPRINTS (data_architecture.json)
# ==============================================================================
NEW_ARCHITECTURES = [
    {
        "id": "arch-openformat-001",
        "source": "Architecture Hub",
        "category": "Lakehouse & MPP SQL Ingestion Architecture",
        "niche": "Petabyte-Scale Staged Ingestion with Partition Switching",
        "difficulty": "ARCHITECT",
        "question": "How do you architect an enterprise MPP bulk-ingestion engine loading 100TB daily Parquet data into Synapse Dedicated SQL Pools with zero lock contention and sub-minute cutover?",
        "answer": "### Phase 1: Conceptual Foundation & Core Architecture\nLoading petabyte-scale datasets directly into a production Clustered Columnstore table triggers severe table locks, TempDB spilling, and index fragmentation. The gold-standard enterprise architecture employs a decoupled 3-tier staging pipeline:\n1. **High-Speed Heap Staging**: Stream raw Parquet files from ADLS Gen2 directly into an unindexed `ROUND_ROBIN` Heap staging table using T-SQL `COPY INTO`. This maximizes storage bandwidth across all 60 distributions without index lock overhead.\n2. **Isolated Columnstore Compression**: Execute a `CREATE TABLE AS SELECT` (CTAS) to transform and compress data into an isolated interim table partitioned identically to production, allocating high memory grants (`staticrc60`) to build optimal 1,048,576-row Columnstore row groups.\n3. **Sub-Second Partition Switch**: Atomically swap the interim table's partition into the live production table using `ALTER TABLE ... SWITCH PARTITION`, completing in <100 milliseconds with zero user downtime.\n\n### Phase 2: Low-Level Mechanics & Implementation\n```sql\n-- 1. Ingest from ADLS Gen2 into Round-Robin Heap staging\nCREATE TABLE stage.RawClicks_Heap\nWITH (DISTRIBUTION = ROUND_ROBIN, HEAP)\nAS SELECT TOP 0 * FROM dbo.FactClicks;\n\nCOPY INTO stage.RawClicks_Heap\nFROM 'https://datalakeprod.dfs.core.windows.net/curated/clicks/date=2024-03-15/*.parquet'\nWITH (\n    FILE_TYPE = 'PARQUET',\n    CREDENTIAL = (IDENTITY = 'Managed Identity'),\n    COMPRESSION = 'snappy',\n    MAXERRORS = 100\n);\n\n-- 2. Materialize into Hash-Distributed Clustered Columnstore Interim Table\nCREATE TABLE stage.InterimClicks_20240315\nWITH (\n    DISTRIBUTION = HASH(customer_id),\n    CLUSTERED COLUMNSTORE INDEX,\n    PARTITION (event_date RANGE RIGHT FOR VALUES ('2024-03-15'))\n)\nAS SELECT \n    click_id, customer_id, event_timestamp, CAST(event_timestamp AS DATE) AS event_date, url\nFROM stage.RawClicks_Heap;\n\n-- 3. Atomic Zero-Downtime Metadata Switch into Production\nALTER TABLE stage.InterimClicks_20240315 SWITCH PARTITION 2 TO dbo.FactClicks PARTITION 2;\nDROP TABLE stage.RawClicks_Heap;\nDROP TABLE stage.InterimClicks_20240315;\n```\n\n### Phase 3: Production Hardening & Gotchas\n- **Columnstore Row Group Under-Sizing**: Running CTAS under default `smallrc` trims row groups prematurely (<100K rows). *Remediation*: Explicitly execute the load under `staticrc60` or allocate 20%+ workload group memory.\n- **Partition Boundary Alignment**: The source and target tables must have identical distribution hashes, column definitions, and partition boundary ranges, or the `SWITCH` command will fail instantly.\n- **Corrupted File Failures**: A single truncated Parquet file will abort the entire `COPY INTO` command. *Remediation*: Deploy an upstream pre-flight footer check script before invoking the T-SQL procedure."
    },
    {
        "id": "arch-openformat-002",
        "source": "Architecture Hub",
        "category": "Lakehouse & MPP SQL Ingestion Architecture",
        "niche": "Automated Small-File Compaction & Bin-Packing",
        "difficulty": "HARD",
        "question": "How do you design an automated bin-packing and compaction pipeline for high-frequency streaming sinks to eliminate ADLS/S3 HTTP 503 SlowDown errors prior to SQL ingestion?",
        "answer": "### Phase 1: Conceptual Foundation & Core Architecture\nHigh-frequency streaming engines (Spark Structured Streaming, Flink) continuously output thousands of small files (100KB-5MB) into raw data lake zones. When downstream SQL bulk loaders (Synapse `COPY INTO`, Snowflake) attempt to read these directories, they saturate storage TPS limits, generating HTTP 503 `SlowDown` errors and spending 90% of compute time deserializing metadata footers. Architecturally, an automated compaction layer must decouple streaming write ingestion from SQL read consumption by continuously bin-packing micro-batch files into standardized 256MB-512MB columnar files.\n\n### Phase 2: Low-Level Mechanics & Implementation\n```python\n# Databricks / PySpark Automated Compaction & Z-Order Pipeline\nfrom delta.tables import DeltaTable\nfrom pyspark.sql import functions as F\n\n# Configure write optimizations\nspark.conf.set('spark.databricks.delta.optimizeWrite.enabled', 'true')\nspark.conf.set('spark.databricks.delta.autoCompact.enabled', 'true')\n\ndef compact_and_cluster_partition(delta_table_path, partition_filter):\n    \"\"\"Bin-packs small files into 256MB Parquet rowgroups and applies Z-Order clustering.\"\"\"\n    delta_table = DeltaTable.forPath(spark, delta_table_path)\n    \n    # Execute bin-packing compaction on target partition\n    delta_table.optimize() \\\n        .where(partition_filter) \\\n        .executeZOrderBy('customer_id', 'transaction_timestamp')\n    \n    # Vacuum tombstoned small files older than retention threshold\n    spark.conf.set('spark.databricks.delta.vacuum.parallelDelete.enabled', 'true')\n    delta_table.vacuum(retentionHours=168)\n\n# Run compaction on newly landed streaming partition before triggering SQL COPY INTO\ncompact_and_cluster_partition('/mnt/silver/sales', \"event_date = '2024-03-15'\")\n```\n\n### Phase 3: Production Hardening & Gotchas\n- **Concurrent Write Conflict**: Running `OPTIMIZE` while streaming writes are appending can trigger concurrent transaction conflicts. *Remediation*: Use Delta Lake's native conflict resolution with WriteSerializable isolation, or isolate compactions to closed historical partitions.\n- **Storage TPS Throttling During Compaction**: Compacting 500,000 files in a single job can itself trigger S3/ADLS 503 errors. *Remediation*: Slice compaction runs by partition slices rather than executing across the entire table simultaneously.\n- **Premature Vacuum Deletions**: Running `VACUUM` with retention of 0 hours deletes files that concurrent SQL queries might be reading, throwing `FileNotFoundException`. *Remediation*: Never lower vacuum retention below 7 days in production."
    },
    {
        "id": "arch-openformat-003",
        "source": "Architecture Hub",
        "category": "Lakehouse & MPP SQL Ingestion Architecture",
        "niche": "Resilient Schema Drift Quarantine & Dead Letter Queues",
        "difficulty": "HARD",
        "question": "How do you architect a fault-tolerant lakehouse-to-SQL ingestion framework that isolates malformed records, rescues schema drift, and triggers automated alerting without breaking batch pipelines?",
        "answer": "### Phase 1: Conceptual Foundation & Core Architecture\nEnterprise pipelines ingest data from hundreds of external vendors and microservices. Sudden schema drift (new columns, type changes, malformed dates) routinely breaks rigid relational SQL bulk loaders. A resilient architecture employs a 3-layer safety net:\n1. **Auto Loader Ingestion with Rescued Data**: The ingestion engine captures unmapped or type-mismatched fields into an internal JSON column (`_rescued_data`) rather than aborting.\n2. **SQL Loader Reject Thresholds**: Relational loaders execute with `MAXERRORS` and quarantine rejected rows into an ADLS Gen2 error directory.\n3. **Dead Letter Queue (DLQ) & Telemetry**: Event Grid triggers an Azure Function whenever error files are written, alerting data engineering via Slack/PagerDuty and archiving records for replay.\n\n### Phase 2: Low-Level Mechanics & Implementation\n```python\n# 1. PySpark Auto Loader with Schema Evolution & Rescued Data\ndf_stream = spark.readStream \\\n    .format('cloudFiles') \\\n    .option('cloudFiles.format', 'json') \\\n    .option('cloudFiles.schemaLocation', '/mnt/metadata/checkpoints/orders_schema') \\\n    .option('cloudFiles.schemaEvolutionMode', 'addNewColumns') \\\n    .option('cloudFiles.rescuedDataColumn', '_rescued_data') \\\n    .load('/mnt/landing/orders/')\n\n# Cleanse and cast data to strict SQL types; route malformed rows to DLQ\ndf_valid = df_stream.filter(F.col('_rescued_data').isNull())\ndf_corrupt = df_stream.filter(F.col('_rescued_data').isNotNull())\n\n# Write clean data to Parquet for SQL COPY INTO\ndf_valid.writeStream \\\n    .format('delta') \\\n    .outputMode('append') \\\n    .option('checkpointLocation', '/mnt/metadata/checkpoints/valid_orders') \\\n    .start('/mnt/silver/valid_orders')\n\n# Write corrupted records to Dead Letter Queue (DLQ)\ndf_corrupt.writeStream \\\n    .format('parquet') \\\n    .outputMode('append') \\\n    .option('checkpointLocation', '/mnt/metadata/checkpoints/dlq_orders') \\\n    .start('/mnt/dlq/corrupted_orders')\n```\n\n### Phase 3: Production Hardening & Gotchas\n- **Silent Rescued Data Accumulation**: Rescued records can silently accumulate in the table without anyone noticing. *Remediation*: Build a Databricks SQL or Synapse alert: `SELECT COUNT(*) FROM silver_table WHERE _rescued_data IS NOT NULL` triggering automated notifications if >0.\n- **Decimal Precision Truncation**: Float values with >18 fractional digits crashing SQL loads. *Remediation*: Explicitly apply `ROUND(col, 4)` and `CAST(col AS DECIMAL(18,4))` before writing to silver Parquet.\n- **Error File Bloat in ADLS**: When `COPY INTO` generates thousands of `.error.txt` files, they can cause storage bloat. *Remediation*: Implement a 30-day lifecycle management policy on the `/rejections/` storage container."
    },
    {
        "id": "arch-openformat-004",
        "source": "Architecture Hub",
        "category": "Lakehouse & MPP SQL Ingestion Architecture",
        "niche": "Zero-Copy Lakehouse Ingestion via Fabric Direct Lake",
        "difficulty": "ARCHITECT",
        "question": "How do you architect an enterprise analytics platform on Microsoft Fabric that eliminates SQL loading pipelines entirely using OneLake Shortcuts, Delta V-Order, and Direct Lake VertiPaq paging?",
        "answer": "### Phase 1: Conceptual Foundation & Core Architecture\nTraditional enterprise business intelligence requires multi-hop ETL/ELT pipelines: extracting data from object storage, loading it into a relational SQL database via `COPY INTO`, and executing scheduled Power BI refreshes to import data into in-memory VertiPaq RAM. Microsoft Fabric Direct Lake eliminates data movement completely:\n1. **OneLake Shortcuts**: External S3 and ADLS Gen2 data lakes are virtualized directly inside Fabric OneLake without copying bytes.\n2. **Delta Parquet with V-Order**: Upstream Spark jobs write Delta tables with V-Order sorting enabled. V-Order applies dictionary encoding and columnar sorting that aligns 1:1 with VertiPaq's in-memory data structures.\n3. **Direct Lake VertiPaq Memory Paging**: Power BI queries read the Delta Parquet files directly from OneLake on demand, achieving the sub-second response times of Import Mode with real-time freshness.\n\n### Phase 2: Low-Level Mechanics & Implementation\n```python\n# 1. PySpark Notebook in Fabric Lakehouse: Enforce V-Order on Delta writes\nspark.conf.set('spark.sql.parquet.vorder.enabled', 'true')\n\n# Read raw data from external ADLS Gen2 via OneLake shortcut\ndf_raw = spark.read.table('onelake_shortcut_telemetry')\n\n# Perform silver transformation and write to managed Delta Lake table\ndf_curated = df_raw.filter(F.col('is_valid') == True) \\\n    .withColumn('metric_eur', F.round(F.col('metric_usd') * 0.92, 2))\n\n# V-Order enabled Delta Parquet write\ndf_curated.write \\\n    .format('delta') \\\n    .mode('overwrite') \\\n    .option('overwriteSchema', 'true') \\\n    .saveAsTable('gold_operational_telemetry')\n\n# 2. Fabric Semantic Model Configuration:\n# In Power BI Model View: Set Storage Mode = Direct Lake\n# Set Model Property: DirectLakeBehavior = DirectLakeOnly (fails fast rather than slow DirectQuery fallback)\n```\n\n### Phase 3: Production Hardening & Gotchas\n- **Silent DirectQuery Fallback**: Complex DAX calculated columns or unsupported Row-Level Security (RLS) trigger fallback to DirectQuery, generating slow SQL queries against the SQL endpoint. *Remediation*: Compute all calculated columns upstream in Spark; enforce RLS inside the Semantic Model.\n- **Capacity Memory Paging Ceiling**: When multi-billion row tables exceed capacity memory grants (e.g. F64 SKU memory limits), queries fail. *Remediation*: Implement partition framing in the semantic model to page only current-year data into RAM.\n- **V-Order Write Latency Overhead**: V-Order increases Spark write times by 10-15%. *Remediation*: Enable V-Order strictly on Gold consumption tables, keeping Bronze/Silver writes unconstrained."
    },
    {
        "id": "arch-openformat-005",
        "source": "Architecture Hub",
        "category": "Lakehouse & MPP SQL Ingestion Architecture",
        "niche": "Cross-Cloud Zero-Copy Federation with Apache Iceberg",
        "difficulty": "ARCHITECT",
        "question": "How do you architect a multi-cloud lakehouse federation framework where Snowflake and AWS Athena query identical Parquet files in Azure ADLS Gen2 via an open Iceberg REST catalog?",
        "answer": "### Phase 1: Conceptual Foundation & Core Architecture\nGlobal enterprises avoid multi-cloud storage duplication by decoupling data storage from engine-specific catalogs. Storing 500TB of data in ADLS Gen2 and replicating it to AWS S3 for Snowflake incurs massive cloud egress fees and synchronization lag. The solution is an **Apache Iceberg REST Catalog Architecture**:\n1. **Single Source of Truth Storage**: Data files reside exclusively in Azure ADLS Gen2 as Parquet files.\n2. **Decoupled Open Catalog**: An Iceberg REST Catalog (e.g. Apache Polaris or Unity Catalog) manages table metadata, schema evolution, and atomic snapshots.\n3. **Multi-Engine Execution**: Snowflake (via Iceberg External Tables) and AWS Athena (via Iceberg REST Catalog connectors) query the same physical Parquet files in-place without moving data.\n\n### Phase 2: Low-Level Mechanics & Implementation\n```sql\n-- Snowflake External Volume & Iceberg Table Definition over ADLS Gen2\nCREATE OR REPLACE EXTERNAL VOLUME adls_iceberg_volume\nSTORAGE_LOCATIONS = (\n    (\n        NAME = 'azure-westus-storage'\n        STORAGE_PROVIDER = 'AZURE'\n        STORAGE_BASE_URL = 'azure://myaccount.blob.core.windows.net/iceberg-data/'\n        AZURE_TENANT_ID = '72f988bf-86f1-41af-91ab-2d7cd011db47'\n    )\n);\n\n-- Create Snowflake Managed Iceberg Table referencing external REST Catalog\nCREATE OR REPLACE ICEBERG TABLE snow_lake_customers\n    EXTERNAL_VOLUME = 'adls_iceberg_volume'\n    CATALOG = 'polaris_rest_catalog'\n    CATALOG_TABLE_NAME = 'prod.customers';\n\n-- Direct SQL Query with Predicate & Projection Pushdown\nSELECT customer_id, company_name, annual_revenue\nFROM snow_lake_customers\nWHERE annual_revenue > 1000000;\n```\n\n### Phase 3: Production Hardening & Gotchas\n- **Cross-Cloud Read Latency**: Snowflake in AWS reading ADLS Gen2 over the internet experiences latency spikes. *Remediation*: Colocate compute and storage in the same physical cloud region (e.g. Snowflake on Azure East US querying ADLS Gen2 East US).\n- **Optimistic Concurrency Collisions**: Simultaneous commits from Spark and Snowflake to the REST catalog can trigger commit conflict exceptions. *Remediation*: Designate a single engine (e.g. Spark) as the primary writer, with secondary engines operating in read-only snapshot mode.\n- **Snapshot Expiration Coordination**: Deleting data files from Azure storage while Snowflake holds a cached snapshot reference throws `FileNotFoundException`. *Remediation*: Coordinate snapshot expiration exclusively through the centralized Iceberg REST catalog."
    },
    {
        "id": "arch-openformat-006",
        "source": "Architecture Hub",
        "category": "Lakehouse & MPP SQL Ingestion Architecture",
        "niche": "High-Frequency CDC Ingestion: Hudi MOR vs Delta Deletion Vectors",
        "difficulty": "ARCHITECT",
        "question": "How do you architect a high-frequency CDC ingestion pipeline (50,000 upserts/sec) from Debezium/Kafka into an analytical lakehouse comparing Apache Hudi Merge-On-Read and Delta Lake Deletion Vectors?",
        "answer": "### Phase 1: Conceptual Foundation & Core Architecture\nReplicating real-time database mutations (INSERT, UPDATE, DELETE) into an analytical lakehouse at 50,000 events/second creates extreme write amplification under classic Copy-on-Write (COW). The choice between **Apache Hudi Merge-on-Read (MOR)** and **Delta Lake with Deletion Vectors (DV)** dictates pipeline SLAs:\n- **Apache Hudi MOR**: Appends CDC mutations to row-oriented Avro delta log files in near real-time, relying on an in-memory Bloom filter key index to route writes. Asynchronous compaction merges delta logs into base Parquet files.\n- **Delta Lake Deletion Vectors**: Writes modified rows to new Parquet files and appends deleted row offsets to tiny Roaring Bitmap index files, eliminating file rewrites while preserving fast columnar scans.\n\n### Phase 2: Low-Level Mechanics & Implementation\n```python\n# Delta Lake Deletion Vector CDC Upsert via Structured Streaming\nfrom delta.tables import DeltaTable\n\n# Enable Deletion Vectors on the target table\nspark.sql(\"ALTER TABLE gold_cdc_accounts SET TBLPROPERTIES ('delta.enableDeletionVectors' = true)\")\n\ndef upsert_to_delta(microbatch_df, batch_id):\n    target_table = DeltaTable.forName(spark, 'gold_cdc_accounts')\n    \n    # Deduplicate microbatch on primary key taking latest timestamp\n    deduped_df = microbatch_df.withColumn(\n        'row_num',\n        F.row_number().over(Window.partitionBy('account_id').orderBy(F.col('op_ts').desc()))\n    ).filter(F.col('row_num') == 1)\n    \n    # Atomic Merge using Deletion Vectors (soft-delete old records, insert new)\n    target_table.alias('t').merge(\n        deduped_df.alias('s'),\n        't.account_id = s.account_id'\n    ).whenMatchedDelete(\n        condition = \"s.op_type = 'D'\"\n    ).whenMatchedUpdateAll(\n        condition = \"s.op_type = 'U'\"\n    ).whenNotMatchedInsertAll(\n        condition = \"s.op_type = 'I'\"\n    ).execute()\n\n# Run streaming query\nstreaming_query = df_cdc_stream.writeStream \\\n    .foreachBatch(upsert_to_delta) \\\n    .option('checkpointLocation', '/mnt/checkpoints/cdc_accounts') \\\n    .start()\n```\n\n### Phase 3: Production Hardening & Gotchas\n- **Deletion Vector File Accumulation**: Uncompacted deletion vector bitmaps degrade read query performance over time. *Remediation*: Schedule an hourly maintenance job executing `OPTIMIZE gold_cdc_accounts` to merge deletion vectors into base Parquet files.\n- **Out-of-Order CDC Events**: Late-arriving updates can overwrite newer records. *Remediation*: Always enforce timestamp sequence conditions in the `whenMatchedUpdate` clause: `condition = 's.op_ts > t.op_ts'`.\n- **Hudi Compaction Lag**: Under Hudi MOR, if the compaction scheduler falls behind, read queries must deserialize dozens of Avro delta logs, causing analytical queries to time out."
    }
]

# ==============================================================================
# 4. NEW CHEATSHEETS (data_cheatsheet.json)
# ==============================================================================
NEW_CHEATSHEETS = [
    {
        "id": "cs-openformat-synapse-copyinto",
        "title": "Synapse COPY INTO Parquet Tuning & Error Handling Runbook",
        "category": "SQL & Storage",
        "categorySlug": "sql-storage",
        "impact": "Critical",
        "effort": "Low Effort",
        "problem": "Synapse Dedicated SQL Pool COPY INTO statement fails with cryptic type conversion errors or crawls at 10 MB/s due to smallrc memory starvation and TempDB spilling.",
        "solution": "Assign the ETL ingestion service principal to staticrc60 or xlargerc. Use explicit column mapping in the COPY INTO statement, configure Managed Identity authentication, and set MAXERRORS with an ADLS Gen2 ERRORFILE quarantine path.",
        "codeSnippet": "-- 1. Elevate loading user memory class to prevent TempDB spill during columnstore compression\nEXEC sp_addrolemember 'staticrc60', 'ETL_Ingest_User';\n\n-- 2. Execute high-throughput COPY INTO with Managed Identity and Error File quarantine\nCOPY INTO dbo.FactOnlineSales (\n    sale_id 1,\n    customer_id 2,\n    product_id 3,\n    sale_amount 4,\n    sale_date 5\n)\nFROM 'https://adlsgen2prod.dfs.core.windows.net/curated/sales/*.parquet'\nWITH (\n    FILE_TYPE = 'PARQUET',\n    CREDENTIAL = (IDENTITY = 'Managed Identity'),\n    COMPRESSION = 'snappy',\n    MAXERRORS = 500,\n    ERRORFILE = '/rejections/sales_ingest_errors/'\n);\n\n-- 3. Verify row group quality post-load (ensure row count > 800,000 per rowgroup)\nSELECT \n    t.name AS table_name,\n    rg.row_group_id,\n    rg.total_rows,\n    rg.state_desc\nFROM sys.pdw_nodes_column_store_row_groups rg\nJOIN sys.pdw_nodes_tables nt ON rg.pdw_node_id = nt.pdw_node_id AND rg.object_id = nt.object_id\nJOIN sys.pdw_table_mappings tm ON nt.name = tm.physical_name\nJOIN sys.tables t ON tm.object_id = t.object_id\nWHERE t.name = 'FactOnlineSales';",
        "language": "sql",
        "whyItMatters": "Running COPY INTO under default smallrc forces premature rowgroup trimming (<100K rows) and TempDB disk spilling, destroying query performance for downstream BI users.",
        "metrics": "Load throughput scales from 15 MB/s to 1.2 GB/s; eliminates out-of-memory errors",
        "antiPattern": "Loading uncompressed or multiline CSV files with smallrc credentials and zero reject limit logging.",
        "tags": ["Synapse", "COPY INTO", "Parquet", "MPP", "Columnstore", "Performance", "Troubleshooting"]
    },
    {
        "id": "cs-openformat-small-file-compaction",
        "title": "Lakehouse Small File Compaction & S3/ADLS 503 Runbook",
        "category": "Spark Optimization",
        "categorySlug": "spark-optimization",
        "impact": "High Impact",
        "effort": "Low Effort",
        "problem": "SQL loading pipelines and Spark queries experience catastrophic slowdowns and HTTP 503 SlowDown errors caused by scanning 200,000 tiny (50KB) files generated by streaming sinks.",
        "solution": "Enable auto-compaction and optimized writes in the streaming writer. Deploy a scheduled bin-packing maintenance job using Delta OPTIMIZE with Z-Order clustering to target 256MB-512MB file sizes.",
        "codeSnippet": "-- 1. In Spark streaming jobs, enable auto-compaction and optimized writes\nSET spark.databricks.delta.optimizeWrite.enabled = true;\nSET spark.databricks.delta.autoCompact.enabled = true;\n\n-- 2. Run target partition bin-packing compaction in SQL\nOPTIMIZE silver_customer_events\nWHERE event_date >= CURRENT_DATE() - INTERVAL 3 DAYS\nZORDER BY (customer_id, event_timestamp);\n\n-- 3. In PySpark, inspect average file size post-compaction\nfrom delta.tables import DeltaTable\ndetail_df = spark.sql(\"DESCRIBE DETAIL silver_customer_events\")\nstats = detail_df.select(\n    (detail_df.sizeInBytes / detail_df.numFiles / 1024 / 1024).alias('avg_file_size_mb'),\n    detail_df.numFiles\n).show()",
        "language": "sql",
        "whyItMatters": "Each small file requires an HTTP GET request, TLS handshake, and metadata footer deserialization. Reading 100,000 small files is 100x slower than reading 20 500MB files.",
        "metrics": "Eliminates HTTP 503 errors; 10x-50x reduction in query scan duration",
        "antiPattern": "Writing raw streaming data directly into partitioned folders without coalescing or scheduled compaction.",
        "tags": ["Delta Lake", "Compaction", "OPTIMIZE", "Small Files", "Z-Order", "ADLS", "S3"]
    },
    {
        "id": "cs-openformat-decimal-schema-drift",
        "title": "Decimal Precision Mismatch & Schema Drift Remediation Runbook",
        "category": "Production Best Practices",
        "categorySlug": "production-best-practices",
        "impact": "High Impact",
        "effort": "Medium Effort",
        "problem": "Parquet-to-SQL ingestion fails with 'Arithmetic overflow error converting expression to data type numeric' because Spark generated DECIMAL(38,18) while SQL table expects DECIMAL(18,2).",
        "solution": "Enforce explicit schema casting in upstream Spark Silver layers, configure Auto Loader schema rescue columns, and use staged CAST views in SQL.",
        "codeSnippet": "-- 1. Upstream PySpark: Explicitly cast wide decimals before writing Parquet\nfrom pyspark.sql import functions as F\n\ndf_silver = df_bronze.withColumn(\n    'unit_price', F.col('unit_price').cast('decimal(18,2)')\n).withColumn(\n    'tax_amount', F.round(F.col('tax_amount'), 2).cast('decimal(18,2)')\n)\n\n-- 2. T-SQL Serverless/Synapse: Use OPENROWSET with explicit WITH schema to cast safely\nSELECT \n    sale_id,\n    CAST(raw_amount AS DECIMAL(18,2)) AS sale_amount\nFROM OPENROWSET(\n    BULK 'https://myaccount.dfs.core.windows.net/curated/sales/*.parquet',\n    FORMAT = 'PARQUET'\n) WITH (\n    sale_id BIGINT,\n    raw_amount DECIMAL(38,18)\n) AS [rows];",
        "language": "sql",
        "whyItMatters": "Spark defaults unconfigured mathematical expressions to DECIMAL(38, 18). When loaded into SQL tables with tighter precision constraints, unhandled rows trigger fatal transaction rollbacks.",
        "metrics": "Zero arithmetic overflow exceptions; guarantees financial ledger accuracy",
        "antiPattern": "Relying on implicit schema inference when writing Spark DataFrames to Parquet for relational database consumption.",
        "tags": ["Schema Drift", "Decimal", "Overflow", "Parquet", "PySpark", "Synapse"]
    },
    {
        "id": "cs-openformat-snowflake-parquet-variant",
        "title": "Snowflake Parquet Semi-Structured Loading & Vectorized Parsing",
        "category": "SQL & Storage",
        "categorySlug": "sql-storage",
        "impact": "High Impact",
        "effort": "Low Effort",
        "problem": "Loading nested or semi-structured Parquet files into Snowflake relational tables causes type mismatch errors or drops nested attributes.",
        "solution": "Leverage Snowflake's vectorized Parquet scanner to query stage files directly with column-path syntax, or use MATCH_BY_COLUMN_NAME to resolve columns by name rather than position.",
        "codeSnippet": "-- 1. Create target table with typed relational columns and VARIANT for nested payloads\nCREATE OR REPLACE TABLE raw_web_events (\n    event_id VARCHAR(64),\n    user_id BIGINT,\n    event_time TIMESTAMP_NTZ,\n    event_properties VARIANT,\n    ingested_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()\n);\n\n-- 2. Direct vectorized Parquet extraction from S3/Azure Stage\nCOPY INTO raw_web_events (event_id, user_id, event_time, event_properties)\nFROM (\n    SELECT \n        $1:event_id::VARCHAR,\n        $1:user_id::BIGINT,\n        $1:event_time::TIMESTAMP_NTZ,\n        $1:properties::VARIANT\n    FROM @my_cloud_stage/events/2024/03/\n)\nFILE_FORMAT = (TYPE = 'PARQUET')\nON_ERROR = 'SKIP_FILE';\n\n-- 3. Flatten nested JSON inside Snowflake without external ETL\nSELECT \n    event_id,\n    user_id,\n    f.key AS property_name,\n    f.value::STRING AS property_value\nFROM raw_web_events, \nLATERAL FLATTEN(input => event_properties) f;",
        "language": "sql",
        "whyItMatters": "Extracting fields during the COPY stage avoids intermediate text staging and allows Snowflake to leverage columnar metadata pushdown directly from Parquet files.",
        "metrics": "3x-5x faster ingestion than raw JSON; preserves nested schemas flawlessly",
        "antiPattern": "Converting Parquet back to CSV or JSON strings before loading into Snowflake.",
        "tags": ["Snowflake", "Parquet", "VARIANT", "Semi-Structured", "COPY INTO", "Vectorized"]
    }
]

# ==============================================================================
# 5. NEW MSSQL CODE RECIPES (data_mssql.json)
# ==============================================================================
NEW_MSSQL_RECIPES = [
    {
        "id": "sql-adv-copyinto-parquet",
        "title": "Synapse Dedicated SQL Pool COPY INTO with Parquet & Error Logging",
        "level": "advanced",
        "category": "Bulk Ingestion",
        "description": "Production-grade T-SQL pattern for high-throughput parallel bulk loading from ADLS Gen2 Parquet files into an MPP Clustered Columnstore table, featuring Managed Identity, column ordinal mapping, and quarantine error logging.",
        "code": "-- =====================================================================\n-- Production COPY INTO Pipeline: ADLS Gen2 Parquet to Synapse Dedicated\n-- Scenario: EU BFSI Daily Transaction Settlement Ingestion (50M rows)\n-- =====================================================================\n\n-- 1. Ensure target table is optimized with Hash Distribution and Columnstore\nCREATE TABLE dbo.FactTransactions_Staging (\n    transaction_id      VARCHAR(64)     NOT NULL,\n    account_id          BIGINT          NOT NULL,\n    customer_id         BIGINT          NOT NULL,\n    transaction_amount  DECIMAL(18, 2)  NOT NULL,\n    currency_code       CHAR(3)         NOT NULL,\n    transaction_ts      DATETIME2(3)    NOT NULL,\n    ingest_batch_id     INT             DEFAULT 20240315\n)\nWITH (\n    DISTRIBUTION = HASH(account_id),\n    CLUSTERED COLUMNSTORE INDEX\n);\n\n-- 2. Execute parallel high-throughput COPY INTO\n-- Uses Azure Managed Identity (zero secrets embedded in code)\nCOPY INTO dbo.FactTransactions_Staging (\n    transaction_id      1,\n    account_id          2,\n    customer_id         3,\n    transaction_amount  4,\n    currency_code       5,\n    transaction_ts      6\n)\nFROM 'https://eubfsidatalakeprod.dfs.core.windows.net/curated/transactions/year=2024/month=03/*.parquet'\nWITH (\n    FILE_TYPE       = 'PARQUET',\n    CREDENTIAL      = (IDENTITY = 'Managed Identity'),\n    COMPRESSION     = 'snappy',\n    MAXERRORS       = 100,               -- Allow up to 100 corrupted records before rollback\n    ERRORFILE       = '/quarantine/errors_fact_txns_20240315/', -- Output directory in ADLS\n    AUTO_CREATE_TABLE = 'OFF'\n);\n\n-- 3. Validate row counts and verify zero memory spill across distributions\nSELECT \n    COUNT(*) AS total_loaded_rows,\n    MIN(transaction_ts) AS earliest_txn,\n    MAX(transaction_ts) AS latest_txn\nFROM dbo.FactTransactions_Staging;\n\n-- Check Columnstore row group health (aiming for ~1M rows per active rowgroup)\nSELECT \n    state_desc, \n    COUNT(*) AS row_group_count,\n    SUM(total_rows) AS total_rows,\n    SUM(size_in_bytes) / 1024 / 1024 AS total_size_mb\nFROM sys.pdw_nodes_column_store_row_groups\nWHERE object_id = OBJECT_ID('dbo.FactTransactions_Staging')\nGROUP BY state_desc;",
        "notes": [
            "Always map column ordinals explicitly (col 1, col 2) when source Parquet schema order might drift",
            "Managed Identity eliminates Key Vault credential rotation overhead and secures network communication",
            "MAXERRORS quarantines malformed records in the ERRORFILE storage path for automated DLQ inspection",
            "Target table should be pre-created with HASH distribution to prevent expensive shuffle data movement post-load"
        ],
        "use_case": "Daily high-throughput bulk ingestion of 50M settled financial transactions from curated ADLS Gen2 Parquet files into Azure Synapse Dedicated SQL Pools for EU banking regulatory reporting."
    },
    {
        "id": "sql-adv-openrowset-serverless",
        "title": "Synapse Serverless T-SQL OPENROWSET with Parquet Pushdown",
        "level": "advanced",
        "category": "Data Lake Virtualization",
        "description": "Querying raw and curated Parquet files directly in ADLS Gen2 using Synapse Serverless SQL OPENROWSET. Demonstrates column projection pushdown, filepath() partition pruning, and CETAS materialization.",
        "code": "-- =====================================================================\n-- Synapse Serverless SQL: Querying Parquet Directly with Zero Infrastructure\n-- Scenario: Fraud Detection Analytics across multi-terabyte ADLS Lake\n-- =====================================================================\n\n-- 1. Direct query with column projection and partition pruning via filepath()\nSELECT\n    r.filepath(1) AS txn_year,\n    r.filepath(2) AS txn_month,\n    r.account_id,\n    COUNT(*) AS high_risk_count,\n    SUM(r.transaction_amount) AS total_flagged_eur\nFROM OPENROWSET(\n    BULK 'https://eubfsidatalakeprod.dfs.core.windows.net/curated/transactions/year=*/month=*/*.parquet',\n    FORMAT = 'PARQUET'\n) WITH (\n    account_id          BIGINT,\n    transaction_amount  DECIMAL(18, 2),\n    risk_score          TINYINT,\n    is_flagged          BIT\n) AS [r]\nWHERE\n    r.filepath(1) = '2024'               -- Partition pruning: only scans 2024 directories\n    AND r.filepath(2) IN ('01', '02', '03') -- Pruning Q1 months\n    AND r.is_flagged = 1\n    AND r.risk_score >= 8\nGROUP BY\n    r.filepath(1),\n    r.filepath(2),\n    r.account_id\nHAVING\n    SUM(r.transaction_amount) > 50000\nORDER BY\n    total_flagged_eur DESC;\n\n-- 2. CETAS: Materialize aggregated results directly back into curated Parquet\nCREATE EXTERNAL TABLE gold.Q1HighRiskSummary\nWITH (\n    LOCATION = 'gold/fraud_summaries/q1_2024/',\n    DATA_SOURCE = ADLSGen2_Curated_Source,\n    FILE_FORMAT = ParquetFormatSnappy\n)\nAS\nSELECT\n    account_id,\n    COUNT(*) AS total_txns,\n    SUM(transaction_amount) AS total_volume_eur\nFROM OPENROWSET(\n    BULK 'curated/transactions/year=2024/month=03/*.parquet',\n    DATA_SOURCE = 'ADLSGen2_Curated_Source',\n    FORMAT = 'PARQUET'\n) WITH (\n    account_id BIGINT,\n    transaction_amount DECIMAL(18,2)\n) AS [txns]\nGROUP BY account_id;",
        "notes": [
            "filepath(1), filepath(2) dynamically extract directory partition values without reading file contents",
            "WITH clause enforces strict schema casting and tells serverless engine which exact column chunks to fetch",
            "Serverless billing ($5/TB) is directly reduced by Parquet column projection and partition pruning",
            "CETAS writes results in parallel as clean Snappy-compressed Parquet files ready for Power BI or downstream tools"
        ],
        "use_case": "Ad-hoc compliance investigation on 100TB of historical banking records in ADLS Gen2, achieving sub-10 second query execution without provisioning dedicated warehouse compute."
    },
    {
        "id": "sql-adv-polybase-parquet",
        "title": "PolyBase External Data Source, File Format & External Table Setup",
        "level": "advanced",
        "category": "Data Lake Virtualization",
        "description": "Complete end-to-end DDL blueprint for configuring PolyBase to query and ingest Parquet files in Azure Synapse or SQL Server 2022, including master key, scoped credential, and CTAS ingestion.",
        "code": "-- =====================================================================\n-- PolyBase Configuration Blueprint for Enterprise Parquet Ingestion\n-- =====================================================================\n\n-- 1. Create Database Master Key if not already present\nIF NOT EXISTS (SELECT * FROM sys.symmetric_keys WHERE name LIKE '%DatabaseMasterKey%')\n    CREATE MASTER KEY ENCRYPTION BY PASSWORD = 'SecureComplexMasterKey#2024!';\n\n-- 2. Create Database Scoped Credential using Managed Identity\nCREATE DATABASE SCOPED CREDENTIAL PolyBase_MSI_Cred\nWITH IDENTITY = 'Managed Identity';\n\n-- 3. Define External Data Source pointing to ADLS Gen2 container\nCREATE EXTERNAL DATA SOURCE ADLS_Curated_Lake\nWITH (\n    TYPE = HADOOP,\n    LOCATION = 'abfss://curated@eubfsidatalakeprod.dfs.core.windows.net',\n    CREDENTIAL = PolyBase_MSI_Cred\n);\n\n-- 4. Define External File Format for Snappy-compressed Parquet\nCREATE EXTERNAL FILE FORMAT Parquet_Snappy_Format\nWITH (\n    FORMAT_TYPE = PARQUET,\n    DATA_COMPRESSION = 'org.apache.hadoop.io.compress.SnappyCodec'\n);\n\n-- 5. Create External Table over ADLS Gen2 Parquet dataset\nCREATE EXTERNAL TABLE ext.FactTransactions (\n    transaction_id      VARCHAR(64)     NOT NULL,\n    account_id          BIGINT          NOT NULL,\n    transaction_amount  DECIMAL(18, 2)  NOT NULL,\n    currency_code       CHAR(3)         NOT NULL,\n    transaction_date    DATE            NOT NULL\n)\nWITH (\n    LOCATION = '/transactions/active/',\n    DATA_SOURCE = ADLS_Curated_Lake,\n    FILE_FORMAT = Parquet_Snappy_Format\n);\n\n-- 6. Ingest into internal Clustered Columnstore fact table via CTAS\nCREATE TABLE dbo.FactTransactions_Internal\nWITH (\n    DISTRIBUTION = HASH(account_id),\n    CLUSTERED COLUMNSTORE INDEX\n)\nAS\nSELECT * FROM ext.FactTransactions;",
        "notes": [
            "PolyBase requires all 3 foundation objects: Credential, Data Source, and File Format",
            "FORMAT_TYPE = PARQUET automatically utilizes Snappy decompression natively",
            "CTAS distributes the read across all 60 MPP compute nodes, transforming external files into native columnstore",
            "For SQL Server 2022 on-premises, PolyBase connects to S3-compatible storage using S3 credentials"
        ],
        "use_case": "Enterprise hybrid data lake virtualization architecture allowing on-premises SQL Server 2022 and Synapse Dedicated Pools to ingest Azure Data Lake Parquet files directly via T-SQL."
    }
]

# ==============================================================================
# 6. NEW SPARKSQL CODE RECIPES (data_sparksql.json)
# ==============================================================================
NEW_SPARKSQL_RECIPES = [
    {
        "id": "sparksql-openformat-delta-copyinto",
        "title": "Databricks SQL COPY INTO for Incremental File Ingestion",
        "level": "intermediate",
        "category": "Lakehouse Ingestion",
        "description": "Production Databricks SQL COPY INTO pattern for idempotent, incremental file loading from cloud storage into Delta tables, featuring schema merging, validation, and file tracking.",
        "code": "-- =====================================================================\n-- Databricks SQL: Idempotent Incremental Ingestion via COPY INTO\n-- Scenario: Incremental hourly ingestion of banking payment files\n-- =====================================================================\n\n-- 1. Create target Delta table with schema and table constraints\nCREATE TABLE IF NOT EXISTS eu_bfsi_prod.silver.payment_events (\n    payment_id          STRING          NOT NULL,\n    account_id          BIGINT          NOT NULL,\n    amount_eur          DECIMAL(18, 2)  NOT NULL,\n    counterparty_iban   STRING,\n    payment_timestamp   TIMESTAMP       NOT NULL,\n    payment_status      STRING          NOT NULL,\n    ingest_time         TIMESTAMP       DEFAULT CURRENT_TIMESTAMP()\n)\nUSING DELTA\nTBLPROPERTIES (\n    'delta.autoOptimize.optimizeWrite' = 'true',\n    'delta.autoOptimize.autoCompact'   = 'true'\n);\n\n-- 2. Execute idempotent COPY INTO from ADLS Gen2 landing zone\n-- Automatically skips files previously loaded into this Delta table\nCOPY INTO eu_bfsi_prod.silver.payment_events\nFROM 'abfss://landing@eubfsidatalakeprod.dfs.core.windows.net/payments/incoming/'\nFILEFORMAT = PARQUET\nFORMAT_OPTIONS (\n    'mergeSchema' = 'false',              -- Prevent unexpected column expansion\n    'ignoreCorruptFiles' = 'false'        -- Abort immediately if corrupt file detected\n)\nCOPY_OPTIONS (\n    'force' = 'false'                     -- false = Idempotent (skip already-processed files)\n);\n\n-- 3. Check commit history and verified loaded files\nDESCRIBE HISTORY eu_bfsi_prod.silver.payment_events LIMIT 5;\n\n-- View number of added files and rows in latest commit\nSELECT \n    version,\n    timestamp,\n    operation,\n    operationMetrics.numTargetRowsInserted AS rows_inserted,\n    operationMetrics.numFilesAdded AS files_added\nFROM (DESCRIBE HISTORY eu_bfsi_prod.silver.payment_events)\nWHERE operation = 'COPY INTO'\nORDER BY version DESC\nLIMIT 1;",
        "notes": [
            "COPY INTO is completely idempotent when force = 'false' — safe to re-run on pipeline retries",
            "Delta tracks loaded file paths and timestamps in _delta_log; no external checkpoint table needed",
            "mergeSchema = 'false' enforces strict schema validation, rejecting unauthorized upstream schema changes",
            "Ideal for low-complexity scheduled batch file ingestion (every 15-60 minutes)"
        ],
        "use_case": "Automated hourly financial payment file ingestion into an Azure Databricks Delta Lake Silver table, ensuring zero duplicate records even if upstream orchestrators retry failed runs."
    },
    {
        "id": "sparksql-openformat-binpack-optimize",
        "title": "Delta Lake File Compaction, Z-Order & Liquid Clustering",
        "level": "advanced",
        "category": "Performance Tuning",
        "description": "Production optimization recipes for resolving Small File Syndrome in Delta Lake tables using OPTIMIZE bin-packing, multi-column Z-Ordering, and Liquid Clustering.",
        "code": "-- =====================================================================\n-- Delta Lake Compaction & Clustering Engineering Blueprint\n-- =====================================================================\n\n-- 1. Inspect file distribution and detect Small File Syndrome\nDESCRIBE DETAIL eu_bfsi_prod.silver.payment_events;\n-- Check avg file size: (sizeInBytes / numFiles) < 67108864 (64MB) indicates compaction needed\n\n-- 2. Execute Bin-Packing OPTIMIZE on recent active partitions\n-- Consolidates thousands of 1MB-5MB files into uniform 256MB-512MB Parquet files\nOPTIMIZE eu_bfsi_prod.silver.payment_events\nWHERE payment_timestamp >= CURRENT_DATE() - INTERVAL 14 DAYS\nZORDER BY (account_id, payment_status);\n\n-- 3. Modern Alternative: Liquid Clustering (Databricks Runtime 13.3+)\n-- Eliminates rigid partition columns; clusters dynamically without data rewriting\n-- CREATE TABLE eu_bfsi_prod.gold.fact_transactions (\n--     transaction_id STRING,\n--     account_id BIGINT,\n--     txn_date DATE,\n--     amount DECIMAL(18,2)\n-- )\n-- USING DELTA\n-- CLUSTER BY (txn_date, account_id);\n\n-- Trigger incremental re-clustering on Liquid Clustered table\n-- OPTIMIZE eu_bfsi_prod.gold.fact_transactions;\n\n-- 4. Safely VACUUM expired historical files to reclaim object storage costs\n-- Default safety threshold is 7 days (168 hours)\nVACUUM eu_bfsi_prod.silver.payment_events RETAIN 168 HOURS;",
        "notes": [
            "OPTIMIZE bin-packs files to target size (default 1GB, or configured spark.databricks.delta.optimize.maxFileSize)",
            "Z-Order colocates multidimensional data points, maximizing column min/max statistics skipping",
            "Liquid Clustering replaces static partitioning and Z-Order, allowing clustering keys to be changed on-the-fly",
            "VACUUM deletes physically tombstoned files from ADLS Gen2, freeing up cloud storage expenses"
        ],
        "use_case": "Weekly maintenance runbook for a Tier-1 retail banking lakehouse, reducing query scan time by 80% and saving $4,000/month in cloud object storage overhead."
    },
    {
        "id": "sparksql-openformat-jdbc-synapse-bulk",
        "title": "PySpark High-Throughput Bulk Write to Synapse SQL Pool",
        "level": "advanced",
        "category": "Engine Interoperability",
        "description": "High-speed parallel bulk export from PySpark DataFrames directly into Azure Synapse Dedicated SQL Pools using the Synapse Spark-to-SQL connector and ADLS Gen2 staging.",
        "code": "# =====================================================================\n# PySpark: High-Throughput Bulk Copy to Synapse Dedicated SQL Pool\n# Scenario: Exporting 20M curated risk scoring records to Synapse\n# =====================================================================\n\nfrom pyspark.sql import functions as F\n\n# 1. Prepare curated DataFrame with strict SQL data types\ndf_curated = spark.table('eu_bfsi_prod.gold.daily_credit_risk_scores') \\\n    .select(\n        F.col('assessment_id').cast('string'),\n        F.col('account_id').cast('bigint'),\n        F.col('risk_score').cast('decimal(5,2)'),\n        F.col('regulatory_tier').cast('string'),\n        F.col('calculated_date').cast('date')\n    )\n\n# 2. Configure Synapse Dedicated SQL Pool connection parameters\nsynapse_server   = 'eubfsisynapseprod.sql.azuresynapse.net'\nsynapse_database = 'DedicatedPool01'\nsynapse_table    = 'dbo.FactCreditRiskScores'\n\n# Staging storage account in ADLS Gen2 for intermediate PolyBase / COPY INTO transfer\ntemp_storage_dir = 'abfss://synapsestaging@eubfsidatalakeprod.dfs.core.windows.net/staging_txns'\n\n# 3. Write DataFrame to Synapse using Azure Synapse Apache Spark to Synapse SQL connector\n# In Databricks or Synapse Spark, this utilizes high-speed distributed COPY INTO under the hood\ndf_curated.write \\\n    .format('com.microsoft.sqlserver.jdbc.spark') \\\n    .mode('append') \\\n    .option('url', f'jdbc:sqlserver://{synapse_server}:1433;database={synapse_database}') \\\n    .option('dbtable', synapse_table) \\\n    .option('user', 'IngestServicePrincipal') \\\n    .option('password', dbutils.secrets.get(scope='azure-key-vault', key='synapse-sql-pwd')) \\\n    .option('tempDir', temp_storage_dir) \\\n    .option('forwardSparkAzureStorageCredentials', 'true') \\\n    .option('bulkCopyTableLock', 'true') \\\n    .option('bulkCopyBatchSize', '100000') \\\n    .save()\n\nprint('Successfully staged and loaded curated DataFrame into Synapse Dedicated Pool.')",
        "notes": [
            "Connector writes PySpark partitions to ADLS Gen2 tempDir, then dispatches COPY INTO to Synapse in parallel",
            "bulkCopyTableLock = true significantly accelerates throughput by minimizing SQL transaction lock escalation",
            "bulkCopyBatchSize = 100000 balances executor memory buffers with network packet transmission",
            "Avoids single-threaded JDBC driver bottlenecks by executing distributed parallel loading across MPP nodes"
        ],
        "use_case": "End-of-day risk reporting pipeline in Azure Databricks exporting multi-gigabyte risk scoring aggregates into Azure Synapse Dedicated SQL Pools for executive Power BI dashboards."
    }
]


def update_json_file(filename, new_entries, key_identifier='id'):
    filepath = os.path.join(JSON_DIR, filename)
    if not os.path.exists(filepath):
        print(f"ERROR: {filepath} does not exist!")
        return 0

    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    existing_keys = {item.get(key_identifier) for item in data if key_identifier in item}
    before_count = len(data)

    added = 0
    for entry in new_entries:
        entry_key = entry.get(key_identifier)
        if entry_key and entry_key in existing_keys:
            print(f"  Skipping duplicate {key_identifier}: {entry_key}")
            continue
        data.append(entry)
        existing_keys.add(entry_key)
        added += 1

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Updated {filename}: {before_count} -> {len(data)} (+{added} entries)")
    return added


def main():
    print("--- Commencing Deep Open File Formats & SQL Loading Knowledge Injection ---")

    c_added = update_json_file('data_concepts.json', NEW_CONCEPTS, key_identifier='id')
    q_added = update_json_file('questions.json', NEW_QUESTIONS, key_identifier='id')
    a_added = update_json_file('data_architecture.json', NEW_ARCHITECTURES, key_identifier='id')
    cs_added = update_json_file('data_cheatsheet.json', NEW_CHEATSHEETS, key_identifier='id')
    m_added = update_json_file('data_mssql.json', NEW_MSSQL_RECIPES, key_identifier='id')
    s_added = update_json_file('data_sparksql.json', NEW_SPARKSQL_RECIPES, key_identifier='id')

    print("\n--- Summary of Injected Content ---")
    print(f"Concepts added:     {c_added}")
    print(f"Questions added:    {q_added}")
    print(f"Architectures added:{a_added}")
    print(f"Cheatsheets added:  {cs_added}")
    print(f"MSSQL Recipes added:{m_added}")
    print(f"SparkSQL Recipes:   {s_added}")
    print("Injection complete!")


if __name__ == '__main__':
    main()
