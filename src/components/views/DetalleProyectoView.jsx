import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { editarObra, eliminarObra } from '../../modules/obras';
import { fmtPeso } from '../../data/mockData';
import ObraFormModal from '../ObraFormModal';
import ConfirmModal from '../ConfirmModal';
import Ring from '../Ring';
import ModuloPlanos from '../ModuloPlanos';

// ── Icons ──────────────────────────────────────────────────────
const IconDoc = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const IconMoney = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconTool = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const IconDollarCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <path d="M14.5 9.5a2.5 2.5 0 0 0-5 0c0 1.4 1 2 2.5 2.5s2.5 1.1 2.5 2.5a2.5 2.5 0 0 1-5 0"/>
  </svg>
);

const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconAlert = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconArrow = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const IconChevron = ({ down }) => (
  <svg
    width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: down ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.18s ease', flexShrink: 0 }}
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const IconHome = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconPin = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

// ── Navigation structure ───────────────────────────────────────
const NAV_CATEGORIES = [
  {
    id: 'documentacion',
    label: 'Documentación de Obra',
    icon: <IconDoc />,
    items: [
      { id: 'planos',   label: 'Planos' },
      { id: 'pliegos',  label: 'Pliegos' },
    ],
  },
  {
    id: 'financiero',
    label: 'Financiero',
    icon: <IconMoney />,
    items: [
      { id: 'computos',        label: 'Cómputos' },
      { id: 'presupuestos',    label: 'Presupuestos' },
      { id: 'certificaciones', label: 'Certificaciones' },
    ],
  },
  {
    id: 'planificacion',
    label: 'Planificación',
    icon: <IconClock />,
    items: [
      { id: 'cronograma', label: 'Cronograma' },
    ],
  },
  {
    id: 'instalaciones',
    label: 'Instalaciones',
    icon: <IconTool />,
    items: [
      { id: 'calculo', label: 'Cálculo y predimensionamiento' },
    ],
  },
];

// ── Status config ──────────────────────────────────────────────
const STATUS_MAP = {
  activo:           { label: 'Activo',         cls: 'pd-badge-activo' },
  'en-ejecucion':   { label: 'En ejecución',   cls: 'pd-badge-ejecucion' },
  presupuesto:      { label: 'Presupuesto',    cls: 'pd-badge-presupuesto' },
  finalizado:       { label: 'Finalizado',     cls: 'pd-badge-finalizado' },
};

// ── Mock data helpers ──────────────────────────────────────────
const getMockAlerts = (obra) => [
  {
    id: 1,
    level: 'warning',
    text: 'El presupuesto de Estructuras superó el 85% del estimado.',
    date: 'hoy',
  },
  {
    id: 2,
    level: 'info',
    text: `Plano APT de ${obra.nombre || obra.name || 'la obra'} pendiente de visado en municipalidad.`,
    date: 'ayer',
  },
  {
    id: 3,
    level: 'warning',
    text: 'Certificación 03 vence el 15/04/2026. Coordinar con el comitente.',
    date: 'hace 2 días',
  },
];

const QUICK_ACCESS = [
  { id: 'qa1', label: 'Último plano apto construcción', sub: 'Plano APT-04 — Rev. C', icon: <IconDoc /> },
  { id: 'qa2', label: 'Última certificación aprobada',  sub: 'Cert. 02 — $ 4.800.000',  icon: <IconMoney /> },
  { id: 'qa3', label: 'Cronograma actualizado',          sub: 'Rev. 14/03/2026',         icon: <IconClock /> },
];

// ── Lobby: el dashboard interno del proyecto ───────────────────
function ProjectLobby({ obra }) {
  const avance      = obra.avance ?? obra.progress ?? 0;
  const presupuesto = obra.presupuesto ?? obra.budget ?? 0;
  const ejecucion   = Math.round(presupuesto * (avance / 100));
  const alerts      = getMockAlerts(obra);

  return (
    <div className="pd-lobby">
      {/* ── Fila 1: KPIs ──────────────────────────────────────── */}
      <div className="pd-kpi-row">

        {/* KPI: Avance Físico */}
        <div className="pd-kpi-card">
          <div className="pd-kpi-label">Avance Físico</div>
          <div className="pd-kpi-top">
            <div>
              <div className="pd-kpi-value">
                {avance}<span className="pd-kpi-unit">%</span>
              </div>
              <div className="pd-kpi-sub">Sobre el total planificado</div>
            </div>
            <div className="pd-kpi-ring-wrap">
              <Ring pct={avance} color="#A8102E" size={58} stroke={5} />
              <span className="pd-kpi-ring-label">{avance}</span>
            </div>
          </div>
          <div className="pd-kpi-track">
            <div className="pd-kpi-track-fill" style={{ width: `${avance}%` }} />
          </div>
        </div>

        {/* KPI: Ejecución Financiera */}
        <div className="pd-kpi-card">
          <div className="pd-kpi-label">Ejecución Financiera</div>
          <div className="pd-kpi-top">
            <div>
              <div className="pd-kpi-mono">{fmtPeso(ejecucion)}</div>
              <div className="pd-kpi-sub-row">
                <span className="pd-kpi-sub">de {fmtPeso(presupuesto)}</span>
                <span className="pd-kpi-chip">{avance}% ejecutado</span>
              </div>
            </div>
            <div className="pd-kpi-icon pd-kpi-icon-green">
              <IconDollarCircle />
            </div>
          </div>
        </div>

        {/* KPI: Próximo Hito */}
        <div className="pd-kpi-card">
          <div className="pd-kpi-label">Próximo Hito</div>
          <div className="pd-kpi-top">
            <div>
              <div className="pd-kpi-date-big">15 Abr <span className="pd-kpi-year">2026</span></div>
              <div className="pd-kpi-hito-name">Entrega de estructura metálica</div>
              <div className="pd-kpi-days">Faltan 16 días</div>
            </div>
            <div className="pd-kpi-icon pd-kpi-icon-blue">
              <IconCalendar />
            </div>
          </div>
        </div>

      </div>

      {/* ── Fila 2: Alertas + Accesos Rápidos ─────────────────── */}
      <div className="pd-panel-row">

        {/* Columna A: Alertas */}
        <div className="pd-alerts-panel">
          <div className="pd-panel-hdr">
            <span className="pd-panel-title">
              <IconAlert />
              Alertas del Proyecto
            </span>
            <span className="pd-alert-count">{alerts.length}</span>
          </div>
          <div className="pd-alerts-list">
            {alerts.map((a) => (
              <div key={a.id} className={`pd-alert-item pd-alert-${a.level}`}>
                <div className="pd-alert-dot" />
                <div className="pd-alert-body">
                  <div className="pd-alert-text">{a.text}</div>
                  <div className="pd-alert-date">{a.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna B: Accesos Rápidos */}
        <div className="pd-quick-panel">
          <div className="pd-panel-hdr">
            <span className="pd-panel-title">
              <IconArrow />
              Accesos Rápidos
            </span>
          </div>
          <div className="pd-quick-list">
            {QUICK_ACCESS.map((q) => (
              <button key={q.id} className="pd-quick-item">
                <div className="pd-quick-icon">{q.icon}</div>
                <div className="pd-quick-body">
                  <div className="pd-quick-label">{q.label}</div>
                  <div className="pd-quick-sub">{q.sub}</div>
                </div>
                <div className="pd-quick-arrow"><IconArrow /></div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Placeholder para secciones aún no construidas ─────────────
function SectionPlaceholder({ label }) {
  return (
    <div className="pd-placeholder">
      <div className="pd-placeholder-icon">🚧</div>
      <div className="pd-placeholder-title">{label}</div>
      <div className="pd-placeholder-sub">Esta sección está en construcción.</div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────
export default function DetalleProyectoView({ project, onNavigate, onModuleOpen, user }) {
  const [obra, setObra]       = useState(project);
  const [showEdit, setShowEdit]     = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [activeSection, setActiveSection] = useState('lobby');
  const [expandedCats, setExpandedCats]   = useState([
    'documentacion', 'financiero', 'planificacion', 'instalaciones',
  ]);

  if (!obra) {
    onNavigate('proyectos');
    return null;
  }

  const nombre    = obra.nombre   || obra.name    || 'Proyecto';
  const direccion = obra.direccion || obra.address || '';
  const avance    = obra.avance   ?? obra.progress ?? 0;
  const statusKey = obra.estado   || obra.status   || 'activo';
  const status    = STATUS_MAP[statusKey] || { label: statusKey, cls: 'pd-badge-activo' };

  const toggleCat = (catId) =>
    setExpandedCats((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );

  const handleSectionClick = (sectionId) => {
    // Sections wired to real modules
    const moduleMap = {
      cronograma:   { id: 'gantt',   name: 'Cronograma' },
      calculo:      { id: 'agua',    name: 'Instalaciones' },
      presupuestos: { id: 'presup',  name: 'Presupuestos' },
    };
    if (moduleMap[sectionId]) {
      onModuleOpen(moduleMap[sectionId], obra);
      return;
    }
    setActiveSection(sectionId);
  };

  const handleEdit = (formData) => {
    const updated = editarObra(obra.id, formData);
    if (updated) setObra(updated);
    setShowEdit(false);
  };

  const handleDelete = () => {
    eliminarObra(obra.id);
    setShowDelete(false);
    onNavigate('proyectos');
  };

  const renderContent = () => {
    if (activeSection === 'lobby') return <ProjectLobby obra={obra} />;
    if (activeSection === 'planos') return <ModuloPlanos project={obra} />;
    const label =
      NAV_CATEGORIES.flatMap((c) => c.items).find((i) => i.id === activeSection)?.label ||
      activeSection;
    return <SectionPlaceholder label={label} />;
  };

  return (
    <motion.div
      className="pd-root"
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -14 }}
      transition={{ duration: 0.22 }}
    >
      {/* ── Back ─────────────────────────────────────────────── */}
      <button className="calc-back" style={{ marginBottom: 10 }} onClick={() => onNavigate('proyectos')}>
        ← Volver a proyectos
      </button>

      {/* ── Project Header ───────────────────────────────────── */}
      <div className="pd-header">
        <div className="pd-header-l">
          <div className="pd-header-title-row">
            <h1 className="pd-header-name">{nombre}</h1>
            <span className={`pd-badge ${status.cls}`}>{status.label}</span>
          </div>
          {direccion && (
            <div className="pd-header-addr">
              <IconPin />
              {direccion}
            </div>
          )}
        </div>
        <div className="pd-header-actions">
          <button className="proj-action-btn" onClick={() => setShowEdit(true)} title="Editar proyecto">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button className="proj-action-btn danger" onClick={() => setShowDelete(true)} title="Eliminar proyecto">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Progress strip ───────────────────────────────────── */}
      <div className="pd-progress-track">
        <div className="pd-progress-fill" style={{ width: `${avance}%` }} />
      </div>

      {/* ── Internal layout: sidebar + content ───────────────── */}
      <div className="pd-layout">

        {/* Project sidebar */}
        <nav className="pd-sidebar">
          <button
            className={`pd-nav-lobby${activeSection === 'lobby' ? ' active' : ''}`}
            onClick={() => setActiveSection('lobby')}
          >
            <IconHome />
            Resumen del Proyecto
          </button>

          <div className="pd-nav-divider" />

          {NAV_CATEGORIES.map((cat) => {
            const expanded = expandedCats.includes(cat.id);
            return (
              <div key={cat.id} className="pd-nav-cat">
                <button className="pd-nav-cat-btn" onClick={() => toggleCat(cat.id)}>
                  <span className="pd-nav-cat-icon">{cat.icon}</span>
                  <span className="pd-nav-cat-label">{cat.label}</span>
                  <IconChevron down={expanded} />
                </button>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      className="pd-nav-items"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      {cat.items.map((item) => (
                        <button
                          key={item.id}
                          className={`pd-nav-item${activeSection === item.id ? ' active' : ''}`}
                          onClick={() => handleSectionClick(item.id)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Content area */}
        <div className="pd-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* ── Modals ───────────────────────────────────────────── */}
      <ObraFormModal
        open={showEdit}
        obra={obra}
        onSave={handleEdit}
        onClose={() => setShowEdit(false)}
      />
      <ConfirmModal
        open={showDelete}
        title="Eliminar proyecto"
        message={`¿Estás seguro de que querés eliminar "${nombre}"? Se perderán todos los cálculos asociados.`}
        confirmLabel="Eliminar proyecto"
        onConfirm={handleDelete}
        onClose={() => setShowDelete(false)}
      />
    </motion.div>
  );
}
