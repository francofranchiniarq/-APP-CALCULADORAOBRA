import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Header           from './components/Header';
import Sidebar          from './components/Sidebar';
import Dashboard        from './components/Dashboard';
import CalcView         from './components/CalcView';
import BudgetView       from './components/BudgetView';
import LandingPage      from './components/LandingPage';
import OnboardingLogin  from './components/OnboardingLogin';
import LeadsPanel       from './components/LeadsPanel';
import MisProyectosView from './components/views/MisProyectosView';
import DetalleProyectoView from './components/views/DetalleProyectoView';
import ModuloAgua       from './components/ModuloAgua';
import { GanttChart }   from './react-gantt/components/GanttChart';

import { CALC_MODULES } from './modules/calculators';
import { supabase, OFFLINE_MODE } from './lib/supabase.js';
import { getProfile, signOut as sbSignOut } from './services/authService.js';
import { getGanttTasks, saveGanttTasks }   from './services/ganttService.js';

import './styles/landing.css';

// ── Transición de páginas ─────────────────────────────────────
const pageTransition = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: 'easeOut' },
};

// ── Pantalla de carga inicial ─────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#ECEAE6',
    }}>
      <div style={{ textAlign: 'center' }}>
        <svg width="36" height="36" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(168,16,46,0.12)" strokeWidth="3" />
          <circle cx="24" cy="24" r="20" fill="none" stroke="#A8102E" strokeWidth="3"
            strokeDasharray="80 126" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate"
              values="0 24 24;360 24 24" dur="1s" repeatCount="indefinite" />
          </circle>
        </svg>
        <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: '#57534E', fontFamily: 'Inter, sans-serif' }}>
          Cargando Metriq…
        </div>
      </div>
    </div>
  );
}

// ── Placeholder para vistas en construcción ───────────────────
function PlaceholderView({ title, onNavigate }) {
  return (
    <motion.div className="placeholder-view"
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="placeholder-icon">🚧</div>
      <div className="placeholder-title">{title}</div>
      <div className="placeholder-sub">Esta sección está en construcción.</div>
      <button className="calc-back" style={{ marginTop: 16 }} onClick={() => onNavigate('dashboard')}>
        ← Volver al dashboard
      </button>
    </motion.div>
  );
}

// ── CalcPage: módulos de cálculo por URL ──────────────────────
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

  if (!mod) { navigate('/dashboard', { replace: true }); return null; }

  const updVal = (k, val) => {
    const f = mod.fields.find((x) => x.k === k);
    let p = val;
    if (f.t === 'n') p = parseFloat(val) || 0;
    else if (f.t === 's') { const o = f.o.find((x) => String(x.v) === String(val)); p = o ? o.v : val; }
    const n = { ...vals, [k]: p };
    setVals(n);
    setRes(mod.calc(n));
  };

  return <CalcView mod={mod} vals={vals} res={res} onUpdate={updVal} onBack={() => navigate('/dashboard')} />;
}
function CalcPageWrapper() { const { moduleId } = useParams(); return <CalcPage key={moduleId} />; }
function BudgetPage()      { const navigate = useNavigate(); return <BudgetView onBack={() => navigate('/dashboard')} />; }

// ── GanttWithData: wrapper que carga tareas desde Supabase ────
function GanttWithData({ obraId, obraName, onBack }) {
  const [tasks, setTasks]   = useState(undefined); // undefined = usar mock
  const [loading, setLoading] = useState(!!obraId && !OFFLINE_MODE);

  useEffect(() => {
    if (!obraId || OFFLINE_MODE) { setLoading(false); return; }
    getGanttTasks(obraId)
      .then(t => { setTasks(t.length > 0 ? t : undefined); })
      .catch(() => setTasks(undefined))
      .finally(() => setLoading(false));
  }, [obraId]);

  const handleSave = useCallback(async (updatedTasks) => {
    if (!obraId || OFFLINE_MODE) return;
    try { await saveGanttTasks(obraId, updatedTasks); }
    catch (err) { console.error('[Gantt] Error guardando tareas:', err); }
  }, [obraId]);

  if (loading) return <LoadingScreen />;

  return (
    <GanttChart
      initialTasks={tasks}
      onSave={obraId && !OFFLINE_MODE ? handleSave : null}
      obraName={obraName}
      onBack={onBack}
    />
  );
}

// ══════════════════════════════════════════════════════════════
// AppShell — núcleo de la app con estado de navegación
// ══════════════════════════════════════════════════════════════
function AppShell({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView] = useState({ id: 'dashboard', project: null });
  const [role, setRole]  = useState(user?.role || 'profesional');

  const toggleRole = () => {
    setRole(r => r === 'profesional' ? 'instalador' : 'profesional');
    setView({ id: 'dashboard', project: null });
  };

  const go = useCallback((id, extra = {}) => {
    setView({ id, project: null, ...extra });
  }, []);

  const openModule = useCallback((mod, project = null) => {
    if (mod.id === 'agua')  setView({ id: 'modulo-agua',  project });
    else if (mod.id === 'gantt') setView({ id: 'modulo-gantt', project });
    else if (mod.id === 'presup') navigate('/dashboard/presupuesto');
    else navigate(`/dashboard/calc/${mod.id}`);
  }, [navigate]);

  const sidebarActiveId = (() => {
    const p = location.pathname;
    if (p.includes('/calc/') || p.includes('/presupuesto')) return null;
    if (view.id === 'modulo-agua' || view.id === 'modulo-gantt') return null;
    return view.id;
  })();

  const renderMain = () => {
    const p = location.pathname;
    if (p.includes('/calc/') || p.includes('/presupuesto')) return null;

    const backFromModule = () =>
      view.project ? go('proyecto-detalle', { project: view.project }) : go('dashboard');

    switch (view.id) {
      case 'dashboard':
        return <Dashboard onOpen={openModule} onNavigate={go} user={user} role={role} />;
      case 'proyectos':
        return <MisProyectosView onNavigate={go} />;
      case 'proyecto-detalle':
        return <DetalleProyectoView project={view.project} onNavigate={go} onModuleOpen={openModule} />;
      case 'modulo-agua':
        return <ModuloAgua project={view.project} onBack={backFromModule} />;
      case 'modulo-gantt':
        return (
          <GanttWithData
            obraId={view.project?.id}
            obraName={view.project?.nombre || view.project?.name || 'Cronograma de Obra'}
            onBack={backFromModule}
          />
        );
      case 'presupuestos': return <PlaceholderView title="Historial de Presupuestos" onNavigate={go} />;
      case 'precios':      return <PlaceholderView title="Base de Precios" onNavigate={go} />;
      case 'config':       return <PlaceholderView title="Configuración" onNavigate={go} />;
      case 'cotizaciones': return <PlaceholderView title="Mis Cotizaciones" onNavigate={go} />;
      case 'herramientas': return <PlaceholderView title="Herramientas" onNavigate={go} />;
      default:
        return <Dashboard onOpen={openModule} onNavigate={go} user={user} role={role} />;
    }
  };

  return (
    <div className="app">
      <Header
        onLogoClick={() => go('dashboard')}
        user={user} onLogout={onLogout}
        role={role} onToggleRole={toggleRole}
      />
      <div className="layout">
        <Sidebar activeId={sidebarActiveId} role={role} onNavigate={go} />
        <main className="main">
          <AnimatePresence mode="wait">
            <Routes location={location}>
              <Route path="/" element={
                <motion.div
                  key={view.id + (view.project?.id || '')}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.22, ease: 'easeOut' }}
                  style={{ height: '100%' }}
                >
                  {renderMain()}
                </motion.div>
              } />
              <Route path="/calc/:moduleId" element={
                <motion.div key={location.pathname}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.22, ease: 'easeOut' }}
                  style={{ height: '100%' }}>
                  <CalcPageWrapper />
                </motion.div>
              } />
              <Route path="/presupuesto" element={
                <motion.div key="presupuesto"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.22, ease: 'easeOut' }}
                  style={{ height: '100%' }}>
                  <BudgetPage />
                </motion.div>
              } />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// App — root con auth (Supabase online | localStorage offline)
// ══════════════════════════════════════════════════════════════
export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser]       = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // ── Inicialización de auth ──────────────────────────────────
  useEffect(() => {
    if (OFFLINE_MODE) {
      // Modo offline: leer de localStorage (comportamiento anterior)
      try {
        const saved = localStorage.getItem('metriq_user');
        if (saved) setUser(JSON.parse(saved));
      } catch {}
      setAuthReady(true);
      return;
    }

    // Modo online: Supabase
    let mounted = true;

    // 1. Verificar sesión existente al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session) {
        loadProfile(session.user.id);
      } else {
        setAuthReady(true);
      }
    });

    // 2. Escuchar cambios de auth (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (event === 'SIGNED_IN' && session) {
          await loadProfile(session.user.id);
          // Redirigir al dashboard si estamos en landing o login
          if (location.pathname === '/' || location.pathname === '/login') {
            navigate('/dashboard', { replace: true });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/', { replace: true });
        }
      }
    );

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Carga el perfil con retry (el trigger de Supabase puede tardar ~1s)
  const loadProfile = useCallback(async (userId, attempt = 1) => {
    try {
      const profile = await getProfile(userId);
      // Enriquecer con datos de la sesión de Google si faltan
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      const meta = sbUser?.user_metadata || {};
      setUser({
        ...profile,
        email:      profile.email      || sbUser?.email,
        nombre:     profile.nombre     || meta.full_name || meta.name || sbUser?.email?.split('@')[0],
        avatar_url: profile.avatar_url || meta.avatar_url || meta.picture,
      });
    } catch {
      if (attempt < 3) {
        setTimeout(() => loadProfile(userId, attempt + 1), 800 * attempt);
        return;
      }
      // Fallback: usar datos de la sesión directamente
      const { data: { user: sbUser } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
      const meta = sbUser?.user_metadata || {};
      setUser({
        id: userId,
        role: 'profesional',
        plan: 'starter',
        email:      sbUser?.email,
        nombre:     meta.full_name || meta.name || sbUser?.email?.split('@')[0] || 'Usuario',
        avatar_url: meta.avatar_url || meta.picture || null,
      });
    } finally {
      setAuthReady(true);
    }
  }, []);

  // ── Handlers ─────────────────────────────────────────────────
  // Para modo offline: onboarding sigue llamando onComplete
  const handleLoginComplete = useCallback((userData) => {
    if (!OFFLINE_MODE) return; // Supabase maneja el flujo vía onAuthStateChange
    const profile = { ...userData, loginAt: Date.now() };
    try { localStorage.setItem('metriq_user', JSON.stringify(profile)); } catch {}
    setUser(profile);
    navigate('/dashboard');
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    if (!OFFLINE_MODE) {
      await sbSignOut();
      // onAuthStateChange maneja el resto
    } else {
      try { localStorage.removeItem('metriq_user'); } catch {}
      setUser(null);
      navigate('/');
    }
  }, [navigate]);

  // ── Esperar a que auth esté lista ─────────────────────────────
  if (!authReady) return <LoadingScreen />;

  // ── Routing ───────────────────────────────────────────────────
  const isLanding  = location.pathname === '/';
  const isLogin    = location.pathname === '/login';
  const isAdmin    = location.pathname === '/admin';
  const isDashboard = location.pathname.startsWith('/dashboard');

  // Redirigir usuario autenticado que llega al landing
  if (isLanding && user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {isAdmin ? (
        <motion.div key="admin" {...pageTransition}>
          <LeadsPanel onBack={() => navigate('/dashboard')} />
        </motion.div>
      ) : isLanding ? (
        <motion.div key="landing" {...pageTransition}>
          <LandingPage
            onStart={() => navigate('/login')}
            onLogin={() => navigate('/login', { state: { mode: 'login' } })}
          />
        </motion.div>
      ) : isLogin ? (
        <motion.div key="login" {...pageTransition}>
          <OnboardingLogin
            onComplete={handleLoginComplete}
            initialMode={location.state?.mode}
          />
        </motion.div>
      ) : isDashboard ? (
        <motion.div key="dashboard" {...pageTransition}>
          <Routes location={location}>
            <Route path="/dashboard/*" element={<AppShell user={user} onLogout={handleLogout} />} />
          </Routes>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
