"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DiagnosticModal } from "@/components/diagnostic/diagnostic-modal";
import { HubSubnav } from "@/components/layout/hub-subnav";
import { Compass, BookMarked, GraduationCap } from "lucide-react";

export default function DiagnosticPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    router.push("/learning-paths");
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto px-4 py-6">
      <HubSubnav
        hubTitle="Learning Journey"
        items={[
          { label: "Career Curricula Tracks", href: "/learning-paths", icon: Compass, badge: "12 Tracks" },
          { label: "Guided Topic Tracks", href: "/guided-learning", icon: BookMarked, badge: "9 Topics" },
          { label: "10-Q Skill Diagnostic", href: "/diagnostic", icon: GraduationCap, badge: "10-Q" },
        ]}
      />
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <DiagnosticModal isOpen={isOpen} onClose={handleClose} />
        {!isOpen && (
          <div className="text-center space-y-3">
            <p className="text-sm text-[var(--muted-foreground)]">Assessment closed.</p>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Re-open Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
