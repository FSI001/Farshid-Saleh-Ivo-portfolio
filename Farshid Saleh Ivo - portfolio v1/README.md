# Farshid Saleh Ivo — portfolio

A small static portfolio, hand-written in HTML, CSS and JavaScript. No build step,
no framework, no dependencies to install. Netlify serves the folder as-is and runs
one Function for the live YouTube subscriber counts.

## Deploying to Netlify

1. Drag this folder into Netlify (or connect the Git repository).
2. Build command: leave empty. Publish directory: `.`
3. In **Site configuration → Environment variables**, add `YOUTUBE_API_KEY`
   (a YouTube Data API v3 key). If a key already exists under another name —
   `YOUTUBE_KEY`, `YT_API_KEY`, `YOUTUBE_DATA_API_KEY`, `YOUTUBE_API` or
   `API_KEY` — the function picks it up, so nothing has to be renamed. Without
   a key the subscriber numbers simply stay hidden; everything else keeps
   working.
4. Deploy. `netlify.toml` already sets up the Functions folder, redirects,
   cache headers and a Content Security Policy.

### Checking the subscriber counts after a deploy

Open <https://farshidsalehivo.netlify.app/.netlify/functions/subscribers>. The
function answers with channel IDs and numbers:

```json
{"counts":{"UCwjhIjcKGbFv_1wh8PyUExQ":1010,"UCsgjaqe0hiWxc_VsA4uqF2Q":88},"updatedAt":"..."}
```

`{"error":"Subscriber counts are not configured"}` means no API key was found —
add the environment variable and redeploy. The page hides the numbers instead
of showing an error, so the site never looks broken.

The contact form posts to Formspree (`mlgvylbv`). To use a different form,
change the `action` on the `<form>` in `contactme.html`.

### Replacing an existing repo

Upload the files together, in one commit: `index.html`, `app.js` and
`netlify/functions/subscribers.js` talk to each other and a half-replaced site
will not show the counts. GitHub's web uploader never deletes anything, so also
remove the files this version no longer uses (`img1.png`, the old product image)
if they are still in the repo — they would otherwise stay online.

### If the domain changes

`farshidsalehivo.netlify.app` appears in the canonical tags, Open Graph tags,
`sitemap.xml`, `robots.txt` and the JSON-LD block on the homepage. Search and
replace it in those files, and add the new domain under Netlify → Domain
management. `images/og-cover.jpg` also has the URL printed on it.

## Files

| Path | What it is |
|---|---|
| `index.html` | Home: hero, about, skills, reviews, channels |
| `equipment.html` | Camera gear and the affiliate disclaimer |
| `contactme.html` | Contact form plus Fiverr/YouTube links |
| `404.html` | Netlify's not-found page |
| `nubaid.png` | Memorial notice image (PNG fallback) |
| `style.css` | The whole design system, one file |
| `app.js` | Menu, footer year, subscriber counts, memorial notice, form submit |
| `netlify/functions/subscribers.js` | Server-side YouTube API call |
| `netlify.toml` | Hosting config (headers, redirects, caching) |
| `images/` | WebP versions of the photos and the social share card |

## Editing

- **Keep scripts in `app.js` and styles in `style.css`.** `netlify.toml` sets a
  strict Content Security Policy, so inline `<script>` or `onclick` attributes
  will be blocked. The one exception is the JSON-LD block in `index.html`.
- **Add a product** to the equipment page: copy the `<article class="product-card">`
  block and change the image, text and link. Remove `product-card--feature` when
  there is more than one card so they sit in a grid.
- **Add a review** to the homepage: copy one `<figure class="review">` block
  inside `.reviews`, then change the initial, username, country, star count,
  quote and gig name. Update the "Rated 5 out of 5 stars" text if the rating
  is not five.
- **Memorial notice**: opens on the homepage once a week. The photo lives at
  `images/nubaid-900.webp` with `nubaid.png` as the fallback; the close button,
  Escape and a click outside all dismiss it. Someone who has already dismissed
  it can see it again by clearing the `popupLastShown` key in the browser's
  local storage.
- **Icons**: the yellow tile with an F, drawn from `favicon.svg`. The PNG and
  `.ico` sizes are exports of that shape — if the mark changes, redraw the SVG
  and export 16, 32, 48, 180 (iOS), 192 and 512 px from it.
- **Photos**: keep them around 800 px and export as WebP. The current portrait is
  900 px / 100 KB instead of the original 900 px / 830 KB.
- **Social share image**: replace `images/og-cover.jpg` (1200 × 630).
- **Colours and fonts**: the top of `style.css` holds all the design tokens.

## Preview locally

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>. The subscriber counts stay hidden here because
Netlify Functions only run on Netlify; use `netlify dev` if you want to test them.

Opening `index.html` straight from the folder also works for looking at the
layout. Asset paths are relative so the photos and the icon resolve, but the
contact form and the subscriber counts need a real server (or Netlify) to talk
to anything.
