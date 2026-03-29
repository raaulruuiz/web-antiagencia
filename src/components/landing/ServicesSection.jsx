import React from "react";
import { TrendingUp, RefreshCcw, Megaphone } from "lucide-react";
import SectionTitle from "../ui/SectionTitle";
import ServiceCard from "../ui/ServiceCard";

const services = [
  {
    icon: TrendingUp,
    title: "Beneficio",
    description: "Que más gente te compre y se gaste más.",
    benefits: [
      "Analizamos tus números en profundidad",
      "Optimizamos la web para que convierta más",
      "Aumentamos el ticket medio para generar más beneficio por visita"
    ]
  },
  {
    icon: RefreshCcw,
    title: "Recurrencia",
    description: "Que nos compren de nuevo múltiples veces.",
    benefits: [
      "Email marketing para conectar y fidelizar a la audiencia",
      "Mensajes automáticos en el momento de mayor probabilidad de recompra",
      "Flujos de retención que trabajan solos, 24/7"
    ]
  },
  {
    icon: Megaphone,
    title: "Volumen",
    description: "Meter gente nueva de forma constante.",
    benefits: [
      "Campañas de Ads con estructura escalable",
      "Podemos invertir todo el presupuesto que queramos sin perder rendimiento",
      "Creatives y tests continuos para mantener el ROAS"
    ]
  }
];

export default function ServicesSection() {
  return (
    <section id="servicios" className="py-24 md:py-32 bg-[#0A0F1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge="Sistema AntiAgencia"
          title="Las 3 áreas que trabajamos"
          subtitle="Beneficio, recurrencia y volumen. Las tres palancas que mueven cualquier ecommerce. Trabajamos las tres a la vez, de forma coordinada."
        />

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mt-16">
          {services.map((service, index) => (
            <ServiceCard
              key={service.title}
              icon={service.icon}
              title={service.title}
              description={service.description}
              benefits={service.benefits}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
