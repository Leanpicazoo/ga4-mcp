/**
 * Cliente de la Google Analytics Data API (GA4) y tipos compartidos.
 */

import { BetaAnalyticsDataClient } from "@google-analytics/data";
import type { google } from "@google-analytics/data/build/protos/protos.js";
import { loadConfig, type Ga4Config } from "./config.js";

export type RunReportRequest =
  google.analytics.data.v1beta.IRunReportRequest;
export type RunReportResponse =
  google.analytics.data.v1beta.IRunReportResponse;
export type RunRealtimeReportRequest =
  google.analytics.data.v1beta.IRunRealtimeReportRequest;
export type RunRealtimeReportResponse =
  google.analytics.data.v1beta.IRunRealtimeReportResponse;

/** Contexto inyectado a cada tool: cliente GA4 + configuración resuelta. */
export interface Ga4Context {
  client: BetaAnalyticsDataClient;
  config: Ga4Config;
}

/** Construye el contexto a partir del entorno. Lanza si faltan credenciales. */
export function createContext(env: NodeJS.ProcessEnv = process.env): Ga4Context {
  const config = loadConfig(env);
  const client = new BetaAnalyticsDataClient(config.clientOptions);
  return { client, config };
}

/** Resuelve el property a usar: el explícito de la tool o el default configurado. */
export function resolveProperty(ctx: Ga4Context, propertyId?: string): string {
  return (propertyId && propertyId.trim()) || ctx.config.defaultPropertyId;
}
