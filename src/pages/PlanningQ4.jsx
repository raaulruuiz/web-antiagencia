import React from "react";
import { Helmet } from "react-helmet-async";
import FooterMinimal from "@/components/landing/FooterMinimal";

const STRIPE_URL = "https://buy.stripe.com/9B68wP1Gt0YJ0rbeXIgfu0j";
const BLUE = "#0067FD";
// Domingo 4 de octubre de 2026, 23:59 hora de Madrid (CEST, UTC+2 — el cambio a
// horario de invierno ese año no llega hasta el último domingo de octubre).
const DEADLINE = new Date('2026-10-04T23:59:00+02:00');

function BuyButton() {
  return (
    <div className="mt-6 mb-10">
      <a
        href={STRIPE_URL}
        style={{
          display: 'inline-block',
          backgroundColor: BLUE,
          color: '#ffffff',
          fontFamily: "'Georgia', serif",
          textDecoration: 'none',
          padding: '16px 40px',
          borderRadius: '4px',
          cursor: 'pointer',
          textAlign: 'center',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7000FF'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = BLUE}
      >
        <div style={{ fontSize: '18px', fontWeight: '700', lineHeight: '1.3' }}>
          Quiero mi auditoría · 150€
        </div>
        <div style={{ fontSize: '13px', fontWeight: '400', marginTop: '4px', opacity: 0.9 }}>
          Todos los impuestos incluidos
        </div>
      </a>
    </div>
  );
}

const ITEMS = [
  <>Compras la auditoría en el botón de abajo — <strong>150€ (todos los impuestos incluidos)</strong></>,
  <>Tenemos una <strong>reunión para revisar todo tu email marketing</strong> (automatizaciones, campañas, estilo, cliente ideal…)</>,
  <>La reunión <strong>no tiene duración fija, estaremos el tiempo necesario</strong>.</>,
  <>Después de la reunión, prepararé un <strong>plan personalizado</strong> como el que paso a mis clientes adaptado a lo que hemos hablado en la reunión.</>,
];

function ListaNumerada() {
  return (
    <div className="mb-4">
      {ITEMS.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '14px', alignItems: 'baseline' }}>
          <span style={{ color: BLUE, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
          <span style={{ color: '#1f2937' }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

export default function PlanningQ4() {
  const cerrado = Date.now() > DEADLINE.getTime();

  return (
    <>
      <Helmet>
        <title>Planning Q4 - Antiagencia</title>
        <meta name="description" content="Auditoría de email marketing para preparar tu mejor Black Friday." />
        <link rel="canonical" href="https://antiagencia.es/q4" />
        {cerrado && <meta name="robots" content="noindex" />}
      </Helmet>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="flex-1 flex justify-center px-4 py-12 md:py-20">
          <div className="w-full max-w-3xl">
            <div className="bg-white shadow-xl rounded-sm px-8 md:px-16 py-12" style={{ fontFamily: "'Georgia', serif" }}>
              {cerrado ? (
                <div className="text-gray-800 text-base leading-relaxed" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <h1 className="text-2xl md:text-3xl text-gray-900 mb-4 font-bold">
                    Esta oferta ya no está disponible
                  </h1>
                  <p>El plazo terminó el domingo 4 de octubre a las 23:59.</p>
                </div>
              ) : (
                <div className="text-gray-800 text-base leading-relaxed">

                  <p className="mb-6" style={{ textAlign: 'left', fontWeight: 700, color: BLUE }}>
                    Aviso: Solo estará hasta el Domingo 4 de Octubre a las 23:59
                  </p>

                  <h1 className="text-[25px] md:text-4xl text-gray-900 mb-6 font-bold" style={{ textTransform: 'uppercase' }}>
                    Hacer tu mejor Black Friday es tan sencillo como:
                  </h1>

                  <ListaNumerada />

                  <BuyButton />

                </div>
              )}
            </div>
          </div>
        </div>
        <FooterMinimal />
      </div>
    </>
  );
}
