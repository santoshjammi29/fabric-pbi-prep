import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  UnifiedSearchFilterBox,
  FilterLevel,
} from "@/components/ui/unified-search-filter-box";

describe("UnifiedSearchFilterBox component", () => {
  const mockLevels: FilterLevel[] = [
    {
      id: "tech",
      title: "Level 1: Technology Ecosystem",
      shortTitle: "Tech",
      selectedId: "ALL",
      onSelect: vi.fn(),
      layout: "chips",
      options: [
        { id: "ALL", label: "All Tech", count: 100 },
        { id: "FABRIC", label: "Fabric & OneLake", count: 40 },
        { id: "SPARK", label: "Spark & PySpark", count: 60 },
      ],
    },
    {
      id: "archetype",
      title: "Level 2: Scenario Archetypes",
      shortTitle: "Archetypes",
      selectedId: "ALL",
      onSelect: vi.fn(),
      layout: "grid",
      options: [
        { id: "ALL", label: "All Scenarios", emoji: "🎯", count: 100 },
        { id: "OOM_SPILL", label: "OOM & Memory Spill", emoji: "💥", count: 35 },
        { id: "SKEW_JOINS", label: "Data Skew & Joins", emoji: "⚖️", count: 25 },
      ],
    },
    {
      id: "difficulty",
      title: "Level 3: Difficulty Calibration",
      shortTitle: "Difficulty",
      selectedId: "ALL",
      onSelect: vi.fn(),
      layout: "segmented",
      options: [
        { id: "ALL", label: "ALL" },
        { id: "EASY", label: "EASY" },
        { id: "HARD", label: "HARD" },
      ],
    },
  ];

  it("renders search input with accessibility attributes and result counts", () => {
    render(
      <UnifiedSearchFilterBox
        searchQuery=""
        onSearchChange={vi.fn()}
        searchPlaceholder="Search 6,500+ questions..."
        matchCount={45}
        totalCount={100}
        countUnit="Qs"
        levels={mockLevels}
      />
    );

    const input = screen.getByPlaceholderText("Search 6,500+ questions...");
    expect(input).toBeDefined();

    expect(screen.getByText("45")).toBeDefined();
    expect(screen.getByText("/ 100")).toBeDefined();
    expect(screen.getByText("Qs")).toBeDefined();
  });

  it("renders multi-level filter options as accessible buttons without vertical select elements", () => {
    const { container } = render(
      <UnifiedSearchFilterBox
        searchQuery=""
        onSearchChange={vi.fn()}
        levels={mockLevels}
      />
    );

    // Verify ZERO native <select> elements exist (no single vertical scrollable dropdowns!)
    const selects = container.querySelectorAll("select");
    expect(selects.length).toBe(0);

    // Verify all level titles are rendered
    expect(screen.getByText("Level 1: Technology Ecosystem")).toBeDefined();
    expect(screen.getByText("Level 2: Scenario Archetypes")).toBeDefined();
    expect(screen.getByText("Level 3: Difficulty Calibration")).toBeDefined();

    // Verify Level 2 grid options with emojis are rendered
    expect(screen.getByText("OOM & Memory Spill")).toBeDefined();
    expect(screen.getByText("Data Skew & Joins")).toBeDefined();
  });

  it("calls onSelect when a level option is clicked", () => {
    const onSelectTech = vi.fn();
    const levelsWithSpy: FilterLevel[] = [
      {
        ...mockLevels[0],
        onSelect: onSelectTech,
      },
      mockLevels[1],
    ];

    render(
      <UnifiedSearchFilterBox
        searchQuery=""
        onSearchChange={vi.fn()}
        levels={levelsWithSpy}
      />
    );

    const fabricBtn = screen.getByRole("radio", { name: /Fabric & OneLake/i });
    fireEvent.click(fabricBtn);
    expect(onSelectTech).toHaveBeenCalledWith("FABRIC");
  });

  it("calls onSearchChange when input value changes and displays clear button", () => {
    const onSearchChange = vi.fn();
    render(
      <UnifiedSearchFilterBox
        searchQuery="catalyst"
        onSearchChange={onSearchChange}
        levels={mockLevels}
      />
    );

    const clearBtn = screen.getByRole("button", { name: /Clear search query/i });
    expect(clearBtn).toBeDefined();

    fireEvent.click(clearBtn);
    expect(onSearchChange).toHaveBeenCalledWith("");
  });

  it("renders active filter chips with individual removal and reset all", () => {
    const onRemoveTech = vi.fn();
    const onResetAll = vi.fn();

    render(
      <UnifiedSearchFilterBox
        searchQuery=""
        onSearchChange={vi.fn()}
        levels={mockLevels}
        hasActiveFilters={true}
        onResetAll={onResetAll}
        activeFilters={[
          {
            id: "tech",
            label: "Tech: Fabric",
            onRemove: onRemoveTech,
          },
        ]}
      />
    );

    const chip = screen.getByRole("button", { name: /Remove filter: Tech: Fabric/i });
    expect(chip).toBeDefined();

    fireEvent.click(chip);
    expect(onRemoveTech).toHaveBeenCalledTimes(1);

    const resetBtns = screen.getAllByRole("button", { name: /Reset all/i });
    expect(resetBtns.length).toBeGreaterThan(0);
    fireEvent.click(resetBtns[0]);
    expect(onResetAll).toHaveBeenCalledTimes(1);
  });

  it("renders action buttons (Read All, Study Mode, Expand/Collapse)", () => {
    const onToggleReadAll = vi.fn();
    const onToggleStudy = vi.fn();

    render(
      <UnifiedSearchFilterBox
        searchQuery=""
        onSearchChange={vi.fn()}
        levels={mockLevels}
        actions={{
          readAll: {
            isActive: false,
            onToggle: onToggleReadAll,
            label: "Read All",
            shortcut: "⇧E",
          },
          studyMode: {
            isActive: true,
            onToggle: onToggleStudy,
            label: "Exit Study",
          },
        }}
      />
    );

    const readAllBtn = screen.getByRole("button", { name: /Read All/i });
    fireEvent.click(readAllBtn);
    expect(onToggleReadAll).toHaveBeenCalledTimes(1);

    const studyBtn = screen.getByRole("button", { name: /Exit Study/i });
    fireEvent.click(studyBtn);
    expect(onToggleStudy).toHaveBeenCalledTimes(1);
  });
});
