import json

new_questions = [
  {
    "id": "ms-qa-17",
    "level": 9,
    "difficulty": "ARCHITECT",
    "category": "Governance & Metadata",
    "question": "How does dbt Mesh enable decentralized multi-project data architectures with governance contracts?",
    "answer": "In large enterprise organizations, monolithic dbt repositories become unmanageable: single runs take hours, merge conflicts proliferate, and ownership is blurred across hundreds of models. **dbt Mesh** decouples the monolithic repository into distinct domain-oriented dbt projects (e.g., Marketing, Finance, Core Platform):\n1. Model Access Control: Models are designated as private (internal to domain), protected (shared with permission), or public (callable cross-project).\n2. Cross-Project References: Downstream consumer projects use the ref() function across project boundaries (e.g., ref('core_platform', 'dim_customers')).\n3. Model Contracts: Public models enforce strict schema contracts (column names, data types, not_null constraints). If upstream changes violate the contract, the upstream CI build fails before breaking downstream consumers.\n4. Versioning: Upstream models support versioning (v1, v2) enabling safe backward-compatible evolution without breaking dependencies.",
    "py_code": """# Python: dbt-core programmatic manifest inspection for cross-project contracts
from dbt.cli.main import dbtRunner, dbtRunnerResult

dbt = dbtRunner()
res: dbtRunnerResult = dbt.invoke(["parse"])
manifest = res.result

# Validate that all public models have contracts enforced
for node_id, node in manifest.nodes.items():
    if node.resource_type == "model" and node.access == "public":
        assert node.contract.enforced is True, f"Contract missing on public model {node.name}"
print("All cross-project public models verified with strict contracts!")""",
    "sql_code": """-- dbt Model with strict schema contract in model YAML
-- models/gold/finance/fct_mrr.sql
{{ config(
    materialized = 'table',
    contract = {'enforced': true}
) }}

SELECT 
    subscription_id,
    customer_id,
    amount as monthly_recurring_revenue,
    status,
    updated_at
FROM {{ ref('core_platform', 'dim_subscriptions') }};""",
    "pyspark_code": """# PySpark reading published cross-project Gold delta table
df_mrr = spark.read.table("gold_finance.fct_mrr")""",
    "scala_code": """spark.read.table("gold_finance.fct_mrr").select($"customer_id", $"monthly_recurring_revenue")"""
  },
  {
    "id": "ms-qa-18",
    "level": 8,
    "difficulty": "HARD",
    "category": "Distributed Systems",
    "question": "Tune RocksDB State Store off-heap memory and checkpoint latency in PySpark Structured Streaming.",
    "answer": "By default, Spark Structured Streaming stateful operations (stream-stream joins, dropDuplicates, sessionization, windowed aggregations) use the in-memory HDFSBackedStateStoreProvider. When state exceeds available JVM heap (10GB+), it triggers severe Java Garbage Collection (GC) pauses and Out-Of-Memory (OOM) executor crashes. Production pipelines must switch to **RocksDB State Store**:\n1. Off-Heap Storage: RocksDB allocates state outside the JVM heap using native C++ off-heap memory buffers, eliminating GC pauses.\n2. Block Cache Management: Set `spark.sql.streaming.stateStore.rocksdb.blockCacheSizeMB` (e.g. 512MB) to balance memory and cache hit rates.\n3. Checkpoint Compaction: Enable changelog checkpointing (`spark.sql.streaming.stateStore.rocksdb.changelogCheckpointing.enabled = true`) to write only incremental state deltas to S3/ADLS per micro-batch, reducing checkpoint commit latency by up to 80%.\n4. Write Buffer Sizing: Right-size memtables (`writeBufferSizeMB = 64MB`) to avoid memory pressure during bursty streaming ingest.",
    "py_code": """# Python: PySpark Streaming session configured for enterprise RocksDB state
from pyspark.sql import SparkSession

spark = (SparkSession.builder
    .appName("StatefulStreamingRocksDB")
    # 1. Enable RocksDB state provider
    .config("spark.sql.streaming.stateStore.providerClass", 
            "org.apache.spark.sql.execution.streaming.state.RocksDBStateStoreProvider")
    # 2. Allocate 512MB native block cache per executor
    .config("spark.sql.streaming.stateStore.rocksdb.blockCacheSizeMB", "512")
    # 3. Enable Changelog Checkpointing for sub-second micro-batch commits
    .config("spark.sql.streaming.stateStore.rocksdb.changelogCheckpointing.enabled", "true")
    # 4. Allocate off-heap overhead memory
    .config("spark.executor.memoryOverhead", "4g")
    .getOrCreate())""",
    "sql_code": """-- Inspect streaming state checkpoint commit times via streaming metrics
SELECT id, runId, numInputRows, inputRowsPerSecond, processedRowsPerSecond,
       stateOperators[0].memoryUsedBytes / (1024*1024) as state_memory_mb
FROM streaming_query_progress_log;""",
    "pyspark_code": """# Stateful stream with 2-hour watermarking
stream_query = (
    clicks_stream.withWatermark("click_time", "2 hours")
    .join(impressions_stream.withWatermark("imp_time", "2 hours"), "ad_id")
    .writeStream.format("delta")
    .option("checkpointLocation", "s3://chk/ad_joins")
    .table("silver.ad_conversions")
)""",
    "scala_code": """spark.conf.set("spark.sql.streaming.stateStore.providerClass", "org.apache.spark.sql.execution.streaming.state.RocksDBStateStoreProvider")"""
  },
  {
    "id": "ms-qa-19",
    "level": 7,
    "difficulty": "MEDIUM",
    "category": "Compute Engines",
    "question": "How does Apache Arrow achieve zero-copy cross-language memory transfer between Python, Spark, and DuckDB?",
    "answer": "Historically, passing data between Python (CPython) and execution engines (JVM Spark, C++ DuckDB, Rust Polars) required serializing data to an intermediate row format (like JSON, CSV, or Pickle) and deserializing it on the other side. This serialization/deserialization penalty accounted for up to 70% of total pipeline runtime. **Apache Arrow** defines a standardized language-independent in-memory columnar format with a formal C Data Interface:\n1. Contiguous Memory Buffers: Arrow arrays reside in shared contiguous memory with aligned pointers for validity bitmaps, offsets, and data buffers.\n2. C Data Interface: Python passes raw memory pointers (struct ArrowArray and ArrowSchema) to C++/Rust engines without copying bytes.\n3. Vectorized Math: Modern CPUs execute SIMD vectorized instructions directly on Arrow buffers.\n4. PySpark Arrow Vectorization: Enabling `spark.sql.execution.arrow.pyspark.enabled = true` replaces slow Py4J row serialization with direct shared memory transfers, speeding up Pandas UDFs by 10x-50x.",
    "py_code": """# Python: Zero-copy roundtrip between DuckDB, Polars, and PyArrow
import duckdb, polars as pl, pyarrow as pa

# 1. Query Parquet into PyArrow RecordBatchReader (zero disk serialization)
con = duckdb.connect()
arrow_table: pa.Table = con.execute("SELECT * FROM range(1_000_000)").arrow()

# 2. Zero-copy conversion from Arrow to Polars DataFrame (shares exact memory buffer)
pl_df = pl.from_arrow(arrow_table)

# 3. Memory pointer verification
print(f"Polars rows: {pl_df.height}, Arrow bytes: {arrow_table.nbytes / (1024*1024):.2f} MB (Zero memory duplicated)")""",
    "sql_code": """-- DuckDB native Arrow integration
-- DuckDB can directly query Python Arrow variables in current namespace
SELECT COUNT(*), AVG(range) FROM arrow_table;""",
    "pyspark_code": """# Enable Arrow vectorized execution in PySpark
spark.conf.set("spark.sql.execution.arrow.pyspark.enabled", "true")
# Pandas UDF running at native C++ speeds
@pandas_udf("double")
def calculate_tax(amount: pd.Series) -> pd.Series:
    return amount * 0.18""",
    "scala_code": """spark.conf.set("spark.sql.execution.arrow.pyspark.enabled", "true")"""
  },
  {
    "id": "ms-qa-20",
    "level": 11,
    "difficulty": "ARCHITECT",
    "category": "AI & Agentic Stack",
    "question": "Design an enterprise Semantic Caching and LLM Context Optimization pipeline using Delta Lake and Redis.",
    "answer": "Calling frontier LLM APIs (GPT-4o, Gemini Pro, Claude 3.5 Sonnet) on repetitive enterprise queries creates exorbitant cost spikes and latency bottlenecks (2-5 seconds per call). An enterprise AI stack implements a multi-tier **Semantic Cache**:\n1. Query Embedding: The incoming user prompt is embedded into a dense vector (e.g. 768-dim).\n2. L1 Cache (In-Memory Redis): Redis Vector Search queries cosine distance against cached query vectors with a strict similarity threshold (e.g. cosine distance < 0.05). If matched, the cached response is returned in < 20ms with $0 token cost.\n3. L2 Cache (Delta Lake Lakehouse): Cold cached query-response pairs are archived to Delta Lake partitioned by domain, allowing offline evaluation, drift monitoring, and periodic cache pre-warming.\n4. Context Window Trimming: For cache misses, AST syntax trees compress data warehouse schemas and sample rows, removing 60% of unnecessary tokens before passing prompt to the LLM.\n5. Cache Invalidation: When underlying Silver/Gold warehouse tables update (tracked via Delta Change Data Feed), affected semantic cache keys are automatically invalidated.",
    "py_code": """# Python: Semantic Cache Check before LLM Invocation
from sentence_transformers import SentenceTransformer
import numpy as np

embed_model = SentenceTransformer('all-MiniLM-L6-v2')

def get_or_set_semantic_cache(prompt: str, cache_db: dict, threshold: float = 0.92) -> tuple[str, bool]:
    \"\"\"Checks in-memory vector cache for semantically identical queries.\"\"\"
    prompt_vec = embed_model.encode(prompt, normalize_embeddings=True)
    
    best_score = -1.0
    best_answer = None
    for cached_prompt, (cached_vec, answer) in cache_db.items():
        similarity = np.dot(prompt_vec, cached_vec)
        if similarity > best_score:
            best_score = similarity
            best_answer = answer
            
    if best_score >= threshold:
        return best_answer, True  # Cache Hit! 0 LLM Tokens used
    
    # Cache Miss: Call LLM, then save to cache
    llm_response = f"Simulated LLM Answer for: '{prompt}'"
    cache_db[prompt] = (prompt_vec, llm_response)
    return llm_response, False""",
    "sql_code": """-- Delta Lake L2 Semantic Cache Audit Table
CREATE TABLE IF NOT EXISTS gold_ai.semantic_cache_history (
    cache_id STRING,
    user_prompt STRING,
    prompt_embedding ARRAY<FLOAT>,
    llm_response STRING,
    tokens_saved INT,
    created_at TIMESTAMP
)
USING DELTA
CLUSTER BY (created_at);""",
    "pyspark_code": """# Delta Lake append recording cache efficiency metrics
(cache_df.write.format("delta")
   .mode("append")
   .saveAsTable("gold_ai.semantic_cache_history"))""",
    "scala_code": """spark.table("gold_ai.semantic_cache_history").agg(sum($"tokens_saved"))"""
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
