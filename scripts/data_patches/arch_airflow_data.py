# arch_airflow_data.py
# High quality architecture scenarios for Apache Airflow Architecture (arch-airflow-001 to 040)

def get_airflow_scenarios():
    items = []

    # 001 - 010 (EASY)
    scenarios_easy = [
        ("arch-airflow-001", "Basic DAG design for ETL", "How do you architect and implement a production ETL DAG in Apache Airflow with proper dependency chaining, retry policies, and error boundaries?",
"""### Phase 1: Conceptual Foundation & Core Architecture
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
    extract = PythonOperator(task_id='extract_orders', python_callable=lambda **c: print("Extracting: " + c['ds']))
    transform = PythonOperator(task_id='transform_orders', python_callable=lambda **c: print("Transforming cleaned batch"))
    load = PythonOperator(task_id='load_gold_orders', python_callable=lambda **c: print("Swapping Gold partitions"))
    end = EmptyOperator(task_id='end')

    start >> extract >> transform >> load >> end
```
3. **Execution Validation**: Check task completion states in the metadata database before releasing downstream locks.

### Phase 3: Production Hardening & Gotchas
- **Top-Level Code Latency**: Placing heavy SQL queries or API calls outside of task definitions causes the DagFileProcessor to time out during parse loops. *Remediation*: Restrict top-level DAG script code strictly to DAG definition declarations and operator instantiations.
- **Unbounded Catchup Backlogs**: Setting `catchup=True` on long-dormant DAGs spawns hundreds of simultaneous historical DagRuns, overwhelming worker pools. *Remediation*: Explicitly set `catchup=False` unless running a planned, controlled backfill via CLI.
- **Non-Idempotent Load Steps**: Executing simple INSERT statements causes duplicate records upon automated task retries. *Remediation*: Implement idempotent write patterns using partition overwrites or transactional SQL MERGE statements."""),

        ("arch-airflow-002", "SimpleHttpOperator usage", "How do you architect a reliable HTTP ingestion pipeline using Airflow's SimpleHttpOperator to interface with rate-limited REST APIs?",
"""### Phase 1: Conceptual Foundation & Core Architecture
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
- **Silent HTTP 200 Error Payloads**: Some GraphQL and REST APIs return HTTP 200 with an error object inside the JSON body. *Remediation*: Implement custom `response_check` callables to validate that `error` keys are absent."""),

        ("arch-airflow-003", "BashOperator for shell scripts", "How do you securely execute external CLI tools and shell scripts using Airflow's BashOperator in a containerized environment?",
"""### Phase 1: Conceptual Foundation & Core Architecture
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
- **Worker Ephemeral Disk Exhaustion**: Writing multi-gigabyte intermediate files to `/tmp` fills up worker container storage. *Remediation*: Mount dedicated shared network volumes or stream outputs directly to cloud object storage."""),

        ("arch-airflow-004", "PythonOperator for transformations", "How do you architect in-memory batch data transformations using PythonOperator while preventing worker memory leaks and process crashes?",
"""### Phase 1: Conceptual Foundation & Core Architecture
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
- **Heavy Compute Worker Starvation**: Running 3-hour CPU-intensive Python jobs on worker nodes blocks scheduler heartbeats and delays lightweight tasks. *Remediation*: Offload heavy compute to KubernetesPodOperator or external Spark clusters."""),

        ("arch-airflow-005", "FileSensor for landing zone", "How do you architect resilient landing zone arrival checks using FileSensor without exhausting Airflow worker pool slots?",
"""### Phase 1: Conceptual Foundation & Core Architecture
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
- **Infinite Polling Zombie Tasks**: Omitting the `timeout` parameter allows sensors to run indefinitely, skewing cluster concurrency. *Remediation*: Mandate explicit `timeout=timedelta(...)` on all sensor definitions."""),

        ("arch-airflow-006", "EmailOperator for alerts", "How do you architect automated pipeline alerting and incident escalation using Airflow's EmailOperator and failure callbacks?",
"""### Phase 1: Conceptual Foundation & Core Architecture
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
- **Callback Execution Timeouts**: Writing long synchronous alerting routines inside callbacks blocks scheduler threads. *Remediation*: Dispatch alert payloads asynchronously via lightweight webhooks to Slack or PagerDuty."""),

        ("arch-airflow-007", "BranchPythonOperator for conditional flows", "How do you architect dynamic pipeline branching in Airflow using BranchPythonOperator while properly configuring downstream trigger rules?",
"""### Phase 1: Conceptual Foundation & Core Architecture
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
- **Multi-Branching Ambiguity**: When branching into multiple parallel paths, returning an invalid list format causes execution deadlocks. *Remediation*: Explicitly return a list of task IDs (e.g., `['task_a', 'task_b']`) when triggering multiple paths."""),

        ("arch-airflow-008", "ShortCircuitOperator", "How do you architect pipeline short-circuiting in Airflow to cleanly skip downstream stages when input conditions or freshness tests evaluate to False?",
"""### Phase 1: Conceptual Foundation & Core Architecture
When a pipeline checks for incoming data and finds that no new records have been published, continuing to spin up downstream compute clusters wastes significant cloud budget. The `ShortCircuitOperator` evaluates a boolean condition: if the callable returns `True`, pipeline execution continues normally; if it returns `False`, all downstream tasks are automatically marked as `skipped` without raising a pipeline failure.

### Phase 2: Low-Level Mechanics & Implementation
1. **Callable Declaration**: Return a pure boolean (`True` to proceed, `False` to short-circuit).
2. **Implementation Snippet**:
```python
from airflow.operators.python import ShortCircuitOperator
from airflow.operators.empty import EmptyOperator

def check_new_records_exist(**ctx):
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
- **SLA False Positives**: Short-circuited pipelines do not mark terminal tasks as successful, potentially triggering false SLA miss notifications. *Remediation*: Configure SLA monitors to ignore DagRuns where gatekeeper tasks short-circuited."""),

        ("arch-airflow-009", "TaskFlow API basics", "How do you modernize legacy Airflow DAGs using the TaskFlow API (@task) for clean functional data pipelines?",
"""### Phase 1: Conceptual Foundation & Core Architecture
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

    data = extract()
    transformed = transform(data)
    load(transformed)

etl_dag = taskflow_etl_pipeline()
```
3. **Type Hinting**: Apply type annotations to clarify inter-task metadata contracts.

### Phase 3: Production Hardening & Gotchas
- **Implicit Large DataFrame Passing**: Passing large Pandas DataFrames as return values serializes massive objects into metadata database XCom tables. *Remediation*: Pass only file URIs (S3/GCS paths) and store data in object storage.
- **Mixing Classic Operators with @task**: Attempting to pass TaskFlow outputs directly to classic operators requires using `operator.set_upstream(task_output)`. *Remediation*: Pass TaskFlow XCom references explicitly or wrap classic operators in `@task.docker` / `@task.kubernetes`.
- **Top-Level Variable Scoping**: Defining global variables outside decorated functions can cause state leakages across scheduler parser threads. *Remediation*: Keep all state generation localized inside decorated function bodies."""),

        ("arch-airflow-010", "XCom for passing small datasets", "How do you architect inter-task communication in Airflow using XCom while strictly avoiding metadata database saturation?",
"""### Phase 1: Conceptual Foundation & Core Architecture
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
- **Stale Execution Date XCom Reads**: Pulling XCom without specifying the execution date can pull data from prior failed runs. *Remediation*: Use the TaskFlow API or ensure `include_prior_dates=False` on `xcom_pull` calls."""),
    ]

    for id_val, niche, q_text, ans in scenarios_easy:
        items.append({
            "id": id_val,
            "source": "Architecture Hub",
            "category": "Apache Airflow Architecture",
            "niche": niche,
            "difficulty": "EASY",
            "question": q_text,
            "answer": ans
        })

    # 011 - 020 (MEDIUM)
    scenarios_med = [
        ("arch-airflow-011", "Celery executor with Redis broker setup", "How do you architect and tune a production CeleryExecutor Airflow cluster with Redis broker and PostgreSQL result backend?",
"""### Phase 1: Conceptual Foundation & Core Architecture
CeleryExecutor distributes task execution horizontally across a dedicated fleet of worker nodes. The Airflow Scheduler queues tasks by publishing serialized task representations to a message broker (Redis or RabbitMQ). Celery workers continuously poll the broker queue, fork worker processes, execute task callables, and record terminal states in PostgreSQL. This architecture isolates task execution completely from the scheduler host and allows dedicated worker queue routing (e.g., GPU queues, heavy memory queues).

### Phase 2: Low-Level Mechanics & Implementation
1. **Configuration Tuning**: Tune broker URL, result backend, and worker concurrency parameters.
2. **Implementation Snippet**:
```ini
# airflow.cfg configuration for high-throughput CeleryExecutor
[core]
executor = CeleryExecutor
parallelism = 128
max_active_tasks_per_dag = 16

[celery]
broker_url = redis://:RedisAuthSecret@redis-cluster.internal:6379/0
result_backend = db+postgresql://airflow:secret@postgres-ha.internal:5432/airflow
worker_concurrency = 16
worker_autoscale = 16,4
task_acks_late = True
task_reject_on_worker_lost = True
```
3. **Queue Sizing**: Deploy Celery workers with dedicated queue listeners: `airflow celery worker -q default,heavy_compute`.

### Phase 3: Production Hardening & Gotchas
- **Redis In-Memory Eviction**: If Redis fills its memory quota, default eviction policies drop task messages silently without notifying the scheduler. *Remediation*: Configure Redis `maxmemory-policy noeviction` and enable AOF/RDB persistence.
- **Zombie Tasks on Worker Crashes**: If an EC2 worker node terminates unexpectedly, running tasks remain stuck in `RUNNING` in the metadata DB. *Remediation*: Set `task_acks_late=True` and configure scheduler zombie detection sweeps (`scheduler_zombie_task_threshold = 300`).
- **PostgreSQL Connection Exhaustion**: 20 Celery workers each running 16 concurrent processes open 320 direct connections to PostgreSQL, saturating limits. *Remediation*: Deploy PgBouncer in transaction pooling mode between workers and the database."""),

        ("arch-airflow-012", "KubernetesExecutor pod template design", "How do you architect custom Pod Templates in KubernetesExecutor to provide granular resource quotas and node affinity per task?",
"""### Phase 1: Conceptual Foundation & Core Architecture
KubernetesExecutor spawns an independent, ephemeral Kubernetes pod for every task instance. While powerful, tasks have divergent hardware requirements: lightweight API pollers need 0.1 CPU, while PySpark drivers or ML training tasks require 32GB RAM and GPU nodes. Rather than using a static cluster-wide pod specification, architects design modular Pod Templates. Tasks pass a custom `pod_template_file` or configure `executor_config={'pod_override': k8s.V1Pod(...)}` to target specific Kubernetes node pools, tolerations, and resource limits.

### Phase 2: Low-Level Mechanics & Implementation
1. **Pod Template Definition**: Author reusable YAML templates with memory requests, limits, and nodeSelectors.
2. **Implementation Snippet**:
```python
from airflow.operators.python import PythonOperator
from kubernetes.client import models as k8s

heavy_ml_task = PythonOperator(
    task_id='train_churn_model',
    python_callable=lambda: print("Executing distributed gradient boosting"),
    executor_config={
        "pod_override": k8s.V1Pod(
            spec=k8s.V1PodSpec(
                containers=[
                    k8s.V1Container(
                        name="base",
                        resources=k8s.V1ResourceRequirements(
                            requests={"memory": "16Gi", "cpu": "4"},
                            limits={"memory": "32Gi", "cpu": "8"}
                        ),
                    )
                ],
                node_selector={"node.kubernetes.io/instance-type": "m5.2xlarge"},
                tolerations=[k8s.V1Toleration(key="ml-workload", operator="Exists", effect="NoSchedule")]
            )
        )
    },
    dag=dag,
)
```
3. **Execution Validation**: Inspect pod lifecycle events via `kubectl get pods -l app=airflow`.

### Phase 3: Production Hardening & Gotchas
- **Kubernetes API Server Saturation**: Launching 500 pods per minute creates extreme etcd write contention on the Kubernetes API server. *Remediation*: Tune `kube_client_request_args` and enforce Airflow pool slot concurrency limits.
- **OOMKilled Silent Task Drops**: Tasks exceeding memory limits receive SIGKILL from the Linux kernel; Airflow marks them as failed without Python stack traces. *Remediation*: Monitor Kubernetes pod exit code 137 and configure alert annotations when OOMKilled events fire.
- **Image Pull Latency Bottlenecks**: Pulling 10GB Docker images on fresh nodes adds 3 minutes of latency to every task. *Remediation*: Pre-pull core images on node groups or implement image caching daemons (Spegel)."""),

        ("arch-airflow-013", "TaskGroup for complex pipelines", "How do you architect modular, collapsible task hierarchies using Airflow TaskGroups to replace deprecated SubDAGs?",
"""### Phase 1: Conceptual Foundation & Core Architecture
As enterprise data pipelines expand to hundreds of tasks, DAG visualization graphs become overwhelming unreadable webs. Legacy Airflow used SubDAGs to group tasks, but SubDAGs introduced severe architectural flaws: they executed as independent DAGs with separate schedulers, consuming worker slots and causing deadlocks. `TaskGroup` is purely a visual and UI organizational construct that groups related tasks into collapsible modules while executing them natively on the parent DAG scheduler.

### Phase 2: Low-Level Mechanics & Implementation
1. **Hierarchical Design**: Nest TaskGroups using context managers with standardized prefixes.
2. **Implementation Snippet**:
```python
from airflow.utils.task_group import TaskGroup
from airflow.operators.empty import EmptyOperator

with DAG('enterprise_lakehouse_pipeline', schedule='@daily', start_date=datetime(2026, 1, 1)) as dag:
    start = EmptyOperator(task_id='start')
    
    with TaskGroup(group_id='ingest_raw_sources') as ingest_group:
        ingest_crm = EmptyOperator(task_id='ingest_crm')
        ingest_erp = EmptyOperator(task_id='ingest_erp')
        ingest_web = EmptyOperator(task_id='ingest_web')
        [ingest_crm, ingest_erp, ingest_web]

    with TaskGroup(group_id='transform_silver_layer') as silver_group:
        clean_crm = EmptyOperator(task_id='clean_crm')
        clean_erp = EmptyOperator(task_id='clean_erp')
        [clean_crm, clean_erp]

    end = EmptyOperator(task_id='end')

    start >> ingest_group >> silver_group >> end
```
3. **Prefix Inspection**: Tasks inherit group namespacing: `ingest_raw_sources.ingest_crm`.

### Phase 3: Production Hardening & Gotchas
- **Task ID Collision on Reused Groups**: Instantiating custom TaskGroup classes multiple times without unique `group_id` prefixes causes task ID collision errors. *Remediation*: Always parameterize `group_id` when generating dynamic TaskGroups.
- **Hidden Upstream Failures**: In the UI Grid View, collapsed TaskGroups show a single status color; engineers can miss nested warnings. *Remediation*: Configure alerts to log fully qualified task names (`group.subgroup.task`).
- **Cross-Group Deadlocks**: Creating circular dependencies between tasks across different TaskGroups causes DAG parse failures. *Remediation*: Wire dependencies strictly at the TaskGroup level (`group_a >> group_b`)."""),

        ("arch-airflow-014", "Dynamic Task Mapping for parallel processing", "How do you architect scalable fan-out and fan-in pipelines using Airflow's Dynamic Task Mapping (.expand())?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Processing dynamic collections of assets (e.g., partitioning an unknown number of S3 files, or executing identical queries across 50 tenant databases) previously required anti-pattern dynamic DAG generation loops. Dynamic Task Mapping (Airflow 2.3+) allows a single task node to dynamically generate an arbitrary number of parallel task instances at runtime based on the array output of an upstream task, utilizing `.expand()` and `.partial()` semantics.

### Phase 2: Low-Level Mechanics & Implementation
1. **Dynamic Fan-out**: Upstream task returns a Python list; downstream task maps across it using `.expand()`.
2. **Implementation Snippet**:
```python
from airflow.decorators import dag, task
from datetime import datetime

@dag(schedule='@daily', start_date=datetime(2026, 1, 1), catchup=False)
def dynamic_ingestion_pipeline():

    @task
    def discover_landing_partitions() -> list:
        # Returns dynamic list of partition directory paths discovered at runtime
        return ['s3://lake/2026/09/part-1', 's3://lake/2026/09/part-2', 's3://lake/2026/09/part-3']

    @task
    def process_partition(partition_path: str) -> int:
        print(f"Transforming records in partition: {partition_path}")
        return 5000  # Return record count

    @task
    def summarize_ingestion(counts: list):
        print(f"Total records ingested across all mapped partitions: {sum(counts)}")

    partitions = discover_landing_partitions()
    mapped_counts = process_partition.expand(partition_path=partitions)
    summarize_ingestion(mapped_counts)

pipeline = dynamic_ingestion_pipeline()
```
3. **Execution Monitoring**: Verify mapped task instance indices (0, 1, 2...) in the Airflow UI Grid View.

### Phase 3: Production Hardening & Gotchas
- **Mapped Task Explosion**: Upstream task accidentally emitting 100,000 items creates 100,000 TaskInstances, locking the scheduler DB. *Remediation*: Set `max_map_length = 1024` in `airflow.cfg` to enforce an upper bound on dynamic fan-out.
- **Airflow Pool Slot Flooding**: 500 dynamically mapped tasks starting simultaneously overwhelm target database connection limits. *Remediation*: Assign mapped tasks to an Airflow Pool with a restricted slot limit.
- **Empty List Short-Circuiting**: If the upstream discovery task returns an empty list `[]`, downstream mapped tasks are skipped, which may break downstream `all_success` tasks. *Remediation*: Handle empty lists cleanly using conditional guards."""),

        ("arch-airflow-015", "Dataset-driven scheduling between DAGs", "How do you architect event-driven cross-DAG dependency pipelines using Airflow Datasets to replace ExternalTaskSensors?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Historically, coordinating dependencies between disparate DAGs relied on `ExternalTaskSensor` (which wastes worker slots polling the metadata DB) or `TriggerDagRunOperator` (which tightly couples DAG IDs). Airflow 2.4+ introduces `Dataset`-driven scheduling. Producer DAGs declare data assets updated by their tasks (`outlets=[Dataset('s3://lake/gold/orders')]`). Consumer DAGs trigger automatically when all prerequisite Datasets have received update events, establishing a decoupled, data-aware mesh.

### Phase 2: Low-Level Mechanics & Implementation
1. **Dataset Definition**: Define standardized URI identifiers representing analytical data assets.
2. **Implementation Snippet**:
```python
from airflow import DAG, Dataset
from airflow.operators.empty import EmptyOperator
from datetime import datetime

# Shared Dataset URI definition
orders_dataset = Dataset("s3://enterprise-lake/gold/orders")

# Producer DAG: Emits dataset event upon successful completion of leaf task
with DAG('producer_orders_etl', schedule='0 3 * * *', start_date=datetime(2026, 1, 1), catchup=False) as prod_dag:
    transform = EmptyOperator(task_id='transform_orders')
    publish = EmptyOperator(
        task_id='publish_orders_delta',
        outlets=[orders_dataset],  # Emits event upon task success
    )
    transform >> publish

# Consumer DAG: Automatically triggers when orders_dataset receives an update
with DAG('consumer_executive_reporting', schedule=[orders_dataset], start_date=datetime(2026, 1, 1), catchup=False) as cons_dag:
    generate_reports = EmptyOperator(task_id='refresh_powerbi_cache')
```
3. **Lineage Inspection**: View the global dataset dependency graph in the Airflow UI under Browse -> Datasets.

### Phase 3: Production Hardening & Gotchas
- **URI Case Sensitivity Mismatches**: Declaring `Dataset('s3://Lake/Orders')` and `Dataset('s3://lake/orders')` creates two separate assets, causing consumer DAGs to never trigger. *Remediation*: Enforce strict lowercase URI naming conventions in shared constant modules.
- **Partial Task Failures Emitting False Events**: If a task fails after emitting a dataset event, downstream DAGs consume corrupted data. *Remediation*: Ensure dataset outlets are assigned strictly to the terminal verification task of the producer DAG.
- **Multi-Dataset Stale Event Lags**: When a consumer DAG schedules on multiple Datasets `[ds_a, ds_b]`, if `ds_b` updates 12 hours after `ds_a`, the consumer runs with stale `ds_a` data. *Remediation*: Align producer pipeline execution schedules or audit dataset event timestamps in task pre-checks."""),

        ("arch-airflow-016", "Custom sensor with reschedule mode", "How do you architect a custom Airflow Sensor class inheriting from BaseSensorOperator that enforces reschedule mode and exponential backoff?",
"""### Phase 1: Conceptual Foundation & Core Architecture
When integrating with proprietary internal APIs, legacy databases, or bespoke message queues, standard provider sensors are insufficient. Custom sensors inherit from `BaseSensorOperator` and override the `poke(self, context)` method. To operate safely at enterprise scale, custom sensors must enforce `mode='reschedule'`, preventing long-polling tasks from exhausting worker pools, and implement exponential backoff on polling intervals.

### Phase 2: Low-Level Mechanics & Implementation
1. **Custom Sensor Inheritance**: Subclass `BaseSensorOperator` and return a boolean from `poke()`.
2. **Implementation Snippet**:
```python
from airflow.sensors.base import BaseSensorOperator
from airflow.hooks.base import BaseHook
import requests

class RestApiStatusSensor(BaseSensorOperator):
    template_fields = ('endpoint',)

    def __init__(self, endpoint: str, http_conn_id: str, expected_status: str = 'COMPLETED', **kwargs):
        super().__init__(**kwargs)
        self.endpoint = endpoint
        self.http_conn_id = http_conn_id
        self.expected_status = expected_status
        # Force reschedule mode for platform stability
        self.mode = 'reschedule'

    def poke(self, context) -> bool:
        conn = BaseHook.get_connection(self.http_conn_id)
        url = f"{conn.host}/{self.endpoint}"
        response = requests.get(url, headers={"Authorization": f"Bearer {conn.password}"})
        response.raise_for_status()
        current_status = response.json().get('status')
        self.log.info(f"Checking {url}: Current={current_status}, Target={self.expected_status}")
        return current_status == self.expected_status
```
3. **Usage**: Instantiate `RestApiStatusSensor(task_id='wait_job', endpoint='jobs/{{ ds }}', http_conn_id='etl_api', poke_interval=60)`.

### Phase 3: Production Hardening & Gotchas
- **Poke Method Raising Unhandled Exceptions**: If an external API returns HTTP 500, unhandled exceptions crash the sensor instead of retrying on the next poll. *Remediation*: Wrap HTTP calls in try/except blocks, logging warnings and returning `False` during transient errors.
- **Heavy Compute inside poke()**: Executing intensive data processing inside `poke()` blocks the worker during every check. *Remediation*: Restrict `poke()` strictly to lightweight status checks; perform heavy transformations in downstream operators.
- **Infinite Rescheduling Loops**: Omitting an explicit `timeout` allows sensors to poll forever when target external jobs silently abort. *Remediation*: Enforce mandatory `timeout` parameters in the `__init__` constructor."""),

        ("arch-airflow-017", "Pool management for DB connections", "How do you architect Airflow Pool concurrency management to protect production transactional databases from connection pool exhaustion?",
"""### Phase 1: Conceptual Foundation & Core Architecture
In enterprise data platforms, hundreds of concurrent Airflow tasks extract records from operational databases (e.g. production PostgreSQL, Oracle, SAP). Without concurrency controls, an Airflow DAG with 50 parallel branches can flood the source database with simultaneous connections, exhausting connection pools and causing operational outages for end-user applications. Airflow Pools provide centralized resource isolation by enforcing concurrency slot limits across arbitrary groups of tasks.

### Phase 2: Low-Level Mechanics & Implementation
1. **Pool Definition**: Create an Airflow Pool named `prod_postgres_pool` with a capacity of 5 slots.
2. **Implementation Snippet**:
```python
from airflow.operators.python import PythonOperator

def extract_crm_slice(slice_id: int):
    print(f"Extracting slice {slice_id} using dedicated pool slot")

extract_tasks = [
    PythonOperator(
        task_id=f'extract_slice_{i}',
        python_callable=extract_crm_slice,
        op_kwargs={'slice_id': i},
        pool='prod_postgres_pool',  # Restricts concurrent executions to pool capacity
        pool_slots=1,               # Number of slots occupied by this task
        priority_weight=(10 - i),   # Prioritize lower slice IDs first
        dag=dag,
    )
    for i in range(20)
]
```
3. **Slot Monitoring**: Track pool slot occupancy in the UI under Admin -> Pools.

### Phase 3: Production Hardening & Gotchas
- **Undefined Pool Name Typos**: Assigning a task to a non-existent pool causes the task to queue indefinitely without failing or alerting. *Remediation*: Deploy CI linters to validate that all pool strings in DAG files exist in the Airflow environment.
- **Deadlocks on Multi-Slot Tasks**: If two tasks each request 3 slots in a 4-slot pool, neither can run simultaneously, but misconfigured dependencies can deadlock. *Remediation*: Standardize on `pool_slots=1` for general ETL tasks.
- **Pool Starvation by Low-Priority Tasks**: Batch extraction tasks consume all pool slots, blocking critical high-priority intraday tasks. *Remediation*: Configure high `priority_weight` on critical tasks to preempt batch tasks in queue dispatch."""),

        ("arch-airflow-018", "Retry with exponential backoff", "How do you architect resilient retry policies with exponential backoff and jitter to mitigate external service throttling in Airflow?",
"""### Phase 1: Conceptual Foundation & Core Architecture
Transient network glitches, database deadlocks, and third-party API rate limits are inevitable in distributed systems. Rigid retry policies (e.g. retrying immediately every 10 seconds) worsen outages by creating thundering-herd spikes against already struggling external services. Configuring `retry_exponential_backoff=True` with `max_retry_delay` ensures that retries progressively back off (e.g., 1m -> 2m -> 4m -> 8m), allowing degraded downstream services time to recover.

### Phase 2: Low-Level Mechanics & Implementation
1. **Default Args Tuning**: Configure retry parameters across the DAG.
2. **Implementation Snippet**:
```python
from datetime import timedelta

default_args = {
    'retries': 5,
    'retry_delay': timedelta(seconds=30),       # Initial retry delay
    'retry_exponential_backoff': True,          # Doubles delay on each attempt
    'max_retry_delay': timedelta(minutes=20),    # Caps delay ceiling
}

with DAG('resilient_api_pipeline', default_args=default_args, schedule='@hourly', start_date=datetime(2026, 1, 1)) as dag:
    sync_api = PythonOperator(
        task_id='sync_external_gateway',
        python_callable=lambda: print("Calling rate-limited third-party gateway"),
    )
```
3. **Audit**: Review task instance attempt history in the Airflow UI Task Instance Details page.

### Phase 3: Production Hardening & Gotchas
- **Infinite Retry Cascades**: Setting 10 retries with exponential backoff can extend a single task run for 24 hours, delaying downstream dependencies silently. *Remediation*: Cap `execution_timeout` on the task so the overall task duration cannot breach SLAs.
- **Retrying Non-Transient Failures**: Retrying syntax errors, schema contract violations, or 401 Unauthorized errors wastes compute and generates false alerts. *Remediation*: Use custom exception handlers (`AirflowFailException`) to fail immediately on permanent errors.
- **Thundering Herd Synchronization**: Identical backoff timers across 50 concurrent failed tasks cause them to retry at the exact same second. *Remediation*: Modern Airflow adds internal jitter to exponential backoff calculations."""),

        ("arch-airflow-019", "Airflow + S3 pipeline pattern", "How do you architect an end-to-end lakehouse ingestion pipeline using S3KeySensor, S3ToRedshiftOperator, and S3Hook?",
"""### Phase 1: Conceptual Foundation & Core Architecture
AWS S3 is the foundational storage tier for modern data lakes. In enterprise ingestion patterns, Airflow orchestrates: 1) Sensing when external vendors finish uploading objects to S3; 2) Validating object size and checksums via S3Hook; 3) Loading records into data warehouses (Redshift/Snowflake) using bulk COPY commands; and 4) Archiving ingested files to cold storage prefixes to keep landing buckets lightweight.

### Phase 2: Low-Level Mechanics & Implementation
1. **IAM Credentials**: Configure `aws_default` connection utilizing IAM instance profiles or STS assume-role.
2. **Implementation Snippet**:
```python
from airflow.providers.amazon.aws.sensors.s3 import S3KeySensor
from airflow.providers.amazon.aws.transfers.s3_to_redshift import S3ToRedshiftOperator
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.decorators import task

with DAG('s3_lakehouse_ingest', schedule='@daily', start_date=datetime(2026, 1, 1), catchup=False) as dag:
    wait_for_s3_file = S3KeySensor(
        task_id='wait_for_s3_file',
        bucket_name='enterprise-landing-zone',
        bucket_key='incoming/transactions_{{ ds }}.parquet',
        aws_conn_id='aws_default',
        mode='reschedule',
        timeout=14400,
    )

    copy_to_redshift = S3ToRedshiftOperator(
        task_id='copy_to_redshift',
        schema='staging',
        table='stg_transactions',
        s3_bucket='enterprise-landing-zone',
        s3_key='incoming/transactions_{{ ds }}.parquet',
        copy_options=['FORMAT AS PARQUET'],
        aws_conn_id='aws_default',
        redshift_conn_id='redshift_default',
    )

    wait_for_s3_file >> copy_to_redshift
```
3. **Execution**: Verify S3 read access via VPC endpoints to avoid public internet egress charges.

### Phase 3: Production Hardening & Gotchas
- **Multi-Part Upload Incomplete Reads**: S3KeySensor detects the key while a multi-part upload is only 50% finished, causing truncated reads. *Remediation*: Configure `check_fn` to verify object size stability or mandate `.DONE` marker files.
- **Cross-Account S3 Access Denied**: Transferring files between different AWS accounts fails if KMS key decrypt permissions are missing. *Remediation*: Configure S3 bucket policies and grant `kms:Decrypt` to the Airflow IAM role.
- **S3 API Rate Throttling**: Hundreds of tasks executing S3 listings simultaneously trigger 503 Slow Down errors. *Remediation*: Partition S3 prefixes with high-cardinality prefixes (e.g. hash prefixes)."""),

        ("arch-airflow-020", "ExternalTaskSensor for cross-DAG dependencies", "How do you architect reliable cross-DAG synchronization using ExternalTaskSensor without causing pipeline deadlocks?",
"""### Phase 1: Conceptual Foundation & Core Architecture
In multi-team data architectures, upstream ingestion DAGs and downstream analytical reporting DAGs often run on separate schedules. `ExternalTaskSensor` pauses execution in the downstream DAG until a specific task or DAG run in an upstream DAG completes successfully for a matching logical execution date. Architects must configure execution delta functions or execution date fn mappings when the two DAGs run on differing schedules.

### Phase 2: Low-Level Mechanics & Implementation
1. **Delta Calculation**: Map schedules using `execution_delta` (e.g., downstream DAG runs 2 hours after upstream).
2. **Implementation Snippet**:
```python
from airflow.sensors.external_task import ExternalTaskSensor
from datetime import timedelta

wait_for_upstream_ingest = ExternalTaskSensor(
    task_id='wait_for_orders_ingestion',
    external_dag_id='upstream_orders_ingest',
    external_task_id='publish_gold_orders',
    execution_delta=timedelta(hours=2),  # Upstream runs at 02:00, this DAG runs at 04:00
    allowed_states=['success'],
    failed_states=['failed', 'upstream_failed'],
    mode='reschedule',
    timeout=7200,
    dag=dag,
)
```
3. **Status Check**: Verify matching `execution_date` entries in the `task_instance` metadata table.

### Phase 3: Production Hardening & Gotchas
- **Execution Date Mismatch Deadlocks**: If the upstream and downstream DAGs do not have perfectly aligned logical execution dates (or execution_delta), the sensor waits forever until timeout. *Remediation*: Use `execution_date_fn` to author dynamic date alignment or migrate to Airflow Datasets.
- **Upstream Task Renaming Breaks Sensor**: If the upstream team renames `publish_gold_orders` to `publish_orders_v2`, the downstream sensor fails silently. *Remediation*: Enforce DAG contract testing or establish DAG-level sensing (`external_task_id=None`).
- **Worker Slot Starvation**: Forgetting `mode='reschedule'` consumes worker execution slots during the 2-hour wait. *Remediation*: Mandate `mode='reschedule'` on all ExternalTaskSensors."""),
    ]

    for id_val, niche, q_text, ans in scenarios_med:
        items.append({
            "id": id_val,
            "source": "Architecture Hub",
            "category": "Apache Airflow Architecture",
            "niche": niche,
            "difficulty": "MEDIUM",
            "question": q_text,
            "answer": ans
        })

    # 021 - 030 (HARD) & 031 - 040 (ARCHITECT)
    # We will append the remaining 20 scenarios using a comprehensive data builder
    from arch_airflow_data_advanced import get_advanced_airflow_scenarios
    items.extend(get_advanced_airflow_scenarios())

    return items
