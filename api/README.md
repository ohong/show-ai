# Show AI - Backend API

Browser automation backend using Gemini 2.5 Computer Use, Browserbase, and Playwright.

## Quick Start

### 1. Installation

**Set up Python Virtual Environment and Install Dependencies**

```bash
cd api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**Install Playwright and Browser Dependencies**

```bash
# Install system dependencies required by Playwright for Chrome
playwright install-deps chrome

# Install the Chrome browser for Playwright
playwright install chrome
```

### 2. Configuration

You need a Gemini API key to use the agent:

```bash
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

**For Browserbase (recommended for production):**

```bash
export BROWSERBASE_API_KEY="YOUR_BROWSERBASE_API_KEY"
export BROWSERBASE_PROJECT_ID="YOUR_BROWSERBASE_PROJECT_ID"
```

### 3. Running the API Server

Start the FastAPI server:

```bash
cd api
source .venv/bin/activate
uvicorn api_server:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### 4. Running Direct CLI (Alternative)

You can also run browser automation directly from the command line:

```bash
python main.py --query "Go to Google and search for 'AI news'"
```

Or read prompts from a file:

```bash
python main.py --prompt-file weather.md --env browserbase
```

## API Endpoints

### POST /api/execute

Execute a browser automation task.

**Request Body:**
```json
{
  "query": "Go to Google and search for AI news",
  "env": "browserbase",
  "use_proxy": false,
  "context_id": null,
  "persist_context": true
}
```

**Response:**
```json
{
  "success": true,
  "result": "Task completed successfully",
  "session_url": "https://browserbase.com/sessions/...",
  "error": null
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-19T09:00:00"
}
```

## Available Environments

- **`playwright`**: Runs the browser locally using Playwright with persistent context
- **`browserbase`**: Connects to Browserbase (cloud browser) with context persistence

## CLI Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--query` | Natural language query for the browser agent | None |
| `--prompt-file` | Read prompt from file instead of --query | weather.md |
| `--env` | Environment: `playwright` or `browserbase` | Required |
| `--initial_url` | Initial URL to load | https://www.google.com |
| `--use-proxy` | Enable Browserbase residential proxies | False |
| `--context-id` | Use specific Browserbase context ID | None |
| `--no-persist-context` | Disable context persistence | False |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your API key for the Gemini model | Yes |
| `BROWSERBASE_API_KEY` | Your API key for Browserbase | When using browserbase |
| `BROWSERBASE_PROJECT_ID` | Your Project ID for Browserbase | When using browserbase |

## Helper Scripts

### Manual Login (Playwright)

Open a persistent browser to log into accounts manually:

```bash
python open_browser.py
```

All cookies and session data persist in `./browser_data/`

### Manual Login (Browserbase)

Open a Browserbase Live View session for manual login:

```bash
python open_browserbase.py --use-proxy
```

Context ID is saved to `.browserbase_context` for future sessions.

### Import Cookies

Import cookies from JSON files:

```bash
# For Playwright
python import_cookies_playwright.py cookies.json

# For Browserbase
python import_cookies_browserbase.py cookies.json
```

### Debug Cookies

Check stored cookies:

```bash
python debug_cookies.py
```

Test if cookies work on specific sites:

```bash
python test_cookies_active.py
```

## Testing

Test the FastAPI endpoints:

```bash
python test_api.py
```

Run unit tests:

```bash
python test_agent.py
python test_main.py
```

## Architecture

- **agent.py**: Core browser agent using Gemini Computer Use
- **api_server.py**: FastAPI wrapper for browser automation
- **main.py**: CLI entry point
- **computers/**: Browser environment implementations
  - **playwright/**: Local Playwright with persistent context
  - **browserbase/**: Cloud browser with context persistence

## Hackathon Context

This backend was built for a 24-hour hackathon. It runs locally and exposes browser automation via REST API for the Next.js frontend.
