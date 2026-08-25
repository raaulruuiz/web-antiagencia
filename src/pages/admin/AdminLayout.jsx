import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { CopywritingProvider } from './CopywritingContext';

const AdminCtx = createContext({ role: 'lector', pages: [] });
export const useAdmin = () => useContext(AdminCtx);

const ALL_NAV = [
  { to: '/admin/automatizaciones', label: 'Automatizaciones', icon: '⚡', page: 'automatizaciones' },
  { to: '/admin/biblioteca',       label: 'Biblioteca',       icon: '📚', page: 'biblioteca' },
  { to: '/admin/briefing',         label: 'Briefing',         icon: '📋', page: 'briefing' },
  { to: '/admin/copywriting',      label: 'Copywriting',      icon: '✍️', page: 'copywriting' },
  { to: '/admin/dashboard',        label: 'Dashboard',        icon: '📊', page: 'dashboard' },
  { to: '/admin/email-builder',    label: 'Email Builder',    icon: '📧', page: 'email-builder' },
  { to: '/admin/gym',              label: 'Entrenos',         icon: '🏋️', page: 'gym' },
  { to: '/admin/finanzas',         label: 'Finanzas',         icon: '💰', page: 'finanzas' },
  { to: '/admin/loom',             label: 'Loom',             icon: '🎥', page: 'loom' },
  { to: '/admin/paginas',          label: 'Páginas',          icon: '🌐', page: 'paginas' },
  { to: '/admin/pomodoro',         label: 'Pomodoro',         icon: '🍅', page: 'pomodoro' },
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
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('admin_sidebar_collapsed') === '1');

  const toggleCollapsed = () => setCollapsed(c => {
    const next = !c;
    localStorage.setItem('admin_sidebar_collapsed', next ? '1' : '0');
    return next;
  });

  useEffect(() => {
    async function loadUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!user || error) { navigate('/admin/login'); return; }
      setRole(user?.app_metadata?.role ?? 'lector');
      setPages(user?.app_metadata?.pages ?? []);
      setChecked(true);
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') navigate('/admin/login');
    });

    return () => subscription.unsubscribe();
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

  const NavLinks = ({ mobile = false }) => visibleNav.map(({ to, label, icon }) => {
    const active = location.pathname === to || location.pathname.startsWith(to + '/');
    if (!mobile && collapsed) {
      return (
        <Link key={to} to={to} title={label}
          className={`flex items-center justify-center py-2 rounded-lg text-lg transition-colors ${
            active ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <span>{icon}</span>
        </Link>
      );
    }
    return (
      <Link key={to} to={to}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
          active ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
        }`}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </Link>
    );
  });

  const SidebarContent = ({ mobile = false }) => (
    <>
      <nav className={`flex-1 py-4 flex flex-col gap-1 overflow-y-auto ${!mobile && collapsed ? 'px-2' : 'px-3'}`}>
        <NavLinks mobile={mobile} />
      </nav>
      <div className={`py-4 border-t border-zinc-800 flex-shrink-0 ${!mobile && collapsed ? 'px-2' : 'px-3'}`}>
        {!mobile && collapsed ? (
          <button onClick={handleSignOut} title="Cerrar sesión"
            className="w-full flex items-center justify-center py-2 rounded-lg text-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
            <span>🚪</span>
          </button>
        ) : (
          <button onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
            <span>🚪</span>
            <span>Cerrar sesión</span>
          </button>
        )}
      </div>
    </>
  );

  return (
    <AdminCtx.Provider value={{ role, pages }}>
      <div className="h-screen overflow-hidden flex flex-col md:flex-row" style={{ backgroundColor: '#0d0d0d', color: 'white', fontFamily: 'system-ui, sans-serif' }}>

        {/* ── Top bar móvil ── */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-800 flex-shrink-0">
          <a href="https://antiagencia.es/admin/">
            <img src="/images/9563e10d2_AALogo.png" alt="Logo" className="h-6 w-auto" />
          </a>
          <button
            onClick={() => setMenuOpen(true)}
            className="text-zinc-400 hover:text-white p-1 transition-colors"
            aria-label="Abrir menú"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Drawer móvil ── */}
        {menuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="w-64 flex flex-col h-full border-r border-zinc-800" style={{ backgroundColor: '#0d0d0d' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 flex-shrink-0">
                <a href="https://antiagencia.es/admin/">
                  <img src="/images/9563e10d2_AALogo.png" alt="Logo" className="h-6 w-auto" />
                </a>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-zinc-400 hover:text-white p-1 transition-colors"
                  aria-label="Cerrar menú"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <SidebarContent mobile />
            </div>
            {/* Overlay */}
            <div className="flex-1 bg-black/60" onClick={() => setMenuOpen(false)} />
          </div>
        )}

        {/* ── Sidebar desktop ── */}
        <aside
          className="hidden md:flex border-r border-zinc-800 flex-col flex-shrink-0 h-full"
          style={{ width: collapsed ? 56 : 224, transition: 'width 0.2s ease' }}
        >
          {/* Logo + collapse toggle */}
          <div className="border-b border-zinc-800 flex-shrink-0"
            style={{ padding: collapsed ? '14px 0 10px' : '14px 16px 10px', display: 'flex', flexDirection: collapsed ? 'column' : 'row', alignItems: 'center', gap: collapsed ? 6 : 0, justifyContent: collapsed ? 'center' : 'space-between', minHeight: 60 }}>
            <a href="https://antiagencia.es/admin/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <img src="/images/9563e10d2_AALogo.png" alt="Logo"
                style={{ height: collapsed ? 22 : 28, width: 'auto', transition: 'height 0.2s ease' }} />
            </a>
            <button onClick={toggleCollapsed} title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
              className="text-zinc-500 hover:text-white transition-colors p-1 rounded"
              style={{ flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points={collapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'} />
              </svg>
            </button>
          </div>

          <SidebarContent />
        </aside>

        {/* ── Contenido ── */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
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
