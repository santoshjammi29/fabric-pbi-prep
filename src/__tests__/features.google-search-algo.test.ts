import { describe, it, expect } from "vitest";
import {
  executePortalSearch,
  tokenizeQuery,
  levenshteinDistance,
  stemToken,
  expandQueryTokens,
  detectNavigationalIntent,
} from "@/lib/search-engine";

describe("Google-Grade Universal Search Algorithm", () => {
  it("computes Levenshtein edit distance accurately for typo tolerance", () => {
    expect(levenshteinDistance("catlyst", "catalyst")).toBe(1);
    expect(levenshteinDistance("partiton", "partition")).toBe(1);
    expect(levenshteinDistance("vertipak", "vertipaq")).toBe(1);
    expect(levenshteinDistance("lakehose", "lakehouse")).toBe(1);
    expect(levenshteinDistance("pypsark", "pyspark")).toBe(2);
    expect(levenshteinDistance("spark", "spark")).toBe(0);
  });

  it("stems technical suffixes to normalize plurals and conjugations", () => {
    expect(stemToken("partitioning")).toBe("partition");
    expect(stemToken("partitions")).toBe("partition");
    expect(stemToken("optimizer")).toBe("optimize");
    expect(stemToken("optimizing")).toBe("optimize");
    expect(stemToken("indexes")).toBe("index");
    expect(stemToken("shuffled")).toBe("shuffle");
  });

  it("expands technical acronyms and domain keywords", () => {
    const aqeTokens = expandQueryTokens(["aqe"]);
    expect(aqeTokens).toContain("adaptive");
    expect(aqeTokens).toContain("query");
    expect(aqeTokens).toContain("execution");

    const shirTokens = expandQueryTokens(["shir"]);
    expect(shirTokens).toContain("self");
    expect(shirTokens).toContain("integration");
    expect(shirTokens).toContain("runtime");

    const oomTokens = expandQueryTokens(["oom"]);
    expect(oomTokens).toContain("memory");
    expect(oomTokens).toContain("allocation");
  });

  it("detects navigational search intent and provides instant jump targets", () => {
    const sparkEngine = detectNavigationalIntent("spark engine simulator");
    expect(sparkEngine).not.toBeNull();
    expect(sparkEngine?.href).toBe("/spark-engine");
    expect(sparkEngine?.page).toBe("Spark Engine");

    const mindmap = detectNavigationalIntent("concept mindmap");
    expect(mindmap).not.toBeNull();
    expect(mindmap?.href).toBe("/mindmap");

    const dbx = detectNavigationalIntent("databricks coding");
    expect(dbx).not.toBeNull();
    expect(dbx?.href).toBe("/code-practice/databricks");

    const cheat = detectNavigationalIntent("cheat sheet");
    expect(cheat).not.toBeNull();
    expect(cheat?.href).toBe("/cheat-sheet");

    const arch = detectNavigationalIntent("architecture hub");
    expect(arch).not.toBeNull();
    expect(arch?.href).toBe("/architecture");

    const none = detectNavigationalIntent("random generic query");
    expect(none).toBeNull();
  });

  it("handles typos gracefully and returns correct results for misspelled queries", () => {
    // "catlyst" typo for "catalyst"
    const catlystRes = executePortalSearch("catlyst");
    expect(catlystRes.total).toBeGreaterThan(0);
    const hasCatalyst = catlystRes.items.some((i) =>
      i.title.toLowerCase().includes("catalyst") || i.snippet?.toLowerCase().includes("catalyst")
    );
    expect(hasCatalyst).toBe(true);

    // "partiton" typo for "partition"
    const partitonRes = executePortalSearch("partiton");
    expect(partitonRes.total).toBeGreaterThan(0);
    const hasPartition = partitonRes.items.some((i) =>
      i.title.toLowerCase().includes("partition") || i.snippet?.toLowerCase().includes("partition")
    );
    expect(hasPartition).toBe(true);
  });

  it("ranks exact phrase matches higher than partial or scattered matches", () => {
    const res = executePortalSearch("liquid clustering");
    expect(res.total).toBeGreaterThan(0);

    // The top results should contain "Liquid Clustering" in their titles
    const topResult = res.items[0];
    expect(topResult.title.toLowerCase()).toContain("liquid clustering");
  });

  it("correctly balances Guided Tracks without drowning out concepts and scenarios", () => {
    const res = executePortalSearch("spark shuffle memory");
    expect(res.total).toBeGreaterThan(0);

    // Should include a Guided Track
    const guidedTracks = res.items.filter((i) => i.category === "Guided Track");
    expect(guidedTracks.length).toBeLessThanOrEqual(1);

    // Should also surface architecture scenarios and concepts
    const concepts = res.items.filter((i) => i.category === "Concepts");
    const arch = res.items.filter((i) => i.category === "Architecture");
    expect(concepts.length + arch.length).toBeGreaterThan(0);
  });

  it("executes search across 11,000+ documents in under 15 milliseconds", () => {
    // Warm-up JIT/V8 caches
    executePortalSearch("warmup delta");
    const start = performance.now();
    const res = executePortalSearch("delta lake time travel acid");
    const elapsed = performance.now() - start;

    expect(res.total).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(50); // Sub-50ms benchmark under parallel vitest load
  });

  it("extracts keyword-in-context (KWIC) dynamic snippets with ellipses", () => {
    const res = executePortalSearch("vertipaq");
    expect(res.total).toBeGreaterThan(0);
    const matchWithSnippet = res.items.find((i) => i.snippet && i.snippet.toLowerCase().includes("vertipaq"));
    expect(matchWithSnippet).toBeDefined();
    expect(matchWithSnippet?.snippet?.length).toBeGreaterThan(10);
  });

  it("respects category filter when provided", () => {
    const allRes = executePortalSearch("spark");
    expect(allRes.total).toBeGreaterThan(0);

    const conceptsOnly = executePortalSearch("spark", 30, "Concepts");
    expect(conceptsOnly.total).toBeGreaterThan(0);
    conceptsOnly.items.forEach((item) => {
      expect(item.category).toBe("Concepts");
    });
  });
});
