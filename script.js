const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// nav background on scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });

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

// scroll progress bar
const progress = document.getElementById('scroll-progress');
function updateProgress(){
  const h = document.documentElement;
  const scrollable = h.scrollHeight - h.clientHeight;
  const pct = scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0;
  progress.style.width = pct + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// scroll reveal
const revealTargets = document.querySelectorAll('section, .card');
if (!reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in-view'), (i % 6) * 70);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(el => io.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('in-view'));
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
  const asciiSparkCoords = [[0, 2], [0, 17], [1, 0], [1, 3], [1, 7], [1, 8], [1, 16], [1, 17], [1, 24], [1, 27], [2, 0], [2, 8], [2, 16], [2, 17], [2, 22], [2, 24], [2, 27], [3, 1], [3, 9], [3, 10], [3, 21], [3, 27], [4, 1], [4, 17], [4, 19], [4, 21], [4, 24], [4, 27], [5, 4], [5, 5], [5, 8], [5, 21], [6, 2], [6, 6], [6, 7], [6, 29], [7, 0], [7, 1], [7, 25], [8, 10], [9, 10], [10, 6], [11, 3], [11, 17], [11, 28], [11, 29], [12, 2], [12, 26], [12, 27], [12, 29], [13, 3], [13, 4], [13, 24]];
  const sparkSet = new Set(asciiSparkCoords.map(([y, x]) => y + ',' + x));

  const rows = asciiGrid.map((rowStr, y) => {
    const rowEl = document.createElement('span');
    rowEl.className = 'ascii-row';
    let buf = '';
    const flush = () => {
      if (buf) { rowEl.appendChild(document.createTextNode(buf)); buf = ''; }
    };
    for (let x = 0; x < rowStr.length; x++) {
      const ch = rowStr[x];
      if (sparkSet.has(y + ',' + x)) {
        flush();
        const spark = document.createElement('span');
        spark.className = 'spark';
        spark.textContent = ch;
        spark.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
        rowEl.appendChild(spark);
      } else {
        buf += ch;
      }
    }
    flush();
    return rowEl;
  });

  rows.forEach(rowEl => el.appendChild(rowEl));

  if (reduceMotion) {
    rows.forEach(r => r.classList.add('show'));
    return;
  }

  rows.forEach((rowEl, i) => setTimeout(() => rowEl.classList.add('show'), 120 + i * 45));
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

  function open(total, startIndex, itemImages, itemVideo) {
    count = total;
    index = startIndex || 0;
    images = itemImages || null;
    video = itemVideo || null;
    renderThumbStrip();
    render();
    dialog.showModal();
  }

  thumbStripEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    index = parseInt(btn.dataset.index, 10);
    render();
  });

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const imgs = thumb.dataset.images ? thumb.dataset.images.split(',') : null;
      const vid = thumb.dataset.video || null;
      open(parseInt(thumb.dataset.count, 10) || 1, 0, imgs, vid);
    });
  });

  dialog.addEventListener('close', () => {
    const playing = imageEl.querySelector('video');
    if (playing) playing.pause();
  });

  prevBtn.addEventListener('click', () => {
    index = (index - 1 + count) % count;
    render();
  });
  nextBtn.addEventListener('click', () => {
    index = (index + 1) % count;
    render();
  });
  closeBtn.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
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

  function render(direction) {
    const prevIdx = (index - 1 + COUNT) % COUNT;
    const nextIdx = (index + 1) % COUNT;
    cardPrev.querySelector('img').src = photos[prevIdx];
    cardActive.querySelector('img').src = photos[index];
    cardNext.querySelector('img').src = photos[nextIdx];

    if (direction) {
      const enterClass = direction === 'left' ? 'enter-left' : 'enter-right';
      [cardPrev, cardActive, cardNext].forEach((card) => {
        card.classList.remove('enter-left', 'enter-right');
        void card.offsetWidth;
        card.classList.add(enterClass);
      });
    }
  }

  prevBtn.addEventListener('click', () => {
    index = (index - 1 + COUNT) % COUNT;
    render('left');
  });
  nextBtn.addEventListener('click', () => {
    index = (index + 1) % COUNT;
    render('right');
  });

  cardActive.addEventListener('click', () => {
    if (window.openLightbox) window.openLightbox(COUNT, index, photos);
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
