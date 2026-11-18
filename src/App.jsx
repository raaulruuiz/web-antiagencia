import DOMPurify from 'dompurify';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
const Newsletter = lazy(() => import('./pages/Newsletter'));
const UltimoPaso = lazy(() => import('./pages/UltimoPaso'));
const YaPorFin = lazy(() => import('./pages/YaPorFin'));
const Home = lazy(() => import('./pages/Home'));
const HomeV2 = lazy(() => import('./pages/HomeV2'));
const AudioSecreto = lazy(() => import('./pages/AudioSecreto'));
import CookieBanner from './components/CookieBanner';
const TrabajaConNosotrosOld = lazy(() => import('./pages/TrabajaConNosotrosOld'));
const TrabajaConNosotrosV3 = lazy(() => import('./pages/TrabajaConNosotrosV3'));
const TrabajaConNosotros2 = lazy(() => import('./pages/TrabajaConNosotros2'));
const AntiAuditoriaV2 = lazy(() => import('./pages/AntiAuditoriaV2'));
const PlanningQ3 = lazy(() => import('./pages/PlanningQ3'));
const PlanningQ3Venta = lazy(() => import('./pages/PlanningQ3Venta'));
const PlanningQ4 = lazy(() => import('./pages/PlanningQ4'));
const Reservar = lazy(() => import('./pages/Reservar'));
const GestionarReserva = lazy(() => import('./pages/GestionarReserva'));
const PoliticaPrivacidad = lazy(() => import('./pages/PoliticaPrivacidad'));
const PoliticaPrivacidadAntiStudio = lazy(() => import('./pages/PoliticaPrivacidadAntiStudio'));
const PoliticaPrivacidadAntiAgente = lazy(() => import('./pages/PoliticaPrivacidadAntiAgente'));
const CuentaAntiStudio = lazy(() => import('./pages/CuentaAntiStudio'));
const CuentaAntiAgente = lazy(() => import('./pages/CuentaAntiAgente'));
const PagoAntiAgente = lazy(() => import('./pages/PagoAntiAgente'));
const AntiStudio = lazy(() => import('./pages/AntiStudio'));
const AntiAgente = lazy(() => import('./pages/AntiAgente'));
const AntiAgenteGracias = lazy(() => import('./pages/AntiAgenteGracias'));
const AntiAgenteB = lazy(() => import('./pages/AntiAgenteB'));
const NovedadesAntiAgente = lazy(() => import('./pages/NovedadesAntiAgente'));
const NovedadesAntiStudio = lazy(() => import('./pages/NovedadesAntiStudio'));
const TikTokConnect = lazy(() => import('./pages/TikTokConnect'));
const JorgeCoronado = lazy(() => import('./pages/JorgeCoronado'));
const GraciasJorgeCoronado = lazy(() => import('./pages/GraciasJorgeCoronado'));
const CapsuleDigital = lazy(() => import('./pages/CapsuleDigital'));
const HablemosDeEmprender = lazy(() => import('./pages/HablemosDeEmprender'));
const BlogEmailMarketing = lazy(() => import('./pages/BlogEmailMarketing'));
const Podcasts = lazy(() => import('./pages/Podcasts'));
const AgenciaShopifyGranada = lazy(() => import('./pages/AgenciaShopifyGranada'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
function BlogPostPage() {
  const { slug } = useParams();
  return <BlogPost slug={slug} />;
}
const PodcastPost = lazy(() => import('./pages/PodcastPost'));
function PodcastPostPage() {
  const { slug } = useParams();
  return <PodcastPost slug={slug} />;
}
const ProhibidoEstacionarse = lazy(() => import('./pages/ProhibidoEstacionarse'));
import PixelLayout from './Layout';
const LoomLogin = lazy(() => import('./pages/LoomLogin'));
const Loom = lazy(() => import('./pages/Loom'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
// En un archivo aparte para que useAdmin no meta el admin en la carga inicial
const RequirePage = lazy(() => import('./pages/admin/RequirePage'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const Automatizaciones = lazy(() => import('./pages/admin/Automatizaciones'));
const Gym = lazy(() => import('./pages/admin/Gym'));
const Briefing = lazy(() => import('./pages/admin/Briefing'));
const Copywriting = lazy(() => import('./pages/admin/Copywriting'));
const CopywritingPopup = lazy(() => import('./pages/admin/CopywritingPopup'));
const AdminHome = lazy(() => import('./pages/admin/AdminHome'));
const EmailBuilder = lazy(() => import('./pages/admin/EmailBuilder'));
const Paginas = lazy(() => import('./pages/admin/Paginas'));
const Pomodoro = lazy(() => import('./pages/admin/Pomodoro'));
const Finanzas = lazy(() => import('./pages/admin/Finanzas'));
const Calendly = lazy(() => import('./pages/admin/Calendly'));
const Biblioteca = lazy(() => import('./pages/admin/Biblioteca'));
const BibliotecaItem = lazy(() => import('./pages/admin/BibliotecaItem'));
const BibliotecaPublica = lazy(() => import('./pages/BibliotecaPublica'));
const BibliotecaItemPublica = lazy(() => import('./pages/BibliotecaItemPublica'));
const CV = lazy(() => import('./pages/CV'));
const CVEn = lazy(() => import('./pages/CVEn'));
import { supabase } from '@/lib/supabaseClient';

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
  if (dbData?.contenido) return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dbData.contenido) }} />;
  return children;
}

// ── Páginas dinámicas (creadas desde el admin, no hardcodeadas) ──
function DynamicPage() {
  const location = useLocation();
  const [blogPost, setBlogPost] = useState(undefined); // undefined=loading, null=not found
  const [page, setPage] = useState(undefined);

  const slug = location.pathname.replace(/^\//, '');

  useEffect(() => {
    setBlogPost(undefined);
    setPage(undefined);

    // 1. Check blog_posts first
    supabase.from('blog_posts').select('slug').eq('slug', slug).eq('published', true).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setBlogPost(data);
        } else {
          setBlogPost(null);
          // 2. Fall through to paginas
          supabase.from('paginas').select('*')
            .eq('path', location.pathname).eq('publicada', true).maybeSingle()
            .then(({ data: pageData }) => setPage(pageData || null));
        }
      });
  }, [location.pathname]);

  useEffect(() => {
    if (!page) return;
    if (page.meta_titulo) document.title = page.meta_titulo;
  }, [page]);

  // Añadir noindex cuando la página no existe (evita indexar 404s en el SPA)
  useEffect(() => {
    if (page !== null) return;
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
    robots.content = 'noindex';
    return () => { robots.remove(); };
  }, [page]);

  // Still loading
  if (blogPost === undefined) return null;

  // It's a blog post
  if (blogPost !== null) return <BlogPost slug={slug} />;

  // Waiting for paginas check
  if (page === undefined) return null;
  if (!page) return <PageNotFound />;
  return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.contenido) }} />;
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
      <Route path="/" element={<SmartPage path="/"><PixelLayout><HomeV2 /></PixelLayout></SmartPage>} />
      <Route path="/homev2" element={<PixelLayout><HomeV2 /></PixelLayout>} />
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
      <Route path="/trabajaconnosotros" element={<AntiAuditoriaV2 />} />
      {/* Versión anterior de /trabajaconnosotros. La aún más antigua (TrabajaConNosotrosOld) queda archivada sin ruta. */}
      <Route path="/trabajaconnosotros-old" element={<TrabajaConNosotros2 />} />
      {/* <Route path="/planningq3" element={<PlanningQ3Venta />} /> */}
      <Route path="/politica-privacidad" element={<SmartPage path="/politica-privacidad"><PoliticaPrivacidad /></SmartPage>} />
      <Route path="/anti-studio/privacidad" element={<PoliticaPrivacidadAntiStudio />} />
      <Route path="/anti-studio/cuenta" element={<CuentaAntiStudio />} />
      <Route path="/anti-studio/novedades" element={<NovedadesAntiStudio />} />
      <Route path="/anti-studio" element={<AntiStudio />} />
      {/* Lista prioritaria de Anti-Agente: la versión B es la oficial (17-11-2026). */}
      <Route path="/anti-agente" element={<AntiAgenteB />} />
      <Route path="/anti-agente/gracias" element={<AntiAgenteGracias />} />
      <Route path="/anti-agente/novedades" element={<NovedadesAntiAgente />} />
      <Route path="/anti-agente/privacidad" element={<PoliticaPrivacidadAntiAgente />} />
      <Route path="/anti-agente/cuenta" element={<CuentaAntiAgente />} />
      <Route path="/anti-agente/pago" element={<PagoAntiAgente />} />
      {/* Versión A, solo como respaldo oculto (noindex, sin enlaces) */}
      <Route path="/anti-agente-a" element={<AntiAgente />} />
      {/* La dirección de comparación lleva a la oficial (también redirige vercel.json) */}
      <Route path="/anti-agente-b" element={<Navigate to="/anti-agente" replace />} />
      <Route path="/q3" element={<PlanningQ3 />} />
      <Route path="/q4" element={<PlanningQ4 />} />
      <Route path="/reservar/gestionar/:token" element={<GestionarReserva />} />
      <Route path="/reservar/:slug" element={<Reservar />} />
      <Route path="/tiktok-connect" element={<TikTokConnect />} />
      <Route path="/jorge-coronado" element={<PixelLayout><JorgeCoronado /></PixelLayout>} />
      <Route path="/capsula-digital" element={<PixelLayout><CapsuleDigital /></PixelLayout>} />
      <Route path="/hablemos-de-emprender" element={<PixelLayout><HablemosDeEmprender /></PixelLayout>} />
      <Route path="/prohibido-estacionarse" element={<PixelLayout><ProhibidoEstacionarse /></PixelLayout>} />
      <Route path="/gracias-podcast" element={<PixelLayout><GraciasJorgeCoronado /></PixelLayout>} />
      <Route path="/agencia-shopify-granada" element={<AgenciaShopifyGranada />} />
      <Route path="/blog-email-marketing" element={<BlogEmailMarketing />} />
      <Route path="/blog-email-marketing/page/:page" element={<BlogEmailMarketing />} />
      <Route path="/blog-email-marketing/:slug" element={<BlogPostPage />} />
      <Route path="/blog" element={<Navigate to="/blog-email-marketing" replace />} />
      <Route path="/blog/*" element={<Navigate to="/blog-email-marketing" replace />} />
      <Route path="/cv" element={<CV />} />
      <Route path="/cv-en" element={<CVEn />} />
      <Route path="/podcasts" element={<Podcasts />} />
      <Route path="/podcasts/page/:page" element={<Podcasts />} />
      <Route path="/podcasts/:slug" element={<PodcastPostPage />} />
      <Route path="/podcast" element={<Navigate to="/podcasts" replace />} />
      <Route path="*" element={<DynamicPage />} />
    </Routes>
    <CookieBanner />
    </>
  );
};


function App() {

  return (
    <ThemeProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <PageViewTracker />
          {/* Cada página se descarga al visitarla (React.lazy); mientras, pantalla vacía como antes */}
          <Suspense fallback={null}>
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
              <Route path="biblioteca"       element={<RequirePage page="biblioteca"><Biblioteca /></RequirePage>} />
              <Route path="biblioteca/:id"  element={<RequirePage page="biblioteca"><BibliotecaItem /></RequirePage>} />
              <Route path="pomodoro"        element={<RequirePage page="pomodoro"><Pomodoro /></RequirePage>} />
              <Route path="finanzas"        element={<RequirePage page="finanzas"><Finanzas /></RequirePage>} />
              <Route path="calendly"        element={<RequirePage page="calendly"><Calendly /></RequirePage>} />
            </Route>
            <Route path="/anti-biblioteca" element={<BibliotecaPublica />} />
            <Route path="/anti-biblioteca/:id" element={<BibliotecaItemPublica />} />
            <Route path="/admin/copywriting-popup" element={<CopywritingPopup />} />
            <Route path="/loom" element={<Loom />} />
            <Route path="*" element={<AuthenticatedApp />} />
          </Routes>
          </Suspense>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
    </ThemeProvider>
  )
}

export default App
