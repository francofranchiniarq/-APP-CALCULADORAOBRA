import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ALL_MODULES } from '../modules/calculators';
import { getObras, crearObra } from '../modules/obras';
import { MOCK_QUOTES, fmtPeso } from '../data/mockData';
import { getUserPlan, canAccessModule, canCreateProject, PRO_MODULES } from '../modules/plans';
import ObraFormModal from './ObraFormModal';

// Hero CTA por rubro del instalador
const RUBRO_HERO = {
  sanitario:     { modId: 'gas',       cta: 'Nueva Cotización de Gas',        desc: 'NAG 200 · Renouard · Cómputo de accesorios' },
  seco:          { modId: 'seco',      cta: 'Nueva Cotización de Durlock',    desc: 'Placas · Perfilería · Tornillería completa' },
  electrico:     { modId: 'electrico', cta: 'Nueva Cotización Eléctrica',     desc: 'Conductores · Protecciones · Luminotecnia' },
  termomecanico: { modId: 'termo',     cta: 'Nueva Cotización Termomecánica', desc: 'Balance térmico · Selección de equipos' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'hace 1 día';
  if (days < 7) return `hace ${days} días`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return 'hace 1 semana';
  return `hace ${weeks} semanas`;
}

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

// ═══════════════════════════════════════════════════════════════
// FLUJO 1 — PROFESIONAL / CONSTRUCTORA
// ═══════════════════════════════════════════════════════════════

function ProjectCard({ obra, onClick, index }) {
  const statusMap = {
    activo:      { cls: 'proj-status-activo',      label: 'Activo'       },
    presupuesto: { cls: 'proj-status-presupuesto',  label: 'Presupuesto'  },
    finalizado:  { cls: 'proj-status-finalizado',   label: 'Finalizado'   },
  };
  const { cls, label } = statusMap[obra.estado] || { cls: '', label: obra.estado };

  return (
    <motion.div
      className="proj-card"
      onClick={() => onClick(obra)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="proj-card-top">
        <div className="proj-type">{obra.tipo || 'Obra'}</div>
        <span className={`proj-status-pill ${cls}`}>{label}</span>
      </div>
      <div className="proj-name">{obra.nombre}</div>
      <div className="proj-update">Actualizado {timeAgo(obra.actualizada)}</div>
      <div className="proj-progress-bar">
        <div className="proj-progress-fill" style={{ width: `${obra.avance || 0}%` }} />
      </div>
      <div className="proj-progress-row">
        <span className="proj-progress-label">{obra.avance || 0}% completado</span>
        <span className="proj-budget">{fmtPeso(obra.presupuesto || 0)}</span>
      </div>
    </motion.div>
  );
}

function DashboardProfesional({ onOpen, onNavigate, user, onUpgrade }) {
  const [obras, setObras] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const plan = getUserPlan(user);

  const loadObras = useCallback(() => {
    setObras(getObras());
  }, []);

  useEffect(() => { loadObras(); }, [loadObras]);

  const activeCount  = obras.filter(o => o.estado === 'activo').length;
  const presupCount  = obras.filter(o => o.estado === 'presupuesto').length;
  const totalBudget  = obras.filter(o => o.estado !== 'finalizado')
                            .reduce((s, o) => s + (o.presupuesto || 0), 0);

  const handleProjectClick = (obra) => {
    onNavigate('proyecto-detalle', { project: obra });
  };

  const handleNewProject = () => {
    if (!canCreateProject(user, obras.length)) {
      onUpgrade('projects');
      return;
    }
    setShowForm(true);
  };

  const handleCreate = (formData) => {
    crearObra(formData);
    loadObras();
    setShowForm(false);
  };

  // Split modules into accessible and locked based on user plan
  const allMods = ALL_MODULES;
  const unlockedMods = allMods.filter(m => canAccessModule(user, m.id));
  const lockedMods = allMods.filter(m => !canAccessModule(user, m.id));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <div className="dash-greeting">Panel de Control</div>
      <div className="dash-sub">
        Gestión de proyectos · Arquitectura y Construcción
        {plan.id !== 'free' && <span className="dash-plan-badge" style={{ background: plan.bg, color: plan.color }}>{plan.label}</span>}
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-big" style={{ color: "var(--green)" }}>{activeCount}</div>
          <div className="stat-label">Proyectos activos</div>
        </div>
        <div className="stat-card">
          <div className="stat-big" style={{ color: "var(--accent)" }}>{presupCount}</div>
          <div className="stat-label">En presupuesto</div>
        </div>
        <div className="stat-card">
          <div className="stat-big" style={{ color: "var(--text)", fontSize: 24 }}>
            {totalBudget >= 1000000 ? fmtPeso(totalBudget / 1000000) + 'M' : fmtPeso(totalBudget)}
          </div>
          <div className="stat-label">Costo total est.</div>
        </div>
      </div>

      <div className="dash-section-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Mis proyectos recientes</span>
        <button className="quote-action-link" onClick={() => onNavigate('proyectos')}>
          Ver todos →
        </button>
      </div>
      <div className="proj-grid">
        {obras.slice(0, 4).map((o, i) => (
          <ProjectCard key={o.id} obra={o} onClick={handleProjectClick} index={i} />
        ))}
        <motion.div
          className="proj-card proj-card-new"
          onClick={handleNewProject}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: Math.min(obras.length, 4) * 0.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="proj-card-new-inner">
            <div className="proj-card-new-icon">+</div>
            <div className="proj-card-new-label">Nuevo proyecto</div>
            {plan.maxProjects !== Infinity && (
              <div className="proj-card-new-limit">{obras.length}/{plan.maxProjects}</div>
            )}
          </div>
        </motion.div>
      </div>

      {obras.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text3)', fontSize: 13, fontWeight: 600 }}>
          No tenés proyectos todavía. Creá el primero.
        </div>
      )}

      {/* Módulos Pro bloqueados — upsell para profesional */}
      {lockedMods.length > 0 && (
        <>
          <div className="locked-section-label">
            <span>Módulos Pro</span>
            <span className="lock-badge">Plan Pro</span>
          </div>
          <div className="mod-grid">
            {lockedMods.map((m) => (
              <div key={m.id} className="mod-card-locked" onClick={() => onUpgrade('module', m.name)}>
                <div className="mc-bar" style={{ background: 'var(--border)' }} />
                <div className="mc-icon" style={{ background: 'var(--border2)', opacity: 0.6 }}>{m.icon}</div>
                <div className="mc-name" style={{ color: 'var(--text3)' }}>{m.name}</div>
                <div className="mc-sub">{m.sub}</div>
                <div className="lock-overlay"><LockIcon /></div>
              </div>
            ))}
          </div>
          <div className="upsell-cta">
            <div className="upsell-text">
              <h4>Desbloqueá {lockedMods.map(m => m.name).join(', ')}</h4>
              <p>Actualizá a Pro para acceder a todas las herramientas profesionales.</p>
            </div>
            <button className="upsell-btn" onClick={() => onUpgrade('general')}>Ver planes →</button>
          </div>
        </>
      )}

      <ObraFormModal
        open={showForm}
        obra={null}
        onSave={handleCreate}
        onClose={() => setShowForm(false)}
      />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FLUJO 2 — INSTALADOR / OFICIOS
// ═══════════════════════════════════════════════════════════════

function DashboardInstalador({ onOpen, user, onUpgrade }) {
  const rubro = user?.rubro || 'sanitario';
  const hero  = RUBRO_HERO[rubro] || RUBRO_HERO['sanitario'];
  const heroMod = ALL_MODULES.find(m => m.id === hero.modId);
  const plan = getUserPlan(user);

  const unlockedMods = ALL_MODULES.filter(m =>
    canAccessModule(user, m.id) && m.id !== hero.modId
  );
  const lockedMods = ALL_MODULES.filter(m => !canAccessModule(user, m.id));

  const totalFacturado = MOCK_QUOTES.reduce((s, q) => s + q.total, 0);
  const aprobadas = MOCK_QUOTES.filter(q => q.status === 'aprobado').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <div className="dash-greeting">Panel de Control</div>
      <div className="dash-sub">Cotizaciones y herramientas · Instalador</div>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-big" style={{ color: "var(--green)" }}>{MOCK_QUOTES.length}</div>
          <div className="stat-label">Cotizaciones</div>
        </div>
        <div className="stat-card">
          <div className="stat-big" style={{ color: "var(--accent)" }}>{aprobadas}</div>
          <div className="stat-label">Aprobadas</div>
        </div>
        <div className="stat-card">
          <div className="stat-big" style={{ color: "var(--text)", fontSize: 24 }}>
            {fmtPeso(totalFacturado / 1000)}K
          </div>
          <div className="stat-label">Facturado est.</div>
        </div>
      </div>

      {/* Hero CTA */}
      <motion.div
        className="hero-cta-card"
        onClick={() => heroMod && onOpen(heroMod)}
        whileTap={{ scale: 0.98 }}
      >
        <div className="hero-cta-left">
          <h2>{hero.cta}</h2>
          <p>{hero.desc}</p>
        </div>
        <button className="hero-cta-btn">Calcular →</button>
      </motion.div>

      {/* Tabla de cotizaciones */}
      <div className="quotes-table-wrap">
        <div className="quotes-table-header">
          <div className="quotes-table-title">Últimas cotizaciones</div>
          <button className="quote-action-link">Ver todas →</button>
        </div>
        <table className="quotes-table">
          <thead>
            <tr>
              <th>Cliente / Dirección</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {MOCK_QUOTES.map((q, i) => (
              <motion.tr
                key={q.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18, delay: i * 0.04 }}
              >
                <td>
                  <div className="quote-client">{q.client}</div>
                  <div className="quote-address">{q.address}</div>
                </td>
                <td style={{ color: 'var(--text2)', fontSize: 12 }}>{q.date}</td>
                <td><span className="quote-total">{fmtPeso(q.total)}</span></td>
                <td>
                  <span className={`quote-status quote-status-${q.status}`}>
                    {{ enviado: 'Enviado', aprobado: 'Aprobado', pendiente: 'Pendiente' }[q.status]}
                  </span>
                </td>
                <td>
                  <button className="quote-action">PDF · WhatsApp</button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Otros módulos desbloqueados */}
      {unlockedMods.length > 0 && (
        <>
          <div className="dash-section-label">Otros módulos</div>
          <div className="mod-grid">
            {unlockedMods.map((m, i) => (
              <motion.div
                key={m.id}
                className="mod-card"
                onClick={() => onOpen(m)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="mc-bar" style={{ background: m.color }} />
                <div className="mc-icon" style={{ background: `${m.color}14` }}>{m.icon}</div>
                <div className="mc-name">{m.name}</div>
                <div className="mc-sub">{m.sub}</div>
                <div className="mc-arrow">→</div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Módulos bloqueados — Upsell */}
      {lockedMods.length > 0 && (
        <>
          <div className="locked-section-label">
            <span>Módulos Pro</span>
            <span className="lock-badge">Plan Pro</span>
          </div>
          <div className="mod-grid">
            {lockedMods.map((m) => (
              <div key={m.id} className="mod-card-locked" onClick={() => onUpgrade('module', m.name)}>
                <div className="mc-bar" style={{ background: 'var(--border)' }} />
                <div className="mc-icon" style={{ background: 'var(--border2)', opacity: 0.6 }}>{m.icon}</div>
                <div className="mc-name" style={{ color: 'var(--text3)' }}>{m.name}</div>
                <div className="mc-sub">{m.sub}</div>
                <div className="lock-overlay"><LockIcon /></div>
              </div>
            ))}
          </div>
          <div className="upsell-cta">
            <div className="upsell-text">
              <h4>Desbloqueá {lockedMods.map(m => m.name).join(', ')}</h4>
              <p>Actualizá a Pro para acceder a todas las herramientas profesionales.</p>
            </div>
            <button className="upsell-btn" onClick={() => onUpgrade('general')}>Ver planes →</button>
          </div>
        </>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Export — switch por rol
// ═══════════════════════════════════════════════════════════════
export default function Dashboard({ onOpen, onNavigate, user, role, onUpgrade }) {
  if (role === 'instalador') {
    return <DashboardInstalador onOpen={onOpen} user={user} onUpgrade={onUpgrade} />;
  }
  return <DashboardProfesional onOpen={onOpen} onNavigate={onNavigate} user={user} onUpgrade={onUpgrade} />;
}
