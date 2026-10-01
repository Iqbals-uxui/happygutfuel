/* ============================================================
   HappyGutFuel — homepage behaviour
   Save as: assets/js/home.js  (loaded AFTER main.js)

   Three things: the category filter, the signup form, the mobile
   nav. Plus a toggleTheme() fallback that only defines itself if
   main.js hasn't already, so the two can't collide.
   ============================================================ */

(function () {
  'use strict';

  var THEME_KEY = 'hgf-theme'; // must match the inline script in index.html

  /* ---------- theme (fallback only) ---------- */

  if (typeof window.toggleTheme !== 'function') {
    window.toggleTheme = function () {
      var root = document.documentElement;
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* private mode */ }
    };
  }

  /* ---------- mobile navigation ---------- */

  var navToggle = document.querySelector('.nav-toggle');
  var primaryNav = document.getElementById('primary-nav');

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      var open = primaryNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  /* ---------- article category filter ----------
     One delegated listener on the pill list rather than an inline
     onclick per button. Adding a category later means adding one
     <li> to the HTML and nothing here.
     --------------------------------------------- */

  var filterList = document.getElementById('post-filter');
  var emptyState = document.getElementById('no-posts');
  var statusEl = document.getElementById('filter-status');

  function applyFilter(category) {
    var cards = document.querySelectorAll('#post-listing [data-post-category]');
    var visible = 0;

    Array.prototype.forEach.call(cards, function (card) {
      var match = category === 'all' || card.dataset.postCategory === category;
      card.hidden = !match;
      if (match) { visible++; }
    });

    if (emptyState) { emptyState.hidden = visible > 0; }

    if (statusEl) {
      statusEl.textContent = visible === 1
        ? '1 guide shown'
        : visible + ' guides shown';
    }
  }

  if (filterList) {
    filterList.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-filter]');
      if (!button) { return; }

      Array.prototype.forEach.call(
        filterList.querySelectorAll('button'),
        function (b) {
          var isActive = b === button;
          b.classList.toggle('active', isActive);
          b.setAttribute('aria-pressed', String(isActive));
        }
      );

      applyFilter(button.dataset.filter);
    });
  }

  /* ---------- signup form ----------
     Front-end stub for now. Point FORM_ENDPOINT at your email
     provider's hosted form action (Mailerlite, Kit, Beehiiv and
     Buttondown all give you one) and flip SUBMIT_TO_ENDPOINT to
     true. data-signup-source is carried through so that when you
     add a second form later you can tell them apart.
     ---------------------------------- */

  var SUBMIT_TO_ENDPOINT = false;
  var FORM_ENDPOINT = ''; // e.g. 'https://assets.mailerlite.com/jsonp/XXXX/forms/YYYY/subscribe'

  window.handleSubscribe = function (event) {
    event.preventDefault();

    var form = event.target;
    var input = form.querySelector('input[type="email"]');
    var status = form.querySelector('.form-status');
    var source = form.dataset.signupSource || 'unknown';

    if (!input || !input.value) { return; }

    function say(message, state) {
      if (!status) { return; }
      status.textContent = message;
      status.setAttribute('data-state', state || 'ok');
    }

    if (!SUBMIT_TO_ENDPOINT || !FORM_ENDPOINT) {
      console.info('[signup stub]', { source: source, email: input.value });
      say('Thanks — you\u2019re on the list. Check your inbox shortly.');
      form.reset();
      return;
    }

    say('Sending\u2026');

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: input.value, source: source })
    })
      .then(function (response) {
        if (!response.ok) { throw new Error('Request failed'); }
        say('Thanks — you\u2019re on the list. Check your inbox shortly.');
        form.reset();
      })
      .catch(function () {
        say('That didn\u2019t go through. Try again, or email us directly.', 'error');
      });
  };

})();
