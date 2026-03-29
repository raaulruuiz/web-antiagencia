import React from "react";
import { motion } from "framer-motion";

const logos = [
  "/images/1d35fcfde_2.png",
  "/images/925d2e366_5.png",
  "/images/feb6a7e82_6.png",
  "/images/27da1a01b_7.png",
  "/images/d56e9bda8_8.png",
  "/images/e74634f76_9.png",
  "/images/c90eea9db_10.png",
  "/images/c76a986cd_11.png",
  "/images/681ebb5ff_12.png",
  "/images/74d74a730_13.png",
  "/images/8eb055b58_14.png",
  "/images/9be34152d_15.png",
  "/images/88226b1df_16.png",
  "/images/9fc9800e2_17.png",
  "/images/c4b2bae5c_18.png",
  "/images/c83094243_freepik__background__51066.png",
  "/images/0b43c4068_freepik__background__52042.png",
  "/images/bdf322e31_PRUEBASOCIAL1.png",
];

export default function BrandsSection() {
  return (
    <section id="clientes" className="bg-[#121212] pt-20 pb-0 md:py-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Logo */}
        <motion.img
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          src="/images/6c70532bf_AALogo.png"
          alt="AntiAgencia Logo"
          className="w-20 mb-8"
        />

        {/* Título */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-headline font-bold text-white text-3xl md:text-5xl leading-tight mb-12"
        >
          MARCAS CON LAS QUE
          <br />HEMOS TRABAJADO
        </motion.h2>

        {/* Grid de logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="logo-strip grid grid-cols-3 md:grid-cols-6 gap-8 items-center"
        >
          {logos.map((src, i) => (
            <div key={i} className="flex items-center justify-center">
              <img src={src} alt={`Brand logo ${i + 1}`} />
            </div>
          ))}
        </motion.div>

        {/* Línea divisoria */}
        <div className="mt-16 mb-16 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#0067FD] to-[#7000FF]" />
          <div className="w-2 h-2 rounded-full bg-[#0067FD]" />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#0067FD] to-[#7000FF]" />
        </div>
      </div>

      {/* IA Section - full width */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative flex flex-col md:flex-row items-center overflow-hidden md:min-h-[480px] mb-6 md:mb-0"
      >
        {/* Imagen pegada al borde derecho — desktop */}
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-[60%]">
          <img
            src="/images/33ec26cba_ChatGPTImage4mar202616_54_57.png"
            alt="Combinamos lo mejor de cada mundo"
            className="w-full h-full object-cover object-right"
          />
        </div>

        {/* Imagen + texto superpuesto — móvil */}
        <div className="md:hidden w-full relative">
          <img
            src="/images/33ec26cba_ChatGPTImage4mar202616_54_57.png"
            alt="Combinamos lo mejor de cada mundo"
            className="w-full object-cover max-h-72 block"
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col justify-center px-6">
            <h2 className="font-headline font-bold text-white text-3xl leading-tight mb-2 drop-shadow-lg">
              COMBINAMOS LO MEJOR
              <br />DE CADA MUNDO
            </h2>
            <p className="font-body text-white/80 text-lg drop-shadow-md">
              ¿cuál es IA y cuál no?
            </p>
          </div>
        </div>

        {/* Texto desktop */}
        <div className="hidden md:flex absolute left-[20%] top-0 bottom-0 w-[55%] items-center pl-8">
          <div className="text-left">
            <h2 className="font-headline font-bold text-white text-5xl leading-tight mb-4 drop-shadow-lg">
              COMBINAMOS LO MEJOR
              <br />DE CADA MUNDO
            </h2>
            <p className="font-body text-white/80 text-2xl drop-shadow-md">
              ¿cuál es IA y cuál no?
            </p>
          </div>
        </div>
      </motion.div>

      <style>{`
        .logo-strip img {
          height: 28px;
          width: auto;
          filter: brightness(0) invert(1);
          opacity: 0.85;
        }
        @media (min-width: 768px) {
          .logo-strip img {
            height: 56px;
          }
        }
      `}</style>
    </section>
  );
}
