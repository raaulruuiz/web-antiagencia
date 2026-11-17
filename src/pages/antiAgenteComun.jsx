import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import FormularioListaPrioritaria from "@/components/FormularioListaPrioritaria";
import { claseBoton, rubik } from "./antiStudioComun";
import { leerConsentimiento } from "@/lib/consentimiento";

export { Hoja, Titulo, Boton, claseBoton, rubik } from "./antiStudioComun";

// ── Ajustes de la lista prioritaria ───────────────────────────────────────
// Tipo de reunión creado en /admin/calendly (30 min, horario copiado del tipo Q4).
export const SLUG_RESERVA = "lista-prioritaria-anti-agente";

// Plazas: PLAZAS_RESTANTES es el único valor que hay que cambiar a mano cuando
// alguien coge una plaza. Alimenta el contador de todos los botones de la landing
// («Quedan 5 de 5 plazas»). Con 0 la lista queda cerrada: se quita el formulario de
// la landing y el calendario de la página de gracias, y se muestra TEXTO_CERRADA.
export const PLAZAS_TOTALES = 5;
export const PLAZAS_RESTANTES = 5;
export const PLAZAS_CERRADAS = PLAZAS_RESTANTES <= 0;
export const TEXTO_CERRADA = "Las 5 plazas están cogidas. Las siguientes personas entrarán en una lista de espera, ya de pago.";

// Formulario de MailerLite de la lista prioritaria (creado por Raúl; añade al grupo
// «Lista prioritaria Anti-Agente»). La landing usa marcado propio y envía a su URL de alta.
export const FORM_MAILERLITE = { cuenta: "686354", formulario: "204330336655509273" };

export const RUTA_GRACIAS = "/anti-agente/gracias";

// ── UTM ───────────────────────────────────────────────────────────────────
// Se guardan al entrar en la landing (por si MailerLite pierde la URL al
// redirigir) y se reenvían a la página de gracias y a la reserva.
// Sin consentimiento de cookies solo se guardan en memoria (no en el navegador):
// valen para la navegación dentro de la web, pero no sobreviven a una recarga.
const CLAVE_UTM = "anti-agente-utm";
let utmEnMemoria = {};
const puedeGuardar = () => leerConsentimiento() === "accepted";

export function leerUtm(search) {
  const p = new URLSearchParams(search);
  const utm = {};
  for (const [k, v] of p) if (k.startsWith("utm_") && v) utm[k] = v.slice(0, 100);
  if (Object.keys(utm).length) {
    utmEnMemoria = utm;
    if (puedeGuardar()) {
      try { sessionStorage.setItem(CLAVE_UTM, JSON.stringify(utm)); } catch { /* sin almacenamiento */ }
    }
    return utm;
  }
  if (Object.keys(utmEnMemoria).length || !puedeGuardar()) return utmEnMemoria;
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

// Contador de plazas que va debajo de cada botón (no se muestra con la lista cerrada)
export function Contador({ className = "" }) {
  if (PLAZAS_CERRADAS) return null;
  const texto = PLAZAS_RESTANTES === 1 ? `Queda 1 de ${PLAZAS_TOTALES} plazas` : `Quedan ${PLAZAS_RESTANTES} de ${PLAZAS_TOTALES} plazas`;
  return <p className={`text-sm font-bold text-[#7000FF] mt-3 ${className}`} style={rubik}>{texto}</p>;
}

// Aviso de lista cerrada (se muestra en lugar del formulario y del calendario)
export function ListaCerrada() {
  return (
    <div className="border-l-4 border-[#7000FF] pl-5 my-4">
      <p className="text-xl font-bold text-gray-900" style={rubik}>{TEXTO_CERRADA}</p>
    </div>
  );
}

// ── Piezas compartidas por /anti-agente (B) y /anti-agente-a ─────────────────
export const TEXTO_BOTON = "Quiero una de las 5 plazas";
export const APROBACION = "Por defecto, nada se publica ni se envía sin tu aprobación";
// Microtexto bajo los botones con microtexto (cabecera y formulario). Texto de Raúl, 17-11-2026.
export const TEXTO_BAJO_BOTON = "Cuando te apuntes, te escribiré para agendar una llamada: te hago una demo para enseñarte la herramienta, dejamos tu equipo a punto y hacemos la auditoría de costes. Es gratis porque usa Claude Code y Codex (ChatGPT), los programas oficiales, con tu propia cuenta. Inicias sesión tú y gasta de tu plan. Así que solo está sujeto a los términos de cada proveedor.";

// Vídeo de la cabecera: lo grabará Raúl. Mientras VIDEO_PENDIENTE sea true, en la revisión
// (vite dev) se ve un hueco naranja señalado y en producción no se pinta nada, para no
// publicar una caja vacía. Cuando exista el vídeo, se monta aquí (con VideoConsentido).
export const VIDEO_PENDIENTE = true;
export const VIDEO_VISIBLE = !VIDEO_PENDIENTE || import.meta.env.DEV;

export function Video() {
  if (!VIDEO_VISIBLE) return null;
  return (
    <div className="border-2 border-dashed border-orange-400 bg-orange-50 rounded-sm mb-3">
      <div className="aspect-video flex flex-col items-center justify-center text-center px-6 text-orange-900" style={rubik}>
        <span className="w-14 h-14 rounded-full bg-orange-200 flex items-center justify-center text-2xl mb-4" aria-hidden="true">▶</span>
        <p className="font-bold">PENDIENTE · Hueco provisional del vídeo</p>
        <p className="text-sm mt-1">Vídeo de 60-90 s que grabará Raúl. En la web publicada este hueco no se muestra hasta que esté el vídeo.</p>
      </div>
    </div>
  );
}

export function Microcopy({ children }) {
  return <p className="text-sm text-gray-600 mt-3" style={rubik}>{children}</p>;
}

export function Formulario({ utm }) {
  const navigate = useNavigate();
  const gracias = `${RUTA_GRACIAS}${utmAQuery(utm)}`;
  const alEnviar = useCallback(() => navigate(gracias), [navigate, gracias]);
  return (
    <FormularioListaPrioritaria
      {...FORM_MAILERLITE}
      textoBoton={TEXTO_BOTON}
      claseBoton={claseBoton()}
      estiloBoton={rubik}
      bajoBoton={<><Contador /><Microcopy>{TEXTO_BAJO_BOTON}</Microcopy></>}
      onEnviado={alEnviar}
    />
  );
}

// Preguntas frecuentes cortas (texto de Raúl, 17-11-2026), en las dos versiones de la landing.
export const PREGUNTAS = [
  ["¿De verdad es gratis?", "Sí, la app es gratis. Usa Claude Code y Codex (ChatGPT), los programas oficiales, con tu propia cuenta. Inicias sesión tú y gasta de tu plan. Sujeto a los términos de cada proveedor."],
  ["¿Tengo que saber de IA?", "No. Viene montado y al empezar le explicas tu negocio con tus palabras. Y si tienes dudas, hablas conmigo."],
  ["¿Tengo que dejar mis herramientas?", "No. Se conecta con las que ya usas. En la auditoría de costes es posible que quieras sustituir algo que ya usas por algo gratis hecho a medida para ti, pero no es necesario si no quieres. Los agentes pueden usar todas tus herramientas."],
  ["¿Puede enviar algo sin que yo lo vea?", "Por defecto, no. Todo lo que se publica o se envía te llega antes para que lo apruebes."],
];
