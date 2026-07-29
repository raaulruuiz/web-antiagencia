import { Link } from "react-router-dom";
import Footer from "@/components/landing/Footer";

export default function BlogLayout({ children, showBlogLink = false }) {
  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Georgia', serif" }}>
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-3xl mx-auto w-full">
        <span className="font-bold text-lg" style={{ color: "#0067FD" }}>
          Raúl Ruiz — Antiagencia
        </span>
        <Link
          to="/blog-email-marketing"
          className="text-sm uppercase tracking-wide font-semibold border px-3 py-1"
          style={{ color: "#7000FF", borderColor: "#7000FF" }}
        >
          Anti-Blog
        </Link>
      </header>

      {/* Contenido */}
      <main className="flex-1 flex justify-center px-4 py-10">
        <div className="w-full max-w-3xl">
          {children}
        </div>
      </main>

      {/* Logo centrado encima del footer */}
      <div className="flex justify-center py-8 border-t border-gray-200">
        <img
          src="/images/86f91b46c_LogotextoAnti-Agencia.png"
          alt="Antiagencia"
          className="h-10 w-auto object-contain"
          style={{ filter: "brightness(0)" }}
        />
      </div>

      <Footer />
    </div>
  );
}
