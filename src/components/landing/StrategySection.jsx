import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const steps = [
  {
    title: "RAIZ",
    content: `Tienes que entender tus números. Saber tus márgenes, ajustar los KPIs a estos números. Pero en profundidad, no superficial.

Crecer no es solo invertir en publicidad con buen ROAS, porque ¿cuál es un buen ROAS, 4, 5, 6...? Cada tienda y cada caso es un mundo.

Por eso tenemos que entender los márgenes, costes fijos, costes variables y cómo se relacionan todos con nuestra inversión en publicidad para saber cuándo podemos empujar y cuándo tenemos que retener.

Otro dato importante que tenemos que comprobar son tus olas de mercado. Cuando hay más demanda, cuándo hay menos, que días concretos podemos invertir más...`,
  },
  {
    title: "ESTRATEGIA",
    content: `Una vez sabemos los números empezamos a diseñar la estrategia. Y lo hacemos enfocados primero en lo que nos va a dar mejores resultados en menor tiempo.

Hacemos también un análisis de lo que se ha hecho históricamente y lo que hace tu competencia para definir la mejor estrategia.

Después empezamos tocando web, para mejorar tasa de conversión y subir ticket medio, probamos distintas ofertas, upsells, downsells, crossells, etc. Luego email marketing, para fidelizar y favorecer la recurrencia, revisamos tu configuración, analizamos los flujos, los mensajes y la frecuencia con la que se mandan y establecemos los mejores momentos para conseguir nuevas ventas. Y por último vamos con los ads, para asegurarnos que cada euro que invertimos será lo más rentable posible.`,
  },
  {
    title: "CREATIVIDAD",
    content: `En publicidad no solo vale con subir presupuestos. Tenemos que hacer un setup técnico adaptado a los nuevos cambios de meta y cualquier plataforma que vayamos a trabajar.

Analizamos los resultados obtenidos históricamente, lo que hace la competencia y definimos los ángulos, conceptos y formatos que vamos a testear.

Escribimos los guiones y te pasamos referencias y después, editamos todos los contenidos que nos pases.

Además, producimos contenido original con IA, tanto en imagen y en vídeo, para tener aún más formatos y poder tener contenido en ocasiones en las que no puedas proporcionarlo.`,
  },
  {
    title: "ESCALADO",
    content: `Con todo lanzado toca medir. Medimos de forma diaria, semanal, mensual y trimestral los resultados y vamos ajustando la estrategia a los datos reales.

No nos chupamos el dedo y vemos por donde sopla el aire, lo medimos con datos. El mercado nos dice lo que tenemos que hacer.

Esto es lo que nos permitirá escalar presupuesto publicitario, aumentar beneficio y, en definitiva, crecer.

En el proceso de escalado, cada vez seremos más intensivos en creativos, ampliaremos plataformas, y aparte de escalar verticalmente (subiendo presupuesto), lo haremos horizontalmente (haciendo cosas distintas).`,
  },
];

export default function StrategySection() {
  const [open, setOpen] = useState(null);

  const handleToggle = (index) => {
    setOpen(open === index ? null : index);
  };

  return (
    <section className="bg-[#121212] pt-0 pb-0 px-6">
      {/* Divider */}
      <div className="border-t border-white/10 mb-16" />

      {/* Headline */}
      <div className="max-w-4xl mx-auto mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-headline font-bold text-white text-3xl md:text-5xl leading-tight mb-4"
        >
          ECOMMERCE DE VERDAD
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-headline text-[#0067FD] text-3xl md:text-5xl leading-tight"
        >
          Diseñamos la estrategia, desde la raíz hasta la creatividad para maximizar beneficios.
        </motion.p>
      </div>

      {/* Timeline Accordion */}
      <div className="max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const isOpen = open === index;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="border-t border-white/10 last:border-b"
            >
              <button
                onClick={() => handleToggle(index)}
                className="w-full flex items-center justify-between py-5 gap-4 group text-left"
              >
                <motion.span
                  animate={{
                    color: isOpen ? "#0067FD" : "#FFFFFF",
                    fontSize: isOpen ? "1.35rem" : "1.1rem",
                  }}
                  transition={{ duration: 0.25 }}
                  className="font-headline font-bold tracking-widest"
                >
                  {step.title}
                </motion.span>
                <motion.div
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex-shrink-0 w-7 h-7 rounded-full border border-[#0067FD] flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 text-[#0067FD]" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pb-6 pr-10">
                      {step.content.split("\n\n").map((para, i) => (
                        <p key={i} className="text-white/70 font-body text-sm md:text-base leading-relaxed mb-3 last:mb-0">
                          {para}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Divider + Partner badges */}
      <div className="max-w-4xl mx-auto">
        <div className="border-t border-white/10 mt-16 mb-10" />
        <div className="flex flex-row items-center justify-center gap-4 md:gap-10 px-4 md:px-0">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/ba579be86_1.png"
            alt="Shopify Partner"
            className="h-12 md:h-24 w-auto object-contain"
          />
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/4e87c3fd2_2.png"
            alt="Badge"
            className="h-12 md:h-24 w-auto object-contain"
          />
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/a44f7d6fd_PRUEBASOCIAL.png"
            alt="Klaviyo Partner"
            className="h-12 md:h-24 w-auto object-contain"
          />
        </div>
      </div>

      {/* Image + overlapping text block */}
      <div className="relative mt-10 overflow-hidden" style={{ marginLeft: "-1.5rem", marginRight: "-1.5rem", paddingBottom: "0" }}>
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/5584544ee_ChatGPTImage1mar202618_42_12.png"
          alt="Hacemos ecommerce, no solo marketing"
          className="w-full md:w-1/2 h-auto object-cover block ml-auto mb-0"
        />
        <div className="absolute inset-0 flex items-center justify-end">
          <div className="w-full md:w-4/5 px-6 md:px-10">
            <h2 className="font-headline font-bold text-white text-3xl md:text-6xl leading-tight uppercase">
              HACEMOS ECOMMERCE,<br />NO SOLO MARKETING
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
