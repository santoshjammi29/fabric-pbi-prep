/**
 * High-Performance Compute Web Worker
 * Offloads heavy mathematical, vector similarity (SIMD-unrolled cosine distance),
 * and Spark execution simulations off the main thread to ensure smooth 60fps rendering.
 */

export interface VectorBatchTask {
  type: "COSINE_DISTANCE_BATCH";
  queryVector: number[];
  corpusVectors: { id: string; vector: number[] }[];
  topK?: number;
}

export interface SparkSimTask {
  type: "SPARK_SIMULATION";
  heapGb: number;
  memoryFraction: number;
  storageFraction: number;
  inputDataGb: number;
  numPartitions: number;
  skewFactor: number;
  aqeEnabled: boolean;
  joinType: "narrow" | "wide" | "broadcast" | "aggregation";
}

export type WorkerTask = VectorBatchTask | SparkSimTask;

export interface SparkSimResult {
  executionPoolMb: number;
  storagePoolMb: number;
  reservedMemoryMb: number;
  userMemoryMb: number;
  shuffleReadMb: number;
  shuffleWriteMb: number;
  spillToDiskMb: number;
  optimizedPartitions: number;
  stagesCount: number;
  estimatedLatencyMs: number;
  skewRemediated: boolean;
  notes: string[];
}

export interface CosineDistanceResult {
  id: string;
  distance: number;
  similarity: number;
}

// SIMD-unrolled 4-way float cosine similarity
function computeCosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  const remainder = len % 4;
  const unrolledLen = len - remainder;

  for (let i = 0; i < unrolledLen; i += 4) {
    const a0 = a[i], b0 = b[i];
    const a1 = a[i+1], b1 = b[i+1];
    const a2 = a[i+2], b2 = b[i+2];
    const a3 = a[i+3], b3 = b[i+3];

    dotProduct += a0 * b0 + a1 * b1 + a2 * b2 + a3 * b3;
    normA += a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
    normB += b0 * b0 + b1 * b1 + b2 * b2 + b3 * b3;
  }

  for (let i = unrolledLen; i < len; i++) {
    const ai = a[i], bi = b[i];
    dotProduct += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Spark 4.0 Execution Simulation Logic
function runSparkSimulation(task: SparkSimTask): SparkSimResult {
  const totalHeapMb = task.heapGb * 1024;
  const reservedMemoryMb = 300; // Spark default reserved memory
  const usableMemoryMb = Math.max(0, totalHeapMb - reservedMemoryMb);
  
  const sparkMemoryMb = usableMemoryMb * task.memoryFraction;
  const userMemoryMb = usableMemoryMb * (1 - task.memoryFraction);
  
  const storagePoolMb = sparkMemoryMb * task.storageFraction;
  const executionPoolMb = sparkMemoryMb * (1 - task.storageFraction);

  const inputMb = task.inputDataGb * 1024;
  let stagesCount = 1;
  let shuffleWriteMb = 0;
  let shuffleReadMb = 0;
  let spillToDiskMb = 0;
  let optimizedPartitions = task.numPartitions;
  const notes: string[] = [];

  switch (task.joinType) {
    case "narrow":
      stagesCount = 1;
      shuffleWriteMb = 0;
      shuffleReadMb = 0;
      notes.push("Pipeline fully pipelined within 1 Stage via 1:1 narrow dependencies (e.g. map, filter).");
      break;
    case "broadcast":
      stagesCount = 1;
      shuffleWriteMb = inputMb * 0.05;
      shuffleReadMb = shuffleWriteMb * 4;
      notes.push("Broadcast Hash Join bypassed shuffle stage entirely. Small table copied to executors.");
      break;
    case "wide":
    case "aggregation":
      stagesCount = 2;
      shuffleWriteMb = inputMb * 0.85;
      shuffleReadMb = shuffleWriteMb;
      
      // Calculate spill to disk under memory pressure
      const partitionMemMb = shuffleWriteMb / task.numPartitions;
      if (partitionMemMb > (executionPoolMb / 4)) {
        spillToDiskMb = (partitionMemMb - (executionPoolMb / 4)) * task.numPartitions * 1.5;
        notes.push("⚠️ High memory pressure detected: Partition size exceeded executor thread memory, spilling to local NVMe.");
      }
      
      // AQE Dynamic Partition Coalescing
      if (task.aqeEnabled) {
        optimizedPartitions = Math.max(1, Math.round(shuffleWriteMb / 64)); // 64MB advisory target
        notes.push(`AQE Active: Dynamic Coalescing reduced partitions from ${task.numPartitions} to ${optimizedPartitions}.`);
      }
      break;
  }

  const skewRemediated = task.skewFactor > 2.0 && task.aqeEnabled;
  if (skewRemediated) {
    notes.push(`AQE Skew Join Optimization: Auto-split ${Math.round(task.skewFactor)} skewed partition slices into sub-tasks.`);
  }

  const estimatedLatencyMs = Math.round(
    (inputMb * 0.12) +
    (shuffleWriteMb * 0.25) +
    (spillToDiskMb * 0.85) / Math.max(1, optimizedPartitions)
  );

  return {
    executionPoolMb: Math.round(executionPoolMb),
    storagePoolMb: Math.round(storagePoolMb),
    reservedMemoryMb,
    userMemoryMb: Math.round(userMemoryMb),
    shuffleReadMb: Math.round(shuffleReadMb),
    shuffleWriteMb: Math.round(shuffleWriteMb),
    spillToDiskMb: Math.round(spillToDiskMb),
    optimizedPartitions,
    stagesCount,
    estimatedLatencyMs,
    skewRemediated,
    notes,
  };
}

// Worker message router
if (typeof self !== "undefined") {
  self.onmessage = (e: MessageEvent<{ id: string; task: WorkerTask }>) => {
    const { id, task } = e.data;

    if (task.type === "COSINE_DISTANCE_BATCH") {
      const qVec = new Float32Array(task.queryVector);
      const results: CosineDistanceResult[] = [];

      for (const item of task.corpusVectors) {
        const cVec = new Float32Array(item.vector);
        const sim = computeCosineSimilarity(qVec, cVec);
        results.push({
          id: item.id,
          similarity: sim,
          distance: 1 - sim,
        });
      }

      results.sort((a, b) => b.similarity - a.similarity);
      const topK = task.topK ? results.slice(0, task.topK) : results;
      self.postMessage({ id, success: true, result: topK });
    } else if (task.type === "SPARK_SIMULATION") {
      const result = runSparkSimulation(task);
      self.postMessage({ id, success: true, result });
    }
  };
}

// Export for direct in-process fallback in non-worker environments (SSR / Vitest)
export { computeCosineSimilarity, runSparkSimulation };
