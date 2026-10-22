import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET, POST } from "@/app/api/progress/route";
import { edgeCache } from "@/lib/redis";

describe("API Progress Security & Tamper Protection (BUG-03 / BUG-04)", () => {
  beforeEach(async () => {
    // Clear test keys
    await edgeCache.del("user_progress:usr_alice");
    await edgeCache.del("user_progress:usr_bob");
  });

  it("rejects unauthorized GET without credentials", async () => {
    const request = new Request("http://localhost:3000/api/progress?userId=usr_alice");
    const response = await GET(request);
    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Missing authorization credentials");
  });

  it("rejects GET with missing or short userId", async () => {
    const request = new Request("http://localhost:3000/api/progress?userId=ab");
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it("rejects unauthorized POST without credentials", async () => {
    const request = new Request("http://localhost:3000/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "usr_alice",
        progress: { xp: 100 },
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("allows owner to save progress with a Bearer token and retrieve it", async () => {
    const token = "secret_alice_token_12345";

    // 1. Initial write
    const postReq = new Request("http://localhost:3000/api/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: "usr_alice",
        progress: { xp: 500, tier: "Senior" },
      }),
    });

    const postRes = await POST(postReq);
    expect(postRes.status).toBe(200);
    const postData = await postRes.json();
    expect(postData.success).toBe(true);
    expect(postData.userId).toBe("usr_alice");

    // 2. Owner reads with same token
    const getReq = new Request("http://localhost:3000/api/progress?userId=usr_alice", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const getRes = await GET(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.success).toBe(true);
    expect(getData.data.xp).toBe(500);
    expect(getData.data.tier).toBe("Senior");
  });

  it("blocks attacker from reading another user's progress with a wrong token", async () => {
    const ownerToken = "secret_alice_token_12345";
    const attackerToken = "attacker_token_99999";

    // 1. Owner writes progress
    await POST(
      new Request("http://localhost:3000/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          userId: "usr_alice",
          progress: { xp: 1000 },
        }),
      })
    );

    // 2. Attacker attempts to read alice's progress
    const attackerGetReq = new Request("http://localhost:3000/api/progress?userId=usr_alice", {
      headers: {
        "Authorization": `Bearer ${attackerToken}`,
      },
    });

    const attackerGetRes = await GET(attackerGetReq);
    expect(attackerGetRes.status).toBe(403);
    const body = await attackerGetRes.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Invalid authorization token");
  });

  it("blocks attacker from overwriting another user's progress", async () => {
    const ownerToken = "secret_alice_token_12345";
    const attackerToken = "attacker_token_99999";

    // 1. Owner writes progress
    await POST(
      new Request("http://localhost:3000/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          userId: "usr_alice",
          progress: { xp: 1000 },
        }),
      })
    );

    // 2. Attacker attempts to overwrite alice's progress
    const overwriteReq = new Request("http://localhost:3000/api/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${attackerToken}`,
      },
      body: JSON.stringify({
        userId: "usr_alice",
        progress: { xp: 0, wiped: true },
      }),
    });

    const overwriteRes = await POST(overwriteReq);
    expect(overwriteRes.status).toBe(403);

    // 3. Verify original data was preserved
    const verifyReq = new Request("http://localhost:3000/api/progress?userId=usr_alice", {
      headers: {
        "Authorization": `Bearer ${ownerToken}`,
      },
    });
    const verifyRes = await GET(verifyReq);
    const verifyData = await verifyRes.json();
    expect(verifyData.data.xp).toBe(1000);
  });
});
