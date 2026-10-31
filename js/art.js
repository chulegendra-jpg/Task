/* =====================================================================
   ART — icons and original SVG artwork (mascot, desert scenes, trophy).
   Everything here is replaceable through ASSETS in config.js.
   ===================================================================== */

/* ---------- Icons (Lucide-style, 24px grid) ---------- */
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  tasks: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8M13 12h8M13 18h8"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkBadge: '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  up: '<path d="m18 15-6-6-6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  pencil: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  volume: '<path d="M11 5 6 9H2v6h4l5 4zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  rotate: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  school: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
  sliders: '<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
  route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
  bars: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'
};
function icon(name, size = 20, cls = '') {
  return `<svg class="i ${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
}
function flameIcon(size = 18) {
  if (ASSETS.fire) return `<img class="i" src="${ASSETS.fire}" width="${size}" height="${size}" alt="" draggable="false">`;
  return `<svg class="i flame" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="#ff9a1f" stroke="#ff5a1f" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 21a3.6 3.6 0 0 1-3.6-3.6c0-1.6 1.2-2.6 2-3.6.4 1 1.1 1.5 1.8 2 .9.7 1.4 1.4 1.4 2.2A1.8 1.8 0 0 1 12 21z" fill="#ffe27a"/></svg>`;
}

/* ---------- Mascot ("Rudy"): original beanie character, one SVG per mood ---------- */
function charSVG(mood) {
  const m = MOOD_META[mood] ? mood : 'neutral';
  const skin = '#F7C9A1', ink = '#1b1410', lime = '#B8F52A';
  const body = '<path d="M30 206c0-32 28-50 70-50s70 18 70 50z"/>';
  const ears = '<circle cx="43" cy="116" r="12"/><circle cx="157" cy="116" r="12"/>';
  const head = '<ellipse cx="100" cy="112" rx="58" ry="54"/>';
  const hat = '<path d="M42 92C40 50 66 30 100 30s60 20 58 62z"/><circle cx="100" cy="23" r="11"/>';
  const thumb = m === 'excellent' ? '<rect x="136" y="166" width="34" height="32" rx="12"/><rect x="141" y="140" width="14" height="34" rx="7"/>' : '';
  const outline = `<g fill="#fff" stroke="#fff" stroke-width="15" stroke-linejoin="round">${body}${ears}${head}${hat}${thumb}</g>`;

  const stroke = (d, w = 5) => `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const dotEye = (cx, ry = 7.5) => `<ellipse cx="${cx}" cy="126" rx="6" ry="${ry}" fill="${ink}"/><circle cx="${cx + 2}" cy="123" r="2" fill="#fff"/>`;
  let face = '';
  if (m === 'excellent') {
    face = stroke('M65 128q11-16 22 0', 5.5) + stroke('M113 128q11-16 22 0', 5.5) +
      `<path d="M76 144q24 30 48 0z" fill="#5a1d1d" stroke="${ink}" stroke-width="4.5" stroke-linejoin="round"/><path d="M90 160q10-10 20 0q-10 6-20 0z" fill="#ff7a8a"/>` +
      '<ellipse cx="62" cy="142" rx="9" ry="6" fill="#ff7b7b" opacity=".75"/><ellipse cx="138" cy="142" rx="9" ry="6" fill="#ff7b7b" opacity=".75"/>' +
      `<path d="M176 74l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="${lime}" stroke="#fff" stroke-width="2"/><path d="M26 66l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="${lime}" stroke="#fff" stroke-width="2"/>`;
  } else if (m === 'good') {
    face = dotEye(76) + dotEye(124) + stroke('M65 114q11-6 22-1', 3.5) + stroke('M113 113q11-5 22 1', 3.5) +
      stroke('M85 147q15 13 30 0', 5) + '<ellipse cx="62" cy="142" rx="9" ry="6" fill="#ff7b7b" opacity=".5"/><ellipse cx="138" cy="142" rx="9" ry="6" fill="#ff7b7b" opacity=".5"/>';
  } else if (m === 'average') {
    face = dotEye(76, 6) + dotEye(124, 6) + stroke('M63 112L89 120', 6) + stroke('M137 112L111 120', 6) +
      stroke('M87 151q13-5 27 2', 5) + `<path d="M150 98q5 7 0 11q-5-4 0-11z" fill="#7cc7ff" stroke="${ink}" stroke-width="2"/>`;
  } else if (m === 'low') {
    face = `<ellipse cx="76" cy="128" rx="9" ry="8.5" fill="#fff" stroke="${ink}" stroke-width="3.5"/><circle cx="77" cy="129" r="5" fill="#e0120d"/><circle cx="77" cy="129" r="2" fill="${ink}"/>` +
      `<ellipse cx="124" cy="128" rx="9" ry="8.5" fill="#fff" stroke="${ink}" stroke-width="3.5"/><circle cx="123" cy="129" r="5" fill="#e0120d"/><circle cx="123" cy="129" r="2" fill="${ink}"/>` +
      stroke('M58 108L92 124', 8.5) + stroke('M142 108L108 124', 8.5) +
      `<path d="M78 160q22-26 44 0z" fill="#3a0b0b" stroke="${ink}" stroke-width="4.5" stroke-linejoin="round"/><path d="M88 152h24v6H88z" fill="#fff"/>` +
      stroke('M146 140l7-7m0 0l7 2m-7-2l2-8', 3.5).replace(ink, '#ff2d2d') +
      stroke('M30 80q-6-8 0-16m-8 20q-10-10 0-24', 3).replace(ink, '#ff6a4d');
  } else {
    face = dotEye(76, 6) + dotEye(124, 6) + stroke('M65 114h22', 3.5) + stroke('M113 114h22', 3.5) + stroke('M90 150h20', 5);
  }
  const fills = `
    <path d="M30 206c0-32 28-50 70-50s70 18 70 50z" fill="#2c3036"/>
    <path d="M70 160q30 22 60 0" fill="none" stroke="#1d2024" stroke-width="7" stroke-linecap="round"/>
    <path d="M100 178v30" stroke="${lime}" stroke-width="4" stroke-linecap="round"/>
    ${m === 'excellent' ? `<rect x="141" y="140" width="14" height="34" rx="7" fill="${skin}" stroke="${ink}" stroke-width="3"/><rect x="136" y="166" width="34" height="32" rx="12" fill="${skin}" stroke="${ink}" stroke-width="3"/><path d="M142 178h22M142 188h22" stroke="${ink}" stroke-width="2.5" opacity=".35"/>` : ''}
    <circle cx="43" cy="116" r="12" fill="${skin}"/><circle cx="157" cy="116" r="12" fill="${skin}"/>
    <ellipse cx="100" cy="112" rx="58" ry="54" fill="${skin}"/>
    ${m === 'low' ? '<ellipse cx="100" cy="112" rx="58" ry="54" fill="#ff3b30" opacity=".3"/>' : ''}
    <ellipse cx="100" cy="134" rx="4.5" ry="3.4" fill="#E2966B"/>
    <path d="M42 92C40 50 66 30 100 30s60 20 58 62z" fill="${lime}"/>
    <circle cx="100" cy="23" r="11" fill="#fff"/>
    <path d="M64 44q-8 14-6 34" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".35"/>
    <path d="M41 84Q100 98 159 84L160 100Q100 114 40 100Z" fill="#8fcb12"/>`;
  const labels = { excellent: 'Very happy', good: 'Satisfied', average: 'Slightly angry', low: 'Very angry', neutral: 'Calm' };
  return `<svg viewBox="0 0 200 200" role="img" aria-label="${labels[m]} character" focusable="false">${outline}${fills}${face}</svg>`;
}
function charArt(mood) {
  const m = MOOD_META[mood] ? mood : 'neutral';
  const src = ASSETS.characterStates[m];
  return src ? `<img src="${src}" alt="${MOOD_META[m].label}" draggable="false">` : charSVG(m);
}

/* ---------- Desert backgrounds ---------- */
const DESERT = {
  excellent: { sky: ['#2a1160', '#8a4bc9', '#f3a9dc'], sun: '#ffe0f4', d: ['#6a2f9c', '#4a1f78', '#2f1052'] },
  good:      { sky: ['#101c63', '#3560d8', '#9cc0ff'], sun: '#e6f0ff', d: ['#2644b5', '#1a309a', '#101f6a'] },
  average:   { sky: ['#e0561a', '#ff9a3d', '#ffe0a0'], sun: '#fff3c4', d: ['#d06020', '#b04a18', '#7e3210'] },
  low:       { sky: ['#55080a', '#d02a1f', '#ff7a4a'], sun: '#ffc2a4', d: ['#8c1210', '#6a0c0c', '#3e0606'] },
  neutral:   { sky: ['#1c2029', '#3a4254', '#6c7690'], sun: '#cfd6e6', d: ['#2b3140', '#222735', '#171b26'] }
};
function bgSVG(mood) {
  const p = DESERT[mood] || DESERT.neutral, id = 'bg-' + mood;
  const heat = (mood === 'low' || mood === 'average') ? `<g fill="none" stroke="#fff" stroke-width="2" opacity=".16" stroke-linecap="round"><path d="M0 214q25-8 50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0"/><path d="M0 232q25 8 50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0"/></g>` : '';
  return `<svg viewBox="0 0 400 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset=".55" stop-color="${p.sky[1]}"/><stop offset="1" stop-color="${p.sky[2]}"/></linearGradient>
    <radialGradient id="${id}-sun"><stop offset="0" stop-color="${p.sun}" stop-opacity=".9"/><stop offset="1" stop-color="${p.sun}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="400" height="360" fill="url(#${id}-sky)"/>
  <circle cx="292" cy="150" r="92" fill="url(#${id}-sun)"/>
  <circle cx="292" cy="150" r="27" fill="${p.sun}"/>
  <g fill="#fff" opacity=".5"><path d="M30 92q6-20 28-15q12-15 32-6q20-3 22 15q-34 9-82 6z"/><path d="M230 56q5-14 20-10q9-10 22-4q14-2 15 10q-24 6-57 4z"/></g>
  <path d="M0 226Q80 186 170 222T400 206V360H0z" fill="${p.d[0]}"/>
  <path d="M0 256Q120 220 230 256T400 244V360H0z" fill="${p.d[1]}"/>
  <g fill="${p.d[2]}"><rect x="318" y="236" width="6" height="30" rx="3"/><rect x="309" y="246" width="5" height="14" rx="2.5"/><rect x="328" y="242" width="5" height="12" rx="2.5"/><rect x="40" y="250" width="4" height="26"/><rect x="62" y="248" width="4" height="26"/><path d="M36 256h34M36 266h34" stroke="${p.d[2]}" stroke-width="2.5"/></g>
  ${heat}
  <path d="M0 304Q100 272 210 304T400 292V360H0z" fill="${p.d[2]}"/>
</svg>`;
}
function bgArt(mood) {
  const m = DESERT[mood] ? mood : 'neutral';
  const src = ASSETS.backgrounds[m];
  return src ? `<img src="${src}" alt="" draggable="false">` : bgSVG(m);
}

/* ---------- Trophy & coin illustrations ---------- */
function trophyArt() {
  if (ASSETS.trophy) return `<img src="${ASSETS.trophy}" alt="" draggable="false">`;
  return `<svg viewBox="0 0 120 130" aria-hidden="true" focusable="false">
  <defs><linearGradient id="tr-body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d4ff72"/><stop offset=".5" stop-color="#9edc1c"/><stop offset="1" stop-color="#4f7d08"/></linearGradient></defs>
  <path d="M30 34H12c0 24 10 36 26 40" fill="none" stroke="#6ea50f" stroke-width="8" stroke-linecap="round"/>
  <path d="M90 34h18c0 24-10 36-26 40" fill="none" stroke="#6ea50f" stroke-width="8" stroke-linecap="round"/>
  <path d="M28 18h64v38c0 26-15 44-32 44S28 82 28 56z" fill="url(#tr-body)"/>
  <path d="M38 26v30c0 18 7 30 14 36" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="6" stroke-linecap="round"/>
  <path d="m60 38 5.5 11.5 12.5 1.7-9.2 8.7 2.4 12.4L60 66l-11.2 6.3 2.4-12.4-9.2-8.7 12.5-1.7z" fill="#17200a" opacity=".85"/>
  <rect x="52" y="98" width="16" height="14" fill="#5f9209"/>
  <rect x="34" y="110" width="52" height="14" rx="5" fill="#15190d"/><rect x="34" y="110" width="52" height="4" rx="2" fill="#B8F52A" opacity=".7"/>
</svg>`;
}
function coinArt() {
  return `<svg viewBox="0 0 200 160" aria-hidden="true" focusable="false">
  <defs><linearGradient id="coin-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2ff8a"/><stop offset=".6" stop-color="#a6e61f"/><stop offset="1" stop-color="#5d8f0a"/></linearGradient></defs>
  <circle cx="86" cy="82" r="66" fill="url(#coin-g)"/>
  <circle cx="86" cy="82" r="50" fill="none" stroke="#17200a" stroke-opacity=".35" stroke-width="6"/>
  <path d="M60 84l18 18 36-40" fill="none" stroke="#10160a" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M40 54a54 54 0 0 1 36-24" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="6" stroke-linecap="round"/>
  <circle cx="176" cy="44" r="19" fill="url(#coin-g)" opacity=".95"/><path d="M168 45l6 6 11-12" fill="none" stroke="#10160a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="170" cy="124" r="13" fill="url(#coin-g)" opacity=".8"/><path d="M164 125l4 4 8-9" fill="none" stroke="#10160a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

/* ---------- Segmented ring (4 arcs) ---------- */
function ringSVG(mood, size = 220) {
  const r = 92, C = 2 * Math.PI * r, gap = 16, seg = C / 4 - gap, n = MOOD_META[mood].seg;
  const arcs = [0, 1, 2, 3].map(i =>
    `<circle class="arc ${i < n ? 'on' : ''}" cx="100" cy="100" r="${r}" fill="none" stroke-width="11" stroke-linecap="round" stroke-dasharray="${seg} ${C - seg}" transform="rotate(${-90 + i * 90 + gap / 2 * 360 / C} 100 100)"/>`).join('');
  return `<svg viewBox="0 0 200 200" width="${size}" height="${size}" aria-hidden="true" focusable="false">${arcs}</svg>`;
}
