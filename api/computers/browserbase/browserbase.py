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
import os
import termcolor
from ..playwright.playwright import PlaywrightComputer
import browserbase
from playwright.sync_api import sync_playwright


class BrowserbaseComputer(PlaywrightComputer):
    def __init__(
        self,
        screen_size: tuple[int, int],
        initial_url: str = "https://www.google.com",
        context_id: str = None,
        persist_context: bool = True,
        context_file: str = ".browserbase_context",
        use_proxy: bool = False,
    ):
        super().__init__(screen_size, initial_url)
        self._context_id = context_id
        self._persist_context = persist_context
        self._context_file = context_file
        self._use_proxy = use_proxy

    def _load_context_id(self) -> str:
        """Load context ID from file if it exists."""
        if os.path.exists(self._context_file):
            with open(self._context_file, 'r') as f:
                context_id = f.read().strip()
                if context_id:
                    return context_id
        return None

    def _save_context_id(self, context_id: str):
        """Save context ID to file."""
        with open(self._context_file, 'w') as f:
            f.write(context_id)

    def _create_or_load_context(self, browserbase_client):
        """Create a new context or load an existing one."""
        # If context_id was explicitly provided, use it
        if self._context_id:
            print(f"Using provided context ID: {self._context_id}")
            return self._context_id

        # Try to load from file
        saved_context_id = self._load_context_id()
        if saved_context_id:
            print(f"Using saved context ID: {saved_context_id}")
            return saved_context_id

        # Create new context
        print("Creating new Browserbase context...")
        context = browserbase_client.contexts.create(
            project_id=os.environ["BROWSERBASE_PROJECT_ID"]
        )
        print(f"Created new context ID: {context.id}")
        return context.id

    def __enter__(self):
        print("Creating session...")

        self._playwright = sync_playwright().start()
        self._browserbase = browserbase.Browserbase(
            api_key=os.environ["BROWSERBASE_API_KEY"]
        )

        # Get or create context
        self._active_context_id = self._create_or_load_context(self._browserbase)

        # Build browser settings
        browser_settings = {
            "fingerprint": {
                "screen": {
                    "maxWidth": 1920,
                    "maxHeight": 1080,
                    "minWidth": 1024,
                    "minHeight": 768,
                },
            },
            "viewport": {
                "width": self._screen_size[0],
                "height": self._screen_size[1],
            },
        }

        # Add context configuration if persistence is enabled
        if self._persist_context:
            browser_settings["context"] = {
                "id": self._active_context_id,
                "persist": True,
            }

        # Create session with optional proxy support
        session_params = {
            "project_id": os.environ["BROWSERBASE_PROJECT_ID"],
            "browser_settings": browser_settings,
        }

        # Add proxy configuration if enabled
        if self._use_proxy:
            session_params["proxies"] = [{
                "type": "browserbase",
                "geolocation": {
                    "country": "US",  # Residential IP in US
                }
            }]

        self._session = self._browserbase.sessions.create(**session_params)

        self._browser = self._playwright.chromium.connect_over_cdp(
            self._session.connect_url
        )
        self._context = self._browser.contexts[0]
        self._page = self._context.pages[0]
        self._page.goto(self._initial_url)

        self._context.on("page", self._handle_new_page)

        termcolor.cprint(
            f"Session started at https://browserbase.com/sessions/{self._session.id}",
            color="green",
            attrs=["bold"],
        )
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self._page.close()

        if self._context:
            self._context.close()

        if self._browser:
            self._browser.close()

        self._playwright.stop()

        # Save context ID to file if persistence is enabled and we have an active context
        if self._persist_context and hasattr(self, '_active_context_id') and self._active_context_id:
            self._save_context_id(self._active_context_id)
