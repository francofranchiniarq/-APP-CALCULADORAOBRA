// ══════════════════════════════════════════════════════════════
// obrasService.js — CRUD de obras en Supabase
// ══════════════════════════════════════════════════════════════

import { supabase, OFFLINE_MODE } from '../lib/supabase.js';

/** Lista todas las obras del usuario autenticado, ordenadas por fecha de creación. */
export async function getObras() {
  if (OFFLINE_MODE) throw new Error('offline');

  const { data, error } = await supabase
    .from('obras')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(mapFromDB);
}

/** Obtiene una obra por ID. */
export async function getObra(id) {
  if (OFFLINE_MODE) throw new Error('offline');

  const { data, error } = await supabase
    .from('obras')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapFromDB(data);
}

/** Crea una nueva obra. */
export async function createObra(obra) {
  if (OFFLINE_MODE) throw new Error('offline');

  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('obras')
    .insert({ ...mapToDB(obra), owner_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return mapFromDB(data);
}

/** Actualiza campos de una obra. */
export async function updateObra(id, updates) {
  if (OFFLINE_MODE) throw new Error('offline');

  const { data, error } = await supabase
    .from('obras')
    .update(mapToDB(updates))
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapFromDB(data);
}

/** Elimina una obra (y en cascada sus tareas del Gantt). */
export async function deleteObra(id) {
  if (OFFLINE_MODE) throw new Error('offline');

  const { error } = await supabase
    .from('obras')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ── Mapping DB ↔ App model ────────────────────────────────────
// La app usa camelCase; la DB usa snake_case.

function mapFromDB(row) {
  if (!row) return null;
  return {
    id:               row.id,
    name:             row.nombre,          // alias para compatibilidad con MockProjects
    nombre:           row.nombre,
    tipo:             row.tipo,
    type:             row.tipo,            // alias
    direccion:        row.direccion,
    comitente:        row.comitente,
    status:           row.estado,          // alias
    estado:           row.estado,
    budget:           row.presupuesto_total,
    presupuestoTotal: row.presupuesto_total,
    progress:         row.progreso,
    progreso:         row.progreso,
    fechaInicio:      row.fecha_inicio,
    fechaEntrega:     row.fecha_entrega,
    notes:            row.notas,
    speckleStreamId:  row.speckle_stream_id,
    ifcFileUrl:       row.ifc_file_url,
    createdAt:        row.created_at,
    updatedAt:        row.updated_at,
    // Compatibilidad con MOCK_PROJECTS
    lastUpdate:       row.updated_at ? relativeTime(row.updated_at) : '—',
    modules:          [],  // se cargarán cuando sea necesario
  };
}

function mapToDB(obra) {
  const out = {};
  if (obra.nombre  !== undefined) out.nombre            = obra.nombre;
  if (obra.name    !== undefined) out.nombre            = obra.name;
  if (obra.tipo    !== undefined) out.tipo              = obra.tipo;
  if (obra.type    !== undefined) out.tipo              = obra.type;
  if (obra.direccion   !== undefined) out.direccion     = obra.direccion;
  if (obra.comitente   !== undefined) out.comitente     = obra.comitente;
  if (obra.estado      !== undefined) out.estado        = obra.estado;
  if (obra.status      !== undefined) out.estado        = obra.status;
  if (obra.presupuestoTotal !== undefined) out.presupuesto_total = obra.presupuestoTotal;
  if (obra.budget      !== undefined) out.presupuesto_total = obra.budget;
  if (obra.progreso    !== undefined) out.progreso      = obra.progreso;
  if (obra.progress    !== undefined) out.progreso      = obra.progress;
  if (obra.fechaInicio !== undefined) out.fecha_inicio  = obra.fechaInicio;
  if (obra.fechaEntrega!== undefined) out.fecha_entrega = obra.fechaEntrega;
  if (obra.notes       !== undefined) out.notas         = obra.notes;
  return out;
}

function relativeTime(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const days  = Math.floor(diff / 86400000);
  if (days === 0) return 'hoy';
  if (days === 1) return 'hace 1 día';
  if (days < 7)   return `hace ${days} días`;
  if (days < 14)  return 'hace 1 semana';
  if (days < 30)  return `hace ${Math.floor(days / 7)} semanas`;
  return `hace ${Math.floor(days / 30)} meses`;
}
