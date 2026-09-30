# scripts/data_patches/fix_semantic_duplicates_32.py
"""
Bespoke, expert-level synthesized Master Questions for the 32 Semantic Duplicate Clusters.
Each item merges overlapping questions into a single Master Question preserving all technical nuances,
re-calibrates difficulty tags, standardizes domain & subdomain hierarchies, and records mergedFrom IDs.
"""

def get_semantic_duplicate_fixes():
    return {
        # 1. Direct Lake vs Import vs DirectQuery
        "medium-fabric-7": {
            "merged_from": ["medium-fabric-7", "onelake-31"],
            "item": {
                "id": "medium-fabric-7",
                "question": "How does Direct Lake mode in Microsoft Fabric differ from traditional Import and DirectQuery modes in Power BI?",
                "answer": """Direct Lake is a ground-breaking Fabric-native storage mode that combines the blazing sub-second query performance of Import mode with the real-time latency and zero-copy footprint of DirectQuery:

1. **Architecture & Data Movement**:
   - **Import Mode**: Extracts data from source systems and loads it into Power BI's in-memory VertiPaq columnar engine. Delivers maximum DAX performance but requires scheduled refreshes, duplicates data into proprietary `.abf` files, and is bounded by capacity RAM limits.
   - **DirectQuery Mode**: Leaves data in the underlying relational source (e.g., Azure SQL, Snowflake). Translates incoming DAX visual queries on the fly into native SQL dialects. Zero data duplication, but queries suffer high network/compute latency, lack many DAX optimizations, and easily saturate database connections under high visual concurrency.
   - **Direct Lake Mode**: Power BI's VertiPaq engine loads Delta Parquet columnar files directly from OneLake storage into memory on demand without executing SQL translations or running scheduled ETL imports. It reads the Delta transaction log and column metadata directly.

2. **Framing & Paging**:
   - When a user interacts with a report, VertiPaq pages column segments directly into memory from OneLake Delta tables. Unreferenced columns remain on disk, drastically reducing memory overhead.

3. **Fallback Behavior**:
   - If a query hits unsupported DAX features (such as certain calculated columns or complex row-level security expressions not evaluable in Direct Lake), or if table size exceeds SKU memory guardrails, the semantic model automatically falls back to DirectQuery mode via the Lakehouse SQL Analytics Endpoint.""",
                "difficulty": "HARD",
                "category": "FABRIC",
                "domain": "Analytics, BI & AI",
                "subdomain": "Power BI Modeling & Optimization",
                "mergedFrom": ["medium-fabric-7", "onelake-31"]
            }
        },

        # 2. Fabric Lakehouse vs Warehouse
        "medium-fabric-55": {
            "merged_from": ["medium-fabric-55", "onelake-41"],
            "item": {
                "id": "medium-fabric-55",
                "question": "What are the architectural differences between a Lakehouse and a Data Warehouse in Microsoft Fabric, and when should you choose each?",
                "answer": """Both Fabric Lakehouse and Warehouse store all tabular data as open-format Delta Parquet files in OneLake and share the cross-engine distributed SQL query processor. However, their execution models, persona targeting, and compute paradigms diverge significantly:

1. **Storage Topology & Access Modes**:
   - **Fabric Lakehouse**: Exposes two zones—`Files` (raw unmanaged landing zone for semi-structured/unstructured data like JSON, CSV, images) and `Tables` (managed Delta Lake tables). Offers multi-engine read/write access: Apache Spark (PySpark, Scala, Spark SQL), Lakehouse REST APIs, and a read-only SQL Analytics Endpoint automatically synced via the OneLake catalog.
   - **Fabric Warehouse**: An enterprise data warehouse item optimized for T-SQL engineers. All ingested tables are strictly managed Delta tables. Supports full multi-table ACID transactions, cross-database queries, primary/foreign key constraints (informational), and native T-SQL DML (`INSERT`, `UPDATE`, `DELETE`, `MERGE`).

2. **Compute Engines**:
   - **Lakehouse**: Primary compute is Spark (serverless custom pools with sub-minute startup). Best for data engineering, unstructured parsing, deep data science/ML (MLflow, SynapseML), and high-throughput streaming ingestion.
   - **Warehouse**: Powered by the autonomous distributed T-SQL engine with dynamic resource allocation. Best for SQL-centric data modeling, Kimball dimensional architectures, and enterprise reporting where ACID compliance and familiar relational syntax are required.

3. **Security Model**:
   - Lakehouse supports OneLake data access roles and Spark table security.
   - Warehouse provides granular database-level security including T-SQL GRANT/REVOKE, Row-Level Security (RLS), Column-Level Security (CLS), and Dynamic Data Masking (DDM).""",
                "difficulty": "HARD",
                "category": "FABRIC",
                "domain": "Analytics, BI & AI",
                "subdomain": "Fabric Architecture & Storage",
                "mergedFrom": ["medium-fabric-55", "onelake-41"]
            }
        },

        # 3. OneLake Data Hub / Catalog
        "medium-fabric-6": {
            "merged_from": ["medium-fabric-6", "onelake-53"],
            "item": {
                "id": "medium-fabric-6",
                "question": "What is the OneLake Catalog (formerly OneLake Data Hub) in Microsoft Fabric, and what governance capabilities does it provide?",
                "answer": """The OneLake Catalog (formerly known as the OneLake Data Hub) serves as the unified discovery, governance, and data democratization interface across the entire Microsoft Fabric tenant:

1. **Centralized Data Asset Discovery**:
   - Aggregates all accessible data items across workspaces—including Lakehouses, Warehouses, Semantic Models, KQL Databases, Datamarts, and Mirrored Databases—into an intuitive, searchable catalog.
   - Eliminates data silos and redundant pipeline creation by allowing data consumers, analysts, and report authors to locate existing verified datasets before requesting new data engineering pipelines.

2. **Endorsement & Governance Badges**:
   - Supports enterprise governance workflows through **Endorsement tags**:
     - *Promoted*: Verified by workspace contributors as reliable, validated data.
     - *Certified*: Formally vetted by enterprise tenant governance stewards/admins, signaling production compliance and highest quality standards.
   - Integrated with Microsoft Purview for automatic sensitivity labeling, data classification, and end-to-end lineage visualization from source ingestion to downstream Power BI reports.

3. **Zero-Copy Sharing & Shortcuts**:
   - Enables users to browse schema definitions, sample records, and trigger OneLake Shortcuts directly from the catalog. Users can link certified tables into their own analytical workspaces without copying or duplicating underlying storage.""",
                "difficulty": "MEDIUM",
                "category": "FABRIC",
                "domain": "Analytics, BI & AI",
                "subdomain": "Data Governance & Cataloging",
                "mergedFrom": ["medium-fabric-6", "onelake-53"]
            }
        },

        # 4. V-Order Optimization
        "fabricspark-37": {
            "merged_from": ["medium-datalake-41", "fabricspark-37"],
            "item": {
                "id": "fabricspark-37",
                "question": "What is V-Order write-time optimization in Microsoft Fabric, how does its internal serialization work, and why is it critical for Direct Lake and SQL performance?",
                "answer": """V-Order is Microsoft Fabric's proprietary, write-time columnar layout optimization applied to Parquet files written by Fabric Spark and the Warehouse engines:

1. **Internal Serialization Mechanics**:
   - Standard open-source Apache Parquet files store columns as independent chunks within row groups, compressed via Snappy or ZSTD and dictionary-encoded. However, row ordering inside row groups is determined arbitrarily by ingestion arrival order.
   - V-Order analyzes column statistics across row groups and performs sophisticated multi-dimensional dictionary sorting and re-encoding. By sorting rows based on column cardinality and frequency distribution, identical values cluster together contiguously.
   - This significantly increases run-length encoding (RLE) efficiency, bit-packing density, and compression ratios without violating the open Parquet format specification (any open-source Parquet reader can read V-Ordered files).

2. **Impact on Direct Lake & VertiPaq**:
   - Power BI's VertiPaq in-memory engine uses identical columnar data layout algorithms. When a Direct Lake semantic model accesses a V-Ordered Parquet file in OneLake, VertiPaq performs zero-overhead direct memory mapping (paging column chunks straight into CPU memory without transposition or format conversion), achieving native Import-mode query speeds.

3. **Impact on SQL Analytics Endpoint & Warehouse**:
   - The distributed SQL query engine uses V-Order metadata for extreme Min/Max dictionary pruning and SIMD vectorized vector scans, reducing I/O and query latency by up to 10x.

4. **Write-Time Trade-off**:
   - Applying V-Order introduces approximately 10–15% CPU write overhead during ingestion/compaction, making it a conscious trade-off: higher compute cost during write in exchange for orders-of-magnitude faster read performance.""",
                "difficulty": "HARD",
                "category": "FABRIC",
                "domain": "Analytics, BI & AI",
                "subdomain": "Delta Lake & Storage Internals",
                "mergedFrom": ["medium-datalake-41", "fabricspark-37"]
            }
        },

        # 5. Power Query Query Folding
        "pbi-easy-1": {
            "merged_from": ["pbi-easy-1", "medium-pbi-11"],
            "item": {
                "id": "pbi-easy-1",
                "question": "What is Query Folding in Power Query, why is it critical for ETL performance, and how do you diagnose when it breaks?",
                "answer": """Query Folding is Power Query's ability to translate its functional M language transformation steps into a single, optimized native database query (such as SQL, OData, or KQL) and push execution back to the source database engine:

1. **Core Architectural Benefits**:
   - **Source-Side Pushdown**: Filtering (`Table.SelectRows`), column projection (`Table.SelectColumns`), joins, and aggregations run directly on the source database server's optimized indexing and compute engines.
   - **Drastic Network & Memory Reduction**: Prevents transferring millions of unneeded records over the network to the Power BI Desktop client or on-premises data gateway.
   - **Prerequisite for Incremental Refresh**: Power BI incremental refresh partitions depend strictly on query folding to generate partition SQL filters (e.g., `RangeStart` and `RangeEnd`). If query folding breaks, incremental refresh fails.

2. **What Breaks Query Folding**:
   - Transforming column data types using non-standard M functions.
   - Merging or joining tables originating from disparate data sources (e.g., SQL table joined with Excel sheet).
   - Inserting non-foldable functions like `Table.AddIndexColumn`, `Text.Clean`, or custom M script steps before filtering steps.
   - Native SQL queries containing trailing semicolons or complex stored procedure executions.

3. **Diagnostic Technique**:
   - In Power Query Editor, right-click any applied transformation step in the 'Applied Steps' list. If **'View Native Query'** is clickable, the step folds. If greyed out, folding has broken at or before that step.""",
                "difficulty": "MEDIUM",
                "category": "POWER BI",
                "domain": "Analytics, BI & AI",
                "subdomain": "Power BI Modeling & Optimization",
                "mergedFrom": ["pbi-easy-1", "medium-pbi-11"]
            }
        },

        # 6. Active vs Inactive Relationships
        "pbi-easy-8": {
            "merged_from": ["pbi-easy-8", "medium-pbi-4"],
            "item": {
                "id": "pbi-easy-8",
                "question": "What is the difference between Active and Inactive relationships in Power BI, and how do you leverage USERELATIONSHIP in DAX?",
                "answer": """In Power BI dimensional modeling, relationships define filter propagation paths between tables:

1. **Active Relationships**:
   - Represented by a solid line in the model diagram.
   - Automatically and unconditionally propagates cross-filtering context across tables during report visual rendering.
   - Strict Ambiguity Rule: Only **one active relationship** can exist between any two tables at any given time to guarantee a single, deterministic filter path without ambiguity.

2. **Inactive Relationships**:
   - Represented by a dashed line in the model diagram.
   - Does not propagate filter context by default. Exists purely as a modeled schema definition to handle role-playing dimensional scenarios (e.g., a Sales fact table having `OrderDateKey`, `ShipDateKey`, and `DueDateKey` all referencing the same `DimDate` table).

3. **Activating via DAX (`USERELATIONSHIP`)**:
   - Inactive relationships are activated dynamically inside specific measure calculations using the `USERELATIONSHIP()` modifier inside `CALCULATE()`:
```dax
Shipped Sales = 
CALCULATE(
    SUM(FactSales[SalesAmount]),
    USERELATIONSHIP(FactSales[ShipDateKey], DimDate[DateKey])
)
```
   - When evaluated, `CALCULATE` temporarily deactivates the primary active relationship (`OrderDateKey`) for that calculation context and activates the specified inactive relationship, producing accurate metrics without table duplication.""",
                "difficulty": "EASY",
                "category": "POWER BI",
                "domain": "Analytics, BI & AI",
                "subdomain": "Power BI Modeling & Optimization",
                "mergedFrom": ["pbi-easy-8", "medium-pbi-4"]
            }
        },

        # 7. Performance Analyzer
        "pbi-easy-5": {
            "merged_from": ["pbi-easy-5", "medium-pbi-83"],
            "item": {
                "id": "pbi-easy-5",
                "question": "What is the Performance Analyzer in Power BI Desktop, what metric components does it track, and how is it used to optimize report pages?",
                "answer": """The Performance Analyzer is a built-in diagnostic and profiling tool within Power BI Desktop (accessible via the `Optimize` or `View` ribbon) that logs and breakdowns the precise execution duration of every visual, slicer, and card on a report page:

1. **Metric Breakdown per Visual**:
   - **DAX Query (ms)**: The duration required for the VertiPaq or DirectQuery engine to evaluate the DAX expression, generate query plans, scan storage segments, and return the aggregated dataset. High values indicate unoptimized measures (e.g., unindexed iterators, excessive `FILTER()` calls).
   - **Visual Display (ms)**: The time required by the Power BI UI rendering engine (WebView2/Chromium) to plot visual elements, draw canvas shapes, render axes, and format labels. High values indicate too many data points, complex multi-card layouts, or SVG overhead.
   - **Other (ms)**: The time spent waiting in the internal visual execution queue, preparing queries, executing background thread synchronization, or waiting for preceding visual network calls. High values typically indicate excessive visuals on a single page (e.g., >25 cards/charts competing for query thread pools).

2. **Diagnostic & Tuning Workflow**:
   - Click 'Start Recording' and 'Refresh visuals'.
   - Identify visuals with total duration > 1,000 ms.
   - Click **'Copy Query'** on slow visuals to extract the exact generated DAX query and paste it directly into DAX Studio to analyze Storage Engine (SE) vs Formula Engine (FE) CPU times and server timings.""",
                "difficulty": "MEDIUM",
                "category": "POWER BI",
                "domain": "Analytics, BI & AI",
                "subdomain": "Power BI Modeling & Optimization",
                "mergedFrom": ["pbi-easy-5", "medium-pbi-83"]
            }
        },

        # 8. Append vs Merge Queries
        "medium-pbi-14": {
            "merged_from": ["medium-pbi-14", "medium-pbi-49"],
            "item": {
                "id": "medium-pbi-14",
                "question": "What is the fundamental difference between 'Append Queries' and 'Merge Queries' in Power Query, and what are their SQL equivalents?",
                "answer": """In Power Query (M), 'Append' and 'Merge' are the two primary relational combination operations:

1. **Append Queries (Vertical Stacking / SQL `UNION ALL`)**:
   - Combines two or more tables vertically by stacking their rows into a single table.
   - Column matching is performed strictly by column name (case-sensitive). If column names match, rows are combined under existing headers; non-matching columns create new headers with `null` values populated for the respective opposing table.
   - Best used for unifying standardized temporal datasets (e.g., combining `Sales_2023.csv` and `Sales_2024.csv` into a single `FactSales` table).

2. **Merge Queries (Horizontal Expansion / SQL `JOIN`)**:
   - Combines two tables horizontally based on matching key values in one or more common identifier columns.
   - Supports all standard relational join algorithms: Left Outer (default), Right Outer, Full Outer, Inner, Left Anti, and Right Anti.
   - Merging expands the primary table with a nested `Table` column containing matching records from the secondary table, which is then expanded to reveal specific attributes.
   - Best used for enriching fact tables with dimensional attributes (e.g., looking up `CustomerName` and `Territory` into a sales record based on `CustomerID`).

3. **Performance Best Practice**:
   - Whenever possible, perform merges and appends in the source database via query folding rather than in local Mashup engine memory, which can cause significant RAM spikes during data refreshes.""",
                "difficulty": "EASY",
                "category": "POWER BI",
                "domain": "Analytics, BI & AI",
                "subdomain": "Data Pipelines & Ingestion",
                "mergedFrom": ["medium-pbi-14", "medium-pbi-49"]
            }
        },

        # 9. Unpivot in Power Query
        "medium-pbi-13": {
            "merged_from": ["medium-pbi-13", "medium-pbi-63"],
            "item": {
                "id": "medium-pbi-13",
                "question": "How does the 'Unpivot Columns' operation work in Power Query, and why is it essential for dimensional star schemas?",
                "answer": """Unpivoting in Power Query is the transformation process of converting 'wide' crosstab datasets into normalized 'tall' tabular datasets:

1. **Mechanics**:
   - In spreadsheet-style data, values are frequently arranged horizontally across columns (e.g., `Product | Jan_Sales | Feb_Sales | Mar_Sales`).
   - Unpivoting collapses multiple value columns into attribute-value pairs, generating two standardized columns: an **Attribute** column (containing the former column headers, e.g. 'Jan_Sales', 'Feb_Sales') and a **Value** column (containing the respective row measurements, e.g. 100, 250).

2. **Why It Is Essential for Power BI & VertiPaq**:
   - VertiPaq is a columnar in-memory database that compresses data vertically along column dictionaries. Wide crosstab tables with 50 month-columns yield terrible compression and require writing 50 separate DAX measures.
   - A tall unpivoted table with a single numeric `SalesAmount` column and a `Month` dimension column compresses efficiently, enables dynamic time intelligence DAX (`TOTALYTD`, `SAMEPERIODLASTYEAR`), and seamlessly integrates into star schema slicing.

3. **Best Practice Execution**:
   - In Power Query Editor, select the static identifier columns (e.g., `ProductID`, `Region`), right-click, and choose **'Unpivot Other Columns'**. This ensures the transformation is dynamic and automatically ingests new future date columns without breaking the query.""",
                "difficulty": "EASY",
                "category": "POWER BI",
                "domain": "Analytics, BI & AI",
                "subdomain": "Power BI Modeling & Optimization",
                "mergedFrom": ["medium-pbi-13", "medium-pbi-63"]
            }
        },

        # 10. VALUES vs DISTINCT in DAX
        "medium-pbi-28": {
            "merged_from": ["medium-pbi-28", "medium-pbi-88"],
            "item": {
                "id": "medium-pbi-28",
                "question": "What is the difference between VALUES() and DISTINCT() in DAX, specifically regarding referential integrity violations and blank rows?",
                "answer": """Both `VALUES()` and `DISTINCT()` return a single-column table containing unique values from a column, or unique rows from a multi-column table expression in the current filter context. However, their behavior diverges critically when referential integrity violations occur:

1. **Referential Integrity & The Blank Row**:
   - In a Power BI data model, if a Fact table contains foreign key values that do not exist in the related Dimension table's primary key column (e.g., `FactSales[ProductID] = 999`, but `DimProduct` has no product `999`), the VertiPaq engine automatically appends an **Unknown Blank Row** to `DimProduct` to prevent data loss.

2. **`VALUES(<ColumnName>)`**:
   - Returns all distinct values visible in filter context **plus** the blank row if a referential integrity mismatch exists.
   - Designed to maintain consistency with visual totals and cross-filtering; if an unmapped transaction exists, `VALUES()` preserves it in aggregations and calculations.

3. **`DISTINCT(<ColumnName>)`**:
   - Returns only the distinct values physically present in the table in the current filter context, **strictly excluding** the generated blank row resulting from referential integrity violations. (Note: If the column physically contains a literal `BLANK()` value in its data, `DISTINCT()` will include that literal blank, but excludes the synthetic referential integrity blank row).

4. **Practical Implication**:
   - When writing DAX measures where you must enforce strict cardinality checks or validate data existence, use `DISTINCT()`. For general visual slicing and standard measure propagation, `VALUES()` is standard.""",
                "difficulty": "MEDIUM",
                "category": "POWER BI",
                "domain": "Analytics, BI & AI",
                "subdomain": "Power BI Modeling & Optimization",
                "mergedFrom": ["medium-pbi-28", "medium-pbi-88"]
            }
        },

        # 11. Role-Playing Dimensions
        "medium-pbi-5": {
            "merged_from": ["medium-pbi-5", "medium-pbi-36", "pbi-med-17"],
            "item": {
                "id": "medium-pbi-5",
                "question": "What is a Role-Playing Dimension in data modeling, and what are the two main architectural patterns to implement it in Power BI?",
                "answer": """A Role-Playing Dimension occurs when a single physical dimension table can logically filter a fact table across multiple distinct contexts. The classic example is a `Date` dimension that plays multiple roles in an `Orders` fact table: `Order Date`, `Shipping Date`, and `Due Date`.

In Power BI, there are two primary architectural patterns to resolve role-playing dimensions:

### Pattern 1: Single Physical Table with Inactive Relationships + DAX `USERELATIONSHIP` (Recommended for Large Models)
- Connect `DimDate[DateKey]` to `FactOrders[OrderDateKey]` (Active relationship).
- Connect `DimDate[DateKey]` to `FactOrders[ShipDateKey]` and `FactOrders[DueDateKey]` as **Inactive** relationships (dashed lines).
- Write dedicated DAX measures leveraging `USERELATIONSHIP()` inside `CALCULATE()`:
```dax
Shipped Sales = 
CALCULATE(
    [Total Sales],
    USERELATIONSHIP(FactOrders[ShipDateKey], DimDate[DateKey])
)
```
- **Pros**: Zero memory duplication, single date table to maintain.
- **Cons**: Slicers on `DimDate` always default to filtering by `Order Date`. Users cannot easily slice visual axes by `Ship Date` and `Order Date` simultaneously in separate visual slicers.

### Pattern 2: Duplicating the Dimension Table (Multiple Role Views)
- Create separate dimensional tables in Power Query or DAX (e.g., `DimOrderDate`, `DimShipDate`, `DimDueDate`), each joined via an **Active** relationship to its respective fact foreign key.
- **Pros**: Highly intuitive self-service reporting. Business users can drop `DimShipDate[Year]` and `DimOrderDate[Year]` onto two independent canvas slicers with natural cross-filtering.
- **Cons**: Increases model memory consumption and data refresh time proportionately to table size.""",
                "difficulty": "MEDIUM",
                "category": "POWER BI",
                "domain": "Analytics, BI & AI",
                "subdomain": "Power BI Modeling & Optimization",
                "mergedFrom": ["medium-pbi-5", "medium-pbi-36", "pbi-med-17"]
            }
        },

        # 12. Row-Level Security Configuration
        "medium-pbi-17": {
            "merged_from": ["medium-pbi-17", "pbi-easy-4"],
            "item": {
                "id": "medium-pbi-17",
                "question": "How is Row-Level Security (RLS) architected and implemented in Power BI, and how do Static RLS and Dynamic RLS differ?",
                "answer": """Row-Level Security (RLS) in Power BI restricts data access for specific users by injecting deterministic DAX filters into query evaluation paths. RLS implementation spans two distinct environments: Power BI Desktop (rule definition) and Power BI Service (user assignment).

1. **Static RLS vs Dynamic RLS**:
   - **Static RLS**: Fixed roles are created in Power BI Desktop (e.g., 'EMEA Region', 'US Region') with hardcoded DAX expressions:
```dax
[Region] = "EMEA"
```
   Users or security groups are manually mapped to these roles in the Power BI Service. Unsuitable when organization hierarchies change frequently or scale to thousands of users.
   - **Dynamic RLS**: A single security role is defined that dynamically reads the logged-in user's identity using DAX security functions:
```dax
[UserEmail] = USERPRINCIPALNAME()
```
   Typically joined to an entitlement/security table that maps Azure AD User Principal Names (UPNs) to authorized department, territory, or customer keys.

2. **Step-by-Step Implementation**:
   - **Step 1 (Desktop)**: Open `Modeling` > `Manage Roles`. Create the role and write boolean DAX filter expressions on the dimension tables (filters propagate downstream to facts via 1-to-many relationships). Test rules using `View as Roles`.
   - **Step 2 (Publish)**: Publish semantic model to the Power BI Service.
   - **Step 3 (Service Assignment)**: Navigate to semantic model `Security` settings. Assign individual users or Microsoft Entra ID Security Groups to the configured roles.

3. **Critical Security Caveat**:
   - Workspace Members with Admin, Member, or Contributor permissions bypass RLS entirely. RLS is enforced **only** for users granted 'Viewer' permissions on the workspace or accessing the model via a published Power BI App.""",
                "difficulty": "MEDIUM",
                "category": "POWER BI",
                "domain": "Analytics, BI & AI",
                "subdomain": "Data Governance & Quality",
                "mergedFrom": ["medium-pbi-17", "pbi-easy-4"]
            }
        },

        # 13. Delta Lake Deletion Vectors
        "fabricspark-56": {
            "merged_from": ["fabricspark-56", "spark-med-24"],
            "item": {
                "id": "fabricspark-56",
                "question": "What are Deletion Vectors (DVs) in Delta Lake, how do they alter write-amplification mechanics during UPDATE and DELETE operations, and what are their read-time implications?",
                "answer": """Deletion Vectors (DVs) are a foundational storage engine optimization in Delta Lake (introduced in Delta 2.4+ and enabled by default in Microsoft Fabric Runtime 1.3+ via table property `delta.enableDeletionVectors = true`):

1. **Traditional Copy-on-Write (CoW) Problem**:
   - In standard Delta Lake, modifying or deleting a single row requires rewriting the entire containing Parquet file (typically 100MB–1GB).
   - This causes severe **write amplification**: updating 10 rows scattered across 10 distinct files requires reading and re-writing 10GB of Parquet data, saturating cloud storage I/O and creating extreme transaction contention.

2. **Deletion Vector Mechanics (Soft-Deletion via Bitmaps)**:
   - When an `UPDATE` or `DELETE` executes on a table with DVs enabled, Delta Lake **does not rewrite** the original Parquet data file.
   - Instead, it writes a tiny companion vector file containing a RoaringBitmap index recording the exact 0-indexed row positions that were deleted or replaced within the target file.
   - The Delta transaction log (`_delta_log`) is committed with an atomic entry referencing the original Parquet file paired with its Deletion Vector path and offset.
   - For `UPDATE` statements, the old row is marked in the deletion vector, and the updated row is appended into a brand new Parquet file. Write performance improves by 10x–50x.

3. **Read Path & Query Reconciliation**:
   - Query engines (Fabric Spark, SQL Analytics Endpoint, Photon, Trino) read both the Parquet file and the compact RoaringBitmap. Rows matching deleted bit offsets are discarded directly in-memory before returning the result set.

4. **Compaction & Cleanup**:
   - Over time, accumulated deletion vectors cause minor read-time overhead. Running `OPTIMIZE` physically purges marked rows and consolidates data into clean, rewritten Parquet files.""",
                "difficulty": "HARD",
                "category": "SPARK & DATABRICKS",
                "domain": "Compute & Orchestration",
                "subdomain": "Delta Lake & Storage Internals",
                "mergedFrom": ["fabricspark-56", "spark-med-24"]
            }
        },

        # 14. Delta Lake OPTIMIZE vs VACUUM
        "fabricspark-40": {
            "merged_from": ["fabricspark-40", "spark-easy-12"],
            "item": {
                "id": "fabricspark-40",
                "question": "What is the difference between OPTIMIZE and VACUUM in Delta Lake maintenance, and how do they interact with table concurrency and Time Travel?",
                "answer": """`OPTIMIZE` and `VACUUM` are the two essential administrative commands used to maintain health, performance, and storage costs in Delta Lake, but they serve opposite operational purposes:

### 1. `OPTIMIZE` (Data Compaction & File Clustering)
- **Primary Function**: Solves the 'small file problem' caused by high-frequency streaming ingestion or micro-batch writes.
- **Execution**: Merges thousands of small Parquet files (e.g., kilobytes or few megabytes) into right-sized, uniform columnar files (typically target size 512MB–1GB).
- **Z-Ordering**: Optionally reorganizes rows within files based on high-cardinality search columns (`OPTIMIZE table ZORDER BY (CustomerID, Date)`), dramatically improving data skipping during query filtering.
- **Concurrency & Time Travel**: Completely non-blocking and safe for concurrent reads and writes. Does NOT delete old files; it marks old files as replaced in the Delta log and appends newly compacted files. Historical Time Travel queries remain 100% intact.

### 2. `VACUUM` (Physical Storage Purge)
- **Primary Function**: Reclaims cloud storage space and enforces privacy/retention compliance (e.g., GDPR right-to-be-forgotten).
- **Execution**: Permanently deletes historical Parquet data files that are no longer referenced in the current Delta log snapshot and are older than a designated retention threshold (default: 7 days):
```sql
VACUUM sales_delta RETAIN 168 HOURS;
```
- **Impact on Time Travel**: Permanently eliminates the ability to Time Travel to any transaction version older than the retention period.
- **Safety Rule**: Never set retention to 0 hours on production tables with active concurrent writers, as VACUUM can delete files written by ongoing, uncommitted transactions, causing table corruption.""",
                "difficulty": "HARD",
                "category": "SPARK & DATABRICKS",
                "domain": "Compute & Orchestration",
                "subdomain": "Delta Lake & Storage Internals",
                "mergedFrom": ["fabricspark-40", "spark-easy-12"]
            }
        },

        # 15. Delta Lake VACUUM Command
        "medium-datalake-43": {
            "merged_from": ["medium-datalake-43", "medium-spark-13"],
            "item": {
                "id": "medium-datalake-43",
                "question": "Explain the purpose and operational mechanics of the VACUUM command in Delta Lake, including safety thresholds and retention implications.",
                "answer": """In Delta Lake, the `VACUUM` command is the garbage collection mechanism responsible for physically deleting obsolete data files from underlying cloud object storage (ADLS Gen2, AWS S3, or GCS):

1. **Why VACUUM Is Necessary**:
   - Because Delta Lake enforces ACID transactions via Multi-Version Concurrency Control (MVCC), modifying data (`UPDATE`, `DELETE`, `MERGE`) or running `OPTIMIZE` never overwrites existing Parquet files. It writes new files and updates the transaction log to unreference the old ones.
   - Without routine cleanup, unreferenced historical data files accumulate indefinitely, causing cloud storage costs to explode.

2. **Command Mechanics & Syntax**:
```sql
-- Retain 7 days of history (default)
VACUUM delta_table;

-- Custom retention threshold (e.g., 3 days)
VACUUM delta_table RETAIN 72 HOURS;
```
   - Delta Lake scans the transaction log to construct the active set of files required by valid snapshots within the retention window. All unreferenced files with file creation timestamps older than the retention cutoff are permanently deleted from disk.

3. **Retention Threshold & Concurrency Safety**:
   - The default retention period is 7 days (`168 hours`).
   - If `VACUUM` is executed with a retention period shorter than the duration of the longest running query or write transaction, it could delete files that an active query is currently reading, causing catastrophic job failures (`FileNotFoundException`).
   - Delta Lake imposes a safety check preventing retention < 168 hours unless explicitly overridden via `SET spark.databricks.delta.vacuum.parallelDelete.enabled = true` and `spark.sql.conf.set("spark.databricks.delta.retentionDurationCheck.enabled", "false")`.""",
                "difficulty": "MEDIUM",
                "category": "DATALAKE ARCHITECTURE",
                "domain": "Data Lakehouse & Architecture",
                "subdomain": "Delta Lake & Storage Internals",
                "mergedFrom": ["medium-datalake-43", "medium-spark-13"]
            }
        },

        # 16. Delta Lake Data Skipping
        "fabricspark-46": {
            "merged_from": ["medium-datalake-25", "fabricspark-46"],
            "item": {
                "id": "fabricspark-46",
                "question": "What is Data Skipping in Delta Lake, how does it utilize column statistics in the transaction log, and how does it interact with indexing?",
                "answer": """Data Skipping is Delta Lake's built-in query optimization technique that prevents scanning irrelevant Parquet files during query execution without requiring manual directory partitioning:

1. **Metadata Collection at Ingestion**:
   - Whenever a writer commits a Parquet file to a Delta table, it automatically computes and serializes file-level metadata statistics directly into the commit entry of the `_delta_log` JSON file:
     - Record count
     - Minimum values per column
     - Maximum values per column
     - Null value counts per column
   - By default, Delta Lake collects statistics on the first 32 columns defined in the table schema (configurable via table property `delta.dataSkippingNumIndexedCols = N`).

2. **Query Pruning at Query Planning**:
   - When a query contains a `WHERE` clause (e.g., `WHERE OrderDate >= '2024-06-01' AND OrderDate <= '2024-06-15'`), the query engine inspects the transaction log's min/max statistics **before** issuing any storage I/O calls.
   - If a file's `maxValues.OrderDate` is `'2024-05-30'`, Delta Lake immediately discards that entire Parquet file from the Spark physical execution plan.

3. **Comparison with Directory Partitioning**:
   - Directory partitioning (e.g., `/Year=2024/Month=06/`) works only on 1–2 low-cardinality columns and risks creating the small-file problem if over-partitioned.
   - Data Skipping works on high-cardinality columns (like timestamps, UUIDs, IDs) across flat directory structures, avoiding file proliferation.

4. **Synergy with Z-Ordering / Liquid Clustering**:
   - Randomly ordered data causes min/max ranges across files to overlap extensively, rendering data skipping ineffective.
   - Applying `OPTIMIZE table ZORDER BY (col)` or using Delta 3.0+ **Liquid Clustering** groups similar column values into identical files, minimizing range overlap and allowing up to 90%+ of files to be skipped.""",
                "difficulty": "HARD",
                "category": "SPARK & DATABRICKS",
                "domain": "Compute & Orchestration",
                "subdomain": "Delta Lake & Storage Internals",
                "mergedFrom": ["medium-datalake-25", "fabricspark-46"]
            }
        },

        # 17. Delta Lake Time Travel Mechanics
        "medium-spark-11": {
            "merged_from": ["medium-spark-11", "dl-easy-12"],
            "item": {
                "id": "medium-spark-11",
                "question": "How does Time Travel work mechanically in Delta Lake and Apache Iceberg, and what are its primary enterprise use cases?",
                "answer": """Time Travel is the architectural capability of open table formats (Delta Lake and Apache Iceberg) to query historical snapshots of a dataset exactly as it existed at a past timestamp or commit version:

1. **Underlying Storage Engine Mechanics**:
   - **Append-Only Immutability**: Underlying data files (Parquet) are never modified in place. When rows are updated or deleted, new Parquet files are written, and obsolete files remain on cloud storage.
   - **Transaction Log Snapshots**:
     - *Delta Lake*: Maintains an ordered JSON transaction log (`000000.json`, `000001.json` in `_delta_log/`) and periodic Parquet checkpoint files every 10 commits. Each commit records the exact list of active files added (`add`) and unreferenced (`remove`).
     - *Apache Iceberg*: Maintains a tree of metadata files, manifest lists, and manifest files tracking snapshot IDs.
   - To query a past version, the engine reconstructs the transaction log state up to that specific version number or ISO timestamp, ignoring all subsequent additions/removals.

2. **Query Syntax**:
```sql
-- Delta Lake: Query by version or timestamp
SELECT * FROM sales_delta VERSION AS OF 14;
SELECT * FROM sales_delta TIMESTAMP AS OF '2024-05-01 12:00:00';

-- Apache Iceberg: Query by snapshot ID
SELECT * FROM iceberg_catalog.db.sales FOR SYSTEM_VERSION AS OF 847291847192;
```

3. **Core Enterprise Use Cases**:
   - **Data Pipeline Rollback**: Instantly restore tables after a corrupted batch run using `RESTORE TABLE sales_delta TO VERSION AS OF N;` in seconds without running full backups.
   - **Reproducible Machine Learning**: Train models on exact historical feature snapshots to guarantee model reproducibility.
   - **Regulatory & Financial Audits**: Reconstruct historical balance sheets or compliance reports as of a specific quarter-end date.""",
                "difficulty": "MEDIUM",
                "category": "DATALAKE ARCHITECTURE",
                "domain": "Data Lakehouse & Architecture",
                "subdomain": "Delta Lake & Storage Internals",
                "mergedFrom": ["medium-spark-11", "dl-easy-12"]
            }
        },

        # 18. Data Lake Partitioning
        "medium-datalake-13": {
            "merged_from": ["medium-datalake-13", "medium-datalake-42"],
            "item": {
                "id": "medium-datalake-13",
                "question": "What is physical partitioning in a Data Lake, how does it optimize query performance, and what are the dangers of over-partitioning?",
                "answer": """Physical partitioning in a data lake organizes data files on cloud object storage (ADLS Gen2, S3) into a hierarchical directory tree based on the values of one or more designated partition columns:

1. **Mechanics & Hive-Style Partitioning**:
   - Columns chosen for partitioning (typically date parts like `year`, `month`, or operational boundaries like `region`) are removed from the internal file schema and represented as folder paths:
     `abfss://data@storage.dfs.core.windows.net/sales/year=2024/month=06/day=15/part-0001.parquet`
   - When a query filters by a partition key (`WHERE year = 2024 AND month = 6`), the query engine performs **Partition Pruning**: it reads metadata only from matching subdirectories, completely bypassing all other folders without issuing list operations or storage I/O.

2. **The Peril of Over-Partitioning (The Small File Problem)**:
   - Partitioning by high-cardinality columns (e.g., `CustomerID`, `Hour`, `DeviceID`) creates thousands of granular folders each holding tiny Parquet files (< 1MB).
   - *Driver Memory Exhaustion*: The query coordinator must issue millions of HTTP `LIST` requests to cloud storage, overwhelming driver heap memory and slowing query planning to minutes.
   - *I/O Inefficiency*: Distributed engines spend 90% of their execution time opening and closing storage network sockets rather than streaming columnar data.

3. **Modern Architectural Shift**:
   - Modern lakehouse tables (Delta Lake with Z-Order / Liquid Clustering, or Iceberg with Hidden Partitioning) recommend partitioning only when data exceeds **1 Terabyte** and individual partitions contain at least **1GB** of data. For smaller tables, flat unpartitioned tables with data skipping perform significantly faster.""",
                "difficulty": "MEDIUM",
                "category": "DATALAKE ARCHITECTURE",
                "domain": "Data Lakehouse & Architecture",
                "subdomain": "Data Lakehouse & Architecture",
                "mergedFrom": ["medium-datalake-13", "medium-datalake-42"]
            }
        },

        # 19. Change Data Capture Fundamentals
        "medium-datalake-18": {
            "merged_from": ["medium-datalake-18", "dl-easy-4"],
            "item": {
                "id": "medium-datalake-18",
                "question": "What is Change Data Capture (CDC) in modern data architecture, and how do log-based and query-based CDC approaches compare?",
                "answer": """Change Data Capture (CDC) is a design pattern and set of technologies that detects, records, and streams row-level changes (INSERTs, UPDATEs, DELETEs) from an operational source database in near real-time to downstream data lakes, warehouses, or event buses:

1. **Log-Based CDC (Industry Standard)**:
   - Reads changes directly from the database's native transaction log (e.g., PostgreSQL Write-Ahead Log [WAL], MySQL binary log, SQL Server transaction log, Oracle redo log) via tools like Debezium or Qlik Replicate.
   - **Zero Schema Intrusion**: Requires no extra timestamp or status columns on source tables.
   - **Captures Deletes**: Naturally captures physical `DELETE` statements (which leave no row behind in the table).
   - **Minimal Source Overhead**: The log parser acts as a replication peer, reading asynchronous sequential disk I/O without locking tables or executing analytical queries on source CPU.

2. **Query-Based CDC (Polling / Timestamp / Watermark)**:
   - Periodically executes queries like `SELECT * FROM Orders WHERE LastModifiedDate > :last_watermark`.
   - **Severe Limitations**:
     - Cannot detect hard row `DELETE`s without soft-delete trigger flags.
     - Causes race conditions if transactions commit out of order during polling.
     - Adds significant query load and lock contention on active transactional databases.

3. **Downstream Integration**:
   - CDC streams are ingested into Kafka/Event Hubs and merged into Delta/Iceberg tables using atomic `MERGE INTO` statements, keeping lakehouse tables continuously synced with sub-minute latency.""",
                "difficulty": "MEDIUM",
                "category": "DATALAKE ARCHITECTURE",
                "domain": "Data Pipelines & Ingestion",
                "subdomain": "Data Pipelines & Ingestion",
                "mergedFrom": ["medium-datalake-18", "dl-easy-4"]
            }
        },

        # 20. Structured Streaming Checkpointing
        "spark-easy-11": {
            "merged_from": ["spark-easy-11", "medium-spark-16"],
            "item": {
                "id": "spark-easy-11",
                "question": "What is Checkpointing in Apache Spark Structured Streaming, how does it guarantee fault tolerance, and what is stored in the checkpoint directory?",
                "answer": """In Spark Structured Streaming, checkpointing is the fundamental mechanism that guarantees fault tolerance, stateful continuity, and end-to-end exactly-once stream processing across cluster failures:

1. **Purpose & Operational Guarantee**:
   - A streaming pipeline configured with `.option("checkpointLocation", "abfss://checkpoints@storage/stream_01")` records its deterministic execution state into durable cloud storage after every micro-batch.
   - If the Spark driver, worker nodes, or underlying cluster crashes, restarting the application reads the checkpoint directory to resume processing exactly from the last committed offset without data loss or duplicate processing.

2. **Internal Anatomy of the Checkpoint Directory**:
   - `/offsets/`: Sequential WAL files (e.g., `0`, `1`, `2`) recording the exact partition offsets read from sources (e.g., Kafka topic partitions or Delta table versions) for each micro-batch.
   - `/commits/`: Records a completion marker once a micro-batch has successfully written all output records into the sink. If a batch fails midway, Spark compares `/offsets/` and `/commits/` upon restart, detects the uncommitted batch, and replays it cleanly.
   - `/state/`: For stateful streaming operations (e.g., streaming aggregations, watermarked windowing, stream-stream joins), stores delta files and RocksDB snapshot state backends holding running session and aggregation buffers.
   - `/metadata/`: Contains the unique stream schema fingerprint to prevent running conflicting queries against existing state directories.

3. **Production Best Practice**:
   - The checkpoint location MUST reside on high-availability, POSIX-compliant or atomic-rename cloud object storage (ADLS Gen2 or S3 with EMRFS/S3Guard). Checkpoints must never be deleted or altered while a stream is running.""",
                "difficulty": "HARD",
                "category": "SPARK & DATABRICKS",
                "domain": "Compute & Orchestration",
                "subdomain": "Distributed Stream Processing",
                "mergedFrom": ["spark-easy-11", "medium-spark-16"]
            }
        },

        # 21. Spark Catalyst Optimizer Core
        "spark-easy-1": {
            "merged_from": ["spark-easy-1", "medium-spark-9"],
            "item": {
                "id": "spark-easy-1",
                "question": "What is the Catalyst Optimizer in Apache Spark, and what are its four internal query compilation phases?",
                "answer": """The Catalyst Optimizer is the core extensible query optimization engine powering Spark SQL, DataFrame, and Dataset APIs. It translates user-written code into highly optimized physical execution bytecode across four distinct phases:

1. **Phase 1: Analysis (Unresolved Logical Plan -> Analyzed Logical Plan)**:
   - Takes the Abstract Syntax Tree (AST) generated from SQL or DataFrame expressions. At this stage, table and column references are unresolved strings.
   - Catalyst consults the **Catalog** (Hive Metastore or Unity Catalog) to verify table existence, validate column data types, and check permissions, converting unresolved attributes into fully resolved symbols.

2. **Phase 2: Logical Optimization (Rule-Based & Cost-Based)**:
   - Applies deterministic rule-based transformations to prune and reshape the plan:
     - **Constant Folding**: Pre-evaluates expressions like `1 + 1` to `2`.
     - **Predicate Pushdown**: Moves filters as close to the storage layer as possible so Parquet readers skip files/row groups.
     - **Column Pruning**: Eliminates unreferenced columns early to minimize I/O and serialization overhead.
   - Cost-Based Optimization (CBO) evaluates table statistics to order multi-table joins optimally.

3. **Phase 3: Physical Planning**:
   - Generates multiple candidate physical execution strategies (e.g., deciding whether a join should run as a Broadcast Hash Join, Shuffle Hash Join, or Sort-Merge Join).
   - Selects the lowest-cost physical plan based on partition sizes and cluster topologies.

4. **Phase 4: Code Generation (Tungsten Engine)**:
   - Compiles the chosen physical plan into optimized Java bytecode using **Whole-Stage Code Generation (WSCG)**.
   - Flattens nested query trees into a single tightly unrolled `for` loop, eliminating virtual function dispatch and keeping data inside CPU L1/L2 registers.""",
                "difficulty": "HARD",
                "category": "SPARK & DATABRICKS",
                "domain": "Compute & Orchestration",
                "subdomain": "Compute Engines & Query Optimization",
                "mergedFrom": ["spark-easy-1", "medium-spark-9"]
            }
        },

        # 22. Spark Adaptive Query Execution AQE
        "spark-easy-4": {
            "merged_from": ["spark-easy-4", "medium-spark-24"],
            "item": {
                "id": "spark-easy-4",
                "question": "What is Adaptive Query Execution (AQE) in Apache Spark 3.x, and what three key runtime optimizations does it perform?",
                "answer": """Adaptive Query Execution (AQE) is a dynamic query re-optimization framework introduced in Spark 3.0 (enabled by default via `spark.sql.adaptive.enabled = true`). Unlike traditional static query optimization where execution plans are fixed before job start, AQE inspects actual runtime metrics at shuffle stage boundaries and dynamically modifies the physical execution plan mid-flight:

1. **Dynamically Coalescing Shuffle Partitions**:
   - Static Spark requires hardcoding `spark.sql.shuffle.partitions` (default: 200). If data is small, this results in hundreds of empty micro-tasks (I/O overhead); if data is massive, tasks spill to disk.
   - AQE inspects shuffle file sizes after the map stage and automatically merges small adjacent shuffle partitions into target-sized partitions (default: 64MB, controlled by `spark.sql.adaptive.advisoryPartitionSizeInBytes`), eliminating idle executor overhead.

2. **Dynamically Converting Sort-Merge Join to Broadcast Hash Join**:
   - If a table was estimated statically at 50MB but after applying filters shrinks below the broadcast threshold (e.g., `spark.sql.autoBroadcastJoinThreshold = 10MB`), AQE detects the actual partition size post-shuffle and converts the expensive network-heavy Sort-Merge Join into an instant Broadcast Hash Join, eliminating shuffle write/read.

3. **Dynamically Handling Data Skew in Joins**:
   - If a single join key contains disproportionate volume (skew), a single task can take hours while other executors sit idle.
   - AQE detects skewed partitions (e.g., partition size > 5x median) and automatically splits the skewed partition into smaller sub-partitions, broadcasting the matching key slice from the other side so multiple worker tasks process the skewed key in parallel.""",
                "difficulty": "HARD",
                "category": "SPARK & DATABRICKS",
                "domain": "Compute & Orchestration",
                "subdomain": "Compute Engines & Query Optimization",
                "mergedFrom": ["spark-easy-4", "medium-spark-24"]
            }
        },

        # 23. ADF Get Metadata Activity
        "medium-adf-4": {
            "merged_from": ["medium-adf-4", "medium-adf-80"],
            "item": {
                "id": "medium-adf-4",
                "question": "What is the 'Get Metadata' activity in Azure Data Factory, what attributes can it retrieve, and how is it used in dynamic ingestion loops?",
                "answer": """The 'Get Metadata' activity in Azure Data Factory (ADF) and Synapse Pipelines inspects storage endpoints and databases to retrieve structural file and folder properties without loading or reading actual file payloads:

1. **Key Extractable Metadata Arguments**:
   - `childItems`: Returns the array of file and subfolder names within a directory (essential for driving `ForEach` loop ingestion).
   - `exists`: Returns a boolean indicating whether a file or folder exists (used inside `If Condition` activities to check arrival flags).
   - `itemType`: Returns whether the entity is a `File` or `Folder`.
   - `size`: Returns physical file size in bytes (used to filter out 0-byte corrupt files).
   - `lastModified`: Returns the UTC timestamp when the file was last updated (used to implement incremental file delta detection).
   - `columnCount` & `structure`: Returns the schema column names and data types for tabular/delimited datasets.

2. **Common Architectural Pattern: Dynamic Multi-File Ingestion**:
   - Step 1: Connect `Get Metadata` to a landing container folder with argument `childItems`.
   - Step 2: Feed the output `@activity('Get Metadata1').output.childItems` into a `ForEach` activity.
   - Step 3: Inside the loop, pass `@item().name` to a parameterized Copy Activity to ingest only `.csv` files into a relational target or Delta lakehouse.

3. **Limitations & Best Practice**:
   - The `childItems` property is limited to returning a maximum of 5,000 items per call. If a folder contains more than 5,000 files, recursive folder partitioning or Azure Functions/Databricks directory listings should be used instead.""",
                "difficulty": "EASY",
                "category": "ADF",
                "domain": "Data Pipelines & Ingestion",
                "subdomain": "Data Pipelines & Orchestration",
                "mergedFrom": ["medium-adf-4", "medium-adf-80"]
            }
        },

        # 24. ADF Try-Catch Pattern
        "medium-adf-31": {
            "merged_from": ["medium-adf-31", "medium-adf-86"],
            "item": {
                "id": "medium-adf-31",
                "question": "How do you implement robust 'Try-Catch-Finally' error handling and logging logic in an Azure Data Factory pipeline?",
                "answer": """Because Azure Data Factory lacks a native `Try-Catch` scoped container activity, architects implement error handling using **Activity Conditional Dependencies** and pipeline design patterns:

1. **Core Activity Dependency Branches**:
   - **The 'Try' Step**: The primary workload activity (e.g., a Copy Activity, Databricks Notebook, or Stored Procedure).
   - **The 'Catch' Step**: A dedicated error-handling activity (e.g., Web Activity calling a Logic App/Teams webhook, or a Stored Procedure logging to an audit table).
     - Configure the dependency path from the 'Try' activity to the 'Catch' activity with condition: **`Upon Failure`** (Red arrow).
   - **The 'Finally' Step**: Cleanup or notification tasks that must execute regardless of outcome.
     - Connect to both the primary activity and catch activity using condition: **`Upon Completion`** (Blue arrow) or evaluate status flags in a subsequent variable.

2. **Capturing Error Telemetry**:
   - In the 'Catch' activity, extract detailed runtime error codes, failure messages, and pipeline run IDs using ADF expression syntax:
```json
{
  "PipelineName": "@{pipeline().Pipeline}",
  "RunId": "@{pipeline().RunId}",
  "FailedActivity": "@{activity('PrimaryCopyActivity').error.target}",
  "ErrorCode": "@{activity('PrimaryCopyActivity').error.errorCode}",
  "ErrorMessage": "@{activity('PrimaryCopyActivity').error.message}"
}
```

3. **Preventing False 'Pipeline Succeeded' Status**:
   - A critical ADF gotcha: If an activity fails but its `Upon Failure` catch activity succeeds, ADF marks the overall pipeline run status as **Succeeded**!
   - To ensure failed pipelines trigger SLA monitoring alerts, append a `Fail` activity at the end of the Catch branch with message `@activity('PrimaryCopyActivity').error.message`.""",
                "difficulty": "MEDIUM",
                "category": "ADF",
                "domain": "Data Pipelines & Ingestion",
                "subdomain": "Data Pipelines & Orchestration",
                "mergedFrom": ["medium-adf-31", "medium-adf-86"]
            }
        },

        # 25. Clustered vs Non-Clustered Index
        "medium-sql-6": {
            "merged_from": ["medium-sql-6", "medium-sql-33"],
            "item": {
                "id": "medium-sql-6",
                "question": "What is the difference between a Clustered Index and a Non-Clustered Index in relational databases (SQL Server), and how do they physically structure data pages?",
                "answer": """In relational databases like Microsoft SQL Server, indexes are structured as balanced B-trees, but clustered and non-clustered indexes differ fundamentally in how leaf-level pages interact with physical storage:

1. **Clustered Index**:
   - **Physical Table Sorting**: The leaf nodes of a clustered index **are** the actual data pages of the table. Creating a clustered index physically dictates the sequential storage order of all rows on disk based on the clustered key.
   - **Cardinality Constraint**: A table can have **only one** clustered index because physical data rows can only be sorted in a single order on storage.
   - **Pointer Mechanism**: When an index seek reaches the leaf node of a clustered index, the entire data row is already present; no secondary lookups are required.

2. **Non-Clustered Index**:
   - **Independent Structure**: Exists as an independent B-tree structure separate from the underlying table storage.
   - **Leaf Node Contents**: The leaf level contains only the indexed key columns plus a **row locator**:
     - If the table has a clustered index, the row locator is the clustered index key.
     - If the table is a heap (no clustered index), the row locator is a physical Row Identifier (RID: file#, page#, slot#).
   - **Multiple Allowed**: A table can have up to 999 non-clustered indexes.

3. **Key Lookups & Covering Indexes**:
   - If a query requests columns not present in the non-clustered index, the engine must perform an expensive **Key Lookup** against the clustered index for every qualifying row.
   - Using the `INCLUDE (ColA, ColB)` clause appends non-key payload columns directly to the non-clustered index leaf pages, creating a **Covering Index** that satisfies queries with zero key lookups.""",
                "difficulty": "MEDIUM",
                "category": "SQL SERVER",
                "domain": "Databases, SQL & Storage",
                "subdomain": "SQL Engine & Storage Architecture",
                "mergedFrom": ["medium-sql-6", "medium-sql-33"]
            }
        },

        # 26. Index Seek vs Index Scan
        "medium-sql-10": {
            "merged_from": ["medium-sql-10", "medium-sql-48"],
            "item": {
                "id": "medium-sql-10",
                "question": "What is the architectural difference between an Index Seek and an Index Scan in database query execution plans, and what causes an optimizer to choose each?",
                "answer": """In database query optimization, an Index Seek and an Index Scan represent two vastly different access paths through an index B-tree:

1. **Index Seek (Direct B-Tree Navigation)**:
   - **Mechanism**: The query processor traverses from the root page of the B-tree down through intermediate branch nodes to land precisely on the exact leaf-level page containing the target key, reading only qualifying rows.
   - **Complexity**: $O(\\log N)$ page accesses.
   - **Optimal For**: Highly selective predicate queries (e.g., `WHERE CustomerID = 48201` or bounded range queries `WHERE OrderDate BETWEEN '2024-01-01' AND '2024-01-02'`). Uses minimal CPU, RAM, and buffer cache.

2. **Index Scan (Sequential Traversal)**:
   - **Mechanism**: The query processor navigates to the start of the index leaf level and sequentially reads every page from start to finish across the leaf chain.
   - **Complexity**: $O(N)$ page accesses.
   - **Optimal For**: Low-selectivity queries returning a large percentage of table rows (e.g., >15–20% of the table), queries lacking predicates on the leading index column, or queries where table row counts are so small that a sequential scan is faster than tree traversal overhead.

3. **Common Pitfalls Turning Seeks into Scans (SARGability)**:
   - Applying non-sargable functions or scalar transformations to indexed columns in `WHERE` clauses (e.g., `WHERE YEAR(OrderDate) = 2024` or `WHERE UPPER(LastName) = 'SMITH'`). The engine cannot navigate the B-tree and is forced to scan every row to evaluate the function.
   - Implicit data type conversions (e.g., comparing an `NVARCHAR` parameter to a `VARCHAR` indexed column).""",
                "difficulty": "MEDIUM",
                "category": "SQL SERVER",
                "domain": "Databases, SQL & Storage",
                "subdomain": "SQL Engine & Storage Architecture",
                "mergedFrom": ["medium-sql-10", "medium-sql-48"]
            }
        },

        # 27. TRUNCATE vs DELETE
        "medium-sql-18": {
            "merged_from": ["medium-sql-18", "medium-sql-56"],
            "item": {
                "id": "medium-sql-18",
                "question": "Explain the technical differences between TRUNCATE and DELETE in SQL Server regarding logging, transaction safety, lock escalation, and identity resets.",
                "answer": """While both `DELETE` and `TRUNCATE TABLE` remove all rows from a table, they operate at completely different layers of the database storage engine:

| Feature | `DELETE` | `TRUNCATE TABLE` |
|---|---|---|
| **Command Classification** | DML (Data Manipulation Language) | DDL (Data Definition Language) |
| **Execution Mechanics** | Row-by-row deletion. Every individual deleted row is written into the transaction log (`LOB_DELETE_ROWS`). | Page deallocation. Deallocates entire 8KB data pages and extents; logs only extent deallocations in the transaction log (`PFS` and `GAM` bit changes). |
| **Transaction Log Overhead** | Extremely high log generation. Can fill transaction log drives and cause checkpoint bottlenecks on millions of rows. | Minimally logged. Requires tiny log space, completing in milliseconds regardless of table size. |
| **Locking Behavior** | Acquires row-exclusive (`X`) and page locks, frequently escalating to table-exclusive (`X`) locks. | Acquires a Schema Modification (`Sch-M`) lock on the table, preventing all concurrent queries during execution. |
| **Identity Column Reset** | Does **NOT** reset the identity seed value. The next insert continues from the highest previous number. | Resets the `IDENTITY` counter back to the table's original seed value. |
| **Triggers** | Fires `ON DELETE` DML triggers for affected rows. | Does **NOT** fire DML triggers under any circumstance. |
| **Foreign Key Restrictions** | Allowed if referencing child rows are deleted or cascade is configured. | Prohibited if the table is referenced by an enabled Foreign Key constraint (even if child tables contain zero rows). |
| **Rollback Capability** | Fully rollable back within an explicit `BEGIN TRANSACTION ... ROLLBACK`. | **Fully rollable back** within an explicit transaction (a common myth is that TRUNCATE cannot be rolled back; it can, because extent deallocations are logged). |""",
                "difficulty": "MEDIUM",
                "category": "SQL SERVER",
                "domain": "Databases, SQL & Storage",
                "subdomain": "SQL Engine & Storage Architecture",
                "mergedFrom": ["medium-sql-18", "medium-sql-56"]
            }
        },

        # 28. SQL Server Deadlocks
        "medium-sql-13": {
            "merged_from": ["medium-sql-13", "medium-sql-74", "sqllock-23"],
            "item": {
                "id": "medium-sql-13",
                "question": "What is a Deadlock in SQL Server, how does the deadlock monitor detect and resolve it, and what architectural strategies prevent deadlocks?",
                "answer": """A deadlock is a concurrent concurrency condition where two or more sessions hold locks on resources that each other requires to proceed, creating a cyclic wait graph that cannot resolve without external intervention:

1. **Classic Deadlock Cycle (1205 Error)**:
   - Session A holds an Exclusive lock (`X`) on Table 1 and requests an `X` lock on Table 2.
   - Session B holds an `X` lock on Table 2 and simultaneously requests an `X` lock on Table 1.
   - Both sessions block indefinitely waiting for the other to release locks.

2. **Detection & Victim Selection Mechanics**:
   - SQL Server runs a background thread called the **Deadlock Monitor** (typically polling every 5 seconds, dropping to 100ms when deadlocks are detected).
   - It searches the lock manager wait-for graph for directed cycles.
   - When a cycle is detected, the engine selects a **Deadlock Victim**:
     - *Priority*: Checks `SET DEADLOCK_PRIORITY` (LOW, NORMAL, HIGH, or -10 to 10). The session with lower priority is terminated.
     - *Rollback Cost*: If priorities are equal, it calculates the volume of transaction log generated by each session and terminates the session that is cheapest to rollback.
   - The victim session's transaction is rolled back, releasing all locks, and client receives error `1205: Transaction was deadlocked on lock resources with another process and has been chosen as the deadlock victim`.

3. **Prevention & Mitigation Strategies**:
   - **Consistent Object Access Order**: Ensure all stored procedures and application threads access tables in identical sequential order (e.g., always access `Customers`, then `Orders`, then `OrderDetails`).
   - **Optimistic Concurrency**: Enable Read Committed Snapshot Isolation (RCSI) or Snapshot Isolation (`ALLOW_SNAPSHOT_ISOLATION ON`), eliminating reader-writer lock contention.
   - **Keep Transactions Short**: Avoid user interactions, API calls, or heavy ETL inside active transactions.
   - **Index Tuning**: Add covering indexes so queries do not escalate to table locks or perform unneeded key lookups during updates.""",
                "difficulty": "HARD",
                "category": "SQL SERVER",
                "domain": "Databases, SQL & Storage",
                "subdomain": "SQL Engine & Storage Architecture",
                "mergedFrom": ["medium-sql-13", "medium-sql-74", "sqllock-23"]
            }
        },

        # 29. SQL Server Recovery Models
        "sqlha-26": {
            "merged_from": ["sqlha-26", "medium-sql-60"],
            "item": {
                "id": "sqlha-26",
                "question": "What are the differences between SIMPLE, FULL, and BULK_LOGGED recovery models in SQL Server, and how do they impact transaction log management and disaster recovery?",
                "answer": """In SQL Server, the Recovery Model determines how transaction log records are maintained, whether log backups are supported, and the precision of disaster recovery:

1. **SIMPLE Recovery Model**:
   - **Log Management**: Automatically truncates the transaction log during automatic checkpoints, marking inactive virtual log files (VLFs) as reusable.
   - **Backups**: Supports Full and Differential backups only. **Log backups are not permitted**.
   - **Recovery**: Point-in-time recovery is **not possible**; data can only be recovered to the exact point of the last full or differential backup. Any transactions executed after that backup are lost.
   - **Ideal For**: Development/staging environments, reporting data marts, or warehouse databases reloaded nightly via batch pipelines.

2. **FULL Recovery Model (Production Standard)**:
   - **Log Management**: Inactive log records are **never** truncated by checkpoints. The transaction log keeps growing until a formal Transaction Log Backup (`BACKUP LOG`) is successfully executed.
   - **Recovery**: Guarantees zero data loss (RPO near zero). Supports Point-in-Time recovery (e.g., restoring to `2024-06-15 14:23:10.000` to reverse an accidental table drop) and tail-log backups.
   - **High Availability**: Mandatory prerequisite for Always On Availability Groups, Database Mirroring, and Log Shipping.

3. **BULK_LOGGED Recovery Model**:
   - An adjunct to FULL recovery. Minimally logs bulk operations (`BULK INSERT`, `BCP`, `CREATE INDEX`, `SELECT INTO`), preventing massive log file expansion during petabyte loads.
   - **Trade-off**: If the log contains bulk operations, point-in-time recovery to timestamps within those bulk intervals is disabled; you can only restore to the end of the log backup.""",
                "difficulty": "MEDIUM",
                "category": "SQL SERVER",
                "domain": "Databases, SQL & Storage",
                "subdomain": "High Availability & Disaster Recovery",
                "mergedFrom": ["sqlha-26", "medium-sql-60"]
            }
        },

        # 30. SQL Window Ranking Functions
        "medium-sql-2": {
            "merged_from": ["medium-sql-2", "medium-sql-28"],
            "item": {
                "id": "medium-sql-2",
                "question": "Compare ROW_NUMBER(), RANK(), and DENSE_RANK() in SQL, and explain how each handles tie values and sequence gaps.",
                "answer": """In SQL, `ROW_NUMBER()`, `RANK()`, and `DENSE_RANK()` are analytical window ranking functions evaluated across a `PARTITION BY` and ordered by an `ORDER BY` clause. They differ strictly in how they handle tie (duplicate) values:

```sql
SELECT 
    EmployeeID, DepartmentID, Salary,
    ROW_NUMBER() OVER(PARTITION BY DepartmentID ORDER BY Salary DESC) AS [Row_Number],
    RANK()       OVER(PARTITION BY DepartmentID ORDER BY Salary DESC) AS [Rank],
    DENSE_RANK() OVER(PARTITION BY DepartmentID ORDER BY Salary DESC) AS [Dense_Rank]
FROM Employees;
```

### Behavioral Comparison:

| Employee | Salary | `ROW_NUMBER()` | `RANK()` | `DENSE_RANK()` | Explanation |
|---|---|---|---|---|---|
| Alice | \$100k | **1** | **1** | **1** | Highest salary in department. |
| Bob | \$90k | **2** | **2** | **2** | Tied for 2nd place. |
| Charlie | \$90k | **3** | **2** | **2** | Tied for 2nd place. |
| David | \$80k | **4** | **4** | **3** | Notice the difference below! |

1. **`ROW_NUMBER()`**:
   - Strictly increments an integer sequentially (1, 2, 3, 4...).
   - Guarantees **no duplicate rank numbers** and **no gaps**, even if values are identical. If sorting columns have ties, assignment order is non-deterministic unless additional tie-breaker columns are specified.

2. **`RANK()`**:
   - Assigns identical rank numbers to tie values (Bob and Charlie both get `2`).
   - Introduces **gaps in the sequence** proportional to the number of tied rows. Because two people tied for rank 2, rank 3 is skipped, and David receives `4`.

3. **`DENSE_RANK()`**:
   - Assigns identical rank numbers to tie values (Bob and Charlie both get `2`).
   - Leaves **no gaps in the sequence**. The subsequent rank immediately increments to `3`, meaning David receives `3`.""",
                "difficulty": "EASY",
                "category": "SQL SERVER",
                "domain": "Databases, SQL & Storage",
                "subdomain": "SQL Engine & Storage Architecture",
                "mergedFrom": ["medium-sql-2", "medium-sql-28"]
            }
        },

        # 31. RBAC in Data Platforms
        "medium-adf-29": {
            "merged_from": ["medium-adf-29", "dl-easy-15"],
            "item": {
                "id": "medium-adf-29",
                "question": "What is Role-Based Access Control (RBAC) in modern data platforms, and how is it implemented across Azure Data Factory and Data Lake storage?",
                "answer": """Role-Based Access Control (RBAC) is an authorization paradigm that restricts resource access based on assigned organizational roles rather than granting individual user permissions. In enterprise cloud data platforms (e.g., Azure Data Factory, ADLS Gen2, Microsoft Fabric), RBAC is decoupled into control-plane and data-plane access:

1. **Control-Plane RBAC (Azure Resource Manager - ARM)**:
   - Governs management actions on the service instances themselves.
   - Built-in roles in Azure Data Factory:
     - **Data Factory Contributor**: Create, edit, monitor, and delete pipelines, datasets, and linked services. Cannot grant access to other users.
     - **Data Factory Reader**: View factory definitions and inspect live/historical pipeline runs.
     - **User Access Administrator**: Manage role assignments and access permissions without modifying pipeline code.

2. **Data-Plane RBAC & POSIX ACLs in Data Lakes**:
   - In ADLS Gen2 storage, access requires both Azure RBAC and POSIX Access Control Lists (ACLs):
     - **Storage Blob Data Reader / Contributor**: Grants broad, container-level data access across all files.
     - **POSIX ACLs**: Applied recursively to specific directories or files (`rwx` permissions) to restrict tenant folders.

3. **Best Practices for Enterprise Architecture**:
   - Always assign roles to **Microsoft Entra ID (Azure AD) Security Groups** rather than individual user identities.
   - Enforce the Principle of Least Privilege: data engineers receive Contributor only in non-production environments; production deployments are executed strictly via automated CI/CD service principals.""",
                "difficulty": "MEDIUM",
                "category": "ADF",
                "domain": "Data Governance & Quality",
                "subdomain": "Enterprise Security & Governance",
                "mergedFrom": ["medium-adf-29", "dl-easy-15"]
            }
        },

        # 32. Fabric Data Engineering Experience
        "medium-fabric-33": {
            "merged_from": ["medium-fabric-33", "onelake-52"],
            "item": {
                "id": "medium-fabric-33",
                "question": "What is the Data Engineering experience in Microsoft Fabric, and what core artifacts and runtime capabilities does it provide?",
                "answer": """The Data Engineering experience is one of Microsoft Fabric's core persona-tailored workloads, engineered specifically for code-first data engineers, data scientists, and distributed compute workloads:

1. **Core Workspace Artifacts**:
   - **Fabric Lakehouse**: A centralized data storage artifact offering raw file storage (`Files` zone) and ACID transactional tables (`Tables` zone) serialized in Delta Parquet with automatic OneLake catalog registration.
   - **Apache Spark Notebooks**: Interactive web-based multi-language development interfaces supporting PySpark, Scala, Spark SQL, and SparklyR with co-authoring, automatic session recovery, variable persistence, and rich data visualization.
   - **Spark Job Definitions (SJDs)**: Production-grade headless compute execution artifacts used to submit compiled batch jobs (JARs or Python scripts) on a schedule or via CI/CD pipelines without notebook UI overhead.
   - **Environment Items**: Centralized compute definitions allowing teams to standardize Spark runtime versions (e.g., Fabric Runtime 1.2 or 1.3), install custom Python/Conda libraries, and configure Spark cluster sizing.

2. **Serverless Spark Runtime & Pool Management**:
   - Features instantaneous Spark pool startup (sub-10 seconds) through pre-warmed node infrastructure.
   - Automatically handles auto-scaling and dynamic worker allocation based on query load, eliminating the overhead of configuring, managing, and patching dedicated Kubernetes or VM clusters.

3. **Native OneLake & Cross-Experience Interoperability**:
   - Seamlessly integrates with the Data Factory experience for visual DAG orchestration and automatically exposes Lakehouse tables to the Data Warehouse and Power BI experiences via the read-only SQL Analytics Endpoint.""",
                "difficulty": "MEDIUM",
                "category": "FABRIC",
                "domain": "Analytics, BI & AI",
                "subdomain": "Fabric Architecture & Storage",
                "mergedFrom": ["medium-fabric-33", "onelake-52"]
            }
        }
    }
