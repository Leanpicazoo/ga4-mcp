[English](README.md) | **Español**

# ga4-mcp — Google Analytics 4 para Claude

Usá tus datos de **Google Analytics 4** desde **Claude** en lenguaje natural.

Este repositorio empaqueta el **servidor MCP oficial de Google Analytics**
([`googleanalytics/google-analytics-mcp`](https://github.com/googleanalytics/google-analytics-mcp),
paquete PyPI [`analytics-mcp`](https://pypi.org/project/analytics-mcp/), mantenido
por el equipo de Google Analytics) como una **extensión de Claude Desktop** — para
que cualquiera conecte su propia cuenta de GA4, igual que la comunidad empaquetó Metabase.

Es de **solo lectura**: consulta tus analytics, nunca modifica configuración.

---

## ⚠️ Leé esto primero — qué necesitás y cómo hacerlo funcionar

Esta extensión ejecuta un programa en **Python**, así que **no puede ser
totalmente autocontenida**. Antes de que funcione necesitás tener algunas cosas
instaladas. La primera vez lleva unos 10 minutos.

### Paso 0 — Prerrequisitos

| Requisito | Cómo instalar / verificar |
|---|---|
| **Python 3.10+** | `python3 --version`. Si es más viejo: `brew install python` (macOS) o [python.org](https://www.python.org/downloads/). |
| **pipx** | `pipx --version`. Si falta: `brew install pipx && pipx ensurepath` (macOS) o `python3 -m pip install --user pipx && python3 -m pipx ensurepath`. Después **reiniciá la terminal**. |

### Paso 1 — Habilitar las APIs de Google

En un [proyecto de Google Cloud](https://console.cloud.google.com/), habilitá ambas:
- [Google Analytics Admin API](https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com)
- [Google Analytics Data API](https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com)

Anotá tu **Project ID** (ej: `mi-proyecto-123456`) — lo vas a necesitar después.

### Paso 2 — Obtener credenciales (scope `analytics.readonly`)

Elegí **una** opción:

**Opción A — Service Account (la más simple, recomendada)**
1. Google Cloud Console → **IAM & Admin → Service Accounts → Create**.
2. Abrí el service account → **Keys → Add key → Create new key → JSON**. Se descarga un `.json` — guardá su ruta.
3. En [Google Analytics](https://analytics.google.com) → **Admin → Administración de acceso a la propiedad** → agregá el email del service account con rol **Viewer** en la property que quieras consultar.

**Opción B — Tu propio login de Google (OAuth con gcloud)**
```bash
gcloud auth application-default login \
  --scopes=https://www.googleapis.com/auth/analytics.readonly,https://www.googleapis.com/auth/cloud-platform
```
Copiá la ruta que imprime: `Credentials saved to file: [RUTA]`.

### Paso 3 — Instalar en Claude Desktop

**Método 1 — Extensión de un clic (.mcpb)**
1. Descargá `ga4-mcp.mcpb` desde la página de [Releases](https://github.com/Leanpicazoo/ga4-mcp/releases).
2. Claude Desktop → **Settings → Extensions** → arrastrá el `.mcpb` (o **Install Extension**).
3. Completá los dos campos:
   - **Credentials file** → ruta al JSON del Paso 2.
   - **Google Cloud Project ID** → del Paso 1.
4. **Enable**.

> Si al habilitar Claude dice que no encuentra `pipx`, tu app de escritorio no ve
> el PATH de tu shell. Usá el **Método 2** (te permite dar la ruta absoluta de pipx).

**Método 2 — Config manual (más confiable)**

Editá `claude_desktop_config.json`
(macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`,
Windows: `%APPDATA%\Claude\claude_desktop_config.json`) y agregá:

```json
{
  "mcpServers": {
    "Google analytics 4 - MCP": {
      "command": "pipx",
      "args": ["run", "analytics-mcp"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/ruta/absoluta/a/credentials.json",
        "GOOGLE_PROJECT_ID": "tu-project-id"
      }
    }
  }
}
```

Tip: si no encuentra `pipx`, reemplazá `"command": "pipx"` por la ruta absoluta
de `which pipx` (ej: `/opt/homebrew/bin/pipx`). Reiniciá Claude Desktop.

### Paso 4 — Probarlo

Reiniciá Claude Desktop y preguntá, por ejemplo:
- "¿Qué puede hacer el servidor de GA4?"
- "Listá mis properties de Google Analytics."
- "¿Cuáles fueron mis eventos más populares en los últimos 28 días?"
- "Usuarios activos por país en los últimos 7 días."

---

## Herramientas

| Tool | Qué hace |
|---|---|
| `get_account_summaries` | Lista tus cuentas y properties de GA4 (autodescubrimiento). |
| `get_property_details` | Detalles de una property específica. |
| `list_google_ads_links` | Vínculos a Google Ads de una property. |
| `list_property_annotations` | Anotaciones de una property. |
| `get_custom_dimensions_and_metrics` | Dimensiones/métricas custom de una property. |
| `run_report` | Reporte central: métricas, dimensiones, rangos de fechas, filtros. |
| `run_realtime_report` | Reporte en tiempo real (últimos 30 minutos). |
| `run_funnel_report` | Reporte de embudo (funnel). |
| `run_conversions_report` | Reporte de conversiones. |

(Provistas por el servidor oficial upstream.)

---

## Solución de problemas

- **`pipx: command not found`** → pipx no está instalado o no está en el PATH. Instalalo (Paso 0) y `pipx ensurepath`, o usá la ruta absoluta (Método 2).
- **`Python 3.10+ required`** → actualizá Python (Paso 0).
- **`PERMISSION_DENIED` / sin datos** → la identidad de la credencial no tiene acceso a la property. Agregala como **Viewer** en GA4 (Paso 2A).
- **`API has not been used / disabled`** → habilitá ambas APIs (Paso 1) en el mismo proyecto que tu `GOOGLE_PROJECT_ID`. (Las tools de "account/property" usan la Admin API; `run_report` usa la Data API.)
- **La primera ejecución es lenta** → `pipx run` descarga el paquete la primera vez y luego lo cachea.

---

## Construir la extensión vos mismo

```bash
npx @anthropic-ai/mcpb validate manifest.json
npx @anthropic-ai/mcpb pack          # genera ga4-mcp.mcpb
```

---

## Créditos y licencia

- Servidor upstream: [googleanalytics/google-analytics-mcp](https://github.com/googleanalytics/google-analytics-mcp) (Google).
- Este empaquetado: MIT (ver [LICENSE](LICENSE)). No es un producto oficial de Google; solo reempaqueta el servidor oficial para Claude Desktop.
