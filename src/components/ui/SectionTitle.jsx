import React from "react";
import { motion } from "framer-motion";

export default function SectionTitle({
  badge,
  title,
  subtitle,
  centered = true,
  light = false
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className={`max-w-3xl ${centered ? "mx-auto text-center" : ""}`}
    >
      {badge && (
        <span
          className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4 ${
            light
              ? "bg-white/10 text-white"
              : "bg-[#0067FD]/15 border border-[#0067FD]/30 text-[#0067FD]"
          }`}
        >
          {badge}
        </span>
      )}
      <h2
        className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight ${
          light ? "text-white" : "text-white"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-lg md:text-xl leading-relaxed ${
            light ? "text-white/80" : "text-white/50"
          }`}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
