/**
 * Configuración y resolución de credenciales del Service Account de GA4.
 *
 * Estrategia de autenticación (Fase 1 — Service Account):
 *   1. GOOGLE_APPLICATION_CREDENTIALS  → ruta al JSON del Service Account (recomendado).
 *      El cliente de Google la lee automáticamente (Application Default Credentials).
 *   2. GA4_CLIENT_EMAIL + GA4_PRIVATE_KEY → credenciales sueltas (alternativa).
 */

import type { ClientOptions } from "google-gax";

/** Properties de GA4 de Bonda, con su descripción legible. */
export const BONDA_PROPERTIES: Record<string, string> = {
  "325524662": "PWA Micrositios (Cuponstar/Bonda — multi-tenant, clientes B2B)",
  "407434664": "admin.bonda.com (backoffice interno)",
  "442187277": "copa.futbol (prode multi-tenant, activación Copa/Mundial)",
  "402547458": "bonda.com / HubSpot (sitio corporativo y marketing)",
};

/** Property por defecto si no hay env var configurada. */
const DEFAULT_PROPERTY_ID = "325524662";

/** Normaliza un valor de env: trata "" como ausente (Claude Desktop envía "" para campos vacíos). */
function clean(value: string | undefined): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

export interface Ga4Config {
  /** Property GA4 por defecto (resoluble por tool con property_id explícito). */
  defaultPropertyId: string;
  /** Opciones para construir el BetaAnalyticsDataClient. */
  clientOptions: ClientOptions;
  /** Resumen legible del método de auth, para logging. */
  authSummary: string;
}

/**
 * Lee el entorno y devuelve la configuración del cliente GA4.
 * Lanza un error claro si no hay credenciales válidas.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Ga4Config {
  const defaultPropertyId = clean(env.GA4_PROPERTY_ID) ?? DEFAULT_PROPERTY_ID;

  const credentialsFile = clean(env.GOOGLE_APPLICATION_CREDENTIALS);
  const clientEmail = clean(env.GA4_CLIENT_EMAIL);
  // La private key puede venir con \n escapados (desde .env o UI) — los normalizamos.
  const privateKey = clean(env.GA4_PRIVATE_KEY)?.replace(/\\n/g, "\n");

  // Opción A: archivo JSON (ADC). El cliente lo toma de GOOGLE_APPLICATION_CREDENTIALS.
  if (credentialsFile) {
    return {
      defaultPropertyId,
      clientOptions: { keyFilename: credentialsFile },
      authSummary: `Service Account (archivo JSON: ${credentialsFile})`,
    };
  }

  // Opción B: credenciales sueltas.
  if (clientEmail && privateKey) {
    return {
      defaultPropertyId,
      clientOptions: {
        credentials: { client_email: clientEmail, private_key: privateKey },
      },
      authSummary: `Service Account (client_email: ${clientEmail})`,
    };
  }

  throw new Error(
    "Faltan credenciales del Service Account de GA4.\n" +
      "Configurá una de estas opciones en la extensión de Claude Desktop:\n" +
      "  A) Archivo JSON del Service Account (GOOGLE_APPLICATION_CREDENTIALS), o\n" +
      "  B) client_email + private_key (GA4_CLIENT_EMAIL + GA4_PRIVATE_KEY).",
  );
}

/** Devuelve la etiqueta legible de un property. */
export function propertyLabel(propertyId: string): string {
  const desc = BONDA_PROPERTIES[propertyId];
  return desc ? `${propertyId} (${desc})` : propertyId;
}
