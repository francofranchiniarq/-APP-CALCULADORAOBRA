// ═══════════════════════════════════════════════════════════════
// Mock data — reemplazar por API cuando exista backend
// ═══════════════════════════════════════════════════════════════

export const MOCK_PROJECTS = [
  {
    id: 1, name: "Edificio Rosario Centro", type: "Edificio Residencial",
    status: "activo", budget: 185000000, progress: 65, lastUpdate: "hace 2 días",
    modules: ['estruct', 'agua', 'cloacal', 'gas', 'electrico', 'presup', 'gantt'],
  },
  {
    id: 2, name: "Casa Ibarlucea", type: "Vivienda Unifamiliar",
    status: "activo", budget: 42000000, progress: 30, lastUpdate: "hace 1 semana",
    modules: ['agua', 'cloacal', 'electrico', 'presup'],
  },
  {
    id: 3, name: "Local Comercial Pellegrini", type: "Comercial",
    status: "presupuesto", budget: 28000000, progress: 0, lastUpdate: "hace 3 días",
    modules: ['electrico', 'termo', 'presup'],
  },
  {
    id: 4, name: "Refacción PH Pichincha", type: "Reforma",
    status: "finalizado", budget: 15000000, progress: 100, lastUpdate: "hace 2 semanas",
    modules: ['seco', 'agua', 'presup'],
  },
];

export const MOCK_QUOTES = [
  { id: 1, client: "García, Familia",      address: "Av. Pellegrini 1240", date: "25/03/2026", total: 485000,  status: "enviado"   },
  { id: 2, client: "Martínez, Roberto",    address: "San Martín 780",      date: "22/03/2026", total: 320000,  status: "aprobado"  },
  { id: 3, client: "López Construcciones", address: "Córdoba 2100",        date: "18/03/2026", total: 1240000, status: "pendiente" },
  { id: 4, client: "Sánchez, María",       address: "Bv. Oroño 450",       date: "15/03/2026", total: 195000,  status: "enviado"   },
];

export const fmtPeso = (n) => '$ ' + n.toLocaleString('es-AR', { maximumFractionDigits: 0 });
