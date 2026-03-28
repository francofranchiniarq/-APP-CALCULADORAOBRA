/* ═══════════════════════════════════════════════════════════════
   Metriq — SVG Icon System
   Minimalist stroke-based icons, 24x24 viewBox
   ═══════════════════════════════════════════════════════════════ */

const I = ({ children, size = 24, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
);

// ─── Module Icons ───

export const IconDrywall = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="12" y1="3" x2="12" y2="21" />
  </I>
);

export const IconPlumbing = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <path d="M6 4v4a2 2 0 002 2h8a2 2 0 002-2V4" />
    <path d="M12 10v10" />
    <path d="M8 20h8" />
    <circle cx="12" cy="6" r="0.5" fill="currentColor" stroke="none" />
  </I>
);

export const IconThermo = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" />
    <line x1="11.5" y1="8" x2="11.5" y2="15" strokeWidth="2" />
  </I>
);

export const IconElectric = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="none" />
  </I>
);

export const IconStructure = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <path d="M4 20h16" />
    <path d="M6 20V10" />
    <path d="M18 20V10" />
    <path d="M4 10h16" />
    <path d="M12 4v6" />
    <path d="M8 4h8" />
  </I>
);

export const IconBudget = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
  </I>
);

// ─── Feature Icons (Landing) ───

export const IconSpeed = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 1.5" />
    <path d="M5 3l2 2" />
    <path d="M19 3l-2 2" />
  </I>
);

export const IconScan = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <path d="M4 7V4h3" />
    <path d="M20 7V4h-3" />
    <path d="M4 17v3h3" />
    <path d="M20 17v3h-3" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 5v2" />
    <path d="M12 17v2" />
    <path d="M5 12h2" />
    <path d="M17 12h2" />
  </I>
);

export const IconGrid = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </I>
);

export const IconDevice = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <rect x="5" y="2" width="14" height="20" rx="3" />
    <line x1="10" y1="18" x2="14" y2="18" />
  </I>
);

// ─── ROI Icons ───

export const IconTarget = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </I>
);

export const IconClock = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </I>
);

export const IconTrophy = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M7 4h10v5a5 5 0 01-10 0V4z" />
    <path d="M7 7H4a1 1 0 00-1 1v1a3 3 0 003 3h1" />
    <path d="M17 7h3a1 1 0 011 1v1a3 3 0 01-3 3h-1" />
  </I>
);

// ─── Role Icons (Onboarding) ───

export const IconWrench = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </I>
);

export const IconCompass = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <circle cx="12" cy="12" r="9" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" fill="currentColor" stroke="none" opacity="0.3" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" />
  </I>
);

export const IconBuilding = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <rect x="4" y="6" width="16" height="15" rx="1" />
    <path d="M9 21V16h6v5" />
    <path d="M4 6l8-4 8 4" />
    <line x1="8" y1="10" x2="8" y2="10.01" strokeWidth="2" />
    <line x1="12" y1="10" x2="12" y2="10.01" strokeWidth="2" />
    <line x1="16" y1="10" x2="16" y2="10.01" strokeWidth="2" />
    <line x1="8" y1="13" x2="8" y2="13.01" strokeWidth="2" />
    <line x1="12" y1="13" x2="12" y2="13.01" strokeWidth="2" />
    <line x1="16" y1="13" x2="16" y2="13.01" strokeWidth="2" />
  </I>
);

// ─── New Feature Icons ───

export const IconComputo = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6" />
    <path d="M9 16h4" />
  </I>
);

export const IconGantt = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <path d="M3 3v18h18" />
    <rect x="7" y="6" width="8" height="3" rx="1" fill="currentColor" opacity="0.2" />
    <rect x="7" y="6" width="8" height="3" rx="1" />
    <rect x="10" y="11" width="6" height="3" rx="1" fill="currentColor" opacity="0.2" />
    <rect x="10" y="11" width="6" height="3" rx="1" />
    <rect x="6" y="16" width="10" height="3" rx="1" fill="currentColor" opacity="0.2" />
    <rect x="6" y="16" width="10" height="3" rx="1" />
  </I>
);

export const IconMaterials = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <path d="M3.27 6.96L12 12.01l8.73-5.05" />
    <path d="M12 22.08V12" />
  </I>
);

export const IconComparator = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <path d="M18 20V10" />
    <path d="M12 20V4" />
    <path d="M6 20v-6" />
    <circle cx="18" cy="8" r="2" />
    <circle cx="12" cy="4" r="2" />
    <circle cx="6" cy="12" r="2" />
  </I>
);

export const IconReport = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M8 13h8" />
    <path d="M8 17h5" />
  </I>
);

export const IconRuler = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <path d="M16 3l5 5-14 14-5-5z" />
    <path d="M10 10l1.5-1.5" />
    <path d="M13 7l1.5-1.5" />
    <path d="M7 13l1.5-1.5" />
  </I>
);

export const IconGasFlame = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <path d="M12 22c-4.97 0-7-3.58-7-7 0-4 3-7.5 4-9 .53 1.5 2 3 3.5 3C14 9 13 6 12 4c3.5 2 7 5.92 7 11 0 3.42-2.03 7-7 7z" />
    <path d="M12 22c-1.66 0-3-1.5-3-3.5 0-2 1.5-3.5 3-5 1.5 1.5 3 3 3 5s-1.34 3.5-3 3.5z" />
  </I>
);

export const IconWater = ({ size, color }) => (
  <I size={size} style={{ color }}>
    <path d="M12 2C8 8 5 11.5 5 15a7 7 0 0014 0c0-3.5-3-7-7-13z" />
    <path d="M9.5 16a2.5 2.5 0 005 0" opacity="0.5" />
  </I>
);

// ─── Icon Map (for data-driven rendering) ───

export const ICON_MAP = {
  drywall: IconDrywall,
  plumbing: IconPlumbing,
  water: IconWater,
  gasflame: IconGasFlame,
  thermo: IconThermo,
  electric: IconElectric,
  structure: IconStructure,
  budget: IconBudget,
  speed: IconSpeed,
  scan: IconScan,
  grid: IconGrid,
  device: IconDevice,
  target: IconTarget,
  clock: IconClock,
  trophy: IconTrophy,
  wrench: IconWrench,
  compass: IconCompass,
  building: IconBuilding,
  computo: IconComputo,
  gantt: IconGantt,
  materials: IconMaterials,
  comparator: IconComparator,
  report: IconReport,
  ruler: IconRuler,
};

export function RenderIcon({ name, size = 24, color = "currentColor" }) {
  const Comp = ICON_MAP[name];
  return Comp ? <Comp size={size} color={color} /> : null;
}
