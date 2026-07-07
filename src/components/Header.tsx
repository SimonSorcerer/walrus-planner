export type View = 'month' | 'week';

interface Props {
  headline: string;
  points: number;
  view: View;
  onViewChange: (view: View) => void;
  onNav: (dir: -1 | 1) => void;
  onOpenSettings: () => void;
}

export function Header({ headline, points, view, onViewChange, onNav, onOpenSettings }: Props) {
  return (
    <header className="header">
      <div>
        <div className="header__eyebrow">Fit sessions</div>
        <h1 className="header__title">{headline}</h1>
      </div>
      <div className="header__controls">
        <div className="points">
          <div className="points__value">{points}</div>
          <div className="points__label">points</div>
        </div>
        <button
          type="button"
          className={view === 'week' ? 'btn btn--active' : 'btn'}
          aria-pressed={view === 'week'}
          onClick={() => onViewChange('week')}
        >
          Week
        </button>
        <button
          type="button"
          className={view === 'month' ? 'btn btn--active' : 'btn'}
          aria-pressed={view === 'month'}
          onClick={() => onViewChange('month')}
        >
          Month
        </button>
        <button type="button" className="btn" aria-label="Previous" onClick={() => onNav(-1)}>
          ‹
        </button>
        <button type="button" className="btn" aria-label="Next" onClick={() => onNav(1)}>
          ›
        </button>
        <button type="button" className="btn" aria-label="Settings" onClick={onOpenSettings}>
          ⚙
        </button>
      </div>
    </header>
  );
}
