document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     1. MOBILE NAVIGATION
     ========================================================= */
  const burger = document.querySelector('.nav-burger');
  const links  = document.querySelector('.nav-links');

  if (burger && links) {
    burger.addEventListener('click', () => {
      links.classList.toggle('open');
      burger.setAttribute('aria-expanded', links.classList.contains('open'));
    });
  }

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (links && links.classList.contains('open')) {
        links.classList.remove('open');
        if (burger) burger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* =========================================================
     2. FOOTER YEAR
     ========================================================= */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =========================================================
     3. NAV SCROLL SHADOW (rAF throttled, writes only on change)
     ========================================================= */
  const nav = document.querySelector('.nav');
  if (nav) {
    let isScrolled = null;
    let navRaf = null;

    const applyNav = () => {
      navRaf = null;
      const next = window.scrollY > 20;
      if (next === isScrolled) return;   // no redundant style writes
      isScrolled = next;
      nav.style.boxShadow = next ? '0 4px 30px rgba(15,14,42,0.06)' : 'none';
      nav.style.background = next ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.72)';
    };

    window.addEventListener('scroll', () => {
      if (navRaf) return;
      navRaf = requestAnimationFrame(applyNav);
    }, { passive: true });

    applyNav();
  }

  /* =========================================================
     4. SCROLL REVEAL ANIMATIONS
     Stagger is per intersection batch (max ~0.3s), NOT per page
     index — previously late sections waited 4-6s before fading in.
     ========================================================= */
  const revealTargets = document.querySelectorAll(
    '.bento-card, .ai-card, .expertise-card, .industry-card, .engagement-step, ' +
    '.why-item, .section-head, .hero-metrics, .expertise-head, .expertise-group-head, ' +
    '.expertise-cta, .proof-card, .faq-item, .stance-list li, .contact-form-card'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      let batchIndex = 0;

      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;

        el.style.transitionDelay = `${Math.min(batchIndex, 5) * 0.06}s`;
        batchIndex++;

        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        observer.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    revealTargets.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(32px)';
      el.style.transition =
        'opacity 0.6s cubic-bezier(0.4,0,0.2,1), ' +
        'transform 0.6s cubic-bezier(0.4,0,0.2,1)';
      observer.observe(el);
    });
  }

  /* =========================================================
     5. SMOOTH ANCHOR SCROLLING
     ========================================================= */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* =========================================================
     6. HERO DASHBOARD PARALLAX
     Cached nodes + rAF throttle. Mesh parallax removed — it was
     overriding the CSS `float` animation on .mesh, causing the
     browser to re-rasterise large blurred layers on every move.
     ========================================================= */
  const hero = document.querySelector('.hero');
  if (hero && window.matchMedia('(min-width: 900px)').matches) {
    const dashboard = document.querySelector('.dashboard-frame');

    if (dashboard) {
      let px = 0;
      let py = 0;
      let tiltRaf = null;

      hero.addEventListener('mousemove', (e) => {
        px = (e.clientX / window.innerWidth - 0.5) * 20;
        py = (e.clientY / window.innerHeight - 0.5) * 20;

        if (tiltRaf) return;
        tiltRaf = requestAnimationFrame(() => {
          tiltRaf = null;
          dashboard.style.transform =
            `perspective(1400px) rotateY(${-7 + px * 0.2}deg) rotateX(${4 - py * 0.2}deg)`;
        });
      }, { passive: true });
    }
  }

  /* =========================================================
     7. FORM SUBMISSION (CLIENT)
     ========================================================= */
  const leadForm = document.getElementById('leadForm');
  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = leadForm.querySelector('.btn-send');
      const status = leadForm.querySelector('.form-status');

      if (!leadForm.checkValidity()) {
        leadForm.reportValidity();
        return;
      }

      const originalBtnHTML = btn.innerHTML;
      btn.innerHTML = 'Sending...';
      btn.disabled = true;
      if (status) status.textContent = '';

      setTimeout(() => {
        if (status) {
          status.textContent = "Thank you! We'll be in touch within 1 business day.";
          status.style.color = 'var(--brand)';
        }
        leadForm.reset();
        btn.innerHTML = originalBtnHTML;
        btn.disabled = false;
      }, 1200);
    });
  }

  /* =========================================================
     8. FORM SUBMISSION (JOBSEEKER)
     ========================================================= */
  const careersForm = document.getElementById('careersForm');
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('resume');
  const fileNameDisplay = document.getElementById('fileName');

  if (careersForm) {
    if (uploadZone && fileInput) {
      uploadZone.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          fileNameDisplay.textContent = `Selected: ${file.name}`;
          uploadZone.style.borderColor = 'var(--brand)';
          uploadZone.style.background = 'rgba(79,70,229,0.04)';
        }
      });
    }

    careersForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = careersForm.querySelector('.btn-send');
      const status = careersForm.querySelector('.form-status');

      if (!careersForm.checkValidity()) {
        careersForm.reportValidity();
        return;
      }

      const originalBtnHTML = btn.innerHTML;
      btn.innerHTML = 'Submitting...';
      btn.disabled = true;
      if (status) status.textContent = '';

      setTimeout(() => {
        if (status) {
          status.textContent = "Application received! We'll review your profile and contact you if there's a fit.";
          status.style.color = 'var(--brand)';
        }
        careersForm.reset();
        if (fileNameDisplay) fileNameDisplay.textContent = '';
        if (uploadZone) {
          uploadZone.style.borderColor = '';
          uploadZone.style.background = '';
        }
        btn.innerHTML = originalBtnHTML;
        btn.disabled = false;
      }, 1500);
    });
  }
});