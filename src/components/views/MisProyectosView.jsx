import { motion } from 'framer-motion';
import { MOCK_PROJECTS, fmtPeso } from '../../data/mockData';

const STATUS_MAP = {
  activo:      { cls: 'proj-status-activo',     label: 'Activo'      },
  presupuesto: { cls: 'proj-status-presupuesto', label: 'Presupuesto' },
  finalizado:  { cls: 'proj-status-finalizado',  label: 'Finalizado'  },
};

export default function MisProyectosView({ onNavigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
    >
      <div className="dash-greeting">Mis Proyectos</div>
      <div className="dash-sub">Listado completo de obras</div>

      <div className="projects-list">
        {MOCK_PROJECTS.map((p, i) => {
          const { cls, label } = STATUS_MAP[p.status] || {};
          return (
            <motion.div
              key={p.id}
              className="project-row"
              onClick={() => onNavigate('proyecto-detalle', { project: p })}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: i * 0.04 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="project-row-left">
                <div className="project-row-name">{p.name}</div>
                <div className="project-row-meta">{p.type} · Actualizado {p.lastUpdate}</div>
                <div className="proj-progress-bar" style={{ marginTop: 8, maxWidth: 220 }}>
                  <div className="proj-progress-fill" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
              <div className="project-row-right">
                <span className={`proj-status-pill ${cls}`}>{label}</span>
                <div className="project-row-budget">{fmtPeso(p.budget)}</div>
                <div className="project-row-progress">{p.progress}% completado</div>
              </div>
              <div className="project-row-arrow">→</div>
            </motion.div>
          );
        })}

        <motion.div
          className="project-row project-row-new"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, delay: MOCK_PROJECTS.length * 0.04 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="project-row-new-icon">+</div>
          <div className="project-row-new-label">Crear nuevo proyecto</div>
        </motion.div>
      </div>
    </motion.div>
  );
}
