// ═══════════════════════════════════════════════════════════════
// ganttColumns.js — Generador de columnas para la grilla del timeline
// ═══════════════════════════════════════════════════════════════

import {
  parseDate, formatDate, daysBetween,
  MONTH_NAMES_ES, MONTH_NAMES_FULL_ES,
} from './ganttCalendar.js';

/** Píxeles por día según nivel de zoom */
export const DAY_WIDTH = { day: 32, week: 16, month: 6 };

/** Altura fila de tarea (px) */
export const ROW_H = 40;

/** Altura total del header (2 filas × 28px) */
export const HEADER_H = 56;

/**
 * Genera toda la info de columnas para el timeline.
 *
 * @returns {Object} {
 *   topHeaders    — fila superior (meses o años)
 *   bottomHeaders — fila inferior (días, semanas o meses)
 *   totalWidth    — ancho total del timeline en px
 *   dayWidth      — px por día calendario
 *   dates         — array de strings 'YYYY-MM-DD' (un entry por día)
 * }
 */
export function generateColumns(startStr, endStr, zoom = 'week') {
  const dw = DAY_WIDTH[zoom] ?? DAY_WIDTH.week;
  const start = parseDate(startStr);
  const end   = parseDate(endStr);

  // Generar todos los días del rango
  const dates = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(formatDate(cur));
    cur.setDate(cur.getDate() + 1);
  }

  const totalWidth = dates.length * dw;
  const topHeaders    = buildTopHeaders(dates, dw);
  const bottomHeaders = buildBottomHeaders(dates, dw, zoom);

  return { topHeaders, bottomHeaders, totalWidth, dayWidth: dw, dates };
}

// ── Fila superior: siempre son meses (o años en zoom=month) ──
function buildTopHeaders(dates, dw) {
  const headers = [];
  let i = 0;
  while (i < dates.length) {
    const d = parseDate(dates[i]);
    const curMonth = d.getMonth();
    const curYear  = d.getFullYear();
    let j = i;
    while (
      j < dates.length &&
      parseDate(dates[j]).getMonth()    === curMonth &&
      parseDate(dates[j]).getFullYear() === curYear
    ) j++;
    headers.push({
      label: `${MONTH_NAMES_FULL_ES[curMonth]} ${curYear}`,
      x:     i * dw,
      width: (j - i) * dw,
    });
    i = j;
  }
  return headers;
}

// ── Fila inferior: depende del zoom ──────────────────────────
function buildBottomHeaders(dates, dw, zoom) {
  if (zoom === 'day') {
    return dates.map((d, i) => {
      const dt  = parseDate(d);
      const dow = dt.getDay();
      return {
        label:     String(dt.getDate()),
        subLabel:  ['D','L','M','M','J','V','S'][dow],
        date:      d,
        x:         i * dw,
        width:     dw,
        isWeekend: dow === 0 || dow === 6,
      };
    });
  }

  if (zoom === 'week') {
    // Una celda por semana, empezando en el lunes de cada semana
    const headers = [];
    let i = 0;
    while (i < dates.length) {
      const dt  = parseDate(dates[i]);
      const dow = dt.getDay(); // 0=Dom … 6=Sáb
      // Días hasta el próximo domingo (fin de semana)
      const daysLeft = dow === 0 ? 7 : 7 - dow;
      const span = Math.min(daysLeft, dates.length - i);
      headers.push({
        label:  `${dt.getDate()}/${dt.getMonth() + 1}`,
        date:   dates[i],
        x:      i * dw,
        width:  span * dw,
      });
      i += span;
    }
    return headers;
  }

  // zoom === 'month'
  const headers = [];
  let i = 0;
  while (i < dates.length) {
    const d     = parseDate(dates[i]);
    const month = d.getMonth();
    const year  = d.getFullYear();
    let j = i;
    while (j < dates.length && parseDate(dates[j]).getMonth() === month && parseDate(dates[j]).getFullYear() === year) j++;
    headers.push({
      label: MONTH_NAMES_ES[month],
      date:  dates[i],
      x:     i * dw,
      width: (j - i) * dw,
    });
    i = j;
  }
  return headers;
}

// ── Conversiones X ↔ fecha ───────────────────────────────────

/** Fecha → posición X en píxeles */
export function dateToX(dateStr, timelineStartStr, dw) {
  const days = daysBetween(timelineStartStr, dateStr);
  return days * dw;
}

/** Posición X → fecha string */
export function xToDate(x, timelineStartStr, dw) {
  const days = Math.round(x / dw);
  const d = parseDate(timelineStartStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}
