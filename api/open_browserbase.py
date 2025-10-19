#!/usr/bin/env python3
"""Helper script to open a Browserbase session manually for logging into accounts."""

import os
import time
import sys
import browserbase

# Configuration
context_file = ".browserbase_context"
initial_url = "https://www.google.com"


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
    # Try to load from file
    saved_context_id = load_context_id()
    if saved_context_id:
        print(f"Using saved context ID: {saved_context_id}")
        return saved_context_id

    # Create new context
    print("Creating new Browserbase context...")
    context = bb.contexts.create(
        project_id=os.environ["BROWSERBASE_PROJECT_ID"]
    )
    print(f"Created new context ID: {context.id}")
    return context.id


def main():
    # Parse command-line arguments
    use_proxy = "--use-proxy" in sys.argv

    # Show help
    if "--help" in sys.argv or "-h" in sys.argv:
        print("Usage: python open_browserbase.py [--use-proxy]")
        print()
        print("Options:")
        print("  --use-proxy    Enable Browserbase residential proxies for better captcha success")
        print()
        return 0

    # Check for required environment variables
    if "BROWSERBASE_API_KEY" not in os.environ:
        print("❌ Error: BROWSERBASE_API_KEY environment variable not set")
        print("Set it with: export BROWSERBASE_API_KEY='your-api-key'")
        return 1

    if "BROWSERBASE_PROJECT_ID" not in os.environ:
        print("❌ Error: BROWSERBASE_PROJECT_ID environment variable not set")
        print("Set it with: export BROWSERBASE_PROJECT_ID='your-project-id'")
        return 1

    print(f"Opening Browserbase session (context stored in: {context_file})")
    if use_proxy:
        print("Proxy: Enabled (residential IPs)")
    print()

    # Initialize Browserbase client
    bb = browserbase.Browserbase(api_key=os.environ["BROWSERBASE_API_KEY"])

    # Get or create context
    context_id = create_or_load_context(bb)

    # Create session with context
    print("Creating Browserbase session...")

    # Build session parameters
    session_params = {
        "project_id": os.environ["BROWSERBASE_PROJECT_ID"],
        "browser_settings": {
            "context": {
                "id": context_id,
                "persist": True,
            },
            "viewport": {
                "width": 1440,
                "height": 900,
            },
        },
    }

    # Add proxy if enabled
    if use_proxy:
        session_params["proxies"] = [{
            "type": "browserbase",
            "geolocation": {
                "country": "US",  # Match your actual location
            }
        }]

    session = bb.sessions.create(**session_params)

    print()
    print("✓ Browserbase session created!")
    print()
    print(f"  Session ID: {session.id}")
    print(f"  Live View:  https://browserbase.com/sessions/{session.id}")
    print()
    print("  - Open the Live View URL in your browser to interact with the session")
    print("  - Log into your accounts")
    print("  - All cookies and data will persist for future sessions")
    print()
    print("Press Enter to end the session and save the context...")

    try:
        input()
    except KeyboardInterrupt:
        print("\n\nSession interrupted.")

    # Save context ID
    save_context_id(context_id)
    print(f"\n✓ Context ID saved to {context_file}")
    print("Closing session and waiting for context to sync...")

    # IMPORTANT: Wait for context to finish saving
    # Browserbase docs: "there will be a brief delay before the updated context
    # state is ready for use in a new session"
    import time
    time.sleep(5)  # Wait 5 seconds for context to fully save

    print("✓ Context should now be ready for reuse")
    print("\nYou can now run your automation with:")
    print(f"  python main.py --env browserbase")

    return 0


if __name__ == "__main__":
    exit(main())
