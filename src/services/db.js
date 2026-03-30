/* ═══════════════════════════════════════════════════════════════
   Metriq — Supabase DB Service

   Capa de sincronización entre localStorage (rápido, offline) y
   Supabase (persistente, multi-dispositivo).

   Patrón:
   - Las escrituras van a localStorage primero (sync, instantáneo)
   - Luego se sincronizan a Supabase en background (async, fire-and-forget)
   - Al iniciar la app, se descargan los datos de Supabase → localStorage
   ═══════════════════════════════════════════════════════════════ */

import { supabase } from '../lib/supabase.js';

// ─── Helpers ─────────────────────────────────────────────────

async function getUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// ─── Profile ─────────────────────────────────────────────────

export async function fetchProfile(authUser) {
  if (!authUser) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (error || !data) {
    // Profile might not exist yet (trigger delay), build from auth metadata
    return {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || '',
      role: authUser.user_metadata?.role || 'profesional',
      plan: 'free',
      rubro: authUser.user_metadata?.rubro || '',
      loginAt: Date.now(),
    };
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name || '',
    role: data.role || 'profesional',
    plan: data.plan || 'free',
    rubro: data.rubro || '',
    loginAt: Date.now(),
  };
}

export async function updateProfile(userId, updates) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) console.error('[Metriq DB] updateProfile error:', error.message);
}

// ─── Obras: Supabase → localStorage ─────────────────────────

export async function syncObrasDown() {
  const userId = await getUserId();
  if (!userId) return [];

  const { data: obras, error } = await supabase
    .from('obras')
    .select('*, calculos(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[Metriq DB] syncObrasDown error:', error.message);
    return [];
  }

  // Transformar al formato localStorage (calculos embebidos)
  const local = (obras || []).map(o => ({
    id: o.id,
    nombre: o.nombre,
    direccion: o.direccion || '',
    cliente: o.cliente || '',
    tipo: o.tipo || 'Vivienda Unifamiliar',
    estado: o.estado || 'activo',
    presupuesto: Number(o.presupuesto) || 0,
    avance: Number(o.avance) || 0,
    modulos: o.modulos || [],
    creada: o.created_at,
    actualizada: o.updated_at,
    calculos: (o.calculos || []).map(c => ({
      id: c.id,
      moduloId: c.modulo_id,
      moduloName: c.modulo_name,
      fecha: c.created_at,
      valores: c.valores,
      resultado: c.resultado,
    })),
  }));

  localStorage.setItem('metriq_obras', JSON.stringify(local));
  return local;
}

// ─── Obras: localStorage → Supabase (upsert individual) ─────

export async function syncObraUp(obra) {
  const userId = await getUserId();
  if (!userId) return;

  // Upsert la obra (sin calculos — esos van aparte)
  const { error } = await supabase
    .from('obras')
    .upsert({
      id: obra.id,
      user_id: userId,
      nombre: obra.nombre,
      direccion: obra.direccion || '',
      cliente: obra.cliente || '',
      tipo: obra.tipo || 'Vivienda Unifamiliar',
      estado: obra.estado || 'activo',
      presupuesto: obra.presupuesto || 0,
      avance: obra.avance || 0,
      modulos: obra.modulos || [],
    }, { onConflict: 'id' });

  if (error) console.error('[Metriq DB] syncObraUp error:', error.message);

  // Upsert calculos de esta obra
  if (obra.calculos?.length) {
    const rows = obra.calculos.map(c => ({
      id: c.id,
      obra_id: obra.id,
      modulo_id: c.moduloId,
      modulo_name: c.moduloName || '',
      valores: c.valores || {},
      resultado: c.resultado || {},
    }));

    const { error: calcError } = await supabase
      .from('calculos')
      .upsert(rows, { onConflict: 'id' });

    if (calcError) console.error('[Metriq DB] syncCalcUp error:', calcError.message);
  }
}

export async function deleteObraUp(obraId) {
  const { error } = await supabase
    .from('obras')
    .delete()
    .eq('id', obraId);
  if (error) console.error('[Metriq DB] deleteObraUp error:', error.message);
}

export async function deleteCalculoUp(calculoId) {
  const { error } = await supabase
    .from('calculos')
    .delete()
    .eq('id', calculoId);
  if (error) console.error('[Metriq DB] deleteCalculoUp error:', error.message);
}
