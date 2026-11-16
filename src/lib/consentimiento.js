// Consentimiento de cookies (LSSI-CE art. 22.2).
// Meta Pixel, Google Tag Manager, Google Ads y Hotjar NO se cargan hasta que
// el visitante pulsa «Aceptar» en el banner. Umami (sin cookies) va en index.html
// y se carga siempre. Si alguien retira el consentimiento, se borran las cookies
// de esas herramientas y se recarga la página para que dejen de ejecutarse.

export const COOKIE_CONSENTIMIENTO = "cookie_consent"; // "accepted" | "rejected"
export const DIAS_CONSENTIMIENTO = 30;
export const EVENTO_CONFIGURAR = "antiagencia:configurar-cookies";

const META_PIXEL_ID = "776144446677406";
const GTM_ID = "GTM-WB2WR532";
const GOOGLE_ADS_ID = "AW-18151398838";
const HOTJAR_ID = 3593442;

// Cookies que dejan esas herramientas en antiagencia.es (para borrarlas al rechazar).
const PREFIJOS_COOKIES_TERCEROS = ["_fbp", "_fbc", "_gcl_", "_ga", "_gid", "_hj"];
// Lo que dejan en localStorage/sessionStorage (Google, Meta, Hotjar y el recuento propio).
const PREFIJOS_ALMACENAMIENTO = ["_gcl_", "lastExternalReferrer", "_hj", "hj", "_session_id", "anti-agente-utm"];

export function leerConsentimiento() {
  const m = document.cookie.match(new RegExp("(^| )" + COOKIE_CONSENTIMIENTO + "=([^;]+)"));
  return m ? m[2] : null;
}

function guardarCookie(nombre, valor, dias) {
  const expira = new Date(Date.now() + dias * 864e5).toUTCString();
  document.cookie = `${nombre}=${valor}; expires=${expira}; path=/; SameSite=Lax`;
}

let marketingCargado = false;
// Última ruta en la que ya se ha contado un PageView de Meta (evita contarlo dos veces).
let rutaPageViewMeta = null;

function anadirScript(src) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

export function cargarMarketing() {
  if (marketingCargado || typeof window === "undefined") return;
  marketingCargado = true;
  const w = window;

  // Meta Pixel
  if (!w.fbq) {
    const n = (w.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!w._fbq) w._fbq = n;
    n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
    anadirScript("https://connect.facebook.net/en_US/fbevents.js");
  }
  w.fbq("init", META_PIXEL_ID);
  w.fbq("track", "PageView");
  rutaPageViewMeta = w.location.pathname;

  // Google Tag Manager
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  anadirScript(`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`);

  // Google Ads (gtag)
  anadirScript(`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`);
  w.gtag = function () { w.dataLayer.push(arguments); };
  w.gtag("js", new Date());
  w.gtag("config", GOOGLE_ADS_ID);

  // Hotjar
  w.hj = w.hj || function () { (w.hj.q = w.hj.q || []).push(arguments); };
  w._hjSettings = { hjid: HOTJAR_ID, hjsv: 6 };
  anadirScript(`https://static.hotjar.com/c/hotjar-${HOTJAR_ID}.js?sv=6`);
}

// PageView de Meta en navegación interna (lo usa Layout.jsx).
export function contarPageViewMeta(ruta) {
  if (!window.fbq || ruta === rutaPageViewMeta) return;
  rutaPageViewMeta = ruta;
  window.fbq("track", "PageView");
}

function borrarCookiesTerceros() {
  const host = window.location.hostname;
  const dominios = ["", host, "." + host.split(".").slice(-2).join(".")];
  document.cookie.split(";").forEach((c) => {
    const nombre = c.split("=")[0].trim();
    if (!PREFIJOS_COOKIES_TERCEROS.some((p) => nombre.startsWith(p))) return;
    dominios.forEach((d) => {
      document.cookie = `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? "; domain=" + d : ""}`;
    });
  });
  [window.localStorage, window.sessionStorage].forEach((almacen) => {
    try {
      Object.keys(almacen)
        .filter((k) => PREFIJOS_ALMACENAMIENTO.some((p) => k.startsWith(p)))
        .forEach((k) => almacen.removeItem(k));
    } catch { /* sin almacenamiento */ }
  });
}

export function aceptarCookies() {
  guardarCookie(COOKIE_CONSENTIMIENTO, "accepted", DIAS_CONSENTIMIENTO);
  cargarMarketing();
}

export function rechazarCookies() {
  guardarCookie(COOKIE_CONSENTIMIENTO, "rejected", DIAS_CONSENTIMIENTO);
  borrarCookiesTerceros();
  // Si ya se habían cargado en esta visita, solo se descargan recargando.
  if (marketingCargado) window.location.reload();
}

export function abrirConfiguracionCookies() {
  window.dispatchEvent(new Event(EVENTO_CONFIGURAR));
}

// Se llama en main.jsx antes de pintar la app, para que window.fbq/gtag existan
// desde el principio si ya había consentimiento (conversiones de /YaPorFin, etc.).
export function iniciarConsentimiento() {
  if (leerConsentimiento() === "accepted") cargarMarketing();
}
