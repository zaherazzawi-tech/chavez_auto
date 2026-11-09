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
// day index: 0 = Sunday. [open, close] in minutes after midnight, or null when closed.
// 420 = 7:00 AM, 840 = 2:00 PM, 990 = 4:30 PM
const HOURS = {0:null, 1:[420,990], 2:[420,990], 3:[420,990], 4:[420,990], 5:[420,990], 6:[420,840]};
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
// 420 -> "7 AM", 990 -> "4:30 PM" (minutes shown only when non-zero)
const fmtH = m => {
  const h = Math.floor(m / 60), min = m % 60, ap = h >= 12 && h < 24 ? 'PM' : 'AM';
  return (h % 12 || 12) + (min ? ':' + String(min).padStart(2, '0') : '') + ' ' + ap;
};

function pacificNow(){
  const parts = new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',weekday:'short',hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(get('weekday'));
  return {day, mins: (+get('hour')) * 60 + (+get('minute'))};
}
function shopStatus(){
  const {day, mins} = pacificNow();
  const h = HOURS[day];
  if (h && mins >= h[0] && mins < h[1]) return {open:true, text:'Open now until ' + fmtH(h[1]), until: fmtH(h[1])};
  // find next opening
  for (let i = 0; i < 8; i++){
    const d = (day + i) % 7, hh = HOURS[d];
    if (!hh) continue;
    if (i === 0 && mins >= hh[0]) continue;
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

/* ---------- Before / after artwork (drawn placeholder of the red car) ---------- */
let uid = 0;
function scene(inner){
  const k = 's' + (uid++);
  return '<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">' +
    '<defs><linearGradient id="' + k + 'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9c0c9"/><stop offset="1" stop-color="#8f969f"/></linearGradient>' +
    '<linearGradient id="' + k + 'f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f747b"/><stop offset="1" stop-color="#4b4f55"/></linearGradient></defs>' +
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
// o.damaged = true draws the crushed front end and broken headlight
function car(o){
  const id = 'c' + (uid++), c = o.color, dk = shade(c,-45), lt = shade(c,40);
  const defs = '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + lt + '"/><stop offset=".45" stop-color="' + c + '"/><stop offset="1" stop-color="' + dk + '"/></linearGradient>';
  const bodyPath = 'M70 372 L84 318 Q98 296 170 286 L262 214 Q286 196 330 194 L500 194 Q548 196 584 224 L640 280 Q716 290 738 312 L752 352 Q756 378 736 384 L92 384 Q66 382 70 372Z';
  let g = '<ellipse cx="410" cy="420" rx="360" ry="22" fill="#000" opacity=".35"/>';
  g += '<path d="' + bodyPath + '" fill="url(#' + id + 'g)"/>';
  // windows
  g += '<path d="M290 222 L332 206 L414 206 L414 280 L238 280Z" fill="#26313f"/><path d="M430 206 L498 206 Q534 210 560 236 L596 280 L430 280Z" fill="#26313f"/>';
  g += '<path d="M300 222 L330 212 L360 212 L310 270 L260 274Z" fill="#fff" opacity=".12"/>';
  // door lines, handles
  g += '<path d="M420 284 L420 378 M262 290 L262 378 M590 290 L600 378" stroke="' + dk + '" stroke-width="2.5" fill="none" opacity=".8"/>';
  g += '<rect x="300" y="304" width="34" height="7" rx="3" fill="' + dk + '"/><rect x="458" y="304" width="34" height="7" rx="3" fill="' + dk + '"/>';
  g += '<path d="M90 330 L740 326" stroke="#fff" stroke-width="2" opacity=".35"/>';
  // lights
  g += o.damaged ? '<path d="M712 300 L748 312 L746 330 L716 322Z" fill="#5a5f66"/><path d="M718 304 L730 318 L740 309 M726 322 L736 314" stroke="#222" stroke-width="2"/>' : '<path d="M712 300 L748 312 L746 330 L716 322Z" fill="#f4f1d8"/><path d="M718 304 L744 313" stroke="#fff" stroke-width="3"/>';
  g += '<path d="M76 330 L96 322 L98 344 L74 348Z" fill="#c4161c"/>';
  // bumpers
  g += o.damaged ? '<path d="M690 350 L745 344 L758 372 L730 392 L700 386 L712 370Z" fill="#2c2f34"/>' : '<path d="M700 356 L752 352 L756 378 L700 384Z" fill="#2c2f34"/>';
  g += '<path d="M70 356 L110 356 L110 384 L72 382Z" fill="#2c2f34"/>';
  // wheels
  [190,620].forEach(x => {
    g += '<circle cx="' + x + '" cy="384" r="54" fill="#1b1d20"/><circle cx="' + x + '" cy="384" r="34" fill="#a9b0b8"/><circle cx="' + x + '" cy="384" r="10" fill="#555"/>';
    for (let a = 0; a < 5; a++){ const r = a*72*Math.PI/180; g += '<line x1="' + x + '" y1="384" x2="' + (x+30*Math.cos(r)).toFixed(1) + '" y2="' + (384+30*Math.sin(r)).toFixed(1) + '" stroke="#7d848c" stroke-width="7"/>'; }
  });
  // front-end damage
  if (o.damaged){
    g += '<path d="M600 250 L650 282 L716 292 L700 316 L742 340 L700 352 L676 334 L654 360 L620 330 L600 344 Z" fill="' + dk + '"/>';
    g += '<path d="M610 262 L636 300 L626 322 M650 292 L668 318 L690 304 M640 330 L662 342" stroke="#111" stroke-width="3" fill="none" opacity=".6"/>';
    g += '<path d="M612 272 L640 288 L700 296" stroke="#fff" stroke-width="2" opacity=".5" fill="none"/>';
    g += '<path d="M560 236 L600 280 L590 284" stroke="#e8eef5" stroke-width="3" fill="none"/><path d="M568 244 L584 270 M576 240 L590 262" stroke="#e8eef5" stroke-width="1.5" opacity=".8"/>';
  }
  return scene('<defs>' + defs + '</defs><g transform="translate(820,0) scale(-1,1)">' + g + '</g>');
}

/* ---------- Before / after slider ----------
   One auto body pair. To use real photos, return <img> tags from b and a (see README). */
const GALLERY_PAIR = {
  title: 'Front-end collision',
  text: 'Crushed fender, bumper and headlight replaced, hood line and panel gaps realigned.',
  b: () => car({color:'#b3262c', damaged:true}),
  a: () => car({color:'#b3262c'})
};
const knobSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6"/></svg>';
function renderSlider(el, p){
  el.innerHTML =
    '<figure class="pair">' +
      '<div class="ba">' +
        '<div class="layer after">' + p.a() + '</div>' +
        '<div class="layer before">' + p.b() + '</div>' +
        '<span class="tag b">BEFORE</span><span class="tag a">AFTER</span>' +
        '<span class="bar"></span>' +
        '<input type="range" min="0" max="100" value="50" aria-label="Compare before and after: ' + p.title + '">' +
        '<span class="knob">' + knobSVG + '</span>' +
      '</div>' +
      '<figcaption><h3>' + p.title + '</h3><p>' + p.text + '</p></figcaption>' +
    '</figure>';
  const ba = el.querySelector('.ba'), input = ba.querySelector('input');
  const set = v => ba.style.setProperty('--pos', v + '%');
  input.addEventListener('input', () => set(input.value)); // keyboard (arrow keys) via the range input
  // Pointer drag anywhere on the image (works with touch too)
  let dragging = false;
  const fromEvent = e => { const r = ba.getBoundingClientRect(); const v = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)); input.value = v; set(v); };
  ba.addEventListener('pointerdown', e => { dragging = true; ba.setPointerCapture(e.pointerId); fromEvent(e); });
  ba.addEventListener('pointermove', e => { if (dragging) fromEvent(e); });
  ['pointerup','pointercancel'].forEach(t => ba.addEventListener(t, () => dragging = false));
}
renderSlider(document.getElementById('baSlider'), GALLERY_PAIR);

/* ---------- Story photos: show the built-in placeholder until a real photo exists ---------- */
// A missing file (404) hides its <img> so the CSS placeholder behind it shows.
// Dropping images/story-1.jpg, story-2.jpg or story-3.jpg in place makes them appear.
document.querySelectorAll('.story-photo img').forEach(img => {
  const fail = () => { img.hidden = true; };
  if (img.complete && !img.naturalWidth && img.currentSrc) fail(); // already failed before this script ran
  img.addEventListener('error', fail);
  img.addEventListener('load', () => { img.hidden = false; });
});

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
// (the hero call button, the map card and the footer). Starts hidden in the HTML so it never flashes on load.
const bar = document.querySelector('.mobile-bar');
if (bar && 'IntersectionObserver' in window){
  const inView = new Set();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? inView.add(e.target) : inView.delete(e.target));
    bar.classList.toggle('hide', inView.size > 0);
  });
  [document.querySelector('.hero-actions .btn-red'), document.querySelector('.map-card'), document.querySelector('footer')].forEach(el => el && io.observe(el));
} else if (bar) bar.classList.remove('hide');
})();
