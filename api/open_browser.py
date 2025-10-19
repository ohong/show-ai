#!/usr/bin/env python3
"""Helper script to open the persistent browser manually for logging into accounts."""

from playwright.sync_api import sync_playwright
from playwright_stealth.stealth import Stealth
import os

# Use the same user data directory as PlaywrightComputer
user_data_dir = "./browser_data"

print(f"Opening persistent browser (data stored in: {user_data_dir})")
print(f"Absolute path: {os.path.abspath(user_data_dir)}")

with sync_playwright() as p:
    context = p.chromium.launch_persistent_context(
        user_data_dir=user_data_dir,
        headless=False,
        viewport={"width": 1280, "height": 720},
        args=[
            "--disable-blink-features=AutomationControlled",
            "--disable-dev-shm-usage",
        ],
    )

    # Get existing page or create new one
    if context.pages:
        page = context.pages[0]
        print(f"Using existing page from persistent context")
    else:
        page = context.new_page()
        print(f"Created new page")

    # Check cookies
    all_cookies = context.cookies()
    print(f"Loaded {len(all_cookies)} cookies from persistent storage")

    # Apply stealth to avoid detection
    Stealth().apply_stealth_sync(page)

    page.goto("https://www.google.com")

    print("\n✓ Browser is open!")
    print("  - Log into your accounts")
    print("  - All cookies and data will persist")
    print("  - Stealth mode enabled to reduce captcha triggers")
    print("\nPress Enter to close the browser...")
    input()

    context.close()
    print("Browser closed.")
