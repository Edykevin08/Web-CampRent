/* ============================================================
   CampRent — main.js
   Handles: navbar scroll, mobile menu, reveal animations,
            catalog filter, stat counters, smooth scroll
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── 1. Navbar Scroll Effect ── */
  var navbar = document.getElementById('navbar');

  function handleScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  /* ── 2. Mobile Hamburger Menu ── */
  var hamburger = document.getElementById('nav-hamburger');
  var mobileNav = document.getElementById('nav-mobile');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      var isOpen = mobileNav.classList.contains('open');
      if (isOpen) {
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      } else {
        mobileNav.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
      }
    });

    // Close menu when a link is clicked
    var mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── 3. Active Nav Link ── */
  var navLinks = document.querySelectorAll('.nav-links a, .nav-mobile a');
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── 4. Scroll Reveal ── */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show all
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ── 5. Catalog Filter ── */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var catalogCards = document.querySelectorAll('.catalog-card');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Update active state
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      var filter = btn.getAttribute('data-filter');

      catalogCards.forEach(function (card) {
        var category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ── 6. Smooth Scroll for Anchor Links ── */
  var anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = link.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var offset = 90;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ── 7. Step Hover Effect ── */
  var stepItems = document.querySelectorAll('.step-item');
  stepItems.forEach(function (item) {
    item.addEventListener('mouseenter', function () {
      item.classList.add('active');
    });
    item.addEventListener('mouseleave', function () {
      item.classList.remove('active');
    });
  });

});
