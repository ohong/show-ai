import { highlightTiles } from "@/lib/data/highlights";

export function HighlightGrid() {
  return (
    <section className="border-b-4 border-border bg-accent-muted">
      <div className="layout-shell py-14">
        <div className="stack">
          <h2 className="section-heading">How Watch &amp; Learn Works</h2>
          <p className="caption max-w-3xl">
            Follow the same three moves every time. You provide a walkthrough, you observe the trace,
            and you sign off on the skill bundle. We surface what we are doing under the hood at each
            checkpoint so there is no guesswork.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {highlightTiles.map((tile) => (
            <article key={tile.title} className="brutalist-card stack">
              <span className="meta-label">{tile.step}</span>
              <h3 className="font-display text-xl tracking-[0.06em]">{tile.title}</h3>
              <p className="caption text-sm leading-relaxed">
                {tile.summary}
              </p>
              <div className="grid gap-3 border-t-2 border-border pt-3 text-sm md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <p className="meta-label">You do</p>
                  <p className="font-mono leading-relaxed text-muted normal-case">{tile.userAction}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="meta-label">Watch &amp; Learn does</p>
                  <p className="font-mono leading-relaxed text-muted normal-case">{tile.systemAction}</p>
                </div>
              </div>
              <span className="badge">{tile.badge}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
