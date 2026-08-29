"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb } from "lucide-react";

const TIPS = [
  "Use Delta Lake's OPTIMIZE command with Z-ORDER to group related information in the same set of files, speeding up queries.",
  "In Azure Databricks, prefer cluster pools to reduce cluster start times and save costs on idle resources.",
  "When designing a Lakehouse, use Medallion Architecture (Bronze, Silver, Gold) to progressively refine data quality.",
  "Use COPY INTO in Databricks for incremental data loading; it's often simpler and cheaper than Auto Loader for simple use cases.",
  "For Power BI PL-300: Always aim to push data transformations upstream to the data warehouse/lakehouse rather than Power Query.",
  "Fabric DP-600: Direct Lake mode in Power BI unlocks the performance of Import mode without copying data.",
  "Spark Engine: Avoid using count() in production code for checking if a dataframe is empty, use isEmpty or limit(1).",
  "Partition your data based on frequently filtered columns, but avoid over-partitioning to prevent the 'small files problem'.",
  "Use Spark structured streaming with trigger once/available-now for cost-effective incremental processing.",
  "When using Azure Data Factory, use the Copy Activity's degree of copy parallelism to maximize throughput.",
];

export function TipOfDay() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTip = () => {
    setCurrentIndex((prev) => (prev + 1) % TIPS.length);
  };

  return (
    <div
      onClick={nextTip}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-amber-200/50 dark:border-amber-900/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-6 transition-all hover:shadow-md h-full flex flex-col justify-center"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/50 p-3 text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-110 group-hover:rotate-12">
          <Lightbulb className="h-6 w-6" />
        </div>
        <div className="flex-1 space-y-2 overflow-hidden">
          <h3 className="font-semibold text-amber-900 dark:text-amber-300">
            Data Architect Pro Tip of the Day
          </h3>
          <div className="relative min-h-[4rem] flex items-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-amber-800/80 dark:text-amber-200/80 leading-relaxed m-0"
              >
                {TIPS[currentIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
