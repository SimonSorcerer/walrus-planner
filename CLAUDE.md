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
type ActivityType = 'weights' | 'run' | 'hike' | 'swim' | 'bike' | 'trail' | 'climb' | 'walk';
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

- Two views: **month** (grid, Mon–Sun columns, leading/trailing days dimmed and non-interactive) and **week** (agenda-style: the 7 days stacked as full-width rows, Mon–Sun; each row carries its own weekday label, chips flow horizontally and wrap, so labels don't truncate).
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

### Settings (activity colors)

- Gear button (`⚙`) at the end of the header controls opens a settings modal (native `<dialog>`, Esc and backdrop-click close it).
- One row per activity type: icon + label + a radiogroup of 10 preset color swatches. Clicking a swatch assigns that color to the activity everywhere (chips, picker buttons). Free color input is deliberately not offered.
- "Reset to defaults" button restores the default color mapping.
- Persistence: `localStorage` key `fit-settings-v1`, a JSON object `Record<ActivityType, string>`. Unknown/missing keys fall back to defaults on load.
- Colors are applied via CSS custom properties `--color-<type>` set on the app root; `[data-type]` rules in `styles.css` map them to `--activity`.

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

- Activity colors are user-configurable (see Settings) from a fixed 10-swatch palette (flat, dark enough for white chip text): `#a0146b` magenta, `#7048b6` violet, `#3d5aa9` indigo, `#0e7490` azure, `#1f7a6d` teal, `#567d1e` moss, `#b07a1e` ochre, `#bc5215` rust, `#c2412d` red, `#6e6276` slate. Defaults: weights magenta, run teal, hike ochre, swim azure, bike rust, trail violet, climb slate, walk moss.
- Flat design: **no shadows, no gradients** (the partial-status split is a hard color stop, not a fade), 2px solid borders, border-radius 4–6px, white cards on `--bg`.
- Font: Sora (Google Fonts), weights 400/600/700/800. System fallback.
- Activity icons are Google **Material Symbols** (Outlined, variable), loaded from Google Fonts subset to exactly the 8 icons via `icon_names=` with `display=block` (same pattern as Sora). They render as ligature text inside a `.msym` span; `ACTIVITIES[type].icon` holds the ligature name. Mapping: weights `exercise`, run `directions_run`, hike `hiking`, swim `pool`, bike `directions_bike`, trail `sprint`, climb `mountain_flag`, walk `directions_walk`.
- Icon sizes: 12px in month chips (compact — week view is the detail view), 16px in week chips, 16px picker buttons (20px in week view), 18px in settings rows. Solid `done` chips use the filled variant (`FILL 1`); `partial` chip icons get the same `mix-blend-mode: difference` as the label.

## Quality floor

- Responsive down to ~375px (iPhone). Month cells may shrink; chips truncate.
- Visible `:focus-visible` outlines (3px `--magenta-dark`).
- Buttons are real `<button>` elements; day cells get `role="button"` or keyboard handling.
- `prefers-reduced-motion` respected if any transitions are added.

## Structure

```
src/
  types.ts            // Session, ActivityType, SessionStatus, constants (ACTIVITIES, POINTS, NEXT_STATUS, PALETTE, DEFAULT_COLORS)
  lib/dates.ts        // iso(), monthGrid(), weekOf() — pure, unit-testable
  lib/gamification.ts // computeStats(sessions) — pure
  hooks/useSessions.ts// state + localStorage persistence + add/cycle/remove
  hooks/useSettings.ts// activity colors + localStorage persistence
  components/         // Header, BadgeStrip, CalendarGrid, DayCell, SessionChip, AddPicker, SettingsModal
  App.tsx
  styles.css
```

## Conventions

- Pure functions in `lib/` with unit tests (Vitest) for `monthGrid`, `weekOf`, streak, and badge thresholds — these have the fiddly edge cases (month boundaries, Monday-start weeks, timezone-safe ISO dates).
- No `any`. No dead code. No extra dependencies without asking.
- Commit style: small, conventional commits (`feat:`, `fix:`, `refactor:`).
- If something in this spec conflicts with the reference JSX, this file wins; ask if genuinely ambiguous.
