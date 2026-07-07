import { useState, useMemo } from "react";

// ---------- constants ----------
const MAGENTA = "#A0146B";
const MAGENTA_DARK = "#6E0B49";
const INK = "#26191F";
const MUTED = "#9A8A92";
const BG = "#FBF7F9";
const LINE = "#E9DEE4";

const ACTIVITIES = {
  lift: { label: "Lift", color: MAGENTA, icon: "▲" },
  run: { label: "Run", color: "#1F7A6D", icon: "●" },
  hike: { label: "Hike", color: "#B07A1E", icon: "◆" },
};

// status cycle: planned → done → partial → skipped → planned
const NEXT_STATUS = { planned: "done", done: "partial", partial: "skipped", skipped: "planned" };
const POINTS = { done: 10, partial: 4, skipped: 0, planned: 0 };

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const today = new Date();
const TODAY = iso(today);

// seed a believable current month
function seed() {
  const y = today.getFullYear(), m = today.getMonth();
  const mk = (day, type, status) => ({ id: `${day}-${type}-${Math.random()}`, date: iso(new Date(y, m, day)), type, status });
  const d = today.getDate();
  return [
    mk(Math.max(1, d - 6), "lift", "done"),
    mk(Math.max(1, d - 5), "run", "done"),
    mk(Math.max(1, d - 3), "hike", "partial"),
    mk(Math.max(1, d - 2), "lift", "skipped"),
    mk(d, "run", "planned"),
    mk(Math.min(28, d + 2), "lift", "planned"),
    mk(Math.min(28, d + 4), "hike", "planned"),
  ];
}

// ---------- gamification ----------
function computeStats(sessions) {
  const points = sessions.reduce((p, s) => p + POINTS[s.status], 0);

  const past = sessions.filter((s) => s.date <= TODAY);
  const doneCount = past.filter((s) => s.status === "done").length;
  const skippedRecent = past.filter((s) => {
    const dt = new Date(s.date);
    return s.status === "skipped" && (today - dt) / 86400000 <= 7;
  }).length;

  // streak: consecutive completed (done/partial) sessions, newest first, broken by skip
  let streak = 0;
  for (const s of [...past].sort((a, b) => (a.date < b.date ? 1 : -1))) {
    if (s.status === "done" || s.status === "partial") streak++;
    else if (s.status === "skipped") break;
  }

  const badges = [];
  if (doneCount >= 1) badges.push({ icon: "✓", text: "First session done", good: true });
  if (streak >= 3) badges.push({ icon: "⚡", text: `${streak} sessions without a skip`, good: true });
  const pastPlanned = past.length > 0 && past.every((s) => s.status === "done");
  if (pastPlanned && past.length >= 3) badges.push({ icon: "★", text: "Everything completed — perfect run", good: true });
  if (skippedRecent >= 2) badges.push({ icon: "!", text: `${skippedRecent} skips in the last 7 days`, good: false });
  if (skippedRecent >= 4) badges.push({ icon: "✕", text: "Couch potato risk — get moving", good: false });

  return { points, streak, badges };
}

// ---------- calendar helpers ----------
function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7)); // back to Monday
  const cells = [];
  const cur = new Date(start);
  do {
    cells.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  } while (cells.length % 7 !== 0 || cur.getMonth() === month);
  return cells;
}

function weekOf(anchor) {
  const start = new Date(anchor);
  start.setDate(anchor.getDate() - ((anchor.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

// ---------- components ----------
function SessionChip({ session, onCycle, onRemove, big }) {
  const a = ACTIVITIES[session.type];
  const st = session.status;
  const styles = {
    planned: { background: "#fff", color: a.color, border: `2px solid ${a.color}` },
    done: { background: a.color, color: "#fff", border: `2px solid ${a.color}` },
    partial: { background: `linear-gradient(90deg, ${a.color} 50%, #fff 50%)`, color: INK, border: `2px solid ${a.color}` },
    skipped: { background: "#F1EAEE", color: MUTED, border: `2px solid ${LINE}`, textDecoration: "line-through" },
  }[st];

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onCycle(session.id); }}
      title={`${a.label} — ${st} (click to change)`}
      style={{
        ...styles,
        borderRadius: 4,
        padding: big ? "6px 8px" : "2px 6px",
        fontSize: big ? 13 : 11,
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 5,
        userSelect: "none",
        marginBottom: 3,
      }}
    >
      <span style={{ fontSize: big ? 10 : 8 }}>{a.icon}</span>
      <span style={{ flex: 1, mixBlendMode: st === "partial" ? "difference" : "normal", color: st === "partial" ? undefined : styles.color }}>
        {a.label}{st !== "planned" ? ` · ${st}` : ""}
      </span>
      <span
        onClick={(e) => { e.stopPropagation(); onRemove(session.id); }}
        style={{ opacity: 0.55, fontSize: big ? 12 : 10, padding: "0 2px" }}
        title="Remove"
      >×</span>
    </div>
  );
}

function AddPicker({ onPick, onClose }) {
  return (
    <div style={{ display: "flex", gap: 4, marginTop: 4 }} onClick={(e) => e.stopPropagation()}>
      {Object.entries(ACTIVITIES).map(([key, a]) => (
        <button key={key} onClick={() => { onPick(key); onClose(); }}
          style={{ flex: 1, border: `2px solid ${a.color}`, color: a.color, background: "#fff", borderRadius: 4, fontSize: 10, fontWeight: 700, padding: "3px 0", cursor: "pointer" }}>
          {a.icon}
        </button>
      ))}
    </div>
  );
}

export default function FitCalendar() {
  const [sessions, setSessions] = useState(seed);
  const [view, setView] = useState("month");
  const [anchor, setAnchor] = useState(new Date(today));
  const [adding, setAdding] = useState(null); // iso date of open picker

  const stats = useMemo(() => computeStats(sessions), [sessions]);
  const byDate = useMemo(() => {
    const m = {};
    for (const s of sessions) (m[s.date] ||= []).push(s);
    return m;
  }, [sessions]);

  const cycle = (id) => setSessions((ss) => ss.map((s) => (s.id === id ? { ...s, status: NEXT_STATUS[s.status] } : s)));
  const remove = (id) => setSessions((ss) => ss.filter((s) => s.id !== id));
  const add = (date, type) => setSessions((ss) => [...ss, { id: `${date}-${type}-${Math.random()}`, date, type, status: "planned" }]);

  const nav = (dir) => {
    const d = new Date(anchor);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + 7 * dir);
    setAnchor(d);
  };

  const cells = view === "month" ? monthGrid(anchor.getFullYear(), anchor.getMonth()) : weekOf(anchor);
  const headline = view === "month"
    ? `${MONTHS[anchor.getMonth()]} ${anchor.getFullYear()}`
    : `Week of ${cells[0].getDate()} ${MONTHS[cells[0].getMonth()].slice(0, 3)} ${cells[0].getFullYear()}`;

  const btn = (active) => ({
    border: `2px solid ${active ? MAGENTA : LINE}`,
    background: active ? MAGENTA : "#fff",
    color: active ? "#fff" : INK,
    borderRadius: 4, padding: "6px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer",
  });

  return (
    <div style={{ minHeight: "100vh", background: BG, color: INK, fontFamily: "'Sora', 'Segoe UI', system-ui, sans-serif", padding: "24px 16px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
        button:focus-visible, [tabindex]:focus-visible { outline: 3px solid ${MAGENTA_DARK}; outline-offset: 2px; }`}</style>

      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: MAGENTA, textTransform: "uppercase" }}>Fit sessions</div>
            <h1 style={{ margin: "2px 0 0", fontSize: 26, fontWeight: 800 }}>{headline}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: MAGENTA_DARK, color: "#fff", borderRadius: 4, padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{stats.points}</div>
              <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", opacity: 0.85 }}>points</div>
            </div>
            <button style={btn(view === "week")} onClick={() => setView("week")}>Week</button>
            <button style={btn(view === "month")} onClick={() => setView("month")}>Month</button>
            <button style={btn(false)} onClick={() => nav(-1)} aria-label="Previous">‹</button>
            <button style={btn(false)} onClick={() => nav(1)} aria-label="Next">›</button>
          </div>
        </div>

        {/* achievements strip */}
        {stats.badges.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {stats.badges.map((b, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600,
                border: `2px solid ${b.good ? MAGENTA : "#C2412D"}`,
                color: b.good ? MAGENTA_DARK : "#C2412D",
                background: "#fff", borderRadius: 999, padding: "4px 12px",
              }}>
                <span>{b.icon}</span>{b.text}
              </div>
            ))}
          </div>
        )}

        {/* day-of-week header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 6 }}>
          {DAYS.map((d) => (
            <div key={d} style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: MUTED, textAlign: "center", textTransform: "uppercase" }}>{d}</div>
          ))}
        </div>

        {/* grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
          {cells.map((d) => {
            const key = iso(d);
            const inMonth = view === "week" || d.getMonth() === anchor.getMonth();
            const isToday = key === TODAY;
            const list = byDate[key] || [];
            return (
              <div key={key}
                onClick={() => setAdding(adding === key ? null : key)}
                style={{
                  background: inMonth ? "#fff" : "transparent",
                  border: `2px solid ${isToday ? MAGENTA : inMonth ? LINE : "transparent"}`,
                  borderRadius: 6,
                  minHeight: view === "week" ? 200 : 88,
                  padding: 6,
                  cursor: inMonth ? "pointer" : "default",
                  opacity: inMonth ? 1 : 0.35,
                }}>
                <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 600, color: isToday ? MAGENTA : MUTED, marginBottom: 4 }}>
                  {d.getDate()}
                </div>
                {list.map((s) => (
                  <SessionChip key={s.id} session={s} onCycle={cycle} onRemove={remove} big={view === "week"} />
                ))}
                {adding === key && inMonth && (
                  <AddPicker onPick={(t) => add(key, t)} onClose={() => setAdding(null)} />
                )}
              </div>
            );
          })}
        </div>

        {/* legend / rules */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 16, fontSize: 12, color: MUTED }}>
          <span>Tap a day to add a session</span>
          <span>Tap a session to cycle: planned → done → partial → skipped</span>
          <span style={{ color: MAGENTA_DARK, fontWeight: 600 }}>done +10 · partial +4 · skipped 0 (and it haunts you)</span>
        </div>
      </div>
    </div>
  );
}
