"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ExternalLink, CheckCircle2, Circle, GraduationCap, LayoutList, Layers, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getTopicItems, getTopicCounts, LearningItem } from "@/lib/guided-learning";
import { GUIDED_TOPICS, GuidedTopic } from "@/data/guided-learning-topics";
import { AnswerRenderer } from "@/components/ui/answer-renderer";
import { SmoothAccordion } from "@/components/ui/smooth-accordion";
import { Difficulty } from "@/types/data";

const difficultyColors: Record<string, { bg: string; text: string; border: string }> = {
  EASY: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  MEDIUM: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  HARD: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  ARCHITECT: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
};

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  concept: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  qa: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  architecture: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
};

const stages = [
  { id: 'EASY', label: 'Stage 1: Foundations', color: 'text-green-400' },
  { id: 'MEDIUM', label: 'Stage 2: Core Skills', color: 'text-blue-400' },
  { id: 'HARD', label: 'Stage 3: Advanced Patterns', color: 'text-orange-400' },
  { id: 'ARCHITECT', label: 'Stage 4: Expert / Architect', color: 'text-purple-400' },
];

export default function GuidedLearningPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [pages, setPages] = useState<Record<string, number>>({});
  
  const pageSize = 15;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const topicParam = params.get("topic");
    if (topicParam && GUIDED_TOPICS.some(t => t.key === topicParam)) {
      setSelectedTopic(topicParam);
    }
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      window.history.replaceState(null, '', `?topic=${selectedTopic}`);
      // Load completed from localStorage
      try {
        const saved = localStorage.getItem(`gl-completed-${selectedTopic}`);
        if (saved) {
          setCompletedIds(new Set(JSON.parse(saved)));
        } else {
          setCompletedIds(new Set());
        }
      } catch {
        setCompletedIds(new Set());
      }
      setPages({});
      setSearchQuery("");
      setSelectedType("ALL");
      setSelectedDifficulty("ALL");
      setExpandedIds(new Set());
    } else {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [selectedTopic]);

  const toggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedTopic) return;
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info("Marked as incomplete");
      } else {
        next.add(id);
        toast.success("Completed!");
      }
      localStorage.setItem(`gl-completed-${selectedTopic}`, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeTopicObj = GUIDED_TOPICS.find(t => t.key === selectedTopic);
  const rawItems = useMemo(() => selectedTopic ? getTopicItems(selectedTopic) : [], [selectedTopic]);

  const filteredItems = useMemo(() => {
    return rawItems.filter(item => {
      if (selectedType !== "ALL" && item.type !== selectedType) return false;
      if (selectedDifficulty !== "ALL" && item.difficulty !== selectedDifficulty) return false;
      if (searchQuery.trim()) {
        const term = searchQuery.toLowerCase();
        return item.title.toLowerCase().includes(term);
      }
      return true;
    });
  }, [rawItems, selectedType, selectedDifficulty, searchQuery]);

  const itemsByStage = useMemo(() => {
    const grouped: Record<string, LearningItem[]> = {
      EASY: [], MEDIUM: [], HARD: [], ARCHITECT: []
    };
    filteredItems.forEach(item => {
      if (grouped[item.difficulty]) {
        grouped[item.difficulty].push(item);
      }
    });
    return grouped;
  }, [filteredItems]);

  const totalItemsCount = rawItems.length;
  const completedCount = completedIds.size;
  const pctComplete = totalItemsCount > 0 ? Math.round((completedCount / totalItemsCount) * 100) : 0;
  const estTimeMins = totalItemsCount * 2;

  return (
    <div className="space-y-6 pb-20">
      {/* Topic Selector Grid */}
      <div className="relative overflow-hidden rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] p-4 sm:p-6 isolate">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-semibold text-purple-400 mb-2">
              <GraduationCap size={12} />
              <span className="uppercase tracking-wider">Learning Journeys</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
              Guided Learning Paths
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {GUIDED_TOPICS.map((topic) => {
            const isActive = selectedTopic === topic.key;
            const counts = getTopicCounts(topic.key);
            const totalItems = counts.concepts + counts.qa + counts.arch;
            return (
              <div
                key={topic.key}
                onClick={() => setSelectedTopic(topic.key)}
                title={topic.description}
                className={cn(
                  "cursor-pointer p-2.5 rounded-xl border transition-all duration-150 relative group flex items-center gap-3",
                  isActive
                    ? "bg-[var(--surface-2)] border-purple-500 ring-1 ring-purple-500/30 shadow-sm"
                    : "bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)]"
                )}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 bg-gradient-to-br shadow-sm", topic.gradient)}>
                  {topic.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors truncate">
                    {topic.label}
                  </h3>
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5 truncate">
                    {totalItems} items
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedTopic ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="py-12 text-center rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] p-6"
          >
            <Layers size={32} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-30" />
            <h3 className="text-base font-semibold text-[var(--foreground)]">Select a Journey to Begin</h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-2 max-w-sm mx-auto">
              Choose any topic from the grid above to start mastering data engineering concepts.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={selectedTopic}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Stats strip */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-xs">
              <div className="text-[var(--muted-foreground)]">
                {totalItemsCount} items · {getTopicCounts(selectedTopic).concepts} concepts · {getTopicCounts(selectedTopic).qa} Q&As · {getTopicCounts(selectedTopic).arch} architecture · Est. {Math.round(estTimeMins/60)}h {estTimeMins%60}m
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-semibold">{pctComplete}%</span>
                  <div className="h-1 w-24 bg-[var(--surface-3)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-150 ease-out"
                      style={{ width: `${pctComplete}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-auto sm:flex-1">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter journey items..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-purple-500/50 transition-all duration-150"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none w-full sm:w-auto">
                {["ALL", "concept", "qa", "architecture"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-medium transition-all duration-150 shrink-0 capitalize",
                      selectedType === type
                        ? "bg-[var(--surface-3)] text-[var(--foreground)] shadow-sm font-semibold"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                    )}
                  >
                    {type === "ALL" ? "All Types" : type === "qa" ? "Q&As" : type}
                  </button>
                ))}
              </div>

              <div className="hidden sm:block w-px h-4 bg-[var(--border)] mx-1" />

              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none w-full sm:w-auto">
                {["ALL", "EASY", "MEDIUM", "HARD", "ARCHITECT"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-medium transition-all duration-150 shrink-0",
                      selectedDifficulty === diff
                        ? "bg-purple-600 text-white shadow-sm font-semibold"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                    )}
                  >
                    {diff === "ALL" ? "All Levels" : diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Stages */}
            <div className="space-y-4">
              {stages.map((stage) => {
                const items = itemsByStage[stage.id] || [];
                if (items.length === 0) return null;
                
                const pageNum = pages[stage.id] || 1;
                const visibleItems = items.slice(0, pageNum * pageSize);
                
                return (
                  <div key={stage.id} className="space-y-2">
                    <div className="flex items-center gap-3 border-b border-[var(--border)] pb-1.5">
                      <h3 className={cn("text-sm font-bold", stage.color)}>
                        {stage.label}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted-foreground)]">
                        {items.length} items
                      </span>
                    </div>

                    <div className="space-y-1">
                      {visibleItems.map(item => {
                        const isCompleted = completedIds.has(item.id);
                        const isExpanded = expandedIds.has(item.id);
                        const diffStyle = difficultyColors[item.difficulty] || difficultyColors.MEDIUM;
                        const tStyle = typeColors[item.type] || typeColors.concept;

                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "rounded-lg border transition-all duration-150 overflow-hidden",
                              isExpanded
                                ? "bg-[var(--surface-1)] border-purple-500/40 shadow-sm"
                                : "bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--border-hover)]",
                              isCompleted && !isExpanded && "opacity-60"
                            )}
                          >
                            <div 
                              className="py-1.5 px-3 flex items-center gap-3 cursor-pointer select-none"
                              onClick={() => toggleExpand(item.id)}
                            >
                              <button
                                onClick={(e) => toggleComplete(item.id, e)}
                                className={cn(
                                  "shrink-0 transition-colors",
                                  isCompleted ? "text-purple-400" : "text-[var(--muted-foreground)] hover:text-purple-400"
                                )}
                              >
                                {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                              </button>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-sm border uppercase", tStyle.bg, tStyle.text, tStyle.border)}>
                                  {item.sourceLabel || item.type}
                                </span>
                                <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-sm border uppercase", diffStyle.bg, diffStyle.text, diffStyle.border)}>
                                  {item.difficulty}
                                </span>
                              </div>
                                
                              <h4 className={cn(
                                "text-xs font-semibold text-[var(--foreground)] truncate flex-1",
                                isCompleted && !isExpanded && "line-through text-[var(--muted-foreground)]"
                              )}>
                                {item.title}
                                {item.niche && (
                                  <span className="text-[10px] font-normal text-[var(--muted-foreground)] ml-2 hidden sm:inline">
                                    • {item.niche}
                                  </span>
                                )}
                              </h4>

                              <div className="flex items-center gap-1 shrink-0">
                                <a
                                  href={item.sourceHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors"
                                  title="View in Source"
                                >
                                  <ExternalLink size={14} />
                                </a>
                                <div className="p-1 flex items-center justify-center text-[var(--muted-foreground)]">
                                  <ChevronDown size={14} className={cn("transition-transform duration-150", isExpanded && "rotate-180 text-purple-400")} />
                                </div>
                              </div>
                            </div>

                            <SmoothAccordion isOpen={isExpanded} innerClassName="px-10 pb-3 pt-1 space-y-2">
                              {item.type === 'concept' ? (
                                <div className="space-y-3">
                                  <p className="text-xs text-[var(--foreground)] leading-relaxed">
                                    {item.body}
                                  </p>
                                  {item.keyPoints && item.keyPoints.length > 0 && (
                                    <ul className="list-disc pl-4 text-xs text-[var(--muted-foreground)] space-y-1">
                                      {item.keyPoints.map((kp, i) => (
                                        <li key={i}>{kp}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ) : (
                                <div className="text-xs">
                                  <AnswerRenderer text={item.body} />
                                </div>
                              )}
                            </SmoothAccordion>
                          </div>
                        );
                      })}
                    </div>
                    
                    {visibleItems.length < items.length && (
                      <div className="text-center pt-1">
                        <button
                          onClick={() => setPages(p => ({ ...p, [stage.id]: pageNum + 1 }))}
                          className="px-3 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[10px] font-semibold text-[var(--foreground)] transition-colors"
                        >
                          Load More ({items.length - visibleItems.length} left)
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
