export function PageHeader() {
  return (
    <header className="border-b-4 border-border bg-accent-thin">
      <div className="layout-shell py-16">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-start">
          <div className="stack">
            <span className="meta-label">Watch & Learn · Frontend Scaffold</span>
            <h1 className="font-display text-4xl tracking-[0.05em] md:text-5xl">
              Show AI Skill Compiler
            </h1>
            <p className="caption max-w-xl">
              Feed Show AI a screen recording or link and receive an executable skill package.
              The scaffold keeps the blueprint visible: no gradients, no chrome — just the pipeline
              that builders and agents need to trust.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="accent-block">
                <p className="meta-label">Latency Target</p>
                <p className="font-mono text-lg tracking-tight">&lt; 90 seconds</p>
              </div>
              <div className="accent-block">
                <p className="meta-label">Cache Hit Rate</p>
                <p className="font-mono text-lg tracking-tight">80% +</p>
              </div>
              <div className="accent-block">
                <p className="meta-label">Output Format</p>
                <p className="font-mono text-lg tracking-tight">MCP Bundle</p>
              </div>
            </div>
          </div>
          <aside className="stack border-l-4 border-border pl-6">
            <div>
              <p className="meta-label">Release</p>
              <p className="font-mono text-sm">Version 0.1 · MVP</p>
            </div>
            <div>
              <p className="meta-label">Stack</p>
              <p className="font-mono text-sm">Next · Tailwind · TypeScript</p>
            </div>
            <div>
              <p className="meta-label">Architecture</p>
              <p className="font-mono text-sm">Supabase · Gemini 2.5 · Browserbase</p>
            </div>
          </aside>
        </div>
      </div>
    </header>
  );
}
