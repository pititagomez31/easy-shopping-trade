# Easy Shopping Trade Co. (CF) — Landing Page V1

Landing page **Mobile-First**, cero CDN pesados y lista para producción (HTML5 + CSS compilado a medida + Vanilla JS a 60 FPS).

## Estructura del proyecto
- `index.html` — Los 7 bloques completos del Blueprint Maestro + Modal de desbloqueo.
- `assets/css/styles.css` — Hoja de estilos de producción (oscuro OLED + acentos naranja + Bento Grid).
- `assets/js/config.js` — **Archivo clave:** aquí pegas tus Webhooks de Make/Zapier, número de WhatsApp, link del grupo de Facebook, tasas de cambio y rutas de videos.
- `assets/js/products.js` — Los 6 productos del Muro de Oportunidades (fórmula real de margen neto y ROI).
- `assets/js/app.js` — Partículas 2D (`requestAnimationFrame`), calculadora DDP, simulador CBM, modal con carga diferida y controles Mute/Unmute.
- `assets/media/` — Carpeta lista para pegar tus MP4 e imágenes.

## Cómo probarla en tu PC ahora mismo
Opción rápida: haz doble clic en `index.html` para abrirla en tu navegador, o ejecuta desde esta carpeta:
```bash
python -m http.server 8080
```
y abre `http://localhost:8080`.

## Pasos para dejarla 100% en producción
1. Abre `assets/js/config.js` y coloca:
   - Tu número real en `contact.whatsappNumber`
   - Tu link del grupo de Facebook (`+5.000` miembros) en `contact.facebookGroupUrl`
   - Tus URLs de Make.com o Zapier en `webhooks.leadUnlockUrl` y `webhooks.b2bQuoteUrl`
2. Abre `assets/js/products.js` cuando definas los precios locales de los productos 5 y 6 (Escáner 3D y Cámara de Visión Artificial).
3. Copia tus videos MP4 (`< 3 MB`) dentro de `assets/media/` siguiendo `assets/media/README.md`.
4. Sube toda esta carpeta gratis a **Cloudflare Pages**, **Netlify** o **Vercel** arrastrando la carpeta.
