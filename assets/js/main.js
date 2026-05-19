document.addEventListener('DOMContentLoaded', function () {

  const header = document.getElementById('mainHeader');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  });

  // MOBILE MENU TOGGLE
  window.toggleMenu = function () {
    document.getElementById('mobileMenu').classList.toggle('open');
    document.getElementById('menuBackdrop').classList.toggle('open');
    document.body.style.overflow =
      document.getElementById('mobileMenu').classList.contains('open') ? 'hidden' : '';
  };

  // SCROLL ANIMATIONS — skip anything inside .hero-slider
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-up, .fade-in').forEach(el => {
    if (!el.closest('.hero-slider')) {
      observer.observe(el);
    }
  });

  // COUNTER ANIMATION
  function animateCounter(el) {
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix === '%' ? '%' : '+';
    let start = 0;
    const duration = 1800;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = Math.floor(start) + suffix;
      if (start >= target) clearInterval(timer);
    }, 16);
  }
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        counterObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num[data-target]').forEach(el => counterObs.observe(el));


  // TESTIMONIAL SLIDER
  let testiCurrent = 0;
  const testiTrack = document.getElementById('testiTrack');
  const testiDots = document.querySelectorAll('.testi-dot');

  function getSlideWidth() {
    const w = window.innerWidth;
    if (w <= 768) return 100;
    if (w <= 900) return 50;
    return 33.333;
  }

  function goTesti(n) {
    testiCurrent = n;
    const pct = n * getSlideWidth();
    testiTrack.style.transform = `translateX(-${pct}%)`;
    testiDots.forEach((d, i) => d.classList.toggle('active', i === n));
  }

  setInterval(() => {
    const max = testiDots.length - 1;
    goTesti(testiCurrent >= max ? 0 : testiCurrent + 1);
  }, 4000);

  window.addEventListener('resize', () => goTesti(testiCurrent));

  // TOUCH SWIPE FOR TESTIMONIALS
  let touchX = 0;
  testiTrack.addEventListener('touchstart', e => {
    touchX = e.touches[0].clientX;
  }, { passive: true });

  testiTrack.addEventListener('touchend', e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      const max = testiDots.length - 1;
      if (diff > 0) goTesti(Math.min(testiCurrent + 1, max));
      else goTesti(Math.max(testiCurrent - 1, 0));
    }
  }, { passive: true });
  // CONSULTATION FORM
  window.openConsultForm = function () {
    document.getElementById('consultOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  window.closeConsultForm = function () {
    document.getElementById('consultOverlay').classList.remove('active');
    document.body.style.overflow = '';
  };
  window.handleOverlayClick = function (e) {
    if (e.target === document.getElementById('consultOverlay')) {
      window.closeConsultForm();
    }
  };
  window.submitConsultForm = function () {
    const name = document.getElementById('cName').value.trim();
    const email = document.getElementById('cEmail').value.trim();
    const phone = document.getElementById('cPhone').value.trim();
    const need = document.getElementById('cNeed').value;
    if (!name || !email || !phone || !need) {
      alert('Please fill in all required fields.');
      return;
    }
    const btn = document.querySelector('.consult-submit');
    btn.innerHTML = '<i class="fas fa-check"></i> Submitted! We\'ll contact you soon.';
    btn.style.background = '#16a34a';
    btn.disabled = true;
    setTimeout(() => {
      window.closeConsultForm();
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Book My Free Consultation';
      btn.style.background = '';
      btn.disabled = false;
      ['cName', 'cEmail', 'cPhone', 'cCompany', 'cNeed', 'cMessage'].forEach(id => {
        document.getElementById(id).value = '';
      });
    }, 2800);
  };

  // CLOSE CONSULTATION ON ESCAPE
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeConsultForm();
  });
  // INDUSTRIES CAROUSEL
  // INDUSTRIES CAROUSEL — fixed responsive version
  (function () {
    const track = document.getElementById('indTrack');
    const dotsContainer = document.getElementById('indDots');
    const cards = document.querySelectorAll('.ind-card');
    const viewport = track.parentElement; // .ind-carousel-viewport
    let current = 0;
    let autoTimer;
    /* How many cards are visible at this viewport width */
    function getVisible() {
      const w = window.innerWidth;
      if (w <= 560) return 1;
      if (w <= 900) return 2;
      return 3;
    }
    /* Total number of "pages" we can scroll to */
    function totalSlides() {
      return Math.max(1, cards.length - getVisible() + 1);
    }
    /*
      ─── KEY FIX ───────────────────────────────────────────────────
      Instead of reading offsetWidth (unreliable mid-transition),
      derive the card width from the VIEWPORT width and the gap.
      This matches the CSS:
        flex: 0 0 calc((100% - (visible-1)*20px) / visible)
    */
    function cardStep() {
      const visible = getVisible();
      const gap = 20;                                   // must match CSS gap
      const vpWidth = viewport.getBoundingClientRect().width;
      const cardWidth = (vpWidth - gap * (visible - 1)) / visible;
      return cardWidth + gap;   // distance to shift per slide
    }

    /* ── Dots ──────────────────────────────────────────────────── */
    function buildDots() {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < totalSlides(); i++) {
        const d = document.createElement('button');
        d.className = 'ind-dot' + (i === current ? ' active' : '');
        d.setAttribute('aria-label', `Slide ${i + 1}`);
        d.onclick = () => { goTo(i); resetAuto(); };
        dotsContainer.appendChild(d);
      }
    }

    function updateDots() {
      document.querySelectorAll('.ind-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    /* ── Go-to ─────────────────────────────────────────────────── */
    function goTo(n) {
      const max = totalSlides() - 1;
      current = Math.max(0, Math.min(n, max));
      track.style.transform = `translateX(-${current * cardStep()}px)`;
      updateDots();
    }

    /* ── Public slide function (called by arrow buttons) ───────── */
    window.indSlide = function (dir) {
      const max = totalSlides() - 1;
      const next = current + dir;
      goTo(next < 0 ? max : next > max ? 0 : next);
      resetAuto();
    };

    /* ── Auto-play ─────────────────────────────────────────────── */
    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => {
        const max = totalSlides() - 1;
        goTo(current >= max ? 0 : current + 1);
      }, 3500);
    }

    /* ── Touch / swipe ─────────────────────────────────────────── */
    let tx = 0;
    track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = tx - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) indSlide(diff > 0 ? 1 : -1);
    }, { passive: true });

    /* ── Resize: rebuild dots and reset to slide 0 ─────────────── */
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        current = 0;
        buildDots();
        goTo(0);
      }, 150);   // debounce so we don't thrash on every pixel
    });

    /* ── Init ──────────────────────────────────────────────────── */
    buildDots();
    goTo(0);
    resetAuto();
  })();

  // ══════════════════════════════════════════════════════
  // HERO SLIDER — Clean letter-by-letter typewriter
  // ══════════════════════════════════════════════════════
  (function () {
    const track = document.getElementById('hsTrack');
    const dots = document.querySelectorAll('.hs-dot');
    const prevBtn = document.getElementById('hsPrev');
    const nextBtn = document.getElementById('hsNext');

    if (!track) return;

    const TOTAL = 3;
    const AUTO_DELAY = 6000;  // 6s per slide (gives typewriter time to finish)
    const TYPE_SPEED = 50;    // ms between each letter appearing
    let current = 0;
    let autoTimer = null;
    let isHovered = false;
    let typeTimeout = null;

    const slides = track.querySelectorAll('.hs-slide');

    // ── Step 1: Pre-process each slide's h1 into letter spans ──
    // We do this ONCE on init. Each letter becomes:
    //   <span class="hs-char hs-char--teal"> for span-colored letters
    //   <span class="hs-char"> for normal letters
    //   <br> stays as <br>
    // All chars start hidden (opacity:0), typewriter reveals them one by one.

    slides.forEach(slide => {
      const h1 = slide.querySelector('.hs-title');
      if (!h1) return;

      const raw = h1.innerHTML;  // e.g. "Connecting The Best <span>Employers</span>"

      // Parse into tokens: { type: 'char'|'br', char, teal }
      const tokens = [];
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = raw;

      function parseNode(node, isTeal) {
        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent.split('').forEach(ch => {
            tokens.push({ type: 'char', ch, teal: isTeal });
          });
        } else if (node.nodeName === 'BR') {
          tokens.push({ type: 'br' });
        } else if (node.nodeName === 'SPAN') {
          node.childNodes.forEach(child => parseNode(child, true));
        } else {
          node.childNodes.forEach(child => parseNode(child, isTeal));
        }
      }
      tempDiv.childNodes.forEach(node => parseNode(node, false));
      // Rebuild h1 with individual letter spans, all hidden initially
      let newHTML = '';
      tokens.forEach((token, i) => {
        if (token.type === 'br') {
          newHTML += '<br>';
        } else {
          const cls = token.teal ? 'hs-char hs-char--teal' : 'hs-char';
          const ch = token.ch === ' ' ? '&nbsp;' : token.ch;
          newHTML += `<span class="${cls}" data-i="${i}" style="opacity:0;display:inline-block;transition:opacity 0.08s ease;">${ch}</span>`;
        }
      });
      h1.innerHTML = newHTML;
    });
    // ── Step 2: Typewriter — reveal letters one by one ──
    function runTypewriter(slideIndex) {
      // Clear any pending typewriter
      if (typeTimeout) { clearTimeout(typeTimeout); typeTimeout = null; }
      const slide = slides[slideIndex];
      if (!slide) return;
      const chars = slide.querySelectorAll('.hs-char');
      // Hide all chars first
      chars.forEach(c => { c.style.opacity = '0'; });

      // Reveal each char after a delay
      chars.forEach((c, i) => {
        typeTimeout = setTimeout(() => {
          c.style.opacity = '1';
        }, i * TYPE_SPEED);
      });
    }
    // ── Step 3: Go-to slide ──────────────────────────────
    function goTo(n) {
      current = ((n % TOTAL) + TOTAL) % TOTAL;
      track.style.transform = `translateX(-${current * (100 / 3)}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
      runTypewriter(current);
    }
    // ── Auto scroll ──────────────────────────────────────
    function startAuto() {
      stopAuto();
      autoTimer = setInterval(() => {
        if (!isHovered) goTo(current + 1);
      }, AUTO_DELAY);
    }
    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }
    // ── Arrows ───────────────────────────────────────────
    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });
    // ── Dots ─────────────────────────────────────────────
    dots.forEach(d => {
      d.addEventListener('click', () => { goTo(+d.dataset.index); startAuto(); });
    });
    // ── Hover pause ──────────────────────────────────────
    track.addEventListener('mouseenter', () => { isHovered = true; });
    track.addEventListener('mouseleave', () => { isHovered = false; });
    // ── Touch swipe ──────────────────────────────────────
    let touchStartX = 0;
    track.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      isHovered = true;
    }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      isHovered = false;
      if (Math.abs(diff) > 50) { goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
    }, { passive: true });
    // ── Tab visibility ───────────────────────────────────
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAuto(); else startAuto();
    });
    // ── Init ─────────────────────────────────────────────
    goTo(0);
    startAuto();
  })();
  document.getElementById("year").innerHTML =
    new Date().getFullYear();



  // SERVICES CAROUSEL
  (function () {
    const track = document.getElementById('svcTrack');
    const dotsContainer = document.getElementById('svcDots');
    if (!track || !dotsContainer) return;

    const cards = track.querySelectorAll('.service-card');
    const viewport = track.parentElement;
    const GAP = 24;
    let current = 0;
    let autoTimer;

    function getVisible() {
      const w = window.innerWidth;
      if (w <= 580) return 1;
      if (w <= 900) return 2;
      return 3;
    }

    function totalSlides() {
      return Math.max(1, cards.length - getVisible() + 1);
    }

    function setCardWidths() {
      const visible = getVisible();
      const vpWidth = viewport.getBoundingClientRect().width;
      const cardWidth = (vpWidth - GAP * (visible - 1)) / visible;
      cards.forEach(c => { c.style.width = cardWidth + 'px'; });
      return cardWidth;
    }

    function cardStep() {
      const visible = getVisible();
      const vpWidth = viewport.getBoundingClientRect().width;
      const cardWidth = (vpWidth - GAP * (visible - 1)) / visible;
      return cardWidth + GAP;
    }

    function buildDots() {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < totalSlides(); i++) {
        const d = document.createElement('button');
        d.className = 'svc-dot' + (i === current ? ' active' : '');
        d.setAttribute('aria-label', `Slide ${i + 1}`);
        d.addEventListener('click', () => { goTo(i); resetAuto(); });
        dotsContainer.appendChild(d);
      }
    }

    function updateDots() {
      dotsContainer.querySelectorAll('.svc-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    function goTo(n) {
      const max = totalSlides() - 1;
      current = Math.max(0, Math.min(n, max));
      track.style.transform = `translateX(-${current * cardStep()}px)`;
      updateDots();
    }

    window.svcSlide = function (dir) {
      const max = totalSlides() - 1;
      const next = current + dir;
      goTo(next < 0 ? max : next > max ? 0 : next);
      resetAuto();
    };

    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => {
        const max = totalSlides() - 1;
        goTo(current >= max ? 0 : current + 1);
      }, 4000);
    }

    // Touch swipe
    let tx = 0;
    track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = tx - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) svcSlide(diff > 0 ? 1 : -1);
    }, { passive: true });

    // Resize: rebuild
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        current = 0;
        setCardWidths();
        buildDots();
        goTo(0);
      }, 150);
    });

    // Init
    setCardWidths();
    buildDots();
    goTo(0);
    resetAuto();
  })();
}); // END DOMContentLoaded