#!/usr/bin/env python3
"""FastAPI server for browser automation API endpoints."""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import traceback

from agent import BrowserAgent
from computers import BrowserbaseComputer, PlaywrightComputer

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


# Main execution endpoint
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
        # Validate environment
        if request.env not in ["browserbase", "playwright"]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid environment: {request.env}. Must be 'browserbase' or 'playwright'"
            )

        # Create appropriate environment
        if request.env == "playwright":
            env = PlaywrightComputer(
                screen_size=PLAYWRIGHT_SCREEN_SIZE,
                initial_url=request.initial_url,
                highlight_mouse=request.highlight_mouse,
            )
        else:  # browserbase
            # Check for required env vars
            if "BROWSERBASE_API_KEY" not in os.environ:
                raise HTTPException(
                    status_code=500,
                    detail="BROWSERBASE_API_KEY environment variable not set"
                )
            if "BROWSERBASE_PROJECT_ID" not in os.environ:
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
        with env as browser_computer:
            # Capture session URL if browserbase
            if request.env == "browserbase":
                session_url = f"https://browserbase.com/sessions/{env._session.id}"

            # Run the agent
            agent = BrowserAgent(
                browser_computer=browser_computer,
                query=request.query,
                model_name=request.model,
            )
            agent.agent_loop()

        return BrowserTaskResponse(
            status="success",
            message="Task completed successfully",
            session_url=session_url
        )

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise

    except Exception as e:
        # Log the full traceback for debugging
        error_trace = traceback.format_exc()
        print(f"Error executing task: {error_trace}")

        return BrowserTaskResponse(
            status="error",
            message="Task execution failed",
            error=str(e)
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
