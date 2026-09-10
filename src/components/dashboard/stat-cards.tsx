"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { BookOpen, MessageSquare, FileCode2, Zap, Layers, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  suffix: string;
  icon: React.ElementType;
  href: string;
  accent: "green" | "orange" | "amber" | "red" | "purple" | "sky";
}

const colorMap = {
  green: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800/50",
  orange: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800/50",
  amber: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800/50",
  red: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800/50",
  purple: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800/50",
  sky: "text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/30 border-sky-200 dark:border-sky-800/50",
};

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px" });
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    if (!isInView) {
      // Immediate fallback timer if not intersecting or in tests
      const timer = setTimeout(() => setDisplayValue(value), 400);
      return () => clearTimeout(timer);
    }

    let startTime: number | null = null;
    let animationFrameId: number;
    const duration = 1200;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easeOut * value));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {(displayValue > 0 ? displayValue : value).toLocaleString()}{suffix}
    </span>
  );
}

export function StatCards() {
  const stats: StatCardProps[] = [
    { title: "Core Concepts", value: 112, suffix: "+", icon: BookOpen, href: "/concepts", accent: "green" },
    { title: "Interview Q&As", value: 6100, suffix: "+", icon: MessageSquare, href: "/qa-prep", accent: "orange" },
    { title: "Coding Sheets", value: 120, suffix: "+", icon: FileCode2, href: "/code-practice", accent: "amber" },
    { title: "Spark Engine", value: 85, suffix: "+", icon: Zap, href: "/spark-engine", accent: "red" },
    { title: "Arch Scenarios", value: 2400, suffix: "+", icon: Layers, href: "/architecture", accent: "purple" },
    { title: "GCC Firms", value: 40, suffix: "+", icon: Building2, href: "/company-research", accent: "sky" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Link key={stat.title} href={stat.href} className="block group">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className={cn("mb-4 inline-flex rounded-xl p-2.5 border", colorMap[stat.accent])}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.title}
                </div>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}
