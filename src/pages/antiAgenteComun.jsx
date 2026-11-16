import React from "react";
import { rubik } from "./antiStudioComun";

export { Hoja, Titulo, Boton, rubik } from "./antiStudioComun";

// ── Ajustes pendientes de cerrar ──────────────────────────────────────────
// Slug del tipo de reunión en /admin/calendly para la videollamada de la lista
// prioritaria. Mientras sea null, la página de gracias muestra un aviso.
// Para probar con otro tipo sin tocar código: /anti-agente/gracias?tipo=<slug>
export const SLUG_RESERVA = null;

// Datos del formulario de MailerLite que prepara Raucu (lista prioritaria).
// Mientras sea null, la landing muestra el hueco del formulario.
export const FORM_MAILERLITE = null; // { mlb2Id, accountId, formActionId, css, scriptVersion }

export const RUTA_GRACIAS = "/anti-agente/gracias";

// ── UTM ───────────────────────────────────────────────────────────────────
// Se guardan al entrar en la landing (por si MailerLite pierde la URL al
// redirigir) y se reenvían a la página de gracias y a la reserva.
const CLAVE_UTM = "anti-agente-utm";

export function leerUtm(search) {
  const p = new URLSearchParams(search);
  const utm = {};
  for (const [k, v] of p) if (k.startsWith("utm_") && v) utm[k] = v.slice(0, 100);
  if (Object.keys(utm).length) {
    try { sessionStorage.setItem(CLAVE_UTM, JSON.stringify(utm)); } catch { /* sin almacenamiento */ }
    return utm;
  }
  try { return JSON.parse(sessionStorage.getItem(CLAVE_UTM) || "{}"); } catch { return {}; }
}

export const utmAQuery = (utm) => {
  const q = new URLSearchParams(utm).toString();
  return q ? `?${q}` : "";
};

export const utmATexto = (utm) => Object.entries(utm).map(([k, v]) => `${k}=${v}`).join(", ");

// ── Marcas de borrador ────────────────────────────────────────────────────
// Recuadro naranja: nota interna para la revisión de Raúl. Solo se ve en local
// (vite dev, la vista previa); en cualquier build de producción no se renderiza.
export function Pendiente({ children }) {
  if (!import.meta.env.DEV) return null;
  return (
    <div className="border-2 border-dashed border-orange-400 bg-orange-50 text-orange-900 text-sm rounded-sm px-4 py-3 my-4" style={rubik}>
      <strong>PENDIENTE · </strong>{children}
    </div>
  );
}

export const Parrafo = ({ children, className = "" }) => (
  <p className={`text-gray-800 text-lg leading-loose mb-4 ${className}`}>{children}</p>
);

// Lista con check azul, como en /trabajaconnosotros
export function Check({ titulo, children }) {
  return (
    <div className="flex items-start gap-3 mb-3 text-gray-800 text-lg leading-loose">
      <span className="flex-shrink-0 h-[2em] flex items-center">
        <span className="w-5 h-5 rounded-full bg-[#0067FD] flex items-center justify-center text-white text-xs font-bold">✓</span>
      </span>
      <span>{titulo && <strong className="text-[#0067FD]">{titulo}</strong>}{titulo && " "}{children}</span>
    </div>
  );
}
