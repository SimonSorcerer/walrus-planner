import { useEffect, useState } from 'react';
import { ACTIVITY_TYPES, DEFAULT_COLORS, type ActivityType } from '../types';

const STORAGE_KEY = 'fit-settings-v1';

export type ActivityColors = Record<ActivityType, string>;

function load(): ActivityColors {
  const colors = { ...DEFAULT_COLORS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return colors;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      const stored = parsed as Partial<Record<ActivityType, unknown>>;
      for (const type of ACTIVITY_TYPES) {
        const value = stored[type];
        if (typeof value === 'string') colors[type] = value;
      }
    }
  } catch {
    // corrupt storage — fall back to defaults
  }
  return colors;
}

export function useSettings() {
  const [colors, setColors] = useState<ActivityColors>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
  }, [colors]);

  const setColor = (type: ActivityType, color: string) =>
    setColors((c) => ({ ...c, [type]: color }));

  const reset = () => setColors({ ...DEFAULT_COLORS });

  return { colors, setColor, reset };
}
