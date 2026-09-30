# fix_questions_dag.py
# Bespoke, expert answers for the 20 DAG questions that previously had template boilerplate.

def get_dag_fixes():
    return {
        "dag-easy-5": {
            "question": "How would you design logging for a DAG where tasks execute across different worker nodes?",
            "answer": """In distributed orchestration engines (e.g., Airflow with CeleryExecutor or KubernetesExecutor), tasks execute on ephemeral, disparate worker nodes. Designing centralized remote logging is critical:

1. **Remote Storage Sinks**: Configure workers to write task logs locally during execution and automatically flush them to centralized object storage (Amazon S3, Azure Blob Storage, or Google Cloud Storage) upon task completion:
```ini
# airflow.cfg logging configuration
[logging]
remote_logging = True
remote_base_log_folder = s3://enterprise-airflow-logs/prod/
remote_log_conn_id = aws_default
encrypt_s3_logs = True
```
2. **Real-Time Log Streaming**: For active running tasks before completion, use a sidecar daemon or fluentd/logstash agent to stream stdout/stderr into centralized log aggregators (Datadog, CloudWatch, or Elasticsearch/OpenSearch).
3. **Structured JSON Logging**: Standardize logs to emit JSON payloads containing `dag_id`, `task_id`, `execution_date`, `try_number`, and trace IDs, allowing engineers to query correlated logs across upstream and downstream tasks effortlessly.
4. **Security & Redaction**: Apply regex filters at the log-handler level to mask API keys, database connection strings, and sensitive tokens before writing to remote disks."""
        },

        "dag-easy-7": {
            "question": "How do you structure a DAG to handle daily incremental data loads?",
            "answer": """Handling daily incremental data loads in a DAG requires deterministic temporal boundaries and idempotent execution patterns:

1. **Execution Date Boundaries**: Never rely on `datetime.now()` inside task queries. Use the orchestrator's built-in execution context (`data_interval_start` and `data_interval_end` in Airflow):
```python
from airflow.decorators import dag, task
import pendulum

@dag(schedule="@daily", start_date=pendulum.datetime(2024, 1, 1), catchup=True)
def daily_incremental_sales_pipeline():

    @task
    def extract_incremental(start_ts: str, end_ts: str):
        query = f\"\"\"
            SELECT * FROM raw_sales 
            WHERE updated_at >= '{start_ts}' AND updated_at < '{end_ts}'
        \"\"\"
        # Execute query and dump to stage
        return f"Extracted records for {start_ts} to {end_ts}"

    extract_incremental(
        start_ts="{{ data_interval_start.isoformat() }}",
        end_ts="{{ data_interval_end.isoformat() }}"
    )

dag_obj = daily_incremental_sales_pipeline()
```
2. **Idempotent Merge / Overwrite**: Write incremental datasets into target tables using atomic partition overwrites (`INSERT OVERWRITE ... PARTITION (dt = '{{ ds }}')`) or Delta/Iceberg `MERGE INTO` operations with primary key matching.
3. **Backfill Resilience**: Because temporal intervals are parameterized, engineers can safely execute historical backfills concurrently without corrupting existing partitions."""
        },

        "dag-easy-8": {
            "question": "What is the performance impact of having too many tasks versus too few tasks in a single DAG?",
            "answer": """Balancing task granularity in a DAG is a fundamental architectural trade-off:

### Having Too Many Micro-Tasks (Over-Granular):
- **Scheduler Overhead**: Every task instance incurs state transitions (`scheduled` -> `queued` -> `running` -> `success`), metadata database writes, and queue serialization overhead (1-5 seconds per task). A DAG with 2,000 micro-tasks spends more time scheduling than doing actual work.
- **Worker Process Spawning**: If using containerized execution (K8s), spinning up 500 pods for 2-second bash scripts creates severe Docker/kubelet thrashing.
- **Database Bloat**: Generates millions of task instance rows in the orchestrator metadata database.

### Having Too Few Monolithic Tasks (Under-Granular):
- **Zero Fault Recovery**: If a 4-hour task fails at minute 230, the entire script must restart from minute zero.
- **Loss of Parallelism**: Disparate transformations that could run concurrently on separate worker nodes are forced into single-threaded sequential execution.
- **Opaque Observability**: When a monolithic script fails, monitoring dashboards cannot pinpoint the exact sub-step that broke without deep log spelunking.

### Golden Rule**: Each task should represent an atomic, idempotent unit of work with a runtime between 2 minutes and 45 minutes, with failure blast-radius isolated to that specific logical entity."""
        },

        "dag-easy-9": {
            "question": "How do you design task parameters to make a DAG dynamically executable for different dates?",
            "answer": """Designing a DAG for dynamic temporal execution requires decoupling tasks from wall-clock time and parameterizing execution dates:

1. **Jinja Macro Templating**: Inject the engine's logical dates (`{{ ds }}`, `{{ data_interval_start }}`, `{{ data_interval_end }}`) into SQL queries, S3 URI paths, and bash scripts:
```python
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator

extract_task = SQLExecuteQueryOperator(
    task_id="extract_daily_data",
    conn_id="postgres_source",
    sql="SELECT * FROM orders WHERE order_date = '{{ ds }}';"
)
```
2. **Runtime Configuration Parameters (`dag_run.conf`)**: Allow manual and programmatic API triggers to pass custom date ranges:
```python
@task
def process_custom_range(**context):
    conf = context["dag_run"].conf or {}
    start_date = conf.get("override_start", context["ds"])
    end_date = conf.get("override_end", context["ds"])
    # Run logic for custom interval
```
3. **Catchup and Backfilling**: Enable `catchup=True` on scheduled DAGs so the orchestrator automatically iterates through unexecuted historical intervals sequentially or in parallel up to `max_active_runs`."""
        },

        "dag-medium-12": {
            "question": "Architect a cross-DAG dependency system where DAG B must wait for specific tasks in DAG A to complete?",
            "answer": """In enterprise workflows, upstream ingestion pipelines (DAG A) must trigger or unblock downstream dimensional transformations (DAG B) across separate workflow boundaries.

### Architectural Approaches:
1. **`ExternalTaskSensor` (Polling Approach)**:
   - DAG B polls the orchestrator metadata database to check if a specific `task_id` in DAG A has reached `SUCCESS` for the corresponding logical execution interval.
   - **Crucial Setting**: Set `mode="reschedule"` so the sensor releases worker slots between evaluation intervals (e.g., `poke_interval=60`).
```python
from airflow.sensors.external_task import ExternalTaskSensor
from datetime import timedelta

wait_for_upstream = ExternalTaskSensor(
    task_id="wait_for_ingestion",
    external_dag_id="dag_raw_ingestion",
    external_task_id="finalize_bronze_table",
    execution_delta=timedelta(hours=1), # If DAG B runs 1 hour after DAG A
    mode="reschedule",
    timeout=7200
)
```
2. **Event-Driven Datasets (Airflow 2.4+ / Modern Standard)**:
   - DAG A produces to an explicit dataset URI (`Dataset("s3://data-lake/gold/orders")`).
   - DAG B defines its schedule directly on that dataset: `schedule=[Dataset("s3://data-lake/gold/orders")]`.
   - Eliminates polling loops and timing mismatches; DAG B triggers immediately upon dataset release.
3. **`TriggerDagRunOperator`**: DAG A explicitly triggers DAG B via API at the conclusion of its critical path."""
        },

        "dag-medium-13": {
            "question": "How do you optimize the parallel execution of 50 independent tasks to avoid overwhelming downstream database connections?",
            "answer": """Executing 50+ concurrent tasks that hit the same downstream database or REST API can trigger connection pool exhaustion, database lock contention, and HTTP 429 rate-limiting.

### Optimization & Throttling Strategies:
1. **Orchestrator Task Pools (Airflow Pools)**:
   - Define a named pool with limited slots (e.g., `postgres_write_pool` with `slots = 5`).
   - Assign all 50 tasks to this pool (`pool='postgres_write_pool'`). The scheduler runs at most 5 tasks concurrently, queueing the rest until slots free up.
```python
from airflow.decorators import task

@task(pool="postgres_write_pool", pool_slots=1)
def load_tenant_data(tenant_id: str):
    # Connect and load; guaranteed max 5 concurrent executions
    pass
```
2. **DAG-Level Concurrency Caps**:
   - `max_active_tasks`: Caps concurrent running task instances across the entire DAG.
   - `max_active_runs`: Prevents multiple scheduled DAG runs from multiplying concurrency.
3. **Database Connection Pooling (PgBouncer)**:
   - Route worker connections through PgBouncer in transaction pooling mode to multiplex dozens of worker threads over a fixed backend connection count.
4. **Dynamic Batching**:
   - Group the 50 independent jobs into 5 chunked batches (e.g., 10 tenants per task) to reduce process instantiation overhead and database handshakes."""
        },

        "dag-medium-14": {
            "question": "Design a state management system for a DAG that processes long-running machine learning training jobs?",
            "answer": """Long-running ML training jobs (spanning hours or days) cannot hold active worker threads or container slots open inside the orchestrator without wasting compute and risking task failure on worker restarts.

### Architectural Solution: Asynchronous Deferrable State Pattern
1. **Decoupled Compute Dispatch**:
   - The DAG task issues an asynchronous start command to an external training cluster (Databricks, AWS SageMaker, or Kubernetes Ray Cluster) and returns a unique `training_job_id`.
2. **Deferrable Operators & Triggers (Asyncio)**:
   - Instead of blocking a worker slot with a polling loop, the task yields a **Trigger** (`TriggerEvent`) and suspends itself.
   - The Airflow **Triggerer** daemon manages thousands of deferred jobs asynchronously in a single Python `asyncio` event loop.
3. **State Persistence**:
   - External ML metrics (loss, epoch progress, model artifacts) are logged directly to an external experiment tracker (MLflow or Weights & Biases), not to orchestrator XCom.
4. **Resumption & Evaluation**:
   - Once the trigger senses completion or error from the ML API, the task wakes up on an available worker, pulls the final model S3 URI, and passes it downstream to model evaluation and deployment gates."""
        },

        "dag-medium-15": {
            "question": "How would you handle partial failures in a massively parallel DAG without having to restart the entire graph?",
            "answer": """In large-scale DAGs with hundreds of parallel tasks, a transient failure in a handful of tasks should not invalidate the entire workflow.

### Architectural Strategy:
1. **Dynamic Task Retries with Exponential Jitter**:
   - Configure tasks with automated retries and backoff to handle transient network blips automatically:
     `retries=3, retry_delay=timedelta(minutes=2), retry_exponential_backoff=True`
2. **Selective Downstream Execution with Trigger Rules**:
   - Configure reporting or cleanup tasks downstream of the parallel fan-out with `trigger_rule=TriggerRule.ALL_DONE`. This ensures audit and alerting tasks run regardless of whether individual upstream tasks succeeded or failed.
3. **State Clearing / Partial Re-runs**:
   - When 5 out of 100 mapped tasks fail due to corrupt source files, use the orchestrator API or UI to **Clear** only the failed task instances (`only_failed=True`).
   - The scheduler re-executes only the failed nodes and their direct downstream dependencies, leaving successful upstream and sibling results completely intact.
4. **Dead Letter Queue (DLQ) Fallback**:
   - Wrap task execution logic in try-except blocks: write corrupt input keys to a DLQ storage folder and emit a warning rather than failing the orchestrator task, allowing the 99% valid data to reach production tables."""
        },

        "dag-medium-16": {
            "question": "Design a testing framework to validate the structural integrity and logic of DAGs before deployment to production?",
            "answer": """A production testing framework for DAGs must validate syntax, graph topology, cycle freedom, and business transformation logic across a multi-tiered CI/CD pipeline:

### Testing Pyramid:
1. **Static Linting & Syntax Checks**:
   - Run `ruff` and `mypy` to detect syntax errors, unresolved imports, and type discrepancies.
2. **DAG Integrity Unit Tests (Pytest)**:
   - Verify that all DAG files parse without throwing import errors, contain no circular dependencies (cycles), and conform to team policies:
```python
# tests/test_dag_integrity.py
import pytest
from airflow.models import DagBag

@pytest.fixture(scope="session")
def dagbag():
    return DagBag(dag_folder="dags/", include_examples=False)

def test_no_import_errors(dagbag):
    assert len(dagbag.import_errors) == 0, f"Import errors: {dagbag.import_errors}"

def test_dag_tags_and_retries(dagbag):
    for dag_id, dag in dagbag.dags.items():
        assert dag.tags, f"{dag_id} is missing tags"
        assert dag.default_args.get("retries", 0) >= 1, f"{dag_id} has no retry policy"
```
3. **Task Logic Unit Testing**:
   - Mock external connections (S3, Snowflake) and test custom operators and Python callables with synthetic DataFrames.
4. **Isolated Integration Testing**:
   - Run end-to-end DAG execution on temporary Airflow instances inside Docker containers against localized staging databases."""
        },

        "dag-medium-18": {
            "question": "Architect a method for safely passing large datasets (e.g., gigabytes) between discrete tasks in a DAG?",
            "answer": """Airflow's built-in XCom mechanism stores return values directly inside the orchestrator's relational metadata database (`xcom` table). Storing gigabytes of data in XCom will crash the database, exhaust memory, and corrupt metadata backups.

### Architectural Solution: Custom XCom Backend / Object Storage Pattern
1. **Custom XCom Backend Architecture**:
   - Implement an `Airflow.models.xcom.BaseXCom` subclass that intercepts task return values.
   - If the returned payload exceeds a threshold (e.g., >64 KB) or is a DataFrame, serialize it to Apache Parquet or JSON and write it to S3, GCS, or Azure Blob Storage.
   - Return only the remote storage URI (`s3://data-lake-stage/xcom/dag_id/task_id/run_id.parquet`) back to the metadata DB.
```python
# Custom XCom Backend Snippet
from airflow.models.xcom import BaseXCom
import pandas as pd
import uuid

class S3XComBackend(BaseXCom):
    PREFIX = "s3://data-lake-stage/xcom/"

    @staticmethod
    def serialize_value(value):
        if isinstance(value, pd.DataFrame):
            key = f"{S3XComBackend.PREFIX}{uuid.uuid4()}.parquet"
            value.to_parquet(key)
            return key
        return BaseXCom.serialize_value(value)

    @staticmethod
    def deserialize_value(result):
        if isinstance(result, str) and result.startswith(S3XComBackend.PREFIX):
            return pd.read_parquet(result)
        return BaseXCom.deserialize_value(result)
```
2. **Zero-Copy Lakehouse Pointers**:
   - For analytical workflows, avoid passing DataFrames altogether. Tasks should write results into governed intermediate staging tables (e.g., `schema.stage_orders_run_123`) and pass only the table identifier string downstream."""
        },

        "dag-medium-19": {
            "question": "How do you design a 'circuit breaker' within a DAG to halt execution if data quality checks fall below a certain threshold?",
            "answer": """A data pipeline circuit breaker automatically evaluates data quality assertions between extraction and loading steps, instantly stopping downstream writes if anomaly thresholds are breached.

### Implementation Pattern:
1. **Stage-Before-Publish**:
   - Tasks extract and load data into temporary staging tables (`stage_transactions`) rather than live production tables.
2. **Quality Assertion Task (Circuit Breaker)**:
   - Run automated validation suites (Great Expectations, Soda Core, or SQL assertions) against the staging data.
   - If critical tests fail (e.g., null primary keys > 0%, duplicate rate > 1%, or row count drop > 30% against 7-day average), raise an `AirflowFailException` to abort the pipeline immediately:
```python
from airflow.decorators import task
from airflow.exceptions import AirflowFailException

@task
def evaluate_data_circuit_breaker(staged_table: str, **context):
    # Query anomaly metrics
    null_count = query_db(f"SELECT COUNT(*) FROM {staged_table} WHERE id IS NULL")
    if null_count > 0:
        # Trip the circuit breaker: halts DAG and alerts On-Call
        raise AirflowFailException(f"Circuit Breaker Tripped! Found {null_count} null IDs in {staged_table}.")
    print("Data quality checks passed. Proceeding to production promotion.")
```
3. **Atomic Production Promotion**:
   - The production promotion task (`INSERT INTO live_table SELECT * FROM stage_table`) sits strictly downstream of the circuit breaker task, guaranteeing corrupt data never touches downstream BI dashboards."""
        },

        "dag-medium-20": {
            "question": "Design a version control and deployment pipeline for managing updates to complex DAG definitions.",
            "answer": """Deploying updates to hundreds of production DAGs requires continuous integration, automated testing, atomic deployments, and rollbacks without interrupting in-flight tasks.

### Architecture & Pipeline Flow:
1. **Repository Structure**:
   - Modular repository: `dags/` (DAG definitions), `plugins/` (custom operators/hooks), `tests/` (unit and integration tests), and `requirements.txt` (pinned dependencies).
2. **CI Pipeline (Pull Request Gate)**:
   - Run formatting (`ruff check`), static type analysis (`mypy`), and Pytest `DagBag` import checks against an ephemeral database container.
   - Reject PRs if DAG parse time exceeds 1.5 seconds per file.
3. **Continuous Deployment Strategies**:
   - **Git-Sync Sidecar (Kubernetes / Recommended)**: A lightweight Git-sync sidecar container runs alongside the Airflow scheduler and webserver, polling the release branch every 30 seconds and pulling checked-out DAG commits atomically into a shared volume.
   - **Bake-Into-Image (Immutable Production)**: For strict enterprise governance, bake DAG files directly into the production Airflow Docker image during CI/CD, tagging images with Git commit SHAs. Rollouts are orchestrated via Kubernetes Rolling Updates.
4. **Rollback Strategy**:
   - If a deployed DAG contains logical bugs, reverting the Git commit triggers the CD runner to redeploy the previous stable image in under 60 seconds."""
        },

        "dag-hard-22": {
            "question": "How would you design an autoscaling worker infrastructure that preemptively scales based on the predictive critical path analysis of upcoming DAGs?",
            "answer": """Standard reactive autoscalers (like Kubernetes Horizontal Pod Autoscaler based on CPU/Memory or KEDA based on queue depth) scale *after* tasks are queued, causing task execution latency while worker pods pull images and initialize.

### Predictive Preemptive Autoscaling Architecture:
1. **Critical Path & Workload Forecaster**:
   - Query the orchestrator metadata database for upcoming scheduled DAG runs over the next 30-minute horizon.
   - Analyze historical execution metrics from `task_instance` records to compute the expected critical path duration, worker slot demands, and GPU/memory specifications per upcoming DAG.
2. **Preemptive Provisioning Engine**:
   - 10 minutes prior to heavy batch windows (e.g., midnight UTC ETL bursts), a predictive controller calculates total required worker capacity.
   - The controller sends proactive scale-out commands to the underlying compute infrastructure (e.g., updating AWS EKS Auto Scaling Groups or Karpenter node pools).
3. **Warm Node Pre-Warming**:
   - Karpenter or Cluster Autoscaler spins up worker EC2/VM nodes and pre-pulls required container images before the DAG scheduler transitions tasks from `scheduled` to `queued`.
4. **Execution & Dynamic Release**:
   - As critical-path tasks complete, the controller adjusts minimum capacity downward, enabling aggressive scale-to-zero when all pipeline windows finish, minimizing idle cloud spend."""
        },

        "dag-hard-24": {
            "question": "How do you build a custom priority queuing system for DAG tasks in a multi-tenant environment with strictly enforced SLAs?",
            "answer": """In enterprise multi-tenant orchestrators where hundreds of business units share compute resources, low-priority ad-hoc queries must not starve high-priority Tier-1 financial SLA pipelines.

### Architectural Blueprint:
1. **Weighted Fair Queuing with Celery / RabbitMQ**:
   - Deploy multiple dedicated message broker queues: `queue_critical` (priority 10), `queue_standard` (priority 5), and `queue_batch` (priority 1).
   - Celery workers are configured with weighted consumer priorities or dedicated worker pool reservations:
     `celery worker -Q queue_critical,queue_standard,queue_batch -c 16`
2. **Dynamic Task Priority Weight Calculation**:
   - Airflow tasks compute their effective priority weight using `priority_weight` and `weight_rule=WeightRule.UPSTREAM` or `DOWNSTREAM`.
   - Implement an automated hook that adjusts priority dynamically:
     `TaskPriority = SLA_Tier_Base_Score + (Remaining_Time_To_SLA_Deadline)^(-1) * Scaling_Factor`
   - Tasks approaching their SLA deadline dynamically jump to the head of the queue.
3. **Tenant Slot Quotas (Multi-Tenant Resource Governance)**:
   - Allocate tenants isolated pools (e.g., `pool_marketing_team: 20 slots`, `pool_finance_team: 50 slots`).
   - If the marketing team triggers 500 tasks, they are constrained within their 20-slot allocation, preventing interference with other enterprise tenants."""
        },

        "dag-hard-25": {
            "question": "Architect a cross-cloud DAG orchestration system that executes tasks across AWS, GCP, and on-premises data centers securely?",
            "answer": """Orchestrating tasks spanning AWS, Google Cloud Platform (GCP), and on-premises data centers requires unified control plane governance, zero-trust network connectivity, and federated identity without hardcoded cloud credentials.

### Architecture Blueprint:
1. **Centralized Control Plane**:
   - Host the primary orchestration control plane (Airflow / Temporal / Dagster) in a primary cloud region (e.g., AWS us-east-1).
2. **Zero-Trust Cross-Cloud Identity (Workload Identity Federation)**:
   - Never store static AWS IAM access keys or GCP service account JSON files in the metadata database.
   - Establish OpenID Connect (OIDC) Workload Identity Federation: the central orchestrator uses its local cloud identity (AWS IAM Role) to exchange short-lived OIDC tokens for GCP and Azure STS security tokens dynamically.
3. **Decoupled Edge Worker Fleets**:
   - Deploy localized worker agents in each cloud environment:
     - AWS Worker Pool in AWS EKS.
     - GCP Worker Pool in GCP GKE.
     - On-Premises Worker Daemon behind enterprise corporate firewalls.
   - Workers communicate outbound-only over mutual TLS (mTLS) to a centralized message queue (Apache Kafka or AWS SQS), eliminating inbound firewall holes.
4. **Data Gravity Awareness**:
   - Tasks must execute compute close to data storage: transformations on BigQuery run via GCP workers; transformations on Redshift/S3 run via AWS workers, transmitting only metadata and completion signals across cloud boundaries."""
        },

        "dag-hard-26": {
            "question": "Design a real-time DAG compilation system that immediately reflects changes to source data schemas in the execution graph?",
            "answer": """Traditional orchestrators parse static Python files on disk; schema changes in upstream databases (new columns, renamed fields) require manual code edits and redeployments. A real-time compilation system updates DAG topologies dynamically.

### Architecture & Pipeline Flow:
1. **Schema Change Event Ingestion (CDC / Data Catalog Webhooks)**:
   - Upstream schema migrations in transactional databases emit DDL change events via Debezium CDC or enterprise data catalog webhooks (DataHub / Apache Atlas) to a Kafka topic.
2. **Metadata-Driven DAG Template Compiler**:
   - A compilation microservice consumes schema change events and reads JSON/YAML table metadata definitions from Git.
   - The compiler runs Jinja2 templating to generate or update Python DAG source files or serialized DAG JSON representations:
     `schema_contract.json + pipeline_template.jinja -> generated_dag.py`
3. **Dynamic Task Generation via Airflow 2.3+ TaskFlow Mapping**:
   - The DAG utilizes dynamic task mapping: upstream tasks query the live catalog metadata API at runtime, expanding downstream tasks dynamically to match the current column list or partition topology without redeploying code.
4. **Automated Schema Contract Validation**:
   - Before applying the compiled DAG, an automated gate executes compatibility checks (e.g., verifying that deleted columns are not referenced by downstream BI dashboards), pausing the deployment and alerting data stewards if breaking changes occur."""
        },

        "dag-hard-27": {
            "question": "How would you build an anomaly detection system that automatically pauses DAG execution if task runtimes deviate significantly from historical baselines?",
            "answer": """Silent performance degradation—such as a database query locking or an un-indexed full-table scan increasing task runtime from 5 minutes to 3 hours—wastes compute slots and delays enterprise SLAs.

### Architectural Solution:
1. **Historical Telemetry Aggregation**:
   - Stream task execution events from the orchestrator metadata DB into a time-series or analytics database (ClickHouse / Prometheus).
   - Track historical distributions of `duration` per `(dag_id, task_id, day_of_week)`.
2. **Statistical Anomaly Baseline**:
   - Calculate rolling 30-day statistical bounds:
     `Upper_Bound = Median(duration) + 3 * MAD (Median Absolute Deviation)`
3. **Real-Time Runtime Watchdog / SLA Miss Callbacks**:
   - Configure orchestrator SLA callbacks and task-level execution timeouts:
     `execution_timeout = timedelta(minutes=expected_duration * 2)`
   - Alternatively, a background daemon queries active running tasks (`state = RUNNING`) every 60 seconds.
4. **Automated Mitigation (Circuit Breaker)**:
   - When a running task exceeds its historical upper bound by >300%:
     1. Terminate or pause the task instance via REST API.
     2. Pause the parent DAG schedule (`is_paused = True`) to prevent downstream cascade.
     3. Emit a high-priority PagerDuty alert containing thread stack traces and active database queries for engineering triage."""
        },

        "dag-hard-28": {
            "question": "Architect a resource contention management system for thousands of DAGs competing for limited external API tokens?",
            "answer": """When hundreds of concurrent DAG tasks query third-party SaaS APIs (e.g., Salesforce, Stripe, SAP) with strict rate limits (e.g., max 100 requests/sec or 5,000 requests/day per API token), uncoordinated workers trigger HTTP 429 throttling and pipeline failures.

### Architectural Blueprint:
1. **Centralized Token Bucket Rate-Limiting Service (Redis Cluster)**:
   - Deploy an in-memory Redis cluster implementing the distributed Token Bucket or Leaky Bucket algorithm.
   - Tasks do not make raw HTTP calls directly; they request tokens from the central Redis coordinator before initiating requests.
2. **Custom Distributed Rate-Limited Hooks**:
   - Wrap orchestrator HTTP calls in a custom hook that executes atomic Lua scripts against Redis to acquire request tokens:
```python
# Lua atomic token acquisition in Redis
LUA_ACQUIRE_TOKEN = \"\"\"
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local current = tonumber(redis.call('get', key) or '0')
if current < limit then
    redis.call('incr', key)
    if current == 0 then redis.call('expire', key, 1) end
    return 1
else
    return 0
end
\"\"\"
```
3. **Smart Asynchronous Backoff**:
   - If Redis indicates the token quota is exhausted, tasks yield via deferrable triggers, sleeping for the duration of the rate-limit window without holding worker process slots.
4. **Token Multiplexing & Pool Rotation**:
   - Maintain a pool of rotated API service keys; the rate-limiting proxy dynamically load-balances calls across healthy available credentials."""
        },

        "dag-hard-29": {
            "question": "Design a highly scalable metadata storage layer for a DAG orchestrator handling billions of task state transitions per day?",
            "answer": """Classical relational databases (monolithic PostgreSQL/MySQL) encounter severe lock contention, IOPS bottlenecks, and vacuum bloat when tracking billions of state transitions per day across millions of task instances.

### Distributed Storage Architecture:
1. **Decouple Hot Active State from Cold Historical State**:
   - **Hot Working Set (Distributed In-Memory / Key-Value)**:
     - Store active running DAG runs and task heartbeat states in an ultra-low-latency distributed key-value store (Redis Cluster, ScyllaDB, or AWS DynamoDB with single-digit millisecond reads/writes).
     - Scheduler evaluations and heartbeat updates update in-memory state with zero table lock contention.
2. **Append-Only Event Sourcing (Kafka / Pulsar)**:
   - Treat state transitions as immutable events: `TaskScheduled`, `TaskStarted`, `TaskHeartbeat`, `TaskSucceeded`.
   - Workers publish state transitions to a partitioned Kafka topic partitioned by `dag_run_id`.
3. **Partitioned Historical Data Lake (Delta Lake / Apache Iceberg)**:
   - Downstream consumers stream state transitions from Kafka into append-only Delta Lake / Iceberg tables partitioned by `year-month-day`.
   - UI queries and historical SLA reporting read directly from fast OLAP engines (ClickHouse or Trino) querying the lakehouse metadata.
4. **Aggressive State Pruning**:
   - Hot transactional state is purged immediately upon DAG run termination, keeping the active working set below 500 MB at all times."""
        },

        "dag-hard-30": {
            "question": "How would you implement a robust rolling upgrade strategy for a central DAG orchestration system with zero downtime for running workflows?",
            "answer": """Upgrading a mission-critical orchestration platform (e.g., from Airflow 2.5 to 2.8, or patching underlying Kubernetes clusters) must guarantee that long-running workflows are not killed, database schemas migrate safely, and no schedules are skipped.

### Zero-Downtime Rolling Upgrade Protocol:
1. **Database Schema Backward Compatibility**:
   - Upgrades must follow the **Expand/Contract** database migration pattern.
   - Run preliminary Alembic DDL migrations that add new nullable columns and tables without altering or locking existing production columns. Verify both old and new application versions can run against the hybrid DB schema.
2. **Graceful Worker Drain (Celery / Kubernetes)**:
   - Put legacy worker pools into **drain mode** (`SIGTERM` or `celery control cancel_consumer`).
   - Draining workers finish their current active tasks but refuse to accept new work from the queue.
3. **Deploy New Component Fleet**:
   - Launch new worker pools running the upgraded Docker image connected to the same message broker.
   - Launch new Schedulers with leader election active; the new schedulers begin dispatching queued tasks exclusively to the new worker fleet.
4. **Webserver & API Blue-Green Switchover**:
   - Deploy new webservers/UI behind the ingress load balancer.
   - Perform synthetic smoke tests against internal health check endpoints.
   - Switch load balancer routing from blue (legacy) to green (upgraded).
5. **Final Clean-Up**:
   - Once all legacy workers reach 0 active tasks, terminate the legacy pods and execute any remaining Alembic database contraction migrations."""
        }
    }
