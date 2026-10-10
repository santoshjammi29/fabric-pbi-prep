import { describe, it, expect } from "vitest";
import {
  conceptsDb,
  questionsDb,
  pythonData,
  getStandardizedDomain,
} from "@/data";
import { GUIDED_TOPICS } from "@/data/guided-learning-topics";
import {
  getTopicItems,
  getTopicCounts,
  getTopicSummaryStats,
} from "@/lib/guided-learning";

describe("Python Integration Across Platform (Guided Learning, Concepts, Q&A, and Code)", () => {
  describe("1. Guided Learning Track Integration", () => {
    it("defines a dedicated Python for Data Engineering track in GUIDED_TOPICS", () => {
      const pythonTopic = GUIDED_TOPICS.find((t) => t.key === "python");
      expect(pythonTopic).toBeDefined();
      expect(pythonTopic?.label).toBe("Python for Data Engineering");
      expect(pythonTopic?.domain).toBe("Distributed Compute");
      expect(pythonTopic?.conceptCategories).toContain("PYTHON");
      expect(pythonTopic?.questionCategories).toContain("PYTHON DATA ENGINEERING");
      expect(pythonTopic?.archKeywords).toContain("PYTHON");
      expect(pythonTopic?.stages).toBeDefined();
      expect(pythonTopic?.stages.foundations).toBeDefined();
      expect(pythonTopic?.stages.core).toBeDefined();
      expect(pythonTopic?.stages.advanced).toBeDefined();
      expect(pythonTopic?.stages.architect).toBeDefined();
    });

    it("aggregates concepts, Q&As, and architecture scenarios for python track", () => {
      const items = getTopicItems("python");
      expect(items.length).toBeGreaterThanOrEqual(50);

      const concepts = items.filter((i) => i.type === "concept");
      const qas = items.filter((i) => i.type === "qa");
      const archs = items.filter((i) => i.type === "architecture");

      expect(concepts.length).toBeGreaterThanOrEqual(16);
      expect(qas.length).toBeGreaterThanOrEqual(20);
      expect(archs.length).toBeGreaterThanOrEqual(10);
    });

    it("calculates accurate summary stats across all 4 difficulty levels for python", () => {
      const stats = getTopicSummaryStats("python");
      expect(stats.total).toBeGreaterThanOrEqual(50);
      expect(stats.concepts).toBeGreaterThanOrEqual(16);
      expect(stats.qa).toBeGreaterThanOrEqual(20);
      expect(stats.arch).toBeGreaterThanOrEqual(10);

      expect(stats.easy).toBeGreaterThan(0);
      expect(stats.medium).toBeGreaterThan(0);
      expect(stats.hard).toBeGreaterThan(0);
      expect(stats.architect).toBeGreaterThan(0);
      expect(stats.easy + stats.medium + stats.hard + stats.architect).toBe(stats.total);
    });

    it("returns correct topic counts matching items count", () => {
      const counts = getTopicCounts("python");
      const items = getTopicItems("python");
      expect(counts.total).toBe(items.length);
      expect(counts.concepts).toBeGreaterThanOrEqual(16);
    });
  });

  describe("2. Key Concepts Hub Integration", () => {
    it("contains category PYTHON in conceptsDb with full 4-tier difficulty representation", () => {
      const pythonConcepts = conceptsDb.filter((c) => c.category === "PYTHON");
      expect(pythonConcepts.length).toBeGreaterThanOrEqual(16);

      const easy = pythonConcepts.filter((c) => c.difficulty === "EASY");
      const medium = pythonConcepts.filter((c) => c.difficulty === "MEDIUM");
      const hard = pythonConcepts.filter((c) => c.difficulty === "HARD");
      const architect = pythonConcepts.filter((c) => c.difficulty === "ARCHITECT");

      expect(easy.length).toBeGreaterThanOrEqual(1);
      expect(medium.length).toBeGreaterThanOrEqual(1);
      expect(hard.length).toBeGreaterThanOrEqual(1);
      expect(architect.length).toBeGreaterThanOrEqual(1);
    });

    it("every Python concept has required fields: id, term, definition, explanation, keyPoints", () => {
      const pythonConcepts = conceptsDb.filter((c) => c.category === "PYTHON");
      pythonConcepts.forEach((c) => {
        expect(c.id).toMatch(/^py-concept-/);
        expect(c.term.length).toBeGreaterThan(0);
        expect(c.definition.length).toBeGreaterThan(0);
        expect(c.explanation.length).toBeGreaterThan(0);
        expect(Array.isArray(c.keyPoints)).toBe(true);
        expect(c.keyPoints.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe("3. Q&A Prep Hub Integration", () => {
    it("contains Python Data Engineering questions with all 4 difficulty levels", () => {
      const pythonQas = questionsDb.filter(
        (q) => (q.category || "").toUpperCase().includes("PYTHON")
      );
      expect(pythonQas.length).toBeGreaterThanOrEqual(25);

      const difficulties = new Set(pythonQas.map((q) => q.difficulty));
      expect(difficulties.has("EASY")).toBe(true);
      expect(difficulties.has("MEDIUM")).toBe(true);
      expect(difficulties.has("HARD")).toBe(true);
      expect(difficulties.has("ARCHITECT")).toBe(true);
    });

    it("maps Python items to Compute & Orchestration standardized domain", () => {
      expect(getStandardizedDomain({ category: "PYTHON" })).toBe("Compute & Orchestration");
      expect(getStandardizedDomain({ category: "PYTHON DATA ENGINEERING" })).toBe("Compute & Orchestration");
      expect(getStandardizedDomain({ sourceDb: "python" })).toBe("Compute & Orchestration");
    });
  });

  describe("4. Code Practice Integration", () => {
    it("pythonData provides complete runbooks covering multiple execution levels", () => {
      expect(pythonData.length).toBeGreaterThanOrEqual(30);

      const levels = new Set(pythonData.map((p) => p.level));
      expect(levels.has("beginner")).toBe(true);
      expect(levels.has("intermediate")).toBe(true);
      expect(levels.has("advanced")).toBe(true);
      expect(levels.has("architect")).toBe(true);
    });
  });
});
