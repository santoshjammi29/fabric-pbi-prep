export interface GuidedTopic {
  key: string;
  label: string;
  icon: string;          // emoji
  gradient: string;      // tailwind gradient classes for the chip
  description: string;
  conceptCategories: string[];    // exact match against data_concepts.json `category`
  questionCategories: string[];   // exact/partial match against questions.json `category` (uppercase)
  archKeywords: string[];         // partial match against data_architecture.json `category` (uppercase)
  deKeywords: string[];           // partial match against data_de.json `category` (uppercase)
}

export const GUIDED_TOPICS: GuidedTopic[] = [
  {
    key: 'airflow', label: 'Apache Airflow', icon: '🌊',
    gradient: 'from-sky-500 to-cyan-500',
    description: 'Orchestration, DAGs & pipeline scheduling',
    conceptCategories: ['APACHE AIRFLOW'],
    questionCategories: ['AIRFLOW', 'DAG'],
    archKeywords: ['AIRFLOW'],
    deKeywords: ['ETL', 'PIPELINE'],
  },
  {
    key: 'databricks', label: 'Databricks', icon: '⚡',
    gradient: 'from-orange-500 to-red-500',
    description: 'Lakehouse, Delta Lake & Unity Catalog',
    conceptCategories: ['DATABRICKS', 'SPARK & DATABRICKS'],
    questionCategories: ['DATABRICKS', 'SPARK & DATABRICKS', 'SPARK_PYSPARK'],
    archKeywords: ['DATABRICKS', 'DELTA', 'PYSPARK', 'SPARK'],
    deKeywords: ['BIG DATA'],
  },
  {
    key: 'dbt', label: 'dbt', icon: '🔧',
    gradient: 'from-orange-400 to-amber-500',
    description: 'SQL transformation, testing & data modeling',
    conceptCategories: ['DBT'],
    questionCategories: ['DBT'],
    archKeywords: ['DBT'],
    deKeywords: [],
  },
  {
    key: 'adf', label: 'Azure Data Factory', icon: '🏭',
    gradient: 'from-blue-500 to-indigo-600',
    description: 'ELT pipelines, integration runtimes & data flows',
    conceptCategories: ['ADF'],
    questionCategories: ['ADF'],
    archKeywords: ['ADF', 'DATA FACTORY'],
    deKeywords: ['ETL'],
  },
  {
    key: 'sql', label: 'SQL Server', icon: '🗄️',
    gradient: 'from-emerald-500 to-teal-600',
    description: 'T-SQL, query optimization & SQL Server internals',
    conceptCategories: ['SQL SERVER'],
    questionCategories: ['SQL SERVER'],
    archKeywords: ['SQL', 'MPP'],
    deKeywords: ['DATABASES', 'SQL'],
  },
  {
    key: 'fabric', label: 'Microsoft Fabric', icon: '🧵',
    gradient: 'from-violet-500 to-purple-600',
    description: 'SaaS data platform, OneLake & Fabric workloads',
    conceptCategories: ['FABRIC'],
    questionCategories: ['FABRIC'],
    archKeywords: ['FABRIC'],
    deKeywords: [],
  },
  {
    key: 'spark', label: 'Apache Spark', icon: '✨',
    gradient: 'from-yellow-500 to-orange-500',
    description: 'Distributed processing, PySpark & Spark SQL',
    conceptCategories: ['SPARK & DATABRICKS'],
    questionCategories: ['SPARK & DATABRICKS', 'SPARK_PYSPARK'],
    archKeywords: ['PYSPARK', 'SPARK'],
    deKeywords: ['BIG DATA'],
  },
  {
    key: 'powerbi', label: 'Power BI', icon: '📊',
    gradient: 'from-yellow-400 to-amber-500',
    description: 'DAX, data modeling & enterprise BI',
    conceptCategories: ['POWER BI'],
    questionCategories: ['POWER BI'],
    archKeywords: ['POWER BI', 'POWER PLATFORM'],
    deKeywords: ['DATA VISUALIZATION'],
  },
  {
    key: 'datalake', label: 'Data Lake & Architecture', icon: '🏗️',
    gradient: 'from-slate-500 to-zinc-600',
    description: 'Lakehouse, medallion architecture & data modeling',
    conceptCategories: ['DATALAKE ARCHITECTURE', 'GENERAL DE'],
    questionCategories: ['DATALAKE ARCHITECTURE', 'LAKEHOUSE', 'CDC', 'INGESTION'],
    archKeywords: ['LAKEHOUSE', 'DATA MESH', 'MODELING', 'ARCHITECTURE', 'DATA VAULT'],
    deKeywords: ['DATA ENGINEERING', 'GOVERNANCE'],
  },
];
