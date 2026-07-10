import { useEffect } from "react";

/**
 * Componente reutilizable para formularios de MailerLite.
 * Gestiona la inyección/limpieza de CSS y script, y el callback de éxito.
 *
 * Props:
 *   mlb2Id       — ID del formulario (ej: "38376765"). Usado en clases CSS y HTML ids.
 *   accountId    — ID de cuenta MailerLite (ej: "686354").
 *   formActionId — ID numérico del formulario en la URL de acción (ej: "181751106241562330").
 *   css          — String CSS específico del formulario (generado por MailerLite).
 *   submitText   — Texto del botón de envío.
 *   instanceId   — Sufijo único para los elementos style/script del DOM (ej: "home", "homev2").
 *   successRedirect — URL a la que redirigir tras el envío exitoso.
 *   scriptVersion — Hash de versión del script de MailerLite (ej: "vb397d78ebaa8a0f631d35384c46d781b").
 */
export default function MailerLiteForm({
  mlb2Id,
  accountId,
  formActionId,
  css,
  submitText,
  instanceId,
  successRedirect = "https://antiagencia.es/yaporfin",
  scriptVersion = "",
}) {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = css;
    style.id = `mailerlite-css-${instanceId}`;
    document.head.appendChild(style);

    window[`ml_webform_success_${mlb2Id}`] = function () {
      try { window.top.location.href = successRedirect; }
      catch (e) { window.location.href = successRedirect; }
    };

    fetch(`https://assets.mailerlite.com/jsonp/${accountId}/forms/${formActionId}/takel`);

    const script = document.createElement("script");
    const versionSuffix = scriptVersion ? `?${scriptVersion}` : "";
    script.src = `https://groot.mailerlite.com/js/w/webforms.min.js${versionSuffix}`;
    script.type = "text/javascript";
    script.id = `mailerlite-script-${instanceId}`;
    document.body.appendChild(script);

    return () => {
      const el = document.getElementById(`mailerlite-css-${instanceId}`);
      if (el && el.parentNode) el.parentNode.removeChild(el);
      const sc = document.getElementById(`mailerlite-script-${instanceId}`);
      if (sc && sc.parentNode) sc.parentNode.removeChild(sc);
    };
  }, []);

  return (
    <div id={`mlb2-${mlb2Id}`} className={`ml-form-embedContainer ml-subscribe-form ml-subscribe-form-${mlb2Id}`}>
      <div className="ml-form-align-center">
        <div className="ml-form-embedWrapper embedForm">
          <div className="ml-form-embedBody ml-form-embedBodyDefault row-form">
            <div className="ml-form-embedContent" style={{ marginBottom: 0 }}></div>
            <form
              className="ml-block-form"
              action={`https://assets.mailerlite.com/jsonp/${accountId}/forms/${formActionId}/subscribe`}
              data-code=""
              method="post"
              target="_blank"
            >
              <div className="ml-form-formContent">
                <div className="ml-form-fieldRow ml-last-item">
                  <div className="ml-field-group ml-field-email ml-validate-email ml-validate-required">
                    <input
                      aria-label="email"
                      aria-required="true"
                      type="email"
                      className="form-control"
                      name="fields[email]"
                      placeholder="Tu email"
                      autoComplete="email"
                    />
                  </div>
                </div>
              </div>
              <div className="ml-form-checkboxRow ml-validate-required">
                <label className="checkbox">
                  <input type="checkbox" />
                  <div className="label-description">
                    <p>Acepto la <a href="https://antiagencia.es/politica-privacidad">política de privacidad</a></p>
                  </div>
                </label>
              </div>
              <input type="hidden" name="ml-submit" value="1" />
              <div className="ml-form-embedSubmit">
                <button type="submit" className="primary">{submitText}</button>
                <button disabled type="button" className="loading" style={{ display: "none" }}>
                  <div className="ml-form-embedSubmitLoad"></div>
                  <span className="sr-only">Loading...</span>
                </button>
              </div>
              <input type="hidden" name="anticsrf" value="true" />
            </form>
          </div>
          <div className="ml-form-successBody row-success" style={{ display: "none" }}>
            <div className="ml-form-successContent">
              <h4>¡Gracias por apuntarte!</h4>
              <p>Prometo mandarte mucho valor y entretenimiento</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
