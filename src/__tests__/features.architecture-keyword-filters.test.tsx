import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KeywordFilterBar, ARCH_KEYWORDS, KEYWORD_GROUPS } from "@/components/architecture/keyword-filter-bar";

describe("Architecture Scenario Keyword Filters (36 Curated Focus Areas)", () => {
  it("has at least 30 verified architectural keywords across 6 domain groups", () => {
    expect(ARCH_KEYWORDS.length).toBeGreaterThanOrEqual(30);
    expect(ARCH_KEYWORDS.length).toBe(36);

    const groups = new Set(ARCH_KEYWORDS.map((k) => k.group));
    expect(groups.size).toBe(6);
    expect(groups).toContain("Storage");
    expect(groups).toContain("Compute");
    expect(groups).toContain("Streaming");
    expect(groups).toContain("Governance");
    expect(groups).toContain("Pipelines");
    expect(groups).toContain("AI & Vector");
  });

  it("renders KeywordFilterBar with group pills and keyword chips", () => {
    const handleSelectKeyword = vi.fn();
    const handleSelectGroup = vi.fn();

    render(
      <KeywordFilterBar
        selectedKeyword="ALL"
        onSelectKeyword={handleSelectKeyword}
        selectedGroup="ALL"
        onSelectGroup={handleSelectGroup}
      />
    );

    // Title and badge
    expect(screen.getByText("Scenario Keywords & Architecture Focus Areas")).toBeDefined();
    expect(screen.getByText("36 Curated Filters")).toBeDefined();

    // Group pills
    expect(screen.getByText("All Keywords")).toBeDefined();
    expect(screen.getByText("Storage & Formats")).toBeDefined();
    expect(screen.getByText("Compute & Engines")).toBeDefined();
    expect(screen.getByText("Streaming & CDC")).toBeDefined();
    expect(screen.getByText("Governance & Catalogs")).toBeDefined();
    expect(screen.getByText("Pipelines & DataOps")).toBeDefined();
    expect(screen.getByText("AI, RAG & Vector")).toBeDefined();

    // Key chips present
    expect(screen.getByText("Delta Lake")).toBeDefined();
    expect(screen.getByText("Apache Iceberg")).toBeDefined();
    expect(screen.getByText("Liquid Clustering")).toBeDefined();
    expect(screen.getByText("Unity Catalog")).toBeDefined();
    expect(screen.getByText("Catalyst Optimizer")).toBeDefined();
    expect(screen.getByText("RAG & Vector Search")).toBeDefined();
  });

  it("triggers onSelectKeyword when a keyword chip is clicked", () => {
    const handleSelectKeyword = vi.fn();
    const handleSelectGroup = vi.fn();

    render(
      <KeywordFilterBar
        selectedKeyword="ALL"
        onSelectKeyword={handleSelectKeyword}
        selectedGroup="ALL"
        onSelectGroup={handleSelectGroup}
      />
    );

    const liquidChip = screen.getByText("Liquid Clustering");
    fireEvent.click(liquidChip);
    expect(handleSelectKeyword).toHaveBeenCalledWith("liquid-clustering");
  });

  it("displays active keyword banner and allows clearing when a keyword is active", () => {
    const handleSelectKeyword = vi.fn();
    const handleSelectGroup = vi.fn();

    render(
      <KeywordFilterBar
        selectedKeyword="liquid-clustering"
        onSelectKeyword={handleSelectKeyword}
        selectedGroup="ALL"
        onSelectGroup={handleSelectGroup}
      />
    );

    expect(screen.getByText("Filtering by Keyword:")).toBeDefined();
    const clearBtn = screen.getByText("Clear keyword filter");
    fireEvent.click(clearBtn);
    expect(handleSelectKeyword).toHaveBeenCalledWith("ALL");
  });

  it("filters keyword chips by group when group tab is switched", () => {
    const handleSelectKeyword = vi.fn();
    const handleSelectGroup = vi.fn();

    const { rerender } = render(
      <KeywordFilterBar
        selectedKeyword="ALL"
        onSelectKeyword={handleSelectKeyword}
        selectedGroup="Storage"
        onSelectGroup={handleSelectGroup}
      />
    );

    // Only storage keywords should be displayed
    expect(screen.getByText("Delta Lake")).toBeDefined();
    expect(screen.getByText("Apache Iceberg")).toBeDefined();
    expect(screen.getByText("Liquid Clustering")).toBeDefined();
    expect(screen.queryByText("Catalyst Optimizer")).toBeNull();
    expect(screen.queryByText("RAG & Vector Search")).toBeNull();

    // Switch to Compute
    rerender(
      <KeywordFilterBar
        selectedKeyword="ALL"
        onSelectKeyword={handleSelectKeyword}
        selectedGroup="Compute"
        onSelectGroup={handleSelectGroup}
      />
    );

    expect(screen.getByText("Catalyst Optimizer")).toBeDefined();
    expect(screen.getByText("Photon Engine")).toBeDefined();
    expect(screen.queryByText("Delta Lake")).toBeNull();
  });
});
