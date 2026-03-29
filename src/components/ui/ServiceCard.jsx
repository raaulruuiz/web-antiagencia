import React from "react";
import { motion } from "framer-motion";

export default function ServiceCard({
  icon: Icon,
  title,
  description,
  benefits = [],
  index = 0
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(0, 103, 253, 0.3)" }}
      className="group relative bg-[#0D1220] rounded-2xl border border-white/10 p-8 transition-all duration-300 hover:border-[#5A8CFE]/60"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0067FD]/5 to-[#0C9AFD]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0067FD] to-[#0C9AFD] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-7 h-7 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-white/50 leading-relaxed mb-5">
          {description}
        </p>

        {/* Benefits */}
        {benefits.length > 0 && (
          <ul className="space-y-2.5">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0067FD] mt-2 flex-shrink-0" />
                <span className="text-white/60 text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
