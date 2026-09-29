const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// starfield background
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let stars = [];
function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  const n = Math.round(innerWidth * innerHeight / 6000);
  stars = Array.from({ length: n }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: (Math.random() * 1.2 + .3) * devicePixelRatio,
    p: Math.random() * Math.PI * 2,
    s: Math.random() * .02 + .005,
  }));
  if (reduceMotion) draw();
}
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const st of stars) {
    st.p += st.s;
    ctx.globalAlpha = .35 + Math.sin(st.p) * .35;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(st.x, st.y, st.r, 0, 7);
    ctx.fill();
  }
  if (!reduceMotion) requestAnimationFrame(draw);
}
addEventListener('resize', resize);
resize();
if (!reduceMotion) draw();

// fade sections in as they scroll into view
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: .08 });
document.querySelectorAll('main section > *').forEach((el) => { el.classList.add('reveal'); io.observe(el); });

// lightbox: shows one list of {src, cap}, prev/next when there's more than one
const lb = document.getElementById('lightbox');
const lbImg = lb.querySelector('img');
const lbCap = lb.querySelector('figcaption');
let items = [], idx = 0;
function show(i) {
  idx = (i + items.length) % items.length;
  lbImg.src = items[idx].src;
  lbImg.alt = items[idx].cap;
  lbCap.textContent = items[idx].cap;
}
function openLightbox(list, i) {
  items = list;
  lb.classList.toggle('single', list.length < 2);
  show(i);
  lb.showModal();
}
lb.querySelector('.lb-prev').onclick = () => show(idx - 1);
lb.querySelector('.lb-next').onclick = () => show(idx + 1);
lb.querySelector('.lb-close').onclick = () => lb.close();
lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
lb.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') show(idx - 1);
  if (e.key === 'ArrowRight') show(idx + 1);
});

// project galleries: thumbnails swap the main image + caption, main image opens the lightbox
document.querySelectorAll('.gallery').forEach((g) => {
  const main = g.querySelector('.gallery-main img');
  const cap = g.querySelector('.gallery-cap');
  const thumbs = [...g.querySelectorAll('.thumbs button')];
  const list = thumbs.map((t) => ({ src: t.dataset.src, cap: t.dataset.cap || '' }));
  let cur = 0;
  thumbs.forEach((t, i) => t.addEventListener('click', () => {
    cur = i;
    thumbs.forEach((b) => b.classList.toggle('active', b === t));
    main.src = list[i].src;
    main.alt = list[i].cap || t.querySelector('img').alt;
    if (cap) cap.textContent = list[i].cap;
  }));
  g.querySelector('.gallery-main').addEventListener('click', () => openLightbox(list, cur));
});

// about photos: auto-rotate every 4s, paused while hovered or the lightbox is open
const about = document.querySelector('.about-gallery');
if (about && !reduceMotion) {
  const thumbs = [...about.querySelectorAll('.thumbs button')];
  const mainImg = about.querySelector('.gallery-main img');
  let paused = false;
  about.addEventListener('mouseenter', () => { paused = true; });
  about.addEventListener('mouseleave', () => { paused = false; });
  setInterval(() => {
    if (paused || lb.open) return;
    const next = thumbs[(thumbs.findIndex((t) => t.classList.contains('active')) + 1) % thumbs.length];
    mainImg.style.opacity = 0;
    setTimeout(() => { next.click(); mainImg.style.opacity = 1; }, 250);
  }, 4000);
}

// certificates
document.querySelectorAll('.cert-img').forEach((b) => {
  const img = b.querySelector('img');
  b.addEventListener('click', () => openLightbox([{ src: img.src, cap: img.alt }], 0));
});
