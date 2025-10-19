#!/usr/bin/env python3
"""Login to a site manually and save ALL cookies (including HttpOnly)."""

import os
import json
import sys
from playwright.sync_api import sync_playwright
from playwright_stealth.stealth import Stealth

user_data_dir = "./browser_data"
target_url = sys.argv[1] if len(sys.argv) > 1 else "https://app.ynab.com"
output_file = "cookies_complete.json"

print(f"Login Helper Script")
print(f"===================")
print(f"Target URL: {target_url}")
print(f"User data directory: {os.path.abspath(user_data_dir)}")
print()

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

    # Get page
    if context.pages:
        page = context.pages[0]
    else:
        page = context.new_page()

    # Apply stealth
    Stealth().apply_stealth_sync(page)

    # Navigate to target
    print(f"Navigating to {target_url}...")
    page.goto(target_url)
    page.wait_for_load_state()

    print()
    print("=" * 60)
    print("INSTRUCTIONS:")
    print("1. Login to your account in the browser window")
    print("2. Wait until you're fully logged in")
    print("3. Press Enter here to save cookies")
    print("=" * 60)
    print()

    input("Press Enter when logged in...")

    # Get ALL cookies (including HttpOnly)
    all_cookies = context.cookies()

    print(f"\n✓ Captured {len(all_cookies)} cookies")

    # Check for HttpOnly cookies
    httponly_count = sum(1 for c in all_cookies if c.get('httpOnly', False))
    print(f"✓ Including {httponly_count} HttpOnly cookies (these are usually auth cookies)")

    # Save to file
    with open(output_file, 'w') as f:
        json.dump(all_cookies, f, indent=2)

    print(f"\n✓ Saved to {output_file}")

    # Show sample
    print("\nSample cookies:")
    for cookie in all_cookies[:10]:
        httponly = " [HttpOnly]" if cookie.get('httpOnly') else ""
        secure = " [Secure]" if cookie.get('secure') else ""
        print(f"  - {cookie['name']}{httponly}{secure}")

    print("\n✓ Cookies are now saved in the persistent browser!")
    print("\nNext steps:")
    print(f"  - Run: python main.py --env playwright --initial_url {target_url}")
    print("  - You should stay logged in!")

    context.close()

print("\n✓ Done!")
