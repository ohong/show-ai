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
        <div className="layout-shell flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="font-display text-lg uppercase tracking-[0.08em]">
              Ready to turn tutorials into agent skills?
            </p>
            <p className="caption max-w-xl text-sm">
              Upload a recording today and leave with a transparent, repeatable skill bundle your
              whole team can trust.
            </p>
          </div>
          <a href="#upload" className="button-inline">
            Get started
          </a>
        </div>
      </footer>
    </main>
  );
}
