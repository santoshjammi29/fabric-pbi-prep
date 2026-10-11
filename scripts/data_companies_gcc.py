"""
Data Definition: 52 Global Capability Center (GCC) Profiles
Covers Fortune 500 GCCs across Retail, Healthcare/Pharma, Automotive, Aerospace, Industrial, Energy, and Logistics.
"""

GCC_PROFILES = [
    {
        "id": "walmart-global-tech",
        "name": "Walmart Global Tech",
        "tier": "Global Capability Center (GCC)",
        "location": "Bentonville, AR / Sunnyvale, CA / Bengaluru / Chennai",
        "hiringGCCLocations": ["Bengaluru", "Chennai"],
        "topicKey": "datalake",
        "seniorDeSalary": "$190k - $290k (₹45L - ₹78L)",
        "architectSalary": "$300k - $450k (₹85L - ₹1.5Cr)",
        "systemDesignArchetype": "Global Omni-Channel Lakehouse & Real-Time Store Inventory Sync",
        "stack": ["GCP BigQuery", "Apache Spark", "Apache Kafka", "Delta Lake", "Trino", "dbt", "Airflow"],
        "interviewFocus": [
            "Supply chain multi-region data replication and global inventory consistency across 10,000+ stores",
            "Dynamic partition pruning across billion-row retail fact tables in BigQuery and Delta Lake",
            "Trino MPP query acceleration over distributed cloud object stores",
            "FinOps: BigQuery slot reservations vs on-demand optimization and spot Spark cluster scheduling"
        ],
        "keyChallenges": "Synchronizing store inventory and omni-channel e-commerce orders across 10,000+ brick-and-mortar stores with sub-minute reconciliation.",
        "sampleQuestions": [
            "Design a real-time inventory synchronization engine updating store shelf availability within 30 seconds of an in-store barcode scan.",
            "Architect a multi-cloud data lakehouse reconciling e-commerce digital orders with regional physical fulfillment center warehouse inventories."
        ]
    },
    {
        "id": "target-enterprise-tech",
        "name": "Target Enterprise Tech",
        "tier": "Global Capability Center (GCC)",
        "location": "Minneapolis, MN / Bengaluru",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "target",
        "seniorDeSalary": "$185k - $280k (₹42L - ₹72L)",
        "architectSalary": "$290k - $430k (₹80L - ₹1.4Cr)",
        "systemDesignArchetype": "Event-Driven Retail Stream & Drive-Up Grocery Fulfillment",
        "stack": ["Apache Kafka", "Apache Flink", "Databricks", "Delta Lake", "Google Cloud", "Airflow", "Python"],
        "interviewFocus": [
            "Event-driven retail stream processing with stateful Flink jobs for order fulfillment",
            "Medallion data quality contracts with Great Expectations and schema enforcement",
            "Cost-effective serverless batch transformation pipelines on Databricks Delta Lake",
            "Target Circle customer loyalty point balance updates in real-time streaming architectures"
        ],
        "keyChallenges": "Powering Target Drive-Up curbside delivery orders with sub-2 minute store employee notification when customers enter the parking geo-fence.",
        "sampleQuestions": [
            "Design an event-driven curbside fulfillment alerting pipeline that triggers packing alerts when a customer enters a store geo-fence.",
            "Architect a real-time loyalty rewards accumulator processing millions of Black Friday in-store transactions without dropped point updates."
        ]
    },
    {
        "id": "lowes-india",
        "name": "Lowe's India",
        "tier": "Global Capability Center (GCC)",
        "location": "Mooresville, NC / Bengaluru",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "gcp",
        "seniorDeSalary": "$180k - $275k (₹40L - ₹68L)",
        "architectSalary": "$280k - $420k (₹78L - ₹1.35Cr)",
        "systemDesignArchetype": "Home Improvement Supply Chain & Omnichannel Inventory Engine",
        "stack": ["Google Cloud BigQuery", "Apache Spark", "Kafka", "Snowflake", "dbt", "Airflow", "Python"],
        "interviewFocus": [
            "Bulk dimensional modeling for lumber, hardware, and home improvement supply chain logistics",
            "BigQuery cost optimization: query clustering, table partitioning, and reservation slots",
            "Real-time store pickup (BOPIS) notification pipelines from distribution centers to retail aisles",
            "Supplier catalog ingestion and automated product taxonomy normalization"
        ],
        "keyChallenges": "Managing freight logistics and dynamic stock availability for oversized construction goods across national distribution centers.",
        "sampleQuestions": [
            "Design a supply chain data pipeline optimizing truckload freight distribution from regional hubs to 1,700 retail stores.",
            "Architect an omnichannel product catalog search engine normalizing SKU specifications from 5,000 third-party building manufacturers."
        ]
    },
    {
        "id": "home-depot",
        "name": "The Home Depot Technology",
        "tier": "Global Capability Center (GCC)",
        "location": "Atlanta, GA / Remote / Bengaluru Partner Hub",
        "hiringGCCLocations": ["Bengaluru / Remote"],
        "topicKey": "gcp",
        "seniorDeSalary": "$185k - $280k (₹42L - ₹70L)",
        "architectSalary": "$290k - $430k (₹80L - ₹1.4Cr)",
        "systemDesignArchetype": "Interconnected Retail Lakehouse & Pro Contractor Account Engine",
        "stack": ["Google Cloud (BigQuery, Pub/Sub, Dataflow)", "Apache Spark", "Kafka", "Cassandra", "Python"],
        "interviewFocus": [
            "Pro contractor volume pricing calculation and commercial credit balance updates",
            "Google Cloud Dataflow streaming pipelines aggregating store point-of-sale registers",
            "Cassandra data modeling for high-throughput in-store mobile associate inventory lookups",
            "Real-time vendor drop-ship order tracking and shipment milestone reconciliation"
        ],
        "keyChallenges": "Providing sub-second in-store inventory and aisle location lookup for store associates assisting professional contractors.",
        "sampleQuestions": [
            "Design an in-store mobile inventory lookup system providing exact aisle and bay locations with sub-second response times.",
            "Architect a commercial contractor volume rebate calculation pipeline aggregating annualized purchases across corporate accounts."
        ]
    },
    {
        "id": "costco-tech",
        "name": "Costco Wholesale Tech",
        "tier": "Global Capability Center (GCC)",
        "location": "Issaquah, WA / Dallas, TX / Bengaluru Partner Hub",
        "hiringGCCLocations": ["Bengaluru / Dallas"],
        "topicKey": "azure",
        "seniorDeSalary": "$180k - $270k (₹38L - ₹65L)",
        "architectSalary": "$280k - $410k (₹75L - ₹1.3Cr)",
        "systemDesignArchetype": "Warehouse Club Membership Telemetry & High-Velocity Pallet Supply Chain",
        "stack": ["Microsoft Azure (ADF, Databricks, Synapse)", "Apache Spark", "SQL Server / DB2", "Power BI", "Kafka"],
        "interviewFocus": [
            "Membership renewal analytics, household clustering, and automatic subscription billing",
            "Warehouse pallet-level cross-docking and inventory velocity tracking",
            "Modernizing legacy AS400 / DB2 mainframe systems to Azure Databricks Lakehouse",
            "Power BI enterprise dashboard optimization for warehouse general managers"
        ],
        "keyChallenges": "Migrating mission-critical AS/400 mainframe warehouse inventory systems to cloud lakehouses without disrupting daily operations.",
        "sampleQuestions": [
            "Design a pallet-level cross-dock tracking architecture moving goods from shipping containers directly to warehouse club floors.",
            "Architect an automated membership retention and renewal propensity scoring pipeline utilizing historical transaction frequency."
        ]
    },
    {
        "id": "tesco-bengaluru",
        "name": "Tesco Bengaluru",
        "tier": "Global Capability Center (GCC)",
        "location": "Welwyn Garden City, UK / Bengaluru",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "azure",
        "seniorDeSalary": "$180k - $275k (₹38L - ₹66L)",
        "architectSalary": "$280k - $420k (₹76L - ₹1.35Cr)",
        "systemDesignArchetype": "UK Grocery Supply Chain & Clubcard Loyalty Data Engine",
        "stack": ["Microsoft Azure (Databricks, Cosmos DB)", "Apache Spark", "Kafka", "Snowflake", "Power BI", "Python"],
        "interviewFocus": [
            "Tesco Clubcard loyalty data pipelines processing purchases for 20+ million UK households",
            "Perishable food waste reduction: dynamic markdowns and shelf-life expiration pipelines",
            "Azure Databricks Lakehouse optimization for store-level grocery replenishment forecasting",
            "Cosmos DB geo-replication for online grocery e-commerce slot booking"
        ],
        "keyChallenges": "Forecasting fresh produce and perishable grocery demand across 2,800 UK stores to minimize food waste while avoiding stockouts.",
        "sampleQuestions": [
            "Design a perishable grocery dynamic markdown pipeline that adjusts prices based on shelf-life expiration and store foot traffic.",
            "Architect a Clubcard personalized promotion engine generating millions of targeted coupons based on shopping history."
        ]
    },
    {
        "id": "ikea-digital",
        "name": "IKEA Group (Ingka Digital)",
        "tier": "Global Capability Center (GCC)",
        "location": "Malmö, Sweden / Amsterdam / Bengaluru",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "gcp",
        "seniorDeSalary": "$185k - $280k (₹40L - ₹68L)",
        "architectSalary": "$285k - $425k (₹78L - ₹1.38Cr)",
        "systemDesignArchetype": "Flat-Pack Global Logistics & Sustainable Retail Digital Mesh",
        "stack": ["Google Cloud Platform (BigQuery, Pub/Sub)", "Apache Spark", "Kafka", "dbt", "Airflow", "Python"],
        "interviewFocus": [
            "Flat-pack furniture shipping container optimization and global ocean freight tracking",
            "In-store self-serve furniture warehouse stock reconciliation",
            "dbt semantic layer modeling for international omnichannel home furnishing sales",
            "Carbon footprint tracking across product raw material sourcing and customer delivery"
        ],
        "keyChallenges": "Tracking ocean container shipping delays and calculating real-time assembly stock availability in flat-pack self-serve warehouses.",
        "sampleQuestions": [
            "Design a global ocean freight telemetry platform predicting container arrival delays and warehouse stock impacts.",
            "Architect an enterprise carbon footprint calculation pipeline measuring product lifecycle emissions from forestry to delivery."
        ]
    },
    {
        "id": "nike-tech",
        "name": "Nike Global Technology",
        "tier": "Global Capability Center (GCC)",
        "location": "Beaverton, OR / Bengaluru",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "aws",
        "seniorDeSalary": "$190k - $290k (₹44L - ₹75L)",
        "architectSalary": "$300k - $445k (₹85L - ₹1.5Cr)",
        "systemDesignArchetype": "SNKRS Bot-Mitigation Drop Architecture & Direct-to-Consumer (D2C) Mesh",
        "stack": ["AWS (EMR, DynamoDB, S3)", "Snowflake", "Apache Spark", "Apache Kafka", "Flink", "Python"],
        "interviewFocus": [
            "High-concurrency sneaker drop architecture on the SNKRS app with bot-detection filtering",
            "Direct-to-Consumer (D2C) member profile aggregation across Nike Training Club and retail apps",
            "Snowflake enterprise modeling for global wholesale vs retail footwear demand",
            "Kafka event streaming for shoe customization orders (Nike By You)"
        ],
        "keyChallenges": "Absorbing millions of checkout requests in 60 seconds during limited-edition sneaker drops while filtering out automated scalper bots.",
        "sampleQuestions": [
            "Design a high-throughput sneaker launch drop architecture handling 500,000 checkout attempts/sec with fair lottery allocation.",
            "Architect a D2C unified member profile engine consolidating physical store visits, running app telemetry, and online shoe purchases."
        ]
    },
    {
        "id": "adidas-digital",
        "name": "Adidas Tech & Digital",
        "tier": "Global Capability Center (GCC)",
        "location": "Herzogenaurach, Germany / Zaragoza / Gurugram / Bogota",
        "hiringGCCLocations": ["Gurugram"],
        "topicKey": "aws",
        "seniorDeSalary": "$180k - $275k (₹38L - ₹66L)",
        "architectSalary": "$280k - $415k (₹76L - ₹1.3Cr)",
        "systemDesignArchetype": "Global Footwear Supply Chain & adiClub Loyalty Ingestion",
        "stack": ["AWS", "Apache Spark", "Kafka", "Databricks", "Snowflake", "Salesforce Commerce Cloud", "Python"],
        "interviewFocus": [
            "Global footwear manufacturing demand planning: forecasting factory orders across Asia",
            "adiClub loyalty point accrual and tier progression streaming pipelines",
            "Databricks Lakehouse architecture for omnichannel inventory visibility",
            "Automated return merchandise authorization (RMA) tracking and refurbished shoe routing"
        ],
        "keyChallenges": "Forecasting factory production schedules 9 months in advance across hundreds of contract footwear manufacturers.",
        "sampleQuestions": [
            "Design a global demand planning pipeline predicting footwear sizes and colorway popularity across 50 international markets.",
            "Architect an automated returns and refurbishment tracking pipeline reducing reverse logistics transit times."
        ]
    },
    {
        "id": "starbucks-technology",
        "name": "Starbucks Technology",
        "tier": "Global Capability Center (GCC)",
        "location": "Seattle, WA / Bengaluru Hub",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "azure",
        "seniorDeSalary": "$185k - $280k (₹42L - ₹70L)",
        "architectSalary": "$290k - $430k (₹80L - ₹1.4Cr)",
        "systemDesignArchetype": "Deep Brew AI Platform & Mobile Order & Pay (MOP) Stream",
        "stack": ["Microsoft Azure (Databricks, Cosmos DB, Event Hubs)", "Deep Brew AI", "Apache Spark", "Kafka", "Power BI"],
        "interviewFocus": [
            "Mobile Order & Pay (MOP) queue management: balancing mobile coffee orders with in-store walk-ins",
            "Deep Brew enterprise AI: automated store coffee bean replenishment and customized drink offers",
            "Cosmos DB data modeling for real-time digital gift card balances and Starbucks Stars loyalty",
            "IoT telemetry ingestion from connected Mastrena espresso machines for predictive maintenance"
        ],
        "keyChallenges": "Balancing morning rush mobile coffee pickup orders with in-store walk-in queues across 35,000 stores to keep wait times under 5 minutes.",
        "sampleQuestions": [
            "Design an IoT telemetry pipeline collecting boiler temperature and water pressure metrics from 50,000 connected Mastrena espresso machines.",
            "Architect a real-time mobile order queue throttling engine that pauses app orders when store baristas exceed peak drink capacity."
        ]
    },
    {
        "id": "loreal-tech",
        "name": "L'Oréal Digital Technology",
        "tier": "Global Capability Center (GCC)",
        "location": "Paris / New York / Bengaluru",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "gcp",
        "seniorDeSalary": "$175k - $265k (₹36L - ₹62L)",
        "architectSalary": "$270k - $400k (₹72L - ₹1.25Cr)",
        "systemDesignArchetype": "Beauty Tech Personalization & Global Cosmetic Supply Chain",
        "stack": ["Google Cloud Platform (BigQuery)", "Apache Spark", "Kafka", "Snowflake", "dbt", "Python"],
        "interviewFocus": [
            "Beauty Tech: computer vision skin tone analysis telemetry and personalized skincare formulations",
            "Omnichannel marketing attribution across social media influencers, department stores, and e-commerce",
            "BigQuery data modeling for global cosmetic batch tracking and ingredient safety compliance",
            "dbt transformation pipelines calculating brand market share across global luxury cosmetics"
        ],
        "keyChallenges": "Tracking beauty product batches and dynamic shelf expiration for thousands of cosmetic SKUs across global distribution centers.",
        "sampleQuestions": [
            "Design a digital marketing attribution pipeline linking influencer TikTok campaigns to department store sales lifts.",
            "Architect a cosmetics ingredient traceability lakehouse ensuring instant recall notification across international regulatory jurisdictions."
        ]
    },
    {
        "id": "procter-gamble-gcc",
        "name": "Procter & Gamble (P&G GCC)",
        "tier": "Global Capability Center (GCC)",
        "location": "Cincinnati, OH / Hyderabad / San José, Costa Rica",
        "hiringGCCLocations": ["Hyderabad"],
        "topicKey": "azure",
        "seniorDeSalary": "$180k - $275k (₹38L - ₹65L)",
        "architectSalary": "$280k - $415k (₹75L - ₹1.3Cr)",
        "systemDesignArchetype": "Consumer Packaged Goods (CPG) Supply Chain & Smart Manufacturing",
        "stack": ["Microsoft Azure (Synapse, ADF, Databricks)", "Apache Spark", "SAP HANA", "Power BI", "Snowflake"],
        "interviewFocus": [
            "Integration with SAP HANA ERP for global consumer goods production tracking",
            "Smart factory industrial IoT: vibration sensors, packaging lines, and automated palletizers",
            "Demand sensing pipelines incorporating weather forecasts and point-of-sale retailer scans",
            "Power BI enterprise semantic models serving global brand management teams"
        ],
        "keyChallenges": "Integrating real-time smart factory IoT packaging telemetry with global SAP supply chain orders without downtime.",
        "sampleQuestions": [
            "Design an industrial IoT sensor processing pipeline monitoring high-speed shampoo bottling lines to predict machine jams.",
            "Architect a demand-sensing data lakehouse that fuses retailer POS data with weather forecasts to adjust laundry detergent shipments."
        ]
    },
    {
        "id": "unilever-digital",
        "name": "Unilever Tech & Data",
        "tier": "Global Capability Center (GCC)",
        "location": "London / Bengaluru",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "azure",
        "seniorDeSalary": "$180k - $270k (₹38L - ₹65L)",
        "architectSalary": "$280k - $410k (₹75L - ₹1.3Cr)",
        "systemDesignArchetype": "Sustainable Sourcing Traceability & Global CPG Distribution",
        "stack": ["Microsoft Azure (Databricks, ADLS Gen2)", "Apache Spark", "Kafka", "Power BI", "Python", "SAP"],
        "interviewFocus": [
            "Supply chain commodity traceability: verifying sustainable palm oil and agricultural raw materials",
            "Azure Databricks Unity Catalog implementation across decentralized international operating companies",
            "Direct-to-consumer ice cream and consumer goods delivery logistics tracking",
            "Enterprise data quality automation validating vendor invoice reconciliation"
        ],
        "keyChallenges": "Proving end-to-end sustainable sourcing traceability from smallholder agricultural farms to finished packaged supermarket goods.",
        "sampleQuestions": [
            "Design a geospatial traceability pipeline mapping raw material origins to deforestation satellite maps.",
            "Architect a unified Azure Databricks data lakehouse harmonizing ERP data across 50 international operating companies."
        ]
    },
    {
        "id": "johnson-johnson-gcc",
        "name": "Johnson & Johnson Digital",
        "tier": "Global Capability Center (GCC)",
        "location": "New Brunswick, NJ / Bengaluru",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "aws",
        "seniorDeSalary": "$185k - $285k (₹42L - ₹72L)",
        "architectSalary": "$290k - $435k (₹80L - ₹1.4Cr)",
        "systemDesignArchetype": "Medical Device Telemetry & GxP-Validated Pharma Lakehouse",
        "stack": ["AWS (EMR, Glue, S3)", "Databricks", "Snowflake", "Apache Spark", "PostgreSQL", "Python"],
        "interviewFocus": [
            "GxP regulatory compliance: 21 CFR Part 11 audit trails and immutable data validation",
            "Surgical medical device telemetry ingestion and orthopedic implant tracking",
            "Databricks Lakehouse architecture for oncology drug discovery research",
            "Enterprise data governance ensuring HIPAA patient data de-identification"
        ],
        "keyChallenges": "Maintaining strict FDA 21 CFR Part 11 electronic records validation while modernizing legacy pharma pipelines to cloud lakehouses.",
        "sampleQuestions": [
            "Design an immutable, GxP-validated clinical data pipeline that tracks every transformation step with cryptographic audit hashing.",
            "Architect an IoT telemetry platform ingesting usage metrics from robotic surgical consoles to detect mechanical degradation."
        ]
    },
    {
        "id": "pfizer-digital",
        "name": "Pfizer Digital Hub",
        "tier": "Global Capability Center (GCC)",
        "location": "New York, NY / Chennai / Mumbai",
        "hiringGCCLocations": ["Chennai", "Mumbai"],
        "topicKey": "datalake",
        "seniorDeSalary": "$185k - $285k (₹42L - ₹72L)",
        "architectSalary": "$295k - $440k (₹82L - ₹1.45Cr)",
        "systemDesignArchetype": "Vaccine Cold-Chain Telemetry & Clinical Trial Patient Data Mesh",
        "stack": ["AWS", "Apache Spark", "Snowflake", "Databricks", "Kafka", "PostgreSQL", "Python"],
        "interviewFocus": [
            "Ultra-cold vaccine storage IoT temperature monitoring: real-time alert dispatching for thermal excursions",
            "Electronic Data Capture (EDC) clinical trial patient record normalization across international trial sites",
            "Snowflake data clean rooms for collaborative pharmaceutical research partnerships",
            "High-performance bioinformatics genomic sequence data ingestion pipelines"
        ],
        "keyChallenges": "Ensuring zero thermal breaches across thousands of ultra-low temperature vaccine transport freezers worldwide.",
        "sampleQuestions": [
            "Design an IoT cold-chain sensor pipeline monitoring -80°C vaccine freezers that dispatches emergency rerouting alerts within 60 seconds.",
            "Architect a federated clinical trial patient matching engine that queries electronic health records across international hospital partners."
        ]
    },
    {
        "id": "novartis-gcc",
        "name": "Novartis Corporate Center (GCC)",
        "tier": "Global Capability Center (GCC)",
        "location": "Basel, Switzerland / Hyderabad",
        "hiringGCCLocations": ["Hyderabad"],
        "topicKey": "azure",
        "seniorDeSalary": "$185k - $280k (₹42L - ₹70L)",
        "architectSalary": "$290k - $430k (₹80L - ₹1.4Cr)",
        "systemDesignArchetype": "Clinical Data Analytics Platform & Real-World Evidence (RWE) Hub",
        "stack": ["Microsoft Azure (Databricks, ADF)", "Snowflake", "Apache Spark", "Python", "OMOP CDM", "R"],
        "interviewFocus": [
            "OMOP Common Data Model (CDM) harmonization for observational health data",
            "Real-World Evidence (RWE) pipeline design: processing millions of anonymized insurance claims",
            "Azure Databricks optimization for biostatistical drug efficacy calculations",
            "Data anonymization and k-anonymity validation for medical research sharing"
        ],
        "keyChallenges": "Harmonizing diverse healthcare datasets (EHR, claims, genomic registries) into the OMOP Common Data Model for longitudinal drug studies.",
        "sampleQuestions": [
            "Design an automated ETL pipeline transforming disparate hospital electronic health records into the standardized OMOP Common Data Model.",
            "Architect a real-world evidence analytics engine evaluating long-term cardiovascular outcomes from 50 million patient insurance claims."
        ]
    },
    {
        "id": "astrazeneca-india",
        "name": "AstraZeneca India (R&D / Tech)",
        "tier": "Global Capability Center (GCC)",
        "location": "Cambridge, UK / Chennai / Bengaluru",
        "hiringGCCLocations": ["Chennai", "Bengaluru"],
        "topicKey": "aws",
        "seniorDeSalary": "$180k - $275k (₹40L - ₹68L)",
        "architectSalary": "$285k - $425k (₹78L - ₹1.35Cr)",
        "systemDesignArchetype": "Genomics Discovery Pipeline & Global Oncology Trial Lakehouse",
        "stack": ["AWS (EMR, S3)", "Databricks", "Apache Spark", "Nextflow", "Hail (Genomics)", "PostgreSQL", "Python"],
        "interviewFocus": [
            "Nextflow workflow orchestration for high-throughput genomic variant calling (GATK pipelines)",
            "Hail distributed framework on Spark for genome-wide association studies (GWAS)",
            "Oncology clinical trial biomarker tracking and patient tumor response monitoring",
            "Databricks Lakehouse security: managing multi-tier patient genetic access policies"
        ],
        "keyChallenges": "Processing whole-genome sequences for hundreds of thousands of clinical trial participants to identify targetable oncology mutations.",
        "sampleQuestions": [
            "Design a distributed bioinformatics pipeline using Nextflow and Spark to process 10,000 whole-genome sequencing files.",
            "Architect a real-time clinical biomarker monitoring dashboard tracking tumor reduction metrics for Phase 3 oncology trial patients."
        ]
    },
    {
        "id": "roche-digital",
        "name": "Roche Information Solutions",
        "tier": "Global Capability Center (GCC)",
        "location": "Basel, Switzerland / Pune / Hyderabad",
        "hiringGCCLocations": ["Pune", "Hyderabad"],
        "topicKey": "aws",
        "seniorDeSalary": "$185k - $280k (₹42L - ₹70L)",
        "architectSalary": "$290k - $430k (₹80L - ₹1.4Cr)",
        "systemDesignArchetype": "In Vitro Diagnostics IoT Telemetry & NAVIFY Oncology Decision Hub",
        "stack": ["AWS", "Apache Spark", "Kafka", "PostgreSQL", "Snowflake", "Kubernetes", "Python"],
        "interviewFocus": [
            "In vitro laboratory diagnostics instrument telemetry: ingesting blood test analyzer metrics",
            "NAVIFY digital oncology platform: integrating pathology images, genomic assays, and clinical history",
            "HL7 and FHIR clinical messaging standards integration pipelines",
            "High-availability medical IoT device management with automated calibration alerts"
        ],
        "keyChallenges": "Ingesting and indexing complex molecular pathology and diagnostic instrument feeds while complying with global IVD medical regulations.",
        "sampleQuestions": [
            "Design an IoT telemetry platform connecting 50,000 hospital blood analyzers to detect reagent degradation before test failures occur.",
            "Architect an HL7/FHIR healthcare data pipeline converting hospital clinical messages into structured analytical tables."
        ]
    },
    {
        "id": "abbott-gcc",
        "name": "Abbott Laboratories GCC",
        "tier": "Global Capability Center (GCC)",
        "location": "Abbott Park, IL / Hyderabad / Mumbai",
        "hiringGCCLocations": ["Hyderabad", "Mumbai"],
        "topicKey": "azure",
        "seniorDeSalary": "$180k - $275k (₹38L - ₹66L)",
        "architectSalary": "$280k - $420k (₹76L - ₹1.35Cr)",
        "systemDesignArchetype": "FreeStyle Libre Continuous Glucose Monitoring (CGM) Stream",
        "stack": ["Microsoft Azure (IoT Hub, Databricks, Cosmos DB)", "Apache Spark", "Kafka", "Power BI", "Python"],
        "interviewFocus": [
            "FreeStyle Libre continuous glucose monitoring: ingesting real-time sensor streams from millions of diabetic patients",
            "Azure IoT Hub device provisioning and secure patient cryptographic token management",
            "Real-time hypoglycemia and hyperglycemia predictive alerting algorithms",
            "Cosmos DB high-write low-latency patient time-series storage architecture"
        ],
        "keyChallenges": "Ingesting glucose readings every minute from millions of active diabetic sensors and pushing life-critical alarms within seconds.",
        "sampleQuestions": [
            "Design a life-critical streaming telemetry pipeline processing glucose readings from 5M patient sensors with sub-5-second hypoglycemia alarms.",
            "Architect a patient data privacy vault on Azure isolating personal identifiable information from clinical research telemetry."
        ]
    },
    {
        "id": "boeing-india-tech",
        "name": "Boeing India Tech Center",
        "tier": "Global Capability Center (GCC)",
        "location": "Arlington, VA / Bengaluru / Chennai",
        "hiringGCCLocations": ["Bengaluru", "Chennai"],
        "topicKey": "spark",
        "seniorDeSalary": "$185k - $285k (₹42L - ₹72L)",
        "architectSalary": "$295k - $440k (₹82L - ₹1.45Cr)",
        "systemDesignArchetype": "Commercial Aircraft Telemetry & Digital Twin Predictive Maintenance",
        "stack": ["Apache Spark", "Apache Kafka", "Cassandra", "PostgreSQL", "AWS S3 / Azure", "Python", "C++"],
        "interviewFocus": [
            "Full flight data recorder (black box) telemetry ingestion: analyzing thousands of sensor channels per flight",
            "Predictive maintenance for jet engines: detecting turbine blade wear and hydraulic pressure loss",
            "Digital twin simulation pipelines simulating structural stress across aircraft airframes",
            "Strict FAA / EASA aviation regulatory data compliance and immutable flight records"
        ],
        "keyChallenges": "Ingesting gigabytes of sensor readings per commercial flight across thousands of airborne aircraft upon landing at airport gates.",
        "sampleQuestions": [
            "Design an airport gate Wi-Fi upload pipeline that ingests and unpacks compressed flight recorder telemetry from arriving 787 jets.",
            "Architect a predictive maintenance alert system analyzing jet engine exhaust gas temperature margins to schedule preventive overhauls."
        ]
    },
    {
        "id": "airbus-digital-india",
        "name": "Airbus Digital & Tech India",
        "tier": "Global Capability Center (GCC)",
        "location": "Toulouse, France / Bengaluru",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "datalake",
        "seniorDeSalary": "$185k - $280k (₹42L - ₹70L)",
        "architectSalary": "$290k - $430k (₹80L - ₹1.4Cr)",
        "systemDesignArchetype": "Skywise Aviation Data Platform & Fleet Maintenance Lakehouse",
        "stack": ["Skywise (Palantir Foundry Core)", "Apache Spark", "Kafka", "AWS S3", "PostgreSQL", "Python"],
        "interviewFocus": [
            "Airbus Skywise open aviation data platform: sharing telemetry between airlines, suppliers, and OEMs",
            "Fleet-wide component failure prediction using historical aircraft sensor time-series",
            "Assembly line manufacturing quality telemetry for A320 / A350 aircraft wings and fuselage sections",
            "Aircraft configuration and maintenance schedule synchronization across global commercial airline fleets"
        ],
        "keyChallenges": "Aggregating telemetry from 10,000+ commercial aircraft operated by hundreds of independent airlines into the Skywise ecosystem.",
        "sampleQuestions": [
            "Design a multi-tenant airline fleet health analytics platform ensuring airlines can benchmark component reliability without viewing competitor data.",
            "Architect an aircraft assembly line sensor pipeline detecting fastener torque discrepancies during fuselage construction."
        ]
    },
    {
        "id": "lockheed-martin-india",
        "name": "Lockheed Martin India",
        "tier": "Global Capability Center (GCC)",
        "location": "Bethesda, MD / Hyderabad",
        "hiringGCCLocations": ["Hyderabad"],
        "topicKey": "architecture",
        "seniorDeSalary": "$190k - $290k (₹45L - ₹75L)",
        "architectSalary": "$300k - $450k (₹85L - ₹1.5Cr)",
        "systemDesignArchetype": "Defense Aerospace Manufacturing & Zero-Trust Supply Chain Verification",
        "stack": ["Apache Spark", "PostgreSQL", "Kafka", "AWS GovCloud", "Kubernetes", "Python / C++"],
        "interviewFocus": [
            "ITAR / CMMC defense-grade data security: zero-trust network access and mandatory hardware tokens",
            "Aerospace part pedigree and counterfeit component detection across defense subcontractors",
            "Flight test instrumentation data reduction: processing telemetry from supersonic military aircraft",
            "Secure disconnected edge analytics on forward-operating military equipment"
        ],
        "keyChallenges": "Ensuring 100% ITAR and defense data sovereignty compliance while coordinating manufacturing across global Tier-1 aerospace suppliers.",
        "sampleQuestions": [
            "Design an ITAR-compliant defense supply chain tracking system validating titanium alloy raw material certificates of origin.",
            "Architect a flight test telemetry reduction engine processing 100,000 sensor samples per second during high-g supersonic maneuvers."
        ]
    },
    {
        "id": "general-motors-gcc",
        "name": "General Motors Technical Center (GM GCC)",
        "tier": "Global Capability Center (GCC)",
        "location": "Detroit, MI / Bengaluru",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "spark",
        "seniorDeSalary": "$180k - $275k (₹40L - ₹68L)",
        "architectSalary": "$280k - $420k (₹78L - ₹1.35Cr)",
        "systemDesignArchetype": "OnStar Connected Vehicle Telemetry & Ultium EV Battery Lakehouse",
        "stack": ["Apache Spark", "Apache Kafka", "GCP BigQuery / Azure", "Cassandra", "PostgreSQL", "Python"],
        "interviewFocus": [
            "OnStar connected vehicle telemetry ingestion: crash notifications, remote diagnostics, and GPS traces",
            "Ultium EV battery cell voltage, temperature, and degradation modeling pipelines",
            "Over-the-air (OTA) vehicle software update campaign rollout telemetry",
            "High-throughput CAN bus vehicle network message decoding and Parquet conversion"
        ],
        "keyChallenges": "Processing continuous telemetry from 20+ million connected OnStar vehicles to detect safety anomalies and battery defects.",
        "sampleQuestions": [
            "Design a vehicle crash detection streaming pipeline that alerts emergency response dispatchers within 5 seconds of airbag deployment.",
            "Architect an EV battery health monitoring lakehouse analyzing cell voltage degradation curves to forecast warranty claims."
        ]
    },
    {
        "id": "ford-tech-center",
        "name": "Ford Global Technology and Business Center (FTBC)",
        "tier": "Global Capability Center (GCC)",
        "location": "Dearborn, MI / Chennai",
        "hiringGCCLocations": ["Chennai"],
        "topicKey": "gcp",
        "seniorDeSalary": "$180k - $275k (₹38L - ₹66L)",
        "architectSalary": "$280k - $415k (₹76L - ₹1.3Cr)",
        "systemDesignArchetype": "FordPass Connected Fleet Management & Manufacturing Quality Control",
        "stack": ["Google Cloud Platform (BigQuery, Pub/Sub)", "Apache Spark", "Kafka", "Hadoop Migration", "Python"],
        "interviewFocus": [
            "FordPass consumer app telemetry and commercial fleet telematics (Ford Pro)",
            "Automated vehicle factory end-of-line diagnostic test result collection",
            "Migrating on-premises Hadoop data lakes to Google Cloud BigQuery and Dataproc",
            "Vehicle warranty claim text mining and rapid early-warning defect detection"
        ],
        "keyChallenges": "Extracting early quality defect signals from free-text mechanic repair orders across 3,000 Ford dealerships.",
        "sampleQuestions": [
            "Design an NLP and text classification pipeline analyzing technician repair notes to flag emergent mechanical defects 60 days faster.",
            "Architect a commercial fleet telematics platform streaming driver harsh braking, fuel consumption, and engine fault codes."
        ]
    },
    {
        "id": "mercedes-benz-mbrdi",
        "name": "Mercedes-Benz R&D India (MBRDI)",
        "tier": "Global Capability Center (GCC)",
        "location": "Stuttgart, Germany / Bengaluru",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "azure",
        "seniorDeSalary": "$185k - $285k (₹42L - ₹72L)",
        "architectSalary": "$290k - $435k (₹80L - ₹1.4Cr)",
        "systemDesignArchetype": "MB.OS Vehicle Operating System & Autonomous Drive Perception Lakehouse",
        "stack": ["Microsoft Azure (Databricks, ADLS Gen2)", "Apache Spark", "Kafka", "PostgreSQL", "ROS / C++", "Python"],
        "interviewFocus": [
            "MB.OS next-generation vehicle software architecture and in-cabin MBUX telemetry",
            "Autonomous drive sensor recording: petabyte-scale LiDAR, camera, and radar recording ingestion",
            "Azure Databricks Lakehouse for luxury fleet customer experience analytics",
            "ISO 26262 automotive functional safety compliance in data collection pipelines"
        ],
        "keyChallenges": "Ingesting and organizing petabytes of raw uncompressed camera and LiDAR sensor recordings from test fleets for AI driving models.",
        "sampleQuestions": [
            "Design a data pipeline ingesting raw camera and LiDAR drive logs to automatically extract 'near-miss' disengagement events.",
            "Architect an in-cabin MBUX voice assistant telemetry engine optimizing natural language understanding while enforcing GDPR user privacy."
        ]
    },
    {
        "id": "bmw-techworks",
        "name": "BMW TechWorks India",
        "tier": "Global Capability Center (GCC)",
        "location": "Munich, Germany / Pune / Bengaluru",
        "hiringGCCLocations": ["Pune", "Bengaluru"],
        "topicKey": "aws",
        "seniorDeSalary": "$185k - $280k (₹42L - ₹70L)",
        "architectSalary": "$290k - $430k (₹80L - ₹1.4Cr)",
        "systemDesignArchetype": "BMW Cloud Data Hub & Smart Factory Industrial Computer Vision",
        "stack": ["AWS (EMR, Glue, S3)", "Apache Spark", "Apache Kafka", "Snowflake", "Python", "Kubernetes"],
        "interviewFocus": [
            "BMW Cloud Data Hub: central corporate repository connecting 5,000+ data consumers",
            "Factory camera computer vision telemetry inspecting paint finishes and weld seams",
            "Electric vehicle charging session telemetry: optimizing public charging networks across Europe",
            "AWS data lake optimization for high-throughput vehicle sensor log processing"
        ],
        "keyChallenges": "Managing the BMW Cloud Data Hub connecting vehicle engineering, manufacturing plants, and consumer apps under a single governance model.",
        "sampleQuestions": [
            "Design an automated paint inspection data pipeline capturing high-resolution car body images on the assembly line to flag defects.",
            "Architect an EV charging session aggregation pipeline calculating battery charging curve efficiencies across different charging station hardware."
        ]
    },
    {
        "id": "stellantis-digital",
        "name": "Stellantis Digital Hub",
        "tier": "Global Capability Center (GCC)",
        "location": "Amsterdam / Detroit / Bengaluru / Hyderabad / Chennai",
        "hiringGCCLocations": ["Bengaluru", "Hyderabad", "Chennai"],
        "topicKey": "aws",
        "seniorDeSalary": "$180k - $275k (₹38L - ₹66L)",
        "architectSalary": "$280k - $415k (₹76L - ₹1.3Cr)",
        "systemDesignArchetype": "14-Brand Multi-Fleet Telematics & Global Common Platform Architecture",
        "stack": ["AWS", "Apache Spark", "Kafka", "Snowflake", "Databricks", "PostgreSQL", "Python"],
        "interviewFocus": [
            "Standardizing vehicle telemetry across 14 diverse automotive brands (Jeep, Ram, Peugeot, Fiat, etc.)",
            "Connected car monetization: insurance telematics and usage-based insurance (UBI) scoring",
            "Snowflake data modeling for global brand spare parts distribution and inventory",
            "Streaming ingestion of vehicle diagnostic trouble codes (DTCs)"
        ],
        "keyChallenges": "Harmonizing completely different proprietary electronics and telematics protocols from 14 merged automotive brands into one pipeline.",
        "sampleQuestions": [
            "Design an abstraction layer pipeline that maps disparate CAN bus diagnostic error codes from 14 brands to a single unified schema.",
            "Architect a Usage-Based Insurance (UBI) driving score calculator processing miles driven, acceleration, and night driving hours."
        ]
    },
    {
        "id": "volvo-group-gcc",
        "name": "Volvo Group Digital & IT",
        "tier": "Global Capability Center (GCC)",
        "location": "Gothenburg, Sweden / Bengaluru",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "azure",
        "seniorDeSalary": "$180k - $275k (₹38L - ₹66L)",
        "architectSalary": "$280k - $415k (₹76L - ₹1.3Cr)",
        "systemDesignArchetype": "Commercial Heavy Truck Telematics & Construction Equipment Uptime",
        "stack": ["Microsoft Azure (Databricks, IoT Hub, Synapse)", "Apache Spark", "Kafka", "PostgreSQL", "Python"],
        "interviewFocus": [
            "Commercial heavy truck telematics: fleet fuel efficiency, driver duty hours, and tachograph compliance",
            "Connected construction equipment (excavators, haulers) remote diagnostics and geofencing",
            "Electric commercial truck battery health and heavy-duty route charging optimization",
            "Azure Synapse dedicated SQL pools for global dealership service parts planning"
        ],
        "keyChallenges": "Guaranteeing 99.9% uptime for commercial fleet transport customers through predictive component replacement alerts.",
        "sampleQuestions": [
            "Design an uptime monitoring pipeline that predicts commercial truck alternator failures 500 operating hours in advance.",
            "Architect an electric truck route planning engine considering payload weight, road elevation profiles, and megawatt charging stops."
        ]
    },
    {
        "id": "bosch-bgsw",
        "name": "Bosch Global Software Technologies (BGSW)",
        "tier": "Global Capability Center (GCC)",
        "location": "Stuttgart, Germany / Bengaluru / Coimbatore / Hyderabad / Pune",
        "hiringGCCLocations": ["Bengaluru", "Coimbatore", "Hyderabad", "Pune"],
        "topicKey": "kafka",
        "seniorDeSalary": "$180k - $270k (₹36L - ₹64L)",
        "architectSalary": "$275k - $410k (₹72L - ₹1.25Cr)",
        "systemDesignArchetype": "Industrial IoT Industry 4.0 Platform & Automotive ECU Telemetry",
        "stack": ["Apache Kafka", "Apache Spark", "Bosch IoT Suite", "Cassandra", "PostgreSQL", "AWS / Azure", "C++ / Python"],
        "interviewFocus": [
            "Bosch IoT Suite: device management and telemetry ingestion for hundreds of millions of smart sensors",
            "Automotive Electronic Control Unit (ECU) flashing and telemetry validation pipelines",
            "Industry 4.0 factory automation: real-time Overall Equipment Effectiveness (OEE) metrics",
            "Edge-to-cloud data synchronization for industrial power tools and automotive components"
        ],
        "keyChallenges": "Connecting hundreds of millions of diverse sensors—from industrial factory presses to household smart appliances—to one IoT backend.",
        "sampleQuestions": [
            "Design an edge-to-cloud data synchronization framework for smart power tools operating in factories with intermittent Wi-Fi.",
            "Architect a real-time Overall Equipment Effectiveness (OEE) monitoring pipeline calculating availability, performance, and quality on assembly lines."
        ]
    },
    {
        "id": "siemens-tech-india",
        "name": "Siemens Technology India",
        "tier": "Global Capability Center (GCC)",
        "location": "Munich, Germany / Bengaluru / Pune / Gurugram",
        "hiringGCCLocations": ["Bengaluru", "Pune", "Gurugram"],
        "topicKey": "datalake",
        "seniorDeSalary": "$180k - $275k (₹38L - ₹65L)",
        "architectSalary": "$280k - $415k (₹75L - ₹1.3Cr)",
        "systemDesignArchetype": "Industrial Edge & Smart Grid SCADA Data Engineering",
        "stack": ["Siemens MindSphere / Xcelerator", "Apache Spark", "Kafka", "TimescaleDB / InfluxDB", "AWS / Azure", "Python"],
        "interviewFocus": [
            "SCADA and industrial PLC data protocol ingestion (OPC UA, Modbus, MQTT)",
            "High-frequency time-series database design for electrical smart grids and wind turbines",
            "Digital enterprise twin simulation pipelines for high-speed train networks (Siemens Mobility)",
            "Edge computing architectures preprocessing vibration frequencies before cloud upload"
        ],
        "keyChallenges": "Processing industrial high-frequency sensor readings (OPC UA) from train locomotives and power plants without cloud bandwidth saturation.",
        "sampleQuestions": [
            "Design an OPC UA industrial sensor ingestion pipeline that performs edge Fourier transform vibration analysis to reduce cloud upload bandwidth by 95%.",
            "Architect a smart electrical grid telemetry engine monitoring phase angles and frequency fluctuations across regional transmission substations."
        ]
    },
    {
        "id": "schneider-electric-gcc",
        "name": "Schneider Electric GCC",
        "tier": "Global Capability Center (GCC)",
        "location": "Rueil-Malmaison, France / Bengaluru",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "azure",
        "seniorDeSalary": "$175k - $265k (₹36L - ₹62L)",
        "architectSalary": "$270k - $400k (₹72L - ₹1.25Cr)",
        "systemDesignArchetype": "EcoStruxure Energy Management & Building IoT Automation",
        "stack": ["Microsoft Azure (Databricks, IoT Hub)", "Apache Spark", "TimescaleDB", "Power BI", "Python", "MQTT"],
        "interviewFocus": [
            "EcoStruxure IoT architecture: smart electrical panel and commercial building HVAC energy optimization",
            "Microgrid telemetry: balancing solar panels, battery energy storage systems (BESS), and diesel generators",
            "Time-series data compression and downsampling strategies for building management systems",
            "Carbon emissions reporting based on real-time kilowatt-hour electricity consumption"
        ],
        "keyChallenges": "Balancing real-time power distribution in industrial microgrids to avoid electrical demand peaks and utility surcharges.",
        "sampleQuestions": [
            "Design an energy management pipeline that predicts commercial building peak electrical load and triggers battery storage discharge.",
            "Architect a time-series downsampling engine converting 1-second electrical meter samples into 15-minute billing intervals over 10 million smart meters."
        ]
    },
    {
        "id": "honeywell-hts",
        "name": "Honeywell Technology Solutions (HTS)",
        "tier": "Global Capability Center (GCC)",
        "location": "Charlotte, NC / Bengaluru / Hyderabad / Madurai",
        "hiringGCCLocations": ["Bengaluru", "Hyderabad", "Madurai"],
        "topicKey": "aws",
        "seniorDeSalary": "$180k - $275k (₹38L - ₹66L)",
        "architectSalary": "$280k - $415k (₹76L - ₹1.3Cr)",
        "systemDesignArchetype": "Forge Enterprise Performance & Aerospace Avionics Telemetry",
        "stack": ["Honeywell Forge", "Apache Spark", "Kafka", "PostgreSQL", "Cassandra", "AWS / Azure", "Python"],
        "interviewFocus": [
            "Honeywell Forge enterprise SaaS platform: building digital twins for buildings, airlines, and industrial plants",
            "Avionics flight management system telemetry and auxiliary power unit (APU) health monitoring",
            "Connected worker safety sensor telemetry in oil refineries and hazardous industrial zones",
            "Cassandra data modeling for high-velocity industrial time-series events"
        ],
        "keyChallenges": "Synthesizing avionics health telemetry, building management data, and chemical plant sensor feeds into one SaaS data architecture.",
        "sampleQuestions": [
            "Design an avionics APU (Auxiliary Power Unit) health monitoring system predicting turbine starter failures from flight telemetry.",
            "Architect a hazardous chemical plant worker safety platform streaming toxic gas sensor readings and worker wearable heart rates."
        ]
    },
    {
        "id": "ge-vernova-gcc",
        "name": "GE Vernova & GE Aerospace GCC",
        "tier": "Global Capability Center (GCC)",
        "location": "Cambridge, MA / Evendale, OH / Bengaluru / Hyderabad",
        "hiringGCCLocations": ["Bengaluru", "Hyderabad"],
        "topicKey": "aws",
        "seniorDeSalary": "$185k - $285k (₹42L - ₹72L)",
        "architectSalary": "$290k - $435k (₹80L - ₹1.4Cr)",
        "systemDesignArchetype": "Jet Engine Fleet Analytics & Wind Turbine Power Generation Engine",
        "stack": ["AWS", "Apache Spark", "Kafka", "Cassandra", "PostgreSQL", "Predix Evolution", "Python"],
        "interviewFocus": [
            "Commercial jet engine flight analytics (GE90, GEnx, CFM LEAP): tracking blade creep and thermal degradation",
            "Offshore wind turbine SCADA telemetry: pitch control, yaw optimization, and gearbox vibration diagnostics",
            "Gas turbine combined-cycle power plant efficiency modeling and emissions compliance",
            "Large-scale distributed data pipelines processing petabytes of engineering test cell sensor sweeps"
        ],
        "keyChallenges": "Analyzing thousands of sensor channels per second from jet engine test cells during experimental certification test runs.",
        "sampleQuestions": [
            "Design an offshore wind farm telemetry lakehouse aggregating aerodynamic pitch and power output from 200 ocean turbines.",
            "Architect a real-time jet engine test cell data ingestion engine processing 50,000 thermal and pressure sensor channels during maximum thrust tests."
        ]
    },
    {
        "id": "caterpillar-india",
        "name": "Caterpillar India Engineering & Tech",
        "tier": "Global Capability Center (GCC)",
        "location": "Irving, TX / Peoria, IL / Bengaluru / Chennai",
        "hiringGCCLocations": ["Bengaluru", "Chennai"],
        "topicKey": "azure",
        "seniorDeSalary": "$180k - $275k (₹38L - ₹66L)",
        "architectSalary": "$280k - $415k (₹76L - ₹1.3Cr)",
        "systemDesignArchetype": "Heavy Earthmoving Telematics & Cat Product Link Analytics",
        "stack": ["Microsoft Azure (IoT Hub, Databricks, ADLS)", "Apache Spark", "Kafka", "Snowflake", "Python"],
        "interviewFocus": [
            "Cat Product Link telematics: satellite and cellular telemetry from 1+ million connected machines worldwide",
            "Heavy mining equipment autonomous haul truck dispatch and fleet management in remote open-pit mines",
            "Hydraulic fluid degradation and mechanical stress predictive maintenance pipelines",
            "Satellite communication bandwidth optimization for machines operating outside cellular coverage"
        ],
        "keyChallenges": "Collecting and compressing telemetry from mining trucks operating in remote Australian or Chilean deserts via high-cost satellite links.",
        "sampleQuestions": [
            "Design a store-and-forward satellite telemetry pipeline for mining excavators that prioritizes critical fault alerts over routine metrics.",
            "Architect a predictive maintenance system analyzing hydraulic pump pressure drops to alert field mechanics before catastrophic pump blowout."
        ]
    },
    {
        "id": "john-deere-india",
        "name": "John Deere India Technology Center",
        "tier": "Global Capability Center (GCC)",
        "location": "Moline, IL / Pune",
        "hiringGCCLocations": ["Pune"],
        "topicKey": "aws",
        "seniorDeSalary": "$180k - $275k (₹38L - ₹66L)",
        "architectSalary": "$280k - $420k (₹76L - ₹1.35Cr)",
        "systemDesignArchetype": "Precision Agriculture & John Deere Operations Center Platform",
        "stack": ["AWS (EMR, S3, Kinesis)", "Apache Spark", "PostgreSQL / PostGIS", "Snowflake", "Python", "Kubernetes"],
        "interviewFocus": [
            "John Deere Operations Center: precision agronomic spatial data layers (seed rate, fertilizer, harvest yield)",
            "See & Spray computer vision machine telemetry: identifying weeds and applying micro-doses of herbicide",
            "PostGIS spatial query optimization on irregular farm field boundary polygons",
            "Offline tractor telematics recording during harvest in rural areas with zero cellular connectivity"
        ],
        "keyChallenges": "Processing spatial yield maps and seed planting layers across hundreds of millions of farm acres with sub-meter GPS precision.",
        "sampleQuestions": [
            "Design an agronomic geospatial data pipeline converting raw tractor combine harvester GPS logs into precision field yield maps.",
            "Architect a computer vision edge telemetry pipeline recording weed detection accuracy on See & Spray agricultural sprayers."
        ]
    },
    {
        "id": "3m-digital-gcc",
        "name": "3M Digital GCC",
        "tier": "Global Capability Center (GCC)",
        "location": "Saint Paul, MN / Bengaluru",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "azure",
        "seniorDeSalary": "$175k - $265k (₹36L - ₹62L)",
        "architectSalary": "$270k - $400k (₹72L - ₹1.25Cr)",
        "systemDesignArchetype": "Materials Science Informatics & Healthcare Coding Lakehouse",
        "stack": ["Microsoft Azure (Databricks, Synapse)", "Apache Spark", "Kafka", "PostgreSQL", "Power BI", "Python"],
        "interviewFocus": [
            "3M Health Information Systems: medical coding and clinical documentation improvement (CDI) pipelines",
            "Materials science chemical formulation data modeling and adhesive property simulation",
            "Smart factory quality inspection for sandpaper, adhesives, and dental products",
            "Azure Synapse dedicated SQL pools for global chemical manufacturing supply chains"
        ],
        "keyChallenges": "Processing complex hospital clinical documentation files to automatically assign ICD-10 medical billing codes under strict HIPAA rules.",
        "sampleQuestions": [
            "Design an automated clinical documentation processing pipeline mapping physician encounter notes to standardized ICD-10 billing codes.",
            "Architect a materials science formulation database indexing polymer chemical compositions and mechanical shear stress test results."
        ]
    },
    {
        "id": "exxonmobil-gcc",
        "name": "ExxonMobil Global Services",
        "tier": "Global Capability Center (GCC)",
        "location": "Spring, TX / Bengaluru",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "azure",
        "seniorDeSalary": "$185k - $285k (₹42L - ₹72L)",
        "architectSalary": "$295k - $440k (₹82L - ₹1.45Cr)",
        "systemDesignArchetype": "Upstream Reservoir Simulation & Downstream Refinery Optimization",
        "stack": ["Microsoft Azure (Databricks, Synapse, ADLS)", "Apache Spark", "OSDU (Open Subsurface Data Universe)", "Kafka", "Python"],
        "interviewFocus": [
            "OSDU (Open Subsurface Data Universe) standardized petrotechnical data lake architecture",
            "Seismic trace data ingestion (SEG-Y format) and 3D subsurface reservoir simulation models",
            "Refinery catalytic cracking IoT sensor stream processing and crude distillation unit optimization",
            "High-performance compute clusters for geophysical modeling on Azure"
        ],
        "keyChallenges": "Managing multi-petabyte 3D seismic survey datasets (SEG-Y) and integrating them into the Open Subsurface Data Universe (OSDU) standard.",
        "sampleQuestions": [
            "Design an automated SEG-Y seismic survey ingestion pipeline converting raw geophone traces into cloud-optimized multidimensional formats.",
            "Architect an oil refinery real-time sensor monitoring engine optimizing furnace temperature to maximize gasoline and diesel yields."
        ]
    },
    {
        "id": "chevron-tech-center",
        "name": "Chevron Tech Center (India)",
        "tier": "Global Capability Center (GCC)",
        "location": "San Ramon, CA / Bengaluru",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "microsoft",
        "seniorDeSalary": "$185k - $280k (₹42L - ₹70L)",
        "architectSalary": "$290k - $430k (₹80L - ₹1.4Cr)",
        "systemDesignArchetype": "Subsurface Geophysics Lakehouse & Deepwater Drilling Telemetry",
        "stack": ["Microsoft Fabric / Azure Databricks", "Apache Spark", "Kafka", "PostgreSQL", "Power BI", "Python"],
        "interviewFocus": [
            "Deepwater offshore drilling rig telemetry: real-time downhole pressure and drill bit rotational speed",
            "Microsoft Fabric OneLake and Azure Databricks for petrotechnical and financial analytics unification",
            "Liquefied Natural Gas (LNG) tanker shipping fleet tracking and boil-off gas rate calculations",
            "Predictive maintenance for multi-stage gas compressors and crude oil pipeline pumps"
        ],
        "keyChallenges": "Detecting drill bit binding and borehole blowout pressures in real time during deepwater ocean drilling operations.",
        "sampleQuestions": [
            "Design a deepwater drilling downhole sensor stream processing engine triggering automated well shut-in alarms within 2 seconds.",
            "Architect a Microsoft Fabric Direct Lake analytics model for global crude oil and natural gas trading positions."
        ]
    },
    {
        "id": "shell-tech-stcb",
        "name": "Shell Technology Centre Bangalore (STCB)",
        "tier": "Global Capability Center (GCC)",
        "location": "The Hague / London / Bengaluru",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "aws",
        "seniorDeSalary": "$185k - $285k (₹42L - ₹72L)",
        "architectSalary": "$290k - $435k (₹80L - ₹1.4Cr)",
        "systemDesignArchetype": "Shell.ai Platform & Renewable Energy Grid Ingestion",
        "stack": ["AWS (EMR, S3)", "Databricks", "Snowflake", "Apache Spark", "Kafka", "Python", "Kubernetes"],
        "interviewFocus": [
            "Shell.ai platform: deploying 100+ AI and machine learning applications across global assets",
            "Renewable energy integration: forecasting solar and wind power output to trade on European power exchanges",
            "Predictive maintenance on 3+ million valves and rotating machines across global refineries",
            "Databricks Lakehouse architecture for retail EV charging network (Shell Recharge) telemetry"
        ],
        "keyChallenges": "Predicting mechanical valve and turbine failures across 80+ offshore oil platforms and chemical refineries worldwide.",
        "sampleQuestions": [
            "Design a predictive maintenance system on Databricks monitoring acoustic sensors across 500,000 refinery valves.",
            "Architect a renewable power trading data pipeline ingesting satellite weather models to forecast wind farm electrical generation."
        ]
    },
    {
        "id": "bp-digital-gcc",
        "name": "BP Digital Global Solutions",
        "tier": "Global Capability Center (GCC)",
        "location": "London / Pune",
        "hiringGCCLocations": ["Pune"],
        "topicKey": "azure",
        "seniorDeSalary": "$180k - $275k (₹38L - ₹66L)",
        "architectSalary": "$280k - $420k (₹76L - ₹1.35Cr)",
        "systemDesignArchetype": "Global Energy Trading & Net Zero Carbon Accounting Engine",
        "stack": ["Microsoft Azure (Databricks, Synapse)", "Apache Spark", "Kafka", "Snowflake", "Python", "Power BI"],
        "interviewFocus": [
            "Energy commodity trading and risk management (ETRM) deal capture and market risk VaR",
            "Net zero carbon accounting: tracking Scope 1, Scope 2, and Scope 3 greenhouse gas emissions",
            "Azure Databricks Lakehouse for global convenience store and retail fuel pricing",
            "Real-time pipeline leak detection using acoustic pressure wave sensors"
        ],
        "keyChallenges": "Calculating real-time Value at Risk (VaR) for complex cross-commodity oil, natural gas, and carbon credit trading books.",
        "sampleQuestions": [
            "Design an energy commodity trading risk aggregation pipeline calculating intraday PnL across international gas pipeline hubs.",
            "Architect an enterprise greenhouse gas accounting platform reconciling Scope 1, 2, and 3 emissions for corporate sustainability audits."
        ]
    },
    {
        "id": "totalenergies-gcc",
        "name": "TotalEnergies Digital Hub",
        "tier": "Global Capability Center (GCC)",
        "location": "Paris / Bengaluru Hub",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "datalake",
        "seniorDeSalary": "$180k - $270k (₹38L - ₹65L)",
        "architectSalary": "$280k - $415k (₹75L - ₹1.3Cr)",
        "systemDesignArchetype": "Multi-Energy Transition Platform & Solar Battery Storage Mesh",
        "stack": ["Apache Spark", "Kafka", "PostgreSQL", "Snowflake", "AWS / Azure", "Python", "Airflow"],
        "interviewFocus": [
            "Multi-energy portfolio management: balancing traditional LNG assets with utility-scale solar farms",
            "Utility-scale battery energy storage system (BESS) charge/discharge dispatching telemetry",
            "Subsurface reservoir pressure data management and CO2 geological carbon capture tracking",
            "Snowflake data modeling for international maritime fuel bunkering"
        ],
        "keyChallenges": "Optimizing charge and discharge cycles for multi-gigawatt battery storage assets participating in deregulated electricity markets.",
        "sampleQuestions": [
            "Design an automated battery energy dispatching pipeline that triggers grid feed-in during peak wholesale electricity pricing hours.",
            "Architect a geological carbon sequestration monitoring platform tracking CO2 injection pressures across depleted offshore gas fields."
        ]
    },
    {
        "id": "mckesson-tech-gcc",
        "name": "McKesson Technology GCC",
        "tier": "Global Capability Center (GCC)",
        "location": "Irving, TX / Remote / Bengaluru Partner Hub",
        "hiringGCCLocations": ["Bengaluru / Remote"],
        "topicKey": "snowflake",
        "seniorDeSalary": "$185k - $280k (₹40L - ₹70L)",
        "architectSalary": "$285k - $425k (₹78L - ₹1.35Cr)",
        "systemDesignArchetype": "Pharmaceutical Wholesale Distribution & DSCSA Serialization Engine",
        "stack": ["Snowflake", "Apache Spark", "Kafka", "AWS (EMR, S3)", "Python", "Airflow"],
        "interviewFocus": [
            "Drug Supply Chain Security Act (DSCSA) compliance: unit-level serialization and track-and-trace tracking",
            "Pharmaceutical distribution cold-chain tracking for temperature-sensitive biologics and vaccines",
            "Snowflake data warehouse modeling for pharmacy retail replenishment and rebate settlement",
            "Real-time pharmaceutical drug shortage forecasting and allocation management"
        ],
        "keyChallenges": "Tracking the unique serial barcode of every single medicine package distributed across thousands of hospitals and pharmacies.",
        "sampleQuestions": [
            "Design a DSCSA-compliant drug serialization tracking pipeline recording custody handoffs for 50 million medicine bottles daily.",
            "Architect a nationwide prescription medication shortage predictor that dynamically quotas hospital orders during supply crunches."
        ]
    },
    {
        "id": "optum-uhg",
        "name": "Optum / UnitedHealth Group (UHG)",
        "tier": "Global Capability Center (GCC)",
        "location": "Minnetonka, MN / Hyderabad / Bengaluru / Gurugram / Noida",
        "hiringGCCLocations": ["Hyderabad", "Bengaluru", "Gurugram", "Noida"],
        "topicKey": "datalake",
        "seniorDeSalary": "$190k - $290k (₹44L - ₹75L)",
        "architectSalary": "$300k - $445k (₹85L - ₹1.5Cr)",
        "systemDesignArchetype": "Enterprise Healthcare Claims Adjudication & Clinical Fraud Shield",
        "stack": ["Apache Spark", "Apache Kafka", "Snowflake", "Databricks", "Cassandra", "AWS / Azure", "Python"],
        "interviewFocus": [
            "Healthcare insurance claims adjudication processing (EDI 837 / 835 transactions) at national scale",
            "Real-time healthcare fraud, waste, and abuse (FWA) detection using graph connected components",
            "Databricks Lakehouse architecture for longitudinal patient clinical records and chronic disease management",
            "HIPAA compliance, de-identification algorithms (Safe Harbor and Expert Determination), and data masking"
        ],
        "keyChallenges": "Processing over 1 trillion dollars in annual medical claims while catching fraudulent billing schemes in sub-seconds.",
        "sampleQuestions": [
            "Design a real-time medical insurance claims pre-adjudication pipeline checking policy limits and duplicate billing codes in under 100ms.",
            "Architect a HIPAA-compliant healthcare data clean room allowing pharma researchers to query patient treatment paths without revealing identities."
        ]
    },
    {
        "id": "elevance-carelon",
        "name": "Elevance Health (Carelon Global Solutions)",
        "tier": "Global Capability Center (GCC)",
        "location": "Indianapolis, IN / Bengaluru / Hyderabad",
        "hiringGCCLocations": ["Bengaluru", "Hyderabad"],
        "topicKey": "aws",
        "seniorDeSalary": "$180k - $275k (₹38L - ₹66L)",
        "architectSalary": "$280k - $420k (₹76L - ₹1.35Cr)",
        "systemDesignArchetype": "Whole Health Digital Platform & Member Clinical Care Optimization",
        "stack": ["AWS (EMR, Glue, S3)", "Snowflake", "Databricks", "Apache Spark", "Kafka", "Python", "Airflow"],
        "interviewFocus": [
            "Whole Health data integration: combining medical, pharmacy, behavioral, and dental health data",
            "Prior authorization automated decisioning pipelines utilizing clinical guidelines",
            "Snowflake data modeling for commercial and Medicare / Medicaid population health analytics",
            "Social Determinants of Health (SDOH) feature extraction from census and community data"
        ],
        "keyChallenges": "Integrating fragmented medical, pharmacy, and behavioral health records into a single longitudinal member record.",
        "sampleQuestions": [
            "Design an automated prior authorization review pipeline that approves routine medical procedures within 30 seconds based on patient history.",
            "Architect a Social Determinants of Health (SDOH) analytics pipeline identifying members needing transportation or nutritional assistance."
        ]
    },
    {
        "id": "cigna-healthcare",
        "name": "Cigna Healthcare Digital",
        "tier": "Global Capability Center (GCC)",
        "location": "Bloomfield, CT / Bengaluru / Hyderabad",
        "hiringGCCLocations": ["Bengaluru", "Hyderabad"],
        "topicKey": "azure",
        "seniorDeSalary": "$180k - $275k (₹38L - ₹66L)",
        "architectSalary": "$280k - $415k (₹76L - ₹1.3Cr)",
        "systemDesignArchetype": "Evernorth Pharmacy Benefits & Real-Time Prescription Adjudication",
        "stack": ["Microsoft Azure (Databricks, Synapse)", "Snowflake", "Apache Spark", "Kafka", "PostgreSQL", "Python"],
        "interviewFocus": [
            "Evernorth Pharmacy Benefit Management (PBM) sub-second prescription copay calculation at pharmacy counters",
            "Drug-drug adverse interaction screening streaming engine for retail pharmacies",
            "Specialty pharmacy cold-chain medication shipment scheduling and patient therapy adherence",
            "Azure Databricks Lakehouse implementation for employer health plan reporting"
        ],
        "keyChallenges": "Executing real-time formulary tier lookups, copay calculations, and drug interaction safety checks in under 500ms at pharmacy registers.",
        "sampleQuestions": [
            "Design a real-time pharmacy benefit copay calculation engine checking employer formulary tiers in under 200ms.",
            "Architect a drug interaction safety screening pipeline cross-referencing new prescriptions against a patient's active medication history."
        ]
    },
    {
        "id": "fedex-gcc",
        "name": "FedEx Global Capability Center",
        "tier": "Global Capability Center (GCC)",
        "location": "Memphis, TN / Hyderabad",
        "hiringGCCLocations": ["Hyderabad"],
        "topicKey": "datalake",
        "seniorDeSalary": "$185k - $280k (₹42L - ₹70L)",
        "architectSalary": "$290k - $430k (₹80L - ₹1.4Cr)",
        "systemDesignArchetype": "Global Package Telemetry Firehose & Dynamic Aircraft Sortation Hub",
        "stack": ["Apache Spark", "Apache Flink", "Kafka", "Cassandra", "Google Cloud BigQuery", "AWS S3", "Python"],
        "interviewFocus": [
            "Package barcode tracking firehose: processing 100+ million scan events per day",
            "Memphis World Hub aircraft package sortation and automated conveyor routing algorithms",
            "SenseAware IoT sensor ingestion: tracking temperature, humidity, and tilt on high-value shipments",
            "BigQuery analytical modeling for worldwide package transit times and delivery route optimization"
        ],
        "keyChallenges": "Sorting and routing hundreds of thousands of packages per hour across airport conveyor networks to meet tight night flight departures.",
        "sampleQuestions": [
            "Design a package tracking event stream processing 10,000 barcode scans/sec and publishing real-time delivery estimates to recipients.",
            "Architect an IoT shipment telemetry engine monitoring temperature excursions for organ transplant and biomedical packages."
        ]
    },
    {
        "id": "ups-technology-india",
        "name": "UPS Technology Center India",
        "tier": "Global Capability Center (GCC)",
        "location": "Atlanta, GA / Chennai",
        "hiringGCCLocations": ["Chennai"],
        "topicKey": "gcp",
        "seniorDeSalary": "$180k - $275k (₹40L - ₹68L)",
        "architectSalary": "$280k - $420k (₹78L - ₹1.35Cr)",
        "systemDesignArchetype": "ORION Dynamic Route Optimization & Smart Package Facility Stream",
        "stack": ["Google Cloud Platform (BigQuery, Dataflow)", "Apache Spark", "Kafka", "PostgreSQL", "Python", "Kubernetes"],
        "interviewFocus": [
            "ORION (On-Road Integrated Optimization and Navigation) delivery vehicle route optimization",
            "Smart Package smart facility Bluetooth beacon tracking inside delivery vans and sorting hubs",
            "GCP Dataflow streaming pipelines aggregating package hub telemetry",
            "Predictive vehicle fleet maintenance analyzing delivery van engine telemetry and brake wear"
        ],
        "keyChallenges": "Calculating optimal turn-by-turn delivery routes for 100,000 drivers daily, reducing millions of miles driven and fuel consumed.",
        "sampleQuestions": [
            "Design a delivery route recalculation pipeline that adjusts driver delivery sequence in real time based on mid-day traffic and priority package pickups.",
            "Architect a smart facility package location tracking system using Bluetooth beacon pings to alert drivers when a misplaced box is loaded."
        ]
    },
    {
        "id": "maersk-technology",
        "name": "Maersk Technology",
        "tier": "Global Capability Center (GCC)",
        "location": "Copenhagen, Denmark / Bengaluru / Pune",
        "hiringGCCLocations": ["Bengaluru", "Pune"],
        "topicKey": "azure",
        "seniorDeSalary": "$185k - $285k (₹42L - ₹72L)",
        "architectSalary": "$295k - $440k (₹82L - ₹1.45Cr)",
        "systemDesignArchetype": "Global Ocean Container Shipping & Port Terminal IoT Mesh",
        "stack": ["Microsoft Azure (Databricks, IoT Hub, Synapse)", "Apache Spark", "Kafka", "Snowflake", "Python"],
        "interviewFocus": [
            "Remote Container Management (RCM): real-time temperature, atmosphere, and GPS on 300,000+ refrigerated containers (reefers)",
            "Automated terminal container crane dispatching and vessel stowage planning algorithms",
            "Customs documentation and international trade regulatory clearance pipelines",
            "Azure Databricks Lakehouse architecture for end-to-end supply chain visibility"
        ],
        "keyChallenges": "Managing satellite IoT communication for 300,000 refrigerated shipping containers crossing the oceans to protect perishable cargo.",
        "sampleQuestions": [
            "Design a refrigerated container telemetry platform monitoring temperature and CO2 levels on container ships via satellite with failover storage.",
            "Architect a port terminal optimization engine that schedules container yard cranes to minimize ship turnaround docking times."
        ]
    },
    {
        "id": "dhl-it-services",
        "name": "DHL IT Services",
        "tier": "Global Capability Center (GCC)",
        "location": "Bonn, Germany / Prague / Cyberjaya / Chennai",
        "hiringGCCLocations": ["Chennai"],
        "topicKey": "kafka",
        "seniorDeSalary": "$180k - $270k (₹38L - ₹65L)",
        "architectSalary": "$280k - $415k (₹76L - ₹1.3Cr)",
        "systemDesignArchetype": "Global Freight Forwarding & Supply Chain Control Tower",
        "stack": ["Apache Kafka", "Apache Spark", "Snowflake", "PostgreSQL", "AWS / Azure", "Python", "Airflow"],
        "interviewFocus": [
            "Cross-border customs brokerage and automated tariff code (HS Code) classification",
            "DHL Supply Chain Control Tower: real-time global freight visibility across air, ocean, and road",
            "Warehouse management system (WMS) robotics telemetry: autonomous mobile robots (AMRs)",
            "Snowflake data modeling for multinational client logistics carbon footprint reporting"
        ],
        "keyChallenges": "Classifying millions of cross-border customs declarations into correct international Harmonized System (HS) tariff codes automatically.",
        "sampleQuestions": [
            "Design an automated customs tariff classification pipeline using text parsing and historical import filings to assign HS codes.",
            "Architect a real-time warehouse robotics telemetry pipeline tracking 200 autonomous mobile robots navigating picking aisles."
        ]
    },
    {
        "id": "delta-air-lines-tech",
        "name": "Delta Air Lines Technology Hub",
        "tier": "Global Capability Center (GCC)",
        "location": "Atlanta, GA / Bengaluru",
        "hiringGCCLocations": ["Bengaluru"],
        "topicKey": "aws",
        "seniorDeSalary": "$185k - $280k (₹40L - ₹70L)",
        "architectSalary": "$285k - $430k (₹78L - ₹1.35Cr)",
        "systemDesignArchetype": "Airport Flight Operations & SkyMiles Passenger Telemetry Lakehouse",
        "stack": ["AWS", "Apache Spark", "Kafka", "Snowflake", "Cassandra", "PostgreSQL", "Python"],
        "interviewFocus": [
            "Airport operations disruption management: rebooking passengers and aircraft during severe weather storms",
            "SkyMiles loyalty member real-time point balance updates and dynamic upgrade pricing",
            "Baggage RFID tracking firehose: monitoring bags from check-in through aircraft belly to baggage carousel",
            "Snowflake analytical models for flight profitability, fuel burn, and gate turn times"
        ],
        "keyChallenges": "Re-routing tens of thousands of delayed passengers and re-scheduling aircraft crews in real time during major hub weather shutdowns.",
        "sampleQuestions": [
            "Design an automated irregular flight operations recovery engine that rebooks displaced passengers onto alternative partner airline flights.",
            "Architect a real-time baggage tracking pipeline ingesting RFID conveyor scan events to alert baggage handlers of misrouted luggage."
        ]
    },
    {
        "id": "marriott-digital",
        "name": "Marriott Digital & Tech",
        "tier": "Global Capability Center (GCC)",
        "location": "Bethesda, MD / Remote / Bengaluru Partner Hub",
        "hiringGCCLocations": ["Bengaluru / Remote"],
        "topicKey": "aws",
        "seniorDeSalary": "$180k - $275k (₹38L - ₹66L)",
        "architectSalary": "$280k - $420k (₹76L - ₹1.35Cr)",
        "systemDesignArchetype": "Marriott Bonvoy Global Loyalty & Dynamic Room Rate Pricing Engine",
        "stack": ["AWS (EMR, S3, DynamoDB)", "Snowflake", "Apache Spark", "Kafka", "dbt", "Airflow", "Python"],
        "interviewFocus": [
            "Marriott Bonvoy loyalty platform: managing point redemptions across 8,500+ properties and 30 brands",
            "Dynamic room rate pricing engine: adjusting hotel room rates based on local occupancy and flight arrivals",
            "Central Reservation System (CRS) synchronization with online travel agencies (Expedia, Booking.com)",
            "Snowflake data modeling for guest preferences, room upgrade propensity, and food/beverage spend"
        ],
        "keyChallenges": "Synchronizing room availability across 8,500 hotels and dozens of online travel agencies with zero double-booking.",
        "sampleQuestions": [
            "Design a hotel room inventory distribution pipeline that broadcasts room availability to 50 OTAs and handles instant booking locks.",
            "Architect a dynamic hotel room pricing engine recalculating rates across 1.5 million rooms based on real-time competitor prices and occupancy."
        ]
    },
    {
        "id": "hilton-technology",
        "name": "Hilton Worldwide Technology",
        "tier": "Global Capability Center (GCC)",
        "location": "McLean, VA / Dallas, TX / Remote",
        "hiringGCCLocations": ["Dallas / Remote"],
        "topicKey": "aws",
        "seniorDeSalary": "$180k - $270k (₹38L - ₹65L)",
        "architectSalary": "$280k - $415k (₹76L - ₹1.3Cr)",
        "systemDesignArchetype": "Hilton Honors Digital Key Stream & Connected Room IoT Platform",
        "stack": ["AWS (EMR, Lambda, S3)", "Snowflake", "Kafka", "PostgreSQL", "Python", "Airflow"],
        "interviewFocus": [
            "Hilton Digital Key Bluetooth door lock telemetry and secure digital room key issuance",
            "Connected Room IoT: guest smart thermostat, lighting, and TV personalization stream",
            "Hilton Honors loyalty points accounting and co-branded credit card milestone processing",
            "Snowflake dimensional modeling for hotel franchise owner performance and revenue per available room (RevPAR)"
        ],
        "keyChallenges": "Issuing encrypted Bluetooth digital room keys to mobile phones within 3 seconds of hotel app check-in.",
        "sampleQuestions": [
            "Design a secure digital room key generation and authorization engine dispatching encrypted Bluetooth tokens upon online guest check-in.",
            "Architect an enterprise RevPAR (Revenue Per Available Room) analytics warehouse calculating nightly metrics across 7,000 hotel properties."
        ]
    }
]
