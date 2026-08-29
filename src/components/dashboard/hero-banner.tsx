export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-16 sm:px-12 sm:py-24 text-center sm:text-left isolate">
      {/* Aurora Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-blue-500/10 to-purple-500/10 opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
        <div className="absolute -bottom-32 left-32 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="mx-auto max-w-4xl flex flex-col items-center sm:items-start space-y-6">
        <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-sm font-medium text-slate-300 backdrop-blur-sm">
          Data Architect Studio · Learning OS
        </span>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Microsoft Data Platform
          </span>
          <br />
          Architect Preparation
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
          Fabric DP-600, Azure DP-203, Databricks, Delta Lake, 2,600+ Q&As
        </p>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-4">
          {[
            { icon: "⚡", label: "Fabric DP-600" },
            { icon: "☁️", label: "Azure DP-203" },
            { icon: "📊", label: "Power BI PL-300" },
            { icon: "🔥", label: "Databricks Lakehouse" },
            { icon: "🤖", label: "AI & RAG Pipelines" },
          ].map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-800/40 px-4 py-1.5 text-sm font-medium text-slate-300 backdrop-blur-md transition-colors hover:bg-slate-700/50"
            >
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
