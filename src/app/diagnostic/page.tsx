"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DiagnosticModal } from "@/components/diagnostic/diagnostic-modal";

export default function DiagnosticPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    router.push("/");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
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
  );
}
