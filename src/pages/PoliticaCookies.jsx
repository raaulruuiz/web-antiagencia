import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Footer from "@/components/landing/Footer";
import { abrirConfiguracionCookies } from "@/lib/consentimiento";

// Política de cookies de antiagencia.es (LSSI-CE art. 22.2, RGPD y guía de la AEPD).
// Coherente con el banner (src/components/CookieBanner.jsx) y src/lib/consentimiento.js.
// BORRADOR 16/11/2026: los recuadros <Falta> solo se ven en local (vite dev).

const ACTUALIZADA = "16 de noviembre de 2026";
const EMAIL = "raul@antiagencia.es";

const B = ({ children }) => <strong className="text-white">{children}</strong>;
const Enlace = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#0067FD] hover:underline">{children}</a>
);

function Seccion({ titulo, children }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-3">{titulo}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Falta({ children }) {
  if (!import.meta.env.DEV) return null;
  return (
    <div className="border-2 border-dashed border-orange-400 bg-orange-50 text-orange-900 text-sm rounded-sm px-4 py-3">
      <strong>PENDIENTE DE RAÚL · </strong>{children}
    </div>
  );
}

// Una fila por cookie o dato guardado: [nombre, quién, para qué, duración]
function Tabla({ filas }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="text-white/50 border-b border-white/10">
            <th className="py-2 pr-4 font-medium">Nombre</th>
            <th className="py-2 pr-4 font-medium">De quién</th>
            <th className="py-2 pr-4 font-medium">Para qué</th>
            <th className="py-2 font-medium">Duración</th>
          </tr>
        </thead>
        <tbody>
          {filas.map(([nombre, quien, para, duracion]) => (
            <tr key={nombre} className="border-b border-white/5 align-top">
              <td className="py-2 pr-4 font-mono text-xs text-white break-all">{nombre}</td>
              <td className="py-2 pr-4">{quien}</td>
              <td className="py-2 pr-4">{para}</td>
              <td className="py-2 whitespace-nowrap">{duracion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Herramienta({ titulo, children }) {
  return (
    <div className="pl-4 border-l border-white/10 space-y-2">
      <h3 className="font-semibold text-white">{titulo}</h3>
      {children}
    </div>
  );
}

export default function PoliticaCookies() {
  return (
    <>
    <Helmet>
      <title>Política de cookies — Antiagencia</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link to={createPageUrl("Home")} className="text-[#0067FD] hover:underline text-sm mb-10 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">Política de Cookies</h1>
        <p className="text-white/40 text-sm mb-12">Antiagencia · Última actualización: {ACTUALIZADA}</p>

        <div className="space-y-10 text-white/80 leading-relaxed">

          <Falta>Borrador técnico basado en la LSSI-CE (art. 22.2), el RGPD y la guía de cookies de la AEPD. No sustituye una revisión legal. Las duraciones de las cookies de terceros son las que indica cada proveedor y pueden cambiar.</Falta>

          <Seccion titulo="1. Qué son las cookies">
            <p>Una cookie es un pequeño archivo que una web guarda en tu navegador para recordar información sobre tu visita. En esta política llamamos también «cookies» a otras formas de guardar datos en tu navegador (como el almacenamiento local) y a los píxeles que hacen lo mismo.</p>
            <p>El responsable de esta web es Raúl Ruiz Romero (Antiagencia). Tienes sus datos en la <Link to="/politica-privacidad" className="text-[#0067FD] hover:underline">Política de Privacidad</Link>.</p>
          </Seccion>

          <Seccion titulo="2. Cómo funciona tu consentimiento">
            <p>La primera vez que entras te mostramos un aviso con dos botones al mismo nivel: <B>Aceptar</B> y <B>Rechazar</B>.</p>
            <ul className="space-y-2 list-disc list-inside pl-2">
              <li>Mientras no elijas, y si rechazas, <B>no se carga ninguna herramienta de terceros que use cookies</B> (Meta, Google Tag Manager, Google Ads ni Hotjar). Solo funcionan las cookies técnicas y la estadística sin cookies (Umami).</li>
              <li>Si aceptas, se cargan esas herramientas y pueden guardar las cookies que se detallan en el apartado 4.</li>
              <li>Seguir navegando o hacer scroll <B>no</B> cuenta como aceptar.</li>
              <li>Guardamos tu elección durante 30 días. Pasado ese tiempo, te volvemos a preguntar.</li>
            </ul>
          </Seccion>

          <Seccion titulo="3. Cookies técnicas y estadística sin cookies (no necesitan tu consentimiento)">
            <p>Son las imprescindibles para que la web funcione o para darte algo que has pedido. No se usan para publicidad ni se comparten con terceros.</p>
            <Tabla filas={[
              ["cookie_consent", "Antiagencia", "Recordar si has aceptado o rechazado las cookies.", "30 días"],
              ["biblioteca_session_token y datos de sesión de la Biblioteca", "Antiagencia", "Mantener abierto tu acceso a la Biblioteca después de dejar tu email.", "Hasta que cierres la sesión o caduque"],
              ["aa-biblioteca-theme", "Antiagencia", "Recordar si prefieres ver la Biblioteca en modo claro u oscuro.", "Hasta que lo borres"],
              ["sb-…-auth-token", "Antiagencia (Supabase)", "Mantener la sesión de las personas con acceso a las áreas privadas.", "Hasta que cierres la sesión"],
            ]} />
            <p><B>Umami</B> es nuestra herramienta de estadística. La tenemos instalada en nuestro propio servidor, no usa cookies ni guarda nada en tu navegador y solo nos da cifras agregadas (visitas, páginas, origen de la visita). Por eso funciona siempre. También contamos las páginas vistas en nuestro propio servidor; si no has aceptado las cookies, ese recuento no guarda nada en tu navegador.</p>
          </Seccion>

          <Seccion titulo="4. Cookies de terceros (solo si las aceptas)">
            <Herramienta titulo="Meta Pixel (Meta Platforms Ireland Ltd.) · publicidad y medición">
              <p>Mide qué visitas llegan desde nuestros anuncios en Facebook e Instagram y nos permite mostrar anuncios a personas que han visitado la web.</p>
              <Tabla filas={[
                ["_fbp", "Meta", "Identificar tu navegador para medir y mostrar anuncios.", "3 meses"],
                ["_fbc", "Meta", "Guardar el clic en un anuncio de Meta por el que has llegado.", "3 meses"],
              ]} />
              <p>Más información: <Enlace href="https://www.facebook.com/privacy/policies/cookies/">política de cookies de Meta</Enlace>.</p>
            </Herramienta>

            <Herramienta titulo="Google Tag Manager y Google Ads (Google Ireland Ltd.) · publicidad y medición">
              <p>Google Tag Manager es la herramienta con la que cargamos las etiquetas de Google. Ahora mismo solo carga Google Ads: mide las conversiones de nuestros anuncios de Google (por ejemplo, cuando alguien se apunta a un formulario después de hacer clic en un anuncio). No usamos Google Analytics.</p>
              <Tabla filas={[
                ["_gcl_au", "Google", "Relacionar tu visita con los anuncios de Google para medir conversiones.", "3 meses"],
                ["_gcl_aw", "Google", "Guardar el clic en un anuncio de Google por el que has llegado.", "3 meses"],
              ]} />
              <p>Google también puede usar cookies en sus propios dominios. Más información: <Enlace href="https://policies.google.com/technologies/cookies?hl=es">cómo usa Google las cookies</Enlace>.</p>
            </Herramienta>

            <Herramienta titulo="Hotjar (Hotjar Ltd.) · análisis de uso">
              <p>Nos ayuda a ver de forma agregada cómo se usa la web (por ejemplo, hasta dónde se lee una página o dónde se hace clic) para mejorarla.</p>
              <Tabla filas={[
                ["_hjSessionUser_…", "Hotjar", "Reconocer tu navegador entre visitas, sin identificarte.", "1 año"],
                ["_hjSession_…", "Hotjar", "Agrupar las páginas de una misma visita.", "30 minutos"],
                ["_hjTLDTest, _hjCookieTest y similares", "Hotjar", "Comprobar que el navegador admite cookies.", "La sesión"],
              ]} />
              <p>Más información: <Enlace href="https://help.hotjar.com/hc/en-us/articles/115011789248-Hotjar-Cookie-Information">cookies de Hotjar</Enlace>.</p>
            </Herramienta>

            <Herramienta titulo="Recuento de páginas propio · estadística">
              <p>Si aceptas, nuestro recuento de páginas guarda en tu navegador un identificador aleatorio para saber si varias visitas son de la misma persona.</p>
              <Tabla filas={[
                ["_session_id", "Antiagencia", "Contar visitas únicas en nuestras estadísticas internas.", "Hasta que lo borres"],
                ["anti-agente-utm", "Antiagencia", "Recordar desde qué enlace llegaste a la lista prioritaria de Anti-Agente.", "Hasta que cierres la pestaña"],
              ]} />
            </Herramienta>
          </Seccion>

          <Seccion titulo="5. Contenido de otras webs integrado en algunas páginas">
            <p>Algunas páginas muestran contenido de otros servicios. Al cargarlo o usarlo, esos servicios pueden guardar sus propias cookies, según sus políticas:</p>
            <ul className="space-y-2 list-disc list-inside pl-2">
              <li><B>YouTube</B> (Google): vídeos de los podcasts. Usamos la versión de privacidad mejorada (youtube-nocookie.com). <Enlace href="https://policies.google.com/technologies/cookies?hl=es">Política de cookies de Google</Enlace>.</li>
              <li><B>MailerLite</B>: los formularios para apuntarte a la newsletter (el de la lista prioritaria de Anti-Agente no carga nada de MailerLite en tu navegador: solo le envía tus datos cuando pulsas el botón). <Enlace href="https://www.mailerlite.com/legal/cookie-policy">Política de cookies de MailerLite</Enlace>.</li>
            </ul>
            <p>Los vídeos de YouTube no se cargan hasta que aceptas las cookies o pulsas «reproducir»: hasta entonces solo ves un recuadro nuestro, y tu navegador no se conecta con YouTube.</p>
            <Falta>Los formularios de MailerLite se pueden considerar parte del servicio que pides al usarlos. Ojo: el script de los formularios de newsletter de MailerLite guarda un identificador (ml_guid) en el navegador al cargar la página, sin esperar al banner.</Falta>
          </Seccion>

          <Seccion titulo="6. Cómo cambiar de opinión o borrar las cookies">
            <p>Puedes cambiar tu elección cuando quieras con el enlace <B>«Configurar cookies»</B> del pie de cualquier página o con este botón:</p>
            <button
              type="button"
              onClick={abrirConfiguracionCookies}
              className="font-semibold text-sm text-white bg-[#0067FD] hover:bg-[#7000FF] px-5 py-2 rounded-lg transition-colors"
            >
              Configurar cookies
            </button>
            <p>Si retiras tu consentimiento, borramos las cookies y los datos de esas herramientas que se habían guardado en esta web y dejamos de cargarlas. Las cookies que esos servicios hayan guardado en sus propios dominios se borran desde tu navegador:</p>
            <ul className="space-y-1 list-disc list-inside pl-2">
              <li><Enlace href="https://support.google.com/chrome/answer/95647?hl=es">Chrome</Enlace></li>
              <li><Enlace href="https://support.mozilla.org/es/kb/Borrar%20cookies">Firefox</Enlace></li>
              <li><Enlace href="https://support.apple.com/es-es/guide/safari/sfri11471/mac">Safari</Enlace></li>
              <li><Enlace href="https://support.microsoft.com/es-es/edge/manage-cookies-in-microsoft-edge-view-allow-block-delete-and-use">Microsoft Edge</Enlace></li>
            </ul>
            <p>Retirar el consentimiento no afecta a lo que se hizo antes con él.</p>
          </Seccion>

          <Seccion titulo="7. Transferencias internacionales">
            <p>Algunos de estos proveedores (Google, Meta) pueden tratar datos en Estados Unidos. Esas transferencias se amparan en el Marco de Privacidad de Datos UE-EE. UU. o en cláusulas contractuales tipo. Tienes más detalle en la <Link to="/politica-privacidad" className="text-[#0067FD] hover:underline">Política de Privacidad</Link>.</p>
          </Seccion>

          <Seccion titulo="8. Cambios y contacto">
            <p>Si cambiamos las herramientas que usamos, actualizaremos esta política y su fecha. Si el cambio afecta a lo que aceptaste, te volveremos a preguntar.</p>
            <p>Para cualquier duda, escribe a <a href={`mailto:${EMAIL}`} className="text-[#0067FD] hover:underline">{EMAIL}</a>.</p>
          </Seccion>

        </div>
      </div>
      <Footer />
    </div>
    </>
  );
}
