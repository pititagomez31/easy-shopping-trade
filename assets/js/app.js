/**
 * ============================================================================
 * EASY SHOPPING TRADE CO. (CF) — MOTOR INTERACTIVO 1688 NEO-INDUSTRIAL (60 FPS)
 * Incluye:
 *  - Globo Marítimo 3D Wireframe (China -> Latinoamérica & España) en Naranja 1688
 *  - Botones Magnéticos (solo escritorio pointer:fine)
 *  - Ganancias Reales 1688 con fotos reales, enlaces 1688/ML y márgenes bloqueados
 *  - Calculadora 1688 Multi-Moneda en Tiempo Real (COP, MXN, CLP, PEN, ARS, USD, EUR)
 *    con Ruta Marítima DDP (tarifa interna oculta convertida a la moneda elegida)
 *  - Widget de Avatar Conversacional en Vivo (listo para HeyGen / WebRTC)
 * ============================================================================
 */

(function () {
  'use strict';

  const CONFIG = window.EST_CONFIG;
  const PRODUCTS = window.EST_PRODUCTS || [];
  const STORAGE_KEY = 'est_cf_margins_unlocked_v3';

  const state = {
    unlocked: localStorage.getItem(STORAGE_KEY) === 'true',
    activeHybridTab: 'radar',
    activeCurrency: 'COP',
    activeModuleId: CONFIG.academyModules[0]?.id || null,
    selectedProductForLead: 'Ganancias Reales 1688',
    b2bMode: 'validacion',
  };

  // ==========================================================================
  // FORMATO MULTI-MONEDA Y CÁLCULO FINANCIERO INTERNO
  // ==========================================================================

  const formatterCache = {};

  function formatCurrency(amount, currencyCode) {
    const cur = CONFIG.currencies[currencyCode] || CONFIG.currencies.COP;
    const key = `${cur.code}_${cur.decimals}`;
    if (!formatterCache[key]) {
      formatterCache[key] = new Intl.NumberFormat(cur.locale, {
        style: 'currency',
        currency: cur.code,
        minimumFractionDigits: cur.decimals,
        maximumFractionDigits: cur.decimals,
      });
    }
    const safeVal = Number.isFinite(amount) ? amount : 0;
    return formatterCache[key].format(cur.decimals === 0 ? Math.round(safeVal) : safeVal);
  }

  function formatCOP(value) {
    return formatCurrency(value, 'COP');
  }

  function convertCopTo(amountCop, currencyCode) {
    const cur = CONFIG.currencies[currencyCode] || CONFIG.currencies.COP;
    return amountCop / cur.copPerUnit;
  }

  function calculateProductMetrics(product) {
    const { ddpRatePerCbmCop, mlCommissionRate, cnyToCop, usdToCop } = CONFIG.pricing;

    const cbm =
      product.cbmOverride !== null && product.cbmOverride !== undefined
        ? product.cbmOverride
        : (product.dimensionsCm.l * product.dimensionsCm.w * product.dimensionsCm.h) / 1_000_000;

    // Usa el DDP exacto del CSV si está definido; si no, calcula por detrás sobre la tarifa marítima
    const ddpCostCop =
      product.ddpCopOverride !== null && product.ddpCopOverride !== undefined
        ? product.ddpCopOverride
        : cbm * ddpRatePerCbmCop;

    const rate = product.currency === 'USD' ? usdToCop : cnyToCop;
    const productCostCop = product.cost1688 * rate;
    const landedCostCop = productCostCop + ddpCostCop;

    let mlCommissionCop = 0;
    let netMarginCop = null;
    let roiPercent = null;

    if (product.marketPriceCop) {
      mlCommissionCop = product.channel === 'ml' ? product.marketPriceCop * mlCommissionRate : 0;
      netMarginCop = product.marketPriceCop - mlCommissionCop - landedCostCop;
      roiPercent = landedCostCop > 0 ? Math.round((netMarginCop / landedCostCop) * 100) : 0;
    }

    return {
      cbm,
      ddpCostCop,
      productCostCop,
      landedCostCop,
      mlCommissionCop,
      netMarginCop,
      roiPercent,
    };
  }

  function buildWhatsAppLink(message) {
    const num = (CONFIG.contact.whatsappNumber || '').replace(/\D/g, '');
    return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
  }

  // ==========================================================================
  // ICONOS LUCIDE-STYLE (STROKE 1.5 · CERO DEPENDENCIAS)
  // ==========================================================================

  const ICONS = {
    mic: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>',
    cube: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>',
    eye: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
    lock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    muted: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>',
    unmuted: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
  };

  // ==========================================================================
  // 1. GLOBO TERRÁQUEO 3D WEBGL (NASA NIGHT LIGHTS + RELIEVE + RUTAS REALES)
  // Motor Three.js / Globe.gl con textura satelital nocturna real, atmósfera
  // naranja 1688, corredores marítimos reales por el Pacífico y Canal de Suez,
  // balizas 3D en puertos y vuelos cinematográficos de cámara.
  // ==========================================================================

  function initSourcingGlobe() {
    const container = document.getElementById('globe-viz');
    const stage = document.getElementById('globe-stage');
    const routeIndicator = document.getElementById('globe-route-indicator');
    if (!container || !stage) return;

    if (typeof window.Globe !== 'function') {
      container.innerHTML =
        '<div style="display:grid;place-items:center;height:100%;padding:2rem;text-align:center;color:var(--text-secondary);font-size:0.85rem;">Cargando mapa 3D satelital... Verifica tu conexión a internet para visualizar el globo WebGL.</div>';
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Interpolación esférica 3D real entre waypoints (cruza la línea de 180° del Pacífico sin saltos)
    function interpolateSeaPath(waypoints, stepsPerLeg = 10, baseAlt = 0.012) {
      const toVec = (lat, lng) => {
        const la = (lat * Math.PI) / 180;
        const lo = (lng * Math.PI) / 180;
        return {
          x: Math.cos(la) * Math.cos(lo),
          y: Math.sin(la),
          z: Math.cos(la) * Math.sin(lo),
        };
      };
      const toLatLng = (v) => {
        const lat = (Math.asin(Math.max(-1, Math.min(1, v.y))) * 180) / Math.PI;
        const lng = (Math.atan2(v.z, v.x) * 180) / Math.PI;
        return { lat, lng };
      };

      const pts = [];
      const totalLegs = waypoints.length - 1;
      for (let i = 0; i < totalLegs; i++) {
        const a = toVec(waypoints[i][0], waypoints[i][1]);
        const b = toVec(waypoints[i + 1][0], waypoints[i + 1][1]);
        for (let s = 0; s < stepsPerLeg; s++) {
          const t = s / stepsPerLeg;
          let x = a.x * (1 - t) + b.x * t;
          let y = a.y * (1 - t) + b.y * t;
          let z = a.z * (1 - t) + b.z * t;
          const len = Math.hypot(x, y, z) || 1;
          const globalT = (i + t) / totalLegs;
          const alt = baseAlt + Math.sin(globalT * Math.PI) * 0.018;
          const ll = toLatLng({ x: x / len, y: y / len, z: z / len });
          pts.push({ lat: ll.lat, lng: ll.lng, alt });
        }
      }
      const last = waypoints[waypoints.length - 1];
      pts.push({ lat: last[0], lng: last[1], alt: baseAlt });
      return pts;
    }

    // Puertos reales de salida (China) y llegada (LATAM & España)
    const PORTS = [
      { id: 'NB', label: 'NINGBO · CHINA', lat: 29.87, lng: 121.55, type: 'origin', ringMax: 5.5 },
      { id: 'GZ', label: 'GUANGZHOU · CHINA', lat: 22.8, lng: 113.6, type: 'origin', ringMax: 5.5 },
      { id: 'MX', label: 'MANZANILLO · MX', lat: 19.05, lng: -104.32, type: 'dest', ringMax: 3.8 },
      { id: 'CO', label: 'BUENAVENTURA · CO', lat: 3.88, lng: -77.07, type: 'dest', ringMax: 4.5 },
      { id: 'PE', label: 'CALLAO · PE', lat: -12.05, lng: -77.14, type: 'dest', ringMax: 3.6 },
      { id: 'CL', label: 'VALPARAÍSO · CL', lat: -33.04, lng: -71.62, type: 'dest', ringMax: 3.8 },
      { id: 'AR', label: 'BUENOS AIRES · AR', lat: -34.6, lng: -58.38, type: 'dest', ringMax: 3.4 },
      { id: 'ES', label: 'VALENCIA · ESPAÑA', lat: 39.47, lng: -0.38, type: 'dest', ringMax: 4.6 },
    ];

    // Rutas marítimas reales por el Pacífico y Canal de Suez
    const pacificNorthCoords = [
      [29.87, 121.55], // Ningbo
      [30.5, 138.0],   // Sur de Japón
      [31.5, 162.0],   // Pacífico Norte Oeste
      [29.0, 179.0],   // Línea 180°
      [28.0, -168.0],  // Pacífico Norte Central
      [24.5, -146.0],  // Pacífico Central
      [21.2, -122.0],  // Aproximación México
      [19.05, -104.32],// Manzanillo, México
      [12.0, -92.0],   // Pacífico Centroamericano
      [5.5, -81.0],    // Golfo de Panamá
      [3.88, -77.07],  // Buenaventura, Colombia
    ];

    const pacificSouthCoords = [
      [22.8, 113.6],   // Guangzhou (Nansha)
      [19.5, 127.0],   // Mar de Filipinas
      [14.0, 152.0],   // Pacífico Oeste
      [8.5, 177.0],    // Cruce Pacífico Ecuatorial
      [2.0, -158.0],   // Pacífico Central
      [-4.2, -130.0],  // Pacífico Sur
      [-9.2, -102.0],  // Aproximación Sudamérica
      [-12.05, -77.14],// Callao, Perú
      [-23.0, -74.5],  // Costa Pacífico Sur
      [-33.04, -71.62],// Valparaíso, Chile
      [-48.0, -76.0],  // Patagonia Pacífico
      [-55.8, -68.0],  // Cabo de Hornos / Magallanes
      [-45.0, -62.5],  // Atlántico Sur
      [-34.6, -58.38], // Buenos Aires, Argentina
    ];

    const suezSpainCoords = [
      [29.87, 121.55], // Ningbo
      [22.8, 113.6],   // Guangzhou
      [12.0, 110.5],   // Mar de China Meridional
      [1.3, 103.8],    // Singapur / Estrecho de Malaca
      [6.0, 80.5],     // Océano Índico (Sri Lanka)
      [12.0, 56.0],    // Mar Arábigo
      [12.6, 44.0],    // Golfo de Adén
      [21.0, 38.2],    // Mar Rojo
      [30.5, 32.3],    // Canal de Suez
      [35.2, 18.0],    // Mediterráneo Central
      [39.47, -0.38],  // Valencia, España
    ];

    // Doble capa por ruta: carril base luminoso + flujo animado de buques en naranja 1688
    const PATHS_DATA = [
      {
        name: 'Corredor Base · Pacífico Norte',
        points: interpolateSeaPath(pacificNorthCoords, 8, 0.008),
        color: ['rgba(255, 80, 0, 0.34)', 'rgba(255, 140, 60, 0.34)'],
        stroke: 1.5,
        dashLen: 1,
        dashGap: 0,
        animTime: 0,
      },
      {
        name: 'Corredor Base · Pacífico Sur',
        points: interpolateSeaPath(pacificSouthCoords, 8, 0.008),
        color: ['rgba(255, 80, 0, 0.34)', 'rgba(255, 140, 60, 0.34)'],
        stroke: 1.5,
        dashLen: 1,
        dashGap: 0,
        animTime: 0,
      },
      {
        name: 'Corredor Base · Suez España',
        points: interpolateSeaPath(suezSpainCoords, 8, 0.008),
        color: ['rgba(255, 80, 0, 0.34)', 'rgba(52, 211, 153, 0.32)'],
        stroke: 1.5,
        dashLen: 1,
        dashGap: 0,
        animTime: 0,
      },
      {
        name: 'Ningbo → Pacífico → México & Colombia',
        points: interpolateSeaPath(pacificNorthCoords, 10, 0.015),
        color: ['#FF5000', '#FFD2A6'],
        stroke: 2.8,
        dashLen: 0.22,
        dashGap: 0.14,
        animTime: reducedMotion ? 0 : 5600,
      },
      {
        name: 'Guangzhou → Pacífico → Perú, Chile & Argentina',
        points: interpolateSeaPath(pacificSouthCoords, 10, 0.015),
        color: ['#FF6A00', '#34D399'],
        stroke: 2.8,
        dashLen: 0.22,
        dashGap: 0.14,
        animTime: reducedMotion ? 0 : 6400,
      },
      {
        name: 'Ningbo / Guangzhou → Malaca → Suez → Valencia (España)',
        points: interpolateSeaPath(suezSpainCoords, 10, 0.015),
        color: ['#FF5000', '#34D399'],
        stroke: 2.8,
        dashLen: 0.24,
        dashGap: 0.14,
        animTime: reducedMotion ? 0 : 5800,
      },
    ];

    // Puntos densos por corredor para navegar los buques suavemente sobre el océano
    const routePacNorthPts = interpolateSeaPath(pacificNorthCoords, 16, 0.022);
    const routePacSouthPts = interpolateSeaPath(pacificSouthCoords, 16, 0.022);
    const routeSuezSpainPts = interpolateSeaPath(suezSpainCoords, 16, 0.022);

    // Calcula dinámicamente la próxima fecha de corte semanal (1=Lunes ... 5=Viernes)
    function getNextWeeklyCutoff(targetDay, labelPrefix) {
      const now = new Date();
      const diff = (targetDay - now.getDay() + 7) % 7 || 7;
      const nextDate = new Date(now.getTime() + diff * 86400000);
      const formatted = nextDate.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
      return `${labelPrefix}: ${formatted}`;
    }

    // 5 Buques Portacontenedores activos en salidas semanales (estilo FlightRadar marítimo)
    const SHIPS = [
      {
        kind: 'ship',
        id: 'CF-PAC-01',
        name: 'MV Ningbo Express',
        routeLabel: 'Ningbo → Manzanillo (MX) → Buenaventura (CO)',
        points: routePacNorthPts,
        progress: 0.44,
        speed: 0.0014,
        zone: 'Océano Pacífico Norte · En tránsito',
        cargo: 'Consolidado semanal: Tecnología 1688, audio y carga rápida · 24 importadores a bordo.',
        nextCutoff: getNextWeeklyCutoff(5, 'Próximo zarpe semanal'),
        spaceLeft: '3.8 m³ libres',
      },
      {
        kind: 'ship',
        id: 'CF-PAC-02',
        name: 'MV Pacific Consolidator',
        routeLabel: 'Ningbo → Buenaventura (CO)',
        points: routePacNorthPts,
        progress: 0.82,
        speed: 0.0012,
        zone: 'Aproximación Pacífico · México / Colombia',
        cargo: 'Consolidado semanal: Cargadores GaN, accesorios tech y repuestos · 19 importadores.',
        nextCutoff: getNextWeeklyCutoff(5, 'Próximo zarpe semanal'),
        spaceLeft: '2.4 m³ libres',
      },
      {
        kind: 'ship',
        id: 'CF-AND-03',
        name: 'MV Canton Andes',
        routeLabel: 'Guangzhou → Callao (PE) → Valparaíso (CL)',
        points: routePacSouthPts,
        progress: 0.36,
        speed: 0.0013,
        zone: 'Océano Pacífico Ecuatorial · En tránsito',
        cargo: 'Consolidado semanal: Hardware B2B, electrónica y comercial · 21 importadores.',
        nextCutoff: getNextWeeklyCutoff(2, 'Próximo zarpe semanal'),
        spaceLeft: '4.5 m³ libres',
      },
      {
        kind: 'ship',
        id: 'CF-AND-04',
        name: 'MV Austral Trade',
        routeLabel: 'Guangzhou → Valparaíso (CL) → Buenos Aires (AR)',
        points: routePacSouthPts,
        progress: 0.71,
        speed: 0.0011,
        zone: 'Pacífico Sur · Rumbo a Callao / Valparaíso',
        cargo: 'Consolidado semanal: Equipos OEM y línea comercial · 15 importadores.',
        nextCutoff: getNextWeeklyCutoff(2, 'Próximo zarpe semanal'),
        spaceLeft: '5.1 m³ libres',
      },
      {
        kind: 'ship',
        id: 'CF-MED-05',
        name: 'MV Iberia Direct',
        routeLabel: 'Ningbo / Guangzhou → Suez → Valencia (España)',
        points: routeSuezSpainPts,
        progress: 0.56,
        speed: 0.0013,
        zone: 'Océano Índico · Rumbo a Canal de Suez',
        cargo: 'Consolidado semanal: Importación directa 1688 hacia España · 16 importadores.',
        nextCutoff: getNextWeeklyCutoff(4, 'Próximo zarpe semanal'),
        spaceLeft: '3.2 m³ libres',
      },
    ];

    function syncShipCoords(ship) {
      const idx = Math.min(
        ship.points.length - 1,
        Math.max(0, Math.floor(ship.progress * (ship.points.length - 1)))
      );
      const pt = ship.points[idx];
      ship.lat = pt.lat;
      ship.lng = pt.lng;
      ship.alt = pt.alt + 0.015;
    }

    SHIPS.forEach(syncShipCoords);

    const SHIP_SVG =
      '<svg class="globe-ship-svg" viewBox="0 0 28 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M2 10.5H26L23.5 14.5H4.5L2 10.5Z" fill="#E4E4E7"/>' +
      '<rect x="5" y="6.2" width="4.4" height="3.8" rx="0.6" fill="#FF5000"/>' +
      '<rect x="10" y="6.2" width="4.4" height="3.8" rx="0.6" fill="#FF8C38"/>' +
      '<rect x="15" y="6.2" width="4.4" height="3.8" rx="0.6" fill="#34D399"/>' +
      '<rect x="7.5" y="2.8" width="4.2" height="3" rx="0.5" fill="#FF6A00"/>' +
      '<rect x="12.3" y="2.8" width="4.2" height="3" rx="0.5" fill="#F8FAFC"/>' +
      '<path d="M20.2 3.5H23V10H20.2V3.5Z" fill="#FFFFFF"/>' +
      '</svg>';

    // Combinar puertos estáticos + buques en movimiento en la capa HTML 3D
    const PORT_MARKERS = PORTS.map((p) => ({ ...p, kind: 'port' }));
    const ALL_HTML_MARKERS = [...PORT_MARKERS, ...SHIPS];

    // Tarjeta de telemetría FlightRadar de contenedores
    const shipCard = document.getElementById('ship-radar-card');
    const shipCardCode = document.getElementById('ship-card-code');
    const shipCardName = document.getElementById('ship-card-name');
    const shipCardRoute = document.getElementById('ship-card-route');
    const shipCardZone = document.getElementById('ship-card-zone');
    const shipCardPct = document.getElementById('ship-card-pct');
    const shipCardBar = document.getElementById('ship-card-bar');
    const shipCardCargo = document.getElementById('ship-card-cargo');
    const shipCardNext = document.getElementById('ship-card-next');
    const shipCardSpace = document.getElementById('ship-card-space');
    const shipCardCta = document.getElementById('ship-card-cta');
    const shipCardClose = document.getElementById('ship-card-close');

    let selectedShip = null;

    function updateShipCardProgress() {
      if (!selectedShip || !shipCard?.classList.contains('is-open')) return;
      const pct = Math.max(5, Math.min(98, Math.round(selectedShip.progress * 100)));
      if (shipCardPct) shipCardPct.textContent = `${pct}%`;
      if (shipCardBar) shipCardBar.style.width = `${pct}%`;
    }

    function openShipCard(ship) {
      selectedShip = ship;
      SHIPS.forEach((s) => {
        if (s._el) s._el.classList.toggle('is-selected', s.id === ship.id);
      });

      if (shipCardCode) shipCardCode.textContent = ship.id;
      if (shipCardName) shipCardName.textContent = ship.name;
      if (shipCardRoute) shipCardRoute.textContent = ship.routeLabel;
      if (shipCardZone) shipCardZone.textContent = ship.zone;
      if (shipCardCargo) shipCardCargo.textContent = ship.cargo;
      if (shipCardNext) shipCardNext.textContent = ship.nextCutoff;
      if (shipCardSpace) shipCardSpace.textContent = ship.spaceLeft;
      updateShipCardProgress();

      if (routeIndicator) routeIndicator.textContent = `RASTREANDO ${ship.id} · ${ship.name.toUpperCase()}`;
      if (shipCard) shipCard.classList.add('is-open');
    }

    function closeShipCard() {
      selectedShip = null;
      SHIPS.forEach((s) => {
        if (s._el) s._el.classList.remove('is-selected');
      });
      if (shipCard) shipCard.classList.remove('is-open');
      if (routeIndicator) routeIndicator.textContent = `${SHIPS.length} BUQUES EN TRÁNSITO`;
    }

    if (shipCardClose) shipCardClose.addEventListener('click', closeShipCard);
    if (shipCardCta) {
      shipCardCta.addEventListener('click', () => {
        if (!selectedShip) return;
        prefillB2BQuote(
          `Reserva de cupo en próximo zarpe semanal (${selectedShip.routeLabel} · Ref: ${selectedShip.id} / ${selectedShip.nextCutoff}).`
        );
      });
    }

    const w = stage.clientWidth || 460;
    const h = stage.clientHeight || 460;

    // Inicialización WebGL (Three.js + textura satelital nocturna real NASA)
    const world = new window.Globe(container)
      .width(w)
      .height(h)
      .backgroundColor('rgba(0, 0, 0, 0)')
      .globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg')
      .bumpImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png')
      .showAtmosphere(true)
      .atmosphereColor('#FF5000')
      .atmosphereAltitude(0.22)

      // Carriles marítimos 3D animados
      .pathsData(PATHS_DATA)
      .pathPoints((d) => d.points)
      .pathPointLat((p) => p.lat)
      .pathPointLng((p) => p.lng)
      .pathPointAlt((p) => p.alt)
      .pathColor((d) => d.color)
      .pathStroke((d) => d.stroke)
      .pathDashLength((d) => d.dashLen)
      .pathDashGap((d) => d.dashGap)
      .pathDashAnimateTime((d) => d.animTime)
      .pathTransitionDuration(0)

      // Balizas verticales 3D en cada puerto
      .pointsData(PORTS)
      .pointLat((d) => d.lat)
      .pointLng((d) => d.lng)
      .pointColor((d) => (d.type === 'origin' ? '#FF5000' : '#34D399'))
      .pointAltitude((d) => (d.type === 'origin' ? 0.08 : 0.055))
      .pointRadius((d) => (d.type === 'origin' ? 0.55 : 0.42))

      // Anillos radar pulsantes sobre puertos
      .ringsData(PORTS)
      .ringLat((d) => d.lat)
      .ringLng((d) => d.lng)
      .ringAltitude(0.012)
      .ringColor((d) =>
        d.type === 'origin'
          ? (t) => `rgba(255, 80, 0, ${(1 - t).toFixed(2)})`
          : (t) => `rgba(52, 211, 153, ${(1 - t).toFixed(2)})`
      )
      .ringMaxRadius((d) => d.ringMax)
      .ringPropagationSpeed(2.2)
      .ringRepeatPeriod(1500)

      // Capa HTML 3D: Puertos + Buques Portacontenedores en vivo (con caché DOM para 0 parpadeo)
      .htmlElementsData(ALL_HTML_MARKERS)
      .htmlLat((d) => d.lat)
      .htmlLng((d) => d.lng)
      .htmlAltitude((d) =>
        d.kind === 'ship' ? d.alt : d.type === 'origin' ? 0.085 : 0.06
      )
      .htmlElement((d) => {
        if (d._el) return d._el;

        const el = document.createElement('div');
        if (d.kind === 'ship') {
          el.className = 'globe-ship-marker';
          el.title = `${d.name} · Clic para ver carga y próximo zarpe semanal`;
          el.innerHTML = `${SHIP_SVG}<span>${d.id}</span>`;
          el.addEventListener('click', (evt) => {
            evt.stopPropagation();
            if (controls) controls.autoRotate = false;
            world.pointOfView({ lat: d.lat, lng: d.lng, altitude: 1.85 }, 1000);
            openShipCard(d);
          });
        } else {
          el.className = `globe-port-tag ${d.type === 'origin' ? 'is-origin' : ''}`;
          el.innerHTML = `<span class="globe-port-dot"></span><span>${d.label}</span>`;
          el.addEventListener('click', (evt) => {
            evt.stopPropagation();
            closeShipCard();
            world.pointOfView({ lat: d.lat, lng: d.lng, altitude: 1.75 }, 1050);
          });
        }

        d._el = el;
        return el;
      });

    // Ajustar calidad WebGL para 60 FPS en móvil
    const renderer = world.renderer();
    if (renderer) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    }

    // Configurar controles orbitales (sin secuestrar el scroll vertical de la página)
    const controls = world.controls();
    if (controls) {
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.autoRotate = !reducedMotion;
      controls.autoRotateSpeed = 0.36;
    }

    // Presets de cámara cinematográfica
    const VIEWS = {
      pacific: {
        pov: { lat: 6, lng: -145, altitude: 2.15 },
        label: '5 BUQUES EN TRÁNSITO · PACÍFICO',
      },
      china: {
        pov: { lat: 24, lng: 116, altitude: 1.55 },
        label: 'SALIDAS SEMANALES · NINGBO & GUANGZHOU',
      },
      spain: {
        pov: { lat: 26, lng: 42, altitude: 2.05 },
        label: 'SUEZ · CHINA → VALENCIA (ESPAÑA)',
      },
    };

    // Vista inicial sobre el Pacífico mostrando China, buques en tránsito y Latinoamérica
    world.pointOfView(VIEWS.pacific.pov, 0);

    // Botones HUD de enfoque rápido
    let resumeTimer = null;
    stage.querySelectorAll('[data-globe-view]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-globe-view');
        const cfgView = VIEWS[key];
        if (!cfgView) return;

        closeShipCard();
        stage.querySelectorAll('[data-globe-view]').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        if (routeIndicator) routeIndicator.textContent = cfgView.label;

        if (controls) controls.autoRotate = false;
        world.pointOfView(cfgView.pov, 1200);

        clearTimeout(resumeTimer);
        if (!reducedMotion && controls) {
          resumeTimer = setTimeout(() => {
            controls.autoRotate = true;
          }, 7000);
        }
      });
    });

    // Botón "🚢 Rastrear Buque": recorre los 5 barcos semanales uno a uno volando hacia cada uno
    let trackIndex = 0;
    const trackBtn = stage.querySelector('[data-track-ship]');
    if (trackBtn) {
      trackBtn.addEventListener('click', () => {
        const ship = SHIPS[trackIndex % SHIPS.length];
        trackIndex += 1;
        if (controls) controls.autoRotate = false;
        world.pointOfView({ lat: ship.lat, lng: ship.lng, altitude: 1.85 }, 1100);
        openShipCard(ship);
      });
    }

    // Movimiento continuo y suave de los 5 barcos a lo largo de las rutas oceánicas
    let globeVisible = true;
    const shipTicker = setInterval(() => {
      if (reducedMotion || !globeVisible || document.hidden) return;
      SHIPS.forEach((ship) => {
        ship.progress = (ship.progress + ship.speed) % 1;
        syncShipCoords(ship);
      });
      world.htmlElementsData(ALL_HTML_MARKERS);
      updateShipCardProgress();
    }, 160);

    // Resize responsivo automático
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect || rect.width < 10 || rect.height < 10) return;
      world.width(rect.width).height(rect.height);
    });
    ro.observe(stage);

    // Pausar rotación y ticker cuando el Hero sale de pantalla para cuidar batería en móvil
    const io = new IntersectionObserver(
      (entries) => {
        globeVisible = entries[0]?.isIntersecting ?? true;
        if (controls && !reducedMotion) {
          controls.autoRotate = globeVisible && !selectedShip;
        }
      },
      { threshold: 0.05 }
    );
    io.observe(stage);

    window.addEventListener('beforeunload', () => clearInterval(shipTicker));
  }

  // ==========================================================================
  // 2. BOTONES MAGNÉTICOS (SOLO ESCRITORIO · POINTER FINE)
  // ==========================================================================

  function initMagneticButtons() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      const strength = parseFloat(btn.getAttribute('data-magnetic')) || 0.24;

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
        btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }

  // ==========================================================================
  // 3. SCROLL REVEAL & MEDIA ESTÁTICA
  // ==========================================================================

  function initScrollReveals() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
  }

  function initStaticMedia() {
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo && CONFIG.media.heroVideo) {
      heroVideo.src = CONFIG.media.heroVideo;
      if (CONFIG.media.heroPoster) heroVideo.poster = CONFIG.media.heroPoster;
      heroVideo.addEventListener('loadeddata', () => heroVideo.classList.add('is-ready'));
    }

    document.querySelectorAll('[data-link="facebook"]').forEach((el) => {
      el.href = CONFIG.contact.facebookGroupUrl;
    });
    document.querySelectorAll('[data-link="youtube"]').forEach((el) => {
      el.href = CONFIG.contact.youtubeUrl;
    });
    document.querySelectorAll('[data-link="whatsapp-general"]').forEach((el) => {
      el.href = buildWhatsAppLink(
        'Hola equipo de Easy Shopping Trade Co., quiero cotizar una importación desde 1688 por ruta marítima DDP hacia Latinoamérica / España.'
      );
    });
  }

  // ==========================================================================
  // 4. SECCIÓN HÍBRIDA DUAL (TABS: RADAR 1688 + CONSULTORÍA B2B)
  // ==========================================================================

  function initHybridTabs() {
    const tabBtns = document.querySelectorAll('[data-hybrid-tab]');
    const panels = document.querySelectorAll('[data-hybrid-panel]');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-hybrid-tab');
        state.activeHybridTab = target;
        tabBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
        panels.forEach((p) =>
          p.classList.toggle('is-active', p.getAttribute('data-hybrid-panel') === target)
        );
      });
    });
  }

  function renderConsultingServices() {
    const grid = document.getElementById('consulting-grid');
    if (!grid) return;

    grid.innerHTML = CONFIG.consultingServices
      .map(
        (svc) => `
          <article class="glass-card consulting-card">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem;">
              <span class="chip chip-accent mono">${svc.code}</span>
              <span class="chip">${svc.tag}</span>
            </div>
            <div>
              <h3 style="margin:0 0 0.45rem;font-family:var(--font-display);font-size:1.25rem;font-weight:700;color:var(--text-primary);">${svc.title}</h3>
              <p style="margin:0;font-size:0.9rem;color:var(--text-secondary);line-height:1.58;">${svc.description}</p>
            </div>
            <ul class="takeaways-list" style="margin-top:0.2rem;">
              ${svc.specs.map((s) => `<li class="mono" style="font-size:0.78rem;">${s}</li>`).join('')}
            </ul>
            <div style="margin-top:auto;padding-top:0.4rem;">
              <button type="button" class="btn btn-secondary btn-sm" data-request-service="${svc.title}">
                Solicitar este servicio →
              </button>
            </div>
          </article>
        `
      )
      .join('');

    grid.querySelectorAll('[data-request-service]').forEach((btn) => {
      btn.addEventListener('click', () => {
        prefillB2BQuote(btn.getAttribute('data-request-service'));
      });
    });
  }

  // ==========================================================================
  // 5. GANANCIAS REALES 1688 (DATOS REALES + FOTOS + LINKS 1688 / ML)
  // ==========================================================================

  function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    const withPhoto = PRODUCTS.filter((p) => Boolean(p.imageUrl));

    grid.innerHTML = withPhoto
      .map((p) => {
        const m = calculateProductMetrics(p);
        const isUnlocked = state.unlocked;
        const dimsLabel = p.dimensionsCm
          ? `${p.dimensionsCm.l}×${p.dimensionsCm.w}×${p.dimensionsCm.h} cm`
          : 'Volumen B2B';

        const marketDisplay = p.marketPriceCop ? formatCOP(p.marketPriceCop) : 'Cotización B2B';
        const marketLabel =
          p.channel === 'ml' ? 'Precio Mercado Libre CO' : 'Canal B2B / Industrial';

        const mediaHtml = p.imageUrl
          ? `
            <div class="product-media-box">
              <img
                src="${p.imageUrl}"
                alt="${p.name}"
                class="product-photo ${p.hoverImageUrl ? 'has-hover' : ''}"
                loading="lazy"
              >
              ${
                p.hoverImageUrl
                  ? `<img src="${p.hoverImageUrl}" alt="${p.name} empaque" class="product-photo-hover" loading="lazy">`
                  : ''
              }
              <div class="product-media-badges">
                <span class="chip chip-solid-1688">${p.badge}</span>
                <span class="chip mono">${dimsLabel}</span>
              </div>
            </div>
          `
          : `
            <div class="product-media-box is-b2b-dark">
              <div style="text-align:center;color:var(--accent-light);">
                <div style="display:inline-grid;place-items:center;width:4rem;height:4rem;border-radius:1rem;background:rgba(255,80,0,0.12);border:1px solid rgba(255,80,0,0.38);margin-bottom:0.6rem;">
                  ${ICONS[p.icon] || ICONS.cube}
                </div>
                <div class="mono" style="font-size:0.72rem;color:var(--text-secondary);">HARDWARE INDUSTRIAL B2B</div>
              </div>
              <div class="product-media-badges">
                <span class="chip chip-accent">${p.badge}</span>
                <span class="chip mono">${p.cbmOverride} m³</span>
              </div>
            </div>
          `;

        const marginHtml =
          p.channel === 'ml' && m.netMarginCop !== null
            ? `
              <div class="margin-row">
                <span>Costo en 1688 (${p.cost1688} ${p.currency})</span>
                <strong class="mono">${formatCOP(m.productCostCop)}</strong>
              </div>
              <div class="margin-row">
                <span>Envío Marítimo DDP</span>
                <strong class="mono">${formatCOP(m.ddpCostCop)}</strong>
              </div>
              <div class="margin-row">
                <span>Comisión ML (20%)</span>
                <strong class="mono">-${formatCOP(m.mlCommissionCop)}</strong>
              </div>
              <div class="profit-callout">
                <div class="profit-callout-top">
                  <span>TU MARGEN DE GANANCIA POR VENTA</span>
                  <span class="profit-callout-badge mono">+${m.roiPercent}% ganancia</span>
                </div>
                <div class="profit-callout-amount mono">${formatCOP(m.netMarginCop)}</div>
                <div class="profit-callout-invite">
                  <strong>Este puedes ser tú</strong> · En 100 ventas: <span class="mono">${formatCOP(m.netMarginCop * 100)}</span>
                </div>
              </div>
            `
            : `
              <div class="margin-row">
                <span>Costo Fábrica China</span>
                <strong class="mono">~${p.cost1688} ${p.currency} (${formatCOP(m.productCostCop)})</strong>
              </div>
              <div class="margin-row">
                <span>Flete Marítimo DDP</span>
                <strong class="mono">${formatCOP(m.ddpCostCop)}</strong>
              </div>
              <div class="margin-row highlight">
                <span>Puesto en Colombia DDP</span>
                <strong class="mono">${formatCOP(m.landedCostCop)}</strong>
              </div>
              <div class="margin-row">
                <span>Canal recomendado</span>
                <strong>Venta B2B Directa</strong>
              </div>
            `;

        const footerHtml = isUnlocked
          ? `
            <div class="unlocked-actions">
              <button type="button" class="btn btn-secondary btn-sm" data-load-calc="${p.id}">
                Calcular lote
              </button>
              <button type="button" class="btn btn-primary btn-sm" data-quote-product="${p.id}">
                Importar →
              </button>
            </div>
            ${
              p.url1688
                ? `<div class="source-link-bar">
                     <a href="${p.url1688}" target="_blank" rel="noopener">Abrir fábrica en 1688.com ↗</a>
                     ${p.urlMl ? `<a href="${p.urlMl}" target="_blank" rel="noopener" style="color:var(--text-secondary);">Ver en ML ↗</a>` : ''}
                   </div>`
                : ''
            }
          `
          : `
            <button type="button" class="btn btn-primary btn-sm" data-unlock-product="${p.name}">
              ${ICONS.lock} Ver Margen de Ganancia + Link 1688
            </button>
          `;

        return `
          <article class="glass-card product-card">
            ${mediaHtml}

            <div>
              <h3 class="product-name">${p.name}</h3>
              <p class="product-specs">${p.specs}</p>
            </div>

            <div class="product-market-box">
              <div>
                <span class="market-label">${marketLabel}</span>
                ${
                  p.urlMl
                    ? `<a href="${p.urlMl}" target="_blank" rel="noopener" class="market-link">Ver publicación real ML ↗</a>`
                    : ''
                }
              </div>
              <span class="market-value mono">${marketDisplay}</span>
            </div>

            <div class="margin-panel ${isUnlocked ? 'is-unlocked' : 'is-locked'}">
              <div class="margin-rows">${marginHtml}</div>
              <div class="lock-overlay">
                <span class="lock-pill">${ICONS.lock} ¿Cuánto ganan en esta venta?</span>
                <span class="lock-hint">Este puedes ser tú · Desbloquea el margen de ganancia y el link de 1688</span>
              </div>
            </div>

            <div class="product-footer">${footerHtml}</div>
          </article>
        `;
      })
      .join('');

    grid.querySelectorAll('[data-unlock-product]').forEach((btn) => {
      btn.addEventListener('click', () => {
        openLeadModal(btn.getAttribute('data-unlock-product'));
      });
    });

    grid.querySelectorAll('[data-load-calc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const prod = PRODUCTS.find((item) => String(item.id) === btn.getAttribute('data-load-calc'));
        if (prod) loadProductIntoCalculator(prod);
      });
    });

    grid.querySelectorAll('[data-quote-product]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const prod = PRODUCTS.find((item) => String(item.id) === btn.getAttribute('data-quote-product'));
        if (prod) {
          prefillB2BQuote(`${prod.name}${prod.url1688 ? ` (${prod.url1688})` : ''}`);
        }
      });
    });

    const statusBadge = document.getElementById('wall-unlock-status');
    if (statusBadge) {
      statusBadge.innerHTML = state.unlocked
        ? '<span style="color:var(--emerald-400);font-weight:700;">✓ Margen de ganancia y enlaces 1688 desbloqueados</span> · <button type="button" id="relock-demo-btn" style="background:none;border:0;color:var(--text-muted);text-decoration:underline;cursor:pointer;font-size:0.78rem;">Bloquear vista</button>'
        : '<span style="color:var(--accent-light);font-weight:700;">🔒 Margen de ganancia bloqueado</span> · Desbloquéalo gratis';

      const relockBtn = document.getElementById('relock-demo-btn');
      if (relockBtn) {
        relockBtn.addEventListener('click', () => {
          state.unlocked = false;
          localStorage.removeItem(STORAGE_KEY);
          renderProducts();
        });
      }
    }
  }

  // ==========================================================================
  // 6. CALCULADORA 1688 MULTI-MONEDA EN TIEMPO REAL (RUTA MARÍTIMA DDP)
  // ==========================================================================

  let updateCalculatorFn = null;

  function loadProductIntoCalculator(product) {
    const urlInput = document.getElementById('calc-url');
    const varInput = document.getElementById('calc-variant');
    const cnyInput = document.getElementById('calc-cny');
    const qtyInput = document.getElementById('calc-qty');
    const lInput = document.getElementById('calc-l');
    const wInput = document.getElementById('calc-w');
    const hInput = document.getElementById('calc-h');

    if (urlInput) urlInput.value = product.url1688 || '';
    if (varInput) varInput.value = product.variantExample || product.name;
    if (cnyInput) {
      const cnyVal =
        product.currency === 'USD'
          ? Math.round((product.cost1688 * CONFIG.pricing.usdToCop) / CONFIG.pricing.cnyToCop)
          : product.cost1688;
      cnyInput.value = cnyVal;
    }
    if (qtyInput) qtyInput.value = product.channel === 'b2b' ? 5 : 100;
    if (product.dimensionsCm) {
      if (lInput) lInput.value = product.dimensionsCm.l;
      if (wInput) wInput.value = product.dimensionsCm.w;
      if (hInput) hInput.value = product.dimensionsCm.h;
    }

    if (updateCalculatorFn) updateCalculatorFn();
    document.getElementById('calculadora-ddp')?.scrollIntoView({ behavior: 'smooth' });
  }

  function initRealtime1688Calculator() {
    const pillsWrap = document.getElementById('currency-pills');
    const currencySelect = document.getElementById('calc-currency');
    const urlInput = document.getElementById('calc-url');
    const varInput = document.getElementById('calc-variant');
    const cnyInput = document.getElementById('calc-cny');
    const qtyInput = document.getElementById('calc-qty');
    const lInput = document.getElementById('calc-l');
    const wInput = document.getElementById('calc-w');
    const hInput = document.getElementById('calc-h');

    const cnyPreviewEl = document.getElementById('calc-cny-preview');
    const prodCostOut = document.getElementById('calc-prod-out');
    const maritimeOut = document.getElementById('calc-maritime-out');
    const volOut = document.getElementById('calc-vol-out');
    const totalOut = document.getElementById('calc-total-out');
    const unitOut = document.getElementById('calc-unit-out');
    const curLabelOut = document.getElementById('calc-currency-badge');
    const quoteBtn = document.getElementById('calc-quote-btn');

    if (!cnyInput || !qtyInput || !lInput || !wInput || !hInput) return;

    // Renderizar botones rápidos de moneda + select
    const currencyList = Object.values(CONFIG.currencies);
    if (pillsWrap) {
      pillsWrap.innerHTML = currencyList
        .map(
          (c) =>
            `<button type="button" class="currency-pill ${c.code === state.activeCurrency ? 'is-active' : ''}" data-cur-code="${c.code}">${c.code}</button>`
        )
        .join('');

      pillsWrap.querySelectorAll('[data-cur-code]').forEach((btn) => {
        btn.addEventListener('click', () => {
          state.activeCurrency = btn.getAttribute('data-cur-code');
          if (currencySelect) currencySelect.value = state.activeCurrency;
          pillsWrap
            .querySelectorAll('[data-cur-code]')
            .forEach((b) => b.classList.toggle('is-active', b === btn));
          update();
        });
      });
    }

    if (currencySelect) {
      currencySelect.innerHTML = currencyList
        .map((c) => `<option value="${c.code}">${c.label}</option>`)
        .join('');
      currencySelect.value = state.activeCurrency;
      currencySelect.addEventListener('change', () => {
        state.activeCurrency = currencySelect.value;
        pillsWrap
          ?.querySelectorAll('[data-cur-code]')
          .forEach((b) =>
            b.classList.toggle('is-active', b.getAttribute('data-cur-code') === state.activeCurrency)
          );
        update();
      });
    }

    let lastQuoteText = '';

    function update() {
      const curCode = state.activeCurrency;
      const cnyPrice = Math.max(0, parseFloat(cnyInput.value) || 0);
      const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      const l = Math.max(0, parseFloat(lInput.value) || 0);
      const w = Math.max(0, parseFloat(wInput.value) || 0);
      const h = Math.max(0, parseFloat(hInput.value) || 0);

      // 1. Conversión de precio unitario CNY -> COP -> Moneda elegida
      const unitProductCop = cnyPrice * CONFIG.pricing.cnyToCop;
      const totalProductCop = unitProductCop * qty;
      const unitProductLocal = convertCopTo(unitProductCop, curCode);
      const totalProductLocal = convertCopTo(totalProductCop, curCode);

      // 2. Volumen total y Flete Marítimo DDP (base interna 4.000.000 COP/CBM convertida a la moneda elegida)
      const unitCbm = (l * w * h) / 1_000_000;
      const totalCbm = unitCbm * qty;
      const maritimeDdpCop = totalCbm * CONFIG.pricing.ddpRatePerCbmCop;
      const maritimeDdpLocal = convertCopTo(maritimeDdpCop, curCode);

      // 3. Costo total y unitario puesto en destino
      const grandTotalLocal = totalProductLocal + maritimeDdpLocal;
      const unitLandedLocal = grandTotalLocal / qty;

      if (cnyPreviewEl) {
        cnyPreviewEl.textContent = `¥${cnyPrice} CNY ≈ ${formatCurrency(unitProductLocal, curCode)} / und`;
      }
      if (prodCostOut) {
        prodCostOut.textContent = formatCurrency(totalProductLocal, curCode);
      }
      if (maritimeOut) {
        maritimeOut.textContent = formatCurrency(maritimeDdpLocal, curCode);
      }
      if (volOut) {
        volOut.textContent = `${totalCbm.toFixed(4)} m³ (${qty} unds)`;
      }
      if (totalOut) {
        totalOut.textContent = formatCurrency(grandTotalLocal, curCode);
      }
      if (unitOut) {
        unitOut.textContent = formatCurrency(unitLandedLocal, curCode);
      }
      if (curLabelOut) {
        curLabelOut.textContent = `RUTA MARÍTIMA DDP · ${curCode}`;
      }

      const prodUrl = urlInput?.value.trim() || 'Enlace 1688 por confirmar';
      const prodVar = varInput?.value.trim() || 'Estándar';
      lastQuoteText = `Cotización Ruta Marítima DDP (${curCode}) | URL 1688: ${prodUrl} | Variable: ${prodVar} | Precio: ¥${cnyPrice} CNY × ${qty} unds | Medidas: ${l}×${w}×${h} cm (${totalCbm.toFixed(4)} m³) | Total puesto estimado: ${formatCurrency(grandTotalLocal, curCode)} (${formatCurrency(unitLandedLocal, curCode)}/und).`;
    }

    updateCalculatorFn = update;

    [urlInput, varInput, cnyInput, qtyInput, lInput, wInput, hInput].forEach((el) => {
      if (el) el.addEventListener('input', update);
    });

    if (quoteBtn) {
      quoteBtn.addEventListener('click', () => {
        prefillB2BQuote(lastQuoteText);
      });
    }

    update();
  }

  // ==========================================================================
  // 7. ACADEMIA — EL SISTEMA 1688
  // ==========================================================================

  function renderAcademy() {
    const playlistEl = document.getElementById('academy-playlist');
    const stageEl = document.getElementById('academy-stage');
    if (!playlistEl || !stageEl) return;

    const modules = CONFIG.academyModules;
    const active = modules.find((m) => m.id === state.activeModuleId) || modules[0];

    playlistEl.innerHTML = modules
      .map(
        (m) => `
          <button type="button" class="playlist-item ${m.id === active.id ? 'is-active' : ''}" data-module-id="${m.id}">
            <span class="playlist-num">${m.number}</span>
            <span class="playlist-meta">
              <span class="playlist-title">${m.title}</span>
              <span class="playlist-sub">${m.tag} · ${m.duration} min</span>
            </span>
          </button>
        `
      )
      .join('');

    playlistEl.querySelectorAll('[data-module-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeModuleId = btn.getAttribute('data-module-id');
        renderAcademy();
      });
    });

    const mediaBlock = active.youtubeEmbedUrl
      ? `<iframe src="${active.youtubeEmbedUrl}" title="${active.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
      : `
        <video id="academy-video-el" controls playsinline preload="metadata" style="display:none;">
          <source src="${active.videoSrc}" type="video/mp4">
        </video>
        <div id="academy-video-placeholder" class="stage-placeholder">
          <div class="stage-play-ring" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
          </div>
          <span class="chip chip-accent mono">MÓDULO ${active.number} · ${active.duration}</span>
          <h3 style="margin:0.75rem 0 0.35rem;font-family:var(--font-display);font-size:1.15rem;font-weight:700;color:#fff;">${active.title}</h3>
          <p style="margin:0;font-size:0.8rem;color:var(--text-secondary);">
            Listo para tu video de HeyGen (<code class="mono" style="color:var(--accent-light);">${active.videoSrc}</code>)
          </p>
        </div>
      `;

    stageEl.innerHTML = `
      <div class="stage-video-frame">${mediaBlock}</div>
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.5rem;">
          <span class="chip chip-accent mono">MÓDULO ${active.number} · ${active.tag}</span>
          <span class="mono" style="font-size:0.76rem;color:var(--text-muted);">Duración: ${active.duration}</span>
        </div>
        <h3 style="margin:0 0 0.5rem;font-family:var(--font-display);font-size:1.25rem;font-weight:700;color:#fff;">${active.title}</h3>
        <p style="margin:0 0 1rem;font-size:0.92rem;color:var(--text-secondary);">${active.summary}</p>
        <ul class="takeaways-list">
          ${active.takeaways.map((t) => `<li>${t}</li>`).join('')}
        </ul>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-top:0.25rem;">
        <button type="button" class="btn btn-primary btn-auto-sm btn-sm" id="academy-pdf-cta">
          Descargar Guía PDF del Sistema 1688
        </button>
        <a href="#calculadora-ddp" class="btn btn-secondary btn-auto-sm btn-sm">Ir a Calculadora 1688</a>
      </div>
    `;

    const videoEl = document.getElementById('academy-video-el');
    const placeholderEl = document.getElementById('academy-video-placeholder');
    if (videoEl) {
      videoEl.addEventListener('loadedmetadata', () => {
        videoEl.style.display = 'block';
        if (placeholderEl) placeholderEl.style.display = 'none';
      });
    }

    const pdfBtn = document.getElementById('academy-pdf-cta');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', () => {
        openLeadModal(`Guía PDF — Sistema 1688 (Módulo ${active.number})`);
      });
    }
  }

  // ==========================================================================
  // 8. PRUEBA SOCIAL (MUTE / UNMUTE INDIVIDUAL)
  // ==========================================================================

  // ==========================================================================
  // 7B. PROVEEDORES VERIFICADOS GRATIS (VIDEOS DE EMPRESA)
  // ==========================================================================

  function renderVerifiedSuppliers() {
    const grid = document.getElementById('suppliers-grid');
    if (!grid) return;

    const suppliers = Array.isArray(CONFIG.verifiedSuppliers) ? CONFIG.verifiedSuppliers : [];

    grid.innerHTML = suppliers
      .map((s) => {
        const mediaHtml = s.youtubeEmbedUrl
          ? `<iframe src="${s.youtubeEmbedUrl}" title="${s.name} — Video de empresa" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`
          : `
            <video data-supplier-video="${s.id}" autoplay loop muted playsinline preload="metadata">
              <source src="${s.videoSrc}" type="video/mp4">
            </video>
            <div class="supplier-video-fallback" data-supplier-fallback="${s.id}">
              <span class="case-metric mono">ACCESO GRATIS · VERIFICADO</span>
              <div>
                <p class="supplier-fallback-status mono">VIDEO DE EMPRESA · PRÓXIMAMENTE</p>
                <p class="supplier-fallback-city">${s.city} · ${s.sector}</p>
              </div>
            </div>
            <button
              type="button"
              class="mute-toggle-btn"
              data-supplier-mute="${s.id}"
              aria-label="Activar o silenciar audio del video de empresa"
              style="display:none;"
            >
              ${ICONS.muted}
            </button>
          `;

        const actionHtml = s.supplierUrl
          ? `<a href="${s.supplierUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-sm" style="width:100%;">Ver proveedor directo en 1688 →</a>`
          : `<button type="button" class="btn btn-primary btn-sm" style="width:100%;" data-supplier-cta="${s.id}">Solicitar catálogo gratis →</button>`;

        return `
          <article class="glass-card supplier-card">
            <div class="supplier-video-box">
              ${mediaHtml}
            </div>
            <div class="supplier-body">
              <div class="supplier-badge-row">
                <span class="chip chip-accent mono">${s.code} // ${s.city}</span>
                <span class="chip mono">${s.sector}</span>
              </div>
              <h3 class="supplier-title">${s.name}</h3>
              <p class="supplier-summary">${s.summary}</p>
              <ul class="takeaways-list">
                ${(s.highlights || []).map((item) => `<li>${item}</li>`).join('')}
              </ul>
              <div class="supplier-cta">
                ${actionHtml}
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    const videos = Array.from(grid.querySelectorAll('[data-supplier-video]'));
    videos.forEach((vid) => {
      const id = vid.getAttribute('data-supplier-video');
      vid.addEventListener('loadeddata', () => {
        vid.classList.add('is-ready');
        const fb = grid.querySelector(`[data-supplier-fallback="${id}"]`);
        if (fb) fb.style.background = 'linear-gradient(180deg, transparent 58%, rgba(7,8,10,0.88) 100%)';
        const btn = grid.querySelector(`[data-supplier-mute="${id}"]`);
        if (btn) btn.style.display = 'grid';
      });
    });

    grid.querySelectorAll('[data-supplier-mute]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-supplier-mute');
        const targetVideo = grid.querySelector(`[data-supplier-video="${targetId}"]`);
        if (!targetVideo) return;

        const willUnmute = targetVideo.muted;
        document.querySelectorAll('[data-supplier-video], [data-social-video]').forEach((v) => {
          v.muted = true;
          const sid = v.getAttribute('data-supplier-video');
          if (sid) {
            const sBtn = document.querySelector(`[data-supplier-mute="${sid}"]`);
            if (sBtn) sBtn.innerHTML = ICONS.muted;
          }
          const cid = v.getAttribute('data-social-video');
          if (cid) {
            const cBtn = document.querySelector(`[data-mute-target="${cid}"]`);
            if (cBtn) cBtn.innerHTML = ICONS.muted;
          }
        });

        targetVideo.muted = !willUnmute;
        btn.innerHTML = targetVideo.muted ? ICONS.muted : ICONS.unmuted;
        if (!targetVideo.muted) targetVideo.play().catch(() => {});
      });
    });

    grid.querySelectorAll('[data-supplier-cta]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sid = btn.getAttribute('data-supplier-cta');
        const supplier = suppliers.find((item) => item.id === sid);
        if (!supplier) return;
        prefillB2BQuote(
          `Hola, me interesa recibir gratis el catálogo y contacto directo del ${supplier.name} (${supplier.city} — ${supplier.sector}).`
        );
      });
    });
  }

  function renderTestimonials() {
    const grid = document.getElementById('social-grid');
    if (!grid) return;

    grid.innerHTML = CONFIG.testimonials
      .map(
        (t) => `
          <article class="glass-card video-case-card">
            <div class="video-case-media">
              <video data-social-video="${t.id}" autoplay loop muted playsinline preload="none">
                <source src="${t.videoSrc}" type="video/mp4">
              </video>
              <div class="video-case-fallback" data-fallback-for="${t.id}">
                <span class="chip chip-accent" style="align-self:flex-start;">${t.category}</span>
                <div>
                  <p style="margin:0 0 0.5rem;font-size:0.93rem;font-weight:600;color:#fff;line-height:1.42;">${t.quote}</p>
                  <span style="font-size:0.72rem;color:var(--text-muted);">Video listo: <code class="mono">${t.videoSrc}</code></span>
                </div>
              </div>
              <button
                type="button"
                class="mute-toggle-btn"
                data-mute-target="${t.id}"
                aria-label="Activar o silenciar audio del testimonio"
              >
                ${ICONS.muted}
              </button>
            </div>
            <div class="video-case-body">
              <span class="case-metric mono">${t.metric}</span>
              <h3 style="margin:0;font-family:var(--font-display);font-size:1rem;font-weight:700;color:#fff;line-height:1.35;">${t.headline}</h3>
              <p style="margin:0;font-size:0.82rem;color:var(--text-secondary);">${t.clientName}</p>
            </div>
          </article>
        `
      )
      .join('');

    const videos = Array.from(grid.querySelectorAll('[data-social-video]'));
    videos.forEach((vid) => {
      const id = vid.getAttribute('data-social-video');
      vid.addEventListener('loadeddata', () => {
        vid.classList.add('is-ready');
        const fb = grid.querySelector(`[data-fallback-for="${id}"]`);
        if (fb) fb.style.background = 'linear-gradient(180deg, transparent 55%, rgba(7,8,10,0.88) 100%)';
      });
    });

    grid.querySelectorAll('[data-mute-target]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-mute-target');
        const targetVideo = grid.querySelector(`[data-social-video="${targetId}"]`);
        if (!targetVideo) return;

        const willUnmute = targetVideo.muted;
        videos.forEach((v) => {
          v.muted = true;
          const vBtn = grid.querySelector(`[data-mute-target="${v.getAttribute('data-social-video')}"]`);
          if (vBtn) vBtn.innerHTML = ICONS.muted;
        });

        targetVideo.muted = !willUnmute;
        btn.innerHTML = targetVideo.muted ? ICONS.muted : ICONS.unmuted;
        if (!targetVideo.muted) targetVideo.play().catch(() => {});
      });
    });
  }

  // ==========================================================================
  // 9. MODAL DE DESBLOQUEO + WEBHOOK MAKE/ZAPIER
  // ==========================================================================

  let modalVideoLoaded = false;

  function openLeadModal(productName) {
    state.selectedProductForLead = productName || 'Ganancias Reales 1688';
    const modal = document.getElementById('lead-modal');
    const contextLabel = document.getElementById('modal-product-context');
    const feedback = document.getElementById('modal-feedback');

    if (contextLabel) contextLabel.textContent = `Desglose: ${state.selectedProductForLead}`;
    if (feedback) {
      feedback.className = 'form-feedback';
      feedback.textContent = '';
    }

    const modalVideo = document.getElementById('unlock-modal-video');
    const modalFallback = document.getElementById('unlock-modal-fallback');
    if (modalVideo && !modalVideoLoaded && CONFIG.media.unlockModalVideo) {
      modalVideoLoaded = true;
      modalVideo.src = CONFIG.media.unlockModalVideo;
      modalVideo.addEventListener('loadeddata', () => {
        modalVideo.classList.add('is-ready');
        if (modalFallback) modalFallback.style.display = 'none';
        modalVideo.play().catch(() => {});
      });
    } else if (modalVideo && modalVideo.classList.contains('is-ready')) {
      modalVideo.play().catch(() => {});
    }

    if (modal) {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLeadModal() {
    const modal = document.getElementById('lead-modal');
    const modalVideo = document.getElementById('unlock-modal-video');
    if (modalVideo) modalVideo.pause();
    if (modal) {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  async function postWebhook(url, payload) {
    if (!url || !url.trim()) {
      console.info('[Easy Shopping Trade · Modo Demo Webhook]', payload);
      await new Promise((r) => setTimeout(r, 420));
      return { ok: true, demo: true };
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return { ok: true, demo: false };
  }

  function initLeadModal() {
    const modal = document.getElementById('lead-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const form = document.getElementById('lead-unlock-form');
    const muteBtn = document.getElementById('modal-mute-btn');
    const modalVideo = document.getElementById('unlock-modal-video');

    if (closeBtn) closeBtn.addEventListener('click', closeLeadModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeLeadModal();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLeadModal();
    });

    if (muteBtn && modalVideo) {
      muteBtn.innerHTML = ICONS.muted;
      muteBtn.addEventListener('click', () => {
        modalVideo.muted = !modalVideo.muted;
        muteBtn.innerHTML = modalVideo.muted ? ICONS.muted : ICONS.unmuted;
        if (!modalVideo.muted) modalVideo.play().catch(() => {});
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const feedback = document.getElementById('modal-feedback');

        const email = form.querySelector('#lead-email').value.trim();
        const whatsapp = form.querySelector('#lead-whatsapp').value.trim();
        if (!email || !whatsapp) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Desbloqueando márgenes...';

        const payload = {
          tipo_formulario: 'desbloqueo_ganancias_1688',
          nombre: 'Lead Ganancias Reales 1688',
          email,
          whatsapp,
          producto_o_servicio: state.selectedProductForLead,
          presupuesto: 'Por definir',
          detalle: `Desbloqueó ganancias reales y enlaces 1688 para: ${state.selectedProductForLead}`,
          fecha: new Date().toISOString(),
          pagina: window.location.href,
        };

        try {
          const result = await postWebhook(CONFIG.webhooks.leadUnlockUrl, payload);

          state.unlocked = true;
          localStorage.setItem(STORAGE_KEY, 'true');
          renderProducts();

          feedback.className = 'form-feedback is-success';
          feedback.innerHTML = result.demo
            ? `✓ ¡Márgenes y enlaces 1688 desbloqueados! <br><a href="${buildWhatsAppLink(
                `Hola equipo de Easy Shopping Trade Co., acabo de desbloquear las ganancias reales de 1688 para ${state.selectedProductForLead}. Mi correo es ${email}.`
              )}" target="_blank" rel="noopener" style="text-decoration:underline;color:#fff;">Recibir PDF por WhatsApp →</a>`
            : '✓ ¡Datos registrados! Hemos enviado tu PDF técnico y desbloqueamos todos los enlaces de 1688.';

          form.reset();
          setTimeout(() => {
            closeLeadModal();
            document.getElementById('hub-hibrido')?.scrollIntoView({ behavior: 'smooth' });
          }, 1500);
        } catch (err) {
          feedback.className = 'form-feedback is-error';
          feedback.textContent = 'Error de conexión. Intenta de nuevo o escríbenos por WhatsApp.';
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Ver Margen de Ganancia + Enlaces 1688';
        }
      });
    }
  }

  // ==========================================================================
  // 10. EMBUDO PREMIUM B2B
  // ==========================================================================

  function prefillB2BQuote(text) {
    const detailsField = document.getElementById('b2b-details');
    if (detailsField) {
      detailsField.value = text;
    }
    document.getElementById('embudo-b2b')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => detailsField?.focus(), 550);
  }

  function initB2BForm() {
    const tabs = document.querySelectorAll('[data-b2b-mode]');
    const modeTitle = document.getElementById('b2b-mode-hint');
    const form = document.getElementById('b2b-quote-form');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        state.b2bMode = tab.getAttribute('data-b2b-mode');
        tabs.forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');

        if (modeTitle) {
          modeTitle.textContent =
            state.b2bMode === 'validacion'
              ? 'Auditamos la fábrica real en 1688 / China, verificamos especificaciones técnicas y evitamos revendedores.'
              : 'Recibe cotización cerrada de Ruta Marítima Consolidada DDP hasta Latinoamérica o España sin sorpresas aduaneras.';
        }
      });
    });

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const feedback = document.getElementById('b2b-feedback');

      const name = form.querySelector('#b2b-name').value.trim();
      const whatsapp = form.querySelector('#b2b-whatsapp').value.trim();
      const email = form.querySelector('#b2b-email').value.trim();
      const budget = form.querySelector('#b2b-budget').value;
      const details = form.querySelector('#b2b-details').value.trim();

      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando solicitud B2B...';

      const payload = {
        tipo_formulario: state.b2bMode === 'validacion' ? 'b2b_validacion_proveedor' : 'b2b_cotizacion_maritima_ddp',
        nombre: name,
        email,
        whatsapp,
        producto_o_servicio: state.b2bMode === 'validacion' ? 'Validación de Proveedor 1688' : 'Cotización Ruta Marítima DDP',
        presupuesto: budget,
        detalle: details,
        fecha: new Date().toISOString(),
        pagina: window.location.href,
      };

      try {
        await postWebhook(CONFIG.webhooks.b2bQuoteUrl || CONFIG.webhooks.leadUnlockUrl, payload);
        const waUrl = buildWhatsAppLink(
          `Hola Easy Shopping Trade Co., soy ${name}. Solicito ${
            state.b2bMode === 'validacion' ? 'Validación de Proveedor 1688 en China' : 'Cotización Ruta Marítima DDP'
          }. Presupuesto: ${budget}. Detalle: ${details}`
        );

        feedback.className = 'form-feedback is-success';
        feedback.innerHTML = `✓ Solicitud recibida. Revisaremos tu caso en menos de 24 horas hábiles. <br><a href="${waUrl}" target="_blank" rel="noopener" style="text-decoration:underline;color:#fff;">Acelerar atención ahora por WhatsApp →</a>`;
        form.reset();
      } catch (err) {
        feedback.className = 'form-feedback is-error';
        feedback.textContent = 'No pudimos conectar con el servidor. Escríbenos directo por WhatsApp.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Solicitar Análisis B2B Ahora';
      }
    });
  }

  // ==========================================================================
  // 11. WIDGET DE AVATAR CONVERSACIONAL EN VIVO (<LiveAvatarWidget />)
  // ==========================================================================

  function initLiveAvatarWidget() {
    const cfg = CONFIG.liveAvatar;
    if (!cfg || !cfg.enabled) return;

    const pill = document.getElementById('avatar-pill-btn');
    const drawer = document.getElementById('avatar-drawer');
    const closeBtn = document.getElementById('avatar-close-btn');
    const micBtn = document.getElementById('avatar-mic-btn');
    const statusLabel = document.getElementById('avatar-status-label');
    const transcriptEl = document.getElementById('avatar-transcript');
    const quickWrap = document.getElementById('avatar-quick-prompts');
    const waveCanvas = document.getElementById('avatar-wave-canvas');
    const inputForm = document.getElementById('avatar-text-form');
    const textInput = document.getElementById('avatar-text-input');

    if (!pill || !drawer) return;

    const avatarState = {
      isOpen: false,
      mode: 'idle',
      waveEnergy: 0.18,
      targetWaveEnergy: 0.18,
      rafId: null,
    };

    function setMode(nextMode, labelText) {
      avatarState.mode = nextMode;
      if (statusLabel) statusLabel.textContent = labelText;
      if (nextMode === 'speaking') avatarState.targetWaveEnergy = 0.92;
      else if (nextMode === 'listening') avatarState.targetWaveEnergy = 0.65;
      else avatarState.targetWaveEnergy = 0.16;
      if (micBtn) micBtn.classList.toggle('is-listening', nextMode === 'listening');
    }

    function appendMessage(role, text) {
      if (!transcriptEl) return;
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${role}`;
      bubble.textContent = text;
      transcriptEl.appendChild(bubble);
      transcriptEl.scrollTop = transcriptEl.scrollHeight;
    }

    function simulateAvatarResponse(userText, presetReply) {
      appendMessage('user', userText);
      setMode('connecting', 'PROCESANDO...');

      const reply =
        presetReply ||
        'Excelente. Puedes pegar tu enlace de 1688 en la Calculadora Marítima arriba para ver el costo puesto en tu moneda local (COP, MXN, CLP, PEN, ARS, USD o EUR), o enviarnos el detalle en el formulario B2B.';

      setTimeout(() => {
        setMode('speaking', 'EQUIPO EN LÍNEA');
        appendMessage('ai', reply);
        setTimeout(() => {
          if (avatarState.mode === 'speaking') setMode('idle', 'ASESORÍA 1688 · EN LÍNEA');
        }, 3200);
      }, 550);
    }

    let waveCtx = null;
    let wavePhase = 0;

    function drawWave() {
      if (!avatarState.isOpen || !waveCanvas) {
        avatarState.rafId = null;
        return;
      }

      if (!waveCtx) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        waveCanvas.width = Math.floor(waveCanvas.clientWidth * dpr);
        waveCanvas.height = Math.floor(waveCanvas.clientHeight * dpr);
        waveCtx = waveCanvas.getContext('2d');
        waveCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const w = waveCanvas.clientWidth;
      const h = waveCanvas.clientHeight;
      waveCtx.clearRect(0, 0, w, h);

      avatarState.waveEnergy += (avatarState.targetWaveEnergy - avatarState.waveEnergy) * 0.08;
      wavePhase += 0.075;

      const bars = 34;
      const gap = w / (bars + 4);

      for (let i = 0; i < bars; i++) {
        const centerDist = Math.abs(i - bars / 2) / (bars / 2);
        const envelope = Math.cos(centerDist * Math.PI * 0.5);
        const amp =
          (Math.sin(wavePhase + i * 0.45) * 0.5 + 0.5) *
          envelope *
          avatarState.waveEnergy *
          (h * 0.78);
        const barH = Math.max(4, amp);
        const x = (i + 2) * gap;
        const y = (h - barH) / 2;

        waveCtx.fillStyle =
          avatarState.mode === 'listening'
            ? 'rgba(52, 211, 153, 0.92)'
            : 'rgba(255, 92, 20, 0.92)';
        waveCtx.beginPath();
        waveCtx.roundRect(x, y, 3.2, barH, 2);
        waveCtx.fill();
      }

      avatarState.rafId = requestAnimationFrame(drawWave);
    }

    appendMessage('ai', cfg.greeting);

    if (quickWrap) {
      quickWrap.innerHTML = cfg.quickPrompts
        .map(
          (q, idx) =>
            `<button type="button" class="quick-chip" data-quick-idx="${idx}">${q.label}</button>`
        )
        .join('');

      quickWrap.querySelectorAll('[data-quick-idx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const item = cfg.quickPrompts[Number(btn.getAttribute('data-quick-idx'))];
          if (item) simulateAvatarResponse(item.label, item.reply);
        });
      });
    }

    function openDrawer() {
      avatarState.isOpen = true;
      drawer.classList.add('is-open');
      pill.style.display = 'none';
      waveCtx = null;
      if (!avatarState.rafId) avatarState.rafId = requestAnimationFrame(drawWave);
    }

    function closeDrawer() {
      avatarState.isOpen = false;
      drawer.classList.remove('is-open');
      pill.style.display = 'inline-flex';
      setMode('idle', 'ASESORÍA 1688 · EN LÍNEA');
    }

    pill.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    if (micBtn) {
      micBtn.innerHTML = ICONS.mic;
      micBtn.addEventListener('click', () => {
        if (avatarState.mode === 'listening') {
          setMode('idle', 'ASESORÍA 1688 · EN LÍNEA');
          return;
        }
        setMode('listening', 'ESCUCHANDO TU VOZ...');

        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
          try {
            const rec = new SpeechRec();
            rec.lang = 'es-CO';
            rec.interimResults = false;
            rec.onresult = (evt) => {
              const spoken = evt.results?.[0]?.[0]?.transcript;
              if (spoken) simulateAvatarResponse(spoken);
            };
            rec.onerror = () => setMode('idle', 'USA EL TEXTO O PREGUNTAS RÁPIDAS');
            rec.onend = () => {
              if (avatarState.mode === 'listening') setMode('idle', 'ASESORÍA 1688 · EN LÍNEA');
            };
            rec.start();
          } catch {
            setMode('idle', 'ESCRIBE TU CONSULTA ABAJO');
          }
        } else {
          setTimeout(() => {
            if (avatarState.mode === 'listening') {
              setMode('idle', 'ESCRIBE O TOCA UNA PREGUNTA');
              textInput?.focus();
            }
          }, 1800);
        }
      });
    }

    if (inputForm && textInput) {
      inputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = textInput.value.trim();
        if (!val) return;
        textInput.value = '';
        simulateAvatarResponse(val);
      });
    }
  }

  // ==========================================================================
  // INICIALIZACIÓN GLOBAL
  // ==========================================================================

  document.addEventListener('DOMContentLoaded', () => {
    initStaticMedia();
    initSourcingGlobe();
    initMagneticButtons();
    initScrollReveals();
    initHybridTabs();
    renderConsultingServices();
    renderProducts();
    initRealtime1688Calculator();
    renderAcademy();
    renderVerifiedSuppliers();
    renderTestimonials();
    initLeadModal();
    initB2BForm();
    initLiveAvatarWidget();
  });
})();
