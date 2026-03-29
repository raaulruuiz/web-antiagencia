import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PrimaryButton from "../ui/PrimaryButton";

const vuestrasParagraphs = [
  "Durante los últimos 8 años no solo hemos lanzado proyectos propios: también hemos demostrado que todo lo que aprendimos construyendo nuestras propias tiendas es totalmente aplicable a otras marcas. Con esa experiencia desarrollamos una metodología única que nos ha permitido ayudar a más de 70 tiendas online en más de 20 industrias, invirtiendo en el camino más de 1.000.000€ en publicidad y generando más de 5.000.000€ de retorno para nuestros clientes.",
  "Hemos aplicado esta metodología tanto en formato consultoría como como agencia, y los resultados han sido espectaculares porque el enfoque es siempre el mismo: entender cada negocio desde la raíz, trabajar desde la base y construir cimientos sólidos antes de escalar. Además, alineamos incentivos y proponemos modelos de trabajo que pocas agencias están dispuestas a ofrecer, como entregar resultados antes de cobrar nada o trabajar 100% a éxito con nuestros clientes.",
  "Eso sí: este tipo de trabajo es para tiendas que ya están en marcha (producto validado y con inversión en publicidad), y también para personas con las que conectamos a nivel de valores y forma de trabajar, porque cuando la relación es buena, el resultado siempre es mejor. Si crees que encajas con este tipo de tiendas, puedes agendar una llamada y analizamos tu ecommerce para ver si tiene sentido trabajar juntos.",
];

function VuestrasText() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <p className="font-body text-[#121212]/80 text-sm md:text-base leading-relaxed text-justify">
        {vuestrasParagraphs[0]}
      </p>
      {expanded && vuestrasParagraphs.slice(1).map((para, i) => (
        <p key={i} className="font-body text-[#121212]/80 text-sm md:text-base leading-relaxed text-justify">
          {para}
        </p>
      ))}
      <button
        onClick={() => setExpanded(!expanded)}
        className="self-start mt-1 font-headline font-bold text-[#0067FD] text-sm underline underline-offset-4 hover:text-[#7000FF] transition-colors"
      >
        {expanded ? "Leer menos" : "Leer más"}
      </button>
    </div>
  );
}

const storyParagraphs = [
  "Aquí Raúl, te quiero contar un poco mi historia:",
  'Entre 2018 y 2021 empecé a montar mis propias tiendas online de dropshipping, sin tener ni idea de marketing, anuncios, email o incluso de cómo construir una web que vendiera. La primera fracasó, como era de esperar. Luego vino la segunda, la tercera… y el resultado fue parecido, pero con una diferencia importante: cada intento me dejaba más habilidades y más claridad. Aun así, sentía que siempre me faltaba "el truco", "el hack" para que todo encajara y una tienda funcionara de verdad (spoiler: me faltaba ayuda y conocimiento).',
  "En ese punto apareció alguien que iba unos pasos por delante (mi tocayo Raúl Rey), con tiendas ya exitosas, y ahí tomé una decisión que me cambió la vida: con el poco dinero que me quedaba y mucho miedo, invertí en él para que me ayudara. Con su ayuda monté la cuarta tienda y, por primera vez, no perdí dinero: generó. Poco, pero generó. Seguí mejorando, lancé la quinta y, después de mucho trabajo, inversión y análisis, conseguí mi primera tienda realmente exitosa (más de 50.000€ facturó). Cuando se terminó el servicio de Raúl, me encontré solo… pero ya no era el mismo: tenía método, experiencia y resultados.",
  "Con esa base monté mi sexta tienda en 2020, en plena pandemia, y fue todo un éxito: de 0 a más de 20.000€ el primer mes, el segundo superé los 70.000€ y el tercero los 150.000€ de facturación desde que empezamos. Ese crecimiento me hizo ver con claridad todo en lo que me había vuelto bueno, y también lo que marca la diferencia a largo plazo: entender el negocio de verdad, incluidos sus números. Y ahí nació mi siguiente paso natural: empezar a ofrecer mi conocimiento y experiencia a otras tiendas para que eviten los errores que yo cometí y puedan apalancarse en un camino que yo ya he recorrido.",
];

function StoryText() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <p className="font-body text-[#121212]/80 text-sm md:text-base leading-relaxed text-justify">
        {storyParagraphs[0]}
      </p>
      <p className="font-body text-[#121212]/80 text-sm md:text-base leading-relaxed text-justify">
        {storyParagraphs[1]}
      </p>

      {expanded && storyParagraphs.slice(2).map((para, i) => (
        <p key={i} className="font-body text-[#121212]/80 text-sm md:text-base leading-relaxed text-justify">
          {para}
        </p>
      ))}

      <button
        onClick={() => setExpanded(!expanded)}
        className="self-start mt-1 font-headline font-bold text-[#0067FD] text-sm underline underline-offset-4 hover:text-[#7000FF] transition-colors"
      >
        {expanded ? "Leer menos" : "Leer más"}
      </button>
    </div>
  );
}

export default function HablamosSection() {
  return (
    <section id="nosotros" className="bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-start">

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
          className="font-headline font-bold text-[#121212] text-3xl md:text-5xl leading-tight mb-8"
        >
          HABLAMOS TU IDIOMA
        </motion.h2>

        {/* Subtexto */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-body text-[#121212] text-base md:text-lg leading-relaxed mb-14"
        >
          A diferencia de otras agencias y consultorías, nosotros hemos tenido tiendas online propias. Sabemos lo que es gastar nuestro propio dinero en publicidad y por ello trabajamos con tiendas que entienden que para crecer tienen que invertir, y que la única opción es <span className="font-bold">GANAR</span>
        </motion.p>

        {/* Doble columna: imagen + texto historia */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Imagen izquierda */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative group w-full rounded-lg overflow-hidden">
              <img
                src="/images/4ef0eef4e_LCDW1080x1080px.jpg"
                alt="Nuestras tiendas online"
                className="w-full object-cover transition-all duration-500 group-hover:grayscale"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/40">
                <span className="font-headline font-bold text-white text-2xl md:text-4xl text-center leading-tight drop-shadow-lg px-4">
                  +150.000€<br />en 3 meses
                </span>
              </div>
            </div>
          </motion.div>

          {/* Texto derecha */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="font-headline font-bold text-[#121212] text-xl md:text-2xl leading-tight mb-5 uppercase">
              NUESTRAS TIENDAS ONLINE
            </h3>
            <StoryText />
          </motion.div>
        </div>

        {/* Segundo bloque: texto izquierda + imagen derecha */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center mt-16">
          {/* Imagen — en móvil va primero, en desktop va a la derecha */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="order-first md:order-last"
          >
            <div className="relative group w-full rounded-lg overflow-hidden">
              <img
                src="/images/ec2de592f_LCDW1080x1080px1.jpg"
                alt="Vuestras tiendas online"
                className="w-full object-cover transition-all duration-500 group-hover:grayscale"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/40">
                <span className="font-headline font-bold text-white text-2xl md:text-4xl text-center leading-tight drop-shadow-lg px-4">
                  +5.000.000€<br />generados
                </span>
              </div>
            </div>
          </motion.div>

          {/* Texto izquierda */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-last md:order-first"
          >
            <h3 className="font-headline font-bold text-[#121212] text-xl md:text-2xl leading-tight mb-5 uppercase">
              VUESTRAS TIENDAS ONLINE
            </h3>
            <VuestrasText />
          </motion.div>
        </div>

      </div>

      {/* CTA Button */}
      <div className="flex justify-center mt-16">
        <Link to={createPageUrl("Contacto")}>
          <PrimaryButton size="large">
            ¿ANALIZAMOS TU CASO?
          </PrimaryButton>
        </Link>
      </div>
    </section>
  );
}
