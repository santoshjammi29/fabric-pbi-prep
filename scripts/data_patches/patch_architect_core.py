# scripts/data_patches/patch_architect_core.py
"""
Bespoke, multi-modal ARCHITECT answers for core data lake, security, and streaming questions:
- dl-catalog-6
- dl-security-1
- security-1
- kafka-medium-19

Each includes:
- The Theory
- The Blueprint (Mermaid.js diagram)
- The Implementation (Code Sheet ref + code block)
- Trade-off Analysis (Markdown table)
- Failure Scenario at Scale
- Cost Impact & Capacity (F-SKUs)
"""

def get_architect_core_fixes():
    return {
        "dl-catalog-6": """### The Theory
A **schema split-brain** occurs in multi-region or hybrid-cloud data lakehouses when the centralized metastore (Unity Catalog, AWS Glue, Hive Metastore) becomes desynchronized from the true underlying **Delta Lake transaction log (`_delta_log/`)**. Because Delta Lake is strictly ACID-compliant and relies on monotonic JSON commit files and checkpoint Parquet files in object storage as the single source of truth, an external metastore catalog caching outdated schema snapshots will reject queries or cause silent column omission. Programmatic resolution requires reconciling metastore catalog pointers directly from the latest Delta snapshot checkpoint.

### The Blueprint
```mermaid
flowchart TD
    Client["Analytical Client (Power BI / Spark)"] -->|"Reads Outdated Schema"| Catalog["External Catalog / Metastore"]
    Catalog -.->|"Split-Brain Desync"| Storage[("ADLS Gen2 / OneLake Object Storage")]
    Storage --> DeltaLog["_delta_log/00000000000000000125.json"]
    Reconciler["Catalog Reconciliation Daemon"] -->|"Inspects Delta Log Head"| DeltaLog
    Reconciler -->|"Extracts Latest Protocol & Schema"| DeltaSnapshot["Latest Delta Snapshot"]
    DeltaSnapshot -->|"Synchronizes Columns & Types"| Catalog
    Catalog -->|"Consistent Schema Manifest"| Client
```

### The Implementation
Reference Code Sheet: `py-b-02` (Reading and Writing Delta Tables) & `beg_004` (CREATE TABLE USING DELTA).
```python
from delta.tables import DeltaTable
from pyspark.sql import SparkSession

def reconcile_delta_catalog_split_brain(spark: SparkSession, table_name: str, storage_path: str):
    # 1. Bypass cached metastore metadata and load physical Delta Table from storage
    delta_table = DeltaTable.forPath(spark, storage_path)
    latest_version = delta_table.history(1).select("version").collect()[0]["version"]
    
    # 2. Extract authoritative schema directly from storage snapshot
    authoritative_schema = spark.read.format("delta").load(storage_path).schema
    
    # 3. Force catalog refresh and synchronise metastore schema definition
    spark.catalog.refreshTable(table_name)
    spark.sql(f"MSCK REPAIR TABLE {table_name}")
    
    print(f"Successfully reconciled {table_name} to Delta transaction log commit v{latest_version}.")
    return latest_version
```

### Trade-off Analysis
| Architecture Dimension | Metastore-Centric Cataloging | Storage-Log Direct Resolution (Uniform) |
|---|---|---|
| **Authority** | Metastore is external secondary index | **Storage `_delta_log` is immutable ground truth** |
| **Cross-Cloud Latency** | High sync lag (5–15 mins across regions) | **Zero lag**: Direct transaction commit reads |
| **Engine Compatibility** | Legacy Hive/Presto engines require metastore | Delta 2.4+ / Fabric native engine reads storage log |
| **Split-Brain Risk** | **High**: Network partitions desync metastore | **Zero**: Atomic ACID commits guarantee single writer order |

### Failure Scenario at Scale
At petabyte scale across multi-region deployments, if a cross-region fiber link drops during a schema migration (`ALTER TABLE ADD COLUMN`), the secondary region catalog retains the old column mapping while the primary storage log records the new schema. Downstream queries in the secondary region fail with `ColumnNotFoundException` or return NULL values for newly populated attributes, corrupting financial reporting pipelines.

### Cost Impact & Capacity (F-SKUs)
Metastore synchronization retries and recursive directory scans consume heavy driver CPU, triggering Fabric capacity bursts that burn through smoothing windows. Reconciling metadata programmatically directly from the Delta transaction log head reduces metadata scan time from 18 minutes to under 4 seconds, cutting background F-SKU capacity consumption by 92%.""",

        "dl-security-1": """### The Theory
Designing an exabyte-scale, multi-tenant data lake security architecture requires decoupling **identity authentication** from **physical object storage access**. Direct POSIX ACLs on object storage (ADLS Gen2 / S3) degrade performance when millions of files require recursive permission inheritance scans. The modern architecture utilizes **Centralized Attribute-Based Access Control (ABAC)** with **Credential Vending Brokers** and **Dynamic Column Masking / Cryptographic Shredding**. When a client initiates a query, the compute engine queries an identity governance broker (Microsoft Entra ID / Unity Catalog / Apache Ranger) to obtain short-lived scoped tokens and column-level projection filters, preventing direct access to physical storage keys.

### The Blueprint
```mermaid
flowchart LR
    User["Tenant User / Query Worker"] --> Engine["Query Engine (Fabric Spark / Databricks Photon)"]
    Engine --> AuthZ{"ABAC Governance Layer (Unity Catalog / Ranger)"}
    AuthZ -->|"Validates Tenant & Column Masking"| Policy["Security Policy Engine"]
    Policy -->|"Vends Ephemeral Scoped Token"| TokenBroker["Token Broker (Entra ID)"]
    TokenBroker --> Engine
    Engine -->|"Reads Encrypted Parquet with Ephemeral Token"| OneLake[("Exabyte Lake Storage (OneLake / ADLS Gen2)")]
    OneLake -->|"Decrypted Column Stream"| Engine
    Engine -->|"Masked Projection (PII Redacted)"| User
```

### The Implementation
Reference Code Sheet: `sql-b-05` (Transactions & Security) & `py-b-02` (Delta Storage).
```python
# Configure dynamic row-level security and column masking in Unity Catalog / Fabric
spark.sql(\"\"\"
    CREATE OR REPLACE FUNCTION security.mask_credit_card(cc_number STRING)
    RETURN CASE 
        WHEN IS_ACCOUNT_GROUP_MEMBER('compliance_auditors') THEN cc_number
        ELSE CONCAT('XXXX-XXXX-XXXX-', RIGHT(cc_number, 4))
    END;
\"\"\")

spark.sql(\"\"\"
    ALTER TABLE lakehouse_gold.dim_customer 
    ALTER COLUMN credit_card_number 
    SET MASK security.mask_credit_card;
\"\"\")

# Cryptographic Shredding: Rotate tenant-specific KMS envelope keys
# Revoking tenant_key_042 renders all tenant data cryptographically unrecoverable
```

### Trade-off Analysis
| Security Paradigm | Physical POSIX Storage ACLs | Centralized ABAC Credential Vending |
|---|---|---|
| **Performance at Scale** | **Severe Degradation**: Millions of recursive ACL evaluations | **Zero File-Scan Overhead**: Metadata-level policy evaluation |
| **Tenant Isolation** | Storage account / container proliferation | Logical catalog isolation over shared lakehouse |
| **Compliance Shredding** | Slow physical `DELETE` + `VACUUM` across petabytes | **Instantaneous**: Revoke tenant KMS key in cloud HSM |
| **Management Overhead** | Complex permission sprawl across millions of directories | Centralized role and attribute governance |

### Failure Scenario at Scale
If permission checks rely on recursive storage ACL inheritance across a 100-petabyte data lake with 500 million Parquet files, a directory re-permissioning operation locks storage management APIs, triggering HTTP 429 throttling cascades. Query planning latencies surge from 200ms to over 45 minutes, crashing production dashboards with query timeout exceptions.

### Cost Impact & Capacity (F-SKUs)
Recursive storage ACL scans generate hundreds of millions of cloud storage metadata transaction operations ($0.05 per 10,000 transactions), generating tens of thousands of dollars in unexpected monthly storage API charges. ABAC credential vending eliminates direct file-level permission transactions, keeping storage API costs near zero and stabilizing Fabric F-SKU capacity utilization.""",

        "security-1": """### The Theory
A **Zero-Trust Network Architecture for Microsoft Fabric** enforces strict perimeter isolation where all network transit occurs exclusively over private backbones, completely eliminating public internet ingress. In Zero-Trust architectures:
1. All Fabric workspace endpoints are exposed via **Azure Private Endpoints**.
2. Upstream on-premises and multi-cloud networks connect through **ExpressRoute** or **Site-to-Site VPN with Private Link**.
3. Compute engines utilize **Managed Private Endpoints** to connect securely to underlying data sources.
4. Access is strictly mediated via **Microsoft Entra ID Conditional Access Policies** with Multi-Factor Authentication (MFA) and Device Compliance verification.

### The Blueprint
```mermaid
flowchart TD
    OnPrem["On-Premises Data Center / Corporate LAN"] -->|"ExpressRoute / Private Link"| HubVNet["Hub Virtual Network (Azure)"]
    HubVNet --> PE["Private Endpoint (Fabric PaaS)"]
    PE --> FabricTenant{{"Microsoft Fabric SaaS Boundary"}}
    FabricTenant --> ManagedVNet["Managed Private Network"]
    ManagedVNet -->|"Managed Private Endpoint"| ADLS[("OneLake / ADLS Gen2 Storage")]
    ManagedVNet -->|"Managed Private Endpoint"| SQLDW[("Fabric Data Warehouse")]
    EntraID["Microsoft Entra ID (Conditional Access / Zero-Trust)"] -.->|"Continuous Auth Validation"| FabricTenant
```

### The Implementation
Reference Code Sheet: `sql-b-05` (Transactions & Security) & `py-b-01` (Spark Config).
```json
// ARM Template snippet provisioning Azure Private Endpoint for Fabric Workspace
{
  "type": "Microsoft.Network/privateEndpoints",
  "apiVersion": "2023-04-01",
  "name": "pe-fabric-workspace-prod",
  "location": "eastus",
  "properties": {
    "subnet": {
      "id": "[resourceId('Microsoft.Network/virtualNetworks/subnets', 'vnet-core', 'snet-private-endpoints')]"
    },
    "privateLinkServiceConnections": [
      {
        "name": "conn-fabric-prod",
        "properties": {
          "privateLinkServiceId": "[resourceId('Microsoft.Fabric/workspaces', 'ws-analytics-prod')]",
          "groupIds": ["workspace"]
        }
      }
    ]
  }
}
```

### Trade-off Analysis
| Architectural Dimension | Public Ingress + IP Whitelisting | Zero-Trust Private Link Architecture |
|---|---|---|
| **Perimeter Exposure** | Public IPs open to internet probing and DDoS | **Zero Public Ingress**: Attack surface reduced to 0 ports |
| **Credential Exfiltration** | High risk if SAS tokens or passwords leak | Ephemeral Managed Identity tokens usable **only within VNet** |
| **DNS Complexity** | Simple public DNS resolution | Requires private DNS zone integration (`privatelink.fabric.microsoft.com`) |
| **Data Exfiltration Risk** | Medium: Data can egress to public endpoints | **Near Zero**: Tenant-level outbound firewall restrictions |

### Failure Scenario at Scale
If private DNS zones (`privatelink.analysis.windows.net`) fail to synchronize across hybrid hub-and-spoke virtual networks during a failover, analytical clients fail to resolve the private IP of the Fabric workspace, falling back to public DNS. Because public network access is disabled on the workspace, thousands of Power BI report visual queries immediately fail with `ConnectionReset` and `EndpointNotFound` errors.

### Cost Impact & Capacity (F-SKUs)
Routing multi-terabyte analytical queries over public internet interfaces incurs continuous Azure data egress bandwidth fees ($0.08/GB). Deploying Private Link and local VNet peering eliminates public egress surcharges, while preventing cross-region traffic routing keeps Fabric F-SKU capacity consumption predictable and shielded from network latency spikes.""",

        "kafka-medium-19": """### The Theory
Architecting an **active-passive Kafka disaster recovery (DR)** topology across two cloud regions with zero data loss (**RPO = 0**) and sub-minute recovery time (**RTO < 60s**) requires solving two fundamental distributed systems challenges:
1. **Asynchronous Cross-Region Replication**: Handled by **MirrorMaker 2 (MM2)** using the Kafka Connect framework to replicate topic data, partition states, and message metadata.
2. **Deterministic Consumer Offset Translation**: Because primary and secondary Kafka clusters assign partition offsets independently, raw offset values cannot be directly transferred. MM2 continuously emits offset translation mapping checkpoints (`__consumer_offsets` to `heartbeats` and `checkpoints` topics), enabling downstream consumer groups to seek to the precise corresponding offset upon failover.

### The Blueprint
```mermaid
sequenceDiagram
    autonumber
    participant Producers as Ingestion Producers
    participant Primary as Primary Kafka Cluster (Region A)
    participant MM2 as MirrorMaker 2 Replication Daemon
    participant DR as Secondary DR Kafka Cluster (Region B)
    participant Consumers as Consumer Group (Region A / B)

    Producers->>Primary: Produce Records (acks=all)
    Primary-->>Producers: Commits Confirmed
    Primary->>MM2: Streams Topic Partitions
    MM2->>DR: Replicates Topic Data (mirror.RegionA.telemetry)
    MM2->>DR: Emits Offset Mapping Checkpoints
    Note over Primary,DR: Regional Failover Triggered!
    Consumers->>DR: Query RemoteClusterUtils for Translated Offsets
    DR-->>Consumers: Returns Exact Target Offsets
    Consumers->>DR: Resume Reading (RPO=0, RTO < 60s)
```

### The Implementation
Reference Code Sheet: `py-b-01` (Python/Spark Ingestion) & `sql-b-05` (Transactions).
```properties
# MirrorMaker 2 Production Configuration (mm2.properties)
clusters = primary, secondary
primary.bootstrap.servers = kafka-primary-region-a.internal:9092
secondary.bootstrap.servers = kafka-dr-region-b.internal:9092

primary->secondary.enabled = true
primary->secondary.topics = enterprise.*
primary->secondary.groups = core_etl_group, realtime_analytics_group

# Continuous deterministic offset translation
primary->secondary.emit.checkpoints.enabled = true
primary->secondary.emit.checkpoints.interval.seconds = 5
primary->secondary.sync.group.offsets.enabled = true
primary->secondary.sync.group.offsets.interval.seconds = 5

replication.factor = 3
checkpoints.topic.replication.factor = 3
```

### Trade-off Analysis
| Architectural Dimension | Synchronous Multi-Region Cluster (Stretched) | Active-Passive with MirrorMaker 2 |
|---|---|---|
| **Write Latency** | Extreme: Every write waits on cross-region WAN ping (50–100ms) | **Sub-millisecond local writes**: Async WAN replication |
| **RPO Guarantee** | Absolute zero data loss (RPO = 0) | Near-zero (RPO < 1s, micro-batch replication lag) |
| **WAN Partition Resilience** | Weak: Split-brain or cluster freeze if quorum drops | **High**: Primary cluster operates unaffected during WAN cuts |
| **Infrastructure Cost** | High: Requires dedicated low-latency dark fiber | Low: Operates over standard cloud provider cross-region peering |

### Failure Scenario at Scale
Under heavy ingestion spikes exceeding 2 million messages/second, if MirrorMaker 2 task worker nodes experience heap memory saturation, replication lag accumulates. If a sudden catastrophic cloud region failure occurs while MM2 has 45 seconds of uncommitted lag, failover to the DR cluster will experience message loss corresponding to the lag window unless producers buffer locally on disk.

### Cost Impact & Capacity (F-SKUs)
Continuous cross-region data replication consumes cloud inter-region egress bandwidth ($0.02/GB). Compressing replication streams using `snappy` or `zstd` reduces cross-region WAN bandwidth consumption by 70%. When streaming data into Microsoft Fabric OneLake via Eventstream connectors, deterministic offset translation prevents duplicate micro-batch ingestion, avoiding duplicate CU capacity burn on downstream Delta compaction.""",
    }
