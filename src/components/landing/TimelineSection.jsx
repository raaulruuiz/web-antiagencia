import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    title: "ANÁLISIS ESTRATÉGICO",
    description:
      "Analizamos tus números, tus márgenes y te ayudamos a tomar las mejores decisiones para maximizar el negocio de tu tienda, además de adaptar la estrategia a tu caso concreto.",
  },
  {
    title: "GESTIÓN DE CAMPAÑAS",
    description:
      "Escalamos tu publicidad con una estructura que nos permite gastar todo lo que queramos sin perder rendimiento. Con Meta, TikTok, Google y YouTube nos sentimos como pez en el agua.",
  },
  {
    title: "ANUNCIOS GANADORES",
    description:
      "Guionizamos y te compartimos referencias de anuncios ganadores. Te los editamos todos y los convertimos en anuncios que convierten a desconocidos en clientes. También producimos vídeos e imágenes con inteligencia artificial.",
  },
  {
    title: "DESARROLLO WEB",
    description:
      "Convertimos tu web en una máquina de ventas, subiendo la cantidad de gente que te compra y el dinero que se gasta para generar más beneficio desde el minuto 0.",
  },
  {
    title: "MARKETING DIRECTO",
    description:
      "Conectamos con nuestros clientes para fidelizarlos y hacer que nos vuelvan a comprar una y otra vez. Manejamos tus campañas de email marketing, WhatsApp y automatizaciones.",
  },
];

export default function TimelineSection() {
  return (
    <section id="antiagencia" className="bg-[#121212] pt-8 pb-20 px-6 md:px-6">
      <div className="max-w-4xl mx-auto">

        {/* Logo + Intro */}
        <div className="flex flex-col items-center md:text-center text-left mb-16">
          <img
            src="/images/9563e10d2_AALogo.png"
            alt="AntiAgencia Logo"
            className="w-20 mb-8 md:self-center self-start"
          />
          <p className="text-white text-xl md:text-2xl leading-relaxed max-w-2xl font-light">
            Diseñamos tu estrategia creativa y de alto rendimiento, para que más gente te compre, se gasten más y vuelvan una y otra vez.
          </p>
          <p className="text-[#0067FD] font-bold font-headline text-xl md:text-2xl mt-3 tracking-wide md:self-center self-start">
            Y GANES MÁS TRABAJANDO MENOS
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line — hidden on mobile, visible on md+ */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />

          <div className="flex flex-col gap-0">
            {steps.map((step, index) => {
              const isLeft = index % 2 === 0;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={`relative flex items-start md:items-center gap-0 mb-16
                    ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}
                    flex-col
                  `}
                >
                  {/* Content */}
                  <div className={`w-full md:w-[45%] ${isLeft ? "md:text-right md:pr-10" : "md:text-left md:pl-10"} pl-8 md:pl-0`}>
                    <h3 className="font-headline text-[#0067FD] text-lg md:text-xl tracking-widest uppercase mb-2">
                      {step.title}
                    </h3>
                    <p className="text-white text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Center dot + horizontal line */}
                  <div className="hidden md:flex w-[10%] flex-col items-center justify-center relative">
                    <div className="w-3 h-3 rounded-full bg-[#0067FD] border-2 border-[#0067FD] z-10" />
                    <div className={`absolute top-1/2 -translate-y-1/2 h-px w-8 bg-[#0067FD]/40 ${isLeft ? "right-full" : "left-full"}`} />
                  </div>

                  {/* Mobile: left accent line */}
                  <div className="absolute left-0 top-0 h-full w-px bg-[#0067FD]/30 md:hidden" />
                  <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-[#0067FD] md:hidden" />

                  {/* Empty side */}
                  <div className="hidden md:block md:w-[45%]" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-16 flex md:justify-center justify-start">
          <a
            href="/Contacto"
            className="font-headline font-bold tracking-widest text-base px-10 py-4 rounded-lg border-2 border-[#0067FD] text-white bg-[#0067FD] transition-all duration-300 hover:bg-[#7000FF] hover:border-[#7000FF] hover:text-white"
          >
            ¿HABLAMOS?
          </a>
        </div>

      </div>
    </section>
  );
}
