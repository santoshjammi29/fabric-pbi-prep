import json
import re

medium_qas = [
    {
        "id": "medium-fabric-onelake-1",
        "category": "FABRIC",
        "niche": "OneLake Architecture, Shortcuts, and Multi-Cloud Interoperability",
        "difficulty": "MEDIUM",
        "question": "How do OneLake shortcuts enable cross-workspace data sharing without duplicating physical storage?",
        "answer": "OneLake shortcuts are virtual references (symlinks) to underlying storage locations. Instead of copying data across workspaces, a shortcut stores only the metadata path (e.g., ADLS Gen2 path or internal Fabric workspace URI). When a query engine like Polaris or Spark accesses the shortcut, the OneLake directory service resolves the virtual path to the physical physical location in real-time. This ensures a single source of truth, zero data movement, and eliminates storage redundancy."
    },
    {
        "id": "medium-fabric-onelake-2",
        "category": "FABRIC",
        "niche": "OneLake Architecture, Shortcuts, and Multi-Cloud Interoperability",
        "difficulty": "MEDIUM",
        "question": "What are the prerequisites for setting up an AWS S3 shortcut in Microsoft Fabric using IAM role delegation?",
        "answer": "To set up an AWS S3 shortcut via IAM role delegation, you need: 1) An AWS S3 bucket with the target data. 2) An AWS IAM Role configured with a Trust Policy that allows identity federation via OpenID Connect (OIDC) from the specific Microsoft Fabric tenant. 3) The `sts:AssumeRoleWithWebIdentity` permission on the IAM role. 4) A Fabric workspace where you create the shortcut, providing the S3 bucket URL and the ARN of the IAM role. This avoids the need to store long-lived static AWS access keys inside Fabric."
    },
    {
        "id": "medium-fabric-onelake-3",
        "category": "FABRIC",
        "niche": "OneLake Architecture, Shortcuts, and Multi-Cloud Interoperability",
        "difficulty": "MEDIUM",
        "question": "How does network latency affect query performance when chaining shortcuts across multiple distinct workspaces?",
        "answer": "Chaining shortcuts (e.g., Workspace A -> Workspace B -> Workspace C) adds a metadata resolution hop for each link in the chain. Each hop introduces 10-50ms of latency during the metadata lookup phase before query execution begins. However, the actual data transfer does not route through the intermediate workspaces; the compute engine streams the Parquet/Delta files directly from the terminal physical storage location. Therefore, while query compilation/planning is slightly delayed by chaining, raw data throughput remains unaffected."
    },
    {
        "id": "medium-fabric-onelake-4",
        "category": "FABRIC",
        "niche": "OneLake Architecture, Shortcuts, and Multi-Cloud Interoperability",
        "difficulty": "MEDIUM",
        "question": "What happens when an external Delta table mapped via a shortcut undergoes a log compaction (VACUUM) operation outside Fabric?",
        "answer": "When a `VACUUM` operation runs externally (e.g., via Databricks), it permanently deletes historical Parquet files no longer referenced by the active Delta transaction log. If a Fabric compute engine (like Spark or SQL) has cached the old Delta log state and attempts to read the table, it may request physical files that no longer exist, throwing a `FileNotFoundException`. To fix this, you must force a metadata refresh in Fabric (e.g., using `sp_refresh_metadata` in the SQL endpoint or `REFRESH TABLE` in Spark) to sync the local cache with the external Delta log."
    },
    {
        "id": "medium-fabric-onelake-5",
        "category": "FABRIC",
        "niche": "OneLake Architecture, Shortcuts, and Multi-Cloud Interoperability",
        "difficulty": "MEDIUM",
        "question": "How are workspace-level permissions inherited when a user has Read access to a Lakehouse containing an external shortcut?",
        "answer": "In Microsoft Fabric, security is managed at the workspace or item level, not inherently at the storage level for internal users. If a user is granted Viewer or Read access to a Lakehouse, they automatically gain read access to all shortcuts within that Lakehouse. Fabric abstracts the underlying connection credentials (e.g., the ADLS SAS token or AWS IAM role used to create the shortcut). The user queries the Lakehouse, and Fabric uses the shortcut owner's delegated identity to fetch the external data on their behalf."
    }
]

with open('questions.js', 'r') as f:
    content = f.read()

# Parse the javascript array
# window.QUESTIONS_DB = [ ... ];
# We will just insert our json objects right before the closing bracket

json_str = json.dumps(medium_qas, indent=2)
# Remove the brackets of the json array so we just have the objects
json_str = json_str[1:-1].strip()

# Append to questions.js
if content.strip().endswith('];'):
    new_content = content.rsplit(']', 1)[0]
    if not new_content.strip().endswith('['):
        new_content += ",\n"
    new_content += json_str + "\n];\n"
    
    with open('questions.js', 'w') as f:
        f.write(new_content)
    print("Added 5 medium questions successfully.")
else:
    print("Error parsing questions.js")
