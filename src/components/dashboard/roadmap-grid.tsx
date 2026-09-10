import Link from "next/link";
import { ArrowRight, BookOpen, FileCode2, Zap, Cloud, MessageSquare, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const difficultyColors = {
  Easy: "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40 border-green-200 dark:border-green-800",
  Medium: "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800",
  Hard: "text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/40 border-orange-200 dark:border-orange-800",
  Architect: "text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800",
};

export function RoadmapGrid() {
  const steps = [
    {
      step: 1,
      difficulty: "Easy",
      title: "Key Concepts",
      description: "Foundational definitions and core data engineering principles.",
      meta: "112+ concepts",
      icon: BookOpen,
      href: "/concepts",
    },
    {
      step: 2,
      difficulty: "Medium",
      title: "Code Practice",
      description: "Hands-on polyglot syntax for Python, Scala, SQL.",
      meta: "120+ sheets",
      icon: FileCode2,
      href: "/code-practice",
    },
    {
      step: 3,
      difficulty: "Medium",
      title: "Spark Engine",
      description: "Deep dive into Spark execution pipelines and optimization.",
      meta: "85+ topics",
      icon: Zap,
      href: "/spark-engine",
    },
    {
      step: 4,
      difficulty: "Hard",
      title: "Modern Data Stack",
      description: "Serverless-first, AI-native modern architectural patterns.",
      meta: "Fabric, Databricks",
      icon: Cloud,
      href: "/modern-stack",
    },
    {
      step: 5,
      difficulty: "Hard",
      title: "Q&A Prep Hub",
      description: "Spaced repetition (SM-2) for mastering interview questions.",
      meta: "6,100+ Q&As",
      icon: MessageSquare,
      href: "/qa-prep",
    },
    {
      step: 6,
      difficulty: "Architect",
      title: "Architecture Hub",
      description: "End-to-end design scenarios for modern data platforms.",
      meta: "2,400+ scenarios",
      icon: Layers,
      href: "/architecture",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
      {steps.map((item) => {
        const Icon = item.icon;
        const diffColor = difficultyColors[item.difficulty as keyof typeof difficultyColors];
        
        return (
          <Link key={item.step} href={item.href} className="block group">
            <div className="flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="mb-6 flex items-center justify-between">
                <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border", diffColor)}>
                  Step {item.step} · {item.difficulty}
                </span>
                <Icon className="h-6 w-6 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
              </div>
              
              <div className="flex-1 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  {item.meta}
                </span>
                <span className="inline-flex items-center font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  Open <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
