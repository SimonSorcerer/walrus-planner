export type ActivityType = 'lift' | 'run' | 'hike';
export type SessionStatus = 'planned' | 'done' | 'partial' | 'skipped';

export interface Session {
  id: string; // crypto.randomUUID()
  date: string; // 'YYYY-MM-DD' (local time)
  type: ActivityType;
  status: SessionStatus;
}

export const ACTIVITIES: Record<ActivityType, { label: string; icon: string }> = {
  lift: { label: 'Lift', icon: '▲' },
  run: { label: 'Run', icon: '●' },
  hike: { label: 'Hike', icon: '◆' },
};

export const ACTIVITY_TYPES = Object.keys(ACTIVITIES) as ActivityType[];

// status cycle: planned → done → partial → skipped → planned
export const NEXT_STATUS: Record<SessionStatus, SessionStatus> = {
  planned: 'done',
  done: 'partial',
  partial: 'skipped',
  skipped: 'planned',
};

export const POINTS: Record<SessionStatus, number> = {
  planned: 0,
  done: 10,
  partial: 4,
  skipped: 0,
};
