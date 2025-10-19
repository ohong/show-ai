#!/usr/bin/env python3
"""Debug script to check cookies in Playwright persistent browser."""

import os
from playwright.sync_api import sync_playwright

user_data_dir = "./browser_data"

print(f"Checking cookies in: {user_data_dir}")
print(f"Absolute path: {os.path.abspath(user_data_dir)}")
print()

if not os.path.exists(user_data_dir):
    print(f"❌ User data directory does not exist: {user_data_dir}")
    print("Run import_cookies_playwright.py first!")
    exit(1)

print("Opening browser to check cookies...")
with sync_playwright() as p:
    context = p.chromium.launch_persistent_context(
        user_data_dir=user_data_dir,
        headless=False,
        viewport={"width": 1280, "height": 720},
    )

    # Get or create page
    if context.pages:
        page = context.pages[0]
        print(f"✓ Found {len(context.pages)} existing page(s)")
    else:
        page = context.new_page()
        print("Created new page")

    # Get all cookies
    all_cookies = context.cookies()
    print(f"\n📊 Total cookies stored: {len(all_cookies)}")

    if all_cookies:
        # Group by domain
        by_domain = {}
        for cookie in all_cookies:
            domain = cookie.get('domain', 'unknown')
            by_domain[domain] = by_domain.get(domain, 0) + 1

        print("\nCookies by domain:")
        for domain, count in sorted(by_domain.items()):
            print(f"  {domain}: {count} cookies")

        print("\nSample cookies:")
        for cookie in all_cookies[:5]:
            print(f"  - {cookie.get('name')} (domain: {cookie.get('domain')})")
    else:
        print("\n❌ No cookies found!")
        print("Run import_cookies_playwright.py to import cookies")

    print("\nPress Enter to close...")
    input()

    context.close()

print("✓ Done")
