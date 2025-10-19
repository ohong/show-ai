#!/usr/bin/env python3
"""Test if cookies are actually working by visiting the target site."""

import os
from playwright.sync_api import sync_playwright
from playwright_stealth.stealth import Stealth

user_data_dir = "./browser_data"
test_url = "https://app.ynab.com/"  # Change this to your target site

print(f"Testing cookies for: {test_url}")
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

    # Get existing page
    if context.pages:
        page = context.pages[0]
        print("Using existing page")
    else:
        page = context.new_page()
        print("Created new page")

    # Apply stealth
    Stealth().apply_stealth_sync(page)

    # Check ALL cookies
    all_cookies = context.cookies()
    print(f"\n📊 Total cookies in storage: {len(all_cookies)}")

    # Group by domain
    by_domain = {}
    for cookie in all_cookies:
        domain = cookie.get('domain', 'unknown')
        by_domain[domain] = by_domain.get(domain, 0) + 1

    print("\nCookies by domain:")
    for domain, count in sorted(by_domain.items()):
        print(f"  {domain}: {count} cookies")

    # Navigate to the site
    print(f"\n🌐 Navigating to: {test_url}")
    page.goto(test_url)
    page.wait_for_load_state()

    # Check cookies for THIS specific domain
    from urllib.parse import urlparse
    parsed = urlparse(test_url)
    target_domain = parsed.netloc

    print(f"\n🔍 Checking cookies sent to: {target_domain}")

    # Get cookies for the current URL
    current_cookies = context.cookies(test_url)
    print(f"Cookies sent with request: {len(current_cookies)}")

    if current_cookies:
        print("\nCookies being used:")
        for cookie in current_cookies[:10]:  # Show first 10
            print(f"  - {cookie.get('name')} (domain: {cookie.get('domain')})")
    else:
        print("\n❌ NO COOKIES SENT!")
        print("This means cookies are stored but not matching the domain.")
        print(f"\nYour cookies are for these domains:")
        for domain in sorted(by_domain.keys()):
            print(f"  {domain}")
        print(f"\nBut you're visiting: {target_domain}")
        print("\n💡 Solution: Make sure cookie domains match the site you're visiting")

    # Check if we're logged in by looking for common login indicators
    print(f"\n🔐 Checking login status...")
    print(f"Current URL: {page.url}")
    print(f"Page title: {page.title()}")

    # Wait a bit for any redirects
    page.wait_for_timeout(2000)
    print(f"After wait - URL: {page.url}")

    print("\n👀 Browser is open - check if you're logged in!")
    print("Press Enter to close...")
    input()

    context.close()

print("\n✓ Test complete")
