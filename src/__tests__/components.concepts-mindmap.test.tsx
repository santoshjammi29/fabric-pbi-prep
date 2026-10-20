import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConceptsMindmapView } from "@/components/concepts/concepts-mindmap-view";
import { buildConceptsMultiLevelTree, TOPIC_PILLARS_CONFIG } from "@/data/concepts-tree-data";
import { Concept } from "@/types/data";

const mockConcepts: Concept[] = [
  {
    id: "fab-1",
    term: "OneLake",
    category: "FABRIC",
    difficulty: "EASY",
    definition: "Unified logical data lake for the entire organization.",
    explanation: "OneLake serves as the single storage repository in Microsoft Fabric.",
    keyPoints: ["Built on ADLS Gen2", "Cross-workspace shortcuts"],
  },
  {
    id: "fab-2",
    term: "Direct Lake Mode",
    category: "FABRIC",
    difficulty: "ARCHITECT",
    definition: "Direct memory framing from Delta Parquet into VertiPaq memory.",
    explanation: "Eliminates data duplication by mapping lakehouse storage into memory.",
    keyPoints: ["No refresh needed", "Sub-second analytical queries"],
  },
  {
    id: "spark-1",
    term: "Catalyst Optimizer",
    category: "SPARK & DATABRICKS",
    difficulty: "HARD",
    definition: "Query optimization framework in Apache Spark.",
    explanation: "Applies rule-based and cost-based optimizations to execution plans.",
    keyPoints: ["Logical plan trees", "Code generation"],
  },
  {
    id: "dbx-1",
    term: "Liquid Clustering",
    category: "DATABRICKS",
    difficulty: "HARD",
    definition: "Next-generation flexible data layout mechanism replacing partitioning and Z-Order.",
    explanation: "Allows clustering on multiple keys without data rewrites.",
    keyPoints: ["Incremental clustering", "No partition skew"],
  },
];

describe("Concepts Multi-Level Mind Map Data Builder", () => {
  it("builds topic pillars with subtopics and correct concept mappings", () => {
    const tree = buildConceptsMultiLevelTree(mockConcepts);
    expect(tree.length).toBe(TOPIC_PILLARS_CONFIG.length);

    const fabricTopic = tree.find((t) => t.categoryKey === "FABRIC");
    expect(fabricTopic).toBeDefined();
    expect(fabricTopic?.totalCount).toBe(2);

    const sparkTopic = tree.find((t) => t.categoryKey === "SPARK & DATABRICKS");
    expect(sparkTopic).toBeDefined();
    expect(sparkTopic?.totalCount).toBe(1);

    const dbxTopic = tree.find((t) => t.categoryKey === "DATABRICKS");
    expect(dbxTopic).toBeDefined();
    expect(dbxTopic?.totalCount).toBe(1);
  });
});

describe("ConceptsMindmapView Component", () => {
  it("renders Mind Map title, stretch depth controls, and topic nodes", () => {
    render(<ConceptsMindmapView concepts={mockConcepts} />);

    expect(screen.getByText("Concepts Multi-Level Mind Map")).toBeDefined();
    expect(screen.getByText("Topics")).toBeDefined();
    expect(screen.getByText("Subtopics")).toBeDefined();
    expect(screen.getByText("Full Tree")).toBeDefined();
    expect(screen.getByText("Deep")).toBeDefined();

    // Check that Level 1 topics are rendered
    expect(screen.getByText("Microsoft Fabric")).toBeDefined();
    expect(screen.getByText("Apache Spark Core Engine")).toBeDefined();
    expect(screen.getByText("Databricks Lakehouse")).toBeDefined();
  });

  it("filters concepts via search bar input and highlights matching paths", () => {
    render(<ConceptsMindmapView concepts={mockConcepts} />);

    const searchInput = screen.getByPlaceholderText(/Search concepts across the multi-level tree/i);
    fireEvent.change(searchInput, { target: { value: "Liquid Clustering" } });

    // Should find Liquid Clustering
    expect(screen.getByText("Liquid Clustering")).toBeDefined();
  });

  it("opens Concept Detail Inspector when a concept node is clicked", () => {
    render(<ConceptsMindmapView concepts={mockConcepts} />);

    // Click on OneLake
    const onelakeNode = screen.getByText("OneLake");
    fireEvent.click(onelakeNode);

    // Inspector dialog should be displayed with title and definition
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(screen.getAllByRole("heading", { name: "OneLake" }).length).toBe(2);
    expect(screen.getByText("Official Definition")).toBeDefined();
    expect(screen.getAllByText("Unified logical data lake for the entire organization.").length).toBe(2);
    expect(screen.getByText("Practice in Q&A")).toBeDefined();

    // Close button should dismiss the inspector
    const closeBtn = screen.getByLabelText("Close Inspector");
    fireEvent.click(closeBtn);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("supports previous and next item navigation in focus mode via buttons and arrow keys", () => {
    render(<ConceptsMindmapView concepts={mockConcepts} />);

    // Click on OneLake (first concept in Fabric topic)
    const onelakeNode = screen.getByText("OneLake");
    fireEvent.click(onelakeNode);

    // Dialog should be open with OneLake
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(screen.getByText(/1 of 4/i)).toBeDefined();

    // The Previous buttons should be disabled on first item
    const prevIconBtn = screen.getByRole("button", { name: "Previous Concept" });
    expect((prevIconBtn as HTMLButtonElement).disabled).toBe(true);

    // Click Next button in footer
    const nextBtn = screen.getByRole("button", { name: "Next" });
    expect((nextBtn as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(nextBtn);

    // Should now show Direct Lake Mode (second concept)
    expect(screen.getByText(/2 of 4/i)).toBeDefined();
    expect(screen.getAllByRole("heading", { name: "Direct Lake Mode" }).length).toBeGreaterThan(0);

    // Navigate to next via keyboard ArrowRight
    fireEvent.keyDown(window, { key: "ArrowRight" });
    // Should now show Catalyst Optimizer (third concept)
    expect(screen.getByText(/3 of 4/i)).toBeDefined();
    expect(screen.getAllByRole("heading", { name: "Catalyst Optimizer" }).length).toBeGreaterThan(0);

    // Navigate back via keyboard ArrowLeft
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText(/2 of 4/i)).toBeDefined();
    expect(screen.getAllByRole("heading", { name: "Direct Lake Mode" }).length).toBeGreaterThan(0);

    // Navigate back to first via Prev button in footer
    const prevBtn = screen.getByRole("button", { name: "Prev" });
    fireEvent.click(prevBtn);
    expect(screen.getByText(/1 of 4/i)).toBeDefined();
    expect(screen.getAllByRole("heading", { name: "OneLake" }).length).toBeGreaterThan(0);

    // Press Escape to close modal
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("toggles stretch depth to Topics Only", () => {
    render(<ConceptsMindmapView concepts={mockConcepts} />);

    const l1Btn = screen.getByText("Topics");
    fireEvent.click(l1Btn);

    // In Topics mode, topic nodes are rendered, but concepts are collapsed
    expect(screen.getByText("Microsoft Fabric")).toBeDefined();
  });

  it("toggles stretch depth to Deep with inline mechanism", () => {
    render(<ConceptsMindmapView concepts={mockConcepts} />);

    const l4Btn = screen.getByText("Deep");
    fireEvent.click(l4Btn);

    // Deep mechanism preview should appear
    expect(screen.getAllByText("Deep Mechanism:").length).toBeGreaterThan(0);
  });
});
