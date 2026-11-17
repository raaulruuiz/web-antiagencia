import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import FooterMinimal from "@/components/landing/FooterMinimal";
import {
  Boton, Check, Contador, Formulario, Hoja, ListaCerrada, Parrafo, PLAZAS_CERRADAS, PREGUNTAS, rubik, TEXTO_BOTON, Titulo, Video, VIDEO_VISIBLE, leerUtm,
} from "./antiAgenteComun";

// /anti-agente — landing oficial de la lista prioritaria (versión B, elegida por Raúl el 17-11-2026; noindex).
// Secciones apiladas en tarjetas (Hoja) sobre fondo gris. La versión A queda de respaldo en /anti-agente-a.
// Mismo formulario de MailerLite, misma página de gracias y mismo contador (antiAgenteComun.jsx).

// Duración del vídeo para el texto de encima («Antes de nada, mira cómo funciona. (X minutos)»).
// Se rellena cuando esté el vídeo, p. ej. "3 minutos". Mientras esté vacía, en la vista previa
// se ve el marcador «(X minutos)» en naranja; en producción la sección del vídeo no se pinta.
const DURACION_VIDEO = "";

function TextoVideo() {
  return (
    <p className="text-center text-[#0067FD] font-bold mb-4" style={rubik}>
      Antes de nada, mira cómo funciona.{" "}
      {DURACION_VIDEO ? `(${DURACION_VIDEO})` : import.meta.env.DEV && <span className="text-orange-600">(X minutos)</span>}
    </p>
  );
}

// Línea de ventajas bajo el formulario
const VENTAJAS = "Gratis · En tu ordenador · Con tu Claude o tu ChatGPT";

// Cada sección va en la misma tarjeta blanca (Hoja) que /anti-agente
function Seccion({ children, id, className = "" }) {
  return (
    <section id={id} className={`scroll-mt-8 ${className}`}>
      <Hoja>{children}</Hoja>
    </section>
  );
}

function Paso({ numero, titulo, children }) {
  return (
    <div className="bg-white border border-gray-200 shadow-md rounded-sm p-6 md:p-8 mb-5 flex gap-5">
      <span className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0067FD] text-white font-bold flex items-center justify-center" style={rubik}>{numero}</span>
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2" style={rubik}>{titulo}</h3>
        {children}
      </div>
    </div>
  );
}

const Subtitulo = ({ children }) => <h3 className="text-xl font-bold text-gray-900 mb-2" style={rubik}>{children}</h3>;

export default function AntiAgenteB() {
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
        <main className="flex-1 flex justify-center px-4 py-12 md:py-20">
          <div className="w-full max-w-4xl">

            {/* 1 · Cabecera */}
            <Seccion className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 uppercase mb-6 leading-tight" style={rubik}>
                Un equipo de agentes para tu tienda online. Gratis.
              </h1>
              <Parrafo className="mb-8">Llevo años haciendo marketing para tiendas online. Ahora mi equipo hace todo mi trabajo de un día en menos de 2 horas. Cada agente se especializa en una tarea e interactúan entre ellos.</Parrafo>
              <Boton href="#apuntarme">{TEXTO_BOTON}</Boton>
              <Contador />
            </Seccion>

            {/* 2 · Vídeo (en producción no se pinta hasta que exista) */}
            {VIDEO_VISIBLE && (
              <Seccion>
                <TextoVideo />
                <Video />
                <div className="text-center mt-8">
                  <Boton href="#apuntarme">{TEXTO_BOTON}</Boton>
                  <Contador />
                </div>
              </Seccion>
            )}

            {/* 3 · Cómo funciona */}
            <Seccion>
              <Titulo>Cómo funciona</Titulo>
              <Paso numero="1" titulo="Cada agente hace una cosa">
                <Parrafo className="mb-0">Cada agente se especializa en una cosa. Por ejemplo, uno lleva tu correo, otro tus emails, otro tu contenido, otro tus anuncios... Hablan entre ellos, como si fuera un equipo de verdad. Por ejemplo, si el de anuncios necesita números de la tienda, se los pide.</Parrafo>
              </Paso>
              <Paso numero="2" titulo="Tú solo revisas">
                <Parrafo>Tú no tienes que coordinar a nadie ni explicar cada cosa dos veces. Aprenden de tu forma de trabajar para no cometer el mismo error dos veces. Te dejan el trabajo preparado y tú solo tienes que revisar.</Parrafo>
                <Parrafo className="mb-0">Por defecto, ningún correo, publicación o anuncio sale de tu negocio sin tu aprobación. Te llega como una tarjeta: lo lees, lo cambias si quieres y le das a enviar. O no.</Parrafo>
              </Paso>
              <Paso numero="3" titulo="Con tus herramientas de siempre">
                <Parrafo className="mb-0">Viene ya montado. Al empezar, le cuentas cómo es tu negocio y el equipo se adapta a tu tono, tus productos, tus clientes. Se conecta con tu tienda (Shopify o WooCommerce), tu email (Klaviyo, MailerLite), Gmail y Meta. No tienes que dejar ninguna de tus herramientas.</Parrafo>
              </Paso>
            </Seccion>

            {/* 4 · Con tu Claude, tu ChatGPT y desde tu ordenador */}
            <Seccion>
              <Titulo>Con tu Claude, tu ChatGPT y desde tu ordenador</Titulo>
              <div className="mb-8">
                <Subtitulo>Con tu propia cuenta de IA</Subtitulo>
                <Parrafo>Funciona con Claude Code y Codex (ChatGPT), los programas oficiales, con tu propia cuenta. Inicias sesión tú y gasta de tu plan: la aplicación no tiene ningún coste extra a lo que ya pagas. Solo está sujeto a los términos de cada proveedor.</Parrafo>
              </div>
              <div>
                <Subtitulo>Todo en tu ordenador</Subtitulo>
                <Parrafo>Tus conversaciones, memorias y archivos se guardan en tu propio ordenador, y las claves y accesos de tus conexiones también, cifrados para que no haya fallos de seguridad.</Parrafo>
                <Parrafo>El uso de tu tienda y tus herramientas va directo de tu ordenador a cada servicio: no pasan por ningún servidor mío. Mis servidores solo reciben tu inicio de sesión (tu email), nada de tu tienda.</Parrafo>
                <Parrafo>Lo que lee o escribe tu equipo pasa por la IA que uses (Claude Code, de Anthropic, o Codex, de OpenAI), según los términos de cada proveedor, no los míos.</Parrafo>
                <Parrafo>Solo si tú lo autorizas, se compartirá algo para mejorar la app.</Parrafo>
              </div>
            </Seccion>

            {/* 5 · Qué recibes en la llamada */}
            <Seccion>
              <Titulo>Qué recibes en la llamada</Titulo>
              <Parrafo><strong>Son solo 5 plazas.</strong></Parrafo>
              <Parrafo>No es una forma de meterte prisa. Son 5 porque las llamadas las hago yo, una a una, y te voy a dar gratis un servicio que será de pago.</Parrafo>
              <Parrafo>Si te quedas una de las 5 plazas, tienes:</Parrafo>
              <Check titulo="Onboarding gratis en videollamada.">Dejamos juntos tu equipo de agentes a punto para tu tienda: conectamos tus herramientas y lo adaptamos a cómo trabajas.</Check>
              <Check titulo="Auditoría de costes gratis.">Miramos qué gasto y qué tiempo te puede quitar Anti-Agente en tu caso.</Check>
              <Check titulo="Oferta de lanzamiento.">Puedo construir herramientas únicas y personalizadas para tus agentes, que te reducirán los costes que vemos en la auditoría de costes. Si te interesa, tendrás un precio especial por lanzamiento, solo para las 5 primeras plazas. Si no lo quieres, me lo dices en la llamada y no pasa nada.</Check>
              <Check titulo="Anti-Studio gratis.">Una app para escribir los emails de tu tienda con IA, pero que no suenan a IA, que te los deja montados o programados en Klaviyo, MailerLite o ActiveCampaign. Por ahora es una app aparte; en la oferta de lanzamiento entra gratis y después será de pago.</Check>
              <div className="text-center mt-8">
                <Boton href="#apuntarme">{TEXTO_BOTON}</Boton>
                <Contador />
              </div>
            </Seccion>

            {/* 6a · Preguntas frecuentes (versión corta) */}
            <Seccion>
              <Titulo>Preguntas frecuentes</Titulo>
              {PREGUNTAS.map(([p, r]) => (
                <div key={p} className="mb-5">
                  <Subtitulo>{p}</Subtitulo>
                  <p className="text-gray-800 text-lg leading-loose">{r}</p>
                </div>
              ))}
            </Seccion>

            {/* 6b · Desbloquea tu plaza */}
            <Seccion id="apuntarme">
              <Titulo>Desbloquea tu plaza</Titulo>
              <Parrafo>Apúntate, te escribo yo y en la llamada te enseño la herramienta, lo dejamos a punto juntos y hacemos la auditoría de costes.</Parrafo>
              {PLAZAS_CERRADAS ? <ListaCerrada /> : <Formulario utm={utm} />}
              <p className="text-sm font-bold text-gray-900 mt-6 text-center" style={rubik}>{VENTAJAS}</p>
            </Seccion>

          </div>
        </main>
        <FooterMinimal />
      </div>
    </>
  );
}
