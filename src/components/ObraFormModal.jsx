import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_MODULES } from '../modules/calculators';

const TIPOS_OBRA = [
  'Vivienda Unifamiliar',
  'Edificio Residencial',
  'Comercial',
  'Industrial',
  'Reforma',
  'Oficinas',
  'Otro',
];

const ESTADOS = [
  { value: 'activo', label: 'Activo' },
  { value: 'presupuesto', label: 'Presupuesto' },
  { value: 'finalizado', label: 'Finalizado' },
];

const AVAILABLE_MODULES = ALL_MODULES.map(m => ({ id: m.id, name: m.name, icon: m.icon }));

export default function ObraFormModal({ open, obra, onSave, onClose }) {
  const nameRef = useRef(null);

  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    cliente: '',
    tipo: 'Vivienda Unifamiliar',
    estado: 'activo',
    presupuesto: 0,
    modulos: [],
  });

  useEffect(() => {
    if (open) {
      if (obra) {
        setForm({
          nombre: obra.nombre || '',
          direccion: obra.direccion || '',
          cliente: obra.cliente || '',
          tipo: obra.tipo || 'Vivienda Unifamiliar',
          estado: obra.estado || 'activo',
          presupuesto: obra.presupuesto || 0,
          modulos: obra.modulos || [],
        });
      } else {
        setForm({
          nombre: '',
          direccion: '',
          cliente: '',
          tipo: 'Vivienda Unifamiliar',
          estado: 'activo',
          presupuesto: 0,
          modulos: [],
        });
      }
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [open, obra]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const toggleMod = (modId) => {
    setForm(prev => ({
      ...prev,
      modulos: prev.modulos.includes(modId)
        ? prev.modulos.filter(id => id !== modId)
        : [...prev.modulos, modId],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    onSave({
      ...form,
      nombre: form.nombre.trim(),
      direccion: form.direccion.trim(),
      cliente: form.cliente.trim(),
      presupuesto: Number(form.presupuesto) || 0,
    });
  };

  const isEdit = !!obra;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-panel"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{isEdit ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
              <button className="modal-close" onClick={onClose} aria-label="Cerrar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="modal-field">
                <label>Nombre del proyecto *</label>
                <input
                  ref={nameRef}
                  type="text"
                  value={form.nombre}
                  onChange={(e) => set('nombre', e.target.value)}
                  placeholder="Ej: Edificio Rosario Centro"
                  required
                />
              </div>

              <div className="modal-row-2">
                <div className="modal-field">
                  <label>Cliente</label>
                  <input
                    type="text"
                    value={form.cliente}
                    onChange={(e) => set('cliente', e.target.value)}
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div className="modal-field">
                  <label>Dirección</label>
                  <input
                    type="text"
                    value={form.direccion}
                    onChange={(e) => set('direccion', e.target.value)}
                    placeholder="Dirección de la obra"
                  />
                </div>
              </div>

              <div className="modal-row-2">
                <div className="modal-field">
                  <label>Tipo de obra</label>
                  <select value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
                    {TIPOS_OBRA.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="modal-field">
                  <label>Estado</label>
                  <select value={form.estado} onChange={(e) => set('estado', e.target.value)}>
                    {ESTADOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="modal-field">
                <label>Presupuesto estimado ($)</label>
                <input
                  type="number"
                  value={form.presupuesto || ''}
                  onChange={(e) => set('presupuesto', e.target.value)}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="modal-field">
                <label>Módulos</label>
                <div className="modal-modules-grid">
                  {AVAILABLE_MODULES.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      className={`modal-mod-chip ${form.modulos.includes(m.id) ? 'active' : ''}`}
                      onClick={() => toggleMod(m.id)}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="modal-btn-secondary" onClick={onClose}>Cancelar</button>
                <button type="submit" className="modal-btn-primary" disabled={!form.nombre.trim()}>
                  {isEdit ? 'Guardar cambios' : 'Crear proyecto'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
