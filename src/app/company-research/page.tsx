"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  Search,
  Sparkles,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanyProfile {
  id: string;
  name: string;
  tier: "Tier 1 FAANG / BigTech" | "Tier 1 Global FinTech" | "Global Capability Center (GCC)";
  location: string;
  logo: string;
  seniorDeSalary: string;
  architectSalary: string;
  stack: string[];
  interviewFocus: string[];
  keyChallenges: string;
}

const companyProfiles: CompanyProfile[] = [
  {
    id: "databricks",
    name: "Databricks",
    tier: "Tier 1 FAANG / BigTech",
    location: "Global / Remote",
    logo: "🔥",
    seniorDeSalary: "$240k - $360k (₹65L - ₹1.1Cr)",
    architectSalary: "$380k - $550k (₹1.2Cr - ₹2.2Cr)",
    stack: ["Spark 4.0", "Delta Lake", "Photon C++", "Unity Catalog", "Scala", "Rust", "Vector Search"],
    interviewFocus: [
      "Deep Spark Tungsten off-heap memory layout",
      "Catalyst physical optimizer rules & dynamic code generation",
      "Liquid clustering vs partitioning algorithms",
      "Distributed consensus & transaction log serialization",
    ],
    keyChallenges: "Massive petabyte-scale multi-tenant execution planning with sub-second metadata operations.",
  },
  {
    id: "snowflake",
    name: "Snowflake",
    tier: "Tier 1 FAANG / BigTech",
    location: "Global / US / India",
    logo: "❄️",
    seniorDeSalary: "$230k - $340k (₹60L - ₹95L)",
    architectSalary: "$350k - $520k (₹1.1Cr - ₹1.9Cr)",
    stack: ["Apache Iceberg", "FoundationDB", "Polaris Catalog", "Snowpark Python", "C++", "AWS S3"],
    interviewFocus: [
      "Micro-partition pruning & clustering depths",
      "Virtual warehouse multi-cluster concurrency scaling",
      "Iceberg catalog metadata snapshot isolation",
      "Zero-copy data sharing architecture",
    ],
    keyChallenges: "Multi-cloud metadata synchronization and isolated vector index queries over Iceberg tables.",
  },
  {
    id: "microsoft",
    name: "Microsoft (Fabric & Azure Data)",
    tier: "Tier 1 FAANG / BigTech",
    location: "Redmond / Hyderabad / Bengaluru",
    logo: "🪟",
    seniorDeSalary: "$220k - $330k (₹55L - ₹90L)",
    architectSalary: "$340k - $500k (₹1.0Cr - ₹1.8Cr)",
    stack: ["Microsoft Fabric", "Direct Lake", "Azure Synapse", "OneLake", "C#", "T-SQL", "Delta Lake"],
    interviewFocus: [
      "Direct Lake VertiPaq memory mapping over OneLake Parquet",
      "Managed VNet Integration Runtimes & Private Endpoint peering",
      "ADF pipeline resilience & zero-loss CDC architectures",
      "Capacity unit (CU) throttling & smoothing algorithms",
    ],
    keyChallenges: "Direct Lake zero-ETL semantic model streaming for enterprise analytical workloads.",
  },
  {
    id: "jpmorgan",
    name: "JPMorgan Chase & Co.",
    tier: "Tier 1 Global FinTech",
    location: "New York / London / Bengaluru / Hyderabad",
    logo: "🏦",
    seniorDeSalary: "$210k - $300k (₹50L - ₹80L)",
    architectSalary: "$320k - $460k (₹90L - ₹1.6Cr)",
    stack: ["AWS EMR", "Databricks", "Kafka", "Apache Flink", "PostgreSQL", "Data Mesh", "Airflow"],
    interviewFocus: [
      "Data Mesh federated computational governance & data contracts (ODCS)",
      "Real-time sub-millisecond fraud detection stream processing",
      "Exactly-once Kafka transactional semantics & dead letter queues",
      "Strict GDPR / SOX regulatory isolation and row-level encryption",
    ],
    keyChallenges: "Pipelining hundreds of millions of trades daily with deterministic millisecond lineage audits.",
  },
  {
    id: "walmart",
    name: "Walmart Global Tech",
    tier: "Global Capability Center (GCC)",
    location: "Bentonville / Sunnyvale / Bengaluru / Chennai",
    logo: "🛒",
    seniorDeSalary: "$190k - $280k (₹45L - ₹75L)",
    architectSalary: "$290k - $420k (₹85L - ₹1.4Cr)",
    stack: ["GCP BigQuery", "Kafka", "PySpark", "Delta Lake", "Trino", "dbt", "Airflow"],
    interviewFocus: [
      "Supply chain multi-region data replication & inventory consistency",
      "Dynamic partition pruning across billion-row retail fact tables",
      "Trino MPP query acceleration over distributed object stores",
      "FinOps optimization: BigQuery slot reservations vs on-demand",
    ],
    keyChallenges: "Synchronizing global inventory and omni-channel purchase streams across 10,000+ retail stores.",
  },
  {
    id: "target",
    name: "Target Enterprise Tech",
    tier: "Global Capability Center (GCC)",
    location: "Minneapolis / Bengaluru",
    logo: "🎯",
    seniorDeSalary: "$180k - $270k (₹42L - ₹70L)",
    architectSalary: "$280k - $400k (₹80L - ₹1.3Cr)",
    stack: ["Apache Kafka", "Flink", "Databricks", "Google Cloud", "Delta Lake", "Airflow"],
    interviewFocus: [
      "Event-driven retail stream processing with stateful Flink jobs",
      "Medallion data quality contracts with Great Expectations",
      "Cost-effective serverless batch transformation pipelines",
    ],
    keyChallenges: "Automated real-time inventory restock alerting with strict streaming SLA watermarks.",
  },
];

export default function CompanyResearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");

  const filteredCompanies = useMemo(() => {
    return companyProfiles.filter((c) => {
      if (selectedTier !== "ALL" && c.tier !== selectedTier) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.stack.some((s) => s.toLowerCase().includes(q)) ||
          c.interviewFocus.some((f) => f.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [selectedTier, searchQuery]);

  return (
    <div className="space-y-8 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-6 sm:p-8 isolate">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400">
              <Building2 size={14} />
              <span>GCC &amp; Tech Intelligence Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Enterprise Company Research &amp; Salary Benchmarks
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Target hiring standards, verified tech stacks, architect interview rubrics, and salary benchmarks
              across BigTech, Global Capability Centers (GCCs), and Tier-1 FinTech institutions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-center">
            <div className="px-4 py-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="text-2xl font-bold text-cyan-400">40+</div>
              <div className="text-[11px] text-[var(--muted-foreground)] font-medium">Enterprise GCCs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Tier Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, tech stack (e.g. Databricks, Direct Lake, Flink)..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-purple-500/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]">
          {["ALL", "Tier 1 FAANG / BigTech", "Tier 1 Global FinTech", "Global Capability Center (GCC)"].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 whitespace-nowrap",
                selectedTier === tier
                  ? "bg-purple-600 text-white shadow-md font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              {tier === "ALL" ? "All Companies" : tier}
            </button>
          ))}
        </div>
      </div>

      {/* Company Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCompanies.map((company) => {
          return (
            <div
              key={company.id}
              className="p-6 rounded-3xl border transition-all duration-200 space-y-5 bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--border-hover)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{company.logo}</span>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--foreground)]">{company.name}</h3>
                    <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                      <Globe size={12} /> {company.location}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {company.tier}
                </span>
              </div>

              {/* Salary Bands */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                  <div className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">
                    Senior Data Engineer
                  </div>
                  <div className="font-bold text-green-400">{company.seniorDeSalary}</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                  <div className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">
                    Principal Architect
                  </div>
                  <div className="font-bold text-purple-400">{company.architectSalary}</div>
                </div>
              </div>

              {/* Tech Stack Chips */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase">
                  Production Tech Stack:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {company.stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded-lg bg-[var(--surface-3)] text-xs text-[var(--foreground)] border border-[var(--border)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interview Focus Topics */}
              <div className="space-y-2 pt-2 border-t border-[var(--border)] text-xs">
                <div className="text-[11px] font-bold text-[var(--foreground)] flex items-center gap-1.5">
                  <Sparkles size={13} className="text-purple-400" />
                  Key Architectural Interview Topics:
                </div>
                <ul className="space-y-1 text-[var(--muted-foreground)] pl-2">
                  {company.interviewFocus.map((focus, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{focus}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
