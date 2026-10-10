"""
Bulk generation of SQL Iceberg Architecture Scenarios for data_architecture.json
Focuses on deep systems architecture, distributed database internals, and concurrency engineering.
"""
import json
import os

FILE = 'src/data/json/data_architecture.json'

with open(FILE, 'r') as f:
    data = json.load(f)

print(f"Existing architecture items: {len(data)}")
existing_ids = {a['id'] for a in data}

iceberg_architectures = [
    {
        "id": "arch-sql-iceberg-001",
        "source": "Architecture Hub",
        "category": "Modern Database Architecture & Distributed Systems",
        "niche": "High-Throughput MVCC & Storage Durability",
        "difficulty": "ARCHITECT",
        "question": "Architect an enterprise PostgreSQL infrastructure processing 60,000 write transactions/sec that guarantees zero risk of Transaction ID (XTID) wraparound, prevents autovacuum freeze emergency lockouts, and eliminates table bloat without incurring client query latency spikes.",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In 32-bit MVCC engines like PostgreSQL, transaction IDs (XIDs) wrap around modulo $2^{32}$ (4.29 billion). Because visibility logic treats $2^{31}$ transactions as past and $2^{31}$ as future, historical row headers (`xmin`) must be frozen before the transaction counter advances 2 billion transactions. At 60,000 TPS, 2 billion transactions elapse in just **9.2 hours**!

Default autovacuum settings will fail to keep pace, causing `age(datfrozenxid)` to escalate toward `autovacuum_freeze_max_age`, eventually triggering an aggressive, non-throttled emergency freeze sweep that saturates NVMe disk bandwidth, spikes read P99 latency to tens of seconds, and risks read-only emergency shutdowns.

**Architectural Topology**:
1. **Physical Write Sharding & Horizontal Dispersal**: Rather than concentrating 60,000 TPS on a single primary instance, partition transactional writes across 4 Citus / native hash-partitioned physical shards, dropping per-node transaction velocity to 15,000 TPS.
2. **Dedicated Continuous Vacuum Workers**: Reallocate CPU and I/O budgets to ensure freeze sweeps occur continuously in small, high-frequency passes rather than massive deferred emergency sweeps.
3. **Partition Lifecycle Partition Dropping**: Use time-based range partitioning (e.g. daily partitions). Dropping an entire historical partition (`DROP TABLE orders_2026_09`) reclaims 100% of physical space and freezes zero tuples, completely bypassing vacuum overhead.

### Phase 2: Low-Level Mechanics & Implementation
**1. Aggressive Non-Throttled Autovacuum Configuration**:
Configure PostgreSQL runtime parameters to eliminate artificial vacuum throttling on modern NVMe storage:
```ini
# postgresql.conf
autovacuum = on
autovacuum_max_workers = 10                  # Parallel worker threads across tables
autovacuum_vacuum_cost_delay = 0              # Zero delay: run at full NVMe I/O speed
autovacuum_vacuum_cost_limit = 10000          # High cost limit
maintenance_work_mem = 4GB                    # Fit 100M dead tuple TIDs in RAM per worker
vacuum_freeze_min_age = 10000000              # Freeze tuples older than 10M transactions
vacuum_freeze_table_age = 50000000            # Aggressively sweep entire table at 50M XIDs
autovacuum_freeze_max_age = 200000000         # Absolute upper bound before emergency mode
```

**2. Table-Level Custom Tuning for High-Churn Tables**:
For tables processing 10,000+ updates/second (e.g. `account_balances`):
```sql
ALTER TABLE account_balances SET (
    autovacuum_vacuum_scale_factor = 0.02,    -- Trigger vacuum after 2% rows modified
    autovacuum_vacuum_threshold = 5000,
    autovacuum_freeze_min_age = 5000000,
    fillfactor = 85                           -- Reserve 15% page space for HOT updates!
);
```
Setting `fillfactor = 85` allows Heap-Only Tuple (HOT) updates: modifications that do not alter indexed columns write the new tuple version to the **same 8KB data page**, eliminating index maintenance and allowing page-local pruning without a full table vacuum sweep.

### Phase 3: Production Hardening & Failure Modes
- **Proactive Grafana / Prometheus Alerting**:
  Monitor transaction age continuously:
  ```sql
  SELECT datname, age(datfrozenxid) AS xid_age, 
         (2147483647 - age(datfrozenxid)) AS xids_until_catastrophe
  FROM pg_database ORDER BY 2 DESC;
  ```
  Alert P1 when `xid_age > 100,000,000` (50% of threshold). Alert P0 when `xid_age > 150,000,000`.
- **Long-Running Transaction Reaper**: A single open transaction (e.g. an unclosed Python analytics script holding an idle transaction) pins the Global Horizon `OldestXmin`, preventing autovacuum from freezing ANY dead tuples created after that transaction began. Enforce strict termination:
  `idle_in_transaction_session_timeout = '15s'`
  `statement_timeout = '60s'`
- **Disaster Recovery Playbook**: If emergency shutdown occurs (`FATAL: database is not accepting commands to avoid wraparound`), stop all client traffic, start Postgres in single-user maintenance mode (`postgres --single -D /var/lib/postgresql/data -d template1`), and execute `VACUUM FREEZE ANALYZE` directly from the terminal."""
    },
    {
        "id": "arch-sql-iceberg-002",
        "source": "Architecture Hub",
        "category": "Modern Database Architecture & Distributed Systems",
        "niche": "Distributed Query Optimization",
        "difficulty": "ARCHITECT",
        "question": "Design a high-scale graph-relational analytics architecture for financial anti-money laundering (AML) that executes multi-hop cycle and clique detection queries over 500 million transactions without suffering from the intermediate Cartesian explosion of traditional binary join trees.",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In financial AML, identifying money laundering rings requires detecting cyclic transaction patterns (e.g. 3-hop and 4-hop loops: $A \\rightarrow B \\rightarrow C \\rightarrow A$).

In traditional relational engines (SQL Server, PostgreSQL, Spark SQL), cyclic queries are compiled into **trees of pairwise binary joins**:
```sql
SELECT * FROM transfers t1
JOIN transfers t2 ON t1.dst = t2.src
JOIN transfers t3 ON t2.dst = t3.src AND t3.dst = t1.src;
```
For dense graph sub-components (e.g. accounts sending funds to multiple intermediaries), the initial binary join `t1 JOIN t2` can generate $O(M^2)$ intermediate 2-edge paths (hundreds of millions of candidate tuples), even if the final 3-edge cycle returns only 5 matching rings! This intermediate explosion exhausts executor RAM, causes multi-terabyte disk spills, and leads to query timeouts.

**The Architectural Solution: Worst-Case Optimal Joins (WCOJ)**:
Implement a hybrid graph-relational engine architecture (utilizing **Kùzu** or embedded **DuckDB** with Leapfrog Triejoin execution) where multiway cyclic relationships are evaluated simultaneously along attribute dimensions, guaranteeing runtime bounded by the theoretical **Atserias-Grohe-Marx (AGM) bound** $O(M^{1.5})$.

### Phase 2: Low-Level Mechanics & Implementation
**1. Physical Multi-Attribute Trie Layout**:
WCOJ algorithms require relations to be indexed as sorted prefix tries. The transfer graph relation $E(\\text{src}, \\text{dst})$ is physically organized in two complementary sorted B-Trees / Columnar Tries:
- Forward Index: Sorted by $(\\text{src}, \\text{dst})$
- Reverse Index: Sorted by $(\\text{dst}, \\text{src})$

**2. Leapfrog Triejoin Execution Mechanics**:
Instead of joining `t1` with `t2`, the engine coordinates three simultaneous cursors ($c_1, c_2, c_3$) over the shared vertex variables ($u, v, w$):
```text
Step 1: Anchor variable u (First Vertex)
- Find intersection of all valid u candidates across relations via Leapfrog seeking.
- Cursor c1 leaps to c2; if c2 > c1, c1 leaps to c2.

Step 2: Anchor variable v (Second Vertex)
- For the selected u, intersect valid outgoing edges from u with valid incoming edges to v.

Step 3: Close the Triangle on w (Third Vertex)
- Seek directly to the intersection where edges (v -> w) and (w -> u) simultaneously exist.
```
Because the algorithm probes sorted key boundaries multi-dimensionally, it **never materializes non-viable paths**. Intermediate memory overhead is $O(\\text{depth})$ rather than $O(M^2)$.

### Phase 3: Production Hardening & Failure Modes
- **Hybrid Query Routing**: Analytical workloads consist of both acyclic tree queries (star schema joins) and cyclic graph queries. Deploy a query classifier that routes star schema aggregations to vectorized columnstore engines (DuckDB/Photon) and routes cyclic path queries to the WCOJ Triejoin engine.
- **Dynamic Variable Ordering**: The execution latency of Leapfrog Triejoin depends heavily on the attribute evaluation order $(u \\rightarrow v \\rightarrow w)$. Maintain hypergraph degree statistics to order variables by ascending cardinality bounds.
- **Memory Footprint**: Multi-directional trie indexes require storing edges in both forward and reverse representations, doubling raw storage footprint (100GB $\\rightarrow$ 200GB). Compress adjacency lists using Roaring Bitmaps or Elias-Fano delta encoding."""
    },
    {
        "id": "arch-sql-iceberg-003",
        "source": "Architecture Hub",
        "category": "Modern Database Architecture & Distributed Systems",
        "niche": "Storage Durability & Kernel Interconnects",
        "difficulty": "ARCHITECT",
        "question": "Architect a mission-critical transactional storage architecture on Linux NVMe infrastructure that completely eliminates the data loss vulnerabilities exposed by 'fsyncgate' (kernel page cache writeback failures), achieving verifiable crash-consistent ACID durability.",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In traditional database design on UNIX/Linux, engines write data into the Operating System Page Cache using standard POSIX `write()`, relying on background kernel flusher threads (pdflush/flusher) to write dirty pages to block storage, and issuing `fsync()` on commit or checkpoint to enforce durability.

The 2018 'fsyncgate' vulnerability revealed a fatal kernel design flaw: when physical I/O errors (e.g. transient NVMe timeout, SAN fabric blip) occurred during background writeback, the Linux kernel **cleared the dirty bit on the in-memory page and marked the file descriptor error**. On a subsequent `fsync()` call, the error was cleared. On the third `fsync()`, the kernel returned **SUCCESS (0)** because the page was no longer marked dirty! Databases believed data was durably persisted on disk when the dirty page was silently dropped, causing catastrophic silent data corruption after restarts.

**Architectural Blueprint: Direct I/O (O_DIRECT) User-Space Buffer Management**:
To guarantee absolute ACID durability, enterprise platforms must **completely bypass the Linux OS Page Cache**. By opening storage file descriptors with `O_DIRECT | O_DSYNC`, the database engine takes 100% ownership of in-memory buffer pool allocation, dirty page tracking, and physical DMA transfer to NVMe controllers.

### Phase 2: Low-Level Implementation & Execution Behavior
**1. Direct I/O and Custom Buffer Pool Mechanics**:
- Allocate user-space memory buffers aligned on 4KB physical sector boundaries (`posix_memalign`).
- Open WAL and data files with `O_DIRECT | O_NOATIME`:
```c
int wal_fd = open("/var/lib/data/wal/00000001.wal", O_RDWR | O_CREAT | O_DIRECT | O_DSYNC, 0600);
```
- Write operations bypass kernel memory entirely: the NVMe host controller uses Direct Memory Access (DMA) to copy bytes directly from database application RAM to NVMe non-volatile NAND/SLC cache.
- The return code of `write()` directly reports the physical NVMe controller completion status. If a write fails, the database maintains the dirty state in its own user-space page table and retries or immediately halts safely.

**2. Asynchronous I/O via Linux io_uring**:
To eliminate thread-blocking synchronous I/O while using `O_DIRECT`, integrate modern Linux `io_uring`:
- Submit concurrent write requests directly to the submission queue (SQ) in user-space without kernel context-switch system calls.
- Kernel worker threads process DMA transfers to disk.
- Database reaps completion events from the completion queue (CQ), verifying physical block persistence with sub-10 microsecond latency.

### Phase 3: Production Hardening & Failure Modes
- **NVMe Volatile Write Cache Flush Verification**: Enterprise NVMe drives contain volatile DRAM write caches backed by supercapacitors (Power Loss Protection / PLP). Ensure hardware barrier flushes (`Flush Cache` command) are honored:
  ```bash
  # Verify Power Loss Protection is armed
  nvme smart-log /dev/nvme0n1 | grep -i "power_on_hours\\|unsafe_shutdowns"
  ```
- **Post-Failure Crash Recovery (ARIES Replay)**: If an unrecoverable NVMe hardware error occurs on data files, the engine must NEVER trust in-memory state. Immediately terminate the process (`SIGABRT`). On restart, the engine scans the WAL from the last durably confirmed checkpoint and replays redo logs to reconstruct corrupted data pages.
- **Filesystem Selection**: Deploy on raw NVMe namespaces or format disks with **XFS (with `crc=1, finobt=1`)** mounted with `noatime, nodiratime, logbufs=8, logbsize=256k`. Avoid Ext4 or Btrfs for high-concurrency Direct I/O databases due to global metadata locking."""
    },
    {
        "id": "arch-sql-iceberg-004",
        "source": "Architecture Hub",
        "category": "Modern Database Architecture & Distributed Systems",
        "niche": "High-Throughput OLAP & Query Engines",
        "difficulty": "ARCHITECT",
        "question": "Architect a next-generation vectorized query execution engine (incorporating block vectorization, L1/L2 cache locality, and auto-vectorized SIMD registers) capable of processing 1 billion records per second on a single 32-core server, contrasting it with traditional Volcano iterators.",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Classical query execution follows the **Volcano Model** (Iterator Model), where operators communicate via `open()`, `next()`, and `close()`. Each `next()` call returns a single tuple. While modular, pulling 1 billion tuples one-by-one requires 1 billion virtual function dispatches per operator. 

At the hardware level, this incurs:
1. **Instruction Cache (I-Cache) Thrashing**: Dynamic virtual function pointers prevent the CPU branch predictor from prefetching instructions, causing constant CPU pipeline stalls.
2. **Poor Memory Locality**: Row-oriented tuple structures load irrelevant column bytes into CPU cache lines.
3. **Zero SIMD Utilization**: Compilers cannot auto-vectorize loops containing function calls or complex control flow.

**The Architectural Blueprint: Block-Oriented Vectorized Execution (DuckDB / Photon Architecture)**:
Operators pass **Vectors** (flat arrays of 1,024 elements of a single column) between pipeline stages. The processing loop operates over tight, branchless arrays that reside entirely within 32KB–64KB L1 Data Caches, enabling C++ compilers to emit 512-bit AVX-512 SIMD instructions.

### Phase 2: Low-Level Implementation & Execution Behavior
**1. Physical Vector Data Structure**:
```cpp
// Columnar Vector holding 1024 values
struct Vector {
    PhysicalType type;
    void* data;                      // Contiguous memory buffer (e.g. int64_t[1024])
    ValidityMask validity;           // 128-bit bitmap tracking NULLs (1 bit per row)
    SelectionVector* sel_vector;     // Indirection array for zero-copy filtering
};
```

**2. Zero-Copy Selection Vectors in Filter Operators**:
When evaluating `WHERE age > 30`, a naive engine copies matching tuples into a new buffer. A high-performance vectorized engine uses a **Selection Vector**:
```cpp
// Branchless SIMD-friendly vector filter
int FilterGreaterThan(const int64_t* __restrict__ src, 
                      sel_t* __restrict__ result_sel, 
                      int64_t threshold, int count) {
    int matched = 0;
    #pragma clang loop vectorize(enable)
    for (int i = 0; i < count; ++i) {
        result_sel[matched] = i;
        matched += (src[i] > threshold); // Branchless conditional increment!
    }
    return matched;
}
```
Downstream operators (aggregators, hash joins) read data using the selection vector indices without ever copying memory buffers, achieving memory throughput exceeding 40 GB/sec per core.

**3. Morsel-Driven Parallelism**:
Divide the 1-billion row dataset into 100,000-row 'morsels'. A lock-free thread pool of 32 worker threads grabs morsels dynamically from a centralized work-stealing queue, guaranteeing 100% CPU core saturation across NUMA sockets without thread idle skew.

### Phase 3: Production Hardening & Failure Modes
- **Vector Size Tuning**: 1,024 elements is the golden standard. If vector size is too small (e.g. 64), function dispatch overhead re-emerges. If vector size is too large (e.g. 65,536), intermediate vectors spill from L1/L2 caches to slower L3/DRAM, cutting throughput by 4x.
- **String Handling (Dictionary & String Views)**: Storing variable-length strings as pointer graphs destroys SIMD. Use the **Umbra/DuckDB String View format**: 16 bytes per string (4-byte length prefix, 4-byte prefix bytes for instant inequality checks, followed by an 8-byte pointer or inline string).
- **Out-of-Core Grace Hash Joins**: When building hash tables on dimension tables exceeding RAM limits, implement Radix Partitioning to split vectors into 256 disk-spilled partitions, streaming partitions sequentially back into memory."""
    },
    {
        "id": "arch-sql-iceberg-005",
        "source": "Architecture Hub",
        "category": "Modern Database Architecture & Distributed Systems",
        "niche": "High-Throughput Concurrency & Locking",
        "difficulty": "ARCHITECT",
        "question": "Architect a globally distributed airline flight reservation platform that prevents Write Skew anomalies across concurrent seat booking transactions, evaluating Serializable Snapshot Isolation (SSI), selective pessimistic locking, and deterministic transactional state machines.",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In flight booking systems, an airline must enforce strict business invariants:
*A flight has 180 seats. A transaction may book a seat only if Total Booked Seats < 180 and the specific seat is vacant.*

Under standard Read Committed or Snapshot Isolation (SI):
1. User A checks vacant seats on Flight 101 $\\rightarrow$ Reads 179 seats booked, Seat 12A is free.
2. Simultaneously, User B checks vacant seats on Flight 101 $\\rightarrow$ Reads 179 seats booked, Seat 12B is free.
3. User A books Seat 12A and commits.
4. User B books Seat 12B and commits.

Under Snapshot Isolation, because User A wrote to row `(Flight 101, Seat 12A)` and User B wrote to row `(Flight 101, Seat 12B)`, **both transactions write to disjoint rows**. Both commit successfully, leaving 181 seats booked on a 180-seat airplane (**Write Skew Anomaly**)!

**Architectural Strategy Comparison**:
1. **Serializable Snapshot Isolation (SSI)**: Pure optimistic concurrency control. Detects rw-antidependencies and aborts conflicting sessions.
2. **Selective Pessimistic Locking (`SELECT FOR UPDATE`)**: Acquires exclusive locks on shared parent coordinator rows.
3. **Deterministic Transactional State Machine (Calvin / VoltDB model)**: Sequenced partition execution with zero runtime lock contention.

### Phase 2: Low-Level Mechanics & Implementation
**Approach 1: Materialized Coordinator Row Locking (Recommended for Relational OLTP)**:
To avoid abort storms under high demand (e.g. holiday ticket sales), force all seat bookings for a flight to serialize on a single parent inventory coordinator row:
```sql
BEGIN TRANSACTION;

-- Step 1: Lock the flight inventory record exclusively
SELECT booked_seats, max_seats 
FROM flight_inventory 
WHERE flight_id = @flight_id 
FOR UPDATE; -- Blocks concurrent seat bookers for this flight!

-- Step 2: Validate global invariant
IF booked_seats >= max_seats THEN
    ROLLBACK;
    RAISE EXCEPTION 'Flight fully booked';
END IF;

-- Step 3: Insert individual seat reservation
INSERT INTO seat_reservations (flight_id, seat_number, passenger_id)
VALUES (@flight_id, @seat_number, @passenger_id);

-- Step 4: Increment coordinator counter
UPDATE flight_inventory 
SET booked_seats = booked_seats + 1 
WHERE flight_id = @flight_id;

COMMIT;
```
Execution mechanics:
By placing `FOR UPDATE` on `flight_inventory`, User B's transaction is blocked at Step 1 until User A commits. When User B resumes, it reads `booked_seats = 180`, encounters the invariant check, and aborts cleanly.

**Approach 2: Pure SSI with Automated Idempotent Retries**:
If using PostgreSQL `ISOLATION LEVEL SERIALIZABLE`:
- Maintain an index on `(flight_id, seat_number)`.
- Query `SELECT COUNT(*) FROM seat_reservations WHERE flight_id = @flight_id`.
- The engine's lock manager registers an `SIREAD` lock covering the flight's predicate range.
- When User A and User B concurrently insert, the engine identifies a conflict cycle and aborts User B with error `40001 (serialization_failure)`.
- The client application catches error 40001 and retries via exponential backoff.

### Phase 3: Production Hardening & Failure Modes
- **Hotspot Bottleneck on Parent Locks**: Locking `flight_inventory` serializes all booking requests for that specific flight to single-thread latency (~2ms per booking = max 500 bookings/sec per flight). This is acceptable for single flights, but if multiple flights share a lock, contention spikes globally.
- **Seat Sniping & Abandonment**: Hold-and-release reservations (e.g. 'Seat held for 10 minutes during payment') should NOT hold open database transactions! Write a temporary reservation record with `expires_at = NOW() + INTERVAL '10 minutes'` and use a background reaper polling with `SKIP LOCKED`.
- **Global Multi-Region Replication**: In multi-region deployments (AWS us-east-1 and eu-west-1), routing seat booking writes to local regional replicas without distributed consensus guarantees write skew. All write transactions for a specific flight MUST route to the flight's designated home region leader node."""
    }
]

print(f"Prepared {len(iceberg_architectures)} new iceberg architecture scenarios.")

new_ids = {a['id'] for a in iceberg_architectures}
assert len(new_ids) == len(iceberg_architectures), "Duplicate IDs within iceberg_architectures!"

for a in iceberg_architectures:
    assert a['id'] not in existing_ids, f"Duplicate ID in data_architecture.json: {a['id']}"

data.extend(iceberg_architectures)
print(f"After append: {len(data)} (+{len(iceberg_architectures)})")

with open(FILE, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Successfully written to", FILE)
