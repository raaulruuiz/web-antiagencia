import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import FooterMinimal from "@/components/landing/FooterMinimal";
import { MailerLiteForm, mailerLiteCSS } from "./TrabajaConNosotros2";

// Página temporal para previsualizar landings antes de publicarlas en su URL definitiva.
// Mismo estilo "carta/email" y mismo formulario MailerLite que /trabajaconnosotros.

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
      <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#0067FD] flex items-center justify-center text-white text-xs font-bold">✓</span>
      <span>{children}</span>
    </div>
  );
}

// Sustituye a ➜: rombo azul
function Paso({ children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 font-bold" style={{ color: AZUL }} aria-hidden="true">◆</span>
      <span>{children}</span>
    </div>
  );
}

// Sustituye a ◍: estrella en círculo rojo, para que salte a la vista
function Destacado({ children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold shadow" style={{ backgroundColor: ROJO }} aria-hidden="true">★</span>
      <span>{children}</span>
    </div>
  );
}

function H1({ children, size = "text-2xl md:text-3xl" }) {
  return <h1 className={`${size} font-bold text-gray-900 mb-4`}>{children}</h1>;
}

function H2({ children }) {
  return <h2 className="text-xl font-bold text-gray-900 mb-2">{children}</h2>;
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

export default function Pruebas() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = mailerLiteCSS;
    style.id = "mailerlite-css-pruebas";
    document.head.appendChild(style);

    window.ml_webform_success_38800152 = function () {
      window.umami?.track('registro-presupuesto-pruebas');
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
    script.id = "mailerlite-script-pruebas";
    document.body.appendChild(script);

    return () => {
      const css = document.getElementById("mailerlite-css-pruebas");
      if (css && css.parentNode) css.parentNode.removeChild(css);
      const scr = document.getElementById("mailerlite-script-pruebas");
      if (scr && scr.parentNode) scr.parentNode.removeChild(scr);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Anti-Auditoría — Antiagencia</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
          <div className="w-full max-w-3xl">

            <Carta>
              <p style={{ color: ROJO }}>Estamos dando fechas para las primeras dos semanas de diciembre (especial enfoque en Navidad, Año Nuevo y principios de año). Luego cerramos la auditoría hasta 2027.</p>
              <p>&nbsp;</p>
              <H1 size="text-4xl md:text-5xl">ANTI-AUDITORÍA</H1>
              <H1 size="text-xl md:text-2xl">Completa. De email marketing. Con Raúl Ruiz</H1>
              <p>&nbsp;</p>
              <H1 size="text-3xl md:text-4xl">Precio: 1.250€ + IVA</H1>
              <p>&nbsp;</p>

              <Paso><B>Esta auditoría</B> es una reunión de trabajo posterior a un proceso de investigación. No es una charla. Es un paso adelante para ti y tu tienda. Es hacer que tus clientes recuernden tu marca y quieran comprarte de nuevo (esto es tan básico que la mayoría se olvida).</Paso>
              <p>&nbsp;</p>

              <Paso><B>Antes de realizarla</B> te pido una serie de datos, haré una investigación e iré a visitarte en persona. Y sí, voy a ir a verte. No creo que pueda decirte cómo vender mejor un producto que solo conozco por las fotos de tu web. Quiero verlo, tocarlo si se puede, entender cómo trabajáis, conocer quién está detrás del negocio y escuchar cómo habláis de él cuando no estáis intentando venderme nada. Porque sin conocer de primera mano el producto que voy a vender, al cliente y a ti, no puedo venderlo.</Paso>
              <p>La <u>investigación</u> viene antes de la <u>estrategia</u>, y la estrategia viene antes de <u>escribir los emails</u> (esto es importante recordarlo, que ya sabes que muchos te dicen que llegan y en 7 días te lo ponen todo en marcha, y luego la cosa acaba como acaba…).</p>
              <p>Porque, aunque tengas el mejor producto del mundo, si no tienes <u>la estrategia más conveniente para vender ESE producto</u>, es casi seguro que no saldrá como quieres.</p>
              <p>&nbsp;</p>

              <Paso><B>En la reunión</B> te presentaré el rumbo de comunicación que considero más efectivo para tu tienda y tus productos.</Paso>
              <p>Te presentaré un dossier completo con la estrategia de comunicación por email que puedes llevar a cabo <B>para que tus clientes NO pierdan</B> el interés por tu marca, y los que aún no lo son, empiecen a tenerlo y a demostrarlo comprándote.</p>
              <p>&nbsp;</p>
              <p>Que alguien externo mire tu tienda SIEMPRE te va a ayudar a ver cosas que NUNCA verías desde dentro.</p>
              <p>&nbsp;</p>

              <Destacado>Al finalizar la reunión, ese mismo día, te envío la grabación de la misma y el dossier completo en formato PDF.</Destacado>
              <p>&nbsp;</p>

              <H2>IMPORTANTE</H2>
              <p>Después de esa reunión, sabrás EXACTAMENTE lo que tienes que hacer para no perder ventas y clientes por culpa de una comunicación poco eficaz y cómo diferenciarte frente a tus competidores.</p>
              <p>&nbsp;</p>

              <H2>LO QUE OBTIENES</H2>
              <p><B>La reunión no tiene horario.</B> Termina cuando hayamos terminado.</p>
              <p><B>Igual que el dossier</B>. Tendrá las páginas que tenga que tener. Pero incluirá:</p>
              <p>&nbsp;</p>
              <Bullet>Análisis y comentarios sobre tus automatizaciones (y sus respectivas propuestas de mejora para vender más en automático sin dañar tu imagen de marca).</Bullet>
              <Bullet>Análisis y comentarios sobre tus formularios de captación (y sus respectivas propuestas de mejora para conseguir más y mejores clientes potenciales).</Bullet>
              <Bullet>Análisis y comentarios sobre las newsletters que envías (y sus respectivas propuestas de mejora para vender, fidelizar y generar recurrencia entre tus clientes).</Bullet>
              <Bullet>Revisión técnica de la plataforma para asegurar que no hay problemas que estén limitando la estrategia.</Bullet>
              <Bullet>Análisis de tu cliente actual vs tu cliente ideal (y cómo llegar a él si no lo estamos atrayendo correctamente).</Bullet>
              <Bullet>Plan de acción detallado y semana a semana, para los próximos 90 días.</Bullet>
              <Bullet>Si te falta alguna automatización, formulario o pieza importante, te indicaré qué deberías crear, cómo hacerlo, cómo debería funcionar y qué función debe cumplir.</Bullet>
              <p>&nbsp;</p>

              <H2>PLAZOS</H2>
              <p><B>Sencillo:</B></p>
              <Paso>Una vez que rellenas el formulario, me pongo en contacto contigo al día siguiente para decirte si me interesa o no el proyecto</Paso>
              <Paso>Si es que sí, te paso las fechas disponibles</Paso>
              <Paso>Eliges</Paso>
              <Paso>Pagas el total por adelantado</Paso>
              <Paso>Te envío la factura y el contrato</Paso>
              <Paso>Creo un grupo de WhatsApp por el que te pediré la info y el material que voy a necesitar para trabajar</Paso>
              <Paso>Agendamos la visita presencial</Paso>
              <Paso>Trabajo sobre el dossier</Paso>
              <Paso>Nos vemos en la reunión online</Paso>
              <Paso>Te envío la grabación de la reunión y el dossier</Paso>
              <p>&nbsp;</p>

              <H2>FORMA DE PAGO</H2>
              <p>Cobro por adelantado siempre.</p>
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
              <MailerLiteForm />
            </Carta>

          </div>
        </div>
        <FooterMinimal />
      </div>
    </>
  );
}
