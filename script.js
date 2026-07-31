const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// in-page nav links: native anchor scrolling breaks once a target section is a
// permanently-stuck `.cover-panel` (its rect.top/offsetTop track the current
// scroll position, not its true document offset), so compute the real offset
// by summing preceding top-level sections instead.
const topSections = Array.from(document.querySelectorAll('body > header, body > section, body > footer'));
function scrollToSection(target){
  let top = 0;
  for (const el of topSections) {
    if (el === target) break;
    top += el.offsetHeight;
  }
  window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
}
document.querySelectorAll('a[href^="#"]').forEach(a => {
  const target = document.getElementById(a.getAttribute('href').slice(1));
  if (!target) return;
  a.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToSection(target);
  });
});

// nav: highlight the section currently at the top. Offsets are cached for the
// same reason scrollable is below — reading offsetHeight every scroll event
// forces a layout.
const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
let sectionTops = [];
function measureSections(){
  let t = 0;
  sectionTops = topSections.map((el) => { const top = t; t += el.offsetHeight; return top; });
  activeLink = null; // link widths move with the layout, so re-place the pill
}
const navIndicator = document.querySelector('.nav-indicator');
let activeLink = null;
function updateActiveLink(){
  const y = window.scrollY + 120;
  let i = 0;
  while (i + 1 < sectionTops.length && sectionTops[i + 1] <= y) i++;
  const link = navLinks.find((a) => a.getAttribute('href') === '#' + topSections[i].id);
  if (!link || link === activeLink) return;
  navLinks.forEach((a) => a.classList.toggle('active', a === link));
  navIndicator.style.width = link.offsetWidth + 'px';
  navIndicator.style.transform = 'translateX(' + link.offsetLeft + 'px)';
  activeLink = link;
}
measureSections();
updateActiveLink();
window.addEventListener('resize', () => { measureSections(); updateActiveLink(); }, { passive: true });
window.addEventListener('load', () => { measureSections(); updateActiveLink(); });
window.addEventListener('scroll', updateActiveLink, { passive: true });

// scroll progress bar
const progress = document.getElementById('scroll-progress');
// scrollHeight/clientHeight are cached: reading them forces a synchronous layout,
// and doing that on every scroll event (i.e. every frame) is what makes scrolling
// feel heavy. They only change on resize/load, so measure there instead.
let scrollable = 0;
function measureScrollable(){
  const h = document.documentElement;
  scrollable = h.scrollHeight - h.clientHeight;
}
function updateProgress(){
  const pct = scrollable > 0 ? document.documentElement.scrollTop / scrollable : 0;
  progress.style.transform = 'scaleX(' + pct + ')';
}
measureScrollable();
window.addEventListener('resize', measureScrollable, { passive: true });
window.addEventListener('load', measureScrollable);
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// scroll velocity, published as --vel (px/frame, smoothed) for the atmosphere
// layers in styles.css to react to. The loop only runs while the page is
// actually moving and shuts itself off once the value has decayed to nothing,
// so an idle page costs zero frames.
if (!reduceMotion) {
  // written per element rather than on :root — --vel is registered with
  // inherits:false so this only invalidates style for these three, instead of
  // for every node in the document once a frame
  const readers = ['.noise-overlay', '.aurora-field']
    .map(s => document.querySelector(s))
    .filter(Boolean);
  let last = window.scrollY;
  let vel = 0;
  let running = false;
  let published = null;

  // Quantised, and skipped when unchanged. Both readers are expensive to
  // invalidate — one is a full-screen mix-blend-mode layer, the other contains a
  // blur(90px) — and a fresh value every frame dirties them every frame. The
  // consumers clamp --vel into narrow ranges (grain .035-.085, glow scaleY
  // 1-1.22), so a step of 3 moves grain by .0027 and scale by .0096: below the
  // perceptual floor, but it collapses ~60 writes/sec into ~20 distinct values.
  const STEP = 3;

  function publish(v) {
    if (v === published) return;
    published = v;
    for (const el of readers) el.style.setProperty('--vel', v);
  }

  function frame() {
    const y = window.scrollY;
    // exponential smoothing, so a single jumpy wheel tick doesn't spike the grain
    vel += (Math.abs(y - last) - vel) * 0.22;
    last = y;
    if (vel < 0.05) {
      vel = 0;
      running = false;
      publish('0');
      return;
    }
    publish(String(Math.round(vel / STEP) * STEP));
    requestAnimationFrame(frame);
  }

  window.addEventListener('scroll', () => {
    if (!running) { running = true; requestAnimationFrame(frame); }
  }, { passive: true });
}

// typewriter role rotator
const roles = ['Backend Systems', 'Concurrency & Correctness', 'IoT Pipelines', 'Applied ML'];
const roleEl = document.getElementById('role-text');

if (reduceMotion) {
  roleEl.textContent = roles[0];
} else {
  let roleIndex = 0, charIndex = 0, deleting = false;
  const typeSpeed = 55, deleteSpeed = 30, holdTime = 1400;

  function tick() {
    const current = roles[roleIndex];
    if (!deleting) {
      charIndex++;
      roleEl.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, holdTime);
        return;
      }
      setTimeout(tick, typeSpeed);
    } else {
      charIndex--;
      roleEl.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
      setTimeout(tick, deleteSpeed);
    }
  }
  tick();
}

// ascii-art "video": braille-art portrait rendered as animated ASCII (decorative, home hero)
(function () {
  const el = document.getElementById('asciiArt');
  if (!el) return;

  const asciiGrid = [
    "⣇⣿⠘⣿⣿⣿⡿⡿⣟⣟⢟⢟⢝⠵⡝⣿⡿⢂⣼⣿⣷⣌⠩⡫⡻⣝⠹⢿⣿⣷",
    "⡆⣿⣆⠱⣝⡵⣝⢅⠙⣿⢕⢕⢕⢕⢝⣥⢒⠅⣿⣿⣿⡿⣳⣌⠪⡪⣡⢑⢝⣇",
    "⡆⣿⣿⣦⠹⣳⣳⣕⢅⠈⢗⢕⢕⢕⢕⢕⢈⢆⠟⠋⠉⠁⠉⠉⠁⠈⠼⢐⢕⢽",
    "⡗⢰⣶⣶⣦⣝⢝⢕⢕⠅⡆⢕⢕⢕⢕⢕⣴⠏⣠⡶⠛⡉⡉⡛⢶⣦⡀⠐⣕⢕",
    "⡝⡄⢻⢟⣿⣿⣷⣕⣕⣅⣿⣔⣕⣵⣵⣿⣿⢠⣿⢠⣮⡈⣌⠨⠅⠹⣷⡀⢱⢕",
    "⡝⡵⠟⠈⢀⣀⣀⡀⠉⢿⣿⣿⣿⣿⣿⣿⣿⣼⣿⢈⡋⠴⢿⡟⣡⡇⣿⡇⡀⢕",
    "⡝⠁⣠⣾⠟⡉⡉⡉⠻⣦⣻⣿⣿⣿⣿⣿⣿⣿⣿⣧⠸⣿⣦⣥⣿⡇⡿⣰⢗⢄",
    "⠁⢰⣿⡏⣴⣌⠈⣌⠡⠈⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣬⣉⣉⣁⣄⢖⢕⢕⢕",
    "⡀⢻⣿⡇⢙⠁⠴⢿⡟⣡⡆⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣵⣵⣿",
    "⡻⣄⣻⣿⣌⠘⢿⣷⣥⣿⠇⣿⣿⣿⣿⣿⣿⠛⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿",
    "⣷⢄⠻⣿⣟⠿⠦⠍⠉⣡⣾⣿⣿⣿⣿⣿⣿⢸⣿⣦⠙⣿⣿⣿⣿⣿⣿⣿⣿⠟",
    "⡕⡑⣑⣈⣻⢗⢟⢞⢝⣻⣿⣿⣿⣿⣿⣿⣿⠸⣿⠿⠃⣿⣿⣿⣿⣿⣿⡿⠁⣠",
    "⡝⡵⡈⢟⢕⢕⢕⢕⣵⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣶⣿⣿⣿⣿⣿⠿⠋⣀⣈⠙",
    "⡝⡵⡕⡀⠑⠳⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠛⢉⡠⡲⡫⡪⡪⡣",
  ];
  const whale = [
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⠓⠶⣤⠀⠀⠀⠀⣠⠶⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠇⠀⢠⡏⠀⠀⢀⡔⠉⠀⢈⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠩⠤⣄⣼⠁⠀⣠⠟⠀⠀⣠⠏⠀⠀⢀⣀⠀⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⢀⣀⣀⣀⣀⣀⣀⣀⠀⠀⠀⠁⠀⠀⠣⣤⣀⡼⠃⠀⢀⡴⠋⠈⠳⡄⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣴⣶⣿⡿⠿⠿⠟⠛⠛⠛⠛⠿⠿⣿⣿⣶⣤⣄⠀⠀⠀⠉⠀⢀⡴⠋⠀⠀⣠⠞⠁⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣾⣿⠿⠋⠉⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠻⢿⣿⣶⣄⠀⠀⠳⣄⠀⣠⠞⢁⡠⢶⡄⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿⠿⠋⠀⠀⢀⣴⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⢤⡈⠛⢿⣿⣦⡀⠈⠛⢡⠚⠃⠀⠀⢹⡆⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⣿⠟⠁⠀⠀⠀⢀⣾⠃⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡆⠀⠀⢻⣦⠀⠙⢿⣿⣦⡀⠈⢶⣀⡴⠞⠋⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⣠⣿⡿⠃⠀⠀⠀⠀⢀⣾⡇⢀⡄⠀⢸⡇⠀⠀⠀⠀⠀⠀⣀⠀⢸⣷⡀⠀⠀⠹⣷⡀⠀⠙⢿⣷⡀⠀⠉⠀⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⣰⣿⡟⠀⠀⠀⠀⠀⠀⣾⣿⠃⣼⡇⠀⢸⡇⠀⠀⠀⠀⠀⠀⣿⠀⢸⣿⣷⡀⠀⢀⣾⣿⡤⠐⠊⢻⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⢠⣿⣿⣼⡇⠀⠀⠀⠀⢠⣿⠉⢠⣿⠧⠀⣸⣇⣠⡄⠀⠀⠀⠀⣿⠠⢸⡟⠹⣿⡍⠉⣿⣿⣧⠀⠀⠀⠻⣿⣶⣄⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⢸⣿⣿⡟⠀⠀⠀⠀⠀⣼⡏⢠⡿⣿⣦⣤⣿⡿⣿⡇⠀⠀⠀⢸⡿⠻⣿⣧⣤⣼⣿⡄⢸⡿⣿⡇⠀⠀⢠⣌⠛⢿⣿⣶⣤⣤⣄⡀",
    "⠀⠀⠀⣀⣤⣿⣿⠟⣀⠀⠀⠀⠀⠀⣿⢃⣿⠇⢿⣯⣿⣿⣇⣿⠁⠀⠀⠀⣾⡇⢸⣿⠃⠉⠁⠸⣿⣼⡇⢻⡇⠀⠀⠀⢿⣷⣶⣬⣭⣿⣿⣿⠇",
    "⣾⣿⣿⣿⣿⣻⣥⣾⡇⠀⠀⠀⠀⠀⣿⣿⠇⠀⠘⠿⠋⠻⠿⠿⠶⠶⠾⠿⠿⠍⢛⣧⣰⠶⢀⣀⣼⣿⣴⡸⣿⠀⠀⠀⠸⣿⣿⣿⠉⠛⠉⠀⠀",
    "⠘⠛⠿⠿⢿⣿⠉⣿⠁⠀⠀⠀⠀⢀⣿⡿⣶⣶⣶⣤⣤⣤⣀⣀⠀⠀⠀⠀⠀⠀⢀⣭⣶⣿⡿⠟⠋⠉⠀⠀⣿⠀⡀⡀⠀⣿⣿⣿⡆⠀⠀⠀⠀",
    "⠀⠀⠀⠀⣼⣿⠀⣿⠀⠀⠸⠀⠀⠸⣿⠇⠀⠀⣈⣩⣭⣿⡿⠟⠃⠀⠀⠀⠀⠀⠙⠛⠛⠛⠛⠻⠿⠷⠆⠀⣯⠀⠇⡇⠀⣿⡏⣿⣧⠀⠀⠀⠀",
    "⠀⠀⠀⠀⢿⣿⡀⣿⡆⠀⠀⠀⠀⠀⣿⠰⠿⠿⠛⠋⠉⠀⠀⢀⣴⣶⣶⣶⣶⣶⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣧⠀⠀⠀⣿⡇⣿⣿⠀⠀⠀⠀",
    "⠀⠀⠀⠀⢸⣿⡇⢻⣇⠀⠘⣰⡀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀⢸⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣿⠀⠀⠀⣿⣧⣿⡿⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠈⣿⣧⢸⣿⡀⠀⡿⣧⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⣿⡄⠀⠀⠀⣼⡇⠀⠀⠀⠀⠀⠀⢀⣤⣾⡟⢡⣶⠀⢠⣿⣿⣿⠃⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠹⣿⣿⣿⣷⠀⠇⢹⣷⡸⣿⣶⣦⣄⣀⡀⠀⠀⠀⣿⡇⠀⠀⢠⣿⠁⣀⣀⣠⣤⣶⣾⡿⢿⣿⡇⣼⣿⢀⣿⣿⠿⠏⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠈⠛⠛⣿⣷⣴⠀⢹⣿⣿⣿⡟⠿⠿⣿⣿⣿⣿⣾⣷⣶⣿⣿⣿⣿⡿⠿⠟⠛⠋⠉⠀⢸⣿⣿⣿⣿⣾⣿⠃⠀⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⣦⣘⣿⡿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠛⠛⠻⠿⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⣿⣿⣿⠈⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  ];
  const figure = [
    "⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢸⣿⣿⣷⣜⢿⣧⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡄⠻⣿⣿⣿⣿⣦⠄⠄",
    "⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⣿⣿⣿⣿⣮⡻⣷⡙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣆⠙⣿⣿⣿⣿⣧⠄",
    "⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⣿⣿⣿⣿⣿⣿⣧⢸⣿⣿⣿⡘⢿⣮⡛⣷⡙⢿⣿⡏⢻⣿⣿⣿⣧⠙⢿⣿⣿⣷⠘⢿⣿⣆⢿⣿⣿⣿⣿⣆",
    "⣿⣿⣿⣿⣿⣿⣿⣿⡿⠐⣿⣿⣿⣿⣿⣿⠃⠄⢣⠻⣿⣧⠄⠙⢷⡀⠙⢦⡙⢿⡄⠹⣿⣿⣿⣇⠄⠻⣿⣿⣇⠈⢻⣿⡎⢿⣿⣿⣿⣿",
    "⣿⣿⣿⣿⣿⣿⣿⣿⡇⠄⣿⣿⣿⣿⣿⠋⠄⣼⣆⢧⠹⣿⣆⠄⠈⠛⣄⠄⢬⣒⠙⠂⠈⢿⣿⣿⡄⠄⠈⢿⣿⡀⠄⠙⣿⠘⣿⣿⣿⣿",
    "⣿⣿⣿⣿⣿⣿⣿⣿⡇⠄⣿⣿⣿⣿⠏⢀⣼⣿⣿⣎⠁⠐⢿⠆⠄⠄⠈⠢⠄⠙⢷⣤⡀⠄⠙⠿⠷⠄⠄⠄⠹⠇⠄⠄⠘⠄⢸⣿⣿⣿",
    "⣿⣿⣿⣿⣿⣿⣿⣿⠄⠄⢻⣿⣿⠏⢀⣾⣿⣿⣿⣿⡦⠄⠄⡘⢆⠄⠄⠄⠄⠄⠄⠙⠻⡄⠄⠄⠉⡆⠄⠄⠄⠑⠄⢠⡀⠄⠄⣿⡿⣿",
    "⣿⣿⣿⣿⣿⣿⣿⣿⠄⠄⢸⣿⠋⣰⣿⣿⡿⢟⣫⣵⣾⣷⡄⢻⣄⠁⠄⠄⠠⣄⠄⠄⠄⠈⠂⠄⠄⠈⠄⠱⠄⠄⠄⠄⢷⢀⣠⣽⡇⣿",
    "⣿⣿⣿⣿⣿⣿⣿⣿⡄⠄⠄⢁⣚⣫⣭⣶⣾⣿⣿⣿⣿⣿⣿⣦⣽⣷⣄⠄⠄⠘⢷⣄⠄⠄⠄⠄⣠⠄⠄⠄⠄⠈⠉⠈⠻⢸⣿⣿⡇⣿",
    "⣿⣿⣿⣿⣿⣿⣿⣿⡇⠄⢠⣾⣿⣿⣿⣿⣿⡿⠿⠿⠟⠛⠿⣿⣿⣿⣿⣷⣤⣤⣤⣿⣷⣶⡶⠋⢀⡠⡐⢒⢶⣝⢿⡟⣿⢸⣿⣿⡃⣿",
    "⣿⣿⣿⢹⣿⢿⣿⣿⣷⢠⣿⣿⣿⣿⣯⠷⠐⠋⠋⠛⠉⠁⠛⠛⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⡏⠊⡼⢷⢱⣿⡾⡷⣿⢸⡏⣿⢰⣿",
    "⣿⣿⣿⢸⣿⡘⡿⣿⣿⠎⣿⠟⠋⢁⡀⡠⣒⡤⠬⢭⣖⢝⢷⣶⣬⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⢃⢔⠭⢵⣣⣿⠓⢵⣿⢸⢃⡇⢸⣿",
    "⣿⣿⣿⡄⣿⡇⠄⡘⣿⣷⡸⣴⣾⣿⢸⢱⢫⡞⣭⢻⡼⡏⣧⢿⣿⣿⣿⣿⣿⣿⣿⡿⣿⢿⡿⣿⣧⣕⣋⣉⣫⣵⣾⣿⡏⢸⠸⠁⢸⡏",
    "⣿⣿⣿⡇⠸⣷⠄⠈⠘⢿⣧⠹⣹⣿⣸⡼⣜⢷⣕⣪⡼⣣⡟⣾⣿⣿⢯⡻⣟⢯⡻⣿⣮⣷⣝⢮⣻⣿⢿⣿⣝⣿⣿⢿⣿⢀⠁⠄⢸⠄",
    "⣿⣿⡿⣇⠄⠹⡆⠄⠄⠈⠻⣧⠩⣊⣷⠝⠮⠕⠚⠓⠚⣩⣤⣝⢿⣿⣯⡿⣮⣷⣿⣾⣿⢻⣿⣿⣿⣾⣷⣽⣿⣿⣿⣿⡟⠄⠄⠄⠄⢸",
    "⠹⣿⡇⢹⠄⠄⠐⠄⠄⠄⠄⠈⠣⠉⡻⣟⢿⣝⢿⣝⠿⡿⣷⣝⣷⣝⣿⣿⣿⣿⣿⣿⣿⣧⢹⣿⣿⣿⣿⣿⣿⣿⣿⡟⣠⠄⠄⠄⠄⠈",
    "⠄⠘⠇⠄⠄⠄⠄⠄⠄⠄⠄⠄⠠⣌⠈⢳⢝⣮⣻⣿⣿⣮⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠄⠄⠄⠄⢀",
    "⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢻⣷⣤⣝⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⠄⠄⠄⠄⣼",
    "⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⢿⣿⣿⣿⣿⣿⣿⣿⠏⠄⠄⠄⠄⣰⢩",
    "⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢻⣿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⠛⠋⠉⠉⠉⠄⠄⠄⠄⣸⣿⣿⣿⣿⡿⠃⠄⠄⠄⠄⣰⣿⣧",
    "⣷⡀⠄⠈⢦⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢻⣯⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⣤⣤⣶⣶⣶⣶⣾⣿⣿⣿⣿⡿⠋⠄⠄⠄⠄⠄⣰⣿⣿⣿",
    "⣿⣿⣦⡱⣌⢻⣦⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠙⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠄⠄⠄⠄⠄⠄⢰⣿⣿⣿⣿",
    "⣿⣿⣿⣿⣿⣷⣿⣿⣦⣐⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠉⠛⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣫⡔⢀⣴⠄⠄⠄⡼⣠⣿⣿⣿⣿⣿",
    "⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠉⠉⠉⠙⠛⢛⣛⣛⣭⣾⣿⣴⣿⢇⣤⣦⣾⣿⣿⣿⣿⣿⣿⣿",
    "⣿⣿⣿⣿⣿⣿⣿⠟⠁⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⠛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿",
  ];
  const arts = [asciiGrid, whale, figure];
  const PERIOD = 6;
  let artIndex = 0;
  let left = PERIOD;

  function build(grid) {
    el.textContent = '';
    el.style.setProperty('--ascii-cols', Math.max(...grid.map(r => r.length)));
    el.style.setProperty('--ascii-rows', grid.length);
    const rows = grid.map(rowStr => {
      const rowEl = document.createElement('span');
      rowEl.className = 'ascii-row';
      rowEl.textContent = rowStr;
      el.appendChild(rowEl);
      return rowEl;
    });

    if (reduceMotion) {
      rows.forEach(r => r.classList.add('show'));
      return;
    }
    rows.forEach((rowEl, i) => setTimeout(() => rowEl.classList.add('show'), 120 + i * 45));
  }

  build(arts[0]);
  if (reduceMotion) return;

  // one 1s tick drives both the visible countdown and the rotation itself
  const timer = document.getElementById('asciiTimer');
  timer.textContent = 'next ' + left + 's';
  setInterval(() => {
    if (--left <= 0) {
      left = PERIOD;
      build(arts[artIndex = (artIndex + 1) % arts.length]);
    }
    timer.textContent = 'next ' + left + 's';
  }, 1000);
})();

// copy email on click
const emailLink = document.getElementById('email-link');
const copyNote = document.getElementById('copy-note');
emailLink.addEventListener('click', (e) => {
  if (navigator.clipboard) {
    e.preventDefault();
    navigator.clipboard.writeText('sahutsakorn.phir@bumail.net').then(() => {
      copyNote.classList.add('show');
      setTimeout(() => copyNote.classList.remove('show'), 1500);
    }).catch(() => {
      window.location.href = 'mailto:sahutsakorn.phir@bumail.net';
    });
  }
});

// card spotlight + tilt (desktop hover only)
if (canHover && !reduceMotion) {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');

      if (!card.classList.contains('add-card')) {
        const cx = x / rect.width - 0.5;
        const cy = y / rect.height - 0.5;
        card.style.transition = 'border-color .3s ease, background-color .3s ease';
        card.style.transform = `perspective(700px) rotateX(${(-cy * 6).toFixed(2)}deg) rotateY(${(cx * 8).toFixed(2)}deg) translateY(-4px)`;
      }
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .5s var(--ease), border-color .3s ease, background-color .3s ease';
      card.style.transform = '';
    });
  });
}

// image/video lightbox for project + certification thumbnails
(function () {
  const dialog = document.getElementById('lightbox');
  if (!dialog) return;

  const imageEl = document.getElementById('lightboxImage');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  const closeBtn = document.getElementById('lightboxClose');
  const thumbStripEl = document.getElementById('lightboxThumbs');
  const thumbs = document.querySelectorAll('.project-thumb');

  let count = 1;
  let index = 0;
  let images = null;
  let video = null;
  let originEl = null; // the thumbnail this lightbox grew out of

  const canMorph = typeof document.startViewTransition === 'function' && !reduceMotion;

  // Starting a transition while one is already running skips the old one, which
  // rejects BOTH its ready and finished promises with an AbortError. Neither is
  // an error worth reporting — a fast click just replacing a slower animation —
  // so silence both, or rapid stepping throws unhandled rejections.
  function start(mutate) {
    const t = document.startViewTransition(mutate);
    t.ready.catch(() => {});
    return t.finished.catch(() => {});
  }

  // Runs `mutate` inside a View Transition with `carry` tagged as the shared
  // element for the *outgoing* snapshot. The lightbox media picks the same
  // `lb-media` name up from CSS, so the browser morphs one box between the two
  // instead of cross-fading two unrelated ones. The tag has to be unique per
  // snapshot, which is why it is cleared inside the callback rather than after.
  function morph(carry, mutate) {
    if (!canMorph) { mutate(); return; }
    if (carry) carry.style.viewTransitionName = 'lb-media';
    start(() => {
      if (carry) carry.style.viewTransitionName = '';
      mutate();
    }).then(() => {
      if (carry) carry.style.viewTransitionName = '';
    });
  }

  function renderThumbStrip() {
    if (!images || images.length < 2) {
      thumbStripEl.innerHTML = '';
      return;
    }
    thumbStripEl.innerHTML = images
      .map((src, i) => '<button type="button" data-index="' + i + '" aria-label="Photo ' + (i + 1) + '"><img src="' + src + '" alt=""></button>')
      .join('');
  }

  function render() {
    if (video) {
      imageEl.innerHTML = '<video src="' + video + '" controls autoplay playsinline></video>';
    } else if (images) {
      imageEl.innerHTML = '<img src="' + images[index] + '" alt="Screenshot ' + (index + 1) + '">';
    }
    thumbStripEl.querySelectorAll('button').forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });
  }

  function open(total, startIndex, itemImages, itemVideo, source) {
    count = total;
    index = startIndex || 0;
    images = itemImages || null;
    video = itemVideo || null;
    originEl = source || null;
    morph(originEl, () => {
      renderThumbStrip();
      render();
      dialog.showModal();
    });
  }

  function close() {
    // the tag moves onto the origin thumbnail for the incoming snapshot, so the
    // full-size frame collapses back into the exact card it came from
    if (!canMorph) { dialog.close(); return; }
    const back = originEl;
    start(() => {
      dialog.close();
      if (back) back.style.viewTransitionName = 'lb-media';
    }).then(() => {
      if (back) back.style.viewTransitionName = '';
    });
  }

  // stepping through a gallery morphs between frame sizes on the same name,
  // so the image reflows instead of blinking
  function step(to) {
    index = (to + count) % count;
    if (!canMorph) { render(); return; }
    start(render);
  }

  thumbStripEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    step(parseInt(btn.dataset.index, 10));
  });

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const imgs = thumb.dataset.images ? thumb.dataset.images.split(',') : null;
      const vid = thumb.dataset.video || null;
      open(parseInt(thumb.dataset.count, 10) || 1, 0, imgs, vid, thumb.firstElementChild);
    });
  });

  dialog.addEventListener('close', () => {
    const playing = imageEl.querySelector('video');
    if (playing) playing.pause();
  });

  prevBtn.addEventListener('click', () => step(index - 1));
  nextBtn.addEventListener('click', () => step(index + 1));
  closeBtn.addEventListener('click', close);
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close();
  });
  // Esc dismisses a <dialog> natively without firing our close(), so route the
  // cancel event through the morph too
  dialog.addEventListener('cancel', (e) => {
    if (!canMorph) return;
    e.preventDefault();
    close();
  });
  window.openLightbox = open;
})();

// About page: real photos in the stacked-card carousel
(function () {
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  if (!prevBtn || !nextBtn) return;

  const cardPrev = document.getElementById('cardPrev');
  const cardActive = document.getElementById('cardActive');
  const cardNext = document.getElementById('cardNext');
  const photos = ['images/home/2.png', 'images/home/1.jpg', 'images/home/3.jpg'];
  const COUNT = photos.length;
  let index = 0;

  // A damped spring, not a keyframe: `disp` is the stack's signed displacement
  // (1 = thrown fully right) and it settles back to rest with a real overshoot,
  // which is the part a fixed-duration CSS animation can't express. The side
  // cards trail the active one, so the stack reads as one sprung object.
  const STIFFNESS = 0.105;
  const DAMPING = 0.76;
  let disp = 0;
  let vel = 0;
  let raf = 0;

  function paint() {
    const d = disp;
    const lift = 1 - Math.abs(d) * 0.055;
    cardActive.style.transform =
      'translate3d(' + (d * 48).toFixed(2) + 'px,0,0) rotate(' + (d * 2.4).toFixed(2) + 'deg) scale(' + lift.toFixed(4) + ')';
    // trailing factor: the sides lag the active card, so the whole stack has
    // secondary motion rather than moving as one rigid block
    const t = (d * 30).toFixed(2);
    cardPrev.style.transform = 'translate3d(' + t + 'px,0,0)';
    cardNext.style.transform = 'translate3d(' + t + 'px,0,0)';
  }

  function settle() {
    vel += -STIFFNESS * disp;
    vel *= DAMPING;
    disp += vel;
    if (Math.abs(disp) < 0.0015 && Math.abs(vel) < 0.0015) {
      disp = 0; vel = 0; raf = 0;
      paint();
      return;
    }
    paint();
    raf = requestAnimationFrame(settle);
  }

  function render(direction) {
    const prevIdx = (index - 1 + COUNT) % COUNT;
    const nextIdx = (index + 1) % COUNT;
    cardPrev.querySelector('img').src = photos[prevIdx];
    cardActive.querySelector('img').src = photos[index];
    cardNext.querySelector('img').src = photos[nextIdx];

    if (!direction || reduceMotion) return;
    // throw the stack from the side the press came from, then let it spring back
    disp = direction === 'left' ? -1 : 1;
    vel = 0;
    if (!raf) raf = requestAnimationFrame(settle);
  }

  prevBtn.addEventListener('click', () => {
    index = (index - 1 + COUNT) % COUNT;
    render('left');
  });
  nextBtn.addEventListener('click', () => {
    index = (index + 1) % COUNT;
    render('right');
  });

  // auto-advance; hovering (which is how you reach the arrows or the photo) pauses it
  let auto = 0;
  function autoplay() {
    clearInterval(auto);
    if (!reduceMotion) auto = setInterval(() => nextBtn.click(), 4500);
  }
  const carousel = prevBtn.parentElement;
  carousel.addEventListener('pointerenter', () => clearInterval(auto));
  carousel.addEventListener('pointerleave', autoplay);
  prevBtn.addEventListener('click', autoplay);
  nextBtn.addEventListener('click', autoplay);
  autoplay();

  cardActive.addEventListener('click', () => {
    if (window.openLightbox) window.openLightbox(COUNT, index, photos, null, cardActive.querySelector('img'));
  });
  cardActive.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      cardActive.click();
    }
  });
})();

// Projects: scroll-synced feature list (title picker <-> stacked image cards)
(function () {
  const list = document.querySelector('.feature-list');
  const wrap = document.querySelector('.feature-list-wrap');
  const detail = document.querySelector('.feature-detail');
  const items = document.querySelectorAll('.feature-item');
  const cards = document.querySelectorAll('.feature-image-card');
  if (!list || !wrap || !detail || !items.length || !cards.length) return;

  function setActive(index) {
    items.forEach((el, i) => el.classList.toggle('active', i === index));
    cards.forEach((el, i) => el.classList.toggle('active', i === index));

    const source = cards[index].querySelector('.feature-detail-source');
    if (source) detail.innerHTML = source.innerHTML;

    const item = items[index];
    const targetTop = item.offsetTop - (wrap.clientHeight - item.offsetHeight) / 2;
    list.style.transform = 'translateY(' + -targetTop + 'px)';
  }

  setActive(0);

  items.forEach((el, i) => {
    el.addEventListener('click', () => {
      cards[i].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Array.from(cards).indexOf(entry.target);
          if (idx !== -1) setActive(idx);
        }
      });
    }, { threshold: 0, rootMargin: '-45% 0px -45% 0px' });
    cards.forEach((card) => io.observe(card));
  }

  window.addEventListener('resize', () => {
    const activeIndex = Array.from(items).findIndex((el) => el.classList.contains('active'));
    setActive(activeIndex === -1 ? 0 : activeIndex);
  });
})();
