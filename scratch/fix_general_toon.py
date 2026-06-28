import re
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
TOON_PATH = os.path.join(PROJECT_ROOT, "data", "general.toon")

with open(TOON_PATH, "r", encoding="utf-8") as f:
    text = f.read()

# 1. ADLS Gen1 (Azure Data Lake Store) replacements
# Azure Data Lake Store -> Azure Data Lake Storage Gen2 (ADLS Gen2)
text = text.replace("Azure Data Lake Store", "Azure Data Lake Storage Gen2 (ADLS Gen2)")
text = text.replace("Azure Data Lake storage", "Azure Data Lake Storage Gen2 (ADLS Gen2)")

# 2. Apache Mesos replacements (Spark 3.2+ deprecation/removal)
text = re.sub(r'\bMesos\b', "Kubernetes / Standalone", text)
text = text.replace("YARN and Kubernetes / Standalone", "YARN and Kubernetes")
text = text.replace("standalone mode, YARN mode, and Kubernetes / Standalone coarse-grained mode", "standalone mode, YARN mode, and Kubernetes mode")

# 3. Sqoop / Flume replacements (retired/deprecated)
text = text.replace("Sqoop", "Azure Data Factory (legacy Sqoop)")
text = text.replace("Flume", "Azure Event Hubs / Kafka (legacy Flume)")

# 4. Legacy DStream API replacements (Structured Streaming is current)
# Let's add a note to DStream or Discretized Stream mentions
dstream_note = "\n\nNote: Discretized Stream (DStream) is the legacy Spark Streaming API (RDD-based). For modern enterprise workloads, Structured Streaming (DataFrame-based, introduced in Spark 2.0) is the production standard, supporting ACID transactions natively via Delta Lake and Microsoft Fabric OneLake."

def dstream_repl(match):
    val = match.group(0)
    if "Note: Discretized Stream" not in val:
        return val + dstream_note
    return val

text = re.sub(r'(?i)\bDStream\b', "DStream (legacy Spark Streaming API)", text)

# Let's fix the 53 HARD questions with thin/one-liner answers (<120 chars)
# We will parse records, find hard short ones, and replace their answer with a rich, detailed explanation.
records = []
current_obj = None
current_field = None
block_lines = None
lines = text.splitlines()

# We can do this on parse, build a map of Q to rich answers, and then do string replacements
# Let's write the detailed replacements map
rich_answers = {
    "What does streamtable do?": 
        "The `STREAMTABLE` query hint is used in distributed SQL engines (like Hive or Spark SQL) to optimize join performance. "
        "It tells the query compiler to stream the specified table through memory while caching the other joined tables. "
        "This minimizes data serialization and network shuffling overhead. In modern cloud architectures like Microsoft Fabric or Databricks, "
        "this is largely handled automatically by Adaptive Query Execution (AQE), but manual hints remain useful in legacy Hive migration scenarios.",
        
    "What is Bigtable?": 
        "Bigtable is a highly scalable, distributed NoSQL database designed to handle petabyte-scale structured data across thousands of commodity servers. "
        "It stores data as a sparse, multi-dimensional, sorted map indexed by row key, column key, and timestamp. Bigtable does not support relational joins; "
        "instead, data is denormalized. It serves as the foundation for Google Cloud services like Cloud Bigtable and inspired HBase in the Hadoop ecosystem.",
        
    "How does Bigtable handle data storage?": 
        "Bigtable partitions data into 'tablets' (ranges of rows), which are stored on Colossus/GFS as SSTable files. "
        "Tablet servers serve read/write requests for active tablets, while the Master server coordinates tablet assignments and balances load. "
        "Writes are appended to a commit log and buffered in memtable, then periodically flushed to disk as SSTables. "
        "Reads merge data from SSTables and the memtable to ensure current state.",
        
    "What are the key features of Bigtable?": 
        "Key features of Bigtable include: (1) Linear scalability, where adding nodes increases write throughput linearly. "
        "(2) High performance for single-row lookups and scans. (3) Resilient fault tolerance via automatic tablet server failover. "
        "(4) Flexible schema-less design, storing arbitrarily formatted columns inside column families. "
        "(5) Built-in cell versioning using timestamps for historic change tracking.",
        
    "How does Bigtable achieve scalability?": 
        "Bigtable achieves horizontal scalability by splitting tables dynamically into tablets (typically 100-200MB ranges of rows). "
        "The Master server automatically assigns these tablets to different tablet servers across the cluster based on load. "
        "Since SSTables are stored in a shared distributed file system (Colossus), moving a tablet only requires updating metadata in Chubby (ZooKeeper), "
        "which takes milliseconds and incurs zero data copying.",
        
    "What is a tablet in Bigtable?": 
        "A tablet in Bigtable is a contiguous range of rows grouped together to balance storage and compute load. "
        "Each table consists of multiple tablets distributed across tablet servers. When a tablet grows too large (e.g., exceeds 200MB), "
        "it is automatically split into two smaller tablets. This dynamic splitting ensures that data remains evenly distributed "
        "across all cluster nodes to avoid hot spots.",
        
    "How does Bigtable handle load balancing?": 
        "Bigtable balances load using the Master server, which monitors the load metrics (CPU, RAM, request rate) of all active tablet servers. "
        "If a tablet server becomes hot due to a high volume of requests on a specific row key range, the Master splits the tablet "
        "and moves the new tablet to a less loaded server. It does this by updating tablet metadata locations, avoiding physical data transfers.",
        
    "How does Bigtable support structured data?": 
        "Bigtable structures data using column families, which are logical groups of columns that are typically stored and accessed together. "
        "Within a column family, columns are created dynamically as byte arrays. Since Bigtable treats all keys and values as raw byte arrays, "
        "it supports arbitrary structured formats like JSON, ProtoBuf, or Avro serialized payloads, leaving schema parsing to the client application.",
        
    "How does Bigtable handle schema changes?": 
        "Bigtable is completely schema-less. Schema changes do not require rebuilding tables or running DDL migration statements. "
        "Columns are created on-the-fly during write operations by specifying a column qualifier name within an existing column family. "
        "This enables high flexibility in multi-tenant environments, where schema drift or dynamic columns are common.",
        
    "How does Bigtable handle data replication?": 
        "Bigtable supports asynchronous multi-region replication to ensure high availability and disaster recovery. "
        "Replication is configured at the instance level. When data is written to a cluster, it is committed locally and then replicated "
        "asynchronously to other clusters. This allows read requests to failover to secondary regions with minimal latency.",
        
    "What consistency model does Bigtable provide?": 
        "Bigtable guarantees strong consistency at the single-row level. All read and write operations to a single row are serialized and atomic. "
        "However, across different tablet servers or in a replicated multi-cluster environment, replication is asynchronous, "
        "providing eventual consistency for cross-region reads. There is no multi-row transactional support (no ACID joins).",
        
    "What is a column family in Bigtable?": 
        "A column family is the primary structural grouping in Bigtable, defined when the table is created. "
        "It contains related columns that are stored together in separate SSTable files on disk. Access controls, garbage collection rules "
        "(like max versions or cell TTL), and compression settings are configured at the column family level to optimize storage performance.",
        
    "What is Chubby in Bigtable?": 
        "Chubby is Google's highly available distributed lock service (similar to Apache ZooKeeper) used by Bigtable. "
        "It manages the bootstrap location of the metadata table, coordinates master server election to ensure a single active master, "
        "tracks the online status of tablet servers, and stores access control lists. If Chubby becomes unavailable, Bigtable execution stalls.",
        
    "What is the role of SSTable in Bigtable?": 
        "SSTable (Sorted String Table) is the immutable file format Bigtable uses to store data on disk. "
        "An SSTable contains a sequence of data blocks and an index block loaded into RAM for fast search. "
        "Because SSTables are immutable, writes do not update existing files; instead, new SSTables are created, "
        "and background compaction runs to merge files and purge deleted versions.",
        
    "What is a memtable in Bigtable?": 
        "A memtable is an in-memory, sorted buffer where Bigtable stages incoming write requests before flushing them to disk. "
        "When a write request arrives, it is appended to a commit log for durability and written to the memtable. "
        "When the memtable reaches its size limit (e.g., 64MB), it is frozen, and a background thread writes it as an immutable SSTable on disk.",
        
    "How does Bigtable handle data updates?": 
        "Updates in Bigtable are append-only. When a cell value is updated, Bigtable writes a new cell with a newer timestamp "
        "into the memtable. The old cell value remains in older SSTables until a major compaction runs. "
        "Reads automatically query cells in reverse chronological order to return the newest version unless a specific historical timestamp is requested.",
        
    "How does Bigtable handle data deletion?": 
        "Deletions in Bigtable are handled by writing a 'tombstone' marker (a special delete record) to the memtable. "
        "The tombstone hides older values during read queries. During major compaction, the compaction thread merges SSTable files, "
        "identifies the tombstone markers, and permanently purges the deleted data blocks and tombstone markers from disk to reclaim space.",
        
    "What is the difference between minor and major compactions in Bigtable?": 
        "Minor compaction runs when a memtable is full, flushing it to disk as a new SSTable. "
        "Major compaction merges all SSTable files in a column family into a single SSTable. "
        "Major compaction runs in the background and permanently purges deleted data (tombstones) and older versions exceeding the column family limit.",
        
    "What are the typical use cases for Bigtable?": 
        "Typical use cases for Bigtable include high-volume, low-latency workloads with unstructured or semi-structured data: "
        "(1) Time-series telemetry and IoT sensor data storage. (2) Financial trade logs and transaction histories. "
        "(3) Ad-tech clickstream tracking and user profile matching. (4) Web index databases and crawl data storage.",
        
    "What is the architecture of Greenplum database?": 
        "Greenplum is a massive parallel processing (MPP) analytical database built on PostgreSQL. "
        "It consists of a coordinator node (Master) and multiple segment hosts. The coordinator receives client SQL queries, "
        "creates parallel query plans, and distributes work to segments. Each segment host runs an independent PostgreSQL instance "
        "and processes its local partition of the data, scaling query speeds linearly with hardware.",
        
    "How does Greenplum handle query optimization for complex analytical queries?": 
        "Greenplum uses a specialized MPP query optimizer called GPORCA, designed for parallel execution of complex multi-table joins. "
        "GPORCA evaluates query plans across segment boundaries, chooses optimal join locations (broadcast vs. redistribution), "
        "and generates physical execution plans that run locally on segment hosts to minimize network data transfer overhead.",
        
    "What is the role of coordinator in Greenplum?": 
        "The coordinator (Master) node in Greenplum serves as the entry point for client applications. "
        "It handles connection authorization, compiles SQL queries, optimizes execution plans using GPORCA, "
        "cooperates segment query execution, and aggregates result sets from segment hosts to return to the client. "
        "It does not store user data; it only stores metadata.",
        
    "What is the role of segments in Greenplum?": 
        "Segments are independent PostgreSQL instances that store and process the database table partitions. "
        "In Greenplum, each segment host runs multiple segments (primary and mirrors for high availability). "
        "Segments execute their portion of the parallel query plan locally, fetching data from local disk arrays "
        "and exchanging intermediate tuples via the Interconnect network stage.",
        
    "How does Greenplum distribute data across segments?": 
        "Greenplum distributes data across segments using three strategies: "
        "(1) Hash distribution, where a hash function maps one or more columns to a specific segment (critical for preventing skew). "
        "(2) Random/Round-Robin distribution, distributing rows evenly. "
        "(3) Replicated distribution, copying the entire table to every segment (optimal for small lookup dimensions).",
        
    "What is query execution plan in Greenplum?": 
        "A Greenplum execution plan is a parallel plan showing how query operations run across segments. "
        "It includes data motion operators: `RedistributeMotion` (resends rows to matching hash segments), "
        "`BroadcastMotion` (copies small tables to all segments), and `GatherMotion` (collects segment results back to the coordinator).",
        
    "How does Greenplum handle high availability?": 
        "Greenplum achieves high availability by deploying mirroring. Each primary segment on a host has a mirror segment "
        "on a separate physical host. Write transactions write to both primary and mirror segments synchronously. "
        "If a primary segment host fails, the coordinator automatically activates the mirror segments to ensure continuous operations."
}

# Now search and replace short answers in general.toon
for q, rich in rich_answers.items():
    # Find matching block in general.toon
    # Pattern:
    # question: [Q]
    # answer: [old_answer]
    # We want to replace the answer line
    pattern = re.escape("question: " + q) + r"\n\s*answer:\s*(.*?)(?=\n\s*\w+:|\n\s*-|\n\s*$)"
    
    # Let's inspect if the pattern matches
    match = re.search(pattern, text)
    if match:
        old_ans = match.group(1)
        # We need to preserve indentation
        # We check the indent of "answer:"
        # Let's write the replacement block
        indent = "  "
        rich_formatted = "answer: " + rich
        
        # Replace
        target = "question: " + q + "\n  " + old_ans
        replacement = "question: " + q + "\n  " + rich_formatted
        text = text.replace(target, replacement)
        
        # Let's also check if it has a block format (answer: |)
        block_pattern = re.escape("question: " + q) + r"\n\s*answer:\s*\|\n(.*?)(?=\n\s*\w+:|\n\s*-|\n\s*$)"
        block_match = re.search(block_pattern, text, re.DOTALL)
        if block_match:
            old_block = block_match.group(1)
            target = "question: " + q + "\n  answer: |\n" + old_block
            replacement = "question: " + q + "\n  answer: " + rich
            text = text.replace(target, replacement)

with open(TOON_PATH, "w", encoding="utf-8") as f:
    f.write(text)

print("SUCCESS: general.toon patched!")
