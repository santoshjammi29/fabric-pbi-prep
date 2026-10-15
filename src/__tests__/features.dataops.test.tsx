import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { dataOpsData } from "@/data";
import { getDataOpsDataDAL } from "@/lib/dal";
import { DataOpsClient } from "@/app/dataops/dataops-client";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe("DataOps Data Integrity & DAL", () => {
  it("dataOpsData dataset is complete and well-formed", () => {
    expect(dataOpsData).toBeDefined();
    expect(Array.isArray(dataOpsData.connectivity)).toBe(true);
    expect(dataOpsData.connectivity.length).toBeGreaterThanOrEqual(5);

    expect(Array.isArray(dataOpsData.cicdAlternatives)).toBe(true);
    expect(dataOpsData.cicdAlternatives.length).toBeGreaterThanOrEqual(4);

    expect(Array.isArray(dataOpsData.lifecycleStages)).toBe(true);
    expect(dataOpsData.lifecycleStages.length).toBe(6);
  });

  it("every connectivity item has required fields and unique id", () => {
    const ids = new Set<string>();
    dataOpsData.connectivity.forEach((item) => {
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);
      expect(item.sourceTool).toBeTruthy();
      expect(item.targetTool).toBeTruthy();
      expect(item.connectionProtocol).toBeTruthy();
      expect(item.authMethod).toBeTruthy();
      expect(item.configSnippet).toBeTruthy();
      expect(item.setupSteps.length).toBeGreaterThan(0);
      expect(item.securityPitfalls.length).toBeGreaterThan(0);
      expect(item.interviewDefenseTip).toBeTruthy();
      expect(item.tags.length).toBeGreaterThan(0);
    });
  });

  it("every CI/CD alternative has valid pros, cons, and workflow code", () => {
    const ids = new Set<string>();
    dataOpsData.cicdAlternatives.forEach((item) => {
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);
      expect(item.name).toBeTruthy();
      expect(item.category).toBeTruthy();
      expect(item.recommendedApproach).toBeTruthy();
      expect(item.legacyOrAlternative).toBeTruthy();
      expect(item.pros.length).toBeGreaterThan(0);
      expect(item.cons.length).toBeGreaterThan(0);
      expect(item.workflowYaml).toBeTruthy();
      expect(item.interviewSoundbite).toBeTruthy();
    });
  });

  it("lifecycle stages are sequential 1 through 6 with complete deliverables", () => {
    expect(dataOpsData.lifecycleStages.map((s) => s.stageNumber)).toEqual([1, 2, 3, 4, 5, 6]);
    dataOpsData.lifecycleStages.forEach((stage) => {
      expect(stage.stageName).toBeTruthy();
      expect(stage.objective).toBeTruthy();
      expect(stage.keyArchitecturalDecisions.length).toBeGreaterThan(0);
      expect(stage.primaryTools.length).toBeGreaterThan(0);
      expect(stage.concreteDeliverables.length).toBeGreaterThan(0);
      expect(stage.gatekeeperChecklist.length).toBeGreaterThan(0);
      expect(stage.interviewExplanationScript).toBeTruthy();
      expect(stage.commonFailureModes.length).toBeGreaterThan(0);
    });
  });

  it("getDataOpsDataDAL returns dataOpsData", async () => {
    const dalData = await getDataOpsDataDAL();
    expect(dalData).toBeDefined();
    expect(dalData.connectivity.length).toBe(dataOpsData.connectivity.length);
    expect(dalData.cicdAlternatives.length).toBe(dataOpsData.cicdAlternatives.length);
    expect(dalData.lifecycleStages.length).toBe(6);
  });
});

describe("DataOpsClient Component", () => {
  it("renders page header and tabs correctly", () => {
    render(<DataOpsClient initialData={dataOpsData} />);

    expect(
      screen.getByText(/Tool Connectivity, CI\/CD Alternatives & E2E Lifecycle/i)
    ).toBeDefined();
    expect(screen.getByText(/1\. Tool Connectivity & Secrets/i)).toBeDefined();
    expect(screen.getByText(/2\. CI\/CD Alternatives & Pipelines/i)).toBeDefined();
    expect(screen.getByText(/3\. End-to-End Project Lifecycle/i)).toBeDefined();
    expect(screen.getByText(/4\. Interactive Architecture Diagram/i)).toBeDefined();
  });

  it("renders connectivity items by default and allows search filtering", () => {
    render(<DataOpsClient initialData={dataOpsData} />);

    // Default tab is connectivity
    const adfMatches = screen.getAllByText(/ADF/i);
    expect(adfMatches.length).toBeGreaterThan(0);
    expect(adfMatches[0]).toBeDefined();

    const searchInput = screen.getByPlaceholderText(/Search connectivity/i);
    fireEvent.change(searchInput, { target: { value: "Airflow" } });

    // Should match Airflow connectivity items
    const airflowMatches = screen.getAllByText(/Apache Airflow/i);
    expect(airflowMatches.length).toBeGreaterThan(0);
    expect(airflowMatches[0]).toBeDefined();
  });

  it("switches to CI/CD alternatives tab and displays blueprints", () => {
    render(<DataOpsClient initialData={dataOpsData} />);

    const cicdTabButton = screen.getByText(/2\. CI\/CD Alternatives & Pipelines/i);
    fireEvent.click(cicdTabButton);

    const matches = screen.getAllByText(/Databricks Asset Bundles/i);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]).toBeDefined();
  });

  it("switches to End-to-End Lifecycle tab and steps through stages", () => {
    render(<DataOpsClient initialData={dataOpsData} />);

    const lifecycleTabButton = screen.getByText(/3\. End-to-End Project Lifecycle/i);
    fireEvent.click(lifecycleTabButton);

    const stageMatches = screen.getAllByText(/Architecture Inception/i);
    expect(stageMatches.length).toBeGreaterThan(0);
    expect(stageMatches[0]).toBeDefined();

    const nextButton = screen.getByText(/Next Stage →/i);
    fireEvent.click(nextButton);

    const nextStageMatches = screen.getAllByText(/Ingestion & Landing Zone/i);
    expect(nextStageMatches.length).toBeGreaterThan(0);
    expect(nextStageMatches[0]).toBeDefined();
  });

  it("switches to Interactive Architecture Diagram tab and displays legend", () => {
    render(<DataOpsClient initialData={dataOpsData} />);

    const diagramTabButton = screen.getByText(/4\. Interactive Architecture Diagram/i);
    fireEvent.click(diagramTabButton);

    const legendMatches = screen.getAllByText(/Visual Hierarchy/i);
    expect(legendMatches.length).toBeGreaterThan(0);
    expect(legendMatches[0]).toBeDefined();

    expect(
      screen.getByText(/Red: Schedulers & Compute \(Airflow, Databricks, Spark\)/i)
    ).toBeDefined();
  });
});
