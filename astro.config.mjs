// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

const SITE = 'https://bayagardenstudio.com';

/** URLs that exist but must stay out of search (noindex on the live site). */
const EXCLUDE_FROM_SITEMAP = ['/book-a-meeting/', '/gallery/'];

const font = (name, file, weight, style = 'normal') => ({
  weight,
  style,
  src: [`./src/assets/fonts/${name}-${file}.woff2`],
});

export default defineConfig({
  site: SITE,
  // Every live URL ends in a slash; keep them identical for SEO.
  trailingSlash: 'always',
  build: { format: 'directory' },

  // Pages are prerendered by default. Only forms and the gallery gate opt into on-demand rendering.
  adapter: cloudflare({
    // Optimise images at build time so there is no per-request Cloudflare Images cost.
    imageService: 'compile',
  }),

  integrations: [
    sitemap({
      filter: (page) => !EXCLUDE_FROM_SITEMAP.some((path) => new URL(page).pathname.startsWith(path)),
    }),
  ],

  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },

  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Poppins',
      cssVariable: '--font-poppins',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [
          font('Poppins', 'Light', 300),
          font('Poppins', 'LightItalic', 300, 'italic'),
          font('Poppins', 'Regular', 400),
          font('Poppins', 'Italic', 400, 'italic'),
          font('Poppins', 'SemiBold', 600),
          font('Poppins', 'Bold', 700),
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Montserrat',
      cssVariable: '--font-montserrat',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [
          font('Montserrat', 'Light', 300),
          font('Montserrat', 'Regular', 400),
          font('Montserrat', 'Medium', 500),
          font('Montserrat', 'SemiBold', 600),
        ],
      },
    },
  ],
});
