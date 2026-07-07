import type { Badge } from '../lib/gamification';

export function BadgeStrip({ badges }: { badges: Badge[] }) {
  if (badges.length === 0) return null;
  return (
    <div className="badges">
      {badges.map((b) => (
        <div key={b.text} className={b.good ? 'badge badge--good' : 'badge badge--warn'}>
          <span aria-hidden="true">{b.icon}</span>
          {b.text}
        </div>
      ))}
    </div>
  );
}
