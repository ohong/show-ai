#!/usr/bin/env python3
"""Import cookies from a JSON file into a Browserbase context."""

import os
import json
import sys
import browserbase
from playwright.sync_api import sync_playwright

# Configuration
context_file = ".browserbase_context"
default_cookie_file = "canva_cookies.json"


def convert_firefox_to_playwright_cookie(firefox_cookie):
    """Convert Firefox cookie format to Playwright cookie format."""
    cookie = {
        "name": firefox_cookie["name"],
        "value": firefox_cookie["value"],
        "domain": firefox_cookie["domain"],
        "path": firefox_cookie["path"],
    }

    # Convert expiration (Firefox uses expirationDate, Playwright uses expires)
    if "expirationDate" in firefox_cookie and firefox_cookie["expirationDate"]:
        cookie["expires"] = int(firefox_cookie["expirationDate"])

    # Add httpOnly
    if "httpOnly" in firefox_cookie:
        cookie["httpOnly"] = firefox_cookie["httpOnly"]

    # Add secure
    if "secure" in firefox_cookie:
        cookie["secure"] = firefox_cookie["secure"]

    # Convert sameSite
    if "sameSite" in firefox_cookie:
        same_site = firefox_cookie["sameSite"]
        if same_site == "no_restriction":
            cookie["sameSite"] = "None"
        elif same_site == "unspecified":
            cookie["sameSite"] = "Lax"  # Default
        elif same_site in ["lax", "strict"]:
            cookie["sameSite"] = same_site.capitalize()
        else:
            cookie["sameSite"] = "Lax"

    return cookie


def load_context_id():
    """Load context ID from file if it exists."""
    if os.path.exists(context_file):
        with open(context_file, 'r') as f:
            context_id = f.read().strip()
            if context_id:
                return context_id
    return None


def save_context_id(context_id):
    """Save context ID to file."""
    with open(context_file, 'w') as f:
        f.write(context_id)


def create_or_load_context(bb):
    """Create a new context or load an existing one."""
    saved_context_id = load_context_id()
    if saved_context_id:
        print(f"Using saved context ID: {saved_context_id}")
        return saved_context_id

    print("Creating new Browserbase context...")
    context = bb.contexts.create(
        project_id=os.environ["BROWSERBASE_PROJECT_ID"]
    )
    print(f"Created new context ID: {context.id}")
    return context.id


def main():
    # Parse arguments
    cookie_file = sys.argv[1] if len(sys.argv) > 1 else default_cookie_file

    # Show help
    if "--help" in sys.argv or "-h" in sys.argv:
        print("Usage: python import_cookies_browserbase.py [cookie_file.json]")
        print()
        print("Imports cookies from a JSON file into a Browserbase context.")
        print("Default cookie file: canva_cookies.json")
        print()
        return 0

    # Check for required environment variables
    if "BROWSERBASE_API_KEY" not in os.environ:
        print("❌ Error: BROWSERBASE_API_KEY environment variable not set")
        return 1

    if "BROWSERBASE_PROJECT_ID" not in os.environ:
        print("❌ Error: BROWSERBASE_PROJECT_ID environment variable not set")
        return 1

    # Load cookies from file
    if not os.path.exists(cookie_file):
        print(f"❌ Error: Cookie file not found: {cookie_file}")
        return 1

    print(f"Loading cookies from: {cookie_file}")
    with open(cookie_file, 'r') as f:
        firefox_cookies = json.load(f)

    # Convert to Playwright format
    playwright_cookies = [convert_firefox_to_playwright_cookie(c) for c in firefox_cookies]
    print(f"Loaded {len(playwright_cookies)} cookies")

    # Initialize Browserbase
    bb = browserbase.Browserbase(api_key=os.environ["BROWSERBASE_API_KEY"])

    # Get or create context
    context_id = create_or_load_context(bb)

    # Create a temporary session to inject cookies
    print("Creating Browserbase session to inject cookies...")
    session = bb.sessions.create(
        project_id=os.environ["BROWSERBASE_PROJECT_ID"],
        browser_settings={
            "context": {
                "id": context_id,
                "persist": True,  # Important: persist changes
            },
            "viewport": {
                "width": 1440,
                "height": 900,
            },
        },
    )

    # Connect via Playwright and add cookies
    print("Injecting cookies into context...")
    playwright = sync_playwright().start()
    try:
        browser = playwright.chromium.connect_over_cdp(session.connect_url)
        context = browser.contexts[0]

        # Add all cookies
        context.add_cookies(playwright_cookies)
        print(f"✓ Successfully added {len(playwright_cookies)} cookies")

        # Visit the domain to ensure cookies are activated
        page = context.new_page()
        page.goto("https://platform.openai.com")
        page.wait_for_load_state()
        print("✓ Visited https://platform.openai.com to activate cookies")

        # Close everything to trigger context save
        page.close()
        context.close()
        browser.close()
    finally:
        playwright.stop()

    # IMPORTANT: Wait for context to finish saving
    # Browserbase docs: "there will be a brief delay before the updated context
    # state is ready for use in a new session"
    print("\nWaiting for context to sync...")
    time.sleep(5)  # Wait 5 seconds for context to fully save

    # Save context ID
    save_context_id(context_id)
    print(f"✓ Context saved to {context_file}")
    print(f"✓ Cookies imported successfully!")
    print()
    print("Next steps:")
    print(f"  - Wait a few seconds, then run: python main.py --env browserbase")
    print(f"  - Your session will be logged in automatically!")

    return 0


if __name__ == "__main__":
    exit(main())
