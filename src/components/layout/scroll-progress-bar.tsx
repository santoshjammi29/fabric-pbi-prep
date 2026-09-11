"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    let ticking = false;

    const computeProgress = () => {
      const container = document.getElementById("main-content");
      let current = 0;
      let total = 0;

      if (container && container.scrollHeight > container.clientHeight) {
        current = container.scrollTop;
        total = container.scrollHeight - container.clientHeight;
      } else {
        const docEl = document.documentElement;
        current = window.scrollY || docEl.scrollTop || 0;
        total = docEl.scrollHeight - window.innerHeight;
      }

      if (total > 0) {
        const pct = Math.min(100, Math.max(0, (current / total) * 100));
        setProgress(pct);
      } else {
        setProgress(0);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(computeProgress);
        ticking = true;
      }
    };

    // Calculate immediately on mount/navigation
    computeProgress();

    const container = document.getElementById("main-content");
    if (container) {
      container.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (container) {
        container.removeEventListener("scroll", onScroll);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return (
    <div
      role="progressbar"
      aria-label="Page reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 inset-x-0 z-[60] h-[3px] pointer-events-none bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(139,92,246,0.6)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%`, opacity: progress > 0.5 ? 1 : 0 }}
      />
    </div>
  );
}
