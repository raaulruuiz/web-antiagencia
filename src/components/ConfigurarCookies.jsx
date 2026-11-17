import React from "react";
import { abrirConfiguracionCookies } from "@/lib/consentimiento";

// Enlace del pie que reabre el banner de cookies para cambiar el consentimiento.
export default function ConfigurarCookies({ className = "" }) {
  return (
    <button type="button" onClick={abrirConfiguracionCookies} className={className}>
      Configurar cookies
    </button>
  );
}
