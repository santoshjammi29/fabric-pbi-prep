import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MindmapClient } from "@/app/mindmap/mindmap-client";
import { Concept } from "@/types/data";

const sampleConcepts: Concept[] = [
  {
    id: "test-onelake",
    term: "OneLake",
    category: "FABRIC",
    difficulty: "EASY",
    definition: "Unified data lake for Fabric.",
    explanation: "OneLake acts as the OneDrive for data.",
    keyPoints: ["Built on ADLS Gen2"],
  },
  {
    id: "test-spark",
    term: "Catalyst Optimizer",
    category: "SPARK & DATABRICKS",
    difficulty: "HARD",
    definition: "Query optimizer for Spark.",
    explanation: "Optimizes execution plans dynamically.",
    keyPoints: ["Rule-based and cost-based"],
  },
];

describe("Mindmap Dedicated Page (/mindmap)", () => {
  it("renders the MindmapClient page with header and multi-level mind map", () => {
    render(<MindmapClient concepts={sampleConcepts} />);

    // Header checks
    expect(screen.getByText("Enterprise Data Platform Concepts Mind Map")).toBeDefined();
    expect(screen.getByText(/2 architectural concepts/i)).toBeDefined();

    // Navigation action checks
    expect(screen.getByText("Glossary List View")).toBeDefined();
    expect(screen.getByText("Interview Q&A Bank")).toBeDefined();

    // Integrated Mind Map component checks
    expect(screen.getByText("Concepts Multi-Level Mind Map")).toBeDefined();
    expect(screen.getByText("Microsoft Fabric")).toBeDefined();
    expect(screen.getByText("Apache Spark Core Engine")).toBeDefined();
  });
});
