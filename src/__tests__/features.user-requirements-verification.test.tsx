import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AllPagesNav } from "@/components/layout/all-pages-nav";
import { InteractiveMindmap } from "@/components/mindmap/interactive-mindmap";
import { MINDMAP_DOMAINS } from "@/data/mindmap-data";

vi.mock("next/navigation", () => ({
  usePathname: () => "/guided-learning",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("User Requirements Verification", () => {
  describe("Requirement 1: Standard Search Bar Across All Pages & Subpages", () => {
    it("renders the standard search bar in AllPagesNav across all pages and subpages", () => {
      render(<AllPagesNav />);

      const searchBtn = screen.getByRole("button", {
        name: /Universal search across all Q&As, concepts, architecture blueprints, and topics/i,
      });
      expect(searchBtn).toBeDefined();

      expect(
        screen.getByText(/Search 6,500\+ Q&As, concepts, architecture blueprints, system design\.\.\./i)
      ).toBeDefined();

      expect(screen.getByText("⌘K")).toBeDefined();
    });

    it("dispatches open-command-palette event when the standard search bar is clicked", () => {
      render(<AllPagesNav />);

      let eventFired = false;
      const handler = () => {
        eventFired = true;
      };
      window.addEventListener("open-command-palette", handler);

      const searchBtn = screen.getByRole("button", {
        name: /Universal search across all Q&As, concepts, architecture blueprints, and topics/i,
      });
      fireEvent.click(searchBtn);

      expect(eventFired).toBe(true);
      window.removeEventListener("open-command-palette", handler);
    });
  });

  describe("Requirement 2: Concepts-Based Hierarchical Tree Mindmap", () => {
    it("renders the root node and 7 architectural pillars in a hierarchical tree layout", () => {
      render(<InteractiveMindmap />);

      // Root node
      expect(screen.getByText("Modern Data Architecture")).toBeDefined();
      expect(screen.getByText(/Root Concepts Tree & Distributed System Pillars/i)).toBeDefined();

      // All 7 domains
      MINDMAP_DOMAINS.forEach((domain) => {
        expect(screen.getAllByText(domain.title).length).toBeGreaterThan(0);
      });
    });

    it("supports switching between Tree View and Pillars Matrix", () => {
      render(<InteractiveMindmap />);

      const treeBtn = screen.getByTitle("Hierarchical Tree Mode");
      const matrixBtn = screen.getByTitle("Pillars Matrix Mode");

      expect(treeBtn).toBeDefined();
      expect(matrixBtn).toBeDefined();

      // Switch to matrix mode
      fireEvent.click(matrixBtn);
      expect(screen.getByText("Pillar 01")).toBeDefined();

      // Switch back to tree mode
      fireEvent.click(treeBtn);
      expect(screen.getByText(/Architecture Core/i)).toBeDefined();
    });

    it("filters tree nodes by search query and shows match count", () => {
      render(<InteractiveMindmap />);

      const searchInput = screen.getByPlaceholderText(/search concepts, protocols, or domains/i);
      fireEvent.change(searchInput, { target: { value: "Kafka" } });

      expect(screen.getByText(/matches found/i)).toBeDefined();
      expect(screen.getAllByText("Distributed Event Brokers").length).toBeGreaterThan(0);
    });

    it("opens detailed inspector drawer with trade-offs, code, and practice links", () => {
      render(<InteractiveMindmap />);

      const subtopicNode = screen.getAllByText("Log-Based CDC & Event Sourcing")[0];
      fireEvent.click(subtopicNode);

      // Verify inspector drawer content
      expect(screen.getByText(/Architectural Trade-Off & Production Rubric/i)).toBeDefined();
      expect(screen.getByText(/Practice Interview Q&As for this Topic/i)).toBeDefined();

      // Switch to Code Blueprint tab
      const codeTab = screen.getByText("Code Blueprint");
      fireEvent.click(codeTab);
      expect(screen.getByText("Production Syntax Snippet")).toBeDefined();
    });
  });
});
