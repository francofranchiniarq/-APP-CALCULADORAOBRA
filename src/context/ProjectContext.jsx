/* ═══════════════════════════════════════════════════════════════
   Metriq — ProjectContext (Estado Global del Proyecto)

   Envuelve el dashboard de un proyecto activo y centraliza:
   - Planos, Cómputos, Presupuesto, Gantt Tasks, Certificaciones
   - Selectores derivados (totales, avance ponderado, etc.)
   - Acciones que propagan cambios entre módulos

   Uso:
     <ProjectProvider obraId="abc123">
       <Sidebar />
       <MainContent />
     </ProjectProvider>

   Cualquier hijo accede con:
     const { presupuesto, actualizarProgresoTarea } = useProject();
   ═══════════════════════════════════════════════════════════════ */

import { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from "react";
import {
  crearPlano,
  crearComputoItem,
  crearPresupuestoItem,
  crearGanttTask,
  crearGanttTaskPresupuesto,
  crearCertificacion,
} from "../models/schema.js";

// ─── Context ─────────────────────────────────────────────────

const ProjectContext = createContext(null);

// ─── Estado Inicial ──────────────────────────────────────────

function estadoInicial(obraId) {
  return {
    obraId,
    planos: [],
    computos: [],
    presupuesto: [],
    ganttTasks: [],
    ganttTaskPresupuesto: [],   // tabla puente N:M
    certificaciones: [],
    _lastUpdated: null,
  };
}

// ─── Persistence Keys ────────────────────────────────────────

const STORAGE_PREFIX = "metriq_project_";

function loadState(obraId) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + obraId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(state) {
  localStorage.setItem(
    STORAGE_PREFIX + state.obraId,
    JSON.stringify(state)
  );
}

// ─── Action Types ────────────────────────────────────────────

const A = {
  LOAD:                      "LOAD",
  // Planos
  ADD_PLANO:                 "ADD_PLANO",
  UPDATE_PLANO:              "UPDATE_PLANO",
  DELETE_PLANO:              "DELETE_PLANO",
  // Cómputos
  ADD_COMPUTO:               "ADD_COMPUTO",
  UPDATE_COMPUTO:            "UPDATE_COMPUTO",
  DELETE_COMPUTO:            "DELETE_COMPUTO",
  // Presupuesto
  ADD_PRESUPUESTO_ITEM:      "ADD_PRESUPUESTO_ITEM",
  UPDATE_PRESUPUESTO_ITEM:   "UPDATE_PRESUPUESTO_ITEM",
  DELETE_PRESUPUESTO_ITEM:   "DELETE_PRESUPUESTO_ITEM",
  // Gantt
  ADD_GANTT_TASK:            "ADD_GANTT_TASK",
  UPDATE_GANTT_TASK:         "UPDATE_GANTT_TASK",
  DELETE_GANTT_TASK:         "DELETE_GANTT_TASK",
  // Gantt ↔ Presupuesto link
  LINK_TASK_PRESUPUESTO:     "LINK_TASK_PRESUPUESTO",
  UNLINK_TASK_PRESUPUESTO:   "UNLINK_TASK_PRESUPUESTO",
  // Certificaciones
  ADD_CERTIFICACION:         "ADD_CERTIFICACION",
  UPDATE_CERTIFICACION:      "UPDATE_CERTIFICACION",
  // Acción compuesta: actualizar progreso + generar certificación
  AVANZAR_TAREA:             "AVANZAR_TAREA",
};

// ─── Reducer ─────────────────────────────────────────────────

function reducer(state, action) {
  const ts = new Date().toISOString();

  switch (action.type) {
    case A.LOAD:
      return { ...action.payload, _lastUpdated: ts };

    // ── Planos ──
    case A.ADD_PLANO:
      return { ...state, planos: [...state.planos, action.payload], _lastUpdated: ts };
    case A.UPDATE_PLANO:
      return {
        ...state,
        planos: state.planos.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload, actualizado: ts } : p
        ),
        _lastUpdated: ts,
      };
    case A.DELETE_PLANO:
      return { ...state, planos: state.planos.filter(p => p.id !== action.payload), _lastUpdated: ts };

    // ── Cómputos ──
    case A.ADD_COMPUTO:
      return { ...state, computos: [...state.computos, action.payload], _lastUpdated: ts };
    case A.UPDATE_COMPUTO:
      return {
        ...state,
        computos: state.computos.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload, actualizado: ts } : c
        ),
        _lastUpdated: ts,
      };
    case A.DELETE_COMPUTO: {
      const computoId = action.payload;
      // Cascade: eliminar presupuesto items vinculados al cómputo
      const presupLinked = state.presupuesto.filter(p => p.computoItemId === computoId);
      const presupLinkedIds = new Set(presupLinked.map(p => p.id));
      return {
        ...state,
        computos: state.computos.filter(c => c.id !== computoId),
        presupuesto: state.presupuesto.filter(p => p.computoItemId !== computoId),
        ganttTaskPresupuesto: state.ganttTaskPresupuesto.filter(
          gtp => !presupLinkedIds.has(gtp.presupuestoItemId)
        ),
        _lastUpdated: ts,
      };
    }

    // ── Presupuesto ──
    case A.ADD_PRESUPUESTO_ITEM:
      return { ...state, presupuesto: [...state.presupuesto, action.payload], _lastUpdated: ts };
    case A.UPDATE_PRESUPUESTO_ITEM:
      return {
        ...state,
        presupuesto: state.presupuesto.map(p =>
          p.id === action.payload.id
            ? {
                ...p,
                ...action.payload,
                subtotal: (action.payload.cantidad ?? p.cantidad) * (action.payload.precioUnitario ?? p.precioUnitario),
                actualizado: ts,
              }
            : p
        ),
        _lastUpdated: ts,
      };
    case A.DELETE_PRESUPUESTO_ITEM:
      return {
        ...state,
        presupuesto: state.presupuesto.filter(p => p.id !== action.payload),
        ganttTaskPresupuesto: state.ganttTaskPresupuesto.filter(
          gtp => gtp.presupuestoItemId !== action.payload
        ),
        _lastUpdated: ts,
      };

    // ── Gantt Tasks ──
    case A.ADD_GANTT_TASK:
      return { ...state, ganttTasks: [...state.ganttTasks, action.payload], _lastUpdated: ts };
    case A.UPDATE_GANTT_TASK:
      return {
        ...state,
        ganttTasks: state.ganttTasks.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
        _lastUpdated: ts,
      };
    case A.DELETE_GANTT_TASK: {
      const taskId = action.payload;
      return {
        ...state,
        ganttTasks: state.ganttTasks.filter(t => t.id !== taskId),
        ganttTaskPresupuesto: state.ganttTaskPresupuesto.filter(gtp => gtp.ganttTaskId !== taskId),
        certificaciones: state.certificaciones.filter(c => c.ganttTaskId !== taskId),
        _lastUpdated: ts,
      };
    }

    // ── Gantt ↔ Presupuesto Links ──
    case A.LINK_TASK_PRESUPUESTO:
      return {
        ...state,
        ganttTaskPresupuesto: [...state.ganttTaskPresupuesto, action.payload],
        _lastUpdated: ts,
      };
    case A.UNLINK_TASK_PRESUPUESTO:
      return {
        ...state,
        ganttTaskPresupuesto: state.ganttTaskPresupuesto.filter(gtp => gtp.id !== action.payload),
        _lastUpdated: ts,
      };

    // ── Certificaciones ──
    case A.ADD_CERTIFICACION:
      return { ...state, certificaciones: [...state.certificaciones, action.payload], _lastUpdated: ts };
    case A.UPDATE_CERTIFICACION:
      return {
        ...state,
        certificaciones: state.certificaciones.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload, actualizado: ts } : c
        ),
        _lastUpdated: ts,
      };

    // ── ACCIÓN COMPUESTA: Avanzar tarea y generar certificación ──
    case A.AVANZAR_TAREA: {
      const { taskId, nuevoProgreso, periodoNumero, periodoDesde, periodoHasta } = action.payload;
      const tarea = state.ganttTasks.find(t => t.id === taskId);
      if (!tarea) return state;

      const progresoAnterior = tarea.progreso;
      if (nuevoProgreso <= progresoAnterior) {
        // Solo actualizar progreso sin certificar (retroceso o sin cambio)
        return reducer(state, {
          type: A.UPDATE_GANTT_TASK,
          payload: { id: taskId, progreso: nuevoProgreso, estado: estadoFromProgreso(nuevoProgreso) },
        });
      }

      // 1. Calcular monto base (suma de subtotales de PresupuestoItems vinculados)
      const linksDeEstaTarea = state.ganttTaskPresupuesto.filter(gtp => gtp.ganttTaskId === taskId);
      const montoBase = linksDeEstaTarea.reduce((sum, link) => {
        const item = state.presupuesto.find(p => p.id === link.presupuestoItemId);
        return sum + (item ? item.subtotal * (link.porcentaje / 100) : 0);
      }, 0);

      const delta = nuevoProgreso - progresoAnterior;

      // 2. Crear certificación
      const cert = crearCertificacion(state.obraId, { ...tarea, progreso: nuevoProgreso }, {
        periodoNumero: periodoNumero || state.certificaciones.filter(c => c.ganttTaskId === taskId).length + 1,
        periodoDesde: periodoDesde || ts,
        periodoHasta: periodoHasta || ts,
        progresoAnterior,
        progresoActual: nuevoProgreso,
        montoBase,
        montoCertificado: montoBase * (delta / 100),
      });

      // 3. Actualizar tarea
      const tareasActualizadas = state.ganttTasks.map(t =>
        t.id === taskId
          ? { ...t, progreso: nuevoProgreso, estado: estadoFromProgreso(nuevoProgreso) }
          : t
      );

      return {
        ...state,
        ganttTasks: tareasActualizadas,
        certificaciones: [...state.certificaciones, cert],
        _lastUpdated: ts,
      };
    }

    default:
      return state;
  }
}

function estadoFromProgreso(p) {
  if (p >= 100) return "completada";
  if (p > 0) return "en_progreso";
  return "pendiente";
}

// ─── Provider ────────────────────────────────────────────────

export function ProjectProvider({ obraId, children }) {
  const [state, dispatch] = useReducer(reducer, obraId, estadoInicial);

  // Cargar estado persistido al montar
  useEffect(() => {
    const saved = loadState(obraId);
    if (saved) {
      dispatch({ type: A.LOAD, payload: saved });
    }
  }, [obraId]);

  // Persistir en localStorage en cada cambio
  useEffect(() => {
    if (state._lastUpdated) {
      saveState(state);
    }
  }, [state]);

  // ── Actions (estables gracias a dispatch) ──────────────────

  // Planos
  const agregarPlano = useCallback((datos) => {
    const plano = crearPlano(obraId, datos);
    dispatch({ type: A.ADD_PLANO, payload: plano });
    return plano;
  }, [obraId]);

  const actualizarPlano = useCallback((id, datos) => {
    dispatch({ type: A.UPDATE_PLANO, payload: { id, ...datos } });
  }, []);

  const eliminarPlano = useCallback((id) => {
    dispatch({ type: A.DELETE_PLANO, payload: id });
  }, []);

  // Cómputos
  const agregarComputo = useCallback((datos) => {
    const item = crearComputoItem(obraId, datos);
    dispatch({ type: A.ADD_COMPUTO, payload: item });
    return item;
  }, [obraId]);

  const actualizarComputo = useCallback((id, datos) => {
    dispatch({ type: A.UPDATE_COMPUTO, payload: { id, ...datos } });
  }, []);

  const eliminarComputo = useCallback((id) => {
    dispatch({ type: A.DELETE_COMPUTO, payload: id });
  }, []);

  // Presupuesto
  const agregarPresupuestoItem = useCallback((computoItem, datos) => {
    const item = crearPresupuestoItem(obraId, computoItem, datos);
    dispatch({ type: A.ADD_PRESUPUESTO_ITEM, payload: item });
    return item;
  }, [obraId]);

  const actualizarPresupuestoItem = useCallback((id, datos) => {
    dispatch({ type: A.UPDATE_PRESUPUESTO_ITEM, payload: { id, ...datos } });
  }, []);

  const eliminarPresupuestoItem = useCallback((id) => {
    dispatch({ type: A.DELETE_PRESUPUESTO_ITEM, payload: id });
  }, []);

  // Gantt
  const agregarTarea = useCallback((datos) => {
    const task = crearGanttTask(obraId, datos);
    dispatch({ type: A.ADD_GANTT_TASK, payload: task });
    return task;
  }, [obraId]);

  const actualizarTarea = useCallback((id, datos) => {
    dispatch({ type: A.UPDATE_GANTT_TASK, payload: { id, ...datos } });
  }, []);

  const eliminarTarea = useCallback((id) => {
    dispatch({ type: A.DELETE_GANTT_TASK, payload: id });
  }, []);

  // Vinculación Gantt ↔ Presupuesto
  const vincularTareaPresupuesto = useCallback((ganttTaskId, presupuestoItemId, porcentaje = 100) => {
    const link = crearGanttTaskPresupuesto(ganttTaskId, presupuestoItemId, porcentaje);
    dispatch({ type: A.LINK_TASK_PRESUPUESTO, payload: link });
    return link;
  }, []);

  const desvincularTareaPresupuesto = useCallback((linkId) => {
    dispatch({ type: A.UNLINK_TASK_PRESUPUESTO, payload: linkId });
  }, []);

  // Certificaciones
  const agregarCertificacion = useCallback((ganttTask, datos) => {
    const cert = crearCertificacion(obraId, ganttTask, datos);
    dispatch({ type: A.ADD_CERTIFICACION, payload: cert });
    return cert;
  }, [obraId]);

  const actualizarCertificacion = useCallback((id, datos) => {
    dispatch({ type: A.UPDATE_CERTIFICACION, payload: { id, ...datos } });
  }, []);

  // Acción compuesta: avanzar tarea + auto-certificar
  const avanzarTarea = useCallback((taskId, nuevoProgreso, periodoInfo = {}) => {
    dispatch({
      type: A.AVANZAR_TAREA,
      payload: { taskId, nuevoProgreso, ...periodoInfo },
    });
  }, []);

  // ── Selectores derivados ───────────────────────────────────

  const derivados = useMemo(() => {
    // Total presupuesto
    const totalPresupuesto = state.presupuesto.reduce((s, p) => s + p.subtotal, 0);

    // Total certificado (solo aprobados/pagados)
    const totalCertificado = state.certificaciones
      .filter(c => c.estado === "aprobado" || c.estado === "pagado")
      .reduce((s, c) => s + c.montoCertificado, 0);

    // Avance ponderado global (por monto)
    const avancePonderado = totalPresupuesto > 0
      ? state.ganttTasks.reduce((sum, task) => {
          const links = state.ganttTaskPresupuesto.filter(l => l.ganttTaskId === task.id);
          const montoTask = links.reduce((s, link) => {
            const item = state.presupuesto.find(p => p.id === link.presupuestoItemId);
            return s + (item ? item.subtotal * (link.porcentaje / 100) : 0);
          }, 0);
          return sum + (task.progreso / 100) * montoTask;
        }, 0) / totalPresupuesto * 100
      : 0;

    // Resumen por rubro
    const presupuestoPorRubro = state.presupuesto.reduce((acc, item) => {
      acc[item.rubro] = (acc[item.rubro] || 0) + item.subtotal;
      return acc;
    }, {});

    // Items de presupuesto sin asignar a tareas
    const presupuestoSinAsignar = state.presupuesto.filter(p =>
      !state.ganttTaskPresupuesto.some(gtp => gtp.presupuestoItemId === p.id)
    );

    // Tareas sin presupuesto vinculado
    const tareasSinPresupuesto = state.ganttTasks.filter(t =>
      !state.ganttTaskPresupuesto.some(gtp => gtp.ganttTaskId === t.id)
    );

    return {
      totalPresupuesto,
      totalCertificado,
      avancePonderado: Math.round(avancePonderado * 100) / 100,
      saldoPendiente: totalPresupuesto - totalCertificado,
      presupuestoPorRubro,
      presupuestoSinAsignar,
      tareasSinPresupuesto,
    };
  }, [state.presupuesto, state.ganttTasks, state.ganttTaskPresupuesto, state.certificaciones]);

  // ── Helpers de consulta ────────────────────────────────────

  const getComputosPorPlano = useCallback((planoId) =>
    state.computos.filter(c => c.planoId === planoId),
  [state.computos]);

  const getPresupuestoPorComputo = useCallback((computoId) =>
    state.presupuesto.find(p => p.computoItemId === computoId) || null,
  [state.presupuesto]);

  const getCertificacionesPorTarea = useCallback((taskId) =>
    state.certificaciones.filter(c => c.ganttTaskId === taskId),
  [state.certificaciones]);

  const getPresupuestoItemsDeTarea = useCallback((taskId) => {
    const links = state.ganttTaskPresupuesto.filter(l => l.ganttTaskId === taskId);
    return links.map(link => ({
      ...state.presupuesto.find(p => p.id === link.presupuestoItemId),
      porcentajeAsignado: link.porcentaje,
      linkId: link.id,
    })).filter(Boolean);
  }, [state.ganttTaskPresupuesto, state.presupuesto]);

  // ── Value del contexto ─────────────────────────────────────

  const value = useMemo(() => ({
    // Estado crudo
    obraId: state.obraId,
    planos: state.planos,
    computos: state.computos,
    presupuesto: state.presupuesto,
    ganttTasks: state.ganttTasks,
    ganttTaskPresupuesto: state.ganttTaskPresupuesto,
    certificaciones: state.certificaciones,

    // Selectores derivados
    ...derivados,

    // Acciones — Planos
    agregarPlano,
    actualizarPlano,
    eliminarPlano,

    // Acciones — Cómputos
    agregarComputo,
    actualizarComputo,
    eliminarComputo,

    // Acciones — Presupuesto
    agregarPresupuestoItem,
    actualizarPresupuestoItem,
    eliminarPresupuestoItem,

    // Acciones — Gantt
    agregarTarea,
    actualizarTarea,
    eliminarTarea,

    // Acciones — Vinculación
    vincularTareaPresupuesto,
    desvincularTareaPresupuesto,

    // Acciones — Certificaciones
    agregarCertificacion,
    actualizarCertificacion,
    avanzarTarea,

    // Helpers de consulta
    getComputosPorPlano,
    getPresupuestoPorComputo,
    getCertificacionesPorTarea,
    getPresupuestoItemsDeTarea,
  }), [
    state, derivados,
    agregarPlano, actualizarPlano, eliminarPlano,
    agregarComputo, actualizarComputo, eliminarComputo,
    agregarPresupuestoItem, actualizarPresupuestoItem, eliminarPresupuestoItem,
    agregarTarea, actualizarTarea, eliminarTarea,
    vincularTareaPresupuesto, desvincularTareaPresupuesto,
    agregarCertificacion, actualizarCertificacion, avanzarTarea,
    getComputosPorPlano, getPresupuestoPorComputo,
    getCertificacionesPorTarea, getPresupuestoItemsDeTarea,
  ]);

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

// ─── Hook de acceso ──────────────────────────────────────────

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProject() debe usarse dentro de <ProjectProvider>");
  }
  return ctx;
}

export default ProjectContext;
