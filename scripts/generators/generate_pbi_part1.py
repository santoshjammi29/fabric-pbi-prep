import json

pbi_part1 = []

# Niche 1: Advanced DAX, Context Transition, & Engine Internals (40 questions)
dax_qas = [
    ("Explain the deterministic mechanism of Auto-Exist in the VertiPaq engine when slicing data across multiple columns of the same physical table. How does it cause unexpected blank results, and how do you programmatically bypass it?",
     "1. Auto-Exist Mechanics: When a visual contains filters on multiple columns of the same table, VertiPaq combines them into a single joint filter of existing combinations, trying to minimize context size.\n\n"
     "2. Blank Results: If you slice columns that are logically independent but physically in the same table, and the specific combination doesn't exist in the active data (even if individual values do), Auto-Exist silently prunes the cross-join, returning BLANK instead of rows.\n\n"
     "3. Programmatic Bypass: Break the single-table boundary by using independent dimension tables (Star Schema) or wrap filters inside `TREATAS` or `CROSSFILTER` modifiers in CALCULATE to force evaluation on separate columns without joining them internally."),
    
    ("Detail how Context Transition behaves when an explicit DAX measure is called inside a row context over a table containing duplicate rows without a unique primary key. What happens to the internal calculation footprint?",
     "1. Context Transition: When a measure is evaluated inside a row context (e.g., inside `ADDCOLUMNS` or an iterator), the row context is converted into an equivalent filter context containing filters for all columns of the current row.\n\n"
     "2. Duplicate Row Impact: If the table has duplicate rows without a primary key, context transition cannot isolate a single row. It filters the table for all columns matching the duplicates, causing the measure to aggregate over all duplicate rows instead of the single row. This inflates the memory footprint and calculation results recursively."),
    
    ("Compare the physical, logical, and performance differences between utilizing TREATAS for virtual relationship injection versus establishing a physical inactive relationship activated via USERELATIONSHIP.",
     "1. USERELATIONSHIP (Physical): Relies on pre-built, sorted relationship indexes in the VertiPaq model. When activated, the engine queries the existing join indices. High performance, zero runtime relationship build overhead.\n\n"
     "2. TREATAS (Virtual): Injects filters from a column/table to another table at runtime. Logically flexible but physically requires the Formula Engine to build temporary join tables dynamically. If cardinality is high, TREATAS degrades query performance relative to USERELATIONSHIP due to runtime hashing costs."),
    
    ("In the context of the VertiPaq engine's query plans, contrast a Logical Plan with a Physical Plan. Which specific operators indicate that a DAX query is running suboptimally and relying heavily on the Formula Engine (FE) instead of the Storage Engine (SE)?",
     "1. Logical vs Physical Plan: Logical plan represents the semantic steps of the query. Physical plan represents the concrete execution steps executed by the engines. (2) Suboptimal operators: Look for `CallbackDataID` or heavy use of FE iterators (e.g., `AddColumns`, `Filter`) in the physical plan. If the plan shows multiple SE scans sending intermediate rowsets to the FE for nested loops, it indicates SE-to-FE bottlenecking."),
    
    ("What is a CallbackDataID? Under what exact scenarios does the Storage Engine trigger it to call back to the Formula Engine, and what architectural strategies eliminate it to ensure pure SE parallel processing?",
     "1. CallbackDataID: A runtime callback where the Storage Engine (SE) halts parallel scanning because it cannot evaluate a calculation (e.g., non-scalar UDFs, complex string logic, or division by zero checks) and sends the rows to the single-threaded Formula Engine (FE) to compute.\n\n"
     "2. Elimination Strategies: Replace complex conditional branch logic with clean mathematical lookups. Avoid using `IF` branches that check for division by zero; use `DIVIDE` instead. Pre-calculate values in Power Query or SQL to keep DAX evaluations purely scalar, letting SE run in parallel."),
    
    ("Deep-dive into Expanded Tables. If Table A has a many-to-one relationship with Table B, explain how filtering Table A can implicitly filter columns in Table B when evaluating filters passed as table arguments in CALCULATE.",
     "1. Expanded Tables: Under the hood, VertiPaq views a table as including all columns of its related tables on the 'one' side of relationships. (2) Filter propagation: When Table A (Fact) is filtered, the related Table B (Dimension) is implicitly expanded in memory. A filter on Table A does not propagate upstream to Table B unless bidirectional cross-filtering is enabled, but passing Table A as a filter argument in CALCULATE carries the expanded columns of Table B, restricting Table B attributes logically."),
    
    ("How does KEEPFILTERS alter the default filter-overwriting behavior of CALCULATE when a column-level filter is applied to a context where that same column is already filtered by an external visual matrix?",
     "1. Default CALCULATE: Overwrites any existing filters on the specified column with the new filter arguments. (2) KEEPFILTERS: Instead of overwriting, it performs an intersection (`AND` operation) between the existing filter context and the new filter parameters, preserving the external visual matrix slicing context."),
    
    ("Explain the performance implications of using ALLSELECTED() without arguments within a complex iterator like SUMX vs passing a specific table or column reference. How does it manage the internal shadow filter context?",
     "1. Shadow Filter Context: `ALLSELECTED()` restores the active visual filters by referencing a shadow filter context saved in memory. (2) Iterator performance: Calling `ALLSELECTED()` without arguments inside `SUMX` forces the Formula Engine to rebuild this shadow context for every single row iteration. This leads to exponential complexity. Always pass specific column references to limit the scope of the shadow context rebuilds."),
    
    ("Analyze the structural differences between Value Encoding and Hash Encoding (Dictionary Encoding) in VertiPaq. What architectural rules dictate which encoding the engine selects for a specific column?",
     "1. Value Encoding: Used for integers/decimals. Subtracts a base value and stores the differences directly. Allows direct mathematical aggregations without dictionary lookups. (2) Hash Encoding: Builds a dictionary mapping distinct values to integer IDs. Used for text and high-cardinality keys. (3) Selection Rules: VertiPaq analyzes data types and distinct ratios during processing. If a column is numeric and has low dispersion, it selects Value Encoding; otherwise, it falls back to Hash Encoding."),
    
    ("How does the Bit-Packing phase of the VertiPaq compression engine operate? What role does column sorting play in optimizing bit-packing efficiency, and how can you enforce sort order profiles via external tools?",
     "1. Bit-Packing: Stores values using the minimum number of bits required to represent the maximum ID (e.g., if max ID is 3, it uses 2 bits per row instead of 32). (2) Sorting: Sorting columns groups identical values together. This maximizes Run-Length Encoding (RLE) efficiency before bit-packing. (3) Enforcement: Use Tabular Editor to configure the `Sort By Column` properties or structure source tables in SQL using clustered indexes to align sorting orders during processing."),
    
    ("Why does a visual fail with an \"unhandled out of memory\" error when a DAX query forces Materialization? What exact structural patterns in DAX cause the Formula Engine to materialize massive temporary tables in memory?",
     "1. Materialization: Occurs when the Formula Engine must build a physical table in memory to process an operation (like joining unlinked high-cardinality columns). (2) OOM Cause: If a DAX expression uses nested iterators over large tables (e.g., `CROSSJOIN` or `GENERATE` over columns with >100K distinct values), the FE attempts to materialize millions of rows in the JVM/engine heap, saturating capacity limits and crashing the visual."),
    
    ("Contrast the behavior of ALL, ALLEXCEPT, ALLNOBLANKROW, and ALLCROSSFILTERED. What are the precise architectural use cases where ALL will fail to clear a filter context but ALLCROSSFILTERED succeeds?",
     "1. ALL: Clears all filters on a table/column, returning all rows including the blank row generated by referential integrity violations. (2) ALLEXCEPT: Clears filters except on specified columns. (3) ALLNOBLANKROW: Clears filters but excludes the blank row. (4) ALLCROSSFILTERED: Clears all filters across the entire relationship path. If a filter is applied to a related table, `ALL` on the fact table won't clear the related dimension filters, whereas `ALLCROSSFILTERED` successfully clears all related filters along the path."),
    
    ("Describe an edge-case scenario where SELECTEDVALUE fails to return an alternative value because the underlying column contains actual BLANK records along with multiple distinct values. How do you rewrite the expression to distinguish a native blank from a multi-select state?",
     "1. Failure Mode: If a column has actual BLANK values, and a user selects multiple values (including BLANK), `SELECTEDVALUE` returns the alternative value, which is confusing if the user explicitly wanted to check for a single select. (2) Rewrite: Use `HASONEVALUE` or `COUNTROWS(VALUES(column)) = 1` combined with explicit checks: `IF(HASONEVALUE(column), VALUES(column), alternative_value)`, isolating single-value states cleanly."),
    
    ("Explain the mechanics of Data Lineage in DAX. If you construct a virtual table using SUMMARIZE and then attempt to filter a physical model column using that virtual table, why might data lineage break, and how does SUBSTITUTEWITHINDEX or TREATAS fix it?",
     "1. Data Lineage: DAX tracks the source columns of virtual tables to propagate filters. (2) Lineage Break: Using `SUMMARIZE` with calculated columns or aggregations strips the lineage from the output columns, preventing them from filtering the physical model. (3) Resolution: Use `TREATAS` to explicitly inject the lineage back: `TREATAS(virtual_table, physical_column)`, restoring filter propagation."),
    
    ("How do you implement an enterprise-grade Dynamic Currency Conversion model that handles daily historical exchange rates without causing cartesian explosion or killing query performance in a multi-billion row Fact table?",
     "1. Model Design: Store daily exchange rates in a separate Exchange Rate Fact table linked to Date and Currency dimensions. (2) DAX optimization: Avoid joining rates inside a row-by-row iterator. Instead, use a star schema design and write measures that retrieve the rate using `CALCULATE` and `TREATAS` or active relationships, evaluating currency conversion only at the aggregate level, keeping query times sub-second."),
    
    ("Detail the precise execution order inside a CALCULATE statement containing multiple filter modifiers, column filters, and table filters. Which gets evaluated first: user-defined filters, USERELATIONSHIP, or CROSSFILTER directives?",
     "1. Modifier Evaluation: First, relationship modifiers (`USERELATIONSHIP`, `CROSSFILTER`) are evaluated to establish the physical execution paths.\n\n"
     "2. Filter parameters: Second, user-defined filters (column and table filters) are evaluated. Table filters are evaluated as table arguments.\n\n"
     "3. Context merge: Finally, these new filters are merged into the existing filter context, with CALCULATE modifiers taking precedence, triggering context transition if needed."),
    
    ("In semi-additive measure calculations (e.g., Inventory Balance closing stock), why is using LASTNONBLANK or LASTNONBLANKVALUE highly inefficient on large datasets, and what optimized DAX design pattern should replace it?",
     "1. Inefficiency: `LASTNONBLANK` scans the dates backward row-by-row, evaluating the expression for each date to find the last non-blank value, forcing single-threaded FE loops. (2) Optimized Pattern: Retrieve the last date with data using `MAX` on a helper index or tracking table, then filter the date context directly: `CALCULATE(SUM(Inventory[Balance]), TREATAS({last_date}, Date[Date]))`, enabling SE parallel execution."),
    
    ("What are the internal differences between how the Formula Engine executes COUNTROWS(Table) vs COUNT(Table[Column]) vs DISTINCTCOUNT(Table[Column]) at the storage layer?",
     "1. COUNTROWS(Table): Simply counts the active rows in the table. Extremely fast SE scan. (2) COUNT(Table[Column]): Scans the column and excludes null values. (3) DISTINCTCOUNT(Table[Column]): Scans the column dictionary, counting unique IDs. If the column is value-encoded, SE performs a fast hash scan. If it is dictionary-encoded, it counts the dictionary items directly, which is faster than scanning all rows."),
    
    ("Explain how the engine evaluates a physical Bi-directional Relationship under the hood. How does it propagate filters upstream, and why does this drastically increase the probability of ambiguous query paths or performance degradation?",
     "1. Propagation: Injects the fact table's keys back into the related dimension table's filter context. (2) Ambiguity: Creates loops in the relationship graph. When a query runs, the engine finds multiple paths to filter a table. (3) Performance: The engine must build massive cross-filtering tables at runtime, preventing simple join pruning and degrading query performance."),
    
    ("Detail the computational overhead of using the SEARCH and CONTAINS functions within a high-cardinality dimension table. How can these be refactored into a structural data model change to achieve sub-second response times?",
     "1. Overhead: These functions execute string searches row-by-row inside the Formula Engine. This bypasses VertiPaq indexes and results in slow scans on high-cardinality columns. (2) Refactoring: Parse search attributes during ETL (Power Query/SQL). Split text into separate columns or flags (e.g., tag columns), converting string searches into fast integer/boolean matches in the star schema."),
    
    ("What happens when you combine CALCULATE with a filter parameter that references a measure instead of a naked column? Walk through the implicit context transitions that occur step-by-step.",
     "1. Step 1: CALCULATE evaluates the measure parameter. (2) Step 2: Because the parameter is a measure, Spark/DAX executes an implicit context transition, converting any row context into a filter context. (3) Step 3: The measure is evaluated under this new filter context. The resulting scalar value is then used as the filter criteria inside CALCULATE, which can lead to unexpected results if the row context had duplicate keys."),
    
    ("How does the engine handle cross-filtering across tables in a Star Schema when a filter is applied to a degenerate dimension residing directly inside the Fact table versus a snowflake dimension table?",
     "1. Degenerate Dimension: Slicing by a degenerate column residing in the Fact table is fast because it avoids joins. However, it blocks dictionary sharing. (2) Snowflake Dimension: Requires traversing multiple relationships (e.g., Category -> Subcategory -> Product -> Fact). Each join step in the snowflake path increases physical plan complexity, increasing scan times relative to a flat star dimension."),
    
    ("Explain the mechanical difference between VALUES() and DISTINCT() when an referential integrity violation occurs in the data model (i.e., a Fact row has a foreign key missing from the Dimension table).",
     "1. VALUES(): Returns all distinct values of the column plus an additional blank row (the 'Unknown' member) generated by the engine to represent the referential integrity violation. (2) DISTINCT(): Returns only the actual values present in the column, excluding the system-generated blank row, which can hide mismatches in data quality audits."),
    
    ("How do you debug and resolve a circular dependency error when creating two calculated columns in the same table, even if their formulas do not directly reference one another?",
     "1. Cause: Calculated columns depend on the entire table row structure by default. If Column A references Column B, and Column B references a third column, the compiler assumes a dependency loop. (2) Resolution: Wrap columns inside `ALLEXCEPT` or use `CALCULATE` with explicit keys to restrict the evaluation context, or build the columns upstream in Power Query/SQL to avoid DAX circular dependency checks."),
    
    ("Explain the concept of arbitrary shaping of filters in DAX. Why does passing an unpivoted or multi-column filter table to CALCULATE cause performance degradation, and how do you normalize it?",
     "1. Arbitrary Filters: Occurs when you pass a table containing multiple columns and values as a filter argument to CALCULATE. (2) Performance: The engine cannot map this to simple column index structures; it must build a temporary multi-column hash table at runtime. (3) Normalization: Split the filters into separate column-level arguments in CALCULATE: `CALCULATE(Measure, Col1 = x, Col2 = y)`, allowing the engine to evaluate them independently."),
    
    ("How do you construct a DAX measure that calculates a 12-month rolling average of sales without using any out-of-the-box Time Intelligence functions (DATESINPERIOD, PARALLELPERIOD), ensuring it functions correctly on non-standard fiscal calendars?",
     "1. DAX Pattern: Use Date key offsets. In the Date table, map a sequential integer column representing the month index (`MonthKey`: 1, 2, 3...). (2) The Measure: \n"
     "`CALCULATE(SUM(Sales[Amount]), FILTER(ALL(Date), Date[MonthKey] > MAX(Date[MonthKey]) - 12 && Date[MonthKey] <= MAX(Date[MonthKey]))) / 12`. This bypasses calendar month limits, executing correctly on non-standard fiscal calendars."),
    
    ("Analyze the performance of SUMX(Sales, Sales[Qty] * RELATED(Product[Price])) versus creating a calculated column in the Sales table for Qty * Price and referencing it via SUM. Which consumes more RAM and which consumes more CPU?",
     "1. Calculated Column: Consumes more RAM. The values are computed at refresh and stored permanently in memory, increasing the dictionary and file size. (2) SUMX: Consumes more CPU. It evaluates the price lookup on-the-fly for every row during query runtime. For large tables, SUMX is preferred to save memory, provided the CPU can handle the lookup speed."),
    
    ("Explain the inner workings of Row-Level Security (RLS) filter propagation. When a security filter is applied to a Dimension table, under what specific conditions will that filter fail to propagate to a Fact table, or worse, propagate in a loop?",
     "1. Propagation conditions: RLS filters flow along the relationship direction (one-to-many). If the relationship is set to single direction (Dimension filters Fact), the security filter propagates correctly. (2) Failure: If the relationship is set to bi-directional, or if there are multiple active paths, RLS can propagate in loops, causing circular dependency errors or leaking data access if the engine fails to resolve the secure path."),
    
    ("Describe how the CROSSFILTER function behaves when set to None. Does it completely eliminate all filter interactions between two tables, or are there edge cases where filters still bleed through via expanded tables?",
     "1. None behavior: Disables the relationship filter propagation for that specific CALCULATE block. (2) Bleeding: Filters can still bleed through if you filter a column that belongs to the expanded table structure of a related table. The physical relationship is disabled, but the logical column expansion remains active if referenced directly."),
    
    ("What is the impact of High-Cardinality Columns on the VertiPaq engine's L1/L2 CPU cache utilization during a complex DAX aggregation query?",
     "1. Cache Misses: High-cardinality columns (e.g., timestamps, UUIDs) have large dictionaries. (2) Impact: During scans, the CPU cannot fit the large dictionary mapping tables into L1/L2 caches. This forces frequent RAM fetches, causing CPU pipeline stalls and slowing down query execution speeds."),
    
    ("How do you optimize a DISTINCTCOUNT calculation over a trillion-row dataset when operating in a Composite Model architecture where the target column resides in a DirectQuery source?",
     "1. The Challenge: DirectQuery sends `COUNT(DISTINCT)` SQL to the source database, which is extremely slow on trillion-row tables. (2) Optimization: (a) Enable User-Defined Aggregations in Import mode. (b) Pre-calculate distinct counts at a higher level (e.g., daily/product category) in an Import table. The engine queries the Import table for high-level requests and folds down to DirectQuery only for detail scans."),
    
    ("How does the ISINSCOPE function differ structurally from ISFILTERED or HASONEVALUE when implementing complex, multi-level parent-child hierarchy custom aggregations?",
     "1. ISINSCOPE: Returns true only when the specified column is the active level in the visual hierarchy. (2) ISFILTERED: Returns true if the column has any active filter, even if the filter propagates from another level. (3) HASONEVALUE: Returns true if the column has exactly one value. `ISINSCOPE` is critical for hierarchy metrics to prevent showing parent totals at child rows."),
    
    ("What are Segment Size boundaries in Power BI Premium capacities? How does adjusting the default segment size (e.g., via Tabular Editor) impact execution parallelism within the Storage Engine?",
     "1. Segment Size: The number of rows processed in a single thread partition (default 8M rows). (2) Parallelism: If a table has 80M rows, VertiPaq splits it into 10 segments, scanning them in parallel using 10 threads. Adjusting segment size (e.g., to 2M) increases thread concurrency, speed up scans on multi-core systems, but increases dictionary metadata overhead."),
    
    ("Explain the internal execution path of a Nested Iterator (e.g., SUMX(Table1, AVERAGEX(Table2, ...))). How do you prevent exponential time complexity ($O(N \\times M)$) when calculating metrics over large datasets?",
     "1. Execution Path: The outer loop (`SUMX`) iterates over `Table1` row-by-row. For each row, the inner loop (`AVERAGEX`) scans `Table2` entirely. (2) Prevention: Avoid referencing related tables inside nested loops. Pre-calculate values or write measures using set-based operations (like summarizations) rather than nested iterators, keeping complexity linear."),
    
    ("Why is ERROR() termination logic inside a DAX expression considered a performance killer? How does the Formula Engine handle conditional branches that contain potential error states?",
     "1. Error Handling: If a conditional branch contains an `ERROR()` function, the Formula Engine cannot compile the branch into a simple scalar lookup. (2) Performance: It disables Storage Engine optimization and executes the calculation row-by-row in the FE, checking every record for error triggers, which inflates execution time."),
    
    ("What is the explicit structural difference between GENERATE and GENERATEALL in DAX, and how do they map to relational operators like CROSS APPLY and OUTER APPLY?",
     "1. GENERATE: Evaluates the second table expression for each row of the first table. If the second expression returns an empty table, the row is excluded. Maps to `CROSS APPLY` (inner join). (2) GENERATEALL: Retains rows from the first table even if the second expression returns empty, padding columns with nulls. Maps to `OUTER APPLY` (left outer join)."),
    
    ("Explain how NONEMPTY behaves in MDX versus how FILTER(..., NOT(ISBLANK(...))) behaves in DAX when Power BI interfaces with Excel Pivot Tables via the XMLA Endpoint.",
     "1. MDX NONEMPTY: Evaluates intersections of axes and prunes empty combinations at the storage layer before returning the grid. (2) DAX FILTER: Power BI translates MDX calls from Excel. If translated as a heavy DAX `FILTER`, it forces the Formula Engine to scan and check every row for blanks, which can cause slow performance in Excel Pivot Tables connected via XMLA."),
    
    ("How can you leverage VAR assignment to lock down an evaluation context? Explain the precise moment a variable is evaluated and why it behaves as a constant during subsequent iterations of a nested loop.",
     "1. Variable Evaluation: A variable (`VAR`) is evaluated at the moment of its definition, using the active filter context at that step. (2) Constant Behavior: Once evaluated, it stores a static scalar value. During subsequent iterations of nested loops or CALCULATE blocks, the variable does not re-evaluate, bypassing context transition and acting as a constant."),
    
    ("When evaluating a heavy calculation, how can you determine if performance is constrained by Thread Pool Starvation within the SSAS/Power BI engine capacity?",
     "1. Diagnosis: Monitor the capacity metrics using XMLA/Profiler or log analysis tools. Look for high `Query Wait` metrics or long queue times before queries start. (2) Indicator: If CPU utilization is low but query times are high, and the active thread count matches the capacity limit, the engine is experiencing Thread Pool Starvation."),
    
    ("Explain the interaction between a DAX query and DirectQuery memory limits. What happens if a visual requests a matrix grouping that exceeds the maximum rowset allocation size set at the capacity layer?",
     "1. Memory Limit: Power BI enforces limits on rowset sizes returned from DirectQuery sources (typically 1 million rows). (2) Failure: If a matrix grouping requests more rows, the engine cancels the query and the visual fails with a 'Resultset too large' error, protecting the gateway and database memory.")
]

# Niche 2: Complex Data Modeling, Composite Models, & Enterprise Architecture (40 questions)
modeling_qas = [
    ("Design an architecture to handle SCD Type 2 (Slowly Changing Dimensions) directly inside a Power BI Import model. How do you structure the relationships between the fact tables and the historical dimension intervals to prevent cartesian expansions and keep DAX measures simple?",
     "1. Relationship Design: Do not join on the natural key directly. Create a surrogate key in the dimension table: `SurrogateKey = Hash(NaturalKey, StartDate)`. (2) Fact Mapping: During ETL (Power Query/SQL), map each fact row's transaction date to the matching historical interval in the dimension table, and write the surrogate key to the Fact table. (3) Star Schema: Establish a standard 1:M relationship between the surrogate keys, maintaining a clean star schema with simple, high-performance DAX measures."),
    
    ("You are designing a Composite Model combining a massive corporate DirectQuery dataset (Synapse) with an Excel Import payload owned by finance. Explain how Storage Mode Mapping (Dual vs DirectQuery vs Import) must be configured on shared dimensions to eliminate severe performance degradation caused by cross-island queries.",
     "1. Storage Mode: Configure shared dimensions (e.g., Date, Customer) to use 'Dual' storage mode. (2) Optimization: Dual mode allows the engine to treat the dimension as Import when querying the Excel Import table (fast local joins) and as DirectQuery when querying the Synapse table (folding the join to the source database), eliminating slow cross-island network queries."),
    
    ("What are Hybrid Tables in Power BI Premium? Detail the process of setting up a table containing an archival Import partition, a rolling Incremental Import partition, and a real-time DirectQuery partition. How does the engine ensure zero duplication of records at the boundary interface?",
     "1. Hybrid Tables: Tables containing both Import and DirectQuery partitions. (2) Configuration: Use Tabular Editor or Power BI Desktop to configure Incremental Refresh. Enable 'Get real-time data with DirectQuery'. (3) Boundary Isolation: The engine uses the partition range parameters (`RangeStart`/`RangeEnd`) to slice query windows. The DirectQuery partition filters out the dates loaded in the Import partitions, preventing data duplication."),
    
    ("Explain the structural risks and optimization strategies for dealing with Many-to-Many relationships joined via a bridge table vs a direct cross-filter relationship with a cardinality of $1:M$ or $M:M$.",
     "1. Structural Risks: Many-to-many relationships cause ambiguous filter propagation paths and degrade query performance because the engine must build temporary cross-join tables at runtime. (2) Optimization: Avoid M:M relationships. Convert them to 1:M relationships using a bridge table with single-direction filtering. If M:M is required, use a direct relationship and restrict cross-filtering to single-direction to limit evaluation loops."),
    
    ("How do you design a data model that supports Dynamic Many-to-Many Multi-Role Dimensions (e.g., an organization where an employee can belong to multiple cost centers simultaneously, and cost centers can contain multiple employees) without creating circular paths or destroying filter performance?",
     "1. Bridge Design: Create an Employee table (Dimension), a Cost Center table (Dimension), and a physical Employee-CostCenter Bridge table (containing unique keys). (2) Relationships: Connect Employee to Bridge (1:M, single filter) and Cost Center to Bridge (1:M, single filter). (3) DAX: Write measures using `CALCULATE` and `TREATAS` or `CROSSFILTER` to activate bidirectional propagation only when evaluating specific cost allocation metrics, preventing circular loops."),
    
    ("You have a fact table with 500 million rows and 4 different date columns (Order Date, Ship Date, Due Date, Delivery Date). Architect a solution comparing Role-Playing Dimensions via multiple physical tables vs active/inactive relationships via DAX. What are the enterprise governance and performance trade-offs?",
     "1. Role-Playing Dimensions (Multiple tables): Create 4 distinct Date tables (Date Order, Date Ship...). Simplifies self-service report building, but increases model dictionary memory footprint. (2) Active/Inactive Relationships (Single Date table): Connect all date keys to one Date table (1 active, 3 inactive). Bypasses memory footprint inflation, but requires developers to write custom measures using `USERELATIONSHIP` for every metric, increasing code complexity. In enterprise schemas, role-playing dimensions are preferred for self-service usability."),
    
    ("Explain the concept of Data Lineage and Table Mechanics when utilizing Calculation Groups. How do calculation items modify the data type, formatting, and structural lineage of underlying measures? What happens when two calculation groups conflict on the same visual?",
     "1. Calculation Groups: Intercept and rewrite DAX measures dynamically. (2) Lineage: Calculation items can alter formatting strings (using `SELECTEDMEASUREFORMATSTRING()`) and return different data types (e.g., converting numeric output to text). (3) Conflict: If two groups conflict, Power BI evaluates them based on their 'Precedence' property. The group with the higher precedence runs first, wrapping its evaluation around the lower precedence group."),
    
    ("Describe the Referential Integrity Violation (RIV) handling mechanism in Power BI. What visual indications and internal model changes happen when a Fact table contains blank or unmatched foreign key keys? How does this affect inner vs outer join generation in DirectQuery?",
     "1. RI Violation: If a Fact row contains a key missing from the related Dimension table. (2) Model adjustment: VertiPaq adds a blank row to the Dimension table to represent this 'Unknown' member, and routes unmatched rows to it. (3) DirectQuery Join: If 'Assume Referential Integrity' is disabled, the engine generates slow `OUTER JOIN` SQL to preserve unmatched rows. Enabling it forces the engine to compile fast `INNER JOIN` queries."),
    
    ("Architect a Multi-Fact Model containing mismatched granularities (e.g., Actual Sales at the Daily/Product level and Budgets at the Monthly/Product Category level). How do you model this without flattening the budget data or using complex DAX allocation techniques?",
     "1. Granularity alignment: Create shared Dimension tables at the lowest common granularity (e.g., Month table, Product Category table). (2) Relationships: Connect the Budget table directly to Month and Category dimensions (1:M). Connect the Sales table to Date and Product dimensions (1:M). (3) Measure logic: Write measures that check the active visual context; if queried at the daily level, return BLANK for Budget, preventing incorrect allocations."),
    
    ("What is Horizontal Partitioning in the Power BI back-end? How do you partition an enterprise data model manually using Tabular Editor to achieve optimal parallel processing during scheduled refreshes?",
     "1. Horizontal Partitioning: Splits a table into multiple logical partitions (e.g., by year or region). (2) Refresh optimization: Using Tabular Editor, configure separate partition queries. During refresh, the engine processes partitions in parallel threads. This reduces source database connection duration and allows refreshing only active partitions (e.g., current year) while keeping historical partitions static."),
    
    ("Detail the performance impact of Column Cardinality. If a table has a DateTime column accurate to the millisecond, what specific steps must an architect take to optimize storage, and why is splitting it into separate Date and Time columns highly effective for VertiPaq?",
     "1. Cardinality Impact: Contiguous DateTime values have high cardinality. This prevents VertiPaq from building compact dictionaries and reduces compression ratios, bloating model size. (2) Resolution: Split the column into a Date column (low cardinality) and a Time column (accurate to the minute/hour). This reduces dictionary sizes by up to 99%, optimizing memory usage and query execution cache lines."),
    
    ("In a DirectQuery over Snowflake or Databricks environment, explain how Query Reduction settings and Assume Referential Integrity properties alter the SQL statements generated by the Power BI engine.",
     "1. Query Reduction: Restricts the volume of queries sent by disabling cross-filtering on visuals or forcing a 'Apply' button. (2) Assume RI: Instructs the engine to compile SQL using `INNER JOIN` instead of `LEFT OUTER JOIN` by assuming every foreign key in the fact table has a match in the dimension table, reducing SQL execution times."),
    
    ("How do you design an optimal data model for tracking Parent-Child Hierarchies with variable depth (e.g., an HR Org Chart or Financial Chart of Accounts)? What are the limitations of flattening this in Power Query versus processing it via DAX?",
     "1. DAX Path functions: Use `PATH()` to generate a delimited string of parent IDs. Use `PATHITEM()` to extract hierarchy levels into separate columns. (2) Comparison: Flattening in Power Query requires complex recursive self-joins that slow down refresh. Processing via DAX path functions is fast and dynamically handles varying hierarchy depths."),
    
    ("Explain the mechanics of User-Defined Aggregations in a Composite Model. How do you map an Import aggregation table to a DirectQuery fact table so that the engine automatically hits the cache for high-level queries but seamlessly folds down to the source for atomic details?",
     "1. User-Defined Aggregations: Import aggregation tables store pre-summarized data (e.g., sales by date). (2) Mapping: In the model view, configure 'Manage Aggregations'. Map the aggregation columns to their related columns in the DirectQuery fact table. (3) Query routing: When a user visual queries data at the aggregate level, the engine intercepts the request and queries the fast Import aggregation table instead of sending SQL to the database."),
    
    ("What are Automatic Aggregations in Power BI Premium? How does the internal machine learning orchestration layer identify which aggregation tables to build, and how does it execute refreshes on those hidden tables without locking user queries?",
     "1. Automatic Aggregations: Power BI analyzes user query logs. (2) Identification: An ML orchestration layer identifies the most frequent query granularities and automatically builds hidden aggregation tables in memory. (3) Refresh: Refreshes these tables in the background. The active query planning layer routes queries seamlessly without locking the model."),
    
    ("Detail the constraints, limitations, and security behaviors of building a data model on top of a Power BI Dataset/Semantic Model connection (Live Connect) that is then transformed into a Composite Model by adding local data sources.",
     "1. Composite Model constraints: Live connections normally lock the model. Converting to a composite model (DirectQuery over Power BI Dataset) allows adding local sources, but: (a) RLS defined on the remote dataset is preserved but cannot be modified locally. (b) It creates 'cross-island' joins if you join local and remote columns, causing network latency bottlenecks."),
    
    ("Architect a solution for handling Multi-Language Metadata and Data Translation within a unified Power BI corporate model. How do you ensure users in Germany see German column headers and data rows, while US users see English, using a single deployment asset?",
     "1. Metadata translation: Use Tabular Editor to configure translations for table and column names. (2) Data translation: Store translations in a database table. In the model, write measures that query the active user's language settings (using `USERCULTURE()`) and filter the translation rows dynamically, returning localized strings."),
    
    ("Explain the structural differences and design criteria between a Star Schema and a Snowflake Schema within an in-memory tabular environment. Under what specific constraints is a snowflake schema actually more optimal than a pure star schema?",
     "1. Star Schema: Flat dimensions connected to fact tables. Bypasses relationship traversal, maximizing scan speed. (2) Snowflake: Normalized dimensions. (3) Constraint choice: Snowflake is preferred only when a dimension has high-cardinality attributes that vary independently (e.g., address columns), where normalizing saves memory dictionary footprint without impacting scan speeds."),
    
    ("How do you manage and resolve Ambiguity Errors in models with multiple relationships between two tables when utilizing complex nested paths, without relying on bad practices like making all relationships bi-directional?",
     "1. Ambiguity resolution: Keep only one relationship path active. Set secondary paths to inactive. (2) DAX control: Activate the specific inactive relationship path inside your measures using `USERELATIONSHIP`: `CALCULATE(Measure, USERELATIONSHIP(Fact[ShipDate], Date[Date]))`, maintaining clean and deterministic data paths."),
    
    ("Describe how Object-Level Security (OLS) alters the metadata model of a dataset. What happens to a report visual if a user logs in who does not have access to a column referenced in that visual's tooltips, sorting, or hidden conditional formatting?",
     "1. OLS Metadata: OLS completely hides the secured columns from the metadata schema. (2) Visual failure: If a restricted user logs in, the visual attempting to reference the column (even in tooltips or conditional formatting) fails to resolve the schema, returning a 'Visual has encountered an error' message."),
    
    ("What is the impact of Degenerate Dimensions on memory utilization within an Import model? How should an enterprise architect optimize a dimension that has high cardinality but is required for transactional drilling?",
     "1. Degenerate Dimension: A dimension column residing directly in the Fact table. (2) Memory impact: High cardinality degenerate columns (like order numbers) prevent run-length encoding. (3) Optimization: Split the degenerate column into separate index keys, or load transactional details to a separate 1:1 table linked to the Fact table, keeping the main Fact table slim."),
    
    ("How do you model a Junk Dimension in an enterprise data warehouse schema destined for Power BI? What are the benefits regarding structural table footprints and cross-join operations?",
     "1. Junk Dimension: Combines multiple low-cardinality flags and indicators into a single lookup table. (2) Benefits: Eliminates separate flag columns in the Fact table. Replaces them with a single surrogate key, optimizing dictionary memory and preventing expensive cross-join operations between flags."),
    
    ("Explain how the engine routes queries in a Composite Model when a single visual requires columns from an Import Storage Mode table, a DirectQuery Storage Mode table, and a Dual Storage Mode table.",
     "1. Query routing: The engine splits the execution. It queries the local Import and Dual tables first. (2) Data transfer: It sends the retrieved intermediate keys to the DirectQuery database as part of the SQL join parameters, executing the final query on the source database to return the combined resultset."),
    
    ("What are the specific architectural limitations encountered when implementing Row-Level Security (RLS) on DirectQuery models connected to a cloud data warehouse utilizing Single Sign-On (SSO)?",
     "1. SSO Limits: When SSO is enabled, queries are executed under the credentials of the logged-in user. (2) RLS conflict: If RLS is configured in Power BI and also in the data warehouse, they can conflict, resulting in double-filtering or connection timeouts. It is best to delegate RLS completely to the warehouse database when using SSO."),
    
    ("Detail how to implement a Write-Back scenario in a Power BI ecosystem using Power Apps, Power Automate, and DirectQuery storage modes, ensuring the underlying data model updates instantaneously without requiring a full dataset refresh.",
     "1. Write-Back Setup: Embed a Power App inside the Power BI report. (2) Trigger: The user enters data in the App. Power Automate executes a SQL write to the database. (3) Instant Refresh: The Power App calls the Power BI integration function `PowerBIIntegration.refresh()`. Since the target table uses DirectQuery mode, the visual queries the database instantly, reflecting the updates."),
    
    ("How does a Data Island form in a Composite Model, and what are the specific governance strategies required to prevent end-users from creating unmanageable data islands when leveraging DirectQuery over enterprise semantic models?",
     "1. Data Island: Forms when users import local spreadsheets and link them to DirectQuery enterprise models. (2) Governance: Disable the tenant setting 'Allow XMLA Endpoints and analyze in Excel with on-premises datasets'. Educate users to request shared dimensions in the central model instead of building local islands."),
    
    ("Explain how the Max Intermediate Rowset Count setting affects execution when a data model joins across distinct DirectQuery data sources at the visualization layer.",
     "1. Rowset Limit: Limits the number of rows that can be fetched from one DirectQuery source to join with another source locally (default 1 million rows). (2) Failure: If exceeded, the visual fails, protecting memory buffers from exhaustion during cross-database joins."),
    
    ("Describe the architectural design pattern required to support Dynamic Target Benchmarking, where targets are dynamically recalculated based on the user's erratic selection of arbitrary peer groups across multiple disconnected dimensions.",
     "1. Disconnected dimensions: Create separate, unlinked parameter tables for selecting peer groups (e.g., `PeerCountry`, `PeerCategory`). (2) DAX Measure: Write measures that capture these selections using `VALUES` or `CONCATENATEX` and apply them inside `CALCULATE` using `TREATAS` to filter the Fact table dynamically, enabling dynamic benchmarking."),
    
    ("How do you handle a scenario where a Fact table contains values that exist across overlapping time granularities (e.g., weekly forecasts mixed with monthly quotas), ensuring accurate aggregation regardless of the date context pulled into a visual?",
     "1. Granularity mapping: Create separate Fact tables for weekly and monthly granularities. (2) Date dimension: Map dates to weeks and months. (3) Measure logic: Write measures that check the active visual context: `IF(ISFILTERED(Date[Date]), [WeeklyForecast], [MonthlyQuota])`, ensuring correct aggregations without double-counting."),
    
    ("What is the Max Connections per Data Source property in DirectQuery? How do you calculate the optimal value for this property based on concurrent user count and capacity core allocations?",
     "1. Max Connections: Sets the max concurrent SQL queries sent per session. (2) Formula: `OptimalConnections = CoreCount * ConcurrentUsers * 2`. Setting it too high saturates the database connection limits; too low throttles visual rendering queues, causing slow dashboard loads."),
    
    ("Detail how to implement Dynamic Format Strings via Calculation Groups so that currency formatting shifts automatically based on a user's geographical location or selected currency dimension, without converting numeric metrics into text strings.",
     "1. Calculation Group: Create a Calculation Group with a calculation item. (2) Item expression: Set the expression to `SELECTEDMEASURE()`. (3) Format String expression: Write a dynamic format string expression: `SELECTEDVALUE(Currency[FormatMask], \"$#,##0\")`. This alters the formatting mask dynamically without altering data types."),
    
    ("How do you optimize a data model containing massive text blobs (e.g., customer support logs) that cannot be discarded but are causing severe model bloating and breaking the VertiPaq execution cache?",
     "1. Model Optimization: Move text blobs to a separate, late-loaded transactional table. (2) Key relation: Maintain a 1:1 relationship with the primary fact table. (3) DirectQuery: Set the text table to DirectQuery mode so that text blobs are fetched from the source database only when requested, saving RAM cache space."),
    
    ("Explain the internal structural behavior of Auto Date/Time in Power BI Desktop. Why is this feature universally disabled in enterprise architectures, and what is the exact memory cost per column if left active?",
     "1. Auto Date/Time: Creates a hidden, physical Date table for every DateTime column in the model. (2) Memory Cost: If a table has 20 DateTime columns, it generates 20 hidden tables, each containing complete calendar records. This bloats model size and dictionary memory by megabytes or gigabytes, degrading performance."),
    
    ("Architect an infrastructure that supports Cross-Tenant Dataset Sharing (B2B). How do you ensure data security, performance isolation, and compliance when external corporate partners build reports on top of your internal premium datasets?",
     "1. B2B Sharing: Invite partners as Azure AD B2B guest users. (2) Entitlements: Grant 'Build' permissions on the target datasets. (3) Security: Enforce Row-Level Security (RLS). External queries are executed under their guest credentials, validating RLS rules and protecting data boundaries."),
    
    ("What are the design trade-offs of embedding a Python or R visual inside a report regarding data modeling constraints, serialization overhead, and gateway execution bottlenecks?",
     "1. Serialization: Power BI must serialize the data table into a CSV file, start a Python/R process locally or on the gateway, run the script, and return the image. (2) Bottlenecks: This process is slow, bypasses the caching engine, and can overload the gateway CPU during concurrent accesses."),
    
    ("Explain how Bidirectional Cross-Filtering on Many-to-Many relationships affects the internal generation of physical query paths, and why it can lead to non-deterministic data paths.",
     "1. M:M Bidirectional filters: Forces filters to flow back and forth across tables. (2) Path loops: The engine finds multiple routes to propagate a filter context. (3) Ambiguity: This can cause the engine to select different paths depending on visual groupings, returning inconsistent calculations."),
    
    ("How do you model Exchange Rate Risk Fluctuations in a system that requires tracking Transaction Currency, Functional Currency, and Reporting Currency simultaneously across different ledger operational nodes?",
     "1. Currency Modeling: Create a Fact table with currency keys. (2) Rate table: Store historical exchange rates per currency pair. (3) DAX: Write measures that identify the selected currency, retrieve the rate, and execute the conversion: `SUMX(Fact, Fact[Amount] * [Rate])`, enabling multi-currency ledger tracking."),
    
    ("What is the structural impact of configuring a relationship based on a multi-column composite key in Power BI, and how should an engineer refactor this into a single-key system using Power Query?",
     "1. Composite keys: VertiPaq does not support multi-column relationships natively. It creates hidden composite keys under the hood, bloating memory. (2) Refactoring: In Power Query, merge the composite columns into a single key column: `Table.AddColumn(tab, \"Key\", each Text.Combine({[Col1], [Col2]}, \"_\"))`, optimizing dictionary space."),
    
    ("Explain how Query Parallelism is handled inside Power BI when executing multiple independent visuals on a single report page. How does this map to backend data model structures?",
     "1. Parallelism: Power BI runs multiple query threads concurrently. (2) Engine limits: Constrained by the capacity's maximum connection and thread limits. (3) Backend layout: If visuals query different tables (Data Islands), threads run independently. If they query the same table, they compete for the same scan locks, making model partitioning critical."),
    
    ("Design a deployment architecture that leverages Incremental Refresh on a table that undergoes historical updates up to 90 days in the past (late-arriving facts), ensuring the data remains accurate without reprocessing years of historical data.",
     "1. Incremental Refresh: Configure the table in Power BI. Set 'Store rows where date is in the last 5 years' and 'Refresh rows where date is in the last 90 days'. (2) Data updates: During scheduled refreshes, Spark only queries the source database for records matching the last 90 days, updating late-arriving facts while keeping historical partitions intact.")
]

# Niche 3: Power Query (M), Data Ingestion Optimization, & Query Folding (first 20 questions)
m_qas_part1 = [
    ("Detail the exact algebraic laws that govern Query Folding. Provide five specific transformations or functions in M that immediately break query folding when connecting to a relational database like SQL Server.",
     "1. Query Folding Laws: Power Query translates M expressions into equivalent SQL statements and pushes them to the source database. (2) Folding breaks: (a) `Table.AddIndexColumn`. (b) `Table.SplitColumn`. (c) `Table.TransformColumnTypes` when converting text to complex types. (d) Using custom M helper functions inside `Table.SelectRows`. (e) `Table.RemoveRowsWithErrors`."),
    
    ("Explain the difference between Table.Buffer and List.Buffer. Under what exact operational parameters does buffering a table prevent query folding from breaking further downstream, and when does it introduce catastrophic memory exhaustion?",
     "1. Table.Buffer: Loads the entire table into the executor's RAM. Breaks query folding immediately, but prevents redundant source queries during iterative operations. (2) List.Buffer: Caches a single column/list in memory. (3) Memory Risk: Buffering tables with millions of rows consumes high memory, causing host OOMs and page thrashing."),
    
    ("You are building an M query connecting to a REST API that enforces strict pagination via a next-page token returned in the HTTP response header. Write out the structural logic of a recursive M function or List.Generate loop that dynamically extracts all tokens without hardcoding page thresholds or causing stack overflows.",
     "1. Pagination Pattern: Use `List.Generate` to loop. (2) Logic: \n"
     "`List.Generate(()=> [Result = try GetPage(null) otherwise null, Token = \"\"], each [Result] <> null, each [Result = try GetPage([Result][NextToken]) otherwise null, Token = [Result][NextToken]], each [Result][Data])`. This reads tokens dynamically, accumulating pages in-memory without recursive stack overflows."),
    
    ("How does the Power Query Formula Language (M) Engine handle thread allocation and lazy evaluation?",
     "1. Lazy Evaluation: M evaluates steps only when requested by downstream steps. If a query defines a step that is never referenced, the engine skips it completely. (2) Threads: Allocates a background thread pool to evaluate data source streams, fetching partitions in parallel when possible."),
    
    ("Describe how to debug a Formula.Firewall error. What are the structural rules regarding combining data from an external source (e.g., a SQL database) with a local configuration source (e.g., an Excel parameter list) within a single M query? How do Privacy Levels interact with this?",
     "1. Firewall Error: Occurs when a query attempts to join data from two different sources with conflicting privacy levels (e.g., Private and Public). (2) Resolution: Configure Privacy Levels to 'Organizational' or 'Ignore Privacy Levels' in settings, or use parameters to filter query boundaries explicitly, avoiding cross-source leakage."),
    
    ("When utilizing Incremental Refresh, how does Power Query communicate with the data source via parameters? Explain what happens if you manually modify the RangeStart and RangeEnd parameters to use a data type other than DateTime.",
     "1. Parameters: Incremental refresh uses `RangeStart` and `RangeEnd` (DateTime parameters) to slice SQL queries. (2) Modification: If modified to text or integer, the Power BI service cannot bind partition ranges, breaking the incremental refresh setup and resulting in full table re-loads."),
    
    ("What is the internal processing difference between Table.Distinct and Table.Group when performing deduplication operations over multi-million row files stored in an Azure Data Lake Gen2? Which method optimizes stream processing?",
     "1. Table.Distinct: Scans files and drops duplicates, optimizing memory usage. (2) Table.Group: Groups rows by key and runs aggregation. (3) Stream processing: `Table.Distinct` is faster because it allows the storage driver to prune identical blocks, whereas `Table.Group` forces sorting and aggregation loops."),
    
    ("Explain the impact of the Data Ingestion Chunk Size and Odbc.DataSource connection string modifications on preventing gateway timeout thresholds during high-volume transfers.",
     "1. Ingestion optimization: Modify `Odbc.DataSource` connection strings to increase fetch buffer sizes. (2) Chunk Size: Configure connection parameters to fetch data in larger block sizes, reducing TCP handshake frequency and avoiding gateway timeout thresholds."),
    
    ("How do you implement a robust, enterprise-grade error-handling framework in M that intercepts connection drops, missing source columns, or data type casting errors, logging the anomalies to an isolated audit table while allowing the clean data pipeline to complete processing?",
     "1. M Error Handling: Use `try ... otherwise` or `try ... catch` blocks inside transformations. (2) Implementation: Wrap casting steps: `try Table.TransformColumnTypes(...)`. If it returns an error, output a record to a quarantine stream, union clean records, and write errors to an audit log table."),
    
    ("Detail the operational mechanics of the On-Premises Data Gateway when running in a load-balanced cluster. How does it manage encryption keys, distribute concurrent M evaluation queries across cluster nodes, and mitigate spooling disk constraints?",
     "1. Gateway Cluster: Distributes queries across cluster nodes based on CPU/memory load. (2) Encryption: Keys are synchronized across nodes. (3) Spooling: If memory is exhausted, the gateway spools data chunks to local temp directories, making disk I/O performance critical for concurrent query executions."),
    
    ("What is Query Folding over Web Sources? Is it possible to fold queries down to an OData or Web API endpoint? If so, what native M functions must be used to ensure parameters like $filter and $select are pushed to the API instead of filtered locally?",
     "1. Web Folding: Yes, using `OData.Feed` or `Web.Contents` with query parameters. (2) Implementation: Pass parameters inside the `Query` option: `Web.Contents(\"url\", [Query=[#\"$filter\"=\"id eq 5\"]])`, forcing the OData API to evaluate the filters, achieving query folding over web sources."),
    
    ("Explain how Value.Constant and Expression.Evaluate can be used to construct a dynamic M parsing engine. What are the extreme security vulnerabilities and maintenance risks associated with this pattern?",
     "1. Dynamic Parsing: `Expression.Evaluate` compiles M code strings dynamically at runtime. (2) Vulnerabilities: Highly prone to code injection. A malicious database value can execute arbitrary M scripts. Maintenance is complex because dynamic code blocks bypass compiler syntax checks."),
    
    ("Contrast the performance and execution flow of merging tables in Power Query (Table.NestedJoin) followed by expanding columns versus creating a physical data model relationship and using DAX or handling the join inside a SQL View upstream.",
     "1. NestedJoin expanding: Power Query executes the join row-by-row locally if it cannot fold, causing high memory usage. (2) Upstream SQL View (Optimal): Executed in the database, utilizing indices. Creating physical relationships in the model is faster because VertiPaq uses pre-sorted relationship pointers."),
    
    ("How does the Power Query engine manage memory when executing an unpivot operation across 500 columns and 50 million rows? What optimizations should be implemented at the M script layer to avoid memory thrashing?",
     "1. Unpivot memory: Unpivoting many columns creates a massive row stream, causing memory thrashing. (2) Optimizations: Remove unneeded columns *before* unpivoting. Split the unpivot steps into smaller batches, or perform the unpivot upstream in SQL using `UNPIVOT`, keeping M memory low."),
    
    ("What is the Enhanced Compute Engine in Power BI Dataflows? Explain how it accelerates transformations by shifting storage to an SQL-backed infrastructure, and what requirements must be met to trigger its utilization.",
     "1. Enhanced Compute Engine: Backs Dataflows with a SQL database. (2) Acceleration: Accelerates joins and aggregations by folding them to the underlying SQL engine. (3) Requirements: Must use Power BI Premium and set the table's storage property to 'Cache' or 'DirectQuery enabled'."),
    
    ("Describe the exact configuration adjustments required in M to connect to a GraphQL API that mandates multi-layered JSON payloads and custom headers for authorization, ensuring scheduled refreshes don't break in the cloud service.",
     "1. GraphQL Ingestion: Use `Web.Contents` with POST requests. (2) Configuration: \n"
     "`Web.Contents(\"url\", [Headers=[#\"Content-Type\"=\"application/json\", Authorization=\"Bearer token\"], Content=Json.FromValue([query=\"{ users { id name } }\"])])`. This compiles headers and query strings cleanly, preventing refresh errors."),
    
    ("How does the choice between Table.TransformColumnTypes executed as a single multi-column step versus multiple sequential steps impact query evaluation efficiency and code maintainability?",
     "1. Single Step (Optimal): Compiles type changes into a single list evaluation, allowing SQL connectors to fold the types in one SELECT statement. (2) Multiple steps: Triggers multiple sequential loops in the M engine, breaking folding and reducing maintainability."),
    
    ("Explain the difference between DirectQuery for Dataflows and standard Dataflows. What structural modifications must be executed on a dataflow entity to make it accessible via DirectQuery storage mode?",
     "1. DirectQuery for Dataflows: Allows querying Dataflow tables in real-time without importing records. (2) Modifications: Enable the 'Enhanced Compute Engine' setting on the Dataflow, and set the tables to 'Optimized' storage mode, enabling direct SQL connections from query engines."),
    
    ("How do you implement automated Schema Drift mitigation inside an M script that reads raw CSV/Parquet files from a directory, ensuring that if a new column is added or an old one dropped, the refresh does not fail?",
     "1. Schema Drift Mitigation: Avoid hardcoding column names in M functions (e.g., in `Table.SelectColumns`). (2) Resolution: Use `Table.ColumnNames` to retrieve schema columns dynamically: `Table.SelectColumns(source, List.Intersect({Table.ColumnNames(source), required_cols}))`, preventing script crashes on schema changes."),
    
    ("Detail how the M Engine's Cache handles partial data refreshes. If multiple tables share an upstream reference query (staging query), how many times does the engine fetch data from the source, and how do you enforce a single evaluation?",
     "1. Staging caching: The M engine evaluates the staging query separately for each child table by default, querying the source multiple times. (2) Single Evaluation: Set the staging query to 'Enable Load = false'. Buffering the staging output or setting up dataflows forces a single evaluation, caching data for child tables.")
]

for idx, (q, a) in enumerate(dax_qas):
    pbi_part1.append({
        "id": f"pbi-dax-{idx+1}",
        "category": "POWER BI",
        "niche": "Advanced DAX, Context Transition, & Engine Internals",
        "question": q,
        "answer": a
    })

for idx, (q, a) in enumerate(modeling_qas):
    pbi_part1.append({
        "id": f"pbi-model-{idx+1}",
        "category": "POWER BI",
        "niche": "Complex Data Modeling, Composite Models, & Enterprise Architecture",
        "question": q,
        "answer": a
    })

for idx, (q, a) in enumerate(m_qas_part1):
    pbi_part1.append({
        "id": f"pbi-pq-{idx+1}",
        "category": "POWER BI",
        "niche": "Power Query (M), Data Ingestion Optimization, & Query Folding",
        "question": q,
        "answer": a
    })

# Write pbi_part1.json
with open("/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/pbi_part1.json", "w") as f:
    json.dump(pbi_part1, f, indent=2)

print("Power BI Part 1 JSON generated successfully. Total questions:", len(pbi_part1))
