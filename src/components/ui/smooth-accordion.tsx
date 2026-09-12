"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SmoothAccordionProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}

export function SmoothAccordion({
  isOpen,
  children,
  className,
  innerClassName = "p-5 space-y-3",
}: SmoothAccordionProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="smooth-accordion-content"
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: "auto",
            opacity: 1,
            transition: {
              height: {
                duration: 0.35,
                ease: [0.04, 0.62, 0.23, 0.98],
              },
              opacity: { duration: 0.22, delay: 0.04 },
            },
          }}
          exit={{
            height: 0,
            opacity: 0,
            transition: {
              height: {
                duration: 0.25,
                ease: [0.04, 0.62, 0.23, 0.98],
              },
              opacity: { duration: 0.15 },
            },
          }}
          className={cn(
            "overflow-hidden border-t border-[var(--border)] bg-[var(--surface-2)]",
            className
          )}
        >
          <div className={innerClassName}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SmoothAccordion;
