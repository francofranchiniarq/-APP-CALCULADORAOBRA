// ═══════════════════════════════════════════════════════════════
// useGanttLogic.js — Estado y lógica central del Gantt
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from 'react';
import { GANTT_MOCK_TASKS }  from '../utils/ganttMockData.js';
import { computeCPM }        from '../utils/ganttCPM.js';
import { autoSchedule }      from '../utils/ganttScheduler.js';
import { generateColumns }   from '../utils/ganttColumns.js';
import { formatDate, addCalendarDays, today } from '../utils/ganttCalendar.js';

export function useGanttLogic({ initialTasks, onSave } = {}) {
  // ── Estado principal ─────────────────────────────────────────
  const [tasks, setTasks]             = useState(() => initialTasks || GANTT_MOCK_TASKS);
  const [zoom, setZoom]               = useState('week');
  const [selectedId, setSelectedId]   = useState(null);
  const [sheetOpen, setSheetOpen]     = useState(false);
  const [filterGremio, setFilterGremio] = useState(null);
  const [showCritical, setShowCritical] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());

  // ── Tareas enriquecidas con CPM ──────────────────────────────
  const tasksWithCPM = useMemo(() => computeCPM(tasks), [tasks]);

  // Mapa id → tarea enriquecida
  const taskMap = useMemo(() => {
    const m = {};
    tasksWithCPM.forEach(t => (m[t.id] = t));
    return m;
  }, [tasksWithCPM]);

  // ── Límites del timeline (con padding) ───────────────────────
  const timelineBounds = useMemo(() => {
    if (!tasks.length) {
      const t = today();
      return { start: addCalendarDays(t, -7), end: addCalendarDays(t, 60) };
    }
    const minS = tasks.reduce((a, t) => (t.start < a ? t.start : a), tasks[0].start);
    const maxE = tasks.reduce((a, t) => (t.end   > a ? t.end   : a), tasks[0].end);
    return {
      start: addCalendarDays(minS, -5),
      end:   addCalendarDays(maxE, 12),
    };
  }, [tasks]);

  // ── Columnas del timeline ────────────────────────────────────
  const columns = useMemo(
    () => generateColumns(timelineBounds.start, timelineBounds.end, zoom),
    [timelineBounds, zoom]
  );

  // ── Gremios únicos para el filtro ────────────────────────────
  const allGremios = useMemo(() => {
    return [...new Set(tasks.map(t => t.gremio))].sort();
  }, [tasks]);

  // ── Orden de grupos (en orden de primera aparición) ──────────
  const groupOrder = useMemo(() => {
    const seen = [];
    tasks.forEach(t => { if (!seen.includes(t.group)) seen.push(t.group); });
    return seen;
  }, [tasks]);

  // ── Filas visibles: group headers + task rows ────────────────
  // Cada elemento: { type: 'group', group, count } | { type: 'task', ...taskData }
  const visibleRows = useMemo(() => {
    const rows = [];
    groupOrder.forEach(group => {
      const groupTasks = tasksWithCPM.filter(t => t.group === group);
      const filtered = filterGremio
        ? groupTasks.filter(t => t.gremio === filterGremio)
        : groupTasks;
      if (filtered.length === 0) return;

      const isCollapsed = collapsedGroups.has(group);
      rows.push({ type: 'group', group, count: filtered.length, isCollapsed });

      if (!isCollapsed) {
        filtered.forEach(t => rows.push({ type: 'task', ...t }));
      }
    });
    return rows;
  }, [tasksWithCPM, groupOrder, filterGremio, collapsedGroups]);

  // ── Tarea seleccionada ───────────────────────────────────────
  const selectedTask = useMemo(
    () => (selectedId ? taskMap[selectedId] || null : null),
    [selectedId, taskMap]
  );

  // ── Acciones ─────────────────────────────────────────────────

  const updateTask = useCallback((id, patch) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, ...patch } : t));
  }, []);

  const addTask = useCallback((defaults = {}) => {
    const id = `t_${Date.now()}`;
    const t0 = today();
    const newTask = {
      id,
      name: 'Nueva tarea',
      gremio: 'Sin asignar',
      group: groupOrder[0] || 'Sin grupo',
      start: t0,
      end:   addCalendarDays(t0, 5),
      progress: 0,
      milestone: false,
      color: '#6B7280',
      estado: null,
      deps: [],
      notes: '',
      linkedBudgetId: null,
      ...defaults,
    };
    setTasks(ts => [...ts, newTask]);
    setSelectedId(id);
    setSheetOpen(true);
    return id;
  }, [groupOrder]);

  const deleteTask = useCallback((id) => {
    setTasks(ts =>
      ts
        .filter(t => t.id !== id)
        .map(t => ({ ...t, deps: t.deps.filter(d => d.taskId !== id) }))
    );
    if (selectedId === id) {
      setSelectedId(null);
      setSheetOpen(false);
    }
  }, [selectedId]);

  const selectTask = useCallback((id) => {
    setSelectedId(id);
    setSheetOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
  }, []);

  const toggleGroup = useCallback((group) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      next.has(group) ? next.delete(group) : next.add(group);
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsedGroups(new Set(groupOrder));
  }, [groupOrder]);

  const expandAll = useCallback(() => {
    setCollapsedGroups(new Set());
  }, []);

  const runAutoSchedule = useCallback(() => {
    setTasks(ts => autoSchedule(ts));
  }, []);

  const handleSave = useCallback(() => {
    if (onSave) onSave(tasks);
  }, [tasks, onSave]);

  return {
    // Estado
    tasks: tasksWithCPM,
    taskMap,
    visibleRows,
    columns,
    timelineBounds,
    zoom,
    selectedTask,
    selectedId,
    filterGremio,
    showCritical,
    collapsedGroups,
    allGremios,
    groupOrder,
    sheetOpen,

    // Acciones
    setZoom,
    updateTask,
    addTask,
    deleteTask,
    selectTask,
    closeSheet,
    setFilterGremio,
    setShowCritical,
    toggleGroup,
    collapseAll,
    expandAll,
    runAutoSchedule,
    handleSave,
  };
}
