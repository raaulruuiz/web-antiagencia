import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";

// A esta página vuelve Stripe después de pagar, cancelar o gestionar la suscripción. El acceso lo da el aviso de Stripe, no esta página.
const pantalla = "min-h-screen bg-[#121212] text-white flex items-center justify-center px-6";
const tarjeta = "w-full max-w-md bg-white text-[#111827] rounded-lg p-8";

const TEXTOS = {
  hecho: ["Pago hecho", "Vuelve a Anti-Agente: la herramienta se desbloquea sola en unos segundos."],
  cancelado: ["No se ha cobrado nada", "Has salido del pago. Puedes volver a Anti-Agente e intentarlo cuando quieras."],
  gestion: ["Listo", "Los cambios de tu suscripción ya están guardados. Puedes volver a Anti-Agente."],
};

export default function PagoAntiAgente() {
  const estado = useMemo(() => new URLSearchParams(window.location.search).get("estado"), []);
  const [titulo, texto] = TEXTOS[estado] || TEXTOS.gestion;
  return (
    <>
      <Helmet><title>Pago de Anti-Agente</title><meta name="robots" content="noindex" /></Helmet>
      <div className={pantalla}><div className={tarjeta}><h1 className="text-2xl font-bold mb-2">{titulo}</h1><p className="text-gray-600">{texto}</p></div></div>
    </>
  );
}
