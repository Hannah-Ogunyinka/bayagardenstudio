/** Serves one gallery photo to visitors who unlocked that gallery. See src/lib/server/gallery-files.ts. */
import type { APIRoute } from 'astro';
import { serveGalleryFile } from '@lib/server/gallery-files';

export const prerender = false;

export const GET: APIRoute = (context) => serveGalleryFile(context, 'jpg');
