import { motion } from 'framer-motion';
import { ALL_MODULES } from '../../modules/calculators';
import { fmtPeso } from '../../data/mockData';

export default function DetalleProyectoView({ project, onNavigate, onModuleOpen }) {
  if (!project) {
    onNavigate('proyectos');
    return null;
  }

  const mods = ALL_MODULES.filter(m => project.modules.includes(m.id));
  const statusCls = {
    activo:      'proj-status-activo',
    presupuesto: 'proj-status-presupuesto',
    finalizado:  'proj-status-finalizado',
  }[project.status] || '';
  const statusLabel = { activo: 'Activo', presupuesto: 'Presupuesto', finalizado: 'Finalizado' }[project.status] || '';

  return (
    <motion.div
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -14 }}
      transition={{ duration: 0.22 }}
    >
      <button className="calc-back" onClick={() => onNavigate('proyectos')}>← Volver a proyectos</button>

      <div className="proj-context-bar">
        <div className="proj-context-info">
          <div className="proj-context-name">{project.name}</div>
          <div className="proj-context-meta">
            {project.type} · {project.progress}% completado · {fmtPeso(project.budget)}
          </div>
        </div>
        <span className={`proj-status-pill ${statusCls}`}>{statusLabel}</span>
      </div>

      <div className="proj-progress-bar" style={{ marginBottom: 20 }}>
        <div className="proj-progress-fill" style={{ width: `${project.progress}%` }} />
      </div>

      <div className="dash-section-label">Módulos de esta obra</div>
      <div className="mod-grid">
        {mods.map((m, i) => (
          <motion.div
            key={m.id}
            className="mod-card"
            onClick={() => onModuleOpen(m, project)}
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
