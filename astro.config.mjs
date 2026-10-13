// @ts-check
import { defineConfig } from 'astro/config';

// Live at https://lyan.is-a.dev/about/me/ (custom domain on the "about" repo's GitHub Pages).
// Pages live under src/pages/about/; / and /about/ redirect to /about/me/,
// and /me/* catches old thailyyan-cloud.github.io/about/me/* links (GitHub maps /about/x -> /x).
export default defineConfig({
  site: 'https://lyan.is-a.dev',
  build: { inlineStylesheets: 'always' },
});
