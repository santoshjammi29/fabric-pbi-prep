import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import PythonHub from "@/app/python/page";
import { pythonData, modernCodeMatrix } from "@/data";

let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/python",
}));

describe("Python Hub Page & Unified Slicers", () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
  });

  it("renders hero section with title and metrics", () => {
    render(<PythonHub />);
    expect(screen.getByText(/Python for Modern Data Platforms/i)).toBeDefined();
    expect(screen.getByText(/Python Hub · Modern Data Engineering & Architecture/i)).toBeDefined();
    expect(screen.getAllByText(new RegExp(`${pythonData.length}`)).length).toBeGreaterThan(0);
  });

  it("renders all 3 unified hub view tabs", () => {
    render(<PythonHub />);
    expect(screen.getByRole("button", { name: /Production Runbooks/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Polyglot Matrix/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Modern Stack Python Scenarios/i })).toBeDefined();
  });

  it("renders unified slicer controls for level, domain, and framework", () => {
    render(<PythonHub />);
    // Level slicers
    expect(screen.getByRole("button", { name: /All Levels/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /beginner/i })).toBeDefined();
    expect(screen.getAllByRole("button", { name: /architect/i }).length).toBeGreaterThan(0);

    // Domain slicer
    expect(screen.getByRole("button", { name: /All Domains/i })).toBeDefined();

    // Framework slicer
    expect(screen.getByRole("button", { name: /All Stacks/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Pandas/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Polars/i })).toBeDefined();
  });

  it("filters runbooks when searching via the unified search bar", () => {
    render(<PythonHub />);
    const searchInput = screen.getByPlaceholderText(/Search Python runbooks/i);
    expect(searchInput).toBeDefined();

    fireEvent.change(searchInput, { target: { value: "Delta Lake" } });
    expect(screen.getByText(/Active Slicers:/i)).toBeDefined();
    expect(screen.getByText(/Query: “Delta Lake”/i)).toBeDefined();
  });

  it("switches to polyglot matrix when polyglot tab is clicked", () => {
    render(<PythonHub />);
    const polyglotTab = screen.getByRole("button", { name: /Polyglot Matrix/i });
    fireEvent.click(polyglotTab);

    expect(screen.getByText(/Cross-Engine Polyglot Translation Matrix/i)).toBeDefined();
    expect(screen.getByText(modernCodeMatrix[0].topic)).toBeDefined();
  });

  it("switches to modern stack scenarios when clicked", () => {
    render(<PythonHub />);
    const modernStackTab = screen.getByRole("button", { name: /Modern Stack Python Scenarios/i });
    fireEvent.click(modernStackTab);

    expect(screen.getByText(/Modern Stack Python Solutions & System Scenarios/i)).toBeDefined();
  });
});
