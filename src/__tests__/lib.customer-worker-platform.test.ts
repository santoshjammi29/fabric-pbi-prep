import { describe, expect, it } from "vitest";
import {
  getTenantWorkerPrefix,
  getWorkerRuntimeUrl,
  getWorkerScriptName,
  parseDeploymentName,
} from "@/lib/customer-worker-platform";

describe("customer Worker platform helpers", () => {
  it("normalizes valid deployment names and rejects unsafe names", () => {
    expect(parseDeploymentName(" Hello-World ")).toBe("hello-world");
    expect(() => parseDeploymentName("../other-tenant")).toThrow();
    expect(() => parseDeploymentName("name_with_underscores")).toThrow();
    expect(() => parseDeploymentName("")).toThrow();
  });

  it("derives tenant-specific Worker names without exposing the account ID", () => {
    const first = getWorkerScriptName("user_123", "hello-world");
    const second = getWorkerScriptName("user_456", "hello-world");

    expect(first).toMatch(/^t-[a-f0-9]{24}-hello-world$/);
    expect(first).not.toContain("user_123");
    expect(first).not.toBe(second);
    expect(getTenantWorkerPrefix("user_123")).toBe(getTenantWorkerPrefix("user_123"));
    expect(getWorkerScriptName("user_123", "a".repeat(32))).toHaveLength(59);
  });

  it("builds an HTTPS runtime URL and replaces any configured path", () => {
    expect(getWorkerRuntimeUrl("https://runtime.example.com/base", "t-123-hello"))
      .toBe("https://runtime.example.com/run/t-123-hello");
    expect(() => getWorkerRuntimeUrl("http://runtime.example.com", "worker")).toThrow();
    expect(() => getWorkerRuntimeUrl("https://user:pass@example.com", "worker")).toThrow();
  });
});
