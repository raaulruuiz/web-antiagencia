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

              <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 leading-tight mb-2">
                SERVICIO DE COPYWRITTING PARA EMAIL MARKETING
              </h1>
              <p style={{textAlign: 'center'}}>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>Un día cualquiera, de una semana cualquiera, dos emprendedores decidieron montar sus negocios online. Ambos tenían la misma edad, mismo nivel de estudios, e incluso su formación era en la misma área. Y durante su vida profesional habían ejercido cargos similares, que les daban una buena visión del reto que tenían por delante.</span></p>
              <p><br /><br /></p>
              <p><span style={{fontWeight: 400}}>Ambos eran muy trabajadores y dedicados.</span></p>
              <p><br /><br /></p>
              <p><span style={{fontWeight: 400}}>Antes de lanzarse a la aventura, ambos se habían preparado e informado sobre como tener éxito con su emprendimiento y con ello, alcanzar la vida de sus sueños. Además, tenían un presupuesto muy similar. Para nada alto, en sus planes no lo necesitaban.</span></p>
              <p><br /><br /></p>
              <p><span style={{fontWeight: 400}}>Sabían que podían crecer rápidamente en el entorno digital. Habían visto muchos casos de otras marcas que crecieron mucho partiendo de una inversión baja. Reinvirtiendo el beneficio.</span></p>
              <p><br /><br /></p>
              <p><span style={{fontWeight: 400}}>Hace poco, estos dos emprendedores se habían encontrado en un evento presencia, un par de años después de montar sus tiendas.</span></p>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>Sus vidas seguían siendo muy parecidas, incluso en lo personal. Ambos estaban prometidos e incluso pensando en formar una familia. Y ambos seguían al frente de sus negocios, pero había una diferencia.</span></p>
              <p><br /><br /></p>
              <p><span style={{fontWeight: 400}}>A uno de ellos, su tienda le daba un buen sueldo mensual. Facturaba cientos de miles de euros al año y vivía bien. Tenía un equipo que cada vez necesitaba ser más grande. Cada año, su beneficio aumentaba, y estaba planeando expandirse al extranjero. Además, cada año se permitía varias semanas de vacaciones con su pareja.</span></p>
              <p><br /><br /></p>
              <p><span style={{fontWeight: 400}}>El otro, sin embargo, facturaba más que él, pero dependía de dar descuentos cada vez mayores y por tanto sus beneficios eran cada vez menores. Tenía un equipo que cada vez necesitaba ser más pequeño. Tuvo que despedir a varios empleados y bajarse el sueldo para que no le comieran los costes fijos. Pensaba incluso en cerrar la tienda. Su horario de trabajo era desde que se levantaba hasta que se acostaba, apagando fuegos, y las vacaciones para él no eran más que un motivo de discusión con su pareja porque no podía parar.</span></p>
              <p><br /><br /></p>

              <h2 className="text-xl font-bold text-center text-gray-900 mb-4">La diferencia</h2>
              <p style={{textAlign: 'center'}}>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>¿Te preguntarás cuál era la diferencia en la vida de estas dos personas?</span></p>
              <p><br /><br /></p>
              <p><span style={{fontWeight: 400}}>No es la inteligencia ni los recursos ni la disciplina. Tampoco era invertir o no en publicidad, ambos lo hacían.</span></p>
              <p><br /><br /></p>
              <p><span style={{fontWeight: 400}}>No es que uno quisiera tener éxito y el otro no, o que uno tuvo "buena suerte" y el otro "mala suerte", afortunadamente no es nada de eso.</span></p>
              <p><br /><br /></p>
              <p><span style={{fontWeight: 400}}>La verdadera diferencia radica en los profesionales que cada uno elige para que le guíen por un camino que no ha recorrido. De donde pone el foco, apoyado de profesionales que realmente aportan en las áreas más importantes del negocio. Que arrojan resultados.</span></p>
              <p><br /><br /></p>
              <p><span style={{fontWeight: 400}}>Y es por eso que te escribo sobre Email Marketing. <strong>Porque esa es la idea del Email.</strong></span></p>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>Trabajar el área más importante, la base de los beneficios de una marca, la que no depende de poner dinero en juego, pujando por la atención de la gente.</span></p>
              <p><br /><br /></p>

              <h2 className="text-xl font-bold text-center text-gray-900 mb-4">Una herramienta más simple</h2>
              <p style={{textAlign: 'center'}}>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>Verás, el email marketing es muy simple, no fácil, ojo. No es complejo técnicamente, no tienes que invertir tu dinero para pujar por clientes, por ello, no tienes coste por compra, lo que lleva a que todo lo que generas por email va directamente al beneficio. Y tampoco dependes de que cambien los algoritmos, te bloqueen cuentas o ahora tus publicaciones lleguen a la mitad de personas que hace un mes.</span></p>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>Además, es la herramienta que <strong>te permite conectar genuinamente con tus compradores, fidelizarlos y hacer que te quieran comprar constantemente, aumentando aún más los beneficios</strong>.</span></p>
              <p><br /><br /></p>

              <h2 className="text-xl font-bold text-center text-gray-900 mb-4">Una herramienta que ahorra dinero</h2>
              <p style={{textAlign: 'center'}}>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>El email no va a sustituir nunca a la publicidad. Es más, va a hacer que funcione mejor. <strong>Lo que va a hacer el mail es permitirte no depender de ella</strong>. O de los algoritmos de las redes.</span></p>
              <p><br /><br /></p>
              <p><span style={{fontWeight: 400}}>Te va a permitir vender cada día, cambie el algoritmo o no, tengas tiempo de producir nuevos anuncios o no, inviertas más o menos en publicidad. Al email no le importa nada de esto. No necesitas pagar publicidad, no necesitas pagar por producir anuncios. Incluso no tienes ni que usar imágenes si no quieres.</span></p>
              <p><br /><br /></p>
              <p><span style={{fontWeight: 400}}>Tampoco te tienes que complicar la vida con complejas automatizaciones (tampoco tienes que quitarlas si las tienes), hiper-segmentar a la audiencias y cosas por el estilo. Detrás de la pantalla hay una persona como tú y como yo. Una persona que, si se va de vacaciones y está dos semanas sin leer tus emails no significa que ya no les interesen. Una persona, que si su hijo se pone enfermo, lo cuidará y no estará pendiente al email.</span></p>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>No tenemos que complicarlo. Hay que mandar mails a personas, nada más. Contarles historias. Es lo que hacemos las personsa. ¿de qué hablas cuando quedas con tus amigos? Hay que hacerlo más humano y menos artificial.</span></p>
              <p><br /><br /></p>
              <p><span style={{fontWeight: 400}}>Hay muchos más beneficios si trabajas el email marketing de forma profesional y correcta que si te los pongo aquí es posible que esto quede demasiado largo. En todo caso, te puedes hacer una idea.</span></p>
              <p><br /><br /></p>
              <p><span style={{fontWeight: 400}}>Lo que el email puede hacer por ti, <strong>el beneficio extra que vas a obtener al dejar de depender de descuentos, lo que ahorras al poder apagar la publicidad sin que se te caiga el negocio, no depender de algoritmos…</strong> te ahorra una cantidad de tiempo y dinero que no te puedo cuantificar. En todo caso, podrás comprobarlo si trabajamos juntos:</span></p>
              <p><br /><br /></p>

              <MailerLiteForm />
              <p><br /><br /></p>

              <p><span style={{fontWeight: 400}}><strong>P.D.</strong> No puedo garantizarte ningún resultado concreto, tampoco es mi estilo. Pero puedo garantizarte que siempre encontrarás este servicio útil, beneficioso y con muchas estrategias diferentes, que sin duda, te traerán resultados distintos a los que ya tienes.</span></p>
              <p><br /><br /><br /></p>

              <h2 className="text-xl font-bold text-center text-gray-900 mb-4">PREGUNTAS FRECUENTES</h2>
              <p style={{textAlign: 'center'}}><br /><br /></p>

              <h3 className="text-xl font-bold text-gray-900 mb-4">¿Podré dejar de dar descuentos y de depender de las plataformas de publicidad y del contenido orgánico?</h3>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>Si, por supuesto. El objetivo principal de este servicio es tener una lista sana y fiel, que te compre independientemente de la situación y sin necesidad de descuentos. Que te quieran comprar incluso si cambias de negocio y empiezas a vender otra cosa que no tenga nada que ver. No es algo inmediato, pero si es la acción más rentable que puedes hacer para tu tienda. Y por supuesto, que puedas parar la publicidad o dejar de publicar y que sigas vendiendo.</span></p>
              <p><br /><br /><br /></p>

              <h3 className="text-xl font-bold text-gray-900 mb-4">¿Qué incluye el servicio?</h3>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>Lo principal sobre lo que vamos a trabajar es el email marketing. Redactaremos y programaremos todos los mails (newsletters periódicas y automatizaciones) y los formularios de captación. Además, redactaremos un plan de acción trimestral para que tengas claridad en lo que vamos a hacer.</span></p>
              <p><br /><br /></p>
              <p><span style={{fontWeight: 400}}>Por supuesto, todos los emails los escribimos con Inteligencia Humana y no Inteligencia Artificial, y aprovechamos el recurso de venta más poderoso que tenemos, el contar historias, algo que llevamos haciendo desde el principio de los tiempos.</span></p>
              <p><br /><br /><br /></p>

              <h3 className="text-xl font-bold text-gray-900 mb-4">¿Cuánto dura el servicio?</h3>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>El servicio dura 3 meses. Es la mejor forma de arrancar para poder hacer una buena investigación y que obtengas los mejores resultados posibles. Después de estos 3 meses, seguiremos mes a mes y sin ningún tipo de permanencia.</span></p>
              <p><br /><br /><br /></p>

              <h3 className="text-xl font-bold text-gray-900 mb-4">¿Es muy caro? ¿Es barato?</h3>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>Es cierto, no es barato. No te voy a negar esa realidad. Nosotros primamos otras cosas muy por encima del precio. E invertimos en ello para dar unos resultados y una experiencia de cliente más especial. Mucha gente no valora eso y solo busca precio, lo respetamos, pero no es al público al que va dirigido este servicio.</span></p>
              <p><br /><br /><br /></p>

              <h3 className="text-xl font-bold text-gray-900 mb-4">¿Qué perfil de personas le sacarán mejor partido?</h3>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>Las personas que más partido le sacan al servicio son personas con una lista de cierto tamaño (más 5.000 personas) y que se encuentran en alguna de estas situaciones:</span></p>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>- a final de mes tus gastos fijos "se comen" tu beneficio</span></p>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>- o dependes de dar descuentos para vender</span></p>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>- o nunca has mandado mails a esa lista</span></p>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>- o los escribes con ChatGPT</span></p>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>- o si haces emails de 2 párrafos y muchas imágenes</span></p>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>- o peor, los haces de 2 párrafos y encima escritos por ChatGPT</span></p>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>- o piensas que "es que mis clientes no leen"</span></p>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>- o piensas que tu cliente o tu producto "es especial" y que tiene que ser tratada como si no hubiese humanos detrás de la pantalla donde leen</span></p>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>- y sobre todo, si tu facturación depende principalmente de la publicidad o de tu comunidad en redes sociales.</span></p>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>En cualquiera de estos casos, le sacarás mucho partido al servicio.</span></p>
              <p><br /><br /><br /></p>

              <h3 className="text-xl font-bold text-gray-900 mb-4">¿Cómo es la comunicación?</h3>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>Nos comunicaremos por WhatsApp, en un grupo donde estaremos nosotros y quien quieras de tu equipo. Si lo prefieres podemos usar otro canal de comunicación, pero preferimos WhatsApp por la inmediatez y la facilidad de uso.</span></p>
              <p><br /><br /><br /></p>

              <h3 className="text-xl font-bold text-gray-900 mb-4">¿Hay algún tipo de garantía?</h3>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>No.</span></p>
              <p><br /><br /><br /></p>

              <h3 className="text-xl font-bold text-gray-900 mb-4">¿Hay algún bonus?</h3>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>Si, el servicio es principalmente la redacción, montaje y gestión de la plataforma de email marketing, pero como bonus, ya que es muy importante, incluimos el copywritting de las fichas de producto que estemos trabajando y el plan estratégico trimestral. Ambas cosas son fundamentales para cualquier tienda online, por eso las incluimos.</span></p>
              <p><br /><br /><br /></p>

              <h3 className="text-xl font-bold text-gray-900 mb-4">¿Cómo funciona eso de la donación?</h3>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>Por si no lo sabías, te cuento. Donamos un 10% de todo lo que nos pagas a una causa benéfica en la que creemos. La causa la eliges en el formulario al pedir el presupuesto y cada vez que recibamos un pago de tu parte, haremos la donación y te enviaremos el justificante.</span></p>
              <p><br /><br /><br /></p>

              <h3 className="text-xl font-bold text-gray-900 mb-4">¿Es una buena inversión?</h3>
              <p>&nbsp;</p>
              <p><span style={{fontWeight: 400}}>Si quieres tener una lista fiel, que te compre independientemente de si das descuento o no, sea la época del año que sea o incluso si cambias de negocio, y con eso aumentar los beneficios netos de tu tienda, este servicio hará justo eso. Explotaremos al máximo el activo más importante y rentable que tienes, tu lista. A partir de ahí la decisión es tuya.</span></p>
              <p><br /><br /><br /></p>

              <MailerLiteForm />

            </div>
          </div>
        </div>
      </div>
      <FooterMinimal />
    </div>
  );
}
