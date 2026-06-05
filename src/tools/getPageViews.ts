/**
 * Tool: get_page_views
 * Atajo de conveniencia para vistas de página y top de páginas.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type Ga4Context, resolveProperty, type RunReportRequest } from "../ga4.js";
import { propertyLabel } from "../config.js";
import { buildMarkdownTable, buildTotals } from "../format.js";
import { buildDimensionFilter, dimensionFilterSchema } from "../filters.js";
import { runTool, textResult } from "../errors.js";
import { DATE_FORMATS_HELP, PROPERTIES_HELP } from "../reference.js";

export function registerGetPageViews(server: McpServer, ctx: Ga4Context): void {
  server.registerTool(
    "get_page_views",
    {
      title: "Vistas de página GA4",
      description:
        "Devuelve vistas de página (screenPageViews) y usuarios activos. Por defecto muestra el TOP de páginas " +
        "(agrupado por pagePath) ordenado por vistas; se puede agrupar por otra dimensión (ej: date para serie temporal).\n\n" +
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
          .describe('Dimensión(es). Default ["pagePath"] (top páginas). Ej alternativo: ["date"].'),
        limit: z.number().int().positive().optional().describe("Máx. de filas (default 25)."),
        dimension_filter: dimensionFilterSchema.optional(),
      },
    },
    async (args) =>
      runTool("get_page_views", async () => {
        const propertyId = resolveProperty(ctx, args.property_id);
        const dimensions = args.group_by ?? ["pagePath"];

        const request: RunReportRequest = {
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: args.start_date, endDate: args.end_date }],
          metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
          dimensions: dimensions.map((name) => ({ name })),
          limit: args.limit ?? 25,
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        };

        const dimensionFilter = buildDimensionFilter(args.dimension_filter);
        if (dimensionFilter) request.dimensionFilter = dimensionFilter;

        const [response] = await ctx.client.runReport(request);

        const label =
          `Vistas de página | Property: ${propertyLabel(propertyId)} | ` +
          `Período: ${args.start_date} → ${args.end_date}`;

        return textResult(buildMarkdownTable(response, label) + buildTotals(response));
      }),
  );
}
