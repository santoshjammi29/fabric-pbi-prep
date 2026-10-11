"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  WorkerTask,
  SparkSimTask,
  SparkSimResult,
  VectorBatchTask,
  CosineDistanceResult,
  runSparkSimulation,
  computeCosineSimilarity,
} from "@/workers/compute.worker";

/**
 * Universal Compute Offloading Hook
 * Seamlessly routes heavy computations to background Web Workers
 * with zero main thread UI blocking, falling back to direct computation
 * in SSR / headless test environments.
 */
export function useComputeWorker() {
  const workerRef = useRef<Worker | null>(null);
  const callbacksRef = useRef<Map<string, { resolve: (val: any) => void; reject: (err: any) => void }>>(new Map());
  const [isComputing, setIsComputing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof Worker === "undefined") {
      return;
    }

    try {
      // Initialize Web Worker using standard Webpack/Next.js worker syntax
      const worker = new Worker(new URL("../workers/compute.worker.ts", import.meta.url), {
        type: "module",
      });

      worker.onmessage = (e: MessageEvent<{ id: string; success: boolean; result?: any; error?: string }>) => {
        const { id, success, result, error } = e.data;
        const cb = callbacksRef.current.get(id);
        if (cb) {
          callbacksRef.current.delete(id);
          if (success) {
            cb.resolve(result);
          } else {
            cb.reject(new Error(error || "Worker computation failed"));
          }
        }
        if (callbacksRef.current.size === 0) {
          setIsComputing(false);
        }
      };

      worker.onerror = (err) => {
        console.warn("Compute worker error, fallback engaged:", err);
      };

      workerRef.current = worker;

      return () => {
        worker.terminate();
        workerRef.current = null;
      };
    } catch (err) {
      console.warn("Could not instantiate Web Worker, using synchronous fallback:", err);
    }
  }, []);

  const runTask = useCallback(async <T = any>(task: WorkerTask): Promise<T> => {
    setIsComputing(true);

    // Fallback if worker not available
    if (!workerRef.current) {
      setIsComputing(false);
      if (task.type === "SPARK_SIMULATION") {
        return runSparkSimulation(task) as unknown as T;
      }
      if (task.type === "COSINE_DISTANCE_BATCH") {
        const qVec = new Float32Array(task.queryVector);
        const results: CosineDistanceResult[] = [];
        for (const item of task.corpusVectors) {
          const cVec = new Float32Array(item.vector);
          const sim = computeCosineSimilarity(qVec, cVec);
          results.push({ id: item.id, similarity: sim, distance: 1 - sim });
        }
        results.sort((a, b) => b.similarity - a.similarity);
        return (task.topK ? results.slice(0, task.topK) : results) as unknown as T;
      }
      throw new Error("Unsupported task");
    }

    return new Promise<T>((resolve, reject) => {
      const taskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      callbacksRef.current.set(taskId, { resolve, reject });
      workerRef.current?.postMessage({ id: taskId, task });
    });
  }, []);

  const simulateSpark = useCallback(
    async (params: Omit<SparkSimTask, "type">): Promise<SparkSimResult> => {
      return runTask<SparkSimResult>({
        type: "SPARK_SIMULATION",
        ...params,
      });
    },
    [runTask]
  );

  const calculateCosineDistanceBatch = useCallback(
    async (params: Omit<VectorBatchTask, "type">): Promise<CosineDistanceResult[]> => {
      return runTask<CosineDistanceResult[]>({
        type: "COSINE_DISTANCE_BATCH",
        ...params,
      });
    },
    [runTask]
  );

  return {
    isComputing,
    simulateSpark,
    calculateCosineDistanceBatch,
  };
}
