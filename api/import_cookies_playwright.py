#!/usr/bin/env python3
"""Import cookies from a JSON file into a Playwright persistent browser."""

import os
import json
import sys
from playwright.sync_api import sync_playwright

# Configuration
user_data_dir = "./browser_data"
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


def main():
    # Parse arguments
    cookie_file = sys.argv[1] if len(sys.argv) > 1 else default_cookie_file

    # Show help
    if "--help" in sys.argv or "-h" in sys.argv:
        print("Usage: python import_cookies_playwright.py [cookie_file.json]")
        print()
        print("Imports cookies from a JSON file into Playwright's persistent browser.")
        print("Default cookie file: canva_cookies.json")
        print()
        print("The cookies will be saved to ./browser_data/ and persist across sessions.")
        print()
        return 0

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
    print()

    # Determine target domain from cookies
    domains = set(c["domain"].lstrip(".") for c in playwright_cookies)
    target_domain = list(domains)[0] if domains else "www.canva.com"
    target_url = f"https://{target_domain}"

    print(f"Target domain: {target_domain}")
    print(f"User data directory: {user_data_dir}")
    print(f"Absolute path: {os.path.abspath(user_data_dir)}")
    print()

    # Open persistent browser and inject cookies
    print("Opening Playwright browser...")
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=user_data_dir,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
            ],
            headless=False,  # Show browser for verification
            viewport={"width": 1280, "height": 720},
        )

        # Get or create page
        if context.pages:
            page = context.pages[0]
        else:
            page = context.new_page()

        # Apply stealth
        try:
            from playwright_stealth.stealth import Stealth
            Stealth().apply_stealth_sync(page)
            print("✓ Stealth mode applied")
        except ImportError:
            print("⚠ playwright-stealth not installed, skipping stealth mode")

        # Add all cookies
        print(f"Injecting {len(playwright_cookies)} cookies...")
        context.add_cookies(playwright_cookies)
        print(f"✓ Successfully added cookies")

        # Visit the domain to ensure cookies are activated
        print(f"Visiting {target_url} to activate cookies...")
        page.goto(target_url)
        page.wait_for_load_state()
        print(f"✓ Visited {target_url}")
        print()

        print("Browser is open. Check if you're logged in!")
        print("Press Enter to close and save cookies...")
        input()

        # Close browser (automatically saves to user_data_dir)
        context.close()

    print()
    print(f"✓ Cookies saved to {user_data_dir}")
    print(f"✓ Cookies imported successfully!")
    print()
    print("Next steps:")
    print("  - Run: python main.py --env playwright")
    print("  - Or: python open_browser.py")
    print("  - Your session will be logged in automatically!")

    return 0


if __name__ == "__main__":
    exit(main())
