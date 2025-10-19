# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
import argparse
import os

from agent import BrowserAgent
from computers import BrowserbaseComputer, PlaywrightComputer


PLAYWRIGHT_SCREEN_SIZE = (1440, 900)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the browser agent with a query.")
    parser.add_argument(
        "--query",
        type=str,
        required=False,
        default=None,
        help="The query for the browser agent to execute.",
    )
    parser.add_argument(
        "--prompt-file",
        type=str,
        default="weather.md",
        help="File containing the prompt (used if --query not provided).",
    )

    parser.add_argument(
        "--env",
        type=str,
        choices=("playwright", "browserbase"),
        default="playwright",
        help="The computer use environment to use.",
    )
    parser.add_argument(
        "--initial_url",
        type=str,
        default="https://www.google.com",
        help="The inital URL loaded for the computer.",
    )
    parser.add_argument(
        "--highlight_mouse",
        action="store_true",
        default=False,
        help="If possible, highlight the location of the mouse.",
    )
    parser.add_argument(
        "--model",
        default='gemini-2.5-computer-use-preview-10-2025',
        help="Set which main model to use.",
    )
    parser.add_argument(
        "--context-id",
        type=str,
        default=None,
        help="Browserbase context ID to use. If not provided, will auto-create or load from file.",
    )
    parser.add_argument(
        "--no-persist-context",
        action="store_true",
        default=False,
        help="Disable context persistence for Browserbase (cookies/auth won't be saved).",
    )
    parser.add_argument(
        "--use-proxy",
        action="store_true",
        default=False,
        help="Enable Browserbase built-in proxies (residential IPs for better captcha success).",
    )
    args = parser.parse_args()

    # Determine query source
    query = None
    if args.query:
        # Use command-line query if provided
        query = args.query
    elif os.path.exists(args.prompt_file):
        # Read from file
        print(f"Reading prompt from: {args.prompt_file}")
        with open(args.prompt_file, 'r') as f:
            query = f.read().strip()
        if not query:
            print(f"Error: {args.prompt_file} is empty")
            return 1
    else:
        print(f"Error: No query provided. Either use --query or create {args.prompt_file}")
        print(f"Example: echo 'Check the weather in New York' > {args.prompt_file}")
        return 1

    if args.env == "playwright":
        env = PlaywrightComputer(
            screen_size=PLAYWRIGHT_SCREEN_SIZE,
            initial_url=args.initial_url,
            highlight_mouse=args.highlight_mouse,
        )
    elif args.env == "browserbase":
        env = BrowserbaseComputer(
            screen_size=PLAYWRIGHT_SCREEN_SIZE,
            initial_url=args.initial_url,
            context_id=args.context_id,
            persist_context=not args.no_persist_context,
            use_proxy=args.use_proxy,
        )
    else:
        raise ValueError("Unknown environment: ", args.env)

    with env as browser_computer:
        agent = BrowserAgent(
            browser_computer=browser_computer,
            query=query,
            model_name=args.model,
        )
        agent.agent_loop()
    return 0


if __name__ == "__main__":
    main()
