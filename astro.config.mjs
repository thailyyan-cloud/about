// @ts-check
import { defineConfig } from 'astro/config';

// Project page: https://thailyyan-cloud.github.io/about/me/  (repo "about", page src/pages/me.astro)
export default defineConfig({
  site: 'https://thailyyan-cloud.github.io',
  base: '/about',
  build: { inlineStylesheets: 'always' },
});
