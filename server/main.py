#!/usr/bin/env python3
"""Entry point shim for the ga4-mcp Claude Desktop extension.

The actual MCP server is the official Google package `analytics-mcp`
(https://github.com/googleanalytics/google-analytics-mcp). The extension's
manifest launches it via `pipx run analytics-mcp`. This shim exists so the
extension has a valid Python entry point and also works if executed directly:
it simply hands off to `pipx run analytics-mcp`, inheriting the environment
(GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_PROJECT_ID).
"""
import os
import shutil
import sys


def main() -> None:
    pipx = shutil.which("pipx")
    if not pipx:
        sys.stderr.write(
            "[ga4-mcp] 'pipx' was not found on PATH.\n"
            "Install it (e.g. `brew install pipx && pipx ensurepath`) and restart.\n"
            "See: https://github.com/Leanpicazoo/ga4-mcp\n"
        )
        sys.exit(1)
    os.execv(pipx, [pipx, "run", "analytics-mcp"])


if __name__ == "__main__":
    main()
