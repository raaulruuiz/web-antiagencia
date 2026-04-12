import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Newsletter from './pages/Newsletter';
import UltimoPaso from './pages/UltimoPaso';
import YaPorFin from './pages/YaPorFin';
import Home from './pages/Home';
import HomeABTest from './pages/HomeABTest';
import AudioSecreto from './pages/AudioSecreto';
import CookieBanner from './components/CookieBanner';
import TrabajaConNosotros from './pages/TrabajaConNosotros'
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import PixelLayout from './Layout';
import LoomLogin from './pages/LoomLogin';
import Loom from './pages/Loom';
import AdminLayout, { useAdmin } from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/AdminUsers';
import Automatizaciones from './pages/admin/Automatizaciones';
import Gym from './pages/admin/Gym';

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

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <>
    <Routes>
      <Route path="/" element={<PixelLayout><HomeABTest /></PixelLayout>} />
      <Route path="/webtipica" element={<LayoutWrapper currentPageName="Home"><Home /></LayoutWrapper>} />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/newsletter-vieja" element={<LayoutWrapper currentPageName="Newsletter"><Newsletter /></LayoutWrapper>} />
      <Route path="/audiosecreto" element={<AudioSecreto />} />
      <Route path="/UltimoPaso" element={<LayoutWrapper currentPageName="UltimoPaso"><UltimoPaso /></LayoutWrapper>} />
      <Route path="/YaPorFin" element={<LayoutWrapper currentPageName="YaPorFin"><YaPorFin /></LayoutWrapper>} />
      <Route path="/TrabajaConNosotros" element={<LayoutWrapper currentPageName="TrabajaConNosotros"><TrabajaConNosotros /></LayoutWrapper>} />
      <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
      <Route path="*" element={<PageNotFound />} />
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
              <Route path="dashboard"        element={<RequirePage page="dashboard"><Dashboard /></RequirePage>} />
              <Route path="loom"             element={<RequirePage page="loom"><Loom /></RequirePage>} />
              <Route path="users"            element={<AdminUsers />} />
              <Route path="automatizaciones" element={<RequirePage page="automatizaciones"><Automatizaciones /></RequirePage>} />
              <Route path="gym"             element={<RequirePage page="gym"><Gym /></RequirePage>} />
            </Route>
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
