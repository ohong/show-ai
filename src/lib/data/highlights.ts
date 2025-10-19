export const highlightTiles = [
  {
    step: "Step 01",
    title: "Upload your walkthrough",
    summary: "Start with a recording or link—whatever is fastest.",
    userAction: "Drag in a video up to 30 minutes or share a public YouTube/MP4 URL.",
    systemAction: "We hash the footage instantly, reuse existing skills, and warn on large files before upload.",
    badge: "Input"
  },
  {
    step: "Step 02",
    title: "Follow the live trace",
    summary: "See exactly what the AI understands while it learns from your video.",
    userAction: "Review the thinking trace, pause if anything looks off, and jump to key timestamps.",
    systemAction: "We narrate each frame, detect UI actions, and keep the transcript synced in real time.",
    badge: "Trace"
  },
  {
    step: "Step 03",
    title: "Download your skill",
    summary: "Leave with everything your agents need to run the process on demand.",
    userAction: "Review the generated docs and scripts, then export the full bundle.",
    systemAction: "We package an MCP-ready server, walkthrough docs, and automation assets tied to your hash.",
    badge: "Output"
  }
] as const;

export const pipelineSteps = [
  {
    step: "01",
    title: "Upload & Verify",
    details: [
      "Drag-or-drop MP4, MOV, WEBM up to 30 minutes or paste a YouTube link",
      "Client-side SHA-256 hashing keeps footage local until dedupe check passes",
      "Supabase cache short-circuits returning tutorials in under 150 ms"
    ]
  },
  {
    step: "02",
    title: "Trace & Explain",
    details: [
      "Frame sampling, narration transcription, and UI detection stream live to the dashboard",
      "Operators can pause or resume processing while inspecting trace events",
      "Every call to Gemini 2.5 is mirrored in the interface for auditability"
    ]
  },
  {
    step: "03",
    title: "Assemble & Deliver",
    details: [
      "Generate MCP server blueprint with typed stubs and environment scaffolding",
      "Bundle markdown guides, scripts, and automation assets into a portable archive",
      "Store package metadata in Supabase so future uploads inherit the same skill"
    ]
  }
] as const;

export const techSpecs = [
  {
    label: "Video Limit",
    value: "30 minutes",
    notes: "Warn on uploads above 2GB"
  },
  {
    label: "Hashing",
    value: "SHA-256",
    notes: "Client-side via Web Crypto API"
  },
  {
    label: "Storage",
    value: "Supabase",
    notes: "30-day retention, hash index"
  },
  {
    label: "LLM",
    value: "Gemini 2.5",
    notes: "Streaming computer-use API"
  }
] as const;
