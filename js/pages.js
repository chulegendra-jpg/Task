/* =====================================================================
   PAGES — Home, Tasks, Calendar, Settings
   ===================================================================== */
const UI = { page: 'home', sel: todayKey(), viewMonth: todayKey().slice(0, 7), manage: false, justToggled: null };
const MOODS = ['excellent', 'good', 'average', 'low', 'neutral'];

const numWord = n => (n >= 0 && n < NUM_WORDS.length ? NUM_WORDS[n] : String(n));
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const profileAvatar = () => S.profile.avatar ? `<img src="${esc(S.profile.avatar)}" alt="">` : ASSETS.avatar ? `<img src="${esc(ASSETS.avatar)}" alt="">` : `<span class="av-char">${charArt('good')}</span>`;

function miniRing(pct, color, size = 64, stroke = 8) {
  const r = (size - stroke) / 2, C = 2 * Math.PI * r;
  return `<svg class="mring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--s3)" stroke-width="${stroke}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${C * pct / 100} ${C}" transform="rotate(-90 ${size / 2} ${size / 2})" style="transition:stroke-dasharray .7s var(--ease)"/></svg>`;
}
const dots4 = mood => `<span class="dots m-${mood}" aria-hidden="true">${[0, 1, 2, 3].map(i => `<i class="${i < MOOD_META[mood].seg ? 'on' : ''}"></i>`).join('')}</span>`;

/* =============================== HOME =============================== */
function renderHome() {
  const el = $('#page-home');
  const today = todayKey(), sel = UI.sel, now = parseKey(today);
  const wk = weekKeys(sel);
  prepare([...wk, ...monthKeys(now.getFullYear(), now.getMonth())]);
  const ov = overview(), di = dayInfo(sel), nt = nextTask(), rp = roadmapProgress();
  const L = ov.level;
  const recent = [0, 1, 2].map(i => dayInfo(addDays(today, -i)).mood);
  const last7 = Array.from({ length: 7 }, (_, i) => dayInfo(addDays(today, i - 6)).qualifies);

  const week = wk.map(k => {
    const d = dayInfo(k), dt = parseKey(k), id = DAYS[dt.getDay()];
    return `<button type="button" class="wd m-${d.mood} ${k === sel ? 'sel' : ''} ${k === today ? 'today' : ''}" data-action="sel-date" data-date="${k}" aria-pressed="${k === sel}" aria-label="${DAY_FULL[id]} ${dt.getDate()}${d.total ? `, ${d.done} of ${d.total} done` : ', no tasks'}">
      <i class="wd-dot"></i><span>${DAY_SHORT[id]}</span><b>${dt.getDate()}</b></button>`;
  }).join('');

  const mk = monthKeys(now.getFullYear(), now.getMonth());
  const mInfos = mk.map(dayInfo);
  const mPerfect = mInfos.filter(d => d.mood === 'excellent').length;
  const mActive = mInfos.filter(d => d.done > 0).length;
  const squares = mInfos.map(d => `<i class="ms m-${d.planned ? 'neutral' : d.mood} ${d.key === today ? 'today' : ''}" title="${relativeLabel(d.key)}: ${d.total ? d.done + '/' + d.total : 'no tasks'}"></i>`).join('');

  const nextHTML = nt ? `<button type="button" class="info next" data-action="open-next" data-date="${nt.date}">
      <span class="info-k">${icon('clock', 15)} Next up</span>
      <strong class="clip2">${esc(nt.task.title)}</strong>
      <span class="muted sm">${relativeLabel(nt.date)}${nt.task.description ? ' · ' + esc(nt.task.description) : ''}</span></button>`
    : `<div class="info next"><span class="info-k">${icon('clock', 15)} Next up</span><strong>All caught up</strong><span class="muted sm">Nothing left in the next two weeks.</span></div>`;

  el.innerHTML = `<div class="wrap home-wrap">
    <div class="top-bar">
      <button type="button" class="icon-btn" data-action="go" data-page="settings" aria-label="Open settings">${icon('settings', 20)}</button>
      <div class="top-pill" aria-label="Current streak ${ov.streak} days">${flameIcon(18)}<b>${num('h-streak', ov.streak)}</b><button type="button" class="plus" data-action="add-task" aria-label="Add a task">${icon('plus', 18)}</button></div>
    </div>

    <section class="profile" aria-label="Profile">
      <button type="button" class="avatar" data-action="open-profile" aria-label="Edit profile picture"><span class="avatar-in">${profileAvatar()}</span></button>
      <h1>${esc(S.profile.name)}</h1>
      <p class="muted">${esc(S.profile.username)}</p>
    </section>

    <section class="stats3" aria-label="Your numbers">
      <div class="st">${icon('target', 22, 'ac')}<b>${num('s-rate', ov.rate30, '%')}</b><span>Completion</span></div>
      <div class="st">${icon('checkBadge', 22, 'ac')}<b>${num('s-level', L.level)}</b><span>Level</span></div>
      <div class="st">${icon('calendar', 22, 'ac')}<b>${num('s-days', ov.active)}</b><span>Active days</span></div>
    </section>
    <p class="xp-line" title="10 XP per completed task, +25 XP per perfect day. Level L begins at 50×L×(L−1) XP.">
      <span class="xp-bar"><i style="width:${L.pct}%"></i></span>${L.xp - L.from} / ${L.to - L.from} XP to level ${L.level + 1}</p>

    <section class="week" aria-label="This week">${week}</section>

    <div class="home-grid">
    <div class="home-col">
      <div class="row-cards">
        <div class="card crew" aria-label="Last three days">
          <div class="crew-av">${recent.map((m, i) => `<span class="m-${m}" style="--i:${i}">${charArt(m)}</span>`).join('')}</div>
          <strong>Last 3 days</strong><span class="accent-text sm">${recent.filter(m => m === 'excellent' || m === 'good').length} of 3 on track</span>
        </div>
        <div class="card keep">
          <div class="keep-txt"><strong>Keep it up!</strong>
            <p class="muted sm">${ov.streak > 0 ? `${plural(ov.streak, 'day')} in a row` : 'Finish today to start a streak'}</p>
            <div class="keep-dots" aria-hidden="true">${last7.map(q => `<i class="${q ? 'on' : ''}"></i>`).join('')}</div></div>
          <div class="trophy">${trophyArt()}</div>
        </div>
      </div>
      <button type="button" class="card banner" data-action="go" data-page="tasks">
        <span class="banner-art">${coinArt()}</span>
        <span class="banner-txt"><strong>Complete new tasks</strong><span class="muted sm">Every task you finish today adds to your level and keeps your streak alive.</span></span>
      </button>
    </div>
    <div class="home-col">
      <div class="info-grid">
        <button type="button" class="info daily" data-action="go" data-page="tasks" aria-label="Open tasks for ${longDate(sel)}">
          <span class="info-k">${icon('bars', 15)} ${relativeLabel(sel)}</span>
          <div class="ring-row">${miniRing(di.pct, MOOD_META[di.mood].segColor === '#3a3e45' ? 'var(--faint)' : MOOD_META[di.mood].color, 58, 7)}<div><b class="big">${di.total ? num('d-pct', di.pct, '%') : '—'}</b><span class="muted sm">${di.total ? `${di.done} of ${di.total} done` : 'No tasks'}</span></div></div>
        </button>
        ${nextHTML}
        <div class="info"><span class="info-k">${icon('zap', 15)} This week</span>
          <b class="big">${num('w-rate', ov.weekRate, '%')}</b><span class="bar"><i style="width:${ov.weekRate}%"></i></span>
          <span class="muted sm">${ov.weekDone} of ${ov.weekTotal} tasks</span></div>
        <div class="info"><span class="info-k">${icon('calendar', 15)} ${MONTHS[now.getMonth()]}</span>
          <div class="msq" aria-hidden="true">${squares}</div>
          <span class="muted sm">${mPerfect} perfect · ${mActive} active</span></div>
      </div>
      <button type="button" class="card road" data-action="open-roadmap">
        ${miniRing(rp.pct, 'var(--accent)', 62, 7)}
        <span class="road-txt"><strong>JavaScript roadmap</strong>
          <span class="muted sm">${rp.videos}/${JS_COURSE.videos} course videos · ${rp.done}/${rp.total} topics</span></span>
        ${icon('right', 20, 'muted')}
      </button>
    </div>
    </div>
  </div>`;
  animateNums(el);
}

/* =============================== TASKS =============================== */
function buildTasksPage() {
  $('#page-tasks').innerHTML = `<div class="wrap tasks-wrap">
    <h1 class="page-head" id="t-head"></h1>
    <section class="hero" id="hero" data-mood="neutral" aria-label="Daily tasks">
      <div class="hero-art">
        <div class="bg-stack">${MOODS.map(m => `<div class="bg-layer" data-mood="${m}">${bgArt(m)}</div>`).join('')}</div>
        <div class="hero-top">
          <button type="button" class="glass round" data-action="go" data-page="settings" aria-label="Settings">${icon('settings', 19)}</button>
          <div class="hero-right">
            <button type="button" class="glass round" data-action="go" data-page="home" aria-label="Home">${icon('home', 19)}</button>
            <div class="glass pill-g" aria-label="Current streak">${flameIcon(17)}<b id="h-streak">0</b></div>
          </div>
        </div>
        <div class="bubble" id="h-bubble" aria-live="polite"></div>
        <div class="char-stack">${MOODS.map(m => `<div class="char-layer" data-mood="${m}">${charArt(m)}</div>`).join('')}</div>
        <div class="segs" id="h-segs" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <div class="perfect" id="h-perfect">${icon('check', 13)} Perfect day</div>
      </div>
      <div class="panel">
        <div class="panel-grab" aria-hidden="true"></div>
        <div class="panel-head">
          <div class="day-switch">
            <button type="button" class="icon-btn sm" data-action="day-prev" aria-label="Previous day">${icon('left', 16)}</button>
            <h2 id="p-day">Today</h2>
            <button type="button" class="icon-btn sm" data-action="day-next" aria-label="Next day">${icon('right', 16)}</button>
          </div>
          <div class="count" id="p-count" aria-live="polite">0/0</div>
        </div>
        <div class="panel-sub"><span id="p-the" class="the">THE FIVE</span><button type="button" class="link-btn" id="p-manage" data-action="toggle-manage">Reorder</button></div>
        <ul class="task-list" id="task-list"></ul>
        <button type="button" class="add-row" data-action="add-task">${icon('plus', 18)} Add task</button>
      </div>
    </section>
  </div>`;
}

const BUBBLE = {
  excellent: 'Every task done. That is how a streak is built.',
  good: 'Good pace. Finish what is left.',
  average: 'Only halfway. Do not stop here.',
  low: 'Barely started. Pick the easiest task and begin.',
  neutral: 'Nothing planned. Add a task to get going.'
};

function taskRow(t, i, n) {
  const c = CATEGORIES[t.category] || CATEGORIES.other;
  const tools = UI.manage
    ? `<span class="tools"><button type="button" class="tool" data-action="move-task" data-dir="-1" data-id="${t.id}" aria-label="Move up" ${i === 0 ? 'disabled' : ''}>${icon('up', 15)}</button>
       <button type="button" class="tool" data-action="move-task" data-dir="1" data-id="${t.id}" aria-label="Move down" ${i === n - 1 ? 'disabled' : ''}>${icon('down', 15)}</button>
       <button type="button" class="tool" data-action="edit-task" data-id="${t.id}" aria-label="Edit ${esc(t.title)}">${icon('pencil', 15)}</button>
       <button type="button" class="tool danger" data-action="del-task" data-id="${t.id}" aria-label="Delete ${esc(t.title)}">${icon('trash', 15)}</button></span>`
    : `<span class="tools"><button type="button" class="tool" data-action="edit-task" data-id="${t.id}" aria-label="Edit ${esc(t.title)}">${icon('pencil', 15)}</button></span>`;
  return `<li class="task ${t.completed ? 'done' : ''} ${UI.justToggled === t.id ? 'pop' : ''}">
    <button type="button" class="chk" role="checkbox" aria-checked="${t.completed}" aria-label="${esc(t.title)}" data-action="toggle-task" data-id="${t.id}">${icon('check', 15)}</button>
    <button type="button" class="task-main" tabindex="-1" data-action="toggle-task" data-id="${t.id}">
      <span class="t-title">${esc(t.title)}</span>${t.description ? `<span class="t-desc">${esc(t.description)}</span>` : ''}
    </button>
    <i class="t-cat" style="--c:${c.color}" title="${c.label}"></i>${tools}</li>`;
}

function updateTasks() {
  const k = UI.sel; prepare([k]);
  const di = dayInfo(k), list = tasksOn(k), coach = esc(S.settings.coach), mood = di.mood;
  $('#t-head').innerHTML = list.length
    ? `Just <span id="t-n">${list.length}</span> ${list.length === 1 ? 'task' : 'tasks'} ${flameIcon(30)}<span class="h-av">${charArt(di.mood === 'neutral' ? 'good' : 'good')}</span><br><span class="sub">${coach} keeps you accountable</span>`
    : `No tasks yet ${flameIcon(30)}<span class="h-av">${charArt('neutral')}</span><br><span class="sub">Add one and ${coach} gets to work</span>`;
  const hero = $('#hero');
  const prevMood = hero.dataset.mood;
  hero.dataset.mood = mood;
  hero.style.setProperty('--mood', MOOD_META[mood].color);
  hero.style.setProperty('--seg', MOOD_META[mood].segColor);
  $$('.bg-layer,.char-layer', hero).forEach(l => l.classList.toggle('on', l.dataset.mood === mood));
  $$('#h-segs i').forEach((s, i) => s.classList.toggle('on', i < MOOD_META[mood].seg));
  $('#h-perfect').classList.toggle('show', mood === 'excellent');
  $('#h-streak').textContent = streaks().current;
  $('#h-bubble').textContent = di.planned ? 'Planned. Come back and tick them off.' : BUBBLE[mood];
  $('#p-day').textContent = relativeLabel(k);
  $('#p-count').textContent = di.total ? `${di.done}/${di.total}` : '–';
  $('#p-the').textContent = di.total ? 'THE ' + numWord(di.total).toUpperCase() : 'NO TASKS';
  $('#p-manage').hidden = list.length < 2;
  $('#p-manage').textContent = UI.manage ? 'Done' : 'Reorder';
  $('#task-list').innerHTML = list.length
    ? list.map((t, i) => taskRow(t, i, list.length)).join('')
    : `<li class="empty"><b>Nothing planned for ${relativeLabel(k).toLowerCase()}.</b><span class="muted sm">Add a task and it shows up here, on Home and in your calendar.</span></li>`;
  if (mood === 'excellent' && prevMood !== 'excellent' && UI.justToggled) burst($('.char-stack', hero));
}

/* =============================== CALENDAR =============================== */
function buildCalendarPage() {
  $('#page-calendar').innerHTML = `<div class="wrap cal-wrap">
    <h1 class="page-head" id="c-head"></h1>
    <div class="cal-layout">
    <section class="card cal-hero" aria-label="Selected day">
      <div class="carousel" id="carousel" tabindex="0" aria-label="Selected day. Swipe or use the left and right arrow keys to change day.">
        <button type="button" class="side side-l" data-action="day-prev" aria-label="Previous day"><span id="side-l"></span></button>
        <div class="center" id="center">
          <div class="ring" id="ring">${ringSVG('neutral')}</div>
          <div class="center-art">${MOODS.map(m => `<div class="char-layer" data-mood="${m}">${charArt(m)}</div>`).join('')}</div>
          <div class="streak-badge" id="c-badge">${flameIcon(16)} STREAK</div>
        </div>
        <button type="button" class="side side-r" data-action="day-next" aria-label="Next day"><span id="side-r"></span></button>
      </div>
      <div class="cal-meta" aria-live="polite">
        <h2 id="c-rel">Today</h2><p class="muted" id="c-date"></p>
        <p class="status" id="c-status"></p>
        <p class="muted sm" id="c-streak"></p>
      </div>
    </section>
    <section class="card cal-month" aria-label="Month calendar">
      <div class="month-head">
        <h3 id="m-title"></h3>
        <div class="month-nav">
          <button type="button" class="chip" data-action="month-today">Today</button>
          <button type="button" class="icon-btn sm" data-action="month-prev" aria-label="Previous month">${icon('left', 16)}</button>
          <button type="button" class="icon-btn sm" data-action="month-next" aria-label="Next month">${icon('right', 16)}</button>
        </div>
      </div>
      <div class="wk-head" id="m-wk"></div>
      <div class="month-grid" id="m-grid"></div>
    </section>
    </div>
  </div>`;
}

function renderMonthGrid() {
  const [y, m] = UI.viewMonth.split('-').map(Number);
  const start = WEEK_START_INDEX[S.settings.weekStart] ?? 6, today = todayKey();
  const keys = monthKeys(y, m - 1); prepare(keys);
  $('#m-title').textContent = `${MONTHS[m - 1]} ${y}`;
  $('#m-wk').innerHTML = Array.from({ length: 7 }, (_, i) => `<span>${DAY_SHORT[DAYS[(start + i) % 7]]}</span>`).join('');
  const lead = (new Date(y, m - 1, 1).getDay() - start + 7) % 7;
  let html = '<i class="blank"></i>'.repeat(lead);
  keys.forEach((k, i) => {
    const d = dayInfo(k), mood = d.planned ? 'neutral' : d.mood;
    html += `<button type="button" class="day m-${mood} ${k === UI.sel ? 'sel' : ''} ${k === today ? 'today' : ''} ${d.qualifies ? 'win' : ''}" data-action="sel-date" data-date="${k}" aria-pressed="${k === UI.sel}" aria-label="${longDate(k)}, ${d.total ? `${d.done} of ${d.total} done` : 'no tasks'}">
      <span class="n">${i + 1}</span><span class="art">${charArt(mood)}</span>${dots4(mood)}</button>`;
  });
  $('#m-grid').innerHTML = html;
}

function updateCalendar(dir = 0, monthDir = 0) {
  const k = UI.sel; prepare([k, addDays(k, -1), addDays(k, 1)]);
  const di = dayInfo(k), mood = di.mood, coach = esc(S.settings.coach), st = streaks();
  $('#c-head').innerHTML = `Build ${flameIcon(32)} streak.<span class="h-av">${charArt('good')}</span><br>Earn ${coach}’s approval.`;
  const center = $('#center');
  center.dataset.mood = mood;
  center.style.setProperty('--seg', MOOD_META[mood].segColor);
  center.style.setProperty('--mood', MOOD_META[mood].color);
  $$('#center .char-layer').forEach(l => l.classList.toggle('on', l.dataset.mood === mood));
  $$('#ring .arc').forEach((a, i) => a.classList.toggle('on', i < MOOD_META[mood].seg));
  $('#c-badge').classList.toggle('show', di.qualifies);
  const pm = dayInfo(addDays(k, -1)), nm = dayInfo(addDays(k, 1));
  $('#side-l').innerHTML = charArt(pm.planned ? 'neutral' : pm.mood);
  $('#side-r').innerHTML = charArt(nm.planned ? 'neutral' : nm.mood);
  $('#c-rel').textContent = relativeLabel(k);
  $('#c-date').textContent = longDate(k);
  const status = $('#c-status');
  status.className = 'status m-' + mood;
  status.textContent = !di.total ? 'No tasks scheduled' : di.planned ? `${di.total} planned` : `${di.done} of ${di.total} done · ${MOOD_META[mood].label}`;
  $('#c-streak').textContent = st.current ? `${plural(st.current, 'day')} streak · best ${st.best}` : st.best ? `No active streak · best ${st.best}` : 'Finish every task in a day to start a streak';
  renderMonthGrid();
  if (animOn()) {
    if (dir) $('.carousel').animate([{ transform: `translateX(${dir * 46}px)`, opacity: .35 }, { transform: 'none', opacity: 1 }], { duration: 340, easing: 'cubic-bezier(.22,1,.36,1)' });
    if (monthDir) $('#m-grid').animate([{ transform: `translateX(${monthDir * 30}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
  }
}

/* =============================== SETTINGS =============================== */
function renderSettings() {
  const el = $('#page-settings');
  prepare([UI.sel]);
  const ov = overview();
  const pills = [
    ['Tasks completed', ov.completed, '#F6DD64', 'check', ''],
    ['Tasks scheduled', ov.total, '#CDB9FF', 'list', ''],
    ['Current streak', ov.streak, '#B8F52A', 'flame', ''],
    ['Best streak', ov.best, '#A5ABFF', 'award', ''],
    ['Daily average', ov.avg, '#FF8E7E', 'bars', '%'],
    ['Active days', ov.active, '#F6DD64', 'calendar', ''],
    ['Study sessions', ov.study, '#CDB9FF', 'school', ''],
    ['Programming sessions', ov.code, '#B8F52A', 'code', ''],
    ['English sessions', ov.english, '#A5ABFF', 'chat', ''],
    ['School tasks done', ov.school, '#FF8E7E', 'school', '']
  ].map(([label, v, color, ic, suf], i) => `<div class="pill-stat" style="--pc:${color}">
      <span class="pi">${ic === 'flame' ? flameIcon(20) : icon(ic, 20)}</span><b>${num('p' + i, v, suf)}</b><span>${label}</span></div>`).join('');

  const sw = (action, on, label) => `<button type="button" class="switch" role="switch" aria-checked="${on}" aria-label="${label}" data-action="${action}"><i></i></button>`;
  const seg = (action, cur, opts) => `<div class="seg" role="radiogroup">${opts.map(([v, l]) => `<button type="button" role="radio" aria-checked="${cur === v}" data-action="${action}" data-v="${v}">${l}</button>`).join('')}</div>`;
  const s = S.settings;

  el.innerHTML = `<div class="wrap settings-wrap">
    <header class="set-head">
      <button type="button" class="avatar sm" data-action="open-profile" aria-label="Edit profile"><span class="avatar-in">${profileAvatar()}</span></button>
      <div class="set-who"><span class="muted sm">Welcome back</span><h1>${esc(S.profile.name)}</h1><span class="muted sm">${esc(S.profile.username)}</span></div>
      <button type="button" class="icon-btn round" data-action="go" data-page="home" aria-label="Go to Home">${icon('home', 20)}</button>
    </header>

    <section aria-labelledby="h-stats"><h2 class="sec" id="h-stats">Your numbers <span class="fa" lang="fa" dir="rtl">آمار</span></h2>
      <div class="pills">${pills}</div>
      <p class="muted sm note">Study sessions count completed School, Code, English and Review tasks. Everything here is calculated from your saved tasks.</p>
    </section>

    <div class="set-cols">
    <section aria-labelledby="h-prefs"><h2 class="sec" id="h-prefs">Preferences <span class="fa" lang="fa" dir="rtl">تنظیمات</span></h2>
      <div class="list">
        <button type="button" class="row" data-action="open-profile"><span class="ri">${icon('user', 18)}</span><span class="rt"><b>Edit profile</b><small>Name, username, picture, companion name</small></span>${icon('right', 18, 'muted')}</button>
        <button type="button" class="row" data-action="open-timetable"><span class="ri">${icon('sliders', 18)}</span><span class="rt"><b>Weekly timetable &amp; routines</b><small>School hours, English class, recurring tasks</small></span>${icon('right', 18, 'muted')}</button>
        <div class="row"><span class="ri">${icon('moon', 18)}</span><span class="rt"><b>Theme</b></span>${seg('set-theme', s.theme, [['dark', 'Dark'], ['amoled', 'Black'], ['light', 'Light']])}</div>
        <div class="row"><span class="ri">${icon('volume', 18)}</span><span class="rt"><b>Sound</b><small>Soft click when changing days</small></span>${sw('toggle-sound', s.sound, 'Sound')}</div>
        <div class="row"><span class="ri">${icon('zap', 18)}</span><span class="rt"><b>Animations</b><small>Turn off for a calmer interface</small></span>${sw('toggle-anim', s.animations, 'Animations')}</div>
        <div class="row"><span class="ri">${icon('calendar', 18)}</span><span class="rt"><b>Week starts on</b></span>
          <select class="sel-input" data-setting="weekStart" aria-label="Week starts on"><option value="sat" ${s.weekStart === 'sat' ? 'selected' : ''}>Saturday</option><option value="sun" ${s.weekStart === 'sun' ? 'selected' : ''}>Sunday</option><option value="mon" ${s.weekStart === 'mon' ? 'selected' : ''}>Monday</option></select></div>
        <div class="row"><span class="ri">${icon('flame', 18)}</span><span class="rt"><b>A streak day needs</b><small>Share of the day’s tasks completed</small></span>
          <select class="sel-input" data-setting="streakThreshold" aria-label="Streak rule"><option value="100" ${s.streakThreshold === 100 ? 'selected' : ''}>All tasks</option><option value="75" ${s.streakThreshold === 75 ? 'selected' : ''}>75%</option><option value="50" ${s.streakThreshold === 50 ? 'selected' : ''}>50%</option></select></div>
      </div>
    </section>

    <section aria-labelledby="h-data"><h2 class="sec" id="h-data">Your data <span class="fa" lang="fa" dir="rtl">داده‌ها</span></h2>
      <div class="list">
        <button type="button" class="row" data-action="export"><span class="ri">${icon('download', 18)}</span><span class="rt"><b>Export data</b><small>Download everything as a JSON file</small></span></button>
        <button type="button" class="row" data-action="import"><span class="ri">${icon('upload', 18)}</span><span class="rt"><b>Import data</b><small>Restore from a Streakwise export</small></span></button>
        <button type="button" class="row warn" data-action="reset"><span class="ri">${icon('rotate', 18)}</span><span class="rt"><b>Reset progress</b><small>Erase task history, keep profile and routines</small></span></button>
        <button type="button" class="row danger" data-action="clear"><span class="ri">${icon('trash', 18)}</span><span class="rt"><b>Clear all data</b><small>Delete everything and start over</small></span></button>
      </div>
    </section>
    </div>

    <section class="about" aria-labelledby="h-about"><h2 class="sec" id="h-about">About Streakwise</h2>
      <p>Streakwise is a personal planner for the things that compound: school, programming, English and the habits that keep them going. Each day gets a short list of tasks drawn from your own weekly timetable, and ${esc(S.settings.coach)} reacts honestly to how much of it you finished.</p>
      <p>Progress here means real, completed tasks and the consistency behind them. It is a tool for building a record of steady work on your studies, your code and your portfolio. It does not predict admissions or scholarships, and finishing a checklist is never a guarantee of either. Rest, sleep and free time count too.</p>
      <p class="muted sm">${storageOK ? 'All data stays in this browser on this device.' : 'Browser storage is unavailable, so data will be lost when you close this tab. Use Export to keep a copy.'}</p>
    </section>
  </div>`;
  animateNums(el);
}
