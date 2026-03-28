// ═══════════════════════════════════════════════════════════════
// ganttCalendar.js — utilidades de fecha puras y testeables
// ═══════════════════════════════════════════════════════════════

export const MONTH_NAMES_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
export const MONTH_NAMES_FULL_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
export const DAY_NAMES_SHORT = ['Do','Lu','Ma','Mi','Ju','Vi','Sá'];

// Feriados Argentina 2026 (inamovibles + trasladables estimados)
const AR_HOLIDAYS = new Set([
  '2026-01-01','2026-02-16','2026-02-17',
  '2026-03-24','2026-04-02','2026-04-03','2026-04-04',
  '2026-05-01','2026-05-25',
  '2026-06-15','2026-06-20',
  '2026-07-09',
  '2026-08-17',
  '2026-10-12',
  '2026-11-20',
  '2026-12-08','2026-12-25',
]);

/** Parsea 'YYYY-MM-DD' → Date (sin zona horaria) */
export function parseDate(str) {
  if (!str) return new Date();
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Date → 'YYYY-MM-DD' */
export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/** Hoy en formato 'YYYY-MM-DD' */
export const today = () => formatDate(new Date());

/** Días calendario entre dos fechas (positivo si b > a) */
export function daysBetween(aStr, bStr) {
  return Math.round((parseDate(bStr) - parseDate(aStr)) / 86400000);
}

/** Suma n días calendario a dateStr */
export function addCalendarDays(dateStr, n) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + n);
  return formatDate(d);
}

/** ¿Es fin de semana? */
export function isWeekend(dateStr) {
  const dow = parseDate(dateStr).getDay();
  return dow === 0 || dow === 6;
}

/** ¿Es feriado AR? */
export function isHoliday(dateStr) {
  return AR_HOLIDAYS.has(dateStr);
}

/** ¿Es día hábil? */
export function isWorkingDay(dateStr) {
  return !isWeekend(dateStr) && !isHoliday(dateStr);
}

/** Array de todas las fechas entre start y end (inclusive) */
export function dateRange(startStr, endStr) {
  const dates = [];
  const end = parseDate(endStr);
  const cur = parseDate(startStr);
  while (cur <= end) {
    dates.push(formatDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

/** Menor de dos fechas */
export function minDateStr(a, b) { return a <= b ? a : b; }
/** Mayor de dos fechas */
export function maxDateStr(a, b) { return a >= b ? a : b; }

/** Duración en días (inclusive: start=end → 1 día) */
export function taskDuration(startStr, endStr) {
  return daysBetween(startStr, endStr) + 1;
}
