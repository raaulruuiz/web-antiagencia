import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { CV_ES } from "./cvDatos";

// Currículum interactivo: pantallas con texto a máquina de escribir y un botón para pasar a la siguiente.
// El PDF se abre en el navegador (pestaña nueva), no se fuerza la descarga. Mismo componente para /cv y /cv-en
// (los textos de cada idioma están en cvDatos.js y cvDatosEn.js).

const EMAIL = "raul@antiagencia.es";
const sinMovimiento = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const norm = (p) => (typeof p === "string" ? { t: p } : p);

function conEnlaces(texto) {
  const i = texto.indexOf(EMAIL);
  if (i < 0) return texto;
  return (
    <>
      {texto.slice(0, i)}
      <a href={`mailto:${EMAIL}`} className="cv-link">{EMAIL}</a>
      {texto.slice(i + EMAIL.length)}
    </>
  );
}

// Escribe los párrafos uno tras otro; un toque sobre el texto lo completa de golpe
function MaquinaDeEscribir({ parrafos, onFin, aviso }) {
  const ps = useMemo(() => parrafos.map(norm), [parrafos]);
  const total = useMemo(() => ps.reduce((n, p) => n + p.t.length, 0), [ps]);
  const [n, setN] = useState(() => (sinMovimiento() ? total : 0));
  const fin = useRef(false);

  useEffect(() => {
    if (n >= total) {
      if (!fin.current) { fin.current = true; onFin?.(); }
      return;
    }
    // posición actual: pausa más larga al cerrar frase o párrafo
    let resto = n, p = 0;
    while (p < ps.length && resto >= ps[p].t.length) { resto -= ps[p].t.length; p++; }
    const anterior = resto === 0 && p > 0 ? ps[p - 1].t.slice(-1) : ps[p].t[resto - 1];
    let espera = 17;
    if (resto === 0 && p > 0) espera = 380;
    else if (/[.?!…:]/.test(anterior || "")) espera = 160;
    else if (anterior === ",") espera = 70;
    const t = setTimeout(() => setN((x) => Math.min(total, x + 1)), espera);
    return () => clearTimeout(t);
  }, [n, total, ps, onFin]);

  let quedan = n;
  return (
    <div className="cv-texto" onClick={() => setN(total)} title={n < total ? aviso : undefined}>
      {ps.map((p, i) => {
        if (quedan < 0) return null;
        const visible = p.t.slice(0, Math.max(0, quedan));
        const completo = quedan >= p.t.length;
        const escribiendo = !completo && quedan >= 0;
        quedan -= p.t.length;
        return (
          <p key={i} className={p.em ? "cv-em" : p.li ? "cv-li" : undefined}>
            {completo ? conEnlaces(p.t) : visible}
            {escribiendo && <span className="cv-cursor" aria-hidden="true" />}
          </p>
        );
      })}
    </div>
  );
}

function Marco({ imagen, retraso = 0, par = false }) {
  return (
    <figure className={`cv-marco ${imagen.ancha ? "cv-ancha" : ""}`} style={{ animationDelay: `${retraso}ms` }}>
      <div className={`cv-marco-in ${imagen.claro ? "cv-claro" : ""}`}>
        <img
          src={imagen.src}
          alt={imagen.alt}
          className={par ? (imagen.claro ? "cv-img-par cv-contain" : "cv-img-par") : "cv-img"}
          loading="eager"
        />
      </div>
    </figure>
  );
}

function Imagenes({ lista }) {
  if (!lista?.length) return null;
  const par = lista.length > 1;
  return (
    <div className={par ? "cv-imgs-par" : "cv-imgs-una"}>
      {lista.map((im, i) => <Marco key={im.src} imagen={im} retraso={i * 350} par={par} />)}
    </div>
  );
}

function RelojDeArena({ onClick, girado, etiqueta }) {
  return (
    <button type="button" className={`cv-reloj ${girado ? "cv-girado" : ""}`} onClick={onClick} aria-label={etiqueta}>
      <svg viewBox="0 0 64 96" width="72" height="108" aria-hidden="true">
        <defs>
          <linearGradient id="cv-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0067FD" />
            <stop offset="100%" stopColor="#7000FF" />
          </linearGradient>
        </defs>
        <rect x="6" y="2" width="52" height="8" rx="4" fill="url(#cv-grad)" />
        <rect x="6" y="86" width="52" height="8" rx="4" fill="url(#cv-grad)" />
        <path d="M12 10 C12 34 28 40 28 48 C28 56 12 62 12 86 L52 86 C52 62 36 56 36 48 C36 40 52 34 52 10 Z" fill="none" stroke="url(#cv-grad)" strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M17 16 L47 16 C46 30 34 38 32 46 C30 38 18 30 17 16 Z" fill="#7000FF" opacity="0.85" />
        <path d="M32 58 C30 66 20 72 18 81 L46 81 C44 72 34 66 32 58 Z" fill="#0067FD" opacity="0.35" />
        <line x1="32" y1="46" x2="32" y2="80" stroke="#7000FF" strokeWidth="1.5" strokeDasharray="2 3" className="cv-arena" />
      </svg>
    </button>
  );
}

function Pantalla({ datos, textos, numero, onSiguiente, onPdf }) {
  // fases: intro-img → intro-frase → imagenes → texto → fin
  const [fase, setFase] = useState(datos.intro ? "intro-img" : "imagenes");
  const [saliendo, setSaliendo] = useState(false);
  const [girado, setGirado] = useState(false);

  useEffect(() => {
    const rapido = sinMovimiento();
    const pasos = {
      "intro-img": [2400, "intro-img-out"],
      "intro-img-out": [600, "intro-frase"],
      "intro-frase": [1800, "intro-frase-out"],
      "intro-frase-out": [600, "imagenes"],
      imagenes: [datos.imagenes?.length ? 700 + (datos.imagenes.length - 1) * 350 : 150, "texto"],
    };
    const p = pasos[fase];
    if (!p) return;
    const t = setTimeout(() => setFase(p[1]), rapido ? 50 : p[0]);
    return () => clearTimeout(t);
  }, [fase, datos]);

  const alTerminar = useCallback(() => setFase("fin"), []);

  const pulsar = (b) => {
    if (b.accion === "pdf") return onPdf(numero);
    setSaliendo(true);
    setTimeout(onSiguiente, 350);
  };

  const girar = () => {
    if (girado) return;
    setGirado(true);
    setTimeout(() => { setSaliendo(true); setTimeout(onSiguiente, 350); }, 1300);
  };

  const enIntro = fase.startsWith("intro");

  return (
    <section className={`cv-pantalla ${saliendo ? "cv-sale" : ""}`}>
      {datos.titulo && <h1 className="cv-titulo">{datos.titulo}</h1>}

      {enIntro && (
        <div className="cv-intro">
          {fase.startsWith("intro-img") && (
            <div className={fase === "intro-img-out" ? "cv-desaparece" : ""}>
              <Imagenes lista={[datos.intro.imagen]} />
            </div>
          )}
          {fase.startsWith("intro-frase") && (
            <p className={`cv-ups ${fase === "intro-frase-out" ? "cv-desaparece" : ""}`}>{datos.intro.frase}</p>
          )}
        </div>
      )}

      {!enIntro && <Imagenes lista={datos.imagenes} />}

      {(fase === "texto" || fase === "fin") && <MaquinaDeEscribir parrafos={datos.texto} onFin={alTerminar} aviso={textos.verTodo} />}

      {fase === "fin" && datos.reloj && (
        <div className="cv-aparece cv-centro">
          <RelojDeArena onClick={girar} girado={girado} etiqueta={textos.reloj} />
        </div>
      )}

      {fase === "fin" && datos.botones && (
        <div className="cv-botones cv-aparece">
          {datos.botones.map((b) => (
            <button key={b.label} type="button" onClick={() => pulsar(b)} className={b.secundario ? "cv-btn cv-btn-sec" : "cv-btn"}>
              {b.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export function CVPagina({ cv }) {
  const { pantallas: PANTALLAS, pdf: PDF, textos } = cv;
  const [i, setI] = useState(0);

  const abrirPdf = (pantalla) => {
    window.umami?.track("cv-pdf", { pantalla, idioma: cv.idioma });
    window.open(PDF, "_blank", "noopener");
  };

  const siguiente = () => {
    setI((x) => {
      const n = Math.min(PANTALLAS.length - 1, x + 1);
      window.umami?.track("cv-pantalla", { pantalla: n + 1, idioma: cv.idioma });
      return n;
    });
    window.scrollTo(0, 0);
  };

  useEffect(() => { window.scrollTo(0, 0); }, [i]);

  return (
    <>
      <Helmet>
        <html lang={cv.idioma} />
        <title>{textos.titulo}</title>
        <meta name="description" content={textos.descripcion} />
      </Helmet>
      <style>{CSS}</style>
      <div className="cv-raiz">
        <Link to={textos.otroIdioma.href} className="cv-idioma" hrefLang={textos.otroIdioma.idioma} lang={textos.otroIdioma.idioma}>
          {textos.otroIdioma.label}
        </Link>
        <div className="cv-progreso" aria-hidden="true"><span style={{ width: `${((i + 1) / PANTALLAS.length) * 100}%` }} /></div>
        <main className="cv-main">
          <Pantalla key={i} datos={PANTALLAS[i]} textos={textos} numero={i + 1} onSiguiente={siguiente} onPdf={abrirPdf} />
        </main>
        <a href={PDF} target="_blank" rel="noopener" className="cv-pdf-sutil" onClick={() => window.umami?.track("cv-pdf", { pantalla: i + 1, sutil: true, idioma: cv.idioma })}>
          {textos.pdfSutil}
        </a>
      </div>
    </>
  );
}

export default function CV() {
  return <CVPagina cv={CV_ES} />;
}

const CSS = `
.cv-raiz{min-height:100vh;background:#121212;color:#fff;font-family:'Rubik',sans-serif;display:flex;flex-direction:column}
.cv-progreso{position:fixed;top:0;left:0;right:0;height:3px;background:rgba(255,255,255,.06);z-index:20}
.cv-progreso span{display:block;height:100%;background:linear-gradient(90deg,#0067FD,#7000FF);transition:width .6s ease}
.cv-main{flex:1;width:100%;max-width:680px;margin:0 auto;padding:56px 20px 96px}
.cv-pantalla{animation:cv-entra .5s ease both}
.cv-sale{animation:cv-sale .35s ease both}
.cv-titulo{font-size:clamp(40px,9vw,76px);font-weight:800;line-height:1;letter-spacing:-.02em;margin:8vh 0 36px;
  background:linear-gradient(90deg,#0067FD,#7000FF);-webkit-background-clip:text;background-clip:text;color:transparent;animation:cv-pop .8s ease both}
.cv-texto{font-size:18px;line-height:1.7;color:rgba(255,255,255,.88);cursor:default}
.cv-texto p,.cv-texto li{margin:0 0 18px;white-space:pre-wrap}
.cv-em{font-weight:600;color:#fff;font-size:20px}
.cv-li{list-style:none;position:relative;padding-left:22px}
.cv-li::before{content:"";position:absolute;left:2px;top:.72em;width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#0067FD,#7000FF)}
.cv-cursor{display:inline-block;width:2px;height:1.1em;margin-left:2px;vertical-align:-.18em;background:#0067FD;animation:cv-parpadeo .9s steps(1) infinite}
.cv-link{color:#4d8dff;text-decoration:underline;text-underline-offset:3px}
.cv-link:hover{color:#9a5cff}
.cv-imgs-una{margin:0 auto 32px;display:flex;justify-content:center}
.cv-imgs-una .cv-marco{max-width:380px;width:100%}
.cv-imgs-una .cv-marco.cv-ancha{max-width:100%}
.cv-imgs-par{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:0 0 32px}
.cv-marco{margin:0;padding:3px;border-radius:18px;background:linear-gradient(135deg,#0067FD,#7000FF);
  box-shadow:0 18px 50px -18px rgba(112,0,255,.55),0 10px 30px -20px rgba(0,103,253,.6);animation:cv-pop .8s cubic-bezier(.2,.8,.2,1) both}
.cv-marco-in{border-radius:15px;overflow:hidden;background:#121212;line-height:0}
.cv-marco-in.cv-claro{background:#fff}
.cv-img{width:100%;height:auto;display:block}
.cv-img-par{width:100%;aspect-ratio:4/5;object-fit:cover;display:block}
.cv-contain{object-fit:contain;padding:10%}
.cv-intro{min-height:52vh;display:flex;align-items:center;justify-content:center}
.cv-intro>div{width:100%}
.cv-ups{font-size:clamp(30px,7vw,52px);font-weight:700;text-align:center;margin:0;animation:cv-pop .6s ease both}
.cv-desaparece{animation:cv-desaparece .6s ease both}
.cv-botones{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
.cv-btn{font-family:inherit;font-weight:700;font-size:16px;letter-spacing:.03em;color:#fff;border:0;border-radius:999px;padding:16px 28px;cursor:pointer;
  background:linear-gradient(90deg,#0067FD,#7000FF);box-shadow:0 10px 30px -10px rgba(0,103,253,.7);transition:transform .15s ease,box-shadow .2s ease}
.cv-btn:hover{transform:translateY(-2px);box-shadow:0 14px 34px -10px rgba(112,0,255,.75)}
.cv-btn-sec{background:transparent;border:1.5px solid rgba(255,255,255,.25);box-shadow:none}
.cv-btn-sec:hover{border-color:#7000FF;box-shadow:none}
.cv-centro{display:flex;justify-content:center;margin-top:8px}
.cv-reloj{background:none;border:0;padding:12px;cursor:pointer;transition:transform 1.1s cubic-bezier(.65,0,.35,1);filter:drop-shadow(0 10px 24px rgba(112,0,255,.45))}
.cv-reloj:not(.cv-girado){animation:cv-balanceo 2.4s ease-in-out infinite}
.cv-reloj:not(.cv-girado):hover{transform:scale(1.08)}
.cv-girado{transform:rotate(180deg)}
.cv-arena{animation:cv-cae 1s linear infinite}
.cv-aparece{animation:cv-pop .6s ease both}
.cv-pdf-sutil{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);font-size:13px;color:rgba(255,255,255,.5);text-decoration:none;
  padding:7px 14px;border-radius:999px;background:rgba(18,18,18,.82);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(6px);white-space:nowrap;z-index:20;transition:color .2s,border-color .2s}
.cv-idioma{position:fixed;top:14px;right:16px;z-index:21;font-size:13px;font-weight:500;letter-spacing:.04em;color:rgba(255,255,255,.55);text-decoration:none;
  padding:6px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(18,18,18,.7);backdrop-filter:blur(6px);transition:color .2s,border-color .2s}
.cv-idioma:hover{color:#fff;border-color:rgba(112,0,255,.6)}
.cv-pdf-sutil:hover{color:#fff;border-color:rgba(112,0,255,.6)}
@keyframes cv-entra{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes cv-sale{to{opacity:0;transform:translateY(-10px)}}
@keyframes cv-pop{from{opacity:0;transform:scale(.94) translateY(12px);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}
@keyframes cv-desaparece{to{opacity:0;transform:scale(.96);filter:blur(6px)}}
@keyframes cv-parpadeo{50%{opacity:0}}
@keyframes cv-balanceo{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
@keyframes cv-cae{to{stroke-dashoffset:-10}}
@media (max-width:520px){.cv-texto{font-size:17px}.cv-em{font-size:18px}.cv-imgs-par{gap:10px}.cv-main{padding-top:44px}.cv-btn{width:100%}}
@media (prefers-reduced-motion:reduce){.cv-raiz *{animation:none!important;transition:none!important}}
`;
