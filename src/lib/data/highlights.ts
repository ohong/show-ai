export const highlightTiles = [
  {
    title: "Cache-first Uploads",
    description: "SHA-256 hashing checks Supabase for prior matches so returning tutorials resolve instantly without reprocessing.",
    badge: "Deduplication",
    cadence: "Pre-Processing"
  },
  {
    title: "Thinking Trace Stream",
    description: "Gemini 2.5 emits video analysis, transcription, UI detection, and generation events in real time for full transparency.",
    badge: "Observability",
    cadence: "During Extraction"
  },
  {
    title: "Executable Skill Package",
    description: "Compile markdown docs, MCP-ready server code, and automation assets into a downloadable bundle in minutes.",
    badge: "Output",
    cadence: "Post-Processing"
  }
] as const;

export const pipelineSteps = [
  {
    step: "01",
    title: "Upload or Link",
    details: [
      "Drag-and-drop MP4, MOV, WEBM up to 30 minutes",
      "Optional YouTube link ingestion via yt-dlp",
      "Client-side hashing keeps files local until needed"
    ]
  },
  {
    step: "02",
    title: "Analyse & Trace",
    details: [
      "Frame sampling + narration transcription",
      "UI control detection for task modeling",
      "Live progress events surfaced to the UI"
    ]
  },
  {
    step: "03",
    title: "Package & Deliver",
    details: [
      "Generate MCP server blueprint",
      "Bundle instructions, scripts, and assets",
      "Store package & metadata in Supabase"
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
