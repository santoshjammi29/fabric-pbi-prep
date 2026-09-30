# fix_concepts.py
import json

concepts_file = "src/data/json/data_concepts.json"

with open(concepts_file, "r") as f:
    concepts = json.load(f)

# Retain original first 140 concepts
clean_concepts = concepts[:140]

airflow_data = {
    # EASY (12)
    "DAG (Directed Acyclic Graph)": {
        "id": "airflow-dag-directed-acyclic-graph",
        "difficulty": "EASY",
        "definition": "A Directed Acyclic Graph (DAG) is a collection of all tasks you want to run, organized in a way that reflects their relationships and dependencies without any circular loops.",
        "explanation": "In Apache Airflow, DAGs are authored purely in Python scripts where task nodes represent units of work and directed edges define execution order. The scheduler periodically parses the DAG files in the dags_folder to determine which tasks are upstream dependencies and are ready to run based on execution dates and state transitions. Because DAGs are acyclic, deadlocks and infinite loops are structurally impossible. Enterprise data platforms use DAGs to model complex ELT workflows with branching, retries, and SLA monitors.",
        "keyPoints": [
            "Authored as declarative Python files defining task dependencies via the bitshift operators (>> and <<).",
            "Acyclic topology guarantees execution terminates without infinite recursive dependency loops.",
            "Parsed continuously by the DagFileProcessor to synchronize execution schedules and DAG state in the metadata database.",
            "Serves as the fundamental unit of scheduling, isolation, and monitoring in the Airflow ecosystem."
        ]
    },
    "Task": {
        "id": "airflow-task",
        "difficulty": "EASY",
        "definition": "A Task is the basic unit of execution in Airflow, representing an instantiated node in a DAG that performs a specific piece of work.",
        "explanation": "Tasks are created by instantiating an Operator, Sensor, or decorated Python function using the TaskFlow API (@task). When a DAG is triggered, its tasks transition through discrete states: none -> scheduled -> queued -> running -> success (or failed/upstream_failed). Tasks run in isolated worker processes or containers, completely decoupled from the Airflow scheduler process.",
        "keyPoints": [
            "Represents the discrete executable node within a DAG graph.",
            "Can be defined using classic Operators or TaskFlow API (@task decorator).",
            "Executes in worker environments (Celery workers, Kubernetes pods) isolated from the Airflow scheduler.",
            "Maintains lifecycle states (queued, running, success, failed, upstream_failed) tracked in the metadata DB."
        ]
    },
    "Operator": {
        "id": "airflow-operator",
        "difficulty": "EASY",
        "definition": "An Operator is a template or blueprint class in Airflow that defines a single task's behavior, execution logic, and parameters.",
        "explanation": "While a Task represents the conceptual node in a DAG, the Operator encapsulates the actual implementation code executed during runtime. Airflow provides three primary operator classifications: Action operators (e.g., PythonOperator, BashOperator) that perform compute, Transfer operators (e.g., S3ToRedshiftOperator) that move data between systems, and Sensor operators that wait for events. Operators should be idempotent so retrying a failed task produces identical side effects without duplicate records.",
        "keyPoints": [
            "Acts as the reusable blueprint that defines how a task executes its logic.",
            "Categorized into Action operators, Transfer operators, and Sensor operators.",
            "Should always adhere to idempotency principles to guarantee safe automated retries.",
            "Extended by community provider packages (e.g., apache-airflow-providers-databricks, amazon, google)."
        ]
    },
    "Scheduler": {
        "id": "airflow-scheduler",
        "difficulty": "EASY",
        "definition": "The Scheduler is the heartbeat service of Airflow that monitors DAG files, resolves dependencies, and queues task instances for executor dispatch.",
        "explanation": "The Airflow Scheduler runs as a persistent multi-threaded daemon that continuously evaluates the state of active DagRuns and TaskInstances in the metadata database. It determines when upstream task dependencies are satisfied, verifies pool concurrency limits, and hands off runnable tasks to the configured executor. In modern Airflow 2.x+, multiple schedulers can run concurrently in an active-active high availability cluster backed by row-level database locking.",
        "keyPoints": [
            "Core engine responsible for parsing DAGs, evaluating dependencies, and queuing tasks.",
            "Runs in an active-active HA model in Airflow 2.x+, eliminating single points of failure.",
            "Delegates task execution to executors (Local, Celery, Kubernetes) without running worker compute itself.",
            "Tunes scheduling throughput via parameters like parallelism, dag_concurrency, and max_active_runs."
        ]
    },
    "Worker Node": {
        "id": "airflow-worker-node",
        "difficulty": "EASY",
        "definition": "A Worker Node is a dedicated compute instance or container responsible for pulling queued task instances and executing their payload logic.",
        "explanation": "In distributed architectures like CeleryExecutor or KubernetesExecutor, worker nodes isolate task execution from the core Airflow control plane (Webserver and Scheduler). Workers pull tasks off message queues (e.g., Redis, RabbitMQ) or spin up transient Kubernetes pods, stream task execution logs back to remote storage (S3/GCS), and update the task's terminal status in PostgreSQL. Scaling workers horizontally allows organizations to execute thousands of concurrent pipelines without bottlenecking the scheduler.",
        "keyPoints": [
            "Dedicated execution environment physically decoupled from the scheduler and webserver nodes.",
            "Pulls task assignments from message brokers or receives container dispatches from the Kubernetes API.",
            "Streams live logs to centralized object storage (S3, GCS, CloudWatch) for web UI inspection.",
            "Scales horizontally via KEDA or Celery autoscaling policies based on queue depth metrics."
        ]
    },
    "XCom (Cross-Communication)": {
        "id": "airflow-xcom-cross-communication",
        "difficulty": "EASY",
        "definition": "XCom (Cross-Communication) is Airflow's built-in mechanism that allows tasks within the same DAG run to exchange small metadata payloads, parameters, or state identifiers.",
        "explanation": "Because tasks run in isolated processes or disparate worker machines, they cannot share in-memory variables. XCom solves this by serializing JSON-compatible objects into the Airflow metadata database under key-value pairs indexed by dag_id, task_id, and execution_date. XCom is strictly intended for small metadata (file paths, partition keys, record counts) and should never be used to pass bulk dataframes; large payloads should utilize custom XCom backends that push artifacts directly to S3 or GCS.",
        "keyPoints": [
            "Enables inter-task metadata communication across isolated worker processes and machines.",
            "Stored by default in the metadata database as serialized JSON blobs with size limits (typically <48KB).",
            "Can be configured with Custom XCom Backends (S3, GCS, Azure Blob) to handle larger serialized payloads.",
            "Accessed programmatically via task_instance.xcom_push() and task_instance.xcom_pull() or return values in @task."
        ]
    },
    "Airflow Variables": {
        "id": "airflow-airflow-variables",
        "difficulty": "EASY",
        "definition": "Airflow Variables are global key-value store entries maintained in the metadata database used to store non-sensitive runtime configurations and application constants.",
        "explanation": "Variables provide a central repository for pipeline settings that can be updated via the Airflow UI, CLI, or REST API without modifying DAG code. However, referencing `Variable.get('my_var')` at top-level code outside of an operator's `execute()` method incurs a database query on every scheduler loop parse, causing metadata DB saturation. In production, variables should either be read inside task execution scope, parameterized via Jinja templates `{{ var.value.my_var }}`, or backed by external secret managers.",
        "keyPoints": [
            "Global key-value configuration store shared across all DAGs and tasks.",
            "Accessible in Python via Variable.get() or inside templates using {{ var.value.key }}.",
            "Must never be called at top-level DAG script scope to prevent saturating metadata DB connection pools.",
            "Can be stored in HashiCorp Vault, AWS SSM, or GCP Secret Manager using custom secret backends."
        ]
    },
    "Airflow Connections": {
        "id": "airflow-airflow-connections",
        "difficulty": "EASY",
        "definition": "Airflow Connections are centralized configuration objects that store credentials, hostnames, ports, and authentication parameters required to interface with external systems.",
        "explanation": "Connections decouple pipeline code from environmental connection parameters and sensitive credentials. Each connection is identified by a unique `conn_id` (e.g., `snowflake_prod`, `postgres_dwh`) and stores connection types, usernames, passwords, and JSON extra fields. Airflow Hooks reference these `conn_id`s to instantiate authenticated client libraries without hardcoding secrets in Git repositories.",
        "keyPoints": [
            "Centralizes authentication secrets, hostnames, and ports for external databases and cloud services.",
            "Referenced by Hooks and Operators using a clean conn_id string (e.g. conn_id='databricks_default').",
            "Supports fernet-key encryption at rest in the metadata database for sensitive credentials.",
            "Can be sourced dynamically from enterprise secret managers (AWS Secrets Manager, Azure Key Vault)."
        ]
    },
    "TaskInstance": {
        "id": "airflow-taskinstance",
        "difficulty": "EASY",
        "definition": "A TaskInstance represents a specific run of a Task for a particular DagRun point in time, holding runtime state, attempt counts, and execution metrics.",
        "explanation": "While a Task defines static code, a TaskInstance (often abbreviated as TI) represents the dynamic runtime incarnation of that task for a given logical execution date. The metadata database tracks the TaskInstance's start time, duration, operator class, retry count, worker hostname, and current state. Airflow users manage pipelines at the TaskInstance level when clearing states, marking tasks as successful, or auditing execution logs.",
        "keyPoints": [
            "Represents the concrete runtime state of an individual task for a specific DagRun.",
            "Holds execution metadata including try_number, duration, worker_host, and state transitions.",
            "Can be cleared individually in the UI or CLI to trigger targeted task reruns without rerunning the entire DAG.",
            "Exposes execution context (execution_date, params, ti) to Jinja templates and Python Callables."
        ]
    },
    "DagRun": {
        "id": "airflow-dagrun",
        "difficulty": "EASY",
        "definition": "A DagRun is an instantiation of an entire DAG representing a single execution instance for a specific logical date and trigger type.",
        "explanation": "Every time a DAG is executed—whether on an automated cron schedule, via an external API call, or manually triggered by an engineer—a new DagRun entry is created in the metadata database. A DagRun has a unique `run_id`, an `execution_date` (logical date), a `start_date`, and an overall state (running, success, failed) that evaluates the aggregated states of all its child TaskInstances. Airflow limits concurrency at the DagRun level using the `max_active_runs` parameter.",
        "keyPoints": [
            "The object representing a single execution run of a DAG across all its constituent tasks.",
            "Identified by run_id (e.g., scheduled__2026-09-30T00:00:00+00:00 or manual__...).",
            "Evaluates to success only when all leaf tasks complete in allowed states according to trigger rules.",
            "Controlled by max_active_runs to prevent scheduling pile-ups during downstream latency spikes."
        ]
    },
    "Trigger Rules": {
        "id": "airflow-trigger-rules",
        "difficulty": "EASY",
        "definition": "Trigger Rules dictate the exact upstream conditions required for a task to transition from queued to running.",
        "explanation": "By default, all tasks have `trigger_rule='all_success'`, meaning a task will only execute if every direct upstream parent task succeeded. Airflow provides multiple alternative trigger rules like `all_failed` (for alerting handlers), `all_done` (for mandatory teardown/cleanup tasks), `one_success` (for branching convergence), and `none_failed` (which allows upstream tasks to be skipped). Mastering trigger rules is crucial for building robust branching architectures and idempotent cleanup sequences.",
        "keyPoints": [
            "Controls the state conditions required across upstream tasks before a downstream task executes.",
            "Defaults to 'all_success', which halts downstream branches whenever an upstream task fails.",
            "'all_done' ensures cleanup/teardown tasks run regardless of upstream success or failure.",
            "'none_failed_min_one_success' is the standard rule for downstream tasks after a BranchPythonOperator."
        ]
    },
    "SLA (Service Level Agreement)": {
        "id": "airflow-sla-service-level-agreement",
        "difficulty": "EASY",
        "definition": "An SLA (Service Level Agreement) is a time duration threshold configured on tasks or DAGs that triggers automated alerts if execution exceeds expected operational windows.",
        "explanation": "In mission-critical data pipelines, downstream stakeholders require data to arrive before strict business deadlines. Airflow allows developers to assign an `sla=timedelta(hours=2)` parameter to any task. If a task instance does not reach the `success` state within that duration measured from the start of the scheduled DagRun, Airflow records an SLA miss and can execute custom `sla_miss_callback` hooks to notify on-call engineers via Slack or PagerDuty.",
        "keyPoints": [
            "Configured via timedelta parameters on tasks or DAG default_args to define delivery deadlines.",
            "Measured relative to the logical execution date / scheduled start of the DagRun, not task start time.",
            "Triggers automated notifications via email or custom sla_miss_callback functions.",
            "Visible in the Airflow UI under Browse -> SLA Misses for platform operational compliance auditing."
        ]
    },

    # MEDIUM (12)
    "LocalExecutor": {
        "id": "airflow-localexecutor",
        "difficulty": "MEDIUM",
        "definition": "LocalExecutor is a single-node Airflow executor that runs tasks concurrently as separate OS subprocesses on the scheduler host using a process pool.",
        "explanation": "LocalExecutor is the standard production choice for small-to-medium single-node deployments. Unlike SequentialExecutor, LocalExecutor connects to a real SQL database (PostgreSQL or MySQL) and executes multiple tasks in parallel up to a configured worker concurrency limit. Because all tasks run on the same virtual machine, it requires zero external message brokers (Redis/RabbitMQ). However, it cannot scale beyond the CPU and memory limits of that single host.",
        "keyPoints": [
            "Runs tasks concurrently as subprocesses directly on the scheduler host machine.",
            "Requires a production RDBMS (PostgreSQL/MySQL) supporting concurrent connection pools.",
            "Eliminates the operational overhead of managing external Celery brokers or Kubernetes clusters.",
            "Vertically bounded: scaling is constrained by the physical CPU and RAM of the single host."
        ]
    },
    "CeleryExecutor": {
        "id": "airflow-celeryexecutor",
        "difficulty": "MEDIUM",
        "definition": "CeleryExecutor is a distributed executor that distributes task execution across an independent, horizontally scalable fleet of worker nodes via a message broker.",
        "explanation": "CeleryExecutor is the most established enterprise executor pattern for high-volume Airflow clusters. Tasks queued by the scheduler are published as messages to a broker (Redis or RabbitMQ). A cluster of Celery workers continuously listens to the queue, executes tasks in worker processes, and writes task outcomes to a shared result backend database. This architecture enables horizontal autoscaling of worker fleets during peak ETL batches while isolating compute workloads from the scheduler.",
        "keyPoints": [
            "Distributes tasks horizontally across a fleet of dedicated Celery worker nodes.",
            "Relies on a message broker (RabbitMQ or Redis) for queue management and task dispatch.",
            "Supports task routing to specialized worker queues (e.g., GPU queues, memory-optimized queues).",
            "Requires robust broker monitoring and process recycling to prevent worker memory leaks."
        ]
    },
    "KubernetesExecutor": {
        "id": "airflow-kubernetesexecutor",
        "difficulty": "MEDIUM",
        "definition": "KubernetesExecutor is a cloud-native executor that launches a dedicated, ephemeral Kubernetes pod for each individual task instance.",
        "explanation": "When the scheduler marks a task as queued, KubernetesExecutor communicates directly with the Kubernetes API server to spawn a pod using a configured container image. The task runs inside this isolated pod with dedicated CPU/memory limits, custom environment variables, and specialized secrets. Once the task finishes, the pod terminates and its resources are released back to the cluster. This guarantees complete dependency isolation across tasks and enables zero-scale compute when the cluster is idle.",
        "keyPoints": [
            "Spawns a transient, dedicated Kubernetes pod for each individual task instance.",
            "Provides complete dependency, library, and resource isolation between conflicting pipelines.",
            "Enables dynamic elastic scaling from zero pods up to cluster node limits without idle worker costs.",
            "Incurs pod startup latency overhead (10-30s), making it best suited for medium-to-long running tasks."
        ]
    },
    "TaskGroup": {
        "id": "airflow-taskgroup",
        "difficulty": "MEDIUM",
        "definition": "A TaskGroup is a visual and organizational UI construct in Airflow that hierarchically groups related tasks together without the overhead of SubDAGs.",
        "explanation": "Introduced in Airflow 2.0 to completely replace buggy, deadlock-prone SubDAGs, TaskGroups allow developers to organize complex DAG topologies into collapsible visual modules in the UI grid and graph views. Under the hood, a TaskGroup is purely an organizational abstraction: tasks within a TaskGroup remain standard tasks executed directly by the scheduler with normal dependency resolution and pool management. TaskGroups support nesting and can be generated dynamically.",
        "keyPoints": [
            "Replaced legacy SubDAGs, eliminating scheduler deadlocks and execution DAG run complexities.",
            "Provides collapsible visual nesting in the Airflow Grid and Graph views for large enterprise DAGs.",
            "Maintains a clean namespacing prefix (group_id.task_id) to prevent task ID collisions.",
            "Purely client-side UI abstraction that introduces zero scheduler or execution engine overhead."
        ]
    },
    "Sensors (BaseSensorOperator)": {
        "id": "airflow-sensors-basesensoroperator",
        "difficulty": "MEDIUM",
        "definition": "Sensors are specialized operators derived from BaseSensorOperator that poll an external system at regular intervals until a specific condition or criteria is met.",
        "explanation": "Sensors are commonly used to pause pipeline execution until a partition lands in S3, a table partition appears in Snowflake, or an API status changes to completed. Sensors operate in two distinct modes: `poke` (where the sensor holds a worker slot continuously while sleeping between intervals) and `reschedule` (where the sensor releases its worker slot between checks and reschedules itself). In production, any sensor waiting longer than a few minutes must use `mode='reschedule'` to prevent worker slot exhaustion.",
        "keyPoints": [
            "Specialized operators designed to poll external systems until a condition evaluates to True.",
            "mode='poke' holds a worker slot continuously during sleep intervals; dangerous for long waits.",
            "mode='reschedule' releases worker execution slots between polls, preventing worker pool starvation.",
            "Configured with timeout and poke_interval parameters to prevent runaway zombie polling."
        ]
    },
    "Hooks": {
        "id": "airflow-hooks",
        "difficulty": "MEDIUM",
        "definition": "Hooks are reusable client interfaces that encapsulate connection logic, authentication, and API communication with external databases, platforms, and services.",
        "explanation": "Hooks act as the underlying low-level integration building blocks for Operators. Rather than writing raw psycopg2, boto3, or Snowflake client code inside an Operator, developers instantiate a Hook (e.g., `PostgresHook`, `S3Hook`, `HttpHook`). The Hook automatically retrieves credentials from the Airflow Connections store, handles session tokens and TLS certificates, and exposes high-level Python methods like `get_records()` or `load_file()`. Hooks should be used inside custom operators or PythonCallables.",
        "keyPoints": [
            "Reusable client layer that wraps external APIs and database connection protocols.",
            "Automatically resolves connection details and credentials from the Airflow Connections database.",
            "Used internally by Operators to separate orchestration workflows from transport/API protocols.",
            "Exposes high-level helper methods (e.g., run(), get_pandas_df(), upload_file()) with built-in retries."
        ]
    },
    "Custom Operators": {
        "id": "airflow-custom-operators",
        "difficulty": "MEDIUM",
        "definition": "Custom Operators are user-defined Python classes extending BaseOperator that implement specialized enterprise task execution logic.",
        "explanation": "When built-in provider operators do not fulfill proprietary business requirements, data engineers create custom operators by subclassing `BaseOperator` and overriding the `execute(self, context)` method. Custom operators define `template_fields` to declare which attributes support Jinja templating, configure custom UI colors via `ui_color`, and implement clean exception handling. Creating custom operators standardizes engineering patterns across disparate enterprise teams.",
        "keyPoints": [
            "Created by inheriting from BaseOperator and overriding the execute(self, context) lifecycle method.",
            "Declares template_fields to expose specific class properties to runtime Jinja template compilation.",
            "Encapsulates proprietary enterprise business logic and standardized connection handling.",
            "Can define custom UI colors and icons for instant visual recognition in the Airflow DAG graph."
        ]
    },
    "Dynamic Task Mapping": {
        "id": "airflow-dynamic-task-mapping",
        "difficulty": "MEDIUM",
        "definition": "Dynamic Task Mapping (Airflow 2.3+) is an orchestration pattern that generates a dynamic number of parallel task instances at runtime based on upstream data outputs.",
        "explanation": "Historically, generating multiple tasks required static loops during DAG parse time. Dynamic Task Mapping introduces the `.expand()` and `.partial()` syntax (inspired by MapReduce) allowing a task to fan out dynamically based on the output of an upstream task (e.g., processing an unknown list of S3 files or database IDs). The scheduler instantiates mapped task instances dynamically during runtime without requiring DAG file reparsing, unlocking true data-driven parallel pipelines.",
        "keyPoints": [
            "Introduced in Airflow 2.3 using .expand() and .partial() syntax based on runtime upstream outputs.",
            "Eliminates anti-pattern top-level database queries previously used for dynamic DAG generation.",
            "Scheduler dynamically scales mapped task instances at runtime while tracking individual TI states.",
            "Integrates seamlessly with TaskFlow API decorators (@task) to map across lists and dictionaries."
        ]
    },
    "Dataset-Driven Scheduling": {
        "id": "airflow-dataset-driven-scheduling",
        "difficulty": "MEDIUM",
        "definition": "Dataset-Driven Scheduling (Airflow 2.4+) is an event-based scheduling mechanism where DAGs trigger automatically when upstream producer tasks update defined data assets.",
        "explanation": "Rather than relying strictly on cron schedules and polling sensors to synchronize multi-DAG pipelines, Airflow allows tasks to declare `outlets=[Dataset('s3://lake/orders')]`. Downstream DAGs specify `schedule=[Dataset('s3://lake/orders')]`. When the upstream producer task succeeds, Airflow registers a dataset event in the metadata DB and instantly triggers the consumer DAG. This replaces brittle ExternalTaskSensors with clean, data-aware cross-DAG dependencies.",
        "keyPoints": [
            "Event-driven scheduling triggered by data asset updates rather than rigid cron timetables.",
            "Producer tasks declare outputs using outlets=[Dataset('uri')]; consumer DAGs schedule on those Datasets.",
            "Replaces brittle ExternalTaskSensors and manual TriggerDagRunOperators across pipeline boundaries.",
            "Visualized in the Airflow UI under the Datasets tab, showing an enterprise data dependency graph."
        ]
    },
    "Backfill": {
        "id": "airflow-backfill",
        "difficulty": "MEDIUM",
        "definition": "Backfill is the process of executing a DAG across a past historical date range to populate historical data or reprocess data after logic modifications.",
        "explanation": "When deploying a new pipeline or fixing a bug in an existing transformation, engineers need to re-run pipelines for historical dates. Airflow's architecture natively separates execution date (logical date) from actual run timestamp, allowing the CLI command `airflow dags backfill -s <start_date> -e <end_date> <dag_id>` to generate sequential DagRuns. Backfills respect concurrency limits and can be executed without modifying DAG schedule definitions.",
        "keyPoints": [
            "Executes DAGs across historical date intervals using the airflow dags backfill CLI utility.",
            "Relies on deterministic logical dates (data_interval_start/end) to ensure idempotent data reprocessing.",
            "Respects max_active_runs and pool limits to prevent overwhelming downstream target databases.",
            "Can re-execute failed or missing intervals without wiping out unrelated successful task runs."
        ]
    },
    "Pools (Airflow Pools)": {
        "id": "airflow-pools-airflow-pools",
        "difficulty": "MEDIUM",
        "definition": "Airflow Pools are concurrency control mechanisms used to restrict the number of simultaneous task instances accessing a specific shared resource or database.",
        "explanation": "When hundreds of tasks run concurrently, uncontrolled connections can overwhelm external systems like production PostgreSQL clusters, API endpoints, or third-party webhooks. Airflow Pools allow administrators to define named resource limits with a maximum slot capacity (e.g., `snowflake_heavy_pool: 5 slots`). Tasks assigned to that pool will queue if all slots are occupied, protecting downstream platforms from connection exhaustion and CPU thrashing.",
        "keyPoints": [
            "Restricts concurrent task execution slots against shared or rate-limited external infrastructure.",
            "Configured via the Airflow UI under Admin -> Pools with assigned integer slot capacities.",
            "Tasks declare pool='pool_name' and optionally pool_slots=N to occupy multiple slots per task.",
            "Queued tasks yield slots dynamically upon completion, preventing external system saturation."
        ]
    },
    "Priority Weights": {
        "id": "airflow-priority-weights",
        "difficulty": "MEDIUM",
        "definition": "Priority Weights determine the execution priority of queued task instances when multiple tasks compete for limited worker or pool slots.",
        "explanation": "When a cluster experiences high task volume and pool slots or worker concurrency are saturated, the scheduler uses `priority_weight` integers to decide which queued task to dispatch first. By default, Airflow uses a `weight_rule='downstream'` strategy, meaning a task's effective priority is the sum of its own weight plus the weights of all its downstream dependents. This ensures critical path bottlenecks are executed ahead of non-critical batch leaves.",
        "keyPoints": [
            "Integer value determining dispatch ordering for tasks waiting in the scheduler's queued state.",
            "Defaults to weight_rule='downstream', prioritizing tasks that unlock the longest downstream dependency chains.",
            "Alternative weight rules include 'upstream' and 'absolute' for manual static prioritization.",
            "Critical for guaranteeing that high-priority operational SLAs are met ahead of long batch reports."
        ]
    },

    # HARD (11)
    "DAG Serialization": {
        "id": "airflow-dag-serialization",
        "difficulty": "HARD",
        "definition": "DAG Serialization is an architectural subsystem that parses Python DAG files, serializes them into JSON blobs, and stores them in the metadata database for fast webserver retrieval.",
        "explanation": "Prior to Airflow 1.10.7, the Airflow Webserver parsed raw Python files on disk directly to render UI views, creating security vulnerabilities and extreme CPU spikes. With DAG Serialization, the `DagFileProcessor` serializes the compiled DAG structure into JSON (in the `serialized_dag` DB table). The Webserver reads purely from the database without executing Python code, drastically accelerating UI load times, eliminating webserver file system dependencies, and hardening cluster security.",
        "keyPoints": [
            "Serializes parsed DAG objects into structured JSON stored in the serialized_dag database table.",
            "Completely decouples the Airflow Webserver from the local file system and raw Python execution.",
            "Eliminates webserver CPU spikes and secures the cluster against arbitrary code execution in the UI.",
            "Synchronized automatically by the DagProcessor whenever Python source files are updated on disk."
        ]
    },
    "Metadata Database Tuning": {
        "id": "airflow-metadata-database-tuning",
        "difficulty": "HARD",
        "definition": "Metadata Database Tuning involves optimizing PostgreSQL/MySQL parameters, connection pooling, and table indexes to sustain high Airflow scheduling throughput.",
        "explanation": "As an Airflow cluster grows to thousands of active tasks, the metadata database becomes the primary scalability bottleneck. Key optimizations include deploying PgBouncer to manage connection spikes, tuning `max_connections`, setting appropriate `shared_buffers` and `work_mem`, and running automated `airflow db clean` jobs to archive aged `task_instance` and `log` records. Proper database tuning prevents transaction deadlocks and scheduler heartbeat timeouts.",
        "keyPoints": [
            "Mitigates the single largest performance bottleneck in enterprise-scale Airflow deployments.",
            "Requires dedicated connection pooling layers like PgBouncer to handle distributed worker connection spikes.",
            "Enforces scheduled table pruning via airflow db clean to prevent multi-million row table bloat.",
            "Tunes query execution plans by optimizing autovacuum and indexing on task_instance and dag_run tables."
        ]
    },
    "High Availability Scheduler": {
        "id": "airflow-high-availability-scheduler",
        "difficulty": "HARD",
        "definition": "The High Availability (HA) Scheduler architecture allows multiple Airflow scheduler instances to run concurrently in an active-active model without race conditions.",
        "explanation": "Introduced in Airflow 2.0, the HA Scheduler enables organizations to deploy 2 or more scheduler instances concurrently. Instead of relying on active-passive failover with leader election, all schedulers operate concurrently. Concurrency collisions are prevented at the database level using `SELECT ... FOR UPDATE SKIP LOCKED` row-level locks. If one scheduler host crashes, the remaining schedulers immediately pick up the workload with zero downtime and zero manual failover intervention.",
        "keyPoints": [
            "Enables active-active multi-scheduler deployment natively in Airflow 2.x+.",
            "Leverages database-native row-level locking (SELECT FOR UPDATE SKIP LOCKED) to avoid race conditions.",
            "Eliminates the single point of failure (SPOF) present in legacy single-scheduler architectures.",
            "Distributes DAG parsing and task scheduling loads across multiple compute nodes seamlessly."
        ]
    },
    "Celery Worker Autoscaling": {
        "id": "airflow-celery-worker-autoscaling",
        "difficulty": "HARD",
        "definition": "Celery Worker Autoscaling dynamically scales the number of Celery worker processes or nodes based on active task queue depth and resource utilization.",
        "explanation": "Airflow supports two levels of Celery autoscaling: in-process concurrency scaling (`worker_autoscale = max,min`) and infrastructure-level pod/VM scaling. At the infrastructure layer, modern Kubernetes deployments leverage KEDA (Kubernetes Event-driven Autoscaling) to monitor Redis/RabbitMQ queue depth metrics. When queue backlogs surge during peak batch processing windows, KEDA provisions additional Celery worker pods; when queues drain, it scales workers down to minimize cloud expenditure.",
        "keyPoints": [
            "Optimizes cloud compute costs by dynamically scaling worker instances against queue depth metrics.",
            "Combines process-level concurrency autoscaling with infrastructure-level pod scaling via KEDA.",
            "Monitors message broker queues (Redis/RabbitMQ) to trigger rapid worker scale-out before SLA breaches.",
            "Requires graceful termination signals (SIGTERM) to allow active tasks to finish before worker pods terminate."
        ]
    },
    "KubernetesPodOperator (KPO)": {
        "id": "airflow-kubernetespodoperator-kpo",
        "difficulty": "HARD",
        "definition": "KubernetesPodOperator (KPO) executes an arbitrary Docker container as an isolated Kubernetes pod, providing language-agnostic compute and complete dependency isolation.",
        "explanation": "KPO is the gold standard for running complex transformations that require specific Python versions, non-Python runtimes (Java, C++, Rust), or custom OS-level system libraries. Unlike standard PythonOperators that execute in the shared Airflow worker virtualenv, KPO launches a self-contained container with its own image, volume mounts, resource limits, and secrets. If the container crashes or runs out of memory, the Airflow worker remains healthy, isolating failure domains completely.",
        "keyPoints": [
            "Launches an independent container pod inside a Kubernetes cluster for dedicated task execution.",
            "Provides complete dependency isolation: pipelines can run conflicting library versions and custom runtimes.",
            "Protects the Airflow worker infrastructure from catastrophic out-of-memory (OOM) failures.",
            "Supports native Kubernetes primitives including nodeAffinity, tolerations, volumeMounts, and ConfigMaps."
        ]
    },
    "DAGs on Remote Storage": {
        "id": "airflow-dags-on-remote-storage",
        "difficulty": "HARD",
        "definition": "An enterprise deployment pattern where Airflow DAG definitions are synchronized from object storage (S3/GCS) or Git repositories rather than baked into container images.",
        "explanation": "Baking DAG files directly into Docker container images requires full CI/CD image build and deployment cycles for every minor pipeline tweak. Storing DAGs on remote object storage or using git-sync sidecars synchronizes DAG definitions across schedulers, workers, and webservers within seconds. Enterprise architectures configure git-sync sidecar containers that periodically poll Git repositories, pull committed changes, and mount them as shared volumes to Airflow services.",
        "keyPoints": [
            "Decouples pipeline code deployment from core Airflow platform Docker image release cycles.",
            "Utilizes git-sync sidecar containers to continuously synchronize DAG repositories into local volumes.",
            "Can leverage S3/GCS object stores with lifecycle sync scripts to distribute pipeline code across clusters.",
            "Requires robust branch protection and automated linting in CI to prevent deploying broken DAG files."
        ]
    },
    "Airflow REST API": {
        "id": "airflow-airflow-rest-api",
        "difficulty": "HARD",
        "definition": "The Airflow REST API is an OpenAPI-compliant web interface providing programmatic access to trigger runs, manage variables, inspect logs, and audit cluster state.",
        "explanation": "Introduced as a fully stable, secure interface in Airflow 2.0, the REST API enables external platforms, microservices, and CI/CD tools to interact with Airflow programmatically. It supports comprehensive CRUD operations for DAGs, DagRuns, TaskInstances, Pools, Connections, and Variables. Authenticated via OAuth, HTTP Basic Auth, or custom JWT tokens, the API allows organizations to build custom developer portals and automate event-driven pipeline execution from external systems.",
        "keyPoints": [
            "Fully OpenAPI-compliant REST interface introduced in Airflow 2.0 for external orchestration integration.",
            "Supports triggering DagRuns with custom configuration parameters (conf JSON payloads).",
            "Secured through enterprise authentication backends (OAuth2, LDAP, Kerberos, API tokens).",
            "Enables building external monitoring dashboards, automated test triggers, and custom admin portals."
        ]
    },
    "Grid View & Task Dependencies": {
        "id": "airflow-grid-view---task-dependencies",
        "difficulty": "HARD",
        "definition": "Grid View is Airflow's primary operational UI dashboard combining hierarchical task dependency trees with historical run statuses, duration charts, and log access.",
        "explanation": "Replacing the legacy Tree View in Airflow 2.3, the Grid View provides an intuitive visual matrix of recent DagRuns (columns) against tasks and TaskGroups (rows). It allows engineers to inspect task duration trends, identify bottleneck stages, diagnose upstream failure cascades, and view live logs with a single click. The Grid View renders complex task dependency graphs dynamically without requiring full page refreshes.",
        "keyPoints": [
            "Primary operational dashboard in Airflow 2.3+ combining run status matrices with log viewers.",
            "Renders hierarchical TaskGroups with drill-down capabilities for multi-hundred task pipelines.",
            "Displays historical execution duration sparklines to immediately spot anomalous run delays.",
            "Enables one-click task clearing, log downloading, and variable/XCom state inspection."
        ]
    },
    "Statsd Metrics Integration": {
        "id": "airflow-statsd-metrics-integration",
        "difficulty": "HARD",
        "definition": "Statsd Metrics Integration exports low-level Airflow operational telemetry to monitoring backends like Prometheus, Datadog, or Grafana.",
        "explanation": "Enterprise Airflow operations require continuous monitoring of scheduler health, worker saturation, and DAG processing latency. Airflow natively supports emitting real-time metrics via StatsD UDP sockets. Critical metrics include `dag_processing.total_parse_time`, `scheduler.heartbeat_duration`, `executor.open_slots`, and `dagrun.schedule_delay`. In Kubernetes environments, a Prometheus StatsD exporter sidecar collects these metrics and converts them into Prometheus scrape endpoints for real-time alerting.",
        "keyPoints": [
            "Emits real-time operational telemetry via StatsD protocol to Prometheus, Datadog, or InfluxDB.",
            "Crucial metrics include dag_processing.total_parse_time and scheduler.critical_section_duration.",
            "Tracks executor queue saturation and scheduling delays to trigger automated infrastructure scaling.",
            "Enables platform engineers to set SLA alerts and identify poorly optimized DAG scripts."
        ]
    },
    "SLA Miss Callbacks": {
        "id": "airflow-sla-miss-callbacks",
        "difficulty": "HARD",
        "definition": "SLA Miss Callbacks are custom Python functions invoked by the Airflow scheduler when tasks breach their configured Service Level Agreement duration thresholds.",
        "explanation": "When an SLA is missed, Airflow can automatically execute a user-defined callback function (`sla_miss_callback`). The callback receives context objects containing the DAG ID, list of missed task instances, execution dates, and blocking tasks. Enterprise teams use SLA miss callbacks to dispatch rich notifications to on-call Slack channels, create automated Jira incidents, or invoke PagerDuty escalation policies before business stakeholders notice stale reports.",
        "keyPoints": [
            "Automated event handler triggered by the scheduler when a task breaches its sla parameter.",
            "Receives comprehensive diagnostic context including dag, task_list, blocking_task_list, and slas.",
            "Enables programmatic dispatch to incident response systems (PagerDuty, Opsgenie, Slack webhooks).",
            "Executes within the scheduler process; must remain lightweight to avoid blocking scheduling loops."
        ]
    },
    "Custom Timetables": {
        "id": "airflow-custom-timetables",
        "difficulty": "HARD",
        "definition": "Custom Timetables (Airflow 2.2+) allow developers to author arbitrary, non-cron scheduling logic that accounts for business calendars, holidays, and fiscal intervals.",
        "explanation": "Standard cron expressions cannot accommodate complex business rules such as 'run on the last business day of every fiscal month' or 'run every 30 minutes only during NYSE market trading hours'. Timetables replace cron strings by implementing Python classes with custom `next_dagrun_info()` logic. Timetables define both the data interval (data_interval_start and end) and the exact UTC timestamp when the DagRun should be triggered.",
        "keyPoints": [
            "Introduced in Airflow 2.2 to support scheduling logic that cannot be expressed via standard cron syntax.",
            "Enables scheduling based on financial calendars, market trading days, and country-specific holidays.",
            "Explicitly controls the logical data interval (data_interval_start/end) independently of trigger time.",
            "Implemented by subclassing Timetable and registering the plugin in the Airflow plugins directory."
        ]
    },

    # ARCHITECT (10)
    "Multi-Tenant Airflow": {
        "id": "airflow-multi-tenant-airflow",
        "difficulty": "ARCHITECT",
        "definition": "Multi-Tenant Airflow is an enterprise architectural model where multiple disparate teams or business units share Airflow infrastructure while maintaining strict workload isolation.",
        "explanation": "Operating Airflow in large enterprises requires balancing infrastructure efficiency with security isolation. True multi-tenancy can be implemented via soft multi-tenancy (single cluster using RBAC, team-specific Pools, and KubernetesPodOperator for isolated execution) or hard multi-tenancy (multi-cluster architecture where each business unit receives an independent lightweight Airflow instance via Helm or Astronomer). Hard multi-tenancy is strongly favored in regulated industries to prevent cross-tenant noisy neighbors and permission escalation.",
        "keyPoints": [
            "Addresses governance, security isolation, and compute allocation across multiple engineering teams.",
            "Soft multi-tenancy utilizes RBAC, designated Pools, and custom namespaces on a shared cluster.",
            "Hard multi-tenancy deploys independent containerized Airflow instances per tenant using Kubernetes/Helm.",
            "Prevents noisy-neighbor compute starvation and eliminates cross-tenant secret leakage vulnerabilities."
        ]
    },
    "Airflow 2.x Architecture (DagProcessor)": {
        "id": "airflow-airflow-2-x-architecture-dagprocessor",
        "difficulty": "ARCHITECT",
        "definition": "The standalone DagProcessor architecture isolates the Python DAG parsing loop into dedicated, decoupled processes outside the Airflow scheduler daemon.",
        "explanation": "In early Airflow architectures, the scheduler ran both the DAG parsing loop (evaluating Python files) and the task scheduling loop in the same process. Malicious or resource-heavy DAG files could crash the entire scheduling engine. Airflow 2.x introduces the standalone `dag-processor` service, physically separating parsing from scheduling. Schedulers consume pre-serialized DAGs from the database, resulting in ultra-fast scheduling cycles and bulletproof platform resilience.",
        "keyPoints": [
            "Decouples Python file evaluation from the core scheduler loop into a dedicated standalone daemon.",
            "Protects the scheduling engine from crashing when poorly written DAG code triggers CPU or memory spikes.",
            "Improves scheduling throughput by enabling schedulers to operate purely on serialized DB records.",
            "Supports running DagProcessor in isolated network zones with restricted metadata DB privileges."
        ]
    },
    "Astronomer Astro vs OSS": {
        "id": "airflow-astronomer-astro-vs-oss",
        "difficulty": "ARCHITECT",
        "definition": "The architectural evaluation between operating self-hosted open-source Apache Airflow versus managed enterprise platforms like Astronomer Astro.",
        "explanation": "Self-hosted OSS Airflow grants complete control over infrastructure, custom plugins, and networking, but requires significant full-time DevOps overhead for Kubernetes management, scaling, zero-downtime upgrades, and security patching. Astronomer Astro provides a fully managed, multi-tenant control plane with auto-scaling worker nodes, built-in CI/CD deploy CLI, centralized lineage (via OpenLineage), and automated metadata DB tuning. Architects evaluate this decision based on engineering headcount, TCO, and compliance demands.",
        "keyPoints": [
            "OSS requires dedicated platform engineering teams for Kubernetes, Helm, DB tuning, and upgrades.",
            "Astronomer Astro delivers managed multi-cluster orchestration with zero-downtime version upgrades.",
            "Astro integrates native OpenLineage data tracking and cross-deployment observability out of the box.",
            "Architecture decision hinges on total cost of ownership (TCO) vs infrastructure sovereignty requirements."
        ]
    },
    "RBAC in Airflow": {
        "id": "airflow-rbac-in-airflow",
        "difficulty": "ARCHITECT",
        "definition": "Role-Based Access Control (RBAC) in Airflow restricts user permissions to specific DAGs, connections, variables, and operational actions based on defined organizational roles.",
        "explanation": "Airflow's security model uses Flask-AppBuilder RBAC to govern user access. Built-in roles include Admin, Op, User, Viewer, and Public. In enterprise deployments, security architects define custom roles that grant granular permissions, such as allowing the Marketing team to view and trigger only DAGs matching `marketing_.*`, while blocking access to Finance DAGs and global Connection secrets. Enterprise installations integrate RBAC with corporate identity providers via SAML, Okta, or LDAP.",
        "keyPoints": [
            "Enforces least-privilege security policies across enterprise data engineering teams.",
            "Supports DAG-level access controls: users can view and trigger only assigned pipeline namespaces.",
            "Federates with corporate enterprise IdPs using SAML, OAuth2, Okta, and Azure Active Directory.",
            "Restricts sensitive actions such as editing Connections, clearing tasks, and downloading worker logs."
        ]
    },
    "Custom Secret Backends": {
        "id": "airflow-custom-secret-backends",
        "difficulty": "ARCHITECT",
        "definition": "Custom Secret Backends enable Airflow to retrieve Connections and Variables directly from enterprise secret management systems at runtime without storing secrets in the metadata database.",
        "explanation": "Storing sensitive production database passwords and API tokens in the Airflow metadata database introduces compliance and security risks. Airflow allows configuring external secret backends like AWS Secrets Manager, HashiCorp Vault, Azure Key Vault, or Google Secret Manager via `airflow.cfg`. When a task requests a connection, Airflow queries the external vault directly at runtime. Secrets are never persisted to disk or the relational database, fulfilling SOC2 and HIPAA compliance mandates.",
        "keyPoints": [
            "Delegates credential and variable storage directly to enterprise vaults (AWS Secrets Manager, Vault, GCP).",
            "Eliminates the storage of sensitive plaintext or fernet-encrypted credentials in the metadata database.",
            "Enforces centralized secret rotation without requiring Airflow connection updates or DAG redeployments.",
            "Includes local caching to prevent rate-limiting and API costs from external secret providers."
        ]
    },
    "Cross-DAG Dependencies with Datasets": {
        "id": "airflow-cross-dag-dependencies-with-datasets",
        "difficulty": "ARCHITECT",
        "definition": "Cross-DAG Dependencies with Datasets models enterprise data pipelines as a decentralized, event-driven mesh of producer and consumer DAGs synchronized via data assets.",
        "explanation": "Historically, coordinating dependencies across disparate DAGs required `ExternalTaskSensor` (which waste worker slots and tightly couple schedules) or `TriggerDagRunOperator`. Airflow's Dataset architecture allows DAGs to decouple completely: upstream ingestion DAGs produce Datasets, while downstream analytical and dbt DAGs trigger immediately upon Dataset event emission. This transforms monolithic orchestration into an asynchronous, observable data mesh topology.",
        "keyPoints": [
            "Replaces brittle, tightly coupled ExternalTaskSensors with asynchronous data asset events.",
            "Decouples pipeline execution schedules: downstream DAGs run only when prerequisite data is fresh.",
            "Provides an enterprise-wide data lineage graph rendered automatically in the Airflow UI.",
            "Supports multi-dataset boolean conditions (e.g. trigger when Dataset A AND Dataset B update)."
        ]
    },
    "Airflow + dbt Integration": {
        "id": "airflow-airflow---dbt-integration",
        "difficulty": "ARCHITECT",
        "definition": "The architectural integration between Airflow and dbt, leveraging orchestration frameworks like Cosmos to translate dbt models into native Airflow task dependency graphs.",
        "explanation": "Running dbt inside Airflow can be done naively (executing `dbt run` as a monolithic BashOperator) or architecturally (using Astronomer Cosmos to parse `manifest.json` and generate an individual Airflow task for every single dbt model). The Cosmos approach provides granular task-level retries, parallel execution across independent models, rich UI observability, and native dbt test assertion tracking directly inside the Airflow Grid View.",
        "keyPoints": [
            "Astronomer Cosmos parses dbt manifest.json to dynamically render dbt models as native Airflow tasks.",
            "Enables isolated task-level retries and parallel model compilation without re-running the entire dbt project.",
            "Embeds dbt source freshness checks and schema test assertions directly into the DAG execution path.",
            "Executes dbt within isolated virtualenvs or Kubernetes pods to prevent library conflicts with Airflow."
        ]
    },
    "Airflow + Spark Integration": {
        "id": "airflow-airflow---spark-integration",
        "difficulty": "ARCHITECT",
        "definition": "The architectural pattern for orchestrating large-scale Apache Spark batch and streaming jobs from Airflow across distributed compute clusters.",
        "explanation": "Airflow should act strictly as the orchestrator, never the compute engine. When executing Spark jobs, Airflow delegates execution to managed platforms via dedicated operators (e.g., `DatabricksSubmitRunOperator`, `DatabricksRunNowOperator`, `EMRContainerOperator`, or `SparkKubernetesOperator`). The Airflow task submits the job definition, polls for completion asynchronously, and streams logs back to the console, ensuring the Airflow worker consumes minimal memory while Spark executes on distributed clusters.",
        "keyPoints": [
            "Enforces separation of concerns: Airflow orchestrates dependencies while Spark handles heavy distributed compute.",
            "Utilizes modern API submission operators (DatabricksSubmitRunOperator, SparkKubernetesOperator) rather than spark-submit CLI.",
            "Leverages asynchronous deferrable operators to poll Spark execution status without occupying worker slots.",
            "Captures Spark Application IDs and driver tracking URLs directly inside Airflow task metadata."
        ]
    },
    "Event-Driven Orchestration": {
        "id": "airflow-event-driven-orchestration",
        "difficulty": "ARCHITECT",
        "definition": "An architectural paradigm where Airflow pipelines trigger immediately in response to external real-time events (webhooks, Kafka messages, file arrivals) rather than static schedules.",
        "explanation": "Modern data architectures demand near-real-time data delivery rather than waiting for nightly cron batches. Event-Driven Airflow combines lightweight message listeners (Kafka consumers, AWS SQS pollers, webhook receivers) with the Airflow REST API or deferrable sensors. Schedulers launch DagRuns dynamically with event payload parameters, enabling instant processing of streaming micro-batches, automated incident responses, and on-demand customer data deliveries.",
        "keyPoints": [
            "Transitions pipelines from rigid time-based polling (cron) to real-time event triggers.",
            "Integrates external event streams (Kafka, AWS EventBridge, webhooks) with the Airflow REST API.",
            "Utilizes Deferrable Operators and Triggers to wait for external events with zero worker slot overhead.",
            "Enables sub-minute data freshness SLAs for critical financial and operational downstream consumers."
        ]
    },
    "Airflow 3.0 Preview": {
        "id": "airflow-airflow-3-0-preview",
        "difficulty": "ARCHITECT",
        "definition": "The architectural vision of Apache Airflow 3.0, introducing decoupled execution engines, multi-language task authoring, and native event-driven streaming primitives.",
        "explanation": "Airflow 3.0 represents a major architectural evolution designed for modern cloud-native scale. Core initiatives include fully decoupled Execution API boundaries (allowing tasks to run in any programming language, not just Python), native distributed event-driven trigger engines, enhanced data asset lineage, and a redesigned React-based frontend. This modernization addresses legacy limitations around scheduler metadata contention and unlocks true polyglot data orchestration.",
        "keyPoints": [
            "Introduces a formal Execution API boundary, decoupling workers from direct metadata database connections.",
            "Enables polyglot task authoring (TypeScript, Go, Rust) running natively alongside Python tasks.",
            "Deepens native event-driven orchestration with first-class streaming and real-time trigger primitives.",
            "Delivers an upgraded, high-performance web architecture built on modern React and REST APIs."
        ]
    }
}

print(f"Loaded {len(airflow_data)} Airflow concepts.")
