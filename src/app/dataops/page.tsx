import { Metadata } from "next";
import { Suspense } from "react";
import { getDataOpsDataDAL } from "@/lib/dal";
import { DataOpsClient } from "./dataops-client";
import { generatePageMetadata, generateHowToSchema, generateCourseSchema } from "@/lib/seo";

export const revalidate = 3600; // 1-hour ISR cache on edge

export async function generateMetadata(): Promise<Metadata> {
  const data = await getDataOpsDataDAL();
  return generatePageMetadata({
    title: `Enterprise DataOps & CI/CD Lifecycle (${data.connectivity.length} Scenarios, ${data.cicdAlternatives.length} Blueprints)`,
    description: `Complete architect playbook for ADF, Databricks, Airflow, dbt, SQL connectivity, 5 production CI/CD alternatives (DABs, Git-Sync, Slim CI), and 6-stage end-to-end data platform lifecycle.`,
    path: "/dataops",
    keywords: [
      "DataOps",
      "Databricks Asset Bundles",
      "Airflow Git-Sync",
      "dbt Slim CI",
      "ADF CI/CD",
      "Unity Catalog",
      "Data Engineering Lifecycle",
      "Big Data Architect Interview",
    ],
  });
}

export default async function DataOpsPage() {
  const data = await getDataOpsDataDAL();

  const howToSchema = generateHowToSchema(
    "How to Implement Production CI/CD for Databricks and dbt Lakehouses",
    "Comprehensive guide to implementing zero-static-secret DataOps pipelines with Databricks Asset Bundles, dbt Slim CI, and automated deployment.",
    [
      {
        name: "Establish Workload Identity Federation (OIDC)",
        text: "Configure GitHub Actions or Azure DevOps with Microsoft Entra ID federated credentials to eliminate long-lived client secrets.",
      },
      {
        name: "Implement dbt Slim CI with Manifest Deferral",
        text: "Download production manifest.json and run dbt build --select state:modified+ --defer into ephemeral PR schemas.",
      },
      {
        name: "Deploy Databricks Asset Bundles (DABs)",
        text: "Validate databricks.yml in PR checks and execute databricks bundle deploy -t prod under a dedicated Service Principal.",
      },
      {
        name: "Automate Database and Lakehouse Schema Evolution",
        text: "Enforce versioned migrations with Flyway for relational targets and Delta Lake shallow clone blue/green swaps.",
      },
    ]
  );

  const courseSchema = generateCourseSchema(
    "Big Data DataOps & CI/CD Lifecycle Masterclass",
    "Master tool connectivity, secrets management, CI/CD alternatives, and end-to-end project lifecycles across modern big data platforms.",
    "/dataops"
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
            <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading Enterprise DataOps Playbook...</span>
            </div>
          </div>
        }
      >
        <DataOpsClient initialData={data} />
      </Suspense>
    </>
  );
}
