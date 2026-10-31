/* =====================================================================
   APP — routing, events, boot
   ===================================================================== */
const PAGES = ['home', 'tasks', 'calendar', 'settings'];
const PAGE_TITLE = { home: 'Home', tasks: 'Tasks', calendar: 'Calendar', settings: 'Settings' };

function applyTheme() {
  const r = document.documentElement;
  r.dataset.theme = S.settings.theme;
  r.dataset.anim = animOn() ? 'on' : 'off';
  const m = $('meta[name=theme-color]');
  if (m) m.content = { dark: '#08090B', amoled: '#000000', light: '#EFF0EC' }[S.settings.theme];
}

function renderCurrent(dir = 0, monthDir = 0) {
  if (UI.page === 'home') renderHome();
  else if (UI.page === 'tasks') updateTasks();
  else if (UI.page === 'calendar') updateCalendar(dir, monthDir);
  else renderSettings();
}

function showPage(p) {
  if (!PAGES.includes(p)) p = 'home';
  UI.page = p; UI.manage = false;
  $$('.page').forEach(s => s.classList.toggle('active', s.dataset.page === p));
  $$('#nav button').forEach(b => b.setAttribute('aria-current', b.dataset.page === p ? 'page' : 'false'));
  document.title = `${PAGE_TITLE[p]} · Streakwise`;
  document.body.dataset.page = p;
  renderCurrent();
  window.scrollTo(0, 0);
}
function setPage(p) {
  if (location.hash.slice(1) === p) showPage(p); else location.hash = p;
}

function setSelected(k, opts = {}) {
  const dir = opts.dir ?? Math.sign(diffDays(k, UI.sel));
  const monthChanged = k.slice(0, 7) !== UI.viewMonth;
  UI.sel = k; UI.viewMonth = k.slice(0, 7);
  if (!opts.silent) tick();
  renderCurrent(dir, monthChanged ? dir : 0);
}
const stepDay = n => setSelected(addDays(UI.sel, n), { dir: n });

function shiftMonth(n) {
  const [y, m] = UI.viewMonth.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  UI.viewMonth = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  tick();
  renderMonthGrid();
  if (animOn()) $('#m-grid').animate([{ transform: `translateX(${n * 30}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
}

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------- Click actions (event delegation) ---------- */
const actions = {
  'close-sheet': () => closeSheet(),
  go: a => setPage(a.dataset.page),
  'sel-date': a => setSelected(a.dataset.date),
  'day-prev': () => stepDay(-1),
  'day-next': () => stepDay(1),
  'month-prev': () => shiftMonth(-1),
  'month-next': () => shiftMonth(1),
  'month-today': () => { const k = todayKey(); UI.viewMonth = k.slice(0, 7); setSelected(k); },
  'open-next': a => { UI.sel = a.dataset.date; UI.viewMonth = UI.sel.slice(0, 7); setPage('tasks'); },
  'add-task': () => taskSheet(null, UI.sel),
  'edit-task': a => taskSheet(a.dataset.id),
  'toggle-manage': () => { UI.manage = !UI.manage; updateTasks(); },
  'toggle-task': a => {
    const id = a.dataset.id, t = S.tasks.find(x => x.id === id); if (!t) return;
    const wasChk = a.classList.contains('chk');
    UI.justToggled = t.completed ? null : id;
    tick(t.completed ? 'soft' : 'done');
    toggleTask(id);
    if (wasChk) { const n = $(`.chk[data-id="${id}"]`); if (n) n.focus({ preventScroll: true }); }
    setTimeout(() => { UI.justToggled = null; }, 700);
  },
  'move-task': a => {
    const id = a.dataset.id, dir = Number(a.dataset.dir);
    moveTask(id, dir);
    const n = $(`[data-action="move-task"][data-id="${id}"][data-dir="${dir}"]`) || $(`[data-action="edit-task"][data-id="${id}"]`);
    if (n) n.focus({ preventScroll: true });
  },
  'del-task': async a => {
    const t = S.tasks.find(x => x.id === a.dataset.id); if (!t) return;
    const ok = await confirmDialog({ title: 'Delete this task?', message: `“${t.title}” will be removed from ${relativeLabel(t.date).toLowerCase()}.`, confirmLabel: 'Delete task', danger: true });
    if (ok) { deleteTask(t.id); toast('Task deleted'); }
  },
  'edit-routine-of': a => {
    const t = S.tasks.find(x => x.id === a.dataset.id); if (!t) return;
    if (t.routineId.startsWith('sys:')) timetableSheet('schedule'); else routineSheet(t.routineId);
  },
  'open-profile': () => profileSheet(),
  'open-timetable': () => timetableSheet(),
  'edit-routine': a => routineSheet(a.dataset.id || null),
  'open-roadmap': () => roadmapSheet(),
  'set-theme': a => { S.settings.theme = a.dataset.v; save(); applyTheme(); renderSettings(); },
  'toggle-sound': () => { S.settings.sound = !S.settings.sound; save(); renderSettings(); if (S.settings.sound) tick(); },
  'toggle-anim': () => { S.settings.animations = !S.settings.animations; save(); applyTheme(); renderSettings(); },
  export: () => { download(`streakwise-backup-${todayKey()}.json`, exportData()); toast('Backup downloaded'); },
  import: () => $('#file-import').click(),
  reset: async () => {
    const ok = await confirmDialog({ title: 'Reset progress?', message: 'This erases all task history, streaks and roadmap progress. Your profile, settings and routines stay. This cannot be undone.', confirmLabel: 'Reset progress', danger: true, requireText: 'RESET' });
    if (ok) { resetProgress(); UI.sel = todayKey(); UI.viewMonth = UI.sel.slice(0, 7); toast('Progress reset'); }
  },
  clear: async () => {
    const ok = await confirmDialog({ title: 'Clear all data?', message: 'Everything is deleted: tasks, history, routines, profile and settings. Export a backup first if you might want it back.', confirmLabel: 'Delete everything', danger: true, requireText: 'DELETE' });
    if (ok) { clearAll(); UI.sel = todayKey(); UI.viewMonth = UI.sel.slice(0, 7); applyTheme(); buildTasksPage(); buildCalendarPage(); renderCurrent(); toast('All data cleared'); }
  }
};

let swallowClick = false;
document.addEventListener('click', e => {
  if (!S) return;
  if (swallowClick) { e.stopPropagation(); e.preventDefault(); swallowClick = false; return; }
  const a = e.target.closest('[data-action]');
  if (a && actions[a.dataset.action]) actions[a.dataset.action](a, e);
}, true);

document.addEventListener('change', e => {
  const sel = e.target.closest('[data-setting]'); if (!sel) return;
  const k = sel.dataset.setting;
  if (k === 'weekStart') S.settings.weekStart = sel.value;
  if (k === 'streakThreshold') S.settings.streakThreshold = Number(sel.value);
  commit(); renderCurrent();
});

/* ---------- Swipe & keyboard on the day carousel ---------- */
let swipe = null;
document.addEventListener('pointerdown', e => { if (e.target.closest('#carousel')) swipe = { x: e.clientX, y: e.clientY }; });
document.addEventListener('pointercancel', () => { swipe = null; });
document.addEventListener('pointerup', e => {
  if (!swipe) return;
  const dx = e.clientX - swipe.x, dy = e.clientY - swipe.y; swipe = null;
  if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.3) {
    stepDay(dx < 0 ? 1 : -1);
    swallowClick = true; setTimeout(() => { swallowClick = false; }, 60);
  }
});
document.addEventListener('keydown', e => {
  if (e.target.id === 'carousel') {
    if (e.key === 'ArrowLeft') { e.preventDefault(); stepDay(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); stepDay(1); }
  }
});

/* ---------- Import ---------- */
$('#file-import').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  try {
    const text = await f.text();
    JSON.parse(text);
    const ok = await confirmDialog({ title: 'Import this backup?', message: 'Your current data will be replaced by the contents of the file.', confirmLabel: 'Replace my data', danger: true });
    if (!ok) return;
    importData(text);
    UI.sel = todayKey(); UI.viewMonth = UI.sel.slice(0, 7);
    applyTheme(); buildTasksPage(); buildCalendarPage(); renderCurrent(); toast('Backup imported');
  } catch (err) { toast(err.message || 'Import failed.'); }
});

document.addEventListener('statechange', () => renderCurrent());
window.addEventListener('hashchange', () => { if (S) showPage(location.hash.slice(1)); });

/* ---------- Boot ---------- */
function boot() {
  loadState(); reindex(); backfillToToday();
  applyTheme(); buildTasksPage(); buildCalendarPage();
  showPage(PAGES.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home');

  let lastToday = todayKey();
  setInterval(() => {                       // midnight rollover
    const t = todayKey(); if (t === lastToday) return;
    if (UI.sel === lastToday) { UI.sel = t; UI.viewMonth = t.slice(0, 7); }
    lastToday = t; backfillToToday(); commit();
  }, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && todayKey() !== lastToday) { lastToday = todayKey(); backfillToToday(); commit(); } });
}

/* Check the configured image files first; any that fail to load fall back to the built-in SVG art. */
function preloadAssets() {
  const jobs = [];
  const check = (obj, key) => {
    const src = obj[key]; if (!src) return;
    jobs.push(new Promise(res => { const i = new Image(); i.onload = () => res(); i.onerror = () => { obj[key] = null; res(); }; i.src = src; }));
  };
  Object.keys(ASSETS.characterStates).forEach(k => check(ASSETS.characterStates, k));
  Object.keys(ASSETS.backgrounds).forEach(k => check(ASSETS.backgrounds, k));
  ['trophy', 'fire', 'avatar'].forEach(k => check(ASSETS, k));
  return Promise.race([Promise.all(jobs), new Promise(r => setTimeout(r, 2500))]);
}
preloadAssets().then(boot);
