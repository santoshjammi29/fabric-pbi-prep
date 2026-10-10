"""
Bulk generation of SQL Iceberg concepts for data_concepts.json
Covers all 8 tiers of the SQL Iceberg meme with rigorous database engine depth.
"""
import json
import os

FILE = 'src/data/json/data_concepts.json'

with open(FILE, 'r') as f:
    data = json.load(f)

print(f"Existing concepts: {len(data)}")
existing_ids = {c['id'] for c in data}
existing_terms = {c['term'].lower().strip() for c in data}

iceberg_concepts = [
    # ─── TIER 1: THE SURFACE / SKY ───
    {
        "id": "sql-iceberg-orms",
        "term": "Object-Relational Mapping (ORM) & Impedance Mismatch",
        "category": "SQL SERVER",
        "difficulty": "EASY",
        "definition": "An abstraction layer that maps relational database tables and foreign keys to object-oriented domain classes and in-memory object graphs.",
        "explanation": "While ORMs accelerate early application prototyping by abstracting raw SQL, they suffer from the fundamental 'object-relational impedance mismatch'—treating set-based relational tuples as stateful entity objects. This design mismatch frequently leads to hidden N+1 query cascades, eager loading memory bloat, and sub-optimal Cartesian product joins. High-throughput distributed platforms often mandate raw SQL, Dapper, or query builders for critical read-write paths.",
        "keyPoints": [
            "Bridges the gap between relational tuples and OOP class hierarchies.",
            "Abstracts dialect differences at the expense of query control and visibility.",
            "Introduces performance traps like the N+1 problem and massive memory hydration overhead."
        ]
    },
    {
        "id": "sql-iceberg-data-types",
        "term": "Relational Data Types & Page Byte Alignment",
        "category": "SQL SERVER",
        "difficulty": "EASY",
        "definition": "The logical specifications (e.g. INT, VARCHAR, DECIMAL) and underlying physical byte packing schemes used to store column values on 8KB database data pages.",
        "explanation": "Choosing proper data types determines physical storage density, memory buffer cache utilization, and query I/O throughput. Fixed-width types (like BIGINT or CHAR) occupy contiguous byte offsets in the row payload, whereas variable-width types (like VARCHAR) require row header offset arrays. Furthermore, CPU word alignment rules can introduce silent padding bytes between columns, increasing table footprint and slowing down sequential scans.",
        "keyPoints": [
            "Fixed-length data types enable O(1) column offset lookups inside the physical row header.",
            "Variable-length columns require an offset table in the row footer, increasing per-row storage overhead.",
            "Column ordering affects CPU word alignment padding, directly altering data page row density."
        ]
    },
    {
        "id": "sql-iceberg-group-by",
        "term": "GROUP BY: Stream Aggregate vs Hash Aggregate",
        "category": "SQL SERVER",
        "difficulty": "EASY",
        "definition": "A relational aggregation operator that collapses rows sharing identical key values into single summary rows via physical Stream or Hash algorithms.",
        "explanation": "Relational query engines implement `GROUP BY` using two primary physical algorithms: Stream Aggregate and Hash Aggregate. Stream Aggregate requires pre-sorted input (from a B-Tree index seek or prior sort operator) and streams rows with minimal memory overhead O(1). In contrast, Hash Aggregate builds an in-memory hash table of distinct grouping keys; if the hash table exceeds allocated memory grants (e.g., work_mem or SQL Server query workspace), it spills intermediate partitions to tempdb, severely degrading I/O performance.",
        "keyPoints": [
            "Stream Aggregate requires pre-sorted input and executes with negligible memory overhead.",
            "Hash Aggregate constructs an in-memory hash table, ideal for unsorted, high-cardinality data.",
            "Insufficient query memory grants trigger hash table spilling to disk (tempdb / scratch space)."
        ]
    },
    {
        "id": "sql-iceberg-order-by",
        "term": "ORDER BY: Quicksort vs External Merge Sort",
        "category": "SQL SERVER",
        "difficulty": "EASY",
        "definition": "The physical sorting operator applied to an intermediate rowset to guarantee deterministic ordering across returned records.",
        "explanation": "Because relations are unordered mathematical sets by definition, ordering requires explicit computation unless satisfied directly by an index walk. When sorted rows fit into the allocated query memory grant, the engine uses an in-memory Quicksort or Timsort. If the intermediate row volume exceeds the memory budget, the engine falls back to an External Polyphase Merge Sort, writing sorted runs of pages to temporary disk storage and merging them in multiple passes.",
        "keyPoints": [
            "Relational engines guarantee ordering only when ORDER BY is explicitly specified.",
            "In-memory sorts execute via Quicksort/Timsort within allocated execution memory grants.",
            "Oversized rowsets trigger multi-pass External Merge Sorts spilling intermediate runs to disk."
        ]
    },
    {
        "id": "sql-iceberg-create-table",
        "term": "CREATE TABLE: Schema Metadata & Page Slot Layout",
        "category": "SQL SERVER",
        "difficulty": "EASY",
        "definition": "The foundational DDL command that provisions table metadata in system catalogs and allocates initial extent/page structures on disk.",
        "explanation": "Executing `CREATE TABLE` updates core catalog tables (such as sys.tables, pg_class, and sys.columns) with column metadata, constraints, and default values. Physically, modern relational engines allocate 8KB data pages comprising a 96-byte page header, raw row byte slots growing forward from the top, and a two-byte slot array growing backward from the bottom. This slot array enables logical row addressing via Tuple Identifiers (TIDs / RIDs).",
        "keyPoints": [
            "Persists table, column, and constraint definitions into relational system catalog dictionaries.",
            "Initializes physical storage allocations as heaps or clustered index B-Tree roots.",
            "Standardizes 8KB page architectures with slot arrays pointing to byte offsets inside the page."
        ]
    },
    {
        "id": "sql-iceberg-foreign-keys",
        "term": "Foreign Keys: Referential Actions & Lock Cascades",
        "category": "SQL SERVER",
        "difficulty": "EASY",
        "definition": "Relational integrity constraints that enforce cross-table referential relationships and define automated cascade behaviors on mutations.",
        "explanation": "Foreign keys guarantee referential integrity by validating that child table foreign key values exist as parent table candidate keys. When child columns lack supporting indexes, deleting or updating parent records forces the engine to perform full table scans on the child table, frequently escalating row locks to exclusive table-level locks. Moreover, cascade rules (CASCADE, SET NULL) trigger hidden transactional write cascades that amplify deadlock frequencies under concurrent workloads.",
        "keyPoints": [
            "Validates that foreign key values match an active primary or unique key in the parent relation.",
            "Unindexed foreign keys trigger catastrophic full-table scans and lock escalation during parent deletes.",
            "Cascading deletes execute recursively inside the parent transaction, amplifying lock durations."
        ]
    },
    {
        "id": "sql-iceberg-crud-wal",
        "term": "CRUD Lifecycle & Write-Ahead Logging (WAL)",
        "category": "SQL SERVER",
        "difficulty": "EASY",
        "definition": "The end-to-end execution lifecycle of DML statements governed by ACID write-ahead logging protocols and buffer pool caching.",
        "explanation": "When an INSERT, UPDATE, or DELETE query executes, changes are not written immediately to data files on disk. Instead, the engine writes synchronous log records describing the modification to the Write-Ahead Log (WAL / transaction log) on sequential disk. Once the log record is flushed to persistent media (fsync), the corresponding in-memory 8KB data page in the buffer pool is marked as 'dirty'. Dirty pages are subsequently flushed to disk asynchronously by background checkpoint processes.",
        "keyPoints": [
            "WAL protocol mandates that log records must flush to disk before dirty data pages are written.",
            "Buffer pool caching decouples immediate client transaction latency from random disk page I/O.",
            "Background checkpoint and lazy-writer processes periodically flush dirty pages to data files."
        ]
    },
    {
        "id": "sql-iceberg-btree-indexes",
        "term": "B-Tree Indexes & Leaf Node Traversal",
        "category": "SQL SERVER",
        "difficulty": "EASY",
        "definition": "Balanced multi-way search tree structures that maintain sorted key orders to facilitate logarithmic O(log N) point seeks and range scans.",
        "explanation": "B+ Trees are the universal indexing primitive of relational databases. Intermediate root and branch nodes store key boundaries and child page pointers, while leaf nodes contain all index keys alongside row pointers (RIDs in heaps, or primary clustering keys). Leaf pages are doubly linked in logical sorted sequence, allowing the engine to locate a starting key via logarithmic tree descent and then perform sequential leaf scans for range queries without re-traversing the tree.",
        "keyPoints": [
            "Provides O(log N) search complexity by maintaining uniform tree depth from root to leaf.",
            "Leaf nodes form a doubly linked list enabling efficient range scanning without branch re-navigation.",
            "Node splits occur when page fill thresholds are breached, causing page fragmentation."
        ]
    },
    {
        "id": "sql-iceberg-joins",
        "term": "Relational JOIN Algorithms: Nested Loops, Hash & Merge",
        "category": "SQL SERVER",
        "difficulty": "EASY",
        "definition": "The three fundamental physical algorithms employed by query engines to combine tuples from two distinct relational inputs.",
        "explanation": "Query optimizers choose among three primary physical join strategies. Nested Loops Joins iterate through an outer rowset and execute an indexed probe on the inner relation for each tuple—optimal for small, indexed inputs. Hash Joins build an in-memory hash table on the smaller build input and stream the larger probe input through it—ideal for large, unsorted sets. Merge Joins read two pre-sorted inputs simultaneously in parallel lockstep—offering exceptional throughput when inputs are already ordered by index.",
        "keyPoints": [
            "Nested Loops is optimal for small outer datasets with indexed inner lookups (O(M * log N)).",
            "Hash Join handles massive unsorted datasets by creating an in-memory hash table on the build input.",
            "Merge Join requires pre-sorted inputs and executes in linear O(M + N) time with low memory."
        ]
    },
    {
        "id": "sql-iceberg-limit-offset",
        "term": "LIMIT & OFFSET Scanning Penalty",
        "category": "SQL SERVER",
        "difficulty": "EASY",
        "definition": "A common pagination pattern that suffers from linear performance degradation due to mandatory scanning and discarding of preceding offset rows.",
        "explanation": "When an application issues `LIMIT 20 OFFSET 500000`, the query engine cannot magically jump to row 500,001. It must physically scan, evaluate, and discard 500,000 candidate rows before returning the requested 20 records. Under deep pagination, this results in massive disk read I/O, CPU consumption, and buffer pool churn. Keyset pagination (seek method) eliminates this penalty by filtering on indexed monotonic cursor keys.",
        "keyPoints": [
            "OFFSET N forces the engine to read and discard N tuples, exhibiting linear O(N) performance degradation.",
            "Consumes significant buffer pool memory and disk I/O when paginating into deep historical records.",
            "Keyset (cursor) pagination replaces OFFSET with indexed inequality predicates to achieve O(log N) seeks."
        ]
    },
    {
        "id": "sql-iceberg-null-3vl",
        "term": "NULL & Three-Valued Logic (3VL)",
        "category": "SQL SERVER",
        "difficulty": "EASY",
        "definition": "The foundational relational logic system where boolean expressions evaluate to TRUE, FALSE, or UNKNOWN (NULL).",
        "explanation": "In SQL, NULL represents missing or inapplicable information rather than zero or an empty string. Equality comparisons involving NULL (e.g. `col = NULL`) evaluate to UNKNOWN rather than TRUE or FALSE. In `WHERE` clauses, records are returned only if the filter condition evaluates strictly to TRUE; conditions evaluating to UNKNOWN are discarded, making queries like `WHERE status != 'ACTIVE'` silently omit rows where status IS NULL.",
        "keyPoints": [
            "SQL relies on Kleene 3-Valued Logic: all boolean operators handle TRUE, FALSE, and UNKNOWN.",
            "Direct comparison (`col = NULL`) yields UNKNOWN; explicit predicates (`IS NULL`) are required.",
            "WHERE clauses discard UNKNOWN results, causing subtle data omission bugs in negative filters."
        ]
    },

    # ─── TIER 2: WATERLINE / JUST ABOVE SURFACE ───
    {
        "id": "sql-iceberg-inverted-indexes",
        "term": "Inverted Indexes (GIN & Full-Text Search)",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "MEDIUM",
        "definition": "An indexing structure that maps discrete elements (such as tokens, tags, or JSON keys) to sorted posting lists of containing document/row IDs.",
        "explanation": "Standard B-Trees map complete row keys to row pointers, making them ineffective for multi-valued data like text documents, arrays, or JSONB documents. Inverted indexes (such as PostgreSQL GIN or Elasticsearch inverted indices) dissect composite attributes into individual lexemes and build a dictionary where each entry points to a posting list of tuple IDs. This allows sub-millisecond containment queries (`@>`, `@@`) across millions of semi-structured records.",
        "keyPoints": [
            "Maps individual tokenized lexemes to posting lists containing matching Tuple IDs (TIDs).",
            "Powers array containment, full-text search (tsvector), and JSONB document filtering.",
            "Features higher write amplification and maintenance overhead than standard B-Trees on DML updates."
        ]
    },
    {
        "id": "sql-iceberg-query-plans-explain",
        "term": "Query Plans & EXPLAIN ANALYZE Mechanics",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "MEDIUM",
        "definition": "The tree of relational operators generated by the cost-based optimizer detailing physical access paths, join algorithms, and actual execution metrics.",
        "explanation": "A query plan represents the physical algorithm selected by the engine to fulfill a declarative SQL query. Running `EXPLAIN` outputs estimated cardinalities, cost units, and operator trees generated during compilation. Running `EXPLAIN ANALYZE` actually executes the query, instrumenting every tree node with precise execution runtimes, actual row counts, loop iterations, buffer cache hits/misses, and memory spill statistics to expose cardinality estimation errors.",
        "keyPoints": [
            "Transforms declarative relational calculus into an imperative tree of physical iterator operators.",
            "EXPLAIN displays compile-time cost estimates; EXPLAIN ANALYZE records actual runtime telemetry.",
            "Discrepancies between estimated and actual row counts expose stale statistics or bad optimizer assumptions."
        ]
    },
    {
        "id": "sql-iceberg-acid",
        "term": "ACID Properties & Physical Engine Enforcements",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "MEDIUM",
        "definition": "The four foundational guarantees—Atomicity, Consistency, Isolation, and Durability—enforced via low-level engine subsystems.",
        "explanation": "Relational engines enforce ACID through distinct physical mechanisms. Atomicity and Durability are guaranteed by the Write-Ahead Log (WAL / ARIES recovery protocol) and fsync disk flushes. Consistency is maintained by relational constraints (primary keys, check constraints, foreign keys) and schema locks. Isolation is enforced through lock managers (2-Phase Locking) or multi-version concurrency control (MVCC) snapshot isolation.",
        "keyPoints": [
            "Atomicity: Implemented via undo logging and WAL rollback pointers during aborts or crashes.",
            "Consistency: Enforces programmatic domain integrity, schema validation, and constraint invariants.",
            "Isolation: Mitigates concurrency anomalies through pessimistic lock trees or MVCC tuple versioning.",
            "Durability: Guarantees committed transactions survive power failure via synchronous WAL fsync flushes."
        ]
    },
    {
        "id": "sql-iceberg-computed-columns",
        "term": "Computed Columns: Virtual vs Persisted",
        "category": "SQL SERVER",
        "difficulty": "MEDIUM",
        "definition": "Columns defined via deterministic expressions whose values are either calculated on-the-fly during query evaluation or physically written to disk.",
        "explanation": "Virtual computed columns consume zero physical storage; the engine dynamically inlines the expression into the query execution tree whenever referenced. Persisted computed columns compute the expression during INSERT/UPDATE operations and write the resulting bytes directly onto the 8KB data page. Persisted computed columns can be indexed and eliminate repeated CPU evaluation overhead across high-frequency aggregation queries.",
        "keyPoints": [
            "Virtual computed columns compute values dynamically at query runtime with zero storage footprint.",
            "Persisted computed columns write materialized bytes to physical pages during write mutations.",
            "Deterministic computed columns can be indexed to allow B-Tree seeks on complex expressions."
        ]
    },
    {
        "id": "sql-iceberg-keyset-pagination",
        "term": "Keyset Pagination (Seek Method)",
        "category": "SQL SERVER",
        "difficulty": "MEDIUM",
        "definition": "An optimal pagination strategy that uses the values of the last retrieved row within an inequality filter to seek directly to the next page via indexes.",
        "explanation": "Rather than skipping rows via `OFFSET`, keyset pagination leverages ordered composite index keys: `WHERE (created_at, id) < (@last_date, @last_id) ORDER BY created_at DESC, id DESC LIMIT 20`. This allows the storage engine to execute a direct B-Tree index seek to the exact boundary and read the subsequent 20 leaf tuples in O(log N) time, entirely immune to the page drift and linear scanning penalties of OFFSET.",
        "keyPoints": [
            "Replaces OFFSET N with index seeks based on the previous page's tie-breaker key attributes.",
            "Maintains constant O(log N + K) execution latency regardless of whether querying page 1 or page 10,000.",
            "Prevents missed or duplicated records caused by concurrent row inserts during user pagination."
        ]
    },
    {
        "id": "sql-iceberg-transactions-2pc",
        "term": "Database Transactions & Two-Phase Commit (2PC)",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "MEDIUM",
        "definition": "A consensus protocol ensuring atomic commit or rollback across multiple distributed database instances or heterogeneous resources.",
        "explanation": "While local transactions achieve atomicity through local WAL logs, distributed transactions across shards or nodes require the Two-Phase Commit (2PC) protocol. In Phase 1 (Prepare), a coordinator queries all participating nodes to verify they have written their changes to WAL and can guarantee commitment. In Phase 2 (Commit), if all nodes vote affirmative, the coordinator instructs all nodes to commit. If any node fails or votes abort, all participants roll back.",
        "keyPoints": [
            "Coordinates atomic state transitions across physically separated database nodes or shards.",
            "Phase 1 (Prepare): Nodes lock resources and write prepared intent records to durable WAL.",
            "Phase 2 (Commit): Nodes finalize changes upon receiving the coordinator's unanimous commit signal.",
            "Vulnerable to coordinator failure during Phase 2, which can leave participant locks blocked indefinitely."
        ]
    },
    {
        "id": "sql-iceberg-order-by-aggregates",
        "term": "ORDER BY in Aggregates: Deterministic String & Array Folding",
        "category": "SQL SERVER",
        "difficulty": "MEDIUM",
        "definition": "SQL syntax that enforces explicit internal sorting of values prior to reduction by array, JSON, or string accumulation functions.",
        "explanation": "Aggregate functions such as `STRING_AGG` (T-SQL/Postgres) or `ARRAY_AGG` collapse multiple row values into a single compound structure. Because relational rows have no natural physical ordering, omitting an explicit `WITHIN GROUP (ORDER BY col)` or internal `ORDER BY col` yields non-deterministic results that vary depending on parallel worker thread scheduling or index scan directions.",
        "keyPoints": [
            "Ensures deterministic concatenation order for functions like STRING_AGG, ARRAY_AGG, and JSON_ARRAYAGG.",
            "Requires the engine to insert an internal sort operator prior to scalar accumulator evaluation.",
            "Prevents test flakiness and downstream data hash mismatches in CDC or replication pipelines."
        ]
    },
    {
        "id": "sql-iceberg-normal-forms",
        "term": "Relational Normal Forms (1NF through 5NF & BCNF)",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "MEDIUM",
        "definition": "A mathematical progression of design rules based on functional dependencies designed to eliminate data redundancy and update anomalies.",
        "explanation": "Normalization decomposes wide relations into narrower, functionally clean entities. 1NF guarantees atomic scalar attributes; 2NF eliminates partial key dependencies; 3NF eliminates transitive dependencies; Boyce-Codd (BCNF) eliminates all anomalies where a determinant is not a candidate key; 4NF eliminates multi-valued dependencies; and 5NF eliminates join projection anomalies. In modern transactional OLTP architectures, 3NF/BCNF prevents corruption, while analytical OLAP systems denormalize to star schemas to avoid join overhead.",
        "keyPoints": [
            "1NF to 3NF eliminates repeating groups, partial key dependencies, and transitive non-key relationships.",
            "BCNF addresses subtle multi-candidate key edge cases where non-trivial determinants are not superkeys.",
            "Balances write-time integrity (zero update anomalies) against read-time join query complexity."
        ]
    },
    {
        "id": "sql-iceberg-window-framing",
        "term": "Window Frame Specifications: ROWS vs RANGE",
        "category": "SQL SERVER",
        "difficulty": "MEDIUM",
        "definition": "The explicit sliding boundary configuration (e.g. ROWS vs RANGE) that dictates which partition rows are included in a window function's accumulator.",
        "explanation": "When an `ORDER BY` is included in an `OVER()` clause without an explicit frame, SQL standard engines default to `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. Under RANGE, the engine must evaluate duplicate key ties and build temporary spool tables, frequently creating severe memory and CPU bottlenecks. Explicitly declaring `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` instructs the engine to process rows by physical offset, streaming values in a single high-speed pass.",
        "keyPoints": [
            "RANGE considers value ties and defaults to creating expensive disk/memory spooling structures.",
            "ROWS evaluates physical row offsets without checking for duplicate tie values, optimizing CPU throughput.",
            "Omitting the frame specification can cause 10x-100x query slowdowns due to invisible RANGE spooling."
        ]
    },
    {
        "id": "sql-iceberg-outer-joins",
        "term": "Outer Joins & Where Predicate Null-Suppression",
        "category": "SQL SERVER",
        "difficulty": "MEDIUM",
        "definition": "Relational joins that preserve unmatched tuples from one or both relations by padding missing attributes with NULLs, and the pitfalls of downstream filtering.",
        "explanation": "LEFT, RIGHT, and FULL OUTER JOINs preserve rows from the designated table even when no join partner satisfies the `ON` condition. A pervasive engineering trap occurs when developers place filtering conditions on the preserved table's nullable columns in the `WHERE` clause (e.g. `WHERE right_table.status = 'ACTIVE'`). Because NULL equals comparison evaluates to UNKNOWN, all unmatched preserved rows are filtered out, silently converting the query into an INNER JOIN.",
        "keyPoints": [
            "Preserves unmatched records by synthesizing NULL attributes for non-matching relational sides.",
            "Placing filters on outer-joined tables in the WHERE clause silently demotes the query to an INNER JOIN.",
            "Filtering predicates on outer tables must be placed inside the join ON clause to preserve non-matches."
        ]
    },
    {
        "id": "sql-iceberg-ctes",
        "term": "Common Table Expressions: Optimization Fences vs Inlining",
        "category": "SQL SERVER",
        "difficulty": "MEDIUM",
        "definition": "Named temporary result sets defined via WITH clauses that act as logical subqueries, subject to engine-specific inlining or materialization fences.",
        "explanation": "CTEs improve SQL modularity and readability. However, database engines handle them fundamentally differently: SQL Server always treats non-recursive CTEs as inline syntactic views, re-evaluating the CTE expression every time it is referenced. PostgreSQL historically treated CTEs as rigid 'optimization fences' (materializing the CTE into memory/disk and preventing predicate pushdown). Modern PostgreSQL (v12+) supports `MATERIALIZED` and `NOT MATERIALIZED` hints to explicitly control inlining.",
        "keyPoints": [
            "Acts as logical syntactic abstractions to structure complex multi-stage relational logic.",
            "Optimization fences prevent the query optimizer from pushing predicates into the inner CTE query.",
            "Referencing a CTE multiple times in SQL Server re-executes the underlying query multiple times."
        ]
    },
    {
        "id": "sql-iceberg-stored-columns",
        "term": "Covering Indexes & Stored Columns (INCLUDE)",
        "category": "SQL SERVER",
        "difficulty": "MEDIUM",
        "definition": "Non-key column payloads appended directly to the leaf nodes of a B-Tree index to satisfy queries without visiting the primary data table.",
        "explanation": "When an index contains only the columns specified in `WHERE` clauses, the engine must perform expensive Key Lookups (or Bookmark Lookups) against the base clustered index/heap to fetch remaining SELECT columns. By defining an index with `INCLUDE (col1, col2)`, these extra columns are appended exclusively to the B-Tree leaf pages without participating in the root/branch search key sorting. This produces a 'Covering Index', allowing queries to be answered purely from the index.",
        "keyPoints": [
            "Appends payload data to B-Tree leaf nodes without expanding branch node key search sizes.",
            "Eliminates expensive Key Lookups and Bookmark Lookups by creating fully covering access paths.",
            "Reduces B-Tree index depth and page split overhead compared to adding columns to the index key itself."
        ]
    },

    # ─── TIER 3: SHALLOW SUBMERGED ───
    {
        "id": "sql-iceberg-connection-pools",
        "term": "Connection Pools & Thread/Process Multiplexing",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "MEDIUM",
        "definition": "A persistent cache of open database connections that multiplexes high-volume client application requests over a fixed pool of server backends.",
        "explanation": "Establishing a raw database connection is an expensive physical operation involving TCP 3-way handshakes, TLS negotiation, authentication verification, and backend process/thread allocation (consuming 5MB–10MB of RAM per connection in PostgreSQL). Connection poolers (such as PgBouncer or HikariCP) maintain warm, persistent server connections. In transaction-pooling mode, a single physical server connection is checked out only for the duration of a transaction, enabling 1,000 application clients to share 50 backend database connections.",
        "keyPoints": [
            "Amortizes expensive socket handshakes, TLS cryptography, and process memory initialization.",
            "Protects the database engine from connection starvation and OS context switching degradation.",
            "Transaction-level pooling prevents client sessions from hogging idle database backend threads."
        ]
    },
    {
        "id": "sql-iceberg-the-dual-table",
        "term": "The DUAL Table & Relational Projection Semantics",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "MEDIUM",
        "definition": "A special single-row dummy table used in SQL engines (historically Oracle and MySQL) to evaluate scalar expressions within relational SELECT syntax.",
        "explanation": "Because relational algebra mandates that all `SELECT` projections operate over a relation, early relational systems required a physical table with exactly one row and one column (DUMMY VARCHAR2(1) with value 'X') to evaluate expressions like `SELECT SYSDATE FROM DUAL`. Modern SQL engines treat DUAL as a virtual optimizer construct or allow dialect-native parameterless `SELECT 1 + 1` without referencing physical tables.",
        "keyPoints": [
            "Fulfills relational algebra requirements that all projection operations must operate on a relation.",
            "Contains exactly one tuple to guarantee that scalar expressions return exactly one result row.",
            "Modern query optimizers intercept queries referencing DUAL and bypass physical page reads entirely."
        ]
    },
    {
        "id": "sql-iceberg-lateral-joins",
        "term": "LATERAL Joins & CROSS APPLY",
        "category": "SQL SERVER",
        "difficulty": "MEDIUM",
        "definition": "A correlated join mechanism that allows an inline subquery or table-valued function to reference column values provided by preceding outer rows.",
        "explanation": "Standard SQL joins evaluate both inputs independently before applying the join condition. `CROSS JOIN LATERAL` (Postgres/MySQL) and `CROSS APPLY` (SQL Server) break this isolation by evaluating the right-hand subquery once for every single row emitted by the left-hand table, passing outer column values into the subquery. This enables patterns like Top-N rows per category, dynamic JSON array unnesting, and calling parameterized inline table functions.",
        "keyPoints": [
            "Permits subqueries on the right side to reference columns from tables appearing on the left side.",
            "Acts as a parameterized iterator loop executed within the physical relational engine.",
            "Essential for computing Top-N records per category and unnesting dynamic arrays/JSON arrays."
        ]
    },
    {
        "id": "sql-iceberg-recursive-ctes",
        "term": "Recursive CTEs: Anchor, Working Tables & Cycle Traps",
        "category": "SQL SERVER",
        "difficulty": "MEDIUM",
        "definition": "A hierarchical query structure that repeatedly executes an iterative subquery over intermediate working tables until an empty rowset is returned.",
        "explanation": "A recursive CTE consists of two queries combined with `UNION ALL`: the Anchor Member (which seeds the initial result set) and the Recursive Member (which references the CTE itself). The engine manages an internal 'Working Table': it executes the recursive member using the current working table as input, outputs the results, replaces the working table with the new output, and repeats. If the dataset contains cyclic graph relationships, the query will loop indefinitely until halted by engine recursion limits (e.g. `MAXRECURSION`).",
        "keyPoints": [
            "Evaluates hierarchical and graph structures (org charts, bill of materials, network routes).",
            "Operates via an internal working table populated iteratively until the recursive step yields zero rows.",
            "Requires cycle detection logic (e.g. tracking visited path arrays) to prevent infinite loops."
        ]
    },
    {
        "id": "sql-iceberg-orm-bad-queries",
        "term": "ORM Query Degradation & N+1 Cascade Problem",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "MEDIUM",
        "definition": "The systemic performance degradation that occurs when object-relational mapping frameworks generate chatty, unindexed, or Cartesian queries.",
        "explanation": "Because ORMs treat relational tables as object collections, accessing a lazy-loaded child collection in a loop triggers the infamous N+1 query problem: 1 query to fetch N parent records, followed by N distinct round-trip queries to fetch children. Furthermore, naive ORM usage often issues unbounded `SELECT *` statements fetching hundreds of unneeded columns, invalidates covering index lookups, and inflates garbage collection pressure by hydrating thousands of temporary in-memory domain objects.",
        "keyPoints": [
            "N+1 cascades saturate network round-trips and degrade database connection pool concurrency.",
            "Over-fetching via SELECT * prevents covering index utilization and bloats JVM/.NET heaps.",
            "Eager loading multiple one-to-many collections generates massive Cartesian explosion joins."
        ]
    },
    {
        "id": "sql-iceberg-stored-procedures",
        "term": "Stored Procedures & Execution Plan Caching",
        "category": "SQL SERVER",
        "difficulty": "MEDIUM",
        "definition": "Precompiled collections of procedural and relational statements stored in the database catalog that reuse cached execution plans.",
        "explanation": "Stored procedures encapsulate business transactions inside the database engine, reducing client-server network round-trips to a single RPC call. When first executed, the query engine compiles the procedure and places the physical execution plan in the plan cache. While this eliminates compilation CPU costs on subsequent calls, it introduces 'parameter sniffing' vulnerabilities where plans optimized for initial outlier parameters are reused for radically different inputs, causing plan regressions.",
        "keyPoints": [
            "Eliminates network latency by executing multi-statement procedural logic directly inside the engine.",
            "Caches compiled physical execution plans to save parsing and optimization CPU cycles.",
            "Susceptible to parameter sniffing issues where skewed initial inputs corrupt subsequent runs."
        ]
    },
    {
        "id": "sql-iceberg-cursors",
        "term": "Database Cursors: Row-by-Row Penalty & Tempdb Spooling",
        "category": "SQL SERVER",
        "difficulty": "MEDIUM",
        "definition": "A database control structure that enables procedural, iterative traversal of individual query result set rows, incurring severe performance penalties.",
        "explanation": "Relational database engines are engineered to process sets of records in bulk through vectorized and pipelined operators. Cursors break this set-based paradigm by pulling records one by one into procedural memory. Depending on the cursor type (STATIC, KEYSET, DYNAMIC, or FAST_FORWARD), the engine may copy the entire result set into a temporary work table in tempdb, hold open row locks that block concurrent DML, and incur heavy context switching overhead between relational and procedural execution engines.",
        "keyPoints": [
            "Replaces optimized set-based relational algebra with slow procedural row-by-row iteration.",
            "STATIC and KEYSET cursors spool full candidate rowsets into tempdb work tables, saturating disk I/O.",
            "Open cursors can hold long-lived row/page locks, triggering widespread concurrency deadlocks."
        ]
    },
    {
        "id": "sql-iceberg-no-non-nullable",
        "term": "There Are No Non-Nullable Types in SQL",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "HARD",
        "definition": "The relational truth that column-level NOT NULL constraints do not guarantee non-nullability across expressions, outer joins, and aggregations.",
        "explanation": "While a column can be declared `NOT NULL` in table DDL, the SQL type system does not enforce non-nullability at the expression level. When a table with a `NOT NULL` column is referenced on the right side of a `LEFT OUTER JOIN`, unmatched rows synthesize a `NULL` for that column. Similarly, empty-set scalar aggregations (`SELECT SUM(val) FROM t WHERE 1=0`) evaluate to `NULL`. Consequently, all relational engines and client type mappers must treat every SQL column expression as inherently nullable.",
        "keyPoints": [
            "NOT NULL is an integrity constraint on physical table storage, not an immutable expression type.",
            "Outer joins synthesize NULLs across all columns of non-matching relations regardless of DDL.",
            "Scalar aggregate functions operating over empty partitions return NULL (except COUNT, which returns 0)."
        ]
    },
    {
        "id": "sql-iceberg-plan-hints",
        "term": "Query Optimizer Plan Hints: Force Order & Index Directives",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "Explicit syntax directives embedded in SQL queries that override cost-based optimizer choices regarding joins, indexes, or parallelism.",
        "explanation": "Plan hints (e.g. `FORCE ORDER`, `MERGE JOIN`, `INDEX(idx_name)`, or `OPTIMIZE FOR`) bypass the cost-based optimizer's cardinality models to force specific physical operators. While occasionally necessary to patch immediate production incidents caused by skewed statistics or optimizer bugs, plan hints are severe architectural liabilities. As data distributions shift and tables scale from megabytes to terabytes, hardcoded hints lock the engine into obsolete, catastrophic access paths.",
        "keyPoints": [
            "Forces the query optimizer to adopt specific access paths, join types, or memory grant configurations.",
            "Provides immediate workarounds for optimizer cardinality estimation failures or parameter sniffing.",
            "Introduces brittle technical debt that causes severe performance regressions as data scales."
        ]
    },
    {
        "id": "sql-iceberg-table-statistics",
        "term": "Cost-Based Optimizers & Table Statistics Histograms",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "HARD",
        "definition": "Statistical metadata describing column value distributions, null fractions, and density vectors used by optimizers to estimate query plan costs.",
        "explanation": "Cost-based optimizers do not inspect raw table data during query planning; they rely entirely on statistical metadata stored in system catalogs. This metadata includes max-diff histograms (frequency buckets of column values) and density vectors (representing distinctness). When statistics become stale after bulk inserts or updates, the optimizer's row estimates can be off by orders of magnitude, causing it to choose a Nested Loops join instead of a Hash Join, resulting in catastrophic hours-long execution spikes.",
        "keyPoints": [
            "Histograms divide column values into equi-height or max-diff buckets to estimate selectivity.",
            "Density vectors estimate the average number of duplicate rows for composite multi-column filters.",
            "Stale or missing statistics are the primary root cause of catastrophic query plan regressions."
        ]
    },
    {
        "id": "sql-iceberg-mvcc-garbage-collection",
        "term": "MVCC Garbage Collection & Table Bloat (VACUUM / Undo Purge)",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "HARD",
        "definition": "The internal storage engine processes responsible for reclaiming physical disk space occupied by obsolete, dead row versions under MVCC.",
        "explanation": "Under Multi-Version Concurrency Control (MVCC), UPDATE statements do not overwrite data in-place; they write a new tuple version and mark the old version as dead. In PostgreSQL, dead tuples remain on data pages until purged by background `autovacuum` workers. If long-running transactions hold open old transaction snapshots, autovacuum cannot reclaim dead tuples, causing severe 'table bloat' and cache pollution. In contrast, MySQL InnoDB writes old versions to Undo Logs; if undo purge threads fall behind, undo tablespaces swell uncontrollably.",
        "keyPoints": [
            "MVCC updates generate dead row versions to maintain non-blocking snapshot reads for concurrent sessions.",
            "Postgres autovacuum sweeps data pages to reclaim dead tuple slots for reuse by subsequent inserts.",
            "Long-running transactions prevent vacuuming, leading to massive disk bloat and sequential scan slowdowns."
        ]
    },

    # ─── TIER 4: MEDIUM DEPTH ───
    {
        "id": "sql-iceberg-count-star-vs-count-1",
        "term": "COUNT(*) vs COUNT(1): Optimizer Equivalence & Semantics",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "The comparison between full-table tuple counting and scalar expression counting in SQL query engines.",
        "explanation": "In modern relational engines, `COUNT(*)` and `COUNT(1)` are parsed into identical AST nodes and execute with identical physical query plans. Both instruct the engine to count the total number of rows in the candidate rowset regardless of column nullability. The engine typically picks the narrowest available non-clustered B-Tree index to minimize page I/O. In contrast, `COUNT(column_name)` has different semantics: it must inspect each row and skip records where the specific column evaluates to NULL.",
        "keyPoints": [
            "COUNT(*) and COUNT(1) are completely identical in execution cost and physical query plan generation.",
            "The optimizer selects the smallest available B-Tree index by byte size to satisfy full table counts.",
            "COUNT(column) requires null checking on every row and excludes NULL records from the tally."
        ]
    },
    {
        "id": "sql-iceberg-isolation-levels",
        "term": "Transaction Isolation Levels & Concurrency Anomalies",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "HARD",
        "definition": "The formal ANSI/ISO standards defining transaction boundary guarantees and the specific concurrency anomalies each level permits or prohibits.",
        "explanation": "Isolation levels balance database concurrency against transactional correctness. The four classical ANSI levels are: Read Uncommitted (permits Dirty Reads), Read Committed (prohibits dirty reads, permits non-repeatable reads), Repeatable Read (prohibits non-repeatable reads, permits phantom reads), and Serializable (prohibits all anomalies). Modern engines also provide Snapshot Isolation (SI), which prevents phantoms via point-in-time multi-version snapshots but remains vulnerable to the Write Skew anomaly.",
        "keyPoints": [
            "Read Committed is the default in most RDBMSs, releasing read locks immediately after statement completion.",
            "Repeatable Read holds shared read locks until transaction commit (or uses MVCC snapshot reads).",
            "Serializable provides full serial execution guarantees via predicate locks or Serializable Snapshot Isolation (SSI)."
        ]
    },
    {
        "id": "sql-iceberg-generator-functions-zip",
        "term": "Set-Returning Generator Functions & Cross Join Alignment",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "HARD",
        "definition": "The distinct behavior of set-returning functions (SRFs) in SQL engines, contrasting row-wise zipping with Cartesian expansion.",
        "explanation": "When invoking multiple set-returning functions (such as `generate_series()` or `UNNEST()` in PostgreSQL) within a single `SELECT` projection, older engines paired them via row-wise zipping (evaluating elements pairwise until the longest finishes). However, when placed in the `FROM` clause as a `CROSS JOIN`, the functions produce a full mathematical Cartesian Product (M * N rows). Standardizing this behavior was a major breaking change in PostgreSQL 10 to eliminate non-standard zipping bugs.",
        "keyPoints": [
            "Projecting multiple SRFs in legacy SELECT clauses zipped outputs row-by-row up to the longest output.",
            "Invoking generator functions in the FROM clause produces a strict Cartesian product (M * N rows).",
            "Modern SQL standards require explicit unnesting or LATERAL joins to avoid accidental row explosion."
        ]
    },
    {
        "id": "sql-iceberg-sharding",
        "term": "Database Sharding & Distributed Hash Routing",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "HARD",
        "definition": "A shared-nothing horizontal scaling architecture where a large relational dataset is partitioned across independent physical database instances via a shard key.",
        "explanation": "Sharding distributes data volume and transaction write loads across independent database nodes. Consistent hashing or range-based routing on a designated 'Shard Key' directs queries to the specific physical node hosting the target data. While point-reads and single-shard writes achieve linear horizontal scale, cross-shard queries require distributed scatter-gather execution, cross-shard joins become bottlenecked by network data transfer, and multi-shard transactions mandate expensive 2PC protocols.",
        "keyPoints": [
            "Scales write throughput linearly by partitioning relational data across isolated database nodes.",
            "Single-shard queries execute with local database latency via hash or directory routing.",
            "Cross-shard joins, global unique constraints, and distributed transactions introduce severe network latency."
        ]
    },
    {
        "id": "sql-iceberg-serializable-restarts",
        "term": "Serializable Restarts & SQLSTATE 40001 Retry Loops",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "HARD",
        "definition": "The architectural requirement that applications executing under Serializable Snapshot Isolation must wrap all transactions in retry loops to handle serialization failures.",
        "explanation": "Under true Serializable isolation implemented via Serializable Snapshot Isolation (SSI), the engine does not block concurrent readers with locks. Instead, it tracks read-write conflicts (rw-antidependencies) in an internal dependency graph. If the engine detects a cycle of conflicts (a dangerous structure that could violate serializability), it aborts one of the conflicting transactions with error `40001 (serialization_failure)`. Applications must implement exponential backoff retry loops to automatically re-execute aborted transactions.",
        "keyPoints": [
            "SSI tracks rw-antidependency locks (SIREAD locks) to detect non-serializable dependency cycles.",
            "Transactions violating serializability are actively terminated with error code 40001.",
            "Client applications must implement automated idempotent retry loops with jitter to operate safely under SSI."
        ]
    },
    {
        "id": "sql-iceberg-zigzag-join",
        "term": "Zigzag Join (Multi-Index Merge Intersection)",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "HARD",
        "definition": "An advanced physical query optimization algorithm that finds matching rows across multiple B-Tree indexes by jumping back and forth across sorted leaf keys.",
        "explanation": "When a query filters on multiple columns indexed by separate B-Trees (or composite indexes sharing prefix keys), standard engines perform an index intersection via bitmap scans. A Zigzag Join (implemented in engines like Google Spanner, DB2, and CockroachDB) improves on this by reading the current key from Index A and seeking directly to that key or higher in Index B. If Index B is higher, it jumps back to seek Index A. This allows the engine to skip vast ranges of non-matching tuples without scanning them.",
        "keyPoints": [
            "Intersects multiple sorted B-Tree indexes without requiring full scans of either index.",
            "Alternates seeks between index branches, using the largest current key to leap forward in the partner index.",
            "Dramatically reduces I/O when individual predicates have low selectivity but their intersection is sparse."
        ]
    },
    {
        "id": "sql-iceberg-phantom-reads",
        "term": "Phantom Reads & Next-Key Locking",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "HARD",
        "definition": "A concurrency anomaly where a transaction reads a set of rows satisfying a predicate, but a concurrent committed transaction inserts a new row matching that predicate.",
        "explanation": "Unlike Non-Repeatable Reads (which occur when existing rows are modified or deleted), Phantom Reads involve newly inserted records that materialize inside a range query. Standard row-level locks on existing data pages cannot prevent phantoms because the row being inserted does not yet exist. Relational engines prevent phantoms using Next-Key Locking (locking the index record and the gap preceding it, as in MySQL InnoDB) or Predicate Locking / SSI.",
        "keyPoints": [
            "Occurs when concurrent inserts add new records satisfying an active transaction's range predicate.",
            "Standard row-level locks cannot protect non-existent rows from concurrent insertion.",
            "Mitigated via Next-Key locks (combining record locks with gap locks) or Serializable Snapshot Isolation."
        ]
    },
    {
        "id": "sql-iceberg-triggers",
        "term": "Database Triggers & Hidden Transaction Side Effects",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "Event-driven procedural routines executed automatically by the database engine in response to DML operations on a table.",
        "explanation": "Triggers enforce complex auditing, state transitions, and referential integrity directly at the storage layer. However, triggers execute synchronously within the caller's active database transaction. Row-level triggers (`FOR EACH ROW`) execute per modified tuple, causing severe CPU context switching, multiplying lock durations, and disabling set-based bulk optimizations. Furthermore, cascading triggers can produce untraceable deadlocks and obscure execution paths.",
        "keyPoints": [
            "Executes synchronously inside the boundary of the triggering statement's transaction.",
            "Row-level triggers introduce massive CPU context switching overhead during bulk batch mutations.",
            "Can cause hidden lock amplification, recursive invocation loops, and difficult-to-debug deadlocks."
        ]
    },
    {
        "id": "sql-iceberg-merge",
        "term": "MERGE Statement Concurrency Pitfalls & Atomic Upserts",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "A standard SQL DML command that synchronizes target tables with source data by combining INSERT, UPDATE, and DELETE logic into a single statement.",
        "explanation": "Although designed to provide clean UPSERT semantics, the ANSI `MERGE` statement in many implementations (notably SQL Server and Oracle) is not inherently atomic under high concurrency. Without explicit table locking hints (`WITH (HOLDLOCK)`), concurrent MERGE statements reading the same missing key can simultaneously enter the `WHEN NOT MATCHED` branch, resulting in primary key violation crashes or duplicate row generation. Modern engines prefer dialect-native atomic upserts (`INSERT ... ON CONFLICT DO UPDATE`).",
        "keyPoints": [
            "Combines INSERT, UPDATE, and DELETE branches into a single declarative DML statement.",
            "Vulnerable to race conditions under concurrent execution without explicit serializable locking hints.",
            "Modern architectures favor native atomic upsert primitives (PostgreSQL ON CONFLICT / MySQL ON DUPLICATE KEY)."
        ]
    },
    {
        "id": "sql-iceberg-grouping-sets",
        "term": "GROUPING SETS, CUBE & ROLLUP Multidimensional Aggregations",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "Advanced aggregation extensions that compute multiple distinct group-by sub-aggregations across multiple dimensional levels in a single scan of the source data.",
        "explanation": "Prior to grouping sets, computing hierarchical sub-totals and cross-tabulations required multiple independent `GROUP BY` queries stitched together with `UNION ALL`, forcing multiple expensive table scans. `GROUPING SETS` allows developers to define exact groupings; `ROLLUP` computes hierarchical subtotals from left to right; and `CUBE` generates all $2^N$ combinatorial aggregations. Modern engines compute these in a single physical pass using optimized hash or stream rollup operators.",
        "keyPoints": [
            "Computes hierarchical and cross-dimensional aggregations in a single physical scan of base data.",
            "ROLLUP generates hierarchical sub-totals (e.g. Year -> Quarter -> Month -> Total).",
            "CUBE produces all 2^N combinations of grouping attributes, ideal for OLAP reporting cubes."
        ]
    },
    {
        "id": "sql-iceberg-write-skew",
        "term": "Write Skew Anomaly in Snapshot Isolation",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "HARD",
        "definition": "A subtle concurrency anomaly occurring under Snapshot Isolation where two concurrent transactions read overlapping data but modify disjoint rows, violating an invariant.",
        "explanation": "Consider an invariant: 'At least one on-call doctor must remain active.' Doctors Alice and Bob simultaneously attempt to go off-call. Alice's transaction checks active doctors (returns 2: Alice, Bob) and updates Alice to inactive. Concurrently, Bob's transaction checks active doctors (also returns 2) and updates Bob to inactive. Under Snapshot Isolation, because both transactions modified completely disjoint rows, both commit successfully, leaving zero doctors on call. Preventing write skew requires explicit locking (`SELECT FOR UPDATE`) or true Serializable isolation.",
        "keyPoints": [
            "Snapshot Isolation prevents dirty reads, non-repeatable reads, and phantoms, but permits Write Skew.",
            "Arises when concurrent transactions make decisions based on overlapping read sets but write to disjoint keys.",
            "Remediated by elevating isolation to true Serializable or utilizing explicit pessimistic row locks."
        ]
    },
    {
        "id": "sql-iceberg-partial-indexes",
        "term": "Partial & Filtered Indexes",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "A B-Tree index built over a subset of a table's rows defined by an explicit predicate (e.g. WHERE active = true or WHERE status != 'ARCHIVED').",
        "explanation": "In many production tables, data distributions are heavily skewed: 95% of rows may have status 'PROCESSED' while only 5% are 'PENDING'. A complete index over the status column wastes megabytes of memory on unneeded historical records. A Partial Index (`CREATE INDEX idx ON orders (created_at) WHERE status = 'PENDING'`) indexes only the 5% active rows. This drastically reduces index storage footprint, accelerates write throughput (since updates to processed rows bypass index maintenance), and keeps the working set pinned in RAM.",
        "keyPoints": [
            "Indexes only rows satisfying an explicit WHERE condition, drastically reducing B-Tree storage footprint.",
            "Eliminates index maintenance overhead during DML mutations on rows falling outside the filter predicate.",
            "Query optimizer uses the partial index only when query predicates match or subsume the index condition."
        ]
    },

    # ─── TIER 5: DEEP WATER ───
    {
        "id": "sql-iceberg-denormalization",
        "term": "Relational Denormalization Strategies",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "HARD",
        "definition": "The intentional reintroduction of redundant data into a relational schema to optimize read latency and eliminate expensive multi-table joins.",
        "explanation": "While pure 3NF/BCNF normalization minimizes write anomalies, high-scale read patterns often collapse under multi-join overhead. Denormalization strategies include duplicating parent attributes into child tables, pre-aggregating summary metrics into counter caches, and maintaining materialized views. However, denormalization shifts the burden to the write path: applications or database triggers must coordinate distributed updates to keep duplicate copies synchronized, risking silent data divergence.",
        "keyPoints": [
            "Trades storage space and write-amplification for dramatic read-time query acceleration.",
            "Eliminates multi-hop relational joins in high-throughput read-heavy APIs and microservices.",
            "Requires robust synchronization mechanisms (CDC pipelines, triggers, or transactional outbox) to prevent divergence."
        ]
    },
    {
        "id": "sql-iceberg-select-for-update",
        "term": "SELECT FOR UPDATE & Concurrency Control (SKIP LOCKED / NOWAIT)",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "A pessimistic locking clause that acquires exclusive or update row locks on selected records to prevent concurrent modification until transaction commit.",
        "explanation": "In high-concurrency transactional workflows (like booking systems or job queues), reading data with standard SELECT permits concurrent sessions to modify the same state. Appending `FOR UPDATE` instructs the engine to place exclusive row-level locks on candidate records. Adding `NOWAIT` causes the query to fail immediately rather than wait if locks are contested. Adding `SKIP LOCKED` instructs the engine to bypass currently locked rows entirely, enabling lock-free, horizontally scalable queue processing across hundreds of workers.",
        "keyPoints": [
            "Pessimistically locks candidate rows against concurrent updates until the enclosing transaction commits.",
            "NOWAIT aborts the transaction immediately if any target row is currently locked by a rival session.",
            "SKIP LOCKED skips locked tuples, enabling ultra-fast, lock-free parallel transactional queue consumers."
        ]
    },
    {
        "id": "sql-iceberg-null-in-check-constraints",
        "term": "NULLs in CHECK Constraints Are Truthy",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "The surprising relational behavior where a CHECK constraint allows an insert or update if the constraint expression evaluates to UNKNOWN (NULL).",
        "explanation": "In SQL `WHERE` clauses, a record is accepted ONLY if the predicate evaluates strictly to TRUE (`UNKNOWN` is treated as false). However, SQL standard `CHECK` constraints operate under the inverse rule: a constraint is violated ONLY if the condition evaluates strictly to FALSE. If a column contains NULL, an expression like `CHECK (price > 0)` evaluates to `NULL > 0` -> UNKNOWN. Because UNKNOWN is not FALSE, the check succeeds and the NULL row is permitted into the table.",
        "keyPoints": [
            "CHECK constraints reject rows ONLY when the boolean expression evaluates to FALSE.",
            "Expressions evaluating to UNKNOWN (due to NULLs) satisfy CHECK constraints without error.",
            "Mandates combining explicit NOT NULL constraints with CHECK expressions to enforce domain invariants."
        ]
    },
    {
        "id": "sql-iceberg-transaction-contention",
        "term": "Transaction Contention, Latch Waits & Hotspots",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "HARD",
        "definition": "The serialization bottleneck caused by concurrent sessions competing for identical logical row locks or physical in-memory page latches.",
        "explanation": "High transaction throughput can collapse when hundreds of concurrent connections attempt to modify the same row (logical lock contention) or write to adjacent rows residing on the same 8KB data page (physical page latch contention, e.g. PAGELATCH_EX). While locks protect database logical integrity across transaction lifecycles, latches are lightweight synchronization primitives protecting in-memory page structures. High latch contention causes CPU thread starvation and cascading latency spikes.",
        "keyPoints": [
            "Logical lock contention occurs when transactions wait on conflicting row/table lock modes.",
            "Physical page latch contention (PAGELATCH) occurs when concurrent threads contend for the same 8KB memory page.",
            "Mitigated by spreading writes across multiple pages, sharding hot counter records, and shortening transaction durations."
        ]
    },
    {
        "id": "sql-iceberg-sargability",
        "term": "Sargability & Search Argument Able Predicates",
        "category": "SQL SERVER",
        "difficulty": "HARD",
        "definition": "The property of a query predicate that allows the query optimizer to utilize a B-Tree index seek rather than an index scan or table scan.",
        "explanation": "A predicate is 'SARGable' (Search Argument Able) if the engine can navigate directly down a B-Tree index using the filter value. Wrapping indexed columns in deterministic functions (e.g. `WHERE YEAR(created_at) = 2026` or `WHERE UPPER(email) = 'USER@DOMAIN.COM'`) destroys sargability because the engine cannot know the function output without evaluating it for every row in the table, forcing a catastrophic full scan. Rewriting to range comparisons (`WHERE created_at >= '2026-01-01' AND created_at < '2027-01-01'`) restores O(log N) index seeks.",
        "keyPoints": [
            "SARGable predicates enable direct B-Tree index seeks down to target leaf key ranges.",
            "Wrapping indexed columns in scalar functions, math operations, or wildcards (%term) destroys sargability.",
            "Non-sargable queries force the engine into CPU-intensive full index scans or table scans."
        ]
    },
    {
        "id": "sql-iceberg-timestamptz-storage",
        "term": "TIMESTAMPTZ Does Not Store a Time Zone",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "HARD",
        "definition": "The common misconception in PostgreSQL and relational standards regarding how timezone-aware timestamps are physically stored on disk.",
        "explanation": "Despite its name, PostgreSQL's `TIMESTAMPTZ` (timestamp with time zone) does NOT store any time zone identifier (like 'America/New_York' or '+05:30') on the physical data page. It takes the client's input timestamp, converts it to UTC, and stores an 8-byte integer representing microseconds since the 2000-01-01 UTC epoch. When queried, it converts that UTC integer into the client's current session time zone. If an application must preserve the original local time zone of record entry, it must store the offset or IANA zone in a separate column.",
        "keyPoints": [
            "TIMESTAMPTZ physically stores an 8-byte UTC epoch value with zero embedded timezone metadata.",
            "Incoming timestamps are converted to UTC on write, and converted to the client's session timezone on read.",
            "Preserving original geographic timezones requires an explicit secondary VARCHAR column."
        ]
    },
    {
        "id": "sql-iceberg-star-schema-vs-normalized",
        "term": "Star Schema vs Normalized 3NF Relational Engines",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "HARD",
        "definition": "The architectural contrast between highly normalized 3NF schemas optimized for transactional write isolation and denormalized star schemas optimized for analytical OLAP scans.",
        "explanation": "Normalized OLTP engines prioritize single-row atomic mutations, maintaining strict B-Tree indexes and foreign key graphs to guarantee integrity without redundancy. Conversely, analytical data warehouses (Snowflake, Databricks, Fabric, Synapse) execute vector aggregations over billions of rows. Star schemas de-normalize entities into wide, denormalized dimension tables surrounding numeric fact tables, enabling vectorized column pruning, bitmap join filtering, and SIMD aggregation.",
        "keyPoints": [
            "3NF prioritizes write integrity, row-level locks, and zero data redundancy for transactional OLTP.",
            "Star schemas prioritize analytical scan throughput, vectorized column compression, and simple join graphs.",
            "Eliminates deep snowflake join hierarchies to allow columnar engines to execute vectorized scan filters."
        ]
    },
    {
        "id": "sql-iceberg-ascending-key-problem",
        "term": "Ascending Key Problem in B-Trees",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "HARD",
        "definition": "The severe concurrency and optimizer degradation that occurs when high-volume inserts target monotonically increasing primary keys.",
        "explanation": "When tables use auto-incrementing identity columns, timestamps, or sequences as clustered primary keys, every single `INSERT` statement targets the exact same physical leaf page at the extreme right edge of the B-Tree. Under high concurrency, threads queue up for exclusive latches on this single rightmost page (PAGELATCH_EX hot spot). Additionally, for query optimizers, newly inserted ascending keys fall beyond the maximum value recorded in the last statistics histogram update, leading the optimizer to estimate 1 row returned and choose disastrous Nested Loops plans.",
        "keyPoints": [
            "Causes physical page latch contention on the rightmost leaf node of the clustered B-Tree.",
            "Statistics histograms quickly become out-of-date, causing optimizer cardinality under-estimations.",
            "Mitigated via hash partitioning, synthetic composite keys, or reverse-key indexing."
        ]
    },
    {
        "id": "sql-iceberg-ambiguous-network-errors",
        "term": "Ambiguous Network Errors & Two-Generals Commit Dilemma",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "HARD",
        "definition": "The distributed systems dilemma where a network socket drops during a COMMIT operation, leaving the client in an indeterminate transactional state.",
        "explanation": "When an application issues `COMMIT` and the TCP connection times out or drops before receiving an acknowledgment, the client faces the classic Two-Generals Problem. The database engine may have successfully written the commit record to WAL and committed the data, or it may have encountered an error and rolled back the transaction upon client disconnection. Blindly retrying the transaction risks executing duplicate financial payments or double-charging orders. Robust architectures mandate client-generated idempotency tokens.",
        "keyPoints": [
            "A dropped TCP socket during COMMIT leaves transaction outcome (commit vs abort) fundamentally ambiguous.",
            "Blind retries can lead to critical data corruption or duplicate transactions.",
            "Requires unique client idempotency keys and transactional outbox patterns to achieve safe deduplication."
        ]
    },
    {
        "id": "sql-iceberg-utf8mb4",
        "term": "MySQL utf8 Truncation Bug vs utf8mb4",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "HARD",
        "definition": "The notorious legacy encoding issue in MySQL where the 'utf8' charset supported only 3 bytes, causing silent data truncation on modern 4-byte Unicode characters.",
        "explanation": "The official UTF-8 standard allows characters up to 4 bytes in length (covering emojis, mathematical symbols, and historic scripts). In early releases, MySQL implemented a non-standard 3-byte encoding and labeled it `utf8` (now `utf8mb3`). If an application inserted a 4-byte character into a `utf8` column, MySQL would silently truncate the string at that character or throw an error. In 2010, MySQL introduced `utf8mb4` to support genuine 4-byte UTF-8, which is now the mandatory default.",
        "keyPoints": [
            "Legacy MySQL 'utf8' was an incomplete 3-byte implementation unable to store astral-plane characters (emojis).",
            "Inserting 4-byte Unicode into a utf8 column caused silent string truncation or catastrophic write failures.",
            "utf8mb4 provides true RFC 3629 UTF-8 compliance and is the required modern standard across all relational databases."
        ]
    },

    # ─── TIER 6: DARK ABYSS ───
    {
        "id": "sql-iceberg-cost-models-reality",
        "term": "Cost Models vs Physical Hardware Reality",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "The systemic divergence between static relational query optimizer cost formulas and the physical realities of modern hardware (NVMe SSDs, tiered memory, and CPU caches).",
        "explanation": "Relational cost-based optimizers trace their cost formulas back to System R in the 1970s, assuming spinning magnetic hard disks where random 8KB page reads cost 4x to 100x more than sequential reads. On modern PCIe Gen 5 NVMe SSDs with 1,000,000+ random IOPS and massive operating system page caches, random reads have negligible latency differences compared to sequential scans. Furthermore, modern cost models largely ignore CPU L1/L2/L3 cache misses and NUMA node memory locality, frequently causing optimizers to reject superior execution plans.",
        "keyPoints": [
            "Traditional cost models over-penalize random I/O based on obsolete spinning-platter disk assumptions.",
            "Modern NVMe SSDs deliver hundreds of thousands of random IOPS, flattening random vs sequential cost differentials.",
            "Optimizer cost units fail to model NUMA interconnect memory latency and CPU instruction cache misses."
        ]
    },
    {
        "id": "sql-iceberg-jsonb-null-false",
        "term": "'null'::jsonb IS NULL Evaluates to False",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "The semantic distinction in PostgreSQL between a JSON-encoded null primitive and a relational SQL NULL value.",
        "explanation": "In PostgreSQL JSONB, there are two completely different concepts of null: the SQL NULL (indicating the absence of any value in the column) and the JSON `null` literal (a valid 1-byte JSONB binary payload representing the JSON primitive value `null`). Consequently, evaluating `'null'::jsonb IS NULL` yields FALSE because the column contains a valid, non-null JSONB value. To check for JSON null literals, developers must use `jsonb_typeof(col) = 'null'` or JSON path queries.",
        "keyPoints": [
            "SQL NULL denotes the total absence of a relational value in a table column.",
            "JSON null ('null'::jsonb) is a valid, existing binary JSONB scalar primitive.",
            "Testing 'null'::jsonb IS NULL returns FALSE; detecting it requires jsonb_typeof() = 'null'."
        ]
    },
    {
        "id": "sql-iceberg-tpcc-wait-times",
        "term": "TPC-C Benchmark Specification & Artificial Keying Times",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "The mandatory simulation of human interactive delay (keying and think times) codified in the TPC-C benchmark standard.",
        "explanation": "TPC-C is the gold standard transactional database benchmark. A frequent misconception is that TPC-C tests how fast a database can execute transactions in an unthrottled loop. In reality, the TPC-C specification strictly mandates realistic simulated human client behavior: emulated terminal operators spend 10-20 seconds 'keying' inputs and 'thinking' between transactions. Because terminals hold transactions or connections open during think times, the benchmark tests how well a database handles high concurrency and lock holding times without running out of resources.",
        "keyPoints": [
            "TPC-C mandates realistic terminal keying and think times between consecutive transactional operations.",
            "Prevents synthetic microbenchmarks from masking realistic connection holding times and lock queues.",
            "Measures transaction throughput under realistic concurrency and transaction lifecycle constraints."
        ]
    },
    {
        "id": "sql-iceberg-deferrable-constraints",
        "term": "DEFERRABLE INITIALLY IMMEDIATE Constraints",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "A relational constraint configuration that allows integrity checks (such as foreign keys or unique constraints) to be postponed until transaction commit.",
        "explanation": "By default, relational constraints are checked immediately at the end of each individual SQL statement (`NOT DEFERRABLE` or `DEFERRABLE INITIALLY IMMEDIATE`). However, complex transactional workflows—such as mutually dependent circular foreign keys (Parent references Child, Child references Parent) or bulk shuffling unique sequence numbers—temporarily violate constraints during intermediate steps. Declaring constraints as `DEFERRABLE INITIALLY DEFERRED` postpones evaluation until `COMMIT`, allowing the transaction to pass through temporary invalid states.",
        "keyPoints": [
            "Permits temporary constraint violations during intermediate statements within an open transaction.",
            "Postpones physical integrity validation until the final COMMIT phase of the transaction.",
            "Crucial for resolving circular foreign key dependencies and bulk reordering unique sequence indexes."
        ]
    },
    {
        "id": "sql-iceberg-explain-count-star",
        "term": "EXPLAIN Catalog Approximations for Row Counts",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "A technique that retrieves sub-millisecond approximate table row counts by inspecting system catalog metadata instead of executing full table scans.",
        "explanation": "In MVCC databases like PostgreSQL, executing `SELECT COUNT(*)` on a 500-million row table requires a full table scan or index scan to verify tuple visibility for the current transaction snapshot, taking minutes. However, running `EXPLAIN` or querying `pg_class.reltuples` and `pg_class.relpages` reads statistics recorded during the last vacuum/analyze. This returns an approximate row count in under 1 millisecond, ideal for UI pagination counters and administrative monitoring dashboards.",
        "keyPoints": [
            "MVCC mandates full table/index scans for exact COUNT(*) to verify tuple visibility.",
            "pg_class.reltuples provides an instantaneous O(1) estimate based on background catalog statistics.",
            "Powers high-speed administrative dashboards and deep UI pagination counters where exact precision is non-critical."
        ]
    },
    {
        "id": "sql-iceberg-causal-reverse",
        "term": "Causal Reverse Anomaly in Asynchronous Replication",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "A distributed consistency anomaly where an effect appears to precede its cause in replica read logs due to asynchronous replication delays or clock skew.",
        "explanation": "In distributed or multi-region database systems replicating asynchronously, causal relationships can be inverted from the observer's perspective. For example, User A posts a comment (Cause), and User B replies to that comment (Effect). If User B's reply replicates to an edge replica faster than User A's original comment (due to network partition re-routing or multiple replication streams), a reader at that replica will observe the reply before the original comment existed. Preventing this requires causal consistency models and vector clocks.",
        "keyPoints": [
            "Occurs in distributed systems when an effect is observed on a replica before its causal ancestor arrives.",
            "Caused by multi-channel asynchronous replication, network route reordering, or unsynchronized wall clocks.",
            "Enforced at the storage layer via vector clocks, Lamport timestamps, or Raft consensus log linearization."
        ]
    },
    {
        "id": "sql-iceberg-match-partial",
        "term": "MATCH PARTIAL Composite Foreign Key Semantics",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "An esoteric SQL standard rule for composite foreign keys that specifies validation behavior when only a subset of composite key columns contain NULL.",
        "explanation": "The ANSI SQL standard defines three modes for composite foreign keys containing NULLs: `MATCH SIMPLE` (if any column is NULL, the entire foreign key check is skipped; default in Postgres/MySQL), `MATCH FULL` (all columns must be non-null and match, or all columns must be NULL), and `MATCH PARTIAL`. Under `MATCH PARTIAL`, if some columns are NULL, the non-null columns must match a valid subset of at least one row in the referenced table. Its extreme verification complexity and locking overhead led most relational engines to never implement it.",
        "keyPoints": [
            "Defines composite foreign key validation when some columns are NULL and others contain values.",
            "MATCH SIMPLE (default) skips all validation if any single column in the composite foreign key is NULL.",
            "MATCH PARTIAL requires non-null columns to match candidate subsets; widely omitted due to implementation complexity."
        ]
    },

    # ─── TIER 7: DEEPEST SEABED / TRENCH ───
    {
        "id": "sql-iceberg-vectorized-vs-simd",
        "term": "Vectorized Execution vs Hardware SIMD Vectorization",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "The distinction between block-oriented tuple-at-a-time engine pipelines and hardware-level CPU SIMD vector register instructions.",
        "explanation": "In database literature, 'Vectorized Execution' (pioneered by MonetDB/X100 and adopted by DuckDB, Snowflake, Databricks Photon, and ClickHouse) refers to passing contiguous arrays of tuples (e.g. 1024 values per vector) between physical query operators to amortize dynamic function dispatch overhead. In contrast, 'Hardware SIMD' (Single Instruction, Multiple Data) refers to CPU-level instruction sets (AVX-2, AVX-512, ARM Neon) executing mathematical operations across 512-bit registers in a single cycle. While vectorized engine design facilitates compiler auto-vectorization into SIMD, they are distinct architectural concepts.",
        "keyPoints": [
            "Vectorized execution passes batches of contiguous column arrays (vectors) between physical operators.",
            "Amortizes virtual function dispatch calls and maximizes CPU L1/L2 instruction and data cache locality.",
            "Hardware SIMD utilizes 256-bit and 512-bit CPU vector registers (AVX-512) for single-cycle operations."
        ]
    },
    {
        "id": "sql-iceberg-null-distinct-unique",
        "term": "NULL Equality in DISTINCT vs UNIQUE Constraints",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "The formal divergence in SQL standard specifications where DISTINCT treats NULLs as identical duplicates, while UNIQUE constraints treat them as distinct.",
        "explanation": "Under SQL standard specifications, `SELECT DISTINCT` treats all NULL values as equal to each other, collapsing multiple NULLs into a single output row. Conversely, standard `UNIQUE` constraints treat NULLs as non-equal unknown entities: a table with a UNIQUE column permits an infinite number of rows containing NULL (implemented in Postgres, Oracle, and SQL Server 2022+ via `UNIQUE NULLS DISTINCT`). SQL:2008 introduced `UNIQUE NULLS NOT DISTINCT` to force UNIQUE constraints to treat NULLs as duplicate violations.",
        "keyPoints": [
            "DISTINCT treats all NULLs as equivalent values, collapsing them into a single unique group.",
            "Standard UNIQUE constraints treat each NULL as a distinct unknown, permitting multiple NULL rows.",
            "Modern engines support UNIQUE NULLS NOT DISTINCT to prevent duplicate NULL entries in unique indexes."
        ]
    },
    {
        "id": "sql-iceberg-volcano-model",
        "term": "Volcano Iterator Execution Model & Cache Misses",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "The classical demand-driven query execution model where operators implement an open()-next()-close() iterator interface pulling one tuple at a time.",
        "explanation": "Introduced by Goetz Graefe in 1994, the Volcano Model (or Iterator Model) structured decades of relational engines (including early Postgres and SQL Server). Each query operator exposes three methods: `open()`, `next()`, and `close()`. The parent operator calls `next()` on child operators to pull a single tuple up the query tree. While simple and memory-efficient, calling a virtual function pointer for every single attribute of billions of rows incurs catastrophic CPU instruction cache misses and branch mispredictions, driving modern OLAP to batch vectorization and JIT code generation.",
        "keyPoints": [
            "Demand-driven pipelined execution pulling tuples one-at-a-time via a standardized next() interface.",
            "Virtual function dispatch calls for every tuple incur severe CPU instruction cache misses.",
            "Superseded in modern analytical engines by vectorized batch processing (DuckDB) and JIT compilation (HyPer)."
        ]
    },
    {
        "id": "sql-iceberg-join-ordering-np-hard",
        "term": "Join Ordering Complexity (NP-Hard Search Space)",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "The combinatorial explosion of possible join order permutations that makes finding the mathematically optimal query plan an NP-hard problem.",
        "explanation": "For a query joining N relations, the number of possible join trees grows exponentially. For left-deep join trees, the search space is $N!$. For bushy join trees (where joins can combine the results of two previous joins), the space of valid trees is given by Catalan numbers: $(2N - 2)! / (N - 1)!$. For $N = 12$ tables, this represents over 28 billion permutations! Optimizers use Dynamic Programming (System R) for small queries ($N \\le 8$), but fall back to Greedy Search or Genetic Algorithms (e.g. Postgres GEQO) for larger queries to avoid optimizer exhaustion.",
        "keyPoints": [
            "The search space of possible join trees explodes exponentially with Catalan number complexity.",
            "Finding the globally optimal join tree across multi-table queries is mathematically NP-hard.",
            "Engines employ Genetic Query Optimizers (GEQO) or greedy heuristics when join counts exceed 10-12 tables."
        ]
    },
    {
        "id": "sql-iceberg-database-cracking",
        "term": "Database Cracking & Self-Organizing Adaptive Indexing",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "An autonomous physical indexing architecture where queries adaptively partition and sort columns on-the-fly as a side-effect of query execution.",
        "explanation": "Introduced by Stratos Idreos et al. (CWI Amsterdam), Database Cracking eliminates manual DBA index creation. When a query filters on an unindexed column (e.g. `WHERE age > 30`), the query execution operator physically reorganizes the underlying memory buffer into two pieces: rows with `age <= 30` and rows with `age > 30`. Subsequent queries continuously subdivide these 'cracks'. Over time, the storage engine self-organizes into an adaptive search index matching the exact query workload without upfront indexing overhead.",
        "keyPoints": [
            "Eliminates manual index creation by physically partitioning data in-place during query execution.",
            "Queries act as index builders, progressively refining data sorting based on actual query filter ranges.",
            "Pioneered in MonetDB to deliver self-tuning adaptive performance for exploratory analytical workloads."
        ]
    },
    {
        "id": "sql-iceberg-wcoj",
        "term": "Worst-Case Optimal Joins (WCOJ) & Leapfrog Triejoin",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "A class of multiway join algorithms whose runtime is asymptotically bounded by the Atserias-Grohe-Marx (AGM) bound, bypassing binary join bottlenecks.",
        "explanation": "Traditional relational query engines execute queries by breaking them down into pairwise binary joins (Join A to B, then Join result to C). However, for cyclic queries (such as triangle queries in graph analytics: `(A-B), (B-C), (C-A)`), pairwise binary joins can produce massive intermediate Cartesian products that are completely eliminated in the final join. Worst-Case Optimal Join algorithms (such as Leapfrog Triejoin) intersect all relational constraints simultaneously across multiple dimensions, guaranteeing execution runtime proportional to the theoretical minimum output size.",
        "keyPoints": [
            "Overcomes the fundamental asymptotic sub-optimality of classical pairwise binary join trees.",
            "Solves cyclic and graph queries (e.g. triangle detection) without generating massive intermediate results.",
            "Powers modern graph-relational engines like Kùzu and LogicBlox using Leapfrog Triejoin iterators."
        ]
    },
    {
        "id": "sql-iceberg-xtid-exhaustion",
        "term": "Transaction ID (XTID) Exhaustion & Wraparound Emergency",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "The catastrophic scenario in 32-bit MVCC engines where transaction counter limits threaten to treat all historical data as invisible, forcing database shutdown.",
        "explanation": "In PostgreSQL, transaction IDs (XIDs) are represented as 32-bit unsigned integers, providing ~4.29 billion transaction IDs. Because transaction numbers wrap around in modular arithmetic ($2^{31}$ transactions in the past are visible, $2^{31}$ are in the future), historical tuples must be periodically 'frozen' (marking their header with `HEAP_XMIN_FROZEN`). If aggressive autovacuum fails to freeze tuples before the database approaches the 2-billion transaction limit, PostgreSQL forcibly enters read-only emergency mode and shuts down to prevent silent data corruption.",
        "keyPoints": [
            "32-bit transaction counters wrap around modulo 2^32, creating a hard limit of ~2 billion active transactions.",
            "Failure to freeze historical row headers causes past committed records to silently disappear into the future.",
            "Postgres enters a protective read-only emergency shutdown if autovacuum freeze falls behind the safety limit."
        ]
    },
    {
        "id": "sql-iceberg-learned-indexes",
        "term": "Learned Index Structures (Recursive Model Indexes / RMI)",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "The machine learning paradigm pioneered by Kraska et al. that replaces traditional B-Trees with recursive functional regression models to predict key positions.",
        "explanation": "A B-Tree index is fundamentally a model that maps a search key to a physical memory address within a cumulative distribution function (CDF). In 2018, Tim Kraska (MIT) demonstrated that trained regression models (such as neural networks, spline interpolations, or linear models organized into a Recursive Model Index hierarchy) can predict physical row offsets with high accuracy. Learned indexes consume up to 70% less memory than traditional B-Trees while matching or exceeding lookup speeds on cache-resident datasets.",
        "keyPoints": [
            "Treats index lookup as a functional regression problem predicting key memory offsets from CDF curves.",
            "Replaces multi-megabyte B-Tree branch and leaf pages with compact mathematical weight arrays.",
            "Demonstrates 70% smaller memory footprints and faster L3 cache lookup speeds on static sorted datasets."
        ]
    },

    # ─── TIER 8: BELOW THE SEABED / SUB-CRUST (THE DEEPEST ESOTERICA) ───
    {
        "id": "sql-iceberg-halloween-problem",
        "term": "The Halloween Problem & Update Mutation Scanning",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "A database mutation phenomenon where an UPDATE operation modifies an indexed column, causing modified rows to advance forward and be mutated repeatedly.",
        "explanation": "First discovered at IBM on Halloween 1976 during System R development, the Halloween Problem occurred on a query: 'Give a 10% raise to all employees earning under $25,000'. The engine used an index on salary. As soon as an employee earning $20,000 was updated to $22,000, their index entry moved forward in the B-Tree. The index scan subsequently encountered the employee a second time and raised them again, looping until all employees earned over $25,000. Relational engines solve this by separating the read scan phase from the write mutation phase via intermediate spooling.",
        "keyPoints": [
            "Occurs when an update statement mutates the physical index key guiding the search scan.",
            "Causes modified rows to advance forward along the index path, triggering infinite or repeated mutations.",
            "Modern engines insert an intermediate Table Spool or blocking snapshot operator to isolate read and write sets."
        ]
    },
    {
        "id": "sql-iceberg-dee-and-dum",
        "term": "TABLE_DEE and TABLE_DUM Relational Identities",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "The two fundamental identity relations in formal relational theory (Date & Darwen) possessing zero attributes, representing boolean TRUE and FALSE.",
        "explanation": "In Chris Date and Hugh Darwen's relational algebra, relations can have degree zero (zero columns). There are exactly two possible 0-degree relations: TABLE_DEE (which contains exactly 1 tuple: the empty tuple) and TABLE_DUM (which contains 0 tuples). In relational algebra, TABLE_DEE acts as the identity element for natural join ($R \\bowtie DEE = R$) and represents boolean TRUE. TABLE_DUM acts as the identity element for relational union ($R \\cup DUM = R$) and the nullifying element for join ($R \\bowtie DUM = DUM$), representing boolean FALSE.",
        "keyPoints": [
            "TABLE_DEE has 0 attributes and exactly 1 tuple, serving as the relational algebraic identity for JOIN (TRUE).",
            "TABLE_DUM has 0 attributes and 0 tuples, serving as the relational algebraic nullifier for JOIN (FALSE).",
            "Forms the mathematical theoretical foundation proving how relational calculus models propositional logic."
        ]
    },
    {
        "id": "sql-iceberg-serial-non-transactional",
        "term": "SERIAL & Sequence Generation Non-Transactional Gaps",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "The deliberate non-transactional design of database sequence generators (SERIAL, IDENTITY, SEQUENCE) that produce permanent gaps upon rollback.",
        "explanation": "A common expectation is that database transactions guarantee gapless primary key sequences. However, if sequence generation were transactional (rolling back its counter when a transaction aborts), every transaction would have to hold an exclusive lock on the sequence table until commit, completely destroying database write concurrency. Therefore, sequence generators (`nextval()`) allocate numbers atomically in shared memory outside the transaction's WAL rollback scope. If a transaction rolls back, its generated ID is permanently lost, creating gaps.",
        "keyPoints": [
            "Sequence increments execute outside transaction rollback boundaries to maintain high write concurrency.",
            "Aborted transactions or crash recovery cycles leave permanent, irreversible gaps in sequence numbers.",
            "Auditing requirements for gapless sequential numbering must use explicit application-level locking tables."
        ]
    },
    {
        "id": "sql-iceberg-fsyncgate",
        "term": "Fsyncgate: Linux Kernel Page Cache Error Dropping",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "The critical 2018 discovery where the Linux kernel cleared dirty page flags upon writeback I/O error, causing subsequent fsync calls to falsely report success.",
        "explanation": "For decades, database engines assumed that if a background write of dirty buffer pages failed, calling `fsync()` on the file descriptor would return an error, allowing the engine to retry. In 2018, PostgreSQL developers discovered 'fsyncgate': when an I/O error occurred during asynchronous writeback, the Linux kernel cleared the dirty bit on the page cache and marked the file descriptor with an error. Subsequent `fsync()` calls cleared the error flag and returned SUCCESS (0), leading PostgreSQL to believe data was durably persisted on disk when it was permanently lost.",
        "keyPoints": [
            "Revealed that Linux kernel writeback failures cleared dirty page flags, dropping unsaved data from cache.",
            "Subsequent fsync() calls returned success, causing databases to believe unwritten data was safely stored on disk.",
            "Forced database engines to treat any fsync error as a fatal panic, requiring immediate engine crash and restart."
        ]
    },
    {
        "id": "sql-iceberg-allballs",
        "term": "The 'allballs' Time Literal in PostgreSQL",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "A historical, quirky reserved string literal in PostgreSQL that parses into '00:00:00.00' UTC time (all zeroes).",
        "explanation": "In PostgreSQL, the literal `'allballs'` is an esoteric syntax legacy from early Ingres/Postgres development. When cast to time or timetz (`SELECT 'allballs'::time`), the parser interprets it as midnight ('00:00:00'). The phrase originates from military and telegraph slang where a row of zeroes (00:00:00) resembles a line of balls. While kept for backwards compatibility in PostgreSQL's date/time scanner, it represents the quirky depths of historical SQL parser implementations.",
        "keyPoints": [
            "Evaluates to '00:00:00.00' UTC when cast to a TIME or TIMETZ datatype in PostgreSQL.",
            "Traces back to military and telecommunication slang referring to a sequence of zeroes.",
            "Exemplifies historical parser quirks and legacy token preservation in mature relational database engines."
        ]
    },
    {
        "id": "sql-iceberg-null-foundations",
        "term": "Relational NULL & Codd's Missing Information Foundations",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "The formal mathematical critique of NULL in relational theory and E.F. Codd's distinction between 'Value Unknown' and 'Value Inapplicable'.",
        "explanation": "In E.F. Codd's foundational 12 relational rules, Rule 3 mandates systematic treatment of missing information distinct from regular values. Codd proposed two distinct nulls: A-marks (inapplicable, e.g. Spouse Name for an unmarried person) and I-marks (missing/unknown, e.g. Current Price of an unlisted item). SQL flattened these into a single overloaded `NULL` construct. Relational purists (like C.J. Date) argue that NULL violates the relational model by introducing non-associative three-valued logic and corrupting mathematical set tautologies.",
        "keyPoints": [
            "Codd originally distinguished between 'missing but existing' (I-marks) and 'inapplicable' (A-marks).",
            "SQL's single unified NULL violates mathematical boolean algebra, breaking classical laws of excluded middle.",
            "Forces every query engine to maintain special-case logic for three-valued logic (3VL) truth tables."
        ]
    },
    {
        "id": "sql-iceberg-every-operator-is-a-join",
        "term": "Every SQL Operator as a Relational Join",
        "category": "DATABASE ARCHITECTURE",
        "difficulty": "ARCHITECT",
        "definition": "The theoretical mathematical proof in relational algebra demonstrating that Selection, Projection, Union, and Intersection can be expressed as joins.",
        "explanation": "In relational theory, natural join is the universal operator. A Selection (`WHERE condition`) is mathematically equivalent to a natural join between relation R and a unary relation containing only the matching values. A Projection (`SELECT cols`) is equivalent to joining R with TABLE_DEE and dropping attributes via existential quantification. Set Intersection is a natural join of identical schemas, and Cartesian product is a join of disjoint schemas. This fundamental reduction proves that modern query engine optimization is at its core the problem of optimizing joins.",
        "keyPoints": [
            "Selection, Projection, Cartesian Product, and Intersection reduce mathematically to specialized Natural Joins.",
            "Proves that relational calculus operations can be modeled uniformly within a single join graph algebra.",
            "Highlights why join ordering, cardinality estimation, and join execution dominate query engine design."
        ]
    }
]

print(f"Prepared {len(iceberg_concepts)} new concepts.")

# Safety assertions
new_ids = {c['id'] for c in iceberg_concepts}
assert len(new_ids) == len(iceberg_concepts), "Duplicate IDs inside iceberg_concepts!"

for c in iceberg_concepts:
    assert c['id'] not in existing_ids, f"ID already exists in conceptsDb: {c['id']}"
    term_clean = c['term'].lower().strip()
    assert term_clean not in existing_terms, f"Term already exists in conceptsDb: {c['term']}"

# Append and save
data.extend(iceberg_concepts)
print(f"After append: {len(data)} (+{len(iceberg_concepts)})")

with open(FILE, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Successfully written to", FILE)
