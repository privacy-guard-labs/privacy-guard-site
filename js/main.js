// === LENIS SMOOTH SCROLL ===
const lenis = (() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  if (typeof Lenis === 'undefined') return null;

  const l = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.5,
  });
  // Handle anchor link clicks for smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - 80;
        l.scrollTo(y, { duration: 1.5 });
      }
    });
  });

  function raf(time) { l.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  return l;
})();

// === SCROLL REVEAL ===
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// === CUSTOM CURSOR ===
(function() {
  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isMobile || reducedMotion) return;

  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;
  const ring = cursor.querySelector('.cursor-ring');
  const dot = cursor.querySelector('.cursor-dot');
  const label = cursor.querySelector('.cursor-label');

  let mx = 0, my = 0, rx = 0, ry = 0, dx = 0, dy = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.classList.add('active');
  });
  document.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
  document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));

  function update() {
    dx += (mx - dx) * 0.2;
    dy += (my - dy) * 0.2;
    dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
    rx += (mx - rx) * 0.08;
    ry += (my - ry) * 0.08;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    label.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, 20px)`;
    requestAnimationFrame(update);
  }
  update();

  const interactiveEls = 'a, button, .btn-primary, .btn-secondary';
  const entityEls = '.edit-mode-terminal .entity, .demo-entity';
  document.addEventListener('mouseover', (e) => {
    const t = e.target;
    if (t.closest(entityEls)) {
      cursor.classList.add('entity-hover');
      cursor.classList.remove('hover');
      label.textContent = 'Reveal';
    } else if (t.closest(interactiveEls)) {
      cursor.classList.add('hover');
      cursor.classList.remove('entity-hover');
      label.textContent = '';
    }
  });
  document.addEventListener('mouseout', (e) => {
    const t = e.target;
    if (t.closest(entityEls) || t.closest(interactiveEls)) {
      cursor.classList.remove('hover', 'entity-hover');
      label.textContent = '';
    }
  });
})();

// === FEATURE CARD TILT ===
(function() {
  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isMobile || reducedMotion) return;
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

// === PAGE LOAD SEQUENCE ===
(function() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  // Skip if page restored from bfcache (back/forward navigation)
  let fromCache = false;
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) { fromCache = true; loader.remove(); }
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function runSequence() {
    if (fromCache) return;
    if (reducedMotion) { loader.remove(); return; }
    loader.classList.add('visible');
    setTimeout(() => {
      loader.classList.add('done');
      loader.style.pointerEvents = 'none';
      setTimeout(() => loader.remove(), 500);
    }, 500);
  }

  // Wait for fonts to load, then run
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2000))]).then(runSequence);
  } else {
    setTimeout(runSequence, 300);
  }
})();

// === ANIMATED BACKGROUND ===
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [], mouse = { x: 0, y: 0 };
  let canvasVisible = true;

  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  new IntersectionObserver(([e]) => { canvasVisible = e.isIntersecting; }, { threshold: 0 }).observe(canvas);

  const isMobile = window.innerWidth < 768;
  const COUNT = isMobile ? 30 : Math.min(80, Math.floor(window.innerWidth / 20));
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5, alpha: Math.random() * 0.3 + 0.05
    });
  }

  function draw() {
    if (!canvasVisible) { requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.strokeStyle = `rgba(129, 220, 198, ${(1 - dist / 150) * 0.06})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    for (const p of particles) {
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        const force = (200 - dist) / 200 * 0.02;
        p.vx += dx / dist * force;
        p.vy += dy / dist * force;
      }
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.99; p.vy *= 0.99;
      if (p.x < 0) { p.x = 0; p.vx *= -1; }
      if (p.x > w) { p.x = w; p.vx *= -1; }
      if (p.y < 0) { p.y = 0; p.vy *= -1; }
      if (p.y > h) { p.y = h; p.vy *= -1; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(129, 220, 198, ${p.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// === HERO GLOW MOUSE-REACTIVE ===
(function() {
  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  if (isMobile) return;
  const glow = document.querySelector('.hero-glow');
  const hero = document.querySelector('.hero');
  if (!glow || !hero) return;
  let mx = 0, my = 0, cx = 0, cy = 0;
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mx = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    my = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
  });
  function updateGlow() {
    cx += (mx - cx) * 0.04;
    cy += (my - cy) * 0.04;
    glow.style.transform = `translateX(calc(-50% + ${cx}px)) translateY(${cy}px)`;
    requestAnimationFrame(updateGlow);
  }
  updateGlow();
})();

// === SCROLL PROGRESS BAR ===
(function() {
  const bar = document.querySelector('.scroll-progress-bar');
  if (!bar) return;
  function updateProgress() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = docHeight > 0 ? `${(window.scrollY / docHeight) * 100}%` : '0%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
})();

// === NAV ===
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Mobile menu toggle
const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
let menuOpen = false;
function toggleMenu(open) {
  menuOpen = typeof open === 'boolean' ? open : !menuOpen;
  mobileMenu.style.display = menuOpen ? 'flex' : 'none';
  if (menuOpen) {
    requestAnimationFrame(() => mobileMenu.classList.add('open'));
    document.body.style.overflow = 'hidden';
  } else {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { if (!menuOpen) mobileMenu.style.display = 'none'; }, 300);
  }
  navToggle.classList.toggle('open', menuOpen);
  navToggle.setAttribute('aria-expanded', menuOpen);
}
navToggle.addEventListener('click', () => toggleMenu());
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => toggleMenu(false));
});

// === COUNTER ANIMATION ===
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  if (target === 0) { el.textContent = '0' + suffix; return; }
  const duration = 1500;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.counter-value').forEach(animateCounter);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.trust-grid').forEach(el => counterObserver.observe(el));

// PII counter
const piiCounterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = document.getElementById('pii-counter');
      const duration = 2000;
      const start = performance.now();
      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(19 * eased);
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      piiCounterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.pii-count').forEach(el => piiCounterObserver.observe(el));

// === HERO TERMINAL ANIMATION ===
(function() {
  const output = document.getElementById('terminal-output');

  const examples = [
    [
      { type: 'cmd', text: '$ privacy-guard redact --input email.txt' },
      { type: 'output', text: '' },
      { type: 'output', text: 'Scanning for PII entities...' },
      { type: 'output', text: '' },
      { type: 'highlight', text: '  [NAME]     ', extra: 'Sarah Chen' },
      { type: 'highlight', text: '  [EMAIL]    ', extra: 'sarah@acme.io' },
      { type: 'highlight', text: '  [SSN]      ', extra: '123-45-6789' },
      { type: 'highlight', text: '  [PHONE]    ', extra: '(415) 555-0192' },
      { type: 'output', text: '' },
      { type: 'warning-text', text: '  4 entities found, ready to redact. ' },
      { type: 'output', text: '' },
      { type: 'prompt-line', text: 'Proceed? (y/n): ', extra: 'y' },
    ],
    [
      { type: 'cmd', text: '$ privacy-guard redact --input contract.pdf' },
      { type: 'output', text: '' },
      { type: 'output', text: 'Scanning for PII entities...' },
      { type: 'output', text: '' },
      { type: 'highlight', text: '  [COMPANY]  ', extra: 'Rossi & Partners S.r.l.' },
      { type: 'highlight', text: '  [PIVA]     ', extra: 'IT 01234567890' },
      { type: 'highlight', text: '  [CF]       ', extra: 'RSSMRA85T10A562S' },
      { type: 'highlight', text: '  [IBAN]     ', extra: 'IT60 X054 2811 1010 0000 0123 456' },
      { type: 'highlight', text: '  [ADDRESS]  ', extra: 'Via Garibaldi 42, Milano' },
      { type: 'output', text: '' },
      { type: 'warning-text', text: '  5 entities found, ready to redact. ' },
      { type: 'output', text: '' },
      { type: 'prompt-line', text: 'Proceed? (y/n): ', extra: 'y' },
    ],
    [
      { type: 'cmd', text: '$ privacy-guard redact --input support.csv' },
      { type: 'output', text: '' },
      { type: 'output', text: 'Scanning for PII entities...' },
      { type: 'output', text: '' },
      { type: 'highlight', text: '  [NAME]     ', extra: 'James Wilson' },
      { type: 'highlight', text: '  [EMAIL]    ', extra: 'j.wilson@corp.co' },
      { type: 'highlight', text: '  [CARD]     ', extra: '4532-9148-0231-6574' },
      { type: 'highlight', text: '  [PHONE]    ', extra: '+44 20 7946 0958' },
      { type: 'highlight', text: '  [IP]       ', extra: '192.168.1.42' },
      { type: 'output', text: '' },
      { type: 'warning-text', text: '  5 entities found, ready to redact. ' },
      { type: 'output', text: '' },
      { type: 'prompt-line', text: 'Proceed? (y/n): ', extra: 'y' },
    ],
  ];

  let currentExample = 0;
  let lineIndex = 0;
  let charIndex = 0;
  let currentSpan = null;

  function typeLine() {
    const lines = examples[currentExample];
    if (lineIndex >= lines.length) {
      setTimeout(() => {
        output.innerHTML = '';
        lineIndex = 0;
        charIndex = 0;
        currentSpan = null;
        currentExample = (currentExample + 1) % examples.length;
        typeLine();
      }, 2000);
      return;
    }
    const line = lines[lineIndex];

    if (charIndex === 0) {
      const div = document.createElement('div');
      if (line.type === 'highlight') {
        const labelSpan = document.createElement('span');
        labelSpan.className = 'highlight';
        div.appendChild(labelSpan);
        const extraSpan = document.createElement('span');
        extraSpan.className = 'output';
        extraSpan.style.opacity = '0.5';
        div.appendChild(extraSpan);
        currentSpan = { label: labelSpan, extra: extraSpan };
      } else if (line.type === 'cmd') {
        const promptSpan = document.createElement('span');
        promptSpan.className = 'prompt';
        promptSpan.textContent = '$ ';
        div.appendChild(promptSpan);
        const cmdSpan = document.createElement('span');
        cmdSpan.className = 'cmd';
        div.appendChild(cmdSpan);
        currentSpan = { label: cmdSpan };
      } else {
        const span = document.createElement('span');
        span.className = line.type;
        div.appendChild(span);
        currentSpan = { label: span };
      }
      output.appendChild(div);
    }

    if (line.type === 'highlight') {
      const fullLabel = line.text;
      const fullExtra = line.extra;
      if (charIndex < fullLabel.length) {
        currentSpan.label.textContent = fullLabel.substring(0, charIndex + 1);
        charIndex++;
        setTimeout(typeLine, 20 + Math.random() * 15);
      } else if (charIndex < fullLabel.length + fullExtra.length) {
        const extraIdx = charIndex - fullLabel.length;
        currentSpan.extra.textContent = fullExtra.substring(0, extraIdx + 1);
        charIndex++;
        setTimeout(typeLine, 15 + Math.random() * 10);
      } else {
        lineIndex++;
        charIndex = 0;
        setTimeout(typeLine, 200);
      }
    } else if (line.type === 'prompt-line') {
      const fullText = line.text;
      const fullExtra = line.extra || '';
      if (charIndex < fullText.length) {
        currentSpan.label.textContent = fullText.substring(0, charIndex + 1);
        charIndex++;
        setTimeout(typeLine, 30 + Math.random() * 20);
      } else if (charIndex < fullText.length + fullExtra.length) {
        const extraIdx = charIndex - fullText.length;
        if (!currentSpan.extra) {
          const extraSpan = document.createElement('span');
          extraSpan.className = 'highlight';
          currentSpan.label.parentElement.appendChild(extraSpan);
          currentSpan.extra = extraSpan;
        }
        currentSpan.extra.textContent = fullExtra.substring(0, extraIdx + 1);
        charIndex++;
        setTimeout(typeLine, 80 + Math.random() * 40);
      } else {
        lineIndex++;
        charIndex = 0;
        setTimeout(typeLine, 300);
      }
    } else {
      const fullText = line.text;
      if (charIndex < fullText.length) {
        currentSpan.label.textContent = fullText.substring(0, charIndex + 1);
        charIndex++;
        setTimeout(typeLine, 25 + Math.random() * 15);
      } else {
        lineIndex++;
        charIndex = 0;
        setTimeout(typeLine, line.type === 'output' && fullText === '' ? 100 : 200);
      }
    }
  }

  const heroObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      setTimeout(typeLine, 800);
      heroObserver.disconnect();
    }
  }, { threshold: 0.3 });
  heroObserver.observe(document.querySelector('.hero-terminal'));
})();

// === ANIMATED PII DEMO ===
(function() {
  const inputCol = document.getElementById('demo-input-col');
  const outputCol = document.getElementById('demo-output-col');
  const phaseLabel = document.getElementById('demo-phase');
  const scanline = document.getElementById('demo-scanline');
  const progressBar = document.getElementById('demo-progress-bar');
  const replayBtn = document.getElementById('demo-replay');
  const styleSelect = document.getElementById('demo-style');

  function getRedactedToken(entity) {
    const style = styleSelect.value;
    if (style === 'mask') return '\u2588'.repeat(entity.value.length);
    if (style === 'hash') {
      let h = 0;
      for (let i = 0; i < entity.value.length; i++) h = ((h << 5) - h + entity.value.charCodeAt(i)) | 0;
      return ('00000000' + (h >>> 0).toString(16)).slice(-8);
    }
    return entity.label;
  }
  const statEntities = document.getElementById('stat-entities');
  const statCategories = document.getElementById('stat-categories');
  const statTime = document.getElementById('stat-time');

  const sampleText = `Hi, I'm Sarah Chen from Acme Corp. My email is sarah@acme.io and SSN 123-45-6789. Call (415) 555-0192 or visit https://acme.io. Card: 4532-9148-0231-6574`;

  const entities = [
    { type: 'NAME',  start: 8,   end: 18,  label: '[NAME]',  value: 'Sarah Chen' },
    { type: 'EMAIL', start: 47,  end: 60,  label: '[EMAIL]', value: 'sarah@acme.io' },
    { type: 'SSN',   start: 69,  end: 80,  label: '[SSN]',   value: '123-45-6789' },
    { type: 'PHONE', start: 87,  end: 101, label: '[PHONE]', value: '(415) 555-0192' },
    { type: 'URL',   start: 111, end: 126, label: '[URL]',   value: 'https://acme.io' },
    { type: 'CARD',  start: 134, end: 153, label: '[CARD]',  value: '4532-9148-0231-6574' },
  ];

  let animationId = null;
  let isPlaying = false;

  function esc(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function sleep(ms) {
    return new Promise(r => { animationId = setTimeout(r, ms); });
  }
  function setProgress(pct) {
    progressBar.style.width = pct + '%';
  }

  async function runDemo() {
    if (isPlaying) return;
    isPlaying = true;

    inputCol.innerHTML = '<span class="demo-cursor"></span>';
    outputCol.innerHTML = '';
    statEntities.textContent = '0';
    statCategories.textContent = '0';
    statTime.textContent = '\u2014';
    phaseLabel.textContent = 'typing...';
    phaseLabel.className = 'demo-phase-label typing';
    scanline.classList.remove('active');
    setProgress(0);
    replayBtn.style.opacity = '0.4';
    replayBtn.style.pointerEvents = 'none';

    await sleep(600);

    let typed = '';
    const chars = sampleText.split('');
    const typeSpeed = 14;

    for (let i = 0; i < chars.length; i++) {
      typed += chars[i];
      inputCol.innerHTML = esc(typed) + '<span class="demo-cursor"></span>';
      setProgress(((i + 1) / chars.length) * 30);
      const delay = chars[i] === '\n' ? typeSpeed * 3 : chars[i] === ' ' ? typeSpeed * 0.5 : typeSpeed + Math.random() * 8;
      await sleep(delay);
    }

    inputCol.innerHTML = esc(typed);
    setProgress(30);
    await sleep(500);

    phaseLabel.textContent = 'scanning...';
    phaseLabel.className = 'demo-phase-label scanning';
    scanline.classList.add('active');
    await sleep(400);

    const sortedEntities = [...entities].sort((a, b) => a.start - b.start);
    let inputChars = typed.split('');
    let highlighted = new Array(inputChars.length).fill(false);
    let entityCount = 0;
    const foundCategories = new Set();
    const t0 = performance.now();
    const isMobile = window.matchMedia('(max-width: 639px)').matches;
    if (isMobile) phaseLabel.textContent = 'redacting...';

    for (const entity of sortedEntities) {
      for (let i = entity.start; i < entity.end; i++) {
        highlighted[i] = true;
      }

      if (isMobile) {
        let inputHTML = '';
        let lastIdx = 0;
        const doneEntities = sortedEntities.slice(0, entityCount + 1);
        for (const e of doneEntities) {
          for (let i = lastIdx; i < e.start; i++) {
            inputHTML += esc(inputChars[i]);
          }
          inputHTML += '<span class="demo-entity-token">' + getRedactedToken(e) + '</span>';
          lastIdx = e.end;
        }
        for (let i = lastIdx; i < inputChars.length; i++) {
          inputHTML += esc(inputChars[i]);
        }
        inputCol.innerHTML = inputHTML;
      } else {
        let inputHTML = '';
        let inHighlight = false;
        for (let i = 0; i < inputChars.length; i++) {
          if (highlighted[i] && !inHighlight) {
            inputHTML += '<span class="demo-highlight-original">';
            inHighlight = true;
          } else if (!highlighted[i] && inHighlight) {
            inputHTML += '</span>';
            inHighlight = false;
          }
          inputHTML += esc(inputChars[i]);
        }
        if (inHighlight) inputHTML += '</span>';
        inputCol.innerHTML = inputHTML;

        let outStr = '';
        let lastIdx = 0;
        const doneEntities = sortedEntities.slice(0, entityCount + 1);
        for (const e of doneEntities) {
          outStr += esc(typed.substring(lastIdx, e.start));
          outStr += '<span class="demo-entity-token">' + getRedactedToken(e) + '</span>';
          lastIdx = e.end;
        }
        outStr += esc(typed.substring(lastIdx));
        outputCol.innerHTML = outStr;
        outputCol.scrollTop = outputCol.scrollHeight;
      }

      entityCount++;
      foundCategories.add(entity.type);
      statEntities.textContent = entityCount;
      statCategories.textContent = foundCategories.size;
      setProgress(30 + (entityCount / sortedEntities.length) * 60);
      await sleep(320 + Math.random() * 150);
    }

    const elapsed = (performance.now() - t0).toFixed(0);
    statTime.textContent = elapsed + 'ms';
    setProgress(95);

    phaseLabel.textContent = 'done';
    phaseLabel.className = 'demo-phase-label done';
    scanline.classList.remove('active');

    if (isMobile) {
      inputCol.querySelectorAll('.demo-entity-token').forEach((el, i) => {
        setTimeout(() => el.classList.add('flash'), i * 60);
      });
    } else {
      outputCol.querySelectorAll('.demo-entity-token').forEach((el, i) => {
        setTimeout(() => el.classList.add('flash'), i * 60);
      });
      inputCol.querySelectorAll('.demo-highlight-original').forEach((el, i) => {
        setTimeout(() => {
          el.classList.add('glitch');
          setTimeout(() => {
            el.classList.remove('glitch');
            el.classList.add('redacted');
          }, 300);
        }, i * 80);
      });
    }

    await sleep(500);
    setProgress(100);

    isPlaying = false;
    replayBtn.style.opacity = '1';
    replayBtn.style.pointerEvents = 'auto';
  }

  replayBtn.addEventListener('click', () => {
    if (animationId) clearTimeout(animationId);
    isPlaying = false;
    runDemo();
  });

  const demoObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      runDemo();
      demoObserver.disconnect();
    }
  }, { threshold: 0.25 });
  demoObserver.observe(document.querySelector('.demo-stage'));

  replayBtn.style.opacity = '0.4';
  replayBtn.style.pointerEvents = 'none';
})();

// === USE CASES TABS ===
const ucTabs = document.querySelectorAll('.uc-tab');
const ucPanels = document.querySelectorAll('.uc-panel');
ucTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    ucTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    ucPanels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const target = document.getElementById(`uc-${tab.dataset.uc}`);
    if (target) target.classList.add('active');
  });
});

// === EDIT MODE ===
(() => {
  const doc = document.getElementById('em-doc');
  const toast = document.getElementById('em-toast');
  const undoBtn = document.getElementById('em-undo-all');
  const exportTxt = document.getElementById('em-export-txt');
  const exportOrig = document.getElementById('em-export-orig');
  const actions = [
    document.getElementById('em-action-1'),
    document.getElementById('em-action-2'),
    document.getElementById('em-action-3')
  ];

  const entities = doc.querySelectorAll('.entity');
  let revealedCount = 0;
  let manualCount = 0;
  const completedActions = new Set();

  function updateUndoVisibility() {
    undoBtn.classList.toggle('hidden', revealedCount === 0 && manualCount === 0);
  }
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 2200);
  }
  function markAction(idx) {
    if (!completedActions.has(idx)) {
      completedActions.add(idx);
      actions[idx].classList.add('completed');
    }
  }

  entities.forEach(el => {
    const toggleReveal = () => {
      const entityVal = el.dataset.entity;
      const originalValue = el.dataset.value;
      if (el.classList.contains('revealed')) {
        el.textContent = `[${entityVal.toUpperCase()}]`;
        el.classList.remove('revealed');
        revealedCount--;
        updateUndoVisibility();
        showToast('Entity re-redacted');
        return;
      }
      const sameValueEls = doc.querySelectorAll(`.entity[data-entity="${entityVal}"]`);
      if (sameValueEls.length > 1) {
        sameValueEls.forEach(e => {
          if (!e.classList.contains('revealed')) {
            e.textContent = e.dataset.value;
            e.classList.add('revealed');
            revealedCount++;
          }
        });
        markAction(1);
        updateUndoVisibility();
        showToast(`All "${entityVal}" occurrences revealed`);
      } else {
        el.textContent = originalValue;
        el.classList.add('revealed');
        revealedCount++;
        updateUndoVisibility();
        showToast('Entity revealed');
      }
      markAction(0);
    };
    el.addEventListener('click', toggleReveal);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleReveal(); }
    });
  });

  const handleSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) return;
    const range = sel.getRangeAt(0);
    if (!doc.contains(range.commonAncestorContainer)) return;
    const selectedText = sel.toString().trim();
    if (selectedText.length < 2) return;
    const parentEntity = range.commonAncestorContainer.closest?.('.entity') || range.commonAncestorContainer.parentElement?.closest?.('.entity');
    if (parentEntity) return;
    const parentManual = range.commonAncestorContainer.closest?.('.manual-redact') || range.commonAncestorContainer.parentElement?.closest?.('.manual-redact');
    if (parentManual) return;

    const span = document.createElement('span');
    span.className = 'manual-redact';
    span.dataset.original = selectedText;
    span.textContent = '\u2588'.repeat(Math.min(selectedText.length, 20));
    span.title = 'Click to remove redaction';
    span.addEventListener('click', () => {
      const parent = span.parentNode;
      parent.replaceChild(document.createTextNode(span.dataset.original), span);
      parent.normalize();
      manualCount--;
      updateUndoVisibility();
      showToast('Manual redaction removed');
    });
    try {
      range.deleteContents();
      range.insertNode(span);
      sel.removeAllRanges();
      manualCount++;
      updateUndoVisibility();
      markAction(2);
      showToast('Manual redaction added');
    } catch(e) {}
  };
  doc.addEventListener('mouseup', handleSelection);
  doc.addEventListener('touchend', () => setTimeout(handleSelection, 100));

  undoBtn.addEventListener('click', () => {
    entities.forEach(el => {
      el.textContent = `[${el.dataset.entity.toUpperCase()}]`;
      el.classList.remove('revealed');
    });
    doc.querySelectorAll('.manual-redact').forEach(span => {
      const parent = span.parentNode;
      parent.replaceChild(document.createTextNode(span.dataset.original), span);
      parent.normalize();
    });
    revealedCount = 0;
    manualCount = 0;
    completedActions.clear();
    actions.forEach(a => a.classList.remove('completed'));
    updateUndoVisibility();
    showToast('All changes reverted');
  });

  exportTxt.addEventListener('click', () => {
    showToast(`Exported TXT — ${revealedCount} revealed, ${manualCount} manual`);
  });
  exportOrig.addEventListener('click', () => {
    showToast('Exported ZIP — original processed file, no review edits');
  });
})();

// === REDACTION STYLES INTERACTIVE ===
(() => {
  const select = document.getElementById('redaction-style-select');
  const output = document.getElementById('redact-output');
  if (!select || !output) return;

  const data = [
    { label: 'Name',  value: 'Sarah Chen' },
    { label: 'Email', value: 'sarah@acme.io' },
    { label: 'SSN',   value: '123-45-6789' },
    { label: 'Phone', value: '(415) 555-0192' },
    { label: 'Card',  value: '4532-9148-0231-6574' },
  ];

  function simpleHash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    return ('00000000' + (h >>> 0).toString(16)).slice(-8);
  }

  function render() {
    const style = select.value;
    output.innerHTML = data.map(d => {
      let redacted;
      if (style === 'mask') {
        redacted = `<span class="masked-char">${'\u2588'.repeat(d.value.length)}</span>`;
      } else if (style === 'hash') {
        redacted = `<span class="hashed">${simpleHash(d.value)}</span>`;
      } else {
        redacted = `<span class="token">[${d.label.toUpperCase()}]</span>`;
      }
      return `<div>${d.label}: ${redacted}</div>`;
    }).join('');
  }

  select.addEventListener('change', render);
  render();
})();
