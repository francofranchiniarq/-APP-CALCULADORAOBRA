// ═══════════════════════════════════════════════════════════════
// ganttScheduler.js — Auto-scheduling basado en dependencias
// Puro e inmutable: no muta el array original.
// ═══════════════════════════════════════════════════════════════

import { daysBetween, addCalendarDays } from './ganttCalendar.js';

/**
 * Recalcula start/end de cada tarea respetando sus dependencias.
 * Devuelve nuevo array de tareas con start/end actualizados.
 * Las tareas sin dependencias mantienen sus fechas originales.
 */
export function autoSchedule(tasks) {
  if (!tasks || tasks.length === 0) return tasks;

  // Construir mapa de trabajo (con duración en días)
  const map = {};
  tasks.forEach(t => {
    map[t.id] = {
      ...t,
      dur: daysBetween(t.start, t.end), // días totales (end - start)
    };
  });

  // Orden topológico
  const sorted = topoSort(tasks, map);

  // Propagar fechas en orden topológico
  sorted.forEach(id => {
    const n = map[id];
    if (!n.deps || n.deps.length === 0) return;

    let newStart = n.start;

    n.deps.forEach(dep => {
      const pred = map[dep.taskId];
      if (!pred) return;
      const lag = dep.lag || 0;
      let earliest;

      switch (dep.type) {
        case 'FS':
          // sucesor empieza el día siguiente al fin del predecesor + lag
          earliest = addCalendarDays(pred.end, lag + 1);
          break;
        case 'SS':
          // sucesor empieza al mismo tiempo que el predecesor + lag
          earliest = addCalendarDays(pred.start, lag);
          break;
        case 'FF': {
          // sucesor termina cuando el predecesor termina + lag
          const earlyEnd = addCalendarDays(pred.end, lag);
          earliest = addCalendarDays(earlyEnd, -n.dur);
          break;
        }
        case 'SF': {
          // sucesor termina cuando el predecesor empieza + lag
          const earlyEnd = addCalendarDays(pred.start, lag);
          earliest = addCalendarDays(earlyEnd, -n.dur);
          break;
        }
        default:
          earliest = addCalendarDays(pred.end, lag + 1);
      }

      if (earliest > newStart) newStart = earliest;
    });

    map[id].start = newStart;
    map[id].end   = addCalendarDays(newStart, n.dur);
  });

  return tasks.map(t => ({
    ...t,
    start: map[t.id].start,
    end:   map[t.id].end,
  }));
}

function topoSort(tasks, map) {
  const visited = new Set();
  const result = [];
  function visit(id) {
    if (visited.has(id)) return;
    visited.add(id);
    const n = map[id];
    if (n.deps) n.deps.forEach(d => { if (map[d.taskId]) visit(d.taskId); });
    result.push(id);
  }
  tasks.forEach(t => visit(t.id));
  return result;
}
