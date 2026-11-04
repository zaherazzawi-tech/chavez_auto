/* Chavez Automotive Repair — interactions */
(function(){
"use strict";

/* ---------- Mobile menu ---------- */
const menuBtn = document.querySelector('.menu-btn'), nav = document.getElementById('mainnav');
function setMenu(open){
  nav.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.documentElement.classList.toggle('menu-open', open); // locks page scroll behind the sheet
}
menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')){ setMenu(false); menuBtn.focus(); }});
matchMedia('(min-width: 861px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
document.getElementById('yr').textContent = new Date().getFullYear();

/* ---------- Hours (Pacific time) ---------- */
// day index: 0 = Sunday. [openHour, closeHour] in 24h, or null when closed.
const HOURS = {0:null, 1:[7,17], 2:[7,17], 3:[7,17], 4:[7,17], 5:[7,17], 6:null};
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const fmtH = h => { const ap = h >= 12 ? 'PM' : 'AM'; const x = h % 12 || 12; return x + ' ' + ap; };

function pacificNow(){
  const parts = new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',weekday:'short',hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(get('weekday'));
  return {day, mins: (+get('hour')) * 60 + (+get('minute'))};
}
function shopStatus(){
  const {day, mins} = pacificNow();
  const h = HOURS[day];
  if (h && mins >= h[0]*60 && mins < h[1]*60) return {open:true, text:'Open now until ' + fmtH(h[1]), until: fmtH(h[1])};
  // find next opening
  for (let i = 0; i < 8; i++){
    const d = (day + i) % 7, hh = HOURS[d];
    if (!hh) continue;
    if (i === 0 && mins >= hh[0]*60) continue;
    const when = i === 0 ? 'today' : i === 1 ? 'tomorrow' : DAYS[d];
    return {open:false, text:'Closed now · opens ' + fmtH(hh[0]) + ' ' + when, when, at: fmtH(hh[0])};
  }
  return {open:false, text:'Closed now'};
}
function renderHours(){
  const s = shopStatus(), today = pacificNow().day;
  ['hero','panel'].forEach(k => {
    document.getElementById(k+'Dot').className = 'dot ' + (s.open ? 'open' : 'closed');
    document.getElementById(k+'Status').textContent = s.text;
  });
  const order = [1,2,3,4,5,6,0];
  document.getElementById('hoursTable').innerHTML = order.map(d => {
    const h = HOURS[d];
    return '<tr class="' + (d === today ? 'today' : '') + '"><td>' + DAYS[d] + '</td><td>' + (h ? fmtH(h[0]) + ' – ' + fmtH(h[1]) : 'Closed') + '</td></tr>';
  }).join('');
  document.getElementById('visitDot').className = 'dot ' + (s.open ? 'open' : 'closed');
  document.getElementById('visitStatus').textContent = s.open
    ? 'Open now until ' + s.until + '. Come on by.'
    : 'Closed right now.' + (s.at ? ' We open at ' + s.at + ' ' + s.when + '.' : '');
  return s;
}
renderHours();
setInterval(renderHours, 60000);

/* ---------- Before / after artwork ---------- */
function scene(inner, opts){
  opts = opts || {};
  const wall = opts.wall || '#b9c0c9', floor = opts.floor || '#6f747b', k = 's' + (uid++);
  return '<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">' +
    '<defs><linearGradient id="' + k + 'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + wall + '"/><stop offset="1" stop-color="#8f969f"/></linearGradient>' +
    '<linearGradient id="' + k + 'f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + floor + '"/><stop offset="1" stop-color="#4b4f55"/></linearGradient></defs>' +
    '<rect width="800" height="360" fill="url(#' + k + 'w)"/>' +
    '<g opacity=".35" fill="#fff"><rect x="40" y="40" width="200" height="120" rx="4"/><rect x="560" y="40" width="200" height="120" rx="4"/></g>' +
    '<rect x="0" y="352" width="800" height="12" fill="#2d6bbf" opacity=".55"/>' +
    '<rect y="360" width="800" height="140" fill="url(#' + k + 'f)"/>' + inner + '</svg>';
}
function shade(hex, amt){
  const n = parseInt(hex.slice(1),16);
  let r = (n>>16)+amt, g = ((n>>8)&255)+amt, b = (n&255)+amt;
  r=Math.max(0,Math.min(255,r)); g=Math.max(0,Math.min(255,g)); b=Math.max(0,Math.min(255,b));
  return '#' + ((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}
let uid = 0;
function car(o){
  const id = 'c' + (uid++), c = o.color, dk = shade(c,-45), lt = shade(c,40);
  let defs = '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + lt + '"/><stop offset=".45" stop-color="' + c + '"/><stop offset="1" stop-color="' + dk + '"/></linearGradient>';
  let fill = 'url(#' + id + 'g)', overlay = '';
  if (o.faded){
    defs += '<filter id="' + id + 'n"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.4 -.55"/><feComposite in2="SourceGraphic" operator="in"/></filter>';
  }
  const bodyPath = 'M70 372 L84 318 Q98 296 170 286 L262 214 Q286 196 330 194 L500 194 Q548 196 584 224 L640 280 Q716 290 738 312 L752 352 Q756 378 736 384 L92 384 Q66 382 70 372Z';
  let g = '<ellipse cx="410" cy="420" rx="360" ry="22" fill="#000" opacity=".35"/>';
  g += '<path d="' + bodyPath + '" fill="' + fill + '"/>';
  if (o.faded) g += '<path d="' + bodyPath + '" fill="#c9ccd1" opacity=".42"/><path d="' + bodyPath + '" fill="#fff" filter="url(#' + id + 'n)" opacity=".35"/>';
  // windows
  g += '<path d="M290 222 L332 206 L414 206 L414 280 L238 280Z" fill="#26313f"/><path d="M430 206 L498 206 Q534 210 560 236 L596 280 L430 280Z" fill="#26313f"/>';
  g += '<path d="M300 222 L330 212 L360 212 L310 270 L260 274Z" fill="#fff" opacity=".12"/>';
  // door lines, handles
  g += '<path d="M420 284 L420 378 M262 290 L262 378 M590 290 L600 378" stroke="' + dk + '" stroke-width="2.5" fill="none" opacity=".8"/>';
  g += '<rect x="300" y="304" width="34" height="7" rx="3" fill="' + dk + '"/><rect x="458" y="304" width="34" height="7" rx="3" fill="' + dk + '"/>';
  g += '<path d="M90 330 L740 326" stroke="#fff" stroke-width="2" opacity=".35"/>';
  // lights
  g += o.brokenLight ? '<path d="M712 300 L748 312 L746 330 L716 322Z" fill="#5a5f66"/><path d="M718 304 L730 318 L740 309 M726 322 L736 314" stroke="#222" stroke-width="2"/>' : '<path d="M712 300 L748 312 L746 330 L716 322Z" fill="#f4f1d8"/><path d="M718 304 L744 313" stroke="#fff" stroke-width="3"/>';
  g += '<path d="M76 330 L96 322 L98 344 L74 348Z" fill="#c4161c"/>';
  // bumpers
  g += o.front ? '<path d="M690 350 L745 344 L758 372 L730 392 L700 386 L712 370Z" fill="#2c2f34"/>' : '<path d="M700 356 L752 352 L756 378 L700 384Z" fill="#2c2f34"/>';
  g += '<path d="M70 356 L110 356 L110 384 L72 382Z" fill="#2c2f34"/>';
  // wheels
  [190,620].forEach(x => {
    g += '<circle cx="' + x + '" cy="384" r="54" fill="#1b1d20"/><circle cx="' + x + '" cy="384" r="34" fill="#a9b0b8"/><circle cx="' + x + '" cy="384" r="10" fill="#555"/>';
    for (let a = 0; a < 5; a++){ const r = a*72*Math.PI/180; g += '<line x1="' + x + '" y1="384" x2="' + (x+30*Math.cos(r)).toFixed(1) + '" y2="' + (384+30*Math.sin(r)).toFixed(1) + '" stroke="#7d848c" stroke-width="7"/>'; }
  });
  // damage overlays
  if (o.front){
    overlay += '<path d="M600 250 L650 282 L716 292 L700 316 L742 340 L700 352 L676 334 L654 360 L620 330 L600 344 Z" fill="' + dk + '"/>';
    overlay += '<path d="M610 262 L636 300 L626 322 M650 292 L668 318 L690 304 M640 330 L662 342" stroke="#111" stroke-width="3" fill="none" opacity=".6"/>';
    overlay += '<path d="M612 272 L640 288 L700 296" stroke="#fff" stroke-width="2" opacity=".5" fill="none"/>';
    overlay += '<path d="M560 236 L600 280 L590 284" stroke="#e8eef5" stroke-width="3" fill="none"/><path d="M568 244 L584 270 M576 240 L590 262" stroke="#e8eef5" stroke-width="1.5" opacity=".8"/>';
  }
  if (o.dent){
    defs += '<radialGradient id="' + id + 'd" cx=".45" cy=".45" r=".6"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".65" stop-color="#000" stop-opacity=".2"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>';
    overlay += '<ellipse cx="510" cy="336" rx="70" ry="38" fill="url(#' + id + 'd)"/>';
    overlay += '<path d="M455 318 Q505 302 567 326" stroke="#fff" stroke-width="3" opacity=".55" fill="none"/><path d="M463 352 Q511 366 559 350" stroke="#fff" stroke-width="2" opacity=".35" fill="none"/>';
    overlay += '<path d="M500 330 L570 340 M512 344 L582 352 M520 338 L568 350" stroke="#f2f2f2" stroke-width="1.8" opacity=".9"/>';
  }
  if (o.scratch){
    overlay += '<path d="M180 318 C260 326 330 312 420 330 S560 316 640 334" stroke="#f5f5f5" stroke-width="2.4" fill="none" opacity=".95"/>';
    overlay += '<path d="M200 340 C280 346 350 334 450 350" stroke="#f5f5f5" stroke-width="1.6" fill="none" opacity=".8"/>';
    [[120,300,12],[612,300,13],[640,320,9],[668,342,7],[700,334,10],[560,350,6]].forEach(r => {
      overlay += '<circle cx="' + r[0] + '" cy="' + r[1] + '" r="' + r[2] + '" fill="#8a4b1c" opacity=".9"/><circle cx="' + (r[0]+2) + '" cy="' + (r[1]-1) + '" r="' + (r[2]*.55) + '" fill="#b5652a"/>';
    });
  }
  return scene('<defs>' + defs + '</defs><g transform="translate(820,0) scale(-1,1)">' + g + overlay + '</g>', o.scene);
}
function headlight(foggy){
  const id = 'h' + (uid++);
  let s = '<defs><linearGradient id="' + id + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9edf2"/><stop offset="1" stop-color="#9aa3ae"/></linearGradient>' +
    '<radialGradient id="' + id + 'r" cx=".4" cy=".45" r=".6"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#cfd6de"/><stop offset="1" stop-color="#6f7884"/></radialGradient>' +
    '<filter id="' + id + 'f"><feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="3" seed="9"/><feColorMatrix values="0 0 0 0 .86  0 0 0 0 .74  0 0 0 0 .38  0 0 0 .9 0"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>';
  s += '<rect width="800" height="500" fill="url(#' + id + 'b)"/>';
  s += '<path d="M0 360 Q300 330 800 380 L800 500 L0 500Z" fill="#2a2d33"/>';
  s += '<path d="M60 120 Q340 60 720 150 Q760 200 700 300 Q420 350 120 320 Q40 300 40 220Z" fill="#1d2025"/>';
  s += '<path d="M80 136 Q340 82 700 162 Q736 204 684 286 Q420 330 132 304 Q64 288 62 222Z" fill="#3a3f47"/>';
  s += '<circle cx="250" cy="212" r="78" fill="url(#' + id + 'r)"/><circle cx="250" cy="212" r="30" fill="#eef2f6"/><circle cx="250" cy="212" r="12" fill="#c7a640"/>';
  s += '<circle cx="470" cy="214" r="60" fill="url(#' + id + 'r)"/><circle cx="470" cy="214" r="20" fill="#eef2f6"/>';
  s += '<path d="M570 190 L670 196 L650 260 L566 250Z" fill="#e48a1e"/>';
  s += '<path d="M110 170 Q300 120 600 168" stroke="#fff" stroke-width="10" opacity=".6" fill="none" stroke-linecap="round"/>';
  if (foggy){
    s += '<path d="M80 136 Q340 82 700 162 Q736 204 684 286 Q420 330 132 304 Q64 288 62 222Z" fill="#d9b85a" opacity=".45"/>';
    s += '<path d="M80 136 Q340 82 700 162 Q736 204 684 286 Q420 330 132 304 Q64 288 62 222Z" fill="#fff" filter="url(#' + id + 'f)" opacity=".9"/>';
    s += '<path d="M150 150 L220 300 M380 110 L330 312 M520 140 L600 290" stroke="#fff" stroke-width="1.5" opacity=".5"/>';
  }
  return '<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">' + s + '</svg>';
}
function rotor(rusty){
  const id = 'r' + (uid++);
  let s = '<defs><radialGradient id="' + id + 'd" cx=".45" cy=".4" r=".7">' +
    (rusty ? '<stop offset="0" stop-color="#9a5a2a"/><stop offset=".6" stop-color="#7a3f1b"/><stop offset="1" stop-color="#4d2610"/>' : '<stop offset="0" stop-color="#eef1f4"/><stop offset=".6" stop-color="#b6bdc5"/><stop offset="1" stop-color="#7f8892"/>') +
    '</radialGradient>' +
    '<filter id="' + id + 'n"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .16  0 0 0 0 .05  0 0 0 1.6 -.5"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>';
  s += '<rect width="800" height="500" fill="#3b4048"/><rect width="800" height="500" fill="#000" opacity=".2"/>';
  s += '<circle cx="400" cy="250" r="225" fill="#222"/>';
  s += '<circle cx="400" cy="250" r="210" fill="url(#' + id + 'd)"/>';
  if (rusty) s += '<circle cx="400" cy="250" r="210" fill="#fff" filter="url(#' + id + 'n)"/>';
  for (let r = 120; r < 205; r += 9) s += '<circle cx="400" cy="250" r="' + r + '" fill="none" stroke="' + (rusty ? '#3a1d0c' : '#ffffff') + '" stroke-width="' + (rusty ? 2.5 : 1) + '" opacity="' + (rusty ? .5 : .35) + '"/>';
  s += '<circle cx="400" cy="250" r="100" fill="' + (rusty ? '#3b2a20' : '#5a6068') + '"/><circle cx="400" cy="250" r="42" fill="#15171a"/>';
  for (let a = 0; a < 5; a++){ const t = a*72*Math.PI/180; s += '<circle cx="' + (400+68*Math.cos(t)).toFixed(1) + '" cy="' + (250+68*Math.sin(t)).toFixed(1) + '" r="11" fill="' + (rusty ? '#6d5a48' : '#d8dde2') + '"/>'; }
  s += '<path d="M545 70 Q680 120 700 250 Q690 330 640 380 L590 340 Q620 300 620 250 Q610 160 520 120Z" fill="' + (rusty ? '#3e3e3e' : '#c8102e') + '"/>';
  s += '<path d="M560 110 Q640 150 650 250" stroke="#fff" stroke-width="6" opacity="' + (rusty ? .1 : .35) + '" fill="none" stroke-linecap="round"/>';
  return '<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">' + s + '</svg>';
}

const GALLERY = {
  body: [
    {title:'Front-end collision', text:'Crushed fender, bumper and headlight replaced, hood line and panel gaps realigned.', b:() => car({color:'#b3262c', front:true, brokenLight:true}), a:() => car({color:'#b3262c'})},
    {title:'Door dent and crease', text:'Parking-lot dent pulled and the door refinished without replacing the panel.', b:() => car({color:'#6f8fae', dent:true, scene:{wall:'#c3c8cf'}}), a:() => car({color:'#6f8fae', scene:{wall:'#c3c8cf'}})}
  ],
  paint: [
    {title:'Faded, oxidized paint', text:'Sun-damaged clear coat sanded, re-sprayed and polished back to a deep gloss.', b:() => car({color:'#1f3f7a', faded:true}), a:() => car({color:'#1f3f7a'})},
    {title:'Key scratches and rust spots', text:'Rust treated at the source, then the side panels color-matched and blended.', b:() => car({color:'#e9e7e2', scratch:true, scene:{wall:'#aab2bc'}}), a:() => car({color:'#e9e7e2', scene:{wall:'#aab2bc'}})}
  ],
  repair: [
    {title:'Headlight restoration', text:'Yellowed, hazy lenses restored and sealed so night driving is bright and safe again.', b:() => headlight(true), a:() => headlight(false)},
    {title:'Brake rotors and calipers', text:'Worn, rusted rotors replaced with new rotors, pads and refreshed calipers.', b:() => rotor(true), a:() => rotor(false)}
  ]
};

const pairsEl = document.getElementById('pairs');
const knobSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6"/></svg>';
function renderGallery(cat){
  pairsEl.innerHTML = GALLERY[cat].map((p, i) =>
    '<figure class="pair" style="margin:0">' +
      '<div class="ba">' +
        '<div class="layer after">' + p.a() + '</div>' +
        '<div class="layer before">' + p.b() + '</div>' +
        '<span class="tag b">BEFORE</span><span class="tag a">AFTER</span>' +
        '<span class="bar"></span>' +
        '<input type="range" min="0" max="100" value="50" aria-label="Compare before and after: ' + p.title + '">' +
        '<span class="knob">' + knobSVG + '</span>' +
      '</div>' +
      '<figcaption><h3>' + p.title + '</h3><p>' + p.text + '</p></figcaption>' +
    '</figure>').join('');
  pairsEl.querySelectorAll('.ba').forEach(ba => {
    const input = ba.querySelector('input');
    const set = v => ba.style.setProperty('--pos', v + '%');
    input.addEventListener('input', () => set(input.value));
    // Pointer drag anywhere on the image (works with touch too)
    let dragging = false;
    const fromEvent = e => { const r = ba.getBoundingClientRect(); const v = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)); input.value = v; set(v); };
    ba.addEventListener('pointerdown', e => { dragging = true; ba.setPointerCapture(e.pointerId); fromEvent(e); });
    ba.addEventListener('pointermove', e => { if (dragging) fromEvent(e); });
    ['pointerup','pointercancel'].forEach(t => ba.addEventListener(t, () => dragging = false));
  });
}
const tabs = [...document.querySelectorAll('.tab')];
function selectCat(cat, focus){
  tabs.forEach(t => {
    const on = t.dataset.cat === cat;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    if (on){
      pairsEl.setAttribute('aria-labelledby', t.id);
      if (focus) t.focus({preventScroll: true});
      // on mobile the tabs scroll sideways: bring the active one into view without moving the page
      const row = t.parentElement;
      if (row.scrollWidth > row.clientWidth) row.scrollTo({left: t.offsetLeft - (row.clientWidth - t.offsetWidth) / 2, behavior: 'smooth'});
    }
  });
  renderGallery(cat);
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectCat(t.dataset.cat));
  t.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    selectCat(n.dataset.cat, true);
  });
});
document.querySelectorAll('.card[data-go]').forEach(c => c.addEventListener('click', () => {
  selectCat(c.dataset.go);
  document.getElementById('gallery').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
}));
selectCat('body');

/* ---------- Mobile: service card dots ---------- */
const cardRow = document.querySelector('.cards .grid'), cardEls = [...cardRow.children];
const dots = document.createElement('div');
dots.className = 'card-dots'; dots.setAttribute('aria-hidden', 'true');
dots.innerHTML = cardEls.map(() => '<span></span>').join('');
cardRow.after(dots);
let dotFrame = 0;
function updateDots(){
  dotFrame = 0;
  const step = cardEls[1].offsetLeft - cardEls[0].offsetLeft || 1, max = cardRow.scrollWidth - cardRow.clientWidth;
  let i = Math.round(cardRow.scrollLeft / step);
  if (max > 0 && cardRow.scrollLeft >= max - 2) i = cardEls.length - 1;
  [...dots.children].forEach((d, n) => d.classList.toggle('on', n === i));
}
cardRow.addEventListener('scroll', () => { if (!dotFrame) dotFrame = requestAnimationFrame(updateDots); }, {passive: true});
updateDots();

/* ---------- Mobile: hide the floating action bar where the same buttons already show ---------- */
const bar = document.querySelector('.mobile-bar');
if (bar && 'IntersectionObserver' in window){
  const inView = new Set();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? inView.add(e.target) : inView.delete(e.target));
    bar.classList.toggle('hide', inView.size > 0);
  });
  [document.querySelector('.map-card'), document.querySelector('footer')].forEach(el => el && io.observe(el));
}
})();
