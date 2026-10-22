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

  it("blocks path traversal attacks attempting to escape base dir (NEW-BUG-04)", async () => {
    // 1. Direct parent directory traversal attempt
    const traversalReq1 = new NextRequest(
      new Request("http://localhost:3000/api/artifacts/../../package.json")
    );
    const res1 = await GET(traversalReq1, {
      params: Promise.resolve({ path: ["..", "..", "package.json"] }),
    });
    expect(res1.status).toBe(400);
    const body1 = await res1.json();
    expect(body1.error).toContain("Path traversal");

    // 2. Encoded dot-dot-slash attempt
    const traversalReq2 = new NextRequest(
      new Request("http://localhost:3000/api/artifacts/%2e%2e/%2e%2e/package.json")
    );
    const res2 = await GET(traversalReq2, {
      params: Promise.resolve({ path: ["%2e%2e", "%2e%2e", "package.json"] }),
    });
    expect(res2.status).toBe(400);

    // 3. Absolute path injection attempt
    const traversalReq3 = new NextRequest(
      new Request("http://localhost:3000/api/artifacts/etc/passwd")
    );
    const res3 = await GET(traversalReq3, {
      params: Promise.resolve({ path: ["..", "etc", "passwd"] }),
    });
    expect(res3.status).toBe(400);
  });
});
