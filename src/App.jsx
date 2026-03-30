import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
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

// ── Placeholder para vistas aún no construidas ───────────────
function PlaceholderView({ title, onNavigate }) {
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
      <button className="calc-back" style={{ marginTop: 16 }} onClick={() => onNavigate('dashboard')}>
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

// ── Wrapper para CalcPage desde URL directa ──────────────────
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
    navigate('/dashboard', { replace: true });
    return null;
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

function BudgetPage() {
  const navigate = useNavigate();
  return <BudgetView onBack={() => navigate('/dashboard')} />;
}

// ── AppShell — núcleo de la app con estado de navegación ─────
function AppShell({ user, onLogout, onUpdateUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Estado de vista interna (reemplaza routing complejo para vistas del dashboard)
  const [view, setView] = useState({ id: 'dashboard', project: null });

  // Role state — por defecto usa el rol del onboarding
  const [role, setRole] = useState(user?.role || 'profesional');
  const toggleRole = () => {
    setRole(r => r === 'profesional' ? 'instalador' : 'profesional');
    setView({ id: 'dashboard', project: null });
  };

  // ── Plan upgrade modal state ──
  const [upgradeModal, setUpgradeModal] = useState({ open: false, reason: null, moduleName: null });

  const showUpgrade = (reason, moduleName = null) => {
    setUpgradeModal({ open: true, reason, moduleName });
  };

  const handleSelectPlan = async (planId) => {
    // Actualizar plan en Supabase
    if (user?.id) {
      await updateProfile(user.id, { plan: planId }).catch(() => {});
    }
    // También actualizar en localStorage legacy
    const saved = JSON.parse(localStorage.getItem('metriq_user') || '{}');
    saved.plan = planId;
    localStorage.setItem('metriq_user', JSON.stringify(saved));
    const leads = JSON.parse(localStorage.getItem('metriq_leads') || '[]');
    const idx = leads.findIndex(l => l.email === saved.email);
    if (idx !== -1) { leads[idx].plan = planId; localStorage.setItem('metriq_leads', JSON.stringify(leads)); }
    setUpgradeModal({ open: false, reason: null, moduleName: null });
    window.location.reload();
  };

  // Navegación interna
  const go = (id, extra = {}) => {
    setView({ id, project: null, ...extra });
  };

  // Abre un módulo de cálculo — con enforcement de plan
  const openModule = (mod, project = null) => {
    if (!canAccessModule(user, mod.id)) {
      showUpgrade('module', mod.name);
      return;
    }
    if (mod.id === 'agua') {
      setView({ id: 'modulo-agua', project });
    } else if (mod.id === 'gantt') {
      setView({ id: 'modulo-gantt', project });
    } else if (mod.id === 'presup') {
      navigate('/dashboard/presupuesto');
    } else {
      navigate(`/dashboard/calc/${mod.id}`);
    }
  };

  // Determina qué item del sidebar está activo
  const sidebarActiveId = (() => {
    const path = location.pathname;
    if (path.includes('/calc/') || path.includes('/presupuesto')) return null;
    if (view.id === 'modulo-agua' || view.id === 'modulo-gantt') return null;
    return view.id;
  })();

  // Renderiza la vista central según el estado
  const renderMain = () => {
    const path = location.pathname;
    if (path.includes('/calc/') || path.includes('/presupuesto')) return null;

    switch (view.id) {
      case 'dashboard':
        return (
          <Dashboard
            onOpen={openModule}
            onNavigate={go}
            user={user}
            role={role}
            onUpgrade={showUpgrade}
          />
        );
      case 'proyectos':
        return <MisProyectosView onNavigate={go} user={user} onUpgrade={showUpgrade} />;
      case 'proyecto-detalle':
        return (
          <DetalleProyectoView
            project={view.project}
            onNavigate={go}
            onModuleOpen={openModule}
            user={user}
          />
        );
      case 'modulo-agua':
        return (
          <ModuloAgua
            project={view.project}
            onBack={() => view.project ? go('proyecto-detalle', { project: view.project }) : go('dashboard')}
          />
        );
      case 'modulo-gantt':
        return (
          <GanttChart
            obraName={view.project?.name || 'Cronograma de Obra'}
            onBack={() => view.project ? go('proyecto-detalle', { project: view.project }) : go('dashboard')}
          />
        );
      case 'presupuestos':
        return <PlaceholderView title="Historial de Presupuestos" onNavigate={go} />;
      case 'precios':
        return <PlaceholderView title="Base de Precios" onNavigate={go} />;
      case 'config':
        return <PlaceholderView title="Configuración" onNavigate={go} />;
      case 'cotizaciones':
        return <PlaceholderView title="Mis Cotizaciones" onNavigate={go} />;
      case 'herramientas':
        return <PlaceholderView title="Herramientas" onNavigate={go} />;
      default:
        return <Dashboard onOpen={openModule} onNavigate={go} user={user} role={role} onUpgrade={showUpgrade} />;
    }
  };

  return (
    <div className="app">
      <Header
        onLogoClick={() => go('dashboard')}
        user={user}
        onLogout={onLogout}
        onUpdateUser={onUpdateUser}
        role={role}
        onToggleRole={toggleRole}
      />
      <div className="layout">
        <Sidebar activeId={sidebarActiveId} role={role} user={user} onNavigate={go} />
        <main className="main">
          <AnimatePresence mode="wait">
            <Routes location={location}>
              <Route
                path="/"
                element={
                  <motion.div
                    key={view.id + (view.project?.id || '')}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    style={{ height: '100%' }}
                  >
                    {renderMain()}
                  </motion.div>
                }
              />
              <Route
                path="/calc/:moduleId"
                element={
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    style={{ height: '100%' }}
                  >
                    <CalcPageWrapper />
                  </motion.div>
                }
              />
              <Route
                path="/presupuesto"
                element={
                  <motion.div
                    key="presupuesto"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    style={{ height: '100%' }}
                  >
                    <BudgetPage />
                  </motion.div>
                }
              />
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

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // ── Sesión Supabase ────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // 1. Verificar sesión existente al montar
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user);
        setUser(profile);
        // Sincronizar obras de Supabase → localStorage
        syncObrasDown().catch(() => {});
        // También guardar en localStorage legacy para componentes que lo lean
        localStorage.setItem('metriq_user', JSON.stringify(profile));
      }
      setAuthLoading(false);
    });

    // 2. Escuchar cambios de auth (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user);
          setUser(profile);
          localStorage.setItem('metriq_user', JSON.stringify(profile));
          syncObrasDown().catch(() => {});
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('metriq_user');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Redirect: usuario logueado en "/" → dashboard
  useEffect(() => {
    if (location.pathname === '/' && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user]);

  // Modo de login
  const [loginMode, setLoginMode] = useState('onboarding');

  const handleStartOnboarding = () => { setLoginMode('onboarding'); navigate('/login'); };
  const handleStartLogin = () => { setLoginMode('login'); navigate('/login'); };

  const handleLoginComplete = async () => {
    // Al llegar acá, Supabase auth ya completó. Fetchar perfil fresco.
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const profile = await fetchProfile(authUser);
      setUser(profile);
      localStorage.setItem('metriq_user', JSON.stringify(profile));
      // Descargar obras del usuario
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
    // Sync profile update to Supabase
    if (user?.id) {
      updateProfile(user.id, updates).catch(() => {});
    }
  };

  // ── Loading mientras se verifica sesión ─────────────────────
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
            <Route path="/dashboard/*" element={<AppShell user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />} />
          </Routes>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
