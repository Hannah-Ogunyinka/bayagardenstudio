/**
 * Password gate for client galleries.
 *
 * Passwords are never stored: the GALLERY_PASSWORDS secret holds
 * SHA-256("slug:password") per gallery. A correct password earns a signed,
 * HttpOnly cookie scoped to that one gallery's path. The signature includes the
 * stored hash, so changing a gallery's password signs everyone out of it.
 */
import type { AstroCookies } from 'astro';
import { env, required } from './env';

const COOKIE_DAYS = 30;
const encoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');

export async function sha256(text: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(text)));
}

/** Constant-time comparison of two equal-length hex strings. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function storedHash(slug: string): string | undefined {
  try {
    const map = JSON.parse(env.GALLERY_PASSWORDS ?? '{}') as Record<string, string>;
    return map[slug];
  } catch {
    console.error('GALLERY_PASSWORDS is not valid JSON');
    return undefined;
  }
}

async function sign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(required('GALLERY_COOKIE_SECRET')),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

const cookieName = (slug: string) => `gallery_${slug.replace(/[^a-z0-9]/gi, '_')}`;
export const galleryPath = (slug: string) => `/gallery/${slug}/`;

export async function checkPassword(slug: string, password: string): Promise<boolean> {
  const expected = storedHash(slug);
  if (!expected || !password) return false;
  return safeEqual(await sha256(`${slug}:${password}`), expected);
}

export async function grantAccess(cookies: AstroCookies, slug: string): Promise<void> {
  const expires = Date.now() + COOKIE_DAYS * 86_400_000;
  const signature = await sign(`${slug}.${expires}.${storedHash(slug)}`);
  cookies.set(cookieName(slug), `${expires}.${signature}`, {
    path: galleryPath(slug),
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: COOKIE_DAYS * 86_400,
  });
}

export async function hasAccess(cookies: AstroCookies, slug: string): Promise<boolean> {
  const value = cookies.get(cookieName(slug))?.value;
  const hash = storedHash(slug);
  if (!value || !hash) return false;
  const [expires, signature] = value.split('.');
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(await sign(`${slug}.${expires}.${hash}`), signature);
}
