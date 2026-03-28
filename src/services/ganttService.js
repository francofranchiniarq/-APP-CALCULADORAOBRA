// ══════════════════════════════════════════════════════════════
// ganttService.js — Persistencia de tareas Gantt en Supabase
// ══════════════════════════════════════════════════════════════

import { supabase, OFFLINE_MODE } from '../lib/supabase.js';

/** Carga todas las tareas de una obra. */
export async function getGanttTasks(obraId) {
  if (OFFLINE_MODE || !obraId) throw new Error('offline');

  const { data, error } = await supabase
    .from('gantt_tasks')
    .select('*')
    .eq('obra_id', obraId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data.map(mapFromDB);
}

/**
 * Guarda (upsert) el array completo de tareas para una obra.
 * Estrategia: delete + insert (simple, evita tracking de cambios individuales).
 */
export async function saveGanttTasks(obraId, tasks) {
  if (OFFLINE_MODE || !obraId) throw new Error('offline');

  // 1. Borrar todas las tareas existentes de esta obra
  const { error: delError } = await supabase
    .from('gantt_tasks')
    .delete()
    .eq('obra_id', obraId);

  if (delError) throw delError;

  // 2. Insertar el nuevo estado completo
  if (!tasks || tasks.length === 0) return [];

  const rows = tasks.map(t => mapToDB(t, obraId));
  const { data, error } = await supabase
    .from('gantt_tasks')
    .insert(rows)
    .select();

  if (error) throw error;
  return data.map(mapFromDB);
}

/** Actualiza un campo de una tarea (útil para drag/resize en tiempo real). */
export async function updateGanttTask(taskId, obraId, patch) {
  if (OFFLINE_MODE) throw new Error('offline');

  const { data, error } = await supabase
    .from('gantt_tasks')
    .update(mapPatchToDB(patch))
    .eq('id', taskId)
    .eq('obra_id', obraId)
    .select()
    .single();

  if (error) throw error;
  return mapFromDB(data);
}

// ── Mappings ──────────────────────────────────────────────────

function mapFromDB(row) {
  return {
    id:             row.id,
    name:           row.nombre,
    gremio:         row.gremio,
    group:          row.grupo,
    start:          row.fecha_inicio,
    end:            row.fecha_fin,
    progress:       row.progreso ?? 0,
    milestone:      row.milestone ?? false,
    color:          row.color ?? '#6B7280',
    estado:         row.estado ?? null,
    deps:           Array.isArray(row.deps) ? row.deps : (row.deps || []),
    notes:          row.notas ?? '',
    linkedBudgetId: row.linked_budget_id ?? null,
    // BIM fields
    ifcGuid:        row.ifc_guid ?? null,
    ifcType:        row.ifc_type ?? null,
    speckleObjectId:row.speckle_object_id ?? null,
  };
}

function mapToDB(task, obraId) {
  return {
    id:               task.id,
    obra_id:          obraId,
    nombre:           task.name,
    gremio:           task.gremio    ?? null,
    grupo:            task.group     ?? null,
    fecha_inicio:     task.start,
    fecha_fin:        task.end,
    progreso:         task.progress  ?? 0,
    milestone:        task.milestone ?? false,
    color:            task.color     ?? '#6B7280',
    estado:           task.estado    ?? null,
    deps:             task.deps      ?? [],
    notas:            task.notes     ?? null,
    linked_budget_id: task.linkedBudgetId ?? null,
    ifc_guid:         task.ifcGuid   ?? null,
    ifc_type:         task.ifcType   ?? null,
    speckle_object_id:task.speckleObjectId ?? null,
  };
}

function mapPatchToDB(patch) {
  const out = {};
  if (patch.name      !== undefined) out.nombre       = patch.name;
  if (patch.start     !== undefined) out.fecha_inicio  = patch.start;
  if (patch.end       !== undefined) out.fecha_fin     = patch.end;
  if (patch.progress  !== undefined) out.progreso      = patch.progress;
  if (patch.estado    !== undefined) out.estado        = patch.estado;
  if (patch.deps      !== undefined) out.deps          = patch.deps;
  if (patch.notes     !== undefined) out.notas         = patch.notes;
  if (patch.milestone !== undefined) out.milestone     = patch.milestone;
  if (patch.color     !== undefined) out.color         = patch.color;
  return out;
}
