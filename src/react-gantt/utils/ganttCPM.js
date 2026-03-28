// ═══════════════════════════════════════════════════════════════
// ganttCPM.js — Método de la Ruta Crítica (CPM)
// Puro, inmutable, testeable sin React.
//
// Agrega a cada tarea: { es, ef, ls, lf, float, critical }
// Todos en días-offset desde el inicio del proyecto.
// ═══════════════════════════════════════════════════════════════

import { daysBetween } from './ganttCalendar.js';

/**
 * Calcula CPM sobre el array de tareas.
 * Devuelve nuevo array con campos adicionales por tarea.
 */
export function computeCPM(tasks) {
  if (!tasks || tasks.length === 0) return tasks;

  // 1. Construir mapa con duraciones
  const map = {};
  tasks.forEach(t => {
    map[t.id] = {
      ...t,
      dur: Math.max(1, daysBetween(t.start, t.end) + 1),
      es: 0, ef: 0, ls: 0, lf: 0, float: 0, critical: false,
    };
  });

  // 2. Inicio del proyecto = fecha mínima de inicio
  const projectStart = tasks.reduce(
    (min, t) => (t.start < min ? t.start : min),
    tasks[0].start
  );

  // 3. Offset inicial de cada tarea desde projectStart
  tasks.forEach(t => {
    const n = map[t.id];
    n.es = daysBetween(projectStart, t.start);
    n.ef = n.es + n.dur - 1;
  });

  // 4. Orden topológico
  const sorted = topoSort(tasks, map);

  // 5. Forward pass — ES y EF
  sorted.forEach(id => {
    const n = map[id];
    if (!n.deps || n.deps.length === 0) { /* mantiene ES original */ return; }

    let es = n.es;
    n.deps.forEach(dep => {
      const pred = map[dep.taskId];
      if (!pred) return;
      const lag = dep.lag || 0;
      let earliest;
      switch (dep.type) {
        case 'FS': earliest = pred.ef + 1 + lag; break;
        case 'SS': earliest = pred.es + lag; break;
        case 'FF': earliest = pred.ef + lag - n.dur + 1; break;
        case 'SF': earliest = pred.es + lag - n.dur + 1; break;
        default:   earliest = pred.ef + 1 + lag;
      }
      if (earliest > es) es = earliest;
    });

    n.es = es;
    n.ef = n.es + n.dur - 1;
  });

  // 6. Fin del proyecto = máximo EF
  const projectEnd = Math.max(...Object.values(map).map(n => n.ef));

  // 7. Backward pass — LS y LF
  [...sorted].reverse().forEach(id => {
    const n = map[id];

    // Sucesores de esta tarea
    const succs = tasks.filter(t =>
      t.deps && t.deps.some(d => d.taskId === id)
    );

    if (succs.length === 0) {
      n.lf = projectEnd;
    } else {
      n.lf = projectEnd;
      succs.forEach(succ => {
        const s = map[succ.id];
        const dep = succ.deps.find(d => d.taskId === id);
        const lag = dep.lag || 0;
        let lf;
        switch (dep.type) {
          case 'FS': lf = s.ls - 1 - lag; break;
          case 'SS': lf = s.ls - lag + n.dur - 1; break;
          case 'FF': lf = s.lf - lag; break;
          case 'SF': lf = s.lf - lag + n.dur - 1; break;
          default:   lf = s.ls - 1 - lag;
        }
        if (lf < n.lf) n.lf = lf;
      });
    }

    n.ls = n.lf - n.dur + 1;
    n.float = n.ls - n.es;
    n.critical = n.float <= 0;
  });

  return tasks.map(t => ({
    ...t,
    _cpm: {
      es: map[t.id].es,
      ef: map[t.id].ef,
      ls: map[t.id].ls,
      lf: map[t.id].lf,
      float: map[t.id].float,
      critical: map[t.id].critical,
    },
  }));
}

// ── Utilidad interna: orden topológico ───────────────────────
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
