/* data_mssql.js — MS SQL / T-SQL Data Engineering Concepts
   Santosh Jammi | Principal Data Architect
   Coverage: Beginner → Intermediate → Advanced → Architect
*/
window.MSSQL_DATA = [
  /* ══════════════════ BEGINNER ══════════════════ */
  {
    id: "sql-b-01", title: "SELECT, WHERE & ORDER BY Fundamentals",
    level: "beginner", category: "Query Basics",
    description: "The foundation of T-SQL — retrieving, filtering, and ordering data. Even expert engineers return to these fundamentals for readability-first query design, especially in Medallion Silver-layer validation queries.",
    code: `-- EU BFSI: Query transaction data from Silver layer
-- Always use schema prefix (dbo.) — avoids ambiguity in multi-schema databases

SELECT TOP 100
    t.transaction_id,
    t.amount_eur,
    t.currency,
    t.status,
    t.transaction_date,
    c.customer_name,
    c.country_code
FROM dbo.fact_transactions t
INNER JOIN dbo.dim_customers c ON t.customer_id = c.customer_id
WHERE
    t.transaction_date >= DATEADD(DAY, -30, GETUTCDATE())  -- last 30 days
    AND t.status IN ('SETTLED', 'REVERSED')
    AND t.amount_eur > 0
    AND t.is_flagged = 0
ORDER BY
    t.transaction_date DESC,
    t.amount_eur DESC;

-- Count by status with percentage
SELECT
    status,
    COUNT(*) AS txn_count,
    SUM(amount_eur) AS total_eur,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS pct_of_total
FROM dbo.fact_transactions
WHERE transaction_date >= '2024-01-01'
GROUP BY status
ORDER BY txn_count DESC;`,
    notes: [
      "Always use schema prefix (dbo.tablename) — prevents unintended resolution to temp tables",
      "TOP 100 for exploration — never run SELECT * on production tables without WHERE + TOP",
      "GETUTCDATE() not GETDATE() for EU compliance — all timestamps should be stored in UTC",
      "Column aliasing (AS) improves report readability — match column names to Power BI field names"
    ],
    use_case: "Exploratory queries on the Azure SQL Silver layer transaction table for EU BFSI daily reconciliation reporting, used as basis for Power BI Direct Query semantic model views."
  },
  {
    id: "sql-b-02", title: "Aggregate Functions & GROUP BY",
    level: "beginner", category: "Aggregation",
    description: "GROUP BY with aggregate functions (SUM, COUNT, AVG, MIN, MAX) is the workhorse for financial KPI calculation — daily volumes, currency exposure, and transaction counts for BFSI reporting.",
    code: `-- Daily transaction volume by currency — Gold layer metric
SELECT
    CAST(transaction_date AS DATE) AS report_date,
    currency,
    COUNT(*) AS txn_count,
    SUM(amount_eur) AS total_volume_eur,
    AVG(amount_eur) AS avg_txn_eur,
    MIN(amount_eur) AS min_txn_eur,
    MAX(amount_eur) AS max_txn_eur,
    SUM(CASE WHEN is_high_value = 1 THEN 1 ELSE 0 END) AS high_value_count,
    SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_count
FROM dbo.fact_transactions
WHERE transaction_date BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY
    CAST(transaction_date AS DATE),
    currency
HAVING
    COUNT(*) > 10          -- exclude low-volume currency/date combos
    AND SUM(amount_eur) > 0
ORDER BY report_date, total_volume_eur DESC;

-- Cross-tab: settled vs rejected count per country
SELECT
    c.country_code,
    COUNT(*) AS total_txns,
    SUM(CASE WHEN t.status = 'SETTLED'  THEN 1 ELSE 0 END) AS settled,
    SUM(CASE WHEN t.status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected,
    ROUND(
        SUM(CASE WHEN t.status = 'REJECTED' THEN 1.0 ELSE 0 END) / COUNT(*) * 100, 2
    ) AS rejection_rate_pct
FROM dbo.fact_transactions t
JOIN dbo.dim_customers c ON t.customer_id = c.customer_id
GROUP BY c.country_code
ORDER BY rejection_rate_pct DESC;`,
    notes: [
      "HAVING filters AFTER aggregation — use WHERE for row-level filters, HAVING for group-level filters",
      "CASE WHEN inside SUM() is the T-SQL equivalent of COUNT(IF) — compute conditional counts efficiently",
      "GROUP BY all non-aggregated SELECT columns — SQL Server raises error if any column is omitted",
      "Store amounts in EUR at landing time — avoids FX rate dependency in reporting queries"
    ],
    use_case: "Computing daily EU BFSI transaction KPIs for Azure Synapse SQL dedicated pool, feeding Power BI Direct Query reports with pre-aggregated Gold layer metrics."
  },
  {
    id: "sql-b-03", title: "JOINs: INNER, LEFT, RIGHT, FULL",
    level: "beginner", category: "Joins",
    description: "Understanding join types and their behavior on NULLs and unmatched rows is fundamental for correct financial data enrichment. A wrong join type can silently drop transactions or inflate row counts.",
    code: `-- INNER JOIN: only matching records (used for enriched reporting)
SELECT
    t.transaction_id,
    t.amount_eur,
    c.customer_name,
    cp.counterparty_name
FROM dbo.fact_transactions t
INNER JOIN dbo.dim_customers c     ON t.customer_id = c.customer_id
INNER JOIN dbo.dim_counterparties cp ON t.counterparty_id = cp.counterparty_id
WHERE t.transaction_date = '2024-01-15';

-- LEFT JOIN: all transactions, customer info where available
-- NULL customer_name → orphaned transactions (data quality issue)
SELECT
    t.transaction_id,
    t.amount_eur,
    c.customer_name,
    CASE WHEN c.customer_id IS NULL THEN 'ORPHANED' ELSE 'MATCHED' END AS match_status
FROM dbo.fact_transactions t
LEFT JOIN dbo.dim_customers c ON t.customer_id = c.customer_id
WHERE t.transaction_date = '2024-01-15';

-- FULL OUTER JOIN: find mismatches in both directions (reconciliation)
SELECT
    COALESCE(s.transaction_id, t.transaction_id) AS txn_id,
    s.amount AS source_amount,
    t.amount_eur AS target_amount,
    CASE
        WHEN s.transaction_id IS NULL THEN 'TARGET_ONLY'
        WHEN t.transaction_id IS NULL THEN 'SOURCE_ONLY'
        ELSE 'MATCHED'
    END AS reconciliation_status
FROM dbo.source_transactions s
FULL OUTER JOIN dbo.fact_transactions t
    ON s.transaction_id = t.transaction_id
    AND s.transaction_date = t.transaction_date
WHERE s.transaction_id IS NULL OR t.transaction_id IS NULL;  -- show mismatches only`,
    notes: [
      "INNER JOIN drops rows with no match — use LEFT JOIN for transactions, INNER for lookups you know are complete",
      "FULL OUTER JOIN is the reconciliation pattern — identifies records in source not in target and vice versa",
      "Always check for NULL in LEFT JOIN results — IS NULL on right table columns = unmatched rows",
      "COALESCE(a.col, b.col) in FULL OUTER JOIN provides unified key from either side"
    ],
    use_case: "Daily reconciliation between EU payment gateway source system and the Azure SQL Silver table, using FULL OUTER JOIN to identify missing or extra records before close-of-business."
  },
  {
    id: "sql-b-04", title: "CASE Expressions & NULL Handling",
    level: "beginner", category: "Expressions",
    description: "CASE expressions implement conditional logic directly in SQL, replacing complex application-layer branching. Proper NULL handling with ISNULL/COALESCE/NULLIF is critical for financial calculations where NULL ≠ 0.",
    code: `-- CASE WHEN: classify transactions by risk tier
SELECT
    transaction_id,
    amount_eur,
    currency,
    -- Simple CASE
    CASE status
        WHEN 'SETTLED'  THEN 'Complete'
        WHEN 'REJECTED' THEN 'Failed'
        WHEN 'PENDING'  THEN 'In Progress'
        ELSE 'Unknown'
    END AS status_label,

    -- Searched CASE: range-based classification
    CASE
        WHEN amount_eur >= 100000 THEN 'TIER_1_LARGE'
        WHEN amount_eur >= 10000  THEN 'TIER_2_MEDIUM'
        WHEN amount_eur >= 1000   THEN 'TIER_3_SMALL'
        ELSE                           'TIER_4_MICRO'
    END AS transaction_tier,

    -- AML flag: combined conditions
    CASE
        WHEN amount_eur > 10000 AND is_cross_border = 1 THEN 1
        WHEN amount_eur > 50000 THEN 1
        ELSE 0
    END AS aml_review_flag

FROM dbo.fact_transactions;

-- NULL handling — critical for financial accuracy
SELECT
    transaction_id,
    ISNULL(amount_eur, 0) AS amount_eur_safe,      -- replace NULL with 0
    COALESCE(fx_rate, 1.0) AS fx_rate_safe,        -- first non-NULL from list
    NULLIF(quantity, 0) AS qty_safe,                -- return NULL if 0 (avoids divide-by-zero)
    amount_eur / NULLIF(quantity, 0) AS unit_price, -- safe division
    ISNULL(customer_name, 'UNKNOWN') AS customer_display
FROM dbo.fact_transactions;`,
    notes: [
      "NULLIF(x, 0) returns NULL when x=0 — the standard pattern for safe division (amount / NULLIF(qty,0))",
      "COALESCE evaluates left-to-right and returns first non-NULL — more flexible than ISNULL (2-arg only)",
      "Nested CASE expressions are valid but reduce readability — prefer IIF() for simple binary conditions",
      "Searched CASE (WHEN condition THEN) is evaluated top-to-bottom — most restrictive condition first"
    ],
    use_case: "Classifying EU BFSI transactions by risk tier and AML flags in the Silver layer view, used as input to the compliance reporting stored procedure for the regulatory reporting dashboard."
  },
  {
    id: "sql-b-05", title: "INSERT, UPDATE, DELETE & Transactions",
    level: "beginner", category: "DML",
    description: "Proper DML with explicit transaction control and error handling is foundational for data integrity. In financial systems, every write operation must be wrapped in a transaction to prevent partial updates.",
    code: `-- Explicit transaction: all-or-nothing batch insert
BEGIN TRANSACTION;
BEGIN TRY

    -- Insert new transactions to Silver
    INSERT INTO dbo.fact_transactions (
        transaction_id, amount_eur, currency, status, transaction_date,
        customer_id, is_high_value, _load_ts
    )
    SELECT
        src.transaction_id,
        src.amount * ISNULL(fx.rate, 1.0) AS amount_eur,
        src.currency,
        src.status,
        src.transaction_date,
        src.customer_id,
        CASE WHEN src.amount * ISNULL(fx.rate, 1.0) > 10000 THEN 1 ELSE 0 END,
        GETUTCDATE()
    FROM dbo.stage_transactions src
    LEFT JOIN dbo.dim_fx_rates fx
        ON fx.currency = src.currency AND fx.rate_date = src.transaction_date
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.fact_transactions t
        WHERE t.transaction_id = src.transaction_id  -- dedup check
    );

    DECLARE @inserted INT = @@ROWCOUNT;

    -- Update status for reversed transactions
    UPDATE t
    SET t.status = 'REVERSED',
        t.reversed_ts = GETUTCDATE(),
        t.reversal_reason = s.reason
    FROM dbo.fact_transactions t
    INNER JOIN dbo.stage_reversals s ON t.transaction_id = s.original_txn_id;

    DECLARE @updated INT = @@ROWCOUNT;

    COMMIT TRANSACTION;
    PRINT FORMATMESSAGE('Success: %d inserted, %d updated', @inserted, @updated);

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    THROW;  -- re-raise to calling ADF pipeline activity
END CATCH;`,
    notes: [
      "Always use BEGIN TRANSACTION + COMMIT/ROLLBACK for multi-statement DML — guarantees atomicity",
      "NOT EXISTS dedup check prevents duplicate inserts on pipeline retry — essential for idempotency",
      "@@ROWCOUNT must be captured immediately after the statement — next statement resets it",
      "THROW re-raises the original error with full context — ADF pipeline receives the error for retry logic"
    ],
    use_case: "Loading daily transaction batch from staging table to Silver fact table in Azure SQL, with duplicate detection and transaction rollback on any failure, ensuring 100% data consistency for EU BFSI compliance."
  },
  {
    id: "sql-b-06", title: "CREATE TABLE, ALTER TABLE & Indexes",
    level: "beginner", category: "DDL",
    description: "Proper table design with correct data types, constraints, and indexes is foundational for Azure SQL performance. Financial data tables require specific design choices for GDPR compliance, audit trails, and query performance.",
    code: `-- Create Silver transactions table with proper constraints
CREATE TABLE dbo.fact_transactions (
    -- Surrogate key (auto-increment for internal joins)
    txn_sk           BIGINT IDENTITY(1,1) NOT NULL,

    -- Business key (natural key from source system)
    transaction_id   NVARCHAR(50)   NOT NULL,

    -- Financial fields — use DECIMAL not FLOAT for money
    amount           DECIMAL(18, 4) NOT NULL,
    amount_eur       DECIMAL(18, 2) NOT NULL,
    fx_rate          DECIMAL(10, 6) NULL,
    currency         CHAR(3)        NOT NULL,

    -- Categorization
    status           NVARCHAR(20)   NOT NULL,
    transaction_type NVARCHAR(50)   NULL,

    -- Date/time — store as DATE/DATETIME2, not DATETIME (more precise, smaller)
    transaction_date DATE           NOT NULL,
    transaction_ts   DATETIME2(7)   NULL,

    -- Foreign keys
    customer_id      NVARCHAR(50)   NULL,
    counterparty_id  NVARCHAR(50)   NULL,

    -- Flags
    is_high_value    BIT            NOT NULL DEFAULT 0,
    is_flagged       BIT            NOT NULL DEFAULT 0,

    -- Audit columns (GDPR requirement)
    _source          NVARCHAR(100)  NOT NULL,
    _load_ts         DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
    _modified_ts     DATETIME2      NOT NULL DEFAULT GETUTCDATE(),

    -- Constraints
    CONSTRAINT PK_fact_transactions PRIMARY KEY CLUSTERED (txn_sk),
    CONSTRAINT UQ_transaction_id UNIQUE (transaction_id),
    CONSTRAINT CK_amount_positive CHECK (amount > 0),
    CONSTRAINT CK_currency_format CHECK (currency LIKE '[A-Z][A-Z][A-Z]')
);

-- Indexes — covering index for most common query pattern
CREATE NONCLUSTERED INDEX IX_fact_transactions_date_currency
ON dbo.fact_transactions (transaction_date, currency)
INCLUDE (amount_eur, status, customer_id)  -- covering columns
WHERE is_flagged = 0;  -- filtered index — smaller, faster for non-flagged queries

-- Add a column (zero-downtime on Azure SQL with online rebuild)
ALTER TABLE dbo.fact_transactions
ADD counterparty_country CHAR(2) NULL;`,
    notes: [
      "Use DECIMAL(18,2) not FLOAT/MONEY for financial amounts — avoids floating-point rounding errors",
      "DATETIME2(7) has 100ns precision vs DATETIME's 3ms — required for high-frequency trading audit logs",
      "Filtered indexes (WHERE is_flagged=0) are dramatically smaller than full indexes — query optimizer prefers them",
      "INCLUDE columns in non-clustered indexes avoid key lookups — critical for covering common SELECT patterns"
    ],
    use_case: "Designing the Azure SQL Silver layer fact_transactions table for TCS EU BFSI, with proper decimal types for GDPR-compliant financial records and covering indexes that reduce query latency for Power BI reports by 70%."
  },
  {
    id: "sql-b-07", title: "Stored Procedures & User-Defined Functions",
    level: "beginner", category: "Programmability",
    description: "Stored procedures encapsulate business logic, enable parameterized execution from ADF, and reduce network overhead. Scalar and table-valued functions enable reusable logic in complex reporting queries.",
    code: `-- Stored procedure: parameterized Silver load (called from ADF pipeline)
CREATE OR ALTER PROCEDURE dbo.usp_load_silver_transactions
    @batch_date    DATE,
    @source_system NVARCHAR(100),
    @debug         BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;  -- auto-rollback on error

    DECLARE @rows_inserted INT = 0;
    DECLARE @rows_updated  INT = 0;

    BEGIN TRANSACTION;

    -- Upsert pattern using MERGE
    MERGE dbo.fact_transactions AS tgt
    USING (
        SELECT * FROM dbo.stage_transactions
        WHERE batch_date = @batch_date AND source_system = @source_system
    ) AS src
    ON tgt.transaction_id = src.transaction_id
    WHEN MATCHED AND (tgt.status <> src.status OR tgt.amount_eur <> src.amount_eur) THEN
        UPDATE SET
            tgt.status = src.status,
            tgt.amount_eur = src.amount_eur,
            tgt._modified_ts = GETUTCDATE()
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (transaction_id, amount_eur, currency, status, transaction_date,
                customer_id, _source, _load_ts)
        VALUES (src.transaction_id, src.amount_eur, src.currency, src.status,
                src.transaction_date, src.customer_id, @source_system, GETUTCDATE());

    SET @rows_inserted = @@ROWCOUNT;

    COMMIT TRANSACTION;

    IF @debug = 1
        SELECT @rows_inserted AS rows_affected;

    RETURN 0;
END;

-- Scalar UDF: risk tier classification (use inline TVF for performance)
CREATE OR ALTER FUNCTION dbo.fn_get_risk_tier(@amount_eur DECIMAL(18,2))
RETURNS NVARCHAR(20)
AS
BEGIN
    RETURN CASE
        WHEN @amount_eur >= 100000 THEN 'TIER_1'
        WHEN @amount_eur >= 10000  THEN 'TIER_2'
        WHEN @amount_eur >= 1000   THEN 'TIER_3'
        ELSE 'TIER_4'
    END;
END;

-- Execute from ADF: Stored Procedure activity
EXEC dbo.usp_load_silver_transactions @batch_date = '2024-01-15', @source_system = 'EU_GATEWAY';`,
    notes: [
      "SET XACT_ABORT ON auto-rolls back on any error — removes need for TRY/CATCH in simple procedures",
      "MERGE is the T-SQL upsert — handles INSERT, UPDATE, DELETE in one atomic statement",
      "Scalar UDFs prevent parallelism in execution plans — prefer inline table-valued functions (ITVF) for computed columns",
      "ADF Stored Procedure activity passes parameters by name — match @param names exactly to ADF parameter names"
    ],
    use_case: "ADF pipeline calls usp_load_silver_transactions as a Stored Procedure activity, passing batch_date and source_system as pipeline parameters, enabling zero-code daily batch loading with built-in upsert logic."
  },
  {
    id: "sql-b-08", title: "Views & Schema Design Patterns",
    level: "beginner", category: "DDL",
    description: "Views provide a layer of abstraction over complex table structures, enabling GDPR data masking, simplified Power BI connections, and schema evolution without breaking downstream consumers.",
    code: `-- Gold view: pre-joined, pre-aggregated for Power BI Direct Query
CREATE OR ALTER VIEW dbo.vw_gold_transactions
WITH SCHEMABINDING  -- prevents underlying table changes without dropping view
AS
SELECT
    t.transaction_id,
    t.amount_eur,
    t.currency,
    t.status,
    t.transaction_date,
    t.is_high_value,
    -- GDPR: mask PAN/account numbers in view (show last 4 only)
    c.customer_name,
    REPLICATE('*', LEN(c.account_number) - 4) +
        RIGHT(c.account_number, 4) AS account_number_masked,
    c.country_code,
    cp.counterparty_name,
    cp.is_sanctioned,
    -- Derived columns for reporting
    DATENAME(MONTH, t.transaction_date) AS month_name,
    DATEPART(YEAR,  t.transaction_date) AS report_year,
    DATEPART(MONTH, t.transaction_date) AS report_month,
    DATEPART(WEEK,  t.transaction_date) AS report_week,
    t.is_high_value * t.amount_eur AS high_value_volume
FROM dbo.fact_transactions t
INNER JOIN dbo.dim_customers c      ON t.customer_id      = c.customer_id
INNER JOIN dbo.dim_counterparties cp ON t.counterparty_id = cp.counterparty_id
WHERE t.is_active = 1;
GO

-- Indexed view for pre-computed aggregations (materialized in Azure SQL)
CREATE OR ALTER VIEW dbo.vw_daily_volume_by_currency
WITH SCHEMABINDING
AS
SELECT
    transaction_date,
    currency,
    COUNT_BIG(*) AS txn_count,
    SUM(amount_eur) AS total_volume_eur
FROM dbo.fact_transactions
GROUP BY transaction_date, currency;
GO

-- Create unique clustered index to materialize the view
CREATE UNIQUE CLUSTERED INDEX IX_daily_volume
ON dbo.vw_daily_volume_by_currency (transaction_date, currency);`,
    notes: [
      "WITH SCHEMABINDING prevents dropping underlying tables without first dropping the view — safety guard",
      "Indexed views (materialized views) store aggregation results physically — Power BI queries are instant",
      "GDPR masking in view layer: account numbers masked by default, DBA grants access to unmasked table separately",
      "Power BI Direct Query to views avoids importing data — always reflects current Silver layer state"
    ],
    use_case: "Creating GDPR-compliant Gold views on Azure SQL with built-in data masking for Power BI Direct Query connections, enabling real-time C-level dashboards without exposing raw financial data."
  },

  /* ══════════════════ INTERMEDIATE ══════════════════ */
  {
    id: "sql-i-01", title: "CTEs & Complex Query Composition",
    level: "intermediate", category: "Query Patterns",
    description: "Common Table Expressions (CTEs) enable breaking complex financial queries into readable, named steps. Recursive CTEs are essential for hierarchical data like organizational structures and account hierarchies.",
    code: `-- Multi-step CTE: monthly cohort analysis
WITH
-- Step 1: First transaction per customer (cohort assignment)
customer_first_txn AS (
    SELECT
        customer_id,
        MIN(transaction_date) AS cohort_date,
        DATEFROMPARTS(YEAR(MIN(transaction_date)), MONTH(MIN(transaction_date)), 1) AS cohort_month
    FROM dbo.fact_transactions
    WHERE status = 'SETTLED'
    GROUP BY customer_id
),

-- Step 2: All subsequent transactions with cohort label
txn_with_cohort AS (
    SELECT
        t.customer_id,
        t.transaction_date,
        t.amount_eur,
        c.cohort_month,
        DATEDIFF(MONTH, c.cohort_month, DATEFROMPARTS(YEAR(t.transaction_date), MONTH(t.transaction_date), 1)) AS months_since_cohort
    FROM dbo.fact_transactions t
    INNER JOIN customer_first_txn c ON t.customer_id = c.customer_id
    WHERE t.status = 'SETTLED'
),

-- Step 3: Cohort retention matrix
retention AS (
    SELECT
        cohort_month,
        months_since_cohort,
        COUNT(DISTINCT customer_id) AS active_customers,
        SUM(amount_eur) AS cohort_volume
    FROM txn_with_cohort
    GROUP BY cohort_month, months_since_cohort
)

-- Final: Retention rates vs month-0 baseline
SELECT
    r.cohort_month,
    r.months_since_cohort,
    r.active_customers,
    base.active_customers AS cohort_size,
    ROUND(r.active_customers * 100.0 / base.active_customers, 2) AS retention_pct,
    r.cohort_volume
FROM retention r
INNER JOIN retention base
    ON base.cohort_month = r.cohort_month
    AND base.months_since_cohort = 0
ORDER BY r.cohort_month, r.months_since_cohort;`,
    notes: [
      "CTEs improve readability by naming intermediate result sets — critical for complex regulatory reports",
      "Each CTE reference causes re-evaluation (not caching) — use temp tables for expensive CTEs referenced multiple times",
      "Recursive CTEs require MAXRECURSION hint for deep hierarchies — default limit is 100 levels",
      "Name CTE steps descriptively (customer_first_txn, not cte1) — enables 6-month maintainability"
    ],
    use_case: "Building customer cohort retention analysis for EU BFSI commercial banking, tracking how monthly customer cohorts evolve over time — key input to churn prediction models in the Azure ML pipeline."
  },
  {
    id: "sql-i-02", title: "Window Functions: ROW_NUMBER, RANK, LAG, LEAD",
    level: "intermediate", category: "Analytical Functions",
    description: "Window functions perform calculations across a set of rows related to the current row, without collapsing the result set. They are the cornerstone of financial time-series analysis, trend detection, and ranking.",
    code: `-- Window functions for BFSI transaction analytics
SELECT
    customer_id,
    transaction_date,
    amount_eur,
    currency,
    status,

    -- Ranking within customer — find most recent transaction
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY transaction_date DESC) AS txn_recency_rank,

    -- Dense rank by volume within currency (no gaps)
    DENSE_RANK() OVER (PARTITION BY currency ORDER BY amount_eur DESC) AS volume_rank,

    -- NTILE: assign customers to quartiles by transaction count
    NTILE(4) OVER (PARTITION BY currency ORDER BY amount_eur) AS amount_quartile,

    -- LAG/LEAD: compare to previous/next transaction
    LAG(amount_eur, 1, 0)  OVER (PARTITION BY customer_id ORDER BY transaction_date) AS prev_txn_amount,
    LEAD(amount_eur, 1, 0) OVER (PARTITION BY customer_id ORDER BY transaction_date) AS next_txn_amount,

    -- Running total per customer (cumulative cash flow)
    SUM(amount_eur) OVER (
        PARTITION BY customer_id
        ORDER BY transaction_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_spend,

    -- 7-day moving average per currency
    AVG(amount_eur) OVER (
        PARTITION BY currency
        ORDER BY transaction_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS rolling_7d_avg_eur,

    -- % change vs previous day
    ROUND(
        (amount_eur - LAG(amount_eur) OVER (PARTITION BY customer_id ORDER BY transaction_date))
        / NULLIF(LAG(amount_eur) OVER (PARTITION BY customer_id ORDER BY transaction_date), 0) * 100,
        2
    ) AS pct_change_vs_prev

FROM dbo.fact_transactions
WHERE status = 'SETTLED'
    AND transaction_date BETWEEN '2024-01-01' AND '2024-01-31';`,
    notes: [
      "ROW_NUMBER() + WHERE rank=1 is the standard 'latest record per group' pattern — deduplication essential in ETL",
      "ROWS BETWEEN vs RANGE BETWEEN: use ROWS for predictable window bounds; RANGE can include ties",
      "LAG/LEAD with default value (LAG(col, 1, 0)) avoids NULL in first row — cleaner for percentage calculations",
      "Window functions compute AFTER WHERE but BEFORE HAVING — can't filter on window result in same query level"
    ],
    use_case: "Computing 7-day rolling transaction volumes, customer spend trends, and anomaly detection (sudden spike vs previous day) in Azure Synapse Dedicated Pool for EU BFSI real-time fraud monitoring."
  },
  {
    id: "sql-i-03", title: "PIVOT & UNPIVOT for Report Formatting",
    level: "intermediate", category: "Data Shaping",
    description: "PIVOT transforms rows to columns, enabling cross-tabulation reports (currencies as columns, dates as rows). UNPIVOT does the reverse — critical for normalizing wide-format source data before ELT loading.",
    code: `-- PIVOT: currencies as columns, date as rows (executive dashboard format)
SELECT *
FROM (
    SELECT
        CAST(transaction_date AS DATE) AS report_date,
        currency,
        amount_eur
    FROM dbo.fact_transactions
    WHERE transaction_date BETWEEN '2024-01-01' AND '2024-01-31'
      AND status = 'SETTLED'
) AS source_data
PIVOT (
    SUM(amount_eur)
    FOR currency IN ([EUR], [GBP], [USD], [CHF], [SEK], [NOK])
) AS pivot_result
ORDER BY report_date;

-- Dynamic PIVOT: currencies not hardcoded (handles new currencies automatically)
DECLARE @currencies NVARCHAR(MAX);
DECLARE @sql NVARCHAR(MAX);

SELECT @currencies = STRING_AGG(QUOTENAME(currency), ',')
FROM (SELECT DISTINCT currency FROM dbo.fact_transactions WHERE status = 'SETTLED') c;

SET @sql = N'
    SELECT *
    FROM (
        SELECT CAST(transaction_date AS DATE) AS report_date, currency, amount_eur
        FROM dbo.fact_transactions WHERE status = ''SETTLED''
    ) src
    PIVOT (SUM(amount_eur) FOR currency IN (' + @currencies + ')) pvt
    ORDER BY report_date;';

EXEC sp_executesql @sql;

-- UNPIVOT: normalize wide staging table to tall format for Delta Lake load
SELECT customer_id, metric_name, metric_value
FROM dbo.stage_customer_metrics_wide
UNPIVOT (
    metric_value
    FOR metric_name IN (
        total_txns, total_volume_eur, avg_txn_eur, high_value_count, risk_score
    )
) AS unpvt;`,
    notes: [
      "Dynamic PIVOT with STRING_AGG + QUOTENAME handles new currency codes without code changes",
      "QUOTENAME() wraps column names in brackets — prevents SQL injection in dynamic PIVOT column list",
      "Static PIVOT requires hardcoded column list — use only when column values are finite and stable",
      "UNPIVOT is the ELT normalization pattern — converts source flat files with metric-per-column to tall format"
    ],
    use_case: "Generating the executive currency exposure dashboard for EU BFSI C-level reporting in Azure Synapse, with dynamic PIVOT handling new trading currencies without pipeline code changes."
  },
  {
    id: "sql-i-04", title: "TRY_CATCH Error Handling & Transactions",
    level: "intermediate", category: "Error Handling",
    description: "Robust error handling in T-SQL is critical for production financial systems. TRY_CATCH with transaction management, error logging, and re-throwing enables graceful failure recovery and audit trail maintenance.",
    code: `-- Production error handling pattern with audit log
CREATE OR ALTER PROCEDURE dbo.usp_process_daily_transactions
    @batch_date DATE,
    @source     NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT OFF;  -- Manual transaction control

    DECLARE @proc_name   NVARCHAR(200) = OBJECT_NAME(@@PROCID);
    DECLARE @start_ts    DATETIME2    = GETUTCDATE();
    DECLARE @rows_loaded INT          = 0;
    DECLARE @error_msg   NVARCHAR(MAX);

    -- Log pipeline start to audit table
    INSERT INTO dbo.pipeline_audit_log (proc_name, batch_date, source, start_ts, status)
    VALUES (@proc_name, @batch_date, @source, @start_ts, 'RUNNING');

    DECLARE @audit_id BIGINT = SCOPE_IDENTITY();

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Main business logic
        INSERT INTO dbo.fact_transactions (transaction_id, amount_eur, currency, status, transaction_date, _load_ts)
        SELECT transaction_id, amount_eur, currency, status, transaction_date, GETUTCDATE()
        FROM dbo.stage_transactions
        WHERE batch_date = @batch_date AND source_system = @source
          AND transaction_id NOT IN (SELECT transaction_id FROM dbo.fact_transactions);

        SET @rows_loaded = @@ROWCOUNT;

        -- Validate: reject if 0 rows (potential upstream issue)
        IF @rows_loaded = 0
            THROW 50001, 'Zero rows loaded — possible upstream data issue', 1;

        COMMIT TRANSACTION;

        -- Log success
        UPDATE dbo.pipeline_audit_log
        SET status = 'SUCCESS', rows_loaded = @rows_loaded, end_ts = GETUTCDATE()
        WHERE audit_id = @audit_id;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;

        SET @error_msg = ERROR_MESSAGE();

        -- Log failure with full error context
        UPDATE dbo.pipeline_audit_log
        SET status = 'FAILED',
            error_message = @error_msg,
            error_number = ERROR_NUMBER(),
            error_line = ERROR_LINE(),
            end_ts = GETUTCDATE()
        WHERE audit_id = @audit_id;

        -- Re-raise for ADF to capture and trigger alert
        THROW;
    END CATCH;
END;`,
    notes: [
      "SET XACT_ABORT OFF with manual ROLLBACK gives more control than SET XACT_ABORT ON in complex procedures",
      "SCOPE_IDENTITY() returns the last identity from the current scope — safer than @@IDENTITY (cross-trigger safe)",
      "THROW (no args) re-raises the original error with original error number — preserves ADF error context",
      "Audit log pattern (pipeline_audit_log) provides full run history for GDPR pipeline lineage documentation"
    ],
    use_case: "Production-grade stored procedure called from ADF pipeline, with full audit trail for EU BFSI regulatory compliance, auto-rollback on any failure, and structured error logging for Azure Monitor alerts."
  },
  {
    id: "sql-i-05", title: "JSON & XML in Azure SQL",
    level: "intermediate", category: "Semi-Structured Data",
    description: "Azure SQL's JSON functions enable querying semi-structured Event Hub payloads and REST API responses without moving data to a separate document store, enabling the JSON-in-SQL hybrid pattern.",
    code: `-- Parse JSON transaction payload from Event Hubs landing table
SELECT
    e.event_id,
    e.received_ts,
    JSON_VALUE(e.payload, '$.transactionId')           AS transaction_id,
    JSON_VALUE(e.payload, '$.amount.value')            AS amount,
    JSON_VALUE(e.payload, '$.amount.currency')         AS currency,
    JSON_VALUE(e.payload, '$.metadata.sourceSystem')   AS source_system,
    JSON_VALUE(e.payload, '$.customer.id')             AS customer_id,
    JSON_VALUE(e.payload, '$.customer.tier')           AS customer_tier
FROM dbo.bronze_event_hub e
WHERE JSON_VALUE(e.payload, '$.status') = 'SETTLED'
  AND ISJSON(e.payload) = 1;  -- validate JSON before parsing

-- OPENJSON: parse JSON array into rows
DECLARE @json_array NVARCHAR(MAX) = '[
    {"id":"T001","amount":4250.75,"currency":"EUR"},
    {"id":"T002","amount":180.00,"currency":"GBP"}
]';

SELECT id, CAST(amount AS DECIMAL(18,2)) AS amount, currency
FROM OPENJSON(@json_array)
WITH (
    id       NVARCHAR(50)   '$.id',
    amount   DECIMAL(18,2)  '$.amount',
    currency NVARCHAR(3)    '$.currency'
);

-- Generate JSON output for REST API response / ADF lookup activity
SELECT
    transaction_id AS transactionId,
    amount_eur AS amountEur,
    currency,
    status,
    transaction_date AS transactionDate
FROM dbo.fact_transactions
WHERE transaction_date = '2024-01-15' AND status = 'SETTLED'
FOR JSON PATH, ROOT('transactions'), INCLUDE_NULL_VALUES;

-- Create computed column with JSON index for fast parsing
ALTER TABLE dbo.bronze_event_hub
ADD transaction_id AS JSON_VALUE(payload, '$.transactionId');

CREATE INDEX IX_bronze_event_hub_txn_id ON dbo.bronze_event_hub (transaction_id);`,
    notes: [
      "ISJSON() guard is essential before JSON_VALUE — malformed JSON throws an error without it",
      "JSON_VALUE returns scalar; JSON_QUERY returns JSON fragment (object/array) — choose correctly",
      "OPENJSON WITH schema is 5x faster than JSON_VALUE column-by-column for wide JSON objects",
      "Computed columns on JSON_VALUE + index enables fast lookup on JSON fields without full parse"
    ],
    use_case: "Parsing Azure Event Hubs payment event payloads (JSON format) directly in Azure SQL without ETL into structured tables, enabling real-time querying of raw Bronze layer data from Power BI."
  },
  {
    id: "sql-i-06", title: "Temporal Tables: System-Versioned History",
    level: "intermediate", category: "Advanced DDL",
    description: "Temporal tables (system-versioned) automatically maintain full row history, enabling point-in-time queries essential for GDPR audit trails, regulatory retrospective reporting, and SCD Type 2 compliance in Azure SQL.",
    code: `-- Create temporal table: customer dimension with automatic history
CREATE TABLE dbo.dim_customers (
    customer_sk     INT IDENTITY(1,1) NOT NULL,
    customer_id     NVARCHAR(50) NOT NULL,
    customer_name   NVARCHAR(200) NULL,
    tier            NVARCHAR(20)  NULL,
    country_code    CHAR(2)       NULL,
    risk_rating     NVARCHAR(10)  NULL,
    account_number  NVARCHAR(50)  NULL,
    is_active       BIT NOT NULL DEFAULT 1,

    -- System columns: auto-managed by SQL Server
    SysStartTime DATETIME2 GENERATED ALWAYS AS ROW START NOT NULL,
    SysEndTime   DATETIME2 GENERATED ALWAYS AS ROW END   NOT NULL,

    CONSTRAINT PK_dim_customers PRIMARY KEY (customer_sk),
    CONSTRAINT UQ_customer_id UNIQUE (customer_id),
    PERIOD FOR SYSTEM_TIME (SysStartTime, SysEndTime)
)
WITH (SYSTEM_VERSIONING = ON (HISTORY_TABLE = dbo.dim_customers_history));

-- Normal UPDATE — SQL Server automatically saves old row to history table
UPDATE dbo.dim_customers
SET risk_rating = 'HIGH', tier = 'PREMIUM'
WHERE customer_id = 'CUST-001';

-- Query historical state: what was CUST-001's tier on Jan 1, 2024?
SELECT customer_id, customer_name, tier, risk_rating
FROM dbo.dim_customers
FOR SYSTEM_TIME AS OF '2024-01-01T00:00:00';  -- point-in-time query

-- Query: full change history for audit (GDPR right of access)
SELECT
    customer_id, customer_name, tier, risk_rating,
    SysStartTime AS valid_from,
    SysEndTime   AS valid_to
FROM dbo.dim_customers
FOR SYSTEM_TIME ALL
WHERE customer_id = 'CUST-001'
ORDER BY SysStartTime;

-- BETWEEN: changes in January 2024
SELECT * FROM dbo.dim_customers
FOR SYSTEM_TIME BETWEEN '2024-01-01' AND '2024-02-01'
WHERE customer_id = 'CUST-001';`,
    notes: [
      "Temporal tables provide automatic SCD Type 2 — no custom MERGE logic needed for dimension history",
      "FOR SYSTEM_TIME AS OF enables point-in-time queries — critical for 'state at transaction time' regulatory reports",
      "History table is append-only — SQL Server manages it automatically, no manual inserts",
      "Retention policy can be set (ALTER TABLE ... SET HISTORY_RETENTION_PERIOD = 7 YEARS) for GDPR compliance"
    ],
    use_case: "Maintaining a full audit trail of customer risk rating changes in Azure SQL for EU BFSI regulatory reporting — enabling retrospective queries like 'what was this customer's risk tier at the time of the suspicious transaction?'"
  },
  {
    id: "sql-i-07", title: "Dynamic SQL & Parameterized Queries",
    level: "intermediate", category: "Advanced T-SQL",
    description: "Dynamic SQL enables building query strings at runtime for flexible reporting, schema-agnostic operations, and bulk metadata operations. sp_executesql with parameterization prevents SQL injection while maintaining plan reuse.",
    code: `-- Safe dynamic SQL with sp_executesql — plan cache friendly
CREATE OR ALTER PROCEDURE dbo.usp_get_transactions_flexible
    @start_date   DATE,
    @end_date     DATE,
    @currency     NVARCHAR(3)    = NULL,   -- optional filter
    @status       NVARCHAR(20)   = NULL,   -- optional filter
    @min_amount   DECIMAL(18,2)  = NULL,
    @order_col    NVARCHAR(50)   = 'transaction_date',
    @order_dir    NVARCHAR(4)    = 'DESC'
AS
BEGIN
    SET NOCOUNT ON;

    -- Whitelist allowed ORDER BY columns (SQL injection prevention)
    DECLARE @safe_order NVARCHAR(50) = CASE @order_col
        WHEN 'transaction_date' THEN 'transaction_date'
        WHEN 'amount_eur' THEN 'amount_eur'
        WHEN 'customer_id' THEN 'customer_id'
        ELSE 'transaction_date'  -- default to safe column
    END;

    DECLARE @safe_dir NVARCHAR(4) = CASE UPPER(@order_dir) WHEN 'ASC' THEN 'ASC' ELSE 'DESC' END;

    DECLARE @sql NVARCHAR(MAX) = N'
        SELECT TOP 10000
            transaction_id, amount_eur, currency, status, transaction_date, customer_id
        FROM dbo.fact_transactions
        WHERE transaction_date BETWEEN @p_start AND @p_end
    ';

    -- Dynamically add optional filters
    IF @currency IS NOT NULL  SET @sql += N' AND currency = @p_currency';
    IF @status   IS NOT NULL  SET @sql += N' AND status = @p_status';
    IF @min_amount IS NOT NULL SET @sql += N' AND amount_eur >= @p_min';

    SET @sql += N' ORDER BY ' + @safe_order + ' ' + @safe_dir;

    EXEC sp_executesql @sql,
        N'@p_start DATE, @p_end DATE, @p_currency NVARCHAR(3), @p_status NVARCHAR(20), @p_min DECIMAL(18,2)',
        @p_start    = @start_date,
        @p_end      = @end_date,
        @p_currency = @currency,
        @p_status   = @status,
        @p_min      = @min_amount;
END;

-- Call from ADF Lookup activity or Power BI
EXEC dbo.usp_get_transactions_flexible
    @start_date = '2024-01-01',
    @end_date   = '2024-01-31',
    @currency   = 'EUR',
    @min_amount = 10000;`,
    notes: [
      "sp_executesql with parameters reuses query plan — avoids plan cache pollution from concatenated SQL strings",
      "Whitelist ORDER BY column names against allowed values — dynamic ORDER BY is a common SQL injection vector",
      "Never concatenate user input directly into SQL string — always use @p_ parameterized variables",
      "IF @param IS NOT NULL pattern enables optional filters without performance degradation from OR conditions"
    ],
    use_case: "Flexible self-service query API for EU BFSI reporting team — Power BI parameterized data sources call this stored procedure with dynamic filters, avoiding the need to build separate queries for each report variant."
  },
  {
    id: "sql-i-08", title: "MERGE Statement: Upsert Pattern",
    level: "intermediate", category: "DML Patterns",
    description: "The MERGE statement combines INSERT, UPDATE, and DELETE in a single atomic operation. It's the standard T-SQL pattern for SCD loading, idempotent ETL, and applying change data from source systems.",
    code: `-- MERGE: idempotent Silver layer upsert — safe to re-run
MERGE dbo.fact_transactions AS tgt
USING (
    -- Source: incoming batch from staging
    SELECT
        s.transaction_id,
        s.amount * ISNULL(fx.rate, 1.0) AS amount_eur,
        s.currency,
        s.status,
        s.transaction_date,
        s.customer_id,
        s.counterparty_id
    FROM dbo.stage_transactions s
    LEFT JOIN dbo.dim_fx_rates fx
        ON fx.currency = s.currency
        AND fx.rate_date = s.transaction_date
    WHERE s.batch_date = '2024-01-15'
) AS src
ON tgt.transaction_id = src.transaction_id

-- Update existing records where amount or status changed
WHEN MATCHED AND (
    tgt.status    <> src.status    OR
    ABS(tgt.amount_eur - src.amount_eur) > 0.01  -- tolerance for float comparison
) THEN
    UPDATE SET
        tgt.status        = src.status,
        tgt.amount_eur    = src.amount_eur,
        tgt._modified_ts  = GETUTCDATE()

-- Insert new records
WHEN NOT MATCHED BY TARGET THEN
    INSERT (transaction_id, amount_eur, currency, status,
            transaction_date, customer_id, counterparty_id, _load_ts)
    VALUES (src.transaction_id, src.amount_eur, src.currency, src.status,
            src.transaction_date, src.customer_id, src.counterparty_id, GETUTCDATE())

-- Log matched records that don't change (for audit completeness)
-- WHEN MATCHED AND ... THEN ... (can have multiple WHEN MATCHED)

-- Soft-delete: mark target records not in source as inactive
WHEN NOT MATCHED BY SOURCE
    AND tgt.transaction_date = '2024-01-15'  -- scope to current batch only!
THEN
    UPDATE SET tgt.is_active = 0

OUTPUT $action AS merge_action,
       inserted.transaction_id,
       deleted.amount_eur AS old_amount,
       inserted.amount_eur AS new_amount
INTO dbo.merge_audit_log (action, transaction_id, old_amount, new_amount);`,
    notes: [
      "Scope NOT MATCHED BY SOURCE with date filter — otherwise soft-deletes ALL historical records not in today's batch",
      "OUTPUT clause captures MERGE results for audit logging — $action returns 'INSERT', 'UPDATE', or 'DELETE'",
      "Multiple WHEN MATCHED clauses allowed — evaluate conditions top-to-bottom, first match wins",
      "ABS() tolerance on float comparison prevents spurious updates from floating-point rounding"
    ],
    use_case: "Idempotent Silver layer upsert in the TCS EU BFSI daily batch pipeline — MERGE guarantees that re-running the same batch date produces identical results without duplicates or data corruption."
  },

  /* ══════════════════ ADVANCED ══════════════════ */
  {
    id: "sql-a-01", title: "Columnstore Indexes for Analytics",
    level: "advanced", category: "Performance",
    description: "Columnstore indexes store data column-by-column, enabling 10-100x faster analytical aggregations through compression and batch mode execution. Essential for Azure SQL Silver/Gold layer analytical queries at scale.",
    code: `-- Create clustered columnstore index on fact table
-- Ideal for: aggregation-heavy queries, full table scans, DW workloads
CREATE CLUSTERED COLUMNSTORE INDEX CCI_fact_transactions
ON dbo.fact_transactions;
-- Note: CCI replaces clustered B-tree index — all data stored in columnstore format

-- Nonclustered columnstore: keep row-based index for OLTP, add columnstore for analytics
-- Best for: hybrid HTAP workloads (Azure SQL General Purpose)
CREATE NONCLUSTERED COLUMNSTORE INDEX NCCI_fact_transactions_analytics
ON dbo.fact_transactions (transaction_date, currency, amount_eur, status, customer_id)
WHERE transaction_date >= '2023-01-01';  -- filtered to recent data

-- Query benefits from batch mode execution (check execution plan: Batch Mode on Row Store)
SELECT
    currency,
    YEAR(transaction_date) AS year,
    MONTH(transaction_date) AS month,
    COUNT(*) AS txn_count,
    SUM(amount_eur) AS total_volume,
    AVG(amount_eur) AS avg_amount,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY amount_eur) OVER (PARTITION BY currency) AS p95
FROM dbo.fact_transactions
WHERE transaction_date BETWEEN '2023-01-01' AND '2024-12-31'
GROUP BY currency, YEAR(transaction_date), MONTH(transaction_date);

-- Columnstore maintenance: reorganize compressed rowgroups
ALTER INDEX CCI_fact_transactions ON dbo.fact_transactions REORGANIZE;

-- Check rowgroup quality (health indicator for columnstore performance)
SELECT
    object_name(object_id) AS table_name,
    row_group_id,
    state_description,
    total_rows,
    size_in_bytes / 1024 AS size_kb,
    delta_store_hobt_id
FROM sys.column_store_row_groups
WHERE object_id = OBJECT_ID('dbo.fact_transactions')
ORDER BY row_group_id;`,
    notes: [
      "Columnstore indexes achieve 5-10x compression vs B-tree — dramatically reduces I/O for full table scans",
      "Batch mode execution processes 900 rows at a time vs row mode (1 row) — 10x CPU efficiency on aggregations",
      "DELTA store accumulates small inserts before compressing — avoid tiny batch inserts for best columnstore performance",
      "For Azure SQL, use NCCI on OLTP tables (preserves row-based updates) and CCI on pure analytics tables"
    ],
    use_case: "Adding a nonclustered columnstore index to the Silver fact_transactions table in Azure SQL to support Power BI Direct Query aggregation queries, reducing report load time from 45 seconds to under 2 seconds."
  },
  {
    id: "sql-a-02", title: "Row-Level Security (RLS) for GDPR",
    level: "advanced", category: "Security & Governance",
    description: "Row-Level Security transparently filters query results based on the executing user's context, enabling multi-tenant data isolation and GDPR-compliant data access controls without modifying application queries.",
    code: `-- Create security schema and predicate function
CREATE SCHEMA Security;
GO

-- Security predicate: filter rows based on calling user's country_code claim
CREATE FUNCTION Security.fn_transaction_security_predicate(
    @customer_country_code CHAR(2)
)
RETURNS TABLE
WITH SCHEMABINDING
AS RETURN
    SELECT 1 AS fn_result
    WHERE
        -- Internal analysts see all records
        IS_MEMBER('db_role_analyst_global') = 1
        OR
        -- Country-specific users see only their country's data (GDPR data sovereignty)
        @customer_country_code = (
            SELECT country_code
            FROM dbo.dim_user_country_mapping
            WHERE db_user = USER_NAME()
        )
        OR
        -- AML team sees high-value cross-border transactions globally
        (IS_MEMBER('db_role_aml') = 1 AND @customer_country_code IS NOT NULL);
GO

-- Apply RLS security policy to transactions view
CREATE SECURITY POLICY dbo.TransactionRLSPolicy
ADD FILTER PREDICATE Security.fn_transaction_security_predicate(customer_country_code)
ON dbo.fact_transactions,

-- Block predicate: also prevents INSERT of rows user can't see
ADD BLOCK PREDICATE Security.fn_transaction_security_predicate(customer_country_code)
ON dbo.fact_transactions AFTER INSERT
WITH (STATE = ON);

-- Test RLS (execute as different user)
EXECUTE AS USER = 'analyst_uk@company.com';
SELECT COUNT(*), customer_country_code FROM dbo.fact_transactions GROUP BY customer_country_code;
-- Returns only UK rows transparently
REVERT;

-- Check RLS policies
SELECT
    p.name AS policy_name,
    p.is_enabled,
    pred.predicate_definition,
    pred.predicate_type_desc
FROM sys.security_policies p
JOIN sys.security_predicates pred ON p.object_id = pred.object_id;`,
    notes: [
      "RLS is enforced at the engine level — even DBA tools like SSMS show filtered results for RLS users",
      "WITH SCHEMABINDING on the predicate function prevents dropping referenced tables accidentally",
      "BLOCK predicates prevent users from inserting rows they wouldn't be able to read — critical for multi-tenant isolation",
      "Use SESSION_CONTEXT() for application-passed claims (JWT roles) in connection pool scenarios"
    ],
    use_case: "Implementing GDPR-compliant data sovereignty controls in Azure SQL — EU banking analysts in Germany see only German customer transactions, while the global AML team sees all high-value cross-border transactions."
  },
  {
    id: "sql-a-03", title: "Change Data Capture (CDC)",
    level: "advanced", category: "Data Integration",
    description: "CDC tracks row-level changes (INSERT, UPDATE, DELETE) at the SQL Server engine level, providing a reliable change feed for incremental ETL, Delta Lake streaming ingestion, and audit compliance without triggers.",
    code: `-- Enable CDC on database (requires sysadmin)
EXEC sys.sp_cdc_enable_db;

-- Enable CDC on transactions table
EXEC sys.sp_cdc_enable_table
    @source_schema = N'dbo',
    @source_name   = N'fact_transactions',
    @role_name     = N'cdc_reader',  -- database role that can read CDC tables
    @supports_net_changes = 1,       -- capture net change per row (not every intermediate state)
    @captured_column_list = N'transaction_id,amount_eur,currency,status,transaction_date,customer_id';

-- Query CDC changes for incremental ETL (ADF or Python)
DECLARE @from_lsn BINARY(10) = sys.fn_cdc_get_min_lsn('dbo_fact_transactions');
DECLARE @to_lsn   BINARY(10) = sys.fn_cdc_get_max_lsn();

-- All changes: $__$operation: 1=Delete, 2=Insert, 3=Before Update, 4=After Update
SELECT
    sys.fn_cdc_map_lsn_to_time(__$start_lsn) AS change_time,
    CASE __$operation
        WHEN 1 THEN 'DELETE'
        WHEN 2 THEN 'INSERT'
        WHEN 4 THEN 'UPDATE'
    END AS operation,
    transaction_id,
    amount_eur,
    currency,
    status,
    __$start_lsn AS change_lsn
FROM cdc.fn_cdc_get_all_changes_dbo_fact_transactions(@from_lsn, @to_lsn, 'all')
WHERE __$operation IN (2, 4)  -- only INSERT and after-UPDATE
ORDER BY __$start_lsn;

-- Net changes only: most recent change per transaction_id
SELECT *
FROM cdc.fn_cdc_get_net_changes_dbo_fact_transactions(@from_lsn, @to_lsn, 'all');

-- Monitor CDC latency (alert if > 5 minutes behind)
SELECT
    capture_instance,
    [object_id],
    create_date,
    start_lsn,
    stop_lsn
FROM cdc.change_tables;`,
    notes: [
      "CDC reads transaction log — zero overhead on source table, unlike triggers which add per-row overhead",
      "net_changes function returns only final state per row — eliminates intermediate UPDATE noise",
      "Store the last processed LSN in a control table — enables resumable, incremental CDC pipelines",
      "ADF has native CDC source connector for Azure SQL — no custom SP needed for standard incremental loads"
    ],
    use_case: "Implementing real-time incremental loading from Azure SQL Silver to Delta Lake Bronze table using CDC, capturing only changed rows since last ADF run rather than full table scans — reducing pipeline runtime from 2 hours to 5 minutes."
  },
  {
    id: "sql-a-04", title: "Query Store & Performance Monitoring",
    level: "advanced", category: "Performance",
    description: "Query Store captures query plans and runtime statistics, enabling identification of plan regressions, parameter sniffing issues, and the most resource-intensive queries. Essential for FinOps Azure SQL cost optimization.",
    code: `-- Enable Query Store (Azure SQL has it on by default)
ALTER DATABASE [bfsi_dw]
SET QUERY_STORE = ON
(
    OPERATION_MODE = READ_WRITE,
    CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30),
    DATA_FLUSH_INTERVAL_SECONDS = 3000,
    INTERVAL_LENGTH_MINUTES = 15,
    MAX_STORAGE_SIZE_MB = 1000,
    QUERY_CAPTURE_MODE = AUTO,  -- only captures queries with significant impact
    SIZE_BASED_CLEANUP_MODE = AUTO
);

-- Top 10 most expensive queries by CPU (FinOps: identify cost drivers)
SELECT TOP 10
    q.query_id,
    qt.query_sql_text,
    SUM(rs.avg_cpu_time) AS total_cpu_ms,
    SUM(rs.avg_duration) AS total_duration_ms,
    SUM(rs.avg_logical_io_reads) AS total_logical_reads,
    SUM(rs.count_executions) AS execution_count,
    SUM(rs.avg_cpu_time) / NULLIF(SUM(rs.count_executions), 0) AS avg_cpu_per_exec_ms
FROM sys.query_store_query q
JOIN sys.query_store_query_text qt ON q.query_text_id = qt.query_text_id
JOIN sys.query_store_plan p ON q.query_id = p.query_id
JOIN sys.query_store_runtime_stats rs ON p.plan_id = rs.plan_id
JOIN sys.query_store_runtime_stats_interval rsi ON rs.runtime_stats_interval_id = rsi.runtime_stats_interval_id
WHERE rsi.start_time >= DATEADD(HOUR, -24, GETUTCDATE())
GROUP BY q.query_id, qt.query_sql_text
ORDER BY total_cpu_ms DESC;

-- Force a specific (known-good) plan for a problematic query
-- Use Query Store UI in SSMS or Azure Portal → Query Performance Insight
EXEC sp_query_store_force_plan @query_id = 123, @plan_id = 456;

-- Detect plan regressions (same query, new worse plan)
SELECT
    q.query_id,
    p.plan_id,
    rs.avg_duration,
    rs.avg_cpu_time,
    p.is_forced_plan,
    p.is_parallel_plan
FROM sys.query_store_plan p
JOIN sys.query_store_query q ON p.query_id = q.query_id
JOIN sys.query_store_runtime_stats rs ON p.plan_id = rs.plan_id
WHERE q.query_id IN (
    SELECT query_id FROM sys.query_store_plan GROUP BY query_id HAVING COUNT(DISTINCT plan_id) > 1
)
ORDER BY q.query_id, rs.avg_duration DESC;`,
    notes: [
      "Query Store is the Azure SQL equivalent of AWR in Oracle — captures 30 days of query history by default",
      "Plan forcing (sp_query_store_force_plan) stabilizes performance during schema changes or statistics updates",
      "QUERY_CAPTURE_MODE=AUTO ignores ad-hoc queries and focuses on recurring, impactful queries",
      "Azure Portal's Query Performance Insight provides visual version of Query Store — share with stakeholders"
    ],
    use_case: "Using Query Store to identify the top 10 most expensive Power BI Direct Query queries on the Azure SQL Gold layer, forcing known-good plans to prevent regressions after index rebuilds during maintenance windows."
  },
  {
    id: "sql-a-05", title: "Partitioning & Data Archival",
    level: "advanced", category: "Data Engineering",
    description: "Table partitioning on date columns enables partition elimination (query reads only relevant partitions), efficient archival via partition switching, and load isolation for large financial transaction tables.",
    code: `-- Partition function: monthly ranges for transaction history
CREATE PARTITION FUNCTION pf_monthly_transactions (DATE)
AS RANGE RIGHT FOR VALUES (
    '2023-01-01', '2023-02-01', '2023-03-01', '2023-04-01',
    '2023-05-01', '2023-06-01', '2023-07-01', '2023-08-01',
    '2023-09-01', '2023-10-01', '2023-11-01', '2023-12-01',
    '2024-01-01', '2024-02-01', '2024-03-01'
);

-- Partition scheme: map partitions to filegroups
CREATE PARTITION SCHEME ps_monthly_transactions
AS PARTITION pf_monthly_transactions
ALL TO ([PRIMARY]);  -- in production: map to separate filegroups for tiered storage

-- Create partitioned fact table
CREATE TABLE dbo.fact_transactions_partitioned (
    transaction_id   NVARCHAR(50) NOT NULL,
    amount_eur       DECIMAL(18,2) NOT NULL,
    currency         CHAR(3) NOT NULL,
    status           NVARCHAR(20) NOT NULL,
    transaction_date DATE NOT NULL,
    customer_id      NVARCHAR(50) NULL,
    _load_ts         DATETIME2 NOT NULL DEFAULT GETUTCDATE()
) ON ps_monthly_transactions(transaction_date);  -- partition by date column

-- Add clustered columnstore (partition-aligned)
CREATE CLUSTERED COLUMNSTORE INDEX CCI_fact_transactions_partitioned
ON dbo.fact_transactions_partitioned
ON ps_monthly_transactions(transaction_date);

-- Partition elimination — query reads only January 2024 partition
SELECT COUNT(*), SUM(amount_eur)
FROM dbo.fact_transactions_partitioned
WHERE transaction_date BETWEEN '2024-01-01' AND '2024-01-31';
-- SQL Server reads ONLY the January 2024 partition — not all 15 partitions

-- Add new month partition (maintenance window)
ALTER PARTITION FUNCTION pf_monthly_transactions() SPLIT RANGE ('2024-04-01');

-- Partition switch: instant archival (no data movement)
ALTER TABLE dbo.fact_transactions_partitioned
SWITCH PARTITION 1 TO dbo.fact_transactions_archive PARTITION 1;`,
    notes: [
      "Partition elimination reduces I/O by 90%+ on date-filtered queries — SQL Server reads only matching partitions",
      "SPLIT RANGE adds a new partition — takes seconds; no data movement required",
      "Partition SWITCH is instantaneous metadata operation — archive 1 month of data in milliseconds",
      "Always partition on the same column as the most common WHERE filter — usually transaction_date in BFSI"
    ],
    use_case: "Implementing monthly partitioning on the Azure SQL Silver fact_transactions table at TCS EU BFSI — reducing daily reporting query I/O by 96% through partition elimination and enabling instant monthly archival via partition switching."
  },
  {
    id: "sql-a-06", title: "In-Memory OLTP for High-Throughput Staging",
    level: "advanced", category: "Performance",
    description: "In-Memory OLTP (Hekaton) stores tables in CPU-optimized memory structures, enabling 10-30x faster INSERT throughput for high-volume staging tables and lock-free concurrent writes — critical for real-time payment event ingestion.",
    code: `-- Create memory-optimized filegroup (required for In-Memory OLTP)
ALTER DATABASE [bfsi_dw]
ADD FILEGROUP fg_inmemory CONTAINS MEMORY_OPTIMIZED_DATA;
GO
ALTER DATABASE [bfsi_dw]
ADD FILE (NAME='bfsi_inmemory', FILENAME='C:\\Data\\bfsi_inmemory')
TO FILEGROUP fg_inmemory;
GO

-- Create memory-optimized staging table (lock-free, latch-free)
CREATE TABLE dbo.stage_transactions_inmem (
    stage_id        BIGINT IDENTITY(1,1)  NOT NULL,
    transaction_id  NVARCHAR(50)          NOT NULL,
    amount          DECIMAL(18,4)         NOT NULL,
    currency        CHAR(3)               NOT NULL,
    status          NVARCHAR(20)          NOT NULL,
    received_ts     DATETIME2             NOT NULL DEFAULT SYSUTCDATETIME(),
    payload_json    NVARCHAR(MAX)         NULL,

    INDEX ix_txn_id_hash HASH (transaction_id) WITH (BUCKET_COUNT = 1000000),
    INDEX ix_received_ts NONCLUSTERED (received_ts)
)
WITH (
    MEMORY_OPTIMIZED = ON,
    DURABILITY = SCHEMA_AND_DATA  -- survives restart; SCHEMA_ONLY for pure cache
);

-- Natively compiled stored procedure: maximum throughput insert
CREATE PROCEDURE dbo.usp_insert_staged_transaction
    @transaction_id NVARCHAR(50),
    @amount DECIMAL(18,4),
    @currency CHAR(3),
    @status NVARCHAR(20)
WITH NATIVE_COMPILATION, SCHEMABINDING, EXECUTE AS OWNER
AS
BEGIN ATOMIC WITH (TRANSACTION ISOLATION LEVEL = SNAPSHOT, LANGUAGE = N'english')
    INSERT INTO dbo.stage_transactions_inmem
        (transaction_id, amount, currency, status)
    VALUES
        (@transaction_id, @amount, @currency, @status);
END;

-- Bulk drain from In-Memory staging to disk-based Silver table
INSERT INTO dbo.fact_transactions (transaction_id, amount, currency, status, _load_ts)
SELECT transaction_id, amount, currency, status, GETUTCDATE()
FROM dbo.stage_transactions_inmem
WHERE received_ts < DATEADD(MINUTE, -5, SYSUTCDATETIME());  -- drain older than 5 min

DELETE FROM dbo.stage_transactions_inmem
WHERE received_ts < DATEADD(MINUTE, -5, SYSUTCDATETIME());`,
    notes: [
      "In-Memory OLTP inserts are lock-free — 10-30x faster than disk-based tables for high-concurrency staging",
      "HASH indexes are O(1) lookup by exact equality — ideal for transaction_id dedup checks",
      "Natively compiled SPs are compiled to machine code — max throughput for the critical hot path",
      "SCHEMA_AND_DATA durability survives restart; SCHEMA_ONLY (faster) loses data — use for pure staging cache"
    ],
    use_case: "Using In-Memory OLTP staging table to buffer high-frequency payment events from Azure Event Hubs before draining to Silver Delta Lake via ADF, handling 50,000+ transactions/second without lock contention."
  },
  {
    id: "sql-a-07", title: "Always Encrypted for GDPR Sensitive Columns",
    level: "advanced", category: "Security & Governance",
    description: "Always Encrypted ensures sensitive financial data (account numbers, SSNs) is encrypted on the client side before reaching Azure SQL. The server never sees plaintext — enabling secure processing of GDPR personal data.",
    code: `-- Always Encrypted column encryption (done via SSMS wizard or PowerShell)
-- Step 1: Create Column Master Key (stored in Azure Key Vault)
CREATE COLUMN MASTER KEY CMK_EU_BFSI
WITH (
    KEY_STORE_PROVIDER_NAME = 'AZURE_KEY_VAULT',
    KEY_PATH = 'https://eu-keyvault.vault.azure.net/keys/cmk-bfsi/abc123'
);

-- Step 2: Create Column Encryption Key (encrypted with CMK)
CREATE COLUMN ENCRYPTION KEY CEK_PII_Data
WITH VALUES (
    COLUMN_MASTER_KEY = CMK_EU_BFSI,
    ALGORITHM = 'RSA_OAEP',
    ENCRYPTED_VALUE = 0x01670000... -- encrypted CEK value
);

-- Step 3: Table with Always Encrypted columns
CREATE TABLE dbo.dim_customers_secure (
    customer_sk     INT IDENTITY(1,1) NOT NULL,
    customer_id     NVARCHAR(50) NOT NULL,
    customer_name   NVARCHAR(200) NOT NULL,
    country_code    CHAR(2) NOT NULL,
    tier            NVARCHAR(20) NULL,

    -- Deterministic: allows equality filter (WHERE account_no = ?)
    account_number  NVARCHAR(50)
        ENCRYPTED WITH (
            ENCRYPTION_TYPE = DETERMINISTIC,
            ALGORITHM = 'AEAD_AES_256_CBC_HMAC_SHA_256',
            COLUMN_ENCRYPTION_KEY = CEK_PII_Data
        ),

    -- Randomized: more secure, no equality filter (for SSN, DOB)
    national_id     NVARCHAR(20)
        ENCRYPTED WITH (
            ENCRYPTION_TYPE = RANDOMIZED,
            ALGORITHM = 'AEAD_AES_256_CBC_HMAC_SHA_256',
            COLUMN_ENCRYPTION_KEY = CEK_PII_Data
        ),

    CONSTRAINT PK_customers_secure PRIMARY KEY (customer_sk)
);

-- Python client with Always Encrypted (decryption happens client-side)
-- import pyodbc; conn_str += ";Column Encryption Setting=enabled;"
-- query returns decrypted values transparently to authorized client

-- Check encryption status
SELECT
    c.name AS column_name,
    cek.name AS encryption_key_name,
    c.encryption_type_desc,
    c.encryption_algorithm_name
FROM sys.columns c
JOIN sys.column_encryption_keys cek ON c.column_encryption_key_id = cek.column_encryption_key_id
WHERE OBJECT_NAME(c.object_id) = 'dim_customers_secure';`,
    notes: [
      "Always Encrypted encrypts data BEFORE it leaves the client app — Azure SQL server never sees plaintext",
      "Deterministic encryption allows equality filtering (WHERE) — use for account numbers you need to query",
      "Randomized encryption is more secure — use for fields that never need filtering (national ID, DOB)",
      "Column Master Key in Azure Key Vault — only authorized applications with Key Vault access can decrypt"
    ],
    use_case: "Encrypting EU customer account numbers and national IDs in Azure SQL at the column level using Always Encrypted, ensuring GDPR compliance even if the database server is compromised — required for TCS EU BFSI client contracts."
  },
  {
    id: "sql-a-08", title: "Query Plan Analysis & Index Tuning",
    level: "advanced", category: "Performance",
    description: "Reading and interpreting execution plans identifies performance bottlenecks — key lookups, nested loops, sort spills, and missing indexes. Systematic index tuning reduces query cost for Power BI and analytical workloads.",
    code: `-- Capture actual execution plan + runtime stats
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

-- Query to analyze
SELECT
    c.country_code,
    t.currency,
    SUM(t.amount_eur) AS total_volume,
    COUNT(*) AS txn_count
FROM dbo.fact_transactions t
JOIN dbo.dim_customers c ON t.customer_id = c.customer_id
WHERE t.transaction_date BETWEEN '2024-01-01' AND '2024-01-31'
  AND t.status = 'SETTLED'
GROUP BY c.country_code, t.currency;

SET STATISTICS IO OFF;
SET STATISTICS TIME OFF;

-- Check missing index recommendations (from DMV)
SELECT TOP 20
    ROUND(migs.avg_total_user_cost * migs.avg_user_impact * (migs.user_seeks + migs.user_scans), 0) AS improvement_measure,
    'CREATE INDEX IX_' + OBJECT_NAME(mid.object_id) + '_' +
        REPLACE(REPLACE(REPLACE(mid.equality_columns + ISNULL('_' + mid.inequality_columns, ''), '[', ''), ']', ''), ', ', '_')
    AS suggested_index_ddl,
    mid.equality_columns,
    mid.inequality_columns,
    mid.included_columns,
    migs.avg_user_impact AS estimated_impact_pct,
    migs.user_seeks,
    OBJECT_NAME(mid.object_id) AS table_name
FROM sys.dm_db_missing_index_details mid
JOIN sys.dm_db_missing_index_groups mig ON mid.index_handle = mig.index_handle
JOIN sys.dm_db_missing_index_group_stats migs ON mig.index_group_handle = migs.group_handle
ORDER BY improvement_measure DESC;

-- Check index fragmentation (determine REBUILD vs REORGANIZE threshold)
SELECT
    i.name AS index_name,
    ROUND(ips.avg_fragmentation_in_percent, 2) AS fragmentation_pct,
    ips.page_count,
    CASE
        WHEN ips.avg_fragmentation_in_percent > 30 THEN 'REBUILD'
        WHEN ips.avg_fragmentation_in_percent > 10 THEN 'REORGANIZE'
        ELSE 'OK'
    END AS action_needed
FROM sys.dm_db_index_physical_stats(DB_ID(), OBJECT_ID('dbo.fact_transactions'), NULL, NULL, 'SAMPLED') ips
JOIN sys.indexes i ON ips.object_id = i.object_id AND ips.index_id = i.index_id
ORDER BY fragmentation_pct DESC;`,
    notes: [
      "Key Lookup in execution plan = the index doesn't include all needed columns — add INCLUDE columns",
      "Nested Loops on large tables = missing index on join column — causes row-by-row lookups",
      "improvement_measure in missing index DMV combines seek frequency and impact — sort descending",
      "Fragmentation > 30%: REBUILD ONLINE; 10-30%: REORGANIZE; < 10%: leave alone (I/O cost not worth it)"
    ],
    use_case: "Systematic index tuning exercise on Azure SQL Gold layer at TCS — using missing index DMVs to identify and create 8 covering indexes that reduced Power BI report load time from 45s to 3s for C-level dashboards."
  },

  /* ══════════════════ ARCHITECT ══════════════════ */
  {
    id: "sql-arch-01", title: "SCD Type 2 with MERGE: Full Implementation",
    level: "architect", category: "Data Patterns",
    description: "Complete SCD Type 2 implementation using T-SQL MERGE with hash diff change detection, effective dating, and current flag management. The production-grade pattern for dimension management in Azure SQL data warehouses.",
    code: `-- SCD Type 2: Complete implementation with MERGE + hash diff
-- Handles: inserts, changes (expire old + insert new), no-change (skip)

CREATE OR ALTER PROCEDURE dbo.usp_apply_scd2_customers
    @batch_date DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @batch_date = ISNULL(@batch_date, CAST(GETUTCDATE() AS DATE));

    DECLARE @high_date DATE = '9999-12-31';
    DECLARE @changes_applied INT = 0;

    BEGIN TRANSACTION;

    -- Step 1: Compute hash diff on tracked attributes
    -- Only compare active (current) dimension records
    ;WITH incoming AS (
        SELECT
            s.customer_id,
            s.customer_name,
            s.tier,
            s.country_code,
            s.risk_rating,
            CONVERT(NVARCHAR(MAX),
                HASHBYTES('SHA2_256',
                    ISNULL(UPPER(s.customer_name), '') + '|' +
                    ISNULL(UPPER(s.tier), '') + '|' +
                    ISNULL(UPPER(s.country_code), '') + '|' +
                    ISNULL(UPPER(s.risk_rating), '')
                ), 2) AS hash_diff
        FROM dbo.stage_customer_snapshot s
        WHERE s.batch_date = @batch_date
    ),
    active_dim AS (
        SELECT
            customer_id, customer_name, tier, country_code, risk_rating, hash_diff, customer_sk
        FROM dbo.dim_customers
        WHERE is_current = 1
    )

    -- Step 2: Expire changed records (set valid_to = today, is_current = 0)
    UPDATE dim
    SET
        dim.valid_to   = DATEADD(DAY, -1, @batch_date),
        dim.is_current = 0,
        dim._modified_ts = GETUTCDATE()
    FROM dbo.dim_customers dim
    INNER JOIN active_dim ad ON ad.customer_sk = dim.customer_sk
    INNER JOIN incoming inc ON inc.customer_id = ad.customer_id
    WHERE inc.hash_diff <> ad.hash_diff  -- only changed records
      AND dim.is_current = 1;

    SET @changes_applied += @@ROWCOUNT;

    -- Step 3: Insert new records (both net-new and changed versions)
    INSERT INTO dbo.dim_customers (
        customer_id, customer_name, tier, country_code, risk_rating,
        valid_from, valid_to, is_current, hash_diff, _source, _load_ts
    )
    SELECT
        inc.customer_id,
        inc.customer_name,
        inc.tier,
        inc.country_code,
        inc.risk_rating,
        @batch_date AS valid_from,
        @high_date  AS valid_to,
        1           AS is_current,
        inc.hash_diff,
        'SNAPSHOT_LOAD',
        GETUTCDATE()
    FROM incoming inc
    WHERE
        -- Net-new: no existing active record
        NOT EXISTS (SELECT 1 FROM active_dim ad WHERE ad.customer_id = inc.customer_id)
        OR
        -- Changed: existing active record with different hash
        EXISTS (SELECT 1 FROM active_dim ad
                WHERE ad.customer_id = inc.customer_id
                  AND ad.hash_diff <> inc.hash_diff);

    SET @changes_applied += @@ROWCOUNT;

    COMMIT TRANSACTION;

    -- Log result
    INSERT INTO dbo.pipeline_audit_log (proc_name, batch_date, rows_affected, status, _load_ts)
    VALUES ('usp_apply_scd2_customers', @batch_date, @changes_applied, 'SUCCESS', GETUTCDATE());

    SELECT @changes_applied AS rows_changed;
END;

EXEC dbo.usp_apply_scd2_customers @batch_date = '2024-01-15';`,
    notes: [
      "Hash diff (SHA2_256) detects changes without column-by-column comparison — faster and schema-agnostic",
      "Expire first, then insert — ensures no window where both old and new records are marked is_current=1",
      "valid_to = batch_date - 1 day is standard SCD2 convention — query 'as of date X' uses BETWEEN valid_from AND valid_to",
      "Always use SET XACT_ABORT ON in SCD2 procedures — prevents partial updates leaving dimension in inconsistent state"
    ],
    use_case: "Maintaining full historical customer dimension in Azure SQL DW for TCS EU BFSI regulatory reporting, enabling point-in-time queries like 'what was the customer's risk rating at the time of this 2023 suspicious transaction?'"
  },
  {
    id: "sql-arch-02", title: "Data Vault 2.0: Hub-Link-Satellite in T-SQL",
    level: "architect", category: "Data Modeling",
    description: "Data Vault 2.0 SQL implementation provides audit-ready, scalable warehouse design. Hubs store business keys, Links store relationships, and Satellites store descriptive attributes — all append-only for full lineage.",
    code: `-- ── DATA VAULT 2.0: HUB, LINK, SATELLITE DDL ─────────────────

-- HUB: unique business keys for Customer entity
CREATE TABLE dv.hub_customer (
    hub_customer_hk  BINARY(32)     NOT NULL,  -- SHA-256 hash key
    load_date        DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
    record_source    NVARCHAR(100)  NOT NULL,
    customer_bk      NVARCHAR(50)   NOT NULL,  -- business key (natural key)
    CONSTRAINT PK_hub_customer PRIMARY KEY NONCLUSTERED (hub_customer_hk),
    CONSTRAINT UQ_hub_customer_bk UNIQUE (customer_bk)
);
CREATE CLUSTERED COLUMNSTORE INDEX CCI_hub_customer ON dv.hub_customer;

-- SATELLITE: descriptive attributes for Customer (with hash diff)
CREATE TABLE dv.sat_customer_profile (
    hub_customer_hk  BINARY(32)     NOT NULL,
    load_date        DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
    load_end_date    DATETIME2      NULL,        -- NULL = current record
    record_source    NVARCHAR(100)  NOT NULL,
    hash_diff        BINARY(32)     NOT NULL,    -- detects attribute changes
    customer_name    NVARCHAR(200)  NULL,
    tier             NVARCHAR(20)   NULL,
    country_code     CHAR(2)        NULL,
    risk_rating      NVARCHAR(10)   NULL,
    CONSTRAINT PK_sat_customer PRIMARY KEY (hub_customer_hk, load_date),
    CONSTRAINT FK_sat_customer_hub FOREIGN KEY (hub_customer_hk)
        REFERENCES dv.hub_customer (hub_customer_hk)
);

-- LINK: Customer-Transaction relationship
CREATE TABLE dv.lnk_customer_transaction (
    lnk_cust_txn_hk  BINARY(32) NOT NULL,  -- hash of all link components
    load_date        DATETIME2  NOT NULL DEFAULT GETUTCDATE(),
    record_source    NVARCHAR(100) NOT NULL,
    hub_customer_hk  BINARY(32) NOT NULL,
    hub_transaction_hk BINARY(32) NOT NULL,
    CONSTRAINT PK_lnk_cust_txn PRIMARY KEY NONCLUSTERED (lnk_cust_txn_hk)
);

-- ── LOAD PROCEDURES ───────────────────────────────────────────────

-- Load Hub: idempotent — only insert new business keys
CREATE OR ALTER PROCEDURE dv.usp_load_hub_customer @batch_date DATE
AS BEGIN
    INSERT INTO dv.hub_customer (hub_customer_hk, load_date, record_source, customer_bk)
    SELECT
        HASHBYTES('SHA2_256', UPPER(TRIM(s.customer_id))),  -- deterministic hash key
        GETUTCDATE(), 'EU_PAYMENT_GATEWAY', UPPER(TRIM(s.customer_id))
    FROM dbo.stage_transactions s
    WHERE s.batch_date = @batch_date
      AND NOT EXISTS (
          SELECT 1 FROM dv.hub_customer h
          WHERE h.customer_bk = UPPER(TRIM(s.customer_id))
      )
    GROUP BY s.customer_id;  -- dedup from staging
END;

-- Load Satellite: insert only when attributes change (hash diff comparison)
CREATE OR ALTER PROCEDURE dv.usp_load_sat_customer_profile @batch_date DATE
AS BEGIN
    -- Close previous satellite record where hash diff changed
    UPDATE sat
    SET sat.load_end_date = GETUTCDATE()
    FROM dv.sat_customer_profile sat
    INNER JOIN (
        SELECT hub_customer_hk,
               HASHBYTES('SHA2_256', UPPER(ISNULL(customer_name,'')) + '|' +
                         UPPER(ISNULL(tier,'')) + '|' + UPPER(ISNULL(country_code,''))) AS new_hash
        FROM dbo.stage_customer_snapshot WHERE batch_date = @batch_date
    ) src ON src.hub_customer_hk = sat.hub_customer_hk
    WHERE sat.load_end_date IS NULL
      AND sat.hash_diff <> src.new_hash;

    -- Insert new/changed satellite records
    INSERT INTO dv.sat_customer_profile
        (hub_customer_hk, load_date, record_source, hash_diff, customer_name, tier, country_code)
    SELECT
        HASHBYTES('SHA2_256', UPPER(TRIM(s.customer_id))),
        GETUTCDATE(), 'EU_GATEWAY',
        HASHBYTES('SHA2_256', UPPER(ISNULL(s.customer_name,'')) + '|' +
                  UPPER(ISNULL(s.tier,'')) + '|' + UPPER(ISNULL(s.country_code,''))),
        s.customer_name, s.tier, s.country_code
    FROM dbo.stage_customer_snapshot s
    WHERE s.batch_date = @batch_date
      AND NOT EXISTS (
          SELECT 1 FROM dv.sat_customer_profile sat
          WHERE sat.hub_customer_hk = HASHBYTES('SHA2_256', UPPER(TRIM(s.customer_id)))
            AND sat.load_end_date IS NULL
            AND sat.hash_diff = HASHBYTES('SHA2_256', UPPER(ISNULL(s.customer_name,'')) + '|' +
                                UPPER(ISNULL(s.tier,'')) + '|' + UPPER(ISNULL(s.country_code,'')))
      );
END;`,
    notes: [
      "HASHBYTES('SHA2_256') produces deterministic 32-byte keys — same input always produces same hash key",
      "Satellites are append-only — close (load_end_date) the current record and insert new rather than UPDATE",
      "Hub loading is always idempotent — NOT EXISTS check prevents duplicates from any number of reruns",
      "Data Vault is the preferred GDPR architecture — full lineage, no data destruction, audit-friendly"
    ],
    use_case: "Implementing Data Vault 2.0 in Azure SQL for TCS EU BFSI Gold layer — providing full source-to-report lineage for regulatory audits, with hash-based change detection that scales to 100M+ customer records."
  },
  {
    id: "sql-arch-03", title: "Azure SQL: FinOps & Cost Optimization",
    level: "architect", category: "FinOps",
    description: "Systematic Azure SQL cost optimization involves DTU/vCore right-sizing, Elastic Pool configuration, Query Store-based optimization, and automated maintenance scheduling to minimize compute costs while meeting SLA.",
    code: `-- FinOps: Resource consumption analysis for Azure SQL cost optimization
-- Identify top resource consumers across DTU/CPU/IO dimensions

-- DTU consumption by query (last 24 hours)
SELECT TOP 20
    SUBSTRING(qt.query_sql_text, 1, 200) AS query_snippet,
    SUM(rs.avg_cpu_time) AS total_cpu_ms,
    SUM(rs.avg_logical_io_reads) AS total_logical_reads,
    SUM(rs.avg_physical_io_reads) AS total_physical_reads,
    SUM(rs.avg_query_max_used_memory) / 128 AS max_memory_mb,
    SUM(rs.count_executions) AS executions,
    -- DTU estimate: CPU + I/O normalized
    ROUND((SUM(rs.avg_cpu_time) * 0.0001 + SUM(rs.avg_logical_io_reads) * 0.000001) *
          SUM(rs.count_executions), 2) AS estimated_dtu_units
FROM sys.query_store_query q
JOIN sys.query_store_query_text qt ON q.query_text_id = qt.query_text_id
JOIN sys.query_store_plan p ON q.query_id = p.query_id
JOIN sys.query_store_runtime_stats rs ON p.plan_id = rs.plan_id
JOIN sys.query_store_runtime_stats_interval rsi ON rs.runtime_stats_interval_id = rsi.runtime_stats_interval_id
WHERE rsi.start_time >= DATEADD(HOUR, -24, GETUTCDATE())
GROUP BY qt.query_sql_text
ORDER BY estimated_dtu_units DESC;

-- Elastic Pool sizing: workload analysis per database
SELECT
    database_name,
    AVG(avg_cpu_percent) AS avg_cpu_pct,
    MAX(avg_cpu_percent) AS peak_cpu_pct,
    AVG(avg_data_io_percent) AS avg_io_pct,
    MAX(avg_data_io_percent) AS peak_io_pct,
    AVG(avg_memory_usage_percent) AS avg_mem_pct
FROM sys.elastic_pool_resource_stats
WHERE start_time >= DATEADD(DAY, -30, GETUTCDATE())
GROUP BY database_name
ORDER BY peak_cpu_pct DESC;

-- Auto-shrink & maintenance scheduling (off-peak: 2-4 AM UTC)
-- Rebuild fragmented indexes (> 30% fragmentation)
DECLARE @sql NVARCHAR(MAX) = '';
SELECT @sql += 'ALTER INDEX ' + QUOTENAME(i.name) +
               ' ON ' + QUOTENAME(SCHEMA_NAME(o.schema_id)) + '.' + QUOTENAME(o.name) +
               ' REBUILD WITH (ONLINE = ON, FILLFACTOR = 85);' + CHAR(13)
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'SAMPLED') ips
JOIN sys.indexes i ON ips.object_id = i.object_id AND ips.index_id = i.index_id
JOIN sys.objects o ON ips.object_id = o.object_id
WHERE ips.avg_fragmentation_in_percent > 30
  AND ips.page_count > 1000  -- only substantial indexes
  AND i.name IS NOT NULL;

EXEC sp_executesql @sql;

-- Update statistics (critical for Query Optimizer post-large-load)
EXEC sp_updatestats;`,
    notes: [
      "Azure SQL Elastic Pools share DTU across databases — right-size pool based on peak (not average) utilization",
      "Query Store DTU analysis identifies 20% of queries consuming 80% of cost — Pareto principle applies",
      "REBUILD WITH (ONLINE = ON) avoids table lock during business hours — critical for 99.9% availability SLA",
      "sp_updatestats after large batch loads prevents stale statistics from causing poor query plans"
    ],
    use_case: "Monthly FinOps review of Azure SQL costs at TCS EU BFSI — using Query Store analysis to identify over-consuming queries, right-sizing the Elastic Pool from P3 to P2 (40% cost reduction) while maintaining SLA."
  },
  {
    id: "sql-arch-04", title: "Zero-Downtime Schema Evolution",
    level: "architect", category: "DevOps & Governance",
    description: "Schema changes on production BFSI databases require careful migration strategies that maintain 99.9% availability. This pattern implements backward-compatible migrations using online operations and blue-green column transitions.",
    code: `-- Zero-downtime schema evolution pattern
-- Problem: add NOT NULL column to 100M row table without locking

-- ── PHASE 1: Add column as NULL (instant, no lock) ────────────────
ALTER TABLE dbo.fact_transactions
ADD risk_score DECIMAL(5,2) NULL;   -- nullable first — no table scan

-- ── PHASE 2: Backfill in small batches (off-peak, no locks) ──────
DECLARE @batch_size INT = 10000;
DECLARE @rows_updated INT = 1;
DECLARE @last_sk BIGINT = 0;

WHILE @rows_updated > 0
BEGIN
    UPDATE TOP (@batch_size) t
    SET t.risk_score = CASE
        WHEN t.amount_eur > 100000 THEN 9.5
        WHEN t.amount_eur > 10000  THEN 6.0
        WHEN t.amount_eur > 1000   THEN 3.0
        ELSE 1.0
    END
    FROM dbo.fact_transactions t
    WHERE t.risk_score IS NULL;

    SET @rows_updated = @@ROWCOUNT;
    WAITFOR DELAY '00:00:01';  -- 1 second pause to throttle I/O
END;

-- ── PHASE 3: Add NOT NULL constraint with default (online) ────────
-- Only after all rows backfilled
ALTER TABLE dbo.fact_transactions
ADD CONSTRAINT DF_risk_score DEFAULT 1.0 FOR risk_score;
ALTER TABLE dbo.fact_transactions
ALTER COLUMN risk_score DECIMAL(5,2) NOT NULL;  -- column scan at this point

-- ── RENAME pattern: zero-downtime column rename ───────────────────
-- Cannot rename column without app downtime → use alias view pattern

-- Step 1: Add new column with new name
ALTER TABLE dbo.fact_transactions ADD amount_base_currency DECIMAL(18,2) NULL;

-- Step 2: Keep both in sync via trigger (transition period)
CREATE OR ALTER TRIGGER trg_sync_amount_columns
ON dbo.fact_transactions
AFTER INSERT, UPDATE
AS
BEGIN
    UPDATE t SET t.amount_base_currency = i.amount_eur
    FROM dbo.fact_transactions t
    INNER JOIN inserted i ON t.txn_sk = i.txn_sk
    WHERE i.amount_base_currency IS NULL;
END;

-- Step 3: After app migration complete, backfill remaining, drop old column
-- ALTER TABLE dbo.fact_transactions DROP COLUMN amount_eur;

-- Track schema versions (DbUp / Flyway pattern)
CREATE TABLE dbo.schema_versions (
    version NVARCHAR(20) NOT NULL PRIMARY KEY,
    applied_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    description NVARCHAR(500) NOT NULL
);
INSERT INTO dbo.schema_versions VALUES ('1.5.0', DEFAULT, 'Add risk_score column with zero-downtime migration');`,
    notes: [
      "Always add NOT NULL columns in two phases: NULL first (instant), backfill, then ALTER to NOT NULL",
      "Batch backfill with WAITFOR DELAY throttles I/O — prevents overwhelming Azure SQL during business hours",
      "Use view as abstraction layer during column renames — old name in view, new name in table",
      "Schema version table (DbUp/Flyway pattern) tracks migrations — integrate with ADF CI/CD YAML pipeline"
    ],
    use_case: "Adding risk_score column to the 100M-row fact_transactions table on Azure SQL at TCS EU BFSI with zero downtime — maintaining 99.9% SLA while migrating the schema across 5 concurrent engineering squads."
  }
];
