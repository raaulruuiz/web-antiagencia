import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Footer from "@/components/landing/Footer";

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link to={createPageUrl("Home")} className="text-[#0067FD] hover:underline text-sm mb-10 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">Política de Privacidad</h1>
        <p className="text-white/40 text-sm mb-12">Antiagencia</p>

        <div className="space-y-10 text-white/80 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Identificación del Responsable del Tratamiento</h2>
            <p>El responsable del tratamiento de los datos personales recogidos en este sitio web es:</p>
            <ul className="mt-3 space-y-1 pl-4 border-l border-white/10">
              <li><span className="text-white/50">Titular:</span> Raúl Ruiz Romero (Antiagencia)</li>
              <li><span className="text-white/50">NIF:</span> 20995373F</li>
              <li><span className="text-white/50">Domicilio:</span> Calle Defensor de Granada 17A, Ventas de Zafarraya, Granada, España</li>
              <li><span className="text-white/50">Email:</span> <a href="mailto:raul@antiagencia.es" className="text-[#0067FD] hover:underline">raul@antiagencia.es</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Finalidad del Tratamiento de Datos</h2>
            <p>En Antiagencia tratamos la información que nos facilitan las personas interesadas con las siguientes finalidades:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside pl-2">
              <li><strong className="text-white">Gestión de consultas y presupuestos:</strong> Atender las solicitudes de información realizadas a través de los formularios de contacto.</li>
              <li><strong className="text-white">Relación comercial y contractual:</strong> Gestionar la venta de productos o servicios, facturación y, en su caso, la entrega física de pedidos.</li>
              <li><strong className="text-white">Envío de comunicaciones comerciales:</strong> Gestión de suscripciones a nuestra newsletter y envío de ofertas o novedades (siempre que el usuario haya dado su consentimiento explícito).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Legitimación para el Tratamiento</h2>
            <p>La base legal para el tratamiento de sus datos es:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside pl-2">
              <li><strong className="text-white">El consentimiento del interesado:</strong> Para la suscripción a la newsletter y consultas generales.</li>
              <li><strong className="text-white">La ejecución de un contrato:</strong> Para la contratación de servicios, compra de productos y emisión de facturas.</li>
              <li><strong className="text-white">Interés legítimo:</strong> Para garantizar la seguridad de la web y mejorar nuestros servicios a través de análisis estadísticos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Destinatarios y Transferencias de Datos</h2>
            <p>Sus datos no se cederán a terceros, salvo obligación legal o cuando sea necesario para la prestación del servicio. Esto incluye:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside pl-2">
              <li><strong className="text-white">Proveedores de servicios de pago:</strong> Pasarelas seguras como Stripe o PayPal.</li>
              <li><strong className="text-white">Herramientas de marketing y análisis:</strong> Mailchimp (para envíos de correo) y Google Analytics.</li>
              <li><strong className="text-white">Logística:</strong> Empresas de mensajería para el envío de productos físicos.</li>
              <li><strong className="text-white">Asesoría legal/fiscal:</strong> Para el cumplimiento de obligaciones contables.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Plazo de Conservación</h2>
            <p>Los datos personales proporcionados se conservarán mientras se mantenga la relación comercial o durante el tiempo necesario para cumplir con las obligaciones legales (generalmente 5 años para obligaciones fiscales y mercantiles). En el caso de la newsletter, hasta que el usuario solicite su baja.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Derechos del Usuario</h2>
            <p>Usted tiene derecho a obtener confirmación sobre si en Antiagencia estamos tratando sus datos personales. Puede ejercer sus derechos de:</p>
            <ul className="mt-3 space-y-1 list-disc list-inside pl-2">
              <li>Acceso, Rectificación y Supresión de sus datos.</li>
              <li>Limitación u Oposición a su tratamiento.</li>
              <li>Portabilidad de los datos.</li>
            </ul>
            <p className="mt-3">Para ejercer estos derechos, puede enviar un correo electrónico a <a href="mailto:raul@antiagencia.es" className="text-[#0067FD] hover:underline">raul@antiagencia.es</a> adjuntando una copia de su DNI. Asimismo, tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Aplicación de Shopify — Antiagencia</h2>
            <p>La aplicación <strong className="text-white">Antiagencia</strong>, disponible en el Shopify App Store, accede a los datos de las tiendas Shopify de nuestros clientes exclusivamente para prestar los servicios contratados con Antiagencia. A continuación se detalla el uso que hacemos de dichos datos:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside pl-2">
              <li><strong className="text-white">Datos a los que accedemos:</strong> Productos, pedidos, clientes, inventario, descuentos y configuración de la tienda.</li>
              <li><strong className="text-white">Finalidad:</strong> Gestión y automatización de operaciones de la tienda en nombre del comerciante (modificación de precios, creación de descuentos, gestión de stock, etc.).</li>
              <li><strong className="text-white">Almacenamiento:</strong> Guardamos únicamente el token de acceso necesario para operar la tienda. No almacenamos datos de clientes finales de la tienda.</li>
              <li><strong className="text-white">Compartición:</strong> No compartimos los datos de las tiendas con terceros. Los datos se procesan internamente en nuestros servidores (Railway) y base de datos (Supabase), bajo las mismas garantías de confidencialidad.</li>
              <li><strong className="text-white">Eliminación:</strong> Al desinstalar la aplicación, el acceso queda revocado automáticamente. Para solicitar la eliminación de los datos almacenados, contacta con <a href="mailto:raul@antiagencia.es" className="text-[#0067FD] hover:underline">raul@antiagencia.es</a>.</li>
            </ul>
            <p className="mt-3">Para cualquier consulta sobre el uso de datos en el contexto de la aplicación de Shopify, puedes contactarnos en <a href="mailto:raul@antiagencia.es" className="text-[#0067FD] hover:underline">raul@antiagencia.es</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Aplicación de TikTok — Antiagencia</h2>
            <p>Antiagencia utiliza la API de TikTok para publicar contenido en nombre de sus clientes en la plataforma TikTok. A continuación se detalla el uso que hacemos de los datos obtenidos a través de dicha integración:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside pl-2">
              <li><strong className="text-white">Datos a los que accedemos:</strong> Información básica de la cuenta de TikTok del cliente (nombre de usuario, ID de cuenta) y contenido de vídeo proporcionado por el propio cliente para su publicación.</li>
              <li><strong className="text-white">Finalidad:</strong> Publicación y programación de contenido de vídeo en TikTok exclusivamente en nombre y con autorización expresa del cliente titular de la cuenta.</li>
              <li><strong className="text-white">Almacenamiento:</strong> Guardamos únicamente los tokens de acceso necesarios para operar la cuenta. No almacenamos contenido de vídeo más allá del tiempo necesario para su publicación.</li>
              <li><strong className="text-white">Compartición:</strong> Los datos de las cuentas de TikTok no se comparten con terceros. Se procesan internamente en nuestros servidores (Railway) bajo las mismas garantías de confidencialidad.</li>
              <li><strong className="text-white">Eliminación:</strong> El cliente puede revocar el acceso en cualquier momento desde la configuración de su cuenta de TikTok. Para solicitar la eliminación de los datos almacenados, contacta con <a href="mailto:raul@antiagencia.es" className="text-[#0067FD] hover:underline">raul@antiagencia.es</a>.</li>
            </ul>
            <p className="mt-3">Para cualquier consulta sobre el uso de datos en el contexto de la integración con TikTok, puedes contactarnos en <a href="mailto:raul@antiagencia.es" className="text-[#0067FD] hover:underline">raul@antiagencia.es</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Cookies y Enlaces a Terceros</h2>
            <p>Este sitio web utiliza cookies propias y de terceros para mejorar la navegación y analizar el tráfico (Google Analytics). Para más información, consulte nuestra <Link to={createPageUrl("PoliticaCookies")} className="text-[#0067FD] hover:underline">Política de Cookies</Link>. Nuestra web puede contener enlaces a sitios externos cuyas políticas de privacidad son ajenas a Antiagencia.</p>
          </section>

        </div>
      </div>
      <Footer />
    </div>
  );
}
