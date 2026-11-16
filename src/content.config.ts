/**
 * Typed content collections. A missing title, description or image alt
 * text fails the build instead of shipping a page with weak SEO.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

import { CATEGORIES } from './config/categories';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Meta description shown in search results. */
      description: z.string().min(50).max(170),
      /** Intro shown beside the title. */
      summary: z.string().optional(),
      published: z.coerce.date(),
      updated: z.coerce.date().optional(),
      categories: z.array(z.enum(CATEGORIES)).min(1),
      image: z.object({ src: image(), alt: z.string() }),
      focusKeyword: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().min(50).max(170),
      summary: z.string().optional(),
      published: z.coerce.date(),
      updated: z.coerce.date().optional(),
      image: z.object({ src: image(), alt: z.string() }).optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { posts, projects };

