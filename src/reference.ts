/**
 * Referencia de métricas, dimensiones y arquitectura de Bonda en GA4.
 * Se embebe en las descripciones de las tools y la expone get_ga4_metrics_reference.
 */

export const METRICS_REF = `
MÉTRICAS DISPONIBLES (usar el nombre exacto de API):
  Usuarios:
    activeUsers              — Usuarios activos en el período
    newUsers                 — Usuarios nuevos (primera visita)
    totalUsers               — Total de usuarios únicos
  Sesiones:
    sessions                 — Total de sesiones
    engagedSessions          — Sesiones con engagement (>10s o conversión)
    bounceRate               — Tasa de rebote (0 a 1)
    averageSessionDuration   — Duración promedio de sesión en segundos
    sessionsPerUser          — Sesiones por usuario
  Páginas / Contenido:
    screenPageViews          — Vistas de página o pantalla
    screenPageViewsPerSession — Páginas por sesión
  Eventos:
    eventCount               — Total de eventos
    eventCountPerUser        — Eventos por usuario
    conversions              — Eventos marcados como conversiones
  Engagement:
    userEngagementDuration   — Tiempo total de engagement en segundos
    engagementRate           — Tasa de engagement (0 a 1)

NOTA: Bonda NO tiene e-commerce configurado. totalRevenue/purchaseRevenue/transactions están vacías.
Los canjes se trackean como eventos: orderCoupon (cupones) y orderVoucher/spend_virtual_currency (puntos).
`;

export const DIMENSIONS_REF = `
DIMENSIONES DISPONIBLES (usar el nombre exacto de API):
  Tiempo:
    date          — Fecha YYYYMMDD
    dateHour      — Fecha+hora YYYYMMDDHH
    week          — Semana YYYYWW
    month         — Mes YYYYMM
    year          — Año YYYY
  Geografía:
    country       — País (nombre en inglés)
    countryId     — Código ISO del país (AR, BR, US...)
    city          — Ciudad
    region        — Provincia/Estado
  Dispositivo:
    deviceCategory       — desktop / mobile / tablet
    operatingSystem      — Windows, iOS, Android...
    browser              — Chrome, Safari, Firefox...
  Tráfico:
    sessionSourceMedium  — Fuente/Medio (ej: google/organic)
    sessionSource        — Solo fuente (ej: google)
    sessionMedium        — Solo medio (ej: organic, cpc)
    sessionCampaignName  — Nombre de campaña UTM
    firstUserSourceMedium — Fuente de adquisición del usuario
  Contenido:
    pagePath             — Ruta de la URL (ej: /checkout)
    pageTitle            — Título de la página
    landingPage          — Página de entrada
    hostname             — Dominio del micrositio (ej: gopassplus.com, pwcbeneficios.bonda.com).
                           CLAVE para análisis por cliente. JOIN con Metabase vía domain_processes.
                           Excluir demos: *.demo.bonda.com, partnerstest.*, development.cuponstar.com
  Eventos:
    eventName            — Nombre del evento
  Plataforma:
    platform             — web / iOS / Android

DIMENSIONES CUSTOM DE BONDA (usar el nombre exacto con prefijo):
  Propiedades de usuario (ámbito sesión/usuario):
    customUser:tenant            — Micrositio del usuario logueado. Formato: "(microsite_id) Nombre Sitio"
                                   Ejemplo: "(912049) Gopass Plus". El número entre paréntesis es el
                                   microsites.id de Metabase — JOIN DIRECTO sin domain_processes.
                                   (not set) = usuario anónimo/pre-login (~20% de sesiones).
    customUser:user_segmentation — Segmento del afiliado dentro del tenant.
                                   Formato: "(segment_id) Nombre Segmento".
                                   Útil para análisis de engagement por segmento de afiliado.

  Parámetros de evento (ámbito evento — usar con dimension_filter por eventName):
    customEvent:item_name        — Cupón canjeado. Formato: "(coupon_id) - partner_name | Partner: partner_name"
                                   Ejemplo: "(13000) - Samsung | Partner: Samsung"
                                   El coupon_id es el coupons.id de Metabase.
                                   Usar con eventName=orderCoupon para análisis de canjes.
    customEvent:type             — Tipo de orden en conversiones (no se envía en orderCoupon, (not set) mayoritario).
    customEvent:label            — Label del evento. Ej: "beneficio propio" para OwnBenefitPageView.

EVENTOS DE NEGOCIO CLAVE (para dimension_filter eventName o análisis de eventCount):
  Canjes:
    orderCoupon            — Canje de cupón de descuento (~216K/90 días). Parámetro clave: item_name.
    orderVoucher           — Canje de voucher por puntos (~49K/90 días). Parámetro clave: item_name.
    spend_virtual_currency — Equivalente GA4 built-in de orderVoucher (puntos gastados, mismo volumen).
    orderCreatedFailed     — Canje fallido (~4K/90 días).
  Navegación / Engagement:
    ClusterClicked         — Click en categoría de beneficios (~1M/90 días).
    BannerClicked          — Click en banner (~134K/90 días).
    OwnBenefitPageView     — Vista de página de Beneficio Propio (~53K/90 días).
    points_transfer_success — Transferencia de puntos exitosa (~469/90 días).
  Técnicos (ignorar en análisis de negocio):
    backend_load_time, interactive_load_time — métricas de performance, no de negocio.
`;

export const ARCHITECTURE_NOTES = `
ARQUITECTURA PARA QUERIES CRUZADAS GA4 <-> METABASE:

JOIN via customUser:tenant (para usuarios logueados):
  GA4 tenant "(912049) Gopass Plus" → extraer número → Metabase microsites.id = 912049
  Cubre ~80% de sesiones (usuarios logueados).

JOIN via hostname (para TODAS las sesiones incluyendo anónimas):
  GA4 hostname "gopassplus.com" → Metabase domain_processes.desktop_domain → domainable_id = microsite_id
  SQL de mapeo:
    SELECT DISTINCT
      CASE WHEN COALESCE(dp.subdomain,'')='' THEN dp.desktop_domain
           ELSE CONCAT(dp.subdomain,'.',dp.desktop_domain) END AS ga4_hostname,
      dp.domainable_id AS microsite_id
    FROM domain_processes dp
    WHERE dp.domainable_type = 'App\\\\Microsite'

FILTROS DE CALIDAD EN GA4 (equivalente a Regla 18 de Metabase):
  Excluir ambientes no-productivos (dimension_filter hostname NOT IN):
    *.demo.bonda.com, partnerstest.*, development.cuponstar.com, demo.bonda.com
  Incluir como producción:
    *.beta.cuponstar.com, *.beta.bonda.com → son clientes reales en tier beta del producto.
`;

export const DATE_FORMATS_HELP =
  'Formatos de fecha: "YYYY-MM-DD", "today", "yesterday", "NdaysAgo" (ej: "30daysAgo", "7daysAgo").';

/** Lista de properties para incluir en descripciones de tools. */
export const PROPERTIES_HELP = `PROPERTIES DISPONIBLES (parámetro property_id):
  325524662 → PWA Micrositios (default — multi-tenant clientes B2B)
  407434664 → admin.bonda.com (backoffice interno)
  442187277 → copa.futbol (prode multi-tenant)
  402547458 → bonda.com (sitio corporativo / marketing)`;
