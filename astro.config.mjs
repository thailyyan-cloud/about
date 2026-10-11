// @ts-check
import { defineConfig } from 'astro/config';

// Project page: https://thailyyan-cloud.github.io/portfolio/
export default defineConfig({
  site: 'https://thailyyan-cloud.github.io',
  base: '/portfolio',
  build: { inlineStylesheets: 'always' },
});
