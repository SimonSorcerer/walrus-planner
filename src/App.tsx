import { useMemo, useState, type CSSProperties } from 'react';
import { BadgeStrip } from './components/BadgeStrip';
import { CalendarGrid } from './components/CalendarGrid';
import { Header, type View } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { useSessions } from './hooks/useSessions';
import { useSettings } from './hooks/useSettings';
import { iso, monthGrid, weekOf } from './lib/dates';
import { computeStats } from './lib/gamification';
import { ACTIVITY_TYPES, type Session } from './types';

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
  const { colors, setColor, reset } = useSettings();
  const [view, setView] = useState<View>('month');
  const [anchor, setAnchor] = useState(() => new Date());
  const [adding, setAdding] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const todayIso = iso(new Date());
  // expose activity colors as CSS custom properties; styles.css maps them per data-type
  const colorVars = useMemo(
    () =>
      Object.fromEntries(
        ACTIVITY_TYPES.map((t) => [`--color-${t}`, colors[t]]),
      ) as CSSProperties,
    [colors],
  );
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
    <div className="app" style={colorVars}>
      <Header
        headline={headline}
        points={stats.points}
        view={view}
        onViewChange={setView}
        onNav={nav}
        onOpenSettings={() => setSettingsOpen(true)}
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
      <SettingsModal
        open={settingsOpen}
        colors={colors}
        onSetColor={setColor}
        onReset={reset}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
