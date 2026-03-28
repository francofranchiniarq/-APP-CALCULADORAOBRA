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
import { CALC_MODULES } from './modules/calculators';
import './styles/landing.css';

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: 'easeOut' },
};

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

function DashPage({ user, role }) {
  const navigate = useNavigate();
  const openMod = (m) => {
    if (m.id === "presup") navigate('/dashboard/presupuesto');
    else navigate(`/dashboard/calc/${m.id}`);
  };
  return <Dashboard onOpen={openMod} user={user} role={role} />;
}

function AppShell({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Role state simulado — por defecto usa el rol del onboarding, alternables para testing
  const [role, setRole] = useState(user?.role || 'profesional');
  const toggleRole = () => setRole(r => r === 'profesional' ? 'instalador' : 'profesional');

  const path = location.pathname;
  let activeId = null;
  if (path.includes('/calc/')) activeId = path.split('/calc/')[1];
  else if (path.includes('/presupuesto')) activeId = 'presup';

  return (
    <div className="app">
      <Header
        onLogoClick={() => navigate('/dashboard')}
        user={user}
        onLogout={onLogout}
        role={role}
        onToggleRole={toggleRole}
      />
      <div className="layout">
        <Sidebar activeId={activeId} role={role} />
        <main className="main">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname + role}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{ height: '100%' }}
            >
              <Routes location={location}>
                <Route path="/" element={<DashPage user={user} role={role} />} />
                <Route path="/calc/:moduleId" element={<CalcPageWrapper />} />
                <Route path="/presupuesto" element={<BudgetPage />} />
              </Routes>
            </motion.div>
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
  const isLogin = location.pathname === '/login';
  const isAdmin = location.pathname === '/admin';

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
