// Envío de los formularios de MailerLite insertados en la web SIN cargar su script
// (groot.mailerlite.com/js/w/webforms.min.js). Ese script guarda un identificador
// (ml_guid) en el navegador al abrir la página, sin esperar al banner de cookies.
//
// Un único oyente (fase de captura en document) intercepta el envío de cualquier
// <form class="ml-block-form" action="https://assets.mailerlite.com/jsonp/…/subscribe">,
// lo valida como hacía el script (clases ml-validate-required / ml-validate-email, con
// el estilo .ml-error que ya trae el CSS de cada formulario) y lo envía por fetch
// (CORS, sin credenciales): MailerLite responde JSON {success:true} o los errores.
// Al terminar llama a window.ml_webform_success_<id> si la página lo define (redirecciones,
// eventos de Umami) y muestra el bloque de éxito (.row-success) del propio formulario.

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ES_FORM_ML = (f) =>
  f instanceof HTMLFormElement &&
  f.classList.contains("ml-block-form") &&
  /^https:\/\/assets\.mailerlite\.com\/jsonp\/\d+\/forms\/\d+\/subscribe/.test(f.action);

function validar(form) {
  let ok = true;
  form.querySelectorAll(".ml-validate-required, .ml-validate-email").forEach((g) => {
    const campos = [...g.querySelectorAll("input, select, textarea")].filter((c) => c.type !== "hidden");
    if (!campos.length) return;
    const marcables = campos.filter((c) => c.type === "checkbox" || c.type === "radio");
    let bien = true;
    if (g.classList.contains("ml-validate-required")) {
      bien = marcables.length ? marcables.some((c) => c.checked) : campos.every((c) => c.value.trim());
    }
    if (bien && g.classList.contains("ml-validate-email")) {
      const email = campos.find((c) => c.type === "email" || c.name === "fields[email]");
      bien = !email || EMAIL_OK.test(email.value.trim());
    }
    g.classList.toggle("ml-error", !bien);
    if (!bien) ok = false;
  });
  return ok;
}

function aviso(form, texto) {
  let p = form.querySelector(".ml-aviso-propio");
  if (!texto) { p?.remove(); return; }
  if (!p) {
    p = document.createElement("p");
    p.className = "ml-aviso-propio";
    p.setAttribute("role", "alert");
    p.style.cssText = "color:#c00;font-size:14px;line-height:20px;margin:10px 0 0;clear:both;text-align:left;";
    (form.querySelector(".ml-form-embedSubmit") || form).appendChild(p);
  }
  p.textContent = texto;
}

function cargando(form, si) {
  const boton = form.querySelector(".ml-form-embedSubmit button.primary, button[type=submit]");
  const rueda = form.querySelector(".ml-form-embedSubmit button.loading");
  if (boton) boton.style.display = si ? "none" : "";
  if (rueda) rueda.style.display = si ? "inline-block" : "none";
}

function traducir(j) {
  const email = j?.errors?.fields?.email?.[0] || "";
  if (/valid/i.test(email)) return "Ese email no parece correcto. Revísalo.";
  if (/required/i.test(email)) return "Escribe tu email.";
  return "No se ha podido enviar. Revisa los datos e inténtalo otra vez.";
}

async function enviar(form) {
  aviso(form, "");
  if (!validar(form)) { aviso(form, "Revisa los campos marcados en rojo."); return; }
  cargando(form, true);
  try {
    const r = await fetch(form.action, { method: "POST", body: new FormData(form), mode: "cors", credentials: "omit" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.success) { cargando(form, false); aviso(form, traducir(j)); return; }
  } catch {
    cargando(form, false);
    aviso(form, "No hay conexión o MailerLite no responde. Inténtalo otra vez en un momento.");
    return;
  }
  const contenedor = form.closest(".ml-form-embedContainer");
  const id = contenedor?.id?.replace(/^mlb2-/, "");
  const alTerminar = id && window[`ml_webform_success_${id}`];
  try { if (typeof alTerminar === "function") alTerminar(); } catch { /* el aviso de la página no debe romper el envío */ }
  const caja = form.closest(".ml-form-embedWrapper") || contenedor;
  const cuerpo = caja?.querySelector(".row-form");
  const exito = caja?.querySelector(".row-success");
  if (exito) { exito.style.display = "block"; if (cuerpo) cuerpo.style.display = "none"; }
  cargando(form, false);
}

let activo = false;
export function activarFormulariosMailerLite() {
  if (activo || typeof document === "undefined") return;
  activo = true;
  document.addEventListener("submit", (e) => {
    const form = e.target;
    if (!ES_FORM_ML(form)) return;
    e.preventDefault();
    e.stopPropagation();
    enviar(form);
  }, true);
}
