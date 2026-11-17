import React, { useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import FooterMinimal from "@/components/landing/FooterMinimal";
import FormularioListaPrioritaria from "@/components/FormularioListaPrioritaria";
import {
  Boton, Check, claseBoton, FORM_MAILERLITE, Hoja, ListaCerrada, Parrafo, Pendiente, PLAZAS_CERRADAS, RUTA_GRACIAS, rubik, Titulo, leerUtm, utmAQuery,
} from "./antiAgenteComun";

// /anti-agente — landing de la lista prioritaria de Anti-Agente (BORRADOR, noindex).
// Textos: «cambios v2» de Perro Sanxe (16-11-2026) sobre el PDF del mismo día, con las
// correcciones factuales de Anti-Agente (IA, datos, aprobación, conexiones).
// Los recuadros <Pendiente> son notas para Raúl: solo se ven en local, nunca en producción.

const TEXTO_BOTON = "Quiero una de las 5 plazas";
// Texto único sobre la IA (decisión de Raúl, 17-11-2026). Sin «gratis con tu IA», sin logos ni
// «compatible oficialmente», sin claves de API.
const TEXTO_IA = "Usa Claude Code y Codex, los programas oficiales, con tu propia cuenta. Inicias sesión tú y gasta de tu plan. Sujeto a los términos de cada proveedor.";
const APROBACION = "Por defecto, nada se publica ni se envía sin tu aprobación";

// Vídeo de la cabecera: lo grabará Raúl. Mientras VIDEO_PENDIENTE sea true, en la revisión
// (vite dev) se ve un hueco naranja señalado y en producción no se pinta nada, para no
// publicar una caja vacía. Cuando exista el vídeo, se monta aquí (con VideoConsentido).
const VIDEO_PENDIENTE = true;

function Video() {
  if (VIDEO_PENDIENTE && !import.meta.env.DEV) return null;
  return (
    <div className="border-2 border-dashed border-orange-400 bg-orange-50 rounded-sm mb-3">
      <div className="aspect-video flex flex-col items-center justify-center text-center px-6 text-orange-900" style={rubik}>
        <span className="w-14 h-14 rounded-full bg-orange-200 flex items-center justify-center text-2xl mb-4" aria-hidden="true">▶</span>
        <p className="font-bold">PENDIENTE · Hueco provisional del vídeo</p>
        <p className="text-sm mt-1">Vídeo de 60-90 s que grabará Raúl. En la web publicada este hueco no se muestra hasta que esté el vídeo.</p>
      </div>
    </div>
  );
}

function Microcopy({ children }) {
  return <p className="text-sm text-gray-600 mt-3" style={rubik}>{children}</p>;
}

function Formulario({ utm }) {
  const navigate = useNavigate();
  const gracias = `${RUTA_GRACIAS}${utmAQuery(utm)}`;
  const alEnviar = useCallback(() => navigate(gracias), [navigate, gracias]);
  return (
    <FormularioListaPrioritaria
      {...FORM_MAILERLITE}
      textoBoton={TEXTO_BOTON}
      claseBoton={claseBoton()}
      estiloBoton={rubik}
      textoBajoBoton="Te escribo yo personalmente para agendar."
      onEnviado={alEnviar}
    />
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
              <Pendiente>Descripción para buscadores y al compartir: sigue la general de la web en las redes que no leen la de esta página. Pendiente de decisión de Raúl; no se toca.</Pendiente>
              <Video />
              <p className="text-gray-800 text-lg italic text-center mb-8">«Antes, esto me llevaba media mañana. Ahora está hecho a las 9.»</p>
              <Boton href="#apuntarme">{TEXTO_BOTON}</Boton>
              <Microcopy>Te escribo yo personalmente para agendar · {APROBACION}.</Microcopy>
              <Microcopy>{TEXTO_IA}</Microcopy>
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
              <Parrafo><strong className="text-[#0067FD]">Tu tienda es tuya.</strong> El equipo trabaja para ti, no en tu lugar.</Parrafo>
            </Hoja>

            {/* 6 · Requisitos */}
            <Hoja>
              <Titulo>Qué necesitas</Titulo>
              <Check titulo="Tu ordenador.">De momento Anti-Agente funciona en tu ordenador, mientras está encendido.</Check>
              <Check titulo="Tu propia cuenta de IA.">{TEXTO_IA}</Check>
              <Check titulo="Tus herramientas de siempre,">si quieres conectarlas: tu tienda (Shopify, WooCommerce), tu email (Klaviyo, MailerLite), Gmail y Meta.</Check>
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
                ["¿De verdad es gratis?", `Sí, la app es gratis. ${TEXTO_IA}`],
                ["¿Tengo que saber de IA?", "No. Viene montado y al empezar le explicas tu negocio con tus palabras."],
                ["¿Tengo que dejar mis herramientas?", "No. Se conecta con las que ya usas."],
                ["¿Puede enviar algo sin que yo lo vea?", "Por defecto, no: todo lo que se publica o se envía te llega antes para que lo apruebes."],
              ].map(([p, r]) => (
                <div key={p} className="mb-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1" style={rubik}>{p}</h3>
                  <p className="text-gray-800 text-lg leading-loose">{r}</p>
                </div>
              ))}
              <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-900 mb-1" style={rubik}>¿Dónde quedan los datos de mi tienda?</h3>
                <p className="text-gray-800 text-lg leading-loose mb-3">En tu ordenador. Tus conversaciones, memorias y archivos se guardan en tu propio ordenador, y las claves y accesos de tus conexiones también, cifrados con el llavero del sistema.</p>
                <p className="text-gray-800 text-lg leading-loose mb-3">Las llamadas a tu tienda y a tus herramientas van directas de tu ordenador a cada servicio: no pasan por ningún servidor mío. Mis servidores solo reciben tu inicio de sesión (tu email), nada de tu tienda.</p>
                <p className="text-gray-800 text-lg leading-loose mb-3">Lo que lee o escribe tu equipo pasa por la IA que uses (Claude Code, de Anthropic, o Codex, de OpenAI), según los términos de cada proveedor, no los míos.</p>
                <p className="text-gray-800 text-lg leading-loose">Solo si tú lo autorizas, se compartirá algo para mejorar la app.</p>
              </div>
            </Hoja>

            {/* 9 · Cierre + formulario */}
            <div id="apuntarme" className="scroll-mt-8">
              <Hoja>
                <Titulo>Imagina tenerlo hecho a las 9.</Titulo>
                <Parrafo>Apúntate, te escribo yo y lo dejamos a punto juntos.</Parrafo>
                {PLAZAS_CERRADAS ? <ListaCerrada /> : <Formulario utm={utm} />}
                <Microcopy>{APROBACION}.</Microcopy>
                <Microcopy>{TEXTO_IA}</Microcopy>
              </Hoja>
            </div>

          </div>
        </div>
        <FooterMinimal />
      </div>
    </>
  );
}
