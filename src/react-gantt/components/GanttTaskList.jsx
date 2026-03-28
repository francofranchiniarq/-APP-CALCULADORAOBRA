// ═══════════════════════════════════════════════════════════════
// GanttTaskList.jsx — Panel izquierdo: columnas editables de tareas
// ═══════════════════════════════════════════════════════════════

import { ROW_H } from '../utils/ganttColumns.js';

const ESTADO_COLOR = {
  completada:  '#15803D',
  en_progreso: '#1D4ED8',
  pendiente:   '#B45309',
  retrasada:   '#B91C1C',
};

function computeEstado(task) {
  if (task.estado) return task.estado;
  if (task.progress === 100) return 'completada';
  if (task.progress > 0)     return 'en_progreso';
  return 'pendiente';
}

function formatShortDate(str) {
  if (!str) return '—';
  const [, m, d] = str.split('-');
  return `${d}/${m}`;
}

// ── Fila de grupo ─────────────────────────────────────────────
function GroupRow({ row, onClick }) {
  return (
    <div
      className="gtl-group-row"
      style={{ height: ROW_H }}
      onClick={() => onClick(row.group)}
    >
      <span className="gtl-group-chevron">{row.isCollapsed ? '▶' : '▼'}</span>
      <span className="gtl-group-name">{row.group}</span>
      <span className="gtl-group-count">{row.count}</span>
    </div>
  );
}

// ── Fila de tarea ─────────────────────────────────────────────
function TaskRow({ row, isSelected, onClick }) {
  const estado = computeEstado(row);
  const dotColor = ESTADO_COLOR[estado] || '#908B85';
  const isMilestone = row.milestone;

  return (
    <div
      className={`gtl-task-row ${isSelected ? 'selected' : ''}`}
      style={{ height: ROW_H, borderLeft: `3px solid ${row.color || '#D4CFC8'}` }}
      onClick={() => onClick(row.id)}
    >
      {/* Nombre */}
      <div className="gtl-task-name-cell">
        {isMilestone && <span className="gtl-milestone-icon">◆</span>}
        <span className="gtl-task-name" title={row.name}>{row.name}</span>
      </div>

      {/* Gremio */}
      <div className="gtl-task-gremio" title={row.gremio}>
        {row.gremio}
      </div>

      {/* Inicio */}
      <div className="gtl-task-date">{formatShortDate(row.start)}</div>

      {/* Fin */}
      <div className="gtl-task-date">{formatShortDate(row.end)}</div>

      {/* % + dot */}
      <div className="gtl-task-pct">
        <span className="gtl-estado-dot" style={{ background: dotColor }} />
        <span>{row.progress}%</span>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function GanttTaskList({
  visibleRows,
  selectedId,
  onSelectTask,
  onToggleGroup,
  scrollRef,
  onScroll,
}) {
  return (
    <div className="gtl-panel">
      {/* Header */}
      <div className="gtl-header">
        <div className="gtl-th gtl-th-name">Tarea</div>
        <div className="gtl-th gtl-th-gremio">Gremio</div>
        <div className="gtl-th gtl-th-date">Inicio</div>
        <div className="gtl-th gtl-th-date">Fin</div>
        <div className="gtl-th gtl-th-pct">%</div>
      </div>

      {/* Rows */}
      <div className="gtl-rows" ref={scrollRef} onScroll={onScroll}>
        {visibleRows.map((row, i) =>
          row.type === 'group' ? (
            <GroupRow key={`g-${row.group}`} row={row} onClick={onToggleGroup} />
          ) : (
            <TaskRow
              key={row.id}
              row={row}
              isSelected={selectedId === row.id}
              onClick={onSelectTask}
            />
          )
        )}
      </div>
    </div>
  );
}
