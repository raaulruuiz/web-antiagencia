import React from "react";
import { motion } from "framer-motion";

export default function PrimaryButton({
  children,
  variant = "primary",
  size = "default",
  href,
  onClick,
  type,
  className = ""
}) {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-[#0067FD] text-white hover:bg-[#386FFD] hover:shadow-lg hover:shadow-[#0067FD]/25 focus:ring-[#0067FD]",
    secondary: "bg-transparent text-white border-2 border-white/20 hover:border-[#0067FD] hover:text-[#0067FD] focus:ring-[#0067FD]",
    ghost: "bg-transparent text-[#0067FD] hover:bg-[#0067FD]/5 focus:ring-[#0067FD]",
    white: "bg-white text-[#0067FD] hover:bg-white/90 hover:shadow-lg focus:ring-white"
  };

  const sizes = {
    small: "px-4 py-2 text-sm",
    default: "px-6 py-3 text-base",
    large: "px-8 py-4 text-lg"
  };

  const combinedStyles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  const MotionComponent = motion.create(href ? 'a' : 'button');

  return (
    <MotionComponent
      href={href}
      onClick={onClick}
      type={type}
      className={combinedStyles}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </MotionComponent>
  );
}
