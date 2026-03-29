import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Footer from "@/components/landing/Footer";

export default function PoliticaCookies() {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link to={createPageUrl("Home")} className="text-[#0067FD] hover:underline text-sm mb-10 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">Política de Cookies</h1>
        <p className="text-white/40 text-sm mb-12">Antiagencia</p>

        <div className="space-y-10 text-white/80 leading-relaxed">

          <p>Cookie es un fichero que se descarga en su ordenador al acceder a determinadas páginas web. Las cookies permiten a una página web, entre otras cosas, almacenar y recuperar información sobre los hábitos de navegación de un usuario o de su equipo y, dependiendo de la información que contengan y de la forma en que utilice su equipo, pueden utilizarse para reconocer al usuario.</p>
          <p>El navegador del usuario memoriza cookies en el disco duro solamente durante la sesión actual ocupando un espacio de memoria mínimo y no perjudicando al ordenador. Las cookies no contienen ninguna clase de información personal específica, y la mayoría de las mismas se borran del disco duro al finalizar la sesión de navegador.</p>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Consentimiento</h2>
            <p>Sin su expreso consentimiento —mediante la activación de las cookies en su navegador y el clic en el botón de aceptación de nuestro banner— Raúl Ruiz Romero (Antiagencia) no enlazará en las cookies los datos memorizados con sus datos personales proporcionados en el momento del registro o la compra.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. ¿Qué tipos de cookies utiliza esta página web?</h2>
            <ul className="space-y-2 list-disc list-inside pl-2">
              <li><strong className="text-white">Cookies técnicas:</strong> Permiten al usuario la navegación y el uso de opciones como controlar el tráfico, identificar la sesión o realizar el proceso de compra.</li>
              <li><strong className="text-white">Cookies de personalización:</strong> Permiten acceder al servicio con características predefinidas (idioma, tipo de navegador, etc.).</li>
              <li><strong className="text-white">Cookies de análisis:</strong> Tratadas por nosotros o terceros (como Google Analytics), nos permiten cuantificar el número de usuarios y realizar mediciones estadísticas para mejorar nuestra oferta.</li>
              <li><strong className="text-white">Cookies publicitarias:</strong> Gestionan de forma eficaz los espacios publicitarios adecuando el anuncio al perfil de navegación del usuario.</li>
              <li><strong className="text-white">Cookies de terceros:</strong> Antiagencia utiliza servicios de terceros para recopilar información con fines estadísticos y de prestación de servicios relacionados con la actividad del Website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Detalle de servicios de terceros y cookies utilizadas</h2>
            <div className="space-y-6">
              <div className="pl-4 border-l border-white/10">
                <h3 className="text-white font-medium mb-1">Wistia (Vídeo)</h3>
                <p>Utilizamos Wistia para la reproducción de contenido en vídeo. Sus cookies almacenan el progreso del vídeo y acciones de marketing.</p>
              </div>
              <div className="pl-4 border-l border-white/10">
                <h3 className="text-white font-medium mb-1">Elementor (Diseño)</h3>
                <p>Utilizadas para la creación y visualización de contenido. No comparten datos con terceros.</p>
              </div>
              <div className="pl-4 border-l border-white/10">
                <h3 className="text-white font-medium mb-1">WordPress (Funcional)</h3>
                <p>Cookies necesarias para el funcionamiento del gestor de contenidos, mantener sesiones abiertas y preferencias de usuario.</p>
              </div>
              <div className="pl-4 border-l border-white/10">
                <h3 className="text-white font-medium mb-1">Google Adsense / Google Analytics (Marketing y Análisis)</h3>
                <p>Utilizamos servicios de Google para medir la audiencia y, en su caso, mostrar publicidad. Estas cookies recopilan información, incluida la dirección IP del usuario, que será transmitida y tratada por Google en los términos fijados en su web oficial.</p>
              </div>
              <div className="pl-4 border-l border-white/10">
                <h3 className="text-white font-medium mb-1">Complianz (Gestión de Consentimiento)</h3>
                <p>Utilizamos Complianz para gestionar tus preferencias de cookies y asegurar el cumplimiento legal. Sus cookies almacenan si has aceptado o rechazado las demás categorías.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Gestión y Desactivación de Cookies</h2>
            <p>El Usuario acepta expresamente, por la utilización de este sitio, el tratamiento de la información recabada. Asimismo, reconoce conocer la posibilidad de rechazar el tratamiento de tales datos mediante la configuración de su navegador.</p>
            <p className="mt-3">Puede usted permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de las opciones del navegador:</p>
            <ul className="mt-3 space-y-1 list-disc list-inside pl-2">
              <li>Chrome</li>
              <li>Firefox</li>
              <li>Safari</li>
              <li>Microsoft Edge</li>
            </ul>
            <p className="mt-3 text-white/50 text-sm">Tenga en cuenta que el bloqueo de cookies puede afectar a la funcionalidad completa de esta web.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Contacto</h2>
            <p>Si tiene dudas sobre esta política de cookies, puede contactar con Raúl Ruiz Romero (Antiagencia) en el correo electrónico: <a href="mailto:raul@antiagencia.es" className="text-[#0067FD] hover:underline">raul@antiagencia.es</a></p>
          </section>

        </div>
      </div>
      <Footer />
    </div>
  );
}
