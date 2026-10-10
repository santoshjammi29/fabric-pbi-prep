"""
Append advanced SQL snippets from the SQL Iceberg to data_mssql.json
"""
import json

FILE = 'src/data/json/data_mssql.json'

with open(FILE, 'r') as f:
    data = json.load(f)

print(f"Before: {len(data)}")
existing_ids = {x['id'] for x in data}

new_snippets = [
    {
        "id": "sql-iceberg-cs-01",
        "title": "Keyset Pagination (Seek Method) over Massive Datasets",
        "level": "expert",
        "category": "Advanced T-SQL",
        "description": "High-performance keyset pagination pattern replacing OFFSET-FETCH with B-Tree composite index seeks, delivering O(log N) latency regardless of page depth.",
        "code": """-- Keyset Pagination (Seek Method)
-- Eliminates linear O(N) OFFSET scanning penalties
-- Supporting Index: CREATE INDEX idx_orders_seek ON dbo.orders (order_date DESC, order_id DESC) INCLUDE (total_amount, customer_id);

DECLARE @last_seen_date DATETIME2 = '2026-10-10 08:30:00';
DECLARE @last_seen_id BIGINT = 9845210;
DECLARE @page_size INT = 25;

-- Direct B-Tree Seek Query
SELECT TOP (@page_size)
    o.order_id,
    o.customer_id,
    o.order_date,
    o.total_amount
FROM dbo.orders o
WHERE 
    (o.order_date < @last_seen_date)
    OR (o.order_date = @last_seen_date AND o.order_id < @last_seen_id)
ORDER BY 
    o.order_date DESC, 
    o.order_id DESC;

-- Note: Bypasses scanning preceding 500,000 rows, executing in <2ms!""",
        "notes": [
            "Replaces OFFSET N with index seeks based on the previous page's tie-breaker key",
            "Maintains constant O(log N + K) latency regardless of whether querying page 1 or page 50,000",
            "Completely immune to page drift caused by concurrent insertions"
        ],
        "use_case": "Deep API pagination, infinite scrolling feeds, and high-throughput real-time mobile order history retrieval."
    },
    {
        "id": "sql-iceberg-cs-02",
        "title": "Top-N Per Group via CROSS APPLY / LATERAL Iterator",
        "level": "advanced",
        "category": "Analytical Functions",
        "description": "Correlated inline iterator pattern utilizing CROSS APPLY to fetch the Top-N records per category with targeted index seeks instead of full-table window scans.",
        "code": """-- Top-3 Recent Transactions per Customer
-- Supporting Index: CREATE INDEX idx_cust_txn ON dbo.transactions (customer_id, transaction_date DESC) INCLUDE (amount, status);

SELECT 
    c.customer_id,
    c.customer_name,
    t.transaction_id,
    t.transaction_date,
    t.amount,
    t.status
FROM dbo.dim_customers c
CROSS APPLY (
    -- Evaluated iteratively per customer using targeted B-Tree seeks
    SELECT TOP 3
        tx.transaction_id,
        tx.transaction_date,
        tx.amount,
        tx.status
    FROM dbo.transactions tx
    WHERE tx.customer_id = c.customer_id
    ORDER BY tx.transaction_date DESC
) t;

-- Use OUTER APPLY to preserve customers who have 0 transactions!""",
        "notes": [
            "Reads exactly 3 leaf rows per customer instead of scanning millions of rows",
            "Bypasses full-table Sort/Segment operators required by ROW_NUMBER() window functions",
            "OUTER APPLY functions identically to LEFT JOIN LATERAL in PostgreSQL"
        ],
        "use_case": "Customer 360 profiling, recent order previews in e-commerce portals, and top fraud alerts per merchant."
    },
    {
        "id": "sql-iceberg-cs-03",
        "title": "High-Throughput Queue Processing via READPAST & UPDLOCK",
        "level": "expert",
        "category": "Advanced T-SQL",
        "description": "Lock-free concurrent worker queue polling in T-SQL using UPDLOCK and READPAST (the SQL Server equivalent of SELECT FOR UPDATE SKIP LOCKED).",
        "code": """-- High-Throughput Concurrent Queue Consumer (50+ Workers)
-- Supporting Index: CREATE INDEX idx_jobs_pending ON dbo.task_queue (priority DESC, job_id ASC) WHERE status = 'PENDING';

BEGIN TRANSACTION;

WITH NextJob AS (
    SELECT TOP (1)
        job_id,
        payload,
        status
    FROM dbo.task_queue WITH (UPDLOCK, READPAST) -- Equivalent to SKIP LOCKED!
    WHERE status = 'PENDING'
    ORDER BY priority DESC, job_id ASC
)
UPDATE NextJob
SET 
    status = 'PROCESSING',
    locked_by = HOST_NAME(),
    locked_at = SYSUTCDATETIME()
OUTPUT 
    inserted.job_id,
    inserted.payload;

COMMIT TRANSACTION;""",
        "notes": [
            "UPDLOCK acquires update locks during the read phase to prevent race conditions",
            "READPAST instructs the engine to silently skip rows locked by other concurrent sessions",
            "Enables horizontal scaling across hundreds of worker nodes without lock contention or deadlocks"
        ],
        "use_case": "Transactional background task processing, event dispatchers, and reliable message queuing inside SQL Server."
    },
    {
        "id": "sql-iceberg-cs-04",
        "title": "Multidimensional Aggregation with GROUPING SETS & ROLLUP",
        "level": "advanced",
        "category": "Aggregation",
        "description": "Computing multi-level hierarchical sub-totals and cross-tabulations in a single physical data scan using GROUPING SETS and ROLLUP.",
        "code": """-- Single-Pass Financial Revenue Rollup
-- Hierarchy: Year -> Quarter -> Region -> Channel -> Total

SELECT
    CASE 
        WHEN GROUPING(r.region_name) = 1 THEN 'All Regions' 
        ELSE r.region_name 
    END AS region,
    CASE 
        WHEN GROUPING(d.fiscal_year) = 1 THEN 'All Years' 
        ELSE CAST(d.fiscal_year AS VARCHAR(10)) 
    END AS fiscal_year,
    CASE 
        WHEN GROUPING(c.channel_name) = 1 THEN 'All Channels' 
        ELSE c.channel_name 
    END AS sales_channel,
    SUM(f.gross_revenue) AS total_gross_revenue,
    SUM(f.net_revenue) AS total_net_revenue,
    GROUPING_ID(r.region_name, d.fiscal_year, c.channel_name) AS aggregation_level_bitmap
FROM dbo.fact_sales f
INNER JOIN dbo.dim_date d ON f.date_key = d.date_key
INNER JOIN dbo.dim_regions r ON f.region_key = r.region_key
INNER JOIN dbo.dim_channels c ON f.channel_key = c.channel_key
GROUP BY ROLLUP (
    r.region_name,
    d.fiscal_year,
    c.channel_name
)
ORDER BY 
    r.region_name, 
    d.fiscal_year, 
    c.channel_name;""",
        "notes": [
            "ROLLUP generates hierarchical sub-totals in a single physical pass over source fact tables",
            "GROUPING() detects whether a column is collapsed into a sub-total or represents a detail row",
            "GROUPING_ID() emits an integer bitmask identifying the exact dimensional grouping level"
        ],
        "use_case": "Executive financial reporting, matrix balance sheets, and fast pre-aggregation for OLAP cubes."
    }
]

for s in new_snippets:
    assert s['id'] not in existing_ids, f"Duplicate ID: {s['id']}"

data.extend(new_snippets)
print(f"After: {len(data)} (+{len(new_snippets)})")

with open(FILE, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Successfully written to", FILE)
