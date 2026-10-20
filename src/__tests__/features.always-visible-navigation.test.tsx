import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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

describe("Streamlined Navigation & Meaningful Bottom Page Notes", () => {
  it("defines all 21 pages and subpages in the centralized navigation catalog", () => {
    expect(ALL_FLAT_PAGES_AND_SUBPAGES.length).toBeGreaterThanOrEqual(20);
    const hrefs = ALL_FLAT_PAGES_AND_SUBPAGES.map((p) => p.href);

    // Verify key core subpages exist
    expect(hrefs).toContain("/guided-learning");
    expect(hrefs).toContain("/learning-paths");
    expect(hrefs).toContain("/concepts");
    expect(hrefs).toContain("/spark-engine");
    expect(hrefs).toContain("/modern-stack");
    expect(hrefs).toContain("/architecture?tab=scenarios");
    expect(hrefs).toContain("/architecture?tab=diagrams");
    expect(hrefs).toContain("/cheat-sheet");
    expect(hrefs).toContain("/code-practice?db=pyspark");
    expect(hrefs).toContain("/dataops?tab=connectivity");
    expect(hrefs).toContain("/dataops?tab=cicd");
    expect(hrefs).toContain("/qa-prep");
    expect(hrefs).toContain("/company-research");
    expect(hrefs).toContain("/studio");
  });

  it("renders ALL hubs and subpages in the left Sidebar as the primary navigation", () => {
    render(<Sidebar />);

    // Check that pages across all groups are cleanly rendered and visible in the left sidebar
    expect(screen.getByText("Cloud × Table Matrix")).toBeDefined();
    expect(screen.getByText("Architecture Scenarios")).toBeDefined();
    expect(screen.getByText("Spark Engine Lab")).toBeDefined();
    expect(screen.getByText("DataOps & CI/CD")).toBeDefined();
    expect(screen.getByText("Concepts Glossary")).toBeDefined();
    expect(screen.getByText("Concepts Mind Map")).toBeDefined();
    expect(screen.getByText("Code Practice")).toBeDefined();
    expect(screen.getByText("Cheat Sheets")).toBeDefined();
    expect(screen.getByText("Question Drill Bank")).toBeDefined();
    expect(screen.getByText("Target Company Intel")).toBeDefined();
    expect(screen.getByText("Guided Learning")).toBeDefined();
    expect(screen.getByText("Career Curricula")).toBeDefined();
  });

  it("renders AllPagesNav with only the universal search bar at the top", () => {
    render(<AllPagesNav />);

    // Search bar is rendered prominently with ⌘K badge
    expect(screen.getByRole("search")).toBeDefined();
    expect(screen.getByText(/Search 10,700\+ Q&As, concepts, architecture blueprints/i)).toBeDefined();
    expect(screen.getByText("⌘K")).toBeDefined();
  });

  it("renders AllPagesFooter with revamped, simple, and meaningful platform notes and metrics", () => {
    render(<AllPagesFooter />);

    // High-signal platform notes and metrics
    expect(screen.getByText("Lakehouse Architect Notes")).toBeDefined();
    expect(screen.getByText("2026 Edition")).toBeDefined();
    expect(screen.getByText("10,700+")).toBeDefined();
    expect(screen.getByText("Verified Assets")).toBeDefined();
    expect(screen.getByText("32 Blueprints")).toBeDefined();
    expect(screen.getByText("156 Profiles")).toBeDefined();
    expect(screen.getByText("660 Concepts")).toBeDefined();

    // Redundant bottom bar controls removed
    expect(screen.queryByText("Shortcuts:")).toBeNull();
  });

  it("correctly identifies active subpage hrefs including default parameters", () => {
    // Exact match
    expect(isSubHrefActive("/guided-learning", new URLSearchParams(), "/guided-learning")).toBe(true);

    // Query param match
    expect(isSubHrefActive("/architecture", new URLSearchParams("tab=diagrams"), "/architecture?tab=diagrams")).toBe(true);
    expect(isSubHrefActive("/architecture", new URLSearchParams("tab=scenarios"), "/architecture?tab=diagrams")).toBe(false);

    // Default fallback when tab is not set on /architecture
    expect(isSubHrefActive("/architecture", new URLSearchParams(), "/architecture?tab=scenarios")).toBe(true);
  });

  it("ensures left navigation stays until the end of the page across all layouts version of displays", () => {
    const { container } = render(<Sidebar />);
    const aside = container.querySelector("aside");
    expect(aside).not.toBeNull();

    // Verify aside uses fixed, top-0, bottom-0, left-0, and h-dvh to stay pinned until the bottom of dynamic pages
    expect(aside?.className).toContain("fixed");
    expect(aside?.className).toContain("top-0");
    expect(aside?.className).toContain("bottom-0");
    expect(aside?.className).toContain("left-0");
    expect(aside?.className).toContain("h-dvh");
    expect(aside?.className).toContain("border-r");

    // Verify aside is NOT hidden on smaller screens (previously 'hidden lg:flex', now 'flex')
    expect(aside?.className).toContain("flex");
    expect(aside?.className).not.toContain("hidden lg:flex");
  });

  it("verifies left navigation maintains responsive collapsed and expanded modes", () => {
    const { container } = render(<Sidebar />);
    const aside = container.querySelector("aside");
    expect(aside).not.toBeNull();

    // In desktop/default mode, width is 285px
    expect(aside?.style.width).toBe("285px");

    // Clicking collapse toggles to 72px rail mode
    const collapseBtn = screen.getByRole("button", { name: /collapse sidebar/i });
    fireEvent.click(collapseBtn);
    expect(aside?.style.width).toBe("72px");

    // Clicking expand toggles back to 285px
    const expandBtn = screen.getByRole("button", { name: /expand sidebar/i });
    fireEvent.click(expandBtn);
    expect(aside?.style.width).toBe("285px");
  });
});
