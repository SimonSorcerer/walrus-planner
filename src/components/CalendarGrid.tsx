import type { ActivityType, Session } from '../types';
import { iso } from '../lib/dates';
import { DayCell } from './DayCell';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Props {
  cells: Date[];
  view: 'month' | 'week';
  anchorMonth: number;
  todayIso: string;
  sessionsByDate: Record<string, Session[]>;
  addingDate: string | null;
  onToggleAdding: (date: string) => void;
  onCloseAdding: () => void;
  onAdd: (date: string, type: ActivityType) => void;
  onCycle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function CalendarGrid({
  cells,
  view,
  anchorMonth,
  todayIso,
  sessionsByDate,
  addingDate,
  onToggleAdding,
  onCloseAdding,
  onAdd,
  onCycle,
  onRemove,
}: Props) {
  return (
    <div>
      <div className="dow-row">
        {DAY_NAMES.map((name) => (
          <div key={name} className="dow">
            {name}
          </div>
        ))}
      </div>
      <div className="grid">
        {cells.map((d) => {
          const key = iso(d);
          return (
            <DayCell
              key={key}
              dateIso={key}
              dayNumber={d.getDate()}
              inMonth={view === 'week' || d.getMonth() === anchorMonth}
              isToday={key === todayIso}
              big={view === 'week'}
              sessions={sessionsByDate[key] ?? []}
              pickerOpen={addingDate === key}
              onTogglePicker={onToggleAdding}
              onClosePicker={onCloseAdding}
              onAdd={onAdd}
              onCycle={onCycle}
              onRemove={onRemove}
            />
          );
        })}
      </div>
    </div>
  );
}
