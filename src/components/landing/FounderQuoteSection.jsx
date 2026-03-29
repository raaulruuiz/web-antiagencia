import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, BarChart3 } from "lucide-react";

const milestones = [
  {
    icon: TrendingUp,
    title: "+ 1M€ INVERTIDOS",
    description: "para nuestros clientes de forma rentable"
  },
  {
    icon: Users,
    title: "EQUIPO",
    description: "de 6 personas para tu tienda"
  },
  {
    icon: BarChart3,
    title: "+5M GENERADOS",
    description: "para nuestros clientes en +20 industrias"
  },
];

export default function FounderQuoteSection() {
  return (
    <section className="bg-[#121212] py-20 px-6 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border-l-4 border-[#0055FF] pl-6 mb-4"
        >
          <p className="text-white text-2xl md:text-3xl lg:text-4xl leading-relaxed font-bold mb-2">
            Somos una agencia de ecommerce que no funciona como una agencia tradicional.
          </p>
          <p className="text-white text-2xl md:text-3xl lg:text-4xl leading-relaxed font-light">
            Nos enfocamos en construir a largo plazo y nos alineamos contigo para que{" "}
            <span className="text-[#0055FF] font-bold">tu marca CREZCA y genere BENEFICIO.</span>
          </p>
        </motion.blockquote>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white/40 text-sm mb-16"
        >
          — Raúl Ruiz, Fundador
        </motion.p>

        {/* Milestones */}
        <div className="grid grid-cols-1 md:grid-cols-3 border border-white/10 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {milestones.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="flex flex-col items-center text-center gap-2 px-8 py-8"
            >
              <div className="w-10 h-10 rounded-full border border-[#0055FF]/40 flex items-center justify-center mb-1">
                <item.icon className="w-5 h-5 text-[#0055FF]" />
              </div>
              <span className="font-headline text-[#0055FF] text-lg md:text-xl tracking-widest uppercase">
                {item.title}
              </span>
              <span className="text-white text-sm font-normal leading-snug">
                {item.description}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
