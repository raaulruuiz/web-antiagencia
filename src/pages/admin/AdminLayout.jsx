import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const AdminCtx = createContext({ role: 'lector', pages: [] });
export const useAdmin = () => useContext(AdminCtx);

const ALL_NAV = [
  { to: '/admin/dashboard',        label: 'Dashboard',        icon: '📊', page: 'dashboard' },
  { to: '/admin/loom',             label: 'Loom',             icon: '🎥', page: 'loom' },
  { to: '/admin/automatizaciones', label: 'Automatizaciones', icon: '⚡', page: 'automatizaciones' },
  { to: '/admin/gym',              label: 'Entrenos',         icon: '🏋️', page: 'gym' },
  { to: '/admin/users',            label: 'Usuarios',         icon: '👥', page: 'users' },
];

function navForRole(role, pages) {
  if (role === 'admin') return ALL_NAV;
  // lector: siempre ve Usuarios (solo lectura) + las páginas asignadas
  return ALL_NAV.filter(n => n.page === 'users' || pages.includes(n.page));
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [role, setRole]   = useState('lector');
  const [pages, setPages] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { navigate('/admin/login'); return; }
      // app_metadata viene en el JWT; lo leemos del usuario completo
      const { data: { user } } = await supabase.auth.getUser();
      setRole(user?.app_metadata?.role ?? 'lector');
      setPages(user?.app_metadata?.pages ?? []);
      setChecked(true);
    });
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (!checked) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0d0d' }}>
        <div className="w-8 h-8 border-4 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const visibleNav = navForRole(role, pages);

  return (
    <AdminCtx.Provider value={{ role, pages }}>
      <div className="h-screen overflow-hidden flex" style={{ backgroundColor: '#0d0d0d', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
        {/* Sidebar fijo */}
        <aside className="w-56 border-r border-zinc-800 flex flex-col flex-shrink-0 h-full">
          <div className="px-6 py-5 border-b border-zinc-800">
            <img src="/images/9563e10d2_AALogo.png" alt="Logo" className="h-7 w-auto" />
          </div>
          <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
            {visibleNav.map(({ to, label, icon }) => {
              const active = location.pathname === to || location.pathname.startsWith(to + '/');
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="px-3 py-4 border-t border-zinc-800 flex-shrink-0">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <span>🚪</span>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>

        {/* Contenido con scroll */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </AdminCtx.Provider>
  );
}
