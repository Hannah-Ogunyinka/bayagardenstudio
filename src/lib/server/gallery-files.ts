/**
 * Serves one gallery photo or the zip download from R2, only to visitors
 * holding that gallery's access cookie. Responses are private so no shared
 * cache keeps a copy.
 */
import type { APIContext } from 'astro';
import { env } from './env';
import { hasAccess } from './gallery-auth';
import { getGallery } from '@lib/galleries';

/** Handles GET /gallery/<slug>/<name>.<ext> for the routes in src/pages/gallery/[slug]/. */
export async function serveGalleryFile({ params, cookies, request }: APIContext, ext: string): Promise<Response> {
  const gallery = getGallery(params.slug);
  const file = params.name ? `${params.name}.${ext}` : undefined;
  const isPhoto = gallery?.photos.some((p) => p.file === file);
  const isDownload = gallery?.download?.file === file;
  if (!gallery || !file || (!isPhoto && !isDownload)) return new Response('Not found', { status: 404 });
  if (!(await hasAccess(cookies, gallery.slug))) return new Response('Forbidden', { status: 403 });
  if (!env.GALLERY_BUCKET) return new Response('Gallery storage is not connected', { status: 503 });

  const object = await env.GALLERY_BUCKET.get(`${gallery.slug}/${file}`, {
    onlyIf: request.headers,
    range: request.headers,
  });
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'private, max-age=604800');
  headers.set('x-robots-tag', 'noindex');
  if (isDownload) headers.set('content-disposition', `attachment; filename="${file}"`);

  if (!('body' in object)) return new Response(null, { status: 304, headers });
  const range = object.range as { offset: number; length: number } | undefined;
  if (range && request.headers.has('range')) {
    headers.set('content-range', `bytes ${range.offset}-${range.offset + range.length - 1}/${object.size}`);
    return new Response(object.body, { status: 206, headers });
  }
  return new Response(object.body, { headers });
}
