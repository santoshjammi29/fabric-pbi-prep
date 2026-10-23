import React from "react";
import Link from "next/link";
import { ShieldCheck, Mail, AlertTriangle, Lock, Eye, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security Policy & Responsible Disclosure | Modern Data Engineer",
  description: "Security policy, vulnerability reporting guidelines, and responsible disclosure terms for moderndataengineer.uk.",
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono uppercase tracking-wider mb-4 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            Vulnerability Disclosure & Security Policy
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Security & Responsible Disclosure Policy
          </h1>
          <p className="mt-3 text-slate-400 text-base sm:text-lg">
            We prioritize the security and confidentiality of our data systems and learners. If you discover a vulnerability, we encourage prompt and responsible disclosure.
          </p>
        </div>

        {/* Section 1: Reporting */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-emerald-400">
            <Mail className="w-5 h-5" />
            <h2 className="text-xl font-semibold text-white">Reporting a Security Vulnerability</h2>
          </div>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Please report any security findings directly to our administrative team at{" "}
            <a
              href="mailto:santu.jammi@gmail.com"
              className="text-emerald-400 underline hover:text-emerald-300 font-mono"
            >
              santu.jammi@gmail.com
            </a>
            . We will review and acknowledge all submissions within 48 hours.
          </p>
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-4 font-mono text-xs text-slate-300 space-y-1">
            <p className="text-slate-500"># Standard security.txt endpoint</p>
            <p>Canonical: https://moderndataengineer.uk/.well-known/security.txt</p>
            <p>Contact: mailto:santu.jammi@gmail.com</p>
            <p>Preferred-Languages: en</p>
          </div>
        </section>

        {/* Section 2: Ground Rules & Scope */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Eye className="w-5 h-5" />
              <h3 className="font-semibold text-white">In Scope</h3>
            </div>
            <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
              <li>https://lakehousearchitect.com</li>
              <li>https://moderndataengineer.uk</li>
              <li>Authentication & authorization flaws</li>
              <li>Serverless API endpoint security vulnerabilities</li>
              <li>Cross-Site Scripting (XSS) and injection vectors</li>
              <li>Data exposure or broken access controls</li>
            </ul>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold text-white">Out of Scope</h3>
            </div>
            <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
              <li>Denial of Service (DoS / DDoS) attacks</li>
              <li>Social engineering or phishing targeting operators</li>
              <li>Spam, automated volumetric fuzzing, or scraping</li>
              <li>Issues in third-party CDN or DNS infrastructure</li>
            </ul>
          </div>
        </section>

        {/* Section 3: Safe Harbor */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-indigo-400">
            <Lock className="w-5 h-5" />
            <h2 className="text-xl font-semibold text-white">Safe Harbor & Commitment</h2>
          </div>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            We will not pursue legal action against researchers who make a good-faith effort to avoid privacy violations, data destruction, and service degradation, and who allow reasonable time for remediation before any public disclosure.
          </p>
        </section>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-slate-800 flex justify-between items-center text-sm text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">
            ← Back to Home
          </Link>
          <a
            href="/.well-known/security.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300"
          >
            <FileText className="w-4 h-4" />
            View security.txt
          </a>
        </div>
      </div>
    </div>
  );
}
