/* ═══════════════════════════════════════════════════════════════
   Metriq — Sistema de Planes
   Configuración central de tiers, módulos y límites.
   Toda la lógica de acceso se consulta desde acá.
   ═══════════════════════════════════════════════════════════════ */

// ─── Definición de planes ───

export const PLAN_TIERS = {
  free: {
    id: 'free',
    label: 'Free',
    tagline: 'Para empezar',
    price: 'Gratis',
    priceDetail: 'para siempre',
    color: 'var(--text3)',
    bg: 'var(--bg)',
    maxProjects: 3,
    modules: ['seco', 'agua', 'cloacal', 'gas', 'electrico', 'termo'],
    features: [
      '6 calculadoras de rubros',
      'Hasta 3 proyectos',
      'Guardado local',
    ],
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    tagline: 'Para profesionales',
    price: '$4.990',
    priceDetail: '/mes',
    color: 'var(--accent)',
    bg: 'var(--abg)',
    maxProjects: Infinity,
    modules: ['seco', 'agua', 'cloacal', 'gas', 'electrico', 'termo', 'estruct', 'gantt', 'presup'],
    features: [
      'Todas las calculadoras',
      'Estructuras + Gantt',
      'Presupuestos profesionales',
      'Proyectos ilimitados',
      'Exportar a PDF',
    ],
    recommended: true,
  },
  enterprise: {
    id: 'enterprise',
    label: 'Enterprise',
    tagline: 'Para empresas',
    price: '$12.990',
    priceDetail: '/mes',
    color: 'var(--blue)',
    bg: 'rgba(29,78,216,0.07)',
    maxProjects: Infinity,
    modules: ['seco', 'agua', 'cloacal', 'gas', 'electrico', 'termo', 'estruct', 'gantt', 'presup'],
    features: [
      'Todo de Pro',
      'Múltiples usuarios',
      'Dashboard de equipo',
      'Soporte prioritario',
      'API de integración',
    ],
  },
};

// ─── IDs de los módulos que solo se desbloquean con Pro o superior ───

export const PRO_MODULES = ['estruct', 'gantt', 'presup'];

// ─── Helpers ───

/** Devuelve el plan del usuario (default: 'free') */
export function getUserPlan(user) {
  return PLAN_TIERS[user?.plan] || PLAN_TIERS.free;
}

/** ¿El usuario puede acceder a este módulo? */
export function canAccessModule(user, moduleId) {
  const plan = getUserPlan(user);
  return plan.modules.includes(moduleId);
}

/** ¿El usuario puede crear más proyectos? */
export function canCreateProject(user, currentCount) {
  const plan = getUserPlan(user);
  return currentCount < plan.maxProjects;
}

/** ¿Este módulo requiere upgrade? */
export function isProModule(moduleId) {
  return PRO_MODULES.includes(moduleId);
}

/** Plan mínimo requerido para un módulo */
export function requiredPlanForModule(moduleId) {
  if (PRO_MODULES.includes(moduleId)) return 'pro';
  return 'free';
}

/** Cuántos proyectos le quedan al usuario */
export function remainingProjects(user, currentCount) {
  const plan = getUserPlan(user);
  if (plan.maxProjects === Infinity) return Infinity;
  return Math.max(0, plan.maxProjects - currentCount);
}
