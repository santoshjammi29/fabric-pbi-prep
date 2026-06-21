#!/usr/bin/env python3
import json
import os
import random

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
OUTPUT_PATH = os.path.join(PROJECT_ROOT, "data_architecture.js")

TOPICS = [
    {
        "id": "pyspark-optimization",
        "name": "Advanced PySpark & Spark Core Optimization",
        "subjects": [
            "Broadcast Hash Joins", "Adaptive Query Execution (AQE)", "Salting Skewed Keys", 
            "Custom Accumulator Logging", "Kryo Serialization Tuning", "Dynamic Partition Pruning (DPP)", 
            "JVM Garbage Collection Settings", "PySpark UDF Vectorization", "Cache and Persist storage levels", 
            "Shuffle Partition adjustment"
        ],
        "scenarios": [
            "e-commerce clickstream events aggregation", "real-time credit card fraud checking", 
            "nightly batch billing consolidation", "multi-tenant SaaS logs indexing", 
            "historical supply chain simulation", "sensor telemetry anomaly detection",
            "global logistics distribution routes calculation", "ad-tech impression matching"
        ],
        "objectives": [
            "eliminating executor OutOfMemory (OOM) errors", "minimizing cross-node data shuffling", 
            "reducing stage execution latency by 40%", "maximizing cluster CPU utilization", 
            "optimizing storage disk footprint", "preventing garbage collection thrashing"
        ]
    },
    {
        "id": "databricks-lakehouse",
        "name": "Databricks Lakehouse Mastery (Delta Lake, Delta Live Tables)",
        "subjects": [
            "Liquid Clustering layouts", "Delta Live Tables (DLT) expectations", "Change Data Feed (CDF) logging", 
            "Z-Order indexing columns", "Time Travel transaction history", "Vacuum and Optimization routines", 
            "Delta table schema evolution", "Identity column isolation", "Shallow and Deep cloning",
            "Delta sharing open protocol"
        ],
        "scenarios": [
            "financial transaction reconciliation", "customer 360 gold table merges", 
            "live telemetry streaming ingestion", "HIPAA compliant healthcare records storage", 
            "global product inventory tracking", "marketing email campaign metrics aggregation",
            "cross-region analytics sharing", "telecom subscriber network logs ingest"
        ],
        "objectives": [
            "guaranteeing ACID transaction isolation", "optimizing small files write times", 
            "enforcing high-severity data quality constraints", "supporting compliance audits and GDPR deletes", 
            "reducing storage read latencies", "preventing write conflict anomalies"
        ]
    },
    {
        "id": "python-data-architecture",
        "name": "Python for Data Architecture",
        "subjects": [
            "Asynchronous event loops (asyncio)", "Multiprocessing memory isolation", "Pydantic data validation schemas", 
            "Custom memory-mapped file buffers", "Generator-based streaming ingestion", "PyArrow parquet file serialization", 
            "Thread-pool executor tasks", "Retry decorators with exponential backoff", "Memory profiling using tracemalloc",
            "Custom iterator pipelines"
        ],
        "scenarios": [
            "REST API high-concurrency ingestion", "local processing of 50GB CSV archives", 
            "scraping live stock exchange feeds", "multi-threaded database connector pools", 
            "custom file format parsers", "IoT gateway message broker integration",
            "high-throughput image metadata extraction", "on-premise to cloud storage uploaders"
        ],
        "objectives": [
            "minimizing process memory footprints", "avoiding GIL bottlenecks during CPU bounds", 
            "enforcing strict data type compliance", "preventing server rate limit blocks", 
            "maximizing CPU utilization on multi-core hosts", "handling network latency spikes"
        ]
    },
    {
        "id": "modern-architecture",
        "name": "Modern Architecture Paradigms (Lakehouse, Data Mesh, Data Products)",
        "subjects": [
            "Decentralized domain ownership data contracts", "Federated computational governance models", 
            "OneLake shortcut linkages", "Domain-driven micro-lakehouse topologies", "Analytical data product APIs", 
            "Centralized metadata marketplace registries", "Cross-domain ledger security boundaries", 
            "Automated lineage tracing logs", "SaaS data sharing platforms", "Mesh catalog mapping rules"
        ],
        "scenarios": [
            "global merger of two retail chains", "independent marketing and finance data domains", 
            "regulatory risk audit reporting", "multi-tenant analytics product portals", 
            "real-time manufacturing parts inventory mesh", "centralized enterprise catalog registration",
            "global telemetry analysis federation", "cross-departmental billing reports consolidation"
        ],
        "objectives": [
            "enforcing strict data sovereignty requirements", "decoupling central IT bottlenecks", 
            "accelerating domain self-service onboarding", "minimizing cross-domain query latency", 
            "guaranteeing product-level SLA compliance", "preventing data quality degradation"
        ]
    },
    {
        "id": "advanced-data-modeling",
        "name": "Advanced Data Modeling (Kimball Dimensional Modeling, Data Vault 2.0)",
        "subjects": [
            "Data Vault 2.0 Hubs, Links, and Satellites", "SCD Type 2 history tracking", 
            "Bridge tables for many-to-many groups", "Conformed enterprise dimensions", 
            "Non-additive and semi-additive facts", "Data Vault point-in-time tables", 
            "Junk and degenerate dimensions", "Multi-active satellite tables", "Factless fact tables",
            "Outrigger tables mapping"
        ],
        "scenarios": [
            "patient healthcare treatment tracking", "multi-currency banking transaction ledgers", 
            "global employee timesheet databases", "hotel bookings and loyalty reward systems", 
            "telecom subscriber usage summaries", "ERP system supply chain events tracking",
            "e-commerce returns and refund tracing", "multi-region franchise revenue auditing"
        ],
        "objectives": [
            "supporting rapid schema alterations without rebuilds", "guaranteeing auditability of structural changes", 
            "optimizing dimensional join query speeds", "enforcing conformed reporting schemas", 
            "minimizing transaction processing latency", "simplifying logical mapping paths"
        ]
    },
    {
        "id": "storage-compute-tiering",
        "name": "Storage & Compute Tiering Strategies",
        "subjects": [
            "Hot/cool/archive storage tier migration", "Multi-sku compute auto-scaling clusters", 
            "Ephemeral local SSD scratch space", "External table partition metadata sync", 
            "Object lifecycle pruning rules", "Cold data compression optimization", 
            "On-demand serverless SQL pools scaling", "Cross-region storage replication bandwidth",
            "Intelligent storage tier tiering", "Pre-warmed compute resource pools"
        ],
        "scenarios": [
            "regulatory financial reports archiving", "volatile seasonal retail demand tracking", 
            "genomics laboratory raw sequence staging", "high-volume security event logs retention", 
            "global distribution of assets media", "predictive maintenance batch training runs",
            "historical clickstream database archiving", "multi-year IoT history retrieval"
        ],
        "objectives": [
            "reducing cloud storage expenditures by 50%", "eliminating idle compute capacity bills", 
            "maximizing file read throughput times", "guaranteeing high availability SLAs", 
            "preventing network transfer bottlenecks", "satisfying audit compliance windows"
        ]
    },
    {
        "id": "realtime-streaming",
        "name": "Real-Time Data Streaming (Azure Event Hubs, Apache Kafka, Azure Stream Analytics)",
        "subjects": [
            "Kafka consumer partition offset committing", "Event time vs processing time watermarks", 
            "Stream Analytics sliding window aggregates", "Kafka producer idempotency settings", 
            "Event Hubs capture file layouts", "Dead-letter-queue (DLQ) poison routing", 
            "Stream backpressure flow throttle", "Exactly-once end-to-end transactions",
            "Kafka Connect schema integrations", "Avro schema registry mapping"
        ],
        "scenarios": [
            "urban traffic control sensor networks", "live sports betting odds calculation", 
            "real-time online server diagnostics telemetry", "payment processing fraud alerts engine", 
            "connected vehicles geo-tracking feeds", "critical hospital monitors streaming",
            "smart grid electric consumption tracking", "automated logistics warehouse movements"
        ],
        "objectives": [
            "reducing stream delivery latency below 50ms", "preventing consumer offset lag accumulation", 
            "guaranteeing zero data loss on broker failure", "filtering and routing out-of-order logs", 
            "handling abrupt spike patterns in throughput", "minimizing network message payload size"
        ]
    },
    {
        "id": "mpp-multimodel-db",
        "name": "Massive Parallel Processing (MPP) & Multi-Model Databases (Dedicated SQL pools, Azure Cosmos DB)",
        "subjects": [
            "Cosmos DB partition key design", "Dedicated SQL pool hash distribution keys", 
            "Cosmos DB change feed consumers", "Replicated tables and materialized views", 
            "Multi-master database write replication", "Dedicated SQL pools columnstore indexes", 
            "Request unit (RU) auto-scale throttling", "Polybase external table parallel loads",
            "Dedicated SQL pools hash-join optimizations", "Cosmos DB multi-region latency tuning"
        ],
        "scenarios": [
            "global gaming leaderboards updates", "high-concurrency e-commerce shopping carts", 
            "enterprise data warehouse migrations", "real-time logistics route optimizations", 
            "corporate accounting ledger aggregations", "multi-tenant SaaS profile storage",
            "global fleet vehicle location tracking", "high-volume airline reservation systems"
        ],
        "objectives": [
            "eliminating partition skew and hot spots", "keeping Dedicated SQL query execution quick", 
            "supporting horizontal scale-out of transactional writes", "minimizing database request unit (RU) costs", 
            "accelerating mass loading operations", "enforcing local region read compliance"
        ]
    },
    {
        "id": "power-platform-governance",
        "name": "Enterprise Power Platform Integration & Governance",
        "subjects": [
            "Data Loss Prevention (DLP) environment policies", "Power Automate custom connector gateways", 
            "Dataverse virtual tables mapping", "Managed solutions deployment environments", 
            "Tenant-level analytics dashboard reports", "Power Apps component framework (PCF) widgets", 
            "API limit monitoring alerts", "On-premises data gateway configurations",
            "Power Apps Canvas offline synchronization", "Center of Excellence (CoE) Starter Kit auditing"
        ],
        "scenarios": [
            "automated expense approval flows", "frontline employee field diagnostics apps", 
            "corporate audit log collection systems", "external customer portal integrations", 
            "multi-department equipment inventory logs", "hybrid cloud database sync pipelines",
            "departmental customer support portals", "real-time warehouse scanner integrations"
        ],
        "objectives": [
            "preventing unauthorized data exfiltration leaks", "guaranteeing zero downtime during release cycles", 
            "minimizing API requests consumption overhead", "securing legacy on-premise system databases", 
            "automating enterprise environment provisioning", "monitoring shadow IT deployment footprints"
        ]
    },
    {
        "id": "llm-rag-pipelines",
        "name": "LLM & RAG Infrastructure Pipelines",
        "subjects": [
            "Embedding chunk overlapping policies", "Document parsing document extraction filters", 
            "Hybrid dense-sparse retrieval queries", "Re-ranking model pipeline configurations", 
            "Semantic query cache layers", "Metadata filtering key injection", 
            "Conversational memory persistence stores", "Asynchronous LLM API call batches",
            "Vector database partition filters", "Context summary windowing strategies"
        ],
        "scenarios": [
            "internal corporate knowledge base assistants", "automated legal contract compliance reviews", 
            "customer support ticket triage routing", "medical research publication indexing", 
            "financial analysis report summarization", "multi-language documentation bots",
            "patent filing duplicate detection systems", "HR policy retrieval conversational search"
        ],
        "objectives": [
            "minimizing LLM generation hallucinations", "reducing retrieval latency below 200ms", 
            "preserving user-level data security permissions", "minimizing model token utilization costs", 
            "handling dynamic changes to source files", "guaranteeing multi-lingual context coherence"
        ]
    },
    {
        "id": "vector-databases",
        "name": "Vector Databases (Pinecone, Milvus)",
        "subjects": [
            "HNSW index graph link parameters", "IVF-PQ vector quantization codes", 
            "Metadata index partitioning strategies", "Cosine vs dot-product metric filters", 
            "Dynamic index segment compaction", "Vector data shard replica management", 
            "Real-time upsert and query pipelines", "Bulk-loading vector index dumps",
            "Filtered search index caches", "Milvus collection partition splits"
        ],
        "scenarios": [
            "image similarity search systems", "recommendation engine profile matching", 
            "duplicate record deduplication engines", "large scale document search archives", 
            "genomic sequence pattern match systems", "personalized shopping item embeddings",
            "voice biomarker diagnostics matchers", "reverse image e-commerce matchers"
        ],
        "objectives": [
            "maximizing search recall accuracy scores", "reducing index RAM consumption by 60%", 
            "keeping query response latencies under 15ms", "supporting high-frequency vector updates", 
            "minimizing storage read-write charges", "ensuring zero search downtime during reindexing"
        ]
    },
    {
        "id": "ai-orchestration",
        "name": "AI Orchestration Frameworks (LangGraph, LangChain)",
        "subjects": [
            "LangGraph state graph loops", "Agentic tool routing branches", 
            "LangChain memory buffer persistence", "Runnable sequence chaining pipelines", 
            "Model fallback routing strategies", "Agent human-in-the-loop approvals", 
            "Custom output parsing schemas", "Structured routing agents",
            "LangGraph subgraph modular layouts", "Agent session persistence caches"
        ],
        "scenarios": [
            "autonomous software engineer agents", "complex customer onboarding workflows", 
            "market research analyst pipelines", "automated database migration orchestrators", 
            "personalized email campaign builders", "enterprise threat hunting diagnostics",
            "automated customer billing disputes resolver", "multi-agent compliance check teams"
        ],
        "objectives": [
            "terminating runaway recursive agent loops", "parsing JSON/YAML outputs in a structured format", 
            "handling API timeout errors gracefully", "ensuring deterministic tool call execution", 
            "tracing execution steps for audit logs", "managing state values across long conversations"
        ]
    },
    {
        "id": "infrastructure-as-code",
        "name": "Infrastructure as Code (IaC) (Terraform, Azure Bicep)",
        "subjects": [
            "Terraform state locking and backends", "Bicep modular resource declarations", 
            "Terraform dynamic block declarations", "IaC secrets management integrations", 
            "Multi-environment workspace deployments", "Custom resource provider configurations", 
            "Infrastructure drift detection sweeps", "Terraform resource lifecycle policies",
            "Terraform plan validation rules", "Bicep target scope configurations"
        ],
        "scenarios": [
            "provisioning disaster recovery environments", "multi-tenant workspace deployment pipelines", 
            "securing private virtual network topologies", "scaling cloud data platforms dynamically", 
            "onboarding new business unit resources", "ephemeral sandbox development environments",
            "multi-region database replica provisioning", "corporate security policy compliance audits"
        ],
        "objectives": [
            "preventing resource state corruption risks", "enforcing strict resource tag compliance", 
            "reducing infrastructure deployment time", "avoiding exposing private API keys", 
            "preventing accidental deletions of data", "enforcing budget control quotas programmatically"
        ]
    },
    {
        "id": "enterprise-cicd",
        "name": "Enterprise CI/CD Pipelines (Azure DevOps, GitHub Actions)",
        "subjects": [
            "Self-hosted runner autoscaling pools", "Multi-stage deployment approvals", 
            "Dynamic pipeline variable expansion", "Automated rollback release strategies", 
            "Security scan and compliance checks", "Parallel build stage optimization", 
            "Caching dependency packages folders", "Infrastructure integration testing tasks",
            "OIDC federation connection setups", "Triggers and branch filter configurations"
        ],
        "scenarios": [
            "publishing Python packages repositories", "deploying cloud data warehouse schemas", 
            "building Docker containers registries", "updating live analytics reports code", 
            "releasing microservice backend updates", "orchestrating global application upgrades",
            "running regression tests nightly", "building multi-arch docker packages"
        ],
        "objectives": [
            "reducing release cycle time by 50%", "preventing broken builds reaching prod", 
            "enforcing strict static analysis checks", "protecting production secret keys", 
            "optimizing CI/CD compute resource costs", "ensuring compliance audits logs retention"
        ]
    },
    {
        "id": "data-governance-catalog",
        "name": "Enterprise Data Governance & Cataloging (Microsoft Purview, Databricks Unity Catalog)",
        "subjects": [
            "Automated lineage tracing sweeps", "Sensitive data classification definitions", 
            "Glossary terms mapping directories", "External table schema sync tasks", 
            "Cross-catalog share security models", "Catalog search indexing performance", 
            "Governance audit dashboard reports", "Data stewardship approvals workflows",
            "Databricks Unity Catalog system schemas", "Purview self-hosted integration runtime setups"
        ],
        "scenarios": [
            "identifying GDPR personal data locations", "merging metadata from diverse warehouses", 
            "onboarding new department databases", "publishing certified datasets stores", 
            "generating enterprise lineage maps", "governing external client shares",
            "tracking dynamic views column security", "auditing third-party data extraction jobs"
        ],
        "objectives": [
            "ensuring compliance with data laws", "accelerating business user dataset discovery", 
            "eliminating catalog sync timeouts", "enforcing consistent metadata taxonomy", 
            "monitoring database access logs audit", "preventing unauthorized classification changes"
        ]
    },
    {
        "id": "advanced-data-security",
        "name": "Advanced Data Security (Row-Level Security, Column-Level Security, Dynamic Data Masking)",
        "subjects": [
            "Security policy dynamic filter functions", "AAD security group role mappings", 
            "Data masking rule regex exclusions", "Encryption key rotation access vaults", 
            "Cross-database view security models", "Database audit log analytics tracking", 
            "Granular schema access grant policies", "Tokenized columns storage wrappers",
            "SQL Server dynamic data masking configs", "Cosmos DB encrypted field properties"
        ],
        "scenarios": [
            "protecting customer credit card data", "restricting regional sales reports views", 
            "preventing access to employee salary details", "securing medical records dashboards", 
            "sharing transactional tables third parties", "limiting admin database root controls",
            "governing multi-tenant SaaS schema access", "anonymizing PII logs before shipping"
        ],
        "objectives": [
            "enforcing strict privacy regulations", "minimizing database execution overhead", 
            "preventing administrator privilege escalation", "securing data files rest backup", 
            "simplifying database role governance", "preventing client-side extraction leaks"
        ]
    }
]

def make_code_snippet(topic_id, subject):
    subject_lower = subject.lower()
    
    if "pyspark" in topic_id:
        if "broadcast" in subject_lower:
            return (
                "from pyspark.sql.functions import broadcast\n"
                "# Force Spark to broadcast the small dimension table\n"
                "df_joined = df_large.join(broadcast(df_small), 'client_id', 'inner')\n"
                "df_joined.write.mode('overwrite').parquet('/mnt/gold/sales_summary')"
            )
        elif "aqe" in subject_lower:
            return (
                "spark.conf.set('spark.sql.adaptive.enabled', 'true')\n"
                "spark.conf.set('spark.sql.adaptive.coalescePartitions.enabled', 'true')\n"
                "spark.conf.set('spark.sql.adaptive.skewJoin.enabled', 'true')\n"
                "df_result = df_a.join(df_b, 'transaction_id')"
            )
        elif "salt" in subject_lower:
            return (
                "from pyspark.sql.functions import lit, concat, rand\n"
                "# Add salt to distribute hot skewed keys\n"
                "df_skewed = df_skewed.withColumn('salt_key', concat(df_skewed.key, lit('_'), (rand()*10).cast('int')))\n"
                "df_joined = df_skewed.join(df_salted_dim, 'salt_key')"
            )
        else:
            return (
                "from pyspark.sql import SparkSession\n"
                "spark = SparkSession.builder.appName('CoreOptimization')\\\n"
                "    .config('spark.serializer', 'org.apache.spark.serializer.KryoSerializer')\\\n"
                "    .config('spark.sql.shuffle.partitions', '200')\\\n"
                "    .getOrCreate()\n"
                "df = spark.read.parquet('/mnt/silver/raw_telemetry')"
            )
            
    elif "lakehouse" in topic_id:
        if "clustering" in subject_lower:
            return (
                "-- Databricks Delta table Liquid Clustering layout\n"
                "CREATE TABLE gold.sensor_data (\n"
                "    sensor_id STRING, read_time TIMESTAMP, temperature DOUBLE\n"
                ") USING DELTA CLUSTER BY (sensor_id, DATE(read_time));"
            )
        elif "dlt" in subject_lower:
            return (
                "import dlt\n"
                "@dlt.table(comment='Cleaned transaction ledger data')\n"
                "@dlt.expect_or_drop('valid_amount', 'amount > 0')\n"
                "def silver_transactions():\n"
                "    return dlt.read('bronze_transactions').filter('status = \"approved\"')"
            )
        else:
            return (
                "ALTER TABLE silver.customer_profiles SET TBLPROPERTIES (\n"
                "    'delta.enableChangeDataFeed' = 'true',\n"
                "    'delta.minReaderVersion' = '2',\n"
                "    'delta.minWriterVersion' = '5'\n"
                ");\n"
                "-- OPTIMIZE silver.customer_profiles ZORDER BY (update_date);"
            )
            
    elif "python-data" in topic_id:
        if "async" in subject_lower:
            return (
                "import asyncio, aiohttp\n"
                "async def fetch_item(session, url):\n"
                "    async with session.get(url) as response:\n"
                "        return await response.json()\n"
                "async def fetch_all(urls):\n"
                "    async with aiohttp.ClientSession() as s:\n"
                "        return await asyncio.gather(*[fetch_item(s, u) for u in urls])"
            )
        elif "pydantic" in subject_lower:
            return (
                "from pydantic import BaseModel, Field, field_validator\n"
                "class Transaction(BaseModel):\n"
                "    id: str = Field(..., min_length=12)\n"
                "    amount: float = Field(..., gt=0.0)\n"
                "    @field_validator('id')\n"
                "    def validate_id(cls, v):\n"
                "        assert v.startswith('TXN'), 'Must be a valid TXN ID'\n"
                "        return v"
            )
        else:
            return (
                "import pyarrow.parquet as pq\n"
                "import pyarrow as pa\n"
                "table = pa.Table.from_pandas(df_payload)\n"
                "pq.write_to_dataset(table, root_path='/data/archives/',\\\n"
                "    partition_cols=['year', 'month'], compression='SNAPPY')"
            )
            
    elif "modern-architecture" in topic_id:
        return (
            "{\n"
            "  \"$schema\": \"https://specs.dataproducts.org/v1/contract.json\",\n"
            "  \"dataProductId\": \"urn:retail:sales:gold_reporting\",\n"
            "  \"owner\": \"domain-sales-team\",\n"
            "  \"schema\": {\n"
            "    \"fields\": [\n"
            "      { \"name\": \"transaction_id\", \"type\": \"string\" },\n"
            "      { \"name\": \"total_amount\", \"type\": \"decimal(18,2)\" }\n"
            "    ]\n"
            "  }\n"
            "}"
        )
        
    elif "modeling" in topic_id:
        return (
            "-- DDL definition for Data Vault 2.0 Hub and Link mapping\n"
            "CREATE TABLE vault.hub_customer (\n"
            "    hk_customer BINARY(32) PRIMARY KEY,\n"
            "    customer_id VARCHAR(50) NOT NULL,\n"
            "    load_datetime TIMESTAMP NOT NULL,\n"
            "    record_source VARCHAR(20) NOT NULL\n"
            ");"
        )
        
    elif "tiering" in topic_id:
        return (
            "# AWS CLI command to configure storage tier lifecycle policy\n"
            "aws s3api put-bucket-lifecycle-configuration \\\n"
            "    --bucket gold-reporting-lakehouse \\\n"
            "    --lifecycle-configuration file://lifecycle_rules.json"
        )
        
    elif "streaming" in topic_id:
        if "watermark" in subject_lower:
            return (
                "SELECT System.Timestamp AS WindowEnd, sensor_id, COUNT(*)\n"
                "FROM telemetry_stream TIMESTAMP BY event_time\n"
                "GROUP BY sensor_id, TumblingWindow(Duration(minute, 5), Delay(minute, 2))"
            )
        else:
            return (
                "from confluent_kafka import Producer\n"
                "conf = {\n"
                "    'bootstrap.servers': 'kafka.eventhubs.azure.net:9093',\n"
                "    'acks': 'all',\n"
                "    'enable.idempotence': True\n"
                "}\n"
                "producer = Producer(conf)\n"
                "producer.produce('telemetry-topic', key='sensor-12', value='payload')"
            )
            
    elif "mpp" in topic_id:
        if "pool" in subject_lower or "dedicated" in subject_lower:
            return (
                "CREATE TABLE dw.gold_fact_sales (\n"
                "    sale_key INT NOT NULL, customer_id INT NOT NULL, total_sales DECIMAL(18,2)\n"
                ")\n"
                "WITH (\n"
                "    DISTRIBUTION = HASH(customer_id),\n"
                "    CLUSTERED COLUMNSTORE INDEX\n"
                ");"
            )
        else:
            return (
                "// Azure Cosmos DB SQL API partitioning request options\n"
                "PartitionKey partitionKey = new PartitionKey(\"sensor-region-west\");\n"
                "ItemResponse<TelemetryItem> response = await container.ReadItemAsync<TelemetryItem>(\n"
                "    \"item-102\", partitionKey\n"
                ");"
            )
            
    elif "power-platform" in topic_id:
        return (
            "// Power Apps Component Framework (PCF) manifest schema snippet\n"
            "<control namespace=\"Governance\" constructor=\"DataGateway\"\n"
            "    version=\"1.0.0\" display-name-key=\"OnPremiseGateway\">\n"
            "    <property name=\"ConnectionURI\" of-type=\"SingleLine.Text\" required=\"true\" />\n"
            "</control>"
        )
        
    elif "llm-rag" in topic_id:
        return (
            "def split_text_overlapping(text, chunk_size=500, overlap=100):\n"
            "    chunks = []\n"
            "    start = 0\n"
            "    while start < len(text):\n"
            "        end = start + chunk_size\n"
            "        chunks.append(text[start:end])\n"
            "        start += chunk_size - overlap\n"
            "    return chunks"
        )
        
    elif "vector" in topic_id:
        return (
            "import pinecone\n"
            "pc = pinecone.Pinecone(api_key='your-api-key')\n"
            "index = pc.Index('gold-embeddings')\n"
            "results = index.query(\n"
            "    vector=[0.12] * 1536,\n"
            "    filter={'region': {'$eq': 'EU'}},\n"
            "    top_k=5\n"
            ")"
        )
        
    elif "ai-orchestration" in topic_id:
        return (
            "from langgraph.graph import StateGraph, END\n"
            "workflow = StateGraph(AgentState)\n"
            "workflow.add_node('agent', call_model)\n"
            "workflow.add_node('tool', call_tool)\n"
            "workflow.add_conditional_edges('agent', should_continue, {'continue': 'tool', 'end': END})\n"
            "app = workflow.compile()"
        )
        
    elif "infrastructure-as-code" in topic_id:
        return (
            "# Terraform script to provision secure storage account\n"
            "resource \"azurerm_storage_account\" \"data_lake\" {\n"
            "  name                     = \"stgoldreportingprod\"\n"
            "  resource_group_name      = azurerm_resource_group.rg.name\n"
            "  location                 = azurerm_resource_group.rg.location\n"
            "  account_tier             = \"Standard\"\n"
            "  account_replication_type = \"GRS\"\n"
            "}"
        )
        
    elif "enterprise-cicd" in topic_id:
        return (
            "# GitHub Actions workflow validation step\n"
            "name: Validate schema changes\n"
            "on: [pull_request]\n"
            "jobs:\n"
            "  validate:\n"
            "    runs-on: self-hosted-runners-pool\n"
            "    steps:\n"
            "      - uses: actions/checkout@v3\n"
            "      - run: python -m pytest tests/integration_checks.py"
        )
        
    elif "data-governance-catalog" in topic_id:
        return (
            "-- Unity Catalog dynamic grant options\n"
            "GRANT SELECT, EXECUTE ON CATALOG gold_reporting\n"
            "TO `sales_analytics_consumers`;\n"
            "ALTER TABLE gold_reporting.analytics.sales_data\n"
            "SET OWNER TO `central_governance_admin`;"
        )
        
    else: # security
        return (
            "-- SQL Database dynamic row level filter policy\n"
            "CREATE FUNCTION security.fn_securitypredicate(@Region AS sysname)\n"
            "    RETURNS TABLE\n"
            "WITH SCHEMABINDING\n"
            "AS\n"
            "    RETURN SELECT 1 AS fn_securitypredicate_result\n"
            "    WHERE DATABASE_PRINCIPAL_ID() = 'db_owner' OR @Region = USER_NAME();"
        )

def generate_answer(topic, difficulty, index, question, subject, scenario, objective):
    ans_parts = []
    
    # Phase 1: Conceptual Foundation & Core Architecture
    p1 = f"### Phase 1: Conceptual Foundation & Core Architecture\n"
    p1 += f"Deploying **{subject}** within an enterprise environment running **{scenario}** requires addressing the main challenges related to **{objective}**. "
    if difficulty == "EASY":
        p1 += (
            f"At a high level, {subject} allows the data platform to optimize logical paths by organizing the table layout and partition indexes appropriately. "
            f"This prevents the compute engine from having to run full scans on massive datasets. In the context of {scenario}, "
            f"this ensures that everyday query processing runs in a predictable, isolated environment. To achieve {objective}, "
            f"it is vital to implement the basic configuration correctly and avoid common setup mistakes."
        )
    elif difficulty == "MEDIUM":
        p1 += (
            f"To implement this, the architecture must balance storage configurations and network throughput. "
            f"Utilizing {subject} maps the files to logical layout nodes which the executors scan in parallel. "
            f"For {scenario}, this reduces the dependency on large shuffles across the cluster. "
            f"Specifically, to hit the target for {objective}, we need to adjust the defaults of the session configuration, "
            f"setting correct allocation limits to handle spikes in workload traffic without triggering engine lockouts."
        )
    else: # HARD
        p1 += (
            f"At scale, this requires an advanced configuration that overrides the default cluster behavior to prevent skew. "
            f"With {subject}, we design a distributed topology where data is routed based on high-cardinality keys. "
            f"In the context of {scenario}, the design must isolate execution threads and prevent write locks. "
            f"To achieve {objective}, the cluster's JVM memory footprints or container resource boundaries must be explicitly constrained. "
            f"This isolates failure domains, ensures linear scalability, and prevents multi-tenant query contention."
        )
    ans_parts.append(p1)
    
    # Phase 2: Low-Level Mechanics & Implementation
    p2 = f"### Phase 2: Low-Level Mechanics & Implementation\n"
    p2 += "Implementing this pattern requires the following setup steps and configuration files:\n\n"
    p2 += "1. **Logical Setup**: Bind the session context or initialize the client using the parameters specified.\n"
    p2 += "2. **Implementation Snippet**:\n"
    p2 += f"```{'python' if 'python' in topic['id'] or 'pyspark' in topic['id'] or 'orchestration' in topic['id'] or 'llm' in topic['id'] else 'sql'}\n"
    p2 += make_code_snippet(topic["id"], subject) + "\n"
    p2 += "```\n"
    p2 += f"3. **Tuning Parameter Values**: Set the thresholds (e.g. timeout settings to 300s, buffer sizes to 64MB) to align with performance budgets."
    ans_parts.append(p2)
    
    # Phase 3: Production Hardening & Gotchas
    p3 = f"### Phase 3: Production Hardening & Gotchas\n"
    p3 += "In a production environment, several failure states can cause this design to degrade:\n\n"
    
    gotchas = [
        f"**Out-of-Memory (OOM) Errors**: If the data size exceeds buffer parameters, the process will crash. *Remediation*: Scale memory allocation and set strict limit guards.",
        f"**Schema Drift Failures**: Upstream columns might change dynamically, causing processing loops to break. *Remediation*: Deploy a strict verification check using a registry schema validation framework.",
        f"**Network Latency Contention**: Cross-region transfers can hit bandwidth boundaries under high loads. *Remediation*: Enable local caching and partition data to align with region nodes."
    ]
    p3 += "\n".join([f"- {g}" for g in gotchas])
    ans_parts.append(p3)
    
    return "\n\n".join(ans_parts)

def build_questions():
    records = []
    
    for topic in TOPICS:
        topic_id = topic["id"]
        topic_name = topic["name"]
        
        subjects = topic["subjects"]
        scenarios = topic["scenarios"]
        objectives = topic["objectives"]
        
        # Easy
        for i in range(50):
            subj = subjects[i % len(subjects)]
            scen = scenarios[i % len(scenarios)]
            obj = objectives[i % len(objectives)]
            
            question_text = f"What is the recommended approach to configure {subj} for {scen} to achieve {obj}?"
            
            q_id = f"arch-{topic_id}-easy-{i+1}"
            answer_text = generate_answer(topic, "EASY", i+1, question_text, subj, scen, obj)
            
            records.append({
                "id": q_id,
                "source": "Architecture Hub",
                "category": topic_name,
                "niche": f"{subj} Core Principles",
                "difficulty": "EASY",
                "question": question_text,
                "answer": answer_text
            })
            
        # Medium
        for i in range(50):
            subj = subjects[(i + 3) % len(subjects)]
            scen = scenarios[(i + 2) % len(scenarios)]
            obj = objectives[(i + 1) % len(objectives)]
            
            question_text = f"How do you implement and tune {subj} in a pipeline processing {scen} when facing {obj} constraints?"
            
            q_id = f"arch-{topic_id}-medium-{i+1}"
            answer_text = generate_answer(topic, "MEDIUM", i+1, question_text, subj, scen, obj)
            
            records.append({
                "id": q_id,
                "source": "Architecture Hub",
                "category": topic_name,
                "niche": f"{subj} Implementation",
                "difficulty": "MEDIUM",
                "question": question_text,
                "answer": answer_text
            })
            
        # Hard
        for i in range(50):
            subj = subjects[(i + 7) % len(subjects)]
            scen = scenarios[(i + 5) % len(scenarios)]
            obj = objectives[(i + 4) % len(objectives)]
            
            question_text = f"Detail the production-grade architecture design for {subj} within {scen} that satisfies {obj} SLA constraints. What are the key failure remediation gotchas?"
            
            q_id = f"arch-{topic_id}-hard-{i+1}"
            answer_text = generate_answer(topic, "HARD", i+1, question_text, subj, scen, obj)
            
            records.append({
                "id": q_id,
                "source": "Architecture Hub",
                "category": topic_name,
                "niche": f"{subj} Advanced Architecture",
                "difficulty": "HARD",
                "question": question_text,
                "answer": answer_text
            })
            
    print(f"Total questions created in memory: {len(records)}")
    return records

def main():
    records = build_questions()
    
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        f.write("window.ARCHITECTURE_DATA = ")
        json.dump(records, f, indent=2, ensure_ascii=False)
        f.write(";\n")
        
    print(f"SUCCESS: Written {len(records)} questions to {OUTPUT_PATH}")

if __name__ == '__main__':
    main()
