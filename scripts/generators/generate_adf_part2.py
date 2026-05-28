import json

# ADF Part 2: Niches 5-7
adf_part2 = []

# Niche 5: CI/CD, Enterprise Deployment, ARM Templates, & Git Integration
cicd_questions = [
    ("Explain the exact mechanics of the adf_apps or adf-publish branch. Why should developers never merge changes directly into the adf-publish branch manually?",
     "1. The Publish Branch: The `adf-publish` (or `adf_apps`) branch is managed by the ADF service. It stores the generated ARM templates containing the physical definitions of the factory resources (pipelines, datasets, triggers).\n\n"
     "2. Automation: When a developer clicks 'Publish' in the ADF UI while connected to the collaboration branch (e.g., `main`), the ADF service reads the JSON code, validates it, and generates the corresponding ARM templates. It writes these files directly to the `adf-publish` branch.\n\n"
     "3. Why avoid manual merges: Manual merges to this branch will cause Git desynchronization. The ADF UI expects the publish branch to be in a specific format mapped to the UI state. A manual merge introduces untracked JSON changes that the ADF service cannot validate, corrupting deployments and preventing the UI from loading."),
    
    ("How do you configure an automated Azure DevOps release pipeline to deploy ADF across Dev, QA, and Prod environments using the automated NPM package method instead of exporting ARM templates from the UI?",
     "To automate ADF deployment using the modern NPM package method:\n\n"
     "1. Build step: In your Azure DevOps Build pipeline, install the ADF utilities NPM package: `npm install @microsoft/azure-data-factory-utilities`.\n\n"
     "2. Run Validation: Execute the validation script: `node node_modules/@microsoft/azure-data-factory-utilities/lib/index.js validate <source_folder> <factory_id>`. This checks JSON files for syntax errors.\n\n"
     "3. Export Templates: Run the export command: `node node_modules/@microsoft/azure-data-factory-utilities/lib/index.js export <source_folder> <factory_id> <export_folder>`. This generates ARM templates dynamically. Publish the export folder as an artifact.\n\n"
     "4. Release step: In the Release pipeline, deploy the ARM templates using the standard Azure Resource Group Deployment task, replacing environment parameters dynamically, bypassing the need for manual publishing from the UI."),
    
    ("How do you parameterize Linked Service properties (such as base URLs or database names) that are not exposed by default in the standard ADF ARM template parameter configuration file?",
     "1. Custom Parameterization file: Create a custom parameterization configuration file named `arm-template-parameters-definition.json` in the root of your ADF repository.\n\n"
     "2. Defining properties: Inside this file, specify rules to expose the target properties. For example, to expose the connection string and base URL of HTTP linked services:\n"
     "`\"Microsoft.DataFactory/factories/linkedservices\": { \"properties\": { \"typeProperties\": { \"baseUrl\": \"=-\", \"connectionString\": \"=-\" } } }`.\n\n"
     "3. Code Generation: During ARM template export, the ADF compiler parses this file and automatically adds these parameters to the ARM parameters file, allowing you to override them in your CI/CD release variables."),
    
    ("Explain how to create a custom arm-template-parameters-definition.json file to enforce custom parameterization rules for all datasets and linked services across an enterprise.",
     "1. File Placement: Place `arm-template-parameters-definition.json` in the root of the ADF Git repository collaboration branch.\n\n"
     "2. Syntax: The JSON structure maps Azure resource types to parameter definitions. Use `=` to indicate that a parameter should be generated, and `-` to define default names based on resource attributes.\n\n"
     "3. Standardization: Define rules for all resources: `\"Microsoft.DataFactory/factories/datasets\": { \"*\": { \"properties\": { \"location\": { \"*\": \"=-\" } } } }` to parameterize all storage folder paths. This enforces consistent parameterization across the enterprise, preventing developers from manually overriding configurations."),
    
    ("How do you handle a merge conflict in the Git repository of an ADF instance when two developers modify the same pipeline concurrently? Detail the recovery process.",
     "1. Conflict Cause: ADF stores pipelines as individual JSON files. If two developers edit the same pipeline, Git cannot merge changes automatically, resulting in merge conflicts on pull requests.\n\n"
     "2. Recovery Process:\n"
     "- Clone the repository locally and check out the feature branch.\n"
     "- Open the conflicting pipeline JSON file in a text editor (like VS Code).\n"
     "- Resolve the standard Git conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) manually, keeping the valid JSON syntax.\n"
     "- Commit the resolved JSON file and push it back to the branch.\n"
     "- In the ADF portal, refresh the Git connection. The UI will reload the resolved pipeline, allowing you to proceed with publishing."),
    
    ("What happens to active pipeline triggers when you deploy an updated ARM template into a production Data Factory? How do you gracefully stop and restart triggers during deployment?",
     "1. Deployment Failure: If you attempt to redeploy or modify an active trigger using an ARM template, the deployment will fail because Azure Resource Manager cannot update resources that are locked in an active state.\n\n"
     "2. Graceful stop: Before executing the ARM deployment task in your release pipeline, run a pre-deployment PowerShell script to query and stop all active triggers in the target factory: `Stop-AzDataFactoryV2Trigger -ResourceGroupName $rg -DataFactoryName $df -Name $triggerName`.\n\n"
     "3. Post-Deployment: After the ARM deployment completes successfully, run a post-deployment script to restart the triggers: `Start-AzDataFactoryV2Trigger` to resume schedules, preventing deployment failures and ensuring consistent execution states."),
    
    ("How do you design a post-deployment script in Bash or PowerShell to clean up deleted activities or orphaned components that remain in target environments after an incremental ARM deployment?",
     "1. The issue: Incremental ARM deployments only add or update resources; they do not delete resources that were removed in the source branch, leaving orphaned pipelines in production.\n\n"
     "2. Cleanup Script: Write a PowerShell script that executes post-deployment:\n"
     "- Fetch all resources in the target factory using `Get-AzDataFactoryV2Pipeline -ResourceGroupName $rg -DataFactoryName $df`.\n"
     "- Fetch the current list of pipelines in the Git repository main branch.\n"
     "- Compare the lists to identify orphaned pipelines.\n"
     "- Loop through and delete orphaned resources: `Remove-AzDataFactoryV2Pipeline -ResourceGroupName $rg -DataFactoryName $df -Name $orphanedName -Force`, keeping target environments clean and synchronized with Git."),
    
    ("How do you resolve the \"Resource deployment loop or circular dependency\" error during an ADF ARM template deployment in Azure DevOps?",
     "1. Root Cause: This error occurs when resource definitions contain dependencies that loop back on themselves (e.g., Linked Service A references Key Vault B, which references secret credentials that rely on a connection from LS A).\n\n"
     "2. Resolution: (a) Identify the circular dependency loop in the ARM template's `dependsOn` section. (b) Decouple the resources: remove the direct dependency references between linked services and configure Key Vault access policies separately from database configurations. (c) Group resources into logical parent-child hierarchies to ensure dependencies only flow one way during ARM deployment."),
    
    ("Explain how to manage Global Parameters during a CI/CD deployment. How do you ensure that environment-specific global parameters are overwritten correctly across environments?",
     "1. Global Parameters inclusion: Ensure that 'Include global parameters in ARM template' is enabled in the ADF management portal. This adds global parameters to the output ARM template JSON.\n\n"
     "2. Environment parameters: In your Azure DevOps release pipeline, the global parameters are exposed as standard parameters in the template deployment task.\n\n"
     "3. Overwriting: Define environment-specific variables in your release configuration (e.g., `prodUrl` for production). Map these variables to the global parameter overrides in the ARM deployment task settings, ensuring parameters update dynamically when moving from QA to Production."),
    
    ("How do you manage Git integration when working with a multi-factory architecture (e.g., separate development factories for individual feature teams) feeding into a single production factory?",
     "To manage a multi-factory Git architecture:\n\n"
     "1. Repository Layout: Configure a single Git repository containing separate folders for each development factory (or use separate branches if team isolation is required).\n\n"
     "2. Merging path: Developers commit changes to their respective development factory branches. Pull requests merge these changes into a single consolidated collaboration branch (e.g., `main`).\n\n"
     "3. Compilation & Deploy: The CI/CD pipeline compiles the folder matching the feature team's changes, and deploys it to the corresponding target factory in QA and Production, maintaining a unified deployment flow across separate developer environments."),
    
    ("What is the exact security impact of using Git Live mode vs. Data Factory mode in the ADF user interface?",
     "1. Git Live Mode: The UI displays the code directly from the active Git branch. Changes are saved as commits and are not applied to the actual running Data Factory engine until published. This is safe for developers as work-in-progress code does not affect schedules.\n\n"
     "2. Data Factory Mode: The UI displays the active published state running in the cloud. Changes made here are saved directly to the cloud service. This affects active schedules instantly, representing a security risk if developers make untested modifications directly in production."),
    
    ("How do you configure automated unit testing or automated validation for ADF pipeline JSON definitions before they are allowed to be merged into the main branch?",
     "1. Build Pipeline: Create an Azure DevOps Pull Request validation pipeline that triggers on target branch changes.\n\n"
     "2. Linting & Validation: Use a Node.js script to run the `@microsoft/azure-data-factory-utilities` validation package on the modified files.\n\n"
     "3. Custom Tests: Write python/shell scripts to parse the JSON files and enforce corporate guidelines (e.g., check that all Linked Services use Key Vault, check naming conventions). The PR is blocked from merging if validation fails, enforcing code standards automatically."),
    
    ("How do you manage secret extraction in your ARM templates to ensure that no plain-text database credentials or connection keys are accidentally committed to the enterprise repository?",
     "1. Parameter Exclude: Ensure the custom parameters definition file excludes sensitive values (like passwords or tokens) from standard parameters.\n\n"
     "2. Key Vault references: Enforce the use of Azure Key Vault secret references in all Linked Services connections. The template stores Key Vault secret names (which are not secret), not the actual keys.\n\n"
     "3. Security Scan: Configure secret scanners (like GitHub Advanced Security or Azure DevOps Credential Scanner) to scan commits, blocking any push that contains raw passwords."),
    
    ("Explain how to fix a disconnected Git state where the ADF UI displays an error stating that the factory configuration in the repository does not match the published factory state.",
     "1. Disconnected State: Occurs if the factory has had direct modifications made in Data Factory mode that are not present in the Git repository, or vice versa.\n\n"
     "2. Fix: Re-import or overwrite the Git branch. In the Git settings, select 'Overwrite Data Factory' (which pushes the Git state to the factory) or 'Import from Data Factory' (which pulls the factory state to Git), aligning both configurations and resolving the conflict error."),
    
    ("How do you handle the deployment of a Tumbling Window Trigger that has backfill dependencies on an upstream pipeline that does not exist yet in the target environment?",
     "1. Deploy Order: You cannot deploy a trigger referencing a non-existent pipeline. Configure your CI/CD pipeline to deploy the upstream pipeline first, followed by the downstream pipeline.\n\n"
     "2. Trigger State: Keep the Tumbling Window Trigger disabled (`activated = false`) in the deployment templates. Once all pipelines are deployed, run a script to activate the trigger, preventing scheduling errors during the deployment window."),
    
    ("How do you restrict specific junior developers from publishing changes directly to the factory while allowing them to save their work to individual feature branches?",
     "1. Branch Protection: Enforce branch protection rules on the collaboration branch (e.g., `main`). Require pull request reviews and block direct pushes.\n\n"
     "2. Role Permissions: Assign junior developers the 'Reader' or 'Collaborator' role in Git, and remove the 'Data Factory Contributor' role in Azure RBAC. This allows them to commit changes to feature branches but prevents them from executing the publish command in the ADF UI, which requires contributor permissions."),
    
    ("What is the structural limitation of the 256-KB size ceiling for ARM templates when deploying massive factories containing hundreds of pipelines, and how do you implement linked ARM templates as a workaround?",
     "1. ARM limit: Azure Resource Manager limits a single template file to 256KB. A factory with hundreds of pipelines will easily exceed this limit.\n\n"
     "2. Linked Templates: Configure the ADF deployment to generate Linked ARM templates (this is enabled by default for large factories during UI publish). The main template references secondary templates hosted in an Azure Storage Account. During deployment, Azure resolves and deploys the secondary templates sequentially, bypassing the 256KB file ceiling."),
    
    ("How do you automate the validation of ADF code against corporate naming conventions and design standards using custom static analysis tools during a pull request?",
     "1. Static Analysis: Write a python script that runs inside your PR validation pipeline.\n\n"
     "2. JSON Parsing: The script parses the pipeline JSON files (e.g., checking if activity names contain spaces, or ensuring all copy activities have logging enabled).\n\n"
     "3. PR Comments: Use DevOps API calls to post comments on the PR highlighting rule violations and fail the build step if naming conventions are not met, automating code review checks."),
    
    ("Explain how to parameterize the existing resource references in Bicep when deploying an ADF instance alongside pre-existing network infrastructure.",
     "1. Bicep parameters: In your Bicep file, define parameters for the network details (VNet ID, subnet name) as inputs: `param vnetId string`.\n\n"
     "2. Target Reference: Use the `existing` keyword to reference pre-existing resources without redeploying them:\n"
     "`resource hubVnet 'Microsoft.Network/virtualNetworks@2023-05-01' existing = { name: vnetName }`.\n\n"
     "3. Integration: Reference this existing resource's properties when creating the ADF Managed VNet Integration Runtime, ensuring correct routing configurations in Bicep."),
    
    ("How do you ensure that a pipeline execution currently running in Production is not abruptly killed or corrupted when a new automated CI/CD deployment goes live?",
     "1. No aborts: In-flight runs are not aborted by default during ARM deployments unless you modify or delete the specific pipeline resource currently executing.\n\n"
     "2. Deployment Window: Schedule deployments during low-activity windows. If you must deploy hotfixes, check active pipeline runs via the ADF REST API, and postpone the deployment until critical tasks complete.\n\n"
     "3. Safe deployments: Ensure the ARM deployment task does not include delete script steps for active executing resources, preserving execution threads."),
    
    ("How do you design a rollback mechanism in Azure DevOps to quickly revert a production ADF deployment to the previous stable state in under 2 minutes?",
     "1. Git Rollback: In Git, identify the previous stable commit tag. Revert the collaboration branch to this tag and push the changes.\n\n"
     "2. Automated Release: Run the Azure DevOps release pipeline targeting this reverted commit. The release pipeline will redeploy the stable version of the ARM templates to the target factory, overwriting the buggy changes instantly.\n\n"
     "3. Backup: Keep a copy of the previously compiled templates in a storage container, allowing you to run a deployment task that directly redeploys those files, bypassing code compilation latency."),
    
    ("Explain the role of the publish_config.json file inside an ADF repository and how it influences the generation of the ARM template output.",
     "1. Publish configuration: The `publish_config.json` file is generated by the ADF UI in your repository. It stores parameters and settings configuration (like the target publish branch name and path).\n\n"
     "2. Build control: It tells the ADF service and automated utilities how to export resources, control folder mappings, and rename output templates, guiding the automated compilation process."),
    
    ("How do you handle a scenario where a deployment fails because a target Linked Service reference to a Key Vault secret points to a secret version that has been deprecated or deleted?",
     "1. Versionless Secrets: Do not include the secret version GUID in the Key Vault URI connection string (e.g., use `https://myvault.vault.azure.net/secrets/mysecret` instead of `.../secrets/mysecret/version_id`).\n\n"
     "2. Auto-rotation: This instructs Key Vault to always return the latest active version of the secret. If a version is deprecated, uploading a new secret version resolves connectivity without redeploying the ADF linked service."),
    
    ("What is the mechanism for migrating an ADF instance from an Azure DevOps Git repository to a GitHub Enterprise repository without losing the factory's historical commit logs?",
     "1. Git Repository Clone: Clone the DevOps Git repository locally using the `--mirror` flag: `git clone --mirror <DevOps_URL>`.\n\n"
     "2. Remote Mirroring: Set the target remote to the new GitHub Enterprise repo: `git remote set-url origin <GitHub_URL>`.\n\n"
     "3. Push Logs: Push all branches and commit history to the new repo: `git push --mirror`. In the ADF Git settings, disconnect the old DevOps path and link the new GitHub repository, preserving all commits and logs."),
    
    ("How do you configure automated branch policies to prevent the deletion of the collaboration branch (main) or the publication branch in an enterprise ADF environment?",
     "1. Branch Protection: In Azure DevOps/GitHub settings, open the repository policies. Select the `main` and `adf-publish` branches.\n\n"
     "2. Rules: Enable 'Prevent force push', 'Prevent deletion', and require pull requests with approvals. This blocks any user from deleting critical branches and ensures only validated code is deployed."),
    
    ("Explain how to parameterize the Self-Hosted Integration Runtime reference in an ARM template so that the QA pipeline routes through the QA SHIR and the Prod pipeline routes through the Prod SHIR.",
     "1. IR Parameter definition: In `arm-template-parameters-definition.json`, add a rule to parameterize the integration runtime name for all linked services: `\"Microsoft.DataFactory/factories/linkedservices\": { \"properties\": { \"connectVia\": { \"referenceName\": \"=-\" } } }`.\n\n"
     "2. Release mapping: The IR reference name is exposed in your release variables. Map QA variables to the QA SHIR name, and Prod variables to the Prod SHIR name during deployment."),
    
    ("How do you troubleshoot an ARM deployment error stating: Resource Cannot Be Updated Because It Inherits Properties From An Active Trigger?",
     "1. Root Cause: Occurs if the ARM template contains updates to a pipeline that is referenced by an active trigger. The trigger locks the pipeline configuration.\n\n"
     "2. Fix: Run a pre-deployment PowerShell script to stop the active trigger. Once stopped, execute the ARM deployment. Run a post-deployment script to restart the trigger, resolving the update conflict."),
    
    ("How do you design a zero-downtime hotfix process for a critical bug in a production environment without bypassing the standard Git pull request workflow?",
     "1. Hotfix branch: Create a hotfix branch from the current production tag (`main`).\n\n"
     "2. Local test: Fix the bug and create a PR to merge the hotfix branch back to `main`.\n\n"
     "3. DevOps deployment: The merge triggers the automated validation and release pipeline. The release pipeline deploys the updated templates to QA and Production sequentially, utilizing automated tests to verify the fix, maintaining governance without downtime."),
    
    ("What is the impact of changing a pipeline's name on its historical execution logs and monitoring telemetry inside Azure Log Analytics after a new deployment?",
     "1. Historical Split: Telemetry logs in Log Analytics are linked to the pipeline name. Changing the name creates a new resource path in the logs.\n\n"
     "2. Query Mapping: Historical logs for the old name remain under that name, while new logs write under the new name. You must write SQL/KQL queries that combine both names using search terms to see complete history."),
    
    ("How do you use the ADF REST API programmatically inside a deployment pipeline to verify the status of all triggers post-deployment?",
     "1. Trigger verify: Add an inline Bash/PowerShell task after the deployment step. The script sends GET requests to the ADF Trigger List API.\n\n"
     "2. Status check: Loop through the triggers and check if `properties.runtimeState` equals 'Started'. If any trigger is 'Stopped' (except manual triggers), fail the deployment pipeline or send an alert to notify operations.")
]

for idx, (q, a) in enumerate(cicd_questions):
    adf_part2.append({
        "id": f"adf-cicd-{idx+1}",
        "category": "ADF",
        "niche": "CI/CD, Enterprise Deployment, ARM Templates, & Git Integration",
        "question": q,
        "answer": a
    })

# Niche 6: Monitoring, Custom Logging, Alerts, & Troubleshooting Edge Cases
monitor_questions = [
    ("How do you construct a custom Kusto Query Language (KQL) query in Azure Log Analytics to find the exact root cause of an activity failure inside a nested child pipeline that ran 14 days ago?",
     "To find the root cause of an activity failure in a child pipeline using KQL:\n\n"
     "1. Target Table: Query the `ADFActivityRun` table in Log Analytics.\n\n"
     "2. KQL Query:\n"
     "```kql\n"
     "ADFActivityRun\n"
     "| where TimeGenerated >= ago(14d)\n"
     "| where Status == 'Failed'\n"
     "| project TimeGenerated, PipelineName, ActivityName, ActivityType, ErrorMessage = parse_json(Error).message, ErrorCode = parse_json(Error).errorCode, PipelineRunId\n"
     "| order by TimeGenerated desc\n"
     "```\n"
     "This extracts the exact error message, error code, and activity name from the `Error` JSON payload, allowing you to trace the failed step inside the nested run."),
    
    ("Explain how to stream ADF diagnostic logs (ADFPipelineRunActivityErrors, ADFTriggerEvents) into an external Azure Event Hub for real-time security operations center (SOC) ingestion.",
     "1. Diagnostic Settings: In the ADF instance portal, go to 'Diagnostic Settings'. Click 'Add diagnostic setting'.\n\n"
     "2. Log Selection: Check the tables: `PipelineRuns`, `ActivityRuns`, `TriggerRuns`, and `SandboxActivityRuns` (if running container custom tasks).\n\n"
     "3. Destination: Select 'Stream to an event hub'. Choose your Azure Event Hub namespace and hub name.\n\n"
     "4. SOC Consumption: The SOC team routes the Event Hub stream to their SIEM tool (e.g., Azure Sentinel, Splunk) for real-time threat detection and anomaly auditing."),
    
    ("How do you design a real-time custom alert dashboard in Azure Monitor that triggers an SMS/Email notification only if a specific high-priority pipeline fails three times consecutively within a rolling 30-minute window?",
     "To set up the consecutive failure alert:\n\n"
     "1. Query definition: Write a KQL query in Log Analytics to count failures:\n"
     "```kql\n"
     "ADFPipelineRun\n"
     "| where PipelineName == 'HighPriorityPipeline'\n"
     "| where Status == 'Failed'\n"
     "| summarize FailureCount = count() by bin(TimeGenerated, 30m)\n"
     "```\n"
     "2. Alert rule: In Azure Monitor, create an Alert Rule based on this query. Set the threshold check to 'Greater than or equal to 3'. Configure the evaluation frequency to 5 minutes, targeting an Action Group that sends SMS and Email notifications to the operations team."),
    
    ("What is the exact schema structure of the ADFActivityRun table in Log Analytics, and how do you extract the custom properties outputted by an execution?",
     "1. Schema: The `ADFActivityRun` table contains system fields: `TimeGenerated`, `ResourceId`, `PipelineName`, `ActivityName`, `ActivityType`, `Status`, `ExecutionDetails`, and `UserProperties`.\n\n"
     "2. Custom Properties: Custom properties defined on the activity are written inside the `UserProperties` column. Use the KQL `bag_unpack` or `parse_json` functions to extract them: `| extend customVal = parse_json(UserProperties).MyCustomKey`, allowing analysis of custom logging fields."),
    
    ("How do you troubleshoot a pipeline that intermittently fails with a UserErrorJsonParsingFailed error when reading metadata from an upstream Web activity?",
     "1. Validation: This error occurs when the upstream Web activity response is not a valid JSON structure (e.g., returns HTML error pages or empty strings).\n\n"
     "2. Fix: (a) Add check logic: in your downstream expression, check if the output is empty or if it contains JSON characters before parsing: `@if(startsWith(activity('WebTask').output, '{'), json(activity('WebTask').output), json('{}'))`.\n\n"
     "3. Debug: Inspect the input Web activity parameters to verify the endpoint is active and handling request credentials correctly."),
    
    ("Explain how to handle a scenario where an ADF pipeline execution hangs indefinitely in an \"In Progress\" state without failing or generating an error message.",
     "1. Root cause: Usually caused by the integration runtime waiting for a response from a blocked target system (e.g., SQL server lock, API gateway socket hang) without a configured timeout.\n\n"
     "2. Resolution: (a) Configure explicit timeouts on all individual activities (e.g., set to 15 minutes). (b) Check for deadlocks in target databases. (c) Restart the SHIR services on nodes if connection pools are saturated and nodes cannot respond to heartbeat polls."),
    
    ("How do you programmatically extract the error message details from an enterprise pipeline run using the Azure SDK for Python or .NET?",
     "1. SDK Client: Initialize the `DataFactoryManagementClient` using Entra ID credentials.\n\n"
     "2. Query Runs: Execute the query command: `client.activity_runs.query_by_pipeline_run(rg_name, factory_name, pipeline_name, run_id, filter_parameters)`.\n\n"
     "3. Message Extract: Loop through the returned activity runs. If status is 'Failed', extract the error details from the nested `error` attribute: `run.error['message']`, saving logs to your custom database."),
    
    ("What are the specific metrics you must monitor in Azure Monitor to detect when an Integration Runtime is nearing its concurrent execution threshold?",
     "1. Key Metrics: In Azure Monitor, query the `Integration Runtime Node` metrics.\n\n"
     "2. Target Counters: Monitor `IntegrationRuntimeNodeCpuPercentage`, `IntegrationRuntimeNodeMemoryPercentage`, and `IntegrationRuntimeNodeConcurrentJobsLimitReached`. Set alerts to trigger if CPU/Memory exceeds 85% or if the limit reached counter registers a value greater than 0, indicating queue states."),
    
    ("How do you set up custom annotations and user properties on an activity, and how can you leverage these fields to filter execution logs inside the native ADF monitoring portal?",
     "1. Configuration: In the activity settings properties tab, click 'User properties'. Add key-value pairs (e.g., `Department: Finance`).\n\n"
     "2. Query: In the ADF Monitoring UI, you can filter by these user properties. In Log Analytics, query the `UserProperties` field in `ADFActivityRun` to build dashboards segmented by business departments, simplifying log discovery."),
    
    ("Explain how to trace an end-to-end data lineage path starting from an ADF Copy Activity all the way into Microsoft Purview automatically.",
     "1. Purview Link: Register and connect your Microsoft Purview account to the Azure Data Factory instance.\n\n"
     "2. Lineage capture: When a Copy activity executes, ADF automatically streams lineage metadata (source table columns, connection details, sink destination) to Purview.\n\n"
     "3. Catalog mapping: Purview parses this telemetry and builds visual data maps showing how data moves, enabling compliance tracking and search discovery."),
    
    ("How do you debug an intermittent authorization error (Status Code 403) occurring when a pipeline runs on a scheduled trigger but works perfectly when run manually via the \"Debug\" button?",
     "1. Credential Scope: 'Debug' runs execute under the developer's Entra ID user context. Scheduled triggers execute under the ADF Managed Service Identity (MSI) context.\n\n"
     "2. Resolution: Verify that the ADF MSI has been granted appropriate access permissions (e.g., RBAC Storage Blob Data Reader, database login permissions) on the target source resources, as it lacks the developer's AD rights."),
    
    ("How do you configure automated alerts to detect if a specific pipeline has not started by its designated SLA execution time (e.g., 6:00 AM daily)?",
     "1. Logic Apps polling: Create a Logic App scheduled to run at 6:05 AM.\n\n"
     "2. Status check: The Logic App queries the ADF REST API for pipeline runs matching the last 12 hours: `client.pipeline_runs.query_by_factory(...)`.\n\n"
     "3. Alert trigger: If the return list is empty (no runs started), trigger an email or PagerDuty incident to alert the on-call engineer of the SLA breach."),
    
    ("Explain how to capture and inspect the exact execution logs of a Mapping Data Flow's underlying Spark driver node when the ADF monitor only displays a generic Internal Server Error.",
     "1. Spark Diagnostic: Navigate to the Data Flow execution monitoring tab. Click on the Spark log link (redirects to the Databricks cluster diagnostics page).\n\n"
     "2. Log analysis: Download the `stdout` and `stderr` files from the driver node logs. Look for Java stack traces (OOM exceptions, serialization errors) that are hidden by the high-level ADF portal generic errors."),
    
    ("How do you design a custom framework to parse the executionDetails object from a Copy Activity run to audit network transit times vs. compute engine processing latency?",
     "1. Metrics Parse: Use a Stored Procedure activity following the Copy Activity. Pass the Copy Activity output: `@activity('CopyTask').output`.\n\n"
     "2. SQL extraction: In SQL Server, use `JSON_VALUE` to parse variables: `JSON_VALUE(payload, '$.executionDetails[0].detailedDurations.queuingDuration')` to capture connection latency vs. active write times, storing stats to audit networks."),
    
    ("What is the impact of storage account throttling on the reliability of pipeline execution history data stored within the ADF internal monitoring database?",
     "1. History Delay: Throttling does not delete history data, but delays metadata sync between the execution engine and the monitoring database. Logs may take up to an hour to populate in the monitoring portal, which can trigger false SLA alerts."),
    
    ("How do you clear or purge historical pipeline execution run data from a factory instance to satisfy strict compliance or privacy requirements?",
     "1. No Manual Purge: ADF does not support purging individual execution logs manually. Data is automatically deleted after 45 days by the platform database.\n\n"
     "2. Archive Control: If diagnostic streaming is enabled, write retention policies in Azure Log Analytics to delete data matching compliance rules (e.g., delete logs after 14 days)."),
    
    ("How do you troubleshoot an error where a Storage Event Trigger stops firing entirely after a new folder creation pattern is introduced to the source data lake?",
     "1. Folder match: Storage triggers evaluate file paths. If a new folder structure changes the depth (e.g., `year/month/day/file.csv` instead of `month/file.csv`), the trigger wildcard pattern (e.g., `uploads/{name}`) will fail to match.\n\n"
     "2. Update rule: Modify the Blob Path Begin/End parameters to match the new root folder layout, and reactivate the trigger."),
    
    ("Explain how to write a KQL query to find the top 10 most expensive pipelines based on DIU consumption and execution duration over the past 30 days.",
     "1. KQL Query:\n"
     "```kql\n"
     "ADFActivityRun\n"
     "| where TimeGenerated >= ago(30d)\n"
     "| extend diuUsed = toint(parse_json(ExecutionDetails).effectiveIntegrationRuntimeProperties[0].dataIntegrationUnits)\n"
     "| extend durationSec = toint(parse_json(ExecutionDetails).duration)\n"
     "| summarize TotalDIUHours = sum(diuUsed * (durationSec / 3600)) by PipelineName\n"
     "| top 10 by TotalDIUHours desc\n"
     "```\n"
     "This calculates DIU-Hours, allowing cost estimation per pipeline run."),
    
    ("How do you resolve a localized SHIR error: System.IO.IOException: The disk is full when processing exceptionally large compressed zip files that need extraction?",
     "1. Temp Folder space: By default, the SHIR extracts zip archives to the system temp folder (usually `C:\\Windows\\Temp`).\n\n"
     "2. Resolution: Change the system environment variables `TEMP` and `TMP` to point to a secondary SSD drive with sufficient disk capacity (e.g., `D:\\Temp`), and restart the Integration Runtime host service."),
    
    ("How do you identify a deadlocked pipeline run caused by recursive Execute Pipeline loops or overlapping resource locks?",
     "1. Monitoring check: In the monitoring UI, search for parent pipelines running longer than 12 hours. Look for recursive Execute Pipeline calls.\n\n"
     "2. Avoid loops: Do not allow pipelines to invoke themselves without a defined counter exit limit. Use target lock DMVs to find if database tables have open locks from other pipeline runs, causing halts.")
]

for idx, (q, a) in enumerate(monitor_questions):
    adf_part2.append({
        "id": f"adf-monitor-{idx+1}",
        "category": "ADF",
        "niche": "Monitoring, Custom Logging, Alerts, & Troubleshooting Edge Cases",
        "question": q,
        "answer": a
    })

# Niche 7: Cost Governance, API Workarounds, & Modern Fabric/Synapse Coexistence
cost_questions = [
    ("How do you mathematically calculate the cost differences between executing an orchestration task using an Azure Logic App vs. an ADF Web Activity invoking an Azure Function?",
     "1. Cost Comparison:\n"
     "- Azure Logic App: Billed per action execution (e.g., $0.000025 per standard connector action). A complex logic app with 10 steps costs $0.00025 per run.\n"
     "- ADF Web Activity: Billed based on orchestrator run duration ($0.002 per activity run). Executing a Web activity costs $0.002.\n"
     "- Azure Function: Billed per execution count ($0.20 per million) and execution duration. Invoking a 1-second function costs $0.000016.\n\n"
     "2. Recommendation: For simple API calls, ADF Web Activity invoking Azure Function is cheaper for high frequency runs than running complex nested Logic Apps."),
    
    ("Explain how to implement strict cost governance policies using Azure Tags to track and allocate ADF spend down to individual line-of-business cost centers.",
     "1. Tag Assignment: Apply Azure Tags (e.g., `CostCenter: Finance`, `Environment: Production`) to the ADF resource group or factory level.\n\n"
     "2. Cost Management: In Azure Cost Management, set up Cost Allocation rules. You can filter and export monthly cost sheets grouped by these tags, mapping resources back to department budgets."),
    
    ("How do you bypass the 1,000-activity limit per pipeline run execution when building massive dynamically generated metadata loops?",
     "1. The limit: A single pipeline run execution is capped at 1,000 activity steps (including all iterations inside a ForEach loop).\n\n"
     "2. Bypass: Split metadata loops. Instead of looping all tables in one ForEach, split the metadata array into chunks of 500 (e.g., using page indexing) and invoke a child pipeline for each chunk, restarting the activity count limits."),
    
    ("Explain the precise architectural steps, security changes, and metadata transformation patterns required to migrate a large enterprise estate of 500 ADF pipelines into Microsoft Fabric Data Factories.",
     "To migrate 500 ADF pipelines to Fabric:\n\n"
     "1. Tenant prep: Enable Microsoft Fabric in your tenant. Create target workspaces.\n\n"
     "2. Git Export: Connect the ADF factory to Git. Export the pipeline JSON files.\n\n"
     "3. Import: Import pipeline JSON files into Fabric Data Factories (using Fabric's Git integration or APIs).\n\n"
     "4. Linked Services conversion: Convert legacy Azure Linked Services to Fabric Connection definitions. Update authentication to use Fabric's built-in OAuth/MSI, mapping connection strings to OneLake endpoints."),
    
    ("How do you orchestrate a unified data platform where an ADF pipeline in a core Azure tenant controls and executes Synapse Notebooks and Fabric pipelines located in completely disparate workspaces and tenants?",
     "1. Service Principal access: In the target Fabric tenant, register a Service Principal. Grant it access to the Fabric workspaces and Synapse notebooks.\n\n"
     "2. API Invocation: In the core ADF tenant, use a Web Activity. Authenticate via the Service Principal to request token access for the target tenant.\n\n"
     "3. Execution: Send POST requests to the Fabric API to trigger pipelines: `https://api.fabric.microsoft.com/v1/workspaces/{id}/pipelines/{id}/jobs`."),
    
    ("What is the economic and operational impact of leaving a Mapping Data Flow's Time-To-Live (TTL) cluster constantly running throughout a 24-hour window vs. spinning it up on-demand for hourly batches?",
     "1. Constant TTL: High cost. You pay for the running Spark VMs even when idle. Operational advantage: zero startup latency for pipelines.\n\n"
     "2. On-demand: Zero idle cost. But adds 3-5 minutes execution delay to each hourly run.\n\n"
     "3. Recommendation: Set TTL to a short window (e.g., 10 minutes) that covers parallel runs. Disable it for nightly batches, balancing costs vs. latency."),
    
    ("How do you use the ADF REST API to dynamically adjust the core count allocation of a Mapping Data Flow Integration Runtime based on the volume of incoming files detected at runtime?",
     "1. File Count: Use a Get Metadata activity to count incoming files. If file count exceeds 1,000:\n\n"
     "2. Scale Out: Execute a Web activity that sends a PATCH request to the ADF Integration Runtime REST API to update `properties.typeProperties.computeProperties.coreCount` (e.g., scale from 8 to 32 cores).\n\n"
     "3. Processing: Wait 5 minutes for the IR to recycle, then execute the Mapping Data Flow at scale, adjusting costs dynamically."),
    
    ("Explain the data residency and governance implications when an ADF instance in the East US region orchestrates a Copy Activity moving data between a source in West Europe and a sink in Southeast Asia.",
     "1. Data Transit: If using the default Azure IR, the copy compute runs in East US. Data will hop from West Europe to East US, then to Southeast Asia, causing network latency and violating GDPR regulations.\n\n"
     "2. Compliance: Use an Integration Runtime located in West Europe to perform the read, staging data locally before transferring to the sink, ensuring data residency compliance."),
    
    ("How do you overcome the limitation where ADF cannot natively read or write to private Git repositories that require strict multi-factor authentication (MFA) or SAML single sign-on (SSO)?",
     "1. Personal Access Token (PAT): Create a service account in your Git provider. Generate a PAT with repository read/write access. Configure ADF Git integration to use the PAT for authentication, bypassing MFA prompts."),
    
    ("Detail how to design a multi-tenant data factory architecture where individual external clients can trigger custom pipelines within your factory without ever gaining access to view or modify your underlying processing logic or linked connections.",
     "1. Trigger API: Create custom Azure Logic Apps or REST endpoints. Grant client tenants permission to call these specific endpoints.\n\n"
     "2. Pipeline Execution: The Logic App calls the ADF Run Pipeline API, passing parameters (e.g., customer ID). The ADF pipeline executes dynamically using these parameters, while connection secrets remain secure in Key Vault, hiding pipeline logic from clients.")
]

for idx, (q, a) in enumerate(cost_questions):
    adf_part2.append({
        "id": f"adf-cost-{idx+1}",
        "category": "ADF",
        "niche": "Cost Governance, API Workarounds, & Modern Fabric/Synapse Coexistence",
        "question": q,
        "answer": a
    })

# Write adf_part2.json
with open("/Users/santosh/.gemini/antigravity/scratch/fabric-pbi-prep/adf_part2.json", "w") as f:
    json.dump(adf_part2, f, indent=2)

print("ADF Part 2 JSON generated successfully.")
