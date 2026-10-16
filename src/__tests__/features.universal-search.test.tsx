import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { executePortalSearch, tokenizeQuery, identifyTopicsFromTokens } from "@/lib/search-engine";
import { CommandPalette } from "@/components/command-palette";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("Universal Search Engine & Cross-Page Topic Discovery", () => {
  it("correctly tokenizes multi-word search queries and removes noise stopwords", () => {
    const tokens1 = tokenizeQuery("spark shuffle memory");
    expect(tokens1).toEqual(["spark", "shuffle", "memory"]);

    const tokens2 = tokenizeQuery("how to use airflow in a dynamic dag");
    expect(tokens2).toContain("airflow");
    expect(tokens2).toContain("dynamic");
    expect(tokens2).toContain("dag");
    expect(tokens2).not.toContain("how");
    expect(tokens2).not.toContain("to");
  });

  it("identifies topics across the portal with single or multi-word inputs", () => {
    const sparkTopics = identifyTopicsFromTokens(["spark", "catalyst"]);
    expect(sparkTopics.length).toBeGreaterThan(0);
    expect(sparkTopics[0].key).toBe("spark");
    expect(sparkTopics[0].label).toBe("Apache Spark");
    expect(sparkTopics[0].href).toBe("/guided-learning?topic=spark");

    const airflowTopics = identifyTopicsFromTokens(["airflow", "dag"]);
    expect(airflowTopics.some((t) => t.key === "airflow")).toBe(true);

    const deltaTopics = identifyTopicsFromTokens(["delta", "lakehouse"]);
    expect(deltaTopics.some((t) => t.key === "databricks" || t.key === "datalake")).toBe(true);
  });

  it("identifies topic and surfaces results across multiple pages for 'spark shuffle'", () => {
    const res = executePortalSearch("spark shuffle");
    expect(res.total).toBeGreaterThan(0);

    // Topic identified
    expect(res.identifiedTopics.some((t) => t.key === "spark")).toBe(true);

    // Should find results across multiple pages
    const pages = Object.keys(res.pageCounts);
    expect(pages.length).toBeGreaterThanOrEqual(2);

    // Verify categories present in items
    const categories = res.items.map((i) => i.category);
    expect(categories).toContain("Guided Track");

    // All items should have valid deep-links
    res.items.forEach((item) => {
      expect(item.href).toBeDefined();
      expect(item.title).toBeDefined();
      expect(item.page).toBeDefined();
    });
  });

  it("identifies topics and returns architecture, concept, and Q&A items for 'airflow'", () => {
    const res = executePortalSearch("airflow dag");
    expect(res.total).toBeGreaterThan(0);
    expect(res.identifiedTopics.some((t) => t.key === "airflow")).toBe(true);

    const categories = new Set(res.items.map((i) => i.category));
    expect(categories.has("Guided Track") || categories.has("Concepts")).toBe(true);
  });

  it("finds exact multi-word concept definitions like 'liquid clustering'", () => {
    const res = executePortalSearch("liquid clustering");
    expect(res.total).toBeGreaterThan(0);
    const hasLiquid = res.items.some(
      (i) => i.title.toLowerCase().includes("liquid") || i.snippet?.toLowerCase().includes("liquid")
    );
    expect(hasLiquid).toBe(true);
  });

  it("gracefully returns empty structure for blank or whitespace queries", () => {
    const res = executePortalSearch("   ");
    expect(res.total).toBe(0);
    expect(res.items).toHaveLength(0);
    expect(res.identifiedTopics).toHaveLength(0);
  });

  it("renders CommandPalette with topic discovery card and filter tabs", async () => {
    render(<CommandPalette />);

    // Open via Ctrl+K
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });

    const input = screen.getByPlaceholderText(/Search concepts, questions, architecture, topics/i);
    expect(input).toBeDefined();

    // Type "spark"
    fireEvent.change(input, { target: { value: "spark" } });

    await waitFor(() => {
      // Expect Topic Identified banner
      expect(screen.getByText(/Topic Identified/i)).toBeDefined();
      expect(screen.getAllByText(/Apache Spark/i).length).toBeGreaterThanOrEqual(1);
    });

    // Check filter tabs
    expect(screen.getByText("All")).toBeDefined();
    expect(screen.getByText("Tracks")).toBeDefined();
    expect(screen.getByText("Concepts")).toBeDefined();
    expect(screen.getByText("Architecture")).toBeDefined();
    expect(screen.getByText("Q&A Prep")).toBeDefined();
  });

  it("opens CommandPalette using the forward slash '/' key shortcut", () => {
    render(<CommandPalette />);

    // Press '/' key
    fireEvent.keyDown(window, { key: "/" });

    const input = screen.getByPlaceholderText(/Search concepts, questions, architecture, topics/i);
    expect(input).toBeDefined();
  });

  it("renders suggested popular architecture keywords when search query is empty", () => {
    render(<CommandPalette />);

    // Open via Ctrl+K
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });

    // Expect popular keywords bar
    expect(screen.getByText(/Popular Architecture & Concept Keywords/i)).toBeDefined();
    expect(screen.getByText("Catalyst Optimizer")).toBeDefined();
    expect(screen.getByText("Delta Lake ACID")).toBeDefined();
    expect(screen.getByText("Direct Lake VertiPaq")).toBeDefined();
  });

  it("finds whiteboard architecture blueprints like 'Catalyst Photon Engine' or 'Medallion'", () => {
    const res = executePortalSearch("Photon Engine");
    expect(res.total).toBeGreaterThan(0);
    const hasBlueprint = res.items.some(
      (item) => item.category === "Blueprints" || item.title.toLowerCase().includes("photon")
    );
    expect(hasBlueprint).toBe(true);
  });
});
