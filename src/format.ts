/**
 * Helpers de formato: convierte respuestas de GA4 en Markdown listo para Claude.
 */

import type { RunReportResponse, RunRealtimeReportResponse } from "./ga4.js";

type AnyResponse = RunReportResponse | RunRealtimeReportResponse;

/** Métricas que representan duraciones en segundos. */
const DURATION_METRICS = new Set([
  "averageSessionDuration",
  "userEngagementDuration",
]);

/** Métricas que representan ratios (0..1) y se muestran como porcentaje. */
const RATIO_METRICS = new Set(["bounceRate", "engagementRate"]);

/** Formatea segundos a "1h 2m 3s" / "2m 3s" / "3s". */
export function formatDuration(seconds: number | string): string {
  const s = Math.round(Number(seconds) || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

/** Formatea un valor de métrica según su tipo conocido. */
function formatMetricValue(metricName: string, raw: string): string {
  if (DURATION_METRICS.has(metricName)) return formatDuration(raw);
  if (RATIO_METRICS.has(metricName)) return `${(Number(raw) * 100).toFixed(1)}%`;
  const n = Number(raw);
  return Number.isFinite(n) ? n.toLocaleString("es-AR") : raw;
}

/** Convierte la respuesta en una tabla Markdown. */
export function buildMarkdownTable(response: AnyResponse, label: string): string {
  const rows = response.rows ?? [];
  if (rows.length === 0) {
    return `**${label}** — Sin datos para el período/criterio solicitado.`;
  }

  const dimHeaders = (response.dimensionHeaders ?? []).map((h) => h.name ?? "");
  const metHeaders = (response.metricHeaders ?? []).map((h) => h.name ?? "");
  const headers = [...dimHeaders, ...metHeaders];

  const bodyRows = rows.map((row) => {
    const dims = (row.dimensionValues ?? []).map((v) => v.value ?? "");
    const mets = (row.metricValues ?? []).map((v) => v.value ?? "");
    return [...dims, ...mets];
  });

  const divider = headers.map(() => "---").join(" | ");
  const tableBody = bodyRows.map((r) => `| ${r.join(" | ")} |`).join("\n");

  return (
    `**${label}**\n\n` +
    `| ${headers.join(" | ")} |\n` +
    `| ${divider} |\n` +
    tableBody
  );
}

/** Genera una línea de "TOTALES DEL PERÍODO" si la respuesta trae totals. */
export function buildTotals(response: RunReportResponse): string {
  const totals = response.totals ?? [];
  if (totals.length === 0) return "";

  const metHeaders = (response.metricHeaders ?? []).map((h) => h.name ?? "");
  const totalVals = (totals[0]?.metricValues ?? []).map((v) => v.value ?? "—");

  const pairs = metHeaders.map((name, i) => {
    const val = totalVals[i] ?? "—";
    return `**${name}**: ${val === "—" ? "—" : formatMetricValue(name, val)}`;
  });

  return pairs.length ? `\n\n**TOTALES DEL PERÍODO:** ${pairs.join(" | ")}` : "";
}
