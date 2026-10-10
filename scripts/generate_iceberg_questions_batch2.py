"""
Bulk generation of SQL Iceberg Q&As (Part 2) for questions.json
Covers remaining deep topics from the SQL iceberg.
"""
import json
import os

FILE = 'src/data/json/questions.json'

with open(FILE, 'r') as f:
    data = json.load(f)

print(f"Existing questions: {len(data)}")
existing_ids = {q['id'] for q in data}

iceberg_questions_2 = [
    {
        "id": "sql-iceberg-q-016",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Query Optimization & Execution",
        "difficulty": "HARD",
        "question": "How do LATERAL Joins and CROSS APPLY work under the hood, and how do they solve the Top-N per group problem with minimal I/O?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
In standard ANSI SQL joins, the right-hand input cannot reference columns produced by the left-hand input. `CROSS JOIN LATERAL` (PostgreSQL/MySQL) and `CROSS APPLY` (SQL Server) break this isolation barrier by executing the right-hand subquery iteratively for every individual row emitted by the left-hand table, passing outer column values into the inner subquery.

This provides an elegant, set-based mechanism for the classic 'Top-N records per category' problem (e.g. 'Get the 3 most recent orders for every customer') without requiring window functions over the entire table.

### Phase 2: Low-Level Implementation & Execution Behavior
Consider the naive window function approach:
```sql
-- Window function approach: Scans entire 50-million row orders table!
WITH ranked AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) as rn
    FROM orders
)
SELECT * FROM ranked WHERE rn <= 3;
```
Execution mechanics:
1. Scans all 50 million rows of the `orders` table.
2. Performs a massive sort or Segment/Sequence Project in tempdb/work_mem to rank every row.
3. Filters out 49.7 million rows in a Filter operator.

Now consider the LATERAL / CROSS APPLY query:
```sql
-- LATERAL Seek Approach: Reads ONLY the required rows!
SELECT c.id, c.name, o.id, o.order_date, o.total_amount
FROM customers c
CROSS JOIN LATERAL (
    SELECT id, order_date, total_amount
    FROM orders
    WHERE customer_id = c.id
    ORDER BY order_date DESC
    LIMIT 3
) o;
```
Execution mechanics with index on `orders(customer_id, order_date DESC)`:
1. Reads 10,000 customers from `customers`.
2. For each customer, performs an index seek to the customer's orders and reads **exactly 3 rows** from the leaf page.
3. Total I/O: 10,000 seeks $\\times$ 3 rows = 30,000 row reads! It bypasses scanning 49.97 million irrelevant historical rows.

### Phase 3: Production Gotchas & Remediation
- **Mandatory Index Support**: CROSS APPLY without a supporting composite index on `(foreign_key, sort_col DESC)` triggers a Nested Loops join with full table scans for every outer row, completely freezing the server.
- **Unnesting JSON & Arrays**: LATERAL is the standard mechanism to unpack JSONB arrays (`jsonb_array_elements`) or relational arrays (`UNNEST`) while preserving parent row identity.
- **Outer Join Semantics**: If a customer has 0 orders, `CROSS JOIN LATERAL` drops the customer. To preserve zero-order customers, use `LEFT JOIN LATERAL ... ON true` (or `OUTER APPLY` in SQL Server).""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Query Optimization & Execution"
    },
    {
        "id": "sql-iceberg-q-017",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Query Optimization & Execution",
        "difficulty": "HARD",
        "question": "How do Recursive Common Table Expressions (CTEs) execute internally, and how do you implement cycle detection in cyclic graph structures?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
A Recursive CTE (`WITH RECURSIVE`) traverses hierarchical and graph data models (such as organizational hierarchies, network routing graphs, or bill-of-materials assemblies).

A recursive CTE consists of:
1. **The Anchor Member**: The base query executed once to seed the initial result set.
2. **The Recursive Member**: The iterative query that joins back to the CTE itself.
3. **UNION ALL**: The set operator that concatenates iterations without deduplication overhead.

Under the hood, the engine maintains an internal queue: the **Working Table** (intermediate queue) and an **Accumulator Table**. At each iteration, the engine feeds the current Working Table into the Recursive Member, replaces the Working Table with the new output tuples, and accumulates the rows until the Working Table is empty.

### Phase 2: Low-Level Implementation & Execution Behavior
If a graph contains a directed cycle (e.g. Node A $\\rightarrow$ Node B $\\rightarrow$ Node C $\\rightarrow$ Node A), naive recursion will loop infinitely until hitting memory exhaustion or engine thresholds (`MAXRECURSION` in SQL Server).

To prevent infinite loops, implement **Path-Array Cycle Detection**:
```sql
WITH RECURSIVE graph_search AS (
    -- Anchor member
    SELECT 
        id, 
        parent_id, 
        1 AS depth, 
        ARRAY[id] AS path,
        false AS is_cycle
    FROM nodes
    WHERE id = 1

    UNION ALL

    -- Recursive member
    SELECT 
        n.id, 
        n.parent_id, 
        gs.depth + 1,
        gs.path || n.id,
        n.id = ANY(gs.path) -- Cycle detection predicate!
    FROM nodes n
    JOIN graph_search gs ON n.parent_id = gs.id
    WHERE NOT gs.is_cycle AND gs.depth < 50
)
SELECT * FROM graph_search WHERE NOT is_cycle;
```
Execution mechanics:
- `path || n.id` appends the visited node ID to an array.
- `n.id = ANY(gs.path)` evaluates whether the target node was already visited along this traversal branch.
- The `WHERE NOT gs.is_cycle` predicate halts execution immediately upon detecting a back-edge.

### Phase 3: Production Gotchas & Remediation
- **Breadth-First vs Depth-First Spooling**: By default, `UNION ALL` recursive CTEs process in Breadth-First Search (BFS) order. If querying deep trees, the Working Table can grow to millions of in-memory rows.
- **Cycle Limits**: In SQL Server, the default `MAXRECURSION` limit is 100. Specify `OPTION (MAXRECURSION 0)` to allow unbounded depth, but only when path cycle detection is verified.
- **Memory Spilling**: When working tables exceed available memory grants, the engine spills intermediate queues to tempdb work tables, causing heavy disk churn.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Query Optimization & Execution"
    },
    {
        "id": "sql-iceberg-q-018",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Relational Theory & 3VL",
        "difficulty": "HARD",
        "question": "Why is the statement 'There are no non-nullable types in SQL' a fundamental relational reality despite column-level NOT NULL DDL?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
In statically typed programming languages (like Rust, TypeScript, or Kotlin), a `non-nullable` type (e.g. `String` vs `String?`) is enforced by the compiler across all expressions, assignments, and function calls. 

In SQL, developers often believe that declaring a column `NOT NULL` in a `CREATE TABLE` statement creates an immutable non-nullable type. This is a myth. In relational database engines, `NOT NULL` is merely a storage integrity constraint enforced during INSERT and UPDATE operations on physical base tables. The SQL type system itself does NOT support non-nullable types for derived expressions, joins, or aggregations.

### Phase 2: Low-Level Implementation & Execution Behavior
The relational algebra generates NULLs in expressions regardless of physical column definitions:
1. **Outer Joins**:
   ```sql
   CREATE TABLE users (id INT PRIMARY KEY, email VARCHAR(255) NOT NULL);
   CREATE TABLE logins (id INT PRIMARY KEY, user_id INT);

   SELECT u.email 
   FROM logins l 
   LEFT JOIN users u ON l.user_id = u.id;
   ```
   If a login record has an unmapped `user_id`, the engine synthesizes a `NULL` for `u.email`. Even though `users.email` is declared `NOT NULL`, the query returns `NULL`!
2. **Empty Partition Aggregations**:
   ```sql
   SELECT SUM(salary) FROM employees WHERE department = 'NON_EXISTENT';
   ```
   Even if `salary` is `NOT NULL`, the scalar aggregate returns `NULL` (unknown sum over an empty set).
3. **CASE Expressions with Missing ELSE**:
   A `CASE` expression without an `ELSE` clause implicitly defaults to `ELSE NULL`.

### Phase 3: Production Gotchas & Remediation
- **Application Code NullPointerExceptions**: Modern ORMs and code generators that map `NOT NULL` SQL columns to non-nullable language types (e.g. C# non-nullable reference types or TypeScript strict nulls) crash with runtime NullPointerExceptions when reading from LEFT JOIN queries.
- **Defensive Projection with COALESCE**: When projecting columns from outer-joined tables, always wrap values in `COALESCE()` or map them to nullable DTO properties in application code.
- **GROUP BY Cube/Rollup**: `ROLLUP` and `CUBE` synthesize NULLs in grouping columns to indicate subtotal and grand total rows, even if the underlying grouping column is strictly `NOT NULL`.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Relational Theory & 3VL"
    },
    {
        "id": "sql-iceberg-q-019",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Query Optimization & Execution",
        "difficulty": "HARD",
        "question": "What is Parameter Sniffing in stored procedures and parameterized SQL, why does it trigger severe query plan regressions, and how do you remediate it?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
When a parameterized query or stored procedure executes for the first time, the query engine compiles the query and places the physical execution plan in the plan cache. 

During compilation, the optimizer inspects the specific parameter values passed in that first execution—a process called **Parameter Sniffing**. The optimizer reads histogram statistics for those specific parameter values and tailors the physical execution plan (join types, index seeks vs scans, memory grants) specifically for that initial workload.

Parameter Sniffing becomes catastrophic when data is non-uniformly distributed (skewed data). A plan optimized for a rare parameter will be disastrous when reused for a common parameter, and vice versa.

### Phase 2: Low-Level Implementation & Execution Behavior
Consider an orders table where 99.9% of rows have `status = 'COMPLETED'` (10,000,000 rows) and 0.1% have `status = 'PENDING'` (1,000 rows):
```sql
CREATE PROCEDURE GetOrdersByStatus @status VARCHAR(20)
AS
    SELECT * FROM orders WHERE status = @status;
```
Scenario A (Normal execution):
- First call: `EXEC GetOrdersByStatus 'PENDING'`.
- Optimizer sniffs `'PENDING'`, sees 1,000 rows in histogram, compiles an **Index Seek with Key Lookups**.
- Cached plan runs in 2ms.

Scenario B (Parameter Sniffing Regression):
- Subsequent call: `EXEC GetOrdersByStatus 'COMPLETED'`.
- The engine reuses the cached plan from Scenario A!
- Instead of performing a high-speed sequential clustered index scan, the engine attempts to execute **10,000,000 individual random Key Lookups**!
- Buffer pool is thrashed, CPU spikes to 100%, and the query stalls for 45 minutes!

### Phase 3: Production Gotchas & Remediation
- **Remediation 1: OPTIMIZE FOR UNKNOWN**:
  Instructs the optimizer to ignore sniffed parameters and use average density vector statistics:
  `OPTION (OPTIMIZE FOR (@status UNKNOWN))`
- **Remediation 2: Local Variable Decoupling**:
  Assigning the parameter to a local variable inside the procedure hides the value from compile-time sniffing:
  ```sql
  DECLARE @local_status VARCHAR(20) = @status;
  SELECT * FROM orders WHERE status = @local_status;
  ```
- **Remediation 3: OPTION (RECOMPILE)**:
  For infrequent, critical batch reports with extreme variance, force recompilation on every run to guarantee optimal plans at the cost of 5ms compilation CPU overhead.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Query Optimization & Execution"
    },
    {
        "id": "sql-iceberg-q-020",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Concurrency & Isolation",
        "difficulty": "ARCHITECT",
        "question": "Why do transactions running under Serializable Snapshot Isolation (SSI) mandate application retry loops on all statements, and how do you handle SQLSTATE 40001?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
Serializable Snapshot Isolation (SSI) provides true Serializable transactions without the heavy locking overhead of traditional Two-Phase Locking (2PL). Instead of acquiring shared read locks that block concurrent writers, SSI allows transactions to read from point-in-time MVCC snapshots lock-free.

To prevent anomalies like Write Skew, SSI monitors read-write conflicts (**rw-antidependencies**) across transactions. An rw-antidependency occurs when Transaction $T_1$ reads a row version, and concurrent Transaction $T_2$ writes a newer version of that row.

If the engine's serialization graph detects a potential cycle of conflicts ($T_1 \\rightarrow T_2 \\rightarrow T_1$), it must break the cycle to preserve serializability. It does this by **actively aborting one of the transactions with SQLSTATE 40001 (serialization_failure)**.

### Phase 2: Low-Level Implementation & Execution Behavior
Under SSI, serialization failures are NOT bugs or database errors—they are the normal, expected mechanism by which the engine enforces consistency. Therefore, applications using Serializable isolation must wrap every transactional interaction in an **exponential backoff retry loop**:
```python
import time
import random
import psycopg2

def execute_with_retry(conn, transactional_func, max_retries=5):
    for attempt in range(max_retries):
        try:
            with conn.cursor() as cur:
                cur.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;")
                result = transactional_func(cur)
                conn.commit()
                return result
        except psycopg2.errors.SerializationFailure as err:
            conn.rollback()
            if attempt == max_retries - 1:
                raise
            # Exponential backoff with full jitter
            sleep_duration = (0.05 * (2 ** attempt)) + random.uniform(0, 0.05)
            time.sleep(sleep_duration)
```
Execution mechanics:
1. When SQLSTATE 40001 is thrown, the transaction's read snapshot is discarded.
2. The client rolls back the connection to clear aborted state.
3. Adding random jitter avoids the 'thundering herd' problem where colliding transactions retry at identical intervals and collide again.

### Phase 3: Production Gotchas & Remediation
- **Idempotency Requirement**: Every statement executed within the transaction block must be side-effect free outside the database (or guarded by idempotency tokens). Never trigger external credit card charges or send emails inside an uncommitted SSI retry block!
- **Write-Heavy Saturation**: In workloads with extreme write contention on the same keys, SSI abort rates can exceed 50%, causing retry storms. In these scenarios, use pessimistic locking (`SELECT ... FOR UPDATE`) or application-level message queuing.
- **SIREAD Lock Memory**: SSI tracks read sets using in-memory `SIREAD` locks. If millions of rows are read, SIREAD locks escalate to page or table levels, increasing false-positive conflict aborts.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Concurrency & Isolation"
    },
    {
        "id": "sql-iceberg-q-021",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Concurrency & Isolation",
        "difficulty": "HARD",
        "question": "What is the race condition inherent in ANSI SQL MERGE statements, and how do you achieve safe, atomic UPSERTs under high concurrency?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
The ANSI `MERGE` statement synchronizes target tables by evaluating whether matching records exist in the source dataset:
```sql
MERGE INTO inventory AS target
USING (SELECT @product_id AS id, @quantity AS qty) AS source
ON target.product_id = source.id
WHEN MATCHED THEN
    UPDATE SET target.quantity = target.quantity + source.qty
WHEN NOT MATCHED THEN
    INSERT (product_id, quantity) VALUES (source.id, source.qty);
```
Under high concurrency, when two sessions attempt to MERGE the same new product ID simultaneously:
1. Session A executes the `ON target.product_id = source.id` check. The row does not exist. Session A proceeds to the `WHEN NOT MATCHED` branch.
2. Simultaneously, Session B executes the same check. The row still does not exist. Session B also proceeds to the `WHEN NOT MATCHED` branch.
3. Session A executes the `INSERT` and commits.
4. Session B attempts to execute its `INSERT` $\\rightarrow$ **Crashes with Primary Key / Unique Constraint Violation!**

### Phase 2: Low-Level Implementation & Execution Behavior
The ANSI MERGE statement in engines like SQL Server and Oracle does NOT hold serializable range locks on the target table during the match-evaluation phase by default.

**Remediation in SQL Server (HOLDLOCK Hint)**:
To serialize the check and prevent concurrent inserts, you must force serialized key-range locking:
```sql
MERGE INTO inventory WITH (HOLDLOCK) AS target -- Acquires RangeS-U locks!
USING (SELECT @product_id AS id, @quantity AS qty) AS source
ON target.product_id = source.id
WHEN MATCHED THEN UPDATE ...
WHEN NOT MATCHED THEN INSERT ...;
```
`HOLDLOCK` (equivalent to `SERIALIZABLE`) acquires Key-Range Shared-Update (`RangeS-U`) locks, preventing other transactions from inserting into the key range until the statement finishes.

**Remediation in PostgreSQL (Native Atomic UPSERT)**:
PostgreSQL avoids MERGE race conditions via native `ON CONFLICT` specifiers backed by physical unique index arbiters:
```sql
INSERT INTO inventory (product_id, quantity)
VALUES (@product_id, @quantity)
ON CONFLICT (product_id) -- Relies on physical unique index arbiter
DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity;
```
Execution mechanics:
1. The insert probes the unique index.
2. If a key conflict occurs, the engine atomically pivots to an update in a single physical operation without releasing index latches, eliminating race conditions entirely.

### Phase 3: Production Gotchas & Remediation
- **Deadlock Potential with HOLDLOCK**: While `HOLDLOCK` guarantees correctness, concurrent MERGE statements on multiple keys can acquire range locks in opposing order, triggering deadlocks. Sort incoming batch rows by primary key prior to executing MERGE.
- **Trigger Duplication**: MERGE statements evaluate row-level triggers once for the entire statement. If not written carefully, triggers can misinterpret inserted vs updated rows.
- **Recommendation**: In modern architectures, prefer native atomic UPSERT primitives (`INSERT ... ON CONFLICT` in Postgres / SQLite, `INSERT ... ON DUPLICATE KEY UPDATE` in MySQL) over generic ANSI MERGE.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Concurrency & Isolation"
    },
    {
        "id": "sql-iceberg-q-022",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Query Optimization & Execution",
        "difficulty": "HARD",
        "question": "What is Sargability, how do non-sargable functions destroy B-Tree index efficiency, and how do you rewrite non-sargable queries into index-seekable forms?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
**SARGable** stands for **Search Argument Able**. A query predicate is SARGable if the query optimizer can utilize it to navigate directly down a B-Tree index to perform an **Index Seek** (running in $O(\\log N)$ time).

A predicate becomes **non-sargable** whenever an indexed column is wrapped inside a function, calculation, or implicit type conversion:
`WHERE Function(indexed_column) = constant`

When a column is wrapped in a function, the database engine cannot predict the function's output without evaluating it for every single row in the table. The optimizer is forced to abandon the B-Tree index seek and fall back to a full **Index Scan** or **Table Scan** ($O(N)$ runtime), reading every 8KB data page and burning immense CPU.

### Phase 2: Low-Level Implementation & Execution Behavior
Common Non-Sargable Anti-Patterns and Their High-Performance Rewrites:

**1. Date Truncation / Date Extraction**:
```sql
-- NON-SARGABLE: Full Table Scan on 20 million rows
SELECT * FROM transactions WHERE YEAR(transaction_date) = 2026;

-- SARGABLE REWRITE: Direct B-Tree Index Seek
SELECT * FROM transactions 
WHERE transaction_date >= '2026-01-01' 
  AND transaction_date < '2027-01-01';
```

**2. String Manipulation & Case Insensitivity**:
```sql
-- NON-SARGABLE: Evaluates UPPER() on every row in the table
SELECT * FROM users WHERE UPPER(email) = 'ALICE@EXAMPLE.COM';

-- SARGABLE REWRITE: Use case-insensitive collation or functional index
-- In Postgres: CREATE INDEX idx_users_email_lower ON users (LOWER(email));
SELECT * FROM users WHERE LOWER(email) = 'alice@example.com';
```

**3. Math Operations on Columns**:
```sql
-- NON-SARGABLE: Math applied to column
SELECT * FROM products WHERE price * 1.20 > 100;

-- SARGABLE REWRITE: Isolate column on one side of inequality
SELECT * FROM products WHERE price > (100 / 1.20);
```

**4. Leading Wildcard Searches**:
```sql
-- NON-SARGABLE: B-Tree cannot seek on unknown prefixes
SELECT * FROM customers WHERE phone_number LIKE '%5551234';

-- SARGABLE REWRITE: Trigram index (pg_trgm) or reverse string index
SELECT * FROM customers WHERE phone_number_reversed LIKE '4321555%';
```

### Phase 3: Production Gotchas & Remediation
- **Implicit Data Type Conversions**: If `phone_number` is VARCHAR, querying `WHERE phone_number = 5551234` (an integer constant) forces the engine to apply an internal `CONVERT()` function to every row in the table, silently destroying sargability! Always match parameter types to column types.
- **ISNULL / COALESCE in Filters**: `WHERE ISNULL(end_date, '9999-12-31') >= @target_date` is non-sargable. Rewrite as:
  `WHERE (end_date >= @target_date OR end_date IS NULL)`
- **Execution Plan Indicator**: Always check execution plans for the distinction between `Index Seek` (sargable) and `Index Scan` (non-sargable).""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Query Optimization & Execution"
    },
    {
        "id": "sql-iceberg-q-023",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Storage Engine Internals",
        "difficulty": "HARD",
        "question": "Explain the physical storage mechanics of PostgreSQL TIMESTAMPTZ: why does it not store a timezone, and what are the architectural consequences?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
A widespread misconception among software engineers is that PostgreSQL's `TIMESTAMPTZ` (`timestamp with time zone`) stores the client's original timezone (e.g. 'America/New_York', 'UTC+05:30') alongside the date and time.

**The Reality**: `TIMESTAMPTZ` does NOT store any time zone offset or name on the physical data page.
Physically, both `TIMESTAMP` and `TIMESTAMPTZ` occupy exactly **8 bytes** on disk:
- They store an 8-byte signed integer representing **microseconds since the PostgreSQL epoch (`2000-01-01 00:00:00 UTC`)**.
- The only difference between `TIMESTAMP` and `TIMESTAMPTZ` is **input/output translation behavior** governed by the client session's `TimeZone` setting.

### Phase 2: Low-Level Implementation & Execution Behavior
The Transformation Pipeline of TIMESTAMPTZ:

1. **On Write (INSERT)**:
   ```sql
   SET TimeZone = 'America/New_York'; -- UTC-5
   INSERT INTO events (created_at) VALUES ('2026-10-10 14:00:00-04');
   ```
   The engine reads `14:00:00-04`, parses the `-04` offset, converts the time to UTC (`2026-10-10 18:00:00 UTC`), calculates microseconds from epoch, and writes the single 8-byte integer to disk. The `-04` timezone offset is discarded immediately.

2. **On Read (SELECT)**:
   ```sql
   -- Client Session 1: Tokyo (UTC+9)
   SET TimeZone = 'Asia/Tokyo';
   SELECT created_at FROM events;
   -- Outputs: 2026-10-11 03:00:00+09

   -- Client Session 2: London (UTC+0)
   SET TimeZone = 'Europe/London';
   SELECT created_at FROM events;
   -- Outputs: 2026-10-10 18:00:00+00
   ```
   Both clients query the exact same 8-byte integer. The engine inspects the reader's session `TimeZone` and converts the UTC value on-the-fly for display.

### Phase 3: Production Gotchas & Remediation
- **Loss of Legal/Geographic Context**: In regulatory audit logs, airline booking platforms, or medical applications, the legal local time of the event (e.g. 'Patient administered medicine at 2:00 PM local hospital time') must be preserved. Because `TIMESTAMPTZ` strips this context, you must store the IANA time zone identifier in a companion column:
  ```sql
  CREATE TABLE flight_departures (
      id BIGINT PRIMARY KEY,
      departure_time_utc TIMESTAMPTZ NOT NULL,
      departure_timezone VARCHAR(64) NOT NULL -- e.g. 'America/Los_Angeles'
  );
  ```
- **TIMESTAMP WITHOUT TIME ZONE Trap**: If an application stores UTC timestamps in `TIMESTAMP WITHOUT TIME ZONE`, the engine treats them as literal naive wall-clock times. When queried by a client in a different timezone, no conversion occurs, causing subtle multi-hour drift bugs.
- **Rule of Thumb**: Always store timestamps in `TIMESTAMPTZ` to guarantee consistent UTC normalization across global microservices.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Storage Engine Internals"
    },
    {
        "id": "sql-iceberg-q-024",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Storage Engine Internals",
        "difficulty": "HARD",
        "question": "What was the MySQL 3-byte 'utf8' encoding bug, how does it differ from 'utf8mb4', and what happens if an application inserts an emoji into a legacy utf8 column?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
The official Unicode standard defines UTF-8 as a variable-width encoding that uses between 1 and 4 bytes per character. 
- Basic Latin characters use 1 byte.
- Accented characters, Cyrillic, and Greek use 2 bytes.
- Standard CJK ideographs use 3 bytes.
- Supplementary Plane characters (including emojis 🚀, mathematical symbols, and historic glyphs) require **4 bytes**.

In early versions (prior to 2010), MySQL introduced a character set named `utf8` (now renamed `utf8mb3`). To optimize memory buffer allocations, MySQL developers implemented a truncated, non-standard version of UTF-8 that supported a maximum of **3 bytes per character**, completely omitting the 4-byte Supplementary Multilingual Plane.

### Phase 2: Low-Level Implementation & Execution Behavior
In 2010 (MySQL 5.5), MySQL introduced `utf8mb4` (UTF-8 4-byte) to provide full, genuine RFC 3629 UTF-8 compliance.

The Silent Truncation Trap in legacy `utf8`:
If an application configured with legacy `utf8` receives an input string containing a 4-byte character:
```sql
-- Client sends: 'Hello 😃 World'
INSERT INTO comments (text) VALUES ('Hello 😃 World');
```
Behavior depends on MySQL `sql_mode`:
1. **Without STRICT_ALL_TABLES (Legacy default)**: MySQL encountered the 4-byte emoji, could not encode it into 3 bytes, **silently truncated the string at that exact character**, and inserted `'Hello '` with a warning! All subsequent characters in the comment were permanently lost!
2. **With STRICT_ALL_TABLES**: MySQL throws a fatal runtime exception:
   `ERROR 1366 (HY000): Incorrect string value: '\xF0\x9F\x98\x83' for column 'text'`

### Phase 3: Production Gotchas & Remediation
- **Index Key Byte Limit Collapse**: In MySQL InnoDB with the Antelope file format, the maximum index key prefix length was 767 bytes:
  - Under 3-byte `utf8`: `767 / 3 = 255` characters. (Hence the ubiquitous `VARCHAR(255)` standard).
  - Under 4-byte `utf8mb4`: `767 / 4 = 191` characters!
  - Converting an existing table to `utf8mb4` caused schema migrations to fail with:
    `ERROR 1071 (42000): Specified key was too long; max key length is 767 bytes`
- **Remediation**: Enable the `Barracuda` file format with `innodb_large_prefix = ON` and `ROW_FORMAT = DYNAMIC`, which expands index key prefix limits to 3,072 bytes.
- **Modern Collation Standard**: When using `utf8mb4`, always specify `utf8mb4_0900_ai_ci` (Unicode 9.0 accent-insensitive, case-insensitive) in MySQL 8.0+ for superior multi-language sorting speed and correctness.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Storage Engine Internals"
    },
    {
        "id": "sql-iceberg-q-025",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Storage Engine Internals",
        "difficulty": "ARCHITECT",
        "question": "Explain the difference between a SQL NULL and a JSONB null primitive in PostgreSQL, and why 'null'::jsonb IS NULL evaluates to false.",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
In PostgreSQL JSONB, developers frequently encounter a bewildering behavior:
```sql
SELECT 'null'::jsonb IS NULL;
-- Result: FALSE!
```
Why does testing a null JSON value return false?

Because relational databases have two completely independent conceptual realms of null:
1. **The Relational SQL NULL**: A storage engine construct indicating that a table column has no value (missing or inapplicable data). It is stored in the 8KB page's row NULL-bitmap.
2. **The JSON null Primitive**: A valid, concrete scalar value defined by the JSON standard (RFC 8259: `null`, `true`, `false`, `number`, `string`, `array`, `object`). It is physically serialized as a 1-byte binary token (`0x00`) inside the JSONB payload.

### Phase 2: Low-Level Implementation & Execution Behavior
The query `'null'::jsonb IS NULL` asks the relational engine:
*Does this expression evaluate to an absent SQL column value?*

The answer is **NO**: The expression evaluates to a valid, existing 1-byte JSONB binary document whose content is the JSON primitive literal `null`. Because a valid value exists, `IS NULL` correctly returns `FALSE`.

How to properly test for JSON null primitives:
```sql
-- Method 1: Inspect the JSONB type explicitly
SELECT jsonb_typeof('null'::jsonb) = 'null'; -- TRUE

-- Method 2: Compare against a typed JSONB null constant
SELECT 'null'::jsonb = 'null'::jsonb; -- TRUE

-- Method 3: JSONB containment operators
SELECT '{"name": null}'::jsonb @> '{"name": null}'::jsonb; -- TRUE
```

In contrast, observe a genuine SQL NULL:
```sql
SELECT (NULL::jsonb) IS NULL; -- TRUE
SELECT jsonb_typeof(NULL::jsonb); -- Returns SQL NULL
```

### Phase 3: Production Gotchas & Remediation
- **COALESCE Traps in APIs**:
  `COALESCE(payload->'metadata', '{}'::jsonb)`
  If `payload->'metadata'` evaluates to `'null'::jsonb`, `COALESCE` will NOT replace it with `'{}'::jsonb` because `'null'::jsonb` is not a SQL NULL! The application receives a JSON null and crashes with an unexpected type error.
- **Indexing JSON Nulls**:
  GIN indexes index JSON keys and values. A GIN index on `payload` will index records with `'{"status": null}'::jsonb`, whereas records where the entire column is SQL NULL are omitted from standard GIN index postings.
- **Rule of Thumb**: Distinguish cleanly in application data contracts between 'the field was omitted from JSON' (undefined), 'the field was explicitly set to null in JSON' (JSON null), and 'the entire database row column is empty' (SQL NULL).""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Storage Engine Internals"
    },
    {
        "id": "sql-iceberg-q-026",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Storage Engine Internals",
        "difficulty": "ARCHITECT",
        "question": "How do DEFERRABLE INITIALLY DEFERRED constraints work under the hood, and how do they resolve circular foreign key dependencies during batch ingestion?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
By default, relational integrity constraints (Primary Keys, Foreign Keys, Unique constraints) are checked immediately at the end of every individual SQL statement:
`NOT DEFERRABLE` (default in SQL Server) or `DEFERRABLE INITIALLY IMMEDIATE` (default in Postgres/Oracle).

However, real-world data models often feature **Circular Foreign Key Dependencies**:
- A `Company` has a `ceo_id` referencing `Employees(id)`.
- An `Employee` has a `company_id` referencing `Companies(id)`.

Under immediate constraint checking, it is impossible to insert a new company and its CEO in a single transaction:
1. Inserting Company fails because the Employee CEO does not yet exist.
2. Inserting Employee fails because the Company does not yet exist.

### Phase 2: Low-Level Implementation & Execution Behavior
Declaring foreign keys as `DEFERRABLE INITIALLY DEFERRED` instructs the engine to postpone integrity verification until the transaction executes `COMMIT`:
```sql
CREATE TABLE companies (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    ceo_id INT
);

CREATE TABLE employees (
    id INT PRIMARY KEY,
    company_id INT REFERENCES companies(id) DEFERRABLE INITIALLY DEFERRED,
    name VARCHAR(100)
);

ALTER TABLE companies 
ADD CONSTRAINT fk_company_ceo 
FOREIGN KEY (ceo_id) REFERENCES employees(id) 
DEFERRABLE INITIALLY DEFERRED;
```
Now consider the transactional insertion:
```sql
BEGIN TRANSACTION;

-- Step 1: Insert Company with ceo_id = 1 (Employee 1 does NOT exist yet!)
INSERT INTO companies (id, name, ceo_id) VALUES (100, 'Acme Corp', 1);
-- SUCCESS! Constraint check is deferred.

-- Step 2: Insert Employee with company_id = 100
INSERT INTO employees (id, company_id, name) VALUES (1, 100, 'Alice');
-- SUCCESS!

-- Step 3: COMMIT triggers batch constraint verification
COMMIT;
-- The engine validates all deferred constraint queues simultaneously.
-- Both foreign keys are valid! Transaction commits!
```

### Phase 3: Production Gotchas & Remediation
- **Performance Overhead**: Deferred constraints maintain an in-memory queue of pending checks during the transaction. For massive batch ETL jobs modifying millions of rows, this deferred queue consumes significant server memory.
- **Delayed Error Reporting**: Constraint violations are not thrown when the offending `INSERT` executes—they are thrown on `COMMIT`. Application exception handlers must be designed to catch constraint failures during the commit call.
- **Unique Constraint Shuffling**: Deferred constraints are essential when reordering sequential unique numbers (e.g. `UPDATE ranks SET rank = rank + 1`). Without deferred unique constraints, updating row 1 conflicts with existing row 2, aborting the statement immediately.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Storage Engine Internals"
    },
    {
        "id": "sql-iceberg-q-027",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Query Optimization & Execution",
        "difficulty": "ARCHITECT",
        "question": "How does EXPLAIN approximate SELECT COUNT(*) in sub-millisecond time, and why does exact COUNT(*) require a full table scan in MVCC engines?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
In single-version databases without MVCC (or simple MyISAM tables), tables maintain an atomic row counter in the header. Calling `SELECT COUNT(*)` executes in $O(1)$ constant time by reading the header counter.

In modern MVCC databases (like PostgreSQL and MySQL InnoDB), **there is no global row counter**. Because multiple concurrent transactions see different snapshots of the database (some rows are committed, some are deleted, some are uncommitted), the engine cannot maintain a single global row count. To return an exact count, the engine must perform a full index or table scan to verify the visibility (`xmin`/`xmax`) of every single tuple for the caller's transaction snapshot. On a 100-million row table, this takes 10 to 60 seconds!

### Phase 2: Low-Level Implementation & Execution Behavior
In administrative portals, metrics dashboards, and API pagination headers, displaying an exact count of 100,000,000 vs 100,000,042 is unnecessary.

We can achieve sub-millisecond approximate row counts by querying the system catalog metadata that the cost-based optimizer uses:
```sql
-- Instantaneous O(1) row estimate (<1ms runtime)
SELECT reltuples::BIGINT AS estimated_count
FROM pg_class
WHERE relname = 'large_orders_table';
```
How PostgreSQL calculates `reltuples`:
1. During background `ANALYZE` or `autovacuum`, the engine reads a sample of 8KB data pages.
2. It calculates the average number of live rows per page and multiplies by the total allocated physical pages (`relpages`):
   $$\\text{reltuples} = \\left( \\frac{\\text{Sampled Live Tuples}}{\\text{Sampled Pages}} \\right) \\times \\text{relpages}$$
3. This estimate is written into `pg_class`, where it can be read in a single catalog lookup.

In SQL Server, identical instant telemetry is available via DMV partition row counters:
```sql
-- Instantaneous SQL Server row count (<1ms runtime)
SELECT SUM(rows) AS estimated_count
FROM sys.partitions
WHERE object_id = OBJECT_ID('large_orders_table') AND index_id IN (0, 1);
```

### Phase 3: Production Gotchas & Remediation
- **Staleness After Bulk Operations**: `reltuples` is updated only when `ANALYZE` or `VACUUM` runs. If 10 million rows were inserted 5 minutes ago and autovacuum has not triggered yet, `reltuples` will reflect the pre-insert count.
- **Empty Table Discrepancy**: If a table was freshly created and has never been analyzed, `reltuples` is `-1`. Always guard with:
  `COALESCE(NULLIF(reltuples::BIGINT, -1), 0)`
- **UI Architecture Pattern**: For web search results, display 'Over 1,000,000 results' using catalog approximations, and fetch exact counts only when the user paginates near the terminal page.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Query Optimization & Execution"
    },
    {
        "id": "sql-iceberg-q-028",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Relational Theory & 3VL",
        "difficulty": "ARCHITECT",
        "question": "What is the mathematical definition and role of TABLE_DEE and TABLE_DUM in Chris Date and Hugh Darwen's relational theory?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
In formal relational database theory (formulated by E.F. Codd and expanded by C.J. Date and Hugh Darwen in *The Third Manifesto*), a relation is a mathematical structure consisting of a heading (a set of attribute names and types) and a body (a set of tuples).

A fundamental question arises:
*Can a relation have zero attributes (degree 0)?*

The mathematical answer is **YES**. Just as 0 is the identity element for integer addition ($x + 0 = x$) and 1 is the identity element for multiplication ($x \\times 1 = x$), relational algebra contains two unique zero-degree identity relations:
1. **TABLE_DEE**: The relation with 0 attributes and **exactly 1 tuple** (the 0-tuple, empty tuple `{}`). It represents boolean **TRUE**.
2. **TABLE_DUM**: The relation with 0 attributes and **exactly 0 tuples** (the empty set $\\emptyset$). It represents boolean **FALSE**.

### Phase 2: Low-Level Implementation & Execution Behavior
The Algebraic Power of DEE and DUM:

**1. Natural Join Identity**:
In relational algebra, natural join $(\\bowtie)$ combines relations on matching attributes. Since DEE has 0 attributes, joining any relation $R$ with DEE produces zero attribute collisions, returning relation $R$ unchanged:
$$R \\bowtie \\text{TABLE\\_DEE} = R$$
Thus, TABLE_DEE is the **multiplicative identity element** for relational join (acting like the number 1 in scalar multiplication).

**2. Natural Join Nullifier**:
Joining any relation $R$ with TABLE_DUM (which contains 0 tuples) produces the empty relation:
$$R \\bowtie \\text{TABLE\\_DUM} = \\text{TABLE\\_DUM}$$
Thus, TABLE_DUM is the **nullifying element** for relational join (acting like 0 in scalar multiplication: $x \\times 0 = 0$).

**3. Projection to Degree Zero**:
If you execute a relational projection on relation $R$ dropping all attributes:
$$\\pi_{\\emptyset}(R)$$
- If $R$ contains at least 1 row, projecting 0 attributes collapses all rows into a single unique 0-tuple: **TABLE_DEE (TRUE)**.
- If $R$ contains 0 rows, projecting 0 attributes yields 0 tuples: **TABLE_DUM (FALSE)**.
This is the formal proof that SQL `EXISTS (SELECT * FROM R)` evaluates to boolean TRUE/FALSE via relational projection to degree zero!

### Phase 3: Production Gotchas & Remediation
- **Theoretical Elegance vs SQL Reality**: SQL dialects do not natively permit creating a table with 0 columns (`CREATE TABLE dee ()` is forbidden by SQL syntax). However, query optimizers model degree-zero relations internally during constant folding and constraint refutation.
- **Relational Proofs**: Understanding DEE and DUM proves that boolean propositional logic and relational calculus are isomorphic, enabling modern query optimizers to transform boolean `WHERE` predicates into relational join trees.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Relational Theory & 3VL"
    },
    {
        "id": "sql-iceberg-q-029",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Storage Engine Internals",
        "difficulty": "HARD",
        "question": "Why are SERIAL / IDENTITY sequence generators non-transactional, and what causes permanent gaps in auto-increment primary keys?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
A frequent complaint from junior engineers and auditors is:
*Why are there gaps in my invoice numbers? We have Invoice #101 and #103, but #102 is missing! Did data get deleted?*

The missing numbers are caused by the deliberate, non-transactional design of database sequence generators (`SERIAL`, `BIGSERIAL`, `IDENTITY`, `SEQUENCE`).

If sequence generators were transactional (meaning they rolled back their counter whenever an enclosing transaction aborted), then **every transaction requesting a sequence number would have to hold an exclusive lock on the sequence table until commit time**. Under 1,000 concurrent transactions, the database would become completely serialized, collapsing write throughput to single-threaded speeds.

### Phase 2: Low-Level Implementation & Execution Behavior
To maximize concurrency, sequence generators operate entirely outside transaction rollback boundaries:
1. When a transaction requests `nextval('invoice_seq')`, the engine executes an atomic fetch-and-add instruction in shared memory (or logs a sequence allocation record to WAL).
2. It increments the counter immediately and releases any internal spinlock in microseconds.
3. The number (e.g. 102) is handed to the client transaction.

What causes permanent gaps:
1. **Transaction Aborts / Rollbacks**: If the transaction inserting Invoice #102 encounters an error (e.g. invalid credit card) and executes `ROLLBACK`, the sequence counter **does NOT roll back**. Number 102 is permanently burned.
2. **Server Crashes & Sequence Caching**: To minimize disk I/O, database engines pre-allocate caches of sequence numbers in RAM (e.g. `CACHE 20` or SQL Server `IDENTITY_CACHE`). If the server experiences a power outage or restart, the unused numbers remaining in the RAM cache are lost forever, creating a jump of 20 to 1,000 numbers on restart.

### Phase 3: Production Gotchas & Remediation
- **Legal / Accounting Gapless Requirements**: If tax regulations mandate strictly gapless invoice numbering, you CANNOT use auto-increment sequences. You must implement a dedicated serial numbering table and serialize writes using explicit locking:
  ```sql
  SELECT current_number FROM invoice_counters WHERE year = 2026 FOR UPDATE;
  UPDATE invoice_counters SET current_number = current_number + 1 WHERE year = 2026;
  ```
  *Warning*: This introduces an unavoidable single-threaded serialization bottleneck.
- **Disabling Cache in SQL Server**: To prevent 1,000-number jumps on SQL Server restart, disable identity caching:
  `ALTER DATABASE SCOPED CONFIGURATION SET IDENTITY_CACHE = OFF;`""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Storage Engine Internals"
    },
    {
        "id": "sql-iceberg-q-030",
        "source": "SQL Engine Architecture",
        "category": "SQL SERVER",
        "niche": "Relational Theory & 3VL",
        "difficulty": "ARCHITECT",
        "question": "How does relational algebra prove that every SQL operator (Selection, Projection, Cartesian Product, Union, Intersection) is fundamentally a Join?",
        "answer": """### Phase 1: Conceptual Foundation & Mechanics
In database theory, relational algebra is often taught as a collection of separate operators: Selection $(\\sigma)$, Projection $(\\pi)$, Cartesian Product $(\\times)$, Union $(\\cup)$, and Difference $(-)$.

However, relational mathematicians (including C.J. Date) demonstrated that **Natural Join $(\\bowtie)$ is the universal primitive operator**. All other relational operations can be mathematically reduced to special cases of natural joins against specific relations.

This theoretical insight directly underpins modern query engine architecture: by reducing diverse SQL operations to join graphs, query optimizers can apply unified graph-theoretic optimization, cardinality estimation, and execution algorithms across all relational operators.

### Phase 2: Low-Level Implementation & Execution Behavior
The Mathematical Reductions to Natural Join:

**1. Cartesian Product is a Disjoint Natural Join**:
When two relations $R(A, B)$ and $S(C, D)$ share no common attribute names:
$$R \\times S \\equiv R \\bowtie S$$
A Cartesian product is simply a natural join over an empty intersection of attribute names.

**2. Set Intersection is an Identical-Schema Natural Join**:
When relations $R$ and $S$ have identical attribute headings:
$$R \\cap S \\equiv R \\bowtie S$$
Because all attributes match, natural join retains only tuples that exist in both relations, exactly matching set intersection.

**3. Selection is a Join with a Unary Relation**:
A filter condition `WHERE status = 'ACTIVE'` on relation $R$ can be modeled as a natural join with a unary relation $C_{\\text{active}}$ containing a single attribute `status` with the single tuple `{'ACTIVE'}`:
$$\\sigma_{\\text{status} = 'ACTIVE'}(R) \\equiv R \\bowtie C_{\\text{active}}$$

**4. Projection is a Join with TABLE_DEE followed by Existential Quantification**:
Projecting away attributes is equivalent to joining with TABLE_DEE and collapsing non-projected attributes via existential quantification over the domain.

### Phase 3: Production Gotchas & Remediation
- **Engine Optimization Consequences**: Because all relational operators reduce to joins, query optimizer engines (such as Calcite, CockroachDB, and Catalyst) model entire SQL queries as unified relational operator DAGs.
- **Filter Pushdown as Join Reordering**: Pushing a `WHERE` predicate down through a join tree is algebraically equivalent to reordering an associative chain of three joins:
  $$(R \\bowtie S) \\bowtie C_{\\text{filter}} \\equiv (R \\bowtie C_{\\text{filter}}) \\bowtie S$$
- **Hardware Acceleration**: Because all operations reduce to join mechanics (hashing, sorting, and intersecting), database hardware accelerators (like FPGA offload engines and GPU query engines) only need to optimize one fundamental physical algorithm: high-throughput hash-table joins and parallel sorted intersections.""",
        "domain": "Databases, SQL & Storage",
        "subdomain": "Relational Theory & 3VL"
    }
]

print(f"Prepared {len(iceberg_questions_2)} additional iceberg Q&As.")

new_ids_2 = {q['id'] for q in iceberg_questions_2}
assert len(new_ids_2) == len(iceberg_questions_2), "Duplicate IDs within iceberg_questions_2!"

for q in iceberg_questions_2:
    assert q['id'] not in existing_ids, f"Duplicate ID in questions.json: {q['id']}"

data.extend(iceberg_questions_2)
print(f"After append: {len(data)} (+{len(iceberg_questions_2)})")

with open(FILE, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Successfully written to", FILE)
