import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fmtPeso } from '../../data/mockData';

// ── Iconos inline (stroke-based, consistentes con la app) ──────
const IconHome = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);
const IconPlan = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="9" y1="21" x2="9" y2="9"/>
  </svg>
);
const IconDoc = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IconCalc = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2"/>
    <line x1="8" y1="6" x2="16" y2="6"/>
    <line x1="8" y1="10" x2="10" y2="10"/>
    <line x1="14" y1="10" x2="16" y2="10"/>
    <line x1="8" y1="14" x2="10" y2="14"/>
    <line x1="14" y1="14" x2="16" y2="14"/>
    <line x1="8" y1="18" x2="16" y2="18"/>
  </svg>
);
const IconBudget = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const IconCert = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);
const IconGantt = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="5" x2="21" y2="5"/>
    <rect x="3" y="8" width="9" height="3" rx="1"/>
    <rect x="8" y="13" width="12" height="3" rx="1"/>
    <rect x="5" y="18" width="7" height="3" rx="1"/>
  </svg>
);
const IconElec = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
  </svg>
);
const IconLink = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

// ── Estructura de navegación del proyecto ─────────────────────
const SIDEBAR_SECTIONS = [
  {
    id: 'documentacion',
    label: 'Documentación de Obra',
    items: [
      { id: 'planos',  label: 'Planos',  icon: <IconPlan /> },
      { id: 'pliegos', label: 'Pliegos', icon: <IconDoc />  },
    ],
  },
  {
    id: 'financiero',
    label: 'Financiero',
    items: [
      { id: 'computos',        label: 'Cómputos',        icon: <IconCalc />   },
      { id: 'presupuestos',    label: 'Presupuestos',    icon: <IconBudget /> },
      { id: 'certificaciones', label: 'Certificaciones', icon: <IconCert />   },
    ],
  },
  {
    id: 'planificacion',
    label: 'Planificación',
    items: [
      { id: 'cronograma', label: 'Cronograma', icon: <IconGantt /> },
    ],
  },
  {
    id: 'instalaciones',
    label: 'Instalaciones',
    items: [
      { id: 'calc-inst', label: 'Cálculo y predimensionamiento', icon: <IconElec /> },
    ],
  },
];

// ── Status config ──────────────────────────────────────────────
const STATUS_CONFIG = {
  activo:      { label: 'En ejecución', cls: 'pl-badge-activo'      },
  presupuesto: { label: 'Presupuesto',  cls: 'pl-badge-presupuesto' },
  finalizado:  { label: 'Finalizado',   cls: 'pl-badge-finalizado'  },
};

// ── Alertas dinámicas según estado del proyecto ────────────────
function buildAlerts(project) {
  const alerts = [];
  if (project.progress >= 80) {
    alerts.push({ id: 'a1', type: 'warn', text: 'El presupuesto de Estructuras superó el 85%. Revisar desvíos de costos.' });
  }
  if (project.progress >= 40 && project.progress < 95) {
    alerts.push({ id: 'a2', type: 'info', text: 'Planos de instalaciones eléctricas pendientes de aprobación municipal.' });
  }
  if (project.status === 'activo' && project.progress < 50) {
    alerts.push({ id: 'a3', type: 'warn', text: 'Certificación N°3 vence el 15/04/2026. Preparar documentación de respaldo.' });
  }
  if (project.progress >= 90) {
    alerts.push({ id: 'a4', type: 'info', text: 'Pre-inspección de obra programada para la próxima semana.' });
  }
  if (project.status === 'presupuesto') {
    alerts.push({ id: 'a5', type: 'info', text: 'Presupuesto pendiente de aprobación por el comitente.' });
  }
  if (alerts.length === 0) {
    alerts.push({ id: 'a0', type: 'info', text: 'Sin alertas activas. El proyecto está al día.' });
  }
  return alerts;
}

const QUICK_LINKS = [
  { id: 'q1', label: 'Último plano apto construcción', meta: 'Rev. 3 · Actualizado 20/03/2026' },
  { id: 'q2', label: 'Última certificación aprobada',  meta: 'Cert. N°2 · $ 4.800.000'        },
  { id: 'q3', label: 'Acta de reunión de obra',        meta: 'Acta N°7 · 18/03/2026'           },
];

// ── Sección vacía para ítems aún no construidos ───────────────
function PlaceholderSection({ label }) {
  return (
    <motion.div
      className="pl-empty"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="pl-empty-icon">🚧</div>
      <div className="pl-empty-title">{label}</div>
      <div className="pl-empty-sub">Esta sección está en desarrollo.</div>
    </motion.div>
  );
}

// ── Lobby: dashboard interno del proyecto ─────────────────────
function LobbyView({ project }) {
  const ejecFin = Math.round(project.budget * (project.progress / 100));
  const alerts  = buildAlerts(project);

  return (
    <motion.div
      key="lobby"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      {/* Fila 1 — KPI cards */}
      <div className="pl-kpi-row">

        <div className="pl-kpi-card">
          <div className="pl-kpi-tag">Avance Físico</div>
          <div className="pl-kpi-val" style={{ color: 'var(--green)' }}>
            {project.progress}%
          </div>
          <div className="pl-kpi-sub">del total de obra ejecutado</div>
          <div
            className="pl-kpi-bar"
            style={{ width: `${project.progress}%`, background: 'var(--green)', opacity: 0.18 }}
          />
        </div>

        <div className="pl-kpi-card">
          <div className="pl-kpi-tag">Ejecución Financiera</div>
          <div
            className="pl-kpi-val"
            style={{ color: 'var(--accent)', fontSize: ejecFin > 99_999_999 ? 19 : 26 }}
          >
            {fmtPeso(ejecFin)}
          </div>
          <div className="pl-kpi-sub">de {fmtPeso(project.budget)} presupuestado</div>
          <div
            className="pl-kpi-bar"
            style={{ width: `${project.progress}%`, background: 'var(--accent)', opacity: 0.12 }}
          />
        </div>

        <div className="pl-kpi-card">
          <div className="pl-kpi-tag">Próximo Hito</div>
          <div className="pl-kpi-val" style={{ color: 'var(--blue)', fontSize: 22 }}>
            15/04/2026
          </div>
          <div className="pl-kpi-sub">Losa nivel 4 · Hormigonado</div>
          <div className="pl-kpi-bar" style={{ width: '60%', background: 'var(--blue)', opacity: 0.13 }} />
        </div>

      </div>

      {/* Fila 2 — Panel dividido */}
      <div className="pl-split-row">

        {/* Columna A (ancha) — Alertas */}
        <div className="pl-panel">
          <div className="pl-panel-title">Alertas del Proyecto</div>
          {alerts.length === 0 ? (
            <div className="pl-alerts-empty">Sin alertas activas.</div>
          ) : (
            alerts.map(a => (
              <div key={a.id} className={`pl-alert pl-alert-${a.type}`}>
                <div className="pl-alert-dot" />
                <span>{a.text}</span>
              </div>
            ))
          )}
        </div>

        {/* Columna B (angosta) — Accesos rápidos */}
        <div className="pl-panel">
          <div className="pl-panel-title">Accesos Rápidos</div>
          {QUICK_LINKS.map(ql => (
            <button key={ql.id} className="pl-quick-item" type="button">
              <div className="pl-quick-icon">
                <IconLink />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="pl-quick-label">{ql.label}</div>
                <div className="pl-quick-meta">{ql.meta}</div>
              </div>
              <span className="pl-quick-arrow">→</span>
            </button>
          ))}
        </div>

      </div>
    </motion.div>
  );
}

// ── Componente principal ───────────────────────────────────────
export default function ProyectoLayout({ project, onNavigate, onModuleOpen }) {
  const [activeSection, setActiveSection] = useState('lobby');

  if (!project) {
    onNavigate('proyectos');
    return null;
  }

  const { label: statusLabel, cls: statusCls } =
    STATUS_CONFIG[project.status] ?? STATUS_CONFIG.activo;

  const handleSectionClick = (sectionId) => {
    // Delegar a módulos ya construidos cuando corresponde
    if (sectionId === 'cronograma') {
      onModuleOpen({ id: 'gantt' }, project);
      return;
    }
    if (sectionId === 'presupuestos') {
      onModuleOpen({ id: 'presup' }, project);
      return;
    }
    setActiveSection(sectionId);
  };

  const activeSectionLabel =
    SIDEBAR_SECTIONS.flatMap(s => s.items).find(i => i.id === activeSection)?.label ?? '';

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.22 }}
    >
      {/* Volver */}
      <button className="calc-back" onClick={() => onNavigate('proyectos')}>
        ← Volver a proyectos
      </button>

      <div className="pl-wrap">

        {/* ── Sidebar del proyecto ──────────────────── */}
        <aside className="pl-side">

          {/* Lobby */}
          <div
            className={`pl-nav-lobby${activeSection === 'lobby' ? ' act' : ''}`}
            onClick={() => setActiveSection('lobby')}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setActiveSection('lobby')}
          >
            <IconHome />
            <span>Vista general</span>
          </div>

          <div className="pl-side-sep" />

          {SIDEBAR_SECTIONS.map((section, si) => (
            <motion.div
              key={section.id}
              className="pl-side-group"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: si * 0.04 }}
            >
              <div className="pl-section-label">{section.label}</div>
              {section.items.map(item => (
                <div
                  key={item.id}
                  className={`pl-nav-item${activeSection === item.id ? ' act' : ''}`}
                  onClick={() => handleSectionClick(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && handleSectionClick(item.id)}
                >
                  <div className="pl-nav-dot" />
                  <span className="pl-nav-icon-wrap">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </motion.div>
          ))}
        </aside>

        {/* ── Área de contenido ─────────────────────── */}
        <div className="pl-content">

          {/* Header del proyecto */}
          <div className="pl-header">
            <div className="pl-header-info">
              <div className="pl-header-name">{project.name}</div>
              <div className="pl-header-address">
                {project.address ?? project.type} · Actualizado {project.lastUpdate}
              </div>
            </div>
            <span className={`pl-badge ${statusCls}`}>{statusLabel}</span>
          </div>

          {/* Contenido dinámico con transición */}
          <AnimatePresence mode="wait">
            {activeSection === 'lobby' ? (
              <LobbyView key="lobby" project={project} />
            ) : (
              <PlaceholderSection key={activeSection} label={activeSectionLabel} />
            )}
          </AnimatePresence>

        </div>
      </div>
    </motion.div>
  );
}
