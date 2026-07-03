import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { CopywritingProvider } from './CopywritingContext';
import { useTheme } from '@/lib/ThemeContext';

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
  { to: '/admin/loom',             label: 'Loom',             icon: '🎥', page: 'loom' },
  { to: '/admin/paginas',          label: 'Páginas',          icon: '🌐', page: 'paginas' },
  { to: '/admin/pomodoro',         label: 'Pomodoro',         icon: '🍅', page: 'pomodoro' },
  { to: '/admin/users',            label: 'Usuarios',         icon: '👥', page: 'users' },
];

function navForRole(role, pages) {
  if (role === 'admin') return ALL_NAV;
  return ALL_NAV.filter(n => n.page === 'users' || pages.includes(n.page));
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggle}
      title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        borderRadius: 8,
        border: 'none',
        background: 'transparent',
        color: 'var(--t-text-muted)',
        fontSize: 13,
        cursor: 'pointer',
        transition: 'color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--t-text)'; e.currentTarget.style.background = 'var(--t-surface2)'; }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--t-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ fontSize: 16 }}>{isDark ? '☀️' : '🌙'}</span>
      <span>{isDark ? 'Tema claro' : 'Tema oscuro'}</span>
    </button>
  );
}

function AdminLayoutInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [role, setRole]   = useState('lector');
  const [pages, setPages] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--t-bg)' }}>
        <div className="w-8 h-8 border-4 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const visibleNav = navForRole(role, pages);

  const linkStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '7px 12px',
    borderRadius: 8,
    fontSize: 13,
    textDecoration: 'none',
    color: active ? 'var(--t-text)' : 'var(--t-text-muted)',
    background: active ? 'var(--t-surface2)' : 'transparent',
    transition: 'color 0.15s, background 0.15s',
  });

  const NavLinks = () => visibleNav.map(({ to, label, icon }) => {
    const active = location.pathname === to || location.pathname.startsWith(to + '/');
    return (
      <Link
        key={to}
        to={to}
        style={linkStyle(active)}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--t-text)'; e.currentTarget.style.background = 'var(--t-surface2)'; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--t-text-muted)'; e.currentTarget.style.background = 'transparent'; } }}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </Link>
    );
  });

  const sidebarStyle = {
    background: 'var(--t-bg)',
    borderRight: '1px solid var(--t-border)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    height: '100%',
    width: 224,
  };

  const headerStyle = {
    padding: '20px 24px',
    borderBottom: '1px solid var(--t-border)',
  };

  return (
    <AdminCtx.Provider value={{ role, pages }}>
      <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', background: 'var(--t-bg)', color: 'var(--t-text)', fontFamily: 'system-ui, sans-serif' }}>

        {/* Sidebar — solo desktop */}
        <aside className="hidden md:flex md:flex-col" style={{ ...sidebarStyle, display: undefined }}>
          <div style={headerStyle}>
            <img src="/images/9563e10d2_AALogo.png" alt="Logo" style={{ height: 28, width: 'auto', filter: isDark ? 'none' : 'invert(1)' }} />
          </div>
          <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
            <NavLinks />
          </nav>
          <div style={{ padding: '12px', borderTop: '1px solid var(--t-border)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              style={{ ...linkStyle(false), width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--t-text)'; e.currentTarget.style.background = 'var(--t-surface2)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--t-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <span>🚪</span>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>

        {/* Contenido */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Top bar — solo mobile */}
          <header className="md:hidden" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--t-border)', flexShrink: 0 }}>
            <img src="/images/9563e10d2_AALogo.png" alt="Logo" style={{ height: 24, width: 'auto', filter: isDark ? 'none' : 'invert(1)' }} />
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{ color: 'var(--t-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
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
            <div className="md:hidden" style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', top: 49 }}>
              <div style={{ width: 256, height: '100%', borderRight: '1px solid var(--t-border)', display: 'flex', flexDirection: 'column', background: 'var(--t-bg)' }}>
                <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
                  <NavLinks />
                </nav>
                <div style={{ padding: '12px', borderTop: '1px solid var(--t-border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <ThemeToggle />
                  <button
                    onClick={handleSignOut}
                    style={{ ...linkStyle(false), width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span>🚪</span>
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={() => setMenuOpen(false)} />
            </div>
          )}

          <main style={{ flex: 1, overflowY: 'auto', background: 'var(--t-bg)' }}>
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
