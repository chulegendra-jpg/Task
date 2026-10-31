/* =====================================================================
   UI KIT — selectors, escaping, toast, sheets, confirm, sound, counters
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const animOn = () => S.settings.animations && !matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Toast ---------- */
function toast(msg) {
  const root = $('#toast-root'); if (!root) return;
  const el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg;
  root.appendChild(el);
  requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 300); }, 2600);
}

/* ---------- Sound (optional, off by default) ---------- */
let audioCtx = null;
function tick(kind = 'soft') {
  if (!S.settings.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t = audioCtx.currentTime, o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'sine';
    const f = kind === 'done' ? [660, 990] : [900, 520];
    o.frequency.setValueAtTime(f[0], t); o.frequency.exponentialRampToValueAtTime(f[1], t + 0.05);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    o.connect(g).connect(audioCtx.destination); o.start(t); o.stop(t + 0.1);
  } catch (e) { /* audio unavailable */ }
}

/* ---------- Animated numbers ---------- */
const lastNums = {};
function animateNums(root) {
  $$('[data-num]', root).forEach(el => {
    const key = el.dataset.num, to = Number(el.dataset.to) || 0, suffix = el.dataset.suffix || '';
    const from = lastNums[key] ?? 0; lastNums[key] = to;
    if (!animOn() || from === to) { el.textContent = to + suffix; return; }
    const t0 = performance.now(), dur = 600;
    const step = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}
const num = (key, to, suffix = '') => `<span data-num="${key}" data-to="${to}" data-suffix="${suffix}">${to}${suffix}</span>`;

/* ---------- Bottom sheet / modal ---------- */
let sheetEl = null, sheetReturnFocus = null;
function closeSheet() {
  if (!sheetEl) return;
  const el = sheetEl; sheetEl = null;
  el.classList.remove('open');
  document.removeEventListener('keydown', sheetKeys, true);
  setTimeout(() => el.remove(), animOn() ? 280 : 0);
  if (sheetReturnFocus && document.contains(sheetReturnFocus)) sheetReturnFocus.focus({ preventScroll: true });
  if (typeof el._onClose === 'function') el._onClose();
}
function sheetKeys(e) {
  if (!sheetEl) return;
  if (e.key === 'Escape') { e.stopPropagation(); closeSheet(); return; }
  if (e.key !== 'Tab') return;
  const f = $$('button:not([disabled]),input:not([disabled]),select,textarea,[href],[tabindex]:not([tabindex="-1"])', sheetEl).filter(x => x.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
function openSheet({ title, html, onMount, onClose, cls = '' }) {
  if (sheetEl) { const old = sheetEl; sheetEl = null; old.remove(); document.removeEventListener('keydown', sheetKeys, true); }
  else sheetReturnFocus = document.activeElement;
  const ov = document.createElement('div');
  ov.className = 'sheet-ov';
  ov.innerHTML = `<div class="sheet ${cls}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="sheet-grab" aria-hidden="true"></div>
    <header class="sheet-head"><h2>${esc(title)}</h2><button class="icon-btn" type="button" data-action="close-sheet" aria-label="Close">${icon('x', 18)}</button></header>
    <div class="sheet-body">${html}</div></div>`;
  ov.addEventListener('pointerdown', e => { if (e.target === ov) ov._down = true; });
  ov.addEventListener('click', e => { if (e.target === ov && ov._down) closeSheet(); ov._down = false; });
  ov._onClose = onClose;
  $('#sheet-root').appendChild(ov);
  sheetEl = ov;
  document.addEventListener('keydown', sheetKeys, true);
  requestAnimationFrame(() => requestAnimationFrame(() => ov.classList.add('open')));
  if (onMount) onMount($('.sheet', ov));
  setTimeout(() => { const f = $('[autofocus], input:not([type=hidden]):not([type=file]), textarea', ov); if (f) f.focus({ preventScroll: true }); }, 60);
  return ov;
}

/* Promise-based confirmation. requireText → user must type it to enable the button. */
function confirmDialog({ title, message, confirmLabel = 'Confirm', danger = false, requireText = null }) {
  return new Promise(resolve => {
    let result = false;
    openSheet({
      title, cls: 'sheet-sm',
      html: `<p class="muted pad-b">${esc(message)}</p>
        ${requireText ? `<label class="field"><span>Type <b>${esc(requireText)}</b> to continue</span><input id="confirm-text" autocomplete="off" autocapitalize="characters" spellcheck="false"></label>` : ''}
        <div class="btn-row"><button class="btn ghost" type="button" data-action="close-sheet">Cancel</button>
        <button class="btn ${danger ? 'danger' : 'primary'}" type="button" id="confirm-go" ${requireText ? 'disabled' : ''}>${esc(confirmLabel)}</button></div>`,
      onMount(el) {
        const go = $('#confirm-go', el), inp = $('#confirm-text', el);
        if (inp) inp.addEventListener('input', () => { go.disabled = inp.value.trim() !== requireText; });
        go.addEventListener('click', () => { result = true; closeSheet(); });
      },
      onClose() { resolve(result); }
    });
  });
}

/* Particle burst for a perfect day */
function burst(el) {
  if (!animOn() || !el) return;
  const r = el.getBoundingClientRect();
  for (let i = 0; i < 14; i++) {
    const p = document.createElement('i');
    p.className = 'spark';
    p.style.left = r.left + r.width / 2 + 'px'; p.style.top = r.top + r.height / 2 + 'px';
    p.style.background = ['#B8F52A', '#a78bfa', '#fff', '#ffd23f'][i % 4];
    document.body.appendChild(p);
    const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 70;
    p.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d - 3}px,${Math.sin(a) * d - 3}px) scale(0)`, opacity: 0 }], { duration: 700 + Math.random() * 300, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => p.remove();
  }
}
