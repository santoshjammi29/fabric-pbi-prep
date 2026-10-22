import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DatabricksCodingClient } from "@/app/code-practice/databricks/databricks-coding-client";
import { databricksCheatsheetData, databricks100Data } from "@/data";
import { NAV_GROUPS, ALL_FLAT_PAGES_AND_SUBPAGES } from "@/data/navigation-data";

vi.mock("next/navigation", () => ({
  usePathname: () => "/code-practice/databricks",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("Databricks Polyglot Coding Subpage (/code-practice/databricks)", () => {
  it("verifies navigation catalog includes the databricks coding subpage", () => {
    const codePracticeItem = NAV_GROUPS.flatMap((g) => g.items).find(
      (item) => item.href === "/code-practice"
    );
    expect(codePracticeItem).toBeDefined();
    const subHrefs = codePracticeItem?.subItems?.map((s) => s.href) || [];
    expect(subHrefs).toContain("/code-practice/databricks");

    const flatSubpage = ALL_FLAT_PAGES_AND_SUBPAGES.find(
      (p) => p.href === "/code-practice/databricks"
    );
    expect(flatSubpage).toBeDefined();
    expect(flatSubpage?.category).toBe("Coding");
  });

  it("renders DatabricksCodingClient with 148+ total operations and hub title", () => {
    render(
      <DatabricksCodingClient
        suiteData={databricksCheatsheetData}
        operationsData={databricks100Data}
      />
    );

    expect(screen.getByText("Databricks Polyglot Coding Hub")).toBeDefined();
    expect(screen.getByText(/48 Cheatsheet Cards/i)).toBeDefined();
    expect(screen.getByText(/100 Architecture Ops/i)).toBeDefined();
    expect(screen.getByText(/Download Master PDF/i)).toBeDefined();
  });

  it("renders production memory triage playbooks (OOM, Spill, Skew)", () => {
    render(
      <DatabricksCodingClient
        suiteData={databricksCheatsheetData}
        operationsData={databricks100Data}
      />
    );

    expect(
      screen.getByText(/Driver OOM: Heap Space Exhaustion on collect/i)
    ).toBeDefined();
    expect(
      screen.getByText(/Executor OOM & Container Killed/i)
    ).toBeDefined();
    expect(
      screen.getByText(/Shuffle Spill to Disk & Memory/i)
    ).toBeDefined();
    expect(
      screen.getByText(/Data Skew & Straggler Tasks/i)
    ).toBeDefined();
  });

  it("renders DBFS, Volumes & Secret operation commands", () => {
    render(
      <DatabricksCodingClient
        suiteData={databricksCheatsheetData}
        operationsData={databricks100Data}
      />
    );

    expect(
      screen.getByText(/Directory Listing with Metadata Extraction/i)
    ).toBeDefined();
    expect(
      screen.getByText(/Secure Secret Vault Retrieval/i)
    ).toBeDefined();
  });

  it("allows searching and filtering across Databricks operations", () => {
    render(
      <DatabricksCodingClient
        suiteData={databricksCheatsheetData}
        operationsData={databricks100Data}
      />
    );

    const input = screen.getByPlaceholderText(/Search Databricks operations/i);
    expect(input).toBeDefined();

    fireEvent.change(input, { target: { value: "Liquid" } });
    expect(screen.getAllByText(/Liquid/i).length).toBeGreaterThanOrEqual(1);
  });
});
