import React, { useEffect, useState } from "react";
import FooterMinimal from "@/components/landing/FooterMinimal";

const mailerLiteCSS = `
@import url("https://assets.mlcdn.com/fonts.css?version=1780922");
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
                  <div className="ml-field-group ml-field-base_de_datos ml-validate-required">
                    <label>¿Cuánta gente tienes en la base de datos?</label>
                    <input aria-label="base_de_datos" aria-required="true" type="text" className="form-control" name="fields[base_de_datos]" placeholder="" />
                  </div>
                </div>
                <div className="ml-form-fieldRow">
                  <div className="ml-field-group ml-field-facturacion_mensual ml-validate-required">
                    <label>Facturación mensual de la tienda</label>
                    <input aria-label="facturacion_mensual" aria-required="true" type="text" className="form-control" name="fields[facturacion_mensual]" placeholder="" />
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
  const [activeSection, setActiveSection] = useState(null);

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
    script.src = "https://groot.mailerlite.com/js/w/webforms.min.js?v83147fa8ce2d95cb73ece7f28b469519";
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

  // Re-init MailerLite script each time a new form section appears
  useEffect(() => {
    if (activeSection === null) return;
    const existing = document.getElementById("mailerlite-script-tcnv3");
    if (existing) existing.parentNode.removeChild(existing);
    const script = document.createElement("script");
    script.src = "https://groot.mailerlite.com/js/w/webforms.min.js?v83147fa8ce2d95cb73ece7f28b469519";
    script.type = "text/javascript";
    script.id = "mailerlite-script-tcnv3";
    document.body.appendChild(script);
  }, [activeSection]);

  const SectionEnd = ({ sectionId }) => {
    if (activeSection === sectionId) {
      return (
        <div className="mt-4 mb-16">
          <MailerLiteForm />
        </div>
      );
    }
    return (
      <div className="mt-4 mb-16">
        <button
          onClick={() => setActiveSection(sectionId)}
          style={{
            backgroundColor: '#7000FF',
            color: '#ffffff',
            fontFamily: "'Open Sans', Arial, sans-serif",
            fontSize: '15px',
            fontWeight: '700',
            padding: '12px 32px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0067FD'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7000FF'}
        >
          Pide tu presupuesto aquí
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-5xl">
          <div className="bg-white shadow-xl rounded-sm px-8 md:px-16 py-12" style={{ fontFamily: "'Georgia', serif" }}>
            <div className="text-gray-800 text-base leading-relaxed">

              {/* Títulos */}
              <h1 className="text-2xl md:text-4xl font-bold text-center text-gray-900 leading-tight mb-4">
                Solo necesitas una herramienta en tu marca para barrer con toda tu competencia y vender más.
              </h1>
              <p>&nbsp;</p>
              <h1 className="text-2xl md:text-4xl font-bold text-center text-gray-900 leading-tight">
                Y la tienes a tu alcance.
              </h1>
              <p><br /><br /></p>

              {/* Historia */}
              <p>Lo que te voy a contar ahora sobre cierto pintor alemán que todos conocemos y cuyo nombre empieza por H y termina por hitler, te va a dejar dándole vueltas a la cabeza y, probablemente, transforme tu marca y la vuelva mucho más atractiva y rentable.</p>
              <p>&nbsp;</p>
              <p>Es una historia muy breve y fabulosa que te dará varios aprendizajes. Vamos a ello.</p>
              <p><br /><br /><br /></p>

              <p><span style={{ textDecoration: 'underline' }}>Curso 1999-2000</span></p>
              <p>&nbsp;</p>
              <p>Era la primera clase que iban a tener los alumnos con Martin Stoller.</p>
              <p>&nbsp;</p>
              <p>Eran los alumnos de comunicación de un MBA en una prestigiosa universidad americana.</p>
              <p>&nbsp;</p>
              <p>Martin era un experto en comunicación, especializado en gestión de crisis.</p>
              <p><br /><br /></p>
              <p>Era el tío al que llamaban para hablar cuando había un atentado terrorista con víctimas, o cuando había un desastre natural que se llevaba la vida de personas.</p>
              <p>&nbsp;</p>
              <p>Vaya, el que hablaba cuando la cosa estaba jodida.</p>
              <p>&nbsp;</p>
              <p>Para calmar las aguas.</p>
              <p><br /><br /><br /></p>

              <p>Bien.</p>
              <p>&nbsp;</p>
              <p>Pues llega el primer día a clase.</p>
              <p>&nbsp;</p>
              <p>Entra, cierra la puerta detrás de él.</p>
              <p>&nbsp;</p>
              <p>Pide a los alumnos que guarden silencio y se sienten en sus sitios.</p>
              <p>&nbsp;</p>
              <p>- Oye, tú, apaga la luz.</p>
              <p>&nbsp;</p>
              <p>- Voy.</p>
              <p>&nbsp;</p>
              <p>- Y tú, trae el proyector.</p>
              <p>&nbsp;</p>
              <p>- Voy.</p>
              <p><br /><br /></p>

              <p>Con la luz apagada y el proyector preparado, comienza a proyectar una película en blanco y negro.</p>
              <p>&nbsp;</p>
              <p>En la escena aparece Hitler dando uno de los discursos que daba frente a la población.</p>
              <p>&nbsp;</p>
              <p>Todo en alemán. Nadie se enteraba de nada.</p>
              <p>&nbsp;</p>
              <p>Pero nadie decía nada tampoco.</p>
              <p><br /><br /></p>

              <p>Solo puso un fragmento de 2 minutos. Con eso bastó.</p>
              <p><br /><br /></p>
              <p>Al terminar el vídeo, y con la luz aún apagada, Martin se movió a la luz del proyector y dijo:</p>
              <p><br /><br /><br /></p>

              <p className="text-center">
                <em>"Mi nombre es Martin Stoller, soy judío. Mi abuela murió en un campo de concentración. Pero eso no me impide ver que este señor consiguió que el pueblo más civilizado y avanzado de la historia hiciera lo que él quisiera simplemente con el uso de las palabras.</em>
              </p>
              <p className="text-center"><br /><br /></p>
              <p className="text-center">
                <em>Eso es capacidad de persuasión. Eso es lo que vais a aprender en esta clase. El que se ofenda fácilmente puede salir ya por la puerta."</em>
              </p>
              <p><br /><br /><br /></p>

              <p>Guau…</p>
              <p>&nbsp;</p>
              <p>Esto es un ejemplo de autoridad, marca y comunicación de un nivel altísimo.</p>
              <p>&nbsp;</p>
              <p>Para presentar tu marca, para una automatización de bienvenida, es muy potente.</p>
              <p><br /><br /></p>
              <p>Los conceptos que Martin enseñaba a sus alumnos, son los conceptos que utilizan los grandes comunicadores y grandes marcas de nuestros tiempo.</p>
              <p>&nbsp;</p>
              <p>Son conceptos aplicados a nivel mundial. Son conceptos que este mismo pintor alemán usó para conseguir lo que quiso.</p>
              <p>&nbsp;</p>
              <p>Y son conceptos que cualquier marca puede aplicar.</p>
              <p><br /><br /></p>

              <p><span style={{ color: '#0067FD' }}><strong>Dicho esto</strong></span>, toda marca que sepa comunicarse (BIEN) con sus clientes, se convertirá en una marca mucho más atractiva y rentable.</p>
              <p>&nbsp;</p>
              <p>Y esto se consigue por email.</p>
              <p>&nbsp;</p>
              <p>Y toda marca puede aplicarlo.</p>
              <p>&nbsp;</p>
              <p>Y en estos años dónde no se habla de otra cosa que de IA, mucho más.</p>
              <p><br /><br /></p>

              <p><strong>Es la gran herramienta de nuestros tiempos, sobre todo en la era de la IA, y está al alcance de una marca multimillonaria y en una marca llevada por una persona en su habitación.</strong></p>
              <p><br /><br /></p>

              <p>Y es que seguro que lo has visto…</p>
              <p>&nbsp;</p>
              <p>Marcas que dicen todas lo mismo, en las fichas de producto, en los emails, en los anuncios… Ninguna destaca realmente, y las que lo hacen, se pueden contar con los dedos de las manos.</p>
              <p>&nbsp;</p>
              <p>Se calcula que adquirir un <strong>nuevo cliente, cuesta 5 veces más</strong> que uno que ya te haya comprado algo y ojo, <strong>8 veces más que uno recurrente</strong>.</p>
              <p><br /><br /></p>

              <p>Repito, la comunicación por email, ser más atractivos de cara a nuestros clientes, es la gran herramienta de nuestras marcas, por encima de la IA, las plataformas y todo.</p>
              <p>&nbsp;</p>
              <p>Ya no es que tu marca sea más rentable, que lo es.</p>
              <p>&nbsp;</p>
              <p>No es que tengas más recurrencia, que la tendrás.</p>
              <p>&nbsp;</p>
              <p>O que te vayas a destacar por encima de tus competidores, que lo harás.</p>
              <p>&nbsp;</p>
              <p>Es que, posiblemente, sea la forma más inteligente, beneficiosa y fácil de crecer, con las ventajas de la estabilidad que pueda dar a todo negocio.</p>
              <p><br /><br /></p>

              <p>Y te aseguro que <span style={{ color: '#0067FD' }}><strong>sé de lo que estoy hablando</strong></span>.</p>
              <p>&nbsp;</p>
              <p>Desde que monté mi primera tienda online, en 2018, he facturado más de 5 millones de euros extra para mis clientes.</p>
              <p>&nbsp;</p>
              <p>Y mi propio negocio, lo he hecho crecer mediante el email. Contactando con empresas que no me conocen. Si tener una marca personal enorme, solo email.</p>
              <p>&nbsp;</p>
              <p>Quiero decir, sé muy bien cómo hacer marcas atractivas para los clientes, que consiguen vender más, generar más recurrencia y diferenciarse de sus competidores de forma única y diferente a todo lo que hay ahí fuera.</p>
              <p>&nbsp;</p>
              <p><strong>Sé cómo hacer que una marca sea muy rentable y me las he visto de todos los colores.</strong></p>
              <p>&nbsp;</p>
              <p>Nunca toco de oídas y por ello es que todo lo que aplico para mis clientes está basado en experiencia.</p>
              <p>&nbsp;</p>
              <p>Mi servicio de email marketing es del más alto nivel.</p>
              <p>&nbsp;</p>
              <p>Un servicio para todo tipo de marcas.</p>
              <p>&nbsp;</p>
              <p><strong>Todo escrito a mano, sin IA</strong>, transmitiendo personalidad, diferenciándonos del resto.</p>
              <p><br /><br /></p>

              <p>Te cuento para que lo mires con calma.</p>
              <p><br /><br /></p>
              <p><span style={{ color: '#0067FD' }}><strong>Vamos</strong></span>.</p>
              <p><br /><br /></p>

              {/* Sección 1 */}
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">GANARÁS MÁS DINERO</h2>
              <p>&nbsp;</p>
              <p>Ojo, hablo de ganar, de beneficio.</p>
              <p>&nbsp;</p>
              <p>¿Que facturarás más?</p>
              <p>&nbsp;</p>
              <p>Si, claro.</p>
              <p>&nbsp;</p>
              <p>Cuando trabajas adecuadamente la lista, <strong>te van a comprar más personas y te van a comprar más a menudo</strong>.</p>
              <p>&nbsp;</p>
              <p>Mayor tasa de conversión, mayor recurrencia, mayor beneficio.</p>
              <p>&nbsp;</p>
              <p>Por tanto, no es que solo vayas a vender más, sino que tendrás más beneficio ya que, además de aumentar la recurrencia, como sabes, para vender por email, no tienes que pagar. El coste es prácticamente 0.</p>
              <p>&nbsp;</p>
              <p><strong>Y todo lo demás que ya estás haciendo, funcionará mejor</strong>. La publicidad funcionará mejor, el contenido orgánico convertirá mejor, en definitiva, toda tu marca funcionará mejor.</p>
              <p>&nbsp;</p>
              <p>Así que, si quieres, no solo facturar más, sino tener más beneficio…</p>
              <SectionEnd sectionId={1} />

              {/* Sección 2 */}
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">NO TIENES QUE HACER NADA</h2>
              <p>&nbsp;</p>
              <p>No te va a llevar mucho tiempo extra, más allá de un par de reuniones.</p>
              <p>&nbsp;</p>
              <p>Tampoco vamos a cambiar radicalmente lo que estás haciendo, por lo que no vas a tener que reestructurar tu empresa para trabajar con nosotros.</p>
              <p>&nbsp;</p>
              <p>Ni vamos a estar constantemente molestando y pidiendo más material audiovisual ni cosas por tu parte.</p>
              <p>&nbsp;</p>
              <p>Si tienes equipo, u otra agencia, perfecto. Nos coordinamos con ellos.</p>
              <p>&nbsp;</p>
              <p><strong>Para ti, no va a suponer tiempo extra. Solo beneficio extra.</strong></p>
              <p>&nbsp;</p>
              <p>Notarás que, con el trabajo que haremos en tus campañas de emails, tus beneficios se van a incrementar y las automatizaciones pasarán a un segundo plano.</p>
              <p>&nbsp;</p>
              <p>Pero.</p>
              <p>&nbsp;</p>
              <p>Además, vamos a trabajar automatizaciones de la más alta calidad, que generen ventas sin tener que intervenir.</p>
              <p><br /><br /></p>
              <p>Así que, si quieres, no solo facturar más, con más beneficio, sino que hacerlo de una forma que no te lleve tiempo extra y que funcione en piloto automático…</p>
              <SectionEnd sectionId={2} />

              {/* Sección 3 */}
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">TENDRÁS UN ACTIVO VALIOSO</h2>
              <p>&nbsp;</p>
              <p>Obviamente, yo no vengo a construir tu marca.</p>
              <p>&nbsp;</p>
              <p>Tu marca ya existe, tú eres quien ha hecho el trabajo duro.</p>
              <p>&nbsp;</p>
              <p>Yo vengo a potenciarlo, a comunicarlo al mundo. De forma correcta a tus clientes, para que piensen en tu marca tal y cómo tú quieres que lo haga.</p>
              <p>&nbsp;</p>
              <p>Y que te compren más, por supuesto.</p>
              <p>&nbsp;</p>
              <p>Que vean la marca atractiva.<br />
              Que conecten con ellos.<br />
              Que te recuerden.<br />
              Que te compren.<br />
              Que te recomienden.<br />
              Y que te vuelvan a comprar.</p>
              <p>&nbsp;</p>
              <p>Eso es lo que yo haré. Que tus clientes vean tu marca como tu la pensaste, y que ésta te de a ti el estilo de vida que pensabas cuando la creaste.</p>
              <p>&nbsp;</p>
              <p>Comunicando adecuadamente, tu marca se convertirá en un activo muy valioso que podrás vender en un futuro a un muy buen precio o, por qué no, algo que heredes a tus hijos.</p>
              <p><br /><br /></p>
              <p>Así que, si quieres, no solo facturar más, con más beneficio, en piloto automático, sino que tu marca se convierta en un activo valioso…</p>
              <SectionEnd sectionId={3} />

              {/* Sección 4 */}
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">DESTACARÁS SOBRE TU COMPETENCIA</h2>
              <p>&nbsp;</p>
              <p>Quizá lo más importante.</p>
              <p>&nbsp;</p>
              <p>Comunicando correctamente, por email, tu cliente recordará tu marca por encima de los competidores.</p>
              <p>&nbsp;</p>
              <p>Has visto las marcas de la competencia, ¿no?</p>
              <p>&nbsp;</p>
              <p>Todas dicen lo mismo.</p>
              <p>&nbsp;</p>
              <p>No se diferencian más que en el logo y en el diseño del producto.</p>
              <p>&nbsp;</p>
              <p>Pero comunican igual. Al menos la mayoría.</p>
              <p>&nbsp;</p>
              <p>Por tanto, <strong>destacar es muy fácil.</strong></p>
              <p>&nbsp;</p>
              <p>Y más en esta época de IA, donde todo el mundo la usa para escribir sus textos, haciendo por tanto, que todos suenen igual.</p>
              <p>&nbsp;</p>
              <p>Tu marca tiene una personalidad única, que comunicada de forma correcta, te va permitir barrer con la competencia, destacar, y grabarte en la cabeza de tus clientes.</p>
              <p>&nbsp;</p>
              <p>Te recordarán, y pensarán en ti cuando quieran lo que vendes.</p>
              <p><br /><br /></p>
              <p>Así que, si quieres, no solo facturar más, con más beneficio, en piloto automático, teniendo un activo muy valioso, sino que quieres barrer con tu competencia…</p>
              <SectionEnd sectionId={4} />

              {/* Sección 5 */}
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">Y… ALGO QUE NO ESPERABAS</h2>
              <p>&nbsp;</p>
              <p>Además de trabajar sobre tus campañas de email, tus formularios de captación y tus automatizaciones…</p>
              <p>&nbsp;</p>
              <p>Además de todo eso, que ya de por si te va a hacer vender más, generar más recurrencia y destacar tu marca de la de tu competencia.</p>
              <p>&nbsp;</p>
              <p>Además de eso…</p>
              <p>&nbsp;</p>
              <p><strong>Vamos a trabajar el copy de tus fichas de producto. Para que aumente la conversión de tu web también y se reduzcan tus costes publicitarios.</strong></p>
              <SectionEnd sectionId={5} />

              {/* FAQ */}
              <h2 className="text-xl font-bold text-center text-gray-900 mb-4">RESPUESTAS FRECUENTES</h2>
              <p><br /><br /></p>

              <h3 className="text-base font-bold text-gray-900 mb-4">¿Qué incluye el servicio?</h3>
              <p>&nbsp;</p>
              <p>Lo principal sobre lo que vamos a trabajar es el email marketing. Redactaremos y programaremos todos los mails (newsletters periódicas y automatizaciones) y los formularios de captación. Además, redactaremos también el copy de las fichas de producto.</p>
              <p><br /><br /><br /><br /></p>
              <p>Por supuesto, todos los emails los escribimos con Inteligencia Humana y no Inteligencia Artificial, y aprovechamos el recurso de venta más poderoso que tenemos, el contar historias, algo que llevamos haciendo desde el principio de los tiempos.</p>
              <p><br /><br /><br /></p>

              <h3 className="text-base font-bold text-gray-900 mb-4">¿Cuánto dura el servicio?</h3>
              <p>&nbsp;</p>
              <p>El servicio dura 3 meses. Después de estos 3 meses, seguiremos mes a mes y sin ningún tipo de permanencia.</p>
              <p><br /><br /></p>

              <h3 className="text-base font-bold text-gray-900 mb-4">¿Es muy caro? ¿Es barato?</h3>
              <p>&nbsp;</p>
              <p>Es cierto, no es barato. No te voy a negar esa realidad. Nosotros primamos otras cosas muy por encima del precio. E invertimos en ello para dar unos resultados y una experiencia de cliente más especial. Mucha gente no valora eso y sólo busca precio, lo respetamos, pero no es al público al que va dirigido este servicio.</p>
              <p><br /><br /></p>

              <h3 className="text-base font-bold text-gray-900 mb-4">¿Qué perfil de personas le sacará mejor partido?</h3>
              <p>&nbsp;</p>
              <p>Las personas que más partido le sacan al servicio son personas con una lista de cierto tamaño, más 5.000 personas.</p>
              <p><br /><br /></p>

              <h3 className="text-base font-bold text-gray-900 mb-4">¿Cómo es la comunicación?</h3>
              <p>&nbsp;</p>
              <p>Nos comunicaremos por WhatsApp, en un grupo donde estaremos nosotros y quien quieras de tu equipo.</p>
              <p><br /><br /></p>

              <h3 className="text-base font-bold text-gray-900 mb-4">¿Hay algún tipo de garantía?</h3>
              <p>&nbsp;</p>
              <p>No.</p>
              <p><br /><br /></p>

              <h3 className="text-base font-bold text-gray-900 mb-4">¿Hay algún bonus?</h3>
              <p>&nbsp;</p>
              <p>Si, el servicio es principalmente la redacción, montaje y gestión de la plataforma de email marketing, pero como bonus, ya que es muy importante, incluimos el copywritting de las fichas de producto que estemos trabajando y páginas de venta en caso de que las vayas a usar.</p>
              <p><br /><br /></p>

              <h3 className="text-base font-bold text-gray-900 mb-4">¿Es una buena inversión?</h3>
              <p>&nbsp;</p>
              <p>Si quieres tener una lista fiel, una lista que, si quieres, facturar más, con más beneficio, en piloto automático, teniendo un activo muy valioso, y barrer con tu competencia… es la mejor inversión que puedes hacer. Pero claro, te lo digo yo, que soy parte interesada.</p>
              <p>&nbsp;</p>
              <p>Lo que haremos será explotar al máximo el activo más importante y rentable que tienes, tu lista. A partir de ahí la decisión es tuya.</p>
              <SectionEnd sectionId={6} />

            </div>
          </div>
        </div>
      </div>
      <FooterMinimal />
    </div>
  );
}
