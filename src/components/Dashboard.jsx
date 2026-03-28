import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_MODULES } from '../modules/calculators';

// ═══════════════════════════════════════════════════════════════
// Mock data — reemplazar por API cuando exista backend
// ═══════════════════════════════════════════════════════════════

const MOCK_PROJECTS = [
  {
    id: 1, name: "Edificio Rosario Centro", type: "Edificio Residencial",
    status: "activo", budget: 185000000, progress: 65, lastUpdate: "hace 2 días",
    modules: ['estruct', 'agua', 'cloacal', 'gas', 'electrico', 'presup', 'gantt'],
  },
  {
    id: 2, name: "Casa Ibarlucea", type: "Vivienda Unifamiliar",
    status: "activo", budget: 42000000, progress: 30, lastUpdate: "hace 1 semana",
    modules: ['agua', 'cloacal', 'electrico', 'presup'],
  },
  {
    id: 3, name: "Local Comercial Pellegrini", type: "Comercial",
    status: "presupuesto", budget: 28000000, progress: 0, lastUpdate: "hace 3 días",
    modules: ['electrico', 'termo', 'presup'],
  },
  {
    id: 4, name: "Refacción PH Pichincha", type: "Reforma",
    status: "finalizado", budget: 15000000, progress: 100, lastUpdate: "hace 2 semanas",
    modules: ['seco', 'agua', 'presup'],
  },
];

const MOCK_QUOTES = [
  { id: 1, client: "García, Familia",      address: "Av. Pellegrini 1240", date: "25/03/2026", total: 485000,  status: "enviado"   },
  { id: 2, client: "Martínez, Roberto",    address: "San Martín 780",      date: "22/03/2026", total: 320000,  status: "aprobado"  },
  { id: 3, client: "López Construcciones", address: "Córdoba 2100",        date: "18/03/2026", total: 1240000, status: "pendiente" },
  { id: 4, client: "Sánchez, María",       address: "Bv. Oroño 450",       date: "15/03/2026", total: 195000,  status: "enviado"   },
];

// Módulos desbloqueados para instalador (resto = upsell)
const INSTALADOR_UNLOCKED = ['gas', 'agua', 'cloacal', 'seco', 'electrico', 'termo', 'presup'];
const INSTALADOR_LOCKED   = ['estruct', 'gantt'];

// Hero CTA por rubro del instalador
const RUBRO_HERO = {
  sanitario:     { modId: 'gas',       cta: 'Nueva Cotización de Gas',        desc: 'NAG 200 · Renouard · Cómputo de accesorios' },
  seco:          { modId: 'seco',      cta: 'Nueva Cotización de Durlock',    desc: 'Placas · Perfilería · Tornillería completa' },
  electrico:     { modId: 'electrico', cta: 'Nueva Cotización Eléctrica',     desc: 'Conductores · Protecciones · Luminotecnia' },
  termomecanico: { modId: 'termo',     cta: 'Nueva Cotización Termomecánica', desc: 'Balance térmico · Selección de equipos' },
};

// ═══ Utilidades ═══
const fmtPeso = (n) => '$ ' + n.toLocaleString('es-AR', { maximumFractionDigits: 0 });

// ═══════════════════════════════════════════════════════════════
// FLUJO 1 — PROFESIONAL / CONSTRUCTORA
// ═══════════════════════════════════════════════════════════════

function ProjectCard({ project, onClick, index }) {
  const statusMap = {
    activo:      { cls: 'proj-status-activo',      label: 'Activo'       },
    presupuesto: { cls: 'proj-status-presupuesto',  label: 'Presupuesto'  },
    finalizado:  { cls: 'proj-status-finalizado',   label: 'Finalizado'   },
  };
  const { cls, label } = statusMap[project.status] || {};

  return (
    <motion.div
      className="proj-card"
      onClick={() => onClick(project)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="proj-card-top">
        <div className="proj-type">{project.type}</div>
        <span className={`proj-status-pill ${cls}`}>{label}</span>
      </div>
      <div className="proj-name">{project.name}</div>
      <div className="proj-update">Actualizado {project.lastUpdate}</div>
      <div className="proj-progress-bar">
        <div className="proj-progress-fill" style={{ width: `${project.progress}%` }} />
      </div>
      <div className="proj-progress-row">
        <span className="proj-progress-label">{project.progress}% completado</span>
        <span className="proj-budget">{fmtPeso(project.budget)}</span>
      </div>
    </motion.div>
  );
}

function ProjectModulesView({ project, onOpen, onBack }) {
  const mods = ALL_MODULES.filter(m => project.modules.includes(m.id));
  return (
    <motion.div
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -14 }}
      transition={{ duration: 0.22 }}
    >
      <button className="calc-back" onClick={onBack}>← Volver a proyectos</button>

      <div className="proj-context-bar">
        <div className="proj-context-info">
          <div className="proj-context-name">{project.name}</div>
          <div className="proj-context-meta">{project.type} · {project.progress}% completado</div>
        </div>
        <span className={`proj-status-pill ${project.status === 'activo' ? 'proj-status-activo' : 'proj-status-finalizado'}`}>
          {project.status === 'activo' ? 'Activo' : 'Finalizado'}
        </span>
      </div>

      <div className="dash-section-label">Módulos de esta obra</div>
      <div className="mod-grid">
        {mods.map((m, i) => (
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
    </motion.div>
  );
}

function DashboardProfesional({ onOpen }) {
  const [selectedProject, setSelectedProject] = useState(null);

  const activeCount  = MOCK_PROJECTS.filter(p => p.status === 'activo').length;
  const presupCount  = MOCK_PROJECTS.filter(p => p.status === 'presupuesto').length;
  const totalBudget  = MOCK_PROJECTS.filter(p => p.status !== 'finalizado')
                                    .reduce((s, p) => s + p.budget, 0);

  return (
    <AnimatePresence mode="wait">
      {selectedProject ? (
        <ProjectModulesView
          key="detail"
          project={selectedProject}
          onOpen={onOpen}
          onBack={() => setSelectedProject(null)}
        />
      ) : (
        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className="dash-greeting">Panel de Control</div>
          <div className="dash-sub">Gestión de proyectos · Arquitectura y Construcción</div>

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
                {fmtPeso(totalBudget / 1000000)}M
              </div>
              <div className="stat-label">Costo total est.</div>
            </div>
          </div>

          <div className="dash-section-label">Mis proyectos</div>
          <div className="proj-grid">
            {MOCK_PROJECTS.map((p, i) => (
              <ProjectCard key={p.id} project={p} onClick={setSelectedProject} index={i} />
            ))}
            <motion.div
              className="proj-card proj-card-new"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: MOCK_PROJECTS.length * 0.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="proj-card-new-inner">
                <div className="proj-card-new-icon">+</div>
                <div className="proj-card-new-label">Nuevo proyecto</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// FLUJO 2 — INSTALADOR / OFICIOS
// ═══════════════════════════════════════════════════════════════

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

function DashboardInstalador({ onOpen, user }) {
  const rubro = user?.rubro || 'sanitario';
  const hero  = RUBRO_HERO[rubro] || RUBRO_HERO['sanitario'];
  const heroMod = ALL_MODULES.find(m => m.id === hero.modId);

  const unlockedMods = ALL_MODULES.filter(m =>
    INSTALADOR_UNLOCKED.includes(m.id) && m.id !== hero.modId
  );
  const lockedMods = ALL_MODULES.filter(m => INSTALADOR_LOCKED.includes(m.id));

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
            <span className="lock-badge">Plan Superior</span>
          </div>
          <div className="mod-grid">
            {lockedMods.map((m) => (
              <div key={m.id} className="mod-card-locked">
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
              <h4>Desbloqueá Estructuras y Cronograma de Obra</h4>
              <p>Calculá losas, encofrado, acero y planificá con Gantt. Plan Profesional.</p>
            </div>
            <button className="upsell-btn">Ver planes →</button>
          </div>
        </>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Export — switch por rol
// ═══════════════════════════════════════════════════════════════
export default function Dashboard({ onOpen, user, role }) {
  if (role === 'instalador') {
    return <DashboardInstalador onOpen={onOpen} user={user} />;
  }
  return <DashboardProfesional onOpen={onOpen} />;
}
