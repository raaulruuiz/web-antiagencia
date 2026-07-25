import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
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
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent h4,#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent h4{color:#000000;font-family:'Georgia',serif;font-size:30px;font-weight:400;margin:0 0 10px 0;text-align:left;word-break:break-word}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent p,#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent p{color:#000000;font-family:'Georgia',serif;font-size:14px;font-weight:400;line-height:20px;margin:0 0 10px 0;text-align:left}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-block-form .ml-field-group{text-align:left!important}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-block-form .ml-field-group label{margin-bottom:5px;color:#333333;font-size:14px;font-family:'Georgia',serif;font-weight:bold;font-style:normal;text-decoration:none;display:inline-block;line-height:20px}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody form{margin:0;width:100%}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-formContent,#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow{margin:0 0 20px 0;width:100%}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow{float:left}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow{margin:0 0 10px 0;width:100%}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow.ml-last-item{margin:0}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow input{background-color:#ffffff!important;color:#333333!important;border-color:#cccccc;border-radius:4px!important;border-style:solid!important;border-width:1px!important;font-family:'Georgia',serif;font-size:14px!important;height:auto;line-height:21px!important;margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;padding:10px 10px!important;width:100%!important;box-sizing:border-box!important;max-width:100%!important}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow .custom-select{background-color:#ffffff!important;color:#333333!important;border-color:#cccccc;border-radius:4px!important;border-style:solid!important;border-width:1px!important;font-family:'Georgia',serif;font-size:14px!important;line-height:20px!important;margin-bottom:0;margin-top:0;padding:10px 28px 10px 12px!important;width:100%!important;box-sizing:border-box!important;max-width:100%!important;height:auto;display:inline-block;vertical-align:middle;background:url('https://assets.mlcdn.com/ml/images/default/dropdown.svg') no-repeat right .75rem center/8px 10px;-webkit-appearance:none;-moz-appearance:none;appearance:none}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit{margin:0 0 20px 0;float:left;width:100%}
#mlb2-38800152.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button{background-color:#7000FF!important;border:none!important;border-radius:4px!important;box-shadow:none!important;color:#ffffff!important;cursor:pointer;font-family:'Georgia',serif!important;font-size:14px!important;font-weight:700!important;line-height:21px!important;height:auto;padding:10px!important;width:100%!important;box-sizing:border-box!important}
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

function Carta({ children }) {
  return (
    <div className="bg-white shadow-xl rounded-sm px-8 md:px-16 py-12 mb-10" style={{ fontFamily: "'Georgia', serif" }}>
      <div className="text-gray-800 text-base" style={{ lineHeight: '2' }}>
        {children}
      </div>
    </div>
  );
}

export default function TrabajaConNosotros2() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = mailerLiteCSS;
    style.id = "mailerlite-css-tcn2";
    document.head.appendChild(style);

    window.ml_webform_success_38800152 = function () {
      window.umami?.track('registro-presupuesto-tcn2');
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
    script.id = "mailerlite-script-tcn2";
    document.body.appendChild(script);

    return () => {
      const css = document.getElementById("mailerlite-css-tcn2");
      if (css && css.parentNode) css.parentNode.removeChild(css);
      const scr = document.getElementById("mailerlite-script-tcn2");
      if (scr && scr.parentNode) scr.parentNode.removeChild(scr);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Trabaja con nosotros — Antiagencia</title>
        <meta name="description" content="¿Quieres que gestionemos el email marketing de tu ecommerce? Cuéntanos tu proyecto." />
      </Helmet>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
          <div className="w-full max-w-3xl">

            {/* CARTA 1: Capullo Elitista */}
            <Carta>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Asunto: Capullo Elitista</h1>
              <p>&nbsp;</p>
              <p>Esta carta está formada por varios "emails". El motivo lo entenderás mientras lees.</p>
              <p>&nbsp;</p>
              <p>El caso es que en esta carta no encontrarás ningún vídeo de 4 minutos hablándote de lo bueno que soy, ni una oferta con garantía de resultados, ni un botón para agendar una llamada vestida de "asesoría gratuita" en la que intentaré lavarte el cerebro para que me compres.<br />No.</p>
              <p>&nbsp;</p>
              <p><strong>La realidad es que no nos conocemos.</strong> Te voy a decir las cosas como las pienso, con respeto pero sin tratar de caerte bien. Te hablaré como a cualquier amigo o, como mínimo, cualquier persona que acabo de conocer y no sé quién es.</p>
              <p>&nbsp;</p>
              <p>Si esto te preocupa, bien, y si no, bien también. Sigamos.</p>
              <p><br /><br /></p>
              <p><strong>P.D.</strong></p>
              <p>
                <img src="/foto1-tcn2.png" alt="" style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }} />
              </p>
            </Carta>

            {/* CARTA 2: Sujetame el cubata */}
            <Carta>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Asunto: Sujetame el cubata</h1>
              <p>&nbsp;</p>
              <p>En los próximos emails te voy a contar una historia de cuando sembraba tomates que si la entiendes, independientemente de que quieras trabajar conmigo o no, <strong>casi seguro te va a ayudar a vender más y que tu marca sea más reconocida.</strong></p>
              <p>&nbsp;</p>
              <p>Pero antes, tienes que saber algo…</p>
              <p>&nbsp;</p>
              <p><strong>Hay dos tipos de email marketers, los que son muy buenos y los otros</strong>. Los muy buenos son capaces de hacer que te visualices con el producto que venden. Te veas usándolo y quieras comprarlo. Son los que hacen que en vez de comprar yogures, compres danones. Solo te interesa trabajar con estos. Pero como no sé si sabrías distinguir unos de otros, te voy a poner un par de ejemplos:</p>
              <p>&nbsp;</p>
              <p><strong>Un email marketer automatizado e hipersegmentado que ha salido de algún prompt de ChatGPT y piensa que escribir un mail es como presentarte a un concurso de diseño</strong>, si quiere vender un café de especialidad diría algo como:</p>
              <p>&nbsp;</p>
              <p style={{ textAlign: 'center' }}><em><strong>"No es un café para beber con prisas. Es un café de especialidad seleccionado por su origen, tostado para respetar todos sus matices y preparado para que descubras sabores que no necesitan esconderse detrás del azúcar."</strong></em></p>
              <p style={{ textAlign: 'center' }}><br /><br /></p>
              <p>Un email marketer de verdad diría:</p>
              <p>&nbsp;</p>
              <p style={{ textAlign: 'center' }}><em><strong>"Un buen café es tan especial que los japoneses se bañan en él y hasta los turcos crearon una ley por la que una mujer se podía divorciar de su marido si no le ofrecía una taza diaria de un buen café."</strong></em></p>
              <p style={{ textAlign: 'center' }}><br /><br /></p>
              <p>Otro ejemplo. Si quisiéramos vender spray antigarrapatas, el malo diría algo como:</p>
              <p>&nbsp;</p>
              <p style={{ textAlign: 'center' }}><em><strong>"Que las garrapatas no arruinen sus paseos. Nuestro spray antigarrapatas crea una barrera protectora fácil de aplicar, perfecta para usar antes de salir al campo, o a cualquier zona con vegetación. Una forma cómoda de cuidar a tu amigo peludo."</strong></em></p>
              <p style={{ textAlign: 'center' }}><br /><br /></p>
              <p>El buen email marketer diría: </p>
              <p>&nbsp;</p>
              <p style={{ textAlign: 'center' }}><em><strong>"Mientras lees este correo las garrapatas de tu mascota están engordando. Con su sangre. Esta garrapata aumentará hasta 4 veces su tamaño y 100 veces su peso, y después, pondrá unos 3000 huevos de los que nacerán más bichos de estos, que se posarán sobre tus mascotas, o peor, sobre tus hijos. Por eso hemos creado el spray XXX"</strong></em></p>
              <p style={{ textAlign: 'center' }}><br /><br /></p>
              <p>Pues eso. Que no dejes que el de diseño se ponga a escribir los emails. Ya me entiendes.</p>
              <p>&nbsp;</p>
              <p>La gente, normalmente, no busca contratar a alguien solo para el email, buscan el pack completo, lo cual es un error. Pero, los pocos inteligentes que piensan en que alguien les ayude con sus emails y con ello, sus ventas y su reputación de marca, hace una ruta parecida a esta…</p>
              <p>&nbsp;</p>
              <p>Buscan vídeos (o le aparecen ads) que no sirven de nada y son jodidamente aburridos con:</p>
              <p>&nbsp;</p>
              <div className="flex items-start gap-3">
                <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#0067FD] flex items-center justify-center text-white text-xs font-bold">✓</span>
                <span>La segmentación definitiva que tienes que hacer para vender de verdad. (Quizá esto sea una de las tonterías más grandes… <strong>Las personas son personas</strong> y cada una tiene su propia vida, pero muchos "expertos" tratan de ocultar su falta de humanidad detrás del nuevo objeto brillante de turno.)</span>
              </div>
              <p>&nbsp;</p>
              <div className="flex items-start gap-3">
                <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#0067FD] flex items-center justify-center text-white text-xs font-bold">✓</span>
                <span>Las 9 automatizaciones con la IA <strong>de tu tía</strong> que debes tener sí o sí.</span>
              </div>
              <p>&nbsp;</p>
              <div className="flex items-start gap-3">
                <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#0067FD] flex items-center justify-center text-white text-xs font-bold">✓</span>
                <span><strong>Esto NO es para ti si eres de los que le pide consejos amorosos a ChatGPT</strong> y no estás dispuesto a contar tu verdadera historia.</span>
              </div>
              <p><br /><br /></p>
              <p>Bueno, creo que esto es suficiente para este email. </p>
              <p>&nbsp;</p>
              <p>Digo, para que entiendas de que va la cosa. Si aún no sabes de lo que hablo, lo más recomendable es que no contrates a nadie para que te haga tus emails, ni a mi.</p>
              <p>&nbsp;</p>
              <p>Tú haces lo que quieras, pero este es mi consejo.</p>
              <p>&nbsp;</p>
              <p>El caso. </p>
              <p>&nbsp;</p>
              <p>Si tienes una tienda online, en el siguiente mail te cuento una cosa que es muy muy importante que sepas. Y que si no lo sabes… tendrás problemas.</p>
              <p><br /><br /></p>
              <p><strong>P.D.</strong> Enserio, no lo pongas a escribir emails solo porque hace diseños bonitos.</p>
            </Carta>

            {/* CARTA 3: La clave para ser un gran estafador */}
            <Carta>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Asunto: La clave para ser un gran estafador</h1>
              <p><br /><br /></p>
              <p>Como te decía en el email anterior, hay algo que debes saber. Porque sino tendrás problemas.</p>
              <p>&nbsp;</p>
              <p><strong>La gente no se mueve por lo que "<em>escucha</em>", lo hace por lo que "<em>ve</em>" en su mente. </strong></p>
              <p>&nbsp;</p>
              <p>Esto hay que entenderlo, porque es la base de todo. Nadie te va a comprar, ni sentirse parte de tu marca, ni idolatrarte si no eres capaz de darle una "<em>visión</em>" de lo que va a conseguir al comprarte.</p>
              <p>&nbsp;</p>
              <p>No son ni los descuentos, ni el precio, ni la competencia, ni "<em>mandarle el mensaje correcto en el momento correcto</em>"... <strong>Es lo que transmites, lo que comunicas.</strong></p>
              <p>&nbsp;</p>
              <p>Y es que el producto da igual. Puede ser una increíble mierda, que vas a vender mucho.</p>
              <p>&nbsp;</p>
              <p>A ver, antes de que te de una taquicardia, esto es impepinable:</p>
              <p>&nbsp;</p>
              <div className="flex items-start gap-3">
                <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#0067FD] flex items-center justify-center text-white text-xs font-bold">✓</span>
                <span>Si tu producto es bueno pero no sabes comunicarlo, no vendes. Mala cosa.</span>
              </div>
              <p>&nbsp;</p>
              <div className="flex items-start gap-3">
                <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#0067FD] flex items-center justify-center text-white text-xs font-bold">✓</span>
                <span>Si tu producto es bueno y sabes comunicarlo, vendes, creces, te recuerdan, te haces grande. Buena cosa. Esto es lo que quieres.</span>
              </div>
              <p>&nbsp;</p>
              <div className="flex items-start gap-3">
                <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#0067FD] flex items-center justify-center text-white text-xs font-bold">✓</span>
                <span>Si tu producto no es bueno y no sabes comunicarlo, no vendes. Bien, ahorras al mundo de comprar tu basura, busca trabajo.</span>
              </div>
              <p>&nbsp;</p>
              <div className="flex items-start gap-3">
                <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#0067FD] flex items-center justify-center text-white text-xs font-bold">✓</span>
                <span>Si tu producto no es bueno pero sabes comunicarlo, vendes. Pero luego tendrás muchas devoluciones y clientes descontectos. No tienes mucho recorrido, pero eres un gran estafador. Usa sabiamente este poder.</span>
              </div>
              <p><br /><br /></p>
              <p>Cómo ves, el producto da igual para vender (para crecer es otra cosa). Pero lo que no admite discusión es que necesitas comunicarlo bien. <strong>Y si además de vender mucho, lo que quieres es una marca que la gente reconozca por la calle… necesitas comunicar MUY bien.</strong></p>
              <p><br /><br /></p>
              <p>En el siguiente email te voy a contar la historia de cuando sembraba tomates, la que te decía al inicio que necesitas entender.</p>
              <p><br /><br /></p>
              <p><strong>P.D.</strong> Es mejor vivir la fiesta que escuchar cómo te la cuentan.</p>
            </Carta>

            {/* CARTA 4: Sembrando tomates */}
            <Carta>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Asunto: Sembrando tomates</h1>
              <p>&nbsp;</p>
              <p>Para contratar a un profesional, yo no se lo que tú buscas. Pero si se lo pido yo.</p>
              <p>&nbsp;</p>
              <p><strong>Por un lado,</strong> no me gusta la gente llorona, los flojos, los socialistas, la gente que se queja cuando algo le va mal en vez de buscar solución o su "solución" es sacarse un descuento de la manga o cualquier gilipollez por el estilo.</p>
              <p>&nbsp;</p>
              <p>Esto son negocios. Tienes que echarle cojones, tienes que buscarte la vida, como ya has hecho otras veces, y no llorar para que te den alguna paguita.</p>
              <p><br /><br /></p>
              <p>
                <img src="/foto2-tcn2.png" alt="" style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }} />
              </p>
              <p><br /><br /></p>
              <p><strong>Por otro lado</strong>, tienes que entender esta historia de cuando trabajaba en el campo…</p>
              <p>&nbsp;</p>
              <p>Mi familia vive y siempre ha vivido del campo. Y a mi me ha tocado trabajar todos los veranos antes de las clases. Ni vacaciones ni nada, trabajo. Era lo que había, no voy a quejarme. Mis amigos estaban igual.</p>
              <p>&nbsp;</p>
              <p>Bien.</p>
              <p>&nbsp;</p>
              <p>Pues uno de esos veranos, con 15 o 16 años, estábamos quitando mamones a los tomates. El trabajo era sencillo. Entre el tallo principal y las hojas, los tomates crecen otros tallos, a los que se llama mamones, porque quitan agua y nutrientes al tallo principal <strong>(como los clientes tóxicos le hacen a tu tienda)</strong>, así que había que quitarlos mientras aún estaban pequeños.</p>
              <p>&nbsp;</p>
              <p>La única dificultad era que los tomates aún estaban muy bajos, por lo que había que estar agachado. Durante las 5-6 horas que trabajábamos por la mañana y las 3-4 horas que echábamos por la tarde.</p>
              <p>&nbsp;</p>
              <p>Éramos 5 personas trabajando. Mi madre, yo, y tres hombres que teníamos contratados. Mi padre, que está operado varias veces de la espalda, no podía hacer este trabajo así que solo pasaba de vez en cuando para controlar cómo iba todo.</p>
              <p>&nbsp;</p>
              <p>Al poco de comenzar, siempre empezaba a dolerme la espalda por estar agachado, así que, cada poco tiempo, me ponía de pie, y descansaba un poco. Eso hacía que siempre fuese el último, el más lento. Mi madre, al contrario, siempre estaba agachada y siempre era la primera, muy por delante del resto. A mi me parecía un poco estúpido, era la jefa y, como yo, no tenía un sueldo. Se lo  podía tomar con más calma.</p>
              <p>&nbsp;</p>
              <p>Los hombres, como veían que yo me levantaba cuando me daba la gana, hacían lo mismo. </p>
              <p>&nbsp;</p>
              <p><strong>Excepto cuando venía mi padre.</strong></p>
              <p>&nbsp;</p>
              <p>Mi padre es un tío duro, de más de 100 kilos, y además era el que pagaba, así que no querías que te viese vagueando en el trabajo.</p>
              <p>&nbsp;</p>
              <p>Pero a mi me daba igual. Yo era uno de los "jefes", además no cobraba, por lo que no me importaba parar cuando me apeteciera, justificándome en estas cosas.</p>
              <p>&nbsp;</p>
              <p>Un día mi padre llegó y me vio de pie, bastante por detrás de los demás, y me mandó a llamar. Me llevó algo lejos del resto.</p>
              <p>&nbsp;</p>
              <p>No importó mucho porque los gritos podían escucharse a la perfección desde donde estaban ellos.</p>
              <p>&nbsp;</p>
              <p><strong>Y mi error fue plantarle cara.</strong></p>
              <p>&nbsp;</p>
              <p>Sin muchos detalles, me dijo que no podía pararme cuando me saliera de los cojones y yo le dije que entonces, me pagara, lo cual lo hizo enfadar todavía más.</p>
              <p>&nbsp;</p>
              <p>Después, en el descanso para comer. Mi madre, que es bastante más sutil que mi padre, me explicó que precisamente porque nosotros somos los jefes, somos los que tenemos que trabajar más duro. Tenemos que liderar.</p>
              <p>&nbsp;</p>
              <p>Que a los trabajadores tenemos que mostrarles que tienen que trabajar, no que pueden parar cuando quieran, que eso nos perjudica y nos hace perder dinero. <strong>El pastor tiene que pastorear, me dijo.</strong></p>
              <p><br /><br /></p>
              <p>Okay. </p>
              <p>&nbsp;</p>
              <p>De esta historia hay que aprender una lección de mis padres y otra mía. Porque son muy importantes no solo para vender, sino para tener una gran marca que sea reconocida.</p>
              <p>&nbsp;</p>
              <p>La lección que aprendí yo es que lo que yo piense no importa. Lo que importa es lo que piense el otro. Si en vez de estar pensando en que no tenía que esforzarme porque no me pagaban, hubiese pensado en que los trabajadores, al verme parado, iban a suponer que ellos también podían vaguear cuando quisieran, probablemente habríamos terminado más rápido la tarea y por tanto ser más eficientes y reducir costes.</p>
              <p>&nbsp;</p>
              <p>Y lo mismo con mi padre, si hubiese entendido esto y no lo hubiese retado, no me habría caído tremenda regañina y humillación delante de todos.</p>
              <p>&nbsp;</p>
              <p><strong>Y es que, pensar solo en nosotros es lo peor que podemos hacer. Eso mata las ventas.</strong></p>
              <p>&nbsp;</p>
              <p>Lo que nosotros pensamos no importa, importa lo que piensa el cliente, sus motivaciones.</p>
              <p>&nbsp;</p>
              <p>¿Y qué podemos aprender de mis padres?</p>
              <p>&nbsp;</p>
              <p>Que tenemos que ser líderes. Mostrar nuestra autoridad, no solo ir diciendolo. Mi madre nunca dijo lo que había que hacer o cuando había que hacerlo, solo lo hacía, y el resto la seguía.</p>
              <p>&nbsp;</p>
              <p>En un negocio tenemos que liderar, no decir que lideramos.</p>
              <p>&nbsp;</p>
              <p><strong>La gente compra seguridad y eso es lo que les tenemos que dar.</strong></p>
              <p><br /><br /></p>
              <p>Por eso, si vamos a trabajar juntos tienes que tener en cuenta lo que te voy a contar en el siguiente email. </p>
              <p><br /><br /></p>
              <p><strong>P.D</strong>. El pastor, pastorea.</p>
            </Carta>

            {/* CARTA 5: Elitista Capullo */}
            <Carta>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Asunto: Elitista Capullo</h1>
              <p>&nbsp;</p>
              <p>Okay.</p>
              <p>&nbsp;</p>
              <p>Si vamos a trabajar juntos debes saber algunas cosas muy importantes y que no son negociables.</p>
              <p>&nbsp;</p>
              <p>Lo primero que haré será investigar tu negocio, tu mercado, tu competencia e incluso a ti. Y si después de plantear la estrategia, por ponerte un ejemplo, te sacas un descuento de la manga o alargas una promoción "<em>por petición popular</em>"… no cuentes conmigo.</p>
              <p>&nbsp;</p>
              <p>Si quieres una marca, tienes que liderar, no puedes mostrarte desesperado prostituyendo tus precios y tu reputación.</p>
              <p>&nbsp;</p>
              <p><strong>Por eso, si vas a hacer algún cambio en la estrategia que te plantee, me lo tendrás que comunicar.</strong></p>
              <p>&nbsp;</p>
              <p>Y esto no te lo digo por ser elitista o porque me vaya a ofender. No, tu haces lo que te de la gana. Te lo digo porque <strong>los emails, los mensajes que mandas, son calve para construir una marca</strong> y para ganar ingentes cantidades de dinero.</p>
              <p>&nbsp;</p>
              <p>Y ya sea conmigo o con otro, asegurate que es alguien muy bueno. No quieres dejar tanto dinero por ganar en manos de un patán.</p>
              <p>&nbsp;</p>
              <p>Entiendo que sea tu negocio y que haces lo que te sale de los huevos, pero mi negocio y mi reputación dependen de que te de resultados, así que si vas a contratar a un profesional para que te ayude, tienes que respetar su criterio. <strong>Y si no, pues haces tú los emails.</strong></p>
              <p>&nbsp;</p>
              <p><strong>Tienes que saber que odio perder el tiempo, y hacerlo perder a otras personas.</strong></p>
              <p>&nbsp;</p>
              <p>Soy de los que llegan 10 minutos antes a las reuniones.</p>
              <p>&nbsp;</p>
              <p>Por esto, también tienes que saber que <strong>mis servicios no son baratos</strong>. Si es la primera vez que me contratas, pagarás 3 meses por adelantado, y lo harás todo antes de que empiece a trabajar.</p>
              <p>&nbsp;</p>
              <p>50% para reservar y el otro 50% antes de reunirnos.</p>
              <p><br /><br /></p>
              <p><strong>Si no cobro, no trabajo.</strong></p>
              <p>&nbsp;</p>
              <p>Y si, yo a la gente que contrato, les pago por adelantado. Y no les digo como tienen que hacer su trabajo.</p>
              <p>&nbsp;</p>
              <p>Contratarme cada día será menos barato y más difícil, hasta que llegue el punto en el que sea imposible hacerlo.</p>
              <p>&nbsp;</p>
              <p>Bien.</p>
              <p>&nbsp;</p>
              <p>Después de esto, puede que pienses que soy un capullo elitista, o un elitista capullo, pero como te dije al inicio, no pretendo hacer amigos ni regalarte los oídos. Me tengo por alguien alegre y educado, pero no me gusta perder mi tiempo ni hacértelo perder a ti, así que tengo que ser claro y directo.</p>
              <p>&nbsp;</p>
              <p>Ya sabes que hay clientes que se quejan si no les das descuentos. Yo no quiero de esos. Y si trabajas conmigo, tú tampoco los tendrás.</p>
              <p>&nbsp;</p>
              <p>Hay quien entiende esto y quien no. Pero no es negociable y yo solo trabajo con quien lo entiende.</p>
              <p><br /><br /></p>
              <p>Si te interesa, puedes pedir información rellenando el formulario de abajo. Si me interesa tu proyecto te llamaré para pedirte más información.</p>
              <p>Si no me interesa, te contactaré para agradecerte la confianza y decirte que no estoy interesado.</p>
              <p>&nbsp;</p>
              <p>Disfruta la vida.</p>
              <p>&nbsp;</p>
              <p>Raúl.</p>
              <p><br /><br /></p>
              <p><strong>P.D.</strong> Pide información por aquí: </p>
              <p>&nbsp;</p>
              <MailerLiteForm />
            </Carta>

          </div>
        </div>
        <FooterMinimal />
      </div>
    </>
  );
}
