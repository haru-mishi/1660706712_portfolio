// Sidebar nav: smooth scroll + scrollspy
(function () {
  const links = document.querySelectorAll('#nav a');
  const sections = document.querySelectorAll('main section');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector(link.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        links.forEach((l) => l.classList.remove('active'));
        const match = document.querySelector('#nav a[href="#' + entry.target.id + '"]');
        if (match) match.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  sections.forEach((s) => observer.observe(s));
})();

// Home carousel (placeholder frames until real photos are added)
(function () {
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  if (!prevBtn || !nextBtn) return;

  const cardPrev = document.getElementById('cardPrev');
  const cardActive = document.getElementById('cardActive');
  const cardNext = document.getElementById('cardNext');
  const COUNT = 5;
  let index = 0;

  function render(direction) {
    const prevIdx = (index - 1 + COUNT) % COUNT;
    const nextIdx = (index + 1) % COUNT;
    cardPrev.textContent = 'PIC ' + (prevIdx + 1);
    cardActive.textContent = 'PIC ' + (index + 1);
    cardNext.textContent = 'PIC ' + (nextIdx + 1);

    const enterClass = direction === 'left' ? 'enter-left' : 'enter-right';
    [cardPrev, cardActive, cardNext].forEach((card) => {
      card.classList.remove('enter-left', 'enter-right');
      void card.offsetWidth;
      card.classList.add(enterClass);
    });
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
    if (window.openLightbox) window.openLightbox(COUNT, index, 'Photo');
  });
  cardActive.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      cardActive.click();
    }
  });

  render();
})();

// Image lightbox (placeholder slots until real photos/screenshots are added).
// Exposes window.openLightbox(count, startIndex, label) so the home carousel
// can reuse the same dialog instead of duplicating it.
(function () {
  const dialog = document.getElementById('lightbox');
  if (!dialog) return;

  const imageEl = document.getElementById('lightboxImage');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  const closeBtn = document.getElementById('lightboxClose');
  const thumbs = document.querySelectorAll('.project-thumb');

  let count = 1;
  let index = 0;
  let label = 'Screenshot';
  let images = null;
  let video = null;

  function render() {
    if (video) {
      imageEl.innerHTML = '<video src="' + video + '" controls autoplay playsinline></video>';
    } else if (images) {
      imageEl.innerHTML = '<img src="' + images[index] + '" alt="' + label + ' ' + (index + 1) + '">';
    } else {
      imageEl.textContent = label + ' ' + (index + 1) + ' / ' + count;
    }
  }

  function open(total, startIndex, itemLabel, itemImages, itemVideo) {
    count = total;
    index = startIndex || 0;
    label = itemLabel || 'Screenshot';
    images = itemImages || null;
    video = itemVideo || null;
    render();
    dialog.showModal();
  }

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const imgs = thumb.dataset.images ? thumb.dataset.images.split(',') : null;
      const vid = thumb.dataset.video || null;
      open(parseInt(thumb.dataset.count, 10) || 1, 0, 'Screenshot', imgs, vid);
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
  window.openLightbox = open;
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
})();

// Terminal splash
(function () {
  const splash = document.getElementById('login-page');
  const portfolio = document.getElementById('portfolio');
  const termBody = document.getElementById('termBody');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const script = [
    { cmd: 'whoami' },
    { out: 'Sahutsakorn Phiriyanichakorn' },
    { cmd: 'cat about.md' },
    { out: 'Information Technology and Innovation' },
    { out: 'Major: Computer Science' },
    { cmd: 'ls skills/' },
    { out: 'C / C++, Python, Dart, SQL, Java, HTML' },
  ];

  function addLine(className, html) {
    const el = document.createElement('div');
    el.className = 'line ' + className;
    el.innerHTML = html;
    termBody.appendChild(el);
    return el;
  }

  function typeCmd(text, done) {
    const el = addLine('cmd', '<span class="prompt">$</span><span></span>');
    const span = el.querySelector('span:last-child');
    if (reduced) { span.textContent = text; done(); return; }
    let i = 0;
    (function step() {
      span.textContent = text.slice(0, i);
      if (i < text.length) { i++; setTimeout(step, 26 + Math.random() * 30); }
      else done();
    })();
  }

  function showOut(text, done) {
    addLine('out', '<span class="arrow">&rarr;</span> ' + text);
    setTimeout(done, reduced ? 0 : 200);
  }

  function runScript(i) {
    if (i >= script.length) { showPrompt(); return; }
    const step = script[i];
    if (step.cmd) {
      typeCmd(step.cmd, () => setTimeout(() => runScript(i + 1), reduced ? 0 : 150));
    } else {
      showOut(step.out, () => runScript(i + 1));
    }
  }

  function showPrompt() {
    const row = document.createElement('form');
    row.className = 'prompt-row';
    row.autocomplete = 'off';
    row.innerHTML =
      '<span class="prompt">$</span>' +
      '<input type="text" id="startInput" autocomplete="off" spellcheck="false" placeholder="/start" aria-label="terminal command">' +
      '<button type="submit" class="send-btn" aria-label="Launch">&#8629;</button>';
    termBody.appendChild(row);

    const input = row.querySelector('#startInput');
    input.focus();

    row.addEventListener('submit', (e) => {
      e.preventDefault();
      if (input.value.trim().toLowerCase() === '/start') {
        launch();
      } else {
        input.classList.add('invalid');
        setTimeout(() => input.classList.remove('invalid'), 220);
      }
    });
  }

  function launch() {
    addLine('out', '<span class="arrow">&rarr;</span> launching portfolio<span class="accent">...</span>');
    setTimeout(runWipe, reduced ? 0 : 500);
  }

  runScript(0);

  function runWipe() {
    const tint = document.getElementById('wipeTint');
    const solid = document.getElementById('wipeSolid');
    if (reduced) {
      enterPortfolio();
      tint.remove();
      solid.remove();
      return;
    }

    const STAGGER = 380;
    const DURATION = 460;
    const HOLD = 400;

    tint.classList.add('cover');
    setTimeout(() => solid.classList.add('cover'), STAGGER);

    setTimeout(() => {
      enterPortfolio();
      tint.classList.replace('cover', 'reveal');
      setTimeout(() => solid.classList.replace('cover', 'reveal'), STAGGER);
      setTimeout(() => {
        tint.remove();
        solid.remove();
      }, STAGGER + DURATION);
    }, STAGGER + DURATION + HOLD);
  }

  function enterPortfolio() {
    splash.remove();
    portfolio.classList.remove('hidden');
  }
})();
