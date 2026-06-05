/**
 * Tool: get_ga4_metrics_reference
 * Devuelve la referencia completa de métricas, dimensiones y arquitectura.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Ga4Context } from "../ga4.js";
import { runTool, textResult } from "../errors.js";
import {
  METRICS_REF,
  DIMENSIONS_REF,
  ARCHITECTURE_NOTES,
  DATE_FORMATS_HELP,
  PROPERTIES_HELP,
} from "../reference.js";

export function registerMetricsReference(server: McpServer, ctx: Ga4Context): void {
  server.registerTool(
    "get_ga4_metrics_reference",
    {
      title: "Referencia GA4 de Bonda",
      description:
        "Lista completa de métricas, dimensiones y dimensiones custom de Bonda (tenant, item_name, etc.), " +
        "más notas de arquitectura para cruzar datos GA4 <-> Metabase (join vía hostname o tenant). " +
        "Llamala primero si no estás seguro de qué métricas/dimensiones existen.",
      inputSchema: {},
    },
    async () =>
      runTool("get_ga4_metrics_reference", async () =>
        textResult(
          `**Referencia GA4 — Bonda** (default property: ${ctx.config.defaultPropertyId})\n` +
            PROPERTIES_HELP +
            "\n" +
            METRICS_REF +
            DIMENSIONS_REF +
            ARCHITECTURE_NOTES +
            "\n" +
            DATE_FORMATS_HELP +
            "\n**Límite de filas:** hasta 500 por defecto (configurable con el parámetro limit).",
        ),
      ),
  );
}
