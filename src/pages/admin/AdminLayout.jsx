import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { CopywritingProvider } from './CopywritingContext';

const AdminCtx = createContext({ role: 'lector', pages: [] });
export const useAdmin = () => useContext(AdminCtx);

const ALL_NAV = [
  { to: '/admin/automatizaciones', label: 'Automatizaciones', icon: '⚡', page: 'automatizaciones' },
  { to: '/admin/briefing',         label: 'Briefing',         icon: '📋', page: 'briefing' },
  { to: '/admin/copywriting',      label: 'Copywriting',      icon: '✍️', page: 'copywriting' },
  { to: '/admin/dashboard',        label: 'Dashboard',        icon: '📊', page: 'dashboard' },
  { to: '/admin/gym',              label: 'Entrenos',         icon: '🏋️', page: 'gym' },
  { to: '/admin/loom',             label: 'Loom',             icon: '🎥', page: 'loom' },
  { to: '/admin/users',            label: 'Usuarios',         icon: '👥', page: 'users' },
];

function navForRole(role, pages) {
  if (role === 'admin') return ALL_NAV;
  return ALL_NAV.filter(n => n.page === 'users' || pages.includes(n.page));
}

function AdminLayoutInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [role, setRole]   = useState('lector');
  const [pages, setPages] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { navigate('/admin/login'); return; }
      const { data: { user } } = await supabase.auth.getUser();
      setRole(user?.app_metadata?.role ?? 'lector');
      setPages(user?.app_metadata?.pages ?? []);
      setChecked(true);
    });
  }, [navigate]);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

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

  const NavLinks = () => visibleNav.map(({ to, label, icon }) => {
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
  });

  return (
    <AdminCtx.Provider value={{ role, pages }}>
      <div className="h-screen overflow-hidden flex" style={{ backgroundColor: '#0d0d0d', color: 'white', fontFamily: 'system-ui, sans-serif' }}>

        {/* Sidebar — solo desktop */}
        <aside className="hidden md:flex w-56 border-r border-zinc-800 flex-col flex-shrink-0 h-full">
          <div className="px-6 py-5 border-b border-zinc-800">
            <img src="/images/9563e10d2_AALogo.png" alt="Logo" className="h-7 w-auto" />
          </div>
          <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
            <NavLinks />
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

        {/* Contenido */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Top bar — solo mobile */}
          <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-800 flex-shrink-0">
            <img src="/images/9563e10d2_AALogo.png" alt="Logo" className="h-6 w-auto" />
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="text-zinc-400 hover:text-white transition-colors p-1"
              aria-label="Menú"
            >
              {menuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
              )}
            </button>
          </header>

          {/* Drawer móvil */}
          {menuOpen && (
            <div className="md:hidden absolute inset-0 z-50 flex" style={{ top: '49px' }}>
              <div className="w-64 h-full border-r border-zinc-800 flex flex-col" style={{ backgroundColor: '#0d0d0d' }}>
                <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
                  <NavLinks />
                </nav>
                <div className="px-3 py-4 border-t border-zinc-800">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                  >
                    <span>🚪</span>
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-black/50" onClick={() => setMenuOpen(false)} />
            </div>
          )}

          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminCtx.Provider>
  );
}

export default function AdminLayout() {
  return (
    <CopywritingProvider>
      <AdminLayoutInner />
    </CopywritingProvider>
  );
}
