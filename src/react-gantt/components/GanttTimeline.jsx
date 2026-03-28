// ═══════════════════════════════════════════════════════════════
// GanttTimeline.jsx — Panel derecho: barras + flechas SVG
// Soporta drag-to-move y drag-to-resize con mouse events
// ═══════════════════════════════════════════════════════════════

import { useRef, useState, useEffect, useCallback } from 'react';
import { ROW_H, HEADER_H, dateToX } from '../utils/ganttColumns.js';
import { daysBetween, addCalendarDays, formatDate, today } from '../utils/ganttCalendar.js';

// ── Helpers de posición ───────────────────────────────────────
function getBarX(task, tlStart, dw) {
  return dateToX(task.start, tlStart, dw);
}
function getBarW(task, dw) {
  return Math.max(dw, (daysBetween(task.start, task.end) + 1) * dw);
}
function getBarY(rowIdx) {
  return rowIdx * ROW_H + Math.floor((ROW_H - 22) / 2);
}

// ── Camino SVG para flechas de dependencias ───────────────────
function arrowPath(x1, y1, x2, y2) {
  const STUB = 8;
  const MID_H = 4; // radio del codo
  if (x2 > x1 + STUB * 3) {
    const mx = x1 + (x2 - x1) * 0.5;
    return `M${x1},${y1} H${mx} V${y2} H${x2}`;
  } else {
    // dependencia "hacia atrás": rodear por debajo
    const detour = Math.max(x1, x2) + 24;
    return `M${x1},${y1} H${detour} V${y2} H${x2}`;
  }
}

// ── Icono hito (diamante) ─────────────────────────────────────
function MilestoneShape({ cx, cy, color, isSelected }) {
  const s = 9;
  return (
    <polygon
      points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`}
      fill={color}
      stroke={isSelected ? '#fff' : 'transparent'}
      strokeWidth="2"
    />
  );
}

export default function GanttTimeline({
  visibleRows,
  columns,
  timelineBounds,
  selectedId,
  showCritical,
  taskMap,
  onSelectTask,
  onUpdateTask,
  scrollRef,
  onScroll,
}) {
  const { topHeaders, bottomHeaders, totalWidth, dayWidth, dates } = columns;
  const tlStart = timelineBounds.start;

  // Scroll horizontal header en sync con body
  const headerRef  = useRef(null);
  const bodyRef    = useRef(null);
  const dragRef    = useRef(null);
  const [scrollX, setScrollX]         = useState(0);
  const [dragOverride, setDragOverride] = useState(null); // { taskId, start, end }

  // Exponer bodyRef al padre para scroll vertical sync
  useEffect(() => {
    if (scrollRef && bodyRef.current) scrollRef.current = bodyRef.current;
  }, [scrollRef]);

  const handleBodyScroll = useCallback((e) => {
    setScrollX(e.target.scrollLeft);
    if (onScroll) onScroll(e);
  }, [onScroll]);

  // ── Drag ─────────────────────────────────────────────────────
  const handleBarMouseDown = useCallback((e, task, dragType) => {
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = {
      taskId: task.id,
      type:   dragType,
      startClientX: e.clientX,
      origStart:    task.start,
      origEnd:      task.end,
    };
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current) return;
      const { type, startClientX, origStart, origEnd } = dragRef.current;
      const dx    = e.clientX - startClientX;
      const dDays = Math.round(dx / dayWidth);

      if (type === 'move') {
        setDragOverride({
          taskId: dragRef.current.taskId,
          start:  addCalendarDays(origStart, dDays),
          end:    addCalendarDays(origEnd,   dDays),
        });
      } else if (type === 'resize-r') {
        const newEnd = addCalendarDays(origEnd, dDays);
        if (newEnd >= origStart) setDragOverride({ taskId: dragRef.current.taskId, start: origStart, end: newEnd });
      } else if (type === 'resize-l') {
        const newStart = addCalendarDays(origStart, dDays);
        if (newStart <= origEnd) setDragOverride({ taskId: dragRef.current.taskId, start: newStart, end: origEnd });
      }
    };

    const onUp = () => {
      if (!dragRef.current) return;
      if (dragOverride) {
        onUpdateTask(dragOverride.taskId, { start: dragOverride.start, end: dragOverride.end });
      }
      dragRef.current = null;
      setDragOverride(null);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [dayWidth, dragOverride, onUpdateTask]);

  // ── Calcular posición real de una tarea (con override de drag) ──
  const resolveTaskPos = useCallback((task) => {
    if (dragOverride && dragOverride.taskId === task.id) {
      return { start: dragOverride.start, end: dragOverride.end };
    }
    return { start: task.start, end: task.end };
  }, [dragOverride]);

  // ── Mapa rowIndex para flechas ────────────────────────────────
  const rowIndexMap = {};
  visibleRows.forEach((row, i) => {
    if (row.type === 'task') rowIndexMap[row.id] = i;
  });

  const todayStr = formatDate(new Date());
  const todayX   = dateToX(todayStr, tlStart, dayWidth);

  const totalHeight = visibleRows.length * ROW_H;

  return (
    <div className="gt-timeline">
      {/* ── Header (sincronizado horizontalmente) ── */}
      <div className="gt-header-wrap" ref={headerRef} style={{ overflow: 'hidden', flexShrink: 0 }}>
        <div className="gt-header-inner" style={{ width: totalWidth, transform: `translateX(-${scrollX}px)` }}>
          {/* Fila superior: meses */}
          <div className="gt-header-top">
            {topHeaders.map((h, i) => (
              <div key={i} className="gt-th-top" style={{ width: h.width, left: h.x }}>
                {h.label}
              </div>
            ))}
          </div>
          {/* Fila inferior: días/semanas/meses */}
          <div className="gt-header-bottom">
            {bottomHeaders.map((h, i) => (
              <div
                key={i}
                className={`gt-th-bottom ${h.isWeekend ? 'weekend' : ''}`}
                style={{ width: h.width, left: h.x }}
              >
                {h.label}
                {h.subLabel && <span className="gt-th-subLabel">{h.subLabel}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body (scrollable) ── */}
      <div
        className="gt-body-scroll"
        ref={bodyRef}
        onScroll={handleBodyScroll}
      >
        <div className="gt-body-inner" style={{ width: totalWidth, height: totalHeight, position: 'relative' }}>

          {/* Franjas de fondo: weekends */}
          {dates.map((d, i) => {
            const dt  = new Date(d + 'T00:00:00');
            const dow = dt.getDay();
            if (dow !== 0 && dow !== 6) return null;
            return (
              <div
                key={d}
                className="gt-weekend-stripe"
                style={{ left: i * dayWidth, width: dayWidth, height: totalHeight }}
              />
            );
          })}

          {/* Línea de hoy */}
          {todayStr >= timelineBounds.start && todayStr <= timelineBounds.end && (
            <div className="gt-today-line" style={{ left: todayX, height: totalHeight }} />
          )}

          {/* Líneas horizontales de fila */}
          {visibleRows.map((_, i) => (
            <div key={i} className="gt-row-line"
              style={{ top: i * ROW_H + ROW_H - 1, width: totalWidth }} />
          ))}

          {/* Barras y hitos */}
          {visibleRows.map((row, rowIdx) => {
            if (row.type === 'group') {
              // Barra resumen del grupo
              const groupTasks = Object.values(taskMap).filter(t => t.group === row.group);
              if (!groupTasks.length) return null;
              const minS = groupTasks.reduce((a, t) => (t.start < a ? t.start : a), groupTasks[0].start);
              const maxE = groupTasks.reduce((a, t) => (t.end   > a ? t.end   : a), groupTasks[0].end);
              const bx   = dateToX(minS, tlStart, dayWidth);
              const bw   = (daysBetween(minS, maxE) + 1) * dayWidth;
              const by   = rowIdx * ROW_H + ROW_H / 2 - 5;
              return (
                <div key={`gb-${row.group}`} className="gt-group-bar"
                  style={{ left: bx, top: by, width: bw }} />
              );
            }

            // Tarea normal
            const task = row;
            const { start, end } = resolveTaskPos(task);
            const bx = dateToX(start, tlStart, dayWidth);
            const bw = Math.max(dayWidth, (daysBetween(start, end) + 1) * dayWidth);
            const by = rowIdx * ROW_H + Math.floor((ROW_H - 22) / 2);
            const isCritical = showCritical && task._cpm?.critical;
            const isSelected = selectedId === task.id;
            const pctW = Math.round(bw * (task.progress / 100));

            if (task.milestone) {
              const cx = bx + dayWidth / 2;
              const cy = rowIdx * ROW_H + ROW_H / 2;
              return (
                <svg
                  key={task.id}
                  className="gt-milestone-svg"
                  style={{ position: 'absolute', top: 0, left: 0, width: totalWidth, height: totalHeight, pointerEvents: 'none', overflow: 'visible' }}
                >
                  <g style={{ pointerEvents: 'all', cursor: 'pointer' }}
                    onClick={() => onSelectTask(task.id)}>
                    <MilestoneShape cx={cx} cy={cy} color={task.color} isSelected={isSelected} />
                    <text x={cx + 14} y={cy + 4} className="gt-bar-label" fill="var(--text2)" fontSize="11">
                      {task.name}
                    </text>
                  </g>
                </svg>
              );
            }

            return (
              <div
                key={task.id}
                className={`gt-bar ${isCritical ? 'critical' : ''} ${isSelected ? 'selected' : ''}`}
                style={{ left: bx, top: by, width: bw, background: task.color }}
                onClick={() => onSelectTask(task.id)}
              >
                {/* Progreso fill */}
                <div className="gt-bar-progress" style={{ width: pctW }} />

                {/* Etiqueta */}
                <span className="gt-bar-label">{task.name}</span>

                {/* Handle izquierdo */}
                <div
                  className="gt-resize-handle gt-resize-l"
                  onMouseDown={e => handleBarMouseDown(e, task, 'resize-l')}
                />

                {/* Handle derecho */}
                <div
                  className="gt-resize-handle gt-resize-r"
                  onMouseDown={e => handleBarMouseDown(e, task, 'resize-r')}
                />

                {/* Zona de arrastre (centro) */}
                <div
                  className="gt-move-handle"
                  onMouseDown={e => handleBarMouseDown(e, task, 'move')}
                />
              </div>
            );
          })}

          {/* SVG de flechas de dependencias */}
          <svg
            className="gt-arrows-svg"
            style={{ position: 'absolute', top: 0, left: 0, width: totalWidth, height: totalHeight, pointerEvents: 'none', overflow: 'visible' }}
          >
            <defs>
              <marker id="arrowhead" markerWidth="6" markerHeight="6"
                refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#908B85" />
              </marker>
              <marker id="arrowhead-critical" markerWidth="6" markerHeight="6"
                refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#B91C1C" />
              </marker>
            </defs>

            {visibleRows.map(row => {
              if (row.type !== 'task' || !row.deps?.length) return null;
              return row.deps.map(dep => {
                const predIdx = rowIndexMap[dep.taskId];
                const succIdx = rowIndexMap[row.id];
                if (predIdx === undefined || succIdx === undefined) return null;

                const pred = taskMap[dep.taskId];
                if (!pred) return null;

                const isCrit = showCritical && pred._cpm?.critical && row._cpm?.critical;

                // Calcular coordenadas según tipo de dependencia
                let x1, y1, x2, y2;
                const predPos = resolveTaskPos(pred);
                const succPos = resolveTaskPos(row);

                switch (dep.type) {
                  case 'FS':
                    x1 = dateToX(predPos.end, tlStart, dayWidth) + dayWidth;
                    y1 = predIdx * ROW_H + ROW_H / 2;
                    x2 = dateToX(succPos.start, tlStart, dayWidth);
                    y2 = succIdx * ROW_H + ROW_H / 2;
                    break;
                  case 'SS':
                    x1 = dateToX(predPos.start, tlStart, dayWidth);
                    y1 = predIdx * ROW_H + ROW_H / 2;
                    x2 = dateToX(succPos.start, tlStart, dayWidth);
                    y2 = succIdx * ROW_H + ROW_H / 2;
                    break;
                  case 'FF':
                    x1 = dateToX(predPos.end, tlStart, dayWidth) + dayWidth;
                    y1 = predIdx * ROW_H + ROW_H / 2;
                    x2 = dateToX(succPos.end, tlStart, dayWidth) + dayWidth;
                    y2 = succIdx * ROW_H + ROW_H / 2;
                    break;
                  default:
                    x1 = dateToX(predPos.end, tlStart, dayWidth) + dayWidth;
                    y1 = predIdx * ROW_H + ROW_H / 2;
                    x2 = dateToX(succPos.start, tlStart, dayWidth);
                    y2 = succIdx * ROW_H + ROW_H / 2;
                }

                const color  = isCrit ? '#B91C1C' : '#C4BDB6';
                const marker = isCrit ? 'url(#arrowhead-critical)' : 'url(#arrowhead)';

                return (
                  <path
                    key={`${dep.taskId}-${row.id}`}
                    d={arrowPath(x1, y1, x2, y2)}
                    stroke={color}
                    strokeWidth={isCrit ? 1.8 : 1.2}
                    fill="none"
                    markerEnd={marker}
                    strokeDasharray={dep.type === 'SS' || dep.type === 'FF' ? '4,3' : undefined}
                  />
                );
              });
            })}
          </svg>

        </div>
      </div>
    </div>
  );
}
