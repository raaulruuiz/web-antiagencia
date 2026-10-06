import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import FooterMinimal from "@/components/landing/FooterMinimal";
import { MailerLiteForm, mailerLiteCSS } from "./TrabajaConNosotros2";

// /trabajaconnosotros — landing de la Anti-Auditoría.
// Mismo estilo "carta/email" y mismo formulario MailerLite que la versión anterior
// (TrabajaConNosotros2.jsx, archivada sin ruta).

const AZUL = '#0067FD';
const ROJO = '#E00000';

// Negritas del cuerpo en azul (h1/h2 van en negro, como en /trabajaconnosotros)
function B({ children }) {
  return <strong style={{ color: AZUL }}>{children}</strong>;
}

// Bullets de lista: mismo formato que /trabajaconnosotros
function Bullet({ children }) {
  return (
    <div className="flex items-start gap-3 mb-2">
      <span className="flex-shrink-0 h-[2em] flex items-center">
        <span className="w-5 h-5 rounded-full bg-[#0067FD] flex items-center justify-center text-white text-xs font-bold">✓</span>
      </span>
      <span>{children}</span>
    </div>
  );
}

// Sustituye a ➜: rombo azul
function Paso({ children }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <span className="flex-shrink-0 font-bold" style={{ color: AZUL }} aria-hidden="true">◆</span>
      <div className="[&>p]:mb-4 [&>p:last-child]:mb-0">{children}</div>
    </div>
  );
}

// Sustituye a ◍: estrella en círculo rojo, para que salte a la vista
function Destacado({ children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 h-[2em] flex items-center" aria-hidden="true">
        <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold shadow" style={{ backgroundColor: ROJO }}>★</span>
      </span>
      <span>{children}</span>
    </div>
  );
}

function H1({ children, size = "text-2xl md:text-3xl" }) {
  return <h1 className={`${size} font-bold text-gray-900 mb-4`}>{children}</h1>;
}

function H2({ children }) {
  return <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{children}</h2>;
}

function Carta({ children }) {
  return (
    <div className="bg-white shadow-xl rounded-sm px-6 md:px-12 py-12 mb-10" style={{ fontFamily: "'Georgia', serif" }}>
      <div className="text-gray-800 text-xl [&>p]:mb-4" style={{ lineHeight: '2' }}>
        {children}
      </div>
    </div>
  );
}

export default function AntiAuditoria() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = mailerLiteCSS;
    style.id = "mailerlite-css-tcn";
    document.head.appendChild(style);

    window.ml_webform_success_38800152 = function () {
      window.umami?.track('registro-anti-auditoria');
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
    script.id = "mailerlite-script-tcn";
    document.body.appendChild(script);

    return () => {
      const css = document.getElementById("mailerlite-css-tcn");
      if (css && css.parentNode) css.parentNode.removeChild(css);
      const scr = document.getElementById("mailerlite-script-tcn");
      if (scr && scr.parentNode) scr.parentNode.removeChild(scr);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Anti-Auditoría — Antiagencia</title>
        <meta name="description" content="Anti-Auditoría completa de email marketing con Raúl Ruiz: investigación, visita presencial, reunión y dossier con plan de acción a 90 días." />
      </Helmet>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
          <div className="w-full max-w-4xl">

            <Carta>
              <p style={{ color: ROJO }}>Estamos dando fechas para las primeras dos semanas de diciembre (especial enfoque en Navidad, Año Nuevo y principios de año). Luego cerramos la auditoría hasta 2027.</p>
              <p>&nbsp;</p>
              <H1 size="text-4xl md:text-5xl">ANTI-AUDITORÍA</H1>
              <H1 size="text-xl md:text-2xl">Completa. De email marketing. Con Raúl Ruiz</H1>
              <p>&nbsp;</p>
              <H1 size="text-3xl md:text-4xl">Precio: 1.250€ + IVA</H1>
              <p>&nbsp;</p>

              <Paso><B>Esta auditoría</B> es una reunión de trabajo posterior a un proceso de investigación. No es una charla. Es un paso adelante para ti y tu tienda. <u>Es hacer que tus clientes recuernden tu marca y quieran comprarte de nuevo</u> (esto es tan básico que la mayoría se olvida).</Paso>
              <p>&nbsp;</p>

              <Paso>
                <p><B>Antes de realizarla</B> te pido una serie de datos, haré una investigación e iré a visitarte en persona.</p>
                <p>Y sí, voy a ir a verte. No creo que pueda decirte cómo vender mejor un producto que solo conozco por las fotos de tu web. <u>Quiero verlo, tocarlo si se puede, entender cómo trabajáis, conocer quién está detrás del negocio y escuchar cómo habláis de él cuando no estáis intentando venderme nada.</u> Porque sin conocer de primera mano el producto que voy a vender, al cliente y a ti, no puedo venderlo.</p>
                <p>La <u>investigación</u> viene antes de la <u>estrategia</u>, y la estrategia viene antes de <u>escribir los emails</u> (esto es importante recordarlo, que ya sabes que muchos te dicen que llegan y en 7 días te lo ponen todo en marcha, y luego la cosa acaba como acaba…).</p>
                <p>Porque, aunque tengas el mejor producto del mundo, si no tienes <u>la estrategia más conveniente para vender ESE producto</u>, es casi seguro que no saldrá como quieres.</p>
              </Paso>
              <p>&nbsp;</p>

              <Paso>
                <p><B>En la reunión</B> te presentaré el rumbo de comunicación que considero más efectivo para tu tienda y tus productos.</p>
                <p>Te presentaré un dossier completo con la estrategia de comunicación por email que puedes llevar a cabo <u>para que tus clientes NO pierdan el interés por tu marca</u>, y los que aún no lo son, empiecen a tenerlo y a demostrarlo comprándote.</p>
              </Paso>
              <p>&nbsp;</p>
              <p>Que alguien externo mire tu tienda SIEMPRE te va a ayudar a ver cosas que NUNCA verías desde dentro.</p>
              <p>&nbsp;</p>

              <Destacado>Al finalizar la reunión, ese mismo día, te envío <u>la grabación</u> de la misma y <u>el dossier</u> completo en formato PDF.</Destacado>
              <p>&nbsp;</p>

              <H2>IMPORTANTE</H2>
              <p>Después de esa reunión, sabrás EXACTAMENTE lo que tienes que hacer <u>para no perder ventas y clientes</u> por culpa de una comunicación poco eficaz y cómo diferenciarte frente a tus competidores.</p>
              <p>&nbsp;</p>

              <H2>LO QUE OBTIENES</H2>
              <p><B>La reunión no tiene horario.</B> Termina cuando hayamos terminado.</p>
              <p><B>Igual que el dossier</B>. Tendrá las páginas que tenga que tener. Pero incluirá:</p>
              <Bullet><strong>Análisis y comentarios sobre tus automatizaciones</strong> (y sus respectivas propuestas de mejora <u>para vender más en automático</u> sin dañar tu imagen de marca).</Bullet>
              <Bullet><strong>Análisis y comentarios sobre tus formularios de captación</strong> (y sus respectivas propuestas de mejora <u>para conseguir más y mejores clientes</u> potenciales).</Bullet>
              <Bullet><strong>Análisis y comentarios sobre las newsletters que envías</strong> (y sus respectivas propuestas de mejora <u>para vender, fidelizar y generar recurrencia</u> entre tus clientes).</Bullet>
              <Bullet><strong>Revisión técnica de la plataforma</strong> para asegurar que no hay problemas que estén <u>limitando la estrategia</u>.</Bullet>
              <Bullet><strong>Análisis de tu cliente actual vs tu cliente ideal</strong>, porque sí, es posible, y muy común, que no estés atrayendo al cliente que de verdad te interesa (y <u>cómo llegar a él</u> si no lo estamos atrayendo correctamente).</Bullet>
              <Bullet><strong>Plan de acción detallado</strong> y semana a semana, <u>para los próximos 90 días</u>.</Bullet>
              <Bullet>Si te falta alguna automatización, formulario o pieza importante, te indicaré qué deberías crear, cómo hacerlo, cómo debería funcionar y qué función debe cumplir.</Bullet>
              <p>&nbsp;</p>

              <H2>PLAZOS</H2>
              <p><B>Sencillo:</B></p>
              <Paso>Una vez que rellenas el formulario, me pongo en contacto contigo al día siguiente para decirte si me interesa o no el proyecto.</Paso>
              <Paso>Si es que sí, te paso las fechas disponibles.</Paso>
              <Paso>Eliges.</Paso>
              <Paso>Pagas el total <u>por adelantado</u>.</Paso>
              <Paso>Te envío la factura y el contrato.</Paso>
              <Paso>Creo un grupo de WhatsApp por el que te pediré la info y el material que voy a necesitar para trabajar.</Paso>
              <Paso>Agendamos la visita presencial.</Paso>
              <Paso>Trabajo sobre el dossier.</Paso>
              <Paso>Nos vemos en la reunión online.</Paso>
              <Paso>Te envío la grabación de la reunión y el dossier.</Paso>
              <p>&nbsp;</p>

              <H2>FORMA DE PAGO</H2>
              <p>Cobro por adelantado <u>siempre</u>.</p>
              <p>Una vez que te mande las fechas disponibles, tienes <B>dos días</B> para realizar el pago de la Anti-Auditoría.</p>
              <p>Si no se ha pagado en ese tiempo, la fecha elegida quedará a disposición de otro cliente.</p>
              <p>&nbsp;</p>
              <p>Y ya estaría.</p>
              <p>&nbsp;</p>
              <p>Si te interesa, aquí abajo tienes el formulario para que estudie tu caso.</p>
              <p>&nbsp;</p>
              <p>Raúl.</p>
              <p>&nbsp;</p>
              <p><B>P.D.</B> Recuerda que la vida es para disfrutarla. Y es mejor hacerlo con un negocio que crece, no con uno que se estanca.</p>
              <p>&nbsp;</p>
              <MailerLiteForm buttonText="Estudia mi caso" />

              {/* Firma con logo, igual que en la versión antigua de /trabajaconnosotros-old */}
              <div className="clear-both flex items-center justify-center gap-4 mt-8 pt-8 border-t border-gray-200">
                <img
                  src="https://media.base44.com/images/public/697678eac9cf34e2aefb7d57/82d53b854_logonegro.png"
                  alt="AntiAgencia"
                  className="h-10 w-auto"
                />
                <span className="font-bold text-gray-900 text-xl tracking-wide" style={{ fontFamily: "'Rubik', monospace" }}>Antiagencia</span>
              </div>
            </Carta>

          </div>
        </div>
        <FooterMinimal />
      </div>
    </>
  );
}
