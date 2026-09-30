import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LearningProgressBar, CURRICULUM_STEPS } from "@/components/layout/learning-progress-bar";
import { JargonTooltip, JARGON_GLOSSARY } from "@/components/ui/jargon-tooltip";
import { PrerequisiteBanner } from "@/components/ui/prerequisite-banner";
import { RoadmapGrid, STEPS_CONFIG } from "@/components/dashboard/roadmap-grid";
import { useUserStore } from "@/store/useUserStore";

let mockPathname = "/concepts";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe("Beginner's Rail Components", () => {
  beforeEach(() => {
    useUserStore.getState().resetProgress();
    mockPathname = "/concepts";
  });

  describe("LearningProgressBar", () => {
    it("renders active curriculum step correctly based on pathname", () => {
      mockPathname = "/concepts";
      render(<LearningProgressBar />);

      expect(screen.getByText(/Location:/i)).toBeDefined();
      expect(screen.getByText(/Step 1 of 6/i)).toBeDefined();
      expect(screen.getByText("Key Concepts")).toBeDefined();
    });

    it("updates location when on Step 2 (Python Hub)", () => {
      mockPathname = "/python";
      render(<LearningProgressBar />);

      expect(screen.getByText(/Step 2 of 6/i)).toBeDefined();
      expect(screen.getByText("Python Hub")).toBeDefined();
    });

    it("renders all 6 curriculum steps", () => {
      render(<LearningProgressBar />);
      CURRICULUM_STEPS.forEach((step) => {
        expect(screen.getAllByText(step.shortTitle).length).toBeGreaterThan(0);
      });
    });
  });

  describe("JargonTooltip", () => {
    it("renders known jargon term trigger with dotted decoration", () => {
      render(<JargonTooltip term="v-order" />);
      const trigger = screen.getByRole("button", { name: /v-order/i });
      expect(trigger).toBeDefined();
    });

    it("reveals plain-English definition when clicked or focused", () => {
      render(<JargonTooltip term="v-order" />);
      const trigger = screen.getByRole("button", { name: /v-order/i });
      fireEvent.click(trigger);

      expect(screen.getByText(/Plain-English Primer/i)).toBeDefined();
      expect(screen.getByText(JARGON_GLOSSARY["v-order"].plainEnglish)).toBeDefined();
      expect(screen.getByText(/Explore Concept/i)).toBeDefined();
    });

    it("supports custom definition override", () => {
      render(
        <JargonTooltip term="Custom Term" definition="This is a custom explanation for testing.">
          Custom Term
        </JargonTooltip>
      );
      const trigger = screen.getByRole("button", { name: /custom term/i });
      fireEvent.click(trigger);

      expect(screen.getByText("This is a custom explanation for testing.")).toBeDefined();
    });
  });

  describe("PrerequisiteBanner", () => {
    const mockPrereqs = [
      {
        term: "Lakehouse Architecture",
        conceptId: "fabric-lakehouse",
        whyNeeded: "Understand file format structures before writing Spark queries.",
      },
    ];

    it("renders module title and checklist items", () => {
      render(
        <PrerequisiteBanner
          moduleTitle="Spark Internals"
          prerequisites={mockPrereqs}
        />
      );

      expect(screen.getByText(/Before You Dive Into Spark Internals/i)).toBeDefined();
      expect(screen.getByText("Lakehouse Architecture")).toBeDefined();
      expect(screen.getByText("Understand file format structures before writing Spark queries.")).toBeDefined();
    });

    it("allows dismissing the banner", () => {
      render(
        <PrerequisiteBanner
          moduleTitle="Spark Internals"
          prerequisites={mockPrereqs}
        />
      );

      const dismissBtn = screen.getByRole("button", { name: /dismiss/i });
      fireEvent.click(dismissBtn);

      expect(screen.queryByText(/Before You Dive Into Spark Internals/i)).toBeNull();
    });
  });

  describe("RoadmapGrid Progression Rail", () => {
    it("renders all 6 steps in the curriculum", () => {
      render(<RoadmapGrid />);
      STEPS_CONFIG.forEach((s) => {
        expect(screen.getAllByText(s.title).length).toBeGreaterThan(0);
      });
    });

    it("allows toggling between S-Curve Progression Rail and Grid View", () => {
      render(<RoadmapGrid />);
      const gridBtn = screen.getByTitle(/grid view/i);
      fireEvent.click(gridBtn);

      const scurveBtn = screen.getByTitle(/visual progression s-curve/i);
      fireEvent.click(scurveBtn);
      expect(screen.getByText(/Beginner's Rail/i)).toBeDefined();
    });
  });
});
