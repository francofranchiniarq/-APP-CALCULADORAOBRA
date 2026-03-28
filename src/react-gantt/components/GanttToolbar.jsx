// ═══════════════════════════════════════════════════════════════
// GanttToolbar.jsx — Dos filas de controles del Gantt
// ═══════════════════════════════════════════════════════════════

const ZoomIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);

const ZOOM_LABELS = { month: 'Mes', week: 'Semana', day: 'Día' };
const ZOOM_ORDER  = ['month', 'week', 'day'];

const ESTADO_COLORS = {
  completada:  '#15803D',
  en_progreso: '#1D4ED8',
  pendiente:   '#B45309',
  retrasada:   '#B91C1C',
};

export default function GanttToolbar({
  obraName,
  zoom, setZoom,
  filterGremio, setFilterGremio, allGremios,
  showCritical, setShowCritical,
  collapsedGroups, groupOrder,
  collapseAll, expandAll,
  onAutoSchedule,
  onAddTask,
  onSave,
  onBack,
  tasks,
}) {
  const today        = new Date();
  const totalTasks   = tasks.filter(t => t._cpm !== undefined || true).length;
  const doneCount    = tasks.filter(t => t.progress === 100).length;
  const criticalCount = tasks.filter(t => t._cpm?.critical).length;
  const allCollapsed = groupOrder.length > 0 && collapsedGroups.size === groupOrder.length;

  return (
    <div className="gt-toolbar">
      {/* ── Fila 1: título + zoom + acciones ── */}
      <div className="gt-toolbar-row1">
        <div className="gt-toolbar-left">
          {onBack && (
            <button className="gt-btn-back" onClick={onBack}>←</button>
          )}
          <div className="gt-obra-name">{obraName || 'Cronograma de Obra'}</div>
          <div className="gt-obra-meta">
            {doneCount}/{totalTasks} tareas · {criticalCount} críticas
          </div>
        </div>

        <div className="gt-toolbar-right">
          {/* Zoom pills */}
          <div className="gt-zoom-group">
            {ZOOM_ORDER.map(z => (
              <button
                key={z}
                className={`gt-zoom-btn ${zoom === z ? 'active' : ''}`}
                onClick={() => setZoom(z)}
              >
                {ZOOM_LABELS[z]}
              </button>
            ))}
          </div>

          <button className="gt-btn-secondary" onClick={onAutoSchedule} title="Recalcular fechas según dependencias">
            ⟳ Auto-schedule
          </button>
          <button className="gt-btn-primary" onClick={onAddTask}>
            + Tarea
          </button>
          {onSave && (
            <button className="gt-btn-secondary" onClick={onSave}>
              ↑ Guardar
            </button>
          )}
        </div>
      </div>

      {/* ── Fila 2: filtros + leyenda ── */}
      <div className="gt-toolbar-row2">
        <div className="gt-filter-group">
          {/* Filtro por gremio */}
          <select
            className="gt-select"
            value={filterGremio || ''}
            onChange={e => setFilterGremio(e.target.value || null)}
          >
            <option value="">Todos los gremios</option>
            {allGremios.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* Ruta crítica toggle */}
          <button
            className={`gt-toggle-btn ${showCritical ? 'active-critical' : ''}`}
            onClick={() => setShowCritical(v => !v)}
          >
            <span className="gt-critical-dot" />
            Ruta crítica
          </button>

          {/* Colapsar grupos */}
          <button
            className="gt-toggle-btn"
            onClick={allCollapsed ? expandAll : collapseAll}
          >
            {allCollapsed ? '▶ Expandir todo' : '▼ Colapsar todo'}
          </button>
        </div>

        {/* Leyenda de estados */}
        <div className="gt-legend">
          {Object.entries(ESTADO_COLORS).map(([estado, color]) => (
            <span key={estado} className="gt-legend-item">
              <span className="gt-legend-dot" style={{ background: color }} />
              {estado.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
