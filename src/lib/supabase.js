// ══════════════════════════════════════════════════════════════
// Metriq — Supabase client
//
// MODO OFFLINE: si las variables de entorno no están configuradas,
// la app funciona con localStorage (desarrollo / demo).
// MODO ONLINE: con VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
// la app usa Supabase Auth + PostgreSQL.
// ══════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || '';
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/** true = sin Supabase → usa localStorage como antes */
export const OFFLINE_MODE =
  !SUPABASE_URL ||
  SUPABASE_URL.startsWith('PASTE_') ||
  SUPABASE_URL === '';

export const supabase = OFFLINE_MODE
  ? null
  : createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: {
        autoRefreshToken: true,
        persistSession:   true,
        detectSessionInUrl: true,
      },
    });

if (OFFLINE_MODE) {
  console.info('[Metriq] Modo offline — configurá VITE_SUPABASE_URL para activar auth y DB persistente.');
}
