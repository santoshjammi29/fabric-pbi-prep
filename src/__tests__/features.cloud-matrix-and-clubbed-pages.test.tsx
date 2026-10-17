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

  describe("2. Coding Pages & Subpages Merged & Clubbed Together", () => {
    it("clubs all code drills, cheat sheets, Databricks runbooks, and polyglot matrix under Coding & Runbooks", () => {
      const codingPillar = NAV_GROUPS.flatMap((g) => g.items).find(
        (item) => item.label === "Coding & Runbooks"
      );
      expect(codingPillar).toBeDefined();

      const subHrefs = codingPillar?.subItems?.map((s) => s.href) || [];
      expect(subHrefs).toContain("/cheat-sheet");
      expect(subHrefs).toContain("/cheat-sheet?tab=databricks");
      expect(subHrefs).toContain("/code-practice?db=pyspark");
      expect(subHrefs).toContain("/code-practice?db=sparksql");
      expect(subHrefs).toContain("/code-practice?db=mssql");
      expect(subHrefs).toContain("/code-practice?db=python");
      expect(subHrefs).toContain("/modern-stack?tab=matrix");
    });

    it("assigns Category 'Coding' to all flat code subpages", () => {
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

  describe("3. Concepts Pages & Subpages Merged & Clubbed Together", () => {
    it("clubs glossary, mind map, and core lakehouse concepts under Concepts & Foundations", () => {
      const conceptsPillar = NAV_GROUPS.flatMap((g) => g.items).find(
        (item) => item.label === "Concepts & Foundations"
      );
      expect(conceptsPillar).toBeDefined();

      const subHrefs = conceptsPillar?.subItems?.map((s) => s.href) || [];
      expect(subHrefs).toContain("/concepts");
      expect(subHrefs).toContain("/mindmap");
      expect(subHrefs).toContain("/modern-stack?tab=concepts");
    });

    it("assigns Category 'Concepts' to all flat concepts subpages", () => {
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

  describe("4. Architecture Pages & Subpages Merged & Clubbed Together", () => {
    it("clubs system scenarios, Spark engine lab, DataOps lifecycle, and Cloud × Table matrix under Architecture & Systems", () => {
      const archPillar = NAV_GROUPS.flatMap((g) => g.items).find(
        (item) => item.label === "Architecture & Systems"
      );
      expect(archPillar).toBeDefined();

      const subHrefs = archPillar?.subItems?.map((s) => s.href) || [];
      expect(subHrefs).toContain("/architecture?tab=scenarios");
      expect(subHrefs).toContain("/spark-engine");
      expect(subHrefs).toContain("/dataops?tab=lifecycle");
      expect(subHrefs).toContain("/dataops?tab=connectivity");
      expect(subHrefs).toContain("/dataops?tab=cicd");
      expect(subHrefs).toContain("/modern-stack?tab=compatibility");
    });
  });

  describe("5. Visual Blueprints & Diagrams (Images) Merged & Clubbed Together", () => {
    it("clubs whiteboard blueprints, whiteboard architecture flow, and modern blueprints under Visual Blueprints & Diagrams", () => {
      const visualsPillar = NAV_GROUPS.flatMap((g) => g.items).find(
        (item) => item.label === "Visual Blueprints & Diagrams"
      );
      expect(visualsPillar).toBeDefined();

      const subHrefs = visualsPillar?.subItems?.map((s) => s.href) || [];
      expect(subHrefs).toContain("/architecture?tab=diagrams");
      expect(subHrefs).toContain("/dataops?tab=diagram");
      expect(subHrefs).toContain("/modern-stack?tab=blueprints");
    });

    it("assigns Category 'Images & Diagrams' to all visual blueprint pages", () => {
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

  describe("6. Q&A & Interview Prep Merged & Clubbed Together", () => {
    it("clubs Question Drill Bank and Target Company Intel under Interview Drill Hub", () => {
      const qaPillar = NAV_GROUPS.flatMap((g) => g.items).find(
        (item) => item.label === "Interview Drill Hub"
      );
      expect(qaPillar).toBeDefined();

      const subHrefs = qaPillar?.subItems?.map((s) => s.href) || [];
      expect(subHrefs).toContain("/qa-prep");
      expect(subHrefs).toContain("/company-research");
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

  describe("7. Sidebar Rendering of Clubbed Pillars", () => {
    it("renders all clubbed pillar titles and subpages in the sidebar", () => {
      render(<Sidebar />);

      // Pillars
      expect(screen.getByText("Concepts & Foundations")).toBeDefined();
      expect(screen.getByText("Architecture & Systems")).toBeDefined();
      expect(screen.getByText("Coding & Runbooks")).toBeDefined();
      expect(screen.getByText("Visual Blueprints & Diagrams")).toBeDefined();
      expect(screen.getByText("Interview Drill Hub")).toBeDefined();
      expect(screen.getByText("Learning Journey")).toBeDefined();

      // Subpages across clubbed groups
      expect(screen.getByText("Concepts Glossary")).toBeDefined();
      expect(screen.getByText("Concepts Mind Map")).toBeDefined();
      expect(screen.getByText("System Scenarios")).toBeDefined();
      expect(screen.getByText("Spark Engine Lab")).toBeDefined();
      expect(screen.getByText("Production Cheat Sheet")).toBeDefined();
      expect(screen.getByText("PySpark Drills")).toBeDefined();
      expect(screen.getByText("Whiteboard Blueprints")).toBeDefined();
      expect(screen.getByText("Question Drill Bank")).toBeDefined();
      expect(screen.getByText("Target Company Intel")).toBeDefined();
      expect(screen.getByText("Guided Topic Tracks")).toBeDefined();
      expect(screen.getByText("Career Curricula")).toBeDefined();
    });
  });
});
