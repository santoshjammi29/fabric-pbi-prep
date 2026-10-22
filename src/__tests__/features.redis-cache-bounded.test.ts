import { describe, it, expect, beforeEach } from "vitest";
import { edgeCache } from "@/lib/redis";

describe("FallbackEdgeStore Bounded Cache & LRU Eviction (BUG-27)", () => {
  it("bounds memory by evicting oldest entries when reaching capacity limit", async () => {
    // Write 520 items (limit is 500)
    for (let i = 0; i < 520; i++) {
      await edgeCache.set(`key_${i}`, { data: `value_${i}` });
    }

    // Earliest entries (e.g. key_0, key_1) should have been evicted
    const val0 = await edgeCache.get("key_0");
    const val1 = await edgeCache.get("key_1");
    expect(val0).toBeNull();
    expect(val1).toBeNull();

    // Latest entries should exist
    const val519 = await edgeCache.get("key_519");
    expect(val519).toEqual({ data: "value_519" });
  });

  it("handles key expiration properly without leaking memory", async () => {
    // Set with 1-second TTL
    await edgeCache.set("temp_key", "temporary_value", { ex: 1 });
    const immediate = await edgeCache.get("temp_key");
    expect(immediate).toBe("temporary_value");

    // Wait 1.1s for expiration
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const expired = await edgeCache.get("temp_key");
    expect(expired).toBeNull();
  });
});
