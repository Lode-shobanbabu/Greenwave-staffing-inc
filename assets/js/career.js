/* ============================================================
   careers.js — Save as assets/js/careers.js
   and link AFTER main.js in careers.html
   ============================================================ */

/* ── Filter & Search ─────────────────────────────────────── */
function filterJobs() {
  const query      = (document.getElementById('jobSearchInput').value || '').toLowerCase().trim();
  const dept       = (document.getElementById('filterDept').value || '').toLowerCase();
  const type       = (document.getElementById('filterType').value || '').toLowerCase();
  const location   = (document.getElementById('filterLocation').value || '').toLowerCase();

  const cards = document.querySelectorAll('#jobsGrid .job-card');
  let visible = 0;

  cards.forEach(card => {
    const cardDept     = (card.dataset.dept     || '').toLowerCase();
    const cardType     = (card.dataset.type     || '').toLowerCase();
    const cardLocation = (card.dataset.location || '').toLowerCase();
    const cardTags     = (card.dataset.tags     || '').toLowerCase();
    const cardTitle    = (card.querySelector('.job-title')?.textContent || '').toLowerCase();
    const cardDesc     = (card.querySelector('.job-desc')?.textContent  || '').toLowerCase();
    const searchHaystack = cardTitle + ' ' + cardDesc + ' ' + cardTags;

    const matchSearch   = !query || searchHaystack.includes(query);
    const matchDept     = !dept  || cardDept.includes(dept);
    const matchType     = !type  || cardType.includes(type);
    const matchLocation = !location || cardLocation.includes(location);

    const show = matchSearch && matchDept && matchType && matchLocation;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  // Update count
  const countEl = document.getElementById('jobCount');
  if (countEl) {
    countEl.innerHTML = `Showing <strong>${visible}</strong> open position${visible !== 1 ? 's' : ''}`;
  }

  // Show/hide no-results
  const noResults = document.getElementById('noResults');
  if (noResults) {
    noResults.style.display = visible === 0 ? 'block' : 'none';
  }
}

function resetFilters() {
  document.getElementById('jobSearchInput').value = '';
  document.getElementById('filterDept').value     = '';
  document.getElementById('filterType').value     = '';
  document.getElementById('filterLocation').value = '';
  filterJobs();
}

/* ── View Toggle (Grid / List) ───────────────────────────── */
function setView(mode) {
  const grid    = document.getElementById('jobsGrid');
  const gridBtn = document.getElementById('gridViewBtn');
  const listBtn = document.getElementById('listViewBtn');

  if (mode === 'list') {
    grid.classList.add('list-view');
    listBtn.classList.add('active');
    gridBtn.classList.remove('active');
  } else {
    grid.classList.remove('list-view');
    gridBtn.classList.add('active');
    listBtn.classList.remove('active');
  }

  // Persist preference
  try { localStorage.setItem('gw_jobsView', mode); } catch (_) {}
}

/* ── Apply Modal ─────────────────────────────────────────── */
function openApplyModal(jobTitle) {
  const overlay = document.getElementById('applyOverlay');
  const label   = document.getElementById('applyJobTitle');
  if (label) label.textContent = jobTitle || 'General Application';
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeApplyModal() {
  const overlay = document.getElementById('applyOverlay');
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function handleApplyOverlayClick(e) {
  if (e.target === document.getElementById('applyOverlay')) {
    closeApplyModal();
  }
}

/* ── File Upload Label ───────────────────────────────────── */
function handleFileUpload(input) {
  const label = document.getElementById('fileUploadLabel');
  if (!label) return;
  if (input.files && input.files[0]) {
    label.textContent = '✓ ' + input.files[0].name;
    label.style.color = 'var(--teal)';
    label.style.fontWeight = '600';
  }
}

/* ── Drag & Drop on file area ────────────────────────────── */
(function setupDragDrop() {
  document.addEventListener('DOMContentLoaded', function () {
    const area = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('resumeFile');
    if (!area || !fileInput) return;

    area.addEventListener('dragover', e => {
      e.preventDefault();
      area.style.borderColor = 'var(--teal)';
      area.style.background  = 'var(--teal-light)';
    });

    area.addEventListener('dragleave', () => {
      area.style.borderColor = '';
      area.style.background  = '';
    });

    area.addEventListener('drop', e => {
      e.preventDefault();
      area.style.borderColor = '';
      area.style.background  = '';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        fileInput.files = e.dataTransfer.files;
        handleFileUpload(fileInput);
      }
    });
  });
})();

/* ── Keyboard close (Escape) ─────────────────────────────── */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeApplyModal();
  }
});

/* ── Restore saved view preference ──────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  try {
    const savedView = localStorage.getItem('gw_jobsView');
    if (savedView === 'list') setView('list');
  } catch (_) {}
});

/* ── Scroll reveal for job cards ────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  const cards = document.querySelectorAll('.job-card');
  if (!cards.length) return;

  // Add fade-up class to each card with staggered delay
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = `opacity 0.5s ease ${(i % 6) * 0.08}s, transform 0.5s ease ${(i % 6) * 0.08}s`;
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => observer.observe(card));
});