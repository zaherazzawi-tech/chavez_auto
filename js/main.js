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

/* ---------- Logo: use images/logo.png once it exists, otherwise keep the gauge + wordmark ---------- */
document.querySelectorAll('.logo-img').forEach(img => {
  const show = () => { img.hidden = false; img.closest('.logo').classList.add('has-logo'); };
  const keep = () => { img.hidden = true; img.closest('.logo').classList.remove('has-logo'); };
  if (img.complete && img.currentSrc) (img.naturalWidth ? show : keep)(); // settled before this script ran
  img.addEventListener('load', show);
  img.addEventListener('error', keep);
});

/* ---------- Our Work: grid + lightbox ---------- */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const workGrid = document.getElementById('workGrid');
const tiles = workGrid ? [...workGrid.querySelectorAll('.work-tile')] : [];
const VISIBLE = 9;

// More than 9 photos: show the first 9 and a "Show all photos" button for the rest
const moreBtn = document.getElementById('workMore');
if (moreBtn && tiles.length > VISIBLE){
  tiles.slice(VISIBLE).forEach(t => t.hidden = true);
  moreBtn.parentElement.hidden = false;
  moreBtn.addEventListener('click', () => {
    tiles.forEach(t => t.hidden = false);
    moreBtn.setAttribute('aria-expanded', 'true');
    moreBtn.parentElement.hidden = true;
    tiles[VISIBLE].focus({preventScroll: true}); // keep the page where it is, move keyboard focus to the first new photo
  });
}

const lb = document.getElementById('lightbox');
if (lb && tiles.length){
  const lbImg = lb.querySelector('.lb-img'), lbCount = lb.querySelector('.lb-count');
  const btnClose = lb.querySelector('.lb-close'), btnPrev = lb.querySelector('.lb-prev'), btnNext = lb.querySelector('.lb-next');
  let index = 0, opener = null;

  function show(i){
    index = (i + tiles.length) % tiles.length;
    const t = tiles[index];
    lbImg.classList.remove('ready');
    lbImg.onload = () => lbImg.classList.add('ready');
    lbImg.src = t.getAttribute('href');
    lbImg.alt = t.querySelector('img').alt;
    if (lbImg.complete) lbImg.classList.add('ready');
    lbCount.textContent = (index + 1) + ' / ' + tiles.length;
    // warm up the neighbours so prev/next feel instant
    [index - 1, index + 1].forEach(n => { new Image().src = tiles[(n + tiles.length) % tiles.length].getAttribute('href'); });
  }
  function open(i, from){
    opener = from;
    show(i);
    lb.hidden = false;
    document.documentElement.classList.add('lb-open'); // locks page scroll, hides the floating bar
    requestAnimationFrame(() => lb.classList.add('open'));
    btnClose.focus({preventScroll: true});
  }
  function close(){
    lb.classList.remove('open');
    document.documentElement.classList.remove('lb-open');
    const done = () => { lb.hidden = true; lbImg.removeAttribute('src'); };
    if (reduceMotion.matches) done(); else setTimeout(done, 200);
    if (opener) opener.focus({preventScroll: true});
  }

  tiles.forEach((t, i) => t.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let "open in new tab" work
    e.preventDefault();
    open(i, t);
  }));
  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => show(index - 1));
  btnNext.addEventListener('click', () => show(index + 1));
  lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-stage')) close(); }); // tap the dark area

  lb.addEventListener('keydown', e => {
    if (e.key === 'Escape'){ e.preventDefault(); close(); }
    else if (e.key === 'ArrowLeft'){ e.preventDefault(); show(index - 1); }
    else if (e.key === 'ArrowRight'){ e.preventDefault(); show(index + 1); }
    else if (e.key === 'Tab'){ // keep focus inside the dialog
      const f = [btnClose, btnPrev, btnNext], k = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(k + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
    }
  });

  // Swipe left / right on touch screens
  let sx = 0, sy = 0, tracking = false;
  lb.addEventListener('touchstart', e => { if (e.touches.length !== 1) return; tracking = true; sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, {passive: true});
  lb.addEventListener('touchend', e => {
    if (!tracking) return; tracking = false;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) show(index + (dx < 0 ? 1 : -1));
  }, {passive: true});
}

/* ---------- Story photos: show the built-in placeholder until a real photo exists ---------- */
// A missing file (404) hides its <img> so the CSS placeholder behind it shows.
// The photos live in images/story/ (made by scripts/optimize-images.js).
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
