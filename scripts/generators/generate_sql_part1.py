import json

sql_part1 = []

# Niche 1: Storage Engine & Disk Architecture Internals (30 questions)
storage_questions = [
    ("Explain the exact bitwise state transitions that occur in GAM, SGAM, and PFS pages when a table drops an index versus when it is truncated.",
     "When dropping an index vs. truncating a table, the SQL Server storage engine manages space deallocation differently:\n\n"
     "1. DROP INDEX: For each extent allocated to the index, SQL Server reads the Index Allocation Map (IAM) page chain. It flips the bit corresponding to the extent in the Global Allocation Map (GAM) from 0 (allocated) to 1 (free), and in the Shared Global Allocation Map (SGAM) from 1 (allocated as mixed) or 0 to 0 (free). For each individual page in the extent, the engine modifies the Page Free Space (PFS) byte, changing the allocation bit to 0 (deallocated) and resetting the byte value representing space fullness.\n\n"
     "2. TRUNCATE TABLE: Truncate is a metadata-only operation that deallocates all extents in one transaction. It immediately clears the IAM chain. It flips the GAM bits for all extents from 0 to 1, SGAM bits to 0, and updates the PFS bytes for all pages to indicate they are empty (0% full) and deallocated. Because PFS pages are updated in bulk, this generates significantly fewer log records than row-by-row deletes, which must maintain locking and write log records for each row removed."),
    
    ("How does SQL Server handle page splits at the physical level for a clustered index with a random UNIQUEIDENTIFIER key? Describe the exact mechanism of transaction log space reservation during this event.",
     "1. Clustered index with random GUID: Inserting a random GUID clustered key causes rows to be inserted non-sequentially, which leads to physical page splits when a row is inserted into a page that is already 100% full.\n\n"
     "2. Page Split Mechanics: The engine allocates a new page via the GAM/SGAM pages. It moves approximately 50% of the rows from the original page to the new page. The index pointer structure is updated: a new row is inserted into the parent page pointing to the new child page.\n\n"
     "3. Transaction Log Reservation: Since a page split requires allocating a new page, copying rows, and updating parent pointers, it requires substantial logging. SQL Server reserves space in the active Virtual Log File (VLF) before initiating the split. If there is insufficient log reservation space, the operation fails and rolls back, preventing database corruption. This log overhead and physical I/O latency make random GUIDs highly inefficient for clustered keys."),
    
    ("What is the precise internal mechanism of the Ghost Cleanup thread? Under what exact conditions does it stall, and how does it interact with Snapshot Isolation?",
     "1. Ghost Cleanup: When a row is deleted from an index page, SQL Server does not immediately remove the bytes from the page. Instead, it marks the record's status byte as a 'ghost record' (bit 0x18 in record header). The page is flagged as having ghost records.\n\n"
     "2. The Thread: The Ghost Cleanup background thread wakes up periodically, scans pages marked with ghost records, and physically deletes the bytes, updating page pointers and PFS pages.\n\n"
     "3. Snapshot Isolation (RCSI/SI) Interaction: Under Snapshot Isolation, active transactions might require reading the old state of the deleted row from the version store. The Ghost Cleanup thread cannot purge the ghost record until all transactions that started before the deletion have completed. If a long-running transaction remains open, the Ghost Cleanup thread stalls for those pages, causing page bloat and increasing TempDB version store pressure."),
    
    ("Explain the physical storage structure of a forwarded record in a heap. What happens to the non-clustered index pointers when a forwarded record is updated multiple times or finally deleted?",
     "1. Heap Structure: Tables without a clustered index are heaps. Rows are identified by a Row Identifier (RID) consisting of FileID:PageID:SlotID. Non-clustered indexes store this RID as their lookup pointer.\n\n"
     "2. Forwarded Record: When a variable-length column is updated and the row expands beyond the page's remaining space, SQL Server moves the row data to a new page. It leaves a 'forwarding stub' (a small pointer) in the original slot, which contains the RID of the new location.\n\n"
     "3. NC Index pointers: Non-clustered indexes continue pointing to the *original* RID. When a query scans the NC index and performs a RID lookup, it hits the forwarding stub, which redirects it to the new page, adding an extra I/O hop.\n\n"
     "4. Multiple updates/deletes: If updated multiple times, the stub is updated to point directly to the latest location (no nested chains). If deleted, the engine removes both the forwarded record and the forwarding stub, updating the NC index references accordingly."),
    
    ("Detail how SQL Server manages Sparse Columns internally. How does the physical row structure change when a record exceeds the 8,060-byte limit due to a column set blob?",
     "1. Sparse Columns: Sparse columns are optimized storage for columns with high null ratios. Null values consume zero bytes.\n\n"
     "2. Row Structure change: Non-null values of sparse columns are not stored in the standard fixed/variable-length sections of the row. Instead, they are packed into a hidden, variable-length XML-like blob called the 'column set' at the end of the row.\n\n"
     "3. Page Limit: Since sparse columns are stored in this blob, if many sparse columns contain non-null values, the blob size increases. If the row size exceeds 8,060 bytes, SQL Server attempts to push the column set blob to row-overflow pages (allocation unit `ROW_OVERFLOW_DATA`), storing a 24-byte pointer in the primary page, which prevents insert failures but adds access latency."),
    
    ("Describe the difference in physical storage and retrieval mechanics between In-Row Data, Row-Overflow Data, and LOB Data allocation units. How does the Query Optimizer cost reads across these units?",
     "1. In-Row Data: Store standard records up to 8,060 bytes. Located in the `IN_ROW_DATA` allocation unit. Accessed directly in a single I/O page read.\n\n"
     "2. Row-Overflow Data: When variable-length columns (e.g., `VARCHAR(8000)`) exceed 8,060 bytes collectively, the engine pushes the largest columns to `ROW_OVERFLOW_DATA` pages, leaving a 24-byte pointer in the primary page.\n\n"
     "3. LOB Data: Stores columns defined as `VARCHAR(MAX)`, `VARBINARY(MAX)`, or XML. Located in `LOB_DATA` pages. The primary row page holds a pointer to a B-Tree root that index LOB fragments.\n\n"
     "4. Optimization Costing: The Query Optimizer costs reads based on page counts. For in-row data, it assumes sequential page scans. For row-overflow and LOB data, it assumes random I/O reads since pages are non-contiguous, which significantly inflates query costs if many rows require dereferencing these external allocations."),
    
    ("Explain the internal architecture of Virtual Log Files (VLFs). What are the exact behavioral implications of having over 10,000 VLFs on crash recovery database startup times and log truncation?",
     "1. VLF Architecture: The transaction log (`.ldf`) is logically divided into multiple physical segments called Virtual Log Files (VLFs). The size and count of VLFs are determined by the log growth increment settings.\n\n"
     "2. High VLF Count: If growth increments are small (e.g., 1MB growths), a log file that grows to 10GB will have thousands of VLFs. This is known as VLF fragmentation.\n\n"
     "3. Crash Recovery: During database startup, SQL Server performs crash recovery (Analysis, Redo, Undo phases). It must scan the metadata of every single VLF to locate the active log range. With over 10,000 VLFs, this metadata scan causes CPU saturation and extremely long startup times, keeping the database offline.\n\n"
     "4. Log Truncation: Log truncation operates at the VLF boundary. If a single active transaction spans multiple small VLFs, none of them can be truncated, increasing the risk of log exhaustion."),
    
    ("How does the Write-Ahead Logging (WAL) protocol guarantee durability during an asynchronous disk write failure? Detail the interaction between the log buffer, sector alignment, and the sys.dm_io_virtual_file_stats DMV.",
     "1. WAL Protocol: Guarantees that no data page changes (dirty pages) are written to disk before the log record describing the change has been secured on non-volatile log storage.\n\n"
     "2. Log Buffer: Log records are written to a memory space called the log buffer (max 60KB). The buffer is flushed to disk (log flush) during a transaction commit, log buffer saturation, or when checkpoint writes dirty pages.\n\n"
     "3. Sector Alignment: Flushes are aligned to disk sector boundaries (512 bytes or 4K native) to ensure atomic disk writes. If a write fails mid-flush, SQL Server detects a torn log write during startup using checksums.\n\n"
     "4. Failure and DMV tracking: If a write fails, the database remains in recovery. Monitor write latency and failures using the `sys.dm_io_virtual_file_stats` DMV, which tracks cumulative read/write times and IO stalls, helping diagnose disk controller issues."),
    
    ("What happens internally when a page is marked with a Torn Page Detection error versus a Checksum error? How does the storage engine attempt to resolve this via AlwaysOn page automatic repair?",
     "1. Torn Page Detection: An older integrity check. Splits a page into 512-byte blocks. It writes a 2-bit pattern from the page header to each block. If the bits do not match when read, it indicates a partial page write (e.g., power loss mid-write).\n\n"
     "2. Checksum: The modern integrity check. Calculates a cryptographic checksum of the entire page and writes it to the page header (slot 15). If the computed checksum does not match when read, a Checksum error is thrown (Error 824).\n\n"
     "3. Automatic Page Repair: In an AlwaysOn Availability Group, if a primary replica detects a checksum/torn page error, it requests a clean copy of the page from a secondary replica via the availability group network. Once received, the page is written to disk, repairing the corruption transparently without user impact."),
    
    ("Describe the physical layout of a database page down to the byte level. Explain how the Slot Array grows, how it handles variable-length column offsets, and the performance impact of a slot array fragmentation.",
     "1. Database Page Layout: A standard page is 8,192 bytes (8KB). It consists of:\n"
     "- 96-byte Page Header (stores page metadata, LSN, allocation info).\n"
     "- Data Rows (grows from the top down, starting at byte 97).\n"
     "- Free Space (middle of the page).\n"
     "- Slot Array (grows from the bottom up, starting at byte 8192).\n\n"
     "2. Slot Array: Each slot pointer is 2 bytes, storing the starting byte offset of a row on that page. For variable-length columns, the row payload contains a directory mapping offsets.\n\n"
     "3. Performance & Fragmentation: As rows are updated/deleted, the slot array can become fragmented, leaving unused slots. This requires page reorganization (compaction) during inserts, which consumes CPU cycles. Fragmented slots also reduce the density of page reads during table scans."),
    
    ("How does SQL Server manage Filestream and FileTable storage at the NT File System (NTFS) level? How are transactional consistency and garbage collection enforced between the relational engine and the OS file system?",
     "1. NTFS Integration: Filestream stores LOB data as physical files on an NTFS directory linked to the database files. The SQL Server database engine intercepts I/O requests.\n\n"
     "2. Transactional Consistency: The engine uses the Windows SQLOS filter driver (`RsFx`) to coordinate NTFS file locks with database transaction locks. When a database transaction commits, changes to the files are hardened.\n\n"
     "3. Garbage Collection: When a filestream record is deleted or updated, the old physical file is not deleted immediately. A background garbage collection thread scans the metadata and safely deletes orphaned NTFS files once no active transactions or backups require them."),
    
    ("Explain the difference between Dropped Table Purging in standard storage versus Accelerated Database Recovery (ADR).",
     "1. Standard Dropping: Dropping a large table requires SQL Server to lock the schema, scan the allocation maps (GAM/SGAM), and deallocate extents in a single transaction. This locks the system and generates substantial transaction log records.\n\n"
     "2. ADR Dropping: Under ADR, when a table is dropped, SQL Server immediately updates the metadata to mark the table as dropped (logical delete) and releases system locks. The actual page and file deallocation is handled asynchronously by the ADR Persistent Version Store (PVS) cleaner thread, enabling instant table drop operations without blocking concurrent workloads."),
    
    ("What are the internal structural changes in a page when a table utilizes Data Compression (ROW vs. PAGE)? Explain the symbol table and dictionary storage mechanisms within the page.",
     "1. ROW Compression: Minimizes storage of fixed-length types (e.g., integer 1 consumes 1 byte instead of 4). It strips trailing spaces from characters and removes null placeholder bytes.\n\n"
     "2. PAGE Compression: First executes ROW compression. Then, for each page, it builds:\n"
     "- Symbol Table: Identifies repeating prefix values across rows on the page and replaces them with a 1-byte reference pointer.\n"
     "- Dictionary: Identifies repeating values across the entire page, storing unique values in a dictionary header and replacing row values with short pointers.\n\n"
     "This significantly increases CPU overhead during writes but reduces disk I/O and buffer pool memory requirements."),
    
    ("How does the storage engine handle column additions with a default value when the table has billions of rows? Differentiate the metadata-only operation in enterprise editions versus the physical row modification in older or lower editions.",
     "1. Enterprise Edition (Metadata-only): In modern SQL Server editions, adding a non-null column with a default value is a metadata-only operation. The engine updates the catalog to record the new column and default value. It does not update existing pages. When a query reads a row, if the physical column byte is missing (indicating an older record), the engine returns the default value from metadata, completing the change instantly.\n\n"
     "2. Standard/Older Editions (Physical update): The engine must acquire a schema modification lock (Sch-M), parse every page, and physically insert the default value bytes into each row. For billions of rows, this causes log exhaustion, CPU saturation, and hours of downtime."),
    
    ("What are the exact triggers for Automatic Shrink processes, and why does it cause devastating index fragmentation and log generation at the engine layer?",
     "1. Auto-Shrink: Triggers when `AUTO_SHRINK` is set to True and the database has over 25% unused space.\n\n"
     "2. Internal Mechanics: The engine moves pages from the end of the data file to the first available free space near the beginning of the file. It updates allocation maps and page pointers.\n\n"
     "3. Why it causes fragmentation: Page movement ignores index logical sequences. It scatters pages randomly across the file, destroying clustered index physical ordering.\n\n"
     "4. Log Generation: Moving pages requires writing every page change and index update to the transaction log, causing log bloat, disk I/O stalls, and CPU saturation."),
    
    ("Explain the internal architecture of the Persistent Version Store (PVS) introduced in Accelerated Database Recovery (ADR). How does it differ from the traditional TempDB version store?",
     "1. TempDB Version Store: In standard snapshot isolation, row versions are written to TempDB. This creates a bottleneck on TempDB allocation pages and network buses.\n\n"
     "2. PVS Architecture: ADR's PVS stores row versions directly inside the user database where the modification occurs. Row changes write to an in-database version table.\n\n"
     "3. Benefits: Bypasses TempDB entirely, reducing TempDB contention. It allows the database crash recovery engine to read versions directly from the local PVS during recovery, reducing Redo/Undo times dramatically and ensuring constant database availability."),
    
    ("How does SQL Server manage allocations within TempDB under heavy parallel DDL load? Explain the role of page types PFS, GAM, and SGAM in allocation contention.",
     "1. Parallel DDL Contention: Creating temporary tables dynamically requires allocating pages. Multiple threads attempt to modify allocation maps simultaneously.\n\n"
     "2. Allocation maps role:\n"
     "- GAM/SGAM: Track extent allocation. Multiple threads compete to acquire locks on the single GAM page for the file.\n"
     "- PFS: Tracks page space fullness. Multiple threads compete to update PFS bytes.\n\n"
     "3. Contention: This creates PAGELATCH contention on these specific allocation pages. Mitigate by: (a) Configuring multiple TempDB data files (matching CPU count). (b) Enabling trace flag 1118 (forces uniform extent allocations) and 1117, which are native defaults in SQL Server 2016+."),
    
    ("Describe the exact memory and disk state transitions during a CheckPoint process (Indirect vs. Automatic). How does the dirty page list interact with the buffer pool?",
     "1. Checkpoint Process: Flushes dirty data pages from the buffer pool to disk.\n\n"
     "2. Automatic Checkpoint: Triggered based on the estimated time required to recover the log. SQL Server scans the entire buffer pool for dirty pages, causing I/O spikes.\n\n"
     "3. Indirect Checkpoint (Default): Uses a target recovery time (e.g., 60 seconds). The engine maintains a 'Dirty Page Manager' that continuously flushes dirty pages in small batches in the background, keeping disk write queues flat.\n\n"
     "4. State Transition: When a page is updated, it is marked 'dirty' in memory. During checkpoint, the buffer pool writes the page to disk and clears the dirty flag, updating the page's Log Sequence Number (LSN)."),
    
    ("How does SQL Server utilize the Sector Size (4K native vs. 512e) of the underlying storage system? What are the internal performance penalties when a database file is misaligned?",
     "1. Sector Sizes: Modern drives use 4KB sector sizes. To support legacy OS, some use 512-byte emulation (512e).\n\n"
     "2. Alignment Penalty: If database files are misaligned with physical 4K sectors, a single 8KB page write will span across sector boundaries (e.g., crossing 3 sectors instead of 2). This forces the disk controller to execute a read-modify-write cycle, reading the entire sector, updating bytes, and writing it back. This doubles write latency and degrades transaction throughput under heavy write loads."),
    
    ("Explain the internal mechanics of a Mirrored Write failure in SQL Server standard mirroring or storage spaces. How is the page status updated in the allocation maps?",
     "1. Mirrored Write: When writing a page to a mirrored database or parity storage pool, the write must succeed on all targets to report success.\n\n"
     "2. Failure: If one write fails, the database engine flags the mirror as suspended or marks the storage space segment as degraded. In allocation maps, the page is marked with error flags. If read later, SQL Server throws an I/O error and switches to the backup path or replica to retrieve a clean copy, maintaining transactional consistency."),
    
    ("What is the physical differences in index B-Tree layouts between a standard clustered index and a Filtered Clustered Index?",
     "1. B-Tree structure: A standard clustered index B-Tree leaf layer contains every single row of the table. Leaf pages are linked in a double-linked list.\n\n"
     "2. Filtered Clustered Index: A clustered index cannot be filtered; filters only apply to non-clustered indexes. A filtered non-clustered index B-Tree only contains rows that match the filter predicate (e.g., `WHERE status = 'Active'`). The leaf layer is smaller, reducing index depth and dictionary size, which speeds up index scans for matching rows."),
    
    ("How do the storage engine execute a Parallel Index Build? Explain the role of sort runs, sort pages, and how threads coordinate the final merge phase.",
     "1. Thread allocation: SQL Server assigns multiple worker threads to read and partition table data.\n\n"
     "2. Sort Runs: Each thread sorts its allocated subset of rows in parallel, writing intermediate sorted results (sort runs) to TempDB pages.\n\n"
     "3. Final Merge: A coordinator thread manages the merge phase. Threads read sort runs from TempDB and merge them into the final B-Tree index structure. The parent pointer pages are built from the bottom up, coordinating keys across index pages."),
    
    ("Describe the layout of a Non-Clustered Index on a Heap versus a Non-Clustered Index on a Clustered Index. What happens at the page level during a RID lookup vs. a Key lookup?",
     "1. On a Heap: The leaf node of the non-clustered index stores the Row Identifier (RID: File:Page:Slot). During a RID lookup, the engine reads the index leaf, gets the RID, and executes a direct read on that specific page and slot.\n\n"
     "2. On a Clustered Index: The leaf node of the non-clustered index stores the Clustered Key. During a Key lookup, the engine reads the NC index leaf, gets the Clustered Key, and must traverse the entire Clustered Index B-Tree from root to leaf to find the row, adding multiple page reads compared to a RID lookup."),
    
    ("Explain how SQL Server processes Bulk-Logged operations. What exactly is captured in the transaction log when an INSERT INTO ... SELECT occurs under the bulk-logged recovery model?",
     "1. Bulk-Logged Model: Minimizes logging of bulk operations. Instead of logging every row insertion, SQL Server only logs page allocations.\n\n"
     "2. What is logged: When `INSERT INTO ... SELECT` executes, SQL Server writes the page allocation map changes (GAM, SGAM, PFS updates) and IAM page details to the transaction log. The actual page content (rows) is not written. During backups, the log backup reads the allocated pages directly from the database file and appends them to the backup file, ensuring data durability."),
    
    ("How do DBCC CHECKDB commands validate structural integrity without locking user tables? Detail the mechanics of the hidden database snapshot created internally.",
     "1. Hidden Snapshot: When you execute `DBCC CHECKDB`, SQL Server creates a hidden database snapshot in the background. It uses copy-on-write technology.\n\n"
     "2. Integrity Check: `CHECKDB` scans the snapshot files to validate B-Tree link chains, allocation maps, and page checksums.\n\n"
     "3. Lock-free: Because it queries the snapshot, active user transactions on the primary database files are unaffected and do not lock the check session, ensuring 24/7 database operations without locking tables."),
    
    ("Explain the physical representation of NULL values in fixed-length versus variable-length columns inside the status bytes of a record.",
     "1. Null Bitmap: Every record header contains a Null Bitmap section. It tracks whether columns are null.\n\n"
     "2. Fixed-length columns: Still consume their full defined byte size on the page even if null. The null bitmap simply sets the column bit to 1 (null), but the physical bytes remain on the page.\n\n"
     "3. Variable-length columns: Consume zero bytes. The offset array in the record header maps the column length to 0, and the null bitmap bit is set, saving storage space."),
    
    ("What are the specific internals of Large Page Allocations (-T834)? How does it affect the OS page tables and SQL Server buffer pool initialization?",
     "1. Large Pages: By default, Windows allocates memory in 4KB pages. Enabling trace flag `-T834` forces SQL Server to allocate the buffer pool using 2MB (or large) memory pages.\n\n"
     "2. OS Page Tables: Reduces the size of the OS Translation Lookaside Buffer (TLB), speeding up memory translation. However, buffer pool startup takes longer because SQL Server must pre-allocate contiguous physical RAM from the OS, which fails if memory is fragmented."),
    
    ("Describe how SQL Server manages Extents when multiple files exist within a single filegroup. Explain the Proportional Fill algorithm and its failure points.",
     "1. Proportional Fill: When writing data, SQL Server distributes writes across all files in the filegroup. It allocates extents based on the remaining free space ratio of each file (e.g., a file with 10GB free gets twice as many writes as one with 5GB free).\n\n"
     "2. Failure: If one file grows out of space or is set to a fixed size while others autogrow, the algorithm fails, routing all writes to the autogrowing file, causing I/O hotspots and degrading storage performance."),
    
    ("What is the structural layout of an Index Allocation Map (IAM) chain? How does SQL Server traverse this chain during a table scan versus an index scan?",
     "1. IAM Chain: An IAM page tracks extents allocated to a specific table or index within a 4GB file range. Multiple IAM pages are linked in a chain.\n\n"
     "2. Table Scan: SQL Server reads the IAM chain sequentially. It retrieves the list of allocated extents, and reads pages physically in allocation order, bypassing logical pointers.\n\n"
     "3. Index Scan: The engine ignores the IAM chain. It traverses the index B-Tree, reading page pointers sequentially using the double-linked list, matching the key sort order."),
    
    ("Explain how the engine handles Partitioned Tables at the filegroup level. What are the physical steps when executing an ALTER TABLE SWITCH operation under intense concurrent workload?",
     "1. Partition Mapping: Each partition of a partitioned table maps to a specific filegroup defined in the partition scheme.\n\n"
     "2. ALTER TABLE SWITCH: A metadata-only operation. To execute, the engine must acquire a Schema Modification lock (Sch-M) on both source and target tables.\n\n"
     "3. Physical Steps: Once Sch-M is acquired, SQL Server flips the boundary pointers in the system metadata, assigning the source partition's IAM chain to the target table, and releases locks instantly, completing the partition switch in milliseconds.")
]

for idx, (q, a) in enumerate(storage_questions):
    sql_part1.append({
        "id": f"sql-storage-{idx+1}",
        "category": "SQL SERVER",
        "niche": "Storage Engine & Disk Architecture Internals",
        "question": q,
        "answer": a
    })

# Write a first version to check size, then we will append other sections
# Let's define other sections now in the same script to keep it simple!
# Niche 2: Query Optimizer & Statistics Internals (30 questions)
optimizer_questions = [
    ("Describe the exact phases of the Query Optimizer Search Engine: System Initialization, Simplification, Trivial Plan, Phase 0 (Search 0), Phase 1, and Phase 2. What triggers an early termination due to Time Out?",
     "The SQL Server Query Optimizer uses a cost-based execution plan search engine. The compilation phases are:\n\n"
     "1. System Initialization & Simplification: Parses the query, resolves object names, and performs logical simplification (e.g., converting subqueries to joins, eliminating redundant conditions).\n\n"
     "2. Trivial Plan: If only one logical plan is possible or the query is extremely simple, the engine outputs a Trivial Plan immediately, bypassing cost calculations.\n\n"
     "3. Phase 0 (Transaction Processing): Optimizes simple OLTP-style queries, looking for basic nested loops and index seeks.\n\n"
     "4. Phase 1 (Quick Plan): Explores a wider search space using common rules. If the plan cost drops below a target threshold, optimization ends.\n\n"
     "5. Phase 2 (Full Optimization): Explores all optimization rules, parallel plans, and alternative join orders.\n\n"
     "6. Time Out: If the optimizer spends too much time comparing plans without finding a better option, it triggers a 'Time Out' early termination, outputting the best plan found so far to prevent compilation delays."),
    
    ("Explain the structural representation of the Memo Structure inside the Optimizer. How are Group Expressions and Equivalence Classes utilized to evaluate alternative execution plans?",
     "1. Memo Structure: A directory structure used to store all logically equivalent execution plans generated during optimization.\n\n"
     "2. Groups & Equivalence Classes: The Memo is divided into Groups. Each Group represents a specific logical operation or sub-expression (e.g., joining Table A and Table B). Inside each group, Group Expressions represent physical implementations (e.g., Hash Join vs. Merge Join).\n\n"
     "3. Search optimization: Equivalence classes ensure that if a group is optimized once, its best physical plan is reused when evaluating parent plans, preventing the optimizer from recalculating costs for sub-queries repeatedly."),
    
    ("How does SQL Server build and evaluate a Histogram? Explain how the engine calculates density, RANGE_ROWS, EQ_ROWS, DISTINCT_RANGE_ROWS, and AVG_RANGE_ROWS for values falling between steps.",
     "1. Histogram Structure: A histogram tracks data distribution for a single column. It can have up to 200 steps (intervals).\n\n"
     "2. Evaluation: For each step, it records:\n"
     "- `RANGE_ROWS`: Number of rows falling between the current step and the previous step.\n"
     "- `EQ_ROWS`: Number of rows exactly matching the step value.\n"
     "- `DISTINCT_RANGE_ROWS`: Number of unique values in the interval.\n"
     "- `AVG_RANGE_ROWS`: Calculated as `RANGE_ROWS / DISTINCT_RANGE_ROWS`.\n\n"
     "3. Cardinality: If a query filters on a value falling between steps, the Cardinality Estimator uses `AVG_RANGE_ROWS` to calculate target selectivities, while using `EQ_ROWS` for exact step matches."),
    
    ("Explain the internal difference between Filtered Statistics and Filtered Indexes. How does the cardinality estimator handle queries whose predicates do not perfectly align with the filtered statistic definition?",
     "1. Filtered Indexes: Physical B-Tree structures containing rows matching a predicate. They include a built-in filtered statistic.\n\n"
     "2. Filtered Statistics: Metadata-only tables tracking data distribution for a subset of rows. They do not have physical indexes.\n\n"
     "3. Alignment check: If a query contains a predicate (e.g., `WHERE age > 30`), the Cardinality Estimator will check if a filtered statistic exists for `age > 30`. If the query targets `age > 40`, the estimator cannot align the stats and falls back to standard density calculations, resulting in inaccurate estimations."),
    
    ("What is the mathematical and logical difference between the Old Cardinality Estimator (7.0) and the New Cardinality Estimator (2014+) regarding independent versus correlated predicates (Exponential Smoothing vs. Base Containment)?",
     "1. Old Estimator (7.0): Assumes all predicates are completely independent. Selectivities are multiplied (`S1 * S2 * S3`). This causes severe under-estimation for correlated attributes (e.g., Make='Ford' and Model='Mustang').\n\n"
     "2. New Estimator (2014+): Implements exponential smoothing for correlated attributes. It sorts selectivities (`S1 > S2 > S3`) and calculates: `S1 * S2^0.5 * S3^0.25`, assuming partial correlation. For joins, it uses base containment assumptions, improving estimation accuracy for composite indexes."),
    
    ("Describe the exact scenario where the Optimizer chooses a Bitmap Filter in a parallel execution plan. How does it push this filter down to the storage engine scan level?",
     "1. Parallel Hash Join: When executing a large parallel hash join, the optimizer inserts a Bitmap operator on the build side of the join.\n\n"
     "2. Filter Creation: The operator builds a compact bitmap in memory representing unique join keys.\n\n"
     "3. Push Down: The optimizer pushes this bitmap filter down to the probe-side scan thread. As the storage engine scans pages, it evaluates rows against the bitmap. Rows that do not match are discarded at the page read layer before partition shuffling, reducing CPU and network transfer overhead."),
    
    ("Explain Parameter Sniffing from a memory cache perspective. How does the engine link a compiled plan to a specific execution context, and what happens during an OPTIMIZE FOR UNKNOWN hint at the structural level?",
     "1. Plan Caching: When a parameterized query runs for the first time, the optimizer sniffs the input parameter values and builds an execution plan optimized for those specific values, caching it in memory.\n\n"
     "2. Sniffing issue: Subsequent executions with different parameters reuse the cached plan, which can be highly inefficient if the new parameters require scans instead of seeks.\n\n"
     "3. OPTIMIZE FOR UNKNOWN: This hint instructs the optimizer to ignore parameter values during compile time. It uses column average densities to calculate cardinality, building a balanced plan that performs acceptably across all parameters, avoiding plan regression."),
    
    ("How does the Query Optimizer handle Join Reordering? What are the structural boundaries for left-deep, right-deep, and bushy trees during cost evaluation?",
     "1. Join Reordering: The optimizer must decide the sequence of joins (e.g., `(A join B) join C`).\n\n"
     "2. Tree Types:\n"
     "- Left-Deep: Leaves represent tables, right inputs are intermediate results. Simple to evaluate but limits parallel execution.\n"
     "- Right-Deep: Left inputs are intermediate results. Useful for hash joins.\n"
     "- Bushy: Joins intermediate tables (e.g., `(A join B) join (C join D)`). Highly complex search space.\n\n"
     "To manage compile time, the optimizer restricts its search to left-deep trees in Phase 0/1, and only evaluates bushy trees in Phase 2 under strict cost constraints."),
    
    ("Explain the Plan Forcing mechanism via Query Store. What happens at compilation time if the forced plan cannot be validated due to a missing or altered non-clustered index?",
     "1. Plan Forcing: Query Store overrides the optimizer's choices by injecting the XML execution plan of a forced plan during compile time.\n\n"
     "2. Force Failure: If an index referenced in the forced plan has been dropped, validation fails. The optimizer logs a warning (`ForcedPlanFailed` in Extended Events), discards the forced plan, and runs full optimization to build a new plan, ensuring the query executes successfully despite the missing index."),
    
    ("Describe the internal mechanics of Adaptive Joins. How does the execution engine decide at runtime whether to switch between a Hash Join and a Nested Loops Join?",
     "1. Adaptive Join Operator: The optimizer compiles an Adaptive Join operator containing both a Hash Join and a Nested Loops Join plan.\n\n"
     "2. Threshold logic: During compilation, the engine calculates a row count threshold. During execution, the probe side counts incoming rows. If row count is below the threshold, it executes a Nested Loops Join. If row count exceeds the threshold, it switches to a Hash Join, preventing performance degradation from skewed inputs."),
    
    ("What is a Hash Spill inside TempDB? Explain the concepts of hash buckets, grace hash joins, recursive partitioning, and the exact memory allocation metrics that trigger a spill.",
     "1. Memory Grant: A Hash Join allocates memory buckets to build a hash table for the build input.\n\n"
     "2. Hash Spill: If the incoming row count is under-estimated, the hash table exceeds the allocated memory grant. To prevent crashing, the engine performs a Hash Spill, writing unhashed partitions of the probe and build tables to TempDB disk.\n\n"
     "3. Grace Hash: The engine reads partitions from TempDB in blocks (grace hash joins). If partitions are still too large, it splits them recursively (recursive partitioning), generating massive TempDB I/O overhead."),
    
    ("Detail the memory architecture of a Sort Spill. Why does a sort spill require synchronous disk writes to TempDB, and how does it bypass the standard buffer pool optimizations?",
     "1. Sort Allocation: Sorting rows requires memory. The engine requests a sort workspace grant.\n\n"
     "2. Sort Spill: If the rows to sort exceed the memory grant, the engine writes sorted runs to TempDB disk.\n\n"
     "3. Synchronous Writes: Sort spills bypass the standard database buffer pool cache. The sort operator executes synchronous Direct I/O writes to TempDB, forcing the query thread to wait until physical bytes are written, causing high `IO_COMPLETION` wait times."),
    
    ("How does the Optimizer calculate the Cost Threshold for Parallelism (CTFP)? What does the unit of cost actually represent under modern CPU architectures?",
     "1. CTFP: The threshold value (default 5) compared against the estimated cost of a serial plan. If the serial plan cost exceeds CTFP, the optimizer builds a parallel plan.\n\n"
     "2. Cost Unit: The unit of cost represents the estimated time (in seconds) required to run the query on a specific 1998-era benchmark machine. On modern multi-core systems, this unit is arbitrary and obsolete. This is why the default CTFP of 5 is too low, often forcing simple queries to compile parallel plans unnecessarily."),
    
    ("Explain the difference between Static, Asynchronous, and Synchronous Statistics Updates. What are the internal engine flags that trigger an automatic update, and how does the sys.sysindexes.rowmodctr value change across versions?",
     "1. Synchronous (Default): When a query compiles and statistics are stale, compilation halts while SQL Server updates the statistics, ensuring an accurate plan but delaying query compilation.\n\n"
     "2. Asynchronous: The optimizer compiles using stale stats but spawns a background thread to update the statistics, preventing compilation delays.\n\n"
     "3. Triggers: Statistics become stale when modifications (`rowmodctr`) exceed a threshold (e.g., 20% of rows plus 500). In modern versions, the threshold is dynamic (e.g., square root of table rows), reducing stale stats issues on large tables."),
    
    ("Describe the operational mechanics of Interleaved Execution for Multi-Statement Table-Valued Functions (MSTVFs). How does it alter the execution graph at runtime?",
     "1. The issue: MSTVFs act as black boxes. Historically, the optimizer assumed a static cardinality of 1 (or 100) rows, leading to bad join plans.\n\n"
     "2. Interleaved Execution: During query compilation, when the engine encounters an MSTVF, it pauses optimization. It runs the MSTVF physically, records the actual row count, and resumes optimization, using the real cardinality to build an accurate plan."),
    
    ("Explain the concept of Deferred Compilation for table variables. What are the memory allocation differences between SQL Server 2017 and 2019+ regarding this feature?",
     "1. Table variables: Table variables do not have statistics. Historically, the optimizer assumed a cardinality of 1 row, causing memory grant starvation.\n\n"
     "2. Deferred Compilation (2019+): The optimizer defers compilation of statements referencing table variables until the first execution, capturing the actual row count in memory to allocate appropriate memory grants, resolving the 1-row assumption bottleneck."),
    
    ("What is Batch Mode on Rowstore? Describe the internal execution vectorization, memory registration, and the CPU cache line benefits compared to Row Mode.",
     "1. Row Mode: Processes rows one-by-one. High CPU instruction overhead.\n\n"
     "2. Batch Mode: Processes data in chunks of up to 900 rows (vectorization). It registers columns as arrays in memory.\n\n"
     "3. CPU benefits: Keeps data inside the CPU L1/L2 cache lines, minimizing RAM latency and instructions, speeding up scans and joins on standard rowstore tables in SQL Server 2019+."),
    
    ("Explain how the Optimizer handles Contradiction Detection. Give an example where a constraint allows the optimizer to bypass table access entirely, and detail the execution plan representation.",
     "1. Contradiction: The optimizer checks table constraints during compile time.\n\n"
     "2. Example: A table has a constraint `CHECK (Price > 0)`. A query executes: `SELECT * FROM Table WHERE Price = -10`.\n\n"
     "3. Bypassing: The optimizer detects the contradiction. It builds a plan containing a 'Constant Scan' operator and does not access the table files at all, returning zero rows instantly."),
    
    ("How does SQL Server execute Dynamic SQL caching? Differentiate between safe and unsafe queries for auto-parameterization, and how it impacts the Ad-Hoc Plan Cache.",
     "1. Safe queries: Simple queries (e.g., `SELECT * FROM Table WHERE Id = 5`) are marked safe and auto-parameterized. The plan is cached and reused.\n\n"
     "2. Unsafe queries: Queries with joins or complex filters are unsafe. SQL Server caches each ad-hoc query separately, causing Plan Cache Bloat if parameters change frequently."),
    
    ("What is the internal structure of a Query Execution Memory Grant? Explain the difference between Required Memory, Additional Memory, and Maximum Memory, and how sys.dm_exec_query_memory_grants tracks consumer components.",
     "1. Memory structure: (a) Required Memory: Minimum RAM required to start the query operators (e.g., sort buffers). (b) Additional Memory: RAM requested to execute the entire operation in-memory. (c) Maximum Memory: Upper limit allowed per query based on resource governor.\n\n"
     "2. Tracking: The DMV `sys.dm_exec_query_memory_grants` tracks active grants, queue status, and resource semaphore blocks, helping identify memory bottlenecks."),
    
    ("How does the Optimizer handle Subquery Unnesting and De-correlation? What causes a subquery to fail de-correlation, resulting in a performance-killing Nested Loops operator with a inner-side scan?",
     "1. Unnesting: The optimizer attempts to convert subqueries to standard outer joins (de-correlation) to enable hash joins.\n\n"
     "2. De-correlation failure: If the subquery uses complex row-by-row expressions or references table variables, de-correlation fails. The optimizer must compile a Nested Loops operator, executing the subquery separately for each outer row, causing high latency."),
    
    ("Explain the Nested Loops Join performance anomaly known as \"Inner Side Deadlocks\" or intensive read latency when accessing non-contiguous pages.",
     "1. Loops anomaly: When running a parallel Nested Loops join, multiple threads execute inner-side lookups. If the lookup pages are non-contiguous, threads experience high read latency waiting for I/O page faults, resulting in CPU stalls and lock delays (inner-side deadlocks) as threads wait for matching rows."),
    
    ("Describe how Merge Joins handle many-to-many relationships. Why does a many-to-many Merge Join require a TempDB worktable, whereas a one-to-many join does not?",
     "1. One-to-Many Merge: The engine reads rows in sort order. It does not need to backtrack.\n\n"
     "2. Many-to-Many Merge: If duplicate keys exist on both sides, the engine must backtrack to join every matching pair. To do this, it writes duplicate rows to a temporary worktable in TempDB, adding I/O overhead compared to one-to-many joins."),
    
    ("Explain the mechanics of Dynamic Partition Elimination. How does the execution engine determine which partitions to skip when the partitioning key is defined by an expression or runtime parameter?",
     "1. Elimination: If a query filters on the partition key, the engine skips non-matching partitions.\n\n"
     "2. Dynamic: If the filter is a parameter (`@Id`), the engine cannot eliminate partitions during compile time. During execution, the thread evaluates the parameter and updates the scan range, reading only the target partition pages dynamically."),
    
    ("What is the Query Store Async Write Flush architecture? How does the Query Store guarantee that performance data is captured without introducing transactional latency to user threads?",
     "1. Async Flush: Query Store writes execution metrics to an in-memory queue. A background writer thread flushes this queue to system tables asynchronously every 15 minutes, preventing logging tasks from blocking active query threads."),
    
    ("Explain the Plan Cache Eviction policy. What are the cost metrics assigned to plans, and how does the Lazy Writer decrement these costs during low-memory conditions?",
     "1. Plan cost: Plans in cache are assigned a cost based on compilation complexity. Under memory pressure, the Lazy Writer scans the plan cache and decrements the cost of unused plans. If cost hits 0, the plan is evicted, freeing RAM."),
    
    ("How does the Optimizer evaluate User-Defined Functions (UDF) Inlining? What are the precise architectural limitations that prevent a scalar UDF from being inlined in SQL Server 2019+?",
     "1. UDF Inlining: The optimizer converts scalar UDFs into inline subqueries during compilation.\n\n"
     "2. Limitations: Inlining fails if the UDF uses: (a) nondeterministic functions (`getdate()`), (b) table variables, (c) recursive calls, or (d) references system tables, forcing slow row-by-row UDF executions."),
    
    ("Describe the internal impact of the FORCE ORDER Hint. How does it restrict the Optimizer’s search space, and what happens to transformation rules like join commutativity?",
     "1. FORCE ORDER: Forces the optimizer to join tables in the exact order they are listed in the `FROM` clause.\n\n"
     "2. Impact: It disables join order transformation rules, restricting the search space. This can speed up compile times but prevents the optimizer from finding better join plans."),
    
    ("Explain the differences between Row Goals and standard optimization targets. How does an EXISTS clause or a TOP operator alter the optimizer's target cardinality and index choices?",
     "1. Row Goal: Instructs the optimizer to optimize for retrieving a subset of rows (e.g., TOP 10) rather than the entire dataset.\n\n"
     "2. Impact: The optimizer shifts from scan operators to seek and nested loop operators, assuming it can satisfy the query quickly, though this can regress if the row goal is not met quickly."),
    
    ("What are Optimizer Tracing Flags (e.g., TF 4199)? How do they selectively activate query optimizer hotfixes, and how are these tracked in the compiled XML execution plan metadata?",
     "1. TF 4199: Activates all query optimizer hotfixes released in service packs. These hotfixes are disabled by default to prevent plan regression. The active trace flags are logged in the XML execution plan metadata under `<QueryPlan>` tags.")
]

for idx, (q, a) in enumerate(optimizer_questions):
    sql_part1.append({
        "id": f"sql-opt-{idx+1}",
        "category": "SQL SERVER",
        "niche": "Query Optimizer & Statistics Internals",
        "question": q,
        "answer": a
    })

# Niche 3: Concurrency, Locking, Latches & Spinlocks (20 questions)
concurrency_questions = [
    ("Differentiate between a Lock, a Latch, and a Spinlock at the operating system and SQL Server engine level. Provide exact scenarios where each is deployed.",
     "SQL Server manages concurrency using three distinct synchronization mechanisms:\n\n"
     "1. Lock: Managed by the Lock Manager. Scopes databases, tables, pages, or rows. Used to guarantee logical transactional consistency (e.g., preventing two transactions from updating the same row simultaneously). Locks are held for the duration of a transaction or statement.\n\n"
     "2. Latch: Lightweight internal synchronization primitive. Used to protect physical page structures in memory (e.g., preventing a thread from modifying the page slot offsets while another thread reads it). Latches are held only for the duration of the physical memory operation (milliseconds).\n\n"
     "3. Spinlock: Low-level CPU synchronization primitive. Used when a thread needs to lock a memory structure (like a cache bucket) for a very short duration. Instead of yielding the CPU (which causes a context switch), the thread loops in CPU registers (spins) waiting for the lock to become free. High spinlock waits indicate heavy CPU utilization."),
    
    ("Explain the Lock Hierarchy (Database, File, Allocation Unit, Intent, Page, Key/Row). What are the exact metadata locks acquired when a transaction modifies a single row in a partitioned table?",
     "1. Lock Hierarchy: Locks flow from the top down. Database -> Table -> Partition (if enabled) -> Page -> Key.\n\n"
     "2. Row update lock sequence: When modifying a single row:\n"
     "- Shared (S) or Intent Shared (IS) lock at the Database level.\n"
     "- Intent Exclusive (IX) lock at the Table level.\n"
     "- Intent Exclusive (IX) lock at the Partition level.\n"
     "- Intent Exclusive (IX) lock at the Page level.\n"
     "- Exclusive (X) lock on the specific Row/Key.\n\n"
     "This hierarchy prevents concurrent transactions from acquiring conflicting structural modifications (like dropping the table) while rows are locked."),
    
    ("Describe the memory layout of the Lock Manager. How are lock hashes generated, and what is the internal performance impact of a lock hash collision?",
     "1. Lock Manager Layout: Manages active locks in a hash table structure. It allocates memory for hash buckets containing lock headers and owner blocks.\n\n"
     "2. Hash Generation: The engine generates a hash value based on the resource ID (e.g., Table ID, Page ID, or Key hash).\n\n"
     "3. Hash Collision: If multiple resources resolve to the same hash bucket, their lock blocks are chained. Under heavy concurrent workloads, collisions force threads to scan long chains to find their lock, causing lock manager CPU bottlenecks and spinlock contention on the hash buckets."),
    
    ("Explain the precise architectural workflow of Read Committed Snapshot Isolation (RCSI). How does a read query traverse the row version chain linked from the row status bits to TempDB?",
     "1. RCSI Workflow: Reads do not acquire shared locks. When a read query encounters a modified row, it reads the row version chain.\n\n"
     "2. Version chain traversal: Every row has a 14-byte row pointer in its header pointing to the target version in the TempDB Persistent Version Store. If the row status bits indicate it has been modified, the query follows the pointer to TempDB, reading the version matching the query's start time, ensuring lock-free read consistency."),
    
    ("Contrast RCSI with Snapshot Isolation (SI). How does the engine detect and throw a Write Conflict (Error 3960) in SI, and why does this error never occur in RCSI?",
     "1. RCSI: Evaluates data based on the *statement* start time. If another transaction updates a row, the read gets the committed version at statement execution time. No write conflicts occur.\n\n"
     "2. Snapshot Isolation (SI): Evaluates data based on the *transaction* start time. If a transaction attempts to update a row that was modified by another transaction after the snapshot started, a Write Conflict (Error 3960) is thrown and the transaction rolls back, preventing lost updates under optimistic concurrency."),
    
    ("What is a Deadlock? Explain the internal architecture of the Lock Monitor thread, how it builds a Wait-For Graph, and the exact criteria it uses to choose a deadlock victim.",
     "1. Deadlock: Occurs when two transactions hold locks on separate resources and each requests a lock on the other's resource, creating a circular dependency.\n\n"
     "2. Lock Monitor: A background thread that wakes up every 5 seconds (or more frequently if deadlocks occur). It scans the lock table, builds a Wait-For Graph mapping resource owners and waiters, and identifies circular paths.\n\n"
     "3. Deadlock Victim: The thread terminates the transaction that is cheapest to roll back, measured by the volume of transaction log bytes written, ensuring recovery cost is minimized."),
    
    ("Describe the internal mechanics of a Non-Invasive Deadlock Analysis via Extended Events. What do the terms lockmode, status, and waiter-list represent inside the XML deadlock graph?",
     "1. Deadlock Graph: Captured via the `xml_deadlock_report` Extended Event. It includes:\n"
     "- `lockmode`: The requested or held lock type (e.g., X, S, IX).\n"
     "- `status`: Whether the transaction holds the lock ('owner') or is waiting for it ('waiter').\n"
     "- `waiter-list`: The list of SPIDs waiting for that resource.\n\n"
     "Analyzing these parameters allows developers to identify the conflicting SQL statements and index designs causing deadlocks without running trace queries."),
    
    ("Explain Intent Locks (IS, IX, SIX). Why are they critical for preventing concurrency race conditions between DML transactions and schema modifications (Sch-M)?",
     "1. Intent Locks: Indicated at higher levels (table, page) to flag that child resources (pages, rows) hold locks.\n\n"
     "2. Race Prevention: If transaction A holds an Exclusive lock on a row, it places an Intent Exclusive (IX) lock on the parent table. If transaction B requests a Schema Modification (Sch-M) lock to alter the table structure, the Sch-M request conflicts with the IX lock at the table level. Transaction B waits, preventing structural changes while rows are being updated."),
    
    ("What is a Key-Range Lock? Detail the specific key-range lock sub-modes (RangeI-N, RangeS-S, RangeX-X) used to prevent phantom reads under the Serializable isolation level.",
     "1. Key-Range Lock: Used under the Serializable isolation level to lock the range between index keys.\n\n"
     "2. Lock Sub-modes:\n"
     "- `RangeI-N`: Insert Range lock. Locks the range between keys to prevent inserts but does not lock the keys themselves.\n"
     "- `RangeS-S`: Shared Range lock. Locks the range and keys to prevent updates and inserts during scans.\n"
     "- `RangeX-X`: Exclusive Range lock. Locks the range and keys, preventing any concurrent access.\n\n"
     "This prevents concurrent transactions from inserting new rows that match scan filters, eliminating phantom reads."),
    
    ("Explain Lock Escalation. What are the exact thresholds (Row count vs. Memory percentage) that trigger escalation, and how can lock escalation be configured to target partitions instead of the whole table?",
     "1. Lock Escalation: To save memory, SQL Server converts many individual row/page locks into a single table-level lock.\n\n"
     "2. Thresholds: Triggered if: (a) A single statement acquires more than 5,000 locks on a single table/partition. (b) Lock manager memory exceeds 40% of the database engine memory grant.\n\n"
     "3. Partition settings: Configure using `ALTER TABLE Table SET (LOCK_ESCALATION = AUTO)`. If partitioned, the locks escalate to the partition level rather than the entire table, reducing concurrency blocking on multi-partition tables."),
    
    ("What is a Latch Contention (PAGELATCH_* vs. PAGEIOLATCH_*)*? Detail how to troubleshoot high PAGELATCH_EX waits on TempDB allocation pages using system DMVs.",
     "1. PAGELATCH: Physical sync locks on memory pages. PAGELATCH contention indicates multiple threads are competing to modify the same memory page (e.g., TempDB PFS/GAM pages).\n\n"
     "2. PAGEIOLATCH: Locks page reads/writes between disk and memory. High PAGEIOLATCH waits indicate disk I/O bottlenecks.\n\n"
     "3. Troubleshooting: Query `sys.dm_os_waiting_tasks` or `sys.dm_db_page_info`. If tasks wait on page `2:1:1` (file 1, page 1 in TempDB - PFS), it indicates TempDB page contention. Mitigate by increasing TempDB file count."),
    
    ("Describe the internal structure of a Spinlock. Why do high spinlock waits (sys.dm_os_spinlock_stats) consume extreme CPU cycles without showing high wait times in sys.dm_os_wait_stats?",
     "1. Spinlock: Low-level sync locks. A thread requesting a spinlock does not yield its CPU slice. It runs in a loop (spins) checking the lock variable.\n\n"
     "2. CPU consumption: Spinning consumes 100% CPU cycles on the core. Since the thread does not yield, it does not enter a wait queue, meaning spinlock latency is not logged in `sys.dm_os_wait_stats`. Instead, track using the DMV `sys.dm_os_spinlock_stats` to locate active collision targets."),
    
    ("Explain the LCK_M_U (Update Lock) state. How does it act as an intermediary lock to prevent conversion deadlocks during read-before-update programming patterns?",
     "1. Update Lock (U): Intermediate lock. Acquired during search phases of update statements.\n\n"
     "2. Conversion Deadlock: If two transactions read a row (S lock) and then attempt to update it (requesting X lock), both wait for the other to release the S lock, causing a deadlock.\n\n"
     "3. Prevention: The U lock is compatible with S locks but incompatible with other U or X locks. Only one transaction can hold a U lock on a row, preventing conversion deadlocks as only one thread is queued to convert to X."),
    
    ("How does the engine handle Schema Stability (Sch-S) and Schema Modification (Sch-M) locks? What are the blocking dynamics when a long-running reporting query intersects with an online index rebuild?",
     "1. Sch-S: Acquired during query compilations and executions to ensure the table schema is not modified during the run.\n\n"
     "2. Sch-M: Acquired during structural modifications (e.g., ALTER TABLE, online index rebuild final phase).\n\n"
     "3. Blocking: An online index rebuild runs in the background but requires a short Sch-M lock to swap pointers at the end. If a long reporting query holds a Sch-S lock, the rebuild is blocked. The rebuild queues the Sch-M request, blocking all subsequent user queries (even simple reads), causing a cascading bottleneck."),
    
    ("Describe the internal implementation of Row-Level Locking on Columnstore Indexes. How does the engine handle delta store locking versus compressed rowgroup segment locking?",
     "1. Delta Store: Standard rowstore structure. Uses standard row-level locking (Key/Row locks) during inserts and updates.\n\n"
     "2. Compressed Rowgroups: Static read-only structures. Locking operates at the segment level. If a row is deleted, the engine acquires a shared lock on the rowgroup and writes the delete to a delta delete table, preventing segment modifications during index scans."),
    
    ("What are the concurrency implications of Foreign Key Validation? Explain the internal locks acquired on a parent table when a child table experiences mass inserts.",
     "1. Validation checks: When inserting rows into a child table, SQL Server must validate that the foreign key value exists in the parent table.\n\n"
     "2. Parent Locking: To prevent the parent key from being deleted during validation, the engine acquires a Shared (S) lock on the parent table row. Under mass parallel inserts, these S locks on parent rows can cause lock escalation and block concurrent updates on the parent table."),
    
    ("Explain how SQL Server processes a Deadlock on a Parallel Query Execution Graph. How do exchange operators (Parallelism packets) participate in intra-query deadlocks?",
     "1. Intra-Query Deadlock: Can occur within a single parallel query. Workers are partitioned into producer and consumer threads connected by Exchange operators.\n\n"
     "2. Exchange packets: If consumer threads fill up memory buffers waiting for data from producers, and producers are blocked waiting for consumer resource grants, a deadlock occurs. The lock monitor identifies the SPID and terminates the query thread, throwing error 8650."),
    
    ("What is the internal mechanism of Application Locks (sp_getapplock)? How do they map into the Lock Manager structure, and what are their scopes (Transaction vs. Session)?",
     "1. sp_getapplock: Allows developers to request custom locks on arbitrary string names.\n\n"
     "2. Lock Manager: Maps these string hashes to standard lock blocks in the lock table, evaluating compatibility rules.\n\n"
     "3. Scopes: (a) Transaction: Lock is released automatically when the transaction commits. (b) Session: Lock persists until the session closes or is manually released, enabling custom transaction orchestration."),
    
    ("Explain Lock Escalation Blocking caused by HoBT access patterns. Why does a table scan under heavy load sometimes fail to escalate, resulting in out-of-memory errors in the lock manager?",
     "1. HoBT Locks: Heap or B-Tree locks are acquired during scans. If a query scans a table while concurrent updates are modifying rows, the lock manager struggles to escalate locks because of conflicting intent locks on pages. The lock manager continues allocating memory blocks for individual locks until it runs out of memory, causing query failures."),
    
    ("Describe the physical and logical lock states when executing an Online Index Rebuild (ONLINE = ON). Explain the function of the mapping index and the temporary side-table during phase transitions.",
     "1. Online Rebuild: (a) Start: Acquires a short Sch-S lock, creates a temporary mapping index and side-table to record concurrent updates. (b) Run: Scopes data, writing to the new index while logging updates to the side-table. (c) End: Acquires a Sch-M lock, applies side-table updates, swaps pointers, and drops the old index. The side-table ensures write operations continue during the rebuild.")
]

for idx, (q, a) in enumerate(concurrency_questions):
    sql_part1.append({
        "id": f"sql-concur-{idx+1}",
        "category": "SQL SERVER",
        "niche": "Concurrency, Locking, Latches & Spinlocks",
        "question": q,
        "answer": a
    })

# Niche 4: Memory Management, TempDB & Buffer Pool (20 questions)
memory_questions = [
    ("Describe the internal architecture of the SQL Server Operating System (SQLOS) memory manager. Differentiate between Single-Page Allocations and Multi-Page Allocations across versions.",
     "1. SQLOS Memory Manager: Allocates memory for database engine needs. It is divided into nodes, clerks, and allocators.\n\n"
     "2. Allocations:\n"
     "- Single-Page (<=8KB): Managed by the buffer pool allocator. Allocates memory in standard 8KB blocks (e.g., page cache).\n"
     "- Multi-Page (>8KB): Bypasses the buffer pool. Allocates contiguous memory blocks directly from the OS (e.g., plan cache, threads).\n\n"
     "In SQL Server 2012+, the memory manager was unified. The buffer pool now manages both single and multi-page allocations, optimizing memory allocation sizes under a single pool limit."),
    
    ("What is the Buffer Pool? Detail the exact algorithm used by the Lazy Writer to track page usage (Clock Hand algorithm) and evict pages during memory pressure.",
     "1. Buffer Pool: The memory space used to cache data and index pages in RAM.\n\n"
     "2. Clock Hand Algorithm: The Lazy Writer thread scans the buffer pool pages using a clock hand sweep. Each page header has a reference count (0-250). Each sweep decrements the count. If a query accesses the page, the count increases. If the clock hand encounters a page with a count of 0 during memory pressure, the page is evicted, ensuring frequently accessed pages remain in memory."),
    
    ("Explain Memory Clerks. Identify the functions of MEMORYCLERK_SQLBUFFERPOOL, MEMORYCLERK_SQLOPTIMIZER, and CACHESTORE_SQLCP. How do you identify a memory leak in a specific clerk?",
     "1. Memory Clerks: Track memory allocations for specific components.\n\n"
     "- `MEMORYCLERK_SQLBUFFERPOOL`: Caches data and index pages.\n"
     "- `MEMORYCLERK_SQLOPTIMIZER`: Tracks memory used during query compilations.\n"
     "- `CACHESTORE_SQLCP`: Stores compiled plan cache.\n\n"
     "2. Troubleshooting: Query `sys.dm_os_memory_clerks` to monitor allocations. If a specific clerk's memory size grows continuously without releasing, it indicates a memory leak (e.g., plan cache bloat due to ad-hoc queries)."),
    
    ("Describe the Max Server Memory setting. What parts of the SQL Server process memory space are governed by this setting, and what allocations (e.g., direct OS allocations, thread stacks, linked servers) bypass it?",
     "1. Max Server Memory: Sets the upper limit for the SQLOS memory pool. It governs the buffer pool, compile cache, lock manager, and workspace memory.\n\n"
     "2. Bypassing allocations: Thread stacks (approx 2MB per thread), linked server OLEDB drivers, external backup agents, and CLR allocations run outside the SQLOS memory pool, bypassing the Max Server Memory setting. Ensure you leave 10-20% RAM free for the OS and these external allocations."),
    
    ("What is Locked Pages in Memory (LPIM)? Explain the kernel-level interaction between the Windows Memory Manager and SQLOS when LPIM is enabled versus disabled under physical RAM exhaustion.",
     "1. LPIM: A Windows policy that prevents the OS from paging out physical memory allocated to SQL Server.\n\n"
     "2. Disabled (Default): Under OS memory pressure, the Windows Memory Manager trims SQL Server's working set, writing pages to the page file on disk, causing query latency.\n\n"
     "3. Enabled: Bypasses the virtual memory page file. SQL Server locked pages cannot be swapped to disk, ensuring data remains in physical RAM, though Max Server Memory must be limited to prevent OS starvation."),
    
    ("Explain the structural organization of NUMA (Non-Uniform Memory Access) Nodes in SQL Server. How does the engine optimize local memory access, and what is a \"foreign memory allocation\"?",
     "1. NUMA structure: Divides CPUs and memory into physical nodes. A CPU accessing memory on its own node is fast (local access).\n\n"
     "2. Optimization: SQL Server assigns schedulers to NUMA nodes. When a query thread runs, the engine attempts to allocate memory buffer pages on the local node.\n\n"
     "3. Foreign allocation: If local memory is exhausted, the thread must allocate memory on a remote node (foreign allocation). This requires traversing the system interconnect, adding latency and slowing query execution."),
    
    ("What are the specific causes and internal behaviors of TempDB Allocation Contention? Explain how modern SQL Server engines utilize auto-allocation enhancements to mitigate this without trace flags.",
     "1. Causes: High parallel DDL operations (temporary tables) cause PFS, GAM, and SGAM page allocation locks.\n\n"
     "2. Mitigation: In modern versions, SQL Server automatically configures uniform extent allocation (bypasses SGAM) and enables round-robin allocations across multiple files. It automatically provisions 8 TempDB data files on installation, eliminating the need for manual trace flag 1117 and 1118 configurations."),
    
    ("Detail the architecture of Buffer Pool Extensions (BPE). How does it interact with the standard Buffer Pool, and what workloads benefit most from its secondary SSD cache?",
     "1. BPE: Extends the buffer pool using a secondary SSD cache file. It acts as a Level 2 cache.\n\n"
     "2. Interaction: The buffer manager migrates lukewarm clean pages from RAM (Level 1) to the BPE SSD file (Level 2). Dirty pages are never written to BPE. If a page is requested, it is read from the SSD. This benefits read-heavy OLTP workloads where database size exceeds physical RAM capacity."),
    
    ("Explain the physical and logical structure of TempDB. How do you identify and resolve metadata contention (PFS, GAM, SGAM) vs. object allocation contention in TempDB?",
     "1. Contention tracking: Query the DMV `sys.dm_os_waiting_tasks` for page latch waits (`PAGELATCH_UP` or `PAGELATCH_EX`).\n\n"
     "2. Metadata Contention: Waits occur on allocation pages: PFS (pages 1, 8088), GAM (page 2), SGAM (page 3). Resolve by configuring multiple TempDB files.\n\n"
     "3. Object Contention: Waits occur on user table pages (data pages of temporary tables). Resolve by rewriting queries to use table variables or CTEs instead of temporary tables, reducing write contention."),
    
    ("What is a \"Memory Grant\" in SQL Server? How does the Query Optimizer calculate the required memory grant for a query, and what are the performance impacts of memory grant timeouts vs. resource semaphores?",
     "1. Memory Grant: Workspace memory allocated for sort and hash join operations.\n\n"
     "2. Calculation: The optimizer calculates the grant based on cardinality estimates and row width. If estimates are low, the grant is small, causing spills to TempDB.\n\n"
     "3. Resource Semaphore: If many queries request large grants, the system runs out of memory. Queries wait in queue under `RESOURCE_SEMAPHORE` waits. If a query waits longer than the timeout limit, it fails, throwing a memory grant timeout error."),
    
    ("Describe the difference between the \"Lazy Writer\" thread and the \"CheckPoint\" process. How do their writing activities to disk differ, and how do they interact under heavy buffer pool utilization?",
     "1. Checkpoint: Writes all dirty pages (from active transactions) to disk in a sequential sweep, ensuring database recovery points are maintained.\n\n"
     "2. Lazy Writer: A background thread that scans the buffer pool to free memory. It evicts clean pages and writes dirty pages (from committed transactions) to disk to free slots. Under heavy utilization, the Lazy Writer runs continuously, causing high disk I/O latency."),
    
    ("What is Columnstore Index memory footprint? How does SQL Server manage memory allocation for Columnstore delta store compression vs. execution of batch mode operations?",
     "1. Delta store memory: Delta stores are rowstore heaps and use standard buffer pool memory.\n\n"
     "2. Compression allocation: Compressing a rowgroup requires allocating a large memory grant to build dictionary files. The Tuple Mover thread manages this allocation.\n\n"
     "3. Batch mode: Allocates memory vectors (buffers of 900 rows) in CPU caches to execute calculations in parallel, requiring memory grant configurations managed by resource governor."),
    
    ("Explain the internal memory mechanics of In-Memory OLTP (Hekaton). How does it allocate memory for memory-optimized tables, and how is garbage collection managed for deleted row versions?",
     "1. Memory Allocation: In-Memory OLTP uses a dedicated memory pool (`MEMORYCLERK_XTP`). Tables are stored as lock-free indexes in physical memory. No pages exist.\n\n"
     "2. Garbage Collection: Updates and deletes write new row versions. A background GC thread scans active transactions. Once a row version is no longer visible to any active transaction, the GC thread deallocates the memory slot directly, avoiding TempDB version store overhead."),
    
    ("What are the causes of \"Resource Semaphore\" waits (RESOURCE_SEMAPHORE)? How do you troubleshoot queries waiting for memory grants using dynamic management views (DMVs)?",
     "1. Causes: Occur when the total memory grants requested by concurrent queries exceed the database engine workspace limit (usually 75% of max server memory).\n\n"
     "2. Troubleshooting: Query `sys.dm_exec_query_memory_grants`. Check `grant_time` and `requested_memory_kb`. Identify which SPIDs hold large grants and which are queued, using `sys.dm_exec_sql_text` to extract the queries for indexing fixes."),
    
    ("Explain how SQL Server manages the Plan Cache. What are the criteria for plan eviction, and how do you identify plan cache bloat from ad-hoc queries?",
     "1. Plan Cache: Caches compiled query plans to skip compilation overhead.\n\n"
     "2. Eviction: Lazily evicted based on plan cost. Ad-hoc plans with low reuse cost are evicted first under memory pressure.\n\n"
     "3. Cache Bloat: Query `sys.dm_exec_cached_plans` where `usecounts = 1`. If millions of single-use ad-hoc plans exist, enable 'Optimize for Ad hoc Workloads' to cache only small stubs, protecting memory space."),
    
    ("How does SQL Server handle memory pressure (Internal vs. External)? Explain the notifications sent by the OS and how SQLOS responds to shrink its caches.",
     "1. External pressure: Windows sends a low-memory notification API event. SQLOS responds by shrinking the plan cache and releasing unused pages back to the OS.\n\n"
     "2. Internal pressure: The database engine memory clerks exceed target allocations. SQLOS triggers internal clock hand sweeps to evict pages, compile caches, and limit new memory grants to stabilize memory footprint."),
    
    ("What is the role of Virtual Address Space (VAS) in SQL Server? Explain how virtual memory fragmentation occurs and how it affects memory allocation on 64-bit systems.",
     "1. VAS: The logical address space mapped to physical memory. On 64-bit systems, VAS is virtually unlimited (8TB).\n\n"
     "2. Fragmentation: While physical RAM allocation is flexible, compiling many complex plans can segment the contiguous virtual address mappings. This can cause allocation failures for large contiguous memory grants (like sort workspaces) even if physical RAM is available."),
    
    ("Detail the inner workings of Accelerated Database Recovery (ADR) and its Persistent Version Store (PVS) memory consumption. How do you troubleshoot a scenario where PVS memory grows uncontrollably in TempDB or the user database?",
     "1. PVS Memory: ADR records version changes directly in the user database. If a transaction remains open, versions accumulate in the PVS table, causing database file growth.\n\n"
     "2. Troubleshooting: Query the DMV `sys.dm_tran_persistent_version_store_stats`. Check if `pvs_size_kb` is growing. Identify long-running transactions blocking the PVS cleaner thread and terminate them to allow cleanup."),
    
    ("How do you configure and monitor Memory-Optimized TempDB Metadata? What are the architectural trade-offs of enabling this feature in SQL Server 2019+?",
     "1. Configuration: Enable using: `ALTER SYSTEM SET MEMORY_OPTIMIZED_TEMPDB_METADATA = ON`. Requires instance restart.\n\n"
     "2. Trade-offs: Converts TempDB system tables into memory-optimized tables. This eliminates PFS/GAM page contention for metadata operations. However, it disables some query features (like using table variables in cross-database queries) and increases system memory utilization."),
    
    ("Explain how the \"Dirty Page Table\" and \"Active Transaction Map\" are managed in memory during crash recovery. How does the Redo and Undo phase utilize memory buffers?",
     "1. Active Transaction Map (ATM): Stores details of active transactions during crash. Dirty Page Table (DPT) tracks unwritten pages.\n\n"
     "2. Analysis Phase: Scans the log to rebuild ATM and DPT in memory.\n\n"
     "3. Redo Phase: Reads DPT, loads pages into memory buffers, and applies all changes (redo) up to the crash point.\n\n"
     "4. Undo Phase: Uses ATM to locate uncommitted transactions, reading memory buffers and reversing changes (undo), restoring consistency.")
]

for idx, (q, a) in enumerate(memory_questions):
    sql_part1.append({
        "id": f"sql-mem-{idx+1}",
        "category": "SQL SERVER",
        "niche": "Memory Management, TempDB & Buffer Pool",
        "question": q,
        "answer": a
    })

# Write sql_part1.json
with open("/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/sql_part1.json", "w") as f:
    json.dump(sql_part1, f, indent=2)

print("SQL Part 1 JSON generated successfully.")
print("Total SQL Server questions:", len(sql_part1))
