/* data_pyspark.js — PySpark Data Engineering Concepts
   Santosh Jammi | Principal Data Architect
   Coverage: Beginner → Intermediate → Advanced → Architect
*/
window.PYSPARK_DATA = [
  /* ══════════════════ BEGINNER ══════════════════ */
  {
    id: "py-b-01",
    title: "SparkSession Initialization and Config",
    level: "beginner",
    category: "SparkSession & Config",
    description: "The entry point to programming Spark with the Dataset and DataFrame API. It explains how to build a local or cluster-connected Spark session with configurations optimized for cloud storage and adaptive query execution in Azure Databricks or Microsoft Fabric.",
    code: `from pyspark.sql import SparkSession

# Build SparkSession with optimized configs for enterprise Medallion Pipelines
spark = SparkSession.builder \\
    .appName("EU_BFSI_Transaction_Processor") \\
    .config("spark.sql.shuffle.partitions", "200") \\
    .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \\
    .config("spark.databricks.delta.optimizeWrite.enabled", "true") \\
    .config("spark.databricks.delta.autoCompact.enabled", "true") \\
    .getOrCreate()

# Verify the active session details
print(f"Spark Version: {spark.version}")
print(f"Master Endpoint: {spark.sparkContext.master}")
print(f"App Name: {spark.sparkContext.appName}")`,
    notes: [
      "Use SparkSession.builder to configure parameters before runtime.",
      "CoalescePartitions avoids small file issues by shrinking partition counts after shuffle stages.",
      "In Databricks and Microsoft Fabric, the SparkSession is pre-initialized as 'spark'.",
      "OptimizeWrite and AutoCompact are Delta-specific properties essential for maintaining performance."
    ],
    use_case: "Initializing a PySpark pipeline for an EU BFSI data lakehouse in Azure Databricks, enabling baseline optimizations for Delta Lake writes."
  },
  {
    id: "py-b-02",
    title: "Reading and Writing Delta Tables",
    level: "beginner",
    category: "Data Ingestion & Storage",
    description: "Reading from and writing to Delta Lake tables, including standard write modes (append, overwrite) and format options. Delta Lake provides ACID transaction guarantees on top of cloud storage like ADLS Gen2 or Microsoft OneLake.",
    code: `# Read raw transaction data from Azure Data Lake Storage (ADLS) Gen2
bronze_df = spark.read.format("delta") \\
    .load("abfss://bronze@euadlsprod.dfs.core.windows.net/ledger_logs")

# Filter only settled SEPA transfers for processing
sepa_txns_df = bronze_df.filter(
    (bronze_df.txn_type == "SEPA") & (bronze_df.status == "COMPLETED")
)

# Write to Silver layer with schema merging and overwrite mode
sepa_txns_df.write.format("delta") \\
    .mode("overwrite") \\
    .option("mergeSchema", "true") \\
    .save("abfss://silver@euadlsprod.dfs.core.windows.net/sepa_transactions")`,
    notes: [
      "Delta Lake uses transaction logs (.checkpoint files) to guarantee ACID properties.",
      "overwrite mode replaces the entire directory atomically without causing downtime to readers.",
      "mergeSchema allows schema evolution when new fields are introduced downstream.",
      "Use abfss:// protocol for secure access to Azure storage accounts via OAuth or SAS tokens."
    ],
    use_case: "Ingesting raw payment logs from ADLS landing zone and promoting them to cleansed Silver tables in an Azure Databricks medallion environment."
  },
  {
    id: "py-b-03",
    title: "DataFrame Schema Definition (StructType & StructField)",
    level: "beginner",
    category: "Schema Management",
    description: "Programmatic definition of schemas to enforce type safety on ingestion, avoiding auto-schema inference performance costs and errors. This is critical when dealing with strictly structured files like regulatory bank exports.",
    code: `from pyspark.sql.types import StructType, StructField, StringType, DecimalType, TimestampType, DateType

# Enforce rigorous schema validation for incoming SWIFT payment files
swift_schema = StructType([
    StructField("swift_msg_id", StringType(), False),
    StructField("sender_bic", StringType(), False),
    StructField("receiver_bic", StringType(), False),
    StructField("txn_amount", DecimalType(18, 4), False),
    StructField("txn_currency", StringType(), False),
    StructField("value_date", DateType(), True),
    StructField("ingestion_ts", TimestampType(), True)
])

# Read incoming JSON files enforcing the strict schema
raw_swift_df = spark.read.format("json") \\
    .schema(swift_schema) \\
    .load("abfss://raw@euadlsprod.dfs.core.windows.net/swift_inbound/2026/*.json")`,
    notes: [
      "Explicit schema definition prevents Spark from scanning the entire dataset to infer types, speeding up read operations.",
      "DecimalType(18,4) is used for financial amounts to avoid floating-point representation errors.",
      "Nullable flag (False/True) specifies if columns can accept null values during ingestion parsing.",
      "Unmatched values in schema columns will be converted to NULL rather than failing the execution."
    ],
    use_case: "Enforcing static types on incoming SWIFT MT103 payment messages in Microsoft Fabric to guarantee data quality and audit compliance."
  },
  {
    id: "py-b-04",
    title: "Basic Column Transformations (select, filter, withColumn, drop)",
    level: "beginner",
    category: "DataFrame Transformations",
    description: "Fundamental transformations to project columns, filter records, add or modify columns, and remove unnecessary fields. These operations are evaluated lazily by Spark's Catalyst Optimizer.",
    code: `from pyspark.sql.functions import col, upper, round

# Load Silver transactions
silver_df = spark.read.format("delta").load("abfss://silver@euadlsprod.dfs.core.windows.net/transactions")

# Project relevant fields, apply currency conversion, and clean up raw columns
cleansed_df = silver_df.select("txn_id", "account_id", "txn_amount", "txn_currency", "fx_rate") \\
    .filter(col("txn_amount") > 0) \\
    .withColumn("txn_currency_clean", upper(col("txn_currency"))) \\
    .withColumn("amount_eur", round(col("txn_amount") * col("fx_rate"), 2)) \\
    .drop("txn_currency", "fx_rate")

# Show transformed schema
cleansed_df.printSchema()`,
    notes: [
      "withColumn can overwrite an existing column if the names match, or create a new one.",
      "Catalyst Optimizer merges multiple select() and filter() operations into a single execution step.",
      "Using col('column_name') is preferred over df.column_name to avoid collisions with DataFrame methods.",
      "Dropping source columns after transformation is a good practice to reduce memory usage during serialization."
    ],
    use_case: "Filtering out negative/null amounts and normalizing ISO currencies for retail banking transactions in the Silver layer."
  },
  {
    id: "py-b-05",
    title: "Aggregations and GroupBy (groupBy, agg, sum, avg, count)",
    level: "beginner",
    category: "Basic Aggregations",
    description: "Grouping data by dimensions and performing aggregations like sum, count, and average. GroupBy operations trigger shuffles in a distributed system, reorganizing partitions based on the grouping keys.",
    code: `from pyspark.sql.functions import sum as _sum, avg, count, col

# Load transformed transaction data
df = spark.read.format("delta").load("abfss://silver@euadlsprod.dfs.core.windows.net/cleansed_transactions")

# Aggregate transactional volume and count by account for EBA reporting
monthly_summary_df = df.groupBy("account_id", "txn_currency_clean") \\
    .agg(
        _sum("amount_eur").alias("total_volume_eur"),
        avg("amount_eur").alias("avg_txn_amount_eur"),
        count("txn_id").alias("txn_count")
    ) \\
    .filter(col("total_volume_eur") > 100000)

# Display aggregate output
monthly_summary_df.show(10)`,
    notes: [
      "Always import aggregate functions explicitly (e.g. from pyspark.sql.functions import sum as _sum) to avoid Python namespace collisions.",
      "groupBy triggers a Wide Transformation (shuffle) where records are moved across network nodes.",
      "Use agg() to apply multiple operations (sum, avg, count) simultaneously on the grouped dataset.",
      "Add post-aggregation filters to limit the dataset size before writing to Gold tables."
    ],
    use_case: "Generating daily summary tables of transaction counts and volume by credit card holder for fraud detection thresholds."
  },
  {
    id: "py-b-06",
    title: "Sorting and Deduplication (orderBy, sort, dropDuplicates)",
    level: "beginner",
    category: "Data Quality & Ordering",
    description: "Ordering data distributed across partitions and removing duplicate rows based on business keys. Clean and ordered data is critical for accurate reporting and optimized partition storage layouts.",
    code: `from pyspark.sql.functions import col

# Load duplicate-prone ledger stream
ledger_df = spark.read.format("delta").load("abfss://bronze@euadlsprod.dfs.core.windows.net/raw_ledger")

# Deduplicate based on transaction ID and audit timestamp
deduplicated_df = ledger_df.dropDuplicates(["txn_id", "txn_timestamp"])

# Sort within partitions to optimize write times and clustering performance
sorted_df = deduplicated_df.sortWithinPartitions("txn_date", "account_id")

# Global ordering (used strictly before small file output extracts)
ordered_report_df = sorted_df.orderBy(col("txn_timestamp").desc())`,
    notes: [
      "dropDuplicates removes duplicate rows by keeping only the first occurrence for the specified business keys.",
      "sortWithinPartitions is faster than sort() because it avoids a global shuffle across the network.",
      "orderBy performs a global sort and collects data into sorted partitions, which can be computationally expensive.",
      "Ensure you deduplicate early in the Silver layer to prevent cascading inconsistencies in reports."
    ],
    use_case: "Deduplicating incoming SEPA transactions in a multi-hop Medallion pipeline prior to running risk analytics."
  },
  {
    id: "py-b-07",
    title: "Joining DataFrames (Inner, Left, Semi, Anti Joins)",
    level: "beginner",
    category: "DataFrame Transformations",
    description: "Joining multiple DataFrames using various join types like inner, left, semi, and anti joins. Correct join selection is foundational to master dimensional enrichment and exception checking in Spark.",
    code: `# Load datasets
transactions = spark.read.format("delta").load("abfss://silver@euadlsprod.dfs.core.windows.net/transactions")
customer_profiles = spark.read.format("delta").load("abfss://silver@euadlsprod.dfs.core.windows.net/customers")
sanctioned_parties = spark.read.format("delta").load("abfss://silver@euadlsprod.dfs.core.windows.net/watchlist")

# 1. Left Join to enrich transactions with customer data
enriched_df = transactions.join(
    customer_profiles,
    on="customer_id",
    how="left"
)

# 2. Semi Join to extract transactions with matching sanctioned entities
flagged_txns_df = transactions.join(
    sanctioned_parties,
    transactions.counterparty_bic == sanctioned_parties.bic,
    how="left_semi"
)

# 3. Anti Join to isolate orphan records with no matching customer (Data Quality checks)
orphaned_df = transactions.join(
    customer_profiles,
    on="customer_id",
    how="left_anti"
)`,
    notes: [
      "left_semi join returns columns strictly from the left DataFrame when there is a match, behaving like an IN subquery.",
      "left_anti join returns rows from the left DataFrame when NO match is found, ideal for locating orphaned keys.",
      "Specify join columns as strings (e.g. on='customer_id') to automatically deduplicate the key in the output schema.",
      "Ensure join keys have matching data types to prevent implicit casting and slow execution plans."
    ],
    use_case: "Enriching customer records with risk scores, while filtering out invalid accounts and scanning for sanctioned counterparties."
  },
  {
    id: "py-b-08",
    title: "Temporary Views & PySpark-SQL Interoperability",
    level: "beginner",
    category: "SQL Interoperability",
    description: "Creating session-scoped temporary views from DataFrames to enable query writing via Spark SQL. This enables seamless collaboration between Python data engineers and SQL business analysts.",
    code: `# Load Silver transactions DataFrame
silver_df = spark.read.format("delta").load("abfss://silver@euadlsprod.dfs.core.windows.net/transactions")

# Create temporary session-scoped view
silver_df.createOrReplaceTempView("v_silver_transactions")

# Execute standard ANSI SQL commands against the view
summary_report_df = spark.sql("""
    SELECT 
        account_id,
        SUM(txn_amount) as total_debited,
        CURRENT_TIMESTAMP() as report_generated_at
    FROM v_silver_transactions
    WHERE txn_type = 'DEBIT' AND status = 'COMPLETED'
    GROUP BY account_id
""")

# Show aggregate results
summary_report_df.show(5)`,
    notes: [
      "Temporary views are bound to the active SparkSession and will be dropped when the session ends.",
      "Global temporary views can be shared across multiple sessions using the 'global_temp.' prefix.",
      "spark.sql() returns a PySpark DataFrame, allowing seamless chaining of Python and SQL expressions.",
      "Always parameterize SQL queries to prevent formatting issues and query parsing failures."
    ],
    use_case: "Allowing SQL-native risk analysts to perform ad-hoc checks against a pre-cleansed PySpark DataFrame during regulatory audits."
  },

  /* ══════════════════ INTERMEDIATE ══════════════════ */
  {
    id: "py-i-01",
    title: "Window Functions for Analytical Queries",
    level: "intermediate",
    category: "Analytical Functions",
    description: "Performing calculations across a set of rows related to the current row without collapsing them. Window functions are highly optimized by Spark for calculating running totals, rankings, and lagged records in financial workflows.",
    code: `from pyspark.sql import Window
from pyspark.sql.functions import row_number, col, lag, sum as _sum

# Define transaction window partition by account, ordered by timestamp
ranking_window = Window.partitionBy("account_id").orderBy(col("txn_timestamp").desc())
running_total_window = Window.partitionBy("account_id") \\
    .orderBy("txn_timestamp") \\
    .rowsBetween(Window.unboundedPreceding, Window.currentRow)

# Enrich transactions with dynamic rankings and running balances
enriched_df = transactions \\
    .withColumn("txn_recency", row_number().over(ranking_window)) \\
    .withColumn("running_total_eur", _sum("amount_eur").over(running_total_window)) \\
    .withColumn("prev_txn_amount", lag("amount_eur", 1, 0.0).over(ranking_window))

# Filter to get the top 3 most recent transactions per account
recent_txns_df = enriched_df.filter(col("txn_recency") <= 3)`,
    notes: [
      "Window functions require partitioning and ordering to determine the partition boundaries and row sequence.",
      "Use rowsBetween or rangeBetween to define sliding windows (e.g. running totals, moving averages).",
      "lag and lead fetch rows at a specified offset relative to the current row, defaulting to a custom value (e.g. 0.0) if null.",
      "Omitting partitionBy triggers a global window, collecting all data onto a single worker node (should be avoided at scale)."
    ],
    use_case: "Calculating rolling account balances and identifying transaction recency for AML (Anti-Money Laundering) sequence reviews."
  },
  {
    id: "py-i-02",
    title: "Complex Types: Structs, Arrays, and Maps",
    level: "intermediate",
    category: "Complex Data Types",
    description: "Working with nested schemas, lists, and key-value mapping structures natively in PySpark. This is key for parsing multi-valued JSON structures (like SWIFT/ISO20022 messages) without flattening them prematurely.",
    code: `from pyspark.sql.functions import col, struct, array, explode, map_keys

# 1. Nest columns into a Struct (useful for grouping metadata)
struct_df = silver_df.withColumn("audit_meta", struct(
    col("ingestion_ts").alias("loaded_at"),
    col("batch_id").alias("job_run_id")
))

# 2. Extract elements from an array structure using explode (row replication)
exploded_trades_df = raw_trades_df \\
    .withColumn("trade_leg", explode("trade_legs")) \\
    .select("trade_id", "counterparty", "trade_leg.leg_amount", "trade_leg.currency")

# 3. Work with maps to retrieve configuration properties
config_keys_df = app_configs_df.withColumn("keys", map_keys("property_map"))`,
    notes: [
      "struct creates a single complex column containing sub-fields, accessible via dot-notation (col.subfield).",
      "explode takes an array or map column and generates a new row for each element, replicating other column values.",
      "higher-order functions (e.g. filter, transform) can process arrays inline without needing to explode first.",
      "Maps are perfect for dynamic properties where schema keys change frequently across records."
    ],
    use_case: "Decomposing nested trade messages containing multiple execution legs into individual rows for capital risk metrics calculation."
  },
  {
    id: "py-i-03",
    title: "Built-in Functions & Null Handling",
    level: "intermediate",
    category: "Data Quality",
    description: "Standard practices for cleaning dirty inputs, using conditional logic, and handling missing values safely. Resolving null values ensures accurate calculations in financial rollup reporting.",
    code: `from pyspark.sql.functions import coalesce, col, when, lit

# Clean customer profile details and assign defaults for reporting
sanitized_customers_df = customer_df.withColumn(
    "contact_phone", 
    coalesce(col("mobile_number"), col("home_phone"), lit("NOT_PROVIDED"))
).withColumn(
    "risk_tier_category",
    when(col("risk_score") >= 80, "HIGH")
    .when((col("risk_score") >= 40) & (col("risk_score") < 80), "MEDIUM")
    .otherwise("LOW")
)

# Fill null numeric amounts with zero and empty text with default
cleansed_df = sanitized_customers_df.na.fill({"credit_limit": 0.0, "country_code": "EU"})`,
    notes: [
      "coalesce evaluates columns from left to right and returns the first non-null value.",
      "when().otherwise() executes conditional switch logic, behaving like SQL CASE WHEN.",
      "df.na.fill() fills null values selectively using a Python dictionary mapping column names to defaults.",
      "Using lit() is required to supply literal values (e.g. 'NOT_PROVIDED') inside Spark expressions."
    ],
    use_case: "Resolving missing contact and rating details in credit applicant records prior to scoring modeling."
  },
  {
    id: "py-i-04",
    title: "User Defined Functions (UDFs & Pandas UDFs)",
    level: "intermediate",
    category: "Custom Transformations",
    description: "Extending Spark functionality with custom Python functions. Distinguishes between standard row-by-row Python UDFs and vectorized Pandas UDFs (PyArrow) that perform calculations in batch.",
    code: `import pandas as pd
from pyspark.sql.functions import col, pandas_udf
from pyspark.sql.types import DoubleType

# Vectorized Pandas UDF: Calculate European VAT (Value Added Tax)
@pandas_udf(DoubleType())
def calculate_vat_pandas_udf(amounts: pd.Series, rate_pct: pd.Series) -> pd.Series:
    # Operations are executed using fast vectorized pandas/numpy
    return amounts * (rate_pct / 100.0)

# Apply the vectorized UDF to DataFrame columns
vat_calculated_df = invoices_df.withColumn(
    "vat_amount",
    calculate_vat_pandas_udf(col("net_amount"), col("tax_rate"))
)`,
    notes: [
      "Standard Python UDFs suffer from serialization overhead because data is moved between the JVM and Python interpreter row by row.",
      "Pandas UDFs use Apache Arrow to transfer data in batches, allowing high-performance vectorized operations.",
      "Ensure PyArrow is installed and enabled (spark.sql.execution.arrow.pyspark.enabled = true) to run Pandas UDFs.",
      "Type hinting in @pandas_udf is mandatory to define the return structure of the function."
    ],
    use_case: "Executing complex EU tax calculations on millions of invoice records inside Azure Databricks without JVM-to-Python bottlenecks."
  },
  {
    id: "py-i-05",
    title: "Delta Time Travel & History",
    level: "intermediate",
    category: "Delta Lake Features",
    description: "Querying historical versions of a Delta table using transaction log snapshots. This is essential for reconstructing past data states for auditing, debugging, and rollback.",
    code: `# 1. Retrieve the audit trail history of a Delta table
history_df = spark.read.format("delta") \\
    .load("abfss://silver@euadlsprod.dfs.core.windows.net/ledger") \\
    .history()

# 2. Query historical data as of version 5
df_version_5 = spark.read.format("delta") \\
    .option("versionAsOf", "5") \\
    .load("abfss://silver@euadlsprod.dfs.core.windows.net/ledger")

# 3. Query historical data as of a specific date and time
df_timestamp = spark.read.format("delta") \\
    .option("timestampAsOf", "2026-01-01 12:00:00") \\
    .load("abfss://silver@euadlsprod.dfs.core.windows.net/ledger")`,
    notes: [
      "Delta Lake retains historical files based on table properties like logRetentionDuration and deletedFileRetentionDuration.",
      "versionAsOf reads the specific commit file from the _delta_log directory.",
      "timestampAsOf searches for the closest log commit timestamp that matches the criteria.",
      "Time travel is read-only; to rollback, overwrite the active table with the historical version's contents."
    ],
    use_case: "Reconstructing monthly account balances as of a precise audit cut-off date to satisfy EBA regulatory inspectors."
  },
  {
    id: "py-i-06",
    title: "Auto Loader (cloudFiles) for Streaming Ingestion",
    level: "intermediate",
    category: "Data Ingestion",
    description: "Incrementally and efficiently processing new files as they land in cloud storage (ADLS Gen2 / OneLake) without managing file lists. Auto Loader maintains state using RocksDB checkpoints.",
    code: `# Configure Auto Loader to stream incoming JSON transaction files
streaming_df = spark.readStream.format("cloudFiles") \\
    .option("cloudFiles.format", "json") \\
    .option("cloudFiles.schemaLocation", "abfss://meta@euadlsprod.dfs.core.windows.net/schemas/txns") \\
    .option("cloudFiles.rescuedDataColumn", "_rescued_data") \\
    .load("abfss://landing@euadlsprod.dfs.core.windows.net/incoming_files/*.json")

# Write the stream to a bronze Delta table using structured checkpointing
query = streaming_df.writeStream.format("delta") \\
    .outputMode("append") \\
    .option("checkpointLocation", "abfss://meta@euadlsprod.dfs.core.windows.net/checkpoints/txns") \\
    .start("abfss://bronze@euadlsprod.dfs.core.windows.net/bronze_transactions")`,
    notes: [
      "cloudFiles.schemaLocation is required to store the schema state and support schema evolution automatically.",
      "rescuedDataColumn captures columns that do not match the schema, preserving corrupt data for auditing.",
      "Auto Loader can scale to process billions of files using cloud notifications (SQS/Event Grid) or directory listing.",
      "A checkpoint location is mandatory for streaming to guarantee exactly-once processing semantics."
    ],
    use_case: "Ingesting volatile and unstructured payment stream feeds continuously from landing zones to Bronze Delta layers."
  },
  {
    id: "py-i-07",
    title: "Date and Time Manipulation",
    level: "intermediate",
    category: "Time Series Operations",
    description: "Standard functions for parsing, formatting, and arithmetic operations on dates and timestamps. Critical for defining reporting boundaries and calculating periods in compliance schedules.",
    code: `from pyspark.sql.functions import to_date, to_timestamp, date_add, date_trunc, date_format, col

# Parse string representations of dates, truncate to month, and format
datetime_df = raw_dates_df.select(
    col("txn_id"),
    to_timestamp(col("raw_timestamp"), "yyyy-MM-dd HH:mm:ss.SSS").alias("txn_ts"),
    to_date(col("raw_date"), "dd/MM/yyyy").alias("txn_date")
).withColumn(
    "interest_calc_start", date_add(col("txn_date"), 30)
).withColumn(
    "fiscal_month", date_trunc("MM", col("txn_date"))
).withColumn(
    "report_year_week", date_format(col("txn_date"), "yyyy-w")
)

# Output schema verification
datetime_df.printSchema()`,
    notes: [
      "Use to_date and to_timestamp with explicit format patterns (Java SimpleDateFormat) to avoid parsing failures.",
      "date_trunc truncates dates/timestamps to a specified level like year ('YYYY'), month ('MM'), or hour ('HH').",
      "date_format converts date columns to formatted strings, useful for generating report paths or partition names.",
      "Operations automatically account for leap years and month lengths."
    ],
    use_case: "Normalizing heterogeneous date string formats from international payment gateways into a standardized ISO format."
  },
  {
    id: "py-i-08",
    title: "Partitioning and Bucketing",
    level: "intermediate",
    category: "Storage Optimization",
    description: "Optimizing physical storage layout in cloud storage. Partitioning isolates data into folders based on low-cardinality keys, while bucketing divides data into fixed files based on high-cardinality keys to eliminate shuffles.",
    code: `# 1. Write DataFrame partitioned by transaction date (Low Cardinality)
transactions_df.write.format("delta") \\
    .mode("append") \\
    .partitionBy("txn_date") \\
    .save("abfss://silver@euadlsprod.dfs.core.windows.net/partitioned_txns")

# 2. Write DataFrame bucketed by account ID (High Cardinality)
# Bucketing is saved as a managed table structure
transactions_df.write.format("parquet") \\
    .mode("overwrite") \\
    .bucketBy(100, "account_id") \\
    .sortBy("txn_timestamp") \\
    .saveAsTable("eu_bfsi_prod.silver.bucketed_txns")`,
    notes: [
      "Partitioning is highly effective for filtering (partition pruning) on queries, but should not exceed 10,000 partitions to avoid directory scanning issues.",
      "Liquid Clustering (Delta Lake DBR 13.3+) replaces static partitioning, resolving partition-drift performance issues.",
      "bucketBy requires saveAsTable because metadata must be saved in the Spark metastore to let readers skip shuffles.",
      "Use bucketing when you routinely perform joins or aggregations on high-cardinality columns (e.g. account_id)."
    ],
    use_case: "Designing storage layout for credit transaction tables, using date-partitioning for analytical queries and account-bucketing for reconciliation joins."
  },

  /* ══════════════════ ADVANCED ══════════════════ */
  {
    id: "py-a-01",
    title: "Delta Lake MERGE INTO (Upsert Operations)",
    level: "advanced",
    category: "Medallion Architecture",
    description: "Atomic upsert (insert, update, delete) operations inside Delta tables. Crucial for syncing changing master datasets (e.g. customer dimensions) without rewriting whole directories.",
    code: `# Target Delta table representation
target_table_path = "abfss://silver@euadlsprod.dfs.core.windows.net/customers"

# Load source staging updates
staging_updates_df = spark.read.format("delta").load("abfss://bronze@euadlsprod.dfs.core.windows.net/customer_updates")

from delta.tables import DeltaTable

# Instantiate the target DeltaTable object
delta_target = DeltaTable.forPath(spark, target_table_path)

# Execute the upsert (merge) statement
delta_target.alias("t").merge(
    source=staging_updates_df.alias("s"),
    condition="t.customer_id == s.customer_id"
).whenMatchedUpdate(set={
    "t.customer_name": "s.customer_name",
    "t.email": "s.email",
    "t.risk_score": "s.risk_score",
    "t.updated_ts": "s.updated_ts"
}).whenNotMatchedInsert(values={
    "customer_id": "s.customer_id",
    "customer_name": "s.customer_name",
    "email": "s.email",
    "risk_score": "s.risk_score",
    "created_ts": "s.updated_ts",
    "updated_ts": "s.updated_ts"
}).execute()`,
    notes: [
      "MERGE INTO matches rows between target and source based on a join condition, applying updates or insertions.",
      "Delta Lake ensures that the merge is transactional; readers see either the old state or the full new state.",
      "Optimize performance by ensuring the merge key column is clustered (Z-Ordered) on the target table.",
      "Add additional conditions (e.g. whenMatchedUpdate(condition='s.updated_ts > t.updated_ts')) to prevent out-of-order overrides."
    ],
    use_case: "Updating customer master profiles in the Silver layer (SCD Type 1) with incoming daily profile drift updates."
  },
  {
    id: "py-a-02",
    title: "Delta Lake Change Data Feed (CDF)",
    level: "advanced",
    category: "Medallion Architecture",
    description: "Enabling and querying row-level change propagation logs in Delta tables. Allows incremental extraction of changes (inserts, updates, deletes) to populate downstream Gold aggregates efficiently.",
    code: `# 1. Read change feed events between two versions of the Silver customer table
cdf_df = spark.read.format("delta") \\
    .option("readChangeFeed", "true") \\
    .option("startingVersion", 10) \\
    .option("endingVersion", 15) \\
    .load("abfss://silver@euadlsprod.dfs.core.windows.net/customers")

# 2. Filter CDF events to extract modifications and propagate to audit ledger
updates_and_deletes_df = cdf_df.filter(
    col("_change_type").isin("update_postimage", "delete")
).select(
    col("customer_id"),
    col("risk_score"),
    col("_change_type").alias("operation_type"),
    col("_commit_timestamp").alias("applied_at")
)`,
    notes: [
      "CDF must be explicitly enabled on the table via table properties: tblproperties('delta.enableChangeDataFeed' = 'true').",
      "Special metadata columns returned include _change_type, _commit_version, and _commit_timestamp.",
      "_change_type values include insert, delete, update_preimage (value before update), and update_postimage (value after update).",
      "CDF eliminates the need for expensive full-table diff comparison scans in multi-hop medallion updates."
    ],
    use_case: "Propagating KYC risk rating status changes incrementally from the Silver customer directory to Gold aggregate tables."
  },
  {
    id: "py-a-03",
    title: "Broadcast Join & Joins Optimization",
    level: "advanced",
    category: "Performance Tuning",
    description: "Eliminating network shuffle stages when joining a large table with a small reference dataset. PySpark copies the small dataset to all worker executors, keeping the join entirely local.",
    code: `from pyspark.sql.functions import broadcast

# Load the massive transactions dataset (10 Billion records)
txns_df = spark.read.format("delta").load("abfss://silver@euadlsprod.dfs.core.windows.net/transactions")

# Load small currency dimension table (100 rows)
currency_dim_df = spark.read.format("delta").load("abfss://silver@euadlsprod.dfs.core.windows.net/currencies")

# Force broadcast join of the currency dimension
enriched_txns_df = txns_df.join(
    broadcast(currency_dim_df),
    on="currency_code",
    how="inner"
)

# Verify execution plan contains 'BroadcastHashJoin' using explain()
enriched_txns_df.explain()`,
    notes: [
      "Broadcast joins bypass Shuffle operations, which are the most expensive resource bottleneck in Spark.",
      "The default maximum size for a broadcasted table is 10MB (spark.sql.autoBroadcastJoinThreshold).",
      "Broadcasting a large table can trigger OutOfMemory (OOM) errors on Spark worker executors.",
      "Check query plans for 'BroadcastHashJoin' vs 'SortMergeJoin' to verify optimization success."
    ],
    use_case: "Joining billions of retail transactions with a tiny, static currency exchange rate lookup table during close-of-day valuation."
  },
  {
    id: "py-a-04",
    title: "Caching and Persistence Strategies",
    level: "advanced",
    category: "Resource Management",
    description: "Caching intermediate DataFrames in executor memory or disk. This avoids re-evaluating long execution lineages when the same DataFrame is accessed multiple times by downstream actions.",
    code: `from pyspark import StorageLevel

# Load and apply heavy transformations to expose transaction flags
flagged_accounts_df = raw_txns \\
    .filter(col("amount_eur") > 250000) \\
    .groupBy("account_id").count() \\
    .filter(col("count") >= 5)

# Persist to memory and serialized disk spill (retains resource availability)
flagged_accounts_df.persist(StorageLevel.MEMORY_AND_DISK_SER)

# Trigger action 1: Count of critical warning accounts
high_risk_count = flagged_accounts_df.count()

# Trigger action 2: Save list to audit files (reuses the cached state)
flagged_accounts_df.write.format("delta").save("abfss://gold@euadlsprod.dfs.core.windows.net/aml_targets")

# Always unpersist to release memory when transactions are completed
flagged_accounts_df.unpersist()`,
    notes: [
      "cache() is a shortcut for persist() using default StorageLevel.MEMORY_AND_DISK.",
      "Use serialized persistence (MEMORY_AND_DISK_SER) to reduce memory foot-print and garbage collection overhead.",
      "Caching is lazy; it only materializes in memory when the first action (e.g. count, write) is executed.",
      "Always unpersist() DataFrames to prevent cluster memory leak issues on shared interactive workspaces."
    ],
    use_case: "Caching a filtered daily risk exposure dataset reused across three different reporting pipelines (AML, credit risk, regulatory reporting)."
  },
  {
    id: "py-a-05",
    title: "Custom Spark Partitioning & Repartitioning",
    level: "advanced",
    category: "Performance Tuning",
    description: "Managing the degree of parallelism and layout of partitions in memory. Explains the performance trade-offs between shuffle-inducing repartition and metadata-only coalesce.",
    code: `# Load Silver transactions (poorly partitioned on landing)
dirty_input_df = spark.read.format("delta").load("abfss://bronze@euadlsprod.dfs.core.windows.net/landing_txns")

# 1. repartition: Increase partitions and shuffle data evenly across keys
# Useful to increase parallelism for heavy CPU tasks
repartitioned_df = dirty_input_df.repartition(100, "account_id")

# 2. coalesce: Decreases partitions without shuffling (minimizes data movement)
# Ideal for merging small partitions before writing target files
optimized_for_export_df = repartitioned_df.filter(col("amount_eur") > 10000) \\
    .coalesce(5)

# Write output (will produce exactly 5 files in storage)
optimized_for_export_df.write.format("json").save("abfss://export@euadlsprod.dfs.core.windows.net/daily_alerts")`,
    notes: [
      "repartition() triggers a full shuffle to distribute data evenly, creating equal-sized partitions.",
      "coalesce() only collapses partitions on the same executor, avoiding network shuffles entirely.",
      "Calling repartition() with a partition column optimizes execution paths for downstream grouping.",
      "Coalescing to 1 file before writing causes a bottlenecks, as the final step runs on a single worker executor."
    ],
    use_case: "Balancing cluster work (100 partitions during parallel mapping) and merging reports (5 files during export writes)."
  },
  {
    id: "py-a-06",
    title: "Handling Skewed Data with Salting",
    level: "advanced",
    category: "Performance Tuning",
    description: "Resolving performance bottlenecks caused by uneven data distribution. By appending a randomized suffix (salt key) to skewed keys, transactions are distributed evenly across executors during joins.",
    code: `from pyspark.sql.functions import col, concat, lit, rand, round, explode, array

# Target Table: Massive transactions table where some account IDs are extremely skewed (e.g. corporate accounts)
# Reference Table: Accounts dimension table

# 1. Salt the transactions DataFrame by adding a random salt column (0-9)
salt_factor = 10
salted_txns_df = txns_df.withColumn("salt", round(rand() * (salt_factor - 1))) \\
    .withColumn("salted_join_key", concat(col("account_id"), lit("_"), col("salt")))

# 2. Replicate the accounts dimension table 10 times to match all possible salts
exploded_salts_df = spark.range(0, salt_factor).withColumnRenamed("id", "salt")
replicated_accounts_df = accounts_df.crossJoin(exploded_salts_df) \\
    .withColumn("salted_join_key", concat(col("account_id"), lit("_"), col("salt")))

# 3. Perform skew-free join on salted keys
skew_free_join_df = salted_txns_df.join(
    replicated_accounts_df,
    on="salted_join_key",
    how="inner"
).drop("salt", "salted_join_key")`,
    notes: [
      "Data skew manifests in the Spark UI as a single task taking significantly longer than others (straggler task).",
      "Salting breaks down the massive group corresponding to a skewed key into smaller subsets that run in parallel.",
      "The salt factor determines how many times the dimension table is replicated; choose a value that balances JVM memory limits.",
      "Spark 3.x Adaptive Query Execution (AQE) can handle skew auto-detection dynamically using shuffle statistics."
    ],
    use_case: "Joining billions of payment rows with account masters when corporate ledger accounts hold millions of events compared to retail accounts holding tens of events."
  },
  {
    id: "py-a-07",
    title: "Delta Lake Optimize, Z-Ordering, and Liquid Clustering",
    level: "advanced",
    category: "Storage Optimization",
    description: "Consolidating small files into large ones and organizing layout mapping to speed up queries. Highlights static Z-Ordering vs modern Liquid Clustering for cost-efficient data skipping.",
    code: `# 1. Legacy Z-Ordering (Static multi-dimensional clustering)
# Run via SQL command interface
spark.sql("OPTIMIZE eu_bfsi_prod.silver.transactions ZORDER BY (account_id, currency)")

# 2. Modern Liquid Clustering (DBR 13.3+)
# Configured at table creation or altered dynamically
spark.sql("""
    CREATE TABLE IF NOT EXISTS eu_bfsi_prod.silver.liquid_transactions (
        txn_id STRING,
        account_id STRING,
        txn_date DATE,
        amount_eur DOUBLE
    ) USING DELTA
    CLUSTER BY (account_id, txn_date)
""")

# Compelling execution run to re-cluster layout after batch loading
spark.sql("OPTIMIZE eu_bfsi_prod.silver.liquid_transactions")`,
    notes: [
      "OPTIMIZE merges small partition files into standardized larger blocks (~1GB Parquet files) to improve disk I/O.",
      "Z-Ordering structures columns in space-filling curves to allow multi-dimensional data skipping.",
      "Liquid Clustering eliminates static partitioning, dynamically adjusting physical organization without full rewrites.",
      "Run OPTIMIZE regularly (e.g. daily/weekly) during low-usage windows to minimize cloud storage cost overhead."
    ],
    use_case: "Maintaining sub-second lookup performance on multi-terabyte transactional Delta tables queried by BI reporting tools."
  },
  {
    id: "py-a-08",
    title: "Structured Streaming with Delta Lake",
    level: "advanced",
    category: "Real-time Pipelines",
    description: "Creating continuous, fault-tolerant ingestion pipelines with low latency. Real-time streams are processed in micro-batches with checkpoints to ensure exactly-once guarantees.",
    code: `# Define streaming read from Delta bronze table
streaming_source_df = spark.readStream.format("delta") \\
    .option("maxFilesPerTrigger", "10") \\
    .load("abfss://bronze@euadlsprod.dfs.core.windows.net/transactions")

# Filter fraud candidates (amounts exceeding 50,000 EUR)
alert_stream_df = streaming_source_df \\
    .filter((col("amount_eur") > 50000) & (col("status") == "COMPLETED"))

# Start streaming query and output results to target database
streaming_query = alert_stream_df.writeStream.format("delta") \\
    .outputMode("append") \\
    .option("checkpointLocation", "abfss://meta@euadlsprod.dfs.core.windows.net/checkpoints/realtime_alerts") \\
    .trigger(processingTime="10 seconds") \\
    .start("abfss://gold@euadlsprod.dfs.core.windows.net/realtime_aml_alerts")`,
    notes: [
      "Structured Streaming processes data stream engines using micro-batches (or continuous processing for lower latency).",
      "maxFilesPerTrigger controls the size of each micro-batch, preventing ingestion spikes from crashing workers.",
      "checkpointLocation tracks processed offsets, enabling the stream to resume from failure points without duplicating data.",
      "Trigger processingTime configuration dictates the micro-batch window scheduling interval (e.g. every 10s)."
    ],
    use_case: "Ingesting incoming SEPA transaction feeds, applying real-time compliance filters, and outputting to an AML dashboard with 10-second latency."
  },

  /* ══════════════════ ARCHITECT ══════════════════ */
  {
    id: "py-ar-01",
    title: "GDPR Compliance & Dynamic Data Masking",
    level: "architect",
    category: "Data Governance",
    description: "Enforcing security configurations dynamically on PII columns and complying with the GDPR 'Right to be Forgotten' by purging targeted personal details across historical snapshots without compromising table ACID logs.",
    code: `from pyspark.sql.functions import when, expr, col, sha2, lit

# 1. Dynamic Column Masking: Obfuscate IBAN for unauthorized users
# is_member evaluates the active caller's Microsoft Entra ID groups in Unity Catalog
secured_customer_df = customer_raw_df.withColumn(
    "iban_secured",
    when(expr("is_member('Compliance_Auditors')"), col("iban"))
    .when(expr("is_member('Standard_Developers')"), sha2(col("iban"), 256))
    .otherwise(lit("ACCESS_DENIED"))
)

# 2. Right to be Forgotten (GDPR Article 17): Purge records based on customer requests
# Perform deletion in the Delta table and clean up history using VACUUM
spark.sql("DELETE FROM eu_bfsi_prod.silver.customers WHERE customer_id = 'CUST-EU-8809'")

# Run VACUUM to permanently purge deleted data files from physical storage
# Set retention to 0 hours for immediate physical delete (requires bypass flag)
spark.conf.set("spark.databricks.delta.vacuum.parallelDelete.enabled", "true")
spark.sql("SET spark.databricks.delta.retentionDurationCheck.enabled = false")
spark.sql("VACUUM eu_bfsi_prod.silver.customers RETAIN 0 HOURS")`,
    notes: [
      "Dynamic data masking leverages Unity Catalog integration to evaluate groups dynamically (is_member).",
      "Standard SQL DELETE operations in Delta Lake rewrite file segments, marking old files as tombstoned.",
      "VACUUM permanently deletes files that have been logically deleted longer than the retention period.",
      "Always restrict the use of retentionDurationCheck.enabled = false; running it incorrectly can corrupt active transactions."
    ],
    use_case: "Masking customer IBAN fields dynamically based on user identity roles, and executing audit-safe customer data purges to satisfy EU GDPR requirements."
  },
  {
    id: "py-ar-02",
    title: "Idempotent Medallion Pipeline Orchestration",
    level: "architect",
    category: "Architecture Design",
    description: "Designing end-to-end batch and micro-batch data pipelines that guarantee exactly-once delivery, avoiding data duplication during job reruns or mid-execution failures.",
    code: `from pyspark.sql import functions as F

# Batch Ingestion pattern with explicit batch tracking
def ingest_daily_transactions(batch_date: str, source_path: str, target_table: str):
    # 1. Load batch files for the specific execution date
    batch_df = spark.read.format("delta").load(source_path) \\
        .filter(F.col("txn_date") == batch_date)
    
    # 2. Add pipeline metadata for audit tracing
    enriched_batch_df = batch_df \\
        .withColumn("_pipeline_batch_id", F.lit(batch_date)) \\
        .withColumn("_ingested_at", F.current_timestamp())

    # 3. Idempotently write to target table using INSERT OVERWRITE on the target partition
    # Rerunning this function for the same date will safely overwrite without doubling rows
    enriched_batch_df.write.format("delta") \\
        .mode("overwrite") \\
        .option("replaceWhere", f"txn_date = '{batch_date}'") \\
        .save(target_table)`,
    notes: [
      "Idempotency ensures that executing a pipeline multiple times with the same input produces the exact same output.",
      "Using option('replaceWhere', ...) ensures Spark only overwrites files within matching partitions.",
      "Avoid append mode without duplicate validation since running twice will create duplicates.",
      "For streaming workloads, exactly-once is enforced using checkpoints and state databases (RocksDB)."
    ],
    use_case: "Orchestrating daily transaction ingestion schedules from payment landing zones to the Silver layer that are resilient to pipeline failures."
  },
  {
    id: "py-ar-03",
    title: "FinOps: Cost-Optimized Cluster Configurations",
    level: "architect",
    category: "Cloud FinOps",
    description: "Structuring resource policies, configuring instance pools, setting scaling thresholds, and tweaking execution profiles to reduce cloud waste during massive data transformation tasks.",
    code: `# Configure Spark execution settings to optimize cloud cluster costs (FinOps)
spark.conf.set("spark.sql.adaptive.enabled", "true")                  # Auto optimizes execution paths
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")         # Mitigates data skew tasks dynamically
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")# Automatically merges small output files

# Specify cluster autoscaling logic programmatically for Synapse/Fabric workloads
# Example: Limit max drivers, configure dynamic allocation based on thread limits
spark.conf.set("spark.dynamicAllocation.enabled", "true")
spark.conf.set("spark.dynamicAllocation.minExecutors", "2")
spark.conf.set("spark.dynamicAllocation.maxExecutors", "20")
spark.conf.set("spark.dynamicAllocation.executorIdleTimeout", "60s")`,
    notes: [
      "Set aggressive cluster auto-termination limits (e.g. 15-20 minutes of inactivity) on interactive workspaces.",
      "Use spot instance configurations for worker nodes to save up to 80% of virtual machine computing costs.",
      "Enable Photon Engine in Databricks clusters for vectorized execution on large query volumes.",
      "Set CPU resources dynamically with dynamicAllocation to release workers back to the pool during idle times."
    ],
    use_case: "Configuring serverless autoscaling rules on monthly payment reconciliation jobs to balance performance with strict budget limits."
  },
  {
    id: "py-ar-04",
    title: "Enterprise Metadata Catalog Integration",
    level: "architect",
    category: "Data Integration",
    description: "Designing Unified namespaces across business domains. Leverages Microsoft Fabric OneLake shortcuts and Unity Catalog schemas to bridge multi-cloud workloads without replicating files.",
    code: `# 1. Unity Catalog three-level namespace execution
# Querying directly across catalog structures (dev to prod)
gold_report_df = spark.read.table("eu_bfsi_prod.gold.aml_alerts") \\
    .join(spark.read.table("eu_bfsi_prod.silver.customers"), on="customer_id")

# 2. Accessing cross-cloud datasets using Microsoft Fabric OneLake Shortcuts
# OneLake presents a single ADLS repository across workspaces
fabric_shortcut_path = "abfss://finance_workspace@onelake.dfs.fabric.microsoft.com/invoices.Lakehouse/Tables/raw_invoices"
external_invoices_df = spark.read.format("delta").load(fabric_shortcut_path)

# 3. Create a shortcut reference catalog pointer
spark.sql(f"CREATE TABLE IF NOT EXISTS eu_bfsi_prod.bronze.shortcut_invoices USING DELTA LOCATION '{fabric_shortcut_path}'")`,
    notes: [
      "Unity Catalog enforces a three-level namespace: catalog_name.schema_name.table_name.",
      "Fabric shortcuts let you link external storage accounts (S3, ADLS Gen2) into OneLake as virtual tables.",
      "Using metadata shortcuts prevents duplication of raw files, reducing data egress charges and sync delays.",
      "Configure row-level policies directly inside Unity Catalog to restrict data visibility based on subsidiary locations."
    ],
    use_case: "Cross-subsidiary query resolution between UK and German banking divisions using unified catalog schemas."
  },
  {
    id: "py-ar-05",
    title: "ACID Transactions and Concurrent Writes",
    level: "architect",
    category: "Advanced Delta Lake",
    description: "Managing concurrent transactions and resolving conflicts. Delta Lake uses Optimistic Concurrency Control (OCC) to handle parallel write operations, failing transactions only if they try to modify the same partitions.",
    code: `# Scenario: Simultaneously streaming alerts into gold table and running background maintenance delete
from delta.tables import DeltaTable

# Background process deleting expired transactions
def run_purging_operation():
    try:
        # Perform logical delete on target
        spark.sql("DELETE FROM eu_bfsi_prod.gold.compliance_ledger WHERE txn_date < '2019-01-01'")
    except Exception as e:
        print(f"Conflict detected: {e}")
        # OCC conflict throws 'ConcurrentAppendException' or 'WriteConflictException'

# Stream write configuration with concurrency limits
# Enable schema evolution and configure write limits
spark.conf.set("spark.databricks.delta.write.allowConcurrentWrites", "true")
spark.conf.set("spark.databricks.delta.properties.defaults.isolationLevel", "WriteSerializable")`,
    notes: [
      "Optimistic Concurrency Control assumes writes rarely conflict; it validates before commit and retries if a conflict occurs.",
      "Isolation levels: 'Serializable' guarantees full transaction isolation; 'WriteSerializable' allows parallel updates to different partitions.",
      "Enable Change Data Feed (CDF) to avoid write conflicts by only reading changes instead of full tables.",
      "Design target partitions carefully; writing to different date-partitions (e.g. 2026-05-31 vs 2026-05-30) prevents concurrent conflicts."
    ],
    use_case: "Orchestrating concurrent processes: real-time alerts are appended while GDPR maintenance scripts delete historical rows in the same table."
  },
  {
    id: "py-ar-06",
    title: "Multi-tenant Architecture with Catalog Isolation",
    level: "architect",
    category: "Data Architecture",
    description: "Structuring workspaces and schemas to enforce strict data separation across EU subsidiaries. Uses catalog-level governance to restrict access boundaries and comply with national regulations.",
    code: `# Create tenant catalogs with isolated storage locations (managed locations)
spark.sql("""
    CREATE CATALOG IF NOT EXISTS tenant_france
    MANAGED LOCATION 'abfss://france@euadlsfr.dfs.core.windows.net/managed/'
    COMMENT 'Isolated catalog for French Banking Subsidiary'
""")

spark.sql("""
    CREATE CATALOG IF NOT EXISTS tenant_germany
    MANAGED LOCATION 'abfss://germany@euadlsde.dfs.core.windows.net/managed/'
    COMMENT 'Isolated catalog for German Banking Subsidiary'
""")

# Grant access permissions strictly to regional groups
spark.sql("GRANT USAGE, CREATE SCHEMA ON CATALOG tenant_france TO \`group-fr-data-engineers\`")
spark.sql("GRANT USAGE, CREATE SCHEMA ON CATALOG tenant_germany TO \`group-de-data-engineers\`")

# Active tenant selection logic
spark.sql("USE CATALOG tenant_france")`,
    notes: [
      "Managed locations ensure that data created inside the catalog is automatically stored in tenant-owned cloud buckets.",
      "Catalogs provide the strongest governance boundary in Unity Catalog, isolating data, storage, and access permissions.",
      "Multi-tenant architectures should use separate Entra ID groups to manage regional roles.",
      "Cross-catalog joins are supported for administrative accounts with read permissions on both catalogs."
    ],
    use_case: "Designing compliance environments to separate French and German retail banking customer data, preventing cross-border leaks."
  },
  {
    id: "py-ar-07",
    title: "Medallion Silver-to-Gold Schema Evolution",
    level: "architect",
    category: "Schema Management",
    description: "Managing schema changes in medallion pipelines. Demonstrates how to support schema evolution, prevent pipeline failures from schema drift, and route invalid rows to quarantine.",
    code: `# Load raw ingestion schema with drift allowance enabled
raw_ingest_df = spark.readStream.format("cloudFiles") \\
    .option("cloudFiles.format", "json") \\
    .option("cloudFiles.inferColumnTypes", "true") \\
    .option("cloudFiles.schemaLocation", "abfss://meta@euadlsprod.dfs.core.windows.net/schemas/drift_txns") \\
    .load("abfss://landing@euadlsprod.dfs.core.windows.net/incoming_txns")

# Configure target write with mergeSchema enabled to automatically adapt to column additions
drift_query = raw_ingest_df.writeStream.format("delta") \\
    .outputMode("append") \\
    .option("mergeSchema", "true") \\
    .option("checkpointLocation", "abfss://meta@euadlsprod.dfs.core.windows.net/checkpoints/drift_txns") \\
    .start("abfss://silver@euadlsprod.dfs.core.windows.net/drift_silver_transactions")`,
    notes: [
      "Schema Evolution allows Spark to adapt to new columns, automatically merging them into the Delta table schema.",
      "Schema Enforcement prevents writes from executing if they contain columns not matching the target table, unless mergeSchema is explicitly enabled.",
      "Use cloudFiles.inferColumnTypes carefully, as type changes (e.g. integer to string) can trigger write failures.",
      "Quarantine pattern: route rows containing unexpected fields to a separate dead-letter-table for manual review."
    ],
    use_case: "Designing a robust payment gateway ingestion pipeline that automatically adds new compliance fields to Silver tables without manual intervention."
  },
  {
    id: "py-ar-08",
    title: "Spark UI Analysis & Query Plan Debugging",
    level: "architect",
    category: "Debugging & Performance",
    description: "Reading Spark execution query plans and diagnosing performance bottlenecks. Explains how to identify physical plan operators, find data spills, and check task partition details.",
    code: `# Load target tables for performance diagnosis
txns = spark.read.table("eu_bfsi_prod.silver.transactions")
customers = spark.read.table("eu_bfsi_prod.silver.customers")

# Combine and aggregate to analyze query plans
query_df = txns.join(customers, on="customer_id", how="inner") \\
    .groupBy("customers.country_code").count()

# 1. Print formatted execution query plan to console
# Displays: Parsed Logical Plan -> Analyzed Logical Plan -> Optimized Logical Plan -> Physical Plan
query_df.explain(extended=True)

# 2. Force explain output with cost and code generation details
query_df.explain(mode="formatted")`,
    notes: [
      "Physical plans show operators like SortMergeJoin, HashAggregate, and FileScan, exposing the query's execution path.",
      "Look for '*' in physical plan operators, which denotes codegen support (Whole-Stage Code Generation).",
      "Disk Spill occurs when partition data exceeds the JVM memory limit, forcing Spark to spill data to local executor storage.",
      "Check the Spark UI Storage tab to verify caching efficiency, and the Executor tab to identify skewed tasks."
    ],
    use_case: "Diagnosing a slow monthly aggregation query by reviewing its physical plan to locate disk spill bottlenecks and optimize shuffle partitioning."
  }
];
