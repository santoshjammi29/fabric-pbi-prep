# fix_questions_duplicates.py
# Bespoke, expert answers for the 9 questions that previously had copy-pasted duplicate answers.

def get_duplicate_fixes():
    return {
        "dag-easy-10": {
            "question": "Design a simple branching logic mechanism where a DAG executes different paths based on a sensor's output.",
            "answer": """To implement conditional branching in a DAG based on sensor evaluation or upstream task state:

1. **Branching Primitive**: Use a branching operator (e.g., `BranchPythonOperator` or `@task.branch` in TaskFlow API) immediately downstream of the sensor. The branch callable inspects the sensor output or an XCom state value and returns the `task_id` (or list of IDs) of the branch to follow.
2. **Path Isolation & Trigger Rules**: Downstream tasks along alternative branches are skipped by default. If downstream tasks must converge after the branch, configure `trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS` on the joining task so it does not fail when non-selected branches are marked `SKIPPED`.
3. **Implementation Example**:
```python
from airflow.decorators import dag, task
from airflow.operators.empty import EmptyOperator
from airflow.sensors.filesystem import FileSensor
from airflow.utils.trigger_rule import TriggerRule
import pendulum

@dag(schedule=None, start_date=pendulum.datetime(2024, 1, 1), catchup=False)
def sensor_branching_workflow():
    check_file = FileSensor(
        task_id="check_incoming_file",
        filepath="/data/inbox/payload.json",
        poke_interval=30,
        timeout=300,
        mode="reschedule"
    )

    @task.branch
    def evaluate_file_payload(**context):
        # Inspect sensor metadata or file content size
        import os
        size_bytes = os.path.getsize("/data/inbox/payload.json")
        if size_bytes > 50_000_000: # 50 MB threshold
            return "process_bulk_stream"
        return "process_micro_batch"

    bulk_proc = EmptyOperator(task_id="process_bulk_stream")
    micro_proc = EmptyOperator(task_id="process_micro_batch")
    
    join_task = EmptyOperator(
        task_id="join_branches",
        trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS
    )

    check_file >> evaluate_file_payload() >> [bulk_proc, micro_proc] >> join_task

dag_obj = sensor_branching_workflow()
```
4. **Production Gotcha**: Never run heavy I/O or file reads directly inside the `@task.branch` Python callable if it can run on the scheduler loop; always execute inside an isolated worker task."""
        },

        "dag-hard-21": {
            "question": "Architect a decentralized orchestration engine capable of managing millions of transient, dynamically generated DAGs per hour?",
            "answer": """Architecting an orchestration engine for millions of transient, sub-second to multi-minute dynamic DAGs per hour requires replacing centralized scheduler polling loops (like Airflow's centralized RDBMS) with a distributed, event-driven state machine.

### Core Architecture:
1. **Event-Driven DAG Ingestion & Storage**:
   - Ingest DAG definitions over gRPC into a clustered distributed log (Apache Kafka or Apache Pulsar) partitioned by `dag_run_id`.
   - DAG definitions are serialized as lightweight Protobuf Directed Acyclic Graph graphs with pre-validated topological sorts.
2. **Actor-Based Distributed Scheduler (Temporal / Ray / Akka)**:
   - Implement an actor model where each active DAG run is represented by a stateful virtual actor pinned to a cluster node using consistent hashing.
   - When upstream task events complete (`TaskCompleted(task_id)`), the DAG actor decrements in-degree counters of downstream task nodes in memory and publishes runnable tasks to a distributed queue.
3. **Stateless Task Execution Fleet (K8s / Firecracker MicroVMs)**:
   - Worker pools pull runnable task payloads directly from partitioned task queues (NATS JetStream or Redis Cluster).
   - Ephemeral microVMs (AWS Firecracker) or warm container pools execute tasks with millisecond-level cold-start overhead.
4. **State Persistence & Consensus**:
   - Instead of locking rows in a relational database, commit task state transitions append-only to distributed key-value stores (ScyllaDB / DynamoDB / Apache Cassandra) or event streams.
5. **Production Hardening**:
   - **Backpressure & Task Throttling**: Use token bucket rate-limiters at the ingestion ingress to prevent cascading cluster failure during traffic surges.
   - **Garbage Collection**: Eagerly prune completed ephemeral DAG metadata into cold object storage (S3 Parquet logs) to prevent metadata storage exhaustion."""
        },

        "airflow-easy-10": {
            "question": "What are the performance implications of putting top-level code outside of tasks in an Airflow DAG file?",
            "answer": """In Apache Airflow, any Python code located outside of operator definitions, hook calls, or `@task` bodies is referred to as **top-level code**.

### How Airflow Processes DAG Files:
The Airflow Scheduler continuously loops through the `dags/` folder (controlled by `min_file_process_interval`, default 30 seconds), executing every Python file from top to bottom to parse DAG structures and task dependencies.

### Performance Implications:
1. **Scheduler CPU Saturation**: If top-level code performs heavy imports, dynamic loops, or computation, every parse cycle consumes substantial CPU cycles across scheduler processes, leading to scheduler heartbeat delays and task starvation.
2. **Database Connection Exhaustion**: Opening database connections (e.g., executing SQL queries to populate dynamic tasks at the top level) causes the scheduler to flood the database with connections on every parse cycle.
3. **Network Latency & Blocking Calls**: Calling external APIs (e.g., `requests.get()`, S3 list keys) blocks the scheduler parsing process. A single slow API call can increase DAG parse time from 50ms to 5+ seconds.
4. **Worker/Scheduler Drift**: Executing non-deterministic functions (e.g., `datetime.now()` instead of execution dates) at the top level causes discrepancies between what the scheduler perceives and what the worker executes.

### Best Practice Remediation:
- Move all I/O, heavy transformations, and external API requests inside operator `execute()` methods, `@task` decorated functions, or Python callables.
- Use Airflow Variables and Connections inside tasks using Jinja templating (`{{ var.value.my_var }}`) rather than `Variable.get()` at the module level."""
        },

        "airflow-hard-22": {
            "question": "How do you design a database migration strategy for an Airflow metadata database with 10 terabytes of task history with zero downtime?",
            "answer": """Migrating a multi-terabyte Airflow metadata database (e.g., from PostgreSQL 11 to PostgreSQL 16 on Aurora or RDS) without downtime requires dual-write or logical replication architectures rather than in-place Alembic upgrades.

### Architectural Phased Strategy:
1. **Pre-Migration Archiving & Compaction**:
   - 10 TB of metadata typically consists of bloated `task_instance`, `log`, `xcom`, and `job` tables.
   - Run background batch archiving: export historical task records older than 90 days into S3/Parquet for compliance and execute `TRUNCATE / VACUUM FULL` in partitioned chunks, reducing active state to <50 GB.
2. **Continuous Logical Replication (CDC)**:
   - Establish physical or logical replication (PostgreSQL `pglogical` or AWS DMS) from the primary database to the target database cluster.
   - Replicate schema and ongoing CDC stream of task updates with low replication lag (<100ms).
3. **Schema Compatibility Pre-Upgrade**:
   - Deploy the new Airflow version's Alembic migrations against an isolated clone of the target database to verify DDL locks, index generation, and column modifications beforehand.
4. **Traffic Cutover (Zero Downtime)**:
   - **Step A**: Place Airflow schedulers in read-only / pause mode for scheduled triggers while allowing currently executing workers to complete active tasks.
   - **Step B**: Switch database connection pooling endpoints (e.g., PgBouncer or AWS Route 53 DNS CNAME) from the legacy primary to the target database.
   - **Step C**: Launch new Airflow schedulers pointed at the updated DB endpoint and unpause DAG schedules.
5. **Rollback Strategy**:
   - Keep reverse logical replication active from the new database back to the old database for 48 hours to enable immediate failback if anomalies arise."""
        },

        "airflow-hard-27": {
            "question": "How would you mitigate the 'thundering herd' problem when hundreds of Airflow workers attempt to connect to the metadata database simultaneously after a network partition?",
            "answer": """When a network partition heals or an Airflow metadata database restarts, hundreds of Celery or Kubernetes workers wake up simultaneously and bombard the database with reconnection requests, causing CPU spikes, max connection pool exhaustion, and cascading timeouts.

### Remediation Architecture:
1. **Client-Side Exponential Backoff & Jitter**:
   - Configure worker database connection retries with randomized jitter:
     `T_wait = min(T_max, T_base * 2^attempt) + random_uniform(0, jitter)`
   - Prevents synchronized wave arrivals at the database port.
2. **Centralized Connection Pooling Layer (PgBouncer / ProxySQL)**:
   - Never allow Airflow worker processes to connect directly to PostgreSQL. Place a cluster of PgBouncer instances in front of the database using **Transaction Pooling** mode (`pool_mode = transaction`).
   - Transaction pooling multiplexes thousands of worker connections down to 50-100 physical database backend connections.
3. **Worker Concurrency Capping**:
   - In `airflow.cfg`, tune `sql_alchemy_pool_size` and `sql_alchemy_max_overflow` to conservative values (e.g., pool size 5, max overflow 10 per process).
4. **Health Check Staggering & Rate-Limiting**:
   - If using Kubernetes, set `readinessProbe` and `livenessProbe` with staggered `periodSeconds` and `initialDelaySeconds` to prevent simultaneous pod re-starts from swamping the network.
5. **Scheduler Decoupling**:
   - Upgrade to modern Airflow versions utilizing Internal API Server mode (`[core] internal_api_url`), which routes worker state calls through gRPC/HTTP endpoints rather than direct SQL connections."""
        },

        "airflow-medium-13": {
            "question": "Design a system leveraging dynamic task mapping to process an unknown number of incoming files in S3?",
            "answer": """Dynamic Task Mapping (introduced in Airflow 2.3) allows a DAG to dynamically generate parallel task instances at runtime based on upstream data (e.g., list of S3 object keys), eliminating the need for rigid pre-defined task counts.

### Architecture & Implementation:
1. **Discovery Task**: An upstream `@task` scans the S3 prefix, filters out processed markers, and returns a list of keys.
2. **Mapped Processing Task**: The downstream transformation task uses `.expand()` to dynamically instantiate one task instance per S3 key.
3. **Downstream Aggregation**: A downstream task collects the mapped outputs to generate summary metrics.

```python
from airflow.decorators import dag, task
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
import pendulum

@dag(schedule="@daily", start_date=pendulum.datetime(2024, 1, 1), catchup=False)
def dynamic_s3_file_processor():

    @task
    def list_incoming_s3_files(bucket_name: str, prefix: str) -> list[str]:
        hook = S3Hook(aws_conn_id="aws_default")
        keys = hook.list_keys(bucket_name=bucket_name, prefix=prefix)
        # Return only unprocessed JSON payload files
        return [k for k in (keys or []) if k.endswith(".json")]

    @task(max_active_tis_per_dag=16)
    def process_individual_file(bucket_name: str, file_key: str) -> int:
        hook = S3Hook(aws_conn_id="aws_default")
        content = hook.read_key(key=file_key, bucket_name=bucket_name)
        import json
        records = json.loads(content)
        # Process and write to staging
        return len(records)

    @task
    def summarize_results(record_counts: list[int]):
        total = sum(record_counts)
        print(f"Total processed records across all mapped files: {total}")

    keys = list_incoming_s3_files(bucket_name="raw-data-lake", prefix="incoming/2024/")
    processed_counts = process_individual_file.partial(bucket_name="raw-data-lake").expand(file_key=keys)
    summarize_results(processed_counts)

dag_instance = dynamic_s3_file_processor()
```

### Production Guardrails:
- **`max_active_tis_per_dag` / `max_map_length`**: Always set limits to avoid overwhelming the Airflow scheduler or worker pool if S3 contains 50,000 files in a single run.
- **XCom Serialization Overhead**: Return only small string keys in the discovery task, never the raw file contents, to avoid metadata DB bloat."""
        },

        "kafka-easy-2": {
            "question": "What is the system design purpose of a Kafka consumer group?",
            "answer": """A Kafka consumer group is the foundational abstraction that enables **horizontal scalability, fault tolerance, and load balancing** in Kafka's distributed consumption model.

### System Design Purposes:
1. **Parallelism and Load Balancing**:
   - A single consumer reading from a 20-partition topic is constrained by single-node CPU/network bandwidth.
   - By creating a consumer group with 10 consumers, Kafka automatically assigns 2 partitions to each consumer, dividing the ingestion load evenly and allowing linear throughput scaling up to the number of partitions.
2. **High Availability and Auto-Failover**:
   - Consumers in a group send periodic heartbeats to the Group Coordinator broker.
   - If a consumer crashes or network-fails, the group coordinator detects the heartbeat timeout, triggers a **rebalance**, and redistributes the orphan partitions to the remaining healthy consumers with minimal interruption.
3. **Flexible Messaging Patterns (Queue vs Pub/Sub)**:
   - **Queue Pattern**: Multiple consumer processes share the *same* `group.id`. Each message is delivered to exactly one consumer instance in the group.
   - **Publish/Subscribe Pattern**: Multiple distinct systems (e.g., Analytics vs Fraud Detection) use *different* `group.id`s. Each consumer group independently receives a full copy of every topic partition's event stream.
4. **Independent Offset Tracking**:
   - Kafka tracks committed read offsets per consumer group in the internal `__consumer_offsets` topic, allowing different business services to consume at their own cadence without interfering with each other."""
        },

        "kafka-medium-14": {
            "question": "How do you optimize consumer group rebalancing times in an environment with hundreds of partitions and consumers?",
            "answer": """In large-scale Kafka deployments with hundreds of partitions and consumers, classical "eager" rebalances cause a "stop-the-world" effect where all consumers revoke their partitions, halt processing, and rejoin simultaneously.

### Optimization Blueprint:
1. **Adopt Cooperative Sticky Assignor**:
   - Configure `partition.assignment.strategy` to `org.apache.kafka.clients.consumer.CooperativeStickyAssignor`.
   - **Incremental Cooperative Rebalancing** reassigns only the specific partitions that must move due to consumer departures or arrivals, allowing unaffected consumers to continue reading without interruption.
2. **Implement Static Group Membership**:
   - For containerized consumers (Kubernetes / ECS) that restart frequently during deployments, configure `group.instance.id` (e.g., pod name).
   - When a consumer restarts within `session.timeout.ms`, the Group Coordinator preserves its assigned partitions without triggering a cluster-wide rebalance.
3. **Heartbeat and Session Timeout Tuning**:
   - `session.timeout.ms`: Set to 30-45 seconds to avoid false-positive failovers from transient GC pauses.
   - `heartbeat.interval.ms`: Set to ~1/3 of session timeout (e.g., 10 seconds).
4. **Decouple Processing from Poll Loop**:
   - If message processing takes too long, the consumer fails to call `poll()` before `max.poll.interval.ms` (default 5 mins), triggering a live consumer ejection.
   - **Remediation**: Hand off consumed batches to an internal worker thread pool, keeping the consumer network poll thread purely dedicated to fetching and heartbeating."""
        },

        "lakehouse-hard-29": {
            "question": "Design a system that leverages machine learning to predictively trigger compaction and z-ordering jobs precisely when table fragmentation reaches a critical threshold?",
            "answer": """An intelligent predictive table maintenance system continuously monitors data ingestion patterns, query workloads, and storage metrics to optimize Delta Lake / Apache Iceberg tables without wasting compute or causing query SLA degradation.

### Architectural Blueprint:
1. **Telemetry & Feature Ingestion Layer**:
   - **Storage Metrics**: Query engine logs and metadata files (`_delta_log` or Iceberg metadata snapshots) capture: total file count, average file size, file size distribution skew, and small file (<10 MB) ratio.
   - **Query Workload Metrics**: Capture query audit logs (Databricks `system.query.history`, Snowflake query history, or Trino audit logs) extracting query execution times, scanned file counts, partition pruning ratios, and frequently filtered WHERE columns.
2. **Feature Store & ML Inference Service**:
   - Compute tabular features per table: `file_fragmentation_index`, `daily_ingest_frequency`, `avg_query_scan_efficiency = bytes_scanned / bytes_returned`, and `hours_since_last_compaction`.
   - Train an XGBoost or Random Forest regression model to predict `query_degradation_risk` (probability that analytical queries will violate p95 latency thresholds over the next 6 hours).
3. **Cost-Benefit Optimization Engine**:
   - Estimate Maintenance Compute Cost ($C_{opt}$ based on DBUs/EC2 instances needed for `OPTIMIZE / VACUUM`) versus Query Savings Value ($V_{query}$ based on expected scanned byte reduction).
   - Trigger an optimization action only when $V_{query} > C_{opt} \times \alpha$, preventing over-compaction on cold tables.
4. **Automated Maintenance Execution (Databricks Workflows / Airflow)**:
   - When trigger conditions are met, invoke targeted operations:
     - If small file count > threshold: run fast bin-pack `OPTIMIZE table`.
     - If query filter drift is detected: dynamically compute new clustering columns and run `OPTIMIZE table ZORDER BY (pred_col1, pred_col2)` or adjust Liquid Clustering keys.
5. **Feedback Loop**: Record post-optimization query execution times to retrain the model continuously."""
        }
    }
