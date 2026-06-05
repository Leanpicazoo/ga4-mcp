/**
 * Tool: run_ga4_realtime
 * Datos en tiempo real (últimos 30 minutos).
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  type Ga4Context,
  resolveProperty,
  type RunRealtimeReportRequest,
} from "../ga4.js";
import { propertyLabel } from "../config.js";
import { buildMarkdownTable } from "../format.js";
import { runTool, textResult } from "../errors.js";
import { PROPERTIES_HELP } from "../reference.js";

export function registerRunRealtime(server: McpServer, ctx: Ga4Context): void {
  server.registerTool(
    "run_ga4_realtime",
    {
      title: "GA4 en tiempo real",
      description:
        "Datos en tiempo real de GA4 (últimos 30 minutos). Útil para ver actividad en vivo.\n\n" +
        PROPERTIES_HELP +
        "\n\nMétricas realtime: activeUsers, screenPageViews, eventCount.\n" +
        "Dimensiones realtime: country, city, deviceCategory, unifiedScreenName, eventName.",
      inputSchema: {
        property_id: z.string().optional().describe("Property GA4. Si se omite, usa el default."),
        metrics: z
          .array(z.string())
          .min(1)
          .describe('Métricas realtime. Ej: ["activeUsers","screenPageViews"]'),
        dimensions: z
          .array(z.string())
          .optional()
          .describe('Dimensiones realtime. Ej: ["country","deviceCategory"]. Opcional.'),
      },
    },
    async (args) =>
      runTool("run_ga4_realtime", async () => {
        const propertyId = resolveProperty(ctx, args.property_id);

        const request: RunRealtimeReportRequest = {
          property: `properties/${propertyId}`,
          metrics: args.metrics.map((name) => ({ name })),
          dimensions: (args.dimensions ?? []).map((name) => ({ name })),
        };

        const [response] = await ctx.client.runRealtimeReport(request);

        const label = `GA4 Tiempo Real | Property: ${propertyLabel(propertyId)} | Últimos 30 minutos`;
        return textResult(buildMarkdownTable(response, label));
      }),
  );
}
