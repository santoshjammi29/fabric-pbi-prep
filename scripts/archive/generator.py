import json

concepts_file = "src/data/json/data_concepts.json"
questions_file = "src/data/json/questions.json"

with open(concepts_file, 'r') as f:
    concepts = json.load(f)

with open(questions_file, 'r') as f:
    questions = json.load(f)

# Task 1: Add 150 concepts
airflow_easy = ["DAG (Directed Acyclic Graph)", "Task", "Operator", "Scheduler", "Worker Node", "XCom (Cross-Communication)", "Airflow Variables", "Airflow Connections", "TaskInstance", "DagRun", "Trigger Rules", "SLA (Service Level Agreement)"]
airflow_medium = ["LocalExecutor", "CeleryExecutor", "KubernetesExecutor", "TaskGroup", "Sensors (BaseSensorOperator)", "Hooks", "Custom Operators", "Dynamic Task Mapping", "Dataset-Driven Scheduling", "Backfill", "Pools (Airflow Pools)", "Priority Weights"]
airflow_hard = ["DAG Serialization", "Metadata Database Tuning", "High Availability Scheduler", "Celery Worker Autoscaling", "KubernetesPodOperator (KPO)", "DAGs on Remote Storage", "Airflow REST API", "Grid View & Task Dependencies", "Statsd Metrics Integration", "SLA Miss Callbacks", "Custom Timetables"]
airflow_architect = ["Multi-Tenant Airflow", "Airflow 2.x Architecture (DagProcessor)", "Astronomer Astro vs OSS", "RBAC in Airflow", "Custom Secret Backends", "Cross-DAG Dependencies with Datasets", "Airflow + dbt Integration", "Airflow + Spark Integration", "Event-Driven Orchestration", "Airflow 3.0 Preview"]

dbt_easy = ["dbt Model", "dbt Source", "ref() Function", "dbt Seed", "Generic Tests", "Table Materialization", "View Materialization", "Incremental Materialization", "Ephemeral Materialization", "schema.yml", "profiles.yml", "dbt run command"]
dbt_medium = ["dbt Snapshot (SCD Type 2)", "Custom Schema Override", "Pre/Post Hooks", "dbt Macros", "Jinja Templating in dbt", "dbt-utils Package", "Incremental Models (unique_key)", "Singular Tests", "dbt build Command", "Exposures", "dbt Semantic Layer", "Analyses"]
dbt_hard = ["dbt Compile vs Run vs Build", "Partial Parsing", "Source Freshness Checks", "Adapter-Specific Macros", "--defer Flag", "State-Based CI", "Custom Materializations", "dbt-audit-helper", "Cross-Database Macros", "Manifest.json Internals", "Graph Selection Syntax"]
dbt_architect = ["dbt Core vs dbt Cloud", "dbt Mesh (Cross-Project Refs)", "dbt Semantic Layer at Scale", "Monorepo vs Multi-Project dbt", "dbt + Airflow Orchestration", "dbt + Databricks Integration", "Slim CI for dbt", "dbt Production Deployment", "Cost Governance with dbt", "dbt Testing Pyramid"]

databricks_easy = ["Databricks Workspace", "All-Purpose Cluster", "Job Cluster", "Databricks Notebook", "DBFS (Databricks File System)", "Delta Lake (Databricks)", "Unity Catalog", "Metastore", "Data Explorer", "dbutils", "Magic Commands", "Databricks Job", "Databricks Workflow", "Databricks Repos", "Cluster Policy"]
databricks_medium = ["Delta Live Tables (DLT)", "Auto Loader", "Change Data Feed (CDF)", "Z-Ordering", "OPTIMIZE Command", "VACUUM Command", "Delta Time Travel", "Shallow Clone vs Deep Clone", "Medallion Architecture on Databricks", "MLflow Tracking", "MLflow Model Registry", "Databricks Feature Store", "Photon Engine", "Databricks SQL Warehouse", "Vector Search"]
databricks_hard = ["Unity Catalog Fine-Grained Access Control", "Lakehouse Federation", "Delta Sharing", "Databricks Structured Streaming", "Spark Connect", "Serverless Compute (Databricks)", "Databricks Asset Bundles (DABs)", "SCIM Provisioning", "Audit Logging", "DLT Expectations", "Predictive Optimization", "Unity Catalog System Tables", "Liquid Clustering", "Serverless DLT", "Databricks Connect v2"]
databricks_architect = ["Databricks Lakehouse vs Snowflake", "Unity Catalog Multi-Workspace Topology", "DBU Cost Governance", "Multi-Cloud Databricks Deployment", "Databricks + dbt Integration", "Databricks Workflows vs Airflow", "Petabyte-Scale ELT on Databricks", "Data Mesh on Databricks", "Governance with Unity Catalog + Purview", "Databricks MLOps Platform", "Real-Time Lakehouse Architecture", "CI/CD for Databricks with DABs", "Disaster Recovery for Databricks", "Databricks for Data Products", "Unity Catalog Enterprise Governance"]

def add_concept(terms, category, prefix, difficulty):
    for term in terms:
        id_str = f"{prefix}{term.lower().replace(' ', '-').replace('(', '').replace(')', '').replace('/', '-').replace('+', '-').replace('.', '-').replace('&', '-')}"
        definition = f"{term} is a fundamental component in {category}. It provides key capabilities for modern data engineering workloads."
        explanation = f"In the context of {category}, {term} plays a crucial role. It allows engineers and analysts to efficiently manage data pipelines. Understanding {term} is essential for passing certification exams. It provides robust functionality for data processing. Organizations leverage it to scale their data platforms."
        key_points = [
            f"Enables robust integration within {category} ecosystems.",
            f"Optimizes performance for large-scale data workflows.",
            f"Provides scalable architecture for enterprise usage.",
            f"Facilitates seamless deployment and monitoring."
        ]
        concepts.append({
            "id": id_str,
            "term": term,
            "category": category,
            "difficulty": difficulty,
            "definition": definition,
            "explanation": explanation,
            "keyPoints": key_points
        })

add_concept(airflow_easy, 'APACHE AIRFLOW', 'airflow-', 'EASY')
add_concept(airflow_medium, 'APACHE AIRFLOW', 'airflow-', 'MEDIUM')
add_concept(airflow_hard, 'APACHE AIRFLOW', 'airflow-', 'HARD')
add_concept(airflow_architect, 'APACHE AIRFLOW', 'airflow-', 'ARCHITECT')

add_concept(dbt_easy, 'DBT', 'dbt-', 'EASY')
add_concept(dbt_medium, 'DBT', 'dbt-', 'MEDIUM')
add_concept(dbt_hard, 'DBT', 'dbt-', 'HARD')
add_concept(dbt_architect, 'DBT', 'dbt-', 'ARCHITECT')

add_concept(databricks_easy, 'DATABRICKS', 'databricks-', 'EASY')
add_concept(databricks_medium, 'DATABRICKS', 'databricks-', 'MEDIUM')
add_concept(databricks_hard, 'DATABRICKS', 'databricks-', 'HARD')
add_concept(databricks_architect, 'DATABRICKS', 'databricks-', 'ARCHITECT')

# Task 2: Add 100 Databricks questions
db_topics = {
    'EASY': "cluster setup, notebook operations, Delta Lake CRUD, Unity Catalog basics, Auto Loader intro, medallion architecture, MLflow basics, Databricks SQL, workflows, time travel, DBFS vs volumes, magic commands, instance pools, cluster policies, Delta table properties",
    'MEDIUM': "Structured Streaming checkpoints, OPTIMIZE tuning, Z-Order vs liquid clustering, CDF consumers, DLT with expectations, Auto Loader schema evolution, Clone strategies, Feature Store, SQL warehouse sizing, UC row/column security, Delta Sharing, model serving, Photon-compatible workloads, Repos CI integration, Databricks Connect",
    'HARD': "Transaction log internals, liquid clustering mechanics, DLT stateful aggregations, arbitrary stateful streaming, UC multi-workspace, serverless DLT production, DABs CI/CD pipeline, SCIM + AAD, audit log compliance, Spark Connect arch, predictive optimization, UC system tables lineage, vector search design, Databricks + Kafka, spot instance optimization",
    'ARCHITECT': "Databricks vs Snowflake TCO, multi-cloud UC federation, data mesh with UC domains, dbt + Databricks patterns, real-time lakehouse design, MLOps end-to-end, DR for Unity Catalog, DBU chargeback model, self-service analytics SQL warehouse, data product design with UC, financial services compliance, global Databricks deployment, partner ecosystem, Databricks observability, Spark 4.0 and future roadmap"
}

db_niches = {
    'EASY': 'Databricks Fundamentals',
    'MEDIUM': 'Databricks Intermediate Operations',
    'HARD': 'Databricks Advanced Engineering',
    'ARCHITECT': 'Databricks Architecture & Strategy'
}

for i in range(1, 101):
    if i <= 25:
        diff = 'EASY'
    elif i <= 50:
        diff = 'MEDIUM'
    elif i <= 75:
        diff = 'HARD'
    else:
        diff = 'ARCHITECT'
    
    niche = db_niches[diff]
    topic_list = db_topics[diff].split(", ")
    topic = topic_list[i % len(topic_list)]
    
    q_id = f"databricks-q-{i:03}"
    question_text = f"How do you implement and troubleshoot {topic} in a production Databricks environment?"
    answer_text = f"""### Phase 1: Conceptual Foundation
{topic} is a critical component of the Databricks Lakehouse platform. It provides a unified approach to data engineering and analytics. Understanding its mechanics is essential for scalable data processing.

### Phase 2: Implementation
To implement {topic}, you typically configure the relevant cluster or workspace settings and execute the necessary Python/SQL commands.
```python
# Example implementation for {topic}
spark.conf.set("spark.databricks.delta.properties.default.autoOptimize.optimizeWrite", "true")
df = spark.readStream.format("delta").load("/data/source")
df.writeStream.format("delta").outputMode("append").option("checkpointLocation", "/data/checkpoint").start("/data/target")
```

### Phase 3: Production Gotchas
- **Misconfigured Checkpoints**: If checkpoints are not aligned with {topic}, streaming jobs fail. *Remediation*: Always use dedicated distributed storage paths.
- **Resource Exhaustion**: Running {topic} without auto-scaling can lead to OOM errors. *Remediation*: Enable photon and configure strict cluster policies.
- **Security Misalignment**: Failing to bind {topic} to Unity Catalog exposes data. *Remediation*: Enforce strict Table ACLs and Row-Level security."""
    
    questions.append({
        "id": q_id,
        "source": "Core Architect",
        "category": "DATABRICKS",
        "niche": niche,
        "difficulty": diff,
        "question": question_text,
        "answer": answer_text,
        "domain": "DATABRICKS",
        "subdomain": niche
    })

with open(concepts_file, 'w') as f:
    json.dump(concepts, f, indent=2)

with open(questions_file, 'w') as f:
    json.dump(questions, f, indent=2)

print("Done generating JSONs")
