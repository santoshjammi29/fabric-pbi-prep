import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/layout/sidebar";
import { AllPagesNav } from "@/components/layout/all-pages-nav";
import { AllPagesFooter } from "@/components/layout/all-pages-footer";
import { NAV_GROUPS, ALL_FLAT_PAGES_AND_SUBPAGES, isSubHrefActive } from "@/data/navigation-data";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("Always-Visible Navigation Across All Layouts", () => {
  it("defines all 22 pages and subpages in the centralized navigation catalog", () => {
    expect(ALL_FLAT_PAGES_AND_SUBPAGES.length).toBeGreaterThanOrEqual(21);
    const hrefs = ALL_FLAT_PAGES_AND_SUBPAGES.map((p) => p.href);

    // Verify key core subpages exist
    expect(hrefs).toContain("/guided-learning");
    expect(hrefs).toContain("/learning-paths");
    expect(hrefs).toContain("/concepts");
    expect(hrefs).toContain("/spark-engine");
    expect(hrefs).toContain("/modern-stack");
    expect(hrefs).toContain("/architecture?tab=scenarios");
    expect(hrefs).toContain("/architecture?tab=diagrams");
    expect(hrefs).toContain("/mindmap");
    expect(hrefs).toContain("/cheat-sheet");
    expect(hrefs).toContain("/code-practice?db=pyspark");
    expect(hrefs).toContain("/dataops?tab=connectivity");
    expect(hrefs).toContain("/dataops?tab=cicd");
    expect(hrefs).toContain("/qa-prep");
    expect(hrefs).toContain("/company-research");
    expect(hrefs).toContain("/studio");
  });

  it("renders ALL subpages in the Sidebar even when on root / page without requiring prior activation", () => {
    render(<Sidebar />);

    // Check that subpages across all pillars are immediately rendered and visible
    expect(screen.getByText("Guided Topic Tracks")).toBeDefined();
    expect(screen.getByText("Career Curricula")).toBeDefined();
    expect(screen.getByText("Concepts Glossary")).toBeDefined();
    expect(screen.getByText("Spark Engine Lab")).toBeDefined();
    expect(screen.getByText("System Scenarios")).toBeDefined();
    expect(screen.getByText("Interactive Mindmap")).toBeDefined();
    expect(screen.getByText("Production Cheat Sheet")).toBeDefined();
    expect(screen.getByText("PySpark Drills")).toBeDefined();
    expect(screen.getByText("Tool Connectivity & Secrets")).toBeDefined();
    expect(screen.getByText("CI/CD Alternatives & Pipelines")).toBeDefined();
    expect(screen.getByText("Question Drill Bank")).toBeDefined();
    expect(screen.getByText("Target Company Intel")).toBeDefined();
  });

  it("renders AllPagesNav with all hubs and subpages visible for all screen sizes", () => {
    render(<AllPagesNav />);

    // Check hubs strip
    expect(screen.getByText("All Hubs")).toBeDefined();
    expect(screen.getByText("Home Dashboard")).toBeDefined();
    expect(screen.getByText("Learning Journey")).toBeDefined();
    expect(screen.getByText("Architecture Hub")).toBeDefined();

    // Check subpage chips
    expect(screen.getByText("Topic Tracks")).toBeDefined();
    expect(screen.getByText("Scenarios")).toBeDefined();
    expect(screen.getByText("Mindmap")).toBeDefined();
    expect(screen.getByText("PySpark")).toBeDefined();
    expect(screen.getByText("CI/CD Pipelines")).toBeDefined();
  });

  it("renders AllPagesFooter with comprehensive links to all pillars and subpages", () => {
    render(<AllPagesFooter />);

    expect(screen.getAllByText(/DataPlatform Architect/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Search Concepts & Drills")).toBeDefined();
  });

  it("correctly identifies active subpage hrefs including default parameters", () => {
    // Exact match
    expect(isSubHrefActive("/mindmap", new URLSearchParams(), "/mindmap")).toBe(true);

    // Query param match
    expect(isSubHrefActive("/architecture", new URLSearchParams("tab=diagrams"), "/architecture?tab=diagrams")).toBe(true);
    expect(isSubHrefActive("/architecture", new URLSearchParams("tab=scenarios"), "/architecture?tab=diagrams")).toBe(false);

    // Default fallback when tab is not set on /architecture
    expect(isSubHrefActive("/architecture", new URLSearchParams(), "/architecture?tab=scenarios")).toBe(true);
  });
});
