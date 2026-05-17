// === ANIMATED BACKGROUND ===
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, particles = [], mouse = { x: 0, y: 0 };

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Track mouse for parallax
  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Create particles
  const PARTICLE_COUNT = Math.min(80, Math.floor(window.innerWidth / 20));
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.3 + 0.05
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const alpha = (1 - dist / 150) * 0.06;
          ctx.strokeStyle = `rgba(129, 220, 198, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw and update particles
    for (const p of particles) {
      // Subtle mouse repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        const force = (200 - dist) / 200 * 0.02;
        p.vx += dx / dist * force;
        p.vy += dy / dist * force;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Damping
      p.vx *= 0.99;
      p.vy *= 0.99;

      // Bounds
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

// === SCROLL REVEAL ===
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

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
  let stopped = false;

  function typeLine() {
    if (stopped) return;
    const lines = examples[currentExample];
    if (lineIndex >= lines.length) {
      // Finished this example — pause then loop
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
        currentSpan = { label: labelSpan, extra: extraSpan, line };
      } else if (line.type === 'cmd') {
        const promptSpan = document.createElement('span');
        promptSpan.className = 'prompt';
        promptSpan.textContent = '$ ';
        div.appendChild(promptSpan);
        const cmdSpan = document.createElement('span');
        cmdSpan.className = 'cmd';
        div.appendChild(cmdSpan);
        currentSpan = { label: cmdSpan, line };
      } else {
        const span = document.createElement('span');
        span.className = line.type;
        div.appendChild(span);
        currentSpan = { label: span, line };
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

  // Start when hero is visible
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

    // Reset
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

    // Phase 1: Type input text character by character
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

    // Phase 2: Scanning
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
      // Highlight in input
      for (let i = entity.start; i < entity.end; i++) {
        highlighted[i] = true;
      }

      if (isMobile) {
        // Mobile: in-place redaction — replace entity text with token in the input column
        let inputHTML = '';
        let lastIdx = 0;
        const doneEntities = sortedEntities.slice(0, entityCount + 1);
        for (const e of doneEntities) {
          // Text before this entity
          for (let i = lastIdx; i < e.start; i++) {
            inputHTML += esc(inputChars[i]);
          }
          // Redacted token
          inputHTML += '<span class="demo-entity-token">' + getRedactedToken(e) + '</span>';
          lastIdx = e.end;
        }
        // Remaining text after last entity
        for (let i = lastIdx; i < inputChars.length; i++) {
          inputHTML += esc(inputChars[i]);
        }
        inputCol.innerHTML = inputHTML;
      } else {
        // Desktop: highlight in input, build output
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

    // Phase 3: Done — flash tokens
    phaseLabel.textContent = 'done';
    phaseLabel.className = 'demo-phase-label done';
    scanline.classList.remove('active');

    if (isMobile) {
      // Mobile: flash all tokens in-place
      inputCol.querySelectorAll('.demo-entity-token').forEach((el, i) => {
        setTimeout(() => el.classList.add('flash'), i * 60);
      });
    } else {
      // Desktop: flash output tokens + glitch input highlights
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

  // Replay button visibility
  replayBtn.style.opacity = '0.4';
  replayBtn.style.pointerEvents = 'none';
})();

/* === USE CASES TABS === */
(() => {
  const tabs = document.querySelectorAll('.uc-tab');
  const panels = document.querySelectorAll('.uc-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.uc;
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById('uc-' + target);
      if (panel) panel.classList.add('active');
    });
  });
})();

/* === EDIT MODE === */
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

  // 1. Click entity token to reveal original value
  entities.forEach(el => {
    const toggleReveal = () => {
      const entityVal = el.dataset.entity;
      const originalValue = el.dataset.value;

      if (el.classList.contains('revealed')) {
        // Re-redact: show token again
        el.textContent = `[${entityVal.toUpperCase()}]`;
        el.classList.remove('revealed');
        revealedCount--;
        updateUndoVisibility();
        showToast('Entity re-redacted');
        return;
      }

      // Reveal by value: find all entities with same data-entity
      const sameValueEls = doc.querySelectorAll(`.entity[data-entity="${entityVal}"]`);
      if (sameValueEls.length > 1) {
        sameValueEls.forEach(e => {
          if (!e.classList.contains('revealed')) {
            e.textContent = e.dataset.value;
            e.classList.add('revealed');
            revealedCount++;
          }
        });
        markAction(1); // reveal by value
        updateUndoVisibility();
        showToast(`All "${entityVal}" occurrences revealed`);
      } else {
        el.textContent = originalValue;
        el.classList.add('revealed');
        revealedCount++;
        updateUndoVisibility();
        showToast('Entity revealed');
      }
      markAction(0); // review detection
    };
    el.addEventListener('click', toggleReveal);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleReveal();
      }
    });
  });

  // 2. Manual redaction via text selection — hides selected text
  const handleSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) return;

    const range = sel.getRangeAt(0);
    if (!doc.contains(range.commonAncestorContainer)) return;

    const selectedText = sel.toString().trim();
    if (selectedText.length < 2) return;

    // Don't allow selecting across entities
    const parentEntity = range.commonAncestorContainer.closest?.('.entity') || range.commonAncestorContainer.parentElement?.closest?.('.entity');
    if (parentEntity) return;

    // Don't allow selecting across manual-redact
    const parentManual = range.commonAncestorContainer.closest?.('.manual-redact') || range.commonAncestorContainer.parentElement?.closest?.('.manual-redact');
    if (parentManual) return;

    // Create redacted span — text is hidden, blocks shown
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
      markAction(2); // manual redaction
      showToast('Manual redaction added');
    } catch(e) {}
  };
  doc.addEventListener('mouseup', handleSelection);
  doc.addEventListener('touchend', () => setTimeout(handleSelection, 100));

  // Undo All
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

  // Export buttons
  exportTxt.addEventListener('click', () => {
    showToast(`Exported TXT — ${revealedCount} revealed, ${manualCount} manual`);
  });
  exportOrig.addEventListener('click', () => {
    showToast('Exported ZIP — original processed file, no review edits');
  });
})();

/* === REDACTION STYLES INTERACTIVE === */
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
