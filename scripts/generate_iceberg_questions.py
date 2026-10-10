"""
Bulk generation of SQL Iceberg Q&As for questions.json
Covers key practical, interview, and production questions on all tiers of the SQL iceberg.
"""
import json
import os

FILE = 'src/data/json/questions.json'

with open(FILE, 'r') as f:
    data = json.load(f)

print(f"Existing questions: {len(data)}")
existing_ids = {q['id'] for q in data}

iceberg_questions = [
    {
        "id": "sql-iceberg-q-001",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "ORM Performance & Anti-Patterns",
        "difficulty": "MEDIUM",
        "question": "Explain the Object-Relational Impedance Mismatch, how it causes the N+1 query problem in enterprise applications, and how to eliminate it at the query engine level.",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
The Object-Relational Impedance Mismatch refers to the fundamental conceptual friction between object-oriented programming (which models systems as graphs of stateful, navigating objects with identity and encapsulated behavior) and relational databases (which model systems using declarative, mathematical relations, tuple sets, and predicate calculus). 

When ORMs (Hibernate, Entity Framework, Prisma) map these domains, they default to lazy-loading child associations. In a collection of N parent records (e.g. 100 Orders), accessing `order.customer` inside a loop executes 1 query to fetch the orders followed by 100 separate round-trip queries to fetch each customer (`N+1` queries total). This saturates database connection pools, floods network pipes with round-trip latency, and prevents the optimizer from generating set-based bulk joins.

### Phase 2: Low-Level Implementation & Execution Behavior
Consider this naive ORM query and its execution plan impact:
```csharp
// Naive ORM iteration (triggers 101 queries)
var orders = dbContext.Orders.Where(o => o.Status == "PENDING").ToList();
foreach (var order in orders) {
    Console.WriteLine(order.Customer.Email); // Lazy load probe
}
```
Under the hood, this issues 100 sequential single-row index seeks:
`SELECT * FROM Customers WHERE Id = @p0;`

To eliminate this at the relational level, the application must issue explicit set-based eager loading or project directly into a flat DTO:
```csharp
// Eager join execution plan (single multi-table Hash or Merge Join)
var orderSummaries = dbContext.Orders
    .Where(o => o.Status == "PENDING")
    .Select(o => new { o.Id, o.TotalAmount, CustomerEmail = o.Customer.Email })
    .ToList();
```
This compiles to a single relational query:
```sql
SELECT o.Id, o.TotalAmount, c.Email
FROM Orders o
INNER JOIN Customers c ON o.CustomerId = c.Id
WHERE o.Status = 'PENDING';
```

### Phase 3: Production Gotchas & Remediation
- **Eager Loading Cartesian Explosion**: Replacing lazy loading with multiple `.Include()` statements on one-to-many collections creates a Cartesian product join. If an Order has 5 Items and 4 TrackingEvents, eager loading both produces $5 \\times 4 = 20$ duplicate rows per order over the wire. Use split queries (`AsSplitQuery()` in EF Core) to fetch collections in parallel queries.
- **Memory Hydration Bloat**: Fetching full entity models with change tracking retains thousands of object instances in memory, triggering aggressive Garbage Collection pauses. Always use read-only projections (`AsNoTracking()`) for read operations.
- **Over-fetching Column Payloads**: ORM `SELECT *` retrieves wide text/JSON columns, invalidating covering B-Tree indexes and forcing expensive heap/clustered index key lookups.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "ORM Performance & Anti-Patterns"
    },
    {
        "id": "sql-iceberg-q-002",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Storage Engine Internals",
        "difficulty": "HARD",
        "definition": "Physical page layout and column alignment in relational storage engines.",
        "question": "How do database engines physically pack rows onto 8KB data pages, and how can CPU word alignment padding cause unexpected storage bloat in wide tables?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
Relational engines (such as SQL Server and PostgreSQL) organize storage into fixed-size physical blocks called pages (typically 8KB). An 8KB page contains:
1. A 96-byte page header storing metadata (Page ID, object ID, free space offset, next/prev page pointers).
2. The row payload area, where records are written contiguously.
3. A slot array (offset table) at the very bottom of the page, where two-byte pointers store the exact byte offset of each row.

Inside an individual row payload, columns are laid out in distinct regions: a fixed-length data region, followed by a NULL bitmap, followed by a variable-length column count and offset array.

### Phase 2: Low-Level Implementation & Execution Behavior
To maximize memory bus and CPU register transfer efficiency, modern 64-bit CPUs require data types to be aligned on memory boundaries matching their size:
- 2-byte integers (`SMALLINT`) align on 2-byte boundaries.
- 4-byte integers (`INT`) align on 4-byte boundaries.
- 8-byte integers (`BIGINT`, `DATETIME2`) align on 8-byte boundaries.

If a schema alternates between 1-byte and 8-byte types:
```sql
CREATE TABLE bad_layout (
    c1 TINYINT,   -- 1 byte + 7 padding bytes
    c2 BIGINT,    -- 8 bytes
    c3 TINYINT,   -- 1 byte + 7 padding bytes
    c4 BIGINT     -- 8 bytes
); -- Total: 32 bytes (14 bytes wasted on CPU alignment padding!)
```
Reordering columns by descending size eliminates all padding:
```sql
CREATE TABLE optimal_layout (
    c2 BIGINT,    -- 8 bytes
    c4 BIGINT,    -- 8 bytes
    c1 TINYINT,   -- 1 byte
    c3 TINYINT    -- 1 byte + 6 trailing padding bytes
); -- Total: 24 bytes (25% reduction in row size!)
```

### Phase 3: Production Gotchas & Remediation
- **Page Density Collapse**: On a 100-million row table, saving 8 bytes per row saves 800MB of physical disk space, reduces required 8KB pages by 100,000, and allows 20% more rows to fit into the database Buffer Pool RAM.
- **Engine Optimization Differences**: PostgreSQL does NOT reorder columns on physical disk—it respects the exact DDL column order, making physical column order critical. SQL Server reorders fixed-width columns internally in modern storage formats.
- **Row-Overflow Spilling**: When a row with variable-length columns exceeds 8,060 bytes, the engine pushes columns off-page into `ROW_OVERFLOW_DATA` pages, requiring extra pointer dereferencing I/O for every query read.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Storage Engine Internals"
    },
    {
        "id": "sql-iceberg-q-003",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Query Optimization & Execution",
        "difficulty": "HARD",
        "question": "What is the physical difference between a Stream Aggregate and a Hash Aggregate operator in a query execution plan, and what causes hash aggregate spills to tempdb?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
When a query executes `GROUP BY`, the query optimizer evaluates the physical data properties and cardinality estimates to choose between two core aggregation algorithms:
1. **Stream Aggregate**: An algorithm that requires input data to be pre-sorted by the grouping keys. It maintains a running accumulator for the current group key. When the key changes, it outputs the aggregated row and resets the accumulator. It operates in $O(1)$ memory.
2. **Hash Aggregate**: An algorithm that does not require sorted data. It builds an in-memory hash table where hash buckets store distinct group keys and their respective accumulators. It scans the input once, hashing each row's key and updating the corresponding bucket.

### Phase 2: Low-Level Implementation & Execution Behavior
The query optimizer requests a **Memory Grant** (workspace memory) before executing a Hash Aggregate based on estimated cardinality:
$$\\text{Memory Grant} = \\text{Estimated Distinct Groups} \\times (\\text{Group Key Size} + \\text{Accumulator Size} + \\text{Hash Overhead})$$

If the actual number of distinct groups vastly exceeds the optimizer's estimate (due to stale statistics or multi-column correlation errors), the hash table exhausts its allocated memory grant.

When memory is exhausted, the engine switches to a multi-pass partitioning algorithm:
1. It partitions incoming rows into bucket files and **spills them to temporary disk storage (tempdb / scratch disk)**.
2. It processes partitions one by one from disk, loading them back into memory to complete the aggregation.
3. This is visible in execution plans as a yellow warning triangle: `Hash Spill Warning (Level 1 or Level 2)`.

### Phase 3: Production Gotchas & Remediation
- **I/O Latency Spikes**: Spilling to disk transforms an in-memory CPU-bound operation into an I/O-bound bottleneck, increasing query execution duration by 10x–50x.
- **Pre-Sorting with Supporting Indexes**: For queries with high aggregation frequency, create an index whose key prefix matches the `GROUP BY` columns. This allows the optimizer to pick a non-blocking Stream Aggregate with zero memory grant requirements.
- **Updating Statistics**: Keep column statistics updated (`UPDATE STATISTICS`) or create multi-column statistics to ensure accurate cardinality estimates and prevent undersized memory grants.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Query Optimization & Execution"
    },
    {
        "id": "sql-iceberg-q-004",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Indexing & Access Paths",
        "difficulty": "MEDIUM",
        "question": "Why does LIMIT/OFFSET exhibit severe performance degradation on large datasets, and how does Keyset Pagination eliminate this penalty?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
The standard approach to pagination uses `OFFSET` and `LIMIT` (or `OFFSET-FETCH`):
```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 20 OFFSET 500000;
```
Relational tables are unordered heaps or balanced trees; there is no physical row index counter. Therefore, to satisfy `OFFSET 500000`, the storage engine must physically scan, evaluate, and discard 500,000 candidate rows before reading the 20 rows to return. As page numbers increase, latency degrades linearly $O(N)$, causing severe CPU churn and cache pollution.

### Phase 2: Low-Level Implementation & Execution Behavior
Keyset pagination (also known as the 'seek method' or 'cursor pagination') leverages the B-Tree index structure by replacing the offset with a filter on the last seen values of an indexed composite key:
```sql
-- Optimal Keyset Seek (O(log N) runtime)
SELECT id, created_at, total_amount
FROM orders
WHERE (created_at < @last_seen_created_at)
   OR (created_at = @last_seen_created_at AND id < @last_seen_id)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```
With a composite index on `(created_at DESC, id DESC)`:
1. The engine executes a single logarithmic B-Tree seek directly to the leaf node matching `(@last_seen_created_at, @last_seen_id)`.
2. It walks forward along the doubly linked leaf pages to read exactly 20 tuples.
3. Total I/O is bounded at $O(\\log N + K)$, delivering identical sub-millisecond response times whether fetching page 1 or page 10,000.

### Phase 3: Production Gotchas & Remediation
- **Page Drift / Inconsistent Results**: If a user is paginating via `OFFSET 20` and a new record is inserted at page 1, all subsequent rows shift downward by 1 position. The user sees duplicate records across pages. Keyset pagination provides stable, immutable cursor positions immune to concurrent inserts.
- **Strict Deterministic Ordering**: The keyset must end with a strictly unique tie-breaker column (such as the primary key `id`). If `created_at` contains identical timestamps and no unique tie-breaker is provided, rows with duplicate timestamps can be permanently skipped.
- **Random Access Limitation**: Keyset pagination does not allow jumping directly to arbitrary pages (e.g. 'Jump to Page 47'); it is tailored for infinite scroll and forward/backward cursor navigation.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Indexing & Access Paths"
    },
    {
        "id": "sql-iceberg-q-005",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Relational Theory & 3VL",
        "difficulty": "MEDIUM",
        "question": "How does Three-Valued Logic (3VL) handle NULL in SQL WHERE clauses versus CHECK constraints, and why does this lead to unexpected data acceptance?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
In standard boolean algebra, propositions evaluate to either TRUE or FALSE. In relational SQL, E.F. Codd introduced a third logical state: **UNKNOWN (NULL)**, representing missing or inapplicable data. All relational expressions follow Kleene Three-Valued Logic truth tables:
- `TRUE AND UNKNOWN = UNKNOWN`
- `FALSE AND UNKNOWN = FALSE`
- `NOT UNKNOWN = UNKNOWN`
- `NULL = NULL -> UNKNOWN`

The critical difference lies in how database subsystems treat UNKNOWN:
1. **WHERE Clauses**: A record is accepted **only if the predicate evaluates strictly to TRUE**. If it evaluates to FALSE or UNKNOWN, the record is discarded.
2. **CHECK Constraints**: A record is rejected **only if the constraint evaluates strictly to FALSE**. If it evaluates to TRUE or UNKNOWN, the record is accepted!

### Phase 2: Low-Level Implementation & Execution Behavior
Consider this table definition:
```sql
CREATE TABLE employees (
    id INT PRIMARY KEY,
    salary NUMERIC(10,2) CHECK (salary > 0)
);
```
An engineer expects every employee to have a positive salary. However:
```sql
INSERT INTO employees (id, salary) VALUES (1, NULL);
-- SUCCESS! Record is inserted!
```
Why did the insert succeed?
- The expression evaluated: `NULL > 0` $\\rightarrow$ `UNKNOWN`.
- The rule for CHECK constraints: Reject if condition == `FALSE`.
- Since `UNKNOWN` is not `FALSE`, the check constraint succeeds!

Now observe the WHERE clause:
```sql
SELECT * FROM employees WHERE salary > 0;
-- Returns 0 rows! (Row 1 with NULL salary is filtered out because UNKNOWN is discarded).
```

### Phase 3: Production Gotchas & Remediation
- **Mandatory NOT NULL with CHECK**: To enforce business invariants on columns, you must combine `NOT NULL` with the `CHECK` constraint:
  `salary NUMERIC(10,2) NOT NULL CHECK (salary > 0)`
- **Negative Filtering Trap**: `SELECT * FROM users WHERE status != 'BANNED'` will silently omit all users where `status IS NULL`. Developers must write:
  `WHERE status != 'BANNED' OR status IS NULL`
- **IN vs NOT IN with NULLs**: If a subquery returns even a single NULL value, `val NOT IN (SELECT col FROM subquery)` evaluates to UNKNOWN for all rows, returning an empty result set! Always use `NOT EXISTS` instead of `NOT IN`.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Relational Theory & 3VL"
    },
    {
        "id": "sql-iceberg-q-006",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Query Optimization & Execution",
        "difficulty": "HARD",
        "question": "What is the performance difference between ROWS and RANGE in SQL window function frame specifications, and why is omitting the frame a common performance trap?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
Window functions compute metrics across an ordered window of rows defined by the `OVER (PARTITION BY ... ORDER BY ...)` clause. The window frame specification defines the exact start and end boundaries of the sliding accumulator relative to the current row.

The ANSI SQL standard defines two framing mechanisms:
1. **ROWS**: Specifies physical row offsets (e.g. `ROWS BETWEEN 5 PRECEDING AND CURRENT ROW`). It evaluates tuples based strictly on row positions.
2. **RANGE**: Specifies logical value offsets based on the values in the `ORDER BY` column (e.g. all rows sharing the same value or within a value delta).

### Phase 2: Low-Level Implementation & Execution Behavior
The critical trap: According to the ANSI SQL standard, if an `ORDER BY` is included inside an `OVER()` clause without an explicit frame, the engine defaults to:
`RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`

Under `RANGE`, the query engine cannot simply stream rows through an accumulator. It must:
1. Inspect the `ORDER BY` column of subsequent rows to check for value ties (duplicate keys).
2. Spool intermediate rows into an in-memory or on-disk work table (in tempdb or work_mem).
3. If ties exist, include all duplicate rows in the frame calculation before advancing.

In contrast, explicitly declaring:
`ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`
instructs the engine to process tuples sequentially without tie-checking, executing in a single high-speed streaming pass with zero disk spooling.

### Phase 3: Production Gotchas & Remediation
- **10x to 100x CPU Degradation**: Running running totals (`SUM(amount) OVER (PARTITION BY account_id ORDER BY transaction_date)`) without `ROWS` on a 1-million row table triggers massive tempdb spooling and CPU saturation.
- **Rule of Thumb**: Always append `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` to running aggregations unless logical value tie-framing is strictly required by business logic.
- **Sliding Average Windows**: For moving averages, specify exact physical frames: `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` to calculate a 7-day moving window efficiently.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Query Optimization & Execution"
    },
    {
        "id": "sql-iceberg-q-007",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Indexing & Access Paths",
        "difficulty": "MEDIUM",
        "question": "What is a Covering Index, how do INCLUDE columns work physically, and how do they eliminate Key Lookups / Bookmark Lookups?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
When a query executes, the engine searches a secondary (non-clustered) B-Tree index to locate rows matching `WHERE` predicates. If the query requests columns not present in that secondary index, the engine must take each row pointer (the RID in heaps, or the Clustered Key in clustered tables) and execute a secondary search into the primary table structure.

This operation is called a **Key Lookup** (or Bookmark Lookup). Because Key Lookups perform random I/O for every candidate row, the optimizer will abandon the index and switch to a full table scan if the predicate matches more than 1–3% of total table rows.

A **Covering Index** contains all columns required by the query (both filter columns and projected columns), allowing the engine to satisfy the entire query from the index alone.

### Phase 2: Low-Level Implementation & Execution Behavior
Instead of adding all projected columns to the index key:
```sql
-- Bad: Expands key size in all B-Tree levels
CREATE INDEX idx_bad ON orders (customer_id, order_date, total_amount, shipping_address);
```
Relational engines provide the `INCLUDE` clause:
```sql
-- Optimal: Keeps B-Tree branch nodes narrow
CREATE INDEX idx_optimal ON orders (customer_id, order_date)
INCLUDE (total_amount, shipping_address);
```
Physical Storage Mechanics:
1. **Root and Intermediate Branch Pages**: Contain ONLY the index key columns (`customer_id`, `order_date`) and child page pointers. This keeps branch entries narrow, maximizing page fanout and keeping B-Tree depth low ($O(\\log N)$).
2. **Leaf Pages**: Contain the index keys PLUS the appended non-key payload bytes (`total_amount`, `shipping_address`).
3. The engine performs an index seek on `customer_id` and reads the projected values directly from the leaf page without touching the base table.

### Phase 3: Production Gotchas & Remediation
- **Write Amplification**: Updating an `INCLUDE` column triggers an update to the index leaf page, even though the column is not part of the search key. Include only columns that are frequently read but rarely updated.
- **Index Width Limits**: Modern engines enforce byte limits on index keys (e.g. 900 bytes or 1,700 bytes in SQL Server). `INCLUDE` columns bypass this limit, allowing wide datatypes (VARCHAR(MAX), NVARCHAR) to be stored in the leaf.
- **Eliminating Clustered Lookups**: Look for high-cost Key Lookup operators in execution plans with high execution counts—these are prime candidates for covering indexes.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Indexing & Access Paths"
    },
    {
        "id": "sql-iceberg-q-008",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Concurrency & Locking",
        "difficulty": "HARD",
        "question": "How does SELECT FOR UPDATE SKIP LOCKED work, and why is it the gold standard for high-throughput transactional job queues in relational databases?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
Using relational databases as job queues (task dispatching) is a common pattern. However, naive queue implementations face severe concurrency bottlenecks:
```sql
-- Naive Queue Poll (Contention & Deadlocks)
SELECT id, payload FROM jobs WHERE status = 'PENDING' ORDER BY priority DESC LIMIT 1;
UPDATE jobs SET status = 'PROCESSING', worker_id = @me WHERE id = @id;
```
If 50 worker processes execute this concurrently:
1. Multiple workers read the exact same job ID before any worker updates it.
2. When they attempt to UPDATE the row, 49 workers block on exclusive row locks, creating serialization queues and deadlocks.
3. Adding `SELECT ... FOR UPDATE` forces workers to queue up sequentially, reducing queue polling throughput to single-threaded speed.

### Phase 2: Low-Level Implementation & Execution Behavior
`SKIP LOCKED` eliminates lock contention by instructing the storage engine to bypass rows currently locked by other transactions:
```sql
-- Production Transactional Worker Queue
BEGIN TRANSACTION;

WITH next_job AS (
    SELECT id
    FROM jobs
    WHERE status = 'PENDING'
    ORDER BY priority DESC, id ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED -- Evaluates locks and skips contested rows!
)
UPDATE jobs
SET status = 'PROCESSING',
    locked_by = @worker_id,
    locked_at = CURRENT_TIMESTAMP
FROM next_job
WHERE jobs.id = next_job.id
RETURNING jobs.id, jobs.payload;

COMMIT;
```
Under the hood:
1. Worker 1 reads Row 1, acquiring an exclusive lock (`X`).
2. Worker 2 executes the same query. The storage engine encounters Row 1, notes the existing lock, and **instantly skips past it** to lock and return Row 2.
3. 100 workers can poll the table simultaneously in parallel with zero lock wait time and zero deadlocks.

### Phase 3: Production Gotchas & Remediation
- **Transaction Scope Requirement**: `SKIP LOCKED` is effective only within an active transaction. Once committed or rolled back, the row lock is released.
- **Failure Recovery & Timeouts**: If a worker crashes while processing a job, the transaction aborts and the row lock is released automatically, returning the job to `PENDING` state. For long jobs where transactions cannot stay open, implement a background reaper polling `locked_at < NOW() - INTERVAL '5 minutes'`.
- **Index Support**: Ensure the query is backed by a partial index: `CREATE INDEX idx_pending_jobs ON jobs (priority DESC, id ASC) WHERE status = 'PENDING'`. Without an index, the engine scans the table, acquiring and evaluating locks on unrelated rows.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Concurrency & Locking"
    },
    {
        "id": "sql-iceberg-q-009",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Concurrency & Isolation",
        "difficulty": "HARD",
        "question": "What is the Write Skew anomaly under Snapshot Isolation, how does it differ from Dirty and Non-Repeatable Reads, and how can it be prevented?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
Snapshot Isolation (SI) provides non-blocking reads by presenting each transaction with a consistent point-in-time snapshot of the database. SI completely eliminates:
- **Dirty Reads**: A transaction reading uncommitted writes from another session.
- **Non-Repeatable Reads**: A transaction re-reading a row and seeing modified values.
- **Phantom Reads**: A transaction re-reading a range and seeing new rows inserted.

However, Snapshot Isolation is NOT equivalent to true Serializability because it permits **Write Skew**. Write Skew occurs when two concurrent transactions read overlapping data sets but write to distinct, non-overlapping rows, violating an application-level integrity invariant.

### Phase 2: Low-Level Implementation & Execution Behavior
The Classic On-Call Doctor Scenario:
- **Invariant**: At least one doctor must remain on-call at all times (`COUNT(*) >= 1`).
- **Initial State**: Dr. Alice (OnCall = TRUE), Dr. Bob (OnCall = TRUE).

Transaction 1 (Dr. Alice wants to go off call):
1. `SELECT COUNT(*) FROM doctors WHERE on_call = true;` -> Returns 2 (valid).
2. `UPDATE doctors SET on_call = false WHERE name = 'Alice';`
3. Transaction 1 commits.

Transaction 2 (Dr. Bob concurrently wants to go off call):
1. `SELECT COUNT(*) FROM doctors WHERE on_call = true;` -> Reads snapshot: Returns 2 (valid).
2. `UPDATE doctors SET on_call = false WHERE name = 'Bob';`
3. Transaction 2 commits.

Under Snapshot Isolation, the engine's 'first-committer-wins' conflict detection checks whether both transactions modified the **same row**. Because Alice modified row 1 and Bob modified row 2, **both transactions commit successfully**! The database now has 0 doctors on call, violating the invariant!

### Phase 3: Production Gotchas & Remediation
- **Remediation 1: Elevation to Serializable Isolation**: Under true Serializable isolation (using Serializable Snapshot Isolation / SSI), the engine tracks read-write antidependencies. It detects the conflict cycle and aborts Transaction 2 with error `40001 (serialization_failure)`.
- **Remediation 2: Pessimistic Row Locking**: Force write conflicts on an overlapping row using `SELECT ... FOR UPDATE`:
  `SELECT id FROM doctors WHERE on_call = true FOR UPDATE;`
  This places exclusive row locks, forcing Bob's transaction to wait until Alice commits. When Bob resumes, he sees only 1 doctor on call and aborts.
- **Remediation 3: Materialized Conflict Table**: Create a single row representing the shift lock (`shift_lock`) and force both transactions to update that specific lock row.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Concurrency & Isolation"
    },
    {
        "id": "sql-iceberg-q-010",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Storage Engine Internals",
        "difficulty": "HARD",
        "question": "What is the Ascending Key Problem in B-Trees, how does it degrade both physical latch concurrency and optimizer cardinality estimation, and how is it resolved?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
In modern OLTP systems, primary keys are predominantly sequential auto-incrementing integers (`IDENTITY`, `BIGSERIAL`) or monotonically increasing time-based UUIDs (UUIDv7). While sequential keys prevent B-Tree fragmentation during insertion, they produce the **Ascending Key Problem** at scale:
1. **Physical Latch Contention**: Every single concurrent `INSERT` targets the exact same physical leaf page at the extreme right edge of the clustered B-Tree.
2. **Optimizer Cardinality Underestimation**: Newly inserted records fall beyond the maximum high-key value recorded in the last statistics histogram update, causing the optimizer to drastically underestimate row counts.

### Phase 2: Low-Level Implementation & Execution Behavior
**1. Physical Latch Saturation (PAGELATCH_EX)**:
Before a worker thread can append a new row into an 8KB page, it must acquire an exclusive in-memory page latch (`PAGELATCH_EX`). When 500 concurrent connections insert transactions simultaneously:
- 499 threads stall waiting on the single rightmost page latch.
- As the page fills up, it splits, requiring exclusive latches on parent branch pages up the tree.
- CPU utilization spikes into kernel spinlocks, collapsing write throughput.

**2. Optimizer Out-of-Bounds Histogram Regressions**:
A histogram samples a column and records the maximum seen key value (e.g. `HIGH_KEY = 1,000,000`). If 500,000 new records are inserted:
- A query asks: `SELECT * FROM orders WHERE id > 1200000;`
- The optimizer inspects the histogram, sees that 1,200,000 is greater than the maximum known key (1,000,000), and estimates **Actual Rows = 1**.
- Based on this estimate, it chooses a Nested Loops join with index seeks. In reality, 300,000 rows match, resulting in 300,000 random seeks and a multi-minute query outage.

### Phase 3: Production Gotchas & Remediation
- **Hash Partitioning**: Partition the table using a hash of the primary key across 16 or 32 partitions. Sequential inserts disperse across 32 independent rightmost leaf pages, eliminating single-page latch bottlenecks.
- **Reverse Key Indexes**: Reversing the byte order of the key spreads sequential values across the entire B-Tree width, though this eliminates range scan capabilities.
- **Trace Flag / Engine Optimizations**: SQL Server 2014+ introduced cardinality estimator updates (and Trace Flag 2389/2390) that detect ascending columns and dynamically extrapolate histogram row counts beyond the high key.
- **Synthetic Sharded Keys**: Prefix IDs with a tenant ID or shard prefix: `TenantId_SequenceId`.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Storage Engine Internals"
    },
    {
        "id": "sql-iceberg-q-011",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Query Optimization & Execution",
        "difficulty": "ARCHITECT",
        "question": "What was 'fsyncgate' in PostgreSQL and the Linux kernel, how did it cause silent database corruption, and how did database engines adapt?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
The fundamental guarantee of database Durability (the 'D' in ACID) relies on the `fsync()` system call. When a database commits a transaction, it writes log records to the OS page cache via `write()` and calls `fsync()` on the file descriptor to ensure the operating system and disk controller flush all dirty memory pages to persistent non-volatile media.

For decades, POSIX documentation was ambiguous regarding error recovery on `fsync()`. Database engines (including PostgreSQL) operated under the assumption:
*If background page writeback fails due to a temporary I/O error, calling `fsync()` will return an error code (EIO), allowing the database engine to retry the write until it succeeds.*

### Phase 2: Low-Level Implementation & Execution Behavior
In 2018, PostgreSQL developers discovered the reality of Linux kernel writeback error handling (dubbed 'fsyncgate'):
1. When background kernel threads encountered an I/O error while writing dirty pages to disk, the Linux kernel **cleared the dirty bit** on the page in the page cache and marked the file mapping with an error.
2. When PostgreSQL subsequently called `fsync()`, the call returned an error (`EIO`).
3. PostgreSQL recorded the error and retried `fsync()` on the next checkpoint.
4. On the second `fsync()` call, the Linux kernel observed that the page was no longer marked dirty (the dirty bit was cleared on the first failure) and that the error flag had already been reported.
5. **The second fsync() call returned SUCCESS (0)!**
6. PostgreSQL assumed the dirty pages were safely persisted on disk, removed the WAL protection, and recycled the transaction log! The data in those pages was permanently lost, leaving corrupted data files on disk.

### Phase 3: Production Gotchas & Remediation
- **Database Engine Adaptation**: PostgreSQL rewrote its I/O architecture. The engine no longer attempts to retry `fsync()`. Any `fsync()` failure is now treated as an immediate **FATAL PANIC**, crashing the PostgreSQL server immediately to force crash recovery replay from the Write-Ahead Log upon restart.
- **Linux Kernel Patches**: Linux kernel developers introduced `sync_file_range()` and updated writeback error tracking (`errseq_t`) to ensure error states persist across file descriptor handles.
- **Direct I/O (O_DIRECT)**: Modern distributed database engines (like RocksDB, ScyllaDB, and MySQL InnoDB) increasingly bypass the OS page cache entirely using `O_DIRECT`, taking direct ownership of page memory and NVMe controller flush commands to guarantee durability.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Storage Engine Internals"
    },
    {
        "id": "sql-iceberg-q-012",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Storage Engine Internals",
        "difficulty": "ARCHITECT",
        "question": "What is Transaction ID (XTID) Wraparound in PostgreSQL MVCC, why does it threaten catastrophic data invisibility, and how does the engine mitigate it?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
PostgreSQL's Multi-Version Concurrency Control (MVCC) determines row visibility by inspecting two 32-bit transaction IDs in every row's tuple header:
- `xmin`: The transaction ID that inserted the row.
- `xmax`: The transaction ID that deleted or updated the row.

Because transaction IDs are 32-bit integers, the database can represent only $2^{32} \\approx 4.29$ billion distinct transactions before the counter overflows. In modular 32-bit arithmetic, half of the transaction IDs ($2^{31} \\approx 2.14$ billion) are considered to have occurred in the past, and half are considered to be in the future.

If the transaction counter advances past 2.14 billion transactions without intervention, the counter wraps around: **transactions that occurred in the distant past will suddenly appear to have occurred in the future, rendering all historical rows in the database completely invisible!**

### Phase 2: Low-Level Implementation & Execution Behavior
To prevent historical data from disappearing, PostgreSQL employs **Tuple Freezing**:
1. When a row was committed more than `vacuum_freeze_min_age` transactions ago, background `autovacuum` workers sweep the table.
2. The worker marks the tuple header with a special status bit: `HEAP_XMIN_FROZEN` (in modern Postgres, frozen status is encoded in the `t_infomask`).
3. A frozen tuple is defined by the engine to be older than all active and future transactions, making it permanently visible regardless of transaction counter wraparound.

If autovacuum cannot keep pace with write transaction velocity:
- As the database approaches `autovacuum_freeze_max_age` (default: 200 million transactions from wraparound), PostgreSQL spawns aggressive anti-wraparound autovacuum workers that bypass ordinary cost-delay throttling.
- If the remaining transaction count drops to 1 million before wraparound, PostgreSQL **forcibly enters read-only emergency mode and shuts down**:
  `FATAL: database is not accepting commands to avoid wraparound data loss in database "production"`

### Phase 3: Production Gotchas & Remediation
- **Emergency Recovery**: If a database halts due to wraparound risk, administrators must start PostgreSQL in single-user maintenance mode (`postgres --single -D /data/db`) and manually run `VACUUM FREEZE ANALYZE` on bloated tables without client traffic.
- **Monitoring Metric**: Production monitoring must alert on `datfrozenxid` age:
  ```sql
  SELECT datname, age(datfrozenxid) FROM pg_database ORDER BY 2 DESC;
  ```
  Alert if `age > 150,000,000`.
- **Autovacuum Tuning**: Increase `autovacuum_max_workers`, reduce `autovacuum_vacuum_cost_delay` from 2ms to 0ms for NVMe SSDs, and increase `maintenance_work_mem` to allow autovacuum to process millions of dead tuples in a single RAM pass.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Storage Engine Internals"
    },
    {
        "id": "sql-iceberg-q-013",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Query Optimization & Execution",
        "difficulty": "ARCHITECT",
        "question": "What is the Halloween Problem in database query execution, and how do relational query engines physically prevent it?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
The **Halloween Problem** is a famous database mutation anomaly first identified on October 31, 1976, by Pat Selinger, Don Chamberlin, and Morton Astrahan during the development of IBM's System R.

The problem arose on a seemingly straightforward salary adjustment query:
```sql
UPDATE employees SET salary = salary * 1.10 WHERE salary < 25000;
```
The query engine executed the update using an existing B-Tree index on `salary`:
1. It scanned the index, found an employee earning $20,000, and updated the salary to $22,000.
2. The update updated the B-Tree index, moving the employee's index key forward along the leaf path.
3. The index scan continued walking forward, encountered the same employee again at $22,000, and raised them to $24,200.
4. It encountered them again at $24,200 and raised them to $26,620!
Every employee earning under $25,000 received multiple raises until their salary exceeded the threshold.

### Phase 2: Low-Level Implementation & Execution Behavior
The Halloween Problem occurs whenever an update statement mutates a column that is simultaneously being used by an active index scan to identify matching candidate rows.

Modern relational engines enforce **Halloween Protection** by decoupling the read scan phase from the write mutation phase:
1. **Blocking Spool Operator (Table Spool)**: The engine inserts an intermediate blocking operator (such as a Table Spool or Sort) in the execution plan between the Index Scan and the Update operator.
2. The Index Scan reads all matching candidate rows and writes their row identifiers and new values into an in-memory/tempdb spool table.
3. Only after the read phase is 100% complete does the Update operator pull rows from the spool table and write modifications to the base table and indexes.

### Phase 3: Production Gotchas & Remediation
- **Execution Plan Recognition**: Look for a `Table Spool (Eager Spool)` or `Sort (Halloween Protection)` immediately beneath an `Update` or `Delete` operator in execution plans.
- **Performance Overhead**: For multi-million-row batch updates, the eager spool allocates memory and can spill millions of rows to disk, consuming significant tempdb I/O.
- **Optimization Strategy**: Updating columns that are NOT part of the search index avoids the Halloween Problem entirely, allowing the engine to execute in-place streaming updates with zero spooling overhead.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Query Optimization & Execution"
    },
    {
        "id": "sql-iceberg-q-014",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Query Optimization & Execution",
        "difficulty": "ARCHITECT",
        "question": "What are Worst-Case Optimal Joins (WCOJ) and Leapfrog Triejoin, and why do traditional binary join trees fail asymptotically on cyclic graph queries?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
For 50 years, relational query engines have executed multi-table queries by breaking them down into trees of **pairwise binary joins** (e.g. Join Table A with Table B, then Join the result with Table C). While optimal for acyclic queries, binary join trees suffer catastrophic asymptotic inefficiency on cyclic graph queries.

Consider a classic Triangle Query in graph analytics (finding all triangles $A - B - C - A$):
```sql
SELECT * FROM edges e1
JOIN edges e2 ON e1.dst = e2.src
JOIN edges e3 ON e2.dst = e3.src AND e3.dst = e1.src;
```
If a graph has $N$ vertices and $M$ edges, the maximum number of triangles is bounded by the Atserias-Grohe-Marx (AGM) bound: $O(M^{1.5})$.
However, any pairwise binary join tree must first compute an intermediate two-edge path join (`e1 JOIN e2`). For a dense graph (like a star or complete bipartite graph), this intermediate binary join can produce $O(M^2)$ rows, even if the final query returns ZERO triangles!

### Phase 2: Low-Level Implementation & Execution Behavior
**Worst-Case Optimal Joins (WCOJ)** are multiway join algorithms that evaluate all relational constraints simultaneously across multiple dimensions, guaranteeing that execution runtime never exceeds the theoretical AGM bound $O(M^{1.5})$.

The leading practical WCOJ algorithm is **Leapfrog Triejoin** (developed by Todd Veldhuizen):
1. All relations are modeled as sorted tries over their shared attribute ordering (e.g. ordered by attribute $x$, then $y$, then $z$).
2. Instead of joining relations pairwise, Leapfrog Triejoin acts as an $N$-way coordinated cursor intersection over attribute $x$.
3. Cursors 'leapfrog' over each other: Cursor A jumps to the key of Cursor B; if Cursor B is higher, Cursor A leaps ahead. If all cursors align on key $x$, the algorithm recurses down to attribute $y$.
4. It never materializes non-viable intermediate paths, completely eliminating the $O(M^2)$ intermediate Cartesian bottleneck.

### Phase 3: Production Gotchas & Remediation
- **Modern Engine Adoption**: Specialized graph-relational engines (such as Kùzu, LogicBlox, and RelationalAI) use Leapfrog Triejoin as their primary execution model.
- **Relational OLAP Integration**: Mainstream engines (DuckDB, ClickHouse) are researching hybrid optimizers that execute binary joins for star schema trees and switch to WCOJ for cyclic subgraphs.
- **Index Requirements**: WCOJ requires multi-attribute prefix sorted indexes (tries or sorted B-Trees) covering all permutations of join attributes to enable cursor leapfrogging.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Query Optimization & Execution"
    },
    {
        "id": "sql-iceberg-q-015",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Engine Architecture & Compute",
        "difficulty": "ARCHITECT",
        "question": "What is the physical difference between Vectorized Query Execution and Hardware SIMD Vectorization, and how do modern analytical engines combine both?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
In database architecture discussions, the term 'vectorization' is frequently overloaded. It is crucial to distinguish between software-level and hardware-level vectorization:
1. **Vectorized Query Execution (Software / Architectural)**: An engine execution paradigm (pioneered by Peter Boncz in MonetDB/X100 and adopted by DuckDB, Databricks Photon, and ClickHouse) where physical operators pass **batches of tuples** (e.g. 1,024 column values in a contiguous array) through query pipelines rather than one tuple at a time.
2. **Hardware SIMD Vectorization (CPU Registers)**: Hardware-level Single Instruction, Multiple Data execution, where CPU instruction sets (such as Intel AVX-2, AVX-512, or ARM Neon) load 128, 256, or 512 bits of contiguous data into specialized vector registers and execute an operation (e.g. 8 simultaneous 64-bit integer additions) in a single CPU clock cycle.

### Phase 2: Low-Level Implementation & Execution Behavior
**1. The Overhead of the Volcano Model**:
Classical engines pull one tuple at a time via `operator->next()`. For a 100-million row table, this executes 100 million virtual function pointer calls per operator. Each call incurs CPU pipeline stalls, branch mispredictions, and instruction cache evictions.

**2. Software Vectorized Execution**:
In a vectorized engine:
```cpp
// Vectorized Filter Operator: Processes 1024 tuples in tight, simple loop
void FilterGreaterThan(int64_t* col_in, bool* mask_out, int64_t threshold, int count) {
    for (int i = 0; i < count; ++i) {
        mask_out[i] = col_in[i] > threshold;
    }
}
```
Benefits of software vectorization:
- Amortizes dynamic virtual function dispatch by 1,024x.
- Memory arrays are kept within 64KB L1 data cache boundaries.
- The simple, branchless loop allows modern C++ compilers (LLVM/GCC) to **auto-vectorize the code into hardware SIMD instructions**!

**3. Hardware SIMD Execution**:
When auto-vectorized, the compiler emits AVX-512 instructions:
`VPCMPGTQ zmm0, zmm1, [rsi + rdx*8]`
This evaluates 8 64-bit integers simultaneously in a single clock cycle, delivering near-theoretical memory bandwidth throughput.

### Phase 3: Production Gotchas & Remediation
- **Vectorized vs JIT Compilation (HyPer)**: The competing paradigm to vectorized batch execution is Whole-Stage Code Generation / JIT (HyPer / Spark Tungsten), which compiles the entire query into a single fused machine code loop to keep data in CPU registers. Both paradigms dominate modern high-performance OLAP.
- **Memory Alignment**: Hardware SIMD instructions require contiguous memory aligned on 32-byte or 64-byte boundaries. Columnar storage formats (Arrow, Parquet) naturally align with SIMD registers.
- **Scatter-Gather Overhead**: SIMD efficiency drops if data is fragmented or contains high-cardinality string pointers requiring gather/scatter memory instructions.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Engine Architecture & Compute"
    }
]

print(f"Prepared {len(iceberg_questions)} new iceberg Q&As.")

new_ids = {q['id'] for q in iceberg_questions}
assert len(new_ids) == len(iceberg_questions), "Duplicate IDs within iceberg_questions!"

for q in iceberg_questions:
    assert q['id'] not in existing_ids, f"Duplicate ID in questions.json: {q['id']}"

data.extend(iceberg_questions)
print(f"After append: {len(data)} (+{len(iceberg_questions)})")

with open(FILE, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Successfully written to", FILE)
