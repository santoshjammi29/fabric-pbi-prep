// @vitest-environment node
import { describe, it, expect } from "vitest";
import { GET, OPTIONS } from "@/app/api/artifacts/[...path]/route";
import { NextRequest } from "next/server";

describe("Artifacts API CORS Restrictions (BUG-17)", () => {
  it("blocks or denies wildcard origin on unauthorized origins", async () => {
    const request = new NextRequest(
      new Request("http://localhost:3000/api/artifacts/manifest.json", {
        headers: {
          origin: "https://evil-hacker.com",
        },
      })
    );

    const response = await GET(request, {
      params: Promise.resolve({ path: ["manifest.json"] }),
    });

    const allowOrigin = response.headers.get("Access-Control-Allow-Origin");
    expect(allowOrigin).toBeNull();
    expect(allowOrigin).not.toBe("*");
  });

  it("reflects allowed origins for lakehousearchitect.com", async () => {
    const request = new NextRequest(
      new Request("http://localhost:3000/api/artifacts/manifest.json", {
        headers: {
          origin: "https://lakehousearchitect.com",
        },
      })
    );

    const response = await GET(request, {
      params: Promise.resolve({ path: ["manifest.json"] }),
    });

    const allowOrigin = response.headers.get("Access-Control-Allow-Origin");
    if (response.status === 200) {
      expect(allowOrigin).toBe("https://lakehousearchitect.com");
      expect(response.headers.get("Vary")).toBe("Origin");
    }
  });

  it("handles OPTIONS preflight for allowed origins", async () => {
    const request = new NextRequest(
      new Request("http://localhost:3000/api/artifacts/manifest.json", {
        method: "OPTIONS",
        headers: {
          origin: "https://lakehousearchitect.com",
        },
      })
    );

    const response = await OPTIONS(request);
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://lakehousearchitect.com");
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain("GET");
  });
});
