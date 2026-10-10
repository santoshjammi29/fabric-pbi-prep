"""
Bulk generation of SQL Iceberg Architecture Scenarios (Part 2) for data_architecture.json
"""
import json
import os

FILE = 'src/data/json/data_architecture.json'

with open(FILE, 'r') as f:
    data = json.load(f)

print(f"Existing architecture items: {len(data)}")
existing_ids = {a['id'] for a in data}

iceberg_architectures_2 = [
    {
        "id": "arch-sql-iceberg-006",
        "source": "Architecture Hub",
        "category": "Modern Database Architecture & Distributed Systems",
        "niche": "Autonomous Indexing & Adaptive Storage",
        "difficulty": "ARCHITECT",
        "question": "Architect an autonomous analytical storage tier employing Database Cracking (adaptive physical self-indexing) for multi-terabyte ad-hoc exploratory datasets, eliminating DBA index maintenance and cold-start indexing latency.",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In multi-terabyte exploratory data analytics, database administrators face an impossible indexing dilemma:
1. **Upfront Complete Indexing**: Building B-Trees or secondary inverted indexes on every column requires hours of cold-start index creation time, doubles physical storage requirements, and multiplies write costs.
2. **Zero Indexing (Full Table Scans)**: Every exploratory ad-hoc query must scan billions of raw rows from storage, resulting in sluggish minutes-long latency.

**The Architectural Blueprint: Database Cracking (Idreos et al.)**:
Database Cracking is an adaptive physical indexing paradigm where the database storage engine physically reorganizes data **as an automatic side-effect of processing normal SELECT queries**. 

Data is loaded initially as a contiguous, unsorted array (a 'Cracked Column'). When a query arrives with a filter predicate (e.g. `WHERE salary BETWEEN 50000 AND 80000`), the query execution operator partitions the physical column array into pieces called **Cracks**:
- Crack 1: Values $< 50000$
- Crack 2: Values between $50000$ and $80000$
- Crack 3: Values $> 80000$

Subsequent queries continue to subdivide these cracks. The physical column progressively evolves into a fully sorted index, with indexing effort amortized across queries that actually touch the data!

### Phase 2: Low-Level Mechanics & Implementation
**1. Physical In-Memory Cracking Operator**:
The physical scanning operator maintains a lightweight in-memory **Crack Map** (an AVL tree or B-Tree of existing crack boundaries and their physical array offsets):
```text
Initial State: Unsorted Array [72, 14, 88, 35, 62, 19, 94, 41] | Crack Map: [Root: (Min: 14, Max: 94, Offset: 0)]

Query 1: WHERE val < 50
- Operator searches Crack Map: finds single unsorted crack.
- In-place two-pointer partition (quicksort partition step):
  Left pointer seeks values >= 50; Right pointer seeks values < 50; Swaps values.
- Result Array: [14, 35, 19, 41 | 72, 88, 62, 94]
- Updates Crack Map: Crack A [Offset 0-3: val < 50], Crack B [Offset 4-7: val >= 50]
- Returns Crack A rows [14, 35, 19, 41] directly from memory!

Query 2: WHERE val BETWEEN 20 AND 40
- Operator searches Crack Map: navigates directly to Crack A [Offset 0-3].
- Partitions ONLY Crack A: [14, 19 | 35 | 41]
- Updates Crack Map with finer boundaries.
- Returns [35] in sub-millisecond time without touching Crack B!
```

**2. Multi-Column Alignment (Stitching vs Sideways Cracking)**:
Because queries filter on multiple columns, cracking Column A changes its physical row order, misaligning it with Column B. To resolve this:
- **Sideways Cracking**: Create cracked views pairing Column A with a Tuple ID (TID) array. When Column A is partitioned, the corresponding TID array is permuted identically.
- Downstream projection operators use the TID array to fetch un-cracked payload columns via fast scatter-gather memory indexing.

### Phase 3: Production Hardening & Failure Modes
- **First-Query Latency Penalty**: The very first query on an uncracked column pays the cost of an initial two-pointer partition pass (~15-20% slower than a pure sequential scan). Subsequent queries are 10x-100x faster.
- **DML Mutation Handling (De-Cracking)**: When new records are inserted:
  - Do NOT re-partition the entire cracked array.
  - Append new records to a small **Pending Delta Buffer**.
  - Queries probe both the main cracked array and the pending delta buffer. When the delta buffer reaches 5% of table size, a background thread merges it into the cracked array.
- **Memory Footprint**: Database Cracking operates in-place on existing column memory buffers, consuming **0 extra bytes of disk storage** compared to traditional B-Trees which require 20-40% extra storage space."""
    },
    {
        "id": "arch-sql-iceberg-007",
        "source": "Architecture Hub",
        "category": "Modern Database Architecture & Distributed Systems",
        "niche": "High-Throughput Concurrency & Locking",
        "difficulty": "ARCHITECT",
        "question": "Architect a high-velocity transactional financial ledger processing 100,000 deposits/second that eliminates the Ascending Key B-Tree bottleneck (PAGELATCH_EX hot spots on rightmost leaf pages and optimizer histogram invalidation).",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In enterprise financial platforms, transaction ledger tables use sequential auto-incrementing integers (`BIGSERIAL`) or millisecond timestamps as primary keys to facilitate chronological sorting.

At 100,000 deposits/second, this design triggers the **Ascending Key Problem**:
1. **Physical Page Latch Starvation (PAGELATCH_EX)**: Because every transaction key is monotonically greater than the last, every single INSERT thread targets the **exact same physical 8KB data page** at the extreme right edge of the clustered B-Tree. Threads queue for exclusive latches, causing thread pool starvation and kernel spinlock CPU spikes.
2. **Optimizer Histogram Blindness**: Newly inserted IDs exceed the `HIGH_KEY` recorded in the optimizer's last statistics histogram update. The query optimizer estimates 1 row returned for recent ID ranges, choosing disastrous Nested Loops plans.

**Architectural Solution: Synthetic Hash Sharded Keys + Partitioned B-Trees**:
Eliminate single-page latch hotspots by introducing a synthetic partitioning bucket prefix into the clustered index key:
`Composite Key: (bucket_id, transaction_id)`
By distributing incoming transactions across 64 independent hash buckets, concurrent inserts are dispersed across **64 separate physical 8KB leaf pages**, reducing latch contention by 98.4%.

### Phase 2: Low-Level Mechanics & Implementation
**1. Distributed Bucket-Key Schema Definition**:
```sql
CREATE TABLE transaction_ledger (
    bucket_id SMALLINT NOT NULL,              -- Synthetic hash bucket: 0 to 63
    transaction_id BIGINT GENERATED ALWAYS AS IDENTITY,
    account_id UUID NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (bucket_id, transaction_id)   -- Clustered B-Tree root
) PARTITION BY LIST (bucket_id);

-- Provision 64 physical table partitions
CREATE TABLE ledger_p0 PARTITION OF transaction_ledger FOR VALUES IN (0);
CREATE TABLE ledger_p1 PARTITION OF transaction_ledger FOR VALUES IN (1);
-- ... up to ledger_p63
```

**2. Application Hash Routing**:
In the ingestion service (Go / Java / Rust):
```go
// Hash account_id modulo 64 to select the bucket
bucketID := int16(crc32.ChecksumIEEE([]byte(accountID.String())) % 64)

// Insert with pre-computed bucket_id
_, err := db.Exec(ctx, 
    "INSERT INTO transaction_ledger (bucket_id, account_id, amount, created_at) VALUES ($1, $2, $3, $4)",
    bucketID, accountID, amount, time.Now())
```
Execution mechanics:
- 100,000 concurrent inserts map uniformly across 64 physical partitions.
- Each partition manages its own independent clustered B-Tree with its own rightmost leaf page.
- Physical NVMe write queues process 64 concurrent DMA requests in parallel without thread latch blocking.

**3. Global Chronological Retrieval via Parallel Merge Sort**:
When querying historical ledger ranges:
```sql
-- Query engine uses parallel Partition Elimination and Merge Sort
SELECT transaction_id, account_id, amount, created_at
FROM transaction_ledger
WHERE created_at >= '2026-10-10 10:00:00'
ORDER BY created_at DESC
LIMIT 50;
```
The optimizer executes 64 parallel index seeks across the 64 partition tables and merges the results via an in-memory K-Way Merge Sort in sub-5ms.

### Phase 3: Production Hardening & Failure Modes
- **Secondary Index Latch Traps**: Eliminating latch contention on the primary key is useless if the table has a secondary non-clustered index on `created_at`! Every insert will still collide on the rightmost leaf page of the `created_at` index. Ensure secondary indexes also include `bucket_id` or use partitioned local indexes.
- **UUIDv7 vs Synthetic Bucketing**: UUIDv7 embeds a millisecond timestamp prefix, making it monotonic. While superior to random UUIDv4 (which causes random B-Tree page splits), UUIDv7 still suffers from the rightmost leaf latch hotspot. Combining UUIDv7 with hash prefixes (`bucket_id || uuidv7`) provides the optimal balance.
- **Dynamic Histogram Refresh**: Configure automated dynamic statistics thresholding (e.g. SQL Server Auto-Update Statistics with Trace Flag 2371 or PostgreSQL autovacuum analyze scale factor = 0.01) to keep histograms synchronized with high write volumes."""
    },
    {
        "id": "arch-sql-iceberg-008",
        "source": "Architecture Hub",
        "category": "Modern Database Architecture & Distributed Systems",
        "niche": "Distributed Consensus & Idempotency",
        "difficulty": "ARCHITECT",
        "question": "Architect an end-to-end distributed transaction recovery and deduplication architecture that resolves the Two-Generals Problem during ambiguous database network errors (socket timeouts during COMMIT), guaranteeing zero duplicate financial charges.",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In distributed financial platforms, an application service sends a `COMMIT` statement to the database over a TCP connection. 

If a transient network partition, load balancer timeout, or switch failure drops the TCP socket during the commit call, the application receives an **Ambiguous Network Error**:
`ConnectionResetByPeer` or `SocketTimeoutException`.

The application faces the fundamental **Two-Generals Problem**:
1. **Possibility A**: The database engine received the `COMMIT` packet, flushed the WAL record to NVMe storage, and committed the transaction, but the network failed before the TCP ACK reached the client.
2. **Possibility B**: The network failed before the database received the `COMMIT` packet. The database detected connection termination, aborted the transaction, and rolled back all changes.

If the application blindly retries the payment, it risks charging the customer twice (Possibility A). If the application assumes failure and aborts, it risks shipping goods without recording payment (Possibility B).

**Architectural Solution: Client-Generated Idempotency Keys + Transactional Outbox**:
1. Every financial transaction must be bound to a unique, client-generated **Idempotency Key** stored inside the primary database schema.
2. The database mutation and the downstream event publishing must be bound atomically via the **Transactional Outbox Pattern**.

### Phase 2: Low-Level Mechanics & Implementation
**1. Atomic Idempotency Registry Table**:
```sql
CREATE TABLE idempotency_records (
    idempotency_key VARCHAR(128) PRIMARY KEY,
    status VARCHAR(32) NOT NULL,              -- 'PROCESSING', 'COMMITTED', 'FAILED'
    response_payload JSONB,                   -- Serialized JSON response
    created_at TIMESTAMPTZ NOT NULL,
    locked_until TIMESTAMPTZ NOT NULL
);
```

**2. Transactional Idempotency Pipeline**:
```python
def process_payment(idempotency_key, user_id, amount):
    with db_connection.transaction():
        # Step 1: Probe and lock idempotency record
        cursor.execute(
            \"\"\"
            INSERT INTO idempotency_records (idempotency_key, status, created_at, locked_until)
            VALUES (%s, 'PROCESSING', NOW(), NOW() + INTERVAL '30 seconds')
            ON CONFLICT (idempotency_key) DO UPDATE
            SET locked_until = CASE 
                WHEN idempotency_records.status = 'PROCESSING' AND idempotency_records.locked_until < NOW()
                THEN NOW() + INTERVAL '30 seconds'
                ELSE idempotency_records.locked_until
            END
            RETURNING status, response_payload;
            \"\"\",
            (idempotency_key,)
        )
        record = cursor.fetchone()

        # Step 2: Handle existing state
        if record['status'] == 'COMMITTED':
            # Previous attempt SUCCEEDED! Return cached response immediately!
            return json.loads(record['response_payload'])
        
        # Step 3: Execute genuine business logic
        deduct_user_balance(user_id, amount)
        order_id = create_order(user_id, amount)

        # Step 4: Write to Transactional Outbox (for external notification)
        cursor.execute(
            \"\"\"
            INSERT INTO transactional_outbox (event_type, payload)
            VALUES ('PAYMENT_PROCESSED', %s);
            \"\"\",
            (json.dumps({'order_id': order_id, 'amount': amount}),)
        )

        # Step 5: Mark idempotency as COMMITTED
        response = {'order_id': order_id, 'status': 'SUCCESS'}
        cursor.execute(
            \"\"\"
            UPDATE idempotency_records 
            SET status = 'COMMITTED', response_payload = %s 
            WHERE idempotency_key = %s;
            \"\"\",
            (json.dumps(response), idempotency_key)
        )
        return response
```

### Phase 3: Production Hardening & Failure Modes
- **Ambiguous Timeout Recovery**: When the client receives a socket timeout on COMMIT, the client retry loop re-invokes `process_payment(idempotency_key, ...)`.
  - If the previous attempt committed, Step 1 reads `status = 'COMMITTED'` and instantly returns the cached payload. Zero duplicate charges occur!
  - If the previous attempt rolled back, Step 1 inserts the key and executes the payment cleanly.
- **Handling In-Flight Crashes (Zombie Transactions)**: If a server crashes while `status = 'PROCESSING'`, the `locked_until` timestamp guarantees that subsequent retries after 30 seconds can reclaim the lock and safely re-evaluate payment status.
- **Outbox Debezium CDC Relay**: A background Change Data Capture (CDC) engine (Debezium reading WAL logs) tails `transactional_outbox` and publishes events to Apache Kafka with exactly-once idempotency, guaranteeing that downstream payment webhooks and email notifications match database state 100%."""
    }
]

print(f"Prepared {len(iceberg_architectures_2)} additional architecture scenarios.")

new_ids_2 = {a['id'] for a in iceberg_architectures_2}
assert len(new_ids_2) == len(iceberg_architectures_2), "Duplicate IDs within iceberg_architectures_2!"

for a in iceberg_architectures_2:
    assert a['id'] not in existing_ids, f"Duplicate ID in data_architecture.json: {a['id']}"

data.extend(iceberg_architectures_2)
print(f"After append: {len(data)} (+{len(iceberg_architectures_2)})")

with open(FILE, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Successfully written to", FILE)
