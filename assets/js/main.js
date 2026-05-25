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

            const allDots = document.querySelectorAll('.hs-dot');
            const prevBtn = document.getElementById('hsPrev');
            const nextBtn = document.getElementById('hsNext');
            const slides = track.querySelectorAll('.hs-slide');

            const TOTAL = 3;
            const AUTO_MS = 6000;
            const LETTER_MS = 110;   // ms between each letter landing
            const SLIDE_WAIT = 200;  // ms after slide transition starts

            let current = 0;
            let autoTimer = null;
            let dropTimers = [];
            let isHovered = false;

            /* ── STEP 1: Rebuild every h1 — wrap words in .hs-line divs,
                          each character in .hs-char spans ── */
            slides.forEach(slide => {
                const h1 = slide.querySelector('.hs-title');
                if (!h1) return;

                // Collect all tokens (char + isTeal flag, or br)
                const tokens = [];
                (function walk(node, teal) {
                    if (node.nodeType === 3) {
                        for (const ch of node.textContent) tokens.push({ ch, teal });
                    } else if (node.nodeName === 'BR') {
                        tokens.push({ br: true });
                    } else if (node.nodeName === 'SPAN') {
                        node.childNodes.forEach(c => walk(c, true));
                    } else {
                        node.childNodes.forEach(c => walk(c, teal));
                    }
                })(Object.assign(document.createElement('div'), { innerHTML: h1.innerHTML }), false);

                /*
                  Group tokens into LINES (split on spaces) and wrap each line
                  in a .hs-line div (overflow:hidden) so letters are clipped
                  above before they land — exactly like in the video.
                  Spaces between words become real space characters (not spans)
                  so wrapping is natural.
                */

                // Split into line groups by collecting words, then let CSS wrap
                // Actually: wrap ALL chars in spans but put them inside a single
                // .hs-line so the overflow:hidden clips mid-animation chars.
                // We use ONE .hs-line per natural line break (BR token).

                let lineTokens = [[]];
                tokens.forEach(t => {
                    if (t.br) {
                        lineTokens.push([]);
                    } else {
                        lineTokens[lineTokens.length - 1].push(t);
                    }
                });

                h1.innerHTML = lineTokens.map(line => {
                    const inner = line.map(t => {
                        if (t.ch === ' ') {
                            return '<span class="hs-space">&nbsp;</span>';
                        }
                        const cls = t.teal ? 'hs-char hs-char--teal' : 'hs-char';
                        return `<span class="${cls}">${t.ch}</span>`;
                    }).join('');
                    return `<div class="hs-line">${inner}</div>`;
                }).join('');
            });

            /* ── STEP 2: Reset letters — back to hidden-above state ── */
            function resetLetters(idx) {
                slides[idx]?.querySelectorAll('.hs-char').forEach(el => {
                    // Instant reset — no transition
                    el.style.transition = 'none';
                    // el.style.transform = 'translateY(-1.4em) rotate(-90deg) scale(0.5)';
                    el.style.transform = 'translateY(-220px) rotate(-90deg) scale(0.3)';
                    el.style.opacity = '0'; // clip does the masking, not opacity
                });
            }

            /* ── STEP 3: Animate letters dropping in ── */
            function dropLetters(idx) {
                dropTimers.forEach(clearTimeout);
                dropTimers = [];

                const chars = slides[idx]?.querySelectorAll('.hs-char');
                if (!chars) return;

                chars.forEach((el, i) => {

                    const t = setTimeout(() => {

                        el.style.opacity = '1';

                        el.style.transition =
                            'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease';

                        el.style.transform =
                            'translateY(0) rotate(0deg) scale(1)';

                    }, SLIDE_WAIT + i * LETTER_MS);

                    dropTimers.push(t);

                });
            }

            /* ── STEP 4: Go to slide ── */
            function goTo(n) {
                const next = ((n % TOTAL) + TOTAL) % TOTAL;

                // Pre-reset the incoming slide's letters so they start hidden
                resetLetters(next);

                current = next;
                track.style.transform = `translateX(-${current * (100 / TOTAL)}%)`;
                allDots.forEach((d, i) => d.classList.toggle('active', i === current));

                // Start drop animation
                dropLetters(current);
            }

            /* ── STEP 5: Autoplay ── */
            function startAuto() {
                stopAuto();
                autoTimer = setInterval(() => { if (!isHovered) goTo(current + 1); }, AUTO_MS);
            }
            function stopAuto() { clearInterval(autoTimer); autoTimer = null; }

            /* ── STEP 6: Controls ── */
            prevBtn?.addEventListener('click', () => { goTo(current - 1); startAuto(); });
            nextBtn?.addEventListener('click', () => { goTo(current + 1); startAuto(); });
            allDots.forEach(d => d.addEventListener('click', () => { goTo(+d.dataset.index); startAuto(); }));

            track.addEventListener('mouseenter', () => { isHovered = true; });
            track.addEventListener('mouseleave', () => { isHovered = false; });

            let tx = 0;
            track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; isHovered = true; }, { passive: true });
            track.addEventListener('touchend', e => {
                const diff = tx - e.changedTouches[0].clientX;
                isHovered = false;
                if (Math.abs(diff) > 50) { goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
            }, { passive: true });

            document.addEventListener('visibilitychange', () => document.hidden ? stopAuto() : startAuto());

            /* ── STEP 7: Init ── */
            slides.forEach((_, i) => resetLetters(i));
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
  // industries pagination section code
  /* INDUSTRIES PAGINATION */
  /* INDUSTRIES PAGINATION */
(function () {
  const cards = document.querySelectorAll('.ipc');
  const pagination = document.getElementById('pagination');
  if (!cards.length || !pagination) return;
  const cardsPerPage = 6;
  let currentPage = 1;
  function showPage(page) {
    currentPage = page;
    const start = (page - 1) * cardsPerPage;
    const end = start + cardsPerPage;
    cards.forEach((card, index) => {
      if (index >= start && index < end) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }

    });

    updateButtons();

    window.scrollTo({
      top: document.querySelector('.ipg-section').offsetTop - 100,
      behavior: 'smooth'
    });

  }
  function updateButtons() {
    pagination.innerHTML = '';
    const totalPages = Math.ceil(cards.length / cardsPerPage);
    // PREV BUTTON
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        showPage(currentPage - 1);
      }
    });
    pagination.appendChild(prevBtn);
    // PAGE NUMBER LOGIC
    const maxVisible = 3;
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    // FIRST PAGE
    if (startPage > 1) {
      const firstBtn = document.createElement('button');
      firstBtn.innerText = 1;
      firstBtn.addEventListener('click', () => {
        showPage(1);
      });
      pagination.appendChild(firstBtn);
      // DOTS
      if (startPage > 2) {

        const dots = document.createElement('span');
        dots.innerHTML = '...';
        dots.style.padding = '0 8px';

        pagination.appendChild(dots);

      }
    }

    // VISIBLE PAGE BUTTONS
    for (let i = startPage; i <= endPage; i++) {

      const btn = document.createElement('button');

      btn.innerText = i;

      if (i === currentPage) {
        btn.classList.add('active');
      }

      btn.addEventListener('click', () => {
        showPage(i);
      });

      pagination.appendChild(btn);

    }
    // LAST PAGE
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const dots = document.createElement('span');
        dots.innerHTML = '...';
        dots.style.padding = '0 8px';
        pagination.appendChild(dots);
      }
      const lastBtn = document.createElement('button');
      lastBtn.innerText = totalPages;
      lastBtn.addEventListener('click', () => {
        showPage(totalPages);
      });
      pagination.appendChild(lastBtn);
    }
    // NEXT BUTTON
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        showPage(currentPage + 1);
      }
    });
    pagination.appendChild(nextBtn);
  }
  showPage(1);
})();
}); // END DOMContentLoaded