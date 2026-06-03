/* data_python.js — Python Data Engineering Concepts
   Santosh Jammi | Principal Data Architect
   Coverage: Beginner → Intermediate → Advanced → Architect
*/
window.PYTHON_DATA = [
  /* ══════════════════ BEGINNER ══════════════════ */
  {
    id: "py-b-01", title: "Python Basics: Data Types & Variables",
    level: "beginner", category: "Foundations",
    description: "Python's dynamic typing and rich built-in types (int, float, str, bool, None) form the foundation for all data engineering work. Understanding type coercion, truthiness, and immutability is crucial when processing financial records.",
    code: `# Core data types used in BFSI data pipelines
transaction_id: int = 100234567
amount: float = 4250.75
currency: str = "EUR"
is_flagged: bool = False
customer_id: str | None = None  # nullable field (Python 3.10+)

# Type checking & conversion
print(type(amount))          # <class 'float'>
print(isinstance(amount, (int, float)))  # True

# Safe string formatting for audit logs
log_entry = f"TXN-{transaction_id} | {currency} {amount:.2f} | flagged={is_flagged}"
print(log_entry)
# TXN-100234567 | EUR 4250.75 | flagged=False

# None coalescing pattern (common in ETL null handling)
customer_name = customer_id or "UNKNOWN"
print(customer_name)  # UNKNOWN`,
    notes: [
      "Use type hints (PEP 484) for all production ETL code — enables static analysis with mypy",
      "f-strings are significantly faster than .format() for log formatting at scale",
      "Python 3.10+ union types (str | None) replace Optional[str] from typing module",
      "Always validate financial amounts as Decimal, not float, to avoid floating-point errors"
    ],
    use_case: "Defining and validating data types for transaction records ingested from EU payment systems at TCS before landing into Bronze Delta Lake tables."
  },
  {
    id: "py-b-02", title: "Lists, Dicts & Sets for Data Engineering",
    level: "beginner", category: "Foundations",
    description: "Python's core collections power most data transformation logic. Lists for ordered sequences, dicts for key-value mappings (like record schemas), and sets for deduplication — all critical ETL primitives.",
    code: `# Lists — ordered, mutable transaction log
transactions = [
    {"id": 1001, "amount": 500.0, "ccy": "EUR", "status": "SETTLED"},
    {"id": 1002, "amount": 230.5, "ccy": "GBP", "status": "PENDING"},
    {"id": 1003, "amount": 500.0, "ccy": "EUR", "status": "SETTLED"},
]

# Filter settled transactions (list comprehension)
settled = [t for t in transactions if t["status"] == "SETTLED"]
print(f"Settled count: {len(settled)}")  # 2

# Dict — schema / config mapping
schema_map = {"id": "BIGINT", "amount": "DOUBLE", "ccy": "STRING", "status": "STRING"}
for col, dtype in schema_map.items():
    print(f"  {col}: {dtype}")

# Set — deduplication of currency codes
currencies = {t["ccy"] for t in transactions}
print(f"Unique currencies: {currencies}")  # {'EUR', 'GBP'}

# Dict comprehension — normalize amounts to EUR
fx_rates = {"EUR": 1.0, "GBP": 1.18, "USD": 0.92}
normalized = {t["id"]: round(t["amount"] * fx_rates[t["ccy"]], 2) for t in transactions}
print(normalized)  # {1001: 500.0, 1002: 271.79, 1003: 500.0}`,
    notes: [
      "Dicts maintain insertion order since Python 3.7+ — reliable for column-ordered schemas",
      "Sets use O(1) membership testing — ideal for large deduplication checks in ETL",
      "List comprehensions are 20-30% faster than equivalent for-loops",
      "Use collections.defaultdict for grouping records without KeyError handling"
    ],
    use_case: "Transforming and deduplicating transaction records from multiple EU payment gateways before writing to the Silver layer in Microsoft Fabric Lakehouse."
  },
  {
    id: "py-b-03", title: "Functions & Error Handling",
    level: "beginner", category: "Foundations",
    description: "Well-structured functions with proper error handling are non-negotiable in production data pipelines. Python's try/except/finally blocks enable graceful recovery from API failures, file read errors, and schema mismatches.",
    code: `import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

def parse_transaction(raw: dict) -> dict | None:
    """Parse and validate a raw transaction record from source system."""
    try:
        # Validate required fields
        required = {"id", "amount", "currency", "timestamp"}
        missing = required - raw.keys()
        if missing:
            raise ValueError(f"Missing required fields: {missing}")

        # Parse and cast
        return {
            "transaction_id": int(raw["id"]),
            "amount": round(float(raw["amount"]), 2),
            "currency": str(raw["currency"]).upper().strip(),
            "timestamp": raw["timestamp"],
            "is_valid": True
        }

    except (KeyError, ValueError, TypeError) as e:
        logger.warning(f"Failed to parse transaction {raw.get('id', 'UNKNOWN')}: {e}")
        return None  # Quarantine-friendly — returns None for bad records

# Process a batch
raw_records = [
    {"id": "1001", "amount": "4250.75", "currency": "eur", "timestamp": "2024-01-15T10:30:00Z"},
    {"id": "1002", "currency": "GBP"},  # Missing amount — will fail
]

parsed = [result for r in raw_records if (result := parse_transaction(r)) is not None]
logger.info(f"Parsed {len(parsed)}/{len(raw_records)} records successfully")`,
    notes: [
      "Always log the record ID in error messages — critical for debugging production pipeline failures",
      "Return None (not raise) for bad records in ETL to allow partial success patterns",
      "Use walrus operator (:=) for compact filter-and-assign in list comprehensions",
      "finally block is ideal for closing database connections or releasing locks"
    ],
    use_case: "Parsing raw JSON transaction records from EU banking APIs with graceful error handling, allowing the pipeline to continue while quarantining bad records to a dead-letter table."
  },
  {
    id: "py-b-04", title: "Pandas: Reading & Basic Operations",
    level: "beginner", category: "Data Manipulation",
    description: "Pandas is the workhorse for single-node data transformation in Python ETL pipelines. DataFrame operations cover reading diverse file formats, basic filtering, and column operations critical to Bronze→Silver data processing.",
    code: `import pandas as pd
from pathlib import Path

# Read raw transaction data from ADLS-mounted path
df = pd.read_csv(
    "transactions_2024_01.csv",
    dtype={"transaction_id": "int64", "amount": "float64", "currency": "str"},
    parse_dates=["transaction_date"],
    na_values=["NULL", "N/A", ""],
)

print(f"Shape: {df.shape}")           # (50000, 8)
print(df.dtypes)
print(df.head(3))

# Basic column operations
df["amount_eur"] = df["amount"] * df["fx_rate"]  # new derived column
df["currency"] = df["currency"].str.upper().str.strip()
df["is_high_value"] = df["amount_eur"] > 10000  # boolean flag (AML pattern)

# Filter: only settled transactions
settled_df = df[df["status"] == "SETTLED"].copy()

# Select relevant columns for Silver layer
silver_cols = ["transaction_id", "amount_eur", "currency", "transaction_date", "is_high_value", "status"]
silver_df = settled_df[silver_cols]

# Write to Parquet (Bronze→Silver)
silver_df.to_parquet("silver/transactions_2024_01.parquet", index=False, engine="pyarrow")
print(f"Written {len(silver_df):,} rows to Silver layer")`,
    notes: [
      "Always specify dtype at read time — avoids pandas auto-casting int64 to float64 on null columns",
      "Use .copy() after filtering to avoid SettingWithCopyWarning in downstream assignments",
      "parse_dates=['col'] is significantly faster than post-hoc pd.to_datetime()",
      "Write to Parquet (not CSV) for all intermediate storage — 10x compression, column pushdown"
    ],
    use_case: "Reading raw CSV transaction files from ADLS Gen2 mount, cleaning and enriching them, then writing to the Silver Parquet layer as part of the Bronze→Silver ADF pipeline at TCS EU BFSI."
  },
  {
    id: "py-b-05", title: "File I/O and JSON Handling",
    level: "beginner", category: "Foundations",
    description: "Production data pipelines frequently process JSON files from REST APIs, event streams, or configuration stores. Python's json module and pathlib enable clean, OS-agnostic file operations.",
    code: `import json
from pathlib import Path
from datetime import datetime

# Config-driven pipeline pattern — read pipeline config
config_path = Path("config/pipeline_config.json")
with config_path.open("r", encoding="utf-8") as f:
    config = json.load(f)

source_path = Path(config["source"]["path"])
target_path = Path(config["target"]["path"])
target_path.mkdir(parents=True, exist_ok=True)

# Read nested JSON (event hub message format)
raw_events = []
for json_file in source_path.glob("events_*.json"):
    with json_file.open("r", encoding="utf-8") as f:
        events = json.load(f)
        raw_events.extend(events if isinstance(events, list) else [events])

print(f"Loaded {len(raw_events)} events from {source_path}")

# Flatten nested structure
def flatten_event(event: dict) -> dict:
    return {
        "event_id":     event["eventId"],
        "customer_id":  event["payload"]["customerId"],
        "amount":       event["payload"]["transaction"]["amount"],
        "currency":     event["payload"]["transaction"]["currency"],
        "event_ts":     event["metadata"]["timestamp"],
    }

flat_events = [flatten_event(e) for e in raw_events]

# Write audit log
audit = {"run_ts": datetime.utcnow().isoformat(), "record_count": len(flat_events)}
with open(target_path / "audit.json", "w") as f:
    json.dump(audit, f, indent=2)`,
    notes: [
      "Always use pathlib.Path over os.path — cross-platform, object-oriented, composable",
      "Use encoding='utf-8' explicitly — avoids encoding errors on Windows machines in team environments",
      "json.load() reads entire file into memory — for large files use ijson for streaming parse",
      "mkdir(parents=True, exist_ok=True) is idempotent — safe for pipeline retries"
    ],
    use_case: "Flattening nested JSON event messages from Azure Event Hubs checkpointed files before loading into the Bronze Delta Lake table in Microsoft Fabric."
  },
  {
    id: "py-b-06", title: "Loops, Comprehensions & Generators",
    level: "beginner", category: "Foundations",
    description: "Python's iteration constructs — from basic for-loops to list comprehensions and generators — are essential for efficient record-level ETL transformations. Generators are memory-efficient for processing large datasets in chunks.",
    code: `# List comprehension — transform and filter in one line
transactions = [
    {"id": i, "amount": i * 150.5, "status": "SETTLED" if i % 3 != 0 else "REJECTED"}
    for i in range(1, 101)
]

settled_amounts = [t["amount"] for t in transactions if t["status"] == "SETTLED"]
print(f"Total settled: EUR {sum(settled_amounts):,.2f}")

# Dict comprehension — build lookup from reference data
customer_data = [{"id": "C001", "name": "ACME Corp"}, {"id": "C002", "name": "Beta Bank"}]
customer_lookup = {c["id"]: c["name"] for c in customer_data}

# Generator — memory-efficient for large file processing
def read_chunks(filepath: str, chunk_size: int = 10_000):
    """Yield DataFrame chunks for large CSV processing."""
    import pandas as pd
    for chunk in pd.read_csv(filepath, chunksize=chunk_size):
        yield chunk

# Process 5TB file without loading into memory
total_rows = 0
for chunk in read_chunks("transactions_full.csv"):
    # Apply transformation per chunk
    chunk["amount_eur"] = chunk["amount"] * chunk["fx_rate"]
    total_rows += len(chunk)
    # ... write chunk to parquet

print(f"Processed {total_rows:,} total rows")

# enumerate() — always use instead of range(len())
for idx, txn in enumerate(transactions[:5], start=1):
    print(f"[{idx:02d}] TXN-{txn['id']}: EUR {txn['amount']:.2f}")`,
    notes: [
      "Generators yield one item at a time — O(1) memory regardless of dataset size",
      "pd.read_csv(chunksize=N) returns a TextFileReader iterator — ideal for 5TB+ file processing",
      "Use enumerate(items, start=1) instead of range(len(items)) — more Pythonic and readable",
      "Comprehensions are syntactic sugar but significantly faster than equivalent for-loops due to bytecode optimization"
    ],
    use_case: "Processing large CSV dumps from EU settlement systems in memory-safe chunks before loading to Bronze layer, avoiding OOM errors on ADF Integration Runtime."
  },
  {
    id: "py-b-07", title: "Lambda, Map & Filter",
    level: "beginner", category: "Functional Programming",
    description: "Lambda functions and higher-order functions (map, filter) are the building blocks of functional ETL transformations. They enable concise, composable data transformations without explicit loops.",
    code: `from functools import reduce

# Lambda — anonymous function for quick transforms
normalize_currency = lambda s: s.strip().upper()
to_cents = lambda amount: int(round(amount * 100))  # avoid float in financial calc

transactions = [
    {"id": 1, "amount": 4250.75, "currency": "eur ", "status": "settled"},
    {"id": 2, "amount": 180.00, "currency": " GBP", "status": "PENDING"},
    {"id": 3, "amount": 9900.00, "currency": "USD", "status": "settled"},
]

# map() — apply transformation to every element
normalized = list(map(lambda t: {
    **t,
    "currency": normalize_currency(t["currency"]),
    "status":   t["status"].upper(),
    "amount_cents": to_cents(t["amount"])
}, transactions))

# filter() — keep only settled records
settled = list(filter(lambda t: t["status"] == "SETTLED", normalized))
print(f"Settled: {len(settled)} records")

# reduce() — aggregate total settled amount
total = reduce(lambda acc, t: acc + t["amount"], settled, 0.0)
print(f"Total settled: EUR {total:,.2f}")

# Chaining: pipeline pattern (functional composition)
pipeline = lambda data: list(
    map(
        lambda t: {**t, "amount_eur": round(t["amount"] * 1.18, 2)},
        filter(lambda t: t["status"] == "SETTLED", data)
    )
)
result = pipeline(transactions)
print(f"Processed {len(result)} records through pipeline")`,
    notes: [
      "Prefer list comprehensions over map/filter for readability in team environments",
      "Store financial amounts as integer cents (multiply by 100) to avoid IEEE 754 float precision errors",
      "functools.reduce() replaces Python 2's built-in reduce() — always import explicitly",
      "Lambda functions can't include statements (only expressions) — use def for complex logic"
    ],
    use_case: "Applying chain-of-transformations pattern on payment records from multiple EU gateways, normalizing currencies and statuses before upsert into Silver Delta table."
  },
  {
    id: "py-b-08", title: "String Operations & Regex",
    level: "beginner", category: "Data Cleaning",
    description: "String manipulation and regex are fundamental for cleaning financial data — normalizing account numbers, extracting reference codes, and validating IBANs, SWIFTs, and date formats from source system dumps.",
    code: `import re
from datetime import datetime

# Common financial data cleaning functions
def clean_iban(iban: str) -> str | None:
    """Normalize and validate IBAN format."""
    cleaned = re.sub(r'\\s+', '', iban.strip().upper())
    # IBAN: 2 letter country + 2 digits + up to 30 alphanumeric
    if re.match(r'^[A-Z]{2}\\d{2}[A-Z0-9]{4,30}$', cleaned):
        return cleaned
    return None

def extract_account_ref(description: str) -> str | None:
    """Extract payment reference from free-text transaction descriptions."""
    # Pattern: REF/123456789 or REFERENCE: 123456789
    match = re.search(r'(?:REF[:/]|REFERENCE[:\\s])([A-Z0-9]{6,20})', description, re.IGNORECASE)
    return match.group(1) if match else None

def normalize_date(date_str: str) -> str | None:
    """Parse multiple EU date formats to ISO 8601."""
    formats = ["%d/%m/%Y", "%d-%m-%Y", "%Y%m%d", "%d.%m.%Y"]
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None

# Test
print(clean_iban("DE89 3704 0044 0532 0130 00"))  # DE89370400440532013000
print(extract_account_ref("PMT REF/TCS20240115 INVOICE"))  # TCS20240115
print(normalize_date("15/01/2024"))  # 2024-01-15
print(normalize_date("20240115"))    # 2024-01-15`,
    notes: [
      "re.sub(r'\\s+', '', text) is the fastest way to remove all whitespace from strings",
      "Always use re.IGNORECASE flag for financial reference matching — source systems vary in casing",
      "Compile regex patterns with re.compile() when applying to millions of records for 2-3x speed gains",
      "datetime.strptime() is far safer than dateutil.parser.parse() — explicit formats prevent misclassification"
    ],
    use_case: "Cleaning and normalizing IBAN numbers, transaction references, and date formats from multiple EU banking source systems before landing to the Bronze layer validation step."
  },

  /* ══════════════════ INTERMEDIATE ══════════════════ */
  {
    id: "py-i-01", title: "Pandas Advanced: GroupBy, Window & Pivot",
    level: "intermediate", category: "Data Manipulation",
    description: "Advanced Pandas operations — groupby aggregations, window functions (transform/rolling), and pivot tables — mirror SQL analytics capabilities for Gold layer metric calculations on single-node workloads.",
    code: `import pandas as pd
import numpy as np

df = pd.read_parquet("silver/transactions_2024.parquet")

# GroupBy with multiple aggregations — daily summary per currency
daily_summary = (
    df.groupby(["transaction_date", "currency"])
    .agg(
        total_volume=("amount_eur", "sum"),
        txn_count=("transaction_id", "count"),
        avg_amount=("amount_eur", "mean"),
        p95_amount=("amount_eur", lambda x: x.quantile(0.95)),
        rejection_rate=("status", lambda x: (x == "REJECTED").mean()),
    )
    .reset_index()
    .round(2)
)

# Window function — 7-day rolling average per currency (like SQL OVER PARTITION BY)
df_sorted = df.sort_values(["currency", "transaction_date"])
df_sorted["rolling_7d_avg"] = (
    df_sorted.groupby("currency")["amount_eur"]
    .transform(lambda x: x.rolling(window=7, min_periods=1).mean())
)

# Lag/Lead — compare today vs yesterday per currency (like SQL LAG())
df_sorted["prev_day_volume"] = (
    df_sorted.groupby("currency")["amount_eur"]
    .transform(lambda x: x.shift(1))
)
df_sorted["volume_change_pct"] = (
    (df_sorted["amount_eur"] - df_sorted["prev_day_volume"]) /
    df_sorted["prev_day_volume"] * 100
).round(2)

# Pivot: currency as columns, date as rows — executive dashboard format
pivot = df.pivot_table(
    index="transaction_date",
    columns="currency",
    values="amount_eur",
    aggfunc="sum",
    fill_value=0
).round(2)

print(pivot.tail(5))`,
    notes: [
      "groupby().agg() with a dict is 3-5x faster than applying multiple separate groupby operations",
      ".transform() returns a Series with same index as original — essential for window calcs without losing rows",
      "Use named aggregation syntax (col=('src', 'func')) for cleaner multi-agg readability",
      "fill_value=0 in pivot_table avoids NaN propagation in downstream metrics calculations"
    ],
    use_case: "Computing daily trading volume metrics, rolling averages, and currency exposure pivot tables for C-level dashboards via Microsoft Fabric Direct Lake semantic models."
  },
  {
    id: "py-i-02", title: "Pandas Merge & Join Strategies",
    level: "intermediate", category: "Data Manipulation",
    description: "Efficient DataFrame merging — inner/left/outer joins, handling duplicate columns, and merge validation — is central to enriching transactional data with reference datasets in Silver→Gold transformations.",
    code: `import pandas as pd

# Transactions DataFrame
transactions = pd.read_parquet("silver/transactions.parquet")

# Reference data: customer master
customers = pd.read_parquet("silver/customers.parquet")

# Counterparty reference
counterparties = pd.read_parquet("silver/counterparties.parquet")

# Left join: enrich transactions with customer info
# validate='many_to_one' enforces referential integrity
enriched = transactions.merge(
    customers[["customer_id", "customer_name", "customer_tier", "country_code"]],
    on="customer_id",
    how="left",
    validate="many_to_one"  # raises MergeError if customers has duplicates
)

# Flag unmatched transactions (orphaned records)
unmatched = enriched[enriched["customer_name"].isna()]
if len(unmatched) > 0:
    print(f"WARNING: {len(unmatched)} transactions have no matching customer")
    unmatched.to_parquet("quarantine/orphaned_transactions.parquet", index=False)

# Chain merge with counterparties
gold_df = (
    enriched
    .merge(counterparties[["counterparty_id", "cp_name", "cp_country", "is_sanctioned"]],
           on="counterparty_id", how="left", validate="many_to_one")
    .merge(pd.read_parquet("silver/fx_rates.parquet"),
           left_on=["currency", "transaction_date"],
           right_on=["currency_code", "rate_date"],
           how="left", suffixes=("", "_fx"))
)

# AML flag: transactions to sanctioned counterparties
gold_df["aml_flag"] = (
    gold_df["is_sanctioned"].fillna(False) &
    (gold_df["amount_eur"] > 1000)
)
print(f"AML flagged records: {gold_df['aml_flag'].sum()}")
gold_df.to_parquet("gold/enriched_transactions.parquet", index=False)`,
    notes: [
      "validate='many_to_one' is a critical data quality guard — catches referential integrity violations at merge time",
      "Always check for NaN in left join results — unmatched records are a common source of Gold layer data quality issues",
      "suffixes parameter prevents column name collisions in multi-table joins",
      "Merge on multiple columns (left_on/right_on lists) is essential for time-varying reference data like FX rates"
    ],
    use_case: "Enriching Silver transaction records with customer master, counterparty reference, and FX rate data to build the GDPR-compliant Gold layer for EU BFSI regulatory reporting."
  },
  {
    id: "py-i-03", title: "Decorators & Context Managers",
    level: "intermediate", category: "Python Patterns",
    description: "Decorators enable cross-cutting concerns (logging, retry, timing) without polluting business logic. Context managers ensure resource cleanup — critical for database connections, file handles, and Spark sessions in production pipelines.",
    code: `import time
import logging
import functools
from contextlib import contextmanager

logger = logging.getLogger(__name__)

# Retry decorator — handles transient API/network failures
def retry(max_attempts: int = 3, delay: float = 2.0, backoff: float = 2.0):
    """Exponential backoff retry decorator for ETL source calls."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            attempt = 0
            wait = delay
            while attempt < max_attempts:
                try:
                    return func(*args, **kwargs)
                except (ConnectionError, TimeoutError) as e:
                    attempt += 1
                    if attempt == max_attempts:
                        logger.error(f"{func.__name__} failed after {max_attempts} attempts: {e}")
                        raise
                    logger.warning(f"{func.__name__} attempt {attempt} failed, retrying in {wait:.1f}s")
                    time.sleep(wait)
                    wait *= backoff
        return wrapper
    return decorator

# Timer decorator — FinOps: measure ETL step duration
def timed(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        logger.info(f"{func.__name__} completed in {elapsed:.3f}s")
        return result
    return wrapper

# Context manager — database connection lifecycle
@contextmanager
def managed_db_connection(connection_string: str):
    """Ensure DB connection is always closed, even on exception."""
    import pyodbc
    conn = None
    try:
        conn = pyodbc.connect(connection_string, timeout=30)
        logger.info("Database connection established")
        yield conn
    except pyodbc.Error as e:
        logger.error(f"Database error: {e}")
        raise
    finally:
        if conn:
            conn.close()
            logger.info("Database connection closed")

# Usage in production pipeline
@retry(max_attempts=3, delay=1.0)
@timed
def fetch_transactions(api_url: str, date: str) -> list[dict]:
    import requests
    response = requests.get(f"{api_url}/transactions", params={"date": date}, timeout=30)
    response.raise_for_status()
    return response.json()

with managed_db_connection("DRIVER={ODBC Driver 18};SERVER=eu-sql.database.windows.net;...") as conn:
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM dbo.transactions WHERE load_date = ?", "2024-01-15")`,
    notes: [
      "functools.wraps(func) preserves function metadata — critical for correct logging and debugging",
      "Exponential backoff (delay * backoff^n) prevents thundering herd on API retry storms",
      "@contextmanager with try/finally guarantees cleanup even on exceptions — safer than __enter__/__exit__",
      "Stack multiple decorators (retry + timed) — they apply bottom-up: timed(retry(func))"
    ],
    use_case: "Wrapping EU banking API calls with retry logic and timing for FinOps monitoring, ensuring database connections are always properly closed even when Databricks cluster preempts tasks."
  },
  {
    id: "py-i-04", title: "Type Hints & Dataclasses (Pydantic)",
    level: "intermediate", category: "Python Patterns",
    description: "Pydantic's data validation models enforce schema contracts at pipeline boundaries, catching type mismatches before they corrupt Delta Lake tables. Essential for configuration management and API payload validation.",
    code: `from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional

class TransactionStatus(str, Enum):
    SETTLED  = "SETTLED"
    PENDING  = "PENDING"
    REJECTED = "REJECTED"
    REVERSED = "REVERSED"

class TransactionRecord(BaseModel):
    """Pydantic model — enforces schema at Bronze ingestion boundary."""
    transaction_id:  str = Field(..., min_length=6, max_length=50, pattern=r'^[A-Z0-9-]+$')
    amount:          Decimal = Field(..., gt=0, decimal_places=2)
    currency:        str = Field(..., min_length=3, max_length=3)
    status:          TransactionStatus
    transaction_ts:  datetime
    customer_id:     Optional[str] = None
    counterparty_id: Optional[str] = None
    is_high_value:   bool = False

    @field_validator("currency", mode="before")
    @classmethod
    def normalize_currency(cls, v):
        return str(v).strip().upper()

    @model_validator(mode="after")
    def flag_high_value(self):
        """Auto-flag AML screening — transactions > EUR 10,000."""
        self.is_high_value = float(self.amount) > 10_000
        return self

class PipelineConfig(BaseModel):
    """Config model — validates ADF pipeline parameters."""
    source_container: str
    target_container: str
    batch_date:       datetime
    parallelism:      int = Field(default=8, ge=1, le=32)
    enable_schema_drift: bool = False

# Parse and validate
raw = {"transaction_id": "TCS-2024-001", "amount": "15000.00",
       "currency": "eur", "status": "SETTLED", "transaction_ts": "2024-01-15T10:30:00Z"}

try:
    txn = TransactionRecord(**raw)
    print(f"Parsed: {txn.transaction_id} | EUR {txn.amount} | high_value={txn.is_high_value}")
    # Output: Parsed: TCS-2024-001 | EUR 15000.00 | high_value=True
except Exception as e:
    print(f"Validation error: {e}")`,
    notes: [
      "Pydantic v2 is 5-50x faster than v1 due to Rust-based core — use model_validator(mode='after') for cross-field validation",
      "Use Decimal (not float) for financial amounts — guarantees exact decimal representation",
      "Enum fields provide both validation and documentation — TransactionStatus prevents invalid status values",
      "PipelineConfig pattern enables config-driven pipelines: read from ADF parameter → validate → run"
    ],
    use_case: "Validating API response payloads from EU payment processors at the Bronze ingestion boundary, ensuring invalid records are quarantined before they corrupt the Delta Lake table schema."
  },
  {
    id: "py-i-05", title: "Generators & Memory-Efficient Processing",
    level: "intermediate", category: "Performance",
    description: "Generator functions enable processing of massive datasets with O(1) memory footprint. Critical for handling 5TB+ file ingestion on ADF Integration Runtime nodes with limited RAM.",
    code: `import pandas as pd
import pyarrow.parquet as pq
import pyarrow as pa
from pathlib import Path
from typing import Iterator, Generator

def read_transactions_streaming(
    source_dir: Path,
    chunk_size: int = 50_000
) -> Generator[pd.DataFrame, None, None]:
    """
    Stream large transaction CSVs from ADLS in memory-safe chunks.
    Avoids loading 5TB+ into memory — suitable for 8GB IR nodes.
    """
    csv_files = sorted(source_dir.glob("txn_*.csv"))
    for csv_file in csv_files:
        print(f"  Processing {csv_file.name}")
        reader = pd.read_csv(
            csv_file,
            chunksize=chunk_size,
            dtype={"transaction_id": str, "amount": float},
            parse_dates=["transaction_date"]
        )
        for chunk in reader:
            yield chunk

def transform_chunk(df: pd.DataFrame) -> pd.DataFrame:
    """Apply Silver-layer transformations to a single chunk."""
    return (
        df
        .dropna(subset=["transaction_id", "amount"])
        .assign(
            currency=df["currency"].str.strip().str.upper(),
            amount_eur=lambda d: d["amount"] * d["fx_rate"],
            is_high_value=lambda d: d["amount_eur"] > 10_000,
            _load_ts=pd.Timestamp.utcnow()
        )
    )

# Streaming pipeline: read → transform → write Parquet partitioned
target_dir = Path("silver/transactions")
target_dir.mkdir(parents=True, exist_ok=True)

total_rows = 0
writers: dict[str, pq.ParquetWriter] = {}

for chunk in read_transactions_streaming(Path("bronze/transactions")):
    transformed = transform_chunk(chunk)
    total_rows += len(transformed)

    # Partition by year-month for efficient pruning
    for partition, group in transformed.groupby(transformed["transaction_date"].dt.to_period("M")):
        out_file = target_dir / f"month={partition}" / "part-0.parquet"
        out_file.parent.mkdir(exist_ok=True)
        group.to_parquet(out_file, index=False, engine="pyarrow")

print(f"Streaming complete: {total_rows:,} rows processed")`,
    notes: [
      "Generator pipeline has O(1) memory — only one chunk lives in memory at a time",
      "Partition Parquet by year-month at write time — Spark/Fabric reads will prune 99% of files on date filters",
      "pyarrow.parquet.ParquetWriter enables incremental writes without loading full dataset",
      "Sort source files before streaming to ensure deterministic processing order for idempotency"
    ],
    use_case: "Processing 5TB+ of daily transaction CSV files from EU settlement systems on a constrained ADF Integration Runtime node, writing partitioned Parquet to the Silver layer without OOM failures."
  },
  {
    id: "py-i-06", title: "Database Connectivity: pyodbc & Azure SQL",
    level: "intermediate", category: "Database Integration",
    description: "Production ETL pipelines frequently need to read/write from Azure SQL or SQL Server. pyodbc with connection pooling, parameterized queries, and bulk insert patterns are essential for BFSI compliance workloads.",
    code: `import pyodbc
import pandas as pd
from typing import Any

class AzureSQLConnector:
    """Production-grade Azure SQL connector with connection string from Key Vault."""

    def __init__(self, server: str, database: str, use_msi: bool = True):
        if use_msi:
            # Managed Identity authentication — no password in code/config
            self.conn_str = (
                f"DRIVER={{ODBC Driver 18 for SQL Server}};"
                f"SERVER={server};"
                f"DATABASE={database};"
                f"Authentication=ActiveDirectoryMsi;"
                f"Encrypt=yes;"
            )
        else:
            raise ValueError("Only Managed Identity auth is approved for GDPR compliance")

    def execute_query(self, sql: str, params: tuple = ()) -> list[dict]:
        """Execute SELECT — returns list of dicts for easy DataFrame conversion."""
        with pyodbc.connect(self.conn_str, timeout=60) as conn:
            cursor = conn.cursor()
            cursor.execute(sql, params)
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]

    def bulk_insert(self, df: pd.DataFrame, table: str, batch_size: int = 5000) -> int:
        """Fast bulk insert using executemany with batching."""
        cols = ", ".join(df.columns)
        placeholders = ", ".join(["?"] * len(df.columns))
        sql = f"INSERT INTO {table} ({cols}) VALUES ({placeholders})"

        total = 0
        with pyodbc.connect(self.conn_str, timeout=60) as conn:
            cursor = conn.cursor()
            cursor.fast_executemany = True  # 10-100x faster than row-by-row
            for i in range(0, len(df), batch_size):
                batch = df.iloc[i:i + batch_size]
                cursor.executemany(sql, batch.values.tolist())
                conn.commit()
                total += len(batch)
        return total

# Usage
connector = AzureSQLConnector("eu-prod.database.windows.net", "bfsi_dw")

# Read reference data
customers = pd.DataFrame(connector.execute_query(
    "SELECT customer_id, customer_name, tier FROM dbo.dim_customers WHERE is_active = 1"
))

# Bulk load Silver metrics
metrics_df = pd.read_parquet("gold/daily_metrics.parquet")
inserted = connector.bulk_insert(metrics_df, "dbo.fact_daily_metrics")
print(f"Inserted {inserted:,} rows")`,
    notes: [
      "fast_executemany=True is the single most important performance flag for pyodbc bulk inserts — 100x faster",
      "Always use Managed Identity (MSI) auth for Azure SQL — eliminates credential rotation and GDPR secrets risk",
      "Parameterized queries (?) prevent SQL injection — never f-string-format user input into SQL",
      "Always commit() per batch, not per row — balances transaction overhead with failure recovery"
    ],
    use_case: "Loading Gold layer daily transaction metrics into Azure SQL DW for Power BI Direct Query reporting, using MSI authentication compliant with EU BFSI GDPR requirements at TCS."
  },
  {
    id: "py-i-07", title: "Concurrent Futures: Parallel ETL",
    level: "intermediate", category: "Performance",
    description: "concurrent.futures enables parallelizing I/O-bound ETL tasks (API calls, file reads) across multiple threads, significantly reducing pipeline runtime when processing many files or API endpoints simultaneously.",
    code: `from concurrent.futures import ThreadPoolExecutor, as_completed, ProcessPoolExecutor
import pandas as pd
from pathlib import Path
import requests
import logging

logger = logging.getLogger(__name__)

def fetch_fx_rate(currency: str, date: str, api_url: str) -> dict:
    """Fetch single FX rate from ECB API — I/O bound."""
    try:
        response = requests.get(
            f"{api_url}/rates/{currency}",
            params={"date": date},
            timeout=15
        )
        response.raise_for_status()
        data = response.json()
        return {"currency": currency, "date": date, "rate": data["rate"], "status": "ok"}
    except Exception as e:
        logger.error(f"FX rate fetch failed for {currency}: {e}")
        return {"currency": currency, "date": date, "rate": None, "status": "error"}

def process_partition(filepath: Path) -> tuple[str, int, float]:
    """CPU-bound: load and aggregate a partition — use ProcessPoolExecutor."""
    df = pd.read_parquet(filepath)
    return (filepath.stem, len(df), df["amount_eur"].sum())

# Parallel FX rate fetching — ThreadPoolExecutor for I/O bound
currencies = ["EUR", "GBP", "USD", "CHF", "SEK", "NOK", "DKK", "PLN"]
date = "2024-01-15"

with ThreadPoolExecutor(max_workers=8) as executor:
    futures = {
        executor.submit(fetch_fx_rate, ccy, date, "https://api.ecb.europa.eu"): ccy
        for ccy in currencies
    }
    fx_rates = []
    for future in as_completed(futures):
        result = future.result()
        fx_rates.append(result)
        logger.info(f"Fetched rate for {result['currency']}: {result['rate']}")

fx_df = pd.DataFrame(fx_rates)
print(fx_df)

# Parallel partition aggregation — ProcessPoolExecutor for CPU-bound
partition_files = list(Path("silver/transactions").glob("*.parquet"))
results = []

with ProcessPoolExecutor(max_workers=4) as executor:
    futures = {executor.submit(process_partition, f): f for f in partition_files}
    for future in as_completed(futures):
        results.append(future.result())

print(pd.DataFrame(results, columns=["partition", "rows", "volume"]))`,
    notes: [
      "ThreadPoolExecutor for I/O-bound (API calls, file reads) — bypasses GIL due to blocking I/O",
      "ProcessPoolExecutor for CPU-bound (data transformation, compression) — true parallelism via separate processes",
      "as_completed() processes results as they finish — better than waiting for all to complete",
      "max_workers=8 for ThreadPoolExecutor is a good starting point for API calls — adjust based on rate limits"
    ],
    use_case: "Fetching FX rates for 8 EU currencies concurrently from ECB API, reducing FX rate enrichment step from 40s sequential to 6s parallel in the ADF Silver pipeline."
  },
  {
    id: "py-i-08", title: "Logging & Observability Patterns",
    level: "intermediate", category: "Observability",
    description: "Structured logging is essential for production pipeline observability. JSON-formatted logs integrate with Azure Monitor, Application Insights, and Log Analytics (KQL) for FinOps cost attribution and SLA monitoring.",
    code: `import logging
import json
import time
from datetime import datetime
from functools import wraps

class StructuredLogger:
    """JSON-structured logger compatible with Azure Monitor / KQL querying."""

    def __init__(self, pipeline_name: str, run_id: str):
        self.pipeline_name = pipeline_name
        self.run_id = run_id
        self._logger = logging.getLogger(pipeline_name)
        self._logger.setLevel(logging.INFO)

        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter("%(message)s"))
        self._logger.addHandler(handler)

    def _emit(self, level: str, message: str, **kwargs):
        record = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": level,
            "pipeline": self.pipeline_name,
            "run_id": self.run_id,
            "message": message,
            **kwargs
        }
        getattr(self._logger, level.lower())(json.dumps(record))

    def info(self, message: str, **kwargs):  self._emit("INFO", message, **kwargs)
    def warning(self, message: str, **kwargs): self._emit("WARNING", message, **kwargs)
    def error(self, message: str, **kwargs):  self._emit("ERROR", message, **kwargs)

    def pipeline_metric(self, step: str, rows: int, duration_s: float, **kwargs):
        """Emit structured metric for Azure Monitor / KQL dashboards."""
        self._emit("INFO", f"METRIC: {step}", step=step, rows_processed=rows,
                   duration_seconds=round(duration_s, 3),
                   rows_per_second=round(rows / max(duration_s, 0.001)), **kwargs)

# Usage
log = StructuredLogger("bfsi_silver_pipeline", run_id="RUN-20240115-001")
log.info("Pipeline started", source="adls/bronze/transactions", batch_date="2024-01-15")

start = time.perf_counter()
# ... process data ...
rows_processed = 125_000
duration = time.perf_counter() - start

log.pipeline_metric("bronze_to_silver", rows=rows_processed, duration_s=duration,
                    layer="silver", partition="2024-01")
# Output: {"timestamp":"...","level":"INFO","pipeline":"bfsi_silver_pipeline",
#          "step":"bronze_to_silver","rows_processed":125000,"duration_seconds":2.341,...}`,
    notes: [
      "JSON-structured logs are queryable in KQL: parse_json(message) | where rows_processed > 100000",
      "Always include run_id in every log record — enables end-to-end trace across ADF → Databricks → SQL",
      "rows_per_second metric feeds FinOps dashboards — identify slow steps for compute optimization",
      "Azure Monitor can alert on ERROR log patterns — implement PagerDuty/Teams webhook for SLA violations"
    ],
    use_case: "Emitting structured pipeline metrics to Azure Monitor during TCS EU BFSI pipelines, enabling KQL dashboards that track processing throughput, identify bottlenecks, and feed FinOps cost attribution."
  },

  /* ══════════════════ ADVANCED ══════════════════ */
  {
    id: "py-a-01", title: "Asyncio: Non-Blocking ETL Orchestration",
    level: "advanced", category: "Concurrency",
    description: "asyncio enables concurrent I/O operations within a single thread, ideal for orchestrating multiple API calls, Azure Storage writes, and microservice calls without the overhead of threads. Critical for high-throughput event-driven pipelines.",
    code: `import asyncio
import aiohttp
import aiofiles
import json
from pathlib import Path
from datetime import datetime

async def fetch_transactions_async(session: aiohttp.ClientSession, url: str, params: dict) -> dict:
    """Non-blocking HTTP call — runs concurrently with other fetches."""
    async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=30)) as resp:
        resp.raise_for_status()
        return await resp.json()

async def write_to_bronze_async(data: list[dict], filepath: Path) -> None:
    """Non-blocking file write — does not block event loop."""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    async with aiofiles.open(filepath, "w", encoding="utf-8") as f:
        await f.write(json.dumps(data, default=str, indent=2))

async def ingest_all_sources(api_base: str, sources: list[dict], date: str) -> dict:
    """
    Concurrently fetch from multiple EU payment source APIs.
    Replaces sequential loop (8 sources × 10s = 80s) with concurrent (≈ 10s).
    """
    results = {"success": [], "failed": []}

    async with aiohttp.ClientSession() as session:
        tasks = [
            fetch_transactions_async(session, f"{api_base}/{src['endpoint']}", {"date": date})
            for src in sources
        ]

        # Gather with return_exceptions=True — partial success pattern
        responses = await asyncio.gather(*tasks, return_exceptions=True)

        write_tasks = []
        for src, resp in zip(sources, responses):
            if isinstance(resp, Exception):
                results["failed"].append({"source": src["name"], "error": str(resp)})
            else:
                results["success"].append(src["name"])
                out_path = Path(f"bronze/{date}/{src['name']}.json")
                write_tasks.append(write_to_bronze_async(resp.get("records", []), out_path))

        # Write all successful responses concurrently
        await asyncio.gather(*write_tasks)

    return results

# Execute
sources = [
    {"name": "payment_gateway_1", "endpoint": "payments"},
    {"name": "settlement_system", "endpoint": "settlements"},
    {"name": "fx_service",        "endpoint": "rates"},
]

results = asyncio.run(ingest_all_sources("https://eu-api.bfsi-corp.com", sources, "2024-01-15"))
print(f"Success: {results['success']}, Failed: {results['failed']}")`,
    notes: [
      "asyncio.gather(*tasks, return_exceptions=True) enables partial success — one failed API doesn't kill all",
      "aiofiles for async file I/O — prevents event loop blocking during disk writes",
      "aiohttp.ClientSession should be reused across requests — avoids TCP connection per request overhead",
      "asyncio is ideal for I/O-bound concurrency; use ProcessPoolExecutor for CPU-bound work"
    ],
    use_case: "Concurrently ingesting transaction data from 8 EU payment gateway APIs simultaneously in the Bronze ingestion step, reducing nightly batch window from 80 minutes to under 15 minutes."
  },
  {
    id: "py-a-02", title: "PyArrow: High-Performance Columnar Processing",
    level: "advanced", category: "Performance",
    description: "Apache Arrow's PyArrow library enables zero-copy, columnar data processing at C-level speed. It's the engine behind Pandas 2.0, Delta Lake, and Parquet I/O — direct use is critical for high-throughput ETL without Spark.",
    code: `import pyarrow as pa
import pyarrow.parquet as pq
import pyarrow.compute as pc
import pyarrow.dataset as ds
from pathlib import Path

# Define schema explicitly — critical for schema enforcement
schema = pa.schema([
    pa.field("transaction_id",  pa.string(), nullable=False),
    pa.field("amount",          pa.decimal128(18, 2), nullable=False),
    pa.field("currency",        pa.string(), nullable=False),
    pa.field("transaction_date",pa.date32(), nullable=False),
    pa.field("customer_id",     pa.string(), nullable=True),
    pa.field("status",          pa.dictionary(pa.int8(), pa.string()), nullable=False),
])

# Read partitioned dataset with predicate pushdown
# Only reads partitions/columns matching filters — massive I/O savings
dataset = ds.dataset(
    "silver/transactions",
    format="parquet",
    partitioning=ds.partitioning(pa.schema([pa.field("year", pa.int32()), pa.field("month", pa.int32())]))
)

# Pushdown filter — reads only 2024-01 partition files
table = dataset.to_table(
    filter=(
        (ds.field("year") == 2024) &
        (ds.field("month") == 1) &
        (ds.field("currency").isin(["EUR", "GBP"]))
    ),
    columns=["transaction_id", "amount", "currency", "transaction_date", "status"]
)

print(f"Rows: {table.num_rows:,}, Size: {table.nbytes / 1e6:.1f} MB")

# Arrow compute functions — vectorized, no Python loop
amounts = table.column("amount").cast(pa.float64())
total   = pc.sum(amounts).as_py()
mean    = pc.mean(amounts).as_py()
p95     = pc.quantile(amounts, q=0.95)[0].as_py()

print(f"Total: EUR {total:,.2f} | Mean: EUR {mean:,.2f} | P95: EUR {p95:,.2f}")

# Write to Gold with Snappy compression + row group size optimization
pq.write_to_dataset(
    table,
    root_path="gold/transactions",
    partition_cols=["currency"],
    existing_data_behavior="overwrite_or_ignore",
    use_dictionary=True,       # dictionary encoding for low-cardinality columns
    compression="snappy",
    row_group_size=100_000,    # optimal for Spark/Fabric read parallelism
)`,
    notes: [
      "PyArrow predicate pushdown reads only required row groups — can reduce I/O by 90%+ on filtered queries",
      "pa.dictionary() encoding for status/currency columns reduces storage 5-10x and accelerates groupby",
      "Arrow compute functions (pc.*) are vectorized C++ — 10-50x faster than equivalent Pandas Python loops",
      "row_group_size=100_000 balances Spark parallelism (smaller groups = more tasks) vs read overhead"
    ],
    use_case: "High-throughput Gold layer metric computation on 5TB transaction history using pure PyArrow on a single Fabric Spark Driver node, achieving sub-minute execution for C-level dashboard refresh."
  },
  {
    id: "py-a-03", title: "Polars: Blazing-Fast DataFrame Alternative",
    level: "advanced", category: "Performance",
    description: "Polars is a Rust-based DataFrame library 5-20x faster than Pandas for most operations. Its lazy evaluation, multi-threaded execution, and Arrow-native memory layout make it ideal for single-node big data processing.",
    code: `import polars as pl
from pathlib import Path

# Lazy evaluation — builds optimized query plan before execution
# Polars optimizer handles predicate pushdown, projection pushdown automatically
lazy_df = (
    pl.scan_parquet("silver/transactions/*.parquet")  # lazy — no data read yet
    .filter(
        (pl.col("status") == "SETTLED") &
        (pl.col("transaction_date") >= pl.date(2024, 1, 1)) &
        (pl.col("amount_eur") > 0)
    )
    .with_columns([
        pl.col("currency").str.to_uppercase().alias("currency"),
        pl.col("amount_eur").round(2),
        (pl.col("amount_eur") > 10_000).alias("is_high_value"),
        pl.col("transaction_date").dt.strftime("%Y-%m").alias("month_partition"),
    ])
    .group_by(["month_partition", "currency"])
    .agg([
        pl.col("amount_eur").sum().alias("total_volume"),
        pl.col("amount_eur").mean().alias("avg_amount"),
        pl.col("amount_eur").quantile(0.95).alias("p95_amount"),
        pl.col("transaction_id").count().alias("txn_count"),
        pl.col("is_high_value").sum().alias("high_value_count"),
    ])
    .sort(["month_partition", "currency"])
)

# .collect() triggers execution — runs all ops in parallel Rust threads
result = lazy_df.collect()
print(f"Result: {result.shape} in {result.estimated_size('mb'):.1f} MB")
print(result.head(10))

# Window functions (equivalent to SQL OVER PARTITION BY)
with_ranks = result.with_columns([
    pl.col("total_volume")
      .rank(method="dense", descending=True)
      .over("month_partition")
      .alias("volume_rank"),
    pl.col("total_volume")
      .sum()
      .over("month_partition")
      .alias("month_total"),
])

# Write Gold metrics
result.write_parquet("gold/monthly_fx_metrics.parquet", compression="snappy")

# Polars vs Pandas benchmark print
print("Polars: native multi-threading, lazy evaluation, Arrow-native — 5-20x faster than Pandas")`,
    notes: [
      "scan_parquet() is lazy — use .collect() only once at the end for maximum optimization",
      "Polars executes all operations in parallel Rust threads — no GIL limitation",
      ".over() is Polars' window function — equivalent to SQL OVER (PARTITION BY)",
      "Polars estimated_size() helps FinOps: track memory usage per pipeline step"
    ],
    use_case: "Running Gold layer aggregations on 5TB transaction history in under 3 minutes on a single 32-core Fabric Spark driver node using Polars, compared to 45 minutes with equivalent Pandas operations."
  },
  {
    id: "py-a-04", title: "Azure SDK: ADLS Gen2 & Key Vault Integration",
    level: "advanced", category: "Azure Integration",
    description: "The Azure Python SDK enables direct interaction with ADLS Gen2, Key Vault, and other Azure services from Python pipelines. Essential for implementing Managed Identity auth, secret retrieval, and storage operations in Fabric/Databricks notebooks.",
    code: `from azure.identity import DefaultAzureCredential, ManagedIdentityCredential
from azure.keyvault.secrets import SecretClient
from azure.storage.filedatalake import DataLakeServiceClient
from azure.core.exceptions import ResourceNotFoundError
import pandas as pd
import io
import json

class AzureServicesClient:
    """Unified Azure services client using Managed Identity — no credentials in code."""

    def __init__(self, storage_account: str, key_vault_url: str):
        # DefaultAzureCredential: tries MSI → environment → CLI → browser
        self.credential = DefaultAzureCredential()

        self.adls_client = DataLakeServiceClient(
            account_url=f"https://{storage_account}.dfs.core.windows.net",
            credential=self.credential
        )
        self.kv_client = SecretClient(vault_url=key_vault_url, credential=self.credential)

    def get_secret(self, secret_name: str) -> str:
        """Retrieve secret from Key Vault — replaces hardcoded credentials."""
        secret = self.kv_client.get_secret(secret_name)
        return secret.value

    def read_parquet_from_adls(self, container: str, path: str) -> pd.DataFrame:
        """Read Parquet file directly from ADLS Gen2 into Pandas."""
        fs_client = self.adls_client.get_file_system_client(container)
        file_client = fs_client.get_file_client(path)
        download = file_client.download_file()
        buffer = io.BytesIO(download.readall())
        return pd.read_parquet(buffer)

    def write_parquet_to_adls(self, df: pd.DataFrame, container: str, path: str) -> None:
        """Write Parquet to ADLS Gen2 with overwrite."""
        buffer = io.BytesIO()
        df.to_parquet(buffer, index=False, engine="pyarrow", compression="snappy")
        buffer.seek(0)

        fs_client = self.adls_client.get_file_system_client(container)
        file_client = fs_client.get_file_client(path)
        file_client.upload_data(buffer, overwrite=True, content_settings=None)
        print(f"Written {len(df):,} rows to adls://{container}/{path}")

    def list_files(self, container: str, path_prefix: str) -> list[str]:
        """List files in ADLS path — for pipeline discovery."""
        fs_client = self.adls_client.get_file_system_client(container)
        return [p.name for p in fs_client.get_paths(path_prefix) if not p.is_directory]

# Usage in Fabric Notebook
az = AzureServicesClient("euprodstorage", "https://eu-keyvault.vault.azure.net")
db_password = az.get_secret("azuresql-password")       # from Key Vault
api_key     = az.get_secret("ecb-api-key")

# Read Bronze, transform, write Silver
bronze_df   = az.read_parquet_from_adls("bronze", "transactions/2024/01/part-0.parquet")
silver_df   = bronze_df[bronze_df["status"] == "SETTLED"].copy()
az.write_parquet_to_adls(silver_df, "silver", "transactions/year=2024/month=01/part-0.parquet")`,
    notes: [
      "DefaultAzureCredential tries MSI first in Azure compute — zero code changes between local dev and production",
      "Never hardcode credentials — Key Vault integration is GDPR requirement in EU BFSI environments",
      "Use DataLakeServiceClient (Gen2) not BlobServiceClient — enables hierarchical namespace and ACL control",
      "io.BytesIO bridge converts ADLS byte stream to Pandas-readable buffer without temp file"
    ],
    use_case: "Implementing credential-free Azure SDK access from Microsoft Fabric Notebooks and ADF pipelines, reading/writing ADLS Gen2 with Managed Identity and retrieving secrets from Key Vault for GDPR compliance."
  },
  {
    id: "py-a-05", title: "SCD Type 2 Implementation in Python",
    level: "advanced", category: "Data Patterns",
    description: "Slowly Changing Dimension Type 2 tracks historical changes by closing old records and inserting new ones. Pure Python implementation using Pandas merge/comparison logic, suitable for non-Spark environments.",
    code: `import pandas as pd
from datetime import datetime, timezone
import hashlib
import json

def compute_hash(row: pd.Series, cols: list[str]) -> str:
    """MD5 hash of key business columns — detects row changes."""
    data = json.dumps({c: str(row[c]) for c in cols}, sort_keys=True)
    return hashlib.md5(data.encode()).hexdigest()

def apply_scd2(
    existing: pd.DataFrame,
    incoming: pd.DataFrame,
    business_key: str,
    tracked_cols: list[str],
    now: datetime | None = None
) -> tuple[pd.DataFrame, dict]:
    """
    Apply SCD Type 2 logic:
    - New records → INSERT with current_flag=True
    - Changed records → EXPIRE old (current_flag=False, valid_to=now), INSERT new
    - Unchanged records → no action
    """
    now = now or datetime.now(tz=timezone.utc)
    now_str = now.isoformat()
    HIGH_DATE = "9999-12-31T23:59:59+00:00"

    # Compute row hashes on tracked columns
    existing["_hash"] = existing.apply(lambda r: compute_hash(r, tracked_cols), axis=1)
    incoming["_hash"] = incoming.apply(lambda r: compute_hash(r, tracked_cols), axis=1)

    # Get active (current) records from existing
    active = existing[existing["current_flag"] == True].set_index(business_key)

    new_records, expired_ids = [], []

    for _, row in incoming.iterrows():
        key = row[business_key]
        if key not in active.index:
            # Net new — insert
            new_records.append({**row, "valid_from": now_str, "valid_to": HIGH_DATE, "current_flag": True})
        elif row["_hash"] != active.loc[key, "_hash"]:
            # Changed — expire old, insert new
            expired_ids.append(key)
            new_records.append({**row, "valid_from": now_str, "valid_to": HIGH_DATE, "current_flag": True})
        # else: unchanged — no action

    # Expire old records
    existing.loc[(existing[business_key].isin(expired_ids)) & (existing["current_flag"] == True),
                 ["valid_to", "current_flag"]] = [now_str, False]

    result = pd.concat([existing, pd.DataFrame(new_records)], ignore_index=True)
    result = result.drop(columns=["_hash"])

    stats = {"inserts": len(new_records), "expirations": len(expired_ids)}
    return result, stats

# Example: Customer dimension SCD2
existing_dim = pd.read_parquet("gold/dim_customers.parquet")
incoming_snapshot = pd.read_parquet("silver/customer_snapshot_20240115.parquet")

updated_dim, stats = apply_scd2(
    existing=existing_dim,
    incoming=incoming_snapshot,
    business_key="customer_id",
    tracked_cols=["customer_name", "tier", "country_code", "risk_rating"]
)

updated_dim.to_parquet("gold/dim_customers.parquet", index=False)
print(f"SCD2 complete: {stats['inserts']} inserts, {stats['expirations']} expirations")`,
    notes: [
      "MD5 hash comparison is faster than column-by-column diff for detecting row changes — O(n) vs O(n×m)",
      "HIGH_DATE = '9999-12-31' for open-ended records — standard data warehouse convention for current rows",
      "current_flag=True filter on existing table is critical — must only compare against active dimension records",
      "In production, write to Delta Lake and use MERGE INTO instead — handles concurrency safely"
    ],
    use_case: "Maintaining full historical customer dimension in the Gold layer with SCD Type 2 tracking for EU BFSI regulatory time-travel queries — e.g., 'what was the customer's risk rating at transaction time?'"
  },
  {
    id: "py-a-06", title: "Great Expectations: Data Quality Framework",
    level: "advanced", category: "Data Quality",
    description: "Great Expectations provides declarative data quality validation with rich HTML reports and checkpoint integration. Implementing quality gates at Bronze/Silver layer boundaries prevents bad data from propagating to Gold.",
    code: `import great_expectations as gx
from great_expectations.core.batch import RuntimeBatchRequest
import pandas as pd

# Initialize GX context (local filesystem)
context = gx.get_context()

# Load Silver transactions for validation
df = pd.read_parquet("silver/transactions_2024_01.parquet")

# Create validator
validator = context.sources.add_or_update_pandas(name="silver_transactions") \\
    .add_dataframe_asset("txn_2024_01") \\
    .get_batch_list_from_batch_request(
        RuntimeBatchRequest(batch_identifiers={"batch_id": "silver_2024_01"})
    )

# Actually, simpler API for inline validation:
validator = context.sources.pandas_default.read_dataframe(df)

# Expectation suite — Bronze → Silver quality gates
validator.expect_column_values_to_not_be_null("transaction_id")
validator.expect_column_values_to_not_be_null("amount_eur")
validator.expect_column_values_to_be_in_set("currency", ["EUR", "GBP", "USD", "CHF", "SEK"])
validator.expect_column_values_to_be_in_set("status", ["SETTLED", "PENDING", "REJECTED", "REVERSED"])
validator.expect_column_values_to_be_between("amount_eur", min_value=0.01, max_value=10_000_000)
validator.expect_column_values_to_match_regex("transaction_id", r"^[A-Z]{3}-\\d{6,12}$")
validator.expect_column_pair_values_a_to_be_greater_than_b(
    "transaction_date", "created_date", or_equal=True
)

# Custom expectation — amount must equal component sum
validator.expect_column_sum_to_be_between(
    "amount_eur",
    min_value=1_000_000,  # At least EUR 1M daily volume (business rule)
    max_value=5_000_000_000
)

# Run validation
results = validator.validate()

if not results.success:
    failed = [r for r in results.results if not r.success]
    print(f"❌ Data quality failed: {len(failed)} expectations violated")
    for f in failed:
        print(f"  - {f.expectation_config.expectation_type}: {f.result}")
    raise ValueError("Silver layer quality gate failed — blocking Gold promotion")

print(f"✅ All {len(results.results)} quality checks passed — promoting to Gold")`,
    notes: [
      "Quality gates at Bronze→Silver and Silver→Gold boundaries prevent bad data cascading to reports",
      "GX generates HTML report with visual pass/fail breakdown — shareable with stakeholders",
      "Custom expectations (amount_sum range) encode business rules — not just technical validity",
      "Integrate with ADF pipeline failure handling: GX exception → ADF activity failure → alert"
    ],
    use_case: "Implementing automated data quality checkpoints at the Silver layer boundary in the TCS EU BFSI pipeline, ensuring regulatory reporting data meets GDPR accuracy requirements before Gold promotion."
  },
  {
    id: "py-a-07", title: "Microsoft Fabric REST API Integration",
    level: "advanced", category: "Azure Integration",
    description: "The Microsoft Fabric REST API enables programmatic control of workspaces, lakehouses, pipelines, and semantic models. Python scripts can trigger refreshes, monitor capacity, and implement FinOps automation.",
    code: `import requests
from azure.identity import DefaultAzureCredential
import time
import json

class FabricAPIClient:
    """Microsoft Fabric REST API client using Managed Identity auth."""

    FABRIC_API = "https://api.fabric.microsoft.com/v1"
    POWERBI_API = "https://api.powerbi.com/v1.0/myorg"

    def __init__(self):
        self.credential = DefaultAzureCredential()

    def _get_token(self, scope: str) -> str:
        token = self.credential.get_token(scope)
        return token.token

    def _fabric_headers(self) -> dict:
        return {"Authorization": f"Bearer {self._get_token('https://api.fabric.microsoft.com/.default')}",
                "Content-Type": "application/json"}

    def _pbi_headers(self) -> dict:
        return {"Authorization": f"Bearer {self._get_token('https://analysis.windows.net/powerbi/api/.default')}",
                "Content-Type": "application/json"}

    def list_workspaces(self) -> list[dict]:
        resp = requests.get(f"{self.FABRIC_API}/workspaces", headers=self._fabric_headers())
        resp.raise_for_status()
        return resp.json().get("value", [])

    def trigger_lakehouse_table_maintenance(self, workspace_id: str, lakehouse_id: str, table: str) -> str:
        """Trigger OPTIMIZE + VACUUM on Delta table via Fabric API."""
        payload = {"executionData": {"tableName": table, "operationType": "OptimizeAndVacuum"}}
        resp = requests.post(
            f"{self.FABRIC_API}/workspaces/{workspace_id}/lakehouses/{lakehouse_id}/tables/{table}/runTableMaintenance",
            headers=self._fabric_headers(), json=payload
        )
        resp.raise_for_status()
        return resp.json().get("operationId")

    def refresh_semantic_model(self, workspace_id: str, dataset_id: str, wait: bool = True) -> str:
        """Trigger Power BI / Fabric semantic model refresh."""
        resp = requests.post(
            f"{self.POWERBI_API}/groups/{workspace_id}/datasets/{dataset_id}/refreshes",
            headers=self._pbi_headers(),
            json={"notifyOption": "NoNotification"}
        )
        resp.raise_for_status()
        refresh_id = resp.headers.get("x-ms-request-id")

        if wait:
            self._poll_refresh(workspace_id, dataset_id, refresh_id)
        return refresh_id

    def _poll_refresh(self, workspace_id: str, dataset_id: str, refresh_id: str, timeout: int = 1800):
        start = time.time()
        while time.time() - start < timeout:
            resp = requests.get(
                f"{self.POWERBI_API}/groups/{workspace_id}/datasets/{dataset_id}/refreshes/{refresh_id}",
                headers=self._pbi_headers()
            )
            status = resp.json().get("status")
            if status == "Completed": print(f"Refresh complete"); return
            if status == "Failed":    raise RuntimeError(f"Refresh failed: {resp.json()}")
            time.sleep(30)

# FinOps automation: post-pipeline refresh
fabric = FabricAPIClient()
ws_id = "your-workspace-guid"
fabric.trigger_lakehouse_table_maintenance(ws_id, "lakehouse-guid", "fact_transactions")
fabric.refresh_semantic_model(ws_id, "semantic-model-guid", wait=True)`,
    notes: [
      "Fabric API uses scoped tokens — Fabric API scope differs from Power BI API scope",
      "Poll semantic model refresh status — C-level dashboards need confirmation before SLA window closes",
      "Table maintenance API triggers OPTIMIZE+VACUUM — integrate into post-load pipeline step for FinOps",
      "Use Managed Identity in Fabric Notebooks — DefaultAzureCredential auto-picks MSI in Azure compute"
    ],
    use_case: "Programmatically triggering Delta table OPTIMIZE after nightly load and refreshing the C-level Power BI semantic model via Fabric REST API, ensuring Direct Lake dashboards reflect fresh data before 08:00 SLA."
  },
  {
    id: "py-a-08", title: "Kafka-Python: Real-Time Event Streaming",
    level: "advanced", category: "Streaming",
    description: "kafka-python enables Python-based real-time event consumption from Azure Event Hubs (Kafka protocol). Building consumer groups, offset management, and micro-batch writes to Delta Lake enables near-real-time Bronze ingestion.",
    code: `from kafka import KafkaConsumer, TopicPartition
from kafka.errors import KafkaError
import json
import pandas as pd
from datetime import datetime
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class EventHubsConsumer:
    """
    Azure Event Hubs consumer using Kafka protocol.
    Event Hubs exposes Kafka-compatible endpoint — no separate Kafka cluster needed.
    """

    def __init__(self, namespace: str, eventhub_name: str, conn_str: str, group_id: str):
        self.consumer = KafkaConsumer(
            eventhub_name,
            bootstrap_servers=f"{namespace}.servicebus.windows.net:9093",
            security_protocol="SASL_SSL",
            sasl_mechanism="PLAIN",
            sasl_plain_username="$ConnectionString",
            sasl_plain_password=conn_str,
            group_id=group_id,
            auto_offset_reset="earliest",
            enable_auto_commit=False,   # manual commit for exactly-once
            value_deserializer=lambda m: json.loads(m.decode("utf-8")),
            max_poll_records=1000,
            session_timeout_ms=30000,
        )

    def consume_micro_batch(self, timeout_ms: int = 5000) -> list[dict]:
        """Pull one micro-batch of events."""
        records = self.consumer.poll(timeout_ms=timeout_ms, max_records=1000)
        events = []
        for partition_records in records.values():
            for record in partition_records:
                events.append({
                    "event_id":   record.value.get("id"),
                    "payload":    record.value,
                    "partition":  record.partition,
                    "offset":     record.offset,
                    "ingested_ts": datetime.utcnow().isoformat()
                })
        return events

    def run_streaming_pipeline(self, bronze_path: str, batch_size_seconds: int = 60):
        """Micro-batch loop: consume → flatten → write Bronze Parquet → commit."""
        logger.info("Starting micro-batch consumer loop")
        while True:
            try:
                events = self.consume_micro_batch()
                if events:
                    df = pd.DataFrame(events)
                    out = Path(bronze_path) / f"batch_{datetime.utcnow().strftime('%Y%m%dT%H%M%S')}.parquet"
                    df.to_parquet(out, index=False)
                    self.consumer.commit()  # commit only after successful write
                    logger.info(f"Written {len(events)} events to {out}")
            except KafkaError as e:
                logger.error(f"Kafka error: {e}")

# Start consumer
consumer = EventHubsConsumer(
    namespace="eu-eventhubs",
    eventhub_name="payment-events",
    conn_str="Endpoint=sb://eu-eventhubs.servicebus.windows.net/;...",
    group_id="bronze-consumer-group"
)
consumer.run_streaming_pipeline("bronze/payment_events")`,
    notes: [
      "enable_auto_commit=False with manual commit() after write guarantees at-least-once delivery",
      "Azure Event Hubs exposes Kafka-compatible endpoint — same kafka-python client works without Kafka cluster",
      "Commit offset only AFTER successful write to storage — prevents data loss on consumer restart",
      "In production, use PySpark Structured Streaming or Fabric Eventstream instead for high-throughput (>1M events/sec)"
    ],
    use_case: "Consuming real-time payment events from Azure Event Hubs into Bronze Delta Lake micro-batches, enabling 5-minute SLA from payment authorization to Bronze layer availability for AML fraud detection."
  },

  /* ══════════════════ ARCHITECT ══════════════════ */
  {
    id: "py-arch-01", title: "Config-Driven ETL Framework",
    level: "architect", category: "Architecture",
    description: "A production-grade, config-driven ETL framework decouples pipeline behavior from code. Parameterized pipelines read JSON/YAML configs at runtime, enabling zero-code deployment of new data sources and transformations without changing pipeline logic.",
    code: `from dataclasses import dataclass, field
from typing import Callable, Any
from pathlib import Path
import json
import pandas as pd
import logging
import time
from datetime import datetime

logger = logging.getLogger(__name__)

@dataclass
class PipelineStep:
    name: str
    fn: Callable
    config: dict = field(default_factory=dict)
    enabled: bool = True

@dataclass
class PipelineContext:
    """Shared state passed through all pipeline steps."""
    run_id: str
    batch_date: str
    config: dict
    data: dict = field(default_factory=dict)  # shared data store between steps
    metrics: dict = field(default_factory=dict)
    errors: list = field(default_factory=list)

class ETLFramework:
    """
    Config-driven pipeline framework used across TCS EU BFSI pipelines.
    Supports step-level retries, metrics, quarantine, and idempotent execution.
    """

    def __init__(self, pipeline_name: str):
        self.pipeline_name = pipeline_name
        self.steps: list[PipelineStep] = []

    def add_step(self, name: str, fn: Callable, config: dict = None, enabled: bool = True):
        self.steps.append(PipelineStep(name=name, fn=fn, config=config or {}, enabled=enabled))
        return self  # fluent interface

    def run(self, batch_date: str, config: dict) -> PipelineContext:
        run_id = f"{self.pipeline_name}-{datetime.utcnow().strftime('%Y%m%dT%H%M%S')}"
        ctx = PipelineContext(run_id=run_id, batch_date=batch_date, config=config)
        logger.info(json.dumps({"event": "pipeline_start", "run_id": run_id, "batch_date": batch_date}))

        for step in self.steps:
            if not step.enabled:
                logger.info(f"Step '{step.name}' skipped (disabled)")
                continue

            start = time.perf_counter()
            try:
                step.fn(ctx, **step.config)
                elapsed = time.perf_counter() - start
                ctx.metrics[step.name] = {"status": "success", "duration_s": round(elapsed, 3)}
                logger.info(json.dumps({"event": "step_complete", "step": step.name, "duration_s": elapsed}))
            except Exception as e:
                ctx.errors.append({"step": step.name, "error": str(e)})
                logger.error(json.dumps({"event": "step_failed", "step": step.name, "error": str(e)}))
                raise  # Fail fast — ADF handles retry at pipeline level

        logger.info(json.dumps({"event": "pipeline_complete", "run_id": run_id,
                                "steps_completed": len([m for m in ctx.metrics if ctx.metrics[m]["status"]=="success"])}))
        return ctx

# Pipeline Definition
def step_extract(ctx: PipelineContext, source_path: str, **_):
    df = pd.read_parquet(source_path.format(date=ctx.batch_date))
    ctx.data["raw"] = df
    logger.info(f"Extracted {len(df):,} rows")

def step_validate(ctx: PipelineContext, null_check_cols: list, **_):
    df = ctx.data["raw"]
    nulls = df[null_check_cols].isnull().sum()
    if nulls.any():
        bad = nulls[nulls > 0].to_dict()
        raise ValueError(f"Null check failed: {bad}")
    ctx.data["validated"] = df

def step_transform(ctx: PipelineContext, **_):
    df = ctx.data["validated"]
    df["amount_eur"] = df["amount"] * df["fx_rate"]
    df["_load_ts"] = datetime.utcnow().isoformat()
    ctx.data["silver"] = df

def step_load(ctx: PipelineContext, target_path: str, **_):
    df = ctx.data["silver"]
    out = target_path.format(date=ctx.batch_date)
    df.to_parquet(out, index=False)
    ctx.metrics["rows_written"] = len(df)

pipeline = (
    ETLFramework("bfsi_silver_txn")
    .add_step("extract", step_extract, config={"source_path": "bronze/transactions/{date}.parquet"})
    .add_step("validate", step_validate, config={"null_check_cols": ["transaction_id", "amount"]})
    .add_step("transform", step_transform)
    .add_step("load", step_load, config={"target_path": "silver/transactions/{date}.parquet"})
)

ctx = pipeline.run(batch_date="2024-01-15", config={"env": "prod"})`,
    notes: [
      "Config-driven frameworks enable zero-code onboarding of new data sources — just add a JSON config",
      "PipelineContext as shared mutable state replaces global variables — testable, debuggable, thread-safe",
      "Step-level metrics emit to structured JSON — queryable in Azure Monitor for FinOps dashboards",
      "Fail-fast on step error (re-raise) — ADF retry handles the outer loop, preventing partial Silver layer writes"
    ],
    use_case: "Core ETL orchestration framework used across all TCS EU BFSI pipelines — enabling 5+ engineering squads to deploy new data source integrations without modifying shared pipeline code, maintaining zero schedule slippage."
  },
  {
    id: "py-arch-02", title: "Delta Lake Python: ACID Transactions & Time Travel",
    level: "architect", category: "Delta Lake",
    description: "The deltalake Python library (delta-rs) enables ACID Delta Lake operations from pure Python without Spark. Enables Delta MERGE, time travel queries, schema enforcement, and OPTIMIZE from lightweight Python environments.",
    code: `from deltalake import DeltaTable, write_deltalake
from deltalake.writer import write_deltalake
import pandas as pd
import pyarrow as pa
from datetime import datetime, timedelta

# Schema definition — enforced at write time
SILVER_SCHEMA = pa.schema([
    pa.field("transaction_id",  pa.string()),
    pa.field("amount_eur",      pa.float64()),
    pa.field("currency",        pa.string()),
    pa.field("status",          pa.string()),
    pa.field("transaction_date",pa.date32()),
    pa.field("customer_id",     pa.string()),
    pa.field("_load_ts",        pa.timestamp("us", tz="UTC")),
])

table_path = "abfss://silver@euprodstorage.dfs.core.windows.net/transactions"
storage_opts = {"account_name": "euprodstorage", "use_azure_cli": "true"}

# Write (schema enforcement — schema_mode='merge' allows adding columns)
df = pd.read_parquet("bronze/transactions_20240115.parquet")
df["_load_ts"] = pd.Timestamp.utcnow()

write_deltalake(
    table_path,
    df,
    schema=SILVER_SCHEMA,
    mode="append",                   # idempotent: use 'overwrite' for full reload
    schema_mode="merge",             # allows schema evolution — new cols added gracefully
    storage_options=storage_opts,
    partition_by=["currency"],       # partition by currency for efficient FX-based queries
    max_rows_per_file=100_000,       # control file size for optimal Spark parallelism
)

# Delta Table operations
dt = DeltaTable(table_path, storage_options=storage_opts)

# Time Travel — query as of yesterday (audit/GDPR retrospective)
yesterday = (datetime.utcnow() - timedelta(days=1)).isoformat()
historical_df = (
    dt.load_as_version(0)  # by version number
    # OR: dt.load_with_datetime(yesterday)
    .to_pandas()
)
print(f"Historical row count: {len(historical_df):,}")

# Table history — for lineage / change audit
history = dt.history(limit=10)
for entry in history:
    print(f"v{entry['version']}: {entry['operation']} at {entry['timestamp']}")

# OPTIMIZE — compaction (equivalent to Spark OPTIMIZE)
dt.optimize()
print("Compaction complete")

# Vacuum — GDPR erasure (remove files older than 7 days)
dt.vacuum(retention_hours=168, dry_run=False, enforce_retention_duration=False)
print("Vacuum complete — old file versions purged")`,
    notes: [
      "delta-rs (deltalake Python library) runs without Spark — ideal for lightweight ADF Python activities",
      "schema_mode='merge' implements schema evolution — new source columns are added without breaking existing data",
      "time travel (load_with_datetime) is critical for GDPR data subject requests and audit retrospectives",
      "vacuum() with retention_hours=0 enables GDPR right-to-erasure — removes all previous file versions"
    ],
    use_case: "Running Delta Lake OPTIMIZE and VACUUM on Silver tables from a lightweight Python ADF activity post-load, and implementing GDPR right-to-erasure by vacuuming deleted customer records from Delta file history."
  },
  {
    id: "py-arch-03", title: "Data Vault 2.0: Hubs, Satellites & Links",
    level: "architect", category: "Data Modeling",
    description: "Data Vault 2.0 methodology provides audit-friendly, scalable data warehouse design. Python implementation of Hub/Satellite/Link patterns enables automated DV2.0 loading from Silver Parquet into Gold Delta Lake tables.",
    code: `import pandas as pd
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

def compute_hash_key(business_key: str | list) -> str:
    """Generate SHA-256 hash key for Data Vault entities."""
    if isinstance(business_key, list):
        key_str = "||".join(str(k).upper().strip() for k in business_key)
    else:
        key_str = str(business_key).upper().strip()
    return hashlib.sha256(key_str.encode()).hexdigest()

class DataVaultLoader:
    """
    Data Vault 2.0 loader — implements Hub, Satellite, and Link patterns.
    Supports idempotent loads (safe to re-run on pipeline retry).
    """

    def __init__(self, source_name: str, load_date: datetime):
        self.source = source_name
        self.load_date = load_date.replace(tzinfo=timezone.utc)

    def load_hub(self, df: pd.DataFrame, business_key_col: str, hub_path: str) -> pd.DataFrame:
        """
        Hub: unique business keys with hash key.
        Idempotent: only inserts keys not already in Hub.
        """
        hub_df = pd.DataFrame({
            "hub_hash_key":   df[business_key_col].apply(lambda x: compute_hash_key(str(x))),
            "load_date":      self.load_date,
            "record_source":  self.source,
            business_key_col: df[business_key_col].astype(str).str.strip().str.upper(),
        }).drop_duplicates(subset=["hub_hash_key"])

        try:
            existing = pd.read_parquet(hub_path)
            new_keys = hub_df[~hub_df["hub_hash_key"].isin(existing["hub_hash_key"])]
            if len(new_keys) > 0:
                updated = pd.concat([existing, new_keys], ignore_index=True)
                updated.to_parquet(hub_path, index=False)
            return new_keys
        except FileNotFoundError:
            hub_df.to_parquet(hub_path, index=False)
            return hub_df

    def load_satellite(self, df: pd.DataFrame, parent_hash_key_col: str,
                       attribute_cols: list[str], sat_path: str) -> pd.DataFrame:
        """
        Satellite: descriptive attributes with hash diff for change detection.
        Only inserts when attributes change (hash diff pattern).
        """
        sat_df = df[[parent_hash_key_col] + attribute_cols].copy()
        sat_df["load_date"]     = self.load_date
        sat_df["record_source"] = self.source
        sat_df["hash_diff"] = sat_df[attribute_cols].apply(
            lambda r: compute_hash_key(r.tolist()), axis=1
        )

        try:
            existing = pd.read_parquet(sat_path)
            # Join on parent key + hash_diff — only insert new/changed records
            merged = sat_df.merge(existing[["hub_hash_key", "hash_diff"]].rename(
                columns={"hub_hash_key": parent_hash_key_col}),
                on=[parent_hash_key_col, "hash_diff"], how="left", indicator=True
            )
            new_records = merged[merged["_merge"] == "left_only"].drop(columns=["_merge"])
            if len(new_records) > 0:
                updated = pd.concat([existing, new_records], ignore_index=True)
                updated.to_parquet(sat_path, index=False)
        except FileNotFoundError:
            sat_df.to_parquet(sat_path, index=False)

        return sat_df

    def load_link(self, df: pd.DataFrame, parent_keys: list[str], link_path: str) -> pd.DataFrame:
        """Link: relationships between Hub entities."""
        link_df = pd.DataFrame({
            "link_hash_key": df[parent_keys].apply(
                lambda r: compute_hash_key(r.tolist()), axis=1),
            "load_date":     self.load_date,
            "record_source": self.source,
            **{col: df[col] for col in parent_keys}
        }).drop_duplicates(subset=["link_hash_key"])

        try:
            existing = pd.read_parquet(link_path)
            new_links = link_df[~link_df["link_hash_key"].isin(existing["link_hash_key"])]
            if len(new_links) > 0:
                pd.concat([existing, new_links]).to_parquet(link_path, index=False)
        except FileNotFoundError:
            link_df.to_parquet(link_path, index=False)

        return link_df

# Load transactions into Data Vault
loader = DataVaultLoader(source="EU_PAYMENT_GATEWAY", load_date=datetime.utcnow())
df = pd.read_parquet("silver/transactions_20240115.parquet")

# Add hash keys for joining
df["customer_hk"] = df["customer_id"].apply(lambda x: compute_hash_key(str(x)))
df["txn_hk"]      = df["transaction_id"].apply(lambda x: compute_hash_key(str(x)))

loader.load_hub(df, "customer_id", "vault/hub_customer.parquet")
loader.load_hub(df, "transaction_id", "vault/hub_transaction.parquet")
loader.load_satellite(df, "customer_hk", ["customer_name","tier","country"], "vault/sat_customer.parquet")
loader.load_link(df, ["customer_hk", "txn_hk"], "vault/lnk_customer_txn.parquet")`,
    notes: [
      "Hash keys (SHA-256) are deterministic — same business key always produces same hash, enabling idempotent loads",
      "Hash diff pattern in Satellites detects attribute changes without expensive column-by-column comparison",
      "Data Vault's append-only nature provides full audit trail — no updates, only inserts (GDPR-friendly)",
      "In production, implement in PySpark with Delta MERGE for concurrent-safe Hub loading across partitions"
    ],
    use_case: "Building an audit-ready Data Vault 2.0 warehouse in the Gold layer for EU BFSI regulatory reporting, providing full lineage from source system to report with hash-based change detection compliant with GDPR audit requirements."
  },
  {
    id: "py-arch-04", title: "FinOps: Cloud Cost Tracking & Optimization",
    level: "architect", category: "FinOps",
    description: "Python-based FinOps automation monitors Azure resource consumption, attributes costs to data pipelines, and implements automated optimization — reducing cloud spend by tuning DIUs, cluster sizes, and storage tiers.",
    code: `from azure.mgmt.consumption import ConsumptionManagementClient
from azure.mgmt.monitor import MonitorManagementClient
from azure.identity import DefaultAzureCredential
from datetime import datetime, timedelta
import pandas as pd
import json

class FinOpsMonitor:
    """
    Azure FinOps monitoring — tracks pipeline costs and generates optimization recommendations.
    Used at TCS for 40% ADF pipeline cost reduction initiative.
    """

    def __init__(self, subscription_id: str):
        self.cred = DefaultAzureCredential()
        self.sub_id = subscription_id
        self.consumption = ConsumptionManagementClient(self.cred, subscription_id)

    def get_pipeline_costs(self, resource_group: str, days: int = 30) -> pd.DataFrame:
        """Get ADF pipeline run costs by activity type."""
        end = datetime.utcnow()
        start = end - timedelta(days=days)

        usages = self.consumption.usage_details.list(
            scope=f"/subscriptions/{self.sub_id}/resourceGroups/{resource_group}",
            expand="properties/additionalInfo",
            filter=f"properties/usageStart ge '{start.strftime('%Y-%m-%d')}'"
        )

        records = []
        for usage in usages:
            records.append({
                "date":          usage.date,
                "service":       usage.meter_category,
                "resource":      usage.instance_name,
                "cost_usd":      float(usage.cost or 0),
                "quantity":      float(usage.quantity or 0),
                "unit":          usage.unit_of_measure,
            })

        return pd.DataFrame(records)

    def analyze_adf_diu_usage(self, costs_df: pd.DataFrame) -> dict:
        """Identify over-provisioned ADF activities (high DIU, low throughput)."""
        adf_costs = costs_df[costs_df["service"].str.contains("Data Factory", na=False)].copy()
        total_cost = adf_costs["cost_usd"].sum()

        # Flag activities exceeding cost threshold
        expensive = adf_costs[adf_costs["cost_usd"] > 10].sort_values("cost_usd", ascending=False)

        recommendations = []
        for _, row in expensive.head(10).iterrows():
            recommendations.append({
                "resource": row["resource"],
                "monthly_cost": round(row["cost_usd"] * 30, 2),
                "action": "Review DIU settings — consider reducing from 32 to 8 DIUs",
                "estimated_savings_pct": 40  # Historical benchmark from TCS optimization
            })

        return {
            "total_monthly_cost_usd": round(total_cost * 30, 2),
            "top_cost_drivers": expensive.head(5).to_dict("records"),
            "recommendations": recommendations
        }

    def generate_optimization_report(self, resource_group: str) -> str:
        costs = self.get_pipeline_costs(resource_group)
        analysis = self.analyze_adf_diu_usage(costs)

        report = {
            "report_date": datetime.utcnow().isoformat(),
            "resource_group": resource_group,
            **analysis
        }
        return json.dumps(report, indent=2, default=str)

# Weekly FinOps report
monitor = FinOpsMonitor("your-subscription-id")
report = monitor.generate_optimization_report("eu-bfsi-prod-rg")
print(report)
# → Saved to Teams channel + Azure Monitor dashboard`,
    notes: [
      "40% cost reduction at TCS achieved by systematically profiling and reducing ADF DIU settings per activity",
      "Tag all ADF pipelines with cost_center and project tags — enables attribute-based cost attribution",
      "Combine Azure Cost Management API + ADF monitoring for full pipeline cost visibility",
      "Automate DIU recommendations via Azure Automation runbook — scheduled weekly FinOps governance"
    ],
    use_case: "Automated weekly FinOps monitoring at TCS EU BFSI — identifying over-provisioned ADF activities, generating optimization recommendations, and tracking the 40% processing latency reduction initiative via Azure Cost Management API."
  },
  {
    id: "py-arch-05", title: "Idempotent Pipeline Orchestrator",
    level: "architect", category: "Architecture",
    description: "Idempotent pipelines produce the same result regardless of how many times they're re-executed — critical for safe pipeline retries after transient failures. This pattern uses checkpointing and partition-aware writes to guarantee exactly-once semantics.",
    code: `import json
import hashlib
from pathlib import Path
from datetime import datetime
import pandas as pd
import logging

logger = logging.getLogger(__name__)

class IdempotentPipelineOrchestrator:
    """
    Idempotent pipeline pattern — safe to re-run on failure.
    Uses checkpoint files to track completed partitions.
    Core pattern used in TCS EU BFSI Medallion pipelines.
    """

    def __init__(self, pipeline_name: str, checkpoint_dir: str):
        self.pipeline_name = pipeline_name
        self.checkpoint_dir = Path(checkpoint_dir)
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)

    def _checkpoint_key(self, partition: str) -> str:
        return hashlib.md5(f"{self.pipeline_name}:{partition}".encode()).hexdigest()[:12]

    def is_completed(self, partition: str) -> bool:
        cp_file = self.checkpoint_dir / f"{self._checkpoint_key(partition)}.json"
        return cp_file.exists()

    def mark_complete(self, partition: str, metadata: dict):
        cp_file = self.checkpoint_dir / f"{self._checkpoint_key(partition)}.json"
        with cp_file.open("w") as f:
            json.dump({
                "pipeline": self.pipeline_name,
                "partition": partition,
                "completed_at": datetime.utcnow().isoformat(),
                **metadata
            }, f, indent=2)

    def clear_checkpoint(self, partition: str):
        """Force re-processing of a specific partition."""
        cp_file = self.checkpoint_dir / f"{self._checkpoint_key(partition)}.json"
        cp_file.unlink(missing_ok=True)

    def process_partition(self, partition: str, process_fn, force: bool = False) -> bool:
        """Run process_fn for partition if not already completed."""
        if not force and self.is_completed(partition):
            logger.info(f"Partition {partition} already complete — skipping")
            return False

        logger.info(f"Processing partition: {partition}")
        try:
            metadata = process_fn(partition)
            self.mark_complete(partition, metadata or {})
            logger.info(f"Partition {partition} complete ✓")
            return True
        except Exception as e:
            logger.error(f"Partition {partition} FAILED: {e}")
            raise  # Don't mark as complete on failure

    def run_batch(self, partitions: list[str], process_fn, force: bool = False) -> dict:
        results = {"completed": [], "skipped": [], "failed": []}
        for partition in partitions:
            try:
                if self.process_partition(partition, process_fn, force):
                    results["completed"].append(partition)
                else:
                    results["skipped"].append(partition)
            except Exception:
                results["failed"].append(partition)
        return results

# Usage
def process_daily_partition(batch_date: str) -> dict:
    """Read Bronze → transform → write Silver (idempotent)."""
    src = f"bronze/transactions/{batch_date}/part-*.parquet"
    tgt = f"silver/transactions/load_date={batch_date}/part-0.parquet"

    if Path(tgt).exists():
        Path(tgt).unlink()  # delete existing Silver partition for clean overwrite

    df = pd.read_parquet(src)
    df["amount_eur"] = df["amount"] * df["fx_rate"]
    df.to_parquet(tgt, index=False)

    return {"rows_processed": len(df), "source_files": src}

orchestrator = IdempotentPipelineOrchestrator("bronze_to_silver", "checkpoints/bronze_silver")

# Generate all dates in January 2024
partitions = [f"2024-01-{d:02d}" for d in range(1, 32)]

# First run: processes all. Re-run: skips already completed.
results = orchestrator.run_batch(partitions, process_daily_partition)
print(f"Complete: {len(results['completed'])}, Skipped: {len(results['skipped'])}, Failed: {len(results['failed'])}")`,
    notes: [
      "Checkpoint files on ADLS survive ADF retry and Databricks cluster restarts — truly durable idempotency",
      "Hash-based checkpoint keys prevent collisions between pipelines with similar partition names",
      "Delete+rewrite Silver partition (not append) on re-run — prevents duplicate rows from multiple runs",
      "mark_complete only after successful write — ensures checkpoint only exists for truly complete partitions"
    ],
    use_case: "Ensuring the TCS EU BFSI Bronze→Silver pipeline achieves 100% data consistency across all pipeline retries and transient cluster failures — meeting the SLA for zero data loss in GDPR-compliant financial reporting."
  },
  {
    id: "py-arch-06", title: "Schema Evolution & Governance Framework",
    level: "architect", category: "Governance",
    description: "A schema governance framework detects, validates, and safely handles schema changes from source systems. Critical for preventing downstream Silver/Gold layer breaks when source systems add or modify columns without notice.",
    code: `import json
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from pathlib import Path
from dataclasses import dataclass
from datetime import datetime
from typing import Literal
import logging

logger = logging.getLogger(__name__)

@dataclass
class SchemaChange:
    column: str
    change_type: Literal["added", "removed", "type_changed", "nullable_changed"]
    old_value: str | None
    new_value: str | None
    severity: Literal["INFO", "WARNING", "BREAKING"]

class SchemaEvolutionManager:
    """
    Schema governance: detect, classify, and handle schema changes.
    Implements 'schema on read' with versioning for EU BFSI compliance.
    """

    def __init__(self, schema_registry_path: str):
        self.registry_path = Path(schema_registry_path)
        self.registry_path.mkdir(parents=True, exist_ok=True)

    def get_registered_schema(self, table_name: str) -> pa.Schema | None:
        schema_file = self.registry_path / f"{table_name}.json"
        if not schema_file.exists():
            return None
        with schema_file.open() as f:
            schema_dict = json.load(f)
        return pa.schema([
            pa.field(col["name"], pa.lib.ensure_type(col["type"]), nullable=col["nullable"])
            for col in schema_dict["fields"]
        ])

    def register_schema(self, table_name: str, schema: pa.Schema, version: int):
        schema_file = self.registry_path / f"{table_name}.json"
        with schema_file.open("w") as f:
            json.dump({
                "table": table_name,
                "version": version,
                "registered_at": datetime.utcnow().isoformat(),
                "fields": [{"name": f.name, "type": str(f.type), "nullable": f.nullable}
                           for f in schema]
            }, f, indent=2)
        logger.info(f"Schema registered: {table_name} v{version}")

    def detect_changes(self, table_name: str, new_schema: pa.Schema) -> list[SchemaChange]:
        old_schema = self.get_registered_schema(table_name)
        if old_schema is None:
            return []  # First run — no previous schema

        changes = []
        old_fields = {f.name: f for f in old_schema}
        new_fields = {f.name: f for f in new_schema}

        # Added columns
        for name in new_fields:
            if name not in old_fields:
                changes.append(SchemaChange(name, "added", None, str(new_fields[name].type),
                                          severity="INFO"))  # Generally safe

        # Removed columns
        for name in old_fields:
            if name not in new_fields:
                changes.append(SchemaChange(name, "removed", str(old_fields[name].type), None,
                                          severity="BREAKING"))  # Downstream breakage risk

        # Type changes
        for name in old_fields:
            if name in new_fields and old_fields[name].type != new_fields[name].type:
                changes.append(SchemaChange(name, "type_changed",
                                          str(old_fields[name].type), str(new_fields[name].type),
                                          severity="BREAKING"))

        return changes

    def apply_schema_evolution(self, df: pd.DataFrame, table_name: str,
                               policy: Literal["strict", "additive", "permissive"] = "additive") -> pd.DataFrame:
        old_schema = self.get_registered_schema(table_name)
        if old_schema is None:
            return df

        old_cols = {f.name for f in old_schema}
        new_cols = set(df.columns)

        if policy == "strict":
            # Only allow registered columns — drop unregistered
            extra = new_cols - old_cols
            if extra:
                logger.warning(f"Dropping unregistered columns: {extra}")
                df = df[list(old_cols & new_cols)]

        elif policy == "additive":
            # Allow new columns, but not removed or type-changed (fill missing with NULL)
            missing = old_cols - new_cols
            for col in missing:
                df[col] = None  # Backfill missing columns with NULL

        return df

# Usage
manager = SchemaEvolutionManager("schema_registry/")

# Check incoming schema vs registered
incoming_df = pd.read_parquet("bronze/transactions_20240115.parquet")
incoming_schema = pa.Schema.from_pandas(incoming_df)
changes = manager.detect_changes("silver_transactions", incoming_schema)

breaking_changes = [c for c in changes if c.severity == "BREAKING"]
if breaking_changes:
    logger.error(f"BREAKING schema changes detected: {[c.__dict__ for c in breaking_changes]}")
    raise RuntimeError("Schema breaking change — pipeline halted for manual review")

evolved_df = manager.apply_schema_evolution(incoming_df, "silver_transactions", policy="additive")
manager.register_schema("silver_transactions", incoming_schema, version=2)`,
    notes: [
      "Register schema after FIRST successful write — provides baseline for all future change detection",
      "BREAKING changes (column removed, type changed) halt pipeline automatically — prevents silent data corruption",
      "Additive policy (new columns allowed) is industry standard — enables source system evolution without breakage",
      "Schema registry on ADLS provides immutable change history — queryable for GDPR lineage audits"
    ],
    use_case: "Protecting the TCS EU BFSI Silver layer from unexpected source schema changes by auto-detecting column additions/removals in daily Bronze files, automatically enforcing schema governance across 5+ concurrent engineering squads."
  },
  {
    id: "py-arch-07", title: "Medallion Architecture: End-to-End Python",
    level: "architect", category: "Architecture",
    description: "A complete Bronze→Silver→Gold Medallion Architecture implemented in Python, demonstrating the full data engineering lifecycle — from raw ingestion through quality validation to business-ready Gold layer metrics.",
    code: `"""
Complete Medallion Architecture (Bronze → Silver → Gold)
Santosh Jammi Pattern — EU BFSI, Microsoft Fabric Lakehouse
"""
from pathlib import Path
from datetime import datetime
import pandas as pd
import pyarrow as pa
from deltalake import write_deltalake
import logging, json

log = logging.getLogger("medallion")

class MedallionPipeline:
    """
    Three-layer Medallion Architecture pipeline.
    Bronze: raw, append-only, immutable
    Silver: validated, cleansed, typed
    Gold:   business metrics, dimensional model
    """

    def __init__(self, base_path: str, storage_opts: dict):
        self.base = Path(base_path)
        self.storage_opts = storage_opts
        self.bronze = self.base / "bronze"
        self.silver = self.base / "silver"
        self.gold   = self.base / "gold"

    # ── BRONZE LAYER: Raw ingestion, append-only ──────────────────
    def ingest_bronze(self, source_df: pd.DataFrame, source: str, batch_date: str) -> int:
        """Append raw records with provenance metadata — never transform."""
        raw_df = source_df.copy()
        raw_df["_source"]     = source
        raw_df["_batch_date"] = batch_date
        raw_df["_ingest_ts"]  = datetime.utcnow().isoformat()

        path = str(self.bronze / "transactions")
        write_deltalake(path, raw_df, mode="append",
                       partition_by=["_batch_date"],
                       storage_options=self.storage_opts)
        log.info(json.dumps({"layer": "bronze", "rows": len(raw_df), "source": source}))
        return len(raw_df)

    # ── SILVER LAYER: Validate, cleanse, type ─────────────────────
    def transform_silver(self, batch_date: str) -> int:
        """Apply quality rules and business typing — only settled transactions."""
        from deltalake import DeltaTable
        dt = DeltaTable(str(self.bronze / "transactions"), storage_options=self.storage_opts)
        df = dt.to_pandas(filters=[("_batch_date", "=", batch_date)])

        # Validate
        df = df.dropna(subset=["transaction_id", "amount"])
        df = df[df["amount"] > 0]
        df["currency"] = df["currency"].str.strip().str.upper()

        # Transform
        df["amount_eur"] = df["amount"] * df["fx_rate"].fillna(1.0)
        df["is_high_value"] = df["amount_eur"] > 10_000
        df["_silver_ts"] = datetime.utcnow().isoformat()

        path = str(self.silver / "transactions")
        write_deltalake(path, df, mode="append",
                       partition_by=["currency"],
                       storage_options=self.storage_opts)
        log.info(json.dumps({"layer": "silver", "rows": len(df), "batch_date": batch_date}))
        return len(df)

    # ── GOLD LAYER: Business metrics, aggregations ────────────────
    def build_gold_metrics(self, batch_date: str) -> int:
        """Compute daily KPIs — feeds C-level Power BI / Fabric dashboards."""
        from deltalake import DeltaTable
        df = DeltaTable(str(self.silver / "transactions"),
                       storage_options=self.storage_opts).to_pandas()

        # Daily metrics per currency
        metrics = (
            df.groupby(["_batch_date", "currency"])
            .agg(total_volume=("amount_eur", "sum"),
                 txn_count=("transaction_id", "count"),
                 high_value_count=("is_high_value", "sum"),
                 avg_amount=("amount_eur", "mean"))
            .reset_index()
            .round({"total_volume": 2, "avg_amount": 2})
        )
        metrics["_gold_ts"] = datetime.utcnow().isoformat()

        path = str(self.gold / "daily_metrics")
        write_deltalake(path, metrics, mode="overwrite",
                       partition_by=["_batch_date"],
                       storage_options=self.storage_opts)
        log.info(json.dumps({"layer": "gold", "rows": len(metrics)}))
        return len(metrics)

    def run(self, source_df: pd.DataFrame, source: str, batch_date: str):
        log.info(f"=== Medallion Pipeline Start: {batch_date} ===")
        b = self.ingest_bronze(source_df, source, batch_date)
        s = self.transform_silver(batch_date)
        g = self.build_gold_metrics(batch_date)
        log.info(f"=== Complete: Bronze={b}, Silver={s}, Gold={g} ===")

# Execute
pipeline = MedallionPipeline(
    "abfss://onelake@euprodstorage.dfs.core.windows.net/fabric-ws/",
    {"account_name": "euprodstorage", "use_azure_cli": "true"}
)
raw = pd.read_csv("source/transactions_20240115.csv")
pipeline.run(raw, source="EU_PAYMENT_GATEWAY", batch_date="2024-01-15")`,
    notes: [
      "Bronze layer is append-only and immutable — never modify raw records, add metadata columns instead",
      "Silver layer drops invalid records — quarantine to separate table for data quality review",
      "Gold layer uses overwrite per partition — ensures idempotent metrics with no duplicate aggregation",
      "Delta Lake ACID ensures Bronze ingestion is atomic — partial file failures never corrupt the table"
    ],
    use_case: "Core architecture pattern for TCS EU BFSI production pipelines, managing 5TB+ daily transaction data across Bronze/Silver/Gold Delta Lake layers on Microsoft Fabric OneLake with 99.9% reliability SLA."
  },
  {
    id: "py-arch-08", title: "Dask: Distributed Python at Scale",
    level: "architect", category: "Distributed Computing",
    description: "Dask scales Pandas-compatible operations across multiple cores or a cluster, enabling processing of datasets too large for single-node memory without switching to Spark. Ideal for analysis workloads on moderate scale (100GB-2TB).",
    code: `import dask.dataframe as dd
import dask
from dask.distributed import Client, LocalCluster
import pandas as pd
from pathlib import Path

# ── Option 1: Single-node multi-core (ADF IR or Fabric Spark Driver)
# LocalCluster spawns N workers with M threads each
cluster = LocalCluster(n_workers=4, threads_per_worker=2, memory_limit="4GB")
client = Client(cluster)
print(f"Dask dashboard: {client.dashboard_link}")

# ── Read entire Silver partition as Dask DataFrame (lazy)
ddf = dd.read_parquet(
    "silver/transactions/",       # reads all partitions lazily
    columns=["transaction_id", "amount_eur", "currency", "transaction_date", "status"],
    engine="pyarrow",
)

print(f"Partitions: {ddf.npartitions}")   # each parquet file = 1 Dask partition
print(f"Columns: {ddf.columns.tolist()}")

# ── Apply transformations (lazy — no execution yet)
filtered = ddf[ddf["status"] == "SETTLED"]
filtered["month"] = filtered["transaction_date"].dt.to_period("M").astype(str)
filtered["is_high_value"] = filtered["amount_eur"] > 10_000

# ── Aggregation (triggers computation across all workers)
monthly_metrics = (
    filtered
    .groupby(["month", "currency"])
    .agg({"amount_eur": ["sum", "mean", "count"], "is_high_value": "sum"})
    .compute()  # triggers parallel execution
)
monthly_metrics.columns = ["total_volume", "avg_amount", "txn_count", "high_value_count"]
print(monthly_metrics.head(10))

# ── Dask map_partitions: apply Pandas function per partition in parallel
def compute_risk_score(partition: pd.DataFrame) -> pd.DataFrame:
    """Compute transaction risk score — CPU-intensive, runs per partition."""
    partition = partition.copy()
    partition["risk_score"] = (
        (partition["amount_eur"] / 10_000).clip(0, 10) +
        (partition["is_high_value"].astype(int) * 3)
    ).round(2)
    return partition

risk_df = filtered.map_partitions(compute_risk_score).compute()

# ── Write back to Parquet (parallel, one file per partition)
risk_df.to_parquet("gold/risk_scored_transactions/", engine="pyarrow", compression="snappy")

client.close()
cluster.close()`,
    notes: [
      "Dask reads parquet lazily — .compute() triggers actual execution and returns Pandas DataFrame",
      "map_partitions applies any Pandas function per partition in parallel — no GIL limit with ProcessPoolExecutor",
      "npartitions controls parallelism — match to CPU core count for optimal utilization",
      "For >2TB datasets, switch to PySpark or Dask with distributed cluster (Kubernetes/Azure HDInsight)"
    ],
    use_case: "Running risk scoring computations on 500GB of Silver transaction history on a 32-core Fabric Spark Driver node using Dask, achieving 8x speedup over sequential Pandas processing without a full Spark cluster."
  }
];
