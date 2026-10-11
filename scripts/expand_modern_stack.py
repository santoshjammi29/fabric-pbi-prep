import json

new_questions = [
  {
    "id": "ms-qa-05",
    "level": 5,
    "difficulty": "MEDIUM",
    "category": "Storage Formats",
    "question": "How does Delta Lake UniForm (Universal Format) generate Apache Iceberg metadata on write without duplicating Parquet data?",
    "answer": "Delta Lake UniForm (Universal Format) enables tables written in Delta Lake format to be read as Apache Iceberg (and Hudi) tables without duplicating the underlying Parquet data files. When UniForm is enabled, the Delta writer commits its standard _delta_log/ transaction log first. An asynchronous or synchronous metadata generator then reads the Delta commit log and generates corresponding Iceberg metadata files (metadata.json, manifest lists, and manifests) pointing directly to the exact same physical Parquet files on S3 or ADLS. Query engines that natively read Iceberg (such as Snowflake, AWS Athena, Trino, and DuckDB) can query the table via an Iceberg catalog or direct metadata pointer without any data migration or dual-write pipelines.",
    "py_code": """# Python: PyIceberg reading a Delta UniForm table via Iceberg REST catalog
from pyiceberg.catalog import load_catalog

catalog = load_catalog("polaris", **{
    "uri": "https://polaris.catalog.service/api/catalog",
    "credential": "client_id:client_secret",
    "warehouse": "enterprise_lake"
})

iceberg_table = catalog.load_table("silver.customer_orders")
snapshot = iceberg_table.current_snapshot()
print(f"Current Snapshot ID: {snapshot.snapshot_id}, Schema: {iceberg_table.schema()}")

# Scan directly into Arrow table
arrow_table = iceberg_table.scan(row_filter="order_total > 500").to_arrow()
df = arrow_table.to_pandas()""",
    "sql_code": """-- Databricks SQL: Enable Delta UniForm with Iceberg metadata generation
ALTER TABLE silver.customer_orders SET TBLPROPERTIES (
  'delta.universalFormat.enabledFormats' = 'iceberg',
  'delta.enableDeletionVectors' = 'true'
);

-- Query the generated Iceberg metadata location
DESCRIBE DETAIL silver.customer_orders;""",
    "pyspark_code": """# PySpark: Create a table with UniForm enabled
(df.write.format("delta")
   .option("delta.universalFormat.enabledFormats", "iceberg")
   .mode("overwrite")
   .saveAsTable("silver.customer_orders"))""",
    "scala_code": """spark.table("silver.customer_orders").write.format("delta").option("delta.universalFormat.enabledFormats", "iceberg").mode("overwrite").save()"""
  },
  {
    "id": "ms-qa-06",
    "level": 7,
    "difficulty": "HARD",
    "category": "Storage Formats",
    "question": "Compare Deletion Vectors in Delta Lake 3.x with Copy-on-Write and Merge-on-Read in Apache Iceberg v2.",
    "answer": "In traditional Copy-on-Write (CoW), updating or deleting a single record in a 200MB Parquet file requires reading, filtering, and rewriting the entire 200MB file, creating massive write amplification and slowing down streaming CDC pipelines. In Apache Iceberg v2, Merge-on-Read (MoR) writes separate Delete Files (either Equality Deletes or Position Deletes) alongside data files, which reader engines must dynamically merge during query execution. Delta Lake 3.x Deletion Vectors take a highly optimized approach: they write compact Roaring Bitmaps directly tracking the exact ordinal row indexes deleted in each Parquet file. Reading a row with a deletion vector requires only checking if the row index is set in the 10KB bitmap, avoiding full file rewrites and minimizing reader merge overhead.",
    "py_code": """# Python: Inspect Delta Deletion Vector statistics using deltalake (delta-rs)
from deltalake import DeltaTable

dt = DeltaTable("s3://lakehouse/silver/transactions")
files_info = dt.get_add_actions(flatten=True).to_pandas()
if 'deletionVector' in files_info.columns:
    dv_count = files_info['deletionVector'].notnull().sum()
    print(f"Files with active Deletion Vectors: {dv_count} of {len(files_info)}")""",
    "sql_code": """-- Databricks SQL: Enable Deletion Vectors and vacuum after compaction
ALTER TABLE silver.transactions SET TBLPROPERTIES ('delta.enableDeletionVectors' = 'true');

-- Compact tables to purge deletion vectors and rewrite files with deletions applied
OPTIMIZE silver.transactions;
VACUUM silver.transactions RETAIN 168 HOURS;""",
    "pyspark_code": """# PySpark: Fast single-row updates with Deletion Vectors
from delta.tables import DeltaTable

target = DeltaTable.forName(spark, "silver.transactions")
target.update(
    condition = "transaction_id = 'TX109283'",
    set = { "status": "'CANCELLED'", "updated_at": "current_timestamp()" }
)""",
    "scala_code": """DeltaTable.forName(spark, "silver.transactions").updateExpr("transaction_id = 'TX109283'", Map("status" -> "'CANCELLED'"))"""
  },
  {
    "id": "ms-qa-07",
    "level": 9,
    "difficulty": "ARCHITECT",
    "category": "Governance & Metadata",
    "question": "Architect a cross-engine catalog federation strategy between Databricks Unity Catalog and Snowflake using Apache Polaris.",
    "answer": "In modern enterprise architectures, data engineering pipelines often run on Databricks Spark while analytical reporting and executive BI run on Snowflake. Rather than maintaining dual pipelines or copying data:\n1. Storage Layer: All data resides in open Apache Iceberg / Delta UniForm format on Amazon S3 or ADLS Gen2 in customer-managed object storage.\n2. Catalog Control Plane: Apache Polaris (open-source Iceberg REST catalog) acts as the single source of truth for table schemas, partitions, and snapshots.\n3. Databricks Integration: Databricks writes to the lakehouse using Unity Catalog with UniForm enabled, synchronizing metadata to the Polaris REST catalog endpoint.\n4. Snowflake Consumption: Snowflake connects to Polaris as an External Catalog via CATALOG INTEGRATION. Snowflake creates Iceberg External Tables that read the exact same Parquet files in S3 without incurring ingestion compute or data transfer costs.\n5. Governance & Lineage: RBAC policies are enforced at the catalog boundary, ensuring unified access controls across both compute engines.",
    "py_code": """# Python: Connecting to Apache Polaris via REST API
import requests

polaris_url = "https://polaris.internal.net/api/catalog/v1/namespaces/sales/tables"
headers = {"Authorization": "Bearer <jwt_token>", "Content-Type": "application/json"}
resp = requests.get(polaris_url, headers=headers)
print(f"Active federated tables: {[t['name'] for t in resp.json()['identifiers']]}")""",
    "sql_code": """-- Snowflake: Configure Iceberg External Table using Polaris REST Catalog
CREATE OR REPLACE CATALOG INTEGRATION polaris_iceberg_int
  CATALOG_SOURCE = ICEBERG_REST
  TABLE_FORMAT = ICEBERG
  REST_CONFIG = (
    URI = 'https://polaris.corp.internal/api/catalog'
    WAREHOUSE = 'prod_lakehouse'
  )
  REST_AUTHENTICATION = (TYPE = OAUTH2 CREDENTIAL = 'polaris_secret')
  ENABLED = TRUE;

CREATE ICEBERG TABLE snowflake_dw.sales.orders
  CATALOG = 'polaris_iceberg_int'
  CATALOG_TABLE = 'sales.orders';""",
    "pyspark_code": """# Spark: Register Iceberg REST catalog in PySpark configuration
spark = (SparkSession.builder
    .config('spark.sql.catalog.polaris', 'org.apache.iceberg.spark.SparkCatalog')
    .config('spark.sql.catalog.polaris.type', 'rest')
    .config('spark.sql.catalog.polaris.uri', 'https://polaris.corp.internal/api/catalog')
    .getOrCreate())

df = spark.read.table('polaris.sales.orders')""",
    "scala_code": """spark.read.table("polaris.sales.orders").filter($"order_date" >= "2026-01-01")"""
  },
  {
    "id": "ms-qa-08",
    "level": 6,
    "difficulty": "MEDIUM",
    "category": "Compute Engines",
    "question": "When should a data engineering team choose Polars 1.x over PySpark for intermediate batch processing?",
    "answer": "Polars 1.x is written in Rust and utilizes the Apache Arrow columnar memory format, multithreaded SIMD vectorization, and a lazy streaming query optimizer. It is ideally suited for single-node workloads processing datasets from a few gigabytes up to hundreds of gigabytes (1GB - 500GB) where the dataset can either fit into memory or stream through memory without cluster overhead. PySpark introduces significant JVM overhead, serialization penalties (Pickle/Py4J), network shuffle complexity, and cluster startup delays (3-5 minutes on non-serverless). Polars executes in sub-seconds directly inside containers or AWS Lambda / Azure Functions with zero Java dependencies, reducing compute costs by 80%+ for right-sized pipelines. Teams should choose PySpark only when data scale exceeds a single large node (terabytes+) or when distributed lakehouse table transaction coordination across many concurrent workers is mandatory.",
    "py_code": """# Python: Polars Lazy Streaming execution on multi-core instance
import polars as pl

# Lazy scan: builds query execution graph without reading into RAM
lazy_pipeline = (
    pl.scan_parquet("s3://datalake/raw/clickstream/*.parquet")
    .filter(pl.col("event_type") == "checkout")
    .group_by(["user_id", pl.col("timestamp").dt.truncate("1h").alias("hour")])
    .agg([
        pl.col("revenue").sum().alias("total_spend"),
        pl.col("item_id").n_unique().alias("distinct_items")
    ])
    .sort("total_spend", descending=True)
)

# Collect with streaming=True allows processing datasets larger than RAM
result_df = lazy_pipeline.collect(streaming=True)""",
    "sql_code": """-- Equivalent Polars SQL context execution
SELECT user_id, date_trunc('hour', timestamp) as hour, SUM(revenue) as total_spend
FROM read_parquet('s3://datalake/raw/clickstream/*.parquet')
WHERE event_type = 'checkout'
GROUP BY 1, 2
ORDER BY total_spend DESC;""",
    "pyspark_code": """# PySpark equivalent with JVM and Shuffle overhead
df = (spark.read.parquet("s3://datalake/raw/clickstream/*.parquet")
      .filter(col("event_type") == "checkout")
      .groupBy("user_id", window(col("timestamp"), "1 hour"))
      .agg(sum("revenue").alias("total_spend")))""",
    "scala_code": """val df = spark.read.parquet("s3://datalake/raw/clickstream/").filter($"event_type" === "checkout").groupBy($"user_id").count()"""
  },
  {
    "id": "ms-qa-09",
    "level": 8,
    "difficulty": "HARD",
    "category": "Compute Engines",
    "question": "Explain how DuckDB executes zero-copy queries against remote Parquet files on AWS S3 and Azure ADLS Gen2.",
    "answer": "DuckDB uses its vectorized execution engine combined with the httpfs or cloud-specific extensions (azure, aws) to read Parquet files stored on remote object storage without downloading the entire file. The process works in three steps:\n1. Parquet Footer Scan: DuckDB issues an HTTP Range request for the trailing bytes of the remote file (where the Parquet footer and column chunk metadata reside).\n2. Min/Max Statistics Evaluation: DuckDB inspects row group statistics (min/max values, null counts) in memory and prunes non-matching row groups entirely without reading their data bytes.\n3. Columnar Projection Pushdown: DuckDB issues byte-range requests only for the specific columns and row groups required by the SELECT clause and WHERE filters.\n4. In-Memory Zero-Copy: The downloaded Parquet byte buffers are decompressed directly into DuckDB's in-memory columnar vector format, achieving sub-second analytical queries on gigabyte/terabyte files over standard internet connections.",
    "py_code": """# Python: DuckDB querying remote ADLS Gen2 Parquet directly
import duckdb

con = duckdb.connect()
con.execute("INSTALL azure; LOAD azure;")
con.execute(\"\"\"
CREATE SECRET my_azure_secret (
    TYPE AZURE,
    CONNECTION_STRING 'DefaultEndpointsProtocol=https;AccountName=datalake;AccountKey=xyz'
);
\"\"\")

# Query remote Parquet with filter and projection pushdown
query = \"\"\"
SELECT region, COUNT(*) as tx_count, AVG(amount) as avg_amount
FROM read_parquet('azure://container@datalake.blob.core.windows.net/sales/**/*.parquet')
WHERE year = 2026 AND status = 'COMPLETED'
GROUP BY region;
\"\"\"
result = con.execute(query).df()""",
    "sql_code": """-- DuckDB native SQL command directly from CLI
INSTALL httpfs; LOAD httpfs;
SET s3_region = 'us-east-1';
SELECT customer_id, SUM(order_total) 
FROM read_parquet('s3://prod-lake/orders/year=2026/*.parquet')
GROUP BY customer_id ORDER BY 2 DESC LIMIT 10;""",
    "pyspark_code": """# PySpark equivalent requiring Hadoop S3A connector
spark.conf.set("fs.s3a.impl", "org.apache.hadoop.fs.s3a.S3AFileSystem")
df = spark.read.parquet("s3a://prod-lake/orders/year=2026/*.parquet")""",
    "scala_code": """spark.read.parquet("s3a://prod-lake/orders/year=2026/*.parquet").groupBy("customer_id").sum("order_total")"""
  },
  {
    "id": "ms-qa-10",
    "level": 11,
    "difficulty": "ARCHITECT",
    "category": "AI & Agentic Stack",
    "question": "How does the Model Context Protocol (MCP) enable LLM agents to safely query enterprise data warehouses without SQL hallucination?",
    "answer": "Traditional LLM data access relies on 'Text-to-SQL', where an agent generates arbitrary raw SQL against a database connection string. This approach suffers from hallucinated column names, security injection risks, unoptimized full-table scans, and lack of business metric understanding. The Model Context Protocol (MCP) replaces arbitrary SQL execution with a standardized, governed tool-use protocol:\n1. Abstraction Layer: An MCP Server exposes structured, semantic tools (e.g., get_customer_churn_rate(region, start_date) or inspect_table_schema(table_name)) rather than raw SQL endpoints.\n2. Semantic Model Grounding: The MCP server integrates with dbt Semantic Layer or Fabric Semantic Models, ensuring calculation logic (e.g., ARR, gross margin) is defined in code by data engineers and executed identically by both BI dashboards and AI agents.\n3. Principle of Least Privilege: MCP enforces RBAC and session-scoped authentication. The LLM agent receives only the schema context and tools authorized for its user.\n4. Structured JSON-RPC: Tool execution uses typed JSON schemas for arguments, eliminating SQL syntax errors.",
    "py_code": """# Python: Building a Production MCP Server for Data Warehousing using FastMCP
from mcp.server.fastmcp import FastMCP
import duckdb

mcp = FastMCP("Enterprise-Analytics-Gateway")
con = duckdb.connect('warehouse.duckdb', read_only=True)

@mcp.tool()
def query_curated_metric(metric_name: str, dimension: str, year: int) -> dict:
    \"\"\"Fetch pre-aggregated enterprise metric validated against semantic layer.\"\"\"
    allowed_metrics = {'net_revenue', 'active_users', 'churn_rate'}
    if metric_name not in allowed_metrics:
        return {"error": f"Metric '{metric_name}' not approved in semantic catalog."}
    
    sql = f"SELECT {dimension}, SUM({metric_name}) as value FROM gold_metrics WHERE year = ? GROUP BY {dimension}"
    records = con.execute(sql, [year]).fetchall()
    return {"metric": metric_name, "data": [{dimension: r[0], "value": r[1]} for r in records]}""",
    "sql_code": """-- Semantic View supporting the MCP Tool Layer
CREATE VIEW semantic.mcp_curated_metrics AS
SELECT region, year, SUM(revenue) as net_revenue, COUNT(DISTINCT user_id) as active_users
FROM gold.fact_finance
GROUP BY region, year;""",
    "pyspark_code": """# PySpark batch export generating curated tables for MCP tools
curated_df.write.format("delta").mode("overwrite").saveAsTable("gold.mcp_curated_metrics")""",
    "scala_code": """spark.table("gold.mcp_curated_metrics").filter($"year" === 2026)"""
  },
  {
    "id": "ms-qa-11",
    "level": 10,
    "difficulty": "ARCHITECT",
    "category": "AI & Agentic Stack",
    "question": "Design a production Hybrid Search pipeline using Reciprocal Rank Fusion (RRF) combining dense vector embeddings and BM25 sparse keyword search.",
    "answer": "In enterprise search and RAG applications, relying solely on dense vector embeddings causes critical failures when queries include exact serial numbers, product SKUs, acronyms, or error codes (e.g. 'Error 404-XG'), as embedding models blur exact tokens into semantic vectors. Conversely, BM25 keyword search fails on conceptual questions without exact keyword matches. Hybrid Search with Reciprocal Rank Fusion (RRF) combines the strengths of both:\n1. Parallel Execution: The user query runs concurrently against a dense vector index (HNSW / Cosine Similarity) and a sparse inverted index (BM25 / Lucene).\n2. RRF Normalization: The raw scores are discarded (since cosine distances [0,1] cannot be cleanly summed with unbounded BM25 scores). Instead, items are scored based on their reciprocal rank positions: RRF Score = sum(1 / (k + rank)).\n3. Result Merging: Documents that appear near the top of both lists receive the highest merged scores, guaranteeing both semantic depth and exact-match precision.",
    "py_code": """# Python: Production Reciprocal Rank Fusion (RRF) Implementation
from collections import defaultdict

def reciprocal_rank_fusion(dense_results: list[str], sparse_results: list[str], k: int = 60) -> list[tuple[str, float]]:
    \"\"\"Combines ranked document ID lists from vector and BM25 searches.\"\"\"
    rrf_scores = defaultdict(float)
    
    for rank, doc_id in enumerate(dense_results, start=1):
        rrf_scores[doc_id] += 1.0 / (k + rank)
        
    for rank, doc_id in enumerate(sparse_results, start=1):
        rrf_scores[doc_id] += 1.0 / (k + rank)
        
    return sorted(rrf_scores.items(), key=lambda item: item[1], reverse=True)""",
    "sql_code": """-- Databricks DBSQL: Hybrid Vector + BM25 Query with RRF
WITH dense AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY score DESC) as rank_dense
  FROM VECTOR_SEARCH('kb_dense_idx', 'error code 404-XG', 20)
),
sparse AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY bm25_score DESC) as rank_sparse
  FROM TEXT_SEARCH('kb_sparse_idx', 'error code 404-XG', 20)
)
SELECT COALESCE(d.id, s.id) as doc_id,
       (1.0 / (60 + COALESCE(d.rank_dense, 999))) + (1.0 / (60 + COALESCE(s.rank_sparse, 999))) as rrf_score
FROM dense d
FULL OUTER JOIN sparse s ON d.id = s.id
ORDER BY rrf_score DESC LIMIT 10;""",
    "pyspark_code": """# PySpark pipeline feeding dual dense & sparse feature tables
(df.write.format('delta')
   .option('delta.enableChangeDataFeed', 'true')
   .table('gold.knowledge_base_chunks'))""",
    "scala_code": """spark.table("gold.knowledge_base_chunks").select($"id", $"dense_vector", $"sparse_tokens")"""
  },
  {
    "id": "ms-qa-12",
    "level": 9,
    "difficulty": "HARD",
    "category": "FinOps & Performance",
    "question": "How does Liquid Clustering in Delta Lake replace static Hive partitioning and Z-Order indexing?",
    "answer": "Traditional Hive-style directory partitioning (/year=2026/month=03/) suffers from critical limitations: partition columns cannot be changed without rewriting the entire table, and high-cardinality partitions create the small-file problem (millions of tiny files causing metadata bottlenecks). Z-Order indexing helped within partitions, but Z-Order is expensive, non-incremental (rewrites all files upon every write), and degrades when more than 3-4 columns are indexed. Liquid Clustering (CLUSTER BY) in Delta Lake completely eliminates static directory hierarchies: data files are placed in a flat directory and grouped incrementally using space-filling curves and lexicographical clustering algorithms. Liquid Clustering is flexible (columns can be redefined without rewriting data), incremental (clusters only newly ingested files without touching historical data), and self-tuning (adjusts file clustering during OPTIMIZE without full table locks).",
    "py_code": """# Python: Enable Liquid Clustering using deltalake or PySpark
from delta.tables import DeltaTable

# Define clustering columns on Delta Table creation
spark.sql(\"\"\"
CREATE TABLE gold.sensor_telemetry (
    device_id STRING,
    timestamp TIMESTAMP,
    sensor_type STRING,
    reading DOUBLE
)
USING DELTA
CLUSTER BY (device_id, sensor_type, timestamp);
\"\"\")

# Run fast incremental clustering on new data
spark.sql("OPTIMIZE gold.sensor_telemetry;")""",
    "sql_code": """-- Databricks SQL: Alter existing table clustering columns without data migration
ALTER TABLE gold.sensor_telemetry CLUSTER BY (device_id, timestamp);

-- Trigger incremental liquid clustering
OPTIMIZE gold.sensor_telemetry;""",
    "pyspark_code": """# PySpark write with Liquid Clustering active
(df.write.format("delta")
   .mode("append")
   .saveAsTable("gold.sensor_telemetry"))""",
    "scala_code": """DeltaTable.forName(spark, "gold.sensor_telemetry").optimize().executeCompaction()"""
  },
  {
    "id": "ms-qa-13",
    "level": 8,
    "difficulty": "HARD",
    "category": "Distributed Systems",
    "question": "Explain the Outbox Pattern in Kafka CDC pipelines and how it prevents dual-write inconsistencies.",
    "answer": "In microservices and transactional applications, updating a relational database (e.g., PostgreSQL) and publishing an event to Apache Kafka creates a classic dual-write distributed transaction problem. If the database commit succeeds but the Kafka publish fails (network timeout), data is out of sync. If Kafka publish succeeds but the database rolls back, downstream systems receive ghost events. The Transactional Outbox Pattern solves this without distributed 2-Phase Commit (2PC):\n1. Atomic Write: In the same relational database transaction that updates the business table (e.g., orders), the service inserts an event record into a local outbox table.\n2. CDC Capture: Debezium reads the database write-ahead log (PostgreSQL WAL or MySQL binlog) and captures committed inserts in the outbox table.\n3. Kafka Routing: Debezium streams these events into Kafka with guaranteed at-least-once delivery.\n4. Cleanup: An asynchronous process truncates or purges processed outbox records, guaranteeing zero lost events and zero dual-write anomalies.",
    "py_code": """# Python: SQLAlchemy transaction implementing the Outbox Pattern
from sqlalchemy.orm import Session
import json, uuid

def create_order_with_outbox(session: Session, customer_id: str, total: float):
    with session.begin():
        # 1. Insert domain entity
        order_id = str(uuid.uuid4())
        session.execute("INSERT INTO orders (id, customer_id, total) VALUES (:id, :cid, :tot)",
                        {"id": order_id, "cid": customer_id, "tot": total})
        
        # 2. Insert outbox event in the EXACT SAME local transaction
        event_payload = json.dumps({"order_id": order_id, "customer_id": customer_id, "total": total})
        session.execute("INSERT INTO outbox_events (id, aggregate_type, aggregate_id, payload) VALUES (:id, 'Order', :aid, :payload)",
                        {"id": str(uuid.uuid4()), "aid": order_id, "payload": event_payload})""",
    "sql_code": """-- PostgreSQL Outbox Table DDL
CREATE TABLE outbox_events (
    id UUID PRIMARY KEY,
    aggregate_type VARCHAR(64) NOT NULL,
    aggregate_id VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Debezium connector captures outbox_events WAL log
ALTER TABLE outbox_events REPLICA IDENTITY FULL;""",
    "pyspark_code": """# PySpark Structured Streaming consuming Outbox Kafka topic
df = spark.readStream.format("kafka")\\
  .option("subscribe", "pg.public.outbox_events")\\
  .load()""",
    "scala_code": """spark.readStream.format("kafka").option("subscribe", "pg.public.outbox_events").load()"""
  },
  {
    "id": "ms-qa-14",
    "level": 9,
    "difficulty": "ARCHITECT",
    "category": "Governance & Metadata",
    "question": "How do Data Contracts enforced via Pydantic and JSON Schema protect downstream lakehouses from breaking upstream schema changes?",
    "answer": "In modern data mesh architectures, analytical pipelines fail when upstream software engineers rename database columns, change data types (e.g., string to integer), or alter nullability without warning. Data Contracts establish a formal agreement between data producers and data consumers:\n1. Contract Definition: Schema, semantic SLA, allowed enum values, nullability, and freshness are defined in declarative YAML or JSON Schema.\n2. CI/CD Schema Verification: Upstream CI/CD pipelines validate application database migrations against the published contract before deploying code.\n3. Runtime Ingestion Gatekeeper: The ingestion pipeline (Kafka Debezium consumer or API ingest) validates incoming event payloads against Pydantic v2 models. Invalid records are routed to a Dead Letter Queue (DLQ) without stopping the pipeline or corrupting Silver tables.\n4. Alerting & Lineage: OpenLineage emits a schema contract violation event triggering Slack/PagerDuty alerts to the responsible producer team.",
    "py_code": """# Python: Pydantic v2 Data Contract Enforcement Gatekeeper
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Literal

class OrderDataContract(BaseModel):
    order_id: str = Field(min_length=8, description="Unique UUID")
    customer_id: str
    amount: float = Field(gt=0.0, description="Positive transaction value")
    status: Literal['PENDING', 'COMPLETED', 'REFUNDED']
    event_timestamp: datetime

    @field_validator('amount')
    def validate_amount_limit(cls, v):
        if v > 1000000.0:
            raise ValueError("Amount exceeds single transaction threshold ($1M)")
        return v

def process_incoming_event(raw_json: str):
    try:
        valid_order = OrderDataContract.model_validate_json(raw_json)
        return ("silver.orders", valid_order.model_dump())
    except Exception as err:
        return ("dlq.quarantined_orders", {"raw": raw_json, "error": str(err)})""",
    "sql_code": """-- Databricks Delta Lake Table Constraints enforcing contract at storage level
ALTER TABLE silver.orders ADD CONSTRAINT check_positive_amount CHECK (amount > 0.0);
ALTER TABLE silver.orders CHANGE COLUMN status SET NOT NULL;""",
    "pyspark_code": """# PySpark checking schema enforcement on append
(df.write.format("delta")
   .mode("append")
   .option("mergeSchema", "false")  # Rejects uncontracted columns
   .saveAsTable("silver.orders"))""",
    "scala_code": """df.write.format("delta").option("mergeSchema", "false").mode("append").saveAsTable("silver.orders")"""
  },
  {
    "id": "ms-qa-15",
    "level": 10,
    "difficulty": "ARCHITECT",
    "category": "Distributed Systems",
    "question": "How does Microsoft Fabric Direct Lake mode achieve sub-second Power BI querying on multi-billion row lakehouse tables without import or DirectQuery?",
    "answer": "Traditionally, Power BI reporting faces a painful trade-off: Import Mode delivers ultra-fast sub-second DAX querying by loading data into memory (VertiPaq columnar format), but requires hours of scheduled refresh and duplicates data; DirectQuery Mode queries the underlying SQL warehouse in real-time with zero data duplication, but suffers from high latency (3-15 seconds per visual) and exhausts database compute. Fabric Direct Lake mode completely redefines this paradigm: because Delta Lake files in Microsoft OneLake are formatted as columnar Parquet, Power BI's VertiPaq engine reads the Parquet columns directly from Azure Blob storage into memory without translating DAX to SQL and without importing or duplicating data. When data updates in the Lakehouse, Power BI sees changes immediately with zero refresh lag and sub-second DAX performance.",
    "py_code": """# Python: Inspecting Fabric OneLake Delta Parquet files
import pyarrow.dataset as ds

# Direct Lake works because OneLake storage exposes standard ADLS Gen2 APIs
dataset = ds.dataset("abfss://workspace@onelake.dfs.fabric.microsoft.com/lakehouse.Lakehouse/Tables/fact_sales", format="parquet")
print(f"Total Parquet fragments indexed for Direct Lake: {len(dataset.files)}")""",
    "sql_code": """-- Fabric Lakehouse SQL: V-Order sorting optimizes Parquet for Direct Lake in-memory paging
OPTIMIZE sales_lakehouse.fact_sales ZORDER BY (OrderDate, CustomerKey);
-- In Fabric, V-Order compression is enabled by default for Direct Lake acceleration.""",
    "pyspark_code": """# PySpark in Fabric Notebook: Ensure V-Order optimization is enabled
spark.conf.set("spark.sql.parquet.vorder.enabled", "true")
df.write.format("delta").mode("overwrite").saveAsTable("fact_sales")""",
    "scala_code": """spark.conf.set("spark.sql.parquet.vorder.enabled", "true")"""
  },
  {
    "id": "ms-qa-16",
    "level": 7,
    "difficulty": "HARD",
    "category": "FinOps & Performance",
    "question": "Architect a serverless auto-suspend and multi-cluster scaling policy for Databricks Serverless SQL and Snowflake.",
    "answer": "Serverless data warehouses provide instantaneous start times and per-second billing, but misconfigured idle timeouts and concurrency spikes cause budget overruns. A production FinOps policy enforces:\n1. Aggressive Idle Auto-Suspend: Set warehouse auto-suspend to 60-120 seconds (Databricks Serverless SQL shuts down idle compute in ~2 minutes; Snowflake standard warehouses should be set to 60 seconds with AUTO_SUSPEND = 60).\n2. Standard vs Multi-Cluster Scaling: For predictable batch workloads, lock MAX_CLUSTERS = 1 to prevent runaway spend. For interactive dashboards, enable multi-cluster standard scaling with SCALING_POLICY = 'STANDARD' and auto-terminate excess clusters as soon as queue depth drops to 0.\n3. Query Acceleration Service (QAS): Enable Snowflake QAS or Databricks Photon for outlier queries scanning massive unclustered partitions rather than vertically scaling the entire warehouse.\n4. Resource Monitors & Budget Caps: Enforce hard monthly credit quotas that suspend warehouses upon reaching 100% of budgeted threshold.",
    "py_code": """# Python: Automated Warehouse Cost Auditing via Snowflake Python Connector
import snowflake.connector

ctx = snowflake.connector.connect(user='FINOPS_ADMIN', account='xy12345', authenticator='externalbrowser')
cs = ctx.cursor()

# Audit warehouses with dangerous idle timeouts (> 5 minutes)
cs.execute(\"\"\"
SHOW WAREHOUSES;
\"\"\")
for wh in cs.fetchall():
    name, auto_suspend = wh[0], wh[11]
    if auto_suspend > 300:
        print(f"WARNING: Warehouse {name} has {auto_suspend}s timeout. Recommending reduction to 60s.")""",
    "sql_code": """-- Snowflake FinOps: Set 60s auto-suspend and budget monitor
ALTER WAREHOUSE analytics_wh SET 
  AUTO_SUSPEND = 60 
  AUTO_RESUME = TRUE 
  MIN_CLUSTER_COUNT = 1 
  MAX_CLUSTER_COUNT = 3 
  SCALING_POLICY = 'ECONOMY';

CREATE OR REPLACE RESOURCE MONITOR monthly_analytics_cap
  WITH CREDIT_QUOTA = 1500
  FREQUENCY = MONTHLY
  START_TIMESTAMP = IMMEDIATELY
  TRIGGERS ON 90% DO NOTIFY
           ON 100% DO SUSPEND;""",
    "pyspark_code": """# Databricks REST API: Configure Serverless SQL Warehouse auto-stop
# Using databricks-sdk in Python
from databricks.sdk import WorkspaceClient
w = WorkspaceClient()
w.warehouses.edit(id="wh-12345", auto_stop_mins=2)""",
    "scala_code": """// Configure session level timeout caps in Spark
spark.conf.set("spark.sql.broadcastTimeout", "600")"""
  }
]

with open('src/data/json/modern_stack.json', 'r') as f:
    existing = json.load(f)

print(f"Before: {len(existing)}")
existing_ids = {x['id'] for x in existing}
for item in new_questions:
    if item['id'] not in existing_ids:
        existing.append(item)

with open('src/data/json/modern_stack.json', 'w') as f:
    json.dump(existing, f, indent=2)

print(f"After: {len(existing)}")
