/**
 * Tool: run_ga4_report
 * Reporte GA4 totalmente personalizable (equivale a "get_custom_report").
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type Ga4Context, resolveProperty, type RunReportRequest } from "../ga4.js";
import { propertyLabel } from "../config.js";
import { buildMarkdownTable, buildTotals } from "../format.js";
import { buildDimensionFilter, dimensionFilterSchema } from "../filters.js";
import { runTool, textResult } from "../errors.js";
import {
  METRICS_REF,
  DIMENSIONS_REF,
  DATE_FORMATS_HELP,
  PROPERTIES_HELP,
} from "../reference.js";

export function registerRunReport(server: McpServer, ctx: Ga4Context): void {
  server.registerTool(
    "run_ga4_report",
    {
      title: "Reporte GA4 personalizado",
      description:
        "Ejecuta un reporte de Google Analytics 4 con cualquier combinación de métricas y dimensiones. " +
        "Es la herramienta más flexible: ideal para cruzar con datos de Metabase.\n\n" +
        PROPERTIES_HELP +
        "\n" +
        METRICS_REF +
        DIMENSIONS_REF +
        "\n" +
        DATE_FORMATS_HELP,
      inputSchema: {
        property_id: z
          .string()
          .optional()
          .describe('Property GA4 a consultar. Si se omite, usa el default configurado.'),
        metrics: z
          .array(z.string())
          .min(1)
          .describe('Métricas. Ej: ["sessions","activeUsers","newUsers"]'),
        dimensions: z
          .array(z.string())
          .optional()
          .describe('Dimensiones para agrupar. Ej: ["date","country"]. Opcional.'),
        start_date: z.string().describe('Fecha inicio. Ej: "2024-01-01", "30daysAgo", "yesterday"'),
        end_date: z.string().describe('Fecha fin. Ej: "today", "2024-12-31"'),
        limit: z.number().int().positive().optional().describe("Máx. de filas (default 500)."),
        order_by_metric: z
          .string()
          .optional()
          .describe('Métrica para ordenar descendente. Ej: "sessions". Opcional.'),
        dimension_filter: dimensionFilterSchema.optional(),
      },
    },
    async (args) =>
      runTool("run_ga4_report", async () => {
        const propertyId = resolveProperty(ctx, args.property_id);

        const request: RunReportRequest = {
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: args.start_date, endDate: args.end_date }],
          metrics: args.metrics.map((name) => ({ name })),
          dimensions: (args.dimensions ?? []).map((name) => ({ name })),
          limit: args.limit ?? 500,
        };

        if (args.order_by_metric) {
          request.orderBys = [
            { metric: { metricName: args.order_by_metric }, desc: true },
          ];
        }

        const dimensionFilter = buildDimensionFilter(args.dimension_filter);
        if (dimensionFilter) request.dimensionFilter = dimensionFilter;

        const [response] = await ctx.client.runReport(request);

        const label =
          `GA4 Report | Property: ${propertyLabel(propertyId)} | ` +
          `Período: ${args.start_date} → ${args.end_date} | ` +
          `Filas: ${response.rowCount ?? 0}`;

        return textResult(buildMarkdownTable(response, label) + buildTotals(response));
      }),
  );
}
