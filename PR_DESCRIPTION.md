# feat: Bonda GA4 MCP — extensión de Claude Desktop (.mcpb)

## Qué es
Nuevo servidor **MCP (Model Context Protocol)** que conecta las properties de **Google Analytics 4** de Bonda a Claude, empaquetable como **extensión de Claude Desktop** (`.mcpb`). Reemplaza el prototipo manual (`ga4-mcp/index.js` + edición a mano de `claude_desktop_config.json`) por un instalable de **1 clic** desde la UI de extensiones — mismo flujo que el conector comunitario de Metabase.

## Por qué
La instalación manual no escala al equipo de Bonda. Esta extensión permite que cualquier usuario la habilite y configure visualmente (Property ID + credenciales) sin tocar archivos de config.

## Decisión de arquitectura: autenticación
Se eligió **Service Account de Google (rol Viewer, solo lectura)** sobre OAuth 2.0:
- **Nativo** al formato de extensiones (server stdio + variables de entorno). OAuth exigiría implementar el flujo a mano, persistir/refrescar tokens y embeber un `client_secret` en el bundle distribuido.
- Bonda ya opera con identidad genérica compartida → **un** Service Account cubre a todo el equipo; se configura una sola vez.
- Mucho menor esfuerzo y mantenimiento.

Soporta dos formas de credencial: **archivo JSON** del Service Account (recomendado) o `client_email` + `private_key` sueltos.

## Qué incluye este PR
- `manifest.json` (MCPB v0.3): define los campos de la UI de Claude Desktop (`user_config`) y su mapeo a variables de entorno.
- Servidor MCP en **TypeScript** (`@modelcontextprotocol/sdk` + `@google-analytics/data` + `zod`), modular: `config`, `ga4`, `filters`, `format`, `errors`, `reference` y `tools/` (una tool por archivo).
- **5 tools**: `get_active_users`, `get_page_views`, `run_ga4_report` (reporte custom), `run_ga4_realtime`, `get_ga4_metrics_reference`.
- Soporte **multi-property** (4 properties de Bonda) y **dimensiones custom** (`customUser:tenant`, `customEvent:item_name`) + notas de cruce GA4 ↔ Metabase.
- `README.md`, `.env.example`, `.gitignore`, `tsconfig.json`, `package.json` con script `mcpb:build`.

## Verificaciones realizadas
- ✅ `tsc` compila en modo `strict` sin errores.
- ✅ Handshake MCP real (`initialize` + `tools/list`): las 5 tools se registran.
- ✅ Path de error sin credenciales devuelve mensaje accionable.
- ✅ `mcpb validate manifest.json` → *Manifest schema validation passes!*
- ✅ `mcpb pack` genera `bonda-ga4-mcp.mcpb` instalable.

## Pendientes antes de publicar (no bloqueantes)
- [ ] Reemplazar `icon.png` (hoy placeholder 1×1) por logo de Bonda 512×512.
- [ ] Ajustar la URL del repo en `manifest.json` y `package.json` al repo real de Bonda.
- [ ] Definir distribución del `.mcpb` (GitHub Releases) y del JSON del Service Account al equipo.

## Cómo probar
```bash
npm install
npm run build
npm run inspector   # MCP Inspector
npm run mcpb:build  # genera el .mcpb instalable
```

## ❓ Consulta al tech lead
¿A qué **repo/organización de GitHub de Bonda** publicamos? (ver opciones en el documento adjunto para el tech lead).
