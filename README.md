# Bonda GA4 MCP

Servidor **MCP (Model Context Protocol)** que conecta las properties de **Google Analytics 4** de Bonda a Claude. Se distribuye como **extensión de Claude Desktop** (`.mcpb`): el usuario la habilita y configura desde la UI de extensiones, igual que el conector de Metabase — sin tocar `claude_desktop_config.json` a mano.

Una vez instalada, podés preguntar en lenguaje natural sobre tus datos de GA4 (usuarios, vistas, canjes, eventos) y cruzarlos con Metabase en la misma conversación.

---

## Autenticación: Service Account (decisión de arquitectura)

La extensión se autentica con un **Service Account de Google con permiso de solo lectura (Viewer)** sobre las properties de GA4. Se eligió sobre OAuth 2.0 porque:

- Es **nativo** al formato de extensiones de Claude Desktop (server stdio + variables de entorno); OAuth obligaría a implementar a mano el flujo, persistir/refrescar tokens y embeber un `client_secret` en el bundle.
- Bonda ya opera con **una identidad genérica compartida** sobre las mismas properties → un solo Service Account cubre a todo el equipo. **UX:** configurar una vez y listo.
- **Esfuerzo y mantenimiento** mucho menores.

Soporta dos formas de pasar las credenciales (elegir UNA):

1. **Archivo JSON del Service Account** (recomendado) → campo *Archivo JSON del Service Account*.
2. **`client_email` + `private_key`** sueltos → campos alternativos.

---

## Instalación para usuarios de Bonda (1 clic)

1. Descargá `bonda-ga4-mcp.mcpb` desde la sección **Releases** del repo (o el archivo que comparta el admin).
2. Abrí **Claude Desktop → Settings → Extensions**.
3. Arrastrá el `.mcpb` a la ventana (o **Install Extension** → seleccionar el archivo).
4. Completá la configuración:
   - **GA4 Property ID (por defecto):** `325524662` (PWA Micrositios) u otro.
   - **Archivo JSON del Service Account:** seleccioná el `.json` que te pasó el admin.
5. **Enable** y listo. Probá: *"¿Cuántos usuarios activos hubo en los últimos 7 días?"*

> El admin sólo necesita crear el Service Account una vez y darle acceso **Viewer** a las properties (pasos abajo). Luego distribuye el `.json` al equipo.

---

## Setup del Service Account (admin, una sola vez)

1. **Google Cloud Console** → crear/elegir proyecto → habilitar **Google Analytics Data API**.
2. **IAM & Admin → Service Accounts → Create Service Account** (ej: `bonda-ga4-mcp`).
3. En el Service Account → **Keys → Add Key → Create new key → JSON** → se descarga el `.json`.
4. **Google Analytics** (analytics.google.com) → **Admin → Property access management** → **+** → agregar el `client_email` del Service Account con rol **Viewer**. Repetir para cada property que se quiera consultar (325524662, 407434664, 442187277, 402547458).

---

## Properties de Bonda

| Property ID | Sitio |
|---|---|
| `325524662` | PWA Micrositios (Cuponstar/Bonda — multi-tenant, default) |
| `407434664` | admin.bonda.com (backoffice interno) |
| `442187277` | copa.futbol (prode multi-tenant) |
| `402547458` | bonda.com / HubSpot (corporativo) |

---

## Herramientas (tools)

| Tool | Qué hace |
|---|---|
| `get_active_users` | Usuarios activos / nuevos / totales en un rango, con desglose opcional. |
| `get_page_views` | Vistas de página y top de páginas más visitadas. |
| `run_ga4_report` | Reporte personalizado: cualquier métrica + dimensión + filtro + orden. |
| `run_ga4_realtime` | Datos en tiempo real (últimos 30 minutos). |
| `get_ga4_metrics_reference` | Referencia de métricas/dimensiones custom de Bonda + cómo cruzar con Metabase. |

Todas aceptan `property_id` para apuntar a cualquier property; si se omite, usan el default configurado. Soportan dimensiones custom de Bonda (`customUser:tenant`, `customEvent:item_name`, etc.) y filtros (`dimension_filter`, incluyendo listas y negación para excluir demos por `hostname`).

---

## Desarrollo

```bash
npm install          # instalar dependencias
npm run build        # compilar TypeScript → build/
npm run inspector    # depurar con el MCP Inspector
npm run mcpb:build   # empaquetar la extensión → bonda-ga4-mcp.mcpb
```

Para correr el server suelto (fuera de Claude Desktop), copiá `.env.example` a `.env`, completá las credenciales y `npm start`.

### Estructura

```
bonda-ga4-mcp/
├── manifest.json        # define los campos de la UI (user_config) y el comando del server
├── icon.png             # ícono de la extensión (reemplazar por el logo de Bonda)
├── package.json
├── tsconfig.json
├── .env.example
└── src/
    ├── index.ts         # bootstrap del server MCP (stdio)
    ├── config.ts        # resolución de credenciales del Service Account
    ├── ga4.ts           # cliente de la GA4 Data API + tipos
    ├── filters.ts       # construcción de filtros de dimensión
    ├── format.ts        # respuestas GA4 → tablas Markdown
    ├── reference.ts     # métricas/dimensiones/arquitectura de Bonda
    ├── errors.ts        # manejo uniforme de errores
    └── tools/           # una tool por archivo + registro central
```

> **Nota:** `icon.png` es un placeholder 1x1. Reemplazalo por el logo de Bonda (PNG cuadrado, ej. 256×256) antes de publicar.

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `GA4_PROPERTY_ID` | Property por defecto (default `325524662`). |
| `GOOGLE_APPLICATION_CREDENTIALS` | Ruta al JSON del Service Account (opción recomendada). |
| `GA4_CLIENT_EMAIL` | `client_email` del Service Account (alternativa). |
| `GA4_PRIVATE_KEY` | `private_key` del Service Account (alternativa). |

En la extensión de Claude Desktop, estos valores se cargan desde la UI y se mapean automáticamente vía `manifest.json`.

---

Licencia: MIT · Hecho para Bonda.
