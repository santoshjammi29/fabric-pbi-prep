import { describe, it, expect } from "vitest";
import { getUnifiedQuestions } from "@/data";
import {
  TECH_ECOSYSTEMS,
  SCENARIO_ARCHETYPES,
  matchTechEcosystem,
  matchScenarioArchetype,
  matchDomain,
  questionHasCode,
  computeFilterCounts,
  getQuestionSearchCorpus,
  TechEcosystemId,
  ScenarioArchetypeId,
} from "@/lib/qa-filters";
import { UnifiedQuestion } from "@/types/data";

describe("QA Prep Meaningful Filters", () => {
  const unified = getUnifiedQuestions();

  describe("TECH_ECOSYSTEMS definitions & integrity", () => {
    it("defines 11 tech ecosystems with unique IDs", () => {
      expect(TECH_ECOSYSTEMS.length).toBe(11);
      const ids = TECH_ECOSYSTEMS.map((e) => e.id);
      expect(new Set(ids).size).toBe(11);
      expect(ids).toContain("ALL");
      expect(ids).toContain("FABRIC");
      expect(ids).toContain("DATABRICKS");
      expect(ids).toContain("SPARK");
      expect(ids).toContain("DELTA_ICEBERG");
      expect(ids).toContain("AIRFLOW_ADF");
      expect(ids).toContain("DBT_MODELING");
      expect(ids).toContain("STREAMING_CDC");
      expect(ids).toContain("SQL_DATABASES");
      expect(ids).toContain("GOVERNANCE");
      expect(ids).toContain("AI_RAG");
    });

    it("every tech ecosystem has non-empty label and description", () => {
      for (const eco of TECH_ECOSYSTEMS) {
        expect(eco.label.length).toBeGreaterThan(0);
        expect(eco.shortLabel.length).toBeGreaterThan(0);
        expect(eco.description.length).toBeGreaterThan(0);
        expect(eco.badgeColor.length).toBeGreaterThan(0);
      }
    });

    it("ALL matches any question", () => {
      const sample = unified[0];
      expect(matchTechEcosystem(sample, "ALL")).toBe(true);
    });
  });

  describe("SCENARIO_ARCHETYPES definitions & integrity", () => {
    it("defines 10 scenario archetypes with unique IDs", () => {
      expect(SCENARIO_ARCHETYPES.length).toBe(10);
      const ids = SCENARIO_ARCHETYPES.map((a) => a.id);
      expect(new Set(ids).size).toBe(10);
      expect(ids).toContain("ALL");
      expect(ids).toContain("OOM_SPILL");
      expect(ids).toContain("SKEW_JOINS");
      expect(ids).toContain("ACID_COMPACTION");
      expect(ids).toContain("CDC_STREAMING");
      expect(ids).toContain("FINOPS_COST");
      expect(ids).toContain("SYSTEM_DESIGN");
      expect(ids).toContain("MODELING_SCHEMAS");
      expect(ids).toContain("CODE_ONLY");
      expect(ids).toContain("BOOKMARKED");
    });

    it("every scenario archetype has an emoji and description", () => {
      for (const arc of SCENARIO_ARCHETYPES) {
        expect(arc.label.length).toBeGreaterThan(0);
        expect(arc.emoji.length).toBeGreaterThan(0);
        expect(arc.description.length).toBeGreaterThan(0);
      }
    });

    it("ALL matches any question", () => {
      const sample = unified[0];
      expect(matchScenarioArchetype(sample, "ALL")).toBe(true);
    });
  });

  describe("Code and Bookmark Matchers", () => {
    it("identifies code when q.code exists", () => {
      const dummy: UnifiedQuestion = {
        id: "test-1",
        question: "How to use PySpark filter?",
        answer: "Use df.filter()",
        difficulty: "MEDIUM",
        category: "PySpark",
        sourceDb: "pyspark",
        sourceLabel: "PySpark Coding",
        code: "df.filter(df['age'] > 30)",
      };
      expect(questionHasCode(dummy)).toBe(true);
      expect(matchScenarioArchetype(dummy, "CODE_ONLY")).toBe(true);
    });

    it("identifies code when q.answer contains markdown code block", () => {
      const dummy: UnifiedQuestion = {
        id: "test-2",
        question: "Explain Delta Lake merge",
        answer: "Here is the SQL:\n```sql\nMERGE INTO target USING source ...\n```",
        difficulty: "HARD",
        category: "Delta Lake",
        sourceDb: "general",
        sourceLabel: "General DE",
      };
      expect(questionHasCode(dummy)).toBe(true);
      expect(matchScenarioArchetype(dummy, "CODE_ONLY")).toBe(true);
    });

    it("matches bookmarks accurately", () => {
      const dummy: UnifiedQuestion = {
        id: "bookmarked-123",
        question: "Sample Question",
        answer: "Sample Answer",
        difficulty: "ARCHITECT",
        category: "System Design",
        sourceDb: "general",
        sourceLabel: "General DE",
      };
      expect(matchScenarioArchetype(dummy, "BOOKMARKED", undefined, ["bookmarked-123"])).toBe(true);
      expect(matchScenarioArchetype(dummy, "BOOKMARKED", undefined, ["other-id"])).toBe(false);
    });
  });

  describe("Real Dataset Filtering & Categorization", () => {
    it("populates every tech ecosystem with hundreds of questions", () => {
      const { techCounts } = computeFilterCounts(unified);
      expect(techCounts.ALL).toBe(unified.length);
      expect(techCounts.FABRIC).toBeGreaterThan(250);
      expect(techCounts.DATABRICKS).toBeGreaterThan(500);
      expect(techCounts.SPARK).toBeGreaterThan(500);
      expect(techCounts.DELTA_ICEBERG).toBeGreaterThan(300);
      expect(techCounts.AIRFLOW_ADF).toBeGreaterThan(500);
      expect(techCounts.DBT_MODELING).toBeGreaterThan(200);
      expect(techCounts.STREAMING_CDC).toBeGreaterThan(300);
      expect(techCounts.SQL_DATABASES).toBeGreaterThan(800);
      expect(techCounts.GOVERNANCE).toBeGreaterThan(400);
      expect(techCounts.AI_RAG).toBeGreaterThan(500);
    });

    it("populates every scenario archetype with targeted questions", () => {
      const { archetypeCounts } = computeFilterCounts(unified, ["sample-id"]);
      expect(archetypeCounts.ALL).toBe(unified.length);
      expect(archetypeCounts.OOM_SPILL).toBeGreaterThan(150);
      expect(archetypeCounts.SKEW_JOINS).toBeGreaterThan(80);
      expect(archetypeCounts.ACID_COMPACTION).toBeGreaterThan(200);
      expect(archetypeCounts.CDC_STREAMING).toBeGreaterThan(250);
      expect(archetypeCounts.FINOPS_COST).toBeGreaterThan(100);
      expect(archetypeCounts.SYSTEM_DESIGN).toBeGreaterThan(100);
      expect(archetypeCounts.MODELING_SCHEMAS).toBeGreaterThan(50);
      expect(archetypeCounts.CODE_ONLY).toBeGreaterThan(1000);
    });

    it("correctly filters multi-dimensional intersection: Databricks + OOM", () => {
      const intersection = unified.filter((q) => {
        const text = getQuestionSearchCorpus(q);
        return (
          matchTechEcosystem(q, "DATABRICKS", text) &&
          matchScenarioArchetype(q, "OOM_SPILL", text)
        );
      });
      expect(intersection.length).toBeGreaterThan(100);
      expect(intersection.every((q) => {
        const t = getQuestionSearchCorpus(q);
        return matchTechEcosystem(q, "DATABRICKS", t) && matchScenarioArchetype(q, "OOM_SPILL", t);
      })).toBe(true);
    });

    it("domain matching operates correctly with standardized domains", () => {
      const sample = unified.find((q) => (q.domain || "").includes("Compute"));
      if (sample) {
        expect(matchDomain(sample, "Compute & Orchestration")).toBe(true);
        expect(matchDomain(sample, "ALL")).toBe(true);
      }
    });
  });
});
