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

export default function TrabajaConNosotros() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = mailerLiteCSS;
    style.id = "mailerlite-css-trabajaconnosotros";
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
    script.id = "mailerlite-script-trabajaconnosotros";
    document.body.appendChild(script);

    return () => {
      const css = document.getElementById("mailerlite-css-trabajaconnosotros");
      if (css && css.parentNode) css.parentNode.removeChild(css);
      const scr = document.getElementById("mailerlite-script-trabajaconnosotros");
      if (scr && scr.parentNode) scr.parentNode.removeChild(scr);
    };
  }, []);

  const bulletsFirst = [
    <><strong>Vamos a escribir tus mails siguiendo 3 pasos muy concretos para que la gente lea y compre.</strong> (Con un sistema que se ideó basándose en un tipo que conquistó a su mujer después de mandarle 1.460 mails).</>,
    <>Usaremos <strong>la manera más sencilla y honesta de subir los precios</strong> de tus productos sin complicarte la vida ni perder ventas.</>,
    <>Una estrategia tan sencilla que muy pocas marcas aplican y que <strong>permite subir el beneficio casi instantáneamente</strong>.</>,
    <>Como <strong>seguir vendiendo muy bien aunque apagues la publicidad</strong> y con ese dinero te vayas de crucero.</>,
    <><strong>¿Tienes productos que no sacas ni regalados?</strong> Pues aplicamos una estrategia para venderlos rápido.</>,
    <>Hace poco vi un anuncio que te promete vender en una hora lo que vendes en un mes. Bien, eso es mentira y una estafa, pero sí que <strong>generaremos picos de venta muy altos en cortos periodos de tiempo</strong>.</>,
    <>Si no ponemos ciertos enlaces en los mails, es muy probable que <strong>vendan bastante más</strong>.</>,
    <>Aplicamos <strong>la herramienta más persuasiva en ventas</strong>, que aprendí con el ejemplo de un empresario de los años 50 que multiplicó sus ventas gracias a un incendio en su tienda de muebles.</>,
    <>Haremos que tus fichas de producto <strong>vendan, probablemente, mucho más gracias a una técnica de escritura persuasiva</strong> de los publicitarios de la vieja escuela.</>,
    <><strong>Cada euro que inviertas en publicidad traerá más retorno gracias también a lo de arriba.</strong></>,
    <>Usaremos una técnica que aplican las series de televisión para que la gente <strong>no solo lea y compre, sino que se vuelva fiel a leer tus mails.</strong></>,
    <>Te demostraremos por qué <strong>"hiper-personalizar" tu lista es una estrategia de gente que no tiene ni idea de email marketing</strong> ni de comportamiento del consumidor y por qué no deberías hacerlo.</>,
    <><strong>Si no hacemos una cosa que todo el mundo hace, probablemente vendamos más</strong> (demostrado con datos). Pero es algo que muy poca gente esta dispuesta a hacer. Está relacionado con las imágenes de los correos.</>,
    <>Usaremos una de las <strong>herramientas más persuasivas y mejor para las ventas, que sustituirá a los descuentos</strong>. (Muy útil, sobre todo, si cometes el error de alargar las promociones uno o dos días después de que terminen).</>,
    <>Como <strong>evitar perder ventas con los flujos automáticos</strong> por usarlos de forma incorrecta, como la mayoría de tiendas.</>,
    <>¿Que te pide cualquier plataforma para hacer publicidad o publicar en ella? El mail. Pues <strong>haremos que a tu cliente le sea irresistible no dejarte su correo</strong>.</>,
    <>Si no planificas con antelación, perderás ventas y aumentarás estrés. Por eso <strong>haremos un plan de 3 meses.</strong></>,
  ];

  const bulletsSecond = [
    <>Te mostraremos por qué <strong>personalizar tus mails suele ser una estrategia de principiantes</strong> (incluso en listas de miles de personas) y por qué puede matar buena parte de tus ventas.</>,
    <>Mejoraremos los resultados de todo lo que hagamos gracias a <strong>una funcionalidad de las plataformas que se usa muy poco</strong> y que es extremadamente útil.</>,
    <><strong>Si tienes un producto caro o complejo, no mandes a la gente a la página de producto. Te mostraremos una mejor forma de venderlos.</strong></>,
    <><strong>Cómo aprovechar la IA (sin usarla) para adelantar a toda tu competencia que si la usa.</strong></>,
    <>Vamos a <strong>evitar un error muy común que cometen los dueños de tiendas online</strong> (incluso si llevan años con la tienda) y <strong>que está matando muchas ventas.</strong> Tiene que ver con el "cliente ideal".</>,
    <>¿Tu producto es muy similar al de tu competencia? ¿Incluso en precio? Hay <strong>una forma muy simple de diferenciarlo</strong> e incluso venderlo más caro.</>,
    <>Si alguna vez has escuchado sobre el LTV o la recurrencia, <strong>no te vas a tener que preocupar más por eso</strong>. Estarán prácticamente aseguradas (sin hacer nada más)</>,
    <>Usaremos las <strong>3 fórmulas más económicas, rentables y efectivas</strong> (no tienen que ver con el pop up) para <strong>aumentar tu lista con personas de calidad</strong> que querrán comprar lo que tienes sin regatear.</>,
    <>La pescadera de mi pueblo, una señora mayor y sin estudios, sabe bastante más de WhatsApp y SMS marketing que cualquiera que se dedique a esto. Por eso vamos a aplicar lo que aprendí de ella <strong>para que "vendas todo el pescao".</strong></>,
    <>Aplicaremos <strong>la estrategia mas simple y poco explorada de aumentar la venta cruzada</strong> y hacer que tus clientes te compren varios productos prácticamente en cada venta.</>,
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-3xl">
          <div className="bg-white shadow-xl rounded-sm px-8 md:px-16 py-12" style={{ fontFamily: "'Georgia', serif" }}>
            <div className="text-gray-800 text-base leading-relaxed">

              <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 leading-tight mb-2">La manera más sencilla y eficaz de ganar (mucho) dinero con una tienda online…</h1>
              <br />
              <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 leading-tight mb-4">que ignoran casi todos los departamentos de marketing, de casi todas las tiendas del mundo.</h1>
              <br /><br /><br /><br /><br />

              <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Por favor, lo primero que quiero que sepas es que no tengo una empresa, ni 40 empleados. Soy autónomo y en mi equipo estamos mi novia y yo.</h2>
              <br />
              <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Tampoco tengo ninguna carrera universitaria ni máster de ningún tipo.</h2>
              <br />
              <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Si esto puede suponer un problema para ti, lo mejor es que dejes de leer aquí.</h2>
              <br /><br />

              <h2 className="text-xl font-bold text-center text-gray-900 mb-4">Pero antes de nada, ¿sabías que lo más importante que tienes en tu marca, quizá lo único verdaderamente importante, no es ni la publicidad, ni tus seguidores, ni tu página, ni el precio, ni siquiera el propio producto?</h2>
              <br />
              <h2 className="text-xl font-bold text-center text-gray-900 mb-4">Cuando…</h2>
              <br />

              <p className="mb-4">… la publicidad de mi tienda online empezó a funcionar peor de lo normal no le di mucha importancia.</p>
              <p className="mb-4">Al fin y al cabo hay temporadas mejores y temporadas peores. </p>
              <br />
              <p className="mb-4">Era lo normal, así que ajusté el presupuesto y seguí trabajando. </p>
              <br />
              <p className="mb-4">Estuve así algo más de un mes, y ya empezaba a ser preocupante (porque éramos dos socios y una chica que contratamos para el servicio al cliente). <span className="underline">Esto fue en septiembre de 2020.</span></p>
              <br />
              <p className="mb-4">Se acercaba el día 30, y tener que pagar sueldos, cuando el beneficio estaba bajando, hacía que la presión fuese cada vez mayor.</p>
              <br />
              <p className="mb-4"><strong>Sentía ese hormigueo en el estómago que te da cuando piensas que la cuenta del banco al final de mes quedará por debajo que el mes anterior, contando los meses de vida que te quedan si sigue así más tiempo…</strong></p>
              <br />
              <p className="mb-4">Las noches se hacían eternas, sin dormir, pensando en que podía hacer para sobrevivir esta situación, el estrés de trabajar para apagar un fuego que no sabía cómo se había producido en primer lugar me comía por dentro…</p>
              <br />
              <br />
              <p className="mb-4 text-center">Un día fue un punto de inflexión y por primera vez me vi bien jodido.</p>
              <br />
              <br />
              <p className="mb-4">Hubo una actualización de meta ads (en ese momento todavía era Facebook ads) y según los nuevos cambios, mis anuncios no cumplían con las políticas.</p>
              <br />
              <p className="mb-4"><strong>Y me bloquearon el perfil.</strong></p>
              <br />
              <p className="mb-4">(aunque no sea tan brusco como el cambio que hubo en 2020, que se llevó muchas tiendas por delante, seguramente habrás notado que constantemente hay actualizaciones joden la publicidad que se hacía hasta la fecha) </p>
              <br />
              <p className="mb-4">No podía hacer publicidad con mi cuenta de Facebook, ni para mí ni para nadie.</p>
              <br />
              <p className="mb-4">Tenía que empezar de 0.</p>
              <br />
              <p className="mb-4">Me acosté una noche y cuando me desperté mi tienda <span className="underline">pasó de facturar más de 40.000€ al mes, a prácticamente 0€.</span></p>
              <br />
              <p className="mb-4">Me sentí hundido, pero no tanto por la tienda (que también), sino por sentirme un fracasado.</p>
              <br />
              <p className="mb-4">Un fracasado que le falló a su socio.</p>
              <p className="mb-4">Un fracasado que le falló a su empleada.</p>
              <p className="mb-4">Un fracasado que le falló a su familia.</p>
              <p className="mb-4">Un fracasado que se falló a si mismo.</p>
              <br />
              <p className="mb-4">Así me sentí.</p>
              <br />
              <p className="mb-4">Tuve que despedir a la chica que hacía el soporte al cliente.</p>
              <br />
              <p className="mb-4">Y mi socio y yo dejamos de cobrar porque los costes fijos se comían el beneficio. </p>
              <br />
              <p className="mb-4">Al final, entre el estrés, los nervios y la angustia, no fui capaz de remontar la situación…</p>
              <br />
              <br />

              <h2 className="text-xl font-bold text-center text-gray-900 mb-4">Tuve que cerrar la tienda y asumir el fracaso.</h2>
              <br />
              <br />

              <p className="mb-4">Los siguientes meses fueron unos meses muertos para mí.</p>
              <br />
              <p className="mb-4">Arruinado y sin poder seguir con mi tienda, me dediqué a analizar que podría haber hecho diferente.</p>
              <br />
              <p className="mb-4">Y después de mucho buscar, ver muchos videos, leer muchos libros… <span style={{ color: "#0067FD" }}><strong>encontré cuál fue el problema.</strong></span></p>
              <br />
              <p className="mb-4">Se lo escuché decir a Russell Brunson, y lo leí en su libro también.</p>
              <br /><br />

              <p className="mb-4 text-center"><em><span className="underline">"The money is in the list" </span></em></p>
              <br /><br />

              <p className="mb-4">que viene a decir que el dinero está en la lista.</p>
              <br />
              <p className="mb-4">En el mail.</p>
              <br />
              <p className="mb-4">En mi tienda captaba los mails de los clientes, si.</p>
              <br />
              <p className="mb-4">Y tenía varios flujos automáticos para recuperar carritos, pagos abandonados, dar la bienvenida y alguno que otro más.</p>
              <br />
              <p className="mb-4">También mandaba newsletters dos veces por semana. Con unas plantillas muy bonitas que compré, por cierto. </p>
              <br />
              <p className="mb-4">Pero solo me compraban cuando había descuento.</p>
              <br />
              <p className="mb-4"><strong>Era una lista "enferma".</strong></p>
              <br /><br />

              <p className="mb-4">Una lista que no compra si no hay descuento.</p>
              <p className="mb-4">Una lista que no es fiel a la marca. </p>
              <p className="mb-4">Una lista que solo es fiel a los descuentos.</p>
              <br /><br />

              <p className="mb-4"><span className="underline">No les importa la marca</span>, les importa el porcentaje que les vas a quitar.</p>
              <br />
              <p className="mb-4">Agregan al carro y esperan que les llegue su mail con descuento.</p>
              <br />
              <p className="mb-4">De Russell aprendí que hay que sacar al menos 1€ al mes por cada miembro de la lista.</p>
              <br />
              <br />

              <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ color: "#0067FD" }}>Ahora me parece poco.</h2>
              <br />
              <br />

              <p className="mb-4">Después de esta experiencia me obsesioné con la lista.</p>
              <br />
              <p className="mb-4">Con mis clientes lo primero que trabajo es sobre la lista. </p>
              <br />
              <p className="mb-4">Y después de mucho probar, tanto con clientes como con mi propia lista he llegado a una conclusión.</p>
              <br /><br />

              <p className="mb-4">No hay que ganar 1€ por cada miembro.</p>
              <br /><br /><br />

              <p className="mb-4 text-center"><em><strong>Hay que tener una lista que te permita vivir bien de tu tienda aunque todo deje de funcionar.</strong></em></p>
              <br /><br /><br />

              <p className="mb-4">Aunque la publicidad deje de funcionar.</p>
              <br />
              <p className="mb-4">Aunque publicar en redes deje de funcionar.</p>
              <br />
              <p className="mb-4">Sea verano o sea invierno.</p>
              <br />
              <p className="mb-4">Y que te compren des o no des descuento.</p>
              <br />
              <p className="mb-4">Hay que tener una lista fiel a la marca, que incluso si cambias de producto, o subes el precio, o cierras todo, quieran seguir comprándote.</p>
              <br />
              <p className="mb-4">Trabajando con clientes me he dado cuenta de que prácticamente todos descuidan su lista.</p>
              <br />
              <p className="mb-4">Ya sea por no trabajarla o por tenerla acostumbrada a descuentos.</p>
              <p className="mb-4"> </p>
              <p className="mb-4">Es muy probable que tu lista padezca algunos de estos "síntomas".</p>
              <p className="mb-4"> </p>
              <p className="mb-4">¿Quién no?</p>
              <p className="mb-4"> </p>
              <p className="mb-4">¿Crees que esas marcas que pueden parar la publi y vender solo por mail no pasaron por estos problemas al principio?</p>
              <p className="mb-4"> </p>
              <p className="mb-4">Tener una lista de email "sana" es difícil. Requiere trabajo y esfuerzo.</p>
              <br />
              <p className="mb-4">Lo positivo es que cualquiera de los dos casos tiene remedio, es por eso que con mis clientes aplico lo siguiente…</p>
              <br /><br />

              <ul className="mt-4 mb-2 space-y-6 list-none pl-0">
                {bulletsFirst.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#0067FD", minWidth: "20px" }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-bold text-center text-gray-900 mt-6 mb-4">Por cierto, todo esto, por supuesto que lo aplicamos por ti, no te va a llevar tiempo extra que podrás emplear en otras cosas.</h3>
              <img src="/images/prueba-social-raul.jpg" alt="Prueba social" className="w-full md:w-2/3 md:mx-auto block my-4 rounded" />

              <ul className="mt-4 mb-6 space-y-6 list-none pl-0">
                {bulletsSecond.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#0067FD", minWidth: "20px" }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <br />

              <h3 className="text-xl font-bold text-gray-900 mb-4">¿Podré dejar de tener que dar descuentos para que las personas de mi lista me compren?</h3>
              <br />
              <p className="mb-4">Si, por supuesto. El objetivo principal de este servicio es tener una lista sana y fiel, que te compre independientemente de la situación y sin necesidad de descuentos. Que te quieran comprar incluso si cambias de negocio y empiezas a vender otra cosa que no tenga nada que ver. No es algo inmediato, pero si es la acción más rentable que puedes hacer para tu tienda.</p>
              <br /><br />

              <p className="mb-4">Pide tu presupuesto aquí: </p>
              <br />
              <MailerLiteForm />
              <br /><br /><br />

              <h2 className="text-xl font-bold text-gray-900 mb-4">¿Qué incluye el servicio?</h2>
              <br />
              <p className="mb-4">Lo principal sobre lo que vamos a trabajar es el email marketing. Redactaremos y programaremos todos los mails (newsletters  periódicas y flujos) y los formularios de captación. Y también trabajaremos el copy de las fichas de producto de los productos que estemos vendiendo. <strong>Además</strong>, redactaremos un plan de acción trimestral para tener claridad en las acciones.</p>
              <br /><br />

              <h2 className="text-xl font-bold text-gray-900 mb-4">¿Cuánto dura el servicio?</h2>
              <br />
              <p className="mb-4">El servicio dura 3 meses. Es la mejor forma de arrancar para poder hacer una buena investigación y que obtengas los mejores resultados posibles. Después de estos 3 meses, seguiremos mes a mes y sin ningún tipo de permanencia.</p>
              <br /><br />

              <h2 className="text-xl font-bold text-gray-900 mb-4">¿Es muy caro? ¿Es barato?</h2>
              <br />
              <p className="mb-4">Es cierto, no es barato. No te voy a negar esa realidad. Nosotros primamos otras cosas muy por encima del precio. E invertimos en ello para dar una experiencia de cliente más especial. Mucha gente no valora eso y solo busca precio, lo respetamos, pero no es al público al que va dirigido este servicio.</p>
              <br /><br />

              <h2 className="text-xl font-bold text-gray-900 mb-4">¿Qué perfil de personas le sacarán mejor partido? </h2>
              <br />
              <p className="mb-4">Las personas que más partido le sacan al servicio son personas con una lista de cierto tamaño (más 5.000 personas) y que se encuentran en alguna de estas situaciones: a final de mes tus gastos fijos "se comen" tu beneficio o dependes de dar descuentos para vender o nunca has mandado mails a esa lista o los escribes con ChatGPT o piensas que "es que mis clientes no leen" o piensas que tu cliente o tu producto "es especial" y que tiene que ser tratada como si no hubiese humanos detrás de la pantalla donde leen y sobre todo, si tu facturación depende principalmente de la publicidad o de tu comunidad en redes sociales. En cualquiera de estos casos, si estás dispuesto a ponerle solución por supuesto, le sacarás mucho partido al servicio.</p>
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

              <p className="mb-4">Pide tu presupuesto aquí: </p>
              <br />
              <MailerLiteForm />
              <br /><br /><br />

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
