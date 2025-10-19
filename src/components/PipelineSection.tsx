import { pipelineSteps } from "@/lib/data/highlights";

export function PipelineSection() {
  return (
    <section className="border-b-4 border-border bg-background">
      <div className="layout-shell py-16">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="stack">
            <h2 className="section-heading">Pipeline Blueprint</h2>
            <p className="caption">
              The interface mirrors the runtime: three deliberate moves with visible outputs. Each
              section maps to telemetry we surface back to operators.
            </p>
          </div>
          <div className="grid gap-6">
            {pipelineSteps.map((stage) => (
              <article key={stage.step} className="brutalist-card stack">
                <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-3">
                  <span className="font-display text-2xl tracking-[0.18em]">{stage.step}</span>
                  <span className="meta-label">{stage.title}</span>
                </header>
                <ul className="bullet-grid text-sm">
                  {stage.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
