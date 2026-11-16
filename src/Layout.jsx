import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { contarPageViewMeta } from "@/lib/consentimiento";

// Cuenta el PageView de Meta en la navegación interna de estas páginas.
// El píxel solo existe si el visitante ha aceptado las cookies (src/lib/consentimiento.js).
export default function Layout({ children }) {
  const location = useLocation();

  useEffect(() => {
    contarPageViewMeta(location.pathname);
  }, [location.pathname]);

  return children;
}
