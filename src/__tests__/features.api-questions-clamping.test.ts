import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/questions/route";

describe("/api/questions Parameter Clamping & DoS Mitigation (NEW-BUG-03)", () => {
  it("strictly clamps excessively large limits to 100", async () => {
    const request = new Request("http://localhost:3000/api/questions?limit=9999999");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.limit).toBe(100);
    expect(body.data.length).toBeLessThanOrEqual(100);
  });

  it("handles negative and zero limits by falling back to default 25", async () => {
    const reqZero = new Request("http://localhost:3000/api/questions?limit=0");
    const resZero = await GET(reqZero);
    const bodyZero = await resZero.json();
    expect(bodyZero.limit).toBe(25);

    const reqNeg = new Request("http://localhost:3000/api/questions?limit=-50");
    const resNeg = await GET(reqNeg);
    const bodyNeg = await resNeg.json();
    expect(bodyNeg.limit).toBe(25);
  });

  it("handles NaN and non-numeric limits gracefully", async () => {
    const request = new Request("http://localhost:3000/api/questions?limit=abc");
    const response = await GET(request);
    const body = await response.json();
    expect(body.limit).toBe(25);
  });

  it("clamps invalid or negative page numbers to 1", async () => {
    const request = new Request("http://localhost:3000/api/questions?page=-10");
    const response = await GET(request);
    const body = await response.json();
    expect(body.page).toBe(1);
  });
});
