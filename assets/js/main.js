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

    const slides = track.querySelectorAll('.hs-slide');
    const dots = document.querySelectorAll('.hs-dot');

    const prevBtn = document.getElementById('hsPrev');
    const nextBtn = document.getElementById('hsNext');

    const TOTAL = slides.length;

    const AUTO_MS = 7000;
    const LETTER_DELAY = 95;

    let current = 0;
    let auto = null;
    let isHovered = false;

    /* =========================================
       BUILD LETTERS
    ========================================= */

    slides.forEach(slide => {

      const title = slide.querySelector('.hs-title');
      if (!title) return;

      const originalHTML = title.innerHTML;

      let finalHTML = '';

      originalHTML.split('<br>').forEach(line => {

        let lineHTML = '';

        const temp = document.createElement('div');
        temp.innerHTML = line;

        function parse(node, teal = false) {

          // TEXT
          // TEXT
          if (node.nodeType === 3) {

            const words = node.textContent.split(' ');

            words.forEach((word, wi) => {

              if (wi > 0) {
                lineHTML += `<span class="hs-space">&nbsp;</span>`;
              }

              if (word.length > 0) {
                lineHTML += `<span class="hs-word">`;
                [...word].forEach(char => {
                  lineHTML += `<span class="${teal ? 'hs-char hs-char--teal' : 'hs-char'}">${char}</span>`;
                });
                lineHTML += `</span>`;
              }

            });

          }

          // SPAN
          else if (node.nodeName === 'SPAN') {

            node.childNodes.forEach(child => {
              parse(child, true);
            });

          }

          // OTHER ELEMENTS
          else {

            node.childNodes.forEach(child => {
              parse(child, teal);
            });

          }

        }

        temp.childNodes.forEach(node => parse(node));

        finalHTML += `
                    <div class="hs-line">
                        ${lineHTML}
                    </div>
                `;

      });

      title.innerHTML = finalHTML;

    });

    /* =========================================
       RESET LETTERS
    ========================================= */

    function resetLetters(index) {

      const chars = slides[index].querySelectorAll('.hs-char');

      chars.forEach(char => {

        char.classList.remove('show');

      });

    }

    /* =========================================
       ANIMATE LETTERS
    ========================================= */

    function animateLetters(index) {

      const chars = slides[index].querySelectorAll('.hs-char');

      chars.forEach((char, i) => {

        setTimeout(() => {

          char.classList.add('show');

        }, i * LETTER_DELAY);

      });

    }

    /* =========================================
       GO TO SLIDE
    ========================================= */

    function goTo(index) {

      slides.forEach((_, i) => {
        resetLetters(i);
      });

      current = (index + TOTAL) % TOTAL;

      track.style.transform = `translateX(-${current * 100}vw)`;

      dots.forEach((dot, i) => {

        dot.classList.toggle('active', i === current);

      });

      setTimeout(() => {

        animateLetters(current);

      }, 250);

    }

    /* =========================================
       AUTOPLAY
    ========================================= */

    function startAuto() {

      clearInterval(auto);

      auto = setInterval(() => {

        if (!isHovered) {

          goTo(current + 1);

        }

      }, AUTO_MS);

    }

    function stopAuto() {

      clearInterval(auto);

    }

    /* =========================================
       BUTTONS
    ========================================= */

    nextBtn?.addEventListener('click', () => {

      goTo(current + 1);
      startAuto();

    });

    prevBtn?.addEventListener('click', () => {

      goTo(current - 1);
      startAuto();

    });

    /* =========================================
       DOTS
    ========================================= */

    dots.forEach(dot => {

      dot.addEventListener('click', () => {

        goTo(Number(dot.dataset.index));
        startAuto();

      });

    });

    /* =========================================
       HOVER PAUSE
    ========================================= */

    track.addEventListener('mouseenter', () => {

      isHovered = true;

    });

    track.addEventListener('mouseleave', () => {

      isHovered = false;

    });

    /* =========================================
       TOUCH SWIPE
    ========================================= */

    let startX = 0;

    track.addEventListener('touchstart', e => {

      startX = e.touches[0].clientX;

    }, { passive: true });

    track.addEventListener('touchend', e => {

      const endX = e.changedTouches[0].clientX;

      const diff = startX - endX;

      if (Math.abs(diff) > 50) {

        if (diff > 0) {

          goTo(current + 1);

        } else {

          goTo(current - 1);

        }

        startAuto();

      }

    }, { passive: true });

    /* =========================================
       VISIBILITY
    ========================================= */

    document.addEventListener('visibilitychange', () => {

      if (document.hidden) {

        stopAuto();

      } else {

        startAuto();

      }

    });

    /* =========================================
       INIT
    ========================================= */

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



  // ── blogs hiding code  ──
  // BLOG TOGGLE
  window.toggleBlogs = function () {
    const extras = document.querySelectorAll('.blog-extra');
    const icon = document.getElementById('viewAllIcon');
    const label = document.getElementById('viewAllText');
    if (!extras.length) return;

    const isOpen = extras[0].style.display !== 'none';

    extras.forEach(card => {
      card.style.display = isOpen ? 'none' : 'block';
    });

    if (icon) icon.className = isOpen ? 'fas fa-newspaper' : 'fas fa-chevron-up';
    if (label) label.textContent = isOpen ? 'View All Blogs' : 'Show Less';
  };
}); // END DOMContentLoaded