# Portfolio

Personal portfolio of Thái Lý An: computer-vision research and embedded systems.

Live site: https://lyan.is-a.dev/about/me/ (custom domain via [is-a.dev](https://is-a.dev); the old thailyyan-cloud.github.io/about/me/ links redirect here)

## Stack

- [Astro](https://astro.build) static site; a small inline script opens the projects dialog and drives the pointer glow
- Dark theme, plain CSS, self-hosted Inter (Latin + Vietnamese subsets only); projects open in a native `<dialog>`
- GitHub Actions deploys to GitHub Pages on every push to `main`

## Develop

```bash
npm install
npm run dev      # http://localhost:4321/about/me/
npm run build    # static output in dist/
```

## Adding hobbies, photos and projects

The "Outside the lab" corners live in plain Markdown files. Every push to `main` rebuilds the site.

| What | Where | URL |
|---|---|---|
| A corner (Cacti, Fish, Travel, Now, …) | `src/content/corners/<slug>.md` | `/about/me/<slug>/` |
| An item inside a corner | `src/content/entries/<slug>/<name>.md` | listed on that corner's page |

**Add a photo** (recommended way: it resizes the photo and strips GPS/EXIF before it reaches the public repo):

```bash
npm run photo -- cacti ~/Desktop/IMG_0412.jpg "Golden barrel" "A golden barrel cactus in a clay pot"
```

Optional cropping: `--aspect=4:3` crops to the card ratio while keeping the most salient region, and `--crop=L,T,W,H` cuts a pixel box first (for example to remove a stranger from a travel photo):

```bash
npm run photo -- travel ~/Desktop/sg.jpg "Marina Bay at night" --crop=0,300,3000,2000 --aspect=4:3
```

This creates `src/content/entries/cacti/<date>-golden-barrel.webp` and `.md`. Write a few lines in the `.md` if you like, then commit and push. iPhone `.heic` photos are converted automatically.

**Add an item without a photo:** create the `.md` by hand (see `src/content/entries/now/*.md`). Fields: `title` (required), `date`, `image`, `imageAlt`, `status`, `order`, `tags`.

**Add a new corner** (e.g. books): create `src/content/corners/books.md` with `title`, `tagline`, `icon` (`cactus` · `fish` · `travel` · `now` · `generic`) and `order`, then put items in `src/content/entries/books/`. Do not copy photos straight into the repo; use `npm run photo` so the location data is removed.

## Analytics (optional)

Visits are counted with [GoatCounter](https://www.goatcounter.com) (no cookies, no personal data). The script is only rendered when the repo has an Actions variable `GOATCOUNTER_CODE` set to a real site code:

```bash
gh variable set GOATCOUNTER_CODE --body "<your-site-code>" --repo thailyyan-cloud/about
```

Then re-run the deploy workflow. In GoatCounter, *User settings → Send email reports → Monthly* sends the report on the first day of each month.

## Structure

```text
src/
├── components/   Hero (intro + datasheet) · Life (photo tiles) · Contact · ProjectsDialog · CircuitBg · Glyph · Redirect
├── layouts/      Layout.astro (head, nav, footer)
├── content/      corners/*.md · entries/<corner>/*.md (hobbies, photos, "now")
├── pages/        about/me.astro (/about/me/) · about/me/cv.astro · about/me/[corner].astro · index + about/index + me/[...path] (redirects)
└── styles/       global.css (design tokens, shared styles)
.github/workflows/deploy.yml
```

All text is in the section components. `astro.config.mjs` sets `site` to the custom domain; the Pages custom domain itself is set in the repo settings (GitHub Actions deploys need no CNAME file).
