/**
 * Manejo uniforme de errores: traduce errores de la GA4 API a mensajes útiles
 * y los devuelve como resultado de tool (isError: true).
 */

import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/** Resultado de texto simple para una tool. */
export function textResult(text: string, isError = false): CallToolResult {
  return { content: [{ type: "text", text }], isError };
}

/** Convierte cualquier error en un CallToolResult con mensaje accionable. */
export function toToolError(toolName: string, error: unknown): CallToolResult {
  const msg = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[bonda-ga4-mcp] Error en ${toolName}: ${msg}\n`);

  let userMsg = `**Error GA4:** ${msg}`;

  if (msg.includes("PERMISSION_DENIED")) {
    userMsg =
      "**Error de permisos:** El Service Account no tiene acceso a este property de GA4. " +
      'Agregá el client_email del Service Account como "Viewer" en GA4 → Admin → Administración de acceso al property.';
  } else if (msg.includes("INVALID_ARGUMENT")) {
    userMsg =
      `**Argumento inválido:** ${msg}\n` +
      "Verificá que los nombres de métricas/dimensiones sean correctos. " +
      "Usá get_ga4_metrics_reference para ver los disponibles.";
  } else if (msg.includes("UNAUTHENTICATED") || msg.includes("invalid_grant")) {
    userMsg =
      "**Error de autenticación:** Las credenciales del Service Account son inválidas o expiraron. " +
      "Revisá el archivo JSON (o GA4_CLIENT_EMAIL / GA4_PRIVATE_KEY) en la configuración de la extensión.";
  } else if (msg.includes("NOT_FOUND")) {
    userMsg =
      "**Property no encontrado:** Verificá que el property_id sea correcto y que el Service Account tenga acceso.";
  }

  return textResult(userMsg, true);
}

/** Envuelve un handler async, capturando y formateando errores. */
export async function runTool(
  toolName: string,
  handler: () => Promise<CallToolResult>,
): Promise<CallToolResult> {
  try {
    return await handler();
  } catch (error) {
    return toToolError(toolName, error);
  }
}
