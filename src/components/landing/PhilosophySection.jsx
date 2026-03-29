import React from "react";
import { motion } from "framer-motion";

const IMAGE_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/e46285170_ChatGPTImage28feb202623_13_30.png";

export default function PhilosophySection() {
  return (
    <section
      id="filosofia"
      className="bg-[#121212] relative"
      style={{
        backgroundImage: `url(${IMAGE_URL})`,
        backgroundSize: "cover",
        backgroundPosition: "center right",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#121212]/75" />

      {/* Content */}
      <div className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-6">
          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-headline text-white text-base md:text-lg tracking-widest font-normal mb-4"
          >
            <span className="text-[#0055FF]">XX</span>
            {" "}NUESTRA FILOSOFÍA{" "}
            <span className="text-[#0055FF]">XX</span>
          </motion.p>

          {/* Título */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-headline font-bold text-3xl md:text-5xl text-white mb-8"
          >
            ¿QUÉ TIPO DE ECOMMERCE QUIERES?
          </motion.h2>

          {/* Párrafo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-50 mb-12 text-base font-body leading-relaxed md:text-lg"
          >
            Entendemos que lo queremos todo ya y somos impacientes con los resultados. Por eso trabajamos para darte resultados rápidos. Aunque hay un matiz. Ninguna marca que ha estado estancada, ha tomado malas decisiones o ha pasado por una mala agencia y luego ha tenido éxito, lo ha hecho de la noche a la mañana. Las MARCAS entienden que los grandes resultados vienen a largo plazo y entienden que el marketing es una inversión en su crecimiento, no un gasto. Solo así se convierten en referentes en su sector.
          </motion.p>

          {/* Quote */}
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="border-l-4 border-[#0055FF] pl-6"
          >
            <p className="font-headline text-white text-xl md:text-2xl lg:text-3xl leading-relaxed font-normal">
              A CORTO PLAZO POCO,{" "}
              <span className="text-[#0055FF]">A LARGO PLAZO TODO</span>
            </p>
          </motion.blockquote>
        </div>
      </div>
    </section>
  );
}
