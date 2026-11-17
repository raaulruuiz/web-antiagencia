import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Footer from "@/components/landing/Footer";

const correo = <a href="mailto:raul@antiagencia.es" className="text-[#0067FD] hover:underline">raul@antiagencia.es</a>;

export default function PoliticaPrivacidadAntiAgente() {
  return (
    <>
    <Helmet>
      <title>Política de privacidad de Anti-Agente</title>
    </Helmet>
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link to="/" className="text-[#0067FD] hover:underline text-sm mb-10 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">Política de privacidad de Anti-Agente</h1>
        <p className="text-white/40 text-sm mb-12">Última actualización: 17 de noviembre de 2026</p>

        <div className="space-y-10 text-white/80 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Quién es el responsable</h2>
            <p>Anti-Agente es una aplicación de escritorio para trabajar con un equipo de agentes de IA que usan tu propia suscripción a Claude o ChatGPT. El responsable de los datos de las cuentas es:</p>
            <ul className="mt-3 space-y-1 pl-4 border-l border-white/10">
              <li><span className="text-white/50">Titular:</span> Raúl Ruiz Romero (Antiagencia)</li>
              <li><span className="text-white/50">NIF:</span> 20995373F</li>
              <li><span className="text-white/50">Domicilio:</span> Calle Defensor de Granada 17A, Ventas de Zafarraya, Granada, España</li>
              <li><span className="text-white/50">Email:</span> {correo}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Qué datos tratamos</h2>
            <p>Para crear tu cuenta solo guardamos en nuestros servidores:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside pl-2">
              <li>Tu email y tu nombre.</li>
              <li>Tu contraseña, cifrada, si te registras con email. Nunca la vemos.</li>
              <li>La fecha de alta y de último acceso a tu cuenta.</li>
            </ul>
            <p className="mt-3">Si entras con Google, recibimos de Google tu nombre, tu email y tu foto de perfil para identificarte.</p>
            <p className="mt-3"><strong className="text-white">Comentarios desde Novedades.</strong> En Configuración › Novedades puedes mandarnos un fallo o una idea. Si lo haces, recibimos:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside pl-2">
              <li>El texto del comentario, hasta 5.000 caracteres.</li>
              <li>El tipo (fallo o idea). Lo decide tu propia IA, en tu ordenador.</li>
              <li>El email de tu cuenta, la versión de la app y quién lo escribe: tú o el nombre del agente que lo propone.</li>
            </ul>
            <p className="mt-3">Nunca se envían tus conversaciones, tus archivos ni tus claves.</p>
            <p className="mt-3"><strong className="text-white">Agentes que comentan.</strong> Algunos agentes pueden proponer comentarios. De partida solo el coordinador; el permiso de cada uno se cambia en Novedades. El ajuste «Ayudar a mejorar Anti-Agente» (Configuración › General) viene apagado. Mientras esté apagado, de la app no sale nada que no hayas mandado tú: lo que propone un agente se queda en Novedades hasta que pulses «Enviar» o «Descartar». Si lo activas, los agentes con permiso lo envían solos, con los mismos datos de arriba. Cualquier envío futuro para mejorar la app (por ejemplo, registros de errores o soporte) también necesitará este permiso y dirá qué se envía.</p>
            <p className="mt-3"><strong className="text-white">Avisos de versión nueva.</strong> Al abrirse y cada 6 horas, la app descarga <span className="text-white">antiagencia.es/anti-agente/novedades.json</span> para saber si hay una versión nueva. No envía datos personales: nuestro servidor solo ve la petición, como cuando visitas cualquier web. Si pulsas «Instalar actualización», el instalador se descarga desde el enlace que indica ese archivo.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Lo que se queda en tu ordenador</h2>
            <p>Salvo los comentarios que decidas enviarnos (punto 2), tus agentes, sus instrucciones y memorias, las conversaciones, las tareas programadas, los archivos que adjuntes y las claves de las herramientas que conectes se guardan en tu ordenador. No los recibimos ni los guardamos en nuestros servidores. Las claves y los permisos de tus cuentas se guardan cifrados.</p>
            <p className="mt-3">Las notas de voz, los audios y los vídeos se transcriben en tu ordenador.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Tu IA y los servicios que conectas</h2>
            <p>Anti-Agente trabaja con tus propias cuentas. Cuando un agente las usa, el contenido necesario se envía directamente desde tu ordenador a ese servicio, bajo sus condiciones y su política de privacidad:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside pl-2">
              <li><strong className="text-white">Claude (Anthropic) y ChatGPT (OpenAI):</strong> la app usa Claude Code o Codex instalados en tu ordenador, con tu suscripción. Reciben lo que escribes a los agentes, sus instrucciones y memorias, los archivos que les dejas leer y lo que traen de los servicios conectados, para responderte y hacer los encargos. También se usa ChatGPT si pides crear imágenes.</li>
              <li><strong className="text-white">Google (Gmail, Calendar, Sheets, Drive, Docs y YouTube):</strong> solo si conectas una cuenta y le das permiso a ese servicio. Los agentes leen lo que necesitan para el encargo. Enviar un correo, subir un archivo o cambiar algo pasa antes por ti, salvo los permisos que tú dejes activados.</li>
              <li><strong className="text-white">Otras herramientas</strong> (por ejemplo Notion, Klaviyo, Meta, Stripe, Shopify o Discord): solo si las conectas con tu clave. Funcionan igual: las lecturas van directas y lo que crea, cambia o borra te pide aprobación.</li>
              <li><strong className="text-white">Tu navegador:</strong> si lo activas para un agente, puede abrir y leer webs en tu Chrome.</li>
            </ul>
            <p className="mt-3">Antiagencia no recibe nada de todo esto.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Para qué usamos tus datos</h2>
            <ul className="mt-3 space-y-2 list-disc list-inside pl-2">
              <li>Crear tu cuenta, dejarte entrar y recuperar tu contraseña. La base legal es la ejecución del servicio que pides.</li>
              <li>Enviarte avisos necesarios sobre tu cuenta o sobre la app.</li>
              <li>Leer tus comentarios de fallos e ideas, contestarte si hace falta y mejorar la app. La base legal es tu consentimiento: los envías tú o los agentes a los que das permiso con «Ayudar a mejorar Anti-Agente», y puedes apagarlo cuando quieras.</li>
              <li>Avisarte de que hay una versión nueva. La base legal es nuestro interés legítimo en que tengas la app al día; no se tratan datos personales.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Uso de los datos de Google</h2>
            <p>El uso y la transferencia de la información recibida de las API de Google cumplen la <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-[#0067FD] hover:underline" target="_blank" rel="noreferrer">Política de Datos de Usuario de los Servicios de API de Google</a>, incluidos sus requisitos de uso limitado.</p>
            <ul className="mt-3 space-y-2 list-disc list-inside pl-2">
              <li>Los datos de tu cuenta de Google (correos, eventos, hojas, archivos, documentos y vídeos) se leen y se usan solo en tu ordenador, para lo que tú pides a los agentes. No pasan por nuestros servidores.</li>
              <li>Solo se envían a tu IA (Claude o ChatGPT) cuando hacen falta para un encargo tuyo.</li>
              <li>No los vendemos, no los usamos para publicidad y no los usamos para entrenar modelos de IA.</li>
              <li>Puedes quitar el permiso cuando quieras desde la app o desde tu cuenta de Google.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Con quién compartimos los datos</h2>
            <p>No vendemos tus datos. Los comparten solo los proveedores que necesitamos para dar el servicio, como encargados del tratamiento:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside pl-2">
              <li><strong className="text-white">Supabase:</strong> aloja las cuentas de usuario y los comentarios que nos envías desde Novedades, en servidores de Europa.</li>
              <li><strong className="text-white">Google:</strong> si eliges entrar con tu cuenta de Google.</li>
              <li><strong className="text-white">Resend:</strong> envía los emails de confirmación y recuperación de contraseña. También nos hace llegar por email cada comentario, con tu email para poder contestarte.</li>
            </ul>
            <p className="mt-3">Algunos proveedores pueden tratar datos fuera del Espacio Económico Europeo, con las garantías que exige la normativa.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Cuánto tiempo los guardamos</h2>
            <p>Mientras tengas la cuenta. Los comentarios que nos envías se guardan también mientras tengas la cuenta, y puedes pedir que los borremos antes. Si pides eliminar la cuenta, borramos sus datos y sus comentarios salvo lo que debamos conservar por ley. Lo que está en tu ordenador se borra al eliminarlo en la app o desinstalarla.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Tus derechos</h2>
            <p>Puedes pedir acceder a tus datos, rectificarlos, eliminarlos, limitar u oponerte a su tratamiento y llevártelos. Para eliminar tu cuenta o ejercer cualquiera de estos derechos, escribe a {correo}. Si crees que no se han respetado, puedes reclamar ante la <a href="https://www.aepd.es" className="text-[#0067FD] hover:underline" target="_blank" rel="noreferrer">Agencia Española de Protección de Datos</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Cambios</h2>
            <p>Si cambiamos esta política, actualizaremos la fecha de arriba y te avisaremos si el cambio es importante.</p>
          </section>

        </div>
      </div>
      <Footer />
    </div>
    </>
  );
}
