#!/usr/bin/env node
/**
 * Bonda GA4 MCP Server
 * Conecta Google Analytics 4 a Claude vía Model Context Protocol (stdio).
 *
 * Autenticación: Service Account de Google (ver src/config.ts).
 * Empaquetable como extensión de Claude Desktop (.mcpb) — ver manifest.json.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createContext } from "./ga4.js";
import { registerAllTools } from "./tools/index.js";

async function main(): Promise<void> {
  // Resuelve credenciales y crea el cliente GA4. Falla temprano y claro si faltan.
  let ctx;
  try {
    ctx = createContext();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[bonda-ga4-mcp] ERROR DE CONFIGURACIÓN:\n${msg}\n`);
    process.exit(1);
  }

  const server = new McpServer({
    name: "bonda-ga4-mcp",
    version: "1.0.0",
  });

  registerAllTools(server, ctx);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.stderr.write(
    `[bonda-ga4-mcp] Servidor iniciado. ` +
      `Auth: ${ctx.config.authSummary}. ` +
      `Default property: ${ctx.config.defaultPropertyId}.\n`,
  );
}

main().catch((error) => {
  const msg = error instanceof Error ? error.stack ?? error.message : String(error);
  process.stderr.write(`[bonda-ga4-mcp] Error fatal: ${msg}\n`);
  process.exit(1);
});
