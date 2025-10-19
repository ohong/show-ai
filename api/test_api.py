#!/usr/bin/env python3
"""Quick test script for the Browser Automation API."""

import requests
import json
import sys

# API base URL
BASE_URL = "http://localhost:8000"


def test_health():
    """Test the health check endpoint."""
    print("Testing /api/health...")
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()
    return response.status_code == 200


def test_execute(env="browserbase", query="Go to google.com", use_proxy=False):
    """Test the execute endpoint."""
    print(f"Testing /api/execute with env={env}...")
    print(f"Query: {query}")

    payload = {
        "query": query,
        "env": env,
        "use_proxy": use_proxy,
    }

    print(f"Request: {json.dumps(payload, indent=2)}")
    print()

    try:
        response = requests.post(
            f"{BASE_URL}/api/execute",
            json=payload,
            timeout=300  # 5 minute timeout for browser tasks
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print()
        return response.status_code == 200
    except requests.exceptions.Timeout:
        print("Request timed out (this is expected for long-running tasks)")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False


def main():
    """Run tests based on command line arguments."""
    print("=" * 60)
    print("Browser Automation API Test Script")
    print("=" * 60)
    print()

    # Check if server is running
    try:
        response = requests.get(BASE_URL, timeout=2)
        print(f"✓ Server is running at {BASE_URL}")
        print()
    except requests.exceptions.ConnectionError:
        print(f"✗ Server is not running at {BASE_URL}")
        print("Start the server with: uvicorn api_server:app --reload")
        return 1

    # Parse arguments
    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "health":
            test_health()

        elif command == "execute":
            env = sys.argv[2] if len(sys.argv) > 2 else "browserbase"
            query = sys.argv[3] if len(sys.argv) > 3 else "Go to google.com"
            test_execute(env=env, query=query)

        else:
            print(f"Unknown command: {command}")
            print("Usage: python test_api.py [health|execute] [env] [query]")
            return 1

    else:
        # Run all tests
        print("Running all tests...\n")

        # Test health
        if test_health():
            print("✓ Health check passed")
        else:
            print("✗ Health check failed")

        print()
        print("To test execution:")
        print("  python test_api.py execute browserbase 'Your query here'")
        print("  python test_api.py execute playwright 'Your query here'")

    return 0


if __name__ == "__main__":
    exit(main())
