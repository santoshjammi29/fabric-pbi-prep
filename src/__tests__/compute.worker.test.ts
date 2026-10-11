import { describe, it, expect } from "vitest";
import {
  computeCosineSimilarity,
  runSparkSimulation,
  SparkSimTask,
} from "@/workers/compute.worker";

describe("Compute Worker & SIMD Offload Engine", () => {
  it("computes exact cosine similarity and distance using SIMD loop unrolling", () => {
    // Identical vectors -> similarity = 1.0, distance = 0.0
    const v1 = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const v2 = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const sim = computeCosineSimilarity(v1, v2);
    expect(sim).toBeCloseTo(1.0, 5);
    expect(1 - sim).toBeCloseTo(0.0, 5);

    // Orthogonal vectors -> similarity = 0.0, distance = 1.0
    const v3 = new Float32Array([1, 0, 0, 0]);
    const v4 = new Float32Array([0, 1, 0, 0]);
    const simOrthogonal = computeCosineSimilarity(v3, v4);
    expect(simOrthogonal).toBeCloseTo(0.0, 5);
    expect(1 - simOrthogonal).toBeCloseTo(1.0, 5);

    // High-dimensional vector (1536 dimensions as in modern embedding models)
    const dim = 1536;
    const highDimA = new Float32Array(dim);
    const highDimB = new Float32Array(dim);
    for (let i = 0; i < dim; i++) {
      highDimA[i] = Math.sin(i);
      highDimB[i] = Math.cos(i);
    }
    const highDimSim = computeCosineSimilarity(highDimA, highDimB);
    expect(typeof highDimSim).toBe("number");
    expect(highDimSim).toBeGreaterThan(-1.0);
    expect(highDimSim).toBeLessThan(1.0);
  });

  it("accurately simulates Spark 4.0 execution DAG and memory geometry", () => {
    const task: SparkSimTask = {
      type: "SPARK_SIMULATION",
      heapGb: 32,
      memoryFraction: 0.6,
      storageFraction: 0.5,
      inputDataGb: 200,
      numPartitions: 200,
      skewFactor: 4.5,
      aqeEnabled: true,
      joinType: "wide",
    };

    const result = runSparkSimulation(task);

    expect(result.stagesCount).toBe(2);
    expect(result.executionPoolMb).toBeGreaterThan(0);
    expect(result.storagePoolMb).toBeGreaterThan(0);
    expect(result.reservedMemoryMb).toBe(300);
    expect(result.skewRemediated).toBe(true);
    expect(result.notes.some((n) => n.includes("AQE"))).toBe(true);
  });
});
