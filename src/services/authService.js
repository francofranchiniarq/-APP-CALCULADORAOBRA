// ══════════════════════════════════════════════════════════════
// authService.js — Autenticación con Supabase
// Todas las funciones lanzan errores tipados, el caller los maneja.
// ══════════════════════════════════════════════════════════════

import { supabase, OFFLINE_MODE } from '../lib/supabase.js';

/**
 * Registro de nuevo usuario.
 * El trigger `handle_new_user` en Supabase crea el perfil automáticamente.
 */
export async function signUp({ email, password, nombre, role, rubro, empresa, scale, problems }) {
  if (OFFLINE_MODE) throw new Error('offline');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre, role, rubro, empresa, scale, problems },
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Inicio de sesión con email + contraseña.
 */
export async function signIn({ email, password }) {
  if (OFFLINE_MODE) throw new Error('offline');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/**
 * Login con Google OAuth.
 * Redirige a /dashboard después del callback.
 */
export async function signInWithGoogle() {
  if (OFFLINE_MODE) throw new Error('offline');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Cierre de sesión.
 */
export async function signOut() {
  if (OFFLINE_MODE) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Sesión activa actual (null si no hay).
 */
export async function getSession() {
  if (OFFLINE_MODE) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Perfil del usuario desde la tabla `profiles`.
 */
export async function getProfile(userId) {
  if (OFFLINE_MODE) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualizar campos del perfil.
 */
export async function updateProfile(userId, updates) {
  if (OFFLINE_MODE) return null;

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Guardar un lead de onboarding (funciona en ambos modos).
 */
export async function saveLead({ email, role, rubro, problems, scale, userAgent, screenWidth }) {
  // Siempre guardar en localStorage como respaldo
  try {
    const existing = JSON.parse(localStorage.getItem('metriq_leads') || '[]');
    existing.push({ email, role, rubro, problems, scale, timestamp: new Date().toISOString() });
    localStorage.setItem('metriq_leads', JSON.stringify(existing));
  } catch {}

  // Si online, también guardar en Supabase
  if (!OFFLINE_MODE) {
    try {
      await supabase.from('leads').insert({
        email, role, rubro,
        problems: problems || [],
        scale,
        user_agent:   userAgent   || navigator.userAgent,
        screen_width: screenWidth || window.innerWidth,
      });
    } catch {
      // No bloquear el flujo si falla el guardado del lead
    }
  }
}
