import React, { useEffect } from "react";
import FooterMinimal from "@/components/landing/FooterMinimal";

const mailerLiteCSS = `
@import url("https://assets.mlcdn.com/fonts.css?version=1773928");
.ml-form-embedSubmitLoad{display:inline-block;width:20px;height:20px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}.ml-form-embedSubmitLoad:after{content:" ";display:block;width:11px;height:11px;margin:1px;border-radius:50%;border:4px solid #fff;border-color:#ffffff #ffffff #ffffff transparent;animation:ml-form-embedSubmitLoad 1.2s linear infinite}@keyframes ml-form-embedSubmitLoad{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}#mlb2-38376765.ml-form-embedContainer{box-sizing:border-box;display:table;margin:0 auto;position:static;width:100%!important}#mlb2-38376765.ml-form-embedContainer h4,#mlb2-38376765.ml-form-embedContainer p,#mlb2-38376765.ml-form-embedContainer span,#mlb2-38376765.ml-form-embedContainer button{text-transform:none!important;letter-spacing:normal!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper{background-color:#f6f6f6;border-width:0px;border-color:transparent;border-radius:4px;border-style:solid;box-sizing:border-box;display:inline-block!important;margin:0;padding:0;position:relative}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper.embedPopup,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper.embedDefault{width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper.embedForm{max-width:100%;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody{padding:20px 20px 0 20px}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent{text-align:left;margin:0 0 20px 0}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent h4,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent h4{color:#000000;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:30px;font-weight:400;margin:0 0 10px 0;text-align:left;word-break:break-word}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent p,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent p{color:#000000;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:14px;font-weight:400;line-height:20px;margin:0 0 10px 0;text-align:left}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-block-form .ml-field-group{text-align:left!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-block-form .ml-field-group label{margin-bottom:5px;color:#333333;font-size:14px;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-weight:bold;font-style:normal;text-decoration:none;display:inline-block;line-height:20px}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody form{margin:0;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-formContent,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow{margin:0 0 20px 0;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow{float:left}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow{margin:0 0 10px 0;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow.ml-last-item{margin:0}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow input{background-color:#ffffff!important;color:#333333!important;border-color:#cccccc;border-radius:4px!important;border-style:solid!important;border-width:1px!important;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:14px!important;height:auto;line-height:21px!important;margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;padding:10px 10px!important;width:100%!important;box-sizing:border-box!important;max-width:100%!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit{margin:0 0 20px 0;float:left;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button{background-color:#7000ff!important;border:none!important;border-radius:4px!important;box-shadow:none!important;color:#ffffff!important;cursor:pointer;font-family:'Open Sans',Arial,Helvetica,sans-serif!important;font-size:14px!important;font-weight:700!important;line-height:21px!important;height:auto;padding:10px!important;width:100%!important;box-sizing:border-box!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button.loading{display:none}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button:hover{background-color:#0067FD!important}.ml-error input,.ml-error textarea,.ml-error select{border-color:red!important}.ml-error .label-description,.ml-error .label-description p,.ml-error .label-description p a,.ml-error label:first-child{color:#ff0000!important}
`;

function MailerLiteForm() {
  return (
    <div id="mlb2-38376765" className="ml-form-embedContainer ml-subscribe-form ml-subscribe-form-38376765">
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
                      placeholder="Tu email"
                      autoComplete="email"
                    />
                  </div>
                </div>
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
              <h4>¡Ya está!</h4>
              <p>Revisa tu bandeja de entrada. Te he mandado el ebook.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = mailerLiteCSS;
    style.id = "mailerlite-css-home";
    document.head.appendChild(style);

    window.ml_webform_success_38376765 = function () {
      const $ = window.ml_jQuery || window.jQuery;
      if ($) {
        $('.ml-subscribe-form-38376765 .row-success').show();
        $('.ml-subscribe-form-38376765 .row-form').hide();
      }
    };

    fetch("https://assets.mailerlite.com/jsonp/686354/forms/181751106241562330/takel");

    const script = document.createElement("script");
    script.src = "https://groot.mailerlite.com/js/w/webforms.min.js?vb397d78ebaa8a0f631d35384c46d781b";
    script.type = "text/javascript";
    script.id = "mailerlite-script-home";
    document.body.appendChild(script);

    return () => {
      const css = document.getElementById("mailerlite-css-home");
      if (css && css.parentNode) css.parentNode.removeChild(css);
      const scr = document.getElementById("mailerlite-script-home");
      if (scr && scr.parentNode) scr.parentNode.removeChild(scr);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-3xl">
          <div className="bg-white shadow-xl rounded-sm px-8 md:px-16 py-12" style={{ fontFamily: "'Georgia', serif" }}>
            <div className="text-gray-800 text-base leading-relaxed">

              <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 leading-tight mb-8">Cómo aumentar las ventas de tu tienda… con un ejercicio que aprendí de un niño de 3 años y que puedes implementar en menos de 5 minutos.</h1>

              <br />

              <p className="mb-4">En este ebook de <span className="underline">16 páginas</span>, te voy a contar algo que mi sobrino de 3 años no para de decir y que, casi seguro, te va a ayudar a <span className="underline">aumentar las ventas de tu tienda online</span>.</p>

              <br />

              <MailerLiteForm />

              <br />

              <p className="mb-4">Cuando te suscribes a la lista recibes un ebook que incluye:</p>

              <ul className="mt-2 mb-6 space-y-4 list-none pl-0">
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#0067FD", minWidth: "20px" }}>✓</span>
                  <span>Lo que mi <strong>sobrino de 3 años</strong> no para de repetir y que aplico en las fichas de producto de todos mis clientes <strong>para aumentar sus ventas.</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#0067FD", minWidth: "20px" }}>✓</span>
                  <span>Es algo tan simple que lo mismo cuando lo leas <strong>entras a tu tienda y lo aplicas en menos de 5 minutos</strong>. Eso es lo que se tarda. Si lo aplicas, claro.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#0067FD", minWidth: "20px" }}>✓</span>
                  <span>También vas a ver ejemplos de distintos sectores. <strong>Ejemplos de tiendas reales</strong> que he visitado y a las que he aplicado este ejercicio. (quien sabe, quizá es la tuya)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#0067FD", minWidth: "20px" }}>✓</span>
                  <span><strong>Un bonus secreto para aumentar todavía más las ventas.</strong></span>
                </li>
              </ul>

              <br />

              <MailerLiteForm />

              <br />
              <p className="mb-4 text-xs text-gray-400">Para cumplir con el RGPD (Reglamento General de Protección de Datos) y entender que tus datos están seguros, debes leer y aceptar la política de privacidad. Tus datos serán guardados en MailerLite, proveedor de email marketing. MailerLite también cumple con el RGPD, así que todo está protegido y amparado por la ley.</p>
              <br /><br />

              <p className="mb-4">Espero que disfrutes el ebook.</p>
              <p className="mb-4">Raúl.</p>
              <br />

              <p className="mb-4"><strong>P.D.</strong> ¿Has llegado hasta aquí? Bien, eso es que he hecho bien mi trabajo.</p>
              <p className="mb-4"><strong>P.D. 2</strong> En el formulario de arriba para suscribirte.</p>

              <br /><br />
              <div className="flex items-center justify-center gap-4 mt-4">
                <img
                  src="https://media.base44.com/images/public/697678eac9cf34e2aefb7d57/82d53b854_logonegro.png"
                  alt="AntiAgencia"
                  className="h-10 w-auto"
                />
                <span className="font-bold text-gray-900 text-xl tracking-wide" style={{ fontFamily: "'Rubik', monospace" }}>Antiagencia</span>
              </div>

            </div>
          </div>
        </div>
      </div>
      <FooterMinimal />
    </div>
  );
}
