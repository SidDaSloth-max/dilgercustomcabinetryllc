  (function () {
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    var icon = document.getElementById('navToggleIcon');
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      icon.setAttribute('href', open ? '#icon-close' : '#icon-menu');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        icon.setAttribute('href', '#icon-menu');
      });
    });

    var siteNav = document.querySelector('.site-nav');
    if (siteNav && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
      var revealProgress = 0;
      var lastY = window.scrollY;

      function applyReveal() {
        siteNav.style.transform = 'translateY(' + (-(1 - revealProgress) * 100) + '%)';
      }

      siteNav.style.transform = 'translateY(-100%)';

      window.addEventListener('scroll', function () {
        var y = window.scrollY;
        var delta = y - lastY;
        lastY = y;
        if (y <= 2) {
          revealProgress = 0;
        } else {
          var step = Math.min(Math.abs(delta) / 320, 1);
          revealProgress = delta > 0
            ? Math.min(1, revealProgress + step)
            : Math.max(0, revealProgress - step);
        }
        applyReveal();
      }, { passive: true });

      siteNav.addEventListener('focusin', function () {
        revealProgress = 1;
        applyReveal();
      });
    }

    var galleryTrack = document.getElementById('galleryTrack');
    if (galleryTrack) {
      var slides = Array.prototype.slice.call(galleryTrack.querySelectorAll('.gallery-slide'));
      var dotsWrap = document.getElementById('galleryDots');
      var prevBtn = document.querySelector('.gallery-prev');
      var nextBtn = document.querySelector('.gallery-next');
      var smooth = window.matchMedia('(prefers-reduced-motion: no-preference)').matches ? 'smooth' : 'auto';

      var dots = slides.map(function (slide, i) {
        var dot = document.createElement('button');
        dot.setAttribute('aria-label', 'Go to photo ' + (i + 1));
        dot.addEventListener('click', function () {
          slide.scrollIntoView({ behavior: smooth, inline: 'center', block: 'nearest' });
        });
        dotsWrap.appendChild(dot);
        return dot;
      });

      function setActive(index) {
        dots.forEach(function (d, i) { d.classList.toggle('is-active', i === index); });
      }

      function currentIndex() {
        var trackCenter = galleryTrack.scrollLeft + galleryTrack.clientWidth / 2;
        var closest = 0;
        var closestDist = Infinity;
        slides.forEach(function (slide, i) {
          var dist = Math.abs((slide.offsetLeft + slide.clientWidth / 2) - trackCenter);
          if (dist < closestDist) { closestDist = dist; closest = i; }
        });
        return closest;
      }

      function scrollByOne(dir) {
        var index = Math.min(slides.length - 1, Math.max(0, currentIndex() + dir));
        slides[index].scrollIntoView({ behavior: smooth, inline: 'center', block: 'nearest' });
      }

      prevBtn.addEventListener('click', function () { scrollByOne(-1); });
      nextBtn.addEventListener('click', function () { scrollByOne(1); });

      galleryTrack.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); scrollByOne(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); scrollByOne(1); }
      });

      var scrollTimer;
      galleryTrack.addEventListener('scroll', function () {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function () { setActive(currentIndex()); }, 80);
      }, { passive: true });

      setActive(0);
    }

    document.querySelectorAll('form[data-netlify]').forEach(function (form) {
      var status = form.querySelector('.form-status');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        if (status) status.textContent = 'Sending…';

        var projectType = form.elements.projectType ? form.elements.projectType.value : '';
        var gaEvent = form.getAttribute('data-ga-event');
        var gaLabel = form.getAttribute('data-ga-label') || form.getAttribute('name') || 'form';
        var successMessage = form.getAttribute('data-success-message') ||
          'Thanks — we’ve got your submission and will follow up soon.';
        var errorMessage = form.getAttribute('data-error-message') ||
          'Something went wrong sending that. Please call us instead at (425) 351-3818.';

        fetch(form.getAttribute('action') || '/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(form)).toString()
        })
          .then(function (res) {
            if (!res.ok) throw new Error('Bad response');
            if (status) status.textContent = successMessage;
            if (gaEvent && typeof gtag === 'function') {
              gtag('event', gaEvent, {
                event_category: 'engagement',
                event_label: gaLabel,
                project_type: projectType
              });
            }
            form.reset();
          })
          .catch(function () {
            if (status) status.textContent = errorMessage;
          })
          .finally(function () {
            if (submitBtn) submitBtn.disabled = false;
          });
      });
    });

    document.querySelectorAll('[data-call-label]').forEach(function (a) {
      a.addEventListener('click', function () {
        if (typeof gtag === 'function') {
          gtag('event', 'call_click', {
            event_category: 'engagement',
            event_label: a.getAttribute('data-call-label')
          });
        }
      });
    });

    if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches && 'IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        observer.observe(el);
      });
    } else {
      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        el.classList.add('is-visible');
      });
    }
  })();
