import { POINTS, type Session } from '../types';
import { iso, parseIso } from './dates';

export interface Badge {
  icon: string;
  text: string;
  good: boolean;
}

export interface Stats {
  points: number;
  streak: number;
  badges: Badge[];
}

const DAY_MS = 86_400_000;

export function computeStats(sessions: Session[], todayIso: string = iso(new Date())): Stats {
  const points = sessions.reduce((sum, s) => sum + POINTS[s.status], 0);

  const past = sessions.filter((s) => s.date <= todayIso);
  const doneCount = past.filter((s) => s.status === 'done').length;

  const today = parseIso(todayIso).getTime();
  const skippedRecent = past.filter(
    (s) => s.status === 'skipped' && (today - parseIso(s.date).getTime()) / DAY_MS <= 7,
  ).length;

  // streak: consecutive done/partial sessions newest-first, broken by a skip; planned is ignored
  let streak = 0;
  for (const s of [...past].sort((a, b) => (a.date < b.date ? 1 : -1))) {
    if (s.status === 'done' || s.status === 'partial') streak++;
    else if (s.status === 'skipped') break;
  }

  const badges: Badge[] = [];
  if (doneCount >= 1) {
    badges.push({ icon: '✓', text: 'First session done', good: true });
  }
  if (streak >= 3) {
    badges.push({ icon: '⚡', text: `${streak} sessions without a skip`, good: true });
  }
  if (past.length >= 3 && past.every((s) => s.status === 'done')) {
    badges.push({ icon: '★', text: 'Everything completed — perfect run', good: true });
  }
  if (skippedRecent >= 2) {
    badges.push({ icon: '!', text: `${skippedRecent} skips in the last 7 days`, good: false });
  }
  if (skippedRecent >= 4) {
    badges.push({ icon: '✕', text: 'Couch potato risk — get moving', good: false });
  }

  return { points, streak, badges };
}
