import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import PrimaryButton from "../ui/PrimaryButton";
import { Input } from "@/components/ui/input";

const benefits = [
  "Análisis gratuito de tu tienda",
  "Sin compromiso",
  "Respuesta en 24h"
];

export default function CTASection() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", shopUrl: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: replace with your own backend or email service (e.g. Formspree, Resend, etc.)
    const mailtoLink = `mailto:raul@antiagencia.es?subject=${encodeURIComponent(`Nueva solicitud de estrategia - ${form.name}`)}&body=${encodeURIComponent(`Nombre: ${form.name}\nEmail: ${form.email}\nTeléfono: ${form.phone}\nURL de la tienda: ${form.shopUrl}`)}`;
    window.location.href = mailtoLink;
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section id="contacto" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0067FD] to-[#0C9AFD]" />

      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
            Sin compromiso
          </span>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Te regalamos la estrategia.
            <br />
            Vendemos la implementación.
          </h2>

          <p className="mt-6 text-lg text-white/80 max-w-xl mx-auto">
            Analizamos tu ecommerce y te damos un plan concreto para escalar. Si te gusta, lo implementamos juntos.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10"
        >
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg mx-auto">
              <Input
                type="text"
                placeholder="Nombre"
                value={form.name}
                onChange={handleChange("name")}
                required
                className="h-14 px-5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus-visible:ring-2 focus-visible:ring-white/50"
              />
              <Input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange("email")}
                required
                className="h-14 px-5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus-visible:ring-2 focus-visible:ring-white/50"
              />
              <Input
                type="tel"
                placeholder="Teléfono"
                value={form.phone}
                onChange={handleChange("phone")}
                required
                className="h-14 px-5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus-visible:ring-2 focus-visible:ring-white/50"
              />
              <Input
                type="url"
                placeholder="URL de tu tienda (https://...)"
                value={form.shopUrl}
                onChange={handleChange("shopUrl")}
                required
                className="h-14 px-5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus-visible:ring-2 focus-visible:ring-white/50"
              />
              <PrimaryButton
                variant="white"
                size="large"
                type="submit"
                className="w-full mt-2"
              >
                {loading ? "Enviando..." : "Pedir estrategia gratis"}
                {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
              </PrimaryButton>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/20 rounded-2xl p-8 max-w-lg mx-auto"
            >
              <CheckCircle2 className="w-12 h-12 text-white mx-auto mb-4" />
              <p className="text-xl font-semibold text-white">¡Recibido!</p>
              <p className="text-white/80 mt-2">Te contactamos en menos de 24h.</p>
            </motion.div>
          )}

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-white/90">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
