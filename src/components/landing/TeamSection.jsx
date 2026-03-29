import React from "react";
import { motion } from "framer-motion";

const teamMembers = [
  { img: null },
  { img: null },
  { img: null },
  { img: null },
  { img: null },
];

export default function TeamSection() {
  return (
    <section id="equipo" className="bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Logo */}
        <motion.img
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          src="/images/cf4d75d1a_freepik__background__33914.png"
          alt="AntiAgencia Logo"
          className="w-20 mb-8"
        />

        {/* Título */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-headline font-bold text-[#121212] text-3xl md:text-5xl leading-tight mb-12"
        >
          EL EQUIPO
        </motion.h2>

        {/* Carrusel de fotos — 5 por fila */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-5 gap-4 mb-12"
        >
          {teamMembers.map((member, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-[#121212]/10 overflow-hidden"
            >
              {member.img ? (
                <img
                  src={member.img}
                  alt={`Miembro del equipo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#121212]/10" />
              )}
            </div>
          ))}
        </motion.div>

        {/* ¿Quieres trabajar con nosotros? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <p className="font-body text-[#121212] text-base md:text-lg mb-4">
            ¿Quieres trabajar con nosotros?
          </p>
          <a
            href="mailto:raul@antiagencia.es?subject=Currículum"
            className="inline-block font-headline font-bold text-white bg-[#0067FD] hover:bg-[#7000FF] transition-colors px-6 py-3 rounded-lg text-sm"
          >
            Envía tu currículum
          </a>
        </motion.div>

        {/* Quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border-l-4 border-[#0067FD] pl-5 mt-10"
        >
          <p className="font-body text-[#121212]/80 text-base md:text-lg italic leading-relaxed">
            "No somos perfectos, a veces nos equivocamos, pero siempre aprendemos y damos el 200% en lo que hacemos."
          </p>
        </motion.blockquote>

      </div>
    </section>
  );
}
