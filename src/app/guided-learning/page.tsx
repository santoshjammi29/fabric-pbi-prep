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
    <div className="space-y-8 pb-20">
      {/* Topic Selector Grid */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-6 sm:p-8 isolate">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400 mb-3">
            <GraduationCap size={14} />
            <span>Learning Journeys</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Guided Learning Paths
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            Select a topic to embark on a sequential journey from basic concepts to architectural patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {GUIDED_TOPICS.map((topic) => {
            const isActive = selectedTopic === topic.key;
            const counts = getTopicCounts(topic.key);
            return (
              <div
                key={topic.key}
                onClick={() => setSelectedTopic(topic.key)}
                className={cn(
                  "cursor-pointer p-4 rounded-2xl border transition-all duration-300 relative group",
                  isActive
                    ? "bg-[var(--surface-2)] border-purple-500 ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/10"
                    : "bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)]"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-gradient-to-br shadow-sm", topic.gradient)}>
                    {topic.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors">
                      {topic.label}
                    </h3>
                    <p className="text-[11px] text-[var(--muted-foreground)] mt-1 line-clamp-2">
                      {topic.description}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-3)] text-[var(--muted-foreground)] font-medium">
                    {counts.concepts} Concepts
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-3)] text-[var(--muted-foreground)] font-medium">
                    {counts.qa} Q&As
                  </span>
                  {counts.arch > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-3)] text-[var(--muted-foreground)] font-medium">
                      {counts.arch} Arch
                    </span>
                  )}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="py-20 text-center rounded-3xl bg-[var(--surface-1)] border border-[var(--border)] p-8"
          >
            <Layers size={48} className="mx-auto text-[var(--muted-foreground)] mb-4 opacity-30" />
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Select a Journey to Begin</h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-md mx-auto">
              Your guided learning path awaits. Choose any topic from the grid above to start mastering data engineering concepts, one step at a time.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={selectedTopic}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Stats strip */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br shadow-sm" style={{ background: 'var(--surface-2)' }}>
                  <div className={activeTopicObj?.gradient ? `text-transparent bg-clip-text bg-gradient-to-br ${activeTopicObj.gradient}` : ''}>
                    {activeTopicObj?.icon}
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)]">{activeTopicObj?.label} Journey</h2>
                  <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] mt-1">
                    <span>{totalItemsCount} items</span>
                    <span>•</span>
                    <span>~{Math.round(estTimeMins/60)}h {estTimeMins%60}m to complete</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
                <div className="flex justify-between w-full text-xs font-semibold">
                  <span className="text-purple-400">{pctComplete}%</span>
                  <span className="text-[var(--muted-foreground)]">{completedCount} / {totalItemsCount}</span>
                </div>
                <div className="h-2 w-full bg-[var(--surface-3)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all duration-500 ease-out"
                    style={{ width: `${pctComplete}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter journey items..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none focus:border-purple-500/50 transition-all"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]">
                {["ALL", "concept", "qa", "architecture"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 capitalize",
                      selectedType === type
                        ? "bg-[var(--surface-3)] text-[var(--foreground)] shadow-md font-semibold"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                    )}
                  >
                    {type === "ALL" ? "All Types" : type === "qa" ? "Q&As" : type}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)]">
                {["ALL", "EASY", "MEDIUM", "HARD", "ARCHITECT"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0",
                      selectedDifficulty === diff
                        ? "bg-purple-600 text-white shadow-md font-semibold"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                    )}
                  >
                    {diff === "ALL" ? "All Levels" : diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Stages */}
            <div className="space-y-6">
              {stages.map((stage) => {
                const items = itemsByStage[stage.id] || [];
                if (items.length === 0) return null;
                
                const pageNum = pages[stage.id] || 1;
                const visibleItems = items.slice(0, pageNum * pageSize);
                
                return (
                  <div key={stage.id} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                      <h3 className={cn("text-base font-bold", stage.color)}>
                        {stage.label}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-1 rounded-md bg-[var(--surface-2)] text-[var(--muted-foreground)]">
                        {items.length} items
                      </span>
                    </div>

                    <div className="space-y-3">
                      {visibleItems.map(item => {
                        const isCompleted = completedIds.has(item.id);
                        const isExpanded = expandedIds.has(item.id);
                        const diffStyle = difficultyColors[item.difficulty] || difficultyColors.MEDIUM;
                        const tStyle = typeColors[item.type] || typeColors.concept;

                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "rounded-2xl border transition-all duration-200 overflow-hidden",
                              isExpanded
                                ? "bg-[var(--surface-1)] border-purple-500/40 shadow-sm"
                                : "bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--border-hover)]",
                              isCompleted && !isExpanded && "opacity-60"
                            )}
                          >
                            <div className="p-4 flex items-start gap-4">
                              <button
                                onClick={(e) => toggleComplete(item.id, e)}
                                className={cn(
                                  "mt-1 shrink-0 transition-colors",
                                  isCompleted ? "text-purple-400" : "text-[var(--muted-foreground)] hover:text-purple-400"
                                )}
                              >
                                {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                              </button>

                              <div 
                                className="flex-1 cursor-pointer select-none"
                                onClick={() => toggleExpand(item.id)}
                              >
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", tStyle.bg, tStyle.text, tStyle.border)}>
                                    {item.sourceLabel}
                                  </span>
                                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", diffStyle.bg, diffStyle.text, diffStyle.border)}>
                                    {item.difficulty}
                                  </span>
                                  {item.niche && (
                                    <span className="text-[10px] font-medium text-[var(--muted-foreground)]">
                                      • {item.niche}
                                    </span>
                                  )}
                                </div>
                                
                                <h4 className={cn(
                                  "text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight leading-snug",
                                  isCompleted && !isExpanded && "line-through text-[var(--muted-foreground)]"
                                )}>
                                  {item.title}
                                </h4>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <a
                                  href={item.sourceHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-3)] transition-colors"
                                  title="View in Source"
                                >
                                  <ExternalLink size={16} />
                                </a>
                                <div 
                                  className="p-2 cursor-pointer flex items-center justify-center text-[var(--muted-foreground)]"
                                  onClick={() => toggleExpand(item.id)}
                                >
                                  <ChevronDown size={16} className={cn("transition-transform duration-300", isExpanded && "rotate-180 text-purple-400")} />
                                </div>
                              </div>
                            </div>

                            <SmoothAccordion isOpen={isExpanded} innerClassName="px-4 pb-4 pt-1 sm:px-14 space-y-3">
                              {item.type === 'concept' ? (
                                <div className="space-y-4">
                                  <p className="text-sm text-[var(--foreground)] leading-relaxed">
                                    {item.body}
                                  </p>
                                  {item.keyPoints && item.keyPoints.length > 0 && (
                                    <ul className="list-disc pl-5 text-sm text-[var(--muted-foreground)] space-y-1">
                                      {item.keyPoints.map((kp, i) => (
                                        <li key={i}>{kp}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm">
                                  <AnswerRenderer text={item.body} />
                                </div>
                              )}
                            </SmoothAccordion>
                          </div>
                        );
                      })}
                    </div>
                    
                    {visibleItems.length < items.length && (
                      <div className="text-center pt-2">
                        <button
                          onClick={() => setPages(p => ({ ...p, [stage.id]: pageNum + 1 }))}
                          className="px-4 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-semibold text-[var(--foreground)] transition-colors"
                        >
                          Load More ({items.length - visibleItems.length} left in Stage)
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
