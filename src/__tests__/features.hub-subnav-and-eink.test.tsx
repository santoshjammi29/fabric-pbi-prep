import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { HubSubnav } from "@/components/layout/hub-subnav";
import { CodeBlock } from "@/components/ui/code-block";
import fs from "fs";
import path from "path";

// Mock next/navigation
let mockPathname = "/architecture";
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("HubSubnav & E-Ink Accessibility Suite", () => {
  beforeEach(() => {
    mockPathname = "/architecture";
    mockSearchParams = new URLSearchParams();
  });

  describe("HubSubnav Navigation Logic", () => {
    const archItems = [
      { label: "System Scenarios", href: "/architecture?tab=scenarios", badge: "3,124 Scenarios" },
      { label: "Whiteboard Blueprints", href: "/architecture?tab=diagrams", badge: "25+ Visuals" },
    ];

    it("activates System Scenarios by default when on /architecture without query parameters", () => {
      mockPathname = "/architecture";
      mockSearchParams = new URLSearchParams();

      render(<HubSubnav hubTitle="Architecture Hub" items={archItems} />);

      const scenariosLink = screen.getByRole("link", { name: /System Scenarios/i });
      const diagramsLink = screen.getByRole("link", { name: /Whiteboard Blueprints/i });

      expect(scenariosLink.className).toContain("hub-subnav-item-active");
      expect(diagramsLink.className).toContain("hub-subnav-item-idle");
    });

    it("activates Whiteboard Blueprints when ?tab=diagrams", () => {
      mockPathname = "/architecture";
      mockSearchParams = new URLSearchParams("tab=diagrams");

      render(<HubSubnav hubTitle="Architecture Hub" items={archItems} />);

      const scenariosLink = screen.getByRole("link", { name: /System Scenarios/i });
      const diagramsLink = screen.getByRole("link", { name: /Whiteboard Blueprints/i });

      expect(diagramsLink.className).toContain("hub-subnav-item-active");
      expect(scenariosLink.className).toContain("hub-subnav-item-idle");
    });

    it("activates PySpark by default on /code-practice and switches on ?db=sparksql", () => {
      const codeItems = [
        { label: "Production Cheat Sheet", href: "/cheat-sheet" },
        { label: "PySpark Drills", href: "/code-practice?db=pyspark" },
        { label: "Spark SQL Drills", href: "/code-practice?db=sparksql" },
      ];

      mockPathname = "/code-practice";
      mockSearchParams = new URLSearchParams();

      const { unmount } = render(<HubSubnav hubTitle="Code" items={codeItems} />);
      const pysparkLink = screen.getByRole("link", { name: /PySpark Drills/i });
      expect(pysparkLink.className).toContain("hub-subnav-item-active");
      unmount();

      mockSearchParams = new URLSearchParams("db=sparksql");
      render(<HubSubnav hubTitle="Code" items={codeItems} />);
      const sparkSqlLink = screen.getByRole("link", { name: /Spark SQL Drills/i });
      expect(sparkSqlLink.className).toContain("hub-subnav-item-active");
    });
  });

  describe("CodeBlock Semantic Class Structure", () => {
    it("renders code block with code-block-container and code-block-header", () => {
      const { container } = render(
        <CodeBlock code="df = spark.read.parquet('s3://data')" language="python" />
      );

      const codeContainer = container.querySelector(".code-block-container");
      expect(codeContainer).toBeTruthy();

      const header = container.querySelector(".code-block-header");
      expect(header).toBeTruthy();

      const pre = container.querySelector("pre.code-block");
      expect(pre).toBeTruthy();
    });

    it("wraps code lines by default across all pages", () => {
      const { container } = render(
        <CodeBlock
          code="df.with_columns(pl.col('sales').sum().over('region')).filter(pl.col('amount') > 1000)"
          language="python"
        />
      );

      const pre = container.querySelector("pre.code-block");
      expect(pre).toBeTruthy();
      expect(pre?.className).toContain("whitespace-pre-wrap");
      expect(pre?.className).toContain("break-words");

      const lineSpan = container.querySelector(".group\\/line span.flex-1");
      expect(lineSpan).toBeTruthy();
      expect(lineSpan?.className).toContain("whitespace-pre-wrap");
      expect(lineSpan?.className).toContain("min-w-0");
    });
  });

  describe("E-Ink CSS High Contrast Verification", () => {
    it("verifies globals.css includes high-contrast rules for .e-ink tokens", () => {
      const cssPath = path.resolve(__dirname, "../app/globals.css");
      const cssContent = fs.readFileSync(cssPath, "utf-8");

      // Verify E-Ink overrides for white/light slate text
      expect(cssContent).toContain(".e-ink .text-slate-100");
      expect(cssContent).toContain(".e-ink .text-slate-200");
      expect(cssContent).toContain(".e-ink .text-white");

      // Verify E-Ink pre token overrides
      expect(cssContent).toContain(".e-ink pre span.text-slate-100");
      expect(cssContent).toContain(".e-ink pre span.text-cyan-200");
      expect(cssContent).toContain(".e-ink pre span.text-sky-300");

      // Verify HubSubnav E-Ink active styles
      expect(cssContent).toContain(".e-ink .hub-subnav-item-active");
      expect(cssContent).toContain(".e-ink .code-block-container");
    });
  });
});
