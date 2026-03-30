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
import LeadsPanel from './components/LeadsPanel';
import MisProyectosView from './components/views/MisProyectosView';
import DetalleProyectoView from './components/views/DetalleProyectoView';
import ProyectoLayout from './components/views/ProyectoLayout';
import ModuloAgua from './components/ModuloAgua';
import { GanttChart } from './react-gantt/components/GanttChart';
import { CALC_MODULES } from './modules/calculators';
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
function AppShell({ user, onLogout }) {
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

  // Navegación interna: go('proyectos') / go('proyecto-detalle', { project })
  const go = (id, extra = {}) => {
    setView({ id, project: null, ...extra });
  };

  // Abre un módulo de cálculo (con soporte especial para agua, gantt y presupuesto)
  const openModule = (mod, project = null) => {
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
    // Vistas de módulo no mapean a ningún ítem del sidebar
    if (view.id === 'modulo-agua' || view.id === 'modulo-gantt') return null;
    return view.id;
  })();

  // Renderiza la vista central según el estado
  const renderMain = () => {
    // Si estamos en una ruta de URL (calc/presup), el router la maneja
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
          />
        );
      case 'proyectos':
        return <MisProyectosView onNavigate={go} />;
      case 'proyecto-detalle':
        return (
          <ProyectoLayout
            project={view.project}
            onNavigate={go}
            onModuleOpen={openModule}
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
        return <Dashboard onOpen={openModule} onNavigate={go} user={user} role={role} />;
    }
  };

  return (
    <div className="app">
      <Header
        onLogoClick={() => go('dashboard')}
        user={user}
        onLogout={onLogout}
        role={role}
        onToggleRole={toggleRole}
      />
      <div className="layout">
        <Sidebar activeId={sidebarActiveId} role={role} onNavigate={go} />
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
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // ── Persistencia de sesión ──────────────────────────────────
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('metriq_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Usuario que vuelve: saltar landing → ir directo al dashboard
  useEffect(() => {
    if (location.pathname === '/' && user) {
      navigate('/dashboard', { replace: true });
    }
  }, []);

  const handleStartLogin = () => navigate('/login');

  const handleLoginComplete = (userData) => {
    const profile = { ...userData, loginAt: Date.now() };
    try { localStorage.setItem('metriq_user', JSON.stringify(profile)); } catch {}
    setUser(profile);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    try { localStorage.removeItem('metriq_user'); } catch {}
    setUser(null);
    navigate('/');
  };

  const isLanding = location.pathname === '/';
  const isLogin   = location.pathname === '/login';
  const isAdmin   = location.pathname === '/admin';

  return (
    <AnimatePresence mode="wait">
      {isAdmin ? (
        <motion.div key="admin" {...pageTransition}>
          <LeadsPanel onBack={() => navigate('/dashboard')} />
        </motion.div>
      ) : isLanding ? (
        <motion.div key="landing" {...pageTransition}>
          <LandingPage onStart={handleStartLogin} />
        </motion.div>
      ) : isLogin ? (
        <motion.div key="login" {...pageTransition}>
          <OnboardingLogin onComplete={handleLoginComplete} />
        </motion.div>
      ) : (
        <motion.div key="dashboard" {...pageTransition}>
          <Routes location={location}>
            <Route path="/dashboard/*" element={<AppShell user={user} onLogout={handleLogout} />} />
          </Routes>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
