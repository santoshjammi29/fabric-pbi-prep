# Module 01: Azure Synapse Analytics Architectural Deep-Dive

## 1. Overview & MPP Core Architecture

Azure Synapse Analytics represents Microsoft's unified enterprise analytics service that integrates big data analytics, data warehousing, and data integration into a single collaborative platform. At its core, the relational warehouse component uses a **Massively Parallel Processing (MPP)** architecture designed to process hundreds of terabytes to petabytes of data.

```mermaid
flowchart TD
    Client[Client Applications / Power BI / SSMS] -->|ODBC / JDBC / ADO.NET| ControlNode[Control Node (Brain / Coordinator)]
    
    subgraph Synapse_Dedicated_SQL_Pool["Synapse Dedicated SQL Pool (MPP)"]
        ControlNode -->|DMS (Data Movement Service)| Compute1["Compute Node 1"]
        ControlNode -->|DMS (Data Movement Service)| Compute2["Compute Node 2"]
        ControlNode -->|DMS (Data Movement Service)| ComputeN["Compute Node N (up to 60)"]
        
        Compute1 --> Dist1["Distributions (1..k)"]
        Compute2 --> Dist2["Distributions (k+1..m)"]
        ComputeN --> DistN["Distributions (..60)"]
    end
    
    subgraph Storage_Layer["Decoupled Storage (Azure Storage Blob / ADLS Gen2)"]
        Dist1 -.-> ADLS1[(Remote Storage 60 Shards)]
        Dist2 -.-> ADLS2[(Remote Storage 60 Shards)]
        DistN -.-> ADLSN[(Remote Storage 60 Shards)]
    end
```

### 1.1 The 60-Distribution Invariant
Regardless of the Performance Level (DWU100c to DW30000c), Synapse Dedicated SQL Pools always partition data into exactly **60 logical distributions** in Azure Storage:
- **DW100c - DW500c**: A single Compute Node manages all 60 distributions.
- **DW1000c**: 2 Compute Nodes manage 30 distributions each.
- **DW6000c**: 12 Compute Nodes manage 5 distributions each.
- **DW30000c**: 60 Compute Nodes manage 1 distribution each (maximum parallel processing bandwidth).

### 1.2 Table Distribution Strategies
Selecting the wrong distribution is the #1 cause of poor performance in Synapse Dedicated Pools:

| Strategy | When to Use | How It Works | Trade-offs & Risks |
| :--- | :--- | :--- | :--- |
| **HASH** | Large Fact tables (>60M rows) with predictable join/filter keys (e.g., `CustomerKey`, `DateKey`). | A deterministic hashing algorithm maps the distribution key column to 1 of 60 distributions. Identical values always land in the exact same distribution. | **Data Skew**: If the hash column has uneven cardinality (e.g. 80% null or 'N/A'), a single distribution will be overloaded, choking the entire cluster. |
| **REPLICATED** | Dimension tables (<2GB compressed, <15M rows) that join frequently with Fact tables. | A full copy of the table is duplicated and cached locally on each Compute Node. | **Write Overhead**: INSERT/UPDATE/DELETE operations require rebuilding the replica cache on all nodes. High memory footprint if overused. |
| **ROUND_ROBIN** | Staging / Landing tables; temporary ETL transformations; tables where no single natural join key exists. | Rows are distributed evenly and sequentially across all 60 distributions in a cyclic round-robin fashion. | **Data Movement Service (DMS) Spills**: Joins on Round-Robin tables require the DMS to broadcast or shuffle rows across nodes during query runtime, creating severe network bottlenecks. |

---

## 2. Storage Engine: Clustered Columnstore Indexes (CCI)

Clustered Columnstore is the default and standard storage mechanism for Synapse tables containing over 60 million rows:
- **Rowgroups**: Data is organized into rowgroups containing up to **1,048,576 rows**.
- **Column Segments**: Within each rowgroup, each column is compressed independently into a segment using algorithms optimized for specific datatypes (LZ4, dictionary encoding, bit-packing).
- **Segment Elimination**: The Control Node stores min/max statistics for every column segment in memory. Queries filtering on indexed columns skip entire rowgroups that cannot match the predicate without reading them from remote ADLS storage.

### 2.1 The Small File / Under-allocated Memory Trap
A critical failure mode in Synapse is "trickle-feeding" data via small batch inserts:
- If an ETL job inserts fewer than 102,400 rows into a partition, Synapse cannot form a compressed Columnstore rowgroup. Instead, the rows spill into an uncompressed row-oriented **Delta Store**.
- Over time, hundreds of small uncompressed delta stores degrade query performance by orders of magnitude.
- **Remediation**: Always stage data in heap/round-robin staging tables, and load into production Columnstore tables in batches exceeding 1,048,576 rows per distribution ($1.05M \times 60 \approx 63M$ rows across the whole table), or explicitly execute:
```sql
ALTER INDEX ALL ON dbo.FactInternetSales REBUILD;
```

---

## 3. Workload Management (WLM) & Concurrency Architecture

Unlike general SQL Server instances where queries share CPU threads dynamically, Synapse Dedicated Pools allocate fixed **Concurrency Slots**:
- A base DWU tier provides a fixed number of slots (e.g., DW1000c provides 32 concurrency slots).
- Every query requires a minimum number of slots determined by its assigned **Resource Class** or **Workload Group**.

### 3.1 Workload Classification & Importance
Modern Synapse implementations replace legacy static/dynamic resource classes with **Workload Classifiers**:
```sql
-- 1. Create dedicated workload group for Executive Power BI Dashboards
CREATE WORKLOAD GROUP wgExecutiveBI
WITH (
    MIN_PERCENTAGE_RESOURCE = 25,     -- Guaranteed 25% compute
    CAP_PERCENTAGE_RESOURCE = 50,     -- Cannot exceed 50%
    REQUEST_MIN_RESOURCE_GRANT_PERCENT = 5,
    QUERY_EXECUTION_TIMEOUT_SEC = 30
);

-- 2. Create classifier routing executive users
CREATE WORKLOAD CLASSIFIER wcExecutivePBI
WITH (
    WORKLOAD_GROUP = 'wgExecutiveBI',
    MEMBERNAME = 'pbi_exec_service_principal',
    IMPORTANCE = HIGH
);
```

---

## 4. Synapse Serverless SQL Pools: Architecture & FinOps

Synapse Serverless SQL Pool is a distributed query processing engine that enables ad-hoc SQL querying directly over data residing in Azure Data Lake Storage (ADLS Gen2), Cosmos DB, or Dataverse without needing to provision or pay for standing infrastructure.

### 4.1 Cost Model: The $5/TB Scanned Metric
- Billing is purely based on the **volume of data scanned** by the query: **\$5.00 per TB**.
- **Crucial FinOps Principle**: Data scanned $\neq$ Data returned. If a query scans a 10TB uncompressed CSV file to return 10 rows, the query costs \$50.00!

### 4.2 Optimization Directives for Serverless SQL
1. **Always Use Parquet or Delta**: Columnar formats allow Serverless SQL to read only the projected columns and use Parquet page-level dictionary stats for filter pushdown.
2. **File Level Partition Pruning (`filepath()` and `filename()`)**:
```sql
SELECT 
    r.filepath(1) AS [Year],
    r.filepath(2) AS [Month],
    SUM(r.TotalAmount) AS MonthlyRevenue
FROM OPENROWSET(
    BULK 'sales/year=*/month=*/*.parquet',
    DATA_SOURCE = 'adls_gold_storage',
    FORMAT = 'PARQUET'
) AS r
WHERE r.filepath(1) = '2024' AND r.filepath(2) IN ('01', '02', '03')
GROUP BY r.filepath(1), r.filepath(2);
```
*Why this saves 90% cost*: Serverless SQL inspects the directory path metadata and physically eliminates all other year and month folders from storage read operations.

---

## 5. Azure Synapse Link: Operational Hybrid Transactional/Analytical Processing (HTAP)

Traditional architectures extract data from operational databases via scheduled ETL batch jobs, introducing 4 to 24 hours of data latency and placing read load on transactional primary replicas.

```mermaid
flowchart LR
    subgraph Operational_Store["Azure Cosmos DB / SQL DB"]
        OLTP[Transactional Store: Row-oriented / Document]
        StorageEngine[Cosmos DB Background Engine]
    end
    
    subgraph Analytical_Sync["Zero-ETL Auto-Sync"]
        StorageEngine -->|Internal Lock-Free Sync (<2 min latency)| ColStore[(Analytical Store: Columnar Parquet)]
    end
    
    subgraph Synapse_Query["Analytical Compute"]
        ColStore -->|Direct Vectorized Query| SynapseServerless[Synapse Serverless SQL / Spark]
        SynapseServerless --> PBI[Power BI Real-Time Dashboard]
    end
```

### 5.1 HTAP Key Advantages
1. **No RU/s Impact**: Queries against the Analytical Store consume **zero Request Units (RU/s)** from the transactional database.
2. **Sub-2-Minute Latency**: Real-time operational data is automatically synced without custom ADF pipelines or Kafka infrastructure.
3. **Optimized Columnar Structure**: Synapse Serverless SQL reads the synced data directly in an optimized columnar format.

---

## 6. Security, Networking & Enterprise Landing Zones

In high-compliance enterprise sectors (banking, healthcare, defense), Synapse must be deployed within a **Managed Virtual Network**:
- **Managed VNet**: Compute nodes reside in an isolated Microsoft-managed network with no public internet ingress or egress.
- **Managed Private Endpoints (MPE)**: Connections between Synapse and ADLS Gen2, Azure Key Vault, or Cosmos DB travel over Azure backbone private IP endpoints, preventing DNS spoofing and man-in-the-middle attacks.
- **Data Exfiltration Protection (DEP)**: Prohibits data movement to any storage account outside the verified Azure tenant, preventing malicious data exfiltration by rogue employees.
- **Fine-Grained Security**: Implemented natively in SQL via Row-Level Security (RLS), Column-Level Security (CLS), and Dynamic Data Masking (DDM).

---

## 7. Synapse Bottlenecks & Production Anti-Patterns

| Anti-Pattern | Manifestation | Root Cause | Production Remediation |
| :--- | :--- | :--- | :--- |
| **Heavy Round-Robin Joins** | Slow query performance; high DMS data broadcast alerts. | Joining two large Round-Robin tables requires cross-node data shuffling. | Convert large Fact tables to **HASH distributed** on the primary join key; convert lookup dimensions to **REPLICATED**. |
| **Row Count Skew** | One distribution holds 20M rows while others hold 100K rows; query execution hangs at 98%. | Low cardinality or skewed distribution key (e.g. `CountryCode` where 95% is 'US'). | Run `DBCC PDW_SHOWSPACEUSED('dbo.FactSales');`. Re-hash on a high-cardinality synthetic key (e.g., `HashKey = CustomerId + OrderId`). |
| **Micro-Batch Delta Spills** | Huge query degradation over weeks; high disk IO. | Running small INSERT/COPY commands every 5 minutes creating millions of uncompressed delta stores. | Aggregate micro-batches into temporary staging tables; load into final tables in chunks $>1.05\text{M}$ rows, or schedule nightly `ALTER INDEX REBUILD`. |
| **Serverless Wildcard CSV Scanning** | Multi-thousand dollar unexpected cloud bill. | Querying `BULK '*.csv'` without file pruning or column projection. | Convert raw files to Parquet with Snappy/ZSTD compression; partition folders by `/year=YYYY/month=MM/` and filter with `filepath()`. |
