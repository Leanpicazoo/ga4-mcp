**English** | [Español](README.es.md)

# ga4-mcp — Google Analytics 4 for Claude

Use your **Google Analytics 4** data from **Claude** in plain language.

This repository packages the **official Google Analytics MCP server**
([`googleanalytics/google-analytics-mcp`](https://github.com/googleanalytics/google-analytics-mcp),
PyPI [`analytics-mcp`](https://pypi.org/project/analytics-mcp/), maintained by the
Google Analytics team) as a **Claude Desktop extension** — so anyone can connect
their own GA4 account, the same way the community packaged Metabase.

It is **read‑only**: it can query your analytics, never modify settings.

---

## ⚠️ Read this first — what you need and how to make it work

This extension launches a **Python** program, so it **cannot be fully
self‑contained**. Before it works you must have a few things on your machine.
It takes about 10 minutes the first time.

### Step 0 — Prerequisites

| Requirement | How to install / check |
|---|---|
| **Python 3.10+** | `python3 --version`. If older: `brew install python` (macOS) or [python.org](https://www.python.org/downloads/). |
| **pipx** | `pipx --version`. If missing: `brew install pipx && pipx ensurepath` (macOS) or `python3 -m pip install --user pipx && python3 -m pipx ensurepath`. Then **restart your terminal**. |

### Step 1 — Enable the Google APIs

In a [Google Cloud project](https://console.cloud.google.com/), enable both:
- [Google Analytics Admin API](https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com)
- [Google Analytics Data API](https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com)

Note your **Project ID** (e.g. `my-project-123456`) — you'll need it later.

### Step 2 — Get credentials (`analytics.readonly` scope)

Pick **one** option:

**Option A — Service Account (simplest, recommended)**
1. Google Cloud Console → **IAM & Admin → Service Accounts → Create**.
2. Open the service account → **Keys → Add key → Create new key → JSON**. A `.json` file downloads — keep its path.
3. In [Google Analytics](https://analytics.google.com) → **Admin → Property access management** → add the service account's email with the **Viewer** role on the property you want to query.

**Option B — Your own Google login (OAuth via gcloud)**
```bash
gcloud auth application-default login \
  --scopes=https://www.googleapis.com/auth/analytics.readonly,https://www.googleapis.com/auth/cloud-platform
```
Copy the path it prints: `Credentials saved to file: [PATH]`.

### Step 3 — Install in Claude Desktop

**Method 1 — One‑click extension (.mcpb)**
1. Download `ga4-mcp.mcpb` from the [Releases](https://github.com/Leanpicazoo/ga4-mcp/releases) page.
2. Claude Desktop → **Settings → Extensions** → drag the `.mcpb` in (or **Install Extension**).
3. Fill the two fields:
   - **Credentials file** → path to the JSON from Step 2.
   - **Google Cloud Project ID** → from Step 1.
4. **Enable**.

> If after enabling Claude reports it can't find `pipx`, your GUI app isn't seeing
> your shell PATH. Use **Method 2** below (it lets you give the absolute path to pipx).

**Method 2 — Manual config (most reliable)**

Edit `claude_desktop_config.json`
(macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`,
Windows: `%APPDATA%\Claude\claude_desktop_config.json`) and add:

```json
{
  "mcpServers": {
    "ga4": {
      "command": "pipx",
      "args": ["run", "analytics-mcp"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/absolute/path/to/credentials.json",
        "GOOGLE_PROJECT_ID": "your-project-id"
      }
    }
  }
}
```

Tip: if `pipx` isn't found, replace `"command": "pipx"` with the absolute path
from `which pipx` (e.g. `/opt/homebrew/bin/pipx`). Restart Claude Desktop.

### Step 4 — Try it

Restart Claude Desktop and ask, for example:
- "What can the ga4 server do?"
- "List my Google Analytics properties."
- "What were my most popular events in the last 28 days?"
- "Active users by country in the last 7 days."

---

## Tools

| Tool | What it does |
|---|---|
| `get_account_summaries` | List your GA4 accounts and properties (auto‑discovery). |
| `get_property_details` | Details about a specific property. |
| `list_google_ads_links` | Google Ads links for a property. |
| `run_report` | Core report: metrics, dimensions, date ranges, filters. |
| `run_funnel_report` | Funnel report. |
| `get_custom_dimensions_and_metrics` | Custom dimensions/metrics of a property. |
| `run_realtime_report` | Realtime report (last 30 minutes). |

(Provided by the upstream official server.)

---

## Troubleshooting

- **`pipx: command not found`** → pipx isn't installed or not on PATH. Install it (Step 0) and `pipx ensurepath`, or use the absolute path (Method 2).
- **`Python 3.10+ required`** → upgrade Python (Step 0).
- **`PERMISSION_DENIED` / no data** → the credential's identity doesn't have access to the property. Add it as **Viewer** in GA4 (Step 2A).
- **`API has not been used / disabled`** → enable both APIs (Step 1) in the same project as your `GOOGLE_PROJECT_ID`.
- **First run is slow** → `pipx run` downloads the package the first time, then caches it.

---

## Build the extension yourself

```bash
npx @anthropic-ai/mcpb validate manifest.json
npx @anthropic-ai/mcpb pack          # produces ga4-mcp.mcpb
```

---

## Credits & license

- Upstream server: [googleanalytics/google-analytics-mcp](https://github.com/googleanalytics/google-analytics-mcp) (Google).
- This packaging: MIT (see [LICENSE](LICENSE)). Not an official Google product; it only repackages the official server for Claude Desktop.
