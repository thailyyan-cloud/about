import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One file per branch of "Outside the lab": src/content/corners/<slug>.md
// The slug becomes the URL: /about/me/<slug>/
const corners = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/corners' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(), // one line shown on the card on the main page
    icon: z.enum(['cactus', 'fish', 'travel', 'now', 'generic']).default('generic'),
    order: z.number().default(99),
  }),
});

// One file per item: src/content/entries/<corner-slug>/<name>.md
// The folder name decides which branch the item belongs to.
const entries = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/entries' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date().optional(), // newest first; items without a date go last
      order: z.number().optional(), // optional manual ordering, lower first
      image: image().optional(), // path relative to the .md file, e.g. ./my-cactus.webp
      imageAlt: z.string().optional(),
      status: z.string().optional(), // short label such as "in progress"
      tags: z.array(z.string()).default([]),
    }),
});

export const collections = { corners, entries };
