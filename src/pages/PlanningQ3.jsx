import React from "react";

const bloques = [
  {
    titulo: "BLOQUE 0 - BONUS INDISCIPLINADO",
    descripcion: "Cómo gestionar tu publicidad durante este trimestre",
    paginas: 16,
    link: "https://docs.google.com/document/d/1biskk3VSSXoE2fk4xf8NpPishJdd65Uei-guM-AAXN0/edit?usp=drivesdk",
  },
  {
    titulo: "BLOQUE 1 - CONTEXTO",
    descripcion: "Entiende el contexto en el que estamos y cómo se comportará la gente",
    paginas: 16,
    link: "https://docs.google.com/document/d/1f4R3O8dOblZ2fuqYT0pn0VPyBmRJrGCtjleg6uwTlRU/edit?usp=drivesdk",
  },
  {
    titulo: "BLOQUE 2 - CREATIVIDAD Y MENSAJE",
    descripcion: "Entiende qué mensajes dar, y cómo darlos de forma diferencial",
    paginas: 7,
    link: "https://docs.google.com/document/d/1lWHxQUQdvkHEm-ps7GDhRQgdr1mYxIdvxccFhywkqSc/edit?usp=drivesdk",
  },
  {
    titulo: "BLOQUE 3 - CAMPAÑAS FLASH",
    descripcion: "Cómo hacer mejores campañas que tus competidores",
    paginas: 15,
    link: "https://docs.google.com/document/d/13aFUHlo20HM2hq0Fr_0me0yP5mgkm2g4I2kxpj69Wes/edit?usp=drivesdk",
  },
];

export default function PlanningQ3() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero */}
      <div className="bg-black text-white text-center px-6 py-24 md:py-32">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4">
          Planning Q3
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto">
          Prepárate para los próximos 3 meses
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {bloques.map((bloque) => (
            <a
              key={bloque.titulo}
              href={bloque.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between border border-zinc-200 rounded-2xl p-7 hover:border-black hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <div>
                <div className="w-10 h-10 bg-black rounded-xl mb-5 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {bloque.titulo.split(" ")[1]}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-zinc-900 mb-2 leading-snug">
                  {bloque.titulo}
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {bloque.descripcion}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-black group-hover:gap-2 transition-all duration-150">
                Accede al documento de {bloque.paginas} páginas
                <span className="text-base">→</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
