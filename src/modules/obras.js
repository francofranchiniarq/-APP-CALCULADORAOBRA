/* ═══════════════════════════════════════════════════════════════
   Metriq — Sistema de Obras (persistencia localStorage)

   Estructura:
   - Obra: { id, nombre, direccion, cliente, creada, actualizada, calculos: [] }
   - Calculo: { id, moduloId, moduloName, fecha, valores, resultado }

   Cada obra agrupa cálculos de distintos módulos.
   Un usuario puede tener múltiples obras activas.
   ═══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "metriq_obras";

// ─── Helpers ───

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(obras) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obras));
}

// ─── Obras CRUD ───

export function getObras() {
  return load().sort((a, b) => new Date(b.actualizada) - new Date(a.actualizada));
}

export function getObra(obraId) {
  return load().find(o => o.id === obraId) || null;
}

export function crearObra({ nombre, direccion = "", cliente = "", tipo = "Vivienda Unifamiliar", estado = "activo", presupuesto = 0, avance = 0, modulos = [] }) {
  const obras = load();
  const nueva = {
    id: uid(),
    nombre,
    direccion,
    cliente,
    tipo,
    estado,
    presupuesto,
    avance,
    modulos,
    creada: new Date().toISOString(),
    actualizada: new Date().toISOString(),
    calculos: [],
  };
  obras.push(nueva);
  save(obras);
  return nueva;
}

export function editarObra(obraId, datos) {
  const obras = load();
  const idx = obras.findIndex(o => o.id === obraId);
  if (idx === -1) return null;
  obras[idx] = { ...obras[idx], ...datos, actualizada: new Date().toISOString() };
  save(obras);
  return obras[idx];
}

export function eliminarObra(obraId) {
  const obras = load().filter(o => o.id !== obraId);
  save(obras);
}

// ─── Cálculos dentro de una Obra ───

export function guardarCalculo(obraId, { moduloId, moduloName, valores, resultado }) {
  const obras = load();
  const obra = obras.find(o => o.id === obraId);
  if (!obra) return null;

  const calculo = {
    id: uid(),
    moduloId,
    moduloName,
    fecha: new Date().toISOString(),
    valores,
    resultado,
  };

  obra.calculos.push(calculo);
  obra.actualizada = new Date().toISOString();
  save(obras);
  return calculo;
}

export function getCalculosDeObra(obraId, moduloId = null) {
  const obra = getObra(obraId);
  if (!obra) return [];
  if (moduloId) return obra.calculos.filter(c => c.moduloId === moduloId);
  return obra.calculos;
}

export function eliminarCalculo(obraId, calculoId) {
  const obras = load();
  const obra = obras.find(o => o.id === obraId);
  if (!obra) return;
  obra.calculos = obra.calculos.filter(c => c.id !== calculoId);
  obra.actualizada = new Date().toISOString();
  save(obras);
}

// ─── Obra activa (última seleccionada) ───

const ACTIVE_KEY = "metriq_obra_activa";

export function getObraActiva() {
  const id = localStorage.getItem(ACTIVE_KEY);
  return id ? getObra(id) : null;
}

export function setObraActiva(obraId) {
  localStorage.setItem(ACTIVE_KEY, obraId);
}
