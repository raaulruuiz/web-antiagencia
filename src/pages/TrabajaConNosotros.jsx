import React, { useEffect } from "react";
import FooterMinimal from "@/components/landing/FooterMinimal";

const mailerLiteCSS = `
@import url("https://assets.mlcdn.com/fonts.css?version=1775464");
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

export default function TrabajaConNosotros() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = mailerLiteCSS;
    style.id = "mailerlite-css-trabajaconnosotros";
    document.head.appendChild(style);

    window.ml_webform_success_38800152 = function () {
      const $ = window.ml_jQuery || window.jQuery;
      if ($) {
        $('.ml-subscribe-form-38800152 .row-success').show();
        $('.ml-subscribe-form-38800152 .row-form').hide();
      }
    };

    fetch("https://assets.mailerlite.com/jsonp/686354/forms/182583896449222335/takel");

    const script = document.createElement("script");
    script.src = "https://groot.mailerlite.com/js/w/webforms.min.js?v95037e5bac78f29ed026832ca21a7c7b";
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-3xl">
          {/* Carta */}
          <div className="bg-white shadow-xl rounded-sm px-8 md:px-16 py-12" style={{ fontFamily: "'Georgia', serif" }}>

            <div className="text-gray-800 text-base leading-relaxed">

              <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 leading-tight mb-2">Así se están construyendo las marcas que van a dominar su mercado.</h1>
              <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 leading-tight mb-8">Y lo tienes a tu alcance</h1>

              <br />
              <p className="mb-4">Te voy a contar una breve historia sobre Old Spice, una marca que quizá no te suene pero seguro que conoces y te va a dejar dándole vueltas a la cabeza y replanteándote tu tienda online.</p>
              <p className="mb-4">Y probablemente, si prestas atención, la transforme para siempre.</p>
              <br /><br />
              <p className="underline mt-10 mb-4">Década de 1990</p>

              <p className="mb-4">Old Spice estaba al borde de la quiebra.</p>
              <p className="mb-4">Desde que se fundó en 1937 había sido la marca líder de perfume para hombre en todo Estados Unidos.</p>
              <p className="mb-4">Era la marca que usaban los soldados en la segunda guerra mundial.</p>
              <p className="mb-4">La que usaban los hombres en las fábricas.</p>
              <p className="mb-4">Los marineros.</p>
              <p className="mb-4">Los mecánicos.</p>
              <p className="mb-4">Representaba lo que era ser un hombre.</p>
              <p className="mb-4">Usabas sus fragancias y te llovían las mujeres.</p>
              <p className="mb-4">Su marketing siempre había sido ese. Ser un hombre y ligar con mujeres.</p>
              <p className="mb-4">Durante 50 años había sido la marca líder.</p>
              <p className="mb-4">Pero aún así estaba en quiebra.</p>
              <p className="mb-4">Puta madre, ¿qué pasó?</p>
              <br /><br />
              <p className="text-center font-bold text-lg mt-6 mb-8">Pues que los tiempos cambian y se convirtió en una marca para viejos.</p>

              <p className="mb-4">Ha pasado mil veces y seguirá pasando.</p>
              <p className="mb-4">No vendían a los jóvenes. Se los comían Axe y otras marcas que si llegaban bien a ellos.</p>
              <p className="mb-4">Había que tomar una decisión. Se sentaron y propusieron opciones.</p>
              <p className="mb-4"><strong>Al final decidieron contratar una agencia externa…</strong></p>
              <br />
              <p className="mb-4">…</p>
              <br />
              <p className="mb-4">Una marca con 50 años de vida, con un equipo enorme de marketing, unos grandes profesionales sobrecualificados y superformados que habían liderado el sector medio siglo… ¿iban a contratar una agencia? ¿estando al borde de la quiebra?</p>
              <p className="mb-4">Hubo varios en contra, discusiones, peleas, pero al final se tomó la decisión.</p>
              <br /><br />
              <h2 className="text-2xl md:text-3xl text-center text-gray-900 mt-10 mb-6">¿Qué llevó a Old Spices a contratar una agencia?</h2>

              <p className="mb-4">A ver.</p>
              <p className="mb-4">Con lo que estaban haciendo, con su equipo interno, llevaban años perdiendo dinero cada año…</p>
              <p className="mb-4">Haciendo campañas que cada vez venden menos…</p>
              <p className="mb-4">Hablándole al mismo público… de la misma forma…</p>
              <br />
              <p className="mb-4"><strong>Ya sabes, el mercado avanza más rápido que las empresas, es muy difícil estar al día con todo.</strong></p>
              <br />
              <p className="mb-4">Estaban, sin exagerar, tiritando, al borde de la quiebra.</p>
              <p className="mb-4">Fue entonces cuando decidieron buscar ayuda, no dentro, fuera (una agencia).</p>
              <p className="mb-4">Lo que significaba una visión distinta (de alguien que ha visto más sectores)</p>
              <p className="mb-4">Al final les salía más económico que invertir en formarse y hacer que el equipo sea capaz de realizar ese trabajo de empaparse de lo que se hace en otros sectores.</p>
              <p className="mb-4">Y era más rápido (y lo necesitaban rápido).</p>
              <br /><br />
              <p className="mb-4">En otras palabras, contratar una agencia, estés en el sector que estés te aporta una visión más amplia que tu propio sector, conocimientos más actualizados y más velocidad y agilidad.</p>
              <p className="mb-4">Es su negocio.</p>
              <p className="mb-4">Es evidente.</p>
              <p className="mb-4">Okay,</p>
              <p className="mb-4">El caso es que decidieron contratar a Wieden+Kennedy, una de las agencias más prestigiosas del mundo y responsable de grandes campañas de grandes marcas como Nike o Coca Cola.</p>
              <br />
              <p className="mb-4"><strong>Obviamente les costó una pasta. Pero mereció la pena.</strong></p>
              <br /><br />
              <p className="mb-4">La nueva agencia ya sabía una cosa que ellos no, y es que los productos de aseo para hombres los compraban las mujeres.</p>
              <p className="mb-8">Así que cambiarían el público e irían a por las mujeres ahora. Y subirían los precios, para ser más rentables.</p>
              <br /><br />
              <p className="mb-4">También hicieron anuncios <strong>diferentes</strong>, que llamaban la atención (contrataron a Isaiah Mustafa, un negro cachas y guapo, obviamente llamaba la atención de las mujeres).</p>
              <p className="mb-4">Eran anuncios bizarros, un poco absurdos incluso, pero llamaban la atención y hacían reir.</p>
              <br /><br />
              <p className="mb-8">Y también se <strong>diferenciaron</strong> en el canal. Si querían llegar a los jóvenes tenían que ir donde estaban los jóvenes. A las redes sociales.</p>

              <br />
              <p className="text-center font-bold mt-6 mb-2">¿El resultado?</p>
              <p className="text-center mb-2">Lo petaron. Viralidad. Éxito. Dinero.</p>
              <p className="text-center mb-8">En un mes, Old Spice, con su nueva agencia, se había convertido en la marca más vista en YouTube de toda la historia.</p>
              <br />

              <p className="mb-4">Hizo más de 186 anuncios con Isaiah, en una época en la que era más difícil que ahora. <strong>Testearon</strong>.</p>
              <p className="mb-4">Luego ampliaron público de nuevo a hombres y esta vez trajeron a Terry Crews, un exjugador de rugby (otro negro cachas pero esta vez superaba el umbral de cachas donde dejas de atraer mujeres y empiezas a atraer hombres)</p>
              <br />
              <p className="mb-8"><strong>Y siguieron innovando. Y haciendo las cosas distintas.</strong></p>
              <p className="mb-4">Quizá te suenen los anuncios que han hecho en España, como "Los hombres de San Ildefonso" o el de "Huele como un tío, tío"</p>
              <br /><br />

              <p className="mb-4"><span style={{ color: "#0067FD" }} className="font-bold">Dicho esto</span> <strong>toda marca que sepa aplicar (BIEN) la diferenciación (con la ayuda de una agencia) será una marca más rentable.</strong></p>
              <p className="mb-2"><strong>Y toda marca lo puede aplicar.</strong></p>
              <p className="mb-8"><strong>Y en estos años, está al alcance de cualquiera.</strong></p>

              <br />
              <p className="text-center mb-8">Así es como se construyen las marcas que van a dominar su mercado, ya sea una empresa millonaria o de una marca pequeña que vende desde su casa.</p>
              <br />

              <p className="mb-4">Da igual que vendas ropa, suplementos, cosmética, destornilladores o abono para plantas.</p>
              <p className="mb-4">Se calcula que externalizar el marketing de una empresa es <strong>8 veces más barato</strong> que montar un equipo de marketing interno.</p>
              <p className="mb-4">Es decir, <strong>externalizar, ahorrar tiempo y dinero</strong>, es lo que permite a las marcas <strong>crecer</strong>, estén en el punto en el que estén.</p>
              <p className="mb-4">No solo porque vas a trabajar menos, que lo harás.</p>
              <p className="mb-4">O porque vayas a ganar más, que lo harás.</p>
              <p className="mb-8">Es que, posiblemente, sea la forma más inteligente, rentable y rápida de crecer, con las ventajas de mantener tus costes de equipo bajos que pueda dar a todo negocio.</p>
              <br /><br />
              <p className="mb-4">Y te aseguro que <span style={{ color: "#0067FD" }} className="font-bold">sé de lo que hablo</span></p>
              <p className="mb-4">Desde 2023 que tengo mi agencia, hemos invertido más de 1 millón de euros para nuestros clientes y hemos retornado más de 5 millones de vuelta.</p>
              <p className="mb-4">Y eso sin contar los clientes a los que he asesorado como consultor o mis propias tiendas online.</p>
              <p className="mb-4">Quiero decir, sé muy bien como hacer que una tienda online escale. He visto cientos de tiendas en decenas de sectores, y no solo eso, lo he hecho para mí mismo, sé lo que es poner mi propio dinero en juego.</p>
              <p className="mb-4"><strong>Sé como hacer una tienda online muy rentable y las he visto en todos los sectores.</strong></p>
              <p className="mb-4">Y no, no te voy a dar ninguna garantía ni ninguna promesa concreta. Eso son herramientas para que bajes la guardia y venderte algo que probablemente no te va a ayudar.</p>
              <p className="mb-4">Así que, por respeto a tu inteligencia, no lo voy a hacer. Lo que haré, será esto.</p>
              <p className="mb-6">Te cuento para que lo veas con calma.</p>
              <br />
              <p className="mb-4"><strong>Ahí tienes:</strong></p>

              <ul className="mt-4 mb-6 space-y-4 list-none pl-0">
                {[
                  <><strong>El error más común</strong> que comenten las tiendas online (hasta gente muy conocida) que impide el crecimiento de la tuya</>,
                  <><strong>El primer paso que hay que dar</strong> en toda tienda online antes de plantear ni una estrategia para que hagas lo que hagas funcione. SIEMPRE.</>,
                  <>La <strong>preparación previa de los surfistas</strong> que nos permitirá ganar más dinero bajando presupuestos.</>,
                  <><strong>Planificación</strong>. Aquí está todo, sin esto, mueres.</>,
                  <>Lo que aprendí de Amazon para que vendas más y <strong>evites que la gente se aburra</strong> navegando por tu página.</>,
                  <>La forma en la que <strong>nunca deberías poner tus ofertas cruzadas</strong> y que veo una y otra vez haciendo imposible que nadie te las compre.</>,
                  <><strong>El truco de los supermercados</strong> para venderte cosas que nunca pensaste en llevarte pero que mejora la experiencia del cliente.</>,
                  <>"Truco" altamente rentable e irresistible <strong>para que te compren mas</strong> que descubrió un americano católico.</>,
                  <>¿Hay productos que no te quitas ni pagando? La mejor forma de venderlos, tanto estos como cualquier producto y que <strong>es tan poco común que la hace altamente rentable.</strong></>,
                  <>Diferentes formas de <strong>entretener a tu cliente mientras compra</strong> para que tu marca se quede grabada en su mente.</>,
                  <>Lo que saben los del trading que tú no para <strong>manejar anuncios mejor que cualquier media buyer</strong>.</>,
                  <>Lo que me enseñó un calvo barbón, que se critica mucho, pero que es muy eficaz y <strong>si no tienes miedo te hará ganar mucho con tu tienda</strong>.</>,
                  <><strong>Cómo hacer anuncios para que absolutamente nadie les preste atención</strong> (lo que hace la mayoría) y cómo resolverlo.</>,
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#0067FD", minWidth: "20px" }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <img src="https://media.base44.com/images/public/697678eac9cf34e2aefb7d57/0061dfecb_375433225_983597182754607_3041268400962209270_njpg_efgeyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0_nc_htscontent-nrt1-1cdninstagramcom_nc_cat103_nc_ocQ6cZ2QG8JoswV4MRy67QCc6UBMuINwhT7F-smSCHW2fCspuT9GRVX1JSe9oly3wDBPQH55k_nc_.png" alt="Raúl presentando" className="w-full md:w-1/2 rounded-lg my-6 mx-auto block" />

              <ul className="mb-10 space-y-4 list-none pl-0">
                {[
                  <>Lo que podemos aprender de los huevos kinder para <strong>no tener que competir por precio y cobrar más caro</strong> que nuestros competidores (aunque creas que en tu sector no se puede).</>,
                  <>Como hacer que tu cliente <strong>te adore, te compre y te recompre y le de mas valor a tu marca</strong> que a las de la competencia (porque TODAS comenten este error).</>,
                  <><strong>Alternativa fitness a las promociones flash.</strong></>,
                  <>¿Envias tu producto? Hay <strong>2 oportunidades que probablemente no estás aprovechando</strong> y te están costando miles de euros.</>,
                  <><strong>Si nunca has mandado emails a tus clientes no lo hagas</strong>, al menos sin saber esto.</>,
                  <><strong>Lo que jamás debes hacer para recuperar compras</strong>. Siento decirte que, posiblemente, lo estés haciendo o lo pienses hacer.</>,
                  <>Si tienes familia, hay algo que debes aplicar en tu tienda y que <strong>casi nadie hace.</strong></>,
                  <>Lo que aprendo <strong>directamente desde las oficinas de Meta</strong> para que tus campañas funcionen mucho mejor.</>,
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#0067FD", minWidth: "20px" }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="my-10 text-center">
                <p style={{ color: "#0067FD" }} className="font-bold text-lg mb-2">ATENCIÓN, QUE ESTO NO ACABA AQUÍ</p>
                <p className="font-bold mt-2">Obviamente no te tienes que preocupar por nada de lo de arriba, lo hacemos todo por ti.</p>
                <br />
                <p className="font-bold mt-2">Pero, además, te producimos anuncios. No todos. Pero podemos hacer anuncios UGC, imágenes y vídeos con IA y te editamos todo lo que tu grabes (que también te hacemos los guiones).</p>
                <br />
                <p className="font-bold mt-2">Y además, donamos un 10% de todo lo que nos pagas a causas en las que creemos (más información en las preguntas frecuentes).</p>
                <br />
              </div>

              <h2 className="text-lg font-bold text-center mt-10 mb-8" style={{ color: "#000000" }}>Preguntas interesantes y rondantes</h2>

              <h3 className="font-bold text-xl mt-12 mb-2">¿Qué incluye?</h3>
              <p className="mb-4">Casi todo. Es decir, lo vamos a hacer casi todo por ti, pero hay cosas que tienes que hacer. Como preparar los pedidos, subir los productos a la página, publicar en orgánico, grabarte vídeos, pero lo de marketing sí lo hacemos todo. <strong>Además</strong> te hacemos los guiones, te editamos los vídeos y te podemos producir material UGC y con IA en caso de que lo necesitemos. Y donamos el 10% de lo que nos pagas a causas en las que creemos.</p>

              <h3 className="font-bold text-xl mt-12 mb-2">¿Cómo es el proceso de trabajo?</h3>
              <p className="mb-4">Primero vamos a estudiar el mercado, tu negocio, tus competidores, a ti. <strong>Nos vamos a empapar, necesitamos saber</strong>. Con eso te haremos un planteamiento de trabajo. Eso será la primera semana. A partir de ahí empezamos a ejecutar. Somos bastante rápidos porque somos 6 en el equipo.</p>
              <br />
              <p className="mb-4"><strong>Nos comunicaremos por un grupo de whatsapp</strong>, donde estará todo mi equipo y el tuyo. También podemos comunicarnos por mail si lo prefieres así. Las reuniones las haremos cuando sean necesarias. No me importa tener varias a la semana si es preciso.</p>
              <br />
              <p className="mb-8">También <strong>nos harás caso</strong>. Nosotros somos los profesionales y nos contratas para hacerte un trabajo profesional, por lo que harás lo que te pidamos, y si haces algún cambio nos lo tendrás que comunicar. No nos gusta perder el tiempo y tampoco te lo queremos hacer perder a ti, por lo que sí proponemos algo que será bueno para la tienda, se hace, si no, contrata un consultor o un freelance.</p>

              <h3 className="font-bold text-xl mt-12 mb-2">¿Si ya tengo equipo u otra agencia, me sirve?</h3>
              <p className="mb-8">Si, no nos importa trabajar en equipo, pero el precio es el mismo.</p>

              <h3 className="font-bold text-xl mt-12 mb-2">¿El servicio es para mi?</h3>
              <p className="mb-4">Nosotros NO vamos a ser la agencia que te lleve a los 10.000€ al mes, para eso puedes buscar algún curso, freelance o consultora.</p>
              <p className="mb-4">Nosotros queremos ser lo que te lleven de ahí a 100.000€ - 200.000€ - 500.000€ al MES.</p>
              <p className="mb-8">Si ya superas el millón al mes, tampoco somos tu agencia.</p>

              <h3 className="font-bold text-xl mt-12 mb-2">¿Cuándo empezaremos?</h3>
              <p className="mb-4">Cuando pidas presupuesto aquí abajo, le echaré un ojo a tu tienda y valoraré si me interesa. Luego te contactaré, para avisarte que no me interesa o para mandarte un presupuesto. Trato de responder en menos de 24 horas, pero a veces tardo más, sobre todo si te mando presupuesto.</p>
              <p className="mb-4"><strong>Si no rellenas todos los datos que te pido, no te contactaré y si alguno es inventado, tampoco.</strong></p>
              <p className="mb-4">Una vez aceptes el presupuesto, hayamos firmado el contrato y tengamos el justificante de pago, empezaremos a trabajar y cuadraremos la primera reunión.</p>
              <p className="mb-8">Me gusta dedicar el tiempo necesario a cada cliente, por ello, es posible que cuando pidas tu presupuesto no te pueda dar una fecha de inicio inmediata y tengas que esperar algunas semanas para que empecemos a trabajar.</p>

              <h3 className="font-bold text-xl mt-12 mb-2">¿Qué es eso de que donas el 10% de lo que te pague?</h3>
              <p className="mb-4">Exacto, hay proyectos en los que creemos y los que queremos apoyar. Por ello, en el formulario de abajo, vas a poder seleccionar entre las causas que apoyamos para que la parte correspondiente a tus pagos vaya ahí.</p>
              <p className="mb-4"><strong>Cada vez que recibamos un pago por tu parte, te enviaremos un comprobante de la donación correspondiente.</strong></p>
              <p className="mb-8">Actualmente colaboramos con dos causas principales: investigación contra el cáncer y protectoras de animales.</p>

              <h3 className="font-bold text-xl mt-12 mb-2">¿Qué precio tiene? ¿Se puede pagar a plazos? ¿Hay garantías?</h3>
              <p className="mb-4">Antes era un pago único y luego 100% a éxito, pero ya no. Ahora es un <strong>fijo + una comisión del 5% de lo que nosotros generemos</strong>, no lo que tú ya venías haciendo. El modelo seguirá haciéndose más caro con el tiempo, por lo que si te interesa, pide presupuesto.</p>
              <p className="mb-4"><strong>La comisión no se puede quitar.</strong> Cuanto más creces más recursos tengo que emplear y si quieres un buen servicio no puedo tener 200 clientes, tengo que tener pocos, y para eso tengo que cobrar bien. Muy bien.</p>
              <p className="mb-4">Tampoco te llevaré a una llamada de venta con un comercial para que trate de hipnotizar y venderte a toda cosa. No. <strong>Te mandaré un presupuesto, y si tienes dudas, hablarás conmigo.</strong></p>
              <p className="mb-4"><strong>No se pueden fraccionar los pagos,</strong> el fijo se cobra a principio de mes, y la comisión al final.</p>
              <p className="mb-8">Y <strong>no hay garantías</strong>. Las garantías son para los que no confían en su trabajo y te quieren vender a toda costa.</p>

              <p className="mb-6">Si te interesa, pide presupuesto aquí:</p>

              {/* MailerLite Form */}
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
                                <option>Mariano Barbacid (Investigación contra el cáncer de páncreas)</option>
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

              <div className="mt-10 pt-8 border-t border-gray-200">
                <p className="mb-4"><strong>PD:</strong> ¿Y si es verdad que cualquier tienda puede delegar el marketing (lo verás dentro) y eso realmente marque la diferencia? ¿Y si es verdad que no hay nada más rentable para una tienda online? ¿Dejarás pasar seis meses? ¿Un año? ¿Vas a dejar que tus competidores sigan creciendo y viviendo de puta madre mientras tú esperas otra gran oportunidad, otra promesa de éxito rápido? Así se están construyendo las grandes marcas de nuestro tiempo.</p>
                <p className="mb-4">Este servicio tiene TODO lo que necesitas para escalar sin dedicarle más tiempo del que ya te lleva, sea cual sea tu sector. Todo lo haremos por ti, para ti. En definitiva, ¿y si saber hacer (BIEN) el marketing, cambia tu tienda?</p>
                <br /><br />
                <p className="mb-2">Pasa un buen día.</p>
                <p className="mb-8">Raúl.</p>

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
      </div>

      <FooterMinimal />
    </div>
  );
}
