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

export default function TrabajaConNosotrosOld() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = mailerLiteCSS;
    style.id = "mailerlite-css-trabajaconnosotros-old";
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
    script.src = "https://groot.mailerlite.com/js/w/webforms.min.js?v95037e5bac78f29ed026832ca21a7c7b";
    script.type = "text/javascript";
    script.id = "mailerlite-script-trabajaconnosotros-old";
    document.body.appendChild(script);

    return () => {
      const css = document.getElementById("mailerlite-css-trabajaconnosotros-old");
      if (css && css.parentNode) css.parentNode.removeChild(css);
      const scr = document.getElementById("mailerlite-script-trabajaconnosotros-old");
      if (scr && scr.parentNode) scr.parentNode.removeChild(scr);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-3xl">
          <div className="bg-white shadow-xl rounded-sm px-8 md:px-16 py-12" style={{ fontFamily: "'Georgia', serif" }}>
            <div className="text-gray-800 text-base leading-relaxed">

              <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 leading-tight mb-6">Tío, la IA ha DESTRUIDO mi agencia…</h1>

              <div className="flex justify-center my-8">
                <img
                  src="/images/trabajaconnosotros-old-hero.png"
                  alt="Un mono mirando el móvil"
                  className="rounded-lg max-w-full md:max-w-md shadow-md"
                />
              </div>

              <h3 className="text-xl font-normal mb-4">Pero gracias a eso ahora es más humana que nunca.</h3>

              <br /><br />

              <p className="mb-4">No, no he dejado de dar servicio. Y tampoco lo hago todo con IA, eso es de pardillos que no saben de marketing jajaja.</p>
              <br />
              <p className="mb-4">Lo que he hecho ha sido simplificar el negocio. Nos hemos quedado solo Pili y yo, tu sabes… el equipo es un coste bien alto.</p>

              <br /><br /><br />

              <p className="mb-4">Claro tío, cualquier marca puede hacer ya la parte técnica con IA, ya estoy viendo marcas que están despidiendo a sus agencias y a sus empleados, entonces lo que estamos haciendo es centrarnos solo en la parte humana.</p>
              <br />
              <p className="mb-4">La IA trabaja muy bien, pero pensar… sigue siendo mejor que lo hagamos nosotros.</p>

              <br /><br /><br />

              <p className="mb-4">Jajaja, si si, ahora ves en todas las tiendas textos que están escritos por chatgpt y se nota a kilómetro.</p>

              <br /><br /><br /><br />

              <p className="mb-4">No cabrón, no me compares con una consultora. Que nosotros no hacemos promesas de dinero rápido ni metemos a todos los clientes en clases grupales ni mierdas de esas.</p>
              <br />
              <p className="mb-4">Eso es un engañabobos.</p>

              <br /><br />
              <br />

              <p className="mb-4">Si, te cuento. Lo que hacemos es tratar de traernos lo&nbsp; mejor de los dos mundos, es decir, que no tengas que pagar el sobrecoste del personal de la agencia, pero tampoco te damos estrategias genéricas como las consultoras.</p>
              <br />
              <p className="mb-4">Lo que te damos es toda la estrategia ya hecha. Y cuando te digo hecha es hecha… solo tienes que copiar y pegar.</p>

              <br /><br /><br />

              <p className="mb-4">No no no, ni chatgpt ni pollas, lo escribimos todo a mano Pili y yo, por eso te digo que ahora nuestra agencia es mas humana que nunca. Es cierto que no te lo montamos, que entre tu y yo, eso es lo más fácil una vez lo tienes todo escrito, y ahí si te puedes apoyar en la IA. Si quieres, luego te enseño o te lo monto, pero te lo cobro jeje.</p>
              <br />
              <p className="mb-4">Mira, las primeras dos semanas desde que nos contratas son investigación. Te pedimos datos, nos reunimos contigo, miramos amazon, tu competencia, hablamos con los viejos del pueblo, hasta vamos a verte.</p>

              <br /><br /><br />

              <p className="mb-4">Como lo oyes, te visitamos para ver tu negocio por dentro. Eso son las primeras dos semanas.</p>
              <br />
              <p className="mb-4">Y con eso te preparamos una carpeta con varios dossieres con el planning para los próximos 3 meses, en total son más de 100 páginas de contenido. Todo personalizado y escrito a mano, para tu tienda.</p>

              <br /><br /><br />

              <p className="mb-4">Jajaja si si, estamos algo locos, pero creo que ahora con todo el ruido que hay, lo que destaca es ser natural y diferente al resto. Si quieres un más de lo mismo te vas a cualquier consultoría que te garantice 30k en 3 meses jajajaja.</p>

              <br /><br /><br />

              <p className="mb-4">Claro tío, es lo mismo que antes, web, mails y ads. Lo único que te lo damos todo escrito y te lo montas tú. Además luego estará Pili dando porculo para que cumplas plazos.</p>

              <br /><br />
              <br />

              <p className="mb-4">¿Cómo que si hacemos más? Hombre… no esperarás que te lo de y te deje a tu aire, que esto no es un cursito, sigue siendo un servicio.</p>
              <br />
              <p className="mb-4">Después de las dos primeras semanas, cuando te entreguemos todo el material, nos aseguramos de que lo implementas, y te analizamos los resultados. Todas las semanas te pasamos un informe por escrito y por vídeo de todas las métricas de la web, los anuncios y los emails.</p>
              <br />
              <p className="mb-4">Y si hace falta reunirse, pues nos reunimos.</p>

              <br /><br /><br />

              <p className="mb-4"><strong className="text-[#0067FD]">Si, mira, te resumo,</strong> es como si fuesen 3 fases, la primera es la investigación. No podemos hacer cosas distintas si no entendemos bien tu tienda, tu cliente, tu competencia y tu mercado. La segunda es la chica, más de 100 páginas de dossieres, ahí te damos</p>
              <br />
              <p className="mb-4">- Un análisis de lo que ya tienes en la web, los emails y los anuncios versus lo que hace la competencia y cómo mejorarlo para diferenciarte de ellos y vender más. </p>
              <br />
              <p className="mb-4">- Ah, y también nos metemos en mirar tus márgenes, ya sabes que una estrategia que no se adapte a tus márgenes no vale de nada… al final de mes quieres beneficio, no facturar mucho pero perder pasta.</p>
              <br />
              <p className="mb-4">- Toda la estrategia y la propuesta de cambios, con los textos escritos para que copies y pegues, las secciones que tienes que crear o cambiar en la web y como hacerlo, los mails escritos, todos, y creeme que no son pocos… para que solo copies y programes las campañas. Obviamente los flujos y los formularios también. </p>
              <br />
              <p className="mb-4">- Y los anuncios. Te damos todos los cambios que tienes que hacer de estructura en la cuenta, que campañas montar, que configuración ponerle, que anuncios meter en cada una, con ejemplos para que no te cueste nada hacerlos, reglas de cuando parar, cuando escalar… aunque esto como luego vamos a estar encima, te iremos avisando.</p>
              <br />
              <p className="mb-4">- Y por supuesto, un plan trimestral. Te preparamos por avanzado los próximos tres meses, con las distintas promos, que días te conviene gastar más en anuncios, ejemplos de promociones que funcionan, y sin hacer descuentos, que así ganas mas.</p>
              <br />
              <p className="mb-4">- Claro, claro, los plazos también. No tiene sentido que te diga y te de todo lo que tienes que hacer si no te digo para cuando lo tienes que tener, que si no luego te pilla el toro. Y ya te digo, vamos a estar muy encima para que cumplas jajaja.</p>

              <br /><br /><br />

              <p className="mb-4">Si si, esto solo es la segunda fase. La tercera sería revisarlo todo. Esto te diría que es lo más importante… Estar en el día a día. Cada semana te pasaremos el informe analizando los resultados y por supuesto si algo falla, lo corregimos, faltaría más. De hecho en los dossieres ya te metemos plan A y plan B por si algo no funciona, pero igualmente estamos en el día a día controlando.</p>

              <br /><br /><br />

              <p className="mb-4"><strong className="text-[#0067FD]">¿Que si esto funciona?</strong> Joder si funciona, no ves la cantidad de tiendas que hay haciendo exactamente lo mismo? Con nada que te diferencies un poco los barres a todos.</p>
              <br />
              <p className="mb-4">Lo he visto mil veces en los 7 años que llevo en le marketing online. Coño, lo hice yo con mi propia tienda…</p>

              <br /><br />
              <br />

              <p className="mb-4">Si, la de termómetros infrarrojos. Si hasta a ti te vendí uno jeje. Así pasamos de 0 a más de 150.000€ en tres meses. Hay que hacer las cosas distintas tío.</p>
              <br />
              <p className="mb-4">Mira, cuando trabajé en la consultora, la estrategia que nos hacían darle a los clientes era la misma… así normal que ni dios tenga resultados, si luego se tenían que buscar ellos la vida.</p>

              <br /><br />
              <br />

              <p className="mb-4">Claro, me fui por eso, yo paso de que luego piensen que era yo el que ponía la estrategia jajaja. Prefiero diseñartela 1 a 1, te doy todo y tu ya te lo montas. Así es como debe ser. Y luego te acompaño 3 meses para asegurarme que lo haces bien, bueno, tú o tu equipo.</p>

              <br /><br />
              <br />

              <p className="mb-4">Y hazme caso que no te lleva apenas tiempo. Lo sabes por experiencia, lo que lleva tiempo es pensar que hacer, escribirlo todo, plantear los anuncios… si lo tienes todo, montarlo es rápido.</p>

              <br /><br />
              <br />

              <p className="mb-4"><strong className="text-[#0067FD]">¿Que qué hacemos diferente?</strong> Ostias pues mira estas son algunas de las cosas que se salen de lo normal y que solemos aplicar y funcionan de puta madre no, lo siguiente…</p>
              <br />
              <ul className="list-disc pl-6 mb-6 space-y-3">
                <li>La estrategia que aprendimos de los mejores marketers muertos para <strong>vender cualquier producto</strong> aunque ahora mismo no te lo compre ni tu madre.</li>
                <li><strong>Lo primero que debemos evitar a la hora de mandar un mail</strong>. </li>
                <li>Cómo automatizar con IH (Inteligencia Humana) tus mensajes <strong>para que resuenen y vendan más</strong>.</li>
                <li>Lo que aprendimos de la historia para contar historias que <strong>hará que tu tienda haga historia</strong>.</li>
                <li>Cómo hacer que tus clientes <strong>te vuelvan a comprar en cuestión de días</strong> gracias a la estrategia del ratoncito pérez.</li>
                <li><strong>Cómo manejar los anuncios como un trader criptobro</strong>, que lo hace mejor que el 90% de los mediabuyers.</li>
                <li>Una forma de <strong>estar constantemente en la mente de la gente</strong> y que nos compren todo lo que tenemos.</li>
                <li><strong>Evitamos el error</strong> (que todo el mundo comete) que hace que aunque vendas más tu marca sea cada vez menos valiosa.</li>
                <li><strong>Si nunca mandaste un mail a tu lista, no lo hagas</strong>. Primero tenemos que hacer una cosa.</li>
                <li>Lo que aprendí en el supermercado sobre <strong>cómo venderle más a la misma persona</strong> (aunque no quisiese comprar se verá atraído como polilla a la luz, y te lo agradecerá).</li>
                <li>Cómo <strong>vender más que tus competidores</strong> aunque vendas exactamente el mismo producto y sea hasta más caro.</li>
                <li>Si tienes familia <strong>hay algo que sabes que no debes hacer</strong> pero probablemente lo estás haciendo (le pasa a muchas tiendas).</li>
                <li><strong>Cómo, dónde, cuándo, por qué y para qué usar los descuentos</strong>.</li>
                <li>Y muchas más estrategias que van muriendo y que van surgiendo.</li>
              </ul>

              <br /><br /><br /><br /><br />

              <p className="mb-4">¿Que si hay más? Cabrón, te parece poco? Pero sí, </p>
              <br />
              <h3 className="text-center text-xl font-normal my-4">TODAVÍA HAY MÁS.</h3>
              <br />
              <p className="mb-4">Cómo te conté el otro día, el 10% de lo que nos pagas, lo donamos a causas benéficas en las que creemos y con las que queremos colaborar.</p>
              <br />
              <p className="mb-4">Cada vez que nos pagas, donamos a la causa que hayas elegido, y si no eliges ninguna, a la que nosotros queramos, y te mandamos un comprobante de haberlo hecho.</p>
              <br />
              <p className="mb-4">Así aportamos nuestro grano de arena tío, que para algo montamos un negocio.</p>

              <br /><br /><br /><br />

              <p className="mb-4"><strong className="text-[#0067FD]">¿Tienes más dudas o te puedo vender ya?</strong></p>
              <br />
              <p className="mb-4">Bueno venga, te las respondo…</p>
              <br />

              <h4 className="font-bold text-lg mt-4 mb-2">¿Qué incluye?</h4>
              <p className="mb-4">Todo. Es decir, te vamos a dar el planning para los próximos 3 meses, con las promociones, los mejores días para invertir más para tu tienda en concreto, un análisis de tus competidores y cómo diferenciarte (con creatividad) de ellos. Te vamos a dar varios dossieres con TODO, para que solo copies y pegues, y no te lleve más de 5 minutos implementar, y vamos a estar ahí para asegurarnos que lo haces y para analizarte los resultados y ayudarte a tomar las decisiones (o tomarlas por tí). <strong>Además</strong> donamos un 10% de lo que nos pagas a causas benéficas.</p>
              <br />

              <h4 className="font-bold text-lg mt-4 mb-2">¿Cómo es el proceso de trabajo?</h4>
              <p className="mb-4">Se puede separar en 3 "fases". La primera es investigar a fondo, TODO, para que no seas un "más de lo mismo" (2 semanas). La segunda es implementar. </p>
              <p className="mb-4">Te damos los dossieres para que copies y pegues y te controlamos para que lo hagas. Y la tercera es el análisis de resultados. Semanalmente te analizamos todos los resultados y te compartimos un informes con los próximos pasos a seguir. </p>
              <p className="mb-4">Esto es así durante 3 meses. Luego, puedes renovar.</p>
              <p className="mb-4">Ahora, que nos hagas caso o no, depende de ti… pero cobrar, cobramos igual.</p>
              <br />

              <h4 className="font-bold text-lg mt-4 mb-2">¿Si ya tengo equipo u otra agencia, me sirve?</h4>
              <p className="mb-4">Si, si tienes alguien que ejecute por ti, de puta madre, eso que te ahorras.</p>
              <br />

              <h4 className="font-bold text-lg mt-4 mb-2">¿El servicio es para mi?</h4>
              <p className="mb-4">Nosotros NO vamos a ser la agencia que te lleve a los 10.000€ al mes, para eso puedes buscar algún curso, freelance o consultora grupal.</p>
              <p className="mb-4">Nosotros queremos ser lo que te lleven de ahí a 100.000€ - 200.000€ - 500.000€ y más al MES.</p>
              <br />

              <h4 className="font-bold text-lg mt-4 mb-2">¿Cuándo empezaremos?</h4>
              <p className="mb-4">Cuando pidas presupuesto aquí abajo, le echaré un ojo a tu tienda y valoraré si me interesa. Si no me interesa el proyecto, te lo comunicaré por mail, y si me interesa, te llamará para hablar y pedirte más detalles. Y con eso te mandaré un presupuesto.</p>
              <p className="mb-4">Si no rellenas todos los datos que te pido, no te contactaré y si alguno es inventado, tampoco.</p>
              <p className="mb-4">Una vez aceptes el presupuesto, hayamos firmado el contrato y tengamos el justificante de pago, empezaremos a trabajar y cuadraremos la primera reunión.</p>
              <br />

              <h4 className="font-bold text-lg mt-4 mb-2">¿Qué es eso de que donas el 10% de lo que te pague?</h4>
              <p className="mb-4">Exacto, hay proyectos en los que creemos y los que queremos apoyar. Por ello, en el formulario de abajo, vas a poder seleccionar entre las causas que apoyamos para que la parte correspondiente a tus pagos vaya ahí.</p>
              <p className="mb-4">Cada vez que recibamos un pago por tu parte, te enviaremos un comprobante de la donación correspondiente.</p>
              <p className="mb-4">Actualmente colaboramos con dos causas principales: investigación contra el cáncer y protectoras de animales.</p>
              <br />

              <h4 className="font-bold text-lg mt-4 mb-2">¿Qué precio tiene? ¿Se puede pagar a plazos? ¿Hay garantías?</h4>
              <p className="mb-4">
                Te va a costar más que cualquier consultora de esas de las promesas concretas, más que cualquier agencia de mierda y menos que las buenas agencias.<br /><br />
                No se puede pagar a plazos.<br /><br />
                Y respecto a la garantía, voy a tomar prestadas las palabras de un gran marketer: "Si me preguntas eso, la única garantía que te puedo dar es que no quiero trabajar contigo"
              </p>
              <br />

              <p className="mb-4">Si te interesa, pide presupuesto aquí:</p>
              <br />

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

              <br />

              <p className="mb-4"><strong>PD:</strong> ¿Y si es verdad que puedes llevar a cabo una estrategia diferente y eso realmente marque la diferencia? ¿Y si es verdad que no hay nada más rentable para una tienda online? ¿Dejarás pasar seis meses? ¿Un año? ¿Vas a dejar que tus competidores sigan creciendo y viviendo de puta madre mientras tú esperas otra gran oportunidad, otra promesa de éxito rápido? Así es como crecen las grandes marcas.</p>
              <br />
              <p className="mb-4">Este servicio tiene TODO lo que necesitas para escalar sin dedicarle más tiempo del que ya te lleva (de hecho te lleva menos porque te ahorras el pensar), sea cual sea tu sector. Todo lo haremos para ti, personalizado. En definitiva, ¿y si saber hacer (BIEN) el marketing, cambia tu tienda?</p>

              <br /><br /><br />

              <p className="mb-4">Pasa un buen día.</p>
              <br />
              <p className="mb-8">Raúl.</p>

              <div className="flex items-center justify-center gap-4 mt-8 pt-8 border-t border-gray-200">
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
