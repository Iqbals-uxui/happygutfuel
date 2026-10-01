/* ============================================================
   HappyGutFuel — mobile nav, post filter, gut check
   Loaded AFTER main.js on every page.

   Theme and newsletter handling live in main.js. They used to be
   duplicated here, which meant two functions with the same name
   and whichever loaded last won.
   ============================================================ */

(function () {
  'use strict';

  /* ── MOBILE NAV ──────────────────────────────────────────── */

  var navToggle = document.querySelector('.nav-toggle');
  var primaryNav = document.getElementById('primary-nav');

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      var open = primaryNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }


  /* ── POST FILTER ──────────────────────────────────────────
     One delegated listener on the pill list. main.js still has the
     older setPostCategory() driven by inline onclick attributes;
     this markup uses data-filter, so only one of them ever fires.
     ──────────────────────────────────────────────────────── */

  var filterList = document.getElementById('post-filter');
  var emptyState = document.getElementById('no-posts');
  var filterStatus = document.getElementById('filter-status');

  function applyFilter(category) {
    var cards = document.querySelectorAll('#post-listing [data-post-category]');
    var visible = 0;

    Array.prototype.forEach.call(cards, function (card) {
      var match = category === 'all' ||
                  card.getAttribute('data-post-category') === category;
      card.hidden = !match;
      if (match) visible++;
    });

    if (emptyState) emptyState.hidden = visible > 0;
    if (filterStatus) {
      filterStatus.textContent = visible === 1 ? '1 guide shown'
                                               : visible + ' guides shown';
    }
  }

  if (filterList) {
    filterList.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-filter]');
      if (!button) return;

      Array.prototype.forEach.call(filterList.querySelectorAll('button'), function (b) {
        var isActive = b === button;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-pressed', String(isActive));
      });

      applyFilter(button.getAttribute('data-filter'));
    });
  }


  /* ── GUT CHECK ────────────────────────────────────────────
     Seven questions scored across five axes. No total, no numeric
     result shown to the user — the axes decide which of four
     profiles they land in. Everything runs in the browser; nothing
     is transmitted unless the visitor submits the email form.

     Deliberately not a score: a number out of ten implies a
     measurement that seven self-reported questions cannot support,
     and "I got 42, is that bad?" has no honest answer.
     ──────────────────────────────────────────────────────── */

  var intro  = document.getElementById('quiz-intro');
  var quiz   = document.getElementById('quiz-questions');
  var result = document.getElementById('quiz-result');

  if (intro && quiz && result) {

    var steps = Array.prototype.slice.call(quiz.querySelectorAll('.quiz-step'));
    var bar = document.getElementById('quiz-bar');
    var currentLabel = document.getElementById('quiz-current');
    var backBtn = document.getElementById('quiz-back');
    var total = steps.length;

    var index = 0;
    var answers = [];   // one {axis, score} per answered question

    var PROFILES = {
      fibre: {
        name: 'The fibre gap',
        summary: 'You are eating reasonably, but not getting anywhere near the ' +
                 '30g of fibre a day most UK adults fall short of. That is the ' +
                 'single biggest lever available to you, and it is a food ' +
                 'problem before it is a supplement problem.',
        actions: [
          'Add one high-fibre item to a meal you already eat — beans into a chilli, oats at breakfast — rather than rebuilding your diet.',
          'Switch one white grain to wholegrain. Bread is usually the easiest swap and the biggest single gain.',
          'Count distinct plants over a week rather than portions per day. Thirty different plants beats five portions of the same three.'
        ],
        guide: ['Prebiotic fibre: what to look for', 'prebiotics.html'],
        product: ['Fibre picks on the shop page', 'shop.html']
      },
      ferment: {
        name: 'No live cultures',
        summary: 'Your diet is reasonable on fibre but fermented foods are ' +
                 'missing entirely. They are not magic, but they are cheap, ' +
                 'they are food rather than a supplement, and they are the ' +
                 'easiest thing on this list to add.',
        actions: [
          'Start with kefir. A small glass daily is the lowest-effort option and it keeps for weeks.',
          'Check the label says "live" or "live cultures". Anything pasteurised after fermenting has none left.',
          'Build up slowly. Going from none to a lot in a week is how people decide fermented food disagrees with them.'
        ],
        guide: ['Fermented foods worth adding', 'fermented-foods.html'],
        product: ['What we recommend buying', 'shop.html']
      },
      supps: {
        name: 'Stacking before basics',
        summary: 'You are buying supplements while the food side is still ' +
                 'thin. That is the most expensive order to do this in. A ' +
                 'probiotic sitting on top of a low-fibre diet is doing less ' +
                 'than the same money spent on food would.',
        actions: [
          'Before buying anything else, get fibre up. Supplements work alongside a decent diet, not instead of one.',
          'Check what you are already taking. If the label says "proprietary blend" with no strain codes, you cannot verify any claim made for it.',
          'Pick one product and give it eight weeks before judging it. Stacking four at once tells you nothing about which did what.'
        ],
        guide: ['The probiotics worth taking', 'posts/best-probiotics-for-gut-health.html'],
        product: ['Compare our three picks', 'shop.html']
      },
      solid: {
        name: 'Mostly there',
        summary: 'The basics are covered — fibre, variety and fermented food ' +
                 'are all present. At this point the gains are small and ' +
                 'specific rather than transformational, and anyone promising ' +
                 'you otherwise is selling something.',
        actions: [
          'Push plant variety rather than volume. Different fibres feed different bacteria.',
          'If you take a supplement, check it names its strains with codes. If it does not, you are paying for an unverifiable claim.',
          'Protect sleep and movement. Both affect digestion more than most people expect and neither costs anything.'
        ],
        guide: ['The gut-brain connection', 'gut-brain.html'],
        product: ['Everything we recommend', 'shop.html']
      }
    };

    function show(i) {
      steps.forEach(function (s, n) { s.hidden = n !== i; });
      if (bar) bar.style.width = ((i / total) * 100) + '%';
      if (currentLabel) currentLabel.textContent = String(i + 1);
      if (backBtn) backBtn.hidden = i === 0;
      var legend = steps[i] && steps[i].querySelector('legend');
      if (legend) legend.setAttribute('tabindex', '-1'), legend.focus();
    }

    function axisTotal(axis) {
      return answers.reduce(function (sum, a) {
        return a.axis === axis ? sum + a.score : sum;
      }, 0);
    }

    function decide() {
      var fibre = axisTotal('fibre');        // 0-6 across three questions
      var ferment = axisTotal('ferment');    // 0-2
      var supps = axisTotal('supps');        // 0 or 2
      var habits = axisTotal('habits');      // 0-2

      // Order matters: the most consequential gap wins. Someone buying
      // supplements on a poor diet gets told that before anything else.
      if (supps >= 2 && fibre <= 2) return PROFILES.supps;
      if (fibre <= 3) return PROFILES.fibre;
      if (ferment === 0) return PROFILES.ferment;
      if (fibre >= 4 && ferment >= 1 && habits >= 1) return PROFILES.solid;
      return PROFILES.fibre;
    }

    function finish() {
      var p = decide();

      document.getElementById('result-name').textContent = p.name;
      document.getElementById('result-summary').textContent = p.summary;

      var list = document.getElementById('result-actions');
      list.innerHTML = '';
      p.actions.forEach(function (text) {
        var li = document.createElement('li');
        li.textContent = text;
        list.appendChild(li);
      });

      var guide = document.getElementById('result-guide');
      guide.textContent = p.guide[0];
      guide.href = p.guide[1];

      var product = document.getElementById('result-product');
      product.textContent = p.product[0];
      product.href = p.product[1];

      var field = document.getElementById('quiz-profile-field');
      if (field) field.value = p.name;

      quiz.hidden = true;
      result.hidden = false;
      result.querySelector('h2').setAttribute('tabindex', '-1');
      result.querySelector('h2').focus();
    }

    quiz.addEventListener('click', function (event) {
      var btn = event.target.closest('button[data-axis]');
      if (!btn) return;

      answers[index] = {
        axis: btn.getAttribute('data-axis'),
        score: parseInt(btn.getAttribute('data-score'), 10) || 0
      };

      index++;
      if (index >= total) { finish(); return; }
      show(index);
    });

    if (backBtn) {
      backBtn.addEventListener('click', function () {
        if (index === 0) return;
        index--;
        answers.length = index;
        show(index);
      });
    }

    var startBtn = document.getElementById('quiz-start');
    if (startBtn) {
      startBtn.addEventListener('click', function () {
        intro.hidden = true;
        quiz.hidden = false;
        index = 0;
        answers = [];
        show(0);
      });
    }

    var restartBtn = document.getElementById('quiz-restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', function () {
        result.hidden = true;
        intro.hidden = false;
        index = 0;
        answers = [];
      });
    }
  }

})();
