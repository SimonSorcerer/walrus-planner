/** Local-time ISO date, 'YYYY-MM-DD' — never goes through UTC. */
export function iso(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Parse 'YYYY-MM-DD' as local midnight. */
export function parseIso(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Monday on or before the given date. */
function startOfWeek(d: Date): Date {
  const start = new Date(d);
  start.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return start;
}

/**
 * Cells for a month view: whole Monday-started weeks covering the month,
 * including leading/trailing days of the neighbouring months.
 */
export function monthGrid(year: number, month: number): Date[] {
  const cur = startOfWeek(new Date(year, month, 1));
  const cells: Date[] = [];
  do {
    cells.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  } while (cells.length % 7 !== 0 || cur.getMonth() === month);
  return cells;
}

/** The Mon–Sun week containing the anchor date. */
export function weekOf(anchor: Date): Date[] {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}
