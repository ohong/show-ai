import { highlightTiles } from "@/lib/data/highlights";

export function HighlightGrid() {
  return (
    <section className="border-b-4 border-border bg-accent-muted">
      <div className="layout-shell py-14">
        <div className="stack">
          <h2 className="section-heading">Operational Pillars</h2>
          <p className="caption max-w-3xl">
            Three checkpoints keep the skill compiler predictable. Each block emphasises the cue,
            the behaviour, and the hand-off so ops teams can audit the run without digging.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {highlightTiles.map((tile) => (
            <article key={tile.title} className="brutalist-card stack">
              <span className="meta-label">{tile.cadence}</span>
              <h3 className="font-display text-xl tracking-[0.06em]">{tile.title}</h3>
              <p className="font-mono text-sm leading-relaxed text-muted normal-case">
                {tile.description}
              </p>
              <span className="badge">{tile.badge}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
