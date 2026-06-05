/**
 * Registro central de todas las tools del servidor.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Ga4Context } from "../ga4.js";
import { registerGetActiveUsers } from "./getActiveUsers.js";
import { registerGetPageViews } from "./getPageViews.js";
import { registerRunReport } from "./runReport.js";
import { registerRunRealtime } from "./runRealtime.js";
import { registerMetricsReference } from "./metricsReference.js";

export function registerAllTools(server: McpServer, ctx: Ga4Context): void {
  registerGetActiveUsers(server, ctx);
  registerGetPageViews(server, ctx);
  registerRunReport(server, ctx);
  registerRunRealtime(server, ctx);
  registerMetricsReference(server, ctx);
}
