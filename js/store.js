/* =====================================================================
   STORE — dates, state, persistence, progress rules.
   All dates are LOCAL "YYYY-MM-DD" strings (never UTC ISO strings).
   ===================================================================== */
const STORE_KEY = 'streakwise-v1';

/* ---------- Date helpers (local time) ---------- */
const pad = n => String(n).padStart(2, '0');
const dateKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const todayKey = () => dateKey(new Date());
const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return dateKey(d); };
const diffDays = (a, b) => {
  const A = parseKey(a), B = parseKey(b);
  return Math.round((Date.UTC(A.getFullYear(), A.getMonth(), A.getDate()) - Date.UTC(B.getFullYear(), B.getMonth(), B.getDate())) / 864e5);
};
const weekdayId = k => DAYS[parseKey(k).getDay()];
const isValidKey = k => typeof k === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(k) && dateKey(parseKey(k)) === k;
const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

function weekStartKey(k) {
  const start = WEEK_START_INDEX[S.settings.weekStart] ?? 6;
  const diff = (parseKey(k).getDay() - start + 7) % 7;
  return addDays(k, -diff);
}
function weekKeys(k) { const s = weekStartKey(k); return Array.from({ length: 7 }, (_, i) => addDays(s, i)); }
function monthKeys(y, m) { return Array.from({ length: daysInMonth(y, m) }, (_, i) => `${y}-${pad(m + 1)}-${pad(i + 1)}`); }

function relativeLabel(k) {
  const d = diffDays(k, todayKey());
  if (d === 0) return 'Today';
  if (d === -1) return 'Yesterday';
  if (d === -2) return '2 days ago';
  if (d === 1) return 'Tomorrow';
  const dt = parseKey(k);
  return `${DAY_SHORT[DAYS[dt.getDay()]]}, ${MONTHS[dt.getMonth()].slice(0, 3)} ${dt.getDate()}`;
}
function longDate(k) {
  const dt = parseKey(k);
  return `${DAY_FULL[DAYS[dt.getDay()]]}, ${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
}

/* ---------- State ---------- */
let S;                 // the whole persisted state
let byDate = new Map(); // date -> sorted task array (derived index)
let storageOK = true;

function defaultState() {
  return {
    v: 1,
    profile: { name: 'My Profile', username: '@myprofile', avatar: null },
    settings: { theme: 'dark', sound: false, animations: true, weekStart: 'sat', streakThreshold: 100, coach: 'Rudy' },
    schedule: JSON.parse(JSON.stringify(DEFAULT_SCHEDULE)),
    routines: JSON.parse(JSON.stringify(DEFAULT_ROUTINES)),
    tasks: [],
    materialized: {},
    roadmap: { videos: 0, done: {} },
    installedOn: todayKey(),
    createdAt: new Date().toISOString()
  };
}

const str = (v, max, fb = '') => (typeof v === 'string' ? v.trim().slice(0, max) : fb);

/* Make any object (stored or imported) safe to use. */
function normalize(raw) {
  const d = defaultState();
  if (!raw || typeof raw !== 'object') return d;
  const o = d;
  if (raw.profile && typeof raw.profile === 'object') {
    o.profile.name = str(raw.profile.name, 24, d.profile.name) || d.profile.name;
    o.profile.username = str(raw.profile.username, 25, d.profile.username) || d.profile.username;
    o.profile.avatar = typeof raw.profile.avatar === 'string' && raw.profile.avatar.startsWith('data:image/') && raw.profile.avatar.length < 600000 ? raw.profile.avatar : null;
  }
  if (raw.settings && typeof raw.settings === 'object') {
    const s = raw.settings;
    if (['dark', 'light', 'amoled'].includes(s.theme)) o.settings.theme = s.theme;
    o.settings.sound = !!s.sound;
    o.settings.animations = s.animations !== false;
    if (WEEK_START_INDEX[s.weekStart] !== undefined) o.settings.weekStart = s.weekStart;
    if ([50, 75, 100].includes(s.streakThreshold)) o.settings.streakThreshold = s.streakThreshold;
    o.settings.coach = str(s.coach, 14, 'Rudy') || 'Rudy';
  }
  const okTime = t => typeof t === 'string' && /^\d{2}:\d{2}$/.test(t);
  if (raw.schedule && typeof raw.schedule === 'object') {
    ['school', 'english'].forEach(kind => DAYS.forEach(day => {
      const v = raw.schedule[kind] && raw.schedule[kind][day];
      o.schedule[kind][day] = Array.isArray(v) && okTime(v[0]) && okTime(v[1]) ? [v[0], v[1]] : null;
    }));
  }
  if (Array.isArray(raw.routines)) {
    o.routines = raw.routines.filter(r => r && typeof r === 'object' && str(r.title, 80)).slice(0, 200).map(r => ({
      id: str(r.id, 40) || uid(),
      title: str(r.title, 80), description: str(r.description, 160),
      category: CATEGORIES[r.category] ? r.category : 'other',
      days: Array.isArray(r.days) ? r.days.filter(x => DAYS.includes(x)) : [],
      order: Number.isFinite(r.order) ? r.order : 60,
      startDate: isValidKey(r.startDate) ? r.startDate : null,
      jsStage: JS_STAGES.some(s => s.id === r.jsStage) ? r.jsStage : null
    }));
  }
  if (Array.isArray(raw.tasks)) {
    o.tasks = raw.tasks.filter(t => t && typeof t === 'object' && str(t.title, 80) && isValidKey(t.date)).slice(0, 20000).map(t => ({
      id: str(t.id, 40) || uid(),
      title: str(t.title, 80), description: str(t.description, 160),
      date: t.date,
      category: CATEGORIES[t.category] ? t.category : 'other',
      completed: !!t.completed,
      completedAt: typeof t.completedAt === 'string' ? t.completedAt : null,
      recurring: !!t.recurring,
      routineId: typeof t.routineId === 'string' ? t.routineId : null,
      edited: !!t.edited,
      order: Number.isFinite(t.order) ? t.order : 60,
      jsStage: JS_STAGES.some(s => s.id === t.jsStage) ? t.jsStage : null,
      createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date().toISOString()
    }));
  }
  if (raw.materialized && typeof raw.materialized === 'object') {
    Object.keys(raw.materialized).forEach(k => { if (isValidKey(k) && raw.materialized[k]) o.materialized[k] = true; });
  }
  if (raw.roadmap && typeof raw.roadmap === 'object') {
    o.roadmap.videos = clamp(parseInt(raw.roadmap.videos, 10) || 0, 0, JS_COURSE.videos);
    if (raw.roadmap.done && typeof raw.roadmap.done === 'object') {
      Object.keys(raw.roadmap.done).forEach(k => { if (raw.roadmap.done[k] === true) o.roadmap.done[k] = true; });
    }
  }
  if (isValidKey(raw.installedOn)) o.installedOn = raw.installedOn;
  if (typeof raw.createdAt === 'string') o.createdAt = raw.createdAt;
  return o;
}

function loadState() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { storageOK = false; }
  S = normalize(raw);
}
let saveWarned = false;
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); storageOK = true; }
  catch (e) {
    storageOK = false;
    if (!saveWarned && typeof toast === 'function') { saveWarned = true; toast('Could not save — browser storage is full or blocked.'); }
  }
}

function reindex() {
  byDate = new Map();
  S.tasks.forEach(t => { if (!byDate.has(t.date)) byDate.set(t.date, []); byDate.get(t.date).push(t); });
  byDate.forEach(list => list.sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt)));
}
function commit() { reindex(); save(); document.dispatchEvent(new CustomEvent('statechange')); }

const tasksOn = k => byDate.get(k) || [];

/* ---------- Routines → daily task instances ----------
   A day's tasks are created the first time the day is needed and never
   before the app was first used (no fake history). Each day is created once. */
function ensureDate(k) {
  if (S.materialized[k] || k < S.installedOn || diffDays(k, todayKey()) > 400) return false;
  const wd = weekdayId(k);
  const have = new Set(S.tasks.filter(t => t.date === k && t.routineId).map(t => t.routineId));
  const items = [];
  const sch = S.schedule.school[wd];
  if (sch && !have.has('sys:school')) items.push({ routineId: 'sys:school', title: 'School', description: `${sch[0]}–${sch[1]}`, category: 'school', order: 10 });
  const en = S.schedule.english[wd];
  if (en && !have.has('sys:english')) items.push({ routineId: 'sys:english', title: 'English class', description: `${en[0]}–${en[1]}`, category: 'english', order: 90 });
  S.routines.forEach(r => {
    if (r.days.includes(wd) && (!r.startDate || k >= r.startDate) && !have.has(r.id)) {
      items.push({ routineId: r.id, title: r.title, description: r.description, category: r.category, order: r.order, jsStage: r.jsStage || null });
    }
  });
  items.forEach(it => S.tasks.push({
    id: uid(), date: k, completed: false, completedAt: null, recurring: true, edited: false,
    createdAt: new Date().toISOString(), jsStage: null, ...it
  }));
  S.materialized[k] = true;
  return true;
}
function prepare(keys) {
  let changed = false;
  keys.forEach(k => { if (ensureDate(k)) changed = true; });
  if (changed) { reindex(); save(); }
}
/* Fill every day from first use up to today so missed days count honestly. */
function backfillToToday() {
  const t = todayKey();
  let k = S.installedOn, guard = 0;
  const keys = [];
  while (k <= t && guard++ < 800) { keys.push(k); k = addDays(k, 1); }
  prepare(keys);
}
/* After a routine or timetable change: rebuild today + future days that are untouched. */
function refreshFuture() {
  const t = todayKey();
  S.tasks = S.tasks.filter(x => !(x.routineId && !x.completed && !x.edited && x.date >= t));
  Object.keys(S.materialized).forEach(k => { if (k >= t) delete S.materialized[k]; });
  reindex();
  prepare([t]);
}

/* ---------- Mutations ---------- */
function nextOrder(k) { const l = tasksOn(k); return l.length ? Math.max(...l.map(t => t.order)) + 10 : 10; }

function addTask({ title, description = '', date, category = 'other' }) {
  const t = {
    id: uid(), title, description, date, category, completed: false, completedAt: null,
    recurring: false, routineId: null, edited: false, jsStage: null,
    order: nextOrder(date), createdAt: new Date().toISOString()
  };
  S.tasks.push(t); commit(); return t;
}
function updateTask(id, patch) {
  const t = S.tasks.find(x => x.id === id); if (!t) return;
  const moved = patch.date && patch.date !== t.date;
  Object.assign(t, patch);
  if (moved) t.order = nextOrder(patch.date) + 1;
  if (t.routineId) t.edited = true;
  commit();
}
function deleteTask(id) { S.tasks = S.tasks.filter(t => t.id !== id); commit(); }
function toggleTask(id) {
  const t = S.tasks.find(x => x.id === id); if (!t) return null;
  t.completed = !t.completed;
  t.completedAt = t.completed ? new Date().toISOString() : null;
  commit(); return t;
}
function moveTask(id, dir) {
  const t = S.tasks.find(x => x.id === id); if (!t) return;
  const list = tasksOn(t.date).slice();
  const i = list.findIndex(x => x.id === id), j = i + dir;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  list.forEach((x, n) => { x.order = (n + 1) * 10; });
  commit();
}
function saveRoutine(r) {
  const i = S.routines.findIndex(x => x.id === r.id);
  if (i >= 0) S.routines[i] = r; else S.routines.push(r);
  refreshFuture(); commit();
}
function deleteRoutine(id) { S.routines = S.routines.filter(r => r.id !== id); refreshFuture(); commit(); }
function setSchedule(sch) { S.schedule = sch; refreshFuture(); commit(); }

function resetProgress() {
  S.tasks = []; S.materialized = {}; S.roadmap = { videos: 0, done: {} };
  S.installedOn = todayKey();
  reindex(); backfillToToday(); commit();
}
function clearAll() {
  try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
  S = defaultState(); reindex(); backfillToToday(); commit();
}
function exportData() {
  return JSON.stringify({ app: 'streakwise', version: 1, exportedAt: new Date().toISOString(), data: S }, null, 2);
}
function importData(text) {
  let obj;
  try { obj = JSON.parse(text); } catch (e) { throw new Error('That file is not valid JSON.'); }
  const data = obj && obj.app === 'streakwise' ? obj.data : null;
  if (!data || !Array.isArray(data.tasks) || typeof data.profile !== 'object') throw new Error('This is not a Streakwise export file.');
  S = normalize(data); reindex(); backfillToToday(); commit();
}

/* ---------- Progress rules ---------- */
/* Mood from a completion percentage:
   100 → excellent · 51–99 → good · 40–50 → average · <40 → low            */
function moodOfPct(p) { return p >= 100 ? 'excellent' : p > 50 ? 'good' : p >= 40 ? 'average' : 'low'; }

function dayInfo(k) {
  const list = tasksOn(k);
  const total = list.length, done = list.filter(t => t.completed).length;
  const pct = total ? Math.round(done / total * 100) : 0;
  const future = k > todayKey();
  let mood = 'neutral';
  if (total && !(future && done === 0)) mood = moodOfPct(pct);
  return { key: k, total, done, pct, mood, planned: !!total && future && done === 0, qualifies: total > 0 && pct >= S.settings.streakThreshold };
}

/* Streak: consecutive days WITH tasks that reach the threshold. Days with no tasks
   are skipped. Today does not break a streak until the day is over.             */
function streaks() {
  const today = todayKey();
  const dates = [...byDate.keys()].filter(k => k <= today && byDate.get(k).length).sort();
  let best = 0, run = 0;
  dates.forEach(k => { if (dayInfo(k).qualifies) { run++; best = Math.max(best, run); } else if (k !== today) run = 0; });
  let i = dates.length - 1;
  if (i >= 0 && dates[i] === today && !dayInfo(today).qualifies) i--;
  let current = 0;
  for (; i >= 0 && dayInfo(dates[i]).qualifies; i--) current++;
  return { current, best: Math.max(best, current) };
}

/* XP: 10 per completed task + 25 per perfect day.
   Level L starts at 50·L·(L−1) XP (100, 300, 600, 1000 …). */
function levelFromXP(xp) {
  const L = Math.max(1, Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2));
  const from = 50 * L * (L - 1), to = 50 * (L + 1) * L;
  return { level: L, xp, from, to, pct: Math.round((xp - from) / (to - from) * 100) };
}

function overview() {
  const today = todayKey();
  let total = 0, completed = 0, perfect = 0, active = 0;
  const pcts = [], byCat = {};
  byDate.forEach((list, k) => {
    total += list.length;
    const d = list.filter(t => t.completed).length;
    completed += d;
    if (d) active++;
    if (k <= today && list.length) { pcts.push(d / list.length * 100); if (d === list.length) perfect++; }
    list.forEach(t => { if (t.completed) byCat[t.category] = (byCat[t.category] || 0) + 1; });
  });
  let p30 = 0, d30 = 0;
  for (let i = 0; i < 30; i++) { const l = tasksOn(addDays(today, -i)); p30 += l.length; d30 += l.filter(t => t.completed).length; }
  const wk = weekKeys(today);
  let wp = 0, wd = 0; wk.forEach(k => { const l = tasksOn(k); wp += l.length; wd += l.filter(t => t.completed).length; });
  const st = streaks();
  const xp = completed * 10 + perfect * 25;
  return {
    total, completed, active, perfect, xp,
    level: levelFromXP(xp),
    rate30: p30 ? Math.round(d30 / p30 * 100) : 0,
    weekRate: wp ? Math.round(wd / wp * 100) : 0, weekDone: wd, weekTotal: wp,
    avg: pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0,
    streak: st.current, best: st.best,
    study: LEARNING_CATS.reduce((a, c) => a + (byCat[c] || 0), 0),
    code: byCat.programming || 0, english: byCat.english || 0, school: byCat.school || 0
  };
}

function nextTask() {
  const today = todayKey();
  for (let i = 0; i < 14; i++) {
    const k = addDays(today, i);
    prepare([k]);
    const t = tasksOn(k).find(x => !x.completed);
    if (t) return { task: t, date: k };
  }
  return null;
}

function roadmapProgress() {
  const all = [...JS_TOPICS, ...JS_NEXT];
  const done = all.filter(t => S.roadmap.done[t.id]).length;
  return { done, total: all.length, pct: Math.round(done / all.length * 100), videos: S.roadmap.videos };
}
