import json

new_playbooks = [
  {
    "title": "Snowflake Query Acceleration Service (QAS) vs Warehouse Upsizing",
    "savings": "40% - 60% Compute Credit Reduction on Outlier Queries",
    "summary": "Instead of permanently upsizing an entire Snowflake warehouse from Medium to 2X-Large to handle occasional outlier scans across billions of unclustered rows, enable Query Acceleration Service (QAS). QAS dynamically leases serverless compute slices exclusively for the scan portion of heavy queries, leaving standard queries running on low-cost small clusters.",
    "code": """-- Enable QAS on analytical warehouse with max scale factor cap
ALTER WAREHOUSE analytics_wh SET 
  ENABLE_QUERY_ACCELERATION = TRUE 
  QUERY_ACCELERATION_MAX_SCALE_FACTOR = 8;

-- Identify queries that benefited from QAS acceleration
SELECT query_id, warehouse_name, query_acceleration_bytes_scanned, query_acceleration_partitions_scanned
FROM snowflake.account_usage.query_acceleration_history
WHERE start_time >= CURRENT_DATE() - 7;"""
  },
  {
    "title": "Databricks Serverless SQL Photon Scaling & 2-Minute Idle Shutdown",
    "savings": "45% Reduction in Idle Cluster Billing vs Classic Clusters",
    "summary": "Classic Databricks VM clusters take 3-5 minutes to start and require minimum 10-15 minute auto-termination to avoid start-up thrashing, wasting hundreds of idle compute hours every month. Serverless SQL warehouses boot in under 5 seconds with native C++ Photon execution and can safely auto-suspend after just 2 minutes of inactivity.",
    "code": """-- Configure Databricks Serverless SQL auto-stop and auto-scaling
-- Managed via Databricks REST API or Terraform:
resource "databricks_sql_endpoint" "serverless_bi" {
  name             = "Serverless BI Warehouse"
  cluster_size     = "Medium"
  auto_stop_mins   = 2
  enable_serverless_compute = true
  min_num_clusters = 1
  max_num_clusters = 5
}"""
  },
  {
    "title": "BigQuery Editions & Slot Reservations vs On-Demand ($6.25/TB)",
    "savings": "30% - 55% Cost Savings at Scale (>1 PB/month scanned)",
    "summary": "At enterprise scale, BigQuery's on-demand model ($6.25 per TB scanned) becomes unpredictable and cost-prohibitive. Switching to BigQuery Enterprise Edition with baseline slot reservations (e.g. 100 slots) plus dynamic auto-scaling caps ensures predictable monthly budgeting while preventing runaway queries from scanning 50TB in seconds.",
    "code": """-- Enforce query byte scan safety caps in BigQuery
-- Prevent accidental full-table scans (> 500GB)
#standardSQL
SET @@dataset_project_id = 'prod_analytics';
-- Run query with maximum bytes billed protection
SELECT customer_id, SUM(order_total)
FROM `prod_analytics.sales.transactions`
WHERE transaction_date >= '2026-01-01';
-- Configure via CLI or JDBC: maximum_bytes_billed = 536870912000 (500GB)"""
  },
  {
    "title": "Fabric Capacity Smoothing & Background Job Throttling Guardrails",
    "savings": "Prevents 100% Interactive Reporting Outages & SKU Burst Penalties",
    "summary": "Microsoft Fabric capacities (F64, F128) use a 24-hour rolling smoothing algorithm for background jobs (Spark, Data Factory) and 5-minute smoothing for interactive visuals (Power BI Direct Lake). When heavy batch notebooks burst to 400% capacity, Fabric schedules CU debt that throttles interactive dashboards hours later. Scheduling Spark batch jobs during non-peak windows with dedicated capacity reservation isolates executive reporting from background ETL spikes.",
    "code": """-- Fabric Capacity Metrics App Alerting Query
SELECT TimeStamp, CapacityId, OperationName, ItemType,
       TotalCU_s, InteractiveCU_s, BackgroundCU_s, ThrottlingStatus
FROM fabric_monitoring.capacity_metrics
WHERE ThrottlingStatus IN ('InteractiveDelay', 'InteractiveReject')
ORDER BY TimeStamp DESC;"""
  }
]

with open('src/data/json/modern_cost_playbooks.json', 'r') as f:
    existing = json.load(f)

print(f"Before: {len(existing)}")
existing_titles = {x['title'] for x in existing}
for p in new_playbooks:
    if p['title'] not in existing_titles:
        existing.append(p)

with open('src/data/json/modern_cost_playbooks.json', 'w') as f:
    json.dump(existing, f, indent=2)

print(f"After: {len(existing)}")
