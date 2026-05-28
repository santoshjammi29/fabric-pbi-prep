import json

sql_part2 = []

# Niche 5: High Availability, Recovery & Log Internals (20 questions)
ha_questions = [
    ("Describe the exact physical process of Database Recovery (Analysis, Redo, and Undo phases). What are the LSN (Log Sequence Number) milestones tracked in the boot page during this lifecycle?",
     "1. Analysis Phase: Scans the transaction log forward from the oldest active transaction's LSN (MinLSN) identified in the checkpoint boot page. Rebuilds the Active Transaction Table (ATT) and Dirty Page Table (DPT) in memory.\n\n"
     "2. Redo Phase: Rolls forward all logged changes (committed or uncommitted) from the oldest dirty page's LSN (RedoStartLSN) forward to the end of the log, loading pages to buffer cache to reapply physical writes.\n\n"
     "3. Undo Phase: Rolls back all uncommitted transactions identified in the ATT, scanning backward from the end of the log to restore the database to a transactionally consistent state. Boot page tracks checkpoint LSN, RedoStartLSN, and MinLSN milestones."),
    
    ("Explain the architecture of AlwaysOn Availability Groups Log Transport. Walk through the transition of a log record from the primary replica's log buffer to the secondary replica's hardening on disk.",
     "1. Capture: On the primary replica, transaction log records are written to the log buffer in memory. The Log Writer thread flushes the buffer to the primary's local `.ldf` file.\n\n"
     "2. Transport: Simultaneously, the Log Capture thread reads records from the log buffer or disk and sends them over the network (TCP 5022) to the secondary replica via the HADR sender queue.\n\n"
     "3. Hardening: On the secondary, the HADR receiver queue catches the packet. The Log Harden thread writes the log records to the secondary's local disk. Once hardened, an acknowledgment is sent back to the primary (synchronous mode)."),
    
    ("What is the internal difference between Synchronous and Asynchronous commit modes in Availability Groups? Detail the network packet acknowledgments and wait states (HADR_SYNC_COMMIT).",
     "1. Synchronous Commit: The primary replica writes to the log buffer and waits to send commit confirmation to the client until it receives a network acknowledgment from the secondary indicating that the log block has been written (hardened) to the secondary's disk. Client thread enters `HADR_SYNC_COMMIT` wait state.\n\n"
     "2. Asynchronous Commit: The primary replica commits the transaction locally and sends transaction completion confirmation to the client immediately, sending log transport packets in background threads without blocking client queries.\n\n"
     "3. Comparison: Synchronous guarantees zero data loss (RPO = 0) at the cost of network write latency. Asynchronous minimizes transaction latency but risks data loss during failover."),
    
    ("Explain the Redo Thread Pool Architecture on an AlwaysOn Secondary Replica. What causes a Redo Thread Block, and how does it impact read-only routing performance?",
     "1. Redo Thread Pool: The secondary replica spawns helper worker threads (Redo threads) to read log records from disk and reapply pages to the local buffer pool in parallel.\n\n"
     "2. Thread Block: Can occur if a reporting user on a read-only secondary replica holds a schema stability lock (Sch-S) on a table that the redo thread is trying to update (which requires a short Sch-M lock to apply changes or rebuild statistics).\n\n"
     "3. Impact: Redo blocks halt log application, causing the redo queue to grow, delaying data freshness (read-only routing displays stale data) and delaying failover recovery times."),
    
    ("Describe the internal mechanisms of Accelerated Database Recovery (ADR). How does it leverage the Logical Revert function to complete the Undo phase almost instantaneously?",
     "1. ADR Components: Uses a Persistent Version Store (PVS) inside the user database, a Logical Revert engine, and an In-Memory SLog to track metadata allocations.\n\n"
     "2. Logical Revert: During recovery, instead of scanning the log backward to undo uncommitted changes row-by-row, the recovery engine marks transactions as logically rolled back. The database is brought online instantly.\n\n"
     "3. Version Access: If a query reads a row modified by an uncommitted transaction, it retrieves the previous committed state directly from the PVS. A background cleaner thread purges the PVS versions asynchronously, reducing Undo phase duration from hours to sub-seconds."),
    
    ("Explain the Quorum Architecture in a Windows Server Failover Cluster (WSFC) hosting SQL Server. What are the mechanics of Node Majority, Disk Witness, and Cloud Witness configurations?",
     "1. WSFC Quorum: The voting mechanism that dictates whether the cluster remains online and avoids 'split-brain' states. It requires a majority of active votes (>50%).\n\n"
     "2. Node Majority: Used for odd node counts. Each server VM holds 1 vote.\n\n"
     "3. Witnesses (Even node counts): Adds a tie-breaker vote. (a) Disk Witness: A shared cluster disk folder storing cluster configuration. (b) Cloud Witness: An Azure blob storage container holding a 1-vote checkpoint file. If half of the nodes drop connection, the remaining nodes must connect to the witness to maintain quorum."),
    
    ("How does Log Shipping track synchronization states? Explain the precise role of metadata tables in the msdb database and the interaction of the backup, copy, and restore agents with the transaction log chain.",
     "1. Log Shipping Agents: (a) Backup: Runs on primary, backups log, updates `msdb.dbo.log_shipping_primary_databases`. (b) Copy: Runs on secondary, copies files, updates `msdb.dbo.log_shipping_secondary_databases`. (c) Restore: Runs on secondary, restores log.\n\n"
     "2. Metadata tables: Track `last_copied_file`, `last_restored_file`, and latency threshhold settings in `msdb` system tables.\n\n"
     "3. Alerts: A separate monitor server reads the metadata values; if the gap between primary backup and secondary restore LSNs exceeds the threshold, it triggers alerts, indicating sync chain failures."),
    
    ("Explain the Log Flush architecture. What is the relation between a user transaction COMMIT, the Log Writer thread, the physical sector size, and the sys.dm_os_wait_stats wait type WRITELOG?",
     "1. Log Flush: When a user transaction commits, the SQLOS engine must write the transaction's log records from the log buffer in RAM to disk.\n\n"
     "2. Log Writer: The single background thread that handles asynchronous disk writes for log blocks. It aligns block writes to the physical disk sector boundary (512 bytes or 4KB).\n\n"
     "3. Wait Type: The user thread requesting the commit yields and enters the `WRITELOG` wait state until the Log Writer thread receives confirmation from the disk controller that the bytes are written, guaranteeing transaction durability."),
    
    ("Describe the internal structure of an LSN (Log Sequence Number). What do the individual segments (VLF Sequence, Log Block Offset, Slot Number) mean physically?",
     "1. LSN Structure: A 10-byte binary identifier divided into three segments: `[VLF Sequence Number (4 bytes)] : [Log Block Offset (4 bytes)] : [Slot Number (2 bytes)]`.\n\n"
     "2. VLF Sequence: The sequential index of the Virtual Log File inside the `.ldf` file.\n\n"
     "3. Log Block Offset: The physical byte offset position of the starting log block inside the target VLF.\n\n"
     "4. Slot Number: The specific logical transaction record entry index inside the log block, locating the exact log instruction on disk."),
    
    ("How does Database Mirroring handle split-brain scenarios? Detail the handshake protocols executed between the Principal, Mirror, and Witness servers when network partitioning occurs.",
     "1. Handshake Protocol: Mirroring uses periodic heartbeats between the Principal, Mirror, and Witness servers.\n\n"
     "2. Network Partition: If Principal and Mirror lose connection, they contact the Witness. (a) Principal can see Witness: It retains the Principal role but enters a disconnected state, caching log writes. (b) Mirror can see Witness: They form a quorum. The Witness instructs the Mirror to failover and open as the new Principal.\n\n"
     "3. Split-Brain Avoidance: If the old Principal loses connection to both Mirror and Witness, it immediately takes itself offline, preventing split-brain writes."),
    
    ("What is the Tearing of Log Blocks? How does SQL Server detect and recover from partially written log blocks on disk during an ungraceful shutdown?",
     "1. Torn Log Block: Occurs if the server crashes mid-write, writing only a portion of a 60KB log block to disk.\n\n"
     "2. Detection: Similar to page checksums, the engine writes an sector-level parity pattern or checksum to the log block header. During database startup, the recovery engine verifies log block headers.\n\n"
     "3. Recovery: If a block fails validation, the engine stops scanning at the torn LSN boundary. It rolls back active transactions, using the next-to-last valid LSN checkpoint, ensuring no corrupted instructions are executed."),
    
    ("Explain the Read-Only Routing internal mechanism in Availability Groups. How does the routing list evaluate load balancing configurations across multiple secondary replicas?",
     "1. Routing list: Defined in the AG properties. Maps the primary connection URL to a prioritized list of secondary read-only URLs.\n\n"
     "2. Evaluator: When a client connects specifying `ApplicationIntent = ReadOnly`, the AG listener intercepts the request. It parses the routing list and routes the connection to the first active secondary.\n\n"
     "3. Load Balancing: In SQL Server 2016+, you can group URLs inside parentheses: `(Replica2, Replica3), Replica4`. This directs connections to be load-balanced randomly across the grouped replicas, scaling read operations."),
    
    ("What are Distributed Availability Groups? Detail the architectural abstraction, the role of forwarders, and how log truncation functions differently across the routing topologies.",
     "1. Abstraction: A 'cluster of clusters' linking two separate Availability Groups (e.g., local AG to remote DR AG) using separate listeners.\n\n"
     "2. Forwarder: The secondary replica in the primary AG that acts as the forwarder, capturing log streams from the primary and sending them to the remote primary replica in the second AG.\n\n"
     "3. Log Truncation: The primary log cannot truncate until all log blocks are hardened on both local replicas and the remote forwarder, extending recovery boundaries across clusters."),
    
    ("Explain Point-in-Time Recovery mechanics. How does the engine parse the transaction log up to a specific target LSN or transaction mark, and what happens to transactions that were active at that exact millisecond?",
     "1. Point-in-Time: Restores full backup, intermediate differential backups, and transaction logs in sequence using the `STOPAT = 'time'` option.\n\n"
     "2. Log Parsing: The engine reads log records sequentially during the Redo phase, applying changes. When it hits the LSN closest to the stop target, it halts the Redo process.\n\n"
     "3. Active Transactions: Any transaction that was open or uncommitted at that exact millisecond target is marked as uncommitted and is rolled back in the Undo phase, preserving data consistency."),
    
    ("Describe the operational architecture of Change Data Capture (CDC). How does the log reader agent capture transactions from the log file without affecting active transactions, and how does it handle schema evolutions?",
     "1. CDC Agent: Runs as a SQL Server Agent job utilizing the Log Reader API. It reads the transaction log asynchronously, looking for insert/update/delete operations on tables marked for CDC.\n\n"
     "2. Isolation: Reads the local log file directly, bypassing active transaction locks, avoiding operational latency.\n\n"
     "3. Schema Evolution: CDC maps changes to system tracking tables (`cdc.fn_cdc_get_all_changes_...`). If the source schema changes, CDC can maintain two capture instances simultaneously to prevent breaking downstream pipelines."),
    
    ("Explain Transaction Log Truncation. What are the exact structural factors (e.g., Replication, CDC, Mirroring, Active Transactions, Checkpoints) that can block log space reuse as tracked in sys.databases.log_reuse_wait_desc?",
     "1. Truncation: Releases inactive virtual log files (VLFs) for overwrite reuse during a log backup (Full/Bulk-Logged recovery models) or checkpoint (Simple model).\n\n"
     "2. Blocking Factors: Tracked in `sys.databases.log_reuse_wait_desc`. (a) `ACTIVE_TRANSACTION`: Long open transactions block truncation. (b) `REPLICATION`/`CDC`: Unprocessed log records cannot be truncated. (c) `DATABASE_MIRRORING`/`AVAILABILITY_GROUP`: Log blocks not hardened on the secondary replicas block truncation, causing log exhaustion."),
    
    ("What is the internal architecture of Transactional Replication Log Reader Agent? How does it interface with the transaction log to read commands marked for replication, and how does it interact with the distribution database?",
     "1. Log Reader Agent: A background job that calls the system function `sp_replcmds` to read transactions marked for replication from the transaction log.\n\n"
     "2. Ingestion: Converts log changes into equivalent SQL insert/update/delete commands.\n\n"
     "3. Distribution: Writes these commands to the Distribution database tables (`MSrepl_commands` and `MSrepl_transactions`), where the Distribution Agent reads and applies them to the subscribers."),
    
    ("Describe the function of the MinLSN. Why is it the foundational metric for determining what log data must remain active, and how does it move during an active backup operation?",
     "1. MinLSN: The oldest active log sequence number required for database recovery (the starting point of the active log).\n\n"
     "2. Boundary Metric: Defined by the minimum of: oldest active transaction LSN, oldest un-checkpointed dirty page LSN, or oldest replication/mirroring LSN.\n\n"
     "3. Backup Interaction: Active backups capture the MinLSN at backup start. The log backup must include all log records up to the maximum LSN written during the backup, updating the boot page MinLSN on completion."),
    
    ("Explain Seeding in Availability Groups (Automatic vs. Manual). Detail the VDI (Virtual Device Interface) stream architecture and allocation mechanics used during automatic seeding over the network.",
     "1. Automatic Seeding: Power BI/SQL Server creates a hidden VDI stream directly between the replicas over the network.\n\n"
     "2. Execution: The primary reads the database files, streams them via TCP to the secondary's VDI interface. The secondary receives the stream, allocates file structures, and writes pages directly, bypassing standard backup/restore media paths.\n\n"
     "3. Manual: Requires the administrator to manually execute `BACKUP DATABASE`, copy files, and run `RESTORE DATABASE ... WITH NORECOVERY` before joining the AG."),
    
    ("How does SQL Server handle Cluster Quorum Loss? What are the internal safety commands required to force a database online (ALTER DATABASE ... SET HADR FORCE_CLUSTER_ALLOW_DATA_LOSS) and what are the structural risks involved?",
     "1. Quorum Loss: If the WSFC cluster loses its witness and voting nodes, it goes offline, forcing the SQL Server AG listener offline.\n\n"
     "2. Force Command: Run `ALTER DATABASE [DB] SET HADR FORCE_CLUSTER_ALLOW_DATA_LOSS` on the remaining replica.\n\n"
     "3. Risks: Forces the replica to take ownership despite missing split-brain updates. If a partition of data was written to the old principal but not hardened, it is permanently deleted, risking database inconsistencies.")
]

# Niche 6: In-Memory OLTP (Hekaton) & Columnstore Architecture (20 questions)
memoltp_questions = [
    ("Describe the architectural design of In-Memory OLTP (Hekaton). How does it achieve lock-free and latch-free operations using MVCC (Multi-Version Concurrency Control) at the memory layer?",
     "1. Lock-free Design: In-Memory OLTP does not use traditional page structures, buffer pools, or lock managers. Records are stored as data rows allocated directly in physical memory, linked by index pointers.\n\n"
     "2. MVCC Mechanics: Rows are immutable. Updates are split into a logical delete (setting End-XID) and a physical insert (setting Begin-XID). Multiple versions of a row exist simultaneously.\n\n"
     "3. Latch-free Indexes: Uses lock-free index structures (Bw-Trees and Hash indexes) that coordinate updates using atomic CPU compare-and-swap (CAS) instructions, avoiding latch delays."),
    
    ("Explain the structural implementation of Memory-Optimized Indexes (Hash Indexes vs. Non-Clustered Indexes). How do bucket counts affect hash collisions, and how do delta-tree pointers function?",
     "1. Hash Indexes: Optimized for point lookups. Consists of a bucket array. Each bucket holds a pointer to a row chain. (2) Bucket Count tuning: Must set bucket count to 1x-2x the number of unique index keys. If set too low, hash collisions occur (multiple keys in one bucket), forcing long chains and slow scans.\n\n"
     "3. Non-Clustered Indexes (Bw-Trees): Optimized for range scans. Uses a latch-free Bw-Tree that updates nodes by appending delta pages, linking node page offsets via a mapping table updated using CAS instructions."),
    
    ("Describe the compile lifecycle of a Natively Compiled Stored Procedure. What happens when it is translated into C code and compiled into a DLL? How does it interface with the SQL Server engine?",
     "1. Native compilation: When you create a natively compiled procedure, the engine translates the T-SQL logic into C code.\n\n"
     "2. DLL Compilation: The C code is compiled into a machine-code DLL using the local C compiler. The DLL is loaded into the SQL Server process space.\n\n"
     "3. Execution: When called, the DLL runs directly on the CPU, executing query statements without query optimizer or interpreter overhead, achieving sub-microsecond execution speeds."),
    
    ("Explain the internal structure of Row Storage in Memory-Optimized Tables. How are the Begin-XID and End-XID timestamps used to validate row visibility without locks?",
     "1. Row Header: Contains 8-byte Begin-XID (transaction ID or timestamp when created) and 8-byte End-XID (transaction ID when deleted or infinity).\n\n"
     "2. Row Visibility: When transaction T reads, it compares its own start timestamp ($T_{start}$) against the row header: a row is visible if `Begin-XID <= T_start` AND `End-XID > T_start`.\n\n"
     "3. Concurrency: Multiple transactions read different versions of the row based on this logic, bypassing lock managers entirely."),
    
    ("What is a Validation Phase Failure in In-Memory OLTP transactions? Detail the conflicts that cause error 41302 (Write-Write conflict) and error 41301 (Serializable validation conflict).",
     "1. Validation Phase: In-Memory OLTP uses optimistic concurrency. Transactions execute without locks, and validate conflicts at commit time.\n\n"
     "2. Write-Write Conflict (Error 41302): Occurs if transaction A updates a row that was already updated by transaction B after A started, forcing A to abort.\n\n"
     "3. Serializable Validation Conflict (Error 41301): Under serializable isolation, validation checks if rows read during execution were modified by concurrent transactions. If yes, it aborts to prevent phantom reads."),
    
    ("Explain the architecture of Storage for Memory-Optimized Tables. How do Checkpoint and Delta file pairs (CFPs) log data to disk asynchronously, and how does the merge agent consolidate them?",
     "1. CFP Architecture: In-Memory OLTP logs data to disk using Checkpoint File Pairs (Data and Delta files).\n\n"
     "2. Data File: Stores inserted rows sequentially. (3) Delta File: Stores deleted row IDs.\n\n"
     "4. Execution: Written asynchronously by background checkpoint threads. The Merge Agent consolidates older CFP files, removing rows marked deleted in delta files and merging active data into new CFP files to optimize disk storage space."),
    
    ("Describe the internal structure of a Clustered Columnstore Index (CCI). Detail the components: Rowgroups (Compressed vs. Delta Store), Column Segments, Dictionary Storage, and Deleted Rows Bitmaps.",
     "1. CCI Structure: Splits tables into horizontal rowgroups (up to 1,048,576 rows) and vertical column segments.\n\n"
     "2. Rowgroups: (a) Compressed: Primary read-optimized data segments. (b) Delta Store: A temporary B-Tree heap that caches incoming rows before compression.\n\n"
     "3. Column Segments: Individual files containing compressed data for a single column.\n\n"
     "4. Metadata: Uses a Dictionary to store repeating strings, and a Deleted Rows Bitmap to logically delete rows from compressed segments."),
    
    ("How does Columnstore Segment Elimination work at query execution time? Explain how the metadata layer tracks minimum and maximum values for each segment to bypass scanning.",
     "1. Segment Elimination: When a query scans a columnstore index, it checks segment metadata.\n\n"
     "2. Metadata boundaries: The engine records the `Min` and `Max` values of data stored inside each column segment.\n\n"
     "3. Scan pruning: If the query predicate (e.g., `WHERE year = 2024`) does not overlap with the segment's Min/Max range (e.g., Min: 2018, Max: 2022), the engine prunes the segment, skipping page reads entirely, maximizing query speeds."),
    
    ("What is the function of the Tuple Mover process in Columnstore indexes? What are the exact conditions (e.g., row count thresholds, closed states) that cause a delta store to transition into a compressed rowgroup?",
     "1. Tuple Mover: A background thread that checks for delta store rowgroups ready for compression.\n\n"
     "2. Triggers: (a) Row count reaches 1,048,576. (b) The delta store is marked as CLOSED (cannot accept new inserts). (c) Or the administrator runs `ALTER INDEX ... REBUILD`.\n\n"
     "3. Transition: The Tuple Mover reads the closed delta store, applies VertiPaq compression algorithms, creates column segments, and drops the B-Tree delta store, transferring data to compressed rowgroups."),
    
    ("Explain Batch Mode Execution over Columnstore Indexes. How does processing data in vectors of 900-1024 rows alter CPU L1/L2 cache utilization compared to standard row-by-row iteration?",
     "1. Vectorized Execution: Batch mode processes blocks of data (vectors of 900 to 1024 rows) in a single CPU instruction instead of row-by-row.\n\n"
     "2. Cache Utilization: Vectorization stores data arrays directly in the CPU L1/L2 data cache lines, bypassing memory buses. This minimizes CPU instruction cycle waits and improves aggregation speeds by up to 10x-100x compared to Row Mode."),
    
    ("Describe the internal layout of a Columnstore Delta Store. Why is it structured as a traditional B-Tree heap combination, and how does it handle high-velocity singleton inserts?",
     "1. Delta Store Structure: Structured as a clustered B-Tree index. This allows it to handle single-row insert operations (singleton inserts) using traditional locks and page splits.\n\n"
     "2. High-velocity inserts: Incoming single inserts write to the delta store. Once it accumulates enough rows, it closes and is compressed. This isolates high-frequency write latency from the read-optimized compressed column segments."),
    
    ("What happens during a Delete and Update Operation on a Columnstore Index? Explain why deletes are logical operations (via a delete bitmap) and updates are split into a delete plus an insert.",
     "1. Deletes: Deleting rows in compressed segments is a logical operation. The engine records the row ID inside a hidden B-Tree table called the Deleted Rows Bitmap. Scans check this bitmap to exclude rows.\n\n"
     "2. Updates: Updates are split: (a) The engine inserts a delete record to the Deleted Rows Bitmap for the old row version. (b) It inserts the updated row as a new record into the delta store, optimizing write speeds."),
    
    ("Explain the internal memory governance for Columnstore Compression. What calculations determine the memory grant required to compress a 1,048,576-row group using VertiPaq compression?",
     "1. Memory Grant Calculation: The engine estimates memory based on column count, average column width, and dictionary sizes. (2) Limit check: The grant must accommodate sorting row data and building dictionaries for all columns in the rowgroup. If the memory grant is constrained by the resource governor, SQL Server will compress a smaller rowgroup size (e.g., 200K rows), reducing compression density."),
    
    ("How does In-Memory OLTP handle Garbage Collection of old row versions? Detail how the system tracks the oldest active transaction timestamp to reclaim memory without blocking active workers.",
     "1. Active Transaction Epoch: SQL Server tracks the oldest active transaction start timestamp.\n\n"
     "2. GC Sweep: As transactions commit, they generate old row versions. The garbage collection thread monitors rows where the End-XID is older than the oldest active transaction timestamp.\n\n"
     "3. Reclaiming: The GC thread detaches these obsolete row versions from indexes and deallocates the memory slots, preventing memory bloat without blocking active worker threads."),
    
    ("Describe the synchronization mechanics between In-Memory tables and an AlwaysOn Availability Group Secondary. How are log records from a memory-optimized system streamlined over the wire?",
     "1. Log Optimization: In-Memory tables do not log page structures; they log transaction commands (insert/delete values).\n\n"
     "2. Synchronization: The primary streams these optimized transaction log records to the secondary. The secondary's redo thread reads the commands and updates its in-memory tables directly. Redo threads run concurrently without lock conflicts, maintaining low synchronization lag."),
    
    ("What is Non-Durable Table configuration (DURABILITY = SCHEMA_ONLY) in Hekaton? Explain the complete bypass of the transaction log and disk subsystems and how recovery operates post-restart.",
     "1. SCHEMA_ONLY Durability: Configures the table structure to persist, but data is completely transient.\n\n"
     "2. Log Bypass: Inserting or modifying rows does not write to the transaction log, and CFP files are never written to disk, achieving extreme insert speeds.\n\n"
     "3. Recovery: During database startup, SQL Server recreates the table schema in memory. The table is brought online as empty (zero rows), bypassing crash recovery loops entirely."),
    
    ("How does the Query Optimizer evaluate Hybrids of Disk-Based and Memory-Optimized tables within a single execution plan? Explain the serialization boundaries and transaction bridges.",
     "1. Hybrid Querying: The query optimizer builds a plan containing both disk-based operators (B-Tree index seek) and memory-optimized operators.\n\n"
     "2. Transaction Bridge: Interfaced via the execution engine. Data from memory tables is serialized and streamed to standard query operators. The optimizer must align isolation levels (e.g., mapping SNAPSHOT to Read Committed) using transaction bridges."),
    
    ("Explain Columnstore Trickle Insert Optimization. How does the engine route rows into multiple delta stores simultaneously to avoid allocation locks?",
     "1. Trickle Inserts: Singleton inserts route to the active delta store rowgroup.\n\n"
     "2. Contention lock: If many threads insert simultaneously, a lock bottleneck occurs on the delta store B-Tree.\n\n"
     "3. Optimization: The engine automatically provisions multiple open delta stores (up to 10). It distributes incoming inserts randomly across these delta stores, eliminating allocation contention locks."),
    
    ("What is the physical structural difference between Global Dictionaries and Local Dictionaries inside a compressed columnstore segment? How does data cardinality control this distribution?",
     "1. Local Dictionary: Built per column segment (rowgroup scope). Stores unique values present in that segment, saving dictionary space.\n\n"
     "2. Global Dictionary: Built per table column (cross-segment scope). Stores unique values shared across all rowgroups. (3) Cardinality Control: The engine analyzes cardinality during compression: low cardinality attributes use local dictionaries; high dispersion attributes use global dictionaries."),
    
    ("Detail the limitations of Schema Updates on Memory-Optimized Tables. Why does changing a data type require a structural reallocation of the entire table in memory, and how is this executed internally?",
     "1. Type Modification: Memory tables are stored as contiguous memory segments mapped to C-struct pointers. Changing a type alters structure sizing.\n\n"
     "2. Execution: SQL Server allocates a new table structure in memory. It scans the old table, copy-converting row structures to the new memory segment. It rebuilds all index pointers and updates metadata, requiring significant RAM capacity during execution.")
]

# Niche 7: Advanced T-SQL, Graph Databases & Programmability (20 questions)
tsql_questions = [
    ("Explain the internal execution mechanics of a Recursive Common Table Expression (CTE). How does SQL Server use worktables in TempDB to track the anchor and recursive members, and what causes a query to fail with maximum recursion limits?",
     "1. CTE Execution: SQL Server executes the anchor member first, writing the resultset to a TempDB worktable.\n\n"
     "2. Recursive Loop: The engine iterates, reading rows from the worktable as input to the recursive member, writing new matches back. It continues until the query returns no rows or hits limits.\n\n"
     "3. Failure: If the loop runs beyond the maximum recursion limit (configured using `MAXRECURSION`), the engine cancels the query and rolls back the transaction to prevent infinite loops and TempDB disk exhaustion."),
    
    ("Describe the optimizer optimization known as Window Spool. How does the engine maintain state for window functions (ROW_NUMBER(), LEAD(), LAG()) in memory, and under what conditions will it write data to a TempDB worktable?",
     "1. Window Spool: A temporary buffer operator that caches rows matching a window partition (`PARTITION BY`).\n\n"
     "2. State Maintenance: If the window function only reads contiguous records (e.g., `ROW_NUMBER()`), the spool remains in memory. (3) TempDB Spill: If the window partition is large or functions require random access (e.g., `LEAD`/`LAG` accessing distant rows), the engine spools rows to a TempDB worktable, adding write latency."),
    
    ("Explain the performance and execution plan differences between CROSS APPLY / OUTER APPLY and traditional Inner/Left Joins. How does the optimizer utilize correlated evaluations to optimize apply operators?",
     "1. Joins vs Apply: Traditional joins merge static tables. `CROSS APPLY` evaluates a table-valued function or subquery for each row of the outer table.\n\n"
     "2. Correlated Evaluation: The optimizer can push parameters from the outer table into the inner query (nested loops). If the inner query is indexed, this results in seeks, which is highly efficient. In contrast, standard joins may force full scans before filtering."),
    
    ("Detail how SQL Server implements Graph Database Architectures (Node and Edge tables). What are the internal hidden columns generated ($node_id, $edge_id, $from_id, $to_id), and how are the indexes built on them structured?",
     "1. Node Table: Generates a hidden column `$node_id` containing a JSON string identifying the node. A unique index is automatically built on `$node_id`.\n\n"
     "2. Edge Table: Generates hidden columns `$edge_id`, `$from_id` (source node ID), and `$to_id` (destination node ID).\n\n"
     "3. Indexes: Built as unique clustered indexes on `$edge_id` and non-clustered indexes on `$from_id` and `$to_id` to speed up path traversal queries."),
    
    ("Explain the execution engine architecture behind the MATCH Clause in graph queries. How does the optimizer transform edge connections into relational join trees?",
     "1. MATCH Clause: Translates graph path syntax (e.g., `Node1 -(Edge)-> Node2`) into relational SQL.\n\n"
     "2. Join Trees: The optimizer converts node and edge connections into standard table joins: `Node1 JOIN Edge ON Node1.$node_id = Edge.$from_id JOIN Node2 ON Edge.$to_id = Node2.$node_id`. It cost-evaluates join orders using hash or merge joins, optimizing traversing paths."),
    
    ("What is the internal operational difference between INSTEAD OF Triggers and AFTER Triggers? How do the virtual Inserted and Deleted tables map to memory or transaction log structures in each case?",
     "1. INSTEAD OF Triggers: Executes *before* the DML instruction. The actual insert/update is bypassed. The `inserted`/`deleted` tables are built as memory worktables from the execution context. (2) AFTER Triggers: Executes *after* the DML commits to the database page buffers. The `inserted`/`deleted` tables read directly from the transaction log buffers and database cache, tracking physical page changes."),
    
    ("Explain the Output Clause Performance Anomaly. Why can using an OUTPUT clause into a table variable or permanent table restrict parallel execution zones, and how does it interact with identity keys?",
     "1. Output Anomaly: The `OUTPUT` clause streams modified rows. If outputting to a table variable, SQL Server cannot compile a parallel execution plan for the DML statement.\n\n"
     "2. Serial Execution: The engine forces serial plan execution (MAXDOP 1) to ensure transactional ordering of records, which can cause significant latency on large parallel inserts that utilize identity keys."),
    
    ("Describe the performance overhead of Scalar User-Defined Functions (UDFs) before SQL Server 2019. Detail the exact mechanics of iterative execution contexts, context switching, and row-by-row optimization barriers.",
     "1. UDF Overhead: Pre-2019, scalar UDFs executed row-by-row. (2) Context Switching: For every row, the execution engine switches from the SQL query context to the UDF runtime environment, saturating CPU registers.\n\n"
     "3. Optimization Barrier: The optimizer treats UDFs as black boxes, preventing index seeks and query parallelisms, causing slow executions. SQL Server 2019+ resolves this by inlining UDFs."),
    
    ("Explain the implementation of Temporal Tables (SYSTEM_VERSIONING). How does the engine ensure transactional consistency when splitting writes between the current table and the history table?",
     "1. Temporal Tables: Maintain a current table and a history table. (2) Consistent Write: When a row is updated or deleted, the engine automatically copies the old version to the history table in a single transaction. (3) Timestamp alignment: The engine sets the `SysStartTime` and `SysEndTime` columns using the active transaction's start timestamp, ensuring audit consistency."),
    
    ("Describe the inner workings of Dynamic Data Masking (DDM). How does the engine apply masking functions to the output stream during query execution, and why is DDM not a secure solution for underlying data encryption?",
     "1. DDM Mechanics: Applies masks (e.g., hiding credit card numbers) to column values during the final query output phase.\n\n"
     "2. Data Security: The underlying database pages store data in plain text. (3) Security Risk: Masking only affects presentation. Users with query access can construct search queries (e.g., `WHERE salary > 50000`) and deduce values by analyzing query response counts, making DDM bypassable."),
    
    ("What is the structural representation of JSON and XML Data Types inside SQL Server? Contrast the text-based storage of JSON (stored as NVARCHAR) with the tokenized parsing of native XML data types.",
     "1. JSON Storage: SQL Server stores JSON as standard text strings (`NVARCHAR`). The database engine parses JSON at runtime using helper functions (`JSON_VALUE`, `OPENJSON`).\n\n"
     "2. XML Storage: Stores XML as a tokenized binary blob in database files. The engine pre-parses XML structures, allowing faster queries using XML indexes and XPath queries, but consumes more storage space."),
    
    ("Explain the optimization of MERGE statements. What are the historical execution plan traps, concurrency bugs, and unique locking mechanisms associated with a multi-branch MERGE operator?",
     "1. MERGE Operator: Combines insert, update, and delete branches into a single statement.\n\n"
     "2. Execution Traps: Generates complex plans with multiple join and filter operators. Prone to concurrency bugs (e.g., primary key violations if multiple threads match the same key).\n\n"
     "3. Locking: Acquires strict locks on both target and source tables. Always use the `HOLDLOCK` hint to prevent isolation leakage."),
    
    ("How does SQL Server process Distributed Transactions via MSDTC? Explain the two-phase commit protocol (Prepare Phase and Commit/Abort Phase) and the tracking mechanisms used.",
     "1. Prepare Phase: The coordinator (MSDTC) queries all participating database nodes. Each node writes a prepare log record and locks resources, replying with success confirmation.\n\n"
     "2. Commit Phase: Once all nodes report ready, the coordinator writes a commit log record and instructs all nodes to commit changes. This guarantees atomicity but blocks resources if communication fails."),
    
    ("Describe the physical execution differences between UNION and UNION ALL. How does the presence of duplicates affect the memory allocation for sort operators or distinct hash matches?",
     "1. UNION: Combines datasets and eliminates duplicates. It requires allocating a Sort or Hash Match (Distinct) operator in memory to identify unique rows.\n\n"
     "2. UNION ALL: Combines datasets directly without checking for duplicates. Bypasses sorting and hashing entirely, executing with zero memory overhead and maximum data streaming throughput."),
    
    ("Explain the implementation of Row-Level Security (RLS). How does the engine inject security predicate functions into user queries, and what is the impact on plan reuse and index optimization?",
     "1. Predicate Injection: RLS uses security policies to inject filter predicates (inline table-valued functions) into user queries at compile time.\n\n"
     "2. Index Optimization: Injected filters behave as standard `WHERE` clauses, utilizing indexes.\n\n"
     "3. Plan Reuse: Can reduce plan reuse because separate users compile different query plans based on their security roles and parameters."),
    
    ("Describe the compilation and caching behavior of Table-Valued Parameters (TVPs). How do statistics track variations in row count when a TVP is passed down through nested procedure calls?",
     "1. TVP Caching: TVPs behave as table variables. They do not have statistics. (2) Cardinality: SQL Server assumes a cardinality of 1 row during compilation. If a TVP contains thousands of rows, this leads to bad memory grants and execution bottlenecks. Resolve by compiling procedures using `WITH RECOMPILE` to capture actual row counts."),
    
    ("What is the internal execution mechanism of Partitioned Views? How does the engine use CHECK constraints on underlying tables to implement compile-time startup filters?",
     "1. Partitioned View: Combines multiple tables via `UNION ALL`.\n\n"
     "2. CHECK Constraints: Each table must have a CHECK constraint defining the key range (e.g., `CHECK (Year = 2024)`).\n\n"
     "3. Startup Filters: During compilation, the optimizer analyzes the check constraints. If a query requests data for a specific year, the engine prunes the other tables, skipping execution completely."),
    
    ("Explain how SQL Server optimizes CASE WHEN expressions. Under what specific conditions will the engine evaluate short-circuiting, and when does it fail, causing runtime errors like division-by-zero despite preventive predicates?",
     "1. Short-circuiting: The optimizer compiles CASE WHEN expressions to evaluate sequentially, skipping later branches once a match is found.\n\n"
     "2. Failure: If the optimizer reorganizes the physical execution tree (e.g., pushing arithmetic checks to the scan layer), it can evaluate expressions before verifying CASE conditions, causing division-by-zero errors."),
    
    ("Detail how the FOR XML PATH string aggregation trick operates at the engine level compared to the modern STRING_AGG function. Contrast their memory consumption and sorting behaviors.",
     "1. FOR XML PATH: Uses the XML serialization engine to concatenate strings. Heavy memory overhead due to XML tokenization and character escaping.\n\n"
     "2. STRING_AGG (Optimal): A built-in aggregate function. Evaluates string concatenation in-memory using simple array builders, utilizing sort operators directly, reducing memory usage and CPU cycles by up to 5x."),
    
    ("Describe how SQL Server manages the state machine for Server Cursors (Static, Dynamic, Keyset, Forward-Only). How do keyset cursors construct their temporary membership keys in TempDB?",
     "1. Keyset Cursors: Build a keyset (unique identifiers) of all rows matching the query, storing it in a TempDB worktable. (2) Dynamic Cursors: Do not build keysets; they read pages dynamically based on current index positions. Keyset cursors ensure row updates are visible but consume substantial TempDB resources.")
]

# Niche 8: Security, Encryption, Metadata & Engine Diagnostics (20 questions)
sec_questions = [
    ("Explain the cryptographic hierarchy of Transparent Data Encryption (TDE). Detail the chain from the Windows Data Protection API (DPAPI), through the Master Key, Certificate, and Database Encryption Key (DEK). What are the physical encryption steps taken on a page prior to disk I/O?",
     "1. Cryptographic Chain: The OS DPAPI protects the Service Master Key (SMK). SMK protects the Database Master Key (DMK). DMK protects the TDE Certificate. The Certificate encrypts the Database Encryption Key (DEK) stored in the database boot page.\n\n"
     "2. Physical Encryption: When a page is flushed from the buffer pool to disk, the I/O thread encrypts the page bytes using the DEK. During page reads, the engine decrypts the page before placing it in the buffer cache."),
    
    ("Describe the architecture of Always Encrypted (Deterministic vs. Randomized). How does the client driver coordinate with the key store (e.g., Azure Key Vault) to parse parameter values before transmitting them to the SQL Server instance?",
     "1. Client Driver: Always Encrypted encryption/decryption occurs inside the client driver (e.g., ADO.NET). The database engine never sees plain text. (2) Key Store: Driver contacts Azure Key Vault to retrieve the Column Encryption Key (CEK).\n\n"
     "3. Deterministic vs Randomized: Deterministic always produces the same encrypted value for a key, allowing index seeks. Randomized produces different values, enhancing security but blocking indexing."),
    
    ("What is the internal operational difference between Database Auditing and Extended Events (XEvents) tracking? Compare their performance overhead and lock duration metrics on active worker threads.",
     "1. Database Auditing: Relies on the database audit engine to record actions. Evaluates rules synchronously, adding minor locking overhead to worker threads.\n\n"
     "2. XEvents: Uses the SQLOS events engine. Evaluates events asynchronously. Worker threads write events to a memory buffer and resume execution immediately, minimizing thread locking and operational overhead."),
    
    ("Explain SQL Server Service Broker (SSB) routing and delivery internals. How does the transmission queue in msdb safely stage messages, and how are endpoints secured via asymmetric encryption certificates?",
     "1. Transmission Queue: SSB stages outbound messages in the `msdb.sys.sysxmitqueue` table. Message delivery is transactional. (2) Endpoints: SSB endpoints listen on custom ports. Connection handshakes use asymmetric certificates to encrypt messages, validating identities before routing commands to service queues."),
    
    ("Detail how to identify and diagnose SOS_SCHEDULER_YIELD waits. What is the exact internal lifecycle of a worker thread yielding its quantum slice on a SQLOS scheduler?",
     "1. Quantum: A SQLOS thread runs on a scheduler for up to 4ms (quantum).\n\n"
     "2. Yielding: If the thread does not yield for I/O but finishes its 4ms slice, it yields voluntarly. The worker transitions from RUNNING to RUNNABLE, entering the runnable queue.\n\n"
     "3. Diagnostic: Track `SOS_SCHEDULER_YIELD` waits in `sys.dm_os_wait_stats`. High waits indicate CPU pressure and long runnable queues."),
    
    ("Explain the operational mechanics of the Query Store Plan Forcing Architecture. What system tables or memory regions track plan compatibility, and how does the engine alert a failure to force via execution events?",
     "1. Plan Forcing: Compares query hash values in Query Store tables (`sys.query_store_plan`).\n\n"
     "2. Metadata: Stores forced plan XML. During compilation, the engine attempts to apply this XML.\n\n"
     "3. Failure: If the forced plan cannot compile, the optimizer falls back to full compilation and logs warning event `ForcedPlanFailed` in Extended Events."),
    
    ("Describe the difference between sys.dm_exec_query_stats, sys.dm_exec_procedure_stats, and sys.dm_exec_trigger_stats. How does the engine track metrics for individual statement plans inside a multi-statement stored procedure?",
     "1. Query Stats: Tracks execution metrics (CPU, duration, reads) for individual statement query plans.\n\n"
     "2. Procedure/Trigger Stats: Tracks execution metrics at the object level (entire procedure or trigger execution).\n\n"
     "3. Statement tracking: SQL Server uses offset pointers (statement start and end offsets) to link individual statement query plans inside stored procedures to their stats records."),
    
    ("How does SQL Server handle Metadata Corruptions inside system tables? What are the diagnostic steps to safely locate structural defects using DBCC CHECKCATALOG?",
     "1. Metadata Corruption: Occurs if system catalog tables (e.g., `sys.sysschobjs`) have mismatched records. (2) Diagnostic: Run `DBCC CHECKCATALOG` to verify consistency. If errors are found, restore the database from a clean backup, as manual updates to system catalog tables are blocked by the engine."),
    
    ("Explain the implementation of Extensible Key Management (EKM). How does the SQL Server crypto-subsystem hand off cryptographic operations to hardware security modules (HSM) without introducing processor thread hangs?",
     "1. EKM: Integrates SQL Server encryption with external HSMs. (2) Hand-off: Uses the Cryptographic Provider API. The crypto-subsystem delegates encryption/decryption keys to the HSM driver. The driver executes key validation on the HSM appliance. SQLOS manages async worker threads to prevent provider delays from hanging engine schedulers."),
    
    ("What is the exact execution footprint of a Heavy Profiler Trace versus an Equivalent Extended Events Session? Explain why the synchronous architecture of Profiler causes thread pool exhaustion under heavy transaction loads.",
     "1. Profiler: Runs synchronously. When an event fires, the worker thread must write to the profiler buffer and wait for the tracer to process it, causing thread bottlenecks.\n\n"
     "2. Extended Events: Runs asynchronously. Worker threads write events to a ring buffer in milliseconds and continue execution, preventing thread exhaustion under heavy workloads."),
    
    ("Describe the memory tracking of Row-Level Security (RLS) Filter Predicates. How do security context switches interact with execution context caching?",
     "1. Security Context: RLS evaluates security functions under the user's execution context. (2) Cache interaction: Security context switches can cause plan cache fragmentation, as different user identities generate separate filter paths. To optimize, use session parameters inside security functions to maintain a single compiled plan."),
    
    ("Explain the internal telemetry behind Intelligent Query Processing (IQP). How does the engine store feedback metrics (Memory Grant Feedback, Cardinality Estimation Feedback) inside the Query Store?",
     "1. IQP Feedback: The execution engine tracks memory grant efficiency. If a query spills or over-allocates, the engine records feedback.\n\n"
     "2. Query Store: Stores feedback metrics (CE Feedback, Grant Feedback) in system tables. During re-compilation, the optimizer reads this feedback, adjusting memory allocation and plan choices dynamically."),
    
    ("What are Spinlock Collisions on LOCK_HASH? What diagnostic flags or DMVs do you analyze to pinpoint hash slot distribution problems in the lock manager?",
     "1. LOCK_HASH Spinlock: Lock manager uses hash slots to track lock resources. Under high parallel concurrency, multiple threads compete for the same hash slot spinlock.\n\n"
     "2. Diagnostic: Query `sys.dm_os_spinlock_stats` for `LOCK_HASH` collisions. High collisions indicate hash bucket contention, remediated by trace flags or partitioning tables."),
    
    ("Describe the architectural workflow of Contained Databases. How does user authentication bypass instance-level logins, and what are the security risks associated with collation mismatches against tempdb?",
     "1. Contained Database: Stores database settings and user passwords directly in the database file metadata, bypassing instance logins.\n\n"
     "2. Security risks: Resolving database names dynamically can fail if the database collation differs from TempDB's default collation, causing temp table join errors during user execution."),
    
    ("Explain how SQL Server processes Asymmetric Keys and Digital Signatures on stored procedures. How does code signing eliminate the requirement to grant direct SELECT/INSERT permissions to underlying base schemas?",
     "1. Code Signing: Sign the stored procedure using an Asymmetric Key or Certificate. Create a user mapped to that key, granting it permissions on the base tables.\n\n"
     "2. Execution: When a user calls the signed procedure, the engine validates the signature, executing database operations under the key-user's credentials, securing data access without direct table grants."),
    
    ("What is the function of the Dedicated Administrator Connection (DAC) scheduler? Explain how SQLOS reserves memory and scheduler capacity to allow administrative access when standard worker threads are completely exhausted.",
     "1. DAC: A dedicated connection port for administrators. (2) Resource reservation: SQLOS assigns a dedicated scheduler thread and pre-allocates memory for the DAC session. When standard schedulers are blocked, the DAC scheduler remains active, allowing administrators to kill buggy SPIDs."),
    
    ("Describe the internal layout of Extended Events (XEvents) Ring Buffer Targets. Why can massive event volumes cause truncation or packet dropping, and how do you configure memory buffers to mitigate this?",
     "1. Ring Buffer: A memory-resident XML target. Under high volumes, the buffer fills up. If the buffer is full, newer events overwrite old ones (truncation) or are discarded.\n\n"
     "2. Mitigation: Configure the `MAX_MEMORY` allocation and use file targets (`.xel`) to stream events directly to disk, avoiding memory constraints."),
    
    ("Explain System Page Latching Contention on the Metadata Catalog. What happens to query execution structures when hundreds of parallel queries concurrently attempt to parse metadata for a single database object?",
     "1. Metadata Contention: Multiple queries compiling simultaneously latch system catalog pages (e.g., `sys.sysschobjs`).\n\n"
     "2. Latch block: Threads wait under `PAGELATCH_SH` or `PAGELATCH_EX` waits. Resolve by enabling plan caching and avoiding frequent schema modifications or temporary table compilations under concurrency."),
    
    ("Describe the internal structural flags analyzed by DBCC PAGE. What are the security risks of allowing non-sysadmin users access to raw database pages via this diagnostic tool?",
     "1. DBCC PAGE: Analyzes page structures (headers, slots, values). (2) Flags: Track page allocations and record byte offsets. (3) Security Risk: Raw page reads bypass RLS, OLS, and column-level encryption, exposing sensitive data to unauthorized users. DAC or sysadmin permissions are strictly required."),
    
    ("How does SQL Server track Deadlocks via the system_health Extended Event session? What are the limits on history retention, and how does the engine write the graph payload into memory targets?",
     "1. system_health: A default Extended Event session running in the background. (2) Deadlock Capture: Captures the XML deadlock graph payload dynamically when a deadlock occurs.\n\n"
     "3. Retention: Retains events in a ring buffer and roll files (max 20MB). The XML graph details victim SPIDs, blocking queries, and lock resource descriptors.")
]

# Niche 9: Extreme Scale, Integration & Distributed Architecture (20 questions)
scale_questions = [
    ("Describe the architectural limits of Partitioning in SQL Server. What happens to the query compiler when a query crosses thousands of partitioned boundaries, and how does the engine optimize partition alignment during parallel joins?",
     "1. Partitioning limits: SQL Server supports up to 15,000 partitions per table. (2) Compiler impact: Querying many partitions forces the optimizer to evaluate metadata for each partition, causing compile time memory spikes.\n\n"
     "3. Parallel joins (Colocated joins): If two partitioned tables are joined on the partition key, the engine aligns partitions, executing joins in parallel across partition segments (colocated joins), bypassing massive shuffles."),
    
    ("Explain the performance and architectural differences between Distributed Queries using Linked Servers (OLEDB) and PolyBase Data Virtualization. How does PolyBase coordinate scale-out data movement across heterogeneous data sources?",
     "1. Linked Servers: Execute queries sequentially via OLEDB. All remote records are downloaded locally before processing, saturating memory. (2) PolyBase: Coordinates scale-out queries. Pushes query logic to remote clusters (Hadoop/Synapse) using distributed query engines. It aggregates remote partitions, returning only the final summary, optimizing WAN bandwidth."),
    
    ("Detail the internal mechanics of a Distributed Transaction Coordinator (DTC) Timeout. What happens to an \"In-Doubt Transaction\" inside the SQL Server engine, and how do you manually resolve its state?",
     "1. DTC Timeout: Occurs if a node fails to reply during a distributed commit. The transaction enters an 'in-doubt' state.\n\n"
     "2. Internal behavior: SQL Server locks the affected data pages, keeping resources blocked.\n\n"
     "3. Resolution: Monitor using `sys.dm_tran_active_transactions`. Resolve manually by executing `KILL [TransactionID] WITH COMMIT` or `ROLLBACK` to release page locks."),
    
    ("Explain how Service Broker Conversations scale across independent SQL Server instances. What are the internal queue locking protocols used when multiple activation threads read from the same service queue?",
     "1. Conversation Group: SSB uses conversation group locks. When a thread reads a queue, it locks the conversation group ID.\n\n"
     "2. Queue Locking: Multiple activation threads can read the same queue in parallel, but the engine locks messages sharing a group ID to a single thread, preventing concurrency conflicts and maintaining sequence order."),
    
    ("Describe the operational architecture of Stretched Databases. How does the remote data migration engine stream cold tables to Azure SQL Database without compromising transactional query consistency on local hot tables?",
     "1. Stretched DB: Splits tables into local hot data and remote cold data in Azure. (2) Execution: A background migration thread copies cold rows to Azure. When a user queries, the engine translates the query into a local scan and a remote query, combining results in-memory, ensuring transactional consistency."),
    
    ("Explain the internal implementation of Change Tracking (CT). How does it differ from Change Data Capture (CDC) regarding its transactional log footprint, internal tracking tables, and sync table cleanup routines?",
     "1. Change Tracking (CT): Lightweight. Tracks *only* that a row changed, storing primary keys. Incur minimal log footprint. Uses internal tracking tables updated synchronously with transactions. (2) CDC: Heavy log footprint. Stores actual changed data values. Cleanup is asynchronous via agent history jobs."),
    
    ("What is the Max Degree of Parallelism (MAXDOP) Skew anomaly? Explain how uneven data distributions across parallel threads can cause a query to become throttled by a single slow thread, and detail the wait types involved.",
     "1. Parallel Skew: Occurs if data is unevenly distributed across threads (e.g., Thread 1 gets 10 rows, Thread 2 gets 10M rows).\n\n"
     "2. Throttling: The query duration matches the slowest thread. (3) Wait types: Parallel threads wait under `CXPACKET` or `CXCONSUMER` wait types. Monitor `sys.dm_os_waiting_tasks` to identify thread data distribution skew."),
    
    ("Describe the internal behavior of Bulked Inserts over an Encrypted Table Schema. How does column-level encryption affect the data throughput of bulk copy program (BCP) applications?",
     "1. Encrypted Bulk Insert: If columns are encrypted using Always Encrypted, BCP cannot decrypt them. The source application must encrypt data columns before executing BCP.\n\n"
     "2. Throughput: Since data is already encrypted, SQL Server performs direct page writes. However, the client-side encryption step increases CPU cycles, reducing overall BCP load rates."),
    
    ("Explain the implementation of Replication Merge Agents. How do they resolve schema modifications, constraint violations, and conflicting synchronization loops across multi-master topologies?",
     "1. Merge Agent: Coordinates changes in multi-master replication. (2) Conflicts: Uses priority-based rules or custom resolvers (defined in metadata). (3) Synchronization: Tracks changes using rowguid columns. Triggers update tracking tables, preventing loops by validating originator IDs before writing updates."),
    
    ("What is the Thread Pool Exhaustion crisis (THREADPOOL wait type)? Calculate the default worker thread maximums for modern architectures, and describe the precise cascade effect on client network connection requests.",
     "1. Threadpool wait: Occurs if all worker threads are allocated. Threads wait under `THREADPOOL` waits.\n\n"
     "2. Thread count calculation: Default max workers = `512 + ((CPUs - 4) * 16)` for 64-bit systems. (3) Cascade: New connection requests are queued at the network port. If queues fill up, connections timeout, locking out administrators (remediated by using the DAC)."),
    
    ("Explain how Soft-NUMA divides physical CPUs into logical schedulers. What are the internal memory and thread allocation benefits of configuring Soft-NUMA on large multi-core physical servers?",
     "1. Soft-NUMA: Automatically divides physical CPUs into logical nodes at startup. (2) Schedulers: SQL Server maps schedulers to these logical nodes. (3) Benefits: Reduces the count of CPU cores sharing a single I/O thread pool, minimizing thread migration latency and optimizer lock contentions on large core servers."),
    
    ("Describe the performance traps of using Linked Servers with OpenQuery vs. Four-Part Naming Conventions. How does query execution planning differ when evaluating remote predicates?",
     "1. Four-Part (e.g., `Server.Db.Schema.Table`): The optimizer compiles query steps locally, downloading remote tables before applying filters, causing slow execution. (2) OpenQuery (Optimal): Forces the query string to execute entirely on the remote server, sending only the filtered results back, saving network bandwidth."),
    
    ("Explain Parallelism Deadlocks (Intra-Query Deadlocks). How can a single query thread deadlock itself across different exchange operators, and what traces pinpoint this issue?",
     "1. Intra-Query Deadlock: A parallel query deadlock where threads wait in loops. (2) Exchange deadlocks: Thread A holds a consumer buffer waiting for Thread B, which is blocked waiting for Thread A to release a resource grant. (3) Pinpointing: Analyze the XML deadlock graph looking for duplicate SPID nodes connected by exchange operators."),
    
    ("Describe the data synchronization framework of Peer-to-Peer Transactional Replication. How does the conflict detection agent utilize originator IDs to trace and drop loopback transactions?",
     "1. Originator ID: Every transaction node has an ID. When a change writes, the ID is appended. (2) Loopback Check: When the transaction propagates back to the source node, the replication agent reads the originator ID. Since it matches the local node ID, the agent drops the transaction, preventing loops."),
    
    ("Explain the internal memory allocation mechanics when parsing Massive JSON Payloads (e.g., payloads over 100MB) using OPENJSON inside a highly concurrent batch application.",
     "1. JSON Parsing: `OPENJSON` parses text string JSON arrays in-memory. (2) Allocation: The engine must allocate contiguous workspace memory. Under concurrency, parsing massive JSON payloads causes memory grant exhaustion, triggering `RESOURCE_SEMAPHORE` waits and plan cache bottlenecks."),
    
    ("Detail how SQL Server coordinates with the Windows Volume Shadow Copy Service (VSS) during a snapshot backup. What are the internal freeze and thaw phase transitions of database transactions?",
     "1. Freeze Phase: The SQL Writer service instructs SQL Server to freeze database writes. All active transactions are paused, and dirty pages are temporarily cached in memory. (2) Snapshot: The storage array takes a disk snapshot. (3) Thaw Phase: The writer thaw the database. Transactions resume page updates, completing the snapshot backup without database downtime."),
    
    ("Explain the function of Async Network I/O waits. What is happening within the network stack, client driver buffers, and SQLOS schedulers when this wait type spikes?",
     "1. Async Network I/O: Occurs when SQL Server is ready to send data but the client application is not reading it fast enough. (2) Mechanism: The network buffer fills up. The SQLOS thread yields, waiting under `ASYNC_NETWORK_IO` waits. Resolve by optimizing client processing loops or fetching smaller data chunks."),
    
    ("Describe the impact of Collation Transformations on distributed queries. Why can joining two tables across databases with different collations completely invalidate index seeks and trigger huge sort spills?",
     "1. Collation conflict: Joining columns with different collations forces the engine to run runtime type conversions. (2) Conversion penalty: This invalidates index seeks, forcing full table scans. The engine must allocate sort operators in memory to align collation patterns, causing TempDB sort spills."),
    
    ("What is the internal architecture of Query Store Runtime Statistics Generation? How are execution metrics aggregated in memory buckets before being written to disk, and how does this affect instance stability under ultra-high-throughput ad-hoc workloads?",
     "1. Statistics Buckets: Query Store caches execution statistics in memory buckets (15-minute intervals). (2) Flush: Background threads flush stats to system tables. (3) Stability: Under heavy ad-hoc workloads, compiling millions of unique queries causes bucket memory bloat, leading to database lock blocks during flushes."),
    
    ("Explain how the Query Optimizer implements Parameter Embedding Optimization via option hints. What are the internal risks to compilation times, plan cache growth, and CPU utilization under enterprise-scale processing conditions?",
     "1. Parameter Embedding: Hints like `OPTION (RECOMPILE)` instruct the optimizer to inline parameters during compilation, building custom plans. (2) Risks: Substantially increases compile time and CPU usage. It disables plan cache reuse, causing plan cache bloat and saturating compilation threads under enterprise workloads.")
]

# Niche 5 mapping
for idx, (q, a) in enumerate(ha_questions):
    sql_part2.append({
        "id": f"sql-ha-{idx+1}",
        "category": "SQL SERVER",
        "niche": "High Availability, Recovery & Log Internals",
        "question": q,
        "answer": a
    })

# Niche 6 mapping
for idx, (q, a) in enumerate(memoltp_questions):
    sql_part2.append({
        "id": f"sql-memoltp-{idx+1}",
        "category": "SQL SERVER",
        "niche": "In-Memory OLTP (Hekaton) & Columnstore Architecture",
        "question": q,
        "answer": a
    })

# Niche 7 mapping
for idx, (q, a) in enumerate(tsql_questions):
    sql_part2.append({
        "id": f"sql-tsql-{idx+1}",
        "category": "SQL SERVER",
        "niche": "Advanced T-SQL, Graph Databases & Programmability",
        "question": q,
        "answer": a
    })

# Niche 8 mapping
for idx, (q, a) in enumerate(sec_questions):
    sql_part2.append({
        "id": f"sql-sec-{idx+1}",
        "category": "SQL SERVER",
        "niche": "Security, Encryption, Metadata & Engine Diagnostics",
        "question": q,
        "answer": a
    })

# Niche 9 mapping
for idx, (q, a) in enumerate(scale_questions):
    sql_part2.append({
        "id": f"sql-scale-{idx+1}",
        "category": "SQL SERVER",
        "niche": "Extreme Scale, Integration & Distributed Architecture",
        "question": q,
        "answer": a
    })

# Write sql_part2.json
with open("/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/sql_part2.json", "w") as f:
    json.dump(sql_part2, f, indent=2)

print("SQL Part 2 JSON generated successfully. Total questions:", len(sql_part2))
