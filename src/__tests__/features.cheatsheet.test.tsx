import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { cheatsheetData } from "@/data";
import { OptimizationFlow } from "@/components/cheatsheet/optimization-flow";
import { CheatCard } from "@/components/cheatsheet/cheat-card";
import { QuickJumpTOC } from "@/components/cheatsheet/quick-jump-toc";

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

  it("QuickJumpTOC is minimized by default and expands/minimizes manually", () => {
    const mockCategories = [
      { category: "Spark Core" as const, count: 8 },
      { category: "Spark Optimization" as const, count: 11 },
    ];

    const { rerender } = render(
      <QuickJumpTOC
        categories={mockCategories}
        activeCategory="ALL"
        onSelectCategory={() => {}}
      />
    );

    // Should be minimized by default
    const expandBtn = screen.getByLabelText("Expand Quick Jump Index");
    expect(expandBtn).toBeDefined();
    expect(screen.queryByText("All Cheat Codes")).toBeNull();

    // Click to expand
    fireEvent.click(expandBtn);
    expect(screen.getByText("All Cheat Codes")).toBeDefined();
    expect(screen.getByText("Incident Triage")).toBeDefined();

    // Click minimize button
    const minimizeBtn = screen.getByLabelText("Minimize Quick Jump Index");
    fireEvent.click(minimizeBtn);
    expect(screen.queryByText("All Cheat Codes")).toBeNull();
    expect(screen.getByLabelText("Expand Quick Jump Index")).toBeDefined();

    // Can also accept defaultMinimized={false}
    const { unmount } = render(
      <QuickJumpTOC
        categories={mockCategories}
        activeCategory="ALL"
        onSelectCategory={() => {}}
        defaultMinimized={false}
      />
    );
    expect(screen.getAllByText("All Cheat Codes").length).toBeGreaterThan(0);
    unmount();
  });
});
