import { useEffect, useState } from 'react';
import { NEXT_STATUS, type ActivityType, type Session } from '../types';

const STORAGE_KEY = 'fit-sessions-v1';

function load(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Session[]) : [];
  } catch {
    return [];
  }
}

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const add = (date: string, type: ActivityType) =>
    setSessions((ss) => [...ss, { id: crypto.randomUUID(), date, type, status: 'planned' }]);

  const cycle = (id: string) =>
    setSessions((ss) => ss.map((s) => (s.id === id ? { ...s, status: NEXT_STATUS[s.status] } : s)));

  const remove = (id: string) => setSessions((ss) => ss.filter((s) => s.id !== id));

  return { sessions, add, cycle, remove };
}
