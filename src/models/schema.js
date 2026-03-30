/* ═══════════════════════════════════════════════════════════════
   Metriq — Esquema Relacional de Entidades
   Flujo BIM 4D/5D: Planos → Cómputos → Presupuestos → Gantt → Certificaciones

   Este archivo documenta las estructuras de datos y sus relaciones.
   Cada entidad incluye las FKs que la conectan al flujo.
   ═══════════════════════════════════════════════════════════════ */

// ─── EJEMPLO DE ESQUEMA RELACIONAL (JSON) ───────────────────
//
// El grafo de dependencias es:
//
//   Obra (proyecto raíz)
//     └─ Plano ──────────────────────┐
//          └─ ComputoItem ───────────┤
//               └─ PresupuestoItem ──┤
//                    └─ GanttTask ───┤
//                         └─ Certificacion
//
// Cada entidad apunta "hacia arriba" con su FK.

export const ENTITY_SCHEMA = {
  /* ───────────────────────────────────────────────────────
     1. OBRA — Raíz del proyecto
     ─────────────────────────────────────────────────────── */
  Obra: {
    id:            "string  — PK, uid()",
    nombre:        "string",
    direccion:     "string",
    cliente:       "string",
    tipo:          "string  — 'Vivienda Unifamiliar' | 'Edificio' | ...",
    estado:        "string  — 'activo' | 'presupuesto' | 'finalizado'",
    moneda:        "string  — 'ARS' | 'USD'",
    fechaInicio:   "ISO-8601",
    fechaFin:      "ISO-8601 | null",
    creada:        "ISO-8601",
    actualizada:   "ISO-8601",
  },

  /* ───────────────────────────────────────────────────────
     2. PLANO — Documento de proyecto
     FK: obraId → Obra.id
     ─────────────────────────────────────────────────────── */
  Plano: {
    id:            "string  — PK",
    obraId:        "string  — FK → Obra.id",
    nombre:        "string  — 'Planta Baja - Sanitaria'",
    disciplina:    "string  — 'Arquitectura' | 'Sanitaria' | 'Estructural' | 'Eléctrica' | 'Gas'",
    version:       "number  — autoincremental por plano",
    archivoUrl:    "string  — URL o path local del archivo",
    archivoTipo:   "string  — 'pdf' | 'dwg' | 'png' | 'ifc'",
    escala:        "string  — '1:50' | '1:100' | null",
    notas:         "string",
    creadoPor:     "string  — userId",
    creado:        "ISO-8601",
    actualizado:   "ISO-8601",
  },

  /* ───────────────────────────────────────────────────────
     3. COMPUTO ITEM — Línea de cómputo métrico
     FKs: obraId → Obra.id, planoId → Plano.id (opcional),
          moduloId → CALC_MODULES.id (origen del cálculo)

     Un ComputoItem es una línea de medición: "45 m² de
     placa STD 12.5mm" derivada de un cálculo del módulo Seco.
     ─────────────────────────────────────────────────────── */
  ComputoItem: {
    id:            "string  — PK",
    obraId:        "string  — FK → Obra.id",
    planoId:       "string | null — FK → Plano.id (plano de referencia)",
    moduloId:      "string  — FK lógica → CALC_MODULES.id ('seco', 'agua', ...)",
    calculoId:     "string | null — FK → Calculo.id (cálculo que lo generó)",
    rubro:         "string  — 'Mampostería' | 'Inst. Sanitaria' | 'Estructura' | ...",
    descripcion:   "string  — 'Placa de yeso STD 12.5 mm'",
    unidad:        "string  — 'm²' | 'ml' | 'u' | 'kg' | 'm³' | 'gl'",
    cantidad:      "number  — resultado del cómputo",
    ubicacion:     "string  — 'Planta Baja - Dormitorio 1'",
    notas:         "string",
    creado:        "ISO-8601",
    actualizado:   "ISO-8601",
  },

  /* ───────────────────────────────────────────────────────
     4. PRESUPUESTO ITEM — Línea presupuestaria
     FKs: obraId → Obra.id, computoItemId → ComputoItem.id

     Toma la cantidad del cómputo y le asigna precio.
     Un ComputoItem puede tener 0..1 PresupuestoItem.
     ─────────────────────────────────────────────────────── */
  PresupuestoItem: {
    id:             "string  — PK",
    obraId:         "string  — FK → Obra.id",
    computoItemId:  "string  — FK → ComputoItem.id",
    rubro:          "string  — heredado o sobrescrito",
    descripcion:    "string  — heredado o sobrescrito",
    unidad:         "string  — heredado",
    cantidad:       "number  — heredado de ComputoItem.cantidad",
    precioUnitario: "number  — $/unidad",
    moneda:         "string  — 'ARS' | 'USD'",
    subtotal:       "number  — cantidad × precioUnitario (calculado)",
    proveedor:      "string | null",
    notas:          "string",
    creado:         "ISO-8601",
    actualizado:    "ISO-8601",
  },

  /* ───────────────────────────────────────────────────────
     5. GANTT TASK — Tarea del cronograma
     FKs: obraId → Obra.id
     Relación N:M con PresupuestoItem vía tabla intermedia.

     Una tarea del Gantt puede agrupar varios ítems de
     presupuesto (ej: "Inst. Sanitaria PB" incluye caños,
     llaves, artefactos). Y un ítem podría dividirse en
     varias tareas (material comprado en una, colocación
     en otra). De ahí la tabla puente.
     ─────────────────────────────────────────────────────── */
  GanttTask: {
    id:            "string  — PK",
    obraId:        "string  — FK → Obra.id",
    nombre:        "string",
    gremio:        "string  — 'Hormigón armado' | 'Sanitario' | ...",
    grupo:         "string  — 'Obra Gruesa' | 'Instalaciones' | 'Terminaciones'",
    start:         "YYYY-MM-DD",
    end:           "YYYY-MM-DD",
    progreso:      "number  — 0..100",
    milestone:     "boolean",
    color:         "string  — hex",
    estado:        "string  — 'pendiente' | 'en_progreso' | 'completada'",
    deps:          "[{ taskId: string, type: 'FS'|'SS'|'FF'|'SF', lag: number }]",
    notas:         "string",
  },

  /* ───────────────────────────────────────────────────────
     5b. GANTT ↔ PRESUPUESTO (tabla puente N:M)
     ─────────────────────────────────────────────────────── */
  GanttTaskPresupuesto: {
    id:               "string  — PK",
    ganttTaskId:      "string  — FK → GanttTask.id",
    presupuestoItemId:"string  — FK → PresupuestoItem.id",
    porcentaje:       "number  — % del ítem asignado a esta tarea (default 100)",
  },

  /* ───────────────────────────────────────────────────────
     6. CERTIFICACION — Avance certificado
     FKs: obraId → Obra.id, ganttTaskId → GanttTask.id

     Cuando una GanttTask avanza de 60% → 80%, el sistema
     genera (o el usuario confirma) un registro de
     certificación parcial por ese delta de 20%.
     ─────────────────────────────────────────────────────── */
  Certificacion: {
    id:                "string  — PK",
    obraId:            "string  — FK → Obra.id",
    ganttTaskId:       "string  — FK → GanttTask.id",
    periodoNumero:     "number  — Certificado #1, #2, etc.",
    periodoDesde:      "ISO-8601",
    periodoHasta:      "ISO-8601",
    progresoAnterior:  "number  — % al inicio del período",
    progresoActual:    "number  — % al final del período",
    delta:             "number  — progresoActual - progresoAnterior",
    montoBase:         "number  — suma de subtotales de PresupuestoItems vinculados",
    montoCertificado:  "number  — montoBase × (delta / 100)",
    estado:            "string  — 'borrador' | 'emitido' | 'aprobado' | 'pagado'",
    observaciones:     "string",
    aprobadoPor:       "string | null",
    fechaAprobacion:   "ISO-8601 | null",
    creado:            "ISO-8601",
    actualizado:       "ISO-8601",
  },
};


/* ═══════════════════════════════════════════════════════════════
   DIAGRAMA DE RELACIONES (ASCII)
   ═══════════════════════════════════════════════════════════════

   ┌──────────┐
   │   OBRA   │
   └────┬─────┘
        │ 1
        ├────────────────── 1:N ──────────────┐
        │                                      │
   ┌────▼─────┐                          ┌─────▼──────┐
   │  PLANO   │                          │ GANTT_TASK │
   └────┬─────┘                          └──┬───┬─────┘
        │ 0..1                              │   │
        │                                   │   │ N
   ┌────▼──────────┐    ┌──────────────┐    │  ┌▼──────────────────┐
   │ COMPUTO_ITEM  │───►│ PRESUP_ITEM  │◄───┘  │ GANTT_TASK_PRESUP │
   └───────────────┘1:1 └──────┬───────┘  N:M  └───────────────────┘
                               │
                               │ (monto base)
                               ▼
                        ┌──────────────┐
                        │CERTIFICACION │
                        └──────────────┘

   Flujo de datos:
   Plano ──genera──► ComputoItem ──valoriza──► PresupuestoItem
   PresupuestoItem ──se asigna──► GanttTask (vía tabla puente)
   GanttTask ──al avanzar──► Certificacion (delta de avance)

   ═══════════════════════════════════════════════════════════════ */


// ─── Factory functions para crear entidades con defaults ─────

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function now() {
  return new Date().toISOString();
}

export function crearPlano(obraId, datos = {}) {
  return {
    id: uid(),
    obraId,
    nombre: datos.nombre || "Sin nombre",
    disciplina: datos.disciplina || "Arquitectura",
    version: datos.version || 1,
    archivoUrl: datos.archivoUrl || "",
    archivoTipo: datos.archivoTipo || "pdf",
    escala: datos.escala || null,
    notas: datos.notas || "",
    creadoPor: datos.creadoPor || "",
    creado: now(),
    actualizado: now(),
  };
}

export function crearComputoItem(obraId, datos = {}) {
  return {
    id: uid(),
    obraId,
    planoId: datos.planoId || null,
    moduloId: datos.moduloId || "",
    calculoId: datos.calculoId || null,
    rubro: datos.rubro || "",
    descripcion: datos.descripcion || "",
    unidad: datos.unidad || "u",
    cantidad: datos.cantidad || 0,
    ubicacion: datos.ubicacion || "",
    notas: datos.notas || "",
    creado: now(),
    actualizado: now(),
  };
}

export function crearPresupuestoItem(obraId, computoItem, datos = {}) {
  return {
    id: uid(),
    obraId,
    computoItemId: computoItem.id,
    rubro: datos.rubro || computoItem.rubro,
    descripcion: datos.descripcion || computoItem.descripcion,
    unidad: datos.unidad || computoItem.unidad,
    cantidad: datos.cantidad ?? computoItem.cantidad,
    precioUnitario: datos.precioUnitario || 0,
    moneda: datos.moneda || "ARS",
    subtotal: (datos.cantidad ?? computoItem.cantidad) * (datos.precioUnitario || 0),
    proveedor: datos.proveedor || null,
    notas: datos.notas || "",
    creado: now(),
    actualizado: now(),
  };
}

export function crearGanttTask(obraId, datos = {}) {
  return {
    id: uid(),
    obraId,
    nombre: datos.nombre || "Nueva tarea",
    gremio: datos.gremio || "",
    grupo: datos.grupo || "Obra Gruesa",
    start: datos.start || new Date().toISOString().slice(0, 10),
    end: datos.end || new Date().toISOString().slice(0, 10),
    progreso: datos.progreso || 0,
    milestone: datos.milestone || false,
    color: datos.color || "#3F3F3F",
    estado: datos.estado || "pendiente",
    deps: datos.deps || [],
    notas: datos.notas || "",
  };
}

export function crearGanttTaskPresupuesto(ganttTaskId, presupuestoItemId, porcentaje = 100) {
  return {
    id: uid(),
    ganttTaskId,
    presupuestoItemId,
    porcentaje,
  };
}

export function crearCertificacion(obraId, ganttTask, datos = {}) {
  return {
    id: uid(),
    obraId,
    ganttTaskId: ganttTask.id,
    periodoNumero: datos.periodoNumero || 1,
    periodoDesde: datos.periodoDesde || now(),
    periodoHasta: datos.periodoHasta || now(),
    progresoAnterior: datos.progresoAnterior || 0,
    progresoActual: datos.progresoActual || ganttTask.progreso,
    delta: (datos.progresoActual || ganttTask.progreso) - (datos.progresoAnterior || 0),
    montoBase: datos.montoBase || 0,
    montoCertificado: datos.montoCertificado || 0,
    estado: datos.estado || "borrador",
    observaciones: datos.observaciones || "",
    aprobadoPor: null,
    fechaAprobacion: null,
    creado: now(),
    actualizado: now(),
  };
}
