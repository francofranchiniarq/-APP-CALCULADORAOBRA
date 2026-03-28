// ═══════════════════════════════════════════════════════════════
// GanttTaskSheet.jsx — Drawer lateral de edición de tarea
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { daysBetween } from '../utils/ganttCalendar.js';

const DEP_TYPES   = ['FS', 'SS', 'FF', 'SF'];
const DEP_LABELS  = { FS: 'Fin→Inicio', SS: 'Inicio→Inicio', FF: 'Fin→Fin', SF: 'Inicio→Fin' };
const ESTADO_OPTS = [
  { value: '',            label: 'Auto (por progreso)' },
  { value: 'pendiente',   label: 'Pendiente' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'completada',  label: 'Completada' },
  { value: 'retrasada',   label: 'Retrasada' },
];

export default function GanttTaskSheet({
  task,
  open,
  onClose,
  onUpdate,
  onDelete,
  allTasks,
}) {
  const [newDep, setNewDep] = useState({ taskId: '', type: 'FS', lag: 0 });

  if (!task) return null;

  const duration = daysBetween(task.start, task.end) + 1;

  const handle = (field, value) => onUpdate(task.id, { [field]: value });

  const addDep = () => {
    if (!newDep.taskId || newDep.taskId === task.id) return;
    if (task.deps.some(d => d.taskId === newDep.taskId)) return;
    onUpdate(task.id, { deps: [...task.deps, { ...newDep, lag: Number(newDep.lag) }] });
    setNewDep({ taskId: '', type: 'FS', lag: 0 });
  };

  const removeDep = (taskId) => {
    onUpdate(task.id, { deps: task.deps.filter(d => d.taskId !== taskId) });
  };

  const otherTasks = allTasks.filter(t => t.id !== task.id);

  return (
    <>
      {/* Overlay */}
      <div className={`gts-overlay ${open ? 'open' : ''}`} onClick={onClose} />

      {/* Sheet */}
      <div className={`gts-sheet ${open ? 'open' : ''}`}>
        {/* Header */}
        <div className="gts-header">
          <div className="gts-header-left">
            <span className="gts-milestone-badge" style={{ display: task.milestone ? 'flex' : 'none' }}>
              ◆ Hito
            </span>
            <input
              className="gts-name-input"
              value={task.name}
              onChange={e => handle('name', e.target.value)}
              placeholder="Nombre de la tarea"
            />
          </div>
          <button className="gts-close" onClick={onClose}>×</button>
        </div>

        {/* Color strip */}
        <div className="gts-color-strip" style={{ background: task.color }} />

        {/* Body */}
        <div className="gts-body">
          {/* Grupo / Gremio */}
          <div className="gts-row2">
            <div className="gts-field">
              <label className="gts-label">Grupo / Fase</label>
              <input className="gts-input" value={task.group}
                onChange={e => handle('group', e.target.value)} />
            </div>
            <div className="gts-field">
              <label className="gts-label">Gremio</label>
              <input className="gts-input" value={task.gremio}
                onChange={e => handle('gremio', e.target.value)} />
            </div>
          </div>

          {/* Fechas */}
          <div className="gts-row2">
            <div className="gts-field">
              <label className="gts-label">Inicio</label>
              <input type="date" className="gts-input"
                value={task.start}
                onChange={e => handle('start', e.target.value)} />
            </div>
            <div className="gts-field">
              <label className="gts-label">Fin</label>
              <input type="date" className="gts-input"
                value={task.end}
                onChange={e => handle('end', e.target.value)} />
            </div>
          </div>

          {/* Duración (readonly) */}
          <div className="gts-field">
            <label className="gts-label">Duración</label>
            <div className="gts-readonly">{duration} días calendario</div>
          </div>

          {/* Progreso */}
          <div className="gts-field">
            <div className="gts-label-row">
              <label className="gts-label">Progreso</label>
              <span className="gts-progress-val">{task.progress}%</span>
            </div>
            <input
              type="range" min="0" max="100" step="5"
              className="gts-range"
              value={task.progress}
              onChange={e => handle('progress', Number(e.target.value))}
            />
            <div className="gts-progress-bar-wrap">
              <div className="gts-progress-bar-fill"
                style={{ width: `${task.progress}%`, background: task.color }} />
            </div>
          </div>

          {/* Estado */}
          <div className="gts-field">
            <label className="gts-label">Estado</label>
            <select className="gts-select"
              value={task.estado || ''}
              onChange={e => handle('estado', e.target.value || null)}>
              {ESTADO_OPTS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div className="gts-field">
            <label className="gts-label">Color de barra</label>
            <div className="gts-color-row">
              <input type="color" className="gts-color-input"
                value={task.color}
                onChange={e => handle('color', e.target.value)} />
              <span className="gts-color-hex">{task.color}</span>
            </div>
          </div>

          {/* Hito toggle */}
          <div className="gts-field">
            <label className="gts-toggle-label">
              <input type="checkbox"
                checked={task.milestone || false}
                onChange={e => handle('milestone', e.target.checked)}
                className="gts-checkbox"
              />
              <span>Marcar como hito (◆)</span>
            </label>
          </div>

          {/* Dependencias */}
          <div className="gts-section-title">Dependencias</div>
          {task.deps && task.deps.length > 0 ? (
            <div className="gts-deps-list">
              {task.deps.map(dep => {
                const pred = allTasks.find(t => t.id === dep.taskId);
                return (
                  <div key={dep.taskId} className="gts-dep-item">
                    <span className="gts-dep-name">{pred?.name || dep.taskId}</span>
                    <span className="gts-dep-type">{dep.type}</span>
                    {dep.lag !== 0 && (
                      <span className="gts-dep-lag">{dep.lag > 0 ? `+${dep.lag}d` : `${dep.lag}d`}</span>
                    )}
                    <button className="gts-dep-remove" onClick={() => removeDep(dep.taskId)}>×</button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="gts-empty-deps">Sin dependencias</div>
          )}

          {/* Agregar dependencia */}
          <div className="gts-add-dep">
            <select className="gts-select gts-dep-task-sel"
              value={newDep.taskId}
              onChange={e => setNewDep(d => ({ ...d, taskId: e.target.value }))}>
              <option value="">Seleccionar predecesora…</option>
              {otherTasks.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <select className="gts-select gts-dep-type-sel"
              value={newDep.type}
              onChange={e => setNewDep(d => ({ ...d, type: e.target.value }))}>
              {DEP_TYPES.map(tp => (
                <option key={tp} value={tp}>{tp} — {DEP_LABELS[tp]}</option>
              ))}
            </select>
            <div className="gts-dep-lag-row">
              <input type="number" className="gts-input gts-dep-lag-input"
                value={newDep.lag}
                onChange={e => setNewDep(d => ({ ...d, lag: Number(e.target.value) }))}
                placeholder="Lag (días)"
              />
              <button className="gts-add-dep-btn" onClick={addDep}
                disabled={!newDep.taskId}>
                + Agregar
              </button>
            </div>
          </div>

          {/* Notas */}
          <div className="gts-field">
            <label className="gts-label">Notas</label>
            <textarea className="gts-textarea"
              value={task.notes || ''}
              onChange={e => handle('notes', e.target.value)}
              rows={3}
              placeholder="Observaciones, materiales, condiciones especiales…"
            />
          </div>

          {/* CPM info (readonly) */}
          {task._cpm && (
            <div className="gts-cpm-info">
              <div className="gts-cpm-title">Análisis CPM</div>
              <div className="gts-cpm-row">
                <span>Inicio libre</span>
                <strong>ES+{task._cpm.es}d</strong>
              </div>
              <div className="gts-cpm-row">
                <span>Holgura total</span>
                <strong style={{ color: task._cpm.float <= 0 ? '#B91C1C' : '#15803D' }}>
                  {task._cpm.float} día{task._cpm.float !== 1 ? 's' : ''}
                </strong>
              </div>
              <div className="gts-cpm-row">
                <span>Ruta crítica</span>
                <strong style={{ color: task._cpm.critical ? '#B91C1C' : '#15803D' }}>
                  {task._cpm.critical ? '⚠ Sí' : '✓ No'}
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="gts-footer">
          <button className="gts-delete-btn" onClick={() => { onDelete(task.id); onClose(); }}>
            Eliminar tarea
          </button>
          <button className="gts-done-btn" onClick={onClose}>
            Listo ✓
          </button>
        </div>
      </div>
    </>
  );
}
