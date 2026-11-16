/** Server-side check of a Cloudflare Turnstile token. */
import { required } from './env';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(token: string | null, ip: string | null): Promise<boolean> {
  if (!token) return false;
  const body = new URLSearchParams({ secret: required('TURNSTILE_SECRET_KEY'), response: token });
  if (ip) body.set('remoteip', ip);
  try {
    const response = await fetch(VERIFY_URL, { method: 'POST', body });
    if (!response.ok) return false;
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch (error) {
    console.error('Turnstile: verification request failed', error);
    return false;
  }
}
