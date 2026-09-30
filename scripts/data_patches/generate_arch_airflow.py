# generate_arch_airflow.py
# Generates high-quality architectural solutions for arch-airflow-001 through arch-airflow-040

airflow_scenarios = {
    "arch-airflow-001": {
        "niche": "Basic DAG design for ETL",
        "difficulty": "EASY",
        "question": "How do you architect and implement a standard production ETL DAG in Apache Airflow with proper dependency chaining and error boundaries?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
A production ETL DAG in Airflow must strictly separate extraction, transformation, and load stages while maintaining idempotency and deterministic execution. Upstream tasks extract immutable source snapshots, intermediate tasks execute business transformations in isolated worker environments, and terminal load tasks atomically commit transformed records to target analytical tables. The DAG must define robust retry policies, task timeouts, and failure callbacks to isolate pipeline failures without cascading desynchronization.

### Phase 2: Low-Level Mechanics & Implementation
1. **DAG Declaration**: Configure default_args with retries, retry_delay, and execution timeouts.
2. **Implementation Snippet**:
```python
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.empty import EmptyOperator

default_args = {
    'owner': 'data_platform',
    'depends_on_past': False,
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
    'execution_timeout': timedelta(minutes=45),
}

with DAG(
    dag_id='etl_orders_daily_v1',
    default_args=default_args,
    schedule='0 2 * * *',
    start_date=datetime(2026, 1, 1),
    catchup=False,
    tags=['orders', 'core_etl'],
) as dag:
    start = EmptyOperator(task_id='start')
    
    extract_orders = PythonOperator(
        task_id='extract_orders_source',
        python_callable=lambda **ctx: print(f"Extracting for date: {ctx['ds']}"),
    )
    
    transform_orders = PythonOperator(
        task_id='transform_orders_stage',
        python_callable=lambda **ctx: print("Cleaning records and deduplicating customer keys"),
    )
    
    load_gold_marts = PythonOperator(
        task_id='load_gold_orders',
        python_callable=lambda **ctx: print("Atomically swapping Gold Delta partitions"),
    )
    
    end = EmptyOperator(task_id='end')

    start >> extract_orders >> transform_orders >> load_gold_marts >> end
```
3. **Execution Validation**: Check task completion states in the metadata database before releasing downstream locks.

### Phase 3: Production Hardening & Gotchas
- **Top-Level Code Latency**: Placing heavy SQL queries or API calls outside of task definitions causes the DagFileProcessor to time out during parse loops. *Remediation*: Restrict top-level DAG script code strictly to DAG definition declarations and operator instantiations.
- **Unbounded Catchup Backlogs**: Setting `catchup=True` on long-dormant DAGs spawns hundreds of simultaneous historical DagRuns, overwhelming worker pools. *Remediation*: Explicitly set `catchup=False` unless running a planned, controlled backfill via CLI.
- **Non-Idempotent Load Steps**: Executing simple INSERT statements causes duplicate records upon automated task retries. *Remediation*: Implement idempotent write patterns using partition overwrites or transactional SQL MERGE statements."""
    },
    "arch-airflow-002": {
        "niche": "SimpleHttpOperator usage",
        "difficulty": "EASY",
        "question": "How do you architect a reliable HTTP ingestion pipeline using Airflow's SimpleHttpOperator to interface with rate-limited REST APIs?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Integrating external REST APIs into data orchestration pipelines requires handling authentication handshakes, request pagination, rate limits, and network latency anomalies. The `SimpleHttpOperator` leverages Airflow's Connection vault to securely store API endpoints and bearer tokens. It executes HTTP requests, verifies response status codes, and applies response filter callables to extract payload JSON into XCom for downstream consumption.

### Phase 2: Low-Level Mechanics & Implementation
1. **Connection Setup**: Register `http_crm_api` connection with base URL and authorization headers in Airflow Connections.
2. **Implementation Snippet**:
```python
from airflow.providers.http.operators.http import SimpleHttpOperator
import json

fetch_daily_transactions = SimpleHttpOperator(
    task_id='fetch_daily_transactions',
    http_conn_id='http_crm_api',
    endpoint='v2/transactions',
    method='GET',
    data={"date": "{{ ds }}", "limit": 5000},
    headers={"Accept": "application/json", "Authorization": "Bearer {{ var.value.crm_api_token }}"},
    response_filter=lambda response: json.loads(response.text).get('data', []),
    log_response=True,
    dag=dag,
)
```
3. **Parameter Tuning**: Set connection socket timeouts and verify payload size remains within XCom limits.

### Phase 3: Production Hardening & Gotchas
- **Oversized XCom DB Bloat**: Pushing multi-megabyte API JSON payloads directly into metadata DB XCom tables crashes the webserver. *Remediation*: Stream large API payloads directly to S3/GCS using custom hooks and pass only the S3 URI via XCom.
- **HTTP 429 Rate Limiting**: Bursting API requests causes third-party endpoints to return 429 Too Many Requests. *Remediation*: Assign the task to an Airflow Pool with a single slot and configure exponential retry delays.
- **Silent HTTP 200 Error Payloads**: Some GraphQL and REST APIs return HTTP 200 with an error object inside the JSON body. *Remediation*: Implement custom `response_check` callables to validate that `error` keys are absent."""
    },
    "arch-airflow-003": {
        "niche": "BashOperator for shell scripts",
        "difficulty": "EASY",
        "question": "How do you securely execute external CLI tools and shell scripts using Airflow's BashOperator in a containerized environment?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
The `BashOperator` executes arbitrary shell commands and external compiled binaries (such as dbt-core CLI, custom C++ parsers, or AWS CLI scripts) as dedicated OS subprocesses on worker nodes. Enterprise architecture requires isolating execution environments, passing dynamic runtime variables via environment variables rather than string interpolation, capturing stdout/stderr streams to centralized logging, and trapping Unix exit signals.

### Phase 2: Low-Level Mechanics & Implementation
1. **Script Hardening**: Author self-contained shell scripts that enforce `set -euo pipefail` to catch unhandled errors.
2. **Implementation Snippet**:
```python
from airflow.operators.bash import BashOperator

run_data_sanitizer = BashOperator(
    task_id='run_data_sanitizer',
    bash_command='scripts/sanitize_telemetry.sh',
    env={
        'EXECUTION_DATE': '{{ ds }}',
        'TARGET_LAKE_BUCKET': '{{ var.value.landing_bucket }}',
        'BATCH_ID': '{{ run_id }}',
    },
    append_env=True,
    cwd='/opt/airflow/dags',
    dag=dag,
)
```
3. **Signal Trapping**: Ensure scripts handle SIGTERM signals gracefully to support worker restarts.

### Phase 3: Production Hardening & Gotchas
- **Jinja Command Injection**: Directly interpolating untrusted parameters into `bash_command` string templates allows shell injection vulnerabilities. *Remediation*: Pass dynamic values strictly through the `env` dictionary parameter.
- **Worker Zombie Subprocesses**: When a task instance is killed from the UI, child subprocesses spawned by the bash script can remain running as orphaned zombies. *Remediation*: Ensure bash scripts invoke processes via `exec` so Unix signals propagate directly to the child.
- **Worker Ephemeral Disk Exhaustion**: Writing multi-gigabyte intermediate files to `/tmp` fills up worker container storage. *Remediation*: Mount dedicated shared network volumes or stream outputs directly to cloud object storage."""
    },
    "arch-airflow-004": {
        "niche": "PythonOperator for transformations",
        "difficulty": "EASY",
        "question": "How do you architect in-memory batch data transformations using PythonOperator while preventing worker memory leaks and process crashes?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
`PythonOperator` executes Python callables directly within the Airflow worker execution environment. While convenient for orchestration glue code and moderate data formatting, executing heavy Pandas or Polars DataFrame transformations directly inside worker memory risks Out-Of-Memory (OOM) crashes that destabilize the entire worker node. Architecture patterns must enforce strict chunking, explicit garbage collection, and parameterization via execution context dictionaries.

### Phase 2: Low-Level Mechanics & Implementation
1. **Callable Design**: Accept `**context` to access execution metadata, logical dates, and XCom interfaces.
2. **Implementation Snippet**:
```python
from airflow.operators.python import PythonOperator
import pandas as pd
import gc

def clean_transaction_batch(**context):
    logical_date = context['ds']
    source_path = f"/mnt/lake/landing/{logical_date}/*.parquet"
    
    # Process in bounded chunks to manage memory footprint
    for chunk in pd.read_parquet(source_path, chunksize=50000):
        cleaned = chunk.dropna(subset=['customer_id'])
        cleaned.to_parquet(f"/mnt/lake/silver/{logical_date}/cleaned.parquet", index=False)
        del cleaned
    gc.collect()
    return f"Completed batch for {logical_date}"

process_transactions = PythonOperator(
    task_id='clean_transaction_batch',
    python_callable=clean_transaction_batch,
    dag=dag,
)
```
3. **Memory Limits**: Configure worker cgroups or container memory limits to contain rogue executions.

### Phase 3: Production Hardening & Gotchas
- **Celery Worker RAM Accumulation**: Python runtimes retain allocated heap memory across repeated task executions, gradually consuming host RAM. *Remediation*: Configure `--max-tasks-per-child=50` on Celery workers to periodically recycle processes.
- **Context Mutation Anti-pattern**: Modifying items directly inside the Airflow `context` dictionary can corrupt downstream task state. *Remediation*: Treat `context` strictly as read-only metadata.
- **Heavy Compute Worker Starvation**: Running 3-hour CPU-intensive Python jobs on worker nodes blocks scheduler heartbeats and delays lightweight tasks. *Remediation*: Offload heavy compute to KubernetesPodOperator or external Spark clusters."""
    },
    "arch-airflow-005": {
        "niche": "FileSensor for landing zone",
        "difficulty": "EASY",
        "question": "How do you architect resilient landing zone arrival checks using FileSensor without exhausting Airflow worker pool slots?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
In event-driven batch pipelines, downstream transformations must wait until external ingestion systems finish transferring files into landing storage. The `FileSensor` polls a file system or object store path until the target file pattern appears. The fundamental architecture decision is selecting sensor execution mode: `mode='poke'` holds a worker slot continuously while sleeping, whereas `mode='reschedule'` frees the worker slot between checks, preventing cluster-wide worker starvation.

### Phase 2: Low-Level Mechanics & Implementation
1. **Sensor Mode Selection**: Enforce `mode='reschedule'` and define finite timeouts.
2. **Implementation Snippet**:
```python
from airflow.sensors.filesystem import FileSensor
from datetime import timedelta

wait_for_daily_feed = FileSensor(
    task_id='wait_for_daily_feed',
    fs_conn_id='fs_landing_zone',
    filepath='feeds/orders_{{ ds_nodash }}.csv',
    poke_interval=120,          # Poll every 2 minutes
    timeout=60 * 60 * 6,         # Fail after 6 hours if file never arrives
    mode='reschedule',          # CRITICAL: Releases worker slot between polls
    soft_fail=False,            # Trigger failure alerts if file is missing
    dag=dag,
)
```
3. **Concurrency Protection**: Verify target directory permissions and configure dedicated sensor pools.

### Phase 3: Production Hardening & Gotchas
- **Worker Slot Starvation (Poke Mode)**: Running 20 FileSensors in default `poke` mode consumes 20 worker slots doing nothing but sleeping, halting all actual ETL tasks. *Remediation*: Always set `mode='reschedule'` for any sensor with a timeout over 3 minutes.
- **Partial File Read Race Conditions**: The sensor detects a file while an external SFTP process is still actively writing to it, causing downstream parse errors. *Remediation*: Check for an external `.DONE` marker file or verify file size stability over consecutive intervals.
- **Infinite Polling Zombie Tasks**: Omitting the `timeout` parameter allows sensors to run indefinitely, skewing cluster concurrency. *Remediation*: Mandate explicit `timeout=timedelta(...)` on all sensor definitions."""
    },
    "arch-airflow-006": {
        "niche": "EmailOperator for alerts",
        "difficulty": "EASY",
        "question": "How do you architect automated pipeline alerting and incident escalation using Airflow's EmailOperator and failure callbacks?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Operational reliability demands that pipeline failures and SLA breaches instantly notify on-call engineering teams with actionable diagnostic metadata. Rather than inserting static `EmailOperator` tasks at the end of every DAG branch, enterprise architecture leverages `on_failure_callback` hooks configured in `default_args`. This guarantees that if any task fails, Airflow automatically constructs an alert payload containing task IDs, error logs, and direct UI links.

### Phase 2: Low-Level Mechanics & Implementation
1. **Callback Configuration**: Author an alerting function utilizing Airflow's execution context.
2. **Implementation Snippet**:
```python
from airflow.operators.email import EmailOperator

def notify_on_failure(context):
    task_id = context['task_instance'].task_id
    dag_id = context['task_instance'].dag_id
    log_url = context['task_instance'].log_url
    error_msg = str(context.get('exception'))
    
    alert = EmailOperator(
        task_id='send_failure_email',
        to='data-incidents@enterprise.com',
        subject=f"[CRITICAL] Pipeline Failure: {dag_id}.{task_id}",
        html_content=f\"\"\"
        <h3>Airflow Task Failed</h3>
        <p><b>DAG:</b> {dag_id}</p>
        <p><b>Task:</b> {task_id}</p>
        <p><b>Error:</b> {error_msg}</p>
        <p><a href="{log_url}">View Airflow Task Logs</a></p>
        \"\"\",
    )
    alert.execute(context=context)
```
3. **Attachment**: Bind `default_args={'on_failure_callback': notify_on_failure}` across production DAGs.

### Phase 3: Production Hardening & Gotchas
- **Alert Storm Floods**: When an upstream task failure cascades through 50 downstream tasks, naive alerting sends 50 identical emails in 10 seconds. *Remediation*: Implement alert deduplication or attach callbacks strictly to the root DAG level.
- **SMTP Credential Exposing**: Hardcoding SMTP server passwords in DAG Python scripts compromises infrastructure credentials. *Remediation*: Configure SMTP parameters securely in `airflow.cfg` or inject credentials via environment variables.
- **Callback Execution Timeouts**: Writing long synchronous alerting routines inside callbacks blocks scheduler threads. *Remediation*: Dispatch alert payloads asynchronously via lightweight webhooks to Slack or PagerDuty."""
    },
    "arch-airflow-007": {
        "niche": "BranchPythonOperator for conditional flows",
        "difficulty": "EASY",
        "question": "How do you architect dynamic pipeline branching in Airflow using BranchPythonOperator while properly configuring downstream trigger rules?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Complex ETL pipelines frequently require conditional execution paths: for example, executing full historical refreshes on Sundays while running lightweight incremental deltas on weekdays. The `BranchPythonOperator` evaluates a Python callable and returns the `task_id` of the downstream task branch to pursue. Crucially, tasks on unchosen branches transition to the `skipped` state. Any downstream converging task that aggregates outputs must use `trigger_rule='none_failed_min_one_success'` to avoid being skipped.

### Phase 2: Low-Level Mechanics & Implementation
1. **Branch Evaluation**: Return target `task_id` based on execution context conditions.
2. **Implementation Snippet**:
```python
from airflow.operators.python import BranchPythonOperator
from airflow.operators.empty import EmptyOperator

def evaluate_processing_tier(**ctx):
    day_of_week = ctx['logical_date'].weekday()
    if day_of_week == 6:  # Sunday
        return 'run_full_rebuild'
    return 'run_incremental_delta'

branch_task = BranchPythonOperator(
    task_id='evaluate_tier_branch',
    python_callable=evaluate_processing_tier,
    dag=dag,
)

full_rebuild = EmptyOperator(task_id='run_full_rebuild', dag=dag)
incremental_delta = EmptyOperator(task_id='run_incremental_delta', dag=dag)

# Downstream convergence task MUST use none_failed_min_one_success
join_task = EmptyOperator(
    task_id='converge_paths',
    trigger_rule='none_failed_min_one_success',
    dag=dag,
)

branch_task >> [full_rebuild, incremental_delta] >> join_task
```
3. **State Validation**: Verify that unchosen paths mark as `skipped` in the Airflow Grid View.

### Phase 3: Production Hardening & Gotchas
- **Downstream Skip Cascades**: Using default `trigger_rule='all_success'` on the convergence task causes it to skip because the unchosen branch was skipped. *Remediation*: Always set `trigger_rule='none_failed_min_one_success'` on convergence tasks.
- **Returning Invalid Task IDs**: If the callable returns a string that does not match an existing downstream task ID, the scheduler errors. *Remediation*: Use unit tests to assert that all callable return values exist in the DAG's task list.
- **Multi-Branching Ambiguity**: When branching into multiple parallel paths, returning an invalid list format causes execution deadlocks. *Remediation*: Explicitly return a list of task IDs (e.g., `['task_a', 'task_b']`) when triggering multiple paths."""
    },
    "arch-airflow-008": {
        "niche": "ShortCircuitOperator",
        "difficulty": "EASY",
        "question": "How do you architect pipeline short-circuiting in Airflow to cleanly skip downstream stages when input conditions or freshness tests evaluate to False?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
When a pipeline checks for incoming data and finds that no new records have been published, continuing to spin up downstream compute clusters wastes significant cloud budget. The `ShortCircuitOperator` evaluates a boolean condition: if the callable returns `True`, pipeline execution continues normally; if it returns `False`, all downstream tasks are automatically marked as `skipped` without raising a pipeline failure.

### Phase 2: Low-Level Mechanics & Implementation
1. **Callable Declaration**: Return a pure boolean (`True` to proceed, `False` to short-circuit).
2. **Implementation Snippet**:
```python
from airflow.operators.python import ShortCircuitOperator
from airflow.operators.empty import EmptyOperator

def check_new_records_exist(**ctx):
    # Query source metadata to check for pending delta records
    record_count = 0  # e.g. check_source_landing()
    return record_count > 0

gatekeeper = ShortCircuitOperator(
    task_id='verify_records_pending',
    python_callable=check_new_records_exist,
    ignore_downstream_trigger_rules=True,
    dag=dag,
)

process_data = EmptyOperator(task_id='expensive_gpu_transform', dag=dag)
load_warehouse = EmptyOperator(task_id='publish_to_marts', dag=dag)

gatekeeper >> process_data >> load_warehouse
```
3. **Downstream Isolation**: Ensure terminal reporting tasks handle skipped inputs gracefully.

### Phase 3: Production Hardening & Gotchas
- **Trigger Rule Override Failures**: If downstream tasks have `trigger_rule='all_done'`, they will still execute even if short-circuited. *Remediation*: Set `ignore_downstream_trigger_rules=True` on the ShortCircuitOperator.
- **Masking True Ingestion Failures**: Returning `False` during network timeouts causes pipelines to skip silently instead of alerting on failure. *Remediation*: Raise explicit exceptions on connection errors so tasks fail rather than returning False.
- **SLA False Positives**: Short-circuited pipelines do not mark terminal tasks as successful, potentially triggering false SLA miss notifications. *Remediation*: Configure SLA monitors to ignore DagRuns where gatekeeper tasks short-circuited."""
    },
    "arch-airflow-009": {
        "niche": "TaskFlow API basics",
        "difficulty": "EASY",
        "question": "How do you modernize legacy Airflow DAGs using the TaskFlow API (@task) for clean functional data pipelines?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
The TaskFlow API (introduced in Airflow 2.0) transforms DAG authoring from verbose, boilerplate-heavy operator instantiations into clean, idiomatic Python decorated functions. By applying the `@task` decorator, Python functions automatically become Airflow tasks. The TaskFlow engine handles XCom serialization and deserialization implicitly through functional return values and function arguments, eliminating manual `xcom_push` and `xcom_pull` calls.

### Phase 2: Low-Level Mechanics & Implementation
1. **Functional Modeling**: Decorate Python functions with `@task` and pass outputs directly as inputs.
2. **Implementation Snippet**:
```python
from airflow.decorators import dag, task
from datetime import datetime

@dag(
    schedule='@daily',
    start_date=datetime(2026, 1, 1),
    catchup=False,
    tags=['taskflow', 'modern'],
)
def taskflow_etl_pipeline():
    
    @task
    def extract() -> dict:
        return {"batch_id": "b-9821", "record_count": 14200}
    
    @task
    def transform(raw_metadata: dict) -> dict:
        batch_id = raw_metadata['batch_id']
        return {"batch_id": batch_id, "status": "CLEANED", "score": 99.4}
    
    @task
    def load(transformed_data: dict):
        print(f"Loaded batch {transformed_data['batch_id']} with score {transformed_data['score']}")

    # Clean functional dependency chaining with implicit XCom passing
    data = extract()
    transformed = transform(data)
    load(transformed)

etl_dag = taskflow_etl_pipeline()
```
3. **Type Hinting**: Apply type annotations to clarify inter-task metadata contracts.

### Phase 3: Production Hardening & Gotchas
- **Implicit Large DataFrame Passing**: Passing large Pandas DataFrames as return values serializes massive objects into metadata database XCom tables. *Remediation*: Pass only file URIs (S3/GCS paths) and store data in object storage.
- **Mixing Classic Operators with @task**: Attempting to pass TaskFlow outputs directly to classic operators requires using `operator.set_upstream(task_output)`. *Remediation*: Pass TaskFlow XCom references explicitly or wrap classic operators in `@task.docker` / `@task.kubernetes`.
- **Top-Level Variable Scoping**: Defining global variables outside decorated functions can cause state leakages across scheduler parser threads. *Remediation*: Keep all state generation localized inside decorated function bodies."""
    },
    "arch-airflow-010": {
        "niche": "XCom for passing small datasets",
        "difficulty": "EASY",
        "question": "How do you architect inter-task communication in Airflow using XCom while strictly avoiding metadata database saturation?",
        "answer": """### Phase 1: Conceptual Foundation & Core Architecture
Airflow tasks execute in separate OS subprocesses or isolated container pods, preventing shared in-memory variables. XCom (Cross-Communication) solves this by serializing small metadata (file paths, record counters, partition dates) into the metadata database. The architectural principle for production XCom usage is: *pass metadata, never data*. Large payloads must be shunted to cloud object storage, using XCom strictly as a pointer store.

### Phase 2: Low-Level Mechanics & Implementation
1. **Explicit Key-Value Passing**: Push metadata keys from upstream tasks and pull in downstream tasks.
2. **Implementation Snippet**:
```python
from airflow.decorators import task

@task
def export_partition_to_s3(**ctx) -> str:
    partition_date = ctx['ds']
    s3_path = f"s3://enterprise-lake/raw/orders/{partition_date}/data.parquet"
    # Execute extraction and upload to S3...
    return s3_path  # Implicitly pushed to XCom 'return_value'

@task
def trigger_snowflake_copy(s3_uri: str):
    sql = f"COPY INTO raw_orders FROM '{s3_uri}' FILE_FORMAT = (TYPE = PARQUET);"
    print(f"Executing: {sql}")

s3_file = export_partition_to_s3()
trigger_snowflake_copy(s3_file)
```
3. **Database Health**: Audit `xcom` table size in PostgreSQL and schedule automated cleanup jobs.

### Phase 3: Production Hardening & Gotchas
- **Database Bloat from Large Objects**: Storing large JSON arrays or serialized models in XCom rapidly exhausts database storage and degrades scheduler performance. *Remediation*: Configure custom XCom backends (`s3://` or `gcs://`) to redirect large payloads to object storage.
- **XCom Size Limitations by RDBMS**: PostgreSQL enforces a 1GB limit per row, MySQL enforces 64KB for TEXT, and SQLite caps at 2GB. *Remediation*: Enforce strict 48KB maximum thresholds for any payload stored in the default database XCom.
- **Stale Execution Date XCom Reads**: Pulling XCom without specifying the execution date can pull data from prior failed runs. *Remediation*: Use the TaskFlow API or ensure `include_prior_dates=False` on `xcom_pull` calls."""
    }
}

print(f"Loaded {len(airflow_scenarios)} Airflow scenarios batch 1.")
