import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Footer from "@/components/landing/Footer";

const correo = <a href="mailto:raul@antiagencia.es" className="text-[#0067FD] hover:underline">raul@antiagencia.es</a>;

export default function PoliticaPrivacidadAntiStudio() {
  return (
    <>
    <Helmet>
      <title>Política de privacidad de Anti-Studio</title>
    </Helmet>
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link to="/" className="text-[#0067FD] hover:underline text-sm mb-10 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">Política de privacidad de Anti-Studio</h1>
        <p className="text-white/40 text-sm mb-12">Última actualización: 7 de noviembre de 2026</p>

        <div className="space-y-10 text-white/80 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Quién es el responsable</h2>
            <p>Anti-Studio es una aplicación de escritorio para crear emails. El responsable de los datos de las cuentas es:</p>
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
              <li>Tus respuestas a las preguntas iniciales: si eres marca o agencia, qué quieres crear y la facturación aproximada, si decides contestar.</li>
              <li>Los mensajes y capturas que nos envíes por Feedback.</li>
            </ul>
            <p className="mt-3">Si entras con Google, recibimos de Google tu nombre, tu email y tu foto de perfil. No accedemos a tu Gmail, tus contactos ni otros datos de tu cuenta de Google.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Lo que se queda en tu ordenador</h2>
            <p>Tus marcas, pizarras, emails, audios, imágenes y las claves de las herramientas que conectes, como Klaviyo, se guardan en tu ordenador. No los recibimos ni los guardamos en nuestros servidores. Las claves se guardan cifradas.</p>
            <p className="mt-3">Las notas de voz y los vídeos se transcriben en tu ordenador.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Servicios que conectas tú</h2>
            <p>Anti-Studio trabaja con tus propias cuentas. Cuando usas una de ellas, el contenido necesario se envía directamente desde tu ordenador a ese servicio, bajo sus condiciones y su política de privacidad:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside pl-2">
              <li><strong className="text-white">Claude (Anthropic) y ChatGPT (OpenAI):</strong> reciben el contenido de tu pizarra, el contexto de tu marca y lo que les pidas, para escribir emails o crear imágenes.</li>
              <li><strong className="text-white">Klaviyo:</strong> recibe los emails que subes o programas. Si activas su uso como contexto, la app lee tus emails enviados y sus métricas.</li>
              <li><strong className="text-white">Cómo hablas:</strong> si grabas o subes un audio para analizar tu forma de hablar, se transcribe en tu ordenador y se borra. Solo el texto se envía a tu IA, y el resultado se guarda en tu ordenador.</li>
              <li><strong className="text-white">Tu correo:</strong> si lo conectas, la app lee desde tu ordenador los emails que pidas, sin cambiar nada. Lo que traigas a una pizarra puede enviarse a tu IA cuando se lo pidas.</li>
            </ul>
            <p className="mt-3">Al escanear una web, la app la visita desde tu ordenador. Antiagencia no recibe nada de todo esto.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Para qué usamos tus datos</h2>
            <ul className="mt-3 space-y-2 list-disc list-inside pl-2">
              <li>Crear tu cuenta, dejarte entrar y recuperar tu contraseña. La base legal es la ejecución del servicio que pides.</li>
              <li>Enviarte avisos necesarios sobre tu cuenta o sobre la app.</li>
              <li>Enviarte novedades y consejos por email, solo si marcas la casilla al empezar a usar la app. La base legal es tu consentimiento. Puedes retirarlo cuando quieras con el enlace de baja de cualquiera de esos emails.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Uso de los datos de Google</h2>
            <p>El uso y la transferencia de la información recibida de las API de Google cumplen la <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-[#0067FD] hover:underline" target="_blank" rel="noreferrer">Política de Datos de Usuario de los Servicios de API de Google</a>, incluidos sus requisitos de uso limitado. Solo usamos esos datos para identificarte en la app. No los vendemos ni los usamos para publicidad ni para entrenar modelos de IA.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Con quién compartimos los datos</h2>
            <p>No vendemos tus datos. Los comparten solo los proveedores que necesitamos para dar el servicio, como encargados del tratamiento:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside pl-2">
              <li><strong className="text-white">Supabase:</strong> aloja las cuentas de usuario en servidores de Europa.</li>
              <li><strong className="text-white">Google:</strong> si eliges entrar con tu cuenta de Google.</li>
              <li><strong className="text-white">Proveedor de envío de emails:</strong> para los emails de confirmación y recuperación de contraseña.</li>
              <li><strong className="text-white">MailerLite:</strong> si aceptas recibir novedades, guarda tu nombre y tu email para enviártelas.</li>
            </ul>
            <p className="mt-3">Algunos proveedores pueden tratar datos fuera del Espacio Económico Europeo, con las garantías que exige la normativa.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Cuánto tiempo los guardamos</h2>
            <p>Mientras tengas la cuenta. Si pides eliminarla, borramos sus datos salvo los que debamos conservar por ley. Lo que está en tu ordenador se borra al eliminarlo en la app o desinstalarla. Las marcas eliminadas se guardan 30 días en tu ordenador por si quieres recuperarlas, salvo que las elimines definitivamente.</p>
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
