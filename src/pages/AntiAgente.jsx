import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import FooterMinimal from "@/components/landing/FooterMinimal";
import {
  Boton, Check, FORM_MAILERLITE, Hoja, Parrafo, Pendiente, RUTA_GRACIAS, rubik, Titulo, leerUtm, utmAQuery,
} from "./antiAgenteComun";

// /anti-agente — landing de la lista prioritaria de Anti-Agente (BORRADOR, noindex).
// Textos: PDF de Perro Sanxe (16-11-2026) + cambios de Raúl vía Rafa.
// Los recuadros <Pendiente> marcan lo que cambia; se quitan antes de publicar.

const TEXTO_BOTON = "Quiero una de las 5 plazas"; // provisional

function Video() {
  return (
    <div className="p-[3px] rounded-sm bg-gradient-to-r from-[#0067FD] to-[#7000FF] mb-8">
      <div className="aspect-video bg-[#121212] rounded-sm flex flex-col items-center justify-center text-center px-6">
        <span className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white text-2xl mb-4" aria-hidden="true">▶</span>
        <p className="text-white font-bold" style={rubik}>Vídeo de 60-90 s (lo graba Raúl)</p>
        <p className="text-white/60 text-sm" style={rubik}>«Antes, esto me llevaba media mañana. Ahora está hecho a las 9.»</p>
      </div>
    </div>
  );
}

function Formulario({ utm }) {
  const gracias = `${RUTA_GRACIAS}${utmAQuery(utm)}`;
  if (FORM_MAILERLITE) return null; // se monta cuando Raucu pase el formulario
  return (
    <div className="border-2 border-dashed border-gray-400 rounded-sm px-6 py-6 text-gray-700" style={rubik}>
      <p className="font-bold text-gray-900 mb-3">Aquí va el formulario de MailerLite (lo prepara Raucu)</p>
      <ul className="list-disc pl-6 mb-3 text-sm leading-relaxed">
        <li>Nombre</li>
        <li>Email</li>
        <li>Web de tu tienda</li>
        <li>¿Qué tarea te quita más tiempo? (respuesta corta)</li>
        <li>Casilla: acepto la <a href="/politica-privacidad" className="underline">política de privacidad</a></li>
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
        <meta name="description" content="Un equipo de agentes para tu tienda online. Gratis. Apúntate a la lista prioritaria: solo 5 plazas." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-gray-100 flex flex-col selection:bg-[#7000FF] selection:text-white">
        <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
          <div className="w-full max-w-4xl">

            {/* 1 · Cabecera */}
            <Hoja>
              <p className="text-[#0067FD] font-bold mb-6" style={rubik}>Lista prioritaria · Solo 5 plazas</p>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 uppercase mb-8 leading-tight" style={rubik}>
                Un equipo de agentes para tu tienda online. Gratis.
              </h1>
              <Video />
              <Parrafo>Llevo años haciendo marketing para tiendas online. Con este equipo hago en 2 horas lo que antes me llevaba el día entero. No te lo cuento: lo uso cada día en mi propio negocio.</Parrafo>

              <Pendiente>Texto exacto de las 5 plazas y sus ventajas: lo redacta Perro Sanxe. Abajo, provisional.</Pendiente>
              <div className="border-l-4 border-[#7000FF] pl-5 my-8">
                <p className="text-xl font-bold text-gray-900 mb-4" style={rubik}>Solo hay 5 plazas en la lista prioritaria. Esas 5 personas tienen:</p>
                <Check titulo="Onboarding gratis en videollamada.">Dejamos la herramienta a punto para tu negocio, juntos.</Check>
                <Check titulo="Auditoría de costes gratis.">Miramos qué gasto y qué tiempo te puede quitar en tu caso.</Check>
                <Check titulo="Condiciones especiales de lanzamiento">si quieres algo hecho a tu medida.</Check>
              </div>

              <Boton href="#apuntarme">{TEXTO_BOTON}</Boton>
              <p className="text-sm text-gray-600 mt-3" style={rubik}>Funciona con tu suscripción de Claude, ChatGPT u otra · Nada sale sin tu visto bueno</p>
              <Pendiente>Texto del botón provisional (no es «Descargar»: es para apuntarse a la lista).</Pendiente>
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
              <Parrafo className="mt-6">Viene ya montado. Al empezar, le cuentas cómo es tu negocio y el equipo se adapta: tu tono, tus productos, tus clientes. Se conecta con las herramientas que ya usas, como Shopify, Gmail, Meta o MailerLite. No tienes que dejar ninguna.</Parrafo>
              <Parrafo>Empieza por tu tienda online y, si quieres, se extiende al resto de tu negocio.</Parrafo>
            </Hoja>

            {/* 3 · Especialistas que hablan entre sí (sustituye a «verlo trabajar») */}
            <Hoja>
              <Pendiente>Sección nueva: la redacta Perro Sanxe. Idea: cada agente está especializado y hablan entre sí, como un equipo de personas reales; tú solo revisas. Texto provisional.</Pendiente>
              <Titulo>Cada uno, especialista en lo suyo. Y hablan entre sí.</Titulo>
              <Parrafo>Cada agente se ocupa de una cosa y la hace bien. Cuando uno necesita algo del otro, se lo pide, como en un equipo de personas de verdad. Tú no coordinas a nadie: solo revisas lo que te dejan preparado.</Parrafo>
              <Parrafo>En español, y con una persona detrás. Si algo falla, no hablas con un formulario: hablas conmigo.</Parrafo>
              <Pendiente>Confirmar si se mantiene esta última frase (venía de la sección «verlo trabajar»).</Pendiente>
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
              <Parrafo>Ningún correo, publicación o anuncio sale de tu negocio sin que tú lo apruebes. Te llega como una tarjeta: lo lees, lo cambias si quieres y le das a enviar. O no.</Parrafo>
              <Parrafo><strong className="text-[#0067FD]">Tu tienda es tuya.</strong> El equipo trabaja para ti, no en tu lugar.</Parrafo>
            </Hoja>

            {/* 6 · Requisitos */}
            <Hoja>
              <Titulo>Qué necesitas</Titulo>
              <Check titulo="Un ordenador.">La app se instala en tu ordenador y, de momento, funciona mientras está encendido.</Check>
              <Check titulo="Tu propia suscripción de IA: Claude, ChatGPT u otra.">Anti-Agente es gratis; la IA que lo mueve la pagas tú a quien ya se la pagas. Si ya tienes una, no pagas nada más.</Check>
              <Check titulo="Tus herramientas de siempre,">si quieres conectarlas: tu tienda, tu correo, tus redes.</Check>
              <Parrafo className="mt-6"><strong>Para pequeñas empresas, no para multinacionales.</strong> Está pensado para tiendas y negocios donde el dueño lo hace casi todo.</Parrafo>
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
                ["¿De verdad es gratis?", "Sí, la app es gratis. Lo único que necesitas es tu propia suscripción de IA (Claude, ChatGPT u otra)."],
                ["¿Tengo que saber de IA?", "No. Viene montado y al empezar le explicas tu negocio con tus palabras."],
                ["¿Tengo que dejar mis herramientas?", "No. Se conecta con las que ya usas."],
                ["¿Puede enviar algo sin que yo lo vea?", "No. Todo lo importante te llega para aprobar."],
              ].map(([p, r]) => (
                <div key={p} className="mb-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1" style={rubik}>{p}</h3>
                  <p className="text-gray-800 text-lg leading-loose">{r}</p>
                </div>
              ))}
              <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-900 mb-1" style={rubik}>¿Dónde quedan los datos de mi tienda?</h3>
                <Pendiente>Respuesta pendiente de Anti-Agente: qué se queda en tu ordenador y qué no.</Pendiente>
              </div>
            </Hoja>

            {/* 9 · Cierre + formulario */}
            <div id="apuntarme" className="scroll-mt-8">
              <Hoja>
                <Pendiente>El cierre del PDF («Pruébalo mañana a las 9. Descárgalo hoy…») habla de descargar y todavía no se puede. Texto provisional hasta que Perro Sanxe lo adapte a la lista.</Pendiente>
                <Titulo>Apúntate a la lista prioritaria</Titulo>
                <Parrafo>Solo hay 5 plazas. Déjame tus datos y te escribo yo, personalmente, para agendar la videollamada.</Parrafo>
                <Formulario utm={utm} />
                <p className="text-sm text-gray-600 mt-4" style={rubik}>Funciona con tu suscripción de IA · Nada sale sin tu visto bueno</p>
              </Hoja>
            </div>

          </div>
        </div>
        <FooterMinimal />
      </div>
    </>
  );
}
