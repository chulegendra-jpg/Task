/* =====================================================================
   SHEETS — forms and dialogs (task, profile, timetable, routine, roadmap)
   ===================================================================== */
const catOptions = cur => Object.entries(CATEGORIES).map(([k, c]) => `<option value="${k}" ${k === cur ? 'selected' : ''}>${c.label}</option>`).join('');
const dayChips = (sel, name = 'days') => ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'].map(d =>
  `<label class="dchip"><input type="checkbox" name="${name}" value="${d}" ${sel.includes(d) ? 'checked' : ''}><span>${DAY_SHORT[d]}</span></label>`).join('');
const setErr = (form, name, msg) => {
  const e = $(`[data-err="${name}"]`, form); if (!e) return;
  e.textContent = msg || ''; e.hidden = !msg;
  const inp = form.elements[name]; if (inp && inp.setAttribute) inp.setAttribute('aria-invalid', msg ? 'true' : 'false');
};

/* ---------- Task: add / edit ---------- */
function taskSheet(id, date) {
  const t = id ? S.tasks.find(x => x.id === id) : null;
  if (id && !t) return;
  const d = t ? t.date : date;
  const canRepeat = !t && d >= todayKey();
  const routineNote = t && t.routineId ? `<p class="hint">${icon('info', 15)} Part of a weekly routine. Changes here apply to this day only.
      <button type="button" class="link-btn" data-action="edit-routine-of" data-id="${t.id}">Edit the routine</button></p>` : '';
  openSheet({
    title: t ? 'Edit task' : 'New task',
    html: `<form class="form" id="task-form" novalidate>
      <label class="field"><span>Title</span><input name="title" maxlength="80" required autocomplete="off" placeholder="e.g. Practise array methods" value="${esc(t ? t.title : '')}"><em class="err" data-err="title" hidden></em></label>
      <label class="field"><span>Description <small>optional</small></span><textarea name="description" maxlength="160" rows="2" placeholder="What exactly will you do?">${esc(t ? t.description : '')}</textarea></label>
      <div class="two">
        <label class="field"><span>Date</span><input type="date" name="date" required min="2000-01-01" max="2100-12-31" value="${d}"><em class="err" data-err="date" hidden></em></label>
        <label class="field"><span>Category</span><select name="category">${catOptions(t ? t.category : 'programming')}</select></label>
      </div>
      ${canRepeat ? `<fieldset class="field rep"><legend>Repeat</legend>
        <div class="seg"><label><input type="radio" name="repeat" value="none" checked><span>Just this day</span></label><label><input type="radio" name="repeat" value="weekly"><span>Every week</span></label></div>
        <div class="dchips" id="rep-days" hidden>${dayChips([weekdayId(d)])}</div><em class="err" data-err="days" hidden></em></fieldset>` : ''}
      ${routineNote}
      <div class="btn-row">${t ? `<button type="button" class="btn danger-ghost" data-action="del-task" data-id="${t.id}">Delete</button>` : ''}<button class="btn primary" type="submit">${t ? 'Save changes' : 'Add task'}</button></div>
    </form>`,
    onMount(el) {
      const form = $('#task-form', el);
      $$('input[name=repeat]', form).forEach(r => r.addEventListener('change', () => { $('#rep-days', form).hidden = form.elements.repeat.value !== 'weekly'; }));
      form.addEventListener('submit', e => {
        e.preventDefault();
        const title = form.elements.title.value.trim(), date = form.elements.date.value;
        let ok = true;
        setErr(form, 'title', title ? '' : 'Give the task a title.'); if (!title) ok = false;
        const validDate = isValidKey(date) && date >= '2000-01-01' && date <= '2100-12-31';
        setErr(form, 'date', validDate ? '' : 'Pick a valid date.'); if (!validDate) ok = false;
        const weekly = form.elements.repeat && form.elements.repeat.value === 'weekly';
        const days = weekly ? $$('#rep-days input:checked', form).map(i => i.value) : [];
        if (weekly) { setErr(form, 'days', days.length ? '' : 'Choose at least one day.'); if (!days.length) ok = false; }
        if (!ok) { const bad = $('[aria-invalid=true]', form) || $('.err:not([hidden])', form); if (bad && bad.focus) bad.focus(); return; }
        const fields = { title, description: form.elements.description.value.trim(), category: form.elements.category.value };
        closeSheet();
        if (t) { updateTask(t.id, { ...fields, date }); toast('Task saved'); }
        else if (weekly) {
          saveRoutine({ id: uid(), ...fields, days, order: 55, startDate: date, jsStage: null });
          toast('Weekly task added');
        } else { addTask({ ...fields, date }); toast('Task added'); }
        setSelected(date);
      });
    }
  });
}

/* ---------- Profile ---------- */
function processImage(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) return reject(new Error('Choose an image file.'));
    if (file.size > 12 * 1024 * 1024) return reject(new Error('That image is over 12 MB.'));
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const s = Math.min(img.width, img.height), c = document.createElement('canvas');
      c.width = c.height = 256;
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 256, 256);
      URL.revokeObjectURL(url); resolve(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image.')); };
    img.src = url;
  });
}
function profileSheet() {
  let avatar = S.profile.avatar;
  openSheet({
    title: 'Edit profile',
    html: `<form class="form" id="profile-form" novalidate>
      <div class="av-edit"><div class="avatar big"><span class="avatar-in" id="av-prev"></span></div>
        <div class="av-btns"><button type="button" class="btn ghost sm" id="av-pick">${icon('camera', 16)} <span id="av-pick-l">Upload photo</span></button>
        <button type="button" class="btn ghost sm" id="av-remove">${icon('trash', 16)} Remove</button></div></div>
      <label class="field"><span>Display name</span><input name="name" maxlength="24" autocomplete="off" value="${esc(S.profile.name)}"><em class="err" data-err="name" hidden></em></label>
      <label class="field"><span>Username</span><input name="username" maxlength="25" autocomplete="off" autocapitalize="none" spellcheck="false" value="${esc(S.profile.username)}"><em class="err" data-err="username" hidden></em></label>
      <label class="field"><span>Companion name</span><input name="coach" maxlength="14" autocomplete="off" value="${esc(S.settings.coach)}"><em class="err" data-err="coach" hidden></em></label>
      <div class="btn-row"><button class="btn primary" type="submit">Save profile</button></div></form>`,
    onMount(el) {
      const form = $('#profile-form', el), fileIn = $('#file-avatar');
      const paint = () => {
        $('#av-prev', el).innerHTML = avatar ? `<img src="${esc(avatar)}" alt="Profile preview">` : profileAvatarDefault();
        $('#av-pick-l', el).textContent = avatar ? 'Replace photo' : 'Upload photo';
        $('#av-remove', el).hidden = !avatar;
      };
      paint();
      $('#av-pick', el).addEventListener('click', () => fileIn.click());
      $('#av-remove', el).addEventListener('click', () => { avatar = null; paint(); });
      fileIn.onchange = async () => {
        const f = fileIn.files[0]; fileIn.value = '';
        if (!f) return;
        try { avatar = await processImage(f); paint(); } catch (err) { toast(err.message); }
      };
      form.addEventListener('submit', e => {
        e.preventDefault();
        const name = form.elements.name.value.trim(), coach = form.elements.coach.value.trim();
        let user = form.elements.username.value.trim().replace(/^@+/, '');
        let ok = true;
        setErr(form, 'name', name ? '' : 'Enter a display name.'); if (!name) ok = false;
        const uOk = /^[A-Za-z0-9_.]{2,24}$/.test(user);
        setErr(form, 'username', uOk ? '' : 'Use 2–24 letters, numbers, dots or underscores.'); if (!uOk) ok = false;
        setErr(form, 'coach', coach ? '' : 'Give your companion a name.'); if (!coach) ok = false;
        if (!ok) { const bad = $('[aria-invalid=true]', form); if (bad) bad.focus(); return; }
        S.profile.name = name; S.profile.username = '@' + user; S.profile.avatar = avatar;
        S.settings.coach = coach;
        commit(); closeSheet(); buildTasksPage(); buildCalendarPage(); renderCurrent(); toast('Profile saved');
      });
    }
  });
}
const profileAvatarDefault = () => ASSETS.avatar ? `<img src="${esc(ASSETS.avatar)}" alt="">` : `<span class="av-char">${charArt('good')}</span>`;

/* ---------- Timetable & routines ---------- */
const TT_ORDER = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
function timetableSheet(tab = 'schedule') {
  const sch = S.schedule;
  const timeIn = (kind, d, i) => `<input type="time" name="${kind}-${d}-${i}" value="${sch[kind][d] ? sch[kind][d][i] : ''}" aria-label="${kind === 'school' ? 'School' : 'English class'} ${i ? 'end' : 'start'} on ${DAY_FULL[d]}">`;
  const rows = TT_ORDER.map(d => `<div class="tt-day"><b>${DAY_FULL[d]}</b>
      <div class="tt-line"><span>School</span>${timeIn('school', d, 0)}<i>–</i>${timeIn('school', d, 1)}</div>
      <div class="tt-line"><span>English class</span>${timeIn('english', d, 0)}<i>–</i>${timeIn('english', d, 1)}</div></div>`).join('');
  const routines = S.routines.slice().sort((a, b) => a.title.localeCompare(b.title)).map(r => {
    const c = CATEGORIES[r.category];
    return `<button type="button" class="rt-row" data-action="edit-routine" data-id="${esc(r.id)}"><i class="t-cat" style="--c:${c.color}"></i>
      <span><b>${esc(r.title)}</b><small>${r.days.length === 7 ? 'Every day' : TT_ORDER.filter(d => r.days.includes(d)).map(d => DAY_SHORT[d]).join(' · ') || 'No days'}</small></span>${icon('right', 16, 'muted')}</button>`;
  }).join('');
  openSheet({
    title: 'Timetable & routines', cls: 'sheet-lg',
    html: `<div class="tabs" role="tablist"><button type="button" role="tab" data-tab="schedule" aria-selected="${tab === 'schedule'}">Weekly schedule</button><button type="button" role="tab" data-tab="routines" aria-selected="${tab === 'routines'}">Routines</button></div>
      <form id="tt-form" class="form tt" data-panel="schedule" ${tab === 'schedule' ? '' : 'hidden'} novalidate>
        <p class="muted sm">Leave both times empty for a day without school or class. Changes apply from today onward; past days stay as they were.</p>
        ${rows}<em class="err" id="tt-err" hidden></em>
        <div class="btn-row"><button class="btn primary" type="submit">Save schedule</button></div></form>
      <div data-panel="routines" ${tab === 'routines' ? '' : 'hidden'}>
        <p class="muted sm">Routines repeat on the days you choose. School and English class come from the weekly schedule.</p>
        <div class="rt-list">${routines || '<p class="muted">No routines yet.</p>'}</div>
        <div class="btn-row"><button type="button" class="btn primary" data-action="edit-routine" data-id="">${icon('plus', 16)} New routine</button></div></div>`,
    onMount(el) {
      $$('[data-tab]', el).forEach(b => b.addEventListener('click', () => {
        $$('[data-tab]', el).forEach(x => x.setAttribute('aria-selected', x === b));
        $$('[data-panel]', el).forEach(p => { p.hidden = p.dataset.panel !== b.dataset.tab; });
      }));
      $('#tt-form', el).addEventListener('submit', e => {
        e.preventDefault();
        const f = e.target, next = { school: {}, english: {} }, err = $('#tt-err', el);
        for (const kind of ['school', 'english']) for (const d of DAYS) {
          const a = f.elements[`${kind}-${d}-0`].value, b = f.elements[`${kind}-${d}-1`].value;
          if (!a && !b) { next[kind][d] = null; continue; }
          if (!a || !b || b <= a) {
            err.textContent = `${DAY_FULL[d]}: ${kind === 'school' ? 'school' : 'English class'} needs a start time and a later end time, or leave both empty.`; err.hidden = false;
            f.elements[`${kind}-${d}-${!a ? 0 : 1}`].focus(); return;
          }
          next[kind][d] = [a, b];
        }
        err.hidden = true; closeSheet(); setSchedule(next); toast('Schedule saved');
      });
    }
  });
}

function routineSheet(id) {
  const r = id ? S.routines.find(x => x.id === id) : null;
  if (id && !r) return;
  openSheet({
    title: r ? 'Edit routine' : 'New routine',
    html: `<form class="form" id="routine-form" novalidate>
      <label class="field"><span>Title</span><input name="title" maxlength="80" autocomplete="off" value="${esc(r ? r.title : '')}" placeholder="e.g. Read for 20 minutes"><em class="err" data-err="title" hidden></em></label>
      <label class="field"><span>Description <small>optional</small></span><textarea name="description" maxlength="160" rows="2">${esc(r ? r.description : '')}</textarea></label>
      <label class="field"><span>Category</span><select name="category">${catOptions(r ? r.category : 'programming')}</select></label>
      <fieldset class="field rep"><legend>Repeats on</legend><div class="dchips">${dayChips(r ? r.days : [])}</div><em class="err" data-err="days" hidden></em></fieldset>
      <div class="btn-row">${r ? '<button type="button" class="btn danger-ghost" id="rt-del">Delete</button>' : ''}<button class="btn primary" type="submit">${r ? 'Save routine' : 'Add routine'}</button></div></form>`,
    onMount(el) {
      const form = $('#routine-form', el);
      if (r) $('#rt-del', el).addEventListener('click', async () => {
        const ok = await confirmDialog({ title: 'Delete routine?', message: `“${r.title}” will be removed from today and future days. Completed tasks in your history stay.`, confirmLabel: 'Delete routine', danger: true });
        if (ok) { deleteRoutine(r.id); toast('Routine deleted'); timetableSheet('routines'); } else routineSheet(r.id);
      });
      form.addEventListener('submit', e => {
        e.preventDefault();
        const title = form.elements.title.value.trim(), days = $$('input[name=days]:checked', form).map(i => i.value);
        setErr(form, 'title', title ? '' : 'Give the routine a title.');
        setErr(form, 'days', days.length ? '' : 'Choose at least one day.');
        if (!title || !days.length) { const bad = $('[aria-invalid=true]', form); if (bad) bad.focus(); return; }
        saveRoutine({ id: r ? r.id : uid(), title, description: form.elements.description.value.trim(), category: form.elements.category.value, days, order: r ? r.order : 55, startDate: r ? r.startDate : null, jsStage: r ? r.jsStage : null });
        toast('Routine saved'); timetableSheet('routines');
      });
    }
  });
}

/* ---------- JavaScript roadmap ---------- */
function roadmapSheet() {
  const row = it => `<label class="rm-row"><input type="checkbox" data-rm="${it.id}" ${S.roadmap.done[it.id] ? 'checked' : ''}><span class="rm-box">${icon('check', 14)}</span><span>${esc(it.title)}</span></label>`;
  const mins = v => { const m = Math.round(v / JS_COURSE.videos * JS_COURSE.minutes); return `${Math.floor(m / 60)}h ${pad(m % 60)}m`; };
  openSheet({
    title: 'JavaScript roadmap', cls: 'sheet-lg',
    html: `<div class="rm-course"><div><b>Project-based JavaScript course</b><small>${JS_COURSE.videos} videos · ${Math.floor(JS_COURSE.minutes / 60)}h ${JS_COURSE.minutes % 60}m in total</small></div>
        <div class="stepper"><button type="button" class="icon-btn sm" id="vid-minus" aria-label="One video fewer">${icon('minus', 16)}</button>
        <input type="number" id="vid-n" min="0" max="${JS_COURSE.videos}" value="${S.roadmap.videos}" aria-label="Videos watched"><button type="button" class="icon-btn sm" id="vid-plus" aria-label="One video more">${icon('plus', 16)}</button></div></div>
      <div class="bar"><i id="vid-bar" style="width:${S.roadmap.videos / JS_COURSE.videos * 100}%"></i></div>
      <p class="muted sm" id="vid-note"></p>
      <h3 class="sub-h">How you study each topic</h3>
      <ol class="stages">${JS_STAGES.map(s => `<li><b>${s.label}</b><span>${s.text}</span></li>`).join('')}</ol>
      <p class="hint">${icon('info', 15)} Watching is not progress until you have typed the code yourself.</p>
      <h3 class="sub-h">Beginner course topics <small id="rm-b"></small></h3><div class="rm-grid">${JS_TOPICS.map(row).join('')}</div>
      <h3 class="sub-h">After the course <small id="rm-a"></small></h3><div class="rm-grid">${JS_NEXT.map(row).join('')}</div>`,
    onMount(el) {
      const inp = $('#vid-n', el);
      const paint = () => {
        const v = S.roadmap.videos;
        $('#vid-bar', el).style.width = v / JS_COURSE.videos * 100 + '%';
        $('#vid-note', el).textContent = `${v} of ${JS_COURSE.videos} videos · about ${mins(v)} watched`;
        $('#rm-b', el).textContent = `${JS_TOPICS.filter(t => S.roadmap.done[t.id]).length}/${JS_TOPICS.length}`;
        $('#rm-a', el).textContent = `${JS_NEXT.filter(t => S.roadmap.done[t.id]).length}/${JS_NEXT.length}`;
        inp.value = v;
      };
      const setV = v => { S.roadmap.videos = clamp(Math.round(Number(v)) || 0, 0, JS_COURSE.videos); save(); paint(); if (UI.page === 'home') renderHome(); };
      $('#vid-minus', el).addEventListener('click', () => setV(S.roadmap.videos - 1));
      $('#vid-plus', el).addEventListener('click', () => setV(S.roadmap.videos + 1));
      inp.addEventListener('change', () => setV(inp.value));
      $$('[data-rm]', el).forEach(c => c.addEventListener('change', () => {
        if (c.checked) S.roadmap.done[c.dataset.rm] = true; else delete S.roadmap.done[c.dataset.rm];
        save(); paint(); if (UI.page === 'home') renderHome();
      }));
      paint();
    }
  });
}
