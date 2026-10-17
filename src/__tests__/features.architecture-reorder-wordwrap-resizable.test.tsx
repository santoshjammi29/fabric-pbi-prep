import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { NAV_GROUPS } from "@/data/navigation-data";
import { Sidebar } from "@/components/layout/sidebar";
import { AllPagesFooter } from "@/components/layout/all-pages-footer";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/architecture",
  useSearchParams: () => new URLSearchParams("tab=scenarios"),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe("Architecture & Systems Reorder, Word Wrap & Resizable Sidebar Tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("places Cloud × Table Compatibility as the FIRST subitem under Architecture & Systems", () => {
    const archPillar = NAV_GROUPS.flatMap((g) => g.items).find(
      (item) => item.label === "Architecture & Systems"
    );
    expect(archPillar).toBeDefined();
    expect(archPillar?.subItems).toBeDefined();

    const subItems = archPillar!.subItems!;
    expect(subItems.length).toBeGreaterThanOrEqual(6);

    // Index 0 must be Cloud × Table Compatibility
    expect(subItems[0].label).toBe("Cloud × Table Compatibility");
    expect(subItems[0].href).toBe("/modern-stack?tab=compatibility");
    expect(subItems[0].badge).toBe("Matrix");

    // Index 1 is System Scenarios
    expect(subItems[1].label).toBe("System Scenarios");
    expect(subItems[1].href).toBe("/architecture?tab=scenarios");

    // Index 2 is Spark Engine Lab
    expect(subItems[2].label).toBe("Spark Engine Lab");
    expect(subItems[2].href).toBe("/spark-engine");
  });

  it("renders Sidebar with word-wrap enabled classes and resizer handle", () => {
    const { container } = render(<Sidebar />);

    // Check that sidebar aside element is present
    const aside = container.querySelector("aside");
    expect(aside).not.toBeNull();

    // Check that resize separator handle is present
    const resizer = screen.getByRole("separator", { name: /resize nav bar width/i });
    expect(resizer).toBeDefined();
    expect(resizer.getAttribute("title")).toContain("Drag to resize nav bar width");

    // Check word-wrap text styling on navigation items
    const archLabel = screen.getByText("Architecture & Systems");
    expect(archLabel.className).toContain("break-words");
    expect(archLabel.className).toContain("whitespace-normal");
  });

  it("supports adjusting sidebar width via presets and local storage persistence", () => {
    render(<Sidebar />);

    // Open width preset menu
    const widthBtn = screen.getByRole("button", { name: /adjust nav bar width/i });
    expect(widthBtn).toBeDefined();
    fireEvent.click(widthBtn);

    // Click Wide View (420px) preset
    const widePreset = screen.getByText("Wide View");
    fireEvent.click(widePreset);

    // Verify localStorage was updated
    expect(localStorage.getItem("sidebar-width")).toBe("420");
  });

  it("verifies the bottom utility bar with Shortcuts and duplicate controls is completely removed from AllPagesFooter", () => {
    render(<AllPagesFooter />);

    // High signal content remains
    expect(screen.getByText("DataPlatform Architect Notes")).toBeDefined();
    expect(screen.getByText("2026 Edition")).toBeDefined();
    expect(screen.getByText("10,700+")).toBeDefined();

    // Shortcuts row is removed
    expect(screen.queryByText(/shortcuts:/i)).toBeNull();
    expect(screen.queryByText("Shift+E")).toBeNull();
  });
});
