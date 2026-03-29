import { useState } from 'react';
import { motion } from 'framer-motion';
import { ALL_MODULES } from '../../modules/calculators';
import { editarObra, eliminarObra } from '../../modules/obras';
import { fmtPeso } from '../../data/mockData';
import { canAccessModule } from '../../modules/plans';
import ObraFormModal from '../ObraFormModal';
import ConfirmModal from '../ConfirmModal';

const SmallLockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function DetalleProyectoView({ project, onNavigate, onModuleOpen, user }) {
  const [obra, setObra] = useState(project);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  if (!obra) {
    onNavigate('proyectos');
    return null;
  }

  const mods = ALL_MODULES.filter(m => (obra.modulos || obra.modules || []).includes(m.id));
  const statusCls = {
    activo:      'proj-status-activo',
    presupuesto: 'proj-status-presupuesto',
    finalizado:  'proj-status-finalizado',
  }[obra.estado || obra.status] || '';
  const statusLabel = {
    activo: 'Activo',
    presupuesto: 'Presupuesto',
    finalizado: 'Finalizado',
  }[obra.estado || obra.status] || '';

  const nombre = obra.nombre || obra.name || 'Proyecto';
  const tipo = obra.tipo || obra.type || 'Obra';
  const avance = obra.avance ?? obra.progress ?? 0;
  const presupuesto = obra.presupuesto ?? obra.budget ?? 0;

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
          <div className="proj-context-name">{nombre}</div>
          <div className="proj-context-meta">
            {tipo} · {avance}% completado · {fmtPeso(presupuesto)}
            {obra.cliente ? ` · ${obra.cliente}` : ''}
            {obra.direccion ? ` · ${obra.direccion}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`proj-status-pill ${statusCls}`}>{statusLabel}</span>
          <button className="proj-action-btn" onClick={() => setShowEdit(true)} title="Editar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button className="proj-action-btn danger" onClick={() => setShowDelete(true)} title="Eliminar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="proj-progress-bar" style={{ marginBottom: 20 }}>
        <div className="proj-progress-fill" style={{ width: `${avance}%` }} />
      </div>

      {mods.length > 0 ? (
        <>
          <div className="dash-section-label">Módulos de esta obra</div>
          <div className="mod-grid">
            {mods.map((m, i) => {
              const locked = !canAccessModule(user, m.id);
              return (
                <motion.div
                  key={m.id}
                  className={locked ? 'mod-card-locked' : 'mod-card'}
                  onClick={() => onModuleOpen(m, obra)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="mc-bar" style={{ background: locked ? 'var(--border)' : m.color }} />
                  <div className="mc-icon" style={{ background: locked ? 'var(--border2)' : `${m.color}14`, opacity: locked ? 0.6 : 1 }}>{m.icon}</div>
                  <div className="mc-name" style={locked ? { color: 'var(--text3)' } : {}}>{m.name}</div>
                  <div className="mc-sub">{m.sub}</div>
                  {locked ? (
                    <div className="mc-lock-badge"><SmallLockIcon /> Pro</div>
                  ) : (
                    <div className="mc-arrow">→</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)', fontSize: 13, fontWeight: 600 }}>
          Este proyecto no tiene módulos asignados. Editá el proyecto para agregar módulos.
        </div>
      )}

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
