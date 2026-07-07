import { describe, expect, it } from 'vitest';
import { iso, monthGrid, parseIso, weekOf } from './dates';

describe('iso', () => {
  it('formats with zero padding', () => {
    expect(iso(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(iso(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  it('round-trips with parseIso', () => {
    expect(iso(parseIso('2026-07-07'))).toBe('2026-07-07');
  });
});

describe('monthGrid', () => {
  it('starts on Monday and is a whole number of weeks', () => {
    for (const [y, m] of [
      [2026, 0],
      [2026, 6],
      [2026, 11],
      [2024, 1],
    ] as const) {
      const cells = monthGrid(y, m);
      expect(cells[0].getDay()).toBe(1); // Monday
      expect(cells.length % 7).toBe(0);
    }
  });

  it('contains every day of the month exactly once', () => {
    const cells = monthGrid(2026, 6); // July 2026 has 31 days
    const inMonth = cells.filter((d) => d.getMonth() === 6);
    expect(inMonth).toHaveLength(31);
    expect(new Set(inMonth.map((d) => d.getDate())).size).toBe(31);
  });

  it('includes leading days from the previous month', () => {
    // 1 July 2026 is a Wednesday, so the grid starts Monday 29 June
    expect(iso(monthGrid(2026, 6)[0])).toBe('2026-06-29');
  });

  it('starts on the 1st when the month begins on Monday', () => {
    expect(iso(monthGrid(2026, 5)[0])).toBe('2026-06-01'); // June 2026
  });

  it('fits a Monday-starting 28-day February in exactly 4 rows', () => {
    expect(monthGrid(2021, 1)).toHaveLength(28);
  });

  it('spans year boundaries', () => {
    const cells = monthGrid(2026, 0); // 1 Jan 2026 is a Thursday
    expect(iso(cells[0])).toBe('2025-12-29');
    expect(iso(cells[cells.length - 1])).toBe('2026-02-01');
  });
});

describe('weekOf', () => {
  it('returns the Mon–Sun week containing the anchor', () => {
    const week = weekOf(new Date(2026, 6, 7)); // Tuesday 7 July 2026
    expect(week.map(iso)).toEqual([
      '2026-07-06',
      '2026-07-07',
      '2026-07-08',
      '2026-07-09',
      '2026-07-10',
      '2026-07-11',
      '2026-07-12',
    ]);
  });

  it('treats Sunday as the last day of the week, not the first', () => {
    const week = weekOf(new Date(2026, 6, 12)); // Sunday 12 July 2026
    expect(iso(week[0])).toBe('2026-07-06');
    expect(iso(week[6])).toBe('2026-07-12');
  });

  it('crosses month boundaries', () => {
    const week = weekOf(new Date(2026, 7, 1)); // Saturday 1 Aug 2026
    expect(iso(week[0])).toBe('2026-07-27');
    expect(iso(week[6])).toBe('2026-08-02');
  });
});
