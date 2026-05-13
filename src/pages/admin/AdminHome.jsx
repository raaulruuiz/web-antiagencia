import { Link } from 'react-router-dom';
import { useAdmin } from './AdminLayout';

const ALL_NAV = [
  { to: '/admin/automatizaciones', label: 'Automatizaciones', icon: '⚡', page: 'automatizaciones', desc: 'Revisa el estado de las automatizaciones activas' },
  { to: '/admin/briefing',         label: 'Briefing',         icon: '📋', page: 'briefing',         desc: 'Reuniones, tareas y prioridades del día' },
  { to: '/admin/copywriting',      label: 'Copywriting',      icon: '✍️', page: 'copywriting',      desc: 'Crea y edita textos con asistencia de IA' },
  { to: '/admin/email-builder',   label: 'Email Builder',    icon: '📧', page: 'email-builder',   desc: 'Diseña emails HTML con editor visual o con IA' },
  { to: '/admin/paginas',         label: 'Páginas',          icon: '🌐', page: 'paginas',         desc: 'Gestiona y edita las páginas de la web con IA' },
  { to: '/admin/dashboard',        label: 'Dashboard',        icon: '📊', page: 'dashboard',        desc: 'Analytics, conversiones y tests A/B' },
  { to: '/admin/gym',              label: 'Entrenos',         icon: '🏋️', page: 'gym',              desc: 'Registro y seguimiento de entrenamientos' },
  { to: '/admin/loom',             label: 'Loom',             icon: '🎥', page: 'loom',             desc: 'Graba tu pantalla o audio y súbelo a Drive' },
  { to: '/admin/users',            label: 'Usuarios',         icon: '👥', page: 'users',            desc: 'Gestiona los accesos al panel' },
];

export default function AdminHome() {
  const { role, pages } = useAdmin();

  const visible = role === 'admin'
    ? ALL_NAV
    : ALL_NAV.filter(n => n.page === 'users' || pages.includes(n.page));

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <h1 className="text-white text-2xl font-semibold mb-1">¿Qué quieres hacer hoy?</h1>
      <p className="text-zinc-500 text-sm mb-8">Elige una sección para empezar.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map(({ to, label, icon, desc }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-xl border border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800 transition-colors px-5 py-5 flex flex-col gap-3"
          >
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="text-white text-sm font-medium group-hover:text-white">{label}</p>
              <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
