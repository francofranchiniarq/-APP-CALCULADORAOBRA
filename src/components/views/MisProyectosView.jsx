import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getObras, crearObra, editarObra, eliminarObra } from '../../modules/obras';
import { fmtPeso } from '../../data/mockData';
import { getUserPlan, canCreateProject } from '../../modules/plans';
import ObraFormModal from '../ObraFormModal';
import ConfirmModal from '../ConfirmModal';

const STATUS_MAP = {
  activo:      { cls: 'proj-status-activo',     label: 'Activo'      },
  presupuesto: { cls: 'proj-status-presupuesto', label: 'Presupuesto' },
  finalizado:  { cls: 'proj-status-finalizado',  label: 'Finalizado'  },
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

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

export default function MisProyectosView({ onNavigate, user, onUpgrade }) {
  const [obras, setObras] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingObra, setEditingObra] = useState(null);
  const [deletingObra, setDeletingObra] = useState(null);
  const plan = getUserPlan(user);

  const loadObras = useCallback(() => {
    setObras(getObras());
  }, []);

  useEffect(() => { loadObras(); }, [loadObras]);

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

  const handleEdit = (formData) => {
    editarObra(editingObra.id, formData);
    loadObras();
    setEditingObra(null);
  };

  const handleDelete = () => {
    eliminarObra(deletingObra.id);
    loadObras();
    setDeletingObra(null);
  };

  const openEdit = (e, obra) => {
    e.stopPropagation();
    setEditingObra(obra);
  };

  const openDelete = (e, obra) => {
    e.stopPropagation();
    setDeletingObra(obra);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
    >
      <div className="dash-greeting">Mis Proyectos</div>
      <div className="dash-sub">
        {obras.length === 0
          ? 'Creá tu primer proyecto para empezar'
          : `${obras.length} proyecto${obras.length !== 1 ? 's' : ''} en total`
        }
        {plan.maxProjects !== Infinity && (
          <span className="dash-plan-badge" style={{ background: 'var(--bg)', color: 'var(--text3)', marginLeft: 8 }}>
            {obras.length}/{plan.maxProjects} del plan {plan.label}
          </span>
        )}
      </div>

      <div className="projects-list">
        {obras.map((obra, i) => {
          const { cls, label } = STATUS_MAP[obra.estado] || { cls: '', label: obra.estado || 'Activo' };
          return (
            <motion.div
              key={obra.id}
              className="project-row"
              onClick={() => onNavigate('proyecto-detalle', { project: obra })}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: i * 0.04 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="project-row-left">
                <div className="project-row-name">{obra.nombre}</div>
                <div className="project-row-meta">
                  {obra.tipo || 'Obra'} · {obra.cliente ? `${obra.cliente} · ` : ''}Actualizado {timeAgo(obra.actualizada)}
                </div>
                <div className="proj-progress-bar" style={{ marginTop: 8, maxWidth: 220 }}>
                  <div className="proj-progress-fill" style={{ width: `${obra.avance || 0}%` }} />
                </div>
              </div>
              <div className="project-row-right">
                <span className={`proj-status-pill ${cls}`}>{label}</span>
                <div className="project-row-budget">{fmtPeso(obra.presupuesto || 0)}</div>
                <div className="project-row-progress">{obra.avance || 0}% completado</div>
              </div>
              <div className="project-row-actions">
                <button className="proj-action-btn" onClick={(e) => openEdit(e, obra)} title="Editar">
                  <EditIcon />
                </button>
                <button className="proj-action-btn danger" onClick={(e) => openDelete(e, obra)} title="Eliminar">
                  <TrashIcon />
                </button>
              </div>
            </motion.div>
          );
        })}

        <motion.div
          className="project-row project-row-new"
          onClick={handleNewProject}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, delay: obras.length * 0.04 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="project-row-new-icon">+</div>
          <div className="project-row-new-label">Crear nuevo proyecto</div>
        </motion.div>
      </div>

      <ObraFormModal
        open={showForm}
        obra={null}
        onSave={handleCreate}
        onClose={() => setShowForm(false)}
      />

      <ObraFormModal
        open={!!editingObra}
        obra={editingObra}
        onSave={handleEdit}
        onClose={() => setEditingObra(null)}
      />

      <ConfirmModal
        open={!!deletingObra}
        title="Eliminar proyecto"
        message={`¿Estás seguro de que querés eliminar "${deletingObra?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar proyecto"
        onConfirm={handleDelete}
        onClose={() => setDeletingObra(null)}
      />
    </motion.div>
  );
}
