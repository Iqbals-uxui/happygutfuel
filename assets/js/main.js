/* ============================================================
   HappyGutFuel — Shared JavaScript
   Covers: theme toggle, newsletter, product filter (post pages),
           post category filter (homepage)
   ============================================================ */


// ── THEME ─────────────────────────────────────────────────────
// Always defaults to light. Only use dark if user has previously
// toggled it manually — never follows system dark mode preference.
(function () {
  var saved = localStorage.getItem('hgf-theme');
  var theme = (saved === 'dark') ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  updateIcon();
})();

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme');
  var next = (current === 'dark') ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('hgf-theme', next);
  updateIcon();
}

function updateIcon() {
  var icon = document.getElementById('themeIcon');
  if (!icon) return;
  var isLight = document.documentElement.getAttribute('data-theme') === 'light';
  if (isLight) {
    icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  } else {
    icon.innerHTML = [
      '<circle cx="12" cy="12" r="5"/>',
      '<line x1="12" y1="1" x2="12" y2="3"/>',
      '<line x1="12" y1="21" x2="12" y2="23"/>',
      '<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>',
      '<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>',
      '<line x1="1" y1="12" x2="3" y2="12"/>',
      '<line x1="21" y1="12" x2="23" y2="12"/>',
      '<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>',
      '<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
    ].join('');
  }
}


// ── NEWSLETTER ────────────────────────────────────────────────
// Posts to Kit (formerly ConvertKit). One implementation for every
// form on the site, with two UI patterns detected from the markup:
//   • Sidebar / widget forms swap the button label.
//   • Homepage, shop and gut-check forms have a .form-status line.
//
// Kit expects the email field to be named `email_address`, not
// `email`. Custom fields go as fields[name] and only persist if a
// matching custom field exists in Kit (Grow → Subscribers → Custom
// fields). Create `source` and `profile` there to capture them;
// without those, signups still work and the extras are dropped.
//
// Transport: fetch first, because it gives a real success/failure.
// If that is blocked by CORS the request falls back to a form POST
// into a hidden iframe, which browsers always allow cross-origin.
// The fallback cannot read the response, so it reports optimistically
// — a bad address simply never gets a confirmation email.

var FORM_ENDPOINT = 'https://app.kit.com/forms/10042101/subscriptions';

function handleSubscribe(e) {
  e.preventDefault();

  var form    = e.target;
  var btn     = form.querySelector('button');
  var input   = form.querySelector('input[type="email"]') || form.querySelector('input');
  var status  = form.querySelector('.form-status');
  var profile = form.querySelector('input[name="profile"]');
  var source  = form.getAttribute('data-signup-source') || 'unknown';

  if (!btn || !input || !input.value) return;

  var originalLabel = btn.textContent;

  function report(message, isError) {
    if (status) {
      status.textContent = message;
      status.setAttribute('data-state', isError ? 'error' : 'ok');
      btn.disabled = false;
      if (!isError) form.reset();
      return;
    }
    if (isError) {
      btn.textContent = originalLabel;
      btn.disabled = false;
      input.disabled = false;
      return;
    }
    btn.textContent = "\u2713 Check your email";
    btn.style.background = 'var(--accent-hover)';
    input.disabled = true;
    btn.disabled = true;
  }

  var DONE = "Thanks \u2014 check your email to confirm, and the guide is on its way.";

  if (!FORM_ENDPOINT) {
    console.info('[signup stub]', input.value, source);
    report(DONE, false);
    return;
  }

  var data = new FormData();
  data.append('email_address', input.value);
  data.append('fields[source]', source);
  if (profile && profile.value) data.append('fields[profile]', profile.value);

  if (status) status.textContent = 'Sending\u2026';
  btn.disabled = true;

  // Fallback: a real form POST aimed at a hidden iframe. Not subject
  // to CORS, so it works wherever fetch is refused.
  function postViaIframe() {
    var name = 'hgf-signup-' + Date.now();

    var frame = document.createElement('iframe');
    frame.name = name;
    frame.style.display = 'none';
    document.body.appendChild(frame);

    var proxy = document.createElement('form');
    proxy.action = FORM_ENDPOINT;
    proxy.method = 'post';
    proxy.target = name;
    proxy.style.display = 'none';

    data.forEach(function (value, key) {
      var field = document.createElement('input');
      field.type = 'hidden';
      field.name = key;
      field.value = value;
      proxy.appendChild(field);
    });

    document.body.appendChild(proxy);
    proxy.submit();

    // Can't read a cross-origin iframe, so assume it landed and tidy up.
    report(DONE, false);
    setTimeout(function () {
      proxy.remove();
      frame.remove();
    }, 8000);
  }

  fetch(FORM_ENDPOINT, { method: 'POST', body: data })
    .then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      report(DONE, false);
    })
    .catch(function () {
      // Almost always CORS rather than a genuine failure, so retry
      // by the route that can't be blocked before reporting an error.
      try {
        postViaIframe();
      } catch (err) {
        report("That didn't go through. Try again, or email us directly.", true);
      }
    });
}


// ── HOMEPAGE: POST CATEGORY FILTER ────────────────────────────
// Filters post cards on the homepage by category.
// Guarded — only runs when homepage filter elements are present.

var currentPostCategory = 'all';

function setPostCategory(cat, btn) {
  if (!document.getElementById('post-listing')) return;

  currentPostCategory = cat;

  var buttons = document.querySelectorAll('.homepage-filter-pills button');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove('active');
  }
  btn.classList.add('active');

  filterPosts();
}

function filterPosts() {
  if (!document.getElementById('post-listing')) return;

  var featuredCard = document.querySelector('.post-card-featured');
  var gridCards    = document.querySelectorAll('.post-grid .post-card');
  var visible      = 0;

  // Filter featured card
  if (featuredCard) {
    var featCat = featuredCard.getAttribute('data-post-category') || '';
    if (currentPostCategory === 'all' || featCat === currentPostCategory) {
      featuredCard.style.display = '';
      visible++;
    } else {
      featuredCard.style.display = 'none';
    }
  }

  // Filter grid cards
  for (var i = 0; i < gridCards.length; i++) {
    var card    = gridCards[i];
    var cardCat = card.getAttribute('data-post-category') || '';
    if (currentPostCategory === 'all' || cardCat === currentPostCategory) {
      card.style.display = '';
      visible++;
    } else {
      card.style.display = 'none';
    }
  }

  // Hide post grid if no grid cards visible
  var postGrid = document.getElementById('post-grid');
  if (postGrid) {
    var visibleGrid = 0;
    for (var j = 0; j < gridCards.length; j++) {
      if (gridCards[j].style.display !== 'none') visibleGrid++;
    }
    postGrid.style.display = visibleGrid === 0 ? 'none' : '';
  }

  // Show / hide empty state
  var noPosts = document.getElementById('no-posts');
  if (noPosts) {
    noPosts.style.display = visible === 0 ? 'block' : 'none';
  }

  // Update post count label
  var countEl = document.getElementById('post-count');
  if (countEl) {
    var catLabel = currentPostCategory === 'all'
      ? 'all categories'
      : currentPostCategory.replace(/-/g, ' ');
    countEl.textContent = visible + ' post' + (visible !== 1 ? 's' : '') + ' in ' + catLabel;
  }
}


// ── POST PAGES: PRODUCT FILTER ────────────────────────────────
// Filters product cards within an individual post page.
// Guarded — only runs when post page elements are present.

var currentCategory = 'all';

function setCategory(cat, btn) {
  if (!document.getElementById('recommendations')) return;

  currentCategory = cat;

  var buttons = document.querySelectorAll('.category-pills button');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove('active');
  }
  btn.classList.add('active');

  filterProducts();

  // Smooth scroll to result count, offset for sticky header
  var target = document.getElementById('result-count');
  var header = document.querySelector('header');
  if (target && header) {
    var headerHeight = header.offsetHeight;
    var targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  }
}

function filterProducts() {
  var searchBar       = document.getElementById('search-bar');
  var recommendations = document.getElementById('recommendations');
  if (!searchBar || !recommendations) return;

  var query    = searchBar.value.toLowerCase().trim();
  var products = document.querySelectorAll('.product-node');
  var visible  = 0;

  for (var i = 0; i < products.length; i++) {
    var p       = products[i];
    var cat     = p.getAttribute('data-category') || '';
    var title   = p.getAttribute('data-title')    || '';
    var descEl  = p.querySelector('.product-desc');
    var brandEl = p.querySelector('.product-brand');
    var desc    = descEl  ? descEl.textContent.toLowerCase()  : '';
    var brand   = brandEl ? brandEl.textContent.toLowerCase() : '';

    var matchesCat   = (currentCategory === 'all' || cat === currentCategory);
    var matchesQuery = (
      !query ||
      title.indexOf(query)  > -1 ||
      desc.indexOf(query)   > -1 ||
      brand.indexOf(query)  > -1 ||
      cat.indexOf(query)    > -1
    );

    if (matchesCat && matchesQuery) {
      p.classList.remove('hidden');
      visible++;
    } else {
      p.classList.add('hidden');
    }
  }

  // Show / hide empty state
  var noResults = document.getElementById('no-results');
  if (noResults) {
    noResults.style.display = (visible === 0) ? 'block' : 'none';
  }

  // Update live result count label
  var countEl = document.getElementById('result-count');
  if (countEl) {
    var catLabel   = (currentCategory === 'all') ? 'all categories' : currentCategory;
    var queryLabel = query ? ('matching "' + query + '"') : ('in ' + catLabel);
    countEl.innerHTML = '<strong>' + visible + ' item' + (visible !== 1 ? 's' : '') + '</strong> ' + queryLabel;
  }
}
