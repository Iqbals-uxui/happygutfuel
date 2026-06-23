# HappyGutFuel — Project Brief
**Last updated:** June 2026
**GitHub:** github.com/iqbals-uxui/happygutfuel
**Live URL:** https://happygutfuel.com

---

## 1. What This Site Is

HappyGutFuel is an affiliate content website in the gut health niche. The model:

1. Write honest, evidence-based product recommendation posts
2. Share them organically on Reddit in relevant subreddits
3. Readers click through to the site
4. Readers click affiliate links and purchase products
5. Site earns commission on qualifying purchases

**Editorial positioning:** Anti-hype. Evidence-based. No sponsored content. No fabricated social proof.

**Sister site:** wellnessisworthit.com — luxury beauty and wellness. Same owner, same stack, same model.

---

## 2. Owner & Technical Context

**Owner:** Iqbal Hussain (Dudley, West Midlands, UK)
**Existing business:** Methodiqal (web design agency) — methodiqal.co.uk
**Stack:** Plain HTML/CSS/JS. No frameworks, no build tools, no dependencies.
**Deployed via:** GitHub → Netlify (auto-deploys on every commit to main)
**Domain registered at:** 20i.com
**DNS:** A records pointing to Netlify IP 75.2.60.5

---

## 3. Deployment Workflow

1. Edit or create files in GitHub (github.com/iqbals-uxui/happygutfuel)
2. Commit to main branch
3. Netlify detects the commit and redeploys automatically (~30 seconds)
4. Changes are live at happygutfuel.com

No FTP. No manual uploads after initial setup. Every commit = automatic deploy.

---

## 4. File & Folder Structure

```
happygutfuel/
│
├── index.html                          ← Homepage
├── probiotics.html                     ← Probiotics category page
├── prebiotics.html                     ← Prebiotics category page
├── fermented-foods.html                ← Fermented Foods category page
├── gut-brain.html                      ← Gut-Brain category page
├── post-template.html                  ← BLANK TEMPLATE — copy this for new posts
├── CNAME                               ← Tells Netlify the custom domain
├── README.md                           ← This file
│
├── assets/
│   ├── css/
│   │   └── style.css                   ← ALL styles for every page — edit here only
│   └── js/
│       └── main.js                     ← ALL JavaScript for every page — edit here only
│
└── posts/
    ├── best-probiotics-for-gut-health.html
    ├── probiotics-for-bloating.html
    ├── prebiotic-fibre-worth-taking.html
    ├── fermented-foods-gut-health.html
    └── gut-brain-axis-supplements.html
```

**Critical rule:** All CSS lives in assets/css/style.css. All JS lives in assets/js/main.js.
Never write inline styles or inline scripts on individual pages.
Design or functionality changes only ever need to be made in one place.

**Path rule:**
- Root pages (index.html, probiotics.html etc) link to assets as: assets/css/style.css
- Pages in the posts/ folder link to assets as: ../assets/css/style.css

---

## 5. Design System

### Fonts
- Headings: Outfit (Google Fonts)
- Body: Plus Jakarta Sans (Google Fonts)
Both loaded via Google Fonts CDN in every page head.

### Colours (defined as CSS variables in assets/css/style.css)

--accent:       #2d6a4f    Deep forest green — primary CTAs, links, tags
--accent-hover: #1b4332    Darker green for hover states
--accent-light: #f0f7f4    Pale sage for backgrounds and tag fills
--bg:           #f8f6f2    Warm off-white page background
--bg-card:      #ffffff    White card backgrounds
--text:         #111926    Near-black body text
--text-muted:   #5c6470    Secondary/description text
--text-faint:   #9098a4    Timestamps, minor labels
--border:       #e6e2da    Subtle card and divider borders

To change the colour scheme: edit ONLY the :root block and [data-theme="dark"] block
at the top of assets/css/style.css. Every page updates automatically.

### Dark Mode
- Always defaults to light on first visit
- Never follows system dark mode preference
- Saves user toggle choice to localStorage as hgf-theme
- Managed entirely in assets/js/main.js

### Layout
- Max width: 1100px centred
- Post page grid: 1fr 300px (article left, sidebar right)
- Sidebar is always RIGHT. Article/products are always LEFT.
- Post grid on homepage: repeat(auto-fill, minmax(300px, 1fr))
- Collapses to single column below 900px

---

## 6. Page Types & Their Purpose

### index.html — Homepage
- Site hero with tagline and three stats (manually updated when content changes)
- Category filter pills
- Featured post card (most recent post)
- Post grid (remaining posts)
- Newsletter signup
- Footer

### Category pages (e.g. probiotics.html)
- Smaller hero with back link to homepage
- Post cards for that category only
- Newsletter section and footer
One category page per category. Each post belongs to one category.

### Post pages (posts/ folder)
- Back link to relevant category page
- Post hero: category tag, H1, author strip
- LEFT column (wide): intro, result count, product cards
- RIGHT column (narrow, sticky): search, category filter, newsletter
Products are ALWAYS left. Sidebar is ALWAYS right.

---

## 7. Categories & Posts

| Category | Category Page | Posts |
|---|---|---|
| Probiotics | probiotics.html | best-probiotics-for-gut-health.html, probiotics-for-bloating.html |
| Prebiotics | prebiotics.html | prebiotic-fibre-worth-taking.html |
| Fermented Foods | fermented-foods.html | fermented-foods-gut-health.html |
| Gut-Brain | gut-brain.html | gut-brain-axis-supplements.html |

Homepage stats — update manually when adding content:
- Posts published: 5
- Products reviewed: 15
- Sponsored posts: 0 (never changes)

---

## 8. How to Add a New Post

### Step 1 — Create the post file
1. Open post-template.html in GitHub and copy all of it
2. Go to Add file → Create new file
3. Name it posts/your-post-name.html
4. Paste and fill in every section marked [LIKE THIS]
5. Commit to main

### Step 2 — Update the category page
Open the relevant category page and add a post card for the new post.
If it is the newest post in that category, make it the featured card.

### Step 3 — Update the homepage
- Add a post card to the post grid in index.html
- If this is the newest post overall, make it the featured card
- Bump the stats numbers (Posts published, Products reviewed)

### Step 4 — If it is a brand new category
- Create a new category page (copy an existing one and update the content)
- Add the new nav link to every single HTML file in the repo
- Add the new filter pill to the homepage filter bar in index.html

---

## 9. Affiliate & Compliance Rules

- Disclosure banner must appear on every page — never remove it
- Every affiliate link must use: rel="noopener nofollow sponsored"
- Never say any product cures, treats, or prevents any condition
- Use language like: may support, has evidence suggesting, designed to help with
- No fabricated social proof or invented statistics
- Currency: always GBP (£) — never USD ($)
- Amazon Associates UK: affiliate-program.amazon.co.uk
  Apply only after at least one post has real verified content
  Requires 3 qualifying sales within 180 days to activate

---

## 10. Content Status

All 5 posts are currently PLACEHOLDER content.
Each has a yellow warning banner at the top.
Remove the placeholder-banner div once real content is in place.

---

## 11. What Still Needs Doing

- Replace placeholder content with real researched products and verified UK prices
- Add real Amazon Associates UK tracking links once approved
- Apply for Amazon Associates UK once real content is live
- Apply for Awin (Holland & Barrett, LookFantastic etc) once real content is live
- Set up Netlify Forms on newsletter so it actually collects emails
- Mobile hamburger menu (nav links currently hidden below 900px)
- noindex meta tag on placeholder posts until real content is in place
- Open Graph meta tags for Reddit and social sharing previews

---

## 12. JavaScript Architecture

All JS in assets/js/main.js — four sections:

Theme: defaults to light, dark only if user toggled, saved as hgf-theme in localStorage
Newsletter (handleSubscribe): UI only, does not collect emails yet
Homepage post filter (setPostCategory, filterPosts): guarded, only runs on homepage
Post page product filter (setCategory, filterProducts): guarded, only runs on post pages

JS convention: all code uses var and explicit for loops, no arrow functions, no forEach,
no const or let. This is intentional — easier to edit manually in GitHub.
