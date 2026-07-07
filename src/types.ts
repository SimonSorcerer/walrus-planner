export type ActivityType =
    | 'weights'
    | 'run'
    | 'hike'
    | 'swim'
    | 'bike'
    | 'trail'
    | 'climb'
    | 'walk';
export type SessionStatus = 'planned' | 'done' | 'partial' | 'skipped';

export interface Session {
    id: string; // crypto.randomUUID()
    date: string; // 'YYYY-MM-DD' (local time)
    type: ActivityType;
    status: SessionStatus;
}

// icon = Material Symbols ligature name (rendered via the .msym class)
export const ACTIVITIES: Record<ActivityType, { label: string; icon: string }> =
    {
        weights: { label: 'Weights', icon: 'exercise' },
        run: { label: 'Run', icon: 'directions_run' },
        hike: { label: 'Hike', icon: 'hiking' },
        swim: { label: 'Swim', icon: 'pool' },
        bike: { label: 'Bike', icon: 'directions_bike' },
        trail: { label: 'Trail', icon: 'sprint' },
        climb: { label: 'Climb', icon: 'mountain_flag' },
        walk: { label: 'Walk', icon: 'directions_walk' },
    };

/** Preset swatches for the settings modal — flat, dark enough for white chip text. */
export const PALETTE: readonly string[] = [
    '#a0146b', // magenta
    '#7048b6', // violet
    '#3d5aa9', // indigo
    '#0e7490', // azure
    '#1f7a6d', // teal
    '#567d1e', // moss
    '#b07a1e', // ochre
    '#bc5215', // rust
    '#c2412d', // red
    '#6e6276', // slate
];

export const DEFAULT_COLORS: Record<ActivityType, string> = {
    weights: '#a0146b',
    run: '#1f7a6d',
    hike: '#b07a1e',
    swim: '#0e7490',
    bike: '#bc5215',
    trail: '#7048b6',
    climb: '#6e6276',
    walk: '#567d1e',
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
