# CLAUDE.md — Fit Sessions Calendar

## What this is

A single-page web app for planning and tracking fitness sessions (weightlifting, running, hiking) on a calendar, with lightweight gamification (points, badges, skip warnings). No auth, no backend, one user (me), one page. Keep it minimal — do not add features beyond this file.

A reference implementation exists in `reference/fit-calendar.jsx` (single-file React prototype with inline styles). Treat it as the source of truth for **behavior and visual design**, not for code structure — restructure it properly.

## Stack

- Vite + React 18 + TypeScript (strict mode)
- No UI framework, no CSS-in-JS. Plain CSS modules or a single `styles.css` with CSS custom properties.
- No state library — `useState`/`useReducer` + one custom hook is enough.
- Persistence: `localStorage` (key `fit-sessions-v1`). Serialize the sessions array as JSON; hydrate on load; write on every mutation. (The prototype is in-memory only because it ran in a sandbox — persistence IS wanted here.)
- Date handling: native `Date` is fine, no date library. Weeks start on **Monday**. Dates are stored as ISO strings `YYYY-MM-DD` (local time, never UTC conversion).

## Data model

```ts
type ActivityType = 'lift' | 'run' | 'hike';
type SessionStatus = 'planned' | 'done' | 'partial' | 'skipped';

interface Session {
    id: string; // crypto.randomUUID()
    date: string; // 'YYYY-MM-DD'
    type: ActivityType;
    status: SessionStatus;
}
```

## Behavior spec

### Calendar

- Two views: **month** (grid, Mon–Sun columns, leading/trailing days dimmed and non-interactive) and **week** (7 tall columns).
- Prev/next navigation moves by one month or one week depending on view.
- Today's cell has a magenta border and magenta day number.
- Click an (in-month) day cell → open a small inline picker with 3 activity buttons → clicking one adds a `planned` session for that day and closes the picker. Clicking the day again toggles the picker closed.
- Click a session chip → cycle status: `planned → done → partial → skipped → planned`.
- Chip has a small `×` to delete (stopPropagation so it doesn't trigger cycle/add).

### Chip rendering by status

- planned: white bg, activity-colored 2px border + text
- done: activity-colored bg, white text
- partial: left half activity color, right half white (hard 50% split, no gradient blend)
- skipped: gray bg, muted strikethrough text

### Gamification

- Points: done +10, partial +4, skipped/planned 0. Sum over all sessions, shown in a dark-magenta block in the header.
- Streak: iterate past-or-today sessions newest-first; done/partial increments, skipped breaks, planned is ignored.
- Badges (computed, not stored):
    - "First session done" — ≥1 done
    - "N sessions without a skip" — streak ≥ 3
    - "Perfect run" — all past sessions done and ≥3 of them
    - Warning "N skips in the last 7 days" — ≥2 skipped in trailing 7 days (red styling)
    - "Couch potato risk" — ≥4 skips in trailing 7 days (red)
- Badges render as pill chips under the header; positive = magenta outline, negative = red (#C2412D) outline.

## Design tokens (do not deviate)

```css
--magenta: #a0146b; /* primary accent */
--magenta-dark: #6e0b49; /* points block, focus rings */
--ink: #26191f;
--muted: #9a8a92;
--bg: #fbf7f9;
--line: #e9dee4;
--run: #1f7a6d;
--hike: #b07a1e;
--warn: #c2412d;
```

- Flat design: **no shadows, no gradients** (the partial-status split is a hard color stop, not a fade), 2px solid borders, border-radius 4–6px, white cards on `--bg`.
- Font: Sora (Google Fonts), weights 400/600/700/800. System fallback.
- Activity icons are plain glyphs: lift ▲, run ●, hike ◆.

## Quality floor

- Responsive down to ~375px (iPhone). Month cells may shrink; chips truncate.
- Visible `:focus-visible` outlines (3px `--magenta-dark`).
- Buttons are real `<button>` elements; day cells get `role="button"` or keyboard handling.
- `prefers-reduced-motion` respected if any transitions are added.

## Structure

```
src/
  types.ts            // Session, ActivityType, SessionStatus, constants (ACTIVITIES, POINTS, NEXT_STATUS)
  lib/dates.ts        // iso(), monthGrid(), weekOf() — pure, unit-testable
  lib/gamification.ts // computeStats(sessions) — pure
  hooks/useSessions.ts// state + localStorage persistence + add/cycle/remove
  components/         // Header, BadgeStrip, CalendarGrid, DayCell, SessionChip, AddPicker
  App.tsx
  styles.css
```

## Conventions

- Pure functions in `lib/` with unit tests (Vitest) for `monthGrid`, `weekOf`, streak, and badge thresholds — these have the fiddly edge cases (month boundaries, Monday-start weeks, timezone-safe ISO dates).
- No `any`. No dead code. No extra dependencies without asking.
- Commit style: small, conventional commits (`feat:`, `fix:`, `refactor:`).
- If something in this spec conflicts with the reference JSX, this file wins; ask if genuinely ambiguous.
