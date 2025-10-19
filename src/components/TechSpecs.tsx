import { techSpecs } from "@/lib/data/highlights";

export function TechSpecs() {
  return (
    <section className="bg-accent-thin">
      <div className="layout-shell py-14">
        <div className="stack gap-8">
          <h2 className="section-heading">Key details at a glance</h2>
          <div className="brutalist-card p-0">
            {techSpecs.map((spec) => (
              <div
                key={spec.label}
                className="grid grid-cols-[160px_minmax(0,1fr)_minmax(0,1fr)] border-b-2 border-border px-6 py-4 text-sm last:border-b-0"
              >
                <span className="meta-label">{spec.label}</span>
                <span className="font-mono">{spec.value}</span>
                <span className="font-mono text-muted">{spec.notes}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
