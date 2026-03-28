/* ═══════════════════════════════════════════════════════════════
   Metriq — Interactive Isometric Scenes
   Rotating 3D cutaway illustrations per rubro with hotspots
   ═══════════════════════════════════════════════════════════════ */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Isometric transform helper ───
// Standard isometric: skewY(30deg) scaleY(0.866) or manual drawing
// We'll draw at iso angles directly in SVG for cleaner look

const SCENES = [
  {
    id: "presupuesto",
    label: "Cómputos y Presupuestos",
    color: "#E0024E",
    hotspots: [
      { x: 80, y: 55, label: "Cómputo métrico", desc: "Consolidá todos los rubros", side: "left" },
      { x: 290, y: 42, label: "Costos unitarios", desc: "ARS/USD en tiempo real", side: "right" },
      { x: 55, y: 155, label: "Cronograma Gantt", desc: "Etapas y dependencias", side: "left" },
      { x: 265, y: 175, label: "Presupuesto PDF", desc: "Multi-rubro con tu logo", side: "right" },
    ],
  },
  {
    id: "seco",
    label: "Construcción en Seco",
    color: "#E0024E",
    hotspots: [
      { x: 120, y: 30, label: "Montantes", desc: "Montantes, soleras y rieles", side: "left" },
      { x: 285, y: 60, label: "Placas", desc: "Optimización de corte y despiece", side: "right" },
      { x: 80, y: 125, label: "Aislación", desc: "Lana de vidrio / EPS", side: "left" },
      { x: 260, y: 165, label: "Tornillería", desc: "T1, T2 y fix por placa", side: "right" },
    ],
  },
  {
    id: "sanitario",
    label: "Sanitario y Gas",
    color: "#3B9AE1",
    hotspots: [
      { x: 80, y: 55, label: "Agua fría", desc: "Caños y accesorios por diámetro", side: "left" },
      { x: 270, y: 45, label: "Agua caliente", desc: "Termofusión, epoxi y PPR", side: "right" },
      { x: 250, y: 140, label: "Desagüe", desc: "UD, pendientes y accesorios PVC", side: "right" },
      { x: 60, y: 165, label: "Gas NAG 200", desc: "Renouard + listado accesorios", side: "left" },
    ],
  },
  {
    id: "electrico",
    label: "Eléctrico",
    color: "#F5A623",
    hotspots: [
      { x: 85, y: 50, label: "Tablero", desc: "Protecciones y llaves", side: "left" },
      { x: 280, y: 40, label: "Conductores", desc: "Metros de cable y caños por circuito", side: "right" },
      { x: 160, y: 140, label: "Luminotecnia", desc: "LEDs y lux por ambiente", side: "left" },
      { x: 265, y: 155, label: "Tomacorrientes", desc: "Bocas, circuitos y caída de tensión", side: "right" },
    ],
  },
  {
    id: "estructura",
    label: "Estructuras",
    color: "#8B9DAF",
    hotspots: [
      { x: 140, y: 30, label: "Hormigón", desc: "Dosificación H-21/H-30", side: "left" },
      { x: 275, y: 55, label: "Acero", desc: "Despiece de armaduras", side: "right" },
      { x: 75, y: 100, label: "Encofrado", desc: "m² de fenólico", side: "left" },
      { x: 260, y: 165, label: "Colado", desc: "Logística y mixer", side: "right" },
    ],
  },
];

// ─── SVG Scene Drawings ───

function ScenePresupuesto({ activeHotspot }) {
  return (
    <g>
      {/* Floor grid */}
      <path d="M60,170 L180,110 L300,170 L180,230Z" fill="rgba(224,2,78,0.04)" stroke="rgba(224,2,78,0.15)" strokeWidth="1"/>
      {/* Grid lines on floor */}
      <path d="M90,155 L210,215" stroke="rgba(224,2,78,0.08)" strokeWidth="0.5"/>
      <path d="M120,140 L240,200" stroke="rgba(224,2,78,0.08)" strokeWidth="0.5"/>
      <path d="M150,125 L270,185" stroke="rgba(224,2,78,0.08)" strokeWidth="0.5"/>
      <path d="M120,185 L240,125" stroke="rgba(224,2,78,0.08)" strokeWidth="0.5"/>
      <path d="M90,200 L210,140" stroke="rgba(224,2,78,0.08)" strokeWidth="0.5"/>

      {/* Clipboard / document */}
      <rect x="100" y="40" width="80" height="100" rx="4" fill="rgba(20,20,25,0.9)" stroke="#E0024E" strokeWidth="1.2"/>
      <rect x="120" y="35" width="40" height="12" rx="3" fill="#E0024E" opacity="0.8"/>
      {/* Lines on document */}
      <line x1="112" y1="60" x2="168" y2="60" stroke="rgba(224,2,78,0.4)" strokeWidth="1.5"/>
      <line x1="112" y1="72" x2="155" y2="72" stroke="rgba(224,2,78,0.25)" strokeWidth="1"/>
      <line x1="112" y1="82" x2="160" y2="82" stroke="rgba(224,2,78,0.25)" strokeWidth="1"/>
      <line x1="112" y1="92" x2="148" y2="92" stroke="rgba(224,2,78,0.25)" strokeWidth="1"/>
      <line x1="112" y1="102" x2="165" y2="102" stroke="rgba(224,2,78,0.25)" strokeWidth="1"/>
      {/* Total box */}
      <rect x="112" y="112" width="56" height="16" rx="2" fill="rgba(224,2,78,0.15)" stroke="#E0024E" strokeWidth="0.8"/>
      <text x="140" y="124" fill="#E0024E" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">$1.250.000</text>

      {/* Gantt chart floating */}
      <g transform="translate(210, 55)">
        <rect x="0" y="0" width="95" height="75" rx="4" fill="rgba(20,20,25,0.9)" stroke="rgba(224,2,78,0.3)" strokeWidth="1"/>
        {/* Gantt bars */}
        <rect x="30" y="12" width="40" height="7" rx="2" fill="#E0024E" opacity="0.7"/>
        <rect x="38" y="24" width="30" height="7" rx="2" fill="#561820" opacity="0.8"/>
        <rect x="25" y="36" width="50" height="7" rx="2" fill="#E0024E" opacity="0.5"/>
        <rect x="45" y="48" width="35" height="7" rx="2" fill="#561820" opacity="0.6"/>
        {/* Y labels */}
        <text x="8" y="19" fill="#8E8E93" fontSize="5" fontFamily="JetBrains Mono">ET1</text>
        <text x="8" y="31" fill="#8E8E93" fontSize="5" fontFamily="JetBrains Mono">ET2</text>
        <text x="8" y="43" fill="#8E8E93" fontSize="5" fontFamily="JetBrains Mono">ET3</text>
        <text x="8" y="55" fill="#8E8E93" fontSize="5" fontFamily="JetBrains Mono">ET4</text>
        {/* Time axis */}
        <line x1="25" y1="62" x2="88" y2="62" stroke="rgba(224,2,78,0.2)" strokeWidth="0.5"/>
        <text x="30" y="69" fill="#6B7280" fontSize="4" fontFamily="JetBrains Mono">S1</text>
        <text x="50" y="69" fill="#6B7280" fontSize="4" fontFamily="JetBrains Mono">S2</text>
        <text x="70" y="69" fill="#6B7280" fontSize="4" fontFamily="JetBrains Mono">S3</text>
      </g>

      {/* Calculator floating element */}
      <g transform="translate(45, 130)">
        <rect x="0" y="0" width="60" height="45" rx="4" fill="rgba(20,20,25,0.9)" stroke="rgba(224,2,78,0.25)" strokeWidth="1"/>
        <text x="30" y="16" fill="#E0024E" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">m² = 127</text>
        <text x="30" y="28" fill="#8E8E93" fontSize="5" textAnchor="middle" fontFamily="JetBrains Mono">Bolsas: 42</text>
        <text x="30" y="38" fill="#8E8E93" fontSize="5" textAnchor="middle" fontFamily="JetBrains Mono">Hierro: 890kg</text>
      </g>

      {/* Connection lines */}
      <line x1="180" y1="115" x2="140" y2="140" stroke="rgba(224,2,78,0.15)" strokeWidth="0.5" strokeDasharray="3,3"/>
      <line x1="180" y1="115" x2="250" y2="90" stroke="rgba(224,2,78,0.15)" strokeWidth="0.5" strokeDasharray="3,3"/>
    </g>
  );
}

function SceneSeco({ activeHotspot }) {
  return (
    <g>
      {/* Floor */}
      <path d="M60,200 L180,140 L300,200 L180,260Z" fill="rgba(224,2,78,0.03)" stroke="rgba(224,2,78,0.1)" strokeWidth="0.8"/>

      {/* Back wall - isometric */}
      <path d="M80,190 L80,50 L200,0 L200,130Z" fill="rgba(20,20,25,0.7)" stroke="rgba(224,2,78,0.2)" strokeWidth="1"/>

      {/* Montantes (vertical studs) */}
      {[0, 30, 60, 90].map((offset, i) => (
        <g key={i}>
          <line x1={95 + offset * 0.5} y1={180 - offset * 1.1} x2={95 + offset * 0.5} y2={55 - offset * 0.4}
            stroke="#E0024E" strokeWidth="2.5" opacity={activeHotspot === 0 ? 1 : 0.6}/>
        </g>
      ))}

      {/* Top runner (solera superior) */}
      <line x1="90" y1="55" x2="140" y2="22" stroke="#E0024E" strokeWidth="2" opacity="0.8"/>
      {/* Bottom runner */}
      <line x1="90" y1="182" x2="140" y2="148" stroke="#E0024E" strokeWidth="2" opacity="0.8"/>

      {/* Front placa (plasterboard) */}
      <path d="M200,130 L200,0 L310,45 L310,185Z" fill="rgba(224,2,78,0.06)" stroke="rgba(224,2,78,0.3)" strokeWidth="1.2"
        opacity={activeHotspot === 1 ? 1 : 0.7}/>
      {/* Placa texture lines */}
      <line x1="220" y1="15" x2="220" y2="150" stroke="rgba(224,2,78,0.08)" strokeWidth="0.5"/>
      <line x1="260" y1="30" x2="260" y2="170" stroke="rgba(224,2,78,0.08)" strokeWidth="0.5"/>

      {/* Insulation between studs */}
      <g opacity={activeHotspot === 2 ? 0.9 : 0.4}>
        {[0, 1, 2].map(i => (
          <path key={i} d={`M${100 + i * 15},${165 - i * 30} Q${108 + i * 15},${150 - i * 30} ${100 + i * 15},${135 - i * 30} Q${92 + i * 15},${120 - i * 30} ${100 + i * 15},${105 - i * 30}`}
            fill="none" stroke="#F5A623" strokeWidth="4" opacity="0.3"/>
        ))}
      </g>

      {/* Screws */}
      <g opacity={activeHotspot === 3 ? 1 : 0.5}>
        {[[210, 30], [210, 70], [210, 110], [250, 50], [250, 90], [250, 130], [290, 70], [290, 110], [290, 150]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="1.5" fill="#E0024E"/>
        ))}
      </g>

      {/* Dimension line */}
      <g opacity="0.6">
        <line x1="93" y1="195" x2="143" y2="160" stroke="#E0024E" strokeWidth="0.5"/>
        <text x="110" y="172" fill="#E0024E" fontSize="6" fontWeight="bold" fontFamily="JetBrains Mono" transform="rotate(-25, 110, 172)">400mm</text>
      </g>
    </g>
  );
}

function SceneSanitario({ activeHotspot }) {
  return (
    <g>
      {/* Floor */}
      <path d="M50,200 L180,135 L310,200 L180,265Z" fill="rgba(59,154,225,0.03)" stroke="rgba(59,154,225,0.12)" strokeWidth="0.8"/>

      {/* Wall back */}
      <path d="M50,200 L50,70 L180,10 L180,135Z" fill="rgba(20,20,25,0.6)" stroke="rgba(59,154,225,0.15)" strokeWidth="0.8"/>
      {/* Wall right */}
      <path d="M180,135 L180,10 L310,70 L310,200Z" fill="rgba(20,20,25,0.5)" stroke="rgba(59,154,225,0.12)" strokeWidth="0.8"/>

      {/* Cold water pipe - blue */}
      <g opacity={activeHotspot === 0 ? 1 : 0.6}>
        <path d="M80,60 L80,160 L130,135 L130,90" fill="none" stroke="#3B9AE1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="80" cy="60" r="3" fill="#3B9AE1"/>
        <circle cx="130" cy="90" r="3" fill="#3B9AE1"/>
      </g>

      {/* Hot water pipe - red */}
      <g opacity={activeHotspot === 1 ? 1 : 0.6}>
        <path d="M95,55 L95,150 L145,125 L145,80" fill="none" stroke="#E0024E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="95" cy="55" r="3" fill="#E0024E"/>
        <circle cx="145" cy="80" r="3" fill="#E0024E"/>
      </g>

      {/* Drain pipe */}
      <g opacity={activeHotspot === 2 ? 1 : 0.5}>
        <path d="M200,180 L250,155 L250,100 L290,85" fill="none" stroke="#6B7280" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M250,155 L280,170" fill="none" stroke="#6B7280" strokeWidth="4.5" strokeLinecap="round"/>
        {/* Slope indicator */}
        <text x="220" y="162" fill="#6B7280" fontSize="5" fontFamily="JetBrains Mono" transform="rotate(-15, 220, 162)">2%↘</text>
      </g>

      {/* Gas pipe - yellow */}
      <g opacity={activeHotspot === 3 ? 1 : 0.6}>
        <path d="M60,100 L60,180 L110,155" fill="none" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6,3"/>
        <text x="55" y="95" fill="#F5A623" fontSize="5" fontWeight="bold" fontFamily="JetBrains Mono">GAS</text>
      </g>

      {/* Fixtures */}
      {/* Sink */}
      <ellipse cx="138" cy="108" rx="15" ry="8" fill="rgba(59,154,225,0.1)" stroke="rgba(59,154,225,0.4)" strokeWidth="1"/>
      {/* Toilet icon */}
      <ellipse cx="265" cy="135" rx="12" ry="7" fill="rgba(100,100,110,0.1)" stroke="rgba(100,100,110,0.3)" strokeWidth="1"/>
      <rect x="258" y="140" width="14" height="8" rx="2" fill="rgba(100,100,110,0.08)" stroke="rgba(100,100,110,0.25)" strokeWidth="0.8"/>

      {/* Measurement labels */}
      <g opacity="0.7">
        <rect x="195" y="80" width="48" height="16" rx="3" fill="rgba(20,20,25,0.9)" stroke="rgba(59,154,225,0.3)" strokeWidth="0.8"/>
        <text x="219" y="91" fill="#3B9AE1" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">UD: 4.5</text>
      </g>
    </g>
  );
}

function SceneElectrico({ activeHotspot }) {
  return (
    <g>
      {/* Floor */}
      <path d="M50,200 L180,135 L310,200 L180,265Z" fill="rgba(245,166,35,0.03)" stroke="rgba(245,166,35,0.1)" strokeWidth="0.8"/>

      {/* Walls */}
      <path d="M50,200 L50,70 L180,10 L180,135Z" fill="rgba(20,20,25,0.6)" stroke="rgba(245,166,35,0.12)" strokeWidth="0.8"/>
      <path d="M180,135 L180,10 L310,70 L310,200Z" fill="rgba(20,20,25,0.5)" stroke="rgba(245,166,35,0.1)" strokeWidth="0.8"/>

      {/* Tablero (panel) */}
      <g opacity={activeHotspot === 1 ? 1 : 0.7}>
        <rect x="60" y="75" width="35" height="50" rx="2" fill="rgba(20,20,25,0.9)" stroke="#F5A623" strokeWidth="1.5"/>
        {/* Breakers */}
        {[0, 1, 2, 3, 4].map(i => (
          <rect key={i} x="67" y={82 + i * 8} width="20" height="5" rx="1" fill={i < 3 ? "rgba(245,166,35,0.4)" : "rgba(245,166,35,0.15)"} stroke="#F5A623" strokeWidth="0.5"/>
        ))}
      </g>

      {/* Wiring - main circuits */}
      <g opacity={activeHotspot === 0 ? 1 : 0.5}>
        {/* Circuit 1 - to ceiling */}
        <path d="M95,90 L130,75 L130,35 L200,15" fill="none" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Circuit 2 - to wall outlets */}
        <path d="M95,100 L150,78 L240,50 L240,100" fill="none" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Circuit 3 - floor level */}
        <path d="M95,110 L130,95 L200,125 L270,95" fill="none" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4,2"/>
      </g>

      {/* Light fixtures */}
      <g opacity={activeHotspot === 2 ? 1 : 0.5}>
        {/* Ceiling light 1 */}
        <circle cx="160" cy="25" r="8" fill="none" stroke="#F5A623" strokeWidth="1"/>
        <circle cx="160" cy="25" r="3" fill="rgba(245,166,35,0.3)"/>
        {/* Light rays */}
        {[0, 60, 120, 180, 240, 300].map(angle => (
          <line key={angle} x1={160 + Math.cos(angle * Math.PI / 180) * 10} y1={25 + Math.sin(angle * Math.PI / 180) * 5}
            x2={160 + Math.cos(angle * Math.PI / 180) * 14} y2={25 + Math.sin(angle * Math.PI / 180) * 7}
            stroke="#F5A623" strokeWidth="0.5" opacity="0.5"/>
        ))}
        {/* Lux label */}
        <rect x="140" y="38" width="40" height="12" rx="2" fill="rgba(20,20,25,0.9)" stroke="rgba(245,166,35,0.3)" strokeWidth="0.5"/>
        <text x="160" y="47" fill="#F5A623" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">350 lux</text>
      </g>

      {/* Outlets */}
      <g opacity={activeHotspot === 3 ? 1 : 0.6}>
        {/* Outlet on right wall */}
        <rect x="238" y="120" width="12" height="8" rx="1.5" fill="rgba(20,20,25,0.8)" stroke="#F5A623" strokeWidth="1"/>
        <circle cx="242" cy="124" r="1" fill="#F5A623"/>
        <circle cx="246" cy="124" r="1" fill="#F5A623"/>
        {/* Another outlet */}
        <rect x="268" y="105" width="12" height="8" rx="1.5" fill="rgba(20,20,25,0.8)" stroke="#F5A623" strokeWidth="1"/>
        <circle cx="272" cy="109" r="1" fill="#F5A623"/>
        <circle cx="276" cy="109" r="1" fill="#F5A623"/>
      </g>

      {/* Section label */}
      <g opacity="0.6">
        <rect x="195" y="155" width="65" height="16" rx="3" fill="rgba(20,20,25,0.9)" stroke="rgba(245,166,35,0.3)" strokeWidth="0.8"/>
        <text x="227" y="166" fill="#F5A623" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">2.5mm² x3</text>
      </g>
    </g>
  );
}

function SceneEstructura({ activeHotspot }) {
  return (
    <g>
      {/* Foundation / floor */}
      <path d="M40,210 L180,145 L320,210 L180,275Z" fill="rgba(139,157,175,0.05)" stroke="rgba(139,157,175,0.15)" strokeWidth="1"/>

      {/* Column 1 left */}
      <g opacity={activeHotspot === 2 ? 0.5 : 1}>
        <path d="M80,200 L80,80 L100,70 L100,190Z" fill="rgba(139,157,175,0.12)" stroke="rgba(139,157,175,0.35)" strokeWidth="1.2"/>
      </g>
      {/* Column 2 right */}
      <g opacity={activeHotspot === 2 ? 0.5 : 1}>
        <path d="M260,165 L260,45 L280,35 L280,155Z" fill="rgba(139,157,175,0.12)" stroke="rgba(139,157,175,0.35)" strokeWidth="1.2"/>
      </g>

      {/* Beam connecting columns */}
      <g opacity={activeHotspot === 0 ? 1 : 0.7}>
        <path d="M80,80 L100,70 L280,35 L260,45Z" fill="rgba(139,157,175,0.1)" stroke="rgba(139,157,175,0.4)" strokeWidth="1.2"/>
        <path d="M80,80 L80,65 L100,55 L100,70Z" fill="rgba(139,157,175,0.08)" stroke="rgba(139,157,175,0.3)" strokeWidth="0.8"/>
        <path d="M100,55 L280,20 L280,35 L100,70Z" fill="rgba(139,157,175,0.06)" stroke="rgba(139,157,175,0.25)" strokeWidth="0.8"/>
      </g>

      {/* Rebar inside beam (visible through section) */}
      <g opacity={activeHotspot === 1 ? 1 : 0.5}>
        {/* Longitudinal rebar */}
        <line x1="90" y1="65" x2="270" y2="30" stroke="#E0024E" strokeWidth="1.2"/>
        <line x1="88" y1="75" x2="268" y2="40" stroke="#E0024E" strokeWidth="1.2"/>
        <line x1="92" y1="60" x2="272" y2="25" stroke="#E0024E" strokeWidth="1.2"/>
        {/* Stirrups */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <rect key={i} x={95 + i * 30} y={62 - i * 6} width="8" height="14" rx="1"
            fill="none" stroke="#E0024E" strokeWidth="0.8" opacity="0.7"
            transform={`skewY(-12)`}/>
        ))}
      </g>

      {/* Encofrado (formwork) transparent */}
      <g opacity={activeHotspot === 2 ? 1 : 0.3}>
        <path d="M75,85 L75,60 L95,50 L95,75Z" fill="none" stroke="#F5A623" strokeWidth="1" strokeDasharray="3,2"/>
        <path d="M255,50 L255,25 L275,15 L275,40Z" fill="none" stroke="#F5A623" strokeWidth="1" strokeDasharray="3,2"/>
        <text x="63" y="55" fill="#F5A623" fontSize="5" fontFamily="JetBrains Mono">ENCOF</text>
      </g>

      {/* Slab */}
      <path d="M60,90 L180,30 L310,90 L310,100 L180,40 L60,100Z" fill="rgba(139,157,175,0.06)" stroke="rgba(139,157,175,0.2)" strokeWidth="0.8"/>

      {/* Dosificación label */}
      <g opacity={activeHotspot === 0 ? 1 : 0.6}>
        <rect x="140" y="110" width="80" height="40" rx="4" fill="rgba(20,20,25,0.9)" stroke="rgba(139,157,175,0.3)" strokeWidth="0.8"/>
        <text x="180" y="124" fill="#8B9DAF" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">H-21 / m³</text>
        <text x="180" y="135" fill="#6B7280" fontSize="5" textAnchor="middle" fontFamily="JetBrains Mono">Cemento: 350kg</text>
        <text x="180" y="144" fill="#6B7280" fontSize="5" textAnchor="middle" fontFamily="JetBrains Mono">Arena: 0.65m³</text>
      </g>

      {/* Mixer truck icon */}
      <g opacity={activeHotspot === 3 ? 1 : 0.4} transform="translate(230, 155)">
        <rect x="0" y="5" width="30" height="15" rx="2" fill="rgba(20,20,25,0.8)" stroke="rgba(139,157,175,0.4)" strokeWidth="0.8"/>
        <ellipse cx="15" cy="8" rx="12" ry="6" fill="none" stroke="rgba(139,157,175,0.3)" strokeWidth="0.8"/>
        <circle cx="8" cy="22" r="3" fill="none" stroke="rgba(139,157,175,0.4)" strokeWidth="0.8"/>
        <circle cx="22" cy="22" r="3" fill="none" stroke="rgba(139,157,175,0.4)" strokeWidth="0.8"/>
        <text x="15" y="35" fill="#8B9DAF" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">8m³</text>
      </g>
    </g>
  );
}

// ─── Hotspot Component (always visible, scales on hover/click) ───

function Hotspot({ x, y, label, desc, isActive, onEnter, onLeave, onClick, color, side }) {
  const titleSize = 16;
  const descSize = 11.5;
  const boxW = Math.max(label.length * 10.5 + 30, desc.length * 7.2 + 30);
  const boxH = 58;
  const gap = 20;
  const isLeft = side === "left";
  const lx = isLeft ? x - boxW - gap : x + gap;
  const ly = y - boxH / 2;
  const lineEndX = isLeft ? lx + boxW + 4 : lx - 4;

  return (
    <g className="iso-hotspot" onMouseEnter={onEnter} onMouseLeave={onLeave} onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Pulse ring animation */}
      <circle cx={x} cy={y} r="10" fill="none" stroke={color} strokeWidth="1" opacity="0">
        <animate attributeName="r" from="8" to="22" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from="0.5" to="0" dur="2.5s" repeatCount="indefinite"/>
      </circle>

      {/* Dot */}
      <circle cx={x} cy={y} r={isActive ? 8 : 6} fill={isActive ? color : `${color}50`} stroke={color} strokeWidth="2"
        style={{ transition: 'all 0.25s ease' }}/>
      <circle cx={x} cy={y} r="2.5" fill="#fff" opacity={0.9}/>

      {/* Connection line from dot to label */}
      <line x1={x} y1={y} x2={lineEndX} y2={ly + boxH / 2}
        stroke={color} strokeWidth={isActive ? 1.5 : 0.8} opacity={isActive ? 0.7 : 0.3} strokeDasharray="4,4"
        style={{ transition: 'all 0.25s ease' }}/>

      {/* Label — always visible, scales on hover */}
      <g style={{
        transition: 'transform 0.3s ease',
        transform: isActive ? 'scale(1.1)' : 'scale(1)',
        transformOrigin: `${x}px ${y}px`,
      }}>
        <rect x={lx} y={ly} width={boxW} height={boxH} rx="8"
          fill={isActive ? "rgba(10,10,14,0.97)" : "rgba(10,10,14,0.85)"}
          stroke={color} strokeWidth={isActive ? 2 : 0.8}
          style={{ transition: 'all 0.25s ease' }}/>

        <text x={lx + 14} y={ly + 24} fill="#F5F5F7" fontSize={titleSize} fontWeight="bold" fontFamily="JetBrains Mono">{label}</text>
        <text x={lx + 14} y={ly + 44} fill="#8E8E93" fontSize={descSize} fontFamily="JetBrains Mono">{desc}</text>
      </g>
    </g>
  );
}

// ─── Scene Selector Dots ───

function SceneNav({ scenes, activeIndex, onChange, activeColor }) {
  return (
    <div className="iso-scene-nav">
      {scenes.map((scene, i) => (
        <button
          key={scene.id}
          className={`iso-scene-dot ${i === activeIndex ? 'active' : ''}`}
          onClick={() => onChange(i)}
          style={{
            background: i === activeIndex ? activeColor : 'rgba(255,255,255,0.1)',
            borderColor: i === activeIndex ? activeColor : 'rgba(255,255,255,0.15)',
          }}
        >
          <span className="iso-scene-dot-label">{scene.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───

const SCENE_COMPONENTS = [ScenePresupuesto, SceneSeco, SceneSanitario, SceneElectrico, SceneEstructura];

export default function IsometricScene() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [paused, setPaused] = useState(false);
  const scene = SCENES[sceneIndex];
  const SceneComponent = SCENE_COMPONENTS[sceneIndex];

  // Auto-rotate scenes every 5s, pause on interaction
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setSceneIndex(prev => (prev + 1) % SCENES.length);
      setActiveHotspot(null);
    }, 5000);
    return () => clearInterval(interval);
  }, [paused]);

  // Resume auto-rotation after 8s of no interaction
  useEffect(() => {
    if (!paused) return;
    const timeout = setTimeout(() => setPaused(false), 8000);
    return () => clearTimeout(timeout);
  }, [paused, activeHotspot]);

  const handleHotspotEnter = (i) => {
    setActiveHotspot(i);
    setPaused(true);
  };
  const handleHotspotLeave = () => {
    setActiveHotspot(null);
  };
  const handleSceneChange = (i) => {
    setSceneIndex(i);
    setActiveHotspot(null);
    setPaused(true);
  };

  return (
    <div className="iso-scene-wrap">
      {/* Scene label */}
      <div className="iso-scene-label" style={{ color: scene.color }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={sceneIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {scene.label}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* SVG Scene */}
      <div className="iso-scene-svg-wrap">
        <AnimatePresence mode="wait">
          <motion.div
            key={sceneIndex}
            className="iso-scene-float"
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <svg
              className="iso-scene-svg"
              viewBox="-160 -20 680 330"
              fill="none"
            >
              {/* Scene drawing */}
              <SceneComponent activeHotspot={activeHotspot} />

              {/* Interactive hotspots — always visible */}
              {scene.hotspots.map((hs, i) => (
                <Hotspot
                  key={i}
                  x={hs.x}
                  y={hs.y}
                  label={hs.label}
                  desc={hs.desc}
                  side={hs.side}
                  isActive={activeHotspot === i}
                  onEnter={() => handleHotspotEnter(i)}
                  onLeave={handleHotspotLeave}
                  onClick={() => handleHotspotEnter(i)}
                  color={scene.color}
                />
              ))}
            </svg>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scene navigation dots */}
      <SceneNav
        scenes={SCENES}
        activeIndex={sceneIndex}
        onChange={handleSceneChange}
        activeColor={scene.color}
      />
    </div>
  );
}
