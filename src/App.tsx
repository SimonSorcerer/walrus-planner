import { useMemo, useState } from 'react';
import { BadgeStrip } from './components/BadgeStrip';
import { CalendarGrid } from './components/CalendarGrid';
import { Header, type View } from './components/Header';
import { useSessions } from './hooks/useSessions';
import { iso, monthGrid, weekOf } from './lib/dates';
import { computeStats } from './lib/gamification';
import type { Session } from './types';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function App() {
  const { sessions, add, cycle, remove } = useSessions();
  const [view, setView] = useState<View>('month');
  const [anchor, setAnchor] = useState(() => new Date());
  const [adding, setAdding] = useState<string | null>(null);

  const todayIso = iso(new Date());
  const stats = useMemo(() => computeStats(sessions), [sessions]);
  const sessionsByDate = useMemo(() => {
    const map: Record<string, Session[]> = {};
    for (const s of sessions) (map[s.date] ??= []).push(s);
    return map;
  }, [sessions]);

  const nav = (dir: -1 | 1) =>
    setAnchor((a) => {
      const d = new Date(a);
      if (view === 'month') {
        d.setDate(1); // avoid day-31 overflow skipping a month
        d.setMonth(d.getMonth() + dir);
      } else {
        d.setDate(d.getDate() + 7 * dir);
      }
      return d;
    });

  const cells =
    view === 'month' ? monthGrid(anchor.getFullYear(), anchor.getMonth()) : weekOf(anchor);
  const headline =
    view === 'month'
      ? `${MONTHS[anchor.getMonth()]} ${anchor.getFullYear()}`
      : `Week of ${cells[0].getDate()} ${MONTHS[cells[0].getMonth()].slice(0, 3)} ${cells[0].getFullYear()}`;

  return (
    <div className="app">
      <Header
        headline={headline}
        points={stats.points}
        view={view}
        onViewChange={setView}
        onNav={nav}
      />
      <BadgeStrip badges={stats.badges} />
      <CalendarGrid
        cells={cells}
        view={view}
        anchorMonth={anchor.getMonth()}
        todayIso={todayIso}
        sessionsByDate={sessionsByDate}
        addingDate={adding}
        onToggleAdding={(date) => setAdding((cur) => (cur === date ? null : date))}
        onCloseAdding={() => setAdding(null)}
        onAdd={add}
        onCycle={cycle}
        onRemove={remove}
      />
      <div className="legend">
        <span>Tap a day to add a session</span>
        <span>Tap a session to cycle: planned → done → partial → skipped</span>
        <span className="legend__points">done +10 · partial +4 · skipped 0 (and it haunts you)</span>
      </div>
    </div>
  );
}
