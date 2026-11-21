import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import FooterMinimal from "@/components/landing/FooterMinimal";
import {
  APROBACION, Boton, PREGUNTAS, Check, Contador, Formulario, Hoja, ListaCerrada, Microcopy, Parrafo, Pendiente, PLAZAS_CERRADAS, rubik, TEXTO_BAJO_BOTON, TEXTO_BOTON, Titulo, Video, VIDEO_VISIBLE, leerUtm,
} from "./antiAgenteComun";

// /anti-agente-a — versión A de la landing, solo como RESPALDO oculto (noindex, sin enlaces).
// La oficial en /anti-agente es la versión B (AntiAgenteB.jsx) desde el 17-11-2026.
// Textos: «cambios v2» de Perro Sanxe (16-11-2026) sobre el PDF del mismo día, con las
// correcciones factuales de Anti-Agente (IA, datos, aprobación, conexiones).
// Los recuadros <Pendiente> son notas para Raúl: solo se ven en local, nunca en producción.

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
              {/* «Te lo enseño en el vídeo:» solo se pinta cuando el vídeo se ve (en producción, cuando exista). */}
              <Parrafo className="mb-8">Llevo años haciendo marketing para tiendas online. Ahora mi equipo hace todo mi trabajo de un día en menos de 2 horas. Cada agente se especializa en una tarea e interactúan entre ellos. Y te lo entrego completamente gratis.{VIDEO_VISIBLE && " Te lo enseño en el vídeo:"}</Parrafo>
              <Pendiente>Descripción para buscadores y al compartir: sigue la general de la web en las redes que no leen la de esta página. Pendiente de decisión de Raúl; no se toca.</Pendiente>
              <Video />
              <div className="text-center mt-8">
                <Boton href="#apuntarme">{TEXTO_BOTON}</Boton>
                <Contador />
                <Microcopy>{TEXTO_BAJO_BOTON}</Microcopy>
              </div>
            </Hoja>

            {/* 1 bis · Las 5 plazas */}
            <Hoja>
              <Titulo>Empiezo con 5 tiendas. Y con esas 5 lo monto yo.</Titulo>
              <Parrafo>No es una forma de meterte prisa. Son 5 porque las llamadas las hago yo, una a una, y te voy a dar gratis un servicio que será de pago.</Parrafo>
              <Parrafo>Si te quedas una de las 5 plazas, tienes:</Parrafo>
              <Check titulo="Onboarding gratis en videollamada.">Dejamos juntos tu equipo de agentes a punto para tu tienda: conectamos tus herramientas y lo adaptamos a cómo trabajas.</Check>
              <Check titulo="Auditoría de costes gratis.">Miramos qué gasto y qué tiempo te puede quitar Anti-Agente en tu caso. En mi caso, me ahorré más de 200 € al mes en costes fijos, y el trabajo de un día entero lo hago en 2 horas.</Check>
              <Check titulo="Oferta de lanzamiento.">Puedo construir herramientas únicas y personalizadas para tus agentes, que te reducirán los costes que vemos en la auditoría de costes. Si te interesa, tendrás un precio especial por lanzamiento, solo para las 5 primeras plazas. Si no lo quieres, me lo dices en la llamada y no pasa nada.</Check>
              <Check titulo="Anti-Email gratis.">Una herramienta para escribir los emails de tu tienda con IA, pero que no suenan a IA, que te los deja montados o programados en Klaviyo, MailerLite o ActiveCampaign. Va dentro de Anti-Agente y la usan tus agentes; en la oferta de lanzamiento entra gratis y después será de pago.</Check>
              <div className="mt-6">
                <Boton href="#apuntarme">{TEXTO_BOTON}</Boton>
                <Contador />
              </div>
            </Hoja>

            {/* 2 · Qué hace tu equipo */}
            <Hoja>
              <Titulo>Lo que haces tú, ahora lo prepara tu equipo.</Titulo>
              <Parrafo>Anti-Agente es una app con un equipo de agentes con IA. Consumen de tus propias suscripciones, así que no tienen coste extra. Cada uno se ocupa de una parte de tu tienda y te lo deja preparado para que tú lo revises.</Parrafo>
              <Parrafo>Algunos ejemplos de lo que pueden hacer:</Parrafo>
              <Check titulo="Correo:">lee tu bandeja, te dice qué es importante y te deja las respuestas escritas.</Check>
              <Check titulo="Email marketing:">prepara tus newsletters y campañas con tu tono. No parece que lo haya escrito una IA.</Check>
              <Check titulo="Contenido y redes:">analiza tu contenido y el de tu competencia, te propone ideas e incluso te edita los vídeos e imágenes.</Check>
              <Check titulo="Publicidad:">revisa tus anuncios, te monta las campañas, optimiza presupuestos...</Check>
              <Check titulo="Números:">te resume cada mañana cómo va la tienda.</Check>
              <Check>También pueden editar la web e implementar funciones que serían de pago con otras herramientas.</Check>
              <Parrafo className="mt-6">Viene ya montado. Al empezar, le cuentas cómo es tu negocio y el equipo se adapta a tu tono, tus productos, tus clientes. Se conecta con tu tienda (Shopify o WooCommerce), tu email (Klaviyo, MailerLite), Gmail y Meta. No tienes que dejar ninguna de tus herramientas.</Parrafo>
            </Hoja>

            {/* 3 · Un equipo de verdad */}
            <Hoja>
              <Titulo>Como tener tu propio equipo. Tú solo revisas.</Titulo>
              <Parrafo>Cada agente se especializa en una cosa. Por ejemplo, uno lleva tu correo, otro tus emails, otro tu contenido, otro tus anuncios... Hablan entre ellos, como si fuera un equipo de verdad. Por ejemplo, si el de anuncios necesita números de la tienda, se los pide.</Parrafo>
              <Parrafo>Tú no tienes que coordinar a nadie ni explicar cada cosa dos veces. Aprenden de tu forma de trabajar para no cometer el mismo error dos veces. Te dejan el trabajo preparado y tú solo tienes que revisar.</Parrafo>
              <Parrafo>Y si algo no te encaja, se lo dices como a una persona. Y si tienes algún problema, podrás enviarme los comentarios para que yo lo revise.</Parrafo>
              <Parrafo>Tus agentes hablan cualquier idioma, así que puedes expandir el negocio a otros países si lo deseas.</Parrafo>
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
              <Check titulo="Tu propia cuenta de IA.">Funciona con Claude Code y Codex (ChatGPT), los programas oficiales, con tu propia cuenta. Inicias sesión tú y gasta de tu plan: la aplicación no tiene ningún coste extra a lo que ya pagas. Solo está sujeto a los términos de cada proveedor.</Check>
              <Check titulo="Tus herramientas de siempre,">si quieres conectarlas: tu tienda (Shopify, WooCommerce), tu email (Klaviyo, MailerLite), Gmail y Meta.</Check>
              <Check titulo="Herramientas a medida:">en la auditoría de costes, veremos qué herramientas a medida se pueden crear para tus agentes, que sustituyan herramientas actuales y te ahorren dinero. El desarrollo tiene un precio especial de lanzamiento, aunque puedes rechazarlo si solo quieres los bots.</Check>
              <Parrafo className="mt-6"><strong>Para pequeñas empresas, no para multinacionales.</strong> Está pensado para tiendas donde el dueño hace mucho o tiene un equipo pequeño.</Parrafo>
            </Hoja>

            {/* 7 · Lo que viene */}
            <Hoja>
              <Titulo>Esto acaba de empezar</Titulo>
              <Check>Puedes enviar tu feedback, comentarios y funcionalidades que quieras que tenga la app para que las desarrolle.</Check>
              <Check>Añadiré más herramientas propias dentro de la propia app.</Check>
              <Check>Añadiré más skills especializadas para tus agentes.</Check>
              <Check>Añadiré más conexiones con las herramientas que ya existen.</Check>
              <Check>Podrás ver todo lo que hay pendiente en la hoja de ruta de la aplicación.</Check>
              <Parrafo className="mt-6">Cada semana tendrás al menos una nueva actualización.</Parrafo>
            </Hoja>

            {/* 8 · Preguntas */}
            <Hoja>
              <Titulo>Preguntas frecuentes</Titulo>
              {PREGUNTAS.map(([p, r]) => (
                <div key={p} className="mb-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1" style={rubik}>{p}</h3>
                  <p className="text-gray-800 text-lg leading-loose">{r}</p>
                </div>
              ))}
              <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-900 mb-1" style={rubik}>¿Dónde quedan los datos de mi tienda?</h3>
                <p className="text-gray-800 text-lg leading-loose mb-3">En tu ordenador. Tus conversaciones, memorias y archivos se guardan en tu propio ordenador, y las claves y accesos de tus conexiones también, cifrados para que no haya fallos de seguridad.</p>
                <p className="text-gray-800 text-lg leading-loose mb-3">El uso de tu tienda y tus herramientas va directo de tu ordenador a cada servicio: no pasan por ningún servidor mío. Mis servidores solo reciben tu inicio de sesión (tu email), nada de tu tienda.</p>
                <p className="text-gray-800 text-lg leading-loose mb-3">Lo que lee o escribe tu equipo pasa por la IA que uses (Claude Code, de Anthropic, o Codex, de OpenAI), según los términos de cada proveedor, no los míos.</p>
                <p className="text-gray-800 text-lg leading-loose">Solo si tú lo autorizas, se compartirá algo para mejorar la app.</p>
              </div>
              <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-900 mb-1" style={rubik}>¿Y si ya tengo equipo?</h3>
                <p className="text-gray-800 text-lg leading-loose">En la llamada podrán venir e instalamos la aplicación para ellos también: cada uno puede tener su equipo de agentes para su propio trabajo. Esto no consume plazas extra, está dentro de tu propia plaza.</p>
              </div>
            </Hoja>

            {/* 9 · Cierre + formulario */}
            <div id="apuntarme" className="scroll-mt-8">
              <Hoja>
                <Titulo>Imagina tenerlo hecho a las 9.</Titulo>
                <Parrafo>Apúntate, te escribo yo y en la llamada te enseño la herramienta, lo dejamos a punto juntos y hacemos la auditoría de costes.</Parrafo>
                {PLAZAS_CERRADAS ? <ListaCerrada /> : <Formulario utm={utm} />}
                <Microcopy>{APROBACION}.</Microcopy>
              </Hoja>
            </div>

          </div>
        </div>
        <FooterMinimal />
      </div>
    </>
  );
}
