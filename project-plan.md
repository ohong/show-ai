# Show AI - Project Specification v1.0

## Executive Summary

**What we're building:** Web application that converts screen recordings into executable AI skill packages through automated video analysis.

**Key technical decisions:**
- **Storage & Caching:** Supabase for videos and skill packages with hash-based deduplication; 30-day retention
- **Video constraints:** 30-minute max duration, common formats (mp4, mov, webm), no file size limit initially
- **Execution model:** AI agents control browsers via Browserbase to perform tasks
- **MCP distribution:** Generate self-hosted server code, not hosted endpoints
- **Auth:** None for MVP - stateless operation

**Tech stack:** Next.js, TypeScript, Tailwind CSS, Gemini 2.5 Computer Use, Browserbase, Supabase

---

## System Architecture

### Component Diagram
```
┌──────────────────────────────────────────────────┐
│              Frontend (Next.js)                  │
│  Upload → Extraction Trace → Skill Review        │
│  → Download/MCP/Execute                          │
└─────────────┬────────────────────────────────────┘
              │
┌─────────────▼────────────────────────────────────┐
│          API Routes (Next.js)                    │
│  /upload  /extract  /skill  /execute             │
└─────┬─────────────┬──────────────┬───────────────┘
      │             │              │
┌─────▼─────┐  ┌────▼──────┐ ┌─────▼──────┐
│ Supabase  │  │  Gemini   │ │Browserbase │
│  AWS S3   │  │  2.5 API  │ │  Sessions  │
│   SQS     │  │           │ │            │
└───────────┘  └───────────┘ └────────────┘
```

### Data Flow with Caching

```
User uploads video
    ↓
Calculate SHA-256 hash of video file
    ↓
Check Supabase: Does this hash exist?
    ↓
YES → Return existing skill package (instant)
    ↓
NO → Continue processing
    ↓
Upload to Supabase storage
    ↓
Send to Gemini 2.5 (stream thinking trace)
    ↓
Generate skill package
    ↓
Store in Supabase with video hash
    ↓
Return to user
```

**Cache hit benefits:**
- Instant results for duplicate videos
- Saves Gemini API costs
- Reduces processing load
- Better UX for popular tutorial videos

---

## Core Features & User Flows

### 1. Video Input & Deduplication

**Upload Interface:**
```typescript
// Client-side validation
const SUPPORTED_FORMATS = ['video/mp4', 'video/quicktime', 'video/webm']
const MAX_DURATION_MS = 30 * 60 * 1000  // 30 minutes

// No file size limit, but warn users about upload time for >2GB files
```

**Deduplication Flow:**
1. User drops video file
2. Client calculates SHA-256 hash (Web Crypto API, streaming for large files)
3. Call `POST /api/check-duplicate` with hash
4. If exists: Skip upload, redirect to existing skill page
5. If new: Proceed with upload to Supabase storage

**YouTube URL Processing:**
- Use `yt-dlp` server-side to download video
- Calculate hash after download
- Same deduplication logic applies
- Store original URL in metadata

### 2. Skill Extraction with Real-Time Trace

**Thinking Trace Events:**
```typescript
type ThinkingEvent = 
  | { type: 'video_analysis', timestamp: number, message: string, videoTime?: number }
  | { type: 'transcription', message: string, segment: string }
  | { type: 'ui_detection', message: string, action: string }
  | { type: 'instruction_generation', section: string, preview: string }
  | { type: 'script_generation', filename: string, language: string, lines: number }
  | { type: 'asset_extraction', assetType: string, description: string }
  | { type: 'progress', percentComplete: number }
```

**UI Components:**
- Split view: Video preview on left, thinking trace on right
- Trace entries color-coded by type (analysis=blue, generation=green, etc.)
- Progress bar showing % of video processed
- Ability to click trace entry to jump to corresponding video timestamp
- Auto-scroll to latest trace entry

**Server-Sent Events Stream:**
```typescript
// API route: /api/extract/[jobId]
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      for await (const event of processVideo(jobId)) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        )
      }
      controller.close()
    }
  })
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}
```

### 3. Skill Package Structure

**Directory Layout:**
```
{skill-name}/
├── SKILL.md                    # Primary instruction document
├── skill-metadata.json         # Structured metadata
├── scripts/
│   ├── automation.py           # Main automation script
│   ├── helpers.js              # Utility functions
│   └── requirements.txt        # Python dependencies (if needed)
├── templates/
│   ├── config.template.json    # Config file templates
│   └── prompt.template.txt     # Prompt templates
├── assets/
│   ├── step_2_reference.png    # Reference screenshots
│   └── final_output.png        # Expected results
└── README.md                   # How to use this skill package
```

**SKILL.md Structure:**
```markdown
# Skill: [Auto-extracted Title from Video]

## Description
[1-2 sentence summary of what this skill accomplishes]

## Prerequisites

### Software Requirements
- [Browser, tools, applications needed]

### Access Requirements
- [Accounts, credentials, API keys needed]

### Environment Setup
- [Configuration steps before starting]

## Procedure

### Step 1: [Action Name]
**Objective:** [What this step accomplishes]

**Instructions:**
[Detailed step-by-step instructions extracted from video]

**Code/Commands:**
```[language]
[Any commands or code shown in video]
```

**Verification:**
- [How to confirm this step succeeded]

### Step 2: [Next Action]
...

## Common Issues & Troubleshooting

### Issue: [Problem mentioned in video]
**Solution:** [Fix demonstrated in video]

### Issue: [Anticipated problem]
**Solution:** [How to resolve]

## Success Criteria
- [ ] [Expected outcome 1]
- [ ] [Expected outcome 2]

## Additional Notes
[Any tips, warnings, or context from narration]
```

**skill-metadata.json:**
```json
{
  "id": "uuid-v4",
  "title": "Extracted Skill Title",
  "description": "Brief description",
  "version": "1.0.0",
  "createdAt": "ISO-8601 timestamp",
  "sourceVideo": {
    "hash": "sha256-hash",
    "url": "youtube-url-if-applicable",
    "duration": 1234,
    "uploadedAt": "timestamp"
  },
  "requirements": {
    "software": ["Chrome", "VS Code"],
    "platforms": ["web", "desktop"],
    "apis": ["GitHub API"]
  },
  "tags": ["automation", "github", "deployment"],
  "estimatedDuration": "15 minutes",
  "difficulty": "intermediate",
  "steps": 8,
  "hasCode": true,
  "languages": ["python", "bash"]
}
```

### 4. Distribution Options

#### Option A: Zip Download
- Server generates zip in memory using `jszip`
- Includes entire skill package directory
- Returns download link (no expiry needed - regenerated on demand)
- Filename: `{skill-title-slugified}-{timestamp}.zip`

#### Option B: MCP Server Generation

**Generate self-hosted MCP server code:**

```typescript
// Generated structure
mcp-server-{skill-name}/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts           // MCP server entry point
│   ├── tools.ts           // Skill tools definitions
│   └── skill/             // Embedded skill package
│       ├── SKILL.md
│       └── ...
├── README.md              // Self-hosting instructions
└── .env.example           // Required environment variables
```

**Generated index.ts template:**
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { skillMetadata } from "./skill/skill-metadata.json";

const server = new Server({
  name: `skill-${skillMetadata.id}`,
  version: skillMetadata.version,
}, {
  capabilities: {
    tools: {},
  },
});

// Register tool for reading skill instructions
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_skill_instructions",
      description: skillMetadata.description,
      inputSchema: {
        type: "object",
        properties: {
          step: { type: "number", description: "Specific step number (optional)" }
        }
      }
    },
    {
      name: "execute_skill",
      description: `Execute the skill: ${skillMetadata.title}`,
      inputSchema: {
        type: "object",
        properties: {
          context: { type: "object", description: "Execution context variables" }
        },
        required: ["context"]
      }
    }
  ]
}));

// Implementation of tool handlers...
```

**README.md includes:**
- Prerequisites (Node.js version, etc.)
- Installation: `npm install`
- Configuration: Environment variables needed
- Running: `npm start`
- Integration: How to add to MCP client config

**Package as separate zip:** `mcp-server-{skill-name}.zip`

#### Option C: In-App Execution

**Execution Flow:**
1. User clicks "Test Skill" button
2. Modal prompts for execution context:
   ```typescript
   interface ExecutionContext {
     targetUrl?: string          // Starting URL if needed
     inputs: Record<string, any> // Variables mentioned in SKILL.md
     browserConfig?: {
       viewport: { width: number, height: number }
       userAgent?: string
     }
   }
   ```
3. Initialize Browserbase session with skill requirements
4. Stream execution events to frontend via SSE
5. Display live browser screenshots + action log
6. On completion: Show results, allow download of artifacts

**Execution Monitor UI:**
```
┌─────────────────────────────────────────────────┐
│ Executing: Deploy to Production                │
│ Status: Running Step 3/8                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Live Browser Screenshot]                     │
│                                                 │
├─────────────────────────────────────────────────┤
│ Execution Log:                                 │
│ ✓ Step 1: Open GitHub repository               │
│ ✓ Step 2: Navigate to Actions tab              │
│ ⟳ Step 3: Trigger deployment workflow...       │
│   → Clicked "Run workflow" button              │
│   → Waiting for confirmation...                │
└─────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Supabase Schema

**Tables:**

```sql
-- Videos table (deduplicated by hash)
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hash VARCHAR(64) UNIQUE NOT NULL,  -- SHA-256 hash
  storage_path TEXT NOT NULL,         -- Supabase storage path
  source_type VARCHAR(10) NOT NULL,   -- 'upload' or 'url'
  source_url TEXT,                    -- If from YouTube/etc
  duration_seconds INTEGER NOT NULL,
  format VARCHAR(10) NOT NULL,
  file_size_bytes BIGINT,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  last_accessed_at TIMESTAMP DEFAULT NOW(),
  access_count INTEGER DEFAULT 1
);

CREATE INDEX idx_videos_hash ON videos(hash);
CREATE INDEX idx_videos_uploaded_at ON videos(uploaded_at);

-- Skill packages table
CREATE TABLE skill_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  skill_md TEXT NOT NULL,              -- Full SKILL.md content
  metadata JSONB NOT NULL,             -- skill-metadata.json
  scripts JSONB,                       -- Array of {filename, content, language}
  templates JSONB,                     -- Array of template files
  assets JSONB,                        -- Array of {filename, storage_path, type}
  storage_path TEXT NOT NULL,          -- Path to packaged zip in storage
  created_at TIMESTAMP DEFAULT NOW(),
  last_accessed_at TIMESTAMP DEFAULT NOW(),
  access_count INTEGER DEFAULT 1
);

CREATE INDEX idx_skill_packages_video_id ON skill_packages(video_id);
CREATE INDEX idx_skill_packages_created_at ON skill_packages(created_at);

-- Execution sessions table
CREATE TABLE execution_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_package_id UUID REFERENCES skill_packages(id),
  browserbase_session_id TEXT,
  context JSONB NOT NULL,              -- Execution inputs
  status VARCHAR(20) NOT NULL,         -- 'initializing', 'running', 'completed', 'failed'
  events JSONB DEFAULT '[]',           -- Array of execution events
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  error_message TEXT
);

CREATE INDEX idx_execution_sessions_skill_id ON execution_sessions(skill_package_id);
CREATE INDEX idx_execution_sessions_status ON execution_sessions(status);

-- Cleanup job: Delete records older than 30 days
-- Run via Supabase cron or external job
```

**Storage Buckets:**
- `videos`: Original uploaded videos
- `skill-packages`: Generated zip files
- `execution-artifacts`: Screenshots, logs from executions

### API Routes

```typescript
// /api/upload
POST /api/upload
Request: multipart/form-data with video file
Response: {
  jobId: string,
  uploadUrl: string,  // Supabase signed upload URL
  hash: string        // For client to check duplication
}

// /api/check-duplicate
POST /api/check-duplicate
Request: { hash: string }
Response: {
  exists: boolean,
  skillPackageId?: string  // If exists
}

// /api/ingest-url
POST /api/ingest-url
Request: { url: string }
Response: {
  jobId: string,
  status: 'downloading' | 'duplicate_found',
  skillPackageId?: string
}

// /api/extract/[jobId]
GET /api/extract/[jobId]
Response: Server-Sent Events stream
Events: ThinkingEvent[]

// /api/skill/[skillId]
GET /api/skill/[skillId]
Response: {
  id: string,
  title: string,
  metadata: SkillMetadata,
  skillMD: string,
  scripts: Script[],
  templates: Template[],
  assets: Asset[],
  downloadUrl: string  // Signed URL to zip
}

// /api/generate-mcp/[skillId]
POST /api/generate-mcp/[skillId]
Response: {
  downloadUrl: string  // Signed URL to MCP server zip
}

// /api/execute
POST /api/execute
Request: {
  skillId: string,
  context: ExecutionContext
}
Response: {
  sessionId: string,
  browserbaseUrl?: string  // Optional live view URL
}

// /api/execution/[sessionId]
GET /api/execution/[sessionId]
Response: Server-Sent Events stream
Events: ExecutionEvent[]
```

### Core Processing Logic

**Video Hash Calculation:**
```typescript
// Client-side (for pre-upload check)
async function calculateVideoHash(file: File): Promise<string> {
  const chunkSize = 64 * 1024 * 1024; // 64MB chunks for large files
  const crypto = window.crypto.subtle;
  const hashBuffer = await crypto.digest(
    'SHA-256',
    await file.arrayBuffer() // For smaller files
  );
  // For large files, use streaming approach with FileReader
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Server-side (after upload)
import { createHash } from 'crypto';
import { createReadStream } from 'fs';

async function calculateHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}
```

**Gemini Processing Pipeline:**
```typescript
interface VideoProcessor {
  async processVideo(
    videoPath: string,
    onProgress: (event: ThinkingEvent) => void
  ): Promise<SkillPackage> {
    
    // 1. Extract frames at strategic intervals
    const frames = await this.extractKeyFrames(videoPath);
    onProgress({ 
      type: 'video_analysis', 
      message: `Extracted ${frames.length} key frames` 
    });
    
    // 2. Transcribe audio
    const transcript = await this.transcribeAudio(videoPath);
    onProgress({
      type: 'transcription',
      message: 'Audio transcription complete',
      segment: transcript.substring(0, 100) + '...'
    });
    
    // 3. Send to Gemini with structured prompt
    const geminiResponse = await this.analyzeWithGemini(
      frames,
      transcript,
      onProgress
    );
    
    // 4. Parse response into skill package components
    const skillPackage = await this.parseGeminiResponse(
      geminiResponse,
      onProgress
    );
    
    return skillPackage;
  }
  
  async analyzeWithGemini(
    frames: Frame[],
    transcript: Transcript,
    onProgress: (event: ThinkingEvent) => void
  ) {
    const prompt = `You are a skill extraction system. Analyze this screen recording and create a comprehensive skill package.

VIDEO FRAMES: ${frames.length} frames at timestamps ${frames.map(f => f.timestamp).join(', ')}
AUDIO TRANSCRIPT: ${transcript.text}

OUTPUT REQUIREMENTS:
1. SKILL.md: Detailed step-by-step instructions following this template:
   [Include full template here]

2. SCRIPTS: Generate any code shown or referenced:
   - Python scripts for automation
   - Shell scripts for commands
   - JavaScript for web interactions
   
3. TEMPLATES: Extract any config files, templates shown
   
4. ASSETS: Identify which frames should be saved as reference screenshots

5. METADATA: Extract:
   - Skill title and description
   - Prerequisites (software, access, environment)
   - Estimated duration and difficulty
   - Tags and categories

THINKING PROCESS:
As you analyze, output your thinking in this JSON format:
{
  "thinking_steps": [
    {"type": "analysis", "message": "...", "video_time": 123},
    {"type": "instruction_generation", "section": "Step 2", "preview": "..."},
    ...
  ],
  "skill_package": { ... }
}

Begin analysis...`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-computer-use" });
    
    // Stream response
    const result = await model.generateContentStream({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          ...frames.map(f => ({ inlineData: { mimeType: 'image/jpeg', data: f.base64 }})),
          { text: `TRANSCRIPT: ${transcript.text}` }
        ]
      }]
    });
    
    for await (const chunk of result.stream) {
      const text = chunk.text();
      // Parse thinking steps and emit progress events
      const thinkingMatch = text.match(/"thinking_steps":\s*\[(.*?)\]/s);
      if (thinkingMatch) {
        const steps = JSON.parse(`[${thinkingMatch[1]}]`);
        steps.forEach(step => onProgress(step));
      }
    }
    
    return result.response;
  }
}
```

**Frame Extraction Strategy:**
```typescript
// Use ffmpeg to extract frames
// Dense sampling during active periods, sparse during static periods

async function extractKeyFrames(videoPath: string): Promise<Frame[]> {
  // 1. Detect scene changes using ffmpeg
  const sceneChanges = await detectSceneChanges(videoPath);
  
  // 2. Extract frames:
  //    - Every scene change
  //    - Every 5 seconds during active narration
  //    - Every 30 seconds during silence
  
  // 3. Target ~50-100 frames for 30-min video
  //    (Gemini can handle large multimodal inputs)
  
  const frames: Frame[] = [];
  for (const timestamp of selectedTimestamps) {
    const frameData = await extractFrame(videoPath, timestamp);
    frames.push({
      timestamp,
      base64: frameData.toString('base64'),
      width: 1920,
      height: 1080
    });
  }
  
  return frames;
}
```

**MCP Server Generator:**
```typescript
async function generateMCPServer(skillPackage: SkillPackage): Promise<Buffer> {
  const template = await loadMCPTemplate();
  
  // Replace template variables
  const serverCode = template
    .replace('{{SKILL_NAME}}', skillPackage.title)
    .replace('{{SKILL_METADATA}}', JSON.stringify(skillPackage.metadata))
    .replace('{{SKILL_MD}}', skillPackage.skillMD);
  
  // Create package.json
  const packageJson = {
    name: `mcp-skill-${skillPackage.id}`,
    version: skillPackage.metadata.version,
    type: "module",
    dependencies: {
      "@modelcontextprotocol/sdk": "^1.0.0"
    },
    scripts: {
      start: "node dist/index.js",
      build: "tsc"
    }
  };
  
  // Bundle into zip
  const zip = new JSZip();
  zip.file('src/index.ts', serverCode);
  zip.file('package.json', JSON.stringify(packageJson, null, 2));
  zip.file('tsconfig.json', tsConfigTemplate);
  zip.file('README.md', generateREADME(skillPackage));
  zip.folder('src/skill')!.file('SKILL.md', skillPackage.skillMD);
  zip.folder('src/skill')!.file('metadata.json', JSON.stringify(skillPackage.metadata));
  
  // Add scripts
  skillPackage.scripts.forEach(script => {
    zip.folder('src/skill/scripts')!.file(script.filename, script.content);
  });
  
  return await zip.generateAsync({ type: 'nodebuffer' });
}
```

**Browserbase Execution Engine:**
```typescript
interface ExecutionEngine {
  async executeSkill(
    skillPackage: SkillPackage,
    context: ExecutionContext,
    onEvent: (event: ExecutionEvent) => void
  ): Promise<ExecutionResult> {
    
    // 1. Create Browserbase session
    const session = await browserbase.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID,
      browserSettings: {
        viewport: context.browserConfig?.viewport,
        recordSession: true  // For debugging
      }
    });
    
    onEvent({
      timestamp: new Date(),
      type: 'step_start',
      message: 'Initializing browser session...'
    });
    
    // 2. Connect to browser via CDP
    const browser = await puppeteer.connect({
      browserWSEndpoint: session.wsEndpoint
    });
    
    const page = await browser.newPage();
    
    // 3. Parse SKILL.md and execute steps
    const steps = parseSkillSteps(skillPackage.skillMD);
    
    for (const [index, step] of steps.entries()) {
      onEvent({
        timestamp: new Date(),
        type: 'step_start',
        message: `Step ${index + 1}: ${step.objective}`
      });
      
      try {
        // Execute step using Gemini Computer Use model
        // Send step instructions + current page screenshot
        const screenshot = await page.screenshot({ encoding: 'base64' });
        
        const action = await this.gemini.determineAction({
          instruction: step.instructions,
          screenshot,
          context
        });
        
        // Execute action in browser
        await this.performAction(page, action);
        
        // Take screenshot after action
        const afterScreenshot = await page.screenshot({ encoding: 'base64' });
        
        onEvent({
          timestamp: new Date(),
          type: 'screenshot',
          message: `Completed: ${step.objective}`,
          screenshot: afterScreenshot
        });
        
        onEvent({
          timestamp: new Date(),
          type: 'step_complete',
          message: `Step ${index + 1} completed`
        });
        
      } catch (error) {
        onEvent({
          timestamp: new Date(),
          type: 'error',
          message: `Step ${index + 1} failed: ${error.message}`
        });
        throw error;
      }
    }
    
    // 4. Cleanup
    await browser.close();
    
    return {
      success: true,
      sessionId: session.id,
      recordingUrl: session.recordingUrl
    };
  }
}
```

---

## Data Retention & Cleanup

**30-Day Retention Policy:**
```sql
-- Supabase Edge Function or external cron job
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Delete old execution sessions
  DELETE FROM execution_sessions
  WHERE started_at < NOW() - INTERVAL '30 days';
  
  -- Delete skill packages with no recent access
  DELETE FROM skill_packages
  WHERE last_accessed_at < NOW() - INTERVAL '30 days';
  
  -- Delete videos with no associated skill packages
  DELETE FROM videos v
  WHERE NOT EXISTS (
    SELECT 1 FROM skill_packages sp WHERE sp.video_id = v.id
  )
  AND uploaded_at < NOW() - INTERVAL '30 days';
  
  -- Clean up storage files (call Supabase storage API)
END;
$$ LANGUAGE plpgsql;

-- Schedule to run daily
SELECT cron.schedule(
  'cleanup-old-data',
  '0 2 * * *',  -- 2 AM daily
  'SELECT cleanup_old_data();'
);
```

**Update last_accessed_at on reads:**
```typescript
// Whenever a skill package is viewed/downloaded
await supabase
  .from('skill_packages')
  .update({ 
    last_accessed_at: new Date().toISOString(),
    access_count: sql`access_count + 1`
  })
  .eq('id', skillId);
```

---

## Development Phases

### Phase 1: Core Extraction
**Deliverables:**
- Video upload with hash calculation
- Supabase integration (storage + DB)
- Deduplication logic
- Gemini integration for basic analysis
- Simple text-based thinking trace
- Generate SKILL.md only
- Zip download

**Success Criteria:**
- Upload video → Get SKILL.md in < 5 min
- Cache hit returns results in < 2 sec
- SKILL.md is readable and actionable

### Phase 2: Complete Skill Packages
**Deliverables:**
- YouTube URL ingestion
- Enhanced Gemini prompts for scripts/templates/assets
- Rich thinking trace with video sync
- Generate complete skill package (scripts, templates, assets)
- Improved SKILL.md formatting
- Better UI/UX for extraction monitor

**Success Criteria:**
- Skill packages include runnable code
- Assets properly extracted and stored
- Thinking trace helps user understand progress

### Phase 3: MCP Generation
**Deliverables:**
- MCP server code generator
- Template system for MCP servers
- Documentation generator
- Self-hosting instructions
- Test with standard MCP clients

**Success Criteria:**
- Generated MCP servers work with popular MCP clients
- Clear instructions for non-technical users to deploy
- Successfully tested with 5+ different skills

### Phase 4: In-App Execution
**Deliverables:**
- Browserbase integration
- Execution context input UI
- Real-time execution monitoring
- Screenshot capture and display
- Error handling and retry logic
- Execution session persistence

**Success Criteria:**
- 60%+ of generated skills execute successfully
- Clear error messages when execution fails
- User can see exactly what the AI is doing

---

## Infrastructure & Costs

### Supabase
**Storage:**
- Videos: ~500MB average × 100 uploads/day = 50GB/day
- With deduplication: ~20% unique = 10GB/day new storage
- 30-day retention = ~300GB total
- Cost: ~$10/month (first 100GB free on Pro plan)

**Database:**
- Minimal data (mostly references)
- Pro plan sufficient

**Bandwidth:**
- Uploads: 10GB/day
- Downloads (zips): ~50MB × 200/day = 10GB/day
- Total: ~20GB/day = 600GB/month
- Cost: ~$9/month (first 250GB free)

### Gemini API
**Processing:**
- 30-min video → ~100 frames + full transcript
- Estimated: ~500K tokens input, ~50K tokens output per video
- Cost: ~$2-3 per video (Gemini 2.5 pricing)
- 100 unique videos/day = $200-300/day
- With 80% cache hits = $40-60/day = $1,200-1,800/month

**Optimization:**
- Caching saves 80% of costs
- Consider prompt caching for repeated analysis patterns

### Browserbase
**Sessions:**
- 15-min average execution time
- $0.50 per session hour = ~$0.13 per execution
- 50 executions/day = $6.50/day = $195/month
- Free tier: 100 hours/month may cover MVP

### Vercel
**Hosting:**
- Pro plan: $20/month
- Serverless function executions: included
- Bandwidth: mostly proxied through Supabase

### Total Estimated Monthly Cost
- Supabase: $25-50
- Gemini API: $1,200-1,800 (highly dependent on cache hit rate)
- Browserbase: $195 (or free tier initially)
- Vercel: $20
- **Total: $1,440-2,065/month** at 100 videos/day with 80% cache hits

**Cost Reduction Strategies:**
- Increase cache hit rate (share links to popular tutorials)
- Implement video duration-based pricing tiers
- Optimize Gemini prompts to reduce token usage
- Use Gemini Flash for initial analysis, Pro for final generation

---

## Risk Mitigation

**Technical Risks:**

1. **Gemini hallucination in generated skills**
   - Mitigation: Add user feedback mechanism, iterate on prompts
   - Future: Implement validation/testing step

2. **Large video processing timeouts**
   - Mitigation: Process asynchronously, show progress
   - Set hard 30-min video limit
   - Consider breaking into chunks for >20 min videos

3. **Browserbase session failures**
   - Mitigation: Retry logic, clear error messages
   - Provide manual execution option (download skill + instructions)

4. **Storage costs spiral**
   - Mitigation: Aggressive deduplication
   - 30-day retention strictly enforced
   - Monitor storage growth weekly

**Product Risks:**

1. **Generated skills are poor quality**
   - Mitigation: Start with curated test videos
   - Gather user feedback early
   - Iterate on Gemini prompts based on failures

2. **Users don't trust automated execution**
   - Mitigation: Emphasize transparency (live monitoring)
   - Provide manual option
   - Build trust through documentation

---

## Open Questions for Next Sprint

1. **Rate limiting:** How many videos per IP per day? (Suggest: 10 uploads, unlimited cache hits)

2. **Video privacy:** Should users be able to mark videos as private (not deduplicated)? 

3. **Skill versioning:** If we detect the same video uploaded with improvements, create new version or replace?

4. **Collaboration:** Should users be able to share skill packages via links?

5. **Analytics:** What metrics do we track? (Successful extractions, execution success rate, cache hit rate)