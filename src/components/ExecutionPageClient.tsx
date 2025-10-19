"use client"

import { useState } from "react"
import Link from "next/link"

type VideoRow = {
  id: string
  user_id: string
  source_type: "s3" | "youtube" | "url"
  youtube_title: string | null
  youtube_thumbnail_url: string | null
  youtube_duration: number | null
  file_name: string | null
  file_size: number | null
  file_type: string | null
  source_url: string | null
  status: string | null
  processing_status: string | null
  is_processed: boolean
  analysis_result: string | null
  created_at?: string | null
  updated_at?: string | null
}

type ExecutionStatus = "idle" | "running" | "completed" | "error"

type ExecutionResult = {
  status: string
  message: string
  session_url?: string
  live_view_url?: string
  error?: string
}

type LogEntry = {
  timestamp: Date
  message: string
}

type ReasoningEntry = {
  timestamp: Date
  reasoning: string
  function_calls: string[]
}

export function ExecutionPageClient({ video, title }: { video: VideoRow; title: string }) {
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>("idle")
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [reasoningLogs, setReasoningLogs] = useState<ReasoningEntry[]>([])
  const [isInstructionsExpanded, setIsInstructionsExpanded] = useState(false)

  const handleStartExecution = async () => {
    if (!video.analysis_result) {
      setExecutionStatus("error")
      setExecutionResult({
        status: "error",
        message: "No analysis result available for this skill",
        error: "This skill doesn't have instructions to execute. Please ensure the skill has been analyzed first.",
      })
      return
    }

    setExecutionStatus("running")
    setLogs([])
    setReasoningLogs([])
    setExecutionResult(null)

    try {
      // Use streaming endpoint for real-time logs
      const response = await fetch("/api/execute-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: video.analysis_result,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error("Response body is null")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))

            if (data.type === 'log') {
              setLogs(prev => [...prev, { timestamp: new Date(), message: data.message }])
            } else if (data.type === 'reasoning') {
              setReasoningLogs(prev => [...prev, {
                timestamp: new Date(),
                reasoning: data.reasoning,
                function_calls: data.function_calls
              }])
            } else if (data.type === 'live_view_url') {
              setExecutionResult(prev => ({
                ...prev,
                status: 'running',
                message: 'Execution in progress',
                live_view_url: data.url,
              }))
            } else if (data.type === 'session_url') {
              setExecutionResult(prev => ({
                ...prev,
                status: 'running',
                message: 'Execution in progress',
                session_url: data.url,
              }))
            } else if (data.type === 'success') {
              setExecutionStatus("completed")
              setExecutionResult({
                status: "success",
                message: data.message,
                session_url: data.session_url,
                live_view_url: data.live_view_url,
              })
              setLogs(prev => [...prev, { timestamp: new Date(), message: "✓ " + data.message }])
            } else if (data.type === 'error') {
              setExecutionStatus("error")
              setExecutionResult({
                status: "error",
                message: data.message,
                error: data.traceback || data.message,
              })
              setLogs(prev => [...prev, { timestamp: new Date(), message: "✗ Error: " + data.message }])
              if (data.traceback) {
                setLogs(prev => [...prev, { timestamp: new Date(), message: data.traceback }])
              }
            }
          }
        }
      }

    } catch (error) {
      console.error("Execution error:", error)
      setLogs(prev => [...prev, { timestamp: new Date(), message: `✗ Connection error: ${error instanceof Error ? error.message : "Unknown error"}` }])
      setExecutionStatus("error")
      setExecutionResult({
        status: "error",
        message: "Execution failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/my-skills" className="button-inline">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" />
            </svg>
            Back to My Skills
          </Link>
          <h1 className="font-display text-3xl tracking-[0.05em]">{title}</h1>
        </div>
      </div>

      {/* Instructions Section */}
      <div className="accent-block">
        <button
          onClick={() => setIsInstructionsExpanded(!isInstructionsExpanded)}
          className="w-full flex items-center justify-between mb-4 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <h2 className="font-display text-xl tracking-[0.05em]">Skill Instructions</h2>
          <svg
            className={`w-5 h-5 transition-transform ${isInstructionsExpanded ? 'rotate-180' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        {isInstructionsExpanded && (
          video.analysis_result ? (
            <div className="p-4 bg-accent-thin rounded-md">
              <pre className="font-mono text-sm whitespace-pre-wrap">{video.analysis_result}</pre>
            </div>
          ) : (
            <p className="text-muted-foreground">No instructions available for this skill.</p>
          )
        )}
      </div>

      {/* Execution Controls */}
      <div className="accent-block">
        <h2 className="font-display text-xl tracking-[0.05em] mb-4">Execution</h2>

        {executionStatus === "idle" && (
          <button
            onClick={handleStartExecution}
            disabled={!video.analysis_result}
            className="button-inline flex items-center gap-2 justify-center"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 5v10l8-5-8-5z" />
            </svg>
            Start Execution
          </button>
        )}

        {executionStatus === "running" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent"></div>
              <span className="font-mono text-sm">Executing skill...</span>
            </div>
          </div>
        )}

        {executionStatus === "completed" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-green-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              <span className="font-mono text-sm font-medium">Execution completed successfully!</span>
            </div>
            <button
              onClick={handleStartExecution}
              className="button-inline flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
              </svg>
              Run Again
            </button>
          </div>
        )}

        {executionStatus === "error" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
              <span className="font-mono text-sm font-medium">Execution failed</span>
            </div>
            <button
              onClick={handleStartExecution}
              className="button-inline flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
              </svg>
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Execution Logs */}
      {logs.length > 0 && (
        <div className="accent-block">
          <h2 className="font-display text-xl tracking-[0.05em] mb-4">Execution Logs</h2>
          <div className="p-4 bg-black text-green-400 rounded-md font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap">
                <span className="text-gray-500">[{log.timestamp.toLocaleTimeString()}]</span> {log.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gemini Reasoning Logs */}
      {reasoningLogs.length > 0 && (
        <div className="accent-block">
          <h2 className="font-display text-xl tracking-[0.05em] mb-4">Gemini Reasoning</h2>
          <div className="space-y-3 h-96 overflow-y-auto">
            {reasoningLogs.map((entry, index) => (
              <div key={index} className="border-2 border-border rounded-md overflow-hidden">
                <div className="grid grid-cols-2 gap-0">
                  <div className="p-4 bg-purple-950/20 border-r-2 border-border">
                    <h3 className="text-xs font-bold text-purple-400 mb-2">REASONING</h3>
                    <p className="font-mono text-sm whitespace-pre-wrap">{entry.reasoning}</p>
                  </div>
                  <div className="p-4 bg-cyan-950/20">
                    <h3 className="text-xs font-bold text-cyan-400 mb-2">FUNCTION CALLS</h3>
                    <div className="space-y-2">
                      {entry.function_calls.map((fc, fcIndex) => (
                        <pre key={fcIndex} className="font-mono text-sm whitespace-pre-wrap">{fc}</pre>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 bg-accent-thin border-t-2 border-border">
                  <span className="text-xs text-muted-foreground font-mono">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Browserbase Session Embed */}
      {executionResult?.live_view_url && (
        <div className="accent-block">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl tracking-[0.05em]">Browser Session</h2>
            {executionResult.session_url && (
              <a
                href={executionResult.session_url}
                target="_blank"
                rel="noopener noreferrer"
                className="button-inline flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                Open in New Tab
              </a>
            )}
          </div>
          <div className="relative w-full bg-black rounded-md overflow-hidden border-2 border-border">
            <iframe
              src={executionResult.live_view_url}
              className="w-full"
              style={{ height: '800px', pointerEvents: 'none' }}
              sandbox="allow-same-origin allow-scripts"
              allow="clipboard-read; clipboard-write"
              title="Browser Session Live View"
            />
          </div>
        </div>
      )}

      {/* Results Section */}
      {executionResult && (
        <div className="accent-block">
          <h2 className="font-display text-xl tracking-[0.05em] mb-4">Results</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-muted-foreground text-sm">Status:</span>
              <p className={`font-mono ${executionResult.status === "success" ? "text-green-600" : "text-red-600"}`}>
                {executionResult.status}
              </p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground text-sm">Message:</span>
              <p className="font-mono text-sm">{executionResult.message}</p>
            </div>
            {executionResult.error && (
              <div>
                <span className="font-medium text-muted-foreground text-sm">Error Details:</span>
                <p className="font-mono text-sm text-red-600">{executionResult.error}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
