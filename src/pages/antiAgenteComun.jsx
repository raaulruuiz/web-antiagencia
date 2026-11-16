import React from "react";
import { rubik } from "./antiStudioComun";

export { Hoja, Titulo, Boton, rubik } from "./antiStudioComun";

// ── Ajustes de la lista prioritaria ───────────────────────────────────────
// Tipo de reunión creado en /admin/calendly (30 min, horario copiado del tipo Q4).
export const SLUG_RESERVA = "lista-prioritaria-anti-agente";

// Interruptor: true cuando se llenen las 5 plazas. Quita el formulario de la
// landing y el calendario de la página de gracias, y muestra TEXTO_CERRADA.
export const PLAZAS_CERRADAS = false;
export const TEXTO_CERRADA = "Las 5 plazas están cogidas. Las siguientes personas entrarán en una lista de espera, ya de pago.";

// Formulario insertado de MailerLite que crea Raúl (lista prioritaria). Del código de inserción:
//   ml('account', '686354')                        → cuenta
//   <div class="ml-embedded" data-form="AbCd12">   → formulario
// Mientras sea null, la landing muestra el hueco del formulario.
export const FORM_MAILERLITE = null; // { cuenta: "686354", formulario: "AbCd12" }

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

// Aviso de lista cerrada (se muestra en lugar del formulario y del calendario)
export function ListaCerrada() {
  return (
    <>
      <div className="border-l-4 border-[#7000FF] pl-5 my-4">
        <p className="text-xl font-bold text-gray-900" style={rubik}>{TEXTO_CERRADA}</p>
      </div>
      <Pendiente>Texto provisional de lista cerrada: lo revisa Raúl. Sin cifras ni precios.</Pendiente>
    </>
  );
}
