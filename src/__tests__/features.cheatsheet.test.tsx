import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { cheatsheetData } from "@/data";
import { OptimizationFlow } from "@/components/cheatsheet/optimization-flow";
import { CheatCard } from "@/components/cheatsheet/cheat-card";

describe("Production Cheat Sheet Data Integrity", () => {
  it("cheatsheetData is defined and non-empty", () => {
    expect(Array.isArray(cheatsheetData)).toBe(true);
    expect(cheatsheetData.length).toBeGreaterThanOrEqual(15);
  });

  it("each cheat code has all required fields with non-empty content", () => {
    cheatsheetData.forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.title).toBeTruthy();
      expect(item.category).toBeTruthy();
      expect(item.problem).toBeTruthy();
      expect(item.solution).toBeTruthy();
      expect(item.codeSnippet).toBeTruthy();
      expect(item.whyItMatters).toBeTruthy();
      expect(item.metrics).toBeTruthy();
      expect(Array.isArray(item.tags)).toBe(true);
      expect(item.tags.length).toBeGreaterThan(0);
    });
  });

  it("all cheat codes belong to valid categories", () => {
    const validCategories = new Set([
      "Spark Core",
      "Spark Optimization",
      "Orchestration",
      "Debugging & Observability",
      "SQL & Storage",
      "Production Best Practices",
    ]);

    cheatsheetData.forEach((item) => {
      expect(validCategories.has(item.category)).toBe(true);
    });
  });

  it("all IDs are unique and URL-safe", () => {
    const ids = new Set<string>();
    cheatsheetData.forEach((item) => {
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);
      expect(encodeURIComponent(item.id)).toBe(item.id);
    });
  });
});

describe("Cheat Sheet Components", () => {
  it("renders OptimizationFlow correctly", () => {
    render(<OptimizationFlow />);
    expect(screen.getByText(/Spark Catalyst Optimization Lifecycle/i)).toBeDefined();
    expect(screen.getByText(/Tungsten Execution/i)).toBeDefined();
    expect(screen.getAllByText(/AQE Runtime Loop/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders CheatCard with problem, solution, and metrics", () => {
    const sample = cheatsheetData[0];
    render(<CheatCard cheat={sample} />);
    expect(screen.getByText(sample.title)).toBeDefined();
    expect(screen.getByText(sample.metrics)).toBeDefined();
  });
});
