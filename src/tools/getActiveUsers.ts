/**
 * Tool: get_active_users
 * Atajo de conveniencia para usuarios activos / nuevos / totales.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type Ga4Context, resolveProperty, type RunReportRequest } from "../ga4.js";
import { propertyLabel } from "../config.js";
import { buildMarkdownTable, buildTotals } from "../format.js";
import { buildDimensionFilter, dimensionFilterSchema } from "../filters.js";
import { runTool, textResult } from "../errors.js";
import { DATE_FORMATS_HELP, PROPERTIES_HELP } from "../reference.js";

export function registerGetActiveUsers(server: McpServer, ctx: Ga4Context): void {
  server.registerTool(
    "get_active_users",
    {
      title: "Usuarios activos GA4",
      description:
        "Devuelve usuarios activos, nuevos y totales en un rango de fechas, con desglose opcional por dimensión " +
        "(ej: por date, country, deviceCategory, customUser:tenant).\n\n" +
        PROPERTIES_HELP +
        "\n" +
        DATE_FORMATS_HELP,
      inputSchema: {
        property_id: z.string().optional().describe("Property GA4. Si se omite, usa el default."),
        start_date: z.string().describe('Fecha inicio. Ej: "30daysAgo".'),
        end_date: z.string().describe('Fecha fin. Ej: "today".'),
        group_by: z
          .array(z.string())
          .optional()
          .describe('Dimensión(es) para desglosar. Ej: ["date"] o ["country"]. Opcional.'),
        limit: z.number().int().positive().optional().describe("Máx. de filas (default 500)."),
        dimension_filter: dimensionFilterSchema.optional(),
      },
    },
    async (args) =>
      runTool("get_active_users", async () => {
        const propertyId = resolveProperty(ctx, args.property_id);
        const dimensions = args.group_by ?? [];

        const request: RunReportRequest = {
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: args.start_date, endDate: args.end_date }],
          metrics: [
            { name: "activeUsers" },
            { name: "newUsers" },
            { name: "totalUsers" },
          ],
          dimensions: dimensions.map((name) => ({ name })),
          limit: args.limit ?? 500,
          orderBys: dimensions.length
            ? [{ metric: { metricName: "activeUsers" }, desc: true }]
            : undefined,
        };

        const dimensionFilter = buildDimensionFilter(args.dimension_filter);
        if (dimensionFilter) request.dimensionFilter = dimensionFilter;

        const [response] = await ctx.client.runReport(request);

        const label =
          `Usuarios activos | Property: ${propertyLabel(propertyId)} | ` +
          `Período: ${args.start_date} → ${args.end_date}`;

        return textResult(buildMarkdownTable(response, label) + buildTotals(response));
      }),
  );
}
