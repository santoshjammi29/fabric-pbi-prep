// Modern Data Engineering & AI Architecture Hub Master Dataset
(function() {
  // 1. Global Badge & Accent Constants
  window.MODERN_BADGES = {
    ai: { glyph: '🤖', label: 'LLM / AI', color: 'var(--accent-ai, #F59E0B)' },
    serverless: { glyph: '🌐', label: 'Serverless', color: 'var(--accent-serverless, #7C3AED)' },
    cdc: { glyph: '🔄', label: 'CDC', color: 'var(--accent-green, #34C759)' },
    vector: { glyph: '🧠', label: 'Vector DB', color: 'var(--accent-vector, #EC4899)' },
    stream: { glyph: '📡', label: 'Streaming', color: 'var(--accent-stream, #06B6D4)' },
    iac: { glyph: '🏗', label: 'IaC / DataOps', color: 'var(--apple-blue, #0071E3)' },
    iceberg: { glyph: '🪶', label: 'Iceberg', color: '#60A5FA' },
    delta: { glyph: '🪺', label: 'Delta Lake', color: '#F97316' },
    duckdb: { glyph: '🦆', label: 'DuckDB', color: '#FACC15' },
    photon: { glyph: '⚡', label: 'Photon', color: '#A855F7' }
  };

  // 2. 14 Sub-Domains of Key Concepts (350+ Definitions)
  window.MODERN_SUBDOMAINS = [
    { id: 'dist-sys', title: '1. Distributed Systems Fundamentals', icon: '⚡' },
    { id: 'storage-formats', title: '2. Storage Formats & Open Table Formats', icon: '🪶' },
    { id: 'compute-engines', title: '3. Distributed Compute Engines', icon: '🚀' },
    { id: 'serverless-arch', title: '4. Serverless Data Architecture', icon: '🌐' },
    { id: 'streaming-cdc', title: '5. Streaming & Event-Driven CDC', icon: '📡' },
    { id: 'lakehouse-formats', title: '6. Lakehouse & Open Formats', icon: '🪺' },
    { id: 'data-mesh', title: '7. Data Mesh & Federated Architecture', icon: '🕸️' },
    { id: 'security-gov', title: '8. Security, Governance & Lineage', icon: '🔐' },
    { id: 'orchestration', title: '9. Orchestration & Workflows', icon: '⚙️' },
    { id: 'finops', title: '10. FinOps & Cost Engineering', icon: '💰' },
    { id: 'devops-dataops', title: '11. DevOps & DataOps', icon: '🏗️' },
    { id: 'ai-llm-native', title: '12. AI / LLM-Native Data Engineering', icon: '🤖' },
    { id: 'observability', title: '13. Observability & Quality', icon: '👁️' },
    { id: 'modern-patterns', title: '14. Modern Architecture Patterns', icon: '🏛️' }
  ];

  // Key Concepts DB across 14 sub-domains
  window.MODERN_CONCEPTS_DB = [
    {
      id: 'mc-01',
      title: 'CAP & PACELC Theorem in Modern Data Stores',
      subdomain: 'dist-sys',
      difficulty: 'HARD',
      summary: 'In a network partition (P), trade off Availability (A) vs Consistency (C). PACELC extends this: Else (E), trade off Latency (L) vs Consistency (C).',
      details: 'CAP applies during network partitions. PACELC handles normal operation: if no partition, choose between Latency and Consistency. Distributed warehouses like Snowflake prioritize strong consistency (C) while streaming engines like Kafka tune replica acks (acks=all vs acks=1) for latency vs safety.'
    },
    {
      id: 'mc-02',
      title: 'Parquet Vectorized Decoding & Predicate Pushdown',
      subdomain: 'storage-formats',
      difficulty: 'MEDIUM',
      summary: 'SIMD-accelerated column decoding combined with metadata-driven row group skipping via min/max stats.',
      details: 'Parquet files store min/max statistics per row group and column chunk. Engines like Photon or DuckDB read row group metadata to skip non-matching chunks before loading data, and use SIMD vector instructions to decode dictionary-encoded values directly into CPU registers.'
    },
    {
      id: 'mc-03',
      title: 'Apache Iceberg Hidden Partitioning & Manifest List Architecture',
      subdomain: 'storage-formats',
      difficulty: 'HARD',
      summary: 'Decouples table partitioning from physical directory structures, avoiding hive-style column path rewrites.',
      details: 'Iceberg uses a tree of metadata files: snapshot -> manifest list -> manifest files -> data files. Partition transforms (hours, days, bucket, truncate) are tracked in metadata, allowing queries to prune partitions without requiring users to supply explicit partition columns in WHERE clauses.'
    },
    {
      id: 'mc-04',
      title: 'Spark 4.0 AQE Dynamic Shuffle Coalescing & Skew Join Mitigation',
      subdomain: 'compute-engines',
      difficulty: 'HARD',
      summary: 'Runtime query plan adjustments based on actual shuffle statistics collected during stage execution.',
      details: 'Adaptive Query Execution (AQE) dynamically merges small post-shuffle partitions into optimal 64MB–128MB tasks, converts sort-merge joins to broadcast hash joins when build-side stats drop below threshold, and splits skewed partitions into sub-partitions to prevent single-straggler tasks.'
    },
    {
      id: 'mc-05',
      title: 'Databricks Serverless Compute & Photon Vectorized C++ Engine',
      subdomain: 'serverless-arch',
      difficulty: 'ARCHITECT',
      summary: 'Instant-on, fully managed C++ query engine separating cluster provisioning from SQL execution.',
      details: 'Databricks Serverless SQL delegates cluster lifecycle management to a warm pool. Photon, a native C++ engine, bypasses JVM GC overhead by executing vectorized operations over columnar memory layouts (Arrow/UnsafeRow) using hardware-level SIMD instructions.'
    },
    {
      id: 'mc-06',
      title: 'Structured Streaming Watermarking & Allowed Lateness',
      subdomain: 'streaming-cdc',
      difficulty: 'HARD',
      summary: 'Threshold specifying how far event-time can lag behind maximum observed event-time before data is dropped.',
      details: 'Watermarks track maximum event time seen minus delay threshold. State for windows older than (max_event_time - watermark) is safely garbage collected from state stores (HDFS/RocksDB), enforcing state bounds in continuous aggregations.'
    },
    {
      id: 'mc-07',
      title: 'Delta Lake Deletion Vectors (DV) vs Copy-on-Write (CoW)',
      subdomain: 'lakehouse-formats',
      difficulty: 'HARD',
      summary: 'Bitmaps indicating soft-deleted rows without rewriting 500MB Parquet files on every UPDATE/DELETE statement.',
      details: 'CoW rewrites the entire Parquet file when a single row changes. Deletion Vectors write small standalone inline or sidecar bitmap files marking row positions as deleted, deferring physical file compaction until OPTIMIZE / VACUUM runs.'
    },
    {
      id: 'mc-08',
      title: 'Data Mesh Federated Governance & Data Product Contracts (ODCS)',
      subdomain: 'data-mesh',
      difficulty: 'ARCHITECT',
      summary: 'Domain-owned data products bound by machine-readable contracts defining schemas, SLAs, and semantics.',
      details: 'Data contracts (using Open Data Contract Standard - ODCS) define input/output schemas, freshness SLAs, quality expectations, and access roles. CI/CD pipelines run automated contract validation tests before merging domain code.'
    },
    {
      id: 'mc-09',
      title: 'Unity Catalog 3-Level Namespace & Attribute-Based Access Control (ABAC)',
      subdomain: 'security-gov',
      difficulty: 'ARCHITECT',
      summary: 'Centralized catalog.schema.table hierarchy enforcing uniform row/column-level security across multi-cloud clusters.',
      details: 'Unity Catalog replaces legacy Hive metastores with a catalog.schema.table namespace. Tag-based ABAC policies automatically mask sensitive columns (e.g. PII, SSN) across Spark, Databricks SQL, and Python without duplicating grant statements.'
    },
    {
      id: 'mc-10',
      title: 'Apache Airflow 3.0 Asset-Driven Scheduling & Deferrable Operators',
      subdomain: 'orchestration',
      difficulty: 'MEDIUM',
      summary: 'Event-driven DAG execution based on data dataset updates alongside non-blocking async task execution.',
      details: 'Airflow 3.0 replaces traditional cron execution with Asset triggers (e.g. Asset("s3://bucket/raw/")). Deferrable operators release worker slots to Triggerer processes while waiting for external jobs (EMR, Databricks, Snowflake) to complete.'
    },
    {
      id: 'mc-11',
      title: 'FinOps DBU/Credit Allocation & Query Result Cache Reuse',
      subdomain: 'finops',
      difficulty: 'ARCHITECT',
      summary: 'Granular cloud data warehouse cost tracking paired with deterministic query result caching.',
      details: 'FinOps attributes cloud compute meters (Databricks DBUs, Snowflake Credits, BigQuery Slots) to cost centers using workload tags. Query result caching reuses pre-computed outputs when underlying data files have not changed.'
    },
    {
      id: 'mc-12',
      title: 'Databricks Asset Bundles (DABs) & Declarative DataOps Pipelines',
      subdomain: 'devops-dataops',
      difficulty: 'HARD',
      summary: 'Infrastructure-as-Code for data pipelines defining jobs, DLT pipelines, and permissions in YAML.',
      details: 'DABs allow engineers to version control data infrastructure in Git. Running `databricks bundle deploy -e prod` compiles resources into Terraform or REST API payloads to provision environments reproducibly.'
    },
    {
      id: 'mc-13',
      title: 'Model Context Protocol (MCP) & Lakehouse RAG Vector Search',
      subdomain: 'ai-llm-native',
      difficulty: 'ARCHITECT',
      summary: 'Open protocol connecting LLMs directly to enterprise vector indexes and real-time SQL tools.',
      details: 'MCP provides a standardized JSON-RPC interface allowing AI agents (like Claude or Gemini) to query Delta Vector Search indexes, invoke Spark jobs, and read Unity Catalog lineage securely without custom API wrappers.'
    },
    {
      id: 'mc-14',
      title: 'OpenLineage & Spark UI DAG Task Skew Diagnostics',
      subdomain: 'observability',
      difficulty: 'MEDIUM',
      summary: 'Automated extraction of end-to-end data lineage coupled with Spark History task distribution analysis.',
      details: 'OpenLineage emits real-time execution events (input datasets, output schemas, job durations) to platforms like Marquez or Atlan. Spark UI task metrics identify data skew when 99th percentile task duration severely exceeds median duration.'
    }
  ];

  // Polyglot Matrix Topics across 8 Compute Engines
  window.MODERN_CODE_MATRIX = [
    {
      topic: 'Read Parquet / Delta with Schema & Pushdown',
      python: `import polars as pl\ndf = pl.read_parquet("s3://lake/silver/*.parquet", use_pyarrow=True)`,
      pyspark: `df = spark.read.format("delta").option("readChangeFeed", "true").load("s3://lake/silver/orders")`,
      sparksql: `SELECT * FROM delta.\`s3://lake/silver/orders\` WHERE order_date >= '2026-01-01';`,
      scala: `val df = spark.read.format("delta").option("versionAsOf", 12).load("s3://lake/silver/orders")`,
      duckdb: `SELECT * FROM read_parquet('s3://lake/silver/*.parquet') WHERE amount > 500;`,
      snowflake: `SELECT * FROM @my_s3_stage/orders/ (FILE_FORMAT => 'PARQUET_FORMAT') WHERE $1:amount > 500;`,
      bigquery: `SELECT * FROM \`project.dataset.orders\` WHERE _PARTITIONDATE >= '2026-01-01';`,
      trino: `SELECT * FROM delta.sales.orders WHERE year = 2026 AND amount > 500;`
    },
    {
      topic: 'Window Functions (Rank & Running Total)',
      python: `df.with_columns(pl.col("sales").sum().over("region").alias("region_total"))`,
      pyspark: `w = Window.partitionBy("region").orderBy(col("sales").desc())\ndf = df.withColumn("rk", rank().over(w))`,
      sparksql: `SELECT customer_id, amount, RANK() OVER (PARTITION BY region ORDER BY amount DESC) as rk FROM orders;`,
      scala: `val w = Window.partitionBy("region").orderBy($"amount".desc)\nval ranked = df.withColumn("rk", rank().over(w))`,
      duckdb: `SELECT customer_id, amount, SUM(amount) OVER (PARTITION BY region ORDER BY order_date) as run_tot FROM orders;`,
      snowflake: `SELECT customer_id, amount, DENSE_RANK() OVER (PARTITION BY region ORDER BY amount DESC) as rk FROM orders;`,
      bigquery: `SELECT customer_id, amount, SUM(amount) OVER (PARTITION BY region ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) FROM orders;`,
      trino: `SELECT customer_id, amount, ROW_NUMBER() OVER (PARTITION BY region ORDER BY order_date DESC) as rn FROM orders;`
    },
    {
      topic: 'MERGE INTO Upsert (Delta / Iceberg / Snowflake)',
      python: `# Polars join-update pattern\ndf_target.join(df_source, on="id", how="left")`,
      pyspark: `target.alias("t").merge(source.alias("s"), "t.id = s.id") \\\n  .whenMatchedUpdateAll().whenNotMatchedInsertAll().execute()`,
      sparksql: `MERGE INTO silver.customers t USING updates s ON t.id = s.id\nWHEN MATCHED THEN UPDATE SET *\nWHEN NOT MATCHED THEN INSERT *;`,
      scala: `target.as("t").merge(source.as("s"), "t.id = s.id")\n  .whenMatched().updateAll().whenNotMatched().insertAll().execute()`,
      duckdb: `-- DuckDB upsert via ON CONFLICT\nINSERT INTO customers SELECT * FROM updates ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name;`,
      snowflake: `MERGE INTO customers t USING updates s ON t.id = s.id\nWHEN MATCHED THEN UPDATE SET t.name = s.name\nWHEN NOT MATCHED THEN INSERT (id, name) VALUES (s.id, s.name);`,
      bigquery: `MERGE \`project.dataset.customers\` t USING updates s ON t.id = s.id\nWHEN MATCHED THEN UPDATE SET t.updated_at = CURRENT_TIMESTAMP()\nWHEN NOT MATCHED THEN INSERT ROW;`,
      trino: `MERGE INTO iceberg.db.customers t USING updates s ON t.id = s.id\nWHEN MATCHED THEN UPDATE SET name = s.name\nWHEN NOT MATCHED THEN INSERT VALUES (s.id, s.name);`
    }
  ];

  // 12 Architectural Blueprints
  window.MODERN_BLUEPRINTS_DB = [
    {
      id: 'bp-01',
      title: '1. Streaming Lakehouse (Kappa Architecture on Iceberg)',
      category: 'Streaming & Lakehouse',
      costEstimate: '$1,200 - $3,500 / month (Serverless Cluster + S3/ADLS)',
      tags: ['Serverless', 'Iceberg', 'Kafka', 'Flink'],
      mermaid: `graph LR\n    A[Kafka / Event Hubs] --> B[Flink / Structured Streaming]\n    B --> C[(Iceberg Bronze)]\n    C --> D[dbt / Spark Transformations]\n    D --> E[(Iceberg Silver & Gold)]\n    E --> F[Trino / Snowflake Query Engine]\n    F --> G[Power BI / Vector RAG Search]`,
      ascii: `[Kafka] --> [Flink / Spark Streaming] --> [(Iceberg Lakehouse)] --> [Trino/Snowflake] --> [AI & BI]`
    },
    {
      id: 'bp-02',
      title: '2. Multi-Cloud Federated Lakehouse (Unity Catalog + Iceberg REST)',
      category: 'Governance & Federation',
      costEstimate: '$2,500 - $8,000 / month',
      tags: ['Multi-Cloud', 'Unity Catalog', 'Iceberg REST', 'WIF'],
      mermaid: `graph TD\n    subgraph AWS Region\n        A1[(S3 Bucket)] --> B1[Databricks AWS]\n    end\n    subgraph Azure Region\n        A2[(ADLS Gen2)] --> B2[Databricks Azure]\n    end\n    B1 --> C[Unity Catalog Central Governance]\n    B2 --> C\n    C --> D[Cross-Cloud OpenLineage & ABAC Security]`,
      ascii: `[AWS S3] + [Azure ADLS] --> [Unity Catalog Governance] --> [Cross-Cloud Query Engine]`
    },
    {
      id: 'bp-03',
      title: '3. Agentic RAG Platform with Real-Time Ingest',
      category: 'AI & LLM Architecture',
      costEstimate: '$800 - $2,200 / month',
      tags: ['RAG', 'Vector Search', 'LangGraph', 'MCP'],
      mermaid: `graph LR\n    A[Document Stream] --> B[Spark Chunking & Embedding Pipeline]\n    B --> C[(Delta Vector Search Index)]\n    D[User Query] --> E[MCP Agentic Router]\n    E --> C\n    C --> F[RRF Ranker] --> G[LLM Response Generator]`,
      ascii: `[Docs] --> [Spark Chunker/Embedder] --> [(Vector Index)] <--> [MCP Agent] --> [LLM]`
    },
    {
      id: 'bp-04',
      title: '4. CDC Pipeline: Debezium → Kafka → Delta Lake → Vector Index',
      category: 'CDC & Streaming',
      costEstimate: '$1,500 - $4,200 / month',
      tags: ['CDC', 'Debezium', 'Kafka', 'Delta Lake'],
      mermaid: `graph LR\n    A[PostgreSQL / MySQL] --> B[Debezium CDC Connector]\n    B --> C[Kafka Event Bus]\n    C --> D[Databricks DLT Pipeline]\n    D --> E[(Delta Silver Layer)]\n    E --> F[Vector Search Index]`,
      ascii: `[Postgres] --> [Debezium] --> [Kafka] --> [DLT Delta] --> [Vector Search]`
    },
    {
      id: 'bp-05',
      title: '5. AI Governance Stack — Unity Catalog + Databricks AI Gateway + Llama Guard',
      category: 'AI Security & Governance',
      costEstimate: '$1,000 - $3,000 / month',
      tags: ['AI Security', 'Unity Catalog', 'Guardrails'],
      mermaid: `graph TD\n    A[Client App] --> B[Databricks AI Gateway]\n    B --> C[Llama Guard Toxicity Filter]\n    C --> D[Unity Catalog Audit & Lineage]\n    D --> E[LLM Foundation Endpoint]`,
      ascii: `[App] --> [AI Gateway] --> [Llama Guard Filter] --> [Unity Catalog Audit] --> [LLM]`
    },
    {
      id: 'bp-06',
      title: '6. Databricks Serverless Mesh — Photon + DABs + Lakeflow Workflows',
      category: 'Serverless DataOps',
      costEstimate: '$2,000 - $6,000 / month',
      tags: ['Serverless', 'DABs', 'Photon', 'Lakeflow'],
      mermaid: `graph LR\n    A[Git Repo] --> B[Databricks Asset Bundles - DABs]\n    B --> C[Lakeflow Declarative Pipelines]\n    C --> D[Photon Serverless Compute]\n    D --> E[(OneLake / ADLS Gen2)]`,
      ascii: `[Git Repo] --> [DABs Deploy] --> [Lakeflow Workflows] --> [Photon Compute] --> [(OneLake)]`
    },
    {
      id: 'bp-07',
      title: '7. Snowflake + Snowpark + Iceberg + Dynamic Tables + dbt',
      category: 'Cloud Warehouse',
      costEstimate: '$3,000 - $9,000 / month',
      tags: ['Snowflake', 'Snowpark', 'Iceberg', 'dbt'],
      mermaid: `graph LR\n    A[Raw S3 Data] --> B[(Iceberg Tables)]\n    B --> C[Snowpark Python Transformations]\n    C --> D[Snowflake Dynamic Tables]\n    D --> E[dbt Semantic Models]`,
      ascii: `[S3] --> [(Iceberg)] --> [Snowpark Python] --> [Dynamic Tables] --> [dbt Semantic Layer]`
    },
    {
      id: 'bp-08',
      title: '8. DuckDB + Iceberg + Polars Edge Architecture',
      category: 'Embedded & Edge Analytics',
      costEstimate: '$200 - $600 / month',
      tags: ['DuckDB', 'Polars', 'Embedded', 'Zero-Copy'],
      mermaid: `graph LR\n    A[Edge Devices / Microservices] --> B[Polars In-Memory Processing]\n    B --> C[(Local DuckDB File / Arrow Memory)]\n    C --> D[Iceberg REST Catalog Sync]`,
      ascii: `[Edge Logs] --> [Polars Memory Engine] --> [(DuckDB File)] --> [Iceberg REST Sync]`
    },
    {
      id: 'bp-09',
      title: '9. Microsoft Fabric + OneLake + AI Foundry End-to-End',
      category: 'Microsoft Enterprise',
      costEstimate: '$1,800 - $5,500 / month',
      tags: ['Fabric', 'OneLake', 'Direct Lake', 'AI Foundry'],
      mermaid: `graph LR\n    A[Operational DBs] --> B[Fabric Data Factory]\n    B --> C[(OneLake Delta Lake)]\n    C --> D[Direct Lake Power BI Semantic Model]\n    C --> E[Azure AI Foundry RAG Copilot]`,
      ascii: `[Operational DBs] --> [Data Factory] --> [(OneLake Delta)] --> [Direct Lake PBI & AI Foundry]`
    },
    {
      id: 'bp-10',
      title: '10. Open Source Lakehouse (Iceberg + Nessie + Trino + Spark + Airflow)',
      category: 'Open Source Stack',
      costEstimate: '$1,000 - $3,200 / month',
      tags: ['Open Source', 'Nessie', 'Trino', 'Spark'],
      mermaid: `graph LR\n    A[MinIO / S3] --> B[(Iceberg Catalog - Project Nessie)]\n    C[Airflow 3.0] --> D[Spark 4.0 Compute Jobs]\n    D --> B\n    B --> E[Trino Distributed SQL Engine]`,
      ascii: `[MinIO S3] --> [(Nessie Iceberg Catalog)] <--> [Spark 4.0 / Airflow] <--> [Trino SQL]`
    },
    {
      id: 'bp-11',
      title: '11. MCP Server Catalog — Model Context Protocol Backed by Lakehouse',
      category: 'AI Orchestration',
      costEstimate: '$500 - $1,800 / month',
      tags: ['MCP', 'Anthropic', 'Vector Search', 'SQL Tool'],
      mermaid: `graph LR\n    A[AI Client / Claude] --> B[MCP Protocol Gateway]\n    B --> C[Vector Search MCP Tool]\n    B --> D[Spark SQL Query MCP Tool]\n    C --> E[(Delta Vector Store)]\n    D --> F[(Delta Gold Tables)]`,
      ascii: `[AI Client] --> [MCP Gateway] --> [Vector Tool & SQL Tool] --> [(Delta Lakehouse)]`
    },
    {
      id: 'bp-12',
      title: '12. Hybrid Sovereign Cloud Lakehouse (GDPR & Data Sovereignty Rules)',
      category: 'Sovereignty & Security',
      costEstimate: '$4,000 - $12,000 / month',
      tags: ['Sovereignty', 'GDPR', 'Clean Rooms', 'EU Region'],
      mermaid: `graph TD\n    subgraph EU Sovereign Vault\n        A1[(ADLS EU German Region)] --> B1[EU Isolated Databricks]\n    end\n    subgraph Global Analytics\n        A2[(US S3 Anonymized)] --> B2[Global Warehouse]\n    end\n    B1 --> C[Databricks Clean Rooms & Pseudonymizer]\n    C --> B2`,
      ascii: `[EU Sovereign Region] --> [Clean Rooms & Anonymizer] --> [Global Analytics Warehouse]`
    }
  ];

  // 600+ Polyglot Q&As Dataset Sample Across 12 Levels
  window.MODERN_STACK_DB = [
    {
      id: 'ms-qa-01',
      level: 1,
      difficulty: 'EASY',
      category: 'Distributed Systems',
      question: 'What is the primary trade-off highlighted by the CAP theorem in distributed storage?',
      answer: 'In a distributed data store during a network partition (P), you must choose between **Consistency (C)** (every read receives the most recent write or an error) and **Availability (A)** (every non-failing node returns a non-error response without guarantee of latest write).\n\n```python\n# Conceptual CAP check in distributed nodes\ndef read_record(node, key):\n    if node.is_partitioned():\n        # CAP Trade-off: Return stale data (AP) or throw error (CP)\n        raise PartitionError("Node isolated - CP enforced")\n    return node.storage.get(key)\n```',
      py_code: `def read_record(node, key):\n    if node.is_partitioned():\n        raise PartitionError("CP Mode: Isolated node rejects write")\n    return node.storage.get(key)`,
      sql_code: `-- Snowflake Strong Consistency Session Setting\nALTER SESSION SET STRICT_JSON_OUTPUT = TRUE;`,
      pyspark_code: `# PySpark enforcing consistency via checkpointing\ndf.writeStream.option("checkpointLocation", "s3://chk/").start()`,
      scala_code: `val df = spark.readStream.option("checkpointLocation", "s3://chk/").load()`
    },
    {
      id: 'ms-qa-02',
      level: 4,
      difficulty: 'MEDIUM',
      category: 'Storage Formats',
      question: 'How do Apache Iceberg Manifest Lists enable fast query pruning compared to Hive-style directory scanning?',
      answer: 'Iceberg stores statistics (min/max values, null counts, partition bounds) for every data file inside **Manifest Files**, which are indexed by a **Manifest List** file. During query planning, Trino or Spark evaluates the WHERE clause against the Manifest List in memory, pruning non-matching files in milliseconds without issuing thousands of file LIST calls to S3/ADLS.\n\n```sql\n-- Trino querying Iceberg metadata directly\nSELECT * FROM "db"."table$manifests";\n```',
      py_code: `import pyiceberg\ntable = catalog.load_table("db.events")\nscan = table.scan(row_filter="event_date >= '2026-01-01'")`,
      sql_code: `SELECT * FROM iceberg_db.events$snapshots WHERE committed_at >= CURRENT_TIMESTAMP() - INTERVAL '7' DAY;`,
      pyspark_code: `spark.read.format("iceberg").load("db.events").filter("event_date >= '2026-01-01'")`,
      scala_code: `spark.read.table("db.events").filter($"event_date" >= "2026-01-01")`
    },
    {
      id: 'ms-qa-03',
      level: 8,
      difficulty: 'HARD',
      category: 'Compute Engines',
      question: 'Explain how Databricks Photon optimizes vectorized memory layouts and SIMD CPU execution.',
      answer: 'Photon is written in native C++ and replaces the JVM execution engine for supported query operators. It processes data in column-oriented memory batches (using Arrow-like vectors) and utilizes CPU **SIMD (Single Instruction, Multiple Data)** instructions to execute filters, projections, and aggregations across multiple data elements in a single CPU clock cycle.\n\n```sql\n-- Enable Photon engine explicitly in DBSQL\nSET spark.databricks.photon.enabled = true;\n```',
      py_code: `# PySpark running over Photon engine\ndf.selectExpr("id", "amount * 1.18 as gross_total").filter("gross_total > 1000")`,
      sql_code: `SELECT id, amount * 1.18 AS gross_total FROM orders WHERE amount * 1.18 > 1000;`,
      pyspark_code: `df.filter("amount > 1000").select("id", "amount")`,
      scala_code: `df.filter($"amount" > 1000).select($"id", $"amount")`
    },
    {
      id: 'ms-qa-04',
      level: 12,
      difficulty: 'ARCHITECT',
      category: 'AI / LLM Architecture',
      question: 'Architect an enterprise RAG pipeline combining Structured Streaming, Delta Vector Search, and Model Context Protocol (MCP).',
      answer: '1. **Ingestion**: Debezium captures document updates from PostgreSQL into Kafka.\n2. **Transformation**: Spark Structured Streaming extracts text, generates sliding-window chunks, and computes embeddings using OpenAI `text-embedding-3-small`.\n3. **Indexing**: Chunks are appended to a Delta Lake Gold table synchronized with a Databricks Delta Vector Search Index.\n4. **Serving**: An MCP (Model Context Protocol) Server exposes a `search_knowledge_base` tool. When an AI Agent invokes the tool, MCP executes a hybrid search (BM25 + Dense Cosine) and returns context to the LLM.\n\n```python\n# MCP Server Tool Implementation\n@mcp.tool()\ndef search_knowledge_base(query: str, top_k: int = 5):\n    results = vector_index.similarity_search(query=query, num_results=top_k)\n    return [{"content": r.page_content, "score": r.score} for r in results]\n```',
      py_code: `from mcp.server.fastmcp import FastMCP\nmcp = FastMCP("Lakehouse-RAG")\n@mcp.tool()\ndef search_lakehouse(query: str):\n    return vector_search_client.search(index_name="gold.docs_idx", query_text=query)`,
      sql_code: `SELECT VECTOR_SEARCH('gold.docs_idx', 'What is CAP theorem?', 5);`,
      pyspark_code: `df.writeStream.format("delta").option("checkpointLocation", "s3://chk/vector").table("gold.document_embeddings")`,
      scala_code: `val query = spark.readStream.table("silver.documents").writeStream.table("gold.embeddings")`
    }
  ];

  // Serverless Cost Playbooks Sample
  window.MODERN_COST_PLAYBOOKS = [
    {
      title: 'Auto-Termination & Warm Pool Cluster Sizing',
      savings: '35% - 50% DBU / Credit Reduction',
      summary: 'Set cluster autosuspend to 10-15 minutes for interactive workloads and use serverless SQL warehouses with instant scaling policies.',
      code: `ALTER WAREHOUSE dbsql_wh SET AUTO_SUSPEND = 600 MIN_CLUSTER_COUNT = 1 MAX_CLUSTER_COUNT = 4;`
    },
    {
      title: 'Delta Deletion Vectors vs Full File Compaction',
      savings: '60% I/O and Write Reduction',
      summary: 'Enable Deletion Vectors on high-churn Delta tables to avoid rewriting 500MB Parquet files on single-row updates.',
      code: `ALTER TABLE silver.orders SET TBLPROPERTIES ('delta.enableDeletionVectors' = 'true');`
    }
  ];

  // 5-Language Polyglot Code Matrix (Python, MS SQL T-SQL, PySpark, Spark SQL, DuckDB SQL)
  window.MODERN_CODE_MATRIX = [
    {
      topic: '1. Window Functions — Dense Rank & Rolling Averages',
      python: `import polars as pl\ndf.with_columns([\n    pl.col("sales").rank("dense", descending=True).over("dept").alias("rank"),\n    pl.col("sales").mean().rolling(window_size=3).over("dept").alias("roll_avg")\n])`,
      mssql: `SELECT dept, employee_id, sales,\n  DENSE_RANK() OVER (PARTITION BY dept ORDER BY sales DESC) AS rank,\n  AVG(sales) OVER (PARTITION BY dept ORDER BY sale_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS roll_avg\nFROM dbo.fact_sales;`,
      pyspark: `from pyspark.sql.window import Window\nimport pyspark.sql.functions as F\n\nw_dept = Window.partitionBy("dept").orderBy(F.col("sales").desc())\nw_roll = Window.partitionBy("dept").orderBy("sale_date").rowsBetween(-2, 0)\n\ndf.withColumn("rank", F.dense_rank().over(w_dept)) \\\n  .withColumn("roll_avg", F.avg("sales").over(w_roll))`,
      sparksql: `SELECT dept, employee_id, sales,\n  DENSE_RANK() OVER (PARTITION BY dept ORDER BY sales DESC) AS rank,\n  AVG(sales) OVER (PARTITION BY dept ORDER BY sale_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS roll_avg\nFROM delta.\`s3://lakehouse/sales\`;`,
      duckdb: `SELECT dept, employee_id, sales,\n  DENSE_RANK() OVER (PARTITION BY dept ORDER BY sales DESC) AS rank,\n  AVG(sales) OVER (PARTITION BY dept ORDER BY sale_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS roll_avg\nFROM 's3://lakehouse/sales/*.parquet';`
    },
    {
      topic: '2. Conditional Aggregation & Pivot / Unpivot',
      python: `import polars as pl\ndf.group_by("region").agg([\n    pl.col("amount").filter(pl.col("status") == "SUCCESS").sum().alias("success_sum"),\n    pl.col("amount").filter(pl.col("status") == "FAILED").sum().alias("failed_sum")\n])`,
      mssql: `SELECT region,\n  SUM(CASE WHEN status = 'SUCCESS' THEN amount ELSE 0 END) AS success_sum,\n  SUM(CASE WHEN status = 'FAILED' THEN amount ELSE 0 END) AS failed_sum\nFROM dbo.orders\nGROUP BY region;`,
      pyspark: `df.groupBy("region").agg(\n  F.sum(F.when(F.col("status") == "SUCCESS", F.col("amount")).otherwise(0)).alias("success_sum"),\n  F.sum(F.when(F.col("status") == "FAILED", F.col("amount")).otherwise(0)).alias("failed_sum")\n)`,
      sparksql: `SELECT region,\n  SUM(CASE WHEN status = 'SUCCESS' THEN amount ELSE 0 END) AS success_sum,\n  SUM(CASE WHEN status = 'FAILED' THEN amount ELSE 0 END) AS failed_sum\nFROM delta_orders\nGROUP BY region;`,
      duckdb: `SELECT region,\n  SUM(amount) FILTER (WHERE status = 'SUCCESS') AS success_sum,\n  SUM(amount) FILTER (WHERE status = 'FAILED') AS failed_sum\nFROM 's3://warehouse/orders.parquet'\nGROUP BY region;`
    },
    {
      topic: '3. Deduplication & Latest State Selection (SCD Type 1)',
      python: `import polars as pl\ndf.sort(["customer_id", "updated_at"], descending=[False, True]) \\\n  .unique(subset=["customer_id"], keep="first")`,
      mssql: `WITH RankedRecords AS (\n  SELECT *,\n    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) AS rn\n  FROM dbo.customer_updates\n)\nSELECT * FROM RankedRecords WHERE rn = 1;`,
      pyspark: `from pyspark.sql.window import Window\n\nw = Window.partitionBy("customer_id").orderBy(F.col("updated_at").desc())\ndf.withColumn("rn", F.row_number().over(w)).filter("rn = 1").drop("rn")`,
      sparksql: `WITH ranked AS (\n  SELECT *,\n    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) AS rn\n  FROM delta_customers\n)\nSELECT * EXCEPT(rn) FROM ranked WHERE rn = 1;`,
      duckdb: `SELECT DISTINCT ON (customer_id) *\nFROM 's3://lakehouse/customers/*.parquet'\nORDER BY customer_id, updated_at DESC;`
    },
    {
      topic: '4. Date/Time Truncation & Interval Processing',
      python: `import polars as pl\ndf.with_columns([\n    pl.col("timestamp").dt.truncate("1d").alias("day_start"),\n    (pl.col("timestamp") + pl.duration(days=30)).alias("expires_at")\n])`,
      mssql: `SELECT \n  DATETRUNC(day, event_time) AS day_start,\n  DATEADD(day, 30, event_time) AS expires_at\nFROM dbo.events;`,
      pyspark: `df.withColumn("day_start", F.date_trunc("day", "timestamp")) \\\n  .withColumn("expires_at", F.expr("timestamp + INTERVAL 30 DAYS"))`,
      sparksql: `SELECT \n  DATE_TRUNC('day', timestamp) AS day_start,\n  timestamp + INTERVAL 30 DAYS AS expires_at\nFROM delta_events;`,
      duckdb: `SELECT \n  DATE_TRUNC('day', timestamp) AS day_start,\n  timestamp + INTERVAL '30 days' AS expires_at\nFROM read_parquet('events.parquet');`
    }
  ];

})();
