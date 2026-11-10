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

/* ---------- Logo: images/logo.png in the header, menu sheet and footer ---------- */
// Each copy shows once it loads; the header copy also hides the gauge icon + wordmark.
// If the file is missing, the images stay hidden and the gauge + wordmark stay.
document.querySelectorAll('.logo-img').forEach(img => {
  const show = () => { img.hidden = false; img.closest('.logo')?.classList.add('has-logo'); };
  const keep = () => { img.hidden = true; img.closest('.logo')?.classList.remove('has-logo'); };
  if (img.complete && img.currentSrc) (img.naturalWidth ? show : keep)(); // settled before this script ran
  img.addEventListener('load', show);
  img.addEventListener('error', keep);
});

/* ---------- Our Work: film strip ---------- */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const film = document.getElementById('film');
const track = film && film.querySelector('.film-track');
const frames = track ? [...track.querySelectorAll('.film-frame')] : []; // the real set (no copies)
const SECONDS_PER_SET = 50; // how long one full set takes to pass by

// Why the strip is paused right now (hover, finger, drag, keyboard focus, lightbox, off screen).
// It slides only while this is empty.
const holds = new Set();
const hold = (why, on) => { on ? holds.add(why) : holds.delete(why); };

if (film && frames.length){
  let copies = [], x = 0, setW = 0, last = 0, raf = 0, running = false;

  const measure = () => { setW = frames[frames.length - 1].offsetLeft + frames[frames.length - 1].offsetWidth - frames[0].offsetLeft; };
  const wrapX = () => { if (setW){ x %= setW; if (x > 0) x -= setW; } }; // keep x in (-setW, 0]
  const paint = () => { track.style.transform = 'translate3d(' + x + 'px,0,0)'; };

  function tick(now){
    raf = requestAnimationFrame(tick);
    const dt = Math.min(now - (last || now), 64) / 1000; // cap long gaps (tab switch, jank)
    last = now;
    if (holds.size || !setW) return;
    x -= setW / SECONDS_PER_SET * dt;
    wrapX(); paint();
  }

  function start(){
    if (running) return;
    running = true;
    // the copy makes the loop seamless; it is invisible to screen readers and skipped by Tab
    copies = frames.map(f => {
      const c = f.cloneNode(true);
      c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1;
      c.querySelector('img').alt = ''; c.querySelector('img').loading = 'lazy';
      return c;
    });
    track.append(...copies);
    film.classList.add('is-running');
    film.scrollLeft = 0;
    measure(); x = 0; paint();
    last = 0; raf = requestAnimationFrame(tick);
  }
  function stop(){ // reduced motion: plain scrollable strip
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
    copies.forEach(c => c.remove()); copies = [];
    film.classList.remove('is-running', 'is-dragging');
    track.style.transform = '';
    holds.clear();
  }
  const setMode = () => reduceMotion.matches ? stop() : start();
  setMode();
  reduceMotion.addEventListener('change', setMode);
  addEventListener('resize', () => { if (running){ const f = setW ? x / setW : 0; measure(); x = f * setW; wrapX(); paint(); } });
  // frames are fixed-size boxes, but measure again once fonts/images settle, just in case
  addEventListener('load', () => { if (running) measure(); });

  // Pause while the mouse is over it
  film.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hold('hover', true); });
  film.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hold('hover', false); });

  // Drag / swipe to scrub. A finger resting on it pauses it; letting go resumes.
  let downX = 0, startX = 0, dragging = false, pid = null, suppressClick = false;
  film.addEventListener('pointerdown', e => {
    if (!running || (e.pointerType === 'mouse' && e.button !== 0)) return;
    pid = e.pointerId; downX = e.clientX; startX = x; dragging = false;
    hold('press', true);
  });
  film.addEventListener('pointermove', e => {
    if (e.pointerId !== pid) return;
    const dx = e.clientX - downX;
    if (!dragging && Math.abs(dx) > 6){
      dragging = true;
      film.classList.add('is-dragging');
      try { film.setPointerCapture(pid); } catch (err) {}
    }
    if (dragging){ x = startX + dx; wrapX(); paint(); }
  });
  const release = e => {
    if (e.pointerId !== pid) return;
    pid = null;
    if (dragging){ suppressClick = true; setTimeout(() => { suppressClick = false; }, 0); }
    dragging = false;
    film.classList.remove('is-dragging');
    hold('press', false);
  };
  film.addEventListener('pointerup', release);
  film.addEventListener('pointercancel', release); // e.g. the browser took over for a vertical page scroll
  film.addEventListener('click', e => { if (suppressClick){ e.preventDefault(); e.stopPropagation(); } }, true);
  film.addEventListener('dragstart', e => e.preventDefault());

  // Keyboard: Tab onto a frame pauses the strip and brings that frame into view
  film.addEventListener('focusin', e => {
    if (!running || !e.target.matches(':focus-visible')) return; // keyboard focus only, not a mouse click
    hold('focus', true);
    const f = e.target.closest('.film-frame');
    if (!f) return;
    film.scrollLeft = 0; // the browser may try to scroll the clipped strip; the transform does the moving
    const left = f.offsetLeft + x, right = left + f.offsetWidth;
    // centre the real frame (not its copy); x stays within (-setW, 0], so no wrap is needed
    if (left < 0 || right > film.clientWidth){ x = Math.min(0, -(f.offsetLeft - Math.max(0, (film.clientWidth - f.offsetWidth) / 2))); paint(); }
  });
  film.addEventListener('focusout', e => { if (!film.contains(e.relatedTarget)) hold('focus', false); });

  // Don't animate while it's off screen
  if ('IntersectionObserver' in window)
    new IntersectionObserver(([en]) => hold('offscreen', !en.isIntersecting)).observe(film);
}

/* ---------- Lightbox (Our Work) ---------- */
const lb = document.getElementById('lightbox');
if (lb && frames.length){
  const lbImg = lb.querySelector('.lb-img'), lbCount = lb.querySelector('.lb-count');
  const btnClose = lb.querySelector('.lb-close'), btnPrev = lb.querySelector('.lb-prev'), btnNext = lb.querySelector('.lb-next');
  let index = 0, opener = null;

  function show(i){
    index = (i + frames.length) % frames.length;
    const t = frames[index];
    lbImg.classList.remove('ready');
    lbImg.onload = () => lbImg.classList.add('ready');
    lbImg.src = t.getAttribute('href');
    lbImg.alt = t.querySelector('img').alt;
    if (lbImg.complete) lbImg.classList.add('ready');
    lbCount.textContent = (index + 1) + ' / ' + frames.length;
    // warm up the neighbours so prev/next feel instant
    [index - 1, index + 1].forEach(n => { new Image().src = frames[(n + frames.length) % frames.length].getAttribute('href'); });
  }
  function open(i, from){
    opener = from;
    hold('lightbox', true); // the film strip waits while the lightbox is open
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
    hold('lightbox', false);
  }

  // Clicks on a frame (or its seamless-loop copy) open the matching photo
  track.addEventListener('click', e => {
    const f = e.target.closest('.film-frame');
    if (!f || e.metaKey || e.ctrlKey || e.shiftKey) return; // let "open in new tab" work
    e.preventDefault();
    const i = [...track.children].indexOf(f) % frames.length;
    open(i, frames[i]); // focus returns to the real frame, never the hidden copy
  });
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

/* ---------- Reviews: "Read more" on long reviews ---------- */
// Long reviews are cut to about 6 lines. The button only shows when the text really is longer
// than that at the current width, and is re-checked when the window size changes.
const clampables = [...document.querySelectorAll('.rv-clamp')].map(text => ({ text, btn: document.querySelector('[aria-controls="' + text.id + '"]'), open: false }));
function checkClamps(){
  clampables.forEach(c => {
    if (c.open) return;
    c.text.classList.add('is-clamped');
    const longer = c.text.scrollHeight > c.text.clientHeight + 4;
    c.text.classList.toggle('is-clamped', longer);
    c.btn.hidden = !longer;
  });
}
clampables.forEach(c => c.btn.addEventListener('click', () => {
  c.open = !c.open;
  c.text.classList.toggle('is-clamped', !c.open);
  c.btn.setAttribute('aria-expanded', c.open);
  c.btn.textContent = c.open ? 'Show less' : 'Read more';
  if (!c.open) checkClamps();
}));
checkClamps();
let clampTimer = 0;
addEventListener('resize', () => { clearTimeout(clampTimer); clampTimer = setTimeout(checkClamps, 150); });
document.fonts && document.fonts.ready.then(checkClamps);

/* ---------- Story photos: show the built-in placeholder until a real photo exists ---------- */
// A missing file (404) hides its <img> so the CSS placeholder behind it shows.
// The photos live in images/story/ (made by scripts/optimize-images.js).
document.querySelectorAll('.story-photo img').forEach(img => {
  const fail = () => { img.hidden = true; };
  if (img.complete && !img.naturalWidth && img.currentSrc) fail(); // already failed before this script ran
  img.addEventListener('error', fail);
  img.addEventListener('load', () => { img.hidden = false; });
});

/* ---------- Mobile: dots under the swipe rows (service cards, reviews) ---------- */
function addDots(row){
  if (!row || row.children.length < 2) return;
  const items = [...row.children];
  const dots = document.createElement('div');
  dots.className = 'card-dots'; dots.setAttribute('aria-hidden', 'true');
  dots.innerHTML = items.map(() => '<span></span>').join('');
  row.after(dots);
  let frame = 0;
  function update(){
    frame = 0;
    const step = items[1].offsetLeft - items[0].offsetLeft || 1, max = row.scrollWidth - row.clientWidth;
    let i = Math.round(row.scrollLeft / step);
    if (max > 0 && row.scrollLeft >= max - 2) i = items.length - 1;
    [...dots.children].forEach((d, n) => d.classList.toggle('on', n === i));
  }
  row.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, {passive: true});
  update();
}
addDots(document.querySelector('.cards .grid'));
addDots(document.querySelector('.rv-grid'));

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
