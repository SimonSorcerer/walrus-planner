import { describe, expect, it } from 'vitest';
import type { Session, SessionStatus } from '../types';
import { computeStats } from './gamification';

const TODAY = '2026-07-07';

let n = 0;
const mk = (date: string, status: SessionStatus): Session => ({
  id: `s${n++}`,
  date,
  type: 'run',
  status,
});

const hasBadge = (sessions: Session[], text: string) =>
  computeStats(sessions, TODAY).badges.some((b) => b.text.includes(text));

describe('points', () => {
  it('scores done +10, partial +4, skipped and planned 0', () => {
    const stats = computeStats(
      [
        mk('2026-07-01', 'done'),
        mk('2026-07-02', 'partial'),
        mk('2026-07-03', 'skipped'),
        mk('2026-07-10', 'planned'),
      ],
      TODAY,
    );
    expect(stats.points).toBe(14);
  });
});

describe('streak', () => {
  it('counts consecutive done/partial newest-first and breaks on a skip', () => {
    const stats = computeStats(
      [
        mk('2026-07-01', 'done'),
        mk('2026-07-02', 'skipped'),
        mk('2026-07-03', 'done'),
        mk('2026-07-04', 'partial'),
        mk('2026-07-05', 'done'),
      ],
      TODAY,
    );
    expect(stats.streak).toBe(3);
  });

  it('ignores planned sessions instead of breaking', () => {
    const stats = computeStats(
      [mk('2026-07-03', 'done'), mk('2026-07-05', 'planned'), mk('2026-07-06', 'done')],
      TODAY,
    );
    expect(stats.streak).toBe(2);
  });

  it('only considers sessions up to today', () => {
    const stats = computeStats([mk('2026-07-06', 'done'), mk('2026-07-09', 'skipped')], TODAY);
    expect(stats.streak).toBe(1);
  });
});

describe('badges', () => {
  it('awards "First session done" from one done session', () => {
    expect(hasBadge([mk('2026-07-01', 'done')], 'First session done')).toBe(true);
    expect(hasBadge([mk('2026-07-01', 'partial')], 'First session done')).toBe(false);
  });

  it('awards the no-skip badge at a streak of 3', () => {
    const two = [mk('2026-07-01', 'done'), mk('2026-07-02', 'partial')];
    expect(hasBadge(two, 'without a skip')).toBe(false);
    expect(hasBadge([...two, mk('2026-07-03', 'done')], 'without a skip')).toBe(true);
  });

  it('awards perfect run only when all 3+ past sessions are done', () => {
    const two = [mk('2026-07-01', 'done'), mk('2026-07-02', 'done')];
    expect(hasBadge(two, 'perfect run')).toBe(false);
    expect(hasBadge([...two, mk('2026-07-03', 'done')], 'perfect run')).toBe(true);
    expect(hasBadge([...two, mk('2026-07-03', 'partial')], 'perfect run')).toBe(false);
  });

  it('does not fail perfect run on future planned sessions', () => {
    const sessions = [
      mk('2026-07-01', 'done'),
      mk('2026-07-02', 'done'),
      mk('2026-07-03', 'done'),
      mk('2026-07-09', 'planned'),
    ];
    expect(hasBadge(sessions, 'perfect run')).toBe(true);
  });

  it('warns at 2 skips in the trailing 7 days', () => {
    const one = [mk('2026-07-02', 'skipped')];
    expect(hasBadge(one, 'skips in the last 7 days')).toBe(false);
    expect(hasBadge([...one, mk('2026-07-04', 'skipped')], 'skips in the last 7 days')).toBe(true);
  });

  it('flags couch potato risk at 4 recent skips', () => {
    const three = [
      mk('2026-07-01', 'skipped'),
      mk('2026-07-02', 'skipped'),
      mk('2026-07-03', 'skipped'),
    ];
    expect(hasBadge(three, 'Couch potato')).toBe(false);
    expect(hasBadge([...three, mk('2026-07-04', 'skipped')], 'Couch potato')).toBe(true);
  });

  it('ignores skips older than 7 days for warnings', () => {
    const sessions = [mk('2026-06-25', 'skipped'), mk('2026-07-06', 'skipped')];
    expect(hasBadge(sessions, 'skips in the last 7 days')).toBe(false);
  });
});
