import { motion } from 'framer-motion';

// ─── Iconos inline SVG para nav ───────────────────────────────
const NavIcon = ({ type }) => {
  const s = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    home:     <svg {...s}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    folder:   <svg {...s}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    budget:   <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    price:    <svg {...s}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    settings: <svg {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    wrench:   <svg {...s}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
    quote:    <svg {...s}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  };
  return icons[type] || null;
};

// ─── Configuración de navegación por rol ─────────────────────
const NAV_PROFESIONAL = [
  { id: 'dashboard',     label: 'Dashboard',              icon: 'home'     },
  { id: 'proyectos',     label: 'Mis Proyectos',          icon: 'folder'   },
  { id: 'presupuestos',  label: 'Historial Presupuestos', icon: 'budget'   },
  { id: 'precios',       label: 'Base de Precios',        icon: 'price'    },
  { id: 'config',        label: 'Configuración',          icon: 'settings' },
];

const NAV_INSTALADOR = [
  { id: 'dashboard',    label: 'Dashboard',       icon: 'home'   },
  { id: 'cotizaciones', label: 'Mis Cotizaciones', icon: 'quote'  },
  { id: 'herramientas', label: 'Herramientas',     icon: 'wrench' },
];

export default function Sidebar({ role, activeId, onNavigate }) {
  const navItems = role === 'instalador' ? NAV_INSTALADOR : NAV_PROFESIONAL;
  // resolve active: proyecto-detalle maps back to 'proyectos' highlight
  const effectiveActive = activeId === 'proyecto-detalle' ? 'proyectos' : (activeId || 'dashboard');

  return (
    <nav className="side">
      <div className="side-label">Menú</div>
      {navItems.map((item, i) => (
        <motion.div
          key={item.id}
          className={`side-nav-item ${effectiveActive === item.id ? 'act' : ''}`}
          onClick={() => onNavigate(item.id)}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.18, delay: i * 0.04 }}
          whileHover={{ x: 2, transition: { duration: 0.12 } }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="side-nav-icon">
            <NavIcon type={item.icon} />
          </div>
          {item.label}
        </motion.div>
      ))}
    </nav>
  );
}
