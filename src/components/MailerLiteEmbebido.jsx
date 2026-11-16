import { useEffect, useRef } from "react";

// Formulario «insertado» de MailerLite (código de inserción: script universal + <div class="ml-embedded">).
// - Carga el script universal al montar (el de la cabecera del código de MailerLite), para que
//   encuentre el div aunque la página sea una SPA y se llegue navegando.
// - Rellena los campos ocultos que existan en el formulario con los UTM de la visita
//   (fields[utm_source], fields[utm_medium], fields[utm_campaign], fields[utm_content],
//   fields[utm_term] y fields[origen] con todos juntos). Si el formulario no los tiene, no pasa nada.
// - Al mostrarse el mensaje de éxito llama a onEnviado (p. ej. ir a la página de gracias con los UTM).
// - `className` del contenedor: los estilos de la web se aplican desde fuera (ver .ml-antiagencia).

const SCRIPT = "https://assets.mailerlite.com/js/universal.js";

function cargarUniversal(cuenta) {
  const w = window;
  if (!w.ml) {
    w.ml = function () { (w.ml.q = w.ml.q || []).push(arguments); };
    w.ml("account", cuenta);
  }
  // Se vuelve a insertar en cada montaje: el script recorre los .ml-embedded que hay al cargar.
  const s = document.createElement("script");
  s.async = true;
  s.src = `${SCRIPT}?v=${Date.now()}`;
  s.dataset.mlUniversal = "1";
  document.head.appendChild(s);
  return s;
}

export default function MailerLiteEmbebido({ cuenta, formulario, utm = {}, onEnviado, className = "" }) {
  const caja = useRef(null);
  const avisado = useRef(false);

  useEffect(() => {
    const s = cargarUniversal(cuenta);
    return () => s.remove();
  }, [cuenta, formulario]);

  useEffect(() => {
    const el = caja.current;
    if (!el) return undefined;
    const origen = Object.entries(utm).map(([k, v]) => `${k}=${v}`).join(", ");
    const valores = { ...utm, origen };

    const revisar = () => {
      for (const [k, v] of Object.entries(valores)) {
        const input = el.querySelector(`input[name="fields[${k}]"]`);
        if (input && v && input.value !== v) input.value = v;
      }
      const exito = el.querySelector(".ml-form-successBody");
      if (!avisado.current && exito && getComputedStyle(exito).display !== "none") {
        avisado.current = true;
        onEnviado?.();
      }
    };

    revisar();
    const obs = new MutationObserver(revisar);
    obs.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "class"] });
    return () => obs.disconnect();
  }, [utm, onEnviado]);

  return (
    <div ref={caja} className={className}>
      <div className="ml-embedded" data-form={formulario} />
    </div>
  );
}
