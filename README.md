# Show AI

**Teach AI agents new skills by showing, not writing.**

*Started at the Gemini x TED AI Hackathon (Oct 2025)*

## The Problem

Writing detailed prompts and instructions for AI agents is time-consuming and tedious. Complex workflows require lengthy documentation that's hard to maintain and often misses crucial details that are obvious when you actually perform the task.

## Our Solution

Show AI converts screen recordings into executable skill packages. Simply record yourself performing a task with light narration, and our system automatically generates:

- **SKILL.md** - Step-by-step instructions AI agents can follow
- **Scripts** - Automation code extracted from your demonstration
- **Templates** - Configuration files and boilerplate
- **Assets** - Reference screenshots and outputs

These skill packages can be downloaded as zip files, converted into MCP servers for AI integration, or executed directly in the browser via Browserbase.

## How It Works

1. Upload a screen recording (or YouTube URL) showing the task
2. Our system extracts key frames and transcribes narration
3. Gemini 2.5 Computer Use model analyzes the video and generates a structured skill package
4. Review the extracted skill with a real-time thinking trace
5. Download, integrate, or test-run your new AI skill

**Smart Caching:** Identical videos are deduplicated by hash, providing instant results for popular tutorials and reducing processing costs.

## Tech Stack

Next.js • TypeScript • Tailwind CSS • Gemini 2.5 Computer Use • Browserbase • Supabase