import { ACTIVITIES, type Session } from '../types';

interface Props {
  session: Session;
  big: boolean;
  onCycle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function SessionChip({ session, big, onCycle, onRemove }: Props) {
  const activity = ACTIVITIES[session.type];
  const label =
    session.status === 'planned' ? activity.label : `${activity.label} · ${session.status}`;

  return (
    <div
      role="button"
      tabIndex={0}
      className={big ? 'chip chip--big' : 'chip'}
      data-type={session.type}
      data-status={session.status}
      title={`${activity.label} — ${session.status} (click to change)`}
      onClick={(e) => {
        e.stopPropagation();
        onCycle(session.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          onCycle(session.id);
        }
      }}
    >
      <span className="chip__icon msym" aria-hidden="true">
        {activity.icon}
      </span>
      <span className="chip__label">{label}</span>
      <button
        type="button"
        className="chip__remove"
        title="Remove"
        aria-label={`Remove ${activity.label}`}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(session.id);
        }}
      >
        ×
      </button>
    </div>
  );
}
