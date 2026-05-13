import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Newsletter from './pages/Newsletter';
import UltimoPaso from './pages/UltimoPaso';
import YaPorFin from './pages/YaPorFin';
import Home from './pages/Home';
import AudioSecreto from './pages/AudioSecreto';
import CookieBanner from './components/CookieBanner';
import TrabajaConNosotros from './pages/TrabajaConNosotros'
import TrabajaConNosotrosOld from './pages/TrabajaConNosotrosOld'
import TrabajaConNosotrosV3 from './pages/TrabajaConNosotrosV3'
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import TikTokConnect from './pages/TikTokConnect';
import PixelLayout from './Layout';
import LoomLogin from './pages/LoomLogin';
import Loom from './pages/Loom';
import AdminLayout, { useAdmin } from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/AdminUsers';
import Automatizaciones from './pages/admin/Automatizaciones';
import Gym from './pages/admin/Gym';
import Briefing from './pages/admin/Briefing';
import Copywriting from './pages/admin/Copywriting';
import CopywritingPopup from './pages/admin/CopywritingPopup';
import AdminHome from './pages/admin/AdminHome';
import EmailBuilder from './pages/admin/EmailBuilder';
import Paginas from './pages/admin/Paginas';
import { supabase } from '@/lib/supabaseClient';

// Guard para rutas de lector: redirige a /admin/users si no tiene permiso
function RequirePage({ page, children }) {
  const { role, pages } = useAdmin();
  if (role === 'admin' || pages.includes(page)) return children;
  return <Navigate to="/admin/users" replace />;
}
import { trackPageView } from './lib/pageTracker';

function PageViewTracker() {
  const location = useLocation();
  useEffect(() => { trackPageView(location.pathname); }, [location.pathname]);
  return null;
}

// ── SmartPage: sirve contenido de Supabase si existe, si no el componente React ──
function SmartPage({ path, children }) {
  const [dbData, setDbData] = useState(undefined); // undefined = loading
  useEffect(() => {
    supabase.from('paginas').select('contenido,meta_titulo,meta_descripcion,indexada')
      .eq('path', path).maybeSingle()
      .then(({ data }) => setDbData(data || null));
  }, [path]);

  useEffect(() => {
    if (!dbData) return;
    if (dbData.meta_titulo) document.title = dbData.meta_titulo;
    let desc = document.querySelector('meta[name="description"]');
    if (dbData.meta_descripcion) {
      if (!desc) { desc = document.createElement('meta'); desc.name = 'description'; document.head.appendChild(desc); }
      desc.content = dbData.meta_descripcion;
    }
    let robots = document.querySelector('meta[name="robots"]');
    if (dbData.indexada === false) {
      if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
      robots.content = 'noindex';
    } else if (robots) {
      robots.remove();
    }
  }, [dbData]);

  if (dbData === undefined) return null; // loading
  if (dbData?.contenido) return <div dangerouslySetInnerHTML={{ __html: dbData.contenido }} />;
  return children;
}

// ── Páginas dinámicas (creadas desde el admin, no hardcodeadas) ──
function DynamicPage() {
  const location = useLocation();
  const [page, setPage] = useState(undefined);

  useEffect(() => {
    supabase.from('paginas').select('*')
      .eq('path', location.pathname).eq('publicada', true).maybeSingle()
      .then(({ data }) => setPage(data || null));
  }, [location.pathname]);

  useEffect(() => {
    if (!page) return;
    if (page.meta_titulo) document.title = page.meta_titulo;
  }, [page]);

  if (page === undefined) return null;
  if (!page) return <PageNotFound />;
  return <div dangerouslySetInnerHTML={{ __html: page.contenido }} />;
}

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <>
    <Routes>
      <Route path="/" element={<SmartPage path="/"><PixelLayout><Home /></PixelLayout></SmartPage>} />
      <Route path="/webtipica" element={<LayoutWrapper currentPageName="Home"><Home /></LayoutWrapper>} />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route key={path} path={`/${path}`}
          element={
            <SmartPage path={`/${path}`}>
              <LayoutWrapper currentPageName={path}><Page /></LayoutWrapper>
            </SmartPage>
          }
        />
      ))}
      <Route path="/newsletter-vieja" element={<SmartPage path="/newsletter-vieja"><LayoutWrapper currentPageName="Newsletter"><Newsletter /></LayoutWrapper></SmartPage>} />
      <Route path="/audiosecreto" element={<AudioSecreto />} />
      <Route path="/UltimoPaso" element={<SmartPage path="/UltimoPaso"><LayoutWrapper currentPageName="UltimoPaso"><UltimoPaso /></LayoutWrapper></SmartPage>} />
      <Route path="/YaPorFin" element={<SmartPage path="/YaPorFin"><LayoutWrapper currentPageName="YaPorFin"><YaPorFin /></LayoutWrapper></SmartPage>} />
      <Route path="/trabajaconnosotros" element={<TrabajaConNosotrosV3 />} />
      <Route path="/trabajaconnosotros-old" element={<LayoutWrapper currentPageName="TrabajaConNosotrosOld"><TrabajaConNosotrosOld /></LayoutWrapper>} />
      <Route path="/politica-privacidad" element={<SmartPage path="/politica-privacidad"><PoliticaPrivacidad /></SmartPage>} />
      <Route path="/tiktok-connect" element={<TikTokConnect />} />
      <Route path="*" element={<DynamicPage />} />
    </Routes>
    <CookieBanner />
    </>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <PageViewTracker />
          <Routes>
            <Route path="/admin/login" element={<LoomLogin redirectTo="/admin/dashboard" />} />
            <Route path="/loom-login"  element={<LoomLogin redirectTo="/admin/dashboard" />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminHome />} />
              <Route path="dashboard"        element={<RequirePage page="dashboard"><Dashboard /></RequirePage>} />
              <Route path="loom"             element={<RequirePage page="loom"><Loom /></RequirePage>} />
              <Route path="users"            element={<AdminUsers />} />
              <Route path="automatizaciones" element={<RequirePage page="automatizaciones"><Automatizaciones /></RequirePage>} />
              <Route path="gym"              element={<RequirePage page="gym"><Gym /></RequirePage>} />
              <Route path="briefing"         element={<RequirePage page="briefing"><Briefing /></RequirePage>} />
              <Route path="copywriting"      element={<RequirePage page="copywriting"><Copywriting /></RequirePage>} />
              <Route path="email-builder"    element={<RequirePage page="email-builder"><EmailBuilder /></RequirePage>} />
              <Route path="paginas"          element={<RequirePage page="paginas"><Paginas /></RequirePage>} />
            </Route>
            <Route path="/admin/copywriting-popup" element={<CopywritingPopup />} />
            <Route path="/loom" element={<Loom />} />
            <Route path="*" element={<AuthenticatedApp />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
