import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PrimaryButton from "../ui/PrimaryButton";

const navItems = [
  { label: "ANTIAGENCIA", type: "section", selector: "#antiagencia", accent: true },
  { label: "Resultados", type: "section", selector: "#resultados" },
  { label: "Cómo Trabajamos", type: "section", selector: "#filosofia" },
  { label: "Nosotros", type: "section", selector: "#nosotros" },
  { label: "Equipo", type: "section", selector: "#equipo" },
  { label: "Clientes", type: "section", selector: "#clientes" },
  { label: "Secreto ✦", type: "page", page: "Newsletter", accent: true },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "mx-4 mt-3 rounded-2xl bg-[#0D1220]/80 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/30"
            : "bg-[#121212]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Menú"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>

              <a href="#">
                <img
                  src="/images/86f91b46c_LogotextoAnti-Agencia.png"
                  alt="AntiAgencia"
                  className="h-10 w-auto"
                />
              </a>
            </div>

            {/* CTA (right) - only desktop */}
            <div className="hidden md:flex items-center gap-4">
              <Link to={createPageUrl("Newsletter")} className="font-headline text-sm text-white/70 hover:text-white transition-colors tracking-wide">
                Empezar Gratis
              </Link>
              <Link to={createPageUrl("Contacto")}>
                <PrimaryButton>
                  Contacto
                </PrimaryButton>
              </Link>
            </div>
            {/* Mobile spacer to balance hamburger */}
            <div className="md:hidden w-10" />
          </div>
        </div>
      </motion.header>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setIsMenuOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 left-0 h-full w-80 z-50 bg-[#0D1220] border-r border-white/10 flex flex-col px-6"
            >
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-6 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Logo en el drawer */}
              <div className="flex items-center justify-center pt-10 pb-8">
                <img
                  src="/images/6130113b7_AALogo.png"
                  alt="AntiAgencia"
                  className="h-16 w-auto"
                />
              </div>

              <div className="h-px bg-white/10 mb-6" />

              <div className="flex flex-col gap-1">
                {navItems.map((item) =>
                  item.type === "page" ? (
                    <Link
                      key={item.label}
                      to={createPageUrl(item.page)}
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-center gap-3 py-3.5 px-4 rounded-xl hover:bg-white/5 transition-all duration-200"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#7000FF] flex-shrink-0" />
                      <span className="font-headline text-base text-[#7000FF] group-hover:text-white transition-colors tracking-wider">
                        {item.label}
                      </span>
                    </Link>
                  ) : (
                    <button
                      key={item.label}
                      onClick={() => {
                        setIsMenuOpen(false);
                        setTimeout(() => {
                          const el = document.querySelector(item.selector);
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }, 200);
                      }}
                      className="group flex items-center gap-3 py-3.5 px-4 rounded-xl hover:bg-white/5 transition-all duration-200 text-left w-full"
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.accent ? "bg-[#0067FD]" : "bg-white/20 group-hover:bg-[#0067FD]"} transition-colors`} />
                      <span className={`font-headline text-base tracking-wider transition-colors ${item.accent ? "text-[#0067FD] group-hover:text-white" : "text-white/60 group-hover:text-white"}`}>
                        {item.label}
                      </span>
                    </button>
                  )
                )}
              </div>
              <div className="mt-6 h-px bg-white/5" />

              <div className="mt-auto mb-8">
                <Link to={createPageUrl("Contacto")} onClick={() => setIsMenuOpen(false)}>
                  <PrimaryButton size="large" className="w-full">
                    Contacto
                  </PrimaryButton>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
