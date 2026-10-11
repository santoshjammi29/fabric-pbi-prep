#!/usr/bin/env python3
"""
Append 5 high-yield PySpark recipes from Ansh Lamba's Masterclass
to src/data/json/data_pyspark.json.
"""

import json
import os

FILE_PATH = os.path.join(os.path.dirname(__file__), '../src/data/json/data_pyspark.json')

new_pyspark_items = [
  {
    "id": "pyspark-recipe-dedup-timestamp",
    "title": "Deduplication Retaining Latest Timestamp via Window Functions",
    "level": "intermediate",
    "category": "Window Functions & Deduplication",
    "description": "Deterministically removes duplicate records for an entity by ranking rows based on timestamp descending and filtering for rank 1.",
    "code": """from pyspark.sql import functions as F
from pyspark.sql.window import Window

# Sample dataset with customer updates
data = [
    ("cust_101", "2026-10-01 10:00:00", "Logged In"),
    ("cust_101", "2026-10-01 14:30:00", "Purchased Item"),  # Latest for 101
    ("cust_102", "2026-10-01 09:15:00", "Added to Cart"),
    ("cust_102", "2026-10-01 09:00:00", "Viewed Page")
]
df = spark.createDataFrame(data, ["customer_id", "event_time", "activity"])

# Define partition window ordered by event_time descending
window_spec = Window.partitionBy("customer_id").orderBy(F.col("event_time").desc())

# Assign row number and retain only the latest record
df_latest = df.withColumn("row_num", F.row_number().over(window_spec)) \\
    .filter(F.col("row_num") == 1) \\
    .drop("row_num")

df_latest.show(truncate=False)""",
    "notes": [
        "Avoid using dropDuplicates(['customer_id']) when you need the most recent row, as dropDuplicates drops non-deterministically.",
        "Add a secondary column in orderBy() to break exact timestamp ties consistently."
    ],
    "use_case": "Ensuring dimensional tables reflect the most recent state of a customer profile during real-time or batch event ingestion."
  },
  {
    "id": "pyspark-recipe-autoloader-stream",
    "title": "Databricks Auto Loader Streaming with Rescued Data Protection",
    "level": "advanced",
    "category": "Streaming & Ingestion",
    "description": "Ingests continuous file streams with automated schema evolution while routing corrupted or unexpected schema drift into the _rescued_data column.",
    "code": """from pyspark.sql import functions as F

source_path = "abfss://raw@datalake.dfs.core.windows.net/events_landing/"
checkpoint_path = "abfss://checkpoints@datalake.dfs.core.windows.net/events_checkpoint/"
schema_path = "abfss://checkpoints@datalake.dfs.core.windows.net/events_schema/"

# Configure resilient Auto Loader stream
streaming_df = spark.readStream \\
    .format("cloudFiles") \\
    .option("cloudFiles.format", "json") \\
    .option("cloudFiles.schemaLocation", schema_path) \\
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns") \\
    .option("cloudFiles.inferColumnTypes", "true") \\
    .load(source_path)

# Write to Delta table with append mode and schema merging
query = streaming_df.writeStream \\
    .format("delta") \\
    .option("checkpointLocation", checkpoint_path) \\
    .option("mergeSchema", "true") \\
    .outputMode("append") \\
    .toTable("bronze_events")""",
    "notes": [
        "cloudFiles.schemaEvolutionMode supports 'addNewColumns', 'rescue', 'failOnNewColumns', and 'none'.",
        "_rescued_data stores any column that fails type casting as raw JSON text, preventing pipeline crashes."
    ],
    "use_case": "Mission-critical continuous cloud storage file ingestion where upstream schemas frequently change without notice."
  },
  {
    "id": "pyspark-recipe-salting-skew",
    "title": "Distributed Join Salting Pattern for Skewed Keys",
    "level": "architect",
    "category": "Performance Tuning & Optimization",
    "description": "Appends random numerical salt keys to skewed DataFrames to eliminate straggler tasks and balance partition distribution across executors.",
    "code": """from pyspark.sql import functions as F

# Assume df_large is heavily skewed on 'country_code' (e.g. 80% 'US')
SALT_FACTOR = 4

# Step 1: Append random salt [0..3] to skewed table
df_large_salted = df_large.withColumn(
    "salt",
    F.concat(F.col("country_code"), F.lit("_"), (F.rand() * SALT_FACTOR).cast("int"))
)

# Step 2: Explode the lookup table across matching salt range [0..3]
salt_df = spark.range(SALT_FACTOR).withColumnRenamed("id", "salt_id")
df_lookup_salted = df_lookup.crossJoin(salt_df) \\
    .withColumn("salt", F.concat(F.col("country_code"), F.lit("_"), F.col("salt_id")))

# Step 3: Execute join on balanced composite salt key
df_joined = df_large_salted.join(df_lookup_salted, on="salt", how="inner") \\
    .drop("salt", "salt_id")""",
    "notes": [
        "Eliminates the classic '199 tasks finish in seconds, 1 task hangs for hours' bottleneck in large shuffles.",
        "Spark 3.x+ Adaptive Query Execution (AQE) handles moderate skew automatically via spark.sql.adaptive.skewJoin.enabled."
    ],
    "use_case": "High-volume joins against tables with severe key skew (e.g., default IDs, popular countries, anonymous users)."
  },
  {
    "id": "pyspark-recipe-delta-scd2-merge",
    "title": "Delta Lake SCD Type 2 Dimension Upsert via MERGE INTO",
    "level": "architect",
    "category": "Delta Lake & Lakehouse Storage",
    "description": "Performs an atomic SCD Type 2 dimension merge, expiring outdated records and inserting active versions with effective dates in a single transaction.",
    "code": """from delta.tables import DeltaTable
from pyspark.sql import functions as F

target_table = DeltaTable.forName(spark, "dim_customer")

# Prepare staged updates with dummy null keys to trigger both update & insert
staged_updates = df_updates.select(
    F.col("customer_id").alias("merge_key"),
    F.col("*")
).unionByName(
    df_updates.select(F.lit(None).alias("merge_key"), F.col("*"))
)

# Atomic Merge execution
target_table.alias("t").merge(
    source=staged_updates.alias("s"),
    condition="t.customer_id = s.merge_key AND t.is_current = true"
).whenMatchedUpdate(
    condition="t.city <> s.city OR t.segment <> s.segment",
    set={"is_current": "false", "end_date": "current_timestamp()"}
).whenNotMatchedInsert(
    values={
        "customer_id": "s.customer_id",
        "name": "s.name",
        "city": "s.city",
        "segment": "s.segment",
        "is_current": "true",
        "start_date": "current_timestamp()",
        "end_date": "null"
    }
).execute()""",
    "notes": [
        "The union with a null merge_key forces Spark to match active records for expiration while also triggering the insert branch for new records.",
        "Guarantees ACID transactional consistency with zero duplicate active records."
    ],
    "use_case": "Historical dimension tracking in enterprise data warehouses and lakehouses."
  },
  {
    "id": "pyspark-recipe-oop-dynamic-utility",
    "title": "Object-Oriented Dynamic PySpark Transformation Utility",
    "level": "advanced",
    "category": "Design Patterns & OOP",
    "description": "A reusable, modular Python class applying method chaining and dynamic column aggregation expressions to eliminate hardcoded PySpark logic.",
    "code": """from pyspark.sql import DataFrame, functions as F
from typing import List, Dict

class DynamicPipelineTransformer:
    def __init__(self, df: DataFrame):
        self.df = df
        
    def add_audit_columns(self) -> 'DynamicPipelineTransformer':
        self.df = self.df.withColumn("ingested_at", F.current_timestamp()) \\
                         .withColumn("source_system", F.lit("ADLS_RAW"))
        return self
        
    def dynamic_aggregate(self, group_by_cols: List[str], agg_mapping: Dict[str, str]) -> DataFrame:
        \"\"\"
        Dynamically builds aggregation expressions from a dictionary.
        agg_mapping: {'revenue': 'sum', 'order_id': 'count', 'discount': 'avg'}
        \"\"\"
        expressions = []
        for col_name, func_name in agg_mapping.items():
            spark_func = getattr(F, func_name.lower())
            expressions.append(spark_func(F.col(col_name)).alias(f"{func_name}_{col_name}"))
            
        return self.df.groupBy(*group_by_cols).agg(*expressions)

# Pipeline usage:
transformer = DynamicPipelineTransformer(df_raw_sales)
df_gold = transformer.add_audit_columns() \\
    .dynamic_aggregate(
        group_by_cols=["region", "product_category"],
        agg_mapping={"sale_amount": "sum", "order_id": "count"}
    )

df_gold.show()""",
    "notes": [
        "Employs Python's getattr(F, func_name) to resolve PySpark SQL functions dynamically at runtime.",
        "Method chaining (returning self) creates expressive, testable, and reusable ETL pipelines."
    ],
    "use_case": "Building enterprise-wide PySpark utility libraries and shared data engineering modules across distributed teams."
  }
]

def main():
    print(f"Reading {FILE_PATH}...")
    with open(FILE_PATH, 'r') as f:
        data = json.load(f)
    print(f"Initial count: {len(data)}")

    existing_ids = {c['id'] for c in data}
    to_add = []
    for c in new_pyspark_items:
        if c['id'] in existing_ids:
            print(f"Skipping existing pyspark item id: {c['id']}")
        else:
            to_add.append(c)

    print(f"Adding {len(to_add)} new PySpark code recipes...")
    data.extend(to_add)

    with open(FILE_PATH, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Final count: {len(data)}")
    print("Successfully appended PySpark recipes!")

if __name__ == '__main__':
    main()
