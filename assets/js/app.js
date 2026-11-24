/**
 * ============================================================================
 * EASY SHOPPING TRADE CO. (CF) — MOTOR INTERACTIVO 1688 NEO-INDUSTRIAL (60 FPS)
 * Incluye:
 *  - Globo Marítimo 3D Wireframe (China -> Latinoamérica & España) en Naranja 1688
 *  - Botones Magnéticos (solo escritorio pointer:fine)
 *  - Muro de Oportunidades con fotos reales, enlaces 1688/ML y márgenes bloqueados
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
    activeFilter: 'all',
    activeCurrency: 'COP',
    activeModuleId: CONFIG.academyModules[0]?.id || null,
    selectedProductForLead: 'Muro de Oportunidades (Todos)',
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
  // 1. GLOBO TERRÁQUEO 3D REAL (CONTINENTES + MERIDIANOS + RUTAS MARÍTIMAS)
  // Proyección esférica ortográfica real con continentes, China destacada,
  // Latinoamérica y España, más interacción por arrastre a 60 FPS.
  // ==========================================================================

  function initSourcingGlobe() {
    const canvas = document.getElementById('sourcing-globe-canvas');
    const stage = document.getElementById('globe-stage');
    if (!canvas || !stage) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let radius = 150;

    // Ángulo inicial centrado en el Océano Pacífico: muestra China (Ningbo/Guangzhou)
    // a la izquierda y Latinoamérica a la derecha, rotando hacia España y Europa
    let rotY = 2.72;
    let rotX = 0.18;
    let autoSpeed = 0.0036;
    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let rafId = null;
    let isVisible = true;
    let packetProgress = 0;

    // Polígonos geográficos reales [lat, lon] para silueta inconfundible del planeta Tierra
    const CONTINENTS = [
      {
        name: 'NorthAmerica',
        highlight: false,
        coords: [
          [70, -162], [71, -135], [68, -110], [64, -90], [60, -78], [55, -60],
          [47, -53], [44, -64], [41, -70], [35, -75], [25, -80], [29, -85],
          [28, -96], [21, -97], [21, -87], [16, -88], [14, -83], [9, -80],
          [8, -77], [8, -83], [14, -92], [18, -104], [24, -109], [32, -117],
          [40, -124], [49, -125], [58, -137], [60, -150], [56, -162], [65, -167],
        ],
      },
      {
        name: 'Greenland',
        highlight: false,
        coords: [
          [82, -32], [77, -18], [68, -28], [60, -44], [66, -54], [76, -68], [82, -52],
        ],
      },
      {
        name: 'SouthAmerica',
        highlight: true,
        accent: 'dest',
        coords: [
          [12, -72], [11, -62], [6, -52], [0, -49], [-5, -35], [-13, -38],
          [-23, -43], [-34, -53], [-42, -64], [-53, -68], [-55, -71], [-46, -75],
          [-34, -72], [-18, -71], [-5, -81], [2, -79], [8, -77],
        ],
      },
      {
        name: 'Europe',
        highlight: true,
        accent: 'dest',
        coords: [
          [36, -9], [43, -9], [43, -2], [48, -4], [51, 2], [54, 8], [58, 5],
          [64, 10], [70, 20], [70, 31], [66, 40], [60, 30], [55, 21], [54, 14],
          [49, 24], [46, 31], [41, 29], [38, 24], [41, 19], [45, 13], [40, 18],
          [38, 15], [44, 9], [43, 3], [39, 0], [36, -5],
        ],
      },
      {
        name: 'UK',
        highlight: false,
        coords: [[50, -5], [51, 1], [55, -1], [58, -3], [57, -6], [53, -5]],
      },
      {
        name: 'Africa',
        highlight: false,
        coords: [
          [35, -6], [37, 10], [32, 15], [31, 32], [22, 37], [12, 44], [11, 51],
          [2, 45], [-10, 40], [-25, 33], [-34, 25], [-34, 18], [-22, 14],
          [-6, 12], [4, 9], [5, -4], [10, -15], [16, -17], [28, -13],
        ],
      },
      {
        name: 'Madagascar',
        highlight: false,
        coords: [[-13, 49], [-18, 49], [-25, 47], [-24, 44], [-16, 45]],
      },
      {
        name: 'Asia',
        highlight: false,
        coords: [
          [41, 29], [42, 41], [37, 36], [31, 35], [14, 44], [17, 54], [24, 58],
          [26, 56], [25, 66], [21, 72], [8, 77], [16, 81], [22, 88], [16, 97],
          [2, 103], [10, 106], [17, 108], [21, 109], [23, 117], [31, 122],
          [35, 120], [40, 121], [38, 126], [35, 129], [42, 131], [53, 141],
          [60, 163], [67, 178], [72, 140], [74, 105], [70, 70], [66, 42],
          [55, 50], [47, 46], [42, 42],
        ],
      },
      {
        name: 'ChinaHighlight',
        highlight: true,
        accent: 'origin',
        coords: [
          [53, 122], [48, 134], [42, 130], [40, 124], [38, 121], [35, 120],
          [31, 122], [23, 117], [21, 110], [19, 109], [22, 106], [23, 100],
          [28, 97], [30, 82], [36, 75], [42, 80], [48, 87], [44, 96], [42, 112],
          [49, 118],
        ],
      },
      {
        name: 'Japan',
        highlight: false,
        coords: [[31, 131], [34, 136], [36, 141], [41, 141], [44, 144], [43, 140], [36, 136], [33, 130]],
      },
      {
        name: 'Australia',
        highlight: false,
        coords: [
          [-12, 131], [-12, 136], [-16, 136], [-11, 142], [-20, 149], [-28, 153],
          [-37, 150], [-38, 141], [-33, 134], [-35, 117], [-22, 114], [-16, 123],
        ],
      },
    ];

    // Subdividir aristas largas para que los continentes se curven suavemente sobre la esfera
    function subdivideCoords(coords, maxStepDeg = 6) {
      const out = [];
      for (let i = 0; i < coords.length; i++) {
        const a = coords[i];
        const b = coords[(i + 1) % coords.length];
        const dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const steps = Math.max(1, Math.ceil(dist / maxStepDeg));
        for (let s = 0; s < steps; s++) {
          const t = s / steps;
          out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
        }
      }
      return out;
    }

    const SUBDIVIDED_CONTINENTS = CONTINENTS.map((c) => ({
      ...c,
      vecs: subdivideCoords(c.coords, 6).map(([lat, lon]) => latLonToVec(lat, lon)),
    }));

    // Puertos marítimos reales de salida en China + puertos destino en LATAM y España
    const HUBS = [
      { id: 'NB', label: 'NINGBO · CHINA', lat: 29.87, lon: 121.55, primary: true, origin: true },
      { id: 'GZ', label: 'GUANGZHOU · CHINA', lat: 22.8, lon: 113.6, primary: true, origin: true },
      { id: 'ES', label: 'ESPAÑA (VALENCIA)', lat: 39.47, lon: -0.38, primary: true, dest: true },
      { id: 'MX', label: 'MÉXICO (MANZANILLO)', lat: 19.05, lon: -104.32, primary: true, dest: true },
      { id: 'CO', label: 'COLOMBIA (BUENAVENTURA)', lat: 3.88, lon: -77.07, primary: true, dest: true },
      { id: 'PE', label: 'PERÚ (CALLAO)', lat: -12.05, lon: -77.14, primary: true, dest: true },
      { id: 'CL', label: 'CHILE (VALPARAÍSO)', lat: -33.04, lon: -71.62, primary: true, dest: true },
      { id: 'AR', label: 'ARGENTINA', lat: -34.6, lon: -58.38, primary: false, dest: true },
    ];

    // Subdividir ruta marítima sobre la esfera usando vectores 3D (cruza la línea de 180° del Pacífico sin errores)
    function buildSeaRouteVecs(waypoints, stepsPerLeg = 14) {
      const vecs = [];
      for (let i = 0; i < waypoints.length - 1; i++) {
        const a = latLonToVec(waypoints[i][0], waypoints[i][1]);
        const b = latLonToVec(waypoints[i + 1][0], waypoints[i + 1][1]);
        for (let s = 0; s < stepsPerLeg; s++) {
          const t = s / stepsPerLeg;
          let x = a.x * (1 - t) + b.x * t;
          let y = a.y * (1 - t) + b.y * t;
          let z = a.z * (1 - t) + b.z * t;
          const len = Math.hypot(x, y, z) || 1;
          // Elevación suave sobre el océano para visibilidad 3D
          vecs.push({ x: (x / len) * 1.015, y: (y / len) * 1.015, z: (z / len) * 1.015 });
        }
      }
      const last = latLonToVec(waypoints[waypoints.length - 1][0], waypoints[waypoints.length - 1][1], 1.015);
      vecs.push(last);
      return vecs;
    }

    // Rutas marítimas reales de buques portacontenedores desde Ningbo y Guangzhou
    const ROUTES = [
      {
        name: 'Ningbo -> Pacífico Norte -> México -> Colombia',
        main: true,
        offset: 0.0,
        vecs: buildSeaRouteVecs([
          [29.87, 121.55], // Ningbo
          [30.5, 138.0],   // Sur de Japón
          [31.5, 162.0],   // Pacífico Norte Oeste
          [28.5, -172.0],  // Cruce Pacífico (180°)
          [24.5, -146.0],  // Pacífico Central
          [21.0, -122.0],  // Aproximación México
          [19.05, -104.32],// Manzanillo, México
          [12.0, -92.0],   // Pacífico Centroamericano
          [5.5, -81.0],    // Golfo de Panamá
          [3.88, -77.07],  // Buenaventura, Colombia
        ]),
      },
      {
        name: 'Guangzhou -> Pacífico -> Perú -> Chile -> Argentina',
        main: true,
        offset: 0.34,
        vecs: buildSeaRouteVecs([
          [22.8, 113.6],   // Guangzhou (Nansha)
          [19.5, 127.0],   // Mar de Filipinas
          [14.0, 152.0],   // Pacífico Oeste
          [8.0, 178.0],    // Cruce Pacífico Ecuatorial
          [1.5, -156.0],   // Pacífico Central
          [-4.5, -128.0],  // Pacífico Sur
          [-9.5, -100.0],  // Aproximación Sudamérica
          [-12.05, -77.14],// Callao, Perú
          [-23.0, -74.5],  // Costa Pacífico Sur
          [-33.04, -71.62],// Valparaíso, Chile
          [-48.0, -76.0],  // Patagonia Pacífico
          [-55.5, -68.0],  // Cabo de Hornos / Magallanes
          [-45.0, -62.5],  // Atlántico Sur
          [-34.6, -58.38], // Buenos Aires, Argentina
        ]),
      },
      {
        name: 'Ningbo -> Guangzhou -> Malaca -> Índico -> Suez -> España',
        main: true,
        offset: 0.68,
        vecs: buildSeaRouteVecs([
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
        ]),
      },
    ];

    // Coordenadas geográficas exactas (sin espejo): +lon = Este (derecha), +lat = Norte (arriba)
    function latLonToVec(latDeg, lonDeg, scale = 1) {
      const lat = (latDeg * Math.PI) / 180;
      const lon = (lonDeg * Math.PI) / 180;
      return {
        x: Math.cos(lat) * Math.sin(lon) * scale,
        y: -Math.sin(lat) * scale,
        z: Math.cos(lat) * Math.cos(lon) * scale,
      };
    }

    function rotatePoint(p) {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = p.x * cosY + p.z * sinY;
      const z1 = -p.x * sinY + p.z * cosY;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y2 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;

      return { x: x1, y: y2, z: z2 };
    }

    function projectOrtho(rp) {
      return {
        x: width / 2 + rp.x * radius,
        y: height / 2 + rp.y * radius,
        z: rp.z,
      };
    }

    // Dibuja meridianos y paralelos reales en la cara visible de la esfera
    function drawGraticule() {
      ctx.lineWidth = 0.75;

      // Paralelos (-60, -30, 0, +30, +60)
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let penDown = false;
        for (let lon = -180; lon <= 180; lon += 6) {
          const rp = rotatePoint(latLonToVec(lat, lon));
          if (rp.z > 0) {
            const p = projectOrtho(rp);
            if (!penDown) {
              ctx.moveTo(p.x, p.y);
              penDown = true;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          } else {
            penDown = false;
          }
        }
        ctx.strokeStyle = lat === 0 ? 'rgba(255, 110, 40, 0.24)' : 'rgba(255, 255, 255, 0.08)';
        ctx.stroke();
      }

      // Meridianos cada 30°
      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath();
        let penDown = false;
        for (let lat = -84; lat <= 84; lat += 6) {
          const rp = rotatePoint(latLonToVec(lat, lon));
          if (rp.z > 0) {
            const p = projectOrtho(rp);
            if (!penDown) {
              ctx.moveTo(p.x, p.y);
              penDown = true;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          } else {
            penDown = false;
          }
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.075)';
        ctx.stroke();
      }
    }

    // Test clásico ray-casting punto-en-polígono para rellenar los continentes con matriz de puntos 3D
    function pointInPoly(lat, lon, poly) {
      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const yi = poly[i][0], xi = poly[i][1];
        const yj = poly[j][0], xj = poly[j][1];
        const intersect =
          yi > lat !== yj > lat &&
          lon < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-9) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    }

    // Genera una sola vez (~2ms) la malla de puntos sobre tierra firme (estilo globo Stripe/GitHub)
    const LAND_DOTS = [];
    (function buildLandDots() {
      const latStep = window.innerWidth < 768 ? 5 : 4;
      for (let lat = -58; lat <= 78; lat += latStep) {
        const cosLat = Math.max(0.22, Math.cos((lat * Math.PI) / 180));
        const lonStep = latStep / cosLat;
        for (let lon = -180; lon < 180; lon += lonStep) {
          let matchedAccent = null;
          for (let c = 0; c < CONTINENTS.length; c++) {
            if (pointInPoly(lat, lon, CONTINENTS[c].coords)) {
              const acc = CONTINENTS[c].accent || 'land';
              // Priorizar el resaltado de China sobre Asia general
              if (acc === 'origin') {
                matchedAccent = 'origin';
                break;
              }
              matchedAccent = acc;
            }
          }
          if (matchedAccent) {
            LAND_DOTS.push({
              vec: latLonToVec(lat, lon),
              accent: matchedAccent,
            });
          }
        }
      }
    })();

    // Dibuja la masa terrestre (puntos 3D + contornos costeros nítidos sin cortes)
    function drawContinents() {
      // 1. Matriz de puntos 3D sobre cada continente (cero artefactos en el horizonte)
      for (let i = 0; i < LAND_DOTS.length; i++) {
        const dot = LAND_DOTS[i];
        const rp = rotatePoint(dot.vec);
        if (rp.z <= 0.02) continue;
        const p = projectOrtho(rp);
        const depthAlpha = 0.25 + rp.z * 0.75;
        const size = dot.accent === 'origin' ? 2.1 : 1.7;

        if (dot.accent === 'origin') {
          ctx.fillStyle = `rgba(255, 88, 12, ${depthAlpha.toFixed(2)})`;
        } else if (dot.accent === 'dest') {
          ctx.fillStyle = `rgba(255, 168, 110, ${(depthAlpha * 0.85).toFixed(2)})`;
        } else {
          ctx.fillStyle = `rgba(220, 226, 238, ${(depthAlpha * 0.55).toFixed(2)})`;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Contorno costero nítido de cada continente sobre la cara visible
      SUBDIVIDED_CONTINENTS.forEach((cont) => {
        const rotated = cont.vecs.map(rotatePoint);
        ctx.beginPath();
        let penDown = false;
        for (let i = 0; i <= rotated.length; i++) {
          const rp = rotated[i % rotated.length];
          if (rp.z > 0.02) {
            const p = projectOrtho(rp);
            if (!penDown) {
              ctx.moveTo(p.x, p.y);
              penDown = true;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          } else {
            penDown = false;
          }
        }
        ctx.strokeStyle =
          cont.accent === 'origin'
            ? 'rgba(255, 106, 0, 0.95)'
            : cont.accent === 'dest'
            ? 'rgba(255, 155, 95, 0.72)'
            : 'rgba(255, 255, 255, 0.32)';
        ctx.lineWidth = cont.accent === 'origin' ? 1.55 : 1;
        ctx.stroke();
      });
    }

    // Dibuja rutas marítimas oceánicas reales (Pacífico y Suez) con buques/paquetes luminosos
    function drawArc(route) {
      const pts = route.vecs.map((v) => projectOrtho(rotatePoint(v)));

      ctx.beginPath();
      let penDown = false;
      for (let i = 0; i < pts.length; i++) {
        if (pts[i].z > 0.02) {
          if (!penDown) {
            ctx.moveTo(pts[i].x, pts[i].y);
            penDown = true;
          } else {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
        } else {
          penDown = false;
        }
      }
      ctx.strokeStyle = 'rgba(255, 92, 16, 0.82)';
      ctx.lineWidth = 1.75;
      ctx.stroke();

      // Dos buques/paquetes luminosos navegando a lo largo de cada corredor marítimo
      [0, 0.5].forEach((phaseShift) => {
        const prog = (packetProgress + route.offset + phaseShift) % 1;
        const idx = Math.floor(prog * (pts.length - 1));
        const pkt = pts[idx];
        if (pkt && pkt.z > 0.04) {
          ctx.beginPath();
          ctx.arc(pkt.x, pkt.y, 3.6, 0, Math.PI * 2);
          ctx.fillStyle = '#FFD0AD';
          ctx.shadowColor = '#FF5000';
          ctx.shadowBlur = 14;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
    }

    function render() {
      if (!isVisible || document.hidden) {
        rafId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;

      if (!reducedMotion) {
        if (!isDragging) rotY += autoSpeed;
        packetProgress = (packetProgress + 0.0065) % 1;
      }

      // 1. Halo atmosférico exterior del planeta Tierra
      const atmoGrad = ctx.createRadialGradient(cx, cy, radius * 0.88, cx, cy, radius * 1.18);
      atmoGrad.addColorStop(0, 'rgba(255, 80, 0, 0.16)');
      atmoGrad.addColorStop(0.55, 'rgba(255, 80, 0, 0.05)');
      atmoGrad.addColorStop(1, 'rgba(255, 80, 0, 0)');
      ctx.fillStyle = atmoGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.18, 0, Math.PI * 2);
      ctx.fill();

      // 2. Esfera oceánica 3D sombreada (da volumen esférico inmediato)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      const sphereGrad = ctx.createRadialGradient(
        cx - radius * 0.35,
        cy - radius * 0.32,
        radius * 0.12,
        cx,
        cy,
        radius
      );
      sphereGrad.addColorStop(0, '#1a1b24');
      sphereGrad.addColorStop(0.55, '#0d1018');
      sphereGrad.addColorStop(1, '#050609');
      ctx.fillStyle = sphereGrad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      // 3. Meridianos, paralelos y continentes reales dentro de la esfera
      drawGraticule();
      drawContinents();

      // Brillo sutil del borde (Fresnel / luz atmosférica)
      const rimGrad = ctx.createRadialGradient(cx, cy, radius * 0.72, cx, cy, radius);
      rimGrad.addColorStop(0, 'rgba(0,0,0,0)');
      rimGrad.addColorStop(0.84, 'rgba(255, 80, 0, 0.08)');
      rimGrad.addColorStop(1, 'rgba(255, 110, 40, 0.32)');
      ctx.fillStyle = rimGrad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      ctx.restore();

      // Borde nítido del planeta
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 110, 40, 0.38)';
      ctx.lineWidth = 1.25;
      ctx.stroke();

      // 4. Rutas marítimas elevadas por encima de la superficie del planeta
      ROUTES.forEach(drawArc);

      // 5. Nodos de hubs y etiquetas legibles con pastilla oscura
      ctx.font = '700 9.5px "JetBrains Mono", monospace';
      HUBS.forEach((hub) => {
        const rp = rotatePoint(latLonToVec(hub.lat, hub.lon));
        if (rp.z < 0.06) return;
        const p = projectOrtho(rp);
        const nodeColor = hub.dest ? '#34D399' : '#FF5000';

        // Anillo pulsante en puertos principales
        if (hub.primary) {
          const pulseR = 5 + ((packetProgress * 14) % 7);
          ctx.beginPath();
          ctx.arc(p.x, p.y, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = hub.dest ? 'rgba(52, 211, 153, 0.32)' : 'rgba(255, 80, 0, 0.42)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, hub.primary ? 4.2 : 2.8, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.shadowColor = nodeColor;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (hub.primary) {
          const textW = ctx.measureText(hub.label).width;
          const bx = p.x + 7;
          const by = p.y - 8;
          ctx.fillStyle = 'rgba(7, 8, 10, 0.78)';
          ctx.fillRect(bx - 3, by, textW + 6, 14);
          ctx.fillStyle = '#F4F4F6';
          ctx.fillText(hub.label, bx, by + 10);
        }
      });

      rafId = requestAnimationFrame(render);
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = stage.clientWidth;
      height = stage.clientHeight;
      radius = Math.min(width, height) * 0.37;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function start() {
      if (!rafId && isVisible && !document.hidden) {
        rafId = requestAnimationFrame(render);
      }
    }

    // Permitir girar el globo arrastrándolo con mouse o dedo
    stage.style.cursor = 'grab';
    stage.addEventListener('pointerdown', (e) => {
      isDragging = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      stage.style.cursor = 'grabbing';
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastPointerX;
      const dy = e.clientY - lastPointerY;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      rotY += dx * 0.008;
      rotX = Math.max(-0.85, Math.min(0.85, rotX + dy * 0.006));
    });

    window.addEventListener('pointerup', () => {
      if (isDragging) {
        isDragging = false;
        stage.style.cursor = 'grab';
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
        if (isVisible) start();
      },
      { threshold: 0.05 }
    );
    observer.observe(stage);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) start();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    resize();
    start();
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

    const lindaImg = document.getElementById('linda-portrait-img');
    const lindaFallback = document.getElementById('linda-portrait-fallback');
    if (lindaImg && CONFIG.media.lindaPortrait) {
      lindaImg.src = CONFIG.media.lindaPortrait;
      lindaImg.addEventListener('load', () => {
        lindaImg.classList.add('is-loaded');
        if (lindaFallback) lindaFallback.style.display = 'none';
      });
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
  // 5. MURO DE OPORTUNIDADES (DATOS REALES + FOTOS + LINKS 1688 / ML)
  // ==========================================================================

  function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    const filtered = PRODUCTS.filter((p) => {
      if (state.activeFilter === 'all') return true;
      return p.channel === state.activeFilter;
    });

    grid.innerHTML = filtered
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
                <span>Costo 1688 (${p.cost1688} ${p.currency})</span>
                <strong class="mono">${formatCOP(m.productCostCop)}</strong>
              </div>
              <div class="margin-row">
                <span>Flete Marítimo DDP</span>
                <strong class="mono">${formatCOP(m.ddpCostCop)}</strong>
              </div>
              <div class="margin-row">
                <span>Comisión ML (20%)</span>
                <strong class="mono">-${formatCOP(m.mlCommissionCop)}</strong>
              </div>
              <div class="margin-row highlight">
                <span>Margen Neto / und</span>
                <strong class="mono">${formatCOP(m.netMarginCop)} (${m.roiPercent}% ROI)</strong>
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
              ${ICONS.lock} Desbloquear Ganancia + Link 1688
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
                <span class="lock-pill">${ICONS.lock} Margen y proveedor bloqueados</span>
                <span class="lock-hint">Desbloquea costo 1688, link directo y margen neto</span>
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
        ? '<span style="color:var(--emerald-400);font-weight:700;">✓ Márgenes y enlaces 1688 desbloqueados</span> · <button type="button" id="relock-demo-btn" style="background:none;border:0;color:var(--text-muted);text-decoration:underline;cursor:pointer;font-size:0.78rem;">Bloquear vista</button>'
        : '<span style="color:var(--accent-light);font-weight:700;">🔒 Márgenes y enlaces 1688 protegidos</span> · Desbloquea gratis';

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

  function initProductFilters() {
    document.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeFilter = btn.getAttribute('data-filter');
        document.querySelectorAll('[data-filter]').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        renderProducts();
      });
    });
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
    state.selectedProductForLead = productName || 'Muro de Oportunidades';
    const modal = document.getElementById('lead-modal');
    const contextLabel = document.getElementById('modal-product-context');
    const feedback = document.getElementById('modal-feedback');

    if (contextLabel) contextLabel.textContent = `Desglose: ${state.selectedProductForLead}`;
    if (feedback) {
      feedback.className = 'form-feedback';
      feedback.textContent = '';
    }

    const modalVideo = document.getElementById('linda-modal-video');
    const modalFallback = document.getElementById('linda-modal-fallback');
    if (modalVideo && !modalVideoLoaded && CONFIG.media.lindaModalVideo) {
      modalVideoLoaded = true;
      modalVideo.src = CONFIG.media.lindaModalVideo;
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
    const modalVideo = document.getElementById('linda-modal-video');
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
    const modalVideo = document.getElementById('linda-modal-video');

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
          event: 'unlock_opportunity_wall',
          email,
          whatsapp,
          product: state.selectedProductForLead,
          timestamp: new Date().toISOString(),
          pageUrl: window.location.href,
        };

        try {
          const result = await postWebhook(CONFIG.webhooks.leadUnlockUrl, payload);

          state.unlocked = true;
          localStorage.setItem(STORAGE_KEY, 'true');
          renderProducts();

          feedback.className = 'form-feedback is-success';
          feedback.innerHTML = result.demo
            ? `✓ ¡Márgenes y enlaces 1688 desbloqueados! <br><a href="${buildWhatsAppLink(
                `Hola Linda, acabo de desbloquear el Muro de Oportunidades para ${state.selectedProductForLead}. Mi correo es ${email}.`
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
          submitBtn.textContent = 'Desbloquear Márgenes + Enlaces 1688';
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
        event: 'b2b_inquiry',
        serviceType: state.b2bMode,
        name,
        whatsapp,
        email,
        budget,
        details,
        timestamp: new Date().toISOString(),
        pageUrl: window.location.href,
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
        setMode('speaking', 'LINDA HABLANDO · EN VIVO');
        appendMessage('ai', reply);
        setTimeout(() => {
          if (avatarState.mode === 'speaking') setMode('idle', 'ESPECIALISTA 1688 · LISTA');
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
      setMode('idle', 'ESPECIALISTA 1688 · LISTA');
    }

    pill.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    if (micBtn) {
      micBtn.innerHTML = ICONS.mic;
      micBtn.addEventListener('click', () => {
        if (avatarState.mode === 'listening') {
          setMode('idle', 'ESPECIALISTA 1688 · LISTA');
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
              if (avatarState.mode === 'listening') setMode('idle', 'ESPECIALISTA 1688 · LISTA');
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
    initProductFilters();
    initRealtime1688Calculator();
    renderAcademy();
    renderTestimonials();
    initLeadModal();
    initB2BForm();
    initLiveAvatarWidget();
  });
})();
