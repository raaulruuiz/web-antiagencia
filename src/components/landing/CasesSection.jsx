import React from "react";
import { motion } from "framer-motion";
import SectionTitle from "../ui/SectionTitle";
import CaseCard from "../ui/CaseCard";

const partnerLogos = [
{
  name: "Shopify",
  src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopify_logo_2018.svg/2560px-Shopify_logo_2018.svg.png"
},
{
  name: "Meta",
  src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/2560px-Meta_Platforms_Inc._logo.svg.png"
},
{
  name: "Google",
  src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png"
},
{
  name: "Klaviyo",
  src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Klaviyo_logo.svg/2560px-Klaviyo_logo.svg.png"
},
{
  name: "TikTok",
  src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Ionicons_logo-tiktok.svg/2048px-Ionicons_logo-tiktok.svg.png"
}];


const cases = [
{
  brand: "Marca de Moda Sostenible",
  category: "Fashion",
  metrics: [
  { value: "3.8x", label: "ROAS" },
  { value: "+156%", label: "Ingresos" },
  { value: "+42%", label: "Conversión" }],

  highlights: [
  "Rediseño completo del checkout",
  "Flujos de email automatizados",
  "Estructura de campañas Meta optimizada"]

},
{
  brand: "Tienda de Suplementos",
  category: "Health & Wellness",
  metrics: [
  { value: "4.2x", label: "ROAS" },
  { value: "+89%", label: "Ticket medio" },
  { value: "+210%", label: "Email revenue" }],

  highlights: [
  "Bundles y upsells optimizados",
  "Programa de suscripción implementado",
  "Campañas de retargeting avanzado"]

},
{
  brand: "Ecommerce de Hogar",
  category: "Home & Deco",
  metrics: [
  { value: "2.9x", label: "ROAS" },
  { value: "+67%", label: "Tráfico cualificado" },
  { value: "-34%", label: "CPA" }],

  highlights: [
  "Landing pages específicas por producto",
  "Recuperación de carritos por WhatsApp",
  "Testing creativo sistemático"]

}];



export default function CasesSection() {
  return (
    <section id="casos" className="py-24 md:py-32 bg-[#0A0F1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge="Resultados reales"
          title="Casos de éxito"
          subtitle="Marcas que han escalado con nuestro sistema." />


        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mt-16">
          {cases.map((caseItem, index) =>
          <CaseCard
            key={caseItem.brand}
            brand={caseItem.brand}
            category={caseItem.category}
            metrics={caseItem.metrics}
            highlights={caseItem.highlights}
            index={index} />

          )}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-20 pt-12 border-t border-white/10">

          <p className="text-slate-50 mb-10 text-sm font-bold text-center uppercase tracking-wider">PARTNERS OFICIALES

          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
            {partnerLogos.map((logo) =>
            <img
              key={logo.name}
              src={logo.src}
              alt={logo.name}
              className="h-6 md:h-7 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300 brightness-200" />

            )}
          </div>
        </motion.div>
      </div>
    </section>);

}
