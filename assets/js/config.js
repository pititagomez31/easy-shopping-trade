/**
 * ============================================================================
 * EASY SHOPPING TRADE CO. (CF) — CONFIGURACIÓN CENTRAL
 * ============================================================================
 * Edita únicamente este archivo para conectar Webhooks, WhatsApp, tasas de
 * cambio multi-moneda, parámetros internos DDP marítimo y videos.
 */

window.EST_CONFIG = {
  brand: {
    name: 'Easy Shopping Trade Co.',
    shortName: 'CF',
    legacyName: 'Compra Fácil en China',
    communitySize: '+5.000',
    yearsActive: '5+',
  },

  // 1. WEBHOOKS (Make.com -> Google Sheets / Email / CRM)
  webhooks: {
    leadUnlockUrl: 'https://hook.eu1.make.com/csfagv398ryaq4ji3et6gwcfty29hpkl',
    b2bQuoteUrl: 'https://hook.eu1.make.com/csfagv398ryaq4ji3et6gwcfty29hpkl',
  },

  // 2. CONTACTO Y COMUNIDAD
  contact: {
    whatsappNumber: '8615309284441',
    facebookGroupUrl: 'https://www.facebook.com/share/g/1FaqsCt2W1/',
    youtubeUrl: 'https://www.youtube.com/@comprafacilen1688ychina',
    email: 'info@comprafacilenchina.com',
  },

  // 3. PARÁMETROS INTERNOS DE CÁLCULO (NO SE EXPONEN COMO TARIFA UNITARIA)
  pricing: {
    ddpRatePerCbmCop: 4000000, // Base interna oculta Ruta Marítima DDP (COP / CBM)
    mlCommissionRate: 0.20,    // 20% comisión estimada Mercado Libre
    cnyToCop: 590,             // Referencia 1 CNY -> COP
    usdToCop: 4250,            // Referencia 1 USD -> COP
  },

  // 4. MULTI-MONEDA PARA LA CALCULADORA 1688 (LATAM + ESPAÑA + USD)
  // copPerUnit: cuántos COP equivale 1 unidad de esta moneda (para convertir
  // automáticamente tanto los Yuanes como el flete marítimo DDP base en COP).
  currencies: {
    COP: {
      code: 'COP',
      label: 'Colombia (COP)',
      locale: 'es-CO',
      copPerUnit: 1,
      decimals: 0,
    },
    MXN: {
      code: 'MXN',
      label: 'México (MXN)',
      locale: 'es-MX',
      copPerUnit: 215,
      decimals: 2,
    },
    CLP: {
      code: 'CLP',
      label: 'Chile (CLP)',
      locale: 'es-CL',
      copPerUnit: 4.45,
      decimals: 0,
    },
    PEN: {
      code: 'PEN',
      label: 'Perú (PEN · Soles)',
      locale: 'es-PE',
      copPerUnit: 1135,
      decimals: 2,
    },
    ARS: {
      code: 'ARS',
      label: 'Argentina (ARS)',
      locale: 'es-AR',
      copPerUnit: 4.1,
      decimals: 0,
    },
    USD: {
      code: 'USD',
      label: 'Dólar (USD)',
      locale: 'en-US',
      copPerUnit: 4250,
      decimals: 2,
    },
    EUR: {
      code: 'EUR',
      label: 'España / Europa (EUR)',
      locale: 'es-ES',
      copPerUnit: 4600,
      decimals: 2,
    },
  },

  // 5. ARCHIVOS MULTIMEDIA (MP4/WebM 720p, < 3MB)
  media: {
    heroVideo: 'assets/media/hero-robot.mp4',
    heroPoster: 'assets/media/hero-robot-poster.jpg',
    unlockModalVideo: 'assets/media/desbloqueo-modal.mp4',
  },

  // 6. CHAT / ASESORÍA EN VIVO (Equipo Easy Shopping CF — listo para conectar API de chatbot)
  liveAvatar: {
    enabled: true,
    provider: 'demo', // Cambiar a 'api' al conectar tu endpoint de chatbot en Railway o Make
    chatEndpoint: '', // Ej: '/api/chat' o URL de webhook de Make/n8n
    avatarName: 'Equipo Easy Shopping (CF)',
    avatarRole: 'Asesoría 1688 & Logística Marítima',
    greeting:
      'Hola, bienvenido a Easy Shopping Trade Co. (CF). Te ayudamos a cotizar productos de 1688 en tu moneda local con ruta marítima DDP hacia Latinoamérica y España, o a validar fábricas en China. ¿Qué producto quieres analizar?',
    quickPrompts: [
      {
        label: '¿Por qué ruta marítima DDP?',
        reply:
          'La ruta marítima consolidada DDP es la forma más inteligente de multiplicar tu capital: reduce drásticamente el costo por unidad frente al flete aéreo, incluye consolidación en bodega en China y entrega puerta a puerta sin sorpresas aduaneras.',
      },
      {
        label: '¿Validan proveedores de 1688?',
        reply:
          'Sí. Aunque hoy puedas pagar en 1688 con tarjeta, el riesgo real en tecnología son los revendedores y lotes defectuosos. Validamos la fábrica en China, inspeccionamos la mercancía antes de embarcar y consolidamos tus pedidos.',
      },
      {
        label: 'Envíos a LATAM y España',
        reply:
          'Operamos carga consolidada marítima desde China hacia Colombia, México, Chile, Perú, Argentina y España. Prueba la Calculadora 1688 en tu moneda local para ver el costo total puesto en destino.',
      },
    ],
  },

  // 7. SERVICIOS DE CONSULTORÍA B2B (TAB 2 DEL MÓDULO HÍBRIDO)
  consultingServices: [
    {
      code: 'SVC.01',
      title: 'Auditoría y Validación de Fábricas 1688',
      tag: 'Cero Revendedores',
      description:
        'Verificamos licencias comerciales chinas, capacidad real de producción y trazabilidad de fabricantes en Shenzhen, Dongguan, Guangzhou y Yiwu antes de que gires capital.',
      specs: ['Verificación legal AMR en China', 'Evidencia fotográfica y video en planta', 'Comparativa directa con fabricantes'],
    },
    {
      code: 'SVC.02',
      title: 'Control de Calidad Técnico (QC)',
      tag: 'Hardware & Electrónica',
      description:
        'Pruebas de encendido, voltaje, baterías de litio, empaque y especificaciones técnicas en nuestra bodega de China para evitar pérdidas al recibir tu mercancía.',
      specs: ['Pruebas funcionales por muestreo AQL', 'Inspección pre-embarque con reporte', 'Retención de lotes defectuosos en origen'],
    },
    {
      code: 'SVC.03',
      title: 'Desarrollo OEM / ODM y Marca Propia',
      tag: 'Diferenciación B2B',
      description:
        'Pasa de competir por precio a importar tu propia línea tecnológica desde 1688 y fábricas directas con logotipo, empaque personalizado y manuales en español.',
      specs: ['Personalización de hardware y packaging', 'Negociación de MOQ reducidos', 'Protección de especificaciones'],
    },
    {
      code: 'SVC.04',
      title: 'Logística Marítima Consolidada DDP',
      tag: 'China → LATAM & España',
      description:
        'Reunimos pedidos de múltiples proveedores de 1688 en una sola carga marítima optimizada y entregamos puerta a puerta con nacionalización incluida.',
      specs: ['Ruta marítima de máxima rentabilidad', 'Consolidación multi-proveedor en China', 'Costo cerrado antes de embarcar'],
    },
  ],

  // 8. MÓDULOS DE VIDEO — EL SISTEMA 1688 (HeyGen / YouTube / MP4)
  academyModules: [
    {
      id: 'mod-1',
      number: '01',
      duration: '01:00',
      tag: 'Despertar',
      title: '1688 ya acepta tarjeta, pero ahí pierden dinero los novatos',
      summary:
        'Por qué pagarle a una fábrica en 1688 es solo el 10% del trabajo y cómo evitar perder tu inversión en calidad o fletes aéreos costosos.',
      takeaways: [
        'Diferencia real de precios entre Alibaba (extranjeros) y 1688 (fábricas internas).',
        'Por qué el proveedor en 1688 NO exporta ni nacionaliza en tu país.',
        'Cómo la ruta marítima consolidada DDP dispara tu margen neto.',
      ],
      videoSrc: 'assets/media/sistema-1688-mod1.mp4',
      youtubeEmbedUrl: '',
    },
    {
      id: 'mod-2',
      number: '02',
      duration: '01:15',
      tag: 'Búsqueda',
      title: 'Cómo encontrar fábricas en 1688 por foto (sin hablar chino)',
      summary:
        'Toma cualquier producto ganador de Mercado Libre o Amazon y ubica a su fabricante directo en 1688 en menos de 30 segundos.',
      takeaways: [
        'Configuración rápida de la app de 1688 en español.',
        'Uso estratégico de búsqueda por imagen para saltar intermediarios.',
        'Cómo comparar rangos de precio por volumen (MOQ) y variables.',
      ],
      videoSrc: 'assets/media/sistema-1688-mod2.mp4',
      youtubeEmbedUrl: '',
    },
    {
      id: 'mod-3',
      number: '03',
      duration: '01:20',
      tag: 'Validación',
      title: 'Fábrica real vs. revendedor: el filtro técnico en tecnología',
      summary:
        'Las señales clave dentro del perfil de 1688 y qué verificaciones físicas exigimos antes de liberar un lote tecnológico.',
      takeaways: [
        'Lectura de antigüedad, sello de fábrica verificada y tasa de recompra.',
        'Por qué en electrónica y baterías las fotos del catálogo no son garantía.',
        'Protocolo de inspección técnica pre-embarque (QC) en China.',
      ],
      videoSrc: 'assets/media/sistema-1688-mod3.mp4',
      youtubeEmbedUrl: '',
    },
    {
      id: 'mod-4',
      number: '04',
      duration: '01:10',
      tag: 'Finanzas',
      title: 'La trampa del novato: calcular tu costo real puesto en destino',
      summary:
        'Convierte yuanes (CNY) a tu moneda local, suma la ruta marítima DDP según medidas exactas y calcula tu margen de ganancia real antes de comprar.',
      takeaways: [
        'Cómo influye el volumen del empaque en tu ganancia real al importar por mar.',
        'Uso de nuestra Calculadora 1688 multi-moneda (COP, MXN, CLP, PEN, ARS, USD, EUR).',
        'Cómo encontrar productos donde duplicas o triplicas tu inversión.',
      ],
      videoSrc: 'assets/media/sistema-1688-mod4.mp4',
      youtubeEmbedUrl: '',
    },
    {
      id: 'mod-5',
      number: '05',
      duration: '01:15',
      tag: 'Ejecución',
      title: 'Consolidación marítima en bodega y entrega puerta a puerta (DDP)',
      summary:
        'Reúne pedidos de varias fábricas de 1688 en un solo embarque marítimo asegurado hacia Latinoamérica o España.',
      takeaways: [
        'Recepción en bodega de China y consolidación multi-proveedor.',
        'Empaque reforzado para tecnología y gestión segura de baterías.',
        'Entrega puerta a puerta sin trámites aduaneros complejos.',
      ],
      videoSrc: 'assets/media/sistema-1688-mod5.mp4',
      youtubeEmbedUrl: '',
    },
  ],

  // 9. PRUEBA SOCIAL (Videos reales con Mute/Unmute)
  testimonials: [
    {
      id: 'case-1',
      category: 'Tecnología · Carga Rápida',
      clientName: 'Andrés M. — Bogotá',
      headline: 'De comprar en distribuidores locales a importar por mar directo de 1688 con 2.4x de retorno',
      metric: '+140% de ganancia real',
      quote: '“Cambiar de aéreo a ruta marítima DDP nos disparó el margen por unidad y nos quitó el miedo a la aduana.”',
      videoSrc: 'assets/media/testimonio-tech-1.mp4',
    },
    {
      id: 'case-2',
      category: 'Audio y Accesorios Tech',
      clientName: 'Camila R. — Medellín',
      headline: 'Primera importación consolidada desde 4 proveedores distintos de 1688',
      metric: '0 unidades defectuosas',
      quote: '“La inspección previa en China nos salvó un lote completo con empaques dañados antes de embarcar.”',
      videoSrc: 'assets/media/testimonio-tech-2.mp4',
    },
    {
      id: 'case-3',
      category: 'Juguetería & Escala Comercial',
      clientName: 'Carlos V. — Cali / Madrid',
      headline: 'De pedidos pequeños con Compra Fácil a cargas marítimas recurrentes',
      metric: '5 años importando',
      quote: '“Pasamos de mover inventario de bazar a escalar líneas rentables con respaldo real en China.”',
      videoSrc: 'assets/media/testimonio-jugueteria.mp4',
    },
  ],

  // --------------------------------------------------------------------------
  // 8. Proveedores Verificados Gratis (videos de empresa y enlaces 1688)
  // --------------------------------------------------------------------------
  verifiedSuppliers: [
    {
      id: 'sup-1',
      code: 'PROV-01',
      city: 'Shenzhen, Guangdong',
      sector: 'Tecnología & Gadgets Innovadores',
      name: 'Fábrica Verificada #01 — Hardware & Gadgets Inteligentes',
      summary:
        'Fabricante directo en Shenzhen especializado en dispositivos inteligentes de lanzamiento temprano, antes de que se saturen en marketplaces locales.',
      highlights: [
        'Inspección física de planta y licencias en China',
        'Líneas con alta diferenciación y baja competencia',
        'Catálogo con precios directos de fábrica 1688',
      ],
      videoSrc: 'assets/media/proveedor-1.mp4',
      youtubeEmbedUrl: '',
      supplierUrl: '',
    },
    {
      id: 'sup-2',
      code: 'PROV-02',
      city: 'Dongguan, Guangdong',
      sector: 'Audio, Iluminación & Diseño',
      name: 'Fábrica Verificada #02 — Electrónica de Consumo Premium',
      summary:
        'Planta certificada en Dongguan con control de calidad en línea de montaje y empaques listos para diferenciarte por diseño e innovación.',
      highlights: [
        'Video real de planta y control de calidad incluido',
        'Opciones de marca propia y empaque reforzado',
        'Despacho consolidado hacia ruta marítima DDP',
      ],
      videoSrc: 'assets/media/proveedor-2.mp4',
      youtubeEmbedUrl: '',
      supplierUrl: '',
    },
    {
      id: 'sup-3',
      code: 'PROV-03',
      city: 'Guangzhou / Ningbo',
      sector: 'Hogar Inteligente & Movilidad',
      name: 'Fábrica Verificada #03 — Equipamiento Novedoso de Alto Margen',
      summary:
        'Proveedor auditado enfocado en soluciones prácticas e innovadoras de alta rotación para quienes buscan márgenes superiores sin guerra de precios.',
      highlights: [
        'Acceso abierto sin suscripción ni intermediarios',
        'Verificación comercial y trazabilidad bancaria',
        'Ideal para escalar cargas marítimas rentables',
      ],
      videoSrc: 'assets/media/proveedor-3.mp4',
      youtubeEmbedUrl: '',
      supplierUrl: '',
    },
  ],
};
