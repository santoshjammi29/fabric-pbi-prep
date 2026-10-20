import { TopicIcon } from "@/components/ui/topic-icon";

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-950 px-5 py-8 sm:px-8 sm:py-12 text-center sm:text-left isolate">
      {/* Aurora Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-blue-500/10 to-purple-500/10 opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
        <div className="absolute -bottom-32 left-32 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="mx-auto max-w-4xl flex flex-col items-center sm:items-start space-y-4">
        <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur-sm">
          Data Architect Studio · Learning OS
        </span>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
          <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
            DataPlatform Architect
          </span>
          <br />
          Enterprise Fabric, Databricks &amp; Lakehouse Prep
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          Fabric DP-600, Azure DP-203, Databricks, Delta Lake, 7,080+ Q&As
        </p>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
          {[
            { topicKey: "fabric", label: "Fabric DP-600" },
            { topicKey: "azure", label: "Azure DP-203" },
            { topicKey: "powerbi", label: "Power BI PL-300" },
            { topicKey: "databricks", label: "Databricks Lakehouse" },
            { topicKey: "ai", label: "AI & RAG Pipelines" },
          ].map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-1.5 rounded-full border border-slate-700/50 bg-slate-800/40 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur-md transition-colors hover:bg-slate-700/50"
            >
              <TopicIcon topic={badge.topicKey} size={14} />
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
