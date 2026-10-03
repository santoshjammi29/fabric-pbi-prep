"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollBackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const checkScroll = () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;

      setIsVisible(currentScroll > 260);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(checkScroll);
        ticking = true;
      }
    };

    // Initial check
    checkScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      title="Scroll back to top"
      className={cn(
        "fixed z-40 bottom-20 right-4 md:bottom-24 md:right-6 lg:bottom-[96px] lg:right-8 flex items-center justify-center w-11 h-11 rounded-full",
        "shadow-lg transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
        "bg-white text-purple-700 border border-purple-200 hover:bg-purple-50 shadow-purple-900/10",
        "dark:bg-[#161618] dark:text-purple-300 dark:border-purple-500/30 dark:hover:bg-[#1c1c20] dark:hover:text-purple-100 dark:shadow-purple-950/40",
        "hover:scale-110 active:scale-95 active:translate-y-0.5",
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <ArrowUp size={18} className="stroke-[2.5]" aria-hidden="true" />
    </button>
  );
}
