import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import FooterMinimal from "@/components/landing/FooterMinimal";

const mailerLiteCSS = `
@import url("https://assets.mlcdn.com/fonts.css?version=1780569");
.ml-form-embedSubmitLoad{display:inline-block;width:20px;height:20px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}.ml-form-embedSubmitLoad:after{content:" ";display:block;width:11px;height:11px;margin:1px;border-radius:50%;border:4px solid #fff;border-color:#ffffff #ffffff #ffffff transparent;animation:ml-form-embedSubmitLoad 1.2s linear infinite}@keyframes ml-form-embedSubmitLoad{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}#mlb2-42311315.ml-form-embedContainer{box-sizing:border-box;display:table;margin:0 auto;position:static;width:100%!important}#mlb2-42311315.ml-form-embedContainer h4,#mlb2-42311315.ml-form-embedContainer p,#mlb2-42311315.ml-form-embedContainer span,#mlb2-42311315.ml-form-embedContainer button{text-transform:none!important;letter-spacing:normal!important}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper{background-color:#f6f6f6;border-width:0px;border-color:transparent;border-radius:4px;border-style:solid;box-sizing:border-box;display:inline-block!important;margin:0;padding:0;position:relative}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper.embedPopup,#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper.embedDefault{width:100%}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper.embedForm{max-width:100%;width:100%}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody,#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody{padding:20px 20px 0 20px}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent,#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent{text-align:left;margin:0 0 20px 0}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent h4,#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent h4{color:#000000;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:30px;font-weight:400;margin:0 0 10px 0;text-align:left;word-break:break-word}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent p,#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent p{color:#000000;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:14px;font-weight:400;line-height:20px;margin:0 0 10px 0;text-align:left}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-block-form .ml-field-group{text-align:left!important}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-block-form .ml-field-group label{margin-bottom:5px;color:#333333;font-size:14px;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-weight:bold;font-style:normal;text-decoration:none;display:inline-block;line-height:20px}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody form{margin:0;width:100%}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-formContent,#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow{margin:0 0 20px 0;width:100%}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow{float:left}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow{margin:0 0 10px 0;width:100%}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow.ml-last-item{margin:0}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow input{background-color:#ffffff!important;color:#333333!important;border-color:#cccccc;border-radius:4px!important;border-style:solid!important;border-width:1px!important;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:14px!important;height:auto;line-height:21px!important;margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;padding:10px 10px!important;width:100%!important;box-sizing:border-box!important;max-width:100%!important}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow .label-description{color:#000000;display:block;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:12px;text-align:left;margin-bottom:0;position:relative;vertical-align:top}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow label{font-weight:normal;margin:0;padding:0;position:relative;display:block;min-height:24px;padding-left:24px}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow label a{color:#000000;text-decoration:underline}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow label p{color:#000000!important;font-family:'Open Sans',Arial,Helvetica,sans-serif!important;font-size:12px!important;font-weight:normal!important;line-height:18px!important;padding:0!important;margin:0 5px 0 0!important}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit{margin:0 0 20px 0;float:left;width:100%}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button{background-color:#7000ff!important;border:none!important;border-radius:4px!important;box-shadow:none!important;color:#ffffff!important;cursor:pointer;font-family:'Open Sans',Arial,Helvetica,sans-serif!important;font-size:14px!important;font-weight:700!important;line-height:21px!important;height:auto;padding:10px!important;width:100%!important;box-sizing:border-box!important}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button.loading{display:none}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button:hover{background-color:#0067FD!important}.ml-error input,.ml-error textarea,.ml-error select{border-color:red!important}.ml-error .label-description,.ml-error .label-description p,.ml-error .label-description p a,.ml-error label:first-child{color:#ff0000!important}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow .label-description::before{position:absolute;top:4px;left:-1.5rem;display:block;width:16px;height:16px;pointer-events:none;content:"";background-color:#ffffff;border:#adb5bd solid 1px;border-radius:4px!important}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow .label-description::after{position:absolute;top:0px!important;left:-1.5rem;display:block;width:1rem;height:1rem;content:"";background:no-repeat 50%/50% 50%}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow input[type=checkbox]:checked~.label-description::after{background-image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23fff' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z'/%3e%3c/svg%3e")}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow input[type=checkbox]:checked~.label-description::before{border-color:#000000!important;background-color:#000000!important}#mlb2-42311315.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow input[type="checkbox"]{box-sizing:border-box;padding:0;position:absolute;z-index:-1;opacity:0;margin-top:5px;margin-left:-1.5rem;overflow:visible}
`;

export default function JorgeCoronado() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = mailerLiteCSS;
    style.id = "mailerlite-css-jorge";
    document.head.appendChild(style);

    window.ml_webform_success_42311315 = function () {
      window.umami?.track('registro-jorge-coronado');
      try {
        window.top.location.href = "https://antiagencia.es/gracias-podcast";
      } catch (e) {
        window.location.href = "https://antiagencia.es/gracias-podcast";
      }
    };

    fetch("https://assets.mailerlite.com/jsonp/686354/forms/189647442613896255/takel");

    const script = document.createElement("script");
    script.src = "https://groot.mailerlite.com/js/w/webforms.min.js?v95037e5bac78f29ed026832ca21a7c7b";
    script.type = "text/javascript";
    script.id = "mailerlite-script-jorge";
    document.body.appendChild(script);

    return () => {
      const css = document.getElementById("mailerlite-css-jorge");
      if (css && css.parentNode) css.parentNode.removeChild(css);
      const s = document.getElementById("mailerlite-script-jorge");
      if (s && s.parentNode) s.parentNode.removeChild(s);
    };
  }, []);

  return (
    <>
    <Helmet>
      <title>Jorge Coronado × Antiagencia — Email marketing para ecommerce</title>
      <meta name="description" content="Colaboración especial con Jorge Coronado. Todo lo que necesitas saber sobre email marketing para escalar tu tienda online." />
    </Helmet>
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-2xl">
          <div className="bg-white shadow-xl rounded-sm px-8 md:px-16 py-12" style={{ fontFamily: "'Georgia', serif" }}>
            <div className="text-gray-800 text-base leading-relaxed">

          {/* Titular */}
          <h1 className="text-2xl md:text-4xl font-bold text-center text-gray-900 leading-tight mb-6">
            Si vienes del directo o del podcast de Jorge Coronado, esto es para ti...
          </h1>

          {/* Subtítulo */}
          <p className="text-[#0067FD] font-semibold text-base md:text-xl text-center leading-relaxed mb-6">
            Descarga el ebook COLECTIVO MINORITARIO: Cómo dejar de ser un "más de lo mismo" para diferenciarte y vender más por email
          </p>

          {/* Cuerpo */}
          <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-10 text-center">
            En este ebook de 42 páginas descubrirás estrategias para diferenciar, crecer y potenciar tu marca para vender (probablemente) bastante más que ahora
          </p>

          {/* MailerLite Form */}
          <div
            id="mlb2-42311315"
            className="ml-form-embedContainer ml-subscribe-form ml-subscribe-form-42311315">
            <div className="ml-form-align-center">
              <div className="ml-form-embedWrapper embedForm">
                <div className="ml-form-embedBody ml-form-embedBodyDefault row-form">
                  <div className="ml-form-embedContent" style={{ marginBottom: 0 }}></div>
                  <form
                    className="ml-block-form"
                    action="https://assets.mailerlite.com/jsonp/686354/forms/189647442613896255/subscribe"
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
                      <button type="submit" className="primary">Quiero el ebook gratis</button>
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
          <p className="text-gray-400 text-xs text-center mt-2 leading-relaxed max-w-lg mx-auto">
            Para cumplir con el RGPD (Reglamento General de Protección de Datos) y entender que tus datos están seguros, debes leer y aceptar la política de privacidad. Tus datos serán guardados en MailerLite, proveedor de email marketing. MailerLite también cumple con el RGPD, así que todo está protegido y amparado por la ley.
          </p>

            </div>
          </div>
        </div>
      </div>
      <FooterMinimal />
    </div>
    </>
  );
}
