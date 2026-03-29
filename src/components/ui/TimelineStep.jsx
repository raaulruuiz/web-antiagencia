import React from "react";
import { motion } from "framer-motion";

export default function TimelineStep({
  number,
  title,
  description,
  icon: Icon,
  isLast = false,
  index = 0
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="relative flex flex-col items-center"
    >
      {/* Connector line (horizontal on desktop, vertical on mobile) */}
      {!isLast && (
        <>
          {/* Desktop horizontal line */}
          <div className="hidden md:block absolute top-7 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#0067FD] to-white/10" />
          {/* Mobile vertical line */}
          <div className="md:hidden absolute top-14 left-7 w-0.5 h-full bg-gradient-to-b from-[#0067FD] to-white/10" />
        </>
      )}

      {/* Step content */}
      <div className="relative z-10 flex md:flex-col items-start md:items-center gap-4 md:gap-0 w-full md:w-auto">
        {/* Number circle */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0067FD] to-[#0C9AFD] flex items-center justify-center shadow-lg shadow-[#0067FD]/20 flex-shrink-0"
        >
          {Icon ? (
            <Icon className="w-6 h-6 text-white" />
          ) : (
            <span className="text-lg font-bold text-white">{number}</span>
          )}
        </motion.div>

        {/* Text content */}
        <div className="md:text-center md:mt-5 pb-8 md:pb-0">
          <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
          <p className="text-sm text-white/50 leading-relaxed max-w-[200px]">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
