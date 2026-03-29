import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CaseCard({
  brand,
  category,
  metrics = [],
  highlights = [],
  index = 0
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="group relative bg-[#0D1220] rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-[#5A8CFE]/60 hover:shadow-xl hover:shadow-[#0067FD]/20"
    >
      {/* Header */}
      <div className="p-6 pb-4 border-b border-white/10">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#0067FD]/10 text-[#0067FD] mb-3">
          {category}
        </span>
        <h3 className="text-xl font-bold text-white">{brand}</h3>
      </div>

      {/* Metrics */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10">
          {metrics.map((metric, i) => (
            <div key={i} className="p-4 text-center">
              <div className="text-2xl font-bold text-[#0067FD]">{metric.value}</div>
              <div className="text-xs text-white/40 mt-1">{metric.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Highlights */}
      <div className="p-6">
        <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
          Qué hicimos
        </p>
        <ul className="space-y-2 mb-6">
          {highlights.map((highlight, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0C9AFD] mt-1.5 flex-shrink-0" />
              {highlight}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button className="inline-flex items-center gap-2 text-[#0067FD] font-semibold text-sm group-hover:gap-3 transition-all duration-300">
          Ver caso completo
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
