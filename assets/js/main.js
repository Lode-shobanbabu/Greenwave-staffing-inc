document.addEventListener('DOMContentLoaded', function () {

  // HEADER SCROLL
  const header = document.getElementById('mainHeader');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 30);
    });
  }

  // MOBILE MENU TOGGLE
  window.toggleMenu = function () {
    const menu = document.getElementById('mobileMenu');
    const backdrop = document.getElementById('menuBackdrop');
    if (!menu || !backdrop) return;
    menu.classList.toggle('open');
    backdrop.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
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

  // YEAR
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.innerHTML = new Date().getFullYear();

  // CONSULTATION FORM
  window.openConsultForm = function () {
    const overlay = document.getElementById('consultOverlay');
    if (!overlay) return;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  window.closeConsultForm = function () {
    const overlay = document.getElementById('consultOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
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
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
    }, 2800);
  };

  // CLOSE CONSULTATION ON ESCAPE
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeConsultForm();
  });

  // FAQ ACCORDION (service detail pages)
  document.querySelectorAll('.sd-faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.sd-faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.sd-faq-item').forEach(el => el.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // TESTIMONIAL SLIDER
 // TESTIMONIAL SLIDER
  const testiTrack = document.getElementById('testiTrack');
  const testiDots = document.querySelectorAll('.testi-dot');

  if (testiTrack) {
    let testiCurrent = 0;

    function getSlideWidth() {
      const w = window.innerWidth;
      if (w <= 768) return 100;
      if (w <= 900) return 50;
      return 33.333;
    }

    window.goTesti = function (n) {       // ← only this line changed
      testiCurrent = n;
      const pct = n * getSlideWidth();
      testiTrack.style.transform = `translateX(-${pct}%)`;
      testiDots.forEach((d, i) => d.classList.toggle('active', i === n));
    };

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
  }

  // INDUSTRIES CAROUSEL
  (function () {
    const track = document.getElementById('indTrack');
    if (!track) return;

    const dotsContainer = document.getElementById('indDots');
    const cards = document.querySelectorAll('.ind-card');
    const viewport = track.parentElement;
    let current = 0;
    let autoTimer;

    function getVisible() {
      const w = window.innerWidth;
      if (w <= 560) return 1;
      if (w <= 900) return 2;
      return 3;
    }

    function totalSlides() {
      return Math.max(1, cards.length - getVisible() + 1);
    }

    function cardStep() {
      const visible = getVisible();
      const gap = 20;
      const vpWidth = viewport.getBoundingClientRect().width;
      const cardWidth = (vpWidth - gap * (visible - 1)) / visible;
      return cardWidth + gap;
    }

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

    function goTo(n) {
      const max = totalSlides() - 1;
      current = Math.max(0, Math.min(n, max));
      track.style.transform = `translateX(-${current * cardStep()}px)`;
      updateDots();
    }

    window.indSlide = function (dir) {
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
      }, 3500);
    }

    let tx = 0;
    track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = tx - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) indSlide(diff > 0 ? 1 : -1);
    }, { passive: true });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        current = 0;
        buildDots();
        goTo(0);
      }, 150);
    });

    buildDots();
    goTo(0);
    resetAuto();
  })();

  // HERO SLIDER
  (function () {
    const track = document.getElementById('hsTrack');
    if (!track) return;

    const dots = document.querySelectorAll('.hs-dot');
    const prevBtn = document.getElementById('hsPrev');
    const nextBtn = document.getElementById('hsNext');

    const TOTAL = 3;
    const AUTO_DELAY = 6000;
    const TYPE_SPEED = 50;
    let current = 0;
    let autoTimer = null;
    let isHovered = false;
    let typeTimeout = null;

    const slides = track.querySelectorAll('.hs-slide');

    slides.forEach(slide => {
      const h1 = slide.querySelector('.hs-title');
      if (!h1) return;

      const raw = h1.innerHTML;
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

    function runTypewriter(slideIndex) {
      if (typeTimeout) { clearTimeout(typeTimeout); typeTimeout = null; }
      const slide = slides[slideIndex];
      if (!slide) return;
      const chars = slide.querySelectorAll('.hs-char');
      chars.forEach(c => { c.style.opacity = '0'; });
      chars.forEach((c, i) => {
        typeTimeout = setTimeout(() => {
          c.style.opacity = '1';
        }, i * TYPE_SPEED);
      });
    }

    function goTo(n) {
      current = ((n % TOTAL) + TOTAL) % TOTAL;
      track.style.transform = `translateX(-${current * (100 / 3)}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
      runTypewriter(current);
    }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(() => {
        if (!isHovered) goTo(current + 1);
      }, AUTO_DELAY);
    }

    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

    dots.forEach(d => {
      d.addEventListener('click', () => { goTo(+d.dataset.index); startAuto(); });
    });

    track.addEventListener('mouseenter', () => { isHovered = true; });
    track.addEventListener('mouseleave', () => { isHovered = false; });

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

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAuto(); else startAuto();
    });

    goTo(0);
    startAuto();
  })();

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

    let tx = 0;
    track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = tx - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) svcSlide(diff > 0 ? 1 : -1);
    }, { passive: true });

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

    setCardWidths();
    buildDots();
    goTo(0);
    resetAuto();
  })();

}); // END DOMContentLoaded