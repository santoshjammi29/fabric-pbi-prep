"""
Data Definition: 52 Tier 1 FAANG & BigTech Company Profiles
Each record contains verified tech stack, real interview rubrics, salary benchmarks (USD + INR),
GCC/Tech hubs, system design archetypes, and real production interview prompts.
"""

BIGTECH_PROFILES = [
    {
        "id": "google",
        "name": "Google (Alphabet)",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Mountain View, CA / New York / Bengaluru / Hyderabad",
        "hiringGCCLocations": ["Bengaluru", "Hyderabad", "Pune", "Gurugram"],
        "topicKey": "gcp",
        "seniorDeSalary": "$240k - $360k (₹65L - ₹1.1Cr)",
        "architectSalary": "$380k - $580k (₹1.2Cr - ₹2.4Cr)",
        "systemDesignArchetype": "Global Spanner Multi-Region Replication & Millisecond BigQuery BI Engine",
        "stack": ["BigQuery", "Cloud Spanner", "Apache Beam / Dataflow", "Cloud Pub/Sub", "Colossus", "Flume / Borg", "Dremel"],
        "interviewFocus": [
            "Dataflow watermarking, allowed lateness, and session window triggers",
            "Cloud Spanner TrueTime API and Paxos consensus across continental zones",
            "BigQuery dynamic slot reservation vs autoscaling optimization",
            "Petabyte-scale table partitioning and clustering without full scan degradation"
        ],
        "keyChallenges": "Processing exabytes of search clickstream and YouTube video telemetry with zero data loss under strict SLA deadlines.",
        "sampleQuestions": [
            "Design a globally distributed analytics pipeline for YouTube live stream metrics handling 50M concurrent viewers with sliding 10-second aggregations.",
            "Architect a real-time ad billing and impressions deduplication engine on Apache Beam and Spanner with exactly-once idempotency guarantees."
        ]
    },
    {
        "id": "microsoft",
        "name": "Microsoft (Fabric & Azure Data)",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Redmond, WA / Sunnyvale / Hyderabad / Bengaluru",
        "hiringGCCLocations": ["Hyderabad", "Bengaluru", "Noida"],
        "topicKey": "microsoft",
        "seniorDeSalary": "$220k - $330k (₹55L - ₹90L)",
        "architectSalary": "$340k - $500k (₹1.0Cr - ₹1.8Cr)",
        "systemDesignArchetype": "OneLake Direct Lake Zero-ETL Semantic Ingestion & Fabric Capacity Sizing",
        "stack": ["Microsoft Fabric", "Direct Lake", "Azure Synapse", "OneLake", "Delta Lake", "ADLS Gen2", "Azure Data Factory"],
        "interviewFocus": [
            "Direct Lake VertiPaq memory mapping over OneLake Delta Parquet files",
            "ADF Managed VNet Integration Runtime security and high-throughput CDC",
            "Fabric Capacity Unit (CU) burst smoothing, throttling, and auto-pause strategies",
            "Multi-tenant Delta transaction log concurrent append conflict resolution"
        ],
        "keyChallenges": "Unifying disparate enterprise silos into OneLake with sub-second Power BI Direct Lake report execution.",
        "sampleQuestions": [
            "Design a zero-copy data mesh on Microsoft Fabric OneLake connecting SAP ERP, Salesforce, and Azure SQL with fine-grained column masking.",
            "Architect an auto-scaling data ingestion backbone using Event Hubs, Azure Stream Analytics, and Delta Lake handling 200,000 events/second."
        ]
    },
    {
        "id": "amazon-aws",
        "name": "Amazon / AWS",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Seattle, WA / Arlington, VA / Bengaluru / Hyderabad",
        "hiringGCCLocations": ["Bengaluru", "Hyderabad", "Chennai", "Pune"],
        "topicKey": "aws",
        "seniorDeSalary": "$230k - $350k (₹60L - ₹95L)",
        "architectSalary": "$360k - $540k (₹1.1Cr - ₹2.1Cr)",
        "systemDesignArchetype": "Global E-Commerce Event Ordering & Redshift Serverless Data Sharing",
        "stack": ["Amazon Redshift", "AWS EMR (Spark)", "Amazon Kinesis", "AWS Glue", "S3 Lake Formation", "DynamoDB Streams", "Apache Iceberg"],
        "interviewFocus": [
            "Kinesis shard splitting, hot shard mitigation, and enhanced fan-out consumers",
            "AWS Glue auto-scaling DPUs with dynamic catalog partitions",
            "Redshift distribution keys (KEY, ALL, EVEN) and sort key pruning optimization",
            "Lake Formation fine-grained table access control and S3 prefix request distribution"
        ],
        "keyChallenges": "Ensuring deterministic global package tracking and pricing updates during Prime Day spikes exceeding 150M RPS.",
        "sampleQuestions": [
            "Design a distributed ledger ingestion pipeline for Amazon Pay processing 100k transactions/sec with zero ledger discrepancies.",
            "Architect an enterprise data lake migration from Redshift cluster storage to Apache Iceberg on Amazon S3 with Athena/EMR query parity."
        ]
    },
    {
        "id": "meta",
        "name": "Meta (Facebook)",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Menlo Park, CA / Seattle / London / Bengaluru",
        "hiringGCCLocations": ["Bengaluru", "Gurugram", "Hyderabad"],
        "topicKey": "spark",
        "seniorDeSalary": "$250k - $380k (₹70L - ₹1.2Cr)",
        "architectSalary": "$400k - $620k (₹1.3Cr - ₹2.6Cr)",
        "systemDesignArchetype": "Exabyte Graph Social Telemetry & Scuba Real-Time Slicing Engine",
        "stack": ["Presto / Trino", "Apache Spark", "XStream / Scribe", "RocksDB", "Hive / Gorilla", "Scuba", "PyTorch DataPipes"],
        "interviewFocus": [
            "Presto coordinator query planning, dynamic filtering, and worker memory pool spill",
            "Trino split generation across exabyte partition catalogs",
            "Spark shuffle service optimization and z-order indexing on distributed cold storage",
            "High-frequency feature store generation for real-time recommendation rankers"
        ],
        "keyChallenges": "Querying billions of social connections and live reel view counts in sub-seconds while enforcing user privacy boundaries.",
        "sampleQuestions": [
            "Design a real-time notifications engagement scoring pipeline on Kafka and Flink with stateful user activity TTLs.",
            "Architect an ML feature generation lakehouse converting 50TB/hr of raw engagement logs into vector embeddings for Reels recommendation."
        ]
    },
    {
        "id": "apple",
        "name": "Apple",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Cupertino, CA / Austin, TX / Bengaluru / Hyderabad",
        "hiringGCCLocations": ["Bengaluru", "Hyderabad"],
        "topicKey": "sql",
        "seniorDeSalary": "$230k - $340k (₹60L - ₹95L)",
        "architectSalary": "$350k - $520k (₹1.1Cr - ₹1.9Cr)",
        "systemDesignArchetype": "Private Device Telemetry Ingestion & Differential Privacy Lakehouse",
        "stack": ["Apache Spark", "Apache Iceberg", "Apache Kafka", "Cassandra", "Kubernetes", "AWS S3 / GCP", "Trino"],
        "interviewFocus": [
            "Differential privacy noise injection and anonymization in telemetry streams",
            "Apache Iceberg metadata compaction and snapshot lifecycle management",
            "Zero-downtime Cassandra cluster migrations and tombstone purging",
            "Spark memory tuning for skew joins on Apple Music search logs"
        ],
        "keyChallenges": "Collecting analytics from 2 billion active hardware devices without compromising strict user privacy guarantees.",
        "sampleQuestions": [
            "Design an iCloud sync telemetry monitoring platform detecting sync failures across iOS/macOS devices with differential privacy noise injection.",
            "Architect a real-time fraud scoring pipeline for App Store in-app purchases with sub-50ms latency."
        ]
    },
    {
        "id": "netflix",
        "name": "Netflix",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Los Gatos, CA / Remote / Mumbai",
        "hiringGCCLocations": ["Remote / Mumbai Hub"],
        "topicKey": "datalake",
        "seniorDeSalary": "$260k - $400k (₹75L - ₹1.3Cr)",
        "architectSalary": "$420k - $650k (₹1.4Cr - ₹2.8Cr)",
        "systemDesignArchetype": "Global Video Streaming Telemetry & Keystone Real-Time Stream Engine",
        "stack": ["Apache Iceberg (Creators)", "Apache Flink", "Apache Kafka (Keystone)", "AWS S3", "Spark", "Trino", "Metacat"],
        "interviewFocus": [
            "Apache Iceberg manifest file rewrites, partition evolution, and hidden partitioning",
            "Flink checkpointing, RocksDB state backend, and unaligned checkpoints",
            "Keystone stream router failover and multi-region S3 replication",
            "Trino pushdown predicates and dynamic partition pruning over S3"
        ],
        "keyChallenges": "Ingesting 1+ trillion events daily to dynamically adjust video bitrates and optimize CDN cache placement worldwide.",
        "sampleQuestions": [
            "Design Netflix's video playback Quality of Experience (QoE) monitoring pipeline processing 10M events/sec to trigger automated CDN rerouting.",
            "Architect an Apache Iceberg table management service that autonomously triggers file compaction and orphan file deletions without locking writers."
        ]
    },
    {
        "id": "uber",
        "name": "Uber",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Francisco, CA / Bengaluru / Hyderabad",
        "hiringGCCLocations": ["Bengaluru", "Hyderabad"],
        "topicKey": "kafka",
        "seniorDeSalary": "$220k - $340k (₹58L - ₹92L)",
        "architectSalary": "$350k - $520k (₹1.1Cr - ₹1.9Cr)",
        "systemDesignArchetype": "Geospatial H3 Geospatial Ingestion & Real-Time Dynamic Surge Pricing",
        "stack": ["Apache Hudi (Creators)", "Apache Flink", "Kafka (Chaperone)", "H3 Hexagonal Index", "Presto", "Spark", "Pinot"],
        "interviewFocus": [
            "Apache Hudi Copy-on-Write vs Merge-on-Read indexing strategies",
            "H3 geospatial grid indexing for low-latency rider-driver matching queries",
            "Apache Pinot real-time segments and multi-stage query engine",
            "Dynamic surge pricing computation with sliding 60-second window state in Flink"
        ],
        "keyChallenges": "Calculating hyper-local surge pricing and driver availability across millions of geospatial cells updated every 5 seconds.",
        "sampleQuestions": [
            "Design a real-time driver ETA calculation and route-deviation telemetry engine using Apache Flink and H3 geospatial hexagons.",
            "Architect a CDC ingestion framework converting MySQL trips data into an Apache Hudi lakehouse with sub-minute query readiness."
        ]
    },
    {
        "id": "airbnb",
        "name": "Airbnb",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Francisco, CA / Remote / Gurugram",
        "hiringGCCLocations": ["Remote / Gurugram"],
        "topicKey": "airflow",
        "seniorDeSalary": "$210k - $330k (₹52L - ₹85L)",
        "architectSalary": "$340k - $490k (₹1.0Cr - ₹1.7Cr)",
        "systemDesignArchetype": "Airflow DAG Orchestration Ecosystem & Minerva Metric Semantic Store",
        "stack": ["Apache Airflow (Creators)", "Apache Spark", "Minerva (Semantic Layer)", "Trino", "Apache Iceberg", "Druid", "AWS S3"],
        "interviewFocus": [
            "Airflow scheduler internals, dag file parsing loop, and Celery / K8s executors",
            "Minerva unified metric repository: standardizing metrics across batch & streaming",
            "Spark data skew mitigation using salting and broadcast hash joins",
            "Search ranking feature extraction pipeline with strict SLA backfills"
        ],
        "keyChallenges": "Orchestrating 10,000+ daily Airflow DAGs with zero scheduler lag and consistent business metrics across mobile and web.",
        "sampleQuestions": [
            "Design an Airflow multi-tenant pipeline orchestrator with dynamic task mapping, automated SLA alerts, and automatic backfill deduplication.",
            "Architect a centralized metrics platform (Minerva) that serves both sub-second dashboards and ML batch feature training from a single definition."
        ]
    },
    {
        "id": "stripe",
        "name": "Stripe",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Francisco, CA / Dublin / Bengaluru / Remote",
        "hiringGCCLocations": ["Bengaluru", "Remote"],
        "topicKey": "finops",
        "seniorDeSalary": "$240k - $370k (₹65L - ₹1.1Cr)",
        "architectSalary": "$390k - $590k (₹1.3Cr - ₹2.3Cr)",
        "systemDesignArchetype": "Financial Ledger Double-Entry Streaming & Zero-Discrepancy Reconciliation",
        "stack": ["Apache Kafka", "Flink", "Presto / Trino", "Iceberg", "Scala", "PostgreSQL", "AWS S3"],
        "interviewFocus": [
            "Exactly-once processing semantics with Kafka transactional producers and 2-phase commit",
            "Double-entry bookkeeping validation in high-throughput streaming pipelines",
            "Deterministic distributed ledger state replication across AWS regions",
            "Presto query acceleration for enterprise merchant financial reporting"
        ],
        "keyChallenges": "Processing billions in global transactions with zero floating-point errors, zero duplicates, and real-time fraud mitigation.",
        "sampleQuestions": [
            "Design a financial ledger transaction reconciliation pipeline comparing card network settlement files against internal payment records.",
            "Architect a real-time merchant credit risk scoring pipeline that computes rolling chargeback ratios over 30-day sliding windows."
        ]
    },
    {
        "id": "databricks",
        "name": "Databricks",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Francisco, CA / Bengaluru / Remote",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "databricks",
        "seniorDeSalary": "$240k - $360k (₹65L - ₹1.1Cr)",
        "architectSalary": "$380k - $550k (₹1.2Cr - ₹2.2Cr)",
        "systemDesignArchetype": "Delta Lake Multi-Engine ACID Serialization & Photon Vectorized Execution",
        "stack": ["Apache Spark 4.0", "Delta Lake", "Photon C++ Engine", "Unity Catalog", "Scala", "Rust", "Vector Search"],
        "interviewFocus": [
            "Deep Spark Tungsten off-heap memory layout and binary cache line alignment",
            "Catalyst physical optimizer rules, cost-based optimization, and dynamic code generation",
            "Liquid clustering vs hierarchical Z-Ordering file pruning algorithms",
            "Distributed consensus and multi-cluster Delta transaction log serialization"
        ],
        "keyChallenges": "Building petabyte-scale multi-tenant execution planning with sub-second metadata operations across thousands of customer clusters.",
        "sampleQuestions": [
            "Design an automated clustering and compaction engine that monitors Delta commit logs and restructures Parquet layouts without read downtime.",
            "Architect a low-latency metadata serving cache for Unity Catalog supporting 100,000 queries per second over billions of data assets."
        ]
    },
    {
        "id": "snowflake",
        "name": "Snowflake",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Bozeman, MT / San Mateo, CA / Pune / Bengaluru",
        "hiringGCCLocations": ["Pune", "Bengaluru"],
        "topicKey": "snowflake",
        "seniorDeSalary": "$230k - $340k (₹60L - ₹95L)",
        "architectSalary": "$350k - $520k (₹1.1Cr - ₹1.9Cr)",
        "systemDesignArchetype": "Decoupled Multi-Cluster Compute & Open Iceberg Polaris Catalog",
        "stack": ["Apache Iceberg", "FoundationDB", "Polaris Catalog", "Snowpark Python", "C++", "AWS S3 / Azure Blob", "Search Engine"],
        "interviewFocus": [
            "Micro-partition metadata pruning, clustering depths, and search optimization service",
            "Virtual warehouse multi-cluster concurrency scaling and queuing behavior",
            "Iceberg catalog metadata snapshot isolation and Polaris open catalog governance",
            "Zero-copy data sharing architecture across cross-cloud accounts"
        ],
        "keyChallenges": "Maintaining instant scale-out of isolated virtual warehouses without local disk state while keeping query startup times under 50ms.",
        "sampleQuestions": [
            "Design a multi-cloud disaster recovery replication strategy for Snowflake accounts across AWS us-east-1 and Azure East US with RPO < 5 minutes.",
            "Architect a high-throughput streaming ingestion pipeline using Snowpipe Streaming API achieving sub-second query latency from Kafka."
        ]
    },
    {
        "id": "palantir",
        "name": "Palantir Technologies",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Denver, CO / New York / Remote",
        "hiringGCCLocations": ["Remote / Global Hubs"],
        "topicKey": "architecture",
        "seniorDeSalary": "$220k - $340k (₹58L - ₹90L)",
        "architectSalary": "$350k - $520k (₹1.1Cr - ₹1.9Cr)",
        "systemDesignArchetype": "Foundry Ontology Data Fabric & Secure Defense-Grade Lineage",
        "stack": ["Palantir Foundry", "Apache Spark", "Apollo Platform", "PostgreSQL", "Kafka", "Elasticsearch", "C++"],
        "interviewFocus": [
            "Ontology object graph mapping over heterogeneous relational and unstructured stores",
            "Fine-grained classification markings, cell-level security, and audit trails",
            "Deterministic incremental data branch computation in Foundry datasets",
            "Spark job optimization for complex recursive graph traversals"
        ],
        "keyChallenges": "Integrating messy siloed government and enterprise datasets into a secure, bidirectional semantic ontology in real time.",
        "sampleQuestions": [
            "Design a defense-grade supply chain intelligence pipeline that reconciles part manifests across 50 legacy ERP systems with cell-level RBAC.",
            "Architect an incremental ontology graph sync system that computes downstream impact whenever an entity attribute changes."
        ]
    },
    {
        "id": "salesforce",
        "name": "Salesforce (Data Cloud)",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Francisco, CA / Hyderabad / Bengaluru",
        "hiringGCCLocations": ["Hyderabad", "Bengaluru"],
        "topicKey": "datalake",
        "seniorDeSalary": "$210k - $320k (₹50L - ₹82L)",
        "architectSalary": "$330k - $480k (₹95L - ₹1.6Cr)",
        "systemDesignArchetype": "Customer Data Platform (CDP) Identity Resolution & Zero-Copy Federation",
        "stack": ["Salesforce Data Cloud", "Apache Spark", "Iceberg / Delta", "Kafka", "Trino", "Tableau Hyper", "AWS EKS"],
        "interviewFocus": [
            "Deterministic and probabilistic identity resolution algorithms for customer entity linking",
            "Zero-copy data sharing federation with Snowflake, BigQuery, and Databricks",
            "Kafka event ingestion pipelines handling millions of customer interactions per minute",
            "High-concurrency query dispatching for real-time marketing segmentation"
        ],
        "keyChallenges": "Unifying billions of disparate customer profile records and interaction events into a single real-time golden record.",
        "sampleQuestions": [
            "Design an identity resolution pipeline that deduplicates customer records across web, mobile, and CRM channels using graph connected components.",
            "Architect a zero-copy data federation layer between Salesforce Data Cloud and an external Snowflake data warehouse."
        ]
    },
    {
        "id": "oracle",
        "name": "Oracle (Cloud Infrastructure - OCI)",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Austin, TX / Bengaluru / Hyderabad",
        "hiringGCCLocations": ["Bengaluru", "Hyderabad", "Noida"],
        "topicKey": "sql",
        "seniorDeSalary": "$190k - $290k (₹45L - ₹75L)",
        "architectSalary": "$300k - $450k (₹85L - ₹1.5Cr)",
        "systemDesignArchetype": "OCI Autonomous Data Warehouse & Exadata RDMA Storage Engine",
        "stack": ["OCI Autonomous DW", "Oracle GoldenGate", "Spark on OCI", "OCI Streaming (Kafka API)", "Exadata", "Object Storage"],
        "interviewFocus": [
            "GoldenGate real-time zero-loss CDC capture from Oracle RAC databases",
            "Autonomous Data Warehouse auto-indexing and Exadata Smart Scan offloading",
            "OCI Object Storage multipart upload performance and multi-region replication",
            "Distributed query tuning on Oracle Exadata RDMA fabric"
        ],
        "keyChallenges": "Migrating mission-critical on-premises Oracle databases to OCI Autonomous Data Warehouse with zero downtime.",
        "sampleQuestions": [
            "Design a zero-downtime database replication pipeline using Oracle GoldenGate and OCI Streaming to feed an analytical lakehouse.",
            "Architect an auto-partitioning analytical database layout on OCI Autonomous DW handling 50TB daily transactional increments."
        ]
    },
    {
        "id": "cisco",
        "name": "Cisco Systems",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Jose, CA / Bengaluru / Remote",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "kafka",
        "seniorDeSalary": "$185k - $280k (₹42L - ₹70L)",
        "architectSalary": "$290k - $430k (₹80L - ₹1.4Cr)",
        "systemDesignArchetype": "Global Network Packet Telemetry & Real-Time Threat Anomaly Detection",
        "stack": ["Apache Kafka", "Apache Spark", "Elasticsearch", "Cassandra", "Druid", "Kubernetes", "AWS / OpenStack"],
        "interviewFocus": [
            "High-throughput NetFlow and IPFIX telemetry ingestion via Kafka",
            "Streaming anomaly detection algorithms on network packet header logs",
            "Elasticsearch cluster sharding and hot-warm-cold lifecycle tiers",
            "Distributed time-series aggregation for enterprise network switches"
        ],
        "keyChallenges": "Ingesting and indexing 100+ million network telemetry packets per second to identify cybersecurity anomalies in real time.",
        "sampleQuestions": [
            "Design a real-time network intrusion detection pipeline processing NetFlow records across 10,000 edge routers.",
            "Architect a multi-tiered time-series observability database storing 90 days of switch telemetry with sub-second query response."
        ]
    },
    {
        "id": "adobe",
        "name": "Adobe (Experience Platform - AEP)",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Jose, CA / Noida / Bengaluru",
        "hiringGCCLocations": ["Noida", "Bengaluru"],
        "topicKey": "datalake",
        "seniorDeSalary": "$200k - $310k (₹48L - ₹78L)",
        "architectSalary": "$310k - $470k (₹90L - ₹1.6Cr)",
        "systemDesignArchetype": "Experience Data Model (XDM) Lakehouse & Real-Time Profile Activation",
        "stack": ["Adobe Experience Platform", "Apache Spark", "Apache Iceberg", "Kafka", "Azure Cosmos DB", "Kubernetes", "Delta Lake"],
        "interviewFocus": [
            "Experience Data Model (XDM) schema validation and evolution",
            "Sub-50ms customer edge profile lookups from distributed key-value stores",
            "Spark job optimization for segment population calculation over billions of profiles",
            "Streaming audience qualification using stateful Flink / Kafka streams"
        ],
        "keyChallenges": "Evaluating millions of complex audience segmentation rules against real-time user clickstream events under 100ms.",
        "sampleQuestions": [
            "Design an audience segmentation pipeline that recomputes user segment membership within 500ms of an e-commerce action.",
            "Architect an XDM-compliant multi-tenant ingestion gateway handling schema validation and sanitization for 50,000 customer websites."
        ]
    },
    {
        "id": "nvidia",
        "name": "NVIDIA",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Santa Clara, CA / Bengaluru / Pune / Hyderabad",
        "hiringGCCLocations": ["Bengaluru", "Pune", "Hyderabad"],
        "topicKey": "ai",
        "seniorDeSalary": "$240k - $370k (₹65L - ₹1.1Cr)",
        "architectSalary": "$380k - $570k (₹1.2Cr - ₹2.3Cr)",
        "systemDesignArchetype": "RAPIDS GPU-Accelerated ETL & Distributed Model Training Data Pipelines",
        "stack": ["RAPIDS cuDF / cuML", "Apache Spark (Spark-RAPIDS)", "Ray", "Triton Inference Server", "Alluxio", "NVLink / InfiniBand", "Kafka"],
        "interviewFocus": [
            "Spark-RAPIDS GPU acceleration plugin: offloading joins and shuffles to CUDA cores",
            "GPUDirect Storage (GDS) bypassing CPU memory during high-throughput Parquet reads",
            "Distributed data sharding and DataLoader optimization for multi-node LLM training",
            "Ray Core vs Spark for distributed reinforcement learning data prep"
        ],
        "keyChallenges": "Feeding thousands of H100/B200 GPU clusters with petabytes of training tokens without causing GPU compute starvation.",
        "sampleQuestions": [
            "Design a GPU-accelerated data preprocessing pipeline using Spark-RAPIDS to transform 50TB of raw text into tokenized LLM training tensors.",
            "Architect a distributed memory cache tier using Alluxio and GPUDirect Storage to eliminate disk I/O bottlenecks in deep learning training."
        ]
    },
    {
        "id": "intel",
        "name": "Intel Corporation",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Santa Clara, CA / Bengaluru / Remote",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "spark",
        "seniorDeSalary": "$180k - $270k (₹40L - ₹68L)",
        "architectSalary": "$280k - $420k (₹75L - ₹1.3Cr)",
        "systemDesignArchetype": "Semiconductor Silicon Telemetry & Factory Automated Yield Analytics",
        "stack": ["Apache Spark", "Apache Kafka", "Cassandra", "PostgreSQL", "Grafana / InfluxDB", "Kubernetes", "Python"],
        "interviewFocus": [
            "Silicon wafer test telemetry time-series storage and sub-micron defect correlation",
            "Spark streaming for fab machine anomaly detection",
            "Cassandra data modeling for high-write industrial sensor streams",
            "Kafka partition strategies for high-frequency fab tool sensor feeds"
        ],
        "keyChallenges": "Processing terabytes of real-time wafer fab sensor logs per minute to catch semiconductor manufacturing defects instantly.",
        "sampleQuestions": [
            "Design an industrial IoT sensor ingestion pipeline for semiconductor cleanrooms with sub-second spike detection.",
            "Architect a multi-petabyte time-series lakehouse for hardware reliability testing spanning 5 years of processor telemetry."
        ]
    },
    {
        "id": "amd",
        "name": "AMD",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Santa Clara, CA / Austin, TX / Bengaluru / Hyderabad",
        "hiringGCCLocations": ["Bengaluru", "Hyderabad"],
        "topicKey": "spark",
        "seniorDeSalary": "$180k - $270k (₹40L - ₹68L)",
        "architectSalary": "$280k - $420k (₹75L - ₹1.3Cr)",
        "systemDesignArchetype": "Silicon Simulation Telemetry Lakehouse & EDA Compute Farms",
        "stack": ["Apache Spark", "PostgreSQL", "Kafka", "ClickHouse", "Docker / K8s", "Python", "Airflow"],
        "interviewFocus": [
            "Electronic Design Automation (EDA) simulation log indexing and regression triage",
            "ClickHouse column storage for high-speed hardware simulation diagnostics",
            "Large-scale distributed task scheduling across hybrid on-prem / cloud compute grids",
            "Spark SQL partition optimization for billion-row hardware test suites"
        ],
        "keyChallenges": "Analyzing petabytes of chip verification waveforms and test simulations across millions of nightly server farm runs.",
        "sampleQuestions": [
            "Design a distributed log aggregation engine for 50,000 nightly hardware verification test jobs.",
            "Architect a ClickHouse analytical backend powering real-time regression dashboards for silicon design engineers."
        ]
    },
    {
        "id": "bytedance",
        "name": "ByteDance (TikTok)",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Singapore / San Jose, CA / London / Remote",
        "hiringGCCLocations": ["Singapore / Remote"],
        "topicKey": "flink",
        "seniorDeSalary": "$240k - $370k (₹65L - ₹1.1Cr)",
        "architectSalary": "$390k - $580k (₹1.2Cr - ₹2.3Cr)",
        "systemDesignArchetype": "Billion-User Short Video Engagement Stream & Real-Time Recommendation Ranker",
        "stack": ["Apache Flink (World's Largest Cluster)", "Apache Kafka", "ByteDance Las (Lakehouse)", "RocksDB", "ClickHouse", "HDFS / Cloud"],
        "interviewFocus": [
            "Running massive 100,000-core Flink stateful jobs without checkpoint timeouts",
            "Incremental RocksDB state checkpoints and rapid failover recovery",
            "Real-time feature engineering: calculating user swiping affinity within 20ms",
            "ClickHouse sharding and distributed table optimization for live stream analytics"
        ],
        "keyChallenges": "Maintaining sub-50ms recommendation feature calculation for over 1 billion active TikTok users simultaneously.",
        "sampleQuestions": [
            "Design a real-time short video recommendation feature generator processing 20M video watch events/sec with sliding 5-minute decay windows.",
            "Architect a Flink-based live stream viewer gift and comment aggregation engine that handles sudden 100x traffic surges during viral streams."
        ]
    },
    {
        "id": "x-twitter",
        "name": "X (formerly Twitter)",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Francisco, CA / Austin, TX / Remote",
        "hiringGCCLocations": ["Remote"],
        "topicKey": "kafka",
        "seniorDeSalary": "$220k - $340k (₹58L - ₹92L)",
        "architectSalary": "$340k - $500k (₹1.0Cr - ₹1.8Cr)",
        "systemDesignArchetype": "Global Firehose Stream Fan-Out & Low-Latency Timeline Reconstruction",
        "stack": ["Apache Kafka", "Apache Spark", "Presto", "Manhattan (Distributed KV)", "GCP BigQuery", "Scala", "Kubernetes"],
        "interviewFocus": [
            "Kafka fan-out partition architecture for celebrity accounts with 100M+ followers",
            "Manhattan distributed key-value store consistency and cache eviction policies",
            "BigQuery cost optimization for multi-tenant internal analytics",
            "Streaming impression counting with hyperloglog cardinality estimation"
        ],
        "keyChallenges": "Delivering real-time posts from high-follower accounts to hundreds of millions of user home timelines within 1 second.",
        "sampleQuestions": [
            "Design a real-time trending topic detector that identifies viral hashtags within 60 seconds while discarding bot spam.",
            "Architect a timeline generation service fan-out pipeline balancing push vs pull models for standard users vs mega-influencers."
        ]
    },
    {
        "id": "linkedin",
        "name": "LinkedIn",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Sunnyvale, CA / Bengaluru / Dublin",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "kafka",
        "seniorDeSalary": "$220k - $330k (₹55L - ₹90L)",
        "architectSalary": "$340k - $510k (₹1.0Cr - ₹1.8Cr)",
        "systemDesignArchetype": "Apache Kafka Birthplace Architecture & Apache Pinot Real-Time OLAP",
        "stack": ["Apache Kafka (Creators)", "Apache Pinot (Creators)", "Apache Gobblin", "Apache Spark", "Venice KV", "Hadoop / Azure"],
        "interviewFocus": [
            "Kafka partition leadership election, ISR list mechanics, and zero-copy transfer",
            "Apache Pinot star-tree index generation and low-latency slice-and-dice queries",
            "Gobblin distributed data ingestion framework for Kafka-to-Data-Lake pipeline",
            "Venice derived data serving store for high-throughput machine learning rankers"
        ],
        "keyChallenges": "Powering 'Who Viewed Your Profile' and feed analytics with sub-second latency over hundreds of billions of social graph edges.",
        "sampleQuestions": [
            "Design the 'Who Viewed My Profile' real-time analytics engine using Apache Pinot and Kafka with privacy opt-out filtering.",
            "Architect a unified ingestion platform (like Gobblin) that transfers 50TB/hr of Kafka topics into an Azure Delta Lakehouse."
        ]
    },
    {
        "id": "pinterest",
        "name": "Pinterest",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Francisco, CA / Remote",
        "hiringGCCLocations": ["Remote"],
        "topicKey": "datalake",
        "seniorDeSalary": "$210k - $320k (₹52L - ₹85L)",
        "architectSalary": "$330k - $490k (₹95L - ₹1.6Cr)",
        "systemDesignArchetype": "Visual Search Graph & Terabyte-Scale Pin Recommendation Lakehouse",
        "stack": ["Apache Spark", "Apache Flink", "RocksDB", "AWS S3", "StarRocks", "Airflow", "Kafka"],
        "interviewFocus": [
            "Graph-based visual search feature store pipelines",
            "StarRocks real-time OLAP engine for advertiser campaign analytics",
            "Flink stateful stream processing for real-time pin click-through rate updates",
            "Cost optimization on multi-petabyte AWS S3 storage tiers"
        ],
        "keyChallenges": "Generating personalized visual discovery feeds for 500M+ monthly users across billions of saved visual pins.",
        "sampleQuestions": [
            "Design a real-time visual recommendation pipeline that updates candidate feed pins based on the user's last 5 interactions.",
            "Architect an ad campaign analytics engine on StarRocks serving sub-second dashboard queries for thousands of advertisers."
        ]
    },
    {
        "id": "spotify",
        "name": "Spotify",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Stockholm / New York / London / Remote",
        "hiringGCCLocations": ["Remote / London Hub"],
        "topicKey": "gcp",
        "seniorDeSalary": "$210k - $330k (₹52L - ₹86L)",
        "architectSalary": "$330k - $490k (₹95L - ₹1.6Cr)",
        "systemDesignArchetype": "Global Music Streaming Royalty Settlement & Scio / Beam Event Pipelines",
        "stack": ["Scio (Scala on Beam)", "Google Cloud BigQuery", "Cloud Bigtable", "Cloud Pub/Sub", "PostgreSQL", "Flyte / Airflow"],
        "interviewFocus": [
            "Scio / Beam streaming pipeline design and session windowing for audio track plays",
            "BigQuery cost optimization: query partitioning, clustering, and bi-engine acceleration",
            "Cloud Bigtable row key schema design for user listening history lookups",
            "Streaming track play counting with exact deduplication for artist royalty payments"
        ],
        "keyChallenges": "Accurately auditing and calculating monthly royalty payouts for millions of artists across 600M+ active listeners.",
        "sampleQuestions": [
            "Design the Spotify Wrapped annual data aggregation pipeline processing 365 days of user listening events with extreme accuracy.",
            "Architect a real-time song skip and completion tracking pipeline that feeds playlist personalization models within 10 seconds."
        ]
    },
    {
        "id": "snap",
        "name": "Snap Inc.",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Santa Monica, CA / Remote",
        "hiringGCCLocations": ["Remote"],
        "topicKey": "gcp",
        "seniorDeSalary": "$220k - $340k (₹58L - ₹92L)",
        "architectSalary": "$340k - $510k (₹1.0Cr - ₹1.8Cr)",
        "systemDesignArchetype": "Ephemeral Media Telemetry & Real-Time Ad Attribution Pipeline",
        "stack": ["GCP BigQuery", "AWS S3 / DynamoDB", "Apache Spark", "Apache Flink", "Kafka", "Temporal"],
        "interviewFocus": [
            "Multi-cloud data architecture across Google Cloud and Amazon Web Services",
            "Real-time ad attribution and conversion tracking with privacy-preserving SKAdNetwork",
            "Handling extreme diurnal traffic spikes during global events on ephemeral media",
            "Temporal workflows for long-running data backfills and machine learning workflows"
        ],
        "keyChallenges": "Balancing ephemeral media strict auto-deletion policies while extracting aggregated ad engagement metrics.",
        "sampleQuestions": [
            "Design an ephemeral media view counter pipeline that purges message content after 24 hours while retaining aggregated metrics.",
            "Architect a cross-cloud multi-region ad attribution engine ensuring zero conversion loss during regional cloud outages."
        ]
    },
    {
        "id": "doordash",
        "name": "DoorDash",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Francisco, CA / Remote",
        "hiringGCCLocations": ["Remote"],
        "topicKey": "snowflake",
        "seniorDeSalary": "$210k - $320k (₹52L - ₹84L)",
        "architectSalary": "$330k - $480k (₹95L - ₹1.6Cr)",
        "systemDesignArchetype": "Hyper-Local Delivery Logistics & Real-Time Driver ETA Routing",
        "stack": ["Snowflake", "Apache Flink", "Apache Kafka", "CockroachDB", "Databricks / Spark", "Airflow"],
        "interviewFocus": [
            "Real-time restaurant prep time and Dasher transit time feature store calculations",
            "Snowflake query warehouse sizing and auto-suspend optimization for business operations",
            "Kafka event streaming for order status transitions and delivery dispatching",
            "CDC replication from operational CockroachDB to Snowflake analytical lakehouse"
        ],
        "keyChallenges": "Predicting exact delivery arrival times within minutes by dynamically fusing traffic, kitchen prep, and weather data.",
        "sampleQuestions": [
            "Design a real-time order matching and batching engine that bundles nearby customer food deliveries without violating delivery SLAs.",
            "Architect a CDC data pipeline replicating high-volume delivery status updates from CockroachDB to Snowflake with sub-2 minute latency."
        ]
    },
    {
        "id": "instacart",
        "name": "Instacart",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Francisco, CA / Remote",
        "hiringGCCLocations": ["Remote"],
        "topicKey": "snowflake",
        "seniorDeSalary": "$210k - $320k (₹50L - ₹82L)",
        "architectSalary": "$320k - $470k (₹90L - ₹1.5Cr)",
        "systemDesignArchetype": "Grocery Catalog Entity Matching & Real-Time Out-of-Stock Predictor",
        "stack": ["Snowflake", "dbt", "Apache Spark", "Kafka", "Airflow", "PostgreSQL", "AWS S3"],
        "interviewFocus": [
            "dbt project modularity, incremental models, and automated schema tests",
            "Entity resolution algorithms matching retail grocery barcodes across different store chains",
            "Real-time item replacement recommendation models based on store inventory",
            "Snowflake zero-copy cloning for staging test environments"
        ],
        "keyChallenges": "Maintaining accurate real-time inventory and pricing for millions of grocery items across tens of thousands of physical supermarkets.",
        "sampleQuestions": [
            "Design a real-time out-of-stock prediction pipeline that flags unavailable items to shoppers before they add them to cart.",
            "Architect a dbt transformation architecture that processes daily grocery catalog feeds from 500 retail partners with data contract enforcement."
        ]
    },
    {
        "id": "coinbase",
        "name": "Coinbase",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Remote-First / San Francisco, CA / Bengaluru",
        "hiringGCCLocations": ["Remote / Bengaluru"],
        "topicKey": "finops",
        "seniorDeSalary": "$220k - $340k (₹58L - ₹92L)",
        "architectSalary": "$350k - $520k (₹1.1Cr - ₹1.9Cr)",
        "systemDesignArchetype": "Cryptocurrency Blockchain Node Ingestion & Real-Time AML Monitoring",
        "stack": ["Apache Spark", "Apache Flink", "AWS DynamoDB", "Snowflake", "Kafka", "Databricks", "Go"],
        "interviewFocus": [
            "High-throughput blockchain block and transaction ingestion across 50+ EVM / non-EVM chains",
            "Anti-Money Laundering (AML) graph traversal detecting tainted wallet clusters in real time",
            "Distributed ledger transaction reconciliation against internal exchange cold/hot wallets",
            "FinOps: Optimizing petabyte-scale on-chain raw trace data storage costs"
        ],
        "keyChallenges": "Indexing unfinalized blockchain blocks while handling chain re-organizations (reorgs) without corrupting balance ledgers.",
        "sampleQuestions": [
            "Design a blockchain block indexing pipeline that detects and rolls back analytical state during deep 10-block re-organizations.",
            "Architect a real-time crypto transaction monitoring engine that flags sanctioned wallet interactions within 500ms."
        ]
    },
    {
        "id": "openai",
        "name": "OpenAI",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Francisco, CA / London / Remote",
        "hiringGCCLocations": ["Remote"],
        "topicKey": "ai",
        "seniorDeSalary": "$270k - $420k (₹80L - ₹1.4Cr)",
        "architectSalary": "$450k - $750k (₹1.6Cr - ₹3.2Cr)",
        "systemDesignArchetype": "Trillion-Token Web Pre-Training Deduplication & Multi-Tenant RLHF Lakehouse",
        "stack": ["Ray", "Apache Spark", "Azure Blob / ADLS Gen2", "Milvus / Qdrant", "PostgreSQL", "Triton", "Rust"],
        "interviewFocus": [
            "Distributed MinHash and LSH deduplication across multi-terabyte web scrape datasets",
            "Tokenizer efficiency and byte-pair encoding pipeline optimization",
            "Ray data pipelines feeding thousands of GPU nodes across Azure clusters",
            "Low-latency vector similarity indexing and prompt-completion feedback loop storage"
        ],
        "keyChallenges": "Deduplicating and filtering trillions of web tokens while keeping pipeline throughput high enough to saturate 10,000+ GPUs.",
        "sampleQuestions": [
            "Design an exabyte-scale web scraping and deduplication pipeline utilizing MinHash LSH to filter toxic and duplicate training documents.",
            "Architect a real-time telemetry and safety evaluation pipeline auditing millions of live LLM completions per second."
        ]
    },
    {
        "id": "anthropic",
        "name": "Anthropic",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Francisco, CA / London / Remote",
        "hiringGCCLocations": ["Remote"],
        "topicKey": "ai",
        "seniorDeSalary": "$260k - $400k (₹75L - ₹1.3Cr)",
        "architectSalary": "$420k - $680k (₹1.4Cr - ₹2.9Cr)",
        "systemDesignArchetype": "Constitutional AI Synthetic Data Generation & GPU Sharded Ingestion",
        "stack": ["Ray", "Apache Spark", "AWS S3 / GCP", "Rust", "Vector DBs", "Kubernetes", "PyTorch"],
        "interviewFocus": [
            "Synthetic data generation workflows and automated safety feedback loops",
            "Ray Core actor architecture for high-throughput distributed embedding generation",
            "Zero-loss ingestion of prompt evaluation traces for model alignment",
            "Cost-effective storage of multi-turn conversational evaluation trees"
        ],
        "keyChallenges": "Generating and filtering millions of high-quality synthetic reasoning chains without model collapse or data poisoning.",
        "sampleQuestions": [
            "Design a distributed synthetic conversation generation pipeline that orchestrates model critics to filter output quality in parallel.",
            "Architect a high-performance vector caching and semantic deduplication tier for Claude API queries."
        ]
    },
    {
        "id": "elastic",
        "name": "Elastic (Elasticsearch)",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Mountain View, CA / Remote-First",
        "hiringGCCLocations": ["Remote / India"],
        "topicKey": "sql",
        "seniorDeSalary": "$200k - $310k (₹48L - ₹78L)",
        "architectSalary": "$310k - $470k (₹90L - ₹1.6Cr)",
        "systemDesignArchetype": "Inverted Index Distributed Sharding & Searchable Object Storage Tiers",
        "stack": ["Elasticsearch", "Lucene", "Logstash / Beats", "Kibana", "Kafka", "Cloud Object Storage", "Java / Rust"],
        "interviewFocus": [
            "Lucene segment merging, doc values, and inverted index memory structures",
            "Elasticsearch master node quorum, cluster state publishing, and shard routing",
            "Frozen and searchable snapshot tiers on cloud object storage (S3/GCS)",
            "Handling index mapping explosions and nested document performance"
        ],
        "keyChallenges": "Querying petabytes of historical logs stored directly on cloud object storage with near-instant sub-second query performance.",
        "sampleQuestions": [
            "Design an enterprise logging architecture ingesting 10TB/day of JSON logs with automatic hot-to-frozen shard migration.",
            "Architect a hybrid keyword and dense vector semantic search pipeline balancing recall vs search latency."
        ]
    },
    {
        "id": "confluent",
        "name": "Confluent",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Mountain View, CA / Bengaluru / Remote",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "kafka",
        "seniorDeSalary": "$220k - $330k (₹55L - ₹90L)",
        "architectSalary": "$340k - $500k (₹1.0Cr - ₹1.8Cr)",
        "systemDesignArchetype": "Kora Cloud-Native Apache Kafka Engine & Schema Registry Governance",
        "stack": ["Apache Kafka (Kora)", "Confluent Schema Registry", "ksqlDB", "Flink on Confluent", "Tiered Storage (S3)", "Java"],
        "interviewFocus": [
            "Kafka Raft (KRaft) metadata quorum protocol without Zookeeper dependency",
            "Tiered storage architecture: separating compute brokers from long-term S3 object segments",
            "Schema Registry schema compatibility modes (BACKWARD, FORWARD, FULL)",
            "Multi-tenant cluster rebalancing and automated partition reassignment"
        ],
        "keyChallenges": "Operating thousands of multi-tenant managed Kafka clusters with 99.99% uptime and zero cluster rebalance degradation.",
        "sampleQuestions": [
            "Design a multi-region active-active Kafka replication architecture using Cluster Linking with deterministic consumer offset translation.",
            "Architect a stream processing pipeline on Confluent Cloud Flink that enforces Avro schema validation and dead letter queue routing."
        ]
    },
    {
        "id": "mongodb",
        "name": "MongoDB",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "New York, NY / Bengaluru / Remote",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "sql",
        "seniorDeSalary": "$200k - $310k (₹48L - ₹80L)",
        "architectSalary": "$320k - $480k (₹92L - ₹1.6Cr)",
        "systemDesignArchetype": "Distributed Document Sharding & WiredTiger Storage Engine",
        "stack": ["MongoDB Atlas", "WiredTiger Engine", "Atlas Data Federation", "Kafka Connector", "AWS / Azure / GCP", "C++ / Go"],
        "interviewFocus": [
            "WiredTiger cache eviction, checkpointing, and ticket queue concurrency",
            "Ranged vs hashed shard keys and preventing jumbo chunks during rapid write scaling",
            "Atlas Data Lake query execution across S3 parquet and live MongoDB collections",
            "Change streams architecture for real-time downstream event replication"
        ],
        "keyChallenges": "Ensuring zero-downtime shard rebalancing and balancing chunk migrations across global multi-cloud Atlas clusters.",
        "sampleQuestions": [
            "Design a global multi-cloud MongoDB Atlas architecture that replicates customer orders across AWS and Azure with local read preference.",
            "Architect a change-stream-driven CDC pipeline feeding an analytics warehouse with schema drift resilience."
        ]
    },
    {
        "id": "twilio",
        "name": "Twilio",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Francisco, CA / Bengaluru / Remote",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "kafka",
        "seniorDeSalary": "$190k - $290k (₹44L - ₹74L)",
        "architectSalary": "$300k - $450k (₹85L - ₹1.5Cr)",
        "systemDesignArchetype": "Global Telecom Call Detail Record (CDR) Ingestion & Delivery Tracking",
        "stack": ["Apache Kafka", "Apache Spark", "Apache Flink", "AWS DynamoDB", "Snowflake", "Presto", "Java"],
        "interviewFocus": [
            "High-throughput Call Detail Record (CDR) ingestion and carrier delivery receipts",
            "Rate limiting and token bucket throttling in distributed SMS dispatch pipelines",
            "Real-time carrier latency monitoring and dynamic routing failovers",
            "Snowflake analytical models for enterprise communication usage billing"
        ],
        "keyChallenges": "Processing billions of SMS, voice, and WhatsApp delivery events per day with second-level latency transparency.",
        "sampleQuestions": [
            "Design a real-time carrier delivery receipt aggregation system that detects telecom route degradation within 30 seconds.",
            "Architect a billing and usage metering pipeline for Twilio API calls with zero double-billing and real-time balance exhaustion alerts."
        ]
    },
    {
        "id": "atlassian",
        "name": "Atlassian",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Sydney / Bengaluru / Remote",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "datalake",
        "seniorDeSalary": "$200k - $310k (₹48L - ₹80L)",
        "architectSalary": "$320k - $480k (₹92L - ₹1.6Cr)",
        "systemDesignArchetype": "Multi-Tenant Enterprise Collaboration Graph & Jira Analytics Lakehouse",
        "stack": ["Apache Spark", "Apache Iceberg", "AWS S3 / Kinesis", "Databricks", "PostgreSQL", "Kafka", "Python"],
        "interviewFocus": [
            "Multi-tenant data isolation and tenant migration across cloud regions",
            "Apache Iceberg table maintenance for Jira issue mutation event streams",
            "Near real-time collaborative search indexing for Confluence and Jira",
            "Spark job performance for massive cross-company dependency graph queries"
        ],
        "keyChallenges": "Isolating analytical queries across 250,000 enterprise tenants while optimizing shared compute clusters on AWS.",
        "sampleQuestions": [
            "Design a tenant-isolated analytics query engine for Jira Enterprise Cloud ensuring strict zero cross-tenant data leakage.",
            "Architect an Iceberg lakehouse ingestion pipeline capturing issue changelogs with support for GDPR right-to-be-forgotten purges."
        ]
    },
    {
        "id": "box",
        "name": "Box",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Redwood City, CA / Remote",
        "hiringGCCLocations": ["Remote / Global"],
        "topicKey": "sql",
        "seniorDeSalary": "$190k - $290k (₹45L - ₹72L)",
        "architectSalary": "$300k - $440k (₹85L - ₹1.4Cr)",
        "systemDesignArchetype": "Enterprise Content Management & Granular Permission Lineage",
        "stack": ["Apache Spark", "HBase / Bigtable", "Kafka", "Snowflake", "Elasticsearch", "AWS S3", "Python"],
        "interviewFocus": [
            "Hierarchical folder permission inheritance evaluation at billion-file scale",
            "Real-time file audit event ingestion and compliance reporting",
            "Elasticsearch indexing for enterprise document content and metadata search",
            "Snowflake data modeling for customer seat and storage consumption"
        ],
        "keyChallenges": "Evaluating dynamic cascading permissions across deep nested enterprise folder trees in sub-milliseconds.",
        "sampleQuestions": [
            "Design an audit event ingestion pipeline capturing every file access, edit, and share event across 100,000 corporate domains.",
            "Architect a cascading permission evaluation cache that immediately invalidates downstream access when a root folder permission changes."
        ]
    },
    {
        "id": "dropbox",
        "name": "Dropbox",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Francisco, CA / Remote-First",
        "hiringGCCLocations": ["Remote"],
        "topicKey": "datalake",
        "seniorDeSalary": "$210k - $320k (₹52L - ₹84L)",
        "architectSalary": "$330k - $490k (₹95L - ₹1.6Cr)",
        "systemDesignArchetype": "Magic Pocket Custom Storage & Sync Telemetry Pipeline",
        "stack": ["Magic Pocket (Custom Object Store)", "Apache Spark", "Kafka", "Snowflake", "ClickHouse", "Go / Python"],
        "interviewFocus": [
            "Magic Pocket custom storage engine metadata indexing and chunk deduplication",
            "Desktop sync client telemetry ingestion and performance anomaly detection",
            "ClickHouse for interactive system health and operational metric dashboards",
            "Spark analytics for user storage quota forecasting and abuse detection"
        ],
        "keyChallenges": "Storing and deduplicating exabytes of user files while tracking real-time client sync success metrics across 700M users.",
        "sampleQuestions": [
            "Design a telemetry aggregation system monitoring file sync speed across worldwide desktop clients to detect regional ISP throttling.",
            "Architect a storage tiering analyzer that evaluates block access recency to migrate cold file chunks to high-density disk enclosures."
        ]
    },
    {
        "id": "servicenow",
        "name": "ServiceNow",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Santa Clara, CA / Hyderabad / Bengaluru",
        "hiringGCCLocations": ["Hyderabad", "Bengaluru"],
        "topicKey": "sql",
        "seniorDeSalary": "$200k - $310k (₹48L - ₹80L)",
        "architectSalary": "$320k - $470k (₹90L - ₹1.6Cr)",
        "systemDesignArchetype": "Multi-Instance CMDB Configuration Ingestion & Enterprise Workflow Analytics",
        "stack": ["MariaDB / MySQL Enterprise", "Apache Spark", "Kafka", "Apache Iceberg", "Azure / AWS", "Java / Python"],
        "interviewFocus": [
            "Multi-instance isolated database architecture vs shared multi-tenant analytical lakehouse",
            "Configuration Management Database (CMDB) dependency graph traversal at scale",
            "CDC capture from thousands of dedicated customer MariaDB instances",
            "Iceberg lakehouse compaction for continuous ticket event updates"
        ],
        "keyChallenges": "Aggregating analytics across tens of thousands of dedicated enterprise customer database instances into a unified data lake.",
        "sampleQuestions": [
            "Design a federated analytics engine that aggregates IT incident metrics across 5,000 distinct customer database instances without degrading OLTP operations.",
            "Architect an automated CMDB discovery log ingestion pipeline that detects orphaned enterprise infrastructure assets."
        ]
    },
    {
        "id": "workday",
        "name": "Workday",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Pleasanton, CA / Dublin / Pune",
        "hiringGCCLocations": ["Pune"],
        "topicKey": "sql",
        "seniorDeSalary": "$195k - $300k (₹46L - ₹76L)",
        "architectSalary": "$310k - $460k (₹88L - ₹1.5Cr)",
        "systemDesignArchetype": "In-Memory Enterprise HCM Graph & Time-Travel Ledger Analytics",
        "stack": ["Workday In-Memory Object Engine", "Apache Spark", "Kafka", "AWS S3", "Trino", "Scala", "Java"],
        "interviewFocus": [
            "In-memory graph database serialization and time-travel effective dating logic",
            "Strict enterprise HR data masking, role-based security, and SOC-2 compliance",
            "Spark pipelines for global enterprise payroll calculation across complex tax jurisdictions",
            "Trino federated queries across historical archives and live object stores"
        ],
        "keyChallenges": "Running complex effective-dated temporal queries across global enterprise payroll graphs with 100% mathematical precision.",
        "sampleQuestions": [
            "Design an enterprise payroll calculation pipeline handling temporal salary changes, retroactive promotions, and multi-state tax jurisdictions.",
            "Architect a zero-trust analytical access layer that dynamically redacts executive compensation data based on the caller's organizational role."
        ]
    },
    {
        "id": "intuit",
        "name": "Intuit",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Mountain View, CA / Bengaluru / Remote",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "aws",
        "seniorDeSalary": "$210k - $320k (₹52L - ₹85L)",
        "architectSalary": "$330k - $480k (₹95L - ₹1.6Cr)",
        "systemDesignArchetype": "Tax & Financial Ledger Pipeline & TurboTax Real-Time Fraud Shield",
        "stack": ["AWS EMR / Spark", "Apache Kafka", "AWS DynamoDB", "Snowflake", "Databricks", "Cassandra", "Python"],
        "interviewFocus": [
            "Tax season burst capacity planning: handling a 50x traffic surge during April tax filing deadlines",
            "Real-time fraud scoring for tax return submissions using streaming ML feature stores",
            "Data mesh implementation: decentralized domain ownership across QuickBooks and TurboTax",
            "Zero-loss transactional ledger replication with AWS DynamoDB Streams"
        ],
        "keyChallenges": "Scaling compute pipelines from baseline to 50x peak volume in 72 hours during the US tax deadline without dropped returns.",
        "sampleQuestions": [
            "Design an auto-scaling tax filing ingestion engine capable of absorbing 50,000 tax returns per minute during the April filing rush.",
            "Architect a real-time identity theft detection engine for TurboTax using DynamoDB, Kafka, and streaming graph feature extraction."
        ]
    },
    {
        "id": "autodesk",
        "name": "Autodesk",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Francisco, CA / Bengaluru / Pune",
        "hiringGCCLocations": ["Bengaluru", "Pune"],
        "topicKey": "spark",
        "seniorDeSalary": "$185k - $280k (₹42L - ₹70L)",
        "architectSalary": "$290k - $430k (₹80L - ₹1.4Cr)",
        "systemDesignArchetype": "3D CAD Geometry Telemetry & Construction Cloud Analytics",
        "stack": ["Apache Spark", "Snowflake", "AWS S3 / EMR", "Kafka", "PostgreSQL", "Airflow", "Python"],
        "interviewFocus": [
            "3D spatial coordinate data transformation and BIM (Building Information Modeling) telemetry",
            "Snowflake data modeling for software license entitlement and usage billing",
            "Streaming ingestion of digital twin sensor feeds from connected construction sites",
            "Large-scale Parquet file optimization for geometric and volumetric time-series"
        ],
        "keyChallenges": "Managing and transforming massive 3D geometric CAD models and construction IoT sensor logs into analytical schemas.",
        "sampleQuestions": [
            "Design a streaming telemetry pipeline for connected construction sites aggregating heavy machinery IoT sensors and safety alerts.",
            "Architect a multi-tenant software usage analytics lakehouse tracking feature adoption across AutoCAD and Revit desktop users."
        ]
    },
    {
        "id": "zoom",
        "name": "Zoom Video Communications",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Jose, CA / Bengaluru / Remote",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "kafka",
        "seniorDeSalary": "$195k - $300k (₹45L - ₹75L)",
        "architectSalary": "$310k - $460k (₹88L - ₹1.5Cr)",
        "systemDesignArchetype": "Real-Time Video QoS Telemetry & Meeting Quality Diagnoser",
        "stack": ["Apache Kafka", "Apache Spark", "ClickHouse", "AWS S3 / Oracle Cloud", "Cassandra", "Flink", "Go"],
        "interviewFocus": [
            "Sub-second video meeting packet loss, jitter, and latency telemetry aggregation",
            "ClickHouse schema design for real-time meeting quality diagnostics",
            "Multi-cloud deployment across AWS and Oracle Cloud Infrastructure",
            "Streaming alerting pipeline notifying network administrators of degraded video calls"
        ],
        "keyChallenges": "Analyzing real-time audio/video packet metrics from 300+ million daily meeting participants to dynamically route media relays.",
        "sampleQuestions": [
            "Design a real-time video quality monitoring system that alerts enterprise admins when meeting packet loss exceeds 2% across any office branch.",
            "Architect a ClickHouse analytical backend capable of querying 10 billion daily meeting telemetry records with sub-second response times."
        ]
    },
    {
        "id": "reddit",
        "name": "Reddit",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Francisco, CA / Remote",
        "hiringGCCLocations": ["Remote"],
        "topicKey": "spark",
        "seniorDeSalary": "$210k - $320k (₹52L - ₹84L)",
        "architectSalary": "$330k - $480k (₹95L - ₹1.6Cr)",
        "systemDesignArchetype": "Subreddit Feed Ranking & Vote Counting Ingestion Firehose",
        "stack": ["Apache Spark", "Apache Flink", "Kafka", "GCP BigQuery", "Cassandra", "PostgreSQL", "Python / Go"],
        "interviewFocus": [
            "Real-time post upvote / downvote tallying with deduplication and bot vote damping",
            "Subreddit recommendation algorithms and user interaction feature stores",
            "BigQuery cost governance and partitioning on petabyte community discussion archives",
            "Flink sliding window calculations for the 'Hot' and 'Rising' feed algorithms"
        ],
        "keyChallenges": "Computing real-time vote totals and dynamic post hotness rankings across hundreds of thousands of active subreddits.",
        "sampleQuestions": [
            "Design a real-time vote counting and hot-ranking pipeline using Kafka and Flink that mitigates vote brigading and spam bots.",
            "Architect a petabyte-scale comment search and semantic similarity engine indexing millions of daily Reddit discussions."
        ]
    },
    {
        "id": "shopify",
        "name": "Shopify",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Ottawa / Remote-First / Toronto",
        "hiringGCCLocations": ["Remote"],
        "topicKey": "gcp",
        "seniorDeSalary": "$210k - $320k (₹52L - ₹84L)",
        "architectSalary": "$330k - $480k (₹95L - ₹1.6Cr)",
        "systemDesignArchetype": "Merchant Commerce Lakehouse & Black Friday Burst Scaling",
        "stack": ["Google Cloud BigQuery", "Apache Spark", "Kafka", "Trino", "dbt", "Apache Iceberg", "Ruby / Python"],
        "interviewFocus": [
            "Black Friday Cyber Monday (BFCM) preparation: scaling pipelines for 10x merchant order spikes",
            "Merchant data isolation within a shared analytical BigQuery warehouse",
            "dbt modeling practices for unified merchant checkout, refund, and shipping metrics",
            "Real-time merchant dashboard queries powered by Trino and Iceberg"
        ],
        "keyChallenges": "Ensuring zero data ingestion lag and 100% report availability during Black Friday Cyber Monday peak traffic bursts.",
        "sampleQuestions": [
            "Design a real-time sales and checkout telemetry dashboard for 2 million Shopify merchants during Black Friday with zero pipeline lag.",
            "Architect a merchant-partitioned Iceberg lakehouse on GCP that isolates merchant data while allowing cross-merchant macroeconomic trend analysis."
        ]
    },
    {
        "id": "block-square",
        "name": "Block (Square / Cash App)",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Francisco, CA / Remote",
        "hiringGCCLocations": ["Remote"],
        "topicKey": "snowflake",
        "seniorDeSalary": "$220k - $340k (₹58L - ₹92L)",
        "architectSalary": "$350k - $520k (₹1.1Cr - ₹1.9Cr)",
        "systemDesignArchetype": "Peer-to-Peer Payments Ledger & Instant Payout Risk Scoring",
        "stack": ["Snowflake", "Apache Kafka", "Apache Spark", "AWS S3", "Airflow", "MySQL / Vitess", "Java / Go"],
        "interviewFocus": [
            "Cash App peer-to-peer transaction stream ingestion and double-entry balance verification",
            "Real-time fraud scoring for instant debit card deposits and Bitcoin purchases",
            "Vitess database sharding and CDC pipeline into Snowflake via Kafka",
            "Regulatory compliance: FinCEN reporting, SAR generation, and PCI-DSS audit trails"
        ],
        "keyChallenges": "Delivering sub-100ms fraud decisions on Cash App peer-to-peer payments while processing millions of daily transactions.",
        "sampleQuestions": [
            "Design a real-time peer-to-peer payment fraud detection engine that evaluates sender-receiver social graph distance in under 50ms.",
            "Architect a CDC replication pipeline from sharded Vitess clusters to Snowflake maintaining transaction sequence ordering."
        ]
    },
    {
        "id": "github",
        "name": "GitHub (Microsoft)",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Francisco, CA / Remote-First",
        "hiringGCCLocations": ["Remote / India"],
        "topicKey": "microsoft",
        "seniorDeSalary": "$210k - $320k (₹52L - ₹85L)",
        "architectSalary": "$330k - $490k (₹95L - ₹1.6Cr)",
        "systemDesignArchetype": "Git Commit Graph Telemetry & Copilot Code Telemetry Lakehouse",
        "stack": ["Microsoft Fabric / Azure Data", "Apache Spark", "Kafka", "Azure Cosmos DB", "MySQL", "Kusto (ADX)", "Ruby / Go"],
        "interviewFocus": [
            "Git repository event streams (pushes, PRs, workflow runs) processing at global developer scale",
            "Azure Data Explorer (Kusto) schema design for high-throughput build log diagnostics",
            "Copilot telemetry anonymization and model evaluation feedback pipelines",
            "Fabric OneLake integration for centralized engineering productivity analytics"
        ],
        "keyChallenges": "Analyzing billions of daily git push events and CI/CD workflow logs while ensuring private repository code is never leaked.",
        "sampleQuestions": [
            "Design a real-time developer productivity and code velocity analytics pipeline indexing pull request lifecycle events.",
            "Architect an Azure Data Explorer (Kusto) log telemetry engine ingesting 500,000 GitHub Actions build log lines per second."
        ]
    },
    {
        "id": "gitlab",
        "name": "GitLab",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "All-Remote / Global",
        "hiringGCCLocations": ["All-Remote"],
        "topicKey": "gcp",
        "seniorDeSalary": "$190k - $290k (₹45L - ₹72L)",
        "architectSalary": "$300k - $440k (₹85L - ₹1.4Cr)",
        "systemDesignArchetype": "All-Remote DevSecOps Telemetry & Open-Source Data Team Stack",
        "stack": ["Snowflake", "dbt", "Airflow", "GCP BigQuery", "PostgreSQL", "Kafka", "Python"],
        "interviewFocus": [
            "Open-source data stack patterns: GitLab's transparent public data handbook",
            "dbt dimensional modeling and automated schema testing for CI/CD usage metrics",
            "PostgreSQL database replication to Snowflake via Singer / Airbyte / custom extractors",
            "CI/CD runner job queue telemetry analysis and cost attribution"
        ],
        "keyChallenges": "Maintaining transparent public data warehouse operations while strictly safeguarding customer proprietary code telemetry.",
        "sampleQuestions": [
            "Design a dbt dimensional warehouse model tracking SaaS vs self-managed customer seat utilization and feature tier adoption.",
            "Architect an Airflow orchestration cluster on Kubernetes managing thousands of daily data models with automated Slack error triage."
        ]
    },
    {
        "id": "cloudflare",
        "name": "Cloudflare",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Francisco, CA / London / Remote",
        "hiringGCCLocations": ["Remote"],
        "topicKey": "kafka",
        "seniorDeSalary": "$220k - $340k (₹58L - ₹92L)",
        "architectSalary": "$350k - $520k (₹1.1Cr - ₹1.9Cr)",
        "systemDesignArchetype": "Global Edge DDoS Threat Mitigation & ClickHouse Petabyte Log Engine",
        "stack": ["ClickHouse", "Apache Kafka", "Workers / Durable Objects", "Go", "Rust", "PostgreSQL", "Elasticsearch"],
        "interviewFocus": [
            "Ingesting 60+ million HTTP requests per second across 300+ worldwide edge data centers",
            "ClickHouse partitioning by date and hash, sparse primary indexes, and vectorized execution",
            "Sub-second DDoS attack anomaly detection and edge firewall rule deployment",
            "Handling out-of-order log delivery from worldwide points of presence (PoPs)"
        ],
        "keyChallenges": "Ingesting and indexing 60+ million HTTP requests/second to provide real-time security analytics and DDoS mitigation in under 1 second.",
        "sampleQuestions": [
            "Design an edge log aggregation pipeline collecting HTTP edge logs from 300 data centers into ClickHouse with sub-5-second visibility.",
            "Architect a real-time DDoS mitigation trigger engine that identifies bot traffic bursts and pushes firewall rules to edge servers in under 1 second."
        ]
    },
    {
        "id": "crowdstrike",
        "name": "CrowdStrike",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Austin, TX / Pune / Remote",
        "hiringGCCLocations": ["Pune", "Remote"],
        "topicKey": "kafka",
        "seniorDeSalary": "$210k - $330k (₹54L - ₹88L)",
        "architectSalary": "$330k - $500k (₹1.0Cr - ₹1.8Cr)",
        "systemDesignArchetype": "Threat Graph Cybersecurity Telemetry & Endpoint Sensor Firehose",
        "stack": ["Threat Graph", "Apache Kafka", "Apache Spark", "Cassandra", "Elasticsearch", "AWS S3", "Go / Rust"],
        "interviewFocus": [
            "Endpoint sensor event ingestion: processing 1+ trillion security events daily",
            "Graph database modeling of process execution trees, parent-child process ancestry, and DLL loads",
            "Low-latency IOC (Indicator of Compromise) matching against real-time telemetry",
            "Cassandra data retention and cold storage archiving to Amazon S3"
        ],
        "keyChallenges": "Correlating endpoint process behavior across hundreds of millions of enterprise computers to block ransomware in real time.",
        "sampleQuestions": [
            "Design a real-time endpoint security event processing engine that correlates process execution trees to detect lateral attack movement.",
            "Architect a multi-trillion event/day Kafka ingestion backbone that guarantees zero event loss even during massive enterprise malware outbreaks."
        ]
    },
    {
        "id": "datadog",
        "name": "Datadog",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "New York, NY / Paris / Remote",
        "hiringGCCLocations": ["Remote"],
        "topicKey": "kafka",
        "seniorDeSalary": "$220k - $340k (₹58L - ₹92L)",
        "architectSalary": "$350k - $520k (₹1.1Cr - ₹1.9Cr)",
        "systemDesignArchetype": "Distributed Tracing APM Pipeline & High-Cardinality Metric Store (Husky)",
        "stack": ["Husky (Custom Columnar Store)", "Apache Kafka", "Cassandra", "PostgreSQL", "AWS S3 / GCP", "Go", "Python"],
        "interviewFocus": [
            "Husky custom distributed columnar store for high-cardinality time-series metrics and logs",
            "Dynamic distributed trace sampling: preserving error traces while discarding healthy spans",
            "Kafka cluster scaling and tiered storage integration for multi-petabyte daily ingest",
            "Sub-second tag search across billions of APM spans using bloom filters and inverted indexes"
        ],
        "keyChallenges": "Querying billions of high-cardinality tags (container IDs, pod names) without crashing memory or slowing dashboards.",
        "sampleQuestions": [
            "Design a distributed trace ingestion and intelligent sampling pipeline that retains 100% of error traces and a statistical 1% of success traces.",
            "Architect a high-cardinality time-series storage engine supporting instant aggregation over 10 million distinct container tag combinations."
        ]
    },
    {
        "id": "splunk",
        "name": "Splunk (Cisco)",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "San Francisco, CA / Bengaluru / Remote",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "sql",
        "seniorDeSalary": "$200k - $310k (₹48L - ₹80L)",
        "architectSalary": "$320k - $470k (₹90L - ₹1.6Cr)",
        "systemDesignArchetype": "Enterprise Security Information & Event Management (SIEM) Ingestion",
        "stack": ["Splunk Enterprise", "SmartStore (S3)", "Apache Kafka", "Apache Spark", "Python", "C++", "Kubernetes"],
        "interviewFocus": [
            "Splunk indexer clustering, pipeline queues, and search head dispatching",
            "SmartStore decoupled storage architecture: keeping hot indexes local and warm in S3",
            "Search Processing Language (SPL) query optimization over massive unparsed text logs",
            "Universal Forwarder load balancing and SSL/TLS secure ingest pipelines"
        ],
        "keyChallenges": "Searching across petabytes of unstructured text logs and machine data with instant schema-on-read parsing.",
        "sampleQuestions": [
            "Design a distributed SIEM ingestion architecture indexing 20TB of security logs daily with hot-to-warm storage tiering on S3.",
            "Architect a schema-on-read search optimization layer that dynamically extracts regex fields during high-concurrency compliance queries."
        ]
    },
    {
        "id": "zoominfo",
        "name": "ZoomInfo",
        "tier": "Tier 1 FAANG / BigTech",
        "location": "Vancouver, WA / Bengaluru / Remote",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "snowflake",
        "seniorDeSalary": "$180k - $275k (₹38L - ₹65L)",
        "architectSalary": "$280k - $410k (₹75L - ₹1.3Cr)",
        "systemDesignArchetype": "B2B Contact Knowledge Graph & Real-Time Firmographic Enrichment",
        "stack": ["Snowflake", "Apache Spark", "Elasticsearch", "Neo4j", "Kafka", "AWS S3", "Python"],
        "interviewFocus": [
            "Entity resolution and entity linking across messy B2B company and executive profiles",
            "Knowledge graph modeling of corporate hierarchies, subsidiaries, and job titles",
            "Elasticsearch cluster optimization for real-time contact filtering by industry and revenue",
            "Snowflake automated data pipelines for nightly firmographic database updates"
        ],
        "keyChallenges": "Continuously reconciling and deduplicating hundreds of millions of executive contact profiles and business ownership hierarchies.",
        "sampleQuestions": [
            "Design an entity resolution pipeline that matches scraped web company profiles to a canonical master directory of 100M businesses.",
            "Architect a real-time B2B data enrichment API that provides firmographic data for incoming website leads in under 100ms."
        ]
    }
]
