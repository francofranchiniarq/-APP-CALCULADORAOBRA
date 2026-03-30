/* ═══════════════════════════════════════════════════════════════
   Metriq — Storage Sync Service

   Problema resuelto: en entornos efímeros (contenedores, sandboxes,
   private browsing) el localStorage del navegador se resetea entre
   sesiones. Este servicio mantiene un espejo en el servidor de Vite
   (filesystem local) para restaurar los datos al recargar.

   Flujo:
     1. Al iniciar la app (main.jsx): restoreFromServer()
        → lee cada key del servidor → la escribe en localStorage
     2. Al guardar cualquier dato: backupToServer(key, value)
        → fire-and-forget, no bloquea la UI

   MIGRACIÓN A BACKEND REAL (Supabase/Firebase):
     Solo hay que cambiar BACKUP_URL por la URL de tu API y
     agregar los headers de autenticación en las funciones de abajo.
   ═══════════════════════════════════════════════════════════════ */

const BACKUP_URL = '/api/storage';

// Claves que se sincronizan automáticamente
const SYNC_KEYS = [
  'metriq_user',
  'metriq_obras',
  'metriq_obra_activa',
  'metriq_leads',
];

// ─── Backup: localStorage → servidor ─────────────────────────

export async function backupToServer(key, value) {
  try {
    await fetch(`${BACKUP_URL}/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
  } catch {
    // Silencioso — el backup es best-effort, no debe romper la UI
  }
}

// ─── Restore: servidor → localStorage ────────────────────────

export async function restoreFromServer() {
  // También restaurar claves de proyectos individuales (metriq_project_*)
  const extraKeys = [];
  try {
    const obrasRaw = localStorage.getItem('metriq_obras');
    if (obrasRaw) {
      const obras = JSON.parse(obrasRaw);
      obras.forEach(o => extraKeys.push(`metriq_project_${o.id}`));
    }
  } catch { /* sin datos previos */ }

  const allKeys = [...SYNC_KEYS, ...extraKeys];

  await Promise.allSettled(
    allKeys.map(async (key) => {
      // Solo restaurar si localStorage está vacío para esa key
      if (localStorage.getItem(key) !== null) return;
      try {
        const res = await fetch(`${BACKUP_URL}/${key}`);
        if (!res.ok) return;
        const { value } = await res.json();
        if (value !== null && value !== undefined) {
          localStorage.setItem(key, value);
        }
      } catch { /* servidor no disponible */ }
    })
  );
}

// ─── Patch: intercepta localStorage.setItem para auto-backup ──
// Llamar una sola vez al inicio (en main.jsx).
// Solo parchea las claves de SYNC_KEYS para no afectar otras libs.

export function patchLocalStorage() {
  const originalSetItem = localStorage.setItem.bind(localStorage);

  localStorage.setItem = function(key, value) {
    originalSetItem(key, value);
    // Backup automático solo para claves de Metriq
    if (key.startsWith('metriq_')) {
      backupToServer(key, value);
    }
  };
}
