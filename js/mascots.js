// =========================================================
// ElevateNow — Mascot Interactions
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  const mascots = document.querySelectorAll('.mascot');
  if (!mascots.length) return;

  /* =========================================================
     EYES FOLLOW CURSOR
     All DOM lookups and geometry reads are cached. Geometry is
     re-measured only on scroll/resize (rAF-throttled via a dirty
     flag), never inside the mousemove loop.
     ========================================================= */
  const groups = [];

  mascots.forEach(m => {
    const svg = m.querySelector('svg');
    if (!svg) return;

    const pupils = [];
    m.querySelectorAll('.mascot-eyes').forEach(group => {
      const ps = group.querySelectorAll('.pupil');
      const gs = group.querySelectorAll('.glint');

      [...ps].forEach((pupil, i) => {
        pupils.push({
          pupil,
          glint: gs[i] || null,
          cx: parseFloat(pupil.getAttribute('cx')) || 0,
          cy: parseFloat(pupil.getAttribute('cy')) || 0
        });
      });
    });

    if (pupils.length) {
      groups.push({
        mascot: m,
        svg,
        pupils,
        rect: null,
        svgRect: null,
        vb: null,
        visible: false
      });
    }
  });

  const MAX_OFFSET = 4;

  let geometryDirty = true;
  let pointerX = 0;
  let pointerY = 0;
  let eyeRaf = null;

  function measure() {
    const vh = window.innerHeight;

    for (const g of groups) {
      g.rect = g.mascot.getBoundingClientRect();
      g.visible = !(g.rect.bottom < -200 || g.rect.top > vh + 200);

      if (!g.visible) continue;

      g.vb = g.svg.viewBox.baseVal;
      g.svgRect = g.svg.getBoundingClientRect();
    }

    geometryDirty = false;
  }

  function applyEyes() {
    eyeRaf = null;
    if (geometryDirty) measure();

    for (const g of groups) {
      if (!g.visible) continue;

      const vb = g.vb;
      if (!vb || !vb.width || !vb.height) continue;

      const scaleX = g.svgRect.width / vb.width;
      const scaleY = g.svgRect.height / vb.height;

      for (const e of g.pupils) {
        const eyeX = g.svgRect.left + e.cx * scaleX;
        const eyeY = g.svgRect.top + e.cy * scaleY;

        const dx = pointerX - eyeX;
        const dy = pointerY - eyeY;
        const dist = Math.hypot(dx, dy) || 1;
        const strength = Math.min(dist / 150, 1);

        const offsetX = (dx / dist) * MAX_OFFSET * strength;
        const offsetY = (dy / dist) * MAX_OFFSET * strength;

        e.pupil.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        if (e.glint) {
          e.glint.style.transform =
            `translate(${offsetX * 0.6}px, ${offsetY * 0.6}px)`;
        }
      }
    }
  }

  if (groups.length) {
    document.addEventListener('mousemove', (e) => {
      pointerX = e.clientX;
      pointerY = e.clientY;

      if (eyeRaf) return;
      eyeRaf = requestAnimationFrame(applyEyes);
    }, { passive: true });

    const invalidate = () => { geometryDirty = true; };

    window.addEventListener('scroll', invalidate, { passive: true });
    window.addEventListener('resize', invalidate);
    window.addEventListener('orientationchange', invalidate);
  }

  /* =========================================================
     CLICK REACTION (Exclude Nova)
     ========================================================= */
  mascots.forEach(m => {
    if (m.classList.contains('mascot-nova')) return;

    m.style.pointerEvents = 'auto';
    m.style.cursor = 'pointer';

    m.addEventListener('click', () => {
      m.classList.remove('clicked');
      void m.offsetWidth;
      m.classList.add('clicked');
      m.classList.add('bubble-show');
      setTimeout(() => m.classList.remove('bubble-show'), 2500);
      setTimeout(() => m.classList.remove('clicked'), 700);
    });
  });

  /* =========================================================
     HOVER WAVE FOR PIXEL
     ========================================================= */
  const pixel = document.querySelector('.mascot-pixel');
  if (pixel) {
    pixel.addEventListener('mouseenter', () => pixel.classList.add('waving'));
    pixel.addEventListener('mouseleave', () => pixel.classList.remove('waving'));
  }

  /* =========================================================
     HERO MASCOT AUTO-SHOW BUBBLE
     ========================================================= */
  const nova = document.querySelector('.mascot-nova');
  if (nova) {
    setTimeout(() => {
      if (nova.classList.contains('chat-active')) return;
      nova.classList.add('bubble-show');
      setTimeout(() => nova.classList.remove('bubble-show'), 4000);
    }, 1500);
  }

  /* =========================================================
     REDUCED MOTION
     ========================================================= */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.mascot svg').forEach(svg => {
      svg.style.animation = 'none';
    });

    groups.forEach(g => {
      g.pupils.forEach(({ pupil }) => {
        pupil.style.transition = 'none';
      });
    });
  }

  /* =========================================================
     NOVA CHAT PANEL
     ========================================================= */
  const novaChat      = document.getElementById('novaChat');
  const novaChatClose = document.getElementById('novaChatClose');
  const novaMessages  = document.getElementById('novaChatMessages');
  const novaQuestions = document.getElementById('novaChatQuestions');
  const novaQuestionButtons = novaQuestions
    ? novaQuestions.querySelectorAll('button')
    : [];

  const novaAnswers = {
    about: {
      text: "We're a 100% pure-play ServiceNow consultancy. Senior-only teams, AI-led delivery, and outcome-anchored scoping.",
      scrollTo: '#services'
    },
    ai: {
      text: "We build the data foundation first, then automate with Agentic AI workflows. Useful AI, not AI theater.",
      scrollTo: '#ai'
    },
    industries: {
      text: "We serve BFSI, Healthcare, Manufacturing, Technology, Telecom, and Public Sector. Each with sector-specific module playbooks.",
      scrollTo: '#industries'
    },
    start: {
      text: "Book a 30-minute discovery call. No obligation, no sales pitch — just a conversation about what you're trying to solve.",
      scrollTo: '#contact'
    }
  };

  function openNovaChat() {
    if (!novaChat) return;
    novaChat.hidden = false;
    novaChat.removeAttribute('inert');

    if (nova) {
      nova.classList.add('chat-active');
      nova.setAttribute('aria-expanded', 'true');
      nova.setAttribute('aria-label', 'Close Nova quick answers');
    }

    const firstBtn = novaQuestions ? novaQuestions.querySelector('button') : null;
    if (firstBtn) firstBtn.focus({ preventScroll: true });
    else if (novaChatClose) novaChatClose.focus({ preventScroll: true });
  }

  function closeNovaChat() {
    if (!novaChat) return;
    novaChat.hidden = true;
    novaChat.setAttribute('inert', '');

    if (nova) {
      nova.classList.remove('chat-active');
      nova.setAttribute('aria-expanded', 'false');
      nova.setAttribute('aria-label', 'Open Nova quick answers');
      nova.focus({ preventScroll: true });
    }
  }

  function appendNovaMessage(text, sender) {
    if (!novaMessages) return;

    const msg = document.createElement('div');
    msg.className = `nova-msg nova-msg-${sender}`;
    msg.textContent = text;
    novaMessages.appendChild(msg);

    const body = novaMessages.parentElement;
    if (body) body.scrollTop = body.scrollHeight;
  }

  if (nova && novaChat) {
    nova.addEventListener('click', (e) => {
      e.stopPropagation();
      if (novaChat.hidden) openNovaChat();
      else closeNovaChat();
    });
  }

  if (novaChatClose) {
    novaChatClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeNovaChat();
    });
  }

  novaQuestionButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();

      const key = btn.dataset.q;
      const answer = novaAnswers[key];
      if (!answer) return;

      appendNovaMessage(btn.textContent, 'user');

      setTimeout(() => {
        appendNovaMessage(answer.text, 'bot');

        if (answer.scrollTo) {
          setTimeout(() => {
            const target = document.querySelector(answer.scrollTo);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            setTimeout(closeNovaChat, 800);
          }, 1200);
        }
      }, 500);
    });
  });

  document.addEventListener('click', (e) => {
    if (!novaChat || novaChat.hidden) return;
    if (!novaChat.contains(e.target) && nova && !nova.contains(e.target)) {
      closeNovaChat();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && novaChat && !novaChat.hidden) {
      closeNovaChat();
    }
  });
});