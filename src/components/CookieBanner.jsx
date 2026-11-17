import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  leerConsentimiento,
  aceptarCookies,
  rechazarCookies,
  EVENTO_CONFIGURAR,
} from "@/lib/consentimiento";

// Banner de cookies. Hasta que se pulsa «Aceptar» no se carga Meta Pixel,
// Google Tag Manager, Google Ads ni Hotjar (ver src/lib/consentimiento.js).
// Se reabre desde el enlace «Configurar cookies» del pie.
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [actual, setActual] = useState(null);

  useEffect(() => {
    if (!leerConsentimiento()) setVisible(true);
    const abrir = () => {
      setActual(leerConsentimiento());
      setVisible(true);
    };
    window.addEventListener(EVENTO_CONFIGURAR, abrir);
    return () => window.removeEventListener(EVENTO_CONFIGURAR, abrir);
  }, []);

  const accept = () => {
    aceptarCookies();
    setVisible(false);
  };

  const reject = () => {
    setVisible(false);
    rechazarCookies();
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Configuración de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] border-t border-white/10 px-6 py-5 shadow-2xl"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="font-body text-white/70 text-sm leading-relaxed flex-1">
          Usamos cookies propias, necesarias para que la web funcione, y, solo si las aceptas, cookies de terceros
          (Meta, Google y Hotjar) para medir campañas, mostrarte publicidad y ver cómo se usa la web. Puedes cambiar
          de opinión cuando quieras en «Configurar cookies», al pie de la página. Más información en la{" "}
          <Link to="/PoliticaCookies" className="text-[#0067FD] hover:text-[#7000FF] underline underline-offset-2 transition-colors">
            Política de Cookies
          </Link>{" "}
          y la{" "}
          <Link to="/politica-privacidad" className="text-[#0067FD] hover:text-[#7000FF] underline underline-offset-2 transition-colors">
            Política de Privacidad
          </Link>.
          {actual && (
            <span className="block mt-1 text-white/50">
              Ahora mismo las tienes {actual === "accepted" ? "aceptadas" : "rechazadas"}.
            </span>
          )}
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={reject}
            className="font-body text-sm font-semibold text-white border border-white/60 hover:border-white px-5 py-2 rounded-lg transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={accept}
            className="font-body text-sm font-semibold text-white bg-[#0067FD] hover:bg-[#7000FF] border border-[#0067FD] hover:border-[#7000FF] px-5 py-2 rounded-lg transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
