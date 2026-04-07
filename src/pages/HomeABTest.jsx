import React, { useEffect } from "react";
import { useABTest, trackConversion } from "@/lib/useABTest";
import FooterMinimal from "@/components/landing/FooterMinimal";

const TEST_ID = "home-cta";
const TEST_URL = "/";

const mailerLiteCSS = `
@import url("https://assets.mlcdn.com/fonts.css?version=1773928");
.ml-form-embedSubmitLoad{display:inline-block;width:20px;height:20px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}.ml-form-embedSubmitLoad:after{content:" ";display:block;width:11px;height:11px;margin:1px;border-radius:50%;border:4px solid #fff;border-color:#ffffff #ffffff #ffffff transparent;animation:ml-form-embedSubmitLoad 1.2s linear infinite}@keyframes ml-form-embedSubmitLoad{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}#mlb2-38376765.ml-form-embedContainer{box-sizing:border-box;display:table;margin:0 auto;position:static;width:100%!important}#mlb2-38376765.ml-form-embedContainer h4,#mlb2-38376765.ml-form-embedContainer p,#mlb2-38376765.ml-form-embedContainer span,#mlb2-38376765.ml-form-embedContainer button{text-transform:none!important;letter-spacing:normal!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper{background-color:#f6f6f6;border-width:0px;border-color:transparent;border-radius:4px;border-style:solid;box-sizing:border-box;display:inline-block!important;margin:0;padding:0;position:relative}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper.embedPopup,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper.embedDefault{width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper.embedForm{max-width:100%;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody{padding:20px 20px 0 20px}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent{text-align:left;margin:0 0 20px 0}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent h4,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent h4{color:#000000;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:30px;font-weight:400;margin:0 0 10px 0;text-align:left;word-break:break-word}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedContent p,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-successBody .ml-form-successContent p{color:#000000;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:14px;font-weight:400;line-height:20px;margin:0 0 10px 0;text-align:left}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-block-form .ml-field-group{text-align:left!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-block-form .ml-field-group label{margin-bottom:5px;color:#333333;font-size:14px;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-weight:bold;font-style:normal;text-decoration:none;display:inline-block;line-height:20px}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody form{margin:0;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-formContent,#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow{margin:0 0 20px 0;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow{float:left}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow{margin:0 0 10px 0;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow.ml-last-item{margin:0}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-fieldRow input{background-color:#ffffff!important;color:#333333!important;border-color:#cccccc;border-radius:4px!important;border-style:solid!important;border-width:1px!important;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:14px!important;height:auto;line-height:21px!important;margin-bottom:0;margin-top:0;margin-left:0;margin-right:0;padding:10px 10px!important;width:100%!important;box-sizing:border-box!important;max-width:100%!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow .label-description{color:#000000;display:block;font-family:'Open Sans',Arial,Helvetica,sans-serif;font-size:12px;text-align:left;margin-bottom:0;position:relative;vertical-align:top}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow label{font-weight:normal;margin:0;padding:0;position:relative;display:block;min-height:24px;padding-left:24px}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow label a{color:#000000;text-decoration:underline}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow label p{color:#000000!important;font-family:'Open Sans',Arial,Helvetica,sans-serif!important;font-size:12px!important;font-weight:normal!important;line-height:18px!important;padding:0!important;margin:0 5px 0 0!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit{margin:0 0 20px 0;float:left;width:100%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button{background-color:#7000ff!important;border:none!important;border-radius:4px!important;box-shadow:none!important;color:#ffffff!important;cursor:pointer;font-family:'Open Sans',Arial,Helvetica,sans-serif!important;font-size:14px!important;font-weight:700!important;line-height:21px!important;height:auto;padding:10px!important;width:100%!important;box-sizing:border-box!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button.loading{display:none}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button:hover{background-color:#0067FD!important}.ml-error input,.ml-error textarea,.ml-error select{border-color:red!important}.ml-error .label-description,.ml-error .label-description p,.ml-error .label-description p a,.ml-error label:first-child{color:#ff0000!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow .label-description::before{position:absolute;top:4px;left:-1.5rem;display:block;width:16px;height:16px;pointer-events:none;content:"";background-color:#ffffff;border:#adb5bd solid 1px;border-radius:4px!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow .label-description::after{position:absolute;top:0px!important;left:-1.5rem;display:block;width:1rem;height:1rem;content:"";background:no-repeat 50%/50% 50%}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow input[type=checkbox]:checked~.label-description::after{background-image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23fff' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z'/%3e%3c/svg%3e")}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow input[type=checkbox]:checked~.label-description::before{border-color:#000000!important;background-color:#000000!important}#mlb2-38376765.ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-checkboxRow input[type="checkbox"]{box-sizing:border-box;padding:0;position:absolute;z-index:-1;opacity:0;margin-top:5px;margin-left:-1.5rem;overflow:visible}
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
  );
}

function LegalText() {
  return (
    <p className="font-body text-white/30 text-xs text-center mt-2 leading-relaxed max-w-lg mx-auto">
      Para cumplir con el RGPD (Reglamento General de Protección de Datos) y entender que tus datos están seguros, debes leer y aceptar la política de privacidad. Tus datos serán guardados en CampaignMonitor, proveedor de email marketing. CampaignMonitor también cumple con el RGPD, así que todo está protegido y amparado por la ley.
    </p>
  );
}

function BulletList({ items, withBreaks = false }) {
  if (withBreaks) {
    return (
      <div className="mb-8">
        {items.map((item, i) => (
          <React.Fragment key={i}>
            <div className="flex items-start gap-3">
              <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#0067FD] flex items-center justify-center text-white text-xs font-bold">✓</span>
              <span className="font-body text-white/80 text-base md:text-lg leading-relaxed">{item}</span>
            </div>
            {i < items.length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
    );
  }
  return (
    <ul className="mb-8 space-y-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#0067FD] flex items-center justify-center text-white text-xs font-bold">✓</span>
          <span className="font-body text-white/80 text-base md:text-lg leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

const bulletsA = [
  <>El audio de 18 minutos y 3 segundos en el que te doy <strong>información igual o superior a la que te dan en consultorías de miles de euros</strong>. Y que puedes aplicar desde hoy.</>,
  <><strong>Estrategias y experiencias diarias</strong> en tu bandeja de entrada <span style={{ opacity: 0.5 }}>(todos los días, y te venderé mis servicios también todos los días)</span></>,
  <><strong>Regalos secretos</strong> que descubrirás solo cuando te registres y que te ayudarán a aplicar la información del audio aún más rápido.</>,
];

const bulletsB = [
  <>El <strong>orden en el que debes de trabajar</strong> en tu tienda para hacer las cosas ordenadas y evitar perder el foco al enfocarte en lo que no tienes que enfocarte.</>,
  <>El objetivo que debes perseguir en cada momento <strong>para obtener el máximo retorno (en dinero)</strong> de tu trabajo y el tiempo que le inviertes.</>,
  <>Un cambio que debes hacer YA si aún no lo has hecho y <strong>que te evitará muchos problemas en el futuro</strong>. Te lo cuento en el minuto 02:20.</>,
  <>Algo que debes hacer (porque <strong>crees que lo sabes, pero no suele ser así</strong>) por qué si no, todo lo demás que hagas deja de tener sentido.</>,
  <>La manera de enfocar tu página de producto que <strong>el 99% de las tiendas no tiene en cuenta</strong> y por eso no se diferencian de absolutamente nadie (minuto 03:08).</>,
  <>Un error que <strong>empeora la experiencia del cliente</strong> por querer hacer las cosas rápido y mal (explicado con un ejemplo de la vida real).</>,
  <>Una estrategia que aprendí de los supermercados <strong>para colocar correctamente tus ofertas</strong> y vender más productos (del 04:16 al 05:51).</>,
  <>Una recomendación que <strong>casi todo el mundo olvida y que devalúa tu marca</strong>, haciendo que cada vez vendas menos (minuto 06:21).</>,
  <>Los 8 (o más) <strong>flujos automáticos que si o si tienes que tener en tu tienda</strong>, cuales son y cuál es su objetivo (a partir del minuto 07:03).</>,
  <>El cambio poco sexy y aburrido que le tienes que hacer a estos 8 (o más) flujos automáticos <strong>para que te traigan más ventas</strong>.</>,
  <>2 configuraciones técnicas para e<strong>vitar un error muy común</strong> (hasta en tiendas grandes) y para <strong>adaptarte a los últimos cambios</strong> de meta ads (del 10:29 al 11:54).</>,
  <>Un área que <strong>muchos quieren delegar a la IA</strong> y que si lo haces probablemente quemes miles de euros en publicidad sin beneficio ninguno.</>,
  <>A partir del minuto 13:00, una serie de consejos que <strong>solo con esos 5 minutos del audio te ahorras miles y miles de euros</strong> en formaciones y consultorías y agencias.</>,
];

function VariantA() {
  return (
    <div className="flex-1 flex flex-col items-center px-6 pt-6 md:pt-16 pb-16">
      <div className="max-w-2xl w-full">

        <h1 className="font-headline font-bold text-white text-2xl md:text-4xl text-center leading-tight">
          El 5% de las tiendas online que no solo son rentables...{'\u00A0'}
        </h1>
        <h1 className="font-headline font-bold text-white text-2xl md:text-4xl text-center leading-tight">
          sino que cada vez lo son más...{'\u00A0'}
        </h1>
        <h1 className="font-headline font-bold text-white text-2xl md:text-4xl text-center leading-tight mb-8">
          <span style={{ color: '#0067FD' }}>¿Qué saben que tú no?</span>
        </h1>

        <p className="mb-4"><br /></p>

        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          Ya sabes que el 95% de las tiendas online fracasa...{'\u00A0'}
        </p>
        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          Y no necesitas gastarte 7.000€ en una consultoría para que tu tienda sea del 5% que no.
        </p>

        <p className="mb-4"><br /></p>

        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          <strong><span style={{ color: '#0067FD' }}>Quieres vender más, escalar, ¿verdad?</span></strong>
        </p>
        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          A ver, no es un misterio que si el 95% de consultores y agencias te dicen exactamente lo mismo, eso no puede ser la clave para triunfar.
        </p>
        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          Y si además, te hacen una promesa loca de resultados rápidos, es garantía segura de que no vas a tener resultados, ni rápidos ni lentos.
        </p>
        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          Si fuese así, todos tendrían éxito... ¿no?
        </p>

        <p className="mb-4"><br /></p>

        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          Enfin.
        </p>
        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          Si lo que quieres es escalar sin que los costes se coman tu beneficio y con la seguridad de que estás haciendo lo correcto en cada paso y no quieres gastarte una pasta en formaciones que son "más de lo mismo"…
        </p>
        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          Te he grabado un audio de 18 minutos y 3 segundos con el que seguro que vas a aprender lo mismo o más que en una consultoría de 7.000€.
        </p>
        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          Y si aplicas todo lo que te cuento, probablemente empezarás a ganar más con tu tienda online desde hoy mismo.
        </p>

        <p className="mb-4"><br /></p>

        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          <strong>Déjame tu email y recibirás <span style={{ color: '#0067FD' }}>(inmediatamente)</span>:{'\u00A0'}</strong>
        </p>

        <BulletList items={bulletsA} />

        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-6">
          Suscribirse es gratis. Darse de baja, también.
        </p>

        <MailerLiteForm />

        <p className="mb-4"><br /></p>

        <LegalText />

        <p className="mb-4"><br /></p>

        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          Algo importante que debes saber es que <strong><span style={{ color: '#0067FD' }}>este audio es un material limitado</span></strong><span style={{ color: '#2969B0' }}>.</span> No lo voy a dejar activo mucho tiempo. No te puedo decir cuando lo quitaré porque no lo he decidido aún, pero es seguro que no va a estar disponible siempre.
        </p>
        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          Espero que lo disfrutes.
        </p>
        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed">
          Raúl.
        </p>

      </div>
    </div>
  );
}

function VariantB() {
  return (
    <div className="flex-1 flex flex-col items-center px-6 pt-6 md:pt-16 pb-16">
      <div className="max-w-2xl w-full">

        <h1 className="font-headline font-bold text-white text-2xl md:text-4xl text-center leading-tight">
          ¿Qué tienen en común el 5% de las tiendas que no solo escalan sino que cada vez tienen más beneficios?
        </h1>
        <br />
        <h1 className="font-headline font-bold text-white text-2xl md:text-4xl text-center leading-tight">
          <span style={{ color: '#0067FD' }}>¿Cómo evitan estancarse y facturan cada vez más?</span>
        </h1>
        <br />
        <h1 className="font-headline font-bold text-white text-2xl md:text-4xl text-center leading-tight mb-8">
          Es más sencillo de lo que imaginas y lo verás en este momento.
        </h1>

        <p className="mb-4"><br /></p>

        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          Deja tu email y recibirás (inmediatamente) un audio de 18 minutos y 3 segundos donde te mostraré que no necesitas invertir 7.000€ en una consultoría para recibir información de la misma o más calidad.<br /><br />Te hablaré de las acciones concretas que debes tomar en cada una de las 3 patas de tu tienda con un enfoque que no se suele tocar y te contaré, al final del audio, 3 cosas que probablemente no estás teniendo en cuenta y que marcan la diferencia entre crecer o morir en tu tienda.
        </p>

        <p className="mb-4"><br /></p>

        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          Antes de dejar tu email, ten en cuenta que <strong><span style={{ color: '#0067FD' }}>este audio es un material de alto valor y para sacarle provecho tienes que escucharlo entero</span></strong>, los 18 minutos y 3 segundos, y sobre todo, implementar, por lo que si no vas a escucharlo, no te recomiendo dejar el mail, me lo agradecerás.
        </p>

        <p className="mb-4"><br /></p>

        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-6">
          <span style={{ fontSize: '14px' }}>* Darse de alta es gratis, y de baja, también.</span>
        </p>

        <MailerLiteForm />

        <p className="mb-4"><br /></p>

        <LegalText />

        <p className="mb-4"><br /></p>

        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          Algo importante que debes saber es que <strong><span style={{ color: '#0067FD' }}>este audio es un material limitado</span></strong><span style={{ color: '#0067FD' }}>.</span> No lo voy a dejar activo mucho tiempo.{'\u00A0'}
        </p>
        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          No te puedo decir cuando lo quitaré porque no lo he decidido aún, pero es seguro que no va a estar disponible siempre.
        </p>
        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          Quizá te interese que te cuente como resuelvo los problemas más comunes de una tienda online de las formas más ingeniosas.
        </p>

        <p className="mb-4"><br /></p>

        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          Estas son, entre otras cosas, algunas de las cosas que te cuento en el audio:
        </p>

        <BulletList items={bulletsB} withBreaks />

        <p className="mb-4"><br /></p>

        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          Todo esto y más, está en el audio que vas a recibir al dejar tu email aquí:{'\u00A0'}
        </p>

        <p className="mb-4"><br /></p>

        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-6">
          <span style={{ fontSize: '14px' }}>* Darse de alta es gratis, y de baja, también.</span>
        </p>

        <MailerLiteForm />

        <p className="mb-4"><br /></p>

        <LegalText />

        <p className="mb-4"><br /></p>

        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4">
          Espero que lo disfrutes.
        </p>
        <p className="font-body text-white/80 text-base md:text-lg leading-relaxed">
          Raúl.
        </p>

      </div>
    </div>
  );
}

export default function HomeABTest() {
  const variant = useABTest(TEST_ID, TEST_URL);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = mailerLiteCSS;
    style.id = "mailerlite-css-home-ab";
    document.head.appendChild(style);

    window.ml_webform_success_38376765 = function () {
      trackConversion(TEST_ID, TEST_URL);
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
    script.id = "mailerlite-script-home-ab";
    document.body.appendChild(script);

    return () => {
      const css = document.getElementById("mailerlite-css-home-ab");
      if (css && css.parentNode) css.parentNode.removeChild(css);
      const s = document.getElementById("mailerlite-script-home-ab");
      if (s && s.parentNode) s.parentNode.removeChild(s);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      {variant === 'A' ? <VariantA /> : <VariantB />}
      <FooterMinimal />
    </div>
  );
}
