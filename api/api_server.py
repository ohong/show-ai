#!/usr/bin/env python3
"""FastAPI server for browser automation API endpoints."""

import os
import logging
import sys
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, AsyncGenerator
import traceback
import asyncio
import json
from datetime import datetime

from agent import BrowserAgent
from computers import BrowserbaseComputer, PlaywrightComputer

# Load environment variables from .env.local in parent directory
env_path = Path(__file__).parent.parent / '.env.local'
if env_path.exists():
    load_dotenv(env_path)
    logger_setup = logging.getLogger(__name__)
    logger_setup.info(f"Loaded environment variables from {env_path}")
else:
    # Try .env as fallback
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        load_dotenv(env_path)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Constants
PLAYWRIGHT_SCREEN_SIZE = (1440, 900)

# FastAPI app
app = FastAPI(
    title="Browser Automation API",
    description="API for Gemini computer use with Playwright and Browserbase",
    version="1.0.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class BrowserTaskRequest(BaseModel):
    query: str
    env: str = "browserbase"  # "browserbase" or "playwright"
    use_proxy: bool = False
    context_id: Optional[str] = None
    persist_context: bool = True
    initial_url: str = "https://www.google.com"
    highlight_mouse: bool = False
    model: str = "gemini-2.5-computer-use-preview-10-2025"


class BrowserTaskResponse(BaseModel):
    status: str
    message: str
    session_url: Optional[str] = None
    live_view_url: Optional[str] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    version: str
    environments: list[str]


# Health check endpoint
@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint to verify API is running."""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        environments=["browserbase", "playwright"]
    )


# Main execution endpoint (non-streaming)
@app.post("/api/execute", response_model=BrowserTaskResponse)
async def execute_browser_task(request: BrowserTaskRequest):
    """
    Execute a browser automation task using Gemini computer use.

    Args:
        request: Browser task configuration

    Returns:
        Task execution result with status and session URL
    """
    try:
        logger.info(f"Starting execution with query: {request.query[:100]}...")
        logger.info(f"Environment: {request.env}, Use proxy: {request.use_proxy}")

        # Validate environment
        if request.env not in ["browserbase", "playwright"]:
            logger.error(f"Invalid environment: {request.env}")
            raise HTTPException(
                status_code=400,
                detail=f"Invalid environment: {request.env}. Must be 'browserbase' or 'playwright'"
            )

        # Create appropriate environment
        if request.env == "playwright":
            logger.info("Creating Playwright environment")
            env = PlaywrightComputer(
                screen_size=PLAYWRIGHT_SCREEN_SIZE,
                initial_url=request.initial_url,
                highlight_mouse=request.highlight_mouse,
            )
        else:  # browserbase
            logger.info("Creating Browserbase environment")
            # Check for required env vars
            if "BROWSERBASE_API_KEY" not in os.environ:
                logger.error("BROWSERBASE_API_KEY not set")
                raise HTTPException(
                    status_code=500,
                    detail="BROWSERBASE_API_KEY environment variable not set"
                )
            if "BROWSERBASE_PROJECT_ID" not in os.environ:
                logger.error("BROWSERBASE_PROJECT_ID not set")
                raise HTTPException(
                    status_code=500,
                    detail="BROWSERBASE_PROJECT_ID environment variable not set"
                )

            env = BrowserbaseComputer(
                screen_size=PLAYWRIGHT_SCREEN_SIZE,
                initial_url=request.initial_url,
                context_id=request.context_id,
                persist_context=request.persist_context,
                use_proxy=request.use_proxy,
            )

        # Execute the task
        session_url = None
        live_view_url = None
        logger.info("Starting browser session")
        with env as browser_computer:
            # Capture session URL and live view URL if browserbase
            if request.env == "browserbase":
                session_url = f"https://browserbase.com/sessions/{env._session.id}"
                live_view_url = env._live_view_url
                logger.info(f"Browserbase session URL: {session_url}")
                logger.info(f"Browserbase live view URL: {live_view_url}")

            # Run the agent
            logger.info("Initializing agent")
            agent = BrowserAgent(
                browser_computer=browser_computer,
                query=request.query,
                model_name=request.model,
            )
            logger.info("Starting agent loop")
            agent.agent_loop()
            logger.info("Agent loop completed")

        logger.info("Execution completed successfully")
        return BrowserTaskResponse(
            status="success",
            message="Task completed successfully",
            session_url=session_url,
            live_view_url=live_view_url
        )

    except HTTPException as e:
        logger.error(f"HTTP Exception: {e.detail}")
        # Re-raise HTTP exceptions as-is
        raise

    except Exception as e:
        # Log the full traceback for debugging
        error_trace = traceback.format_exc()
        logger.error(f"Error executing task: {error_trace}")

        return BrowserTaskResponse(
            status="error",
            message="Task execution failed",
            error=str(e)
        )


# Streaming execution endpoint
@app.post("/api/execute-stream")
async def execute_browser_task_stream(request: BrowserTaskRequest):
    """
    Execute a browser automation task with streaming logs.

    Returns Server-Sent Events (SSE) with real-time execution logs.

    Note: This endpoint runs the synchronous browser automation in a thread
    to avoid async/sync conflicts with Playwright.
    """
    import queue
    import threading

    # Create a queue for passing logs from the thread to the async generator
    log_queue: queue.Queue = queue.Queue()

    def run_browser_automation():
        """Run browser automation in a separate thread."""
        try:
            log_queue.put(('log', f'Starting execution with query: {request.query[:100]}...'))
            log_queue.put(('log', f'Environment: {request.env}, Use proxy: {request.use_proxy}'))

            # Validate environment
            if request.env not in ["browserbase", "playwright"]:
                log_queue.put(('error', f'Invalid environment: {request.env}', None))
                return

            # Create appropriate environment
            if request.env == "playwright":
                log_queue.put(('log', 'Creating Playwright environment'))
                env = PlaywrightComputer(
                    screen_size=PLAYWRIGHT_SCREEN_SIZE,
                    initial_url=request.initial_url,
                    highlight_mouse=request.highlight_mouse,
                )
            else:  # browserbase
                log_queue.put(('log', 'Creating Browserbase environment'))

                # Check for required env vars
                if "BROWSERBASE_API_KEY" not in os.environ:
                    log_queue.put(('error', 'BROWSERBASE_API_KEY environment variable not set', None))
                    return
                if "BROWSERBASE_PROJECT_ID" not in os.environ:
                    log_queue.put(('error', 'BROWSERBASE_PROJECT_ID environment variable not set', None))
                    return

                env = BrowserbaseComputer(
                    screen_size=PLAYWRIGHT_SCREEN_SIZE,
                    initial_url=request.initial_url,
                    context_id=request.context_id,
                    persist_context=request.persist_context,
                    use_proxy=request.use_proxy,
                )

            # Execute the task
            session_url = None
            live_view_url = None
            log_queue.put(('log', 'Starting browser session'))

            with env as browser_computer:
                # Capture session URL and live view URL if browserbase
                if request.env == "browserbase":
                    session_url = f"https://browserbase.com/sessions/{env._session.id}"
                    live_view_url = env._live_view_url
                    log_queue.put(('live_view_url', live_view_url))
                    log_queue.put(('session_url', session_url))
                    log_queue.put(('log', f'Session URL: {session_url}'))
                    log_queue.put(('log', f'Live View URL: {live_view_url}'))

                # Run the agent
                log_queue.put(('log', 'Initializing browser agent'))
                agent = BrowserAgent(
                    browser_computer=browser_computer,
                    query=request.query,
                    model_name=request.model,
                )

                log_queue.put(('log', 'Starting agent execution loop'))
                agent.agent_loop()
                log_queue.put(('log', 'Agent loop completed'))

            log_queue.put(('success', 'Execution completed successfully', session_url, live_view_url))

        except Exception as e:
            error_trace = traceback.format_exc()
            logger.error(f"Error in streaming execution: {error_trace}")
            log_queue.put(('error', str(e), error_trace))
        finally:
            log_queue.put(('done', None))

    async def generate_logs() -> AsyncGenerator[str, None]:
        """Generate SSE events from the queue."""
        # Start browser automation in a separate thread
        thread = threading.Thread(target=run_browser_automation)
        thread.start()

        try:
            while True:
                # Check queue with timeout to allow async context switching
                try:
                    await asyncio.sleep(0.1)  # Allow other async tasks to run

                    # Get all available messages from queue
                    while not log_queue.empty():
                        message = log_queue.get_nowait()

                        if message[0] == 'done':
                            return
                        elif message[0] == 'log':
                            yield f"data: {json.dumps({'type': 'log', 'message': message[1]})}\n\n"
                        elif message[0] == 'live_view_url':
                            yield f"data: {json.dumps({'type': 'live_view_url', 'url': message[1]})}\n\n"
                        elif message[0] == 'session_url':
                            yield f"data: {json.dumps({'type': 'session_url', 'url': message[1]})}\n\n"
                        elif message[0] == 'success':
                            yield f"data: {json.dumps({'type': 'success', 'message': message[1], 'session_url': message[2], 'live_view_url': message[3]})}\n\n"
                        elif message[0] == 'error':
                            yield f"data: {json.dumps({'type': 'error', 'message': message[1], 'traceback': message[2]})}\n\n"

                except queue.Empty:
                    continue

        finally:
            thread.join(timeout=5)  # Wait for thread to finish

    return StreamingResponse(
        generate_logs(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Browser Automation API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "execute": "/api/execute (POST)",
        },
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
