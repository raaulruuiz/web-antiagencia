import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const COOKIE_KEY = "cookie_consent";
const COOKIE_EXPIRY_DAYS = 30;

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookie(COOKIE_KEY)) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    setCookie(COOKIE_KEY, "accepted", COOKIE_EXPIRY_DAYS);
    setVisible(false);
  };

  const reject = () => {
    setCookie(COOKIE_KEY, "rejected", COOKIE_EXPIRY_DAYS);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] border-t border-white/10 px-6 py-5 shadow-2xl">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="font-body text-white/70 text-sm leading-relaxed flex-1">
          Usamos cookies propias y de terceros para mejorar tu experiencia y mostrarte contenido relevante.
          Puedes aceptarlas, rechazarlas o consultar nuestra{" "}
          <Link to="/PoliticaCookies" className="text-[#0055FF] hover:text-[#7000FF] underline underline-offset-2 transition-colors">
            Política de Cookies
          </Link>{" "}
          y{" "}
          <Link to="/PoliticaPrivacidad" className="text-[#0055FF] hover:text-[#7000FF] underline underline-offset-2 transition-colors">
            Política de Privacidad
          </Link>.
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={reject}
            className="font-body text-sm text-white/50 hover:text-white border border-white/20 hover:border-white/40 px-4 py-2 rounded-lg transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={accept}
            className="font-body text-sm font-semibold text-white bg-[#0055FF] hover:bg-[#7000FF] px-5 py-2 rounded-lg transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
