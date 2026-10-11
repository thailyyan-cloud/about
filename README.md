# Portfolio

Personal portfolio of Thái Lý An: computer-vision research and embedded systems.

Live site: https://thailyyan-cloud.github.io/portfolio/

## Stack

- [Astro](https://astro.build) static site, zero client-side JavaScript
- Plain CSS with `prefers-color-scheme` light/dark, system font stack (no external requests)
- GitHub Actions deploys to GitHub Pages on every push to `main`

## Develop

```bash
npm install
npm run dev      # http://localhost:4321/portfolio/
npm run build    # static output in dist/
```

## Structure

```text
src/
├── components/   Hero · About · Projects · Experience · Contact
├── layouts/      Layout.astro (head, nav, footer)
├── pages/        index.astro (single page)
└── styles/       global.css (design tokens, shared styles)
.github/workflows/deploy.yml
```

All text is in the section components. `astro.config.mjs` sets `site` and `base` for the project-page URL; change both if the repo is renamed.
