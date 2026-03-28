import { useState } from 'react';
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
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.4 },
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
    navigate('/', { replace: true });
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

function DashPage() {
  const navigate = useNavigate();
  const openMod = (m) => {
    if (m.id === "presup") navigate('/dashboard/presupuesto');
    else navigate(`/dashboard/calc/${m.id}`);
  };
  return <Dashboard onOpen={openMod} />;
}

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSidebarSelect = (m) => {
    if (m.id === "presup") navigate('/dashboard/presupuesto');
    else navigate(`/dashboard/calc/${m.id}`);
  };

  const path = location.pathname;
  let activeId = null;
  if (path.includes('/calc/')) activeId = path.split('/calc/')[1];
  else if (path.includes('/presupuesto')) activeId = 'presup';

  return (
    <div className="app">
      <Header onLogoClick={() => navigate('/dashboard')} />
      <div className="layout">
        <Sidebar activeId={activeId} onSelect={handleSidebarSelect} />
        <main className="main">
          <Routes>
            <Route path="/" element={<DashPage />} />
            <Route path="/calc/:moduleId" element={<CalcPageWrapper />} />
            <Route path="/presupuesto" element={<BudgetPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleStartLogin = () => navigate('/login');
  const handleLoginComplete = (userData) => {
    // In production: save userData to context/backend
    navigate('/dashboard');
  };

  // Determine which "view" to render based on route
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
            <Route path="/dashboard/*" element={<AppShell />} />
          </Routes>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
