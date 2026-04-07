import { useState } from 'react';
import META from './automatizaciones-meta.json';

const TIPO_LABEL = { cron: 'Cron', webhook: 'Webhook', bot: 'Bot' };
const TIPO_COLOR = {
  cron:    'bg-blue-900 text-blue-300',
  webhook: 'bg-purple-900 text-purple-300',
  bot:     'bg-green-900 text-green-300',
};

export default function Automatizaciones() {
  const items = META;
  const [expanded, setExpanded] = useState(null);

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-white text-2xl font-semibold mb-6">Automatizaciones</h1>

      <div className="flex flex-col gap-2">
        {items.map(item => {
          const isOpen = expanded === item.id;
          return (
            <div
              key={item.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden"
            >
              <button
                onClick={() => toggle(item.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-zinc-800 transition-colors"
              >
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${TIPO_COLOR[item.tipo] ?? 'bg-zinc-700 text-zinc-300'}`}>
                  {TIPO_LABEL[item.tipo] ?? item.tipo}
                </span>
                <span className="text-white text-sm font-medium flex-1">{item.nombre}</span>
                <span className="text-zinc-500 text-xs">{item.schedule}</span>
                <span className="text-zinc-600 ml-2">{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t border-zinc-800">
                  <p className="text-zinc-300 text-sm mt-4 mb-4 leading-relaxed">{item.descripcion}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.apps.map(app => (
                      <span key={app} className="text-xs bg-zinc-800 text-zinc-300 border border-zinc-700 px-3 py-1 rounded-full">
                        {app}
                      </span>
                    ))}
                  </div>
                  {item.comandos && item.comandos.length > 0 && (
                    <div className="mt-4">
                      <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-2">Comandos</p>
                      <div className="flex flex-col gap-1">
                        {item.comandos.map(cmd => (
                          <div key={cmd.nombre} className="flex gap-3 text-sm">
                            <span className="text-violet-400 font-mono shrink-0">{cmd.nombre}</span>
                            <span className="text-zinc-400">{cmd.descripcion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
