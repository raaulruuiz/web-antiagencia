import React, { useEffect } from "react";
import FooterMinimal from "@/components/landing/FooterMinimal";

const mailerLiteCSS = `
@import url("https://assets.mlcdn.com/fonts.css?version=1773928");
.ml-form-embedSubmitLoad{display:inline-block;width:20px;height:20px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}.ml-form-embedSubmitLoad:after{content:" ";display:block;width:11px;height:11px;margin:1px;border-radius:50%;border:4px solid #fff;border-color:#ffffff #ffffff #ffffff transparent;animation:ml-form-embedSubmitLoad 1.2s linear infinite}@keyframes ml-form-embedSubmitLoad{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}#mlb2-38376765.ml-form-embedContainer{box-sizing:border-box;display:table;margin:0 auto;position:static;width:100%!important}#mlb2-38376765.ml-form-embedContainer h4,#mlb2-38376765.ml-form-embedContainer p,#mlb2-38376765.ml-form-embedContainer span,#mlb2-38376765.ml-form-embedContainer button{text-transform:none!important;letter-spacing:normal!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper{background-color:#f6f6f6;border-width:0px;border-color:transparent;border-radius:4px;border-style:solid;box-sizing:border-box;display:inline-block!important;margin:0;padding:0;position:relative}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper.embedPopup,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper.embedDefault{width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper.embedForm{max-width:100%;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody{padding:20px 20px 0 20px}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent{text-align:left;margin:0 0 20px 0}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent h4,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent h4{color:#000000;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:30px;font-weight:400;margin:0 0 10px 0;text-align:left;word-break:break-word}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent p,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent p{color:#000000;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:14px;font-weight:400;line-height:20px;margin:0 0 10px 0;text-align:left}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-block-form .ml-field-group{text-align:left!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-block-form .ml-field-group label{margin-bottom:5px;color:#333333;font-size:14px;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-weight:bold;font-style:normal;text-decoration:none;display:inline-block;line-height:20px}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody form{margin:0;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-formContent,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow{margin:0 0 20px 0;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow{float:left}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow{margin:0 0 10px 0;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow.ml-last-item{margin:0}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow input{background-color:#ffffff!important;color:#333333!important;border-color:#cccccc;border-radius:4px!important;border-style:solid!important;border-width:1px!important;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:14px!important;height:auto;line-height:21px!important;margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;padding:10px 10px!important;width:100%!important;box-sizing:border-box!important;max-width:100%!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow .label-description{color:#000000;display:block;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:12px;text-align:left;margin-bottom:0;position:relative;vertical-align:top}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow label{font-weight:normal;margin:0;padding:0;position:relative;display:block;min-height:24px;padding-left:24px}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow label a{color:#000000;text-decoration:underline}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow label p{color:#000000!important;font-family:'Open Sans',Arial,Helvetica,sans-serif!important;font-size:12px!important;font-weight:normal!important;line-height:18px!important;padding:0!important;margin:0 5px 0 0!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit{margin:0 0 20px 0;float:left;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button{background-color:#7000ff!important;border:none!important;border-radius:4px!important;box-shadow:none!important;color:#ffffff!important;cursor:pointer;font-family:'Open Sans',Arial,Helvetica,sans-serif!important;font-size:14px!important;font-weight:700!important;line-height:21px!important;height:auto;padding:10px!important;width:100%!important;box-sizing:border-box!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button.loading{display:none}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button:hover{background-color:#0055FF!important}.ml-error input,.ml-error textarea,.ml-error select{border-color:red!important}.ml-error .label-description,.ml-error .label-description p,.ml-error .label-description p a,.ml-error label:first-child{color:#ff0000!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow .label-description::before{position:absolute;top:4px;left:-1.5rem;display:block;width:16px;height:16px;pointer-events:none;content:"";background-color:#ffffff;border:#adb5bd solid 1px;border-radius:4px!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow .label-description::after{position:absolute;top:0px!important;left:-1.5rem;display:block;width:1rem;height:1rem;content:"";background:no-repeat 50%/50% 50%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow input[type=checkbox]:checked~.label-description::after{background-image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23fff' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z'/%3e%3c/svg%3e")}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow input[type=checkbox]:checked~.label-description::before{border-color:#000000!important;background-color:#000000!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow input[type="checkbox"]{box-sizing:border-box;padding:0;position:absolute;z-index:-1;opacity:0;margin-top:5px;margin-left:-1.5rem;overflow:visible}
`;

const bullets1 = [
  <>El <strong>audio de 5 minutos y 3 segundos</strong> en el que te cuento la historia de la gitana que me permite invertir <strong>20.000€ al mes</strong> para mis clientes y retornar <strong>+150.000€ cada mes</strong></>,
  <><strong>Estrategias y experiencias diarias</strong> en tu bandeja de entrada <span className="text-white/50">(todos los días, y te venderé mis servicios también todos los días)</span></>,
];

const bullets2 = [
  <><strong>+1000 ejemplos de anuncios ganadores</strong> de distintos sectores y <strong>+300 plantillas</strong> para hacer estos anuncios ganadores <span className="text-white/60">(+1 consejo que hará que funcionen mucho mejor)</span></>,
  <>La <strong>(contraintuitiva) estrategia</strong> de un viejo francés que puedes aplicar <strong>en 5 minutos</strong> y te hará tener más beneficio instantáneamente</>,
];

export default function Newsletter() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = mailerLiteCSS;
    style.id = "mailerlite-css-newsletter";
    document.head.appendChild(style);

    window.ml_webform_success_38376765 = function () {
      try {
        window.top.location.href = "https://antiagencia.es/ultimopaso";
      } catch (e) {
        window.location.href = "https://antiagencia.es/ultimopaso";
      }
    };

    fetch("https://assets.mailerlite.com/jsonp/686354/forms/181751106241562330/takel");

    const script = document.createElement("script");
    script.src = "https://groot.mailerlite.com/js/w/webforms.min.js?v95037e5bac78f29ed026832ca21a7c7b";
    script.type = "text/javascript";
    script.id = "mailerlite-script-newsletter";
    document.body.appendChild(script);

    return () => {
      const css = document.getElementById("mailerlite-css-newsletter");
      if (css && css.parentNode) css.parentNode.removeChild(css);
      const s = document.getElementById("mailerlite-script-newsletter");
      if (s && s.parentNode) s.parentNode.removeChild(s);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center px-6 pt-6 md:pt-16 pb-16">
        <div className="max-w-2xl w-full">

          {/* Titular */}
          <h1 className="font-headline font-bold text-white text-2xl md:text-4xl text-center leading-tight mb-8">
            Más del 95% de las tiendas online fracasan<br />
            <span className="text-[#0055FF]">Entonces…</span>
          </h1>

          {/* Intro */}
          <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-10">
            ¿cómo quieres tener éxito escuchando al 95% de los anuncios que te dicen exactamente lo mismo?
          </p>

          <p className="font-body text-white font-semibold text-base md:text-lg mb-3">
            ¿Lo bueno?
          </p>

          <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-8">
            Hay una forma de solucionarlo que no es haciendo lo que te dice el 95% de los pseudo-gurús de copia y pega porque si lo hiciesen todos tendrían exito
          </p>

          <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-8">Esta extraña forma de tener éxito con una tienda online la aprendí de una gitana que quita el mal de ojo.</p>
          <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-8">Es algo tan simple y está tan a la vista que es normal que prácticamente nadie haga, aunque ya lo he aplicado a varios de mis clientes y en todos ha funcionado.</p>
          <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-8">Te lo cuento en un audio que dura 5 minutos. Lo grabé con el móvil, así que no esperes una calidad de audio de estudio. Pero si buscas una forma de destacar y arrasar con tu mercado, entonces no te vas a decepcionar.</p>

          <p className="font-body text-white font-semibold text-base md:text-lg mb-4">
            Dejame tu email y recibirás <span className="text-[#0055FF]">(inmediatamente):</span>
          </p>

          {/* Bullets 1 */}
          <ul className="mb-8 space-y-4">
            {bullets1.map((bullet, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#0055FF] flex items-center justify-center text-white text-xs font-bold">✓</span>
                <span className="font-body text-white/80 text-base md:text-lg leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>

          <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
            Además, cuando entiendes la historia de la gitana, esto que también recibes al instante cuando dejas tu email tiene más sentido:
          </p>

          {/* Bullets 2 */}
          <ul className="mb-10 space-y-4">
            {bullets2.map((bullet, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#0055FF] flex items-center justify-center text-white text-xs font-bold">✓</span>
                <span className="font-body text-white/80 text-base md:text-lg leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>

          <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-6">
            Suscribirse es gratis. Darse de baja, también.
          </p>

          {/* MailerLite Form */}
          <div
            id="mlb2-38376765"
            className="ml-form-embedContainer ml-subscribe-form ml-subscribe-form-38376765">
            <div className="ml-form-align-center">
              <div className="ml-form-embedWrapper embedForm">
                <div className="ml-form-embedBody ml-form-embedBodyDefault row-form">
                  <div className="ml-form-embedContent" style={{ marginBottom: 0 }}></div>
                  <form
                    className="ml-block-form"
                    action="https://assets.mailerlite.com/jsonp/686354/forms/181751106241562330/subscribe"
                    data-code=""
                    method="post"
                    target="_blank">
                    <div className="ml-form-formContent">
                      <div className="ml-form-fieldRow ml-last-item">
                        <div className="ml-field-group ml-field-email ml-validate-email ml-validate-required">
                          <input
                            aria-label="email"
                            aria-required="true"
                            type="email"
                            className="form-control"
                            name="fields[email]"
                            placeholder="Tu Email"
                            autoComplete="email"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="ml-form-checkboxRow ml-validate-required">
                      <label className="checkbox">
                        <input type="checkbox" />
                        <div className="label-description">
                          <p>
                            <span style={{ color: "#000000" }}>Acepto la </span>
                            <span style={{ color: "#000000" }}>
                              <a href="https://antiagencia.es/PoliticaPrivacidad" style={{ color: "#000000" }}>política de privacidad</a>
                            </span>
                          </p>
                        </div>
                      </label>
                    </div>
                    <input type="hidden" name="ml-submit" value="1" />
                    <div className="ml-form-embedSubmit">
                      <button type="submit" className="primary">SI QUIERO</button>
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

          {/* Texto legal */}
          <p className="font-body text-white/30 text-xs text-center mt-2 leading-relaxed max-w-lg mx-auto">
            Para cumplir con el RGPD (Reglamento General de Protección de Datos) y entender que tus datos están seguros, debes leer y aceptar la política de privacidad. Tus datos serán guardados en CampaignMonitor, proveedor de email marketing. CampaignMonitor también cumple con el RGPD, así que todo está protegido y amparado por la ley.
          </p>

        </div>
      </div>
      <FooterMinimal />
    </div>
  );
}
