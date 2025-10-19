import { PageHeader } from "@/components/PageHeader";
import { HighlightGrid } from "@/components/HighlightGrid";
import { PipelineSection } from "@/components/PipelineSection";
import { UploadPanel } from "@/components/UploadPanel";
import { TechSpecs } from "@/components/TechSpecs";

export default function Page() {
  return (
    <main className="grid-overlay min-h-screen">
      <PageHeader />
      <HighlightGrid />
      <UploadPanel />
      <PipelineSection />
      <TechSpecs />
      <footer className="border-t-4 border-border bg-background py-12">
        <div className="layout-shell flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="meta-label">Show AI · Screen recordings ➜ Executable skills</p>
          <p className="font-mono text-xs text-muted">
            MVP scaffold · Frontend only · Inspired by Watch &amp; Learn design system
          </p>
        </div>
      </footer>
    </main>
  );
}
