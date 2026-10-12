# Portfolio

Personal portfolio of Thái Lý An: computer-vision research and embedded systems.

Live site: https://thailyyan-cloud.github.io/about/me/

## Stack

- [Astro](https://astro.build) static site; about 20 lines of inline progressive-enhancement script (nav scroll-spy, pointer glow)
- Plain CSS with `prefers-color-scheme` light/dark, system font stack, blueprint-style design (no external requests)
- GitHub Actions deploys to GitHub Pages on every push to `main`

## Develop

```bash
npm install
npm run dev      # http://localhost:4321/about/me/
npm run build    # static output in dist/
```

## Analytics (optional)

Visits are counted with [GoatCounter](https://www.goatcounter.com) (no cookies, no personal data). The script is only rendered when the repo has an Actions variable `GOATCOUNTER_CODE` set to a real site code:

```bash
gh variable set GOATCOUNTER_CODE --body "<your-site-code>" --repo thailyyan-cloud/about
```

Then re-run the deploy workflow. In GoatCounter, *User settings → Send email reports → Monthly* sends the report on the first day of each month.

## Structure

```text
src/
├── components/   Hero · About · Projects · Experience · Contact
├── layouts/      Layout.astro (head, nav, footer)
├── pages/        me.astro (the site, /about/me/) · index.astro (redirects /about/ → /about/me/)
└── styles/       global.css (design tokens, shared styles)
.github/workflows/deploy.yml
```

All text is in the section components. `astro.config.mjs` sets `site` and `base` for the project-page URL; change both if the repo is renamed.
