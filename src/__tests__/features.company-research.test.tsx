import { describe, it, expect } from "vitest";
import { companyProfiles } from "@/data";

describe("Company Research & Intel Data Quality", () => {
  it("should have at least 150 total company profiles loaded", () => {
    expect(companyProfiles.length).toBeGreaterThanOrEqual(150);
  });

  it("should have at least 50 companies under Tier 1 FAANG / BigTech", () => {
    const bigtech = companyProfiles.filter((c) => c.tier === "Tier 1 FAANG / BigTech");
    expect(bigtech.length).toBeGreaterThanOrEqual(50);
  });

  it("should have at least 50 companies under Tier 1 Global FinTech", () => {
    const fintech = companyProfiles.filter((c) => c.tier === "Tier 1 Global FinTech");
    expect(fintech.length).toBeGreaterThanOrEqual(50);
  });

  it("should have at least 50 companies under Global Capability Center (GCC)", () => {
    const gcc = companyProfiles.filter((c) => c.tier === "Global Capability Center (GCC)");
    expect(gcc.length).toBeGreaterThanOrEqual(50);
  });

  it("should have zero duplicate company IDs", () => {
    const ids = companyProfiles.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have valid required fields and non-empty metadata for every company", () => {
    companyProfiles.forEach((c) => {
      expect(c.id).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(["Tier 1 FAANG / BigTech", "Tier 1 Global FinTech", "Global Capability Center (GCC)"]).toContain(c.tier);
      expect(c.location).toBeTruthy();
      expect(c.topicKey).toBeTruthy();
      expect(c.seniorDeSalary).toBeTruthy();
      expect(c.architectSalary).toBeTruthy();
      expect(c.stack.length).toBeGreaterThanOrEqual(3);
      expect(c.interviewFocus.length).toBeGreaterThanOrEqual(3);
      expect(c.keyChallenges.length).toBeGreaterThan(10);
      expect(c.sampleQuestions && c.sampleQuestions.length).toBeGreaterThanOrEqual(2);
    });
  });
});
