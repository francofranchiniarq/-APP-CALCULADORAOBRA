import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

// ─── Storage Backup Plugin ────────────────────────────────────
// Persiste los datos del localStorage en el filesystem del servidor.
// Motivo: en entornos efímeros (contenedores, sandboxes) el browser
// se reinicia entre sesiones borrando localStorage. El filesystem
// del servidor SÍ persiste.
//
// Endpoints que expone:
//   GET  /api/storage/:key  → { value: string | null }
//   POST /api/storage/:key  → body: { value: string }
//
// PRODUCCIÓN: reemplazar estos endpoints con tu backend real
// (Supabase, Firebase, etc.) manteniendo la misma interfaz.

const DATA_DIR = resolve('.data');
const ALLOWED_KEYS = /^metriq_[a-zA-Z0-9_-]+$/;

function storageBackupPlugin() {
  return {
    name: 'metriq-storage-backup',
    configureServer(server) {
      server.middlewares.use('/api/storage', (req, res, next) => {
        // req.url es la ruta DESPUÉS del prefijo /api/storage
        const key = (req.url || '').replace(/^\//, '').split('?')[0];

        // Validar key para evitar path traversal
        if (!key || !ALLOWED_KEYS.test(key)) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Clave inválida' }));
          return;
        }

        const filePath = resolve(DATA_DIR, `${key}.json`);

        if (req.method === 'GET') {
          try {
            if (existsSync(filePath)) {
              const value = readFileSync(filePath, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ value }));
            } else {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ value: null }));
            }
          } catch {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Error de lectura' }));
          }
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { value } = JSON.parse(body);
              if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
              writeFileSync(filePath, value, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true }));
            } catch {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Error de escritura' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), storageBackupPlugin()],
})
