import json

# ADF Part 1: Niches 1-4
adf_part1 = []

# Niche 1: Integration Runtimes & Hybrid Network Security Architecture
ir_questions = [
    ("How do you design a zero-trust network perimeter for ADF accessing an isolated Azure SQL Database using a Self-Hosted Integration Runtime (SHIR) and private endpoints?",
     "To design a zero-trust network perimeter for an ADF pipeline accessing an isolated Azure SQL Database, follow these architectural steps:\n\n"
     "1. Network Isolation: Disable 'Public Network Access' on both Azure SQL and ADF. Provision a virtual network (VNet) representing your secure enclave. Construct a Private Endpoint for the Azure SQL Database inside a dedicated subnet within the VNet, linking it to the private DNS zone `privatelink.database.windows.net`.\n\n"
     "2. SHIR Deployment: Deploy the Self-Hosted Integration Runtime (SHIR) on an virtual machine (on-premises or in Azure) inside the same VNet (or a peered hub VNet). The SHIR node does not require any inbound ports open; it establishes outbound-only connections using Azure Relay over port 443. Set up the SHIR to communicate via Private Endpoints to the ADF control plane by creating private endpoints for the data factory instance (`gateway` and `portal` sub-resources).\n\n"
     "3. Credential & Identity Security: Set up linked services using Azure AD Managed Service Identity (MSI) or User-Assigned Managed Identity, rather than embedding connection strings. The SHIR acts as a secure proxy executing queries inside the VNet, utilizing local Windows Data Protection API (DPAPI) to encrypt credential payloads stored locally on the SHIR nodes or retrieving them directly from Azure Key Vault over its own Private Endpoint."),
    
    ("What are the architectural trade-offs between utilizing an Azure Integration Runtime with Managed Virtual Network vs. an on-premises SHIR for cross-region private data egress?",
     "The choice between an Azure Integration Runtime with Managed VNet and an on-premises SHIR for cross-region egress involves several core trade-offs:\n\n"
     "1. Compute and Performance overhead: Managed VNet IR spins up serverless compute on-demand. When executing mapping data flows, there is a cold start/provisioning delay (unless TTL is configured). In contrast, an on-premises SHIR runs on pre-provisioned virtual machines, eliminating cold start delays but requiring you to pay for underutilized VM resources.\n\n"
     "2. Connectivity & Cost: Managed VNet requires managed private endpoints, which incur hourly resource charges and data processing fees per gigabyte. For cross-region egress, traffic travels across Microsoft's backbone network. An on-premises SHIR egresses traffic over ExpressRoute or VPN tunnels. While utilizing ExpressRoute Private Peering minimizes internet-facing exposure, it is bounded by the circuit's bandwidth limit, whereas Managed VNet scales dynamically.\n\n"
     "3. Operational Complexity: Managed VNet is fully managed by Microsoft, requiring zero OS-level patching, upgrade management, or node scale configurations. A SHIR requires active maintenance, OS patching, High Availability (HA) node configuration, and monitoring of physical compute bottlenecks."),
    
    ("When configuring an SHIR cluster with 4 nodes, how exactly is the concurrent job scheduling distributed among nodes, and how do you handle localized node starvation?",
     "In a multi-node SHIR cluster, job scheduling is managed via a pull-based cooperative scheduling model driven by the ADF control plane:\n\n"
     "1. Pull Mechanism: Each active SHIR node periodically polls the ADF gateway service via HTTPS (port 443) requesting a task. The control plane assigns tasks based on node status, running jobs, and capacity limit. There is no push coordinator from the control plane; nodes fetch jobs themselves.\n\n"
     "2. Job Capacity: Every node has a capacity limit defined by the `ConcurrentJobsLimit` parameter (defaults to a value based on the node's CPU cores). If a node reaches this capacity, it stops polling for new tasks.\n\n"
     "3. Node Starvation Mitigation: Localized starvation occurs when one node has low resource utilization but cannot accept jobs, or when memory-intensive tasks crash a node. To mitigate this: (a) Enable high availability by pairing nodes into active-active clusters. (b) Monitor resource metrics using Windows Performance Counters or Azure Monitor. (c) Adjust the `ConcurrentJobsLimit` dynamically on each node via the Configuration Manager or PowerShell, ensuring nodes with higher CPU/RAM allocations have higher limits, preventing weaker nodes from choking under heavy Lookups or Stored Procedure tasks."),
    
    ("Explain the precise network handshake and protocol shift when a SHIR upgrades itself automatically. How do you prevent auto-update failure in strict outbound-proxy white-listed environments?",
     "The SHIR auto-update mechanism follows a specific multi-step handshake:\n\n"
     "1. Heartbeat check: The SHIR service running on the host regularly polls the ADF control plane. When a new version is published, the control plane sends an update instruction to the SHIR host service.\n\n"
     "2. Download Handshake: The SHIR updater initiates an outbound HTTP/HTTPS request to the Microsoft Download Center to download the MSI package. The protocol uses TLS 1.2 to authenticate the download endpoints.\n\n"
     "3. Local Execution: Once the MSI is downloaded and verified against its cryptographic hash, the SHIR host service spawns the installation helper process. It temporarily pauses the integration runtime service (stopping job executions), runs the upgrade, and restarts the service.\n\n"
     "4. Strict Proxy Whitelisting: In locked-down corporate environments utilizing outbound proxies (e.g., Squid, Zscaler), the update will fail if the download URLs are blocked. To prevent this, whitelist: `*.servicebus.windows.net`, `*.core.windows.net`, and Microsoft download endpoints (`*.download.microsoft.com`, `download.microsoft.com`). Ensure the proxy configuration matches the Local System account context (using `netsh winhttp` or configuring proxy settings in the `diahost.exe.config` file), as the auto-updater runs under the SYSTEM context, not the user context."),
    
    ("How would you programmatically rotate the Authentication Keys of a multi-node SHIR without causing inflight pipeline disruption or downtime?",
     "To rotate Authentication Keys of an SHIR cluster programmatically without downtime, you must exploit the dual-key architecture (Primary and Secondary keys):\n\n"
     "1. Use the Azure CLI or Azure PowerShell module (`Update-AzDataFactoryV2IntegrationRuntimeKey`) to generate a new Secondary key while leaving the Primary key active. Because all nodes are currently authenticated via the Primary key, inflight jobs are unaffected.\n\n"
     "2. Programmatically connect to each SHIR node (using PowerShell Remoting, Ansible, or Azure VM Run Command). Use the SHIR command-line utility `dmgcmd.exe` located in `C:\\Program Files\\Microsoft Integration Runtime\\<version>\\Shared\\`.\n\n"
     "3. Run the registration command on one node at a time: `dmgcmd.exe -k <New_Secondary_Key>`. Re-registering a node updates its local credential store and restarts its connection to the ADF gateway. Run this sequentially across nodes. Inflight jobs on other nodes will continue running.\n\n"
     "4. Once all nodes are registered with the new Secondary key, repeat the API call to regenerate the Primary key, completing the rotation cycle without pipeline interruption."),
    
    ("In a Managed VNet Integration Runtime, how do you manage and resolve private endpoint DNS conflicts when mapping to multiple storage accounts that share overlapping private DNS zones?",
     "Overlapping DNS private zones occur when ADF Managed VNet establishes private endpoints for different storage accounts (e.g., ADLS Gen2 in different regions or tenants) that resolve to the same root private domain (`privatelink.dfs.core.windows.net`):\n\n"
     "1. Managed VNet Isolation: Within the ADF Managed VNet, DNS resolution is handled internally by Azure's managed DNS resolver. When a managed private endpoint is created, Azure dynamically maps the storage FQDN to the allocated internal IP address within the isolated tenant subnet.\n\n"
     "2. DNS Lookup path: The query resolves within the context of the ADF Managed VNet, bypassing corporate on-premises DNS servers. The mapping is maintained automatically by the Azure fabric, so there are no logical DNS conflicts within the ADF execution compute itself.\n\n"
     "3. Resolution Conflicts in hybrid environments: If you are routing traffic through an on-premises network or a hub VNet, ensure that your DNS forwarders route queries to the Azure DNS IP `168.63.129.16`. Avoid manual hosts file modifications on SHIR nodes. Instead, utilize Azure Private DNS Zones linked to both the hub VNet and the spoke VNets, and configure DNS forwarders to query the Azure DNS server, which correctly resolves overlapping zones based on resource ID context."),
    
    ("How does the Azure Integration Runtime calculate TTL (Time-to-Live) cluster state preservation across consecutive parallel data flow executions, and how does it isolate compute tenants?",
     "1. TTL Mechanics: When a Mapping Data Flow executes on an Azure IR, it spins up a dedicated Azure Databricks/Spark cluster. The Time-to-Live (TTL) property allows the cluster compute resources to remain active (warm) for a specified duration (e.g., 30 minutes) after execution. If another data flow is triggered within the TTL window using the same Azure IR, it bypasses the 3-5 minute startup latency and executes immediately.\n\n"
     "2. Resource Preservation: The TTL cluster preserves the underlying VM states and Spark drivers. However, consecutive executions do not share execution states, memory spaces, or cached data; they run in isolated user contexts.\n\n"
     "3. Tenant Isolation: Compute tenant isolation is enforced at the physical virtual machine and network layer. ADF runs data flows within isolated containers using Hyper-V boundaries or dedicated VMs depending on the compute size. Even when using the public Integration Runtime, Azure employs secure virtualization policies to guarantee that memory pages and file system spaces of different tenants never overlap, ensuring zero leakage of data between running activities."),
    
    ("Detail the inner workings of the SHIR data credential encryption mechanism using DPAPI (Data Protection API). How do you back up and restore these credentials to a secondary SHIR group?",
     "1. Local Encryption: When you enter credentials for a local source system (e.g., SQL Server, Oracle) in an ADF Linked Service, the SHIR encrypts these credentials locally on the SHIR node using the Windows Data Protection API (DPAPI). The encryption uses a local machine-specific key, ensuring credentials are never sent to the cloud in plaintext.\n\n"
     "2. Multi-node Sync: In a multi-node cluster, credentials must be synchronized across nodes. The cluster uses an internal credential synchronization protocol. One node acts as the credential coordinator and distributes the encrypted payload to other nodes over local network ports (ports 8060 by default).\n\n"
     "3. Backup: To back up credentials, use the Integration Runtime Configuration Manager GUI or run `dmgcmd.exe -b <Backup_File_Path> <Password>`. This generates a secure encrypted file containing the credential database, encrypted with the password you provide.\n\n"
     "4. Restore: To restore to a secondary SHIR group, install the SHIR software on the new nodes, and during the configuration step, select 'Restore from backup' and provide the backup file and password. This decrypts the credentials and re-encrypts them using the new cluster's DPAPI keys, restoring connectivity to your linked services."),
    
    ("You notice your SHIR is suffering from massive thread pool exhaustion under heavy parallel Lookup activities. Explain how to fine-tune ConcurrentJobsLimit via PowerShell without altering the UI configuration.",
     "When an SHIR node runs heavy concurrent activities, thread pool exhaustion can cause heartbeat drops. You can modify the `ConcurrentJobsLimit` directly on the SHIR host VM using the local PowerShell module:\n\n"
     "1. Remote into the SHIR VM and import the Integration Runtime administration module. Open PowerShell as Administrator.\n\n"
     "2. Run the command to set the limit: `& \"C:\\Program Files\\Microsoft Integration Runtime\\<version>\\Shared\\dmgcmd.exe\" -cj <limit_number>`. For instance, to increase the limit to 64 concurrent tasks: `& \"dmgcmd.exe\" -cj 64`.\n\n"
     "3. To verify the change, run `& \"dmgcmd.exe\" -status` which prints out the active node configuration, CPU/memory usage, and current concurrent jobs limits.\n\n"
     "4. This changes the setting at the node level, bypassing the default automatic limit calculated based on CPU cores. Note that setting this value too high on under-provisioned VMs can lead to memory starvation, so coordinate thread limits with VM sizing."),
    
    ("How do you integrate Azure Key Vault with ADF when the Key Vault is behind a firewall and ADF relies on a Managed Service Identity (MSI) within a restricted tenant?",
     "1. Firewall Bypass: To allow ADF to access an Azure Key Vault behind a firewall, you must enable 'Allow trusted Microsoft services to bypass this firewall' in the Key Vault networking settings.\n\n"
     "2. Private Endpoints: If trusted services bypass is restricted by corporate policy, create a Private Endpoint for the Key Vault within the ADF's VNet (or Managed VNet). ADF will then access the Key Vault via its private IP.\n\n"
     "3. MSI Permission: In the Key Vault Access Policies (or Azure RBAC), grant the ADF's System-Assigned Managed Identity 'Key Vault Secrets User' or secret 'Get' and 'List' permissions.\n\n"
     "4. Restricted Tenants: If the Key Vault is in Tenant A and ADF is in Tenant B, you must use a Multi-Tenant Service Principal instead of MSI. Register the Service Principal in Tenant A, grant it access to the Key Vault, and configure the ADF linked service in Tenant B to use this Service Principal for authentication, supplying its credential via client secret."),
    
    ("Describe the precise sequence of events and network hops when an ADF pipeline invokes a Web activity referencing a private endpoint inside an internal-only App Service Environment (ASE).",
     "When a Web activity in ADF targets an internal ASE private endpoint, the network flow behaves as follows:\n\n"
     "1. Invocation: The ADF control plane schedules the Web activity. If using the default Azure IR, the request originates from public Azure IP addresses, which will fail to reach the internal-only ASE.\n\n"
     "2. Integration Runtime Selection: The Web activity must be configured to run on an Azure Integration Runtime with Managed VNet, or an on-premises SHIR that has network routing to the ASE.\n\n"
     "3. Network Hop (Managed VNet): ADF routes the Web request to the Managed Private Endpoint created for the ASE's private IP. The DNS request for the App Service URL resolves to the private IP via the private DNS zone linked to the VNet.\n\n"
     "4. Network Hop (SHIR): If using a SHIR, the request is pulled by the SHIR node from the ADF gateway. The SHIR node executes the HTTP request locally. The request travels through the local VM's network adapter, hops across the corporate router/firewall (or ExpressRoute/VPN if ASE is in Azure), and hits the private IP of the ASE internal load balancer (ILB), which forwards the request to the App Service worker node."),
    
    ("What are the cryptographic differences between using a customer-managed key (CMK) for encrypting ADF factory metadata vs. relying on Microsoft-managed keys?",
     "1. Key Ownership: Microsoft-managed keys (MMK) are generated, rotated, and managed automatically by Azure. Customer-managed keys (CMK) are hosted in your Azure Key Vault or Managed HSM, giving you full control over key lifecycle, access policies, and rotation intervals.\n\n"
     "2. Encryption Scope: With MMK, ADF data is encrypted at rest using AES-256. With CMK, ADF encrypts its metadata (pipelines, datasets, linked services) using a double-encryption approach: first with a Microsoft-managed key, and second with the key wrapper provided by your CMK.\n\n"
     "3. Key Access Control: If you use CMK, you can revoke ADF's access to the key at any time by changing Key Vault permissions. Revoking the key immediately prevents ADF from reading or writing metadata, effectively locking the factory. This provides an additional layer of security for regulatory compliance but introduces risk: if the Key Vault goes offline or the key is accidentally deleted, ADF operations will fail."),
    
    ("How do you design an active-passive cross-region disaster recovery strategy for a Self-Hosted Integration Runtime cluster supporting on-premises SAP HANA extraction?",
     "An active-passive cross-region DR strategy for a SAP HANA SHIR setup requires the following components:\n\n"
     "1. SHIR Provisioning: Deploy two separate SHIR clusters: Cluster A in the primary region (Active) and Cluster B in the secondary DR region (Passive). Both clusters must have network connectivity to the on-premises SAP HANA database (via ExpressRoute or VPN in both regions).\n\n"
     "2. Gateway Configuration: In ADF, configure two distinct Self-Hosted Integration Runtimes. The pipeline Linked Services for SAP HANA should be parameterized to accept the Integration Runtime name as a dynamic parameter.\n\n"
     "3. Failover Orchestration: Use a global parameter or an Azure Key Vault configuration to store the active IR name. When a primary region failure is declared, an automated PowerShell/CLI script updates the active IR parameter in ADF from Cluster A to Cluster B. The next pipeline executions will pull tasks from the DR SHIR cluster, resuming SAP HANA data extraction without changing pipeline code."),
    
    ("Under what exact conditions will an ADF Managed VNet Integration Runtime throw a \"Private Endpoint Provisioning Failed\" state, and how do you bypass the 20-minute resource allocation timeout?",
     "1. Conditions for Failure: The error occurs if: (a) The target resource (e.g., Azure SQL, Blob Storage) has private endpoint limit exhaustion. (b) The Azure subscription has resource provider limitations or quota limits. (c) Subnet IP address depletion occurs within the managed VNet address space.\n\n"
     "2. Timeouts: Azure allocates up to 20 minutes for private endpoint provisioning. If resource allocation hangs, ADF throws a timeout error.\n\n"
     "3. Bypassing the Timeout: To avoid waiting for automatic timeout resolution: (a) Pre-create and validate private endpoints before scheduling high-frequency pipelines. (b) If provisioning fails, delete the failed private endpoint immediately via the ADF REST API or Azure portal, which frees up the locks on the managed VNet and allows a retry. (c) Utilize the `Shared Private Link` model with a dedicated subnet to ensure consistent resource allocation."),
    
    ("How do you configure an SSIS Integration Runtime (SSIS-IR) within an ADF instance to securely connect to an on-premises SSISDB hosted on a SQL Server Always On Availability Group?",
     "1. Network Connectivity: Join the SSIS-IR to a Virtual Network that has a secure hybrid connection (ExpressRoute or VPN) to the on-premises network where the SQL Server Always On Availability Group resides.\n\n"
     "2. DNS Configuration: Set up custom DNS servers in the SSIS-IR VNet configuration to ensure that the Availability Group Listener FQDN resolves to the active SQL Server node's IP address.\n\n"
     "3. SQL Server Authentication: Configure the SSIS-IR to use SQL Server Authentication or Windows Authentication (via a domain-joined SSIS-IR). Connect using the Availability Group Listener name in the connection string.\n\n"
     "4. Failover support: Include `MultiSubnetFailover=True` in the connection string properties to ensure that the SSIS-IR quickly reconnects to the new primary replica during a database failover event without causing job aborts."),
    
    ("How do you isolate network traffic for Mapping Data Flows when you require specific, predictable outbound public IP addresses from ADF for a third-party firewall whitelist?",
     "Mapping Data Flows run on serverless Spark clusters, which do not have static public IP addresses. To isolate and route this traffic via static IPs:\n\n"
     "1. Managed Virtual Network: Enable Managed VNet on your Azure Integration Runtime. This routes your Mapping Data Flow compute traffic inside a virtual network managed by Azure.\n\n"
     "2. Virtual Network NAT: Associate a NAT Gateway with the subnet of the virtual network (or hub VNet if routing via Azure Firewall). The NAT Gateway is assigned one or more static Public IP addresses.\n\n"
     "3. Routing: Configure the outbound traffic from the Mapping Data Flow to route through the NAT Gateway. All outbound connections to the third-party source will originate from the NAT Gateway's static public IPs, allowing the third party to whitelist these static IPs."),
    
    ("Explain the internal mechanism of proxy nodes in an SHIR topology. When should a proxy node be used over a direct worker node?",
     "1. Internal Mechanism: In an SHIR topology, a proxy node acts as a gateway that routes request and response payloads between ADF and target sources, without executing the data movement compute itself. The worker node does the compute and data transfer, but routes its control messages and data payloads through the designated proxy node.\n\n"
     "2. When to Use: Use a proxy node when: (a) Security policies forbid direct outbound internet connections (port 443) from the database VMs hosting the SHIR worker nodes. The proxy VM is placed in a DMZ with outbound internet access, while the worker VMs remain in a private subnet. (b) You want to consolidate all data traffic through a single ingress/egress point in a hub-and-spoke VNet topology for auditing and firewall tracking."),
    
    ("How do you debug an intermittent \"Shared Memory Connection Broken\" error occurring exclusively inside a containerized SHIR running on Kubernetes (AKS)?",
     "1. Root Cause: This error indicates a failure in IPC (Inter-Process Communication) or socket exhaustion between the integration runtime container and the host node, or between pods in the cluster.\n\n"
     "2. Debugging Steps: (a) Check resource limits on the AKS Pod; container CPU/Memory throttling can cause connection timeouts. (b) Inspect the container logs using `kubectl logs <shir-pod-name>`. (c) Ensure memory mapping is configured correctly: containerized SHIR requires proper volume mounts and shared memory allocation (`/dev/shm` size configuration in Kubernetes pod spec).\n\n"
     "3. Resolution: Increase the `shm-size` limit in the Pod spec to at least 2GB, or configure the SHIR container to run with host networking if node isolation policies allow, avoiding intermediate network stack overhead."),
    
    ("How do you enforce Azure Policy definitions to prevent any developer from creating an unmanaged, public-facing Integration Runtime within an enterprise landing zone?",
     "1. Policy Rule: Create a custom Azure Policy definition with the effect set to `Deny` when specific Integration Runtime properties are matched.\n\n"
     "2. Target Properties: Set the policy to evaluate resources of type `Microsoft.DataFactory/factories/integrationRuntimes`. Evaluate the property `properties.type` (should equal `Managed`) and `properties.typeProperties.computeProperties.vNetProperties.publicIPs` or check if the VNet settings are null.\n\n"
     "3. Enforcement: Assign the policy at the subscription or management group level representing your landing zone. When a developer attempts to deploy an ARM template or create an IR via the portal that does not have Managed VNet enabled, the Azure Resource Manager blocks the deployment, throwing a Policy violation error."),
    
    ("What is the impact of Azure ExpressRoute circuit throttling on the heartbeat communication channel between an on-premises SHIR and the ADF control plane?",
     "1. Heartbeat Drops: If an ExpressRoute circuit is throttled due to high bandwidth utilization from heavy data transfer activities, the network packets containing the SHIR node heartbeats are delayed or dropped.\n\n"
     "2. Node Offline State: The ADF control plane expects a heartbeat signal from each active SHIR node every few seconds. If it misses multiple consecutive signals, it marks the node status as 'Offline' or 'Inactive'.\n\n"
     "3. Pipeline Failure: Active pipelines scheduled to run on that SHIR will fail with connection timeout errors. To prevent this, implement Quality of Service (QoS) rules on your ExpressRoute router to prioritize SHIR control plane traffic (destined for `*.servicebus.windows.net`) over bulk data egress traffic."),
    
    ("How do you implement a dual-region high-availability architecture for Azure-SSIS IR with custom setup scripts stored in a geo-replicated storage account?",
     "1. Storage Configuration: Upload your custom setup scripts to an Azure Blob Storage account configured with Read-Access Geo-Redundant Storage (RA-GRS) or Geo-Redundant Storage (GRS) across your primary and secondary DR regions.\n\n"
     "2. Multi-region IR: Provision an Azure-SSIS IR in the primary region and a separate one in the secondary region. Both IRs should reference the same storage account container URI containing the setup scripts.\n\n"
     "3. Script Pathing: Parameterize the SAS URI of the setup container. During failover, update the SAS token to point to the secondary region endpoint if the primary region storage goes offline.\n\n"
     "4. Failover Strategy: In the event of primary region failure, start the secondary SSIS IR using an automated Azure Automation Runbook, ensuring it loads the custom scripts from the geo-replicated backup location."),
    
    ("How do you design role-based access control (RBAC) at the Linked Service level to prevent users with \"Data Factory Contributor\" from viewing or mutating underlying credential references?",
     "1. RBAC Limitation: Standard RBAC in ADF operates at the factory level. A 'Data Factory Contributor' can read and modify all resources, including Linked Services, which reveals credential templates.\n\n"
     "2. Key Vault Integration: To prevent developers from viewing passwords, enforce a policy that all credentials must be retrieved dynamically from Azure Key Vault. Do not store passwords inside Linked Services.\n\n"
     "3. Separate Roles: Grant developers 'Reader' access to the Azure Key Vault secrets, while the ADF Managed Service Identity (MSI) is granted 'Key Vault Secrets User'.\n\n"
     "4. Repository Isolation: Store linked service JSON templates in a Git repository where developers have branch protection rules and cannot modify the credentials files directly. CI/CD pipelines inject Key Vault secret references during deployment, preventing developers from accessing credentials."),
    
    ("Detail how to resolve a scenario where an SHIR node becomes \"Inactive\" due to a strict TLS 1.2 enforcement policy implemented via corporate Group Policy Objects (GPOs).",
     "1. Root Cause: Strict TLS 1.2 enforcement blocks legacy TLS 1.0/1.1 connections. If the SHIR runtime or host registry is not configured to force TLS 1.2, handshake negotiations with Azure Relay will fail, marking the node 'Inactive'.\n\n"
     "2. Registry Fix: On the SHIR VM, configure the .NET Framework registry keys to enforce Strong Cryptography. Set `SchUseStrongCrypto` to `1` (DWORD) under `HKLM\\SOFTWARE\\Microsoft\\.NETFramework\\v4.0.30319` and `HKLM\\SOFTWARE\\Wow6432Node\\Microsoft\\.NETFramework\\v4.0.30319`.\n\n"
     "3. Windows Schannel: Ensure TLS 1.2 is enabled in Schannel registry settings (`HKLM\\SYSTEM\\CurrentControlSet\\Control\\SecurityProviders\\SCHANNEL\\Protocols\\TLS 1.2\\Client`).\n\n"
     "4. Verification: Restart the Integration Runtime service. Use PowerShell (`[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12`) to verify outbound TLS connection capacity."),
    
    ("How do you audit every outbound internet connection attempted by an ADF pipeline execution using native cloud logs and Azure Firewall log analytics?",
     "1. Routing outbound traffic: Route all ADF traffic (including SHIR and Managed VNet egress) through an Azure Firewall instance.\n\n"
     "2. Diagnostic Settings: In the Azure Firewall resource, enable diagnostic logging. Stream the logs to a Log Analytics Workspace, targeting `AZFWNetworkRule` and `AZFWApplicationRule` tables.\n\n"
     "3. KQL Querying: Write Kusto queries to analyze outbound traffic. Search for requests coming from the subnet IPs allocated to the ADF Integration Runtime. Extract the destination FQDN, protocol, and port to ensure only authorized endpoints are contacted.\n\n"
     "4. Alerting: Configure Azure Monitor alerts to trigger if the firewall blocks an outbound connection attempt from the ADF subnet, which indicates potential data exfiltration attempts or unauthorized endpoint access."),
    
    ("What happens under the hood when a Copy Activity uses a staging Azure Blob Storage account over an SHIR? Detail the precise data path from the on-premises source to the staging blob to the cloud sink.",
     "When using staging over an SHIR, the data path is divided into two distinct logical steps:\n\n"
     "1. First Stage (Source to Staging): The SHIR node reads data from the on-premises source (e.g., local database). It compresses the rows and streams the data outbound over HTTPS (port 443) directly to the designated Staging Azure Blob Storage account. The data is temporarily stored as compressed blob files.\n\n"
     "2. Second Stage (Staging to Sink): Once the write to staging is completed, the ADF cloud compute (or target Integration Runtime) picks up the staging files. It decompresses, transforms, and writes the data to the destination sink (e.g., Azure Synapse). The staging blobs are automatically cleaned up (deleted) after the copy task completes successfully.\n\n"
     "3. Security advantage: This prevents holding large data streams in memory on the SHIR nodes and bypasses network timeouts on slow connections."),
    
    ("How do you handle authentication when an ADF pipeline must access an AWS S3 bucket utilizing an IAM Role that requires an external ID rather than static access keys?",
     "To authenticate to AWS S3 using an IAM Role with an External ID:\n\n"
     "1. Set up an AWS IAM Trust Policy that allows Azure Data Factory's Tenant ID and Service Principal to assume the target IAM Role.\n\n"
     "2. In the ADF S3 Linked Service, configure the authentication method to use 'Service Principal' or 'Active Directory Managed Identity' (if federated).\n\n"
     "3. Specify the AWS IAM Role ARN and the required External ID in the Linked Service JSON definition. This instructs the ADF connector to execute the `AssumeRole` API call to AWS Security Token Service (STS) using the specified External ID.\n\n"
     "4. AWS STS returns temporary security credentials (access key, secret key, and session token), which ADF uses to stream files from the S3 bucket, satisfying the IAM role constraints without static credentials."),
    
    ("How can you programmatically detect that a SHIR node is running low on disk space or memory before it begins dropping pipeline heartbeats?",
     "1. DMV querying: Query the ADF REST API or use Azure PowerShell (`Get-AzDataFactoryV2IntegrationRuntimeMetric`) to fetch real-time runtime metrics for the target SHIR node.\n\n"
     "2. Performance Counters: Install the Log Analytics agent on the SHIR host VM. Configure it to collect the Windows Performance Counters: `% Processor Time`, `Available MBytes` (memory), and `% Free Space` (disk).\n\n"
     "3. Logic Apps alerting: Set up an Azure Monitor Alert that triggers a Logic App if `Available MBytes` drops below 10% or Free Disk Space drops below 5GB. The Logic App sends an alert to the operations team or runs a script to clean up temporary crash dumps and files on the VM before heartbeat drops occur."),
    
    ("Explain how to configure a Service Principal with multi-tenant access tokens to allow an ADF instance in Tenant A to orchestrate data movement from an Azure Data Lake in Tenant B.",
     "To configure multi-tenant cross-tenant access:\n\n"
     "1. Register a Multi-tenant Application in Tenant B. This generates a Client ID that is valid across Microsoft Entra ID tenants.\n\n"
     "2. Consent: Create a service principal for this application in Tenant A. An administrator in Tenant A must consent to the application's access.\n\n"
     "3. Access Permissions: In Tenant B, assign the Multi-tenant Service Principal the role 'Storage Blob Data Reader' on the ADLS Gen2 resource.\n\n"
     "4. ADF Linked Service: In the ADF instance located in Tenant A, configure the ADLS Gen2 Linked Service to authenticate using Service Principal. Provide the Client ID, Tenant B ID, and the Client Secret stored in Tenant A's Key Vault. The ADF token request will target Tenant B's token endpoint to authorize cross-tenant access."),
    
    ("What are the specific memory management parameters you must adjust on an SHIR server when executing ultra-large memory-mapped transformations via native ODBC drivers?",
     "When running large memory-mapped transformations via ODBC, you must fine-tune host-level settings:\n\n"
     "1. JVM Heap Size: If the ODBC driver uses Java (e.g., SAP, Salesforce), configure the environment variable `_JAVA_OPTIONS` (e.g., `-Xmx4g` to allocate 4GB heap size) on the host machine to prevent OutOfMemory exceptions.\n\n"
     "2. Windows Registry Page File: Ensure the Windows page file is configured to dynamically expand on SSD storage to handle memory mappings that exceed physical RAM limits.\n\n"
     "3. Driver Caching: In the ODBC Driver configuration DSN, disable 'Row Cache' or set a low 'Fetch Size' (e.g., 1000 rows) to force the driver to stream rows in chunks rather than buffering the entire dataset in RAM, preventing the SHIR service process from crashing due to memory exhaustion."),
    
    ("How do you prevent a token expiration error during a 12-hour continuous Copy Activity running via an Azure Integration Runtime accessing a REST API?",
     "1. Token Refresh Policy: A standard OAuth2 access token expires in 1 hour. To prevent failure during a long-running copy activity, configure the linked service to use Azure Key Vault to store a client secret, allowing ADF to request a new token during execution.\n\n"
     "2. Activity Splitting: Instead of a single 12-hour Copy Activity, split the execution into smaller, incremental chunks using a ForEach loop (e.g., copying data partition-by-partition every hour). This ensures each copy task executes within the token's validity window.\n\n"
     "3. Session Token Refresh: If using native pagination, configure the REST connector pagination rules to dynamically query the auth endpoint for token updates during page requests, ensuring continuous authentication."),
    
    ("How do you dynamically provision a self-hosted integration runtime using an automated terraform/bicep pipeline while simultaneously injecting the node keys into an on-premises VM scale set?",
     "1. Infrastructure Deployment: Write a Terraform/Bicep file to deploy the Azure Data Factory and the Self-Hosted Integration Runtime resource. The deployment output must expose the Integration Runtime Authentication Key.\n\n"
     "2. Key Vault Integration: The Terraform template stores this key in an Azure Key Vault secret.\n\n"
     "3. VM Scale Set Provisioning: Provision the VM Scale Set (VMSS) representing the SHIR nodes. In the VMSS custom data / cloud-init script, include a PowerShell/Bash command that pulls the IR key from Key Vault.\n\n"
     "4. Automatic Registration: The script installs the integration runtime software from the official MSI download link, and then runs `gatewayinstall.exe /k <secret_key>` to register the new VM node to the ADF instance, automating the entire scale-out cycle."),
    
    ("What is the exact security limitation of using secureInput and secureOutput properties when pipelines are audited by automated Azure Monitor Diagnostic logs?",
     "1. The Secure Settings: Setting `secureInput` to true hides activity inputs (like connection parameters and passwords) from user interface logs, and `secureOutput` hides the outputs.\n\n"
     "2. Diagnostic Log Limitation: While hidden in the ADF UI monitoring portal, these properties do not prevent the raw JSON payload from being streamed to Azure Monitor Diagnostic logs if diagnostic logging is enabled at the factory level. If a pipeline logs passwords via Web activity parameters, these details are still written in plaintext inside the `ADFPipelineRun` or `ADFActivityRun` tables in Log Analytics, violating security policies unless Log Analytics RBAC is tightly restricted."),
    
    ("How do you troubleshoot an SHIR error stating: \"The certificate chain was issued by an authority that is not trusted\" when connecting to a secure local Oracle server?",
     "1. Root Cause: The SHIR node does not trust the SSL/TLS certificate presented by the local Oracle server, usually because the root CA certificate is missing from the Windows machine's trust store.\n\n"
     "2. Resolution Steps: (a) Export the Root Certificate Authority (CA) certificate from the Oracle server. (b) Log in to the SHIR VM and open the Certificate Manager (`certlm.msc`). (c) Import the certificate into 'Trusted Root Certification Authorities' -> 'Certificates'.\n\n"
     "3. Alternative Config: If you cannot modify certificates, append `Validate Server Certificate=false` to the Oracle connection string in the ADF Linked Service, though this bypasses encryption trust checks and is not recommended for production environments."),
    
    ("Explain the performance and security impact of setting the Data Slice allocation behavior over an ExpressRoute with Private Peering vs. Microsoft Peering.",
     "1. Private Peering (Recommended): Traffic from the SHIR to Azure databases (like Azure SQL or Blob Storage) travels over a private connection without crossing the public internet. This provides maximum security and predictable latency.\n\n"
     "2. Microsoft Peering: Traffic routes to the public endpoints of Azure services. While still traversing the ExpressRoute circuit, it requires configuring NAT and firewall rules on your network perimeter to allow public IP routing.\n\n"
     "3. Performance: Private Peering provides lower latency and higher security because it avoids intermediate firewall checks. Microsoft Peering is necessary if you are accessing public APIs or services that do not support private endpoints, but it increases security auditing complexity."),
    
    ("How do you configure a pipeline to dynamically choose between an Azure Integration Runtime and an SHIR based on the resolved network path of a dynamic connection string?",
     "1. IR Parameterization: Create a Linked Service that is configured to use a parameterized Integration Runtime. Define a parameter named `IRName` inside the Linked Service.\n\n"
     "2. Dynamic Connection Evaluation: In your pipeline, insert a Lookup activity that queries a network configuration database or evaluates the server host domain. If the server is determined to be on-premises (resolves to private IP space), set a variable to the name of your SHIR.\n\n"
     "3. Pipeline Execution: Pass this variable value into the `IRName` parameter of the Linked Service during the Copy Activity execution. ADF will route the task to the selected runtime dynamically.")
]

for idx, (q, a) in enumerate(ir_questions):
    adf_part1.append({
        "id": f"adf-ir-{idx+1}",
        "category": "ADF",
        "niche": "Integration Runtimes & Hybrid Network Security Architecture",
        "question": q,
        "answer": a
    })

# Niche 2: Advanced Orchestration, Control Flow, & Dynamic Expression Language
orch_questions = [
    ("How do you bypass the strict 4MB payload limit imposed on pipeline run execution data when your Lookup activity returns a highly complex nested JSON string?",
     "1. The 4MB Limit: ADF enforces a 4MB size ceiling on the JSON output of any activity (including Lookup, Web, and Metadata). If a database query returns rows exceeding this, the Lookup activity will fail.\n\n"
     "2. Bypass Strategy: Instead of returning the raw data to the control flow, write the query results directly to a temporary file (e.g., CSV or JSON) in Azure Blob Storage or ADLS Gen2 from the source database (using SQL bulk export or a staging Copy Activity).\n\n"
     "3. Downstream Processing: Downstream activities then read the data in chunks or utilize mapping data flows/notebooks that process the file directly from storage, bypassing the ADF control-plane memory grant entirely. You can also use a Stored Procedure activity to process data in-database without returning payloads to ADF."),
    
    ("Explain the technical differences between a Web Activity and a WebHook Activity in terms of execution lifecycle, synchronous blocking, and timeout boundaries.",
     "1. Web Activity: Executes an HTTP/HTTPS call and waits synchronously for the response. It blocks the pipeline run until the endpoint returns a status code (e.g., 200 OK) or times out (default timeout is 10 minutes, configurable up to 7 days). It is designed for simple, synchronous API integrations.\n\n"
     "2. WebHook Activity: Initiates an HTTP call to a target endpoint, passing a system-generated callback URL. The activity then enters a 'Waiting' state, yielding CPU cycles. It blocks the pipeline execution until the external system calls the callback URL to report success/failure or the activity hits its timeout limit (up to 7 days). This is ideal for long-running asynchronous external tasks (e.g., Azure Automation runbooks, external batch processing APIs) as it prevents thread blocking in the ADF control plane."),
    
    ("How would you implement an elegant, enterprise-grade generic error-handling framework that captures the exact failed activity name, error message, and error code without hardcoding a dependency line for every activity?",
     "To implement a generic, reusable error-handling framework in ADF:\n\n"
     "1. Parent-Child Pipeline Architecture: Wrap your main execution logic in a 'Child' pipeline. The 'Parent' pipeline invokes the child using the Execute Pipeline activity.\n\n"
     "2. Error Capture: Configure the Execute Pipeline activity in the Parent pipeline with a 'Upon Failure' dependency routing to an error handler activity (e.g., a Web Activity calling a monitoring API or Logic App).\n\n"
     "3. Expression Extraction: Inside the error handler Web activity, access the child pipeline's execution metadata using the expression: `@activity('Execute Child Pipeline').error`. This object automatically contains the error message (`@activity('Execute Child Pipeline').error.message`), error code (`@activity('Execute Child Pipeline').error.code`), and target failed activity name, avoiding the need to link error paths from every individual activity in your main flow."),
    
    ("What is the internal execution order and thread allocation strategy of a ForEach activity when isSequential is set to false and the item count exceeds the concurrency limit of 50?",
     "1. Concurrency limit: By default, a non-sequential ForEach activity executes up to 20 parallel threads, which can be configured up to a maximum limit of 50.\n\n"
     "2. Allocation Strategy: When the item count exceeds 50 (e.g., 200 files to copy), the ADF control plane allocates 50 execution threads from its internal thread pool. The remaining 150 items are placed in an internal queue.\n\n"
     "3. Execution order: Items are not processed in a guaranteed order. As soon as one thread completes its loop execution, it pulls the next item from the queue. If items take varying times to complete, execution finishes non-sequentially. Thread allocation is dynamically managed across the pipeline run scheduler, meaning actual execution concurrency may be lower if the overall subscription hits platform limits."),
    
    ("How do you design a robust mutual dependency layout across two completely distinct ADF factories without using external orchestration engines like Azure Logic Apps or Azure Functions?",
     "To implement cross-factory dependencies natively:\n\n"
     "1. REST API polling: Use a Web activity in Factory A that targets the ADF REST API endpoint of Factory B: `https://management.azure.com/subscriptions/{subId}/resourceGroups/{rg}/providers/Microsoft.DataFactory/factories/{factoryB}/pipelineruns/{runId}?api-version=2018-06-01`.\n\n"
     "2. Until Loop Wrapper: Place the Web activity inside an Until activity. Configure the loop expression to evaluate the status returned by the Web activity. Loop until the status equals 'Succeeded' or fails ('Failed', 'Cancelled').\n\n"
     "3. Wait Timer: Insert a Wait activity inside the loop (e.g., 2 minutes) to prevent rate-limiting/throttling on the Azure Resource Manager API, creating a native polling mechanism that blocks Factory A until Factory B finishes."),
    
    ("Detail how to construct a complex dynamic JSON body within a Set Variable activity using advanced string manipulation and native expression functions like json(), concat(), and item().",
     "To construct a dynamic JSON body using ADF expressions:\n\n"
     "1. Escape quotes: In the expression language, wrap strings in single quotes. To insert a literal single quote, escape it with another single quote (`''`).\n\n"
     "2. Concat construction: Use the `concat` function to build the JSON string structure. For example:\n"
     "`@concat('{\"tableName\":\"', item().name, '\", \"loadDate\":\"', utcNow(), '\"}')`.\n\n"
     "3. JSON Casting: Wrap the concatenation in the `json()` function to convert the resulting string into a structured JSON object: `@json(concat('{\"tableName\":\"', item().name, '\", \"loadDate\":\"', utcNow(), '\"}'))`. You can now pass this object to variables or API payloads directly, ensuring structure is preserved without escape character issues."),
    
    ("Why does a variable mutated inside a ForEach activity exhibit erratic, non-deterministic values when isSequential is set to false, and what architectural pattern prevents this?",
     "1. Root Cause: Variables in ADF are scoped at the pipeline level, not the ForEach loop block level. When `isSequential` is set to false, multiple parallel threads execute concurrently and read/write to the same global variable, causing race conditions and non-deterministic state corruption.\n\n"
     "2. Prevention Pattern: To store thread-local states, avoid mutating pipeline variables. Instead, pass the current loop item (`@item()`) directly into a child pipeline using the Execute Pipeline activity. Variables declared inside the child pipeline are scoped uniquely to each child execution thread, ensuring isolation and preventing race conditions during parallel processing."),
    
    ("How do you implement an incremental delta-load pattern for a database table that lacks a reliable watermark column or modified timestamp?",
     "To perform delta loads without a timestamp/watermark column:\n\n"
     "1. Hash Comparison: Read the source database rows and generate a composite MD5 hash of all key and value columns (e.g., using `HASHBYTES('MD5', ...)` in SQL Server).\n\n"
     "2. Target Sync: Store the hashes of the previously loaded rows in a target metadata table.\n\n"
     "3. Copy Flow: In ADF, use a Copy Activity or Mapping Data Flow that executes a join between the source hashes and the target hashes. Only copy rows where the source hash does not exist in the target hash table (Inserts) or where the values differ for the same key (Updates), completing delta ingestion without system columns."),
    
    ("Explain the precise difference between the execution mechanics of a Tumbling Window Trigger and a Schedule Trigger when a critical pipeline failure causes an 8-hour outage.",
     "1. Schedule Trigger: Fires at a specific wall-clock time (e.g., every hour). If the system experiences an 8-hour outage, any triggers scheduled to fire during that window are skipped (or run once depending on configuration), meaning you lose historical execution slices and must backfill manually.\n\n"
     "2. Tumbling Window Trigger: Operates on contiguous, non-overlapping time slices (e.g., hourly blocks). It tracks state for every historical slice. If a failure occurs, the trigger maintains the status of unexecuted slices. Once the system recovers, it automatically executes the missed slices sequentially (or in parallel based on its concurrency limit), ensuring complete backfill and data consistency across the outage window without manual intervention."),
    
    ("How do you configure a Tumbling Window Trigger dependency where a downstream pipeline waits for multiple instances of an upstream hourly pipeline to complete successfully?",
     "1. Dependency Definition: In the downstream Tumbling Window Trigger settings, add a dependency pointing to the upstream trigger.\n\n"
     "2. Offset Configuration: Set the offset value to specify which upstream slices to target. For instance, if a daily downstream pipeline runs at midnight and needs 24 hourly upstream runs from the previous day, set the offset to `-24h` and size to `24h`.\n\n"
     "3. Execution: The ADF scheduler will evaluate the status of the 24 hourly slices. The downstream daily execution remains in a 'Waiting' state until all 24 upstream hourly runs report a 'Succeeded' state, ensuring data aggregation matches execution boundaries."),
    
    ("What is the maximum depth of nested control flow activities allowed in ADF, and how do you architect a solution that breaks through this limitation?",
     "1. Nesting Limit: ADF limits nesting of control flow activities (e.g., placing a ForEach inside a ForEach, or an If inside a ForEach) to a maximum depth of 1 level for loop containers.\n\n"
     "2. Architecture Bypass: To bypass this limitation, split your nested loops into separate pipelines. Create a Parent pipeline containing the first ForEach loop. This loop invokes a Child pipeline using the Execute Pipeline activity. Inside the Child pipeline, configure the second ForEach loop. This allows you to nest operations indefinitely by chaining parent-child relationships, while keeping JSON definitions clean and readable."),
    
    ("How do you pass highly structured arrays and multi-dimensional complex objects from a parent pipeline down into a child pipeline via the Execute Pipeline activity without stringification loss?",
     "1. Object Parameterization: In the Child pipeline, declare a Parameter of type `Array` or `Object` (do not use `String`).\n\n"
     "2. Parent Invocation: In the Parent pipeline, within the Execute Pipeline settings, pass the raw variable or activity output directly into the child parameter. Use the expression syntax without wrapping it in quotes: `@variables('myComplexArray')` or `@activity('LookupData').output.value`.\n\n"
     "3. Type Preservation: ADF will preserve the JSON types (arrays and nested objects) during execution, allowing the child pipeline to index elements using `item().property` directly, avoiding complex parsing strings."),
    
    ("Explain the behavior of the Until activity. How do you ensure the internal state updates correctly on each loop iteration without causing infinite loops due to cached expression valuations?",
     "1. Loop Execution: The Until activity executes its inner activities, then evaluates its condition expression. If the expression evaluates to `true`, the loop stops. If `false`, it repeats.\n\n"
     "2. State Refresh: To update condition states, place a Web, Lookup, or Set Variable activity inside the loop to fetch the latest state (e.g., query database or check file presence).\n\n"
     "3. Avoiding Cache Loops: Never reference a variable in the condition that is mutated outside the loop without updating it *inside* the loop. Ensure the dynamic expression (e.g., check status of job) queries the source system on *each* run, ensuring ADF evaluates fresh outputs instead of cached states, which causes infinite loops."),
    
    ("How do you handle a scenario where an upstream Storage Event Trigger captures multiple blob creation events simultaneously, causing downstream pipeline concurrency limits to be breached?",
     "1. Storage Trigger behavior: Storage Event Triggers fire a separate pipeline run for every single blob created, which can trigger hundreds of parallel pipelines instantly.\n\n"
     "2. Queuing Mitigation: In the pipeline configuration settings, enable 'Concurrency' limits (e.g., set to 10). ADF will queue subsequent executions, running them as threads become available.\n\n"
     "3. Batching Pattern: Alternatively, write a logic app that batches blob events, or schedule a periodic pipeline that runs a single Copy Activity using wildcards (`*.csv`) to ingest all blobs created in the last hour, reducing execution costs and orchestration bottlenecks."),
    
    ("How do you dynamically evaluate a complex SQL query string passed as a parameter that contains internal single quotes, escape characters, and dynamic column mappings?",
     "1. Query Interpolation: Construct the query using the `concat` function. For single quotes, double them up inside the expression string. For example, to check `status = 'Active'`: `@concat('SELECT * FROM MyTable WHERE status = ''Active'' AND column = ''', pipeline().parameters.colVal, '''')`.\n\n"
     "2. Parameterization: Pass this query into the Copy Activity source query setting as: `@pipeline().parameters.dynamicQuery`.\n\n"
     "3. Validation: Verify that the generated query is syntactically correct by checking the activity input JSON logs, preventing SQL injection issues while ensuring parameters are mapped dynamically."),
    
    ("What is the architectural impact of changing the concurrency setting at the pipeline level vs. changing it at the ForEach activity level?",
     "1. Pipeline Concurrency: Restricts the maximum number of concurrent active runs of that specific pipeline. If exceeded, new trigger runs enter a 'Queued' state. This is critical for protecting downstream database connection limits.\n\n"
     "2. ForEach Concurrency: Restricts the number of parallel threads executed *inside* a single pipeline run. Setting this high increases execution speed but consumes thread capacity from the Integration Runtime, potentially starving other pipelines running concurrently on the same IR, while setting it to sequential (`isSequential=true`) runs items one by one."),
    
    ("How do you capture and interpret the precise exit code of an Azure Batch custom activity execution within an ADF control flow?",
     "1. Execution Output: When an Azure Batch Custom Activity runs, it executes a command line script on the Batch node. The exit code of the script is captured in the activity's output JSON.\n\n"
     "2. Accessing the Code: Access the exit code using the expression: `@activity('CustomActivityName').output.exitCode`.\n\n"
     "3. Error Evaluation: If the exit code is non-zero, the activity fails. You can capture this code in a conditional If Condition activity to perform cleanup tasks or log specific error messages to your logging table based on the exit code returned (e.g., code 137 for memory limits)."),
    
    ("How do you implement a distributed transaction retry pattern with exponential backoff across a sequence of 5 disparate API-driven activities?",
     "To implement exponential backoff across multiple activities:\n\n"
     "1. Wrap each activity inside an Until loop, creating a retry container.\n\n"
     "2. Use a counter variable (e.g., `retryCount`). In each loop iteration, execute the target API activity inside a Try-Catch block pattern (using conditional paths).\n\n"
     "3. If the API fails: Increment `retryCount`. Use a Wait activity where the duration is calculated dynamically: `@mul(2, range(1, variables('retryCount')))` or equivalent exponential math (e.g., 2, 4, 8, 16 seconds). Loop until the activity succeeds or the maximum retry limit is reached, ensuring resilience across API calls."),
    
    ("Explain how to construct an expression that dynamically extracts the third nested array element from an unmapped JSON output block returned by a custom Stored Procedure activity?",
     "To extract a specific element from a nested JSON array in ADF:\n\n"
     "1. Stored Procedure output: Stored Procedure activities return results in a nested array under the `value` property: `activity('MyStoredProc').output.value`.\n\n"
     "2. Array Indexing: ADF expression language is 0-indexed. To get the third element, target index 2: `@activity('MyStoredProc').output.value[2]`.\n\n"
     "3. Nested extraction: To access a specific property within that third object (e.g., `RecordId`), chain the accessor: `@activity('MyStoredProc').output.value[2].RecordId`. Ensure the property exists or wrap the accessor to prevent runtime failures."),
    
    ("What happens to the orchestration execution state of an ADF pipeline if the underlying Azure Data Factory service experiences a regional control-plane failover mid-run?",
     "1. Failover Impact: If a regional failover occurs, the active control-plane instance hosting the pipeline scheduler becomes unavailable. Running pipelines that rely on Azure IR will fail or freeze.\n\n"
     "2. Recovery: Once Azure switches to the secondary paired region, the pipeline engine restarts. However, the execution states of mid-run pipelines are lost; they do not automatically resume from the failed step.\n\n"
     "3. Pipeline Design: You must design pipelines to be idempotent (safe to run multiple times). Implement checks to see if files/records were already processed in a previous attempt, allowing successful pipeline reruns without duplicating data."),
    
    ("How do you design a validation loop using the Validation Activity that waits for a file pattern containing wildcards to stabilize in size before initiating a copy?",
     "1. Validation check: Place a Get Metadata activity inside an Until loop. Configure the Get Metadata activity to fetch the child items and sizes of files matching your wildcard pattern.\n\n"
     "2. Wait step: Insert a Wait activity (e.g., 1 minute) after the check.\n\n"
     "3. Size Stability: Get the size again in the next iteration. Compare the current cumulative size with the previous size stored in a pipeline variable. Loop until the sizes match (difference is zero), indicating file writing is complete and the files are stable, then trigger the Copy Activity."),
    
    ("How do you programmatically terminate a runaway pipeline run from inside itself based on runtime duration metrics without utilizing external Azure CLI scripts?",
     "1. Native Timeout: Set the 'Timeout' property on the pipeline settings (under General). For example, set it to `02:00:00` (2 hours). If the pipeline runs longer, the ADF service automatically cancels the run, throwing a timeout error.\n\n"
     "2. Activity Timeout: Alternatively, set timeouts on long-running individual activities (like Copy or Web) to ensure they terminate quickly if they hang, preventing runaway costs without needing custom API termination scripts."),
    
    ("Explain how to resolve a situation where a Custom Activity fails with an \"Access Denied\" error when trying to write to the Azure Batch node's local working directory.",
     "1. Root Cause: The command execution context of the Custom Activity does not have permissions to write to the node's system folders. By default, Azure Batch tasks run under a low-privilege user account.\n\n"
     "2. Resolution: In the Custom Activity settings, check the configuration for 'Elevation Level'. Set it to 'Admin user' (or configure the Batch pool to run tasks as autouser with admin privileges). This runs the execution CLI as a local administrator on the VM, granting full write access to the node's local disk workspace."),
    
    ("How do you design a dynamic pipeline that reads a schema definition metadata table and dynamically maps 500 different tables with completely variable schemas into Parquet?",
     "To implement dynamic schema-agnostic ingestion:\n\n"
     "1. Metadata Extraction: Use a Lookup activity to query your database schema table, returning mapping definitions (column names, types) in JSON format.\n\n"
     "2. Parameterized Copy: Inside a ForEach loop, configure a Copy Activity. Parameterize both the source query and the target Parquet dataset.\n\n"
     "3. Mapping injection: In the Copy Activity 'Mapping' settings, click 'Clear' to remove static mappings. Enter a dynamic expression: `@json(item().columnMappings)`. This maps columns on-the-fly for each table based on the metadata JSON database entry, allowing 500 different schemas to run through a single Copy Activity."),
    
    ("Explain the exact evaluate-on-runtime order of pipeline parameters vs. global parameters vs. variables during a pipeline rerun execution.",
     "1. Pipeline Parameters: Evaluated first, at the exact moment the pipeline is triggered. These values are immutable during the run.\n\n"
     "2. Global Parameters: Evaluated next. These are read from the factory settings and remain constant unless altered by a factory deployment.\n\n"
     "3. Variables: Initialized at the start of execution based on their default values. Unlike parameters, variables can be modified dynamically during execution using the Set Variable activity, and are evaluated at the moment they are called in downstream expressions."),
    
    ("How do you build a custom circuit breaker pattern using an ADF pipeline to automatically disable a pipeline trigger if the downstream database exhibits a high DTU saturation alert?",
     "1. Monitoring check: Create a monitoring pipeline that runs every 5 minutes. Use a Web activity to query Azure Monitor REST API for the downstream SQL database DTU metrics.\n\n"
     "2. Trigger Disabling: If DTU exceeds 95%: Use a Web activity to send a PATCH request to the ADF REST API to disable the target pipeline's trigger (`https://management.azure.com/subscriptions/.../triggers/TriggerName?api-version=2018-06-01`).\n\n"
     "3. Alert Notification: Send an alert to Slack/Teams and set up a recovery path that automatically restarts the trigger once DTU levels drop below 70%, protecting resources during peak usage."),
    
    ("How do you handle empty arrays or null values gracefully inside a Filter activity expression without crashing the pipeline with an ExpressionEvaluationFailed exception?",
     "1. Safe Checks: Use the `empty` and `coalesce` functions to handle potentially null array parameters. For example, if filtering an array `myArray` that could be null:\n"
     "`@coalesce(variables('myArray'), json('[]'))`.\n\n"
     "2. Filter Condition: Inside the Filter activity settings, check if the item is null before evaluating properties: `@if(equals(item(), null), false, contains(item().name, 'target'))`, preventing the engine from attempting to parse properties of null items, which throws runtime exceptions."),
    
    ("What are the operational differences between using a Custom Activity executed on Azure Batch vs. an Azure Function activity for low-latency row manipulation?",
     "1. Azure Batch: Spawns a full VM compute instance (or uses an existing pool). Ideal for heavy, long-running, and complex file conversions (e.g., running Custom Python scripts, executing EXEs). It has higher cold start/scheduling overhead, making it unsuitable for real-time low-latency operations.\n\n"
     "2. Azure Function: Serverless, lightweight, and triggers instantly. Ideal for small, low-latency transformations (e.g., hashing a single string, executing light business rules). It has a strict execution limit (default 5 minutes, max 10) and is billed per execution, providing high efficiency for row-by-row API helper tasks."),
    
    ("How do you overcome the limitation of a maximum of 40 activities per pipeline when designing an extensive enterprise metadata-driven ingestion framework?",
     "1. Modular Design: Avoid placing all tasks in a single pipeline. Split the orchestration into nested parent-child layers (e.g., ingestion, transformation, loading).\n\n"
     "2. Metadata-Driven Orchestration: Instead of hardcoding 40 different Copy activities, use a single parameterized Copy activity inside a ForEach loop. The loop iterates over a list of source/sink parameters fetched from a database. This allows a single pipeline containing 3-4 activities to orchestrate thousands of source tables dynamically."),
    
    ("Detail how to construct a dynamic expression using coalesce() to fall back across multiple potential configuration values derived from different nested Lookup outputs.",
     "1. Coalesce Syntax: The `coalesce` function returns the first non-null value from its parameters. For example:\n"
     "`@coalesce(activity('LookupCustomConfig').output.firstRow.customDbUrl, activity('LookupGlobalConfig').output.firstRow.globalDbUrl, 'https://fallback.database.windows.net')`.\n\n"
     "2. Execution: This expression evaluates the custom configuration first. If null, it falls back to the global configuration. If that is also null, it uses the hardcoded fallback string, ensuring variables resolve without failing."),
    
    ("How do you enforce strict execution order across independent parallel branches inside a pipeline without introducing fake placeholder activities?",
     "1. Dependency constraints: Link the terminal activity of Branch A to the starting activity of Branch B using a standard dependency connector (e.g., Success, Completion).\n\n"
     "2. Execute Pipeline isolation: If you have complex parallel flows that must execute in sequence, wrap each flow in a separate child pipeline, and execute them sequentially in a parent pipeline. This provides a clean, visual sequence without cluttering your main canvas with empty or dummy activities."),
    
    ("Explain how a Tumbling Window Trigger handles historical data backfilling when you modify the start date parameter retrospectively via an ARM deployment.",
     "1. Slices generation: When the start date of a Tumbling Window Trigger is set to a past date (backfilling), the trigger immediately generates all historical hourly or daily slices between the start date and the current date.\n\n"
     "2. Concurrency limit: Slices execute concurrently up to the trigger's concurrency setting (e.g., 50 parallel runs). Modification via ARM deployment resets the trigger state, causing it to regenerate and rerun all slices, so ensure concurrency limits are configured to prevent target database resource saturation during deployments."),
    
    ("How do you capture the execution duration of an individual activity inside a pipeline run and pass it to a custom monitoring database using a pipeline expression?",
     "1. Activity Properties: Inside the pipeline execution metadata, every completed activity contains runtime timestamps. Access these using: `@activity('CopyTask').output.executionDetails[0].duration` (for copy activities).\n\n"
     "2. Dynamic Calculation: For general activities, use the `ticks` function to calculate the difference between start and end times:\n"
     "`@div(sub(ticks(activity('TaskName').output.endTime), ticks(activity('TaskName').output.startTime)), 10000000)` to get duration in seconds, and log this to your custom DB using a Web or Stored Proc activity."),
    
    ("What is the underlying execution limit of the activity('name').output property payload size, and what happens if your sink activity returns 50,000 row identifiers?",
     "1. The 4MB Limit: The activity output property payload is strictly capped at 4MB. If a sink activity (such as a Stored Procedure or Lookup) returns a list of 50,000 row identifiers, the payload will exceed 4MB.\n\n"
     "2. Failure Behavior: The pipeline execution will fail instantly with a 'Payload limit exceeded' error. To handle large outputs, write the rows to a storage table or file and read them using batch operations, avoiding returning massive lists to the ADF orchestration environment."),
    
    ("How do you parameterize the type of Linked Service itself within a dataset to dynamically switch between Azure Blob Storage and ADLS Gen2 at runtime?",
     "1. parameterizing Linked Services: In your Dataset settings, click on the connection tab. Under Linked Service, select dynamic content. Enter a parameter: `@dataset().lsType`.\n\n"
     "2. In the Linked Service settings, define parameters for the connection type. This allows you to pass connection strings dynamically. However, since Blob and ADLS Gen2 use different schemas, you must create a generic connection template or handle the routing using separate Copy activities linked to parameterized parameters, ensuring dynamic selection at runtime.")
]

for idx, (q, a) in enumerate(orch_questions):
    adf_part1.append({
        "id": f"adf-orch-{idx+1}",
        "category": "ADF",
        "niche": "Advanced Orchestration, Control Flow, & Dynamic Expression Language",
        "question": q,
        "answer": a
    })

# Niche 3: Scaling, Throughput Optimization, & Copy Activity Bottlenecks
scale_questions = [
    ("How does the parallelCopies property interact with the Data Integration Unit (DIU) setting in a Copy Activity? Explain how to mathematically calculate the optimal DIU setting for copying 10TB of data from ADLS Gen2 to Azure Synapse.",
     "1. DIU & Concurrency: Data Integration Units (DIU) define the CPU/memory compute capacity allocated to a Copy Activity execution. The `parallelCopies` property defines the maximum number of concurrent threads/connections the Copy activity can establish to read/write from source/sink. A higher DIU provides more bandwidth and thread capacity.\n\n"
     "2. Dynamic allocation: If `parallelCopies` is left blank, ADF automatically calculates the concurrency based on target file counts and sizes. If you set `parallelCopies` too high without sufficient DIUs, the performance will be throttled as nodes saturate.\n\n"
     "3. Mathematical calculation for 10TB: For 10TB data movement from ADLS Gen2 to Synapse, we target maximizing network utilization. The optimal setting is:\n"
     "- Allocate the maximum DIU (typically 256 or 512 for cross-region transfers).\n"
     "- Set `parallelCopies` to match the partition layout (e.g., 32 or 64 parallel threads).\n"
     "- The data transfer rate can reach up to 1GB/s. A 10TB load (= 10,240 GB) at 1GB/s takes approximately 2.8 hours. Ensure the staging storage account has sufficient IOPS to prevent bottlenecks during this massive parallel execution."),
    
    ("What are the root causes of a \"Degree of Copy Parallelism\" bottleneck when extracting billions of rows from an on-premises partitioned Oracle database?",
     "1. Single Thread Bottleneck: When extracting billions of rows, if the Copy Activity does not have partition options enabled, ADF will run a single query (`SELECT * FROM Table`), creating a single-thread connection that bottlenecks on the SHIR and Oracle CPU.\n\n"
     "2. Oracle Throttling: If partition options are enabled but the Oracle DB runs out of session pool connections or CPU threads, parallel queries will be queued locally on the DB, causing database contention.\n\n"
     "3. Resolution: In the Copy Activity source settings, select 'Partition Option' -> 'Physical partitions of table'. This instructs ADF to execute parallel queries in a single Copy Activity using Oracle partition names, matching the `parallelCopies` setting to extract data concurrently across multiple SHIR nodes, bypassing single-thread limits."),
    
    ("How do you tune the writeBatchSize and writeBatchTimeout properties in a Copy Activity to prevent transaction log exhaustion on a target Azure SQL Database?",
     "1. Transaction Log Bloat: During large imports, if `writeBatchSize` is too high (e.g., 1 million rows), SQL Server holds a massive open transaction in memory, which can exhaust the transaction log space (`tempdb` and `ldf` files) and cause execution failures.\n\n"
     "2. Tuning values: Set `writeBatchSize` to a smaller value (e.g., 10,000 to 50,000 rows depending on row width). This forces ADF to commit transactions in smaller blocks, freeing transaction log space frequently.\n\n"
     "3. Timeout Tuning: Set `writeBatchTimeout` (e.g., `00:02:00` - 2 minutes) to ensure that if the SQL Server index lock takes too long to resolve, the batch times out and retries instead of holding transaction locks open indefinitely, protecting DB stability."),
    
    ("Explain the precise engineering differences between using PolyBase, COPY statement, and Bulk Insert when loading data into Azure Synapse Analytics via ADF.",
     "1. PolyBase: Requires a staging storage account. ADF writes data to CSV/Parquet in Azure Blob Storage, and then executes an external table query in Synapse to load data in parallel. It is highly optimized for very large datasets (>1TB) but has high startup latency due to external table provisioning.\n\n"
     "2. COPY Statement (Recommended): The modern replacement for PolyBase. Bypasses external table creation. ADF writes data to staging, and Synapse executes the `COPY INTO` command directly from the staging blob. It provides higher throughput, lower startup overhead, and natively supports Parquet and ORC formats.\n\n"
     "3. Bulk Insert: Used for smaller datasets. Streams rows directly over tabular data stream (TDS) connections. It does not require staging but bottlenecks on a single control node, making it slow and unsuitable for loading millions of rows into clustered columnstore indexes."),
    
    ("When loading data via PolyBase, ADF requires a staging blob account. How do you optimize the throughput of this staging layer if your data consists of millions of ultra-small JSON files?",
     "1. The Bottleneck: Millions of small files create extreme metadata overhead (file open/close operations) in both Blob Storage and the SHIR file enumeration engine, degrading PolyBase throughput.\n\n"
     "2. Optimization strategy: Instead of loading files individually, merge the JSON files during ingestion. Use a Copy Activity that merges small files into larger consolidated files (e.g., 100MB Parquet or CSV files) in ADLS Gen2 before triggering PolyBase. This reduces file metadata checks and allows PolyBase to read data in parallel using optimal block sizes, increasing load speed."),
    
    ("What are the structural and throughput differences between utilizing Dynamic Range Partitioning vs. Physical Partitioning of Table options in the SQL source settings of a Copy Activity?",
     "1. Physical Partitioning: ADF queries the database catalog to find existing physical partitions. It spawns parallel queries targeting each partition (e.g., `WHERE partition_id = 1`). Throughput is dependent on how balanced the physical partitions are; if data is skewed, one partition run will take longer, bottlenecking the activity.\n\n"
     "2. Dynamic Range Partitioning: ADF dynamically splits a column range (e.g., auto-incrementing ID or Date column) into equal chunks based on the `parallelCopies` count. ADF runs queries like `WHERE ID BETWEEN 1 AND 10000`. This provides highly balanced parallel threads and does not require physical partitions in the source DB, providing optimal throughput for non-partitioned large tables."),
    
    ("How do you bypass the throughput throttling limits imposed by SharePoint Online APIs when using ADF to extract massive volumes of document metadata?",
     "1. The Challenge: SharePoint Online enforces strict REST API rate limiting (HTTP 429 - Too Many Requests) when clients make frequent calls to extract document metadata.\n\n"
     "2. Mitigation: Configure the HTTP/REST Linked Service in ADF with retry settings (e.g., retry count of 5 and retry interval of 30 seconds). ADF will automatically wait and retry when a 429 status code is returned. To avoid hitting limits, limit the concurrency of the ForEach activity (e.g., set concurrency to 2 or 3) and batch metadata queries using Graph API endpoints rather than querying files individually."),
    
    ("How do you architect a pipeline to copy data from an on-premises file share containing 50 million small files (under 10KB each) to ADLS Gen2 without stalling the SHIR file enumeration thread?",
     "1. The issue: Enumerating 50 million files in a single Copy Activity directory scan will exhaust the SHIR JVM/heap memory and stall the execution thread.\n\n"
     "2. Solution Architecture: Use a multi-tier pipeline. First, run an on-premises script (e.g., PowerShell or Python) on the SHIR VM to compress/zip files in groups of 10,000 into ZIP archives.\n\n"
     "3. Copying: Use ADF to copy the consolidated ZIP archives to ADLS Gen2. Use a Mapping Data Flow or Azure Databricks to unpack the files in the cloud in parallel, bypassing the slow on-premises file enumeration bottleneck."),
    
    ("Explain how the enableSkipIncompatibleRow property affects Copy Activity throughput, memory allocation, and logging overhead. Where are the skipped rows physically written?",
     "1. Performance impact: Enabling `enableSkipIncompatibleRow` requires ADF to evaluate each row against the schema definition. This row-by-row validation increases CPU utilization on the integration runtime and reduces transfer throughput compared to direct block copies.\n\n"
     "2. Logging: You must configure a storage account under the 'Log settings'. Skipped rows (e.g., data type mismatch, truncation) are written to a CSV file in this storage account containing the error reason and the raw row data.\n\n"
     "3. Memory: This requires allocating memory buffers to store invalid rows before flushing them to the log storage, which can increase memory overhead on the SHIR node under high error rates."),
    
    ("How do you handle and mitigate a StorageException: Server Busy error when executing 100 concurrent Copy Activities pushing data into a single Azure Storage Account?",
     "1. Root Cause: This error indicates storage account ingress throttling. Standard storage accounts have a limit of 20 Gbps ingress bandwidth and 20,000 IOPS.\n\n"
     "2. Mitigation Strategy: (a) Limit pipeline concurrency: Redefine trigger schedules or ForEach concurrency limits to execute fewer concurrent copy tasks. (b) Distribution: Distribute write operations across multiple Storage Accounts and merge them later using virtual network routings. (c) Staging tuning: Enable staging options and adjust block sizes to ensure write requests are optimized for blob storage write patterns, preventing the storage engine from returning busy errors."),
    
    ("What is the impact of configuring maxConcurrentConnections at the Linked Service level vs. configuring it within the dataset properties or the Copy Activity itself?",
     "1. Linked Service Level: Limits the total number of concurrent connections established to the source system across *all* active pipelines in the entire factory. This protects target systems from database pool exhaustion.\n\n"
     "2. Dataset/Activity Level: Restricts connections only for that specific task. If set to 1, it forces sequential processing for that activity, even if the ForEach loop concurrency is set to 50, providing a way to throttle specific queries while keeping other pipelines free to utilize the database pool."),
    
    ("How do you optimize network throughput when transferring large volumes of unstructured data across different Azure regions using the Azure Integration Runtime?",
     "1. Region Matching: Create the Azure Integration Runtime in the same region as the sink storage account to optimize write paths.\n\n"
     "2. Bandwidth allocation: Utilize the maximum DIU setting to allocate more network bandwidth channels. ADF will distribute the unstructured data across multiple transfer streams.\n\n"
     "3. ExpressRoute/Backbone routing: Ensure the VNet configuration utilizes Azure Virtual Network peering, routing all cross-region traffic over Microsoft's high-speed global WAN network rather than the public internet, reducing latency and avoiding VPN overhead."),
    
    ("Explain how to configure sink-side partitioning when copying data from a flat CSV file into an Azure Cosmos DB (NoSQL API) collection to maximize Request Unit (RU) utilization.",
     "1. Partition Key Alignment: Ensure that the partition key defined in the Cosmos DB collection is included in the CSV columns mapped in the Copy Activity.\n\n"
     "2. Parallel Writes: Configure the Copy Activity's `parallelCopies` and write throughput settings to match the number of partitions in Cosmos DB. This ensures rows are written in parallel across partitions.\n\n"
     "3. RU Management: Adjust the write throughput rate inside the Cosmos DB sink settings in ADF to prevent hitting the collection's max limit, which throws HTTP 429 throttling errors and slows down copy throughput."),
    
    ("How do you troubleshoot a Copy Activity that spends 45 minutes in the \"Queued\" status before transitioning to the \"In Progress\" status?",
     "1. Resource Allocation: A long queued status indicates that the Integration Runtime does not have available compute nodes to execute the copy job.\n\n"
     "2. Check SHIR limits: If using an SHIR, check if the active nodes have reached their `ConcurrentJobsLimit`. New jobs wait in queue until active jobs complete.\n\n"
     "3. Check Azure IR limits: If using Azure IR with Managed VNet, the queue time is caused by cluster spin-up delays or subscription core quota exhaustion. Increase subscription limits or enable TTL to bypass this latency."),
    
    ("What are the specific performance implications of choosing Preserve Hierarchy vs. Flatten Hierarchy vs. Merge Files in a Copy Activity copy behavior configuration?",
     "1. Preserve Hierarchy: Copies the directory structure to the destination. Highly efficient as ADF writes files to matching folder paths without scanning file contents.\n\n"
     "2. Flatten Hierarchy: Removes folders and writes all files into a single destination directory. Can cause name conflicts and increases write latency as ADF checks file names.\n\n"
     "3. Merge Files: Combines data from all source files into a single file at the destination. Highly CPU-intensive as ADF reads all records in memory, processes formatting delimiters, and writes a single file, bottlenecking copy speed."),
    
    ("How do you optimize the data extraction speed from a legacy SAP ECC instance using the operational data provisioning (ODP) framework in ADF?",
     "1. SAP ODP Connector: Use the SAP Table or SAP CDC connector which utilizes the ODP framework. This framework is highly optimized for delta extraction.\n\n"
     "2. Partition settings: Configure partition options in the SAP dataset using a high-cardinality index column (like Document Number).\n\n"
     "3. Max Connections: Set `parallelCopies` to match the SAP application server capacity, allowing ADF to pull data streams in parallel from different SAP dialog work processes, increasing extraction speed."),
    
    ("What is the exact purpose of the sinkDialect parameter, and how does it alter the underlying SQL commands generated by ADF during an upsert operation?",
     "1. Dialect translation: The `sinkDialect` specifies the SQL flavor used by the sink database (e.g., Azure SQL, Azure Synapse, Snowflake).\n\n"
     "2. Upsert mechanics: When performing an upsert, ADF uses this dialect to construct database-specific merge commands. For Azure SQL, it generates a standard `MERGE` statement. For Snowflake, it generates a `MERGE INTO` query matching the target schema, ensuring database engine optimizations are utilized correctly."),
    
    ("How do you configure a Copy Activity to perform a high-speed incremental upsert into an Azure SQL Database using a custom staging table and a merge statement rather than the native upsert UI?",
     "To run a custom fast staging upsert:\n\n"
     "1. Copy to Staging: In the Copy Activity, configure the sink to load the source data into a temporary/staging table (e.g., `stg.MyTable`) using bulk inserts (`writeBatchSize=100000`).\n\n"
     "2. Post-Copy script: In the Copy Activity 'Stored Procedure' or 'Post-copy script' settings, write a SQL query that executes a merge statement: `MERGE INTO dbo.TargetTable AS t USING stg.MyTable AS s ON t.Id = s.Id WHEN MATCHED THEN UPDATE... WHEN NOT MATCHED THEN INSERT...`.\n\n"
     "3. Cleanup: The script truncates or drops the staging table. This runs the merge operation locally within the database engine, bypassing slow row-by-row UI upsert updates."),
    
    ("Explain how row-delimiters and column-delimiters containing special characters impact the memory consumption and parsing throughput of the ADF delimited text engine.",
     "1. Parsing overhead: Standard single-character delimiters (e.g., `,` or `\n`) are parsed at the hardware level by the IR engine. If delimiters contain complex multi-character strings (e.g., `##|##`), the parser must buffer rows in memory to perform string scanning.\n\n"
     "2. Memory Bloat: If data contains unescaped delimiters, rows fail to terminate correctly, causing the engine to load massive text blocks in memory thinking it is a single row, which can crash the process with OutOfMemory errors.\n\n"
     "3. Recommendation: Use standard single-character delimiters, and ensure column wrapping/escapes (e.g., double quotes) are enabled to prevent parsing failures and reduce memory footprint."),
    
    ("How do you maximize data movement throughput when copying data out of an Amazon Redshift cluster into an Azure landing zone?",
     "1. S3 Staging: Enable staged copy in the ADF Copy Activity settings. This instructs Redshift to execute a fast `UNLOAD` command to export data in parallel to an Amazon S3 bucket.\n\n"
     "2. Multi-threaded Transfer: ADF then copies the data from S3 to ADLS Gen2 using multi-threaded HTTPS transfers, bypassing JDBC query limits.\n\n"
     "3. Throughput Tuning: Configure high DIUs (e.g., 64) and set `parallelCopies` to utilize the S3 bucket's parallel download channels, increasing data movement speed."),
    
    ("What happens to the DIU allocation when a pipeline executes a Copy Activity between two on-premises data sources routed via a network of two independent SHIR clusters?",
     "1. DIU Ignore: When copying data between two on-premises sources using SHIR, the DIU setting (which is cloud-only compute) is ignored by the execution engine.\n\n"
     "2. Node Compute: The copy job relies entirely on the CPU, memory, and network resources of the host VMs running the SHIR nodes.\n\n"
     "3. Queue management: The job is routed to the SHIR associated with the source (or sink depending on connection direction). Ensure both SHIR clusters have high-performance VM specs to avoid network bottlenecks."),
    
    ("How do you tune the maxRowsPerFile property to generate perfectly balanced, optimized Parquet file sizes for downstream Azure Databricks consumption?",
     "1. File Size optimization: Databricks performs best when reading Parquet files that are between 128MB and 512MB in size. Very small files cause file system scanning latency.\n\n"
     "2. Tuning maxRowsPerFile: Calculate the average row size. Set `maxRowsPerFile` in the Copy Activity sink properties to a value that matches this target size (e.g., 1 million rows for typical schemas). ADF will automatically split the output stream into multiple balanced files, maximizing Databricks scan efficiency."),
    
    ("Explain the internal caching mechanics of a Lookup Activity. What is the hard memory limit for data cached by a single Lookup Activity run?",
     "1. Caching Mechanics: When a Lookup Activity executes, it fetches the query results from the source and loads the entire dataset into the memory space of the active Integration Runtime node as a JSON array.\n\n"
     "2. Memory Limit: The Lookup activity has a hard limit of 5,000 rows and a maximum payload size of 4MB. If the query returns more rows or bytes, the activity fails.\n\n"
     "3. Architectural Design: For larger datasets, do not use Lookup. Use a Copy Activity to write data to a staging file, and process it using a script or Mapping Data Flow, which handles large-scale operations."),
    
    ("How do you eliminate the performance overhead of schema auto-mapping in an enterprise pipeline with thousands of columns?",
     "1. Explicit Mappings: In the Copy Activity settings, click 'Import Schemas' to generate a static column mapping list. This prevents the ADF execution engine from querying the source database catalog to resolve schemas on each pipeline execution.\n\n"
     "2. Performance Gain: Static JSON mappings reduce startup latency, prevent schema validation lockups, and ensure that data is loaded directly to the target columns, which is critical when processing thousands of tables dynamically."),
    
    ("How do you handle a scenario where a REST API endpoint limits pagination to 100 records per page and enforces a strict rate limit of 5 requests per second?",
     "1. Pagination configuration: Configure pagination rules in the REST Dataset or Copy Activity (e.g., target page query parameter `page`).\n\n"
     "2. Rate Limiting: You cannot configure a wait timer inside a single Copy Activity. To avoid rate limits, place the Copy Activity inside a ForEach loop. Execute queries page-by-page, and add a Wait activity (e.g., 1 second) inside the loop, preventing the API from throwing 429 errors.\n\n"
     "3. Sequential execution: Set `isSequential=true` on the ForEach loop to ensure requests do not run in parallel, staying within the 5 requests/sec threshold."),
    
    ("How do you configure the isolationLevel property in a SQL sink to ensure that intensive data loads do not block active transactional users on the target database?",
     "1. Isolation Level: Set the `isolationLevel` property in the SQL Sink settings inside the Copy Activity JSON definition.\n\n"
     "2. Read Committed Snapshot: Configure the isolation level to `ReadCommitted` or `Snapshot` if enabled on the database. Alternatively, set it to `ReadUncommitted` (NOLOCK) to prevent the copy job from acquiring shared locks on target rows, ensuring transactional users can query and update rows without being blocked."),
    
    ("Explain how the sessionLog setting in a Copy Activity impacts execution duration and how to interpret the resulting performance metrics logs.",
     "1. Session Log: Captures detailed row-level logging during copy execution, writing logs to a staging storage account.\n\n"
     "2. Performance Impact: Writing logs increases execution duration due to additional storage I/O operations, particularly under high parallel copies settings.\n\n"
     "3. Metrics Analysis: The logs show the exact time spent on file scanning, connection setup, and database writing. Use this to identify whether network latency or sink write speed is the bottleneck."),
    
    ("How do you design a high-throughput data replication architecture for a source system that blocks parallel queries and only allows a single sequential connection?",
     "1. Staging Data: Use a fast Copy Activity configured with a single connection thread to read the source data as quickly as possible, writing the raw stream to an intermediate staging container in ADLS Gen2.\n\n"
     "2. Downstream Parallelism: Once the staging file is created, trigger parallel downstream Mapping Data Flows or Copy activities to transform and load the data to final sinks. This isolates the slow sequential read to the source and maximizes cloud compute scaling."),
    
    ("What are the performance trade-offs of using an inline dataset vs. a reusable shared dataset inside a high-frequency loop?",
     "1. Shared Dataset: Placed in the factory definitions. Reusable across multiple pipelines. Reusable design reduces maintenance but adds metadata resolution latency during compile times.\n\n"
     "2. Inline Dataset: Defined inside the pipeline activity JSON. Eliminates cross-reference lookups, decreasing pipeline compilation and start time. This is highly effective for high-frequency loops where millisecond latency counts."),
    
    ("How do you handle an intermittent \"Operation on target failed. Connection lease expired\" error when copying data from an on-premises network over an unstable VPN?",
     "1. Network Check: This error indicates network connection drops between the SHIR and the ADF gateway during a long data transfer task.\n\n"
     "2. Resolution: (a) Enable staging in the Copy Activity to break the transfer into smaller, manageable chunks. (b) Configure the 'Retry' property on the activity to 3 retries with a 30-second interval. (c) Adjust VPN TCP window settings to prevent packet fragmentation over the unstable tunnel."),
    
    ("Explain how to optimize the compression level (e.g., Snappy, GZip, Deflate) inside a copy activity to balance CPU utilization on the SHIR vs. network transit time.",
     "1. Snappy (Fastest): Low CPU utilization. Ideal if the SHIR VM has CPU limitations but network bandwidth is high. Provides moderate compression size.\n\n"
     "2. GZip (Balanced): Higher compression ratio than Snappy, but requires more CPU cycles to compress/decompress. Best for general use cases.\n\n"
     "3. Deflate (Maximum Compression): Highest compression ratio, smallest file sizes, but extreme CPU utilization. Use only if network bandwidth is highly restricted (e.g., slow satellite connections) and the SHIR has idle CPU cores."),
    
    ("How do you programmatically extract and log the interleaved vs. sequential performance breakdown numbers from the JSON output of a completed Copy Activity?",
     "1. Output Parsing: Parse the Copy Activity JSON output object, specifically looking at the `executionDetails` array.\n\n"
     "2. Metrics: Extract variables like `throughput` (KB/s), `duration` (seconds), `connectionAllocationTime`, and `dataMovementDuration`.\n\n"
     "3. Logging: Pass these metrics using a pipeline expression to a Stored Procedure activity that writes the values to a SQL database for historical performance auditing."),
    
    ("How do you bypass the limitation where ADF cannot natively copy binary files directly from an HTTP source without treating them as text documents?",
     "1. Binary Format: In the HTTP source dataset settings, select 'Binary' as the file format. This disables parsing checks.\n\n"
     "2. Binary Sink: Select 'Binary' as the sink format (e.g., ADLS Gen2). ADF will stream the raw byte stream directly to storage, transferring ZIP, EXE, or PDF files without modification or format parsing failures."),
    
    ("What is the structural impact on target index fragmentation when loading data into a clustered columnstore index via an ADF Copy Activity?",
     "1. Rowgroup Fragmentation: Columnstore indexes perform best when data is loaded in bulk sizes of 1,048,576 rows (the max rowgroup size).\n\n"
     "2. Small Batches: If `writeBatchSize` is set to small values (e.g., 50,000), ADF creates small, fragmented delta stores that degrade read performance. Set `writeBatchSize` to at least 102,400 rows to bypass delta stores and write directly to compressed rowgroups."),
    
    ("How do you optimize a pipeline that must load data into a target SQL Server table while preserving identity values without modifying the underlying database DDL permissions permanently?",
     "1. Keep Identity setting: In the SQL Sink properties of the Copy Activity, enable the 'Keep Identity' check box. This instructs the bulk insert engine to execute `SET IDENTITY_INSERT Table ON` during the copy session.\n\n"
     "2. Permission Bypass: This executes within the context of the bulk copy connection, preserving source identity values without requiring permanent database schema modifications or admin privileges on the destination tables.")
]

for idx, (q, a) in enumerate(scale_questions):
    adf_part1.append({
        "id": f"adf-scale-{idx+1}",
        "category": "ADF",
        "niche": "Scaling, Throughput Optimization, & Copy Activity Bottlenecks",
        "question": q,
        "answer": a
    })

# Niche 4: Mapping Data Flows & Spark Execution Mechanics
mdf_questions = [
    ("Explain the internal compilation process of an ADF Mapping Data Flow. How is the JSON definition translated into executable Scala/Spark code?",
     "1. AST Parsing: ADF Mapping Data Flows are defined in JSON templates. When executed, the ADF service parses this JSON into an Abstract Syntax Tree (AST).\n\n"
     "2. Translation: The AST is passed to the Data Flow compiler, which translates the logical transformations (filters, joins, selects) into Scala source code representing Spark execution plans.\n\n"
     "3. Execution: The Scala code is compiled and submitted to the Spark cluster as a job. The Spark optimizer (Catalyst) converts the Scala commands into physical DAG execution steps, routing partition loads across the Spark nodes."),
    
    ("What is the precise architectural difference between choosing a Memory Optimized cluster type vs. a General Purpose cluster type for a Mapping Data Flow Integration Runtime?",
     "1. General Purpose: Allocates standard VM compute. Best for standard data transformations (sorting, schema mapping) where memory capacity is not a constraint.\n\n"
     "2. Memory Optimized: Allocates VMs with a higher RAM-to-CPU ratio. Crucial for memory-heavy transformations like large joins, aggregations, windowing functions, and caching, as it prevents Spark from spilling data to disk, which degrades throughput."),
    
    ("How do you detect and remediate severe data skew (partition skew) inside a Mapping Data Flow using native monitoring graphs?",
     "1. Graph Inspection: In the Data Flow monitoring view, inspect the partition sizes chart. If one partition has significantly higher data volume or takes longer to execute than others, data skew is present.\n\n"
     "2. Remediation: Apply a custom partitioning strategy. Use 'Hash' partitioning on a column with high cardinality (e.g., `UserId`) to distribute rows evenly across Spark workers, preventing a single node from running out of memory."),
    
    ("Explain how to implement a Type 2 Slowly Changing Dimension (SCD Type 2) architecture inside a Mapping Data Flow using Alter Row, Lookup, and Select transformations.",
     "To run SCD Type 2 in Mapping Data Flows:\n\n"
     "1. Lookup: Load the source data and execute a Lookup against the target dimension table matching on the business key.\n\n"
     "2. Conditionally split: Use a Conditional Split transformation. Route new rows (unmatched key) to an Insert path. Route modified rows to an Update path.\n\n"
     "3. Alter Row: For updates, use an Alter Row transformation. Mark the old target row status as inactive (`Update` policy, setting `EndDate = current_date()`). Mark the new incoming row for insertion, using select to map surrogate keys, completing history tracking in parallel."),
    
    ("What are the performance consequences of choosing Broadcast: Auto vs. explicitly forcing a broadcast optimization on a specific branch of a Join transformation?",
     "1. Auto Broadcast: The Spark engine decides whether to broadcast a table based on size estimates. If a table size is miscalculated, it may perform a slow shuffle join instead.\n\n"
     "2. Forced Broadcast: Explicitly setting Broadcast to 'Fixed' on a small branch (e.g., <50MB) skips partition shuffling. The small table is sent directly to all worker nodes, speeding up join execution dramatically."),
    
    ("How do you configure a Custom Partitioning strategy (e.g., Hash vs. Dynamic Range) inside a Mapping Data Flow to maximize utilization across 16 Spark worker nodes?",
     "1. Custom Partitioning: In the transformation settings tab, select 'Optimize'. Set Partition type to Custom.\n\n"
     "2. Configuration: Choose 'Hash' partitioning on a key column to distribute data evenly. Set the number of partitions to a multiple of your worker nodes (e.g., 32 partitions for 16 workers) to ensure maximum resource utilization across the Spark cluster."),
    
    ("Explain the internal execution mechanics of the Time To Live (TTL) setting. If a pipeline has 5 Data Flow activities executing sequentially, how exactly does TTL minimize cluster startup times?",
     "1. Warm Cluster: Enabling TTL keeps the allocated Spark nodes active after a Data Flow finishes.\n\n"
     "2. Subsequent runs: When the next Data Flow activity executes, the ADF engine detects the warm cluster. It skips the 3-5 minute OS boot and Spark initialization steps, running the transformation instantly, saving time and costs across sequential pipeline runs."),
    
    ("How do you implement an enterprise-wide fuzzy lookup transformation inside a Mapping Data Flow to match records with slight typographical variations?",
     "1. Fuzzy Join: Set up a Join transformation. In the join conditions, select the target lookup columns.\n\n"
     "2. Edit Distance: Use the expression helper to write a condition using edit distance algorithms: `soundex(source.name) == soundex(target.name)` or custom thresholds (`editDistance(source.name, target.name) <= 2`), which matches variations dynamically."),
    
    ("What is the structural difference between a Select transformation and a Derived Column transformation regarding memory allocation and Spark execution graph optimization?",
     "1. Select: Alters column metadata (names, removal, type casts). It is resolved during Catalyst compilation, creating zero execution overhead.\n\n"
     "2. Derived Column: Generates new column data or executes calculations. This requires allocation of memory buffers on Spark workers to execute expressions (e.g., string parsing) on each row during execution."),
    
    ("How do you handle complex schema drift scenarios where incoming JSON payloads continuously alter their nested array structures without failing downstream schema validations?",
     "1. Allow Schema Drift: Enable 'Allow schema drift' in the Source settings.\n\n"
     "2. Late Binding: Use the `byName()` or `byPosition()` expression functions to query columns dynamically in downstream transformations, allowing Spark to process unmapped fields without compilation errors."),
    
    ("Explain the exact behavior of the Pivot and Unpivot transformations in Mapping Data Flows. How do you make a Pivot transformation completely dynamic if the pivot values are unknown at design time?",
     "1. Pivot: Converts row values into columns. Unpivot does the reverse.\n\n"
     "2. Dynamic Pivot: You cannot easily generate dynamic column schemas at runtime if they are unknown. To bypass this, write a Pre-SQL step to query unique values, and pass them as a parameter array to the Pivot transformation configuration, creating dynamic headers."),
    
    ("How do you optimize a Mapping Data Flow that processes data from a single massive 500GB CSV file stored in ADLS Gen2? What partitioning option should you apply at the source step?",
     "1. Source Partitioning: In the Source Optimize tab, select 'Read partitioning'. Choose 'Round Robin' or 'Key' partitioning.\n\n"
     "2. Speed: This splits the massive CSV file read operation across the Spark worker nodes in parallel, bypassing the single-thread read bottleneck of ADLS."),
    
    ("What is the internal execution behavior of the Window transformation? How do you prevent out-of-memory (OOM) exceptions when calculating moving averages over millions of rows?",
     "1. Windowing: Groups rows in memory to compute rolling aggregates.\n\n"
     "2. OOM Prevention: Ensure you define a clear partition column in the Window settings. If you calculate aggregates over the entire dataset without partitioning, Spark will route all rows to a single node, causing OOM errors."),
    
    ("How do you execute custom SQL scripts or DDL commands before and after data processing inside a Mapping Data Flow sink?",
     "1. Pre/Post SQL: In the Sink settings tab, expand the 'Custom SQL' options. Enter your SQL commands (e.g., `TRUNCATE TABLE target`) in the Pre-SQL or Post-SQL fields. These run inside the target database connection context before/after the Spark write operation."),
    
    ("Explain the exact mechanism of the Cached Lookup feature inside Mapping Data Flows. When should it be used over a standard inline Lookup transformation?",
     "1. Cached Lookup: Writes lookup table data to a fast in-memory Spark cache. Downstream transformations query this cache using expressions.\n\n"
     "2. When to Use: Use when the lookup table is small (<100MB) and queried multiple times across different branches, avoiding database join roundtrips."),
    
    ("How do you configure a Mapping Data Flow to write to multiple completely independent sinks while guaranteeing transactional atomicity across all sinks?",
     "1. No Atomicity: Spark executes writes in parallel across workers. You cannot guarantee transactional atomicity across independent sinks natively in Spark.\n\n"
     "2. Mitigation: Write data to a staging database first, and run a post-copy transaction script to update final tables simultaneously inside a single transaction."),
    
    ("What happens to Spark partition layouts when you combine multiple data streams using a Union transformation inside a Data Flow?",
     "1. Partition Merge: Spark combines the partition plans of both streams. If one stream has 10 partitions and the other has 20, the unioned stream will have 30 partitions by default, which can cause partition skew if not repartitioned."),
    
    ("How do you debug a cryptic DF-SYS-01: Job failed due to reason: Container killed by YARN for exceeding memory limits error in a Mapping Data Flow?",
     "1. Memory limits: YARN kills containers when memory utilization (including JVM heap and overhead) exceeds limits.\n\n"
     "2. Resolution: (a) Increase integration runtime compute size. (b) Change cluster type to Memory Optimized. (c) Optimize partitioning to prevent skew and OOM on worker nodes."),
    
    ("Explain the difference between using a Parse transformation vs. a Derived Column expression to unpack a complex stringified JSON blob inside a database column.",
     "1. Parse: Parses JSON strings and outputs structured columns with defined schemas.\n\n"
     "2. Derived Column: Requires manually writing string slicing or extraction functions (e.g., `substring`), which is hard to maintain and slower than Parse's optimized JSON reader."),
    
    ("How do you configure single-row tracking or generate a surrogate key across a highly distributed Spark cluster environment without causing serialization bottlenecks?",
     "1. Surrogate Key: Use the Surrogate Key transformation. It generates an incrementing value.\n\n"
     "2. Avoid Bottlenecks: Set a partition key to allow workers to generate keys in ranges locally (e.g., worker 1 gets 1-1M, worker 2 gets 1M-2M), avoiding global serialization locks."),
    
    ("What are the performance implications of enabling the Re-validate schema option in a Mapping Data Flow Sink transformation?",
     "1. Performance Check: Re-validate schema forces the engine to query the destination table schema for every batch. This adds latency to the write path. Disable it if schemas are static to maximize throughput."),
    
    ("How do you handle error row routing inside a Data Flow so that rows failing a specific condition or data type cast are written to a dead-letter log while valid rows continue to the destination?",
     "1. Split Path: Use a Conditional Split transformation. Route rows that fail validation checks (`isError == true` or null checks) to a dead-letter storage sink (e.g., ADLS Gen2). Route valid rows to the primary sink."),
    
    ("Explain how the Flatten transformation operates on highly nested JSON arrays under the hood. How does it alter the root row multiplicity count?",
     "1. Array Unpacking: Flatten extracts elements from a nested array. Under the hood, it performs a cross-product (join) between the parent row and the array items, multiplying the root row count by the array length."),
    
    ("How do you utilize the Stringify transformation, and what are its primary use cases when prepping data for an upstream event ingestion framework?",
     "1. Stringify: Converts complex structured columns (structs, arrays) into a single stringified JSON text block, which is required when writing payloads to queues like Event Hubs or Kafka."),
    
    ("What is the difference between an inline dataset and a standard dataset inside a Mapping Data Flow, and how does it affect execution parameterization?",
     "1. Inline dataset: Defined inside the Data Flow JSON, allowing dynamic schema configurations. Standard datasets are reusable across the factory but require pre-defined schemas, limiting runtime parameter flexibility."),
    
    ("How do you configure a data flow to dynamically filter rows using an array parameter passed down from the parent pipeline control flow?",
     "1. Array Filtering: Define a Data Flow Parameter of type Array. In a Filter transformation, use the expression: `in(parameters.myArray, CategoryId)` to filter rows dynamically matching the parameter array values."),
    
    ("Explain how to optimize a Mapping Data Flow sink when writing to an Azure Cosmos DB instance to prevent partition key allocation imbalances.",
     "1. Partition Key writing: Match the source partition layout to the Cosmos DB partition key. This ensures write requests are distributed evenly across Cosmos partitions, avoiding RU throttling on single partition keys."),
    
    ("What is the behavior of the Assert transformation in a Data Flow, and how do you access the validation failure metadata logs in a subsequent activity?",
     "1. Assert: Validates rows against custom rules. Failed rows are marked with error flags. Access failure details in the target Sink log output or query the `assert` metadata inside downstream activities."),
    
    ("How do you bypass the limitation where Mapping Data Flows cannot natively utilize a Self-Hosted Integration Runtime directly for Spark compute?",
     "1. Bypassing SHIR limit: Mapping Data Flows must run on Azure Integration Runtime compute. To process private data, use Managed VNet IR with Private Endpoints to the source, bypassing the need for an on-premises SHIR."),
    
    ("Explain how the Map Each expression function works inside a corporate data flow template to mass-rename hundreds of incoming columns based on regex patterns.",
     "1. Map Each: Processes columns in a Select transformation. Use expressions like `$$ = regexReplace($$, '[^a-zA-Z0-9]', '_')` to clean and rename all incoming columns dynamically using regex patterns."),
    
    ("How do you tune the Spark memory fraction parameters (spark.memory.fraction and spark.memory.storageFraction) implicitly through ADF Integration Runtime settings?",
     "1. Implicit Tuning: You cannot set Spark properties directly in ADF. Instead, change the IR settings (e.g., select Memory Optimized cluster types or adjust cores) to implicitly scale memory boundaries."),
    
    ("What is the performance impact of using the Rank transformation vs. the Dense Rank transformation inside a multi-partition Spark execution?",
     "1. Rank vs Dense Rank: Both require shuffling data to partition workers. Rank may require additional calculations to handle gaps in rank sequences, making Dense Rank slightly faster in large-scale partitions."),
    
    ("How do you design a data flow that reads historical data, compares it against delta streams, and outputs isolated files for inserts, updates, and deletes?",
     "1. Data Sync Plan: Use a Join (outer join) on keys. Use conditional splits: rows with null historical key are Inserts; unmatched delta keys are Deletes; matching keys with changed hash values are Updates. Write each path to a separate folder."),
    
    ("Detail how to use the Aggregate transformation to eliminate duplicate records based on a composite key while selecting the row containing the maximum timestamp value.",
     "1. Deduplication: In the Aggregate Group By settings, select the composite keys. In the Aggregates tab, define expressions: `MaxTimestamp = max(Timestamp)` and use `last(Column)` to select values matching the max timestamp row."),
    
    ("How do you handle a scenario where your Mapping Data Flow needs to query an external REST API for every row in a stream of 1 million records?",
     "1. External call: Running REST queries row-by-row in Spark causes severe performance degradation. Instead, batch requests using Custom Python/Spark code in Databricks, or write data to staging and query APIs in chunks using ADF Web Activities.")
]

for idx, (q, a) in enumerate(mdf_questions):
    adf_part1.append({
        "id": f"adf-mdf-{idx+1}",
        "category": "ADF",
        "niche": "Mapping Data Flows & Spark Execution Mechanics",
        "question": q,
        "answer": a
    })

# Write adf_part1.json
with open("/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/adf_part1.json", "w") as f:
    json.dump(adf_part1, f, indent=2)

print("ADF Part 1 JSON generated successfully.")
