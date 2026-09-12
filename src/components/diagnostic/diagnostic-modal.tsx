"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  ChevronRight,
  GraduationCap,
  Award,
  Zap,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";
import { ExperienceTier, EXPERIENCE_TIERS } from "@/types/progress";
import { useFocusTrap } from "@/hooks/use-focus-trap";

interface DiagnosticQuestion {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    topic: "Kimball Dimensional Modeling",
    question: "Which of the following best defines a 'Degenerate Dimension' in Star Schema design?",
    options: [
      "A dimension with rapidly changing attributes tracked via SCD Type 2",
      "A dimension key stored in the fact table without a corresponding dimension table (e.g., Order #, Invoice #)",
      "A dimension that shares a 1-to-many relationship with multiple bridge tables",
      "A deprecated dimension preserved solely for historical backward compatibility",
    ],
    correctIndex: 1,
    explanation:
      "Degenerate dimensions (like transaction numbers or invoice IDs) reside directly in the fact table without a separate dimension table, giving fact rows natural transactional granularity.",
  },
  {
    id: 2,
    topic: "Delta Lake Concurrency",
    question: "How does Delta Lake handle concurrent writes to the same table when two jobs attempt to commit simultaneously?",
    options: [
      "Pessimistic table-level write locks acquired via Zookeeper",
      "Optimistic Concurrency Control (OCC) validating that changed files do not conflict; retrying automatically if disjoint",
      "Last-Write-Wins based on executor wall-clock timestamps",
      "Two-Phase Commit (2PC) coordinated through the Spark Driver's memory",
    ],
    correctIndex: 1,
    explanation:
      "Delta Lake uses Optimistic Concurrency Control (OCC) backed by the JSON transaction log (_delta_log). Commits are validated atomically; non-conflicting partition/file writes succeed concurrently.",
  },
  {
    id: 3,
    topic: "Spark Catalyst & Memory",
    question: "What is the primary role of the Project Tungsten engine in Apache Spark?",
    options: [
      "Managing Kerberos encryption keys across YARN/K8s nodes",
      "Off-heap memory management with binary format encoders and whole-stage code generation to bypass JVM GC overhead",
      "Translating streaming micro-batches into RocksDB checkpoints",
      "Automating cross-cloud storage sync between S3, ADLS Gen2, and GCS",
    ],
    correctIndex: 1,
    explanation:
      "Project Tungsten replaces Java object overhead with compact off-heap binary memory representations and compiles execution subtrees into single bytecode functions using whole-stage code generation.",
  },
  {
    id: 4,
    topic: "Kafka Partitioning & Scaling",
    question: "In Apache Kafka, what is the impact if the number of consumer instances in a consumer group exceeds the number of partitions in the subscribed topic?",
    options: [
      "Partitions are automatically subdivided by the broker",
      "The extra consumer instances remain idle with zero assigned partitions until a consumer fails or rebalance occurs",
      "Messages are round-robin duplicated to the excess consumers",
      "The broker throws a PartitionAssignmentException and closes connections",
    ],
    correctIndex: 1,
    explanation:
      "Each partition in a topic can be consumed by at most one consumer instance within a single consumer group at any given time. Excess consumers sit idle as standby spares.",
  },
  {
    id: 5,
    topic: "Power BI Direct Lake Mode",
    question: "Under what specific condition will a Power BI Direct Lake semantic model fall back to DirectQuery mode?",
    options: [
      "Whenever the query uses standard DAX measures like SUM() or COUNTROWS()",
      "When the table requires row-level security (RLS) not supported in Direct Lake framing or memory limits are exceeded",
      "When the delta table uses V-Order compression",
      "Whenever parquet files in OneLake exceed 128 MB",
    ],
    correctIndex: 1,
    explanation:
      "Direct Lake directly reads Delta Parquet into the VertiPaq engine without importing. It falls back to DirectQuery when complex unsupported DAX/RLS rules or capacity memory thresholds are hit.",
  },
  {
    id: 6,
    topic: "Spark Skew & Join Optimization",
    question: "When dealing with severe data skew on a join key in Apache Spark, which strategy prevents executor OOM without modifying source data?",
    options: [
      "Salting the skewed key with random integers [0..N) and replicating the dimension rows N times, or enabling Adaptive Query Execution (AQE) skew join",
      "Setting spark.sql.shuffle.partitions=1 to consolidate partitions",
      "Disabling broadcast joins across the entire Spark session",
      "Converting all join keys to uppercase strings before grouping",
    ],
    correctIndex: 0,
    explanation:
      "Key salting breaks hot keys into sub-keys to distribute work across executors. Spark 3.x+ AQE also automatically detects skewed partitions at runtime and splits them into sub-partitions.",
  },
  {
    id: 7,
    topic: "Medallion Architecture Governance",
    question: "In a Bronze -> Silver -> Gold Medallion Lakehouse, which layer is responsible for Kimball star schemas and business aggregation aggregates?",
    options: [
      "Bronze Layer (Raw immutable ingestion)",
      "Silver Layer (Enriched, cleansed, deduplicated tables)",
      "Gold Layer (Consumable presentation-ready star schemas, marts, and feature stores)",
      "Landing Zone (Transitory raw files)",
    ],
    correctIndex: 2,
    explanation:
      "The Gold layer holds consumption-ready, business-aligned dimensional models, Kimball star schemas, and aggregated metrics optimized for Power BI and analytical queries.",
  },
  {
    id: 8,
    topic: "Data Contracts & Schema Evolution",
    question: "How does Protobuf/Avro Schema Registry enforce 'Backward Compatibility' on streaming pipelines?",
    options: [
      "Only permits deleting existing fields, never adding new fields",
      "Guarantees that consumers compiled with the new schema can successfully deserialize records produced with the previous schema version",
      "Forces all consumers to restart simultaneously during producer updates",
      "Blocks all optional fields from ever being declared",
    ],
    correctIndex: 1,
    explanation:
      "Backward compatibility means new schema code can read records written by old schemas, allowing consumers to be upgraded safely before producers.",
  },
  {
    id: 9,
    topic: "Fabric Capacity FinOps",
    question: "How does Microsoft Fabric's 'Smoothing' mechanism manage heavy, intermittent compute spikes?",
    options: [
      "Immediately throttles queries that exceed capacity for > 10 seconds",
      "Averages transient CU consumption over a 24-hour evaluation window for background jobs (and shorter for interactive), preventing unwarranted throttling",
      "Automatically bills credit cards for overage bursts at 10x rates",
      "Cancels downstream pipeline runs whenever usage hits 100% CU",
    ],
    correctIndex: 1,
    explanation:
      "Fabric Smoothing distributes burst capacity consumption across a 24-hour moving window for background tasks, allowing short spikes without immediate throttling.",
  },
  {
    id: 10,
    topic: "Vector Databases & AI RAG",
    question: "In high-scale Vector Search for RAG systems, what trade-off distinguishes HNSW from IVFFlat indexing?",
    options: [
      "HNSW provides sub-millisecond query recall at the cost of higher RAM consumption during graph traversal; IVFFlat has lower memory footprint but requires periodic re-clustering",
      "HNSW requires GPU hardware, while IVFFlat only runs on ARM CPUs",
      "IVFFlat produces exact deterministic cosine distance with zero approximation",
      "HNSW cannot handle vectors with more than 128 dimensions",
    ],
    correctIndex: 0,
    explanation:
      "Hierarchical Navigable Small World (HNSW) builds a multi-layer graph offering superior query speed and recall, but consumes significantly more RAM than inverted file (IVFFlat) indexes.",
  },
];

export function DiagnosticModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const setDiagnosticScore = useUserStore((s) => s.setDiagnosticScore);
  const setExperienceTier = useUserStore((s) => s.setExperienceTier);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(modalRef, isOpen, onClose);

  if (!isOpen) return null;

  const currentQ = DIAGNOSTIC_QUESTIONS[currentIndex];
  const hasSelected = selectedAnswers[currentIndex] !== undefined;

  const calculateScore = () => {
    let score = 0;
    DIAGNOSTIC_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const getRecommendedTier = (score: number): ExperienceTier => {
    if (score <= 3) return "beginner";
    if (score <= 6) return "associate";
    if (score <= 8) return "senior";
    return "staff_architect";
  };

  const handleSelectOption = (optIndex: number) => {
    if (selectedAnswers[currentIndex] !== undefined) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optIndex }));
  };

  const handleNext = () => {
    if (currentIndex < DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const finalScore = calculateScore();
      const tier = getRecommendedTier(finalScore);
      setDiagnosticScore(finalScore, tier);
      setExperienceTier(tier);
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsCompleted(false);
  };

  const finalScore = calculateScore();
  const recommendedTier = getRecommendedTier(finalScore);
  const tierConfig = EXPERIENCE_TIERS[recommendedTier];

  const handleLaunchPath = () => {
    onClose();
    router.push(tierConfig.startingPath.href);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Diagnostic Architecture Assessment"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-[#161618] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#161618]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <GraduationCap size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">
                Architect Diagnostic Assessment
              </h2>
              <p className="text-[11px] text-slate-400">
                10 Scenarios · Auto-placement into optimal career tier
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close assessment"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!isCompleted ? (
            <div className="space-y-6">
              {/* Progress Tracker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>
                    Question {currentIndex + 1} of {DIAGNOSTIC_QUESTIONS.length}
                  </span>
                  <span className="text-blue-400 font-semibold">{currentQ.topic}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                    style={{
                      width: `${((currentIndex + 1) / DIAGNOSTIC_QUESTIONS.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {currentQ.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentIndex] === optIdx;
                  const isAnswered = selectedAnswers[currentIndex] !== undefined;
                  const isCorrect = optIdx === currentQ.correctIndex;

                  let optionStyle =
                    "border-slate-800 bg-[#1C1C20] text-slate-200 hover:border-slate-700 hover:bg-[#222228]";
                  if (isAnswered) {
                    if (isCorrect) {
                      optionStyle = "border-emerald-500/50 bg-emerald-500/10 text-emerald-200";
                    } else if (isSelected) {
                      optionStyle = "border-red-500/50 bg-red-500/10 text-red-200";
                    } else {
                      optionStyle = "border-slate-800/40 bg-[#1C1C20]/40 text-slate-500";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(optIdx)}
                      className={cn(
                        "w-full text-left p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer",
                        optionStyle
                      )}
                    >
                      <span className="w-5 h-5 rounded-full border border-current/40 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-mono font-bold">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1 leading-relaxed">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Answer Explanation once chosen */}
              {hasSelected && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/[0.05] space-y-1.5 text-xs sm:text-sm text-slate-300"
                >
                  <div className="font-bold text-blue-400 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                    <Sparkles size={13} /> Engineering Insight:
                  </div>
                  <p className="leading-relaxed">{currentQ.explanation}</p>
                </motion.div>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/10">
                <Award size={32} />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
                  <CheckCircle2 size={13} /> Assessment Completed
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Diagnostic Score: {finalScore} / {DIAGNOSTIC_QUESTIONS.length}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  Based on your responses across distributed compute, storage concurrency, and FinOps, we have placed you in:
                </p>
              </div>

              {/* Assigned Tier Card */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-[#1C1C20] text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold border",
                      tierConfig.color.badge
                    )}
                  >
                    {tierConfig.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{tierConfig.role}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {tierConfig.description}
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Recommended Starting Module:</span>
                  <span className="font-semibold text-blue-400">{tierConfig.startingPath.title}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-[#161618]">
          {!isCompleted ? (
            <>
              <span className="text-xs text-slate-500 font-mono">
                {hasSelected ? "Click Continue to advance" : "Select an answer to reveal explanation"}
              </span>
              <button
                type="button"
                disabled={!hasSelected}
                onClick={handleNext}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all",
                  hasSelected
                    ? "bg-blue-600 hover:bg-blue-500 active:scale-95 text-white shadow-md shadow-blue-600/25 cursor-pointer"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                )}
              >
                <span>{currentIndex === DIAGNOSTIC_QUESTIONS.length - 1 ? "Finish Assessment" : "Continue"}</span>
                <ChevronRight size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Retake</span>
              </button>
              <button
                type="button"
                onClick={handleLaunchPath}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer"
              >
                <span>Launch Curriculum</span>
                <ArrowRight size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
