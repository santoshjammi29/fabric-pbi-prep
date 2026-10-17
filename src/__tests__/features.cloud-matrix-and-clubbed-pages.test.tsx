import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import {
  NAV_GROUPS,
  ALL_FLAT_PAGES_AND_SUBPAGES,
  isSubHrefActive,
} from "@/data/navigation-data";
import { Sidebar } from "@/components/layout/sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/modern-stack",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("Cloud × Table Matrix First & Consolidated Clubbed Pages Verification", () => {
  describe("1. Cloud Engine × Table Format Compatibility Matrix", () => {
    it("recognizes /modern-stack?tab=compatibility as the default active subpage on /modern-stack", () => {
      // Default parameter on /modern-stack resolves to compatibility
      expect(
        isSubHrefActive(
          "/modern-stack",
          new URLSearchParams(),
          "/modern-stack?tab=compatibility"
        )
      ).toBe(true);

      // Explicit parameter match
      expect(
        isSubHrefActive(
          "/modern-stack",
          new URLSearchParams("tab=compatibility"),
          "/modern-stack?tab=compatibility"
        )
      ).toBe(true);

      // Other subtabs do not match default compatibility
      expect(
        isSubHrefActive(
          "/modern-stack",
          new URLSearchParams("tab=concepts"),
          "/modern-stack?tab=compatibility"
        )
      ).toBe(false);
    });

    it("verifies Cloud × Table Compatibility is cataloged in ALL_FLAT_PAGES_AND_SUBPAGES", () => {
      const compatPage = ALL_FLAT_PAGES_AND_SUBPAGES.find(
        (p) => p.href === "/modern-stack?tab=compatibility"
      );
      expect(compatPage).toBeDefined();
      expect(compatPage?.label).toBe("Cloud × Table Compatibility");
      expect(compatPage?.category).toBe("Architecture");
    });
  });

  describe("2. Coding Pages Cleanly Cataloged & Clubbed", () => {
    it("clubs code practice drills and cheat sheets under Knowledge & Drills", () => {
      const kdGroup = NAV_GROUPS.find((g) => g.title === "Knowledge & Drills");
      expect(kdGroup).toBeDefined();

      const labels = kdGroup?.items.map((s) => s.label) || [];
      expect(labels).toContain("Code Practice");
      expect(labels).toContain("Cheat Sheets");
    });

    it("assigns Category 'Coding' to all flat code subpages in catalog", () => {
      const codePages = ALL_FLAT_PAGES_AND_SUBPAGES.filter(
        (p) => p.category === "Coding"
      );
      expect(codePages.length).toBeGreaterThanOrEqual(7);

      const hrefs = codePages.map((p) => p.href);
      expect(hrefs).toContain("/cheat-sheet");
      expect(hrefs).toContain("/cheat-sheet?tab=databricks");
      expect(hrefs).toContain("/code-practice?db=pyspark");
      expect(hrefs).toContain("/code-practice?db=sparksql");
      expect(hrefs).toContain("/code-practice?db=mssql");
      expect(hrefs).toContain("/code-practice?db=python");
      expect(hrefs).toContain("/modern-stack?tab=matrix");
    });
  });

  describe("3. Concepts Pages Cleanly Cataloged & Clubbed", () => {
    it("clubs glossary and mind map under Knowledge & Drills", () => {
      const kdGroup = NAV_GROUPS.find((g) => g.title === "Knowledge & Drills");
      expect(kdGroup).toBeDefined();

      const labels = kdGroup?.items.map((s) => s.label) || [];
      expect(labels).toContain("Concepts Glossary");
      expect(labels).toContain("Concepts Mind Map");
    });

    it("assigns Category 'Concepts' to all flat concepts subpages in catalog", () => {
      const conceptPages = ALL_FLAT_PAGES_AND_SUBPAGES.filter(
        (p) => p.category === "Concepts"
      );
      expect(conceptPages.length).toBeGreaterThanOrEqual(3);

      const hrefs = conceptPages.map((p) => p.href);
      expect(hrefs).toContain("/concepts");
      expect(hrefs).toContain("/mindmap");
      expect(hrefs).toContain("/modern-stack?tab=concepts");
    });
  });

  describe("4. Platform & Architecture Pages Cleanly Clubbed Together", () => {
    it("clubs Cloud × Table matrix, Architecture scenarios, Spark engine lab, and DataOps under Platform", () => {
      const platformGroup = NAV_GROUPS.find((g) => g.title === "Platform");
      expect(platformGroup).toBeDefined();

      const hrefs = platformGroup?.items.map((s) => s.href) || [];
      expect(hrefs).toContain("/modern-stack");
      expect(hrefs).toContain("/architecture");
      expect(hrefs).toContain("/spark-engine");
      expect(hrefs).toContain("/dataops");
    });
  });

  describe("5. Visual Blueprints & Diagrams Cataloged in Flat Navigation Catalog", () => {
    it("assigns Category 'Images & Diagrams' to all visual blueprint pages in catalog", () => {
      const visualPages = ALL_FLAT_PAGES_AND_SUBPAGES.filter(
        (p) => p.category === "Images & Diagrams"
      );
      expect(visualPages.length).toBeGreaterThanOrEqual(3);

      const hrefs = visualPages.map((p) => p.href);
      expect(hrefs).toContain("/architecture?tab=diagrams");
      expect(hrefs).toContain("/dataops?tab=diagram");
      expect(hrefs).toContain("/modern-stack?tab=blueprints");
    });
  });

  describe("6. Q&A & Interview Prep Cleanly Clubbed Together", () => {
    it("clubs Question Drill Bank and Target Company Intel under Interviews & Roadmaps", () => {
      const interviewGroup = NAV_GROUPS.find((g) => g.title === "Interviews & Roadmaps");
      expect(interviewGroup).toBeDefined();

      const hrefs = interviewGroup?.items.map((s) => s.href) || [];
      expect(hrefs).toContain("/qa-prep");
      expect(hrefs).toContain("/company-research");
      expect(hrefs).toContain("/guided-learning");
      expect(hrefs).toContain("/learning-paths");
    });

    it("assigns Category 'Q&A' to Question Drill Bank and Target Company Intel", () => {
      const qaPages = ALL_FLAT_PAGES_AND_SUBPAGES.filter(
        (p) => p.category === "Q&A"
      );
      expect(qaPages.length).toBeGreaterThanOrEqual(2);

      const hrefs = qaPages.map((p) => p.href);
      expect(hrefs).toContain("/qa-prep");
      expect(hrefs).toContain("/company-research");
    });
  });

  describe("7. Simple Left Side Nav Bar Rendering (Un-nested)", () => {
    it("renders all simplified navigation groups and flat direct links without nested sub-trees", () => {
      render(<Sidebar />);

      // Groups
      expect(screen.getByText("Platform")).toBeDefined();
      expect(screen.getByText("Knowledge & Drills")).toBeDefined();
      expect(screen.getByText("Interviews & Roadmaps")).toBeDefined();
      expect(screen.getByText("Workspace")).toBeDefined();

      // Flat direct navigation pages
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
      expect(screen.getByText("My Studio")).toBeDefined();
    });
  });
});
