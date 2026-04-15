import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Footer from "@/components/landing/Footer";

export default function AvisoLegal() {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link to={createPageUrl("Home")} className="text-[#0067FD] hover:underline text-sm mb-10 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">Aviso Legal</h1>
        <p className="text-white/40 text-sm mb-12">Antiagencia</p>

        <div className="space-y-10 text-white/80 leading-relaxed">

          <p>En cumplimiento con el deber de información recogido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), a continuación se hace constar:</p>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Datos Identificativos del Responsable</h2>
            <ul className="space-y-1 pl-4 border-l border-white/10">
              <li><span className="text-white/50">Titular:</span> Raúl Ruiz Romero (Antiagencia)</li>
              <li><span className="text-white/50">NIF:</span> 20995373F</li>
              <li><span className="text-white/50">Domicilio:</span> Calle Defensor de Granada 17A, Ventas de Zafarraya, Granada, España</li>
              <li><span className="text-white/50">Email:</span> <a href="mailto:raul@antiagencia.es" className="text-[#0067FD] hover:underline">raul@antiagencia.es</a></li>
              <li><span className="text-white/50">Actividad:</span> Consultoría de marketing, publicidad y servicios digitales.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Finalidad de la Página Web</h2>
            <p>Los servicios prestados por el responsable a través de esta web son:</p>
            <ul className="mt-3 space-y-1 list-disc list-inside pl-2">
              <li>Información sobre servicios de marketing y estrategia digital.</li>
              <li>Gestión de presupuestos y contacto comercial.</li>
              <li>Venta de productos/servicios y formación digital.</li>
              <li>Difusión de contenidos a través de blog o newsletter.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Usuarios</h2>
            <p>El acceso y/o uso de este sitio web atribuye la condición de USUARIO, que acepta los presentes términos de uso. El mero uso de la web no significa el inicio de relación laboral o comercial alguna entre Raúl Ruiz Romero y el usuario.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Uso del Sitio Web y Captura de Información</h2>
            <h3 className="text-white font-medium mb-2">4.1. Uso del sitio web</h3>
            <p>La web proporciona acceso a contenidos, servicios y datos propiedad de Antiagencia. El USUARIO se compromete a hacer un uso adecuado de los mismos y a no emplearlos para actividades ilícitas, contrarias a la buena fe o que vulneren los derechos humanos.</p>
            <h3 className="text-white font-medium mt-4 mb-2">4.2. Captura de información</h3>
            <ul className="space-y-1 list-disc list-inside pl-2">
              <li><strong className="text-white">Formularios de contacto:</strong> Para consultas y presupuestos.</li>
              <li><strong className="text-white">Formularios de suscripción/venta:</strong> Para la adquisición de servicios o inscripción a la newsletter.</li>
              <li><strong className="text-white">Navegación y dirección IP:</strong> Al navegar, se facilitan de forma automática datos técnicos necesarios para la conexión.</li>
            </ul>
            <p className="mt-3">Toda la información personal será tratada conforme a nuestra <Link to={createPageUrl("PoliticaPrivacidad")} className="text-[#0067FD] hover:underline">Política de Privacidad</Link>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Propiedad Intelectual e Industrial</h2>
            <p>Raúl Ruiz Romero es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (textos, imágenes, marcas, logotipos, vídeos, software, etc.). Queda expresamente prohibida la reproducción, distribución y comunicación pública de la totalidad o parte de los contenidos de esta web con fines comerciales, en cualquier soporte y por cualquier medio técnico, sin la autorización previa y por escrito de Antiagencia.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Exclusión de Garantías y Responsabilidad</h2>
            <p>Antiagencia no se hace responsable de los daños y perjuicios que pudieran ocasionar: errores u omisiones en los contenidos, falta de disponibilidad del sitio web por mantenimientos técnicos o la transmisión de virus, a pesar de haber adoptado todas las medidas tecnológicas para evitarlo.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Modificaciones</h2>
            <p>Antiagencia se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su web, pudiendo cambiar, suprimir o añadir contenidos y servicios.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Derecho de Exclusión</h2>
            <p>Se reserva el derecho a denegar o retirar el acceso al portal a aquellos usuarios que incumplan las presentes Condiciones Generales de Uso.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Reclamaciones y Dudas</h2>
            <p>Existen hojas de reclamación a disposición de usuarios y clientes. Puede solicitar una o realizar cualquier consulta enviando un correo a <a href="mailto:raul@antiagencia.es" className="text-[#0067FD] hover:underline">raul@antiagencia.es</a> indicando su nombre, apellidos y el motivo de su consulta o reclamación.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Aplicación Automatizaciones — Uso de la API de TikTok</h2>
            <p>Antiagencia opera la aplicación <strong className="text-white">Automatizaciones</strong>, registrada en TikTok for Developers, que utiliza la API de TikTok para prestar servicios de gestión y publicación de contenido en dicha plataforma en nombre de sus clientes. El uso de esta integración está sujeto a las siguientes condiciones:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside pl-2">
              <li><strong className="text-white">Autorización expresa:</strong> La integración con TikTok se realiza únicamente bajo autorización expresa del cliente, quien debe conceder acceso a su cuenta de forma voluntaria.</li>
              <li><strong className="text-white">Uso permitido:</strong> El acceso a la API de TikTok se utiliza exclusivamente para publicar y programar contenido de vídeo proporcionado por el cliente. No se utilizará para ningún otro fin no autorizado.</li>
              <li><strong className="text-white">Responsabilidad del contenido:</strong> El cliente es responsable del contenido que facilita para su publicación en TikTok, debiendo asegurarse de que cumple con los <a href="https://www.tiktok.com/legal/page/global/terms-of-service/es" className="text-[#0067FD] hover:underline" target="_blank" rel="noopener noreferrer">Términos de Servicio de TikTok</a> y la legislación aplicable.</li>
              <li><strong className="text-white">Revocación del acceso:</strong> El cliente puede revocar el acceso de Antiagencia a su cuenta de TikTok en cualquier momento desde la configuración de privacidad de la plataforma.</li>
              <li><strong className="text-white">Cumplimiento normativo:</strong> Antiagencia cumple con las políticas de la plataforma TikTok for Developers y aplica las medidas de seguridad necesarias para proteger los datos de acceso.</li>
            </ul>
            <p className="mt-3">Para cualquier consulta relacionada con el uso de la API de TikTok, puedes contactarnos en <a href="mailto:raul@antiagencia.es" className="text-[#0067FD] hover:underline">raul@antiagencia.es</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Legislación Aplicable y Jurisdicción</h2>
            <p>La relación entre Antiagencia y el USUARIO se regirá por la normativa española vigente. Cualquier controversia se someterá a los Juzgados y tribunales de la ciudad de Granada, salvo que la Ley aplicable (especialmente en caso de consumidores finales) disponga otra cosa.</p>
          </section>

        </div>
      </div>
      <Footer />
    </div>
  );
}
