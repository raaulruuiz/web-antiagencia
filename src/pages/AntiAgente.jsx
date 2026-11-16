import React, { useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FooterMinimal from "@/components/landing/FooterMinimal";
import MailerLiteEmbebido from "@/components/MailerLiteEmbebido";
import {
  Boton, Check, FORM_MAILERLITE, Hoja, ListaCerrada, Parrafo, Pendiente, PLAZAS_CERRADAS, RUTA_GRACIAS, rubik, Titulo, leerUtm, utmAQuery,
} from "./antiAgenteComun";

// /anti-agente — landing de la lista prioritaria de Anti-Agente (BORRADOR, noindex).
// Textos: «cambios v2» de Perro Sanxe (16-11-2026) sobre el PDF del mismo día, con las
// correcciones factuales de Anti-Agente (IA, datos, aprobación, conexiones).
// Los recuadros <Pendiente> son notas para Raúl: solo se ven en local, nunca en producción.

const TEXTO_BOTON = "Quiero una de las 5 plazas";
const IA = "tu suscripción de Claude o de ChatGPT";
const APROBACION = "Por defecto, nada se publica ni se envía sin tu aprobación";

const NOTA_APROBACION = "«Por defecto, nada se publica ni se envía sin tu aprobación»: es cierto por defecto, pero no si el usuario activa el modo «Más libertad». Raúl decide si queda así.";
const NOTA_CONEXIONES = "Shopify y WooCommerce existen en la app pero no se han probado nunca con una tienda real. Raúl decide si se nombran así.";

function Video() {
  return (
    <div className="p-[3px] rounded-sm bg-gradient-to-r from-[#0067FD] to-[#7000FF] mb-3">
      <div className="aspect-video bg-[#121212] rounded-sm flex flex-col items-center justify-center text-center px-6">
        <span className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white text-2xl mb-4" aria-hidden="true">▶</span>
        <p className="text-white font-bold" style={rubik}>Vídeo de 60-90 s (lo graba Raúl)</p>
      </div>
    </div>
  );
}

function Microcopy({ children }) {
  return <p className="text-sm text-gray-600 mt-3" style={rubik}>{children}</p>;
}

// Estilo de la web sobre el formulario de MailerLite (sus reglas llevan id, de ahí los !important).
const CSS_FORM = `
.ml-antiagencia .ml-form-embedContainer, .ml-antiagencia .ml-form-embedWrapper { max-width: 100% !important; width: 100% !important; }
.ml-antiagencia .ml-form-embedWrapper { background: transparent !important; border: 0 !important; border-radius: 0 !important; }
.ml-antiagencia .ml-form-embedBody, .ml-antiagencia .ml-form-successBody { padding: 0 !important; }
.ml-antiagencia .ml-form-embedContent h4, .ml-antiagencia .ml-form-successContent h4 { font-family: 'Rubik', sans-serif !important; color: #111827 !important; font-weight: 700 !important; }
.ml-antiagencia .ml-form-embedContent p, .ml-antiagencia .ml-form-successContent p { font-family: Georgia, serif !important; color: #1f2937 !important; font-size: 18px !important; line-height: 1.8 !important; }
.ml-antiagencia label, .ml-antiagencia .ml-form-checkboxRow p, .ml-antiagencia .ml-form-embedPermissions p { font-family: 'Rubik', sans-serif !important; color: #4b5563 !important; font-size: 14px !important; }
.ml-antiagencia input[type="text"], .ml-antiagencia input[type="email"], .ml-antiagencia input[type="url"], .ml-antiagencia textarea {
  font-family: 'Rubik', sans-serif !important; font-size: 16px !important; color: #111827 !important; background: #fff !important;
  border: 1px solid #d1d5db !important; border-radius: 2px !important; padding: 12px 14px !important; }
.ml-antiagencia input:focus, .ml-antiagencia textarea:focus { border-color: #0067FD !important; outline: 2px solid #0067FD33 !important; }
.ml-antiagencia a { color: #0067FD !important; text-decoration: underline !important; }
.ml-antiagencia .ml-form-embedSubmit button { font-family: 'Rubik', sans-serif !important; font-weight: 700 !important; font-size: 18px !important;
  background: #7000FF !important; border: 0 !important; border-radius: 2px !important; color: #fff !important; padding: 16px 24px !important; height: auto !important; transition: background-color .2s !important; }
.ml-antiagencia .ml-form-embedSubmit button:hover { background: #0067FD !important; }
`;

function Formulario({ utm }) {
  const navigate = useNavigate();
  const gracias = `${RUTA_GRACIAS}${utmAQuery(utm)}`;
  const alEnviar = useCallback(() => navigate(gracias), [navigate, gracias]);
  if (FORM_MAILERLITE) {
    return (
      <>
        <style>{CSS_FORM}</style>
        <MailerLiteEmbebido {...FORM_MAILERLITE} utm={utm} onEnviado={alEnviar} className="ml-antiagencia" />
        <Pendiente>Al enviarse, la página lleva a {RUTA_GRACIAS} con los UTM. Los UTM llegan a MailerLite solo si el formulario tiene campos ocultos utm_source, utm_medium, utm_campaign (u origen).</Pendiente>
      </>
    );
  }
  return (
    <div className="border-2 border-dashed border-gray-400 rounded-sm px-6 py-6 text-gray-700" style={rubik}>
      <p className="font-bold text-gray-900 mb-3">Aquí va el formulario de MailerLite (lo crea Raúl)</p>
      <ul className="list-disc pl-6 mb-3 text-sm leading-relaxed">
        <li>Nombre</li>
        <li>Email</li>
        <li>Web de tu tienda</li>
        <li>¿Qué tarea te quita más tiempo? (notas)</li>
        <li>Casilla: acepto la <a href="/politica-privacidad" className="underline">política de privacidad</a></li>
        <li>Casilla aparte, sin marcar: quiero recibir la newsletter diaria</li>
      </ul>
      <p className="text-sm mb-4">Botón: «{TEXTO_BOTON}». Al enviarse, lleva a la página de gracias con los UTM de la visita.</p>
      <Link to={gracias} className="text-[#0067FD] font-bold hover:underline text-sm">Simular envío → ver la página de gracias</Link>
    </div>
  );
}

export default function AntiAgente() {
  const { search } = useLocation();
  const utm = useMemo(() => leerUtm(search), [search]);

  return (
    <>
      <Helmet>
        <title>Anti-Agente — Un equipo de agentes para tu tienda online</title>
        <meta name="description" content="Un equipo de agentes para tu tienda online. Gratis. Empiezo con 5 tiendas y con esas 5 lo monto yo: apúntate a la lista prioritaria." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-gray-100 flex flex-col selection:bg-[#7000FF] selection:text-white">
        <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
          <div className="w-full max-w-4xl">

            {/* 1 · Cabecera */}
            <Hoja>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 uppercase mb-6 leading-tight" style={rubik}>
                Un equipo de agentes para tu tienda online. Gratis.
              </h1>
              <Parrafo className="mb-8">Llevo años haciendo marketing para tiendas online. Con este equipo hago en 2 horas lo que antes me llevaba el día entero. No te lo cuento: lo uso cada día en mi propio negocio.</Parrafo>
              <Video />
              <p className="text-gray-800 text-lg italic text-center mb-8">«Antes, esto me llevaba media mañana. Ahora está hecho a las 9.»</p>
              <Boton href="#apuntarme">{TEXTO_BOTON}</Boton>
              <Microcopy>Te escribo yo personalmente para agendar · Funciona con {IA} · {APROBACION}</Microcopy>
              <Pendiente>{NOTA_APROBACION}</Pendiente>
            </Hoja>

            {/* 1 bis · Las 5 plazas */}
            <Hoja>
              <Titulo>Empiezo con 5 tiendas. Y con esas 5 lo monto yo.</Titulo>
              <Parrafo>No es una forma de meterte prisa. Son 5 porque las llamadas las hago yo, una a una, y no quiero hacerlas mal.</Parrafo>
              <Parrafo>Si te quedas una de las 5 plazas, tienes:</Parrafo>
              <Check titulo="Onboarding gratis en videollamada.">Dejamos juntos tu equipo de agentes a punto para tu tienda: conectamos tus herramientas y lo adaptamos a cómo trabajas.</Check>
              <Check titulo="Auditoría de costes gratis.">Miramos qué gasto y qué tiempo te puede quitar Anti-Agente en tu caso.</Check>
              <Check titulo="Condiciones de lanzamiento si quieres algo a tu medida.">Si en la llamada vemos que te conviene algo hecho para ti, te lo ofrezco con precio de lanzamiento cerrado. Si no, no pasa nada: el equipo es gratis igual.</Check>
              <Parrafo className="mt-6">Más adelante, el onboarding y la auditoría serán de pago. Te lo digo ahora para que lo sepas desde el principio.</Parrafo>
              <Pendiente>Cuando se llenen las 5 plazas: poner PLAZAS_CERRADAS = true (antiAgenteComun.jsx). Quita formulario y calendario y muestra el aviso de lista de espera de pago.</Pendiente>
              <Boton href="#apuntarme">{TEXTO_BOTON}</Boton>
            </Hoja>

            {/* 2 · Qué hace tu equipo */}
            <Hoja>
              <Titulo>Lo que hoy haces tú a ratos, lo prepara tu equipo.</Titulo>
              <Parrafo>Anti-Agente es una app con un equipo de agentes con IA. Cada uno se ocupa de una parte de tu tienda y te lo deja preparado para que tú lo revises:</Parrafo>
              <Check titulo="Correo:">lee tu bandeja, te dice qué es importante y te deja las respuestas escritas.</Check>
              <Check titulo="Email marketing:">prepara tus newsletters y campañas con tu tono.</Check>
              <Check titulo="Contenido y redes:">ideas, textos y calendario a partir de lo que ya tienes.</Check>
              <Check titulo="Publicidad:">revisa tus anuncios y te propone campañas listas para aprobar.</Check>
              <Check titulo="Números:">te resume cada mañana cómo va la tienda.</Check>
              <Parrafo className="mt-6">Viene ya montado. Al empezar, le cuentas cómo es tu negocio y el equipo se adapta: tu tono, tus productos, tus clientes. Se conecta con tu tienda (Shopify, WooCommerce), tu email (Klaviyo, MailerLite), Gmail y Meta. No tienes que dejar ninguna de tus herramientas.</Parrafo>
              <Pendiente>{NOTA_CONEXIONES}</Pendiente>
              <Parrafo>Empieza por tu tienda online y, si quieres, se extiende al resto de tu negocio.</Parrafo>
            </Hoja>

            {/* 3 · Un equipo de verdad */}
            <Hoja>
              <Titulo>Como tener tu propio equipo. Tú solo revisas.</Titulo>
              <Parrafo>Cada agente está especializado en una cosa: uno lleva tu correo, otro tus emails, otro tu contenido, otro tus anuncios. Y hablan entre ellos: si el de contenido necesita un dato de ventas, se lo pide al que lleva los números, igual que harían dos personas de tu equipo.</Parrafo>
              <Parrafo>Tú no tienes que coordinar a nadie ni explicar cada cosa dos veces. Te dejan el trabajo preparado y tú solo tienes que revisar.</Parrafo>
              <Parrafo>Y si algo no te encaja, se lo dices como a una persona: «esto más corto», «a este cliente no», «la semana que viene, otra vez».</Parrafo>
              <Parrafo>En español, y con una persona detrás. Si algo falla, hablas conmigo.</Parrafo>
            </Hoja>

            {/* 4 · Mi caso */}
            <Hoja>
              <Titulo>Lo he probado primero conmigo.</Titulo>
              <Parrafo>Llevo años haciendo marketing para tiendas online. Antes de enseñarte esto, lo he usado para llevar toda mi agencia. En mi caso:</Parrafo>
              <Check>Lo que me llevaba todo el día, lo hago en 2 horas.</Check>
              <Check>El trabajo de media mañana ya está hecho a las 9. Cuando me siento, solo reviso y apruebo.</Check>
              <Check>Más de 200 € al mes menos de gasto fijo en herramientas que el equipo ha sustituido.</Check>
              <Parrafo className="mt-6">Son mis números, en mi negocio. El tuyo es distinto y no te voy a prometer los mismos. Lo que sí te digo es que lo puedes probar gratis y ver qué cambia en el tuyo.</Parrafo>
            </Hoja>

            {/* 5 · Tú apruebas */}
            <Hoja>
              <Titulo>Tu equipo prepara. Tú decides.</Titulo>
              <Parrafo>Por defecto, ningún correo, publicación o anuncio sale de tu negocio sin tu aprobación. Te llega como una tarjeta: lo lees, lo cambias si quieres y le das a enviar. O no.</Parrafo>
              <Pendiente>{NOTA_APROBACION} Detalle: cada publicación o cambio en las conexiones pide aprobación, las campañas de anuncios se crean en pausa y el correo solo sale desde una tarjeta aprobada.</Pendiente>
              <Parrafo><strong className="text-[#0067FD]">Tu tienda es tuya.</strong> El equipo trabaja para ti, no en tu lugar.</Parrafo>
            </Hoja>

            {/* 6 · Requisitos */}
            <Hoja>
              <Titulo>Qué necesitas</Titulo>
              <Check titulo="Tu ordenador.">De momento Anti-Agente funciona en tu ordenador, mientras está encendido.</Check>
              <Check titulo="Tu propia suscripción de IA: Claude o ChatGPT.">Anti-Agente es gratis; la IA que lo mueve la sigues pagando a quien ya se la pagas. Si ya tienes una, no pagas nada más.</Check>
              <Check titulo="Tus herramientas de siempre,">si quieres conectarlas: tu tienda (Shopify, WooCommerce), tu email (Klaviyo, MailerLite), Gmail y Meta.</Check>
              <Pendiente>{NOTA_CONEXIONES}</Pendiente>
              <Parrafo className="mt-6"><strong>Para pequeñas empresas, no para multinacionales.</strong> Está pensado para tiendas donde el dueño lo hace casi todo.</Parrafo>
            </Hoja>

            {/* 7 · Lo que viene */}
            <Hoja>
              <Titulo>Esto acaba de empezar</Titulo>
              <Check>Más herramientas dentro de la propia app.</Check>
              <Check>Más skills especializadas para tu equipo.</Check>
              <Check>Más conexiones con las herramientas que ya usas.</Check>
              <Check>Equipos preparados para más tipos de negocio.</Check>
              <Parrafo className="mt-6">Sin fechas: lo iremos sacando cuando funcione de verdad.</Parrafo>
            </Hoja>

            {/* 8 · Preguntas */}
            <Hoja>
              <Titulo>Preguntas frecuentes</Titulo>
              {[
                ["¿De verdad es gratis?", `Sí, la app es gratis. Lo único que necesitas es ${IA}.`],
                ["¿Tengo que saber de IA?", "No. Viene montado y al empezar le explicas tu negocio con tus palabras."],
                ["¿Tengo que dejar mis herramientas?", "No. Se conecta con las que ya usas."],
                ["¿Puede enviar algo sin que yo lo vea?", "Por defecto, no: todo lo que se publica o se envía te llega antes para que lo apruebes."],
              ].map(([p, r]) => (
                <div key={p} className="mb-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1" style={rubik}>{p}</h3>
                  <p className="text-gray-800 text-lg leading-loose">{r}</p>
                </div>
              ))}
              <Pendiente>{NOTA_APROBACION}</Pendiente>
              <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-900 mb-1" style={rubik}>¿Dónde quedan los datos de mi tienda?</h3>
                <p className="text-gray-800 text-lg leading-loose mb-3">En tu ordenador. Tus conversaciones, memorias y archivos se guardan en tu propio ordenador, y las claves y accesos de tus conexiones también, cifrados con el llavero del sistema.</p>
                <p className="text-gray-800 text-lg leading-loose mb-3">Las llamadas a tu tienda y a tus herramientas van directas de tu ordenador a cada servicio: no pasan por ningún servidor mío. Mis servidores solo reciben tu inicio de sesión (tu email), nada de tu tienda.</p>
                <p className="text-gray-800 text-lg leading-loose mb-3">Lo que lee o escribe tu equipo pasa por la IA que uses (Anthropic u OpenAI), según sus condiciones, no las mías.</p>
                <p className="text-gray-800 text-lg leading-loose">Solo si tú lo autorizas, se compartirá algo para mejorar la app.</p>
                <Pendiente>Respuesta real confirmada por Anti-Agente tras mirar el código (sustituye a la de Perro Sanxe). Redacción para revisión de Raúl.</Pendiente>
              </div>
            </Hoja>

            {/* 9 · Cierre + formulario */}
            <div id="apuntarme" className="scroll-mt-8">
              <Hoja>
                <Titulo>Imagina tenerlo hecho a las 9.</Titulo>
                <Parrafo>Apúntate, te escribo yo y lo dejamos a punto juntos.</Parrafo>
                {PLAZAS_CERRADAS ? <ListaCerrada /> : <Formulario utm={utm} />}
                <Microcopy>Con {IA} · {APROBACION}</Microcopy>
              </Hoja>
            </div>

          </div>
        </div>
        <FooterMinimal />
      </div>
    </>
  );
}
