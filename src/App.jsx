import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CalcView from './components/CalcView';
import BudgetView from './components/BudgetView';
import LandingPage from './components/LandingPage';
import OnboardingLogin from './components/OnboardingLogin';
import AdminPanel from './components/AdminPanel';
import MisProyectosView from './components/views/MisProyectosView';
import DetalleProyectoView from './components/views/DetalleProyectoView';
import BaseDePreciosView from './components/views/BaseDePreciosView';
import ConfiguracionView from './components/views/ConfiguracionView';
import PresupuestosView from './components/views/PresupuestosView';
import ModuloAgua from './components/ModuloAgua';
import UpgradeModal from './components/UpgradeModal';
import { GanttChart } from './react-gantt/components/GanttChart';
import { CALC_MODULES } from './modules/calculators';
import { canAccessModule } from './modules/plans';
import { supabase } from './lib/supabase.js';
import { fetchProfile, updateProfile, syncObrasDown } from './services/db.js';
import './styles/landing.css';

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: 'easeOut' },
};

// ── Wrapper de animación reutilizable para cada ruta ─────────
function PageWrapper({ children, motionKey }) {
  return (
    <motion.div
      key={motionKey}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{ height: '100%' }}
    >
      {children}
    </motion.div>
  );
}

// ── Placeholder para vistas aún no construidas ───────────────
function PlaceholderView({ title }) {
  const navigate = useNavigate();
  return (
    <motion.div
      className="placeholder-view"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="placeholder-icon">🚧</div>
      <div className="placeholder-title">{title}</div>
      <div className="placeholder-sub">Esta sección está en construcción.</div>
      <button className="calc-back" style={{ marginTop: 16 }} onClick={() => navigate('/dashboard')}>
        ← Volver al dashboard
      </button>
    </motion.div>
  );
}

// ── Loading screen mientras se verifica la sesión ────────────
function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#FAFAF9' }}>
      <div style={{ textAlign: 'center' }}>
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(63,63,63,0.12)" strokeWidth="3" />
          <circle cx="24" cy="24" r="20" fill="none" stroke="#3F3F3F" strokeWidth="3"
            strokeDasharray="80 126" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate"
              values="0 24 24;360 24 24" dur="1s" repeatCount="indefinite" />
          </circle>
        </svg>
        <p style={{ marginTop: 16, color: '#74777F', fontSize: 14 }}>Cargando Metriq...</p>
      </div>
    </div>
  );
}

// ── CalcPage — ruta /dashboard/calc/:moduleId ────────────────
function CalcPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const mod = CALC_MODULES.find((m) => m.id === moduleId);

  const [vals, setVals] = useState(() => {
    if (!mod) return {};
    const d = {};
    mod.fields.forEach((f) => (d[f.k] = f.d));
    return d;
  });

  const [res, setRes] = useState(() => {
    if (!mod) return null;
    const d = {};
    mod.fields.forEach((f) => (d[f.k] = f.d));
    return mod.calc(d);
  });

  if (!mod) {
    return <Navigate to="/dashboard" replace />;
  }

  const updVal = (k, val) => {
    const f = mod.fields.find((x) => x.k === k);
    let p = val;
    if (f.t === "n") p = parseFloat(val) || 0;
    else if (f.t === "s") {
      const o = f.o.find((x) => String(x.v) === String(val));
      p = o ? o.v : val;
    }
    const n = { ...vals, [k]: p };
    setVals(n);
    setRes(mod.calc(n));
  };

  return <CalcView mod={mod} vals={vals} res={res} onUpdate={updVal} onBack={() => navigate('/dashboard')} />;
}

function CalcPageWrapper() {
  const { moduleId } = useParams();
  return <CalcPage key={moduleId} />;
}

// ── BudgetPage — ruta /dashboard/presupuesto ─────────────────
function BudgetPage() {
  const navigate = useNavigate();
  return <BudgetView onBack={() => navigate('/dashboard')} />;
}

// ── ModuloAguaPage — ruta /dashboard/modulo/agua ─────────────
function ModuloAguaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const project = location.state?.project || null;
  const backPath = project ? `/dashboard/proyectos/${project.id}` : '/dashboard';
  return <ModuloAgua project={project} onBack={() => navigate(backPath)} />;
}

// ── GanttPage — ruta /dashboard/modulo/gantt ─────────────────
function GanttPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const project = location.state?.project || null;
  const backPath = project ? `/dashboard/proyectos/${project.id}` : '/dashboard';
  return (
    <GanttChart
      obraName={project?.nombre || project?.name || 'Cronograma de Obra'}
      onBack={() => navigate(backPath)}
    />
  );
}

// ── AppShell — layout persistente con sidebar + contenido ────
function AppShell({ user, onLogout, onUpdateUser }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Role state — por defecto usa el rol del onboarding
  const [role, setRole] = useState(user?.role || 'profesional');
  const toggleRole = () => {
    setRole(r => r === 'profesional' ? 'instalador' : 'profesional');
    navigate('/dashboard');
  };

  // ── Plan upgrade modal ──
  const [upgradeModal, setUpgradeModal] = useState({ open: false, reason: null, moduleName: null });

  const showUpgrade = (reason, moduleName = null) => {
    setUpgradeModal({ open: true, reason, moduleName });
  };

  const handleSelectPlan = async (planId) => {
    if (user?.id) {
      await updateProfile(user.id, { plan: planId }).catch(() => {});
    }
    const saved = JSON.parse(localStorage.getItem('metriq_user') || '{}');
    saved.plan = planId;
    localStorage.setItem('metriq_user', JSON.stringify(saved));
    const leads = JSON.parse(localStorage.getItem('metriq_leads') || '[]');
    const idx = leads.findIndex(l => l.email === saved.email);
    if (idx !== -1) { leads[idx].plan = planId; localStorage.setItem('metriq_leads', JSON.stringify(leads)); }
    setUpgradeModal({ open: false, reason: null, moduleName: null });
    window.location.reload();
  };

  // ── Abre un módulo de cálculo con enforcement de plan ───────
  const openModule = (mod, project = null) => {
    if (!canAccessModule(user, mod.id)) {
      showUpgrade('module', mod.name);
      return;
    }
    if (mod.id === 'agua') {
      navigate('/dashboard/modulo/agua', { state: { project } });
    } else if (mod.id === 'gantt') {
      navigate('/dashboard/modulo/gantt', { state: { project } });
    } else if (mod.id === 'presup') {
      navigate('/dashboard/presupuesto');
    } else {
      navigate(`/dashboard/calc/${mod.id}`);
    }
  };

  return (
    <div className="app">
      <Header
        onLogoClick={() => navigate('/dashboard')}
        user={user}
        onLogout={onLogout}
        onUpdateUser={onUpdateUser}
        role={role}
        onToggleRole={toggleRole}
      />

      <div className="layout">
        {/* Sidebar persistente — nunca se recarga al navegar */}
        <Sidebar role={role} user={user} />

        {/* Área de contenido dinámica — AnimatePresence da transición suave */}
        <main className="main">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>

              {/* ── Dashboard (index) ──────────────────────────── */}
              <Route
                index
                element={
                  <PageWrapper motionKey="dashboard">
                    <Dashboard
                      onOpen={openModule}
                      onNavigate={(id) => navigate(`/dashboard/${id === 'dashboard' ? '' : id}`)}
                      user={user}
                      role={role}
                      onUpgrade={showUpgrade}
                    />
                  </PageWrapper>
                }
              />

              {/* ── Mis Proyectos ─────────────────────────────── */}
              <Route
                path="/proyectos"
                element={
                  <PageWrapper motionKey="proyectos">
                    <MisProyectosView user={user} onUpgrade={showUpgrade} />
                  </PageWrapper>
                }
              />

              {/* ── Detalle de Proyecto ───────────────────────── */}
              <Route
                path="/proyectos/:id"
                element={
                  <PageWrapper motionKey={location.pathname}>
                    <DetalleProyectoView onModuleOpen={openModule} user={user} />
                  </PageWrapper>
                }
              />

              {/* ── Presupuestos ──────────────────────────────── */}
              <Route
                path="/presupuestos"
                element={
                  <PageWrapper motionKey="presupuestos">
                    <PresupuestosView />
                  </PageWrapper>
                }
              />

              {/* ── Base de Precios ───────────────────────────── */}
              <Route
                path="/precios"
                element={
                  <PageWrapper motionKey="precios">
                    <BaseDePreciosView />
                  </PageWrapper>
                }
              />

              {/* ── Configuración ─────────────────────────────── */}
              <Route
                path="/configuracion"
                element={
                  <PageWrapper motionKey="configuracion">
                    <ConfiguracionView />
                  </PageWrapper>
                }
              />

              {/* ── Cotizaciones (instalador) ─────────────────── */}
              <Route
                path="/cotizaciones"
                element={
                  <PageWrapper motionKey="cotizaciones">
                    <PlaceholderView title="Mis Cotizaciones" />
                  </PageWrapper>
                }
              />

              {/* ── Herramientas (instalador) ─────────────────── */}
              <Route
                path="/herramientas"
                element={
                  <PageWrapper motionKey="herramientas">
                    <PlaceholderView title="Herramientas" />
                  </PageWrapper>
                }
              />

              {/* ── Calculadoras ──────────────────────────────── */}
              <Route
                path="/calc/:moduleId"
                element={
                  <PageWrapper motionKey={location.pathname}>
                    <CalcPageWrapper />
                  </PageWrapper>
                }
              />

              {/* ── Presupuesto (BudgetView) ──────────────────── */}
              <Route
                path="/presupuesto"
                element={
                  <PageWrapper motionKey="presupuesto">
                    <BudgetPage />
                  </PageWrapper>
                }
              />

              {/* ── Módulo Agua ───────────────────────────────── */}
              <Route
                path="/modulo/agua"
                element={
                  <PageWrapper motionKey="modulo-agua">
                    <ModuloAguaPage />
                  </PageWrapper>
                }
              />

              {/* ── Módulo Gantt ──────────────────────────────── */}
              <Route
                path="/modulo/gantt"
                element={
                  <PageWrapper motionKey="modulo-gantt">
                    <GanttPage />
                  </PageWrapper>
                }
              />

              {/* ── Fallback ──────────────────────────────────── */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />

            </Routes>
          </AnimatePresence>
        </main>
      </div>

      <UpgradeModal
        open={upgradeModal.open}
        reason={upgradeModal.reason}
        moduleName={upgradeModal.moduleName}
        onClose={() => setUpgradeModal({ open: false, reason: null, moduleName: null })}
        onSelectPlan={handleSelectPlan}
      />
    </div>
  );
}

// ── App root — autenticación y routing de alto nivel ─────────
export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user);
        setUser(profile);
        syncObrasDown().catch(() => {});
        localStorage.setItem('metriq_user', JSON.stringify(profile));
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user);
          setUser(profile);
          localStorage.setItem('metriq_user', JSON.stringify(profile));
          syncObrasDown().catch(() => {});
          if (window.location.hash.includes('access_token')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('metriq_user');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Redirect: usuario logueado en "/" → /dashboard
  useEffect(() => {
    if (location.pathname === '/' && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user]);

  const [loginMode, setLoginMode] = useState('onboarding');

  const handleStartOnboarding = () => { setLoginMode('onboarding'); navigate('/login'); };
  const handleStartLogin       = () => { setLoginMode('login');      navigate('/login'); };

  const handleLoginComplete = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const profile = await fetchProfile(authUser);
      setUser(profile);
      localStorage.setItem('metriq_user', JSON.stringify(profile));
      syncObrasDown().catch(() => {});
    }
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('metriq_user');
    localStorage.removeItem('metriq_obras');
    localStorage.removeItem('metriq_obra_activa');
    setUser(null);
    navigate('/');
  };

  const handleUpdateUser = async (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('metriq_user', JSON.stringify(updated));
    if (user?.id) {
      updateProfile(user.id, updates).catch(() => {});
    }
  };

  if (authLoading) return <LoadingScreen />;

  const isLanding = location.pathname === '/';
  const isLogin   = location.pathname === '/login';
  const isAdmin   = location.pathname === '/admin';

  return (
    <AnimatePresence mode="wait">
      {isAdmin ? (
        <motion.div key="admin" {...pageTransition}>
          <AdminPanel onBack={() => navigate('/dashboard')} />
        </motion.div>
      ) : isLanding ? (
        <motion.div key="landing" {...pageTransition}>
          <LandingPage onStart={handleStartOnboarding} onLogin={handleStartLogin} />
        </motion.div>
      ) : isLogin ? (
        <motion.div key="login" {...pageTransition}>
          <OnboardingLogin onComplete={handleLoginComplete} initialMode={loginMode} />
        </motion.div>
      ) : (
        <motion.div key="dashboard" {...pageTransition}>
          <Routes location={location}>
            <Route
              path="/dashboard/*"
              element={
                <AppShell
                  user={user}
                  onLogout={handleLogout}
                  onUpdateUser={handleUpdateUser}
                />
              }
            />
          </Routes>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
