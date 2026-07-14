import type { ActivityType, Session } from '../types';
import { AddPicker } from './AddPicker';
import { SessionChip } from './SessionChip';

interface Props {
  dateIso: string;
  dayNumber: number;
  dayName?: string; // shown in week view, where there is no column header
  inMonth: boolean;
  isToday: boolean;
  big: boolean;
  sessions: Session[];
  pickerOpen: boolean;
  onTogglePicker: (date: string) => void;
  onClosePicker: () => void;
  onAdd: (date: string, type: ActivityType) => void;
  onCycle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function DayCell({
  dateIso,
  dayNumber,
  dayName,
  inMonth,
  isToday,
  big,
  sessions,
  pickerOpen,
  onTogglePicker,
  onClosePicker,
  onAdd,
  onCycle,
  onRemove,
}: Props) {
  const classes = [
    'day',
    big && 'day--big',
    isToday && 'day--today',
    !inMonth && 'day--out',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      role={inMonth ? 'button' : undefined}
      tabIndex={inMonth ? 0 : undefined}
      aria-label={inMonth ? `${dateIso}, add a session` : undefined}
      onClick={inMonth ? () => onTogglePicker(dateIso) : undefined}
      onKeyDown={
        inMonth
          ? (e) => {
              if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
                e.preventDefault();
                onTogglePicker(dateIso);
              }
            }
          : undefined
      }
    >
      <div className="day__number">
        {dayName && <span className="day__name">{dayName}</span>}
        {dayNumber}
      </div>
      <div className="day__sessions">
        {sessions.map((s) => (
          <SessionChip key={s.id} session={s} big={big} onCycle={onCycle} onRemove={onRemove} />
        ))}
      </div>
      {pickerOpen && inMonth && (
        <AddPicker onPick={(type) => onAdd(dateIso, type)} onClose={onClosePicker} />
      )}
    </div>
  );
}
