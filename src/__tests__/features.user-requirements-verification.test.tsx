import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AllPagesNav } from "@/components/layout/all-pages-nav";

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
        screen.getByText(/Search (?:6,500\+|10,700\+) Q&As, concepts, architecture blueprints, system design\.\.\./i)
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
});
