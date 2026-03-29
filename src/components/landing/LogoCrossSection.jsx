import React from "react";
import { motion } from "framer-motion";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/01d58b46c_AALogo.png";

const quadrants = [
  {
    title: "CORTO PLAZO",
    subtitle: "Resultados",
    items: [
      "Análisis de métricas",
      "Planteamiento de estrategia",
      "Optimización de campañas",
      "Optimización web",
      "Test A/B",
    ],
    align: "right",
  },
  {
    title: "LARGO PLAZO",
    subtitle: "Escalas",
    items: [
      "Aumento de presupuesto",
      "Análisis de datos",
      "Adaptación al mercado",
      "Producción masiva de ads",
      "Escalado horizontal",
    ],
    align: "left",
  },
  {
    title: "EQUIPO",
    subtitle: "Recuperas tiempo",
    items: [
      "Desarrollador web",
      "Copywritter",
      "Media buyer",
      "Editor",
      "Project manager",
    ],
    align: "right",
  },
  {
    title: "REPORTE",
    subtitle: "Entiendes",
    items: [
      "Estrategia trimestral",
      "Reporting semanal",
      "Reuniones a demanda",
      "Comunicación diaria",
      "Transparencia operativa",
    ],
    align: "left",
  },
];

function QuadrantText({ title, subtitle, items, align }) {
  const isRight = align === "right";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col gap-2 ${isRight ? "items-end text-right" : "items-start text-left"}`}
    >
      <h3 className="font-headline font-bold text-white text-lg md:text-2xl tracking-widest whitespace-nowrap">
        {title}
      </h3>
      <p className="font-headline text-[#0055FF] text-sm md:text-base font-normal mb-1 whitespace-nowrap">
        {subtitle}
      </p>
      <div className={`flex flex-col gap-1 ${isRight ? "items-end" : "items-start"}`}>
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 ${isRight ? "flex-row-reverse" : "flex-row"}`}
          >
            <span className="w-[3px] h-4 bg-white flex-shrink-0 rounded-full" />
            <span className="text-white/70 text-xs md:text-sm font-body whitespace-nowrap">{item}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function LogoCrossSection() {
  return (
    <section className="bg-[#121212] py-20 px-0">
      <div className="max-w-6xl mx-auto px-2">

        {/* MOBILE: stacked layout */}
        <div className="flex flex-col gap-10 items-start md:hidden px-6">
          <QuadrantText {...quadrants[0]} align="left" />
          <QuadrantText {...quadrants[1]} align="left" />
          <motion.img
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            src={LOGO_URL}
            alt="AntiAgencia Logo"
            className="w-48"
          />
          <QuadrantText {...quadrants[2]} align="left" />
          <QuadrantText {...quadrants[3]} align="left" />
        </div>

        {/* DESKTOP: horizontal row layout */}
        <div className="hidden md:flex flex-row items-start justify-center gap-6 lg:gap-10">
          <QuadrantText {...quadrants[0]} align="left" />
          <QuadrantText {...quadrants[1]} align="left" />
          <motion.img
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            src={LOGO_URL}
            alt="AntiAgencia Logo"
            className="w-40 lg:w-52 flex-shrink-0"
          />
          <QuadrantText {...quadrants[2]} align="left" />
          <QuadrantText {...quadrants[3]} align="left" />
        </div>

      </div>
    </section>
  );
}
