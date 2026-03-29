import React from "react";
import { Users, Settings, BarChart2, FileText } from "lucide-react";
import { motion } from "framer-motion";
import SectionTitle from "../ui/SectionTitle";

const steps = [
  {
    icon: Users,
    number: "01",
    title: "Onboarding",
    description: "Nos damos los accesos, analizamos tus números en detalle, las acciones realizadas históricamente y la competencia. Desarrollamos un plan para los próximos 3 meses."
  },
  {
    icon: Settings,
    number: "02",
    title: "Setup",
    description: "Implementamos todos los cambios de forma simultánea en web, email y anuncios. Te pasamos referencias y guiones para que grabes; nosotros los editamos."
  },
  {
    icon: BarChart2,
    number: "03",
    title: "Optimización",
    description: "Lanzamos y analizamos resultados, entendemos y optimizamos. Seguimos el método científico para dar los mejores resultados."
  },
  {
    icon: FileText,
    number: "04",
    title: "Reporting",
    description: "Semanalmente te damos un análisis detallado y comentado de las métricas del negocio, para que veas con transparencia cómo avanzan los resultados."
  }
];

export default function MethodologySection() {
  return (
    <section id="metodologia" className="py-24 md:py-32 bg-[#080C14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge="Metodología"
          title="Cómo trabajamos"
          subtitle="Un proceso claro, sin improvisación. Desde el día uno hasta los resultados."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 md:mt-20">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative bg-[#0D1220] rounded-2xl border border-white/10 p-6 hover:border-[#0067FD]/40 transition-colors duration-300"
            >
              <span className="text-4xl font-black text-[#0067FD]/40 block mb-4">{step.number}</span>
              <div className="w-10 h-10 rounded-lg bg-[#0067FD]/15 flex items-center justify-center mb-4">
                <step.icon className="w-5 h-5 text-[#0067FD]" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
              <p className="text-sm text-white/60 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
