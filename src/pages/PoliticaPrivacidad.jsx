import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Footer from "@/components/landing/Footer";

// Política de privacidad de antiagencia.es (RGPD, LOPDGDD y LSSI-CE).
// BORRADOR 16/11/2026: los recuadros <Falta> son decisiones o datos que tiene que
// confirmar Raúl. Solo se ven en local (vite dev); en producción no se renderizan.

const ACTUALIZADA = "16 de noviembre de 2026";
const EMAIL = "raul@antiagencia.es";

const Mail = () => <a href={`mailto:${EMAIL}`} className="text-[#0067FD] hover:underline">{EMAIL}</a>;
const B = ({ children }) => <strong className="text-white">{children}</strong>;

function Seccion({ titulo, children }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-3">{titulo}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

const Lista = ({ children }) => <ul className="space-y-2 list-disc list-inside pl-2">{children}</ul>;

function Falta({ children }) {
  if (!import.meta.env.DEV) return null;
  return (
    <div className="border-2 border-dashed border-orange-400 bg-orange-50 text-orange-900 text-sm rounded-sm px-4 py-3">
      <strong>PENDIENTE DE RAÚL · </strong>{children}
    </div>
  );
}

function Tratamiento({ titulo, datos, finalidad, base, conservacion, children }) {
  return (
    <div className="pl-4 border-l border-white/10 space-y-1">
      <h3 className="font-semibold text-white">{titulo}</h3>
      <p><span className="text-white/50">Datos:</span> {datos}</p>
      <p><span className="text-white/50">Para qué:</span> {finalidad}</p>
      <p><span className="text-white/50">Base jurídica:</span> {base}</p>
      <p><span className="text-white/50">Cuánto tiempo:</span> {conservacion}</p>
      {children}
    </div>
  );
}

export default function PoliticaPrivacidad() {
  return (
    <>
    <Helmet>
      <title>Política de privacidad — Antiagencia</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link to={createPageUrl("Home")} className="text-[#0067FD] hover:underline text-sm mb-10 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">Política de Privacidad</h1>
        <p className="text-white/40 text-sm mb-12">Antiagencia · Última actualización: {ACTUALIZADA}</p>

        <div className="space-y-10 text-white/80 leading-relaxed">

          <Falta>Borrador técnico basado en el RGPD (Reglamento UE 2016/679), la LOPDGDD (LO 3/2018) y la LSSI-CE (Ley 34/2002). No sustituye una revisión legal. Las notas naranjas no se publican: solo se ven en la revisión.</Falta>

          <Seccion titulo="1. Quién es el responsable de tus datos">
            <p>El responsable del tratamiento de los datos personales que se recogen en este sitio web (antiagencia.es) es:</p>
            <ul className="space-y-1 pl-4 border-l border-white/10">
              <li><span className="text-white/50">Titular:</span> Raúl Ruiz Romero (Antiagencia)</li>
              <li><span className="text-white/50">NIF:</span> 20995373F</li>
              <li><span className="text-white/50">Domicilio:</span> Calle Defensor de Granada 17A, Ventas de Zafarraya, Granada, España</li>
              <li><span className="text-white/50">Email de contacto (también para privacidad):</span> <Mail /></li>
            </ul>
            <p>Antiagencia no está obligada a nombrar un delegado de protección de datos. Para cualquier cuestión sobre tus datos, escribe al email anterior.</p>
          </Seccion>

          <Seccion titulo="2. Qué datos tratamos, para qué, con qué base y cuánto tiempo">
            <p>Solo tratamos los datos que nos das tú al rellenar un formulario, reservar una llamada o escribirnos, y los datos de navegación que se indican en el apartado de analítica. No pidas ni envíes datos especialmente protegidos (salud, ideología, etc.): no los necesitamos.</p>

            <Tratamiento
              titulo="a) Lista prioritaria de Anti-Agente"
              datos="nombre, email, web de tu tienda y, si quieres contárnoslo, tu respuesta libre sobre la tarea que más tiempo te quita. MailerLite registra además la fecha y la dirección IP del alta. Si después reservas una llamada, el origen de la visita (UTM) se añade a la reserva."
              finalidad="apuntarte a la lista prioritaria, escribirte personalmente sobre Anti-Agente, valorar si encaja con tu tienda, agendar contigo una videollamada si quieres y enviarte la newsletter diaria de Antiagencia."
              base="tu consentimiento (art. 6.1.a RGPD y, para la newsletter, art. 21 LSSI-CE), que das marcando la casilla del formulario, que aparece sin marcar y es obligatoria para apuntarte. Esa casilla cubre a la vez la lista prioritaria y la newsletter diaria. La videollamada, si la pides, se basa además en medidas precontractuales a petición tuya (art. 6.1.b RGPD)."
              conservacion="mientras no te des de baja ni retires tu consentimiento. Cada correo incluye un enlace para darte de baja."
            />

            <Tratamiento
              titulo="b) Newsletter y comunicaciones por email"
              datos="email y, si lo das, tu nombre; datos de apertura y clics de los correos."
              finalidad="enviarte la newsletter diaria y novedades de Antiagencia, si te has suscrito en un formulario de newsletter o te has apuntado a la lista prioritaria de Anti-Agente aceptando recibirla."
              base="tu consentimiento expreso (art. 6.1.a RGPD y art. 21 LSSI-CE), que das al enviar el formulario de suscripción o, en la lista prioritaria, al marcar su casilla. Cada correo incluye un enlace para darte de baja."
              conservacion="mientras no te des de baja ni retires tu consentimiento. Después conservamos solo tu email en una lista de bajas, para no volver a escribirte."
            />

            <Tratamiento
              titulo="c) Reservas de llamadas"
              datos="nombre, email, fecha y hora elegidas y lo que quieras contarnos en las notas (y el origen de la visita, si llegas desde un enlace con UTM)."
              finalidad="agendar la videollamada, enviarte la invitación y los avisos, y permitirte cambiarla o cancelarla."
              base="medidas precontractuales aplicadas a petición tuya (art. 6.1.b RGPD)."
              conservacion="12 meses desde la fecha de la llamada, salvo que se convierta en una relación comercial."
            />

            <Tratamiento
              titulo="d) Contacto y presupuestos"
              datos="los que nos des al escribirnos (normalmente nombre, email, tienda y tu consulta)."
              finalidad="responder a tu consulta o prepararte un presupuesto."
              base="medidas precontractuales a petición tuya (art. 6.1.b RGPD) o, en consultas generales, tu consentimiento (art. 6.1.a RGPD)."
              conservacion="el tiempo necesario para atenderte y, si no hay contratación, 12 meses."
            />

            <Tratamiento
              titulo="e) Clientes"
              datos="datos de contacto y de facturación."
              finalidad="prestar los servicios contratados, facturar y cumplir obligaciones contables y fiscales."
              base="ejecución del contrato (art. 6.1.b RGPD) y cumplimiento de obligaciones legales (art. 6.1.c RGPD)."
              conservacion="mientras dure la relación y, después, durante los plazos legales (hasta 6 años para la documentación contable y 4 años para la fiscal)."
            />

            <Tratamiento
              titulo="f) Analítica, medición y publicidad"
              datos="datos de navegación: páginas visitadas, origen de la visita, dispositivo y navegador, interacciones y, en el caso de herramientas de terceros con cookies, identificadores online y la dirección IP."
              finalidad="saber cuántas personas visitan la web y qué funciona (Umami, sin cookies, y nuestro recuento propio de páginas vistas); y, solo si aceptas las cookies, medir campañas y mostrar publicidad (Meta Pixel, y Google Ads a través de Google Tag Manager) y analizar cómo se usa la web (Hotjar). No usamos Google Analytics."
              base="interés legítimo en conocer el uso de la web de forma agregada (art. 6.1.f RGPD) para la estadística que no guarda nada en tu navegador; tu consentimiento (art. 6.1.a RGPD y art. 22.2 LSSI-CE) para las herramientas que usan cookies o identificadores. Hasta que no pulsas «Aceptar» en el aviso de cookies, esas herramientas no se cargan."
              conservacion="la estadística sin cookies, de forma agregada, mientras sea útil; las cookies, según los plazos de la Política de Cookies; lo que guarda cada proveedor, según sus condiciones."
            />

            <Tratamiento
              titulo="g) Acceso a áreas privadas"
              datos="email y contraseña (cifrada) de las personas a las que damos acceso."
              finalidad="permitir el acceso a contenidos privados de la web."
              base="la relación que justifica el acceso (art. 6.1.b RGPD)."
              conservacion="mientras la cuenta esté activa."
            />

            <p>No tomamos decisiones automatizadas ni elaboramos perfiles con efectos jurídicos o significativos sobre ti (art. 22 RGPD). Las personas que leen y responden tus mensajes y solicitudes son personas, no un sistema automático.</p>
            <p>Si nos das datos de otra persona, debes haberla informado antes. Los menores de 14 años no pueden facilitarnos sus datos (art. 7 LOPDGDD).</p>
          </Seccion>

          <Seccion titulo="3. Quién más accede a tus datos">
            <p>No vendemos ni cedemos tus datos a terceros, salvo obligación legal. Para que la web funcione usamos proveedores que tratan datos por cuenta nuestra (encargados del tratamiento), con contrato y solo según nuestras instrucciones:</p>
            <Lista>
              <li><B>MailerLite</B> (UAB MailerLite, Lituania): formularios, lista prioritaria y newsletter.</li>
              <li><B>Google</B> (Google Ireland Ltd.): correo electrónico (Gmail / Google Workspace), Google Calendar y Google Meet para las reservas, y Google Tag Manager y Google Ads para medir los anuncios, si aceptas las cookies.</li>
              <li><B>Supabase</B> (Supabase Inc., EE. UU.): base de datos de la web, de las reservas y de las cuentas de acceso, alojada en la Unión Europea (París).</li>
              <li><B>Vercel</B> (Vercel Inc., EE. UU.): alojamiento de la web.</li>
              <li><B>Railway</B> (Railway Corp., EE. UU.): servidores de nuestras automatizaciones (reservas, avisos y recuento de visitas) y de nuestra analítica Umami, que instalamos nosotros y no usa cookies, alojados en la Unión Europea (Países Bajos).</li>
              <li><B>Meta</B> (Meta Platforms Ireland Ltd.): Meta Pixel, si aceptas las cookies.</li>
              <li><B>Hotjar</B> (Hotjar Ltd., Malta): análisis de uso de la web, si aceptas las cookies.</li>
              <li><B>Stripe</B> (Stripe Payments Europe Ltd., Irlanda): pagos, cuando compras algo a través de un enlace de pago.</li>
              <li><B>Wistia</B> (Wistia Inc., EE. UU.) y <B>YouTube</B> (Google): reproducción de algunos vídeos de la web.</li>
              <li><B>Calendly</B> (Calendly LLC, EE. UU.): calendario de reservas de algunas páginas.</li>
              <li>Asesoría fiscal y contable, para cumplir obligaciones legales con clientes.</li>
            </Lista>
            <Falta>Meta y Google Ads funcionan en parte como responsables independientes de lo que miden (no solo como encargados). Si quieres afinarlo, es un punto para la revisión legal.</Falta>
          </Seccion>

          <Seccion titulo="4. Transferencias internacionales">
            <p>La base de datos (Supabase) y nuestros servidores (Railway) están alojados en la Unión Europea. Aun así, algunos proveedores son empresas de Estados Unidos o pueden acceder a datos desde allí (Google, Meta, Supabase, Vercel, Railway, Wistia, Calendly). En esos casos la transferencia se ampara en el Marco de Privacidad de Datos UE-EE. UU. cuando la empresa está certificada o, si no, en las cláusulas contractuales tipo aprobadas por la Comisión Europea (art. 45 y 46 RGPD). Puedes pedirnos más información en <Mail />.</p>
            <Falta>Regiones comprobadas el 16/11: Supabase de la web en eu-west-3 (París) y los tres servicios de Railway en europe-west4 (Países Bajos). Falta que aceptes el contrato de encargo (DPA) en el panel de cada proveedor: lo detallo en el informe.</Falta>
          </Seccion>

          <Seccion titulo="5. Tus derechos">
            <p>Puedes ejercer en cualquier momento tus derechos de:</p>
            <Lista>
              <li><B>Acceso:</B> saber qué datos tuyos tratamos.</li>
              <li><B>Rectificación:</B> corregir datos inexactos.</li>
              <li><B>Supresión:</B> pedir que los borremos.</li>
              <li><B>Oposición:</B> oponerte a un tratamiento, también al envío de comunicaciones.</li>
              <li><B>Limitación:</B> pedir que dejemos de usarlos temporalmente.</li>
              <li><B>Portabilidad:</B> recibir tus datos en un formato habitual para llevártelos.</li>
            </Lista>
            <p>Escribe a <Mail /> indicando qué derecho quieres ejercer. Si tenemos dudas razonables sobre tu identidad, podremos pedirte información adicional para confirmarla. Te responderemos en el plazo de un mes, ampliable en dos meses más en casos complejos.</p>
            <p>Si crees que no hemos atendido bien tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-[#0067FD] hover:underline">www.aepd.es</a>).</p>
          </Seccion>

          <Seccion titulo="6. Retirar tu consentimiento y darte de baja">
            <p>Puedes retirar tu consentimiento cuando quieras, sin que afecte a lo que hayamos hecho antes con él:</p>
            <Lista>
              <li><B>Newsletter y lista prioritaria:</B> con el enlace de baja de cualquier correo o escribiendo a <Mail />.</li>
              <li><B>Reservas:</B> con el enlace para cambiar o cancelar que viene en la invitación, o escribiendo a <Mail />.</li>
              <li><B>Cookies:</B> con el enlace «Configurar cookies» del pie de cualquier página, como explica la <Link to="/PoliticaCookies" className="text-[#0067FD] hover:underline">Política de Cookies</Link>.</li>
            </Lista>
          </Seccion>

          <Seccion titulo="7. Anti-Agente">
            <p>Anti-Agente es una aplicación en desarrollo que funcionará en el ordenador de cada usuario. Esta política cubre solo esta web y las listas (como la lista prioritaria), no el uso de la aplicación. La aplicación tendrá su propia política de privacidad, que publicaremos junto con ella.</p>
            <p>La aplicación Anti-Studio tiene su propia <Link to="/anti-studio/privacidad" className="text-[#0067FD] hover:underline">política de privacidad</Link>.</p>
          </Seccion>

          <Seccion titulo="8. Aplicación de Shopify — Antiagencia">
            <p>La aplicación <B>Antiagencia</B>, disponible en el Shopify App Store, accede a los datos de las tiendas Shopify de nuestros clientes exclusivamente para prestar los servicios contratados con Antiagencia. A continuación se detalla el uso que hacemos de dichos datos:</p>
            <Lista>
              <li><B>Datos a los que accedemos:</B> Productos, pedidos, clientes, inventario, descuentos y configuración de la tienda.</li>
              <li><B>Finalidad:</B> Gestión y automatización de operaciones de la tienda en nombre del comerciante (modificación de precios, creación de descuentos, gestión de stock, etc.).</li>
              <li><B>Almacenamiento:</B> Guardamos únicamente el token de acceso necesario para operar la tienda. No almacenamos datos de clientes finales de la tienda.</li>
              <li><B>Compartición:</B> No compartimos los datos de las tiendas con terceros. Los datos se procesan internamente en nuestros servidores (Railway) y base de datos (Supabase), bajo las mismas garantías de confidencialidad.</li>
              <li><B>Eliminación:</B> Al desinstalar la aplicación, el acceso queda revocado automáticamente. Para solicitar la eliminación de los datos almacenados, contacta con <Mail />.</li>
            </Lista>
            <p>Para cualquier consulta sobre el uso de datos en el contexto de la aplicación de Shopify, puedes contactarnos en <Mail />.</p>
          </Seccion>

          <Seccion titulo="9. Aplicación de TikTok — Automatizaciones (Antiagencia)">
            <p>Antiagencia opera la aplicación <B>Automatizaciones</B>, registrada en TikTok for Developers, que utiliza la API de TikTok para publicar contenido en nombre de sus clientes en la plataforma TikTok. A continuación se detalla el uso que hacemos de los datos obtenidos a través de dicha integración:</p>
            <Lista>
              <li><B>Datos a los que accedemos:</B> Información básica de la cuenta de TikTok del cliente (nombre de usuario, ID de cuenta) y contenido de vídeo proporcionado por el propio cliente para su publicación.</li>
              <li><B>Finalidad:</B> Publicación y programación de contenido de vídeo en TikTok exclusivamente en nombre y con autorización expresa del cliente titular de la cuenta.</li>
              <li><B>Almacenamiento:</B> Guardamos únicamente los tokens de acceso necesarios para operar la cuenta. No almacenamos contenido de vídeo más allá del tiempo necesario para su publicación.</li>
              <li><B>Compartición:</B> Los datos de las cuentas de TikTok no se comparten con terceros. Se procesan internamente en nuestros servidores (Railway) bajo las mismas garantías de confidencialidad.</li>
              <li><B>Eliminación:</B> El cliente puede revocar el acceso en cualquier momento desde la configuración de su cuenta de TikTok. Para solicitar la eliminación de los datos almacenados, contacta con <Mail />.</li>
            </Lista>
            <p>Para cualquier consulta sobre el uso de datos en el contexto de la integración con TikTok, puedes contactarnos en <Mail />.</p>
          </Seccion>

          <Seccion titulo="10. Seguridad">
            <p>Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos: conexión cifrada (HTTPS), acceso restringido a las herramientas y contraseñas cifradas. Si se produjera una brecha de seguridad que pusiera en riesgo tus datos, lo notificaríamos a la AEPD y, cuando corresponda, a ti.</p>
          </Seccion>

          <Seccion titulo="11. Cookies y enlaces a terceros">
            <p>Esta web usa cookies propias y, solo si las aceptas, de terceros. Tienes el detalle en la <Link to="/PoliticaCookies" className="text-[#0067FD] hover:underline">Política de Cookies</Link>. La web puede contener enlaces a sitios externos, que tienen sus propias políticas de privacidad.</p>
          </Seccion>

          <Seccion titulo="12. Cambios en esta política">
            <p>Si cambiamos esta política, publicaremos aquí la nueva versión con su fecha de actualización. Si el cambio es importante y tenemos tu email, te avisaremos.</p>
          </Seccion>

        </div>
      </div>
      <Footer />
    </div>
    </>
  );
}
