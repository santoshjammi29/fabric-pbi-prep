import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

export function ContinueLearning() {
  const progress = 42;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 space-y-3 w-full">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
            <BookOpen className="h-4 w-4" />
            Continue Learning
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Key Concepts: Lakehouse vs Data Warehouse
          </h3>
          <div className="flex items-center gap-4 w-full max-w-md">
            <div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {progress}%
            </span>
          </div>
        </div>
        
        <Link
          href="/concepts"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 w-full sm:w-auto"
        >
          Resume Learning
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
