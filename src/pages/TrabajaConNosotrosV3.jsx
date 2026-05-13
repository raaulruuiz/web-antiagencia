import React, { useEffect } from "react";
import FooterMinimal from "@/components/landing/FooterMinimal";

const mailerLiteCSS = `
@import url("https://assets.mlcdn.com/fonts.css?version=1777551");
.ml-form-embedSubmitLoad{display:inline-block;width:20px;height:20px}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}
.ml-form-embedSubmitLoad:after{content:" ";display:block;width:11px;height:11px;margin:1px;border-radius:50%;border:4px solid #fff;border-color:#ffffff #ffffff #ffffff transparent;animation:ml-form-embedSubmitLoad 1.2s linear infinite}
@keyframes ml-form-embedSubmitLoad{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
#mlb2-38800152.ml-form-embedContainer{box-sizing:border-box;display:table;margin:0 auto;position:static;width:100%!important}
#mlb2-38800152.ml-form-embedContainer h4,#mlb2-38800152.ml-form-embedContainer p,#mlb2-38800152.ml-form-embedContainer span,#mlb2-38800152.ml-form-embedContainer button{text-transform:none!important;letter-spacing:normal!important}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper{background-color:#f6f6f6;border-width:0px;border-color:transparent;border-radius:4px;border-style:solid;box-sizing:border-box;display:inline-block!important;margin:0;padding:0;position:relative}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper.embedPopup,#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper.embedDefault{width:600px}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper.embedForm{max-width:600px;width:100%}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody,#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody{padding:20px 20px 0 20px}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent,#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent{text-align:left;margin:0 0 20px 0}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent h4,#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent h4{color:#000000;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:30px;font-weight:400;margin:0 0 10px 0;text-align:left;word-break:break-word}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent p,#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent p{color:#000000;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:14px;font-weight:400;line-height:20px;margin:0 0 10px 0;text-align:left}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-block-form .ml-field-group{text-align:left!important}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-block-form .ml-field-group label{margin-bottom:5px;color:#333333;font-size:14px;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-weight:bold;font-style:normal;text-decoration:none;display:inline-block;line-height:20px}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody form{margin:0;width:100%}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-formContent,#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow{margin:0 0 20px 0;width:100%}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow{float:left}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow{margin:0 0 10px 0;width:100%}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow.ml-last-item{margin:0}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow input{background-color:#ffffff!important;color:#333333!important;border-color:#cccccc;border-radius:4px!important;border-style:solid!important;border-width:1px!important;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:14px!important;height:auto;line-height:21px!important;margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;padding:10px 10px!important;width:100%!important;box-sizing:border-box!important;max-width:100%!important}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow .custom-select{background-color:#ffffff!important;color:#333333!important;border-color:#cccccc;border-radius:4px!important;border-style:solid!important;border-width:1px!important;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:14px!important;line-height:20px!important;margin-bottom:0;margin-top:0;padding:10px 28px 10px 12px!important;width:100%!important;box-sizing:border-box!important;max-width:100%!important;height:auto;display:inline-block;vertical-align:middle;background:url('https://assets.mlcdn.com/ml/images/default/dropdown.svg') no-repeat right .75rem center/8px 10px;-webkit-appearance:none;-moz-appearance:none;appearance:none}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit{margin:0 0 20px 0;float:left;width:100%}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button{background-color:#7000FF!important;border:none!important;border-radius:4px!important;box-shadow:none!important;color:#ffffff!important;cursor:pointer;font-family:'Open Sans',Arial,Helvetica,sans-serif!important;font-size:14px!important;font-weight:700!important;line-height:21px!important;height:auto;padding:10px!important;width:100%!important;box-sizing:border-box!important}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button.loading{display:none}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button:hover{background-color:#0067FD!important}
.ml-error input,.ml-error textarea,.ml-error select{border-color:red!important}
.ml-error .label-description,.ml-error .label-description p,.ml-error .label-description p a,.ml-error label:first-child{color:#ff0000!important}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow.ml-error .label-description p,.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow.ml-error .label-description p:first-letter{color:#ff0000!important}
`;

function MailerLiteForm() {
  return (
    <div id="mlb2-38800152" className="ml-form-embedContainer ml-subscribe-form ml-subscribe-form-38800152">
      <div className="ml-form-align-center">
        <div className="ml-form-embedWrapper embedForm">
          <div className="ml-form-embedBody ml-form-embedBodyDefault row-form">
            <div className="ml-form-embedContent" style={{ marginBottom: 0 }}>
              <h4>Rellena todos los campos</h4>
              <p>Si no lo haces o alguno es inventado, no te contactaré.</p>
            </div>
            <form className="ml-block-form" action="https://assets.mailerlite.com/jsonp/686354/forms/182583896449222335/subscribe" data-code="" method="post" target="_blank">
              <div className="ml-form-formContent">
                <div className="ml-form-fieldRow">
                  <div className="ml-field-group ml-field-name ml-validate-required">
                    <label>Nombre</label>
                    <input aria-label="name" aria-required="true" type="text" className="form-control" name="fields[name]" placeholder="" autoComplete="given-name" />
                  </div>
                </div>
                <div className="ml-form-fieldRow">
                  <div className="ml-field-group ml-field-email ml-validate-email ml-validate-required">
                    <label>Email (al que te escribiré)</label>
                    <input aria-label="email" aria-required="true" type="email" className="form-control" name="fields[email]" placeholder="" autoComplete="email" />
                  </div>
                </div>
                <div className="ml-form-fieldRow">
                  <div className="ml-field-group ml-field-phone ml-validate-required">
                    <label>Teléfono (al que te llamaré)</label>
                    <input aria-label="phone" aria-required="true" type="text" className="form-control" name="fields[phone]" placeholder="" />
                  </div>
                </div>
                <div className="ml-form-fieldRow">
                  <div className="ml-field-group ml-field-web ml-validate-required">
                    <label>Web (la URL)</label>
                    <input aria-label="web" aria-required="true" type="text" className="form-control" name="fields[web]" placeholder="" />
                  </div>
                </div>
                <div className="ml-form-fieldRow">
                  <div className="ml-field-group ml-field-redes_sociales ml-validate-required">
                    <label>La red social con más seguidores que tengas (el nombre de usuario)</label>
                    <input aria-label="redes_sociales" aria-required="true" type="text" className="form-control" name="fields[redes_sociales]" placeholder="" />
                  </div>
                </div>
                <div className="ml-form-fieldRow">
                  <div className="ml-field-group ml-field-base_de_datos ml-validate-required">
                    <label>¿Cuánta gente tienes en la base de datos?</label>
                    <input aria-label="base_de_datos" aria-required="true" type="text" className="form-control" name="fields[base_de_datos]" placeholder="" />
                  </div>
                </div>
                <div className="ml-form-fieldRow">
                  <div className="ml-field-group ml-field-facturacion_anual ml-validate-required">
                    <label>Facturación anual (año anterior a este)</label>
                    <input aria-label="facturacion_anual" aria-required="true" type="text" className="form-control" name="fields[facturacion_anual]" placeholder="" />
                  </div>
                </div>
                <div className="ml-form-fieldRow">
                  <div className="ml-field-group ml-field-facturacion_mensual ml-validate-required">
                    <label>Facturación mensual (mes anterior a este)</label>
                    <input aria-label="facturacion_mensual" aria-required="true" type="text" className="form-control" name="fields[facturacion_mensual]" placeholder="" />
                  </div>
                </div>
                <div className="ml-form-fieldRow">
                  <div className="ml-field-group ml-field-donacion ml-validate-required">
                    <label>¿A qué causa quieres donar tu 10%?</label>
                    <select className="custom-select" name="fields[donacion]" aria-label="donacion" aria-required="true">
                      <option value="">-</option>
                      <option>AECC (Asociación Española Contra el Cáncer)</option>
                      <option>Zooasis (protectora de animales)</option>
                      <option>Lo dejo a vuestra elección</option>
                    </select>
                  </div>
                </div>
                <div className="ml-form-fieldRow ml-last-item">
                  <div className="ml-field-group ml-field-notas">
                    <label>¿Algún comentario?</label>
                    <input aria-label="notas" type="text" className="form-control" name="fields[notas]" placeholder="" />
                  </div>
                </div>
              </div>
              <input type="hidden" name="ml-submit" value="1" />
              <div className="ml-form-embedSubmit">
                <button type="submit" className="primary">Solicitar el mejor presupuesto que me harán</button>
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
              <h4>Ya has solicitado el presupuesto!</h4>
              <p>Ahora revisaré tu tienda y lo que me has mandado y decidiré si me interesa que trabajemos juntos.</p>
              <p>Independientemente de lo que decida te mandaré un correo para avisarte de mi decisión. Y si es que si me interesa, te llamaré para pedirte más información para el presupuesto.</p>
              <p>Hablamos pronto!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrabajaConNosotrosV3() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = mailerLiteCSS;
    style.id = "mailerlite-css-tcnv3";
    document.head.appendChild(style);

    window.ml_webform_success_38800152 = function () {
      window.umami?.track('registro-presupuesto');
      const $ = window.ml_jQuery || window.jQuery;
      if ($) {
        $('.ml-subscribe-form-38800152 .row-success').show();
        $('.ml-subscribe-form-38800152 .row-form').hide();
      }
    };

    fetch("https://assets.mailerlite.com/jsonp/686354/forms/182583896449222335/takel");

    const script = document.createElement("script");
    script.src = "https://groot.mailerlite.com/js/w/webforms.min.js?vb397d78ebaa8a0f631d35384c46d781b";
    script.type = "text/javascript";
    script.id = "mailerlite-script-tcnv3";
    document.body.appendChild(script);

    return () => {
      const css = document.getElementById("mailerlite-css-tcnv3");
      if (css && css.parentNode) css.parentNode.removeChild(css);
      const scr = document.getElementById("mailerlite-script-tcnv3");
      if (scr && scr.parentNode) scr.parentNode.removeChild(scr);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-3xl">
          <div className="bg-white shadow-xl rounded-sm px-8 md:px-16 py-12" style={{ fontFamily: "'Georgia', serif" }}>
            <div className="text-gray-800 text-base leading-relaxed">

              {/* Titular */}
              <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 leading-tight mb-2">
                Esta es (probablemente) la forma más rentable...<br />
                rápida...<br />
                económica...<br />
                y desaprovechada de tener altos beneficios con una tienda online
              </h1>
              <br />
              <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 leading-tight mb-4">
                Y está a disposición de todos
              </h1>
              <br /><br /><br /><br /><br />

              {/* Subtítulo con negrita */}
              <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Por favor, lo primero que quiero que sepas es que no tengo una empresa, ni 40 empleados. Soy autónomo y en mi equipo estamos mi novia y yo.</h2>
              <br />
              <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Tampoco tengo ninguna carrera universitaria ni máster de ningún tipo.</h2>
              <br />
              <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Si esto puede suponer un problema para ti, lo mejor es que dejes de leer aquí.</h2>
              <br /><br />

              {/* Subtítulo sin negrita */}
              <h2 className="text-xl text-center text-gray-900 mb-2">Bien.</h2>
              <br />
              <h2 className="text-xl text-center text-gray-900 mb-4">Este servicio va de email marketing, por lo que toda la venta la voy a hacer ahí. Aquí lo único que haré será ponerte las preguntas frecuentes debajo del formulario de pedir presupuesto:</h2>
              <br /><br />

              {/* Formulario */}
              <MailerLiteForm />
              <br /><br /><br />

              {/* FAQs */}
              <h2 className="text-xl font-bold text-gray-900 mb-4">¿Podré dejar de dar descuentos y de depender de las plataformas de publicidad y del contenido orgánico?</h2>
              <br />
              <p className="mb-4">Si, por supuesto. El objetivo principal de este servicio es tener una lista sana y fiel, que te compre independientemente de la situación y sin necesidad de descuentos. Que te quieran comprar incluso si cambias de negocio y empiezas a vender otra cosa que no tenga nada que ver. No es algo inmediato, pero si es la acción más rentable que puedes hacer para tu tienda. Y por supuesto, que puedas parar la publicidad o dejar de publicar y que sigas vendiendo.</p>
              <br /><br />

              <h2 className="text-xl font-bold text-gray-900 mb-4">¿Qué incluye el servicio?</h2>
              <br />
              <p className="mb-4">Lo principal sobre lo que vamos a trabajar es el email marketing. Redactaremos y programaremos todos los mails (newsletters periódicas y flujos) y los formularios de captación. Además, redactaremos un plan de acción trimestral para que tengas claridad en lo que vamos a hacer.</p>
              <br /><br />

              <h2 className="text-xl font-bold text-gray-900 mb-4">¿Cuánto dura el servicio?</h2>
              <br />
              <p className="mb-4">El servicio dura 3 meses. Es la mejor forma de arrancar para poder hacer una buena investigación y que obtengas los mejores resultados posibles. Después de estos 3 meses, seguiremos mes a mes y sin ningún tipo de permanencia.</p>
              <br /><br />

              <h2 className="text-xl font-bold text-gray-900 mb-4">¿Es muy caro? ¿Es barato?</h2>
              <br />
              <p className="mb-4">Es cierto, no es barato. No te voy a negar esa realidad. Nosotros primamos otras cosas muy por encima del precio. E invertimos en ello para dar una experiencia de cliente más especial. Mucha gente no valora eso y solo busca precio, lo respetamos, pero no es al público al que va dirigido este servicio.</p>
              <br /><br />

              <h2 className="text-xl font-bold text-gray-900 mb-4">¿Qué perfil de personas le sacarán mejor partido?</h2>
              <br />
              <p className="mb-4">Las personas que más partido le sacan al servicio son personas con una lista de cierto tamaño (más 5.000 personas) y que se encuentran en alguna de estas situaciones:</p>
              <p className="mb-2">a final de mes tus gastos fijos "se comen" tu beneficio</p>
              <p className="mb-2">o dependes de dar descuentos para vender</p>
              <p className="mb-2">o nunca has mandado mails a esa lista</p>
              <p className="mb-2">o los escribes con ChatGPT</p>
              <p className="mb-2">o si haces emails de 2 párrafos y muchas imágenes</p>
              <p className="mb-2">o peor, los haces de 2 párrafos y encima escritos por ChatGPT</p>
              <p className="mb-2">o piensas que "es que mis clientes no leen"</p>
              <p className="mb-2">o piensas que tu cliente o tu producto "es especial" y que tiene que ser tratada como si no hubiese humanos detrás de la pantalla donde leen</p>
              <p className="mb-4">y sobre todo, si tu facturación depende principalmente de la publicidad o de tu comunidad en redes sociales.</p>
              <p className="mb-4">En cualquiera de estos casos, si estás dispuesto a ponerle solución, por supuesto, le sacarás mucho partido al servicio.</p>
              <br /><br />

              <h2 className="text-xl font-bold text-gray-900 mb-4">¿Eres más de ciervos o de gatos?</h2>
              <br />
              <p className="mb-4">De ciervos. Los gatos te juzgan con la mirada y te miran por encima del hombro. Piensan que eres su esclavo y yo solo soy esclavo de mi trabajo y de Pili.</p>
              <br /><br />

              <img src="/images/prueba-social-raul.jpg" alt="Prueba social" className="w-full md:w-2/3 md:mx-auto block my-4 rounded" />
              <br /><br />

              <h2 className="text-xl font-bold text-gray-900 mb-4">¿Cómo es la comunicación?</h2>
              <br />
              <p className="mb-4">Nos comunicaremos por WhatsApp, en un grupo donde estaremos nosotros y quien tu quieras de tu equipo. Si lo prefieres podemos usar otro canal de comunicación, pero preferimos WhatsApp por la inmediatez y la facilidad de uso.</p>
              <br /><br />

              <h2 className="text-xl font-bold text-gray-900 mb-4">¿Hay algún tipo de garantía?</h2>
              <br />
              <p className="mb-4">No.</p>
              <br /><br />

              <h2 className="text-xl font-bold text-gray-900 mb-4">¿Hay algún bonus?</h2>
              <br />
              <p className="mb-4">Si, el servicio es principalmente la redacción, montaje y gestión de la plataforma de email marketing, pero como bonus, ya que es muy importante, incluimos el copywritting de las fichas de producto que estemos trabajando y el plan estratégico trimestral. Ambas cosas son fundamentales para cualquier tienda online, por eso las incluimos.</p>
              <br /><br />

              <h2 className="text-xl font-bold text-gray-900 mb-4">¿Cómo funciona eso de la donación?</h2>
              <br />
              <p className="mb-4">Por si no lo sabías, te cuento. Donamos un 10% de todo lo que nos pagas a una causa benéfica en la que creemos. La causa la eliges en el formulario al pedir el presupuesto y cada vez que recibamos un pago de tu parte, haremos la donación y te enviaremos el justificante.</p>
              <br /><br />

              <h2 className="text-xl font-bold text-gray-900 mb-4">¿Es una buena inversión?</h2>
              <br />
              <p className="mb-4">Si quieres tener una lista fiel, que te compre independientemente de si das descuento o no, sea la época del año que sea o incluso si cambias de negocio, y con eso aumentar los beneficios netos de tu tienda, este servicio hará justo eso. Explotaremos al máximo el activo más importante y rentable que tienes, tu lista. A partir de ahí la decisión es tuya.</p>
              <br /><br />

              {/* Segundo formulario */}
              <MailerLiteForm />
              <br /><br /><br />

              {/* Cierre */}
              <p className="mb-4">Espero que hayas disfrutado leyendo esta carta.</p>
              <br />
              <p className="mb-4">Pasa un buen día.</p>
              <br />
              <p className="mb-4">Raúl.</p>
              <br /><br />

              <p className="mb-4"><strong>P.D.</strong> ¿Y si es verdad que el email marketing es lo que marca la diferencia entre tener grandes beneficios y no tenerlo? ¿Y si es verdad que no hay nada más rentable para una tienda online? ¿Dejarás pasar seis meses? ¿Un año? ¿Vas a dejar que tus competidores sigan creciendo y viviendo de puta madre mientras tú esperas otra gran oportunidad, otra promesa de éxito rápido? Esta es la manera más sencilla y eficaz de ganar dinero con una tienda online.</p>
              <br />
              <p className="mb-4">Este servicio tiene TODO lo que necesitas para dejar de depender de descuentos, poder generar altos picos de beneficio… En definitiva, ¿y si saber hacer (BIEN) el email marketing, cambia tu tienda?</p>

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
